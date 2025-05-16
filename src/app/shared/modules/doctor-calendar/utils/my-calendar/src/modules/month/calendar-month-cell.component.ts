import { DatePipeFormatService } from './../../../../../../../services/datePipe-format.service';
import { find } from 'lodash';
import {
	Component,
	Input,
	Output,
	EventEmitter,
	TemplateRef,
	OnDestroy,
	ViewChild,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	ApplicationRef,
	OnInit,
} from '@angular/core';
import { MonthViewDay, CalendarEvent } from 'calendar-utils';
import { trackByEventId } from '../common/util';
import { PlacementArray } from 'positioning';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { DoctorCalendarService } from '../../../../../doctor-calendar.service';
import { CalendarMonthService } from './calendar-month.service';
import { CalendarMonthViewComponent } from './calendar-month-view.component';
import { MonthSubjectService } from './subject.service';

import { AddAppointmentModalComponent } from './appointments/appointments-modal.component';
import { CreateAppointmentComponent } from '../../../../../modals/create-appointment/create-appointment.component';
import { UpdateAppoitModalComponent } from '../../../../../modals/update-appoit-modal/update-appoit-modal.component';
import { NotesComponent } from '../../../../../modals/add-notes/notes.component';
import { UnavailabilityDeleteReasonComponent } from '../../../../../modals/unavailability-delete-reason/unavailability-delete-reason.component';
import { SubjectService } from '../../../../../subject.service';
import { DeleteReasonComponent } from '@shared/modules/doctor-calendar/modals/delete-reason/delete-reason.component';
import { ToastrService } from 'ngx-toastr';
import { StorageData, HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { Router } from '@angular/router';
import { DoctorCalendarUrlsEnum } from '@appDir/shared/modules/doctor-calendar/doctor-calendar-urls-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { SchedulerSupervisorService } from '@appDir/scheduler-front-desk/scheduler-supervisor.service';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { AppointmentModalDialogService } from './appointment-modal-dialog.service';
import { MainService } from '@appDir/shared/services/main-service';
import { takeUntil } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';
@Component({
	selector: 'mwl-calendar-month-cell',
	templateUrl: 'calendar-month-cell.component.html',
	styleUrls: ['./calendar-month-view.scss'],
	host: {
		class: 'cal-cell cal-day-cell',
		'[class.cal-past]': 'day.isPast',
		'[class.cal-today]': 'day.isToday',
		'[class.cal-future]': 'day.isFuture',
		// '[class.cal-weekend]': 'day.isWeekend',
		'[class.cal-in-month]': 'day.inMonth',
		'[class.cal-out-month]': '!day.inMonth',
		'[class.cal-has-events]': 'day.events.length > 0',
		'[class.cal-open]': 'day === openDay',
		'[class.cal-event-highlight]': '!!day.backgroundColor',
		'[style.backgroundColor]': 'day.backgroundColor',
	},
})
export class CalendarMonthCellComponent extends PermissionComponent {
	@Output() currentAssignments = new EventEmitter();
	@Output() startEvaluation = new EventEmitter();
	@Output() startEvualtionFlagShow = new EventEmitter();
	@Input() patientData: any;
	@Input() currentDoc: any;
	@Input() allMonthEvents: any;
	public monthEvents: any = [];

	public allEvents: any = [];
	public doctorNameModal: any;

	public temp: string;
	private noteButton: boolean = false;
	private deleteUnavailabilityButton: boolean = false;
	private localStorageId: string;
	private addAppointmentButton: boolean = false;
	disable: boolean = false;
	subscription: Subscription[] = [];
	private unsubscribe: Subject<void> = new Subject<void>();
	trackByAssignmentId(index) {
		return index; // or item.id
	}
	public tempVar: number = 0;

	public myEvents: any = [];

	// @ViewChild(CalendarMonthViewComponent) childs:CalendarMonthViewComponent;
	@Input()
	patientObject: any;
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

	@Input() patient: any = 'false';

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
	note: any = [];
	public extraTempDate: any;

	private tempMyEvents: any = [];

	public myAssign: any = ['hello'];
	public todayNote: any = 'hjfvbdfhdsfesdfbbndfjkbdsjkfbjdsbfjkdbfjkbfb';
	public noteShow: boolean = false;

	public eventOne: any;
	public eventTwo: any;

	//To add delay in single and double click
	public timer: any;
	public delay: any;
	public preventSimpleClick: boolean = false;
	//

	//cell back color
	cellBackColor = 'white';
	singlClickStatus = false;
	//

	constructor(
		aclService: AclService,
		router: Router,
		public appointmentModal: NgbModal,
		public updateModal: NgbModal,
		protected requestService: RequestService,
		public monthService: CalendarMonthService,
		private customDiallogService: CustomDiallogService,
		public _subjectService: MonthSubjectService,
		private cdr: ChangeDetectorRef,
		public subject: SubjectService,
		private storageData: StorageData,
		public doctorCalendarService: DoctorCalendarService,
		public supervisorService: SchedulerSupervisorService,
		private toastrService: ToastrService,
		public applicationRef: ApplicationRef,
		public datePipeService: DatePipeFormatService,
		public appModelDialogService:AppointmentModalDialogService,
		public mainService:MainService
	) {
		super(aclService, router);

		this.localStorageId = JSON.stringify(this.storageData.getUserId());
	}
	ngOnInit() {
		// this.subject.updateAppointment.subscribe((response) =>
		// {
		//   if(response == true)
		//   {
		//     response = false
		//     this.openAppointments(localStorage.getItem("openAppointments"))
		//   }
		// })
		this.CurrDateApp = [];
		if (
			this.aclService.hasPermission(this.userPermissions.note) ||
			this.storageData.isSuperAdmin()
		) {
			this.noteButton = true;
		}
		if (
			this.aclService.hasPermission(this.userPermissions.unavailablity_delete) ||
			this.storageData.isSuperAdmin()
		) {
			this.deleteUnavailabilityButton = true;
		}
		if (
			this.aclService.hasPermission(this.userPermissions.appointment_add) ||
			this.storageData.isSuperAdmin()
		) {
			this.addAppointmentButton = true;
		}
		this.extraTempDate = this.day.date;
		this._subjectService.castNote.subscribe((res) => {
			this.note = [];
			this.noteShow = false;

			if (this.patient != 'true') {
				for (let i = 0; i < res.length; i++) {
					if (res[i]['note'] && this.currentDoc.user_id == res[i].doctor_id) {
						this.note.push(res[i]);
					}
				}
				this.noteShow = this.checkDayNote(new Date(this.day.date));
			} else {
				this.noteShow = false;
			}
		});
		if (this.patientData) {
			this.monthEvents = this.patientData;
			this.returnItem(this.day.date);
		}
		if (this.allMonthEvents) {
			this.monthEvents = this.allMonthEvents;
			this.returnItem(this.day.date);
		}
		this.getRefreshed();
	}
	ngOnChanges(change) {
		if (change.patientData) {
			this.monthEvents = change.patientData.currentValue;
			this.returnItem(this.day.date);
		}
		if (change.allMonthEvents) {
			this.monthEvents = change.allMonthEvents.currentValue;
			this.returnItem(this.day.date);
		}
	}
	ngOnDestroy():void
	{
		unSubAllPrevious(this.subscription);
	}
	disableCheckspecId() {
		this.disable = false;
		if (this.currentDoc && this.currentDoc.id) {
			this.disable = true;
			for (let i = 0; i < this.currentDoc.doctor.specialities.user_timings.length; i++) {
				if (this.currentDoc.doctor.specialities.user_timings[i].day_id === this.day.date.getDay()) {
					this.disable = false;
					break;
				}
			}
		}
		this.cdr.markForCheck();
		return this.disable;
	}

	CurrDateApp;
	eventCount = 0;
	returnItem(date) {
		this.CurrDateApp = [];
		this.eventCount = 0;

		if (this.monthEvents != undefined && this.patient == 'false') {
			for (let i = 0; i < this.monthEvents.length; i++) {
				if (
					date.toString().substring(0, 15) ==
					new Date(this.monthEvents[i].start_date).toString().substring(0, 15)
				) {
					debugger;
					if (
						(this.currentDoc.doctor &&
							this.monthEvents[i].doctor_id == this.currentDoc.user_id &&
							this.monthEvents[i].facility_id == this.currentDoc.facility_location_id &&
							this.monthEvents[i].speciality_id == this.currentDoc.speciality_id) ||
						// || (!this.currentDoc.doctor && this.monthEvents[i].speciality_id == this.currentDoc.id)
						// && this.monthEvents[i].facility_id == this.currentDoc.facility_location_id
						(!this.monthEvents[i].doctor_id &&
							this.currentDoc.doctor &&
							this.monthEvents[i].speciality_id == this.currentDoc.doctor.specialities.id &&
							this.monthEvents[i].facility_id == this.currentDoc.facility_location_id)
					) {
						if (
							this.monthEvents[i].speciality_id &&
							!this.monthEvents[i].doctor_id &&
							this.monthEvents[i]['appointments'] &&
							this.monthEvents[i]['appointments'].length != 0
						) {
							if (
								date.toString().substring(0, 3) == 'Sat' ||
								date.toString().substring(0, 3) == 'Fri'
							) {
								this.monthEvents[i]['placement'] = 'left';
							} else {
								this.monthEvents[i]['placement'] = 'right';
							}

							this.monthEvents[i]['specEventCheck'] = true;

							if (this.eventCount == 0) {
								this.eventOne = this.monthEvents[i];
							} else if (this.eventCount == 1) {
								this.eventTwo = this.monthEvents[i];
							}
							this.eventCount = this.eventCount + 1;
							this.CurrDateApp.push(this.monthEvents[i]);
						} else if (this.monthEvents[i].doctor_id) {
							if (
								date.toString().substring(0, 3) == 'Sat' ||
								date.toString().substring(0, 3) == 'Fri'
							) {
								this.monthEvents[i]['placement'] = 'left';
							} else {
								this.monthEvents[i]['placement'] = 'right';
							}

							if (this.eventCount == 0) {
								this.eventOne = this.monthEvents[i];
							} else if (this.eventCount == 1) {
								this.eventTwo = this.monthEvents[i];
							}
							this.eventCount = this.eventCount + 1;
							this.CurrDateApp.push(this.monthEvents[i]);
						}
					} else if (
						this.currentDoc.doctor &&
						this.monthEvents[i].doctor_id == this.currentDoc.user_id &&
						!this.monthEvents[i].is_appointment
					) {
						if (
							date.toString().substring(0, 3) == 'Sat' ||
							date.toString().substring(0, 3) == 'Fri'
						) {
							this.monthEvents[i]['placement'] = 'left';
						} else {
							this.monthEvents[i]['placement'] = 'right';
						}

						if (this.eventCount == 0) {
							this.eventOne = this.monthEvents[i];
						} else if (this.eventCount == 1) {
							this.eventTwo = this.monthEvents[i];
						}
						this.eventCount = this.eventCount + 1;
						this.CurrDateApp.push(this.monthEvents[i]);
					} else if (!this.currentDoc.doctor) {
						// for (let z = 0; this.currentDoc.doctor &&
						//   this.currentDoc.doctor.specAllArray &&
						//   z < this.currentDoc.doctor.specAllArray.length; z++) {
						//   if (this.monthEvents[i]['facility_id'] == this.currentDoc.doctor.specAllArray[z].facilityId
						//     && this.monthEvents[i]['specId'] == this.currentDoc.doctor.specAllArray[z].id
						// 	&& this.monthEvents[i]["appointments"].length != 0)

						// for (let z = 0; this.currentDoc.doctor &&
						//   this.currentDoc.doctor.user_timings &&
						//   z < this.currentDoc.doctor.user_timings.length; z++) {
						let specilaity_facility_location_id;
						let user_facility = this.currentDoc.userFacilty.find(
							(user_facility) =>
								user_facility.facility_location_id == this.monthEvents[i].facility_id,
						);
						if (user_facility) {
							specilaity_facility_location_id = user_facility.facility_location_id;
						}

						if (
							!this.currentDoc.doctor &&
							!this.monthEvents[i].doctor_id &&
							this.monthEvents[i].speciality_id == this.currentDoc.id &&
							this.monthEvents[i].facility_id == specilaity_facility_location_id
						) {
							// && this.monthEvents[i].facility_id == this.currentDoc.facility_location_id
							// if (this.monthEvents[i]["appointments"] &&this.monthEvents[i]["appointments"].length != 0)
							// {
							if (
								date.toString().substring(0, 3) == 'Sat' ||
								date.toString().substring(0, 3) == 'Fri'
							) {
								this.monthEvents[i]['placement'] = 'left';
							} else {
								this.monthEvents[i]['placement'] = 'right';
							}
							// this.monthEvents[i]['specEventCheck']=true
							if (this.eventCount == 0) {
								this.eventOne = this.monthEvents[i];
							} else if (this.eventCount == 1) {
								this.eventTwo = this.monthEvents[i];
							}
							this.eventCount = this.eventCount + 1;
							this.CurrDateApp.push(this.monthEvents[i]);
							// break;
							//   }
						}

						// }
					}
				}
			}
		} else if (this.monthEvents != undefined && this.patient == 'true') {
			for (let i = 0; i < this.monthEvents.length; i++) {
				if (
					date.toString().substring(0, 15) ==
					new Date(this.monthEvents[i].start).toString().substring(0, 15)
				) {
					if (
						date.toString().substring(0, 3) == 'Sat' ||
						date.toString().substring(0, 3) == 'Fri'
					) {
						this.monthEvents[i]['placement'] = 'left';
					} else {
						this.monthEvents[i]['placement'] = 'right';
					}
					if (this.eventCount == 0) {
						this.eventOne = this.monthEvents[i];
					} else if (this.eventCount == 1) {
						this.eventTwo = this.monthEvents[i];
					}
					this.eventCount = this.eventCount + 1;
					this.CurrDateApp.push(this.monthEvents[i]);
				}
			}
		}

		this.allEvents = this.CurrDateApp;
		return this.CurrDateApp;
	}

	public cellCurrentAppointments(event) {
		this.currentAssignments.emit(event);
	}

	public openAppointments(appointment) {
		if (this.supervisorService.popover) {
			this.supervisorService.popover.isOpen()
				? this.supervisorService.popover.close()
				: this.supervisorService.popover;
		}
		if (appointment.is_appointment) {
			this.monthService.appointments = appointment;
			this.doctorCalendarService.appointmentsModal
			this.doctorCalendarService.appointmentsModal = this.appModelDialogService.openDialog();
	        this.doctorCalendarService.appointmentsModal.result.then(res =>{
			if(res)
			{
				for (let i = 0; i < this.monthEvents.length; i++) {
					if (
						res[0] && res[0]['start'].toString().substring(0, 15) ==
						new Date(this.monthEvents[i].start_date).toString().substring(0, 15) 
						&&(this.monthEvents[i].appointments.length && this.monthEvents[i].appointments[0]&&this.monthEvents[i].appointments[0].date_list_id === res[0].date_list_id)
						&& (res[0].available_doctor_is_provider_assignment == (this.monthEvents[i].appointments && this.monthEvents[i].appointments[0]&& this.monthEvents[i].appointments[0]['available_doctor_is_provider_assignment']))
						){
						this.monthEvents[i].appointments = res						
					}
				}
			}
			})
		}
	}
	public getCurrentAssignments($event) {
		this.currentAssignments.emit('test');
	}
	public deleteAppointment(event) {
		if (this.supervisorService.popover) {
			this.supervisorService.popover.isOpen()
				? this.supervisorService.popover.close()
				: this.supervisorService.popover;
		}
		if (!event.appId) {
			event['appId'] = event.id;
		}
		let startDate: Date;
		let endDate: Date;
		startDate = event.start;
		endDate = event.end;
		startDate.setHours(0);
		startDate.setMinutes(0);
		endDate.setHours(23);
		endDate.setMinutes(59);
		const activeModal = this.updateModal.open(DeleteReasonComponent, {
			size: 'sm',
			backdrop: 'static',
			keyboard: false,
		});
		this.doctorCalendarService.deleteAppId = [event.appId];
		this.doctorCalendarService.startDate = startDate;
		this.doctorCalendarService.endDate = endDate;
	}

	public deleteUnavialability(data) {
		if (this.supervisorService.popover) {
			this.supervisorService.popover.isOpen()
				? this.supervisorService.popover.close()
				: this.supervisorService.popover;
		}
		if (data.approval_status == 1) {
			this.doctorCalendarService.unavailabilityId = data.id;
			const activeModal = this.appointmentModal.open(UnavailabilityDeleteReasonComponent, {
				size: 'sm',
				backdrop: 'static',
				keyboard: false,
			});
		} else {
			let start = new Date(data.real_start);
			let end = new Date(data.real_end);
			if (start.getDate() < end.getDate()) {
				this.customDiallogService.confirm('Delete','Are you sure you want to delete all unavailabities created through recurrence?','Yes','No')
		.then((confirmed) => {
			if (confirmed){
				let obj = {
					id: data.id,
				};
				this.requestService
					.sendRequest(
						DoctorCalendarUrlsEnum.deleteDoctorUnavailability,
						'delete_with_body',
						REQUEST_SERVERS.schedulerApiUrl1,
						obj,
					)
					.subscribe(
						(resp: HttpSuccessResponse) => {
							this.toastrService.success('Unavailability Successfully Deleted', 'Success');
							this.subject.refresh('delete Un');
						},
						(error) => {
							this.toastrService.success(error.error.message, 'Error');
						},
					);
			}else if(confirmed === false){
			}else{
			}
		})
		.catch();

			} else {

				this.customDiallogService.confirm('Delete','Are you sure you want to delete?','Yes','No')
		.then((confirmed) => {

			if (confirmed){
				let obj = {
					id: data.id,
				};
				this.requestService
					.sendRequest(
						DoctorCalendarUrlsEnum.deleteDoctorUnavailability,
						'delete_with_body',
						REQUEST_SERVERS.schedulerApiUrl1,
						obj,
					)
					.subscribe(
						(resp: HttpSuccessResponse) => {
							this.toastrService.success('Unavailability Successfully Deleted', 'Success');
							this.subject.refresh('delete Un');
						},
						(error) => {
							this.toastrService.success(error.error.message, 'Error');
						},
					);
			}else if(confirmed === false){
			}else{
			}
		})
		.catch();
			}
		}
	}

	checkDayNote(date: any) {
		date = new Date(date);
		if (this.patient == 'true') {
			return false;
		}
		for (let i = 0; i < this.note.length; i++) {
			if (
				this.note[i]['start_date'].getDate() === date.getDate() &&
				this.note[i]['start_date'].getDay() === date.getDay() &&
				this.note[i]['start_date'].getMonth() === date.getMonth() &&
				this.note[i]['start_date'].getFullYear() === date.getFullYear() &&
				this.aclService.hasPermission(this.userPermissions.schedule_doctor_access_note_view)
			) {
				return true;
			}
		}
		return false;
	}

	addNote(date: any) {
		if (this.supervisorService.popover) {
			this.supervisorService.popover.isOpen()
				? this.supervisorService.popover.close()
				: this.supervisorService.popover;
		}
		this.doctorCalendarService.notesStartDate = new Date(date);
		this.doctorCalendarService.doctorName = this.currentDoc;
		const activeModal = this.appointmentModal.open(NotesComponent, {
			size: 'lg',
			backdrop: 'static',
			keyboard: false,
		});
	}
	open(date: any) {
		debugger;
		this.doctorCalendarService.appointmentsOne = this.eventOne;
		this.doctorCalendarService.appointmentsTwo = this.eventTwo;
		let date_check = new Date();
		date_check.setDate(date_check.getDate() - 1);
		date_check.setHours(23);
		date_check.setMinutes(59);
		date_check.setSeconds(59);
		if (date < date_check) {
			if (this.aclService.hasPermission(this.userPermissions.add_previous_appointment)) {
				//differentiate between single and double click
				this.preventSimpleClick = true;
				clearTimeout(this.timer);
				//

				if (!this.disable) {
					//////////HAMZA
					//console.log("MONTH CELL",this.currentDoc,"CLINIC ID",this.clinicID);

					//selected specialtites and/or doctors
					this.doctorCalendarService.currentDocAndSpec = this.currentDoc;
					//selected Clinic
					this.doctorCalendarService.selectedClinic = this.clinicID;

					/////

					if (this.supervisorService.popover) {
						this.supervisorService.popover.isOpen()
							? this.supervisorService.popover.close()
							: this.supervisorService.popover;
					}
					let t0 = performance.now();
					if (this.doctorCalendarService.patientName != null) {
						this.doctorCalendarService.patientName = this.doctorCalendarService.patientName;
					} else {
						this.doctorCalendarService.patientName = null;
					}
					this.doctorCalendarService.createAppDate = new Date(date);

					/////HAMZA

					//Updating Start Time with respect to first Event
					// if(this.eventOne.isAppointment && !this.eventOne.note){
					//   this.doctorCalendarService.createAppDate = new Date(this.eventOne.startDate);
					// }
					for (let i = 0; i < this.CurrDateApp.length; i++) {
						if (this.CurrDateApp[i].is_appointment && !this.CurrDateApp[i].note) {
							this.doctorCalendarService.createAppDate = new Date(this.CurrDateApp[i].start_date);
						}
					}

					////

					if (this.addAppointmentButton) {
						if (this.doctorCalendarService.appointmentsModal) {
							this.doctorCalendarService.appointmentsModal.close();
						}
						const activeModal = this.appointmentModal.open(CreateAppointmentComponent, {
							// size:'lg',
							backdrop: 'static',
							keyboard: false,
							windowClass: 'modal_extraDOc modal-unique modal-unique-app ',
						});
						let t1 = performance.now();
					}
				}
			}
		} else {
			//differentiate between single and double click
			this.preventSimpleClick = true;
			clearTimeout(this.timer);
			//

			if (!this.disable) {
				//////////HAMZA
				//console.log("MONTH CELL",this.currentDoc,"CLINIC ID",this.clinicID);

				//selected specialtites and/or doctors
				this.doctorCalendarService.currentDocAndSpec = this.currentDoc;
				//selected Clinic
				this.doctorCalendarService.selectedClinic = this.clinicID;

				/////

				if (this.supervisorService.popover) {
					this.supervisorService.popover.isOpen()
						? this.supervisorService.popover.close()
						: this.supervisorService.popover;
				}
				let t0 = performance.now();
				if (this.doctorCalendarService.patientName != null) {
					this.doctorCalendarService.patientName = this.doctorCalendarService.patientName;
				} else {
					this.doctorCalendarService.patientName = null;
				}
				this.doctorCalendarService.createAppDate = new Date(date);

				/////HAMZA

				//Updating Start Time with respect to first Event
				// if(this.eventOne.isAppointment && !this.eventOne.note){
				//   this.doctorCalendarService.createAppDate = new Date(this.eventOne.startDate);
				// }
				for (let i = 0; i < this.CurrDateApp.length; i++) {
					if (this.CurrDateApp[i].is_appointment && !this.CurrDateApp[i].note) {
						this.doctorCalendarService.createAppDate = new Date(this.CurrDateApp[i].start_date);
					}
				}

				////

				if (this.addAppointmentButton) {
					if (this.doctorCalendarService.appointmentsModal) {
						this.doctorCalendarService.appointmentsModal.close();
					}
					const activeModal = this.appointmentModal.open(CreateAppointmentComponent, {
						// size:'lg',
						backdrop: 'static',
						keyboard: false,
						windowClass: 'modal_extraDOc modal-unique modal-unique-app',
					});
					let t1 = performance.now();
				}
			}
		}
	}

	//single click month cell
	highlightCell(date: any) {
		this.timer = 0;
		this.preventSimpleClick = false;
		this.delay = 500;

		this.timer = setTimeout(() => {
			//console.log("SELECTED CELL", this.doctorCalendarService.currentSelectedDate, this.day.date.toString());//tbd
			this.doctorCalendarService.currentSelectedDate = this.day.date.toString();
		}, this.delay);
	}

	public openPatientProfile(app) {
		this.subject.refreshPatientProfile(app);
	}
	public edit(event) {
		debugger;
		if (this.supervisorService.popover) {
			this.supervisorService.popover.isOpen()
				? this.supervisorService.popover.close()
				: this.supervisorService.popover;
		}
		if (!event.appId) {
			event['appId'] = event.id;
		}
		if (this.patient == 'true') {
			if (event['available_doctor_id'] == 0 || event['available_doctor_id'] == null) {
				this.doctorCalendarService.updateModalData = {
					appointment_title: event['appointment_title'],
					patientName: event['patientName'],
					patient_id: event['patient_id'],
					case_id: event['case_id'],
					case_type_id: event['case_type_id'],
					case_type_name: event['case_type_name'],
					doctor_id: 0,
					appointment_duration: event['appointment_duration'],
					//   "time_slot": event['specAssign']['specialities']["time_slot"],
					time_slot: event['time_slots'],
					startDateTime: event['start'],
					priority_id: event['priority_id'],
					appointment_type_id: event['appointment_type_id'],
					visitTypeid: event['appointment_type_id'],
					appointment_type_description: event['appointment_type_description'],
					appointment_type_slug: event['appointment_type_slug'],
					confirmation_status: event['confirmation_status'],
					//   "roomId": event["roomId"],
					comments: event['comments'],
					facility_id: event['facility_id'],
					speciality_id: event['speciality_id'],
					appointmentId: event['appId'],
					appointment_cpt_codes: event['appointment_cpt_codes'],
					physician: event && event['physician_clinic']?
					event['physician_clinic']['physician']:null,
					physician_clinic: event && event['physician_clinic']?
					event['physician_clinic']:null,
					transportations: event['transportations'],
					reading_provider: event['reading_provider'],
					reading_provider_id: event['reading_provider_id'],
					cd_image: event['cd_image'],
					is_transportation: event['is_transportation'],
				};
			} else {
				this.doctorCalendarService.updateModalData = {
					appointment_title: event['appointment_title'],
					patientName: event['patientName'],
					patient_id: event['patient_id'],
					caseType: event['case_type_id'],
					case_id: event['case_id'],
					case_type_name: event['case_type_name'],
					doctor_id: event['doctor_info']['user_id'],
					startDateTime: event['start'],
					priority_id: event['priority_id'],
					appointment_type_id: event['appointment_type_id'],
					appointment_type_description: event['appointment_type_description'],
					appointment_type_slug: event['appointment_type_slug'],
					confirmation_status: event['confirmation_status'],
					visitTypeid: event['appointment_type_id'],
					//   "roomId": event["realRoomId"],
					appointment_duration: event['appointment_duration'],
					time_slot: event['time_slots'],
					comments: event['comments'],
					facility_id: event['facility_id'],
					speciality_id: event['speciality_id'],
					appointmentId: event['appId'],
					appointment_cpt_codes: event['appointment_cpt_codes'],
					physician: event && event['physician_clinic']?
					event['physician_clinic']['physician']:null,
					physician_clinic: event && event['physician_clinic']?
					event['physician_clinic']:null,					
					transportations: event['transportations'],
					reading_provider: event['reading_provider'],
					reading_provider_id: event['reading_provider_id'],
					cd_image: event['cd_image'],
					is_transportation: event['is_transportation'],
				};
			}
		} else {
			if (event['available_doctor_id'] == 0 || event['available_doctor_id'] == null) {
				this.doctorCalendarService.updateModalData = {
					appointment_title: event['appointment_title'],
					patientName: event['patientName'],
					patient_id: event['patient_id'],
					visitTypeid: event['appointment_type_id'],
					caseType: event['case_type_id'],
					case_id: event['case_id'],
					case_type_name: event['case_type_name'],
					doctor_id: 0,
					appointment_duration: event['appointment_duration'],
					time_slot: event['time_slots'],
					startDateTime: event['start'],
					priority_id: event['priority_id'],
					appointment_type_id: event['appointment_type_id'],
					confirmation_status: event['confirmation_status'],
					//   "roomId": event["roomId"],
					comments: event['comments'],
					facility_id: event['facility_id'],
					speciality_id: event['speciality_id'],
					appointmentId: event['appId'],
					reading_provider: event['reading_provider'],
					reading_provider_id: event['reading_provider_id'],
					cd_image: event['cd_image'],
					is_transportation: event['is_transportation'],
				};
			} else {
				this.doctorCalendarService.updateModalData = {
					appointment_title: event['appointment_title'],
					patientName: event['patientName'],
					patient_id: event['patient_id'],
					visitTypeid: event['appointment_type_id'],
					caseType: event['case_type_id'],
					case_id: event['case_id'],
					case_type_name: event['case_type_name'],
					doctor_id: event['doctor_id'],
					startDateTime: event['start'],
					priority_id: event['priority_id'],
					appointment_type_id: event['appointment_type_id'],
					confirmation_status: event['confirmation_status'],
					//   "roomId": event["roomId"],
					appointment_duration: event['appointment_duration'],
					time_slot: event['time_slots'],
					comments: event['comments'],
					facility_id: event['facility_id'],
					speciality_id: event['speciality_id'],
					appointmentId: event['appId'],
					doctorName:
						event['doctor_info'] &&
						event['doctor_info']['first_name'] +
							' ' +
							event['doctor_info']['middle_name'] +
							event['doctor_info']['last_name'],
					reading_provider: event['reading_provider'],
					reading_provider_id: event['reading_provider_id'],
					cd_image: event['cd_image'],
					is_transportation: event['is_transportation'],
				};
			}
		}
		this.doctorNameModal =
			event['doctor_info'] &&
			event['doctor_info']['first_name'] +
				(event['doctor_info']['middle_name'] ? ' ' + event['doctor_info']['middle_name'] : '') +
				' ' +
				event['doctor_info']['last_name'];
		const activeModal = this.updateModal.open(UpdateAppoitModalComponent, {
			size: 'lg',
			backdrop: 'static',
			keyboard: false,
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
	getRefreshed(){

		this.subscription.push(this.mainService._oneDayAppointmentsData.pipe(takeUntil(this.unsubscribe)).subscribe(res =>{
			if(res && res.length)
				{
					for (let i = 0; i < this.monthEvents.length; i++) {
						if (
							res[0] && res[0]['start'].toString().substring(0, 15) ==
							new Date(this.monthEvents[i].start_date).toString().substring(0, 15) 
							){
								if((res && res[0]&&res[0].date_list_id) == (this.monthEvents[i].appointments &&this.monthEvents[i].appointments.length && this.monthEvents[i].appointments[0]&&this.monthEvents[i].appointments[0].date_list_id)){
							    	this.monthEvents[i].appointments = res;			
								}
						}
					}
				}
			this.unsubscribe.next();
			this.unsubscribe.complete();
		}));

	}
}
