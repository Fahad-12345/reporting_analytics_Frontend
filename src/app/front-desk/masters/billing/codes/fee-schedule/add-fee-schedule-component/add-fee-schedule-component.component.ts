import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FeeSchecdulerServiceService } from '../services/fee-schecdule-service.service';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { zip as rxzip, ReplaySubject, Subject, map } from 'rxjs';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { parseHttpErrorResponseObject, changeDateFormat } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { RequestService } from '@appDir/shared/services/request.service';
import { EnumApiPath } from '@appDir/front-desk/billing/Models/searchedKeys-modal';
import { ShareAbleFilter } from '@appDir/shared/models/share-able-filter';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { getIdsFromArray, makeSingleNameFormFIrstMiddleAndLastNames, removeEmptyAndNullsArraysFormObject, removeEmptyAndNullsFormObject, removeNullKeyValueFromCommaSepratedArray, unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';
import { FormatEnum } from '@appDir/shared/services/datePipe-format.service';
import * as _ from 'lodash';
import { NgSelectShareableComponent } from '@appDir/shared/ng-select-shareable/ng-select-shareable.component';

@Component({
	selector: 'app-add-fee-schedule-component',
	templateUrl: './add-fee-schedule-component.component.html',
	styleUrls: ['./add-fee-schedule-component.component.scss']
})
export class AddFeeScheduleComponentComponent implements OnInit {

	constructor(private activeModal: NgbActiveModal, public feeScheduleService: FeeSchecdulerServiceService,
		private fb: FormBuilder, private CanDeactivateModelComponentService: CanDeactivateModelComponentService,
		private toastService: ToastrService, protected requestService: RequestService, private toasterService: ToastrService) { }

	@Input() feeSchedule: any
	minDate = new Date()
	isEditMode: boolean
	form: FormGroup;
	reginDisable: boolean;
	posDisable: boolean;
	//listings
	plan_names: any = []
	fee_types: any = []
	lstCaseTypes: Array<any> = []
	lstVisitTypes: Array<any> = []
	lstModifiers: any = []
	lstPractice: any = []
	lstSpeciality: any = []
	lstRegion: any = []
	allRegion: any = []
	lstTypeOfService: any = []
	lstPlaceOfService: any = []
	allPlaceOfService: any = []
	lstEmployer: any = []
	lstCodeTypelst: any = []
	lstInsurance: any = []
	codes: any = []
	disableBtn: boolean = false;
	lstProvider: any = []
	lstPracticeWithLocations: any = [] //array of practice locations
	allPracticeWithLocations: any = []
	lstPicklist: any = []
	visit_types: any = []
	Title: string = 'Add'
	customCurrencyMaskConfig = {
		align: 'left',
		allowNegative: false,
		allowZero: true,
		decimal: '.',
		precision: 2,
		prefix: '',
		suffix: '',
		thousands: ',',
		nullable: true,
	};
	selectedPracticeLocationIds;
	EnumApiPath = EnumApiPath;
	eventsSubject: Subject<any> = new Subject<any>();
	requestServerpath = REQUEST_SERVERS;
	@ViewChild('plansName') plansName;
	selectedMultipleFieldFiter: any = {
		fee_type_id: [],
		modifier_id: [],
		provider_id: [],
		speciality_id: [],
		facility_location_id: [],
		employer_name: [],
	};
	codeNameClasses = ['pointer-none'];
	DATEFORMAT = FormatEnum.DATE_FORMAT;
	@ViewChild('placeOfServiceNgSelect') placeOfServiceNgSelect: NgSelectShareableComponent; 
	@ViewChild('regionNgSelect') regionNgSelect: NgSelectShareableComponent; 
	hitDefaultAPIPOS:boolean = false;
	ngOnInit() {
		this.getPlanNames();
		this.initForm()
		this.minDate = new Date();
		// this.getCodeType()
		// this.getInsurance()
		

		/**
		 * calling all apis for listing
		 *  */
		rxzip(
			// this.getPlanName(),
			// this.getPractice(),
			// this.getRegion(),
			// this.getPlaceOfService(),
			// this.getEmployer(),
			// this.getFeeType(),
			// this.getVisitType(),
			// this.getCaseType(),
			// this.feeScheduleService.searchProvider(),
			// this.feeScheduleService.searchSpeciality()

			// this.getPicklist(),
		).subscribe((data:any) => {
			// this.plan_names = data[0]['result']['data']
			this.lstPractice = data[1]
			var arr = []
			this.lstPractice.forEach(practice => {
				arr.push({
					name: practice.facility_full_name,
					value: {
						practice: { id: practice.facility_id },
						location: { id: practice.id },
						region_id: { id: practice.region_id },
						place_of_service_id: { id: practice.place_of_service_id }
					}
				})
			})
			this.lstPracticeWithLocations = arr
			this.allPracticeWithLocations = this.lstPracticeWithLocations
			this.lstRegion = data[2]
			this.allRegion = this.lstRegion
			this.lstPlaceOfService = data[3] ? data[3].map(m => { return { id: m.id, name: m.code + '-' + m.name } }) : []
			this.allPlaceOfService = this.lstPlaceOfService
			this.lstEmployer = data[4]
			this.fee_types = data[5]['result']['data']
			this.lstVisitTypes = data[6]['result']['data']
			this.lstCaseTypes = data[7]['result']['data']
			this.lstProvider = data[8]['result']['data']

			this.lstProvider = this.lstProvider.map((res => {
				return { id: res.id, name: makeSingleNameFormFIrstMiddleAndLastNames([res.first_name, res.middle_name, res.last_name], ' ') }
			}))

			this.lstSpeciality = data[9]['result']['data']
			// this.lstPicklist = data[8]['result']['data']
			if (this.isEditMode) {
				let selectedpractice = getIdsFromArray(this.feeSchedule.facilities_locations, 'id')
				let practicemap = this.lstPracticeWithLocations.filter(function (item) {
					return (selectedpractice.indexOf(item.value.location['id']) !== -1)
				})
				this.selectedPracticeLocationIds = selectedpractice;
				this.form.get('facility_location_ids').setValue(selectedpractice)
				practicemap ? this.getPOSandRegions(practicemap) : ''
				this.feeSchedule.place_of_service && this.feeSchedule.facilities_locations.length < 1 ? this.getPracticeAndRegion({ id: this.feeSchedule.place_of_service }) : ''
				this.feeSchedule.region && this.feeSchedule.facilities_locations.length < 1 ? this.getPracticeAndPOS({ id: this.feeSchedule.region }) : ''
			}
			this.attachFormControlChanges()
		},
			err => {
				const str = parseHttpErrorResponseObject(err.error.message);
				this.toastService.error(str);
			});
		if (this.feeSchedule) {
			this.isEditMode = true;
			this.Title = 'Edit'
			this.updateForm()
			this.hitDefaultAPIPOS = true;
		}
		this.form.controls['code_type_id'].valueChanges.subscribe(data => {
			if ((this.form.controls['code_type_id'].errors && this.form.controls['code_type_id'].errors.required)) {
				this.form.controls['code_id'].disable()
			} else {
				this.form.controls['code_id'].enable()
			}
		})
	}
	/**
	 * get fee type listing
	 */
	getFeeType() {
		return this.feeScheduleService.getFeeType()
	}
	/**
	 * get picklist listing
	 */
	getPicklist() {
		return this.feeScheduleService.getPicklist()
	}
	/**
	 * get planname listing
	 */
	getPlanName() {
		return this.feeScheduleService.getPlanName()
	}
	all_plansName;
	getPlanNames() {
		if(this.feeSchedule) {
		this.feeScheduleService.getPlanName().subscribe(res => {
			this.all_plansName = res['result']['data'].map(res => {
				return {
					name: res.plan_name,
					...res,
				}
			});
			console.log(this.all_plansName);
			this.plansName['lists'] = this.all_plansName ? this.all_plansName : [];
			this.form && this.form.get('plan_id').value ? this.plansName.searchForm.patchValue({ common_ids: this.form.get('plan_id').value }) : null;
		})
	}
	}
	/**
	 * initialize form
	 * 
	 */
	initForm() {
		this.form = this.fb.group({
			id: [null],
			code_type_id: [null, Validators.required],
			description: [undefined],
			base_price: [null, [Validators.required]],
			code_id: [undefined, [Validators.required]],
			expected_reimbursement: [null],
			units: [undefined, [Validators.required]],
			fee_type_id: [null],
			modifier1: [undefined],
			modifier2: [undefined],
			modifier3: [undefined],
			modifier4: [undefined],
			facility_location_ids: [[]],
			provider_ids: [[]],
			speciality_ids: [[]],
			region_id: [null],
			type_of_service: [null],
			place_of_service_id: [null],
			employer_id: [[]],
			employer_start_date: [undefined],
			employer_end_date: [undefined],
			insurance_id: [[]],
			insurance_start_date: [undefined],
			insurance_end_date: [undefined],
			plan_id: [null],
			picklist_category: [null],
			comments: [undefined],
			case_type_ids: [null],
			visit_type_ids: [null],
			ndc_quantity: [null],
			modifier_ids: [[]],
			start_date: [undefined],
			end_date: [undefined]
		})
		this.form.controls['code_id'].disable()
		this.form.controls['type_of_service'].disable()
	}

	/**
	 * update form
	 */
	updateForm() {
		// var feeScheduleFormModel: FeeScheduleFormModel = this.feeScheduleService.convertFeeScheduleToFormModel(this.feeSchedule);
		this.lstModifiers = this.feeSchedule.modifier
		this.lstModifiers = this.lstModifiers.map((res => {
			return { id: res && res.id, code: res && res.name + '-' + res && res.description, alias: res && res.name + '-' + res && res.description, name: res && res.name }
		}))
		this.lstInsurance[0] = this.feeSchedule.insurance ? this.feeSchedule.insurance : []
		this.lstProvider = this.feeSchedule.provider
		this.lstProvider = this.lstProvider.map((res => {
			return { id: res && res.pivot && res.pivot.provider_id, name: makeSingleNameFormFIrstMiddleAndLastNames([res.first_name, res.middle_name, res.last_name], ' ') }
		}))
		this.lstSpeciality = this.feeSchedule.speciality
		this.lstCaseTypes = this.feeSchedule.case_type
		this.lstVisitTypes = this.feeSchedule.visit_type
		this.lstCodeTypelst[0] = this.feeSchedule.code_type ? this.feeSchedule.code_type : []
		this.codes[0] = this.feeSchedule.code ? this.feeSchedule.code : []
		if(this.feeSchedule.code_type) {
			this.codeNameClasses = [];
		}

		console.log(this.feeSchedule);
		// feeScheduleFormModel.place_of_service_id ? this.lstPlaceOfService = null : ''
		// this.lstPracticeWithLocations = this.feeSchedule.practices.map(m => m.practice)
		this.form.patchValue(
			{
				...this.feeSchedule,
				facility_location_ids:this.feeSchedule.facilities_locations ? this.feeSchedule.facilities_locations.map(item => item.id) : [],
				insurance_id: this.feeSchedule.insurance_id ? this.feeSchedule.insurance_id : [],
				code_type_id: this.feeSchedule.code_type && this.feeSchedule.code_type['id'] ? this.feeSchedule.code_type['id'] : [],
				code_id: this.feeSchedule.code && this.feeSchedule.code['id'] ? this.feeSchedule.code['id'] : [],
				description: this.feeSchedule.code ? this.feeSchedule.code['description'] : [],
				case_type_ids: this.feeSchedule.case_type ? this.feeSchedule.case_type.map(case_type => case_type.id) : null,
				visit_type_ids: this.feeSchedule.visit_type ? this.feeSchedule.visit_type.map(case_type => case_type.id) : null,
				// provider_ids: this.feeSchedule.provider?getIdsFromArray(this.feeSchedule.provider, 'id'):null,
				provider_ids: this.lstProvider ? this.lstProvider.map((res => {
					return res.id
					// return { id: res.pivot.provider_id, name: res.first_name + ' ' + res.middle_name + ' ' + res.last_name }
				})) : [],
				speciality_ids: this.feeSchedule.speciality ? this.feeSchedule.speciality.map(case_type => case_type.id) : null,
				place_of_service_id: this.feeSchedule?.fee_schedule_place_of_service ? this.feeSchedule?.fee_schedule_place_of_service.map((res => {
					return res.id
				})) : [],
				region_id: this.feeSchedule?.fee_schedule_region ? this.feeSchedule?.fee_schedule_region.map((res => {
					return res.id
				})) : [],
				modifier1: this.feeSchedule.modifier[0] ? this.feeSchedule.modifier[0].id : null,
				modifier2: this.feeSchedule.modifier[1] ? this.feeSchedule.modifier[1].id : null,
				modifier3: this.feeSchedule.modifier[2] ? this.feeSchedule.modifier[2].id : null,
				modifier4: this.feeSchedule.modifier[3] ? this.feeSchedule.modifier[3].id : null,
				// practice_ids: getIdsFromArray(this.feeSchedule.practice, 'id'),

				// employer_start_date: this.feeSchedule.employer_start_date,
				// employer_end_date: this.feeSchedule.employer_end_date,
			}
		);
		// this.getCodes(null, this.feeSchedule.code_type['id'])
		if (this.feeSchedule.code_id) {
			this.form.controls['code_id'].enable()

		}
	}
	/**
	 * submit form
	 */
	submit(form) {
		if(this.isModifiersSame()) {
			this.toastService.error('You have selected duplicate modifier','Error');
			return;
		}
		this.disableBtn = true;
		var feeSchedule = this.form.getRawValue();
		// var feeSchedule: FeeScheduleModel = this.feeScheduleService.convertFormModelToFeeSchedule(this.form.value)
		// feeSchedule.unit.id = 1
		feeSchedule.modifier_ids = [
			feeSchedule.modifier1 ? feeSchedule.modifier1 : null,
			feeSchedule.modifier2 ? feeSchedule.modifier2 : null,
			feeSchedule.modifier3 ? feeSchedule.modifier3 : null,
			feeSchedule.modifier4 ? feeSchedule.modifier4 : null,
		]
		feeSchedule.modifier_ids = feeSchedule.modifier_ids.filter(function (el) {
			return el != null;
		});
		feeSchedule.visit_type_ids = feeSchedule.visit_type_ids && feeSchedule.visit_type_ids.length ? feeSchedule.visit_type_ids : null
		feeSchedule.provider_ids = feeSchedule.provider_ids && feeSchedule.provider_ids.length ? feeSchedule.provider_ids : null
		feeSchedule.speciality_ids = feeSchedule.speciality_ids && feeSchedule.speciality_ids.length ? feeSchedule.speciality_ids : null
		feeSchedule.case_type_ids = feeSchedule.case_type_ids && feeSchedule.case_type_ids.length ? feeSchedule.case_type_ids : null
		feeSchedule['facility_location_ids'] = feeSchedule['facility_location_ids'] ? feeSchedule['facility_location_ids'] : [];
		feeSchedule['place_of_service_ids'] = feeSchedule['place_of_service_ids'] ? feeSchedule['place_of_service_ids'] : feeSchedule['place_of_service_id'] ? feeSchedule['place_of_service_id'] : [];
		feeSchedule['region_ids'] = feeSchedule['region_ids'] ? feeSchedule['region_ids'] : feeSchedule['region_id'] ? feeSchedule['region_id'] : [];
		delete feeSchedule.modifier1
		delete feeSchedule.modifier2
		delete feeSchedule.modifier3
		delete feeSchedule.modifier4
		delete feeSchedule['place_of_service_id'];
		delete feeSchedule['region_id'];
		feeSchedule.employer_start_date = changeDateFormat(feeSchedule.employer_start_date)
		feeSchedule.employer_end_date = changeDateFormat(feeSchedule.employer_end_date)
		feeSchedule.insurance_start_date = changeDateFormat(feeSchedule.insurance_start_date)
		feeSchedule.insurance_end_date = changeDateFormat(feeSchedule.insurance_end_date)
		feeSchedule.start_date = feeSchedule.start_date ? changeDateFormat(feeSchedule.start_date) + ' ' + '00:00:00' : feeSchedule.start_date;
		feeSchedule.end_date = feeSchedule.end_date ? changeDateFormat(feeSchedule.end_date) + ' ' + '23:59:59' : feeSchedule.end_date;
		let data = removeEmptyAndNullsArraysFormObject(feeSchedule)
		data = removeEmptyAndNullsFormObject(data)
		data['place_of_service_ids'] = feeSchedule['place_of_service_ids'] ? feeSchedule['place_of_service_ids'] : [];
		data['region_ids'] = feeSchedule['region_ids'] ? feeSchedule['region_ids'] : [];

		if (!this.isEditMode) {
			this.feeScheduleService.createFeeSchedule(data).subscribe(data => {
				this.disableBtn = false;
				if (data['status'] == true) {
					this.toastService.success(`Successfully ${this.isEditMode ? 'updated' : 'added'}`)
					this.activeModal.close(true)
				} else {
					this.toastService.error(data['message'], data['status'])
				}
			}, err => {
				feeSchedule['modifier1']
				feeSchedule['modifier2']
				feeSchedule['modifier3']
				feeSchedule['modifier4']
				this.toasterService.error(err.message, 'Error')
				this.disableBtn = false;
			}
			)
		} else {
			this.feeScheduleService.updateFeeSchedule(feeSchedule).subscribe(data => {
				this.disableBtn = false
				if (data['status']) {
					this.toastService.success(`Successfully ${this.isEditMode ? 'updated' : 'added'}`, 'Success')
					this.activeModal.close(true)
				} else {
					this.toastService.error(data['message'], data['status'])
				}
			}, err => {
				this.disableBtn = false;
			});
		}
	}
	/**
	 * return modifier listing
	 */
	customModifiersList(key?: string) {
		var arr = [
			this.form.get('modifier1').value || '',
			this.form.get('modifier2').value || '',
			this.form.get('modifier3').value || '',
			this.form.get('modifier4').value || ''
		]
		let result = this.lstModifiers
			.map(modifier => {
				if (arr.includes(modifier.id)) {
					modifier.alias = modifier.name
					// console.log('changed modifier', modifier)
				} else {
					modifier.alias = modifier.code
				}
				return modifier
			})
			.filter(modifier => {
				return !(arr.includes(modifier.id) && this.form.get(key).value != modifier.id)
			})
		if (result.length > 0) {
			return result
		}
		else {
			let res = this.lstModifiers.find(m => m.id == this.form.get(key).value)
			return res ? [res] : []
		}

	}
	/**
	 * get practice listing
	 * @param data 
	 */
	getPractice(data?) {
		return this.feeScheduleService.searchPractice(null)
		.pipe(
		map(val => {
			return val['result']['data'] ? val['result']['data'] : []
		}));
	}
	/**
	 * get region listing
	 * @param reginId 
	 */
	getRegion(reginId?) {
		return this.feeScheduleService.searchRegion(reginId)
		.pipe(
		map(val => {

			if (val) {
				if (val['result'] && val['result']['data']) {
					return val['result']['data'] ? val['result']['data'] : [];
				}
				else {
					return val['result'] ? val['result'] : [];
				}
			}
		}, err => {
			const str = parseHttpErrorResponseObject(err.error.message);
			this.toastService.error(str);
		}));
	}
	/**
	 * get place of service listing
	 */
	getPlaceOfService(pos?) {
		return this.feeScheduleService.searchPlaceOfService(pos).pipe(map(val => {
			if (val) {
				if (val['result'] && val['result']['data']) {
					return val['result']['data'] ? val['result']['data'] : [];
				}
				else {
					return val['result'] ? val['result'] : [];
				}
			}
		}, err => {
			const str = parseHttpErrorResponseObject(err.error.message);
			this.toastService.error(str);
		}));
	}
	/**
	 * get employer listing
	 */
	getEmployer() {
		return this.feeScheduleService.searchEmployer(null).pipe(
		map(val => {
			return val['result']['data'] ? val['result']['data'] : []
		},
			err => {
				const str = parseHttpErrorResponseObject(err.error.message);
				this.toastService.error(str);
			}));
	}
	/**
	 * intelicence for fields
	 * @param event 
	 * @param type 
	 */
	search(event, type: string) {
		var value = event.target.value
		type = type.toLowerCase()
		switch (type) {
			case 'modifiers':
				return this.feeScheduleService.searchModifiers(value)
				.pipe(
				map(val => {
					return val['result']['data']
				})).subscribe(data => {
					this.lstModifiers = [...data]
					this.lstModifiers = this.lstModifiers.map((res => {
						return { id: res.id, code: res.name + '-' + res.description, alias: res.name + '-' + res.description, name: res.name }
					}))
				})
			case 'insurance':
				this.getInsurance(event)

		}
	}
	getInsurance(event?) {
		var value = event ? event.target.value : ''
		return this.feeScheduleService.searchInsurance(value).pipe(map(val => {
			return val['result']['data']
		})).subscribe(data => {
			this.lstInsurance = [...data];
		})
	}
	getProvider(event?) {
		var value = event ? event.target.value : ''
		this.feeScheduleService.searchProvider(value)
		.pipe(
		map(val => {
			return val['result']['data']
		})).subscribe(data => {
			this.lstProvider = data
			this.lstProvider = this.lstProvider.map((res => {
				return { id: res.id, name: makeSingleNameFormFIrstMiddleAndLastNames([res.first_name, res.middle_name, res.last_name], ' ') }
			}))
		})
	}
	getSpeciality(event?) {
		var value = event ? event.target.value : ''
		this.feeScheduleService.searchSpeciality(value).pipe(map(val => {
			return val['result']['data']
		})).subscribe(data => {
			this.lstSpeciality = data
		})
	}
	/**
	 * get codes listing
	 * @param event 
	 * @param name 
	 */
	getCodes(event?, name?) {
		let data = { code_type_id: this.form.get('code_type_id').value ? this.form.get('code_type_id').value : name, name: event ? event.target.value : '' }
		this.feeScheduleService.getCodes(data).subscribe(data => {
			this.codes = data['result']['data'] ? data['result']['data'] : []
		}, err => {
			const str = parseHttpErrorResponseObject(err.error.message);
			this.toastService.error(str);
		})
	}
	/**
	 * close form
	 */
	close() {
		if ((this.form.dirty && this.form.touched)) {
			this.CanDeactivateModelComponentService.canDeactivate().then(res => {
				let result = res;
				if (res) {
					this.activeModal.close()
				}
				else {
					return true;
				}
			});
		}
		else {
			this.activeModal.close()
		}
	}
	/**
	 * get case type
	 */
	getCaseType() {
		return this.feeScheduleService.getCaseType()
	}
	/**
	 * get case type
	 */
	ndcCodetype: any
	getCodeType() {
		this.feeScheduleService.getCodeType().subscribe(res => {
			if (res) {
				this.lstCodeTypelst = res['result']['data']
				this.lstCodeTypelst.filter(m => {
					m.name == 'NDC' ? this.ndcCodetype = m.id : null
				})
			}
		})
	}
	/**
	 * get visit type
	 */
	getVisitType() {
		return this.feeScheduleService.getVisitType()
	}
	/**
	 * validation for to and from date
	 * @param to 
	 * @param from 
	 */
	compareDates(to, from) {
		if (to && from) {
			if (new Date(to) <= new Date(from)) {
				return false;
			} else {
				return true;
			}
		}
	}
	/**
	 * reset POs listing
	 */
	resetPOSlist() {
		this.posId = null
		this.lstPlaceOfService = [];
		this.form.controls['place_of_service_id'].reset();
		this.form.controls['place_of_service_id'].disable()
	}
	/**
	 * reset region listing
	 */
	resetRegionlist() {
		this.reginId = null
		this.lstRegion = [];
		this.form.controls['region_id'].reset();
		this.form.controls['region_id'].disable();
	}
	/**
	 * enable practice , place of service and region fields
	 */
	enableFields() {
		this.form.controls['facility_location_ids'].enable()
		this.form.controls['region_id'].enable();
		this.form.controls['place_of_service_id'].enable();
	}
	/**
	 *  reset practice , place of service and region fields
	 */
	resetAll() {
		this.lstPracticeWithLocations = this.allPracticeWithLocations
		this.lstRegion = this.allRegion
		this.lstPlaceOfService = this.allPlaceOfService
		this.enableFields()

	}
	/**
	 * filter region on base of practice
	 */
	filterRegions(checkifsame?) {
		let regnids = this.lstPracticeWithLocations.map(m => parseInt(m.value.region_id['id']))
		this.lstRegion = this.allRegion.filter(function (item) {
			return regnids.indexOf(item.id) !== -1;
		});
		// let daya = this.form.value.practice.every((val, i, arr) => val.value['region_id']['id'] === arr[0].value['region_id']['id']);
		this.lstRegion.length < 1 ? this.resetRegionlist() : ''
	}
	/**
	 * filter pos on base of Practice
	 */
	filterPos() {
		let posids = this.lstPracticeWithLocations.map(m => parseInt(m.value.place_of_service_id['id']))
		this.lstPlaceOfService = this.allPlaceOfService.filter(function (item) {
			return posids.indexOf(item.id) !== -1;
		});
		this.lstPlaceOfService.length < 1 ? this.resetPOSlist() : ''
	}
	/**
	 * get POS nad region on selection of practice
	 * @param event 
	 */
	getPOSandRegions(event) {
		if (event && event.length > 0) {
			this.reginId = event[0].value['region_id'] ? event[0].value['region_id'].id : null;
			this.posId = event[0].value['place_of_service_id'] ? event[0].value['place_of_service_id'].id : null;
			var is_region = event.every((val, i, arr) => val.value['region_id']['id'] === arr[0].value['region_id']['id']);
			var is_pos = event.every((val, i, arr) => val.value['place_of_service_id']['id'] === arr[0].value['place_of_service_id']['id']);
			if (is_region && this.reginId) {
				this.form.controls['region_id'].enable();
				this.lstRegion = this.allRegion.filter(m => m['id'] == parseInt(this.reginId))
				this.lstRegion.length < 1 ? this.resetRegionlist() : ''
				this.lstRegion.length == 1 ? this.form.patchValue({ region_id: this.lstRegion[0].id }) : ''
			}
			else {
				this.resetRegionlist()
			}
			if (is_pos && this.posId) {
				this.form.controls['place_of_service_id'].enable()
				this.lstPlaceOfService = this.allPlaceOfService.filter(res => res.id === this.posId)
				this.lstPlaceOfService.length < 1 ? this.resetPOSlist() : ''
				this.lstPlaceOfService.length == 1 ? this.form.patchValue({ place_of_service_id: this.lstPlaceOfService[0].id }) : ''
			}
			else {
				this.resetPOSlist()
			}
		}
		else {
			if (!this.form.value.place_of_service && !this.form.value.region_id) {
				this.enableFields()
				this.resetAll()
			}
			if (this.form.value.place_of_service && !this.form.value.region_id) {
				this.lstPracticeWithLocations = this.allPracticeWithLocations.filter(m => m.value.place_of_service_id['id'] == this.form.value.place_of_service_id)
				this.lstPlaceOfService = this.allPlaceOfService
				this.filterRegions()
			}
			if (!this.form.value.place_of_service && this.form.value.region_id) {
				this.lstPracticeWithLocations = this.allPracticeWithLocations.filter(m => m.value.region_id['id'] == this.form.value.region_id)
				this.enableFields()
				this.filterPos()
				this.lstRegion = this.allRegion
			}

		}
	}
	/**
	 * get Practice nad region on selection of POS
	 * @param selectedPos 
	 */
	getPracticeAndRegion(selectedPos) {
		let practiceids = this.form.get('facility_location_ids').value.length
		if (selectedPos) {
			let posId = selectedPos['id'];
			this.enableFields()
			if (practiceids < 1 && !this.form.value.region_id) {
				this.lstPracticeWithLocations = []
				this.lstPracticeWithLocations = this.allPracticeWithLocations.filter(m => m.value.place_of_service_id['id'] == posId)
				this.lstPracticeWithLocations.length < 1 ? this.form.controls['facility_location_ids'].disable() : ''
				this.filterRegions();
			}
			if (practiceids > 0 && !this.form.value.region_id) {
				this.lstPracticeWithLocations = this.lstPracticeWithLocations.filter(m => m.value.place_of_service_id['id'] == posId)
				this.lstRegion.length < 1 ? this.form.get('region_id').disable() : this.form.get('region_id').enable()
			}
			if (practiceids < 1 && this.form.value.region_id) {
				this.lstPracticeWithLocations = this.lstPracticeWithLocations.filter(m => m.value.region_id['id'] == this.form.value.region_id)
			}
		}
		else {
			if (practiceids < 1 && !this.form.value.region_id) {
				this.enableFields()
				this.resetAll()
			}
			if (practiceids > 0 && !this.form.value.region_id) {
				this.lstPracticeWithLocations = this.allPracticeWithLocations
			}
			if (practiceids < 1 && this.form.value.region_id) {
				this.lstPracticeWithLocations = this.allPracticeWithLocations.filter(m => m.value.region_id['id'] == this.form.value.region_id)
				this.filterPos();
				this.lstRegion = this.allRegion
			}
			if (practiceids > 0 && this.form.value.region_id) {
				this.lstPracticeWithLocations = this.allPracticeWithLocations.filter(m => m.value.region_id['id'] == this.form.value.region_id)
			}
		}
		this.filter(this.lstPracticeWithLocations, this.formControls[4], 4)
	}
	reginId: any
	posId: any
	/**
	 * get practice nad POS on selection of Regions
	 * @param selectedRegion 
	 */
	getPracticeAndPOS(selectedRegion) {
		let practiceids = this.form.get('facility_location_ids').value.length
		if (selectedRegion) {
			let regionId = selectedRegion['id']
			if (practiceids < 1 && !this.form.value.place_of_service_id) {
				this.lstPracticeWithLocations = []
				this.enableFields()
				this.lstPracticeWithLocations = this.allPracticeWithLocations.filter(m => m.value.region_id['id'] == regionId)
				this.lstPracticeWithLocations.length < 1 ? this.form.controls['facility_location_ids'].disable() : ''
				this.filterPos()
			}
			if (practiceids > 0 && !this.form.value.place_of_service_id) {
				this.filterPos()
			}
			if (practiceids > 0 && this.form.value.place_of_service_id) {
				this.lstPracticeWithLocations = this.lstPracticeWithLocations.filter(m => m.value.region_id['id'] == regionId)
			}
			if (practiceids < 1 && this.form.value.place_of_service_id) {
				this.lstPracticeWithLocations = this.allPracticeWithLocations.filter(m => m.value.place_of_service_id['id'] == this.form.value.place_of_service_id)
				this.lstPracticeWithLocations = this.lstPracticeWithLocations.filter(m => m.value.region_id['id'] == regionId)
			}
		}
		else {
			if (practiceids < 1 && !this.form.value.place_of_service_id) {
				this.enableFields()
				this.resetAll()
			}
			if (practiceids > 0 && !this.form.value.place_of_service_id) {
				this.lstPracticeWithLocations = this.allPracticeWithLocations
				this.getPOSandRegions(this.form.value.facility_location_ids)
			}
			if (practiceids < 1 && this.form.value.place_of_service_id) {
				this.lstPracticeWithLocations = this.allPracticeWithLocations.filter(m => m.value.place_of_service_id['id'] == this.form.value.place_of_service_id)
				this.filterRegions()
			}
			if (practiceids > 0 && this.form.value.place_of_service_id) {
				this.lstPracticeWithLocations = this.allPracticeWithLocations.filter(m => m.value.place_of_service_id['id'] == this.form.value.place_of_service_id)
			}
		}
		this.filter(this.lstPracticeWithLocations, this.formControls[4], 4)
	}
	/**
	 * populate data in discription against code name
	 * @param event 
	 */
	populateDiscription(event) {
		// let data = this.codes.filter(res => res.id == event.target.value)
		this.form.patchValue(
			{ description: event.description }
		)
	}
	/**
	 * show employer dates
	 */
	showEmployersDates() {
		// return this.form.controls['employer_id'].value.length > 0 ? true : false
		// console.log('daataa', this.form.controls['employer_id'].value)
		return (this.form.controls['employer_id'].value != '' || this.form.controls['employer_id'].value != null) ? true : false
	}
	mapPractices() {
		return this.lstPracticeWithLocations.map(practice => practice.value)
	}
	clearEmp() {
		this.form.get('employer_start_date').setValue(null)
		this.form.get('employer_end_date').setValue(null)
	}
	clearIns() {
		this.form.get('insurance_id').setValue(null)
		this.form.get('insurance_start_date').setValue(null)
		this.form.get('insurance_end_date').setValue(null)
	}
	clearCodeAndDescriptiop() {
		this.form.get('code_id').setValue(null)
		this.form.get('description').setValue(null)
		this.codes = []
		this.eventsSubject.next(true);
	}
	onMatDatePickerClosed(input) { console.log(input) }

	formControls = [
		new FormControl(),
		new FormControl(),
		new FormControl(),
		new FormControl(),
		new FormControl()
	]

	subs = []

	subjects = [
		new ReplaySubject<any>(1),
		new ReplaySubject<any>(1),
		new ReplaySubject<any>(1),
		new ReplaySubject<any>(1),
		new ReplaySubject<any>(1),
	]
	attachFormControlChanges() {
		let arrays = [this.lstCaseTypes, this.lstVisitTypes, this.lstProvider, this.lstSpeciality, this.lstPracticeWithLocations]
		this.formControls.forEach((control, index) => {
			this.subs.push(control.valueChanges
				.subscribe(() => {
					this.filter(arrays[index], control, index);
				}));
			this.subjects[index].next(arrays[index])
		})
	}
	private filter(array: any[], control: FormControl, index) {
		if (!array) {
			return;
		}
		// get the search keyword
		let search = control.value;
		if (!search) {
			this.subjects[index].next(array.slice());
			return;
		} else {
			search = search.toLowerCase();
		}
		// filter the banks
		this.subjects[index].next(
			array.filter(bank => bank.name.toLowerCase().indexOf(search) > -1).map(result => { return { id: result.id, name: result.name } })
		);
	}
	ngOnDestroy() {
		unSubAllPrevious(this.subs)
	}
	onModifierChange(event) {
		// const arr = [
		// 	this.form.get('modifier1').value || '',
		// 	this.form.get('modifier2').value || '',
		// 	this.form.get('modifier3').value || '',
		// 	this.form.get('modifier4').value || ''
		// ]
		// this.lstModifiers = this.lstModifiers.map(modifier => {
		// 	if (arr.includes(modifier.id)) {
		// 		modifier.alias = modifier.name
		// 		console.log('changed modifier', modifier)
		// 	} else {
		// 		modifier.alias = modifier.code
		// 	}
		// 	return modifier
		// })
		// console.log(this.lstModifiers)
	}
	selectionOnValueChange(e: any,Type?) {
		debugger;
		const info = new ShareAbleFilter(e);
		this.form.patchValue(removeEmptyAndNullsFormObject(info));
		if (e && e.label === 'modifier1'){
		this.feeSchedule.modifier[0] = null;
		}
		if(Type == 'codeType') {
			this.clearCodeAndDescriptiop();
			debugger;
			if(e.data || e.data.length ===0) {
				this.codeNameClasses = [];
			}
			else {
				this.codeNameClasses = ['pointer-none'];
				this.form.controls.code_type_id.setValue(null);
			}
		} else if(Type == 'codeName') {
			if(!e.data || e.data.length ===0) {
				this.form.controls.code_id.setValue(null);
				this.form.controls.description.setValue(null);
			} else {
				this.populateDiscription(e.data.realObj);
			}
		}
		 else if(Type == 'regionId') {
			if(!e.data || e.data.length ===0) {
				this.form.get('region_id').setValue(null);
			}
			this.getPracticeAndPOS(e);
		} else if (Type == 'placeService') {
			if(!e.data || e.data.length ===0) {
				this.form.get('place_of_service_id').setValue(null);
			}
			this.getPracticeAndRegion(e);
		} else if (Type == 'employer') {
			if(!e.data || e.data.length ===0) {
				this.form.get('employer_id').setValue(null)
				this.form.get('employer_start_date').setValue(null)
				this.form.get('employer_end_date').setValue(null)
			}
			// this.clearEmp();
		} else if(Type == 'insurance') {
			if(!e.data || e.data.length ===0) {
				this.clearIns();
			}
		} else if(Type == 'visitType') {
			if(!e.data || e.data.length ===0) {
				this.form.get('visit_type_ids').setValue(null);
			}
		}
		 else if(Type == 'provider') {
			if(!e.data || e.data.length ===0) {
				this.form.get('provider_ids').setValue(null);
			}
		} else if(Type == 'speciality') {
			if(!e.data || e.data.length ===0) {
				this.form.get('speciality_ids').setValue(null);
			}
		} else if(Type == 'practice-location') {
			if(!e.data || e.data.length ===0) {
				this.form.get('facility_location_ids').setValue([]);
			} 
		} else if(Type == 'caseTypes') {
			debugger;
			if(!e.data || e.data.length ===0) {
				this.form.get('case_type_ids').setValue(null);
			}
		} else if(Type == 'modifier1' || Type == 'modifier2' || Type == 'modifier3' || Type == 'modifier4') {
			if(!e.data || e.data.length ===0) {
				this.form.get(Type).setValue(null);
			}
		}

		
	}
	touchedNgSelect(Type?) {
		if(Type == 'codeType') {
			this.form.controls.code_type_id.markAsTouched();
		} else if(Type == 'codeName') {
			this.form.controls.code_id.markAsTouched();
		}
	}
	isModifiersSame() {
		let modifierArray:any = [];
		modifierArray.push(this.form.get('modifier1').value);
		modifierArray.push(this.form.get('modifier2').value);
		modifierArray.push(this.form.get('modifier3').value);
		modifierArray.push(this.form.get('modifier4').value);
		let newArray = removeNullKeyValueFromCommaSepratedArray(modifierArray);
		let uniqueModifier = _.uniq(_.filter(newArray, (v, i, a) => a.indexOf(v) !== i));
		if(uniqueModifier.length > 0) {
			return true;
		}
		return false;
	}

	providerIdForFeeScheduler(providers: any) {
		const providerList: any[] = providers.map(
			(res) =>
				(res = {
					id: res.pivot && res.pivot.provider_id,
					full_name: res.first_name + res.middle_name + res.last_name,
					first_name: res.first_name,
					last_name: res.last_name,
					middle_name: res.middle_name,
				}),
		);
		return providerList;
	}

	selectionOfFacilityLocation(e: any){
		debugger;
		this.placeOfServiceNgSelect.conditionalExtraApiParams = { 'facility_location_ids': e && e.formValue};
		this.regionNgSelect.conditionalExtraApiParams = { 'facility_location_ids': e && e.formValue};
		this.placeOfServiceNgSelect.selectedItemAPICallBydefault();
		this.regionNgSelect.selectedItemAPICallBydefault();
		if(e.data && e.data.length === 1){
		 this.regionNgSelect.disableField = true;
		 this.placeOfServiceNgSelect.disableField = true;
		 this.placeOfServiceNgSelect.searchForm.get('common_ids').disable();
		 this.regionNgSelect.searchForm.get('common_ids').disable();
		 this.form.patchValue({region_id: [parseInt((e['data'][0]['realObj']['region_id']))] , place_of_service_id: [parseInt((e['data'][0]['realObj']['place_of_service_id']))] });
		 this.placeOfServiceNgSelect.searchForm.patchValue({ common_ids: [parseInt((e['data'][0]['realObj']['place_of_service_id']))] });
		 this.regionNgSelect.searchForm.patchValue({ common_ids: [parseInt((e['data'][0]['realObj']['region_id']))] });
		}else{
			this.regionNgSelect.disableField = false;
			this.placeOfServiceNgSelect.disableField = false;
			this.form.controls['place_of_service_id'].reset();
			this.form.controls['region_id'].reset();
			this.placeOfServiceNgSelect.searchForm.get('common_ids').enable();
			this.regionNgSelect.searchForm.get('common_ids').enable();
			this.regionNgSelect.initializeSearchForm();
			this.placeOfServiceNgSelect.initializeSearchForm();
		}
	}
}