import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { TemplateFormComponent } from '../template-form/template-form.component';
import { RequestService } from '@appDir/shared/services/request.service';
import { TemplateMasterUrlEnum } from '../../template-master-url.enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { Page } from '@appDir/front-desk/models/page';
import { ParamQuery, OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { checkReactiveFormIsEmpty, getIdsFromArray, isObjectEmpty, makeDeepCopyArray, unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';
import { isEmptyObject } from '@appDir/shared/utils/utils.helpers';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { ToastrService } from 'ngx-toastr';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';

@Component({
  selector: 'app-template-listing',
  templateUrl: './template-listing.component.html',
  styleUrls: ['./template-listing.component.scss']
})
export class TemplateListingComponent implements OnInit,OnDestroy {
  fieldFilterForm: FormGroup
  fields: any[] = []
  page: Page = new Page();
  subscription: Subscription[] = [];
  loadSpin = false;
  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal, 
    private requestService: RequestService,
    private location: Location, 
    private router: Router,
    private _route: ActivatedRoute,
    public datePipeService:DatePipeFormatService,
    private toastrService: ToastrService,
    protected storageData: StorageData,
		private localStorage: LocalStorage
  ) 
  {
   this.page = new Page();
   this.page.pageNumber = 0;
   this.page.size = 10;
  }
  DATEFORMAT = '_/__/____';

  @ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('fieldsList') fieldsListTable: DatatableComponent;
	customizedColumnComp: CustomizeColumnComponent;
	@ViewChild(CustomizeColumnComponent) set con(con: CustomizeColumnComponent) {
		if (con) { // initially setter gets called with undefined
			this.customizedColumnComp = con;
		}
	}
	modalCols :any[] = [];
	cols: any[] = [];
	alphabeticColumns:any[] =[];
  colSelected: boolean = true;
  isAllFalse: boolean = false;
  requiredFiledsListingTable: any;


  ngOnInit() {
    this.fieldFilterForm = this.fb.group({
      title: '',
      description: '',
      created_by_ids:'',
      updated_by_ids:'',
      created_at: [
       				null,
        			[
        					Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
        					Validators.maxLength(10),
        				],
        			],
        			updated_at: [
        				null,
        				[
        					Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
        					Validators.maxLength(10),
        				],
        			],
    })
    // this.page.size = 10;
    // this.page.pageNumber = 1;
	this.subscription.push(
		this._route.queryParams.subscribe((params) => {
			
			this.page.size = parseInt(params.per_page) || 10;
			this.page.pageNumber = parseInt(params.page) || 1;
		}),
	);
    this.setPage({ offset: this.page.pageNumber - 1 || 0 });
    this.requiredFiledsListingTable = this.localStorage.getObject('requiredFieldsTemplateTableList' + this.storageData.getUserId());
  }
  ngAfterViewInit() {
    if (this.fieldsListTable?._internalColumns) {
			this.cols = makeDeepCopyArray([...this.fieldsListTable._internalColumns]);
			this.cols.forEach(element => {
				if(this.requiredFiledsListingTable?.length) {
					let obj = this.requiredFiledsListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.requiredFiledsListingTable?.length) {
				const nameToIndexMap = {};
				this.requiredFiledsListingTable.forEach((item, index) => {
					nameToIndexMap[item?.header] = index;
				});
				this.cols.sort((a, b) => nameToIndexMap[a?.name] - nameToIndexMap[b?.name]);
			}
			let cols = makeDeepCopyArray(this.cols);
			this.alphabeticColumns = cols.sort(function (a, b) {
				if (a.name < b.name) { return -1; }
				if (a.name > b.name) { return 1; }
				return 0;
			});
			this.onConfirm(false);
		}
	}
  ngOnDestroy()
  {
	unSubAllPrevious(this.subscription);
  }
  addField() {
    this.modalService.open(TemplateFormComponent)
  }

  queryParams: ParamQuery
  setPage(pageInfo) {
    let pageNum;
    // this.selection.clear();
    pageNum = pageInfo.offset;
    this.page.pageNumber = pageInfo.offset;
    const pageNumber = this.page.pageNumber + 1;
    let filters = checkReactiveFormIsEmpty(this.fieldFilterForm);
    this.queryParams = {
      filter: !isObjectEmpty(filters),
      order: OrderEnum.ASC,
      per_page: this.page.size,
      page: pageNumber,
      pagination: true,
    };
    let per_page = this.page.size;
    let queryparam = { per_page, page: pageNumber }

    this.addUrlQueryParams({ ...filters, ...queryparam });
    this.getFields({ ...this.queryParams, ...filters });

  }
  pageLimit($num) {
    this.page.size = Number($num);
    this.setPage({ offset: 0 });
  }
  addUrlQueryParams(params?) {
    this.location.replaceState(
      this.router.createUrlTree([], { queryParams: params, }).toString()
    );
  }
  getFields(params) {
	this.loadSpin = true;
    this.requestService.sendRequest(TemplateMasterUrlEnum.getRequiredFieldsList, 'get', REQUEST_SERVERS.fd_api_url, params).subscribe(data => {
	this.loadSpin = false;
    this.fields = data['result'].data
    this.page.totalElements = data['result'].total
    },(error) => {
		this.loadSpin = false;
	})
  }
  checkInputs() {
    if (isEmptyObject(this.fieldFilterForm.value)) {
      return true;
      }
      return false;
  }

  controlsHistoryStats(row) {
    const ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false,
      windowClass: 'modal_extraDOc body-scroll history-modal',
      modalDialogClass: 'modal-lg'
    };
    let modelRef = this.modalService.open(CreatedHistoryComponent,ngbModalOptions);
    modelRef.componentInstance.createdInformation = [row];
  }
  openCustomoizeColumn(CustomizeColumnModal) {
    const ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false,
      windowClass: 'modal-lg-package-generate',
    };
    this.modalCols = [];
		let self = this;
		this.cols.forEach(element => {
			let obj = self.alphabeticColumns.find(x => x?.name === element?.name);
			if(obj) {
				this.modalCols.push({ header: element?.name, checked: obj?.checked });
			}
		});
		this.CustomizeColumnModal.show();
  }
  
  onConfirm(click) {
    if (this.isAllFalse && !this.colSelected){
			this.toastrService.error('At Least 1 Column is Required.','Error');
			return false;
		}
    if(click) {
			this.customizedColumnComp;
			this.modalCols = makeDeepCopyArray(this.customizedColumnComp?.modalCols)
			let data: any = [];
			this.modalCols.forEach(element => {
				if(element?.checked) {
					data.push(element);
				}
				let obj = this.alphabeticColumns.find(x => x?.name === element?.header);
				if (obj) {
					if (obj.name == element.header) {
						obj.checked = element.checked;
					}
				}
			});
			this.localStorage.setObject('requiredFieldsTemplateTableList' + this.storageData.getUserId(), data);
		}
    let groupByHeaderCol = getIdsFromArray(this.modalCols, 'header'); // pick header
    this.cols.sort(function (a, b) {
      return groupByHeaderCol.indexOf(a.name) - groupByHeaderCol.indexOf(b.name);
    });
    //set checked and unchecked on the base modal columns in alphabeticals columns
    this.alphabeticColumns.forEach(element => {
    let currentColumnIndex = findIndexInData(this.cols, 'name', element.name)
      if (currentColumnIndex != -1) {
        this.cols[currentColumnIndex]['checked'] = element.checked;
        this.cols = [...this.cols];
      }
    });
    // show only those columns which is checked
    let columnsBody = makeDeepCopyArray(this.cols);
    this.fieldsListTable._internalColumns = columnsBody.filter(c => {
      return c.checked == true;
    });
    let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
    this.fieldsListTable._internalColumns.sort(function (a, b) {
      return groupByHeader.indexOf(a.name) - groupByHeader.indexOf(b.name);
    });
    window.dispatchEvent(new Event('resize'));
    this.CustomizeColumnModal.hide();
  }

  onCancel() {
		this.CustomizeColumnModal.hide();
	}

	onSelectHeaders(isChecked) {
		this.colSelected = isChecked;
		if(!isChecked) {
			this.isAllFalse = true;
		}
	}

	onSingleSelection(isChecked) {
		this.isAllFalse = isChecked;
		if(isChecked) {
			this.colSelected = false;
		}
	}

}
