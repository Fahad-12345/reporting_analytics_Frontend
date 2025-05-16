import { DatePipeFormatService } from './../../../../../shared/services/datePipe-format.service';
import { find } from 'lodash';
import { changeDateFormat, convertDateTimeForRetrieving, getIdsFromArray, isArray, makeDeepCopyArray, removeEmptyAndNullsFormObject, removeEmptyAndNullsFormObjectAndBindLable } from '@shared/utils/utils.helpers';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { Logger } from '@nsalaun/ng-logger';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModalRef, NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SelectionModel } from '@angular/cdk/collections';
import { HttpService } from '@appDir/front-desk/fd_shared/services/http.service';
import { AclService } from '@appDir/shared/services/acl.service';
import { Page } from '@appDir/front-desk/models/page';
import { of, Subject, Subscription } from 'rxjs';
import { SpecialityUrlsEnum } from './Speciality-urls-enum';
import {  ParamQuery } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { checkReactiveFormIsEmpty, isEmptyObject, isObjectEmpty } from '@appDir/shared/utils/utils.helpers';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { Location } from '@angular/common';
import { HttpSuccessResponse, StorageData } from '@appDir/pages/content-pages/login/user.class';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { VisitType } from '../../vistType/VisitType.model';
import { VisitTypeUrlsEnum } from '../../vistType/visit.type.enum';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { catchError, debounceTime, distinctUntilChanged, pairwise, startWith, switchMap } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { PracticeService } from '@appDir/front-desk/masters/practice/practice/services/practice.service';
import { AppointmentCancelCommentModel } from '@appDir/scheduler-front-desk/modules/assign-speciality/modals/accordian/appoinment-cancel-comment-model';
import { AssignSpecialityUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-speciality/assign-speciality-urls-enum';
@Component({
	selector: 'app-specialities-listing',
	templateUrl: './specialities-listing.component.html',
	styleUrls: ['./specialities-listing.component.scss'],
})
export class SpecialityListing extends PermissionComponent implements OnInit {
	isCollapsed = false;
	submitted = false;
	selection = new SelectionModel<Element>(true, []);
	isLoading = false;
	hasId = false;
	public selectedRowsString: string;
	public specialityForm: FormGroup;
	public searchForm: FormGroup;
	specialities: any[] = [];
	speciality: any;
	@ViewChild('content') contentModal: any;
	modalRef: NgbModalRef;
	bools: boolean = true;
	tab: any;
	@Input() inputValue;
	page: Page;
	specialty: any;
	lstVisitTypes: VisitType[] = []
	server_apps: any;
	predefinedSpecialties:any=[];
	subscription: Subscription[] = [];
	totalRows: number;
	maxVal = 200;
	public loadSpin: boolean = false;
	lstvisitTypesAgainstSpecialty: any[] = []
	queryParams: ParamQuery;
	customStates = [null, true, false]
	selectedPredefinedSpecialty:number=null;
	visitTypeAgainstSpecialty: VisitType[] = [];
	commonSearch$ = new Subject();
	environment= environment;
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('specialityList') specialityListTable: DatatableComponent;
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
	specialityListingTable: any;
	specialtyAppointmentsData: any[] = [];
	specialtyAppointmentPage: Page;
	public modalRefChangeStatus: NgbModalRef;
	paramsStored: any = {};
	bodyParams: any = {};

	constructor(
		private modalService: NgbModal,
		private fb: FormBuilder,
		public route: ActivatedRoute,
		private logger: Logger,
		private toastrService: ToastrService,
		private http: HttpService,
		acl: AclService,
		protected requestService: RequestService,
		private CanDeactivateModelComponentService: CanDeactivateModelComponentService,
		rou: Router,
		private location: Location,
		public customDiallogService: CustomDiallogService,
		public datePipeService: DatePipeFormatService,
		private storageData: StorageData,
		private localStorage: LocalStorage,
		protected practiceService: PracticeService
	) {
		super(acl, rou);
		this.page = new Page();
		this.page.pageNumber = 0;
		this.page.size = 10;
		this.specialtyAppointmentPage = new Page();
		this.specialtyAppointmentPage.pageNumber = 0;
		this.specialtyAppointmentPage.size = 10;
	}

	onValueChange(event, field) {
		let value = {};

		let val: any = '';
		if(field == 'over_booking') {
		if (this.specialityForm.controls.over_booking.value.length > 3) {
			value[field] = this.specialityForm.controls.over_booking.value.substring(0,3);
			this.specialityForm.patchValue(value);
		}
	}
	else if(field == 'time_slot') {
			if (parseInt(event) > this.maxVal) {
				val = this.maxVal;
				value[field] = val;
				this.specialityForm.patchValue(value);
			}
		}
	
	}


	ngOnInit() {
		this.specialityForm = this.fb.group({
			id: null,
			name: ['', [Validators.required]],
			qualifier:['', [Validators.required]],
			time_slot: ['', [Validators.required, Validators.min(5), Validators.max(this.maxVal)]],
			over_booking: ['', [Validators.required, Validators.min(0), Validators.max(999)]],
			description: [''],
			available_specialties_id: [''],
			pre_defined_specialty:[''],
			visit_type_ids: ['',Validators.required],
			is_create_appointment: [0],
			is_multiple_visit:[0]
		});
		this.searchForm = this.fb.group({
			name: [''],
			time_slot: [''],
			over_booking: ['']
		});
		this.subscription.push(
			this.route.queryParams.subscribe((params) => {
				this.searchForm.patchValue(params);
				this.page.size = parseInt(params.per_page) || 10;
				this.page.pageNumber = parseInt(params.page) || 1;
				this.page.size = parseInt(params.per_page) || 10;
			}),
		);
		this.setPage({ offset: this.page.pageNumber - 1 || 0 });
		this.typingSearch();
		this.specialityListingTable = this.localStorage.getObject('specialityMasterTableList' + this.storageData.getUserId());
	}

	ngAfterViewInit() {
		if (this.specialityListTable?._internalColumns) {
			this.columns = makeDeepCopyArray([...this.specialityListTable._internalColumns]);
			this.columns.forEach(element => {
				if(this.specialityListingTable.length) {
					let obj = this.specialityListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.specialityListingTable.length) {
				const nameToIndexMap = {};
				this.specialityListingTable.forEach((item, index) => {
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
	isDisabled() {
		if(this.isLoading || this.specialityForm.invalid) {
			return true;
		} else {
			return false;
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
			per_page: this.page.size,
			page: pageNumber,
			pagination: true,
		};
		let per_page = this.page.size;
		let queryparam = { per_page, page: pageNumber }

	

		this.addUrlQueryParams(({ ...filters, ...queryparam }));
		this.getSpecialities({ ...this.queryParams, ...filters });
	}



	addUrlQueryParams(params?) {
		this.location.replaceState(
			this.router.createUrlTree([], { queryParams: params, }).toString()
		);
	}

	get addForm() {
		return this.specialityForm.controls;
	}

	getSpecialities(queryParams) {
		this.loadSpin = true;
		this.subscription.push(
			this.requestService
				.sendRequest(
					SpecialityUrlsEnum.Speciality_list_Get,
					'GET',
					REQUEST_SERVERS.fd_api_url,
					queryParams,
				false,true

				)
				.subscribe(
					(data: HttpSuccessResponse) => {
						if (data.status) {
							this.loadSpin = false;
						
							this.specialities = data.result && data.result.data ? data.result.data : [];
							this.page.totalElements = data.result && data.result.total ? data.result.total : 0;
							
						}
					},
					(err) => {
						this.loadSpin = false;
					},
				),
		);
	}

	getVisitTypes(row) {
		let obj = {
			specialty_id: row && row.id ? row.id : null,
			name: row && row.name ? row.name : null,
		}
		this.subscription.push(
			this.requestService
				.sendRequest(
					VisitTypeUrlsEnum.VisitType_list_GET_With_Editable,
					'GET',
					REQUEST_SERVERS.fd_api_url,
					removeEmptyAndNullsFormObjectAndBindLable(obj),
				)
				.subscribe(
					(data: any) => {
						;
						if (data.status === 200 || data.status) {
							this.lstVisitTypes = data && data.result ? data.result.data : [];
							if(this.visitTypeAgainstSpecialty) {
								this.lstVisitTypes = [...this.visitTypeAgainstSpecialty,...this.lstVisitTypes]
							}
						}
					},
					(err) => {

					},
				),

		)
	}

	getAvailableSpecialities(row?) {
		this.subscription.push(
			this.requestService
				.sendRequest(
					SpecialityUrlsEnum.available_list_speciality_get,
					'GET',
					REQUEST_SERVERS.fd_api_url,
				)
				.subscribe(
					(res: HttpSuccessResponse) => {
						this.server_apps = res.result.data;
						if (!this.server_apps) { return; }
						if (row && row.id) {
							this.server_apps.unshift({ id: row.id, name: row.default_name })
						}

					},
					(err) => {
					},
				),
		);

	}

	getPredefinedSpecialities(ids?:any[]) {
		let params={
			order:OrderEnum.ASC,
			ids:ids && ids.length?ids:null
		}
		params=removeEmptyAndNullsFormObject(params);
		this.subscription.push(
			this.requestService
				.sendRequest(
					SpecialityUrlsEnum.pre_defined_specialities,
					'GET',
					REQUEST_SERVERS.fd_api_url,
					params
				)
				.subscribe(
					(res: HttpSuccessResponse) => {
						this.predefinedSpecialties = res.result.data;
						

					},
					(err) => {
					},
				),
		);

	}

	getVisitTypesAgainstSpecialty(id) {
		let params={
		
			id:id 
		}
		this.loadSpin=true;
		params=removeEmptyAndNullsFormObject(params);
		this.subscription.push(
			this.requestService
				.sendRequest(
					SpecialityUrlsEnum.get_visit_types_against_specialty,
					'GET',
					REQUEST_SERVERS.fd_api_url,
					params
				)
				.subscribe(
					(res: HttpSuccessResponse) => {
						this.loadSpin=false;
						let selectedSpeciality = res.result.data;
						let selectedVisitIds:any[]=[]
						if(selectedSpeciality.visit_types)
						{
							selectedSpeciality.visit_types.forEach(visits => {
								selectedVisitIds.push(visits.id);
								visits['is_required']=null;
								visits['is_multiple']=null;
								
				
							});

							this.lstvisitTypesAgainstSpecialty=[...selectedSpeciality.visit_types];
							this.specialityForm.patchValue({
								visit_type_ids:selectedVisitIds
							})
						}
						else
						{
							this.lstvisitTypesAgainstSpecialty=[];
						}
						
						

					},
					(err) => {
						this.loadSpin=false;
					},
				),
		);

	}

	changespecialities(event)
	{

	}

	changePredefinedSpecialities(event) { 
		 
		if(this.selectedPredefinedSpecialty)
		{
			this.customDiallogService
			.confirm('Visit types data will be clear.', 'Are you sure you want to change the Predefined Speciality?')
			.then((confirmed) => {
				if (confirmed) {
					this.lstvisitTypesAgainstSpecialty=[];
					this.specialityForm.patchValue({
						visit_type_ids:[]
					},{emitEvent:false})
					if(event.target.value)
					{
						this.selectedPredefinedSpecialty=parseInt(event.target.value);
						this.getVisitTypesAgainstSpecialty(parseInt(event.target.value))
					}
					else
					{
						this.selectedPredefinedSpecialty=null;
						this.specialityForm.patchValue({
							pre_defined_specialty:this.selectedPredefinedSpecialty
						},{emitEvent:false})
					}
				}
				else
				{
					this.selectedPredefinedSpecialty;
					this.specialityForm.patchValue({
						pre_defined_specialty:this.selectedPredefinedSpecialty
					},{emitEvent:false})
				}
			})
			.catch();
		}
		else
		{
			this.lstvisitTypesAgainstSpecialty=[];
			this.specialityForm.patchValue({
				visit_type_ids:[]
			},{emitEvent:false})
			if(event.target.value)
			{
				this.selectedPredefinedSpecialty=parseInt(event.target.value);
				this.getVisitTypesAgainstSpecialty(parseInt(event.target.value))
			}
		}

	}

	dropTable(event: CdkDragDrop<any[]>) {
		 
		const prevIndex = this.lstvisitTypesAgainstSpecialty.findIndex((d) => d === event.item.data);
		moveItemInArray(this.lstvisitTypesAgainstSpecialty, prevIndex, event.currentIndex);
	  }
	changeVisitTypes(event) { 
		if(event && event.length>this.lstvisitTypesAgainstSpecialty.length)
		{
			let visitNotInVisitTypesAgainstSpecialty = event.filter(obj=> {
				return !this.lstvisitTypesAgainstSpecialty.some(obj2=> {
					return obj.id === obj2.id;
				});
			});
			console.log(visitNotInVisitTypesAgainstSpecialty);
			if(Array.isArray(visitNotInVisitTypesAgainstSpecialty) && visitNotInVisitTypesAgainstSpecialty.length > 0) {
				visitNotInVisitTypesAgainstSpecialty[0]['is_required']=null;
				visitNotInVisitTypesAgainstSpecialty[0]['is_multiple']=null;
				this.lstvisitTypesAgainstSpecialty=[...this.lstvisitTypesAgainstSpecialty,...visitNotInVisitTypesAgainstSpecialty]
			}
	
		}
		else if (event && event.length<this.lstvisitTypesAgainstSpecialty.length)
		{
			let visitremoveFromVisitTypesAgainstSpecialty = this.lstvisitTypesAgainstSpecialty.filter(obj=> {
				return event.some(obj2=> {
					return obj.id === obj2.id;
				});
			});
			this.lstvisitTypesAgainstSpecialty=[...visitremoveFromVisitTypesAgainstSpecialty];
		}
	}

	openSpecialityForm(content, row) {
		this.specialityForm.reset();
		this.getAvailableSpecialities(row);
		this.getVisitTypes(row);
		this.lstvisitTypesAgainstSpecialty=[];
		if (row == null) {
			this.hasId = false;
			this.selectedPredefinedSpecialty=null;
		} else {
			this.hasId = true;
			this.selectedPredefinedSpecialty=row.pre_defined_specialty?row.pre_defined_specialty:null;
			this.lstvisitTypesAgainstSpecialty=row.visit_types?row.visit_types.map(a => Object.assign({}, a)):[]
			row.available_specialties_id = row.id;  //This is going to be the available speciality id. Currently using id because there is no available speciality id sent by the back end. 
			row.visit_type_ids = []
			row.visit_type_ids = row.visit_types.map(visitType => visitType.id)
			this.specialityForm.patchValue(row);
		}
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modalxl',
			size:'lg'
		};
		this.modalRef = this.modalService.open(content, ngbModalOptions);
		this.visitTypeAgainstSpecialty = row && row.visit_types ? row.visit_types : null;
			this.visitTypeAgainstSpecialty ? this.visitTypeAgainstSpecialty.map(res =>{
				if(res && !res.is_editable) {
					res['disabled'] = true;
				}
			}) : null
	}

	specilatyAddAndUpdate() {
		if (this.specialityForm.valid) {
			if (this.bodyParams?.id == null) {
				this.add(this.bodyParams);
			}
			else {
				this.update(this.bodyParams);
			}
		}
	}

	crossCancel() {
		this.isLoading = false;
		this.modalRefChangeStatus.close();
	}
	
	timeConversion(time) {
		return convertDateTimeForRetrieving(null, new Date(time));
	}

	getAppointmentInfo() {
		let queryParams = {};
		queryParams['id'] = this.paramsStored?.id;
		queryParams['paginate'] = true;
		queryParams['page'] = this.specialtyAppointmentPage.pageNumber;
		queryParams['per_page'] = this.specialtyAppointmentPage.size;
		queryParams['current_date'] = changeDateFormat(new Date);
		queryParams['visit_types'] = this.paramsStored?.visit_types;
		this.subscription.push(
		  this.requestService
		  .sendRequest(
			SpecialityUrlsEnum.get_speciality_appointments_by_visittype,
			'GET',
			REQUEST_SERVERS.schedulerApiUrl1,
			queryParams
			)
			.subscribe(
			  (resp) => {
				this.specialtyAppointmentsData = resp?.result?.data?.docs;
			  },
			  (err) => {
			   },
			),
		);
	}
	
	onPageChangeNew(pageInfo) {
		this.specialtyAppointmentPage.offset = pageInfo.offset;
		this.specialtyAppointmentPage.pageNumber = pageInfo.offset + 1;
		this.getAppointmentInfo();
	}

	pageLimitAppointment($event) {
		this.specialtyAppointmentPage.offset = 0;
		this.specialtyAppointmentPage.size = Number($event);
		this.specialtyAppointmentPage.pageNumber = 1;
		this.getAppointmentInfo();
	}

	removeData()
	{
		this.changePredefinedSpecialities({target:{value:null}})
	}

	closeModal() {
		// this.hasId = false;
		if ((this.specialityForm.dirty && this.specialityForm.touched)) {
			this.CanDeactivateModelComponentService.canDeactivate().then(res => {
				let result = res;	
				if (res) {
					this.specialityForm.reset();
					this.modalRef.close();
				}
				else {
					return true;
				}
			});
		}
		else {
			this.specialityForm.reset();
			this.modalRef.close();
		}
	}
	
	assignValues() {
		this.specialityForm.patchValue({
			id: this.speciality.id,
			name: this.speciality.name,
		});
	}

	onSubmit(form:any, cancelAppt) {
		let visit_types=this.lstvisitTypesAgainstSpecialty.map((visitType,index) => (
			{
			  	id:visitType.id,
				position:index+1,
				is_required:visitType.is_required==null || visitType.is_required==false ?0:1,
				is_multiple: visitType.is_multiple==null || visitType.is_multiple==false?0:1,
				is_editable : visitType && visitType.is_editable?1:0,
				is_multiple_same_day:visitType&&visitType.is_multiple_same_day==null || visitType && visitType.is_multiple_same_day==false ?0:1,
				allow_multiple_cpt_codes:visitType && visitType.allow_multiple_cpt_codes==null || visitType && visitType.allow_multiple_cpt_codes==false ?0:1,
			} 
		));
		const body = {
			id:form.id,
			name:form.name,
			qualifier:form.qualifier,
			time_slot:form.time_slot,
			over_booking:form.over_booking,
			pre_defined_specialty:form.pre_defined_specialty,
			visit_types:visit_types,
			available_specialties_id:form.available_specialties_id,
			description:form.description,
			is_create_appointment:form.is_create_appointment,
			is_multiple_visit:form.is_multiple_visit
		}
		this.bodyParams = body;
		this.isLoading = true;
		if (this.specialityForm.invalid) {
			return;
		}
		let param = {
			id: form?.id,
			paginate: true,
			page: 1,
			per_page: this.specialtyAppointmentPage.size,
			current_date: changeDateFormat(new Date),
			visit_types: this.stringfy(visit_types)
		};
		this.paramsStored = param;
		this.subscription.push(
			this.requestService
				.sendRequest(
					SpecialityUrlsEnum.get_speciality_appointments_by_visittype,
					'GET',
					REQUEST_SERVERS.schedulerApiUrl1,
					param
				).subscribe((res) => {
					this.specialtyAppointmentsData = res?.result?.data?.docs;
					let isAppointments = res?.result?.data?.is_Appointments;
					this.specialtyAppointmentPage.totalElements = res?.result?.data?.total;
					if(isAppointments) {
						const ngbModalOptions: NgbModalOptions = {
						backdrop: 'static',
						size: 'lg',
						keyboard: false,
						windowClass: 'modal_extraDOc',
						};
						this.modalRefChangeStatus = this.modalService.open(cancelAppt, ngbModalOptions);
					}
					else {
						this.specilatyAddAndUpdate();
					}
			  },
		  (err) => {
			  this.isLoading = false;
		  }))
	}

	onDelete(id) {
		const temp = [id];
		this.customDiallogService.confirm('Delete options', `Are you sure you want to delete?`,'Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
				this.subscription.push(
					this.requestService
						.sendRequest(
							SpecialityUrlsEnum.Speciality_list_Delete,
							'DELETE',
							REQUEST_SERVERS.fd_api_url,
							{ id: temp },
						)
						.subscribe(
							(res) => {
								this.setPage({ offset: this.page.pageNumber });
								this.getAvailableSpecialities();
								this.specialities = this.specialities;
								this.toastrService.success('Successfully Deleted', 'Success');
							},
							(err) => { },
						),
				);
				
			}else if(confirmed === false){
				
			}else{
				
			}
		})
		.catch();
		
	}

	add(form) {
		if(this.specialityForm.controls.is_create_appointment.value == null) {
			this.specialityForm.controls.is_create_appointment.setValue(false);
		}
		form['is_create_appointment'] = this.specialityForm.controls.is_create_appointment.value;
		this.subscription.push(
			this.requestService
				.sendRequest(
					SpecialityUrlsEnum.Speciality_list_POST,
					'POST',
					REQUEST_SERVERS.fd_api_url,
					removeEmptyAndNullsFormObject(form),
				)
				.subscribe(
					(res) => {
						this.modalRef.close();
						this.specialityForm.reset();
						this.setPage({ offset: this.page.pageNumber });
						this.getAvailableSpecialities(); // this is for dropdown
						this.toastrService.success("Successfully Added", 'Success');
						this.isLoading = false;
					},
					(err) => {
						this.isLoading = false;
					},
				),
		);
	}

	update(form) {

		this.subscription.push(
			this.requestService
				.sendRequest(
					SpecialityUrlsEnum.Speciality_list_PUT,
					'PUT',
					REQUEST_SERVERS.fd_api_url,
					form,
				)
				.subscribe(
					(res : any) => {
						let msg;
					
							this.modalRef.close();
							this.specialityForm.reset();
							this.setPage({ offset: this.page.pageNumber });
							this.toastrService.success(res.message, 'Success');
							this.isLoading = false;
					
					},
					(err) => {
						this.isLoading = false;
					},
				),
		);
	}

	stringfy(obj) {
		return JSON.stringify(obj);
	}

	masterToggle(event) {
		this.isAllSelected()
			? this.selection.clear()
			: this.specialities.slice(0, this.totalRows).forEach((row) => this.selection.select(row));
	}

	isAllSelected() {
		this.totalRows = this.specialities.length;
		const numSelected = this.selection.selected.length;
		const numRows = this.totalRows;
		return numSelected === numRows;
	}

	bulkDelete() {
		const selected = this.selection.selected;
		const ids = selected.map((row) => row.id);

		this.customDiallogService.confirm('Delete Confirmation?', `Are you sure you want to delete?`,'Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
				this.subscription.push(								
					this.requestService
						.sendRequest(
							SpecialityUrlsEnum.Speciality_list_Delete,
							'DELETE',
							REQUEST_SERVERS.fd_api_url,
							{ id: ids },
						)
						.subscribe((res) => {
							this.selection.clear();
							this.getAvailableSpecialities();
							this.specialities = this.removeMultipleFromArr(this.specialities, ids, 'id');
							this.specialities = this.specialities;
							this.toastrService.success('Successfully Deleted.', 'Success');
						}),
				);
				
			}else if(confirmed === false){
				
			}else{
				
			}
		})
		.catch();
	}

	private removeMultipleFromArr<T>(data: T[], toBeDeleted: Array<T>, key): T[] {
		return data.filter(
			(row) => row[`${key}`] !== toBeDeleted.find((element) => row[`${key}`] === element),
		);
	}

	facilityPlus() {
		this.bools = !this.bools;
	}

	facilityMinus() {
		this.bools = !this.bools;
	}

	onResetFilters() {
		this.searchForm.reset();
		this.setPage({ offset: 0 });
	}

	pageLimit($num) {
		this.page.size = Number($num);
		this.setPage({ offset: 0 });
	}

	crossClose() {
		if ((this.specialityForm.dirty && this.specialityForm.touched)) {
			this.CanDeactivateModelComponentService.canDeactivate().then(res => {
				let result = res;
				if (res) {
					this.specialityForm.reset();
					this.modalRef.close();
				}
				else {
					return true;
				}
			});
		}
		else {
			this.specialityForm.reset();
			this.modalRef.close();
		}
	}

	unSubAllPrevious() {
		if (this.subscription.length) {
			this.subscription.forEach((sub) => {
				sub.unsubscribe();
			});
		}
	}

	ngOnDestroy(): void {
		this.unSubAllPrevious();
	}

	checkInputs(){
		if (isEmptyObject(this.searchForm.value)) {
			return true;
		  }
		  return false;
	}

	
	typingSearch(): void {
		this.commonSearch$
			.pipe(
				distinctUntilChanged(),
				debounceTime(300),
				switchMap((res) => {
						return this.apiHitOfVisitType({
							name: res,
						}).pipe(catchError(():any => {
							of([]);
						}));
				}),
			)
			.subscribe((data) => {
				if (data['status'] == 200 || data['status'] == true) {
					this.lstVisitTypes = data && data.result ? data.result.data : [];
					if(this.visitTypeAgainstSpecialty) {
						this.lstVisitTypes = [...this.visitTypeAgainstSpecialty,...this.lstVisitTypes]
					}
				}
			});
	}

	apiHitOfVisitType(queryParams?) {
		return this.requestService.sendRequest(
			VisitTypeUrlsEnum.VisitType_list_GET_With_Editable,
			'GET',
			REQUEST_SERVERS.fd_api_url,
			removeEmptyAndNullsFormObjectAndBindLable(queryParams),
		);
	}

	specialtyHistoryStats(row) {
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
			this.localStorage.setObject('specialityMasterTableList' + this.storageData.getUserId(), data);
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
		this.specialityListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.specialityListTable._internalColumns.sort(function (a, b) {
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
