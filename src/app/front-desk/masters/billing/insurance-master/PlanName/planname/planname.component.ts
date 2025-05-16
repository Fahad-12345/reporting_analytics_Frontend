import { DatePipeFormatService } from './../../../../../../shared/services/datePipe-format.service';
import { Component, OnInit, Input, OnDestroy, ViewChild } from '@angular/core';
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
import { PlanNameUrlsEnum } from '../PlanName-Urls-enum';
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { Title } from '@angular/platform-browser';
import { Location, LocationStrategy } from '@angular/common'
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { checkReactiveFormIsEmpty, getIdsFromArray, isEmptyObject, isObjectEmpty, makeDeepCopyArray, whitespaceFormValidation } from '@appDir/shared/utils/utils.helpers';	
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
@Component({
	selector: 'app-planname',
	templateUrl: './planname.component.html',
	styleUrls: ['./planname.component.scss']
})
export class PlannameComponent extends PermissionComponent implements OnInit, OnDestroy {
	subscription: Subscription[] = [];
	InsuranceShown: boolean = true;
	planNameShown: boolean = true;
	planTypeShown: boolean = true;
	loadSpin: boolean = false;

	planNameRows: any[]; // for plan name mat checkboxes
	planTotalRows: number; // for plan name mat checkboxes
	planNamePage: Page;
	queryParamsPlanname: ParamQuery;
	planSelection = new SelectionModel<Element>(true, []); // for plan name selection

	delMultiple: number;
	locationForm: FormGroup;
	modalRef: NgbModalRef;
	refresh: Subject<any> = new Subject();
	searchForm: FormGroup;
	exchangeData: any[] = [];
	searchPlanType: FormGroup;
	searchedRequestData: any[] = [];
	planNameData: any[] = [];
	planNameCreateform: FormGroup; // for plan Name
	editPlanNameform: FormGroup; // for edit plan name
	isCollapsed:boolean = false;
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('planNameList') planNameListTable: DatatableComponent;
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
	planNameListingTable: any;

	constructor(private fdService: FDServices,
		aclService: AclService,
		private fb: FormBuilder,
		private modalService: NgbModal,
		public datePipeService: DatePipeFormatService,
		private http: HttpService,
		router: Router,
		private toaster: ToastrService,
		protected requestService: RequestService,
		private _route: ActivatedRoute,
		titleService: Title,
		private location: Location, 
		private locationStratgy: LocationStrategy,
		private CanDeactivateModelComponentService: CanDeactivateModelComponentService,
		protected storageData: StorageData,
		private localStorage: LocalStorage
		) {
		super(aclService, router, _route, requestService, titleService);
		this.planNamePage = new Page();
		this.planNamePage.pageNumber = 0;
		this.planNamePage.size = 10;
	}

	ngOnInit() {
		this.setTitle();
		// this.titleService.setTitle(this._route.snapshot.data['title']);
		this.searchForm = this.planNameSearchForm();
		this.subscription.push(
			this._route.queryParams.subscribe((params) => {
				this.searchForm.patchValue(params);
				this.planNamePage.pageNumber = parseInt(params.page) || 1;
				this.planNamePage.size = parseInt(params.per_page) || 10;
			}),
		);
		this.planNameCreateform = this.fb.group({
			plan_name: ['', [Validators.required, whitespaceFormValidation()]],
			comments: [''],
		});

		this.editPlanNameform = this.fb.group({
			id: [''],
			plan_name: ['', [Validators.required, whitespaceFormValidation()]],
			comments: [''],
		});
		this.planNameSetPage({ offset: this.planNamePage.pageNumber - 1 || 0 });
		this.planNameListingTable = this.localStorage.getObject('planNameMasterTableList' + this.storageData.getUserId());
	}
	ngAfterViewInit() {
		if (this.planNameListTable?._internalColumns) {
			this.cols = makeDeepCopyArray([...this.planNameListTable._internalColumns]);
			this.cols.forEach(element => {
				if(this.planNameListingTable?.length) {
					let obj = this.planNameListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.planNameListingTable?.length) {
				const nameToIndexMap = {};
				this.planNameListingTable.forEach((item, index) => {
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
	planNameSearchForm() {
		return this.fb.group({
			plan_name: ['', Validators.required],
			comments: ['']
		});
	}
	resetPlanName() {
		this.searchForm.reset();
		this.addUrlQueryParams();
		this.planNameSetPage({ offset: 0 });
		this.clearPlanNameSelection();
	}
	clearPlanNameSelection() {
		this.planSelection.clear();
	}
	resetModel() {
		if ((this.editPlanNameform.dirty && this.editPlanNameform.touched) || (this.planNameCreateform.dirty && this.planNameCreateform.touched)) {
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
	resetData() {
		this.addUrlQueryParams();
		this.planNameCreateform.reset();
		this.editPlanNameform.reset();
		this.modalRef.close();
	}
	isPlanNameSelected() {
		this.planTotalRows = this.planNameData.length;
		const numSelected = this.planSelection.selected.length;
		const numRows = this.planTotalRows;
		return numSelected === numRows;
	}
	PlanNamestringfy(obj) {
		return JSON.stringify(obj);
	}
	masterPlanNameToggle() {
		this.isPlanNameSelected()
			? this.planSelection.clear()
			: this.planNameData
				.slice(0, this.planTotalRows)
				.forEach((row) => this.planSelection.select(row));
	}
	planNameOpenModal(planName) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc',
		};
		this.modalRef = this.modalService.open(planName, ngbModalOptions);
	}
	onPlanNameSubmit(form) {
		this.loadSpin = true;
		this.subscription.push(
			this.requestService
				.sendRequest(
					PlanNameUrlsEnum.PlanName_list_POST,
					'POST',
					REQUEST_SERVERS.billing_api_url,
					form,
				)
				.subscribe(
					(data: any) => {
						if (data.status) {
							this.planSelection.clear();
							this.resetPlanName();
							this.resetData();
							this.planNameSetPage({ offset: 0 });
							this.loadSpin = false;
							this.modalRef.close();
							this.planNameCreateform.reset();
							this.toaster.success('Successfully added', 'Success');
						}
					},
					(err) => {
						this.loadSpin = false;
					},
				),
		);
		// this.loadSpin = false;
		
	}
	editPlanName(planNameEditform, row: any, rowIndex: any) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc',
		};
		// this.editPlanNameform.get('plan_name').disable();
		this.editPlanNameform.patchValue({
			id: row.id,
			plan_name: this.planNameData[rowIndex].plan_name,
			comments: this.planNameData[rowIndex].comments,
		});
		this.modalRef = this.modalService.open(planNameEditform, ngbModalOptions);
	}

	editPlanNameSubmit(form) {
		this.searchForm.reset();
		this.loadSpin = true;
		this.subscription.push(
			this.requestService
				.sendRequest(
					PlanNameUrlsEnum.PlanName_list_PATCH,
					'PATCH',
					REQUEST_SERVERS.billing_api_url,
					form,
				)
				.subscribe(
					(data: any) => {
						if (data.status) {
							this.planSelection.clear();
							this.resetPlanName();
							this.resetData();
							this.planNameSetPage({ offset: 0 });
							this.loadSpin = false;
							this.modalRef.close();
							this.toaster.success('Successfully updated', 'Success');
						}
					},
					(err) => {
						this.loadSpin = false;
					},
				),
		);
		// this.loadSpin = false;
		// this.modalRef.close();
	}
	planNamePageLimit($num) {
		this.planNamePage.size = Number($num);
		this.planNameSetPage({ offset: 0 });
	}
	planNameSetPage(pageInfo) {
		let pageNum;
		this.clearPlanNameSelection();
		pageNum = pageInfo.offset;
		this.planNamePage.pageNumber = pageInfo.offset;
		const planNamepageNumber = this.planNamePage.pageNumber + 1;
		let filters = checkReactiveFormIsEmpty(this.searchForm);
		this.queryParamsPlanname = {
			filter: !isObjectEmpty(filters),
			order: OrderEnum.ASC,
			per_page: this.planNamePage.size,
			page: planNamepageNumber,
			pagination: true,
			order_by: 'plan_name'
		};
		// if (this.searchForm.valid) {
		let per_page = this.planNamePage.size;
		let plan_name = this.searchForm.value.plan_name;
		let queryParams = { plan_name, per_page, page: planNamepageNumber };
		this.addUrlQueryParams(queryParams);
		// }
		this.displayUpdationForPlanName({ ...this.queryParamsPlanname, ...filters });
	}

	addUrlQueryParams(params?) {
		this.location.replaceState(
			this.router.createUrlTree([], { queryParams: params, }).toString()
		);
	}
	displayUpdationForPlanName(queryParamsPlanname) {
		this.loadSpin = true;
		// for plan name
		this.subscription.push(
			this.requestService
				.sendRequest(
					PlanNameUrlsEnum.PlanNAme_list_GET,
					'GET',
					REQUEST_SERVERS.billing_api_url,
					queryParamsPlanname,
				)
				.subscribe(
					(data: any) => {
						this.planNameData =
							data && data.result ? data.result.data : [];
						this.planNamePage.totalElements = data && data.result.total ? data.result.total : 0;
						this.loadSpin = false;
					},
					(err) => {
						this.loadSpin = false;
					},
				),
		);
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
	isDisabledSaveContinue() {
		if(this.planNameCreateform.invalid || this.loadSpin) {
			return true;
		}
		return false;
	}
	isDisabledUpdate() {
		if(this.editPlanNameform.invalid || this.loadSpin) {
			return true;
		}
		return false;
	}

	planNameHistoryStats(row) {
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
			this.localStorage.setObject('planNameMasterTableList' + this.storageData.getUserId(), data);
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
		this.planNameListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.planNameListTable._internalColumns.sort(function (a, b) {
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
