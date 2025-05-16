import { find } from 'lodash';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ViewChildren } from '@angular/core';
import { RequestService } from '@appDir/shared/services/request.service';
import { AssignSpecialityUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-speciality/assign-speciality-urls-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { HttpSuccessResponse, StorageData } from '@appDir/pages/content-pages/login/user.class';
import { Pagination } from '@appDir/shared/models/pagination';
import { DoctorCalendarUrlsEnum } from '@appDir/shared/modules/doctor-calendar/doctor-calendar-urls-enum';
import { convertDateTimeForSending, removeEmptyAndNullsFormObject, unSubAllPrevious, convertDateTimeForRetrieving, isArray, isObjectEmpty, isEmptyObject, convertUTCTimeToUserTimeZoneByOffset } from '@appDir/shared/utils/utils.helpers';
import { FacilityUrlsEnum } from '@appDir/front-desk/masters/practice/practice/utils/facility-urls-enum';
import { AddToBeSchedulledUrlsEnum } from '@appDir/scheduler-front-desk/modules/add-to-be-scheduled/add-to-be-scheduled-list-urls-enum';
import { formatNumber } from '@angular/common';
import { CancelAppointmentListUrlsEnum } from '@appDir/scheduler-front-desk/modules/cancel-appointment-list/cancel-appointmnet-list-urls-enum';
import { LoaderService } from '@appDir/shared/services/loader.service';
import { Subject, Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { SoftPatientService } from '../../services/soft-patient-service';
import * as moment from 'moment';
import { ReferringPhysicianUrlsEnum } from '@appDir/front-desk/masters/practice/referring-physician/referring-physician/referringPhysicianUrlsEnum';
import { RecurrenceRepeatOptionEnum } from '@appDir/scheduler-front-desk/modules/assign-doctor/assign-doctor-urls-enum';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { TransportationModalComponent } from '@appDir/shared/modules/doctor-calendar/modals/transportation-modal/transportation-modal.component';
import { AppointmentUrlsEnum } from '@appDir/shared/modules/appointment/appointment-urls-enum';
import { NgSelectShareableComponent } from '@appDir/shared/ng-select-shareable/ng-select-shareable.component';
import { TimePicker, TimePickerComponent } from '@syncfusion/ej2-angular-calendars';

@Component({
	selector: 'app-soft-patient-create-appointment',
	templateUrl: './soft-patient-create-appointment.component.html',
	styleUrls: ['./soft-patient-create-appointment.component.scss']
})
export class SoftPatientCreateAppointmentComponent implements OnInit {
	@Input() patientId: number;
	@Input() caseId: number;
	@Input() caseTypeId: number;
	@Output() back = new EventEmitter();
	@Input() data: any;
	private transportationComponent: TransportationModalComponent;
	@ViewChild('transportationComponent') set content(content: TransportationModalComponent) {
		if (content) {
			this.transportationComponent = content
		}
	}
	@ViewChild('readingProviderControl') readingProviderControl: NgSelectShareableComponent;
	@ViewChild('readingPhysicianControl') readingPhysicianControl: NgSelectShareableComponent;
	@ViewChild('cptCodeControl') cptCodeControlNgSelect: NgSelectShareableComponent;
	@ViewChild('ejsTimePicker') ejsTimePicker: TimePickerComponent;
	myForm: FormGroup;
	startDate: Date = new Date();
	startTime: Date;
	public timeRange: { start: Date, startTime: Date, end: Date } = { start: new Date(), startTime: new Date, end: new Date() }
	public minTime: Date;
	public endTime: any;
	public endDate: Date = new Date();
	private specTimeStart;
	private specTimeEnd;
	interval: number = 10;
	durations: any = [];
	practiceLocations: any[] = []
	specialities: any[] = [];
	public AppointmentType: any = [];
	doctors: any[] = [];
	appointmentTypes: any[] = []
	AppointmentPriorities: any[] = []
	btnSubmit: boolean = false;
	allClinicIds: any[] = [];
	public visitTypeData: any = [];
	public apidefaulthit: boolean = false;
	public typeForAppointment: any;
	startLoader: boolean = false;
	subscription: Subscription[] = [];
	appointment: any = {};
	selectedClinic: any;
	selectedSpecialty: any;
	selectedvisitType: any;
	eventsSubjectPhysicians: Subject<any> = new Subject<any>();
	eventsSubjectCpt: Subject<any> = new Subject<any>();
	eventsSubjectReadingProvider: Subject<any> = new Subject<any>();
	eventsSubjectPhysicianValue: Subject<Boolean> = new Subject<Boolean>();
	selectedMultipleFieldFiter: any = {
		'cpt_codes_ids': [],
		'physician_id': [],
		'technician_id': [],
		'reading_provider_id': []
	};
	ReferringPhysician_LocationListing = ReferringPhysicianUrlsEnum.GET_PHYSICIANS_LIST;
	EnumApiPath = DoctorCalendarUrlsEnum;
	enableCptCodes: boolean = false;
	enableReadingProvider: boolean = false;
	public checkRecExists: any;
	public endByCheck: any = false;
	public endAfterCheck: any = false;
	public isDisableOption: boolean = true;
	public isShowRecuurenceBefore: any = true;
	public hideRangeRec: any = true;
	public isRangeRec: any = true;
	public option: any = [];
	public weekDay: any = [];
	public dayListArray: any = [];
	public clinics: any = [];
	public currentDate: Date;
	public isWeekError: any;
	public isError: boolean = true;
	public isUnSuccess: boolean = true;
	public caseIdModel: any;
	private isDisable: boolean;
	private minDate: Date;
	public endByDate: any;
	public enddate: Date = new Date();
	public allowMultiCPTs: boolean = true;
	public isTimeClosed: boolean = false;
	OrderEnum = OrderEnum;
	templateType: string = '';
	public initType: any;
	public followType: any;
	public reType: any;
	public selectedSpecialityId: any;
	public selectedClinicId: any;
	public chart: any;
	public hasInitial = false;
	public hitAPIonEdit = false;
	transportationForm: { pickupForm: any, dropoffForm: any } = { pickupForm: null, dropoffForm: null };
	clinic_location_id: number;
	appointment_id: number;
	public visitTypeId: any;
	physician: any;
	lstPhysician: any[] = [];
	isEditAppointment: boolean = false;
	selectedSpecialtyKey:string='';
	constructor(
		private formBuilder: FormBuilder, public router: Router,
		protected requestService: RequestService, private toastrService: ToastrService,
		public softCaseService: SoftPatientService, private route: ActivatedRoute,
		private storageData: StorageData, private loaderService: LoaderService) { }

	ngOnInit() {
		this.allClinicIds = this.storageData.getFacilityLocations();
		this.startDate = new Date();
		this.option = [
			{ id: RecurrenceRepeatOptionEnum.daily, value: 'Daily' },
			{ id: RecurrenceRepeatOptionEnum.Weekly, value: 'Weekly' },
			{ id: RecurrenceRepeatOptionEnum.Monthly, value: 'Monthly' },
		];
		this.currentDate = new Date();
		this.subscription.push(this.loaderService.startLoader$.subscribe(startLoader => {
			this.startLoader = startLoader;
		})
		)
		this.createForm();
		this.bindPracticeLocation();
		this.bindOnChangeVisitType()
		this.bindPatientCaseInfo();
		this.chart = this.patientId;
	}
	ngOnDestroy(): void {
		unSubAllPrevious(this.subscription);
	}

	identify(index, item) {
		return item.label;
	}
	private createForm() {
		this.myForm = this.formBuilder.group({
			patient: [{ value: '', disabled: true }, Validators.required],
			chart_str: [{ value: '', disabled: true }, Validators.required],
			case_str: [{ value: '', disabled: true }, Validators.required],
			facility_location_id: ['', Validators.required],
			speciality_id: ['', Validators.required],
			doctor_id: [''],
			time_slot: ['', Validators.required],
			appointment_type_id: ['', Validators.required],
			comments: [''],
			apt_date: [this.startDate, Validators.required],
			apt_time: [this.timeRange.startTime, Validators.required],
			priority_id: ['', Validators.required],
			cpt_codes_ids: [],
			physician_id: [],
			reading_provider_id: [],
			dailyMontlyWeeklyOpt: RecurrenceRepeatOptionEnum.daily,
			noOfOccurence: '1',
			endOccureneceDate: '',
			is_transportation: [false],
			start_time: [],
			rangeRecurrence: [],
			rangeRecOption2: [false],
			rangeRecOption1: [false]
		});
	}
	public intializeWeek() {
		this.weekDay[0] = [{ id: 0, name: 'Sun', isChecked: false }];
		this.weekDay[1] = [{ id: 1, name: 'Mon', isChecked: false }];
		this.weekDay[2] = [{ id: 2, name: 'Tue', isChecked: false }];
		this.weekDay[3] = [{ id: 3, name: 'Wed', isChecked: false }];
		this.weekDay[4] = [{ id: 4, name: 'Thu', isChecked: false }];
		this.weekDay[5] = [{ id: 5, name: 'Fri', isChecked: false }];
		this.weekDay[6] = [{ id: 6, name: 'Sat', isChecked: false }];
	}
	getAppointmentTypes() {
		this.subscription.push(this.requestService
			.sendRequest(
				DoctorCalendarUrlsEnum.getAppointmentTypes,
				'GET',
				REQUEST_SERVERS.schedulerApiUrl1,
			)
			.subscribe((res: HttpSuccessResponse) => {
				this.appointmentTypes = res?.result?.data;

				if (this.appointmentTypes?.length && !this.myForm.controls['appointment_type_id'].value) {
					this.myForm.patchValue({
						appointment_type_id: this.appointmentTypes?.[0]?.id
					});
				}

			}));
	}

	getMasterPracticeLocations() {
		let param = {
			facility_location_ids:
				this.allClinicIds && this.allClinicIds.length > 0 ? this.allClinicIds : null,
			speciality_ids: this.myForm.get('speciality_id').value
				? [parseInt(this.myForm.get('speciality_id').value)]
				: null,

			doctor_id: this.myForm.get('doctor_id').value
				? parseInt(this.myForm.get('doctor_id').value)
				: null,
			per_page: Pagination.per_page,
			page: 1,
			pagination: true,
		};
		param = removeEmptyAndNullsFormObject(param);
		this.subscription.push(this.requestService
			.sendRequest(
				AssignSpecialityUrlsEnum.getUserInfobyFacility,
				'POST',
				REQUEST_SERVERS.schedulerApiUrl1,
				param,
			)
			.subscribe((response: HttpSuccessResponse) => {
				this.practiceLocations = [...response.result?.data?.docs];
				if (
					this.practiceLocations &&
					this.practiceLocations.length > 0 &&
					this.myForm.get('facility_location_id').value
				) {
					let selectedpractice = this.practiceLocations.find(
						(practice) => practice.id == parseInt(this.myForm.get('facility_location_id').value),
					);
					if (!selectedpractice) {
						this.myForm.patchValue({ facility_location_id: '' });
					}
				}
				else if (this.myForm.get('doctor_id').value) {
					this.myForm.patchValue({ facility_location_id: this.practiceLocations.length == 1 ? this.practiceLocations[0].id : '' });
					this.setSelectedClinic(this.practiceLocations?.[0]?.id);
				}
			}, error => {
			}))
	}

	setSelectedClinic(clinicId) {
		let selectedClinic = this.practiceLocations?.find(clinic => clinic?.id == clinicId);
		if (selectedClinic) {
			this.selectedClinic = selectedClinic;
		}
		else {
			this.selectedClinic = null
		}

	}

	setSelectedSpecialty(specialtyId) {

		let selectedSpecialty = this.specialities?.find(specialty => specialty?.id == specialtyId)
		if (selectedSpecialty) {
			this.selectedSpecialty = selectedSpecialty;
			this.selectedSpecialtyKey = selectedSpecialty?.speciality_key
		}
		else {
			this.selectedSpecialty = null
			this.selectedSpecialtyKey = ''
		}
		this.setReferringPhyValidation();

	}

	setSelectedVisit(visitTypeId) {
		let selectedvisitType = this.appointmentTypes?.find(visitType => visitType?.id == parseInt(visitTypeId));
		if (selectedvisitType) {
			this.selectedvisitType = selectedvisitType
		}
		else {
			this.selectedvisitType = null
		}
	}

	getMasterSpecialities(byDefaultDuration?, callFrom?: boolean) {
		let param = {
			facility_location_ids: this.myForm.get('facility_location_id').value
				? [parseInt(this.myForm.get('facility_location_id').value)]
				: this.allClinicIds && this.allClinicIds.length > 0
					? this.allClinicIds
					: null,
			doctor_id: this.myForm.get('doctor_id').value
				? parseInt(this.myForm.get('doctor_id').value)
				: null,
			per_page: Pagination.per_page,
			page: 1,
			pagination: true
		};
		param = removeEmptyAndNullsFormObject(param);
		this.subscription.push(this.requestService
			.sendRequest(
				AssignSpecialityUrlsEnum.GetUserInfoBySpecialities,
				'POST',
				REQUEST_SERVERS.schedulerApiUrl1,
				param,
			)
			.subscribe((resp: HttpSuccessResponse) => {
				this.specialities = [...resp?.result?.data?.docs];
				if (this.specialities && this.specialities.length == 1 && !this.myForm.get('speciality_id').value) {
					this.interval = this.specialities?.[0]?.['time_slot'];
					this.setDuration(this.interval, byDefaultDuration)
				}

				if (
					this.specialities &&
					this.specialities.length > 0 &&
					this.myForm.get('speciality_id').value
				) {
					let selectedSpeciality = this.specialities?.find(
						(speciality) => speciality.id == parseInt(this.myForm.get('speciality_id').value),
					);
					if (!selectedSpeciality) {
						this.myForm.patchValue({ speciality_id: null });
						this.setSelectedSpecialty(null)

					}
					else {
						this.setDuration(selectedSpeciality?.time_slot, byDefaultDuration)
					}

				}
				else if (this.myForm.get('doctor_id').value && !byDefaultDuration) {
					this.myForm.patchValue({ speciality_id: this.specialities.length == 1 ? this.specialities?.[0]?.id : null });
					this.setSelectedSpecialty(this.myForm.get('speciality_id').value)
					if (!byDefaultDuration) {
						this.myForm.controls['time_slot'].patchValue(this.durations?.length ? this.durations?.[0] : null);
					}
					this.getDoctorAssign();
				}
				if (!callFrom && isEmptyObject(this.appointment)) {
					this.getVisitTypes(this.selectedSpecialityId);
				}
			}, error => {
				// this.startLoader=false;
			}))
	}

	specialityChange(event) {
		this.selectedSpecialityId = event.target.value ? event.target.value : null;

		this.setSelectedSpecialty(this.selectedSpecialityId);
		this.visitTypeId=null;
		if (!this.selectedSpecialityId) {
			this.durations = []
			this.myForm.controls['time_slot'].patchValue('', { emitEvent: false });
			return;
		}
		for (let i = 0; i < this.specialities.length; i++) {
			if (this.specialities[i].id === parseInt(event.target.value)) {
				this.interval = this.specialities[i]['time_slot'];
				break;
			}
		}
		let temp = 0;
		for (let i = 0; i < 8; i++) {
			temp = temp + this.interval;
			this.durations[i] = temp;
		}

		this.myForm.controls['time_slot'].patchValue(this.durations[0]);
		this.getMasterPracticeLocations();
		this.myForm.get('doctor_id').reset('');
		if (this.myForm.get('facility_location_id').value) {
			this.getDoctorAssign();
		}
		this.getVisitTypes(this.selectedSpecialityId);
	}

	setDuration(timeSlot, byDefaultDuration?) {
		this.interval = timeSlot;
		let temp = 0;
		for (let i = 0; i < 8; i++) {
			temp = temp + this.interval;
			this.durations[i] = temp;
			if (this.specialities.length && !byDefaultDuration) {
				this.myForm.controls['time_slot'].patchValue(this.durations.length ? this.durations[0] : null);
			}
		}

	}
	getMasterProviders() {
		let param = {
			speciality_id: this.myForm.get('speciality_id').value
				? parseInt(this.myForm.get('speciality_id').value)
				: null,
			facility_location_id: this.myForm.get('facility_location_id').value
				? parseInt(this.myForm.get('facility_location_id').value)
				: this.allClinicIds && this.allClinicIds.length > 0
					? this.allClinicIds
					: null
		};
		param = removeEmptyAndNullsFormObject(param);
		this.subscription.push(this.requestService
			.sendRequest(
				AddToBeSchedulledUrlsEnum.get_master_provider,
				'POST',
				REQUEST_SERVERS.schedulerApiUrl1,
				param,
			)
			.subscribe((response: HttpSuccessResponse) => {
				this.doctors = response?.result?.data;
				if (
					this.doctors &&
					this.doctors.length > 0 &&
					this.myForm.get('doctor_id').value
				) {
					let selecteddoctor = this.doctors.find(
						(doctor) => doctor.id == parseInt(this.myForm.get('doctor_id').value),
					);
					if (!selecteddoctor) {
						this.myForm.patchValue({ doctor_id: null });
					}
				}
				else if (this.myForm.get('speciality_id').value) {
					this.myForm.patchValue({ doctor_id: null });

				}
				else if (!this.myForm.get('speciality_id').value) {
					this.myForm.patchValue({ doctor_id: null });
				}
			}, error => {
			}));
	}
	clinicChange(event) {
		this.selectedClinicId = event.target.value ? event.target.value : null;
		this.setSelectedClinic(this.selectedClinicId);
		this.intializeWeek();
		if (
			parseInt(this.myForm.get('dailyMontlyWeeklyOpt').value) === RecurrenceRepeatOptionEnum.daily
		) {
			this.isWeekError = true;
			this.isDisableOption = true;
		} else {
			this.isDisableOption = false;
		}
		this.getMasterSpecialities();
		this.getMInMaxFacilityTime(null,true);
	}

	getSpecialityAndProvider() {
		this.getMasterSpecialities();
		this.getDoctorAssign();
	}

	getfacilityAndProvider() {
		this.getMasterPracticeLocations();
		this.getDoctorAssign();
	}
	getFacilityAndSpeciality(callFrom?: boolean) {
		this.getMasterPracticeLocations();
		this.getMasterSpecialities(null, callFrom);
	}

	public onChangeAptDate(event) {
		if (event.dateValue) {
			this.startDate = new Date(event.dateValue);
			this.isTimeClosed = true;
			this.myForm.get('doctor_id').setValue('');
			this.changeStartDate();
		}
		else {
			this.startDate = null;
			this.myForm.patchValue({
				apt_date: this.startDate
			})
		}
	}

	public changeStartDate() {
		if (this.startDate) {
			this.startDate.setMinutes(0);
			this.startDate.setHours(0);
			this.startDate.setSeconds(0);
			this.startDate.setMinutes(this.timeRange.startTime.getMinutes());
			this.startDate.setHours(this.timeRange.startTime.getHours());
			this.startDate.setSeconds(0);
			this.startDate.setMilliseconds(0);
			this.myForm.patchValue({
				apt_date: this.startDate
			})
		}
		this.startTime = this.timeRange.startTime = new Date(JSON.parse(JSON.stringify(this.startDate)));
		this.ejsTimePicker.refresh();
		this.endTime = new Date(JSON.parse(JSON.stringify(this.startTime)));
		this.endTime.setMinutes(
			JSON.parse(JSON.stringify(this.endTime.getMinutes() + this.interval)),
		);
		this.getDoctorAssign();
		this.myForm.patchValue({
			apt_time: this.timeRange.startTime
		});
	}
	public getMInMaxFacilityTime(startTime?: Date,callDoctors?:boolean) {
		const facilityArray = {
			facility_location_ids: [parseInt(this.myForm.get('facility_location_id').value)],
		};
		this.subscription.push(
			this.requestService
				.sendRequest(
					DoctorCalendarUrlsEnum.getMaxMinTimeOfFacility,
					'POST',
					REQUEST_SERVERS.schedulerApiUrl1,
					facilityArray,
				)
				.subscribe((res: any) => {
					let minmaxtime = res.result.data;
					this.setTimePickerRanges(minmaxtime?.min_time, minmaxtime?.max_time, startTime,callDoctors);
				})
		)
	}
	setTimePickerRanges(start_time: string, end_time: string, sTime: any,callDoctors:boolean) {
		this.specTimeStart = convertUTCTimeToUserTimeZoneByOffset(this.storageData, start_time, this.startDate, true);
		this.specTimeEnd = convertUTCTimeToUserTimeZoneByOffset(this.storageData, end_time, this.endDate, true);
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
		this.timeRange = { start: stDate, startTime: sTime ? sTime : stDate, end: edDate }
		this.ejsTimePicker.value = sTime ? sTime : stDate;
		this.ejsTimePicker.max = edDate;
		this.ejsTimePicker.refresh();
		if(callDoctors){
			this.getDoctorAssign();
		}
	}
	public changeStartTime(event?) {
		if(!this.timeRange.startTime){
		this.isTimeClosed = true;
	}
		if (this.startDate && this.timeRange.startTime) {
			this.startDate.setMinutes(this.timeRange.startTime.getMinutes());
			this.startDate.setHours(this.timeRange.startTime.getHours());
			this.startDate.setSeconds(0);
			this.startDate.setMilliseconds(0);
			this.myForm.patchValue({
				apt_date: this.startDate,
			})
		}
		this.myForm.patchValue({

			apt_time: this.timeRange.startTime
		});
		if(this.timeRange.startTime){
			this.minTime = new Date(this.timeRange.startTime);
			this.getDoctorAssign();
		}
	}
	public getDoctorAssign() {
		if(this.isTimeClosed){
			this.timeRange.startTime  = this.startTime;
			this.isTimeClosed = false;
		}
		this.endTime = new Date(JSON.parse(JSON.stringify(this.timeRange.startTime)));
		this.endTime.setMinutes(JSON.parse(JSON.stringify(this.endTime.getMinutes() + this.interval)));
		if (this.endTime && this.startDate && this.selectedSpecialityId) {
			this.subscription.push(this.requestService.sendRequest(
				DoctorCalendarUrlsEnum.getPartialAvailableDoctors,
				'POST',
				REQUEST_SERVERS.schedulerApiUrl1, {
				end_date: convertDateTimeForSending(this.storageData, new Date(this.endTime)),
				facility_location_id: this.myForm.get('facility_location_id').value
					? parseInt(this.myForm.get('facility_location_id').value)
					: this.allClinicIds && this.allClinicIds.length > 0
						? this.allClinicIds
						: null,
				speciality_id: this.selectedSpecialityId,
				start_date: convertDateTimeForSending(this.storageData, new Date(this.timeRange.startTime)),
			}).subscribe((response: HttpSuccessResponse) => {
				this.doctors = (response?.result?.data) ? response?.result?.data : [];
				if (!this.doctors?.length && this.myForm.get('doctor_id').value) {
					this.myForm.get('doctor_id').setValue('');
				}
			}))
		}
	}

	submit() {
		if (this.myForm.invalid) {
			this.btnSubmit = true;
			return
		}
		if(this.selectedSpecialtyKey == 'diagnostic' && !this.myForm.get('physician_id').value &&  this.btnSubmit) {
			return;
		}
		let form = this.myForm.getRawValue();
		if (this.transportationComponent && this.transportationComponent.transportationForm.invalid) {
			this.transportationComponent.markFormGroupTouched(this.transportationComponent.transportationForm)
			return;
		}

		let transportation = [];

		this.transportationForm = this.getTransportationFormValues();

		if (this.myForm.get('is_transportation').value && this.transportationComponent && !this.transportationForm.pickupForm.type && !this.transportationForm.dropoffForm.type) {
			this.toastrService.error(
				'You have selected transportation. Please select atleast one option Pick Up or Drop Off.', 'Error',
			);
			return;
		}

		if (this.transportationForm) {
			transportation = [
				{ ...this.transportationForm.pickupForm },
				{ ...this.transportationForm.dropoffForm }
			];
		}
		if (this.checkRecExists) {
			if (!this.isRangeRec) {
				if (this.endByCheck) {
					if (this.endByDate) {
						const occurrenceDate = new Date(JSON.parse(JSON.stringify(this.endByDate)));
						occurrenceDate.setHours(23);
						occurrenceDate.setMinutes(59);
						this.startDate.setSeconds(0);
						occurrenceDate.setSeconds(59);
						if (occurrenceDate <= this.startDate) {
							this.toastrService.error(
								'End date of recurrence cannot be equal or less than appointment date',
								'Error',
							);
							return
						} else {
							form['end_date_for_recurrence'] = convertDateTimeForSending(this.storageData, new Date(occurrenceDate));
							form['recurrence_ending_criteria_id'] = parseInt(this.myForm.get('dailyMontlyWeeklyOpt').value);
							if (form['recurrence_ending_criteria_id'] != RecurrenceRepeatOptionEnum.daily) {
								form['days'] = this.dayListArray;
							}
						}
					} else {
						this.toastrService.error('End by date is required', 'Error');
						return
					}
				} else if (this.endAfterCheck) {
					this.startDate.setSeconds(0);
					if (!this.myForm.controls['noOfOccurence'].value) {
						this.toastrService.error('No of occurrences is undefined', 'Error');
						return
					} else {
						form['recurrence_ending_criteria_id'] = parseInt(this.myForm.get('dailyMontlyWeeklyOpt').value);
						form['end_after_occurences'] = parseInt(this.myForm.get('noOfOccurence').value);
						if (form['recurrence_ending_criteria_id'] != RecurrenceRepeatOptionEnum.daily) {
							form['days'] = this.dayListArray;
						}
					}
				} else {
					this.toastrService.error('Select End By or End After condition in Range', 'Error');
					return
				}
			} else {
				this.toastrService.error('Add Range Of Recurrence', 'Error');
				return
			}
		}
		this.clinic_location_id = null;
		delete form.apt_date;
		delete form.apt_time;
		form.appointment_type_id = form.appointment_type_id ? parseInt(form.appointment_type_id) : null;
		form.doctor_id = form.doctor_id ? parseInt(form.doctor_id) : null
		form.facility_location_id = form.facility_location_id ? parseInt(form.facility_location_id) : null;
		form.speciality_id = form.speciality_id ? parseInt(form.speciality_id) : null
		this.startDate.setMinutes(this.timeRange.startTime.getMinutes());
		this.startDate.setHours(this.timeRange.startTime.getHours());
		this.startDate.setSeconds(0);
		this.startDate.setMilliseconds(0);
		let object = {
			start_date_time: convertDateTimeForSending(
				this.storageData,
				new Date(this.startDate),
			),
			confirmation_status: false,
			patient_id: this.patientId,
			case_id: this.caseId,
			case_type_id: this.caseTypeId,
			is_speciality_base: (this.myForm.controls['doctor_id'].value) ? false : true,
			time_zone: this.storageData.getUserTimeZoneOffset(),
			transportation: transportation,
			cpt_codes: form?.cpt_codes_ids
		};
		delete form?.cpt_codes_ids;
		if (!form.comments) {
			form.comments = "N/A"
		}
		let reqObj = { ...form, ...object }

		if (isObjectEmpty(this.appointment)) {
			reqObj.is_soft_registered = true
			object = removeEmptyAndNullsFormObject(reqObj);
			this.addAppointment(object);
		}
		else if (this.appointment && this.appointment.id) {
			reqObj.id = this.appointment.id
			object = removeEmptyAndNullsFormObject(reqObj);
			this.updateAppointment(object)
		}

	}

	addAppointment(object) {
		this.subscription.push(this.requestService.sendRequest(
			CancelAppointmentListUrlsEnum.addAppointment,
			'POST', REQUEST_SERVERS.schedulerApiUrl1,
			object).subscribe((res: HttpSuccessResponse) => {
				if (res?.result?.data) {
					if (!res?.result?.data?.appointments?.length) {
						this.showErrorSuccess(res?.result?.data,'Error');
						return;
					}
					if (this.softCaseService.patientFormValidation) {
						this.showErrorSuccess(res?.result?.data,'Success');
						this.softCaseService.pushClosePopup(true);
						this.softCaseService.patientFormValidation = false;
					} else {
						this.showErrorSuccess(res?.result?.data,'Success');
						this.router.navigate(['/front-desk', 'soft-patient', 'list']);
					}

				}

			}, error => {

			}))
	}

	updateAppointment(object) {
		this.subscription.push(this.requestService.sendRequest(
			DoctorCalendarUrlsEnum.updateAppointment,
			'PUT', REQUEST_SERVERS.schedulerApiUrl1,
			object).subscribe((res: HttpSuccessResponse) => {
				let updatedAppointment = res?.result?.data?.appointment?.[0];
				if (!res?.result?.data?.appointment?.length) {
					this.showErrorSuccess(res?.result?.data,'Error')
					return;
				}
				if (updatedAppointment?.id) {
					if (this.softCaseService.patientFormValidation) {
						this.showErrorSuccess(res?.result?.data,'Success')
						this.softCaseService.pushClosePopup(true);
						this.softCaseService.patientFormValidation = false;
						return;
					}
					if (updatedAppointment?.time_slots != parseInt(this.myForm.controls['time_slot'].value)) {
						this.toastrService.success('Appointment is updated of ' + updatedAppointment?.time_slots + ' min instead of ' + parseInt(this.myForm.controls['time_slot'].value) + ' min', 'Success')
						this.router.navigate(['/front-desk', 'soft-patient', 'list']);
					}
					else {
						this.router.navigate(['/front-desk', 'soft-patient', 'list']);
						this.showErrorSuccess(res?.result?.data,'Success')
					}
				}

				this.btnSubmit = false;
			}))
	}
	showErrorSuccess(data:any,Type){
		if(Type === 'Error'){
			if(data?.msg_alert_1){
				this.toastrService.error(data?.msg_alert_1, 'Error');
			}if(data?.msg_alert_2){
				this.toastrService.error(data?.msg_alert_2, 'Error');
			}
		}else{
			if(data?.msg_alert_1){
				this.toastrService.success(data?.msg_alert_1, 'Success');
			}if(data?.msg_alert_2){
				this.toastrService.success(data?.msg_alert_2, 'Success');
			}
		}
	}
	getAppointmentData(appointment_id: number) {
		this.subscription.push(this.requestService.sendRequest(
			AppointmentUrlsEnum.getAppointmentDetails,
			'GET',
			REQUEST_SERVERS.schedulerApiUrl,
			{ id: appointment_id }
		).subscribe((res: HttpSuccessResponse) => {
			this.isEditAppointment = true;
			let data = res?.result?.data;
			this.appointment.speciality = data?.speciality || null;
			this.appointment.priority_id = data?.priority_id;
			this.selectedSpecialityId = data?.speciality?.id;
			this.selectedSpecialtyKey = data?.speciality?.speciality_key;
			this.appointment.facility_location_id = data?.facility_location?.id;
			this.appointment.doctor_id = (data?.doctor_info?.doctor_id) || "";
			this.appointment.time_slots = this.interval = data?.time_slots;
			this.appointment.id = data?.id;
			this.appointment.comments = data?.comments;
			this.appointment.scheduled_date_time = convertDateTimeForRetrieving(this.storageData, new Date(data?.scheduled_date_time));
			this.visitTypeId = data?.appointment_type?.id;
			this.getVisitTypes(this.selectedSpecialityId); 
			this.setFormValues(this.appointment);
			this.getDropdownLists();
			this.setReferringPhyValidation();
			if (data['physician_clinic']) {
				this.setPhysicianValue(data).then((val)=>{
					setTimeout(()=>{
						if(val){
							this.myForm.controls['is_transportation'].setValue(data?.is_transportation);
							if (data?.transportations?.length) {
								this.setTransportations(data)
							}
						}
					},0)
				});
			}else{
				this.myForm.controls['is_transportation'].setValue(data?.is_transportation);
				if (data?.transportations?.length) {
					this.setTransportations(data)
				}
			}
			if (data?.appointment_cpt_codes?.length) {
				let cpt_codes_ids = data?.appointment_cpt_codes?.map(cpt_codes => cpt_codes.billing_code_id || cpt_codes.id);
				this.selectedMultipleFieldFiter.cpt_codes_ids = [...data?.appointment_cpt_codes];
				this.myForm.get('cpt_codes_ids').setValue(cpt_codes_ids);
			}
			if (data?.reading_provider) {
				this.setReadingProviders(data);
			}
			this.hitAPIonEdit = true;
		}))
	}
	setPhysicianValue(data: any) {
		let promise = new Promise((resolve)=>{
			if (data) this.physician = { ...data?.physician_clinic };
			this.myForm.controls['physician_id'].setValue(this.physician.id);
			this.clinic_location_id = this.clinic_location_id ? this.clinic_location_id : this.physician.clinic_locations_id;
			this.readingPhysicianControl.lists = [{ ...this.physician }];
			this.readingPhysicianControl.formatListing();
			this.readingPhysicianControl.searchForm.patchValue({ 'common_ids': this.physician.id });
			if(this.myForm.controls['physician_id'].value){
				resolve(true);
			}
		})
		return promise;
	}
	setTransportations(data: any) {
		data?.transportations?.map(transobj => {
			if (transobj?.is_pickup) {
				let pickupForm = {
					id: transobj?.id,
					is_pickup: transobj?.is_pickup,
					pick_up_address: '',
					type: transobj?.type,
					comments: transobj?.comments,
					street_address: transobj?.street_address,
					suit: transobj?.suit,
					city: transobj?.city,
					state: transobj?.state,
					zip: transobj?.zip,
					phone: transobj?.phone,
				}
				this.transportationForm.pickupForm = pickupForm
			}
			else if (transobj?.is_dropoff) {
				let dropoffForm = {
					id: transobj?.id,
					is_dropoff: transobj?.is_dropoff,
					dropoff_address: '',
					type: transobj?.type,
					comments: transobj?.comments,
					street_address: transobj?.street_address,
					suit: transobj?.suit,
					city: transobj?.city,
					state: transobj?.state,
					phone: transobj?.phone,
					zip: transobj?.zip,
				}
				this.transportationForm.dropoffForm = dropoffForm
			}
		});
		this.transportationComponent?.bindValuesOnRunTime(this.transportationForm);
	}
	setReadingProviders(data: any) {
		let readingProvider: any = {};
		readingProvider['first_name'] = (data?.reading_provider?.first_name) ? data?.reading_provider?.first_name :
			((data?.reading_provider?.userBasicInfo) ? data?.reading_provider?.userBasicInfo?.first_name : '');
		'';
		readingProvider['middle_name'] = (data?.reading_provider?.middle_name) ? data?.reading_provider?.middle_name :
			((data?.reading_provider?.userBasicInfo) ? data?.reading_provider?.userBasicInfo?.middle_name : '');
		readingProvider['last_name'] = (data?.reading_provider?.last_name) ? data?.reading_provider?.last_name :
			((data?.reading_provider?.userBasicInfo) ? data?.reading_provider?.userBasicInfo.last_name : '');
		readingProvider['full_name'] = readingProvider ? `${readingProvider.first_name || ''}${readingProvider.middle_name ? ' ' + readingProvider.middle_name : ''} ${readingProvider.last_name}` : ''
		readingProvider.id = data?.reading_provider?.id;
		let lstReadingProvider = [{ ...readingProvider }];
		this.selectedMultipleFieldFiter.reading_provider_id = [...lstReadingProvider]
		this.myForm.get('reading_provider_id').setValue(data?.reading_provider?.id);
	}
	getDropdownLists() {
		this.getMasterPracticeLocations();
		this.getMasterSpecialities(true);
		this.getAppointmentTypes();
		this.getAppoiontmentPriorities();
	}

	setFormValues(appointment) {
		this.startDate = this.endDate =  this.endByDate = this.startTime = appointment.scheduled_date_time,
			this.endTime = new Date(JSON.parse(JSON.stringify(this.startTime)));
		this.endTime.setMinutes(JSON.parse(JSON.stringify(this.endTime.getMinutes() + this.interval)));
		this.myForm.patchValue({
			facility_location_id: appointment.facility_location_id ? appointment.facility_location_id : '',
			speciality_id: appointment.speciality ? appointment.speciality.id : '',
			doctor_id: appointment.doctor_id ? appointment.doctor_id : '',
			time_slot: appointment.time_slots,
			appointment_type_id: appointment.type_id,
			comments: appointment.comments,
			apt_date: this.startDate,
			apt_time: this.startTime,
			priority_id: this.appointment.priority_id
		});
		this.getMInMaxFacilityTime(new Date(this.startTime),true);
		//this.getDoctorAssign();
	}
	getAppointmentType(event) {
		if (event) {
			const spec = this.AppointmentType.find(d => d['id'] === Number(event.target.value));
			let index = this.visitTypeData.findIndex(x => x.appointment_type_id === spec.id);
			this.allowMultiCPTs = this.visitTypeData && this.visitTypeData.length > 0 ? this.visitTypeData[index].allow_multiple_cpt_codes == 1 ? true : false : true;
			this.apidefaulthit = true;
		}
		this.isEnableSptCodes();
		this.isEnableReadingProvider();
		this.resetCpt();
		this.resetReadingProvider();
	}
	getVisitTypes(specialty_id) {
		this.AppointmentType = [];
		this.visitTypeData = [];
		this.allowMultiCPTs = true;
		this.typeForAppointment = null;
		this.myForm.get('appointment_type_id').setValue('');
		this.setSelectedVisitType(null);
		this.resetCpt();
		this.resetReadingProvider();
		this.isEnableReadingProvider();
		if (specialty_id) {
			let req = {
				specialty_id: specialty_id
			}
			this.subscription.push(this.requestService
				.sendRequest(
					DoctorCalendarUrlsEnum.specialtyVisitTypes,
					'GET',
					REQUEST_SERVERS.fd_api_url,
					req
				)
				.subscribe((res: HttpSuccessResponse) => {
					this.AppointmentType = res.result.data;
					this.visitTypeData = res && res.result && res.result.data;
					this.AppointmentType = this.AppointmentType?.map(dta => dta.visit_types?.[dta?.visit_types?.length - 1]);
					if (this.visitTypeId) {
						this.typeForAppointment = this.visitTypeId;
						this.allowMultiCPTs = this.visitTypeData?.filter(visitType => visitType?.appointment_type_id === this.visitTypeId)?.[0]?.allow_multiple_cpt_codes == 1 ? true : false
					} else {
						this.typeForAppointment = this.AppointmentType?.length > 0 ? this.AppointmentType?.[0]?.id : null;
						this.allowMultiCPTs = this.visitTypeData?.length > 0 ? this.visitTypeData?.[0]?.allow_multiple_cpt_codes == 1 ? true : false : true;
					}
					this.isEnableSptCodes();
					this.isEnableReadingProvider();
					for (let i = 0; i < this.AppointmentType.length; i++) {
						if (this.AppointmentType[i].slug == 'initial_evaluation') {
							this.initType = this.AppointmentType[i].id;
						} else if (this.AppointmentType[i].slug == 're_evaluation') {
							this.reType = this.AppointmentType[i].id;
						} else if (this.AppointmentType[i].slug == 'follow_up') {
							this.followType = this.AppointmentType[i].id;
						}
						else{
							this.initType = null;
							this.reType = null;
							this.followType = null;
						} 
					}
					if(isObjectEmpty(this.appointment)){
						this.selectAptType();
					}
				}));
		}

	}
	selectAptType() {
		if (this.chart && this.caseId && this.selectedSpecialityId) {
			this.subscription.push(this.requestService
				.sendRequest(DoctorCalendarUrlsEnum.checkInitialAppointment, 'POST', REQUEST_SERVERS.schedulerApiUrl1, {
					patient_id: this.chart,
					case_id: this.caseId,
					speciality_id: parseInt(this.selectedSpecialityId),
				})
				.subscribe((response: HttpSuccessResponse) => {
					this.hasInitial = response.result.data.initial_check == true ? true : false;
					if (response.result.data.initial_check) {
						this.typeForAppointment = this.followType ? this.followType : this.typeForAppointment;
						this.myForm.get('appointment_type_id').setValue(this.typeForAppointment);
						this.setSelectedVisitType(this.typeForAppointment)
					} else {
						this.typeForAppointment = this.initType ? this.initType : this.typeForAppointment;
						this.myForm.get('appointment_type_id').setValue(this.typeForAppointment);
						this.setSelectedVisitType(this.typeForAppointment)
					}
					this.isEnableReadingProvider();
				}));
		}
	}
	isEnableSptCodes() {
		let selectedvisitType = this.AppointmentType?.find(visitType => visitType?.id == this.typeForAppointment);
		if (selectedvisitType) {
			this.enableCptCodes = selectedvisitType?.enable_cpt_codes;
			this.setSelectedVisitType(this.typeForAppointment)

		}
		else {
			this.resetCpt();
			this.enableCptCodes = false;

		}
	}

	setSelectedVisitType(visitTypeId) {
		let selectedvisitType = this.AppointmentType.find(visitType => visitType.id == parseInt(visitTypeId));
		if (selectedvisitType) {
			this.selectedvisitType = selectedvisitType
		}
		else {

			this.selectedvisitType = null

		}
	}

	isEnableReadingProvider() {

		let selectedvisitType = this.AppointmentType.find(visitType => visitType.id == this.typeForAppointment);
		if (selectedvisitType) {
			this.enableReadingProvider = selectedvisitType.is_reading_provider
		}
		else {
			this.resetReadingProvider()
			this.enableReadingProvider = false;
		}
	}
	public endAfter(e) {
		if (e.target.checked) {
			this.endAfterCheck = true;
			this.endByCheck = false;
			this.myForm.controls['rangeRecOption1'].setValue(true);
			this.endAfterClickChange();
		} else {
			this.endAfterCheck = false;
		}
	}
	public endBy(e) {
		if (e.target.checked) {
			this.endByCheck = true;
			this.endAfterCheck = false;
			(<HTMLInputElement>document.getElementById('rangeRecurrence')).checked = true;
		} else {
			this.endByCheck = false;
		}
	}
	endAfterClickChange() {
		(<HTMLInputElement>document.getElementById('rangeRecurrence')).checked = true;
		(<HTMLInputElement>document.getElementById('rangeRecOption1')).checked = true;
		this.myForm.controls['rangeRecOption1'].setValue(true);
		this.endByCheck = false;
		this.endAfterCheck = true;
		this.myForm.controls['noOfOccurence'].enable();

	}
	public changeWeek(event, val) {
		if (val.isChecked == true) {
			val.isChecked = false;
		} else {
			val.isChecked = true;
		}
		event.target.checked = val.isChecked;
		val = parseInt(val.id);
		if (event.target.checked) {
			this.dayListArray.push(val);
			this.dayListArray = Array.from(new Set(this.dayListArray));
			this.isWeekError = true;
		} else {
			this.dayListArray = Array.from(new Set(this.dayListArray));
			for (let i = 0; i < this.dayListArray.length; i++) {
				if (this.dayListArray[i] === val) {
					this.dayListArray.splice(i, 1);
				}
			}
		}
	}
	endbyClickChange() {
		(<HTMLInputElement>document.getElementById('rangeRecurrence')).checked = true;
		(<HTMLInputElement>document.getElementById('rangeRecOption2')).checked = true;
		this.endByCheck = true;
		this.endAfterCheck = false;
		this.myForm.controls['noOfOccurence'].disable();
	}
	public rangeRecuurence(event) {
		this.isError = true;
		this.isUnSuccess = true;
		this.minDate = new Date(this.startDate);
		if (this.myForm.controls['rangeRecurrence'].value) {
			this.isRangeRec = false;
			this.myForm.controls['endOccureneceDate'].enable();
			this.myForm.controls['noOfOccurence'].enable();
		}
		if (event.target.checked) {
			this.isRangeRec = false;
			this.myForm.controls['endOccureneceDate'].enable();
			this.myForm.controls['noOfOccurence'].enable();
			this.isDisable = true;
		} else {
			this.isDisable = false;
			this.isRangeRec = true;
		}
		this.hideRangeRec = false;
	}
	bindPatientCaseInfo() {
		this.subscription.push(this.softCaseService.patientCaseInfo.subscribe((res) => {
			if (res) {
				this.chart = res?.patient?.id;
				var startString = '000-00-';
				var receivedString = JSON.stringify(res?.patient?.id);
				var finalStr = startString + receivedString.padStart(4, '0');
				this.myForm.get('chart_str').setValue(finalStr);
				this.myForm.get('patient').setValue(res?.patient?.first_name + ' ' + (res?.patient?.middle_name || '') + ' ' + res?.patient?.last_name);
				this.myForm.get('case_str').setValue(res?.id + '' + '(' + res?.case_type?.name + ')' + ' ' + (moment(new Date(res?.accident?.accident_information?.accident_date)).format('MM/DD/YYYY')));
				this.caseTypeId = res?.case_type_id;
			}
		}))
	}
	selectionOnValueChange(e: any, _form: FormGroup, Type?) {
		if (!isArray(e && e.formValue ? e.formValue : null) && Type == 'cpt_codes_ids') {
			_form.controls[Type].setValue(e && e.formValue ? [e.formValue] : null);
		} else {
			_form.controls[Type].setValue(e && e.formValue ? e.formValue : null);
			if (Type === 'physician_id'){
				this.setReferringPhyValidation();
				this.clinic_location_id = e && e.data && e.data.realObj ? e.data.realObj.clinic_location_id : null;
			}
		}
		if (Type == 'template_id') {
			this.templateType = e.data && e.data.realObj && e.formValue ? e.data.realObj.template_type : null
		}
	}
	public onChangeEndByDate(event) {
		if (event.dateValue) {
			this.endByDate = new Date(event.dateValue);
		}
		else {
			this.endByDate = null;
		}
	}
	public changeRepeatEvery() {
		this.intializeWeek();
		this.dayListArray = [];
		if (
			parseInt(this.myForm.get('dailyMontlyWeeklyOpt').value) === RecurrenceRepeatOptionEnum.daily
		) {
			this.isWeekError = true;
			this.isDisableOption = true;
		} else {
			this.isDisableOption = false;
		}
	}
	public RecurrenceDoc(event) {
		if (event.target.checked) {
			this.checkRecExists = true;
			this.isShowRecuurenceBefore = false;
			this.hideRangeRec = false;
			this.endAfterCheck = false;
		} else {
			this.checkRecExists = false;
			this.isShowRecuurenceBefore = true;
			this.hideRangeRec = true;
			this.myForm.controls['endOccureneceDate'].setValue(new Date());
			this.myForm.controls['noOfOccurence'].setValue(1);
			this.endAfterCheck = false;
			this.endByCheck = false;
			(<HTMLInputElement>document.getElementById('rangeRecurrence')).checked = false;
			(<HTMLInputElement>document.getElementById('rangeRecOption2')).checked = false;
			(<HTMLInputElement>document.getElementById('rangeRecOption1')).checked = false;
		}
		if (
			parseInt(this.myForm.get('dailyMontlyWeeklyOpt').value) === RecurrenceRepeatOptionEnum.daily
		) {
			this.isDisableOption = true;
		} else {
			this.isDisableOption = false;
		}
		if (this.myForm.controls['rangeRecurrence'].value) {
			this.isRangeRec = false;
			this.myForm.controls['noOfOccurence'].enable();
			if (event.target.checked) {
				this.isShowRecuurenceBefore = false;
				this.hideRangeRec = false;
			} else {
				this.isShowRecuurenceBefore = true;
				this.hideRangeRec = true;
			}
		} else {
			this.isRangeRec = false;
			this.myForm.controls['noOfOccurence'].enable();

		}
	}
	getTransportationFormValues() {
		if (this.myForm.get('is_transportation').value) {
			let transportationFormValues = this.transportationComponent.transportationForm.value;
			return transportationFormValues
		}
		else {
			return null;
		}

	}
	getTouched(event: any, label) {
		//if (label === 'reading_provider_id' && !event?.onclose) {
		//	this.readingProviderControl?.selectedItemAPICall('', 1, 'search');
		// } else if (label === 'physician_id' && !event?.onclose) {
		// 	this.readingPhysicianControl?.selectedItemAPICall('', 1, 'search');
		// } else if (label === 'cpt_codes_ids' && !event?.onclose) {
		// 	this.cptCodeControlNgSelect?.selectedItemAPICall('', 1, 'search')
		// } else 
		if (label === 'cpt_codes_ids') {
			let index = this.visitTypeData.findIndex(x => x.appointment_type_id === parseInt(this.myForm.controls['appointment_type_id'].value));
			this.allowMultiCPTs = this.visitTypeData && this.visitTypeData.length > 0 ? this.visitTypeData[index].allow_multiple_cpt_codes == 1 ? true : false : true;
		}
	}
	resetCpt() {
		this.eventsSubjectCpt.next(true);
		this.myForm.get('cpt_codes_ids').reset(null, { emitEvent: false })
	}

	resetReadingProvider() {
		this.eventsSubjectReadingProvider.next(true);
		this.readingPhysicianControl.lists = [];
		this.myForm.get('reading_provider_id').reset(null, { emitEvent: false })
	}
	bindPracticeLocation() {
		this.myForm.get('facility_location_id').valueChanges.subscribe(value => {
			this.setSelectedClinic(value);
		})
	}

	bindOnChangeVisitType() {
		this.myForm.get('appointment_type_id').valueChanges.subscribe(value => {
			this.setSelectedVisit(value);
		})
	}

	getAppoiontmentPriorities() {
		this.subscription.push(this.requestService
			.sendRequest(
				DoctorCalendarUrlsEnum.getAppointmentPriority,
				'GET',
				REQUEST_SERVERS.schedulerApiUrl1,
			)
			.subscribe((res: HttpSuccessResponse) => {
				this.AppointmentPriorities = res?.result?.data;
				if (this.AppointmentPriorities?.length) {
					this.myForm.patchValue({ 'priority_id': this.AppointmentPriorities[0]?.id });
					this.myForm.controls['priority_id'].disable();
				}
			}));
	}
	removeControlValue(controlName) {
		this.myForm.get(controlName).reset();
		if (controlName == 'speciality_id') {
			this.myForm.get('doctor_id').reset();
			this.getDoctorAssign();
			this.getMasterSpecialities();
		}
		if ((this.myForm.get('doctor_id').value == null || this.myForm.get('doctor_id').value == '') && (this.myForm.get('speciality_id').value == null || this.myForm.get('speciality_id').value == '')) {
			this.getMasterPracticeLocations();
		}
	}


	Back() {
		this.back.emit(true)
	}
	setReferringPhyValidation()
	{
		if(this.selectedSpecialtyKey == 'diagnostic')
		{
			this.myForm.get('physician_id').setValidators(Validators.required);
			this.myForm.get('physician_id').updateValueAndValidity();
		}
		else
		{
			this.myForm.get('physician_id').clearValidators();
			this.myForm.get('physician_id').updateValueAndValidity();
		}
	}
}
