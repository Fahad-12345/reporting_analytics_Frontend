import { DatePipeFormatService } from './../../../../shared/services/datePipe-format.service';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { NgbModalRef, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UMResponse } from '../models/um.response.model';
import { HttpService } from '@appDir/front-desk/fd_shared/services/http.service';
import { UserRole } from './user-roles.model';
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
import { UserRolesUrlsEnum } from './UserRoles-Urls-Enum';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { checkReactiveFormIsEmpty, getIdsFromArray, isEmptyObject, isObjectEmpty, makeDeepCopyArray } from '@appDir/shared/utils/utils.helpers';
import { environment } from 'environments/environment';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
@Component({
	selector: 'app-user-roles',
	templateUrl: './user-roles.component.html',
	styleUrls: ['./user-roles.component.scss']
})
export class UserRolesComponent extends PermissionComponent implements OnInit, OnDestroy { 
	subscription: Subscription[] = [];
	public userRoles: UserRole[];
	public userRole: UserRole;
	public editAbleUserRole: UserRole;
	public totalSelected = 0;
	radioValYes = true;
	radioValNo = false;
	// Modal
	public submitText: string = 'Save';
	public headerText: string = 'Add UserRole';
	public modalRef: NgbModalRef;

	// Form
	userRoleForm: FormGroup;
	filterForm: FormGroup;
	totalRows: number;
	isEdit: boolean = false;
	loading: boolean = false;
	loadSpin: boolean = false;
	disableBtn: boolean = false;

	// Pagination
	page: Page;
	pageNumber: any;
	selection = new SelectionModel<UserRole>(true, []);
	selecting = new SelectionModel<UserRole>(true, []);
	queryParams: ParamQuery;
	environment= environment;
	isCollapsed:boolean = false;
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('rolesList') userRolesListTable: DatatableComponent;
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
	userRolesListingTable: any;

	constructor(
		aclService: AclService,
		private http: HttpService,
		private fb: FormBuilder,
		private modalService: NgbModal,
		private customDiallogService : CustomDiallogService,
		private toastrService: ToastrService,
		private fd_service: FDServices,
		protected requestService: RequestService,
		titleService: Title,
		private _route: ActivatedRoute,
		router: Router,
		private location: Location,
		public datePipeService: DatePipeFormatService,
		private CanDeactivateModelComponentService: CanDeactivateModelComponentService,
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
		this.filterForm = this.fb.group({
			name: ['', Validators.required],
			comment: [''],
			qualifier:['']
		});
		this.userRoleForm = this.initializeForm();
		//this.fetchList();
		this.totalSelected = this.selection.selected.length;
		this.subscription.push(
			this._route.queryParams.subscribe((params) => {
				this.filterForm.patchValue(params);
				this.page.pageNumber = parseInt(params.page) || 1;
				this.page.size = parseInt(params.per_page) || 10
			}),
		);
		this.setPage({ offset: this.page.pageNumber - 1 });
		this.userRolesListingTable = this.localStorage.getObject('userRolesMasterTableList' + this.storageData.getUserId());
	}
	ngAfterViewInit() {
		if (this.userRolesListTable?._internalColumns) {
			this.columns = makeDeepCopyArray([...this.userRolesListTable._internalColumns]);
			this.columns.forEach(element => {
				if(this.userRolesListingTable?.length) {
					let obj = this.userRolesListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.userRolesListingTable?.length) {
				const nameToIndexMap = {};
				this.userRolesListingTable.forEach((item, index) => {
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
	setPage(pageInfo) {
		let pageNum;
		this.selection.clear();
		pageNum = pageInfo.offset;
		this.page.pageNumber = pageInfo.offset;
		const pageNumber = this.page.pageNumber + 1;
		let filters = checkReactiveFormIsEmpty(this.filterForm);
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

	getFilteredRoles(form) {
		if (this.filterForm.valid) {
			this.filterRole(form);
			this.selection.clear();
		} else {
			this.fd_service.touchAllFields(this.filterForm);
		}
	}
	onResetFilters() {
		this.filterForm.reset();
		this.setPage({ offset: 0 });
		this.selection.clear();
	}

	filterRole(form) {
		this.loadSpin = true;

		this.subscription.push(
			this.http.post<UMResponse<UserRole[]>>('search-role-by-name', form).subscribe(
				(resp) => {
					this.loadSpin = false;
					const { data } = resp;
					this.page.totalElements = data.length;
					// if (this.page.totalElements > 10) {
					// 	this.page.size = this.page.totalElements;
					// }
					this.userRoles = data;
					this.userRoles.map((x) => {
						if (x.medical_identifier === 1) {
							return (x.medical_identifier = true);
						} else if (x.medical_identifier === 0) {
							return (x.medical_identifier = false);
						}
					});
					this.selection.clear();
				},
				(err) => {
					// const str = parseHttpErrorResponseObject(err.error.message);
					// this.toastrService.error(str);
				},
			),
		);
	}

	fetchList(queryParams) {
		this.loadSpin = true;
		this.subscription.push(
			this.requestService
				.sendRequest(
					UserRolesUrlsEnum.UserRoles_list_GET,
					'GET',
					REQUEST_SERVERS.fd_api_url,
					queryParams,
				)
				.subscribe(
					(data: any) => {
						if (data.status) {
							this.loadSpin = false;
							this.userRoles = data && data.result && data.result.data ? data.result.data : [];
							this.page.totalElements = data.result.total;
							this.userRoles.map((x) => {
								if (x.medical_identifier === 1) {
									return (x.medical_identifier = true);
								} else if (x.medical_identifier === 0) {
									return (x.medical_identifier = false);
								}
							});
						}
					},
					(err) => {
						// const str = parseHttpErrorResponseObject(err.error.message);
						// this.toastrService.error(str);
					},
				),
		);
	}

	onSubmit() {
		debugger;
		if (this.userRoleForm.valid) {
			this.loading = true;
			this.disableBtn = true;
			let form = this.userRoleForm.getRawValue();
			if (form.medical_identifier === true) {
				form.medical_identifier = 1;
				this.userRole = form;
			} else {
				form.medical_identifier = 0;
				this.userRole = form;
			}
			form.can_finalize=form.can_finalize?1:0
			form.has_supervisor=form.has_supervisor?1:0

			// console.log('final value is', form);

			let url: string = 'add_role';
			if (this.isEdit) {
				url = 'update_role';
				this.userRole.id = this.editAbleUserRole.id;
			}

		

			this.subscription.push(
				this.httpVerb(url, this.userRole, this.isEdit).subscribe(
					(res: any) => {
						// this.userRoleForm.reset();
						const { data: userRole } = res;
						// const data  = res['data'];

						// console.log(userRole);

						this.userRoles = this.isEdit
							? this.remove(this.userRoles, this.editAbleUserRole.id, 'UserRole_id', userRole)
							: [userRole, ...this.userRoles].slice();
						this.selection.clear();
						this.setPage({ offset: this.page.pageNumber });
						this.userRoleForm.reset();
						this.modalRef.close();
						this.loading = false;
						this.disableBtn = false;
						this.toastrService.success(`Successfully ${this.isEdit ? 'Updated' : 'Added'}`, 'Success');
						this.userRoleForm.reset();
					},
					(err) => {
						
						this.loading = false;
						this.disableBtn = false;
						this.userRoleForm.reset();
					},
				),
			);

		
		} else {
			this.fd_service.touchAllFields(this.userRoleForm);
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
			name: ['', [Validators.required]],
			qualifier: [''],
			comment: [''],
			medical_identifier: false,
			has_supervisor:false,
			can_finalize:false
		});
	}

	setForm(userRole: UserRole) {
		// const temp = userRole.medical_identifier;
		this.userRoleForm.patchValue({
			name: userRole.name,
			comment: userRole.comment,
			medical_identifier: userRole.medical_identifier,
			qualifier: userRole.qualifier,
			has_supervisor:userRole.has_supervisor?userRole.has_supervisor:0,
			can_finalize:userRole.can_finalize?userRole.can_finalize:0,
		});
		
	}

	resetForm() {
		this.userRoleForm.reset();
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
		this.totalRows = this.userRoles.length;

		return this.selection.selected.length === this.totalRows;
	}

	masterToggle() {
		this.isAllSelected()
			? this.selection.clear()
			: this.userRoles.slice(0, this.totalRows).forEach((row) => this.selection.select(row));
	}

	edit(modal, userRole: UserRole) {
		this.editAbleUserRole = userRole;

		this.isEdit = true;
		this.submitText = 'Update';
		this.headerText = 'Edit User Role';
		// this.userRoleForm.controls['name'].disable();
		this.setForm(this.editAbleUserRole);
		this.openModal(modal);
	}

	save(modal) {
		this.userRoleForm.controls['name'].enable();
		this.isEdit = false;
		this.submitText = 'Save & Continue';
		this.headerText = 'Add User Role';
		this.resetForm();

		this.openModal(modal);
	}

	deleteOne(id) {
		this.customDiallogService.confirm('Delete Confirmation?', `Are you sure you want to delete?`,'Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
				// this.http.delete<UMResponse<UserRole>>(`delete_role/${id}`)
				this.requestService
				.sendRequest(
					UserRolesUrlsEnum.UserRoles_list_DELETE + id,
					'DELETE',
					REQUEST_SERVERS.fd_api_url,
				)
				.subscribe(
					(resp) => {
						// const { message } = resp;
						if (resp['status'] === true || resp['status'] === 200) {
							this.userRoles = this.userRoles.filter((userRole) => userRole.id !== id);
							this.toastrService.success('Successfully deleted', 'Success');
							this.selection.clear();
						}
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
			// this.http.deleteMultiple(`delete_multiple_roles`, ids)
			this.requestService
			.sendRequest(
				UserRolesUrlsEnum.UserRoles_list_DeleteMultiple,
				'DELETE',
				REQUEST_SERVERS.fd_api_url,
				ids,
			)
			.subscribe(
				(resp) => {
					if (resp['status'] === true || resp['status'] === 200) {
						this.userRoles = this.removeMultipleFromArr(this.userRoles, ids, 'id');
						this.selection.clear();
						this.toastrService.success(
							'Selected user role deleted successfully.',
							'Success',
						);
					}
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

	private removeMultipleFromArr<T>(data: T[], toBeDeleted: number[], key): T[] {
		return data.filter(
			(row) => row[`${key}`] !== toBeDeleted.find((element) => row[`${key}`] === element),
		);
	}

	private httpVerb(url, data, isEdit = false) {
		return isEdit
			? //  ? this.http.put<UMResponse<UserRole>>(url, data)
			this.requestService.sendRequest(
				UserRolesUrlsEnum.UserRoles_list_PUT,
				'PUT',
				REQUEST_SERVERS.fd_api_url,
				data,
			)
			: // : this.http.post<UMResponse<UserRole>>(url, data);
			this.requestService.sendRequest(
				UserRolesUrlsEnum.UserROles_list_POST,
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
		if (this.userRoleForm.dirty && this.userRoleForm.touched) {
			this.CanDeactivateModelComponentService.canDeactivate().then(res => {
				if (res) {
					this.userRoleForm.reset();
					this.modalRef.close();
				} else {
					return true;
				}
			});
		} else {
			this.userRoleForm.reset();
			this.modalRef.close();
		}
	}

	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}

	checkInputs(){
		if (isEmptyObject(this.filterForm.value)) {
			return true;
		  }
		  return false;
	}

	canDeactivate() {
		return (this.userRoleForm.touched && this.userRoleForm.dirty);
	}

	userRoleHistoryStats(row) {
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
			this.localStorage.setObject('userRolesMasterTableList' + this.storageData.getUserId(), data);
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
		this.userRolesListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.userRolesListTable._internalColumns.sort(function (a, b) {
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
