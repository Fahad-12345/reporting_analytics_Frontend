import { DatePipeFormatService } from './../../../../shared/services/datePipe-format.service';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModalRef, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '@appDir/front-desk/fd_shared/services/http.service';
import { EmploymentType } from './employment-type.model';
import { ToastrService } from 'ngx-toastr';
import { SelectionModel } from '@angular/cdk/collections';
import { Page } from '@appDir/front-desk/models/page';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { ParamQuery, OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { EmploymentUrlsEnum } from './employment-urls-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { Title } from '@angular/platform-browser';
import { HttpSuccessResponse, StorageData } from '@appDir/pages/content-pages/login/user.class';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { checkReactiveFormIsEmpty, getIdsFromArray, isEmptyObject, isObjectEmpty, makeDeepCopyArray } from '@appDir/shared/utils/utils.helpers';
import { environment } from 'environments/environment';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
@Component({
	selector: 'app-employment-type',
	templateUrl: './employment-type.component.html',
	styleUrls: ['./employment-type.component.scss']
})
export class EmploymentTypeComponent extends PermissionComponent implements OnInit {

	public employmentTypes: EmploymentType[];
	public employmentType: EmploymentType;
	public editAbleemploymentType: EmploymentType;
	public totalSelected = 0;
	searchForm: FormGroup;
	loadSpin: boolean = false;
	// Modal
	public submitText: string = 'Save';
	public headerText: string = 'Add EmploymentType';
	public modalRef: NgbModalRef;

	// Form
	employmentTypeForm: FormGroup;
	totalRows: number;
	isEdit: boolean = false;
	loading: boolean = false;
	disableBtn: boolean = false;
	queryParams: ParamQuery;

	// Pagination
	page: Page;

	selection = new SelectionModel<EmploymentType>(true, []);
	selecting = new SelectionModel<EmploymentType>(true, []);
	environment= environment;
	isCollapsed:boolean =false;
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('empTypeList') empTypeListTable: DatatableComponent;
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
	empTypeListingTable: any;

	constructor(
		aclService: AclService,
		router: Router,
		private http: HttpService,
		private fb: FormBuilder,
		private modalService: NgbModal,
		private customDiallogService : CustomDiallogService,
		private toastrService: ToastrService,
		private fd_service: FDServices,
		protected requestService: RequestService,
		titleService: Title,
		private _route: ActivatedRoute,
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
		this.employmentTypeForm = this.initializeForm();
		this.searchForm = this.fb.group({
			name: [''],
			description:['']
		});
		this.subscription.push(
			this._route.queryParams.subscribe((params) => {
				this.searchForm.patchValue(params);
				this.page.pageNumber = parseInt(params.page) || 1;
				this.page.size = parseInt(params.per_page) || 10;
			}),
		);
		this.setPage({ offset: this.page.pageNumber - 1 || 0 });
		this.totalSelected = this.selection.selected.length;
		this.empTypeListingTable = this.localStorage.getObject('empTypeMasterTableList' + this.storageData.getUserId());
	}

	ngAfterViewInit() {
		if (this.empTypeListTable?._internalColumns) {
			this.columns = makeDeepCopyArray([...this.empTypeListTable._internalColumns]);
			this.columns.forEach(element => {
				if(this.empTypeListingTable?.length) {
					let obj = this.empTypeListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.empTypeListingTable?.length) {
				const nameToIndexMap = {};
				this.empTypeListingTable.forEach((item, index) => {
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
		if (pageNum !== pageInfo.offset) {
			this.selection.clear();
		}
		pageNum = pageInfo.offset;

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
					EmploymentUrlsEnum.Employment_list_GET,
					'GET',
					REQUEST_SERVERS.fd_api_url,
					queryParams,
				)
				.subscribe(
					(resp: HttpSuccessResponse) => {
						this.loadSpin = false;
						// this.employmentTypes = resp['result'] && resp['result'].data ? resp['result'].data : [];
						this.employmentTypes = resp.result.data;
						this.page.totalElements = resp['result'].total;
						this.page.totalPages = this.page.totalElements / this.page.size;
					},
					(err) => {
						// const str = parseHttpErrorResponseObject(err.error.message);
						// this.toastrService.error(str);
						this.loadSpin = false;
					},
				),
		);
	}

	onSubmit() {
		if (this.employmentTypeForm.valid) {
			this.loading = true;
			this.disableBtn = true;
			this.employmentType = this.employmentTypeForm.getRawValue();

			let url: string = 'add_employment_type';
			if (this.isEdit) {
				url = 'update_employment_type';
				this.employmentType.employment_type_id = this.editAbleemploymentType.employment_type_id;
			}

			this.subscription.push(
				this.httpVerb(url, this.employmentType, this.isEdit).subscribe(
					(res: any) => {
						const { message, data: employmentType } = res;
						this.setPage({ offset: this.isEdit ? this.page.pageNumber : 0 });

						this.employmentTypes = this.isEdit
							? this.remove(
								this.employmentTypes,
								this.editAbleemploymentType.employment_type_id,
								'employment_type_id',
								employmentType,
							)
							: [employmentType, ...this.employmentTypes].slice();

						this.selection.clear();
						this.employmentTypeForm.reset();
						this.modalRef.close();
						this.loading = false;

						this.disableBtn = false;

						this.toastrService.success(`Successfully ${this.isEdit?'Updated':'Added'}`, 'Success');
					},
					(err) => {
						// const str = parseHttpErrorResponseObject(err.error.message);
						// this.toastrService.error(str);
						this.disableBtn = false;
					},
				),
			);
		} else {
			this.fd_service.touchAllFields(this.employmentTypeForm);
		}
	}

	private remove<T>(arr: T[], id: number, key: string, item: T): T[] {
		const _arr = [...arr];

		const index = arr.findIndex((row) => row[`${key}`] === id);
		_arr.splice(index, 1, item);

		return _arr.filter(elem => {
			if (elem)
				return elem;
		});
	}

	private initializeForm() {
		return this.fb.group({
			id: [''],
			name: ['', [Validators.required]],
			description: [''],
		});
	}

	setForm(employmentType: EmploymentType) {
		this.employmentTypeForm.patchValue({
			id: employmentType['id'],
			// employment_type_name: employmentType.employment_type_name,
			name: employmentType.name,
			description: employmentType.description,
		});
	}

	resetForm() {
		this.employmentTypeForm.reset();
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
		this.totalRows = this.employmentTypes.length;

		return this.selection.selected.length === this.totalRows;
	}

	masterToggle() {
		this.isAllSelected()
			? this.selection.clear()
			: this.employmentTypes.slice(0, this.totalRows).forEach((row) => this.selection.select(row));
	}

	edit(modal, employmentType: EmploymentType) {
		this.editAbleemploymentType = employmentType;

		this.isEdit = true;
		this.submitText = 'Update';
		this.headerText = 'Edit Employment Type';
		this.setForm(this.editAbleemploymentType);
		// this.employmentTypeForm.controls['employment_type_name'].disable();
		// this.employmentTypeForm.controls['name'].disable();
		this.openModal(modal);
	}

	save(modal) {
		this.isEdit = false;
		this.submitText = 'Save & Continue';
		this.headerText = 'Add Employment Type';
		this.resetForm();
		// this.employmentTypeForm.controls['employment_type_name'].enable();
		this.employmentTypeForm.controls['name'].enable();
		this.openModal(modal);
	}

	deleteOne(id) {
		this.customDiallogService.confirm('Delete Confirmation?', `Are you sure you want to delete?`,'Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
			// this.http.delete<UMResponse<EmploymentType>>(`delete_employment_type/${id}`)
			this.requestService
			.sendRequest(
				EmploymentUrlsEnum.Employment_list_DELETE_ById + id,
				'DELETE',
				REQUEST_SERVERS.fd_api_url,
			)
			.subscribe(
				(resp) => {
					this.selection.clear();
					const { message } = resp['message'];
					this.employmentTypes = this.employmentTypes.filter(
						(employmentType) => employmentType.employment_type_id !== id,
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
		// ;
		const selected = this.selection.selected;
		const ids = selected.map((row) => row.employment_type_id);
		this.customDiallogService.confirm('Delete Confirmation?', `Are you sure you want to delete?`,'Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
			// this.http.deleteMultiple(`delete_multiple_employment`, ids)
			this.requestService
			.sendRequest(
				EmploymentUrlsEnum.Employment_list_DELETEMultiple,
				'DELETE_WITH_BODY',
				REQUEST_SERVERS.fd_api_url,
				ids,
			)
			.subscribe(
				(resp) => {
					this.employmentTypes = this.removeMultipleFromArr(
						this.employmentTypes,
						ids,
						'employment_type_id',
					);
					this.selection.clear();
					this.toastrService.success(
						'Employment Type has been deleted successfully.',
						'Success',
					);
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
			? // ? this.http.put<UMResponse<EmploymentType>>(url, data)
			this.requestService.sendRequest(
				EmploymentUrlsEnum.Employment_list_PUT,
				'PUT',
				REQUEST_SERVERS.fd_api_url,
				data,
			)
			: // : this.http.post<UMResponse<EmploymentType>>(url, data);
			this.requestService.sendRequest(
				EmploymentUrlsEnum.Employment_list_POST,
				'POST',
				REQUEST_SERVERS.fd_api_url,
				data,
			);
	}

	PageLimit($num, b?) {
		this.page.size = Number($num);
		this.setPage({ offset: 0 });
	}

	checkInputs(){
		if (isEmptyObject(this.searchForm.value)) {
			return true;
		  }
		  return false;
	}

	closeModal() {
		if (this.employmentTypeForm.dirty && this.employmentTypeForm.touched) {
			this.CanDeactivateModelComponentService.canDeactivate().then(res => {
				if (res) {
					this.employmentTypeForm.reset();
					this.modalRef.close();
				} else {
					return true;
				}
			});
		} else {
			this.employmentTypeForm.reset();
			this.modalRef.close();
		}
	}

	employmentTypeHistoryStats(row) {
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
			this.localStorage.setObject('empTypeMasterTableList' + this.storageData.getUserId(), data);
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
		this.empTypeListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.empTypeListTable._internalColumns.sort(function (a, b) {
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
