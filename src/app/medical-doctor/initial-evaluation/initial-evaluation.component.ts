import { Component, OnDestroy, OnInit } from '@angular/core';
import { MainService } from '@shared/services/main-service';
import { MDService } from '../services/md/medical-doctor.service';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { ToastrService } from 'ngx-toastr';
import { RequestService } from '@appDir/shared/services/request.service';
import { AclService } from '@appDir/shared/services/acl.service';
import { FormBuilder, Validators } from '@angular/forms';
import { MedicalSession, Evaluation, Patient } from '../models/common/commonModels';
import { MedicalDoctorAbstract } from '../medical-doctor-abstract/medical-doctor-abstract';
import { CarryForwardService } from '../services/carry-forward/carry-forward.service';
import { panelLinks } from '../models/panel/panel';
import { MdLinks } from '../models/panel/model/md-links';
import { convertDateTimeForSending, getObjectChildValue, unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';
import { Router } from '@angular/router';
import { ManualSpecialitiesUrlEnum } from '@appDir/manual-specialities/manual-specialities-url.enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { SubjectService } from '@appDir/shared/modules/doctor-calendar/subject.service';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { DoctorCalendarService } from '@appDir/shared/modules/doctor-calendar/doctor-calendar.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CalendarMonthService } from '@appDir/shared/modules/doctor-calendar/utils/my-calendar/src/modules/month/calendar-month.service';
import { AppointmentUrlsEnum } from '@appDir/shared/modules/appointment/appointment-urls-enum';
import { DoctorCalendarUrlsEnum } from '@appDir/shared/modules/doctor-calendar/doctor-calendar-urls-enum';
import { AppointmentModalDialogService } from '@appDir/shared/modules/doctor-calendar/utils/my-calendar/src/modules/month/appointment-modal-dialog.service';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-initial-evaluation',
	templateUrl: './initial-evaluation.component.html',
	styleUrls: ['./initial-evaluation.component.scss'],
})
export class InitialEvaluationComponent extends MedicalDoctorAbstract implements OnInit,OnDestroy {
	public data: Object;
	public appointment: any;
	public patient: Patient;
	public link: MdLinks;
	public currentScreen = 'evaluation';
	public appointmentdetails :any;
	public apptdata:any;
	saveInitialEval = true;
	subscription: Subscription[]=[];
	fromRoute: any;

	constructor(
		public mainService: MainService,
		protected mdService: MDService,
		protected storageData: StorageData,
		protected toastrService: ToastrService,
		protected requestService: RequestService,
		protected fb: FormBuilder,
		protected _route: Router,
		public carryForwardService: CarryForwardService,
		public aclService: AclService,
		private localStorage: LocalStorage,
		public subject: SubjectService,
		public customDiallogService : CustomDiallogService,
		public doctorCalendarService: DoctorCalendarService,
		public appointmentModal: NgbModal,
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
			customDiallogService
		);
		let data = new Evaluation();
		if (this.appointment['session']) {
			data.chiefComplaints = getObjectChildValue(this.appointment, null, [
				'session',
				'evaluation',
				'chiefComplaints',
			]);
			data.illnessHistory = getObjectChildValue(this.appointment, null, [
				'session',
				'evaluation',
				'illnessHistory',
			]);
		}
		this.data = data;
		
	}

	/**
	 * on init
	 */
	ngOnInit() {
		this.fromRoute = localStorage.getItem('routeFrom');
		this.initializeForm(this.data);
		this.subscribeCarryForward();
		this.link = panelLinks.md.leftPanelRE.find((link) => {
			return link.slug == 'evaluation';
		});

		this.link.carryForwarded = false;
		this.apptdata =  this.mainService.getCurrentEvaluedApptAData();
	}

	ngOnChanges() {
		
	
	}

	public initializeForm(data) {
		// if (data == null) {
		//     data = this.data;
		// }
		this.form = this.fb.group({});
		this.form.addControl(
			'id',
			this.fb.control(
				getObjectChildValue(data, null, ['id']),
				Validators.maxLength(this.maxLength),
			),
		);
		this.form.addControl(
			'chiefComplaints',
			this.fb.control(
				getObjectChildValue(data, null, ['chiefComplaints']),
				Validators.maxLength(this.maxLength),
			),
		);
		this.form.addControl(
			'illnessHistory',
			this.fb.control(
				getObjectChildValue(data, null, ['illnessHistory']),
				Validators.maxLength(this.maxLength),
			),
		);
		this.mainService.sliceStrings(this.form, 'chiefComplaints', this.maxLength);
		this.mainService.sliceStrings(this.form, 'illnessHistory', this.maxLength);
		if (!this.mainService.isenableSaveRecordMedicalDoctor()){
			this.form.disable();
		}
	}

	
	/**
	 * Next page
	 */
	nextPage() {
		this.route.navigate([`/medical-doctor/current-complaints`]);
	}

	/**
	 * Previous page
	 */
	previousPage(btnClick) {
		//comment not required api
		this.subscriptions.push(
			this.subject._appointmentDetails.subscribe(app =>{
				  this.appointmentdetails = app;
		}));
		let app_start_date = new Date(this.apptdata.start).toDateString();
		let current_date = new Date().toDateString();
		this.subscription.push(this.editAppointment(this.apptdata?.appId).subscribe((res)=>{
			if((app_start_date == current_date) && (btnClick === 'back') && (res?.result?.data?.visit_status?.slug == "in_session") && (this.mainService.isenableSaveRecordMedicalDoctor())){
				this.subscription.push(this.requestService.sendRequest(ManualSpecialitiesUrlEnum.deleteSession, 'post', REQUEST_SERVERS.fd_api_url_vd, {
					data:[
						{
							appointment_id:this.storageData.getcurrentSession().id,
							case_id:this.storageData.getcurrentSession().case.id,
							prev_status: this.apptdata.appointment_status_slug
						}
					]
			}).subscribe(data => {
				console.log(data)
				if(data['status'] && !data['result'] && this.apptdata['speciality_key'] == "medical_doctor"){
					this.saveInitialEval = false;
				}
				if(this.apptdata?.evalFrom == 'monthview'){
					this._route.navigate(['/scheduler-front-desk/doctor-calendar'])
				}else{
					this.fromRoute === 'provider_calendar' ?
            			this._route.navigate(['/scheduler-front-desk/doctor-calendar']) : this._route.navigate(['/front-desk/cases/edit/' + this.fromRoute + '/scheduler']);
				}
			}));
		}else{
			this.fromRoute === 'provider_calendar' ?
            	this._route.navigate(['/scheduler-front-desk/doctor-calendar']) : this._route.navigate(['/front-desk/cases/edit/' + this.fromRoute + '/scheduler']);
		}
		}));
}

	/**
	 * on destroy
	 */
	public ngOnDestroy() {
		// if ((this.form.touched && this.form.dirty) || this.carryForwarded) {
			if(this.mainService.isenableSaveRecordMedicalDoctor())
			{
				const formData = this.form.getRawValue();
				let data: MedicalSession = new MedicalSession({
					evaluation: new Evaluation({
						chiefComplaints: formData.chiefComplaints,
						illnessHistory: formData.illnessHistory,
						alleviation: formData.alleviation,
						headaches: formData.headaches,
						painAreas: formData.painAreas,
					}),
				});
				this.mdService.setComplaints(data.evaluation);
				if(this.saveInitialEval){
					this.mdService.saveInitialEvaluation(data);
				}
				if(this._route.url == '/scheduler-front-desk/doctor-calendar'){
					if(this.apptdata?.evalFrom == 'monthview'){
						setTimeout(()=>{
							this.navigateBackToSameState();
						},0)
					}
				}
				// }
		
				this.mainService.resetPanelData();
		
			}
		
		unSubAllPrevious(this.subscriptions);
	}

	/**
	 * Clears alleviation
	 */
	public clear() {
		this.form.controls['alleviation'].setValue('');
	}
	navigateBackToSameState() {
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
