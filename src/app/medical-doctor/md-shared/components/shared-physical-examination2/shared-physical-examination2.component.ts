import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormArray } from '@angular/forms';
import { Logger } from '@nsalaun/ng-logger';
import { MedicalSession } from '@appDir/medical-doctor/models/common/commonModels';
import {
	PhysicalExamination2,
	Movement,
	BodyPart,
} from '@appDir/medical-doctor/models/initialEvaluation/initialEvaluationModels';
import { MDService } from '@appDir/medical-doctor/services/md/medical-doctor.service';
import { viewControl, GAIT, POSITION } from './viewControls';
import { Subscription } from 'rxjs';
import { MedicalDoctorAbstract } from '@appDir/medical-doctor/medical-doctor-abstract/medical-doctor-abstract';
import { MainService } from '@appDir/shared/services/main-service';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { ToastrService } from 'ngx-toastr';
import { RequestService } from '@appDir/shared/services/request.service';
import { Router } from '@angular/router';
import { CarryForwardService } from '@appDir/medical-doctor/services/carry-forward/carry-forward.service';
import { physicalExaminationTabs } from '@appDir/medical-doctor/models/panel/panel';
import { convertDateTimeForSending, getObjectChildValue } from '@appDir/shared/utils/utils.helpers';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { CalendarMonthService } from '@appDir/shared/modules/doctor-calendar/utils/my-calendar/src/modules/month/calendar-month.service';
import { AppointmentModalDialogService } from '@appDir/shared/modules/doctor-calendar/utils/my-calendar/src/modules/month/appointment-modal-dialog.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { AppointmentUrlsEnum } from '@appDir/shared/modules/appointment/appointment-urls-enum';
import { DoctorCalendarUrlsEnum } from '@appDir/shared/modules/doctor-calendar/doctor-calendar-urls-enum';
@Component({
	selector: 'app-shared-physical-examination2',
	templateUrl: './shared-physical-examination2.component.html',
	styleUrls: ['./shared-physical-examination2.component.scss'],
})
export class SharedPhysicalExamination2Component extends MedicalDoctorAbstract implements OnInit {
	@Input() data: Object;
	@Input() visitType: any;
	@Input() bodyParts: BodyPart[];
	@Input() movements: Movement[];
	@Output() nextPage = new EventEmitter();
	@Output() previousPage = new EventEmitter();
	public controls = viewControl;
	public subscriptions: Array<Subscription> = [];
	public gait: any[];
	public currentScreen = 'physicalExamination2';
	public apptdata:any;
	fromRoute: string;
	// constructor(public fb: FormBuilder,
	//     public MDService: MDService,
	//     private logger: Logger,
	//     private _scrollToService: ScrollToService,
	//     private confirmation: ConfirmationService) {

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
			customDiallogService
		);
	}
	triggerScrollTo(target) {
		// const config: ScrollToConfigOptions = {
		//     container: 'ngx-scroll-to',
		//     target: target,
		//     duration: 1000,
		//     easing: 'easeOutElastic',
		//     offset: 0
		// };
		// setTimeout(() => {
		//     this._scrollToService.scrollTo(config);
		// }, 100);
	}

	ngOnInit() {
		this.fromRoute = localStorage.getItem('routeFrom');
		this.initializeForm(this.data);
		this.subscribeCarryForward();
		this.link = physicalExaminationTabs.find((link) => {
			return link.slug == this.currentScreen;
		});
		this.link.carryForwarded = false;
		this.apptdata =  this.mainService.getCurrentEvaluedApptAData();
	}

	public initializeForm(data) {
		this.gait = GAIT;
		this.form = this.fb.group({
			movementDetails: this.createMovementDetails(data),
			gait: this.createGaitForm(data),
			// 'gait': [(data && data['gait']) ? data['gait'] : ''],
			gaitComment: [data && data['gaitComment'] ? data['gaitComment'] : ''],
			neurologic: [getObjectChildValue(data, null, ['neurologic'])], // [(data && data['neurologic']) ? data['neurologic'] : null],
			neurologicComment: [data && data['neurologicComment'] ? data['neurologicComment'] : ''],
			general: [data && data['general'] ? data['general'] : ''],
			generalComment: [data && data['generalComment'] ? data['generalComment'] : ''],
			alert: [data && data['alert'] ? data['alert'] : ''],
			oriented: [data && data['oriented'] ? data['oriented'] : ''],
			painLevel: [data && data['painLevel'] ? data['painLevel'] : ''],
			painComment: [data && data['painComment'] ? data['painComment'] : ''],
		});
		// if (!this.mainService.isenableSaveRecordMedicalDoctor()){
		// 	this.form.disable();
		// }
	}

	show(item) {
		console.log(item);
	}
	createGaitForm(data): FormArray {
		let formArray = this.fb.array([]);
		GAIT.forEach((gait) => {
			let savedGaits: any[] = getObjectChildValue(data, [], ['gait']) || [];
			let found = savedGaits.find((id) => id == gait.id);
			let form:any = this.fb.group({
				id: [gait.id],
				checked: [found ? true : false],
				name: [gait.name],
			});
			formArray.push(form);
		});

		return formArray;
	}

	getStoredBodyPartMovements(id, data) {
		let movementDetails = getObjectChildValue(data, [], ['movementDetails']);
		return (
			movementDetails.find((movement) => {
				return movement.bodyPartId == id;
			}) || null
		);
	}
	hasOrientation(bodyPart) {
		var hasOrientation = null;
		switch (bodyPart.toLowerCase()) {
			case 'cervical spine':
			case 'lumbosacral spine':
			case 'thoracic spine':
				hasOrientation = false;
				break;
			default:
				hasOrientation = true;
		}
		return hasOrientation;
	}
	createMovementDetails(data) {
		let formData = this.fb.array([]);
		for (let x in this.bodyParts) {
			let storedMovements = this.getStoredBodyPartMovements(this.bodyParts[x].id, data);
			// let storedTestReports = this.getStoredBodyPartTestReports(this.bodyParts[x].id);

			// let storedTestReports = (this.data && this.data['testReports'])?this.data['testReports']:null;

			// this.getStoredBodyPartTestReports(this.bodyParts[x].id);

			// console.log('storedTestReports', storedTestReports);
			let form:any = this.fb.group({
				checked: [storedMovements ? true : false],
				bodyPartId: [this.bodyParts[x].id],
				bodyPartKey: [this.bodyParts[x].bodyPartKey],
				bodyPartName: [this.bodyParts[x].name],
				// 'testName': [(storedMovements && storedMovements.testName) ? storedMovements.testName : ''],
				testResult: [
					storedMovements && storedMovements.testResult ? storedMovements.testResult : '',
				],
				orientation: [
					storedMovements && storedMovements.orientation ? storedMovements.orientation : '',
				],
				tenderness: [
					storedMovements && storedMovements.tenderness ? storedMovements.tenderness : '',
				],
				consistency: [
					storedMovements && storedMovements.consistency ? storedMovements.consistency : '',
				],
				with: [storedMovements && storedMovements.with ? storedMovements.with : ''],
				// 'position': [(storedMovements && storedMovements.position) ? storedMovements.position : ''],
				position: this.createPositionForm(storedMovements),
				painLevel: [storedMovements && storedMovements.painLevel ? storedMovements.painLevel : ''],
				conjunction: [
					storedMovements && storedMovements.conjunction ? storedMovements.conjunction : '',
				],
				comment: [storedMovements && storedMovements.comment ? storedMovements.comment : ''],
				generatedString: [
					storedMovements && storedMovements.generatedString ? storedMovements.generatedString : '',
				],
				painInJoint: [
					storedMovements && storedMovements.painInJoint ? storedMovements.painInJoint : '',
				],
				painAcrossShoulder: [
					storedMovements && storedMovements.painAcrossShoulder
						? storedMovements.painAcrossShoulder
						: '',
				],
				limitationOfMovement: [
					storedMovements && storedMovements.limitationOfMovement
						? storedMovements.limitationOfMovement
						: '',
				],
				normal_range: [storedMovements ? storedMovements.normal_range : null],
				bodyPartMovements: this.createBodyPartMovements(
					this.bodyParts[x].id,
					storedMovements ? storedMovements.bodyPartMovement : null,
				),
				bodyPartTests: this.createBodyPartTests(
					this.bodyParts[x],
					storedMovements ? storedMovements.testReports : null,
				),
			});
			formData.push(form);

			this.subscriptions.push(
				form['controls']['orientation'].valueChanges.subscribe((value) => {
					if (!value) {
						form.controls['normal_range'].setValue(null, { emitEvent: false });
					}
				}),
			);
			// this.subscriptions.push(form['controls']['testResult'].valueChanges.subscribe((value) => {
			//     this.generateString(form);
			// }));
		}
		return formData;
	}
	checkOrientation(orientation, column) {
		if (orientation == column || orientation == 'both') {
			return true;
		}
		return false;
	}
	getMovements(form) {
		return form.controls.bodyPartMovements.controls;
	}

	getTests(form) {
		return form.controls.bodyPartTests.controls;
	}

	getStoredMovementDetails(storedMovements, movementId) {
		for (let x in storedMovements) {
			if (storedMovements[x].movementId == movementId) {
				return storedMovements[x];
			}
		}
		return null;
	}
	setROMs(form, value, identifier) {
		let formValue = form.value;
		let maxLimit = formValue.normalROM > 99 ? 999 : 99;
		let minLimit = formValue.normalROM > 99 ? -999 : -99;

		// let maxLimit = 1000;
		// let minLimit = -1000;
		if (value > maxLimit) {
			form['controls'][identifier].setValue(maxLimit);
		}
		if (value < minLimit) {
			form['controls'][identifier].setValue(minLimit);
		}
	}

	setValidationsForROM(form) {
		this.subscriptions.push(
			form['controls']['measuredROM'].valueChanges.subscribe((value) => {
				this.setROMs(form, value, 'measuredROM');
			}),
		);
		this.subscriptions.push(
			form['controls']['leftMeasuredROM'].valueChanges.subscribe((value) => {
				this.setROMs(form, value, 'leftMeasuredROM');
			}),
		);
		this.subscriptions.push(
			form['controls']['rightMeasuredROM'].valueChanges.subscribe((value) => {
				this.setROMs(form, value, 'rightMeasuredROM');
			}),
		);
		
	}

	createBodyPartMovements(bodyPartId, storedMovements) {
		// console.log('bodyPartId, storedMovements');
		// console.log(bodyPartId, storedMovements);
		let formData = this.fb.array([]);
		for (let x in this.movements) {
			if (bodyPartId == this.movements[x].bodyPartId) {
				let storedMovementDetails = this.getStoredMovementDetails(
					storedMovements,
					this.movements[x].id,
				);
				let form:any = this.fb.group({
					movement: [this.movements[x].movement],
					bodyPartId: [bodyPartId],
					normalROM: [this.movements[x].normalROM],
					orientation: [
						storedMovementDetails && storedMovementDetails.orientation
							? storedMovementDetails.orientation
							: '',
					],
					measuredROM: [
						storedMovementDetails && storedMovementDetails.measuredROM != null
							? storedMovementDetails.measuredROM
							: '',
					],
					leftMeasuredROM: [
						storedMovementDetails && storedMovementDetails.leftMeasuredROM != null
							? storedMovementDetails.leftMeasuredROM
							: '',
					],
					rightMeasuredROM: [
						storedMovementDetails && storedMovementDetails.rightMeasuredROM != null
							? storedMovementDetails.rightMeasuredROM
							: '',
					],
					movementId: [this.movements[x].id],
				});
				this.setValidationsForROM(form);
				formData.push(form);
			}
		}
		return formData;
	}

	getStoredTestReport(name, testReports) {
		if (testReports) {
			for (let x in testReports) {
				if (testReports[x].name == name) {
					return testReports[x];
				}
			}
		}
		return null;
	}

	createBodyPartTests(bodyPart, testReports) {
		let formData = this.fb.array([]);
		if (this.controls[bodyPart.bodyPartKey] && this.controls[bodyPart.bodyPartKey]['testReports']) {
			for (let x in this.controls[bodyPart.bodyPartKey]['testReports']['tests']) {
				let storedTestReport = this.getStoredTestReport(
					this.controls[bodyPart.bodyPartKey]['testReports']['tests'][x]['name'],
					testReports,
				);
				let sign = storedTestReport && storedTestReport.sign ? storedTestReport.sign : null;
				let degree = storedTestReport && storedTestReport.degree ? storedTestReport.degree : null;
				let form :any= this.fb.group({
					name: [this.controls[bodyPart.bodyPartKey]['testReports']['tests'][x].name],
					hasOrientation: [
						this.controls[bodyPart.bodyPartKey]['testReports']['tests'][x].hasOrientation,
					],
					leftSign: [
						storedTestReport && storedTestReport.leftSign ? storedTestReport.leftSign : null,
					],
					rightSign: [
						storedTestReport && storedTestReport.rightSign ? storedTestReport.rightSign : null,
					],
					leftDegree: [
						storedTestReport && storedTestReport.leftDegree ? storedTestReport.leftDegree : null,
					],
					rightDegree: [
						storedTestReport && storedTestReport.rightDegree ? storedTestReport.rightDegree : null,
					],
					Sign: [sign],
					Degree: [degree],
					bodyPartId: [bodyPart.id],
				});
				this.isDegreeDisabled(form, 'rightSign', 'rightDegree');
				this.isDegreeDisabled(form, 'leftSign', 'leftDegree');
				this.isDegreeDisabled(form, 'Sign', 'Degree');
				formData.push(form);
			}
		}
		return formData;
	}
	getSelectedPositions(positions: any[]) {
		positions = positions.filter((position) => position.checked).map((position) => position.name);
		if (positions.length) {
			positions[positions.length - 1] =
				positions.length > 1
					? ` and ${positions[positions.length - 1]}`
					: positions[positions.length - 1];

			let last = positions.pop();
			let joined = positions.join(', ');
			return `${joined} ${last}`;
		}
		return null;
	}

	createPositionForm(storedMovements) {
		let formArray = this.fb.array([]);
		let savedPositions: any[] = getObjectChildValue(storedMovements, [], ['position']) || [];
		POSITION.forEach((position) => {
			let found = savedPositions.find((id) => id == position.id);
			let form :any= this.fb.group({
				id: [position.id],
				checked: [found ? true : false],
				name: [position.name],
			});
			formArray.push(form);
		});
		return formArray;
	}

	hasTests(i) {
		let bodyPartKey = this.form.controls['movementDetails']['controls'][i].value.bodyPartKey;
		if (this.controls[bodyPartKey] && this.controls[bodyPartKey]['testReports']) {
			// console.log("hasTest", this.controls[bodyPartKey]['testReports']);
			return true;
		}
		return false;
	}

	noOrientations(test) {
		for (let k in test) {
			if (!test[k].value.hasOrientation) {
				return true;
			}
		}
		return false;
	}

	toShow(i, value) {
		let bodyPartKey = this.form.controls['movementDetails']['controls'][i].value.bodyPartKey;
		return (
			this.controls[bodyPartKey] &&
			this.controls[bodyPartKey]['testReports'] &&
			this.controls[bodyPartKey]['testReports'][value]
		);
	}

	toShowHead(i, value) {
		let bodyPartKey = this.form.controls['movementDetails']['controls'][i].value.bodyPartKey;
		if (
			this.controls[bodyPartKey] &&
			this.controls[bodyPartKey]['testReports'] &&
			(this.controls[bodyPartKey]['testReports'][value + 'Sign'] ||
				this.controls[bodyPartKey]['testReports'][value + 'Degree'])
		) {
			return true;
		}
		return false;
	}

	check(data, index) {
		let bodyPartKey = this.form.controls['movementDetails']['controls'][index].value.bodyPartKey;

		// this.logger.log('data', data);
		// this.logger.log('bodyPartKey', bodyPartKey);
		if (bodyPartKey == data && data == 'shoulder') {
			return true;
		}
		switch (data) {
			case 'movements':
			case 'tendernessCheckBox':
			case 'tendernessRadio':
			case 'test':
			case 'comment':
			case 'position':
				return this.controls[bodyPartKey] && this.controls[bodyPartKey][data] ? true : false;
			default:
				;
				return (
					this.controls[bodyPartKey] &&
					this.controls[bodyPartKey]['movements'] &&
					this.controls[bodyPartKey]['movements'][data]
				);
		}
	}
	clearPosition(form) {
		this.customDiallogService.confirm('Confirmation', 'Are you sure you want to clear the selections?','Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
				form.controls['position'].setValue('');
					} else {
						return;
					}
		})
		.catch();
	}
	clearTest(form) {
		this.customDiallogService.confirm('Confirmation', 'Are you sure you want to clear the selections?','Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
				form.controls['testResult'].setValue('');
					} else {
						return;
					}
		})
		.catch();

	}
	clear(form) {
		this.customDiallogService.confirm('Confirmation', 'Are you sure you want to clear the selections?','Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
				form.controls['consistency'].setValue('');
						form.controls['with'].setValue('');
						form.controls['painLevel'].setValue('');
						form.controls['conjunction'].setValue('');
						// form.controls['comment'].setValue('');
						// console.log(form.getRawValue());
						// for(let x in form.controls['subBodyParts'].controls){
						//     form.controls['subBodyParts'].controls[x].controls['checked'].setValue(false)
						// }
					} else {
						return;
					}
		})
		.catch();
	}

	clearAppearance() {
		this.customDiallogService
      .confirm(
        'Confirmation',
        'Are you sure you want to clear the selections?',
        'Yes',
        'No'
      )
      .then((confirmed) => {
        if (confirmed) {
          let alert = null;
          let oriented = null;
          let painLevel = null;
          this.form.controls['alert'].setValue(alert);
          this.form.controls['oriented'].setValue(oriented);
          this.form.controls['painLevel'].setValue(painLevel);
        } else {
          return;
        }
      })
      .catch();
	}
	ngOnDestroy() {
		// if (this.form.touched && this.form.dirty) {
		const data = this.form.getRawValue();
		// data.movementDetails = data.movementDetails.filter((data) => {
		//     return data.checked == true;
		// }).map((data) => {
		//     return new MovementDetails(data);
		// });
		let physicalExamination2 = new PhysicalExamination2({
			movementDetails: getObjectChildValue(data, null, ['movementDetails']),
			alert: getObjectChildValue(data, null, ['alert']),
			oriented: getObjectChildValue(data, null, ['oriented']),
			painLevel: getObjectChildValue(data, null, ['painLevel']),
			painComment: getObjectChildValue(data, null, ['painComment']),
			neurologicComment: getObjectChildValue(data, null, ['neurologicComment']),
			neurologic: getObjectChildValue(data, null, ['neurologic']),
			general: getObjectChildValue(data, null, ['general']),
			generalComment: getObjectChildValue(data, null, ['generalComment']),
			gaitComment: getObjectChildValue(data, null, ['gaitComment']),
			gait: getObjectChildValue(data, null, ['gait']),
		});

		let session: MedicalSession = new MedicalSession({
			physicalExamination2: physicalExamination2,
		});
		this.mdService.savePhysicalExamination2(session);
		if(this._route.url == '/scheduler-front-desk/doctor-calendar'){
			if(this.apptdata?.evalFrom == 'monthview'){
				setTimeout(() =>{
					this.navigateBackToSameState();
				},0)
			}
		}
		this.subscriptions.forEach((subscription) => {
			subscription.unsubscribe();
		});
		// }
	}

	next = () => {
		// this.ngOnDestroy();
		this.nextPage.emit();
	};

	back() {
		this.previousPage.emit();
	}

	saveForLater() {
		this.fromRoute === 'provider_calendar' ?
            this._route.navigate(['/scheduler-front-desk/doctor-calendar']) : this._route.navigate(['/front-desk/cases/edit/' + this.fromRoute + '/scheduler']);
	}

	submit() {}

	isDegreeDisabled(form, sign, degree) {
		console.log(form.get(sign).value);

		;
		if (form.get(sign).value == 'negative') {
			form.get(degree).setValue(null);
			form.get(degree).disable();
		} else {
			form.get(degree).enable();
		}
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
