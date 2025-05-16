import { DatePipeFormatService } from './../../../../../../../services/datePipe-format.service';
import {
	Component,
	AfterViewInit,
	Input,
	Output,
	EventEmitter,
	ChangeDetectorRef,
	OnChanges,
	OnInit,
	OnDestroy,
	LOCALE_ID,
	Inject,
	TemplateRef,
	ViewChild,
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import {
	WeekDay,
	CalendarEvent,
	WeekViewAllDayEvent,
	WeekView,
	ViewPeriod,
	WeekViewHourColumn,
	DayViewEvent,
	DayViewHourSegment,
	DayViewHour,
} from 'calendar-utils';
import { ResizeEvent } from 'angular-resizable-element';
import { CalendarDragHelper } from '../common/calendar-drag-helper.provider';
import { CalendarResizeHelper } from '../common/calendar-resize-helper.provider';
import { UpdateAppoitModalComponent } from '../../../../../modals/update-appoit-modal/update-appoit-modal.component';
import {
	CalendarEventTimesChangedEvent,
	CalendarEventTimesChangedEventType,
} from '../common/calendar-event-times-changed-event.interface';
import { CalendarUtils } from '../common/calendar-utils.provider';
import {
	validateEvents,
	trackByIndex,
	roundToNearest,
	trackByWeekDayHeaderDate,
	trackByHourSegment,
	trackByHour,
	getMinutesMoved,
	getDefaultEventEnd,
	getMinimumEventHeightInMinutes,
	addDaysWithExclusions,
	trackByDayOrWeekEvent,
	isDraggedWithinPeriod,
	shouldFireDroppedEvent,
	getWeekViewPeriod,
} from '../common/util';
import { DateAdapter } from '../../date-adapters/date-adapter';
import { DragEndEvent, DropEvent, DragMoveEvent } from 'angular-draggable-droppable';
import { ShowModalComponent } from '../../modules/month/show-modal/show-modal.component';
import { AssignSpecialityUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-speciality/assign-speciality-urls-enum';
import { PlacementArray } from 'positioning';
import { WeekSubjectService } from './subject.service';
import { DoctorCalendarService } from '../../../../../doctor-calendar.service';
import { SubjectService } from '../../../../../subject.service';
import { CreateAppointmentComponent } from '../../../../../modals/create-appointment/create-appointment.component';
import { NotesComponent } from '../../../../../modals/add-notes/notes.component';
import { DeleteReasonComponent } from '../../../../../modals/delete-reason/delete-reason.component';
import { UnavailabilityDeleteReasonComponent } from '../../../../../modals/unavailability-delete-reason/unavailability-delete-reason.component';
import {
	StorageData,
	HttpSuccessResponse,
	UsersType,
} from '@appDir/pages/content-pages/login/user.class';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { Router } from '@angular/router';
import { DoctorCalendarUrlsEnum } from '@appDir/shared/modules/doctor-calendar/doctor-calendar-urls-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { AclServiceCustom } from '../../../../../../../../acl-custom.service';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import {
	convert12,
	convertDateTimeForRetrieving,
	convertTimeTo24Hours,
	removeEmptyAndNullsFormObject,
	stdTimezoneOffset,
	WithoutTime,
} from '@appDir/shared/utils/utils.helpers';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ShareAbleFilter } from '@appDir/shared/models/share-able-filter';
import { TemplateUrlsEnum } from '@appDir/front-desk/masters/master-users/users/user-edit/template/template-urls-enum';
import { MainService } from '@appDir/shared/services/main-service';
import { EnumSpecialtyTypes } from '../common/specialty-types';
import { AssignRoomsUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-rooms/assign-rooms-urls-enum';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgSelectShareableComponent } from '@appDir/shared/ng-select-shareable/ng-select-shareable.component';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
export interface WeekViewAllDayEventResize {
	originalOffset: number;
	originalSpan: number;
	edge: string;
}

export interface CalendarWeekViewBeforeRenderEvent extends WeekView {
	header: WeekDay[];
}

@Component({
	selector: 'mwl-calendar-week-view-doc',
	templateUrl: 'calendar-week-view.component.html',
	styleUrls: ['./calendar-week-view.scss'],
})
export class CalendarWeekViewComponent
	extends PermissionComponent
	implements OnChanges, OnInit, OnDestroy
{
	@Output() childEvent = new EventEmitter();
	@Output() startEvaluation = new EventEmitter();
	@Output() startEvualtionFlagShow = new EventEmitter();
	@Output() showEvaluation = new EventEmitter();
	@Output() currentAssignments = new EventEmitter();
	@Input() allDoc: any;
	@Input() currentDoc: any;

	@Input() headerOn: any;
	public doctorNameModal;
	any;
	@Input() currentDocId: any;
	@Input() speciality: any;
	@Input() doc: any;

	@Input() clinicId: any;
	@Input() docIndex: any;
	@Input() timeAgaintsPraticeLocation: any;
	@Input()
	viewDate: Date;

	/**
	 * An array of events to display on view
	 * The schema is available here: https://github.com/mattlewis92/calendar-utils/blob/c51689985f59a271940e30bc4e2c4e1fee3fcb5c/src/calendarUtils.ts#L49-L63
	 */
	@Input()
	events: CalendarEvent[] = [];

	/**
	 * An array of day indexes (0 = sunday, 1 = monday etc) that will be hidden on the view
	 */
	@Input()
	excludeDays: number[] = [];

	/**
	 * An observable that when emitted on will re-render the current view
	 */
	@Input()
	refresh: Subject<any>;

	/**
	 * The locale used to format dates
	 */
	@Input()
	locale: string;

	/**
	 * The placement of the event tooltip
	 */
	@Input()
	tooltipPlacement: PlacementArray = 'auto';

	/**
	 * A custom template to use for the event tooltips
	 */
	@Input()
	tooltipTemplate: TemplateRef<any>;

	/**
	 * Whether to append tooltips to the body or next to the trigger element
	 */
	@Input()
	tooltipAppendToBody: boolean = true;

	/**
	 * The start number of the week
	 */
	@Input()
	weekStartsOn: number;

	/**
	 * A custom template to use to replace the header
	 */
	@Input()
	headerTemplate: TemplateRef<any>;

	/**
	 * A custom template to use for week view events
	 */
	@Input()
	eventTemplate: TemplateRef<any>;

	/**
	 * A custom template to use for event titles
	 */
	@Input()
	eventTitleTemplate: TemplateRef<any>;

	/**
	 * A custom template to use for event actions
	 */
	@Input()
	eventActionsTemplate: TemplateRef<any>;

	/**
	 * The precision to display events.
	 * `days` will round event start and end dates to the nearest day and `minutes` will not do this rounding
	 */
	@Input()
	precision: 'days' | 'minutes' = 'days';

	/**
	 * An array of day indexes (0 = sunday, 1 = monday etc) that indicate which days are weekends
	 */
	@Input()
	weekendDays: number[];

	/**
	 * Whether to snap events to a grid when dragging
	 */
	@Input()
	snapDraggedEvents: boolean = true;

	/**
	 * The number of segments in an hour. Must be <= 6
	 */
	@Input()
	hourSegments: number = 3;

	/**
	 * The height in pixels of each hour segment
	 */
	@Input()
	hourSegmentHeight: number = 30;

	/**
	 * The day start hours in 24 hour time. Must be 0-23
	 */
	@Input()
	dayStartHour: number = 0;

	/**
	 * The day start minutes. Must be 0-59
	 */
	@Input()
	dayStartMinute: number = 0;

	/**
	 * The day end hours in 24 hour time. Must be 0-23
	 */
	@Input()
	dayEndHour: number = 23;

	/**
	 * The day end minutes. Must be 0-59
	 */
	@Input()
	dayEndMinute: number = 59;

	/**
	 * A custom template to use to replace the hour segment
	 */
	@Input()
	hourSegmentTemplate: TemplateRef<any>;

	/**
	 * The grid size to snap resizing and dragging of hourly events to
	 */
	@Input()
	eventSnapSize: number;

	/**
	 * A custom template to use for the all day events label text
	 */
	@Input()
	allDayEventsLabelTemplate: TemplateRef<any>;

	@ViewChild('evualtionTemplateEvent') evualtionTemplateEvent: NgSelectShareableComponent;

	/**
	 * The number of days in a week. Can be used to create a shorter or longer week view.
	 * The first day of the week will always be the `viewDate`
	 */
	@Input()
	daysInWeek: number;

	/**
	 * Called when a header week day is clicked. Adding a `cssClass` property on `$event.day` will add that class to the header element
	 */
	@Output()
	dayHeaderClicked = new EventEmitter<{
		day: WeekDay;
	}>();

	/**
	 * Called when the event title is clicked
	 */
	@Output()
	eventClicked = new EventEmitter<{
		event: CalendarEvent;
	}>();

	/**
	 * Called when an event is resized or dragged and dropped
	 */
	@Output()
	eventTimesChanged = new EventEmitter<CalendarEventTimesChangedEvent>();

	/**
	 * An output that will be called before the view is rendered for the current week.
	 * If you add the `cssClass` property to a day in the header it will add that class to the cell element in the template
	 */
	@Output()
	beforeViewRender = new EventEmitter<CalendarWeekViewBeforeRenderEvent>();

	/**
	 * Called when an hour segment is clicked
	 */
	@Output()
	hourSegmentClicked = new EventEmitter<{
		date: Date;
	}>();

	events_Out: any;

	/**
	 * @hidden
	 */
	days: WeekDay[];

	/**
	 * @hidden
	 */
	view: WeekView;

	/**
	 * @hidden
	 */
	refreshSubscription: Subscription;

	/**
	 * @hidden
	 */
	allDayEventResizes: Map<WeekViewAllDayEvent, WeekViewAllDayEventResize> = new Map();

	/**
	 * @hidden
	 */
	timeEventResizes: Map<CalendarEvent, ResizeEvent> = new Map();

	/**
	 * @hidden
	 */
	eventDragEnter = 0;

	/**
	 * @hidden
	 */
	dragActive = false;

	/**
	 * @hidden
	 */
	validateDrag: (args: any) => boolean;

	/**
	 * @hidden
	 */
	validateResize: (args: any) => boolean;

	/**
	 * @hidden
	 */
	dayColumnWidth: number;

	/**
	 * @hidden
	 */
	calendarId = Symbol('angular calendar week view id');

	/**
	 * @hidden
	 */
	trackByIndex = trackByIndex;

	/**
	 * @hidden
	 */
	trackByWeekDayHeaderDate = trackByWeekDayHeaderDate;

	/**
	 * @hidden
	 */
	trackByHourSegment = trackByHourSegment;

	/**
	 * @hidden
	 */
	trackByHour = trackByHour;

	/**
	 * @hidden
	 */
	trackByDayOrWeekEvent = trackByDayOrWeekEvent;

	@Input() index: any;

	@Input() swaps: any;
	@Input() checkDay: any;
	dragEnter: any;
	@Output() highl: any = new EventEmitter<any>();

	appointmentForm: FormGroup;
	eventsSubject: Subject<any> = new Subject<any>();
	EnumApiPath = AssignSpecialityUrlsEnum;
	templateUrls = TemplateUrlsEnum.get_all_templates;
	conditionalExtraApiParamsForTemplateGet: any = {};
	conditionalExtraApiParamsForProvidersGet: any = {};
	conditionalExtraApiParamsForTechnicianGet: any = {};
	popOver;
	EnumSpecialtyType = EnumSpecialtyTypes;
	middle_name;
	first_name;
	last_name;
	/**
	 * @hidden
	 */
	trackByHourColumn = (index: number, column: WeekViewHourColumn) =>
		column.hours[0] ? column.hours[0].segments[0].date.toISOString() : column;

	public todayNote: any = 'hjfvbdfhdsfesdfbbndfjkbdsjkfbjdsbfjkdbfjkbfb';
	public totalDays: any = [];
	@Input() patient: string;
	public note: any = [];
	private noteButton: boolean = false;
	loadSpin:boolean = false;
	private localStorageId: string;
	private deleteUnavailabilityButton: boolean = false;
	private startEvalButton: boolean = false;
	private addAppointmentButton: boolean = false;
	public temp;
	public apptdata:any;
	getappointmentev$:any
	currappointmentdta :any;
	addCptForm: FormGroup;
	selectedCPTs:any = [];
	lstCptorModifiers: any = [];
	data: any = [];
	cptmodalRef: NgbModalRef;
	public typeForAppointment: any;
	@Input() highlightdayH: any;
	public update_permission_date = new Date();
	appointments: any[] = [];
	pageNumber: number;
	routeFrom: any;
	/**
	 * @hidden
	 */
	constructor(
		aclService: AclService,
		public ShowModalOpener: NgbModal,
		router: Router,
		public aclCustom: AclServiceCustom,
		protected requestService: RequestService,
		private cdr: ChangeDetectorRef,
		public updateModal: NgbModal,
		public notesModal: NgbModal,
		public docService: DoctorCalendarService,
		private utils: CalendarUtils,
		public subject: SubjectService,
		public _subjectService: WeekSubjectService,
		public doctorCalendarService: DoctorCalendarService,
		private storageData: StorageData,
		@Inject(LOCALE_ID) locale: string,
		public datePipeService: DatePipeFormatService,
		private dateAdapter: DateAdapter,
		private toastrService: ToastrService,
		private customDiallogService: CustomDiallogService,
		private fb: FormBuilder,
		private mainService: MainService,
		private localStorage: LocalStorage
	) {
		super(aclService, router);
		this.localStorageId = JSON.stringify(this.storageData.getUserId());
		if(this.router.url.includes('cases')) {
			const segments = this.router.url.split('/');
			this.routeFrom = segments[4];
		}
		else {
			this.routeFrom = 'provider_calendar'
		}
	}

	/**
	 * @hidden
	 */
	ngAfterViewInit() {
		this._subjectService.refreshScroll('scroll');
		this.isProviderLoggedIn();
	}
	indexDay: any;
	speciality_Check: boolean;
	ngOnInit(): void {
		this.localStorage.set('appdata',JSON.stringify({}));
		this.InitAppointmentModalForm();
		this.refreshAll();
		this.update_permission_date.setDate(this.update_permission_date.getDate() - 1);
		this.update_permission_date.setHours(23);
		this.update_permission_date.setMinutes(59);
		this.update_permission_date.setSeconds(59);
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
			this.aclService.hasPermission(this.userPermissions.start_evaluation) ||
			this.storageData.isSuperAdmin()
		) {
			this.startEvalButton = true;
		}
		if (
			this.aclService.hasPermission(this.userPermissions.appointment_add) ||
			this.storageData.isSuperAdmin()
		) {
			this.addAppointmentButton = true;
		}
		for (let i = 0; i < this.view.hourColumns.length; i++) {
			if (new Date(this.view.hourColumns[i].date) === this.viewDate) {
				this.indexDay = i;
			}
		}
		this._subjectService.castNote.subscribe((response) => {
			this.note = [];
			if (this.patient != 'true') {
				for (let i = 0; i < response.length; i++) {
					if (
						response[i]['note'] &&
						this.currentDocId == response[i].doctor_id &&
						this.currentDoc.doctor
					) {
						this.note.push(response[i]);
					}
				}
				this.refreshAll();
			}
		});
		this._subjectService.castPatientCalendar.subscribe((response) => {
			if (this.patient === 'true') {
				if (response[0] && response[0]['patient'] === 'true' && response[0]['noData']) {
					this.events = [];
					this.refreshAll();
					this.cdr.markForCheck();
				} else if (response[0] && response[0]['patient'] === 'true') {
					this.events = response;
					this.refreshAll();
					this.cdr.markForCheck();
				}
			}
		});

		this._subjectService.cast.subscribe((response) => {
			if (this.patient !== 'true') {
				if (response[0] && response[0]['patient'] !== 'true') {
					let temp = [];
					// for (let i = 0; i < response.length; i++) {
					//   for (let z = 0; z==0 || (this.currentDoc.doctor &&
					//     this.currentDoc.doctor.specAllArray && z < this.currentDoc.doctor.specAllArray.length); z++) {
					//     if (!response[i]["note"] &&
					//       ((this.currentDocId === response[i]["docId"] && this.currentDoc.doctor && !response[i]["specAssignId"])
					//         || (this.currentDoc.doctor && this.currentDoc.doctor.specAllArray && response[i]['specAssignId'] && response[i]["spec_app"]
					//           && response[i]['clinicId'] == this.currentDoc.doctor.specAllArray[z].facilityId)
					//         || (this.currentDocId === response[i]["specId"] && !this.currentDoc.doctor &&
					//           (!response[i]['docAssignId'] || !response[i]['is_doc']) &&
					//           (response[i]['specAssignId'] || !response[i]["docId"])))) {
					//       temp.push(response[i])
					//       break;
					//     } else if (response[i]["note"]) {
					//     }
					//   }
					// }&& !response[i]["available_speciality_id"]

					for (let i = 0; i < response.length; i++) {
						if (
							!response[i]['note'] &&
							((this.currentDocId === response[i]['doctor_id'] && this.currentDoc.doctor) ||
								(this.currentDoc.doctor &&
									this.currentDoc.doctor.specialities &&
									response[i]['available_speciality_id'] &&
									response[i]['spec_app']) ||
								(this.currentDocId === response[i]['speciality_id'] &&
									!this.currentDoc.doctor &&
									(!response[i]['available_doctor_id'] || !response[i]['is_doc']) &&
									(response[i]['available_speciality_id'] || !response[i]['doctor_id'])))
						) {
							temp.push(response[i]);
							//   break;
						} else if (response[i]['note']) {
						}
					}
					this.events = temp;
					this.refreshAll();
					this.cdr.markForCheck();
				} else if (response.length === 0) {
					this.events = [];
					this.refreshAll();
					this.cdr.markForCheck();
				}
			}
		});
		if (this.refresh) {
			this.refreshSubscription = this.refresh.subscribe(() => {
				this.refreshAll();
				this.cdr.markForCheck();
			});
		}
		// this._subjectService.refresh(this.events)

		//HAMZA
		//console.log("DETAILS CLINIC SPECIALITY",this.clinicId," DOC",this.doc,"ALL Doc", this.allDoc, "Current Doc", this.currentDoc);
		//
	}

	/**
	 * @hidden
	 */
	ngOnChanges(changes: any): void {
		if (changes.viewDate || changes.excludeDays || changes.weekendDays || changes.daysInWeek) {
			this.refreshHeader();
		}

		if (changes.events) {
			validateEvents(this.events);
			this._subjectService.refresh(this.events);
		}

		if (
			changes.viewDate ||
			changes.dayStartHour ||
			changes.dayStartMinute ||
			changes.dayEndHour ||
			changes.dayEndMinute ||
			changes.hourSegments ||
			changes.weekStartsOn ||
			changes.weekendDays ||
			changes.excludeDays ||
			changes.hourSegmentHeight ||
			changes.events ||
			changes.daysInWeek
		) {
			this.refreshBody();
		}
	}

	public async openShowModal(event) {
		await this.requestService
			.sendRequest(
				AssignSpecialityUrlsEnum.getSpecialityFiles + '?appointment_id=' + event['appId'],
				'GET',
				REQUEST_SERVERS.fd_api_url,
			)
			.subscribe((res: any) => {
				this.temp = res.data;
				if (this.temp.length > 1) {
					this.doctorCalendarService.updateModalData = {
						// appointmentTitle: event['appointmentTitle'],
						// patientName: event['patientName'],
						// chartNo: event['chartNo'],
						// caseId: event['caseId'],
						// caseType : event['caseType'],
						// docId: 0,
						// duration: event['duration'] || event['specAssign']['specialities']['timeSlot'],
						// timeSlot: event['timeSlot'],
						// startDateTime: event['start'],
						// priorityId: event['appointmentPriorityId'],
						// appointmentTypeId: event['appointmentTypeId'],
						// appointmentTypeDescription: event['appointmentTypeDescription'],
						// appointmentConfirmationStatus: event['confirmationStatus'],
						// roomId: event['realRoomId'],
						// comments: event['comments'],
						// visitTypeid: event['appointmentTypeId'],
						// clinicId: event['clinicId'] || event['specAssign']['facility']['id'],
						// specId: event['specId'] || event['specAssign']['specialities']['id'],
						// appointmentId: event['appId'],

						appointment_title: event['appointment_title'],
						patientName: event['patientName'],
						patient_id: event['patient_id'],
						case_id: event['case_id'],
						case_type_id: event['case_type_id'],
						case_type_name: event['case_type_name'],
						doctor_id: 0,
						appointment_duration:
							event['appointment_duration'] || event['specAssign']['specialities']['timeSlot'],
						time_slot: event['time_slot'],
						startDateTime: event['start'],
						priority_id: event['priority_id'],
						appointment_type_id: event['appointment_type_id'],
						appointment_type_description: event['appointment_type_description'],
						appointment_type_slug: event['appointment_type_slug'],
						confirmation_status: event['confirmation_status'],
						comments: event['comments'],
						visitTypeid: event['appointment_type_id'],
						facility_id: event['facility_id'] || event['specAssign']['facility']['id'],
						speciality_id: event['speciality_id'] || event['specAssign']['specialities']['id'],
						appointmentId: event['appId'],
						chart_id: event['chart_id'],
						chart_id_formatted: event['chart_id_formatted'],
						is_active: event['is_active'],
					};
					// this.checker = true;
					this.temp = null;
					this.ShowModalOpener.open(ShowModalComponent, {
						size: 'lg',
						backdrop: 'static',
						keyboard: false,
					});
				} else if (this.temp.length == 1) {
					// this.checker = true;
					this.openInWindow(this.temp[0].pre_signed_url);
					this.temp = null;
				} else {
					this.toastrService.error('No report found!', 'Error');
					// this.checker = true;
					this.temp = null;
				}
			});
	}
	openInWindow(url) {
		window.open(
			url,
			'',
			'channelmode = yes, width = 600, height = 1000',
		);
	}
	openPopover(p){
	}
	getLinkwithAuthToken(link) {
		let token = this.storageData.getToken();
		if (token) {
			return `${link}&token=${token}`;
		} else {
			return link;
		}
	}
	/**
	 * @hidden
	 */
	ngOnDestroy(): void {
		if (this.refreshSubscription) {
			this.refreshSubscription.unsubscribe();
		}
	}

	private resizeStarted(eventsContainer: HTMLElement, minWidth?: number) {
		this.dayColumnWidth = this.getDayColumnWidth(eventsContainer);
		const resizeHelper: CalendarResizeHelper = new CalendarResizeHelper(eventsContainer, minWidth);
		this.validateResize = ({ rectangle }) => resizeHelper.validateResize({ rectangle });
		this.cdr.markForCheck();
	}

	/**
	 * @hidden
	 */
	timeEventResizeStarted(
		eventsContainer: HTMLElement,
		timeEvent: DayViewEvent,
		resizeEvent: ResizeEvent,
	): void {
		this.timeEventResizes.set(timeEvent.event, resizeEvent);
		this.resizeStarted(eventsContainer);
	}
	createAppointmentsWithCpts(addCptForm:FormGroup){
		this.loadSpin = true;
		let appId = this.currappointmentdta && this.currappointmentdta['appId'];
		let cpts_ids = addCptForm.get('cpt_codes_ids').value?addCptForm.get('cpt_codes_ids').value:[];
		this.cptmodalRef.close();
		this.subscription.push(this.requestService.sendRequest(
			DoctorCalendarUrlsEnum.createMultiAppointWithCPTS,
			'POST',
			REQUEST_SERVERS.schedulerApiUrl,
				{
					appointment_id: appId,
					cpt_codes: [...cpts_ids],
					time_zone: stdTimezoneOffset()
				}
		).subscribe((res:any)=>{
			if(res?.message === 'success' || res?.result?.data?.is_multi){
				this.loadSpin = false;
				let data = res?.result?.data;
				if(res?.result?.data?.is_multi){
					data['appointments'] = data['appointment'];
					delete res['appointment'];
				}
				this.view?.hourColumns.map(ele => {
					ele?.events.map(inner => {
						if(this.currappointmentdta?.start == inner?.event?.start) {
							inner.event['appointment_cpt_codes'] = data?.['appointments']?.[0]?.appointmentCptCodes;
						}
					})
				})
				this.getAppointmentsData(data,appId);
				if(res && res.result && res.result['data'] && res.result['data']['msg_alert_1']){
					this.toastrService.success(res && res.result && res.result['data'] && res.result['data']['msg_alert_1'],'Success')  
				}if(res && res.result && res.result['data'] && res.result['data']['msg_alert_2']){
					this.toastrService.success(res && res.result && res.result['data'] && res.result['data']['msg_alert_2'],'Success')  
				}
			}
		},(err)=>{
			this.loadSpin = false;
		}));
	}
	SelectionValueChangeCPT(ev:any){
		if(ev){
			this.addCptForm.patchValue({cpt_codes_ids:ev['formValue']});
		}
	}
	getAppointmentsData(updatedAppointentsData:any,appId:any){
		let timeSpan;
		let tempApp = updatedAppointentsData;
		if(tempApp && tempApp['appointments']){
		this.data = [];
		for (let i = 0; i < tempApp['appointments'].length; i++) {
			timeSpan = tempApp['appointments'][i]['time_slots'];
			var start: any = convertDateTimeForRetrieving(
				this.storageData,
				new Date(tempApp['appointments'][i]['scheduled_date_time']),
			);
			var end = new Date(start.getTime() + timeSpan * 60000);
			let startTime = new Date(start).toString().substring(16, 21);
			let endTime = new Date(end).toString().substring(16, 21);
			startTime = convert12(startTime);
			endTime = convert12(endTime);
			let deleteApp = false;
			let updateApp = false;
			if (
				this.aclService.hasPermission(this.userPermissions.appointment_delete) ||
				this.storageData.isSuperAdmin()
			) {
				deleteApp = true;
			}
			if (
				this.aclService.hasPermission(this.userPermissions.appointment_edit) ||
				this.storageData.isSuperAdmin()
			) {
				updateApp = true;
			}
			let can_access = false;
			if (
				this.aclService.hasPermission(this.userPermissions.start_evaluation) ||
				this.storageData.isSuperAdmin()
			) {
				can_access = true;
			}
			let newApptData = {
				date_list_id:tempApp['appointments'][i]['date_list_id'],
				updateApp: updateApp,
				deleteApp: deleteApp,
				can_access: can_access,
				startEval: can_access,
				start: start,
				end: end,
				color: tempApp.color,
				facility_name: tempApp['appointments'][i]['availableSpeciality']&&tempApp['appointments'][i]['availableSpeciality']['facilityLocation']&&tempApp['appointments'][i]['availableSpeciality']['facilityLocation']['facility']&&tempApp['appointments'][i]['availableSpeciality']['facilityLocation']['facility']['name'],
				facility_location_qualifier:tempApp['appointments'][i]['availableSpeciality']&&tempApp['appointments'][i]['availableSpeciality']['facilityLocation']&&tempApp['appointments'][i]['availableSpeciality']['facilityLocation']['qualifier'],
				facility_qualifier: tempApp['appointments'][i]['availableSpeciality']&&tempApp['appointments'][i]['availableSpeciality']['facilityLocation']&&tempApp['appointments'][i]['availableSpeciality']['facilityLocation']['facility']&&tempApp['appointments'][i]['availableSpeciality']['facilityLocation']['facility']['qualifier'],
				status: tempApp['appointments'][i]['showUpStatus'],
				showUpStatus:tempApp['appointments'][i]['showUpStatus'],
				facility_id: tempApp['appointments'][i]['availableSpeciality']&&tempApp['appointments'][i]['availableSpeciality']['facility_location_id'],
				appointmentType:tempApp['appointments'][i] && tempApp['appointments'][i]['appointmentType'],
				patientName: tempApp['appointments'][i]['patient']['middle_name']? tempApp['appointments'][i]['patient']['first_name'] +' ' +tempApp['appointments'][i]['patient']['middle_name'] +' ' +
				tempApp['appointments'][i]['patient']['last_name']: tempApp['appointments'][i]['patient']['first_name'] +' ' +tempApp['appointments'][i]['patient']['last_name'],
				first_name:tempApp['appointments'][i]['patient']['first_name'],
				middle_name: tempApp['appointments'][i]['patient']['middle_name'],
				last_name: tempApp['appointments'][i]['patient']['last_name'],
				title: tempApp['appointments'][i]['appointment_title'],
				appointment_title:tempApp['appointments'][i]['appointment_title'],
				picture: tempApp['appointments'][i]['picture'],
				available_doctor_id: tempApp['appointments'][i]['available_doctor_id'],
				doctor_id: tempApp['appointments'][i]['availableDoctor'] && tempApp['appointments'][i]['availableDoctor']['doctor_id'],
				patient_id: tempApp['appointments'][i]['patient_id'],
				chart_id: tempApp['appointments'][i]['chart_id'],
				chart_id_formatted: tempApp['appointments'][i]['chart_id_formatted'],
				is_active: tempApp['appointments'][i]['is_active'],
				priority_id: tempApp['appointments'][i]['priority_id'],
				speciality_id: tempApp['appointments'][i]['availableSpeciality'] && tempApp['appointments'][i]['availableSpeciality']['speciality']&& tempApp['appointments'][i]['availableSpeciality']['speciality']['id'],
				availableSpeciality:tempApp['appointments'][i]['availableSpeciality'],
				speciality_key: tempApp['appointments'][i]['availableSpeciality'] && tempApp['appointments'][i]['availableSpeciality']['speciality']&& tempApp['appointments'][i]['availableSpeciality']['speciality']['speciality_key'],
				confirmation_status: tempApp['appointments'][i]['confirmation_status'],
				speciality_name: tempApp['appointments'][i]['availableSpeciality'] && tempApp['appointments'][i]['availableSpeciality']['speciality']&& tempApp['appointments'][i]['availableSpeciality']['speciality']['name'],
				case_id: tempApp['appointments'][i]['case_id'],
				case_type_id: tempApp['appointments'][i]['case_type_id'],
				case_type_name: tempApp['appointments'][i]['case']&&tempApp['appointments'][i]['case']['caseType']&&tempApp['appointments'][i]['case']['caseType']['name'],
				appointment_billable: tempApp['appointments'][i].billable,
				billable:tempApp['appointments'][i].billable,
				has_app: tempApp['appointments'][i]['by_health_app'],
				by_health_app:tempApp['appointments'][i]['by_health_app'],
				appointment_type_id: tempApp['appointments'][i]['appointmentType'] && tempApp['appointments'][i]['appointmentType']['id'],
				appointment_type_slug: tempApp['appointments'][i]['appointmentType'] && tempApp['appointments'][i]['appointmentType']['slug'],
				appointment_type_description: tempApp['appointments'][i] && tempApp['appointments'][i]['appointmentType'] && tempApp['appointments'][i]['appointmentType']['name']?tempApp['appointments'][i]['appointmentType']['name']:null,
				appointment_type_qualifier: tempApp['appointments'][i]['appointment_type_qualifier'],
				appointment_priority_id: tempApp['appointments'][i]['priority_id'],
				appointment_status: tempApp['appointments'][i]['appointmentStatus'] && tempApp['appointments'][i]['appointmentStatus']['name'],
				appointmentStatus:tempApp['appointments'][i]['appointmentStatus'],
				appointment_status_slug: tempApp['appointments'][i]['appointmentStatus'] && tempApp['appointments'][i]['appointmentStatus']['slug'],
				appointment_visit_state_id: null,
				appointment_visit_state_name: null,
				appointment_visit_state_slug: null,
				available_doctor_is_provider_assignment:tempApp['appointments'][i]['availableDoctor']?tempApp['appointments'][i]['availableDoctor']['is_provider_assignment'] ? true:false:false,
				patientSessions:tempApp['appointments'][i]['patientSessions'],
				patientSession:tempApp['appointments'][i]['patientSessions'],
				scheduled_date_time: tempApp['appointments'][i]['scheduled_date_time'],
				comments: tempApp['appointments'][i]['comments'],
				approved: undefined,
				is_manual_specialty: tempApp['appointments'][i]['is_manual_specialty'],
				appId: tempApp['appointments'][i]['id'],
				id:tempApp['appointments'][i]['id'],
				start_time: startTime,
				appointment_duration: tempApp['appointments'][i]['time_slots'],
				time_slot: tempApp['appointments'][i]['time_slots'],
				time_slots:tempApp['appointments'][i]['time_slots'],
				end_time: endTime,
				availableDoctor:tempApp['appointments'][i]['availableDoctor'],
				doctor_info: tempApp['appointments'][i]['availableDoctor']&&tempApp['appointments'][i]['availableDoctor']['doctor'],
				checkCons: true,
				patient_status: tempApp['appointments'][i]['patient_status'],
				back_dated_check: tempApp['appointments'][i]['back_dated_check'],
				case_status: tempApp['appointments'][i]['case'] && tempApp['appointments'][i]['case']['caseStatus'] &&tempApp['appointments'][i]['case']['caseStatus']['name'] ,
				case:tempApp['appointments'][i]['case'],
				appointment_cpt_codes: tempApp['appointments'][i]['appointmentCptCodes'],
				appointmentCptCodes:tempApp['appointments'][i]['appointmentCptCodes'],
				physician:
				tempApp["appointments"][i]['physicianClinic']?
				tempApp["appointments"][i]['physician_id']:null,
				physician_clinic: tempApp["appointments"][i]['physicianClinic'],
				physicianClinic:tempApp["appointments"][i]['physicianClinic'],
				transportations: tempApp['appointments'][i]['transportations'],
				reading_provider: tempApp['appointments'][i]['reading_provider'],
				reading_provider_id: tempApp['appointments'][i]['reading_provider_id'],
				cd_image: tempApp['appointments'][i]['cd_image'],
				is_transportation: tempApp['appointments'][i]['is_transportation'],
			}
			if(this.appointments?.length) {
				let foundIndex = this.appointments.findIndex(element => element.appId == tempApp['appointments'][i]['id']);
				if(foundIndex != -1){
					if(tempApp && tempApp['appShifted']){
						this.appointments.splice(foundIndex,1)	
					}else{
						 this.appointments.splice(foundIndex,1,newApptData)
					}
				}
				else{
					this.appointments.push(newApptData);
				}
			}
			else{
				this.appointments.push(newApptData);
			}
		}
	}
	            this.pageNumber = 1;
		        this.data = [];
				this.data = [...this.appointments];
				for (let i = 0; i < this.data.length; i++) {
					if (this.data[i].start < this.update_permission_date) {
						if (this.aclService.hasPermission(this.userPermissions.update_previous_appointment)) {
							this.data[i].update_back = true;
						} else {
							this.data[i].update_back = false;
						}
					} else {
						this.data[i].update_back = true;
					}
				}
				if (this.data.length != 0) {
					if(this.data.length > 10){
						this.loadSpin = false;		
					}
					this.getVisitSessions(this.data?.[0]?.appId);
				}
				this.cdr.detectChanges();
				this.loadSpin = false;
			}
	setForm() {
		this.addCptForm = this.fb.group({
			cpt_codes_ids:[],
		});
	}
	addModal(model, data?,ev?,isDisabled?) {
		if(isDisabled){
			ev.stopPropagation();
		}
		else{
			this.setForm();
			this.currappointmentdta = data;
			this.typeForAppointment = this.currappointmentdta && this.currappointmentdta['appointment_type_id'];
			this.selectedCPTs = data['appointment_cpt_codes']&&data['appointment_cpt_codes'].map((cpt)=> cpt['billingCode']);
			let cpt_ids = this.selectedCPTs.map(x => x.id);
			this.addCptForm.patchValue({cpt_codes_ids:cpt_ids});
	
			this.lstCptorModifiers = [];
			let ngbModalOptions: NgbModalOptions = {
				backdrop: 'static',
				keyboard: false,
				windowClass: 'modal_extraDOc',
			};
			this.cptmodalRef = this.ShowModalOpener.open(model, ngbModalOptions);
		}
	}

	/**
	 * @hidden
	 */
	timeEventResizing(timeEvent: DayViewEvent, resizeEvent: ResizeEvent) {
		this.timeEventResizes.set(timeEvent.event, resizeEvent);
		const adjustedEvents = new Map<CalendarEvent, CalendarEvent>();

		const tempEvents = [...this.events];

		this.timeEventResizes.forEach((lastResizeEvent, event) => {
			const newEventDates = this.getTimeEventResizedDates(event, lastResizeEvent);
			const adjustedEvent = { ...event, ...newEventDates };
			adjustedEvents.set(adjustedEvent, event);
			const eventIndex = tempEvents.indexOf(event);
			tempEvents[eventIndex] = adjustedEvent;
		});

		this.restoreOriginalEvents(tempEvents, adjustedEvents);
	}

	/**
	 * @hidden
	 */
	timeEventResizeEnded(timeEvent: DayViewEvent) {
		this.view = this.getWeekView(this.events);
		const lastResizeEvent = this.timeEventResizes.get(timeEvent.event);
		this.timeEventResizes.delete(timeEvent.event);
		const newEventDates = this.getTimeEventResizedDates(timeEvent.event, lastResizeEvent);
		this.eventTimesChanged.emit({
			newStart: newEventDates.start,
			newEnd: newEventDates.end,
			event: timeEvent.event,
			type: CalendarEventTimesChangedEventType.Resize,
		});
	}

	/**
	 * @hidden
	 */
	allDayEventResizeStarted(
		allDayEventsContainer: HTMLElement,
		allDayEvent: WeekViewAllDayEvent,
		resizeEvent: ResizeEvent,
	): void {
		this.allDayEventResizes.set(allDayEvent, {
			originalOffset: allDayEvent.offset,
			originalSpan: allDayEvent.span,
			edge: typeof resizeEvent.edges.left !== 'undefined' ? 'left' : 'right',
		});
		this.resizeStarted(allDayEventsContainer, this.getDayColumnWidth(allDayEventsContainer));
	}

	/**
	 * @hidden
	 */
	allDayEventResizing(
		allDayEvent: WeekViewAllDayEvent,
		resizeEvent: ResizeEvent,
		dayWidth: number,
	): void {
		const currentResize: WeekViewAllDayEventResize = this.allDayEventResizes.get(allDayEvent);

		if (resizeEvent.edges.left) {
			const diff: number = Math.round(+resizeEvent.edges.left / dayWidth);
			allDayEvent.offset = currentResize.originalOffset + diff;
			allDayEvent.span = currentResize.originalSpan - diff;
		} else if (resizeEvent.edges.right) {
			const diff: number = Math.round(+resizeEvent.edges.right / dayWidth);
			allDayEvent.span = currentResize.originalSpan + diff;
		}
	}

	/**
	 * @hidden
	 */
	allDayEventResizeEnded(allDayEvent: WeekViewAllDayEvent): void {
		const currentResize: WeekViewAllDayEventResize = this.allDayEventResizes.get(allDayEvent);

		const allDayEventResizingBeforeStart = currentResize.edge === 'left';
		let daysDiff: number;
		if (allDayEventResizingBeforeStart) {
			daysDiff = allDayEvent.offset - currentResize.originalOffset;
		} else {
			daysDiff = allDayEvent.span - currentResize.originalSpan;
		}

		allDayEvent.offset = currentResize.originalOffset;
		allDayEvent.span = currentResize.originalSpan;

		let newStart: Date = allDayEvent.event.start;
		let newEnd: Date = allDayEvent.event.end || allDayEvent.event.start;
		if (allDayEventResizingBeforeStart) {
			newStart = this.dateAdapter.addDays(newStart, daysDiff);
		} else {
			newEnd = this.dateAdapter.addDays(newEnd, daysDiff);
		}

		this.eventTimesChanged.emit({
			newStart,
			newEnd,
			event: allDayEvent.event,
			type: CalendarEventTimesChangedEventType.Resize,
		});
		this.allDayEventResizes.delete(allDayEvent);
	}

	/**
	 * @hidden
	 */
	getDayColumnWidth(eventRowContainer: HTMLElement): number {
		return Math.floor(eventRowContainer.offsetWidth / this.days.length);
	}

	/**
	 * @hidden
	 */
	eventDropped(
		dropEvent: DropEvent<{ event?: CalendarEvent; calendarId?: symbol }>,
		date: Date,
		allDay: boolean,
	): void {
		if (shouldFireDroppedEvent(dropEvent, date, allDay, this.calendarId)) {
			this.eventTimesChanged.emit({
				type: CalendarEventTimesChangedEventType.Drop,
				event: dropEvent.dropData.event,
				newStart: date,
				allDay,
			});
		}
	}

	/**
	 * @hidden
	 */
	dragStarted(eventsContainer: HTMLElement, event: HTMLElement, dayEvent?: DayViewEvent): void {
		this.dayColumnWidth = this.getDayColumnWidth(eventsContainer);
		const dragHelper: CalendarDragHelper = new CalendarDragHelper(eventsContainer, event);
		this.validateDrag = ({ x, y }) =>
			this.allDayEventResizes.size === 0 &&
			this.timeEventResizes.size === 0 &&
			dragHelper.validateDrag({
				x,
				y,
				snapDraggedEvents: this.snapDraggedEvents,
			});
		this.dragActive = true;
		this.eventDragEnter = 0;
		if (!this.snapDraggedEvents && dayEvent) {
			this.view.hourColumns.forEach((column) => {
				const linkedEvent = column.events.find(
					(columnEvent) => columnEvent.event === dayEvent.event && columnEvent !== dayEvent,
				);
				// hide any linked events while dragging
				if (linkedEvent) {
					linkedEvent.width = 0;
					linkedEvent.height = 0;
				}
			});
		}
		this.cdr.markForCheck();
	}

	/**
	 * @hidden
	 */
	dragMove(dayEvent: DayViewEvent, dragEvent: DragMoveEvent) {
		if (this.snapDraggedEvents) {
			const newEventTimes = this.getDragMovedEventTimes(
				dayEvent,
				dragEvent,
				this.dayColumnWidth,
				true,
			);
			const originalEvent = dayEvent.event;
			const adjustedEvent = { ...originalEvent, ...newEventTimes };
			const tempEvents = this.events.map((event) => {
				if (event === originalEvent) {
					return adjustedEvent;
				}
				return event;
			});
			this.restoreOriginalEvents(tempEvents, new Map([[adjustedEvent, originalEvent]]));
		}
	}

	/**
	 * @hidden
	 */
	dragEnded(
		weekEvent: WeekViewAllDayEvent | DayViewEvent,
		dragEndEvent: DragEndEvent,
		dayWidth: number,
		useY = false,
	): void {
		this.view = this.getWeekView(this.events);
		this.dragActive = false;
		const { start, end } = this.getDragMovedEventTimes(weekEvent, dragEndEvent, dayWidth, useY);
		if (this.eventDragEnter > 0 && isDraggedWithinPeriod(start, end, this.view.period)) {
			this.eventTimesChanged.emit({
				newStart: start,
				newEnd: end,
				event: weekEvent.event,
				type: CalendarEventTimesChangedEventType.Drag,
				allDay: !useY,
			});
		}
	}

	private refreshHeader(): void {
		this.days = this.utils.getWeekViewHeader({
			viewDate: this.viewDate,
			weekStartsOn: this.weekStartsOn,
			excluded: this.excludeDays,
			weekendDays: this.weekendDays,
			...getWeekViewPeriod(
				this.dateAdapter,
				this.viewDate,
				this.weekStartsOn,
				this.excludeDays,
				this.daysInWeek,
			),
		});
		// if(this.headerOn=='true'){
		// 	for(let p=0;p<this.days.length;p++) {
		// 		for (let i = 0; i < this.note.length; i++) {
		// 			this.days[p]["Note"]='false'
		// 			let date=new Date(this.days[p].date)
		// 			if (this.note[i]["startDate"].getDate() === date.getDate() &&
		// 				this.note[i]["startDate"].getDay() === date.getDay() &&
		// 				this.note[i]["startDate"].getMonth() === date.getMonth() &&
		// 				this.note[i]["startDate"].getFullYear() === date.getFullYear()) {
		// 				this.days[p]["Note"]='true'
		// 			}
		// 		}
		// 	}
		// }

		this.emitBeforeViewRender();
	}

	private refreshBody(): void {
		this.view = this.getWeekView(this.events);
		this.emitBeforeViewRender();
	}

	private refreshAll(): void {
		this.refreshHeader();
		this.refreshBody();
	}

	private emitBeforeViewRender(): void {
		if (this.days && this.view) {
			this.beforeViewRender.emit({
				header: this.days,
				...this.view,
			});
		}
	}

	private getWeekView(events: CalendarEvent[]) {
		return this.utils.getWeekView({
			events,
			viewDate: this.viewDate,
			weekStartsOn: this.weekStartsOn,
			excluded: this.excludeDays,
			precision: this.precision,
			absolutePositionedEvents: true,
			hourSegments: this.hourSegments,
			dayStart: {
				hour: this.dayStartHour,
				minute: this.dayStartMinute,
			},
			dayEnd: {
				hour: this.dayEndHour,
				minute: this.dayEndMinute,
			},
			segmentHeight: this.hourSegmentHeight,
			weekendDays: this.weekendDays,
			...getWeekViewPeriod(
				this.dateAdapter,
				this.viewDate,
				this.weekStartsOn,
				this.excludeDays,
				this.daysInWeek,
			),
		});
	}

	private getDragMovedEventTimes(
		weekEvent: WeekViewAllDayEvent | DayViewEvent,
		dragEndEvent: DragEndEvent | DragMoveEvent,
		dayWidth: number,
		useY: boolean,
	) {
		const daysDragged = roundToNearest(dragEndEvent.x, dayWidth) / dayWidth;
		const minutesMoved = useY
			? getMinutesMoved(
					dragEndEvent.y,
					this.hourSegments,
					this.hourSegmentHeight,
					this.eventSnapSize,
			  )
			: 0;

		const start = this.dateAdapter.addMinutes(
			this.dateAdapter.addDays(weekEvent.event.start, daysDragged),
			minutesMoved,
		);
		let end: Date;
		if (weekEvent.event.end) {
			end = this.dateAdapter.addMinutes(
				this.dateAdapter.addDays(weekEvent.event.end, daysDragged),
				minutesMoved,
			);
		}

		return { start, end };
	}

	private restoreOriginalEvents(
		tempEvents: CalendarEvent[],
		adjustedEvents: Map<CalendarEvent, CalendarEvent>,
	) {
		this.view = this.getWeekView(tempEvents);
		const adjustedEventsArray = tempEvents.filter((event) => adjustedEvents.has(event));
		this.view.hourColumns.forEach((column) => {
			adjustedEventsArray.forEach((adjustedEvent) => {
				const originalEvent = adjustedEvents.get(adjustedEvent);
				const existingColumnEvent = column.events.find(
					(columnEvent) => columnEvent.event === adjustedEvent,
				);
				if (existingColumnEvent) {
					// restore the original event so trackBy kicks in and the dom isn't changed
					existingColumnEvent.event = originalEvent;
				} else {
					// add a dummy event to the drop so if the event was removed from the original column the drag doesn't end early
					column.events.push({
						event: originalEvent,
						left: 0,
						top: 0,
						height: 0,
						width: 0,
						startsBeforeDay: false,
						endsAfterDay: false,
					});
				}
			});
		});
		adjustedEvents.clear();
	}

	startEvaluationAndFlagShowEmit(event) {
		localStorage.setItem('routeFrom', this.routeFrom);
		this.localStorage.set('appdata',JSON.stringify({...event,evalFrom:'dayview'}));
		event['template_id'] =
			this.appointmentForm && this.appointmentForm.value && this.appointmentForm.value.template_id
				? this.appointmentForm.value.template_id
				: null;
		event['technician_id'] =
			this.appointmentForm && this.appointmentForm.value && this.appointmentForm.value.technician_id
				? this.appointmentForm.value.technician_id
				: null;
		event['provider_id'] =
			this.appointmentForm && this.appointmentForm.value && this.appointmentForm.value.provider_id
				? this.appointmentForm.value.provider_id
				: null;
		event['template_type'] =
			this.appointmentForm && this.appointmentForm.value && this.appointmentForm.value.template_type
				? this.appointmentForm.value.template_type
				: null;
		event['enabledFlow'] = null;

		if (!event.visit_session) {
			if (event && event.template_type && event.template_type == 'static_ios') {
				this.toastrService.error('Please use an IOS device/iPad to access the template');
				return;
			}
		}
		if (this.appointmentForm.invalid) {
			if (!this.appointmentForm.controls['provider_id'].value) {
				this.appointmentForm.controls['provider_id'].markAsDirty();
				this.appointmentForm.controls['provider_id'].markAsTouched();
				return;
			}
			if (!this.appointmentForm.controls['template_id'].value) {
				this.appointmentForm.controls['template_id'].markAsDirty();
				this.appointmentForm.controls['template_id'].markAsTouched();
				return;
			}
		}
		//(click)="startEvaluation.emit(timeEvent.event);startEvualtionFlagShow.emit(timeEvent.event)"
		if (event.back_dated_check) {
			this.customDiallogService
				.confirm(
					'Warning',
					'Uploaded documents will be replaced. Are you sure you want to Edit the Evaluation ?',
				)
				.then((confirmed) => {
					if (confirmed) {
						event['enabledFlow'] = 'onlySpecialty';
						this.startEvaluation.emit(event);
						this.startEvualtionFlagShow.emit(event);
					}
				})
				.catch();
		} else {
			if (event.speciality_key != 'medical_doctor' && event.speciality_key != 'hbot') {
				if (event.template_type === 'manual') {
					this.mainService.setenableSaveRecordManualSpeciality(true);
					this.startEvaluation.emit(event);
					this.startEvualtionFlagShow.emit(event);
				} else {
					this.startEvaluation.emit(event);
					this.startEvualtionFlagShow.emit(event);
				}
			} else {
				event['enabledFlow'] = 'specialtyWithMedicalOrHbot';
				this.startEvaluation.emit(event);
				this.startEvualtionFlagShow.emit(event);
			}
		}
	}

	private getTimeEventResizedDates(calendarEvent: CalendarEvent, resizeEvent: ResizeEvent) {
		const minimumEventHeight = getMinimumEventHeightInMinutes(
			this.hourSegments,
			this.hourSegmentHeight,
		);
		const newEventDates = {
			start: calendarEvent.start,
			end: getDefaultEventEnd(this.dateAdapter, calendarEvent, minimumEventHeight),
		};
		const { end, ...eventWithoutEnd } = calendarEvent;
		const smallestResizes = {
			start: this.dateAdapter.addMinutes(newEventDates.end, minimumEventHeight * -1),
			end: getDefaultEventEnd(this.dateAdapter, eventWithoutEnd, minimumEventHeight),
		};

		if (resizeEvent.edges.left) {
			const daysDiff = Math.round(+resizeEvent.edges.left / this.dayColumnWidth);
			const newStart = this.dateAdapter.addDays(newEventDates.start, daysDiff);
			if (newStart < smallestResizes.start) {
				newEventDates.start = newStart;
			} else {
				newEventDates.start = smallestResizes.start;
			}
		} else if (resizeEvent.edges.right) {
			const daysDiff = Math.round(+resizeEvent.edges.right / this.dayColumnWidth);
			const newEnd = this.dateAdapter.addDays(newEventDates.end, daysDiff);
			if (newEnd > smallestResizes.end) {
				newEventDates.end = newEnd;
			} else {
				newEventDates.end = smallestResizes.end;
			}
		}

		if (resizeEvent.edges.top) {
			const minutesMoved = getMinutesMoved(
				resizeEvent.edges.top as number,
				this.hourSegments,
				this.hourSegmentHeight,
				this.eventSnapSize,
			);
			const newStart = this.dateAdapter.addMinutes(newEventDates.start, minutesMoved);
			if (newStart < smallestResizes.start) {
				newEventDates.start = newStart;
			} else {
				newEventDates.start = smallestResizes.start;
			}
		} else if (resizeEvent.edges.bottom) {
			const minutesMoved = getMinutesMoved(
				resizeEvent.edges.bottom as number,
				this.hourSegments,
				this.hourSegmentHeight,
				this.eventSnapSize,
			);
			const newEnd = this.dateAdapter.addMinutes(newEventDates.end, minutesMoved);
			if (newEnd > smallestResizes.end) {
				newEventDates.end = newEnd;
			} else {
				newEventDates.end = smallestResizes.end;
			}
		}

		return newEventDates;
	}
	public update(event) {
		if (!event.appId) {
			event['appId'] = event.id;
		}
		this.events = event;
		this.viewDate = new Date(this.viewDate);
	}
	public getCurrentAssignments($event) {
		this.currentAssignments.emit('test');
	}
	public deleteAppointment(event) {
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
		this.doctorCalendarService.appId = event.appId;
		this.doctorCalendarService.deleteAppId = [event.appId];
		this.doctorCalendarService.startDate = startDate;
		this.doctorCalendarService.endDate = endDate;
	}
	public deleteUnavialability(event) {
		if (event.approved == 1) {
			this.doctorCalendarService.unavailabilityId = event.id;
			const activeModal = this.updateModal.open(UnavailabilityDeleteReasonComponent, {
				size: 'sm',
				backdrop: 'static',
				keyboard: false,
			});
		} else {
			let start = new Date(event.start_date);
			let end = new Date(event.end_date);
			if (start.getDate() < end.getDate()) {
				this.customDiallogService.confirm('Delete','Are you sure you want to delete all unavailabities created through recurrence?','Yes','No')
		.then((confirmed) => {
			if (confirmed){
				let obj = {
					id: event.id,
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
			}
		})
		.catch();


			} else {
				this.customDiallogService.confirm('Delete','Are you sure you want to delete?','Yes','No')
		.then((confirmed) => {
			if (confirmed){
				let obj = {
					id: event.id,
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
	public updateData(event) {
		if (!event.appId) {
			event['appId'] = event.id;
		}
		this.docService.updateModalObject = event;
		const activeModal = this.updateModal.open(UpdateAppoitModalComponent, {
			size: 'lg',
			backdrop: 'static',
			keyboard: false,
		});
	}
	checkDayNote(date: any) {
		if (this.patient == 'true') {
			return false;
		}
		for (let i = 0; i < this.note.length; i++) {
			if (
				this.note[i]['start_date'].getDate() === date.getDate() &&
				this.note[i]['start_date'].getDay() === date.getDay() &&
				this.note[i]['start_date'].getMonth() === date.getMonth() &&
				this.note[i]['start_date'].getFullYear() === date.getFullYear()
			) {
				return true;
			}
		}
		return false;
	}
	addNote(date) {
		this.doctorCalendarService.notesStartDate = new Date(date);
		this.doctorCalendarService.doctorName = this.currentDoc;
		const activeModal = this.notesModal.open(NotesComponent, {
			size: 'lg',
			backdrop: 'static',
			keyboard: false,
		});
	}

	//Open Create Appt Modal By Double clicking Time Text
	//Curr Date and selected time will be sent to the Create Apt modal
	openThroughText(date: any) {
		// if (!this.disableCheckspecId(new Date(date))) {

		//selected specialtites and/or doctors
		//console.log("CURRENT DOC",this.currentDoc,this.clinicId);
		this.doctorCalendarService.currentDocAndSpec = this.currentDoc;
		//selected Clinic
		this.doctorCalendarService.selectedClinic = this.clinicId;

		//Date to send
		let newDate: Date = new Date(this.viewDate);
		newDate.setHours(date.getHours());
		newDate.setMinutes(date.getMinutes());
		newDate.setSeconds(date.getSeconds());

		if (this.doctorCalendarService.patientName != null) {
			this.doctorCalendarService.patientName = this.doctorCalendarService.patientName;
		} else {
			this.doctorCalendarService.patientName = null;
		}
		// this.doctorCalendarService.createAppDate = new Date(date)
		this.doctorCalendarService.createAppDate = new Date(newDate);

		if (this.addAppointmentButton) {
			const activeModal = this.notesModal.open(CreateAppointmentComponent, {
				backdrop: 'static',
				keyboard: false,
				windowClass: 'modal_extraDOc modal-unique',
			});
		}
		// }
	}

	open(date: any) {
		let date_check = new Date();
		date_check.setDate(date_check.getDate() - 1);
		date_check.setHours(23);
		date_check.setMinutes(59);
		date_check.setSeconds(59);
		if (date < date_check) {
			if (this.aclService.hasPermission(this.userPermissions.add_previous_appointment)) {
				// if (!this.disableCheckspecId(new Date(date))) {

				//selected specialtites and/or doctors
				//console.log("CURRENT DOC",this.currentDoc,this.clinicId);
				this.doctorCalendarService.currentDocAndSpec = this.currentDoc;
				//selected Clinic
				this.doctorCalendarService.selectedClinic = this.clinicId;

				if (this.doctorCalendarService.patientName != null) {
					this.doctorCalendarService.patientName = this.doctorCalendarService.patientName;
				} else {
					this.doctorCalendarService.patientName = null;
				}
				this.doctorCalendarService.createAppDate = new Date(date);
				if (this.addAppointmentButton) {
					const activeModal = this.notesModal.open(CreateAppointmentComponent, {
						backdrop: 'static',
						keyboard: false,
						windowClass: 'modal_extraDOc modal-unique modal-unique-trans',
					});
				}
			}
		} else {
			// if (!this.disableCheckspecId(new Date(date))) {

			//selected specialtites and/or doctors
			//console.log("CURRENT DOC",this.currentDoc,this.clinicId);
			this.doctorCalendarService.currentDocAndSpec = this.currentDoc;
			//selected Clinic
			this.doctorCalendarService.selectedClinic = this.clinicId;

			if (this.doctorCalendarService.patientName != null) {
				this.doctorCalendarService.patientName = this.doctorCalendarService.patientName;
			} else {
				this.doctorCalendarService.patientName = null;
			}
			this.doctorCalendarService.createAppDate = new Date(date);
			if (this.addAppointmentButton) {
				const activeModal = this.notesModal.open(CreateAppointmentComponent, {
					backdrop: 'static',
					keyboard: false,
					windowClass: 'modal_extraDOc modal-unique',
				});
			}
		}
		// }
	}
	public edit(event) {
		if (!event.appId) {
			event['appId'] = event.id;
		}
		if (
			(event['start_time'].length === 8 &&
				event['start'].toString().substr(19, 2) !== event['start_time'].substr(3, 2)) ||
			(event['start_time'].length === 7 &&
				event['start'].toString().substr(19, 2) !== event['start_time'].substr(2, 2))
		) {
			event['start'].setMinutes(event['start'].getMinutes() - 3);
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
					time_slot: event['time_slots'] ? event['time_slots'] : event['time_slot'],
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
					appointmentId: event['appId'] ? event['appId'] : event['id'],
					//   "doctorName": event['doctor_info'],
					doctorName:
						event['doctor_info'] &&
						event['doctor_info']['first_name'] +
							' ' +
							event['doctor_info']['middle_name'] +
							' ' +
							event['doctor_info']['last_name'],
					doctor_info: event['doctor_info'],
					appointment_cpt_codes: event['appointment_cpt_codes'],
					physician: event && event['physician_clinic']? event['physician_clinic']['physician']:null,
					physician_clinic: event['physician_clinic'],					
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
					case_id: event['case_id'],
					case_type_id: event['case_type_id'],
					case_type_name: event['case_type_name'],
					//   "docId": event['docAssign']['doctor']['doctors'][0]["user_id"],
					doctor_id: event['doctor_info']['user_id'],
					startDateTime: event['start'],
					priority_id: event['priority_id'],
					appointment_type_id: event['appointment_type_id'],
					appointment_type_description: event['appointment_type_description'],
					appointment_type_slug: event['appointment_type_slug'],
					confirmation_status: event['confirmation_status'],
					visitTypeid: event['appointment_type_id'],
					//   "roomId": event["roomId"],
					appointment_duration: event['time_slots'],
					time_slot: event['time_slots'] ? event['time_slots'] : event['time_slot'],
					comments: event['comments'],
					facility_id: event['facility_id'],
					//   "specId": event['docAssign']['doctor']['doctors'][0]["specialities"]['id'],
					speciality_id: event['speciality_id'],
					appointmentId: event['appId'] ? event['appId'] : event['id'],
					//   "doctorName": event['doctor_info'],
					doctorName:
						event['doctor_info'] &&
						event['doctor_info']['first_name'] +
							' ' +
							event['doctor_info']['middle_name'] +
							' ' +
							event['doctor_info']['last_name'],
					doctor_info: event['doctor_info'],
					appointment_cpt_codes: event['appointment_cpt_codes'],
					physician: event && event['physician_clinic']? event['physician_clinic']['physician']:null,
					physician_clinic: event['physician_clinic'],					
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
					case_id: event['case_id'],
					case_type_id: event['case_type_id'],
					case_type_name: event['case_type_name'],
					doctor_id: 0,
					appointment_duration: event['appointment_duration'],
					startDateTime: event['start'],
					priority_id: event['priority_id'],
					appointment_type_id: event['appointment_type_id'],
					confirmation_status: event['confirmation_status'],
					time_slot: event['time_slots'] ? event['time_slots'] : event['time_slot'],
					//   "roomId": event["realRoomId"],
					comments: event['comments'],
					visitTypeid: event['appointment_type_id'],
					facility_id: event['facility_id'],
					speciality_id: event['speciality_id'],
					appointmentId: event['appId'] ? event['appId'] : event['id'],
					//   "doctorName": event['doctor_info'],
					doctorName:
						event['doctor_info'] &&
						event['doctor_info']['first_name'] +
							' ' +
							event['doctor_info']['middle_name'] +
							' ' +
							event['doctor_info']['last_name'],
					doctor_info: event['doctor_info'],
					appointment_cpt_codes: event['appointment_cpt_codes'],
					physician: event && event['physician_clinic']? event['physician_clinic']['physician']:null,
					physician_clinic: event['physician_clinic'],
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
					visitTypeid: event['appointment_type_id'],
					case_id: event['case_id'],
					case_type_id: event['case_type_id'],
					case_type_name: event['case_type_name'],
					doctor_id: event['doctor_id'],
					startDateTime: event['start'],
					priority_id: event['priority_id'],
					appointment_type_id: event['appointment_type_id'],
					confirmation_status: event['confirmation_status'],
					//   "roomId": event["realRoomId"],
					appointment_duration: event['appointment_duration'],
					time_slot: event['time_slots'] ? event['time_slots'] : event['time_slot'],
					comments: event['comments'],
					facility_id: event['facility_id'],
					speciality_id: event['speciality_id'],
					appointmentId: event['appId'] ? event['appId'] : event['id'],
					doctorName:
						event['doctor_info'] &&
						event['doctor_info']['first_name'] +
							' ' +
							event['doctor_info']['middle_name'] +
							' ' +
							event['doctor_info']['last_name'],
					doctor_info: event['doctor_info'],
					appointment_cpt_codes: event['appointment_cpt_codes'],
					physician: event && event['physician_clinic']? event['physician_clinic']['physician']:null,
					physician_clinic: event['physician_clinic'],					
					transportations: event['transportations'],
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
				' ' +
				event['doctor_info']['middle_name'] +
				' ' +
				event['doctor_info']['last_name'];
		const activeModal = this.updateModal.open(UpdateAppoitModalComponent, {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal-view',
		});
	}
	closengb(p) {
		this.popOver.close();
		this.popOver = null;
	}
	getVisitSessions(appointment_ids 
		) {
		
		if (appointment_ids) {
			 this.requestService
				.sendRequest(AssignRoomsUrlsEnum.getVisitSession, 'POST', REQUEST_SERVERS.fd_api_url, {
					appointment_ids: [appointment_ids],
				})
				.subscribe((response: HttpSuccessResponse) => {
					let total_data = response.result.data;
					total_data.forEach((item) => {
						this.events.forEach((inner) => {
							if (item['appointment_id'] && inner['appointment_id'] && (item['appointment_id'] == inner['appointment_id'])) {
								inner['visit_session'] = item['visit_session'];
								this.set_Provider_Technician_Template_After_VisitSessionCreate(inner, item);
							}
						});
					});
					this.events = [...this.events];
				});
		}
	}

	getMiddleName(MiddleName) {
		this.middle_name = MiddleName;
		return this.middle_name ? this.middle_name : '';
	}
	getFirstName(firstName): string {
		this.first_name = firstName;
		return this.first_name ? this.first_name : '';
	}
	getLastName(lastName) {
		this.last_name = lastName;
		return this.last_name ? this.last_name : '';
	}

	getFullName(data = this.storageData.getBasicInfo()) {
		return (
			this.getFirstName(data && data.first_name ? data.first_name : null) +
			' ' +
			this.getMiddleName(data && data.middle_name ? data.middle_name : null) +
			' ' +
			this.getLastName(data && data.last_name ? data.last_name : null)
		);
	}

	updateChanges: boolean = false;
	set_Provider_Technician_Template_After_VisitSessionCreate(inner, item) {
		inner['template_id'] = item && item.template && item.template.id;
		inner['template_type'] = item && item.template && item.template.type;
		this.appointmentForm.controls['template_id'].setValue(
			inner['template_id']
		);	
		this.appointmentForm.controls['template_type'].setValue(
			inner['template_type']
		);	
		this.appointmentForm.updateValueAndValidity();
		if (item && item.visit_session) {
			inner['technician_id'] = item && item.technician && item.technician.id;
			this.appointmentForm.controls['technician_id'].setValue(
				inner['technician_id']
			);
			inner['provider_id'] = item && item.doctor && item.doctor.id;

			if (item.doctor) {
				let getDoctor = {
					id: item['doctor'].id,
					name: this.getFullName(item['doctor']),
				};
				inner['selectedMultipleFieldFiterProviders'] = [getDoctor];
			}
			if (item.technician) {
				let getTechnician = {
					id: item['technician'].id,
					name: this.getFullName(item.technician),
				};
				
				inner['selectedMultipleFieldFiterTechnician'] = [getTechnician];
			}
			
		}
		if (item.template) {
			let getTemplate = {
				id: item['template'].id,
				name: item['template'].name,
			};
			
			inner['template'] = [getTemplate];
			this.evualtionTemplateEvent;
			console.log(this.evualtionTemplateEvent,"tempalate");
			if(this.evualtionTemplateEvent) {
				this.evualtionTemplateEvent.ngOnChanges();
			}
		}
	}

	showPatientRecordDocCalendar(p = null, event?: CalendarEvent,evualtionTemplateEvent?) {
	//   let findedIndexEvent=	this.events.findIndex(eventValue=>
	// 	eventValue.appointment_id == event.appointment_id
	// 	);
	// 	console.log(findedIndexEvent);
	// 	console.log(this.events[findedIndexEvent]);
	// 	console.log(event);
	console.log(evualtionTemplateEvent)
	//this.evualtionTemplateEvent = evualtionTemplateEvent;
	
	this.events;
	if (this.popOver) {
		this.popOver.close();
		this.popOver = null;
	} else {
		this.popOver = p;
		this.popOver.open();
	}
	this.setDataOnSingleViewOpen(event);
	// if (this.startEvalButton) {
		this.subject.refreshPatientProfile(event);
		// }
		this.getVisitSessions(event['appointment_id']);
	}
	disableCheckspecId(day) {
		let disable = false;
		if (this.currentDoc && this.currentDoc.id) {
			disable = true;
			for (let i = 0; i < this.currentDoc.doctor.specialities.user_timings.length; i++) {
				if (this.currentDoc.doctor.specialities.user_timings[i].day_id === day.getDay()) {
				disable = false;
					break;
				}
			}
		}
		return disable;
	}
	highlightDayHead(o) {
		this.highlightdayH.day = o;
		this.highlightdayH.index = this.index;
		this.highl.emit(this.highlightdayH);
	}

	disable(day) {
		if (this.patient !== 'true') {
			let starttime = this.events.find(
				(event) =>
					day.getTime() >= (event['assignment_start'] && event['assignment_start'].getTime()) &&
					day.getTime() <= (event['assignment_end'] && event['assignment_end'].getTime()) &&
					event['is_start'] == true,
			);
			let endtime = this.events.find(
				(event) =>
					day.getTime() >= (event['assignment_start'] && event['assignment_start'].getTime()) &&
					day.getTime() <= (event['assignment_end'] && event['assignment_end'].getTime()) &&
					event['is_start'] == false &&
					event['check'] == 'ye end hai',
			);
			if (starttime && endtime) {
				if (day.getTime() >= starttime.start.getTime() && day.getTime() < endtime.end.getTime()) {
					return false;
				} else {
					return true;
				}
			} else {
				return true;
			}
		}
	}

	timeDisplay(hours) {
		// if(this.timeAgaintsPraticeLocation['startTime']){
		//   ['04:59:00','09:30:00' ,'07:30:00' ,'06:30:00' ,'08:30:00','23:15:00'].forEach(e => console.log(e ,this.isInRange(e)) );
		// }
		// return true;
		const date = new Date(hours);
		const time = date.toString().split(' ')[4];
		if (
			this.timeAgaintsPraticeLocation['startTime'] &&
			this.timeAgaintsPraticeLocation['endTime']
		) {
			// jQuery('.removeDiv').parent().hide();
			// jQuery('.cal-height-0').remove();
			return this.isInRange(time.trim());
		} else {
			return true;
		}
	}

	isInRange(value) {
		const endTime = this.timeConvertion(this.timeAgaintsPraticeLocation['endTime']);
		const startTime = this.timeConvertion(this.timeAgaintsPraticeLocation['startTime']);
		// let timeLimit =  ['19:00:00','19:30:00' ,'20:00:00' ,'20:30:00' ,'21:00:00','21:30:00', '22:00:00', '22:30:00', '22:00:00','23:30:00'];
		// const verifyTheCheck = timeLimit.some(t => (t === startTime) );
		// if(verifyTheCheck){
		// if(timeLimit.some(t => (t >= startTime) && (t === value) )){
		//   return true;
		// }else{
		//   return value >= '00:00:00' && value <= endTime;;
		// }
		// }
		return value >= startTime && value <= endTime;
	}
	timeConvertion(time: any) {
		const hour = time.split(':')[0];
		const min = time.split(':')[1];
		const sec = time.split(':')[2];
		return `${hour}:${min}:${sec}`;
	}

	displayHourSegements() {
		this.view.hourColumns[0].hours.forEach((res) => {
			res.segments.map((segment) => (segment['show'] = this.timeDisplay(segment.date)));
		});
		console.log(this.view.hourColumns);
	}

	timeDisplayWithMapingOfArray(hours) {
		if (hours.segments && hours.segments.lenght != 0) {
			this.timeDisplay(hours.segments[0]['date']);
		}
	}
	setAutoTopValue(top: any) {
		if (this.timeAgaintsPraticeLocation['startTime'] && top) {
			const minutes = Number(this.timeAgaintsPraticeLocation['startTime'].split(':')[1]);
			if (minutes === 0) {
				return (
					top -
					Number(this.timeAgaintsPraticeLocation['startTime'].split(':')[0]) *
						(this.hourSegments * 100)
				);
			} else {
				return (
					top -
					(Number(this.timeAgaintsPraticeLocation['startTime'].split(':')[0]) *
						(this.hourSegments * 100) +
						this.segmentBaseInfoTimeSlot(
							Number(this.timeAgaintsPraticeLocation['startTime'].split(':')[1]),
						))
				);
			}
		}
		return top;
	}

	segmentBaseInfoTimeSlot(minutes) {
		let rangeOfMinutes;
		if (this.hourSegments === 6) {
			if (minutes <= 10) {
				return (rangeOfMinutes = 100);
			} else if (minutes > 10 && minutes <= 20) {
				return (rangeOfMinutes = 200);
			} else if (minutes > 20 && minutes <= 30) {
				return (rangeOfMinutes = 300);
			} else if (minutes > 30 && minutes <= 40) {
				return (rangeOfMinutes = 400);
			} else if (minutes > 40 && minutes <= 50) {
				return (rangeOfMinutes = 500);
			} else if (minutes > 50) {
				return (rangeOfMinutes = 600);
			} else {
				return (rangeOfMinutes = 0);
			}
		} else if (this.hourSegments === 4) {
			if (minutes <= 15) {
				return (rangeOfMinutes = 100);
			} else if (minutes > 15 && minutes <= 30) {
				return (rangeOfMinutes = 200);
			} else if (minutes > 30 && minutes <= 45) {
				return (rangeOfMinutes = 300);
			} else if (minutes > 45 && minutes <= 60) {
				return (rangeOfMinutes = 400);
			} else {
				return (rangeOfMinutes = 0);
			}
		} else if (this.hourSegments === 3) {
			if (minutes <= 20) {
				return (rangeOfMinutes = 100);
			} else if (minutes > 20 && minutes <= 40) {
				return (rangeOfMinutes = 200);
			} else if (minutes > 40 && minutes <= 60) {
				return (rangeOfMinutes = 300);
			} else {
				return (rangeOfMinutes = 0);
			}
		} else if (this.hourSegments === 2 || this.hourSegments === 1) {
			if (minutes <= 30) {
				return (rangeOfMinutes = 100);
			} else if (minutes > 30 && minutes <= 60) {
				return (rangeOfMinutes = 200);
			} else {
				return (rangeOfMinutes = 0);
			}
		}
		return rangeOfMinutes;
	}
	isProviderLogedIn = false;
	isProviderLoggedIn() {
		this.storageData.loggedInUser() == UsersType.PROVIDER ? (this.isProviderLogedIn = true) : false;
		// this.isProviderLogedIn = this.storageData.isDoctor();
	}
	InitAppointmentModalForm() {
		this.appointmentForm = this.fb.group({
			technician_id: [null],
			template_id: [null, Validators.required],
			provider_id: [null, Validators.required],
			template_type: [null],
		});
	}
	selectionOnValueChange(e: any, Type?, element?) {
		if (Type == 'provider_id') {
			this.conditionalExtraApiParamsForProvidersGet = {
				facility_location_id: element && element.facility_id ? [element.facility_id] : null,
				user_id: this.setUserIDForProviderDropDownSelect(e),
			};
			this.getTemplateDataForDropDownSelect(element);
		} else if (Type == 'template_id') {
			this.getTemplateDataForDropDownSelect(element);
			this.appointmentForm.controls['template_id'].setValue(
				e && e.data && e.data.id ? e.data.id : null,
			);
			this.appointmentForm.controls['template_type'].setValue(
				e && e.data && e.data.realObj && e.data.realObj.template_type
					? e.data.realObj.template_type
					: null,
			);
		} else if (Type == 'technician_id') {
			this.appointmentForm.controls['technician_id'].setValue(
				e && e.data && e.data.id ? e.data.id : null,
			);
		}
	}
	setUserIDForProviderDropDownSelect(data) {
		if (data) {
			let ID = data && data.data && data.data.id ? data.data.id : null;
			this.appointmentForm.controls['provider_id'].setValue(ID);
			return ID;
		}
	}
	getTemplateDataForDropDownSelect(element) {
		this.conditionalExtraApiParamsForTemplateGet = {
			facility_location_id: element && element.facility_id ? [element.facility_id] : null,
			specialty_id: element && element.speciality_id ? [element.speciality_id] : null,
			visit_type_id: element && element.appointment_type_id ? [element.appointment_type_id] : null,
			case_type_id: element && element.case_type_id ? [element.case_type_id] : null,
			user_id:
				this.conditionalExtraApiParamsForProvidersGet &&
				this.conditionalExtraApiParamsForProvidersGet.user_id
					? this.conditionalExtraApiParamsForProvidersGet.user_id
					: null,
		};
	}
	setDataOnSingleViewOpen(element) {
		this.appointmentForm.reset();
		if (element && element.visit_session) {
			this.appointmentForm.patchValue(element);
		} else {
						this.appointmentForm.patchValue(element);
			// this.appointmentForm.controls['template_id'].setValue(parseInt(element && element.template_id?element.template_id:null));
			if (element && element.doctor_info) {
				this.conditionalExtraApiParamsForProvidersGet['user_id'] =
					element && element.doctor_info && element.doctor_id ? element.doctor_id : null;
			}
			if (
				this.storageData.loggedInUser() == UsersType.PROVIDER &&
				element &&
				!element.doctor_info
			) {
				this.conditionalExtraApiParamsForProvidersGet['user_id'] = parseInt(this.localStorageId);
			}
			if (this.storageData.loggedInUser() == UsersType.TECHNICIAN) {
				this.appointmentForm.controls['technician_id'].setValue(parseInt(this.localStorageId));
				this.conditionalExtraApiParamsForProvidersGet = {
					facility_location_id: element && element.facility_id ? [element.facility_id] : null,
					user_id:
						this.conditionalExtraApiParamsForProvidersGet &&
						!this.conditionalExtraApiParamsForProvidersGet.user_id
							? parseInt(this.localStorageId)
							: this.conditionalExtraApiParamsForProvidersGet.user_id,
				};
			}
			// SET CONDITION EXTRA PARAMS FOR GET TEMPLATE
			const userInfo = this.storageData.getBasicInfo();
			this.conditionalExtraApiParamsForTemplateGet = {
				facility_location_id: element && element.facility_id ? [element.facility_id] : null,
				specialty_id: element && element.speciality_id ? [element.speciality_id] : null,
				visit_type_id:
					element && element.appointment_type_id ? [element.appointment_type_id] : null,
				case_type_id: element && element.case_type_id ? [element.case_type_id] : null,
				user_id:
					this.conditionalExtraApiParamsForProvidersGet &&
					this.conditionalExtraApiParamsForProvidersGet.user_id
						? this.conditionalExtraApiParamsForProvidersGet.user_id
						: userInfo.id,
			};
			// SET EXTRA PARAMS FOR GET TECHNICIANS
			this.conditionalExtraApiParamsForTechnicianGet = {
				supervisor_id:
					this.conditionalExtraApiParamsForProvidersGet &&
					this.conditionalExtraApiParamsForProvidersGet.user_id
						? this.conditionalExtraApiParamsForProvidersGet.user_id
						: null,
				facility_location_id: element && element.facility_id ? [element.facility_id] : null,
			};
			if (this.storageData.loggedInUser() == UsersType.TECHNICIAN && element.doctor_info) {
				this.appointmentForm.controls['provider_id'].setValue(
					this.conditionalExtraApiParamsForProvidersGet &&
						this.conditionalExtraApiParamsForProvidersGet.user_id
						? this.conditionalExtraApiParamsForProvidersGet.user_id
						: null,
				);
			} else if (this.storageData.loggedInUser() == UsersType.PROVIDER && !element.doctor_info) {
			const userInfo = this.storageData.getBasicInfo();
				this.appointmentForm.controls['provider_id'].setValue(
					userInfo && userInfo.id ? userInfo.id : null,
				);
			} else if (this.storageData.loggedInUser() == UsersType.PROVIDER || element.doctor_info) {
				this.appointmentForm.controls['provider_id'].setValue(
					this.conditionalExtraApiParamsForProvidersGet &&
						this.conditionalExtraApiParamsForProvidersGet.user_id
						? this.conditionalExtraApiParamsForProvidersGet.user_id
						: null,
				);
			}
		}
	}
}
