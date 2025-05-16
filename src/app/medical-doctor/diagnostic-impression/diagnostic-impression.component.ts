import {
	Component,
	OnInit,
} from '@angular/core';
import {
	FormArray,
	FormBuilder,
	FormControl,
} from '@angular/forms';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { Logger } from '@nsalaun/ng-logger';
import { MainService } from '@shared/services/main-service';

import { SeededInfo } from '../md-shared/seededInfo';
import { MedicalDoctorAbstract } from '../medical-doctor-abstract/medical-doctor-abstract';
import {
	Appointment,
	MedicalSession,
} from '../models/common/commonModels';
import { DiagnosticImpression } from '../models/initialEvaluation/initialEvaluationModels';
import { MdLinks } from '../models/panel/model/md-links';
import { panelLinks } from '../models/panel/panel';
import { CarryForwardService } from '../services/carry-forward/carry-forward.service';
import { MDService } from '../services/md/medical-doctor.service';
import { Code } from './model/code';
import { convertDateTimeForSending, getObjectChildValue, unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { AppointmentUrlsEnum } from '@appDir/shared/modules/appointment/appointment-urls-enum';
import { DoctorCalendarUrlsEnum } from '@appDir/shared/modules/doctor-calendar/doctor-calendar-urls-enum';
import { CalendarMonthService } from '@appDir/shared/modules/doctor-calendar/utils/my-calendar/src/modules/month/calendar-month.service';
import { AppointmentModalDialogService } from '@appDir/shared/modules/doctor-calendar/utils/my-calendar/src/modules/month/appointment-modal-dialog.service';

@Component({
	selector: 'app-diagnostic-impression',
	templateUrl: './diagnostic-impression.component.html',
	styleUrls: ['./diagnostic-impression.component.scss'],
})
export class DiagnosticImpressionComponent extends MedicalDoctorAbstract implements OnInit {
	public favoriteCodes: Code[] = [];
	public currentScreen = 'diagnosticImpression';
	public icd10_codes: FormArray;
	public case_type_slug:string;
	public apptdata:any;
	fromRoute: any;
	/**
	 * Creates an instance of diagnostic impression component.
	 * @param mainService
	 * @param mdService
	 * @param storageData
	 * @param toastrService
	 * @param requestService
	 * @param fb
	 * @param logger
	 * @param _route
	 * @param _confirmation
	 * @param carryForwardService
	 */
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

	/**
	 * on init
	 */
	ngOnInit() {
		this.fromRoute = localStorage.getItem('routeFrom');
		this.subscribeCarryForward();
		this.link = panelLinks.md.leftPanelRE.find((link) => {
			return link.slug == this.currentScreen;
		});
		this.link.carryForwarded = false;

		let session: Appointment = this.mdService.getCurrentSession();
		this.case_type_slug=session.case_type_slug
		debugger;
		this.initializeForm(session.session.diagnosticImpression);

		let offlineData: SeededInfo = this.mdService.getOfflineData();
		let favoriteCodes = getObjectChildValue(offlineData, [], ['favourite_codes', 'icd10_codes']);
		if (favoriteCodes) {
			this.favoriteCodes = favoriteCodes.filter((code) => {
				return code.type == 'ICD';
			});
		}
		this.apptdata =  this.mainService.getCurrentEvaluedApptAData();
	}

	/**
	 * Initializes form
	 * @param [data]
	 */
	public initializeForm(data = null) {
		const comments = getObjectChildValue(data, '', ['comments']);
		const icd10_codes = getObjectChildValue(data, [], ['icd10_codes']);

		this.icd10_codes = this.fb.array([]);

		if(icd10_codes){
		icd10_codes.forEach((code) => {
			let form = new FormControl(code);
			this.icd10_codes.push(form);
		});
	}

		this.form = this.fb.group({
			comments: [comments],
			icd10_codes: this.icd10_codes,
		});
		if (!this.mainService.isenableSaveRecordMedicalDoctor()){
			this.form.disable();
		}

		// this.diagnosticData.selectedCodes = icd10_codes;
		// this.diagnosticData.comments = comments;
	}

	reLinkICDToForm() {
		this.form = this.fb.group({
			comments: this.form.value.comments,
			icd10_codes: this.icd10_codes,
		});
	}

	/**
	 * Codes updated
	 * @param event
	 */
	codesUpdated(event: FormArray) {
		this.icd10_codes = this.fb.array([]);
		event.controls.forEach((code) => {
			this.icd10_codes.push(code);
		});
	}
	/**
	 * on destroy
	 */
	ngOnDestroy() {
		this.reLinkICDToForm();
		unSubAllPrevious(this.subscriptions);
		let diagnosticImpression = new DiagnosticImpression(this.form.getRawValue());
		let session: MedicalSession = new MedicalSession({
			diagnosticImpression: diagnosticImpression,
		});
		this.mdService.saveDiagnosticImpression(session);
		this.mainService.resetPanelData();
		console.log(this._route.url)
		if(this._route.url == '/scheduler-front-desk/doctor-calendar'){
			if(this.apptdata?.evalFrom == 'monthview'){
				this.navigateBackToSameState();
			}
		}
	}

	// updateCodes() {
	// 	this.form.patchValue({
	// 		icd10_codes: this.diagnosticData.selectedCodes,
	// 	});
	// }

	/**
	 * Next page
	 */
	nextPage() {
		this._route.navigate([`medical-doctor/plan-of-care`]);
	}

	/**
	 * Previous page
	 */
	changePage(btnClicked) {
		if(btnClicked === 'back') {
			this.subscriptions.push(
				this.mainService.panelLeft.subscribe((links: MdLinks[]) => {
					let index = links.findIndex((link) => link.slug == 'diagnosticImpression');
					this._route.navigate([links[index - 1].link]);
				}),
			);
		}
		else {
			this.fromRoute === 'provider_calendar' ?
              		this._route.navigate(['/scheduler-front-desk/doctor-calendar']) : this._route.navigate(['/front-desk/cases/edit/' + this.fromRoute + '/scheduler']);
		}
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
