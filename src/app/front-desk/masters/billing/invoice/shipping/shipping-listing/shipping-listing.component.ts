import { HttpSuccessResponse } from './../../../../../../shared/modules/ngx-datatable-custom/models/http-responses.model';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Page } from '@appDir/front-desk/models/page';
import { OrderEnum, ParamQuery } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { SelectionModel } from '@angular/cdk/collections';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RequestService } from '@appDir/shared/services/request.service';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';
import { checkReactiveFormIsEmpty, getIdsFromArray, isEmptyObject, isObjectEmpty, makeDeepCopyArray } from '@appDir/shared/utils/utils.helpers';
import { ShippingDetail } from '../shipping-detail.model';
import { ShippingUrlsEnum } from '../shipping-urls-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
@Component({
  selector: 'app-shipping-listing',
  templateUrl: './shipping-listing.component.html',
  styleUrls: ['./shipping-listing.component.scss']
})
export class ShippingListingComponent extends PermissionComponent implements OnInit, AfterViewInit {
  selection = new SelectionModel<Element>(true, []);
  isCollapsed = false;
  modalRef: NgbModalRef;
  hasId = false;
  page: Page;
  totalRows: number;
  shippingdetail:ShippingDetail;
  queryParams: ParamQuery;
  showTable: Boolean = false;
  shippings: any[] = [];
  public loadSpin: boolean = false;
  public searchForm: FormGroup;
  @ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('shippingList') shippingListTable: DatatableComponent;
	customizedColumnComp: CustomizeColumnComponent;
	@ViewChild(CustomizeColumnComponent) set con(con: CustomizeColumnComponent) {
		if (con) { // initially setter gets called with undefined
		  this.customizedColumnComp = con;
		}
	}
	modalCols :any[] = [];
	columns: any[] = [];
	alphabeticColumns:any[] =[];
	colSelected: boolean = true;
	isAllFalse: boolean = false;
	shippingListtingTable: any;


  constructor(
    private fb: FormBuilder,
    public aclService: AclService,
    private modalService: NgbModal,
    private rou:Router,
    protected requestService: RequestService,
    public route: ActivatedRoute,
    private customDiallogService : CustomDiallogService,
    public commonService: DatePipeFormatService,
    private location: Location,
    private toastrService: ToastrService,
    private storageData: StorageData,
		private localStorage: LocalStorage
    )  
    { super(aclService,rou);
      this.page = new Page();
      this.page.pageNumber = 0;
      this.page.size = 10;
    }


  ngOnInit() {
    this.searchForm = this.fb.group({
      shipping_detail : [''],
      unit_price : [''],
      comment : ['']
    });
    this.subscription.push(
      this.route.queryParams.subscribe((params) => {
        this.searchForm.patchValue(params);
        this.page.size = parseInt(params.per_page) || 10;
        this.page.pageNumber = parseInt(params.page) || 1;
        this.page.size = parseInt(params.per_page) || 10;
      }),
    );
    this.setPage({ offset: this.page.pageNumber - 1 || 0 });
    this.shippingListtingTable = this.localStorage.getObject('shippingTableList' + this.storageData.getUserId());
  }

  ngAfterViewInit() {
		if (this.shippingListTable?._internalColumns) {
			this.columns = makeDeepCopyArray([...this.shippingListTable._internalColumns]);
			this.columns.forEach(element => {
				if(this.shippingListtingTable.length) {
					let obj = this.shippingListtingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.shippingListtingTable.length) {
				const nameToIndexMap = {};
				this.shippingListtingTable.forEach((item, index) => {
					nameToIndexMap[item?.header] = index;
				});
				this.columns.sort((a, b) => nameToIndexMap[a?.name] - nameToIndexMap[b?.name]);
			}
			let columns = makeDeepCopyArray(this.columns);
			this.alphabeticColumns = columns.sort(function (a, b) {
				if (a.name < b.name) { return -1; }
				if (a.name > b.name) { return 1; }
				return 0;
			});
			this.onConfirm(false);
		}
	}

    setPage(pageInfo){
      let pageNum;
      this.selection.clear();
      pageNum = pageInfo.offset;
      this.page.pageNumber = pageInfo.offset;
      const pageNumber = this.page.pageNumber + 1;
      let filters = checkReactiveFormIsEmpty(this.searchForm);
      this.queryParams = {
      filter: !isObjectEmpty(filters),
      order: OrderEnum.ASC,
      per_page: this.page.size,
      page: pageNumber,
      pagination: true,
    };
    let per_page = this.page.size;
    let queryparam = { per_page, page: pageNumber }
    this.addUrlQueryParams(({...filters,...queryparam}))
    this.getShippingList({...this.queryParams,...filters})
    }

    addUrlQueryParams(params?) {
      this.location.replaceState(
        this.router.createUrlTree([], { queryParams: params, }).toString()
      );
    }

    onResetFilters() {
      this.searchForm.reset();
      this.setPage({ offset: 0 });
    }

    checkInputs(){
      if (isEmptyObject(this.searchForm.value)) {
        return true;
        }
        return false;
    }

    pageLimit($num) {
      this.page.size = Number($num);
      this.setPage({ offset: 0 });
    }

    masterToggle(event) {
      this.isAllSelected()
        ? this.selection.clear()
        : this.shippings.slice(0, this.totalRows).forEach((row) => this.selection.select(row));
    }
  
    isAllSelected() {
      this.totalRows = this.shippings.length;
      const numSelected = this.selection.selected.length;
      const numRows = this.totalRows;
      return numSelected === numRows;
    }

    getShippingList(queryParams){
      // let encodeParams = encodeURI(queryParams)
      this.loadSpin = true;
      this.subscription.push(
        this.requestService.sendRequest(
          ShippingUrlsEnum.Shipping_List_Get,
          'POST',
          REQUEST_SERVERS.fd_api_url,
          queryParams,
          false,true
        ).subscribe((data:HttpSuccessResponse)=>{
          if(data.status){
            this.loadSpin = false;
            this.shippings = data['result'] && data['result'].data ? data['result'].data : [];
            this.page.totalElements = data['result'] && data['result'].total ? data['result'].total : 0;
            
          }
        },(err) =>{
          this.loadSpin = false;
        })
      )
    }

    onDeleteShipping(id?){
      const temp = [id];
      const selected = this.selection.selected;
      const ids = selected.map((row)=> row.id);
      this.customDiallogService.confirm('Delete Confirmation?',`Are you sure you want to delete?`,'Yes','No')
      .then((confirmed) => {
        
        if (confirmed){
          this.requestService.sendRequest(ShippingUrlsEnum.Shipping_List_Delete,'DELETE',REQUEST_SERVERS.fd_api_url,{id:ids}).subscribe(
            (res)=>{
              this.selection.clear();
              this.setPage({ offset:this.page.pageNumber});
              this.shippings = this.removeMultipleFromArr(this.shippings,ids,'id');
              this.shippings = this.shippings;
              this.toastrService.success('Successfull Deleted','Success');
            }
          )
        }
      })
      .catch();
    }

    addUpdateShipping(content,row){
      if(row == null){
        this.hasId = false;
        this.shippingdetail = null;
      }
      else{
        this.hasId = true;
        this.shippingdetail = row;
      }
      const ngbModalOptions: NgbModalOptions = {
        backdrop: 'static',
        keyboard: false,
        windowClass: 'modal_extraDOc shipping-modal',
        size:'sm'
      };
      this.modalService.open(content,ngbModalOptions)
    }

    formSubmited(event){
      this.modalService.dismissAll();
		this.setPage({ offset: this.page.pageNumber - 1 || 0 });
    }

    private removeMultipleFromArr<T>(data: T[], toBeDeleted: Array<T>, key): T[] {
      return data.filter(
        (row) => row[`${key}`] !== toBeDeleted.find((element) => row[`${key}`] === element),
      );
    }

  unsubscribeSubscriptions(){
    this.subscription.forEach(sub =>{
      sub.unsubscribe()
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeSubscriptions()
  }

  shippingHistoryStats(row) {
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
		this.columns.forEach(element => {
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
			this.localStorage.setObject('shippingTableList' + this.storageData.getUserId(), data);
		}
		let groupByHeaderCol = getIdsFromArray(this.modalCols, 'header'); // pick header
		this.columns.sort(function (a, b) {
			return groupByHeaderCol.indexOf(a.name) - groupByHeaderCol.indexOf(b.name);
		});
		//set checked and unchecked on the base modal columns in alphabeticals columns
		this.alphabeticColumns.forEach(element => {
		let currentColumnIndex = findIndexInData(this.columns, 'name', element.name)
			if (currentColumnIndex != -1) {
				this.columns[currentColumnIndex]['checked'] = element.checked;
				this.columns = [...this.columns];
			}
		});
		// show only those columns which is checked
		let columnsBody = makeDeepCopyArray(this.columns);
		this.shippingListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.shippingListTable._internalColumns.sort(function (a, b) {
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
