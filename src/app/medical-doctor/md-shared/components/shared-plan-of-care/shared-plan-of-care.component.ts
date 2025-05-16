// import { MDService } from '@appDir/medical-doctor/services/md/medical-doctor.service';
import { ViewportScroller } from '@angular/common';
import {
	Component,
	EventEmitter,
	Input,
	OnInit,
	Output,
} from '@angular/core';
import {
	FormArray,
	FormBuilder,
	FormControl,
	FormGroup,
	Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

import { Code } from '@appDir/medical-doctor/diagnostic-impression/model/code';
import {
	MedicalDoctorAbstract,
} from '@appDir/medical-doctor/medical-doctor-abstract/medical-doctor-abstract';
import {
	Device,
	MedicalSession,
	MRIs,
	OtherMRIs,
	planOfCare1,
} from '@appDir/medical-doctor/models/common/commonModels';
import { Devices } from '@appDir/medical-doctor/models/initialEvaluation/initialEvaluationModels';
import { planOfCareTabs } from '@appDir/medical-doctor/models/panel/panel';
import { PlanOfCareSeed } from '@appDir/medical-doctor/plan-of-care/plan-of-care-seed';
import { ReferralSeed } from '@appDir/medical-doctor/plan-of-care/referral-seed';
import {
	CarryForwardService,
} from '@appDir/medical-doctor/services/carry-forward/carry-forward.service';
import { MDService } from '@appDir/medical-doctor/services/md/medical-doctor.service';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { Logger } from '@nsalaun/ng-logger';
import { MainService } from '@shared/services/main-service';

import {
	ReferringSpecialty,
	SeededBodyPart,
	SeededSpecalty,
} from '../../seededInfo';
import { convertDateTimeForSending, getObjectChildValue, unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { AppointmentUrlsEnum } from '@appDir/shared/modules/appointment/appointment-urls-enum';
import { DoctorCalendarUrlsEnum } from '@appDir/shared/modules/doctor-calendar/doctor-calendar-urls-enum';
import { CalendarMonthService } from '@appDir/shared/modules/doctor-calendar/utils/my-calendar/src/modules/month/calendar-month.service';
import { AppointmentModalDialogService } from '@appDir/shared/modules/doctor-calendar/utils/my-calendar/src/modules/month/appointment-modal-dialog.service';

@Component({
	selector: 'app-shared-plan-of-care',
	templateUrl: './shared-plan-of-care.component.html',
	styleUrls: ['./shared-plan-of-care.component.scss'],
})
export class SharedPlanOfCareComponent extends MedicalDoctorAbstract implements OnInit {
	@Input() visitType: string;
	@Input() planeOfCareSeeds: PlanOfCareSeed;
	@Input() referralSeeds: ReferralSeed;
	@Input() specialities: SeededSpecalty;
	@Input() gender: string;
	@Input() data: planOfCare1;
	@Input() devices: Devices;
	@Input() bodyParts: SeededBodyPart[];
	@Input() icdCodes: Code[];
	@Input() referringSpecialties: ReferringSpecialty[] = [];
	@Output() nextPage = new EventEmitter();
	@Output() previousPage = new EventEmitter();
	checked;
	favoriteColorControl;

	public subscriptions: Array<Subscription> = [];
	public currentScreen: string = 'planOfCare';
	public pressures = ['no', 'low', 'med', 'high'];
	public specialties = [];
	public weight_bearing = [
		{ id: 1, name: 'NWB', value: 'nwb' },
		{ id: 2, name: 'FWB', value: 'fwb' },
		{ id: 3, name: 'PWBAT', value: 'pwbat' },
	];
	public addSpecialities: Boolean = false;
	public orthopedicMaxLength = this.maxLength;
	public painManagementMaxLength = this.maxLength;
	public pmrMaxLength = this.maxLength;
	public spineSpecialistMaxLength = this.maxLength;
	public handSpecialistMaxLength = this.maxLength;
	public podiatryMaxLength = this.maxLength;
	public otherMaxLength = this.maxLength;
	public followUpOtherMaxLength = this.maxLength;
	public casualityCommentsMaxLength = this.maxLength;
	public commentMaxLength = this.maxLength;
	public temporarilyImpairedCommentMaxLength = this.maxLength;
	public form: FormGroup;
	public medications: FormGroup;
	public drugs = [];
	public goals = [];
	public modalities = [];
	public manual_therapies :any[]= [];
	public exercisesArr = [];
	public orientedBodyPartsSeed: any = [];
	public nonOrientedBodyPartsSeed: any = [];
	public dropdownSettings = {
		singleSelection: false,
		idField: 'id',
		textField: 'name',
		selectAllText: 'Select All',
		unSelectAllText: 'UnSelect All',
		itemsShowLimit: 5,
		allowSearchFilter: true,
	};

	public currentSession: any;
	isIsoMetricSessonTrue:boolean = false;
	public apptdata:any;
	fromRoute: string;
	/**
	 * Creates an instance of shared plan of care component.
	 * @param vps
	 * @param mainService
	 * @param mdService
	 * @param storageData
	 * @param toastrService
	 * @param requestService
	 * @param fb
	 * @param logger
	 * @param _route
	 * @param carryForwardService
	 */
	constructor(
		private vps: ViewportScroller,
		public mainService: MainService,
		protected mdService: MDService,
		protected storageData: StorageData,
		protected toastrService: ToastrService,
		protected requestService: RequestService,
		protected fb: FormBuilder,
		protected logger: Logger,
		protected _route: Router,
		public carryForwardService: CarryForwardService,
		public customDiallogService : CustomDiallogService,
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
		this.favoriteColorControl = new FormControl('');
	}

	/**
	 * on changes
	 */
	ngOnChanges() {
		this.initializeSeeders();
		this.initializeForm(this.data);
	}

	/**
	 * Initializes form
	 * @param data
	 */
	initializeForm(data: any): void {
		this.generateMedicationForm(data);
		this.generateForm(data);

		if (!this.mainService.isenableSaveRecordMedicalDoctor()){
			this.form.disable();
		}
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

	/**
	 * Hides specialities menu
	 */
	hideSpecialitiesMenu() {
		if (this.addSpecialities) this.addSpecialities = false;
	}

	/**
	 * Toggles specialities menu
	 */
	toggleSpecialitiesMenu() {
		this.addSpecialities = !this.addSpecialities;
	}

	/**
	 * Unchecks children
	 * @param form
	 */
	uncheckChildren(form) {
		for (let x in form['controls']) {
			form['controls'][x]['controls']['checked'].setValue(false);
		}
	}

	/**
	 * Resets speciality controls
	 * @param form
	 */
	resetSpecialityControls(form) {
		form['controls']['dropped'].setValue(false);
		if (form.get('children') != null) {
			for (let x in this.form.get('children')) {
				this.resetSpecialityControls(this.form.get('children')[x]['controls']);
			}
		}
	}

	/**
	 * Displays sub menu
	 * @param index
	 */
	displaySubMenu(index) {
		for (let item in this.form.get('specialities')['controls']) {
			if (index == null || index != parseInt(item)) {
				this.resetSpecialityControls(this.form.get('specialities')['controls'][item]);
			} else {
				this.form.get('specialities')['controls'][item]['controls']['dropped'].setValue(true);
			}
		}
	}

	/**
	 * Subs menu click
	 * @param value
	 * @param index1
	 * @param index2
	 */
	subMenuClick(value, index1, index2) {
		if (value) {
			if (index1) {
				this.form.get('specialities')['controls'][index1]['controls']['checked'].setValue(true);
			}
			if (index2) {
				this.form
					.get('specialities')
					['controls'][index1].get('children')
					['controls'][index2]['controls']['checked'].setValue(true);
			}
		}
	}

	/**
	 * Displays sub menu2
	 * @param parentIndex
	 * @param childIndex
	 */
	displaySubMenu2(parentIndex, childIndex) {
		for (let item in this.form.get('specialities')['controls'][parentIndex].get('children')[
			'controls'
		]) {
			if (childIndex != parseInt(item)) {
				this.resetSpecialityControls(
					this.form.get('specialities')['controls'][parentIndex].get('children')['controls'][item],
				);
			} else {
				this.form
					.get('specialities')
					['controls'][parentIndex].get('children')
					['controls'][item]['controls']['dropped'].setValue(true);
			}
		}
	}

	/**
	 * on init
	 */
	ngOnInit() {
		this.fromRoute = localStorage.getItem('routeFrom');
		this.subscribeCarryForward();
		this.link = planOfCareTabs.find((link) => {
			return link.slug == this.currentScreen;
		});
		this.link.carryForwarded = false;
		this.apptdata =  this.mainService.getCurrentEvaluedApptAData();
	}

	/**
	 * Clears followup
	 */
	clearFollowup() {
		this.customDiallogService.confirm('Confirmation', 'Are you sure you want to clear the selections?','Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
				this.form.get('followUpVisit').setValue('', { emitEvent: false });
						this.form.get('followUpOther').setValue('', { emitEvent: false });
					} else {
						return;
					}
		})
		.catch();
	}

	/**
	 * Clears prognosis
	 */
	clearPrognosis() {
		this.customDiallogService.confirm('Confirmation', 'Are you sure you want to clear the selections?','Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
				this.form.get('prognosisCheck').setValue('', { emitEvent: false });
				this.form.get('prognosis').setValue('', { emitEvent: false });
			} else {
				return;
			}
		})
		.catch();

	}

	/**
	 * Clears pt
	 * @param referralIndex
	 */
	clearPT(referralIndex) {

		
		this.customDiallogService.confirm('Confirmation', 'Are you sure you want to clear the selections?','Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
				this.form.controls.referrals['controls'][
					referralIndex
				].controls.intervalName.setValue('', { emitEvent: false });
				this.form.controls.referrals['controls'][referralIndex].controls.perWeek.setValue('', {
					emitEvent: false,
				});
				this.form.controls.referrals['controls'][referralIndex].controls.noOfWeeks.setValue(
					'',
					{ emitEvent: false },
				);
				this.form.controls.referrals['controls'][referralIndex].controls.periodName.setValue(
					'',
					{ emitEvent: false },
				);
				this.form.controls.referrals['controls'][
					referralIndex
				].controls.improvement.setValue('', { emitEvent: false });
				this.form.controls.referrals['controls'][referralIndex].controls.comment.setValue('', {
					emitEvent: false,
				});
			} else {
				return;
			}
		})
		.catch();
	}

	/**
	 * Checks disbale button
	 * @param referralIndex
	 * @returns
	 */
	checkDisbaleButton(referralIndex) {
		if (this.form.controls.referrals['controls'][referralIndex].controls.intervalName.value) {
			return false;
		}
		if (this.form.controls.referrals['controls'][referralIndex].controls.perWeek.value) {
			return false;
		}
		if (this.form.controls.referrals['controls'][referralIndex].controls.noOfWeeks.value) {
			return false;
		}
		if (this.form.controls.referrals['controls'][referralIndex].controls.periodName.value) {
			return false;
		}
		if (this.form.controls.referrals['controls'][referralIndex].controls.improvement.value) {
			return false;
		}
		return true;
	}

	/**
	 * Initializes seeders
	 */
	initializeSeeders() {
		this.specialties = this.referralSeeds.referrals;
		this.drugs = getObjectChildValue(this.planeOfCareSeeds, null, ['drugs']);
		this.exercisesArr = getObjectChildValue(this.referralSeeds, null, ['excercises']);
		this.manual_therapies = getObjectChildValue(this.referralSeeds, null, ['manual_therapies']);
		this.manual_therapies.map(therphy=>{
			therphy['slug'] =='cervical' || therphy['slug'] =='lumbar'?therphy['show_therophy'] = false :therphy['show_therophy'] = true;
				});
		this.modalities = getObjectChildValue(this.referralSeeds, null, ['modalities']);
		this.goals = getObjectChildValue(this.referralSeeds, null, ['goals']);
		const rangeOfMotionBodyParts = this.bodyParts.filter((val) => {
			return val.type === 'rangeOfMotion';
		});

		this.orientedBodyPartsSeed = rangeOfMotionBodyParts.filter((val) => val.motion.hasOrientation);
		this.nonOrientedBodyPartsSeed = rangeOfMotionBodyParts.filter(
			(val) => !val.motion.hasOrientation,
		);
	}

	/**
	 * Finalizes form
	 */
	finalizeForm() {
		this.subscriptions.push(
			this.form['controls']['prognosisCheck'].valueChanges.subscribe((selectedValue) => {
				if (!selectedValue && this.form && 'controls' in this.form) {
					this.form['controls']['prognosis'].setValue('');
				}
			}),
		);

		this.mainService.sliceStrings(this.form, 'comment', this.commentMaxLength);
		this.mainService.sliceStrings(this.form, 'casualityComments', this.casualityCommentsMaxLength);
	}

	/**
	 * Generates medication form
	 */
	generateMedicationForm(data) {
		let useOld = getObjectChildValue(data, '', ['medications', 'useOld']);
		let usePrescribed = getObjectChildValue(data, '', ['medications', 'usePrescribed']);
		let newDrugs = getObjectChildValue(data, '', ['medications', 'newDrugs']);
		let prescribedDrugs = getObjectChildValue(data, '', ['medications', 'prescribedDrugs']);
		let workEffect = getObjectChildValue(data, '', ['medications', 'workEffect']);
		this.medications = this.fb.group({
			useOld: [useOld],
			newDrugs: [newDrugs],
			usePrescribed: [usePrescribed],
			prescribedDrugs: [prescribedDrugs],
			workEffect: [workEffect],
		});

		if (!this.mainService.isenableSaveRecordMedicalDoctor()){
			this.medications.disable();
		}

		// added timeout as it was not detecting the change
		setTimeout(() => {
			this.disableInput(useOld, this.medications.get('prescribedDrugs'));
			this.disableInput(usePrescribed, this.medications.get('newDrugs'));
		}, 100);
	}

	/**
	 * Generates form
	 */
	generateForm(data) {
		this.form = this.fb.group({
			// Checkboxes
			radiologyOn: [getObjectChildValue(data, '', ['radiologyOn'])],
			CTScanOn: [getObjectChildValue(data, '', ['CTScanOn'])],
			MRIOn: [getObjectChildValue(data, '', ['MRIOn'])],
			otherOn: [getObjectChildValue(data, '', ['otherOn'])],
			rangeOfMotion: [
				data &&
				data.rangeOfMotion &&
				(parseInt(data.rangeOfMotion) == 1 || data.rangeOfMotion === true)
					? true
					: false,
			],
			nonOrientedBodyParts: this.createNonOrientedBodyPartsForm(data),
			orientedBodyParts: this.createOrientedBodyPartsForm(data),
			referrals: this.createReferrals(data),
			radiologies: this.createRadiologies(data),
			radiologyComments: [getObjectChildValue(data, '', ['radiologyComments'])],
			ctScans: this.createCTScans(data),
			ctComments: [getObjectChildValue(data, '', ['ctComments'])],
			MRI: this.createMRI(data),
			mriComments: [getObjectChildValue(data, '', ['mriComments'])],
			others: this.createOther(data),
			otherComments: [getObjectChildValue(data, '', ['otherComments'])],
			devices: this.createDevices(data),
			specialities: this.createSpecialities(data),
			followUpVisit: [getObjectChildValue(data, '', ['followUpVisit'])],
			next_follow_up_visit_comments: [getObjectChildValue(data, '', ['next_follow_up_visit_comments'])],
			prognosisCheck: [getObjectChildValue(data, '', ['prognosisCheck'])],
			prognosis: [getObjectChildValue(data, '', ['prognosis'])],
			followUpOther: [getObjectChildValue(data, '', ['followUpOther'])],
			extremities: [data && 'extremities' in data ? data.extremities : ''],
			comment: [
				data && 'comment' in data ? data.comment : '',
				Validators.maxLength(this.commentMaxLength),
			],
			casualityComments: [
				data && 'casualityComments' in data ? data.casualityComments : '',
				Validators.maxLength(this.casualityCommentsMaxLength),
			],
			temporarilyImpairedComment: [
				data && 'temporarilyImpairedComment' in data ? data.temporarilyImpairedComment : '',
				Validators.maxLength(this.temporarilyImpairedCommentMaxLength),
			],
			temporarilyImpaired: [data && 'temporarilyImpaired' in data ? data.temporarilyImpaired : ''],
			hbotPrescription: [data && 'hbotPrescription' in data ? data.hbotPrescription : ''],
			synapticTreatment: [data && 'synapticTreatment' in data ? data.synapticTreatment : ''],
		});

		// this.subscriptions.push(this.form['controls']['followUpVisit'].valueChanges.subscribe((value) => {
		// 	console.log();
		// 	if (value != 'other')
		// 		this.form['controls']['followUpOther'].setValue('', {
		// 			emitEvent: false,
		// 		});
		// }));
		this.generateReferringSpecialitiesForm(data);
		this.finalizeForm();
		if (!this.mainService.isenableSaveRecordMedicalDoctor()){
			this.form.disable();
		}
	}

	/**
	 * Generates referring specialities form
	 */
	generateReferringSpecialitiesForm(data = null) {
		this.referringSpecialties.forEach((specialty) => {
			this.form.addControl(
				specialty.specialty_key,
				this.fb.control(
					getObjectChildValue(data, null, [specialty.specialty_key]),
					Validators.maxLength(this.orthopedicMaxLength),
				),
			);
			this.form.addControl(
				specialty.specialty_comment_key,
				this.fb.control(
					getObjectChildValue(data, null, [specialty.specialty_comment_key]),
					Validators.maxLength(specialty.specialty_comment_max_length),
				),
			);
			this.subscriptions.push(
				this.form['controls'][specialty.specialty_comment_key].valueChanges.subscribe((value) => {
					this.form['controls'][specialty.specialty_key].setValue(value.length > 0 ? true : false, {
						emitEvent: false,
					});
				}),
			);

			this.subscriptions.push(
				this.form['controls'][specialty.specialty_key].valueChanges.subscribe((value) => {
					!value
						? this.form['controls'][specialty.specialty_comment_key].setValue('', {
								emitEvent: false,
						  })
						: null;
				}),
			);
		});
	}

	/**
	 * Create non oriented body parts form
	 */
	createNonOrientedBodyPartsForm = (data = null) => {
		let formData = this.fb.array([]);
		for (let bodyPart of this.nonOrientedBodyPartsSeed) {
			if (data) {
				var _part = data.nonOrientedBodyParts.find((part) => {
					return (
						getObjectChildValue(part, false, ['bodyPartId']) ==
						getObjectChildValue(bodyPart, null, ['id'])
					);
				});
			}
			let form:any = this.fb.group({
				name: bodyPart.name,
				bodyPartId: bodyPart.id,
				checked: _part && _part.checked ? _part.checked : false,
			});
			formData.push(form);
		}
		return formData;
	};

	/**
	 * Create oriented body parts form of shared plan of care component
	 */
	createOrientedBodyPartsForm = (data) => {
		let formData = this.fb.array([]);
		for (let bodyPart of this.orientedBodyPartsSeed) {
			if (data) {
				var _part = data.orientedBodyParts.find((part) => {
					if (
						getObjectChildValue(part, false, ['bodyPartId']) ==
						getObjectChildValue(bodyPart, null, ['id'])
					) {
						return part;
					}
				});
			}
			let form:any = this.fb.group({
				name: [bodyPart.name],
				bodyPartId: bodyPart.id,
				checked: _part && _part.checked ? _part.checked : false,
				orientation: _part && _part.orientation ? _part.orientation : '',
			});

			if (!_part || _part.checked == false) {
				form.controls['orientation'].disable();
			}

			var sub = form.controls['checked'].valueChanges.subscribe((data) => {
				this.onValueChanges(form);
			});
			this.subscriptions.push(sub);
			formData.push(form);
		}
		return formData;
	};

	/**
	 * Determines whether value changes on
	 * @param form
	 */
	onValueChanges(form) {
		if (form.get('checked').value == false) {
			form.get('orientation').reset();
			form.get('orientation').disable();
		} else {
			form.get('orientation').enable();
		}
	}

	/**
	 * Determines whether device body part select on
	 */
	onDeviceBodyPartSelect = (form: FormGroup, event) => {
		let formdata = form.getRawValue();
		let found = formdata.body_parts.find((body_part) => {
			return body_part.id === event.id;
		});
		if (!found) {
			let body_part = formdata.seeded_body_parts.filter((body_part) => {
				return body_part.id === event.id;
			});
			body_part[0]['body_part_id'] = body_part.id;
			this.pushDeviceBodyPart(form, body_part[0]);
		}
	};

	/**
	 * Determines whether device body part select all on
	 */
	onDeviceBodyPartSelectAll = (form: FormGroup, event) => {
		for (let bodyPart of event) {
			this.onDeviceBodyPartSelect(form, bodyPart);
		}
	};

	/**
	 * Determines whether device body part de select on
	 */
	onDeviceBodyPartDeSelect = (form: FormGroup, event) => {
		let formdata = form.getRawValue();
		let foundIndex = formdata.body_parts.findIndex((body_part) => {
			return body_part.id === event.id;
		});
		if (foundIndex > -1) {
			let formArray: FormArray = form['controls']['body_parts'] as FormArray;
			formArray.removeAt(foundIndex);
		}
	};

	/**
	 * Determines whether device body part de select all on
	 */
	onDeviceBodyPartDeSelectAll = (form: FormGroup) => {
		let formdata = form.getRawValue();
		formdata.body_parts.forEach((bodyPart) => {
			this.onDeviceBodyPartDeSelect(form, bodyPart);
		});
	};

	/**
	 * Get saved referrals of shared plan of care component
	 */
	getSavedReferrals = (data, specialty) => {
		let referrals = getObjectChildValue(data, [], ['referrals']);
		return referrals.find((referral) => {
			return (
				getObjectChildValue(referral, false, ['specialty']) ==
				getObjectChildValue(specialty, null, ['name'])
			);
		});
	};
	/**
	 * Create referrals of shared plan of care component
	 */
	createReferrals = (data) => {
		let formdata = this.fb.array([]);
		for (let x in this.specialties) {
			let referral = this.getSavedReferrals(data, this.specialties[x]);

			let form:any = this.fb.group({
				id: this.specialties[x].id,
				specialty: [this.specialties[x].name],
				checked: [getObjectChildValue(referral, '', ['checked'])],
				perWeek: [getObjectChildValue(referral, '', ['perWeek'])],
				periodName: [getObjectChildValue(referral, '', ['periodName'])],
				intervalName: [getObjectChildValue(referral, '', ['intervalName'])],
				noOfWeeks: [getObjectChildValue(referral, '', ['noOfWeeks'])],
				improvement: [getObjectChildValue(referral, '', ['improvement'])],
				comment: [getObjectChildValue(referral, '', ['comment'])],
				diagnosis: this.createDiagnosticCodes(referral), //[{ value: this.icdCodes, disabled: true }],
				precautions: [getObjectChildValue(referral, '', ['precautions'])],
				evaluate: [getObjectChildValue(referral, '', ['evaluate'])],
				specificInstructions: [getObjectChildValue(referral, '', ['specificInstructions'])],
				weightBearings: this.createWeightBearing(referral, this.specialties[x].id),
				exercises: this.createExercises(referral, this.specialties[x].id),
				modalities: this.createModalities(referral, this.specialties[x].id),
				goals: this.createGoals(referral),
				tharapies: this.createTharapies(referral, this.specialties[x].id),
				evaluateAndTreat: [getObjectChildValue(referral, false, ['evaluateAndTreat'])],
				
			});

			this.setSpecialtyChangeEvents(form);
			formdata.push(form);
		}
		return formdata;
	};

	/**
	 * Creates diagnostic codes
	 * @param referral
	 * @returns
	 */

	changeEvualte($event,index) {		
		this.form;
		if (!$event.currentTarget.checked && this.form.controls.referrals['controls'][index].controls.evaluate.value){
			this.customDiallogService.confirm('Confirmation', 'Are you sure you want to clear the selections?','Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
				this.form.controls.referrals['controls'][index].controls.evaluate.setValue('');
				}
				else
				{
					this.form.controls.referrals['controls'][index].controls.evaluateAndTreat.setValue(true);
				}
		})
		.catch();
		}
	}
	createDiagnosticCodes(referral) {
		let diagnosis = getObjectChildValue(referral, [], ['diagnosis']) || [];

		let formdata = this.fb.array([]);
		if (this.icdCodes){
		this.icdCodes.forEach((code) => {
			if (code) {
				let form:any = this.fb.group({
					id: code.id,
					name: `${code.name} ${code.description ? ` - ${code.description}` : ``}`,
					checked: diagnosis.find((id) => {
						return id == code.id;
					})
						? true
						: false,
				});
				formdata.push(form);
			}
		});
	}
		return formdata;
	}

	/**
	 * Finds referral
	 * @param id
	 * @returns
	 */
	findReferral(id) {
		return this.data.referrals.find((referral) => referral.id === id);
	}

	/**
	 * Get saved weight bearing of shared plan of care component
	 */
	getSavedWeightBearing = (weightBear, id, referral) => {
		id = +id;
		if (referral && referral.weightBearings && referral.weightBearings.length) {
			const weightBearings = referral.weightBearings;
			if (weightBearings && weightBearings.length) {
				return weightBearings.filter((_weightBear) => _weightBear.id === weightBear.id);
			}
		}
	};

	/**
	 * Creates weight bearing
	 * @param referral
	 * @param id
	 * @returns
	 */
	createWeightBearing(referral, id) {
		let formdata = this.fb.array([]);
		for (let x of this.weight_bearing) {
			let weightBear = referral ? this.getSavedWeightBearing(x, id, referral) : [];
			let form:any = this.fb.group({
				id: x.id,
				checked: [weightBear && weightBear.length ? weightBear[0].checked : ''],
			});
			formdata.push(form);
		}
		return formdata;
	}

	/**
	 * Get saved exercises of shared plan of care component
	 */
	getSavedExercises = (exercise, id, referral) => {
		id = +id;
		if (referral && referral.exercises && referral.exercises.length) {
			const exercises = referral.exercises;
			if (exercises && exercises.length) {
				return exercises.filter((_exercise) => _exercise.id === exercise.id);
			}
		}
	};

	/**
	 * Creates exercises
	 * @param referral
	 * @param id
	 * @returns
	 */
	createExercises(referral, id) {
		let formdata = this.fb.array([]);
		for (let x of this.exercisesArr) {
			let exercise = referral ? this.getSavedExercises(x, id, referral) : [];
			let form:any = this.fb.group({
				id: x.id,
				checked: [exercise && exercise.length ? exercise[0].checked : ''],
			});
			formdata.push(form);
		}
		return formdata;
	}

	/**
	 * Get saved modalities of shared plan of care component
	 */
	getSavedModalities = (exercise, id, referral) => {
		id = +id;
		if (referral && referral.modalities && referral.modalities.length) {
			const modalities = referral.modalities;

			if (modalities && modalities.length) {
				return modalities.filter((_exercise) => _exercise.id === exercise.id);
			}
		}
	};

	/**
	 * Creates modalities
	 * @param referral
	 * @param id
	 * @returns
	 */
	createModalities(referral, id) {
		let formdata = this.fb.array([]);
		for (let x of this.modalities) {
			let modality = referral ? this.getSavedModalities(x, id, referral) : [];
			let form:any = this.fb.group({
				id: x.id,
				checked: [modality && modality.length ? modality[0].checked : ''],
			});
			formdata.push(form);
		}
		return formdata;
	}

	/**
	 * Get saved goals of shared plan of care component
	 */
	getSavedGoals = (goal, referral) => {
		if (referral && referral.length) {
			referral = referral[0];
		}
		if (referral && referral.goals && referral.goals.length) {
			const goals = referral.goals;
			if (goals && goals.length) {
				return goals.filter((_goal) => _goal.id === goal.id);
			}
		}
	};

	/**
	 * Creates goals
	 * @param referral
	 * @returns
	 */
	createGoals(referral) {
		let formdata = this.fb.array([]);
		for (let x of this.goals) {
			let goals = referral ? this.getSavedGoals(x, referral) : [];
			let form :any= this.fb.group({
				id: x.id,
				checked: [goals && goals.length ? true : false],
			});
			formdata.push(form);
		}
		return formdata;
	}

	/**
	 * Creates tharapies
	 * @param referral
	 * @param id
	 * @returns
	 */
	createTharapies(referral, id) {
		
		let formdata = this.fb.array([]);
		for (let x of this.manual_therapies) {
			let tharapy = referral ? this.getSavedTharapies(x, id, referral) : [];
			let form :any= this.fb.group({
				id: x.id,
				checked: [tharapy && tharapy.length ? tharapy[0].checked : ''],
			});
			this.manual_therapies;
			if (x.slug === 'isometric_stabilization' && form.controls['checked'].value){
				this.manual_therapies.map((val) => {
					(val.slug ==='cervical' || val.slug ==='lumbar')?val.show_therophy=true:false;
			   });
			}
			
			formdata.push(form);
		}
		return formdata;
	}

	/**
	 * Get saved tharapies of shared plan of care component
	 */
	getSavedTharapies = (tharapy, id, referral) => {
		id = +id;
		if (referral && referral.tharapies && referral.tharapies.length) {
			const tharapies = referral.tharapies;
			if (tharapies && tharapies.length) {
				return tharapies.filter((_tharapy) => _tharapy.id === tharapy.id);
			}
		}
	};

	/**
	 * Clear form array of shared plan of care component
	 */
	clearFormArray = (formArray: FormArray) => {
		if (formArray && formArray.length) {
			while (formArray.length !== 0) {
				formArray.removeAt(0);
			}
		}
	};

	/**
	 * Set specialty change events of shared plan of care component
	 */
	setSpecialtyChangeEvents = (form) => {
		let controls = ['periodName', 'intervalName', 'improvement', 'perWeek', 'noOfWeeks'];
		controls.forEach((control) => {
			this.subscriptions.push(
				form['controls'][control].valueChanges.subscribe((selectedValue) => {
					if (
						(control == 'perWeek' || control == 'noOfWeeks') &&
						selectedValue != null &&
						selectedValue < 1
					) {
						form['controls'][control].setValue(1);
					}
					if ((control == 'perWeek' || control == 'noOfWeeks') && selectedValue > 500) {
						form['controls'][control].setValue(500);
					}
					this.generateSpecialtyString(form);
				}),
			);
		});
		this.subscriptions.push(
			form['controls']['comment'].valueChanges.subscribe(() => {
				let oldGeneratedString = '';
				let oldFormValue = form.value;
				let newFormValue = form.getRawValue();
				let newCompleteComment: string = newFormValue.comment || '';
				let oldCompleteComment: string = oldFormValue.comment || '';
				// if (this.checkVisitType('reEvaluation')) {
				// 	oldGeneratedString = this.generateReEvaluationString(oldFormValue);
				// } else if (this.checkVisitType('evaluation')) {
				oldGeneratedString = this.generateEvaluationString(oldFormValue);
				// }
				newCompleteComment.indexOf(oldGeneratedString) != 0
					? form.controls['comment'].setValue(oldCompleteComment, { emitEvent: false })
					: null;
			}),
		);
	};

	/**
	 * Determines whether impaired percent change on
	 * @param event
	 */
	onImpairedPercentChange(event) {
		if (parseInt(event) < 1 || isNaN(parseInt(event))) {
			if (event != '') {
				this.form.patchValue({
					temporarilyImpaired: '0',
				});
			}
		}
		if (parseInt(event) > 100) {
			this.form.patchValue({
				temporarilyImpaired: '100',
			});
		}
	}

	/**
	 * Generates evaluation string
	 * @param form
	 * @returns evaluation string
	 */
	generateEvaluationString(form): string {
		let comment = '';
		let { improvement, perWeek, noOfWeeks, periodName, intervalName, specialty } = form;
		if (perWeek && intervalName) {
			comment = `${
				this.isCarryForwarded()
					? 'Will continue with'
					: 'At this time will enroll the patient in a course of'
			} ${specialty} ${perWeek}x/${intervalName}`;
			if (noOfWeeks && periodName) {
				comment += ` for ${noOfWeeks} ${periodName}${
					noOfWeeks <= 1 ? '' : 's'
				} to decrease pain, increase strength and range of motion with modalities as needed.`;
			}
		}
		return comment;
	}

	/**
	 * Generates re evaluation string
	 * @param form
	 * @returns re evaluation string
	 */
	generateReEvaluationString(form): string {
		let comment = '';
		let { improvement, perWeek, noOfWeeks, periodName, intervalName, specialty } = form;
		if (perWeek && intervalName) {
			comment = `Will continue with Physical Therapy ${perWeek}x/${intervalName}`;
			if (noOfWeeks && periodName && noOfWeeks) {
				comment += ` for ${noOfWeeks} ${periodName}${
					noOfWeeks <= 1 ? '' : 's'
				} to decrease pain, increase strength and range of motion with modalities as needed`;
				if (improvement) {
					comment += `, as there is notable improvement.`;
				}
			}
		}
		return comment;
	}

	/**
	 * Generates specialty string
	 * @param form
	 */
	generateSpecialtyString(form) {
		let newlyGeneratedString = '';
		let oldGeneratedString = '';
		let oldFormValue = form.value;
		let newFormValue = form.getRawValue();
		let oldComment: string = oldFormValue.comment || '';
		// if (this.checkVisitType('reEvaluation')) {
		// 	newlyGeneratedString = this.generateReEvaluationString(newFormValue);
		// 	oldGeneratedString = this.generateReEvaluationString(oldFormValue);
		// } else if (this.checkVisitType('evaluation')) {
		newlyGeneratedString = this.generateEvaluationString(newFormValue);
		oldGeneratedString = this.generateEvaluationString(oldFormValue);
		// }
		let comment =
			oldComment.indexOf(oldGeneratedString) == -1
				? newlyGeneratedString
				: oldComment.replace(oldGeneratedString, newlyGeneratedString);
		form.controls['comment'].setValue(comment, { emitEvent: false });
	}

	/**
	 * Creates forms
	 * @param heading
	 * @param formdata
	 * @returns
	 */
	createForms(heading, formdata, data: any = null) {
		if (getObjectChildValue(this.planeOfCareSeeds, false, [heading])) {
			let parent = this.planeOfCareSeeds[heading];
			for (let x in parent) {
				let childName = '';
				let childId;
				let child = parent;
				for (let y in child) {
					if (child[y].parentId == parent[x].id) {
						childName = child[y].name;
						childId = child[y].id;
					}
				}
				if (parent[x].parentId == 0) {
					let savedData = null;
					switch (heading) {
						case 'other':
						case 'mrAngiographies':
						case 'ctaAngiographies':
						case 'mammographies':
						case 'ultrasounds':
						case 'dexa':
							if (getObjectChildValue(data, false, ['others', heading])) {
								savedData = this.getSavedData(heading, parent[x].id, true, data);
							}
							break;
						default:
							if (getObjectChildValue(data, false, [heading])) {
								savedData = this.getSavedData(heading, parent[x].id, false, data);
							}
					}
					let form = this.fb.group({
						id: [parent[x].id],
						heading: [heading],
						section: [parent[x].section],
						name: [parent[x].name],
						parentId: [parent[x].parentId],
						hasLeft: [parent[x].hasLeft],
						hasRight: [parent[x].hasRight],
						with: [parent[x].with],
						left: [savedData ? savedData.left : false],
						right: [savedData ? savedData.right : false],
						withValue: [savedData ? savedData.withValue : null],
						callStatReport: [savedData ? savedData.callStatReport : null],
						sendPhysicianFilms: [savedData ? savedData.sendPhysicianFilms : null],
						checked: [savedData ? true : false],
						childId: [childId],
						childName: [childName],
						childChecked: [savedData ? savedData.childChecked : false],
						otherComment: [savedData ? savedData.otherComment : null],
					});

					this.subscriptions.push(
						form['controls']['checked'].valueChanges.subscribe((selectedValue) => {
							if (!selectedValue && form && 'controls' in form) {
								this.resetImagings(form);
							}
							// console.log(selectedValue);
						}),
					);
					formdata.push(form);
				}
			}
		}
		return formdata;
	}

	/**
	 * Create other of shared plan of care component
	 */
	createOther = (data = null) => {
		let formdata = this.fb.array([]);
		formdata = this.createForms('other', formdata, data);
		formdata = this.createForms('mrAngiographies', formdata, data);
		formdata = this.createForms('ctaAngiographies', formdata, data);
		formdata = this.createForms('mammographies', formdata, data);
		formdata = this.createForms('ultrasounds', formdata, data);
		formdata = this.createForms('dexa', formdata, data);
		return formdata;
	};

	/**
	 * Populate specialities of shared plan of care component
	 */
	populateSpecialities = (specialities, children = null, data = null) => {
		let localSpecialities = children;

		if (specialities && specialities.length > 0) {
			if (!localSpecialities) {
				localSpecialities = data && 'specialities' in data ? data.specialities : [];
			}
			let formdata = this.fb.array([]);
			for (let x in specialities) {
				let self = this;
				let array = localSpecialities.filter((localSpeciality) => {
					return localSpeciality.id == specialities[x].id;
				})[0];
				let form:any = this.fb.group({
					id: [specialities[x].id],
					name: [specialities[x].name],
					checked: [array && array.checked ? true : false],
					dropped: [false],
					comment: [array && array.comment ? array.comment : ''],
					children: this.populateSpecialities(
						specialities[x].children,
						array ? array.children : null,
						data,
					),
				});
				this.subscriptions.push(
					form['controls']['checked'].valueChanges.subscribe((selectedValue) => {
						if (!selectedValue && form && 'controls' in form) {
							self.uncheckChildren(form['controls']['children']);
						}
					}),
				);
				formdata.push(form);
			}
			return formdata;
		}
		return null;
	};

	/**
	 * Create specialities of shared plan of care component
	 */
	createSpecialities = (data = null) => {
		let formdata = this.populateSpecialities(this.specialities, null, data);
		return formdata;
	};

	/**
	 * Clears devices
	 * @param form
	 */
	clearDevices(form) {
		if (form && 'controls' in form && 'left' in form['controls']) {
			form['controls']['left'].setValue(false);
		}
		if (form && 'controls' in form && 'right' in form['controls']) {
			form['controls']['right'].setValue(false);
		}
		if (form && 'controls' in form && 'comments' in form['controls']) {
			form['controls']['comments'].setValue('');
		}
	}

	/**
	 * Returns the device having id passed as param or returns null
	 * @param {number} id device id
	 * @returns {FormArray}  array of device forms
	 */
	getSavedDevice = (id: number): Device => {
		return this.data.devices.find((device) => {
			return device.id === id;
		});
	};

	/**
	 * Push device body part of shared plan of care component
	 */
	pushDeviceBodyPart = (form: FormGroup, savedBodyPart) => {
		let formdata = {
			id: getObjectChildValue(savedBodyPart, '', ['id']),
			name: getObjectChildValue(savedBodyPart, '', ['name']),
			hasLocation:
				savedBodyPart &&
				savedBodyPart.hasLocation &&
				(savedBodyPart.hasLocation == true || parseInt(savedBodyPart.hasLocation) == 1)
					? true
					: false,
			has_comments:
				savedBodyPart &&
				savedBodyPart.has_comments &&
				(savedBodyPart.has_comments == true || parseInt(savedBodyPart.has_comments) == 1)
					? true
					: false,
			body_part_id: getObjectChildValue(savedBodyPart, '', ['body_part_id']),
			location: getObjectChildValue(savedBodyPart, '', ['location']),
			comments: getObjectChildValue(savedBodyPart, '', ['comments']),
		};
		form['controls']['body_parts']['controls'].push(this.fb.group(formdata));
	};

	/**
	 * Create form array for devices
	 * No inputs
	 * @returns {FormArray}  array of device forms
	 */
	createDevices = (data = null): FormArray => {
		let formdata = this.fb.array([]) as FormArray;
		for (let x in this.devices) {
			let saved_device = null;
			let devices = getObjectChildValue(data, [], ['devices']);
			if (data) {
				saved_device = devices.find((device) => {
					return device.id === getObjectChildValue(this.devices, null, [x, 'id']);
				});
			}

			let bodyParts = getObjectChildValue(saved_device, [], ['body_parts']);
			let form:any = this.fb.group({
				id: [this.devices[x].id],
				name: [this.devices[x].name],
				location: [this.devices[x].location], //boolean value
				selected_location: [getObjectChildValue(saved_device, null, ['selected_location'])],
				length_of_need: !getObjectChildValue(this.devices, false, [x, 'lengths_of_need'])
					? null
					: this.fb.group({
							seededLengths: [
								[...getObjectChildValue(this.devices, [], [x, 'lengths_of_need']), 'other'],
							],
							length: [getObjectChildValue(saved_device, null, ['length_of_need', 'length'])],
							other_comment: [
								getObjectChildValue(saved_device, null, ['length_of_need', 'other_comment']),
							],
					  }),
				usage: !this.devices[x].usage ? null : this.createDeviceUsageForm(x, saved_device),
				seeded_body_part_ids: [bodyParts],
				seeded_body_parts: [getObjectChildValue(this.devices, [], [x, 'bodyParts'])],
				body_parts: this.fb.array([]) as FormArray,
				comments: [getObjectChildValue(saved_device, '', ['comments'])],
				checked: [getObjectChildValue(saved_device, false, ['checked']) ? true : false],
			});

			if (form['controls']['length_of_need']['controls']) {
				this.subscriptions.push(
					form['controls']['length_of_need']['controls']['length'].valueChanges.subscribe(
						(value) => {
							if (value != 'other')
								form['controls']['length_of_need']['controls']['other_comment'].setValue('', {
									emitEvent: false,
								});
						},
					),
				);
			}

			let savedBodyParts = getObjectChildValue(saved_device, [], ['body_parts']);
			if (savedBodyParts) {
				for (let x of savedBodyParts) {
					let formvalue = form.value;
					let body_part = formvalue.seeded_body_parts.filter((body_part) => {
						return body_part.id === x.body_part_id;
					});
					this.pushDeviceBodyPart(form, { ...x, ...body_part });
				}
			}
			formdata.push(form);
		}
		return formdata;
	};

	/**
	 * Creates device usage form
	 * @param x
	 * @param saved_device
	 * @returns
	 */
	createDeviceUsageForm(x, saved_device) {
		let form = this.fb.group({
			seeded_usage: [this.devices[x].usage],
			use_in_control_unit: [
				getObjectChildValue(saved_device, false, ['usage', 'use_in_control_unit']),
			],
			settings: [getObjectChildValue(saved_device, false, ['usage', 'settings'])],
			frequency: [
				{
					value: getObjectChildValue(saved_device, '', ['usage', 'frequency']),
					disabled: getObjectChildValue(saved_device, true, ['usage', 'settings']) ? false : true,
				},
			],
			pressure: [
				{
					value: getObjectChildValue(saved_device, '', ['usage', 'pressure']),
					disabled: getObjectChildValue(saved_device, true, ['usage', 'settings']) ? false : true,
				},
			],
			time: [
				{
					value: getObjectChildValue(saved_device, '', ['usage', 'time']),
					disabled: getObjectChildValue(saved_device, true, ['usage', 'settings']) ? false : true,
				},
			],
		});
		this.initSettings(form, getObjectChildValue(saved_device, false, ['usage', 'settings']));
		this.subscriptions.push(
			form['controls']['settings'].valueChanges.subscribe((selectedValue) => {
				this.initSettings(form, selectedValue);
			}),
		);
		return form;
	}

	/**
	 * Inits settings
	 * @param form
	 * @param selectedValue
	 */
	initSettings(form, selectedValue) {
		if (selectedValue) {
			form.controls['frequency'].enable();
			form.controls['pressure'].enable();
			form.controls['time'].enable();
		} else {
			form.controls['frequency'].setValue('');
			form.controls['pressure'].setValue('');
			form.controls['time'].setValue('');
			form.controls['frequency'].disable();
			form.controls['pressure'].disable();
			form.controls['time'].disable();
		}
	}

	/**
	 * Create mri of shared plan of care component
	 */
	createMRI = (data = null) => {
		let formdata = this.fb.array([]);

		// formdata = this.createForms('mris', formdata);
		for (let x in this.planeOfCareSeeds.mris) {
			let savedData = null;
			if (data && 'MRI' in data) {
				savedData = this.getSavedData('MRI', this.planeOfCareSeeds.mris[x].id, false, data);
			}
			let form:any = this.fb.group({
				id: [this.planeOfCareSeeds.mris[x].id],
				section: [this.planeOfCareSeeds.mris[x].section],
				name: [this.planeOfCareSeeds.mris[x].name],
				parentId: [this.planeOfCareSeeds.mris[x].parentId],
				hasLeft: [this.planeOfCareSeeds.mris[x].hasLeft],
				hasRight: [this.planeOfCareSeeds.mris[x].hasRight],
				with: [this.planeOfCareSeeds.mris[x].with],
				left: [savedData ? savedData.left : false],
				right: [savedData ? savedData.right : false],
				callStatReport: [savedData ? savedData.callStatReport : null],
				sendPhysicianFilms: [savedData ? savedData.sendPhysicianFilms : null],
				withValue: [savedData ? savedData.withValue : null],
				checked: [savedData ? true : null],
				otherComment: [savedData ? savedData.otherComment : ''],
			});
			this.subscriptions.push(
				form['controls']['checked'].valueChanges.subscribe((selectedValue) => {
					if (!selectedValue && form && 'controls' in form) {
						this.resetImagings(form);
					}
				}),
			);
			formdata.push(form);
		}
		return formdata;
	};

	/**
	 * Create spine of shared plan of care component
	 */
	createSpine = () => {
		let formdata = this.fb.array([]);
		formdata = this.createForms('Spine', formdata);
		return formdata;
	};

	/**
	 * Create ctscans of shared plan of care component
	 */
	createCTScans = (data) => {
		let formdata = this.fb.array([]);
		formdata = this.createForms('ctScans', formdata, data);
		return formdata;
	};

	/**
	 * Gets saved data
	 * @param objectName
	 * @param currentId
	 * @param [others]
	 * @param [data]
	 * @returns
	 */
	getSavedData(objectName, currentId, others: Boolean = false, data?: any) {
		let savedData = others
			? getObjectChildValue(data, [], ['others', objectName])
			: getObjectChildValue(data, [], [objectName]);
		for (let x in savedData) {
			if (savedData[x].id == currentId) {
				return savedData[x];
			}
		}
		return null;
	}

	/**
	 * Resets shared plan of care component
	 * @param formArray
	 * @param type
	 * @param [heading]
	 */
	reset(formArray, type, heading?: String) {
		this.customDiallogService.confirm('Confirmation', 'Are you sure you want to clear the selections?','Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
				for (let i in formArray['controls']) {
					let hasSameSection = formArray['controls'][i].get('section').value == type;
					let hasSameHeading = false;
					if (heading) {
						hasSameHeading = formArray['controls'][i].get('heading').value == heading;
					}
					if (type == 'all' || hasSameSection || hasSameHeading) {
						formArray['controls'][i]['controls']['checked'].setValue(null);
						formArray['controls'][i]['controls']['callStatReport'].setValue(null);
						formArray['controls'][i]['controls']['sendPhysicianFilms'].setValue(null);
						formArray['controls'][i]['controls']['left'].setValue(false);
						formArray['controls'][i]['controls']['right'].setValue(false);
						formArray['controls'][i]['controls']['otherComment'].setValue('');

						if (formArray['controls'][i]['controls']['childChecked']) {
							formArray['controls'][i]['controls']['childChecked'].setValue(null);
						}
						if (formArray['controls'][i]['controls']['withValue']) {
							formArray['controls'][i]['controls']['withValue'].setValue(null);
						}
					}
				}
			} else {
				return;
			}
		})
		.catch();
	}

	/**
	 * Resets imagings
	 * @param form
	 */
	resetImagings(form) {
		if (form && 'controls' in form && 'left' in form['controls']) {
			form['controls']['left'].setValue(false);
		}
		if (form && 'controls' in form && 'right' in form['controls']) {
			form['controls']['right'].setValue(false);
		}
		if (form && 'controls' in form && 'withValue' in form['controls']) {
			form['controls']['withValue'].setValue(null);
		}
		if (form && 'controls' in form && 'callStatReport' in form['controls']) {
			form['controls']['callStatReport'].setValue(null);
		}
		if (form && 'controls' in form && 'sendPhysicianFilms' in form['controls']) {
			form['controls']['sendPhysicianFilms'].setValue(null);
		}
		if (form && 'controls' in form && 'childChecked' in form['controls']) {
			form['controls']['childChecked'].setValue(false);
		}
		if (form && 'controls' in form && 'otherComment' in form['controls']) {
			form['controls']['otherComment'].setValue('');
		}
	}

	/**
	 * Create radiologies of shared plan of care component
	 */
	createRadiologies = (data) => {
		let formdata = this.fb.array([]);
		let parentRadiologies = this.planeOfCareSeeds.radiologies;
		for (let x in parentRadiologies) {
			let childName = '';
			let childChecked = '';
			let childId;
			let childRadiologies = parentRadiologies; //We are finding which radiologies are child radiologies
			for (let y in childRadiologies) {
				if (childRadiologies[y].parentId == parentRadiologies[x].id) {
					childName = childRadiologies[y].name;
					childId = childRadiologies[y].id;
				}
			}
			if (parentRadiologies[x].parentId == 0) {
				/*If it is a parent*/

				let radiologies = null;
				radiologies = this.getSavedData('radiologies', parentRadiologies[x].id, false, data);
				// console.table(radiologies);
				let form:any = this.fb.group({
					id: [parentRadiologies[x].id],
					section: [parentRadiologies[x].section],
					name: [parentRadiologies[x].name],
					parentId: [parentRadiologies[x].parentId],
					hasLeft: [parentRadiologies[x].hasLeft],
					hasRight: [parentRadiologies[x].hasRight],
					with: [parentRadiologies[x].with],
					left: [radiologies ? radiologies.left : false],
					right: [radiologies ? radiologies.right : false],
					withValue: [radiologies ? radiologies.withValue : null],
					callStatReport: [radiologies ? radiologies.callStatReport : null],
					sendPhysicianFilms: [radiologies ? radiologies.sendPhysicianFilms : null],
					checked: [radiologies ? true : false],
					childId: [childId],
					childName: [childName],
					childChecked: [radiologies ? radiologies.childChecked : false],
					otherComment: [radiologies ? radiologies.otherComment : ''],
				});
			
				this.subscriptions.push(
					form['controls']['checked'].valueChanges.subscribe((selectedValue) => {
						if (!selectedValue && form && 'controls' in form) {
							this.resetImagings(form);
						}
					}),
				);
			
				formdata.push(form);
			}
		}
	
		return formdata;
	};

	/**
	 * Checks change
	 * @param checked
	 * @param item
	 */
	checkChange(checked, item) {
		if (!checked) {
			item.get('childChecked').setValue(false);
		}
	}

	/**
	 * Next  of shared plan of care component
	 */
	next = () => {
		// this.ngOnDestroy();nextPage
		this.nextPage.emit();
	};

	/**
	 * Backs shared plan of care component
	 */
	back() {
		this.previousPage.emit();
	}

	saveForLater() {
		this.fromRoute === 'provider_calendar' ?
            this._route.navigate(['/scheduler-front-desk/doctor-calendar']) : this._route.navigate(['/front-desk/cases/edit/' + this.fromRoute + '/scheduler']);
	}

	/**
	 * Checks visit type
	 * @param type
	 * @returns
	 */
	checkVisitType(type) {
		if (type == this.visitType) {
			return true;
		} else {
			return false;
		}
	}

	/**
	 * Disables input
	 * @param value
	 * @param form
	 */
	disableInput(value, form) {
		if (!value) {
			form.reset();
			form.disable();
		} else {
			form.enable();
		}
	}

	/**
	 * on destroy
	 */
	ngOnDestroy() {
		let data = this.form.getRawValue();
		// console.log('form submitted values', data)
		data.MRI = data.MRI.filter(function (data) {
			return data.checked == true;
		});

		data.ctScans = this.filterCTScan(data.ctScans);

		data.others = new OtherMRIs(
			data.others.filter((data) => {
				return data.checked == true;
			}),
		);
		data.radiologies = this.filterRadiologies(data.radiologies);
		data.medications = this.medications.getRawValue();
		data.referrals = data.referrals
			.filter((data) => {
				return data.checked == true;
			})
			.map((referral) => {
				referral.exercises = this.filterAndMap(referral, 'exercises', 'id');
				referral.goals = this.filterAndMap(referral, 'goals', 'id');
				referral.modalities = this.filterAndMap(referral, 'modalities', 'id');
				referral.tharapies = this.filterAndMap(referral, 'tharapies', 'id');
				referral.diagnosis = this.filterAndMap(referral, 'diagnosis', 'id');
				referral.weightBearings = this.filterAndMap(referral, 'weightBearings', 'id');
				referral.orientedBodyParts = this.filterAndMap(referral, 'orientedBodyParts', 'bodyPartid');
				referral.nonOrientedBodyParts = this.filterAndMap(
					referral,
					'nonOrientedBodyParts',
					'bodyPartid',
				);
				return referral;
			});
		let session: MedicalSession = new MedicalSession({
			planOfCare: new planOfCare1(data),
		});

		this.mdService.savePlanOfCare(session);
		if(this._route.url == '/scheduler-front-desk/doctor-calendar'){
			if(this.apptdata?.evalFrom == 'monthview'){
				setTimeout(() => {
					this.navigateBackToSameState();
				},0)
			}
		}
		unSubAllPrevious(this.subscriptions);
	}

	/**
	 *
	 * @param object object from which key to be filtered
	 * @param key key that needs to be filtered.
	 * @param id id name.
	 */
	filterAndMap(object, key, id) {
		if (object[key]) {
			object[key] = object[key]
				.filter((value) => {
					return value.checked == true;
				})
				.map((value) => {
					let response =
						key == 'diagnosis'
							? !isNaN(Number(value[id]))
								? Number(value[id])
								: value[id]
							: value;
					return response;
				});
		}
		return object[key];
	}

	/**
	 * Filters ctscan
	 * @param ctScans
	 * @returns
	 */
	filterCTScan(ctScans) {
		return ctScans
			.filter((data) => {
				return data.checked == true;
			})
			.map((data) => {
				return new MRIs(data);
			});
	}
	onCarryForwarded = () => {
		let length = (this.form.get('referrals') as FormArray).length;
		for (let i = 0; i < length - 1; i++) {
			this.generateSpecialtyString((this.form.get('referrals') as FormArray).at(i));
		}
	};
	/**
	 * Filters radiologies
	 * @param radiologies
	 * @returns
	 */
	filterRadiologies(radiologies) {
		return radiologies
			.filter((data) => {
				return data.checked == true;
			})
			.map((data) => {
				return new MRIs(data);
			});
	}
	resetForm(form: FormGroup) {
		let x = this.specialties.findIndex((speciality) => speciality.id === form.value.id);

		let form_array = this.form.get('referrals') as FormArray;

		let referral = {};
		// let referral = this.getSavedReferrals(this.data, this.specialties[x]);

		form = this.fb.group({
			id: this.specialties[x].id,
			specialty: [this.specialties[x].name],
			checked: [form.value.checked],
			perWeek: [getObjectChildValue(referral, '', ['perWeek'])],
			periodName: [getObjectChildValue(referral, '', ['periodName'])],
			intervalName: [getObjectChildValue(referral, '', ['intervalName'])],
			noOfWeeks: [getObjectChildValue(referral, '', ['noOfWeeks'])],
			improvement: [getObjectChildValue(referral, '', ['improvement'])],
			comment: [getObjectChildValue(referral, '', ['comment'])],
			diagnosis: this.createDiagnosticCodes(referral), //[{ value: this.icdCodes, disabled: true }],
			precautions: [getObjectChildValue(referral, '', ['precautions'])],
			evaluate: [getObjectChildValue(referral, '', ['evaluate'])],
			specificInstructions: [getObjectChildValue(referral, '', ['specificInstructions'])],
			weightBearings: this.createWeightBearing(referral, this.specialties[x].id),
			exercises: this.createExercises(referral, this.specialties[x].id),
			modalities: this.createModalities(referral, this.specialties[x].id),
			goals: this.createGoals(referral),
			tharapies: this.createTharapies(referral, this.specialties[x].id),
			checkbox: [],
			evaluateAndTreat: [getObjectChildValue(referral, false, ['evaluateAndTreat'])],
		});
		this.setSpecialtyChangeEvents(form);
		if (!this.mainService.isenableSaveRecordMedicalDoctor()){
			this.form.disable();
		}
		// form_array.removeAt(x)

		form_array.at(x).setValue(form.value);
		// form_array.push(form)
	}

	resetNonOrientedBodyPartsForm() {
		// let bodyPart = this.nonOrientedBodyPartsSeed.find(bodyPart => form.value.bodyPartId === bodyPart.id)
		let nonOrientedBodyParts = this.form.get('nonOrientedBodyParts') as FormArray;
		if(this.data){
		this.data.nonOrientedBodyParts.map((part) => {
			part['checked'] = false;
			// return { ...part, checked: false };
		});
		}
		let form1 = this.createNonOrientedBodyPartsForm(this.data);
		nonOrientedBodyParts.setValue(form1.value);
		if(this.data){
		this.data.orientedBodyParts.map((part) => {
			part['checked'] = false;
			// return { ...part, checked: false };
		});
		}
		let orientedBodyParts = this.form.get('orientedBodyParts') as FormArray;
		let form2 = this.createOrientedBodyPartsForm(this.data);
		orientedBodyParts.patchValue(form2.value);
		// this.createOrientedBodyPartsForm(this.data)

		// form.setValue({
		// 	name: bodyPart.name,
		// 	bodyPartId: bodyPart.id,
		// 	checked: false,
		// });
	}

	resetSpecialityForm() {
		this.referringSpecialties.forEach((speciality) =>
			this.form.get(speciality.specialty_key).reset(),
		);
	}

	resetDevicesForm() {
		let form = this.createDevices(this.data);
		for (let i = 0; i < form.length - 1; i++) {
			form.at(i).get('checked').setValue(false);
		}
		this.form.controls['devices'] = form;
	}

	resetImpairmentForm() {
		this.form.get('temporarilyImpaired').reset();
		this.form.get('temporarilyImpairedComment').reset();
	}

	isCarryForwarded() {
		return this.isReevaluation() && this.carryForwarded;
		// return this.carryForward()
	}

	isReevaluation() {
		return this.storageData.getcurrentSession().visitType === 'reEvaluation' || this.storageData.getcurrentSession().visitType === 'followUp';
	}

	changeTheraptiesIsoMetric($event,index,referralIndex){
		if ($event.currentTarget.checked && this.manual_therapies[index]['slug'] === 'isometric_stabilization'){
		
			 this.manual_therapies.map((val) => {
				 (val.slug ==='cervical' || val.slug ==='lumbar')?val.show_therophy=true:false;
			});
		}	
		else if (!$event.currentTarget.checked && this.manual_therapies[index]['slug'] === 'isometric_stabilization') {
		let theraperiesValue :any[]= 	this.form.controls.referrals['controls'][referralIndex].controls.tharapies.controls;
		theraperiesValue.forEach(theraphy=>{
			if (theraphy.value.id ==7 || theraphy.value.id ==6){
				theraphy.controls['checked'].setValue(false);
			}
		})
			this.manual_therapies.map((val) => {
				(val.slug ==='cervical' || val.slug ==='lumbar')?val.show_therophy=false:false;
		   });		
		}
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
