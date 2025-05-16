import { Component, OnInit, ViewChild } from '@angular/core';
import { AclService } from '@appDir/shared/services/acl.service';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { AddFeeScheduleComponentComponent } from '../add-fee-schedule-component/add-fee-schedule-component.component';
import { FeeSchecdulerServiceService } from '../services/fee-schecdule-service.service';
import { ParamQuery, OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { Page } from '@appDir/front-desk/models/page';
import { SelectionModel } from '@angular/cdk/collections';
import { FeeScheduleModel } from '../../Models/FeeSchedule.model';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router'
import { Location, LocationStrategy } from '@angular/common'
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { RequestService } from '@appDir/shared/services/request.service';
import { changeDateFormat } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { getIdsFromArray, isEmptyObject, makeDeepCopyArray, removeEmptyAndNullsFormObject } from '@appDir/shared/utils/utils.helpers';
import { EnumApiPath, EnumSearch, SearchedKeys } from '@appDir/front-desk/billing/Models/searchedKeys-modal';
import { map, Subject } from 'rxjs';
import { ShareAbleFilter } from '@appDir/shared/models/share-able-filter';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { environment } from 'environments/environment';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { FeeScheduleEnum } from '../FeeSchedule.enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
@Component({
	selector: 'app-fee-schedule-component',
	templateUrl: './fee-schedule-component.component.html',
	styleUrls: ['./fee-schedule-component.component.scss']
})
export class FeeScheduleComponentComponent extends PermissionComponent implements OnInit {

	environment = environment;

	constructor(
		aclService: AclService,
		private modal: NgbModal,
		private feeSchedule: FeeSchecdulerServiceService,
		private fb: FormBuilder,
		private customDiallogService: CustomDiallogService,
		private toasterService: ToastrService,
		private _route: ActivatedRoute, router: Router,
		protected requestService: RequestService,
		public datePipeService: DatePipeFormatService,
		titleService: Title,
		private location: Location,
		private locationStratgy: LocationStrategy,
		public feeScheduleService: FeeSchecdulerServiceService,
		protected storageData: StorageData,
		private localStorage: LocalStorage,
		private modalService: NgbModal,
	) {
		super(aclService, router, _route, requestService, titleService);
	}
	//==========================
	searchedKeys: SearchedKeys = new SearchedKeys();
	fee_types = []
	lstCaseTypes: Array<any> = []
	lstVisitTypes: Array<any> = []
	lstModifiers = []
	lstPractice = []
	lstSpeciality = []
	lstRegion = []
	allRegion = []
	lstTypeOfService = []
	lstPlaceOfService = []
	allPlaceOfService = []
	lstEmployer = []
	lstCodeTypelst = []
	lstInsurance = []
	codes = []
	lstProvider = []
	lstPracticeWithLocations = [] //array of practice locations
	allPracticeWithLocations = []
	lstPicklist = []
	visit_types = []
	plan_names = []

	//==========================
	rows = []
	page: Page = new Page()
	selection = new SelectionModel<any>(true, []);
	filterForm: FormGroup;
	isCollapsed = false;
	public loadSpin: boolean = false;
	selectedMultipleFieldFiter: any = {
		fee_type_id: [],
		modifier_id: [],
		provider_id: [],
		speciality_id: [],
		facility_location_id: [],
		employer_name: [],
		insurance_ids: [],
		case_type_ids: [],
		visit_type_ids: [],
	};
	EnumApiPath = EnumApiPath;
	eventsSubject: Subject<any> = new Subject<any>();

	@ViewChild('CustomizeColumnModal') CustomizeColumnModal: ModalDirective;
	@ViewChild('feeScheduleList') feeScheduleListTable: DatatableComponent;
	customizedColumnComp: CustomizeColumnComponent;
	@ViewChild(CustomizeColumnComponent) set con(con: CustomizeColumnComponent) {
		if (con) { // initially setter gets called with undefined
			this.customizedColumnComp = con;
		}
	}
	modalCols: any[] = [];
	cols: any[] = [];
	alphabeticColumns: any[] = [];
	colSelected: boolean = true;
	isAllFalse: boolean = false;
	feeScheduleListingTable: any;
	singleFeeSchedule: any;


	ngOnInit() {
		this.setTitle();
		this.initFilterForm();
		this.page.pageNumber = 1
		// this.page.size = 10
		this._route.queryParams.subscribe(params => {
			this.page.size = params.per_page || 10;
			this.filterForm.patchValue(removeEmptyAndNullsFormObject(params));
		})
		this.onFilterSubmit()
		this.feeScheduleListingTable = this.localStorage.getObject('feeScheduleMasterTableList' + this.storageData.getUserId());
	}
	ngAfterViewInit() {
		if (this.feeScheduleListTable?._internalColumns) {
			this.cols = makeDeepCopyArray([...this.feeScheduleListTable._internalColumns]);
			this.cols.forEach(element => {
				if (this.feeScheduleListingTable?.length) {
					let obj = this.feeScheduleListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if (this.feeScheduleListingTable?.length) {
				const nameToIndexMap = {};
				this.feeScheduleListingTable.forEach((item, index) => {
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
	   * get fee type listing
	   */
	getFeeType() {
		return this.feeScheduleService.getFeeType()
	}
	/**
	 * get picklist listing
	 */
	getPicklist() {
		this.feeScheduleService.getPicklist().subscribe(res => {
			if (res) {
				this.lstPicklist = res['result']['data']
			}
		})
	}
	searchCodeType(event) {
		let codeTypeData = { name: event.target.value }
		this.feeScheduleService.getCodeType(codeTypeData).subscribe(res => {
			if (res) {
				this.lstCodeTypelst = res['result']['data']
			}
		})
	}
	searchCaseType(value) {
		this.feeScheduleService.getCaseType(value.target.value)
			.pipe(
				map(val => {
					return val['result']['data']
				})).subscribe(data => {
					this.lstCaseTypes = [...data]
				})
	}
	searchFeeType(value) {
		let feedata = { name: value.target.value }
		this.feeScheduleService.getFeeType(feedata).pipe(map(val => {
			return val['result']['data']
		})).subscribe(data => {
			this.fee_types = [...data]
		})
	}
	searchModifier(value) {
		this.feeScheduleService.searchModifiers(value.target.value)
			.pipe(
				map(val => {
					return val['result']['data']
				})).subscribe(data => {
					this.lstModifiers = [...data]
				})
	}
	searchVisitType(value) {
		let visitData = { name: value.target.value }
		this.feeScheduleService.getVisitType(visitData).subscribe(res => {
			if (res) {
				this.lstVisitTypes = res['result']['data']
			}
		})
	}
	searchRegion(value) {
		let data = { name: value.target.value }
		this.feeScheduleService.searchRegion(data).subscribe(res => {
			if (res) {
				this.lstRegion = res['result']['data']
			}
		})
	}
	searchSpeciality(value = '', page = 1, paginationType = 'search', speciality?) {
		this.searchedKeys.specialityName.searchKey = value;
		this.searchedKeys.specialityName.page = page;
		const body = {
			per_page: 10,
			page: page
		}
		let specialityResp;
		if (value.length > this.searchedKeys.minChar || paginationType == EnumSearch.InitSearch || paginationType == EnumSearch.ScrollSearch) {
			this.feeScheduleService.searchSpeciality(value, undefined, body)
				.pipe(
					map(val => {
						specialityResp = val;
						return val['result']['data']
					})).subscribe(data => {
						if (paginationType == 'search') {
							this.lstSpeciality = [];
							this.searchedKeys.specialityName.lastPage = this.searchedKeys.last_page;
						}
						let result = data;
						this.searchedKeys.specialityName.lastPage = specialityResp.result.last_page;
						this.lstSpeciality = [...this.lstSpeciality, ...result];
					})
		}
	}
	getMoreSpecialities() {
		if (this.searchedKeys.specialityName.page != this.searchedKeys.specialityName.lastPage) {
			this.searchSpeciality(this.searchedKeys.specialityName.searchKey, this.searchedKeys.specialityName.page + this.searchedKeys.page, 'scroll');
		}
	}
	getMoreSpecialitiesOpen() {
		if (this.lstSpeciality.length == 0) {
			this.searchSpeciality('', this.searchedKeys.page, EnumSearch.InitSearch);
		}
	}
	searchPractice(value = '', page = 1, paginationType = 'search', practice?) {
		this.searchedKeys.practiceLocation.searchKey = value;
		this.searchedKeys.practiceLocation.page = page;
		const body = {
			per_page: 10,
			page: page
		}
		if (value.length > this.searchedKeys.minChar || paginationType == EnumSearch.InitSearch || paginationType == EnumSearch.ScrollSearch) {
			this.feeScheduleService.searchPractice(value, body).subscribe(res => {
				if (res) {
					if (paginationType == 'search') {
						this.lstPracticeWithLocations = [];
						this.searchedKeys.practiceLocation.lastPage = this.searchedKeys.last_page;
					}
					let result = res['result']['data']
					this.searchedKeys.practiceLocation.lastPage = res.result.last_page;
					this.lstPracticeWithLocations = [...this.lstPracticeWithLocations, ...result];
				}
			})
		}
	}
	getMorePracticeLocation() {
		if (this.searchedKeys.practiceLocation.page != this.searchedKeys.practiceLocation.lastPage) {
			this.searchPractice(this.searchedKeys.practiceLocation.searchKey, this.searchedKeys.practiceLocation.page + this.searchedKeys.page, 'scroll');
		}
	}
	getMorePracticeLocationOpen() {
		if (this.lstPracticeWithLocations.length == 0) {
			this.searchPractice('', this.searchedKeys.page, EnumSearch.InitSearch);
		}
	}
	searchProvider(value = '', page = 1, paginationType = 'search', provider?) {
		this.searchedKeys.providerName.searchKey = value;
		this.searchedKeys.providerName.page = page;
		const body = {
			per_page: 10,
			page: page
		}
		let searchProviderResp;
		if (value.length > this.searchedKeys.minChar || paginationType == EnumSearch.InitSearch || paginationType == EnumSearch.ScrollSearch) {
			this.feeScheduleService.searchProvider(value, undefined, body)
				.pipe(
					map(val => {
						searchProviderResp = val;
						return val['result']['data']
					})).subscribe(data => {
						// this.lstProvider = data
						let result = data.map((res => {
							return { id: res.id, name: res.first_name + ' ' + res.middle_name + ' ' + res.last_name }
						}))
						if (paginationType == 'search') {
							this.lstProvider = [];
							this.searchedKeys.providerName.lastPage = this.searchedKeys.last_page;
						}
						this.searchedKeys.providerName.lastPage = searchProviderResp.result.last_page;
						this.lstProvider = [...this.lstProvider, ...result];
					})
		}
	}
	getMoreProviders() {
		if (this.searchedKeys.providerName.page != this.searchedKeys.providerName.lastPage) {
			this.searchProvider(this.searchedKeys.providerName.searchKey, this.searchedKeys.providerName.page + this.searchedKeys.page, 'scroll');
		}
	}
	getMoreProvidersOpen() {
		if (this.lstProvider.length == 0) {
			this.searchProvider('', this.searchedKeys.page, EnumSearch.InitSearch);
		}
	}
	// lstEmployer:any[]
	searchEmployer(value) {
		this.feeScheduleService.searchEmployer({ name: value.target.value }).pipe(map(val => val['result']['data']))
			.subscribe((data: any) => {
				this.lstEmployer = data
			})
	}

	searchInsurance(value) {
		this.feeScheduleService.searchInsurance(value.target.value)
			.pipe(
				map(val => val['result']['data']))
			.subscribe((data: any) => {
				this.lstInsurance = data
			})
	}

	searchPlaceOfService(value) {
		let data = { name: value.target.value }
		this.feeScheduleService.searchPlaceOfService(data).subscribe(res => {
			if (res) {
				this.lstPlaceOfService = res['result']['data']
			}
		})
	}
	searchPlanName(value) {
		let data = { plan_name: value.target.value }
		this.feeScheduleService.getPlanName(data).subscribe(res => {
			if (res) {
				this.plan_names = res['result']['data']
			}
		})
	}

	/**
	 * on page change
	 * @param event 
	 */
	onPageChange(event) {
		this.page.pageNumber = event.offset + 1
		this.getFeeSchedule(this.createQueryParams())
	}
	/**
	 * set query params
	 */
	createQueryParams() {
		let filters = removeEmptyAndNullsFormObject(this.filterForm.value)
		return { pagination: true, page: this.page.pageNumber, per_page: this.page.size, filter: filters.length > 0, order: OrderEnum.ASC, ...filters }

	}
	/**
	 * set pagination
	 * @param event 
	 */
	setPage(event) {
		this.page.size = event.target.value
		this.page.pageNumber = 1
		this.getFeeSchedule(this.createQueryParams())
	}
	/**
	 * set filter form
	 */
	initFilterForm() {
		this.filterForm = this.fb.group({

			code_type_id: [''],
			code_name: [''],
			description: [''],
			base_price: [null],
			expected_reimbursement: [''],
			units: [''],
			ndc_quantity: [''],
			fee_type_id: [],
			modifier_id: [],
			case_type_id: [''],
			visit_type_id: [''],
			provider_id: [],
			speciality_id: [],
			facility_location_id: [],
			region_id: [],
			place_of_service_id: [],
			insurance_name: [''],
			insurance_start_date: [''],
			insurance_end_date: [''],
			employer_name: [],
			employer_id:[],
			employer_start_date: [''],
			employer_end_date: [''],
			plan_id: [],
			comments: [''],
			insurance_ids: [''],
			case_type_ids: [''],
			visit_type_ids: [''],
		})
	}
	/**
	 * search from filter
	 * @param form 
	 */
	submitFilterForm(form) {
		var paramQuery: ParamQuery = { pagination: true, order: OrderEnum.ASC, page: this.page.pageNumber, per_page: this.page.size, filter: true }
		this.getFeeSchedule({ ...paramQuery, ...form })
	}
	lstFeeSchedule: Array<FeeScheduleModel> = []
	/**
	 * add feeSchedule
	 */
	addFeeSchedule() {
		var modalRef = this.modal.open(AddFeeScheduleComponentComponent, { size: 'xl', backdrop: 'static' })
		modalRef.result.then((shouldReload) => {
			if (shouldReload) {
				var paramQuery: ParamQuery = { pagination: true, page: this.page.pageNumber, per_page: this.page.size, filter: false, order: OrderEnum.ASC }

				this.getFeeSchedule({ ...paramQuery, ...removeEmptyAndNullsFormObject(this.filterForm.value) })
			}
		})
	}
	/**
	 * update feeSchedule
	 * @param feeSchedule 
	 */
	updateFeeSchedule(feeSchedule: FeeScheduleModel) {
		this.subscription.push(
			this.requestService.sendRequest(FeeScheduleEnum.Fee_list_GET + '/' + feeSchedule?.id, 'get', REQUEST_SERVERS.fd_api_url).subscribe(res => {
				this.singleFeeSchedule = res?.result?.data;
				var modalRef = this.modal.open(AddFeeScheduleComponentComponent, { size: 'xl', backdrop: 'static' })
				modalRef.componentInstance.feeSchedule = this.singleFeeSchedule;
				modalRef.result.then((shouldReload) => {
					if (shouldReload) {
						var paramQuery: ParamQuery = { pagination: true, page: this.page.pageNumber, per_page: this.page.size, filter: false, order: OrderEnum.ASC }
						this.getFeeSchedule({ ...paramQuery, ...removeEmptyAndNullsFormObject(this.filterForm.value) })
					}
				})
			})
		)
	}
	/**
	 * get feeSchedule listing
	 * @param paramQuery 
	 */
	getFeeSchedule(paramQuery) {
		this.addUrlQueryParams(paramQuery);
		this.loadSpin = true;
		this.feeSchedule.getFeeSchedule(paramQuery).subscribe(data => {
			if (data['status'] == 200 || data['status'] == true) {
				this.loadSpin = false;
				this.lstFeeSchedule = data['result']['data'] ? data['result']['data'] : [];
				this.selection.clear();
				this.page.totalElements = data['result']['total'] ? data['result']['total'] : 0;
			}
		})
	}
	masterToggle(event) {
		if (event.checked) {
			this.selection.clear()
			this.lstFeeSchedule.forEach(schedule => {
				this.selection.toggle(schedule);
			})
		} else {
			this.selection.clear()
		}
	}
	/**
	 * delete multiple feeSchedule
	 */
	deleteMultipleFiles() {

		this.customDiallogService.confirm('Delete', 'Are you sure you want to delete the selected fee schedules', 'Yes', 'No')
			.then((confirmed) => {

				if (confirmed) {
					this.feeSchedule.deleteFeeSchedule(this.selection.selected.map(selected => {
						return selected.id
					})).subscribe(data => {
						if (data['status'] == 200) {
							this.toasterService.success('Fee Schedule successfully deleted', 'Success')
							this.selection.clear()
							this.getFeeSchedule(this.createQueryParams())
						} else {
							this.toasterService.error(data['message'], data['status'])
						}
					})
				}
			})
			.catch();
	}
	/**
	 * delete single feeSchedule
	 * @param feeSchedule 
	 */
	deleteFeeSchedule(feeSchedule: FeeScheduleModel) {
		this.customDiallogService.confirm('Delete', 'Are you sure you want to delete this fee schedule', 'Yes', 'No')
			.then((confirmed) => {

				if (confirmed) {
					this.feeSchedule.deleteFeeSchedule([feeSchedule.id]).subscribe(data => {
						if (data['status'] == 200) {
							this.toasterService.success('Fee Schedule successfully deleted', 'Success')
							this.getFeeSchedule(this.createQueryParams())
						} else {
							this.toasterService.error(data['message'], data['status'])
						}
					})
				}
			})
			.catch();

	}
	/**
	 * set query param
	 */
	onFilterSubmit() {
		this.page.pageNumber = 1
		var paramQuery: ParamQuery =
			{ filter: true, pagination: true, page: this.page.pageNumber, per_page: this.page.size, order: OrderEnum.ASC };
		let queryParams = this.filterForm.value
		queryParams['employer_start_date'] ? queryParams['employer_start_date'] = changeDateFormat(queryParams['employer_start_date']) : ""
		queryParams['employer_end_date'] ? queryParams['employer_end_date'] = changeDateFormat(queryParams['employer_end_date']) : ''
		queryParams['insurance_start_date'] ? queryParams['insurance_start_date'] = changeDateFormat(queryParams['insurance_start_date']) : ''
		queryParams['insurance_end_date'] ? queryParams['insurance_end_date'] = changeDateFormat(queryParams['insurance_end_date']) : ''
		this.getFeeSchedule({ ...paramQuery, ...removeEmptyAndNullsFormObject(queryParams) });
	}
	/**
	 * add query params
	 * @param params 
	 */
	addUrlQueryParams(params?) {
		this.location.replaceState(
			this.router.createUrlTree([], { queryParams: params, }).toString()
		);
	}
	/**
	 * reset form
	 */
	resetForm() {
		this.addUrlQueryParams();
		this.filterForm.reset()
		this.page.pageNumber = 1;
		this.getFeeSchedule(this.createQueryParams())
		this.isCollapsed = false;
		this.eventsSubject.next(true);
	}
	reduceFunc(arr: any[]) {
		if (!arr) { return '' }
		let result = arr.reduce((names, provider, currentIndex) => {
			return `${names} ${currentIndex ? ',' : ''} ${provider.first_name + ' ' + (provider.middle_name || '') + ' ' + provider.last_name + '' + `${provider.email ? "(" + provider.email + ')' : ''}`}`
		}, '')
		return result
	}
	modifierToolTip(arr: any[]) {
		if (!arr) { return '' }
		return arr.reduce((names, modifier, currentIndex) => {
			return `${names} ${currentIndex ? ',' : ''} ${modifier?.name}`
		}, '')

	}
	practiceTooltip(arr: any[]) {
		if (!arr) { return '' }
		return arr.reduce((names, speciality, currentIndex) => {
			return `${names} ${currentIndex ? ',' : ''} ${speciality.facility_full_name}`
		}, '')

	}

	caseTypeTooltip(arr: any[]) {
		if (!arr) { return '' }
		return arr.reduce((names, caseType, currentIndex) => {
			return `${names} ${currentIndex ? ',' : ''} ${caseType.name}`
		}, '')
	}

	visitTypeTooltip(arr: any[]) {
		if (!arr) { return '' }
		return arr.reduce((names, visitType, currentIndex) => {
			return `${names} ${currentIndex ? ',' : ''} ${visitType.name}`
		}, '')
	}

	specialityTooltip(arr: any[]) {
		if (!arr) { return '' }
		return arr.reduce((names, speciality, currentIndex) => {
			return `${names} ${currentIndex ? ',' : ''} ${speciality.name}`
		}, '')
	}

	checkInputs() {
		if (isEmptyObject(this.filterForm.value)) {
			return true;
		}
		return false;
	}
	selectionOnValueChange(e: any, Type?) {
		const info:any = new ShareAbleFilter(e);
		if(info?.employer_name?.length){
			info['employer_id']=info?.employer_name;
			delete info?.employer_name;
		}
		this.filterForm.patchValue(removeEmptyAndNullsFormObject(info));
		if (!e.data) {
			this.filterForm.controls[Type].setValue(null);
		}
	}


	feeScheduleHistoryStats(row) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc body-scroll history-modal',
			modalDialogClass: 'modal-lg'
		};
		let modelRef = this.modalService.open(CreatedHistoryComponent, ngbModalOptions);
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
			if (obj) {
				this.modalCols.push({ header: element?.name, checked: obj?.checked });
			}
		});
		this.CustomizeColumnModal.show();
	}

	onConfirm(click) {
		if (this.isAllFalse && !this.colSelected) {
			this.toasterService.error('At Least 1 Column is Required.', 'Error');
			return false;
		}
		if (click) {
			this.customizedColumnComp;
			this.modalCols = makeDeepCopyArray(this.customizedColumnComp?.modalCols)
			let data: any = [];
			this.modalCols.forEach(element => {
				if (element?.checked) {
					data.push(element);
				}
				let obj = this.alphabeticColumns.find(x => x?.name === element?.header);
				if (obj) {
					if (obj.name == element.header) {
						obj.checked = element.checked;
					}
				}
			});
			this.localStorage.setObject('feeScheduleMasterTableList' + this.storageData.getUserId(), data);
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
		this.feeScheduleListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.feeScheduleListTable._internalColumns.sort(function (a, b) {
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
		if (!isChecked) {
			this.isAllFalse = true;
		}
	}

	onSingleSelection(isChecked) {
		this.isAllFalse = isChecked;
		if (isChecked) {
			this.colSelected = false;
		}
	}

}
