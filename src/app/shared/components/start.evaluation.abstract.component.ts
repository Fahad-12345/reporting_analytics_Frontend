import { EnumSpecialtyTypes } from './../modules/doctor-calendar/utils/my-calendar/src/modules/common/specialty-types';
import { MainService } from '@shared/services/main-service';
import { Router } from '@angular/router';
import { RequestService } from '@shared/services/request.service';
import {
	Appointment,
	Insurance,
	Case,
	Accident,
	Doctor,
	Patient,
	MedicalSession,
	Evaluation,
	HeadInjury,
	PastMedicalHistory,
	Complaints2,
} from '@appDir/medical-doctor/models/common/commonModels';
import { MDService } from '@appDir/medical-doctor/services/md/medical-doctor.service';
import { ToastrService } from 'ngx-toastr';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import {
	HttpSuccessResponse,
	StorageData,
	UsersType,
} from '@appDir/pages/content-pages/login/user.class';
import { WaitingListDocUrlsEnum } from '@appDir/scheduler-front-desk/modules/waiting-list-doc/waiting-list-doc-urls-enum';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { DoctorCalendarUrlsEnum } from '../modules/doctor-calendar/doctor-calendar-urls-enum';
import { TemaplateManagerUrlsEnum } from '@appDir/template-manager/template-manager-url-enum';
import { ManualSpecialitiesUrlEnum } from '@appDir/manual-specialities/manual-specialities-url.enum';
import {
	convertDateTimeForRetrieving,
	convertDateTimeForSending,
	WithoutTime,
} from '../utils/utils.helpers';
import { ChangeDetectorRef } from '@angular/core';
import { getAge } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import * as moment from 'moment';
export abstract class StartEvaluation extends PermissionComponent {
	selectedAppointment: Appointment;
	templateEvaluationObject: any;
	WithoutTime = WithoutTime;
	public currentDate: Date;
	public userId;
	constructor(
		protected cdr?: ChangeDetectorRef,
		protected requestService?: RequestService,
		protected toastrService?: ToastrService,
		protected storageData?: StorageData,
		protected MDService?: MDService,
		public aclService?: AclService,
		protected route?: Router,
		protected mainService?: MainService,
	) {
		super(aclService, route);
	}
	public async startEvaluationAppointment(appObj) {
		let loggedUserDoctor = JSON.stringify(this.storageData.loggedInUser());
		const appointmentDetails = JSON.parse(JSON.stringify(appObj));
		// this.subjectSer.refreshStartEval([])
		if (appointmentDetails && !appointmentDetails.visit_session) {
			appointmentDetails['technician_id'] = appointmentDetails['technician_id'];
			appointmentDetails['template_id'] = appointmentDetails['template_id'];
			appointmentDetails['provider_id'] = appointmentDetails['provider_id'];
			appointmentDetails['template_type'] = appointmentDetails['template_type'];
		}
		if (appointmentDetails.available_doctor_id) {
			// appointmentDetails['docId'] = appointmentDetails.docAssign.docId;
			appointmentDetails['doctor_id'] =
				appointmentDetails && appointmentDetails.visit_session && appointmentDetails.provider_id
					? appointmentDetails.provider_id
					: appointmentDetails &&
					  !appointmentDetails.doctor_info &&
					  appointmentDetails.provider_id &&
					  this.storageData.loggedInUser() == UsersType.TECHNICIAN
					? appointmentDetails.provider_id
					: appointmentDetails.doctor_info.user_id;
		}
		// else
		// {
		// 	this.toastrService.error('No Provider is assigned to the appointment', 'Error');
		// 	return;
		// }
		// else if (appointmentDetails.available_speciality_id) {
		// 	this.toastrService.error('No Doctor is assigned to the appointment', 'Error');
		// 	return;
		// }
		if (!appointmentDetails.appId) {
			appointmentDetails['appId'] = appointmentDetails.id;
		}
		// const obj = {
		// 	'case_id': appointmentDetails.caseId,
		// 	'appointment_id': appointmentDetails.appId,
		// 	'status_id': 2,
		// };
		// this.requestService
		// 	.sendRequest(
		// 		DoctorCalendarUrlsEnum.change_status,
		// 		'PUT',
		// 		REQUEST_SERVERS.kios_api_path,
		// 		obj
		// 	).subscribe(
		// 		(response: HttpSuccessResponse) => {
		// 		});
		
		const object = {
			current_date_time: convertDateTimeForSending(this.storageData, new Date()),
			id: appointmentDetails.appId,
			// 'status': 'in_session',
			speciality_id: appointmentDetails.speciality_id,
			doctor_id:
				loggedUserDoctor != UsersType.PROVIDER
					? appointmentDetails.provider_id
					: this.storageData.getUserId(),
			is_speciality_base: appointmentDetails.available_doctor_id ? false : true,
			facility_location_id : appointmentDetails?.facility_id
		};
		if (appObj['showCheck']) {
			if (
				!appointmentDetails.has_app &&
				appointmentDetails.speciality_key &&
				appointmentDetails.speciality_key !== 'medical_doctor'
			) {
				if (appointmentDetails.available_doctor_id) {
					// appointmentDetails['docId'] = appointmentDetails.docAssign.docId;
				}
				const visitObj = {
					case_id: appointmentDetails.case_id,
					patient_id: appointmentDetails.patient_id,
					doctor_id: appointmentDetails.doctor_id,
					visit_date: appointmentDetails.start,
					appointment_type_id: appointmentDetails.appointment_type_id,
					speciality_id: appointmentDetails.speciality_id,
					appointment_id: appointmentDetails.appId,
					facility_location_id: appointmentDetails.facility_id,
					template_id: appointmentDetails.template_id,
					technician_id: appointmentDetails.technician_id,
					provider_id: appointmentDetails.provider_id,
					template_type: appointmentDetails.template_type,
					reading_provider: appointmentDetails.reading_provider_id,
					cd: appointmentDetails.cd_image ? 1 : appointmentDetails.cd_image == false ? 0 : null,
				};
				// return;
				this.requestService
					.sendRequest(
						DoctorCalendarUrlsEnum.createVisitSession_manualApps,
						'POST',
						REQUEST_SERVERS.fd_api_url,
						visitObj,
					)
					.subscribe((res: HttpSuccessResponse) => {
						const visitObjUpdate = {
							case_id: appointmentDetails.case_id,
							patient_id: appointmentDetails.patient_id,
							doctor_id: appointmentDetails.doctor_id,
							visit_date: appointmentDetails.start,
							appointment_type_id: appointmentDetails.appointment_type_id,
							speciality_id: appointmentDetails.speciality_id,
							appointment_id: appointmentDetails.appId,
							visitSessionId: res.result.data.id,
							reading_provider: appointmentDetails.reading_provider_id,
						};
						// this.requestService
						//     .sendRequest(
						//         DoctorCalendarUrlsEnum.updateVisitSessionManualApps,
						//         'POST',
						//         REQUEST_SERVERS.fd_api_url,
						//         visitObjUpdate
						//     ).subscribe(
						//         (resp: HttpSuccessResponse) => { });
					}, error=>{
						this.updateLoader(false)
					});
			}
			this.requestService
				.sendRequest(
					DoctorCalendarUrlsEnum.caseDetail +
						JSON.stringify(appointmentDetails.case_id) +
						'&route=schduler_app',
					'GET',
					REQUEST_SERVERS.kios_api_path,
				)
				.subscribe((response: any) => {
					let insu: Insurance;
					for (let i = 0; i < response.result.data.case_insurances.length; i++) {
						if (response.result.data.case_insurances[i].type.toLowerCase() === 'primary') {
							insu = new Insurance({
								id: response.result.data.case_insurances[i].id,
								companyName: response.result.data.case_insurances[i].insurance_name,
							});
						}
					}
					let _case: Case[] = [];
					if (response.result.data.accident_information) {
						_case = [
							new Case({
								id: appointmentDetails.case_id,
								accidentId: response.result.data.accident_information.id,
								caseType: response.result.data.case_type.name,
								caseTypeSlug: response.result.data.case_type.slug,
								accident: new Accident({
									id: response.result.data.accident_information.id,
									accidentDate: response.result.data.accident_information.accident_date,
								}),
								insurance: insu,
							}),
						];
					} else {
						_case = [
							new Case({
								id: appointmentDetails.case_id,
								accidentId: null,
								caseType: response.result.data.case_type.name,
								caseTypeSlug: response.result.data.case_type.slug,
								accident: null,
								insurance: insu,
							}),
						];
					}
					if (
						this.storageData.loggedInUser() == UsersType.PROVIDER ||
						(this.storageData.loggedInUser() != UsersType.PROVIDER &&
							this.storageData.loggedInUser() == UsersType.TECHNICIAN)
					) {
						this.requestService
							.sendRequest(
								WaitingListDocUrlsEnum.getDoctorDetails,
								'GET',
								REQUEST_SERVERS.schedulerApiUrl1,
								{
									doctor_id:
										appointmentDetails &&
										!appointmentDetails.doctor_info &&
										appointmentDetails.provider_id
											? appointmentDetails.provider_id
											: appointmentDetails.doctor_id,
								},
							)
							.subscribe((res: HttpSuccessResponse) => {
								// const facility = this.storageData.getFacilityLocations();
								// for (let i = 0; Array.isArray(res.result.data[0].specialities) && i < res.result.data[0].specialities.length; i++) {
								// 	for (let j = 0; j < facility.length; j++) {
								// 		if (facility[j] === res.result.data[0].specialities[i].facilityId) {
								// 			res.result.data[0]['specialities'] = res.result.data[0].specialities[i];
								// 			break;
								// 		}
								// 	}
								// }
								// if (!res.result.data[0].speciality) {
								// 	res.result.data[0]['speciality'] = { 'name': null };
								// }
								const doctor: Doctor[] = [
									new Doctor({
										id: appointmentDetails.doctor_id,
										firstName: res.result.data[0].doctor.info.first_name,
										middleName: res.result.data[0].doctor.info.middle_name,
										lastName: res.result.data[0].doctor.info.last_name,
										specialization: res.result.data[0].doctor.specialities.name,
									}),
								];
								this.startEvalLink(appointmentDetails, doctor, _case);
							}, error=>{
								this.updateLoader(false)
							});
					} else if (this.storageData.isSuperAdmin()) {
						const basic = this.storageData.getBasicInfo();
						const doctor: Doctor[] = [
							new Doctor({
								id: appointmentDetails.doctor_id,
								firstName: basic.first_name,
								middleName: basic.middle_name,
								lastName: basic.last_name,
								specialization: null,
							}),
						];
						this.startEvalLink(appointmentDetails, doctor, _case);
					}
				}, error=>{
					this.updateLoader(false)
				});
		} else {
			if (appObj['visit_session']) {
				if (
					!appointmentDetails.has_app &&
					appointmentDetails.speciality_key &&
					appointmentDetails.speciality_key !== 'medical_doctor'
				) {
					// if (appointmentDetails.docAssign) {
					// 	appointmentDetails['docId'] = appointmentDetails.docAssign.docId;
					// }
					if (appointmentDetails.available_doctor_id) {
						appointmentDetails['doctor_id'] =
							appointmentDetails && appointmentDetails.doctor_info
								? appointmentDetails.doctor_info.user_id
								: null;
					}
				}
				this.requestService
					.sendRequest(
						DoctorCalendarUrlsEnum.caseDetail +
							JSON.stringify(appointmentDetails.case_id) +
							'&route=schduler_app',
						'GET',
						REQUEST_SERVERS.kios_api_path,
					)
					.subscribe((response: any) => {
						let insu: Insurance;
						appointmentDetails['case_type_id'] = response.result.data.case_type_id;
						appointmentDetails['case_type_slug'] = response.result.data.case_type.slug;
						for (let i = 0; i < response.result.data.case_insurances.length; i++) {
							if (response.result.data.case_insurances[i].type.toLowerCase() === 'primary') {
								insu = new Insurance({
									id: response.result.data.case_insurances[i].id,
									companyName: response.result.data.case_insurances[i].insurance_name,
								});
							}
						}
						let _case: Case[] = [];
						if (response.result.data.accident_information) {
							_case = [
								new Case({
									id: appointmentDetails.case_id,
									accidentId: response.result.data.accident_information.id,
									caseType: response.result.data.case_type.name,
									caseTypeSlug: response.result.data.case_type.slug,
									accident: new Accident({
										id: response.result.data.accident_information.id,
										accidentDate: response.result.data.accident_information.accident_date,
									}),
									insurance: insu,
								}),
							];
						} else {
							_case = [
								new Case({
									id: appointmentDetails.case_id,
									accidentId: null,
									caseType: response.result.data.case_type.name,
									caseTypeSlug: response.result.data.case_type.slug,
									accident: null,
									insurance: insu,
								}),
							];
						}
						if (
							this.storageData.loggedInUser() == UsersType.PROVIDER ||
							(this.storageData.loggedInUser() != UsersType.PROVIDER &&
								this.storageData.loggedInUser() == UsersType.TECHNICIAN)
						) {
							this.requestService
								.sendRequest(
									WaitingListDocUrlsEnum.getDoctorDetails,
									'GET',
									REQUEST_SERVERS.schedulerApiUrl1,
									{
										doctor_id:
											appointmentDetails &&
											!appointmentDetails.doctor_info &&
											appointmentDetails.provider_id
												? appointmentDetails.provider_id
												: appointmentDetails.doctor_id,
									},
								)
								.subscribe((res: HttpSuccessResponse) => {
									// const facility = this.storageData.getFacilityLocations();
									// for (let i = 0; Array.isArray(res.result.data[0].specialities) && i < res.result.data[0].specialities.length; i++) {
									// 	for (let j = 0; j < facility.length; j++) {
									// 		if (facility[j] === res.result.data[0].specialities[i].facilityId) {
									// 			res.result.data[0]['specialities'] = res.result.data[0].specialities[i];
									// 			break;
									// 		}
									// 	}
									// }
									// if (!res.result.data[0].specialities) {
									// 	res.result.data[0]['specialities'] = { 'name': null };
									// }
									const doctor: Doctor[] = [
										new Doctor({
											id: appointmentDetails.doctor_id,
											firstName: res.result.data[0].doctor.info.first_name,
											middleName: res.result.data[0].doctor.info.middle_name,
											lastName: res.result.data[0].doctor.info.last_name,
											specialization: res.result.data[0].doctor.specialities.name,
										}),
									];
									this.startEvalLink(appointmentDetails, doctor, _case);
								});
						} else if (this.storageData.isSuperAdmin()) {
							const basic = this.storageData.getBasicInfo();
							const doctor: Doctor[] = [
								new Doctor({
									id: appointmentDetails.doctor_id,
									firstName: basic.first_name,
									middleName: basic.middle_name,
									lastName: basic.last_name,
									specialization: null,
								}),
							];
							this.startEvalLink(appointmentDetails, doctor, _case);
						}
					}, error=>{
						this.updateLoader(false)
					});
			} else {
				this.currentDate = new Date();
				if (this.WithoutTime(appObj.start) > this.WithoutTime(this.currentDate)) {
					this.toastrService.error('Future Appointment can not be evaluated.', 'Error');
					this.updateLoader(false)
					return;
				}
				await this.requestService
					.sendRequest(
						DoctorCalendarUrlsEnum.changeAppointmentStatus_new,
						'PUT',
						REQUEST_SERVERS.schedulerApiUrl1,
						object,
					)
					.subscribe((respAss: any) => {
						if (respAss.status == 406) {
							this.toastrService.error(respAss.status, 'Error');
							this.updateLoader(false)
						} else {
							appointmentDetails.available_doctor_id =
								respAss.result.data[0].appointment.available_doctor_id;
							if (respAss.result.data[0].appointment.availableDoctor) {
								appointmentDetails['doctor_id'] =
									respAss.result.data[0].appointment.availableDoctor.doctor_id;
							} else {
								appointmentDetails['doctor_id'] =
									loggedUserDoctor != UsersType.PROVIDER
										? appointmentDetails.provider_id
										: this.storageData.getUserId();
							}
							if (
								!appointmentDetails.has_app &&
								appointmentDetails.speciality_key &&
								appointmentDetails.speciality_key !== 'medical_doctor'
							) {
								const visitObj = {
									case_id: appointmentDetails.case_id,
									patient_id: appointmentDetails.patient_id,
									doctor_id: appointmentDetails.doctor_id,
									visit_date: appointmentDetails.start,
									appointment_type_id: appointmentDetails.appointment_type_id,
									speciality_id: appointmentDetails.speciality_id,
									appointment_id: appointmentDetails.appId,
									facility_location_id: appointmentDetails.facility_id,
									template_id: appointmentDetails.template_id,
									technician_id: appointmentDetails.technician_id,
									provider_id: appointmentDetails.provider_id,
									template_type: appointmentDetails.template_type,
									reading_provider: appointmentDetails.reading_provider_id,
									cd: appointmentDetails.cd_image
										? 1
										: appointmentDetails.cd_image == false
										? 0
										: null,
								};
								this.requestService
									.sendRequest(
										DoctorCalendarUrlsEnum.createVisitSession_manualApps,
										'POST',
										REQUEST_SERVERS.fd_api_url,
										visitObj,
									)
									.subscribe((res: HttpSuccessResponse) => {
										const visitObjUpdate = {
											case_id: appointmentDetails.case_id,
											patient_id: appointmentDetails.patient_id,
											doctor_id: appointmentDetails.doctor_id,
											visit_date: appointmentDetails.start,
											appointment_type_id: appointmentDetails.appointment_type_id,
											speciality_id: appointmentDetails.speciality_id,
											appointment_id: appointmentDetails.appId,
											visitSessionId: res.result.data.id,
											reading_provider: appointmentDetails.reading_provider_id,
										};
										// this.requestService
										//     .sendRequest(
										//         DoctorCalendarUrlsEnum.updateVisitSessionManualApps,
										//         'POST',
										//         REQUEST_SERVERS.fd_api_url,
										//         visitObjUpdate
										//     ).subscribe(
										//         (resp: HttpSuccessResponse) => { });
									}, error=>{
										this.updateLoader(false)
									});
							}
							this.requestService
								.sendRequest(
									DoctorCalendarUrlsEnum.caseDetail +
										JSON.stringify(appointmentDetails.case_id) +
										'&route=schduler_app',
									'GET',
									REQUEST_SERVERS.kios_api_path,
								)
								.subscribe((response: any) => {
									let insu: Insurance;
									appointmentDetails['case_type_id'] = response.result.data.case_type_id;
									appointmentDetails['case_type_slug'] = response.result.data.case_type.slug;
									for (let i = 0; i < response.result.data.case_insurances.length; i++) {
										if (response.result.data.case_insurances[i].type.toLowerCase() === 'primary') {
											insu = new Insurance({
												id: response.result.data.case_insurances[i].id,
												companyName: response.result.data.case_insurances[i].insurance_name,
											});
										}
									}
									let _case: Case[] = [];
									if (response.result.data.accident_information) {
										_case = [
											new Case({
												id: appointmentDetails.case_id,
												accidentId: response.result.data.accident_information.id,
												caseType: response.result.data.case_type.name,
												caseTypeSlug: response.result.data.case_type.slug,
												accident: new Accident({
													id: response.result.data.accident_information.id,
													accidentDate: response.result.data.accident_information.accident_date,
												}),
												insurance: insu,
											}),
										];
									} else {
										_case = [
											new Case({
												id: appointmentDetails.case_id,
												accidentId: null,
												caseType: response.result.data.case_type.name,
												caseTypeSlug: response.result.data.case_type.slug,
												accident: null,
												insurance: insu,
											}),
										];
									}
									if (
										this.storageData.loggedInUser() == UsersType.PROVIDER ||
										(this.storageData.loggedInUser() != UsersType.PROVIDER &&
											this.storageData.loggedInUser() == UsersType.TECHNICIAN)
									) {
										this.requestService
											.sendRequest(
												WaitingListDocUrlsEnum.getDoctorDetails,
												'GET',
												REQUEST_SERVERS.schedulerApiUrl1,
												{
													doctor_id:
														appointmentDetails &&
														!appointmentDetails.doctor_info &&
														appointmentDetails.provider_id
															? appointmentDetails.provider_id
															: appointmentDetails.doctor_id,
												},
											)
											.subscribe((res: HttpSuccessResponse) => {
												// const facility = this.storageData.getFacilityLocations();
												// for (let i = 0; Array.isArray(res.result.data[0].specialities) && i < res.result.data[0].specialities.length; i++) {
												// 	for (let j = 0; j < facility.length; j++) {
												// 		if (facility[j] === res.result.data[0].specialities[i].facilityId) {
												// 			res.result.data[0]['specialities'] = res.result.data[0].specialities[i];
												// 			break;
												// 		}
												// 	}
												// }
												// if (!res.result.data[0].speciality) {
												// 	res.result.data[0]['speciality'] = { 'name': null };
												// }
												const doctor: Doctor[] = [
													new Doctor({
														id: appointmentDetails.doctor_id,
														firstName: res.result.data[0].doctor.info.first_name,
														middleName: res.result.data[0].doctor.info.middle_name,
														lastName: res.result.data[0].doctor.info.last_name,
														specialization: res.result.data[0].doctor.specialities.name,
													}),
												];
												this.startEvalLink(appointmentDetails, doctor, _case);
											},  error=>{
												this.updateLoader(false)
											});
									} else if (this.storageData.isSuperAdmin()) {
										const basic = this.storageData.getBasicInfo();
										const doctor: Doctor[] = [
											new Doctor({
												id: appointmentDetails.doctor_id,
												firstName: basic.first_name,
												middleName: basic.middle_name,
												lastName: basic.last_name,
												specialization: null,
											}),
										];
										this.startEvalLink(appointmentDetails, doctor, _case);
									}
								}, error=>{
									this.updateLoader(false)
								});
						}
					}, error=>{
						this.updateLoader(false)
					});
			}
		}
	}
	routeFunction(appointmentDetails) {
		switch (appointmentDetails.speciality_key) {
			case appointmentDetails.speciality_key == EnumSpecialtyTypes.HBOT &&
			appointmentDetails.template_type == 'static_web'
				? EnumSpecialtyTypes.HBOT
				: null:
				this.route.navigate(['/hbot']);
				break;
			case appointmentDetails.speciality_key == EnumSpecialtyTypes.MEDICAL_DOCTOR &&
			appointmentDetails.template_type == 'static_web'
				? EnumSpecialtyTypes.MEDICAL_DOCTOR
				: null:
				this.route.navigate(['/medical-doctor']);
				break;
			case appointmentDetails.speciality_key == EnumSpecialtyTypes.MEDICAL_DOCTOR &&
			appointmentDetails.template_type == 'dynamic'
				? EnumSpecialtyTypes.MEDICAL_DOCTOR
				: null:
				this.routeTemplateManagerFunction(appointmentDetails);
				break;
			case appointmentDetails.speciality_key == EnumSpecialtyTypes.HBOT && appointmentDetails.template_type == 'dynamic'? EnumSpecialtyTypes.HBOT:null:
				{
				this.routeTemplateManagerFunction(appointmentDetails);
				break;
				}
			default:
				if (appointmentDetails.template_type == 'dynamic') {
					this.routeTemplateManagerFunction(appointmentDetails);
				} else {
					this.route.navigate(['/manual-specialities']);
				}
		}
	}
	routeTemplateManagerFunction(appointmentDetails) {
		this.requestService
			.sendRequest(ManualSpecialitiesUrlEnum.createSession, 'post', REQUEST_SERVERS.fd_api_url_vd, {
				case_id: this.templateEvaluationObject.case_id,
				patient_id: this.templateEvaluationObject.patientId,
				is_tm_updatable: 1,
				doctor_id: this.templateEvaluationObject.doctorId,
				speciality_id: this.templateEvaluationObject.speciality_id,
				appointment_id: this.templateEvaluationObject.id,
				appointment_type_id: this.templateEvaluationObject.visitId,
				visit_date: appointmentDetails.start,
				facility_location_id: this.templateEvaluationObject.location_id,
				reading_provider: appointmentDetails.reading_provider_id,
				cd: appointmentDetails.cd_image ? 1 : appointmentDetails.cd_image == false ? 0 : null,
			})
			.subscribe(async (res: any) => {
				this.templateEvaluationObject.templateVisitId = res.result && res.result.data && res.result.data.id;
				this.templateEvaluationObject['doctor_signature_id'] = res.result && res.result.data && res.result.data.doctor_signature_id;
				this.requestService
					.sendRequest(
						TemaplateManagerUrlsEnum.getVisitStatus + this.templateEvaluationObject.templateVisitId,
						'GET',
						REQUEST_SERVERS.fd_api_url,
					)
					.subscribe((response: HttpSuccessResponse) => {
						if (response.result && response.result.data) {
							this.templateEvaluationObject.visitStatus =
								response.result.data.visit_session_state_id;
							this.requestService
								.sendRequest(
									TemaplateManagerUrlsEnum.createAppSession,
									'post',
									REQUEST_SERVERS.schedulerApiUrl,
									{
										speciality_key: appointmentDetails.speciality_key.toLowerCase(),
										doctor_id: this.templateEvaluationObject.doctorId,
										case_id: this.templateEvaluationObject.case_id,
										visit_session_id: response.result.data.id,
										patient_id: this.templateEvaluationObject.patientId,
									},
								)
								.subscribe((res) => {
									this.requestService
										.sendRequest(
											TemaplateManagerUrlsEnum.getTemplateByID,
											'POST',
											REQUEST_SERVERS.templateManagerUrl,
											{
												visit_id: this.templateEvaluationObject.templateVisitId,
												template_id:
													this.templateEvaluationObject &&
													this.templateEvaluationObject.template_id,
											},
										)
										.subscribe(async (res: any) => {
											const scheduler = this.storageData.getSchedulerInfo();
											let appDetails = {
												office_location_phone: response.result.data.facility_location.phone,
												office_location_street: response.result.data.facility_location.address,
												office_location_suite_floor: response.result.data.facility_location.floor,
												office_location_city: response.result.data.facility_location.city,
												office_location_state: response.result.data.facility_location.state,
												office_location_zip: response.result.data.facility_location.zip,
												office_location_address:
													response.result.data.facility_location.address +
													', ' +
													response.result.data.facility_location.city +
													' ' +
													response.result.data.facility_location.state +
													', ' +
													response.result.data.facility_location.zip,
											};
											this.templateEvaluationObject = {
												...this.templateEvaluationObject,
												...appDetails,
											};
											scheduler.template_instance = this.templateEvaluationObject;
											this.storageData.setSchedulerInfo(scheduler);
											if (res['data'].length === 0) {
												this.toastrService.error('No template Stored .', 'Error');
												this.updateLoader(false)
											} else {
												this.route.navigate(
													['/template-manager/instance'],
													this.templateEvaluationObject,
												);
											}
										},  error=>{
											this.updateLoader(false)
										});
								},  error=>{
									this.updateLoader(false)
								});
						}
					},  error=>{
						this.updateLoader(false)
					});
			}, error=>{
				this.updateLoader(false)
			});
	}
	public startEvalLink(appointmentDetails, doctor, _case) {
		this.requestService
			.sendRequest(
				DoctorCalendarUrlsEnum.getKioskPatientInfo,
				'GET',
				REQUEST_SERVERS.schedulerApiUrl1,
				{
					id: appointmentDetails.patient_id,
				},
			)
			.subscribe((resp_patient: any) => {
				const resp = resp_patient.result.data;
				let patientDetail = JSON.parse(JSON.stringify(resp));
				patientDetail['patient_name'] = `${patientDetail.first_name} ${
					patientDetail.middle_name ? patientDetail.middle_name + ' ' : ''
				}${patientDetail.last_name}`;
				patientDetail['marital_status'] = patientDetail.meritial_status;
				patientDetail['social_secuirty_no'] = patientDetail.ssn;
				patientDetail['ext'] = patientDetail.ext_no;
				if (patientDetail.created_at) {
					patientDetail['date_of_admission'] = convertDateTimeForRetrieving(
						this.storageData,
						new Date(patientDetail.created_at),
					);
					patientDetail['date_of_admission'] =
						('0' + (patientDetail['date_of_admission'].getMonth() + 1)).slice(-2) +
						'-' +
						('0' + patientDetail['date_of_admission'].getDate()).slice(-2) +
						'-' +
						('0' + patientDetail['date_of_admission'].getFullYear())
				}
				patientDetail['resendtial_apartment_suite'] = patientDetail.residential_apartment;
				if (patientDetail.dob) {
					let dobAge = convertDateTimeForRetrieving(
						this.storageData,
						new Date(patientDetail.dob),
					);
					let age= getAge(dobAge,'long')	
					patientDetail['age'] = age;
					patientDetail['patient_age'] = age;
					patientDetail['dob_date_of_birth'] = moment(patientDetail.dob, 'YYYY-MM-DD').format('MM-DD-YYYY')
				}
				patientDetail['weight'] = patientDetail.weight_lbs + 'lbs';
				patientDetail['height_in_feet'] = patientDetail.height_ft;
				patientDetail['height_in_inches'] = patientDetail.height_in;
				patientDetail['home_phone'] =
					patientDetail.contact_info && patientDetail.contact_info.home_phone;
				patientDetail['cell_phone'] =
					patientDetail.contact_info && patientDetail.contact_info.cell_phone;
				patientDetail['work_phone'] =
					patientDetail.contact_info && patientDetail.contact_info.work_phone;
				patientDetail['mailing_city'] = 'N/A';
				patientDetail['mailing_state'] = 'N/A';
				patientDetail['mailing_zip'] = 'N/A';
				patientDetail['mailing_address'] = 'N/A';
				patientDetail['resendtial_city'] = 'N/A';
				patientDetail['resendtial_state'] = 'N/A';
				patientDetail['resendtial_zip'] = 'N/A';
				patientDetail['resendtial_addrees'] = 'N/A';
				if (
					patientDetail &&
					patientDetail.contact_info &&
					patientDetail.contact_info.patientAddress
				) {
					for (let j = 0; j < patientDetail.contact_info.patientAddress.length; j++) {
						if (patientDetail.contact_info.patientAddress[j].type == 'mailing') {
							patientDetail['mailing_city'] = patientDetail.contact_info.patientAddress[j].city;
							patientDetail['mailing_state'] = patientDetail.contact_info.patientAddress[j].state;
							patientDetail['mailing_zip'] = patientDetail.contact_info.patientAddress[j].zip;
							patientDetail['mailing_address'] =
								'Apartment:' +
								patientDetail.contact_info.patientAddress[j].apartment +
								', Street:' +
								patientDetail.contact_info.patientAddress[j].street +
								', City:' +
								patientDetail.contact_info.patientAddress[j].city +
								', State:' +
								patientDetail.contact_info.patientAddress[j].state +
								', Zip:' +
								patientDetail.contact_info.patientAddress[j].zip;
							patientDetail['patient_mailing_address'] =
								'Apartment:' +
								patientDetail.contact_info.patientAddress[j].apartment +
								', Street:' +
								patientDetail.contact_info.patientAddress[j].street +
								', City:' +
								patientDetail.contact_info.patientAddress[j].city +
								', State:' +
								patientDetail.contact_info.patientAddress[j].state +
								', Zip:' +
								patientDetail.contact_info.patientAddress[j].zip;
						} else if (patientDetail.contact_info.patientAddress[j].type == 'residential') {
							patientDetail['resendtial_city'] = patientDetail.contact_info.patientAddress[j].city;
							patientDetail['resendtial_state'] =
								patientDetail.contact_info.patientAddress[j].state;
							patientDetail['resendtial_zip'] = patientDetail.contact_info.patientAddress[j].zip;
							patientDetail['resendtial_addrees'] =
								'Apartment:' +
								patientDetail.contact_info.patientAddress[j].apartment +
								', Street:' +
								patientDetail.contact_info.patientAddress[j].street +
								', City:' +
								patientDetail.contact_info.patientAddress[j].city +
								', State:' +
								patientDetail.contact_info.patientAddress[j].state +
								', Zip:' +
								patientDetail.contact_info.patientAddress[j].zip;
							patientDetail['patient_mailing_address'] = 'N/A';
						}
					}
				}
				patientDetail['today_date'] = convertDateTimeForRetrieving(this.storageData, new Date());
				patientDetail['today_date'] =
					('0' + (patientDetail['today_date'].getMonth() + 1)).slice(-2) +
					'-' +
					('0' + patientDetail['today_date'].getDate()).slice(-2) +
					'-' +
					('0' + patientDetail['today_date'].getFullYear())
				this.templateEvaluationObject = patientDetail;
				var weigth: any = 'N/A';
				var height: any = 'N/A';
				if (resp.weight_lbs !== null && resp.weight_lbs !== '') {
					weigth = resp.weight_lbs.toString() + ' lbs';
				}
				if (resp.height_ft !== null && resp.height_ft !== '') {
					if (resp.height_in !== null && resp.height_in !== '') {
						height = resp.height_ft.toString() + "'" + resp.height_in + '"';
					} else {
						height = resp.height_ft.toString() + "'" + '0' + '"';
					}
				}
				const patient: Patient[] = [
					new Patient({
						id: resp.id,
						firstName: resp.first_name,
						middleName: resp.middle_name,
						lastName: resp.last_name,
						dob: resp.dob,
						imagePath: resp.profile_avatar,
						weight: weigth,
						height: height,
						gender: resp.gender,
						maritalStatus: resp.meritial_status,
					}),
				];
				let status = '';
				let checked_in_time = 'N/A';
				this.requestService
					.sendRequest(
						DoctorCalendarUrlsEnum.get_checked_in_patients,
						'POST',
						REQUEST_SERVERS.kios_api_path,
						{
							case_ids: [appointmentDetails.case_id],
							current_date: convertDateTimeForSending(this.storageData, new Date()),
						},
					)
					.subscribe((respp: any) => {
						for (
							let i = 0;
							i < respp.result.data.case_patients &&
							respp.result.data.case_patients[0].patient_sessions.length;
							i++
						) {
							if (
								respp.result.data.case_patients[0].patient_sessions[i].appointment_id ===
								appointmentDetails.appId
							) {
								status = respp.result.data.case_patients[0].patient_sessions[i].status;
								checked_in_time =
									respp.result.data.case_patients[0].patient_sessions[i].time_of_check_in;
							}
						}
						let visitType = '';
						switch (appointmentDetails.appointment_type_id) {
							case 1:
								visitType = 'evaluation';
								break;
							case 2:
								visitType = 'followUp';
								break;
							case 3:
								visitType = 'reEvaluation';
								break;
							case 4:
								visitType = 'general';
								break;
							default:
								visitType = 'evaluation';
						}
						if (
							appointmentDetails.speciality_key &&
							appointmentDetails.speciality_key === 'medical_doctor' &&
							(appointmentDetails.template_type == 'manual' ||
								appointmentDetails.template_type == 'static_web')
						) {
							this.selectedAppointment = new Appointment({
								id: appointmentDetails.appId,
								caseId: appointmentDetails.case_id,
								case_type_slug: appointmentDetails.case_type_slug,
								patientId: appointmentDetails.patient_id,
								doctorId: appointmentDetails.doctor_id,
								visitType: visitType,
								appointment_type_id: appointmentDetails.appointment_type_id,
								visitId: appointmentDetails.appointment_type_id,
								start: appointmentDetails.start,
								end: appointmentDetails.end,
								title: appointmentDetails.appointment_title,
								chartNo: appointmentDetails.patient_id.toString(),
								status: status,
								checkInTime: new Date(),
								appointment_slug: appointmentDetails.appointment_type_slug,
								speciality: appointmentDetails.speciality_name,
								speciality_id: appointmentDetails.speciality_id,
								doctor: doctor[0],
								patient: patient[0],
								session: null,
								case: _case[0],
								clinicId: appointmentDetails.facility_id,
								reading_provider_id: appointmentDetails.reading_provider_id,
								cd_image: appointmentDetails.cd_image,
							});
							this.selectedAppointment.session = new MedicalSession({
								id: '',
								appointment_id: appointmentDetails.appId,
								evaluation: new Evaluation({}),
								currentComplaints: [],
								headInjury: new HeadInjury({}),
								currentComplaints2: new Complaints2({}),
								pastMedicalHistory: new PastMedicalHistory({}),
							});
							this.MDService.setCurrentSession({
								...this.selectedAppointment,
								...appointmentDetails,
							});
							// localStorage.setItem('templateObj', JSON.stringify(this.templateEvaluationObject,...appointmentDetails));
						} else if (
							appointmentDetails.speciality_key &&
							appointmentDetails.speciality_key === 'hbot' &&
							!appointmentDetails.is_manual_specialty
						) {
							let tempCompanyName = 'N/A';
							if (_case[0] && _case[0].insurance && _case[0].insurance.companyName) {
								tempCompanyName = _case[0].insurance.companyName;
							}
							let appDetails = {
								id: appointmentDetails.appId,
								case_id: appointmentDetails.case_id,
								case_type_id: appointmentDetails.case_type_id,
								case_type_slug: appointmentDetails.case_type_slug,
								patientId: appointmentDetails.patient_id,
								doctorId: appointmentDetails.doctor_id,
								visit_type: visitType,
								appointment_type_id: appointmentDetails.appointment_type_id,
								visitId: appointmentDetails.appointment_type_id,
								current_aptdate_time: appointmentDetails.start,
								end: appointmentDetails.end,
								apt_title: appointmentDetails.appointment_title,
								chart_id: appointmentDetails.patient_id.toString(),
								chart_id_formatted: appointmentDetails?.chart_id_formatted?.toString(),
								status: status,
								checked_in_time: checked_in_time,
								checkInTime: new Date(),
								appointment_slug: appointmentDetails.appointment_type_slug,
								// speciality: appointmentDetails.speciality_id,
								provider_doctor_name:
									doctor[0].firstName + ' ' + doctor[0].middleName + ' ' + doctor[0].lastName,
								patient: patient[0],
								office_location_name: appointmentDetails.facility_name,
								session: null,
								case_type: _case[0].caseType,
								insurance: tempCompanyName,
								doa_date_of_accident: _case[0].accident.accidentDate,
								current_date: convertDateTimeForRetrieving(this.storageData, new Date()),
								location_id: appointmentDetails.facility_id,
								// speciality_id: appointmentDetails.speciality_id,
								speciality: appointmentDetails.speciality_name,
								speciality_id: appointmentDetails.speciality_id,
								template_id: appointmentDetails.template_id,
								technician_id: appointmentDetails.technician_id,
								provider_id: appointmentDetails.provider_id,
								template_type: appointmentDetails.template_type,
								reading_provider_id: appointmentDetails.reading_provider_id,
								cd_image: appointmentDetails.cd_image,
								// enableSaveRecordHbot:this.mainService.getenableSaveRecordHbot()
							};
							this.templateEvaluationObject = { ...this.templateEvaluationObject, ...appDetails };
							localStorage.setItem('templateObj', JSON.stringify(this.templateEvaluationObject));
							this.storageData.set_enableSaveRecordHbot_LocalStorageData(
								this.mainService.getenableSaveRecordHbot(),
							);
							this.routeFunction(appointmentDetails);
						} else {
							if (appointmentDetails.template_type == 'manual') {
								let tempCompanyName = 'N/A';
								if (_case[0] && _case[0].insurance && _case[0].insurance.companyName) {
									tempCompanyName = _case[0].insurance.companyName;
								}
								let appDetails = {
									id: appointmentDetails.appId,
									case_id: appointmentDetails.case_id,
									case_type_id: appointmentDetails.case_type_id,
									case_type_slug: appointmentDetails.case_type_slug,
									patientId: appointmentDetails.patient_id,
									doctorId: appointmentDetails.doctor_id,
									visit_type: visitType,
									appointmentTypeId: appointmentDetails.appointment_type_id,
									visitId: appointmentDetails.appointment_type_id,
									current_aptdate_time: appointmentDetails.start,
									end: appointmentDetails.end,
									apt_title: appointmentDetails.appointment_title,
									chart_id: appointmentDetails.patient_id.toString(),
									chart_id_formatted: appointmentDetails?.chart_id_formatted?.toString(),
									status: status,
									checked_in_time: checked_in_time,
									checkInTime: new Date(),
									appointment_slug: appointmentDetails.appointment_type_slug,
									// speciality: appointmentDetails.speciality_id,
									provider_doctor_name:
										doctor[0].firstName + ' ' + doctor[0].middleName + ' ' + doctor[0].lastName,
									patient: patient[0],
									office_location_name: appointmentDetails.facility_name,
									session: null,
									case_type: _case[0].caseType,
									insurance: tempCompanyName,
									doa_date_of_accident: _case[0].accident.accidentDate,
									current_date: convertDateTimeForRetrieving(this.storageData, new Date()),
									location_id: appointmentDetails.facility_id,
									speciality: appointmentDetails.speciality_name,
									speciality_id: appointmentDetails.speciality_id,
									template_id: appointmentDetails.template_id,
									technician_id: appointmentDetails.technician_id,
									provider_id: appointmentDetails.provider_id,
									template_type: appointmentDetails.template_type,
									reading_provider_id: appointmentDetails.reading_provider_id,
									cd_image: appointmentDetails.cd_image,
									// enableSaveRecordManualSpeciality:this.mainService.getenableSaveRecordManualSpeciality()
								};
								// appDetails.enableSaveRecordManualSpeciality
								if (appDetails.doa_date_of_accident) {
									appDetails.doa_date_of_accident =
										appDetails.doa_date_of_accident.substring(5, 7) +
										'-' +
										appDetails.doa_date_of_accident.substring(8, 10) +
										'-' +
										appDetails.doa_date_of_accident.substring(0, 4);
								}
								this.templateEvaluationObject = { ...this.templateEvaluationObject, ...appDetails };
								localStorage.setItem('templateObj', JSON.stringify(this.templateEvaluationObject));
								this.routeFunction(appointmentDetails);
							} else {
								let tempCompanyName = 'N/A';
								if (_case[0] && _case[0].insurance && _case[0].insurance.companyName) {
									tempCompanyName = _case[0].insurance.companyName;
								}
								let appDetails = {
									id: appointmentDetails.appId,
									case_id: appointmentDetails.case_id,
									case_type_id: appointmentDetails.case_type_id,
									case_type_slug: appointmentDetails.case_type_slug,
									appointment_cpt_codes: appointmentDetails.appointment_cpt_codes,
									patientId: appointmentDetails.patient_id,
									doctorId: appointmentDetails.doctor_id,
									visit_type: visitType,
									appointmentTypeId: appointmentDetails.appointment_type_id,
									visitId: appointmentDetails.appointment_type_id,
									current_aptdate_time: appointmentDetails.start,
									end: appointmentDetails.end,
									apt_title: appointmentDetails.appointment_title,
									chart_id: appointmentDetails.patient_id.toString(),
									chart_id_formatted: appointmentDetails?.chart_id_formatted?.toString(),
									status: status,
									checked_in_time: checked_in_time,
									checkInTime: new Date(),
									appointment_slug: appointmentDetails.appointment_type_slug,
									// speciality: appointmentDetails.speciality_id,
									provider_doctor_name:
										doctor[0].firstName + ' ' + doctor[0].middleName + ' ' + doctor[0].lastName,
									patient: patient[0],
									office_location_name: appointmentDetails.facility_name,
									session: null,
									case_type: _case[0].caseType,
									insurance: tempCompanyName,
									doa_date_of_accident: _case[0].accident.accidentDate,
									current_date: convertDateTimeForRetrieving(this.storageData, new Date()),
									location_id: appointmentDetails.facility_id,
									speciality: appointmentDetails.speciality_name,
									speciality_id: appointmentDetails.speciality_id,
									template_id: appointmentDetails.template_id,
									technician_id: appointmentDetails.technician_id,
									provider_id: appointmentDetails.provider_id,
									template_type: appointmentDetails.template_type,
									reading_provider_id: appointmentDetails.reading_provider_id,
									cd_image: appointmentDetails.cd_image,
									// enableSaveRecordManualSpeciality:this.mainService.getenableSaveRecordManualSpeciality()
								};
								// appDetails.enableSaveRecordManualSpeciality
								if (appDetails.doa_date_of_accident) {
									appDetails.doa_date_of_accident =
										appDetails.doa_date_of_accident.substring(5, 7) +
										'-' +
										appDetails.doa_date_of_accident.substring(8, 10) +
										'-' +
										appDetails.doa_date_of_accident.substring(0, 4);
								}
								this.templateEvaluationObject = { ...this.templateEvaluationObject, ...appDetails };
								localStorage.setItem('templateObj', JSON.stringify(this.templateEvaluationObject));
								const scheduler = this.storageData.getSchedulerInfo();
								scheduler.template_instance = this.templateEvaluationObject;
								this.storageData.setSchedulerInfo(scheduler);
								this.storageData.set_enableSaveRecordManualSpeciality_LocalStorageData(
									this.mainService.getenableSaveRecordManualSpeciality(),
								);
								// if (appointmentDetails.is_manual_specialty) {
								this.routeFunction(appointmentDetails);
								// manual-specialities
								// this.route.navigate(['/manual-specialities']);
								// }
								// else {
								// 	this.templateEvaluationObject = { ...this.templateEvaluationObject, ...appDetails };
								// 	localStorage.setItem('templateObj', JSON.stringify(this.templateEvaluationObject));
								// 	this.routeFunction(appointmentDetails);
								// }
							}
						}
					});
			}, error=>{
				this.updateLoader(false)
			});
	}

	public updateLoader(state: boolean) {
		this.mainService.isLoaderPending.next(state);
		this.cdr.markForCheck();
	}
}
