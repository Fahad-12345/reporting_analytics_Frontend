import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

//date picker
//services
import { AssignRoomsService } from '../../assign-rooms.service';
import { FrontDeskService } from '../../../../front-desk.service';
import { WeekSubjectService } from '../../utils/my-calendar/src/modules/week/subject.service';
import { SubjectService } from '../../subject.service';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { AssignRoomsUrlsEnum } from '../../assign-rooms-urls-enum';
import { AssignSpecialityUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-speciality/assign-speciality-urls-enum';
import { AddToBeSchedulledUrlsEnum } from '@appDir/scheduler-front-desk/modules/add-to-be-scheduled/add-to-be-scheduled-list-urls-enum';
import { convertDateTimeForSending } from '@appDir/shared/utils/utils.helpers';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
	public weekEvents: any = [];
	public monthEvents: any = [];
	public events: any = [];
	refresh: Subject<any> = new Subject();
	refreshDay: Subject<any> = new Subject();
	@Output() updateSpecAssign = new EventEmitter();
	public currentDoctors = [];
	public currentRooms = [];

	public isShowMore: any;
	public isShowLess: any;
	public Rooms: any;
	public offsetMore: any;
	public track1: any;
	public isLoader: boolean = false;
	public patients: any = [];
	public patientData: any = [];
	public clinics: any = [];
	public doctors: any = [];
	public speciality: any = [];

	public specAssign: any = [];
	public clinicId: string;
	public specId: any;
	public isHidePatientRecord: boolean = false;
	public state: boolean = false;
	public appointmentDuration: any = 20;
	public currentLimitToShow = 2;

	@Input() patientName: any;
	@Input() patientId: any = 0;

	//specility/clinic for calendar
	public calenderRooms: any = [{
		"name": "",
		"id": 0
	}];
	public calendarDoctors: any = [{
		"name": "",
		"id": 0
	}];
	//loader
	public loading = false;
	//date picker
	public myDatePickerOptions = {
		dateFormat: 'dd.mm.yyyy',
		inline: true,
		height: '100%',
		selectorWidth: '100%',
		firstDayOfWeek: 'su'
	};
	public model: any;
	public eventsDoc: any = [];
	public myForm: FormGroup;
	public myDate: FormControl;

	//calendar config
	public view: string = 'month';
	// public isSwapped: boolean = true;
	public swap: any = 'true';
	public viewDate: Date = new Date();
	public datePick: Date;
	public weekStartOn: any;
	public loadmoretemparray: any = [];

	public localStorageId: any;
	public selectedClinicId: any;
	public eventsRoom: any = [];
	public currentDocsIndex: any = [];
	public currentRoomsIndex: any = [];
	public allClinicIds: any = [];
	clinicDays: any = [];
	constructor(public router: Router,
		private formBuilder: FormBuilder,
		protected requestService: RequestService,
		public weekSubject: WeekSubjectService,
		private storageData: StorageData,
		public cdr: ChangeDetectorRef,
		public _viewService: AssignRoomsService,
		public _fdService: FrontDeskService, private toastrService: ToastrService,
		public subject: SubjectService,
	) {
		this.localStorageId = JSON.stringify(this.storageData.getUserId())
	}
	ngOnInit(): void {
		this.myForm = this.formBuilder.group({
			myDate: [null, Validators.required]
		});
		this.weekSubject.castScroll.subscribe(
			resp => {
				this.triggerScrollToWeek()
			}
		)
		this.subject.castAssign.subscribe(res => {
			if (res.length != 0) {
				this.getAssignments(this.calendarDoctors, this.viewDate)
			}
		})
		const scheduler = this.storageData.getSchedulerInfo()
		if (scheduler.front_desk_assign_rooms_swaps == undefined || scheduler.front_desk_assign_rooms_swaps == "") {
			scheduler.front_desk_assign_rooms_swaps = 'true';
		}
		this.swap = scheduler.front_desk_assign_rooms_swaps
		if (scheduler.front_desk_assign_rooms_doctors == undefined || scheduler.front_desk_assign_rooms_doctors == "") {
			scheduler.front_desk_assign_rooms_doctors = '[{"name": "", "id": 0}]';
		}
		if (scheduler.front_desk_assign_rooms_rooms == undefined || scheduler.front_desk_assign_rooms_rooms == "") {
			scheduler.front_desk_assign_rooms_rooms = '[{"name": "", "id": 0}]';
		}
		if (scheduler.front_desk_assign_rooms_view == undefined) {
			scheduler.front_desk_assign_rooms_view = "month"
		}
		this.calenderRooms = JSON.parse(scheduler.front_desk_assign_rooms_rooms)
		this.currentRooms = JSON.parse(JSON.stringify(this.calenderRooms))
		this.currentRooms.splice(this.currentLimitToShow, this.calenderRooms.length)
		for (let i = 0; i < this.currentLimitToShow; i++) {
			this.currentRoomsIndex.push(i)
		}
		this.calendarDoctors = JSON.parse(scheduler.front_desk_assign_rooms_doctors)
		this.view = scheduler.front_desk_assign_rooms_view;
		this.storageData.setSchedulerInfo(scheduler)
		this.myForm = this.formBuilder.group({
			myDate: [null, Validators.required]
		});
		let newDate = new Date(this.viewDate)
		this.model = { date: { year: newDate.getFullYear(), month: newDate.getMonth() + 1, day: newDate.getDate() } }
		this.getAssignments(this.calendarDoctors, this.viewDate)
		this.getClinics()
	}
	public triggerScrollToWeek() {
		let off = (8 * (30))
		if (this.view !== 'month') {
			document.getElementById("test-scroll").scrollTop = off;
		}
	}
	public viewChange(event) {
		const scheduler = this.storageData.getSchedulerInfo()
		scheduler.front_desk_assign_rooms_view = this.view
		this.storageData.setSchedulerInfo(scheduler)
		this.getAssignments(this.calendarDoctors, this.viewDate)
		this.triggerScrollToWeek()
	}
	public getMainCalendarCurrentDate(event) {
		let newDate = new Date(event)
		this.model = { date: { year: newDate.getFullYear(), month: newDate.getMonth() + 1, day: newDate.getDate() } }
		this.myForm.patchValue({
			myDate: {
				date: {
					year: newDate.getFullYear(),
					month: newDate.getMonth() + 1,
					day: newDate.getDate()
				}
			}
		});
		this.getAssignments(this.calendarDoctors, this.viewDate)

	}
	public selectDoctor(doctor) {
		let check = false;
		for (let i = 0; i < this.calendarDoctors.length; i++) {
			if (doctor["id"] == this.calendarDoctors[i]["id"]) {
				check = true;
				break;
			}
		}
		if (!check) {
			if (this.calendarDoctors.length != 0 && this.calendarDoctors[0].id == 0) {
				this.calendarDoctors = [];
			}
			doctor["isChecked"] = true

			this.calendarDoctors.push(doctor)
		}
		else {
			for (let i = 0; i < this.calendarDoctors.length; i++) {
				if (this.calendarDoctors[i].id == doctor.id) {
					this.calendarDoctors.splice(i, 1)
					for (let j = 0; j < this.doctors.length; j++) {
						if (this.doctors[j].id == doctor.id) {
							doctor["isChecked"] = false
							this.doctors[j].isChecked = false
						}
					}
					break
				}
			}
		}
		if (this.calendarDoctors.length == 0) {
			this.calendarDoctors.push({ name: '', id: 0 });
		}
		for (let i = 0; i < this.doctors.length; i++) {
			if (this.doctors[i].id == doctor.id) {
				this.doctors[i].isChecked = doctor["isChecked"]
			}
		}
		const scheduler = this.storageData.getSchedulerInfo()
		scheduler.front_desk_assign_rooms_doctors = JSON.stringify(this.calendarDoctors)
		this.storageData.setSchedulerInfo(scheduler)
		//setItem('front-desk-assign-rooms-doctors' + this.localStorageId, JSON.stringify(this.calendarDoctors))
		if (this.calendarDoctors.length <= this.currentLimitToShow) {
			this.currentDoctors = JSON.parse(JSON.stringify(this.calendarDoctors))
			this.currentDocsIndex = []
			for (let r = 0; r < this.currentLimitToShow; r++) {
				this.currentDocsIndex.push(r)
			}
		}
		else {
			for (let r = 0; r < this.currentDoctors.length; r++) {
				if (this.currentDoctors[r].id === doctor.id) {
					if (this.calendarDoctors.length < this.currentLimitToShow + 1) {
						this.currentDoctors = JSON.parse(JSON.stringify(this.calendarDoctors))
						this.currentDocsIndex = []
						for (let r = 0; r < this.currentLimitToShow; r++) {
							this.currentDocsIndex.push(r)
						}
					} else {
						this.currentDoctors = []
						if (this.calendarDoctors[this.currentDocsIndex[this.currentLimitToShow - 1]]) {
							for (let r = 0; r < this.currentLimitToShow; r++) {
								this.currentDoctors.push(this.calendarDoctors[this.currentDocsIndex[r]])
							}
						} else {
							for (let r = 0; r < this.currentLimitToShow; r++) {
								this.currentDoctors.push(this.calendarDoctors[this.currentDocsIndex[r] - 1])
							}
							for (let r = 0; r < this.currentLimitToShow; r++) {
								this.currentDocsIndex[r] = this.currentDocsIndex[r] - 1
							}

						}
					}
					break;
				}
			}
		}

		this.getAssignments(this.calendarDoctors, this.viewDate)
	}
	public selectRoom(room) {
		let check = false;
		for (let i = 0; i < this.calenderRooms.length; i++) {
			if (room["id"] == this.calenderRooms[i]["id"]) {
				check = true;
				break;
			}
		}
		if (check == false) {
			if (this.calenderRooms.length != 0 && this.calenderRooms[0].id == 0) {
				this.calenderRooms = [];
			}
			room["isChecked"] = true;
			this.calenderRooms.push(room)
			for (let j = 0; j < this.Rooms.length; j++) {
				if (this.Rooms[j] != undefined) {
					if (this.Rooms[j].id == room.id) {
						this.Rooms[j].isChecked = true
					}
				}
			}
		}
		else {
			for (let i = 0; i < this.calenderRooms.length; i++) {
				if (this.calenderRooms[i].id == room.id) {
					this.calenderRooms.splice(i, 1)
					for (let j = 0; j < this.Rooms.length; j++) {
						if (this.Rooms[j] != undefined) {
							if (this.Rooms[j].id == room.id) {
								this.Rooms[j].isChecked = false
							}
						}
					}
				}
			}
		}
		if (this.calenderRooms.length == 0) {
			this.calenderRooms.push({ name: '', id: 0 });
		}
		const scheduler = this.storageData.getSchedulerInfo()
		scheduler.front_desk_assign_rooms_rooms = JSON.stringify(this.calenderRooms)
		this.storageData.setSchedulerInfo(scheduler)
		//setItem('front-desk-assign-rooms-rooms' + this.localStorageId, JSON.stringify(this.calenderRooms))
		if (this.calenderRooms.length <= this.currentLimitToShow) {
			this.currentRooms = JSON.parse(JSON.stringify(this.calenderRooms))
			this.currentRoomsIndex = []
			for (let r = 0; r < this.currentLimitToShow; r++) {
				this.currentRoomsIndex.push(r)
			}
		}
		else {
			for (let r = 0; r < this.currentRooms.length; r++) {
				if (this.currentRooms[r].id === room.id) {
					if (this.calenderRooms.length < this.currentLimitToShow + 1) {
						this.currentRooms = JSON.parse(JSON.stringify(this.calenderRooms))
						this.currentRoomsIndex = []
						for (let r = 0; r < this.currentLimitToShow; r++) {
							this.currentRoomsIndex.push(r)
						}
					} else {
						this.currentRooms = []
						if (this.calenderRooms[this.currentRoomsIndex[this.currentLimitToShow - 1]]) {
							for (let r = 0; r < this.currentLimitToShow; r++) {
								this.currentRooms.push(this.calenderRooms[this.currentRoomsIndex[r]])
							}
						} else {
							for (let r = 0; r < this.currentLimitToShow; r++) {
								this.currentRooms.push(this.calenderRooms[this.currentRoomsIndex[r] - 1])
							}
							for (let r = 0; r < this.currentLimitToShow; r++) {
								this.currentRoomsIndex[r] = this.currentRoomsIndex[r] - 1
							}
						}
					}
					break;
				}
			}
		}
		this._viewService.refreshRoom(this.Rooms);
		this.getAssignments(this.calendarDoctors, this.viewDate)
	}
	public removeTopEntry(id) {
		if (this.swap === 'true') {
			for (let i = 0; i < this.doctors.length; i++) {
				if (this.doctors[i].id == id) {
					this.doctors[i].isChecked = false;
					break;
				}
			}


			for (let i = 0; i < this.calendarDoctors.length; i++) {
				if (this.calendarDoctors[i].id == id) {
					this.calendarDoctors.splice(i, 1)
					break;
				}
			}
			if (this.calendarDoctors.length == 0) {
				this.calendarDoctors.push({ name: '', id: 0 })
			}

		}
		else {
			for (let i = 0; i < this.calenderRooms.length; i++) {
				if (this.calenderRooms[i].id == id) {
					this.calenderRooms.splice(i, 1)
					break;
				}
			}
			for (let i = 0; i < this.Rooms.length; i++) {
				if (this.Rooms[i].id == id) {
					this.Rooms[i]['isChecked'] = false;
					break;
				}
			}
			if (this.calenderRooms.length == 0) {
				this.calenderRooms.push({ name: '', id: 0 })
			}


		}

		if (this.calendarDoctors.length < this.currentLimitToShow + 1) {
			this.currentDoctors = JSON.parse(JSON.stringify(this.calendarDoctors))
			this.currentDocsIndex = []
			for (let r = 0; r < this.currentLimitToShow; r++) {
				this.currentDocsIndex.push(r)
			}
		}
		else {
			this.currentDoctors = []
			if (this.calendarDoctors[this.currentDocsIndex[this.currentLimitToShow - 1]]) {
				for (let r = 0; r < this.currentLimitToShow; r++) {
					this.currentDoctors.push(this.calendarDoctors[this.currentDocsIndex[r]])
				}
			} else {
				for (let r = 0; r < this.currentLimitToShow; r++) {
					this.currentDoctors.push(this.calendarDoctors[this.currentDocsIndex[r] - 1])
				}
				for (let r = 0; r < this.currentLimitToShow; r++) {
					this.currentDocsIndex[r] = this.currentDocsIndex[r] - 1
				}

			}
		}
		if (this.calenderRooms.length < this.currentLimitToShow + 1) {
			this.currentRooms = JSON.parse(JSON.stringify(this.calenderRooms))
			this.currentRoomsIndex = []
			for (let r = 0; r < this.currentLimitToShow; r++) {
				this.currentRoomsIndex.push(r)
			}
		}
		else {
			this.currentRooms = []
			if (this.calenderRooms[this.currentRoomsIndex[this.currentLimitToShow - 1]]) {
				for (let r = 0; r < this.currentLimitToShow; r++) {
					this.currentRooms.push(this.calenderRooms[this.currentRoomsIndex[r]])
				}
			} else {
				for (let r = 0; r < this.currentLimitToShow; r++) {
					this.currentRooms.push(this.calenderRooms[this.currentRoomsIndex[r] - 1])
				}
				for (let r = 0; r < this.currentLimitToShow; r++) {
					this.currentRoomsIndex[r] = this.currentRoomsIndex[r] - 1
				}
			}
		}

		this._viewService.refreshDoctors(this.doctors)
		this.subject.refreshCheckedRoom(id)
		this.getAssignments(this.calendarDoctors, this.viewDate)
		const scheduler = this.storageData.getSchedulerInfo()
		scheduler.front_desk_assign_rooms_doctors = JSON.stringify(this.calendarDoctors)
		scheduler.front_desk_assign_rooms_rooms = JSON.stringify(this.calenderRooms)
		this.storageData.setSchedulerInfo(scheduler)
	}
	public onDateChanged(event: any) {
		let currentDate = event.date.year + '-' + event.date.month + '-' + event.date.day;
		let tempDate = new Date(currentDate)
		this.viewDate = tempDate
		this.viewDate = this.viewDate
		this.datePick = event.jsdate;
		this.getAssignments(this.calendarDoctors, event.jsdate);
	}

	
	setDate(value) {

		this.viewDate = new Date(value.toDate());
		this.datePick = this.viewDate;
		this.datePick = this.viewDate;
		this.getAssignments(this.calendarDoctors, this.viewDate);
	  }


	public getChangeDateNext(e) {
		let currentDate = e.date.year + '-' + e.date.month + '-' + e.date.day;
		let tempDate = new Date(currentDate)
		this.viewDate = tempDate
		this.datePick = e.jsdate;
		if (this.state) {
			let newDate = new Date(e)
			this.model = { date: { year: newDate.getFullYear(), month: newDate.getMonth() + 2, day: 1 } }
		}
		else {
			let newDate = new Date(e)
			this.model = { date: { year: newDate.getFullYear(), month: newDate.getMonth() + 1, day: 1 } }
		}
	}
	public getAssignments(doctors, date) {
		let doctorId = []
		let startDate: any;
		let endDate: any;
		for (let i = 0; i < doctors.length; i++) {
			doctorId.push(doctors[i].id)
		}
		if (this.swap === 'false' && doctors[0].id === 0) {
			for (let i = 0; i < this.doctors.length; i++) {
				doctorId.push(this.doctors[i].id)
			}
		}
		if (this.view === 'month') {
			let tempDate = this.viewDate.getFullYear() + '-' + ('0' + (this.viewDate.getMonth() + 1)).slice(-2);
			startDate = tempDate + "-01";
			let tempEndDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 0)
			endDate = tempEndDate.getFullYear() + '-' + ('0' + (tempEndDate.getMonth() + 1)).slice(-2) + '-' + ('0' + (tempEndDate.getDate())).slice(-2)
		} else if (this.view == 'week') {
			this.state = false

			startDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), this.viewDate.getDate() - this.viewDate.getDay() + 1)
			if (this.viewDate.getDay() === 0) {
				startDate.setDate(startDate.getDate() - 6);
			}
			endDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), startDate.getDate() + 7)
		} else {
			startDate = this.viewDate;
			endDate = new Date(this.viewDate)
			endDate.setDate(endDate.getDate() + 1);
		}
		let tempSt = new Date(startDate)
		let tempEd = new Date(endDate)
		tempSt.setMinutes(0)
		tempSt.setSeconds(0)
		tempSt.setHours(0)
		tempEd.setMinutes(59)
		tempEd.setSeconds(59)
		tempEd.setHours(23)
		this.requestService
			.sendRequest(
				AssignRoomsUrlsEnum.getAvailableRoomsForDoctor,
				'POST',
				REQUEST_SERVERS.schedulerApiUrl,
				{
					"docId": doctorId,
					"startDate": convertDateTimeForSending(this.storageData, tempSt),
					"endDate": convertDateTimeForSending(this.storageData, tempEd)
				}
			).subscribe(
				(res: HttpSuccessResponse) => {
					this.eventsDoc = [];
					this.eventsRoom = [];
					for (let i = 0; i < res.result.data.length; i++) {
						if (res.result.data[i].room.facility_location_id != this.selectedClinicId) {
							res.result.data.splice(i, 1)
							i = i - 1;
						}
					}
					for (let i = 0; i < res.result.data.length; i++) {
						res.result.data[i].startDate = convertDateTimeForSending(this.storageData, new Date(res.result.data[i].startDate))
						res.result.data[i].endDate = convertDateTimeForSending(this.storageData, new Date(res.result.data[i].endDate))
						res.result.data[i]["start"] = new Date(res.result.data[i].startDate)
						res.result.data[i]["end"] = new Date(res.result.data[i].endDate)
						let startTime = ('0' + res.result.data[i]["start"].getHours()).slice(-2) + ":" + ('0' + res.result.data[i]["start"].getMinutes()).slice(-2)
						let endTime = ('0' + res.result.data[i]["end"].getHours()).slice(-2) + ":" + ('0' + res.result.data[i]["end"].getMinutes()).slice(-2)
						startTime = this.convert12(startTime)
						endTime = this.convert12(endTime)
						res.result.data[i]["startTime"] = startTime
						res.result.data[i]["endTime"] = endTime
						let bool = false;
						for (let x = 0; x < this.calenderRooms.length; x++) {
							if (this.calenderRooms[x].id === res.result.data[i].roomId) {
								bool = true;
							}
						}
						if (bool === false && this.calenderRooms[0].id != 0) {
							res.result.data.splice(i, 1)
							i = i - 1;
						}

					}
					if (this.swap === 'true') {
						for (let j = 0; j < this.calendarDoctors.length; j++) {
							let docEvents = []
							for (let i = 0; i < res.result.data.length; i++) {
								if (this.calendarDoctors[j].id === res.result.data[i].docId) {
									res.result.data[i]["color"] = this.calendarDoctors[j].color
									res.result.data[i]["title"] = JSON.parse(JSON.stringify(res.result.data[i].room.name))
									docEvents.push(res.result.data[i])
								}
							}
							this.eventsDoc.push(docEvents)
						}
					} else {
						for (let j = 0; j < this.calenderRooms.length; j++) {
							let roomEvents = []
							for (let i = 0; i < res.result.data.length; i++) {
								if (this.calenderRooms[j].id === res.result.data[i].roomId) {
									let bool = false;
									for (let x = 0; x < this.calendarDoctors.length; x++) {
										if (this.calendarDoctors[x].id === res.result.data[i].docId) {
											bool = true;
											res.result.data[i]["title"] = JSON.parse(JSON.stringify(this.calendarDoctors[x].name))
										}
									}
									if (bool === false && this.calendarDoctors[0].id != 0) {
										res.result.data.splice(i, 1)
										i = i - 1;
									} else {
										if (this.calendarDoctors[0].id === 0) {
											for (let x = 0; x < this.doctors.length; x++) {
												if (res.result.data[i].docId === this.doctors[x].id) {
													res.result.data[i]["title"] = JSON.parse(JSON.stringify(this.doctors[x].name))
												}
											}
										}
										roomEvents.push(res.result.data[i])
									}
								}
							}
							this.eventsRoom.push(roomEvents);
						}
					}

					if (this.swap === 'true') {
						this.subject.refreshDoc(this.eventsDoc)
					} else {
						this.subject.refreshRoom(this.eventsRoom)
					}
					this.cdr.detectChanges()

				})
	}

	public convert12(str) {
		let result: string = ""
		let h1: any = str[0];
		let h2: any = str[1];
		let hh = parseInt(h1) * 10 + parseInt(h2);
		let Meridien: string;
		if (hh < 12) {
			Meridien = "AM";
		} else {
			Meridien = "PM";
		}
		hh %= 12;
		// Handle 00 and 12 case separately
		if (hh == 0) {
			result = "12";
			// Printing minutes and seconds
			for (let i = 2; i < str.length; ++i) {
				result = result + str[i];
			}
		}
		else {
			result = JSON.stringify(hh);
			// Printing minutes and seconds
			for (let i = 2; i < str.length; ++i) {
				result = result + str[i];
			}
		}
		result = result + " " + Meridien;
		return result;
	}
	public getClinics() {
		this.allClinicIds = this.storageData.getFacilityLocations()
		this.requestService
			.sendRequest(
				AssignSpecialityUrlsEnum.Facility_list_Post,
				'POST',
				REQUEST_SERVERS.schedulerApiUrl,
				{
					"clinics": this.allClinicIds
				}
			).subscribe(
				(responseClinic: HttpSuccessResponse) => {
					this.clinics = responseClinic.result.data
					for (let i = 0; i < this.clinics.length; i++) {
						this.clinics[i]['daysList'] = JSON.parse(this.clinics[i]['daysList'])
						this.clinics[i].color = '#' + this.clinics[i].color
						this.clinics[i]["isChecked"] = false;
					}
					this.selectedClinicId = this.clinics[0].id
					this.clinicDays = this.clinics[0]['daysList']
					this._viewService.refreshClinics(this.clinics)

					this.requestService
						.sendRequest(
							AddToBeSchedulledUrlsEnum.getDoctorsForUsers,
							'POST',
							REQUEST_SERVERS.schedulerApiUrl,
							{
								"clinics": this.allClinicIds
							}
						).subscribe(
							(responseDoctor: HttpSuccessResponse) => {
								for (let i = 0; i < responseDoctor.result.data.length; i++) {
									for (let x = 0; Array.isArray(responseDoctor.result.data[i].doctor.specialities) && x < responseDoctor.result.data[i].doctor.specialities.length; x++) {
										if (this.selectedClinicId === responseDoctor.result.data[i].doctor.specialities[x].facilityId) {
											responseDoctor.result.data[i].doctor.specialities = responseDoctor.result.data[i].doctor.specialities[x];
											break;
										}
									}
								}
								this.doctors = responseDoctor.result.data;
								const scheduler = this.storageData.getSchedulerInfo()
								let localDoctors = JSON.parse(scheduler.front_desk_assign_rooms_doctors)
								for (var i = 0; i < this.doctors.length; i++) {
									this.doctors[i]["id"] = this.doctors[i].docId
									this.doctors[i]["name"] = this.doctors[i].doctor.last_name
									this.doctors[i]["color"] = "#" + this.doctors[i]["doctor"]["specialities"]["color"];
									this.doctors[i]["doctor"]["specialities"]["color"] = "#" + this.doctors[i]["doctor"]["specialities"]["color"];
									this.doctors[i]["isChecked"] = false;
									for (let j = 0; j < localDoctors.length; j++) {
										if (this.doctors[i].id == localDoctors[j]["id"]) {
											this.doctors[i]["isChecked"] = true;
										}
									}
									for (let x = 0; x < this.calendarDoctors.length; x++) {
										if (this.doctors[i]["id"] === this.calendarDoctors[x].id) {
											this.calendarDoctors[x].color = this.doctors[i]["color"];
										}
									}
									this.cdr.markForCheck()
								}
								this.currentDoctors = JSON.parse(JSON.stringify(this.calendarDoctors))
								this.currentDoctors.splice(this.currentLimitToShow, this.calendarDoctors.length)
								for (let r = 0; r < this.currentLimitToShow; r++) {
									this.currentDocsIndex.push(r)
								}
								this.cdr.detectChanges()
								this.getAssignments(this.calendarDoctors, this.viewDate)
								this._viewService.refreshDoctors(this.doctors)

							})
					this.requestService
						.sendRequest(
							AssignRoomsUrlsEnum.getAllRoomsOfClinic,
							'POST',
							REQUEST_SERVERS.schedulerApiUrl,
							{
								"clinicId": this.selectedClinicId
							}
						).subscribe(
							(res: HttpSuccessResponse) => {
								this.Rooms = JSON.parse(JSON.stringify(res.result.data));
								this._viewService.roomForModal = JSON.parse(JSON.stringify(res.result.data));
								const scheduler = this.storageData.getSchedulerInfo()

								let localRooms = JSON.parse(scheduler.front_desk_assign_rooms_rooms)

								for (let i = 0; i < this.Rooms.length; i++) {
									this.Rooms[i].isChecked = false;
									for (let j = 0; j < localRooms.length; j++) {
										if (this.Rooms[i].id == localRooms[j]["id"]) {
											this.Rooms[i]["isChecked"] = true;
										}
									}
								}
								this._viewService.refreshRoom(this.Rooms)
							})
				})
	}
	public clearCalendar() {
		// alert("clear")
		this.calendarDoctors = [{
			"name": "",
			"id": 0
		}];
		this.calenderRooms = [{
			"name": "",
			"id": 0
		}];
	}
	public callAssign(event) {
		this.selectedClinicId = parseInt(event)
		this.getAssignments(this.calendarDoctors, this.viewDate)

	}
	public changeClinicId(event) {
		for (let i = 0; i < this.clinics.length; i++) {
			if (event === this.clinics[i].id) {
				this.clinicDays = this.clinics[i]['daysList']
			}
		}
		this.selectedClinicId = event
		this.calenderRooms = [{
			"name": "",
			"id": 0
		}];
		this.currentRooms = [{
			"name": "",
			"id": 0
		}];
		this.calendarDoctors = [{
			"name": "",
			"id": 0
		}];
		this.currentDoctors = [{
			"name": "",
			"id": 0
		}];
		const scheduler = this.storageData.getSchedulerInfo();
		scheduler.front_desk_assign_rooms_rooms = JSON.stringify(this.calenderRooms)
		scheduler.front_desk_assign_rooms_doctors = JSON.stringify(this.calendarDoctors)
		this.storageData.setSchedulerInfo(scheduler)
		for (let i = 0; i < this.doctors.length; i++) {
			this.doctors[i].isChecked = false;
		}
		this.requestService
			.sendRequest(
				AddToBeSchedulledUrlsEnum.getDoctorsForUsers,
				'POST',
				REQUEST_SERVERS.schedulerApiUrl,
				{
					"clinics": [this.selectedClinicId]
				}
			).subscribe(
				(response: HttpSuccessResponse) => {
					for (let i = 0; i < response.result.data.length; i++) {
						for (let x = 0; Array.isArray(response.result.data[i].doctor.specialities) && x < response.result.data[i].doctor.specialities.length; x++) {
							if (this.selectedClinicId === response.result.data[i].doctor.specialities[x].facilityId) {
								response.result.data[i].doctor.specialities = response.result.data[i].doctor.specialities[x];
								break;
							}
						}
					}
					this.doctors = response.result.data
					for (var i = 0; i < this.doctors.length; i++) {
						this.doctors[i]["color"] = "#" + this.doctors[i]["doctor"]["specialities"]["color"];
						this.doctors[i]["name"] = this.doctors[i]["doctor"]['last_name']
						this.doctors[i]["isChecked"] = false;
						this.doctors[i]["id"] = this.doctors[i].docId
						for (let x = 0; x < this.calendarDoctors.length; x++) {
							if (this.doctors[i]["id"] === this.calendarDoctors[x].id) {
								this.calendarDoctors[x].color = this.doctors[i]["color"];
							}
						}
						this.cdr.detectChanges()
					}
					this.currentDoctors = JSON.parse(JSON.stringify(this.calendarDoctors))
					this.currentDoctors.splice(this.currentLimitToShow, this.calendarDoctors.length)
					for (let r = 0; r < this.currentLimitToShow; r++) {
						this.currentDocsIndex.push(r)
					}
					this.cdr.detectChanges()
					this._viewService.refreshDoctors(this.doctors)
				})

		let temp = JSON.parse(JSON.stringify(this.doctors))
		this.cdr.detectChanges()
		this._viewService.refreshDoctors(temp)
		this.getAssignments(this.calendarDoctors, this.viewDate)
	}
	public changeSwap(e) {
		// console.log(e.target.value)
		this.swap = e.target.value;
		const scheduler = this.storageData.getSchedulerInfo();
		scheduler.front_desk_assign_rooms_swaps = this.swap;
		this.storageData.setSchedulerInfo(scheduler)
		this.getAssignments(this.calendarDoctors, this.viewDate)

	}
	public chnageDoctorHeader(direction: string) {
		if (this.calendarDoctors.length > this.currentLimitToShow) {
			if (direction === 'left') {
				if (this.currentDocsIndex[0] > this.currentLimitToShow - 1) {
					this.currentDoctors = []
					for (let r = this.currentLimitToShow; r > 0; r--) {
						this.currentDoctors.push(this.calendarDoctors[this.currentDocsIndex[0] - r])
					}
					let temp = this.currentDocsIndex[0]
					this.currentDocsIndex = []
					for (let r = this.currentLimitToShow; r > 0; r--) {
						this.currentDocsIndex.push(temp - r)
					}
				} else {
					this.currentDoctors = []
					for (let r = 0; r < this.currentLimitToShow; r++) {
						this.currentDoctors.push(this.calendarDoctors[r])
						this.currentDocsIndex.push(r)
					}
					this.currentDocsIndex = []
					for (let r = 0; r < this.currentLimitToShow; r++) {
						this.currentDocsIndex.push(r)
					}
				}
			}
			else if (direction == 'right') {

				if (this.currentDocsIndex[this.currentLimitToShow - 1] + this.currentLimitToShow < this.calendarDoctors.length) {
					this.currentDoctors = []
					for (let r = 1; r <= this.currentLimitToShow; r++) {
						this.currentDoctors.push(this.calendarDoctors[this.currentDocsIndex[this.currentLimitToShow - 1] + r])
					}
					let temp = this.currentDocsIndex[this.currentLimitToShow - 1]
					this.currentDocsIndex = []
					for (let r = 1; r <= this.currentLimitToShow; r++) {
						this.currentDocsIndex.push(temp + r)
					}
				} else {
					this.currentDoctors = []
					for (let r = this.currentLimitToShow; r > 0; r--) {
						this.currentDoctors.push(this.calendarDoctors[this.calendarDoctors.length - r])
					}
					this.currentDocsIndex = []
					for (let r = this.currentLimitToShow; r > 0; r--) {
						this.currentDocsIndex.push(this.calendarDoctors.length - r)
					}
				}
			}
		}
		this.cdr.detectChanges()
		// console.log(this.currentDoctors)
	}
	public chnageRoomHeader(direction: string) {
		if (this.calenderRooms.length > this.currentLimitToShow) {
			if (direction === 'left') {
				if (this.currentRoomsIndex[0] > this.currentLimitToShow - 1) {
					this.currentRooms = []
					for (let r = this.currentLimitToShow; r > 0; r--) {
						this.currentRooms.push(this.calenderRooms[this.currentRoomsIndex[0] - r])
					}
					let temp = this.currentRoomsIndex[0]
					this.currentRoomsIndex = []
					for (let r = this.currentLimitToShow; r > 0; r--) {
						this.currentRoomsIndex.push(temp - r)
					}
				} else {
					this.currentRooms = []
					for (let r = 0; r < this.currentLimitToShow; r++) {
						this.currentRooms.push(this.calenderRooms[r])
						this.currentRoomsIndex.push(r)
					}
					this.currentRoomsIndex = []
					for (let r = 0; r < this.currentLimitToShow; r++) {
						this.currentRoomsIndex.push(r)
					}
				}
			}
			else if (direction == 'right') {

				if (this.currentRoomsIndex[this.currentLimitToShow - 1] + this.currentLimitToShow < this.calenderRooms.length) {
					this.currentRooms = []
					for (let r = 1; r <= this.currentLimitToShow; r++) {
						this.currentRooms.push(this.calenderRooms[this.currentRoomsIndex[this.currentLimitToShow - 1] + r])
					}
					let temp = this.currentRoomsIndex[this.currentLimitToShow - 1]
					this.currentRoomsIndex = []
					for (let r = 1; r <= this.currentLimitToShow; r++) {
						this.currentRoomsIndex.push(temp + r)
					}
				} else {
					this.currentRooms = []
					for (let r = this.currentLimitToShow; r > 0; r--) {
						this.currentRooms.push(this.calenderRooms[this.calenderRooms.length - r])
					}
					this.currentRoomsIndex = []
					for (let r = this.currentLimitToShow; r > 0; r--) {
						this.currentRoomsIndex.push(this.calenderRooms.length - r)
					}
				}
			}
		}
		this.cdr.detectChanges()
		// console.log(this.currentRooms)
	}
	public checkAvailabilityDoc(doc) {
		this.doctors = doc;
	}
}
