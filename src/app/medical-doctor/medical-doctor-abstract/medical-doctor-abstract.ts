import { FormGroup, FormBuilder, FormControl, FormArray, AbstractControl } from '@angular/forms';
import { MainService } from '@appDir/shared/services/main-service';
import { RequestService } from '@appDir/shared/services/request.service';
import { StorageData, HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { ToastrService } from 'ngx-toastr';
import { MDSessionEnum } from '../MDSession.enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { Appointment } from '../models/common/commonModels';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AcceptedData } from '../services/carry-forward/model/accepted-data';
import { MdLinks } from '../models/panel/model/md-links';
import { CarryForwardService } from '../services/carry-forward/carry-forward.service';
import { medicalDoctorUrlsEnum } from '../medical-doctor-URls-enum';
import { MDService } from '../services/md/medical-doctor.service';
import { getObjectChildValue, removeEmptyAndNullsFormObject } from '@appDir/shared/utils/utils.helpers';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';

import { Component } from '@angular/core';

@Component({
  template: ''
})

export abstract class MedicalDoctorAbstract {
	protected subscriptions: Subscription[] = [];
	public form: FormGroup;
	public visitType: string; //'reEvaluation';
	public gender: string;
	public maxLength = 1023;
	public carryForwarded: boolean = false;
	public appointment: Appointment;
	public link: MdLinks;
	public formData;
	public loading = false;
	/*: any = {
		comments: '',
		icd10_codes: [{ id: 30, description: 'fuity', name: 'icd', type: 'ICD' }],
	};*/
	public messages = {
		loadPreviousSession: 'Are you sure you want to carry forward previous session data?',
		clearData: 'Are you sure you want to clear all data?',
		// discardAndloadPreviousSession:
		// 'Are you sure you want to discard current changes and load previous session data?',
		// discardClearData: 'Are you sure you want to discard current changes and clear all data?',
	};

	abstract currentScreen: string;
	abstract initializeForm(data: any): void;

	/**
	 * Creates an instance of md commons.
	 * @param mainService
	 */
	constructor(
		public mainService: MainService,
		protected requestService: RequestService,
		protected storageData: StorageData,
		protected mdService: MDService,
		protected toastrService: ToastrService,
		protected fb: FormBuilder,
		protected route: Router,
		public carryForwardService?: CarryForwardService,
		public customDiallogService? : CustomDiallogService,

	) {
		this.mainService.setPanelData();
		this.getSeededInfo();
		this.appointment = this.mdService.getCurrentSession();
		this.gender = getObjectChildValue(this.appointment, '', ['patient', 'gender']);
		this.visitType = getObjectChildValue(this.appointment, '', ['visitType']);
		if (!this.appointment) {
			this.route.navigate([`/scheduler-front-desk/doctor-calendar`]);
		}
	}

	/**
	 * Checks if the form field is not touched and form data is carried from previous session
	 * @param form
	 * @param field
	 * @returns
	 */
	public checkCarryForward(form: FormGroup | AbstractControl, field: string) {
		let condition =
			(form.get(field).value != null) && !form.get(field).dirty && this.carryForwarded && (this.visitType == 'reEvaluation' ||this.visitType == 'followUp');
		// ;
		// console.log(condition);
		return condition;
	}

	/**
	 * Determines whether field is required or not
	 * @param form
	 * @param field
	 * @returns
	 */
	public isRequired(form: FormGroup, field: string) {
		return form.get(field).errors && form.get(field).errors.required;
	}

	/**
	 * Gets seeded info
	 */
	getSeededInfo() {
		if (!this.mdService.getOfflineData()) {
			this.loading = true;
			this.requestService
				.sendRequest(
					MDSessionEnum.Seeded_Info_GET,
					'GET',
					REQUEST_SERVERS.medical_doctor_api_url,
					removeEmptyAndNullsFormObject({ user_id: this.storageData.getUserId() }),
				)
				.subscribe(
					(responce: HttpSuccessResponse) => {
						this.mdService.setOfflineData(responce.result.data);
						this.loading = false;
					},
					(error) => {
						this.loading = false;
					},
				);
		}
	}

	public carryForward(off: boolean = false, form: FormArray | FormGroup = this.form) {
		let confirmationMessage = '';
		let acceptedData: AcceptedData = new AcceptedData({
			link: this.link,
			accepted: true,
		});
		if (this.visitType == 'reEvaluation' || this.visitType == 'followUp' ) {
			if (!off) {
				confirmationMessage = this.messages.loadPreviousSession;
				// form.touched && form.dirty
				// 	? this.messages.discardAndloadPreviousSession
				// 	: this.messages.loadPreviousSession;
				this.customDiallogService.confirm('Please confirm', confirmationMessage,'Yes','No')
				.then((confirmed) => {
					
					if (confirmed  && !this.loading){
						
						// // dummy;
							// this.initializeForm(this.formData);
							// this.form.markAsPristine();
							// this.carryForwarded = true;

							// actual;
							this.carryForwardService.carryForwardAccepted(acceptedData);
							let sessionData: Appointment = this.storageData.getcurrentSession();
							let appointment_id = getObjectChildValue(sessionData, null, [
								'session',
								'appointment_id',
							]);

							let request = {
								appointmentId: appointment_id,
								doctorId: sessionData.doctorId,
								patientId: sessionData.patientId,
								caseId: sessionData.caseId,
								oldVisitSessionId: sessionData.oldVisitSessionId,
								screen: this.currentScreen,
							};

							this.loading = true;
							this.mdService
								.carryForward(medicalDoctorUrlsEnum.CarryForward_Evaluation_GET, request)
								.subscribe(
									(res: HttpSuccessResponse) => {
										this.loading = false;
										if (this.currentScreen == 'currentComplaints' || this.currentScreen == 'test_results'){
											this.formData = res.result.data;
										}
										 else {
											this.formData = res.result.data[this.currentScreen];
										}
										this.carryForwarded = true;
										this.initializeForm(this.formData);
									},
									(err) => {
										this.loading = false;
										this.carryForwarded = false;
										acceptedData.accepted = false;
										this.carryForwardService.carryForwardAccepted(acceptedData);
									},
								);
						} else {
							acceptedData.accepted = false;
							this.carryForwardService.carryForwardAccepted(acceptedData);
						}
				})
				.catch();
			} else {
				confirmationMessage = this.messages.clearData;
				// form.touched && form.dirty ? this.messages.discardClearData : this.messages.clearData;
				this.customDiallogService.confirm('Please confirm', confirmationMessage,'Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
				acceptedData.accepted = true;
							this.carryForwardService.carryForwardAccepted(acceptedData);
							this.initializeForm(null);
							this.carryForwarded = false;
						} else {
							acceptedData.accepted = false;
							this.carryForwardService.carryForwardAccepted(acceptedData);
						}
		})
		.catch();

			}
		}
	}

	public subscribeCarryForward(form: FormArray | FormGroup = this.form) {
		this.carryForwardService.resetCarryForward();
		this.subscriptions.push(
			this.carryForwardService.carryForwarded.subscribe((value) => {
				this.carryForward(value, form);

			}),
		);
	}
}
