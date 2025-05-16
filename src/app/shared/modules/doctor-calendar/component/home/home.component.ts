import { CalendarEvaluationService } from './../../utils/my-calendar/src/modules/common/calendar-evaluation.service';
import { takeUntil } from 'rxjs';
import {
	Component,
	OnInit,
	Output,
	EventEmitter,
	AfterViewInit,
	ChangeDetectorRef,
	ElementRef,
	ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { IMyDateModel, IMyDpOptions } from 'mydatepicker';
import { DoctorCalendarService } from '../../doctor-calendar.service';
import { Subject } from 'rxjs';
import { MonthSubjectService } from '../../utils/my-calendar/src/modules/month/subject.service';
import { WeekSubjectService } from '../../utils/my-calendar/src/modules/week/subject.service';
import { SubjectService } from '../../subject.service';
import { CalendarMonthService } from '../../utils/my-calendar/src/modules/month/calendar-month.service';
import { MDService } from '../../../../../medical-doctor/services/md/medical-doctor.service';
import { DOCUMENT } from '@angular/common';
import { Inject, OnDestroy } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AclService } from '@appDir/shared/services/acl.service';
import { Router } from '@angular/router';

import { AssignRoomsUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-rooms/assign-rooms-urls-enum';

import { Appointment } from '@appDir/medical-doctor/models/common/commonModels';
import { MainService } from '@shared/services/main-service';
import {
	StorageData,
	HttpSuccessResponse,
	UsersType,
} from '@appDir/pages/content-pages/login/user.class';
import { MDSessionEnum } from '@appDir/medical-doctor/MDSession.enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { AssignSpecialityUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-speciality/assign-speciality-urls-enum';
import { DoctorCalendarUrlsEnum } from '../../doctor-calendar-urls-enum';
import { WaitingListDocUrlsEnum } from '@appDir/scheduler-front-desk/modules/waiting-list-doc/waiting-list-doc-urls-enum';
import { AddToBeSchedulledUrlsEnum } from '@appDir/scheduler-front-desk/modules/add-to-be-scheduled/add-to-be-scheduled-list-urls-enum';

import { StartEvaluation } from '@appDir/shared/components/start.evaluation.abstract.component';
import { SpecialityInfo } from '../custom-model/speciality.model';
import { FacilityInfo } from '../custom-model/facilityInfo.model';
import { DoctorInfo } from '../custom-model/doctorInfo.model';
import { Pagination } from '@appDir/shared/models/pagination';
import { differenceInMinutes, startOfDay } from 'date-fns';
import { CalendarView } from 'angular-calendar';
import {
	convert12,
	convertDateTimeForRetrieving,
	convertDateTimeForRetrievingNotes,
	convertDateTimeForSending,
	removeDuplicates,
	removeEmptyAndNullsFormObject,
} from '@appDir/shared/utils/utils.helpers';
import { EnumSpecialtyTypes } from '../../utils/my-calendar/src/modules/common/specialty-types';
import { DoctorCalendarEnum } from '../../doctor-calendar-transportation-enum';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
@Component({
	selector: 'app-home-doctor',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss'],
})
export class HomeComponent extends StartEvaluation implements OnInit, OnDestroy, AfterViewInit {
	@ViewChild('scrollContainer') scrollContainer: ElementRef<HTMLElement>;
	@ViewChild('calendarContainer') calendarContainer: ElementRef;
	public specEvents: any = [];
	public specialities: SpecialityInfo[] = [];
	public hourSegments = 2;
	public eventsDay = {
		clinics: [], //end of clinics array
		unavailabilities: [], //end of unavailabilities array
	}; //end of response object
	public weekEvents: any = [];
	public monthEvents: any = [];
	public isShowDetails: boolean = true;
	public isShowComments: boolean = true;
	public allDayEvents: any = [];
	public allWeekEvents: any = [];
	public allMonthEvents: any = [];
	public events: any = [];
	public currentDoctor: any;
	refresh: Subject<any> = new Subject();
	refreshDay: Subject<any> = new Subject();
	@Output() updateSpecAssign = new EventEmitter();
	public isLoader: boolean = false;
	public patients: any = [];
	public patientData: any = [];
	public clinics: FacilityInfo[] = [];
	public doctors: DoctorInfo[] = [];
	public specAssign: any = [];
	public clinicId: string;
	public specId: any;
	public isHidePatientRecord: boolean = false;
	public state: boolean = false;
	public appointmentDuration: any = 20;
	public calenderClinics: FacilityInfo[] = [];
	public calenderSpeciality: any = [
		{
			name: '',
			id: 0,
		},
	];
	public calenderDoctors: DoctorInfo[] = [];
	public loading = false;
	public myDatePickerOptions: any = {
		dateFormat: 'dd.mm.yyyy',
		inline: true,
		height: '100%',
		selectorWidth: '100%',
		firstDayOfWeek: 'su',
		sunHighlight: false,
	};
	public model: any;
	public myForm: FormGroup;
	public patientCheck = true;
	public view: string = 'month';
	public isSwapped: boolean = true;
	public swap: any;
	public viewDate: Date = new Date();
	public datePick: Date;
	public weekStartOn: any = 0;
	public loadmoretemparray: any = [];
	public currentLimitToShow = 2;
	public currentDoctors: DoctorInfo[] = [];
	public currentDocsIndex: any = [];
	public localStorageId: any;
	public eventsSendPatient: any;
	public patientDetails: any = {};
	private patientPrivileges: boolean = false;
	public isShowMore: any;
	public isShowLess: any;
	public offsetMore: any;
	public track1: any;
	public currentpagePracticeLocation: number = 1;
	public currentpageSpecialty: number = 1;
	public currentpageDoctor: number = 1;
	minDate = new Date('1900/01/01');
	subscriptions: any[] = [];
	// subscription1: any;
	subscription2: any;
	subscription3: any;
	subscription4: any;
	selectedAppointment: Appointment;
	offlineAppointments: Object[] = [];
	public highlightdayH: any = { day: -1, index: 0 };
	public destroyDoctor$: Subject<boolean> = new Subject<boolean>();
	public destroyClinic$: Subject<boolean> = new Subject<boolean>();
	public destroySpecialty$: Subject<boolean> = new Subject<boolean>();
	public selectedPatient: any;
	//
	//Calendar Title
	public provCalendarTitle: string = 'Provider Calendar';
	//Patient Details
	public patientName: any = { name: 'Adam , John', chartNo: 2, caseId: 4, caseType: '' };
	//
	facilityLocationsId: any[] = [];
	timeAgaintsPraticeLocation: any = {};
	isProviderLogedIn = false;
	isCalendarScrolledRight = false;
	enumTransportType = DoctorCalendarEnum;
	constructor(
		aclService: AclService,
		router: Router,
		@Inject(DOCUMENT) document,
		public subject: MonthSubjectService,
		public weekSubject: WeekSubjectService,
		public CalendarMonthService: CalendarMonthService,
		public subjectSer: SubjectService,
		private formBuilder: FormBuilder,
		public cdr: ChangeDetectorRef,
		public _doctorCalendarService: DoctorCalendarService,
		public route: Router,
		public MDService: MDService,
		public mainService: MainService,
		private calendarEvaluationService: CalendarEvaluationService,
		public toastrService: ToastrService,
		protected storageData: StorageData,
		protected requestService: RequestService,
		private localStorage: LocalStorage
	) {
		super(cdr ,requestService, toastrService, storageData, MDService, aclService, router);
		this.subscriptions.push(
			this.subjectSer.calendar_refresher.subscribe((checker) => {
				if (checker.length > 0) {
					this.getAssignments();
				}
			}),
		);
		this.subjectSer.refreshPatientProfile('first');
		this.localStorageId = JSON.stringify(this.storageData.getUserId());

		//Update Calendar Title based on the Calendar opened
		if (_doctorCalendarService.PatientSchedulingCalendar === true) {
			this.provCalendarTitle = '';
		} else {
			this.provCalendarTitle = 'Provider Calendar';
		}
		this.subscriptions.push(
			this._doctorCalendarService.getTimeofFacility().subscribe((res) => {
				if (res['status']) {
					this.getTimeAgaintsPraticeLocation(this.calenderClinics);
				}
			}),
		);
	}

	private dateIdToDay = { 0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'wed', 4: 'Thu', 5: 'Fri', 6: 'Sat' };
	private height1 = null;
	private height2 = null;
	public checkHeights(off) {
		if (
			document.getElementById('scrollCheck') != null &&
			document.getElementById('scrollCheck') != undefined
		) {
			if (this.height1 == null || this.height1 == 0) {
				this.height1 = document.getElementById('scrollCheck').clientHeight;
			}

			if (document.getElementById('scrollCheck').clientHeight >= this.height1 * 2) {
				if (this.height1 != null && this.height1 != 0) {
					if (document.getElementById('scrollCheck').clientHeight / this.height1 == 2) {
						return off + 400;
					} else {
						return off;
					}
				}
			} else {
				return off;
			}
			this.height2 = document.getElementById('scrollCheck').clientHeight;
		} else {
			return off;
		}
	}
	public triggerScrollToWeek() {
		///Timings will appear according to practice timings of that provider in week and day view (for 1 selected provider).
		//console.log("DOCSSELEC",this._doctorCalendarService.currentDoc,this.viewDate)
		if (this._doctorCalendarService.currentDoc.length == 1) {
			if (
				this._doctorCalendarService.currentDoc[0].doctor &&
				this._doctorCalendarService.currentDoc[0].doctor.specialities
			) {
				let selectedDocSpecTimings =
					this._doctorCalendarService.currentDoc[0]['doctor']['user_timings'];
				//console.log("DOCSSELEC",selectedDocSpecTimings)

				let tempDay = this.viewDate.getDay();
				let selectedDocTime = selectedDocSpecTimings.find(
					(specTiming) => specTiming.day_id == tempDay,
				);
				if (selectedDocTime) {
					let practiceTimeStart = selectedDocTime['start_time_isb'];
					let offStart = parseInt(practiceTimeStart.split(':')[0]); //08:00:00 -> 8
					//console.log("DOCSSELEC2",practiceTimeStart,offStart)
					let off = offStart * (30 * 3);
					if (this.view !== 'month') {
						//console.log("SCROLLL",off);
						document.getElementById('test-scroll').scrollTop = this.checkHeights(off);
					}
				} else {
					let off = 8 * (30 * 3);
					if (this.view !== 'month') {
						//console.log("SCROLLL2",off);
						document.getElementById('test-scroll').scrollTop = off;
					}
				}
			}
			// for (let key in this.dateIdToDay) {
			// 	if (parseInt(key) === tempDay) {
			// 		//if doctor has practice timings
			// 		if (selectedDocSpecTimings.length > 0 && selectedDocSpecTimings[key]) {
			// 			let practiceTimeStart = selectedDocSpecTimings[key]['start_time_isb'];
			// 			let offStart = parseInt(practiceTimeStart.split(':')[0]); //08:00:00 -> 8
			// 			//console.log("DOCSSELEC2",practiceTimeStart,offStart)
			// 			let off = offStart * (30 * 3);
			// 			if (this.view !== 'month') {
			// 				//console.log("SCROLLL",off);
			// 				document.getElementById('test-scroll').scrollTop = this.checkHeights(off);
			// 			}
			// 		} else {
			// 			let off = 8 * (30 * 3);
			// 			if (this.view !== 'month') {
			// 				//console.log("SCROLLL2",off);
			// 				document.getElementById('test-scroll').scrollTop = off;
			// 			}
			// 		}
			// 	}
			// }
			//
		} else {
			let off = 8 * (30 * 3);
			if (this.view !== 'month') {
				//console.log("SCROLLL3",off);
				document.getElementById('test-scroll').scrollTop = off;
			}
		}
		/////
		// let off = (8 * (30 * 3))
		// if (this.view !== 'month') {
		// 	document.getElementById("test-scroll").scrollTop = off;
		// }
	}

	private scrollToCurrentView() {
		const scheduler = this.storageData.getSchedulerInfo();
		if (
			this._doctorCalendarService.currentDoc &&
			this._doctorCalendarService.currentDoc.length > 0 &&
			this._doctorCalendarService.currentDoc[0].doctor &&
			this._doctorCalendarService.currentDoc[0].doctor.specialities &&
			this.scrollContainer &&
			(this.view === CalendarView.Week || this.view === CalendarView.Day)
		) {
			// each hour is 60px high, so to get the pixels to scroll it's just the amount of minutes since midnight
			let doctor = this._doctorCalendarService.currentDoc[0];
			// this.hourSegments=this.setProviderTimeSlot(doctor)
			let selectedDocSpecTimings =
				this._doctorCalendarService.currentDoc[0]['doctor']['user_timings'];
			//console.log("DOCSSELEC",selectedDocSpecTimings)
			let tempDay = this.viewDate.getDay();
			let selectedDocTime = selectedDocSpecTimings.find(
				(specTiming) => specTiming.day_id == tempDay,
			);
			if (selectedDocTime) {
				let practiceTimeStart = selectedDocTime['start_time_isb'];
				let viewdate = new Date(this.viewDate);
				if (practiceTimeStart) {
					let timeStringArray = practiceTimeStart.split(':');
					let startHour = parseInt(timeStringArray[0]);
					let startMin = parseInt(timeStringArray[1]);

					viewdate.setHours(startHour);
					viewdate.setMinutes(startMin);
				}

				viewdate.setSeconds(0);
				const minutesSinceStartOfDay = differenceInMinutes(
					new Date(viewdate),
					startOfDay(new Date(this.viewDate)),
				);
				let hoursSinceStartOfDay = minutesSinceStartOfDay / 60;
				const headerHeight = this.view === CalendarView.Week ? 100 : 100;
				this.scrollContainer.nativeElement.scrollTop =
					hoursSinceStartOfDay * headerHeight * this.hourSegments;
			}
		}
		if(scheduler.scrollRight && this.calendarContainer){
			this.calendarContainer.nativeElement.scrollLeft += 800;
		}
	}
	onScroll(event) {
		const scheduler = this.storageData.getSchedulerInfo();
		if(event.target.scrollLeft + event.target.offsetWidth + 150 >= event.target.scrollWidth){
			scheduler.scrollRight = true;
		}else{
			scheduler.scrollRight = false;
		}
		this.storageData.setSchedulerInfo(scheduler);
	  }
	setProviderTimeSlot(doctor: DoctorInfo) {
		let hourSegments;
		if (doctor.doctor) {
			hourSegments = doctor.doctor.specialities.time_slot;
		} else {
			hourSegments = doctor['time_slot'];
		}
		if (hourSegments > 60) {
			hourSegments = 1;
		} else if (60 % hourSegments === 0 && hourSegments >= 10) {
			hourSegments = 60 / hourSegments;
		} else {
			for (let i = 0; i < 60; i++) {
				hourSegments = hourSegments + 1;
				if (60 % hourSegments === 0 && hourSegments >= 10) {
					hourSegments = 60 / hourSegments;
					this.cdr.detectChanges();
					break;
				}
			}
		}
		return hourSegments;
	}

	public superAdmin: boolean = false;
	public allClinicIds = [];
	public allFacilitySupervisorClinicIds = [];

	async ngOnInit(): Promise<void> {
		if (
			this.aclService.hasPermission(this.userPermissions.schedule_doctor_calendar_view) ||
			this.storageData.isSuperAdmin()
		) {
			this.myForm = this.formBuilder.group({
				myDate: [null, Validators.required],
			});
			// this.subscription1 = this.weekSubject.castScroll.subscribe((resp) => {
			// 	 
			// 	// this.triggerScrollToWeek();
			// });
			this.patientCheck = false;
			this.currentLimitToShow = 2;
			if (
				this.aclService.hasPermission(this.userPermissions.appointment_add) ||
				this.storageData.isSuperAdmin()
			) {
				this.patientPrivileges = true;
			}

			if (!this.patientPrivileges) {
				this.patientCheck = false;
				this.currentLimitToShow = 2;
			}
			this.subscription2 = this.subjectSer.castPatientProfile.subscribe((resp) => {
				if (resp == 'first') {
				} else {
					this.showPatientRecordParent(resp);
				}
			});
			this.subscription3 = this.subjectSer.castStartEval.subscribe((res) => {
				if (res.appId) {
					this.startEvaluation(res);
				}
			});

			const scheduler = this.storageData.getSchedulerInfo();
			//Provider Calender chosen
			if (this._doctorCalendarService.PatientSchedulingCalendar == false) {
				scheduler.toDelCheck = false;
				 
				if (scheduler.front_desk_doctor_calendar_patient) {
					this.selectedPatient = JSON.parse(scheduler.front_desk_doctor_calendar_patient);
					this.patientSelected(this.selectedPatient);
					this.subjectSer.refreshSelectedPatient(this.selectedPatient);
				}

				if (this.patientCheck) {
					this._doctorCalendarService.patientName = this.patientDetails;
				} else {
					this._doctorCalendarService.patientName = null;
				}
			}
			//

			// if (this.patientCheck) {
			// 	this._doctorCalendarService.patientName = this.patientDetails
			// }
			// else {
			// 	this._doctorCalendarService.patientName = null;
			// }

			this.subscription4 = this.subjectSer.cast.subscribe((res) => {
				if (res.length > 0) {
					this.getAssignments();
				}
			});
			//const scheduler = this.storageData.getSchedulerInfo();

			if (
				scheduler.front_desk_doctor_calendar_clinics == undefined ||
				scheduler.front_desk_doctor_calendar_clinics == ''
			) {
				// scheduler.front_desk_doctor_calendar_clinics = '[{"name": "", "id": 0}]'
				scheduler.front_desk_doctor_calendar_clinics = JSON.stringify([new FacilityInfo(0)]);
			}
			if (
				scheduler.front_desk_doctor_calendar_doctors == undefined ||
				scheduler.front_desk_doctor_calendar_doctors == ''
			) {
				// scheduler.front_desk_doctor_calendar_doctors = '[{"name": "", "id": 0,"doctor":{"last_name":""}}]'
				scheduler.front_desk_doctor_calendar_doctors = JSON.stringify([new DoctorInfo({ id: 0 })]);
			}

			if (scheduler.front_desk_doctor_calendar_view == undefined) {
				scheduler.front_desk_doctor_calendar_view = 'day';
			}
			this.calenderDoctors = JSON.parse(scheduler.front_desk_doctor_calendar_doctors);
			this.calenderClinics = JSON.parse(scheduler.front_desk_doctor_calendar_clinics);
			this.view = scheduler.front_desk_doctor_calendar_view;
			this.storageData.setSchedulerInfo(scheduler);
			///if Manual Calendar opened
			if (this._doctorCalendarService.PatientSchedulingCalendar == true) {
				this.currentLimitToShow = 1;
				if (this.view == 'month') {
					this.view = 'week';
				}

				///Getting Patient Details for Manual Calendar using Scheduler
				const patient = JSON.parse(scheduler.patientData);

				if (patient.patient) {
					this.patientName = { ...this.patientName, ...patient.patient };
				} else {
					this.patientName.name = patient.patientLastName;
					this.patientName.first_name = patient.patientFirstName;
					this.patientName.middle_name = patient.patientMiddleName;
					this.patientName.last_name = patient.patientLastName;
				}
				//this.patientName.name = patient.patientLastName;
				//this.patientName.patientFirstName = patient.patientFirstName;
				this.patientName.chartNo = patient.chartNo; //patientId
				this.patientName['id'] = patient.chartNo; //patientId

				this.patientName.caseId = patient.caseId;
				this.patientName.caseType = patient.caseType;
				this.patientCheck = true;

				//setting patient details in service
				this._doctorCalendarService.patientName = this.patientName;

				this.patientDetails = this.patientName;
			}

			this.weekStartOn = 0;
			let currentDate = new Date();
			this.model = {
				date: {
					year: currentDate.getFullYear(),
					month: currentDate.getMonth() + 1,
					day: currentDate.getDate(),
				},
			};
			this.getDoctors(this.currentpageDoctor);
			this.getSpeciality(this.currentpageSpecialty);
			this.getClinics(this.currentpagePracticeLocation);

			this.viewDate = new Date(this.viewDate);
			this.refresh.next(1);
			this.refreshDay.next(1);

			// this.subscriptions.push(this.subscription1);
			this.subscriptions.push(this.subscription2);
			this.subscriptions.push(this.subscription3);
			this.subscriptions.push(this.subscription4);
		}
	}

	ngAfterViewInit() {
		this.scrollToCurrentView();
		this.isProviderLoggedIn();
	}

	public hidePatientRecord() {
		this.isHidePatientRecord = false;
	}

	public viewChange(event) {
		this.isHidePatientRecord = false;
		this.view = event;
		const scheduler = this.storageData.getSchedulerInfo();
		scheduler.front_desk_doctor_calendar_view = this.view;
		this.storageData.setSchedulerInfo(scheduler);
		this.weekSubject.refresh(this.allWeekEvents);
		this.getAssignments();
		this.cdr.detectChanges();
		this.scrollToCurrentView();
	}

	public getMainCalendarCurrentDate(event) {
		let newDate = new Date(event);
		this.model = {
			date: { year: newDate.getFullYear(), month: newDate.getMonth() + 1, day: newDate.getDate() },
		};
		this.viewDate = new Date(event);
		this.cdr.detectChanges();
		this.scrollToCurrentView();
		this.getAssignments();
	}

	public selectClinic(clinic, filterList: boolean = true) {
		 
		let calender_clinic_index = this.calenderClinics.findIndex(
			(calender_clinic) => calender_clinic.id == clinic.id,
		);
		if (calender_clinic_index > -1) {
			this.calenderClinics.splice(calender_clinic_index, 1);
		} else {
			if (this.calenderClinics.length != 0 && this.calenderClinics[0].id == 0) {
				this.calenderClinics = [];
			}

			this.calenderClinics.push(clinic);
		}
		if (this.calenderClinics.length == 0) {
			this.calenderClinics.push(new FacilityInfo(0));
		}
		const scheduler = this.storageData.getSchedulerInfo();
		scheduler.front_desk_doctor_calendar_clinics = JSON.stringify(this.calenderClinics);
		this.storageData.setSchedulerInfo(scheduler);
		this.getTimeAgaintsPraticeLocation(this.calenderClinics);
		if (filterList) {
			this.getDocAndSpecByPracticeLocation();
		}

		this.getAssignments();
	}

	public selectDoctor(
		doctor: DoctorInfo,
		isSpeciality: boolean = false,
		filterList: boolean = true,
	) {
		let callRoute = true;
		// this.currentDoctors = JSON.parse(JSON.stringify(this.calenderDoctors));
		let calender_doctor_index = this.calenderDoctors.findIndex(
			(calender_doc) =>
				(calender_doc.id == doctor.id && !doctor.user_id) ||
				(calender_doc.id == doctor.id && doctor.user_id && doctor.user_id == calender_doc.user_id),
		);
		if (calender_doctor_index > -1) {
			this.calenderDoctors.splice(calender_doctor_index, 1);
			callRoute = false;
		} else {
			if (this.calenderDoctors.length > 0 && this.calenderDoctors[0].id == 0) {
				this.calenderDoctors = [];
			}
			this.calenderDoctors.push(doctor);
		}

		// let check = false;
		// for (let i = 0; i < this.calenderDoctors.length; i++) {
		// 	if (doctor['user_id']&&doctor['user_id'] ==this.calenderDoctors[i]['user_id']&& this.calenderDoctors[i]['user_id']) {
		// 		check = true;
		// 		break;
		// 	}
		// }
		let dontCall = true;
		for (let i = 0; i < this.currentDoctors.length; i++) {
			if (
				(doctor['user_id'] &&
					this.currentDoctors[i]['user_id'] &&
					doctor['user_id'] == this.currentDoctors[i]['user_id']) ||
				(!doctor['user_id'] &&
					!this.currentDoctors[i]['user_id'] &&
					doctor['id'] == this.currentDoctors[i]['id'])
			) {
				dontCall = false;
				break;
			}
		}
		if (dontCall == true) {
			if (
				(this.currentDoctors && this.currentDoctors[0] && this.currentDoctors[0].id === 0) ||
				(!this.patientCheck && this.currentDoctors.length < 2)
			) {
				dontCall = false;
			}
		}
		if (
			this.calenderDoctors.length != 0 &&
			this.calenderDoctors[0].id !== 0 &&
			((this.calenderDoctors[0].id == doctor.id && !doctor.user_id) ||
				this.calenderDoctors[0].user_id == doctor.user_id)
		) {
			this.hourSegments = this.setProviderTimeSlot(doctor);
			// if (doctor.doctor) {
			// 	this.hourSegments = doctor.doctor.specialities.time_slot;
			// } else {
			// 	this.hourSegments = doctor['time_slot'];
			// }
			// if (this.hourSegments > 60) {
			// 	this.hourSegments = 1;
			// } else if (60 % this.hourSegments === 0 && this.hourSegments >= 10) {
			// 	this.hourSegments = 60 / this.hourSegments;
			// } else {
			// 	for (let i = 0; i < 60; i++) {
			// 		this.hourSegments = this.hourSegments + 1;
			// 		if (60 % this.hourSegments === 0 && this.hourSegments >= 10) {
			// 			this.hourSegments = 60 / this.hourSegments;
			// 			this.cdr.detectChanges();
			// 			break;
			// 		}
			// 	}
			// }
		}

		// if (check == false) {
		// 	if (this.calenderDoctors.length != 0 && this.calenderDoctors[0].id == 0) {
		// 		this.calenderDoctors = [];
		// 		if (doctor.doctor) {
		// 			this.hourSegments = doctor.doctor.specialities.time_slot;
		// 		} else {
		// 			this.hourSegments = doctor.doctor.specialities.time_slot;
		// 		}
		// 		if (this.hourSegments > 60) {
		// 			this.hourSegments = 1;
		// 		} else if (60 % this.hourSegments === 0 && this.hourSegments >= 10) {
		// 			this.hourSegments = 60 / this.hourSegments;
		// 		} else {
		// 			for (let i = 0; i < 60; i++) {
		// 				this.hourSegments = this.hourSegments + 1;
		// 				if (60 % this.hourSegments === 0 && this.hourSegments >= 10) {
		// 					this.hourSegments = 60 / this.hourSegments;
		// 					this.cdr.detectChanges();
		// 					break;
		// 				}
		// 			}
		// 		}
		// 	}
		// 	// doctor["isChecked"] = true;
		// 	// this.calenderDoctors.push(doctor)
		// }
		// else {
		// 	for (let i = 0; i < this.calenderDoctors.length; i++) {
		// 		if (this.calenderDoctors[i].id == doctor.id) {
		// 			this.calenderDoctors.splice(i, 1)
		// 			callRoute = false;

		// 			for (let j = 0; j < this.doctors.length; j++) {
		// 				if (this.doctors[j].id == doctor.id) {
		// 					this.doctors[j].is_checked = false
		// 				}
		// 			}
		// 			// break
		// 		}
		// 	}
		// }
		if (this.calenderDoctors.length == 0) {
			this.calenderDoctors.push(new DoctorInfo({ id: 0 }));
		}

		const scheduler = this.storageData.getSchedulerInfo();
		scheduler.front_desk_doctor_calendar_doctors = JSON.stringify(this.calenderDoctors);
		this.storageData.setSchedulerInfo(scheduler);
		if (!dontCall) {
			if (this.calenderDoctors.length <= this.currentLimitToShow) {
				this.currentDoctors = JSON.parse(JSON.stringify(this.calenderDoctors));
				this.currentDocsIndex = [];
				for (let r = 0; r < this.currentLimitToShow; r++) {
					this.currentDocsIndex.push(r);
				}
			} else {
				for (let r = 0; r < this.currentDoctors.length; r++) {
					if (this.currentDoctors[r].user_id === doctor.user_id) {
						if (this.calenderDoctors.length < this.currentLimitToShow + 1) {
							this.currentDoctors = JSON.parse(JSON.stringify(this.calenderDoctors));
							this.currentDocsIndex = [];
							for (let r = 0; r < this.currentLimitToShow; r++) {
								this.currentDocsIndex.push(r);
							}
						} else {
							this.currentDoctors = [];
							if (this.calenderDoctors[this.currentDocsIndex[this.currentLimitToShow - 1]]) {
								for (let r = 0; r < this.currentLimitToShow; r++) {
									this.currentDoctors.push(this.calenderDoctors[this.currentDocsIndex[r]]);
								}
							} else {
								for (let r = 0; r < this.currentLimitToShow; r++) {
									this.currentDoctors.push(this.calenderDoctors[this.currentDocsIndex[r] - 1]);
								}
								for (let r = 0; r < this.currentLimitToShow; r++) {
									this.currentDocsIndex[r] = this.currentDocsIndex[r] - 1;
								}
							}
						}
						break;
					}
				}
			}
		}
		this._doctorCalendarService.currentDoc = this.currentDoctors;
		this.scrollToCurrentView();
		if (isSpeciality && filterList) {
			this.getDoctorAndClinicsBySpec();
		} else if (!isSpeciality && filterList) {
			this.getClinicAndSpecByDoctor();
		}
		if (!dontCall) {
			this.getAssignments();
		}
		// this.getAssignments()
		// this._doctorCalendarService.currentDoc = this.currentDoctors;
	}

	public hourChange(value) {
		this.hourSegments = value;
		this.hourSegments = 60 / this.hourSegments;
		this.cdr.detectChanges();

		this.scrollToCurrentView();
	}

	public onDateChanged(event: any) {
		 
		let currentDate = event.date.year + '-' + event.date.month + '-' + event.date.day;
		let date = new Date(event.jsdate);
		
		this.viewDate = date;
		this.viewDate = this.viewDate;
		this.datePick = event.jsdate;
		this.scrollToCurrentView();
		this.getAssignments();
		if (this.view === 'day') {
			this.getAssignments();
		}
	}

	setDate(value) {

		this.viewDate = new Date(value.toDate());
		this.datePick = this.viewDate;
		this.scrollToCurrentView();
		this.getAssignments();
		if (this.view === 'day') {
			this.getAssignments();
		}

	  }


	public getChangeDateNext(e) {
		let currentDate = e.date.year + '-' + e.date.month + '-' + e.date.day;
		let tempDate = new Date(currentDate);
		tempDate.setMinutes(tempDate.getMinutes() + new Date().getTimezoneOffset());
		this.viewDate = tempDate;
		this.datePick = e.jsdate;
		if (this.state) {
			let newDate = new Date(e);
			this.model = { date: { year: newDate.getFullYear(), month: newDate.getMonth() + 2, day: 1 } };
		} else {
			let newDate = new Date(e);
			this.model = { date: { year: newDate.getFullYear(), month: newDate.getMonth() + 1, day: 1 } };
		}
	}
	public convert12(str) {
		let result: string = '';
		let h1 = str[0];
		let h2 = str[1];
		let hh = parseInt(h1) * 10 + parseInt(h2);
		let Meridien: string;
		if (hh < 12) {
			Meridien = 'AM';
		} else {
			Meridien = 'PM';
		}
		hh %= 12;
		// Handle 00 and 12 case separately
		if (hh == 0) {
			result = '12';
			// Printing minutes and seconds
			for (let i = 2; i < str.length; ++i) {
				result = result + str[i];
			}
		} else {
			result = JSON.stringify(hh);
			// Printing minutes and seconds
			for (let i = 2; i < str.length; ++i) {
				result = result + str[i];
			}
		}
		result = result + ' ' + Meridien;
		return result;
	}
	public async getAssignments() {
		const scheduler = this.storageData.getSchedulerInfo();

		this.calenderDoctors = scheduler.front_desk_doctor_calendar_doctors
			? JSON.parse(scheduler.front_desk_doctor_calendar_doctors)
			: [new DoctorInfo({ id: 0 })];
		// this.currentDoctors = JSON.parse(JSON.stringify(this.calenderDoctors));
		this._doctorCalendarService.currentDoc = this.currentDoctors;
		this.viewDate = new Date(this.viewDate);
		let clinicId = [];
		let doctorId = [];
		let specialtyId = [];

		if (this.calenderDoctors.length > 0 && this.currentDoctors.length == 0) {
			this.currentDocsIndex = [];
			for (let r = 0; r < this.currentLimitToShow; r++) {
				if (this.calenderDoctors[r]) {
					this.currentDoctors.push(this.calenderDoctors[r]);
				}
				this.currentDocsIndex.push(r);
			}
		}
		// console.log(this.calenderClinics)
		for (let i = 0; i < this.calenderClinics.length; i++) {
			//facility with 0 id is pushed in calenderclinics array by default to display calender by default.
			if (this.calenderClinics[i].id != 0) {
				clinicId.push(this.calenderClinics[i].id);
			}
		}
		for (let i = 0; i < this.currentDoctors.length; i++) {
			if (this.currentDoctors[i].user_id) {
				doctorId.push(this.currentDoctors[i].user_id);
				if (!specialtyId.includes(this.currentDoctors[i].speciality_id)) {
					specialtyId.push(this.currentDoctors[i].speciality_id);
				}
				// if (
				// 	this.currentDoctors[i].doctor.specialities &&
				// 	!specialtyId.includes(this.currentDoctors[i].doctor.specialities.id)
				// ) {
				// 	specialtyId.push(this.currentDoctors[i].doctor.specialities.id);
				// }
				//code for spec app in doc
				// for (let z = 0; this.currentDoctors[i].doctor.specAllArray &&
				// 	z < this.currentDoctors[i].doctor.specAllArray.length; z++) {
				// 	for (let x = 0; x < clinicId.length; x++) {
				// 		if (this.currentDoctors[i].doctor.specAllArray[z].facilityId == clinicId[x]
				// 			&& (!specialtyId.includes(this.currentDoctors[i].doctor.specAllArray[z].id))) {
				// 			specialtyId.push(this.currentDoctors[i].doctor.specAllArray[z].id)
				// 		}
				// 	}
				// }
			} else {
				//Doctor with 0 id is pushed in currentDoctors array by default to display calender by default.
				if (this.currentDoctors[i].id != 0) {
					specialtyId.push(this.currentDoctors[i].id);
				}
			}
		}
		// if (doctorId.length == 0) {
		// 	doctorId.push(0)
		// }
		// if (specialtyId.length == 0) {
		// 	specialtyId.push(0)
		// }

		// let date = new Date(JSON.parse(JSON.stringify(this.viewDate)));
		// let lastMonth = new Date(date.setMonth(date.getMonth() - 1));
		// let nextMonth = new Date(date.setMonth(date.getMonth() + 3));
		// let tempDate = lastMonth.getFullYear() + '-' + ('0' + (lastMonth.getMonth() + 1)).slice(-2);
		// let startDate = tempDate + '-01';
		// let tempEndDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 0);
		// let endDate =
		// 	tempEndDate.getFullYear() +
		// 	'-' +
		// 	('0' + (tempEndDate.getMonth() + 1)).slice(-2) +
		// 	'-' +
		// 	('0' + tempEndDate.getDate()).slice(-2);
		// let st = new Date(startDate);
		// st.setMinutes(0);
		// st.setHours(0);
		// st.setSeconds(0);
		// let ed = new Date(endDate);
		// ed.setMinutes(59);
		// ed.setHours(23);
		// ed.setSeconds(59);

		let st;
		let ed;

		let addAppointments: boolean = true;

		if (this.view == 'day') {

			const currentDate: Date = new Date(this.viewDate);
			st = currentDate.toISOString().split('T')[0];
			ed = currentDate.toISOString().split('T')[0]

		} else if (this.view == 'week') {
			const currentDate: Date = new Date(new Date(this.viewDate).toISOString());
			const { startOfWeek, endOfWeek } = this.getStartAndEndDateOfWeek(currentDate);
			st = startOfWeek;
			ed = endOfWeek;
		} else {

			addAppointments = false;
			let date = new Date(JSON.parse(JSON.stringify(this.viewDate)));
			let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
			let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

			st = firstDay.toISOString().split('T')[0];
			ed = lastDay.toISOString().split('T')[0]

		}

		//hamad
		if (this.patientDetails.id) {
			this.requestService
				.sendRequest(
					DoctorCalendarUrlsEnum.getAppointmentsOfAPatientV1_new,
					'POST',
					REQUEST_SERVERS.schedulerApiUrl1,
					{
						start_date: convertDateTimeForSending(this.storageData, st),
						end_date: convertDateTimeForSending(this.storageData, ed),
						patient_id: this.patientDetails.chartNo,
					},
				)
				.subscribe((response: HttpSuccessResponse) => {
					const data = response.result.data.appointments;
					for (let i = 0; i < data.length; i++) {
						// data[i].appointment_cpt_codes=data[i].appointment_cpt_code
						data[i]['patient'] = 'true';
						data[i]['scheduled_date_time'] = convertDateTimeForRetrieving(
							this.storageData,
							new Date(data[i]['scheduled_date_time']),
						);
						data[i]['start'] = new Date(data[i]['scheduled_date_time']);
						const start = new Date(JSON.parse(JSON.stringify(data[i]['start'])));
						let end;
						let facilityId;
						if (
							data[i]['available_doctor_id'] == 0 ||
							data[i]['available_doctor_id'] == null ||
							!data[i]['available_doctor']
						) {
							end = new Date(start.getTime() + data[i]['time_slots'] * 60000);
							if (data[i]['available_speciality']) {
								facilityId = data[i]['available_speciality']['facility_location_id']
									? data[i]['available_speciality']['facility_location_id']
									: null;
								data[i]['facility_id'] = facilityId;
								data[i]['has_app'] =
									data[i]['available_speciality'] && data[i]['available_speciality']['speciality']
										? data[i]['available_speciality']['speciality']['has_app']
										: null;
								data[i]['color'] = data[i]['speciality_code'];
							}
						} else {
							end = new Date(start.getTime() + data[i]['time_slots'] * 60000);
							facilityId =
								data[i]['available_doctor'] && data[i]['available_doctor']['facility_location_id']
									? data[i]['available_doctor']['facility_location_id']
									: null;
							data[i]['facility_id'] = facilityId;
							data[i]['has_app'] =
								data[i]['available_doctor'] &&
								data[i]['available_doctor']['doctor'] &&
								data[i]['available_doctor']['doctor']['userFacilities'] &&
								data[i]['available_doctor']['doctor']['userFacilities'][0] &&
								data[i]['available_doctor']['doctor']['userFacilities'][0]['speciality']
									? data[i]['available_doctor']['doctor']['userFacilities'][0]['speciality'][
											'has_app'
									  ]
									: null;
							data[i]['color'] = data[i]['facility_location_code'];
						}
						let deleteApp = false;
						let updateApp = false;
						let startEval = false;
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
						if (
							this.aclService.hasPermission(this.userPermissions.start_evaluation) ||
							this.storageData.isSuperAdmin()
						) {
							startEval = true;
						}
						if (data[i]['roomId'] != null && data[i].room) {
							data[i]['roomName'] = data[i]['room'].name;
						} else {
							data[i]['roomName'] = 'None';
						}
						// data[i]['color'] = data[i]['code'];

						data[i]['end'] = end;
						data[i]['appointment_type_description'] = data[i]['appointmentType']
							? data[i]['appointmentType']['description']
							: '';
						data[i]['appointment_type_qualifier'] = data[i]['appointmentType']
							? data[i]['appointmentType']['appointment_type_qualifier']
							: '';
						data[i]['appointment_type_slug'] = data[i]['appointment_type_slug']
							? data[i]['appointmentType']['appointment_type_slug']
							: '';
						data[i]['patientName'] = this.patientDetails.middle_name
							? this.patientDetails.first_name +
							  ' ' +
							  this.patientDetails.middle_name +
							  ' ' +
							  this.patientDetails.last_name
							: this.patientDetails.first_name + ' ' + this.patientDetails.last_name;
						data[i]['firstName'] = this.patientDetails.first_name;
						data[i]['title'] = this.patientDetails.middle_name
							? this.patientDetails.first_name +
							  ' ' +
							  this.patientDetails.middle_name +
							  ' ' +
							  this.patientDetails.last_name
							: this.patientDetails.first_name + ' ' + this.patientDetails.last_name;
						data[i]['updateApp'] = updateApp;
						data[i]['startEval'] = startEval;
						data[i]['deleteApp'] = deleteApp;
						let startTime = new Date(data[i]['start']).toString().substring(16, 21);
						let endTime = new Date(data[i]['end']).toString().substring(16, 21);
						data[i]['start_time'] = this.convert12(startTime);
						data[i]['end_time'] = this.convert12(endTime);
					}
					this.eventsSendPatient = data;

					if (data.length === 0) {
						data.push({ patient: 'true', noData: true });
					}
					// console.log(data)
					this.weekSubject.refreshPatientCalendar(data);
					this.subject.refreshPatientCalendar(data);
					this.refresh.next(1);
				});
		}

		await this.requestService
			.sendRequest(
				DoctorCalendarUrlsEnum.getSpecialityAppoinments,
				'POST',
				REQUEST_SERVERS.schedulerApiUrl1,
				{
					start_date: st, //convertDateTimeForSending(this.storageData, st),
					end_date: ed, //convertDateTimeForSending(this.storageData, ed),
					facility_location_ids: clinicId,
					speciality_ids: specialtyId, //????
					apppointments_required: addAppointments
				},
			)
			.subscribe((respec: HttpSuccessResponse) => {
				this.specEvents = JSON.parse(JSON.stringify(respec?.result?.data));

				doctorId = [...new Set(doctorId)];
				this.requestService
					.sendRequest(
						DoctorCalendarUrlsEnum.getAppointmentsofDoctor,
						'POST',
						REQUEST_SERVERS.schedulerApiUrl1,
						{
							start_date: st, //convertDateTimeForSending(this.storageData, st),
							end_date: ed, //convertDateTimeForSending(this.storageData, ed),
							facility_location_ids: clinicId,
							doctor_ids: doctorId,
							speciality_ids: specialtyId,
							apppointments_required: addAppointments
						},
					)
					.subscribe(
						(response: HttpSuccessResponse) => {
							//concat
							if (
								response.result.data &&
								response.result.data.facility &&
								response.result.data.facility.length != 0
							) {
								if (this.specEvents.length > 0) {
									for (let i = 0; i < response.result.data.facility.length; i++) {
										for (let j = 0; j < this.specEvents.length; j++) {
											if (
												this.specEvents[j].facility_id ==
												response.result.data.facility[i].facility_id
											) {
												response.result.data.facility[i].availibilities =
													response.result.data.facility[i].availibilities.concat(
														this.specEvents[j].availibilities,
													); //??
											}
										}
									}
								}

							} else {
								if (response.result.data.facility && response.result.data.facility.length == 0) {
									response.result.data.facility = JSON.parse(JSON.stringify(this.specEvents));
								}
							}
							// assigning week events
							this.weekEvents = [];
							this.events = [];
							this.weekEvents = JSON.parse(JSON.stringify(response.result.data));
							var timeSpan = 20;
							let startOfAssignments = [];
							let endOfAssignments = [];
							let appTimeSame = 1;
							this.requestService
								.sendRequest(
									DoctorCalendarUrlsEnum.getDoctorInstructions,
									'POST',
									REQUEST_SERVERS.schedulerApiUrl1,
									{
										doctor_ids: doctorId,
										start_date: convertDateTimeForRetrievingNotes(this.storageData, st),
										end_date: convertDateTimeForRetrievingNotes(this.storageData, ed),
									},
								)
								.subscribe(
									(res: HttpSuccessResponse) => {
										let data = res.result.data;
										for (let i = 0; i < data.length; i++) {
											// data[i]["docId"] = data[i]["doctorId"]
											data[i]['note'] = true;
											data[i]['date'] = convertDateTimeForRetrievingNotes(
												this.storageData,
												new Date(data[i]['date']),
											);
											data[i]['start_date'] = new Date(data[i]['date']);
											data[i]['start'] = new Date(data[i]['date']);
										}
										this.weekSubject.refreshNote(data);
										this.subject.refreshNote(data);
										this.refresh.next(1);
									},
									(error) => {
										let data = [];
										this.weekSubject.refreshNote(data);
										this.subject.refreshNote(data);
										this.refresh.next(1);
									},
								);
							if (this.weekEvents.facility) {
								for (let i = 0; i < this.weekEvents.facility.length; i++) {
									for (let j = 0; j < this.weekEvents.facility[i]['availibilities'].length; j++) {
										this.weekEvents.facility[i]['availibilities'][j]['start_date'] =
											convertDateTimeForRetrieving(
												this.storageData,
												new Date(this.weekEvents.facility[i]['availibilities'][j]['start_date']),
											);
										this.weekEvents.facility[i]['availibilities'][j]['end_date'] =
											convertDateTimeForRetrieving(
												this.storageData,
												new Date(this.weekEvents.facility[i]['availibilities'][j]['end_date']),
											);
										const first_start = new Date(
											this.weekEvents.facility[i]['availibilities'][j]['start_date'],
										);
										const first_end = new Date(first_start.getTime() + 60000);
										const assignEnd = new Date(
											this.weekEvents.facility[i]['availibilities'][j]['end_date'],
										);
										let stTime = new Date(first_start).toString().substring(16, 21);
										stTime = this.convert12(stTime);
										startOfAssignments.push(first_start);
										 
										this.events.push({
											start: first_start,
											end: first_end,
											app_time_same: 1,
											patient: 'false',
											color: this.weekEvents.facility[i].color,
											facility_name: '',
											facility_qualifier: '',
											patientName: '',
											first_name: 'Assignment',
											doctor_id: this.weekEvents.facility[i]['availibilities'][j]['doctor_id'],
											speciality_id:
												this.weekEvents.facility[i]['availibilities'][j]['speciality_id'],
											title: '',
											picture: '',
											patient_id: '',
											priority: '',
											status: '',
											chart_id: '',
											chart_id_formatted: '',
											is_active: '',
											approval_status: '',
											appId: '',
											start_time: stTime,
											end_time: '',

											is_appointment: false,
											is_start: true,
											is_unavailablility: false,
											assignment_start: new Date(
												this.weekEvents.facility[i]['availibilities'][j]['start_date'],
											),
											assignment_end: new Date(
												this.weekEvents.facility[i]['availibilities'][j]['end_date'],
											),
											// has_transportation: this.isAppointmentHasTransportation()
										}); //??

										// Haseeb work for appointment margin set in day
										for (
											let x = 0;
											x < this.weekEvents.facility[i]['availibilities'][j]['appointments'].length;
											x++
										) {
											this.weekEvents.facility[i]['availibilities'][j]['appointments'][
												x
											].scheduled_date_time = convertDateTimeForRetrieving(
												this.storageData,
												new Date(
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][
														x
													].scheduled_date_time,
												),
											);
										}

										const sort = this.weekEvents.facility[i]['availibilities'][j][
											'appointments'
										].sort(function (a, b) {
											a.scheduled_date_time = new Date(a.scheduled_date_time);
											b.scheduled_date_time = new Date(b.scheduled_date_time);
											return a.scheduled_date_time - b.scheduled_date_time;
										}); //??
										this.weekEvents.facility[i]['availibilities'][j]['appointments'] = sort;

										appTimeSame = 1;
										for (
											let k = 0;
											k < this.weekEvents.facility[i]['availibilities'][j]['appointments'].length;
											k++
										) {
											let start = new Date(
												this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
													'scheduled_date_time'
												],
											);
											timeSpan =
												this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
													'appointment_duration'
												];

											let end = new Date(start.getTime() + timeSpan * 60000);
											let start_time = new Date(start).toString().substring(16, 21);
											let end_time = new Date(end).toString().substring(16, 21);
											start_time = this.convert12(start_time);
											end_time = this.convert12(end_time);
											if (start.toString() == first_start.toString()) {
												start = new Date(start.getTime() + 3 * 60000);
											} //??
											if (end.toString() == assignEnd.toString()) {
												end = new Date(end.getTime() - 3 * 60000);
											} //??
											// Haseeb work for appointment margin set in day
											if (start.getTime() === this.events[this.events.length - 1].start.getTime()) {
												appTimeSame = appTimeSame + 1;
											} else {
												appTimeSame = 1;
											}
											let deleteApp = false;
											let updateApp = false;
											let startEval = false;
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
											if (
												this.aclService.hasPermission(this.userPermissions.start_evaluation) ||
												this.storageData.isSuperAdmin()
											) {
												startEval = true;
											}
											this.events.push({
												allow_multiple_cpt_codes: this.weekEvents.facility[i]['availibilities'][j]['appointments'][k]['appointmentType']?.['specialityVisitType']?.[0]?.['allow_multiple_cpt_codes'],
												visit_status_slug: this.weekEvents.facility[i]['availibilities'][j]['appointments'][k]['patientSession']?.['visitStatus']?.['slug'],
												updateApp: updateApp,
												deleteApp: deleteApp,
												startEval: startEval,
												spec_app:
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
														'spec_app'
													],
												facility_id: this.weekEvents.facility[i].facility_id,
												patient: 'false',
												// visit_session : this.weekEvents.clinics[i]["assignments"][j]["appointments"][k]["visit_session"],
												appointment_id:
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k]['id'],
												is_doc: this.weekEvents.facility[i]['availibilities'][j]['doctor_id'],
												has_app:
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
														'has_app'
													],
												speciality_name:
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
														'speciality_name'
													],
												case_id:
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
														'case_id'
													],
												case_type_id:
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
														'case_type_id'
													],
												case_type_name:
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
														'case_type_name'
													],
												appointment_billable:
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
														'appointment_billable'
													],
												appointment_type_id:
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
														'appointment_type_id'
													],
												appointment_type_slug:
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
														'appointment_type_slug'
													],
												appointment_type_description:
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
														'appointment_type_description'
													],
												appointment_type_qualifier:
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
														'appointment_type_qualifier'
													],
												speciality_key:
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
														'speciality_key'
													],
												priority_id:
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
														'priority_id'
													],
												comments:
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
														'comments'
													],
												// roomId: this.weekEvents.facility[i]["availibilities"][j]["appointments"][k]["roomName"],
												// realRoomId: this.weekEvents.facility[i]["availibilities"][j]["appointments"][k]["roomId"],
												appointment_duration:
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
														'appointment_duration'
													],
												time_slot:
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
														'time_slot'
													],
												start: start,
												is_manual_specialty:
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
														'is_manual_specialty'
													],
												end: end,
												available_doctor_id:
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
														'available_doctor_id'
													],
												doctor_id: this.weekEvents.facility[i]['availibilities'][j].doctor_id,
												speciality_id:
													this.weekEvents.facility[i]['availibilities'][j]['speciality_id'] ||
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
														'speciality_id'
													],
												doctor_info:
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
														'doctor_info'
													],
												color: this.weekEvents.facility[i].color,
												app_time_same: appTimeSame,
												available_speciality_id:
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
														'available_speciality_id'
													],
												facility_name: this.weekEvents.facility[i].facility_name,
												facility_qualifier: this.weekEvents.facility[i].facility_qualifier,
												patientName: this.weekEvents.facility[i]['availibilities'][j][
													'appointments'
												][k]['middle_name']
													? this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
															'first_name'
													  ] +
													  ' ' +
													  this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
															'middle_name'
													  ] +
													  ' ' +
													  this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
															'last_name'
													  ]
													: this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
															'first_name'
													  ] +
													  ' ' +
													  this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
															'last_name'
													  ],
												title:
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
														'lastName'
													],
												picture:
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
														'picture'
													],
												patient_id:
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
														'patient_id'
													],
												chart_id:
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
														'chart_id '
													],
												chart_id_formatted:
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
														'chart_id_formatted'
													],
												is_active:
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
														'is_active '
													],

												priority:
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
														'priority'
													],
												appointment_title:
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
														'appointment_title'
													],
												status:
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
														'showUpStatus'
													],
												appointment_status:
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
														'appointment_status'
													],
												appointment_status_slug:
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
														'appointment_status_slug'
													],
												confirmation_status:
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
														'confirmation_status'
													],
												approved: undefined,
												appId:
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k]['id'],
												start_time: start_time,
												end_time: end_time,
												is_appointment: true,
												patient_status:
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
														'patient_status'
													],
												back_dated_check:
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
														'back_dated_check'
													],
												appointment_cpt_codes:
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
														'appointment_cpt_codes'
													],
													physician: this.weekEvents.facility[i]['availibilities'][j]['appointments'][k]['physician_clinic']? this.weekEvents.facility[i]['availibilities'][j]['appointments'][k]['physician_clinic']['physician']:null,
													physician_clinic: this.weekEvents.facility[i]['availibilities'][j]['appointments'][k]['physician_clinic']? this.weekEvents.facility[i]['availibilities'][j]['appointments'][k]['physician_clinic']:null,
												transportations:
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
														'transportations'
													],
												has_transportation: this.isAppointmentHasTransportation(
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
														'transportations'
													],
												),
												reading_provider:
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
														'reading_provider'
													],
												reading_provider_id:
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
														'reading_provider_id'
													],
												selectedMultipleFieldFiterProviders: this.setValuesProviders(
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
														'doctor_info'
													],
												),
												selectedMultipleFieldFiterTechnician: this.setValuesTechnician(),
												conditionalExtraApiParamsForProvidersGet:
													this.setConditionalExtraParamsForProvidersGet(
														this.weekEvents.facility[i].facility_id,
													),
												conditionalExtraApiParamsForTechnicianGet:
													this.setConditionalExtraParamsForTechnicianGet(
														this.weekEvents.facility[i].facility_id,
													),
												cd_image:
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
														'cd_image'
													],
												is_transportation:
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
														'is_transportation'
													],
											});
										}

										let end_start = new Date(
											this.weekEvents.facility[i]['availibilities'][j]['end_date'],
										);
										end_start = new Date(end_start.getTime() - 60000);
										const endEnd = new Date(end_start.getTime() + 1 * 60000);
										let edTime = new Date(endEnd).toString().substring(16, 21);
										edTime = this.convert12(edTime);
										endOfAssignments.push(endEnd);
										this.events.push({
											start: end_start,
											end: endEnd,
											app_time_same: 1,
											patient: 'false',

											color: this.weekEvents.facility[i].color,
											facility_name: '',
											facility_qualifier: '',
											patientName: '',
											title: '',
											picture: '',
											doctor_id: this.weekEvents.facility[i]['availibilities'][j]['doctor_id'],
											speciality_id:
												this.weekEvents.facility[i]['availibilities'][j]['speciality_id'],
											patient_id: '',
											chart_id: '',
											chart_id_formatted: '',
											is_active: '',
											priority_id: '',
											status: '',
											approval_status: '',
											appId: '',
											start_time: edTime,
											end_time: '',
											check: 'ye end hai',
											is_appointment: false,
											is_start: false,
											is_unavailablility: false,
											assignment_start: new Date(
												this.weekEvents.facility[i]['availibilities'][j]['start_date'],
											),
											assignment_end: new Date(
												this.weekEvents.facility[i]['availibilities'][j]['end_date'],
											),
										});
									}
								}
							} else if (this.weekEvents && !this.weekEvents.facility) {
								for (let i = 0; i < this.weekEvents.length; i++) {
									for (let j = 0; j < this.weekEvents[i]['availibilities'].length; j++) {
										this.weekEvents[i]['availibilities'][j]['start_date'] =
											convertDateTimeForRetrieving(
												this.storageData,
												new Date(this.weekEvents[i]['availibilities'][j]['start_date']),
											);
										this.weekEvents[i]['availibilities'][j]['end_date'] =
											convertDateTimeForRetrieving(
												this.storageData,
												new Date(this.weekEvents[i]['availibilities'][j]['end_date']),
											);
										const first_start = new Date(
											this.weekEvents[i]['availibilities'][j]['start_date'],
										);
										const first_end = new Date(first_start.getTime() + 60000);
										const assignEnd = new Date(this.weekEvents[i]['availibilities'][j]['end_date']);
										let stTime = new Date(first_start).toString().substring(16, 21);
										stTime = this.convert12(stTime);
										startOfAssignments.push(first_start);
										this.events.push({
											start: first_start,
											end: first_end,
											app_time_same: 1,
											patient: 'false',
											color: this.weekEvents[i].color,
											facility_name: '',
											facility_qualifier: '',
											patientName: '',
											first_name: 'Assignment',
											doctor_id: this.weekEvents[i]['availibilities'][j]['doctor_id'],
											speciality_id: this.weekEvents[i]['availibilities'][j]['speciality_id'],
											title: '',
											picture: '',
											patient_id: '',
											chart_id: '',
											chart_id_formatted: '',
											is_active: '',
											priority: '',
											status: '',
											approval_status: '',
											appId: '',
											start_time: stTime,
											end_time: '',

											is_appointment: false,
											is_start: true,
											is_unavailablility: false,
											assignment_start: new Date(
												this.weekEvents[i]['availibilities'][j]['start_date'],
											),
											assignment_end: new Date(this.weekEvents[i]['availibilities'][j]['end_date']),
										}); //??

										// Haseeb work for appointment margin set in day
										for (
											let x = 0;
											x < this.weekEvents[i]['availibilities'][j]['appointments'].length;
											x++
										) {
											this.weekEvents[i]['availibilities'][j]['appointments'][
												x
											].scheduled_date_time = convertDateTimeForRetrieving(
												this.storageData,
												new Date(
													this.weekEvents[i]['availibilities'][j]['appointments'][
														x
													].scheduled_date_time,
												),
											);
										}

										const sort = this.weekEvents[i]['availibilities'][j]['appointments'].sort(
											function (a, b) {
												a.scheduled_date_time = new Date(a.scheduled_date_time);
												b.scheduled_date_time = new Date(b.scheduled_date_time);
												return a.scheduled_date_time - b.scheduled_date_time;
											},
										); //??
										this.weekEvents[i]['availibilities'][j]['appointments'] = sort;

										appTimeSame = 1;
										for (
											let k = 0;
											k < this.weekEvents[i]['availibilities'][j]['appointments'].length;
											k++
										) {
											let start = new Date(
												this.weekEvents[i]['availibilities'][j]['appointments'][k][
													'scheduled_date_time'
												],
											);
											timeSpan =
												this.weekEvents[i]['availibilities'][j]['appointments'][k][
													'appointment_duration'
												];

											let end = new Date(start.getTime() + timeSpan * 60000);
											let start_time = new Date(start).toString().substring(16, 21);
											let end_time = new Date(end).toString().substring(16, 21);
											start_time = this.convert12(start_time);
											end_time = this.convert12(end_time);
											if (start.toString() == first_start.toString()) {
												start = new Date(start.getTime() + 3 * 60000);
											} //??
											if (end.toString() == assignEnd.toString()) {
												end = new Date(end.getTime() - 3 * 60000);
											} //??
											// Haseeb work for appointment margin set in day
											if (start.getTime() === this.events[this.events.length - 1].start.getTime()) {
												appTimeSame = appTimeSame + 1;
											} else {
												appTimeSame = 1;
											}
											let deleteApp = false;
											let updateApp = false;
											let startEval = false;
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
											if (
												this.aclService.hasPermission(this.userPermissions.start_evaluation) ||
												this.storageData.isSuperAdmin()
											) {
												startEval = true;
											}
											this.events.push({
												allow_multiple_cpt_codes: this.weekEvents.facility[i]['availibilities'][j]['appointments'][k]['appointmentType']['specialityVisitType'][0]['allow_multiple_cpt_codes'],
												visit_status_slug: this.weekEvents.facility[i]['availibilities'][j]['appointments'][k]['patientSession']['visitStatus']['slug'],
												updateApp: updateApp,
												deleteApp: deleteApp,
												startEval: startEval,
												spec_app:
													this.weekEvents[i]['availibilities'][j]['appointments'][k]['spec_app'],
												facility_id: this.weekEvents[i].facility_id,
												patient: 'false',
												// visit_session : this.weekEvents.clinics[i]["assignments"][j]["appointments"][k]["visit_session"],
												appointment_id:
													this.weekEvents[i]['availibilities'][j]['appointments'][k]['id'],
												is_doc: this.weekEvents[i]['availibilities'][j]['doctor_id'],
												has_app:
													this.weekEvents[i]['availibilities'][j]['appointments'][k]['has_app'],
												speciality_name:
													this.weekEvents[i]['availibilities'][j]['appointments'][k][
														'speciality_name'
													],
												case_id:
													this.weekEvents[i]['availibilities'][j]['appointments'][k]['case_id'],
												case_type_id:
													this.weekEvents[i]['availibilities'][j]['appointments'][k][
														'case_type_id'
													],
												case_type_name:
													this.weekEvents[i]['availibilities'][j]['appointments'][k][
														'case_type_name'
													],
												appointment_billable:
													this.weekEvents[i]['availibilities'][j]['appointments'][k][
														'appointment_billable'
													],
												appointment_type_id:
													this.weekEvents[i]['availibilities'][j]['appointments'][k][
														'appointment_type_id'
													],
												appointment_type_slug:
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
														'appointment_type_slug'
													],
												appointment_type_description:
													this.weekEvents[i]['availibilities'][j]['appointments'][k][
														'appointment_type_description'
													],
												appointment_type_qualifier:
													this.weekEvents[i]['availibilities'][j]['appointments'][k][
														'appointment_type_qualifier'
													],

												speciality_key:
													this.weekEvents[i]['availibilities'][j]['appointments'][k][
														'speciality_key'
													],
												priority_id:
													this.weekEvents[i]['availibilities'][j]['appointments'][k]['priority_id'],
												comments:
													this.weekEvents[i]['availibilities'][j]['appointments'][k]['comments'],
												// roomId: this.weekEvents.facility[i]["availibilities"][j]["appointments"][k]["roomName"],
												// realRoomId: this.weekEvents.facility[i]["availibilities"][j]["appointments"][k]["roomId"],
												appointment_duration:
													this.weekEvents[i]['availibilities'][j]['appointments'][k][
														'appointment_duration'
													],
												time_slot:
													this.weekEvents[i]['availibilities'][j]['appointments'][k]['time_slot'],
												start: start,
												is_manual_specialty:
													this.weekEvents[i]['availibilities'][j]['appointments'][k][
														'is_manual_specialty'
													],
												end: end,
												available_doctor_id:
													this.weekEvents[i]['availibilities'][j]['appointments'][k][
														'available_doctor_id'
													],
												doctor_id: this.weekEvents[i]['availibilities'][j].doctor_id,
												speciality_id:
													this.weekEvents[i]['availibilities'][j]['speciality_id'] ||
													this.weekEvents[i]['availibilities'][j]['appointments'][k][
														'speciality_id'
													],
												doctor_info:
													this.weekEvents[i]['availibilities'][j]['appointments'][k]['doctor_info'],
												color: this.weekEvents[i].color,
												app_time_same: appTimeSame,
												available_speciality_id:
													this.weekEvents[i]['availibilities'][j]['appointments'][k][
														'available_speciality_id'
													],
												facility_name: this.weekEvents[i].facility_name,
												facility_qualifier: this.weekEvents[i].facility_qualifier,
												patientName: this.weekEvents[i]['availibilities'][j]['appointments'][k][
													'middle_name'
												]
													? this.weekEvents[i]['availibilities'][j]['appointments'][k][
															'first_name'
													  ] +
													  ' ' +
													  this.weekEvents[i]['availibilities'][j]['appointments'][k][
															'middle_name'
													  ] +
													  ' ' +
													  this.weekEvents[i]['availibilities'][j]['appointments'][k]['last_name']
													: this.weekEvents[i]['availibilities'][j]['appointments'][k][
															'first_name'
													  ] +
													  ' ' +
													  this.weekEvents[i]['availibilities'][j]['appointments'][k]['last_name'],
												title:
													this.weekEvents[i]['availibilities'][j]['appointments'][k]['lastName'],
												picture:
													this.weekEvents[i]['availibilities'][j]['appointments'][k]['picture'],
												patient_id:
													this.weekEvents[i]['availibilities'][j]['appointments'][k]['patient_id'],
												chart_id:
													this.weekEvents[i]['availibilities'][j]['appointments'][k]['chart_id '],
												chart_id_formatted:
													this.weekEvents[i]['availibilities'][j]['appointments'][k]['chart_id_formatted'],
												is_active:
													this.weekEvents[i]['availibilities'][j]['appointments'][k]['is_active '],
												priority:
													this.weekEvents[i]['availibilities'][j]['appointments'][k]['priority'],
												appointment_title:
													this.weekEvents[i]['availibilities'][j]['appointments'][k][
														'appointment_title'
													],
												status:
													this.weekEvents[i]['availibilities'][j]['appointments'][k][
														'showUpStatus'
													],
												appointment_status:
													this.weekEvents[i]['availibilities'][j]['appointments'][k][
														'appointment_status'
													],
												appointment_status_slug:
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
														'appointment_status_slug'
													],
												confirmation_status:
													this.weekEvents[i]['availibilities'][j]['appointments'][k][
														'confirmation_status'
													],
												approved: undefined,
												appId: this.weekEvents[i]['availibilities'][j]['appointments'][k]['id'],
												start_time: start_time,
												end_time: end_time,
												is_appointment: true,
												patient_status:
													this.weekEvents[i]['availibilities'][j]['appointments'][k][
														'patient_status'
													],
												back_dated_check:
													this.weekEvents[i]['availibilities'][j]['appointments'][k][
														'back_dated_check'
													],
												appointment_cpt_codes:
													this.weekEvents[i]['availibilities'][j]['appointments'][k][
														'appointment_cpt_codes'
													],
													physician:
													this.weekEvents[i]['availibilities'][j]['appointments'][k]['physician_clinic']?
													this.weekEvents[i]['availibilities'][j]['appointments'][k]['physician_clinic']['physician']:null,
													physician_clinic:	this.weekEvents[i]['availibilities'][j]['appointments'][k]['physician_clinic']?
													this.weekEvents[i]['availibilities'][j]['appointments'][k]['physician_clinic']:null,
												transportations:
													this.weekEvents[i]['availibilities'][j]['appointments'][k][
														'transportations'
													],
												has_transportation: this.isAppointmentHasTransportation(
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
														'transportations'
													],
												),
												reading_provider:
													this.weekEvents[i]['availibilities'][j]['appointments'][k][
														'reading_provider'
													],
												reading_provider_id:
													this.weekEvents[i]['availibilities'][j]['appointments'][k][
														'reading_provider_id'
													],
												selectedMultipleFieldFiterProviders: this.setValuesProviders(
													this.weekEvents.facility[i]['availibilities'][j]['appointments'][k][
														'doctor_info'
													],
												),

												selectedMultipleFieldFiterTechnician: this.setValuesTechnician(),
												conditionalExtraApiParamsForProvidersGet:
													this.setConditionalExtraParamsForProvidersGet(
														this.weekEvents[i].facility_id,
													),
												conditionalExtraApiParamsForTechnicianGet:
													this.setConditionalExtraParamsForTechnicianGet(
														this.weekEvents[i].facility_id,
													),
												cd_image:
													this.weekEvents[i]['availibilities'][j]['appointments'][k]['cd_image'],
												is_transportation:
													this.weekEvents[i]['availibilities'][j]['appointments'][k][
														'is_transportation'
													],
											});
										}

										let end_start = new Date(this.weekEvents[i]['availibilities'][j]['end_date']);
										end_start = new Date(end_start.getTime() - 60000);
										const endEnd = new Date(end_start.getTime() + 1 * 60000);
										let edTime = new Date(endEnd).toString().substring(16, 21);
										edTime = this.convert12(edTime);
										endOfAssignments.push(endEnd);
										this.events.push({
											start: end_start,
											end: endEnd,
											app_time_same: 1,
											patient: 'false',

											color: this.weekEvents[i].color,
											facility_name: '',
											facility_qualifier: '',
											patientName: '',
											title: '',
											picture: '',
											doctor_id: this.weekEvents[i]['availibilities'][j]['doctor_id'],
											speciality_id: this.weekEvents[i]['availibilities'][j]['speciality_id'],
											patient_id: '',
											chart_id: '',
											chart_id_formatted: '',
											is_active: '',
											priority_id: '',
											status: '',
											approval_status: '',
											appId: '',
											start_time: edTime,
											end_time: '',
											check: 'ye end hai',
											is_appointment: false,
											is_start: false,
											is_unavailablility: false,
											assignment_start: new Date(
												this.weekEvents[i]['availibilities'][j]['start_date'],
											),
											assignment_end: new Date(this.weekEvents[i]['availibilities'][j]['end_date']),
										});
									}
								}
							}

							if (this.events.length != 0) {
								let update_permission_date = new Date();
								update_permission_date.setDate(update_permission_date.getDate() - 1);
								update_permission_date.setHours(23);
								update_permission_date.setMinutes(59);
								update_permission_date.setSeconds(59);
								for (let i = 0; i < this.events.length; i++) {
									if (this.events[i].start < update_permission_date) {
										if (
											this.aclService.hasPermission(
												this.userPermissions.update_previous_appointment,
											)
										) {
											this.events[i].update_back = true;
										} else {
											this.events[i].update_back = false;
										}
									} else {
										this.events[i].update_back = true;
									}
								}
								 //this.getVisitSessions();
							}

							if (this.weekEvents.unavailabilities) {
								for (let i = 0; i < this.weekEvents.unavailabilities.length; i++) {
									this.weekEvents.unavailabilities[i]['start_date'] = convertDateTimeForRetrieving(
										this.storageData,
										new Date(this.weekEvents.unavailabilities[i]['start_date']),
									);
									this.weekEvents.unavailabilities[i]['end_date'] = convertDateTimeForRetrieving(
										this.storageData,
										new Date(this.weekEvents.unavailabilities[i]['end_date']),
									);
									let start = new Date(this.weekEvents.unavailabilities[i]['start_date']);
									let end = new Date(this.weekEvents.unavailabilities[i]['end_date']);
									const approved = this.weekEvents.unavailabilities[i]['approval_status'];
									const doctor_id = this.weekEvents.unavailabilities[i]['doctor_id'];
									let color;
									for (let j = 0; j < startOfAssignments.length; j++) {
										if (start.toString() == startOfAssignments[j].toString()) {
											start = new Date(start.getTime() + 2 * 60000);
										}
									}
									for (let j = 0; j < endOfAssignments.length; j++) {
										if (end.toString() == endOfAssignments[j].toString()) {
											end = new Date(end.getTime() - 2 * 60000);
										}
									}
									if (approved == 1) {
										color = '#d3d3d3';
									} else {
										color = '#ADD8E6';
									}
									if (start.getDate() == end.getDate()) {
										let startTime = new Date(start).toString().substring(16, 21);
										let endTime = new Date(end).toString().substring(16, 21);
										startTime = this.convert12(startTime);
										endTime = this.convert12(endTime);
										this.events.push({
											start: start,
											end: end,
											patient: 'false',
											approval_status: this.weekEvents.unavailabilities[i]['approval_status'],
											app_time_same: appTimeSame,
											subject: this.weekEvents.unavailabilities[i]['subject'],
											id: this.weekEvents.unavailabilities[i]['id'],
											start_date: this.weekEvents.unavailabilities[i]['start_date'],
											end_date: this.weekEvents.unavailabilities[i]['end_date'],
											approved: approved,
											color: color,
											doctor_id: doctor_id,
											is_appointment: false,
											start_time: startTime,
											end_time: endTime,
											is_start: false,
											is_unavailablility: true,
										});
									} else if (start < end) {
										// first day event

										let firstStartTime = new Date(start).toString().substring(16, 21);
										firstStartTime = this.convert12(firstStartTime);

										// const firstStartTime = start.getHours() + ':' + ('0' + start.getMinutes()).slice(-2);
										const firstEnd = new Date(JSON.parse(JSON.stringify(start)));
										firstEnd.setHours(new Date(JSON.parse(JSON.stringify(end))).getHours());
										firstEnd.setMinutes(new Date(JSON.parse(JSON.stringify(end))).getMinutes());
										firstEnd.setSeconds(new Date(JSON.parse(JSON.stringify(end))).getSeconds());

										let firstEndTime = new Date(firstEnd).toString().substring(16, 21);
										firstEndTime = this.convert12(firstEndTime);

										// const firstEndTime = firstEnd.getHours() + ':' + ('0' + firstEnd.getMinutes()).slice(-2);
										this.events.push({
											start: start,
											end: firstEnd,
											patient: 'false',
											approval_status: this.weekEvents.unavailabilities[i]['approval_status'],

											start_date: this.weekEvents.unavailabilities[i]['start_date'],
											end_date: this.weekEvents.unavailabilities[i]['end_date'],
											app_time_same: appTimeSame,
											id: this.weekEvents.unavailabilities[i]['id'],
											subject: this.weekEvents.unavailabilities[i]['subject'],
											approved: approved,
											color: color,
											is_appointment: false,
											doctor_id: doctor_id,
											start_time: firstStartTime,
											end_time: firstEndTime,
											is_start: false,
											is_unavailablility: true,
										});
										// first day event ends

										const diff = end.getDate() - start.getDate();
										for (let q = 1; q <= diff - 1; q++) {
											const diffStart = new Date(JSON.parse(JSON.stringify(start)));
											diffStart.setDate(diffStart.getDate() + q);
											// diffStart.setHours(0);
											// diffStart.setMinutes(0);
											// diffStart.setSeconds(0);
											const diffEnd = new Date(JSON.parse(JSON.stringify(diffStart)));
											diffEnd.setHours(new Date(JSON.parse(JSON.stringify(end))).getHours());
											diffEnd.setMinutes(new Date(JSON.parse(JSON.stringify(end))).getMinutes());
											diffEnd.setSeconds(new Date(JSON.parse(JSON.stringify(end))).getSeconds());

											let diffStartTime = new Date(diffStart).toString().substring(16, 21);
											let diffEndTime = new Date(diffEnd).toString().substring(16, 21);
											diffStartTime = this.convert12(diffStartTime);
											diffEndTime = this.convert12(diffEndTime);
											this.events.push({
												start: diffStart,
												start_date: this.weekEvents.unavailabilities[i]['start_date'],
												end_date: this.weekEvents.unavailabilities[i]['end_date'],
												app_time_same: appTimeSame,
												id: this.weekEvents.unavailabilities[i]['id'],
												subject: this.weekEvents.unavailabilities[i]['subject'],
												end: diffEnd,
												approved: approved,
												patient: 'false',
												approval_status: this.weekEvents.unavailabilities[i]['approval_status'],

												color: color,
												doctor_id: doctor_id,
												is_appointment: false,
												is_unavailablility: true,
												start_time: diffStartTime,
												end_time: diffEndTime,
												is_start: false,
											});
										}

										// last day events
										const lastStart = new Date(JSON.parse(JSON.stringify(end)));
										lastStart.setHours(new Date(JSON.parse(JSON.stringify(start))).getHours());
										lastStart.setMinutes(new Date(JSON.parse(JSON.stringify(start))).getMinutes());
										lastStart.setSeconds(new Date(JSON.parse(JSON.stringify(start))).getMinutes());
										let lastStartTime = new Date(lastStart).toString().substring(16, 21);
										let lastEndTime = new Date(end).toString().substring(16, 21);
										lastStartTime = this.convert12(lastStartTime);
										lastEndTime = this.convert12(lastEndTime);

										this.events.push({
											start: lastStart,
											end: end,
											app_time_same: appTimeSame,
											subject: this.weekEvents.unavailabilities[i]['subject'],
											id: this.weekEvents.unavailabilities[i]['id'],
											approved: approved,
											color: color,
											patient: 'false',
											approval_status: this.weekEvents.unavailabilities[i]['approval_status'],

											doctor_id: doctor_id,
											start_date: this.weekEvents.unavailabilities[i]['start_date'],
											end_date: this.weekEvents.unavailabilities[i]['end_date'],
											is_appointment: false,
											is_unavailablility: true,
											start_time: lastStartTime,
											end_time: lastEndTime,
										});
										// last day events ends
									}
								}
							}

							this.weekSubject.refresh(this.events);
							this.subject.refresh(this.events);

							// this.weekSubject.refresh(this.events)
							this.allWeekEvents = this.events;

							this.allDayEvents = this.events;
							//week events ends

							// assigning month events
							this.monthEvents = [];

							// for (let i = 0; i < response.result.data.clinics&&response.result.data.clinics.length; i++) {
							if (response.result.data.facility) {
								for (
									let i = 0;
									i < (response.result.data.facility && response.result.data.facility.length);
									i++
								) {
									// for (let j = 0; j < response.result.data.clinics[i]["assignments"].length; j++) {
									for (
										let j = 0;
										j < response.result.data.facility[i]['availibilities'].length;
										j++
									) {
										// response.result.data.clinics[i]["assignments"][j]["clinicName"] = response.result.data.clinics[i].clinicName
										response.result.data.facility[i]['availibilities'][j]['facility_name'] =
											response.result.data.facility[i].facility_name;
										response.result.data.facility[i]['availibilities'][j]['facility_qualifier'] =
											response.result.data.facility[i].facility_qualifier;
										response.result.data.facility[i]['availibilities'][j]['color'] =
											response.result.data.facility[i].color;
										// response.result.data.clinics[i]["assignments"][j]["start"] = convertDateTimeForRetrieving(this.storageData, new Date(response.result.data.clinics[i]["assignments"][j]["start"]))

										// response.result.data.clinics[i]["assignments"][j]["end"] = convertDateTimeForRetrieving(this.storageData, new Date(response.result.data.clinics[i]["assignments"][j]["end"]))
										response.result.data.facility[i]['availibilities'][j]['start_date'] =
											convertDateTimeForRetrieving(
												this.storageData,
												new Date(
													response.result.data.facility[i]['availibilities'][j]['start_date'],
												),
											);
										response.result.data.facility[i]['availibilities'][j]['end_date'] =
											convertDateTimeForRetrieving(
												this.storageData,
												new Date(response.result.data.facility[i]['availibilities'][j]['end_date']),
											);
										let start = new Date(
											response.result.data.facility[i]['availibilities'][j]['start_date'],
										);
										let end = new Date(
											response.result.data.facility[i]['availibilities'][j]['end_date'],
										);
										let start_time = new Date(start).toString().substring(16, 21);
										let end_time = new Date(end).toString().substring(16, 21);
										start_time = this.convert12(start_time);
										end_time = this.convert12(end_time);
										response.result.data.facility[i]['availibilities'][j]['start_time'] =
											start_time;
										response.result.data.facility[i]['availibilities'][j]['end_time'] = end_time;
										response.result.data.facility[i]['availibilities'][j]['start_date'] =
											response.result.data.facility[i]['availibilities'][j]['start_date'];
										response.result.data.facility[i]['availibilities'][j]['end_date'] =
											response.result.data.facility[i]['availibilities'][j]['end_date'];
										response.result.data.facility[i]['availibilities'][j]['is_appointment'] = true;
										response.result.data.facility[i]['availibilities'][j]['facility_id'] =
											response.result.data.facility[i]['facility_id'];
										this.monthEvents.push(response.result.data.facility[i]['availibilities'][j]);
									}
								}
							} else if (response.result.data && !response.result.data.facility) {
								for (let i = 0; i < (response.result.data && response.result.data.length); i++) {
									// for (let j = 0; j < response.result.data.clinics[i]["assignments"].length; j++) {
									for (let j = 0; j < response.result.data[i]['availibilities'].length; j++) {
										// response.result.data.clinics[i]["assignments"][j]["clinicName"] = response.result.data.clinics[i].clinicName
										response.result.data[i]['availibilities'][j]['facility_name'] =
											response.result.data[i].facility_name;
										response.result.data[i]['availibilities'][j]['facility_qualifier'] =
											response.result.data[i].facility_qualifier;

										response.result.data[i]['availibilities'][j]['color'] =
											response.result.data[i].color;
										// response.result.data.clinics[i]["assignments"][j]["start"] = convertDateTimeForRetrieving(this.storageData, new Date(response.result.data.clinics[i]["assignments"][j]["start"]))

										// response.result.data.clinics[i]["assignments"][j]["end"] = convertDateTimeForRetrieving(this.storageData, new Date(response.result.data.clinics[i]["assignments"][j]["end"]))
										response.result.data[i]['availibilities'][j]['start_date'] =
											convertDateTimeForRetrieving(
												this.storageData,
												new Date(response.result.data[i]['availibilities'][j]['start_date']),
											);
										response.result.data[i]['availibilities'][j]['end_date'] =
											convertDateTimeForRetrieving(
												this.storageData,
												new Date(response.result.data[i]['availibilities'][j]['end_date']),
											);
										let start = new Date(
											response.result.data[i]['availibilities'][j]['start_date'],
										);
										let end = new Date(response.result.data[i]['availibilities'][j]['end_date']);
										let start_time = new Date(start).toString().substring(16, 21);
										let end_time = new Date(end).toString().substring(16, 21);
										start_time = this.convert12(start_time);
										end_time = this.convert12(end_time);
										response.result.data[i]['availibilities'][j]['start_time'] = start_time;
										response.result.data[i]['availibilities'][j]['end_time'] = end_time;
										response.result.data[i]['availibilities'][j]['start_date'] =
											response.result.data[i]['availibilities'][j]['start_date'];
										response.result.data[i]['availibilities'][j]['end_date'] =
											response.result.data[i]['availibilities'][j]['end_date'];
										response.result.data[i]['availibilities'][j]['is_appointment'] = true;
										response.result.data[i]['availibilities'][j]['facility_id'] =
											response.result.data[i]['facility_id'];
										this.monthEvents.push(response.result.data[i]['availibilities'][j]);
									}
								}
							}

							//unavailabilities
							for (
								let i = 0;
								response.result.data.unavailabilities &&
								i < response.result.data.unavailabilities.length;
								i++
							) {
								// response.result.data.unavailabilities[i]["startDate"] = convertDateTimeForRetrieving(this.storageData, new Date(response.result.data.unavailabilities[i]["startDate"]))
								let start = convertDateTimeForRetrieving(this.storageData, new Date(response.result.data.unavailabilities[i]['start_date']));
								// response.result.data.unavailabilities[i]["endDate"] = convertDateTimeForRetrieving(this.storageData, new Date(response.result.data.unavailabilities[i]["endDate"]))
								let end = convertDateTimeForRetrieving(this.storageData, new Date(response.result.data.unavailabilities[i]['end_date']));
								response.result.data.unavailabilities[i]['real_start'] = new Date(
									response.result.data.unavailabilities[i]['start_date'],
								);
								response.result.data.unavailabilities[i]['real_end'] = new Date(
									response.result.data.unavailabilities[i]['end_date'],
								);
								let real_start = new Date(response.result.data.unavailabilities[i]['start_date']);
								let real_end = new Date(response.result.data.unavailabilities[i]['end_date']);
								let start_time = new Date(start).toString().substring(16, 21);
								let end_time = new Date(end).toString().substring(16, 21);
								start_time = this.convert12(start_time);
								end_time = this.convert12(end_time);
								response.result.data.unavailabilities[i]['start_time'] = start_time;
								response.result.data.unavailabilities[i]['end_time'] = end_time;
								if (response.result.data.unavailabilities[i]['approval_status'] == 0) {
									response.result.data.unavailabilities[i]['color'] = 'lightblue';
								} else {
									response.result.data.unavailabilities[i]['color'] = '#d3d3d3';
								}
								response.result.data.unavailabilities[i]['is_appointment'] = false;
								let start_date = new Date(
									start.getFullYear() + '-' + (start.getMonth() + 1) + '-' + start.getDate(),
								);
								let end_date = new Date(
									end.getFullYear() + '-' + (end.getMonth() + 1) + '-' + end.getDate(),
								);
								if (start_date < end_date) {
									var timeDiff = Math.abs(end_date.getTime() - start_date.getTime());
									var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
									let firstEvent = JSON.parse(
										JSON.stringify(response.result.data.unavailabilities[i]),
									);
									// firstEvent.endDate = new Date(JSON.parse(JSON.stringify(firstEvent.startDate)))
									// firstEvent.endDate.setHours(23)
									// firstEvent.endDate.setMinutes(59)
									// firstEvent.endDate.setSeconds(59)
									// firstEvent.end_date = new Date(JSON.parse(JSON.stringify(firstEvent.end_date))); //??is it correct
									// firstEvent.end_date.setHours(23);
									// firstEvent.end_date.setMinutes(59);
									// firstEvent.end_date.setSeconds(59);
									// firstEvent.start_date = new Date(firstEvent.start_date);
									firstEvent.start_date = convertDateTimeForRetrieving(this.storageData, new Date(firstEvent.start_date));
									firstEvent.end_date = convertDateTimeForRetrieving(this.storageData, new Date(firstEvent.end_date));
									firstEvent['start_time'] = new Date(firstEvent.start_date)
										.toString()
										.substring(16, 21);
									firstEvent['end_time'] = new Date(firstEvent.end_date)
										.toString()
										.substring(16, 21);
									firstEvent['start_time'] = this.convert12(firstEvent['start_time']);
									firstEvent['end_time'] = this.convert12(firstEvent['end_time']);
									firstEvent['real_start'] = real_start;
									firstEvent['real_end'] = real_end;
									this.monthEvents.push(firstEvent);
									 
									 debugger;
									 debugger;
									for (let n = 0; n < diffDays - 1; n++) {
										debugger;
										let loopEvent = JSON.parse(
											JSON.stringify(response.result.data.unavailabilities[i]),
										);
										loopEvent.start_date = new Date(loopEvent.start_date);
										loopEvent.start_date.setDate(
											new Date(loopEvent.start_date).getDate() + (n + 1),
										);
										// loopEvent.start_date.setHours(0);
										// loopEvent.start_date.setMinutes(0);
										// loopEvent.start_date.setSeconds(0);
										// loopEvent.endDate = new Date(JSON.parse(JSON.stringify(loopEvent.startDate)))
										// loopEvent.endDate.setHours(23)
										// loopEvent.endDate.setMinutes(59)
										// loopEvent.endDate.setSeconds(59)
										loopEvent.end_date = new Date(JSON.parse(JSON.stringify(loopEvent.start_date)));
										loopEvent.end_date.setHours(
											new Date(JSON.parse(JSON.stringify(loopEvent.real_end))).getHours(),
										);
										loopEvent.end_date.setMinutes(
											new Date(JSON.parse(JSON.stringify(loopEvent.real_end))).getMinutes(),
										);
										loopEvent.end_date.setSeconds(
											new Date(JSON.parse(JSON.stringify(loopEvent.real_end))).getSeconds(),
										);
										// loopEvent.start_date = new Date(loopEvent.start_date);
										loopEvent.start_date = convertDateTimeForRetrieving(this.storageData, new Date(loopEvent.start_date));
										loopEvent.end_date = convertDateTimeForRetrieving(this.storageData, new Date(loopEvent.end_date));
										loopEvent['start_time'] = new Date(loopEvent.start_date)
											.toString()
											.substring(16, 21);
										loopEvent['end_time'] = new Date(loopEvent.end_date)
											.toString()
											.substring(16, 21);
										loopEvent['start_time'] = this.convert12(loopEvent['start_time']);
										loopEvent['end_time'] = this.convert12(loopEvent['end_time']);
										loopEvent['real_start'] = real_start;
										loopEvent['real_end'] = real_end;
										this.monthEvents.push(loopEvent);
									}
									let lastEvent = JSON.parse(
										JSON.stringify(response.result.data.unavailabilities[i]),
									);
									debugger;
									// lastEvent.startDate = new Date(JSON.parse(JSON.stringify(lastEvent.endDate)))
									// lastEvent.startDate.setHours(0)
									// lastEvent.startDate.setMinutes(0)
									// lastEvent.startDate.setSeconds(0)
									// lastEvent.start_date = new Date(JSON.parse(JSON.stringify(lastEvent.end_date)));
									// lastEvent.start_date.setHours(0);
									// lastEvent.start_date.setMinutes(0);
									// lastEvent.start_date.setSeconds(0);
									lastEvent.start_date = new Date(JSON.parse(JSON.stringify(lastEvent.end_date)));
									lastEvent.start_date.setHours(
										new Date(JSON.parse(JSON.stringify(lastEvent.real_start))).getHours(),
									);
									lastEvent.start_date.setMinutes(
										new Date(JSON.parse(JSON.stringify(lastEvent.real_start))).getMinutes(),
									);
									lastEvent.start_date.setSeconds(
										new Date(JSON.parse(JSON.stringify(lastEvent.real_start))).getSeconds(),
									);
									// lastEvent.end_date = new Date(lastEvent.end_date);
									lastEvent.start_date = convertDateTimeForRetrieving(this.storageData, new Date(lastEvent.start_date));
									lastEvent.end_date = convertDateTimeForRetrieving(this.storageData, new Date(lastEvent.end_date));
									lastEvent['start_time'] = new Date(lastEvent.start_date)
										.toString()
										.substring(16, 21);
									lastEvent['end_time'] = new Date(lastEvent.end_date).toString().substring(16, 21);
									lastEvent['start_time'] = this.convert12(lastEvent['start_time']);
									lastEvent['end_time'] = this.convert12(lastEvent['end_time']);
									lastEvent['real_start'] = real_start;
									lastEvent['real_end'] = real_end;
									this.monthEvents.push(lastEvent);
								} else {
									this.monthEvents.push(response.result.data.unavailabilities[i]);
								}
							}
							if (this.monthEvents[0]) {
								this.monthEvents[0]['patient'] = 'false';
							}
							this.mainService.monthEvents = [...this.monthEvents];
							this.subject.refresh(this.monthEvents);
							this.allMonthEvents = this.monthEvents;
							this.refresh.next(1);
						},
						(error) => {
							this.weekSubject.refresh([]);
							this.subject.refresh([]);
							this.refresh.next(1);
						},
					);
			});
		this.refresh.next(1);
	}

	public async getVisitSessions() {
		let appointment_ids = [];
		this.events.forEach((item) => {
			if (item.appId || item.appointment_id) {
				appointment_ids.push(item.appointment_id);
			}
		});
		if (appointment_ids.length > 0) {
			await this.requestService
				.sendRequest(AssignRoomsUrlsEnum.getVisitSession, 'POST', REQUEST_SERVERS.fd_api_url, {
					appointment_ids: appointment_ids,
				})
				.subscribe((response: HttpSuccessResponse) => {
					let total_data = response.result.data;
					total_data.forEach((item) => {
						this.events.forEach((inner) => {
							if (item.appointment_id == inner.appointment_id) {
								inner['visit_session'] = item['visit_session'];
								this.set_Provider_Technician_Template_After_VisitSessionCreate(inner, item);
							}
						});
					});
					this.events = [...this.events];
				});
		}
	}

	refreshList(event) {
		if (event == 'Practice_locationAndSpec') {
			this.getClinicAndSpecByDoctor();
		} else if (event == 'Practice_locationAndProvider') {
			this.getDoctorAndClinicsBySpec();
		}
	}

	public getClinics(page, byDefaultSelection: boolean = true) {
		let speciality_ids = [];
		let doctor_ids = [];
		this.allClinicIds = this.storageData.getFacilityLocations();
		if (this.calenderDoctors.length > 0) {
			this.calenderDoctors.map((speciality) => {
				if (speciality.id != 0 && !speciality.user_id) {
					speciality_ids.push(speciality.id);
				}
				//if calender entity is provider
				else if (speciality.user_id) {
					doctor_ids.push(speciality.user_id);
				}
			});
		}
		// if(this.calenderDoctors.length>0)
		// {
		// 	this.calenderDoctors.map(doctor=>{
		// 		if(doctor.user_id)
		// 		{
		// 			doctor_ids.push(doctor.user_id)
		// 		}

		// 	})
		// }
		this.requestService
			.sendRequest(
				// AssignSpecialityUrlsEnum.Facility_list_Post,
				AssignSpecialityUrlsEnum.getUserInfobyFacility,
				'POST',
				REQUEST_SERVERS.schedulerApiUrl1,
				{
					facility_location_ids: this.allClinicIds,
					// per_page: Pagination.per_page,
					// filters: '',
					per_page: Pagination.per_page_provider_calender,
					page: page,
					pagination: true,
					speciality_ids: speciality_ids,
					doctor_ids: doctor_ids,
					is_provider_calendar: true,
				},
			)
			.pipe(takeUntil(this.destroyClinic$))
			.subscribe(
				(response: HttpSuccessResponse) => {
					this.isLoader = false;
					const scheduler = this.storageData.getSchedulerInfo();
					let localClinics = JSON.parse(scheduler.front_desk_doctor_calendar_clinics);
					// let clinics_local_storage=[];
					for (let clinics of localClinics) {
						let index = response?.result?.data?.docs.findIndex(
							(facility) => facility.id == clinics.id,
						);
						if (index > -1) {
							response.result.data.docs[index]['is_checked'] = true;
						} else {
							// delete from local storage ,if admin removed the facility but it is stored in local storage
							// response.result.data.docs[index]['is_checked'] = false;
							localClinics = localClinics.filter((local_clinic) => local_clinic.id != clinics.id);
							// clinics_local_storage.push(local_Clinics);
						}
					}
					if (response?.result?.data?.docs.length > 0) {
						this.clinics = [...this.clinics, ...response?.result?.data?.docs];
						if (response.result.data.pages > this.currentpagePracticeLocation) {
							this.currentpagePracticeLocation = this.currentpagePracticeLocation + 1;
							this.getClinics(this.currentpagePracticeLocation);
						} else {
							// if(this.allClinicIds.length==1&&this.clinics.length==1 && this.doctors.length==1 && this.specialities.length==1&& this.calenderClinics)
							// {
							// 	let byDefaultclinic=this.clinics[0];
							// 	let byDefaultClinicExist= this.calenderClinics.find(
							// 		(calender_clinic) => calender_clinic.id == byDefaultclinic.id,
							// 	);
							// 	if(!byDefaultClinicExist)
							// 	{
							// 		byDefaultclinic.is_checked=true;
							// 		this.selectClinic(byDefaultclinic,false)
							// 	}

							// }
							this.preSelectClinic(byDefaultSelection);
							this.preSelectProvider(byDefaultSelection);
							this.preSelectSpeciality(byDefaultSelection);
						}
					}
					// this.calenderClinics = this.clinics.filter(clinic=>clinic.is_checked);
					this.subjectSer.refreshClinic(this.clinics);

					// this.getAssignments() //for comment test purpose
				},
				(error) => {
					this.loading = false;
				},
			);
	}

	public getDoctors(page?, byDefaultSelection: boolean = true) {
		let allFacilitySupervisorClinicIds = [];
		let practice_location_ids = [];
		let speciality_ids = [];
		// if (this.aclService.hasPermission(this.userPermissions.all_doctors)) {
		allFacilitySupervisorClinicIds = this.storageData.getFacilityLocations();
		// }
		// else if(!this.aclService.hasPermission(this.userPermissions.all_doctors))
		// {
		// 	allFacilitySupervisorClinicIds = this.storageData.getFacilityLocations();
		// }
		if (this.calenderClinics.length > 0) {
			this.calenderClinics.map((practicelocation) => {
				if (practicelocation.id != 0) {
					practice_location_ids.push(practicelocation.id);
				}
			});
		}
		if (this.calenderDoctors.length > 0) {
			this.calenderDoctors.map((specialty) => {
				if (specialty.id != 0 && !specialty.user_id) {
					if (!speciality_ids.includes(specialty.id)) {
						return speciality_ids.push(specialty.id);
					}
				} else if (specialty.user_id) {
					if (!speciality_ids.includes(specialty.speciality_id)) {
						return speciality_ids.push(specialty.speciality_id);
					}
				}
			});
		}
		if (
			(allFacilitySupervisorClinicIds.length === 0 && this.storageData.isSuperAdmin()) ||
			allFacilitySupervisorClinicIds.length !== 0
		) {
			this.requestService
				.sendRequest(
					AddToBeSchedulledUrlsEnum.Get_providers,
					'POST',
					REQUEST_SERVERS.schedulerApiUrl1,
					{
						user_id: this.storageData.getUserId(),
						facility_location_ids:
							practice_location_ids && practice_location_ids.length > 0
								? practice_location_ids
								: allFacilitySupervisorClinicIds,
						speciality_ids: speciality_ids && speciality_ids.length > 0 ? speciality_ids : [],
						doctor_ids: this.aclService.hasPermission(this.userPermissions.all_doctors)
							? []
							: [this.storageData.getUserId()],
						is_provider_calendar: true,
						// per_page: Pagination.per_page_Provider,
						per_page: Pagination.per_page_provider_calender,
						page: page,
						pagination: true,
					},
				)
				.pipe(takeUntil(this.destroyDoctor$))
				.subscribe(
					(responseDoc: HttpSuccessResponse) => {
						// this.doctors=[]
						let doctors: DoctorInfo[] = [];
						responseDoc?.result?.data?.docs.forEach((element) => {
							doctors.push(new DoctorInfo(element));
						});
						if (this.storageData.loggedInUser() == UsersType.PROVIDER) {
							this.requestService
								.sendRequest(
									WaitingListDocUrlsEnum.getDoctorDetails,
									'GET',
									REQUEST_SERVERS.schedulerApiUrl1,
									{
										doctor_id: this.localStorageId,
									},
								)
								.subscribe((responseonlyDoc: HttpSuccessResponse) => {
									let onlyDoc = responseonlyDoc.result.data[0];
									if (
										(this.storageData.isSuperAdmin() ||
											(onlyDoc &&
												onlyDoc.speciality &&
												onlyDoc.speciality.speciality_key &&
												onlyDoc.speciality.speciality_key === 'medical_doctor')) &&
										(this.storageData.getOfflineData() == '' ||
											this.storageData.getOfflineData() == undefined)
									) {
										this.getSeedInfo();
									}
									const scheduler = this.storageData.getSchedulerInfo();
									let localDoctors = JSON.parse(scheduler.front_desk_doctor_calendar_doctors);
									for (let localdoctor of localDoctors) {
										if (localdoctor.id != 0) {
											let index = doctors.findIndex((doc) => doc.id == localdoctor.id);
											if (index > -1) {
												doctors[index].is_checked = true;
											} else {
												// this.calenderDoctors = this.calenderDoctors.filter(
												// 	(calenderdoctor) => calenderdoctor.user_id != localdoctor.user_id,
												// );
											}
										}
									}
									this.currentDoctors = JSON.parse(JSON.stringify(this.calenderDoctors));
									this.currentDoctors.splice(this.currentLimitToShow , this.calenderDoctors.length);
									for (let r = 0; r < this.currentLimitToShow; r++) {
										this.currentDocsIndex.push(r);
									}
									if (responseDoc?.result?.data?.pages > this.currentpageDoctor) {
										this.currentpageDoctor = this.currentpageDoctor + 1;
										this.doctors = [...this.doctors, ...doctors];
										this.getDoctors(this.currentpageDoctor);
									} else if (responseDoc?.result?.data?.pages == this.currentpageDoctor) {
										this.doctors = [...this.doctors, ...doctors];
										// if(this.doctors.length==1)
										// {
										// 	let byDefaultProvider=this.doctors[0];
										// 	byDefaultProvider.is_checked=true;

										// 	let byDefaultProviderExist= this.calenderDoctors.find(
										// 		(calender_doc) => (calender_doc.id == byDefaultProvider.id && byDefaultProvider.user_id && byDefaultProvider.user_id == calender_doc.user_id),
										// 		);

										// 	if(!byDefaultProviderExist)
										// 	{
										// 		byDefaultProvider.is_checked=true;
										// 		this.selectDoctor(byDefaultProvider,false,false);
										// 	}
										// }
										this.preSelectClinic(byDefaultSelection);
										this.preSelectProvider(byDefaultSelection);
										this.preSelectSpeciality(byDefaultSelection);
									}

									this.subjectSer.refreshDoctors(this.doctors);
								});
						} else {
							if (
								this.storageData.isSuperAdmin() &&
								(this.storageData.getOfflineData() == '' ||
									this.storageData.getOfflineData() == undefined)
							) {
								this.getSeedInfo();
							}
							const scheduler = this.storageData.getSchedulerInfo();
							let localDoctors = JSON.parse(scheduler.front_desk_doctor_calendar_doctors);
							for (let localdoctor of localDoctors) {
								let index = doctors.findIndex(
									(doc) => doc.user_id && localdoctor.user_id && doc.id == localdoctor.id,
								);
								if (index > -1) {
									doctors[index].is_checked = true;
								} else {
									// this.calenderDoctors = this.calenderDoctors.filter(
									// 	(calenderdoctor) => calenderdoctor.user_id != localdoctor.user_id,
									// );
								}
							}
							this.currentDoctors = JSON.parse(JSON.stringify(this.calenderDoctors));
							this.currentDoctors.splice(this.currentLimitToShow, this.calenderDoctors.length);
							for (let r = 0; r < this.currentLimitToShow; r++) {
								this.currentDocsIndex.push(r);
							}
							if (responseDoc?.result?.data?.pages > this.currentpageDoctor) {
								this.currentpageDoctor = this.currentpageDoctor + 1;
								this.doctors = [...this.doctors, ...doctors];
								this.getDoctors(this.currentpageDoctor);
							} else if (responseDoc?.result?.data?.pages == this.currentpageDoctor) {
								this.doctors = [...this.doctors, ...doctors];
								// 	if(allFacilitySupervisorClinicIds.length==1 && this.doctors.length==1 && this.specialities.length==1)
								// {
								// 	let byDefaultProvider=this.doctors[0];
								// 	byDefaultProvider.is_checked=true;

								// 	let byDefaultProviderExist= this.calenderDoctors.find(
								// 		(calender_doc) => (calender_doc.id == byDefaultProvider.id && byDefaultProvider.user_id && byDefaultProvider.user_id == calender_doc.user_id),
								// 		);

								// 	if(!byDefaultProviderExist)
								// 	{
								// 		byDefaultProvider.is_checked=true;
								// 		this.selectDoctor(byDefaultProvider,false,false);
								// 	}
								// }
								this.preSelectClinic(byDefaultSelection);
								this.preSelectProvider(byDefaultSelection);
								this.preSelectSpeciality(byDefaultSelection);
							}

							this.subjectSer.refreshDoctors(this.doctors);
						}
					},
					(error) => {},
				);
		} else if (
			allFacilitySupervisorClinicIds.length === 0 &&
			this.storageData.loggedInUser() == UsersType.PROVIDER
		) {
			let response: DoctorInfo[] = [];
			this.requestService
				.sendRequest(
					WaitingListDocUrlsEnum.getDoctorDetails,
					'GET',
					REQUEST_SERVERS.schedulerApiUrl1,
					{
						doctor_id: this.localStorageId,
					},
				)
				.subscribe((responseonlyDoc: HttpSuccessResponse) => {
					if (responseonlyDoc.result.data.length > 0) {
						let onlyDoc = responseonlyDoc.result.data[0];
						if (
							(this.storageData.isSuperAdmin() ||
								(onlyDoc.speciality &&
									onlyDoc.speciality.speciality_key &&
									onlyDoc.speciality.speciality_key === 'medical_doctor')) &&
							(this.storageData.getOfflineData() == '' ||
								this.storageData.getOfflineData() == undefined)
						) {
							this.getSeedInfo();
						}
						response.push(new DoctorInfo(onlyDoc));
						const scheduler = this.storageData.getSchedulerInfo();

						let localDoctors = JSON.parse(scheduler.front_desk_doctor_calendar_doctors);

						for (let localdoctor of localDoctors) {
							let index = response.findIndex((doc) => doc.id == localdoctor.id);
							if (index > -1) {
								response[index].is_checked = true;
							} else {
								// this.calenderDoctors = this.calenderDoctors.filter(
								// 	(calenderdoctor) => calenderdoctor.user_id != localdoctor.user_id,
								// );
							}
						}
						this.currentDoctors = JSON.parse(JSON.stringify(this.calenderDoctors));
						this.currentDoctors.splice(this.currentLimitToShow, this.calenderDoctors.length);
						for (let r = 0; r < this.currentLimitToShow; r++) {
							this.currentDocsIndex.push(r);
						}
						if (responseonlyDoc.result.data.pages > this.currentpageDoctor) {
							this.currentpageDoctor = this.currentpageDoctor + 1;
							this.doctors = [...this.doctors, ...response];
							this.getDoctors(this.currentpageDoctor);
						} else {
							// if(allFacilitySupervisorClinicIds.length==1 && this.doctors.length==1 && this.specialities.length==1)
							// {
							// 	let byDefaultProvider=this.doctors[0];
							// 	byDefaultProvider.is_checked=true;

							// 	let byDefaultProviderExist= this.calenderDoctors.find(
							// 		(calender_doc) => (calender_doc.id == byDefaultProvider.id && byDefaultProvider.user_id && byDefaultProvider.user_id == calender_doc.user_id),
							// 		);

							// 	if(!byDefaultProviderExist)
							// 	{
							// 		byDefaultProvider.is_checked=true;
							// 		this.selectDoctor(byDefaultProvider,false,false);
							// 	}
							// }
							this.preSelectClinic(byDefaultSelection);
							this.preSelectProvider(byDefaultSelection);
							this.preSelectSpeciality(byDefaultSelection);
						}

						this.subjectSer.refreshDoctors(this.doctors);
						this._doctorCalendarService.currentDoc = this.currentDoctors;
					}
				});
		}
	}

	getDocAndSpecByPracticeLocation() {
		this.destroyDoctor$.next(true);
		this.currentpageDoctor = 1;
		this.doctors = [];
		this.getDoctors(this.currentpageDoctor, false);
		this.destroySpecialty$.next(true);
		this.currentpageSpecialty = 1;
		this.specialities = [];
		this.getSpeciality(this.currentpageSpecialty, false);
	}
	getClinicAndSpecByDoctor() {
		this.destroyClinic$.next(true);
		this.currentpagePracticeLocation = 1;
		this.clinics = [];
		this.getClinics(this.currentpagePracticeLocation, false);
		this.destroySpecialty$.next(true);
		this.currentpageSpecialty = 1;
		this.specialities = [];
		this.getSpeciality(this.currentpageSpecialty, false);
	}

	getDoctorAndClinicsBySpec() {
		this.destroyClinic$.next(true);
		this.currentpagePracticeLocation = 1;
		this.clinics = [];
		this.getClinics(this.currentpagePracticeLocation, false);
		this.destroyDoctor$.next(true);
		this.currentpageDoctor = 1;
		this.doctors = [];
		this.getDoctors(this.currentpageDoctor, false);
	}

	public update(event) {
		this.getAssignments();
	}

	public showPatientRecordParent(event) {
		/*
				this.isShowDetails = true;
				this.isShowComments = true;
				if (event != undefined && event.length != 0) {
					event["isShowDetails"] = true
					event["isShowComments"] = true
					this.patientData = event
					this.isHidePatientRecord = true
				}
				if (!this.patientData["DOB"]) {
					this.patientData["DOB"] = 'N/A'
				}
				this.requestService
					.sendRequest(
						DoctorCalendarUrlsEnum.get_checked_in_patients,
						'POST',
						REQUEST_SERVERS.kios_api_path,
						{
							"case_ids": [this.patientData.caseId],
							"current_date": convertDateTimeForSending(this.storageData, new Date())
						}
					).subscribe(
						(resssssss: any) => {
							let res = resssssss
							for (let i = 0; i < res.result.data.case_patients.length; i++) {
								if (res.result.data.case_patients[i].id === this.patientData.caseId) {
									this.patientData["status"] = "N/A"
									this.patientData["checkedIn"] = "N/A"
									for (let c = 0; c < res.result.data.case_patients[i].patient_sessions.length; c++) {
										if (res.result.data.case_patients[i].patient_sessions[c].appointment_id === this.patientData.appId) {
											this.patientData["status"] = res.result.data.case_patients[i].patient_sessions[c].status
											if (res.result.data.case_patients[i].patient_sessions[c].status == "Checked Out") {
												break;
											} else if (res.result.data.case_patients[i].patient_sessions[c].status == "Checked In") {
												this.patientData["status"] = res.result.data.case_patients[i].patient_sessions[c].status
												if (res.result.data.case_patients[i].patient_sessions[c].updated_at) {
													this.patientData["checkedIn"] = res.result.data.case_patients[i].patient_sessions[c].updated_at
												} else {
													this.patientData["checkedIn"] = "N/A"
												}
											}
										}
									}
									if (res.result.data.case_patients[i].url) {
										this.patientData["picture"] = res.result.data.case_patients[i].url;
									} else {
										this.patientData["picture"] = 'http://icons.iconarchive.com/icons/icons8/ios7/256/Users-User-Male-icon.png';
									}
									if (res.result.data.case_patients[i].company_name) {
										this.patientData["companyName"] = res.result.data.case_patients[i].company_name
									} else {
										this.patientData["companyName"] = "N/A"
									}
									if (res.result.data.case_patients[i].type) {
										this.patientData["caseType"] = res.result.data.case_patients[i].type
									} else {
										this.patientData["caseType"] = "N/A"
									}
									if (res.result.data.case_patients[i].dob) {
										this.patientData["DOB"] = res.result.data.case_patients[i].dob
									} else {
										this.patientData["DOB"] = "N/A"
									}
		
									this.cdr.markForCheck()
								} else {
									this.patientData["status"] = "N/A"
									this.patientData["checkedIn"] = "N/A"
									this.patientData["DOB"] = "N/A"
									this.patientData["companyName"] = "N/A"
									this.patientData["caseType"] = "N/A"
									this.patientData["picture"] = 'http://icons.iconarchive.com/icons/icons8/ios7/256/Users-User-Male-icon.png';
		
									this.cdr.markForCheck()
		
								}
							}
							if (res.result.data.length === 0) {
								this.patientData["status"] = "N/A"
								this.patientData["checkedIn"] = "N/A"
								this.patientData["DOB"] = "N/A"
								this.patientData["companyName"] = "N/A"
								this.patientData["caseType"] = "N/A"
								this.patientData["picture"] = 'http://icons.iconarchive.com/icons/icons8/ios7/256/Users-User-Male-icon.png';
		
								this.cdr.markForCheck()
							}
							if (res.result.data.case_patients[i].dob) {
								this.patientData["DOB"] = res.result.data.case_patients[i].dob
							} else {
								this.patientData["DOB"] = "N/A"
							}

							this.cdr.markForCheck()
						} else {
							this.patientData["status"] = "N/A"
							this.patientData["checkedIn"] = "N/A"
							this.patientData["DOB"] = "N/A"
							this.patientData["companyName"] = "N/A"
							this.patientData["caseType"] = "N/A"
							this.patientData["picture"] = 'http://icons.iconarchive.com/icons/icons8/ios7/256/Users-User-Male-icon.png';

							this.cdr.markForCheck()

						}
					}
					if (res.result.data.length === 0) {
						this.patientData["status"] = "N/A"
						this.patientData["checkedIn"] = "N/A"
						this.patientData["DOB"] = "N/A"
						this.patientData["companyName"] = "N/A"
						this.patientData["caseType"] = "N/A"
						this.patientData["picture"] = 'http://icons.iconarchive.com/icons/icons8/ios7/256/Users-User-Male-icon.png';

						this.cdr.markForCheck()
					}
				})
				*/
	}

	public updatePatientRecord() {
		this.isHidePatientRecord = false;
	}

	public removeTopEntry(docObj) {
		// if (docObj.doctor) {
		for (let i = 0; i < this.doctors.length; i++) {
			if (this.doctors[i].id == docObj.id && docObj.user_id) {
				this.doctors[i].is_checked = false;
				this.subjectSer.refreshRemove(this.doctors[i]);
				break;
			}
		}

		for (let i = 0; i < this.specialities.length; i++) {
			if (this.specialities[i].id == docObj.id && !docObj.user_id) {
				// this.specialities[i].isChecked = false;
				this.subjectSer.refreshRemove(this.specialities[i]);
				break;
			}
		}

		for (let i = 0; i < this.calenderDoctors.length; i++) {
			if (this.calenderDoctors[i].id == docObj.id) {
				this.calenderDoctors.splice(i, 1);
				break;
			}
		}
		if (this.calenderDoctors.length == 0) {
			// this.calenderDoctors.push({
			// 	name: '', id: 0, doctor: {
			// 		last_name: ""
			// 	}
			// })
			this.calenderDoctors.push(new DoctorInfo({ id: 0 }));
		}
		// this.subjectSer.refreshDoctors(this.doctors)
		if (this.calenderDoctors.length < this.currentLimitToShow + 1) {
			this.currentDoctors = JSON.parse(JSON.stringify(this.calenderDoctors));
			this.currentDocsIndex = [];
			for (let r = 0; r < this.currentLimitToShow; r++) {
				this.currentDocsIndex.push(r);
			}
		} else {
			this.currentDoctors = [];
			if (this.calenderDoctors[this.currentDocsIndex[this.currentLimitToShow - 1]]) {
				for (let r = 0; r < this.currentLimitToShow; r++) {
					this.currentDoctors.push(this.calenderDoctors[this.currentDocsIndex[r]]);
				}
			} else {
				for (let r = 0; r < this.currentLimitToShow; r++) {
					this.currentDoctors.push(this.calenderDoctors[this.currentDocsIndex[r] - 1]);
				}
				for (let r = 0; r < this.currentLimitToShow; r++) {
					this.currentDocsIndex[r] = this.currentDocsIndex[r] - 1;
				}
			}
		}  
		const scheduler = this.storageData.getSchedulerInfo();
		scheduler.front_desk_doctor_calendar_doctors = JSON.stringify(this.calenderDoctors);
		this.storageData.setSchedulerInfo(scheduler);
		if (docObj.id != 0 && !docObj.user_id) {
			this.getDoctorAndClinicsBySpec();
		} else if (docObj.id != 0 && docObj.user_id) {
			this.getClinicAndSpecByDoctor();
		}
		this.getAssignments();
		this._doctorCalendarService.currentDoc = this.currentDoctors;
		this.scrollToCurrentView();
	}

	chnageDoctorHeader(direction: string) {
		if (this.calenderDoctors.length > this.currentLimitToShow) {
			if (direction === 'left') {
				if (this.currentDocsIndex[0] > this.currentLimitToShow - 1) {
					this.currentDoctors = [];
					for (let r = this.currentLimitToShow; r > 0; r--) {
						this.currentDoctors.push(this.calenderDoctors[this.currentDocsIndex[0] - r]);
					}
					let temp = this.currentDocsIndex[0];
					this.currentDocsIndex = [];
					for (let r = this.currentLimitToShow; r > 0; r--) {
						this.currentDocsIndex.push(temp - r);
					}
				} else {
					this.currentDoctors = [];
					for (let r = 0; r < this.currentLimitToShow; r++) {
						this.currentDoctors.push(this.calenderDoctors[r]);
						this.currentDocsIndex.push(r);
					}
					this.currentDocsIndex = [];
					for (let r = 0; r < this.currentLimitToShow; r++) {
						this.currentDocsIndex.push(r);
					}
				}
			} else if (direction == 'right') {
				if (
					this.currentDocsIndex[this.currentLimitToShow - 1] + this.currentLimitToShow <
					this.calenderDoctors.length
				) {
					this.currentDoctors = [];
					for (let r = 1; r <= this.currentLimitToShow; r++) {
						this.currentDoctors.push(
							this.calenderDoctors[this.currentDocsIndex[this.currentLimitToShow - 1] + r],
						);
					}
					let temp = this.currentDocsIndex[this.currentLimitToShow - 1];
					this.currentDocsIndex = [];
					for (let r = 1; r <= this.currentLimitToShow; r++) {
						this.currentDocsIndex.push(temp + r);
					}
				} else {
					this.currentDoctors = [];
					for (let r = this.currentLimitToShow; r > 0; r--) {
						this.currentDoctors.push(this.calenderDoctors[this.calenderDoctors.length - r]);
					}
					this.currentDocsIndex = [];
					for (let r = this.currentLimitToShow; r > 0; r--) {
						this.currentDocsIndex.push(this.calenderDoctors.length - r);
					}
				}
			}
			this._doctorCalendarService.currentDoc = this.currentDoctors;

			if (
				this._doctorCalendarService.currentDoc &&
				this._doctorCalendarService.currentDoc.length > 0
			) {
				this.hourSegments = this.setProviderTimeSlot(this._doctorCalendarService.currentDoc[0]);
			}
			this.scrollToCurrentView();
		}
		this.getAssignments();
	}

	removeTopEntryPatient() {
		if (this._doctorCalendarService.PatientSchedulingCalendar == false) {
			this.patientCheck = false;
			this.patientDetails = {};
			this._doctorCalendarService.patientName = null;
			this.currentLimitToShow = this.currentLimitToShow + 1;
			if (this.calenderDoctors[this.currentDocsIndex[this.currentDocsIndex.length - 1] + 1]) {
				this.currentDoctors.push(
					this.calenderDoctors[this.currentDocsIndex[this.currentDocsIndex.length - 1] + 1],
				);
				this.currentDocsIndex.push(this.currentDocsIndex[this.currentDocsIndex.length - 1] + 1);
			} else if (this.calenderDoctors[this.currentDocsIndex[0] - 1]) {
				this.currentDoctors.unshift(this.calenderDoctors[this.currentDocsIndex[0] - 1]);
				this.currentDocsIndex.unshift(this.currentDocsIndex[0] - 1);
			}
			const scheduler = this.storageData.getSchedulerInfo();
			scheduler.front_desk_doctor_calendar_patient = '';
			this.storageData.setSchedulerInfo(scheduler);
			this.subjectSer.clearPatientData();
			this.getAssignments();
		}
	}

	public startEvaluation(appObj) {
		if (appObj && appObj.template_type && appObj.template_type == 'static_ios') {
			this.toastrService.error('Please use an IOS device/iPad to access the template');
			return;
		} else {
			this.subjectSer.refreshStartEval([]);
			this.updateLoader(true)
			this.startEvaluationAppointment(appObj);
		}
	}
	startEvualtionFlagShow(appObj) {
		 
		this.calendarEvaluationService.EnabledFlow(appObj, appObj && appObj.enabledFlow);
		// appObj.speciality_key === 'medical_doctor'
		// 	? this.mainService.setenableSaveRecordMedicalDoctor(true)
		// 	: appObj.speciality_key === 'hbot'
		// 	? this.mainService.setenableSaveRecordHbot(true)
		// 	: this.mainService.setenableSaveRecordManualSpeciality(true);
	}
	showEvaluation(appObj) {
		// appObj.speciality_key === 'medical_doctor'
		// 	? this.mainService.setenableSaveRecordMedicalDoctor(false)
		// 	: appObj.speciality_key === 'hbot'
		// 	? this.mainService.setenableSaveRecordHbot(false)
		// 	: this.mainService.setenableSaveRecordManualSpeciality(false);
		this.localStorage.set('appdata',JSON.stringify({...appObj,evalFrom:'dayview'}));
		this.calendarEvaluationService.EnabledFlow(appObj, 'specialtyWithTemplateType');
		this.subjectSer.refreshStartEval([]);
		this.updateLoader(true)
		this.startEvaluationAppointment(appObj);
	}

	public patientSelected(e) {
		 
		if (this.patientCheck != true) {
			this.patientCheck = true;
			this.currentLimitToShow = this.currentLimitToShow - 1;
			if (this.currentDocsIndex.length === this.currentLimitToShow + 1) {
				this.currentDocsIndex.pop();
			}
			if (this.currentDoctors.length === this.currentLimitToShow + 1) {
				this.currentDoctors.pop();
			}
		}
		if (e.id) {
			e['chartNo'] = e.id;
		}
		e['name'] = e.middle_name
			? e.first_name + ' ' + e.middle_name + ' ' + e.last_name
			: e.first_name + ' ' + e.last_name;

		this.patientDetails = e;
		this._doctorCalendarService.patientName = this.patientDetails;
		if (this.view == 'week' || this.view == 'day') {
			this.weekSubject.refreshPatientCalendar([]);
		} else {
			this.subject.refreshPatientCalendar([]);
		}
		const scheduler = this.storageData.getSchedulerInfo();
		scheduler.front_desk_doctor_calendar_patient = JSON.stringify(e);
		this.storageData.setSchedulerInfo(scheduler);
		this.cdr.detectChanges();
		// this.getAssignments();
		this.getMainCalendarCurrentDate(this.viewDate);
	}

	getSeedInfo() {
		this.requestService
			.sendRequest(
				MDSessionEnum.Seeded_Info_GET,
				'GET',
				REQUEST_SERVERS.medical_doctor_api_url,
				removeEmptyAndNullsFormObject({ user_id: this.storageData.getUserId() }),
			)
			.subscribe((responce: HttpSuccessResponse) => {
				this.MDService.setOfflineData(responce.result.data);
			});
	}
	ngOnDestroy() {
		this.subscriptions.forEach((subscription) => subscription.unsubscribe());
		this.destroySpecialty$.next(true);
		this.destroySpecialty$.unsubscribe();
		this.destroyClinic$.next(true);
		this.destroyClinic$.unsubscribe();
		this.destroyDoctor$.next(true);
		this.destroyDoctor$.unsubscribe();
		for(let i = 0; i < this.currentDoctors.length; i++){
			this.calenderDoctors = this.calenderDoctors.filter(x => x.id != this.currentDoctors[i].id)
		}
		this.calenderDoctors = this.currentDoctors.concat(this.calenderDoctors);
		const scheduler = this.storageData.getSchedulerInfo();
		scheduler.front_desk_doctor_calendar_doctors = JSON.stringify(this.calenderDoctors);
		this.storageData.setSchedulerInfo(scheduler);
	}

	public selectSpec(spec) {
		this.selectDoctor(spec, true);
	}
	public getSpeciality(page?, byDefaultSelection: boolean = true) {
		let allClinicIds = this.storageData.getFacilityLocations();
		let practice_location_ids = [];
		let doctor_ids = [];
		let speciality_ids = [];
		if (this.calenderClinics.length > 0) {
			this.calenderClinics.map((practicelocation) => {
				if (practicelocation.id != 0) {
					return practice_location_ids.push(practicelocation.id);
				}
			});
		}
		if (this.calenderDoctors.length > 0) {
			this.calenderDoctors.map((practicelocation) => {
				if (practicelocation.user_id) {
					return doctor_ids.push(practicelocation.user_id);
				}
				// else if(!practicelocation.user_id )
				// {
				// 	return speciality_ids.push(practicelocation.id)

				// }
			});
		}
		if (this.aclService.hasPermission('schedule-doctor-specialty-access')) {
		}

		this.requestService
			.sendRequest(
				AssignSpecialityUrlsEnum.GetUserInfoBySpecialities,
				'post',
				REQUEST_SERVERS.schedulerApiUrl1,
				{
					facility_location_ids:
						practice_location_ids && practice_location_ids.length > 0
							? practice_location_ids
							: allClinicIds,
					doctor_ids:
						doctor_ids && doctor_ids.length > 0
							? doctor_ids
							: this.aclService.hasPermission(this.userPermissions.all_specialty_access)
							? []
							: [this.localStorageId],
					// speciality_ids:!this.aclService.hasPermission("schedule-doctor-specialty-access")?:[],
					// speciality_ids:speciality_ids,

					is_provider_calendar: true,
					// per_page: Pagination.per_page,
					per_page: Pagination.per_page_provider_calender,
					page: page,
					pagination: true,
				},
			)
			.pipe(takeUntil(this.destroySpecialty$))
			.subscribe((response: HttpSuccessResponse) => {
				// this.specialities = response.result.data.docs;
				const scheduler = this.storageData.getSchedulerInfo();
				let localDoctors = JSON.parse(scheduler.front_desk_doctor_calendar_doctors);
				for (let doctor of localDoctors) {
					if (!(doctor.doctor && doctor.doctor.specialities)) {
						let index = response?.result?.data?.docs.findIndex(
							(speciality) => speciality.id == doctor.id,
						);
						if (index > -1) {
							// this.specialities[index].is_checked = true;
							response.result.data.docs[index].is_checked = true;
						}
					}

					// data[i]['label'] = data[i].name
					// for (let j = 0; j < localDoctors.length; j++) {
					// 	if (data[i]["id"] == localDoctors[j]["id"] && !localDoctors[j]['doctor']) {
					// 		data[i]["isChecked"] = true;
					// 	}
					// }
					// this.specialities = [...this.specialities, data[i]];
					// this.specialities[i]["color"] = '#' + data[i]["color"]
				}
				if (response?.result?.data?.docs.length > 0) {
					this.specialities = [...this.specialities, ...response?.result?.data?.docs];
					if (response.result.data.pages > this.currentpageSpecialty) {
						this.currentpageSpecialty = this.currentpageSpecialty + 1;
						this.getSpeciality(this.currentpageSpecialty);
					} else {
						// if( this.allClinicIds.length==1 && this.doctors.length==1&& this.specialities.length==1)
						// {
						// 	let byDefaultSpeciality:any=this.specialities[0];

						// 	let byDefaultSpecialityExist= this.calenderDoctors.find(
						// 		(calender_doc) => (calender_doc.id == byDefaultSpeciality.id && !calender_doc.user_id),
						// 		);

						// 	if(!byDefaultSpecialityExist)
						// 	{
						// 		byDefaultSpeciality.is_checked=true;
						// 		this.selectDoctor(byDefaultSpeciality,false,false);
						// 	}
						// }
						this.preSelectClinic(byDefaultSelection);
						this.preSelectProvider(byDefaultSelection);
						this.preSelectSpeciality(byDefaultSelection);
					}
				}
				this.subjectSer.refreshSpecialities(this.specialities);
			});
	}
	highl(e) {
		this.highlightdayH = e;
	}

	preSelectSpeciality(byDefaultSelection) {
		let allClinicIds = this.storageData.getFacilityLocations();
		if (
			byDefaultSelection &&
			allClinicIds.length == 1 &&
			this.doctors.length == 1 &&
			this.specialities.length == 1
		) {
			let byDefaultSpeciality: any = this.specialities[0];

			let byDefaultSpecialityExist = this.calenderDoctors.find(
				(calender_doc) => calender_doc.id == byDefaultSpeciality.id && !calender_doc.user_id,
			);

			if (!byDefaultSpecialityExist) {
				byDefaultSpeciality.is_checked = true;
				this.selectDoctor(byDefaultSpeciality, false, false);
			}
		}
	}

	preSelectClinic(byDefaultSelection) {
		 
		let allClinicIds = this.storageData.getFacilityLocations();
		if (
			byDefaultSelection &&
			allClinicIds.length == 1 &&
			this.clinics.length == 1 &&
			this.doctors.length == 1 &&
			this.specialities.length == 1
		) {
			let byDefaultclinic = this.clinics[0];
			let byDefaultClinicExist = this.calenderClinics.find(
				(calender_clinic) => calender_clinic.id == byDefaultclinic.id,
			);
			if (!byDefaultClinicExist) {
				byDefaultclinic.is_checked = true;
				this.selectClinic(byDefaultclinic, false);
			}
		}
	}

	preSelectProvider(byDefaultSelection) {
		 
		let allFacilitySupervisorClinicIds = this.storageData.getFacilityLocations();
		if (
			byDefaultSelection &&
			allFacilitySupervisorClinicIds.length == 1 &&
			this.doctors.length == 1 &&
			this.specialities.length == 1
		) {
			let byDefaultProvider = this.doctors[0];

			let byDefaultProviderExist = this.calenderDoctors.find(
				(calender_doc) =>
					calender_doc.id == byDefaultProvider.id &&
					byDefaultProvider.user_id &&
					byDefaultProvider.user_id == calender_doc.user_id,
			);

			if (!byDefaultProviderExist) {
				byDefaultProvider.is_checked = true;
				this.selectDoctor(byDefaultProvider, false, false);
			}
		}
	}

	getTimeAgaintsPraticeLocation(facilityId) {
		this.updateLoader(true)
		const facilityArray = {
			facility_location_ids: facilityId.map((res) => res.id),
		};
		this.requestService
			.sendRequest(
				DoctorCalendarUrlsEnum.getMaxMinTimeOfFacility,
				'POST',
				REQUEST_SERVERS.schedulerApiUrl1,
				facilityArray,
			)
			.subscribe(
				(response: HttpSuccessResponse) => {
					this.updateLoader(false)
					if (response.result && response.result.data) {
						this.timeAgaintsPraticeLocation['endTime'] = response.result.data.end_time_isb
							? response.result.data.end_time_isb
							: null;
						this.timeAgaintsPraticeLocation['startTime'] = response.result.data.start_time_isb
							? response.result.data.start_time_isb
							: null;
						// if(this.timeAgaintsPraticeLocation['endTime'] && this.timeConvertion(this.timeAgaintsPraticeLocation['endTime']) <  this.timeAgaintsPraticeLocation['startTime'] && this.timeConvertion(this.timeAgaintsPraticeLocation['startTime'])){
						// 	this.timeAgaintsPraticeLocation['endTime'] = '';
						//     this.timeAgaintsPraticeLocation['startTime'] = '';
						// 	this.toastrService.error('Practice location timing is not valid.Kindly Try again', 'ERROR');
						// }
					} else {
						this.toastrService.error('Internal Server Error', 'ERROR');
					}
				},
				(error) => {
					this.updateLoader(false)
					this.toastrService.error('Internal Server Error', 'ERROR');
				},
			);
	}
	timeConvertion(time: any) {
		const hour = time.split(':')[0];
		const min = time.split(':')[1];
		const sec = time.split(':')[2];
		return `${hour}:${min}:${sec}`;
	}
	setConditionalExtraParamsForProvidersGet(facility_id?) {
		let loggedUserID = JSON.stringify(this.storageData.getUserId());
		if (facility_id) {
			let conditionalExtraApiParamsForProvidersGet = {
				facility_location_id: facility_id ? facility_id : null,
				user_id: !this.isProviderLogedIn ? loggedUserID : null,
			};
			return conditionalExtraApiParamsForProvidersGet;
		}
	}
	setConditionalExtraParamsForTechnicianGet(facility_id?) {
		//IN CASE PROVIDER BASE/SPECIALTY BASE  APPOINTMENT (LOGIN AS PROVDER)
		if (facility_id) {
			let loggedUserID = JSON.stringify(this.storageData.getUserId());
			let conditionalExtraApiParamsForTechnicianGet = {
				supervisor_id: this.isProviderLogedIn ? loggedUserID : null,
				facility_location_id: facility_id ? facility_id : null,
			};
			return conditionalExtraApiParamsForTechnicianGet;
		}
	}
	setConditionalExtraParamsForTemplatesGet(facility_id?) {
		//IN CASE PROVIDER BASE/SPECIALTY BASE  APPOINTMENT (LOGIN AS PROVDER)
		if (facility_id) {
			let loggedUserID = JSON.stringify(this.storageData.getUserId());
			let conditionalExtraApiParamsForTechnicianGet = {
				supervisor_id: this.isProviderLogedIn ? loggedUserID : null,
				facility_location_id: facility_id ? facility_id : null,
			};
			return conditionalExtraApiParamsForTechnicianGet;
		}
	}
	middle_name;
	first_name;
	last_name;
	billing_title;
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
	getQualifier(qualifier,isbillingTitle?){
		return (isbillingTitle) ? `${qualifier ?' ('+qualifier+')':''}` : qualifier ? `, ${qualifier}` : '';
	}
	getBillingTitle(billingTitle) {
		this.billing_title = billingTitle;
		return this.billing_title ? this.billing_title : ''
	}
	getFullName(data = this.storageData.getBasicInfo()) {
		let userRoles = this.storageData.getRole();
		return (
			this.getFirstName(data && data.first_name ? data.first_name : null) +
			' ' +
			this.getMiddleName(data && data.middle_name ? data.middle_name : null) +
			' ' +
			this.getLastName(data && data.last_name ? data.last_name : null) +

			`${this.getQualifier(userRoles?.qualifier)? ", "+this.getQualifier(userRoles?.qualifier):''}`
		);
	}
	setValuesTechnician(data?) {
		let loggedUserID = JSON.stringify(this.storageData.getUserId());
		let loggindUserRoles = this.storageData.getRole();
		let logginUserBillingTitle = this.storageData.getBillingTitle();
		let isLoggedTechnician: any =
			this.storageData.loggedInUser() == UsersType.TECHNICIAN ? true : false;
		if (!this.isProviderLogedIn && isLoggedTechnician) {
			// TECHNICIAN BASE APPOINTMENT
			let selectedMultipleFieldFiterTechnician = [
				{
					id: loggedUserID ? parseInt(loggedUserID) : null,
					name:`
					    ${this.getFullName()} 
						${this.getBillingTitle(logginUserBillingTitle)? ", "+this.getBillingTitle(logginUserBillingTitle):''} 
						${this.getQualifier(loggindUserRoles.qualifier)? this.getQualifier(loggindUserRoles.qualifier,this.getBillingTitle(logginUserBillingTitle)):''}
					`,
					roleQualifierName:
				    `${this.getFullName()} 
					${this.getBillingTitle(logginUserBillingTitle)? ", "+this.getBillingTitle(logginUserBillingTitle):''} 
					${this.getQualifier(loggindUserRoles.name)? this.getQualifier(loggindUserRoles.name,this.getBillingTitle(logginUserBillingTitle)):''}
				    `
				},
			];
			return selectedMultipleFieldFiterTechnician;
		}
	}
	setValuesProviders(doctorInfo?) {
		debugger;
		if (this.isProviderLogedIn && !doctorInfo) {
			let loggedUser = this.storageData.getBasicInfo();
			let selectedMultipleFieldFiterProviders = [
				{
					id: loggedUser && loggedUser.id ? loggedUser.id : null,
					name:
						loggedUser && loggedUser.first_name && loggedUser.last_name
							? this.getFullName(loggedUser)
							: null,
				},
			];
			return selectedMultipleFieldFiterProviders;
		} else if (doctorInfo) {
			let selectedMultipleFieldFiterProviders = [
				{
					id: doctorInfo && doctorInfo.user_id ? doctorInfo.user_id : null,
					name:
						doctorInfo && doctorInfo.first_name && doctorInfo.last_name
							? this.getFullName(doctorInfo)
							: null,
				},
			];
			return selectedMultipleFieldFiterProviders;
		}
	}
	isProviderLoggedIn() {
		this.storageData.loggedInUser() == UsersType.PROVIDER ? (this.isProviderLogedIn = true) : false;
		// this.isProviderLogedIn = this.storageData.isDoctor();
	}
	set_Provider_Technician_Template_After_VisitSessionCreate(inner, item) {
		debugger;
		inner['template_id'] = item && item.template && item.template.id;
		inner['template_type'] = item && item.template && item.template.type;
		if (item && item.visit_session) {
			inner['technician_id'] = item && item.technician && item.technician.id;
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
		}
	}
	isAppointmentHasTransportation(transportation) {
		 
		let has_tranportation = false;
		// this.data.forEach((element:any,index) => {
		if (transportation && transportation.length == 2) {
			transportation.forEach((tranport) => {
				if (
					tranport &&
					tranport.type &&
					(tranport.type == this.enumTransportType.from_home ||
						tranport.type == this.enumTransportType.from_medical_office ||
						tranport.type == this.enumTransportType.other)
				) {
					has_tranportation = true;
				}
			});
		}
		return has_tranportation;
		// 	this.data[index]['has_tranportation'] = has_tranportation;
		// });
	}

	updateLoader(state: boolean) {
		this.mainService.isLoaderPending.next(state);
		this.cdr.markForCheck();
	}

	getStartAndEndDateOfWeek(currentDate: Date) {
		const date = new Date(currentDate);
	
		const startOfWeek = new Date(date);
		startOfWeek.setDate(date.getDate() - date.getDay());
	
		const endOfWeek = new Date(startOfWeek);
		endOfWeek.setDate(startOfWeek.getDate() + 6); 
	
		const isoStartDate = startOfWeek.toISOString().split('T')[0];
		const isoEndDate = endOfWeek.toISOString().split('T')[0];
	
		return {
			startOfWeek: isoStartDate,
			endOfWeek: isoEndDate
		};
	}
	
}
