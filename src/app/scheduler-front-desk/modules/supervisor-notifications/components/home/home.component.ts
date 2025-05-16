import { DatePipeFormatService } from './../../../../../shared/services/datePipe-format.service';
import { map } from 'rxjs/operators';
import { AfterContentInit, Component, OnChanges, OnInit } from '@angular/core';
import { SupervisorNotificationsService } from '../../supervisor-notifications.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CalendarEventTimesChangedEvent } from '../../utils/my-calendar/src';
import { Subject, concat } from 'rxjs';
import { Router } from '@angular/router';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { SchedulerSupervisorService } from '../../../../scheduler-supervisor.service';
import { SubjectService } from "../../subject.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from 'ngx-toastr';
import { AclService } from '@appDir/shared/services/acl.service';
import { DoctorDescriptionModalComponent } from "../../modals/doctor-description-modal/doctor-description-modal.component";
import { StorageData, HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { SupervisorNotificationsUrlsEnum } from '../../supervisor-notifications-urls-enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { convertDateTimeForRetrieving, convertDateTimeForSending } from '@appDir/shared/utils/utils.helpers';

@Component({
	selector: 'app-supervisor-notification-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})
export class SupervisorNotificationHomeComponent extends PermissionComponent implements OnInit {
	public checkedClinics: any = [];
	public eventShowCalendar: any;
	public viewDate: Date = new Date();
	public model: any;
	public refresh: Subject<any> = new Subject();
	public myForm: FormGroup;
	public weekday = new Array(5)
	public notification: any=[];
	public CurrentNotification: any;
	public CurrentNotificationDetail: any;
	public myDatePickerOptions: any = { dateFormat: 'dd.mm.yyyy', inline: true, height: '100%', selectorWidth: '100%', firstDayOfWeek: 'su',sunHighlight:false };
	public isShowCalendar: boolean = false;
	public eventShowRecurrence: any;
	public isShowRecurrence: boolean = false;
	public view: string = 'week';
	public events = []
	public startDate: Date;
	public endDate: Date;
	public myName: any;
	throttle = 300;
  	scrollDistance = 1;
  	scrollUpDistance = 2;
 	direction = "";
	presentPage:number=1;
	infiniteScrollDisabled :boolean = false;

	constructor(public notificationService: SupervisorNotificationsService,
		private _SupervisorService: SchedulerSupervisorService,
		public aclService: AclService,
		public router: Router,
		private subjectService : SubjectService,
		protected requestService: RequestService,
		private storageData: StorageData,
		public subject: SubjectService,
		private formBuilder: FormBuilder,
		private toastrService: ToastrService,
		public datePipeService:DatePipeFormatService,
		public openModal: NgbModal, ) {
		super(aclService, router);
		this.weekday[0] = [{ 'name': 'Sun', isColor: 'false' }];
		this.weekday[1] = [{ 'name': 'Mon', isColor: 'false' }];
		this.weekday[2] = [{ 'name': 'Tue', isColor: 'false' }];
		this.weekday[3] = [{ 'name': 'Wed', isColor: 'false' }];
		this.weekday[4] = [{ 'name': 'Thur', isColor: 'false' }];
		this.weekday[5] = [{ 'name': 'Fri', isColor: 'false' }];
		this.weekday[6] = [{ 'name': 'Sat', isColor: 'false' }];
		let currentDate = new Date();
		this.model = { date: { year: currentDate.getFullYear(), month: currentDate.getMonth() + 1, day: currentDate.getDate() } }
		this.viewDate = new Date();
		
	}
	

	ngOnInit() {
		
		this.subjectService.apiUpdate.subscribe((data) =>
		{
			if (data == true)
			{
				this.requestService
			.sendRequest(
				SupervisorNotificationsUrlsEnum.getallUnavailableDoctorNotf,
				'POST',
				REQUEST_SERVERS.schedulerApiUrl1,
				{
					'user_id': this.storageData.getUserId(),
					"facility_location_ids": this.storageData.getFacilityLocations()
				}
			).subscribe(
				(data: HttpSuccessResponse) => {
					let tempNotification = data.result.data
			
					for (var x = 0; x < tempNotification.length; x++) {
						if(tempNotification[x].id == this.CurrentNotification.id)
						{
							if (tempNotification[x].affectedClinics) {
								for (var j = 0; j < tempNotification[x].affectedClinics.length; j++) {
									tempNotification[x].affectedClinics[j]["isChecked"] = this.CurrentNotification.affectedClinics[j]["isChecked"];
								}
								this.CurrentNotification.affectedClinics = tempNotification[x].affectedClinics;
								break;
							}
						}
					}
				});
			}
		})
		this.myName = this.storageData.getBasicInfo()
		this.subject.castUpdate.subscribe(res => {
			if(res=="accordin")
			{
				this.loadMoreAssignmnets()

			}
			else if(res=="currentnotificationdetail")
			{
				this.getNotificationDetails(this.CurrentNotification);
				this.checkedClinics=[];
			}
		})
		this.getAllUnavailability(this.presentPage);
	}

	scrollUpNotification(event) 
	{
		  
	}

	   scrollDownNotification(event) 
	   {
		   this.presentPage = this.presentPage + 1;
		   this.infiniteScrollDisabled = false;
		   this.loadMoreNotification(this.presentPage);
		}
	
		public getAllUnavailability(page=1)
		{
		this.requestService
			.sendRequest(
				SupervisorNotificationsUrlsEnum.getallUnavailableDoctorNotf,
				'POST',
				REQUEST_SERVERS.schedulerApiUrl1,
				{
					
					'user_id': this.storageData.getUserId(),
					"facility_location_ids": this.storageData.getFacilityLocations(),
					per_page:10,
					page:page
				}
			).subscribe(
				(data: HttpSuccessResponse) => {
					if (data.result.data.docs.length == 0) {
						this.toastrService.error('No  New Notification Found', 'Error')
					}
					else {
						this.notification = JSON.parse(JSON.stringify(data.result.data.docs));
						this.notification.map(noti=>{
							this.manupulateNotificationResponse(noti);
						})
						
						this.CurrentNotification = this.notification[0];
						this.getNotificationDetails(this.CurrentNotification);
						this.viewDate = new Date(this.CurrentNotification.start_date)
					}
				});
		this.myForm = this.formBuilder.group({
			myDate: [null, Validators.required]
		});
	}

	manupulateNotificationResponse(notification:any)
	{
			if (notification && notification.doctor && notification.doctor.userBasicInfo && 
				 notification.doctor.userBasicInfo.profile_pic_url == null ||
				 notification && notification.doctor && notification.doctor.userBasicInfo && 
				 notification.doctor.userBasicInfo.profile_pic_url == undefined) {
				notification.doctor.userBasicInfo.profile_pic_url = this.defaultDoctorImageUrl;
			}
				notification.start_date = convertDateTimeForRetrieving(this.storageData, new Date(notification.start_date))
				notification.end_date = convertDateTimeForRetrieving(this.storageData, new Date(notification.end_date))
				notification["time_stamp"] = convertDateTimeForRetrieving(this.storageData, new Date(notification.created_at * 1000))
				
			if (notification.affected_facilities) {
				for (var j = 0; j < notification.affected_facilities.length; j++) {
					notification.affected_facilities[j]["isChecked"] = false;
				}
			}
		
	}

	loadMoreNotification(page=1)
	{
		this.requestService
			.sendRequest(
				SupervisorNotificationsUrlsEnum.getallUnavailableDoctorNotf,
				'POST',
				REQUEST_SERVERS.schedulerApiUrl1,
				{	
					'user_id': this.storageData.getUserId(),
					"facility_location_ids": this.storageData.getFacilityLocations(),
					per_page:10,
					page:page
				}
			).subscribe(
				(data: HttpSuccessResponse) => {
					if (data.result.data.docs.length == 0 && data.result.data.is_last) {
						this.toastrService.error('No New Notification Found', 'Error')
					}
					else {
						let notifications = JSON.parse(JSON.stringify(data.result.data.docs))
						notifications.map(noti=>{
							this.manupulateNotificationResponse(noti);
						})
						
					this.notification=this.notification.concat(notifications)	
					}
				});
	}
	public onDateChanged(event: any) {
		let currentDate = event.date.year + '-' + event.date.month + '-' + event.date.day;
		let tempDate = new Date(event.jsdate);
		this.viewDate = tempDate
		this.loadMoreAssignmnets()
	}
	setDateMat(value) {

		this.viewDate = new Date(value.toDate());
		this.loadMoreAssignmnets()

	  }
	public sendMessage(msg) {
	}
	public showCalendar(e) {
		this.events = [];
		this.eventShowCalendar = e;
		this.viewDate = new Date(this.CurrentNotificationDetail.start_date)
		// this.setDate(this.viewDate)
		this.model = { date: { year: this.viewDate.getFullYear(), month: this.viewDate.getMonth() + 1, day: this.viewDate.getDate() } }
		// this.isShowCalendar = !this.isShowCalendar
		// this.isShowCalendar = e.target.checked
		this.startDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1)
		this.endDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 2, 0)
		if (this.checkedClinics.length != 0) {
			this.getAvailableDoctorAssignment();
		}
		else
		{
			this.viewDate = new Date(this.viewDate)
			this.subject.refresh(this.events)
		}
	}
	public openNotification(noti) {
		// if (noti.recurrence && noti.recurrence.daysList) {
		// 	for (var i = 0; i < noti.recurrence.daysList.length; i++) {
		// 		this.weekday[noti.recurrence.daysList[i]][0].isColor = true;
		// 	}
		// }
		// if (this.CurrentNotification.affected_facilities) {
		// 	for (let i = 0; i < this.CurrentNotification.affected_facilities.length; i++) {
		// 		this.CurrentNotification.affected_facilities[i].isChecked = false;
		// 	}
		// }
		// this.checkedClinics = [];
		// if (this.eventShowCalendar) {
		// 	this.eventShowCalendar.target.checked = false
		// }
		// if (this.eventShowRecurrence) {
		// 	this.isShowRecurrence = false
		// 	this.eventShowRecurrence.target.checked = false
		// }
		this.CurrentNotification = noti;
		this.getNotificationDetails(this.CurrentNotification);
		this.events = [];
		this.viewDate = new Date(this.CurrentNotification.start_date)
		this.isShowCalendar = false;
		this.checkedClinics=[];
		// this.CurrentNotification.check = true
	}

	getNotificationDetails(currentNotification:any)
	{
		this.requestService
			.sendRequest(
				SupervisorNotificationsUrlsEnum.getUnavailableDoctorNotfDetail,
				'POST',
				REQUEST_SERVERS.schedulerApiUrl1,
				{	
					"facility_location_ids": this.storageData.getFacilityLocations(),
					"unavailabile_doctor_id":currentNotification.id
				}
			).subscribe(
				(data: HttpSuccessResponse) => {
					if (data.result.data) {
						this.CurrentNotificationDetail=data.result.data;
						this.manupulateNotificationResponse(this.CurrentNotificationDetail)
						
					}
					else {
						this.CurrentNotificationDetail=null	
					}
				});
	}
	public Approve() {
		this.requestService
			.sendRequest(
				SupervisorNotificationsUrlsEnum.approveDeclineNotification,
				'PUT',
				REQUEST_SERVERS.schedulerApiUrl1,
				{
					"approval_status": 1,
					"id": this.CurrentNotification.id,
				}
			).subscribe(
				(data: HttpSuccessResponse) => {
					data = JSON.parse(JSON.stringify(data));
					this.CurrentNotification.approved_by= data.result.data && data.result.data.approved_by;
					this.CurrentNotificationDetail.approved_by= data.result.data && data.result.data.approved_by;
					this.CurrentNotification.approval_status = 1;
					this.CurrentNotificationDetail.approval_status = 1;
					this.toastrService.success("Unavailability Approved Successfully",'Success');
				},
				error=>{
					this.toastrService.error(  error.error.message,'Error');
				})
	}
	public Decline() {
		this.requestService
			.sendRequest(
				SupervisorNotificationsUrlsEnum.approveDeclineNotification,
				'PUT',
				REQUEST_SERVERS.schedulerApiUrl1,
				{
					"approval_status": 0,
					"id": this.CurrentNotification.id,
				}
			).subscribe(
				(data: HttpSuccessResponse) => {
					data = JSON.parse(JSON.stringify(data))
					this.CurrentNotification.approved_by= data.result.data && data.result.data.approved_by;
					this.CurrentNotificationDetail.approved_by= data.result.data && data.result.data.approved_by;
					this.CurrentNotification.approval_status = 0;
					this.CurrentNotificationDetail.approval_status = 0;
					this.toastrService.success("Unavailability Declined Successfully",'Success');

			},
			error=>{
				//Rendering error only in interceptor
			})
	}
	public ShowMore(subject, description) {
		this._SupervisorService.subject = subject;
		this._SupervisorService.description = description;
		const activeModal = this.openModal.open(DoctorDescriptionModalComponent, { backdrop: 'static',
		keyboard: false });
	}
	public eventTimesChanged({
		event,
		newStart,
		newEnd
	}: CalendarEventTimesChangedEvent): void {
		event.start = newStart;
		event.end = newEnd;
		this.loadMoreAssignmnets()
		this.refresh.next(1);
	}
	public clinicCheck(affected_facility) {
		if (!affected_facility.isChecked) {
			this.checkedClinics.push(affected_facility.facility_location_id)
			affected_facility.isChecked = true;
			if (this.isShowCalendar) {
				this.startDate = convertDateTimeForSending(this.storageData, new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1));
				this.endDate = convertDateTimeForSending(this.storageData, new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 2, 0));
				this.getAvailableDoctorAssignment()
			}
		}
		else {
			let index = this.checkedClinics.indexOf(affected_facility.facility_location_id);
			if (index !== -1) {
				this.checkedClinics.splice(index, 1);
			}
			affected_facility.isChecked = false;
			for (let i = 0; i < this.events.length; i++) {
				if (this.events[i].clinicId === affected_facility.facility_location_id) {
					this.events.splice(i, 1)
					i--;
				}
			}
			this.viewDate = new Date(this.viewDate)
			this.subject.refresh(this.events)
		}
		this.events = this.events;
	}
	public setDate(date): void {
		this.myForm.patchValue({
			myDate: {
				date: {
					year: date.getFullYear(),
					month: date.getMonth() + 1,
					day: date.getDate()
				}
			}
		});
		this.loadMoreAssignmnets()
	}
	public loadMoreAssignmnets() {
		this.startDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1)
		this.endDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 2, 0)
		this.events = [];
		if (this.CurrentNotification && this.checkedClinics.length != 0) {
			this.getAvailableDoctorAssignment();
		}
	}
	getAvailableDoctorAssignment()
	{
		this.requestService
		.sendRequest(
			SupervisorNotificationsUrlsEnum.getAvailableDoctorAssignment,
			'POST',
			REQUEST_SERVERS.schedulerApiUrl1,
			{
				// user_id:this.storageData.getUserId(),
				doctor_ids: [this.CurrentNotificationDetail.doctor_id],
				facility_location_ids: this.checkedClinics,
				end_date:convertDateTimeForSending(this.storageData, this.CurrentNotificationDetail.end_date),
				start_date: convertDateTimeForSending(this.storageData, this.CurrentNotificationDetail.start_date),
			},

		).subscribe(
			(response: HttpSuccessResponse) => {
				this.events = [];
				let allEvents = response.result.data;
				if (allEvents.assignments) {
					for (var e = 0; e < allEvents.assignments.length; e++) {
						debugger;
						let x = allEvents.assignments[e]
						x.dateList.map(datelist=>{
							let Unavailable_start_date_time=convertDateTimeForRetrieving(this.storageData, new Date(datelist.start_date));
							Unavailable_start_date_time= new Date(Unavailable_start_date_time.setHours(new Date(this.CurrentNotificationDetail.start_date).getHours()));
							Unavailable_start_date_time.setMinutes(new Date(this.CurrentNotificationDetail.start_date).getMinutes())
							Unavailable_start_date_time.setSeconds(new Date(this.CurrentNotificationDetail.start_date).getSeconds());
							let Unavailable_end_date_time=convertDateTimeForRetrieving(this.storageData, new Date(datelist.end_date));
							Unavailable_end_date_time= new Date(Unavailable_end_date_time.setHours(new Date(this.CurrentNotificationDetail.end_date).getHours()));
							Unavailable_end_date_time.setMinutes(new Date(this.CurrentNotificationDetail.end_date).getMinutes())
							Unavailable_end_date_time.setSeconds(new Date(this.CurrentNotificationDetail.end_date).getSeconds())
							datelist.start_date=convertDateTimeForRetrieving(this.storageData, new Date(datelist.start_date));
							datelist.end_date=convertDateTimeForRetrieving(this.storageData, new Date(datelist.end_date));
							this.events.push({
								is_appointment:(datelist.appointments && datelist.appointments.length>0)?true:false,
								unavailable_start_date:this.CurrentNotificationDetail.start_date,
								unavailable_end_date:this.CurrentNotificationDetail.end_date,
								unavailable_start_date_time:Unavailable_start_date_time,
								unavailable_end_date_time:Unavailable_end_date_time,
								dateList:x.dateList,
								doctor_id:x.doctor_id,
								spec_id: x.available_speciality_id,
								clinicId: x.facility_location_id,
								DocName: `${x.doctor.userBasicInfo.first_name} ${x.doctor.userBasicInfo.middle_name} ${x.doctor.userBasicInfo.last_name}`,
								id: x.id,
								title: x.facilityLocations.name,
								color: x.facility_color,
								// start: convertDateTimeForRetrieving(this.storageData, new Date(datelist.start_date)),
								// end: convertDateTimeForRetrieving(this.storageData, new Date(datelist.end_date)),
								start: new Date(datelist.start_date),
								end: convertDateTimeForSending(this.storageData, new Date(datelist.end_date)),
								draggable: false,
								isChecked: true,
								facilityLocations: x.facilityLocations
							});
						})
					}
					
					this.subject.refresh(this.events)
					this.viewDate = new Date(this.viewDate)
				}
				
			}, error => {
				this.events = [];
				this.subject.refresh(this.events)

			});
	}
	public showRecurrence(e) {
		this.eventShowRecurrence = e;
		this.isShowRecurrence = !this.isShowRecurrence
	}
}
