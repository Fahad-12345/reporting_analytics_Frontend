import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModalRef, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Page } from '@appDir/front-desk/models/page';
import { ToastrService } from 'ngx-toastr';
import { AclService } from '@appDir/shared/services/acl.service';
import { Subscription } from 'rxjs';
import {
  unSubAllPrevious,
  parseHttpErrorResponseObject,
} from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { ParamQuery, OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { Location } from '@angular/common';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { BillingEmploymentTypeUrlsEnum } from '../BillingEmploymentType-Urls-Enum';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { checkReactiveFormIsEmpty, getIdsFromArray, isEmptyObject, isObjectEmpty, makeDeepCopyArray, touchAllFields } from '@appDir/shared/utils/utils.helpers';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
@Component({
  selector: 'app-billing-employment-type',
  templateUrl: './billing-employment-type.component.html',
  styleUrls: ['./billing-employment-type.component.scss']
})
export class BillingEmploymentTypeComponent extends PermissionComponent implements OnInit, OnDestroy {

	isCollapsed:boolean = false;
  constructor(
    private fb: FormBuilder,
    private modalservice: NgbModal,
    private location: Location,
    router: Router,
    aclService: AclService,
    protected requestService: RequestService,
    titleService: Title,
    private _route: ActivatedRoute,
    private CanDeactivateModelComponentService: CanDeactivateModelComponentService,
    private toastrService: ToastrService,
    protected storageData: StorageData,
		private localStorage: LocalStorage,
    private modalService: NgbModal,
    ) {
    super(aclService, router, _route, requestService, titleService);
    this.page = new Page();
    this.page.pageNumber = 0;
    this.page.size = 10;
  }
  subscription: Subscription[] = [];
  employmentTypeSearchForm: FormGroup;
  employmentTypeForm: FormGroup;
  modalref: NgbModalRef
  modelTitle: string = 'Add'
  modelSubmit: string = 'Save';
  disableBtn: boolean = false;
  page: Page;
  queryparam: ParamQuery;
  employmentTypeListing: any[] = [];
  totalrows: number;
  selection = new SelectionModel<Element>(true, []);
  loadSpin: boolean = false;

  @ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('billingEmpTypeList') billingEmpTypeListTable: DatatableComponent;
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
  billingEmpTypeListingTable: any;


  ngOnInit() {
    // this.titleService.setTitle(this._route.snapshot.data['title']);
    this.setTitle();
    this.employmentTypeSearchForm = this.initializeSearhForm();
    this.employmentTypeForm = this.initializeForm();
    this.subscription.push(
      this._route.queryParams.subscribe((params) => {
        this.employmentTypeSearchForm.patchValue(params);
        this.page.pageNumber = parseInt(params.page) || 1;
        this.page.size = parseInt(params.per_page) || 10;
      }),
    );
    this.setpage({ offset: this.page.pageNumber - 1 || 0 });
    this.billingEmpTypeListingTable = this.localStorage.getObject('billingEmpTypeBillingTableList' + this.storageData.getUserId());
  }
  ngAfterViewInit() {
    if (this.billingEmpTypeListTable?._internalColumns) {
			this.cols = makeDeepCopyArray([...this.billingEmpTypeListTable._internalColumns]);
			this.cols.forEach(element => {
				if(this.billingEmpTypeListingTable?.length) {
					let obj = this.billingEmpTypeListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.billingEmpTypeListingTable?.length) {
				const nameToIndexMap = {};
				this.billingEmpTypeListingTable.forEach((item, index) => {
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
  /**
   * initialize search form
   */
  initializeSearhForm(): FormGroup {
    return this.fb.group({
      name: [''],
      description:['']
    })
  }
  /**
   * initialize form to add/edit
   */
  initializeForm(): FormGroup {
    return this.fb.group({
      id: [''],
      name: ['', Validators.required],
      description: ['']
    })
  }
  /**
   * reset filter form
   */
  resetFilter() {
    this.employmentTypeSearchForm.reset();
    this.selection.clear();
    this.setpage({ offset: 0 });
  }
  /**
   * open modal and set values
   * @param billingemploymenttypemodal 
   * @param row 
   * @param rowIndex 
   */
  openModal(billingemploymenttypemodal, row?: any, rowIndex?: number) {
    const NgbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false,
      windowClass: 'modal_extraDOc'
    };
    if (row == undefined || row == null) {
      this.patchAddValues();
    } else {
      this.patchEditValues(row, rowIndex);
    }
    this.modalref = this.modalservice.open(billingemploymenttypemodal, NgbModalOptions);
  }
  /**
* Patch heading and save button text
 * @param void
 * @returns void
 */
  patchAddValues(): void {
    this.disableBtn = false;
    this.employmentTypeForm.reset();
    this.employmentTypeForm.get('name').enable();
    this.modelSubmit = 'Save & Continue';
    this.modelTitle = 'Add';
  }
  /**
* Patch values on edit click
* @param row : any
* @param rowIndex : number
* @returns void
*/
  patchEditValues(row: any, rowIndex: number): void {
    this.disableBtn = false;
    this.modelSubmit = 'Update';
    this.modelTitle = 'Edit';
    // this.employmentTypeForm.get('name').disable();
    this.employmentTypeForm.patchValue({
      id: row.id,
      name: this.employmentTypeListing[rowIndex].name,
      description: this.employmentTypeListing[rowIndex].description,
    });
  }
  /**
     * Checked search form is empty or not and queryparams set for pagination
     * @param pageInfo : any
     * @returns void
     */
  setpage(pageInfo) {
    this.page.pageNumber = pageInfo.offset;
    const pageNumber = this.page.pageNumber + 1;
    const filters = checkReactiveFormIsEmpty(this.employmentTypeSearchForm);
    this.queryparam = {
      filter: !isObjectEmpty(filters),
      order: OrderEnum.ASC,
      per_page: this.page.size || 10,
      page: pageNumber,
      pagination: true,
    }
    let per_page = this.page.size;
    let queryparam = { per_page, page: pageNumber }
    this.addUrlQueryParams({ ...filters, ...queryparam });
    this.getBillingEmploymentType({ ...this.queryparam, ...filters });
  }
  /**
   * get Billing Employmenttype listing data
   * @param queryParams 
   */
  getBillingEmploymentType(queryParams: any): void {
    this.loadSpin = true;
    this.subscription.push(
      this.requestService
        .sendRequest(
          BillingEmploymentTypeUrlsEnum.BillingEmploymentType_list_GET,
          'GET',
          REQUEST_SERVERS.fd_api_url,
          queryParams,
        )
        .subscribe(
          (comingData: any) => {
            if (comingData['status'] == true || comingData['status'] == 200) {
              this.employmentTypeListing = comingData.result && comingData.result.data ? comingData.result.data : [];
              this.page.totalElements = comingData.result ? comingData.result.total : 0;
              this.selection.clear();
              this.loadSpin = false;
              this.employmentTypeForm.reset();
            }
          },
          (err) => {
            this.loadSpin = false;
            // const str = parseHttpErrorResponseObject(err.error.message);
            // this.toastrService.error(str);
          },
        ),
    );
  }
  /**
   * Send request to server new creating and updating
   * @param form FormGroup
   * @returns void
   */
  onFormSubmit(form: FormGroup): void {
    if (this.modelTitle == 'Add') {
      this.createFormSubmit(form);
    } else {
      this.updateForm(form);
    }
  }
  /**
 * Create new Data
 * @param form  FormGroup
 * @returns void
 */

  createFormSubmit(form: FormGroup): void {
    if (this.employmentTypeForm.valid) {
      this.disableBtn = true;
      this.subscription.push(
        this.requestService
          .sendRequest(
            BillingEmploymentTypeUrlsEnum.BillingEmploymentType_list_POST,
            'POST',
            REQUEST_SERVERS.fd_api_url,
            form,
          )
          .subscribe(
            (response: any) => {
              this.disableBtn = false;
              if (response.status || response.status == 200) {
                this.selection.clear();
                this.employmentTypeForm.reset();
                this.employmentTypeSearchForm.reset();
                this.modalref.close();
                this.setpage({ offset: this.page.pageNumber });
                this.toastrService.success('Successfully added', 'Success');
              } else {
				this.disableBtn = false;
			  }
            },
            (err) => {
              const str = parseHttpErrorResponseObject(err.error.message);
              this.disableBtn = false;
              // this.toastrService.error(str);
            },
          ),
      );
    } else {
      touchAllFields(this.employmentTypeForm);
    }
  }

  /**
	 * Method to Update
	 * @param form FormGroup
	 * @returns void
	 */
  updateForm(form: FormGroup): void {
    if (this.employmentTypeForm.valid) {
      this.disableBtn = true;
      this.subscription.push(
        this.requestService
          .sendRequest(
            BillingEmploymentTypeUrlsEnum.BillingEmploymentType_list_PUT,
            'PUT',
            REQUEST_SERVERS.fd_api_url,
            form,
          )
          .subscribe(
            (response: any) => {
              this.disableBtn = false;
              if (response.status === 200 || response.status) {
                this.selection.clear();
                this.employmentTypeForm.reset();
                this.modalref.close();
                this.setpage({ offset: this.page.pageNumber });
                this.toastrService.success('Successfully updated', 'Success');
              }
            },
            (err) => {
              this.disableBtn = false;
              const str = parseHttpErrorResponseObject(err.error.message);
              // const str = parseHttpErrorResponseObject(err.error.message);
              // this.toastrService.error(str);
            },
          ),
      );
    } else {
      touchAllFields(this.employmentTypeForm);
    }
  }
  /**
	 * Invoke isRegionAllSelected method and perform operation its return value
	 * @param void
	 * @returns void
	 */
  masterToggle(): void {
    (this.isAllSelected()) ? this.selection.clear() : this.employmentTypeListing.slice(0, this.totalrows)
      .forEach((row) => this.selection.select(row));
  }
  /**
	 * Compare checkbox selection and length of data coming from server and return boolean
	 * @param void
	 * @returns boolean
	 */
  isAllSelected(): boolean {
    this.totalrows = this.employmentTypeListing.length;
    const selectednumber = this.selection.selected.length;
    return this.totalrows === selectednumber;

  }
  /**
		 * Queryparams to make unique URL
		 * @param params
		 * @returns void
		 */
  addUrlQueryParams(params?: FormGroup): void {
    this.location.replaceState(
      this.router.createUrlTree([], { queryParams: params, }).toString()
    );
  }
  /**
	 * Dropdown selection how much data user want in listing
	 * @params $num: string
	 * @returns void
	 */
  pageLimit($num: string): void {
    this.page.size = Number($num);
    this.setpage({ offset: 0 });
    this.selection.clear();
  }
  /**
	 * A library method takes an object and converts into string and return
	 * @param obj
	 * @returns string
	 */
  stringfy(obj: any): string {
    return JSON.stringify(obj);
  }
  /**
  * close modal for add/edit 
  */
  resetData() {
    this.modalref.close();
    this.employmentTypeForm.reset();
  }
  /**
	 * CloseModal and ask user to fill data or not
	 * @param void
	 * @returns void | boolean
	 */
  closeModel() {
    if (this.employmentTypeForm.dirty && this.employmentTypeForm.touched) {
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
 * LifeCycle hook method unsubscribe all Observables to prevent from memory leakage
 * @param void
 * @returns void
 */
  ngOnDestroy(): void {
    unSubAllPrevious(this.subscription);
  }

  checkInputs(){
    if (isEmptyObject(this.employmentTypeSearchForm.value)) {
      return true;
      }
      return false;
  }

billingEmploymentHistoryStats(row) {
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
			this.localStorage.setObject('billingEmpTypeBillingTableList' + this.storageData.getUserId(), data);
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
		this.billingEmpTypeListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.billingEmpTypeListTable._internalColumns.sort(function (a, b) {
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
