import {changeDateFormat, removeEmptyKeysFromObject } from '@appDir/shared/utils/utils.helpers';
import { EnumApiPath } from './../../../../../front-desk/billing/Models/searchedKeys-modal';
import { NgSelectShareableComponent } from './../../../../../shared/ng-select-shareable/ng-select-shareable.component';
import { EorBillUrlsEnum } from './../../../../../eor/eor-bill.url.enum';
import { MappingFilterObject } from './../../../../../shared/filter/model/mapping-filter-object';
import { ShareAbleFilter } from './../../../../../shared/models/share-able-filter';
import { Subject } from 'rxjs';

import { Component, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { SchedulerSupervisorService } from '../../../../scheduler-supervisor.service';
import { AssignDoctorSubjectService } from '../../assign-doctor-subject.service';
import { SubjectService } from '../../subject.service';
import { FrontDeskService } from '@appDir/scheduler-front-desk/front-desk.service';
import { ToastrService } from 'ngx-toastr';
import { StorageData, HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { Router } from '@angular/router';
import { AssignSpecialityUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-speciality/assign-speciality-urls-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { AddToBeSchedulledUrlsEnum } from '@appDir/scheduler-front-desk/modules/add-to-be-scheduled/add-to-be-scheduled-list-urls-enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { AssignDoctorUrlsEnum, RecurrenceRepeatOptionEnum } from '@appDir/scheduler-front-desk/modules/assign-doctor/assign-doctor-urls-enum';
import { Pagination } from '@appDir/shared/models/pagination';
import { convertDateTimeForSending, convertUTCTimeToUserTimeZoneByOffset, removeEmptyAndNullsFormObject, getTimeZone, stdTimezoneOffset, convertDateTimeForSendingversion1, getIdsFromArray,checkSelectedLocationsForInactive } from '@appDir/shared/utils/utils.helpers';
import { WithoutTime } from '@appDir/shared/utils/utils.helpers';
import * as moment from 'moment';

@Component({
	selector: 'app-add-doc-assignment-modal',
	templateUrl: './add-doc-assignment-modal.component.html',
	styleUrls: ['./add-doc-assignment-modal.component.scss']
})
export class AddDocAssignmentModalComponent extends PermissionComponent {
	myForm: FormGroup;
	public recuurenceObjEndDateAutomatic: any = {
		"specAssign": {
			"startDate": "", "endDate": "", "noOfDoctors": "", "supId": "", "specId": "", "clinicId": ""
		}, "recurrence": { "startDate": "", "endDate": "", "daysList": [""], "endingCriteria": "Weekly" }, "doctorMethod": ""
	};
	public ifRecurrence = {
		"docAssign": {
			"startDate": "2018-11-01 10:00:00",
			"endDate": "2018-11-01 22:00:00",
			"docId": 1,
			"doctorName": "Dr.Adeosun",
			"clinicId": 2
		},
		"recurrence": {
			"startDate": "2018-11-01 10:00:00",
			"endDate": "2018-11-09 18:00:00",
			"daysList": [
				"4"
			],
			"endingCriteria": "Weekly"
		}
	};
	public recuurenceObjEndAfterWeeksAutomatic: any = {
		"specAssign": {
			"startDate": "", "endDate": "", "noOfDoctors": "", "supId": "", "specId": "", "clinicId": ""
		}, "recurrence": { "startDate": "", "daysList": [""], "endingCriteria": "Weekly", "endAfterWeeks": "" }, "doctorMethod": ""
	};
	public recuurenceObjEndDateNone: any = {
		"specAssign": {
			"startDate": "", "endDate": "", "noOfDoctors": "", "supId": "", "specId": "", "clinicId": ""
		}, "recurrence": { "startDate": "", "endDate": "", "daysList": [""], "endingCriteria": "Weekly" }, "doctorMethod": ""
	};
	public recuurenceObjEndAfterWeeksNone: any = {
		"specAssign": {
			"startDate": "", "endDate": "", "noOfDoctors": "", "supId": "", "specId": "", "clinicId": ""
		}, "recurrence": { "startDate": "", "daysList": [""], "endingCriteria": "Weekly", "endAfterWeeks": "" }, "doctorMethod": ""
	};
	public weekDayList: any = [];
	public isWeekError: boolean = true;
	public isDisableOption: boolean = true;
	public isUnSuccess: boolean = true;
	public hideRangeOfRecurrenceError: boolean = true;
	public isRecurrenceError: boolean = true;
	public tempDaysList = [];
	public specTimeSlot = 0;
	public dayListArray: any = [];
	public checkRecExists: any;
	public isRecuurenceBefore: boolean = false;
	public isShowRecuurenceBefore: boolean = true;
	public interval: number;
	public option: any = [];
	public endByDate: Date;
	public endAfterCheck: any = false;
	public endByCheck: any;
	public speciality: any = [];
	public isRangeRec: boolean = true;
	public noOfDoc;
	public hideRangeRec: boolean = true;
	public status: boolean = true;
	public isDisable: boolean = false;
	public startDate: Date;
	public endDate: Date;
	public startTime: Date;
	public endTime: Date;
	public endOccurenceEndDate: Date;
	public minTime: Date;
	public maxTime: Date;
	public minDate: Date;
	public minStartTime :Date
	public maxEndTime :Date
	min = new Date('1900/01/01');
	public clinic;
	public currentPracticeLocation;
	public spec;
	public currentSepcality;
	//values from calendar cell
	public cellSpeciality: any;
	public cellClinic: any;
	public assignClinics = [];
	EnumApiPath = EnumApiPath;
	hiderangeOfRecurrenceOptions: boolean = true;
	allSpec: any[] = [];
	eventsSubject: Subject<any> = new Subject<any>();
	selectedMultipleFieldFiter: any = {
		speciality_ids: [],
	};
	mainApiPath = REQUEST_SERVERS.schedulerApiUrl;
	currentParams = {
	};
	DATEFORMAT = EorBillUrlsEnum.DATE_FORMAT;
	specListing:any[] =[];
	previouSpecalityIds: any[] =[];
	loadSpin: boolean =false;

	//Timings to display in Double Click Modal
	//    private dateIdToDay = {0:"Mon",1:"Tue",2:"Wed",3:"Thu",4:"Fri",5:"Sat",6:"Sun"};
	private dateIdToDay = { 0: "Sun", 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat" };
	private docTimeStart;
	private docTimeEnd;
	@ViewChild('ngSelectSharableSpecality') ngSelectSharableSpecality: NgSelectShareableComponent;
	@ViewChild('ngSelectSharableDoctorName') ngSelectSharableDoctorName: NgSelectShareableComponent;
	//

	ngOnInit() {
		this.intializeWeek();
		console.log("Subject Service", this._subjectService);
		this.startDate = new Date(this._subjectService.currentStartDate);
		this.endDate = new Date(this._subjectService.currentStartDate);
		this.minDate = new Date(this._subjectService.currentStartDate);
		this.startTime = new Date(this._subjectService.currentStartDate);
		this.endTime = new Date(this._subjectService.currentStartDate);
		this.minTime = new Date(this.startTime);
		this.maxTime = new Date(this.endTime);
		this.startTime.getHours();
		this.startTime.getMinutes();
		this.startTime.setSeconds(0);
		this.startTime.setMilliseconds(0);
		this.endTime.setSeconds(0);
		this.endTime.setMilliseconds(0);
		this.endTime.setHours((this.startTime.getHours() + 1));
		this.endTime.setMinutes(this.startTime.getMinutes());
		this.endDate.setHours((this.endTime.getHours()));
		this.myForm.controls[('startdate')].setValue(this.startDate.toISOString());
		this.myForm.controls[('enddate')].setValue(this.endDate.toISOString());
		this.myForm.controls['starttime'].setValue(this.startTime);
		this.myForm.controls['endtime'].setValue(this.endTime);
		this.myForm.controls['noOfDoctors'].setValue(0);
		this.myForm.controls['noOfOccurence'].setValue(1);
		this.clinic = this.cellClinic.name;
		this.currentPracticeLocation = this.cellClinic?.id;
		this.spec = this.cellSpeciality.name;


		// this.getSpeciality();
	}
	ngAfterViewInit(): void {
		//Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
		//Add 'implements AfterViewInit' to the class.
		this.getUpdatedRecordsProvider();
		this.getUpdatedRecordsSpecality();
	}
	getUpdatedRecordsSpecality() {
		this.cellClinic;
		this.cellSpeciality;
		debugger;
		// let facilityIds = getIdsFromArray(this.cellClinic.userFacilities, 'facility_location_id');
		this.currentParams = {
			doctor_ids: [parseInt(this.cellSpeciality.id),
			],
			"is_single": true,
			facility_location_ids: [this.cellSpeciality.facility_location_id]
		};
		this.ngSelectSharableSpecality.lists = [];
		this.ngSelectSharableSpecality.selectedItem = [];
		this.ngSelectSharableSpecality.searchForm.reset();
		this.ngSelectSharableSpecality.conditionalExtraApiParams = this.currentParams;
		this.getUsersSpeclityData();

	}

	getUsersSpeclityData() {
		this.requestService
			.sendRequest(
				AssignSpecialityUrlsEnum.GetUserInfoBySpecialities,
				'POST',
				REQUEST_SERVERS.schedulerApiUrl1,
				this.currentParams

			).subscribe(
				(response: any) => {
					if (response && response.result && response.result.data) {
						this.ngSelectSharableSpecality.lists = response.result.data.docs;
						this.specListing = response.result.data.docs;
						this.ngSelectSharableSpecality.searchedKeys.commonSearch.lastPage = response.result.data.pages;
						this.ngSelectSharableSpecality && this.ngSelectSharableSpecality.searchForm ? this.ngSelectSharableSpecality.searchForm.patchValue({ common_ids: [parseInt(this.cellSpeciality.speciality_id)] }) : null;
						if (this.ngSelectSharableSpecality && this.ngSelectSharableSpecality.searchForm &&
							(this.ngSelectSharableSpecality.searchForm.value.common_ids != null || this.ngSelectSharableSpecality.searchForm.value.common_ids != undefined)
						) {
							if (response && response.result && response.result.data && response.result.data.docs.length!=0){
								const control = <FormArray>this.myForm.controls['specialities'];
								this.myForm.controls['speciality_ids'].setValue(this.ngSelectSharableSpecality.searchForm.value.common_ids);
								if (this.getTimeInfo(response.result.data.docs,this.cellSpeciality.speciality_id,this.cellSpeciality.speciality)!=null){
								control.push(this.getTimeInfo(response.result.data.docs,this.cellSpeciality.speciality_id,this.cellSpeciality.speciality));
								}
								else {
									this.toastrService.error("User Timing not available","Error");
									this.activeModal.close();
									return false;
								}
								
						}
					}
				 }
				});
	}

	getTimeInfo(data,spec_id,spec_name){
		let index = data.findIndex(spec=>spec.id ==spec_id);
		if (index >-1){
							let getUserTiming:any[] = data[index].userFacilty.users.userTimings;
							let startDay = this._subjectService.currentStartDate.getDay();
							let TimingIndex = getUserTiming.findIndex(day=> day.day_id == startDay);
							const control = <FormArray>this.myForm.controls['specialities'];
							console.log("cell Specality",this.cellSpeciality);
				
							if (TimingIndex>-1){
							return this.addSepcalityForm(spec_id,
								spec_name
								,
								this.convertTimeToDate(convertUTCTimeToUserTimeZoneByOffset(this.storageData, getUserTiming[TimingIndex].start_time, this._subjectService.currentStartDate, true)
								),
								this.convertTimeToDate(convertUTCTimeToUserTimeZoneByOffset(this.storageData, getUserTiming[TimingIndex].end_time, this._subjectService.currentStartDate, true)
								), data[index].qualifier);
							}
							else {
							 return null;
							}
						}
	}

	convertTimeToDate(str: string) {
		if (!str) {
			return null;
		}
		let hour = parseInt(str.split(':')[0]);
		let min = parseInt(str.split(':')[1]);
		let date = new Date();
		date.setHours(hour);
		date.setMinutes(min);

		return date;
	}
	getUpdatedRecordsProvider() {

		let params = { doctor_ids: [this.cellSpeciality.id] };
		this.ngSelectSharableDoctorName.lists = [];
		this.ngSelectSharableDoctorName.selectedItem = [];
		this.ngSelectSharableDoctorName.conditionalExtraApiParams = params;
		this.ngSelectSharableDoctorName.apiPath = this.EnumApiPath.providerApiPath.toString();
		this.ngSelectSharableDoctorName.getRecordOnDropdownClick(this.cellSpeciality.id);
		this.ngSelectSharableDoctorName && this.ngSelectSharableDoctorName.searchForm ? this.ngSelectSharableDoctorName.searchForm.patchValue({ common_ids: parseInt(this.cellSpeciality.id) }) : null;
		this.myForm ? this.myForm.controls['doctor_ids'].setValue(parseInt(this.cellSpeciality.id)) : null;


	}



	ngOnChanges(changes: SimpleChanges): void {
		//Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
		//Add '${implements OnChanges}' to the class.

		this.currentParams = {

		};

	}
	private allFacilitySupervisorClinicIds: any = [];
	constructor(aclService: AclService,
		router: Router,
		public _supervisorService: SchedulerSupervisorService,
		public AssignDoctorSubjectService: AssignDoctorSubjectService,
		public _http: HttpClient, private toastrService: ToastrService,
		public _fdService: FrontDeskService,
		private storageData: StorageData,
		protected requestService: RequestService,
		public activeModal: NgbActiveModal,
		private formBuilder: FormBuilder, public _subjectService: SubjectService) {
		super(aclService, router);

		this.createForm();
		this.cellClinic = this._subjectService.clinic;
		this.cellSpeciality = this._subjectService.spec;
		this.currentSepcality = this.cellSpeciality.doctor.specialities.id;


		this.option = [
			{ id: 1, value: "Daily" }, { id: 2, value: "Weekly" }, { id: 3, value: "Monthly" }
		];
		this.allFacilitySupervisorClinicIds = this.storageData.getFacilityLocations();
		this.requestService
			.sendRequest(
				AssignSpecialityUrlsEnum.getUserInfobyFacility,
				'POST',
				REQUEST_SERVERS.schedulerApiUrl1,
				{
					facility_location_ids: this.allFacilitySupervisorClinicIds,
					per_page: Pagination.per_page,
					page: 1,
					pagination: true

				}
			).subscribe(
				(response: HttpSuccessResponse) => {
					var index = 0;
					this.assignClinics = response.result && response.result.data && response.result.data.docs;
					index = this.assignClinics.findIndex(clinic => clinic.id == this.cellClinic.id);
					this.requestService
						.sendRequest(
							AddToBeSchedulledUrlsEnum.Get_providers,
							'POST',
							REQUEST_SERVERS.schedulerApiUrl1,
							{
								facility_location_ids: [this.assignClinics[index].id],
								doctor_ids: (!this.storageData.isSuperAdmin() && this.storageData.isDoctor()) ? [this.storageData.getUserId()] : [],
								is_provider_calendar: true,
								per_page: Pagination.per_page_Provider,
								page: 1,
								pagination: true
							}
						).subscribe(
							(resp: HttpSuccessResponse) => {
								for (let j = 0; j < resp.result.data.docs.length; j++) {
									if (this.cellSpeciality.user_id == resp.result.data.docs[j]['user_id']) {
										if (this.cellClinic.id === resp.result.data.docs[j].facility_location_id) {
											if (resp.result.data.docs[j].doctor.user_timings.length != 0) {
												for (let a = 0; a < resp.result.data.docs[j].doctor.user_timings.length; a++) {
													this.tempDaysList.push(resp.result.data.docs[j].doctor.user_timings[a]);
												}
											}
										}
									}
								}
								this.myForm.controls['clinicname'].setValue(this.cellClinic.id);
								let check = false;
								for (let i = 0; i < resp.result.data.docs.length; i++) {
									if (this.cellSpeciality.user_id == resp.result.data.docs[i]['user_id']) {
										this.specTimeSlot = resp.result.data.docs[i]['doctor'].specialities.time_slot;
										this.interval = resp.result.data.docs[i]['doctor'].specialities.time_slot;
										check = true;
									}
									resp.result.data.docs[i]["id"] = resp.result.data.docs[i]['id'];
									this.speciality.push(resp.result.data.docs[i]);
								}
								if (check == true) {
									this.myForm.controls['speciality'].setValue(this.cellSpeciality.user_id);

								}
								else {
									this.specTimeSlot = 0;
								}
								this.changeRepeatEvery();

								this.currentParams =
								{
									doctor_ids: [this.myForm.get('speciality').value],
									facility_location_ids: [this.myForm.controls['clinicname'].value]
								};
								//  this.getUpdatedRecordsSpecality();

								//HAMZA
								if (check == true) {
									//console.log("SPECL DOC", this.cellSpeciality.doctor);
									//Setting Start and End Date w.r.t Provider selected
									let tempDayString = this._subjectService.currentSelectedDateDoubleClicked.split(" ");
									let tempDay = tempDayString[0];
									for (let key in this.dateIdToDay) {
										if (this.dateIdToDay[key] === tempDay) {
											if (this.cellSpeciality.doctor !== undefined) {
												// this.docTimeStart = this.cellSpeciality.doctor['user_timings'][key]['start_time_isb'];
												// this.docTimeEnd = this.cellSpeciality.doctor['user_timings'][key]['end_time_isb'];
												let user_timings = this.cellSpeciality.doctor['user_timings'].find(timing => timing.facility_location_id == this.cellSpeciality.facility_location_id && timing.day_id == key);
												// let start_time=this.cellSpeciality.doctor['user_timings'][key]['start_time']
												// let end_time=this.cellSpeciality.doctor['user_timings'][key]['end_time']
												// let time_zone=this.cellSpeciality.doctor['user_timings'][key]['time_zone_string']
												// let start_time=user_timings[key]['start_time']
												// let end_time=user_timings[key]['end_time']
												// let time_zone=user_timings[key]['time_zone_string']
												let start_time = user_timings['start_time'];
												let end_time = user_timings['end_time'];
												let time_zone = user_timings['time_zone_string'];
												this.docTimeStart = convertUTCTimeToUserTimeZoneByOffset(this.storageData, start_time, this.startDate, true);
												this.docTimeEnd = convertUTCTimeToUserTimeZoneByOffset(this.storageData, end_time, this.endDate, true);
												let stDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate(), this.docTimeStart[0] + this.docTimeStart[1], this.docTimeStart[3] + this.docTimeStart[4]);
												this.startTime = stDate;
												// this.changeStartTime();
												let edDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate(), this.docTimeEnd[0] + this.docTimeEnd[1], this.docTimeEnd[3] + this.docTimeEnd[4]);
												this.endTime = edDate;
												this.setStartEndTimeofSpeciality(new Date(this.startTime),new Date(this.endTime))
											}
										}
									}
								}
								//

							});

				});
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
		this.minTime = new Date(this.startTime.getTime() + (this.specTimeSlot * 1000 * 60));
		this.maxTime = new Date(this.endTime.getTime() - (this.specTimeSlot * 1000 * 60));
		this.minStartTime = new Date(this.startTime.getTime());
		this.maxEndTime = new Date(this.endTime.getTime());
		this.start_time_Control.patchValue(new Date(this.startTime),{emitEvent: false, onlySelf: true});
		this.end_time_Control.patchValue(new Date(this.endTime),{emitEvent: false, onlySelf: true});
		this.start_time_Control.updateValueAndValidity();
		this.end_time_Control.updateValueAndValidity();
	}

	get start_time_Control() {
        return this.myForm.get('starttime');
    }
	get end_time_Control() {
        return this.myForm.get('endtime');
    }

	startDateRequired = false;

	getChange($event: any[], fieldName: string) {
		if ($event && $event.length && $event.length != 0) {
			this.selectedMultipleFieldFiter[fieldName] = $event.map(
				(data) =>
					new MappingFilterObject(
						data.id,
						data.name,
						data.full_Name,
						data.facility_full_name,
						data.label_id,
						data.insurance_name,
						data.employer_name,
						data.created_by_ids,
						data.updated_by_ids,
					),
			);
		}
	}
	removeEmitter($event) {
		console.log($event);
			const control = <FormArray>this.myForm.controls['specialities'];	
			let index = this.previouSpecalityIds.findIndex(spec => spec == $event.data.id);
			console.log(this.previouSpecalityIds);
			if (index > -1) {
				control.removeAt(index);
			}
			else {
				// this.previouSpecalityIds.length===0? control.removeAt(0):null;
			}
		
	}

	selectionOnValueChange(e: any, Type?) {
		
		const info = new ShareAbleFilter(e);
	

		this.previouSpecalityIds = this.myForm.controls['speciality_ids'].value;
		this.myForm.patchValue(removeEmptyAndNullsFormObject(info));
		// this.getChange(e.data, e.label);
		const control = <FormArray>this.myForm.controls['specialities'];
		// if (Type && Type ==='doctor_ids'){
		// 	this.myForm.controls[Type].setValue(null);
		// 	control.controls = [];
		// 	this.getUpdatedRecordsSpecality()
		// }
		if (e.data && e.data.length === 0) {
			this.myForm.controls[Type].setValue(null);
			control.controls = [];
			if(Type === 'speciality_ids'){
				this.myForm.controls['specialities'].setValue([]); 
			}
		}

	}
	public changeStartDate() {
		if (this.startDate != null) {
			this.startDateRequired = false;
			this.endDate = this.startDate;
			this.minDate = new Date(this.startDate);
		} else {
			this.startDateRequired = true;
		}
	}

	public onChangeStartDate(event) {
		if (event.dateValue) {
			this.startDate = new Date(event.dateValue);

			this.changeStartDate();
		}
		else {
			this.startDate = null;
			this.startDateRequired = true;
		}
	}
	endDateRequired = false;
	public changeEndDate() {
		if (this.endDate != null) {
			this.endDateRequired = false;
			this.startDate = this.endDate;
			this.endByDate = new Date(this.endDate);
		} else {
			this.endDateRequired = true;
		}
	}

	onChangeRecurranceCriteria($event, specialityIndex) {
		const control = <FormArray>this.myForm.controls['specialities'];
		control.at(specialityIndex).get('days').setValue([]);
		control.at(specialityIndex).get('day').setValue(false);
	}
	public changeRepeatEvery() {
		// this.intializeWeek();
		return;
		this.intializeWeek();
		this.dayListArray = [];
		if (parseInt(this.myForm.get('dailyMontlyWeeklyOpt').value) === RecurrenceRepeatOptionEnum.daily) {
			this.isWeekError = true;
			this.isDisableOption = true;
		}
		else {
			for (let j = 0; j < this.speciality.length; j++) {
				if (this.speciality[j].user_id == parseInt(this.myForm.controls['speciality'].value) && parseInt(this.myForm.controls['clinicname'].value) === this.speciality[j].facility_location_id) {
					//   if (parseInt(this.myForm.controls['clinicname'].value) === this.speciality[j].facility_location_id) {
					//     if (this.speciality[j].doctor.specialities.user_timings.length != 0) {
					//       for (let a = 0; a < this.speciality[j].doctor.specialities.user_timings.length; a++) {
					//         this.tempDaysList.push(this.speciality[j].doctor.specialities.user_timings[a])
					//       }
					//     }
					//   }
					this.tempDaysList = this.speciality[j].doctor.user_timings;
				}
			}
			for (var j = 0; j < this.weekDayList.length; j++) {
				for (var x = 0; x < this.tempDaysList.length; x++) {
					if (this.weekDayList[j][0].id == this.tempDaysList[x].day_id) {
						this.weekDayList[j][0].isColor = true;
					}
				}
			}
			for (var i = 0; i < this.weekDayList.length; i++) {
				if (this.weekDayList[i][0].isColor == "false") {
					this.weekDayList.splice(i, 1);
					i--;
				}
			}
			this.isDisableOption = false;
		}
	}

	startTimeRequired = false;
	endTimewrtStart = false;

	public changeStartTime(event?: any) {
		this.startTimeRequired = false;
		this.endTimewrtStart = false;
		this.startTime = event;
		if (this.startTime == undefined || event == undefined || this.startTime.getTime() == null) {
			this.startTimeRequired = true;
		}
		else if (this.startTime != null && this.endTime != null) {
			this.startTimeRequired = false;
			if (this.endTime.getTime() <= this.startTime.getTime()) {
				this.endTimewrtStart = true;
				this.toastrService.error("Pick end Time with respect to start", 'Error')
				return;
			}
			this.startTime.setSeconds(0);
			this.startTime.setMilliseconds(0);
			this.minTime = new Date(this.startTime.getTime() + (this.specTimeSlot * 1000 * 60));
			this.start_time_Control.patchValue(new Date(this.startTime),{emitEvent: false, onlySelf: true});
			this.start_time_Control.updateValueAndValidity();
		}
	}

	endTimeRequired = false;
	
	public changeEndTime(event?: any) {
		this.endTimeRequired = false;
		this.endTimewrtStart = false;
		this.endTime = event;
		if (this.endTime == undefined || event == undefined || this.endTime.getTime() == null) {
			this.endTimeRequired = true;
		}
		else if (this.endTime != null && this.startTime != null) {
			this.endTimeRequired = false;
			if (this.endTime.getTime() <= this.startTime.getTime()) {
				this.endTimewrtStart = true;
				this.toastrService.error("Pick end Time with respect to start", 'Error')
				return;
			}
			this.endTime.setSeconds(0);
			this.endTime.setMilliseconds(0);
			this.maxTime = new Date(this.endTime.getTime() - (this.specTimeSlot * 1000 * 60));
			this.end_time_Control.patchValue(new Date(this.endTime),{emitEvent: false, onlySelf: true});
			this.end_time_Control.updateValueAndValidity();
		}
	}

	public getSpeciality() {
		this.requestService
			.sendRequest(
				// AssignSpecialityUrlsEnum.GetUserInfoBySpecialities,
				// 'post',
				// REQUEST_SERVERS.schedulerApiUrl1,
				// { per_page: Pagination.per_page,
				//   page: 1,
				//   pagination:true 
				// }
				AssignSpecialityUrlsEnum.Speciality_list_Get,
				'GET',
				REQUEST_SERVERS.fd_api_url,
			).subscribe(
				(response: HttpSuccessResponse) => {
					//this.allSpec[0]['disabled'] = true 
					this.allSpec = response.result && response.result.data;
					// //this.myForm.controls['specialityName'].setValue(this.allSpec[0].id)
					// //to update ng-select model
					// this.allSpec = [...this.allSpec]
					// this.myForm.controls['specialityName'].setValue(this.allSpec[1].id)

				});
	}


	public changeDoc() {
		this.intializeWeek();
		this.tempDaysList = [];

		for (var i = 0; i < this.speciality.length; i++) {
			if (this.speciality[i].user_id == parseInt(this.myForm.get('speciality').value)) {
				this.specTimeSlot = this.speciality[i].doctor.specialities.time_slot;
				this.interval = this.speciality[i].doctor.specialities.time_slot;
				this.changeStartTime();
				break;
			}
		}
		// this.getUpdatedRecordsSpecality();

		for (let j = 0; j < this.speciality.length; j++) {
			if (this.speciality[j].user_id == parseInt(this.myForm.controls['speciality'].value) && parseInt(this.myForm.controls['clinicname'].value) === this.speciality[j].facility_location_id) {
				// if (parseInt(this.myForm.controls['clinicname'].value) === this.speciality[j].facility_location_id) {
				// //   if (this.speciality[j].doctor.specialities.user_timings &&this.speciality[j].doctor.specialities.user_timings.length != 0) {
				// //     for (let a = 0; a < this.speciality[j].doctor.specialities.user_timings.length; a++) {
				// //       this.tempDaysList.push(this.speciality[j].doctor.specialities.user_timings[a])
				// //     }
				// //   }

				// }
				this.tempDaysList = this.speciality[j].doctor.user_timings;
			}
		}
		if (parseInt(this.myForm.get('dailyMontlyWeeklyOpt').value) === RecurrenceRepeatOptionEnum.daily) {
			this.isWeekError = true;
			this.isDisableOption = true;
		}
		else {
			for (var j = 0; j < this.weekDayList.length; j++) {
				for (var x = 0; x < this.tempDaysList.length; x++) {
					if (this.weekDayList[j][0].id == this.tempDaysList[x].day_id) {
						this.weekDayList[j][0].isColor = true;
					}
				}
			}
			for (var i = 0; i < this.weekDayList.length; i++) {
				if (this.weekDayList[i][0].isColor == "false") {
					this.weekDayList.splice(i, 1);
					i--;
				}
			}
			this.isDisableOption = false;
		}

	}
	private createForm() {
		this.myForm = this.formBuilder.group({
			clinicname: [null, Validators.required],
			speciality: [null, Validators.required],
			speciality_ids: [[]],
			doctor_ids: [''],
			startdate: ['', Validators.required],
			enddate: ['', Validators.required],
			starttime: ['', Validators.required],
			endtime: ['', Validators.required],
			noOfDoctors: ['', Validators.required],
			search: '',
			noOfOccurence: '',
			dailyMontlyWeeklyOpt: RecurrenceRepeatOptionEnum.daily,
			endOccureneceDate: '',
			'specialities': this.formBuilder.array([
			])
		});
	}

	addSepcalityForm(specality_id,specality_name,start_time, end_time, qualifier?) {
		return this.formBuilder.group({
			'specality_id': [specality_id,Validators.required],
			'specality_name':[specality_name,Validators.required],
			'qualifier':[qualifier,Validators.required],
			'start_time': [start_time, Validators.required],
			'end_time': [end_time, Validators.required],
			'end_date': [this._subjectService.currentStartDate, Validators.required],
			range_of_recurrence: [''],
			'is_recurance': [''],
			'days': [[]],
			'end_date_for_recurrence': [
				this._subjectService.currentStartDate,
				[
					Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
					Validators.maxLength(10),
					Validators.required

				]],
			'start_date': [
				this._subjectService.currentStartDate,
				[
					Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
					Validators.maxLength(10),
					Validators.required

				]],
			'recurrence_ending_criteria_id': [RecurrenceRepeatOptionEnum.daily],
			end_after_occurences: [1],
			day: [''],
			endOccureneceDate: [''],
			end_by_status: [''],
			recuranceSelectedValue: ['']
		});
	}

	submitData() {
		console.log(this.myForm.errors);
		// if (this.myForm.controls['specialities'].invalid){
		// 	this.toastrService.error("Atleast one specality is required", 'Error');
		// 	return false;
		// }
		
		this.loadSpin = true;
		if(!checkSelectedLocationsForInactive([parseInt(this.myForm.value.clinicname)],[this.cellClinic])){
			this.loadSpin=false;
			this.toastrService.error("Selected location(s) is/are inactive, please contact your supervisor",'Error');
			return;
		}
		let seletedSpecalities: any[] = [];
		let params = {
			facility_location_id: this.myForm.value.clinicname,
			doctors: [this.myForm.value.doctor_ids],
			// doctor_method_id: 2,
			// no_of_doctors: 1,
			// is_provider_assignment:true

		};
		let specialities: any[] = [] = this.myForm.value.specialities;
	
		if (this.myForm.value.clinicname==null || this.myForm.value.clinicname==undefined || this.myForm.value.clinicname==''){
			this.loadSpin=false;
			this.toastrService.error("Practice Location is required", 'Error');
			return false;
		}
		if (specialities.length==0){
			this.loadSpin=false;
			this.toastrService.error("Atleast one specality is required", 'Error');
			return false;
		}
		specialities.forEach(specality => {
			if (!specality.start_date){
				this.toastrService.error("Start Date is required", 'Error');
				this.loadSpin=false;
				throw 'Start Date Exception';
			}
			if (!specality.start_time){
				this.loadSpin=false;
				this.toastrService.error("Start Time is required", 'Error');
				throw 'Start Time Execption';
			}

			if (!specality.end_time){
				this.loadSpin=false;
				this.toastrService.error("End Time is required", 'Error');
				throw 'End Time Exception';
			}
			if (specality.is_recurance && !specality.recuranceSelectedValue){
				this.loadSpin=false;
				this.toastrService.error("Recurrence Option is required", 'Error');
				throw 'Recurance Excepection';
			}

		
		
			let startTime: Date = new Date(specality.start_time);
			let endTime: Date = new Date(specality.end_time);
			let startDate: Date = new Date(specality.start_date);
			let endDate: Date = new Date(specality.end_date);
			let endDateOfOccurances: Date = new Date(specality.end_date_for_recurrence);
			startDate.setHours(startTime.getHours());
			startDate.setMinutes(startTime.getMinutes());
			endDate.setHours(endTime.getHours());
			endDate.setMinutes(endTime.getMinutes());
			seletedSpecalities.push({
				start_date: convertDateTimeForSendingversion1(this.storageData, startDate, 'start'),
				end_date: convertDateTimeForSendingversion1(this.storageData, endDate),
				speciality_id: specality.specality_id,
				days: specality.is_recurance ? specality.days : null,
				recurrence_ending_criteria_id: specality.is_recurance ? specality.recurrence_ending_criteria_id : null,
				end_after_occurences: specality.recuranceSelectedValue == 1? specality.end_after_occurences : null,
				end_date_for_recurrence: specality.recuranceSelectedValue == 2 ? changeDateFormat(endDateOfOccurances): null
			});
		});
		params['specialities'] = seletedSpecalities;
		let time_zone_string = getTimeZone(this.storageData.getUserTimeZone().timeZone);
		params['time_zone'] = {
			time_zone: stdTimezoneOffset(),
			time_zone_string: time_zone_string
		};
		console.log('Current Params', params);
		this.addAssigmentDoctor(removeEmptyKeysFromObject(params));

	}

	addAssigmentDoctor(params) {
		this.subscription.push(
			this.requestService
				.sendRequest(
					AssignDoctorUrlsEnum.createDoctorAssigment_v1,
					'POST',
					REQUEST_SERVERS.schedulerApiUrl1,
				params,
				)
				.subscribe(
					(resp) => {
						if (resp['status'] == 200 || resp['status'] == true) {
							this._subjectService.refreshUpdate("update");
							this.loadSpin=false;
							this.toastrService.success("Assignment Created Successfully", 'Success');
							this.activeModal.close();
						}
					},
					(err) => {
						this.loadSpin=false;
					},
				),
		);

	}


	addNewRecordSpecality($event) {
		
		let addedSpecality: any[] = this.myForm.getRawValue().speciality_ids;
		const control = <FormArray>this.myForm.controls['specialities'];
		// if (addedSpecality && addedSpecality.includes($event.id)) {
		// 	let index = control.controls.findIndex(spec => spec.value.specality_id === $event.id);
		// 	return false;
		// }

		if ($event && $event.id) {
			if (this.getTimeInfo(this.specListing,$event.id,$event.name)!=null){
			control.push(this.getTimeInfo(this.specListing,$event.id,$event.name));
			}
			else {
				this.toastrService.error("User Timing not available","Error");
				this.activeModal.close();
				return false;
			}
		}
	}

	removeSpecality(specialityIndex) {
		const control = <FormArray>this.myForm.controls['specialities'];
		let specalityIds: any[] = [] = this.myForm.controls['speciality_ids'].value;
		let formValue = control.at(specialityIndex).get('specality_id').value;
		if (specalityIds && specalityIds.length != 0) {
			let index = specalityIds.findIndex(spec => spec == formValue);
			console.log(index);
			if (index > -1) {
				specalityIds.splice(index, 1);
				this.myForm.controls['speciality_ids'].setValue(specalityIds);
				// this.eventsSubject.next(true);
				this.ngSelectSharableSpecality.searchForm.patchValue({common_ids: specalityIds})
				
			}
			control.removeAt(specialityIndex);
		}

	}
	checkRangeOfRecurrenceAndOptionErrorExist() {
		if (
			(<HTMLInputElement>document.getElementById('rangeRecOption2')).checked === true ||
			(<HTMLInputElement>document.getElementById('rangeRecOption1')).checked === true
		) {
			// this.isUnSuccess = true;
			this.hiderangeOfRecurrenceOptions = true;
		}
		else {
			this.hiderangeOfRecurrenceOptions = false;
		}
		if (
			(<HTMLInputElement>document.getElementById('rangeRecurrence')).checked === true) {
			// this.isUnSuccess = true;
			this.hideRangeOfRecurrenceError = true;
		}
		else {
			this.hideRangeOfRecurrenceError = false;
		}
	}
	public submitFormAndClose() {
		this.isRecurrenceError = true;
		if (this.myForm.invalid) {
			return;
		}
		this.activeModal.close(this.myForm.value);
	}
	public submitFormAndOpen() {
		if (this.specTimeSlot == 0 || !this.myForm.get('speciality').value) {
			this.toastrService.error("Kindly select atleast one provider", 'Error');
			return;
		}
		if (this.startDate == undefined || this.endDate == undefined) {
			this.toastrService.error("Date is required", 'Error');
			return;
		}
		else if (this.startTime == undefined || this.endTime == undefined) {
			this.toastrService.error("Start and End time is mandatory", 'Error');
			return;
		} else {
			if (this.endTime.getTime() < this.minTime.getTime()) {
				this.toastrService.error("Pick end time with respect to start time", 'Error');
				return;
			}
			var object;
			var selectedClinicId;
			var selectedDocId;
			var selectedDocName;
			selectedClinicId = parseInt(this.myForm.get('clinicname').value);
			selectedDocId = parseInt(this.myForm.get('speciality').value);
			//   for (let i = 0; i < this.speciality.length; i++) {
			//     if (this.speciality[i].id == parseInt(this.myForm.get('speciality').value)) {
			//       selectedDocName = this.speciality[i].doctor.info.last_name
			//     }
			//   }

			this.startDate.setHours(this.startTime.getHours());
			this.startDate.setMinutes(this.startTime.getMinutes());
			let startDate = convertDateTimeForSendingversion1(this.storageData, new Date(this.startDate), 'start');
			this.endDate.setHours(this.endTime.getHours());
			this.endDate.setMinutes(this.endTime.getMinutes());
			let endDate = convertDateTimeForSendingversion1(this.storageData, new Date(this.endDate));
			let occurrenceDate: any;
			if (this.checkRecExists == true) {
				if (this.hideRangeOfRecurrenceError == true) { // false means it is checked
					//   if (this.endByCheck == true) {
					if (!this.endByCheck && !this.endAfterCheck) {
						// this.isUnSuccess=false;
						this.checkRangeOfRecurrenceAndOptionErrorExist();
						// this.hiderangeOfRecurrenceOptions=false;
						// this.hideRangeOfRecurrenceError=true;
						return;
					}
					if (this.endByCheck == true && (this.endByDate != null || this.endByDate != undefined)) {
						this.endByDate.setHours(this.endTime.getHours());
						this.endByDate.setMinutes(this.endTime.getMinutes());
						occurrenceDate = new Date(this.endByDate);
						occurrenceDate.setHours(23);
						occurrenceDate.setMinutes(59);
						occurrenceDate.setSeconds(59);
					}
					if (parseInt(this.myForm.get('dailyMontlyWeeklyOpt').value) === RecurrenceRepeatOptionEnum.Weekly || parseInt(this.myForm.get('dailyMontlyWeeklyOpt').value) === RecurrenceRepeatOptionEnum.Monthly) {
						if (this.dayListArray.length === 0) {
							this.isWeekError = false;
							return;
						}
						else {
							this.isWeekError = true;
						}
					}
					else { this.dayListArray = []; }

					//  occurrenceDate = new Date(this.endByDate);
					// occurrenceDate.setHours(23)
					// occurrenceDate.setMinutes(59)
					// occurrenceDate.setSeconds(59) 
					//   } 
				}
				else {
					// this.isUnSuccess=false;
					this.hideRangeOfRecurrenceError = false;
					return;
				}

			}


			// object = {
			// 	"doctor": {
			// 		"facility_location_id": selectedClinicId,
			// 		"doctor_id": selectedDocId,
			// 	  "start_date": startDate,
			// 	  "end_date": endDate,					 			  
			// 	  "days":this.checkRecExists ? this.dayListArray:null,					  
			// 	  "recurrence_ending_criteria_id":this.checkRecExists? parseInt(this.myForm.get('dailyMontlyWeeklyOpt').value):null,
			// 	  "end_after_occurences":this.isRangeRec==false &&this.endAfterCheck ? parseInt(this.myForm.get('noOfOccurence').value): null,
			// 	  "end_date_for_recurrence": this.isRangeRec==false&& this.endByCheck? convertDateTimeForSending(this.storageData, occurrenceDate):null
			// 	},
			//   }
			//   object.doctor = removeEmptyAndNullsFormObject(object.doctor);

			if (this.startTime.getTime() == null || this.endDate.getTime() == null) {
				this.toastrService.error("Start and End time is mandatory", 'Error');
			}
			else if (this.startTime.getTime() == this.endTime.getTime()) {
				this.toastrService.error("Start and end time can't be same", 'Error');
			}
			else if ((this.endByDate == null || this.endByDate == undefined) && this.endByCheck == true) {
				this.toastrService.error("End By Date is Required", 'Error');
			} else if (this.startTime.getTime() > this.endTime.getTime()) {
				this.toastrService.error("End Time is not Valid", 'Error');
			}
			else if (WithoutTime(this.endByDate) < WithoutTime(this.minDate)) {
				this.toastrService.error('Pick end date with respect to start date', 'Error');
				return;
			}
			else {
				object = {
					"doctor": {
						"facility_location_id": selectedClinicId,
						"doctor_id": selectedDocId,
						"start_date": startDate,
						"end_date": endDate,
						"days": this.checkRecExists ? this.dayListArray : null,
						"recurrence_ending_criteria_id": this.checkRecExists ? parseInt(this.myForm.get('dailyMontlyWeeklyOpt').value) : null,
						"end_after_occurences": this.isRangeRec == false && this.endAfterCheck ? parseInt(this.myForm.get('noOfOccurence').value) : null,
						"end_date_for_recurrence": this.isRangeRec == false && this.endByCheck ? convertDateTimeForSending(this.storageData, occurrenceDate) : null
					},
				};
				let newDate = new Date();
				let time_zone_string = getTimeZone(this.storageData.getUserTimeZone().timeZone);
				object['time_zone'] = {
					time_zone: stdTimezoneOffset(),
					time_zone_string: time_zone_string
				};
				object.doctor = removeEmptyAndNullsFormObject(object.doctor);
				this.requestService
					.sendRequest(
						AssignDoctorUrlsEnum.createDoctorAssignment,
						'POST',
						REQUEST_SERVERS.schedulerApiUrl1,
						object
					).subscribe(
						(response: HttpSuccessResponse) => {
							this._subjectService.refreshUpdate("update");
							//   var backview = (response.result.data[0]["result"][0])
							// this.calendardayService.result.push(backview)
							//   if (response.result.data[0]["partialUnavailability"].length > 0) {
							//     this.toastrService.error("Doctor is partially unavailable", 'Error')
							//   } else {
							//     this.toastrService.success("Successfully Added", 'Success')
							//   }
							this.toastrService.success("Assignment Created Successfully", 'Success');
							this.activeModal.close();
						});
			}
		}
	}
	getKeyControl(key, index) {
		const control = <FormArray>this.myForm.controls['specialities'];
		if (control && control.value && control.value.length!=0){
		let controlValue = control.at(index).get(key);
		return controlValue;
		}
		else {
			throw 'Specalities not found';
		}
	}
	public changeWeek(event, val, index) {
		debugger;
		val = val.id;
		const control = <FormArray>this.myForm.controls['specialities'];

		let dayListArray: any[] = [] = control.at(index).value['days'];
		if (event.target.checked) {
			//   val = JSON.stringify(val);
			if (!dayListArray.includes(val)) {
				dayListArray.push(val);
			}
			dayListArray.sort();
			this.isWeekError = true;
		}
		else {
			//   val = JSON.stringify(val);
			for (var i = 0; i < dayListArray.length; i++) {
				if (dayListArray[i] === val) {
					dayListArray.splice(i, 1);
				}
			}
		}
		if (control) {
			control.at(index).patchValue({
				days: dayListArray
			});
		}

	}

	endAfterSpecalityBased($event, index) {
		const control = <FormArray>this.myForm.controls['specialities'];
		console.log($event);
		control.at(index).get('end_after_occurences').enable();
		control.at(index).get('end_date_for_recurrence').disable();
		control.at(index).get('range_of_recurrence').setValue(true);


	}


	public endAfter(e) {
		if (e.target.checked) {
			this.endAfterCheck = true;
			this.endByCheck = false;
			//   this.isUnSuccess=true;
			this.hiderangeOfRecurrenceOptions = true;
			this.endAfterClickChanged();
		} else {
			// this.isUnSuccess=true
			this.hiderangeOfRecurrenceOptions = true;
			this.endAfterCheck = false;
		}
	}

	endByStatus(index) {
		const control = <FormArray>this.myForm.controls['specialities'];
		let value = control.at(index).get('end_by_status').value;
		control.at(index).get('range_of_recurrence').setValue(true);
		if (value === 1) {
			control.at(index).get('end_after_occurences').enable();
			control.at(index).get('recuranceSelectedValue').setValue(1);
			control.at(index).get('end_date_for_recurrence').disable();

		}
		else {
			control.at(index).get('end_after_occurences').disable();
			control.at(index).get('end_date_for_recurrence').enable();
			control.at(index).get('recuranceSelectedValue').setValue(2);

		}
	}

	public endBy(e) {
		if (e.target.checked) {
			this.endByCheck = true;
			this.endAfterCheck = false;
			//   this.isUnSuccess=true;
			this.hiderangeOfRecurrenceOptions = true;
			this.endOccChanged();
		} else {
			// this.isUnSuccess=true
			this.hiderangeOfRecurrenceOptions = true;
			this.endByCheck = false;
		}
	}
	public changeSpec() {
	}

	recurrenceDocSpecalityBased($event, index) {
		const control = <FormArray>this.myForm.controls['specialities'];
		if ($event.target.checked) {

			if (control.at(index).get('recurrence_ending_criteria_id').value === RecurrenceRepeatOptionEnum.daily) {
				control.at(index).get('end_date_for_recurrence').disable();
			}
		}
		else {
			// control.at(index).get('days').setValue([]);	
			control.at(index).get('day').setValue(false);
			control.at(index).get('recurrence_ending_criteria_id').setValue(RecurrenceRepeatOptionEnum.daily);
		}


	}
	public RecurrenceDoc(event) {
		if (event.target.checked) {
			this.checkRecExists = true;
		} else {
			this.checkRecExists = false;
		}
		if (parseInt(this.myForm.get('dailyMontlyWeeklyOpt').value) === RecurrenceRepeatOptionEnum.daily) {
			this.isDisableOption = true;
		}
		else {
			this.isDisableOption = false;
		}
		if ((<HTMLInputElement>document.getElementById('rangeRecurrence')).checked === true) {
			this.isRangeRec = false;

			this.myForm.controls['noOfOccurence'].enable();
			if (event.target.checked) {

				this.isShowRecuurenceBefore = false;
				this.hideRangeRec = false;
				this.endByDate = new Date(this.endDate);
				this.resetRecurrenceDetailsOnUncheckRecurrence();

			}
			else {
				this.resetRecurrenceDetailsOnUncheckRecurrence();
				// this.hideRangeOfRecurrenceError=true; 
				this.isShowRecuurenceBefore = true;
				this.hideRangeRec = true;
				this.isDisableOption = true;
			}
		}
		else {

			this.isRangeRec = true;


			if (event.target.checked) {

				this.isShowRecuurenceBefore = false;
				this.hideRangeRec = false;
				this.endByDate = this.endDate;
				this.myForm.controls['noOfOccurence'].enable();
				this.resetRecurrenceDetailsOnUncheckRecurrence();
				// this.hideRangeOfRecurrenceError=true;
				this.isRangeRec = false;
			}
			else {
				// this.hideRangeOfRecurrenceError=true;
				this.resetRecurrenceDetailsOnUncheckRecurrence();
				this.isShowRecuurenceBefore = true;
				this.isDisableOption = true;
				this.hideRangeRec = true;
			}
		}

	}
	resetRecurrenceDetailsOnUncheckRecurrence() {
		(<HTMLInputElement>document.getElementById('rangeRecurrence')).checked = false;
		//this.rangeRecuurence({target: {checked: false}});
		(<HTMLInputElement>document.getElementById('rangeRecOption1')).checked = false;
		(<HTMLInputElement>document.getElementById('rangeRecOption2')).checked = false;
		this.myForm.get('noOfOccurence').setValue('1');
		this.hideRangeOfRecurrenceError = true;
		this.hiderangeOfRecurrenceOptions = true;
		this.endAfterCheck = false;
		this.endByCheck = false;
	}

	public selectRangeOfRecurrenceTypes() {
		if (
			(<HTMLInputElement>document.getElementById('rangeRecOption2')).checked === true ||
			(<HTMLInputElement>document.getElementById('rangeRecOption1')).checked === true
		) {
			// this.isUnSuccess = true;
			this.hiderangeOfRecurrenceOptions = true;
		} else {
			this.hiderangeOfRecurrenceOptions = false;
			// this.isUnSuccess = false;
			// this.endbyDateDisable = true;
		}
		if ((<HTMLInputElement>document.getElementById('rangeRecOption2')).checked === true) {
			// this.endbyDateDisable = false;
			this.myForm.controls['noOfOccurence'].disable();
		} else {
			// this.endbyDateDisable = true;
			// this.myForm.controls['endOccureneceDate'].enable();
			this.myForm.controls['noOfOccurence'].enable();
		}
	}

	public checkRangeOfRecurrenceOptionError() {
		if (
			(<HTMLInputElement>document.getElementById('rangeRecOption2')).checked === true ||
			(<HTMLInputElement>document.getElementById('rangeRecOption1')).checked === true
		) {
			// this.isUnSuccess = true;
			this.hiderangeOfRecurrenceOptions = true;
		} else {
			this.hiderangeOfRecurrenceOptions = false;
			// this.isUnSuccess = false;
			// this.endbyDateDisable = true;
		}
	}

	rangeRecurranceSpecalityBased($event, index: number) {
		debugger;
		const control = <FormArray>this.myForm.controls['specialities'];
		if ($event.target.checked) {
			control.at(index).get('range_of_recurrence').enable();
		}
	}
	public rangeRecuurence(event) {
		this.hideRangeOfRecurrenceError = true;
		this.isUnSuccess = true;
		this.minDate = new Date(this.startDate);
		if ((<HTMLInputElement>document.getElementById('rangeRecurrence')).checked === true) {
			this.isRangeRec = false;
			//   this.myForm.controls['endOccureneceDate'].enable();
			this.myForm.controls['noOfOccurence'].enable();
		}
		if (event.target.checked) {
			// this.checkRangeOfRecurrenceOptionError();
			this.isRangeRec = false;
			//   this.myForm.controls['endOccureneceDate'].enable();
			this.myForm.controls['noOfOccurence'].enable();
			this.isDisable = true;
			this.hideRangeOfRecurrenceError = true;
		}
		else {
			//   this.myForm.controls['endOccureneceDate'].disable();
			// this.checkRangeOfRecurrenceOptionError();
			//   this.myForm.controls['noOfOccurence'].disable();
			this.isDisable = false;
			//   this.isRangeRec = true;
			this.hideRangeOfRecurrenceError = false;
		}
		this.hideRangeRec = false;
	}
	public changeNoDoctors() {
		this.noOfDoc = this.myForm.get('noOfDoctors').value;
	}
	public changeClinic() {
		this.intializeWeek();
		this.requestService
			.sendRequest(
				AddToBeSchedulledUrlsEnum.Get_providers,
				'POST',
				REQUEST_SERVERS.schedulerApiUrl1,
				{
					"facility_location_ids": [parseInt(this.myForm.controls['clinicname'].value)],
					per_page: Pagination.per_page_Provider,
					page: 1,
					pagination: true
				}
			).subscribe(
				(response: HttpSuccessResponse) => {
					//   for (let i = 0; i < response.result.data.docs.length; i++) {
					//     for (let x = 0; Array.isArray(response.result.data.docs[i].doctor.specialities) && x < response.result.data.docs[i].doctor.specialities.length; x++) {
					//       if (parseInt(this.myForm.controls['clinicname'].value) === response.result.data.docs[i].facility_location_id) {
					//         response.result.data.docs[i].doctor.specialities = response.result.data.docs[i].doctor.specialities;
					//         break;
					//       }
					//     }
					//   }
					this.speciality = [];
					//   for (let i = 0; i < response.result.data.docs.length; i++) {
					//     response.result.data.docs[i]["id"] = response.result.data.docs[i]['id']
					//     this.speciality.push(response.result.data.docs[i]);

					//   }
					this.speciality = response.result.data.docs;
					let defaultProvider = this.speciality.find(provider => provider.user_id == this.cellSpeciality.user_id);

					defaultProvider ? this.myForm.controls['speciality'].setValue(this.cellSpeciality.user_id) : this.myForm.controls['speciality'].setValue(null);
				});
	}
	endOccChanged(event?) {
		//console.log("DATE CHANGED", event);//tbd

		//Change Checkbox to checked if end Date changed
		(<HTMLInputElement>document.getElementById('rangeRecurrence')).checked = true;
		// End By Radio Button Checked
		(<HTMLInputElement>document.getElementById('rangeRecOption2')).checked = true;
		this.endByCheck = true;
		this.endAfterCheck = false;
		this.hideRangeOfRecurrenceError = true;
		// this.endbyDateDisable = false;

		// Func Called when End By or End After clicked
		this.selectRangeOfRecurrenceTypes();


	}

	public onChangeEndByDate(event) {
		if (event.dateValue) {
			// this.start_date_Control.patchValue(new Date(event.dateValue))
			this.endByDate = new Date(event.dateValue);

			this.endOccChanged();
		}
		else {
			// this.start_date_Control.patchValue(null)
			this.endByDate = null;
			this.endOccChanged();
		}
	}

	endAfterClickChangedSpecalityBased(index) {
		const control = <FormArray>this.myForm.controls['specialities'];
		// let value = control.at(index).get('end_by_status').value;
	    control.at(index).get('end_by_status').setValue(1);
		control.at(index).get('range_of_recurrence').setValue(true);
		control.at(index).get('end_after_occurences').enable();
		control.at(index).get('recuranceSelectedValue').setValue(1);
		control.at(index).get('end_date_for_recurrence').disable();

	}

	endOccChangedValue(index){
		const control = <FormArray>this.myForm.controls['specialities'];
		control.at(index).get('end_by_status').setValue(2);
		control.at(index).get('range_of_recurrence').setValue(true);
		control.at(index).get('end_after_occurences').disable();
		control.at(index).get('end_date_for_recurrence').enable();
		control.at(index).get('recuranceSelectedValue').setValue(2);
	}


	endAfterClickChanged() {
		//console.log("DATE CHANGED", event);//tbd

		//Change Checkbox to checked if end Date changed
		(<HTMLInputElement>document.getElementById('rangeRecurrence')).checked = true;
		// End By Radio Button Checked
		(<HTMLInputElement>document.getElementById('rangeRecOption1')).checked = true;
		this.hideRangeOfRecurrenceError = true;
		this.endByCheck = false;
		this.endAfterCheck = true;
		// this.endbyDateDisable = false;

		// Func Called when End By or End After clicked
		this.selectRangeOfRecurrenceTypes();
	}
	public intializeWeek() {
		this.weekDayList[0] = [{ id: 0, 'name': 'Sun', isColor: 'false' }];
		this.weekDayList[1] = [{ id: 1, 'name': 'Mon', isColor: 'false' }];
		this.weekDayList[2] = [{ id: 2, 'name': 'Tue', isColor: 'false' }];
		this.weekDayList[3] = [{ id: 3, 'name': 'Wed', isColor: 'false' }];
		this.weekDayList[4] = [{ id: 4, 'name': 'Thu', isColor: 'false' }];
		this.weekDayList[5] = [{ id: 5, 'name': 'Fri', isColor: 'false' }];
		this.weekDayList[6] = [{ id: 6, 'name': 'Sat', isColor: 'false' }];
	}
}
