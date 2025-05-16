import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MainService } from '@shared/services/main-service';
import { MedicalSession, WorkStatus } from '@appDir/medical-doctor/models/common/commonModels';
import { MDService } from '@appDir/medical-doctor/services/md/medical-doctor.service';
import {  changeDateFormat, convertDateTimeForSending, getObjectChildValue, isValidDate, removeEmptyAndNullsFormObject } from '@appDir/shared/utils/utils.helpers';
import { MedicalDoctorAbstract } from '@appDir/medical-doctor/medical-doctor-abstract/medical-doctor-abstract';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { ToastrService } from 'ngx-toastr';
import { RequestService } from '@appDir/shared/services/request.service';
import { Router } from '@angular/router';
import { CarryForwardService } from '@appDir/medical-doctor/services/carry-forward/carry-forward.service';
import { planOfCareTabs } from '@appDir/medical-doctor/models/panel/panel';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { AppointmentUrlsEnum } from '@appDir/shared/modules/appointment/appointment-urls-enum';
import { DoctorCalendarUrlsEnum } from '@appDir/shared/modules/doctor-calendar/doctor-calendar-urls-enum';
import { CalendarMonthService } from '@appDir/shared/modules/doctor-calendar/utils/my-calendar/src/modules/month/calendar-month.service';
import { AppointmentModalDialogService } from '@appDir/shared/modules/doctor-calendar/utils/my-calendar/src/modules/month/appointment-modal-dialog.service';

@Component({
	selector: 'app-shared-plan-of-care-cont',
	templateUrl: './shared-plan-of-care-cont.component.html',
	styleUrls: ['./shared-plan-of-care-cont.component.scss'],
})
export class SharedPlanOfCareContComponent extends MedicalDoctorAbstract
	implements OnInit, OnDestroy {
	currentDate: Date = new Date();
	@Input() gender;
	@Input() data;
	@Input() visitType: string;
	@Output() nextPage = new EventEmitter();
	@Output() previousPage = new EventEmitter();
	form: FormGroup;
	workResponse: any = new Object();
	currentScreen: string = 'workStatus';
	public apptdata:any;
	fromRoute: string;

	constructor(
		public mainService: MainService,
		protected mdService: MDService,
		protected storageData: StorageData,
		protected toastrService: ToastrService,
		protected requestService: RequestService,
		protected fb: FormBuilder,
		protected _route: Router,
		public carryForwardService: CarryForwardService,
		public monthService: CalendarMonthService,
		public appModelDialogService:AppointmentModalDialogService
	) {
		super(
			mainService,
			requestService,
			storageData,
			mdService,
			toastrService,
			fb,
			_route,
			// _confirmation,
			carryForwardService,
		);
	}
	onWorkStatusChange($event, reset = true) {
		console.table($event);
		;
		Object.assign(this.workResponse, { case: $event });
		Object.assign(this.workResponse, { values: {} });
		// this.form.controls[this.workResponse.case].setValue(value, {emitEvent: false})

		for (let i in this.form['controls']) {
			if (this.workResponse.case !== i) {
				for (let j in this.form.controls[i]['controls']) {
					if (reset) {
						this.form.controls[i]['controls'][j].setValue('', { emitEvent: false });
						this.form.controls[i]['controls'][j].markAsDirty();
					}
					this.form.controls[i]['controls'][j].disable();
				}
				// console.log(this.form['controls'][].value);
			} else {
				for (let j in this.form.controls[i]['controls']) {
					if (reset) {
						this.form.controls[i]['controls'][j].setValue('', { emitEvent: false });
						this.form.controls[i]['controls'][j].markAsDirty();
					}
					this.form.controls[i]['controls'][j].enable();
				}
			}
		}
		// console.log($event);
		// console.log(this.form.get($event));
		/*Object.keys(this.form.get($event)['controls']).forEach(key => {
         console.log(key);
         });
         console.log(this.workResponse);*/
	}

	ngOnInit() {
		this.fromRoute = localStorage.getItem('routeFrom');
		this.subscribeCarryForward();
		this.link = planOfCareTabs.find((link) => {
			return link.slug == this.currentScreen;
		});
		this.link.carryForwarded = false;
		this.apptdata =  this.mainService.getCurrentEvaluedApptAData();
	}
	ngOnChanges() {
		this.initializeForm(this.data);
	}
	initializeForm(data) {
		;
		this.form = this.fb.group({
			comments: [getObjectChildValue(data, '', ['comments'])],
			returnedToWork: [getObjectChildValue(data, '', ['returnedToWork'])], // has return to work or not
		});

		// if (this.visitType !== 'reEvaluation') {
		this.form.addControl(
			'outOfWorkSince',
			this.fb.group({
				outOfWorkDate: [
					{ value: getObjectChildValue(data, null, ['outOfWorkDate']), disabled: true },
				],
			}),
		);
		this.form.addControl(
			'outOfWorkSinceAndReturnedSince',
			this.fb.group({
				outOfWorkDate: [
					{ value: getObjectChildValue(data, null, ['outOfWorkDate']), disabled: true },
				],
				returnedToWorkDate: [
					{ value: getObjectChildValue(data, null, ['returnedToWorkDate']), disabled: true },
				],
				limitations: [{ value: getObjectChildValue(data, '', ['limitations']), disabled: true }],
			}),
		);
		this.form.addControl(
			'outOfWorkSinceAndCanReturnSinceWithLimitations',
			this.fb.group({
				outOfWorkDate: [
					{ value: getObjectChildValue(data, null, ['outOfWorkDate']), disabled: true },
				],
				returnedToWorkDate: [
					{ value: getObjectChildValue(data, null, ['returnedToWorkDate']), disabled: true },
				],
				limitations: [{ value: getObjectChildValue(data, '', ['limitations']), disabled: true }],
			}),
		);
		this.form.addControl(
			'outOfWorkSinceAndCanReturnSinceWithNoLimitations',
			this.fb.group({
				outOfWorkDate: [
					{ value: getObjectChildValue(data, null, ['outOfWorkDate']), disabled: true },
				],
				returnedToWorkDate: [
					{ value: getObjectChildValue(data, null, ['returnedToWorkDate']), disabled: true },
				],
			}),
		);
		this.form.addControl(
			'outOfWorkSinceAndNotCantReturnToWorkDueToLimitations',
			this.fb.group({
				outOfWorkDate: [
					{ value: getObjectChildValue(data, null, ['outOfWorkDate']), disabled: true },
				],
				limitations: [{ value: getObjectChildValue(data, '', ['limitations']), disabled: true }],
			}),
		);
		console.table(data);
		;
		setTimeout(() => {
			this.onWorkStatusChange(getObjectChildValue(data, '', ['case']), false);
		}, 200);

		if (!this.mainService.isenableSaveRecordMedicalDoctor()){
			this.form.disable();
		}

	

		let workResponseData: any = removeEmptyAndNullsFormObject(data || {});
		if (workResponseData.values) {
			workResponseData.values = removeEmptyAndNullsFormObject(workResponseData.values);
		}
		if (workResponseData) {
			this.workResponse = workResponseData;
			this.form.get('returnedToWork').setValue(workResponseData.case);
			if (workResponseData.values && Object.keys(workResponseData.values).length > 0) {
				this.form
					.get([workResponseData.case])
					.patchValue(getObjectChildValue(workResponseData, '', ['values']));
				this.form.get([workResponseData.case]).enable();
			}
		}

		this.form.valueChanges.subscribe((change) => {
			if (this.workResponse.case) {
				//  console.log(change[this.workResponse.case]);
				this.workResponse.values = change[this.workResponse.case];
				for (let value in change[this.workResponse.case]) {
					let mv = change[this.workResponse.case][value];
					if (isValidDate(mv)) {
						this.workResponse.values[value] = changeDateFormat(mv);
						// alert(changeDateFormat(mv));
					}
				}
				;
			}
		});
	}

	ngOnDestroy(): void {
		this.workResponse.comments = this.form.get('comments').value;
		let session: MedicalSession = new MedicalSession({
			workStatus: new WorkStatus(this.workResponse),
		});

		this.mdService.saveWorkStatus(session);
		console.log(this._route.url)
		if(this._route.url == '/scheduler-front-desk/doctor-calendar'){
			if(this.apptdata?.evalFrom == 'monthview'){
				this.navigateBackToSameState();
			}
		}
	}

	next = () => {
		// this.ngOnDestroy();
		this.nextPage.emit();
	};

	back() {
		this.previousPage.emit();
	}
	saveForLater() {
		this.fromRoute === 'provider_calendar' ?
            this._route.navigate(['/scheduler-front-desk/doctor-calendar']) : this._route.navigate(['/front-desk/cases/edit/' + this.fromRoute + '/scheduler']);
	}
	navigateBackToSameState() {
		let loggedUserID = JSON.stringify(this.storageData.getUserId());
		let date = new Date(this.apptdata.start);
        let st = new Date(date);
        st.setMinutes(0);
        st.setHours(0);
        st.setSeconds(0);
        let ed = new Date(date);
        ed.setMinutes(59);
        ed.setHours(23);
        ed.setSeconds(59);
		if(this.apptdata.available_doctor_is_provider_assignment){
			this.subscriptions.push(this.requestService
		  .sendRequest(
			DoctorCalendarUrlsEnum.getAppointmentsofDoctor,
			'POST',
			REQUEST_SERVERS.schedulerApiUrl1,
			{
			  start_date: convertDateTimeForSending(this.storageData,st),
			  end_date: convertDateTimeForSending(this.storageData,ed),
			  facility_location_ids: [this.apptdata.facility_id],
			  doctor_ids:  [this.apptdata.doctor_id],
			  speciality_ids: [this.apptdata.speciality_id],
			  date_list_id: this.apptdata.date_list_id
			},
	
		  ).subscribe(res => {
			  if(res && res['result'] && res['result']['data']&& res['result']['data']['facility'] && res['result']['data']['facility'].length){
				let appotdata = res['result']['data']['facility'] && res['result']['data']['facility'][0];
			  this.openAppointments({appointments : appotdata['availibilities'][0]['appointments'],
			  date_list_id:appotdata['availibilities'][0]['date_list_id'],
			  facility_id:appotdata['availibilities'][0]['facility_location_id'],
			  color:appotdata['color'],
			  facility_name :appotdata['facility_name'],
			  facility_qualifier:appotdata['facility_qualifier'],
			  doctor_id:appotdata['availibilities'][0]['doctor_id'],
			});
		}else{
		  this.openAppointments({appointments : []})
		}
	  }));
		}else{
			this.subscriptions.push( this.requestService
				.sendRequest(
				  DoctorCalendarUrlsEnum.getSpecialityAppoinments,
				  'POST',
				  REQUEST_SERVERS.schedulerApiUrl1,
				  {
					start_date: convertDateTimeForSending(this.storageData,st),
					end_date: convertDateTimeForSending(this.storageData,ed),
					facility_location_ids: [this.apptdata.facility_id],
					speciality_ids: [this.apptdata.speciality_id],
					date_list_id: this.apptdata.date_list_id
				  },
				).subscribe(res => {
				  if(res && res['result'] && res['result']['data']&& res['result']['data'][0]['availibilities']){
					let appotdata = res['result']['data'].length && res['result']['data'][0];
				  this.openAppointments({appointments : appotdata['availibilities'][0]['appointments'],
				  date_list_id:appotdata['availibilities'][0]['date_list_id'],
				  facility_id:appotdata['availibilities'][0]['facility_location_id'],
				  color:appotdata['color'],
				  facility_name :appotdata['facility_name'],
				  facility_qualifier:appotdata['facility_qualifier'],
				  doctor_id:appotdata['availibilities'][0]['doctor_id'],
				  });
				}else{
				this.openAppointments({appointments : []})
				}
			}));
		}
	  }
	  openAppointments(appointment) {
		this.monthService.appointments = { ...appointment };
		this.appModelDialogService.openDialog().result.then(res => {
		  this.mainService.setOneDayAppointmentsData(res);
		});
	  }
	  public editAppointment(appId) {
		return this.requestService
			.sendRequest(
			AppointmentUrlsEnum.getAppointmentDetails,
			'GET',
			REQUEST_SERVERS.schedulerApiUrl,
			{id:appId}
		)
	}
}
