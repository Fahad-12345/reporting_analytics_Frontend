
import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { AppointmentSubjectService } from '../../../appointment/subject.service';
//service
import { DoctorCalendarService } from '../../doctor-calendar.service';
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
import { convertDateTimeForSending, removeEmptyAndNullsFormObject, stdTimezoneOffset } from '@appDir/shared/utils/utils.helpers';
import { Subject } from 'rxjs';
import { ReferringPhysicianUrlsEnum } from '@appDir/front-desk/masters/practice/referring-physician/referring-physician/referringPhysicianUrlsEnum';
import { TransportationModalComponent } from '../transportation-modal/transportation-modal.component';

@Component({
  selector: 'app-view-appoit-modal',
  templateUrl: './view-appoointment-modal.component.html',
  styleUrls: ['./view-appoointment-modal.component.scss']
})
export class ViewAppoitModalComponent extends PermissionComponent implements OnInit {
	@Input() viewCurrentAppointment:any;
	practice_location_qualifier:any;
	visit_type: any;
	specality_qualifier:any;
  myForm: FormGroup;
  public patient: any;
  patientId:any;
  public chart: any;
  public case: any;
  public lstpriority: any[]=[];
  priority_id:any;
  public duration: any;
  public specialty_id: any;
  public doctor_id: any;
  public facility_location_id: any;
  public comment: any;
  public temp;
  public visit_status;
  public specialityKey;
  public startDate: any;
  public timeSlot: any = [];
  public startTime: any;
  public interval: any;
  public visitTypeId: any;
 public appointment_status:any;
  public endDate: any;
  public lstvisitType = [];
  specialtyName:string='';
  eventsSubjectCpt: Subject<any> = new Subject<any>();
  eventsSubjectPhysicians: Subject<any> = new Subject<any>();
  showSelectFieldList: any = {
	  'cpt_codes_ids': [],
	  'physician_id':[]
  };
  EnumApiPath = DoctorCalendarUrlsEnum;
  ReferringPhysician_Listing=ReferringPhysicianUrlsEnum.PHYSICIAN_LISTING;
  activeModalRef:NgbModalRef;
  transportationForm:{pickupForm:any,dropoffForm:any}={pickupForm:null,dropoffForm:null};
  transportationobj:any;
  physician:any;
  physicianId:any;
  appointment_cpt_codes:any[]=[];
  lstPhysician:any[]=[];
  patientFullName:string='';
  doctorFullName:string='';
  physician_id:number;
  practiceLocation:string="";
  cancelledComments:string='';
  isCancelled:boolean=false;
  visitTypeName;
  practice_location_name;

  constructor(aclService: AclService,
    router: Router,
    public activeModal: NgbActiveModal, 
    private formBuilder: FormBuilder,
    protected requestService: RequestService,
	public modalservice: NgbModal,

  ) {
    super(aclService, router);
    this.createForm();
  }
  ngOnInit() {
	  debugger;
    this.patient = this.viewCurrentAppointment.patient?this.viewCurrentAppointment.patient:null;
	this.patientFullName=this.patient?`${this.patient.first_name}${this.patient.middle_name?' '+this.patient.middle_name:''} ${this.patient.last_name}`:'';
	this.patientId=this.patient.id;
    var startString = "000-00-";
    var receivedString = JSON.stringify(this.patientId);
    var finalStr = startString + receivedString.padStart(4, "0");
    this.chart = finalStr;
    this.case = this.viewCurrentAppointment.case_id + " "+ this.viewCurrentAppointment.caseType.name;
    this.priority_id = this.viewCurrentAppointment.priority_id;
    this.comment = this.viewCurrentAppointment.comments;
    this.startDate = new Date(this.viewCurrentAppointment.scheduled_date_time);
    this.startTime = new Date(this.viewCurrentAppointment.scheduled_date_time);
    this.specialty_id = this.viewCurrentAppointment.speciality?this.viewCurrentAppointment.speciality.id:null;
	this.specialtyName= this.viewCurrentAppointment.speciality?this.viewCurrentAppointment.speciality.name:'N/A';
	this.specality_qualifier=this.viewCurrentAppointment.speciality?this.viewCurrentAppointment.speciality.qualifier:'N/A';
	this.physician_id = this.viewCurrentAppointment.physician_id;
    this.facility_location_id = this.viewCurrentAppointment?this.viewCurrentAppointment.facility_location_id:null;
    this.doctor_id = this.viewCurrentAppointment.availableDoctor?this.viewCurrentAppointment.availableDoctor.doctor_id:null;
      this.duration = this.viewCurrentAppointment.time_slots;
    this.myForm.controls['duration'].setValue(this.duration);
    this.visitTypeId = this.viewCurrentAppointment.type_id;
	this.visitTypeName = this.viewCurrentAppointment.type_id;
	debugger;
	this.visit_status=this.viewCurrentAppointment.patientSessions &&  this.viewCurrentAppointment.patientSessions.visitStatus &&!this.viewCurrentAppointment.cancelled ? this.viewCurrentAppointment.patientSessions.visitStatus.name:
	(this.viewCurrentAppointment.visit_status?this.viewCurrentAppointment.visit_status:'N.A');
	this.appointment_status=this.viewCurrentAppointment.appointmentStatus &&!this.viewCurrentAppointment.cancelled?this.viewCurrentAppointment.appointmentStatus.name:'N/A';
	this.myForm.controls['cd_image'].setValue(this.viewCurrentAppointment&& this.viewCurrentAppointment.cd_image?this.viewCurrentAppointment.cd_image:'');
	
	this.myForm.controls['reading_provider'].setValue(this.viewCurrentAppointment&& this.viewCurrentAppointment.reading_provider?this.viewCurrentAppointment.reading_provider:'');
	this.doctorFullName= this.viewCurrentAppointment && this.viewCurrentAppointment.doctor_full_name?this.viewCurrentAppointment.doctor_full_name:'N/A';
    this.practiceLocation=this.viewCurrentAppointment?this.viewCurrentAppointment.facility_location_name:'N/A';
	this.isCancelled=this.viewCurrentAppointment?this.viewCurrentAppointment.cancelled:false;
	this.cancelledComments=this.viewCurrentAppointment?this.viewCurrentAppointment.cancelled_comments:'N/A';
	this.practice_location_qualifier =this.viewCurrentAppointment?this.viewCurrentAppointment.facility_location_qualifier:'N/A';
	debugger;
	this.practice_location_name =this.viewCurrentAppointment && this.viewCurrentAppointment.facility_location_name
	?
	this.viewCurrentAppointment.facility_location_name:'N/A';

	this.visit_type = this.viewCurrentAppointment?this.viewCurrentAppointment.visit_type:'N/A';
	debugger;
	let temp = 0;
    this.endDate = new Date(this.startDate);
    this.startDate.setHours(this.startTime.getHours());
    this.startDate.setMinutes(this.startTime.getMinutes());
    this.startDate.setSeconds(0);
    this.endDate.setMinutes(this.startDate.getMinutes() + this.duration);
    this.endDate.setSeconds(0);
    this.interval = this.duration;
	debugger;
	 this.transportationobj=this.viewCurrentAppointment.transportations;
	 if(this.transportationobj)
	 {
		let transportation:{pickupForm:any,dropoffForm:any}={pickupForm:null,dropoffForm:null};
		this.transportationobj.map(transobj=>{
			if(transobj.is_pickup)
			{
				let pickupForm={
					id:transobj.id,
					is_pickup: transobj.is_pickup,
					pick_up_address:'',
					type: transobj.type,
					comments: transobj.comments,
					street_address: transobj.street_address,
					suit: transobj.suit,
					city: transobj.city,
					state: transobj.state,
					zip: transobj.zip,
					phone:transobj.phone
				};
				// this.transportationForm.pickupForm=pickupForm
				 transportation.pickupForm=pickupForm;
			}
			else if(transobj.is_dropoff)
			{
				let dropoffForm={
					id:transobj.id,
				
					is_dropoff: transobj.is_dropoff,
					dropoff_address:'',
					type: transobj.type,
					comments: transobj.comments,
					street_address: transobj.street_address,
					suit: transobj.suit,
					city: transobj.city,
					state: transobj.state,
					zip: transobj.zip,
					phone: transobj.phone,
				};
			// this.transportationForm.dropoffForm=dropoffForm
			transportation.dropoffForm=dropoffForm;
			}			
		}); 
			this.transportationForm={...transportation};
	 }	 
	 this.physician= {...this.viewCurrentAppointment?.physicianClinic?.physician};	
	if(this.physician)
	{
		const physican_id =  this.physician.id;
		this.physician.id =  this.physician.physician_clinic_id;
		this.physician.physician_clinic_id = physican_id;
		this.physician.full_name=`${this.physician.first_name} ${this.physician.middle_name?this.physician.middle_name:''} ${this.physician.last_name}${this.physician.street_address?+', '+this.physician.street_address+",":''} 
		${this.physician.floor?this.physician.floor+",":''}
		${this.physician.city?this.physician.city+",":''} ${this.physician.state?this.physician.state+" ":''} ${this.physician.zip?this.physician.zip:''} `
		
		// `${this.physician.first_name}${this.physician.middle_name?' '+this.physician.middle_name:''} ${this.physician.last_name}`;
		this.lstPhysician=[
			{...this.physician}

		];
		this.showSelectFieldList.physician_id= [...this.lstPhysician];
		this.myForm.get('physician_id').setValue(this.physician && this.physician.id);
	}
	
	this.appointment_cpt_codes= this.viewCurrentAppointment.appointmentCptCodes;
	if(this.appointment_cpt_codes)
	{
		let cpt_codes_ids=this.appointment_cpt_codes.map(cpt_codes=>cpt_codes.billing_code_id ||cpt_codes.id);
		let lstcptCodes=this.appointment_cpt_codes.map(cpt_codes=>{
			let cpt_code= this.viewCurrentAppointment && this.viewCurrentAppointment.change_cpt_response ?cpt_codes:cpt_codes.billingCode;
			cpt_code.NameDescription=`${cpt_code.name} - ${cpt_code.description}`;
			return cpt_code;
		});
		this.showSelectFieldList.cpt_codes_ids= [...lstcptCodes];
		this.myForm.get('cpt_codes_ids').setValue(cpt_codes_ids);
	}
  
    for (var i = 0; i < 8; i++) {
      temp = temp + this.duration;
      this.timeSlot[i] = temp;
    }
   
	this.getVisitTypes(this.specialty_id);
	this.getAppointmentPriority();
    let st = JSON.parse(JSON.stringify(this.startDate));
    let endTime = new Date(this.startDate);
    endTime.setMinutes(this.startDate.getMinutes() + this.duration);
	this.setFormValues();
	this.myForm.disable();
	
  }
  getAppointmentPriority()
  {
	this.requestService
	.sendRequest(
	  DoctorCalendarUrlsEnum.getAppointmentPriority,
	  'GET',
	  REQUEST_SERVERS.schedulerApiUrl1
	).subscribe(
	  (res: HttpSuccessResponse) => {
		  this.lstpriority=res.result.data;
	  
	  });
  }

  getVisitTypes(specialty_id)
	{
		this.lstvisitType=[];
		this.resetCpt();
		if(specialty_id)
		{
			let req={
				specialty_id:specialty_id
			};
			this.requestService
			.sendRequest(
				DoctorCalendarUrlsEnum.specialtyVisitTypes,
				'GET',
				REQUEST_SERVERS.fd_api_url,
				req
			)
			.subscribe((res: HttpSuccessResponse) => {
				this.lstvisitType = res && res.result && res.result.data;
				this.lstvisitType = this.lstvisitType && this.lstvisitType.map(dta => dta.visit_types[dta.visit_types.length -1]);
			    this.myForm.controls['visit_type_id'].setValue(this.visitTypeId);
			});
		}	
	}


  
  /*Form intilaization function*/
  private createForm() {
    this.myForm = this.formBuilder.group({
      patient: ['', Validators.required],
      chart: ['', Validators.required],
      caseId: ['', Validators.required],
      priority_id: ['', Validators.required],
      doctor_id: ['', Validators.required],
	  doctor_name:[''],    
      comment: '',
      duration: '',
	  'reading_provider':'',
      visit_type_id: ['', Validators.required],
      specialty_id: '',
	  specialty_name:'',
      practice_location_id:'',
	  cpt_codes_ids:[{value:'', disabled:true}],
	  physician_id:[{value:'', disabled:true}],
	  appointment_status:[''],
	  cd_image:[''],
	  visit_status:[''],
	  practice_location_name:[''],
	  cancelled_comments:[''],
	  practice_location_qualifier:[''],
	  specality_qualifier:['']
    });
  }

  setFormValues()
  {
	  debugger;
	this.myForm.patchValue({
		patient:this.patientFullName,
		chart:this.chart,
		caseId:this.case,
		priority_id:this.priority_id,
		visit_type_id:this.visitTypeId,
		practice_location_id:this.facility_location_id,
		practice_location_name: this.practiceLocation,
		practice_location_qualifier:this.practice_location_qualifier,
		doctor_id:this.doctor_id,
		specialty_id:this.specialty_id,
		specialty_name:this.specialtyName,
		doctor_name:this.doctorFullName,
		comment: this.comment,
		duration: this.duration,
		appointment_status:this.appointment_status,
		visit_status:this.visit_status,
		cancelled_comments: this.cancelledComments,
		specality_qualifier:this.specality_qualifier
	});
  }

 

  

  public changeDuration() {
    this.interval = parseInt(this.myForm.get('duration').value);
  }

 

  selectionOnValueChange(e: any,_form:FormGroup,Type?) {
	debugger;
	
	_form.controls[Type].setValue(e &&e.formValue?e.formValue:null);
	
}

	resetCpt()
	{
		this.eventsSubjectCpt.next(true);
	}

}
