import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModalOptions, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ParamQuery, OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { parseHttpErrorResponseObject, unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { Page } from '@appDir/front-desk/models/page';
import { CPTUrlsEnum } from '../../billing/codes/cptcodes/CPT-Urls-Enum';
import { SelectionModel } from '@angular/cdk/collections';
import { Router, ActivatedRoute } from '@angular/router'
import { AclService } from '@appDir/shared/services/acl.service';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { Location } from '@angular/common'
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { Title } from '@angular/platform-browser';
import { checkReactiveFormIsEmpty, isObjectEmpty } from '@appDir/shared/utils/utils.helpers';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';

@Component({
  selector: 'app-task-priority',
  templateUrl: './task-priority.component.html',
  styleUrls: ['./task-priority.component.scss']
})
export class TaskPriorityComponent extends PermissionComponent implements OnInit {

  modalRef: NgbModalRef;
  SearchForm: FormGroup;
  exchangeData: any[] = [];
  form: FormGroup;
  taskPriorityListing: any = [];
  subscription: Subscription[] = [];
  queryParams: ParamQuery;
  errorMessage: any;
  rows: number;
  page: Page;
  selection = new SelectionModel<Element>(true, []);
  modelTitle: string = 'Add';
  modelSubmit: string = 'Save';


  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private customDiallogService: CustomDiallogService,
    protected requestService: RequestService,
    private location: Location,
    router: Router,
    private _route: ActivatedRoute,
    aclService: AclService,
    titleService: Title,
    private CanDeactivateModelComponentService: CanDeactivateModelComponentService
  ) {
    super(aclService, router, _route, requestService, titleService);
    this.page = new Page();
    this.page.pageNumber = 0;
    this.page.size = 10;
  }

  ngOnInit() {
    this.setTitle();
    // this.titleService.setTitle(this._route.snapshot.data['title']);
    this.SearchForm = this.fb.group({
      name: [''],
      comments: [''],
    });
    this._route.queryParams.subscribe(params => {
      this.SearchForm.patchValue(params);
    });
    this.setPage({ offset: 0 });
    this.FormInitialization();
  }

  /**
 * Initialize form
 * @param void
 * @returns void
 */
  FormInitialization(): void {
    this.form = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      comments: [''],
    });
  }

  getTaskPriorityData(queryParams: any): void {
    this.subscription.push(
      this.requestService
        .sendRequest(CPTUrlsEnum.CPT_list_GET, 'GET', REQUEST_SERVERS.billing_api_url, queryParams)
        .subscribe(
          (data: any) => {
            if (data.status) {
              this.taskPriorityListing = data.result ? data.result.data : [];
              this.page.totalElements = data.result.total;
              this.selection.clear();
            }
          },
          (err) => {
            const str = parseHttpErrorResponseObject(err.error.message);
            this.toastrService.error(str);
          },
        ),
    );
  }


  /**
 * Checked search form is empty or not and queryparams set for pagination
 * @param pageInfo : any
 * @returns void
 */
  setPage(pageInfo: any): void {
    this.selection.clear();
    this.page.pageNumber = pageInfo.offset;
    const pageNumber = this.page.pageNumber + 1;
    const filters = checkReactiveFormIsEmpty(this.SearchForm);
    this.queryParams = {
      filter: !isObjectEmpty(filters),
      order: OrderEnum.DEC,
      per_page: this.page.size,
      page: pageNumber,
      pagination: true,
    };
    let comments = this.SearchForm.value.comments;
    let name = this.SearchForm.value.name;
    let queryparam = { name, comments }
    this.addUrlQueryParams(queryparam);
    this.getTaskPriorityData({ ...this.queryParams, ...filters });
  }

  /**
* Queryparams to make unique URL
* @param params
* @returns void
*/
  addUrlQueryParams(params: any): void {
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
    this.selection.clear();
    this.setPage({ offset: 0 });
  }

  /**
 * Compare checkbox selection and length of data coming from server and return boolean
 * @param void
 * @returns boolean
 */
  isAllSelected(): boolean {
    this.rows = this.taskPriorityListing.length;
    const numSelected = this.selection.selected.length;
    const numRows = this.rows;
    return numSelected === numRows;
  }

  /**
 * Invoke isAllSelected method and perform operation its return value
 * @param void
 * @returns void
 */
  masterToggle(): void {
    this.isAllSelected()
      ? this.selection.clear()
      : this.taskPriorityListing.slice(0, this.rows).forEach((row) => this.selection.select(row));
  }


  /**
 * Send request to server new creating and updating
 * @param form FormGroup
 * @returns void
 */
  onSubmitForm(form: FormGroup): void {
    if (this.modelTitle == 'Add') {
      this.OncreateTaskPriorityform(form);
    } else {
      this.onEditTaskPriority(form);
    }
  }

	/**
	 * Clear selected checkbox
	 * @param void
	 * @returns void
	 */
  clearTaskPriority(): void {
    this.selection.clear();
  }

	/**
	 * Create new fee Type
	 * @param form  FormGroup
	 * @returns void
	 */
  OncreateTaskPriorityform(form) {
    this.requestService
      .sendRequest(CPTUrlsEnum.CPT_list_POST, 'POST', REQUEST_SERVERS.billing_api_url, form)
      .subscribe(
        (data) => {
          if (data['status'] === 200) {
            this.toastrService.success('Successfully added', 'Success');
            this.modalRef.close();
            this.setPage({ offset: 0 });
            this.clearTaskPriority();
            this.form.reset();
            this.FormInitialization();
            this.modalRef.close();
          }
        },
        (error) => {
          const str = parseHttpErrorResponseObject(error.error.message);
          this.toastrService.error(str);
        },
      );
  }


  /**
 * Method to Update
 * @param form FormGroup
 * @returns void
 */
  onEditTaskPriority(form: FormGroup): void {
    this.requestService
      .sendRequest(CPTUrlsEnum.CPT_list_PATCH, 'PATCH', REQUEST_SERVERS.billing_api_url, form)
      .subscribe(
        (data) => {
          if (data['status'] === 200) {
            this.form.reset();
            this.toastrService.success('Successfully updated', 'Success');
            this.setPage({ offset: 0 });
            this.clearTaskPriority();
            this.modalRef.close();
          }
        },
        (error) => {
          const str = parseHttpErrorResponseObject(error.error.message);
          this.toastrService.error(str);
        },
      );
  }

  /**
 * Patch values on edit click
 * @param row : any
 * @param rowIndex : number
 * @returns void
 */
  patchEditValues(row: any, rowIndex: number): void {
    this.modelSubmit = 'Update';
    this.modelTitle = 'Edit';
    this.form.get('name').disable();
    this.form.patchValue({
      id: row.id,
      name: this.taskPriorityListing[rowIndex].name,
      comments: this.taskPriorityListing[rowIndex].comments,
    });
  }

	/**
	* Patch heading and save button text
	* @param void
	* @returns void
	*/
  patchAddValues(): void {
    this.FormInitialization();
    this.form.get('name').enable();
    this.modelSubmit = 'Save';
    this.modelTitle = 'Add';
  }

  /**
     * Open Modal and patch values new or updating
     * @param openModal ModalReference
     * @param row any (optional)
     * @param rowIndex: number (optional)
     * @returns void
     */
  openTaskPriorityModal(openModal, row?: any, rowIndex?: number) {
    const ngbOPtions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false,
      windowClass: 'modal_extraDOc',
    };
    if (row == undefined || row == null) {
      this.patchAddValues();
    } else {
      this.patchEditValues(row, rowIndex);
    }
    this.modalRef = this.modalService.open(openModal, ngbOPtions);
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
	 * CloseModal and ask user to fill data or not
	 * @param void
	 * @returns void | boolean
	 */

  closeModal(): void {
    if (this.form.dirty && this.form.touched) {
      this.CanDeactivateModelComponentService.canDeactivate().then(res => {
        if (res) {
          this.resetData();
        } else {
          return true;
        }
      });
    } else {
      this.resetData();
    }
  }

  /**
	 * Close Modal and reset form
	 * @param void
	 * @returns void
	 */
  resetData(): void {
    this.modalRef.close();
    this.form.reset();
    this.FormInitialization();
  }


	/**
	 * Reset filter
	 * @param void
	 * @returns void
	 */
  resetFilter(): void {
    this.SearchForm.reset();
    this.selection.clear();
    this.setPage({ offset: 0 });
  }

	/**
	 * LifeCycle hook method unsubscribe all Observables to prevent from memory leakage
	 * @param void
	 * @returns void
	 */
  ngOnDestroy() {
    unSubAllPrevious(this.subscription);
  }

} 
