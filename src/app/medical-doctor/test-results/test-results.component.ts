import { MdLinks } from './../models/panel/model/md-links';
import { RequestService } from './../../shared/services/request.service';
import { ToastrService } from 'ngx-toastr';
import { MedicalDoctorAbstract } from '@appDir/medical-doctor/medical-doctor-abstract/medical-doctor-abstract';
import { CarryForwardService } from '@appDir/medical-doctor/services/carry-forward/carry-forward.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MainService } from '@shared/services/main-service';
import { MDService } from '@appDir/medical-doctor/services/md/medical-doctor.service';
import { TestResultOther, TestResults} from '../models/common/commonModels';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { Router } from '@angular/router';
import { leftPanelRE } from '../models/panel/panel';
import { convertDateTimeForSending, getObjectChildValue } from '@appDir/shared/utils/utils.helpers';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { AppointmentUrlsEnum } from '@appDir/shared/modules/appointment/appointment-urls-enum';
import { DoctorCalendarUrlsEnum } from '@appDir/shared/modules/doctor-calendar/doctor-calendar-urls-enum';
import { CalendarMonthService } from '@appDir/shared/modules/doctor-calendar/utils/my-calendar/src/modules/month/calendar-month.service';
import { AppointmentModalDialogService } from '@appDir/shared/modules/doctor-calendar/utils/my-calendar/src/modules/month/appointment-modal-dialog.service';


@Component({
    selector: 'app-test-results',
    templateUrl: './test-results.component.html',
    styleUrls: ['./test-results.component.scss']
})
export class TestResultsComponent extends MedicalDoctorAbstract implements OnInit, OnDestroy {


	testResultsForm: any;
	testResults: TestResults = new TestResults([],[],null,[],{test_result_comment:''},null) ;
	public currentScreen = 'test_results';
	data:any;
	public link: MdLinks;
	cleanDataFromTestResult :boolean= false;
	public apptdata:any;
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
		public requestService: RequestService,
		public storageData: StorageData,
		public mdService: MDService,
		public toastrService: ToastrService,
		public fb: FormBuilder,
		public _route: Router,
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
			carryForwardService);
			let session = this.mdService.getCurrentSession();
			this.data = {
				test_results: getObjectChildValue(session, null, ['session', 'test_results']),
			};

    }

    ngOnInit() {
		this.getSeedInfo();
		this.subscribeCarryForward();
		this.initializeForm(this.data.test_results);
        this.mainService.setPanelData();
		this.link = leftPanelRE.find((link) => {
			return link.slug == this.currentScreen;
		});
	
		this.link.carryForwarded = false;
		this.apptdata =  this.mainService.getCurrentEvaluedApptAData();
	}
	
	initializeForm(data: any): void {
		if (!data){
			this.testResults=new TestResults([],[],new TestResultOther(),[],{test_result_comment:''},null) ;
			this.testResults.MRI = [] ;
			this.testResults.ctScans = [];
			this.testResults.extremities={
				extremities :null,
			test_result_comment :null
			}
			this.testResults.others['ctaAngiographies']=[];
			this.testResults.others['dexa']=[] ;
			this.testResults.others['mammographies']=[] ;
			this.testResults.others['mrAngiographies']=[] ;
			this.testResults.others['ultrasounds']=[] ;
			this.testResults.radiologies = [];
			this.testResults.other_comments.test_result_comment=null;
			this.cleanDataFromTestResult= true;
			// this.testResults = removeEmptyAndNullsFormObject(this.testResults);
			this.buildForm();
			
			return;
		}
		  this.testResults.MRI = data.MRI;
		  this.testResults.ctScans = data.ctScans;
		  this.testResults.extremities = data.extremities;
		  this.testResults.others = data.others;
		  this.testResults.radiologies = data.radiologies;
		  this.buildForm();
	}

    getObjForm(mriObj, idKey, getNameFunc) {
        return this.fb.group({
            callStatReport: [mriObj.callStatReport?mriObj.callStatReport:''],
            id: [mriObj.id?mriObj.id:''],
            left: [mriObj.left?mriObj.left:''],
            [idKey]: [mriObj[idKey]?mriObj[idKey]:''],
            right: [mriObj.right?mriObj.right:''],
            otherComment: [mriObj.otherComment?mriObj.otherComment:''],
            sendPhysicianFilms: [mriObj.sendPhysicalFilms?mriObj.sendPhysicalFilms:''],
            withValue: [mriObj.withValue?mriObj.withValue:''],
            test_result_comment: [mriObj.test_result_comment?mriObj.test_result_comment:''],
            name: [getNameFunc(mriObj.id?mriObj.id:'')]
        })
    }

    getOtherForm(test?){
		
		if (test){
			return;
		}
        return this.fb.group({
            ctaAngiographies:  
            this.testResults.others.ctaAngiographies?
            this.fb.array(this.testResults.others.ctaAngiographies.map(obj => this.getObjForm(obj, 'cTAngioId', this.getctAngiography.bind(this)))):this.fb.array([]),
            dexa: 
            this.testResults.others.ctaAngiographies?
            this.fb.array(this.testResults.others.dexa.map(obj => this.getObjForm(obj, 'dexaId', this.getDexa.bind(this)))):this.fb.array([]),
            mammographies: 
            this.testResults.others.mammographies?
            this.fb.array(this.testResults.others.mammographies.map(obj => this.getObjForm(obj, 'mammographyId', this.getMammography.bind(this)))):this.fb.array([]),
            mrAngiographies: 
            this.testResults.others.mrAngiographies?
            this.fb.array(this.testResults.others.mrAngiographies.map(obj => this.getObjForm(obj, 'mRAngioId', this.getAngioGraphy.bind(this)))):this.fb.array([]),
            ultrasounds:
            this.testResults.others.ultrasounds? 
			this.fb.array(this.testResults.others.ultrasounds.map(obj => this.getObjForm(obj, 'ultrasoundId',this.getUltraSound.bind(this)))):this.fb.array([]),
			
        })
    }
    buildForm(test?) {
        this.testResultsForm = this.fb.group({
            MRI: this.fb.array(this.testResults.MRI.map(obj => this.getObjForm(obj, 'mriId', this.getMRIName.bind(this)))),
            ctScans: this.fb.array(this.testResults.ctScans.map(obj => this.getObjForm(obj, 'multiDetectId', this.getCtScan.bind(this)))),
            radiologies: this.fb.array(this.testResults.radiologies.map(obj => this.getObjForm(obj, 'radiologyId', this.getRadiology.bind(this)))),
            others: this.getOtherForm(test),
            extremities:this.fb.group({
                extremities:[this.testResults.extremities.extremities],
                test_result_comment:[this.testResults.extremities.test_result_comment]
			}),
			other_comments:this.fb.group({
				test_result_comment:[this.testResults && this.testResults.other_comments ?this.testResults.other_comments.test_result_comment:'']
			
			})
		})
		if (!this.mainService.isenableSaveRecordMedicalDoctor()){
			this.testResultsForm.disable();
		}
	
    }


    offlineData: any
    getSeedInfo() {
        const session = this.mdService.getCurrentSession();
		this.testResults = session.session.test_results;
	
        this.offlineData = this.storageData.getOfflineData()

    }


    ngOnDestroy(): void {
        this.mainService.resetPanelData();
		const session=this.storageData.getcurrentSession()
		if (!this.cleanDataFromTestResult){
		session.session.test_results=this.testResultsForm.value;
		session.session.test_results['cleanDataFromTestResult']=false;			

		}
		else {
			// let values = removeEmptyKeysFromObject(this.testResultsForm.value);
			// if (isEmptyObject(values)){
			// 	values= {
			// 		other_comments: {test_result_comment:null}
			// 	}
			// }
			session.session.test_results =this.testResultsForm.value;
			session.session.test_results['cleanDataFromTestResult']=true;			
		}
        // this.mdService.saveRecord()
        this.storageData.setcurrentSession(session)
        this.mdService.saveRecord('test_results',()=>{
            // this.router.navigate(["/medical-doctor/diagnostic-impression"])
		})
		if(this._route.url == '/scheduler-front-desk/doctor-calendar'){
			if(this.apptdata?.evalFrom == 'monthview'){
				this.navigateBackToSameState();
			}
		}
    }

    getMRIName(id) {
        return this.offlineData.mris.find(mri => mri.id == id).name
    }
    getCtScan(id) {
        return this.offlineData.ctScans.find(ct => ct.id == id).name
    }
    getRadiology(id) {
        return this.offlineData.radiologies.find(ct => ct.id == id).name
    }
    getAngioGraphy(id) {
        return this.offlineData.mrAngiographies.find(ct => ct.id == id).name
    }
    getDexa(id) {
        return this.offlineData.dexa.find(ct => ct.id == id).name
    }
    getMammography(id) {
        return this.offlineData.mammographies.find(ct => ct.id == id).name
    }
    getctAngiography(id) {
        return this.offlineData.ctaAngiographies.find(ct => ct.id == id).name
    }
    getUltraSound(id){
        return this.offlineData.ultrasounds.find(ct => ct.id == id).name
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
