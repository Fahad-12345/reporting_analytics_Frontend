import { formatDate } from '@angular/common';
import {
	ChangeDetectorRef,
	Component,
	forwardRef,
	ViewChild,
} from '@angular/core';
import {
	FormBuilder,
	FormGroup,
	Validators,
} from '@angular/forms';
import { Router, Event } from '@angular/router';

import { ToastrService } from 'ngx-toastr';

import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import {
	HttpSuccessResponse,
	StorageData,
} from '@appDir/pages/content-pages/login/user.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { AclService } from '@appDir/shared/services/acl.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { FrontDeskService } from '../../../../front-desk.service';
import { SchedulerSupervisorService } from '../../../../scheduler-supervisor.service';
import { AssignSpecialityUrlsEnum } from '../../assign-speciality-urls-enum';
import { AssignSpecialityService } from '../../assign-speciality.service';
import { HomeComponent } from '../../components/home/home.component';
import { SubjectService } from '../../subject.service';
import {
	CalendarMonthService,
} from '../../utils/my-calendar/src/modules/month/calendar-month.service';
import {  AssignDoctorUrlsEnum, RecurrenceRepeatOptionEnum } from '@appDir/scheduler-front-desk/modules/assign-doctor/assign-doctor-urls-enum';
import { Pagination } from '@appDir/shared/models/pagination';
import { ReplaceAccordianComponent } from '../replace-accordian/replace-accordian.component';
import { ReplaceAccordianService } from '../replace-accordian/services/replace-accordian.service';
import { AssignProviderMethodSlug, RangeRecurrenceOption } from '@appDir/shared/components/general.enum';
import { convertDateTimeForSending, convertUTCTimeToUserTimeZoneByOffset, changeDateFormat, stdTimezoneOffset,checkSelectedLocationsForInactive } from '@appDir/shared/utils/utils.helpers';
import { WithoutTime } from '@appDir/shared/utils/utils.helpers';
import { DoctorCalendarUrlsEnum } from '@appDir/shared/modules/doctor-calendar/doctor-calendar-urls-enum';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';

@Component({
	selector: 'add-assignment-modal',
	templateUrl: './add-assignment-modal.component.html',
	styleUrls: ['./add-assignment-modal.component.scss'],
})
export class AddAssignmentModalComponent extends PermissionComponent {
	@ViewChild(forwardRef(() => HomeComponent)) home;
	myForm: FormGroup;
	public isDocHeader: boolean = true;
	public replaceObj: any = {
		specId: '',
		doctor_method: '',
		doctor_method_id:null,
		docId: '',
		assignments: [],
		selectedDoctors: [],
	};
	public postObjManual: any = {
		speciality: {
			start_date: '',
			end_date: '',
			no_of_doctors: '',
			speciality_id: '',
			facility_location_id: '',
		},
		doctor_method: '',
		doctor_method_id:null,
		timeZone: 0,
		doctors: [{ docId: '', doctorName: '' }],
	};
	public postObjNone: any = {
		speciality: {
			start_date: '',
			end_date: '',
			no_of_doctors: '',
			speciality_id: '',
			facility_location_id: '',
		},
		doctor_method: '',
		doctor_method_id:null,
		timeZone: 0,
	};
	public postObjAutomatic: any = {
		speciality: {
			start_date: '',
			end_date: '',
			no_of_doctors: '',
			speciality_id: '',
			facility_location_id: '',
		},
		doctor_method: '',
		doctor_method_id:null,
		timeZone: 0,
	};
	public recuurenceObjEndDateAutomatic: any = {
		speciality: {
			start_date: '',
			end_date: '',
			no_of_doctors: '',
			speciality_id: '',
			facility_location_id: '',
			end_date_for_recurrence: '',
			recurrence_ending_criteria_id: '',
		},
		recurrence: { startDate: '', endDate: '', daysList: [''], endingCriteria: RecurrenceRepeatOptionEnum.Weekly },
		doctor_method: '',
		doctor_method_id:null,
		timeZone: 0,
	};
	public recuurenceObjEndAfterWeeksAutomatic: any = {
		speciality: {
			start_date: '',
			end_date: '',
			no_of_doctors: '',
			speciality_id: '',
			facility_location_id: '',
			end_date_for_recurrence: '',
			end_after_occurences: '',
			recurrence_ending_criteria_id: '',
			days: '',
			number_of_entries: '',
		},
		recurrence: { startDate: '', daysList: [''], endingCriteria: RecurrenceRepeatOptionEnum.Weekly, endAfterOccurences: '' },
		doctor_method: '',
		doctor_method_id:null,
		timeZone: 0,
	};
	public recuurenceObjEndDateNone: any = {
		speciality: {
			start_date: '',
			end_date: '',
			no_of_doctors: '',
			speciality_id: '',
			facility_location_id: '',
			end_date_for_recurrence: '',
			recurrence_ending_criteria_id: '',
			days: '',
			number_of_entries: '',
		},
		recurrence: { startDate: '', endDate: '', daysList: [''], endingCriteria: RecurrenceRepeatOptionEnum.Weekly },
		doctor_method: '',
		doctor_method_id:null,
		timeZone: 0,
	};
	public recuurenceObjEndAfterWeeksNone: any = {
		speciality: {
			start_date: '',
			end_date: '',
			no_of_doctors: '',
			speciality_id: '',
			facility_location_id: '',
			end_date_for_recurrence: '',
			end_after_occurences: '',
			recurrence_ending_criteria_id: '',
			days: '',
			number_of_entries: '',
		},
		recurrence: { startDate: '', daysList: [''], endingCriteria: RecurrenceRepeatOptionEnum.Weekly, endAfterOccurences: '' },
		doctor_method: '',
		doctor_method_id:null,
		timeZone: 0,
	};
	public unaviableDocList: any = [];
	public isShowUnavailabiltySelectedDoc: boolean = true;
	public isShowUnavailabiltyConflictDoc: boolean = true;
	public unavaliabiltyList: any = [];
	public unavailabilityStartTime: any = [];
	public unavailabilityEndTime: any = [];
	public isWeekError: boolean = true;
	public isDisableOption: boolean = true;
	public isDisableSaveBtn: boolean = false;
	public dayListArray: any = [];
	public tempStartDate: any = [];
	public docName: any = [];
	public tempEndDate: any = [];
	public tempConflictList: any = [];
	public searchDocList: any = [];
	public searchList: boolean = true;
	public searchBar: boolean = true;
	public noOfDocIsLess: Boolean = true;
	public noOfDocZero: Boolean = true;
	public noOfDocSelectedMore: Boolean = true;
	public docDetails: any = [];
	public option :any[]=[];
	public interval: number;
	public ManualListDoctors: any = [];
	public AvailableListDoctors: any = [];
	public isShowlist: boolean = true;
	public isShowSelectedlist: boolean = true;
	public isSHowAssignedDocDetails: boolean = true;
	public weekDayList: any = [];
	public speciality: any = [];
	public noOfDoc = 1;
	public specTimeSlot;
	public isProgressLost: boolean = false;
	public isDisable: boolean = false;
	public timeSubStringList: any = [];
	public startDate : Date;
	public endDate : Date;
	public startTime : Date;
	public endTime : Date
	endOccurenceByDate: Date;
	endOccurenceEndDate: Date;
	public minDate = new Date();
	public minTime :Date
	public maxTime :Date
	public minStartTime :Date
	public maxEndTime :Date
	public assignClinics = [];
	private allFacilitySupervisorClinicIds: any = [];
	public assignDocError = false;
	isAssignmentDeleted:boolean=false;
	public assignProviderTypes:any=[];
	public assignproviderMethodSlugEnum:any=AssignProviderMethodSlug;
	public rangeRecurrenceOptions:any=RangeRecurrenceOption

	//Timings to display in Modal
	// private dateIdToDay = { 0: 'Mon', 1: 'Tue', 2: 'Wed', 3: 'Thu', 4: 'Fri', 5: 'Sat', 6: 'Sun' };
	private dateIdToDay={0:"Sun",1:"Mon",2:"Tue",3:"Wed",4:"Thu",5:"Fri",6:"Sat"};
	private specTimeStart;
	private specTimeEnd;
	btnSubmit:boolean=false;

	ngOnInit() {
	
	}

	ngOnDestroy(): void {
		//Called once, before the instance is destroyed.
		
	}

	constructor(
		aclService: AclService,
		protected requestService: RequestService,
		router: Router,
		public _subjectService: SubjectService,
		public cdr: ChangeDetectorRef,
		public calendarMonthService: CalendarMonthService,
		public _supervisorService: SchedulerSupervisorService,
		public assignSpecialityService: AssignSpecialityService,
		private storageData: StorageData,
		public _fdService: FrontDeskService,
		private toastrService: ToastrService,
		public activeModal: NgbActiveModal,
		public replaceAssignmentService: NgbModal,
		private formBuilder: FormBuilder,
		private replaceAccordianService:ReplaceAccordianService,
		private customDiallogService: CustomDiallogService,
	) {
		super(aclService, router);
		this.option = [
			{id:RecurrenceRepeatOptionEnum.daily ,value:"Daily"} ,{id:RecurrenceRepeatOptionEnum.Weekly,value:"Weekly"} , {id:RecurrenceRepeatOptionEnum.Monthly, value:"Monthly"}
		   ]
		this.isDisableOption = true;
		this.assignproviderMethodSlugEnum=AssignProviderMethodSlug
		this.createForm();
		this.setStartEndDatetime();
		this.allFacilitySupervisorClinicIds = this.storageData.getFacilityLocations();
		this.getAssignProviderTypes();
		this.getPracticeLocations();
		this.getSpecialities();
	}

	getPracticeLocations()
	{
		this.requestService
		.sendRequest(
			AssignSpecialityUrlsEnum.getUserInfobyFacility,
			'POST',
			REQUEST_SERVERS.schedulerApiUrl1,
			{ facility_location_ids: this.allFacilitySupervisorClinicIds,
				per_page: Pagination.per_page,
				page:1,
				pagination:true },
		)
		.subscribe(
			(response: HttpSuccessResponse) => {
				for (let i = 0; i < response.result.data.docs.length; i++) {
					response.result.data.docs[i].day_list = JSON.parse(
						response.result.data.docs[i].day_list,
					);
					this.assignClinics.push(response.result.data.docs[i]);
				}
				if(this._subjectService.clinic&&this._subjectService.clinic['id'])
				{
					this.myForm.controls['clinicname'].setValue(this._subjectService.clinic['id']);

				}
			},
			(error) => {},
		);
	}

	getSpecialities()
	{
		this.requestService
		.sendRequest(
			AssignSpecialityUrlsEnum.GetUserInfoBySpecialities,
			'post',
			REQUEST_SERVERS.schedulerApiUrl1,
			{ 	facility_location_ids:this.storageData.getFacilityLocations(),
				doctor_ids:(!this.storageData.isSuperAdmin() && this.storageData.isDoctor())?[this.storageData.getUserId()]:[], 
				is_provider_calendar:true,
				per_page: Pagination.per_page,
			  	page: 1, 
			  	pagination:true}
		)
		.subscribe(
			(response: HttpSuccessResponse) => {
				for (let i = 0; i < response.result.data.docs.length; i++) {
					this.speciality.push(response.result.data.docs[i]);
					if (this._subjectService.spec['id'] == this.speciality[i].id) {
						this.specTimeSlot = this.speciality[i].time_slot;
						this.interval = this.speciality[i].time_slot;
					}
				}
				if(this._subjectService.spec &&this._subjectService.spec['id']!=0 )
				{
					this.myForm.controls['speciality'].setValue(this._subjectService.spec['id']);

				}
				let tempDayString = this._subjectService.currentSelectedDateDoubleClicked.split(' ');
				let tempDay = tempDayString[0];
				for (let key in this.dateIdToDay) {
					if (this.dateIdToDay[parseInt(key)] === tempDay) {
						if (this._subjectService.clinic !== undefined && this._subjectService.clinic &&this._subjectService.clinic['id']!=0 ) {
							// this.specTimeStart = this._subjectService.clinic['faciltyTiming'][key][
							// 	'start_time_isb'
							// ];
							// this.specTimeEnd = this._subjectService.clinic['faciltyTiming'][key][
							// 	'end_time_isb'
							// ];
							let user_timings=this._subjectService.clinic['faciltyTiming'].find(timing=>timing.facility_location_id==this._subjectService.clinic['id'] && timing.day_id==key)

						// 	let start_time=this._subjectService.clinic['faciltyTiming'][key]['start_time']
						// let end_time=this._subjectService.clinic['faciltyTiming'][key]['end_time']
						// let time_zone=this._subjectService.clinic['faciltyTiming'][key]['time_zone_string']
						
						let start_time=user_timings['start_time']
						let end_time=user_timings['end_time']
						let time_zone=user_timings['time_zone_string']

                        // this.specTimeStart =convertUTCTimeToTimeZone( start_time,time_zone);
                        // this.specTimeEnd = convertUTCTimeToTimeZone(end_time,time_zone);
						
						this.specTimeStart =convertUTCTimeToUserTimeZoneByOffset(this.storageData, start_time,this.startDate,true);
                        this.specTimeEnd = convertUTCTimeToUserTimeZoneByOffset(this.storageData,end_time,this.endDate,true);
							var stDate = new Date(
								this.startDate.getFullYear(),
								this.startDate.getMonth(),
								this.startDate.getDate(),
								this.specTimeStart[0] + this.specTimeStart[1],
								this.specTimeStart[3] + this.specTimeStart[4],
							);
							this.startTime = stDate;
							var edDate = new Date(
								this.endDate.getFullYear(),
								this.endDate.getMonth(),
								this.endDate.getDate(),
								this.specTimeEnd[0] + this.specTimeEnd[1],
								this.specTimeEnd[3] + this.specTimeEnd[4],
							);
							this.endTime = edDate;
							this.setStartEndTimeofSpeciality(new Date(this.startTime),new Date(this.endTime))
							//console.log("CLINICSEE",typeof this.specTimeStart,this.specTimeEnd,this.startTime,this.endTime)
						}
						break;
					}
				}
				//
			},
			(error) => {},
		);
	}

	setStartEndDatetime()
	{
		this.startDate = new Date(this._subjectService.currentStartDate);
		this.endOccurenceByDate = new Date(this.startDate);
		this.endDate = this._subjectService.currentStartDate;
		this.startTime=new Date(this.endDate);
		this.minDate=new Date(this.endDate);
		this.startTime.setHours(new Date().getHours());
		this.startTime.setMinutes(new Date().getMinutes());
		this.startTime.setSeconds(0);
		this.startTime.setMilliseconds(0);
		this.endTime=new Date(this.endDate);
		this.endTime.setHours(this.startTime.getHours() + 1);
		this.endTime.setMinutes(this.startTime.getMinutes());
		this.endTime.setSeconds(0);
		this.endTime.setMilliseconds(0);
		this.myForm.controls['noOfOccurence'].setValue(1);
		this.startDate.setHours(this.startTime.getHours());
		this.startDate.setMinutes(this.startTime.getMinutes());
		this.endDate.setHours(this.endTime.getHours());
		this.endDate.setMinutes(this.endTime.getMinutes());
		this.endOccurenceEndDate = this.endDate;
		this.start_date_Control.patchValue(new Date(this.startDate),{emitEvent: false, onlySelf: true})
		this.start_time_Control.patchValue(new Date(this.startTime),{emitEvent: false, onlySelf: true})
		this.end_time_Control.patchValue(new Date(this.endTime),{emitEvent: false, onlySelf: true})
		// this.minTime = new Date(this.startTime.getTime() + this.specTimeSlot * 1000 * 60);
		// this.maxTime = new Date(this.endTime.getTime() - this.specTimeSlot * 1000 * 60);
	}

	setStartEndTimeofSpeciality(startTime:Date,endTime:Date)
	{
		this.startTime.setSeconds(0);
		this.startTime.setMilliseconds(0);
		this.startTime.setDate(this.startDate.getDate());
		this.startTime.setMonth(this.startDate.getMonth());
		this.startTime.setFullYear(this.startDate.getFullYear());
		this.endTime.setDate(this.endDate.getDate());
		this.endTime.setMonth(this.endDate.getMonth());
		this.endTime.setFullYear(this.endDate.getFullYear());
		this.minTime = new Date(this.startTime.getTime() + this.specTimeSlot * 1000 * 60);
		this.maxTime = new Date(this.endTime.getTime() - this.specTimeSlot * 1000 * 60);
		this.minStartTime = new Date(this.startTime.getTime());
		this.maxEndTime = new Date(this.endTime.getTime());
		this.start_time_Control.patchValue(new Date(this.startTime),{emitEvent: false, onlySelf: true});
		this.end_time_Control.patchValue(new Date(this.endTime),{emitEvent: false, onlySelf: true});
	}

	/*Form intilaization function*/
	private createForm() {
		this.myForm = this.formBuilder.group({
			clinicname: ['', Validators.required],
			speciality: ['', Validators.required],
			noOfDoctors: ['1', Validators.required],
			start_date:['',Validators.required],
			start_time:['',Validators.required],
			end_time:['',Validators.required],
			assign_provider:[true,Validators.requiredTrue],
			doctor_method_slug:['',Validators.required],
			recurrence:[''],
			range_recurrance:[''],
			range_recurrance_option:[],
			search: '',
			noOfOccurence: '',
			dailyMontlyWeeklyOpt: RecurrenceRepeatOptionEnum.daily,
			endOccureneceDate: '',
		});
	}
	/*Change clinic function */
	public changeClinic() {
		this.intializeRecuurenceDays();
		const facilityArray = {
			facility_location_ids: [parseInt(this.myForm.get('clinicname').value)],
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
				this.startTime = stDate;
				var edDate = new Date(
					this.endDate.getFullYear(),
					this.endDate.getMonth(),
					this.endDate.getDate(),
					this.specTimeEnd[0] + this.specTimeEnd[1],
					this.specTimeEnd[3] + this.specTimeEnd[4],
				);
				this.endTime = edDate;
				this.setStartEndTimeofSpeciality(new Date(this.startTime),new Date(this.endTime))
			})
		if (this.myForm.get('dailyMontlyWeeklyOpt').value === RecurrenceRepeatOptionEnum.daily) {
			this.isWeekError = true;
			this.isDisableOption = true;
		} else {
			for (var i = 0; i < this.assignClinics.length; i++) {
				if (this.assignClinics[i].id === parseInt(this.myForm.controls['clinicname'].value)) {
					for (var j = 0; j < this.weekDayList.length; j++) {
						for (var x = 0; x < this.assignClinics[i].day_list.length; x++) {
							if (this.weekDayList[j][0].id == this.assignClinics[i].day_list[x]) {
								this.weekDayList[j][0].isColor = true;
							}
						}
					}
				}
			}
			for (var i = 0; i < this.weekDayList.length; i++) {
				if (this.weekDayList[i][0].isColor == 'false') {
					this.weekDayList.splice(i, 1);
					i--;
				}
			}
		}
		this.resetAll()
		// if ((<HTMLInputElement>document.getElementById('manualassign')).checked === true) {
			if (this.doctor_method_slug_Control.value==AssignProviderMethodSlug.manual_assign) {
			this.manualDoc();
		}
	}
	/*Change speciality function*/
	public changeSpec() {
		this.resetAll();
		for (var i = 0; i < this.speciality.length; i++) {
			if (this.speciality[i].id == parseInt(this.myForm.get('speciality').value)) {
				this.specTimeSlot = this.speciality[i].time_slot;
				this.interval = this.speciality[i].time_slot;
				break;
			}
		}
		// this.changeStartTime();
		// if ((<HTMLInputElement>document.getElementById('manualassign')).checked === true) {
			if (this.doctor_method_slug_Control.value==AssignProviderMethodSlug.manual_assign) {
			this.manualDoc();
		}
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
				
			},
			(error) => {},
		);
	}
	

	/*Change no. doctors function*/
	public changeNoDoctors() {
		this.noOfDoc = this.myForm.get('noOfDoctors').value;

		//HHH
		this.noOfDocSelectedMore = true;
		//
		if (this.noOfDoc === 0 || this.noOfDoc == null) {
			this.noOfDocIsLess = true;
			this.noOfDocZero = false;
		} else {
			if (this.AvailableListDoctors.length > this.noOfDoc) {
				this.noOfDocIsLess = false;
				this.noOfDocZero = true;
			} else {
				this.noOfDocIsLess = true;
				this.noOfDocZero = true;
			}
		}
	}
	/*Change Start Date function*/
	public changeStartDate() {
		
		this.resetAll();
		
		if (this.startDate != null) {
			
			this.endDate = new Date(this.startDate);
			this.minDate = new Date(this.startDate);
			// if ((<HTMLInputElement>document.getElementById('manualassign')).checked === true) {
				if (this.doctor_method_slug_Control.value==AssignProviderMethodSlug.manual_assign) {
				this.manualDoc();
			}
		} else {
			this.isShowlist = true;
			this.isDocHeader = true;
			// this.toastrService.error("Start Date is required", 'Error')
			return;
		}
	}

	public onChangeStartDate(event)
	{
		if(event.dateValue)
		{
			this.start_date_Control.patchValue(new Date(event.dateValue))
		  this.startDate=new Date(event.dateValue);
		  
		  this.changeStartDate();
		} 
		else
		{
			this.start_date_Control.patchValue(null)
			this.startDate=null
		}
	}

	endDateRequired = false;
	/*Change End Date function*/

	public changeEndDate() {
		this.resetAll();
		this.startDate = new Date (this.endDate);
		if (this.endDate != null) {
			this.endDateRequired = false;
			this.minDate = new Date(this.endDate);
			this.startDate = new Date(this.startDate);
			this.startDate.setHours(this.startTime.getHours());
			this.startDate.setMinutes(this.startTime.getMinutes());
			this.endDate.setHours(this.endTime.getHours());
			this.endDate.setMinutes(this.endTime.getMinutes());
			this.endOccurenceEndDate = this.endDate;
		} else {
			this.endDateRequired = true;
			return;
		}
	}

	endTimewrtStart = false;
	/*Change Start Time function*/

	public changeStartTime(event) {
		this.startTime=event
		this.endTimewrtStart = false;
		this.resetAll();
		if (
			this.startTime != null 
			// (<HTMLInputElement>document.getElementById('manualassign')).checked === true
			// && this.doctor_method_slug_Control.value==AssignProviderMethodSlug.manual_assign
		) {
			if (this.startTime.getTime() >= this.endTime.getTime()) {
				this.endTimewrtStart = true;
				this.toastrService.error("Pick end Time with respect to start", 'Error')
				return;
			}
			this.startTime.setSeconds(0);
			this.startTime.setMilliseconds(0);
			this.startTime.setDate(this.startDate.getDate());
			this.startTime.setMonth(this.startDate.getMonth());
			this.startTime.setFullYear(this.startDate.getFullYear());
			this.endTime.setDate(this.endDate.getDate());
			this.endTime.setMonth(this.endDate.getMonth());
			this.endTime.setFullYear(this.endDate.getFullYear());
			if(this.doctor_method_slug_Control.value==AssignProviderMethodSlug.manual_assign)
			{
				this.manualDoc();
			}
			
		} else if (this.startTime === null) {
			this.isShowlist = true;
			this.isDocHeader = true;
			// this.toastrService.error("Start Time is required", 'Error')
			return;
		}
	}

	/*Change End Time function*/

	public changeEndTime(event) {
		this.resetAll();
		this.endTime=event
		this.endTimewrtStart = false;
		if (this.endTime != null) {
			if (this.endTime.getTime() <= this.startTime.getTime()) {
				this.endTimewrtStart = true;
				this.toastrService.error("Pick end Time with respect to start", 'Error')
				return;
			}
			this.startTime = this.startTime == null ? this.minStartTime : this.startTime;
			this.startTime.setDate(this.startDate.getDate());
			this.startTime.setMonth(this.startDate.getMonth());
			this.startTime.setFullYear(this.startDate.getFullYear());
			this.endTime.setSeconds(0);
			this.endTime.setMilliseconds(0);
			this.endTime.setDate(this.endDate.getDate());
			this.endTime.setMonth(this.endDate.getMonth());
			this.endTime.setFullYear(this.endDate.getFullYear());
			if (this.doctor_method_slug_Control.value==AssignProviderMethodSlug.manual_assign) {
				this.manualDoc();
			}
		} else if (this.endTime === null) {
			this.isShowlist = true;
			this.isDocHeader = true;
			// this.toastrService.error("End time is mandatory", 'Error')
			return;
		}
	}
	/*Choose assign doctors(i.e do not assign,automatic,manual) options function*/
	public selectAssignDoctorTypes(event) {
		
			if (this.doctor_method_slug_Control.value==AssignProviderMethodSlug.manual_assign) {
			if (
				(this.ManualListDoctors.length != 0 && this.AvailableListDoctors.length === 0) ||
				this.docDetails.length === 0
			) {
				if (this.searchDocList.length != 0) {
					this.searchList = false;
					this.isShowlist = true;
				} else {
					this.searchList = true;
					this.isShowlist = false;
				}
				this.searchBar = false;

				this.isDocHeader = false;
				this.isDocHeader = false;
				if (this.AvailableListDoctors.length === 0) {
					this.isShowSelectedlist = true;
				} else {
					this.isShowSelectedlist = false;
				}
				if (this.docDetails.length === 0) {
					this.isSHowAssignedDocDetails = true;
				} else {
					this.isSHowAssignedDocDetails = true;
					this.isShowUnavailabiltyConflictDoc = true;
					this.isShowUnavailabiltySelectedDoc = true;
				}
			} else {
				this.searchBar = false;
				this.isShowlist = false;
				this.isDocHeader = false;
				this.isShowSelectedlist = false;
			}
			this.manualDoc()
				
		
		} 
		else if(this.doctor_method_slug_Control.value==AssignProviderMethodSlug.automatic_assign)
		{
			this.automaticDoc()
		}
		else {
				this.assignDocError=false;
				this.isShowlist = true;
				this.isDocHeader = true;
				this.searchList = true;
				this.isShowSelectedlist = true;
				this.isSHowAssignedDocDetails = true;
				this.isShowUnavailabiltyConflictDoc = true;
				this.isShowUnavailabiltySelectedDoc = true;
				this.searchBar = true;
		}

		this.cdr.markForCheck();
	}

	/*Do not assign function*/
	public doNotAssignDoc() {
		this.isDisable = false;
		if (this.ManualListDoctors.length != 0 && this.isProgressLost === true) {
			this.customDiallogService.confirm('Update','You will lose all your progress?','Yes','No')
		.then((confirmed) => {
			if (confirmed){
				if (
					this.recurrence_control.value==true 
					) {
				}
				this.isProgressLost = false;
				this.searchBar = true;
				this.isShowlist = true;
				this.isDocHeader = true;
				this.isShowSelectedlist = true;
				this.isSHowAssignedDocDetails = true;
				this.isShowUnavailabiltyConflictDoc = true;
				this.isShowUnavailabiltySelectedDoc = true;

			}else if(confirmed === false){
				this.isProgressLost = true;
					// (<HTMLInputElement>document.getElementById('manualassign')).checked = true;
					this.doctor_method_slug_Control.setValue(AssignProviderMethodSlug.manual_assign)
			}else{
			}
		})
		.catch();

		}
	}
	/*Automatic assign function*/
	public automaticDoc() {
		if (this.ManualListDoctors.length != 0 && this.isProgressLost === true) {
			this.customDiallogService.confirm('Update','You will lose all your progress','Yes','No')
		.then((confirmed) => {

			if (confirmed){
				this.searchBar = true;
					this.isShowlist = true;
					this.isDocHeader = true;
					this.isShowSelectedlist = true;
					this.isSHowAssignedDocDetails = true;
					this.isProgressLost = false;
					this.isShowUnavailabiltyConflictDoc = true;
					this.isShowUnavailabiltySelectedDoc = true;
			}else if(confirmed === false){
				this.isProgressLost = true;
					// (<HTMLInputElement>document.getElementById('manualassign')).checked = true;
					this.doctor_method_slug_Control.setValue(AssignProviderMethodSlug.manual_assign)
			}else{
			}
		})
		.catch();
		}
	}
	/*Manual assign function*/
	public manualDoc() {
		if (this.endDate === null || this.startDate === null) {
			// this.toastrService.error('Date is required ', 'Error')
			return;
		}
		if (this.startTime === null) {
			// this.toastrService.error('Start time is required ', 'Error')
			return;
		}
		if (this.endTime === null) {
			// this.toastrService.error('"End time is mandatory ', 'Error')
			return;
		}
		let spec = parseInt(this.myForm.get('speciality').value);
		for (var i = 0; i < this.speciality.length; i++) {
			if (this.speciality[i].id == parseInt(this.myForm.get('speciality').value)) {
				this.specTimeSlot = this.speciality[i].time_slot;
			}
		}
		// To reset the recurrence, repeatevery,range of recurrence
		this.reset_Recurrence_Range_End_after_By()
		
		this.startDate.setHours(this.startTime.getHours());
		this.startDate.setMinutes(this.startTime.getMinutes());
		this.isProgressLost = true;
		this.isShowlist = true;
		this.isDocHeader = true;
		this.isSHowAssignedDocDetails = true;
		this.isShowUnavailabiltySelectedDoc = true;
		this.isShowUnavailabiltyConflictDoc = true;
		this.startDate = new Date(this.startDate);
		this.endDate.setHours(this.endTime.getHours());
		this.endDate.setMinutes(this.endTime.getMinutes());
		let startDate = convertDateTimeForSending(this.storageData, new Date(this.startDate));
		let endDate = convertDateTimeForSending(this.storageData, new Date(this.endDate));
		let facilityId = parseInt(this.myForm.controls['clinicname'].value);
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
				obj,
			)
			.subscribe(
				(response: HttpSuccessResponse) => {
					if (response.result.data.length == 0) {
						this.searchBar = true;
					} else {
						this.searchBar = false;
					}
					for (var i = 0; i < response.result.data.length; i++) {
						if (response.result.data[i].assignments.length != 0) {
							response.result.data[i]['isAssigned'] = true;
						} else {
							response.result.data[i]['isAssigned'] = false;
						}
					}
					this.ManualListDoctors = response.result.data;
					this.searchDocList = [];
					this.AvailableListDoctors = [];
					this.isShowSelectedlist = true;
					if (this.ManualListDoctors.length === 0) {
						this.isShowlist = true;
						this.isDocHeader = true;
					} else {
						this.isShowlist = false;
						this.isDocHeader = false;
					}
				},
				(error) => {},
			);
	}
	/*Search doctor function */
	public searchDocByName(event) {
		if (event.target.value == '' || event.target.value == undefined) {
			this.isShowlist = false;
			this.isDocHeader = false;
			this.searchList = true;
			this.searchBar = false;
			this.searchDocList = [];
			return;
		}
		this.searchList = false;
		this.isShowlist = true;
		this.isDocHeader = false;
		this.searchDocList = this.ManualListDoctors.filter((element) => {
			if (element.user_info.middle_name == undefined || element.user_info.middle_name == null) {
				element.user_info.middle_name = '';
			}
			return (
				element.user_info.first_name.toLowerCase().includes(event.target.value.toLowerCase()) ||
				element.user_info.middle_name.toLowerCase().includes(event.target.value.toLowerCase()) ||
				element.user_info.last_name.toLowerCase().includes(event.target.value.toLowerCase())
			);
		});
	}
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
					showStartDate = formatDate(
						doc.unavailabilityTime[i].startDate,
						'yyyy/MM/dd HH:mm',
						'en-US',
						'',
					);
					showEndDate = formatDate(
						doc.unavailabilityTime[i].endDate,
						'yyyy/MM/dd HH:mm',
						'en-US',
						'',
					);
				}
				this.toastrService.error(
					'Provider is on full leave ' +
						showStartDate +
						' to ' +
						showEndDate +
						' select other Provider ',
					'Error',
				);
			} else if (doc.unavailability === 'none' || doc.unavailability === 'partial') {
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
							this.unavaliabiltyList = [];
							this.unavaliabiltyList.push(doc.unavailabilityTime);
							this.unaviableDocList.push(doc);
							for (var i = 0; i < this.unavaliabiltyList[0].length; i++) {
								var startTime = new Date(this.unavaliabiltyList[0][i].startDate);
								var endTime = new Date(this.unavaliabiltyList[0][i].endDate);
								if (startTime.getTime() >= this.startDate.getTime()) {
									startTime = startTime;
								} else if (this.startDate.getTime() >= startTime.getTime()) {
									startTime = this.startDate;
								}
								if (endTime.getTime() <= this.endDate.getTime()) {
									endTime = endTime;
								} else if (this.endDate.getTime() <= endTime.getTime()) {
									endTime = this.endDate;
								}
								this.formatTimeAMPM(startTime, endTime);
								this.unavailabilityStartTime.push(this.timeSubStringList[0]);
								this.unavailabilityEndTime.push(this.timeSubStringList[1]);
								this.unavaliabiltyList = Array.from(new Set(this.unavaliabiltyList));
							}
						}
						this.tempConflictList = Array.from(new Set(this.tempConflictList));
						this.docDetails = this.tempConflictList[0];
						if (this.docDetails[0].is_facility_supervisor == 0) {
							this.toastrService.error('You cant access this provider on this clinic', 'Error');
							this.isSHowAssignedDocDetails = true;
							return;
						}
						for (var i = 0; i < this.docDetails.length; i++) {
							// if (this.docDetails[i].facilityColor.includes('#')) {
							// } else {
							// 	this.docDetails[i].facilityColor = '#' + this.docDetails[i].facilityColor;
							// }
							this.formatTimeAMPM(
								new Date(this.docDetails[i].start_date),
								new Date(this.docDetails[i].end_date),
							);
							this.tempStartDate.push(this.timeSubStringList[0]);
							this.tempEndDate.push(this.timeSubStringList[1]);
						}
					} else {
						let a = this.AvailableListDoctors.filter((element) => {
							return element.user_id == doc.user_id;
						});
						if (a.length != 0) {
							this.toastrService.error('Provider is already selected', 'Error');
						} else {
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
									var startTime = new Date(this.unavaliabiltyList[0][i].startDate);
									var endTime = new Date(this.unavaliabiltyList[0][i].endDate);
									if (startTime.getTime() >= this.startDate.getTime()) {
										startTime = startTime;
									} else if (this.startDate.getTime() >= startTime.getTime()) {
										startTime = this.startDate;
									}
									if (endTime.getTime() <= this.endDate.getTime()) {
										endTime = endTime;
									} else if (this.endDate.getTime() <= endTime.getTime()) {
										endTime = this.endDate;
									}
									this.formatTimeAMPM(startTime, endTime);
									this.unavailabilityStartTime.push(this.timeSubStringList[0]);
									this.unavailabilityEndTime.push(this.timeSubStringList[1]);
									this.unavaliabiltyList = Array.from(new Set(this.unavaliabiltyList));
								}
							} else {
								this.isShowUnavailabiltySelectedDoc = true;
								this.AvailableListDoctors.push(doc);
								this.AvailableListDoctors = Array.from(new Set(this.AvailableListDoctors));
								this.isShowSelectedlist = false;
							}
						}
						this.isSHowAssignedDocDetails = true;
						this.noOfDocZero = true;
					}
				} else if (this.AvailableListDoctors.length === this.noOfDoc) {
					let filteredDocData = this.AvailableListDoctors.filter((element) => {
						return element.user_id == doc.user_id;
					});
					if (filteredDocData.length != 0) {
						this.toastrService.error('Provider is already selected', 'Error');
					} else {
						//HHH
						this.noOfDocSelectedMore = false;
						//
						// this.toastrService.error('Please enter more number of doctors for selection', 'Error')
						this.toastrService.error('Select providers with respect to number of providers', 'Error')

					}
				}
			}
		} else {
			this.noOfDocZero = false;
		}
	}

	removeConflictedAssignment(selectedProvider:any)
	{
		// let currentelement=this.ManualListDoctors.find(element=>element.user_id==selectedProvider.doctor_id).assignments.filter(assign=>{return assign.date_list_id!=selectedProvider.date_list_id &&assign.id==selectedProvider.id })
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
		if (this.isDisable != true) {
			selectdoc.Assigned = false;
			this.AvailableListDoctors.splice(this.AvailableListDoctors.indexOf(selectdoc), 1);
			if (this.AvailableListDoctors.length === 0) {
				this.isShowSelectedlist = true;
			}
			if (this.AvailableListDoctors.length <= this.noOfDoc) {
				this.noOfDocIsLess = true;
				this.noOfDocZero = true;
			} else {
				this.noOfDocIsLess = false;
				this.noOfDocZero = false;
			}
		}
	}
	/*Remove doctor conflict without finding replacement function*/
	public isAssignedForce() {
		if (this.isDisable === false) {

			this.customDiallogService.confirm('Delete','Do you want to remove provider from existing assignment?','Yes','No')
		.then((confirmed) => {
			if (confirmed){
				this.replaceObj.assignments = [];
						this.replaceObj.selectedDoctors = [];
						this.replaceObj.specId = parseInt(this.myForm.get('speciality').value);
						this.replaceObj.docId = this.docName[0][1];
						for (var i = 0; i < this.docName[0][0].length; i++) {
							this.replaceObj.assignments.push(this.docName[0][0][i].id);
						}
						for (var i = 0; i < this.AvailableListDoctors.length; i++) {
							this.replaceObj.selectedDoctors.push(this.AvailableListDoctors[i].user_id);
						}
						if (
							// (<HTMLInputElement>document.getElementById('automaticSys')).checked === true
							this.doctor_method_slug_Control.value==AssignProviderMethodSlug.automatic_assign
							) {
							this.replaceObj.doctorMethod = 'automatic';
							this.replaceObj.doctor_method_id=this.assignProviderTypes.find(providerType=>{return providerType.slug==this.doctor_method_slug_Control.value}).id
							this.requestService
								.sendRequest(
									AssignSpecialityUrlsEnum.resolveAssignedDocs,
									'POST',
									REQUEST_SERVERS.schedulerApiUrl1,
									this.replaceObj,
								)
								.subscribe(
									(response: HttpSuccessResponse) => {
										for (var i = 0; i < this.ManualListDoctors.length; i++) {
											if (this.ManualListDoctors[i].user_id == this.docName[0][1]) {
												if (this.ManualListDoctors[i].isAssigned == true) {
													if (
														this.ManualListDoctors[i].unavailability == 'partial' ||
														this.ManualListDoctors[i].unavailability == 'none'
													) {
														this.ManualListDoctors[i].isAssigned = false;
														for (var j = 0; i < this.ManualListDoctors.length; j++) {
															if (
																this.ManualListDoctors[j].user_id ==
																response.result.data[0].replacedDocs[0].docId
															) {
																this.ManualListDoctors[j].assignments = [];
																let obj = {
																	docId: 0,
																	docName: '',
																	endDate: '',
																	id: 0,
																	startDate: '',
																	facilityId: 2,
																	facilityColor: '',
																	facilityName: '',
																};

																this.ManualListDoctors[j].isAssigned = true;
																obj.docId = response.result.data[0].replacedDocs[0].docId;
																obj.docName = response.result.data[0].replacedDocs[0].doctorName;
																obj.endDate = response.result.data[0].replacedDocs[0].endDate;
																obj.id = response.result.data[0].replacedDocs[0].id;
																obj.startDate = response.result.data[0].replacedDocs[0].startDate;
																obj.facilityId = response.result.data[0].replacedDocs[0].facilityId;

																for (var q = 0; q < this.assignClinics.length; q++) {
																	if (
																		this.assignClinics[q].id ==
																		response.result.data[0].replacedDocs[0].facilityId
																	) {
																		obj.facilityColor = this.assignClinics[q].color;
																		obj.facilityName = this.assignClinics[q].name;
																		this.ManualListDoctors[j].assignments.push(obj);

																		break;
																	}
																}
																if (this.ManualListDoctors[j].unavailabilityTime.length != 0) {
																	this.isShowUnavailabiltyConflictDoc = false;
																	this.isShowUnavailabiltySelectedDoc = true;
																}
																break;
															}
														}
														for (var x = 0; x < this.AvailableListDoctors.length; x++) {
															if (
																this.AvailableListDoctors[x].id ==
																response.result.data[0].replacedDocs[0].docId
															) {
																this.AvailableListDoctors.splice(x, 1);
																x--;
															}
														}
													}
												}
											}
										}
										this.isSHowAssignedDocDetails = true;
									},
									(error) => {
										this.isSHowAssignedDocDetails = false;
									},
								);
						} else {
							this.replaceObj.doctorMethod = 'none';
							this.requestService
								.sendRequest(
									AssignSpecialityUrlsEnum.resolveAssignedDocs,
									'POST',
									REQUEST_SERVERS.schedulerApiUrl1,
									this.replaceObj,
								)
								.subscribe(
									(response: HttpSuccessResponse) => {
										for (var i = 0; i < this.ManualListDoctors.length; i++) {
											if (this.ManualListDoctors[i].user_id == this.docName[0][1]) {
												if (this.ManualListDoctors[i].isAssigned == true) {
													if (
														this.ManualListDoctors[i].unavailability == 'partial' ||
														this.ManualListDoctors[i].unavailability == 'none'
													) {
														this.ManualListDoctors[i].isAssigned = false;
														if (this.ManualListDoctors[i].unavailabilityTime.length != 0) {
															this.isShowUnavailabiltyConflictDoc = false;
															this.isShowUnavailabiltySelectedDoc = true;
														}
													}
												}
											}
										}
										this.isSHowAssignedDocDetails = true;
									},
									(error) => {},
								);
						}
			}else if(confirmed === false){
			}else{
			}
		})
		.catch();
		}
	}

	replace(selectedProvider:any)
	{
		this.replaceAccordianService.deleteSelectedAppointmentIds=[];
		let practice_location_id=this.myForm.get('clinicname').value;
		let speciality_id=this.myForm.get('speciality').value;
		this.replaceAccordianService.conflictedProviderAssignment=selectedProvider;
		if(practice_location_id)
		{
			let practice_location=this.assignClinics.find(practice=>practice.id==parseInt(practice_location_id))
			this.replaceAccordianService.Practice_location=practice_location?`${practice_location.facility_name}-${practice_location.name}`:'';
		}
		if(speciality_id)
		{
			let speciality=this.speciality.find(speciality=>speciality.id==parseInt(speciality_id))
			this.replaceAccordianService.speciality_name=speciality?speciality.name:'';
		}

	
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
						

this.customDiallogService.confirm('Are you sure?', 'You want to delete the assignment','Yes','No')
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
		// 		this.removeConflictedAssignment(selectedProvider)
		// 	}
		// 	this.isAssignmentDeleted=is_assignment_deleted;
		// 	console.log('checking');
		// });
	}
	
	/*Remove doctor conflict and find replacement function*/
	public isAssignedAnyway() {
		for (var i = 0; i < this.ManualListDoctors.length; i++) {
			if (this.unaviableDocList[0].id == this.ManualListDoctors[i].id) {
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
				if (
					this.ManualListDoctors[j].unavailability === 'partial' &&
					this.ManualListDoctors[j].id === this.unaviableDocList[i].id
				) {
					this.ManualListDoctors[j].unavailability = 'none';
				}
			}
		}
		this.isShowUnavailabiltySelectedDoc = true;
		this.isShowUnavailabiltyConflictDoc = true;
		this.isShowSelectedlist = false;
	}

	//HAMZA
	//When End By Date is selected/changed/clicked
	endOccChanged(event?) {
		//console.log("DATE CHANGED", event);//tbd

		//Change Checkbox to checked if end Date changed
		// (<HTMLInputElement>document.getElementById('rangeRecurrence')).checked = true;
		this.range_recurrance_control.setValue(true)

		// Range of Recc Check box Checked
		this.rangeRecuurence({ target: { checked: true } });

		// End By Radio Button Checked
		// (<HTMLInputElement>document.getElementById('rangeRecOption2')).checked = true;
		this.range_recurrance_option_control.setValue(RangeRecurrenceOption.EndBy) 
		this.endbyDateDisable = false;

		// Func Called when End By or End After clicked
		this.selectRangeOfRecurrenceTypes();
	}

	public onChangeEndByDate(event)
	{
		if(event.dateValue)
		{
			// this.start_date_Control.patchValue(new Date(event.dateValue))
		  this.endOccurenceEndDate=new Date(event.dateValue);
		  
		  this.endOccChanged();
		  if ( WithoutTime( this.endOccurenceEndDate) <WithoutTime(this.minDate) ) {
			this.toastrService.error('Pick end date with respect to start date', 'Error');
			return;
		}
		} 
		else
		{
			// this.start_date_Control.patchValue(null)
			this.endOccurenceEndDate=null;
			this.endOccChanged()
		}
	}
	endAfterClickChange() {
		//console.log("DATE CHANGED", event);//tbd

		//Change Checkbox to checked if end Date changed
		// (<HTMLInputElement>document.getElementById('rangeRecurrence')).checked = true;
		this.range_recurrance_control.setValue(true)
		// Range of Recc Check box Checked
		this.rangeRecuurence({ target: { checked: true } });

		// End By Radio Button Checked
		// (<HTMLInputElement>document.getElementById('rangeRecOption1')).checked = true;

		this.range_recurrance_option_control.setValue(RangeRecurrenceOption.EndAfter)
	

		// this.endbyDateDisable = false;

		// Func Called when End By or End After clicked
		this.selectRangeOfRecurrenceTypes();
	}
	reset_Recurrence_Range_End_after_By()
	{
		// this.range_recurrance_control.reset();
		// this.range_recurrance_option_control.reset()
		this.recurrence_control.reset();
		this.resetRecurrenceDetailsOnUncheckRecurrence()
		//no of Occr to 1
		this.myForm.controls['noOfOccurence'].setValue(1);

		//set end occurance date to initial
		this.endOccurenceEndDate = this.endDate;

		//Reset Repeat Every
		this.myForm.controls['dailyMontlyWeeklyOpt'].setValue(RecurrenceRepeatOptionEnum.daily);
	}

	//

	/*Choose recurrence section function*/
	public selectRecurrence(event) {
		
		if (this.myForm.get('dailyMontlyWeeklyOpt').value === RecurrenceRepeatOptionEnum.daily) {
			this.isDisableOption = true;
		} else {
			this.isDisableOption = false;
		}
		if (this.recurrence_control.value === true) {
				this.myForm.controls['endOccureneceDate'].enable();
				this.myForm.controls['noOfOccurence'].enable();
				this.resetRecurrenceDetailsOnUncheckRecurrence();
				this.myForm.controls['noOfOccurence'].setValue(1);
				//set end occurance date to initial
				this.endOccurenceEndDate = this.endDate;
				//Reset Repeat Every
				this.myForm.controls['dailyMontlyWeeklyOpt'].setValue(RecurrenceRepeatOptionEnum.daily);
				this.changeRepeatEvery();
		}
		 else {
				this.resetRecurrenceDetailsOnUncheckRecurrence();
				this.myForm.controls['dailyMontlyWeeklyOpt'].setValue(RecurrenceRepeatOptionEnum.daily);
				this.changeRepeatEvery();
		}
	}

	resetRecurrenceDetailsOnUncheckRecurrence()
	{
		this.range_recurrance_control.reset();
		this.range_recurrance_option_control.reset();
		this.addRemoveValidationOfRange_recurence_option();
	}

	addRemoveValidationOfRange_recurence_option()
	{
		if(this.recurrence_control.value === true)
		{
			this.range_recurrance_control.setValidators([Validators.requiredTrue]);
			this.range_recurrance_option_control.setValidators([Validators.required]);
			this.range_recurrance_control.updateValueAndValidity();
			this.range_recurrance_option_control.updateValueAndValidity()
		}
		else
		{
			this.range_recurrance_control.clearValidators();
			this.range_recurrance_option_control.clearValidators()
			this.range_recurrance_control.updateValueAndValidity();
			this.range_recurrance_option_control.updateValueAndValidity()
		}
	}

	/*Type of occurences(i.e week,day,moth) function*/
	public changeRepeatEvery() {
		
		this.intializeRecuurenceDays();
		this.dayListArray = [];
		if (parseInt(this.myForm.get('dailyMontlyWeeklyOpt').value) === RecurrenceRepeatOptionEnum.daily) {
			this.isWeekError = true;
			this.isDisableOption = true;
		} else {
			for (var i = 0; i < this.assignClinics.length; i++) {
				if (this.assignClinics[i].id == parseInt(this.myForm.controls['clinicname'].value)) {
					for (var j = 0; j < this.weekDayList.length; j++) {
						for (var x = 0; x < this.assignClinics[i].day_list.length; x++) {
							if (this.weekDayList[j][0].id == this.assignClinics[i].day_list[x]) {
								this.weekDayList[j][0].isColor = true;
							}
						}
					}
				}
			}
			for (var i = 0; i < this.weekDayList.length; i++) {
				if (this.weekDayList[i][0].isColor == 'false') {
					this.weekDayList.splice(i, 1);
					i--;
				}
			}
			this.isDisableOption = false;
		}
	}
	/*Recurrence week days selection function*/
	public selectWeekDays(event, val) {
		//HAMZA (Check box trigger when week day name pressed)
		if (val.isChecked == true) {
			val.isChecked = false;
		} else {
			val.isChecked = true;
		}

		//incase of Name Clicked rather then check box
		// if (event.target.checked == undefined) {
		// 	event.target.checked = val.isChecked;
		// }

		event.target.checked = val.isChecked;

		//console.log("EVENT VAL",event, val, this.weekDayList,val.id);

		//

		val = val.id;
		if (event.target.checked) {
			this.dayListArray.push(val);
			this.dayListArray = Array.from(new Set(this.dayListArray));
			// val = JSON.stringify(val);
			this.isWeekError = true;
		} else {
			this.dayListArray = Array.from(new Set(this.dayListArray));
			// val = JSON.stringify(val);
			for (var i = 0; i < this.dayListArray.length; i++) {
				if (this.dayListArray[i] === val) {
					this.dayListArray.splice(i, 1);
				}
			}
		}
		this.dayListArray.length>0 ?this.dayListArray.sort():this.dayListArray;

	}
	/*Choose range recurrence section function*/
	public rangeRecuurence(event) {
		this.minDate = new Date(this.startDate);
		if (this.range_recurrance_control.value === true) {

			// this.myForm.controls['endOccureneceDate'].enable();
			// this.myForm.controls['noOfOccurence'].enable();
			// this.myForm.controls['endOccureneceDate'].disable();
			// this.myForm.controls['noOfOccurence'].disable();
		}
		else {
			// this.myForm.controls['endOccureneceDate'].disable();
			// this.myForm.controls['noOfOccurence'].disable();
			// this.isRangeRec = true;
			// this.hiderangeRecurrenceError=false
		// 	if((<HTMLInputElement>document.getElementById('rangeRecOption1')).checked === true ||
		// 	(<HTMLInputElement>document.getElementById('rangeRecOption2')).checked === true )
		// {
		// 		this.isUnSuccess=true
		// }  
			//Uncheck both radio button if Range of Recurrence is unchecked
			// (<HTMLInputElement>document.getElementById('rangeRecOption1')).checked = false;
			// this.selectRangeOfRecurrenceTypes();
			// (<HTMLInputElement>document.getElementById('rangeRecOption2')).checked = false;
			// this.selectRangeOfRecurrenceTypes();
			//
		}
		// this.hideRangeRec = false;
	}
	endbyDateDisable = true;

	/*Choose recurrence i.e(End after/End by) options function*/
	public selectRangeOfRecurrenceTypes() {
		if (
			// (<HTMLInputElement>document.getElementById('rangeRecOption2')).checked === true ||
			// (<HTMLInputElement>document.getElementById('rangeRecOption1')).checked === true
			this.range_recurrance_option_control.value==RangeRecurrenceOption.EndAfter ||
			this.range_recurrance_option_control.value==RangeRecurrenceOption.EndBy 
			
		) {
			// this.isUnSuccess = true;
		} else {
			// this.isUnSuccess = false;
			this.endbyDateDisable = true;
		}
		if (
			// (<HTMLInputElement>document.getElementById('rangeRecOption2')).checked === true
			this.range_recurrance_option_control.value==RangeRecurrenceOption.EndBy 
			) {
			this.endbyDateDisable = false;
			this.myForm.controls['noOfOccurence'].disable();
		} else {
			this.endbyDateDisable = true;
			// this.myForm.controls['endOccureneceDate'].enable();
			this.myForm.controls['noOfOccurence'].enable();
		}
	}
	/*time to 12 hour format convertion function*/
	public formatTimeAMPM(startTime, endTime) {
		var tempStartHour;
		var tempStartMin;
		var tempEndHour;
		var tempEndMin;
		tempStartHour = startTime.getHours();
		tempStartMin = startTime.getMinutes();
		var startDateAMPM = tempStartHour >= 12 ? 'PM' : 'AM';
		tempStartHour = tempStartHour % 12;
		tempStartHour = tempStartHour ? tempStartHour : 12;
		tempStartMin = tempStartMin < 10 ? '0' + tempStartMin : tempStartMin;
		tempEndHour = endTime.getHours();
		tempEndMin = endTime.getMinutes();
		var endDateAMPM = tempEndHour >= 12 ? 'PM' : 'AM';
		tempEndHour = tempEndHour % 12;
		tempEndHour = tempEndHour ? tempEndHour : 12;
		tempEndMin = tempEndMin < 10 ? '0' + tempEndMin : tempEndMin;
		let startDateTime = tempStartHour + ':' + tempStartMin + ' ' + startDateAMPM;
		let endDateTime = tempEndHour + ':' + tempEndMin + ' ' + endDateAMPM;
		this.timeSubStringList[0] = startDateTime;
		this.timeSubStringList[1] = endDateTime;
	}
	/*Intialize Recuurence Days Function*/
	public intializeRecuurenceDays() {
		this.weekDayList[0] = [{ id: 0, name: 'Sun', isColor: 'false', isChecked: false }];
		this.weekDayList[1] = [{ id: 1, name: 'Mon', isColor: 'false', isChecked: false }];
		this.weekDayList[2] = [{ id: 2, name: 'Tue', isColor: 'false', isChecked: false }];
		this.weekDayList[3] = [{ id: 3, name: 'Wed', isColor: 'false', isChecked: false }];
		this.weekDayList[4] = [{ id: 4, name: 'Thu', isColor: 'false', isChecked: false }];
		this.weekDayList[5] = [{ id: 5, name: 'Fri', isColor: 'false', isChecked: false }];
		this.weekDayList[6] = [{ id: 6, name: 'Sat', isColor: 'false', isChecked: false }];
	}
	/*Reset form after submitation*/
	public resetAll() {
		this.isShowUnavailabiltyConflictDoc = true;
		this.isShowUnavailabiltySelectedDoc = true;
		this.searchDocList = [];
		this.AvailableListDoctors = [];
		this.searchBar = true;
		this.isShowSelectedlist = true;
		this.isSHowAssignedDocDetails = true;
		this.ManualListDoctors = [];
	}
	/*Form submitation function*/
	public submitFormAndOpen() {
	
		this.btnSubmit=true
		let doctor_method_id=this.assignProviderTypes.find(assignProvider=>assignProvider.slug==this.doctor_method_slug_Control.value ).id
		this.isDisableSaveBtn=true
		if (this.myForm.invalid) {
			this.isDisableSaveBtn=false;
			return;
			
		}
		if (parseInt(this.myForm.get('speciality').value) == 0) {
			this.isDisableSaveBtn=false;
			this.toastrService.error('Kindly select atleast one specialty', 'Error');
			return;
		}
		if (parseInt(this.myForm.get('clinicname').value) == 0) {
			this.isDisableSaveBtn=false;
			this.toastrService.error('Kindly select atleast one practice-location', 'Error');
			return;
		}
		if (this.noOfDoc === 0) {
			this.isDisableSaveBtn=false;
			this.toastrService.error('Kindly select atleast one Provider ', 'Error');
			return;
		}
		if (this.endDate === null || this.startDate === null) {
			this.isDisableSaveBtn=false;
			this.toastrService.error('Date is required', 'Error');
			return;
		}
		if (this.startTime === null) {
			this.isDisableSaveBtn=false;
			this.toastrService.error('Start time is required', 'Error');
			return;
		}
		if (this.endTime === null) {
			this.isDisableSaveBtn=false;
			this.toastrService.error('End time is mandatory', 'Error');
			return;
		}
		if (this.endTime.getTime() < this.minTime.getTime()) {
			this.isDisableSaveBtn=false;
			this.toastrService.error('Pick end time with respect to start time', 'Error');
			return;
		}

		if(!checkSelectedLocationsForInactive([parseInt(this.myForm.get('clinicname').value)],this.assignClinics)){
            this.isDisableSaveBtn=false;
			this.toastrService.error("Selected location(s) is/are inactive, please contact your supervisor",'Error');
			return;
		}

		
		this.startDate.setHours(this.startTime.getHours());
		this.startDate.setMinutes(this.startTime.getMinutes());
		this.startDate.setSeconds(0);
		this.startDate.setMilliseconds(0);
		this.endDate.setHours(this.endTime.getHours());
		this.endDate.setMinutes(this.endTime.getMinutes());
		this.endDate.setSeconds(0);
		this.endDate.setMilliseconds(0);
		let startDate = convertDateTimeForSending(this.storageData, (this.startDate));
		let endDate = convertDateTimeForSending(this.storageData, (this.endDate));
		if (
			this.doctor_method_slug_Control.value==AssignProviderMethodSlug.manual_assign
			&& !this.range_recurrance_control.value
		) {
			if(parseInt(this.myForm.get('noOfDoctors').value)<this.AvailableListDoctors.length)
			{
				this.toastrService.error('Selected providers should be equal to no of providers', 'Error');
				this.isDisableSaveBtn=false
				return;
			}
			this.postObjManual.doctors = [];
			for (var i = 0; i < this.AvailableListDoctors.length; i++) {
				this.postObjManual.doctors.push(this.AvailableListDoctors[i].user_id);
			}
			this.postObjManual.speciality.start_date = startDate;
			this.postObjManual.speciality.end_date = endDate;
			
			this.postObjManual.speciality.no_of_doctors = parseInt(this.myForm.get('noOfDoctors').value);
			this.postObjManual.speciality.speciality_id = parseInt(this.myForm.get('speciality').value);
			this.postObjManual.speciality.facility_location_id = parseInt(
				this.myForm.get('clinicname').value,
			);
			this.postObjManual.doctor_method = 'manual';
			this.postObjManual.doctor_method_id = doctor_method_id;
			this.postObjManual.timeZone = stdTimezoneOffset();
			this.requestService
				.sendRequest(
					AssignSpecialityUrlsEnum.AddSpecialityAvailble,
					'POST',
					REQUEST_SERVERS.schedulerApiUrl1,
					this.postObjManual,
				)
				.subscribe(
					(resp: HttpSuccessResponse) => {
						this.isDisableSaveBtn=false;
						if (resp.result.data.length === 0) {
							this.toastrService.error(
								'Error! Please select atleast one provider before submission in manual assign',
								'Error',
							);
						} else {

							this.toastrService.success('Assignment Created Successfully', 'Success');
							this.activeModal.close();
							this._subjectService.refreshUpdate('add');
						}
					},
					(error) => {
						this.isDisableSaveBtn=false;
					},
				);
		} else if (
			this.doctor_method_slug_Control.value==AssignProviderMethodSlug.automatic_assign&&
			!this.recurrence_control.value && !this.range_recurrance_control.value
		) {
			
			this.postObjAutomatic.speciality.start_date = startDate;
			this.postObjAutomatic.speciality.end_date = endDate;
			this.postObjAutomatic.speciality.no_of_doctors = parseInt(
				this.myForm.get('noOfDoctors').value,
			);
			if (this.postObjAutomatic.speciality.noOfDoctors === 0) {
				this.isDisableSaveBtn=false;
				this.toastrService.error('kindly enter  atleast one number of Provider ', 'Error');
				return;
			}
			this.postObjAutomatic.speciality.speciality_id = parseInt(
				this.myForm.get('speciality').value,
			);
			this.postObjAutomatic.speciality.facility_location_id = parseInt(
				this.myForm.get('clinicname').value,
			);
			this.postObjAutomatic.doctor_method = 'automatic';
			this.postObjAutomatic.doctor_method_id=doctor_method_id
			this.postObjAutomatic.timeZone = stdTimezoneOffset();
			this.requestService
				.sendRequest(
					AssignSpecialityUrlsEnum.AddSpecialityAvailble,
					'POST',
					REQUEST_SERVERS.schedulerApiUrl1,
					this.postObjAutomatic,
				)
				.subscribe(
					(resp: HttpSuccessResponse) => {
						this.isDisableSaveBtn=false;
						if(resp.message=="success")
						{
							this.toastrService.success(
								// 'Providers are not available for complete Assignment',
								"Provider has been assigned successfully",
								'Success',
							);	
						}
						else
						{
							this.toastrService.success(
								// 'Providers are not available for complete Assignment',
								resp.message,
								'Success',
							);
						}				
						this.activeModal.close();
						this._subjectService.refreshUpdate('add');
					},
					(error) => {
						this.isDisableSaveBtn=false;
;
					},
				);
		} else if (
			this.doctor_method_slug_Control.value==AssignProviderMethodSlug.do_not_assign &&
			!this.recurrence_control.value &&!this.range_recurrance_control.value
		) {
			this.postObjNone.speciality.start_date = startDate;
			this.postObjNone.speciality.end_date = endDate;
			this.postObjNone.speciality.no_of_doctors = parseInt(this.myForm.get('noOfDoctors').value);
			if (this.postObjAutomatic.speciality.no_of_doctors === 0) {
				this.toastrService.error('kindly enter  atleast one number of Provider ', 'Error');
				this.isDisableSaveBtn=false;
				return;
			}
			this.postObjNone.speciality.speciality_id = parseInt(this.myForm.get('speciality').value);
			this.postObjNone.speciality.facility_location_id = parseInt(
				this.myForm.get('clinicname').value,
			);
			this.postObjNone.doctor_method ='';
			this.postObjNone.doctor_method_id=doctor_method_id
			this.postObjNone.timeZone = stdTimezoneOffset();
			this.requestService
				.sendRequest(
					AssignSpecialityUrlsEnum.AddSpecialityAvailble,
					'POST',
					REQUEST_SERVERS.schedulerApiUrl1,
					this.postObjNone,
				)
				.subscribe(
					(resp: HttpSuccessResponse) => {
						this.isDisableSaveBtn=false;
						if(resp.message=="success")
						{
							this.toastrService.success("Assignment Added successfully but Providers are not available for complete Assignment",'Success');
						}
						else
						{
							this.toastrService.success(
								resp.message,
								'Success',
							);
						}
						
						this.activeModal.close();
						this._subjectService.refreshUpdate('add');
					},
					(error) => {
						this.isDisableSaveBtn=false;
					},
				);
		} else if (
			this.doctor_method_slug_Control.value ===AssignProviderMethodSlug.automatic_assign &&
			this.range_recurrance_control.value==true && this.range_recurrance_option_control.value==RangeRecurrenceOption.EndBy 	
		) {
			this.recuurenceObjEndDateAutomatic.speciality.start_date = startDate;
			this.recuurenceObjEndDateAutomatic.speciality.end_date = endDate;
			if (this.endOccurenceEndDate == null) {
				
				this.toastrService.error('Choose other option or choose end occurence date', 'Error');
				this.isDisableSaveBtn=false;
				return;
			}
			if ( WithoutTime( this.endOccurenceEndDate) <WithoutTime(this.minDate) ) {
				this.toastrService.error('Pick end date with respect to start date', 'Error');
				this.isDisableSaveBtn=false;
				return;
			}
			let date = new Date(this.endOccurenceEndDate);
			date.setHours(this.endTime.getHours());
			date.setMinutes(this.endTime.getMinutes());
			this.recuurenceObjEndDateAutomatic.speciality.no_of_doctors = parseInt(
				this.myForm.get('noOfDoctors').value,
			);
			if (this.postObjAutomatic.speciality.no_of_doctors === 0) {
				this.toastrService.error('kindly enter  atleast one number of Provider ', 'Error');
				this.isDisableSaveBtn=false;
				return;
			}
			this.recuurenceObjEndDateAutomatic.speciality.speciality_id = parseInt(
				this.myForm.get('speciality').value,
			);
			this.recuurenceObjEndDateAutomatic.speciality.facility_location_id = parseInt(
				this.myForm.get('clinicname').value,
			);

			this.recuurenceObjEndDateAutomatic.doctor_method = 'automatic';
			this.recuurenceObjEndDateAutomatic.doctor_method_id=doctor_method_id
			this.recuurenceObjEndDateAutomatic.timeZone = stdTimezoneOffset();
			this.recuurenceObjEndDateAutomatic.recurrence.startDate = startDate;
			this.recuurenceObjEndDateAutomatic.recurrence.endDate = date;
			this.recuurenceObjEndDateAutomatic.recurrence.endDate.setHours(23);
			this.recuurenceObjEndDateAutomatic.recurrence.endDate.setMinutes(59);
			this.recuurenceObjEndDateAutomatic.recurrence.endDate.setSeconds(59);
			this.recuurenceObjEndDateAutomatic.recurrence.endDate = convertDateTimeForSending(
				this.storageData,
				this.recuurenceObjEndDateAutomatic.recurrence.endDate,
			);
			this.recuurenceObjEndDateAutomatic.speciality.end_date_for_recurrence = changeDateFormat(this.recuurenceObjEndDateAutomatic.recurrence.endDate);

			this.recuurenceObjEndDateAutomatic.recurrence.endingCriteria =parseInt(this.myForm.get(
				'dailyMontlyWeeklyOpt',
			).value);
			this.recuurenceObjEndDateAutomatic.speciality.recurrence_ending_criteria_id =parseInt(this.myForm.get(
				'dailyMontlyWeeklyOpt',
			).value);
			if (
				this.recuurenceObjEndDateAutomatic.recurrence.endingCriteria === RecurrenceRepeatOptionEnum.Weekly ||
				this.recuurenceObjEndDateAutomatic.recurrence.endingCriteria === RecurrenceRepeatOptionEnum.Monthly
			) {
				if (this.dayListArray.length === 0) {
					this.isWeekError = false;
					this.isDisableSaveBtn=false;
					return;
				} else {
					this.isWeekError = true;
				}
			} else {
				this.dayListArray = [];
			}
			if (this.dayListArray.length == 0) {
				delete this.recuurenceObjEndDateAutomatic.recurrence.daysList;
			} else {
				this.recuurenceObjEndDateAutomatic.speciality.days = this.dayListArray.map((map) =>
					parseInt(map),
				);
			}
		

			this.requestService
				.sendRequest(
					AssignSpecialityUrlsEnum.AddSpecialityAvailble,
					'POST',
					REQUEST_SERVERS.schedulerApiUrl1,
					this.recuurenceObjEndDateAutomatic,
				)
				.subscribe(
					(resp: HttpSuccessResponse) => {
						this.isDisableSaveBtn=false;
						if(resp.message=="success")
						{
							this.toastrService.success("Provider has been assigned successfully",'Success');
						}
						else
						{
							this.toastrService.success(
								// 'Providers are not available for complete Assignment',
								// 'Assignment Added successfully but Providers are not available for complete Assignment',
								// 'Provider has been assigned successfully ',
								resp.message,
								'Success',
							);
						}
						
						this.activeModal.close();
						this._subjectService.refreshUpdate('add');
					},
					(error) => {
						this.isDisableSaveBtn=false;
					},
				);
		} else if (
			this.doctor_method_slug_Control.value==AssignProviderMethodSlug.automatic_assign && 
			this.recurrence_control.value==true && this.range_recurrance_control.value==true && 
			this.range_recurrance_option_control.value==RangeRecurrenceOption.EndAfter 
		) {
			this.recuurenceObjEndAfterWeeksAutomatic.speciality.start_date = startDate;
			this.recuurenceObjEndAfterWeeksAutomatic.speciality.end_date = endDate;
			this.recuurenceObjEndAfterWeeksAutomatic.speciality.no_of_doctors = parseInt(
				this.myForm.get('noOfDoctors').value,
			);
			if (this.postObjAutomatic.speciality.no_of_doctors === 0) {
				this.toastrService.error('kindly enter  atleast one number of Provider ', 'Error');
				this.isDisableSaveBtn=false;
				return;
			}
			this.recuurenceObjEndAfterWeeksAutomatic.speciality.speciality_id = parseInt(
				this.myForm.get('speciality').value,
			);
			this.recuurenceObjEndAfterWeeksAutomatic.speciality.facility_location_id = parseInt(
				this.myForm.get('clinicname').value,
			);
			this.recuurenceObjEndAfterWeeksAutomatic.doctor_method = 'automatic';
			this.recuurenceObjEndAfterWeeksAutomatic.doctor_method_id=doctor_method_id
			this.recuurenceObjEndAfterWeeksAutomatic.timeZone = stdTimezoneOffset();
			this.recuurenceObjEndAfterWeeksAutomatic.recurrence.startDate = startDate;
			this.recuurenceObjEndAfterWeeksAutomatic.recurrence.endAfterOccurences = this.myForm.get(
				'noOfOccurence',
			).value;
			this.recuurenceObjEndAfterWeeksAutomatic.speciality.number_of_entries = this.myForm.get(
				'noOfOccurence',
			).value;
			this.recuurenceObjEndAfterWeeksAutomatic.speciality.recurrence_ending_criteria_id =parseInt(this.myForm.get(
				'dailyMontlyWeeklyOpt',
			).value);

			this.recuurenceObjEndAfterWeeksAutomatic.speciality.end_after_occurences = this.myForm.get(
				'noOfOccurence',
			).value;
			this.recuurenceObjEndAfterWeeksAutomatic.recurrence.endingCriteria = parseInt( this.myForm.get(
				'dailyMontlyWeeklyOpt',
			).value);

			if (
				this.recuurenceObjEndAfterWeeksAutomatic.recurrence.endingCriteria === RecurrenceRepeatOptionEnum.Weekly||
				this.recuurenceObjEndAfterWeeksAutomatic.recurrence.endingCriteria === RecurrenceRepeatOptionEnum.Monthly
			) {
				this.recuurenceObjEndAfterWeeksAutomatic.speciality.ending_criteria = this.recuurenceObjEndAfterWeeksAutomatic.recurrence.endingCriteria;
				this.recuurenceObjEndAfterWeeksAutomatic.speciality.number_of_entries = this.myForm.get(
					'noOfOccurence',
				).value;

				console.log(this.recuurenceObjEndAfterWeeksAutomatic);
				if (this.dayListArray.length === 0) {
					this.isWeekError = false;
					this.isDisableSaveBtn=false;
					return;
				} else {
					this.isWeekError = true;
				}
			} else {
				this.dayListArray = [];
			}
			if (this.dayListArray.length == 0) {
				delete this.recuurenceObjEndAfterWeeksAutomatic.recurrence.daysList;
			} else {
				this.recuurenceObjEndAfterWeeksAutomatic.speciality.days = this.dayListArray.map((day) =>
					parseInt(day),
				);
			}

			this.requestService
				.sendRequest(
					AssignSpecialityUrlsEnum.AddSpecialityAvailble,
					'POST',
					REQUEST_SERVERS.schedulerApiUrl1,
					this.recuurenceObjEndAfterWeeksAutomatic,
				)
				.subscribe(
					(resp: HttpSuccessResponse) => {
						this.isDisableSaveBtn=false;
						if(resp.message=="success")
						{
							this.toastrService.success("Provider has been assigned successfully",'Success');
						}
						else
						{
							this.toastrService.success(
								// 'Providers are not available for complete Assignment',
								// 'Provider has been assigned successfully',
								resp.message,
								'Success',
							);
						}
						
						this.activeModal.close();
						this._subjectService.refreshUpdate('add');
					},
					(error) => {
						this.isDisableSaveBtn=false;
					},
				);
		} else if (
			this.doctor_method_slug_Control.value==AssignProviderMethodSlug.do_not_assign&&
			this.range_recurrance_control.value==true && this.range_recurrance_option_control.value==RangeRecurrenceOption.EndBy 	
		) {
			this.recuurenceObjEndDateNone.speciality.start_date = startDate;
			this.recuurenceObjEndDateNone.speciality.end_date = endDate;

			if (this.endOccurenceEndDate == null) {
				this.toastrService.error('Choose other option or choose end occurence date', 'Error');
				this.isDisableSaveBtn=false;
				return;
			}
			if ( WithoutTime( this.endOccurenceEndDate) <WithoutTime(this.minDate) ) {
				this.toastrService.error('Pick end date with respect to start date', 'Error');
				this.isDisableSaveBtn=false;
				return;
			}
			let date = new Date(this.endOccurenceEndDate);
			date.setHours(this.endTime.getHours());
			date.setMinutes(this.endTime.getMinutes());
			this.recuurenceObjEndDateNone.speciality.no_of_doctors = parseInt(
				this.myForm.get('noOfDoctors').value,
			);
			if (this.postObjNone.speciality.no_of_doctors === 0) {
				this.toastrService.error('kindly enter  atleast one number of Provider ', 'Error');
				this.isDisableSaveBtn=false;
				return;
			}
			this.recuurenceObjEndDateNone.speciality.speciality_id = parseInt(
				this.myForm.get('speciality').value,
			);
			this.recuurenceObjEndDateNone.speciality.facility_location_id = parseInt(
				this.myForm.get('clinicname').value,
			);
			this.recuurenceObjEndDateNone.doctor_method ='';
			this.recuurenceObjEndDateNone.doctor_method_id=doctor_method_id
			this.recuurenceObjEndDateNone.timeZone = stdTimezoneOffset();
			this.recuurenceObjEndDateNone.recurrence.startDate = startDate;
			this.recuurenceObjEndDateNone.recurrence.endDate = date;
			this.recuurenceObjEndDateNone.recurrence.endDate.setHours(23);
			this.recuurenceObjEndDateNone.recurrence.endDate.setMinutes(59);
			this.recuurenceObjEndDateNone.recurrence.endDate.setSeconds(59);
			this.recuurenceObjEndDateNone.recurrence.endDate = convertDateTimeForSending(
				this.storageData,
				this.recuurenceObjEndDateNone.recurrence.endDate,
			);

			this.recuurenceObjEndDateNone.speciality.end_date_for_recurrence = changeDateFormat(this.recuurenceObjEndDateNone.recurrence.endDate);
			this.recuurenceObjEndDateNone.speciality.start_date = startDate;
			// this.recuurenceObjEndDateNone.speciality.number_of_entries = this.myForm.get(
			// 	'noOfOccurence',
			// ).value;

			this.recuurenceObjEndDateNone.recurrence.endingCriteria = parseInt(this.myForm.get(
				'dailyMontlyWeeklyOpt',
			).value);
			this.recuurenceObjEndDateNone.speciality.recurrence_ending_criteria_id =parseInt(this.myForm.get(
				'dailyMontlyWeeklyOpt',
			).value);
			this.recuurenceObjEndDateNone.speciality.ending_criteria = this.recuurenceObjEndDateNone.recurrence.endingCriteria;
			if (
				this.recuurenceObjEndDateNone.recurrence.endingCriteria === RecurrenceRepeatOptionEnum.Weekly ||
				this.recuurenceObjEndDateNone.recurrence.endingCriteria === RecurrenceRepeatOptionEnum.Monthly
			) {
				if (this.dayListArray.length === 0) {
					this.isWeekError = false;
					this.isDisableSaveBtn=false;
					return;
				} else {
					this.isWeekError = true;
				}
			} else {
				this.dayListArray = [];
			}
			if (this.dayListArray.length == 0) {
				delete this.recuurenceObjEndDateNone.recurrence.daysList;
			} else {
				this.recuurenceObjEndDateNone.recurrence.daysList = this.dayListArray;
				this.recuurenceObjEndDateNone.speciality.days = this.dayListArray.map((days) =>
					parseInt(days),
				);
			}
			// this.recuurenceObjEndDateNone = removeEmptyKeysFromObject(this.recuurenceObjEndDateNone);
			this.requestService
				.sendRequest(
					AssignSpecialityUrlsEnum.AddSpecialityAvailble,
					'POST',
					REQUEST_SERVERS.schedulerApiUrl1,
					this.recuurenceObjEndDateNone,
				)
				.subscribe(
					(resp: HttpSuccessResponse) => {
						this.isDisableSaveBtn=false;
						if(resp.message=="success")
						{
							this.toastrService.success(
								// 'Providers are not available for complete Assignment',
								'Assignment Added successfully but Providers are not available for complete Assignment',
								
								'Success'
							);
						}
						else
						{
							this.toastrService.success(
								// 'Providers are not available for complete Assignment',
								// 'Assignment Added successfully but Providers are not available for complete Assignment',
								resp.message,
								'Success',
							);
						}
						
						this.activeModal.close();
						this._subjectService.refreshUpdate('add');
					},
					(error) => {
						this.isDisableSaveBtn=false;
					},
				);
		} else if (
			this.doctor_method_slug_Control.value==AssignProviderMethodSlug.do_not_assign&&
			this.range_recurrance_control.value==true &&
			this.range_recurrance_option_control.value==RangeRecurrenceOption.EndAfter 
		) {
			this.recuurenceObjEndAfterWeeksNone.speciality.start_date = startDate;
			this.recuurenceObjEndAfterWeeksNone.speciality.end_date = endDate;
			let endAfter = this.myForm.get('noOfOccurence').value;
			this.recuurenceObjEndAfterWeeksNone.speciality.no_of_doctors = parseInt(
				this.myForm.get('noOfDoctors').value,
			);
			this.recuurenceObjEndAfterWeeksNone.speciality;
			if (this.recuurenceObjEndAfterWeeksNone.speciality.no_of_doctors === 0) {
				this.toastrService.error('kindly enter  atleast one number of Provider ', 'Error');
				this.isDisableSaveBtn=false;
				return;
			}
			this.recuurenceObjEndAfterWeeksNone.speciality.speciality_id = parseInt(
				this.myForm.get('speciality').value,
			);
			this.recuurenceObjEndAfterWeeksNone.speciality.facility_location_id = parseInt(
				this.myForm.get('clinicname').value,
			);
			this.recuurenceObjEndAfterWeeksNone.doctor_method = '';
			this.recuurenceObjEndAfterWeeksNone.doctor_method_id=doctor_method_id
			this.recuurenceObjEndAfterWeeksNone.timeZone = stdTimezoneOffset();
			this.recuurenceObjEndAfterWeeksNone.recurrence.startDate = startDate;
			this.recuurenceObjEndAfterWeeksNone.speciality.start_date = startDate;
			this.recuurenceObjEndAfterWeeksNone.speciality.number_of_entries = this.recuurenceObjEndAfterWeeksNone.recurrence.endAfterOccurences;
			this.recuurenceObjEndAfterWeeksNone.speciality.end_after_occurences = endAfter

			this.recuurenceObjEndAfterWeeksNone.recurrence.endingCriteria =parseInt( this.myForm.get(
				'dailyMontlyWeeklyOpt',
			).value);
			this.recuurenceObjEndAfterWeeksNone.speciality.recurrence_ending_criteria_id =parseInt(this.myForm.get(
				'dailyMontlyWeeklyOpt',
			).value);
			if (
				this.recuurenceObjEndAfterWeeksNone.recurrence.endingCriteria === RecurrenceRepeatOptionEnum.Weekly ||
				this.recuurenceObjEndAfterWeeksNone.recurrence.endingCriteria === RecurrenceRepeatOptionEnum.Monthly
			) {
				if (this.dayListArray.length === 0) {
					this.isWeekError = false;
					this.isDisableSaveBtn=false;
					return;
				} else {
					this.isWeekError = true;
				}
			} else {
				this.dayListArray = [];
			}
			if (this.dayListArray.length == 0) {
				delete this.recuurenceObjEndAfterWeeksNone.recurrence.daysList;
			} else {
				this.recuurenceObjEndAfterWeeksNone.recurrence.daysList = this.dayListArray;
				this.recuurenceObjEndAfterWeeksNone.speciality.days = this.dayListArray.map((data) =>
					parseInt(data),
				);
			}
			this.requestService
				.sendRequest(
					AssignSpecialityUrlsEnum.AddSpecialityAvailble,
					'POST',
					REQUEST_SERVERS.schedulerApiUrl1,
					this.recuurenceObjEndAfterWeeksNone,
				)
				.subscribe(
					(resp: HttpSuccessResponse) => {
						this.isDisableSaveBtn=false;
						if(resp.message=="success")
						{
							this.toastrService.success(
								// 'Providers are not available for complete Assignment',
								'Assignment Added successfully but Providers are not available for complete Assignment',
								
								'Success'
							);
						}
						else
						{
							this.toastrService.success(
								// 'Providers are not available for complete Assignment',
								// 'Assignment Added successfully but Providers are not available for complete Assignment',
								resp.message,
								'Success',
							);
						}
						
						this.activeModal.close();
						this._subjectService.refreshUpdate('add');
					},
					(error) => {
						this.isDisableSaveBtn=false;
					},
				);
		} else if (
			this.recurrence_control.value==true && 
			this.range_recurrance_control.value==true &&
			!this.range_recurrance_option_control.value
		) {
			this.isDisableSaveBtn=false;

			this.assignDocError = true;
		} 
		else {
			this.isDisableSaveBtn=false;
			this.assignDocError = true;
		}
	}
	Cancel()
	{
		this.activeModal.close();
		if(this.isAssignmentDeleted)
		{
			this._subjectService.refreshUpdate('refresh');

		}
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
export function removeEmptyKeysFromObject(obj) {
	Object.keys(obj).forEach((key) => {
		console.log(Object.prototype.toString.call(obj[key]));
		if (
			Object.prototype.toString.call(obj[key]) === '[object Date]' &&
			(obj[key].toString().length === 0 || obj[key].toString() === 'Invalid Date')
		) {
			delete obj[key];
		} else if (obj[key] && typeof obj[key] === 'object') {
			removeEmptyKeysFromObject(obj[key]);
		} else if (obj[key] && Array.isArray(obj[key]) && obj[key].length == 0) {
			removeEmptyKeysFromObject(obj[key]);
		} else if (obj[key] == null || obj[key] === '' || obj[key] === undefined) {
			delete obj[key];
		}
		if (
			obj[key] &&
			typeof obj[key] === 'object' &&
			Object.keys(obj[key]).length === 0 &&
			Object.prototype.toString.call(obj[key]) !== '[object Date]' &&
			Object.prototype.toString.call(obj[key]) !== '[object File]'
		) {
			delete obj[key];
		}
	});
	return obj;
}
