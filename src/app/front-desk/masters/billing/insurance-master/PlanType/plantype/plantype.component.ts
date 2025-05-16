import { DatePipeFormatService } from './../../../../../../shared/services/datePipe-format.service';


import { Component, OnInit,  OnDestroy, ViewChild } from '@angular/core';
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
import {  unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { PlanTypeUrlsEnum } from '../PlanType-Urls-enum';
import { Location, LocationStrategy } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { checkReactiveFormIsEmpty, getIdsFromArray, isEmptyObject, isObjectEmpty, makeDeepCopyArray, whitespaceFormValidation } from '@appDir/shared/utils/utils.helpers';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';


@Component({
	selector: 'app-plantype',
	templateUrl: './plantype.component.html',
	styleUrls: ['./plantype.component.scss']
})
export class PlantypeComponent extends PermissionComponent implements OnInit, OnDestroy {
	subscription: Subscription[] = [];
	InsuranceShown: boolean = true;
	planNameShown: boolean = true;
	planTypeShown: boolean = true;
	loadSpin: boolean = false;

	planTypeRows: any[]; // for plan type mat checkboxes
	planTypeTotalRows: number; // for plan type mat checkboxes
	planTypeData: any[] = [];
	planTypePage: Page;
	queryParamsPlanType: ParamQuery;
	planTypeSelection = new SelectionModel<Element>(true, []); // for plan type selection

	delMultiple: number;
	locationForm: FormGroup;
	modalRef: NgbModalRef;
	refresh: Subject<any> = new Subject();
	searchForm: FormGroup;
	exchangeData: any[] = [];
	searchPlanType: FormGroup;
	searchedRequestData: any[] = [];


	planTypeCreateform: FormGroup; // formn plan-type create form
	planTypeEditform: FormGroup; // edit form for plan type
	isCollapsed:boolean =false;
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('planTypeList') planTypeListTable: DatatableComponent;
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
	planTypeListingTable: any;
	
	constructor(
		private fdService: FDServices,
		aclService: AclService,
		private fb: FormBuilder,
		public datePipeService: DatePipeFormatService,
		private modalService: NgbModal,
		private http: HttpService,
		router: Router,
		private toaster: ToastrService,
		protected requestService: RequestService,
		private _route: ActivatedRoute,
		private location: Location, 
		private locationStratgy: LocationStrategy,
		titleService: Title,
		private CanDeactivateModelComponentService: CanDeactivateModelComponentService,
		protected storageData: StorageData,
		private localStorage: LocalStorage
		) {
		super(aclService, router, _route, requestService, titleService);
		this.planTypePage = new Page();
		this.planTypePage.pageNumber = 0;
		this.planTypePage.size = 10;

	}

	ngOnInit() {
		this.setTitle();
		// this.titleService.setTitle(this._route.snapshot.data['title']);
		this.searchPlanType = this.initializePlanType();
		this.subscription.push(
			this._route.queryParams.subscribe((params) => {
				this.searchPlanType.patchValue(params);
				this.planTypePage.pageNumber = parseInt(params.page) || 1;
				this.planTypePage.size = parseInt(params.per_page) || 10;
			}),
		);
		this.planTypeSetPage({ offset: this.planTypePage.pageNumber - 1 || 0 });
		this.planTypeCreateform = this.fb.group({
			plan_type: ['', [Validators.required, whitespaceFormValidation()]],
			comments: [''],
		});
		this.planTypeEditform = this.fb.group({
			id: [''],
			plan_type: ['', [Validators.required]],
			comments: [''],
		});
		this.planTypeListingTable = this.localStorage.getObject('planTypeMasterTableList' + this.storageData.getUserId());
	}
	ngAfterViewInit() {
		if (this.planTypeListTable?._internalColumns) {
			this.cols = makeDeepCopyArray([...this.planTypeListTable._internalColumns]);
			this.cols.forEach(element => {
				if(this.planTypeListingTable?.length) {
					let obj = this.planTypeListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.planTypeListingTable?.length) {
				const nameToIndexMap = {};
				this.planTypeListingTable.forEach((item, index) => {
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
	resetModel() {
		if ((this.planTypeEditform.dirty && this.planTypeEditform.touched) || (this.planTypeCreateform.dirty && this.planTypeCreateform.touched)) {
			this.CanDeactivateModelComponentService.canDeactivate().then(res => {
				let result = res;
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
	resetData() {
		this.addUrlQueryParams();
		this.planTypeCreateform.reset();
		this.planTypeEditform.reset();
		this.modalRef.close();
	}
	planTypestringfy(obj) {
		return JSON.stringify(obj);
	}

	initializePlanType() {
		return this.fb.group({
			plan_type: [''],
			comments: ['']
		});
	}
	planTypeReset() {
		this.searchPlanType.reset();
		this.planTypeSetPage({ offset: 0 });
		this.clearPlanTypeSelection();
	}
	isPlanTypeSelected() {
		this.planTypeTotalRows = this.planTypeData.length;
		// console.log("plan type total rows", this.planTypeTotalRows);
		const numSelected = this.planTypeSelection.selected.length;

		const numRows = this.planTypeTotalRows;
		return numSelected === numRows;
	}
	masterPlanTypeToggle() {
		this.isPlanTypeSelected()
			? this.planTypeSelection.clear()
			: this.planTypeData
				.slice(0, this.planTypeTotalRows)
				.forEach((row) => this.planTypeSelection.select(row));
		// console.log('multiple selected', this.delMultiple)
	}
	plantypeOpenModel(planTypeCreate) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc',
		};
		this.modalRef = this.modalService.open(planTypeCreate, ngbModalOptions);
	}

	onPlanTypeSubmit(form) {
		this.loadSpin = true;
		if (this.planTypeCreateform.valid) {
			this.subscription.push(
				this.requestService
					.sendRequest(
						PlanTypeUrlsEnum.PlanType_list_POST,
						'POST',
						REQUEST_SERVERS.billing_api_url,
						form,
					)
					.subscribe(
						(data: any) => {
							if (data.status) {
								this.isPlanTypeSelected();
								this.planTypeReset();
								this.resetData();
								this.loadSpin = false;
								this.planTypeCreateform.reset();
								this.modalRef.close();
								this.toaster.success('Successfully added', 'Success');
						
							}
						},
						(err) => {
							this.loadSpin = false;
							// const str = parseHttpErrorResponseObject(err.error.message);
							// this.toaster.error(str);
						},
					),
			);
		}
	}

	editPlanTypeRow(editPlanTypeForm, row, rowIndex) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc',
		};
		// this.planTypeEditform.get('plan_type').disable();
		this.planTypeEditform.patchValue({
			id: row.id,
			plan_type: this.planTypeData[rowIndex].plan_type,
			comments: this.planTypeData[rowIndex].comments,
		});

		this.modalRef = this.modalService.open(editPlanTypeForm, ngbModalOptions);
	}

	updatePlantypeRow(form) {
		this.loadSpin = true;
		this.subscription.push(
			this.requestService
				.sendRequest(
					PlanTypeUrlsEnum.PlanType_list_PATCH,
					'PATCH',
					REQUEST_SERVERS.billing_api_url,
					form,
				)
				.subscribe(
					(data: any) => {
						if (data.status === 200) {
							this.loadSpin = false;
							this.isPlanTypeSelected();
							this.planTypeReset();
							this.resetData();
							this.toaster.success('Successfuuly updated', 'Success');
							this.planTypeSetPage({ offset: 0 });
							// this.loadSpin = false;
							this.modalRef.close();
						}
					},
					(err) => {
						this.loadSpin = false;
						// const str = parseHttpErrorResponseObject(err.error.message);
						// this.toaster.error(str);
					},
				),
		);

	}
	planTypePageLimit($num) {
		this.planTypePage.size = Number($num);
		this.planTypeSetPage({ offset: 0 });
	}

	planTypeSetPage(pageInfo) {
		let pageNum;
		this.clearPlanTypeSelection();
		pageNum = pageInfo.offset;
		this.planTypePage.pageNumber = pageInfo.offset;
		const planTypePageNumber = this.planTypePage.pageNumber + 1;
		let filters = checkReactiveFormIsEmpty(this.searchPlanType);
		this.queryParamsPlanType = {
			filter: !isObjectEmpty(filters),
			order: OrderEnum.ASC,
			per_page: this.planTypePage.size,
			page: planTypePageNumber,
			pagination: true,
			order_by: 'plan_type'
		};
		if (this.searchPlanType.valid) {

			let per_page = this.planTypePage.size;
			let queryParams = { plan_type: this.searchPlanType.value.plan_type, per_page, page: planTypePageNumber };
			this.addUrlQueryParams(queryParams);
		}
		this.displayPlanTypeUpdating({ ...this.queryParamsPlanType, ...filters });
	}
	addUrlQueryParams(params?) {
		this.location.replaceState(
			this.router.createUrlTree([], { queryParams: params, }).toString()
		);
	}
	displayPlanTypeUpdating(queryParamsPlanType) {
		this.loadSpin = true;
		// for plan type
		this.subscription.push(
			this.requestService
				.sendRequest(
					PlanTypeUrlsEnum.PlanType_list_GET,
					'GET',
					REQUEST_SERVERS.billing_api_url,
					queryParamsPlanType,
				)
				.subscribe(
					(data: any) => {
						this.planTypeData = data && data.result ? data.result.data : [];
						this.planTypePage.totalElements = data && data.result.total ? data.result.total : 0;
						this.loadSpin = false;
					},
					(err) => {
						// const str = parseHttpErrorResponseObject(err.error.message);
						// this.toaster.error(str);
					},
				),
		);
	}
	stringfy(obj) {
		return JSON.stringify(obj);
	}
	clearPlanTypeSelection() {
		this.planTypeSelection.clear();
	}

	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}

	// functions of plan type starts from here

	checkInputs(){
		if (isEmptyObject(this.searchPlanType.value)) {
			return true;
		  }
		  return false;
	}
	isDisabledSaveContinue() {
		if (this.planTypeCreateform.invalid || this.loadSpin) {
			return true;
		  }
		  return false;
	}
	isDisabledUpdate() {
		if(this.planTypeEditform.invalid || this.loadSpin) {
			return true;
		} 
		return false;
	}

	planTypeHistoryStats(row) {
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
			this.localStorage.setObject('planTypeMasterTableList' + this.storageData.getUserId(), data);
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
		this.planTypeListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.planTypeListTable._internalColumns.sort(function (a, b) {
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
