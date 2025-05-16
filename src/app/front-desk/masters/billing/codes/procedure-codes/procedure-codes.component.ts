import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { Subscription } from 'rxjs';
import { NgbModalRef, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Page } from '@appDir/front-desk/models/page';
import { ParamQuery, OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { ToastrService } from 'ngx-toastr';
import { RequestService } from '@appDir/shared/services/request.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AclService } from '@appDir/shared/services/acl.service';
import { Title } from '@angular/platform-browser';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { Location } from '@angular/common';
import { CodesUrl } from '../codes-url.enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { checkReactiveFormIsEmpty, isObjectEmpty, unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';

@Component({
  selector: 'app-procedure-codes',
  templateUrl: './procedure-codes.component.html',
  styleUrls: ['./procedure-codes.component.scss']
})
export class ProcedureCodesComponent extends PermissionComponent implements OnInit, OnDestroy {

  form: FormGroup; // create form for ICD-10-Codes
  searchForm: FormGroup; // create form for ICD-10-Codes
  selection = new SelectionModel<Element>(true, []);
  totalRows: number;
  subscription: Subscription[] = [];
  modalRef: NgbModalRef;
  exchangeData: any[] = [];
  loadSpin: boolean = false;
  errorMessage: any;
  modelTitle: string = 'Add';
  modelSubmit: string = 'Save';
  rows = [];
  page: Page;
  HcpcForm: FormGroup;
  queryParams: ParamQuery;// Edit form for HCPCS

  typeId = 4;
  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private toastrService: ToastrService,
    protected requestService: RequestService,
    private _route: ActivatedRoute,
    aclService: AclService,
    router: Router,
    titleService: Title,
    private location: Location,
    private CanDeactivateModelComponentService: CanDeactivateModelComponentService) {
    super(aclService, router, _route, requestService, titleService);
    this.page = new Page();
    this.page.pageNumber = 0;
    this.page.size = 10;
  }

  ngOnInit() {
    this.setTitle();
    // this.titleService.setTitle(this._route.snapshot.data['title']);
    this.searchForm = this.fb.group({
      name: ['', Validators.required],
      type: ['procedure_code'],
      comments: [''],
      short_description: ['']
    });
    this._route.queryParams.subscribe(params => {
      this.searchForm.patchValue(params);
    });
    this.initializationForm(); // initializing form of HCPCS
    this.setPage({ offset: 0 });
  }

  /**
	 * Initialize 'HCPCS' form
	 * @param void
	 * @returns void
	 */
  initializationForm() {
    this.form = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      short_description: [''],
      long_description: [''],
      comments: ['']
    });
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
    const filters = checkReactiveFormIsEmpty(this.searchForm);
    this.queryParams = {
      filter: !isObjectEmpty(filters),
      order: OrderEnum.ASC,
      per_page: this.page.size || 10,
      page: pageNumber,
      pagination: true,
      order_by: 'name'
    };
    let name = this.searchForm.value.name;
    let per_page = this.page.size;
    let queryParam = { name, per_page, page: pageNumber }
    this.queryParams['type_id'] = this.typeId;
    this.addUrlQueryParams(queryParam);
    this.getData({ ...this.queryParams, ...filters });
  }

  /**
 * Used method in HCPCSsetPage and perform GET request to receive data
 * @param queryParams: any
 * @returns void
 */
  getData(queryParams: any): void {
    this.loadSpin = true;
    this.subscription.push(
      this.requestService
        .sendRequest(
          CodesUrl.CODES_list_GET,
          'GET',
          REQUEST_SERVERS.fd_api_url,
          queryParams,
        )
        .subscribe(
          (data: any) => {
            if (data.status) {
              this.loadSpin = false;
              this.rows = data.result ? data.result.data : [];
              // data && data['data'].docs && data['data'].docs ? data['data'].docs : [];
              // this.HCPCSpage = (data && data['data'].docs && data['data'].docs) ? data['data'].docs : [];
              this.page.totalElements = data.result.total;
              // this.HCPCSpage.totalPages = this.HCPCSpage.totalElements / this.HCPCSpage.size;
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
 * Reset filter
 * @param void
 * @returns void
 */
  reset(): void {
    this.selection.clear();
    this.searchForm.reset();
    this.searchForm = this.fb.group({
      name: [''],
      short_description: [''],
      comments: [''],
    });
    this.setPage({ offset: 0 });
  }

  // openHCPCSModal(createHCPCS) {
  //   const ngbOPtions: NgbModalOptions = {
  //     backdrop: 'static',
  //     keyboard: false,
  //     windowClass: 'modal_extraDOc',
  //   };
  //   this.modalRef = this.modalService.open(createHCPCS, ngbOPtions);
  // }

  stringfy(obj) {
    return JSON.stringify(obj);
  }

	/**
	 * Dropdown selection how much data user want in listing
	 * @params $num: string
	 * @returns void
	 */

  pageLimit($num: string): void {
    this.page.size = Number($num);
    this.setPage({ offset: 0 });
  }

  /**
	* Compare checkbox selection and length of data coming from server and return boolean
	* @param void
	* @returns boolean
	*/

  isAllSelected(): boolean {
    let rowsLength = this.rows.length;
    const numSelected = this.selection.selected.length;
    const numRows = rowsLength;
    return numSelected === numRows;
  }

	/**
	 * Invoke HcpcsmasterToggle method and perform operation its return value
	 * @param void
	 * @returns void
	 */

  masterToggle() {
    let rowsLength = this.rows.length;
    this.isAllSelected()
      ? this.selection.clear()
      : this.rows.slice(0, rowsLength).forEach((row) => this.selection.select(row));
  }

	/**
		 * Create new ICD code
		 * @param form  FormGroup
		 * @returns void
		 */
  onSubmitForm(form: FormGroup): void {
    form['type_id'] = this.typeId;
    this.loadSpin = true;
    this.subscription.push(
      this.requestService
        .sendRequest(CodesUrl.CODES_list_POST, 'POST', REQUEST_SERVERS.fd_api_url, form)
        .subscribe(
          (data: any) => {
            if (data.status === 200 || data.status === true) {
              this.loadSpin = false;
              this.initializationForm();
              this.setPage({ offset: this.page.pageNumber });
              this.selection.clear();
              this.toastrService.success('Successfully added', 'Success');
              this.modalRef.close();
            }
          },
          (error) => {
            this.loadSpin = false;
            // const str = parseHttpErrorResponseObject(error.error.message);
            // this.toastrService.error(str);
          },
        ),
    );
  }


	/**
	 * Method to Update
	 * @param form FormGroup
	 * @returns void
	 */
  onEditSubmit(form: FormGroup): void {
    form['type_id'] = this.typeId;
    this.loadSpin = true;
    this.subscription.push(
      this.requestService
        .sendRequest(CodesUrl.CODES_list_PATCH, 'PUT', REQUEST_SERVERS.fd_api_url, form)
        .subscribe(
          (data: any) => {
            if (data.status === 200) {
              this.loadSpin = false;
              this.initializationForm();
              this.setPage({ offset: this.page.pageNumber });
              this.selection.clear();
              this.toastrService.success('Successfully updated', 'Success');
              this.modalRef.close();
            }
          },
          (error) => {
            this.loadSpin = false;
            // const str = parseHttpErrorResponseObject(error.error.message);
            // this.toastrService.error(str);
          },
        ),
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
      name: this.rows[rowIndex].name,
      // description: this.HcpcsData[rowIndex].description,
      short_description: this.rows[rowIndex].short_description,
      // mediumDescription: this.HcpcsData[rowIndex].mediumDescription,
      long_description: this.rows[rowIndex].long_description,
      comments: this.rows[rowIndex].comments,
    });
  }

	/**
	* Patch heading and save button text
	* @param void
	* @returns void
	*/

  patchAddValues(): void {
    this.initializationForm();
    this.form.get('name').enable();
    this.modelSubmit = 'Save';
    this.modelTitle = 'Add';
  }


	/**
	 * Open Modal and patch values new or updating
	 * @param codes ModalReference
	 * @param row any (optional)
	 * @param rowIndex: number (optional)
	 * @returns void
	 */
  openModal(codes, row?: any, rowIndex?: number): void {
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

    this.modalRef = this.modalService.open(codes, ngbOPtions);
  }


	/**
	 * Send request to server new creating and updating
	 * @param form FormGroup
	 * @returns void
	 */
  onSubmit(form: FormGroup): void {
    if (this.modelTitle == 'Add') {
      this.onSubmitForm(form);
    } else {
      this.onEditSubmit(form);
    }
  }
 
	/**
	 * Clear selection of checkboxes
	 * @param void
	 * @returns void
	 */
  clear(): void {
    this.selection.clear();
  }


	/**
	 * CloseModal and ask user to fill data or not
	 * @param void
	 * @returns void | boolean
	 */
  close(): void | boolean {
    if (this.form.dirty && this.form.touched) {
      this.CanDeactivateModelComponentService.canDeactivate().then(res => {
        if (res) {
          this.modalRef.close();
          this.initializationForm();
        } else {
          return true;
        }
      });
    } else {
      this.modalRef.close();
      this.initializationForm();
    }

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
