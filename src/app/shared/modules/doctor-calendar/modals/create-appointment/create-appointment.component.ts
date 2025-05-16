import { Validator } from './../../../../dynamic-form/models/validator.model';
import { find } from 'lodash';
import { ReferringPhysicianUrlsEnum } from '@appDir/front-desk/masters/practice/referring-physician/referring-physician/referringPhysicianUrlsEnum';
import { TransportationModalComponent } from '@appDir/shared/modules/doctor-calendar/modals/transportation-modal/transportation-modal.component';
import { DatePipeFormatService } from './../../../../services/datePipe-format.service';
import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
// services
import { SubjectService } from '../../subject.service';
import { DoctorCalendarService } from '@shared/modules/doctor-calendar/doctor-calendar.service';
import { ToastrService } from 'ngx-toastr';
import { StorageData, HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { Router } from '@angular/router';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { DoctorCalendarUrlsEnum } from '../../doctor-calendar-urls-enum';
import { AssignSpecialityUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-speciality/assign-speciality-urls-enum';
import { CancelAppointmentListUrlsEnum } from '@appDir/scheduler-front-desk/modules/cancel-appointment-list/cancel-appointmnet-list-urls-enum';
import { AddToBeSchedulledUrlsEnum } from './../../../../../scheduler-front-desk/modules/add-to-be-scheduled/add-to-be-scheduled-list-urls-enum';
import { AppointmentUrlsEnum } from '@appDir/shared/modules/appointment/appointment-urls-enum';
import { RecurrenceRepeatOptionEnum } from '@appDir/scheduler-front-desk/modules/assign-doctor/assign-doctor-urls-enum';
import { Pagination } from '@appDir/shared/models/pagination';
import { convertDateTimeForRetrieving, convertDateTimeForSending, convertTimeTo24Hours, convertUTCTimeToUserTimeZoneByOffset, getTimeArray, isArray, removeEmptyAndNullsFormObject, stdTimezoneOffset, WithoutTime,checkSelectedLocationsForInactive } from '@appDir/shared/utils/utils.helpers';
import { SoftPatientVisitComponentModal } from '../soft-patient-visit-modal/soft-patient-visit-modal.component';
import { SoftPatientService } from '@appDir/front-desk/soft-patient/services/soft-patient-service';
import { Subject } from 'rxjs';
import { TemplateUrlsEnum } from '@appDir/front-desk/masters/master-users/users/user-edit/template/template-urls-enum';
import { NgSelectShareableComponent } from '@appDir/shared/ng-select-shareable/ng-select-shareable.component';
import { TestRequest } from '@angular/common/http/testing';
import { ignoreElements } from 'rxjs/operators';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { PatientHistoryComponentModal } from '../patient-history/components/patient-history-modal/patient-history-modal-component';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';


@Component({
	selector: 'app-create-appointment',
	templateUrl: './create-appointment.component.html',
	styleUrls: ['./create-appointment.component.scss'],
})
export class CreateAppointmentComponent extends PermissionComponent implements OnInit {
	isCollapsed = false;
	@ViewChild('auto') auto;
	@ViewChild('templateControl') templateControl:NgSelectShareableComponent
	@ViewChild('transportationComponent') transportationComponent:TransportationModalComponent
	@ViewChild('readingProviderControl') readingProviderControl:NgSelectShareableComponent
	myForm: FormGroup;
	WithoutTime = WithoutTime;
	public currentDateTime = new Date();
	public interval: number = 10;
	public duration: any = [];
	public isError: boolean = true;
	public isUnSuccess: boolean = true;
	public caseIdModel: any;
	public weekDay: any = [];
	public isShowRecuurenceBefore: any = true;
	public hideRangeRec: any = true;
	private physician_specialty_id:number;
	public dailyMontlyWeeklyOpt: any;
	public isWeekError: any;
	public changeEndByDate: any;
	public endByDate: any;
	public startDate: Date;
	public startTime: Date;
	public dayListArray: any = [];
	public checkRecExists: any;
	public endByCheck: any = false;
	public endAfterCheck: any = false;
	public isDisableOption: boolean = true;
	public option: any = [];
	public title: any;
	public chart: any;
	public caseId: any;
	public doctor: any;
	public priority: any;
	public type: any;
	public comments: any = '';
	public isRangeRec: any = true;
	public allCaseIds = [];
	public medKey: any;
	public hbotKey: any;
	public clinics: any = [];
	public speciality: any = [];
	public splitter: any;
	public temp;
	public name;
	clinic_location_id: number;
	// public patient_check: any = false;
	// public chart_check: any = false;
	// public case_check: any = false;
	public apt_date_check: any = false;
	public apt_time_check: any = false;
	public duration_check: any = false;
	public location_check: any = false;
	public speciality_check: any = false;
	public provider_check: any = false;
	public aptType;
	public hasInitial = false;
	//HAMZA
	public currClinicSelected: any;
	public disablebtnOnSubmit:boolean=false;
	public btnSubmit:boolean=false;
	public currentDate:Date
	// public doctors = [
	// 	{
	// 		doctorName: 'Provider',
	// 		id: 0,
	// 		docId: 0,
	// 	},
	// ];
	public doctors:any[]=[]
	public Exam: any = [
		{
			roomId: 'Room',
			id: 0,
			docId: 0,
			room: {
				name: 'Room',
			},
		},
	];
	public count;
	public priorityForAppointmentArray: any = [];
	public selectedPriorityId: any;
	public AppointmentPriority: any = [];
	public selectedAppointmentPriorityId: any;
	public AppointmentType: any = [];
	public visitTypeData: any = [];
	public allowMultiCPTs: boolean = true;
	public apidefaulthit: boolean = false;
	public typeForAppointment: any;
	public selectedClinicId: any;
	public selectedRoomId: any = 0;
	public selectedSpecialityId: any;
	public selectedDoctorId: any = 0;
	public endTime: any;
	public initType: any;
	public followType: any;
	public reType: any;
	public enddate: any;
	public minTime: Date;
	public minStartTime: Date;
	public maxEndTime: Date;
	public stDate: Date;
	public edDate: Date;
	private minDate: Date;
	private isDisable: boolean;
	public selectSpId: any;
	public selectSpName: any;
	public checkPatient: any;
	public allClinicIds: any = [];
	public caseTypeidModal: any;
	public billable;
	public first_time_open:boolean=true;
	//
	public docAssignFirstTime: any = -1;
	selectedClinic:any;
	selectedSpecialty:any;
	updateDocWithTime = false;
	//
	//Error vars
	noCaseValidAlpha = true;
	noCaseValidLength = true;
	noChartValidAlpha = true;
	noChartValidLength = true;
	isAllowedAddSoftPatient:boolean=true
	activeModalSoftPatient:NgbModalRef
	eventsSubjectCpt: Subject<any> = new Subject<any>();
	eventsSubjectPhysicians: Subject<any> = new Subject<any>();
	eventsSubjectTechnician: Subject<any> = new Subject<any>();
	eventsSubjectTemplate: Subject<any> = new Subject<any>();
	eventsSubjectReadingProvider: Subject<any> = new Subject<any>();
	selectedMultipleFieldFiter: any = {
		'cpt_codes_ids': [],
		'physician_id':[],
		'technician_id':[],
		'reading_provider_id':[]
	};
	EnumApiPath = DoctorCalendarUrlsEnum;
	ReferringPhysician_Listing=ReferringPhysicianUrlsEnum.PHYSICIAN_LISTING;
	ReferringPhysician_LocationListing = ReferringPhysicianUrlsEnum.GET_PHYSICIANS_LIST;
	getTechnicianListing=AssignSpecialityUrlsEnum.get_supervisor_technicians;
	getTemplateListing=TemplateUrlsEnum.get_all_templates
	requestServerpath = REQUEST_SERVERS;
	transportationForm:any
	templateType:string='';
	templateExtraParamsObj:any={};
	enableCptCodes:boolean=false;
	enableReadingProvider:boolean=false;
	OrderEnum=OrderEnum;
	selectedSpecialtyKey:string=''
	selectedvisitType:any;
	selectedclinicName: string;
	selectedSpecialityName: string;
	selectedAppointmentName: string;
	timeInterval:any[]=[];
	user_timings: any;
	highlightedIndex: number = -1;
	private dateIdToDay = { 0: "Sun", 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat" };
	upKeyPressed: number = 0;

	constructor(
		aclService: AclService,
		private customDiallogService: CustomDiallogService,
		router: Router,
		public activeModal: NgbActiveModal,
		private formBuilder: FormBuilder,
		protected requestService: RequestService,
		public subject: SubjectService,
		public cdr: ChangeDetectorRef,
		public DoctorCalendarService: DoctorCalendarService,
		private toastrService: ToastrService,
		private storageData: StorageData,
		public datePipeService:DatePipeFormatService,
		public softPatientModal: NgbModal,
		public softPatientService:SoftPatientService,
	) {
		super(aclService, router);
		this.createForm();		
		this.option = [
			{ id: RecurrenceRepeatOptionEnum.daily, value: 'Daily' },
			{ id: RecurrenceRepeatOptionEnum.Weekly, value: 'Weekly' },
			{ id: RecurrenceRepeatOptionEnum.Monthly, value: 'Monthly' },
		];
		this.currentDate=new Date();
		this.title = this.DoctorCalendarService.appointmentTitle;
		//if Provider Calendar Selected
		if (this.DoctorCalendarService.PatientSchedulingCalendar == false) {
			if (this.DoctorCalendarService.patientName == null) {
				this.isAllowedAddSoftPatient=true
				this.checkPatient = true;
				// this.patient = null;
				this.myForm.get('patient').setValue(null);
				this.chart = null;
			} else {
				this.isAllowedAddSoftPatient=false
				this.checkPatient = true;
				this.myForm.get('patient').setValue(this.DoctorCalendarService.patientName.name);
				this.chart = this.DoctorCalendarService.patientName.chartNo;
				let item = this.DoctorCalendarService.patientName;
				this.selectEvent(item);
			}
		}
		const scheduler = this.storageData.getSchedulerInfo();
		this.caseIdModel = 0;
		if (
			scheduler.front_desk_manual_calendar_speciality == undefined ||
			scheduler.front_desk_manual_calendar_speciality == ''
		) {
			scheduler.front_desk_manual_calendar_speciality = '0';
		}
		this.selectSpId = scheduler.front_desk_manual_calendar_speciality;
		this.storageData.setSchedulerInfo(scheduler);

		//If Manual Calendar Selected
		if (this.DoctorCalendarService.PatientSchedulingCalendar == true) {
			//this.DoctorCalendarService.patientName = JSON.parse(scheduler.patientData)
			if (this.DoctorCalendarService.patientName == null) {
				this.checkPatient = true;
				// this.patient = null;
				this.myForm.get('patient').setValue(null)
				this.chart = null;
			} else {
				this.checkPatient = false;
				this.myForm.get('patient').setValue(this.getPatientName())
				this.chart = this.DoctorCalendarService.patientName.chartNo;
				this.caseIdModel = this.DoctorCalendarService.patientName.caseId;
				this.caseTypeidModal = this.DoctorCalendarService.patientName.caseType;
				this.myForm.get('case_str').setValue(this.caseIdModel)
				let item = { id: this.chart }; // for new manual cal: selectEvent2()
				this.selectEvent2(item,this.DoctorCalendarService.PatientSchedulingCalendar); //new manual cal func
			}
		}
		this.timeInterval = [...getTimeArray(this.interval)];
	}
	ngOnInit() {
		this.myForm.controls['noOfOccurence'].setValue(1);
		this.startDate = new Date(this.DoctorCalendarService.createAppDate);
		this.setTemplateValidation();
		this.startTime = new Date(this.DoctorCalendarService.createAppDate);
		this.endByDate = new Date(this.DoctorCalendarService.createAppDate);
		this.minTime = new Date(JSON.parse(JSON.stringify(this.startTime)));
		this.enddate = new Date(JSON.parse(JSON.stringify(this.startDate)));
		this.endTime = new Date(JSON.parse(JSON.stringify(this.startTime)));
		this.endTime.setMinutes(JSON.parse(JSON.stringify(this.endTime.getMinutes() + this.interval)));
		var result = this.storageData.getUserPracticeLocationsData();
		this.selectedSpecialityId=this.DoctorCalendarService.currentDocAndSpec && this.DoctorCalendarService.currentDocAndSpec.id && this.DoctorCalendarService.currentDocAndSpec.id!=0?this.DoctorCalendarService.currentDocAndSpec.id :null
		this.setProvidervalidation();
		this.setReferringPhyValidation();
		this.onCloseSoftPatientPopUp();
		this.requestService
			.sendRequest(
				DoctorCalendarUrlsEnum.getAppointmentPriority,
				'GET',
				REQUEST_SERVERS.schedulerApiUrl1,
			)
			.subscribe((res: HttpSuccessResponse) => {
				this.AppointmentPriority = res.result.data;
				this.selectedAppointmentPriorityId = this.AppointmentPriority[0].id;
				this.selectedPriorityId = this.AppointmentPriority[0].id;
			});
		
		if (this.aclService.hasPermission(this.userPermissions.appointment_add)) {
			this.allClinicIds = this.storageData.getFacilityLocations();
		}
		this.requestService
			.sendRequest(
				AssignSpecialityUrlsEnum.getUserInfobyFacility,
				'POST',
				REQUEST_SERVERS.schedulerApiUrl1,
				{
					facility_location_ids: this.allClinicIds,
					speciality_ids:		this.selectedSpecialityId?[this.selectedSpecialityId]:[],
					is_provider_calendar:true,
					per_page: Pagination.per_page,
					// 'filters':,
					page: 1,
					pagination:true
				},
			)
			.subscribe((res: HttpSuccessResponse) => {
				this.clinics = res.result.data.docs;
				if (
					typeof this.DoctorCalendarService.selectedClinic !== 'undefined' &&
					this.DoctorCalendarService.selectedClinic[0].id !== 0 &&
					this.DoctorCalendarService.selectedClinic[0].name !== '' && this.first_time_open
				) {
					if( this.DoctorCalendarService.currentDocAndSpec.doctor)
					{
						let filter_clinic_on_provider_calender=this.DoctorCalendarService.selectedClinic.find(clinic=>clinic.id==this.DoctorCalendarService.currentDocAndSpec.facility_location_id)
						this.selectedClinicId = filter_clinic_on_provider_calender.id;
					}
					else
					{
						this.selectedClinicId = this.DoctorCalendarService.selectedClinic[0].id;
					}
				
					this.myForm.controls['clinicName'].setValue(
						this.selectedClinicId,
					);
					this.setSelectedClinic(this.selectedClinicId)
				} else {
					if(this.clinics && this.clinics.length==1)
					{
					this.selectedClinicId = this.clinics[0].id;
					this.myForm.controls['clinicName'].setValue(this.clinics[0].id);
					this.setSelectedClinic(this.selectedClinicId)
					}
					else if(this.clinics && this.clinics.length>1)
					{
					this.selectedClinicId = null
					this.myForm.controls['clinicName'].setValue('');
					}
				}

				this.requestService
					.sendRequest(
						AssignSpecialityUrlsEnum.GetUserInfoBySpecialities,
						'post',
						REQUEST_SERVERS.schedulerApiUrl1,
						{ 
							facility_location_ids:this.selectedClinicId?[this.selectedClinicId]:this.allClinicIds,
							per_page: Pagination.per_page, 
							page: 1 ,
							pagination:true,
							is_provider_calendar:true,}
					)
					.subscribe(async (resp: HttpSuccessResponse) => {
						this.speciality = resp.result.data.docs;
						for (let i = 0; i < this.speciality.length; i++) {
							if (this.speciality[i].speciality_key == 'medical_doctor') {
								this.medKey = this.speciality[i].id;
							} else if (this.speciality[i].speciality_key == 'hbot') {
								this.hbotKey = this.speciality[i].id;
							}
							if (this.speciality[i].id === parseInt(this.selectSpId)) {
								this.endTime = new Date(JSON.parse(JSON.stringify(this.startTime)));
								this.endTime.setMinutes(
									JSON.parse(JSON.stringify(this.endTime.getMinutes() + this.interval)),
								);
							}
						}
						if (parseInt(this.selectSpId) === 0 && !this.selectedSpecialityId) {
							if(this.speciality && this.speciality.length==1)
							{
								this.interval = this.speciality[0]['time_slot'];
								let temp = 0;
								for (let i = 0; i < 8; i++) {
									temp = temp + this.interval;
									this.duration[i] = temp;
								}
							}
							this.endTime = new Date(JSON.parse(JSON.stringify(this.startTime)));
							this.endTime.setMinutes(
								JSON.parse(JSON.stringify(this.endTime.getMinutes() + this.interval)),
							);
						}

						
						//HAMZA
						//set Speciality
						if (
							this.DoctorCalendarService.currentDocAndSpec &&
							this.DoctorCalendarService.currentDocAndSpec.user_id 
						) {
							//if doc selected
							let tempDoc = this.DoctorCalendarService.currentDocAndSpec.doctor;
							//currently only selecting first speciality of a doctor.
							let docSpecs = tempDoc.specialities;

							this.selectedSpecialityId = docSpecs.id;
							this.myForm.controls['spHName'].setValue(docSpecs.id);
						} else if (
							this.DoctorCalendarService.currentDocAndSpec &&
							typeof this.DoctorCalendarService.currentDocAndSpec.id !== 'undefined'
						) {
							//if only spec selected
							if (
								this.DoctorCalendarService.currentDocAndSpec.id === 0 && this.selectedSpecialityId
							) {
								if(this.speciality && this.speciality.length==1)
					{
						//default Spec Chosen
					}
					else if(this.speciality && this.speciality.length>1)
					{
						let specialtyexist=this.speciality.find(specialty=>specialty.id==this.selectedSpecialityId);
						if(specialtyexist)
						{
							this.myForm.controls['spHName'].setValue(this.selectedSpecialityId);
						}
						else 
						{
							this.selectedSpecialityId = null;
							this.myForm.controls['spHName'].setValue(''); 
						}
					}
								
							} else if (this.DoctorCalendarService.currentDocAndSpec.id !== null) {
								this.speciality.forEach((item, index) => {
									if (item.id == this.DoctorCalendarService.currentDocAndSpec.id) {
										this.selectedSpecialityId = this.speciality[index].id;
										this.myForm.controls['spHName'].setValue(this.speciality[index].id); //Gives the original id
									}
								});
							} else {
								this.selectedSpecialityId = this.DoctorCalendarService.currentDocAndSpec.id;
								this.myForm.controls['spHName'].setValue(
									this.DoctorCalendarService.currentDocAndSpec.id,
								);
							}
						} else {
							
						}

						if (
							this.DoctorCalendarService.currentDocAndSpec &&
							this.DoctorCalendarService.currentDocAndSpec.user_id 
						) {
							//if doc selected
							let tempDoc = this.DoctorCalendarService.currentDocAndSpec.doctor;
							//currently only selecting first speciality of a doctor.
							let docSpecs = tempDoc.specialities;

							this.docAssignFirstTime = this.DoctorCalendarService.currentDocAndSpec.user_id;

						} else if (
							this.DoctorCalendarService.currentDocAndSpec &&
							typeof this.DoctorCalendarService.currentDocAndSpec.id !== 'undefined'
						) {
							//if only spec selected
							if (
								this.DoctorCalendarService.currentDocAndSpec.id === 0 
								 && this.doctors.length>0
							) {
								this.docAssignFirstTime = this.doctors.length>0? this.doctors[0].id:this.docAssignFirstTime;
							} else {
								this.docAssignFirstTime = this.doctors.length>0? this.doctors[0].id:this.docAssignFirstTime;
							}
						} else {
							this.docAssignFirstTime = this.doctors.length>0? this.doctors[0].id:this.docAssignFirstTime;
						}
						/////

						this.specialityChange({ target: { value: this.selectedSpecialityId } });
					});
			});
			this.minMaxTime();
	}

	minMaxTime() {
		let tempData = this.DoctorCalendarService.appointmentsOne;
		let sTime: any = convertTimeTo24Hours(tempData.start_time);
		let eTime: any = convertTimeTo24Hours(tempData.end_time);
		let startDate = new Date(this.DoctorCalendarService.createAppDate);
		let endDate = new Date(this.DoctorCalendarService.createAppDate);
		var stDate = new Date(
		startDate.getFullYear(),
		startDate.getMonth(),
		startDate.getDate(),
		sTime[0] + sTime[1],
		sTime[3] + sTime[4],
		);
		this.minStartTime = stDate;
		this.startTime = this.minStartTime;
		var edDate = new Date(
		endDate.getFullYear(),
		endDate.getMonth(),
		endDate.getDate(),
		eTime[0] + eTime[1],
		eTime[3] + eTime[4],
		);
		this.maxEndTime = edDate;
	}

	identify(index, item) {
		return item.label;
	 }
	 

	getVisitTypes(specialty_id)
	{
		this.AppointmentType=[];
		this.visitTypeData = [];
		this.allowMultiCPTs = true;
		this.typeForAppointment=null;
		this.myForm.get('appointment_type_id').reset();
		this.setSelectedVisitType(null)
		// this.aptSlug=this.AppointmentType[0].slug;
		this.resetCpt();
		this.resetReadingProvider();
		this.isEnableReadingProvider();
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
				this.AppointmentType = res.result.data;
				this.visitTypeData = res && res.result && res.result.data;
				this.AppointmentType = this.AppointmentType && this.AppointmentType.map(dta => dta.visit_types[dta.visit_types.length -1]);
				this.typeForAppointment = this.AppointmentType && this.AppointmentType.length>0? this.AppointmentType[0].id:null;
				this.allowMultiCPTs = this.visitTypeData && this.visitTypeData.length > 0 ? this.visitTypeData[0].allow_multiple_cpt_codes == 1 ? true:false : true;
				this.isEnableSptCodes();
				this.isEnableReadingProvider();
				// this.myForm.get('appointment_type_id').setValue(this.typeForAppointment);
				// this.aptSlug=this.AppointmentType[0].slug;
				for (let i = 0; i < this.AppointmentType.length; i++) {
					if (this.AppointmentType[i].slug == 'initial_evaluation') {
						this.initType = this.AppointmentType[i].id;
					} else if (this.AppointmentType[i].slug == 're_evaluation') {
						this.reType = this.AppointmentType[i].id;
					} else if (this.AppointmentType[i].slug == 'follow_up') {
						this.followType = this.AppointmentType[i].id;
					}
				}
				this.selectAptType();
			});
		}
		
	}
	getPracticeLocations()
	{
		if (this.aclService.hasPermission(this.userPermissions.appointment_add)) {
			this.allClinicIds = this.storageData.getFacilityLocations();
		}
		this.requestService
			.sendRequest(
				AssignSpecialityUrlsEnum.getUserInfobyFacility,
				'POST',
				REQUEST_SERVERS.schedulerApiUrl1,
				{
					facility_location_ids: this.allClinicIds,
					speciality_ids:	this.selectedSpecialityId?[this.selectedSpecialityId]:[],
					is_provider_calendar:true,
					per_page: Pagination.per_page,
					// 'filters':,
					page: 1,
					pagination:true
				},
			)
			.subscribe((res: HttpSuccessResponse) => {
				this.clinics = res.result.data.docs;
				if (
					typeof this.DoctorCalendarService.selectedClinic !== 'undefined' &&
					this.DoctorCalendarService.selectedClinic[0].id !== 0 &&
					this.DoctorCalendarService.selectedClinic[0].name !== '' && this.first_time_open
				) {
					if( this.DoctorCalendarService.currentDocAndSpec.doctor)
					{
						let filter_clinic_on_provider_calender=this.DoctorCalendarService.selectedClinic.find(clinic=>clinic.id==this.DoctorCalendarService.currentDocAndSpec.facility_location_id)
						this.selectedClinicId = filter_clinic_on_provider_calender.id;
					}
					else
					{
						this.selectedClinicId = this.DoctorCalendarService.selectedClinic[0].id;
					}
				
					this.myForm.controls['clinicName'].setValue(
						this.selectedClinicId,
					);
					this.setSelectedClinic(this.selectedClinicId)
					this.first_time_open=false;
				} else {
					if( this.DoctorCalendarService.selectedClinic[0].id === 0 && this.clinics && this.clinics.length==1)
					{
					this.selectedClinicId = this.clinics[0].id;
					this.myForm.controls['clinicName'].setValue(this.clinics[0].id);
					this.setSelectedClinic(this.selectedClinicId)
					}
					else if(this.DoctorCalendarService.selectedClinic[0].id === 0&&this.clinics && this.clinics.length>1)
					{
					this.myForm.controls['clinicName'].setValue(this.selectedClinicId);
					this.setSelectedClinic(this.selectedClinicId);
					}
				}
			});
	}

	geSpecialties()
	{
		this.requestService
					.sendRequest(
						AssignSpecialityUrlsEnum.GetUserInfoBySpecialities,
						'post',
						REQUEST_SERVERS.schedulerApiUrl1,
						{ 
							facility_location_ids:this.selectedClinicId?[this.selectedClinicId]:this.allClinicIds,
							per_page: Pagination.per_page, 
							page: 1 ,
							pagination:true,
							is_provider_calendar:true,}
					)
					.subscribe(async (resp: HttpSuccessResponse) => {
						this.speciality = resp.result.data.docs;
						for (let i = 0; i < this.speciality.length; i++) {
							if (this.speciality[i].speciality_key == 'medical_doctor') {
								this.medKey = this.speciality[i].id;
							} else if (this.speciality[i].speciality_key == 'hbot') {
								this.hbotKey = this.speciality[i].id;
							}
							if (this.speciality[i].id === parseInt(this.selectSpId)) {
								this.selectedSpecialityId = this.speciality[i].id;

								this.interval = this.speciality[i]['time_slot'];

								this.selectSpName = this.speciality[i].id;

								this.endTime = new Date(JSON.parse(JSON.stringify(this.startTime)));
								this.endTime.setMinutes(
									JSON.parse(JSON.stringify(this.endTime.getMinutes() + this.interval)),
								);
							}
						}
						if (parseInt(this.selectSpId) === 0 &&  this.selectedSpecialityId) {
							this.selectedSpecialityId = this.speciality[0].id;
							this.interval = this.speciality[0]['time_slot'];
							let temp = 0;
							for (let i = 0; i < 8; i++) {
								temp = temp + this.interval;
								this.duration[i] = temp;
							}
							this.myForm.controls['duration'].setValue(this.duration[0]);
							this.selectSpName = this.speciality[0].id;
							this.endTime = new Date(JSON.parse(JSON.stringify(this.startTime)));
							this.endTime.setMinutes(
								JSON.parse(JSON.stringify(this.endTime.getMinutes() + this.interval)),
							);
						}
						//HAMZA
						//set Speciality
						if (
							this.DoctorCalendarService.currentDocAndSpec &&
							this.DoctorCalendarService.currentDocAndSpec.user_id 
						) {
							//if doc selected
							let tempDoc = this.DoctorCalendarService.currentDocAndSpec.doctor;
							//currently only selecting first speciality of a doctor.
							let docSpecs = tempDoc.specialities;

							this.selectedSpecialityId = docSpecs.id;
							this.myForm.controls['spHName'].setValue(docSpecs.id);
						} else if (
							this.DoctorCalendarService.currentDocAndSpec &&
							typeof this.DoctorCalendarService.currentDocAndSpec.id !== 'undefined'
						) {
							//if only spec selected
							if (
								this.DoctorCalendarService.currentDocAndSpec.id === 0
								// && this.DoctorCalendarService.currentDocAndSpec.name === ''
							) {
								// this.selectedSpecialityId = this.speciality[0].id;
								// this.myForm.controls['spHName'].setValue(this.speciality[0].id); //default Spec Chosen
							} else if (this.DoctorCalendarService.currentDocAndSpec.id !== null) {
								this.speciality.forEach((item, index) => {
									if (item.id == this.DoctorCalendarService.currentDocAndSpec.id) {
										this.selectedSpecialityId = this.speciality[index].id;
										this.myForm.controls['spHName'].setValue(this.speciality[index].id); //Gives the original id
									}
								});
							} else {
								this.selectedSpecialityId = this.DoctorCalendarService.currentDocAndSpec.id;
								this.myForm.controls['spHName'].setValue(
									this.DoctorCalendarService.currentDocAndSpec.id,
								);
							}
						} 

						if (
							this.DoctorCalendarService.currentDocAndSpec &&
							this.DoctorCalendarService.currentDocAndSpec.user_id 
						) {
							//if doc selected
							let tempDoc = this.DoctorCalendarService.currentDocAndSpec.doctor;
							this.docAssignFirstTime = this.DoctorCalendarService.currentDocAndSpec.user_id;	
						} else if (
							this.DoctorCalendarService.currentDocAndSpec &&
							typeof this.DoctorCalendarService.currentDocAndSpec.id !== 'undefined'
						) {
							//if only spec selected
							if (
								this.DoctorCalendarService.currentDocAndSpec.id === 0 
								 && this.doctors.length>0
							) {
								this.docAssignFirstTime = this.doctors.length>0? this.doctors[0].id:this.docAssignFirstTime;
							} else {
								this.docAssignFirstTime = this.doctors.length>0? this.doctors[0].id:this.docAssignFirstTime;
							}
						} else {
							this.docAssignFirstTime = this.doctors.length>0? this.doctors[0].id:this.docAssignFirstTime;
						}
						/////

						this.specialityChange({ target: { value: this.selectedSpecialityId } });
					});
	}
	private createForm() {
		this.myForm = this.formBuilder.group({
			// appoint_title: [this.title, Validators.required],
			patient: ['', Validators.required],
			chart_str:['',Validators.required],
			case_str:['',Validators.required],
			clinicName: ['', Validators.required],
			appointment_type_id:['', Validators.required],
			comment: '',
			duration: '',
			dailyMontlyWeeklyOpt: RecurrenceRepeatOptionEnum.daily,
			noOfOccurence: '',
			endOccureneceDate: '',
			spHName: ['',Validators.required],
			docName: '',
			billable:[],
			cpt_codes_ids:[],
			physician_id:[],
			technician_id:[],
			template_id:[''],
			template_type:[],
			reading_provider_id:[],
			cd_image:false,
			is_transportation:[false],
			start_time:[],
		});
	}
	public recurrenceChecked(check) {
		if (check.target.checked) {
			this.isShowRecuurenceBefore = false;
			this.hideRangeRec = false;
		} else {
			this.isShowRecuurenceBefore = true;
			this.hideRangeRec = true;
		}
	}
	public rangeRecuurence(event) {
		this.isError = true;
		this.isUnSuccess = true;
		this.minDate = new Date(this.startDate);
		if ((<HTMLInputElement>document.getElementById('rangeRecurrence')).checked === true) {
			this.isRangeRec = false;
			this.myForm.controls['endOccureneceDate'].enable();
			this.myForm.controls['noOfOccurence'].enable();
		}
		if (event.target.checked) {
			this.isRangeRec = false;
			this.myForm.controls['endOccureneceDate'].enable();
			this.myForm.controls['noOfOccurence'].enable();
			this.isDisable = true;
		} else {
			this.isDisable = false;
			this.isRangeRec = true;
		}
		this.hideRangeRec = false;
	}
	public changeRepeatEvery() {
		this.intializeWeek();
		this.dayListArray=[];
		if (
			parseInt(this.myForm.get('dailyMontlyWeeklyOpt').value) === RecurrenceRepeatOptionEnum.daily
		) {
			this.isWeekError = true;
			this.isDisableOption = true;
		} else {
			for (let i = 0; i < this.clinics.length; i++) {
				const tempDayList = JSON.parse(this.clinics[i].day_list);
				if (this.clinics[i].id == this.myForm.controls['clinicName'].value) {
					for (let j = 0; j < this.weekDay.length; j++) {
						for (let x = 0; x < tempDayList.length; x++) {
							if (this.weekDay[j][0].id == tempDayList[x]) {
								this.weekDay[j][0].isColor = true;
							}
						}
					}
				}
			}
			for (let i = 0; i < this.weekDay.length; i++) {
				if (this.weekDay[i][0].isColor == 'false') {
					this.weekDay.splice(i, 1);
					i--;
				}
			}
			this.isDisableOption = false;
		}
	}
	public RecurrenceDoc(event) {
		if (event.target.checked) {
			this.checkRecExists = true;
			this.isShowRecuurenceBefore = false;
			this.hideRangeRec = false;
			this.endAfterCheck = false;
		} else {
			this.checkRecExists = false;
			this.isShowRecuurenceBefore = true;
			this.hideRangeRec = true;
			this.myForm.controls['endOccureneceDate'].setValue(new Date());
			this.myForm.controls['noOfOccurence'].setValue(1);
			this.endAfterCheck = false;
			this.endByCheck = false;
			(<HTMLInputElement>document.getElementById('rangeRecurrence')).checked=false;
			(<HTMLInputElement>document.getElementById('rangeRecurrence')).checked=false;
			(<HTMLInputElement>document.getElementById('rangeRecOption2')).checked = false; 
			(<HTMLInputElement>document.getElementById('rangeRecOption1')).checked = false;
		}
		if (
			parseInt(this.myForm.get('dailyMontlyWeeklyOpt').value) === RecurrenceRepeatOptionEnum.daily
		) {
			this.isDisableOption = true;
		} else {
			this.isDisableOption = false;
		}
		if ((<HTMLInputElement>document.getElementById('rangeRecurrence')).checked === true) {
			this.isRangeRec = false;
			// this.myForm.controls['endOccureneceDate'].enable();
			this.myForm.controls['noOfOccurence'].enable();
			if (event.target.checked) {
				this.isShowRecuurenceBefore = false;
				this.hideRangeRec = false;
			} else {
				this.isShowRecuurenceBefore = true;
				this.hideRangeRec = true;
			}
		} else {
			this.isRangeRec = false;
			this.myForm.controls['noOfOccurence'].enable();

		}
	}

	public onTransportationChange(event) {

	
	}

	public changeWeek(event, val) {
		//HAMZA (Check box trigger when week day name pressed)
		if (val.isChecked == true) {
			val.isChecked = false;
		} else {
			val.isChecked = true;
		}
		event.target.checked = val.isChecked;
		//incase of Name Clicked rather then check box
		// if (event.target.checked == undefined) {
		// 	event.target.checked = val.isChecked;
		// }
		val = parseInt(val.id);
		if (event.target.checked) {
			this.dayListArray.push(val);
			this.dayListArray = Array.from(new Set(this.dayListArray));
			this.isWeekError = true;
		} else {
			this.dayListArray = Array.from(new Set(this.dayListArray));
			for (let i = 0; i < this.dayListArray.length; i++) {
				if (this.dayListArray[i] === val) {
					this.dayListArray.splice(i, 1);
				}
			}
		}
	}
	public endAfter(e) {
		if (e.target.checked) {
			this.endAfterCheck = true;
			this.endByCheck = false;
			this.endAfterClickChange()

		} else {
			this.endAfterCheck = false;
		}
	}
	public endBy(e) {
		if (e.target.checked) {
			this.endByCheck = true;
			this.endAfterCheck = false;
			(<HTMLInputElement>document.getElementById('rangeRecurrence')).checked=true
		} else {
			this.endByCheck = false;
		}
	}
	endAfterClickChange() {
		(<HTMLInputElement>document.getElementById('rangeRecurrence')).checked=true;
		(<HTMLInputElement>document.getElementById('rangeRecOption1')).checked=true;
		this.endByCheck=false;
		this.endAfterCheck=true;
		this.myForm.controls['noOfOccurence'].enable();

	}
	endbyClickChange() {
		(<HTMLInputElement>document.getElementById('rangeRecurrence')).checked=true;
		(<HTMLInputElement>document.getElementById('rangeRecOption2')).checked=true
		this.endByCheck=true;
		this.endAfterCheck=false;
		this.myForm.controls['noOfOccurence'].disable();
	}
	public changeOption() {
		if (
			(<HTMLInputElement>document.getElementById('rangeRecOption2')).checked === true ||
			(<HTMLInputElement>document.getElementById('rangeRecOption1')).checked === true
		) {
			this.isUnSuccess = true;
		} else {
			this.isUnSuccess = false;
		}
	}
	submitCheck = false;
	public submit() {
		this.btnSubmit=true;
		if(this.selectedSpecialtyKey == 'diagnostic' && !this.myForm.get('physician_id').value &&  this.btnSubmit) {
			return;
		}
		if(!checkSelectedLocationsForInactive([parseInt(this.selectedClinic.id)],this.clinics)){
			this.toastrService.error("Selected location(s) is/are inactive, please contact your supervisor",'Error');
			return;
		}
		if(this.transportationComponent&&this.transportationComponent.transportationForm.invalid)
		{
			this.transportationComponent.markFormGroupTouched(this.transportationComponent.transportationForm)
			return ;
		}
		
		let transportation=[];
		
		this.transportationForm=this.getTransportationFormValues();

		if( this.myForm.get('is_transportation').value&& this.transportationComponent &&!this.transportationForm.pickupForm.type && !this.transportationForm.dropoffForm.type)
		{
			this.toastrService.error(
				'You have selected transportation. Please select atleast one option Pick Up or Drop Off.','Error',
			);
			return;
		}
		
		if(this.transportationForm)
		{
			transportation=[
				{...this.transportationForm.pickupForm},
				{...this.transportationForm.dropoffForm},
				
			];
		}
	
		// if()
		console.log(transportation)
		this.disablebtnOnSubmit=true
		this.submitCheck=false;
		this.clinic_location_id = null;
		if (this.startDate == null || this.startDate == undefined) {
			this.apt_time_check = true;
		}
		if(this.myForm.invalid)
		{
			this.disablebtnOnSubmit=false
			return 
		}
		// for (let i = 0; i < this.AppointmentType.length; i++) {
		// 	if (this.aptSlug == this.AppointmentType[i]['slug']) {
		// 		this.typeForAppointment = this.AppointmentType[i]['id'];
		// 	}
		// }
		if (!this.submitCheck) {
			if (this.startTime != null && this.startTime != undefined) {
				this.stDate = new Date(JSON.parse(JSON.stringify(this.startDate)));
				this.stDate.setTime(JSON.parse(JSON.stringify(this.startTime.getTime())));
			}
			let object: any={}
			object['physician_specialty_id']=this.physician_specialty_id;
			let currentDate = new Date();
			if (this.title == undefined || this.title == null || this.title == '') {
				this.title = 'N/A';
			}
			if (
				this.myForm.value['duration'] == null ||
				this.myForm.value['duration'] == undefined ||
				this.myForm.value['duration'] == 'duration'
			) {
				this.duration_check = true;
				this.disablebtnOnSubmit=false
				return 
			} else {
				this.duration_check = false;
			}
			if(!this.myForm.get('patient').value || !this.myForm.get('chart_str').value || !this.myForm.get('case_str').value)
			{
				this.disablebtnOnSubmit=false
				return ;
			}
		
			if (this.startDate == null || this.startDate == undefined) {
				this.apt_date_check = true;
				this.disablebtnOnSubmit=false
			} else {
				this.apt_date_check = false;
			}

			if (this.myForm.value['clinicName'] == null || this.myForm.value['clinicName'] == undefined) {
				this.location_check = true;
				this.disablebtnOnSubmit=false
			} else {
				this.location_check = false;
			}
		
			if (this.myForm.value['spHName'] == null || this.myForm.value['spHName'] == undefined) {
				this.speciality_check = true;
				this.disablebtnOnSubmit=false
			} else {
				this.speciality_check = false;
			}
			if (this.startTime == null || this.startTime == undefined) {
				this.apt_time_check = true;
				this.disablebtnOnSubmit=false
			} else {
				this.apt_time_check = false;
			}
			if (
				this.startDate == undefined ||
				this.enddate == undefined ||
				this.myForm.value['duration'] == 'duration'
			) {
				this.disablebtnOnSubmit=false
			}

			// else if (
			// 	this.medKey == this.selectedSpecialityId &&
			// 	this.typeForAppointment != this.initType &&
			// 	this.typeForAppointment != this.followType
			// ) {
			// 	this.toastrService.error(
			// 		'Can only create initial or follow-up against this specailty',
			// 		'Error',
			// 	);
			// 	this.disablebtnOnSubmit=false
			// } 
			// else if (
			// 	this.hbotKey == this.selectedSpecialityId &&
			// 	this.typeForAppointment != this.followType &&
			// 	this.typeForAppointment != this.initType &&
			// 	this.typeForAppointment != this.reType
			// ) {
			// 	this.toastrService.error(
			// 		'Can only create initial or re-evaluation or progress against this specailty',
			// 		'Error',
			// 	);
			// 	this.disablebtnOnSubmit=false
			// }
			
			else {
				if(this.WithoutTime(this.startDate)>= this.WithoutTime(this.currentDate))
				{
				if (this.checkRecExists == true) {
					if (this.isRangeRec == false) {
						// false means it is checked
						if (this.endByCheck == true) {
							if (this.endByDate != null || this.endByDate != undefined) {
								this.endByDate.setHours(this.endTime.getHours());
								this.endByDate.setMinutes(this.endTime.getMinutes());
								const occurrenceDate = new Date(JSON.parse(JSON.stringify(this.endByDate)));
								occurrenceDate.setHours(23);
								occurrenceDate.setMinutes(59);
								this.stDate.setSeconds(0);
								occurrenceDate.setSeconds(59);
								if (occurrenceDate <= this.stDate) {
									this.toastrService.error(
										'End date of recurrence cannot be equal or less than appointment date',
										'Error',
									);
									this.disablebtnOnSubmit=false
								} else {
									object={
										...object,
										start_date_time: convertDateTimeForSending(
											this.storageData,
											new Date(this.stDate),
										),
										confirmation_status: false,
										comments:
											this.myForm.get('comment').value == null ||
											this.myForm.get('comment').value == ''
												? 'N/A'
												: this.myForm.get('comment').value,
										speciality_id: this.selectedSpecialityId,
										facility_location_id: this.selectedClinicId,
										priority_id: this.selectedPriorityId,
										patient_id: this.chart,
										appointment_type_id: Number(this.typeForAppointment),
										case_id: this.caseIdModel,
										time_slot: parseInt(this.myForm.controls['duration'].value),
										case_type_id: this.caseTypeidModal,
										recurrence_ending_criteria_id: parseInt(
											this.myForm.get('dailyMontlyWeeklyOpt').value,
										),
										end_date_for_recurrence: convertDateTimeForSending(
											this.storageData,
											new Date(occurrenceDate),
										),
										doctor_id: this.myForm.controls['docName'].value? parseInt(this.myForm.controls['docName'].value) : null,
										physician_id: this.myForm.controls['physician_id'].value? parseInt(this.myForm.controls['physician_id'].value) : null,
										cpt_codes: this.myForm.controls['cpt_codes_ids'].value? this.myForm.controls['cpt_codes_ids'].value : null,
										is_speciality_base: (this.myForm.controls['docName'].value)?false:true,
										time_zone: stdTimezoneOffset(),
										is_transportation:this.myForm.get('is_transportation').value?true:false,
										transportation:this.myForm.get('is_transportation').value?transportation:[],
										reading_provider_id: this.myForm.controls['reading_provider_id'].value? parseInt(this.myForm.controls['reading_provider_id'].value) : null,
										cd_image: this.myForm.controls['cd_image'].value,

									};
								object = removeEmptyAndNullsFormObject(object);
									if(object.recurrence_ending_criteria_id!=RecurrenceRepeatOptionEnum.daily)
									{
										object.days=this.dayListArray;
									}
									if (
										!(
											object['case_id'] &&
											object['start_date_time'] &&
											object['appointment_type_id'] &&
											object['patient_id'] &&
											object['priority_id'] &&
											object['speciality_id'] &&
											object['facility_location_id']
										)
									) {
									} else {
										this.DoctorCalendarService.loadSpin = true;
										this.submitCheck = true;
										this.requestService
											.sendRequest(
												CancelAppointmentListUrlsEnum.addAppointmentV1,
												'POST',
												REQUEST_SERVERS.schedulerApiUrl1,								
												object,
											)
											.subscribe(
												(res: HttpSuccessResponse) => {
													this.disablebtnOnSubmit=false
													this.DoctorCalendarService.loadSpin = false;
													if(res?.result?.data?.is_multi){
														this.refreshAppointments(res?.result?.data?.msg_alert_1);
													}
													if (
														res.result && res.result['data'] && res.result['data']['result'] && res.result['data']['result'][0] && 
										                res.result['data']['result'][0]['message'] ===
														'Patient already has appointment at this time.'
													) {
														
			this.customDiallogService.confirm('Add',res.result && res.result['data'] && res.result['data']['result'] && res.result['data']['result'][0] && 
			res.result['data']['result'][0]['message'] + '.Are you sure you want to add.','Yes','No')
		.then((confirmed) => {
			if (confirmed){
				object['confirm'] = true;
				object['physician_specialty_id']=this.physician_specialty_id;
				this.DoctorCalendarService.loadSpin = true;

				this.requestService
					.sendRequest(
						CancelAppointmentListUrlsEnum.addAppointmentV1,
						'POST',
						REQUEST_SERVERS.schedulerApiUrl1,
						
							 object,
						
					)
					.subscribe(
						(respp: HttpSuccessResponse) => {
							this.DoctorCalendarService.loadSpin = false;
							if(respp?.result?.data?.is_multi){
								this.refreshAppointments(respp?.result?.data?.msg_alert_1);
							}
							if (!res.result && res.result['data'] && res.result['data']['result'] && res.result['data']['result'][0] && 
							res.result['data']['result'][0]['message']) {
								///
								this.deleteAptFromScheduleList();
								this.deleteWaitingListEntry(this.caseIdModel, this.chart);
								///
								this.toastrService.success(
									(res && res.result && res.result['data'] && res.result['data']['msg_alert_1'] ? res && res.result && res.result['data'] && res.result['data']['msg_alert_1']:res && res.result && res.result['data'] && res.result['data']['msg_alert_2']?res && res.result && res.result['data'] && res.result['data']['msg_alert_2']:'Added Successfully'),
									'Success',
								);
								this.subject.refresh('add app');
								this.subject.calendar_refresher.next(true);
								this.activeModal.close();
								this.submitCheck = false;
							} else if (respp.result && respp.result['data'] && respp.result['data']['result'] && respp.result['data']['result'][0] && 
							respp.result['data']['result'][0]['message']) {
								this.toastrService.error(
									respp.result && respp.result['data'] && respp.result['data']['result'] && respp.result['data']['result'][0] && 
									respp.result['data']['result'][0]['message'],
									'Error',
								);
								this.submitCheck = false;
							}
						},
						(err) => {
							if(err.status==500)
								{
								this.toastrService.error(err.error.message, 'Error');
									}
							this.DoctorCalendarService.loadSpin = false;
							this.disablebtnOnSubmit=false
							this.activeModal.close();
						},
					);
			}else if(confirmed === false){
			}else{
			}
		})
		.catch();

													} else if (res.result.data[0]&&res.result.data[0]['message']) {
														this.toastrService.error(res.result.data[0]['message'], 'Error');
														this.submitCheck = false;
													} else if (res['message']=='success') {
														///
														this.deleteAptFromScheduleList();
														this.deleteWaitingListEntry(this.caseIdModel, this.chart);
														///
														this.toastrService.success('Successfully Added', 'Success');
														this.subject.calendar_refresher.next(true);
														this.subject.refresh('add app');
														this.activeModal.close();
														this.submitCheck = false;
														this.disablebtnOnSubmit=false
													}
												},
												(err) => {
													if(err.status==500)
													{
														this.toastrService.error(err.error.message, 'Error');
													}
													this.disablebtnOnSubmit=false;
													this.DoctorCalendarService.loadSpin = false;
												},
											);
									}
								}
							} else {
								this.toastrService.error('End by date is required', 'Error');
								this.disablebtnOnSubmit=false;
								return
							}
						} else if (this.endAfterCheck == true) {
							this.stDate.setSeconds(0);

							if (
								this.myForm.get('noOfOccurence').value === null ||
								this.myForm.get('noOfOccurence').value === undefined ||
								this.myForm.get('noOfOccurence').value === ''
							) {
								this.toastrService.error('No of occurrences is undefined', 'Error');
								this.disablebtnOnSubmit=false;
								return
							} else {
								

								object = {
									...object,
									start_date_time: convertDateTimeForSending(
										this.storageData,
										new Date(this.stDate),
									),
									confirmation_status: false,
									comments:
										this.myForm.get('comment').value == null ||
										this.myForm.get('comment').value == ''
											? 'N/A'
											: this.myForm.get('comment').value,
									speciality_id: this.selectedSpecialityId,
									facility_location_id: this.selectedClinicId,
									priority_id: this.selectedPriorityId,
									patient_id: this.chart,
									appointment_type_id: Number(this.typeForAppointment),
									case_id: this.caseIdModel,
									time_slot: parseInt(this.myForm.controls['duration'].value),
									case_type_id: this.caseTypeidModal,
									recurrence_ending_criteria_id: parseInt(
										this.myForm.get('dailyMontlyWeeklyOpt').value,
									),
									end_after_occurences: parseInt(this.myForm.get('noOfOccurence').value),
									doctor_id: this.myForm.controls['docName'].value? parseInt(this.myForm.controls['docName'].value) : null,
									physician_id: this.myForm.controls['physician_id'].value? parseInt(this.myForm.controls['physician_id'].value) : null,
									cpt_codes: this.myForm.controls['cpt_codes_ids'].value? this.myForm.controls['cpt_codes_ids'].value : null,
									is_speciality_base: (this.myForm.controls['docName'].value)?false:true,
									time_zone: stdTimezoneOffset(),
									is_transportation:this.myForm.get('is_transportation').value?true:false,
									transportation:this.myForm.get('is_transportation').value?transportation:[],
									reading_provider_id: this.myForm.controls['reading_provider_id'].value? parseInt(this.myForm.controls['reading_provider_id'].value) : null,
									cd_image: this.myForm.controls['cd_image'].value,

					
								};
								object = removeEmptyAndNullsFormObject(object);
								if(object.recurrence_ending_criteria_id!=RecurrenceRepeatOptionEnum.daily)
									{
										object.days=this.dayListArray;
									}

								if (
									!(
										object['case_id'] &&
										object['start_date_time'] &&
										object['appointment_type_id'] &&
										object['patient_id'] &&
										object['priority_id'] &&
										object['speciality_id'] &&
										object['facility_location_id']
									)
								) {
								} else {
									this.submitCheck = true;
									object['physician_specialty_id']=this.physician_specialty_id;
									this.DoctorCalendarService.loadSpin = true;
									this.requestService
										.sendRequest(
											CancelAppointmentListUrlsEnum.addAppointmentV1,
											'POST',
											REQUEST_SERVERS.schedulerApiUrl1,
											object,
										)
										.subscribe(
											(res: HttpSuccessResponse) => {
												this.DoctorCalendarService.loadSpin = false;
												this.disablebtnOnSubmit=false
												if(res?.result?.data?.is_multi){
													this.refreshAppointments(res?.result?.data?.msg_alert_1);
												}
												if (
													res.result && res.result['data'] && res.result['data']['result'] && res.result['data']['result'][0] && 
										res.result['data']['result'][0]['message'] ===
													'Patient already has appointment at this time.'
												) {

													this.customDiallogService.confirm('Add',	res.result && res.result['data'] && res.result['data']['result'] && res.result['data']['result'][0] && 
													res.result['data']['result'][0]['message'] + '.Are you sure you want to add.','Yes','No')
													.then((confirmed) => {
														if (confirmed){
															object['confirm'] = true;
															this.DoctorCalendarService.loadSpin = true;

															this.requestService
																.sendRequest(
																	CancelAppointmentListUrlsEnum.addAppointmentV1,
																	'POST',
																	REQUEST_SERVERS.schedulerApiUrl1,
																	// {
																		 object,
																	// },
																)
																.subscribe(
																	(respp: HttpSuccessResponse) => {
																		this.DoctorCalendarService.loadSpin = false;
																		if(respp?.result?.data?.is_multi){
																			this.refreshAppointments(respp?.result?.data?.msg_alert_1);
																		}
																		if (!res.result && res.result['data'] && res.result['data']['result'] && res.result['data']['result'][0] && 
																		res.result['data']['result'][0]['message']) {
																			///
																			this.deleteAptFromScheduleList();
																			this.deleteWaitingListEntry(this.caseIdModel, this.chart);
																			///
																			this.toastrService.success((res && res.result && res.result['data'] && res.result['data']['msg_alert_1'] ? res && res.result && res.result['data'] && res.result['data']['msg_alert_1']:res && res.result && res.result['data'] && res.result['data']['msg_alert_2']?res && res.result && res.result['data'] && res.result['data']['msg_alert_2']:'Added Successfully'), 'Success');
																			this.subject.refresh('add app');
																			this.subject.calendar_refresher.next(true);
																			this.submitCheck = false;
																			this.activeModal.close();
																		} else if (respp.result && respp.result['data'] && respp.result['data']['result'] && respp.result['data']['result'][0] && 
																		respp.result['data']['result'][0]['message']) {
																			this.toastrService.error(
																				respp.result && respp.result['data'] && respp.result['data']['result'] && respp.result['data']['result'][0] && respp.result['data']['result'][0]['message'],
																				'Error',
																			);
																			this.submitCheck = false;
																		}
																	},
																	(err) => {
																		if(err.status==500)
																		{
																		this.toastrService.error(err.error.message, 'Error');
																		}
																		this.disablebtnOnSubmit=false
																		this.DoctorCalendarService.loadSpin = false;
																	},
																);
														}else if(confirmed === false){
															this.submitCheck = false;

														}else{
														}
													})
													.catch();

									
												} else if (res.result && res.result['data'] && res.result['data']['result'] && res.result['data']['result'][0] && 
												res.result['data']['result'][0]['message']) {
													this.toastrService.error(res.result && res.result['data'] && res.result['data']['result'] && res.result['data']['result'][0] && 
													res.result['data']['result'][0]['message'], 'Error');
													this.submitCheck = false;
												} else if (res['message']=='success') {
													///
													this.deleteAptFromScheduleList();
													this.deleteWaitingListEntry(this.caseIdModel, this.chart);
													///
													this.toastrService.success('Successfully Added', 'Success');
													this.subject.refresh('add app');
													this.subject.calendar_refresher.next(true);
													this.submitCheck = false;
													this.activeModal.close();
													this.disablebtnOnSubmit=false
												}
											},
											(error) => {
												if(error.status==500)
												{
													this.toastrService.error(error.error.message, 'Error');
												}
												this.DoctorCalendarService.loadSpin = false;
												this.submitCheck = false;
												this.disablebtnOnSubmit=false
											},
										);
								}
							}
						} else {
							this.toastrService.error('Select End By or End After condition in Range', 'Error');
							this.disablebtnOnSubmit=false;
								return
						}
					} else {
						this.toastrService.error('Add Range Of Recurrence', 'Error');
						this.disablebtnOnSubmit=false;
								return
					}
				} else {
					this.stDate.setSeconds(0);
					object = {
						...object,
						start_date_time: convertDateTimeForSending(this.storageData, new Date(this.stDate)),
						confirmation_status: false,
						comments:
							this.myForm.get('comment').value == null || this.myForm.get('comment').value == ''
								? 'N/A'
								: this.myForm.get('comment').value,
						speciality_id: this.selectedSpecialityId,
						facility_location_id: this.selectedClinicId,
						priority_id: this.selectedPriorityId,
						patient_id: this.chart,
						appointment_type_id: Number(this.typeForAppointment),
						case_id: this.caseIdModel,
						time_slot: parseInt(this.myForm.controls['duration'].value),
						case_type_id: this.caseTypeidModal,
						doctor_id: this.myForm.controls['docName'].value? parseInt(this.myForm.controls['docName'].value) : null,
						physician_id: this.myForm.controls['physician_id'].value? parseInt(this.myForm.controls['physician_id'].value) : null,
						cpt_codes: this.myForm.controls['cpt_codes_ids'].value? this.myForm.controls['cpt_codes_ids'].value: null,
						is_speciality_base: (this.myForm.controls['docName'].value)?false:true,
						time_zone: stdTimezoneOffset(),
						is_transportation:this.myForm.get('is_transportation').value?true:false,
						transportation:this.myForm.get('is_transportation').value?transportation:[],
						reading_provider_id: this.myForm.controls['reading_provider_id'].value? parseInt(this.myForm.controls['reading_provider_id'].value) : null,
						cd_image: this.myForm.controls['cd_image'].value,
					};
					object = removeEmptyAndNullsFormObject(object);
					if (
						!(
							object['case_id'] &&
							object['start_date_time'] &&
							object['appointment_type_id'] &&
							object['case_id'] &&
							object['priority_id'] &&
							object['speciality_id'] &&
							object['facility_location_id']
						)
					) {
					} else {
						this.submitCheck = true;
						this.DoctorCalendarService.loadSpin = true;
						this.requestService
							.sendRequest(
								CancelAppointmentListUrlsEnum.addAppointmentV1,
								'POST',
								REQUEST_SERVERS.schedulerApiUrl1,
								object,
							)
							.subscribe(
								(res: HttpSuccessResponse) => {
									this.disablebtnOnSubmit=false
									this.DoctorCalendarService.loadSpin = false;
									if(res?.result?.data?.is_multi){
										this.refreshAppointments(res?.result?.data?.msg_alert_1);
									}
									if (
										res.result && res.result['data'] && res.result['data']['result'] && res.result['data']['result'][0] && 
										res.result['data']['result'][0]['message'] ===
										'Patient already has appointment at this time.'
									) {

										this.customDiallogService.confirm('Add',res.result && res.result['data'] && res.result['data']['result'] && res.result['data']['result'][0] && 
										res.result['data']['result'][0]['message'] + '.Are you sure you want to add.','Yes','No')
		.then((confirmed) => {
			if (confirmed){
				object[0]['appointment']['confirm'] = true;
				this.DoctorCalendarService.loadSpin = true;

				this.requestService
					.sendRequest(
						CancelAppointmentListUrlsEnum.addAppointmentV1,
						'POST',
						REQUEST_SERVERS.schedulerApiUrl1,
						object,
					)
					.subscribe(
						(respp: HttpSuccessResponse) => {
							this.DoctorCalendarService.loadSpin = false;
							if(respp?.result?.data?.is_multi){
								this.refreshAppointments(respp?.result?.data?.msg_alert_1);
							}
							if (!(respp.result && respp.result['data'] && respp.result['data']['result'] && respp.result['data']['result'][0] && 
							respp.result['data']['result'][0]['message'])) {
								if (
									respp.result && respp.result['data'] && respp.result['data']['result'] && respp.result['data']['result'][0] && 
							respp.result['data']['result'][0]['time_slots ']
									 !=
									parseInt(this.myForm.controls['duration'].value)
								) {
									this.deleteAptFromScheduleList();
									this.deleteWaitingListEntry(this.caseIdModel, this.chart);
									this.toastrService.success(
										`Appointment is created of ${respp.result && respp.result['data'] && respp.result['data']['result'] && respp.result['data']['result'][0] && respp.result['data']['result'][0]['time_slots']} min instead of ${parseInt(this.myForm.controls['duration'].value)}  min`,
										'Success',
									);
									this.subject.refresh('add app');
									this.submitCheck = false;
								} else {
									///
									this.deleteAptFromScheduleList();
									this.deleteWaitingListEntry(this.caseIdModel, this.chart);
									///
									this.toastrService.success((res && res.result && res.result['data'] && res.result['data']['msg_alert_1'] ? res && res.result && res.result['data'] && res.result['data']['msg_alert_1']:res && res.result && res.result['data'] && res.result['data']['msg_alert_2']?res && res.result && res.result['data'] && res.result['data']['msg_alert_2']:'Added Successfully'), 'Success');
									//this.toastrService.success('Successfully Added', 'Success');
									this.subject.refresh('add app');
									this.subject.calendar_refresher.next(true);
									this.submitCheck = false;
								}
								this.activeModal.close();
							} else if (respp.result && respp.result['data'] && respp.result['data']['result'] && respp.result['data']['result'][0] && 
							respp.result['data']['result'][0]['message']) {
								this.submitCheck = false;
								this.toastrService.error(
									respp.result && respp.result['data'] && respp.result['data']['result'] && respp.result['data']['result'][0] && 
									respp.result['data']['result'][0]['message'],
									'Error',
								);
							}
						},
						(err) => {
							if(err.status==500)
								{
					this.toastrService.error(err.error.message, 'Error');
								}
							this.disablebtnOnSubmit=false
							this.DoctorCalendarService.loadSpin = false;
						},
					);
			}else if(confirmed === false){
				this.disablebtnOnSubmit=false
				this.submitCheck = false;
			}else{
			}
		})
		.catch();
									} else if (res.result && res.result['data'] && res.result['data']['result'] && res.result['data']['result'][0] && 
									res.result['data']['result'][0]['message']) {
										this.submitCheck = false;
										this.toastrService.error(res.result && res.result['data'] && res.result['data']['result'] && res.result['data']['result'][0] && 
										res.result['data']['result'][0]['message'], 'Error');
									} else if (res['message']=='success') {
										if (

											res.result && res.result['data'] && res.result['data']['result'] && res.result['data']['result'][0] && 
										res.result['data']['result'][0]['time_slots'] !=
											parseInt(this.myForm.controls['duration'].value)
										) {
											this.deleteAptFromScheduleList();
											this.deleteWaitingListEntry(this.caseIdModel, this.chart);
											this.toastrService.success(
												`Appointment is created of ${res.result && res.result['data'] && res.result['data']['result'] && res.result['data']['result'][0] && res.result['data']['result'][0]['time_slots']} min instead of ${parseInt(this.myForm.controls['duration'].value)}  min`
											);
											this.subject.refresh('add app');
											this.submitCheck = false;
										} else {
											///
											this.deleteAptFromScheduleList();
											this.deleteWaitingListEntry(this.caseIdModel, this.chart);
											///
											this.submitCheck = false;
											this.toastrService.success((res && res.result && res.result['data'] && res.result['data']['msg_alert_1'] ? res && res.result && res.result['data'] && res.result['data']['msg_alert_1']:res && res.result && res.result['data'] && res.result['data']['msg_alert_2']?res && res.result && res.result['data'] && res.result['data']['msg_alert_2']:'Successfully Added'), 'Success');
											this.subject.refresh('add app');
											this.subject.calendar_refresher.next(true);
										}
										this.activeModal.close();
									}
								},
								(error) => {
									this.submitCheck = false;
									this.disablebtnOnSubmit=false
									this.DoctorCalendarService.loadSpin = false;
									if(error.status == 500)
									{
							this.toastrService.error(error.error.message,'Error');	
									}
									
									this.submitCheck = false;
								},
							);
					}
				}
				}
			else
			{
				if (this.checkRecExists == true) {
					if (this.isRangeRec == false) {
						// false means it is checked
						if (this.endByCheck == true) {
							if (this.endByDate != null || this.endByDate != undefined) {
								this.endByDate.setHours(this.endTime.getHours());
								this.endByDate.setMinutes(this.endTime.getMinutes());
								const occurrenceDate = new Date(JSON.parse(JSON.stringify(this.endByDate)));
								occurrenceDate.setHours(23);
								occurrenceDate.setMinutes(59);
								this.stDate.setSeconds(0);
								occurrenceDate.setSeconds(59);
								if (occurrenceDate <= this.stDate) {
									this.toastrService.error(
										'End date of recurrence cannot be equal or less than appointment date',
										'Error',
									);
									this.disablebtnOnSubmit=false
								} else {
									object = {
										...object,
										start_date_time: convertDateTimeForSending(
											this.storageData,
											new Date(this.stDate),
										),
										confirmation_status: false,
										comments:
											this.myForm.get('comment').value == null ||
											this.myForm.get('comment').value == ''
												? 'N/A'
												: this.myForm.get('comment').value,
										speciality_id: this.selectedSpecialityId,
										facility_location_id: this.selectedClinicId,
										priority_id: this.selectedPriorityId,
										patient_id: this.chart,
										appointment_type_id:Number( this.typeForAppointment),
										case_id: this.caseIdModel,
										time_slot: parseInt(this.myForm.controls['duration'].value),
										case_type_id: this.caseTypeidModal,
										// "user_id": 1,
										recurrence_ending_criteria_id: parseInt(
											this.myForm.get('dailyMontlyWeeklyOpt').value,
										),
										end_date_for_recurrence: convertDateTimeForSending(
											this.storageData,
											new Date(occurrenceDate),
										),
										// doctor_id: this.selectedDoctorId == 0 ? null : this.selectedDoctorId,
										doctor_id: this.myForm.controls['docName'].value? parseInt(this.myForm.controls['docName'].value) : null,
										physician_id: this.myForm.controls['physician_id'].value? parseInt(this.myForm.controls['physician_id'].value) : null,
										cpt_codes: this.myForm.controls['cpt_codes_ids'].value? this.myForm.controls['cpt_codes_ids'].value : null,
										is_speciality_base: (this.myForm.controls['docName'].value)?false:true,
										billable:this.myForm.controls['billable'].value,
										time_zone:stdTimezoneOffset(),
										is_transportation:this.myForm.get('is_transportation').value?true:false,
										transportation:this.myForm.get('is_transportation').value?transportation:[],
										technician_id:this.myForm.controls['technician_id'].value? this.myForm.controls['technician_id'].value : null,
										template_id:this.myForm.controls['template_id'].value? this.myForm.controls['template_id'].value : null,
										template_type:this.templateType,
										reading_provider_id: this.myForm.controls['reading_provider_id'].value? parseInt(this.myForm.controls['reading_provider_id'].value) : null,
										cd_image: this.myForm.controls['cd_image'].value,
									};
								object = removeEmptyAndNullsFormObject(object);
									if(object.recurrence_ending_criteria_id!=RecurrenceRepeatOptionEnum.daily)
									{
										object.days=this.dayListArray;
									}
									if (
										!(
											object['case_id'] &&
											object['start_date_time'] &&
											object['appointment_type_id'] &&
											object['patient_id'] &&
											object['priority_id'] &&
											object['speciality_id'] &&
											object['facility_location_id']
										)
									) {
										//  this.toastrService.error('Please complete the form.', 'Error')
									} else {
										this.DoctorCalendarService.loadSpin = true;
										this.submitCheck = true;
										this.requestService
											.sendRequest(
												CancelAppointmentListUrlsEnum.addBackdatedAppointmentV1,
												'POST',
												REQUEST_SERVERS.schedulerApiUrl1,
												object,
											)
											.subscribe(
												(res: HttpSuccessResponse) => {
													this.disablebtnOnSubmit=false
													this.DoctorCalendarService.loadSpin = false;
													if(res?.result?.data?.is_multi){
														this.refreshAppointments(res?.result?.data?.msg_alert_1);
														return
													}
													if (
														res.result.data[0]&&res.result.data[0]['message'] ===
														'Patient already has appointment at this time.'
													) {

														this.customDiallogService.confirm('Add',	res.result.data[0]['message'] + '.Are you sure you want to add.','Yes','No')
		.then((confirmed) => {
			if (confirmed){
				
				object['confirm'] = true;
				this.DoctorCalendarService.loadSpin = true;

				this.requestService
					.sendRequest(
						CancelAppointmentListUrlsEnum.addBackdatedAppointmentV1,
						'POST',
						REQUEST_SERVERS.schedulerApiUrl1,
						
							 object,
						
					)
					.subscribe(
						(respp: HttpSuccessResponse) => {
							this.DoctorCalendarService.loadSpin = false;
							if(respp?.result?.data?.is_multi){
								this.refreshAppointments(respp?.result?.data?.msg_alert_1);
								return
							}
							if (!respp.result.data[0]['message']) {
								///
								this.deleteAptFromScheduleList();
								this.deleteWaitingListEntry(this.caseIdModel, this.chart);
								///
								this.toastrService.success(
									(respp && respp.result && respp.result['data'] && respp.result['data']['msg_alert_1'] ? respp && respp.result && respp.result['data'] && respp.result['data']['msg_alert_1']:respp && respp.result && respp.result['data'] && respp.result['data']['msg_alert_2']?respp && respp.result && respp.result['data'] && respp.result['data']['msg_alert_2']:'Added Successfully') ,
									'Success',
								);
								this.subject.refresh('add app');
								this.subject.calendar_refresher.next(true);
								this.activeModal.close();
								this.submitCheck = false;
							} else if (respp.result.data[0]['message']) {
								this.toastrService.error(
									respp.result.data[0]['message'],
									'Error',
								);
								this.submitCheck = false;
							}
						},
						(err) => {
							if(err.status==500)
								{
								this.toastrService.error(err.error.message, 'Error');
								}
							this.DoctorCalendarService.loadSpin = false;
							this.disablebtnOnSubmit=false
							this.activeModal.close();
						},
					);
			}else if(confirmed === false){
				this.submitCheck = false;
			    this.disablebtnOnSubmit=false
			}else{
			}
		})
		.catch();

													} else if (res.result.data[0]&&res.result.data[0]['message']) {
														this.toastrService.error(res.result.data[0]['message'], 'Error');
														this.submitCheck = false;
													} else if (res['message']=='success') {
														///
														this.deleteAptFromScheduleList();
														this.deleteWaitingListEntry(this.caseIdModel, this.chart);
														///
														this.toastrService.success('Successfully Added', 'Success');
														this.subject.calendar_refresher.next(true);
														this.subject.refresh('add app');
														this.activeModal.close();
														this.submitCheck = false;
														this.disablebtnOnSubmit=false
													}
												},
												(err) => {
													if(err.status==500)
													{
														this.toastrService.error(err.error.message, 'Error');
													}
													this.DoctorCalendarService.loadSpin = false;
													this.disablebtnOnSubmit=false
												},
											);
									}
								}
							} else {
								this.toastrService.error('End by date is required', 'Error');
								this.disablebtnOnSubmit=false;
								return
							}
						} else if (this.endAfterCheck == true) {
							this.stDate.setSeconds(0);

							if (
								this.myForm.get('noOfOccurence').value === null ||
								this.myForm.get('noOfOccurence').value === undefined ||
								this.myForm.get('noOfOccurence').value === ''
							) {
								this.toastrService.error('No of occurrences is undefined', 'Error');
								this.disablebtnOnSubmit=false;
								return
							} else {


								object = {
									start_date_time: convertDateTimeForSending(
										this.storageData,
										new Date(this.stDate),
									),
									confirmation_status: false,
									comments:
										this.myForm.get('comment').value == null ||
										this.myForm.get('comment').value == ''
											? 'N/A'
											: this.myForm.get('comment').value,
									speciality_id: this.selectedSpecialityId,
									facility_location_id: this.selectedClinicId,
									priority_id: this.selectedPriorityId,
									patient_id: this.chart,
									appointment_type_id: Number(this.typeForAppointment),
									case_id: this.caseIdModel,
									time_slot: parseInt(this.myForm.controls['duration'].value),
									case_type_id: this.caseTypeidModal,
									// "user_id": 1,
									recurrence_ending_criteria_id: parseInt(
										this.myForm.get('dailyMontlyWeeklyOpt').value,
									),
									end_after_occurences: parseInt(this.myForm.get('noOfOccurence').value),
									// doctor_id: this.selectedDoctorId == 0 ? null : this.selectedDoctorId,
									doctor_id: this.myForm.controls['docName'].value? parseInt(this.myForm.controls['docName'].value) : null,
									physician_id: this.myForm.controls['physician_id'].value? parseInt(this.myForm.controls['physician_id'].value) : null,
									cpt_codes: this.myForm.controls['cpt_codes_ids'].value? this.myForm.controls['cpt_codes_ids'].value : null,
									is_speciality_base: (this.myForm.controls['docName'].value)?false:true,
									billable:this.myForm.controls['billable'].value,
									time_zone: stdTimezoneOffset(),
									is_transportation:this.myForm.get('is_transportation').value?true:false,
									transportation:this.myForm.get('is_transportation').value?transportation:[],
									technician_id:this.myForm.controls['technician_id'].value? this.myForm.controls['technician_id'].value : null,
									template_id:this.myForm.controls['template_id'].value? this.myForm.controls['template_id'].value : null,
									template_type:this.templateType,
									reading_provider_id: this.myForm.controls['reading_provider_id'].value? parseInt(this.myForm.controls['reading_provider_id'].value) : null,
									cd_image: this.myForm.controls['cd_image'].value,
					
								};
								object = removeEmptyAndNullsFormObject(object);
								if(object.recurrence_ending_criteria_id!=RecurrenceRepeatOptionEnum.daily)
									{
										object.days=this.dayListArray;
									}

								if (
									!(
										object['case_id'] &&
										object['start_date_time'] &&
										object['appointment_type_id'] &&
										object['patient_id'] &&
										object['priority_id'] &&
										object['speciality_id'] &&
										object['facility_location_id']
									)
								) {
								} else {
									this.submitCheck = true;
									this.DoctorCalendarService.loadSpin = true;
									this.requestService
										.sendRequest(
											CancelAppointmentListUrlsEnum.addBackdatedAppointmentV1,
											'POST',
											REQUEST_SERVERS.schedulerApiUrl1,
											//   {
											//     "allApps": object
											//   }
											object,
										)
										.subscribe(
											(res: HttpSuccessResponse) => {
												this.DoctorCalendarService.loadSpin = false;
												this.disablebtnOnSubmit=false
												if(res?.result?.data?.is_multi){
													this.refreshAppointments(res?.result?.data?.msg_alert_1);
													return
												}
												if (
													res.result.data[0]&&res.result.data[0]['message'] ===
													'Patient already has appointment at this time.'
												) {


													this.customDiallogService.confirm('Add',res.result.data[0]['message'] + '.Are you sure you want to add.','Yes','No')
		.then((confirmed) => {
			if (confirmed){
				object['confirm'] = true;
				this.DoctorCalendarService.loadSpin = true;

				this.requestService
					.sendRequest(
						CancelAppointmentListUrlsEnum.addBackdatedAppointmentV1,
						'POST',
						REQUEST_SERVERS.schedulerApiUrl1,
						// {
							 object,
						// },
					)
					.subscribe(
						(respp: HttpSuccessResponse) => {
							this.DoctorCalendarService.loadSpin = false;
							if(respp?.result?.data?.is_multi){
								this.refreshAppointments(respp?.result?.data?.msg_alert_1);
								return
							}
							if (!respp.result.data[0]['message']) {
								///
								this.deleteAptFromScheduleList();
								this.deleteWaitingListEntry(this.caseIdModel, this.chart);
								///
								this.toastrService.success((respp && respp.result && respp.result['data'] && respp.result['data']['msg_alert_1'] ? respp && respp.result && respp.result['data'] && respp.result['data']['msg_alert_1']:respp && respp.result && respp.result['data'] && respp.result['data']['msg_alert_2']?respp && respp.result && respp.result['data'] && respp.result['data']['msg_alert_2']:'Added Successfully'), 'Success');
								this.subject.refresh('add app');
								this.subject.calendar_refresher.next(true);
								this.submitCheck = false;
								this.activeModal.close();
							} else if (respp.result.data[0]['message']) {
								this.toastrService.error(
									respp.result.data[0]['message'],
									'Error',
								);
								this.submitCheck = false;
							}
						},
						(err) => {
							if(err.status==500)
									{
									this.toastrService.error(err.error.message, 'Error');
									}
							this.disablebtnOnSubmit=false
							this.DoctorCalendarService.loadSpin = false;
						},
					);
			}else if(confirmed === false){
				this.submitCheck = false;
				this.disablebtnOnSubmit=false
			}else{
			}
		})
		.catch();

												} else if (res.result.data[0]&&res.result.data[0]['message']) {
													this.toastrService.error(res.result.data[0]['message'], 'Error');
													this.submitCheck = false;
												} else if (res['message']=='success') {
													///
													this.deleteAptFromScheduleList();
													this.deleteWaitingListEntry(this.caseIdModel, this.chart);
													///
													this.toastrService.success('Successfully Added', 'Success');
													this.subject.refresh('add app');
													this.subject.calendar_refresher.next(true);
													this.submitCheck = false;
													this.activeModal.close();
													this.disablebtnOnSubmit=false
												}
											},
											(error) => {
												if(error.status==500)
													{
														this.toastrService.error(error.error.message, 'Error');
													}
												this.DoctorCalendarService.loadSpin = false;
												this.submitCheck = false;
												this.disablebtnOnSubmit=false
											},
										);
								}
							}
						} else {
							this.toastrService.error('Select End By or End After condition in Range', 'Error');
							this.disablebtnOnSubmit=false;
								return
						}
					} else {
						this.toastrService.error('Add Range Of Recurrence', 'Error');
						this.disablebtnOnSubmit=false;
								return
					}
				} else {
					this.stDate.setSeconds(0);
					object = {
						...object,
						start_date_time: convertDateTimeForSending(this.storageData, new Date(this.stDate)),
						confirmation_status: false,
						comments:
							this.myForm.get('comment').value == null || this.myForm.get('comment').value == ''
								? 'N/A'
								: this.myForm.get('comment').value,
						speciality_id: this.selectedSpecialityId,
						facility_location_id: this.selectedClinicId,
						priority_id: this.selectedPriorityId,
						patient_id: this.chart,
						appointment_type_id: Number(this.typeForAppointment),
						case_id: this.caseIdModel,
						time_slot: parseInt(this.myForm.controls['duration'].value),
						case_type_id: this.caseTypeidModal,
						doctor_id: this.myForm.controls['docName'].value? parseInt(this.myForm.controls['docName'].value) : null,
						physician_id: this.myForm.controls['physician_id'].value? parseInt(this.myForm.controls['physician_id'].value) : null,
						cpt_codes: this.myForm.controls['cpt_codes_ids'].value? this.myForm.controls['cpt_codes_ids'].value : null,
						is_speciality_base: (this.myForm.controls['docName'].value)?false:true,
						billable:this.myForm.controls['billable'].value,
						time_zone: stdTimezoneOffset(),
						is_transportation:this.myForm.get('is_transportation').value?true:false,
						transportation:this.myForm.get('is_transportation').value?transportation:[],
						technician_id:this.myForm.controls['technician_id'].value? this.myForm.controls['technician_id'].value : null,
						template_id:this.myForm.controls['template_id'].value? this.myForm.controls['template_id'].value : null,
						template_type:this.templateType,
						reading_provider_id: this.myForm.controls['reading_provider_id'].value? parseInt(this.myForm.controls['reading_provider_id'].value) : null,
						cd_image: this.myForm.controls['cd_image'].value,
					};

					object = removeEmptyAndNullsFormObject(object);

					if (
						!(
							object['case_id'] &&
							object['start_date_time'] &&
							object['appointment_type_id'] &&
							object['case_id'] &&
							object['priority_id'] &&
							object['speciality_id'] &&
							object['facility_location_id']
						)
					) {
						// this.toastrService.error('Please complete the form.', 'Error')
					} else {
						this.submitCheck = true;
						this.DoctorCalendarService.loadSpin = true;
						this.requestService
							.sendRequest(
								CancelAppointmentListUrlsEnum.addBackdatedAppointmentV1,
								'POST',
								REQUEST_SERVERS.schedulerApiUrl1,								
								object,
							)
							.subscribe(
								(res: HttpSuccessResponse) => {
									this.disablebtnOnSubmit=false
									this.DoctorCalendarService.loadSpin = false;
									if(res?.result?.data?.is_multi){
										this.refreshAppointments(res?.result?.data?.msg_alert_1);
										return
									}
									if (
										res.result.data[0]&&res.result.data[0]['message'] ===
										'Patient already has appointment at this time.'
									) {

										this.customDiallogService.confirm('Add',res.result.data[0]['message'] + '.Are you sure you want to add.','Yes','No')
		.then((confirmed) => {
			if (confirmed){
				object[0]['appointment']['confirm'] = true;
				this.DoctorCalendarService.loadSpin = true;

				this.requestService
					.sendRequest(
						CancelAppointmentListUrlsEnum.addBackdatedAppointmentV1,
						'POST',
						REQUEST_SERVERS.schedulerApiUrl1,															
						object,
					)
					.subscribe(
						(respp: HttpSuccessResponse) => {
							this.DoctorCalendarService.loadSpin = false;
							if(respp?.result?.data?.is_multi){
								this.refreshAppointments(respp?.result?.data?.msg_alert_1);
								return
							}
							if (!respp.result.data[0]['message']) {
								if (													
									respp.result.data[0].time_slots !=
									parseInt(this.myForm.controls['duration'].value)
								) {
									this.deleteAptFromScheduleList();
									this.deleteWaitingListEntry(this.caseIdModel, this.chart);
									this.toastrService.success(
										'Appointment is created of ' +
											respp.result.data[0].time_slots +
											' min instead of' +
											parseInt(this.myForm.controls['duration'].value) +
											' min',
										'Success',
									);
									this.subject.refresh('add app');
									this.submitCheck = false;
								} else {
									///
									this.deleteAptFromScheduleList();
									this.deleteWaitingListEntry(this.caseIdModel, this.chart);
									///
									this.toastrService.success((respp && respp.result && respp.result['data'] && respp.result['data']['msg_alert_1'] ? respp && respp.result && respp.result['data'] && respp.result['data']['msg_alert_1']:respp && respp.result && respp.result['data'] && respp.result['data']['msg_alert_2']?respp && respp.result && respp.result['data'] && respp.result['data']['msg_alert_2']:'Added Successfully'), 'Success');
									this.subject.refresh('add app');
									this.subject.calendar_refresher.next(true);
									this.submitCheck = false;
								}
								this.activeModal.close();
							} else if (respp.result.data[0]['message']) {
								this.submitCheck = false;
								this.toastrService.error(
									respp.result.data[0]['message'],
									'Error',
								);
							}
						},
						(err) => {
							if(err.status==500)
							{
							this.toastrService.error(err.error.message, 'Error');
							}
							this.disablebtnOnSubmit=false
							this.DoctorCalendarService.loadSpin = false;
						},
					);
			}else if(confirmed === false){
				this.disablebtnOnSubmit=false
				this.submitCheck = false;
			}else{
			}
		})
		.catch();

									
									} else if (res.result.data[0]&&res.result.data[0]['message']) {
										this.submitCheck = false;
										this.toastrService.error(res.result.data[0]['message'], 'Error');
									} else if (res['message']=='success') {
										if (
											res.result.data.time_slots !=
											parseInt(this.myForm.controls['duration'].value)
										) {
											this.deleteAptFromScheduleList();
											this.deleteWaitingListEntry(this.caseIdModel, this.chart);
											this.toastrService.success(
												'Appointment is created of  ' +
													res.result.data.time_slots +
													' min instead of' +
													parseInt(this.myForm.controls['duration'].value) +
													' min',
											);
											this.subject.refresh('add app');
											this.submitCheck = false;
										} else {
											///
											this.deleteAptFromScheduleList();
											this.deleteWaitingListEntry(this.caseIdModel, this.chart);
											///
											this.submitCheck = false;
											this.toastrService.success((res && res.result && res.result['data'] && res.result['data']['msg_alert_1'] ? res && res.result && res.result['data'] && res.result['data']['msg_alert_1']:res && res.result && res.result['data'] && res.result['data']['msg_alert_2']?res && res.result && res.result['data'] && res.result['data']['msg_alert_2']:'Added Successfully'), 'Success');
											this.subject.refresh('add app');
											this.subject.calendar_refresher.next(true);
										}
										this.activeModal.close();
									}
								},
								(error) => {
									this.disablebtnOnSubmit=false
									this.DoctorCalendarService.loadSpin = false;
									if(error.status == 500)
									{
							this.toastrService.error(error.error.message,'Error');	
									}
									
									this.submitCheck = false;
								},
							);
					}
				}
			}

				
			}
			// }
		}
	}

	////delete Apt from Schedule list
	deleteAptFromScheduleList() {
		//If Apt Created From Patient Manual Calendar
		if (this.DoctorCalendarService.PatientSchedulingCalendar == true) {
			const scheduler = this.storageData.getSchedulerInfo();

			if (scheduler.toDelCheck) {
				let jsonToDelId = JSON.parse(scheduler.toDelAppId);
				//delete Apt from Schedule list
				this.requestService
					.sendRequest(
						AddToBeSchedulledUrlsEnum.deleteAppointment,
						'delete_with_body',
						REQUEST_SERVERS.schedulerApiUrl1,
						{
							appointment_ids: [jsonToDelId.id],
						},
					)
					.subscribe((res: HttpSuccessResponse) => {
						scheduler.toDelCheck = false;
						this.storageData.setSchedulerInfo(scheduler);
					});
			}
		}
	}
	/////

	//Delete Waiting List Entry Once Apt is made for Checked in Patient
	public deleteWaitingListEntry(caseId, chartNo) {
		let st = new Date(this.currentDateTime);
		st.setMinutes(0);
		st.setHours(0);
		st.setSeconds(0);
		st.setMilliseconds(0);

		let convertedStDate = convertDateTimeForSending(this.storageData, new Date(st));

		var yearSt = convertedStDate.getFullYear();
		var monthSt = convertedStDate.getMonth() + 1;
		var datetSt = convertedStDate.getDate();

		var monthStString = '';
		var datetStString = '';

		if (datetSt < 10) {
			datetStString = '0' + datetSt;
		} else {
			datetStString = datetSt.toString();
		}
		if (monthSt < 10) {
			monthStString = '0' + monthSt;
		} else {
			monthStString = monthSt.toString();
		}
		let formattedSt = yearSt + '-' + monthStString + '-' + datetStString;
		// First we make a request to the checked-in-patient route
		var reqObj = {
			case_ids: [],
			current_date: formattedSt,
		};
		var truth_check = false;
		var id;
		this.requestService
			.sendRequest(
				AppointmentUrlsEnum.getAppointmentListWL,
				'POST',
				REQUEST_SERVERS.kios_api_path,
				reqObj,
			)
			.subscribe((res: HttpSuccessResponse) => {
				let data = res.result.data.checked_in_patients;
				for (let i = 0; i < data.length; i++) {
					if (data[i]['case_id'] == caseId && data[i]['patient_id'] == chartNo) {
						truth_check = true;
						id = data[i]['id'];
						if (truth_check) {
							const object = { ids: [id] };
							this.requestService
								.sendRequest(
									AppointmentUrlsEnum.remove_patient_status,
									'PUT',
									REQUEST_SERVERS.kios_api_path,
									object,
								)
								.subscribe((response: any) => {
								});
						}
						break;
					}
				}
			});

		if (this.DoctorCalendarService.PatientSchedulingCalendar == true) {
			const scheduler = this.storageData.getSchedulerInfo();
			if (scheduler.toDelCheckWL) {
				let jsonToDelId = JSON.parse(scheduler.toDelAppIdWL);
				//delete Apt from Waiting list
				const object = { ids: [jsonToDelId.id] };
				this.requestService
					.sendRequest(
						AppointmentUrlsEnum.remove_patient_status,
						'PUT',
						REQUEST_SERVERS.kios_api_path,
						object,
					)
					.subscribe((response: any) => {
						scheduler.toDelCheckWL = false;
						this.storageData.setSchedulerInfo(scheduler);
					});
			}
		}
	}

	//

	setReferringPhyValidation()
	{
		if(this.selectedSpecialtyKey == 'diagnostic')
		{
			this.myForm.get('physician_id').setValidators(Validators.required);
			this.myForm.get('physician_id').updateValueAndValidity();
		}
		else
		{
			this.myForm.get('physician_id').clearValidators();
			this.myForm.get('physician_id').updateValueAndValidity();
		}
	}

	setProvidervalidation()
	{
		if(this.WithoutTime(this.startDate)<this.WithoutTime(this.currentDate))
		{
			this.myForm.get('docName').setValidators(Validators.required);
			this.myForm.get('docName').updateValueAndValidity();
			this.myForm.get('billable').reset()
			this.myForm.get('billable').setValidators(Validators.required);
			this.myForm.get('billable').updateValueAndValidity();
			
		}
		else
		{
			this.myForm.get('docName').clearValidators();
			this.myForm.get('docName').updateValueAndValidity();
			this.myForm.get('billable').clearValidators();
			this.myForm.get('billable').updateValueAndValidity();
		}

		
	}

	setTemplateValidation()
	{
		if(this.WithoutTime(this.startDate)< this.WithoutTime(this.currentDate))
		{
			this.setTemplateFormValidation();
		}
		else
		{
			this.removeTemplateFormValidation();
		}
	}
	public changeStartDate() {
		this.currentDate=new Date();
		this.currentDate.setSeconds(0);
		this.currentDate.setMilliseconds(0)
		if (this.startDate){
		this.startDate.setMinutes(0);
		this.startDate.setHours(0);
		this.startDate.setSeconds(0);
		this.startDate.setMinutes(this.startTime.getMinutes());
		this.startDate.setHours(this.startTime.getHours());
		this.startDate.setSeconds(0);
		this.startDate.setMilliseconds(0);
		}
		this.startTime = new Date(JSON.parse(JSON.stringify(this.startDate)));
		this.setProvidervalidation();
		if (this.startDate == undefined || this.enddate == undefined) {
			this.toastrService.error('Date is required', 'Error');
		} else if (this.startDate.getTime() == null || this.enddate.getTime() == null) {
			this.toastrService.error('Date is required', 'Error');
		} else {
			this.endTime = new Date(JSON.parse(JSON.stringify(this.startTime)));
			this.endTime.setMinutes(
				JSON.parse(JSON.stringify(this.endTime.getMinutes() + this.interval)),
			);
			this.getDoctorAssign();
		}

	}
	public onChangeAptDate(event)
	{
		if(event.dateValue)
		{
		  this.startDate=new Date(event.dateValue);
		  this.setTemplateValidation()
		  this.apt_date_check=false;
		  this.changeStartDate();
		} 
		else
		{
			this.startDate=null;
			this.apt_date_check=true;
		}
	}
	public onChangeEndByDate(event)
	{
		if(event.dateValue)
		{
		  this.endByDate=new Date(event.dateValue);

		} 
		else
		{
			this.endByDate=null;
		}
	}
	public changeStartTime() {
		this.minTime = new Date(this.startTime);
		if (this.startTime == undefined || this.endTime == undefined) {

		} else if (this.startTime.getTime() == null || this.endTime.getTime() == null) {
		} else {
			this.currentDate=new Date();
			this.currentDate.setSeconds(0);
			this.currentDate.setMilliseconds(0);
			if (this.startDate){
			this.startDate.setMinutes(this.startTime.getMinutes());
			this.startDate.setHours(this.startTime.getHours());
			this.startDate.setSeconds(0);
			this.startDate.setMilliseconds(0);
			}
			this.endTime = new Date(JSON.parse(JSON.stringify(this.startTime)));
			this.endTime.setMinutes(
				JSON.parse(JSON.stringify(this.endTime.getMinutes() + this.interval)),
			);

			//hhh
			this.updateDocWithTime = true;
			//
			this.getDoctorAssign();
		}
		this.endTime = new Date(JSON.parse(JSON.stringify(this.startTime)));
		this.endTime.setMinutes(JSON.parse(JSON.stringify(this.endTime.getMinutes() + this.interval)));
	}

	public getDoctorAssign() {
		if (
			this.endTime == undefined ||
			this.startTime == undefined ||
			this.endTime.getTime() == null ||
			this.startTime.getTime() == null ||
			this.startDate == undefined ||
			this.startDate == null
		) {
		} else {
			this.stDate = new Date(JSON.parse(JSON.stringify(this.startDate)));
			this.stDate.setTime(JSON.parse(JSON.stringify(this.startTime.getTime())));
			if(this.selectedClinicId && this.selectedSpecialityId)
			{
				this.requestService
				.sendRequest(
					DoctorCalendarUrlsEnum.getPartialAvailableDoctors,
					'POST',
					REQUEST_SERVERS.schedulerApiUrl1,
					{
						end_date: convertDateTimeForSending(this.storageData, new Date(this.endTime)),
						facility_location_id: this.selectedClinicId,
						speciality_id: this.selectedSpecialityId,
						start_date: convertDateTimeForSending(this.storageData, new Date(this.stDate)),
					},
				)
				.subscribe(
					(response: HttpSuccessResponse) => {
						this.doctors = response && response.result && response.result.data;
						if (this.docAssignFirstTime > -1) {
							this.selectedDoctorId = this.docAssignFirstTime;
							this.docAssignFirstTime = -1;
							let doc_exist=this.doctors.find(doc=>doc.doctor_id==this.selectedDoctorId);
							if(doc_exist)
							{
								this.myForm.controls['docName'].setValue(this.selectedDoctorId);

							}
							else{
								this.myForm.controls['docName'].setValue("");
							}
						}
						else if(this.docAssignFirstTime==-1)
						{
							this.myForm.controls['docName'].setValue('');
						}
						else if (!this.updateDocWithTime && this.doctors.length>0) {
							this.selectedDoctorId = this.doctors[0].doctor_id;

							this.myForm.controls['docName'].setValue(this.doctors[0].doctor_id);
						}
						if (this.updateDocWithTime) {
							if (this.selectedDoctorId != null || this.selectedDoctorId != undefined) {
								let doc_exist=this.doctors.find(doc=>doc.doctor_id==this.selectedDoctorId);
							if(doc_exist)
							{
								this.myForm.controls['docName'].setValue(this.selectedDoctorId);

							}
							else{
								this.myForm.controls['docName'].setValue("");
							}
							}
							this.updateDocWithTime = false;
						}
						// /////

						this.Exam = [
							{
								roomId: 'Room',
								id: 0,
								docId: 0,
								room: {
									name: 'Room',
								},
							},
						];
						this.templateExtraParams();
					},
					(error) => {
						this.doctors = [

						];
						this.selectedDoctorId = this.doctors[0].doctor_id;
						this.Exam = [
							{
								roomId: 'Room',
								id: 0,
								docId: 0,
								room: {
									name: 'Room',
								},
							},
						];
					},
				);
			}

		}
	}

	onChangePracticeLocationGetDocAssignAndSpeciality()
	{
		this.requestService
		.sendRequest(
			AssignSpecialityUrlsEnum.GetUserInfoBySpecialities,
			'post',
			REQUEST_SERVERS.schedulerApiUrl1,
			{ 
				facility_location_ids:this.selectedClinicId?[this.selectedClinicId]:this.allClinicIds,
				per_page: Pagination.per_page, 
				page: 1 ,
				pagination:true,
				is_provider_calendar:true,}
		)
		.subscribe(async (resp: HttpSuccessResponse) => {
			this.speciality = resp.result.data.docs;
			for (let i = 0; i < this.speciality.length; i++) {
				if (this.speciality[i].speciality_key == 'medical_doctor') {
					this.medKey = this.speciality[i].id;
				} else if (this.speciality[i].speciality_key == 'hbot') {
					this.hbotKey = this.speciality[i].id;
				}
				if (this.speciality[i].id === parseInt(this.selectSpId)) {
					this.selectedSpecialityId = this.speciality[i].id;

					this.interval = this.speciality[i]['time_slot'];

					this.selectSpName = this.speciality[i].id;

					this.endTime = new Date(JSON.parse(JSON.stringify(this.startTime)));
					this.endTime.setMinutes(
						JSON.parse(JSON.stringify(this.endTime.getMinutes() + this.interval)),
					);
				}
			}
			if (parseInt(this.selectSpId) === 0 && !this.selectedSpecialityId) {
				if(this.speciality && this.speciality.length==1)
				{
					this.selectedSpecialityId = this.speciality[0].id;

					//this.myForm.controls['spHName'].setValue(this.speciality[0].id); ///////////////////////////
	
					this.interval = this.speciality[0]['time_slot'];
					let temp = 0;
					for (let i = 0; i < 8; i++) {
						temp = temp + this.interval;
						this.duration[i] = temp;
					}
					this.myForm.controls['duration'].setValue(this.duration[0]);
					this.selectSpName = this.speciality[0].id;
				}
				// else if(this.speciality && this.speciality.length>1)
				// {

				// }
				

				this.endTime = new Date(JSON.parse(JSON.stringify(this.startTime)));
				this.endTime.setMinutes(
					JSON.parse(JSON.stringify(this.endTime.getMinutes() + this.interval)),
				);
			}
			//set Speciality
			if (
				this.DoctorCalendarService.currentDocAndSpec &&
				this.DoctorCalendarService.currentDocAndSpec.user_id 
			) {
				//if doc selected
				let tempDoc = this.DoctorCalendarService.currentDocAndSpec.doctor;
				//currently only selecting first speciality of a doctor.
				let docSpecs = tempDoc.specialities;

				this.selectedSpecialityId = docSpecs.id;
				this.myForm.controls['spHName'].setValue(docSpecs.id);
			} else if (
				this.DoctorCalendarService.currentDocAndSpec &&
				typeof this.DoctorCalendarService.currentDocAndSpec.id !== 'undefined'
			) {
				//if only spec selected
				if (
					this.DoctorCalendarService.currentDocAndSpec.id === 0 &&  this.selectedSpecialityId
				) {
					if(this.speciality && this.speciality.length==1)
					{
						//default Spec Chosen
					}
					else if(this.speciality && this.speciality.length>1)
					{
						let specialtyexist=this.speciality.find(specialty=>specialty.id==this.selectedSpecialityId);
						if(specialtyexist)
						{
							this.myForm.controls['spHName'].setValue(this.selectedSpecialityId);
						}
						else 
						{
							this.selectedSpecialityId = null;
							this.myForm.controls['spHName'].setValue(''); 
						}
					}
					
				} else if (this.DoctorCalendarService.currentDocAndSpec.id !== null) {
					this.speciality.forEach((item, index) => {
						if (item.id == this.DoctorCalendarService.currentDocAndSpec.id) {
							this.selectedSpecialityId = this.speciality[index].id;
							this.myForm.controls['spHName'].setValue(this.speciality[index].id); //Gives the original id
						}
					});
				} 
			} 
			if (
				this.DoctorCalendarService.currentDocAndSpec &&
				this.DoctorCalendarService.currentDocAndSpec.user_id 
			) {
				//if doc selected
				let tempDoc = this.DoctorCalendarService.currentDocAndSpec.doctor;
				//currently only selecting first speciality of a doctor.
				this.docAssignFirstTime = this.DoctorCalendarService.currentDocAndSpec.user_id;
			} else if (
				this.DoctorCalendarService.currentDocAndSpec &&
				typeof this.DoctorCalendarService.currentDocAndSpec.id !== 'undefined'
			) {
				//if only spec selected
				if (
					this.DoctorCalendarService.currentDocAndSpec.id === 0 
					 && this.doctors.length>0
				) {
					this.docAssignFirstTime = this.doctors.length>0? this.doctors[0].id:this.docAssignFirstTime;
				} else {
					this.docAssignFirstTime = this.doctors.length>0? this.doctors[0].id:this.docAssignFirstTime;
				}
			} else {
				this.docAssignFirstTime = this.doctors.length>0? this.doctors[0].id:this.docAssignFirstTime;
			}
			/////

			this.specialityChange({ target: { value: this.selectedSpecialityId } });
		});

	}

	clinicChange(event) {
		if(event){
			const spec = this.clinics.find(d => d['id'] === Number(event.target.value));
			this.selectedclinicName = spec && `${spec.facility.name}-${spec.name}`;
		}
		this.selectedClinicId=event.target.value?event.target.value:null;
		this.setSelectedClinic(this.selectedClinicId)
		this.resetTechnician();
		this.resetTemplate();
		if(this.WithoutTime(this.startDate)< this.WithoutTime(this.currentDate))
		{
			this.hitTemplateApi()
		}
		
		this.onChangePracticeLocationGetDocAssignAndSpeciality();
		this.intializeWeek();
		if (
			parseInt(this.myForm.get('dailyMontlyWeeklyOpt').value) === RecurrenceRepeatOptionEnum.daily
		) {
			this.isWeekError = true;
			this.isDisableOption = true;
		} else {
			for (let i = 0; i < this.clinics.length; i++) {
				const tempDayList = this.clinics[i].daysList;
				if (this.clinics[i].id == this.myForm.controls['clinicName'].value) {
					for (let j = 0; j < this.weekDay.length; j++) {
						for (let x = 0; x < tempDayList.length; x++) {
							if (this.weekDay[j][0].id == tempDayList[x]) {
								this.weekDay[j][0].isColor = true;
							}
						}
					}
				}
			}
			for (let i = 0; i < this.weekDay.length; i++) {
				if (this.weekDay[i][0].isColor == 'false') {
					this.weekDay.splice(i, 1);
					i--;
				}
			}
			this.isDisableOption = false;
		}
	}

	setSelectedClinic(clinicId)
  {
   let selectedClinic= this.clinics.find(clinic=>clinic.id==clinicId);
   if(selectedClinic)
   {
     this.selectedClinic=selectedClinic;
   }
   else
   {
    this.selectedClinic=null
   }

  }

	specialityChange(event) {
		if(event){
			const spec = this.speciality.find(d => d['id'] === Number(event.target.value));
			this.selectedSpecialityName = spec && `${spec.name}`;
		}
		this.selectedSpecialityId=event.target.value?event.target.value:null;
		this.setSelectedSpecialty(this.selectedSpecialityId);
		this.resetTechnician();
		this.resetTemplate();
		this.setReferringPhyValidation();
		this.myForm.get('cd_image').reset();
		if(this.WithoutTime(this.startDate)< this.WithoutTime(this.currentDate))
		{
			this.hitTemplateApi()
		}
		for (let i = 0; i < this.speciality.length; i++) {
			if (this.speciality[i].id === parseInt(event.target.value)) {
				this.interval = this.speciality[i]['time_slot'];
				this.selectedSpecialtyKey=this.speciality[i]['speciality_key']
				this.endTime = new Date(JSON.parse(JSON.stringify(this.startTime)));
				this.endTime.setMinutes(
					JSON.parse(JSON.stringify(this.endTime.getMinutes() + this.interval)),
				);
				break;
			}
		}
		let temp = 0;
		for (let i = 0; i < 8; i++) {
			temp = temp + this.interval;
			this.duration[i] = temp;
		}
		this.myForm.controls['duration'].patchValue(this.duration[0]);
		this.getPracticeLocations()	
		this.getDoctorAssign();
		// this.selectAptType();

		this.getVisitTypes(this.selectedSpecialityId);
	}

	setSelectedSpecialty(specialtyId)
  {
	  
	  let selectedSpecialty=this.speciality.find(specialty=>specialty.id==specialtyId)
	  if(selectedSpecialty)
	  {

		this.selectedSpecialty=selectedSpecialty;
	

	  }
	  else
	  {
		this.selectedSpecialty=null
	  }
	  
  }

	selectAptType() {
		if (this.chart && this.caseIdModel && this.selectedSpecialityId) {
			this.requestService
				.sendRequest(DoctorCalendarUrlsEnum.checkInitialAppointment, 'POST', REQUEST_SERVERS.schedulerApiUrl1, {
					patient_id: this.chart,
					case_id: this.caseIdModel,
					speciality_id: parseInt(this.selectedSpecialityId),
				})
				.subscribe((response: HttpSuccessResponse) => {
					this.hasInitial = response.result.data.initial_check == true ? true : false;
					if (response.result.data.initial_check) {
						this.typeForAppointment = this.followType ? this.followType : this.typeForAppointment;
						this.myForm.get('appointment_type_id').setValue(this.typeForAppointment);
						this.setSelectedVisitType(this.typeForAppointment)
					} else {
						this.typeForAppointment = this.initType ? this.initType : this.typeForAppointment;
						this.myForm.get('appointment_type_id').setValue(this.typeForAppointment);
						this.setSelectedVisitType(this.typeForAppointment)
					}
					this.isEnableReadingProvider();
					this.hitTemplateApi();
				});
		}
	}

	doctorChange(event) {
		this.resetTechnician();
		this.resetTemplate();
		if(this.WithoutTime(this.startDate)<this.WithoutTime(this.currentDate))
		{
			this.hitTemplateApi()
		}
		for (let i = 0; i < this.doctors.length; i++) {
			if (this.doctors[i].doctor_id === parseInt(event.target.value)) {
				this.selectedDoctorId = this.doctors[i].doctor_id;
				break;
			}
		}
		if (this.selectedDoctorId > 0) {
			var obj = {
				docId: [this.selectedDoctorId],
				startDate: convertDateTimeForSending(this.storageData, new Date(this.startTime)),
				endDate: convertDateTimeForSending(this.storageData, new Date(this.endTime)),
			};
			
		} else {
			this.Exam = [
				{
					roomId: 'Room',
					id: 0,
					docId: 0,
					room: {
						name: 'Room',
					},
				},
			];
		}
	}
	selectionOnValueChange(e: any,_form:FormGroup,Type?) {
		if(!isArray(e &&e.formValue?e.formValue:null) && Type=='cpt_codes_ids'){
			_form.controls[Type].setValue(e &&e.formValue?[e.formValue]:null);	
		}else{
			_form.controls[Type].setValue(e &&e.formValue?e.formValue:null);
			this.clinic_location_id = e && e.data && e.data.realObj ? e.data.realObj.clinic_location_id : null;
		}
		if(Type=='template_id')
		{
			this.templateType=e.data&&e.data.realObj && e.formValue?e.data.realObj.template_type:null;
			if(this.templateType=='dynamic'){
				_form.controls[Type].setValue(e?.data?.template_id);	
			}
		}
		if(Type=='physician_id'){
			this.physician_specialty_id=e?.data?.realObj?.speciality_id || null;
		}
	}

	getAppointmentPriority(event) {
		for (let i = 0; i < this.AppointmentPriority.length; i++) {
			if (this.AppointmentPriority[i].id === event.target.value) {
				this.selectedAppointmentPriorityId = this.AppointmentPriority[i].id;
				this.selectedPriorityId= this.AppointmentPriority[i].id;
				break;
			}
		}
	}

	getAppointmentType(event) {
		if(event){
			const spec = this.AppointmentType.find(d => d['id'] === Number(event.target.value));
			this.selectedAppointmentName =  spec && `${spec.name}`;
			let index = this.visitTypeData.findIndex(x => x.appointment_type_id === spec.id);
			this.allowMultiCPTs = this.visitTypeData && this.visitTypeData.length > 0 ? this.visitTypeData[index].allow_multiple_cpt_codes == 1 ? true:false : true;
			this.apidefaulthit = true;
		}
		this.isEnableSptCodes();
		this.isEnableReadingProvider()
		this.resetCpt();
		this.resetReadingProvider()
		this.resetTemplate();
		if(this.WithoutTime(this.startDate)< this.WithoutTime(this.currentDate))
		{
			this.hitTemplateApi()
		}
	
	}

	isEnableSptCodes()
	{
		let selectedvisitType=this.AppointmentType.find(visitType=>visitType.id==this.typeForAppointment);
		if(selectedvisitType)
		{
			this.enableCptCodes=selectedvisitType.enable_cpt_codes;
		this.setSelectedVisitType(this.typeForAppointment)

		}
		else
		{
			this.resetCpt();
			this.enableCptCodes=false;
			
		}
	}

	setSelectedVisitType(visitTypeId)
	{
		let selectedvisitType=this.AppointmentType.find(visitType=>visitType.id==parseInt(visitTypeId));
		if(selectedvisitType)
		{
		this.selectedvisitType = selectedvisitType
		}
		else
		{
			
			this.selectedvisitType=null
			
		}
	}

	isEnableReadingProvider()
	{
		
		let selectedvisitType=this.AppointmentType.find(visitType=>visitType.id==this.typeForAppointment);
		if(selectedvisitType)
		{
			this.enableReadingProvider=selectedvisitType.is_reading_provider
		}
		else
		{
			this.resetReadingProvider()
			this.enableReadingProvider=false;
			
		}
	}

	getAppointmentPriorityWaitingList(event) {
		for (let i = 0; i < this.priorityForAppointmentArray.length; i++) {
			if (this.priorityForAppointmentArray[i].description === event.target.value) {
				this.selectedPriorityId = this.priorityForAppointmentArray[i].id;
				break;
			}
		}
	}

	roomChange(event) {
		this.selectedRoomId = parseInt(event.target.value);
	}

	chnageCaseId(event) {				
		this.caseTypeidModal=null;
		this.resetTemplate();
		for (let i = 0; i < this.allCaseIds.length; i++) {
			if (this.allCaseIds[i].case_id == parseInt(event.target.value)) {
				this.caseIdModel = parseInt(event.target.value);
				this.caseTypeidModal = this.allCaseIds[i].case_type_id;
				if(this.WithoutTime(this.startDate)< this.WithoutTime(this.currentDate))
				{
					this.hitTemplateApi()
				}
			}
		}

		this.transportationForm=null
	}
	changeDurationSlots($event){
		this.timeInterval = [...getTimeArray(parseInt(this.myForm.controls['duration'].value))];
	}
	public intializeWeek() {
		this.weekDay[0] = [{ id: 0, name: 'Sun', isColor: 'false', isChecked: false }];
		this.weekDay[1] = [{ id: 1, name: 'Mon', isColor: 'false', isChecked: false }];
		this.weekDay[2] = [{ id: 2, name: 'Tue', isColor: 'false', isChecked: false }];
		this.weekDay[3] = [{ id: 3, name: 'Wed', isColor: 'false', isChecked: false }];
		this.weekDay[4] = [{ id: 4, name: 'Thu', isColor: 'false', isChecked: false }];
		this.weekDay[5] = [{ id: 5, name: 'Fri', isColor: 'false', isChecked: false }];
		this.weekDay[6] = [{ id: 6, name: 'Sat', isColor: 'false', isChecked: false }];
	}

	keyword = 'name';
	data = [];

	caseFormat = true;
	// chartStr = '';
	selectEvent(item) {
		//rootcalfunc
		//Clear error messages Case Chart
		this.noCaseValidLength = true;
		this.noCaseValidAlpha = true;
		this.caseTypeidModal=null;
		this.resetTemplate();
		this.noChartValidLength = true;
		this.noChartValidAlpha = true;
		this.transportationForm=null;
		//
		// do something with selected item

		//COnverting chart no to appropriate format
		var startString = '000-00-';
		var receivedString = JSON.stringify(item.id);
		var finalStr = startString + receivedString.padStart(4, '0');
		//console.log("RECV",receivedString,finalStr);
		// `this.chartStr = finalStr;`
		this.myForm.get('chart_str').setValue(finalStr)
		//

		//console.log("CHART",item)
		this.chart = item.id;
		this.caseFormat = false;
		//this.chartStr = JSON.stringify(item.id)  //hhh
		// this.patient = item.name;
		this.caseIdModel=null;
		this.myForm.get('patient').setValue(item.name)
		this.requestService
			.sendRequest(
				DoctorCalendarUrlsEnum.getAllReturningCasesByPatient + JSON.stringify(this.chart),
				'GET',
				REQUEST_SERVERS.kios_api_path,
			)
			.subscribe((res: any) => {
				this.allCaseIds = res.result.data;
				this.caseIdModel = this.allCaseIds[this.allCaseIds?.length - 1].case_id;
				this.caseTypeidModal = this.allCaseIds[this.allCaseIds?.length - 1].case_type_id;
				
				this.cdr.detectChanges();
				this.selectAptType();
				// this.caseStr = this.allCaseIds[0]['case_id'];
				let caseStr = this.allCaseIds[this.allCaseIds?.length - 1]['case_id'];

				this.myForm.get('case_str').setValue(caseStr)
				if(this.WithoutTime(this.startDate)< this.WithoutTime(this.currentDate))
				{
					this.hitTemplateApi();
				}
				
			});
	}

	onEnterKeyPress(event: KeyboardEvent, controlName: string, data: any[]) {
		if (event?.key === 'Enter') {
			const selectedItem = this.highlightedIndex >= 0 && this.highlightedIndex < data?.length
				? data[this.highlightedIndex]
				: (data?.length > 0 ? data[0] : null);
			
			if(this.highlightedIndex === -1){
				if (selectedItem) {
					switch (controlName) {
						case 'patient':
							this.selectEvent(selectedItem);
							break;
						case 'chart_str':
							this.selectEventChart(selectedItem);
							break;
						case 'case_str':
							this.selectEventCase(selectedItem);
							break;
						// Add more cases as needed
						default:
							console.warn('Unhandled controlName:', controlName);
					}
				}
			}
			this.highlightedIndex = 0;
		}
	}

	onArrowDownKeyPress(controlName: string, data: any[]) {
		if (this.highlightedIndex < data?.length - 1) {
		  this.highlightedIndex++;
		}
	}
	
	onArrowUpKeyPress(event, data: any[]) {
		if(event.key === 'ArrowUp'){
			this.upKeyPressed ++; 
		}
		if(this.upKeyPressed !== 0 && this.highlightedIndex === -1){
			this.highlightedIndex = data?.length - this.upKeyPressed;
		}else{
			if (this.highlightedIndex > 0) {
			   this.highlightedIndex--; 
			}
		}
	}

	public selectEvent2(item,PatientSchedulingCalendar?) {

		var startString = '000-00-';
		var receivedString = JSON.stringify(item.id);
		var finalStr = startString + receivedString.padStart(4, '0');
		//console.log("RECV",receivedString,finalStr);
		// this.chartStr = finalStr;
		this.myForm.get('chart_str').setValue(finalStr);

		//console.log("CHART2",item)
		this.chart = item.id;
		this.caseFormat = false; //added

		this.requestService
			.sendRequest(
				DoctorCalendarUrlsEnum.getAllReturningCasesByPatient + JSON.stringify(this.chart),
				'GET',
				REQUEST_SERVERS.kios_api_path,
			)
			.subscribe((res: any) => {
				this.allCaseIds = res.result.data;
				if(PatientSchedulingCalendar && this.allCaseIds && this.allCaseIds.length)
				{
					let selectedCaseData=this.allCaseIds.find(caseData=>caseData.case_id==this.caseIdModel)
					// this.caseIdModel = this.allCaseIds[0].case_id;
					this.caseTypeidModal = selectedCaseData.case_type_id;
				}
				
				
				this.cdr.detectChanges();
			});
	}
	onChangeSearch(val: string) {
		// fetch remote data from here
		// And reassign the 'data' which is binded to 'data' property.
		if (val !== '') {
			this.requestService
				.sendRequest(DoctorCalendarUrlsEnum.getPatient, 'POST', REQUEST_SERVERS.kios_api_path, {
					case_id: null,
					per_page: 50,
					order: 'ASC',
					dob: null,
					order_by: 'id',
					patient_name: val,
					page: 1,
				})
				.subscribe((res: HttpSuccessResponse) => {
					this.data = res.result.data.docs;
					for (let i = 0; i < this.data.length; i++) {
						// this.data[i].dob = convertDateTimeForRetrieving(
						// 	this.storageData,
						// 	new Date(this.data[i].dob),
						// );
						// this.data[i].dob =
						// 	this.data[i].dob.getMonth() +
						// 	'-' +
						// 	this.data[i].dob.getDate() +
						// 	'-' +
						// 	this.data[i].dob.getFullYear();
						this.data[i].dob = this.data[i].dob && this.data[i].dob.split('-');

            this.data[i].dob = this.data[i].dob[1] + '-' + this.data[i].dob[2] + '-' + this.data[i].dob[0];
						this.data[i].name = this.data[i].name + ' ' + this.data[i].dob;
					}
					// this.cdr.detectChanges()
				});
		}
	}

	onFocused(e) {
		// do something when input is focused
		let val = '';
		if (e.target.value === '') {
			val = 'a';
		} else {
			val = e.target.value;
		}
		this.requestService
			.sendRequest(DoctorCalendarUrlsEnum.getPatient, 'POST', REQUEST_SERVERS.kios_api_path, {
				case_id: null,
				per_page: 50,
				order: 'ASC',
				dob: null,
				order_by: 'id',
				patient_name: val,
				page: 1,
			})
			.subscribe((res: HttpSuccessResponse) => {
				this.data = res.result.data.docs;
				for (let i = 0; i < this.data.length; i++) {
					// this.data[i].dob = convertDateTimeForRetrieving(
					// 	this.storageData,
					// 	new Date(this.data[i].dob),
					// );
					// this.data[i].dob =
					// 	this.data[i].dob.getMonth() +
					// 	'-' +
					// 	this.data[i].dob.getDate() +
					// 	'-' +
					// 	this.data[i].dob.getFullYear();

					 /*Note:  we don't used here this convertDateTimeForRetrieving function because dob format is string from backend side.
                      it's not passing the timezone, if we implement this fucntion then we are facing dob issue   */

					this.data[i].dob = this.data[i].dob && this.data[i].dob.split('-');

                    this.data[i].dob = this.data[i].dob[1] + '-' + this.data[i].dob[2] + '-' + this.data[i].dob[0];
					this.data[i].name = this.data[i].name + ' ' + this.data[i].dob;
				}
				this.cdr.detectChanges();
			});
	}
	clearData(e) {
		// this.chartStr = '';
		this.myForm.get('chart_str').reset();
		// this.caseStr = '';
		this.myForm.get('case_str').reset();
		this.caseIdModel=null;
		this.caseTypeidModal=null;
		this.chart=null;
		this.resetTemplate();
		this.highlightedIndex= -1;
		this.upKeyPressed= 0;
		
		// this.patient = '';
		this.myForm.get('patient').reset();
		this.caseFormat = true;
		this.data = [];
		this.cdr.detectChanges();
	}

	public addSoftPatient() {
		this.softPatientService.addSoftPatientProviderCalandar=true;
		this.activeModalSoftPatient = this.softPatientModal.open(SoftPatientVisitComponentModal, { backdrop: 'static',
		size: 'lg',
		keyboard: false, windowClass:'modal-width-xl' });
		
		this.activeModalSoftPatient.componentInstance.addSoftPatientProviderCalandar=true;
		this.softPatientService.addSoftPatientProviderCalandar=true;
		this.softPatientService.pushAddNewSoftPatientThroughPatientProfile(0);
		this.activeModalSoftPatient.result.then(res=>{
			if(res)
			{
				console.log(res);
				this.selectEventCase({id:res.caseId});
			}

		})
	  }

	  onCloseSoftPatientPopUp()
	  {
		this.softPatientService.closeSoftPatinetPopUpProviderCalender.subscribe(res=>{
			this.activeModalSoftPatient.close({caseId:res.caseId})
			// this.selectEventCase({id:res.caseId});
		})
	  }



	// caseStr;
	keywordChart = 'chart_id';
	dataChart = [];

	selectEventChart(item) {
		//Clear error messages
		this.caseTypeidModal=null;
		this.resetTemplate();
		this.noCaseValidLength = true;
		this.noCaseValidAlpha = true;
		this.transportationForm=null
		this.noChartValidLength = true;
		this.noChartValidAlpha = true;
		this.chart = item.id;
		this.caseFormat = false;
		var startString = '000-00-';
		var receivedString = JSON.stringify(item.id);
		var finalStr = startString + receivedString.padStart(4, '0');
		this.myForm.get('chart_str').setValue(finalStr);

		this.requestService
			.sendRequest(
				DoctorCalendarUrlsEnum.getAllReturningCasesByPatient + JSON.stringify(this.chart),
				'GET',
				REQUEST_SERVERS.kios_api_path,
			)
			.subscribe((res: any) => {
				this.allCaseIds = res.result.data;
				if(this.allCaseIds.length>0)
				{
					this.caseIdModel = this.allCaseIds[this.allCaseIds?.length - 1].case_id;
					this.caseTypeidModal = this.allCaseIds[this.allCaseIds?.length - 1].case_type_id;
					if(this.WithoutTime(this.startDate)< this.WithoutTime(this.currentDate))
					{
						this.hitTemplateApi();

					}
					this.selectAptType();
					// this.caseStr = this.allCaseIds[0]['case_id'];
					let caseStr=this.allCaseIds[this.allCaseIds?.length - 1]['case_id'];
					this.myForm.get('case_str').setValue(caseStr);
				}
				let dob = item.dob && item.dob.split('-');

                dob = dob[1] + '-' + dob[2] + '-' + dob[0];
				let patient = item.middle_name
					? item.first_name +
					  ' ' +
					  item.middle_name +
					  ' ' +
					  item.last_name +
					  ' ' +
					  dob
					: item.first_name + ' ' + item.last_name + ' ' + dob;
					this.myForm.get('patient').setValue(patient)
				
				this.cdr.detectChanges();
			});
	}

	//Check if string contains alpha numeric characters
	isAlphaNumeric(str) {
		return str.match(/^[a-z0-9]+$/i) !== null;
	}

	isNumeric(str) {
		return str.match(/^[0-9]+$/i) !== null;
	}

	onChangeSearchChart(val: string) {
		//hhh
		this.noChartValidLength = true;
		this.noChartValidAlpha = true;
		//
		// fetch remote data from here
		// And reassign the 'data' which is binded to 'data' property.
		if (val !== '' && this.isNumeric(val) && val.length < 12) {
			this.requestService
				.sendRequest(
					DoctorCalendarUrlsEnum.getPatientList + val,
					'GET',
					REQUEST_SERVERS.kios_api_path,
				)
				.subscribe((res: any) => {
					this.dataChart = res.result.data;
					this.cdr.detectChanges();
				});
		} else if (val.length > 11) {
			this.noChartValidLength = false;
		} else if (!this.isNumeric(val) && val.length > 0) {
			this.noChartValidAlpha = false;
		}
	}

	onFocusedChart(e) {
		// do something when input is focused
	}
	clearDataChart(e) {
		this.noChartValidLength = true;
		this.noChartValidAlpha = true;
		this.noCaseValidLength = true;
		this.noCaseValidAlpha = true;
		this.myForm.get('chart_str').reset();
		this.caseIdModel=null;
		this.caseTypeidModal=null;
		this.chart=null
		this.resetTemplate();
		this.myForm.get('patient').reset();
		this.myForm.get('case_str').reset();
		this.caseFormat = true;
		this.dataChart = [];
		this.cdr.detectChanges();
		this.transportationForm=null
		this.highlightedIndex= -1;
		this.upKeyPressed= 0;
	}

	keywordCase = 'id';
	dataCase = [];

	selectEventCase(item) {
		this.caseTypeidModal=null;
		this.resetTemplate();
		//clear error messages
		this.noCaseValidLength = true;
		this.noCaseValidAlpha = true;
		this.noChartValidLength = true;
		this.noChartValidAlpha = true;
		// if (this.myForm.value['spHName'] == 1 && this.aptSlug == 're_evaluation') {
		// 	this.toastrService.error('Re-evaluation cannot be created against this specailty', 'Error');
		// }
		this.caseIdModel = parseInt(item.id);

		this.requestService
			.sendRequest(
				DoctorCalendarUrlsEnum.getPatientsByCase +
					JSON.stringify(this.caseIdModel) +
					'&route=schduler_app_patient_details',
				'GET',
				REQUEST_SERVERS.kios_api_path,
			)
			.subscribe((res: any) => {
				let caseStr=res.result.data.id;
				let patient = res.result.data.patient_middle_name
					? res.result.data.patient_first_name +
					  ' ' +
					  res.result.data.patient_middle_name +
					  ' ' +
					  res.result.data.patient_last_name
					: res.result.data.patient_first_name + ' ' + res.result.data.patient_last_name;
				this.myForm.get('patient').setValue(patient)
				// this.chartStr = JSON.stringify(res.result.data.patient_id);
				let chartStr = JSON.stringify(res.result.data.patient_id);
				this.chart = res.result.data.patient_id;

				//Formatting Chart No..HHH
				var startString = '000-00-';
				var receivedString = chartStr; //JSON.stringify(res.result.data[i].id)
				var finalStr = startString + receivedString.padStart(4, '0');
				//res.result.data[i].id = finalStr;
				// this.chartStr = finalStr;
				this.myForm.get('chart_str').setValue(finalStr);
				this.requestService
					.sendRequest(
						DoctorCalendarUrlsEnum.getAllReturningCasesByPatient + JSON.stringify(this.chart),
						'GET',
						REQUEST_SERVERS.kios_api_path,
					)
					.subscribe((res: any) => {
						for (let i = 0; i < res.result.data.length; i++) {
							if (res.result.data[i].case_id == this.caseIdModel) {
								// res.result.data[i].accidentDate = convertDateTimeForRetrieving(this.storageData, new Date(res.result.data[i].accident_date))
								if (res.result.data[i].accident_date) {
									caseStr =
									caseStr +
									' ' +
									res.result.data[i].case_type +
									' ' +
									res.result.data[i].accident_date;
								} else {
									caseStr = caseStr + ' ' + res.result.data[i].case_type;
								}
								this.myForm.get('case_str').setValue(caseStr);
								patient = patient + ' ' + res.result.data[i].patient_dob;
								this.myForm.get('patient').setValue(patient);
								this.caseTypeidModal = res.result.data[i].case_type_id;
								if(this.WithoutTime(this.startDate)< this.WithoutTime(this.currentDate))
								{	
															
									this.hitTemplateApi()
								}
								break;
							}
						}
						this.selectAptType();

						this.cdr.detectChanges();
					});
			});
	}

	onChangeSearchCase(val: string) {
		this.noCaseValidLength = true;
		this.noCaseValidAlpha = true;
		//
		// fetch remote data from here
		// And reassign the 'data' which is binded to 'data' property.
		if (val !== '' && this.isNumeric(val) && val.length < 7) {
			this.requestService
				.sendRequest(DoctorCalendarUrlsEnum.getCaseList + val, 'GET', REQUEST_SERVERS.kios_api_path)
				.subscribe((res: any) => {
					for (let i = 0; i < res.result.data.docs.length; i++) {
						res.result.data.docs[i].id = JSON.stringify(res.result.data.docs[i].id);
					}
					this.dataCase = res.result.data.docs;
					this.cdr.detectChanges();
				});
		} else if (val.length > 6) {
			this.noCaseValidLength = false;
		} else if (!this.isNumeric(val) && val.length > 0) {
			this.noCaseValidAlpha = false;
		}
	}

	onFocusedCase(e) {
		// do something when input is focused
	}
	clearDataCase(e) {
		this.resetTemplate();
		this.caseTypeidModal=null;
		this.noCaseValidLength = true;
		this.noCaseValidAlpha = true;

		this.noChartValidLength = true;
		this.noChartValidAlpha = true;
		this.myForm.get('chart_str').reset();
		this.caseIdModel=null;
		this.myForm.get('patient').reset();
		this.chart=null
		this.myForm.get('case_str').reset();
		this.highlightedIndex= -1;
		this.upKeyPressed= 0;

		this.caseFormat = true;
		this.dataChart = [];
		this.transportationForm=null
		this.cdr.detectChanges();
	}

	/*
	* Used for Patient name
	*/
	getPatientName(): string{
		let name: string = this.DoctorCalendarService.patientName.first_name;
				if(this.DoctorCalendarService.patientName.middle_name){
					name += ' ' + this.DoctorCalendarService.patientName.middle_name;
				}
				name += ' '+ this.DoctorCalendarService.patientName.last_name;
		return name;
	}

	openTransportation()
	{
		if(!this.chart)
		{
			this.toastrService.error('Please add case to add transportation.','Error');
			return;
		}
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc',
			size:'lg'
		};
		
		let physician_id=this.myForm.get('physician_id').value;
		this.activeModalSoftPatient = this.softPatientModal.open(TransportationModalComponent, ngbModalOptions);
		this.activeModalSoftPatient.componentInstance.patientId=this.chart;
		this.activeModalSoftPatient.componentInstance.physician_id=physician_id;
		this.activeModalSoftPatient.componentInstance.physician_id.openAsModal=true
		this.activeModalSoftPatient.componentInstance.transportationFormObj=this.transportationForm
		// this.activeModalSoftPatient.componentInstance.selectedPhysician=

		this.activeModalSoftPatient.result.then(res=>{
			if(res && res.data)
			{
				this.transportationForm=res.data;
				console.log(this.transportationForm);
			}
		});
	}

	openPatientHistory()
	{
		if(!this.caseIdModel)
		{
			this.toastrService.error('Please add case to show History.','Error');
			return;
		}
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc model-trans',
			size:'lg'
		};
		
		let physician_id=this.myForm.get('physician_id').value;
		this.activeModalSoftPatient = this.softPatientModal.open(PatientHistoryComponentModal, ngbModalOptions);
		this.activeModalSoftPatient.componentInstance.caseId=this.caseIdModel;
	
		// this.activeModalSoftPatient.componentInstance.selectedPhysician=

		this.activeModalSoftPatient.result.then(res=>{
		
		});
	}

	resetCpt()
	{
		this.eventsSubjectCpt.next(true);
		this.myForm.get('cpt_codes_ids').reset(null,{emitEvent:false})
	}

	resetReadingProvider()
	{
		this.eventsSubjectReadingProvider.next(true);
		this.myForm.get('reading_provider_id').reset(null,{emitEvent:false})
	}
	
	resetTechnician()
	{
		this.eventsSubjectTechnician.next(true);
	}

	
	resetTemplate()
	{
		this.eventsSubjectTemplate.next(true);
		this.templateType=null;
		this.templateExtraParams();
	}

	templateExtraParams()
	{
		let paramObj={
		'facility_location_id':this.myForm.get('clinicName').value?[this.myForm.get('clinicName').value]:null,
		'specialty_id':this.myForm.get('spHName').value?[this.myForm.get('spHName').value]:null, 
		'user_id':this.myForm.get('docName').value?this.myForm.get('docName').value:null,
		'visit_type_id':this.myForm.get('appointment_type_id').value?[this.myForm.get('appointment_type_id').value]:null,
		'case_type_id':this.caseTypeidModal?[this.caseTypeidModal]:null
	}

	return this.templateExtraParamsObj={...paramObj}
	
	}

	isDisableTemplate()
	{
		if(this.myForm.get('clinicName').value && this.myForm.get('spHName').value && this.myForm.get('docName').value && this.myForm.get('appointment_type_id').value && this.caseTypeidModal)
		{
			return false;
		}
		else
		{
			return true
		}
		
	}
	

	technicianExtraParams()
	{
		let obj={
		'facility_location_id':this.myForm.get('clinicName').value?[this.myForm.get('clinicName').value]:null,
		'supervisor_id':this.myForm.get('docName').value?this.myForm.get('docName').value:null,	
	}
	return obj;
	}

	isDisableTechnician()
	{
		if(this.myForm.get('clinicName').value && this.myForm.get('docName').value)
		{
			return false;
		}
		else
		{
			return true
		}
		
	}

	templateAPiResponse($event)
	{
		let lists=$event && $event.list ?$event.list:[];
		if(lists.length==1)
		{
			this.templateControl.setSearchFormValue(lists[0],lists[0].id,true)
		}
		else if(lists.length>1)
		{
			let setAsDefaultObj=lists.find(template=>(template && template.realObj && template.realObj.is_default==1 ));
			if(setAsDefaultObj)
			{
				this.templateControl.setSearchFormValue(setAsDefaultObj,setAsDefaultObj.id,true)
			}
			
		}
	}

	hitTemplateApi()
	{
		this.templateExtraParams();	
		this.templateControl.conditionalExtraApiParams=this.templateExtraParamsObj;
		this.templateControl.selectedItemAPICall();
	}

	setTemplateFormValidation()
	{
		this.myForm.get('template_id').setValidators(Validators.required);
		this.myForm.get('template_id').updateValueAndValidity();
	}

	removeTemplateFormValidation()
	{
		this.myForm.get('template_id').clearValidators();
		this.myForm.get('template_id').updateValueAndValidity();
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
	getTouched(event:any){
		let index = this.visitTypeData.findIndex(x => x.appointment_type_id === parseInt(this.myForm.controls['appointment_type_id'].value));
		this.allowMultiCPTs =  this.visitTypeData && this.visitTypeData.length > 0 ? this.visitTypeData[index].allow_multiple_cpt_codes == 1 ? true:false : true;
	}
	refreshAppointments(msg:string){
		if(msg)
		this.toastrService.success(msg,'Success');
		this.subject.refresh('add app');
		this.subject.calendar_refresher.next(true);
	    this.activeModal.close();
	}
}
