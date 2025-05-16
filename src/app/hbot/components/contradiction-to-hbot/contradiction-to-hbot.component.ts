import { ManualSpecialitiesUrlEnum } from './../../../manual-specialities/manual-specialities-url.enum';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FieldConfig } from '@appDir/shared/dynamic-form/models/fieldConfig.model';
import { DivClass } from '@appDir/shared/dynamic-form/models/DivClass.class';
import { InputTypes } from '@appDir/shared/dynamic-form/constants/InputTypes.enum';
import { DynamicFormComponent } from '@appDir/shared/dynamic-form/components/dynamic-form/dynamic-form.component';
import { CheckboxClass } from '@appDir/shared/dynamic-form/models/Checkbox.class';
import { HbotService } from '@appDir/hbot/service/hbot.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { HBOTUrlEnums } from '@appDir/hbot/HBOTUrlEnums.enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { MainService } from '@appDir/shared/services/main-service';
import { SubjectService } from '@appDir/shared/modules/doctor-calendar/subject.service';
import { Subscription } from 'rxjs';
import { convertDateTimeForSending, unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';
import { AppointmentUrlsEnum } from '@appDir/shared/modules/appointment/appointment-urls-enum';
import { CalendarMonthService } from '@appDir/shared/modules/doctor-calendar/utils/my-calendar/src/modules/month/calendar-month.service';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { DoctorCalendarUrlsEnum } from '@appDir/shared/modules/doctor-calendar/doctor-calendar-urls-enum';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { AppointmentModalDialogService } from '@appDir/shared/modules/doctor-calendar/utils/my-calendar/src/modules/month/appointment-modal-dialog.service';

@Component({
  selector: 'app-contradiction-to-hbot',
  templateUrl: './contradiction-to-hbot.component.html',
  styleUrls: ['./contradiction-to-hbot.component.scss']
})
export class ContradictionToHbotComponent implements OnInit,OnDestroy {
  @ViewChild(DynamicFormComponent) form: DynamicFormComponent;
  constructor(
    private hbotService: HbotService, 
    private requestService: RequestService, 
    protected storageData: StorageData,
    private toastrService: ToastrService,
    private localStorage: LocalStorage,
    private router: Router,
	  private location: Location,
    public monthService: CalendarMonthService,
    public mainService: MainService,
    public subject: SubjectService,
    public appModelDialogService: AppointmentModalDialogService
  ) { }
  public appointmentdetails :any;
  disableBtn: boolean = false;
  fieldConfig: FieldConfig[] = [];
  subscription: Subscription[] = [];
  currentApptdata:any;
  public apptdata: any;
  fromRoute: string;

  ngOnInit() {
    this.fromRoute = localStorage.getItem('routeFrom');
    this.initializeForm();
    this.apptdata = this.mainService.getCurrentEvaluedApptAData();
  }
  getTruthyIds(obj: any) {
    return Object.keys(obj).map(key => obj[key] ? key : null).filter(value => value)
  }
  getTruthyObject(arr: number[]) {
    let obj = {}
    arr.forEach(num => obj[`${num}`] = true)
    return obj
  }
  onReady($event) {
    this.requestService.sendRequest(HBOTUrlEnums.getHBOTsession, 'get', REQUEST_SERVERS.fd_api_url, {
      session_id: this.hbotService.getSession().id
    }).subscribe(data => {
      this.hbotService.initializeHBOTSession(data['result']['data'])
      let hbotSession = this.hbotService.getHBOTSession()
      this.form.form.patchValue({
        diseases: this.getTruthyObject(hbotSession.diseases_ids),
        disorders: this.getTruthyObject(hbotSession.disorders_ids),
        medications: this.getTruthyObject(hbotSession.medications_ids)
	  });
	  if (!this.mainService.getenableSaveRecordHbot()){
		this.form.form.disable();  
	  }
    })
  }
  submit({ diseases, disorders, medications },is_save_for_later:boolean) {
    let obj = {
      session_id: this.hbotService.getSession().id,
      diseases_ids: this.getTruthyIds(diseases),
      disorders_ids: this.getTruthyIds(disorders),
      medications_ids: this.getTruthyIds(medications)
	}
	

  this.disableBtn = true;
  let obj2 = {
    id: this.hbotService.getSession().id,
    visit_session_state_id: 1,
    warning: true,
  }
  if (!is_save_for_later) {
    obj2['finalize'] = false;
  } else {
    obj2['finalize'] = true;
  }
	
  this.subscription.push(this.requestService.sendRequest(ManualSpecialitiesUrlEnum.updateSession, 'put', REQUEST_SERVERS.fd_api_url_vd, obj2).subscribe(data => {
    if(data && data['result'] && data['result']['data']){
      this.currentApptdata = data['result']['data'];
    }
  }));

	


    this.subscription.push(this.requestService.sendRequest(HBOTUrlEnums.updateContradictionsToHBOT, 'put', REQUEST_SERVERS.fd_api_url, obj).subscribe(data => {
      this.toastrService.success('Updated Successfully', 'Success');
      !is_save_for_later?
      this.router.navigate(['/hbot/hbot-notes']):this.back('saveForLater')
    }, err => this.disableBtn = false))

  }
  back(btnClick) {
    this.subscription.push(
      this.subject._appointmentDetails.subscribe(app =>{
			this.appointmentdetails = app;
		}))
    let app_start_date = new Date(this.apptdata?.start).toDateString();
		let current_date = new Date().toDateString();
    //this.apptdata.appointment_status_slug === 'scheduled' || this.apptdata.appointment_status_slug === 'arrived'
    this.subscription.push(this.editAppointment(this.apptdata?.appId).subscribe((res)=>{
      if((app_start_date == current_date) && (btnClick === 'back') && (res?.result?.data?.visit_status?.slug == "in_session") && (this.mainService.getenableSaveRecordHbot())){
        this.subscription.push(this.requestService.sendRequest(ManualSpecialitiesUrlEnum.deleteSession, 'post', REQUEST_SERVERS.fd_api_url_vd, {
          data:[
            {
              id: this.hbotService.getSession().id,
              appointment_id:this.hbotService.getSession().appointment_id,
              case_id:this.hbotService.getSession().case_id,
              prev_status: this.apptdata.appointment_status_slug
            }
          ]
        }).subscribe(data => {
          if(this.apptdata?.evalFrom == 'monthview'){
            this.navigateBackToSameState();
          }else{
            this.fromRoute === 'provider_calendar' ?
              this.router.navigate(['/scheduler-front-desk/doctor-calendar']) : this.router.navigate(['/front-desk/cases/edit/' + this.fromRoute + '/scheduler']);
          }
        }));
       }else{
        if(this.apptdata?.evalFrom == 'monthview'){
          this.navigateBackToSameState();
        }else{
          this.fromRoute === 'provider_calendar' ?
            this.router.navigate(['/scheduler-front-desk/doctor-calendar']) : this.router.navigate(['/front-desk/cases/edit/' + this.fromRoute + '/scheduler']);
        }
       }
    }))
  }
  next(is_save_for_later:boolean) {
    this.submit(this.form.form.value,is_save_for_later)
  }

  getDiseases() {
    let diseases = this.hbotService.getSeederData().diseases
    return diseases.map(disease => new CheckboxClass(disease.name, `${disease.id}`, InputTypes.checkbox, false, [], '', ['col-md-4 col-lg-3']))
  }

  getDisorders() {
    let disorder = this.hbotService.getSeederData().disorders
    return disorder.map(disorder => new CheckboxClass(disorder.name, `${disorder.id}`, InputTypes.checkbox, false, [], '', ['col-md-4 col-lg-3']))
  }

  getMedications() {
    let medications = this.hbotService.getSeederData().medications
    return medications.map(medication => new CheckboxClass(medication.name, `${medication.id}`, InputTypes.checkbox, false, [], '', ['col-md-4 col-lg-3']))
  }
  initializeForm() {
    this.fieldConfig = [
      new DivClass([
        ...this.getDiseases()
      ], ['row'], 'Please check off if you have ever experienced in the past or currently have been diagnosed with the following conditions:', '', { formControlName: 'diseases' }),
      new DivClass([
        ...this.getMedications()
      ], ['row'], 'Please indicate if you have ever taken or currently are taking the following medications:', '', { formControlName: 'medications' }),
      new DivClass([
        ...this.getDisorders()
      ], ['row'], 'Are you:', '', { formControlName: 'disorders' })
    ]
  }
  ngOnDestroy(): void {
		unSubAllPrevious(this.subscription);
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
    this.router.navigate(['/scheduler-front-desk/doctor-calendar'])
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
