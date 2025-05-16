import { Component, EventEmitter, Input, OnInit, Output, OnChanges, ViewChild, OnDestroy, ElementRef, SimpleChanges, AfterViewInit} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { EnumSearch } from '@appDir/front-desk/billing/Models/searchedKeys-modal';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { BehaviorSubject, Observable, of, Subject, Subscription } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap, scan } from 'rxjs/operators';
import {	MappingFilterShareableObject,
} from '../filter/model/mapping-filter-object';
import { RequestService } from '../services/request.service';
import { isArray, removeDuplicatesObject, removeEmptyAndNullsFormObjectAndBindLable } from '../utils/utils.helpers';
import * as _ from 'lodash';
import { A, DOWN_ARROW, END, ENTER, ESCAPE, F, HOME, NINE, SPACE, UP_ARROW, Z, ZERO, } from '@angular/cdk/keycodes';
import { unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';
import { isObject } from '../modules/ngx-datatable-custom/utils/common-functions';


export class SearchedKeysModel {
	page = 1;
	last_page = 0;
	minChar = 2;
	maxChar = 15;

	commonSearch?: ISearch = { searchKey: '', page: this.page,lastPage:2 };
}

export interface ISearch {
	searchKey;
	page;
	lastPage?;
}
export enum EnumCommonSearch {
	InitSearch = 'initSearch',
	ScrollSearch = 'scroll',
}

export class CommonParamModel{
	id:any;
	pom_id:any;
	packet_id:any;
	name: string;
	bill_no: any[] = [];
	bill_labels: any[] = [];
	doctor_name: string;
	invoice_name:string;
	shipping_detail:string;
	facility_location_id:string;
	aggregate_id:string;
	tax_name:string;
	case_id :string;
	insurance_name: string;
	patient_name: string;
	employer_name: string;
	attorney_name: string;
	plan_name:string;
	bindLable: string;
	payer_id:string;
	constructor(values: object={}){
		Object.assign(this, values);
		this.bindLabelForSearch();
	}

	bindLabelForSearch(){
		if(this.bindLable === 'id'){
			this.id = this.name;
			this.name = '';
			return this.id;
		}

		if(this.bindLable === 'pom_id'){
			this.pom_id = this.name;
			this.name = '';
			return this.pom_id;
		}

		if(this.bindLable === 'packet_id'){
			this.packet_id = this.name;
			this.name = '';
			return this.packet_id;
		}

		if(this.bindLable === 'name'){
			return this.name;
		}
		if(this.bindLable === 'invoice_name'){
			this.invoice_name = this.name;
			this.name = '';
			return this.invoice_name;
		}
		if(this.bindLable === 'attorney_name'){
			this.attorney_name = this.name;
			this.name = '';
			return this.attorney_name;
		}
		if(this.bindLable === 'patient_name'){
			this.patient_name = this.name;
			this.name = '';
			return this.patient_name;
		}
		if(this.bindLable === 'tax_name'){
			this.tax_name = this.name;
			this.name = '';
			return this.tax_name;
		}
		if(this.bindLable === 'facility_location_id'){
			this.facility_location_id = this.name;
			this.name = '';
			return this.facility_location_id;
		}
		
		if(this.bindLable === 'shipping_detail'){
			this.shipping_detail = this.name;
			this.name = '';
			return this.shipping_detail;
		}

		if(this.bindLable === 'bill_no'){
		  this.bill_no = this.name? [this.name]: [] ;
		  this.name = '';
		  return this.bill_no;

		}
		if(this.bindLable === 'bill_labels'){
		  this.bill_labels = this.name? [this.name]: [] ;
		  this.name = '';
		  return this.bill_labels;

		}

		if(this.bindLable === 'doctor_name'){
			this.doctor_name = this.name;
			this.name = '';
			return this.doctor_name;
		}

		if(this.bindLable === 'insurance_name'){
			this.insurance_name = this.name;
			this.name = '';
			return this.insurance_name;
		}

		if(this.bindLable === 'plan_name'){
			this.plan_name = this.name;
			this.name = '';
			return this.plan_name;
		}
		if(this.bindLable === 'case_id'){
			this.case_id = this.name;
			this.name = '';
			return this.case_id;
		}
		if(this.bindLable === 'payer_id'){
			this.payer_id = this.name;
			this.name = '';
			return this.payer_id;
		}
	}
}

@Component({
	selector: 'app-ng-select-shareable',
	templateUrl: './ng-select-shareable.component.html',
	styleUrls: ['./ng-select-shareable.component.scss'],
})
export class NgSelectShareableComponent implements OnInit,OnChanges, OnDestroy, AfterViewInit {
	public loadData:Promise<boolean>
	loading = false;
	@Input() lableName: string;
	@Input() qulifierShown:boolean = false;
	@Input() showSelectAll:boolean = false;
	@Input() showGroupBy:boolean = false;
	@Input() bindQualifierLabel:string = 'qualifier';
	@Input() multiple: boolean;
	@Input()updateChanges :boolean= false;
	@Input() isReferingPhysician:boolean=false;
	@Input() bindlable: string;
	@Input() bindId: string;
	@Input() apiPath: string;
	@Input() filterFieldName: string;
	@Input() showSelectFieldOnRefresh: any;
	@Input() showSelectFieldList: any;
	@Input() events: Observable<any>;
	@Input() updateTooltipData: boolean = false;
	@Input() searchLableName = 'name';
	@Input() closeOnSelect = false;
	@Input() isConcate = false;
	@Input() isRequiredField = false;
	@Input() concateRoleQualifier = false;
	@Input() per_page = 10;
	@Input() className: string[] = [];
	@Input() spacingNameClass: string[] = [];
	@Input() conditionalExtraApiParams: any = {};
	@Input() conditionalExtraApiParamsArr: any = {};
	@Input() ApiCallresponse: any;
	@Input() needToClearOptions:boolean=false;
	@Input() mainApiPath = REQUEST_SERVERS.fd_api_url;
	@Output() addNewRecord = new EventEmitter();
	@Output() valueChange = new EventEmitter();
	@Output() removeEmitter = new EventEmitter();
	@Output() touched = new EventEmitter();
	@Output() isOpenClose = new EventEmitter();
	@Output() apiResponseReturned = new EventEmitter();
	@Input() lists: any[] = [];
	@Input() disableField:boolean=false;
	@Input() moduleName = 'others';
	@Input() isNeedFilterParam = true;
	@Input() isNeedPaginationParam = true;
	@Input() appendTo: string;
	@Input() maxLengthName :number = 30;
	labelCheck = false;
	@Input() apiType = 'get';
	@Input() dataIndocs: boolean = false;
	@Input() showCrossIcon: boolean = true;
	searchForm: FormGroup;
	commonSearch$ = new Subject();
	@Input() searchedKeys = new SearchedKeysModel();
	selectedMultipleFieldFiter: any = {};
	classes: string;
	spacingName: string;
	@Input() updateOnRunTimeValue: Observable<any>;
	selectedItemDisplay='';
	selectedItem = [];
	@Input() loadByDefaultApi:boolean=false;
	@Input() conditionalExtraApiParamsForSelectedData: any = {};
	@Input() placeholder:string='';
	currentApiData: any;
	@Input() conditionalLists:any=[];
	@Input() multiLocations:boolean=false;
	@Input() forceApiHitonOpen : boolean = false;
	@Input() charaterLimit : boolean = false;
	@Input() removeDuplicatesfromElements : boolean = false;
	@Input() dupplicateKey :string ='template_id';
	@Input() Is_static_data : boolean = false;
	// here is define the multiselectd variabe
	options = new BehaviorSubject<string[]>([]);
	options$: Observable<string[]>;
	selectionLists: any[] = [];
	mat_loading = true;
	mat_checkbox_selection = false;
	@Input() searchingFilter = true;
	@ViewChild('allSelected') private allSelected: MatOption;
	totalRecords: number;
	selectedOptionCheckbox = true;
	selectAllCheckboxCheck = false;
	@Input() ngSelectShow: boolean = false;
	@Input() dontCallApi: boolean = false;
	@Input() customFontColor:boolean = false;
	subscription: Subscription[] = [];
	textSearch:string= '';
	appendIcon: boolean = false;
	appendCounter: number = 0;
	dropdownWidth: number =0;
	dropdownHeight: number=0;
	isSelectAllInProgress: boolean = false;
	@Input() onEditCall: boolean = true;
	@Input() clearListOnClick: boolean = false;
	@Input() isArReport: boolean = false;
	emptyString: string='';
	@Input() initialSelectedSlugs: string[] = [];

	// here is end define the multiselectd variabe
	@ViewChild('ngSelectOuter', { static: false }) ngSelectOuter: ElementRef;
	constructor(public requestService: RequestService, private fb: FormBuilder
		) {
			this.initializeSearchForm();
		}
	ngAfterViewInit(): void {
		if(this.ngSelectOuter){
			this.getDropdownDimensions();
		}
	}

	ngOnDestroy(): void {
		unSubAllPrevious(this.subscription);
	}

	ngOnInit() {
		
		if(!this.multiple && isArray(this.showSelectFieldOnRefresh)){
			this.searchForm.patchValue({ common_ids: this.showSelectFieldOnRefresh[0] });
		}else{
			//check for true  value
			if(this.showSelectFieldOnRefresh)
			   this.searchForm.patchValue({ common_ids: this.showSelectFieldOnRefresh });
		}
		if (this.showSelectFieldList && this.showSelectFieldList.length != 0 && Array.isArray(this.showSelectFieldList)) {
			this.lists = this.showSelectFieldList.map(res => 
			
				new MappingFilterShareableObject(
					this.isConcate,
					this.concateRoleQualifier,
					this.showSelectFieldList,
					res.id,
					res.template_id,
					res.name,
					res.full_Name,
					res.facility_full_name,
					res.label_id,
					res.insurance_name,
					res.employer_name,
					res.first_name,
					res.middle_name,
					res.last_name,
					res.plan_name,
					res.template_name,
					res.template_type,
					this.bindlable,
					this.bindId,
					res.qualifier,
					res,
				),
			);
			this.selectedItemDisplay = this.showSelectFieldList.map(res => res[this.bindlable]).toString();
		}
		if(this.showSelectFieldOnRefresh && this.showSelectFieldOnRefresh.length>0 && this.loadByDefaultApi)
		{
			this.selectedItemAPICallBydefault('', this.searchedKeys.page, EnumSearch.InitSearch);

		}
		if(this.loadByDefaultApi && this.initialSelectedSlugs?.length){
			this.selectedItemAPICallBydefault('', this.searchedKeys.page, EnumSearch.InitSearch);
		}
		if(this.lists?.length == 1){
			this.emptyString = '';
			for(let i in this.lists){
				this.emptyString += (this.qulifierShown ? this.lists[i]?.qualifier ? this.lists[i]?.qualifier : this.lists[i]?.realObj[this.bindQualifierLabel]: this.lists[i]?.name) + " x ";
			}
		}
		this.eventSubscriptions();
		this.typingSearch();	
		this.valueUpdateOnRunTimeRender();	
		if(this.multiLocations){
			this.setDefaultValue()
		}
	}
	formatListing(){
		this.lists = this.lists.map(res => 
			
			new MappingFilterShareableObject(
				this.isConcate,
				this.concateRoleQualifier,
				this.lists,
				res.id,
				res.template_id,
				res.name,
				res.full_Name,
				res.facility_full_name,
				res.label_id,
				res.insurance_name,
				res.employer_name,
				res.first_name,
				res.middle_name,
				res.last_name,
				res.plan_name,
				res.template_name,
				res.template_type,
				this.bindlable,
				this.bindId,
				res.qualifier,
				res
			),
		);
	}
	ngOnChanges(changes?: SimpleChanges) {
		
		this.classes = this.className.join(' ');
		this.spacingName = this.spacingNameClass.join(' ');
		if(this.searchForm)
		{
			this.enableDisableForm();

		}
		if (this.updateChanges && this.searchForm){
			this.searchForm.patchValue({ common_ids: this.showSelectFieldOnRefresh });
		}
		if(this.updateTooltipData && this.searchForm){
			this.selectedItemDisplay = this.showSelectFieldList?.map(res => res?.[this.bindlable]).toString();
		}
		if(!this.onEditCall && this.lists?.length && !this.selectedItem.length && this.showSelectFieldOnRefresh){
			if(this.filterFieldName !== "visit_status_ids"){
				this.searchForm.patchValue({ common_ids: this.showSelectFieldOnRefresh });
				this.getChange(this.lists, this.filterFieldName);
			}else{
				return
			}
		}
	}
setDefaultValue(){
	this.conditionalLists.forEach(res=>{
		if(res?.case_recipient!=false)
		this.lists.push(res)
	});
	this.lists=removeDuplicatesObject(this.lists,'id')
}
	/**
	 * Initialize 'case status' search form
	 * @param void
	 * @returns FormGroup
	 */
	initializeSearchForm() {
		this.searchForm = this.fb.group({
			common_ids: [{value:null,disabled:this.disableField}],
			search:'',
			textSearch: ''
		});
	}

	setSearchFormValue($event,value:any,emitEvent?) {
		this.searchForm.patchValue({ common_ids: value ,emitEvent:true});
		if(emitEvent)
		{
			this.valueChange.emit({
				data: $event,
				label: this.filterFieldName,
				formValue: this.searchForm.get('common_ids').value,
			});
		}

	}
	getFieldAction(status: boolean): void {
		this.labelCheck = status;
		if(!status) {
			this.controlTouched(true);
		}
		this.isOpenClose.emit(status);
	}

	enableDisableForm()
	{
		if (this.searchForm) {
			this.disableField ? 
				this.searchForm.get('common_ids').disable() : 
				this.isArReport ? 
					(this.searchForm.get('common_ids').setValue(null), this.searchForm.get('common_ids').disable()) : 
					this.searchForm.get('common_ids').enable();
		}		
	}

	apiHit(queryParams?) {
			if(!this.apiPath){
				this.loading = false;
				return;
		}
		var params: any = {
			filter: this.moduleName == 'template' ? 1 : true,
			pagination: true,
			per_page: queryParams.per_page || this.per_page,
			page: queryParams.page || 1,
			...this.conditionalExtraApiParams,
			...new CommonParamModel({'name':queryParams?.name , bindLable:  this.searchLableName })
			
		} as any;
		return this.requestService.sendRequest(
			this.apiPath,
			this.apiType,
			this.mainApiPath,
			removeEmptyAndNullsFormObjectAndBindLable(params),
		);
	}

	selectedItemAPICall(event = '', page = 1, paginationType = 'search',params?): void {
		if(!this.apiPath) {
			return
		}
		this.loading = true;
		this.searchedKeys.commonSearch.searchKey = event;
		this.searchedKeys.commonSearch.page = page;
		let body = {
			page: page || 1,
			name: event,
			...this.conditionalExtraApiParams
		};
			this.apiHit(body).subscribe((data) => {
				if(paginationType === 'clear') this.lists = [];

				if (paginationType == 'search') {
					this.lists = [];
					this.searchedKeys.commonSearch.lastPage = this.searchedKeys.last_page;
				}
				this.loading = false;
				this.mat_loading = false;
				this.mat_checkbox_selection = true;
				this.selectedOptionCheckbox = true;
				let result ;
				if (this.dataIndocs) {
					result = [...data['result']['data']['docs']];
				  } else {
					if ('data' in data?.result?.data) {
					  result = data?.result?.data?.data ? [...data?.result?.data?.data] : [];
					} else {
						result= data?.result?.data ? [...data?.result?.data] : [];
					}
				  }
				  if(this.multiLocations){
					this.setDefaultValue();

				}
				result = result.map(
					(res) =>
						new MappingFilterShareableObject(
							this.isConcate,
							this.concateRoleQualifier,
							this.showSelectFieldList,
							res.id,
							res.template_id,
							res.name,
							res.full_Name,
							res.facility_full_name,
							res.label_id,
							res.insurance_name,
							res.employer_name,
							res.first_name,
							res.middle_name,
							res.last_name,
							res.plan_name,
							res.template_name,
							res.template_type,
							this.bindlable,
							this.bindId,
							res.qualifier,
							res
						),
				);
				
				if (this.dataIndocs){
					this.searchedKeys.commonSearch.lastPage = data?.result?.data?.no_of_pages
					? data?.result?.data?.no_of_pages
					: data?.result?.data.pages;
				}
				else {
					this.searchedKeys.commonSearch.lastPage = data?.result?.last_page ? data?.result?.last_page : data?.result?.pages;

				}
				if(this.needToClearOptions){
					this.lists=result;
				}else{
					if(this.isReferingPhysician){
						if(this.lists?.length){
							let index=this.lists.findIndex(list=>!list?.id);
							if(index>-1){
								this.lists.splice(index,1)
							}
						}
					}
					this.lists = [...this.lists, ...result];
					if(this.selectedItem?.length){
						this.lists = [...this.selectedItem, ...this.lists];
					}
				}		
				
					this.lists?.forEach(x => {
						if(x?.id){
							x['is_select']= "all";
						}
					});
				
				if (this.removeDuplicatesfromElements){
					let formValue = this.searchForm.controls['common_ids'].value;
					this.lists=[...this.removeDuplicates (this.lists)];
					this.searchForm.controls['common_ids'].setValue(formValue);
					}
					this.makeUniqueCollection();	
				if(!this.initialSelectedSlugs?.length){
					this.apiResponseReturned.emit({
						list:this.lists
					})		
				}
			},err=>{
				this.loading = false;
			});
	}
/*** for refering phycasion list there are multiple entries against single physician based on there clinic location and speciality thats why bypass unique criteria in case of refering phy list */
makeUniqueCollection(){
			if(this.bindlable != 'refferingOfficeName'){
				this.lists = _.uniqBy(this.lists, 'id');
			 }
}
	removeDuplicates(arr:any[]){
let uniqueIds = [];
const unique = arr.filter(element => {
  const isDuplicate = uniqueIds.find(unique=>element[this.dupplicateKey]===unique[this.dupplicateKey]);
  if (!isDuplicate) {
	element[this.dupplicateKey] = element[this.dupplicateKey];
    uniqueIds.push(element);
  }
});
return uniqueIds;

	}


	getRecordOnDropdownClick(params?): void {
		this.searchForm.get('textSearch').setValue('');
		this.getDropdownDimensions();
		if(!this.apiPath) {
			return;
		}
		this.mat_loading = true;
		this.mat_checkbox_selection = false;
		this.selectedOptionCheckbox = false;
		this.lists = this.lists.filter((obj) => obj.id !== undefined);
		if ((this.lists.length === 0 || this.lists.length === 1) && this.searchedKeys.commonSearch.page < this.searchedKeys.commonSearch.lastPage && !this.selectAllCheckboxCheck) {
			this.selectedItemAPICall('', this.searchedKeys.page, EnumSearch.InitSearch,params);
		}else{

			if (this.lists.length == 0 && this.searchedKeys.commonSearch.page == this.searchedKeys.commonSearch.lastPage && !this.selectAllCheckboxCheck) {
				this.selectedItemAPICall('', this.searchedKeys.page, EnumSearch.InitSearch,params);
			}else{
				this.mat_loading = false;
				this.selectedOptionCheckbox = true;
				this.mat_checkbox_selection = true;
			}
		}
		if (this.forceApiHitonOpen){
			if(this.clearListOnClick){
				this.lists = [];
			}
			this.selectedItemAPICall('', this.searchedKeys.page,EnumSearch.InitSearch,params);

		}
		// this.controlTouched();
		setTimeout(() => {
			const scrollContainer = document.querySelector('.ng-dropdown-panel-items');
			if (scrollContainer) {
			  scrollContainer.scrollTop = 0;
			}
		  }, 0);
	}
	controlTouched(onclose?:boolean) {
		this.touched.emit({
			is_touched: true,
			onclose
		});
	}
	fetchRecordOnScroll(): void {
			if (this.searchedKeys.commonSearch.page < this.searchedKeys.commonSearch.lastPage) {
				this.selectedItemAPICall(
					this.searchedKeys.commonSearch.searchKey,
					this.searchedKeys.commonSearch.page + this.searchedKeys.page,
					'scroll',
				);
			}
	}

	typingSearch(): void {
		if(!this.apiPath) {
			return;
		}
		this.commonSearch$
			.pipe(
				distinctUntilChanged(),
				debounceTime(300),
				switchMap((res) => {
						this.isConcate = false;
						this.loading = true;
						this.mat_loading= true;
						this.mat_checkbox_selection=false;
						this.searchedKeys.commonSearch.searchKey = res;
						this.searchedKeys.commonSearch.page = 1;
						return this.apiHit({
							name: res,
						}).pipe(catchError(():any => {
							this.loading = false;
							this.mat_checkbox_selection=true;
							this.mat_loading= false;
							of([]);
						}));
				}),
			)
			.subscribe((data) => {
				if (data['status'] == 200 || data['status'] == true) {
					this.loading = false;
					this.mat_loading= false;
					this.mat_checkbox_selection=true;
					this.lists = [];
			
					let result;
					if (this.dataIndocs) {
						result = [...data['result']['data']['docs']];
					  } else {
						if ('data' in data['result']['data']) {
						  result = [...data['result']['data']['data']];
						} else {
							result= [...data['result']['data']];
						}
					  }
		
					if (this.dataIndocs){
						this.searchedKeys.commonSearch.lastPage = data?.result?.data?.no_of_pages
						? data?.result?.data?.no_of_pages
						: data?.result?.data?.pages;
					}
					else {
						this.searchedKeys.commonSearch.lastPage = data?.result?.last_page ? data?.result?.last_page : data?.result?.pages;
	
					}
					result = result.map(
						(res) =>
							new MappingFilterShareableObject(
								this.isConcate,
								this.concateRoleQualifier,
								this.showSelectFieldList,
								res.id,
								res.template_id,
								res.name,
								res.full_Name,
								res.facility_full_name,
								res.label_id,
								res.insurance_name,
								res.employer_name,
								res.first_name,
								res.middle_name,
								res.last_name,
								res.plan_name,
								res.template_name,
								res.template_type,
								this.bindlable,
								this.bindId,
								res.qualifier,
								res
							),
					);
					if( result.length != 0){
						this.lists =  result;
								if(this.showSelectAll && this.selectedItem.length){
								this.lists = [...this.lists,...this.selectedItem ];
								this.searchForm.patchValue({ common_ids: this.selectedItem.map(x => x.id) ,emitEvent:true});
								this.makeUniqueCollection();
							}else{
								// this.lists = [...this.selectedItem  , ...this.lists];
								this.lists = this.lists?.length ? [...this.lists] : this.selectedItem.length ? [...this.selectedItem, ...this.lists] : [];
								this.makeUniqueCollection();
							}
							
								this.lists?.forEach(x => {
									if(x?.id){
										x['is_select']= "all";
									}
								});
					}else{
						this.lists = [];
						this.searchedKeys.commonSearch.page = 1;
						this.searchedKeys.commonSearch.lastPage = 2;
						if(this.selectionLists?.length !=0){
							this.selectedOptionCheckbox = true;
							this.mat_checkbox_selection = true;
							this.searchForm.patchValue({common_ids: [...this.selectionLists, ...[0]]})
						}else{
							this.selectedOptionCheckbox = false;
							this.mat_checkbox_selection = false;
							this.searchForm.patchValue({common_ids: []})
						}
					}
					if(this.selectedItem?.length > 0 && this.searchedKeys.commonSearch?.searchKey == '') {
						this.lists = [...this.selectedItem  , ...this.lists];
						this.makeUniqueCollection();
					}
				}
			});
	}
	@Output() getLocations = new EventEmitter();
	getChange($event: any[], labelName: string): void {
		if(!this.dropdownWidth){
			this.getDropdownDimensions();
		}
		this.controlTouched();
		this.emptyString = '';

		if(this.dropdownWidth){
			if ($event !== undefined){
				if(!(isObject($event) && $event?.['type'] == 'change')){
					this.selectedItem = $event;
				}else return
	
				if($event?.length === this.lists?.length){
					this.selectAllDynamicSpacing();
				}
				else{
					if (Array.isArray($event) && $event?.length !== this.lists?.length) {
						this.selectAllDynamicSpacing();
					  }
				}
			}
		}
		if($event && Array.isArray($event) && !$event?.length && !this.searchForm.get('common_ids').value?.length){
			this.selectedItem = [];
			this.selectedItemDisplay = '';
			 this.dontCallApi? this.lists = [...this.lists]:this.lists = [];
			this.selectedItemAPICall('', this.searchedKeys.page, 'clear')
		}
		this.valueChange.emit({
			data: $event,
			label: labelName,
			formValue: this.searchForm.get('common_ids').value,
			locations:this.multiLocations?{loctions:$event,selected_location:$event?.length>0?$event[$event.length-1]:{}}:{}
		});
	}
	clear($event: any, labelName: string): void {
		this.appendCounter = 0;
		this.emptyString = '';
		this.selectedItem = [];
		this.selectedItemDisplay = '';
		this.valueChange.emit({
			data: [],
			label: labelName,
			formValue: this.searchForm.get('common_ids').value,
		});
	}
	clearSelection($event: any[], labelName: string){
		this.appendCounter = 0;
		this.emptyString = '';
		this.selectedItem = [];
		this.removeEmitter.emit({
			data: $event,
			formValue: this.searchForm.get('common_ids').value,
		});
		this.isOpenClose.emit(false)
	}
	removeFormArrayElement($event){
		// this.removeEmitter.emit($event && $event.value?$event.value:'');
	}
	removeItem($event){

		if (this.searchForm.get('common_ids').value.length == 0) {
			this.dontCallApi? this.lists = [...this.lists]:this.lists = [];
			this.selectedItemAPICall('', this.searchedKeys.page, EnumSearch.RemoveLastItemSearch);
		}
		this.removeEmitter.emit({
			data: $event.value,
			formValue: this.searchForm.get('common_ids').value,
		});
		if(this.multiLocations){
			this.setDefaultValue()
		}
	}

	eventSubscriptions(): void {
		if (this.events) {
			this.subscription.push(
				this.events.subscribe((res) => {
					if (res) {
						this.searchForm.patchValue({ common_ids: null });
						if(!this.dontCallApi && !this.Is_static_data){
							this.lists = [];
						}
						if(!this.Is_static_data){
							this.lists = [];
							this.showSelectFieldList= [];
						}
						
						this.selectedItem = [];
						this.selectedItemDisplay = '';
					}
				})
			);	
		}
	}
	valueUpdateOnRunTimeRender(): void {
		if (this.updateOnRunTimeValue) {
			this.updateOnRunTimeValue.subscribe((res) => {
				if (res['status'] === true) {
					this.searchForm.patchValue({ common_ids: res['value'] });
				}
			});
		}
	}
	add($event){
		if(this.selectedItem.length < 1 && $event) { // WHEN RECORD EXISTS AND ADD NEW ITEM (ON EDIT MOOD)
			// this.showSelectFieldList && this.showSelectFieldList.map(res => this.selectedItem.push({id: res.id, name: res.name,
			// 	qualifier: $event.qualifier
	
			// }))
			if (this.showSelectFieldList) {
				this.showSelectFieldList.forEach(res => {
				  if (res.id !== undefined && res.name !== undefined) {
					this.selectedItem.push({
					  id: res.id,
					  name: res.name,
					  qualifier: $event?.qualifier,
					  is_select: "all"
					});
				  }
				});
			  }
			  
		}
		if($event && typeof $event === 'object'){
			if($event?.id){
				const idExists = this.selectedItem.some(item => item.id === $event.id);
				if(!idExists){
					this.selectedItem.push({id: $event.id, name: $event.name, is_select: "all", qualifier: $event.qualifier,realObj:$event.realObj});
				}
			}
			 this.lists = [...this.selectedItem, ...this.lists.filter(item => !this.selectedItem.some(selected => selected.id === item.id))];
			this.lists = [...this.selectedItem  , ...this.lists];
			this.lists = this.lists?.length ? [...this.lists] : this.selectedItem.length ? [...this.selectedItem, ...this.lists] : [];
			this.makeUniqueCollection();
			this.selectedItemDisplay = this.selectedItem.map(res => res.name).toString();
		}
		this.addNewRecord.emit($event);
	}
	remove($event: any){
		this.showSelectFieldList = [];
		// if(this.appendCounter >= 1){
		// 	this.appendCounter --;
		// }
		if(this.selectedItem.length < 1 && $event) { // WHEN RECORD EXISTS AND REMOVE ITEM ON MULTIPLE SHOW RECORD TOOL TIP (ON EDIT MOOD)
			if (this.showSelectFieldList){
			this.showSelectFieldList && this.showSelectFieldList.map(res => 
			this.selectedItem.push({
				id: res.id, 
				name: res.name,
				is_select: "all", 
				qualifier: $event?.qualifier})
				);
			}
		}
		if($event){
			const index = this.selectedItem.findIndex(res => res.id === $event.value.id);
			if (index !== -1){
				this.selectedItem.splice(index,1);
			}
			this.lists = [...this.selectedItem, ...this.lists.filter(item => !this.selectedItem.some(selected => selected.id === item.id))];
			this.selectedItemDisplay = this.selectedItem.map(res => res.name).toString();
		}
	}

	trackByFn(item: any): any {
		return item;
	}
	
	apiHitBydefault(queryParams?) {
		var params: any = {
			filter: this.moduleName == 'template' ? 1 : true,
			// order: OrderEnum.ASC,
			pagination: true,
			dropDownFilter:true,
			per_page: queryParams.per_page || this.per_page,
			page: queryParams.page || 1,
			...this.conditionalExtraApiParamsForSelectedData,
			...this.conditionalExtraApiParams,
			...new CommonParamModel({'name':queryParams.name , bindLable:  this.searchLableName })
		} as any;
		return this.requestService.sendRequest(
			this.apiPath,
			'get',
			this.mainApiPath,
			removeEmptyAndNullsFormObjectAndBindLable(params),
		);
	}


	selectedItemAPICallBydefault(event = '', page = 1, paginationType = 'search'): void {
		this.loading = true;
		this.searchedKeys.commonSearch.searchKey = event;
		this.searchedKeys.commonSearch.page = page;
		let body = {
			page: page || 1,
			name: event,

		};
			this.apiHitBydefault(body).subscribe((data) => {
				if (paginationType == 'search') {
					this.lists = [];
					this.searchedKeys.commonSearch.lastPage = this.searchedKeys.last_page;
				}
				this.loading = false;				
				this.ApiCallresponse = [...data['result']['data']];
				// let result = [...data['result']['data']];
				let result;
				if (this.dataIndocs) {
					result = [...data['result']['data']['docs']];
				  } else {
					if ('data' in data?.result?.data) {
					  result = data?.result?.data?.data ? [...data?.result?.data?.data] : [];
					} else {
						result= data?.result?.data ? [...data?.result?.data] : [];
					}
				  }
				if(this.initialSelectedSlugs?.length){
					const modelData = result.filter((model) => this.initialSelectedSlugs.includes(model.slug));
					if(modelData?.length){
						const filteredModelData = modelData.map(
							(res) =>
								new MappingFilterShareableObject(
									this.isConcate,
									this.concateRoleQualifier,
									this.showSelectFieldList,
									res.id,
									res.template_id,
									res.name,
									res.full_Name,
									res.facility_full_name,
									res.label_id,
									res.insurance_name,
									res.employer_name,
									res.first_name,
									res.middle_name,
									res.last_name,
									res.plan_name,
									res.template_name,
									res.template_type,
									this.bindlable,
									this.bindId,
									res.qualifier,
									res
								),
						);
						this.searchForm.patchValue({ common_ids: modelData.map(model => model.id) });
						this.getChange(filteredModelData, this.filterFieldName);		
					}
				}
				result = result.map(
					(res) =>
						new MappingFilterShareableObject(
							this.isConcate,
							this.concateRoleQualifier,
							this.showSelectFieldList,
							res.id,
							res.template_id,
							res.name,
							res.full_Name,
							res.facility_full_name,
							res.label_id,
							res.insurance_name,
							res.employer_name,
							res.first_name,
							res.middle_name,
							res.last_name,
							res.plan_name,
							res.template_name,
							res.template_type,
							this.bindlable,
							this.bindId,
							res.qualifier,
							res
						),
				);
				// this.searchedKeys.commonSearch.lastPage = data.result.last_page ? data.result.last_page : data.result.pages;
				if (this.dataIndocs){
					this.searchedKeys.commonSearch.lastPage = data?.result?.data?.no_of_pages
					? data?.result?.data?.no_of_pages
					: data?.result?.data.pages;
				}
				else {
					this.searchedKeys.commonSearch.lastPage = data?.result?.last_page ? data?.result?.last_page : data?.result?.pages;

				}
				this.loadData = Promise.resolve(true);
				if(this.needToClearOptions){
					this.lists=result;
				}else{
					this.lists = [...this.lists, ...result];
				}
				if(this.initialSelectedSlugs?.length){
					this.apiResponseReturned.emit();
					return ;
				}
				if(this.lists?.length){
					this.getChange(this.lists,this.filterFieldName);		
				}
			},err=>{
				this.loading = false;
			});
	}
	changeSelection($event: any[], labelName: string) {
		if (this.searchingFilter) {
			const data = $event.filter((f) => f != 0);
			this.selectionLists = [...data];
		}
		this.valueChange.emit({
			data: $event,
			label: labelName,
			formValue: $event.map((d) => d[this.bindId]),
		});
		this.controlTouched();
	}

	getIndex(i: number) {
		this.selectAllCheckboxCheck = false;
		if (this.searchingFilter) {
			this.lists.splice(i, 1);
			this.selectionLists.length === this.totalRecords ? this.allSelected.select() : null;
			// this.listsBindingItems();
		}
	}

	unselectItem(item: any) {
		this.selectAllCheckboxCheck = false;
		this.lists.unshift(item);
		try {
			this.allSelected.deselect();
		} catch (e) {
			console.log(e);
		}
		// this.listsBindingItems();
	}

	toggleAllSelection(labelName: any) {
		this.selectAllCheckboxCheck = true;
		if (this.allSelected.selected) {
			this.selectionLists = [...this.lists, ...this.selectionLists];
			this.searchForm.controls.common_ids.patchValue([...this.selectionLists, 0]);
			this.valueChange.emit({
				data: this.lists,
				label: labelName,
				formValue: this.selectionLists.map((d) => d[this.bindId]),
			});
			this.lists = [];
			// this.listsBindingItems();
		} else {
			this.searchForm.controls.common_ids.patchValue([]);
			this.lists = [...this.lists, ...this.selectionLists];
			this.selectionLists = [];
			//   this.listsBindingItems();
			this.valueChange.emit({
				data: [],
				label: labelName,
				formValue: [],
			});
		}
	}

	listsBindingItems() {
		this.options.next(this.lists);
		this.options$ = this.options.asObservable().pipe(
			scan((acc, curr) => {
				return [...acc, ...curr];
			}, []),
		);
	}

	applyFilterDown(event) {
		if (
			(event.key && event.key.length === 1) ||
			(event.keyCode >= A && event.keyCode <= Z) ||
			(event.keyCode >= ZERO && event.keyCode <= NINE) ||
			event.keyCode === SPACE ||
			event.keyCode === HOME ||
			event.keyCode === END
		) {
			event.stopPropagation();
		}
	}
	applyFilter(txt) {
		this.commonSearch$.next(txt);
	}

	getDropdownDimensions() {
		this.dropdownHeight = this.ngSelectOuter?.nativeElement?.clientHeight;
		this.dropdownWidth = this.ngSelectOuter?.nativeElement?.clientWidth;
	}

	singleDynamicSpacing(){

		if(this.selectedItem?.length){
			for(let i in this.selectedItem){
				this.emptyString += (this.qulifierShown ? this.selectedItem[i]?.qualifier ? this.selectedItem[i]?.qualifier : this.selectedItem[i]?.realObj[this.bindQualifierLabel]: this.selectedItem[i]?.name) + " x ";
			}
		}

		let tempElement = document.createElement('span');
		tempElement.style.visibility = 'hidden';
		tempElement.style.position = 'absolute';
		tempElement.style.whiteSpace = 'nowrap';
		tempElement.textContent = this.emptyString;
			
		// Append the temporary element to the document body
		document.body.appendChild(tempElement);
						
		// Get the width of the string
		let stringWidth = tempElement.offsetWidth+100;

		if (stringWidth <= this.dropdownWidth) {
		this.appendIcon = false;
		this.appendCounter = this.selectedItem?.length; // Show all items
		} else {
			this.appendIcon = true;
			if (this.appendCounter === this.selectedItem?.length && stringWidth >= this.dropdownWidth){
				this.appendCounter--;
			}
		}
		// Remove the temporary element
		document.body.removeChild(tempElement);
	}

	selectAllDynamicSpacing(){
		this.appendCounter =0;
		let padding: number = 95;
		let tempElement = document.createElement('span');
		tempElement.style.visibility = 'hidden';
		tempElement.style.position = 'absolute';
		tempElement.style.whiteSpace = 'nowrap';

		for(let i=0; i<this.selectedItem.length; i++){

			this.emptyString += (this.qulifierShown ? this.selectedItem[i]?.qualifier ? this.selectedItem[i]?.qualifier : this.selectedItem[i]?.realObj[this.bindQualifierLabel]: this.selectedItem[i]?.name) + " x ";
			
			tempElement.textContent = this.emptyString;

			// Append the temporary element to the document body
			document.body.appendChild(tempElement);

			// Get the width of the string
			let stringWidth = tempElement.offsetWidth+(i === 0 ? 0 : padding);

			if (i === 0 && stringWidth > this.dropdownWidth) {
				stringWidth = 30;
			}

			if(stringWidth <= this.dropdownWidth && (this.selectedItem?.length > 1 && this.selectedItem?.length !== this.lists?.length)){
					// Check if this is the last item in the loop
					if (i === this.selectedItem.length - 1) {
						stringWidth += padding;
					  }			
			}
			if (stringWidth <= this.dropdownWidth) {
				this.appendIcon = false;
				this.appendCounter ++; // Show all items
			  } else {
				this.appendIcon = true;
				if (this.appendCounter === this.selectedItem?.length && stringWidth >= this.dropdownWidth){
					this.appendCounter--;
				}
			  }
			// Remove the temporary element
			document.body.removeChild(tempElement);
		}
		this.selectedItemDisplay = this.selectedItem.map(res => res.name).toString();
	}

	removeOptionFromList(item){
		if(item?.data?.case_recipient==false || item?.case_recipient==false){
			let index=this.lists.findIndex(recp=>recp?.id==item?.data?.id || recp?.id==item?.id);
			if(index>-1){
				this.lists.splice(index,1)
			}
		}
	}

}
