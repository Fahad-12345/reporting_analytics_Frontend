import { filter } from 'rxjs/operators';
import {
	ChangeDetectorRef,
	Component,
	EventEmitter,
	Input,
	Output,
	TemplateRef,
} from '@angular/core';
import { Router } from '@angular/router';

import {
	CalendarEvent,
	MonthViewDay,
} from 'calendar-utils';
import { ToastrService } from 'ngx-toastr';
import { PlacementArray } from 'positioning';

import {
	HttpSuccessResponse,
	StorageData,
} from '@appDir/pages/content-pages/login/user.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import {
	AssignDoctorUrlsEnum,
} from '@appDir/scheduler-front-desk/modules/assign-doctor/assign-doctor-urls-enum';
import { RequestService } from '@appDir/shared/services/request.service';
import {
	NgbModal,
	NgbPopover,
} from '@ng-bootstrap/ng-bootstrap';

import { SchedulerSupervisorService } from '../../../../../../../scheduler-supervisor.service';
import { AssignDoctorSubjectService } from '../../../../../assign-doctor-subject.service';
import { AccordianComponent } from '../../../../../modals/accordian/accordian.component';
import {
	AddDocAssignmentModalComponent,
} from '../../../../../modals/add-doc-assignment-modal/add-doc-assignment-modal.component';
import {
	UpdateDocAssignmentModalComponent,
} from '../../../../../modals/update-doc-assignment-modal/update-doc-assignment-modal.component';
import { SubjectService } from '../../../../../subject.service';
import { trackByEventId } from '../common/util';
import { CalendarMonthService } from './calendar-month.service';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { convert12, convertDateTimeForRetrieving } from '@appDir/shared/utils/utils.helpers';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { AclService } from '@appDir/shared/services/acl.service';
import { USERPERMISSIONS } from '@appDir/front-desk/UserPermissions';

@Component({
	selector: 'mwl-calendar-month-cell',
	templateUrl: 'calendar-month-cell.component.html',
	styleUrls: ['./calendar-month-view.scss'],
	host: {
		class: 'cal-cell cal-day-cell',
		'[class.cal-past]': 'day.isPast',
		'[class.cal-today]': 'day.isToday',
		'[class.cal-future]': 'day.isFuture',
		// '[class.cal-weekend]': 'day.isWeekend',// to color weekend red
		'[class.cal-in-month]': 'day.inMonth',
		'[class.cal-out-month]': '!day.inMonth',
		'[class.cal-has-events]': 'day.events.length > 0',
		'[class.cal-open]': 'day === openDay',
		'[class.cal-event-highlight]': '!!day.backgroundColor',
		'[style.backgroundColor]': 'day.backgroundColor',
	},
})
export class CalendarMonthCellComponent {
	trackByEventId = trackByEventId;

	public tempVar: number = 0;
	// original_Event=[]

	@Input() docAssign: any;

	@Input()
	selectCurrentDate: string;

	@Input()
	swaps: any;

	@Input()
	colorApp: any;

	@Input()
	clinicID: any;

	@Input()
	spec: any;
	@Input() specality_id: any;
	@Input() facility_location_id:any;

	@Input()
	day: MonthViewDay;

	@Input()
	openDay: MonthViewDay;

	@Input()
	locale: string;

	@Input()
	tooltipPlacement: PlacementArray;

	@Input()
	tooltipAppendToBody: boolean;

	@Input()
	customTemplate: TemplateRef<any>;

	@Input()
	tooltipTemplate: TemplateRef<any>;

	@Output()
	highlightDay: EventEmitter<any> = new EventEmitter();

	@Output()
	unhighlightDay: EventEmitter<any> = new EventEmitter();

	@Output()
	eventClicked: EventEmitter<{ event: CalendarEvent }> = new EventEmitter<{
		event: CalendarEvent;
	}>();

	currentUrl;
	speciality: boolean;
	disable: boolean = false;

	//To add delay in single and double click
	public timer: any;
	public delay: any;
	public preventSimpleClick: boolean = false;
	//

	//cell back color
	cellBackColor = 'white';
	singlClickStatus = false;
	//
	userPermissions = USERPERMISSIONS;

	constructor(
		private router: Router,
		public deleteModal: NgbModal,
		private customDiallogService: CustomDiallogService,
		public cdr: ChangeDetectorRef,
		protected requestService: RequestService,
		public AssignDoctorSubjectService: AssignDoctorSubjectService,
		public supervisorService: SchedulerSupervisorService,
		private storageData: StorageData,
		public subject: SubjectService,
		private toastrService: ToastrService,
		public addAssignmentService: NgbModal,
		public updateAssignmentService: NgbModal,
		public monthService: CalendarMonthService,
		public datePipeService:DatePipeFormatService,
		public aclService: AclService
	) {}
	ngOnInit() {}

	ngOnChanges(change) {
		this.returnItem(this.spec.id, this.day.date, this.clinicID, change);

		this.disableCheckspecId();
	}

	disableCheckspecId() {
	// this.disable = true;
		if (this.swaps && this.clinicID.id != 0) {
			this.disable = true;
			for (let r = 0; r < this.clinicID.faciltyTiming.length; r++) {
				// this.disable = true;
				if (this.clinicID.faciltyTiming[r].day_id === this.day.date.getDay()) {
					this.disable = false;
					break;
				}
			}
			let userTiming = [];
			if (!this.disable) {
				if (this.spec.id != 0) {
					this.disable = true;
					// for (let i = 0; i < this.spec.doctor.user_timings.length; i++) {
					// 	if (
					// 		this.clinicID.id === this.spec.doctor.user_timings[i].facility_location_id &&
					// 		this.spec.doctor.user_timings
					// 	) {
					// 		userTiming = this.spec.doctor.user_timings;
					// 		break;
					// 	}
					// }
					userTiming=this.spec.doctor.user_timings.filter(user_timing=>user_timing.facility_location_id==this.clinicID.id)
				}
				if (userTiming.length != 0) {
					for (let x = 0; x < userTiming.length; x++) {
						if (userTiming[x].day_id === this.day.date.getDay()) {
							this.disable = false;
							break;
						}
					}
				}
			}
		} else if (!this.swaps && this.spec.id != 0) {
			this.disable = true;
			for (let r = 0; r < this.spec.faciltyTiming.length; r++) {
				if (this.spec.faciltyTiming[r].day_id === this.day.date.getDay()) {
					this.disable = false;
					break;
				}
			}
			let userTiming = [];
			if (!this.disable) {
				if (this.clinicID.id != 0) {
					this.disable = true;
					// for (let i = 0; i < this.clinicID.doctor.user_timings.length; i++) {
					// 	if (
					// 		this.spec.id === this.clinicID.doctor.user_timings[i].facility_location_id &&
					// 		this.clinicID.doctor.user_timings
					// 	) {
					// 		userTiming = this.clinicID.doctor.user_timings;
					// 		break;
					// 	}
					// }
					userTiming=this.clinicID.doctor.user_timings.filter(user_timing=>user_timing.facility_location_id==this.spec.id)
				}
				if (userTiming.length != 0) {
					for (let x = 0; x < userTiming.length; x++) {
						if (userTiming[x].day_id === this.day.date.getDay()) {
							this.disable = false;
							break;
						}
					}
				}
			}
		}
		this.cdr.markForCheck();
		return this.disable;
	}
	public eventCount = 0;
	public eventOne: any;
	public eventTwo: any;
	// returnItemChange(specID, date, clinicID, change) {
	// 	this.CurrDateApp = [];
	// 	this.eventCount = 0;
	// 	if (change.docAssign && change.docAssign.currentValue != undefined) {
	// 		for (let event of change.docAssign.currentValue) {
	// 			if (
	// 				(event.specId == specID &&
	// 					event.clinicId == clinicID.id &&
	// 					this.swaps &&
	// 					date.toString().substring(0, 15) ==
	// 						new Date(event.startDate).toString().substring(0, 15)) ||
	// 				(event.specId == clinicID.id &&
	// 					event.clinicId == specID &&
	// 					!this.swaps &&
	// 					date.toString().substring(0, 15) ==
	// 						new Date(event.startDate).toString().substring(0, 15))
	// 			) {
	// 				if (date.getDay() == 4 || date.getDay() == 5 || date.getDay() == 6) {
	// 					event['placement'] = 'left';
	// 				} else {
	// 					event['placement'] = 'right';
	// 				}
	// 				if (this.eventCount == 0) {
	// 					this.eventOne = event;
	// 				} else if (this.eventCount == 1) {
	// 					this.eventTwo = event;
	// 				}
	// 				this.eventCount = this.eventCount + 1;
	// 				this.CurrDateApp.push(event);
	// 			}
	// 		}
	// 	}
	// 	this.docAssign = this.CurrDateApp;
	// 	this.cdr.markForCheck();
	// 	// console.log(this.CurrDateApp)

	// 	return this.CurrDateApp;
	// }

	CurrDateApp;
	returnItem(specID, date, clinicID, change) {
		this.CurrDateApp = [];
		this.eventCount = 0;
		// console.log(change.docAssign.currentValue)
		if (change.docAssign && change.docAssign.currentValue != undefined) {
			for (let e of change.docAssign.currentValue) {
				let event={...e}
				debugger;

				if (
					((event.doctor&&event.doctor.id == specID) &&
						event.clinicId == clinicID.id && 
						this.swaps && event && event.availableSpeciality && 
						event.availableSpeciality.speciality_id === this.specality_id &&
						// date.toString().substring(0, 15) ==new Date(event.start_date).toString().substring(0, 15)
						this.CheckeventOndateExist(event,date)
							) 
							||
					((event.doctor&&event.doctor.id == clinicID.id) &&
						event.clinicId == specID &&
						!this.swaps 
						&& event && event.availableSpeciality && 
						event.availableSpeciality.speciality_id === this.specality_id && 
						// date.toString().substring(0, 15) ==
						// 	new Date(event.start_date).toString().substring(0, 15)
						this.CheckeventOndateExist(event,date)
							)
				) {
					if (date.getDay() == 4 || date.getDay() == 5 || date.getDay() == 6) {
						event['placement'] = 'left';
					} else {
						event['placement'] = 'right';
					}
					if (this.eventCount == 0) {
						// alert("hello");
						this.eventOne=event;
						let _datelist=event.dateList&&event.dateList.find(datelist=>new Date(datelist.start_date).toString().substring(0, 15)==date.toString().substring(0, 15));
						// if(_datelist)
						// {
						// 	this.convertdateTimeToSelectedZone(_datelist)

						// }
						this.eventOne['current_dateList_event']=_datelist =_datelist? _datelist:null
						this.CurrDateApp.push(this.eventOne);

						// this.eventOne = event;
					} else if (this.eventCount == 1) {
						// alert("hello");
						this.eventTwo =event;
						let _datelist=event.dateList&&event.dateList.find(datelist=>new Date(datelist.start_date).toString().substring(0, 15)==date.toString().substring(0, 15));
						// if(_datelist)
						// {
						// 	this.convertdateTimeToSelectedZone(_datelist)

						// }
						this.eventTwo['current_dateList_event'] = _datelist? _datelist:null
						this.CurrDateApp.push(this.eventTwo);
						// this.eventTwo = event;
					}
					else if (this.eventCount >1) {
						// alert("hello");
						let _event =event;
						let _datelist=event.dateList&&event.dateList.find(datelist=>new Date(datelist.start_date).toString().substring(0, 15)==date.toString().substring(0, 15));
						// if(_datelist)
						// {
						// 	this.convertdateTimeToSelectedZone(_datelist)

						// }
						_event['current_dateList_event'] = _datelist? _datelist:null
						this.CurrDateApp.push(_event);
						// this.eventTwo = event;
					}
					this.eventCount = this.eventCount + 1;
					// this.CurrDateApp.push(event);
				} else if (
					(event.doctor&&event.doctor.id == specID &&
						this.swaps &&
						event.subject &&
						event.availableSpeciality.speciality_id === this.specality_id && 
						// date.toString().substring(0, 15) ==
						// 	new Date(event.start_date).toString().substring(0, 15)
						this.CheckeventOndateExist(event,date)
							) ||
					(event.doctor&&event.doctor.id == clinicID.id &&
						!this.swaps &&
						event.subject &&
						// date.toString().substring(0, 15) ==
						// 	new Date(event.start_date).toString().substring(0, 15)
						this.CheckeventOndateExist(event,date)
							)
				) {
					if (date.getDay() == 4 || date.getDay() == 5 || date.getDay() == 6) {
						event['placement'] = 'left';
					} else {
						event['placement'] = 'right';
					}
					if (this.eventCount == 0) {
						
						this.eventOne=event;
						let _datelist=event.dateList&&event.dateList.find(datelist=>new Date(datelist.start_date).toString().substring(0, 15)==date.toString().substring(0, 15));
						// if(_datelist)
						// {
						// 	this.convertdateTimeToSelectedZone(_datelist)

						// }
						this.eventOne['current_dateList_event'] =_datelist? _datelist:null
						this.CurrDateApp.push(this.eventOne);
						// this.eventOne = event;
					} else if (this.eventCount == 1) {
						
						this.eventTwo =event;
						let _datelist=event.dateList&&event.dateList.find(datelist=>new Date(datelist.start_date).toString().substring(0, 15)==date.toString().substring(0, 15));
						// if(_datelist)
						// {
						// 	this.convertdateTimeToSelectedZone(_datelist)

						// }
						this.eventTwo['current_dateList_event'] = _datelist? _datelist:null
						this.CurrDateApp.push(this.eventTwo);

						// this.eventTwo = event;
					}
					else if(this.eventCount >1)
					{
						let _event =event;
					
						let _datelist=event.dateList&&event.dateList.find(datelist=>new Date(datelist.start_date).toString().substring(0, 15)==date.toString().substring(0, 15));
						// if(_datelist)
						// {
						// 	this.convertdateTimeToSelectedZone(_datelist)

						// }
						_event['current_dateList_event']= _datelist? _datelist:null
						this.CurrDateApp.push(_event);
					}
					this.eventCount = this.eventCount + 1;
				
					// this.original_Event.push(event)
				}
			}
		}
		this.cdr.markForCheck();
	
		return this.CurrDateApp;
	}

	currentDateEventFromdateList(event:any, _date)
	{
		let currentDateEvent=event.dateList&&event.dateList.find(datelist=>new Date(datelist.start_date).toString().substring(0, 15)==new Date(_date).toString().substring(0, 15));
		let _newEvent=event
		return currentDateEvent
	}

	convertdateTimeToSelectedZone(_datelist)
	{
		let tempDateForStart = convertDateTimeForRetrieving(
			this.storageData,
			new Date(_datelist.start_date),
		);
		let tempDateForEnd = convertDateTimeForRetrieving(
			this.storageData,
			new Date(_datelist.end_date),
		);
		_datelist.start_date = convertDateTimeForRetrieving(
			this.storageData,
			new Date(_datelist.start_date),
		);
		_datelist.end_date = convertDateTimeForRetrieving(
			this.storageData,
			new Date(_datelist.end_date),
		);
		let startTime =
			('0' + tempDateForStart.getHours()).slice(-2) +
			':' +
			('0' + tempDateForStart.getMinutes()).slice(-2);
		let endTime =
			('0' + tempDateForEnd.getHours()).slice(-2) +
			':' +
			('0' + tempDateForEnd.getMinutes()).slice(-2);
		// specAssign[i]['start'] = tempDateForStart;
		// specAssign[i]['end'] = tempDateForEnd;
		startTime = convert12(startTime);
		endTime = convert12(endTime);
		_datelist['startTime'] = startTime;
		_datelist['endTime'] = endTime;
		return _datelist
	}


	CheckeventOndateExist(_event:any,date):boolean
	{
		let eventExist=_event.dateList&&_event.dateList.find(date_list=>new Date(date_list.start_date).toString().substring(0, 15)==date.toString().substring(0, 15))
		if(eventExist)
		{
			return true;
		}
		else
		{
			return false;
		}
	}

	public deleteEvent(e, spec, clinic) {
		debugger;
		if (this.supervisorService.popover) {
			this.supervisorService.popover.isOpen()
				? this.supervisorService.popover.close()
				: this.supervisorService.popover;
		}
		if (e.is_provider_assignment ==false) {
			this.customDiallogService.confirm('Delete','Are you sure you want to delete?','Yes','No')
		.then((confirmed) => {
			if (confirmed){
				this.requestService
						.sendRequest(
							AssignDoctorUrlsEnum.deleteDoctorAssignment,
							'DELETE',
							REQUEST_SERVERS.schedulerApiUrl1,
							{
								date_list_id:  e && e.current_dateList_event &&  e.current_dateList_event.id? e.current_dateList_event.id:null,
								available_doctor_id : e && e.current_dateList_event && e.current_dateList_event.available_doctor_id?
								e.current_dateList_event.available_doctor_id : null
							},
						)
						.subscribe((response: HttpSuccessResponse) => {
							this.AssignDoctorSubjectService.refreshUpdate('delete');
							this.toastrService.success('Provider Assignment Successfully Deleted', 'Success');
						});
			}else if(confirmed === false){
			}else{
			}
		})
		.catch();
		} else {
			var specialityName: any;
			var ClinicName: any;

			if (this.swaps) {
				this.subject.specialityForDeleteModal = spec.middle_name
					? spec.first_name + ' ' + spec.middle_name + ' ' + spec.last_name
					: spec.first_name + ' ' + spec.last_name;
				this.subject.clinicForDeleteModal = `${clinic.facility_name}-${clinic.name}`;
				this.subject.specialityNameForDeleteModal = spec.speciality;
			} else {
				this.subject.specialityNameForDeleteModal = clinic.speciality;
				this.subject.specialityForDeleteModal = clinic.middle_name
					? clinic.first_name + ' ' + clinic.middle_name + ' ' + clinic.last_name
					: clinic.first_name + ' ' + clinic.last_name;
				this.subject.clinicForDeleteModal = `${spec.facility_name?spec.facility_name+'-':''}${spec.name}`;
			}
			this.supervisorService.currentDeleteAppointment = e;

			this.subject.available_doctor_id_ForDeleteModal = e.current_dateList_event.available_doctor_id;
			this.subject.date_list_id_ForDeleteModal = e.current_dateList_event.id;
			this.supervisorService.clinicIdForAutoResolve = e.facility_location_id;
			debugger;
			const activeModal = this.deleteModal.open(AccordianComponent, {
				size: 'lg',
				backdrop: 'static',
				keyboard: true,
				

			});
		}
		this.subject.specialityQualifierNameForDeleteModal = e.availableSpeciality && e.availableSpeciality.speciality && e.availableSpeciality.speciality.qualifier;
		this.subject.clinicQualifierForDeleteModal = e.facilityLocations && e.facilityLocations.facility?   e.facilityLocations.facility.qualifier +'-'+e.facilityLocations.qualifier:'';

	}
	public closeMainEventPopover(event) {
		let e = document.getElementById('mainEventPopover');
		e.style.display = 'none';
		let arrow = (document.getElementsByClassName('popover')[0].className += ' display-none');
	}
	public openAssignmentModal() {
		//differentiate between single and double click
		this.preventSimpleClick = true;
		clearTimeout(this.timer);
		//

		this.subject.currentSelectedDateDoubleClicked = this.day.date.toString();

		if (!this.disable && this.aclService.hasPermission(this.userPermissions.scheduler_assignment_add_new)) {
			if (this.supervisorService.popover) {
				this.supervisorService.popover.isOpen()
					? this.supervisorService.popover.close()
					: this.supervisorService.popover;
			}
			if (this.spec['id'] != 0 && this.clinicID['id'] != 0) {
				if (this.swaps) {
					this.subject.spec = this.spec;
					this.subject.clinic = this.clinicID;
				} else {
					this.subject.spec = this.clinicID;
					this.subject.clinic = this.spec;
				}
				this.subject.currentStartDate = this.day.date;
				const activeModal = this.addAssignmentService.open(AddDocAssignmentModalComponent, {
					size: 'lg',
					backdrop: 'static',
					keyboard: true,
				});
			}
		}
	}

	//single click month cell
	highlightCell(date: any) {
		this.timer = 0;
		this.preventSimpleClick = false;
		this.delay = 500;

		this.timer = setTimeout(() => {
			this.subject.currentSelectedDate = this.day.date.toString();
		}, this.delay);
	}

	public updateAssignmentModal(event) {
		this.subject.updatedSpecQualifierObj = event.availableSpeciality && event.availableSpeciality.speciality;
		if (this.supervisorService.popover) {
			this.supervisorService.popover.isOpen()
				? this.supervisorService.popover.close()
				: this.supervisorService.popover;
		}
		this.subject.Event = event;
		if (this.swaps) {
			this.subject.spec = this.spec;
			this.subject.clinic = this.clinicID;
		} else {
			this.subject.spec = this.clinicID;
			this.subject.clinic = this.spec;
		}
		this.subject.currentStartDate =event.current_dateList_event.start_date;
		this.subject.currentEndDate = event.current_dateList_event.end_date;
		this.subject.updatedEventId = event.id;
		this.subject.recCheckForUpdate = event.recId;
		this.subject.specAssignId = event.id;
		this.subject.currentEvent=event;
	
		const activeModal = this.updateAssignmentService.open(UpdateDocAssignmentModalComponent, {
			size: 'lg',
			backdrop: 'static',
			keyboard: true,
		});
	}
	public update(docAssign) {}
	openPop(p: NgbPopover): void {
		if (this.supervisorService.popover) {
			this.supervisorService.popover.isOpen()
				? this.supervisorService.popover.close()
				: this.supervisorService.popover;
		}
		this.supervisorService.popover = p;
	}

	calulateEventCount(){
		let currentData :any[]=this.CurrDateApp;
		return currentData.length;
		let valueLength:any[] =currentData.filter(curent=> 
			(curent && curent.availableSpeciality? curent.availableSpeciality.speciality_id:null) &&  curent.availableSpeciality.speciality_id === this.specality_id);
		return valueLength.length;
	}
}
