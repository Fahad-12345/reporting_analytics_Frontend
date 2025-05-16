import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Logger } from '@nsalaun/ng-logger';
import { Patient, MedicalSession } from '@appDir/medical-doctor/models/common/commonModels';
import {
	BodyPart,
	BodyPartCondition,
	BodyPartExamination,
} from '@appDir/medical-doctor/models/initialEvaluation/initialEvaluationModels';
import { MainService } from '@appDir/shared/services/main-service';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { ToastrService } from 'ngx-toastr';
import { RequestService } from '@appDir/shared/services/request.service';
import { Router } from '@angular/router';
import { CarryForwardService } from '@appDir/medical-doctor/services/carry-forward/carry-forward.service';
import { physicalExaminationTabs } from '@appDir/medical-doctor/models/panel/panel';
import { MedicalDoctorAbstract } from '@appDir/medical-doctor/medical-doctor-abstract/medical-doctor-abstract';
import { MDService } from '@appDir/medical-doctor/services/md/medical-doctor.service';
import { convertDateTimeForSending, getObjectChildValue } from '@appDir/shared/utils/utils.helpers';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { AppointmentUrlsEnum } from '@appDir/shared/modules/appointment/appointment-urls-enum';
import { DoctorCalendarUrlsEnum } from '@appDir/shared/modules/doctor-calendar/doctor-calendar-urls-enum';
import { CalendarMonthService } from '@appDir/shared/modules/doctor-calendar/utils/my-calendar/src/modules/month/calendar-month.service';
import { AppointmentModalDialogService } from '@appDir/shared/modules/doctor-calendar/utils/my-calendar/src/modules/month/appointment-modal-dialog.service';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-shared-physical-examination',
	templateUrl: './shared-physical-examination.component.html',
	styleUrls: ['./shared-physical-examination.component.scss'],
})
export class SharedPhysicalExaminationComponent extends MedicalDoctorAbstract implements OnInit {
	@Input() patient: Patient;
	@Input() data: Object;
	@Input() bodyParts: BodyPart[];
	@Input() bodyPartConditions: BodyPartCondition[];
	@Output() nextPage = new EventEmitter();
	@Output() previousPage = new EventEmitter();
	public currentScreen = 'physicalExamination1';
	public apptdata:any;
	subscription: Subscription[]=[];
	fromRoute: string;
	
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
		public customDiallogService: CustomDiallogService,
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
	}

	public initializeForm(data) {
		const wellDeveloped = getObjectChildValue(data, null, ['wellDeveloped']);
		const wellNourished = getObjectChildValue(data, null, ['wellNourished']);
		const painLevel = getObjectChildValue(data, null, ['painLevel']);

		this.form = this.fb.group({
			generalAppearenceChecked: [wellDeveloped || wellNourished || painLevel ? true : false],
			id: [getObjectChildValue(data, null, ['id'])],
			patientGender: [{ value: this.patient.gender, disabled: true }],
			wellDeveloped: [wellDeveloped],
			wellNourished: [wellNourished],
			painLevel: [painLevel],
			bodyPartExaminations: this.createBodyPartExaminations(
				getObjectChildValue(data, [], ['bodyPartExaminations']),
			),
		});

		if (!this.mainService.isenableSaveRecordMedicalDoctor()){
			this.form.disable();
		}
	}

	ngOnInit() {
		this.fromRoute = localStorage.getItem('routeFrom');
		this.subscribeCarryForward();
		this.link = physicalExaminationTabs.find((link) => {
			return link.slug == this.currentScreen;
		});
		this.link.carryForwarded = false;
		this.apptdata =  this.mainService.getCurrentEvaluedApptAData();
	}

	ngOnChanges() {
		this.initializeForm(this.data);
	}

	public triggerScrollTo(target) {
		// const config: ScrollToConfigOptions = {
		//   container: 'ngx-scroll-to',
		//   target: target,
		//   duration: 1000,
		//   easing: 'easeOutElastic',
		//   offset: 0
		// };
		// setTimeout(() => {
		//   this._scrollToService.scrollTo(config);
		// }, 100);
	}

	reset() {
		let wellDeveloped = this.data ? this.data['wellDeveloped'] : null;
		let wellNourished = this.data ? this.data['wellNourished'] : null;
		let painLevel = this.data ? this.data['painLevel'] : null;
		this.form.controls['wellDeveloped'].setValue(wellDeveloped);
		this.form.controls['wellNourished'].setValue(wellNourished);
		this.form.controls['painLevel'].setValue(painLevel);
	}

	clear() {
	
		this.customDiallogService.confirm('Confirmation', 'Are you sure you want to clear the selections?','Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
				let wellDeveloped = null;
					let wellNourished = null;
					let painLevel = null;
					this.form.controls['wellDeveloped'].setValue(wellDeveloped);
					this.form.controls['wellNourished'].setValue(wellNourished);
					this.form.controls['painLevel'].setValue(painLevel);
				
			}else if(confirmed === false){
				
			}else{
				
			}
		})
		.catch();
	}

	getExaminationData(bodyPartExaminations, bodyPartId) {
		let examination = bodyPartExaminations.filter(function (data) {
			return data.id == bodyPartId;
		});
		if (examination.length > 0) {
			examination[0].checked = true;
			return examination[0];
		}
		return {
			conditions: [],
			comment: '',
			checked: false,
		};
	}

	createBodyPartExaminations(bodyPartExaminations) {
		// let data:any = this.data;

		let formData = this.fb.array([]);
		for (let x in this.bodyParts) {
			let examination = this.getExaminationData(bodyPartExaminations, this.bodyParts[x].id);
			let form :any= this.fb.group({
				id: [this.bodyParts[x].id], //bodyPartId
				name: [this.bodyParts[x].name],
				bodyPartKey: [this.bodyParts[x].bodyPartKey],
				condition: this.createBodyPartConditions(this.bodyParts[x].id, examination.conditions),
				comment: examination.comment,
				checked: [examination.checked],
			});
			formData.push(form);
			this.detectValueChanges(form);
		}
		
		return formData;
	}
	detectValueChanges(formdata: FormGroup) {
		;
		for (let key in formdata.value) {
			formdata['controls'][key].valueChanges.subscribe(() => {
				if (key == 'comment') {
					let oldFormValue = formdata.value;
					let newFormValue = formdata.getRawValue();
					let newCompleteComment: string = newFormValue.comment || '';
					let oldCompleteComment: string = oldFormValue.comment || '';
					let oldGeneratedString = this.generateString(oldFormValue);
					newCompleteComment.indexOf(oldGeneratedString) != 0
						? formdata.controls['comment'].setValue(oldCompleteComment, { emitEvent: false })
						: null;
				} else {
					this.updateComment(formdata);
				}
			});
		}
	}

	updateComment(form: FormGroup) {
		let oldFormValue = form.value;
		let newFormValue = form.getRawValue();
		let oldComment: string = oldFormValue.comment || '';
		let newlyGeneratedString;
		if(newFormValue){
		 newlyGeneratedString = this.generateString(newFormValue);
		}
		let oldGeneratedString;
		if (oldFormValue){
		 oldGeneratedString = this.generateString(oldFormValue);
		}
		let comment =
			oldComment.indexOf(oldGeneratedString) == -1
				? newlyGeneratedString
				: oldComment.replace(oldGeneratedString, newlyGeneratedString);
		form.controls['comment'].setValue(comment, { emitEvent: false });
		if (oldComment != comment) form.controls['comment'].markAsDirty();
	}

	generateString(formValue) {
		var generatedString = '';
		if (formValue.condtion){
		formValue.condition
			.filter((condition) => {
				return condition.checked;
			})
			.forEach((element) => {
				if (generatedString) {
					switch (formValue.bodyPartKey) {
						case 'eyes':
						case 'heart':
						case 'extremities':
							generatedString += '. ' + element.name;
							break;
						default:
							generatedString += ' and ' + element.name;
					}
				} else {
					generatedString += ' ' + element.name;
				}
				let condition_state = JSON.parse(getObjectChildValue(element, '{}', ['state']) || '{}');
				if (getObjectChildValue(condition_state, false, ['name'])) {
					generatedString += `${
						formValue.bodyPartKey != 'back'
							? ` and ${condition_state.name}`
							: ` ${condition_state.name}`
						}`;
				
				}
			});
		}
		generatedString = generatedString ? `${generatedString}.` : generatedString;
		return generatedString;
	}

	isConditionChecked(bodyPartCondition, conditions) {
		// console.log(bodyPartCondition, conditions);
		let condition = conditions.filter(function (condition) {
			return condition.id == bodyPartCondition.id;
		});
		if (condition.length > 0) {
			return condition[0];
		}
		return null;
	}

	createBodyPartConditions(id: Number, conditions: any[]) {
		let formArray = this.fb.array([]);
		this.bodyPartConditions
			.filter((bodyCondition) => {
				return id == bodyCondition.bodyPartId;
			})
			.forEach((bodyCondition) => {
				let condition = this.isConditionChecked(bodyCondition, conditions);
				let stateString = condition && condition.state ? JSON.stringify(condition.state) : null;
				let form :any= this.fb.group({
					id: [bodyCondition.id],
					state: [stateString], //bodyCondition.state,
					name: [bodyCondition.condition],
					checked: [condition ? true : false],
				});
				formArray.push(form);
			});
		return formArray;
	}

	changed(checked, state) {
		this.logger.log(checked, state);
	}

	clearExamination(item) {
		this.customDiallogService.confirm('Confirmation', 'Are you sure you want to clear the selections?','Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
				for (let x in item.controls.condition.controls) {
					item.controls.condition.controls[x].controls.state.setValue(null);
					// item.controls.condition.controls[x].controls.condition_state.controls.id.setValue(null);
					// item.controls.condition.controls[x].controls.condition_state.controls.name.setValue(null);
					item.controls.condition.controls[x].controls['checked'].setValue(false);
					// item.controls.condition.controls[x].controls['comment'].setValue("");
				}
				item.controls['comment'].setValue('');
				
			}else if(confirmed === false){
				
			}else{
				
			}
		})
		.catch();
	}
	setValues(state) {
		return JSON.stringify({ id: state.id, name: state.state });
	}

	

	getCondition(form) {
		return form.controls.condition.controls;
	}
	// submit(){
	//   this.ngOnDestroy();
	// }

	ngOnDestroy() {
		// if (this.form.touched && this.form.dirty) {
		let data = this.form.getRawValue();
		// data.bodyPartExaminations = data.bodyPartExaminations.filter((data) => {
		//   return data.checked == true;
		// });
		// let physicalExamination =
		let bodyPartExaminations = data.bodyPartExaminations
			.filter((data) => {
				return data.checked == true;
			})
			.map((data) => {
				return new BodyPartExamination(data);
			});
		let session: MedicalSession = new MedicalSession({
			physicalExamination1: {
				id: data.id,
				patientGender: data.patientGender,
				wellDeveloped: data.wellDeveloped,
				wellNourished: data.wellNourished,
				painLevel: data.painLevel,
				bodyPartExaminations: bodyPartExaminations,
			},
		});
		this.mdService.savePhysicalExamination1(session);
		if(this._route.url == '/scheduler-front-desk/doctor-calendar'){
			if(this.apptdata?.evalFrom == 'monthview'){
				this.navigateBackToSameState();
			}
		}
		// }
	}

	next = () => {
		this.nextPage.emit();
	};
	back() {
		this.previousPage.emit();
	}
	saveForLater() {
		this.fromRoute === 'provider_calendar' ?
            this._route.navigate(['/scheduler-front-desk/doctor-calendar']) : this._route.navigate(['/front-desk/cases/edit/' + this.fromRoute + '/scheduler']);
	}
	checkDisbaleButton(form) {
		return false;
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
