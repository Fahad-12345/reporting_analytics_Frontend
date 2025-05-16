import { DatePipeFormatService } from './../../../../shared/services/datePipe-format.service';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { NgbModalOptions, NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '@appDir/front-desk/fd_shared/services/http.service';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';
import { Page } from '@appDir/front-desk/models/page';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { Subscription } from 'rxjs';
import {
	unSubAllPrevious,
	parseHttpErrorResponseObject,
} from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { ParamQuery, OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { EmploymentByUrlsEnum } from './employmentBy-urls-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { Title } from '@angular/platform-browser';
import { AclService } from '@appDir/shared/services/acl.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { checkReactiveFormIsEmpty, getIdsFromArray, isEmptyObject, isObjectEmpty, makeDeepCopyArray } from '@appDir/shared/utils/utils.helpers';
import { environment } from 'environments/environment';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
@Component({
	selector: 'app-employment-by',
	templateUrl: './employment-by.component.html',
	styleUrls: ['./employment-by.component.scss'],
})
export class EmploymentByComponent extends PermissionComponent implements OnInit, OnDestroy {
	subscription: Subscription[] = [];
	employmentByForm: FormGroup;
	searchEmployment: FormGroup;
	modalRef: NgbModalRef;
	getEmploymentBy: any[] = [];
	selection = new SelectionModel<Element>(true, []);
	totalRows: number;
	creatingFormValue: any;
	updateResponse: any[] = [];
	createResponse: any[] = [];
	editableRow: any;
	public submitText: string = 'Save';
	arr: any = [];
	page: Page;
	loadSpin: boolean = false;
	modalTitle: String = 'Add ';
	disableBtn: boolean = false;
	queryParams: ParamQuery;
	environment= environment;
	isCollapsed:boolean = false;
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('empByList') empByListTable: DatatableComponent;
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
	empByListingTable: any;

	constructor(
		private fb: FormBuilder,
		private modalService: NgbModal,
		private http: HttpService,
		private customDiallogService : CustomDiallogService,
		private toastrService: ToastrService,
		private fd_service: FDServices,
		protected requestService: RequestService,
		titleService: Title,
		private _route: ActivatedRoute,
		aclService: AclService,
		public datePipeService: DatePipeFormatService,
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
	}

	ngOnInit() {
		this.setTitle();
		// this.titleService.setTitle(this._route.snapshot.data['title']);
		this.employmentByForm = this.initialEmploymentByForm();
		//this.getAllEmoploymentBy(this.page.pageNumber, this.page.size);

		this.searchEmployment = this.fb.group({
			name: [''],
			comments: ['']
		});

		this.subscription.push(
			this._route.queryParams.subscribe((params) => {
				this.searchEmployment.patchValue(params);
				this.page.size = parseInt(params.per_page) || 10;
				this.page.pageNumber = parseInt(params.page) || 1;
			}),
		);
		this.setPage({ offset: this.page.pageNumber - 1 || 0 });
		this.empByListingTable = this.localStorage.getObject('empByMasterTableList' + this.storageData.getUserId());
	}

	ngAfterViewInit() {
		if (this.empByListTable?._internalColumns) {
			this.columns = makeDeepCopyArray([...this.empByListTable._internalColumns]);
			this.columns.forEach(element => {
				if(this.empByListingTable?.length) {
					let obj = this.empByListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.empByListingTable?.length) {
				const nameToIndexMap = {};
				this.empByListingTable.forEach((item, index) => {
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
		this.page.pageNumber = pageInfo.offset;
		const pageNumber = this.page.pageNumber + 1;
		const filters = checkReactiveFormIsEmpty(this.searchEmployment);
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

		this.getAllEmoploymentBy({ ...this.queryParams, ...filters });
	}

	addUrlQueryParams(params?) {
		this.location.replaceState(
			this.router.createUrlTree([], { queryParams: params, }).toString()
		);
	}
	getAllEmoploymentBy(queryParams) {
		this.loadSpin = true;
		this.subscription.push(
			this.requestService
				.sendRequest(
					EmploymentByUrlsEnum.EmploymentBy_list_GET,
					'GET',
					REQUEST_SERVERS.fd_api_url,
					queryParams,
				)
				.subscribe(
					(res) => {
						this.loadSpin = false;
						if (res['status']) {
							this.getEmploymentBy = res['result'] && res['result'].data ? res['result'].data : [];
							this.page.totalElements = res['result'].total;
							this.page.totalPages = this.page.totalElements / this.page.size;
						}
						this.selection.clear();
					},
					(err) => {
						this.loadSpin = false;
						// const str = parseHttpErrorResponseObject(err.error.message);
						// this.toastrService.error(str);
						this.selection.clear();
					},
				),
		);
	}

	isAllSelected() {
		this.totalRows = this.getEmploymentBy.length;
		const numSelected = this.selection.selected.length;
		const numRows = this.totalRows;
		return numSelected === numRows;
	}
	masterToggle() {
		this.isAllSelected()
			? this.selection.clear()
			: this.getEmploymentBy.slice(0, this.totalRows).forEach((row) => this.selection.select(row));
	}

	initialEmploymentByForm() {
		return this.fb.group({
			id: '',
			name: ['', Validators.required],
			comments: [''],
		});
	}
	createOpenModal(employmentByFrom) {
		this.employmentByForm.reset();
		this.submitText = 'Save & Continue';
		this.modalTitle = 'Add ';
		this.employmentByForm.controls['name'].enable();
		this.EmploymentbyOpenModal(employmentByFrom);
	}
	EmploymentbyOpenModal(employmentByFrom) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc',
		};
		this.modalRef = this.modalService.open(employmentByFrom, ngbModalOptions);
	}
	onSubmit(fromValue) {
		if (this.employmentByForm.valid) {
			this.disableBtn = true;
			this.creatingFormValue = this.employmentByForm.getRawValue();
			if (this.creatingFormValue.id > 0) {
				this.subscription.push(
					// this.http.post('update-employed-by', this.creatingFormValue)
					this.requestService
						.sendRequest(
							EmploymentByUrlsEnum.EmploymentBy_list_PUT,
							// 'PUT',
							'POST',
							REQUEST_SERVERS.fd_api_url,
							this.creatingFormValue,
						)
						.subscribe(
							(resp: any) => {
								this.setPage({ offset: this.page.pageNumber ? this.page.pageNumber: 0  });
								this.disableBtn = false;
								this.selection.clear();
								this.modalRef.close();
								this.toastrService.success(
									'Updated successfully',
									'Success',
								);
							},
							(err) => {
								// const str = parseHttpErrorResponseObject(err.error.message);
								// this.toastrService.error(str);
								this.disableBtn = false;
							},
						),
				);
			} else {
				this.subscription.push(
					// this.http.post('add-employed-by', this.creatingFormValue)
					this.requestService
						.sendRequest(
							EmploymentByUrlsEnum.EmploymentBy_list_POST,
							'POST',
							REQUEST_SERVERS.fd_api_url,
							this.creatingFormValue,
						)
						.subscribe(
							(resp) => {
								this.createResponse = resp['data'];
								this.setPage({ offset: 0 });
								this.disableBtn = false;
								this.selection.clear();
								this.modalRef.close();
								this.toastrService.success('Added successfully', 'Success');
							},
							(err) => {
								// const str = parseHttpErrorResponseObject(err.error.message);
								// this.toastrService.error(str);
								this.disableBtn = false;
							},
						),
				);
			}
		} else {
			this.fd_service.touchAllFields(this.employmentByForm);
		}
	}
	editEmploymentBy(employmentByFrom, row) {
		this.editableRow = row;
		this.modalTitle = 'Edit ';
		this.submitText = 'Update';
		this.setForm(this.editableRow);
		// this.employmentByForm.controls['name'].disable();
		this.EmploymentbyOpenModal(employmentByFrom);
	}

	setForm(value) {
		this.employmentByForm.patchValue({
			id: value.id,
			name: value.name,
			comments: value.comments,
		});
	}
	deleteOneRecord(id: any) {

		this.arr[0] = id;
		const temp = {
			id: this.arr,
		};
		this.customDiallogService.confirm('Delete Confirmation?', `Are you sure you want to delete?`,'Yes','No')
		.then((confirmed) => {
			if (confirmed){
			// this.http.post('delete-employed-by', temp)
			this.requestService
			.sendRequest(
				EmploymentByUrlsEnum.EmploymentBy_list_DELETE,
				'DELETE_WITH_BODY',
				REQUEST_SERVERS.fd_api_url,
				temp,
			)
			.subscribe(
				(resp) => {
					const response = resp;
					if (response['status']) {
						this.getEmploymentBy = this.getEmploymentBy.filter(
							(employment) => employment.id !== id,
						);
						this.toastrService.success(
							'Employment By has been Deleted successfully',
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
	deleteMultiple() {
		const selected = this.selection.selected;
		const arra: any = [];
		for (let p = 0; p < selected.length; p++) {
			arra[p] = selected[p].id;
		}
		const temp = {
			id: arra,
		};
		this.customDiallogService.confirm('Delete Confirmation?', 'You want to delete all records','Yes','No')
		.then((confirmed) => {
			if (confirmed){
			// this.http.post('delete-employed-by', temp)
			this.requestService
			.sendRequest(
				EmploymentByUrlsEnum.EmploymentBy_list_DELETE,
				'DELETE_WITH_BODY',
				REQUEST_SERVERS.fd_api_url,
				temp,
			)
			.subscribe(
				(response) => {
					if (response['status']) {
						this.setPage({ offset: this.page.pageNumber });
						this.selection.clear();
						this.toastrService.success(
							'Success',
							'Selected Employment By has been deleted successfully',
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

	resetSearchFilter() {
		this.searchEmployment.reset();
		this.selection.clear();
		this.setPage({ offset: 0 });
	}
	pageLimit($num) {
		this.page.size = Number($num);
		this.setPage({ offset: 0 });
	}

	stringfy(obj) {
		return JSON.stringify(obj);
	}

	closeModal() {
		if (this.employmentByForm.dirty && this.employmentByForm.touched) {
			this.CanDeactivateModelComponentService.canDeactivate().then(res => {
				if (res) {
					this.employmentByForm.reset();
					this.modalRef.close();
				} else {
					return true;
				}
			});
		} else {
			this.employmentByForm.reset();
			this.modalRef.close();
		}
	}
	isDisabledSaveContinue() {
		if(this.employmentByForm.invalid || this.loadSpin || this.disableBtn) {
			return true;
		}
		return false;
	}
	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}

	checkInputs(){
		if (isEmptyObject(this.searchEmployment.value)) {
			return true;
		  }
		  return false;
	}

	employmentByHistoryStats(row) {
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
			this.localStorage.setObject('empByMasterTableList' + this.storageData.getUserId(), data);
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
		this.empByListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.empByListTable._internalColumns.sort(function (a, b) {
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
