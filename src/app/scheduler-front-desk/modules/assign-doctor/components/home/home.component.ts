import { map, takeUntil } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import {
	Component,
	EventEmitter,
	OnDestroy,
	OnInit,
	Output,
	ViewChild,
} from '@angular/core';
import {
	FormBuilder,
	FormGroup,
	Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

//calendar

import { ToastrService } from 'ngx-toastr';

import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import {
	HttpSuccessResponse,
	StorageData,
} from '@appDir/pages/content-pages/login/user.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import {
	AddToBeSchedulledUrlsEnum,
} from '@appDir/scheduler-front-desk/modules/add-to-be-scheduled/add-to-be-scheduled-list-urls-enum';
import {
	AssignSpecialityUrlsEnum,
} from '@appDir/scheduler-front-desk/modules/assign-speciality/assign-speciality-urls-enum';
import {
	SupervisorNotificationsUrlsEnum,
} from '@appDir/scheduler-front-desk/modules/supervisor-notifications/supervisor-notifications-urls-enum';
import { AclService } from '@appDir/shared/services/acl.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { FrontDeskService } from '../../../../front-desk.service';
import { SchedulerSupervisorService } from '../../../../scheduler-supervisor.service';
import { AssignDoctorSubjectService } from '../../assign-doctor-subject.service';
import { AssignDoctorService } from '../../assign-doctor.service';
import { SubjectService } from '../../subject.service';
import {
	CalendarDayViewComponent,
	CalendarMonthViewComponent,
	CalendarWeekViewComponent,
} from '../../utils/my-calendar/src';
import { Pagination } from '@appDir/shared/models/pagination';
import { Subject } from 'rxjs';
import { convertDateTimeForRetrieving, convertDateTimeForSending } from '@appDir/shared/utils/utils.helpers';

@Component({
	selector: 'app-home-doc',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss'],
})
export class HomeComponent extends PermissionComponent implements OnInit,OnDestroy {
	@Output() updateSpecAssign = new EventEmitter();
	@ViewChild(CalendarMonthViewComponent) monthView: CalendarMonthViewComponent;
	@ViewChild(CalendarWeekViewComponent) weekView: CalendarWeekViewComponent;
	@ViewChild(CalendarDayViewComponent) dayView: CalendarDayViewComponent;

	public clinics: any = [];
	public doctors: any = [];
	public docAssigns: any;
	public calenderDoctor: any = [{ name: '', id: 0 }];
	public calenderClinics: any = [{ name: '', id: 0 }];
	public model: any;
	public myForm: FormGroup;
	public myDatePickerOptions: any = {
		dateFormat: 'dd.mm.yyyy',
		inline: true,
		height: '100%',
		selectorWidth: '100%',
		firstDayOfWeek: 'su',
		sunHighlight:false

	};
	public view: string = 'month';
	public viewDate: Date = new Date();
	minDate = new Date('1900/01/01');
	public isSwapped: boolean = true;
	private allFacilitySupervisorClinicIds: any = [];
	public state: boolean = false;
	public datePick;
	public tempDatePick: Date;
	public currentpagePracticeLocation:number=1;
	public currentpageProvider:number=1;
	public destroyProvider$:Subject<boolean>=new Subject<boolean>();
	public destroyClinic$:Subject<boolean>=new Subject<boolean>()
	constructor(
		aclService: AclService,
		router: Router,
		private _httpClient: HttpClient,
		private formBuilder: FormBuilder,
		protected requestService: RequestService,
		public subject: SubjectService,
		public service: AssignDoctorService,
		public _fdService: FrontDeskService,
		private storageData: StorageData,
		public _monthAssignmentSubject: AssignDoctorSubjectService,
		private toastrService: ToastrService,
		public _supervisorService: SchedulerSupervisorService,
	) {
		super(aclService, router);
		const scheduler = this.storageData.getSchedulerInfo();

		if (
			scheduler.supervisor_assign_doctor_is_swapped == '' ||
			scheduler.supervisor_assign_doctor_is_swapped == undefined
		) {
			scheduler.supervisor_assign_doctor_is_swapped = 'true';
		}
		if (
			scheduler.supervisor_assign_doctor_all_clinics == '' ||
			scheduler.supervisor_assign_doctor_all_clinics == undefined
		) {
			scheduler.supervisor_assign_doctor_all_clinics = '[{"name": "", "id": 0}]';
		}
		if (
			scheduler.supervisor_assign_doctor_all_doctors == '' ||
			scheduler.supervisor_assign_doctor_all_doctors == undefined
		) {
			scheduler.supervisor_assign_doctor_all_doctors = '[{"name": "", "id": 0}]';
		}
		if (
			scheduler.supervisor_assign_doctor_view == '' ||
			scheduler.supervisor_assign_doctor_view == undefined
		) {
			scheduler.supervisor_assign_doctor_view = 'month';
		}

		this.isSwapped = JSON.parse(scheduler.supervisor_assign_doctor_is_swapped);
		this.view = scheduler.supervisor_assign_doctor_view;
		this.calenderClinics = JSON.parse(scheduler.supervisor_assign_doctor_all_clinics);
		this.calenderDoctor = JSON.parse(scheduler.supervisor_assign_doctor_all_doctors);
		let currentDate = new Date();
		this.model = {
			date: {
				year: currentDate.getFullYear(),
				month: currentDate.getMonth() + 1,
				day: currentDate.getDate(),
			},
		};
		this.storageData.setSchedulerInfo(scheduler);
	}

	ngOnInit(): void {
		this.getClinics(this.currentpagePracticeLocation);
		this.getDoctors(this.currentpageProvider);
		this.getAssignments();
		this.myForm = this.formBuilder.group({
			myDate: [null, Validators.required],
		});
		this._monthAssignmentSubject.castupdateAssignment.subscribe((res) => {
			if (res.length != 0) {
				this.getAssignments();
			}
		});
		this.subject.castUpdate.subscribe((res) => {
			if (res.length != 0) {
				this.getAssignments();
			}
		});
	}

	ngOnDestroy() {
		this.destroyClinic$.next(true);
		// Now let's also unsubscribe from the subject itself:
		this.destroyClinic$.unsubscribe();
		this.destroyProvider$.next(true);
		// Now let's also unsubscribe from the subject itself:
		this.destroyProvider$.unsubscribe();
	  }
	
	public shift() {
		this.isSwapped = !this.isSwapped;
		let tempArr;
		tempArr = JSON.parse(JSON.stringify(this.calenderDoctor));
		this.calenderDoctor = JSON.parse(JSON.stringify(this.calenderClinics));
		this.calenderClinics = JSON.parse(JSON.stringify(tempArr));
		const scheduler = this.storageData.getSchedulerInfo();
		scheduler.supervisor_assign_doctor_is_swapped = JSON.stringify(this.isSwapped);
		scheduler.supervisor_assign_doctor_all_doctors = JSON.stringify(this.calenderDoctor);
		scheduler.supervisor_assign_doctor_all_clinics = JSON.stringify(this.calenderClinics);
		this.storageData.setSchedulerInfo(scheduler);
	}
	public selectClinic(clinic:any) {
		if (this.isSwapped) {
			let check = false;
			for (let i = 0; i < this.calenderClinics.length; i++) {
				if (clinic['id'] == this.calenderClinics[i]['id']) {
					check = true;
					break;
				}
			}
			if (check == false) {
				if (this.calenderClinics.length != 0 && this.calenderClinics[0].id == 0) {
					this.calenderClinics = [];
				}
				clinic['isChecked'] = true;
				this.calenderClinics.push(clinic);
			} else {
				for (let i = 0; i < this.calenderClinics.length; i++) {
					if (this.calenderClinics[i].name == clinic.name) {
						this.calenderClinics.splice(i, 1);
						for (let j = 0; j < this.clinics.length; j++) {
							if (this.clinics[j].name == clinic.name) {
								this.clinics[j].isChecked = false;
							}
						}
						break;
					}
				}
			}
			if (this.calenderClinics.length == 0) {
				this.calenderClinics.push({ name: '', id: 0 });
			}
			const scheduler = this.storageData.getSchedulerInfo();
			scheduler.supervisor_assign_doctor_all_clinics = JSON.stringify(this.calenderClinics);
			this.storageData.setSchedulerInfo(scheduler);
		} else {
			let check = false;
			for (let i = 0; i < this.calenderDoctor.length; i++) {
				if (clinic['id'] == this.calenderDoctor[i]['id']) {
					check = true;
					break;
				}
			}
			if (!check) {
				if (this.calenderDoctor[0].id == 0) {
					this.calenderDoctor = [];
				}
				clinic['isChecked'] = true;
				this.calenderDoctor.push(clinic);
			} else {
				for (let i = 0; i < this.calenderDoctor.length; i++) {
					if (this.calenderDoctor[i].name == clinic.name) {
						this.calenderDoctor.splice(i, 1);
						for (let j = 0; j < this.clinics.length; j++) {
							if (this.clinics[j].name == clinic.name) {
								this.clinics[j].isChecked = false;
							}
						}
						break;
					}
				}
			}
			if (this.calenderDoctor.length == 0) {
				this.calenderDoctor.push({ name: '', id: 0 });
			}
			const scheduler = this.storageData.getSchedulerInfo();
			scheduler.supervisor_assign_doctor_all_doctors = JSON.stringify(this.calenderDoctor);
			this.storageData.setSchedulerInfo(scheduler);
		}
		this.getAssignments();
		this.destroyProvider$.next(true);
		this.doctors=[];
		this.currentpageProvider=1;
		this.getDoctors(this.currentpageProvider);
		if(this.isSwapped)
		{
		  this.subject.filteredClinic.next(this.calenderDoctor);
		}
		else
		{
		  this.subject.filteredClinic.next(this.calenderClinics);
		}
	}
	public selectDoctor(doctor) {
		debugger;
		if (this.isSwapped) {
			let check = false;
			for (let i = 0; i < this.calenderDoctor.length; i++) {
				if (doctor.doctor['specialities']['id'] == (this.calenderDoctor && 
					this.calenderDoctor[i]['doctor'] && 
					this.calenderDoctor[i]['doctor']['specialities'] && 
					this.calenderDoctor[i]['doctor']['specialities']['id']) && doctor['id'] == this.calenderDoctor[i]['id'] && doctor['facility_location_id'] == this.calenderDoctor[i]['facility_location_id']) {
					check = true;
					break;
				}
			}
			if (!check) {
				if (this.calenderDoctor.length != 0 && this.calenderDoctor[0].id == 0) {
					this.calenderDoctor = [];
				}
				doctor['isChecked'] = true;5
				this.calenderDoctor.push(doctor);
				for (let i = 0; i < this.doctors.length; i++) {
					if (doctor.doctor  &&   doctor.doctor['specialities'] &&  doctor.doctor['specialities']['id'] == (this.doctors &&this.doctors[i]['doctor'] && this.doctors[i]['doctor']['specialities']  && this.doctors[i]['doctor']['specialities']['id']) && this.doctors[i].id == doctor.id && this.doctors[i].facility_location_id == doctor.facility_location_id) {
						this.doctors[i].isChecked = true;
						break;
					}
				}


			} else {
				for (let i = 0; i < this.calenderDoctor.length; i++) {
					if (this.calenderDoctor[i].id == doctor.id && doctor['speciality_id']==this.calenderDoctor[i].speciality_id&&this.calenderDoctor[i].facility_location_id == doctor.facility_location_id) {
						this.calenderDoctor.splice(i, 1);
						for (let j = 0; j < this.doctors.length; j++) {
							if ( doctor['speciality_id'] == this.doctors[j]['speciality_id'] && this.doctors[j].id == doctor.id && this.doctors[j].facility_location_id == doctor.facility_location_id) {
								this.doctors[j].isChecked = false;
							}
						}
						break;
					}
				}
			}
			if (this.calenderDoctor.length == 0) {
				this.calenderDoctor.push({ name: '', id: 0 });
			}
			const scheduler = this.storageData.getSchedulerInfo();
			scheduler.supervisor_assign_doctor_all_doctors = JSON.stringify(this.calenderDoctor);
			this.storageData.setSchedulerInfo(scheduler);
		} else {
			let check = false;
			for (let i = 0; i < this.calenderClinics.length; i++) {
				if (doctor['speciality_id'] == this.calenderClinics[i]['speciality_id'] && doctor['id'] == this.calenderClinics[i]['id'] && doctor['facility_location_id'] == this.calenderClinics[i]['facility_location_id']) {
					check = true;
					break;
				}
			}
			if (!check) {
				if (this.calenderClinics[0].id == 0) {
					this.calenderClinics = [];
				}
				doctor['isChecked'] = true;
				this.calenderClinics.push(doctor);
			} else {
				for (let i = 0; i < this.calenderClinics.length; i++) {
					if (doctor['speciality_id'] == (this.calenderClinics && this.calenderClinics[i]['speciality_id']) && this.calenderClinics[i].id == doctor.id && doctor['facility_location_id'] == this.calenderClinics[i]['facility_location_id']) {
						this.calenderClinics.splice(i, 1);
						for (let j = 0; j < this.doctors.length; j++) {
							if (doctor['speciality_id'] == (this.doctors && this.doctors[j]['speciality_id']) && this.doctors && this.doctors[j].id == doctor.id && this.doctors[j].facility_location_id == doctor.facility_location_id) {
								this.doctors[j].isChecked = false;
							}
						}
						break;
					}
				}
			}
			if (this.calenderClinics.length == 0) {
				this.calenderClinics.push({ name: '', id: 0 });
			}
			const scheduler = this.storageData.getSchedulerInfo();
			scheduler.supervisor_assign_doctor_all_clinics = JSON.stringify(this.calenderClinics);
			this.storageData.setSchedulerInfo(scheduler);
		}
		this.getAssignments();
		this.destroyClinic$.next(true)
		this.currentpagePracticeLocation=1;
		this.clinics=[];
		this.getClinics(this.currentpagePracticeLocation);
		if(this.isSwapped)
		{
		  this.subject.filteredClinic.next(this.calenderDoctor);
		// this.subject.filteredClinic.next(this.calenderClinics);
		}
		else
		{
		  this.subject.filteredClinic.next(this.calenderClinics);
		// this.subject.filteredClinic.next(this.calenderDoctor);
		}
	}
	public removeTopEntry(_callenderClinic) {
		debugger;
		if (!this.isSwapped) {
			for (let i = 0; i < this.doctors.length; i++) {
				if (this.doctors[i].id == _callenderClinic.id && this.doctors[i].speciality_id == _callenderClinic.speciality_id && this.doctors[i].facility_location_id && _callenderClinic.facility_location_id) {
					this.doctors[i].isChecked = false;
					break;
				}
			}

			for (let i = 0; i < this.calenderClinics.length; i++) {
				if (this.calenderClinics[i].id == _callenderClinic.id && this.calenderClinics[i].speciality_id == _callenderClinic.speciality_id && this.calenderClinics[i].facility_location_id == _callenderClinic.facility_location_id) {
					this.calenderClinics.splice(i, 1);
					break;
				}
			}
			if (this.calenderClinics.length == 0) {
				this.calenderClinics.push({ name: '', id: 0 });
			}
			this.subject.refreshDoc(this.doctors);
		} else {
			for (let i = 0; i < this.clinics.length; i++) {
				if (this.clinics[i].id == _callenderClinic.id) {
					this.clinics[i].isChecked = false;
				}
			}

			for (let i = 0; i < this.calenderClinics.length; i++) {
				if (this.calenderClinics[i].id == _callenderClinic.id) {
					this.calenderClinics.splice(i, 1);
					break;
				}
			}
			if (this.calenderClinics.length == 0) {
				this.calenderClinics.push({ name: '', id: 0 });
			}
		}
		this.subject.refreshClinics(this.clinics);
		if(this.isSwapped)
			{
			this.subject.filteredClinic.next(this.calenderDoctor);
			}
    	else
			{
			this.subject.filteredClinic.next(this.calenderClinics);
			}
		const scheduler = this.storageData.getSchedulerInfo();
		scheduler.supervisor_assign_doctor_all_clinics = JSON.stringify(this.calenderClinics);
		this.storageData.setSchedulerInfo(scheduler);
	}
	public onDateChanged(event: any) {
		this.datePick = Date;
		this.datePick = event.date.year + '-' + event.date.month + '-' + event.date.day;
		this.viewDate = new Date (event.jsdate);
		this.tempDatePick = event.jsdate;
		this.getAssignments();
	}
	setDate(value) {

		this.viewDate = new Date(value.toDate());
		this.datePick = this.viewDate;
		this.tempDatePick =this.viewDate;
		this.getAssignments();

	  }


	public removeSideEntry(spec) {
		if (this.isSwapped) {
			for (let i = 0; i < this.doctors.length; i++) {
				if (this.doctors[i].id == spec.id && this.doctors[i].facility_location_id == spec.facility_location_id && this.doctors[i].speciality_id == spec.speciality_id) {
					this.doctors[i].isChecked = false;
					break;
				}
			}
			for (let i = 0; i < this.calenderDoctor.length; i++) {
				if (this.calenderDoctor[i].id == spec.id && this.calenderDoctor[i].facility_location_id == spec.facility_location_id && this.calenderDoctor[i].speciality_id == spec.speciality_id) {
					this.calenderDoctor.splice(i, 1);
					break;
				}
			}
			if (this.calenderDoctor.length == 0) {
				this.calenderDoctor.push({ name: '', id: 0 });
			}
			this.subject.refreshDoc(this.doctors);
			this.destroyClinic$.next(true)
			this.currentpagePracticeLocation=1;
		this.clinics=[];
		this.getClinics(this.currentpagePracticeLocation);
		} else {
			for (let i = 0; i < this.clinics.length; i++) {
				if (this.clinics[i].id == spec.id) {
					this.clinics[i].isChecked = false;
				}
			}
			for (let i = 0; i < this.calenderDoctor.length; i++) {
				if (this.calenderDoctor[i].id == spec.id) {
					this.calenderDoctor.splice(i, 1);
				}
			}
			if (this.calenderDoctor.length == 0) {
				this.calenderDoctor.push({ name: '', id: 0 });
			}
		}
		this.subject.refreshClinics(this.clinics);
		this.destroyProvider$.next(true);
		this.doctors=[];
		this.currentpageProvider=1;
		this.getDoctors(this.currentpageProvider);
		  if(this.isSwapped)
			{
			this.subject.filteredClinic.next(this.calenderDoctor);
			}
			else
			{
			this.subject.filteredClinic.next(this.calenderClinics);
			}
		const scheduler = this.storageData.getSchedulerInfo();
		scheduler.supervisor_assign_doctor_all_doctors = JSON.stringify(this.calenderDoctor);
		this.storageData.setSchedulerInfo(scheduler);
		this.getAssignments();
	}
	public getMainCalendarCurrentDate(event) {
		if (this.state) {
			let newDate = new Date(event);
			this.model = {
				date: {
					year: newDate.getFullYear(),
					month: newDate.getMonth() + 1,
					day: newDate.getDate(),
				},
			};

			this.myForm.patchValue({
				myDate: {
					date: {
						year: newDate.getFullYear(),
						month: newDate.getMonth() + 1,
						day: newDate.getDate(),
					},
				},
			});

			let currentDate =
				this.model.date.year + '-' + this.model.date.month + '-' + this.model.date.day;
			//
			this.viewDate = new Date(currentDate);
		} else {
			let newDate = new Date(event);
			this.model = {
				date: {
					year: newDate.getFullYear(),
					month: newDate.getMonth() + 1,
					day: newDate.getDate(),
				},
			};
		}
		this.getAssignments();
	}
	public getChangeDateNext(e) {
		let newDate = new Date(e);
		this.model = {
			date: { year: newDate.getFullYear(), month: newDate.getMonth() + 1, day: newDate.getDate() },
		};
	}
	public getChangeDatePrev(e) {
		let newDate = new Date(e);
		this.model = {
			date: { year: newDate.getFullYear(), month: newDate.getMonth() + 1, day: newDate.getDate() },
		};
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
	public getAssignments() {
		let docId = [],
			clinicId = [];
		if (this.isSwapped) {
			this.calenderDoctor.filter((element) => {
				if(element.id!=0)
				{
					docId.push(element.id);
				}
				
			});
			this.calenderClinics.filter((element) => {
				clinicId.push(element.id);
			});
		} else {
			this.calenderClinics.filter((element) => {
				if(element.id)
				{
					docId.push(element.id);

				}
			});
			this.calenderDoctor.filter((element) => {
				clinicId.push(element.id);
			});
		}
		this.viewDate = new Date(this.viewDate);
		let date = new Date(JSON.parse(JSON.stringify(this.viewDate)));
		let lastMonth = new Date(date.setMonth(date.getMonth() - 1));
		let nextMonth = new Date(date.setMonth(date.getMonth() + 3));
		let tempDate = lastMonth.getFullYear() + '-' + ('0' + (lastMonth.getMonth() + 1)).slice(-2);
		let startDate = tempDate + '-01';
		let tempEndDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 0);
		let endDate =
			tempEndDate.getFullYear() +
			'-' +
			('0' + (tempEndDate.getMonth() + 1)).slice(-2) +
			'-' +
			('0' + tempEndDate.getDate()).slice(-2);
		let st = new Date(startDate);
		st.setMinutes(0);
		st.setHours(0);
		st.setSeconds(0);
		st = convertDateTimeForSending(this.storageData, st);
		let ed = new Date(endDate);
		ed.setMinutes(59);
		ed.setHours(23);
		ed.setSeconds(59);
		ed = convertDateTimeForSending(this.storageData, ed);
		this.requestService
			.sendRequest(
				SupervisorNotificationsUrlsEnum.getAvailableDoctorAssignment,
				'POST',
				REQUEST_SERVERS.schedulerApiUrl1,
				{
					user_id:this.storageData.getUserId(),
					doctor_ids: docId,
					facility_location_ids: clinicId,

					end_date: ed,
					start_date: st,
				},
			)
			.subscribe((response: HttpSuccessResponse) => {
				if (response.result.data) {
					let tempAssings: any = JSON.stringify(response.result.data);
					tempAssings = JSON.parse(tempAssings);
					let assign = [];
					if (tempAssings.assignments) {
						for (let i = 0; i < tempAssings.assignments.length; i++) {
							tempAssings.assignments[i].dateList.forEach(doctorAssignment => {
								doctorAssignment.start_date=convertDateTimeForRetrieving(
									this.storageData,
									new Date(doctorAssignment.start_date),
								);
								doctorAssignment.end_date=convertDateTimeForRetrieving(
									this.storageData,
									new Date(doctorAssignment.end_date),
								);
								let startTime = new Date(doctorAssignment.start_date)
								.toString()
								.substring(16, 21);
							let endTime = new Date(doctorAssignment.end_date)
								.toString()
								.substring(16, 21);
							startTime = this.convert12(startTime);
							endTime = this.convert12(endTime);

							doctorAssignment['startTime'] = startTime;
							doctorAssignment['endTime'] = endTime;
							tempAssings.assignments[i]['clinicId'] =
								tempAssings.assignments[i]['facility_location_id'];
							});
							// tempAssings.assignments[i]['start_date'] = convertDateTimeForRetrieving(
							// 	this.storageData,
							// 	new Date(tempAssings.assignments[i]['start_date']),
							// );
							// tempAssings.assignments[i]['end_date'] = convertDateTimeForRetrieving(
							// 	this.storageData,
							// 	new Date(tempAssings.assignments[i]['end_date']),
							// );
							// let startTime = new Date(tempAssings.assignments[i]['start_date'])
							// 	.toString()
							// 	.substring(16, 21);
							// let endTime = new Date(tempAssings.assignments[i]['end_date'])
							// 	.toString()
							// 	.substring(16, 21);
							// startTime = this.convert12(startTime);
							// endTime = this.convert12(endTime);

							// tempAssings.assignments[i]['startTime'] = startTime;
							// tempAssings.assignments[i]['endTime'] = endTime;
							// tempAssings.assignments[i]['clinicId'] =
							// 	tempAssings.assignments[i]['facility_location_id'];
							assign.push(tempAssings.assignments[i]);
						}
					}
					if (tempAssings.unavailabilities) {
						//unavailabilities
						for (let i = 0; i < tempAssings.unavailabilities.length; i++) {
							tempAssings.unavailabilities[i]['start_date'] = convertDateTimeForRetrieving(
								this.storageData,
								new Date(tempAssings.unavailabilities[i]['end_date']),
							);
							tempAssings.unavailabilities[i]['end_date'] = convertDateTimeForRetrieving(
								this.storageData,
								new Date(tempAssings.unavailabilities[i]['start_date']),
							);
							let start = new Date(tempAssings.unavailabilities[i]['start_date']);
							let end = new Date(tempAssings.unavailabilities[i]['end_date']);
							tempAssings.unavailabilities[i]['realStart'] = new Date(
								tempAssings.unavailabilities[i]['start_date'],
							);
							tempAssings.unavailabilities[i]['realEnd'] = new Date(
								tempAssings.unavailabilities[i]['end_date'],
							);
							let realStart = new Date(tempAssings.unavailabilities[i]['start_date']);
							let realEnd = new Date(tempAssings.unavailabilities[i]['end_date']);
							let startTime = new Date(start).toString().substring(16, 21);
							let endTime = new Date(end).toString().substring(16, 21);
							startTime = this.convert12(startTime);
							endTime = this.convert12(endTime);
							tempAssings.unavailabilities[i]['startTime'] = startTime;
							tempAssings.unavailabilities[i]['endTime'] = endTime;
							if (tempAssings.unavailabilities[i]['approved'] == 0) {
								tempAssings.unavailabilities[i]['color'] = 'lightblue';
							} else {
								tempAssings.unavailabilities[i]['color'] = '#d3d3d3';
							}
							tempAssings.unavailabilities[i]['isAppointment'] = false;
							let startDate = new Date(
								start.getFullYear() + '-' + (start.getMonth() + 1) + '-' + start.getDate(),
							);
							let endDate = new Date(
								end.getFullYear() + '-' + (end.getMonth() + 1) + '-' + end.getDate(),
							);
							if (startDate < endDate) {
								var timeDiff = Math.abs(endDate.getTime() - startDate.getTime());
								var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
								let firstEvent = JSON.parse(JSON.stringify(tempAssings.unavailabilities[i]));
								firstEvent.endDate = new Date(JSON.parse(JSON.stringify(firstEvent.startDate)));
								firstEvent.endDate.setHours(23);
								firstEvent.endDate.setMinutes(59);
								firstEvent.endDate.setSeconds(59);
								firstEvent.startDate = new Date(firstEvent.startDate);
								firstEvent['startTime'] = new Date(firstEvent.startDate)
									.toString()
									.substring(16, 21);
								firstEvent['endTime'] = new Date(firstEvent.endDate).toString().substring(16, 21);
								firstEvent['startTime'] = this.convert12(firstEvent['startTime']);
								firstEvent['endTime'] = this.convert12(firstEvent['endTime']);
								firstEvent['realStart'] = realStart;
								firstEvent['realEnd'] = realEnd;
								assign.push(firstEvent);
								for (let n = 0; n < diffDays - 1; n++) {
									let loopEvent = JSON.parse(
										JSON.stringify(response.result.data[0].unavailabilities[i]),
									);
									loopEvent.startDate = new Date(loopEvent.startDate);
									loopEvent.startDate.setDate(new Date(loopEvent.startDate).getDate() + (n + 1));
									loopEvent.startDate.setHours(0);
									loopEvent.startDate.setMinutes(0);
									loopEvent.startDate.setSeconds(0);
									loopEvent.endDate = new Date(JSON.parse(JSON.stringify(loopEvent.startDate)));
									loopEvent.endDate.setHours(23);
									loopEvent.endDate.setMinutes(59);
									loopEvent.endDate.setSeconds(59);
									loopEvent.startDate = new Date(loopEvent.startDate);
									loopEvent['startTime'] = new Date(loopEvent.startDate)
										.toString()
										.substring(16, 21);
									loopEvent['endTime'] = new Date(loopEvent.endDate).toString().substring(16, 21);
									loopEvent['startTime'] = this.convert12(loopEvent['startTime']);
									loopEvent['endTime'] = this.convert12(loopEvent['endTime']);
									loopEvent['realStart'] = realStart;
									loopEvent['realEnd'] = realEnd;
									assign.push(loopEvent);
								}
								let lastEvent = JSON.parse(
									JSON.stringify(response.result.data[0].unavailabilities[i]),
								);
								lastEvent.startDate = new Date(JSON.parse(JSON.stringify(lastEvent.endDate)));
								lastEvent.startDate.setHours(0);
								lastEvent.startDate.setMinutes(0);
								lastEvent.startDate.setSeconds(0);
								lastEvent.endDate = new Date(lastEvent.endDate);
								lastEvent['startTime'] = new Date(lastEvent.startDate).toString().substring(16, 21);
								lastEvent['endTime'] = new Date(lastEvent.endDate).toString().substring(16, 21);
								lastEvent['startTime'] = this.convert12(lastEvent['startTime']);
								lastEvent['endTime'] = this.convert12(lastEvent['endTime']);
								lastEvent['realStart'] = realStart;
								lastEvent['realEnd'] = realEnd;
								assign.push(lastEvent);
							} else {
								assign.push(tempAssings.unavailabilities[i]);
							}
						}
					}
					this.docAssigns = JSON.parse(JSON.stringify(assign));
					this.subject.refresh(this.docAssigns);
				}
			});
	}
	public getClinics(page?) {
			// if(this.calenderDoctor.length == 1 && this.calenderDoctor[0].id == 0) {
			// 	this.allFacilitySupervisorClinicIds = this.storageData.getFacilityLocations();
			// }
			//  else {
				let facility_location_ids = [];
				let doctor_ids=[];
				if(this.isSwapped)
				{
					if(this.calenderDoctor.length == 1 && this.calenderDoctor[0].id == 0) {
						this.allFacilitySupervisorClinicIds = this.storageData.getFacilityLocations();
					} 
					else
					{
						this.calenderDoctor.forEach(provider => {
							facility_location_ids.push(provider.facility_location_id);
						});
						this.allFacilitySupervisorClinicIds = facility_location_ids;
					}
					this.calenderDoctor.map(provider=>{
						if(provider.user_id)
						{
							doctor_ids.push(provider.user_id)
						}
					})
					
				}
				else
				{
					if(this.calenderClinics.length==1 && this.calenderClinics[0].id==0)
					{
						this.allFacilitySupervisorClinicIds = this.storageData.getFacilityLocations();
					}
					else{
						this.calenderClinics.forEach(provider => {
							facility_location_ids.push(provider.facility_location_id);
						});
						this.allFacilitySupervisorClinicIds = facility_location_ids;
					}

					this.calenderClinics.map(provider=>{
						if(provider.user_id)
						{
							doctor_ids.push(provider.user_id)
						}
					})
					
				}

				this.requestService
			.sendRequest(
				AssignSpecialityUrlsEnum.getUserInfobyFacility,
				'POST',
				REQUEST_SERVERS.schedulerApiUrl1,
				{ 	facility_location_ids: facility_location_ids.length>0?facility_location_ids:this.allFacilitySupervisorClinicIds,
				 	// per_page: Pagination.per_page,
					 per_page: Pagination.per_page_speciality_assignment,
					page:page,
					pagination:true,
					doctor_ids:doctor_ids,
				is_provider_calendar:true
				}
			).pipe(
				takeUntil(this.destroyClinic$)
			)
			.subscribe((response: HttpSuccessResponse) => {
				// this.clinics = [];
				// let stringArray = JSON.stringify(response.result.data.docs);
				// let data = JSON.parse(stringArray);
				let data=response.result.data.docs
				let localClinics;
				if (this.isSwapped) {
					localClinics = this.calenderClinics;
				} else {
					localClinics = this.calenderDoctor;
				}
				for (let i = 0; i < data.length; i++) {
					// response.result.data.docs[i]['day_list'] = JSON.parse(
					// 	response.result.data.docs[i]['day_list'],
					// );
					// this.clinics.push(response.result.data.docs[i]);
					// this.clinics[i]['color'] = '#' + response.result.data.docs[i]['color'];
					// data[i]['color'] = response.result.data.docs[i]['color'];
					data[i]['isChecked'] = false;
					for (let j = 0; j < localClinics.length; j++) {
						if (localClinics[j]['isChecked'] != undefined) {
							if (localClinics[j]['id'] == data[i]['id']) {
								data[i]['isChecked'] = true;
								localClinics[j] = data[i];
								localClinics[j]['isLocalAvailable'] = true;
							}
						}
					}
				}
				for (let x = 0; x < localClinics.length; x++) {
					// if (localClinics[x]['isLocalAvailable'] == undefined) {
					// 	localClinics.splice(x, 1);
					// 	x--;
					// }
				}
				if (localClinics.length == 0) {
					localClinics.push({
						name: '',
						id: 0,
					});
				}
				if (this.isSwapped) {
					this.calenderClinics = localClinics;
				} else {
					this.calenderDoctor = localClinics;
				}
				if(data && data.length>0)
				{
					this.clinics=[...this.clinics,...data];
					if(response.result.data.pages>this.currentpagePracticeLocation)
					{
						this.currentpagePracticeLocation=this.currentpagePracticeLocation+1
						this.getClinics(this.currentpagePracticeLocation)
					}

				}
				this.subject.refreshClinics(this.clinics);
			});
				
				
			// }
					
	}
	public getDoctors(page?) {
			// if(this.calenderClinics.length == 1 && this.calenderClinics[0].id == 0) {
			// 	// alert('fafa');
			// 	this.allFacilitySupervisorClinicIds = this.storageData.getFacilityLocations();
			// } 
			// else {
				// alert('afaf');
				let location_ids = [];
				if(this.isSwapped)
				{
					if(this.calenderClinics.length == 1 && this.calenderClinics[0].id == 0) {
						// alert('fafa');
						this.allFacilitySupervisorClinicIds = this.storageData.getFacilityLocations();
					}
					else
					{
						this.calenderClinics.forEach(item => {
							location_ids.push(item.id);
						})
						this.allFacilitySupervisorClinicIds=location_ids
					}
					
				}
				else
				{
					if(this.calenderDoctor.length==1 && this.calenderDoctor[0].id==0)
					{
						this.allFacilitySupervisorClinicIds=this.storageData.getFacilityLocations();
					}
					else
					{
						this.calenderDoctor.forEach(item => {
							location_ids.push(item.id);
						})
						this.allFacilitySupervisorClinicIds = location_ids;
					}
					
				}
				
			// }
		this.requestService
			.sendRequest(
				AddToBeSchedulledUrlsEnum.Get_providers,
				'POST',
				REQUEST_SERVERS.schedulerApiUrl1,
				{
					facility_location_ids: this.allFacilitySupervisorClinicIds,
					doctor_ids:(!this.storageData.isSuperAdmin() && this.storageData.isDoctor())?[this.storageData.getUserId()]:[], 

					// per_page: Pagination.per_page_Provider,
					per_page: Pagination.per_page_speciality_assignment,
					page:page,
					pagination:true,
					is_provider_calendar:true
				},
			).pipe(
				takeUntil(this.destroyProvider$)
			)
			.subscribe((response: HttpSuccessResponse) => {
				// for (let i = 0; i < response.result.data.docs.length; i++) {
				// 	response.result.data.docs[i].doctor.specialities['user_timings'] =
				// 		response.result.data.docs[i].doctor.user_timings;
				// }

				const facility = this.storageData.getFacilityLocations();
				// for (let i = 0; i < response.result.data.docs.length; i++) {
				// 	for (
				// 		let x = 0;
				// 		Array.isArray(response.result.data.docs[i].doctor.specialities) &&
				// 		x < response.result.data.docs[i].doctor.specialities.length;
				// 		x++
				// 	) {
				// 		for (let j = 0; j < facility.length; j++) {
				// 			if (facility[j] === response.result.data.docs[i].doctor.specialities[x].facilityId) {
				// 				response.result.data.docs[i].doctor['facilityTimings'] = JSON.parse(
				// 					JSON.stringify(response.result.data.docs[i].doctor.specialities),
				// 				);
				// 				response.result.data.docs[i].doctor.specialities =
				// 					response.result.data.docs[i].doctor.specialities[x];
				// 				break;
				// 			}
				// 		}
				// 	}
				// }

			

				// this.doctors = response.result.data.docs;
				let loadDoctors;
				debugger;
				if (this.isSwapped) {
					loadDoctors = this.calenderDoctor;
				} else {
					loadDoctors = this.calenderClinics;
				}

				for (var i = 0; i < response.result.data.docs.length; i++) {
					response.result.data.docs[i]['id'] = response.result.data.docs[i]['user_id'];
					response.result.data.docs[i]['docId'] = response.result.data.docs[i]['user_id'];
					response.result.data.docs[i]['name'] = response.result.data.docs[i].doctor.info.middle_name
						? response.result.data.docs[i].doctor.info.first_name +
						  ' ' +
						  response.result.data.docs[i].doctor.info.middle_name +
						  ' ' +
						  response.result.data.docs[i].doctor.info.last_name
						: response.result.data.docs[i].doctor.info.first_name + ' ' + response.result.data.docs[i].doctor.info.last_name;
					response.result.data.docs[i]['first_name'] = response.result.data.docs[i].doctor.info.first_name;
					response.result.data.docs[i]['middle_name'] = response.result.data.docs[i].doctor.info.middle_name;

					response.result.data.docs[i]['last_name'] = response.result.data.docs[i].doctor.info.last_name;
					response.result.data.docs[i]['URI'] = response.result.data.docs[i].doctor.info.profile_pic_url;
					// response.result.data.docs[i]['color'] = '#' + response.result.data.docs[i].color;
					// response.result.data.docs[i]['color'] =  response.result.data.docs[i].color;
					// response.result.data.docs[i].color = '#' + response.result.data.docs[i].color;
					response.result.data.docs[i]['speciality'] = response.result.data.docs[i].doctor.specialities.name;
					response.result.data.docs[i]['isChecked'] = false;
					for (let j = 0; j < loadDoctors.length; j++) {
						if (loadDoctors[j]['isChecked'] != undefined) {
							if (loadDoctors[j]['id'] == response.result.data.docs[i]['id'] && loadDoctors[j]['speciality_id']== response.result.data.docs[i]['speciality_id']&& loadDoctors[j].facility_location_id == response.result.data.docs[i].facility_location_id) {
								response.result.data.docs[i]['isChecked'] = true;
								loadDoctors[j] = response.result.data.docs[i];
								loadDoctors[j]['isLocalAvailable'] = true;
							}
						}
					}
				}
				for (let x = 0; x < loadDoctors.length; x++) {
					
					// if (loadDoctors[x]['isLocalAvailable'] == undefined && response.result.data.pages==this.currentpageProvider ) {
					// 	alert('test');
					// 	debugger;
					// 	loadDoctors.splice(x, 1);
					// 	x--;
					// }
				}
				if (loadDoctors.length == 0) {
					loadDoctors.push({
						name: '',
						id: 0,
					});
				}
				if (this.isSwapped) {
					this.calenderDoctor = loadDoctors;
				} else {
					this.calenderClinics = loadDoctors;
				}
				if(response.result.data.docs.length>0)
				{
					this.doctors=[...this.doctors,...response.result.data.docs];
					if(response.result.data.pages>this.currentpageProvider)
					{
						this.currentpageProvider=this.currentpageProvider+1
						this.getDoctors(this.currentpageProvider)
					}
				}
				this.subject.refreshDoc(this.doctors);
			});
	}
	public viewChange(event) {
		const scheduler = this.storageData.getSchedulerInfo();
		scheduler.supervisor_assign_doctor_view = event;
		this.storageData.setSchedulerInfo(scheduler);
		this.getAssignments();
	}
	public checkAvailabilityDoc(doc) {
		this.doctors = doc;
	}


}
