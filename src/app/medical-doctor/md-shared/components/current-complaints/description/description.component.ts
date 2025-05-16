import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Logger } from '@nsalaun/ng-logger';
import {
	BodyPart,
	SubBodyPart,
	PainExacerbationReasons,
} from '@appDir/medical-doctor/models/initialEvaluation/initialEvaluationModels';
import { MDService } from '@appDir/medical-doctor/services/md/medical-doctor.service';
import {
	SubBodyParts,
	Complaints2,
	MedicalSession,
} from '@appDir/medical-doctor/models/common/commonModels';
import { ScrollToConfigOptions, ScrollToService } from '@nicky-lenaers/ngx-scroll-to';
import { MedicalDoctorAbstract } from '@appDir/medical-doctor/medical-doctor-abstract/medical-doctor-abstract';
import { MainService } from '@appDir/shared/services/main-service';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { ToastrService } from 'ngx-toastr';
import { RequestService } from '@appDir/shared/services/request.service';
import { Router } from '@angular/router';
import { CarryForwardService } from '@appDir/medical-doctor/services/carry-forward/carry-forward.service';
import { AclService } from '@appDir/shared/services/acl.service';
import { complaintTabs } from '@appDir/medical-doctor/models/panel/panel';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { AppointmentUrlsEnum } from '@appDir/shared/modules/appointment/appointment-urls-enum';
import { CalendarMonthService } from '@appDir/shared/modules/doctor-calendar/utils/my-calendar/src/modules/month/calendar-month.service';
import { AppointmentModalDialogService } from '@appDir/shared/modules/doctor-calendar/utils/my-calendar/src/modules/month/appointment-modal-dialog.service';
import { convertDateTimeForSending } from '@appDir/shared/utils/utils.helpers';
import { DoctorCalendarUrlsEnum } from '@appDir/shared/modules/doctor-calendar/doctor-calendar-urls-enum';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-description',
	templateUrl: './description.component.html',
	styleUrls: ['./description.component.scss'],
})
export class DescriptionComponent extends MedicalDoctorAbstract implements OnInit {
	@Input() data: Object;
	@Input() bodyParts: BodyPart[];
	@Input() subBodyParts: SubBodyPart[];
	@Input() visitType: string;
	@Input() painReasons: PainExacerbationReasons[];
	@Output() nextPage = new EventEmitter();
	@Output() previousPage = new EventEmitter();

	public currentScreen = 'currentComplaints2';
	form: FormGroup;
	public apptdata:any;
	subscription: Subscription[]=[];
	fromRoute: string;
	// constructor(
	//     public fb: FormBuilder,
	//     private MDService: MDService,
	//     private logger: Logger,
	//     private _scrollToService: ScrollToService,
	//     private _confirmation: ConfirmationService) {
	// }

	constructor(
		public mainService: MainService,
		protected mdService: MDService,
		protected storageData: StorageData,
		protected toastrService: ToastrService,
		protected requestService: RequestService,
		protected fb: FormBuilder,
		protected logger: Logger,
		protected _route: Router,
		public customDiallogService : CustomDiallogService,
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
			customDiallogService,
		);
	}

	public initializeForm(data = null) {
		this.form = this.fb.group({
			painExacerbation: this.createExacerbation(data ? data['painExacerbation'] : null),
			comment: [data ? data['comment'] : null],
			painExacerbationComment: [
				data && data['painExacerbation'] ? data['painExacerbation']['comment'] : null,
			],
			patientComplaintDescription: this.createPatientComplaintDescription(
				data ? data['patientComplaintDescription'] : null,
			),
		});
		if (!this.mainService.isenableSaveRecordMedicalDoctor()){
			this.form.disable();
		}
	}

	ngOnInit() {
		this.fromRoute = localStorage.getItem('routeFrom');
		this.subscribeCarryForward();
		this.link = complaintTabs.find((link) => {
			return link.slug == 'currentComplaints2';
		});
		this.link.carryForwarded = false;

		// this.formData = { "patientComplaintDescription": [{ "id": 6, "name": "Arm", "locations": [{ "name": "left", "comments": "Patient describes discomfort of the left arm, discomfort in elbow, discomfort in forearm, discomfort in wrist, discomfort in hand.  CARRY FORWARDED DATA", "checked": true, "subBodyParts": [{ "id": 1, "name": "Arm", "issue": "Discomfort", "checked": true }, { "id": 2, "name": "Elbow", "issue": "Discomfort", "checked": true }, { "id": 3, "name": "Forearm", "issue": "Discomfort", "checked": true }, { "id": 4, "name": "Wrist", "issue": "Discomfort", "checked": true }, { "id": 5, "name": "Hand", "issue": "Discomfort", "checked": true }] }, { "name": "right", "comments": "Patient describes discomfort of the right arm, discomfort in elbow, pain in forearm, discomfort in wrist, pain in hand. CARRY FORWARDED DATA", "checked": true, "subBodyParts": [{ "id": 1, "name": "Arm", "issue": "Discomfort", "checked": true }, { "id": 2, "name": "Elbow", "issue": "Discomfort", "checked": true }, { "id": 3, "name": "Forearm", "issue": "Pain", "checked": true }, { "id": 4, "name": "Wrist", "issue": "Discomfort", "checked": true }, { "id": 5, "name": "Hand", "issue": "Pain", "checked": true }] }], "checked": true }, { "id": 7, "name": "Leg", "locations": [{ "name": "left", "comments": "Patient describes discomfort of the left leg, discomfort in ankle, discomfort in foot. CARRY FORWARDED DATA", "checked": true, "subBodyParts": [{ "id": 6, "name": "Leg", "issue": "Discomfort", "checked": false }, { "id": 7, "name": "Ankle", "issue": "Discomfort", "checked": false }, { "id": 8, "name": "Foot", "issue": "Discomfort", "checked": false }] }, { "name": "right", "comments": "Patient describes discomfort of the right leg, discomfort in ankle, discomfort in foot. CARRY FORWARDED DATA", "checked": true, "subBodyParts": [{ "id": 6, "name": "Leg", "issue": "Discomfort", "checked": false }, { "id": 7, "name": "Ankle", "issue": "Discomfort", "checked": false }, { "id": 8, "name": "Foot", "issue": "Discomfort", "checked": false }] }], "checked": true }], "painExacerbation": { "comment": "CARRY FORWARDED DATA", "reason": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] }, "comment": "CARRY FORWARDED DATA" };
		this.apptdata =  this.mainService.getCurrentEvaluedApptAData();
	}
	public resetAndTriggerScroll(target, formArray?: any, form?: any) {
		if (formArray) {
			for (let form of formArray) {
				this.clearLocation(form);
				form.patchValue({
					checked: false,
				});
			}
		}
		if (form) {
			this.clearLocation(form);
		}
		// const config: ScrollToConfigOptions = {
		//     container: 'ngx-scroll-to',
		//     target: target,
		//     duration: 800,
		//     easing: 'easeOutElastic',
		//     offset: 0
		// };
		// setTimeout(() => {
		//     this._scrollToService.scrollTo(config);
		// }, 100);
	}

	ngOnChanges() {
		this.initializeForm(this.data);
	}
	createPatientComplaintDescription = (data) => {
		let formdata = this.fb.array([]);
		for (let x in this.bodyParts) {
			let bodyPart = this.getBodyPartData(data, this.bodyParts[x].id);
			let form: any = this.fb.group({
				id: [this.bodyParts[x].id], //bodyPartId
				name: [this.bodyParts[x].name],
				checked: [bodyPart && bodyPart.checked ? bodyPart.checked : false],
				locations: this.createBodyPartLocations(
					bodyPart ? bodyPart['locations'] : null,
					this.bodyParts[x].id,
				),
			});
			formdata.push(form);
		}
		return formdata;
	};
	getLocationByName(bodyPartLocations, name) {
		if (bodyPartLocations) {
			let location = bodyPartLocations.filter((location) => {
				return location.name == name;
			});
			if (location.length > 0) {
				return location[0];
			}
		}
		return null;
	}
	createBodyPartLocations(bodyPartLocations, bodyPartId) {
		let masterLocations = ['left', 'right'];
		let formdata = this.fb.array([]);

		for (let i in masterLocations) {
			let currentBodyPartLocation = this.getLocationByName(bodyPartLocations, masterLocations[i]);
			let form:any = this.fb.group({
				name: [masterLocations[i]],
				comments: [currentBodyPartLocation ? currentBodyPartLocation.comments : ''],
				checked: [currentBodyPartLocation ? true : false],
				subBodyParts: this.createSubBodyParts(currentBodyPartLocation, bodyPartId),
			});
			
			this.detectValueChanges(form);
			formdata.push(form);
		}

		return formdata;
	}
	/**
	 * Handles the comments entered and generated.
	 * This will not allow the generated comments to be changed
	 * by replacing with the old value.
	 * @param formdata Gets form data
	 */
	commentsHandler(formdata): void {
		let newFormValue = formdata.getRawValue();
		let oldFormValue = formdata.value;
		let newCompleteComment: string = newFormValue.comments || '';
		let oldCompleteComment: string = oldFormValue.comments || '';
		let oldGeneratedString = this.generateString(oldFormValue);
		newCompleteComment.indexOf(oldGeneratedString) != 0
			? formdata.controls['comments'].setValue(oldCompleteComment, { emitEvent: false })
			: null;
	}

	detectValueChanges(formdata) {
		for (let key in formdata.value) {
			// if (key == 'comments') { continue; }
			formdata['controls'][key].valueChanges.subscribe(() => {
				if (key == 'comments') {
					this.commentsHandler(formdata);
				} else {
					formdata['controls']['comments'].markAsDirty();
					this.updateComment(formdata);
				}
			});
		}
	}
	getCurrentSubBodyPart = (locations, id) => {
		if (locations) {
			return locations.subBodyParts.filter(function (subBodyPart) {
				return subBodyPart.id === id;
			})[0];
		}
		return null;
	};

	createSubBodyParts = (currentBodyPartLocation, id) => {
		let formdata = this.fb.array([]);
		for (let x in this.subBodyParts) {
			// let subBodyPart = this.getCheckedSubBodyPart(currentBodyPartLocation, this.subBodyParts[x]);
			if (id == this.subBodyParts[x].bodyPartId) {
				let subBodyPart = this.getCurrentSubBodyPart(
					currentBodyPartLocation,
					this.subBodyParts[x].id,
				);
				let form:any = this.fb.group({
					id: [this.subBodyParts[x].id],
					name: [this.subBodyParts[x].name],
					issue: [subBodyPart ? subBodyPart.issue : ''],
					checked: [subBodyPart ? true : false],
				});
			
				formdata.push(form);

				// this.detectValueChanges(formdata);
				// form.valueChanges.subscribe((value) => {
				//     this.updateComment(value)
				// });
			}
		}
		return formdata;
	};

	getCheckedSubBodyPart(complaint, subBodyParts) {
		if (complaint) {
			let subBodyPart = complaint.subBodyParts.filter((data) => {
				return subBodyParts.id == data.subBodyPartId;
			});
			if (subBodyPart.length > 0) {
				return subBodyPart;
			}
			// for (let i in complaint.subBodyParts) {
			//     if (complaint.subBodyParts[i]) {
			//         if (subBodyParts.id == complaint.subBodyParts[i].subBodyPartId) {
			//             return complaint.subBodyParts[i];
			//         }
			//     }
			// }
			// return false;
		}
		return false;
	}
	clearSubBodyParts(form) {
		for (let x in form.controls['subBodyParts'].controls) {
			form.controls['subBodyParts'].controls[x].controls['checked'].setValue(false);
			form.controls['subBodyParts'].controls[x].controls['issue'].setValue('');
		}
	}
	clearLocation(form) {
		form.controls['comments'].setValue('');
		this.clearSubBodyParts(form);
	}
	checkDisbaleButton(form) {
		if (form.get('comments').value) {
			return false;
		}
		for (let x in form.controls['subBodyParts'].controls) {
			if (form.controls['subBodyParts'].controls[x].controls['checked'].value) {
				return false;
			}
			if (form.controls['subBodyParts'].controls[x].controls['issue'].value) {
				return false;
			}
		}
		return true;
	}
	clearAll(form) {
		this.customDiallogService.confirm('Confirmation', 'Are you sure you want to clear the selections?','Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
				this.clearSubBodyParts(form);
					form.controls['comments'].setValue('');
				} else {
					return;
				}
		})
		.catch();
	}
	clear(form) {
		for (let x in form.controls['locations'].controls) {
			this.clearLocation(form.controls['locations'].controls[x]);
			// form.controls['locations'].controls[x].controls['checked'].setValue(false)
		}
	}
	showThe(item) {
		if (item.get('subBodyParts').value.length > 0) {
			for (let x in item.get('subBodyParts').value) {
				let data = item.get('subBodyParts').value[x];
				if (data.checked) {
					if (data.location != 'both') {
						return 'the';
					}
					return '';
				}
			}
		}
	}
	getSelectedSubBodyParts(item) {
		let subParts = item
			.get('subBodyParts')
			.value.filter(function (data) {
				return data.checked;
			})
			.map(function (data) {
				let plural = data.location == 'both' ? 's' : '';
				return data.location + ' ' + data.name + plural;
			});
		return subParts.join(', ');
	}
	isReasonChecked(data, id) {
		if (data) {
			for (let i in data.reason) {
				if (id == data.reason[i]) {
					return true;
				}
			}
		}
		return false;
	}

	createExacerbation = (data) => {
		let formdata = this.fb.array([]);
		for (let x in this.painReasons) {
			let form:any = 	this.fb.group({
				id: [this.painReasons[x].id],
				name: [this.painReasons[x].name],
				checked: [this.isReasonChecked(data, this.painReasons[x].id)],
			});
			formdata.push(
			form
			);
		}
		return formdata;
	};
	// getBodyPartIssue(complaints, bodyPartId){
	//   for(let i in complaints){
	//     if(complaints[i].id==bodyPartId){
	//       return complaints[i].issue;
	//     }
	//   }
	//   return "";
	// }
	// getBodyPartComment(complaints, bodyPartId){
	//   for(let i in complaints){
	//     if(complaints[i].id==bodyPartId){
	//       return complaints[i].comment;
	//     }
	//   }
	//   return "";
	// }
	getBodyPartData(complaints, bodyPartId) {
		for (let i in complaints) {
			if (complaints[i].id == bodyPartId) {
				return complaints[i];
			}
		}
		return null;
	}
	// createLocation(complaint){

	//     let formdata = this.fb.array([]);

	//     formdata.push(this.fb.group({
	//         location:"left",
	//         comment: [],
	//         checked: []
	//     }));

	// }
	createItem = (complaint) => {
		let formdata = this.fb.array([]);
		for (let x in this.bodyParts) {
			let _complaint = this.getBodyPartData(complaint, this.bodyParts[x].id);

			// this.createLocation(complaint);
			let form:any = this.fb.group({
				id: [this.bodyParts[x].id], //bodyPartId
				name: [this.bodyParts[x].name],
				subBodyParts: this.createSubBodyParts(_complaint, this.bodyParts[x].id),
				issue: [_complaint ? _complaint.issue : null],
				comment: [_complaint ? _complaint.comment : null],
				checked: [_complaint && _complaint.checked ? _complaint.checked : false],
			})
			formdata.push(
				form
			);
		}
		return formdata;
	};

	getSubBodyParts(form) {
		//this.logger.log(form.controls.questions.controls);
		return form.controls.subBodyParts.controls;
	}

	submit() {}

	ngOnDestroy() {
		// if ((this.form.touched && this.form.dirty) || this.carryForwarded) {
		const data = this.form.getRawValue();
		let patientComplaintDescription = data.patientComplaintDescription.filter(function (bodyPart) {
			return bodyPart.checked === true;
		});
		for (let i in patientComplaintDescription) {
			patientComplaintDescription[i].locations = patientComplaintDescription[i].locations.filter(
				function (location) {
					return location.checked === true;
				},
			);
		}
		let formattedData = {
			comment: data.comment,
			painExacerbation: {
				comment: data.painExacerbationComment,
				reason: data.painExacerbation
					.filter(function (data) {
						return data.checked == true;
					})
					.map(function (data) {
						return data.id;
					}),
			},
			patientComplaintDescription: patientComplaintDescription,
		};
		let complaints2 = new Complaints2(formattedData);
		let session: MedicalSession = new MedicalSession({
			currentComplaints2: complaints2,
		});
		this.mdService.saveCurrentComplaints2(session);
		if(this._route.url == '/scheduler-front-desk/doctor-calendar'){
			if(this.apptdata?.evalFrom == 'monthview'){
				this.navigateBackToSameState();
			}
		}
		// }
	}

	next = () => {
		// let data = this.form.getRawValue();
		// for(let i in data.items){
		//   data.items[i].subBodyParts = data.items[i].subBodyParts.filter(function(data){
		//     return data.checked==true;
		//   }).map(function(data){
		//         return data.id;
		//   });
		// }
		// let formattedData = {
		//   comment:data.comment,
		//   painExacerbation:{
		//     comment:data.painExacerbationComment,
		//     reason:data.painExacerbation.filter(function(data){
		//       return data.checked==true;
		//     }).map(function(data){
		//         return data.id;
		//     }),
		//   },
		//   patientComplaintDescription: data.items
		// }
		// let complaints2= new Complaints2(formattedData);
		// let session:MedicalSession = new MedicalSession({
		//   currentComplaints2:complaints2
		// });
		// this.MDService.saveCurrentComplaints2(session);

		//   let formdata = new FormData();
		//   formdata.append("chiefComplaints", self.form.value["chiefComplaints"]);
		//   formdata.append("illnessHistory", self.form.value["illnessHistory"]);
		//   this.mainService.saveCurrentComplaints(formdata).subscribe(
		//     res=>{
		//       if(res.success){

		//       }
		//     }
		//   );
		this.nextPage.emit();
	};

	back() {
		this.previousPage.emit();
	}

	saveForLater() {
		this.fromRoute === 'provider_calendar' ?
            this._route.navigate(['/scheduler-front-desk/doctor-calendar']) : this._route.navigate(['/front-desk/cases/edit/' + this.fromRoute + '/scheduler']);
	}

	show(data) {
		this.logger.log(data);
	}

	generateString(formValue) {
		let comment = '';
		const { name: bodyPartOrientation, subBodyParts } = formValue;
		if (subBodyParts.length > 0) {
			for (let x in subBodyParts) {
				if (subBodyParts[x].issue != null && subBodyParts[x].issue.length > 0) {
					comment += !comment
						? `Patient describes ${subBodyParts[
								x
						  ].issue.toLowerCase()} of the ${bodyPartOrientation.toLowerCase()} ${subBodyParts[
								x
						  ].name.toLowerCase()}`
						: `, ${subBodyParts[x].issue.toLowerCase()} in ${subBodyParts[x].name.toLowerCase()}`;
				}
			}
		}
		return comment ? `${comment}.` : '';
	}
	updateComment(formdata) {
		let oldFormValue = formdata.value;
		let newFormValue = formdata.getRawValue();
		let oldComment: string = oldFormValue.comments || '';
		let newlyGeneratedString = this.generateString(newFormValue);
		let oldGeneratedString = this.generateString(oldFormValue);
		let comment =
			oldComment.indexOf(oldGeneratedString) == -1
				? newlyGeneratedString
				: oldComment.replace(oldGeneratedString, newlyGeneratedString);
		formdata.controls['comments'].setValue(comment, { emitEvent: false });
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
