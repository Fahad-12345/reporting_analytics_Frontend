import { filter, map } from 'rxjs/operators';
import {
	ApplicationRef,
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
import { PlacementArray } from 'positioning';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap/popover/popover';

import { SchedulerSupervisorService } from '../../../../../../../scheduler-supervisor.service';
import { AccordianComponent } from '../../../../../modals/accordian/accordian.component';
import {
	AddAssignmentModalComponent,
} from '../../../../../modals/add-assignment-modal/add-assignment-modal.component';
import {
	UpdateAssignmentModalComponent,
} from '../../../../../modals/update-assignment-modal/update-assignment-modal.component';
import { SubjectService } from '../../../../../subject.service';
import { CalendarMonthService } from './calendar-month.service';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { convert12, convertDateTimeForRetrieving, getAvailableDoctorCurrentDateList } from '@appDir/shared/utils/utils.helpers';
import { USERPERMISSIONS } from '@appDir/front-desk/UserPermissions';
import { AclService } from '@appDir/shared/services/acl.service';

@Component({
	selector: 'mwl-calendar-month-cell',
	templateUrl: 'calendar-month-cell.component.html',
	styleUrls: ['./calendar-month-view.scss'],
	host: {
		class: 'cal-cell cal-day-cell',
		'[class.cal-past]': 'day.isPast',
		'[class.cal-today]': 'day.isToday',
		'[class.cal-future]': 'day.isFuture',
		// '[class.cal-weekend]': 'day.isWeekend', // to color weekend red
		'[class.cal-in-month]': 'day.inMonth',
		'[class.cal-out-month]': '!day.inMonth',
		'[class.cal-has-events]': 'day.events.length > 0',
		'[class.cal-open]': 'day === openDay',
		'[class.cal-event-highlight]': '!!day.backgroundColor',
		'[style.backgroundColor]': 'day.backgroundColor',
	},
})
export class CalendarMonthCellComponent {
	popHide: NgbPopover;
	@Output() currentAssignments = new EventEmitter();
	public temp: string;
	trackByAssignmentId(index) {
		return index; // or item.id
	}
	public tempVar: number = 0;

	public myEvents: any = [];

	public specAssign: any = [];

	@Input()
	viewDate: Date;

	@Input()
	allEvent: any;

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

	@Output() updateSpecAssign = new EventEmitter();

	currentUrl;
	speciality: boolean;
	disable: boolean = true;
	public eventCount = 0;
	public extraTempDate: any;
	public eventOne: any;
	public eventTwo: any;

	private tempMyEvents: any = [];

	public myAssign: any = ['hello'];
	original_Event=[]

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
		public supervisorService: SchedulerSupervisorService,
		public addAssignmentService: NgbModal,
		public updateAssignmentService: NgbModal,
		public monthService: CalendarMonthService,
		public subject: SubjectService,
		private changeDetector: ChangeDetectorRef,
		public applicationRef: ApplicationRef,
		private storageData: StorageData,
		public aclService: AclService
	) {}
	ngOnInit() {
		this.disable = true;
		this.monthService.speciality = this.spec;
		this.monthService.clinic = this.clinicID;
		this.monthService.currentStartDate = this.day.date;
		this.extraTempDate = this.day.date;
		let temp = this.clinicID;
		if (!this.swaps) {
			temp = this.spec;
		}

		if (temp.id != 0) {
			if (temp.day_list) {
				for (let i = 0; i < temp.day_list.length; i++) {
					if (this.day.date.getDay() == temp.day_list[i]) {
						this.disable = false;
					}
				}
			}
		} else {
			this.disable = false;
		}
	}
	ngOnChanges(change) {
		this.returnItemChange(this.spec.id, this.day.date, this.clinicID, change);
	}

	returnItemChange(specID, date, clinicID, change) {
		
		this.CurrDateApp = [];
		this.original_Event=[]
		this.eventCount = 0;
	
		if (change.allEvent && change.allEvent.currentValue.length>0) {
		
			for (let e of change.allEvent.currentValue) {
				let event={...e}
				if (
					(event.speciality_id == specID &&
						event.facility_location_id == clinicID.id &&
						this.swaps &&
						// date.toString().substring(0, 15) ==
						// 	new Date(event.startDate).toString().substring(0, 15)
						this.CheckeventOndateExist(event,date)
							) ||
					(event.speciality_id == clinicID.id &&
						event.facility_location_id == specID &&
						!this.swaps &&
						// date.toString().substring(0, 15) ==
						// 	new Date(event.startDate).toString().substring(0, 15)
						this.CheckeventOndateExist(event,date)
							)
				) {
					if (date.getDay() == 4 || date.getDay() == 5 || date.getDay() == 6) {
						event['placement'] = 'left';
					} else {
						event['placement'] = 'right';
					}
					if (this.eventCount == 0) {
					
						// this.eventOne=JSON.parse(JSON.stringify(event));

						// event.availableDoctors.map(availabledoc=>{
						// 	let current_dateList_event=getAvailableDoctorCurrentDateList(availabledoc.dateList,date)
						// 	availabledoc['current_dateList_event']=current_dateList_event
						// })
						this.eventOne=event;
						let _datelist=event.dateList&&event.dateList.find(datelist=>new Date(datelist.start_date).toString().substring(0, 15)==date.toString().substring(0, 15));
						// if(_datelist)
						// {
						// 	this.convertdateTimeToSelectedZone(_datelist)

						// }
						this.eventOne['current_dateList_event'] =_datelist? _datelist:null
						this.CurrDateApp.push(this.eventOne);
						
					} else if (this.eventCount == 1) {
					
						// this.eventTwo =JSON.parse(JSON.stringify(event));
						// event.availableDoctors.map(availabledoc=>{
						// 	let current_dateList_event=getAvailableDoctorCurrentDateList(availabledoc.dateList,date)
						// 	availabledoc['current_dateList_event']=current_dateList_event
						// })
							this.eventTwo =event;
						let _datelist=event.dateList&&event.dateList.find(datelist=>new Date(datelist.start_date).toString().substring(0, 15)==date.toString().substring(0, 15));
						// if(_datelist)
						// {
						// 	this.convertdateTimeToSelectedZone(_datelist)

						// }
						this.eventTwo['current_dateList_event'] = _datelist? _datelist:null
						this.CurrDateApp.push(this.eventTwo);
					}
					else if(this.eventCount >1)
					{
						// event.availableDoctors.map(availabledoc=>{
						// 	let current_dateList_event=getAvailableDoctorCurrentDateList(availabledoc.dateList,date)
						// 	availabledoc['current_dateList_event']=current_dateList_event
						// })
						let _event=event;
						let _datelist=event.dateList&&event.dateList.find(datelist=>new Date(datelist.start_date).toString().substring(0, 15)==date.toString().substring(0, 15));
						// if(_datelist)
						// {
						// 	this.convertdateTimeToSelectedZone(_datelist)

						// }
						_event['current_dateList_event'] =_datelist? _datelist:null
						this.CurrDateApp.push(_event);
						
					}
					this.eventCount = this.eventCount + 1;
					// this.original_Event.push(event)
					// this.CurrDateApp.push(event);
				}
			}
		}
		this.specAssign = this.CurrDateApp;
		// this.specAssign = this.original_Event;
		this.changeDetector.markForCheck();

		return this.CurrDateApp;
	}

	// getAvailableDoctorCurrentDateList(dateList,date:Date):any
	// {
	// 	let currentdateList=dateList.find(datelist=>new Date(datelist.start_date).toString().substring(0, 15)==date.toString().substring(0, 15));
	// 	if(currentdateList)
	// 	{
	// 		return currentdateList
	// 	}
	// 	return null
	// }

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

	ngOnDestroy(): void {
		// console.log("DESTROYED")
	}

	CheckeventOndateExist(_event:any,date):boolean
	{
		let eventExist=_event&&_event.dateList&&_event.dateList.length>0 &&_event.dateList.find(date_list=>new Date(date_list.start_date).toString().substring(0, 15)==date.toString().substring(0, 15))
		if(eventExist)
		{
			return true;
		}
		else
		{
			return false;
		}
	}

	CurrDateApp;
	
	returnItem(specID, date, clinicID) {
		this.CurrDateApp = [];
		this.eventCount = 0;
		if (this.specAssign != undefined) {
			for (let event of this.specAssign) {
				if (
					(event.specId == specID &&
						event.clinicId == clinicID.id &&
						this.swaps &&
						// date.toString().substring(0, 15) ==
						// 	new Date(event.startDate).toString().substring(0, 15)
						this.CheckeventOndateExist(event,date)
							) ||
					(event.specId == clinicID.id &&
						event.clinicId == specID &&
						!this.swaps &&
						// date.toString().substring(0, 15) ==
						// 	new Date(event.startDate).toString().substring(0, 15)
						this.CheckeventOndateExist(event,date)
							)
				) {
					if (date.getDay() == 4 || date.getDay() == 5 || date.getDay() == 6) {
						event['placement'] = 'left';
					} else {
						event['placement'] = 'right';
					}
					if (this.eventCount == 0) {
						this.eventOne = event;
					} else if (this.eventCount == 1) {
						this.eventTwo = event;
					}
					this.eventCount = this.eventCount + 1;
					this.CurrDateApp.push(event);
				}
			}
		}
		this.specAssign = this.CurrDateApp;
		this.changeDetector.markForCheck();

		return this.CurrDateApp;
	}

	public deleteEvent(e, spec, clinic) {
		debugger;
		var specialityName: any;
		var ClinicName: any;
		this.supervisorService.currentDeleteAppointment = e;
		this.monthService.specialityForDeleteModal = spec.name;
		this.monthService.specialityQualifierForDeleteModal = spec.name;
		this.monthService.clinicForDeleteModal = clinic.name;
		this.monthService.clinicQualifierForDeleteModal = clinic.name;
		// this.monthService.specIdForDeleteModal = e.specId;
		// this.monthService.recIdForDeleteModal = e.recId;
		this.monthService.available_spec_Id_ForDeleteModal = e.dateList.available_speciality_id;
		this.monthService.date_list_id_ForDeleteModal = e.dateList.id;
		const activeModal = this.deleteModal.open(AccordianComponent, {
			size: 'lg',
			backdrop: 'static',
			keyboard: false,
		});
	}

	public cellCurrentAppointmentsUpdate(event) {
		this.currentAssignments.emit(event);
	}
	public testOutput(event) {
	}
	public open(date) {
		//differentiate between single and double click
		this.preventSimpleClick = true;
		clearTimeout(this.timer);
		//selected date
		this.subject.currentSelectedDateDoubleClicked = this.day.date.toString();

		if (!this.disable && this.aclService.hasPermission(this.userPermissions.scheduler_assignment_add_new)) {
			if (this.supervisorService.popover) {
				this.supervisorService.popover.isOpen()
					? this.supervisorService.popover.close()
					: this.supervisorService.popover;
			}
			if (this.swaps) {
				this.subject.spec = this.spec;
				this.subject.clinic = this.clinicID;
			} else {
				this.subject.spec = this.clinicID;
				this.subject.clinic = this.spec;
			}

			this.subject.currentStartDate = date;
			const activeModal = this.addAssignmentService.open(AddAssignmentModalComponent, {
				size: 'lg',
				backdrop: 'static',
				keyboard: false,
			});
			activeModal.result.then(() => {

				this.currentAssignments.emit('testing');
			});
		}
	}

	//single click month cell
	highlightCell(date) {
		this.timer = 0;
		this.preventSimpleClick = false;
		this.delay = 500;

		this.timer = setTimeout(() => {
			this.subject.currentSelectedDate = this.day.date.toString();

			//if other cell is selected or not
			// if(this.subject.currentSelectedDate ===  this.day.date.toString() || this.subject.currentSelectedDate === -1){

			//   if(!this.preventSimpleClick){
			//     //alert("single Clicked");
			//     if (this.singlClickStatus == false){
			//       this.cellBackColor = "lightblue";
			//       this.singlClickStatus = true;

			//       this.subject.currentSelectedDate =  this.day.date.toString();
			//     }
			//     else if (this.singlClickStatus == true){
			//       this.cellBackColor = "white";
			//       this.singlClickStatus = false;

			//       this.subject.currentSelectedDate = -1;

			//     }
			//   }

			// }
		}, this.delay);
	}

	public deleteModalFunction(eve, all,date) {
		debugger;
		if (this.supervisorService.popover) {
			this.supervisorService.popover.isOpen()
				? this.supervisorService.popover.close()
				: this.supervisorService.popover;
		}
		if(this.swaps)
		{
			this.monthService.specialityForDeleteModal = this.spec.name;
			this.monthService.specialityQualifierForDeleteModal = this.spec.qualifier;
			this.monthService.clinicForDeleteModal =this.clinicID.facility_name+'-'+ this.clinicID.name;
			this.monthService.clinicQualifierForDeleteModal =this.clinicID.facility.qualifier+'-'+ this.clinicID.qualifier;
		}
		else
		{
			this.monthService.specialityForDeleteModal = this.clinicID.name;
			this.monthService.specialityQualifierForDeleteModal = this.clinicID.qualifier;
			this.monthService.clinicForDeleteModal =this.spec.facility_name+'-'+ this.spec.name;
			this.monthService.clinicQualifierForDeleteModal =this.spec.facility.qualifier+'-'+ this.spec.qualifier;
		}

		let _event={...eve};
		_event.availableDoctors.map(availabledoc=>{
									let current_dateList_event=getAvailableDoctorCurrentDateList(availabledoc.dateList,date)
									availabledoc['current_dateList_event']=current_dateList_event
								})

		this.supervisorService.currentDeleteAppointment = _event;
	
		this.monthService.available_spec_Id_ForDeleteModal = _event.dateList.available_speciality_id;
		this.monthService.date_list_id_ForDeleteModal = _event.dateList.id;
		const activeModal = this.addAssignmentService.open(AccordianComponent, {
			size: 'lg',
			backdrop: 'static',
			keyboard: false,
		});
		activeModal.result.then((deleted) => {
			if(deleted)
			{
				for (let i = 0; i < all.length; i++) {
					if (all[i].id === _event.id) {
						let x = all.splice(i, 1);
					}
				}
			}
			
		});
	}

	updateFunction(event, date) {
		if (this.supervisorService.popover) {
			this.supervisorService.popover.isOpen()
				? this.supervisorService.popover.close()
				: this.supervisorService.popover;
		}
		this.subject.assignDoctorData = [];
		if (this.swaps) {
			this.subject.spec = this.spec;
			this.subject.clinic = this.clinicID;
		} else {
			this.subject.spec = this.clinicID;
			this.subject.clinic = this.spec;
		}
		let _event={...event};
		_event.availableDoctors.map(availabledoc=>{
									let current_dateList_event=getAvailableDoctorCurrentDateList(availabledoc.dateList,date)
									availabledoc['current_dateList_event']=current_dateList_event
								})

		this.subject.numberOfDoc = _event.current_dateList_event.no_of_doctors;
		// this.subject.assignDoc = event.doctorName;
		this.subject.assignDoc = _event.availableDoctors;
		// this.subject.assignDoctorData.push(event.doctor);
		this.subject.assignDoctorData=_event.availableDoctors;
		this.subject.currentStartDate = _event.current_dateList_event.start_date;
		this.subject.currentEvent=_event;
		this.subject.currentEndDate = _event.current_dateList_event.end_date;
		this.subject.specAssignId = _event.id;
		this.subject.result = [];
		const activeModal = this.addAssignmentService.open(UpdateAssignmentModalComponent, {
			size: 'lg',
			backdrop: 'static',
			keyboard: false,
		});
		activeModal.result.then(() => {
			if (this.subject.result.result) {
				event.startDate = this.subject.result.result[0]['startDate'];
				event.endDate = this.subject.result.result[0]['endDate'];
				event.start = new Date(event.startDate);
				event.end = new Date(event.endDate);

				event.startTime =
					event.start.getHours().toString() + ':' + event.start.getMinutes().toString();
				event.endTime = event.end.getHours().toString() + ':' + event.end.getMinutes().toString();

				event.no_of_doctors = this.subject.result.result[0]['noOfDoctors'];

				// event.doctorName = [];
				event.availableDoctors = [];

				for (let i = 1; i < this.subject.result.result.length; i++) {
					event.doctorName.push(this.subject.result.result[i].doctorName);
					event.availableDoctors.push(this.subject.result.result[i].availableDoctors);

				}
			}
		});
	}
	openPop(p: NgbPopover): void {
		if (this.supervisorService.popover) {
			this.supervisorService.popover.isOpen()
				? this.supervisorService.popover.close()
				: this.supervisorService.popover;
		}
		this.supervisorService.popover = p;
	}
}
