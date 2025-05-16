import { DatePipeFormatService } from './../../../../shared/services/datePipe-format.service';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { NgbModalRef, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '@appDir/front-desk/fd_shared/services/http.service';
import { Designation } from './designation.model';
import { ToastrService } from 'ngx-toastr';
import { SelectionModel } from '@angular/cdk/collections';
import { Page } from '@appDir/front-desk/models/page';
import { AclService } from '@appDir/shared/services/acl.service';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { Subscription } from 'rxjs';
import {
	unSubAllPrevious,
} from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { OrderEnum, ParamQuery } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { DesignationUrlsEnum } from './designation-urls-enum';
import { HttpClient } from '@angular/common/http';
import { Config } from '@appDir/config/config';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { checkReactiveFormIsEmpty, getIdsFromArray, isEmptyObject, isObjectEmpty, makeDeepCopyArray, whitespaceFormValidation } from '@appDir/shared/utils/utils.helpers';
import { environment } from 'environments/environment';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
@Component({
	selector: 'app-designation',
	templateUrl: './designation.component.html',
	styleUrls: ['./designation.component.scss']
})
export class DesignationComponent extends PermissionComponent implements OnInit, OnDestroy {
	subscription: Subscription[] = [];
	public designations: Designation[];
	public designation: Designation;
	public editAbleDesignation: Designation;
	public totalSelected = 0;
	environment= environment;
	isCollapsed:boolean =false;
	// Modal
	public submitText: string = 'Save';
	public headerText: string = 'Add Designation';
	public modalRef: NgbModalRef;

	// Form
	searchForm: FormGroup;
	loadSpin: boolean = false;
	designationForm: FormGroup;
	totalRows: number;
	isEdit: boolean = false;
	loading: boolean = false;
	disableBtn: boolean = false;
	// Pagination
	page: Page;
	queryParams: ParamQuery;
	selection = new SelectionModel<Designation>(true, []);
	selecting = new SelectionModel<Designation>(true, []);
	BASE_URL: string = this.config.getConfig(REQUEST_SERVERS.fd_api_url);
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('designationsList') designationsListTable: DatatableComponent;
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
	designationListingTable: any;

	constructor(
		aclService: AclService,
		private http: HttpService,
		private httpClient: HttpClient,
		private config: Config,
		private fb: FormBuilder,
		private modalService: NgbModal,
		private toastrService: ToastrService,
		private fd_service: FDServices,
		private customDiallogService : CustomDiallogService,
		protected requestService: RequestService,
		titleService: Title,
		private _route: ActivatedRoute,
		router: Router,
		private location: Location,
		public datePipeService: DatePipeFormatService,
		private CanDeactivateModelComponentService:CanDeactivateModelComponentService,
		protected storageData: StorageData,
		private localStorage: LocalStorage
	) {
		super(aclService, router, _route, requestService, titleService);
		this.page = new Page();
		this.page.pageNumber = 0;
		this.page.size = 10;
	}

	ngOnInit() {
		this.setTitle();
		// this.titleService.setTitle(this._route.snapshot.data['title']);
		this.designationForm = this.initializeForm();

		// this.fetchList();
		this.totalSelected = this.selection.selected.length;

		this.searchForm = this.fb.group({
			name: [''],
			description: ['']
		});
		this.subscription.push(
			this._route.queryParams.subscribe((params) => {
				this.searchForm.patchValue(params);
				this.page.pageNumber = parseInt(params.page) || 1;
				this.page.size = parseInt(params.per_page) || 10
			}),
		);
		this.setPage({ offset: this.page.pageNumber - 1 || 0 });
		this.designationListingTable = this.localStorage.getObject('designationMasterTableList' + this.storageData.getUserId());
	}

	ngAfterViewInit() {
		if (this.designationsListTable?._internalColumns) {
			this.columns = makeDeepCopyArray([...this.designationsListTable._internalColumns]);
			this.columns.forEach(element => {
				if(this.designationListingTable?.length) {
					let obj = this.designationListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.designationListingTable?.length) {
				const nameToIndexMap = {};
				this.designationListingTable.forEach((item, index) => {
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

	resetFilter() {
		if (this.searchForm.valid) {
			this.searchForm.reset();
			this.setPage({ offset: 0 });
			this.selection.clear();
		}
	}

	setPage(pageInfo) {
		let pageNum;
		this.selection.clear();
		pageNum = pageInfo.offset;
		this.page.pageNumber = pageInfo.offset;
		const pageNumber = this.page.pageNumber + 1;
		let filters = checkReactiveFormIsEmpty(this.searchForm);
		this.queryParams = {
			filter: !isObjectEmpty(filters),
			order: OrderEnum.ASC,
			per_page: this.page.size || 10,
			page: pageNumber,
			pagination: true,
		};
		let per_page = this.page.size;
		let queryparam = { per_page, page: pageNumber }

		this.addUrlQueryParams({ ...filters, ...queryparam });
		this.fetchList({ ...this.queryParams, ...filters });
	}

	addUrlQueryParams(params?) {
		this.location.replaceState(
			this.router.createUrlTree([], { queryParams: params, }).toString()
		);
	}

	fetchList(queryParams) {
		this.loadSpin = true;
		this.subscription.push(
			this.requestService
				.sendRequest(
					DesignationUrlsEnum.Designation_list_GET,
					'GET',
					REQUEST_SERVERS.fd_api_url,
					queryParams,
				)
				.subscribe(
					(data: any) => {
						this.loadSpin = false;
						this.designations = data && data.result && data.result.data ? data.result.data : [];
						this.page.totalElements = data.result.total;
					},
					(err) => {
						this.loadSpin = false;
						// const str = parseHttpErrorResponseObject(err.error.message);
						// this.toastrService.error(str);
					},
				),
		);
	}

	onSubmit() {
		if (this.designationForm.valid) {
			this.loading = true;
			this.disableBtn = true;
			this.designation = this.designationForm.getRawValue();
			let apiUrl = this.BASE_URL + DesignationUrlsEnum.Designation_list_POST;

			let method = 'POST';
			if (this.isEdit) {
				apiUrl = this.BASE_URL + DesignationUrlsEnum.Designation_list_PUT;
				method = 'PUT';
				this.designation.id = this.editAbleDesignation.id;
			}

			// console.log('designation', this.designation);
			// this.requestService.sendRequest(url, method, REQUEST_SERVERS.fd_api_url, { designation: this.designation, isEdit: this.isEdit }).subscribe(

			// this.subscription.push(
			// 	this.requestService
			// 		.sendRequest(url, method, REQUEST_SERVERS.fd_api_url, this.designation)
			// 		.subscribe(
			// 			(data: any) => {
			// 				if (data.status) {
			// 				}
			// 			},
			// 			(err) => {
			// 				const str = parseHttpErrorResponseObject(err.message);
			// 				this.toastrService.error(err.message, 'Error');
			// 			},
			// 		),
			// );
			this.subscription.push(
				this.httpVerb(apiUrl, this.designation, this.isEdit).subscribe(
					(data: any) => {
						const { message, data: designation } = data;

						this.designations = this.isEdit
							? this.remove(
								this.designations,
								this.editAbleDesignation.id,
								'id',
								designation,
							)
							: [designation, ...this.designations].slice();

						this.selection.clear();
						this.designationForm.reset();
						this.modalRef.close();
						this.loading = false;
						this.disableBtn = false;
						this.setPage({ offset: this.isEdit ? this.page.pageNumber : 0 });

						this.toastrService.success(`Successfully ${this.isEdit ? 'Updated' : 'Added'}`, 'Success');
					},
					(err: any) => {
						// console.log(err);
						this.loading = false;
						this.disableBtn = false;
						// const str = parseHttpErrorResponseObject(err.error.message);
						// this.toastrService.error(str);
					},
				),
			);
		} else {
			this.fd_service.touchAllFields(this.designationForm);
		}
	}

	private remove<T>(arr: T[], id: number, key: string, item: T): T[] {
		const _arr = [...arr];

		const index = arr.findIndex((row) => row[`${key}`] === id);
		_arr.splice(index, 1, item);

		return _arr;
	}

	private initializeForm() {
		return this.fb.group({
			name: ['', [Validators.required, whitespaceFormValidation()]],
			description: [''],
		});
	}

	setForm(designation: Designation) {
		this.designationForm.patchValue({
			name: designation.name,
			description: designation.description,
		});
	}

	resetForm() {
		this.designationForm.reset();
		this.setPage({ offset: 0 });
	}

	openModal(modal) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc',
		};

		this.modalRef = this.modalService.open(modal, ngbModalOptions);
	}

	isAllSelected() {
		this.totalRows = this.designations.length;

		return this.selection.selected.length === this.totalRows;
	}

	masterToggle() {
		this.isAllSelected()
			? this.selection.clear()
			: this.designations.slice(0, this.totalRows).forEach((row) => this.selection.select(row));
	}

	edit(modal, designation: Designation) {
		this.editAbleDesignation = designation;

		this.isEdit = true;
		this.submitText = 'Update';
		this.headerText = 'Edit Designation';
		this.setForm(this.editAbleDesignation);
		// this.designationForm.controls['name'].disable();
		this.openModal(modal);
	}

	save(modal) {
		this.isEdit = false;
		this.submitText = 'Save & Continue';
		this.headerText = 'Add Designation';
		this.resetForm();
		this.designationForm.controls['name'].enable();
		this.openModal(modal);
	}

	deleteOne(id) {
		this.customDiallogService.confirm('Delete Confirmation?', `Are you sure you want to delete?`,'Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
				// this.http.delete<UMResponse<Designation>>(`delete_designation/${id}`)
				this.requestService
				.sendRequest(
					DesignationUrlsEnum.Designation_list_DELETE + id,
					'DELETE',
					REQUEST_SERVERS.fd_api_url,
				)
				.subscribe(
					(resp) => {
						const { message } = resp['message'];
						this.designations = this.designations.filter(
							(designation) => designation.id !== id,
						);
						this.toastrService.success(message, 'Success');
					},
					(err) => {
						// const str = parseHttpErrorResponseObject(err.error.message);
						// this.toastrService.error(str);
					},
				);
			}
		})
		.catch();
	}

	bulkDelete() {
		const selected = this.selection.selected;
		const ids = selected.map((row) => row.id);
		this.customDiallogService.confirm('Delete Confirmation?', `Are you sure you want to delete?`,'Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
				// this.http.deleteMultiple(`delete_multiple_designation`, ids)
				this.requestService
				.sendRequest(
					DesignationUrlsEnum.Designation_list_DELETEMultiple,
					'DELETE_WITH_BODY',
					REQUEST_SERVERS.fd_api_url,
					ids,
				)
				.subscribe(
					(resp) => {
						this.designations = this.removeMultipleFromArr(
							this.designations,
							ids,
							'id',
						);
						this.selection.clear();
						this.toastrService.success('Successfully deleted', 'Success');
					},
					(err) => {
						// const str = parseHttpErrorResponseObject(err.message);
						// this.toastrService.error(str);
					},
				);	
			}
		})
		.catch();
	}

	private removeMultipleFromArr<T>(data: T[], toBeDeleted: number[], key): T[] {
		return data.filter(
			(row) => row[`${key}`] !== toBeDeleted.find((element) => row[`${key}`] === element),
		);
	}

	private httpVerb(url, data, isEdit = false) {
		// return isEdit
		// 	? this.http.put<UMResponse<Designation>>(url, data)
		// 	: this.http.post<UMResponse<Designation>>(url, data);
		return isEdit
			? // ? this.httpClient.put(url, data, this.http.getHeader())
			this.requestService.sendRequest(
				DesignationUrlsEnum.Designation_list_PUT,
				'PUT',
				REQUEST_SERVERS.fd_api_url,
				data,
			)
			: // : this.httpClient.post(url, data, this.http.getHeader());
			this.requestService.sendRequest(
				DesignationUrlsEnum.Designation_list_POST,
				'POST',
				REQUEST_SERVERS.fd_api_url,
				data,
			);
	}

	PageLimit($num) {
		this.page.size = Number($num);
		this.setPage({ offset: 0 });
	}

	stringfy(obj) {
		return JSON.stringify(obj);
	}

	closeModal() {
		if (this.designationForm.dirty && this.designationForm.touched) {
			this.CanDeactivateModelComponentService.canDeactivate().then(res => {
				if (res) {
					this.designationForm.reset();
					this.modalRef.close();
				} else {
					return true;
				}
			});
		} else {
			this.designationForm.reset();
			this.modalRef.close();
		}
	}
	isDisableSaveContinue() {
		if(this.designationForm.invalid || this.loading) {
			return true;
		}
		return false;
	}
	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}

	checkInputs(){
		if (isEmptyObject(this.searchForm.value)) {
			return true;
		  }
		  return false;
	}

	designationHistoryStats(row) {
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
			this.localStorage.setObject('designationMasterTableList' + this.storageData.getUserId(), data);
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
		this.designationsListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.designationsListTable._internalColumns.sort(function (a, b) {
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
