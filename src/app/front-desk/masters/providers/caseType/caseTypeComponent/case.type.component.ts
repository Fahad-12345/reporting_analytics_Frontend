import { DatePipeFormatService } from './../../../../../shared/services/datePipe-format.service';

import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { NgbModalRef, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Page } from '@appDir/front-desk/models/page';
import { Subject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { AclService } from '@appDir/shared/services/acl.service';
import { HttpService } from '@appDir/front-desk/fd_shared/services/http.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { OrderEnum, ParamQuery } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { parseHttpErrorResponseObject, unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { Location, LocationStrategy } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { CaseTypeUrlsEnum } from '../case.type.enum';
import { checkReactiveFormIsEmpty, getIdsFromArray, isEmptyObject, isObjectEmpty, makeDeepCopyArray, whitespaceFormValidation } from '@appDir/shared/utils/utils.helpers';
import { environment } from 'environments/environment';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
@Component({
  selector: 'app-casetype',
  templateUrl: './case.type.component.html',
  styleUrls: ['./case.type.component.scss']
})
export class CaseTypeComponent extends PermissionComponent implements OnInit, OnDestroy {
  subscription: Subscription[] = [];
  loadSpin: boolean = false;
  isCollapsed = false;
  caseTypeTotalRows: number;
  caseTypeData: any[] = [];
  caseTypePage: Page;
  queryParamscaseType: ParamQuery;
  planTypeSelection = new SelectionModel<Element>(true, []);

  delMultiple: number;
  modalRef: NgbModalRef;
  refresh: Subject<any> = new Subject();
  searchCaseType: FormGroup;
  searchedRequestData: any[] = [];

  caseTypeForm: FormGroup;
  title: string;
  buttonTitle: string;
  environment= environment;
  @ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('caseTypeList') caseTypeListTable: DatatableComponent;
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
  caseTypeListingTable: any;

  constructor(
    private fdService: FDServices,
    aclService: AclService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private http: HttpService,
    router: Router,
    private toaster: ToastrService,
    protected requestService: RequestService,
    private _route: ActivatedRoute,
    private location: Location, private locationStratgy: LocationStrategy,
    titleService: Title,
	  public datePipeService: DatePipeFormatService,
    private CanDeactivateModelComponentService: CanDeactivateModelComponentService,
    private storageData: StorageData,
		private localStorage: LocalStorage
    ) {
    super(aclService, router, _route, requestService, titleService);
    this.caseTypePage = new Page();
    this.caseTypePage.pageNumber = 0;
    this.caseTypePage.size = 10;

  }

  ngOnInit() {
    this.setTitle();
    // this.titleService.setTitle(this._route.snapshot.data['title']);
    this.searchCaseType = this.initializeCaseTypeForm();
    this.subscription.push(
      this._route.queryParams.subscribe((params) => {
        this.searchCaseType.patchValue(params);
        this.caseTypePage.size = parseInt(params.per_page) || 10
        this.caseTypePage.pageNumber = parseInt(params.page) || 1
      }),
    );
    this.caseTypeSetPage({ offset: this.caseTypePage.pageNumber - 1 || 0 });
    this.caseTypeForm = this.fb.group({
      id: [''],
      name: ['', [Validators.required,whitespaceFormValidation()]],
      remainder_days: [''],
      description: [''],
      comments: [''],
    });
    this.caseTypeListingTable = this.localStorage.getObject('caseTypeMasterTableList' + this.storageData.getUserId());
  }
  ngAfterViewInit() {
    if (this.caseTypeListTable?._internalColumns) {
			this.columns = makeDeepCopyArray([...this.caseTypeListTable._internalColumns]);
			this.columns.forEach(element => {
				if(this.caseTypeListingTable.length) {
					let obj = this.caseTypeListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.caseTypeListingTable.length) {
				const nameToIndexMap = {};
				this.caseTypeListingTable.forEach((item, index) => {
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
  /**
   * conformation popup to reset casetype model 
   **/
  resetModel() {
    if (this.caseTypeForm.dirty && this.caseTypeForm.touched) {
      this.CanDeactivateModelComponentService.canDeactivate().then(res => {
        if (res) {
          this.resetData();
        }
        else {
          return true;
        }
      });
    }
    else {
      this.resetData();
    }
  }
  /**
   * reset model
   **/
  resetData() {
    this.addUrlQueryParams();
    this.caseTypeForm.reset();
    this.modalRef.close();
  }
  /**
   * to set task manager
   */
  caseTypestringfy(obj) {
    return JSON.stringify(obj);
  }
  /**
   * set search form
   */
  initializeCaseTypeForm() {
    return this.fb.group({
      name: [''],
      remainder_days: [''],
      description: [''],
      comments: [''],
    });
  }
  /**
   * Reset casetype Search form
   */
  caseTypeReset() {
    this.addUrlQueryParams();
    this.searchCaseType.reset();
    this.caseTypeSetPage({ offset: 0 });
    this.clearCaseTypeSelection();
  }
  /**set table action checkbox */
  isCaseTypeSelected() {
    this.caseTypeTotalRows = this.caseTypeData.length;
    const numSelected = this.planTypeSelection.selected.length;
    const numRows = this.caseTypeTotalRows;
    return numSelected === numRows;
  }
  /**set table action checkbox */
  masterCaseTypeToggle() {
    this.isCaseTypeSelected()
      ? this.planTypeSelection.clear()
      : this.caseTypeData
        .slice(0, this.caseTypeTotalRows)
        .forEach((row) => this.planTypeSelection.select(row));
  }
  /**
   * open model to add/edit
   * @param caseTypeModel 
   * @param row 
   * @param rowIndex 
   */
  casetypeOpenModel(caseTypeModel, row?, rowIndex?) {
    this.title = 'Add'
    this.buttonTitle = 'Save & Continue';
    const ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false,
      windowClass: 'modal_extraDOc',
    };
    if (row) {
      this.title = 'Edit';
      this.buttonTitle = 'Update';
      this.caseTypeForm.patchValue({
        id: row.id,
        name: this.caseTypeData[rowIndex].name,
        comments: this.caseTypeData[rowIndex].comments,
        remainder_days: this.caseTypeData[rowIndex].remainder_days,
        description: this.caseTypeData[rowIndex].description,
      });
    }
    this.modalRef = this.modalService.open(caseTypeModel, ngbModalOptions);
  }
  /**
   * submiting casetype form to add/update
   * @param form 
   */
  onCaseTypeSubmit(form) {
    if (this.title == 'Add') {
      this.addCaseTypeSubmit(form);
    }
    else {
      this.updateCaseTypeSubmit(form);
    }
  }
  /**
   * add Case Type
   * @param form 
   */
  addCaseTypeSubmit(form) {
    this.loadSpin = true;
    if (this.caseTypeForm.valid) {
      this.subscription.push(
        this.requestService
          .sendRequest(
            CaseTypeUrlsEnum.CaseType_list_POST,
            'POST',
            REQUEST_SERVERS.fd_api_url,
            form,
          )
          .subscribe(
            (data: any) => {
              if (data.status) {
                this.isCaseTypeSelected();
                this.caseTypeReset();
                this.caseTypeSetPage({ offset: 0 });
                this.toaster.success('Successfully added', 'Success');
				this.loadSpin = false;
                this.resetData();
                this.caseTypeForm.reset();
                this.modalRef.close();
              }
            },
            (err) => {
              this.loadSpin = false;
              const str = parseHttpErrorResponseObject(err.error.message);
              // this.toaster.error(str);
            },
          ),
      );
    //   this.loadSpin = false;
    }
  }
  /**
   * update Case Type
   * @param form 
   */
  updateCaseTypeSubmit(form) {
    this.loadSpin = true;
    this.subscription.push(
      this.requestService
        .sendRequest(
          CaseTypeUrlsEnum.CaseType_list_PUT,
          'PUT',
          REQUEST_SERVERS.fd_api_url,
          form,
        )
        .subscribe(
          (data: any) => {
            if (data.status === 200 || data.status) {
              this.loadSpin = false;
              this.isCaseTypeSelected();
              /* Note: no need for this function here  'caseTypeReset()' */
              // this.caseTypeReset();
              this.toaster.success('Successfully updated', 'Success');
			        this.caseTypeSetPage({ offset:  this.caseTypePage.pageNumber?  this.caseTypePage.pageNumber : 0 });
              this.resetData();
              this.modalRef.close();
            }
          },
          (err) => {
            this.loadSpin = false;
            const str = parseHttpErrorResponseObject(err.error.message);
            // this.toaster.error(str);
          },
        ),
    );
    // this.loadSpin = false;
 
  }
  caseTypePageLimit($num) {
    this.caseTypePage.size = Number($num);
    this.caseTypeSetPage({ offset: 0 });
  }
  /**set casetype page and param properties */
  caseTypeSetPage(pageInfo) {
    let pageNum;
    this.clearCaseTypeSelection();
    pageNum = pageInfo.offset;
    this.caseTypePage.pageNumber = pageInfo.offset;
    const caseTypePagePageNumber = this.caseTypePage.pageNumber + 1;
    let filters = checkReactiveFormIsEmpty(this.searchCaseType);
    this.queryParamscaseType = {
      filter: !isObjectEmpty(filters),
      order: OrderEnum.ASC,
      per_page: this.caseTypePage.size,
      page: caseTypePagePageNumber,
      pagination: true,
    };
    // if (this.searchCaseType.valid) {
    let per_page = this.caseTypePage.size;
    let queryParams = { per_page, page: caseTypePagePageNumber };
    this.addUrlQueryParams({ ...filters, ...queryParams });
    // }
    this.getCaseTypeListing({ ...this.queryParamscaseType, ...filters });
  }
  /**set Query Params */
  addUrlQueryParams(params?) {
    this.location.replaceState(
      this.router.createUrlTree([], { queryParams: params, }).toString()
    );
  }
  /**
   * get case type listing
   * @param queryParamscaseType 
   */
  getCaseTypeListing(queryParamscaseType) {
    this.loadSpin = true;
    // for plan type
    this.subscription.push(
      this.requestService
        .sendRequest(
          CaseTypeUrlsEnum.CaseType_list_GET,
          'GET',
          REQUEST_SERVERS.fd_api_url,
          queryParamscaseType,
        )
        .subscribe(
          (data: any) => {
            this.caseTypeData = data && data.result ? data.result.data : [];
            this.caseTypePage.totalElements = data && data.result.total ? data.result.total : 0;
            this.loadSpin = false;
          },
          (err) => {
            // const str = parseHttpErrorResponseObject(err.error.message);
            // this.toaster.error(str);
          },
        ),
    );
  }
  isDisabledCaseType() {
	  if(this.loadSpin || this.caseTypeForm.invalid) {
		  return true;
	  } else {
		return false;
	  }
  }
  clearCaseTypeSelection() {
    this.planTypeSelection.clear();
  }
  ngOnDestroy() {
    unSubAllPrevious(this.subscription);
  }

  checkInputs(){
	if (isEmptyObject(this.searchCaseType.value)) {
		return true;
	  }
	  return false;
   }

   caseHistoryStats(row) {
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
			this.toaster.error('At Least 1 Column is Required.','Error');
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
			this.localStorage.setObject('caseTypeMasterTableList' + this.storageData.getUserId(), data);
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
		this.caseTypeListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.caseTypeListTable._internalColumns.sort(function (a, b) {
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

