import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { Logger } from '@nsalaun/ng-logger';
import { MainService } from '@appDir/shared/services/main-service';
import {
	PastMedicalHistory,
	MedicalSession,
} from '@appDir/medical-doctor/models/common/commonModels';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { Router } from '@angular/router';
import { CarryForwardService } from '@appDir/medical-doctor/services/carry-forward/carry-forward.service';
import { ToastrService } from 'ngx-toastr';
import { panelLinks } from '@appDir/medical-doctor/models/panel/panel';
import { MDService } from '@appDir/medical-doctor/services/md/medical-doctor.service';
import { MedicalDoctorAbstract } from '@appDir/medical-doctor/medical-doctor-abstract/medical-doctor-abstract';
import { convertDateTimeForSending, getObjectChildValue } from '@appDir/shared/utils/utils.helpers';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { AppointmentUrlsEnum } from '@appDir/shared/modules/appointment/appointment-urls-enum';
import { DoctorCalendarUrlsEnum } from '@appDir/shared/modules/doctor-calendar/doctor-calendar-urls-enum';
import { Subscription } from 'rxjs';
import { CalendarMonthService } from '@appDir/shared/modules/doctor-calendar/utils/my-calendar/src/modules/month/calendar-month.service';
import { AppointmentModalDialogService } from '@appDir/shared/modules/doctor-calendar/utils/my-calendar/src/modules/month/appointment-modal-dialog.service';

@Component({
	selector: 'app-past-med-history',
	templateUrl: './past-med-history.component.html',
	styleUrls: ['./past-med-history.component.scss'],
})
export class PastMedHistoryComponent extends MedicalDoctorAbstract implements OnInit {
	@Input() data: Object;
	@Input() diseases: Object;
	@Input() allergies: Object;
	@Output() nextPage = new EventEmitter();
	@Output() previousPage = new EventEmitter();
	@Input() drugs: any;
	// maxLength = 511;
	public currentScreen = 'pastMedicalHistory';
	form: FormGroup;
	public apptdata:any;
	subscription: Subscription[]=[];
	fromRoute: string;
	// constructor(
	//   public fb: FormBuilder,
	//   private MDService: MDService,
	//   private logger: Logger,
	//   private mainService: MainService) { }

	constructor(
		public mainService: MainService,
		protected mdService: MDService,
		protected storageData: StorageData,
		protected toastrService: ToastrService,
		protected requestService: RequestService,
		protected fb: FormBuilder,
		protected logger: Logger,
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
			carryForwardService,
		);
	}

	public ngOnInit() {
		this.fromRoute = localStorage.getItem('routeFrom');
		this.subscribeCarryForward();
		this.link = panelLinks.md.leftPanelRE.find((link) => {
			return link.slug == this.currentScreen;
		});
		if (this.link &&this.link.carryForwarded){
		this.link.carryForwarded = false;
		}
		this.apptdata =  this.mainService.getCurrentEvaluedApptAData();
		// this.formData = { "diseases": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25], "diseasesComment": "CARRY FORWARDED DATA", "previousInjuries": "CARRY FORWARDED DATA", "allergies": [1, 2, 3, 4, 5, 6, 7], "otherAllergies": null, "hasOtherAllergies": true, "noMedications": true, "medications": null, "noPreviousSurgeries": true, "previousSurgeries": null, "familyHistory": "CARRY FORWARDED DATA", "socialHistory": "CARRY FORWARDED DATA", "familyHistoryNoncontributory": true }
	}

	public initializeForm(data = null) {
		;
		// this.data['medications'] = [{id:1,display: "ponstan", value:"ponstan" }];
		this.form = this.fb.group({
			diseasesChecked: [data && data['diseases'] && data['diseases'].length > 0 ? true : false],
			diseases: this.createDiseases(data && data['diseases'] ? data['diseases'] : null),
			diseasesComment: [
				data ? data['diseasesComment'] : null,
				[Validators.maxLength(this.maxLength)],
			],
			previousInjuriesChecked: [
				data && data['previousInjuries'] && data['previousInjuries'].length > 0 ? true : false,
			],
			previousInjuries: [data ? data['previousInjuries'] : null],
			allergies: this.createAllergies(data ? data['allergies'] : null),
			allergiesChecked: [data && data['allergies'] && data['allergies'].length > 0 ? true : false],
			hasOtherAllergies: [data && data['hasOtherAllergies'] ? true : false],
			otherAllergies: [data ? data['otherAllergies'] : null],
			medications: [data && data['medications'] ? data['medications'] : ''],
			previousSurgeries: [data && data['previousSurgeries'] ? data['previousSurgeries'] : ''],
			noMedications: [getObjectChildValue(data, false, ['medications']) === null ? true : false],
			noPreviousSurgeries: [
				getObjectChildValue(data, false, ['previousSurgeries']) === null ? true : false,
			],
			familyHistory: [data ? data['familyHistory'] : null],
			familyHistoryNoncontributory: [data ? data['familyHistoryNoncontributory'] : null],
			socialHistory: [data ? data['socialHistory'] : null],
		});

		
		if (!this.mainService.isenableSaveRecordMedicalDoctor()){
			this.form.disable();
		}
	
		this.mainService.sliceStrings(this.form, 'diseasesComment', this.maxLength);
	}
	ngOnChanges() {
		this.initializeForm(this.data);
	}

	isDiseaseChecked(data, id) {
		if (!data) {
			return false;
		}

		for (let i in data) {
			if (id == data[i]) {
				return true;
			}
		}
		return false;
	}
	createDiseases = (data) => {
		let formdata = this.fb.array([]);
		for (let x in this.diseases) {
			let form :any = this.fb.group({
				id: [this.diseases[x].id],
				name: [this.diseases[x].disease],
				checked: [this.isDiseaseChecked(data, this.diseases[x].id)],
			});
			formdata.push(
				form
			);
		}
		return formdata;
	};
	isAllergyChecked(data, id) {
		if (!data) {
			return false;
		}

		for (let i in data) {
			if (id == data[i]) {
				return true;
			}
		}
		return false;
	}
	createAllergies(data) {
		let formdata = this.fb.array([]);
		for (let x in this.allergies) {
			let form :any = this.fb.group({
				id: [this.allergies[x].id],
				name: [this.allergies[x].allergy],
				checked: [this.isAllergyChecked(data, this.allergies[x].id)],
			});

			formdata.push(
				form
			);
		}
		return formdata;
	}

	ngOnDestroy() {
		// if ((this.form.touched && this.form.dirty) || this.carryForwarded) {
		let data = this.form.getRawValue();
		data.diseases = data.diseases
			.filter((data) => {
				return data.checked == true;
			})
			.map((data) => {
				return data.id;
			});
		data.allergies = data.allergies
			.filter((data) => {
				return data.checked == true;
			})
			.map((data) => {
				return data.id;
			});
		let pastMedicalHistory = new PastMedicalHistory(data);
		let session: MedicalSession = new MedicalSession({
			pastMedicalHistory: pastMedicalHistory,
		});
		this.mdService.savePastMedicalHistory(session);
		if(this._route.url == '/scheduler-front-desk/doctor-calendar'){
			if(this.apptdata?.evalFrom == 'monthview'){
				this.navigateBackToSameState();
			}
		}
		// }
	}
	getAllergiesControl() {
		return <FormArray>this.form.controls['allergies']['controls'];
	}
	submit = () => {
		this.nextPage.emit();
	};
	next() { }

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
			this.subscription.push(this.requestService
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
			this.subscription.push( this.requestService
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
