import { Component, OnInit, OnDestroy } from '@angular/core';
import {
	Feelings,
	Sensation,
	BodyPart,
	Radiation,
	CurrentComplaint,
} from '../models/initialEvaluation/initialEvaluationModels';
import { Router } from '@angular/router';
import { MDService } from '../services/md/medical-doctor.service';
import { MainService } from '@shared/services/main-service';
import { MdLinks } from '../models/panel/model/md-links';
import { complaintTabs } from '../models/panel/panel';
import { SeededBodyPart, SensationText } from '../md-shared/seededInfo';
import { SeededInfo } from '../md-shared/seededInfo';
import { MedicalDoctorAbstract } from '../medical-doctor-abstract/medical-doctor-abstract';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { ToastrService } from 'ngx-toastr';
import { RequestService } from '@appDir/shared/services/request.service';
import { FormBuilder, Validators, FormGroup, FormArray } from '@angular/forms';
import { CarryForwardService } from '../services/carry-forward/carry-forward.service';
import { AclService } from '@appDir/shared/services/acl.service';
import { MedicalSession, HeadInjury } from '../models/common/commonModels';
import { commentsMaxLength } from './complaints.configs';
import { convertDateTimeForSending, getObjectChildValue } from '@appDir/shared/utils/utils.helpers';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { AppointmentUrlsEnum } from '@appDir/shared/modules/appointment/appointment-urls-enum';
import { CalendarMonthService } from '@appDir/shared/modules/doctor-calendar/utils/my-calendar/src/modules/month/calendar-month.service';
import { AppointmentModalDialogService } from '@appDir/shared/modules/doctor-calendar/utils/my-calendar/src/modules/month/appointment-modal-dialog.service';
import { DoctorCalendarUrlsEnum } from '@appDir/shared/modules/doctor-calendar/doctor-calendar-urls-enum';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-current-complaints',
	templateUrl: './current-complaints.component.html',
	styleUrls: ['./current-complaints.component.scss'],
})
export class CurrentComplaintsComponent extends MedicalDoctorAbstract implements OnInit, OnDestroy {
	public tabLinks: MdLinks[];
	public bodyParts: SeededBodyPart[];
	public feelings: Feelings[];
	public sensation: Sensation[];
	public radiations: Radiation[];
	public complaintBodyParts: BodyPart[] = [];
	public data: any;
	public sensationTexts: SensationText[];
	public commentsMaxLength = commentsMaxLength;
	public link: MdLinks;
	public currentScreen = 'currentComplaints';
	public apptdata:any;
	subscription: Subscription[]=[];
	fromRoute: any;

	constructor(
		public customDiallogService : CustomDiallogService,
		public mainService: MainService,
		protected mdService: MDService,
		protected storageData: StorageData,
		protected toastrService: ToastrService,
		protected requestService: RequestService,
		protected fb: FormBuilder,
		protected _route: Router,
		public carryForwardService: CarryForwardService,
		public aclService: AclService,
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

		this.mainService.setPanelData();
		let session = this.mdService.getCurrentSession();

		this.data = {
			currentComplaints: getObjectChildValue(session, null, ['session', 'currentComplaints']),
			headInjury: getObjectChildValue(session, null, ['session', 'headInjury']),
		};
	}

	/**
	 * on init
	 */
	ngOnInit() {
		this.fromRoute = localStorage.getItem('routeFrom');
		this.tabLinks = complaintTabs;
		let offlineData: SeededInfo = this.mdService.getOfflineData();
		this.sensation = offlineData.bodyPartSensations;
		this.bodyParts = offlineData.bodyParts;
		this.feelings = offlineData.bodyPartFeelings;
		this.radiations = offlineData.radiations;
		this.sensationTexts = offlineData.sensationTexts;

		this.complaintBodyParts = this.bodyParts
			.filter((bodyPart) => {
				return bodyPart.type == 'complaints';
			})
			.map((bodyPart) => {
				return new BodyPart(bodyPart);
			});
		this.initializeForm(this.data);

		this.subscribeCarryForward();

		this.link = complaintTabs.find((link) => {
			return link.slug == this.currentScreen;
		});
		this.link.carryForwarded = false;
		this.apptdata =  this.mainService.getCurrentEvaluedApptAData();
	}

	/**
	 * Initializes form
	 * @param [data]
	 */
	public initializeForm(data = null) {
		let headInjury = getObjectChildValue(data, null, ['headInjury', 'headInjury']);
		let commentValidators = [Validators.maxLength(this.commentsMaxLength)];

		this.form = this.fb.group({
			headInjury: [headInjury],
			headInjuryComments: [
				getObjectChildValue(data, '', ['headInjury', 'headInjuryComments']),
				commentValidators,
			],
			complaints: this.fb.array([]),
		});
		if (!this.mainService.isenableSaveRecordMedicalDoctor()){
			this.form.disable();
		}
		this.mainService.sliceStrings(this.form, 'headInjuryComments', this.commentsMaxLength);
		this.createComplaints(data);
	}

	/**
	 * Creates complaints
	 * @param data
	 */
	createComplaints(data) {
		for (let x in this.complaintBodyParts) {
			this.addNewComplaint(this.complaintBodyParts[x], data);
		}
	}

	/**
	 * Adds new complaint
	 * @param bodyPart
	 * @param data
	 */
	addNewComplaint(bodyPart, data) {
		let currentComplaint = data ? data['currentComplaints'] : null;
		let complaint = this.checkInCurrentComplaint(currentComplaint, bodyPart.id);
		let form: FormGroup = this.fb.group({
			name: [bodyPart.name],
			bodyPartId: [bodyPart.id],
			checked: [currentComplaint ? complaint.checked : bodyPart.checked],
			complaintsLocation: this.fb.array([]),
		});
		if (!this.mainService.isenableSaveRecordMedicalDoctor()){
			this.form.disable();
		}
		this.addComplaintLocations(form, bodyPart, complaint, bodyPart.name);
		let complaints = <FormArray>this.form.get('complaints');
		complaints.push(form);

		if (!this.mainService.isenableSaveRecordMedicalDoctor()){
			this.form.disable();
		}
		
	}

	/**
	 * Checks in current complaint
	 * @param currentComplaint
	 * @param bodyPartId
	 * @returns
	 */
	checkInCurrentComplaint(currentComplaint, bodyPartId) {
		for (let i in currentComplaint) {
			if (currentComplaint[i].bodyPartId == bodyPartId) {
				return {
					checked: true,
					complaintsLocation: currentComplaint[i].complaintsLocation,
					bodyPartId: currentComplaint[i].bodyPartId,
				};
			}
		}
		return {
			checked: false,
			complaintsLocation: null,
			bodyPartId: null,
		};
	}

	/**
	 * Adds complaint locations
	 * @param form
	 * @param bodyPart
	 * @param complaint
	 * @param bodyPartName
	 */
	addComplaintLocations(form: FormGroup, bodyPart, complaint, bodyPartName) {
		let location = this.locations(bodyPartName);
		// if (location != 'hide') {
		switch (location) {
			case 'vertical':
				this.pushComplaintLocations('upper', form, bodyPart, complaint);
				this.pushComplaintLocations('mid', form, bodyPart, complaint);
				this.pushComplaintLocations('lower', form, bodyPart, complaint);
				break;
			case 'horizontal':
				this.pushComplaintLocations('left', form, bodyPart, complaint);
				this.pushComplaintLocations('right', form, bodyPart, complaint);
				break;
			case 'hide':
				this.pushComplaintLocations('', form, bodyPart, complaint);
				break;
		}
	}

	/**
	 * body part location
	 * @param name
	 * @returns
	 */
	locations(name) {
		name = name.toLowerCase();
		let return_value = '';
		switch (name) {
			case 'neck':

				return_value = 'hide';
				break;

			case 'back':
				return_value = 'vertical';
				break;

			case 'shoulder':
			case 'hip':
			case 'knee':
			case 'arm':
			case 'elbow':
			case 'forearm':
			case 'wrist':
			case 'hand':
			case 'leg':
			case 'ankle':
			case 'foot':
				return_value = 'horizontal';
				break;
		}
		return return_value;
	}

	/**
	 * Pushs complaint locations
	 * @param location
	 * @param form
	 * @param bodyPart
	 * @param complaint
	 */
	pushComplaintLocations(location, form: FormGroup, bodyPart, complaint) {
		let comp = null;
		for (let x in complaint.complaintsLocation) {
			if (location == complaint.complaintsLocation[x].location) {
				comp = complaint.complaintsLocation[x];
			}
		}
		let locationForm:any = this.fb.group({
			checked: [comp ? comp.checked : false],
			location: [location],
			painScale: [comp ? comp.painScale : null],
			painStyle: [comp ? comp.painStyle : ''],
			feelings: this.createFeelings(comp, bodyPart.id),
			sensation: this.createSensation(comp, bodyPart.id),
			radiation: this.createRadiation(bodyPart.id, comp, location),
			comments: [comp ? comp.comments : '', Validators.maxLength(this.commentsMaxLength)],
		});
		if (!this.mainService.isenableSaveRecordMedicalDoctor()){
				locationForm.disable();
		}
		this.detectValueChanges(form, locationForm);
		let formArray = <FormArray>form.get('complaintsLocation') || this.fb.array([]);
		formArray.push(locationForm);
	}

	/**
	 * Creates feelings
	 * @param complaint
	 * @param id
	 * @returns feelings
	 */
	createFeelings(complaint, id): FormArray {
		let formdata = this.fb.array([]);
		for (let x in this.feelings) {
			if (id == this.feelings[x].bodyPartId) {
				let isChecked = this.isFeelingChecked(complaint, this.feelings[x]);
				let form :any= this.fb.group({
					id: [this.feelings[x].id],
					name: [this.feelings[x].feeling],
					checked: [isChecked],
				});
				formdata.push(
					form
				);
			}
		}
		return formdata;
	}

	/**
	 * Determines whether feeling is checked
	 * @param complaint
	 * @param feelings
	 * @returns true if feeling checked
	 */
	isFeelingChecked(complaint, feelings): boolean {
		if (complaint) {
			for (let i in complaint.feelings) {
				if (complaint.feelings[i] && feelings.id == complaint.feelings[i]) {
					return true;
				}
			}
		}
		return false;
	}

	/**
	 * Creates sensation
	 * @param complaint
	 * @param bodyPartId
	 * @returns sensation
	 */
	createSensation(complaint, bodyPartId): FormArray {
		let formArray = this.fb.array([]);
		for (let x in this.sensation) {
			let isChecked = this.isSensationChecked(complaint, this.sensation[x]);
			if (this.sensation[x].bodyPartId == bodyPartId) {
				let form :any = this.fb.group({
					id: [this.sensation[x].id],
					name: [this.sensation[x].sensation],
					checked: [isChecked],
				});
				formArray.push(
					form
				);
			}
		}
		return formArray;
	}

	/**
	 * Determines whether sensation checked is
	 * @param complaint
	 * @param sensation
	 * @returns true if sensation checked
	 */
	isSensationChecked(complaint, sensation): boolean {
		if (complaint) {
			for (let i in complaint.sensations) {
				if (complaint.sensations[i] && sensation.id == complaint.sensations[i]) {
					return true;
				}
			}
		}
		return false;
	}

	/**
	 * Creates radiation
	 * @param id
	 * @param complaint
	 * @param complaintLocation
	 * @returns radiation
	 */
	createRadiation(id, complaint, complaintLocation): FormArray {
		let formArray = this.fb.array([]);
		for (let x in this.radiations) {
			if (id == this.radiations[x].bodyPartId && complaintLocation == this.radiations[x].location) {
				// if (id == 3) {
				// 	alert();
				// 	;
				// }
				let location = this.getLocation(this.radiations[x], complaint);
				let form:any = this.fb.group({
					location: [location ? location : ''], //this.radiations[x].location], //locations irght left both
					position: [this.radiations[x].position],
				});
				formArray.push(
					form
				);
			}
		}
		return formArray;
	}

	/**
	 * Gets location
	 * @param radiation
	 * @param complaint
	 * @returns
	 */
	getLocation(radiation, complaint) {
		;
		if (complaint) {
			for (let i in complaint.radiations) {
				if (radiation.position == complaint.radiations[i].position) {
					return complaint.radiations[i].location;
				}
			}
		}
		return null;
	}

	/**
	 * Detects value changes
	 * @param form
	 * @param locationForm
	 */
	detectValueChanges(form, locationForm) {
		for (let key in locationForm.value) {
			let subscription = locationForm['controls'][key].valueChanges.subscribe(() => {
				if (key == 'comments') {
					let oldFormValue = locationForm.value;
					let newFormValue = locationForm.getRawValue();
					let newCompleteComment: string = newFormValue.comments || '';
					let oldCompleteComment: string = oldFormValue.comments || '';
					let oldGeneratedString = this.generateString(form, oldFormValue);
					newCompleteComment.indexOf(oldGeneratedString) != 0
						? locationForm.controls['comments'].setValue(oldCompleteComment, { emitEvent: false })
						: null;
				} else {
					locationForm['controls']['comments'].markAsDirty();
					this.updateComment(form, locationForm);
				}
			});
			this.subscriptions.push(subscription);
		}
	}

	/**
	 * Generates string and update the value of comment
	 * @param part
	 * @param locationForm
	 */
	updateComment(part: FormGroup, locationForm: FormGroup) {
		let oldFormValue = locationForm.value;
		let newFormValue = locationForm.getRawValue();
		let oldComment: string = oldFormValue.comments || '';
		// ;
		let newlyGeneratedString = this.generateString(part, newFormValue);
		let oldGeneratedString = this.generateString(part, oldFormValue);
		let comment =
			oldComment.indexOf(oldGeneratedString) == -1
				? newlyGeneratedString
				: oldComment.replace(oldGeneratedString, newlyGeneratedString);
		locationForm.controls['comments'].setValue(comment, { emitEvent: false });
	}

	/**
	 * Generates comments on user's selection change.
	 * @param part
	 * @param formValue
	 * @returns string newly generated string according to user's selections.
	 */
	generateString(part: FormGroup, formValue: any): string {
		let { painScale, location, painStyle } = formValue;
		;
		let commentString = ``;
		if (painScale != null) {
			let { name: partName, bodyPartId } = part.value;
			partName = partName.toLowerCase();
			let radiations: string | any[] = this.getSelectedRadiations(formValue);
			let feelings = this.getSelectedFeelings(formValue).toLowerCase();
			let sensations: string | any[] = this.getSelectedSensations(formValue)
				.filter((sensation) => {
					return sensation.checked;
				})
				.map((sensation) => {
					return sensation.name;
				});
			sensations = sensations.join(' and ').toLowerCase();

			commentString +=
				painScale != null ? `Patient is complaining of ${painScale}/10 (0-10 pain scale)` : ``;
			commentString += location
				? ` pain in the ${location} ${partName}`
				: ` pain in the ${partName}`;
			commentString += painStyle || feelings.length ? `, that is` : ``;
			commentString += painStyle ? ` ${painStyle.toLowerCase()}` : ``;
			commentString += feelings.length ? ` ${feelings}` : ``;
			radiations = radiations.map((radiation) => {
				return `${radiation.location} ${radiation.position}`;
			});
			radiations = radiations.join(' and ');
			commentString += radiations.length ? ` with radiation to ${radiations}` : ``;
			let sensationText = this.getSensationText(bodyPartId, location);
			commentString += sensations.length ? ` with ${sensations} sensation ${sensationText}` : ``;
			commentString += `.`;
		} else {
			commentString = '';
		}
		return commentString;
	}

	/**
	 * Gets sensation text according to body part e.g. for bodypartId 1 text is 'in upper extremities'
	 * This text will be seeded in the back end and will be sent to front end using seeded info.
	 * @param bodyPartId
	 * @param location
	 * @returns
	 */
	getSensationText(bodyPartId, location) {

		let sensation = this.sensationTexts.find(
			(sensationText) =>
				sensationText.bodyPartId == bodyPartId && sensationText.location == location,
		);
		return sensation ? sensation.sensation_location : ''
	}

	/**
	 * Gets selected radiations
	 * @param formValue
	 * @returns selected radiations
	 */
	getSelectedRadiations(formValue): any[] {
		let radiation = [];
		for (let x in formValue.radiation) {
			formValue.radiation[x].location ? radiation.push(formValue.radiation[x]) : null;
		}
		return radiation;
	}

	/**
	 * Gets selected feelings
	 * @param formValue
	 * @returns selected feelings
	 */
	getSelectedFeelings(formValue): string {
		let feelings = [];
		for (let x in formValue.feelings) {
			formValue.feelings[x].checked ? feelings.push(formValue.feelings[x].name) : null;
		}
		return feelings.length > 0 ? feelings.join(', ') : '';
	}

	/**
	 * Gets selected sensations
	 * @param formValue
	 * @returns selected sensations
	 */
	getSelectedSensations(formValue): any[] {
		let sensation = [];
		for (let x in formValue.sensation) {
			if (formValue.sensation[x].checked) {
				sensation.push(formValue.sensation[x]);
			}
		}
		return sensation;
	}

	/**************************************************
	 **************  Template events ******************
	 *************************************************/

	/**
	 * Change event for head injury
	 * @param hasHeadInjury
	 */
	headInjuryChanged(hasHeadInjury) {
		if (hasHeadInjury) {
			this.form.controls['headInjuryComments'].setValidators([Validators.required]);
		} else {
			this.form.controls['headInjuryComments'].clearValidators();
		}
	}

	/**
	 * Clears selections
	 * @param form
	 * @param type
	 * @param controlName
	 * @param value
	 */
	clearSelections(form, type, controlName, value) {
		for (let x in form.controls[type].controls) {
			form.controls[type].controls[x].controls[controlName].setValue(value, { emitEvent: false });
		}
	}

	/**
	 * Clears all complaint
	 * @param form
	 */
	clearAllComplaint(form) {
		this.clearSelections(form, 'feelings', 'checked', false);
		this.clearSelections(form, 'radiation', 'location', '');
		this.clearSelections(form, 'sensation', 'checked', false);
		// ;
		form.patchValue({
			comments: '',
			painScale: null,
			painStyle: '',
		});
	}

	/**
	 * Clears complaint
	 * @param form
	 * @param [popup]
	 */
	clearComplaint(form, popup = false) {
		if (popup) {

			this.customDiallogService.confirm('Confirmation', 'Are you sure you want to clear the selections?','Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
				this.clearAllComplaint(form);
			}
		})
		.catch();
		} else {
			this.clearAllComplaint(form);
		}
	}

	/**
	 * Determines whether current patient has injury or not
	 * @returns true if injury
	 */
	hasInjury(): boolean {
		return this.form.controls.headInjury.value ? true : false;
	}

	/**
	 * Gets feelings control
	 * @param form
	 * @returns feelings form control
	 */
	getFeelings(form) {
		return form.controls.feelings.controls;
	}

	/**
	 * Gets radiation control
	 * @param form
	 * @returns radiation form control
	 */
	getRadiation(form) {
		return form.controls.radiation.controls;
	}

	/**
	 * Gets sensation control
	 * @param form
	 * @returns sensation form control
	 */
	getSensation(form) {
		return form.controls.sensation.controls;
	}

	/**
	 * Next page
	 */
	nextPage() {
		this._route.navigate([`medical-doctor/current-complaints-cont`]);
	}

	/**
	 * Previous page & Save for Later
	 */
	changePage(btnClicked) {
		if(btnClicked === 'back') {
			this._route.navigate([`medical-doctor/evaluation`]);
		}
		else {
			this.fromRoute === 'provider_calendar' ?
				this._route.navigate(['/scheduler-front-desk/doctor-calendar']) : this._route.navigate(['/front-desk/cases/edit/' + this.fromRoute + '/scheduler']);
		}
	}

	/**
	 * This function has been commented for now due to client's feedback.
	 * Triggers scroll to
	 * @param target
	 * @param [formArray]
	 * @param [form]
	 */
	public triggerScrollTo(target, formArray?: any, form?: any) {
		// if (form) {
		//   this.clearComplaint(form);
		// }
		// if (formArray) {
		//   for (let form of formArray) {
		//     this.clearComplaint(form);
		//     form.patchValue({
		//       'checked': false,
		//     });
		//   }
		// }
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

	/**
	 * on destroy
	 */
	ngOnDestroy() {
		// if ((this.form.touched && this.form.dirty) || this.carryForwarded) {
		let data = this.form.getRawValue();

		let complaints: CurrentComplaint[] = data.complaints
			.filter((data) => {
				return data.checked == true;
			})
			.map((data) => {
				return new CurrentComplaint(data);
			});

		let session: MedicalSession = new MedicalSession({
			currentComplaints: complaints,
			headInjury: new HeadInjury({
				headInjury: data.headInjury,
				headInjuryComments: data.headInjuryComments,
			}),
		});

		this.mdService.saveCurrentComplaints(session);
		if(this._route.url == '/scheduler-front-desk/doctor-calendar'){
			if(this.apptdata?.evalFrom == 'monthview'){
				this.navigateBackToSameState();
			}
		}
		this.subscriptions.forEach((subscription) => {
			subscription.unsubscribe();
		});
		// }

		this.mainService.resetPanelData();
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
