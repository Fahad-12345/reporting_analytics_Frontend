import { ConfirmMockService } from './../../../../shared/mock-services/ConfirmMock.service';
import { NgbModalMockService } from './../../../../shared/mock-services/ngbModalMock.service';
import { MainService } from '@appDir/shared/services/main-service';
import { RequestService } from './../../../../shared/services/request.service';
import { RequestMockService } from './../../../../shared/mock-services/RequestMock.service';
import { EORService } from '@appDir/eor/shared/eor.service';
import { EorMockService } from '@appDir/shared/mock-services/EorMockService.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
	TestBed,
	async,
	ComponentFixture,
	fakeAsync,
	tick,
	discardPeriodicTasks,
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Config } from '@appDir/config/config';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { SharedModule } from '@appDir/shared/shared.module';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { delay } from 'rxjs/operators';
import { of, throwError, pipe } from 'rxjs';
import { PaymentMockService } from '@appDir/shared/mock-services/paymentMockService.service';
import { PaymentService } from '@appDir/payments/payment.service';
import { PaymentBillUrlsEnum } from '@appDir/payments/payment.enum.urls';
import { CreateBillModalComponent } from './create-bill-modal.component';
import { CreateBillModalMockValues } from './create-bill-modal-mock-values/create-bill-modal-mock-values';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { BillingMockService } from '@appDir/shared/mock-services/BillingMockService.service';
import { BillingService } from '../../service/billing.service';
describe('CreateBillModalComponent', () => {
	let comp: CreateBillModalComponent;
	let fixture: ComponentFixture<CreateBillModalComponent>;
	let payment_mockService = new PaymentMockService();
	let eor_mockService = new EorMockService();
	let requestService = new RequestMockService();
	let create_bill_mock_values = new CreateBillModalMockValues();
	let ngbModal_MockService = new NgbModalMockService();
	let billingMockService = new BillingMockService();
	let confirm_MockService = new ConfirmMockService();
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [CreateBillModalComponent],
			imports: [
				SharedModule,
				RouterTestingModule,
				BrowserAnimationsModule,
				ToastrModule.forRoot(),
				HttpClientTestingModule,
			],
			schemas: [NO_ERRORS_SCHEMA],
			providers: [
				Config,
				LocalStorage,
				ToastrService,
				MainService,
				{ provide: PaymentService, useValue: payment_mockService },
				{ provide: EORService, useValue: eor_mockService },
				{ provide: RequestService, useValue: requestService },
				{ provide: NgbModal, useValue: ngbModal_MockService },
				{ provide: BillingService, useValue: billingMockService },
				// { provide: ConfirmationService, useValue: confirm_MockService },
			],
		}).compileComponents();
	}));
	beforeEach(() => {
		fixture = TestBed.createComponent(CreateBillModalComponent);
		comp = fixture.componentInstance;
	});
	afterEach(() => {
		TestBed.resetTestingModule();
	});
	it('should be created', () => {
		expect(comp).toBeTruthy();
	});
	it('Should ngOnInit Test', () => {
		comp.insurances = [{ id: 10, document_type_ids: [10] }];
		comp.isBillingDetail = true;
		comp.billDetail = {
			bill_recipients: [
				{
					bill_recipient_type_id: 1,
					type_ids: [
						{
							document_type_id: 10,
						},
					],
				},
				{
					bill_recipient_type_id: 1,
					type_ids: [
						{
							document_type_id: 10,
						},
					],
				},
				{
					bill_recipient_type_id: 4,
					type_ids: [
						{
							document_type_id: 10,
						},
					],
				},
				{
					bill_recipient_type_id: 3,
					type_ids: [
						{
							document_type_id: 10,
						},
					],
				},
				{
					bill_recipient_type_id: 10,
					type_ids: [
						{
							document_type_id: 10,
						},
					],
				},
			],
			label_id: null,
			kiosk_case: {
				case_insurances: [
					{
						id: 10,
					},
				],
				case_employers: [
					{
						id: 10,
					},
				],
			},
		};
		spyOn(comp, 'setCreateBillingform');
		spyOn(comp, 'getRecipient');
		spyOn(comp, 'dropdownSetting');
		spyOn(comp, 'setDetails');
		spyOn(comp, 'setPagination');
		spyOn(comp, 'setTabs');
		spyOn(comp, 'patchValuesInForm');
		comp.ngOnInit();
		expect(comp.billButtonTitle).toMatch('Update Bill');
		expect(comp.setCreateBillingform).toHaveBeenCalled();
		expect(comp.getRecipient).toHaveBeenCalled();
		expect(comp.dropdownSetting).toHaveBeenCalled();
		expect(comp.dropdownSetting).toHaveBeenCalled();
		expect(comp.setDetails).toHaveBeenCalled();
		expect(comp.setPagination).toHaveBeenCalled();
		expect(comp.setTabs).toHaveBeenCalled();
		expect(comp.patchValuesInForm).toHaveBeenCalled();
		debugger;
		expect(comp.selectedBillTo.length).toBe(5);
	});
	it('Should ngOnInit Test', () => {
		let result: any = [{ icd_codes: [{ name: 'name', describe: 'description' }] }];
		comp.visitList = result;
		comp.lstICDcodes = [
			{ id: 10, name: 'MockName', description: 'MockDescription' },
			{ id: 10, name: 'MockName', description: 'MockDescription' },
		];
		spyOn(comp, 'calculateTotalAmout');
		spyOn(comp, 'ifNullFeeScheduler');
		spyOn(comp, 'setCreateBillingform');
		spyOn(comp, 'getRecipient');
		spyOn(comp, 'dropdownSetting');
		spyOn(comp, 'setDetails');
		spyOn(comp, 'setPagination');
		spyOn(comp, 'calculateVisitAmount');
		comp.ngOnInit();
		expect(comp.calculateTotalAmout).toHaveBeenCalled();
		expect(comp.ifNullFeeScheduler).toHaveBeenCalled();
		expect(comp.setCreateBillingform).toHaveBeenCalled();
		expect(comp.getRecipient).toHaveBeenCalled();
		expect(comp.dropdownSetting).toHaveBeenCalled();
		expect(comp.dropdownSetting).toHaveBeenCalled();
		expect(comp.setDetails).toHaveBeenCalled();
		expect(comp.setPagination).toHaveBeenCalled();
		expect(comp.calculateVisitAmount).toHaveBeenCalled();
	});
	it('Should ngAfterViewInit Test', () => {
		comp.ngAfterViewInit();
		expect(comp.showTable).toBe(true);
	});
	it('Should setPagination Test', () => {
		comp.visitList = [];
		comp.setPagination();
		expect(comp.page.pageNumber).toBe(1);
		expect(comp.page.size).toBe(10);
		expect(comp.page.totalElements).toBe(0);
		expect(comp.billinDetailpage.pageNumber).toBe(1);
		expect(comp.billinDetailpage.size).toBe(10);
		expect(comp.billinDetailpage.totalElements).toBe(0);
	});
	it('Should getFormatedDocuments Test', fakeAsync(() => {
		comp.editBill = true;
		comp.billDetail = {
			document_type_ids: [],
		};
		spyOn(requestService, 'sendRequest').and.returnValue(
			of(create_bill_mock_values.getFormatedDocuments).pipe(delay(1)),
		);
		comp.getFormatedDocuments();
		tick(15000);
		discardPeriodicTasks();
		debugger;
		expect(comp.formateData[0]).toEqual(
			create_bill_mock_values.getFormatedDocuments.result.data[0],
		);
		expect(comp.searchedKeys.commonSearch.lastPage).toBe(2);
	}));
	it('Should setDetails Test', () => {
		comp.editBill = true;
		let visitResp: any = [
			{
				kiosk_case: {
					patient: 'patient',
					case_types: [],
					case_attorneys: [{ id: 10 }],
					case_employers: [{ id: 10 }],
					case_insurances: [
						{
							pivot: {
								type: 'primary',
							},
						},
					],
				},
				speciality_id: 10,
			},
		];
		comp.visitList = visitResp;
		comp.setDetails();

		debugger;
		expect(comp.patient).toMatch('patient');
		expect(comp.speciality).toBe(10);
		expect(comp.case_type.length).toBe(0);
		// expect(comp.lawer).toEqual({ id: 10 });
		// expect(comp.employer[0]).toEqual({ id: 10 });
		expect(comp.insurances.length).toBe(1);
		expect(comp.primaryInsurances).toEqual({
			pivot: { type: 'primary' },
		});
	});
	it('Should setForm Test', () => {
		comp.setForm();
		debugger;
		expect(comp.addCptForm.value).toEqual({ id: '', name: null });
	});
	it('Should patchValuesInForm Test', () => {
		let billDetail = {
			id: 121,
			billDetail: '2021-07-07',
			icd_codes: [
				{
					id: 10,
					name: 'Mock_Name',
					description: 'Mock_Description',
				},
			],
		};
		comp.billDetail = billDetail;
		comp.speciality = 11;
		comp.caseId = 11;
		spyOn(comp, 'calculateTotalAmout');
		comp.setCreateBillingform();
		comp.patchValuesInForm();
		expect(comp.calculateTotalAmout).toHaveBeenCalled();
		expect(comp.billingId).toBe(billDetail.id);
		expect(comp.billID).toBe(billDetail.id);
		debugger;
		expect(comp.icdbuttons[0]).toBe(billDetail.icd_codes[0]);
	});
	it('Should addModal Test', () => {
		// spyOn(ngbModal_MockService, 'open').and.returnValue(true);
		comp.addModal('modal', { modifiers: [{ name: 'Modifier_mock_name' }] }, 'cptcodes');
		expect(comp.isdisable).toBe(false);
		debugger;
		expect(comp.lstCptorModifiers.length).toBe(1);
		expect(comp.addCptForm.value).toEqual({
			id: '',
			name: [{ name: 'Modifier_mock_name' }],
		});
	});
	it('Should getCptCodes Test', fakeAsync(() => {
		let visits: any = [
			{
				cpt_fee_schedules: [
					{
						cpt_code: {
							id: 10,
						},
					},
				],
			},
		];
		comp.visitList = visits;
		comp.rowindex = 0;
		spyOn(requestService, 'sendRequest').and.returnValue(
			of({
				result: { data: [{ id: 10, name: 'mock_name', description: 'mock_description' }] },
			}).pipe(delay(1)),
		);
		comp.getCptCodes('searchKey', null, 'search');
		tick(15000);
		discardPeriodicTasks();
		debugger;
		expect(comp.cptPage.pageNumber).toBe(1);
		expect(comp.searchValueCpt).toMatch('searchKey');
		expect(comp.showSpinnerIntellicense.cpt_codes).toBe(false);
		expect(comp.lstCptorModifiers.length).toBe(0);
	}));
	it('Should getModifiers Test', fakeAsync(() => {
		let visits: any = [
			{
				cpt_fee_schedules: [
					{
						cpt_code: {
							id: 10,
						},
					},
				],
			},
		];
		comp.visitList = visits;
		comp.rowindex = 0;
		spyOn(requestService, 'sendRequest').and.returnValue(
			of({
				result: { data: [{ id: 10, name: 'mock_name', description: 'mock_description' }] },
			}).pipe(delay(1)),
		);
		comp.getModifiers('searchKey', null, 'search');
		tick(15000);
		discardPeriodicTasks();
		debugger;
		expect(comp.cptPage.pageNumber).toBe(1);
		expect(comp.searchValueCpt).toMatch('searchKey');
		expect(comp.showSpinnerIntellicense.cpt_codes).toBe(false);
		expect(comp.lstCptorModifiers.length).toBe(1);
	}));
	it('Should onSelectCode Test', () => {
		let mock_cptValue = [{ id: 31, name: 'cpt_name' }];
		comp.onSelectCode(mock_cptValue);
		debugger;
		expect(comp.selectedCpt[0]).toEqual(mock_cptValue[0]);
	});
	it('Should submtCptOrModifiers Function Tetst If Title CPT Codes & selectedFormats has slug with 1500 and also visits length greater than 6', () => {
		comp.selectedFormats = [{ slug: '1500' }];
		spyOn(comp, 'getVisitLength').and.returnValue(6);
		spyOn(comp, 'onFormatedCheckboxChange');
		comp.submtCptOrModifiers([{ id: 210 }], 'CPT Codes');
		expect(comp.onFormatedCheckboxChange).toHaveBeenCalled();
		expect(comp.getVisitLength).toHaveBeenCalled();
	});
	it('Should submtCptOrModifiers Function Tetst If Title CPT Codes & selectedFormats has slug with 1500 and also visits length greater than 5, Now check addCPT funtion should be called.', () => {
		comp.selectedFormats = [{ slug: '1500' }];
		spyOn(comp, 'getVisitLength').and.returnValue(5);
		spyOn(comp, 'addCPT');
		comp.submtCptOrModifiers([{ id: 210 }], 'CPT Codes');
		expect(comp.addCPT).toHaveBeenCalled();
		expect(comp.getVisitLength).toHaveBeenCalled();
	});
	it('Should submtCptOrModifiers Function Tetst If Title CPT Codes & selectedFormats has slug not 1500 , Now check addCPT funtion should be called.', () => {
		comp.selectedFormats = [{ slug: '100' }];
		spyOn(comp, 'getVisitLength').and.returnValue(5);
		spyOn(comp, 'addCPT');
		comp.submtCptOrModifiers([{ id: 210 }], 'CPT Codes');
		expect(comp.addCPT).toHaveBeenCalled();
		expect(comp.addCPT).toHaveBeenCalled();
	});
	// fit('Should submtCptOrModifiers Function Test, Wheter title is not cpt code, but modifier data length greater than 4',()=>{
	// 	openModal();
	// 	spyOn(comp,'toggleExpandRow');
	// 	spyOn(comp['toastrService'],'error');
	// 	spyOn(window,'setTimeout');
	// 	comp.modifiersData = [12,56,87,55,23];

	// 	comp.submtCptOrModifiers([{ id: 210 }],'modifier');
	// 	expect(comp.toggleExpandRow).toHaveBeenCalled();
	// 	expect(comp['toastrService'].error).toHaveBeenCalled();
	// 	expect(window.setTimeout).toHaveBeenCalled();

	// });
	it('Should calcaulateAllVitits Test', fakeAsync(() => {
		comp.table = {
			rowDetail: {
				toggleExpandRow: function () {
					return true;
				},
			},
		};
		let visitLists: any = [
			{
				id: 10,
				kiosk_case: {
					case_type_id: 29,
					case_insurances: [{ id: 10, pivot: { type: 'primary', insurance_plan_name_id: 33 } }],
					case_employers: [{ id: 10, pivot: { employer_type_id: 1 } }],
				},
				appointment_type_id: 98,
				doctor_id: 21,
				speciality_id: 55,
				facility_location_id: 43,
				facility_location: { region_id: 65, place_of_service_id: 77 },
				cpt_fee_schedules: [{ id: null, cpt_code: { name: 'Mock_cptName' } }],
			},
		];
		comp.visitList = visitLists;
		spyOn(comp, 'mapping');
		spyOn(comp, 'calculateTotalAmout');
		spyOn(window, 'setTimeout');
		spyOn(comp, 'ifNullFeeScheduler');
		spyOn(billingMockService, 'getCalculatedFeeSchedule').and.returnValue(
			of({ result: { data: [{ id: 33 }] } }).pipe(delay(1)),
		);
		comp.calcaulateAllVitits();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.mapping).toHaveBeenCalled();
		expect(window.setTimeout).toHaveBeenCalled();
		expect(comp.ifNullFeeScheduler).toHaveBeenCalled();
		expect(comp.calculateTotalAmout).toHaveBeenCalled();
	}));
	it('Should ifNullFeeScheduler Test', () => {
		spyOn(comp['toastrService'], 'error');
		let visitList: any = [
			{
				cpt_fee_schedules: [
					{
						id: null,
						cpt_code: { name: 'name' },
					},
				],
			},
		];
		comp.visitList = visitList;
		let result = comp.ifNullFeeScheduler();
		expect(comp['toastrService'].error);
		debugger;
		expect(result).toBe(undefined);
	});
	it('Should mapping Test If visitcpts.fee_schedules length greater than 1. Should be verify After this function run calculationVisistAmount and calculateTotalAmount shuuld call and return item must match with expec values.', () => {
		comp.visitList = create_bill_mock_values.visitListMap;
		spyOn(comp, 'calculateVisitAmount');
		spyOn(comp, 'calculateTotalAmout');
		let result = comp.mapping(
			create_bill_mock_values.mappingFirstParam,
			create_bill_mock_values.mappingSecondParam,
		);
		debugger;
		// expect(result[0]).toEqual(create_bill_mock_values.mappingRespWithVisitLengthGreater1);
		expect(comp.calculateVisitAmount).toHaveBeenCalled();
		expect(comp.calculateTotalAmout).toHaveBeenCalled();
	});
	it('Should mapping Test If visitcpts.fee_schedules length 1. Should be verify After this function run calculationVisistAmount and calculateTotalAmount shuuld call and return item must match with expec values.', () => {
		comp.visitList = create_bill_mock_values.visitListMap;
		spyOn(comp, 'calculateVisitAmount');
		spyOn(comp, 'calculateTotalAmout');
		let result = comp.mapping(
			create_bill_mock_values.mappingFirstParamIfFeeSchedulesLength1,
			create_bill_mock_values.mappingSecondParam,
		);
		debugger;
		// expect(result[0]).toEqual(create_bill_mock_values.mappingRespWithVisitLengthGreater1);
		expect(comp.calculateVisitAmount).toHaveBeenCalled();
		expect(comp.calculateTotalAmout).toHaveBeenCalled();
	});
	it('Should addCPT Function Test When Billing Service responce successfull & Should call different function If fee.FeeSchedules length greater than 1.', fakeAsync(() => {
		spyOn(comp, 'toggleExpandRow');
		spyOn(window, 'setTimeout');
		spyOn(comp, 'calculateVisitAmount');
		spyOn(comp, 'calculateTotalAmout');
		comp.singleRecord = {
			id: 10,
			appointment_type_id: 22,
			doctor_id: 32,
			speciality_id: 90,
			facility_location_id: 44,
			facility_location: { region_id: 20, place_of_service_id: 29 },
			kiosk_case: {
				case_type_id: 10,
				case_insurances: [{ pivot: { id: 10, type: 'primary', insurance_plan_name_id: 10 } }],
				case_employers: [{ pivot: { id: 10, employer_type_id: 1 } }],
			},
			cpt_fee_schedules: [],
		};
		spyOn(billingMockService, 'getCalculatedFeeSchedule').and.returnValue(
			of({
				result: {
					data: [
						{
							id: 33,
							cpt_codes: [
								{
									fee_schedules: [
										{
											code_id: 10,
											visit_id: 21,
											total_charges: 3219,
											units: 90,
											per_unit_price: 5,
											fee_schedule_id: 10,
											id: 10,
											hasMultiplFee: false,
										},
										{
											code_id: 10,
											visit_id: 21,
											total_charges: 3219,
											units: 90,
											per_unit_price: 5,
											fee_schedule_id: 10,
											id: 10,
											hasMultiplFee: false,
										},
									],
								},
							],
						},
					],
				},
			}).pipe(delay(1)),
		);
		comp.addCPT([{ id: 10 }]);
		tick(15000);
		discardPeriodicTasks();
		expect(comp.toggleExpandRow).toHaveBeenCalled();
		expect(comp.calculateTotalAmout).toHaveBeenCalled();
		expect(comp.calculateVisitAmount).toHaveBeenCalled();
		expect(window.setTimeout).toHaveBeenCalled();
		expect(comp.isdisable).toBe(false);
	}));
	it('Should addCPT Function Test When Billing Service responce successfull & Should call different function If fee.FeeSchedules length greater than 1.', fakeAsync(() => {
		spyOn(comp, 'toggleExpandRow');
		spyOn(window, 'setTimeout');
		spyOn(comp, 'calculateVisitAmount');
		spyOn(comp, 'calculateTotalAmout');
		comp.singleRecord = {
			id: 10,
			appointment_type_id: 22,
			doctor_id: 32,
			speciality_id: 90,
			facility_location_id: 44,
			facility_location: { region_id: 20, place_of_service_id: 29 },
			kiosk_case: {
				case_type_id: 10,
				case_insurances: [{ pivot: { id: 10, type: 'primary', insurance_plan_name_id: 10 } }],
				case_employers: [{ pivot: { id: 10, employer_type_id: 1 } }],
			},
			cpt_fee_schedules: [],
		};
		spyOn(billingMockService, 'getCalculatedFeeSchedule').and.returnValue(
			of({
				result: {
					data: [
						{
							id: 33,
							cpt_codes: [
								{
									fee_schedules: [
										{
											code_id: 10,
											visit_id: 21,
											total_charges: 3219,
											units: 90,
											per_unit_price: 5,
											fee_schedule_id: 10,
											id: 10,
											hasMultiplFee: false,
										},
									],
								},
							],
						},
					],
				},
			}).pipe(delay(1)),
		);
		comp.addCPT([{ id: 10 }]);
		tick(15000);
		discardPeriodicTasks();
		expect(comp.toggleExpandRow).toHaveBeenCalled();
		expect(comp.calculateTotalAmout).toHaveBeenCalled();
		expect(comp.calculateVisitAmount).toHaveBeenCalled();
		expect(window.setTimeout).toHaveBeenCalled();
		expect(comp.isdisable).toBe(false);
	}));
	it('Should addCPT Function Test When Billing Service responce successfull & Should call different function If fee.FeeSchedules length Zero.', fakeAsync(() => {
		spyOn(comp, 'toggleExpandRow');
		spyOn(window, 'setTimeout');
		spyOn(comp, 'calculateVisitAmount');
		spyOn(comp, 'calculateTotalAmout');
		comp.singleRecord = {
			id: 10,
			appointment_type_id: 22,
			doctor_id: 32,
			speciality_id: 90,
			facility_location_id: 44,
			facility_location: { region_id: 20, place_of_service_id: 29 },
			kiosk_case: {
				case_type_id: 10,
				case_insurances: [{ pivot: { id: 10, type: 'primary', insurance_plan_name_id: 10 } }],
				case_employers: [{ pivot: { id: 10, employer_type_id: 1 } }],
			},
			cpt_fee_schedules: [],
		};
		spyOn(billingMockService, 'getCalculatedFeeSchedule').and.returnValue(
			of({
				result: {
					data: [
						{
							id: 33,
							cpt_codes: [
								{
									id: 10,
									name: 'nullFeeScheduled',
									fee_schedules: [],
								},
							],
						},
					],
				},
			}).pipe(delay(1)),
		);
		comp.addCPT([{ id: 10 }]);
		tick(15000);
		discardPeriodicTasks();
		expect(comp.toggleExpandRow).toHaveBeenCalled();
		expect(comp.calculateTotalAmout).toHaveBeenCalled();
		expect(comp.calculateVisitAmount).toHaveBeenCalled();
		expect(window.setTimeout).toHaveBeenCalled();
		expect(comp.isdisable).toBe(false);
	}));
	it('Should openModel Function Test', () => {
		let visitsList: any = [
			{
				id: 210,
			},
		];
		comp.visitList = visitsList;
		// spyOn(ngbModal_MockService, 'open').and.returnValue(true);
		comp.openModel({ visit_id: 210, multiplefees: [{ id: 10 }] }, []);
		expect(comp.singleRecord.length).toBe(0);
		expect(comp.showCptTable).toBe(true);
		debugger;
		expect(comp.setCpt).toEqual({ multiplefees: [{ id: 10 }], visit_id: 210 });
	});
	it('Should selectCpts Test', () => {
		comp.selectCpts([{ isSelected: false }, { isSelected: true }], null, 0);
		expect(comp.selectCpts).toBeTruthy();
	});
	// fit('Should appendCPT Test',()=>{
	// 	comp.setCpt = [{visit_id:10,per_unit_price:10,base_price:200,units:12,cpt_code:30,total_charges:200,id:10}];
	// 	const ngbModalOptions: NgbModalOptions = {
	// 		backdrop: 'static',
	// 		keyboard: false,
	// 		windowClass: 'modal_extraDOc unique',
	// 	};
	// 	comp.modalReference = comp['modalService'].open('createBillModal', ngbModalOptions);
	// 	spyOn(comp,'toggleExpandRow');
	// 	spyOn(comp,'calculateVisitAmount');
	// 	spyOn(comp,'calculateTotalAmout');
	// 	spyOn(window,'setTimeout');
	// 	comp.appendCPT([{visit_id:10,isSelected:true,per_unit_price:10,base_price:200,units:12,cpt_code:30,total_charges:200,id:10}]);
	// 	expect(comp.toggleExpandRow).toHaveBeenCalled();
	// 	expect(comp.calculateVisitAmount).toHaveBeenCalled();
	// 	expect(comp.calculateTotalAmout).toHaveBeenCalled();
	// 	expect(window.setTimeout).toHaveBeenCalled();
	// });
	it('Should showOnModel Test', () => {
		let visitList: any = [{ kiosk_case: { case_types: { slug: 'name' } } }];
		comp.visitList = visitList;
		comp.singleRecord = {
			cpt_fee_schedules: [],
		};
		comp.cptOrmodifier = 'CPT Codes';
		comp.setForm();
		comp.showOnModel(create_bill_mock_values.showModalParam);
		debugger;
		expect(comp.modifiersData[0]).toEqual({ name: 'mock_name1' });
		expect(comp.selectedCpt[0]).toEqual({ name: 'mock_name1' });
		debugger;
		expect(comp.addCptForm.controls.name.value.length).toBe(7);
	});
	it('Should removeModifier Test', () => {
		comp.removeModifier({ modifiers: [{ id: 10 }] }, { id: 21 });
		expect(comp).toBeTruthy();
	});
	it('Should removeModifierOrCptFromModel Test', () => {
		let modiferData = { id: 20, name: 'mock_name' };
		comp.modifiersData = [modiferData];
		comp.setForm();
		comp.removeModifierOrCptFromModel({ id: 10 }, null);
		debugger;
		expect(comp.addCptForm.controls.name.value[0]).toEqual(modiferData);
	});
	it('Should calculateVisitAmount Test', () => {
		let visitData: any = create_bill_mock_values.calculateVisistLists;
		comp.visitList = visitData;
		comp.calculateVisitAmount(0);
		debugger;
		expect(comp.visitList[0]).toEqual(visitData[0]);
	});
	it('Should updateUnitValue Test', () => {
		spyOn(comp, 'calculateVisitAmount');
		spyOn(comp, 'calculateTotalAmout');
		comp.updateUnitValue(
			{ target: { value: 5 } },
			{ units: 50, total_charges: 200, per_unit_price: 5 },
			0,
		);
		expect(comp.calculateTotalAmout).toHaveBeenCalled();
		expect(comp.calculateVisitAmount).toHaveBeenCalled();
	});
	it('Should calculateTotalAmout Test', () => {
		let visistData: any = [{ visit_charges: 200 }];
		comp.visitList = visistData;
		comp.calculateTotalAmout();
		expect(comp.totalAmount).toBe(200);
	});
	it('Should setCreateBillingform Test', () => {
		comp.setCreateBillingform();
		debugger;
		expect(comp.createbillForm.value.bill_recipients).toMatch('');
		expect(comp.createbillForm.value.document_type_ids).toMatch('');
		expect(comp.createbillForm.value.case_id).toBeNull();
		expect(comp.createbillForm.value.speciality_id).toBeNull();
		expect(comp.createbillForm.value.visit_sessions).toBeNull();
		expect(comp.createbillForm.value.icd_code_ids.length).toBe(0);
	});
	it('Should getRecipient Test', fakeAsync(() => {
		comp.isBillingDetail = true;
		comp.billDetail = {
			bill_recipients: [{ bill_recipient_type_id: 10 }],
		};
		comp.setCreateBillingform();
		spyOn(requestService, 'sendRequest').and.returnValue(
			of({ result: { data: [] } }).pipe(delay(1)),
		);
		comp.getRecipient();
		tick(15000);
		discardPeriodicTasks();
		debugger;
		expect(comp.lstRecip.length).toBe(0);
		expect(comp.createbillForm.value.bill_recipients.length).toBe(0);
		expect(comp.createbillForm.value.icd_code_ids.length).toBe(0);
		expect(comp.createbillForm.value.case_id).toBeNull();
		expect(comp.createbillForm.value.speciality_id).toBeNull();
		expect(comp.createbillForm.value.visit_sessions).toBeNull();
		expect(comp.createbillForm.value.document_type_ids).toMatch('');
	}));
	it('Should dropdownSetting Test', () => {
		comp.dropdownSetting();
		expect(comp.dropdownSettings).toEqual(create_bill_mock_values.dropdownSettingResp);
	});
	it('Should onDeSelectAll Test', () => {
		comp.onDeSelectAll(null);
		expect(comp.selectedBillTo.length).toBe(0);
		expect(comp.billemployer.length).toBe(0);
		expect(comp.billinsurances.length).toBe(0);
		expect(comp.isInsurance).toBe(false);
		expect(comp.isEmployer).toBe(false);
		expect(comp.isLawyer).toBe(false);
		expect(comp.ispatient).toBe(false);
	});
	it('Should onSelectAll Test', () => {
		spyOn(comp, 'checkRecipatanttype');
		comp.onSelectAll([{ id: 10 }]);
		expect(comp.checkRecipatanttype).toHaveBeenCalled();
		expect(comp.selectedBillTo.length).toBe(1);
	});
	it('Should checkRecipatanttype Function Test If name is Lawyer', () => {
		comp.checkRecipatanttype('Lawyer');
		expect(comp.isLawyer).toBe(false);
	});
	it('Should checkRecipatanttype Function Test If name is Patient', () => {
		comp.checkRecipatanttype('Patient');
		expect(comp.ispatient).toBe(false);
	});
	it('Should checkRecipatanttype Function Test If name is Insurance', () => {
		comp.checkRecipatanttype('Insurance');
		expect(comp.isInsurance).toBe(false);
	});
	it('Should checkRecipatanttype Function Test If name is Employer', () => {
		comp.checkRecipatanttype('Employer');
		expect(comp.isEmployer).toBe(false);
	});
	it('Should onDeItemSelect Function Test ', () => {
		spyOn(comp, 'checkRecipatanttype');
		comp.onDeItemSelect({ id: 10, name: 'mock_name' });
		debugger;
		expect(comp.checkRecipatanttype).toHaveBeenCalled();
		expect(comp.selectedBillTo.length).toBe(0);
	});
	it('Should onItemSelect Function Test ', () => {
		spyOn(comp, 'checkRecipatanttype');
		comp.onItemSelect({ id: 10, name: 'mock_name' });
		debugger;
		expect(comp.checkRecipatanttype).toHaveBeenCalled();
		debugger;
		expect(comp.selectedBillTo[0]).toEqual({ bill_recipient_type_id: 10 });
	});
	it('Should getICDcodes Test', fakeAsync(() => {
		spyOn(requestService, 'sendRequest').and.returnValue(
			of({
				result: { data: [{ id: 10, name: 'name_mock', description: 'mock_description' }] },
			}).pipe(delay(1)),
		);
		comp.getICDcodes('name', 'search');
		tick(15000);
		discardPeriodicTasks();
		debugger;
		expect(comp.showSpinnerIntellicense.diagnosis_codes).toBe(false);
		expect(comp.lstICDcodes.length).toBe(1);
		expect(comp.icdPage.pageNumber).toBe(1);
		expect(comp.searchValue).toMatch('name');
	}));
	it('Should removeICDcodeFromList function test', () => {
		comp.removeICDcodeFromList(20);
		expect(comp.icdbuttons).toBe(20);
	});
	it('Should onFormatedCheckboxChange Function Test If item check true & slug name 1500', () => {
		comp.visitList = create_bill_mock_values.onFormatedCheckboxChangeVisist;
		comp.allowed_case_type_slugs = ['1500'];
		comp.formatCheckBox = create_bill_mock_values.formatCheckData;
		spyOn(comp, 'getVisitLength').and.returnValue(7);
		comp.onFormatedCheckboxChange({ checked: true }, { slug: '1500' }, 0);
		debugger;
		expect(comp.formatCheckBox).toEqual(create_bill_mock_values.formatCheckData);
	});
	it('Should onFormatedCheckboxChange Function Test If item check true & slug name not 1500', () => {
		comp.visitList = create_bill_mock_values.onFormatedCheckboxChangeVisist;
		comp.allowed_case_type_slugs = ['1500'];
		comp.formatCheckBox = create_bill_mock_values.formatCheckData;
		spyOn(comp, 'getVisitLength').and.returnValue(7);
		comp.onFormatedCheckboxChange({ checked: true }, { id: 10, slug: '150' }, 0);
		debugger;
		expect(comp.formatCheckBox).toEqual(create_bill_mock_values.formatCheckData);
		expect(comp.selectedFormats.length).toBe(1);
	});
	it('Should onFormatedCheckboxChange Function Test If item check false', () => {
		comp.visitList = create_bill_mock_values.onFormatedCheckboxChangeVisist;
		comp.allowed_case_type_slugs = ['1500'];
		comp.formatCheckBox = create_bill_mock_values.formatCheckDataCheckedFalse;
		spyOn(comp, 'getVisitLength').and.returnValue(7);
		comp.onFormatedCheckboxChange({ checked: true }, { id: 10, slug: '150' }, 0);
		debugger;
		expect(comp.formatCheckBox).toEqual(create_bill_mock_values.formatCheckDataCheckedFalse);
		expect(comp.selectedFormats.length).toBe(1);
	});
	it('Should deleteVisitList Test', () => {
		spyOn(comp, 'calculateTotalAmout');
		comp.visitList = create_bill_mock_values.visitListMap;
		comp.deleteVisitList({ id: 10 });
		debugger;
		expect(comp.page.totalElements).toBe(0);
		expect(comp.calculateTotalAmout).toHaveBeenCalled();
	});
	it('Should deleteCptList Test', () => {
		spyOn(comp, 'calculateVisitAmount');
		spyOn(comp, 'calculateTotalAmout');
		spyOn(comp, 'toggleExpandRow');
		comp.visitList = create_bill_mock_values.deletecptVisistList;
		comp.deleteCptList(true, 1, { rowIndex: 0 });
		expect(comp.visitList[0]['isexpand']).toBe(true);
		expect(comp.calculateVisitAmount).toHaveBeenCalled();
		expect(comp.calculateTotalAmout).toHaveBeenCalled();
		expect(comp.toggleExpandRow).toHaveBeenCalled();
	});
	it('Should confirmDelete Function Test, Here will verify that if index equal to zero and confirm service responce successfull then deleteCptList function shuld be called.', fakeAsync(() => {
		spyOn(comp, 'deleteCptList');
		spyOn(confirm_MockService, 'create').and.returnValue(of({ resolved: true }).pipe(delay(1)));
		comp.confirmDelete({}, 0, {});
		tick(15000);
		discardPeriodicTasks();
		expect(comp.deleteCptList).toHaveBeenCalled();
	}));
	it('Should confirmDelete Function Test, Here will verify that if index greater than 1 and confirm service responce successfull then deleteVisitList function shuld be called.', fakeAsync(() => {
		comp.visitList = create_bill_mock_values.confirmDeleteVisitListLengthGreater1;
		spyOn(comp, 'deleteVisitList');
		spyOn(confirm_MockService, 'create').and.returnValue(of({ resolved: true }).pipe(delay(1)));
		comp.confirmDelete({}, null, {});
		tick(15000);
		discardPeriodicTasks();
		expect(comp.deleteVisitList).toHaveBeenCalled();
	}));
	it('Should confirmDelete Function Test, Here will verify that if index equal to 1 and confirm service responce successfull then error message function shuld be called.', () => {
		comp.visitList = create_bill_mock_values.deletecptVisistList;
		spyOn(comp['toastrService'], 'error');
		comp.confirmDelete({}, null, {});
		expect(comp['toastrService'].error).toHaveBeenCalled();
	});
	it('Should setBillType Function Test If case 1 then allSelectedBillToRecpitant should contains array of object', () => {
		comp.patient = {
			id: 10,
			document_type_ids: [21, 33],
		};
		comp.setBillType(1, null);
		debugger;
		expect(comp.allSelectedBillToRecpitant[0]).toEqual(create_bill_mock_values.allSelectBillToRecpitient_1Resp);
	});
	it('Should setBillType Function Test If case 2 then allSelectedBillToRecpitant should contains array of object', () => {
		comp.billemployer = [{
			id: 10,
			document_type_ids: [21, 33]
		}];
		comp.setBillType(2, null);
		debugger;
		expect(comp.allSelectedBillToRecpitant[0]).toEqual(create_bill_mock_values.allSelectBillToRecpitient_2Resp);
	});
	it('Should setBillType Function Test If case 3 then allSelectedBillToRecpitant should contains array of object', () => {
		comp.billinsurances = [{
			id: 10,
			document_type_ids: [21, 33]
		}];
		comp.setBillType(3, null);
		debugger;
		expect(comp.allSelectedBillToRecpitant[0]).toEqual(create_bill_mock_values.allSelectBillToRecpitient_3Resp);
	});
	it('Should setBillType Function Test If case 4 then allSelectedBillToRecpitant should contains array of object', () => {
		comp.lawer = {
			id: 10,
			document_type_ids: [21, 33]
		};
		comp.setBillType(4, null);
		debugger;
		expect(comp.allSelectedBillToRecpitant[0]).toEqual(create_bill_mock_values.allSelectBillToRecpitient_4Resp);
	});
	it('Should getVisitLength Test',()=>{
		comp.visitList = create_bill_mock_values.confirmDeleteVisitListLengthGreater1;
		let result = comp.getVisitLength();
		debugger;
		expect(result).toBe(2);
	});
	it('Should submitCreateBillForm Function Test then display toaster message with error if cpt_fee_schedules length greater than 6.',()=>{
		spyOn(comp['toastrService'],'error');
		comp.visitList = create_bill_mock_values.submitCreateBillFormVisitList;
		comp.submitCreateBillForm(create_bill_mock_values.submitCreateBillFormParam);
		debugger;
		expect(comp['toastrService'].error).toHaveBeenCalled();
	});
	it('Should submitCreateBillForm Test If any CptFeeSchedule contains null in ID of cptFeeSchedule then return & display error message with add fee schedule.',()=>{
		comp.allowed_case_type_slugs = ["worker_compensation"];
		spyOn(comp['toastrService'],'error');
		comp.visitList = create_bill_mock_values.submitCreateBillFormVisitListWithOneCptFeeScheduleIDNull;
		comp.submitCreateBillForm(create_bill_mock_values.submitCreateBillFormParam);
		debugger;
		expect(comp['toastrService'].error).toHaveBeenCalled();
	});
	it('Should submitCreateBillForm Test If any CptFeeSchedule contains Empty then return & display error message with add Cpt code.',()=>{
		comp.allowed_case_type_slugs = ["worker_compensation"];
		spyOn(comp['toastrService'],'error');
		comp.visitList = create_bill_mock_values.submitCreateBillFormVisitListWithEmptyCptFeeSchedule;
		comp.submitCreateBillForm(create_bill_mock_values.submitCreateBillFormParam);
		debugger;
		expect(comp['toastrService'].error).toHaveBeenCalled();
	});
	it('Should submitCreateBillForm Test If patient Exists. Then return & display error message with Select Bill Format For Patient.',()=>{
		comp.allowed_case_type_slugs = ["worker_compensation"];
		comp.icdbuttons = [{id:10}];
		comp.ispatient = true;
		comp.patient = {
			id:10,
			document_type_ids:[]
		}
		spyOn(comp['toastrService'],'error');
		comp.visitList = create_bill_mock_values.submitCreateBillFormVisitList;
		comp.submitCreateBillForm(create_bill_mock_values.submitCreateBillFormParamWithRecepientNull);
		debugger;
		expect(comp['toastrService'].error).toHaveBeenCalled();
	});
	it('Should submitCreateBillForm Test If patient Exists. Then return & display error message with Select Bill Format For Lawyer.',()=>{
		comp.allowed_case_type_slugs = ["worker_compensation"];
		comp.icdbuttons = [{id:10}];
		comp.isLawyer = true;
		comp.lawer = {
			id:10,
			document_type_ids:[]
		}
		spyOn(comp['toastrService'],'error');
		comp.visitList = create_bill_mock_values.submitCreateBillFormVisitList;
		comp.submitCreateBillForm(create_bill_mock_values.submitCreateBillFormParamWithRecepientNull);
		debugger;
		expect(comp['toastrService'].error).toHaveBeenCalled();
	});
	it('Should submitCreateBillForm Test If billemployer Exists. Then return & display error message with Select Bill Format For Employer.',()=>{
		comp.allowed_case_type_slugs = ["worker_compensation"];
		comp.icdbuttons = [{id:10}];
		comp.isEmployer = true;
		comp.billemployer = [{
			id:10,
			document_type_ids:[]
		}]
		spyOn(comp['toastrService'],'error');
		comp.visitList = create_bill_mock_values.submitCreateBillFormVisitList;
		comp.submitCreateBillForm(create_bill_mock_values.submitCreateBillFormParamWithRecepientNull);
		debugger;
		expect(comp['toastrService'].error).toHaveBeenCalled();
	});
	it('Should submitCreateBillForm Test If billinsurances Exists. Then return & display error message with Select Bill Format For Insurance.',()=>{
		comp.allowed_case_type_slugs = ["worker_compensation"];
		comp.icdbuttons = [{id:10}];
		comp.isInsurance = true;
		comp.billinsurances = [{
			id:10,
			document_type_ids:[]
		}]
		spyOn(comp['toastrService'],'error');
		comp.visitList = create_bill_mock_values.submitCreateBillFormVisitList;
		comp.submitCreateBillForm(create_bill_mock_values.submitCreateBillFormParamWithRecepientNull);
		debugger;
		expect(comp['toastrService'].error).toHaveBeenCalled();
	});
	afterAll(() => {
		TestBed.resetTestingModule();
	});
});
