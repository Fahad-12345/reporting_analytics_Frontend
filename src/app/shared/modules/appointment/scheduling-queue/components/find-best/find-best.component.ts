import { FacilityUrlsEnum } from './../../../../../../front-desk/masters/practice/practice/utils/facility-urls-enum';
import { Component, OnInit, Input, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
// service
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { SubjectService } from './subject.service';
import { SchedulingQueueService } from '../../scheduling-queue.service';
import { ToastrService } from 'ngx-toastr';
import { StorageData, HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { AddToBeSchedulledUrlsEnum } from '@appDir/scheduler-front-desk/modules/add-to-be-scheduled/add-to-be-scheduled-list-urls-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { AssignSpecialityUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-speciality/assign-speciality-urls-enum';
import { AppointmentUrlsEnum } from '../../../appointment-urls-enum';
import { convertDateTimeForRetrieving, convertDateTimeForSending, ConvertDateTimeToUserTimeDate, removeEmptyAndNullsFormObject, unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';
import { WithoutTime } from '@appDir/shared/utils/utils.helpers';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AclService } from '@appDir/shared/services/acl.service';
import { Title } from '@angular/platform-browser';
import { LoaderService } from '@appDir/shared/services/loader.service';
import { DoctorCalendarUrlsEnum } from '@appDir/shared/modules/doctor-calendar/doctor-calendar-urls-enum';
import { Subject, Subscription } from 'rxjs';
import { TransportationModalComponent } from '@appDir/shared/modules/doctor-calendar/modals/transportation-modal/transportation-modal.component';
import { ReferringPhysicianUrlsEnum } from '@appDir/front-desk/masters/practice/referring-physician/referring-physician/referringPhysicianUrlsEnum';

@Component({
	selector: 'app-find-best',
	templateUrl: './find-best.component.html',
	styleUrls: ['./find-best.component.scss'],
})
export class FindBestComponent extends PermissionComponent implements OnInit,OnDestroy {
	@ViewChild('transportationComponent') transportationComponent:TransportationModalComponent

	public check: boolean = false;
	myForm: FormGroup;
	public isEnableButtons: any;
	public numSelected: any;
	public temp: any = [{ date: '', time: '', doctor: '', clinic: '', speciality: '' }];
	public assignClinics = [];
	public assignSpecialities = [];
	public selectedFacilityLocation: any;
	public assignDoctor = [];
	//
	public assignClinicsAll = [{ id: 0, name: 'Location' }];
	public assignSpecialitiesAll = [{ id: 0, name: 'Specialty' }];
	public assignDoctorAll = [
		{ docId: 0, last_name: 'No Provider', user_id: 0, middle_name: '', first_name: '' },
	];
	//
	public interval: number = 30;
	public isStart: boolean = false;
	public weekDay = new Array(5);
	public isOpenFilters: any;
	public isChecked: boolean = false;
	public dayRestrication: any = [];
	public selectedData: any = [];
	public startDate: Date;
	public tempStartDate: any;
	public tempEndDate: any;
	public endDate: Date;
	public minDate: Date;
	public startTime: Date;
	public endTime: Date;
	public allClinicIds = [];
	public minTime: Date;
	public location_check = false;
	public speciality_check = false;
	public provider_check = false;
	public followup;
	public btnSubmit:boolean=false;
	activeModal:NgbModalRef
	transportationForm:any

	@Input() caseId: any;
	@Input() caseType: any;
	@Input() case_type_id: any;
	//
	// @Input() appointmentTitle: any;
	public appointmentTitle: any;
	//
	@Input() typeForAppointment: any;
	@Input() selectedPrioirtyName: any;
	@Input() chartNo: any;

	//
	@Input() appointmentType: any;
	//

	//Medical Doc, Followup Check Variables
	public medKey: any;
	public initType: any;
	public reType: any;
	//
	subscription: Subscription[] = [];
	public selectedClinicName: string;
	public selectedSpecialityName: string;
	public selectedVisitType: any;
	public postObj: any = {
		dateStart: '',
		dateEnd: '2018-01-05T10:00:00.000Z',
		restrictions: [1, 2],
		timeStart: '10:00:00',
		timeEnd: '18:00:00',
		chartNo: 1,
		specId: 4,
		clinicId: 6,
		docId: 0,
		caseType: '',
		case_type_id: '',
		priority: 'cash',
		appointmentTypeId: 1,
		appointmentTitle: 'title',
		caseId: 1,
	};
	public allDoc: any = [];
	startDateError = false;
	endDateError = false;
	startTimeError = false;
	endTimeError = false;
	disabledResetBtn = true;

	eventsSubjectCpt: Subject<any> = new Subject<any>();
	eventsSubjectPhysicians: Subject<any> = new Subject<any>();
	selectedMultipleFieldFiter: any = {
		'cpt_codes_ids': [],
		'physician_id':[]
	};
	EnumApiPath = DoctorCalendarUrlsEnum;
	ReferringPhysician_Listing=ReferringPhysicianUrlsEnum.PHYSICIAN_LISTING;
	ReferringPhysician_LocationListing = ReferringPhysicianUrlsEnum.GET_PHYSICIANS_LIST;

	constructor(
		titleService: Title,
		private route: ActivatedRoute,
		router: Router,
		public aclService: AclService,
		public formBuilder: FormBuilder,
		public schedulingQueueService: SchedulingQueueService,
		public subjectService: SubjectService,
		public deleteModal: NgbModal,
		protected requestService: RequestService,
		private toastrService: ToastrService,
		private storageData: StorageData,
		private loaderService:LoaderService,
		public modalService: NgbModal,
	) {
		super(aclService, router, route, requestService, titleService);
		this.createForm();
		this.allClinicIds = this.storageData.getFacilityLocations();
		this.subscription.push(this.loaderService.startLoader$.subscribe(startLoader=>{
			this.startLoader=startLoader;
		})
		)
		this.getMasterPracticeLocations();
		this.getMasterSpecialities();
		this.getMasterProviders();
		this.weekDay[0] = [{ id: 0, name: 'Sun', isColor: 'false' }];
		this.weekDay[1] = [{ id: 1, name: 'Mon', isColor: 'false' }];
		this.weekDay[2] = [{ id: 2, name: 'Tue', isColor: 'false' }];
		this.weekDay[3] = [{ id: 3, name: 'Wed', isColor: 'false' }];
		this.weekDay[4] = [{ id: 4, name: 'Thu', isColor: 'false' }];
		this.weekDay[5] = [{ id: 5, name: 'Fri', isColor: 'false' }];
		this.weekDay[6] = [{ id: 6, name: 'Sat', isColor: 'false' }];
	}

	getMasterSpecialities() {
		let param = {
			facility_location_id: this.myForm.get('clinicName').value
				? parseInt(this.myForm.get('clinicName').value)
				: this.allClinicIds && this.allClinicIds.length > 0
				? this.allClinicIds
				: null,
			doctor_id: this.myForm.get('doctorName').value
				? parseInt(this.myForm.get('doctorName').value)
				: null,
		};
		this.requestService
			.sendRequest(
				AssignSpecialityUrlsEnum.get_master_specialities,
				'POST',
				REQUEST_SERVERS.schedulerApiUrl1,
				param,
			)
			.subscribe((resp: HttpSuccessResponse) => {
				this.assignSpecialities = [...resp.result.data];
				if (
					this.assignSpecialities &&
					this.assignSpecialities.length > 0 &&
					this.myForm.get('specialityName').value
				) {
					let selectedSpeciality = this.assignSpecialities.find(
						(speciality) => speciality.id == parseInt(this.myForm.get('specialityName').value),
					);
					if (!selectedSpeciality) {
						this.myForm.patchValue({ specialityName: null });
						
					}
					
				}
				else if(this.myForm.get('doctorName').value)
				{
					this.myForm.patchValue({ specialityName: this.assignSpecialities.length==1?this.assignSpecialities[0].id:null });
					this.getMasterProviders();
				}
			},error=>{
				// this.startLoader=false;
			})
	}

	getVisitTypes(specialty_id)
	{
		debugger;
		this.appointmentType=[];
		this.resetCpt();
		if(specialty_id)
		{
			let req={
				specialty_id:specialty_id
			}
			this.requestService
			.sendRequest(
				DoctorCalendarUrlsEnum.specialtyVisitTypes,
				'GET',
				REQUEST_SERVERS.fd_api_url,
				req
	
			)
			.subscribe((res: HttpSuccessResponse) => {
				debugger;
				this.appointmentType = res.result.data;
				this.appointmentType = this.appointmentType && this.appointmentType.map(dta => dta.visit_types[dta.visit_types.length -1]);
				this.typeForAppointment = this.appointmentType && this.appointmentType.length>0? this.appointmentType[0].id:null;
				this.setSelectedVisitType(this.typeForAppointment);
				
				for (let i = 0; i < this.appointmentType.length; i++) {
					if (this.appointmentType[i].slug == 'initial_evaluation') {
						this.initType = this.appointmentType[i].id;
					} else if (this.appointmentType[i].slug == 're_evaluation') {
						this.reType = this.appointmentType[i].id;
					} else if (this.appointmentType[i].slug == 'follow_up') {
						this.followup = this.appointmentType[i].id;
					}
				}
			});
		}
		
	}

	selectionOnValueChange(e: any,_form:FormGroup,Type?) {
		debugger;
		
		_form.controls[Type].setValue(e &&e.formValue?e.formValue:null);
		
	}

	resetCpt()
	{
		this.eventsSubjectCpt.next(true);
	}
	getMasterProviders() {
		let param = {
			speciality_id: this.myForm.get('specialityName').value
				? parseInt(this.myForm.get('specialityName').value)
				: null,
			facility_location_id: this.myForm.get('clinicName').value
				? parseInt(this.myForm.get('clinicName').value)
				: this.allClinicIds && this.allClinicIds.length > 0
				? this.allClinicIds
				: null,
			// doctor_id: this.myForm.get('doctorName').value?parseInt(this.myForm.get('specialityName').value):null
		};
		param = removeEmptyAndNullsFormObject(param);
		this.requestService
			.sendRequest(
				AddToBeSchedulledUrlsEnum.get_master_provider,
				'POST',
				REQUEST_SERVERS.schedulerApiUrl1,
				param,
			)
			.subscribe((response: HttpSuccessResponse) => {
				this.assignDoctor = response.result.data;
				if (
					this.assignDoctor &&
					this.assignDoctor.length > 0 &&
					this.myForm.get('doctorName').value
				) {
					let selecteddoctor = this.assignDoctor.find(
						(doctor) => doctor.id == parseInt(this.myForm.get('doctorName').value),
					);
					if (!selecteddoctor) {
						this.myForm.patchValue({ doctorName: null });
					}
				}
				else if(this.myForm.get('specialityName').value)
				{
					this.myForm.patchValue({ doctorName:null});

				}
				else if(!this.myForm.get('specialityName').value)
				{
					this.myForm.patchValue({ doctorName:null});
				}

				// this.assignDoctorAll = this.allDoc;
			},error=>{
			});
	}

	getSpecialityAndProvider(e?) {
		if(e){
		const spec = this.assignClinics.find(d => d['id'] === Number(e.target.value));
		this.selectedClinicName = `${spec.facility.name} - ${spec.name}`;
		this.selectedFacilityLocation = spec;
		}
		this.disabledResetBtn=false;

		this.getMasterSpecialities();
		this.getMasterProviders();
	}
	getfacilityAndProvider(event?) {
		
		if(event )
		{
			let specialty_id=event.target.value;
			this.getVisitTypes(specialty_id);
		}

		this.disabledResetBtn=false;
		this.getMasterPracticeLocations();
		this.getMasterProviders();
	}

	onchangeSpecialty(event)
	{
		console.log(event);
		if(event){
			const spec = this.assignSpecialities.find(d => d['id'] === Number(event.target.value));
			this.selectedSpecialityName = `${spec.name}`;
			}
		this.getfacilityAndProvider();
		if(event.target.value )
		{
			let specialty_id=event.target.value;
			this.getVisitTypes(specialty_id);
		}
		else
		{
			this.appointmentType=[];
		}
	}
	getFacilityAndSpeciality() {
		this.disabledResetBtn=false;
		this.getMasterPracticeLocations();
		this.getMasterSpecialities();
		
	}

	removeData(controlName: string) {
		this.myForm.get(controlName).reset();
		if (controlName == 'clinicName') {
			this.getSpecialityAndProvider();
		} else if (controlName == 'specialityName') {
			if(this.assignSpecialities.length==1)
			{
				this.myForm.get('doctorName').reset();
				this.getMasterSpecialities();
				
			}
			this.getfacilityAndProvider();
			
			
			
		} else if (controlName == 'doctorName') {
			this.getFacilityAndSpeciality();
		}
	}

	getMasterPracticeLocations() {
		let param = {
			facility_location_id:
				this.allClinicIds && this.allClinicIds.length > 0 ? this.allClinicIds : null,
			speciality_id: this.myForm.get('specialityName').value
				? parseInt(this.myForm.get('specialityName').value)
				: null,

			doctor_id: this.myForm.get('doctorName').value
				? parseInt(this.myForm.get('doctorName').value)
				: null,
		};
		param = removeEmptyAndNullsFormObject(param);
		this.requestService
			.sendRequest(
				FacilityUrlsEnum.get_master_facilities,
				'POST',
				REQUEST_SERVERS.schedulerApiUrl1,
				param,
			)
			.subscribe((response: HttpSuccessResponse) => {
				this.assignClinics = [...response.result.data];
				if (
					this.assignClinics &&
					this.assignClinics.length > 0 &&
					this.myForm.get('clinicName').value
				) {
					let selectedpractice = this.assignClinics.find(
						(practice) => practice.id == parseInt(this.myForm.get('clinicName').value),
					);
					if (!selectedpractice) {
						this.myForm.patchValue({ clinicName: '' });
					}
				}
				else if(this.myForm.get('doctorName').value) {
					this.myForm.patchValue({ clinicName: this.assignClinics.length==1?this.assignClinics[0].id :''});
				}

			},error=>{
			})
	}
	ngOnInit() {
		this.subscription.push(this.subjectService.Changed.subscribe((data) => {
			if (data == true) {
				if (this.selectedData.length == 0) {
					this.isStart = false;
				}
			}
		})
		);
		this.startDate = new Date();
		this.endDate = new Date();
		this.tempStartDate = this.startDate;
		this.tempEndDate = this.endDate;
		this.minDate = new Date(this.startDate);
		this.startTime = new Date();
		this.endTime = new Date();
		this.minTime = new Date(this.startTime);
		this.startTime.setDate(this.startDate.getDate());
		this.startTime.setMonth(this.startDate.getMonth());
		this.startTime.setFullYear(this.startDate.getFullYear());

		this.endTime.setDate(this.endDate.getDate());
		this.endTime.setMonth(this.endDate.getMonth());
		this.endTime.setFullYear(this.endDate.getFullYear());
		this.endTime.setHours(this.startTime.getHours());
		this.endTime.setMinutes(this.startTime.getMinutes() + 30);
		this.myForm.controls['noOfOverBookings'].disable();
		if (this.appointmentType && this.appointmentType.length) {
			for (var ii = 0; ii < this.appointmentType.length; ii++) {
				if (this.appointmentType[ii].slug == 'initial_evaluation') {
					this.initType = this.appointmentType[ii].id;
				} else if (this.appointmentType[ii].slug == 're_evaluation') {
					this.reType = this.appointmentType[ii].id;
				} else if (this.appointmentType[ii].slug == 'follow_up') {
					this.followup = this.appointmentType[ii].id;
				}
			}
			this.setSelectedVisitType(this.typeForAppointment);
		}
		//
	}
	  ngOnDestroy(): void {
		unSubAllPrevious(this.subscription);
	}
	identify(index, item) {
		return item.label;
	 }

	/*Form intilaization function*/
	private createForm() {
		this.myForm = this.formBuilder.group({
			clinicName: ['', Validators.required],
			specialityName: ['',Validators.required],
			doctorName: [''],
			startDate: ['', Validators.required],
			endDate: ['', Validators.required],
			startTime: ['', Validators.required],
			endTime: ['', Validators.required],
			noOfOverBookings: ['', [Validators.required]],
			cpt_codes_ids:[''],
			physician_id:[''],
			is_transportation:[false]
		});
	}

	openTransportation()
	{
		debugger;
		// if(!this.chart)
		// {
		// 	this.toastrService.error('Please add case to add transportation.','Error');
		// 	return;
		// }
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal-view',

		};
		
		let physician_id=this.myForm.get('physician_id').value;
		this.activeModal = this.modalService.open(TransportationModalComponent, ngbModalOptions);
		this.activeModal.componentInstance.patientId=this.chartNo;
		this.activeModal.componentInstance.physician_id=physician_id;
		this.activeModal.componentInstance.transportationFormObj=this.transportationForm
		// this.activeModalSoftPatient.componentInstance.selectedPhysician=

		this.activeModal.result.then(res=>{
				debugger;
			if(res && res.data)
			{
				this.transportationForm=res.data;
				console.log(this.transportationForm);
			}
		});
	}

	public onTransportationChange(event) {

	
	}

	//
	/*Get possible appointment types*/
	public getAppointmentType(event) {
		if(event){
			const spec = this.appointmentType.find(d => d['id'] === Number(event.target.value));
			// this.selectedVisitTypeNam = `${spec.name}`;
			this.setSelectedVisitType(Number(event.target.value))
			}
		this.disabledResetBtn = false;
		this.resetCpt();
		// for (let i = 0; i < this.appointmentType.length; i++) {
		// 	if (this.appointmentType[i].description === event.target.value) {
		// 		this.typeForAppointment = JSON.parse(JSON.stringify(this.appointmentType[i].id));
		// 		break;
		// 	}
		// }
	}

	setSelectedVisitType(clinicId)
	{
		debugger;
	 let selectedVisitTypeName= this.appointmentType.find(clinic=>clinic.id==clinicId);
	 if(selectedVisitTypeName)
	 {
		this.selectedVisitType=selectedVisitTypeName;
	 }
	 else
	 {
		this.selectedVisitType=null
	 }
  
	}

	public clear(event) {
		this.myForm.controls[event].setValue('');
	}
	public changeStartDate() {
		this.disabledResetBtn = false;
		if (this.startDate === null) {
			// this.toastrService.error("Start Date is needed", 'Error')
			this.startDateError = true;
			return;
		} else {
			this.startDateError = false;
		}
		this.tempStartDate = this.startDate;
		this.startTime.setDate(this.startDate.getDate());
		this.startTime.setMonth(this.startDate.getMonth());
		this.startTime.setFullYear(this.startDate.getFullYear());
		this.startDate.setHours(this.startTime.getHours());
		this.startDate.setMinutes(this.startTime.getMinutes());
		this.endDate.setHours(this.startDate.getHours());
		this.endDate.setMinutes(this.startDate.getMinutes() + 30);
		this.endTime.setDate(this.endDate.getDate());
		this.endTime.setMonth(this.endDate.getMonth());
		this.endTime.setFullYear(this.endDate.getFullYear());
		this.minDate = new Date(this.startDate);
		if (this.endDate < this.minDate) {
			this.endDate = this.minDate;
		}
	}

	public onChangeStartDate(event)
	{
		if(event.dateValue)
		{
		  this.startDate=new Date(event.dateValue);
		  
		  this.changeStartDate();
		} 
		else
		{
			this.startDate=null;
			this.changeStartDate();
			
		}
	}

	public onChangeEndDate(event)
	{
	
		if(event.dateValue)
		{
		  this.endDate=new Date(event.dateValue);
		  
		  this.changeEndDate();
		} 
		else
		{
			this.endDate=null;
			this.changeEndDate();
			
		}
	}
	public changeEndDate() {
		this.disabledResetBtn = false;
		if (this.endDate === null) {
			this.endDateError = true;
			// this.coolDialogs.alert("End Date is needed");
			return;
		} else {
			this.endDateError = false;
		}
		if (
			this.startDate.getDate() == this.endDate.getDate() &&
			this.startDate.getMonth() == this.endDate.getMonth() &&
			this.startDate.getFullYear() == this.endDate.getFullYear()
		) {
			this.startTime.setDate(this.startDate.getDate());
			this.startTime.setMonth(this.startDate.getMonth());
			this.startTime.setFullYear(this.startDate.getFullYear());
			this.startDate.setHours(this.startTime.getHours());
			this.startDate.setMinutes(this.startTime.getMinutes());
			this.endDate.setHours(this.startDate.getHours());
			this.endDate.setMinutes(this.startDate.getMinutes() + 30);
			this.endTime.setDate(this.endDate.getDate());
			this.endTime.setMonth(this.endDate.getMonth());
			this.endTime.setFullYear(this.endDate.getFullYear());
			this.minTime = new Date(this.startTime);
		} else {
			this.startTime.setDate(this.startDate.getDate());
			this.startTime.setMonth(this.startDate.getMonth());
			this.startTime.setFullYear(this.startDate.getFullYear());
			this.startDate.setHours(this.startTime.getHours());
			this.startDate.setMinutes(this.startTime.getMinutes());
			this.endDate.setHours(0);
			this.endDate.setMinutes(0);
			this.endTime.setDate(this.endDate.getDate());
			this.endTime.setMonth(this.endDate.getMonth());
			this.endTime.setFullYear(this.endDate.getFullYear());
			this.minTime = new Date(this.endDate);
			if (this.endDate != null) {
				if (this.endDate.getTime() < this.minDate.getTime()) {
					this.toastrService.error('Pick end date with respect to start date');
					return;
				}
			}
		}
		this.tempEndDate = this.endDate;
	}
	public changeStartTime() {

		this.disabledResetBtn = false;
		if (this.startTime === null) {
			this.startTimeError = true;
			// this.toastrService.error("Start time is needed", 'Error');
			return;
		} else {
			this.startTimeError = false;
		}
		this.startTime.setDate(this.startDate.getDate());
		this.startTime.setMonth(this.startDate.getMonth());
		this.startTime.setFullYear(this.startDate.getFullYear());
		this.startDate.setHours(this.startTime.getHours());
		this.startDate.setMinutes(this.startTime.getMinutes());
		this.endDate.setHours(this.endTime.getHours());
		this.endDate.setMinutes(this.endTime.getMinutes());
		this.endTime.setDate(this.endDate.getDate());
		this.endTime.setMonth(this.endDate.getMonth());
		this.endTime.setFullYear(this.endDate.getFullYear());
		if (
			this.startDate.getDate() == this.endDate.getDate() &&
			this.startDate.getMonth() == this.endDate.getMonth() &&
			this.startDate.getFullYear() == this.endDate.getFullYear()
		) {
			this.minTime = new Date(this.startTime);
		} else {
			this.minTime.setHours(0);
			this.minTime.setMinutes(0);
		}
	}
	public changeEndTime() {
		this.disabledResetBtn = false;
		if (this.endTime != null) {
			this.endTimeError = false;
			this.endTime.setDate(this.endDate.getDate());
			this.endTime.setMonth(this.endDate.getMonth());
			this.endTime.setFullYear(this.endDate.getFullYear());
			this.startDate.setHours(this.startTime.getHours());
			this.startDate.setMinutes(this.startTime.getMinutes());
			this.endDate.setHours(this.endTime.getHours());
			this.endDate.setMinutes(this.endTime.getMinutes());
			this.minDate = this.startDate;
			if (this.endTime.getTime() <= this.minTime.getTime()) {
				this.toastrService.error('Pick end Time with respect to start time', 'Error');
				return;
			}
		} else {
			this.endTimeError = true;
			// this.toastrService.error("End time is mandatory", 'Error');
			return;
		}
	}
	/*Change no of overbooking function*/
	public noOfBooking(e) {
		if (e.target.checked) {
			this.myForm.controls['noOfOverBookings'].enable();
			this.isChecked = true;
		} else {
			this.myForm.controls['noOfOverBookings'].disable();
			this.isChecked = false;
		}
	}
	/*Days restrication function*/
	public selectDays(days) {
		this.disabledResetBtn = false;
		this.dayRestrication = Array.from(new Set(this.dayRestrication));
		if (days.isColor === true) {
			days.isColor = false;
			for (var i = 0; i < this.dayRestrication.length; i++) {
				if (this.dayRestrication[i] === days.id) {
					this.dayRestrication.splice(i, 1);
				}
			}
		} else {
			days.isColor = true;
			this.dayRestrication.push(days.id);
		}
	}
	/*Suggest appointment function*/
	public suggestAppointment() {

		if (!this.selectedFacilityLocation?.is_active || !this.selectedFacilityLocation?.facility?.is_active) {
			this.toastrService.error("Selected location(s) are inactive, please contact your supervisor");
			return;
		}
		this.transportationForm=this.getTransportationFormValues();

		if( this.myForm.get('is_transportation').value&& this.transportationComponent &&!this.transportationForm.pickupForm.type && !this.transportationForm.dropoffForm.type)
		{
			this.toastrService.error(
				'You have selected transportation. Please select atleast one option Pick Up or Drop Off.',
				'Error',
			);
			return;
		}
		this.btnSubmit=true;
		if (
			this.myForm.value['clinicName'] == null ||
			this.myForm.value['clinicName'] == undefined ||
			this.myForm.value['clinicName'] == 0
		) {
			this.location_check = true;
		} else {
			this.location_check = false;
		}
		if (
			(this.myForm.value['specialityName'] == null ||
			this.myForm.value['specialityName'] == undefined ||
			this.myForm.value['specialityName'] == 0)&&
			(this.myForm.value['doctorName'] == null ||
		 	this.myForm.value['doctorName'] == undefined ||
		 	this.myForm.value['doctorName'] == 0)
		) 
		{
			return;
		}
		if (this.location_check == false && this.speciality_check == false) {
			this;
			this.startTime.setDate(this.startDate.getDate());
			this.startTime.setMonth(this.startDate.getMonth());
			this.startTime.setFullYear(this.startDate.getFullYear());
			this.startDate.setHours(this.startTime.getHours());
			this.startDate.setMinutes(this.startTime.getMinutes());
			this.endDate.setHours(this.endTime.getHours());
			this.endDate.setMinutes(this.endTime.getMinutes());
			this.endTime.setDate(this.endDate.getDate());
			this.endTime.setMonth(this.endDate.getMonth());
			this.endTime.setFullYear(this.endDate.getFullYear());
			debugger;
			if(WithoutTime(new Date(this.startDate))<WithoutTime(new Date()))
			{
				this.toastrService.error('Back Dated appointment cannot to created through find best', 'Error');
				return;
			}
			if (this.startDate === null) {
				this.toastrService.error('Start Date is needed', 'Error');
				return;
			}
			if (this.endDate === null) {
				this.toastrService.error('End Date is needed', 'Error');
				return;
			}
			if (this.startTime === null) {
				this.toastrService.error('Start time is needed', 'Error');
				return;
			}
			if (this.endTime === null) {
				this.toastrService.error('End time is mandatory', 'Error');
				return;
			}
		if ( WithoutTime(this.endDate) <WithoutTime(this.minDate) ) {
				this.toastrService.error('Pick end date with respect to start date', 'Error');
				return;
			}
			if (this.endTime.getTime() <= this.minTime.getTime()) {
				this.toastrService.error('Pick end time with respect to start time', 'Error');
				return;
			}
			//
			let selectedSpecialityId = parseInt(this.myForm.controls['specialityName'].value);
			// if (
			// 	this.medKey == selectedSpecialityId &&
			// 	this.typeForAppointment != this.initType &&
			// 	this.typeForAppointment != this.followup
			// ) {
			// 	this.toastrService.error(
			// 		'Can only create initial or follow-up against this specailty',
			// 		'Error',
			// 	);
			// 	return;
			// }
			
			// else {
				if (
					this.appointmentTitle === null ||
					this.appointmentTitle == '' ||
					this.appointmentTitle === undefined
				) {
					this.appointmentTitle = 'N/A';
				}
				this.postObj.caseType = this.caseType;
				this.postObj.case_type_id = this.case_type_id;
				this.postObj.caseId = parseInt(this.caseId);
				this.postObj.appointmentTitle = this.appointmentTitle;
				this.postObj.appointmentTypeId = this.typeForAppointment;
				this.postObj.priority = this.selectedPrioirtyName;
				this.startDate.setHours(this.startTime.getHours());
				this.startDate.setMinutes(this.startTime.getMinutes());
				this.endDate.setHours(this.endTime.getHours());
				this.endDate.setMinutes(this.endTime.getMinutes());
				this.postObj.restrictions = this.dayRestrication;
				let  startTime= ConvertDateTimeToUserTimeDate(this.storageData, new Date(this.startTime));
				let endTime= ConvertDateTimeToUserTimeDate(this.storageData, new Date(this.endTime));
				let startDate = ConvertDateTimeToUserTimeDate(this.storageData, this.tempStartDate,true);
				let EndDate = ConvertDateTimeToUserTimeDate(this.storageData, new Date(this.tempEndDate),true);
				this.postObj.timeStart = startTime;
				this.postObj.timeEnd = endTime;
				if (this.isChecked == true) {
					this.postObj.overbooking = parseInt(this.myForm.controls['noOfOverBookings'].value);
				}
				this.postObj.chartNo = this.chartNo;
				this.postObj.timezone = this.storageData.getUserTimeZoneOffset();
				this.postObj.dateStart=startDate
				this.postObj.dateEnd =EndDate
				this.postObj.specId = parseInt(this.myForm.controls['specialityName'].value);
				this.postObj.docId = this.myForm.controls['doctorName'].value
					? parseInt(this.myForm.controls['doctorName'].value)
					: 0;
				this.postObj.clinicId = parseInt(this.myForm.controls['clinicName'].value);
				let params = {
					speciality_id: this.postObj.specId,
					doctor_id: this.postObj.docId != 0 ? this.postObj.docId : null,
					start_date: this.postObj.dateStart,
					end_date: this.postObj.dateEnd,
					facility_location_id: this.postObj.clinicId,
					start_time: this.postObj.timeStart,
					end_time: this.postObj.timeEnd,
					over_booking: this.postObj.overbooking,
					days: this.postObj.restrictions,
					case_id: this.postObj.caseId,
					case_type: this.postObj.caseType,
					case_type_id: this.postObj.case_type_id,
					patient_id: this.postObj.chartNo,
					appointment_title: this.postObj.appointmentTitle,
					priority_slug: this.postObj.priority,
				};

				this.postObj.caseType = this.caseType;
				this.postObj.caseId = parseInt(this.caseId);
				this.postObj.appointmentTitle = this.appointmentTitle;
				this.postObj.appointmentTypeId = this.typeForAppointment;

				this.requestService
					.sendRequest(
						AppointmentUrlsEnum.suggestAppointment,
						'POST',
						REQUEST_SERVERS.schedulerApiUrl1,
						params,
					)
					.subscribe(
						(rres: HttpSuccessResponse) => {
							debugger;
							let res = rres.result.data;
							for (var j = 0; j < res.length; j++) {
								for (var i = 0; i < this.assignClinics.length; i++) {
									if (res[j].clinicId === this.assignClinics[i].id) {
										res[j]['clinicName'] = this.assignClinics[i].name;
									}
								}
							}
							for (var j = 0; j < res.length; j++) {
								for (var i = 0; i < this.assignDoctor.length; i++) {
									if (res[j].docId === this.assignDoctor[i].id) {
										res[j]['docName'] = this.assignDoctor[i].middle_name
											? this.assignDoctor[i].first_name +
											  ' ' +
											  this.assignDoctor[i].middle_name +
											  ' ' +
											  this.assignDoctor[i].last_name
											: this.assignDoctor[i].first_name + ' ' + this.assignDoctor[i].last_name;
									}
								}
							}

							for (var j = 0; j < res.length; j++) {
								for (var i = 0; i < this.assignSpecialities.length; i++) {
									if (res[j].specId === this.assignSpecialities[i].id) {
										res[j]['specName'] = this.assignSpecialities[i].name;
									}
								}
							}
							delete this.postObj.overbooking;
							this.selectedData = res;
							for (var i = 0; i < this.selectedData.length; i++) {
								this.selectedData[i]['isChecked'] = false;
								this.selectedData[i]['appointment_type_id'] = this.typeForAppointment;
								this.selectedData[i].start_date_time=convertDateTimeForRetrieving(this.storageData,new Date(this.selectedData[i].start_date_time))
								this.selectedData[i]['physician_id']=this.myForm.get('physician_id').value?this.myForm.get('physician_id').value:null
								this.selectedData[i]['cpt_codes_ids']=this.myForm.get('cpt_codes_ids').value?this.myForm.get('cpt_codes_ids').value:[]
								this.selectedData[i]['is_transportation']=this.myForm.get('is_transportation').value?true:false;

								let transportation=[]
									if(this.transportationForm)
									{
										transportation=[
											{...this.transportationForm.pickupForm},
											{...this.transportationForm.dropoffForm},
											
										];
									}
								this.selectedData[i]['transportation']=transportation
							}
							this.check = false;
							this.isEnableButtons = true;
							this.numSelected = 0;
							this.subjectService.refresh(this.check);
							this.isStart = true;
						},
						(err) => {
							this.isStart = false;
						},
					);
			// }
		}

		
	}

	getTransportationFormValues()
	{
		if(this.myForm.get('is_transportation').value)
		{
			let transportationFormValues=this.transportationComponent.transportationForm.value;
			return transportationFormValues
		}
		else
		{
			return null;
		}
		
	}

	public resetForm() {
		this.myForm.reset();
		this.appointmentTitle = '';
		this.provider_check = false;
		this.speciality_check = false;
		this.location_check = false;
		this.assignClinics = [];
		this.assignDoctor = [];
		this.assignSpecialities = [];
		this.getMasterPracticeLocations();
		this.getMasterSpecialities();
		this.getMasterProviders();
		this.startDate = new Date();
		this.endDate = new Date();
		this.minDate = new Date(this.startDate);
		this.startTime = new Date();
		this.endTime = new Date();
		this.minTime = new Date(this.startTime);
		this.startTime.setDate(this.startDate.getDate());
		this.startTime.setMonth(this.startDate.getMonth());
		this.startTime.setFullYear(this.startDate.getFullYear());
		this.endTime.setDate(this.endDate.getDate());
		this.endTime.setMonth(this.endDate.getMonth());
		this.endTime.setFullYear(this.endDate.getFullYear());
		this.endTime.setHours(this.startTime.getHours());
		this.endTime.setMinutes(this.startTime.getMinutes() + 30);
		this.weekDay[0] = [{ id: 0, name: 'Sun', isColor: 'false' }];
		this.weekDay[1] = [{ id: 1, name: 'Mon', isColor: 'false' }];
		this.weekDay[2] = [{ id: 2, name: 'Tue', isColor: 'false' }];
		this.weekDay[3] = [{ id: 3, name: 'Wed', isColor: 'false' }];
		this.weekDay[4] = [{ id: 4, name: 'Thur', isColor: 'false' }];
		this.weekDay[5] = [{ id: 5, name: 'Fri', isColor: 'false' }];
		this.weekDay[6] = [{ id: 6, name: 'Sat', isColor: 'false' }];
		this.myForm.controls['noOfOverBookings'].setValue(0);
		this.isChecked = false;
		this.selectedData = [];
		this.check = true;
		this.subjectService.refresh(this.check);
		this.disabledResetBtn=true;
	}
}


