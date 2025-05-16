import { find } from 'lodash';

import { Component, OnInit, ViewChild, Input, AfterViewInit } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { AppointmentSubjectService } from '../../../appointment/subject.service';
//service
import { DoctorCalendarService } from '../../doctor-calendar.service'
import { SubjectService } from '../../subject.service';
import { AppSubjectService } from '../../utils/my-calendar/src/modules/month/appointments/subject.service';
import { ToastrService } from 'ngx-toastr';
import { StorageData, HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { Router } from '@angular/router';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { DoctorCalendarUrlsEnum } from '../../doctor-calendar-urls-enum';
import { AssignSpecialityUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-speciality/assign-speciality-urls-enum';
import { AppointmentUrlsEnum } from './../../../appointment/appointment-urls-enum';
import { Pagination } from '@appDir/shared/models/pagination';
import { convertDateTimeForSending, convertTimeTo24Hours, convertUTCTimeToUserTimeZoneByOffset, isArray, removeEmptyAndNullsFormObject, stdTimezoneOffset } from '@appDir/shared/utils/utils.helpers';
import { Subject } from 'rxjs';
import { ReferringPhysicianUrlsEnum } from '@appDir/front-desk/masters/practice/referring-physician/referring-physician/referringPhysicianUrlsEnum';
import { TransportationModalComponent } from '../transportation-modal/transportation-modal.component';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';

@Component({
  selector: 'app-update-appoit-modal',
  templateUrl: './update-appoit-modal.component.html',
  styleUrls: ['./update-appoit-modal.component.scss']
})
export class UpdateAppoitModalComponent extends PermissionComponent implements OnInit {
	@ViewChild('transportationComponent') transportationComponent:TransportationModalComponent

  myForm: FormGroup
  public appTitle: any
  public practiceLocation = "Practice Location";
  public confirmChecking: any;
  public confirmData = [{ "appointmentConfirmationStatus": "Confirmed", id: 1 }, { "appointmentConfirmationStatus": "Not Confirmed", id: 0 }]
  public patient: any;
  patientId:any;
  public hidetitle = false;
  private physician_specialty_id : number
  private physician_Id : number 
  public chart: any
  public availRoom: any = []
  public case: any
  public doctor: any
  public priority: any
  public type: any
  public room: any = 0;
  public duration: any
  public appointment_duration:number;
  public specForDocAssn: any
  public docIdForDocAssn: any
  public clinicIdForDocAssign: any
  public comment: any
  public appId: any
public allDoc: any = [];
  public temp;
  public visit_status;
  public specialityKey;
  public checker = false;
  public date_check = false;
  public time_check = false;
  public startDate: any
  public timeSlot: any = [];
  public startTime: any
  public minTime: any
  public end: any
  public appointmentConfirmationStatus: any;
  public interval: any;
  public getHours: any
  public getMinutes: any
  public visitTypeId: any;
  public allClinicIds: any = [];
  public roomList: any = [{
    "name": "Room",
    "id": 0,
    "facility_location_id": 0
  }]
  public allDocModel;
  public endDate: any;
  public visitType = []
  clinic_location_id: number
  ///HHH
  public checkDocUndefined = false;
  public specialityList: any = [];
  clinics:any=[];
  eventsSubjectCpt: Subject<any> = new Subject<any>();
  eventsSubjectPhysicians: Subject<any> = new Subject<any>();
  eventsSubjectReadingProvider: Subject<any> = new Subject<any>();
  selectedvisitType;
  btnSubmit: boolean = false;
  showSelectFieldList: any = {
	  'cpt_codes_ids': [],
	  'physician_id':[],
	  'reading_provider_id':[]
  };
  EnumApiPath = DoctorCalendarUrlsEnum;
  ReferringPhysician_Listing=ReferringPhysicianUrlsEnum.PHYSICIAN_LISTING;
  ReferringPhysician_LocationListing = ReferringPhysicianUrlsEnum.GET_PHYSICIANS_LIST;

  activeModalRef:NgbModalRef;
  transportationForm:{pickupForm:any,dropoffForm:any}={pickupForm:null,dropoffForm:null};
  transportationobj:any;
  physician:any;
  readingProvider:any;
  appointment_cpt_codes:any[]=[]
  lstPhysician:any[]=[];
  lstReadingProvider:any[]=[];
  enableCptCodes:boolean=true;
  enableReadingProvider:boolean=false;
  OrderEnum=OrderEnum;
  selectedSpecialtyKey:string='';
  selectedSpecialty:any;
  @Input() viewCurrentAppointment:any;
  public allowMultiCPTs: boolean = true;
  public apidefaulthit: boolean = false;
  public visitTypeData:any = []
  public appPrevData : any;
  public doctors:any[] = [];
  public minStartTime: Date;
	public maxEndTime: Date;
  user_timings: any;
	private dateIdToDay = { 0: "Sun", 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat" };
  constructor(aclService: AclService,
    router: Router,
    public activeModal: NgbActiveModal, private toastrService: ToastrService,
    private formBuilder: FormBuilder,
    public _service: DoctorCalendarService,
    public subject: AppointmentSubjectService,
    protected requestService: RequestService,
    public SubjectService: SubjectService,
    public AppSubjectService: AppSubjectService,
    private storageData: StorageData,
	  public modalservice: NgbModal,
    private customDiallogService: CustomDiallogService,

  ) {
    super(aclService, router);
    this.createForm()
  }
  ngOnInit() {
    this.appPrevData = this._service.updateModalData;
    this.visit_status = this._service.updateModalData.visit_session
    if (this.aclService.hasPermission(this.userPermissions.appointment_edit)) {
      this.allClinicIds = this.storageData.getFacilityLocations()
    }

    if (this.visit_status) {
      this.myForm.controls['confirmationName'].setValue(this._service.updateModalData.confirmation_status)
      this.myForm.get('confirmationName').disable();
    }
    else {
      this.myForm.controls['confirmationName'].setValue(this._service.updateModalData.confirmation_status)
    }
    this.setReferringPhyValidation();

    this.appTitle = this._service.updateModalData.appointment_title
    this.patient = this._service.updateModalData.patientName;
  	this.patientId=this._service.updateModalData.patient_id
    var startString = "000-00-"
    var receivedString = JSON.stringify(this._service.updateModalData.patient_id);
    var finalStr = startString + receivedString.padStart(4, "0");
    this.chart = finalStr
    this.case = this._service.updateModalData.case_id + " "+this._service.updateModalData.case_type_name;
    this.priority = this._service.updateModalData.priority_id
    this.type = this._service.updateModalData.appointment_type_id
    this.comment = this._service.updateModalData.comments
    this.startDate = new Date(this._service.updateModalData.startDateTime)
    this.startTime = new Date(this._service.updateModalData.startDateTime)
    this.minTime = new Date(this._service.updateModalData.startDateTime)
    this.appointmentConfirmationStatus = this._service.updateModalData.confirmation_status
    this.specForDocAssn = this._service.updateModalData.speciality_id
    this.clinicIdForDocAssign = this._service.updateModalData.facility_id
    this.docIdForDocAssn = this._service.updateModalData.doctor_id
    this.appId = this._service.updateModalData.appointmentId,
	// this.appointment_duration= this._service.updateModalData.appointment_duration,
      this.duration = this._service.updateModalData.time_slot;
    this.myForm.controls['duration'].setValue(this.duration);
	this.myForm.get('cd_image').setValue( this._service.updateModalData.cd_image);

    this.end = this._service.updateModalData.end;
	this.viewCurrentAppointment;
	debugger;
    this.visitTypeId = this._service.updateModalData.visitTypeid;
    let temp = 0;
    this.endDate = new Date(this.startDate);
    this.startDate.setHours(this.startTime.getHours());
    this.startDate.setMinutes(this.startTime.getMinutes())
    this.startDate.setSeconds(0)
    this.endDate.setMinutes(this.startDate.getMinutes() + this.duration)
    this.endDate.setSeconds(0)
    this.interval = this.duration;
	debugger
	 this.transportationobj=this._service.updateModalData.transportations;
	 this.myForm.controls['is_transportation'].setValue(this._service.updateModalData.is_transportation,);
	 if(this.transportationobj)
	 {
		
		this.transportationobj.map(transobj=>{
			if(transobj.is_pickup)
			{
				let pickupForm={
					id:transobj.id,
					// is_deleted: "",
					is_pickup: transobj.is_pickup,
					pick_up_address:'',
					type: transobj.type,
					comments: transobj.comments,
					street_address: transobj.street_address,
					suit: transobj.suit,
					city: transobj.city,
					state: transobj.state,
					zip: transobj.zip,
					phone: transobj.phone,
				}
				this.transportationForm.pickupForm=pickupForm

			}
			else if(transobj.is_dropoff)
			{
				let dropoffForm={
					  id:transobj.id,
					// is_deleted: "",
          is_dropoff: transobj.is_dropoff,
					dropoff_address:'',
					type: transobj.type,
					comments: transobj.comments,
					street_address: transobj.street_address,
					suit: transobj.suit,
					city: transobj.city,
					state: transobj.state,
          phone:transobj.phone,
					zip: transobj.zip,
				}
					

			this.transportationForm.dropoffForm=dropoffForm
			}
			
		})
		 
	 }
   debugger;
   if(this._service.updateModalData.physician){
	 this.physician= {...this._service.updateModalData.physician};	
   }
	if(this.physician)
	{
		this.physician.full_name=`${this.physician.first_name} ${this.physician.middle_name?this.physician.middle_name:''} ${this.physician.last_name}${this.physician.street_address?', '+this.physician.street_address+',':''} 
		${this.physician.floor?this.physician.floor+",":''}
		${this.physician.city?this.physician.city+",":''} ${this.physician.state?this.physician.state+",":''} ${this.physician.zip?this.physician.zip:''} `
		
		// `${this.physician.first_name}${this.physician.middle_name?' '+this.physician.middle_name:''} ${this.physician.last_name}`
    const physican_id =  this.physician.id;
    this.physician.id =  this.physician.physician_clinic_id;
    this.physician.physician_clinic_id = physican_id;
    this.clinic_location_id = this.clinic_location_id ? this.clinic_location_id : this.physician.clinic_location_id;
		this.lstPhysician=[
			{...this.physician}

		];
		this.showSelectFieldList.physician_id= [...this.lstPhysician]
		this.myForm.get('physician_id').setValue(this.physician && this.physician.id);
		// this.showSelectFieldList.
		// console.log(this.lstPhysician)
	}


	
	
	this.getVisitTypes(this.specForDocAssn,true)
	this.appointment_cpt_codes= this._service.updateModalData.appointment_cpt_codes;
	
	if(this.appointment_cpt_codes)
	{
		let cpt_codes_ids=this.appointment_cpt_codes.map(cpt_codes=>cpt_codes.billing_code_id || cpt_codes.id);

		let lstcptCodes=this.appointment_cpt_codes.map(cpt_codes=>{
			let cpt_code=this._service.updateModalData &&  this._service.updateModalData.change_cpt_response?cpt_codes:cpt_codes.billingCode;
			cpt_code.NameDescription=`${cpt_code.name} - ${cpt_code.description}`;
			return cpt_code
		});

		this.showSelectFieldList.cpt_codes_ids= [...lstcptCodes]
		this.myForm.get('cpt_codes_ids').setValue(cpt_codes_ids)

		// this.showSelectFieldList.
		// console.log(this.lstPhysician)
	}
	this.readingProvider= this._service.updateModalData.reading_provider;	
	if(this.readingProvider)
	{
		this.readingProvider.first_name=this.readingProvider && this.readingProvider.first_name?this.readingProvider.first_name:
		(this.readingProvider.userBasicInfo?this.readingProvider.userBasicInfo.first_name:'');
		'';
		this.readingProvider.middle_name=this.readingProvider && this.readingProvider.middle_name?this.readingProvider.middle_name:
		(this.readingProvider.userBasicInfo?this.readingProvider.userBasicInfo.middle_name:'');
		this.readingProvider.last_name=this.readingProvider && this.readingProvider.last_name?this.readingProvider.last_name:
		(this.readingProvider.userBasicInfo?this.readingProvider.userBasicInfo.last_name:'');
		this.readingProvider.full_name=this.readingProvider?`${this.readingProvider.first_name||''}${this.readingProvider.middle_name?' '+this.readingProvider.middle_name:''} ${this.readingProvider.last_name}`:''
		this.lstReadingProvider=[
			{...this.readingProvider}

		];
		this.showSelectFieldList.reading_provider_id= [...this.lstReadingProvider]
		this.myForm.get('reading_provider_id').setValue(this.readingProvider && this.readingProvider.id);
		// this.showSelectFieldList.
		// console.log(this.lstPhysician)
	}
    // this.getAvailRoom(this.startDate, this.endDate)
    for (var i = 0; i < 8; i++) {
      temp = temp + this.duration;
      this.timeSlot[i] = temp;
    }

	
    // this.requestService
    //   .sendRequest(
    //     DoctorCalendarUrlsEnum.getAppointmentTypes,
    //     'GET',
    //     REQUEST_SERVERS.schedulerApiUrl1
    //   ).subscribe(
    //     (res: HttpSuccessResponse) => {
    //       for (var i = 0, j = 0; i < res.result.data.length; i++, j++) {
    //         this.visitType[j] = res.result.data[i]
    //       }
    //       this.myForm.controls['visitTypeName'].setValue(this.visitTypeId)
    //     })
	// this.getVisitTypes(this.specForDocAssn)
    if (this.aclService.hasPermission(this.userPermissions.appointment_edit)) {
      this.allClinicIds = this.storageData.getFacilityLocations()
	}
    this.requestService
      .sendRequest(
        AssignSpecialityUrlsEnum.getUserInfobyFacility,
        'POST',
		REQUEST_SERVERS.schedulerApiUrl1,
		{
			facility_location_ids: this.allClinicIds,
			speciality_ids:		this.specForDocAssn?[this.specForDocAssn]:[],
			is_provider_calendar:true,
			pagination:false
		},
        
      ).subscribe(
        (res: HttpSuccessResponse) => {
          this.clinics = res.result.data ;
          this.myForm.controls['clinicName'].setValue(this.clinicIdForDocAssign);
          this.setSelectedClinic(this.clinicIdForDocAssign);
        });
    this.getDocAssign();
    this.requestService
      .sendRequest(
        DoctorCalendarUrlsEnum.getAppointmentPriority,
        'GET',
        REQUEST_SERVERS.schedulerApiUrl1
      ).subscribe(
        (res: HttpSuccessResponse) => {
          for (let i = 0; i < res.result.data.length; i++) {
            if (res.result.data[i].id == this.priority) {
              this.priority = res.result.data[i].name
            }
          }
        })
    this.requestService
      .sendRequest(
        DoctorCalendarUrlsEnum.getAppointmentTypes,
        'GET',
        REQUEST_SERVERS.schedulerApiUrl1
      ).subscribe(
        (res: HttpSuccessResponse) => {
          for (let i = 0; i < res.result.data.length; i++) {
            if (res.result.data[i].id == this.type) {
              this.myForm.controls['appoint_type'].setValue(res.result.data[i].description)
            }
          }
        })
    let st = JSON.parse(JSON.stringify(this.startDate))
    let endTime = new Date(this.startDate)
    endTime.setMinutes(this.startDate.getMinutes() + this.duration)
    if (this._service.updateModalData['docId'] !== undefined && this._service.updateModalData['docId'] === 0) {
      this.checkDocUndefined = true;
      this.checker = true;
    }
    else if (this._service.updateModalData['doctorName'] === undefined) {
      this.checkDocUndefined = true;
    } else { this.checkDocUndefined = false; 
     
    }
    this.getSpec();
    this.minMaxTime();
  }

  getAppointmentType(event) {
	debugger;
  if(event){
    let index = this.visitTypeData.findIndex(x => x.appointment_type_id === Number(event.target.value));
    this.allowMultiCPTs = this.visitTypeData && this.visitTypeData.length > 0 ? this.visitTypeData[index].allow_multiple_cpt_codes == 1 ? true:false : false;
    this.apidefaulthit = true;
  } 
	this.isEnableSptCodes();
	this.isEnableReadingProvider()
	this.resetCpt();
  }

  isEnableSptCodes()
	{
		debugger;
		let typeForAppointment=this.myForm.get('visitTypeName').value;
		if(typeForAppointment)
		{
			let selectedvisitType=this.visitType.find(visitType=>visitType.id==parseInt(typeForAppointment));
			if(selectedvisitType)
			{
				this.enableCptCodes=selectedvisitType.enable_cpt_codes
        this.selectedvisitType = selectedvisitType
			}
			else
			{
				this.resetCpt();
				this.enableCptCodes=false;
				
			}
		}
	
	}

	setSelectedVisit(visitTypeId)
	{
		let selectedvisitType=this.visitType.find(visitType=>visitType.id==parseInt(visitTypeId));
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
		let typeForAppointment=this.myForm.get('visitTypeName').value;
		let selectedvisitType=this.visitType.find(visitType=>visitType.id==parseInt(typeForAppointment));
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

  getVisitTypes(specialty_id,onPageLoad?:boolean)
	{
		this.visitType=[];
		this.myForm.controls['visitTypeName'].reset();
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
				this.visitType =res.result.data;
        this.visitTypeData = res && res.result && res.result.data;
				this.visitType = this.visitType && this.visitType.map(dta => dta.visit_types[dta.visit_types.length -1]);
        if(this.visitTypeId){
          this.myForm.controls['visitTypeName'].setValue(this.visitTypeId);	
        }else{
          this.myForm.controls['visitTypeName'].setValue(this.visitType && this.visitType.length != 0 ? this.visitType[0]['id'] : null);	
        }
			this.isEnableSptCodes();
			this.isEnableReadingProvider();
			});
		}
		
	}

  getPracticeLocation()
  {
	this.requestService
	.sendRequest(
	  AssignSpecialityUrlsEnum.getUserInfobyFacility,
	  'POST',
	  REQUEST_SERVERS.schedulerApiUrl1,
	  {
		  facility_location_ids: this.allClinicIds,
		  speciality_ids:		this.specForDocAssn?[this.specForDocAssn]:[],
		  is_provider_calendar:true,
		  pagination:false
	  },
	  
	).subscribe(
	  (res: HttpSuccessResponse) => {
		this.clinics =  res&& res.result&&res.result.data? res.result.data:[];
		this.myForm.controls['clinicName'].setValue(this.clinicIdForDocAssign);
    this.setSelectedClinic(this.clinicIdForDocAssign);

	  });
  }
  /*Form intilaization function*/
  private createForm() {
    this.myForm = this.formBuilder.group({
      appoint_title: ['', Validators.required],
      patient: ['', Validators.required],
      chart: ['', Validators.required],
      caseId: ['', Validators.required],
      doctor: ['', Validators.required],
      priority: ['', Validators.required],
      appoint_type: ['', Validators.required],
      docName: ['', Validators.required],
      examRoom: '',
      comment: '',
      duration: '',
      noOfOccurence: '',
      endOccureneceDate: '',
      visitTypeName: ['', Validators.required],
      confirmationName: '',
      specAptInput: '',
      clinicName:'',
	  cpt_codes_ids:[],
	  physician_id:[],
	  reading_provider_id:[],
	  cd_image:[],
	  is_transportation:[false],
	  'specAptInputName':[]
    });
  }
  public changeTime() {
	  debugger;
    if (this.startTime != null || this.startTime != undefined)
    {
		this.time_check=false;
      if(this.startDate != null || this.startDate != undefined)
      {
    this.endDate = new Date(this.startDate);
    this.startDate.setHours(this.startTime.getHours());
    this.startDate.setMinutes(this.startTime.getMinutes())
    this.startDate.setSeconds(0)
    this.endDate.setHours(this.startTime.getHours());
    this.endDate.setMinutes(this.startDate.getMinutes() + this.duration)
    this.endDate.setSeconds(0)
    // this.getAvailRoom(this.startDate, this.endDate)
    this.getDoctorAssignedForSpec();
      }
    }
	else{
	}
  }
  /*Get all avialable rooms*/
  public getAvailRoom(st, ed) {
    // var reqObj = {
    //   "docId": [this.docIdForDocAssn],
    //   "startDate": convertDateTimeForSending(this.storageData, new Date(st)),
    //   "endDate": convertDateTimeForSending(this.storageData, new Date(ed))
    // }
    // this.requestService
    //   .sendRequest(
    //     AssignRoomsUrlsEnum.getAvailableRoomsForDoctor,
    //     'POST',
    //     REQUEST_SERVERS.schedulerApiUrl,
    //     reqObj
    //   ).subscribe(
    //     (res: HttpSuccessResponse) => {
    //       if (this.room == undefined) {
    //         for (var i = 0, j = 1; i < res.result.data.length; i++, j++) {
    //           this.roomList[j] = res.result.data[i].room
    //         }
    //         this.room = this.roomList[0].id;
    //       }
    //       else {
    //         for (var i = 0, j = 1; i < res.result.data.length; i++, j++) {
    //           if (res.result.data[i].room.id == this.room) {
    //             this.room = res.result.data[i].room.id;
    //           }
    //           this.roomList[j] = res.result.data[i].room
    //         }

    //       }
    //     })
  }
  public changeDate() {
    if (this.startDate != null || this.startDate != undefined)
    {
    this.endDate = new Date(this.startDate);
    this.startDate.setHours(this.startTime.getHours());
    this.startDate.setMinutes(this.startTime.getMinutes())
    this.startDate.setSeconds(0)
    this.endDate.setMinutes(this.startDate.getMinutes() + this.duration)
    this.endDate.setSeconds(0)
    // this.getAvailRoom(this.startDate, this.endDate)
    //this.F(); //hhh
    this.getDoctorAssignedForSpec();
    }
  }

  public onChangeAptDate(event)
	{
		if(event.dateValue)
		{
		  this.startDate=new Date(event.dateValue);
		  this.date_check=false;
		  this.changeDate();
		} 
		else
		{
			this.startDate=null
		}
	}
  public updateAppointment() {
    this.btnSubmit = true;
    if(this.selectedSpecialtyKey == 'diagnostic' && !this.myForm.get('physician_id').value &&  this.btnSubmit) {
      return;
    }
	  if(this.transportationComponent&&this.transportationComponent.transportationForm.invalid)
		{
			this.transportationComponent.markFormGroupTouched(this.transportationComponent.transportationForm)
			return ;
		}
		this.transportationForm=this.getTransportationFormValues()
		if( this.myForm.get('is_transportation').value&& this.transportationComponent &&!this.transportationForm.pickupForm.type && !this.transportationForm.dropoffForm.type)
		{
			this.toastrService.error(
				'You have selected transportation. Please select atleast one option Pick Up or Drop Off.',
				'Error',
			);
			return;
		}
	this.startLoader=true
	let transportation=[];
	if(this.transportationForm && this.transportationForm.pickupForm)
	{
		transportation=[{...this.transportationForm.pickupForm}]
	}
	if(this.transportationForm && this.transportationForm.dropoffForm)
	{
		transportation=[...transportation,{...this.transportationForm.dropoffForm}]
	}
	// let transportation=[
	// 	this.transportationForm&&this.transportationForm.pickupForm?this.transportationForm.pickupForm:{},
	// 	this.transportationForm&&this.transportationForm.dropoffForm?this.transportationForm.dropoffForm:{}
	// 	// {...this.transportationForm.pickupForm},
	// 	// {...this.transportationForm.dropoffForm},
		
	// ];
    for(let i=0;i<this.specialityList.length;i++)
    {
		debugger;
      if((this.myForm.value['specAptInput'] === this.specialityList[i]['id']|| (this.myForm.value['specAptInput'] === this.specialityList[i]['id'].toString())))
      {
        this.specialityKey = this.specialityList[i]['speciality_key']
        break
      }
    }
    // if(this.specialityKey == 'medical_doctor')
    // {
    //   for(let i=0;i<this.visitType.length;i++)
    //   {
    //     if((this.myForm.value['visitTypeName'] === this.visitType[i].id) ||(this.myForm.value['visitTypeName'] === this.visitType[i].id.toString())) 
    //     {
    //       this.temp = this.visitType[i]['slug'];
    //       break;
    //     }
    //   }
    // }
    // if (this.temp === 're_evaluation')
    // {
    //   this.toastrService.error('Re-Evaluation cannot be made against this speciality', 'Error')
    // }
    // else{

    if(this.startDate == null || this.startDate == undefined )
    {
      this.date_check = true;
    }
    else{
      this.date_check = false;
    }
     if(this.startTime == null || this.startTime == undefined)
    {
    
      this.time_check = true;
    }
    else
    {
      this.time_check = false;
    }
     if(this.myForm.value["duration"] == null || this.myForm.value["duration"] == undefined || this.myForm.value["duration"] == "duration")
    {
      
      // this.toastrService.error('Duration is required', 'Error')
    }
    if (this.getHours == undefined || this.getMinutes == undefined) {
      this.getHours = new Date(this.startTime).getHours()
      this.getMinutes = new Date(this.startTime).getMinutes()
      this.startDate.setHours(this.getHours)
      this.startDate.setMinutes(this.getMinutes)
    }
    if (this.startDate != undefined && this.startTime != undefined) {
      if (parseInt(this.myForm.get("confirmationName").value) == 1) {
        this.confirmChecking = true;
      }
      else {
        this.confirmChecking = false;
      }
      if (this.appTitle === null || this.appTitle == '' || this.appTitle === undefined) {
        this.appTitle = 'N/A'
      }
      if  (this.myForm.get('docName').value == null || this.myForm.get('docName').value  == "")
      {
        // this.myForm.controls['docName'].setValue('');
      }
	  let cpt_codes_ids= this.myForm.controls['cpt_codes_ids'];

	var reqObj = {
        "id": this.appId,
        "speciality_id":this.myForm.get('specAptInput').value? parseInt(this.myForm.get('specAptInput').value):null,
        'facility_location_id':this.clinicIdForDocAssign,
        "comments": this.comment,
        // "roomId": 0,
        "appointmentTitle": this.appTitle,
        "physician_specialty_id": this.physician_specialty_id,
        "start_date_time": convertDateTimeForSending(this.storageData, new Date(this.startDate)),
        "doctor_id":parseInt(this.myForm.get('docName').value) ? parseInt(this.myForm.get('docName').value):null,
        "time_slot":this.myForm.get('duration').value? parseInt(this.myForm.get('duration').value):null,
        "confirmation_status": this.confirmChecking,
		"appointment_type_id": parseInt(this.myForm.get('visitTypeName').value),
		"priority_id":this._service.updateModalData.priority_id,
		"patient_id":this._service.updateModalData.patient_id,
		"case_id":this._service.updateModalData.case_id,
		"case_type_id":this._service.updateModalData.case_type_id,
    physician_id :  this.physician_Id ?  this.physician_Id  : this.myForm.controls['physician_id'].value? parseInt(this.myForm.controls['physician_id'].value) : null ,
		cpt_codes: this.myForm.controls['cpt_codes_ids'].value? this.myForm.controls['cpt_codes_ids'].value: null,
		is_transportation:this.myForm.get('is_transportation').value?true:false,

		transportation:transportation,
		reading_provider_id: this.myForm.controls['reading_provider_id'].value? parseInt(this.myForm.controls['reading_provider_id'].value) : null,
		cd_image:this.myForm.controls['cd_image'].value,
		'time_zone':stdTimezoneOffset(),

	  }
	  reqObj= removeEmptyAndNullsFormObject(reqObj)


      if (reqObj.comments == null) {
        reqObj.comments = 'N/A'
      }
      this.requestService
        .sendRequest(
          DoctorCalendarUrlsEnum.updateAppointment,
          'PUT',
          REQUEST_SERVERS.schedulerApiUrl1,
          reqObj
        ).subscribe(
          (res: HttpSuccessResponse) => {
		     	this.startLoader=false;
            if (res && res.result && res.result.data && res.result.data['appointment'] && res.result.data['appointment'][0]&& res.result.data['appointment'][0]['id']) {
              if (res.result && res.result['data'] && res.result['data']['appointment'] && res.result['data']['appointment'][0] && 
              res.result['data']['appointment'][0]['time_slots'] != parseInt(this.myForm.controls['duration'].value)) {
                this.toastrService.success(`Appointment is updated of ${res.result && res.result['data'] && res.result['data']['appointment'] && res.result['data']['appointment'][0] && res.result['data']['appointment'][0]['time_slots']} min instead of  ${parseInt(this.myForm.controls['duration'].value)} min`, 'Success')
              }
              else {
                if(res && res.result && res.result['data'] && res.result['data']['msg_alert_1']){
                  this.toastrService.success(res && res.result && res.result['data'] && res.result['data']['msg_alert_1'],'Success')  
                  this.activeModal.close(true)
                }if(res && res.result && res.result['data'] && res.result['data']['msg_alert_2']){
                  this.toastrService.success(res && res.result && res.result['data'] && res.result['data']['msg_alert_2'],'Success') 
                  this.activeModal.close(true)
                }
              }
              let oobj: any = res.result && res.result['data'] && res.result['data'];
              let currAppData = oobj && oobj['appointment'] && oobj['appointment'][0];
              if((this.docIdForDocAssn && !(currAppData['availableDoctor'])) ||
               (!this.docIdForDocAssn && (currAppData['available_doctor_id'])) ||
               (new Date(this._service.updateModalData.startDateTime).toDateString() != new Date(currAppData['scheduled_date_time']).toDateString())||
               (this.docIdForDocAssn != (currAppData['availableDoctor'] && currAppData['availableDoctor']['doctor_id']))||
               (this._service.updateModalData.facility_id != (currAppData['availableSpeciality'] && currAppData['availableSpeciality']['facility_location_id']))||
               (this._service.updateModalData.speciality_id != (currAppData['availableSpeciality'] && currAppData['availableSpeciality']['speciality_id']))){
                oobj['appShifted'] = true;
              }
              if (!oobj["roomName"]) {
                oobj["roomName"] = "N/A"
              }
              oobj["appointmentTypeDes"] = this.myForm.get('visitTypeName').value
              oobj["patientName"] = this.patient;
              oobj['trigger'] = true;
              this.AppSubjectService.refreshUpdate(oobj)
              this.subject.refreshAssignment('Appointment Updated')
              this.SubjectService.refresh('Appointment Updated')
              this.SubjectService.updateAppointment.next(true);//This is where we send the update object
              this.activeModal.close(true)
            } else if (res.result.data["message"]) {
              this.toastrService.error(res.result.data['message'], 'Error')
              this.activeModal.close(true)
            } else if (res["message"] === "Patient already has appointment at this time.") {

              this.customDiallogService.confirm('Add',res["message"] + '.Are you sure you want to add.','Yes','No')
              .then((confirmed) => {
                if (confirmed){
                  this.startLoader=true
                  reqObj["confirm"] = true;
                  this.requestService
                    .sendRequest(
                      DoctorCalendarUrlsEnum.updateAppointment,
                      'POST',
                      REQUEST_SERVERS.schedulerApiUrl1,
                      reqObj
                    ).subscribe(
                      (respp: HttpSuccessResponse) => {
                        this.startLoader=false;
                        if (respp.result && respp.result['data'] && respp.result['data']['appointments'] && respp.result['data']['appointments'][0] && 
                        respp.result['data']['appointments'][0]['id']) {
                          if (respp.result && respp.result['data'] && respp.result['data']['appointments'][0] && respp.result['data']['appointments'][0] && 
                          respp.result['data']['appointments'][0]['time_slots'] != parseInt(this.myForm.controls['duration'].value)) {
                            this.toastrService.success(`Appointment is updated of ${respp.result && respp.result['data'] && respp.result['data']['appointment'] && respp.result['data']['appointment'] && 
                            respp.result['data']['appointment']['time_slots']} min instead of  ${parseInt(this.myForm.controls['duration'].value)} min`, 'Success')
                          }
                          else {
                            if(res && res.result && res.result['data'] && res.result['data']['msg_alert_1']){
                              this.toastrService.success(res && res.result && res.result['data'] && res.result['data']['msg_alert_1'],'Success') 
                            }if(res && res.result && res.result['data'] && res.result['data']['msg_alert_2']){
                              this.toastrService.success(res && res.result && res.result['data'] && res.result['data']['msg_alert_2'],'Success')  
                            }
                          }
                          let oobj: any = res.result && res.result['data'] && res.result['data']['appointments'];
                          if (!oobj["roomName"]) {
                            oobj["roomName"] = "N/A"
                          }
                          oobj["appointmentTypeDes"] = this.myForm.get('visitTypeName').value
                          oobj["patientName"] = this.patient;
                          oobj['trigger'] = true;
                          let currAppData = oobj && oobj['appointment'] && oobj['appointment'][0];
                          if((this.docIdForDocAssn && !(currAppData['availableDoctor'])) ||
                          (!this.docIdForDocAssn && (currAppData['available_doctor_id'])) ||
                          (new Date(this._service.updateModalData.startDateTime).toDateString() != new Date(currAppData['scheduled_date_time']).toDateString())||
                          (this.docIdForDocAssn != (currAppData['availableDoctor'] && currAppData['availableDoctor']['doctor_id']))||
                          (this._service.updateModalData.facility_id  != (currAppData['availableSpeciality'] && currAppData['availableSpeciality']['facility_location_id']))||
                          (this._service.updateModalData.speciality_id != (currAppData['availableSpeciality'] && currAppData['availableSpeciality']['speciality_id']))){
                            oobj['appShifted'] = true;
                          }
                          this.AppSubjectService.refreshUpdate(oobj)
                          this.subject.refreshAssignment('Appointment Updated')
                          this.SubjectService.refresh('Appointment Updated')
                          this.SubjectService.updateAppointment.next(true);//This is where we send the update object
                          this.activeModal.close(true)
                        } else if (respp.result.data["message"]) {
                          this.toastrService.error(respp.result.data['message'], 'Error')
                        }
                      });
                }else if(confirmed === false){
                }else{
                }
              })
              .catch();
            }
		  },
		  err=>{
			this.startLoader=false;
			  if(err.status==500)
			this.toastrService.error(err.error.message, 'Error')

		  }
        )
    }
//   }
  }

  selectedClinic;
  
  clinicChange(event) {
	  this.clinicIdForDocAssign=event.target.value?parseInt(event.target.value):null
    for (let i = 0; i < this.clinics.length; i++) {
      if (this.clinics[i].id === parseInt(event.target.value)) {
        this.clinicIdForDocAssign = this.clinics[i].id;
        this.selectedClinic = this.clinics[i];
        break;
      }
    }
	this.getSpec();
    this.getDoctorAssignedForSpec();
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

  minMaxTime() {
    let tempData = JSON.parse(localStorage.getItem('appointmentData'));
    let sTime: any = convertTimeTo24Hours(tempData?.start_time);
    let eTime: any = convertTimeTo24Hours(tempData?.end_time);
    let startDate = new Date(this._service?.currentSelectedDate);
		let endDate = new Date(this._service?.currentSelectedDate);
    var stDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
      sTime[0] + sTime[1],
      sTime[3] + sTime[4],
    );
    this.minStartTime = stDate;
    var edDate = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate(),
      eTime[0] + eTime[1],
      eTime[3] + eTime[4],
    );
    this.maxEndTime = edDate;
	}

  public getDocAssign() {
	  if(this.clinicIdForDocAssign && this.specForDocAssn)
	  {
      let body = {
        'facility_location_id': this.clinicIdForDocAssign,
        'speciality_id': this.specForDocAssn,
        'start_date': convertDateTimeForSending(this.storageData, new Date(this.startDate)),
        'end_date': convertDateTimeForSending(this.storageData, new Date(this.endDate))
     }
     if(this.appPrevData?.doctor_id){
      body['appointment_id'] = this.appId
     }
     console.log(body)
		this.requestService
		.sendRequest(
		  DoctorCalendarUrlsEnum.getPartialAvailableDoctors,
		  'POST',
		  REQUEST_SERVERS.schedulerApiUrl1,
      body
		).subscribe(
		  (res: HttpSuccessResponse) => {
        let endTime;
        if (res?.result?.data?.length == 0)
        {
        }
        else if (res?.result?.data?.length != 0)
        {
        for (let i = 0; i < res.result.data.length; i++) {
          this.allDoc[i] = res.result.data[i];
          if (res.result.data[i].doctor_id == this.docIdForDocAssn) {
          this.myForm.controls['docName'].setValue(this.docIdForDocAssn)
          endTime = new Date(this.startTime)
          endTime.setMinutes(this.startTime.getMinutes() + this.duration)
          }
          else {
          this.allDoc = res?.result?.data;
          }
        }
        }
        this.doctors = res?.result?.data;
		  }, err => {
			this.myForm.controls['docName'].setValue('')
		  })
	  }

  }
  public changeDuration() {
    this.interval = parseInt(this.myForm.get('duration').value);
  }

  //get Specialty list 
  public getSpec() {
    this.requestService
      .sendRequest(
		AssignSpecialityUrlsEnum.GetUserInfoBySpecialities,
		'post',
		REQUEST_SERVERS.schedulerApiUrl1,
		{
			facility_location_ids: this.clinicIdForDocAssign?[this.clinicIdForDocAssign]:this.allClinicIds,
			per_page: Pagination.per_page,
			page:1,
			pagination:true,
			is_provider_calendar:true
		}
      ).subscribe(
        async (resp: HttpSuccessResponse) => {
          this.specialityList =(resp.result.data && resp.result.data.docs)?resp.result.data.docs:[] ;
          for (let i = 0; i < this.specialityList.length; i++) {
            if (this.specialityList[i].id == this.specForDocAssn) {
              this.myForm.controls['specAptInput'].setValue(this.specialityList[i].id);
			  this.setSelectedSpecialty(this.specForDocAssn);
			  this.myForm.controls['specAptInputName'].setValue(this.specialityList[i].name);

			  this.getSpecialtyKey(this.specForDocAssn)
            }
          }
        });
  }

  
identify(index, item) {
	return item.label;
 }

  getTransportationFormValues()
	{
		// let transportationFormValues=this.transportationComponent.transportationForm.value;
		// return transportationFormValues


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


  //Specialty selected
  public specialityChange(e) {
	  this.specForDocAssn=e.target.value? parseInt(e.target.value):null;
	  this.setSelectedSpecialty( this.specForDocAssn);
	  this.getSpecialtyKey(this.specForDocAssn,true)
	  this.getPracticeLocation();
    this.getDoctorAssignedForSpec();
    this.visitTypeId=null;
    this.getVisitTypes(this.specForDocAssn);
    this.setReferringPhyValidation();
  }

  getSpecialtyKey(specialtyId,resetCDImage?)
  {
	  if(resetCDImage)
	  {
		
			this.myForm.get('cd_image').reset();
		
	  }
	  let selectedSpecialty=this.specialityList.find(specialty=>specialty.id==specialtyId)
	  if(selectedSpecialty)
	  {

		this.selectedSpecialtyKey=selectedSpecialty.speciality_key;
	

	  }
	  else
	  {
		this.selectedSpecialtyKey=null
	  }
	  
  }

  setSelectedSpecialty(specialtyId)
  {
	  
	  let selectedSpecialty=this.specialityList.find(specialty=>specialty.id==specialtyId)
	  if(selectedSpecialty)
	  {

		this.selectedSpecialty=selectedSpecialty;
	

	  }
	  else
	  {
		this.selectedSpecialty=null
	  }
	  
  }

  //update doctor list when spec changed
  public getDoctorAssignedForSpec() {
	if(this.clinicIdForDocAssign && this.myForm.controls['specAptInput'].value)
	{
    let body = {
			'facility_location_id': this.clinicIdForDocAssign,
			'speciality_id': this.myForm.controls['specAptInput'].value,
			'start_date': convertDateTimeForSending(this.storageData, new Date(this.startDate)),
			'end_date': convertDateTimeForSending(this.storageData, new Date(this.endDate))
		  }
    if(this.appPrevData?.doctor_id){
      body['appointment_id'] = this.appId
     }
		this.requestService
		.sendRequest(
		  AppointmentUrlsEnum.getAvailabilitiesOfAvailableDoctor,
		  'POST',
		  REQUEST_SERVERS.schedulerApiUrl1,
		  body
		).subscribe(
		  (response: HttpSuccessResponse) => {
			
			  this.allDoc = response.result.data;
			this.checkDocUndefined = false;
		  }, err => {
		  });
	}
  
  }
  getTouched(event:any){
    let index = this.visitTypeData.findIndex(x => x.appointment_type_id === parseInt(this.myForm.controls['visitTypeName'].value));
    this.allowMultiCPTs =  this.visitTypeData && this.visitTypeData.length > 0 ? this.visitTypeData[index].allow_multiple_cpt_codes == 1 ? true:false : false;
  }
  selectionOnValueChange(e: any,_form:FormGroup,Type?) {
  if(!isArray(e &&e.formValue?e.formValue:null) && Type == 'cpt_codes_ids'){
    _form.controls[Type].setValue(e &&e.formValue?[e.formValue]:null);	
  }
  
  else{
    _form.controls[Type].setValue(e &&e.formValue?e.formValue:null);
    this.clinic_location_id = e && e.data && e.data.realObj ? e.data.realObj.clinic_location_id : null;
  }	
}

openTransportation()
	{
		debugger;
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
		this.activeModalRef = this.modalservice.open(TransportationModalComponent, ngbModalOptions);
		this.activeModalRef.componentInstance.patientId=this.patientId;
		this.activeModalRef.componentInstance.physician_id=physician_id;
		this.activeModalRef.componentInstance.transportationFormObj={...this.transportationForm}
		// this.activeModalSoftPatient.componentInstance.selectedPhysician=

		this.activeModalRef.result.then(res=>{
				debugger;
			if(res && res.data)
			{
				this.transportationForm=res.data;
				console.log(this.transportationForm);
			}
		});
	}


	public onTransportationChange(event) {
		debugger;
		console.log(event.target.checked);
		this.transportationForm={pickupForm:null,dropoffForm:null};


	
	}
	resetCpt()
	{
		this.eventsSubjectCpt.next(true);
		this.myForm.get('cpt_codes_ids').reset(null,{emitEvent:false})
	}

	resetReadingProvider()
	{
		debugger;
		this.eventsSubjectReadingProvider.next(true);
		this.myForm.get('reading_provider_id').reset(null,{emitEvent:false})
	}

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
}
