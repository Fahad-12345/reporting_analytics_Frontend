import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MainService } from '@shared/services/main-service';
import { FDServices } from 'app/front-desk/fd_shared/services/fd-services.service';
import { Logger } from '@nsalaun/ng-logger';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Page } from '@appDir/front-desk/models/page';

import { Patient } from '../../../shared/types/patient';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { Observable, Subject, Subscription } from 'rxjs';
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { Location } from '@angular/common';
import { AclService } from '@appDir/shared/services/acl.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { PatientListingUrlsEnum } from './PatientListing-Urls-Enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { FieldConfig } from '@appDir/shared/dynamic-form/models/fieldConfig.model';
import { DivClass } from '@appDir/shared/dynamic-form/models/DivClass.class';
import { InputClass } from '@appDir/shared/dynamic-form/models/InputClass.class';
import { InputTypes } from '@appDir/shared/dynamic-form/constants/InputTypes.enum';
import { ButtonClass } from '@appDir/shared/dynamic-form/models/ButtonClass.class';
import { ButtonTypes } from '@appDir/shared/dynamic-form/constants/ButtonTypes.enum';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { DynamicFormComponent } from '@appDir/shared/dynamic-form/components/dynamic-form/dynamic-form.component';
import { changeDateFormat, isEmptyObject, isObjectEmpty, removeEmptyAndNullsFormObject, removeEmptyKeysFromObject } from '@appDir/shared/utils/utils.helpers';
import { getFieldControlByName } from '@appDir/shared/dynamic-form/helper';
import { Socket } from 'ngx-socket-io';
import { min } from 'date-fns';
import { NgSelectClass } from '@appDir/shared/dynamic-form/models/NgSelectClass.class';
import { EnumApiPath } from '@appDir/front-desk/billing/Models/searchedKeys-modal';



/**
 * Component patient list. Display the list of patients with filters. 
 */
@Component({
	selector: 'app-patient-list',
	templateUrl: './patient-list.component.html',
})
export class PatientListComponent extends PermissionComponent implements OnInit, OnDestroy {
	subscription: Subscription[] = [];
	public params = null;
	public patients: any[];
	public totalRows: number = 10;
	public selectedRows: Patient[];
	public selectedRowsString: string;
	public loadSpin: boolean = false;
	data: any[] = null;
	fieldConfig: FieldConfig[] = [];
	form: FormGroup;
	page: Page;
	patientCount: number;
	@ViewChild(DynamicFormComponent) component: DynamicFormComponent;
	filterFormDisabled:boolean = false;
	CreatedByPaginationSetting = {
		search:'',
		lastPage:null,
		per_page:10,
		currentPage:1,
	}
	UpdatedByPaginationSetting = {
		search:'',
		lastPage:null,
		per_page:10,
		currentPage:1,
	}
	lstCreatedBy: any[] = [];
	lstUpdatedBy: any[] = [];
	hideDelButton: boolean = false;
	eventsSubjectReset$: Subject<any> = new Subject<any>();
	updatedBySearchTypeHead$:Subject<any>=new Subject<any>();
	createdBySearchTypeHead$:Subject<any>=new Subject<any>();

	offset : any;
	/**
	 * Creates an instance of patient list component.
	 * @param aclService 
	 * @param mainService 
	 * @param fd_services 
	 * @param route 
	 * @param logger 
	 * @param titleService 
	 * @param toastrService 
	 * @param fb 
	 * @param router 
	 * @param location 
	 * @param requestService 
	 */
	constructor(aclService: AclService, private mainService: MainService, private fd_services: FDServices, public route: ActivatedRoute, private logger: Logger, titleService: Title,
		private toastrService: ToastrService, public fb: FormBuilder, router: Router, private location: Location, protected requestService: RequestService,
		private socket:Socket) {
		super(aclService, router, route, requestService, titleService);
		this.initFilters();
		this.page = new Page();
		this.page.pageNumber = 0;
		this.page.size = 10;
	}
	/**
	 * on init
	 */
	ngOnInit() {
		this.setTitle();
		this.subscription.push(
			this.route.queryParams.subscribe((params) => {
				this.form.patchValue(params);
				let obj = {...params};
				if(isNaN(obj?.page)) {
					obj.page = 1
				}
				this.params = obj;
				this.offset = this.params.page - 1;
				this.page.size = obj['per_page'] ? obj['per_page'] : 10;
				this.checkInputs();
			}),
		);
		this.setConfigration();
		this.setPage({ offset: this.offset });
	}

	/**
	 * Sets configration of dynamic forms. 
	 */
	setConfigration() {
		this.fieldConfig = [
			new DivClass([
				new DivClass([
					new DivClass([
						new InputClass('Chart ID', 'id', InputTypes.text, '', [], '', ['col-sm-4 col-md-3'], { mask: '000-00-0000', skip_validation: true }),
						new InputClass('Patient Name', 'name', InputTypes.text, '', [], '', ['col-sm-4 col-md-3']),
						new InputClass('DOB (mm/dd/yyyy)', 'dob', InputTypes.date, '', [], '', ['col-sm-4 col-md-3'], { max: new Date() }),
						new InputClass('Primary Phone', 'phone_no', InputTypes.text, '', [], '', ['col-sm-4 col-md-3'], { mask: '000-000-0000', skip_validation: true }),
					], ['display-contents']),
					new DivClass([
						new InputClass('Date of Accident From (mm/dd/yyyy)', 'accident_date_from', InputTypes.date, '', [], '', ['col-sm-4 col-md-3']),
						new InputClass('Date of Accident To (mm/dd/yyyy)', 'accident_date_to', InputTypes.date, '', [], '', ['col-sm-4 col-md-3']),
						new NgSelectClass("Created By",'created_by_ids','full_name','id', this.searchCreatedBy.bind(this), true, null, [], '', ['col-sm-7 col-md-5 col-lg-4 col-xl-3'],[],{add_tag: false, dropdownSearch: true},null,null,this.searchCreatedBy.bind(this,null,'clear'),this.onFocusSearchCreatedBy.bind(this),this.searchCratedByScrollToEnd.bind(this),this.createdBySearchTypeHead$,this.searchTypeHeadCreatedBy.bind(this),this.eventsSubjectReset$),
						new NgSelectClass("Updated By",'updated_by_ids','full_name','id', this.searchUpdatedBy.bind(this), true, null, [], '', ['col-sm-7 col-md-5 col-lg-4 col-xl-3'],[],{add_tag: false, dropdownSearch: true},null,null,this.searchUpdatedBy.bind(this,null,'clear'),this.onFocusSearchUpdatedBy.bind(this),this.searchUpdatedByScrollToEnd.bind(this),this.updatedBySearchTypeHead$,this.searchTypeHeadUpdatedBy.bind(this),this.eventsSubjectReset$),
						new InputClass('Created At (mm/dd/yyyy)', 'created_at', InputTypes.date, '', [], '', ['col-sm-4 col-md-3'], { max: new Date() }),
						new InputClass('Updated At (mm/dd/yyyy)', 'updated_at', InputTypes.date, '', [], '', ['col-sm-4 col-md-3'], { max: new Date() }),
						new DivClass([
							new ButtonClass('Filter', ['btn', 'btn-success float-right me-3'], ButtonTypes.submit),
							new ButtonClass('Reset', ['btn', 'btn-primary'], ButtonTypes.button, this.reset.bind(this), {disabled:this.filterFormDisabled,name:'resetBtn'})
						], ['col-12', 'search-filter-btn', 'd-flex justify-content-center'])
					], ['display-contents', 'hidden'],null,null,{name:'collapseDiv'})
				], ['row px-2', 'field-block']),
				new DivClass([
					new ButtonClass('', ['btn', 'btn-primary plus-btn float-right mt-0'], ButtonTypes.button, this.collapseDiv.bind(this), { icon: 'icon-plus', button_classes: ['col-2'] ,name:'collapsBtn'})
				], ['colps-btn-block']),
			], ['row', 'dynamic-filter']),
		]
	}

	collapseDiv() {
		let collapsBtnControl =  getFieldControlByName(this.fieldConfig, 'collapsBtn');
		let collapseDiv =  getFieldControlByName(this.fieldConfig, 'collapseDiv');
		if (collapsBtnControl?.configs?.icon === 'icon-plus') {
			collapsBtnControl.configs.icon = 'icon-minus'
			collapseDiv.classes = collapseDiv?.classes?.filter(className => className != 'hidden')
		} else {
			collapsBtnControl.configs.icon = 'icon-plus'
			collapseDiv?.classes?.push('hidden')
		}
	}
	onValueChanges(form) {
		if(!isEmptyObject(form)) {
			this.filterFormDisabled = false;
		} else {
			this.filterFormDisabled = true;
		}
		let ResetButtonControl =  getFieldControlByName(this.fieldConfig, 'resetBtn');
		ResetButtonControl ? ResetButtonControl.configs.disabled = this.filterFormDisabled : null;
	}

	getCreatedBy(name?, createdByid?) {
		let paramQuery: any = { filter: true, pagination: 1,page:this.CreatedByPaginationSetting.currentPage,per_page:this.CreatedByPaginationSetting.per_page,dropDownFilter:true }
		paramQuery = removeEmptyKeysFromObject(paramQuery);
		let filter = {}
		createdByid ? filter['id'] = createdByid : null
		name ? filter['name'] = name : null
		return this.requestService.sendRequest(EnumApiPath.createdByApiPath, 'get', REQUEST_SERVERS.fd_api_url, { ...paramQuery, ...filter })
	}

	searchCreatedBy(name, isClear?) {
		if(isClear)
		{
			this.lstCreatedBy=[];
			this.CreatedByPaginationSetting.currentPage=1;
			this.CreatedByPaginationSetting.search='';
		}
		return new Observable((res) => {
			this.getCreatedBy(name, '').subscribe(data => {
			this.CreatedByPaginationSetting.currentPage = parseInt(data.result.current_page);
			this.CreatedByPaginationSetting.lastPage = parseInt(data.result.last_page);
			this.CreatedByPaginationSetting.search = name;
			this.lstCreatedBy = data['result']['data'];
			res.next(this.lstCreatedBy);
			})
		})
	}

	onFocusSearchCreatedBy(name) {
		return new Observable((res) => {
			if(!this.lstCreatedBy.length)
			{
				this.getCreatedBy(name, '').subscribe(data => {
				this.CreatedByPaginationSetting.currentPage = parseInt(data.result.current_page);
				this.CreatedByPaginationSetting.lastPage = parseInt(data.result.last_page);
				this.CreatedByPaginationSetting.search = name;
				this.lstCreatedBy = data['result']['data'];
				res.next(this.lstCreatedBy);
				})
			}
			else
			{
				res.next(this.lstCreatedBy);
			}
		})
	}

	searchCratedByScrollToEnd()
	{
		return new Observable((res) => {
			if (this.CreatedByPaginationSetting.currentPage < this.CreatedByPaginationSetting.lastPage) {
				this.CreatedByPaginationSetting.currentPage += 1;
				this.CreatedByPaginationSetting.currentPage = this.CreatedByPaginationSetting.currentPage;
				this.getCreatedBy(this.CreatedByPaginationSetting.search, '').subscribe(data => {
					this.CreatedByPaginationSetting.currentPage = parseInt(data.result.current_page);
					this.CreatedByPaginationSetting.lastPage = parseInt(data.result.last_page);
					let result = data['result']['data'];
					this.lstCreatedBy = [...this.lstCreatedBy, ...result];
					res.next(this.lstCreatedBy);
				});
			}
		})		
	}

	searchTypeHeadCreatedBy(name)
	{
		this.CreatedByPaginationSetting.search=name;
		this.CreatedByPaginationSetting.currentPage=1;
		this.CreatedByPaginationSetting.lastPage=null;
		this.lstCreatedBy=[];
		return new Observable((res) => {
	
			this.getCreatedBy(name, '').subscribe(data => {
				this.CreatedByPaginationSetting.currentPage = parseInt(data.result.current_page);
				this.CreatedByPaginationSetting.lastPage = parseInt(data.result.last_page);
				this.CreatedByPaginationSetting.search = name;
				this.lstCreatedBy = data['result']['data'];
				res.next(this.lstCreatedBy);
				})
		})
	}

	getUpdatedBy(name?, createdByid?) {
		let paramQuery: any = { filter: true, pagination: 1,page:this.UpdatedByPaginationSetting.currentPage,per_page:this.UpdatedByPaginationSetting.per_page,dropDownFilter:true }
		paramQuery = removeEmptyKeysFromObject(paramQuery);
		let filter = {}
		createdByid ? filter['id'] = createdByid : null
		name ? filter['name'] = name : null
		return this.requestService.sendRequest(EnumApiPath.createdByApiPath, 'get', REQUEST_SERVERS.fd_api_url, { ...paramQuery, ...filter })
	}

	searchUpdatedBy(name,isClear?) {
		if(isClear)
		{
			this.lstUpdatedBy=[];
			this.UpdatedByPaginationSetting.currentPage=1;
			this.UpdatedByPaginationSetting.search='';
		}
		return new Observable((res) => {
			this.getUpdatedBy(name, '').subscribe(data => {
			this.UpdatedByPaginationSetting.currentPage = parseInt(data.result.current_page);
			this.UpdatedByPaginationSetting.lastPage = parseInt(data.result.last_page);
			this.UpdatedByPaginationSetting.search = name;
			this.lstUpdatedBy = data['result']['data'];
			res.next(this.lstUpdatedBy);
			})
		})
	}

	onFocusSearchUpdatedBy(name) {
		return new Observable((res) => {
			if(!this.lstUpdatedBy.length)
			{
				this.getUpdatedBy(name, '').subscribe(data => {
				this.UpdatedByPaginationSetting.currentPage = parseInt(data.result.current_page);
				this.UpdatedByPaginationSetting.lastPage = parseInt(data.result.last_page);
				this.UpdatedByPaginationSetting.search = name;
				this.lstUpdatedBy = data['result']['data'];
				res.next(this.lstUpdatedBy);
				})
			}
			else
			{
				res.next(this.lstUpdatedBy);
			}
		})
	}

	searchUpdatedByScrollToEnd()
	{
		return new Observable((res) => {
			if (this.UpdatedByPaginationSetting.currentPage < this.UpdatedByPaginationSetting.lastPage) {
				this.UpdatedByPaginationSetting.currentPage += 1;
				this.UpdatedByPaginationSetting.currentPage = this.UpdatedByPaginationSetting.currentPage;
				this.getUpdatedBy(this.UpdatedByPaginationSetting.search, '').subscribe(data => {
					this.UpdatedByPaginationSetting.currentPage = parseInt(data.result.current_page);
					this.UpdatedByPaginationSetting.lastPage = parseInt(data.result.last_page);
					let result = data['result']['data'];
					this.lstUpdatedBy = [...this.lstUpdatedBy, ...result];
					res.next(this.lstUpdatedBy);
				});
			}
		})		
	}

	searchTypeHeadUpdatedBy(name)
	{
		this.UpdatedByPaginationSetting.search=name;
		this.UpdatedByPaginationSetting.currentPage=1;
		this.UpdatedByPaginationSetting.lastPage=null;
		this.lstUpdatedBy=[];
		return new Observable((res) => {
	
			this.getUpdatedBy(name, '').subscribe(data => {
				this.UpdatedByPaginationSetting.currentPage = parseInt(data.result.current_page);
				this.UpdatedByPaginationSetting.lastPage = parseInt(data.result.last_page);
				this.UpdatedByPaginationSetting.search = name;
				this.lstUpdatedBy = data['result']['data'];
				res.next(this.lstUpdatedBy);
				})
		})
	}

	
	/**
	 * Pages limit change
	 * @param $num 
	 */
	pageLimitChange($num) {
		this.page.size = Number($num);
		this.setPage({ offset: 0 });
	}

	/**
	 * Inits filters
	 */
	initFilters() {
		this.form = this.fb.group({
			id: [''],
			name: [''],
			created_by_ids:[''],
			updated_by_ids:[''],
			dob: [''],
			accident_date_from: [''],
			accident_date_to: [''],
			created_at:[''],
			updated_at:[''],
			phone_no: [''],
		});
	}

	/**
	 * Resets filters
	 */
	resetFilters() {
		this.form.reset()
	}

	/**
	 * Resets patient list component
	 */
	 checkInputs(){
		if (isEmptyObject(this.form.value)) {
			this.filterFormDisabled = true;
		  } else { 
			  this.filterFormDisabled = false;
			}
	}
	reset() {
		this.eventsSubjectReset$.next(true);
		this.hideDelButton = true;
		this.lstCreatedBy = [];
		this.lstUpdatedBy = [];
		this.CreatedByPaginationSetting.currentPage = 1;
		this.UpdatedByPaginationSetting.currentPage = 1;
		this.resetFilters();
		this.addUrlQueryParams();
		this.setPage({ offset: 0 });
	}
	/**
	 * after view init
	 */
	ngAfterViewInit() {
		this.form = this.component.form;
		this.DateOfAccidentFromChange();
	}

	submit(pageInfo) {
		this.hideDelButton = true;
		let chart_id = this.form.value.id as string;
		if (chart_id) {
			this.form.patchValue({ id: `0`.repeat(9 - chart_id.length) + chart_id })
		}
		this.setPage(pageInfo)
	}

	DateOfAccidentFromChange() {
		this.subscription.push(
		this.form.controls['accident_date_from'].valueChanges.subscribe((date)=>{
			let control = getFieldControlByName(this.fieldConfig, 'accident_date_to');
			control.configs = date ? {min:new Date(date['_d'])} : null;
		}));
	}

	/**
	 * Populate the table with new data based on the page number
	 * @param page The page to select
	 */

	setPage(pageInfo) {
		this.loadSpin = true;
		this.page.pageNumber = pageInfo.offset;
		let pageNumber = this.page.pageNumber + 1;
		let formValue = this.form.value;
		formValue.dob = formValue.dob ? changeDateFormat(formValue.dob) : '';
		formValue.accident_date_from = formValue.accident_date_from ? changeDateFormat(formValue.accident_date_from) : '';
		formValue.accident_date_to = formValue.accident_date_to ? changeDateFormat(formValue.accident_date_to) : '';
		formValue.created_at = formValue.created_at ? changeDateFormat(formValue.created_at) : '';
		formValue.updated_at = formValue.updated_at ? changeDateFormat(formValue.updated_at) : '';
		let filters = removeEmptyAndNullsFormObject(formValue);
		let queryParams = {
			filter: !isObjectEmpty(filters),
			per_page: this.page.size,
			page: pageNumber,
			pagination: 1,
			order_by: OrderEnum.DEC,
		};
		let requestData = { ...queryParams, ...filters };
		let per_page = this.page.size;
		let queryparam = { per_page, page: pageNumber }
		this.addUrlQueryParams({ ...filters, ...queryparam });

		this.requestService.sendRequest(PatientListingUrlsEnum.Patient_V1_Get, 'get', REQUEST_SERVERS.kios_api_path, requestData).subscribe(res => {
			this.logger.log('cases data', res['data']);
			this.patients = res?.['result']?.['data'];
			this.ssnFormat(this.patients);
			// this.selection.clear();
			this.page.totalElements = res['result'] && res['result']['total'];
			this.page.totalPages = this.page.totalElements / this.page.size;
			this.loadSpin = false;
		},err => {
			this.loadSpin = false;
		})
	}

	/**
	 * Adds url query params
	 * @param [params] 
	 */
	addUrlQueryParams(params?) {
		this.location.replaceState(
			this.router.createUrlTree([], { queryParams: params, }).toString()
		);
	}

	/**
	 * Ssn format of patient list component
	 */
	ssnFormat = (data) => {
		if(data) {
			data.forEach((element) => {
				let id = element.id;
				id = String(id);
				let newstring = id
				if (id.length < 10) {
					for (let i = id.length; i < 9; i++) {
						newstring = "0" + newstring
					}
				}
				newstring = newstring.substring(0, 3) + '-' + newstring.substring(4, 6) + '-' + newstring.substring(5, 9);
				element.displaId = newstring;
			});
			this.patients = data;
		}
	};

	/**
	 * on destroy
	 */
	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}

	/**
	 * Calls when dynamic form is ready
	 * @param event 
	 */
	onReady(event: FormGroup) {
		this.form = event;
		this.form.patchValue(this.params);
	}
}
