import { DatePipeFormatService } from './../../../../../shared/services/datePipe-format.service';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { NgbModalRef, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'environments/environment';
import { HttpService } from '@appDir/front-desk/fd_shared/services/http.service';
import { Department } from './department.model';
import { ToastrService } from 'ngx-toastr';
import { SelectionModel } from '@angular/cdk/collections';
import { Page } from '@appDir/front-desk/models/page';
import { AclService } from '@appDir/shared/services/acl.service';
import { DepartmentService } from './department.service';
import { Subscription } from 'rxjs';
import {
	unSubAllPrevious,
} from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { OrderEnum, ParamQuery } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { DepartmentUrlsEnum } from './Departments-urls-enum';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { checkReactiveFormIsEmpty, getIdsFromArray, isEmptyObject, isObjectEmpty, makeDeepCopyArray, whitespaceFormValidation } from '@appDir/shared/utils/utils.helpers'
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
@Component({
	selector: 'app-department',
	templateUrl: './department.component.html',
	styleUrls: ['./department.component.scss']
})
export class DepartmentComponent extends PermissionComponent implements OnInit, OnDestroy {
	subscription: Subscription[] = [];
	environment= environment;
	isCollapsed:boolean = false;
	public departments: Department[];
	public department: Department;
	public editAbledepartment: Department;
	public totalSelected = 0;
	searchForm: FormGroup;
	loadSpin: boolean = false;
	disableBtn: boolean = false;
	// Modal
	public submitText: string = 'Save';
	public headerText: string = 'Add New Department';
	public modalRef: NgbModalRef;

	// Form
	departmentForm: FormGroup;
	totalRows: number;
	isEdit: boolean = false;

	loading: boolean = false;
	queryParams: ParamQuery;

	// Pagination
	page: Page;

	selection = new SelectionModel<Department>(true, []);
	selecting = new SelectionModel<Department>(true, []);
	
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('departmentsList') departmentListTable: DatatableComponent;
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
	departmentListingTable: any;

	constructor(
		private customDiallogService : CustomDiallogService,
		aclService: AclService,
		private http: HttpService,
		private fb: FormBuilder,
		private modalService: NgbModal,
		private toastrService: ToastrService,
		private service: DepartmentService,
		protected requestService: RequestService,
		public datePipeService: DatePipeFormatService,
		titleService: Title,
		private _route: ActivatedRoute,
		router: Router,
		private location: Location,
		private CanDeactivateModelComponentService: CanDeactivateModelComponentService,
		protected storageData: StorageData,
		private localStorage: LocalStorage
	) {
		super(aclService, router, _route, requestService, titleService);
		this.page = new Page();
		this.page.pageNumber = 0;
		this.page.size = 10;

		this.searchForm = this.fb.group({
			name: [''],
			description: ['']
		});
	}

	async ngOnInit() {
		this.setTitle();
		// this.titleService.setTitle(this._route.snapshot.data['title']);
		this.departmentForm = this.initializeForm();
		// do not delete below line
		// this.departments = await this.service.fetchDepartments();
		this.subscription.push(
			this._route.queryParams.subscribe((params) => {
				this.searchForm.patchValue(params);
				this.page.size = parseInt(params.per_page) || 10;
				this.page.pageNumber = parseInt(params.page) || 1
			}),
		);

		this.setPage({ offset: this.page.pageNumber - 1 || 0 });
		this.totalSelected = this.selection.selected.length;
		this.departmentListingTable = this.localStorage.getObject('departmentMasterTableList' + this.storageData.getUserId());
	}

	ngAfterViewInit() {
		if (this.departmentListTable?._internalColumns) {
			this.columns = makeDeepCopyArray([...this.departmentListTable._internalColumns]);
			this.columns.forEach(element => {
				if(this.departmentListingTable?.length) {
					let obj = this.departmentListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.departmentListingTable?.length) {
				const nameToIndexMap = {};
				this.departmentListingTable.forEach((item, index) => {
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

	// searchFiltrer() {
	// 	console.log('this.searchForm.value', this.searchForm.value);
	// 	if (this.searchForm.valid) {
	// 		this.loadSpin = true;
	// 		this.subscription.push(
	// 			this.http.post('search_department', this.searchForm.value).subscribe(
	// 				(resp) => {
	// 					this.loadSpin = false;
	// 					if (resp['status']) {
	// 						console.log('resp.data', resp.data);
	// 						this.departments = resp.data;
	// 						this.selection.clear();
	// 						this.page.totalElements = this.departments.length;
	// 					}
	// 				},
	// 				(err) => {
	// 					this.loadSpin = false;
	// 					this.toastrService.error(err.statusText, 'Error');
	// 				},
	// 			),
	// 		);
	// 	}
	// }

	resetFilter() {
		this.searchForm.reset();
		this.loadSpin = true;
		this.setPage({ offset: 0 });
	}

	setPage(pageInfo) {

		this.page.pageNumber = pageInfo.offset;
		const pageNumber = this.page.pageNumber + 1;
		const filters = checkReactiveFormIsEmpty(this.searchForm);
		this.queryParams = {
			filter: !isObjectEmpty(filters),
			order: OrderEnum.ASC,
			per_page: this.page.size || 10,
			page: pageNumber,
			pagination: true,
		};

		let per_page = this.page.size || 10;
		let queryparam = { per_page, page: pageNumber }

		this.addUrlQueryParams({ ...filters, ...queryparam });
		this.getDeparments({ ...this.queryParams, ...filters });
	}


	addUrlQueryParams(params?) {
		this.location.replaceState(
			this.router.createUrlTree([], { queryParams: params, }).toString()
		);
	}

	getDeparments(queryParams) {
		this.loadSpin = true;
		this.subscription.push(
			this.requestService
				.sendRequest(
					DepartmentUrlsEnum.Departments_list_GET,
					'GET',
					REQUEST_SERVERS.fd_api_url,
					queryParams,
				)
				.subscribe(
					(resp) => {
						this.loadSpin = false;
						if (resp['status']) {
							this.departments = resp['result'] && resp['result'].data ? resp['result'].data : [];
							this.page.totalElements = resp['result'].total;
							this.page.totalPages = this.page.totalElements / this.page.size;
						}
						this.selection.clear();
					},
					(err) => {
						this.loadSpin = false;
						// const str = parseHttpErrorResponseObject(err.error.message);
						// this.toastrService.error(str);
					},
				),
		);
	}

	async onSubmit() {
		if (this.departmentForm.valid) {
			this.loading = true;
			this.disableBtn = true;
			this.department = this.departmentForm.getRawValue();

			if (this.isEdit) {
				this.department.id = this.editAbledepartment.id;
			}

			try {
				// const { data: department, message } = await this.service.upsert(
				// const { data: department, message } = this.upsert(this.department, this.isEdit);
				// console.log(
				// 	'method',
				// 	this.upsert(this.department, this.isEdit).subscribe());
				// ;
				// const { data: department, message } = this.upsert(this.department, this.isEdit).subscribe(
				this.upsert(this.department, this.isEdit).subscribe((res: any) => {
					const { message, data: department } = res;
					// const { message } = res['message'];
					this.setPage({ offset: this.isEdit ? this.page.pageNumber : 0 });
					this.departments = this.isEdit
						? this.remove(
							this.departments,
							this.editAbledepartment.id,
							'id',
							department,
						)
						: [department, ...this.departments].slice();
					this.selection.clear();
					this.departmentForm.reset();
					this.modalRef.close();
					this.loading = false;
					this.disableBtn = false;

					this.toastrService.success(`Successfully ${this.isEdit ? 'Updated' : 'Added'}`, 'Success');
				});
			} catch (error) {
				this.loading = false;
				this.disableBtn = false;
				this.toastrService.error(error.message || 'Something went wrong.', 'Error');
			}
		} else {
			this.service.touchAllFields(this.departmentForm);
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

	setForm(department: Department) {
		this.departmentForm.patchValue({
			name: department.name,
			description: department.description,
		});
	}

	resetForm() {
		this.departmentForm.reset();
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
		this.totalRows = this.departments.length;

		return this.selection.selected.length === this.totalRows;
	}

	masterToggle() {
		this.isAllSelected()
			? this.selection.clear()
			: this.departments.slice(0, this.totalRows).forEach((row) => this.selection.select(row));
	}

	edit(modal, department: Department) {
		this.editAbledepartment = department;

		this.isEdit = true;
		this.submitText = 'Update';
		this.headerText = 'Edit Department';
		this.setForm(this.editAbledepartment);
		// this.departmentForm.controls['name'].disable();
		this.openModal(modal);
	}

	save(modal) {
		this.isEdit = false;
		this.submitText = 'Save & Continue';
		this.headerText = 'Add Department';
		this.resetForm();
		this.departmentForm.controls['name'].enable();
		this.openModal(modal);
	}

	deleteOne(id) {
		this.customDiallogService.confirm('Delete Confirmation?', `Are you sure you want to delete?`,'Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
				try {
					const _department =  this.service.deleteOneDepartment(id);

					if (_department) {
						this.departments = this.departments.filter(
							(department) => department.id !== id,
						);
						this.selection.clear();
						this.toastrService.success('Successfully deleted', 'Success');
						return;
					}
					this.toastrService.error('Something went wrong', 'Error');
				} catch (error) {
					this.toastrService.error(error, 'Error');
				}
				
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
				
				try {
					const status = this.service.deleteMultipleDepartments(ids);
					if (status) {
						this.departments = this.removeMultipleFromArr(
							this.departments,
							ids,
							'id',
						);
						this.selection.clear();
						this.toastrService.success(
							'Selected departments deleted successfully.',
							'Success',
						);
						return;
					}
					this.toastrService.error('Something went Wrong', 'Error');
				} catch (error) {
					this.toastrService.error(error, 'Error');
				}
				
			}
		})
		.catch();
	}

	private removeMultipleFromArr<T>(data: T[], toBeDeleted: number[], key): T[] {
		return data.filter(
			(row) => row[`${key}`] !== toBeDeleted.find((element) => row[`${key}`] === element),
		);
	}

	// private httpVerb(url, data, isEdit = false) {
	// 	return isEdit
	// 		? this.http.put<UMResponse<Department>>(url, data)
	// 		: this.http.post<UMResponse<Department>>(url, data);
	// }

	PageLimit($num) {
		this.page.size = Number($num);
		this.setPage({ offset: 0 });
	}

	stringfy(obj) {
		return JSON.stringify(obj);
	}
	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}

	upsert(_data: Department, isEdit: boolean) {
		return this.httpVerb(this.getUrl(isEdit), _data, isEdit);
	}

	// async upsert(_data: Department, isEdit: boolean): Promise<UMResponse<Department>> {
	// 	return this.httpVerb(this.getUrl(isEdit), _data, isEdit).toPromise();
	// }

	httpVerb(url, data, isEdit = false) {
		return isEdit
			? // ? this.http.put<UMResponse<Department>>(url, data)
			this.requestService.sendRequest(
				DepartmentUrlsEnum.Deparments_list_PUT,
				'PUT',
				REQUEST_SERVERS.fd_api_url,
				data,
			)
			: // : this.http.post<UMResponse<Department>>(url, data);
			this.requestService.sendRequest(
				DepartmentUrlsEnum.Departments_list_POST,
				'POST',
				REQUEST_SERVERS.fd_api_url,
				data,
			);
	}

	getUrl(isEdit): string {
		// return isEdit ? 'update_department' : 'add_department';
		return isEdit
			? DepartmentUrlsEnum.Deparments_list_PUT
			: DepartmentUrlsEnum.Departments_list_POST;
	}

	checkInputs(){
		if (isEmptyObject(this.searchForm.value)) {
			return true;
		  }
		  return false;
	}

	closeDepartment(){

		if (this.departmentForm.dirty && this.departmentForm.touched) {
			this.CanDeactivateModelComponentService.canDeactivate().then(res => {
				if (res) {
					this.departmentForm.reset();
					this.modalRef.close();
				} else {
					return true;
				}
			});
		} else {
			this.departmentForm.reset();
			this.modalRef.close();
		}

	}

	departmentHistoryStats(row) {
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
			this.localStorage.setObject('departmentMasterTableList' + this.storageData.getUserId(), data);
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
		this.departmentListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.departmentListTable._internalColumns.sort(function (a, b) {
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
