import { REQUEST_SERVERS } from './../../request-servers.enum';
import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Config } from '../../config/config';
import { of as observableOf, Observable, BehaviorSubject, throwError, Subject, Subscription } from "rxjs";
import { panelLinks } from "../../medical-doctor/models/panel/panel";
import { map, catchError } from 'rxjs/operators';
import { RequestService } from "./request.service";
import { StorageData } from "@appDir/pages/content-pages/login/user.class";
import { LocalStorage } from '../libs/localstorage';
import { DoctorCalendarUrlsEnum } from '../modules/doctor-calendar/doctor-calendar-urls-enum';
import { convertDateTimeForSending } from '../utils/utils.helpers';
import { AppointmentUrlsEnum } from '../modules/appointment/appointment-urls-enum';
import { CalendarMonthService } from '../modules/doctor-calendar/utils/my-calendar/src/modules/month/calendar-month.service';
import { AppointmentModalDialogService } from '../modules/doctor-calendar/utils/my-calendar/src/modules/month/appointment-modal-dialog.service';

@Injectable()
export class MainService {
	getHeader = function () {
		return {
			headers: new HttpHeaders({
				'Authorization': 'Bearer ' + this.storageData.getToken()
			})
		}
	};

	enableSaveRecordMedicalDoctor: boolean = false;
	enableSaveRecordManualSpeciality: boolean = false;
	enableSaveRecordHbot: boolean = false;
	private oneDayAppointmentsData = new Subject<any>();
	_oneDayAppointmentsData = this.oneDayAppointmentsData.asObservable();
	isLoaderPending: BehaviorSubject<boolean> = new BehaviorSubject(false);
	public apptdata:any;
	subscription: Subscription[]=[];
	constructor(private http: HttpClient,
		// private logger: Logger,
		private config: Config,
		protected requestService: RequestService,
		private storageData: StorageData,
		private localStorage: LocalStorage,
		public monthService: CalendarMonthService,
		public appModelDialogService:AppointmentModalDialogService
	) {
		this.enableSaveRecordMedicalDoctor = this.storageData.get_enableSaveRecordMedicalDoctor_LocalStorageData();
		this.enableSaveRecordManualSpeciality = this.storageData.get_enableSaveRecordManualSpeciality_LocalStorageData();
		this.enableSaveRecordHbot = this.storageData.get_enableSaveRecordHbot_LocalStorageData();
		this.apptdata = this.getCurrentEvaluedApptAData();
		console.log(this.apptdata) 
	}

	url: string = this.config.getConfig('md_api_url');

	// saveSingleSession(data): Observable<any> {
	// 	// console.log(data);
	// 	// ;
	// 	let url = "medical_sessions/save";
	// 	return this.requestService.sendRequest(url, 'post', REQUEST_SERVERS.medical_doctor_api_url, data)
	// 	// return this.http.post(url, data, this.getHeader());
	// }
	setOneDayAppointmentsData(assigns){
		this.oneDayAppointmentsData.next(assigns); 
	}
	getAppointmentsData(){
		return JSON.parse(this.localStorage.get('monthEvents'))
	}
	getCurrentEvaluedApptAData(){
		return JSON.parse(this.localStorage.get('appdata'));
	}
	setenableSaveRecordManualSpeciality(status: boolean) {
		this.enableSaveRecordManualSpeciality = status;
		this.storageData.set_enableSaveRecordManualSpeciality_LocalStorageData(status);

	}

	openDocSingature(url,doc_id, open = true) {
		debugger;
		return this.requestService.sendRequest(url, 'get', REQUEST_SERVERS.document_mngr_api_path,{"file_ids[]" : doc_id});
		// 	// return this.http.post(url, data, this.getHeader())
		// if (open) {
		//   window.open(this.url);
		//   // this.titlepath(this.url, fileName);
		// } else {
		//   return this.url;
		// }
	
	  }

	getenableSaveRecordManualSpeciality(): boolean {
		return this.enableSaveRecordManualSpeciality;
	}

	setenableSaveRecordHbot(status: boolean) {
		this.enableSaveRecordHbot = status;
		this.storageData.set_enableSaveRecordHbot_LocalStorageData(status);


	}

	getenableSaveRecordHbot(): boolean {
		return this.enableSaveRecordHbot;
	}

	setenableSaveRecordMedicalDoctor(status: boolean) {
		this.enableSaveRecordMedicalDoctor = status;
		this.storageData.set_enableSaveRecordMedicalDoctor_LocalStorageData(status);

	}

	isenableSaveRecordMedicalDoctor(): boolean {
		return this.enableSaveRecordMedicalDoctor;
	}

	getSeedInfo(): Observable<any> {
		let url = this.url + "getSeedInfo";
		return this.http.get(url, this.getHeader());
	}

	setPanelData() {
		// const localStorage = new LocalStorage();
		const currentSession = this.storageData.getcurrentSession()
		// const currentSession = JSON.parse(localStorage.get('currentSession'));
		let leftPanel;


		if (!currentSession) {
			return;
		}

		// const testResultsIndex = panelLinks.md.leftPanel.findIndex(x => x.link === 'test-results');
		// const pastMedicalHistoryIndex = panelLinks.md.leftPanel.findIndex(x => x.slug === 'past-medical-history');
		// const initialEvaluationIndex = panelLinks.md.leftPanel.findIndex(x => x.slug === 'initial-evaluation');
		// const physicalExaminationIndex = panelLinks.md.leftPanel.findIndex(x => x.slug === 'physical-examination');
		// const physicalExaminationContIndex = panelLinks.md.leftPanel.findIndex(x => x.slug === 'physical-examination-cont');

		if (currentSession.visitType === 'reEvaluation' || currentSession.visitType === 'followUp') {
			leftPanel = panelLinks.md.leftPanelRE;
			console.log("reEvaluation");
			//     if (initialEvaluationIndex !== -1) {
			//         panelLinks.md.leftPanel.splice(initialEvaluationIndex, 1);
			//         panelLinks.md.leftPanel.splice(0, 0, {link: 'initial-evaluation', slug: 'initial-evaluation',  name: 'Follow Up Evaluation'});
			//     }

			//     if (pastMedicalHistoryIndex !== -1) {
			//         panelLinks.md.leftPanel.splice(pastMedicalHistoryIndex, 1);
			//     }
			//     if (physicalExaminationIndex !== -1) {
			//         panelLinks.md.leftPanel.splice(physicalExaminationIndex, 1);
			//     }
			//     if (physicalExaminationContIndex === -1) {
			//         panelLinks.md.leftPanel.splice(3, 0, {link: 'physical-examination-cont', slug: 'physical-examination-cont', name: 'Physical Examination'});
			//     }


			//     if (testResultsIndex === -1) {
			//         panelLinks.md.leftPanel.splice(3, 0, {link: 'test-results', slug: 'test-results', name: 'Test Results'});
			//     }
		}

		if (currentSession.visitType === 'evaluation') {
			leftPanel = panelLinks.md.leftPanel;

			// if (initialEvaluationIndex !== -1) {
			//     panelLinks.md.leftPanel.splice(initialEvaluationIndex, 1);
			//     panelLinks.md.leftPanel.splice(0, 0, {link: 'initial-evaluation', slug: 'initial-evaluation', name: 'Initial Evaluation'});
			// }


			// if (testResultsIndex !== -1) {
			//     panelLinks.md.leftPanel.splice(testResultsIndex, 1);
			// }
			// if (physicalExaminationContIndex !== -1) {
			//     panelLinks.md.leftPanel.splice(physicalExaminationContIndex, 1);
			// }

			// if (pastMedicalHistoryIndex === -1) {
			//     panelLinks.md.leftPanel.splice(2, 0, {link: 'past-medical-history', slug: 'past-medical-history', name: 'Past Medical History'});
			// }
			// if (physicalExaminationIndex === -1) {
			//     panelLinks.md.leftPanel.splice(3, 0, {
			//         link: '',
			//         slug:"physical-examination",
			//         name: 'Physical Examination',
			//         drop:false,
			//         subLinks: [
			//             {link: 'medical-doctor/physical-examination', name: 'General Appearence'},
			//             {link: 'medical-doctor/physical-examination-cont', name: 'Musculoskeletal'},
			//         ]
			//     });
			// }
		}
		// console.log(panelLinks.md.leftPanel);

		this.setLeftPanel(leftPanel);
		this.setRightPanel(panelLinks.md.rightPanel);
	}

	resetPanelData() {
		this.setLeftPanel({});
		this.setRightPanel(null);
	}

	// getAppointmentDetails(appointment_id):Observable<any>{
	//   this.url = this.config.getConfig('apiUrl')+"api/appointments/details";
	//   this.url = this.url + "?appointment_id=" + appointment_id;
	//   return this.http.get(this.url);
	// }

	// saveInitialEvaluation(formData: Object): Observable<any> {
	//   this.url = this.config.getConfig('apiUrl')+"api/save_initial_evaluation";
	//   return this.http.post(this.url, formData);
	// }
	// getDoctorAppointments(): Observable<any>{
	//   this.url = this.config.getConfig('apiUrl')+"api/appointments/get";
	//   return this.http.get(this.url);
	// }


	private leftPanel = new BehaviorSubject<Object[]>([]);
	panelLeft = this.leftPanel.asObservable();
	public monthEvents:any = [];
	setLeftPanel(obj) {
		this.leftPanel.next(obj);
	}

	private rightPanel = new BehaviorSubject<Object[]>([]);
	panelRight = this.rightPanel.asObservable();

	setRightPanel(obj) {
		this.rightPanel.next(obj);
	}

	sliceStrings(form, variable, maxLength) {
		if (form && form.get(variable)) {
			form.get(variable).valueChanges.subscribe(val => {
				if (form && variable && form.get(variable).value && form.get(variable).value.length > maxLength) {
					form.get(variable).setValue(form.get(variable).value.slice(0, maxLength));
				}
			});
		}
	}

	getDiagnosticCodes(term: string) {
		console.log(term);
		if (term === '') {
			return observableOf([]);
		}
		const url = this.url + `diagnostic-impression/codes?text=` + term;
		return this.http.get(url).pipe(map((res) => {
			return res['data'];
		}));
	}


	public get = <T>(url: string): Observable<T | T[]> => {

		return this.http.get<T>(url).pipe(
			catchError(this.handleError)
		) as Observable<T | T[]>;

	}

	public handleError(error: HttpErrorResponse) {
		if (error.error instanceof ErrorEvent) {
			// A client-side or network error occurred. Handle it accordingly.
			console.error('An error occurred:', error.error.message);
		} else {
			// The backend returned an unsuccessful response code.
			// The response body may contain clues as to what went wrong,
			console.error(
				`Backend returned code ${error.status}, ` +
				`body was: ${error.error}`);
		}
		// return an observable with a user-facing error message
		return throwError(
			'Something bad happened; please try again later.');
	};
	navigateBackToSameState(data) {
		debugger
		this.apptdata = data
		console.log(this.apptdata)
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
			console.log(res)
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
		  this.setOneDayAppointmentsData(res);
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
