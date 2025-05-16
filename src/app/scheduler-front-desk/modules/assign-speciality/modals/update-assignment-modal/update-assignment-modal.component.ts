
import { Component, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { formatDate } from '@angular/common';
import { AssignSpecialityService } from '../../assign-speciality.service';
import { CalendarMonthService } from '../../utils/my-calendar/src/modules/month/calendar-month.service';
import { SchedulerSupervisorService } from '../../../../scheduler-supervisor.service';
import { SubjectService } from "../../subject.service";
import { FrontDeskService } from '../../../../front-desk.service';
import { ToastrService } from 'ngx-toastr';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { Router } from '@angular/router';
import { RequestService } from '@appDir/shared/services/request.service';
import { HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { AssignSpecialityUrlsEnum } from '../../assign-speciality-urls-enum';
import { Pagination } from '@appDir/shared/models/pagination';
import { ReplaceAccordianService } from '../replace-accordian/services/replace-accordian.service';
import { ReplaceAccordianComponent } from '../replace-accordian/replace-accordian.component';
import { AssignDoctorUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-doctor/assign-doctor-urls-enum';
import { AssignProviderMethodSlug } from '@appDir/shared/components/general.enum';
import { Subscription } from 'rxjs';
import { convertDateTimeForRetrieving, convertDateTimeForSending, convertUTCTimeToUserTimeZoneByOffset, stdTimezoneOffset, unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';
import { DoctorCalendarUrlsEnum } from '@appDir/shared/modules/doctor-calendar/doctor-calendar-urls-enum';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
@Component({
  selector: 'app-update-assignment-modal',
  templateUrl: './update-assignment-modal.component.html',
  styleUrls: ['./update-assignment-modal.component.scss']
})
export class UpdateAssignmentModalComponent extends PermissionComponent {
  myForm: FormGroup;
  public replaceObj: any = { "specId": "", "doctorMethod": "", "docId": "", "assignments": [], "selectedDoctors": [] };
  public postObjManual: any = { "specAssign": { "startDate": "", "endDate": "", "noOfDoctors": "", "id": "", "specId": "", "clinicId": "" }, "doctorMethod": "", "doctors": [{ "docId": "", "doctorName": "" }] }
  public postObjAutomatic: any = { "specAssign": { "startDate": "", "endDate": "", "noOfDoctors": "", "id": "", "specId": "", "clinicId": "" }, "doctorMethod": "" }
  public postObjNone: any = { "specAssign": { "startDate": "", "endDate": "", "noOfDoctors": "", "id": "", "specId": "", "clinicId": "" }, "doctorMethod": "" }
  public tempStartDate: any = [];
  public tempclinicName: any = [];
  public tempspecName: any = [];
  public docName: any = [];
  public isDisableSave: boolean = false;
  public tempEndDate: any = [];
  public unaviableDocList: any = []
  public isShowUnavailabiltySelectedDoc: boolean = true;
  public isShowUnavailabiltyConflictDoc: boolean = true;
  public unavaliabiltyList: any = [];
  public unavailabilityStartTime: any = [];
  public unavailabilityEndTime: any = [];
  public unavailabiltyTrack: boolean = false;
  public tempProviderIds: any = [];
  public tempConflictList: any = [];
  public searchDocList: any = [];
  public searchList: boolean = true;
  public searchBar: boolean = true;
  public isAllListHeader: boolean = true;
  public noOfDocIsLess: Boolean = true;
  public noOfDocZero: Boolean = true;
  public formatString: string = 'HH:mm';
  public interval: number = 5;
  public docDetails: any = [];
  public option: any = [];
  public ManualListDoctors: any = [];
  public AvailableListDoctors: any = [];
  public tempDoctors: any = [];
  public isShowlist: boolean = true;
  public isDocHeader: boolean = true;
  public isShowSelectedlist: boolean = true;
  public isSHowAssignedDocDetails: boolean = true;
  public speciality: any = [];
  public noOfDoc = 0;
  public specTimeSlot = 0;
  public status: boolean = true;
  public isProgressLost: boolean = false;
  public isDisable: boolean = false;
  public assignedDoc: any = [];
  public limitDoc = 1;
  public specCellAssignId: number;
  public currentEvent:any;
  public timeSubStringList: any = [];
  public startDate = new Date()
  public endDate = new Date();
  public startTime = new Date();;
  public endTime = new Date();;
  public startDateMax: Date;
  public endDateMin: Date;
  public cellSpeciality: any;
  public cellClinic: any;
  public assignClinics: any;
  public check: boolean = false;
  public isDisableSaveBtn: boolean = false;
  public allFacilitySupervisorClinicIds: any;
//   public assignDocError = false;
  public isAssignmentDeleted:boolean=false;
  public assignProviderTypes:any=[];
  public subscription:Subscription[]=[]
  public minTime :Date
	public maxTime :Date
  practice_location_ids: number;
  specTimeStart: any;
  specTimeEnd: any;
  minStartTime: any;
  maxEndTime: any;
  maxEndTimee: any;
  minStart: Date;
  maxEnd: Date;


  ngOnInit() {
    let startDate = new Date(this.subject.currentStartDate)
    let endDate = new Date(this.subject.currentStartDate)
    let user_timings=this.subject.clinic['faciltyTiming'].find(timing=>timing.facility_location_id==this.subject.clinic['id']);
    let start_time=user_timings['start_time']
		let end_time=user_timings['end_time']
    let specTimeStart: any = convertUTCTimeToUserTimeZoneByOffset(this.storageData, start_time,startDate,true);
    let specTimeEnd: any = convertUTCTimeToUserTimeZoneByOffset(this.storageData,end_time,endDate,true);
		var stDate = new Date(
			startDate.getFullYear(),
			startDate.getMonth(),
			startDate.getDate(),
			specTimeStart[0] + specTimeStart[1],
			specTimeStart[3] + specTimeStart[4],
		);
		this.minStart = stDate;
		var edDate = new Date(
			endDate.getFullYear(),
			endDate.getMonth(),
			endDate.getDate(),
			specTimeEnd[0] + specTimeEnd[1],
			specTimeEnd[3] + specTimeEnd[4],
		);
		this.maxEnd = edDate;
    this.assignClinics = [];
	  this.speciality = [];
    this.startDate = new Date(this.subject.currentStartDate)
    this.endDate = new Date(this.subject.currentEndDate)
    this.myForm.controls[('endDate')].setValue(this.endDate);
    this.myForm.controls[('startDate')].setValue(this.startDate);
    this.startTime = new Date(this.subject.currentStartDate);
    this.endTime = new Date(this.subject.currentEndDate);
    this.minTime = new Date(this.startTime.getTime() + this.interval * 1000 * 60);
		this.maxTime = new Date(this.endTime.getTime() - this.interval * 1000 * 60);
    this.endDateMin = new Date(this.startTime);
    this.allFacilitySupervisorClinicIds = this.storageData.getFacilityLocations()
    this.specTimeSlot = this.cellSpeciality.time_slot
    let practice_location=this.cellClinic.facility.qualifier+'-'+this.cellClinic.qualifier
    this.myForm.controls['clinicname'].setValue(practice_location);
    this.myForm.controls['speciality'].setValue(this.cellSpeciality.qualifier);
    this.myForm.controls['clinicname'].disable();
    this.myForm.controls['speciality'].disable();
    this.myForm.controls['startDate'].disable();
    this.myForm.controls['endDate'].disable();

    //HAMZA
    //Selecting Assign Provider By Default
    // this.selectAssignDoctorTypes({target: {checked: true}});
    //
	if(this.assignedDoc.length>0)
	{
		this.assign_provider_Control.setValue(true);
	}
	
	  this.subscription.push(this.doctor_method_slug_Control.valueChanges.subscribe(value=>{
		this.selectAssignDoctorTypes()
	})
	)
  }

  ngOnDestroy()
  {
	unSubAllPrevious(this.subscription);

  }
  constructor(aclService: AclService,
    router: Router,
    public _subjectService: SubjectService,
    private replaceAccordianService:ReplaceAccordianService,
    private customDiallogService: CustomDiallogService,
    public replaceAssignmentService: NgbModal,
    protected requestService: RequestService,
    private toastrService: ToastrService,
    private storageData: StorageData,
    public _fdService: FrontDeskService, public cdef: ChangeDetectorRef, public calendarMonthService: CalendarMonthService, public _supervisorService: SchedulerSupervisorService, public subject: SubjectService, public assignSpecialityService: AssignSpecialityService,
      public activeModal: NgbActiveModal, private formBuilder: FormBuilder) {
    super(aclService, router);
    this.createForm();
    this.assignedDoc = [];
    this.AvailableListDoctors = [];
    this.assignedDoc = this.subject.assignDoc;
    this.currentEvent=this.subject.currentEvent;
    this.noOfDoc = this.subject.numberOfDoc;
    this.myForm.controls['noOfDoctors'].setValue(this.noOfDoc);
    this.cellClinic = this.subject.clinic
    this.cellSpeciality = this.subject.spec
    this.specCellAssignId = this.subject.specAssignId;
		this.precheckForSpecialityAssignment();
		this.getAssignProviderTypes();
    this.getPracticeLocations();
  }
  /*Form intilaization function*/
  private createForm() {
    this.myForm = this.formBuilder.group({
      clinicname: ['', Validators.required],
      speciality: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      noOfDoctors: ['', Validators.required],
      assign_provider:[true,Validators.required],
      doctor_method_slug:['',Validators.required],
      search: '',
    });
  }

  getPracticeLocations()
  {
	this.requestService
	.sendRequest(
	  AssignSpecialityUrlsEnum.getUserInfobyFacility,
	  'POST',
	  REQUEST_SERVERS.schedulerApiUrl1,
	  { "facility_location_ids": this.allFacilitySupervisorClinicIds,
	   per_page: Pagination.per_page,
		  page:1,
		  pagination:true}
	).subscribe(
	  (response: HttpSuccessResponse) => {
		for (let i = 0; i < response.result.data.docs.length; i++) {
		  this.assignClinics.push(response.result.data[i]);
		}
    if(this._subjectService.clinic && this._subjectService.clinic['id'])
				{
					this.practice_location_ids = this._subjectService.clinic['id'];
				}
        this.getMinMaxTime();
	  }, error => {
	  });
  }

  getMinMaxTime() {
    const facilityArray = {
			facility_location_ids: [this.practice_location_ids],
		};
		this.requestService
			.sendRequest(
				DoctorCalendarUrlsEnum.getMaxMinTimeOfFacility,
				'POST',
				REQUEST_SERVERS.schedulerApiUrl1,
				facilityArray,
			)
			.subscribe((res:any) => {
				let minmaxtime = res.result.data;
				let start_time = minmaxtime.min_time;
				let end_time = minmaxtime.max_time;
				this.specTimeStart =convertUTCTimeToUserTimeZoneByOffset(this.storageData, start_time,this.startDate,true);
        this.specTimeEnd = convertUTCTimeToUserTimeZoneByOffset(this.storageData,end_time,this.endDate,true);
				var stDate = new Date(
					this.startDate.getFullYear(),
					this.startDate.getMonth(),
					this.startDate.getDate(),
					this.specTimeStart[0] + this.specTimeStart[1],
					this.specTimeStart[3] + this.specTimeStart[4],
				);
				let startTime = stDate;
				var edDate = new Date(
					this.endDate.getFullYear(),
					this.endDate.getMonth(),
					this.endDate.getDate(),
					this.specTimeEnd[0] + this.specTimeEnd[1],
					this.specTimeEnd[3] + this.specTimeEnd[4],
				);
				let endTime = edDate;
				this.setStartEndTimeofSpeciality(new Date(startTime),new Date(endTime))
			})
  }
  
  setStartEndTimeofSpeciality(startTime:Date,endTime:Date)
	{
		startTime.setSeconds(0);
		startTime.setMilliseconds(0);
		startTime.setDate(this.startDate.getDate());
		startTime.setMonth(this.startDate.getMonth());
		startTime.setFullYear(this.startDate.getFullYear());
		endTime.setDate(this.endDate.getDate());
		endTime.setMonth(this.endDate.getMonth());
		endTime.setFullYear(this.endDate.getFullYear());
		this.maxEndTimee = new Date(endTime.getTime());
		this.minStartTime = new Date(startTime.getTime() + this.interval * 1000 * 60);
		this.maxEndTime = new Date(endTime.getTime() - this.interval * 1000 * 60);
	}

  getAssignProviderTypes()
	{
		this.requestService
		.sendRequest(
			AssignSpecialityUrlsEnum.get_assign_provider_types,
			'GET',
			REQUEST_SERVERS.schedulerApiUrl1,
		)
		.subscribe(
			(response: HttpSuccessResponse) => {
				this.assignProviderTypes=response.result.data;

				if (this.currentEvent.current_dateList_event)
				{
				let doctor_method=this.assignProviderTypes.find(assignProvider=>assignProvider.id==this.currentEvent.current_dateList_event.doctor_method_id)
				// (<HTMLInputElement>document.getElementById('donotassign')).checked = true;
				if(doctor_method)
				{
					this.doctor_method_slug_Control.patchValue(doctor_method.slug,{onlySelf:true,emitEvent:true})
				}
				else
				{
					this.currentEvent.availableDoctors && this.currentEvent.availableDoctors.length>0?this.doctor_method_slug_Control.patchValue(AssignProviderMethodSlug.automatic_assign,{onlySelf:true,emitEvent:false}):this.doctor_method_slug_Control.patchValue(AssignProviderMethodSlug.do_not_assign,{onlySelf:true,emitEvent:false})
				}
				
				}
				
			},
			(error) => {},
		);
	}

	precheckForSpecialityAssignment()
	{
		this.requestService
		.sendRequest(
		  AssignSpecialityUrlsEnum.preChecksForSpecialityAssignmentUpdation_new,
		  'POST',
		  REQUEST_SERVERS.schedulerApiUrl1,
		  // { "id": this.specCellAssignId }
		  {
			  available_speciality_id:this.currentEvent.current_dateList_event.available_speciality_id,
			  date_list_id:this.currentEvent.current_dateList_event.id
		  }
		).subscribe(
		  (response: HttpSuccessResponse) => {
			let result: any ;
			result = response.result && response.result.data;
			this.limitDoc = result.no_of_doctors && (result.no_of_doctors > 0) ? result.no_of_doctors : null;
			if (result.start_time != null || result.end_time != null) {
			  this.startDateMax = convertDateTimeForRetrieving(this.storageData, new Date(result.start_time));
			  this.endDateMin = convertDateTimeForRetrieving(this.storageData, new Date(result.end_time));
        this.minTime = new Date(this.startDateMax.getTime() + this.specTimeSlot * 1000 * 60);
		    this.maxTime = new Date(this.endDateMin.getTime() - this.specTimeSlot * 1000 * 60);
			  this.check = true;
			}
			else {
			  this.startDateMax = null;
			  this.check = false;
			  this.endDateMin = new Date(this.startTime.getTime() + (this.specTimeSlot * 1000 * 60))
			}
		  },
		  error => {
		  });
	}


  /*Change no. doctors function*/
  public changeNoDoctors() {
    this.noOfDoc = this.myForm.get('noOfDoctors').value;

    if (this.AvailableListDoctors.length > this.noOfDoc || (this.noOfDoc < this.limitDoc && this.check === true)) {
      this.noOfDocIsLess = false;
      this.noOfDocZero = true;
      this.isDisableSave = true;
    }
    else {
      this.noOfDocIsLess = true;
      this.noOfDocZero = true;
      this.isDisableSave = false;

    }
  }

  startTimeRequired = false;
  endTimewrtStart = false;

  /*Change Start Time function*/
  public changeStartTime() {
    this.endTimewrtStart = false;
    if (this.startTime == null) {
      this.isShowlist = true;
      this.isDocHeader = true;
      this.startTimeRequired = true;
      // this.toastrService.error("Start time is required", 'Error')
      return;
    }
    if (this.startDateMax === null) {
      this.endDateMin = new Date(this.startTime.getTime() + (this.specTimeSlot * 1000 * 60))
    }
    if (this.startDateMax != undefined && this.startTime != null) {
      this.startTime = new Date(this.startTime);
      var showStartTime = formatDate(this.startTime, 'HH:mm:ss', 'en-US', '');
      var showLimitStartTime = formatDate(this.startDateMax, 'HH:mm:ss', 'en-US', '');
      if (showStartTime > showLimitStartTime) {
        this.toastrService.error("Already appointed on this time", 'Error')
        return;
      }
    }
    if (this.startTime != null) {
      this.startTimeRequired = false;
      if (this.startTime.getTime() >= this.endTime.getTime()) {
        this.endTimewrtStart = true;
        this.toastrService.error("Pick end Time with respect to start", 'Error')
        return;
      }
      this.startDate.setHours(this.startTime.getHours());
      this.startDate.setMinutes(this.startTime.getMinutes())
      this.startTime.setDate(this.startDate.getDate());
      this.endTime.setDate(this.endDate.getDate());
      this.startTime.setMonth(this.startDate.getMonth());
      this.endTime.setMonth(this.endDate.getMonth());
      this.startTime.setFullYear(this.startDate.getFullYear());
      this.endTime.setFullYear(this.endDate.getFullYear());
    //   if ((<HTMLInputElement>document.getElementById('manualassign')).checked === true) {
		if (this.doctor_method_slug_Control.value === AssignProviderMethodSlug.manual_assign) {
        this.isShowSelectedlist = true;
        this.isShowlist = true;
        this.isDocHeader = true;
        this.isSHowAssignedDocDetails = true;
        this.isShowUnavailabiltyConflictDoc = true;
        this.isShowUnavailabiltySelectedDoc = true;
        this.tempDoctors = [];
        this.searchDocList = [];
        this.AvailableListDoctors = [];
        this.isAllListHeader = true;
        this.searchBar = true;
        this.isShowSelectedlist = true;
        this.isSHowAssignedDocDetails = true;
        this.ManualListDoctors = [];
        this.manualDoc();
      }
    }

  }

  endTimeRequired = false;

  public onChangeStartDate(event)
	{
		if(event.dateValue)
		{
			this.myForm.get('startDate').patchValue(new Date(event.dateValue))
		 
		} 
		else
		{
			this.myForm.get('startDate').patchValue(null)

		}
	}

  public changeEndTime() {
    this.endTimewrtStart = false;
    if (this.endDateMin != undefined && this.endTime != null) {
      var showLimitEndTime = formatDate(this.endDateMin, 'HH:mm:ss', 'en-US', '');
      var showEndTime = formatDate(this.endTime, 'HH:mm:ss', 'en-US', '');
      if (showEndTime < showLimitEndTime) {
        this.toastrService.error("Already appointed on this time", 'Error')
        return;
      }
    }
    if (this.endTime != null) {
      this.endTimeRequired = false;
      if (this.endTime.getTime() <= this.startTime.getTime()) {
        this.endTimewrtStart = true;
        this.toastrService.error("Pick end Time with respect to start", 'Error')
        return;
      }
      this.endDate.setHours(this.endTime.getHours());
      this.endDate.setMinutes(this.endTime.getMinutes())
      this.startDate.setHours(this.startTime.getHours());
      this.startDate.setMinutes(this.startTime.getMinutes())
      this.startTime.setDate(this.startDate.getDate());
      this.endTime.setDate(this.endDate.getDate());
      this.startTime.setMonth(this.startDate.getMonth());
      this.endTime.setMonth(this.endDate.getMonth());
      this.startTime.setFullYear(this.startDate.getFullYear());
      this.endTime.setFullYear(this.endDate.getFullYear());
    //   if ((<HTMLInputElement>document.getElementById('manualassign')).checked === true) {
		if(this.doctor_method_slug_Control.value === AssignProviderMethodSlug.manual_assign){
        this.isShowSelectedlist = true;
        this.isShowlist = true;
        this.isDocHeader = true;
        this.isSHowAssignedDocDetails = true;
        this.isShowUnavailabiltyConflictDoc = true;
        this.isShowUnavailabiltySelectedDoc = true;
        this.tempDoctors = [];
        this.searchDocList = [];
        this.AvailableListDoctors = [];
        this.isAllListHeader = true;
        this.searchBar = true;
        this.isShowSelectedlist = true;
        this.isSHowAssignedDocDetails = true;
        this.ManualListDoctors = [];
        this.manualDoc();
      }
    }
    else {
      this.isShowlist = true;
      this.isDocHeader = true;
      this.endTimeRequired = true;

      // this.toastrService.error("End time is mandatory", 'Error')
      // this.coolDialogs.alert("End time is mandatory");
      return;
    }
  }
  /*Choose assign doctors(i.e do not assign,automatic,manual) options function*/
  public selectAssignDoctorTypes() {
    // if ((<HTMLInputElement>document.getElementById('manualassign')).checked === true) {
		if (this.doctor_method_slug_Control.value === AssignProviderMethodSlug.manual_assign) {
    //   if (event.target.checked) {
		// this.assignDocError=false;
        this.resetAssignDocNo();
		this.manualDoc();
        // if (this.ManualListDoctors.length != 0 && this.AvailableListDoctors.length === 0 || this.docDetails.length === 0) {
        //   if (this.searchDocList.length != 0) {
        //     this.searchList = false;
        //     this.isShowlist = true;
        //   }
        //   else {
        //     this.searchList = true;
        //     this.isShowlist = false;
        //   }
        //   if (this.AvailableListDoctors.length === 0) {
        //     this.isShowSelectedlist = true;
        //   }
        //   else {
        //     this.isShowSelectedlist = false;
        //   }
        //   if (this.docDetails.length === 0) {
        //     this.isSHowAssignedDocDetails = true
        //     this.isShowUnavailabiltySelectedDoc = true;
        //   }
        //   else {
        //     this.isSHowAssignedDocDetails = true;
        //     this.isShowUnavailabiltySelectedDoc = true;
        //   }
        // }
        // else {
        //   this.resetAssignDocNo()
        // }
    //   }
    //   else {
    //     this.searchList = true;
    //     this.resetAssignDocYes()
    //   }
    }
	else if(this.doctor_method_slug_Control.value === AssignProviderMethodSlug.automatic_assign)
	{
		this.automaticDoc();
	}
    else {
    //   if (event.target.checked) {
	// 	// this.assignDocError=false;
    //   }
    //   else {
		// this.assignDocError=true;
		// this.isAssignDocClick = true;
		this.doNotAssignDoc();
        this.resetAssignDocYes()
    //   }
    }
    this.status = true;
  }
  /*Do not assign function*/
  public doNotAssignDoc() {
    this.status = true
    if (this.ManualListDoctors.length != 0 && this.isProgressLost === true) {

this.customDiallogService.confirm('Update','You will lose all your progress','Yes','No')
		.then((confirmed) => {
			if (confirmed){
        this.isProgressLost = false;
        this.searchBar = true;
        this.isShowlist = true;
        this.isDocHeader = true;
        this.isShowSelectedlist = true;
        this.isSHowAssignedDocDetails = true;
        this.isShowUnavailabiltySelectedDoc = true;
        this.isShowUnavailabiltyConflictDoc = true;
        this.isShowUnavailabiltySelectedDoc = true;
			}else if(confirmed === false){
        this.isProgressLost = true;
        this.doctor_method_slug_Control.setValue(AssignProviderMethodSlug.manual_assign);
			}else{
			}
		})
		.catch();
    }
  }
  /*Automatic assign function*/
  public automaticDoc() {
    this.status = true;
    if (this.ManualListDoctors.length != 0 && this.isProgressLost === true) {

this.customDiallogService.confirm('Update','You will lose all your progress','Yes','No')
		.then((confirmed) => {
			if (confirmed){
        this.searchBar = true;
        this.isShowlist = true;
        this.isDocHeader = true;
        this.isShowSelectedlist = true;
        this.isSHowAssignedDocDetails = true;
        this.isAllListHeader = true;
        this.isProgressLost = false;
        this.isShowUnavailabiltySelectedDoc = true;
        this.isShowUnavailabiltyConflictDoc = true;
        this.isShowUnavailabiltySelectedDoc = true;

			}else if(confirmed === false){
        this.isProgressLost = true;
			}else{
			}
		})
		.catch();
    }
  }
  /*Manual assign function*/
  public manualDoc() {
    if (this.startTime === null) {
      this.toastrService.error('Start time is required ', 'Error')
      return;
    }
    if (this.endTime === null) {
      this.toastrService.error('"End time is mandatory ', 'Error')
      return;
    }
    this.startDate.setHours(this.startTime.getHours());
    this.startDate.setMinutes(this.startTime.getMinutes());
    this.isProgressLost = true;
    this.startDate = new Date(this.startDate);
    this.isShowlist = true;
    this.isDocHeader = true;
    this.searchBar = true;
    this.isShowUnavailabiltySelectedDoc = true;
    this.isShowUnavailabiltyConflictDoc = true;
    this.endDate.setHours(this.endTime.getHours());
    this.endDate.setMinutes(this.endTime.getMinutes());
    let startDate = convertDateTimeForSending(this.storageData, new Date(this.startDate));
    let endDate = convertDateTimeForSending(this.storageData, new Date(this.endDate));
    let spec = this.cellSpeciality.id;
    let facilityId = this.cellClinic.id;
	// let obj = { "facility": facilityId, "spec": spec, "startDate": startDate, "endDate": endDate };
	let obj = {
		facility_location_id: facilityId,
		speciality_id: spec,
		start_date: startDate,
		end_date: endDate,
	};
    this.requestService
      .sendRequest(
        AssignSpecialityUrlsEnum.getManualDoctorsList,
        'POST',
        REQUEST_SERVERS.schedulerApiUrl1,
        obj
      ).subscribe(
        (response: HttpSuccessResponse) => {
          this.status = true;
          for (var i = 0; i < response.result.data.length; i++) {
            if (response.result.data[i].assignments.length != 0) {
              response.result.data[i]['isAssigned'] = true;
            }
            else {
              response.result.data[i]['isAssigned'] = false;
            }
          }
		  this.ManualListDoctors = response.result.data;
		  
          this.tempDoctors = [];
          this.searchDocList = [];
          this.AvailableListDoctors = [];
          for (var i = 0; i < this.ManualListDoctors.length; i++) {
            if (this.ManualListDoctors[i].isAssigned === true) {
              for (var j = 0; j < this.ManualListDoctors[i].assignments.length; j++) {
                if (this.ManualListDoctors[i].assignments[j].facility_id === this.cellClinic.facility_id) {//facility_id equal to id or facility_id of cellClinic
                  if (this.ManualListDoctors[i].assignments.length === 1) {
					// if (this.ManualListDoctors[i].assignments[j].doctor_id!=this.ManualListDoctors[i].user_id)
					// {
                    // this.ManualListDoctors[i].isAssigned = false; by adil
                    this.ManualListDoctors[i]["isColor"] = false;
                    if (this.ManualListDoctors[i].unavailabilityTime.length === 0) {
                      for (var x = 0; x < this.subject.assignDoctorData.length; x++) {
                        if ((this.subject.assignDoctorData[x].length != 0) && (this.subject.assignDoctorData[x].doctor_id == this.ManualListDoctors[i].assignments[j].doctor_id)) {
                        //   this.AvailableListDoctors.push(this.ManualListDoctors[i]);
                        //   this.ManualListDoctors[i].assignments.pop();
                          break;
                        }
                      }
                    }
                    break;
                  }
                  else if (this.ManualListDoctors[i].assignments.length > 1) {
                    this.ManualListDoctors[i].assignments.splice(j, 1);
                    break;
                  }
                }
              }
            }
          }
          if (this.AvailableListDoctors.length > 0) {
            this.isShowSelectedlist = false;
          }
          else {
            this.isShowSelectedlist = true;
          }
          this.isAllListHeader = false;
          this.searchBar = false;
          this.isSHowAssignedDocDetails = true;
          if (this.ManualListDoctors.length === 0) {
            this.isShowlist = true;
            this.isDocHeader = true;
          }
          else {
            this.isShowlist = false;
            this.isDocHeader = false;
		  }
		  this.ManualListDoctors = this.ManualListDoctors.filter(manualDoc=>{

			let filterdata= this.subject.assignDoctorData.find(assignDoctor=>{
				return (manualDoc.doctor_id==assignDoctor.doctor_id)
			})
			return filterdata? manualDoc.doctor_id!=filterdata.doctor_id:true;
			  
			
			}); // to filter doctor which have not been  assigned.
        //   this.subject.assignDoctorData = [];
        }, error => {
        });
  }
  /*Search doctor function*/
  public searchDocByName(event) {
    if (event.target.value == '' || event.target.value == undefined) {
      this.isShowlist = false;
      this.isDocHeader = false;
      this.isAllListHeader = false;
      this.searchList = true;
      this.searchBar = false;
      this.searchDocList = [];
      return
    }
    this.searchList = false;
    this.isShowlist = true;
    this.isDocHeader = false;
    this.isAllListHeader = false;
    this.searchBar = false;
    this.searchDocList = this.ManualListDoctors.filter((element) => {
      if (element.middle_name == undefined || element.middle_name == null) {
        element.middle_name = ""
      }
      return element && element.first_name && element.first_name.toLowerCase().includes(event.target.value.toLowerCase()) ||
       element &&  element.middle_name &&  element.middle_name.toLowerCase().includes(event.target.value.toLowerCase()) ||
       element &&  element.last_name &&  element.last_name.toLowerCase().includes(event.target.value.toLowerCase())
    });
  }

  //Dialog for selected doc
  // public selectDocDialog(event,doc){
  //   console.log("selected docs: ", this.AvailableListDoctors.length , this.myForm.get('noOfDoctors').value,  this.AvailableListDoctors , "sub:", this.myForm.get('noOfDoctors').value - (this.AvailableListDoctors.length) - this.assignedDoc.length)
  //   //this.selectDoc(event,doc)

  //   //assignedDoc -> Assigned providers, AvailableListDoctors -> selected docs
  //   if(this.assignedDoc.length > 0 && (this.myForm.get('noOfDoctors').value - (this.AvailableListDoctors.length) - this.assignedDoc.length) <= 0) {

  //   // if(this.assignedDoc.length > 0 && this.myForm.get('noOfDoctors').value - (this.AvailableListDoctors.length+1) <= 0) {

  //     this.coolDialogs.confirm('Do you want to delete the previous selected provider?',{
  //       okButtonText: 'Yes',
  //       cancelButtonText: 'No',
  //     })
  //     .subscribe(res => { 
  //       console.log("DIALOG DOC",res);
  //       if (res) {// if okay
  //         this.selectDoc(event, doc)
  //       }
  //       else{ //if cancel
          
  //       }
  //     });
  //   }
  //   else{
  //     this.selectDoc(event, doc)
  //   }

  // }


  /*Doctor selection function*/
  public selectDoc(event, doc) {
    let value = this.myForm.get('noOfDoctors').value;
    this.unavailabilityStartTime = [];
    this.unavailabilityEndTime = [];
    if (value != 0) {
      if (doc.unavailability === 'full') {
        let showStartDate;
        let showEndDate;
        for (var i = 0; i < doc.unavailabilityTime.length; i++) {
          showStartDate = formatDate(doc.unavailabilityTime[i].start_date, 'yyyy/MM/dd HH:mm', 'en-US', '');
          showEndDate = formatDate(doc.unavailabilityTime[i].end_date, 'yyyy/MM/dd HH:mm', 'en-US', '');
        }
        this.toastrService.error("Provider  is on full leave " + showStartDate + " to " + showEndDate + " select other Provider ", 'Error')
      }
      else if (doc.unavailability === 'none' || doc.unavailability === 'partial') {
        if (this.AvailableListDoctors.length < this.noOfDoc) {
          if (doc.isAssigned) {
            this.isShowUnavailabiltySelectedDoc = true;
            this.docDetails = [];
            this.docName = [];
            this.tempStartDate = [];
            this.tempEndDate = [];
            this.tempConflictList = [];
            this.isSHowAssignedDocDetails = false;
            this.docName.push([doc.assignments, doc.user_id]);
            this.tempConflictList.push(doc.assignments);
            if (doc.unavailabilityTime.length > 0) {
              this.unavailabiltyTrack = true;
              this.unavaliabiltyList = [];
              this.unavaliabiltyList.push(doc.unavailabilityTime);
              this.unaviableDocList.push(doc);
              for (var i = 0; i < this.unavaliabiltyList[0].length; i++) {
                var startTime = new Date(this.unavaliabiltyList[0][i].start_date)
                var endTime = new Date(this.unavaliabiltyList[0][i].end_date);
                if (startTime.getTime() >= this.startDate.getTime()) {
                  startTime = startTime;
                }
                else if (this.startDate.getTime() >= startTime.getTime()) {
                  startTime = this.startDate;
                }
                if (endTime.getTime() <= this.endDate.getTime()) {
                  endTime = endTime;
                }
                else if (this.endDate.getTime() <= endTime.getTime()) {
                  endTime = this.endDate;
                }
                this.formatTimeAMPM(startTime, endTime)
                this.unavailabilityStartTime.push(this.timeSubStringList[0]);
                this.unavailabilityEndTime.push(this.timeSubStringList[1]);
                this.unavaliabiltyList = Array.from(new Set(this.unavaliabiltyList));
              }
            }
            this.tempConflictList = Array.from(new Set(this.tempConflictList));
            this.docDetails = this.tempConflictList[0];
            if ( this.docDetails.length>0 && this.docDetails[0].is_facility_supervisor == 0) {
              this.toastrService.error('You cant access this Provider  on this clinic', 'Error')
              this.isSHowAssignedDocDetails = true;
              return;
			}
			// else
			// {
			// 	this.isSHowAssignedDocDetails=true
			// }
            for (var i = 0; i < this.docDetails.length; i++) {
            //   if (this.docDetails[i].facilityColor.includes('#')) { }
            //   else {
            //     this.docDetails[i].facilityColor = "#" + this.docDetails[i].facilityColor;;
            //   }
              this.formatTimeAMPM(new Date(this.docDetails[i].start_date), new Date(this.docDetails[i].end_date))
              this.tempStartDate.push(this.timeSubStringList[0]);
              this.tempEndDate.push(this.timeSubStringList[1]);
            }
          }
          else {
            let a = this.AvailableListDoctors.filter((element) => {
              return element.user_id == doc.user_id
            });
            if (a.length != 0) {
              this.toastrService.error('Provider  is already selected', 'Error')
            }
            else {
              if (doc.unavailabilityTime.length > 0) {
                this.isShowUnavailabiltyConflictDoc = true;
                this.unavaliabiltyList = [];
                this.unaviableDocList = [];
                this.AvailableListDoctors = [];
                this.isShowUnavailabiltySelectedDoc = false;
                this.isShowSelectedlist = true;
                this.unaviableDocList.push(doc);
                this.unavaliabiltyList.push(doc.unavailabilityTime);
                for (var i = 0; i < this.unavaliabiltyList[0].length; i++) {
                  var startTime = new Date(this.unavaliabiltyList[0][i].start_date)
                  var endTime = new Date(this.unavaliabiltyList[0][i].end_date);
                  if (startTime.getTime() >= this.startDate.getTime()) {
                    startTime = startTime;
                  }
                  else if (this.startDate.getTime() >= startTime.getTime()) {
                    startTime = this.startDate;
                  }
                  if (endTime.getTime() <= this.endDate.getTime()) {
                    endTime = endTime;
                  }
                  else if (this.endDate.getTime() <= endTime.getTime()) {
                    endTime = this.endDate;
                  }
                  this.formatTimeAMPM(startTime, endTime)
                  this.unavailabilityStartTime.push(this.timeSubStringList[0]);
                  this.unavailabilityEndTime.push(this.timeSubStringList[1]);
                  this.unavaliabiltyList = Array.from(new Set(this.unavaliabiltyList));
                }
              }
              else {
                this.isShowUnavailabiltySelectedDoc = true;
                this.AvailableListDoctors.push(doc);
                this.AvailableListDoctors = Array.from(new Set(this.AvailableListDoctors));
                this.isShowSelectedlist = false;
              }
            }
            this.isSHowAssignedDocDetails = true;
            this.noOfDocZero = true;
          }
        }
        else if (this.AvailableListDoctors.length === this.noOfDoc) {
		//   this.toastrService.error('Please enter more number of Provider for selection', 'Error')
		this.toastrService.error('Select providers with respect to number of providers', 'Error')
        }
      }
    }
    else {
      this.noOfDocZero = false;
    }
  }

  replace(selectedProvider:any)
	{
		this.replaceAccordianService.deleteSelectedAppointmentIds=[];
		this.replaceAccordianService.Practice_location=this.myForm.get('clinicname').value;
		this.replaceAccordianService.speciality_name=this.myForm.get('speciality').value;
		this.replaceAccordianService.conflictedProviderAssignment=selectedProvider;
		this.requestService
			  .sendRequest(
				AssignSpecialityUrlsEnum.getProviderSpecificAppointment,
				'POST',
				REQUEST_SERVERS.schedulerApiUrl1,
				{
				  available_doctor_id:this.replaceAccordianService.conflictedProviderAssignment.id,
				  start_date:convertDateTimeForSending(this.storageData,new Date(this.replaceAccordianService.conflictedProviderAssignment.start_date)),
				  end_date:convertDateTimeForSending(this.storageData,new Date(this.replaceAccordianService.conflictedProviderAssignment.end_date))
				}
			  ).subscribe(
				(response: HttpSuccessResponse) => {
					let data=response.result.data;

					if(data && data.length>0)
					{
						const activeModal = this.replaceAssignmentService.open(ReplaceAccordianComponent, {
							size: 'lg',
							backdrop: 'static',
							keyboard: false,
						});
						activeModal.result.then((is_assignment_deleted) => {
							if(is_assignment_deleted)
							{
								this.removeConflictedAssignment(selectedProvider)
							}
							this.isAssignmentDeleted=is_assignment_deleted;
						});
					}

					else
					{
            this.customDiallogService.confirm('Are you sure?','You want to delete the assignment?','Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
        let  req={
          date_list_id:this.replaceAccordianService.conflictedProviderAssignment.date_list_id,
          available_doctor_id:this.replaceAccordianService.conflictedProviderAssignment.id
          }	  
        this.requestService
        .sendRequest(
          AssignDoctorUrlsEnum.deleteDoctorAssignment,
          'Delete',
          REQUEST_SERVERS.schedulerApiUrl1,
          req
        ).subscribe(
          (result: HttpSuccessResponse) => {
          this.toastrService.success("Assignment Deleted Successfully", 'Success');
        this.removeConflictedAssignment(selectedProvider)
      
        this.isAssignmentDeleted=true;

          }, error => {
            this.toastrService.success(error.message, 'Error')
          });	
				
			}else if(confirmed === false){
				
			}else{
				
			}
		})
		.catch();

					}	  
				
				}, error => {
					this.toastrService.success(error.message, 'Error')
			
				}
			  )
		// const activeModal = this.replaceAssignmentService.open(ReplaceAccordianComponent, {
		// 	size: 'lg',
		// 	backdrop: 'static',
		// 	keyboard: false,
		// });
		// activeModal.result.then((is_assignment_deleted) => {
		// 	if(is_assignment_deleted)
		// 	{
		// 		this.removeConflictedAssignment(selectedProvider);
				
		// 	}
		// 	this.isAssignmentDeleted=is_assignment_deleted;
		// 	console.log('checking');
		// });
	}

	removeConflictedAssignment(selectedProvider:any)
	{
		// let currentelement=this.ManualListDoctors.find(element=>element.user_id==selectedProvider.doctor_id).assignments.filter(assign=>{return assign.date_list_id!=selectedProvider.date_list_id &&assign.id==selectedProvider.id })
		this.assignedDoc=this.assignedDoc.filter(assigndoc=>{return assigndoc.current_dateList_event.id!=selectedProvider.date_list_id});
		this.subject.assignDoctorData=this.subject.assignDoctorData.filter(assigndoc=>{return assigndoc.current_dateList_event.id!=selectedProvider.date_list_id});
		// this.AvailableListDoctors.splice(this.AvailableListDoctors.indexOf(selectdoc), 1);
		let currentelement=this.ManualListDoctors.find(element=>element.user_id==selectedProvider.doctor_id);
		if(currentelement)
		{
			currentelement.assignments=currentelement.assignments.filter(assign=>{return assign.date_list_id!=selectedProvider.date_list_id &&assign.id==selectedProvider.id })
			if(currentelement.assignments && currentelement.assignments.length==0)
			{
				currentelement.isAssigned=false;
				this.docDetails=this.docDetails.filter(element=>{ return (element.date_list_id!=selectedProvider.date_list_id && element.id!=selectedProvider.id)})
			if(this.docDetails.length==0)
			{
				this.isSHowAssignedDocDetails=true;
			}
			}
		}
		
	}
  /*Unselect doctor function*/
  public removeSelectedDoc(event, selectdoc) {
    this.AvailableListDoctors.splice(this.AvailableListDoctors.indexOf(selectdoc), 1);
    if (this.AvailableListDoctors.length === 0) {
      this.isShowSelectedlist = true;
    }
    if (this.AvailableListDoctors.length <= this.noOfDoc) {
      this.noOfDocIsLess = true;
      this.noOfDocZero = true;
      this.isDisableSave = false;
    }
    else {
      this.noOfDocIsLess = false;
      this.noOfDocZero = false;
      this.isDisableSave = true;
    }
  }
  /*Remove doctor conflict without finding replacement function*/
  public isAssignedForce() {
    this.status = true;

    this.customDiallogService.confirm('Remove','Do you want to remove provider from existing assignment?','Yes','No')
		.then((confirmed) => {
			if (confirmed){
        this.replaceObj.assignments = [];
        this.replaceObj.selectedDoctors = []
        this.replaceObj.specId = this.cellSpeciality.id;
        this.replaceObj.docId = this.docName[0][1];
        for (var i = 0; i < this.docName[0][0].length; i++) {
          this.replaceObj.assignments.push(this.docName[0][0][i].id);
        }
        for (var i = 0; i < this.AvailableListDoctors.length; i++) {
          this.replaceObj.selectedDoctors.push(this.AvailableListDoctors[i].user_id);
        }
        if ((<HTMLInputElement>document.getElementById('automaticSys')).checked === true) {
          this.replaceObj.doctorMethod = "automatic";
 
        }
        else {
          this.replaceObj.doctorMethod = "none";
     
        }
        
			}else if(confirmed === false){
			}else{
			}
		})
		.catch();

  }
  /*Remove doctor conflict and find replacement function*/
  public isAssignedAnyway() {
    for (var i = 0; i < this.ManualListDoctors.length; i++) {
    //   if (this.unaviableDocList[0].id == this.ManualListDoctors[i].id) {
		if (this.unaviableDocList[0].user_id == this.ManualListDoctors[i].user_id) {

        this.ManualListDoctors[i].unavailabilityTime = [];
        break;
      }
    }
    for (var i = 0; i < this.unaviableDocList.length; i++) {
      this.AvailableListDoctors.push(this.unaviableDocList[i]);
      this.unavaliabiltyList.pop();
      this.AvailableListDoctors = Array.from(new Set(this.AvailableListDoctors));
    }
    for (var i = 0; i < this.unaviableDocList.length; i++) {
      for (var j = 0; j < this.ManualListDoctors.length; j++) {
        // if (this.ManualListDoctors[j].unavailability === 'partial' && this.ManualListDoctors[j].id === this.unaviableDocList[i].id) {
			if (this.ManualListDoctors[j].unavailability === 'partial' && this.ManualListDoctors[j].user_id === this.unaviableDocList[i].user_id) {
          this.ManualListDoctors[j].unavailability = 'none'
        }
      }
    }
    this.isShowUnavailabiltySelectedDoc = true;
    this.isShowUnavailabiltyConflictDoc = true;
    this.isShowSelectedlist = false;
  }
  public resetAssignDocNo() {
    this.isAllListHeader = false;
    this.searchBar = false;
    this.isShowlist = false;
    this.isShowSelectedlist = false;
    this.isDocHeader = false;
  }
  public resetAssignDocYes() {
    this.searchBar = true;
    this.isShowlist = true;
    this.isDocHeader = true;
    this.isShowSelectedlist = true;
    this.isSHowAssignedDocDetails = true;
    this.isAllListHeader = true;
    this.searchBar = true;
  }
  /*time to 12 hour format convertion function*/
  public formatTimeAMPM(startTime, endTime) {
    var tempstarthour;
    var tempstartmin;
    var tempendhour;
    var tempendmin;
    tempstarthour = startTime.getHours();
    var tempstartmin = startTime.getMinutes();
    var startDateAMPM = tempstarthour >= 12 ? 'PM' : 'AM';
    tempstarthour = tempstarthour % 12;
    tempstarthour = tempstarthour ? tempstarthour : 12;
    tempstartmin = tempstartmin < 10 ? '0' + tempstartmin : tempstartmin;

    tempendhour = endTime.getHours();
    var tempendmin = endTime.getMinutes();
    var endDateAMPM = tempendhour >= 12 ? 'PM' : 'AM';
    tempendhour = tempendhour % 12;
    tempendhour = tempendhour ? tempendhour : 12;
    tempendmin = tempendmin < 10 ? '0' + tempendmin : tempendmin;

    let x = tempstarthour + ":" + tempstartmin + ' ' + startDateAMPM;
    let y = tempendhour + ":" + tempendmin + ' ' + endDateAMPM;
    this.timeSubStringList[0] = x;
    this.timeSubStringList[1] = y;
  }
  /*Form submitation function*/
  public submitFormAndOpen() {
	 this.isDisableSaveBtn = true;
	  let doctor_method_id=this.assignProviderTypes.find(assignProvider=>assignProvider.slug==this.doctor_method_slug_Control.value ).id

    if (this.myForm.invalid) {
		this.isDisableSaveBtn = false;
      return;
    }
    if (this.noOfDoc === 0) {
	  this.toastrService.error("Kindly select atleast one Provider ", 'Error');
	  this.isDisableSaveBtn = false;
      return;
    }
    if ((this.noOfDoc > this.limitDoc)&& this.limitDoc!=null ) {
	  this.toastrService.error("Enter " + this.limitDoc + " number of Provider ", 'Error');
	  this.isDisableSaveBtn = false;
      return;
    }
    if (this.isDisableSave) {
		this.isDisableSaveBtn = false;
      return;
    }
    if (this.startTime === null) {
	  this.toastrService.error("Start time is required", 'Error');
	  this.isDisableSaveBtn = false;
      return;
    }
    if (this.endTime === null) {
	  this.toastrService.error("End time is mandatory", 'Error');
	  this.isDisableSaveBtn = false;
      return;
    }
    if (this.endTime.getTime() < this.endDateMin.getTime()) {
	  this.toastrService.error("Pick end Time with respect to start", 'Error');
	  this.isDisableSaveBtn = false;
      return;
    }
    if (this.startDateMax != null && this.startTime.getTime() > this.startDateMax.getTime()) {
	  this.toastrService.error("Appointed is already booked with this starttime", 'Error');
	  this.isDisableSaveBtn = false;
      return;
    }
    if (this.endDateMin != null && this.endTime.getTime() < this.endDateMin.getTime()) {
	  this.toastrService.error("Appointed is already booked with this endtime", 'Error');
	  this.isDisableSaveBtn = false;
      return;
	}
	let method_type :any; 

    this.startDate.setHours(this.startTime.getHours());
    this.startDate.setMinutes(this.startTime.getMinutes())
    let startDate = convertDateTimeForSending(this.storageData, new Date(this.startDate));
    let endDate = convertDateTimeForSending(this.storageData, new Date(this.endDate));
    // if ((<HTMLInputElement>document.getElementById('manualassign')).checked === true) {
		if (this.doctor_method_slug_Control.value === AssignProviderMethodSlug.manual_assign) {
		let selectedDoctor=this.AvailableListDoctors.length+(this.subject.assignDoctorData?this.subject.assignDoctorData.length:0)
      if (selectedDoctor > this.noOfDoc ) {
		this.toastrService.error("Selected providers should be equal to no of providers ", 'Error');
		this.isDisableSaveBtn = false;
        return;
	  }
	  this.tempProviderIds=[]
	  if(this.AvailableListDoctors.length>0)
	  {
		for (var i = 0; i < this.AvailableListDoctors.length; i++) {
			// this.temp[i] = {
			//   docId: this.AvailableListDoctors[i].user_id,
			//   doctorName: this.AvailableListDoctors[i].last_name
			// }
			this.tempProviderIds.push(this.AvailableListDoctors[i].user_id)
		  }
	  }
	  if(this.subject.assignDoctorData && this.subject.assignDoctorData.length>0)
	  {
		for (var i = 0; i < this.subject.assignDoctorData.length; i++) {
			this.tempProviderIds.push(this.subject.assignDoctorData[i].doctor_id)
		}
	  }
      this.postObjManual.doctors = this.tempProviderIds;
	  method_type = "manual";
      if (this.AvailableListDoctors.length === 0 &&this.subject.assignDoctorData && this.subject.assignDoctorData.length==0 ) {
        this.toastrService.error("Error! Please select atleast one provider before submission in manual assign", 'Error')
		this.isDisableSaveBtn = false;
		return;
      }
    
    }
		else if(this.doctor_method_slug_Control.value === AssignProviderMethodSlug.automatic_assign)
		{

	  this.postObjAutomatic.doctor_method_id=doctor_method_id
	  method_type = "automatic";
    }
    else if (
		this.doctor_method_slug_Control.value==AssignProviderMethodSlug.do_not_assign
		) {
	  method_type = "none";
	}
	
	let assignSpec = {
		date_list_id: this.currentEvent.current_dateList_event.id,
        facility_location_id: this.cellClinic.id,
        no_of_doctors: parseInt(this.myForm.get('noOfDoctors').value),
        speciality_id: this.currentEvent.speciality_id,
        start_date:startDate,
        end_date:  endDate  ,
        id: this.specCellAssignId
	  };

	  let doctorDateListIds=(this.assignedDoc && this.assignedDoc.length>0)?this.assignedDoc.map(assigndoc=>{
		return assigndoc.current_dateList_event.id
	  }):[]
	  let params = {
		doctor_method:  method_type ,
		doctor_method_id:doctor_method_id,
		doctor_date_list_ids:doctorDateListIds,
		available_speciality: assignSpec,
		time_zone: stdTimezoneOffset()
	  };
	  if(method_type=="manual")
	  {
		params['doctors']=this.tempProviderIds
	  }

	        this.postObjNone.timeZone = stdTimezoneOffset();
      this.requestService
        .sendRequest(
          AssignSpecialityUrlsEnum.updateAvailableSpeciality,
          'PUT',
          REQUEST_SERVERS.schedulerApiUrl1,
          params
        ).subscribe(
          (resp: HttpSuccessResponse) => {
			this.isDisableSaveBtn = false;
            let data: any = [];
            data = resp.result.data
            this.calendarMonthService.result = data
            this.toastrService.success('Successfully Updated ', 'Success')
            this.subject.refreshUpdate("update")
            this.activeModal.close();
          }, error => {
			this.isDisableSaveBtn = false;
            // this.activeModal.close();
          });
  }

  Cancel()
  {
	  if(this.isAssignmentDeleted)
	  {
		this.subject.refreshUpdate("update")

	  }
	this.activeModal.close(); 
  }

  get doctor_method_slug_Control() {
	return this.myForm.get('doctor_method_slug');
}
get start_time_Control() {
	return this.myForm.get('start_time');
}
get end_time_Control() {
	return this.myForm.get('end_time');
}
get start_date_Control() {
	return this.myForm.get('start_date');
}
get assign_provider_Control() {
	return this.myForm.get('assign_provider');
}
get recurrence_control() {
	return this.myForm.get('recurrence');
}
get range_recurrance_control() {
	return this.myForm.get('range_recurrance');
}
get range_recurrance_option_control() {
	return this.myForm.get('range_recurrance_option');
}


}


