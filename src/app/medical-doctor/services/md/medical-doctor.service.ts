import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { Appointment, MedicalSession, Evaluation } from '../../models/common/commonModels';
import { ToastrService } from 'ngx-toastr';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { medicalDoctorUrlsEnum } from '../../medical-doctor-URls-enum';
import { HttpSuccessResponse, StorageData } from '@appDir/pages/content-pages/login/user.class';
import { SeededInfo, seededInfo } from '../../md-shared/seededInfo';
import { MainService } from '@appDir/shared/services/main-service';
import { getObjectChildValue } from '@appDir/shared/utils/utils.helpers';

@Injectable()
export class MDService {
	/**
	 * Creates an instance of mdservice.
	 * @param toast
	 * @param requestService
	 * @param router
	 * @param storageData
	 */
	constructor(
		private toast: ToastrService,
		protected requestService: RequestService,
		private router: Router,
		private storageData: StorageData,
		private mainService:MainService,
		private route:Router
	) {
		this.setComplaints({ chiefComplaints: this.storageData.getPatientsComplaints() });
	}

	public chiefComplaints = new BehaviorSubject<Evaluation>(new Evaluation({}));
	response = this.chiefComplaints.asObservable();
	public setComplaints(evaluation): void {
		this.chiefComplaints.next(evaluation);
	}

	/**
	 * Carrys forward
	 * @param url
	 * @param request
	 * @returns forward
	 */
	public carryForward(url, request): Observable<any> {
		return this.requestService.sendRequest(
			url,
			'POST',
			REQUEST_SERVERS.medical_doctor_api_url,
			request,
		);
	}

	/**
	 * Submits data
	 * @param sessionData
	 * @param option
	 * @param session
	 * @param appointment_id
	 * @param success_callback
	 * @param error_callback
	 */
	submitData(sessionData, option, session, appointment_id, success_callback, error_callback) {

		this.requestService
			.sendRequest(
				medicalDoctorUrlsEnum.MDSession_POST,
				'post',
				REQUEST_SERVERS.medical_doctor_api_url,
				session,
			)
			.subscribe(
				(res: HttpSuccessResponse) => {
					if (res.status) {
						sessionData.session.id = getObjectChildValue(res, sessionData.session.id, [
							'result',
							'data',
							'id',
						]);

						if (option == '') {
							this.router.navigate([`medical-doctor/evaluation`]);
							sessionData.session = new MedicalSession(
								getObjectChildValue(res, sessionData.session, ['result', 'data']),
							);
							sessionData.session.appointment_id = appointment_id;
							sessionData.visitSessionId = res['result']['data'].visitSessionId
							sessionData.doctor_signature_id = res['result']['data'].doctor_signature_id;
							sessionData.patient_signature_id = res['result']['data'].patient_signature_id;
							sessionData.oldVisitSessionId = getObjectChildValue(
								res,
								sessionData.oldVisitSessionId,
								['result', 'data', 'oldVisitSessionId'],
							);
							// this.mainService.setenableSaveRecordMedicalDoctor(true);
							sessionData.session.enableSaveRecordMedicalDoctor=this.mainService.isenableSaveRecordMedicalDoctor()
						}
					} else {
						if (option != '') {
							if (!getObjectChildValue(res, true, ['result', 'data', option, 'status'])) {
								this.toast.error(res.result.data[option].message, 'Error!');
							}
						} else {
							this.toast.error(res.message, 'Error!');
							// this.router.navigate([`medical-doctor`]);
						}
					}

					this.storageData.setcurrentSession(sessionData);
					if (success_callback) {
						success_callback(res);
					}
				},
				(err) => {
					if (error_callback) error_callback(err);
				},
			);
	}

	/**
	 * Saves record
	 * @param option
	 * @param [success_callback]
	 * @param [error_callback]
	 */

	saveRecord(option, success_callback?, error_callback?) {
		let sessionData: Appointment = this.storageData.getcurrentSession();
		let appointment_id = getObjectChildValue(sessionData, null, ['session', 'appointment_id']);
		let session: any = {
			appointment_id: appointment_id,
			doctorId: sessionData.doctorId ? sessionData.doctorId : sessionData.appointment_visit_state_id.doctor_id  ,
			patientId: sessionData.patientId,
			caseId: sessionData.caseId,
			visitType: sessionData.visitType,
			speciality: sessionData.speciality,
			speciality_id: sessionData.speciality_id,
			facility_location_id: sessionData.location_id,
			finalize_visit: option == 'completeVisit' ? sessionData.session['finalize_visit'] : false,
			template_id:sessionData.template_id,
			technician_id:sessionData.technician_id,
			provider_id : sessionData.provider_id,
			template_type:sessionData.template_type,
			appointment_type_id: sessionData.appointment_type_id
		};

		if (sessionData.session.id) {
			session.id = sessionData.session.id;
		}
		if(option != '' && this.route.url == '/scheduler-front-desk/doctor-calendar'){
			session['save'] = true;
		} 
		if (option != '') {
			session[option] = sessionData.session[option];
			if (option == 'currentComplaints') {
				session.headInjury = sessionData.session['headInjury'];
			}
		}
		if(!this.mainService.isenableSaveRecordMedicalDoctor() && option!='')
		{
			return;
		}
		this.submitData(sessionData, option, session, appointment_id, success_callback, error_callback);
	}

	private currentSession = new BehaviorSubject<Object>({});
	currentEvaluation = this.currentSession.asObservable();

	setCurrentSession(obj): void {
		this.storageData.setcurrentSession(obj);
		this.storageData.set_enableSaveRecordMedicalDoctor_LocalStorageData(this.mainService.isenableSaveRecordMedicalDoctor())

		this.saveRecord('', () => {
			debugger;
			if(obj && obj.speciality_key == 'medical_doctor' && obj.template_type == 'manual') {
			localStorage.setItem('templateObj', JSON.stringify(obj));
			this.route.navigate(['/manual-specialities']);
			} else {
				this.router.navigate([`medical-doctor/evaluation`]);
			}
		});
		this.currentSession.next(obj);
	}
	getCurrentSession() {
		return this.storageData.getcurrentSession();
		// return JSON.parse(this.localStorage.get('currentSession'));
	}

	// private offlineData = new BehaviorSubject<SeededInfo>(null);
	// offline = this.offlineData.asObservable();

	setOfflineSchedules(obj) {
		// this.offlineData.next(obj);
		this.storageData.setOfflineSchedules(obj);
	}
	setOfflineData(obj: SeededInfo) {
		// this.offlineData.next(obj);
		this.storageData.setOfflineData(obj);
	}

	getOfflineData() {
		return this.storageData.isStorageDebuggingOn() ? seededInfo : this.storageData.getOfflineData();
	}
	/**
	 * Gets medical session data and saves this data in localstorage and server.
	 * @param data Medical Session data
	 */
	saveInitialEvaluation = (data: MedicalSession) => {
		let currentSession: Appointment = this.storageData.getcurrentSession();
		if (currentSession.session) {
			// this.setComplaints(data.evaluation);
			currentSession.session.evaluation = data.evaluation;
			if (data.id) {
				currentSession.session.id = data.id;
			}
			this.storageData.setcurrentSession(currentSession);
			// this.localStorage.set('currentSession', JSON.stringify(currentSession));
			this.saveRecord('evaluation');
		}
	};

	saveCurrentComplaints = (data: MedicalSession) => {
		let currentSession: Appointment = this.storageData.getcurrentSession();
		if (currentSession.session) {
			currentSession.session.currentComplaints = data.currentComplaints;
			if (data.headInjury.headInjury) {
				data.headInjury.headInjury;
			}
			currentSession.session.headInjury = data.headInjury;
			if (data.id) {
				currentSession.session.id = data.id;
			}
			this.storageData.setcurrentSession(currentSession);

			// this.localStorage.set('currentSession', JSON.stringify(currentSession));
			this.saveRecord('currentComplaints');
		}
	};

	saveHbot = (data: MedicalSession) => {
		let currentSession: Appointment = this.storageData.getcurrentSession();

		// let currentSession: Appointment = JSON.parse(this.localStorage.get('currentSession'));
		if (currentSession.session) {
			currentSession.session.hbotNotes = data.hbotNotes;
			if (data.id) {
				currentSession.session.id = data.id;
			}
			this.storageData.setcurrentSession(currentSession);

			// this.localStorage.set('currentSession', JSON.stringify(currentSession));
			this.saveRecord('hbotNotes');
		}
	};
	saveBioelectronic = (data: MedicalSession) => {
		let currentSession: Appointment = this.storageData.getcurrentSession();

		// let currentSession: Appointment = JSON.parse(this.localStorage.get('currentSession'));
		if (currentSession.session) {
			currentSession.session.synaptic = data.synaptic;
			if (data.id) {
				currentSession.session.id = data.id;
			}
			currentSession.session.finalize_visit = data.finalize_visit;
			this.storageData.setcurrentSession(currentSession);
			// this.localStorage.set('currentSession', JSON.stringify(currentSession));
			this.saveRecord('synaptic');
		}
	};

	saveCurrentComplaints2 = (data: MedicalSession) => {
		let currentSession: Appointment = this.storageData.getcurrentSession();
		// let currentSession: Appointment = JSON.parse(this.localStorage.get('currentSession'));
		if (currentSession.session) {
			currentSession.session.currentComplaints2 = data.currentComplaints2;
			if (data.id) {
				currentSession.session.id = data.id;
			}
			this.storageData.setcurrentSession(currentSession);
			// this.localStorage.set('currentSession', JSON.stringify(currentSession));
			this.saveRecord('currentComplaints2');
		}
	};
	saveDiagnosticImpression = (data: MedicalSession) => {
		// let currentSession: Appointment = JSON.parse(this.localStorage.get('currentSession'));
		let currentSession: Appointment = this.storageData.getcurrentSession();
		if (currentSession.session) {
			currentSession.session.diagnosticImpression = data.diagnosticImpression;
			if (data.id) {
				currentSession.session.id = data.id;
			}
			// this.localStorage.set('currentSession', JSON.stringify(currentSession));
			this.storageData.setcurrentSession(currentSession);
			let code = getObjectChildValue(
				currentSession,
				[],
				['session', 'diagnosticImpression', 'icd10_codes'],
			);
			if (code) {
				currentSession.session.diagnosticImpression.icd10_codes = currentSession.session.diagnosticImpression.icd10_codes
					.filter((code) => {
						return code;
					})
					.map((code) => {
						return { id: code.id, description: code.description, name: code.name, type: code.type };
					});
			}
			this.saveRecord('diagnosticImpression');
		}
	};
	saveTreatmentRendered = (data: MedicalSession, success_callback, error_callback: any) => {
		let currentSession: Appointment = this.storageData.getcurrentSession();
		if (currentSession.session) {
			currentSession.session.treatment_rendered = data.treatment_rendered;
			if (data.id) {
				currentSession.session.id = data.id;
			}
			this.storageData.setcurrentSession(currentSession);
			currentSession.session.treatment_rendered.cpt_codes = currentSession.session.treatment_rendered.cpt_codes
				.filter((code) => {
					return code;
				})
				.map((code) => {
					return { id: code.id, description: code.description, name: code.name, type: code.type };
				});
			this.saveRecord('treatment_rendered', success_callback, error_callback);
		}
	};
	savePastMedicalHistory = (data: MedicalSession) => {
		let currentSession: Appointment = this.storageData.getcurrentSession();
		// let currentSession: Appointment = JSON.parse(this.localStorage.get('currentSession'));
		if (currentSession.session) {
			currentSession.session.pastMedicalHistory = data.pastMedicalHistory;
			if (data.id) {
				currentSession.session.id = data.id;
			}
			this.storageData.setcurrentSession(currentSession);
			// this.localStorage.set('currentSession', JSON.stringify(currentSession));
			this.saveRecord('pastMedicalHistory');
		}
	};
	savePhysicalExamination1 = (data: MedicalSession) => {
		let currentSession: Appointment = this.storageData.getcurrentSession();
		if (currentSession.session) {
			currentSession.session.physicalExamination1 = data.physicalExamination1;
			if (data.id) {
				currentSession.session.id = data.id;
			}
			this.storageData.setcurrentSession(currentSession);
			// this.localStorage.set('currentSession', JSON.stringify(currentSession));
			this.saveRecord('physicalExamination1');
		}
	};
	savePhysicalExamination2 = (data: MedicalSession) => {
		let currentSession: Appointment = this.storageData.getcurrentSession();
		// let currentSession: Appointment = JSON.parse(this.localStorage.get('currentSession'));
		if (currentSession.session) {
			currentSession.session.physicalExamination2 = data.physicalExamination2;
			if (data.id) {
				currentSession.session.id = data.id;
			}
			this.storageData.setcurrentSession(currentSession);
			this.saveRecord('physicalExamination2');
		}
	};
	savePlanOfCare = (data: MedicalSession) => {

		let currentSession: Appointment = this.storageData.getcurrentSession();
		// let currentSession: Appointment = JSON.parse(this.localStorage.get('currentSession'));
		if (currentSession.session) {
			currentSession.session.planOfCare = data.planOfCare;
			if (data.id) {
				currentSession.session.id = data.id;
			}
			this.storageData.setcurrentSession(currentSession);
			// this.localStorage.set('currentSession', JSON.stringify(currentSession));
			this.saveRecord('planOfCare');
		}
	};
	saveWorkStatus = (data: MedicalSession) => {
		let currentSession: Appointment = this.storageData.getcurrentSession();
		// let currentSession: Appointment = JSON.parse(this.localStorage.get('currentSession'));
		if (currentSession.session) {
			currentSession.session.workStatus = data.workStatus;
			if (data.id) {
				currentSession.session.id = data.id;
			}
			this.storageData.setcurrentSession(currentSession);
			// this.localStorage.set('currentSession', JSON.stringify(currentSession));
			this.saveRecord('workStatus');
		}
	};
	completeVisit = (data: MedicalSession, success_callback, error_callback) => {
		;
		let currentSession: Appointment = this.storageData.getcurrentSession();
		// let currentSession: Appointment = JSON.parse(this.localStorage.get('currentSession'));
		if (currentSession.session) {
			currentSession.session.finalize_visit = data.finalize_visit;
			if (data.id) {
				this.storageData.setcurrentSession(currentSession);
				// this.localStorage.set('currentSession', JSON.stringify(currentSession));

				let offlineSchedules = this.storageData.getOfflineSchedules();

				// let offlineSchedules = JSON.parse(this.localStorage.get('offlineSchedules'));
				for (let i in offlineSchedules) {
					if (offlineSchedules[i].id == currentSession.id) {
						offlineSchedules[i].session = currentSession;
					}
				}
				this.storageData.setCompletedSchedules(offlineSchedules);
				// this.localStorage.set('CompletedSchedules', JSON.stringify(offlineSchedules));
				this.saveRecord('completeVisit', success_callback, error_callback);
			} else {
				error_callback();
			}
		} else {
			error_callback();
		}
	};

	// savePhysicalOccChiro(data) {
	//   // console.log(data);
	//   // console.log(data.phyOccChirott);

	//   let currentSession: Appointment = JSON.parse(this.localStorage.get('currentSession'));
	//   if (currentSession.session) {
	//     currentSession.session.phyOccChirott = data.phyOccChirott;
	//     //  console.log(currentSession.session.phyOccChirott);
	//     if (data.id) {
	//       currentSession.session.id = data.id;
	//     }
	//     this.localStorage.set('currentSession', JSON.stringify(currentSession));
	//     this.saveRecord("phyOccChirott");
	//   }
	// }

	// savemriReferral(data) {
	//   // console.log(data);
	//   //  console.log(data.mriReferral);

	//   let currentSession: Appointment = JSON.parse(this.localStorage.get('currentSession'));
	//   if (currentSession.session) {
	//     currentSession.session.mriReferral = data.mriReferral;
	//     //  console.log(currentSession.session.phyOccChirott);
	//     /* if (data.id) {
	//        currentSession.session.id = data.id;
	//      }*/
	//     this.localStorage.set('currentSession', JSON.stringify(currentSession));
	//     this.saveRecord("mriReferral");
	//   }
	// }

	// saveSpecialityConsultation(data) {
	//   //  console.log(data);
	//   //  console.log(data.specialityConsultation);

	//   let currentSession: Appointment = JSON.parse(this.localStorage.get('currentSession'));
	//   if (currentSession.session) {
	//     currentSession.session.specialityConsultation = data.specialityConsultation;
	//     console.log(currentSession.session.specialityConsultation);
	//     if (data.id) {
	//       currentSession.session.id = data.id;
	//     }
	//     this.localStorage.set('currentSession', JSON.stringify(currentSession));
	//     this.saveRecord('specialityConsultation');
	//   }
	// }

	// saveRangeOfMotion(data) {
	//   //  console.log(data);
	//   //  console.log(data.specialityConsultation);

	//   let currentSession: Appointment = JSON.parse(this.localStorage.get('currentSession'));
	//   if (currentSession.session) {
	//     currentSession.session.rangeOfMotion = data.rangeOfMotion;
	//     //  console.log(currentSession.session.phyOccChirott);
	//     if (data.id) {
	//       currentSession.session.id = data.id;
	//     }
	//     this.localStorage.set('currentSession', JSON.stringify(currentSession));
	//     this.saveRecord('rangeOfMotion');
	//   }
	// }
}
