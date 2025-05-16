import { SignatureMockService } from './../../../../shared/mock-services/SignatureMock.service';
import { LoggerMockService } from '@appDir/shared/mock-services/LoggerMock.service';
import { FDServices } from './../../services/fd-services.service';
import { FDMockService } from './../../../../shared/mock-services/FDMockService.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
	TestBed,
	async,
	ComponentFixture,
	fakeAsync,
	tick,
	discardPeriodicTasks,
	flush,
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Config } from '@appDir/config/config';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { SharedModule } from '@appDir/shared/shared.module';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { RequestMockService } from '@appDir/shared/mock-services/RequestMock.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { delay } from 'rxjs/operators';
import { ConfirmMockService } from '@appDir/shared/mock-services/ConfirmMock.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CanDeactiveMockService } from '@appDir/shared/mock-services/CanDeactiveModalMock.service';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { Logger } from '@nsalaun/ng-logger';
// import { NgxMaskModule } from 'ngx-mask';
import { Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MedicalIdentifierFormComponent } from './medical-identifier-form.component';
import { MainService } from '@appDir/shared/services/main-service';
import { SignatureServiceService } from '@appDir/shared/signature/services/signature-service.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
describe('MedicalIdentifierFormComponent', () => {
	let comp: MedicalIdentifierFormComponent;
	let fixture: ComponentFixture<MedicalIdentifierFormComponent>;
	let request_MockService = new RequestMockService();
	let confirm_MockService = new ConfirmMockService();
	let canActivate_MockService = new CanDeactiveMockService();
	let logger_MockService = new LoggerMockService();
	let fd_MockService = new FDMockService();
	let signatureMockService = new SignatureMockService();
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [MedicalIdentifierFormComponent],
			imports: [
				SharedModule,
				RouterTestingModule,
				ToastrModule.forRoot(),
				BrowserAnimationsModule,
				HttpClientTestingModule 
			],
			schemas: [NO_ERRORS_SCHEMA],
			providers: [
				Config,
				LocalStorage,
				ToastrService,
				MainService,
				{ provide: RequestService, useValue: request_MockService },
				{ provide: CanDeactivateModelComponentService, useValue: canActivate_MockService },
				{ provide: FDServices, useValue: fd_MockService },
				{ provide: SignatureServiceService, useValue: signatureMockService },
				{ provide: Logger, useValue: logger_MockService },
				{
					provide: ActivatedRoute,
					useValue: {
						parent: {
							parent: { parent: 123 },
						},
						snapshot: {
							pathFromRoot: [{ params: { id: 123 } }],
						},
						params: of({ id: 123 }),
					},
				},
			],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(MedicalIdentifierFormComponent);
		comp = fixture.componentInstance;
	});
	afterEach(() => {
		TestBed.resetTestingModule();
	});
	function address_Data() {
		return {
			address_components: [],
			adr_address: 'abd',
			formatted_address: 'abd',
			formatted_phone_number: 'abd',
			geometry: {
				location: {
					lat: function () {
						return 123;
					},
					lng: function () {
						return 123;
					},
				},
				viewport: '',
			},
			html_attributions: [],
			icon: 'abc',
			id: '1',
			international_phone_number: 'abc',
			name: 'abc',
			opening_hours: { open_now: false, periods: [], weekday_text: [] },
			permanently_closed: false,
			photos: [],
			place_id: 'abc',
			price_level: 1,
			rating: 1,
			reviews: [],
			types: [],
			url: 'abc',
			utc_offset: 1,
			vicinity: 'abc',
			website: 'abc',
			street_number: 'abc',
		};
	}
	function setForm() {
		return comp['fb'].group({
			registration_number: [''],
			registration_expiration_date: [''],
			dea_number: ['', [Validators.required, Validators.minLength(9)]],
			dea_expiration_date: [''],
			dea_issue_date: [''],
			npi: ['', [Validators.minLength(10), Validators.maxLength(10)]],
			spi: [''],
			billing_title_id: ['', Validators.required],
			billing_employment_type_id: [''],
			nadean_number: ['', Validators.minLength(9)],
			upin: [''],
			wcb_authorization: [''],
			please_specify: [''],
			wcb_rating_code: [''],
			wcb_date_of_issue: ['', []],
			hospital_privileges: [''],
			medical_credentials: ['0'],
			id: [''],
			license_history: comp['fb'].array([comp.addliscenseHistory()]),
			is_self: [''],
			doctor_id: [''],
		});
	}
	it('should be created', () => {
		expect(comp).toBeTruthy();
	});
	it('should ngOnInit Test When Subscribe successfull IF license_detail exists', fakeAsync(() => {
		let Given_Responce = {
			status: true,
			message: 'Users List',
			result: {
				data: {
					doctor_id: 10,
					icd10_codes: [],
					cpt_codes: [],
					license_detail: [
						{
							medical_license: '',
							medical_license_expiration_date: '',
							state_issuing_the_medical_license: '',
							degree_listed_on_the_license: '',
							medical_license_issue_date: '',
						},
					],
				},
				current_page: 1,
				first_page_url: 'http://cm.ovadamd.net/api/users?page=1',
				from: 1,
				last_page: 27,
				last_page_url: 'http://cm.ovadamd.net/api/users?page=27',
				next_page_url: 'http://cm.ovadamd.net/api/users?page=2',
				path: 'http://cm.ovadamd.net/api/users',
				per_page: '10',
				prev_page_url: null,
				to: 10,
				total: 265,
			},
		};
		// spyOn(document, "getElementById").and.callFake(function() {
		// 	return {
		// 			classList:{
		// 				add: function () {
		// 					return 123;
		// 				},
		// 				remove: function () {
		// 					return 123;
		// 				},
		// 			}
		// 	}
		// });
		comp.id = 123;
		spyOn(comp, 'license_historyFormValidation');
		spyOn(comp, 'matSearchListener');
		localStorage.setItem('cm_data', JSON.stringify({ basic_info: { id: 123 } }));
		spyOn(signatureMockService, 'getSignature').and.returnValue(of(Given_Responce).pipe(delay(1)));
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(Given_Responce).pipe(delay(1)));
		comp.ngOnInit();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.currentObjectType).toMatch('doctor');
		expect(comp.license_historyFormValidation).toHaveBeenCalled();
		expect(comp.matSearchListener).toHaveBeenCalled();
		expect(comp.isSameUserLogin).toBe(true);
	}));
	it('should ngOnInit Test When Subscribe successfull IF license_detail does not exists', fakeAsync(() => {
		let Given_Responce = {
			status: true,
			message: 'Users List',
			result: {
				data: {
					doctor_id: 10,
					icd10_codes: [],
					cpt_codes: [],
					license_detail: [],
				},
				current_page: 1,
				first_page_url: 'http://cm.ovadamd.net/api/users?page=1',
				from: 1,
				last_page: 27,
				last_page_url: 'http://cm.ovadamd.net/api/users?page=27',
				next_page_url: 'http://cm.ovadamd.net/api/users?page=2',
				path: 'http://cm.ovadamd.net/api/users',
				per_page: '10',
				prev_page_url: null,
				to: 10,
				total: 265,
			},
		};
		// spyOn(document, "getElementById").and.callFake(function() {
		// 	return {
		// 			classList:{
		// 				add: function () {
		// 					return 123;
		// 				},
		// 				remove: function () {
		// 					return 123;
		// 				},
		// 			}
		// 	}
		// });
		comp.id = 123;
		spyOn(comp, 'setDefaultPaginationCodes');
		spyOn(comp, 'license_historyFormValidation');
		spyOn(comp, 'matSearchListener');
		localStorage.setItem('cm_data', JSON.stringify({ basic_info: { id: 123 } }));
		spyOn(signatureMockService, 'getSignature').and.returnValue(of(Given_Responce).pipe(delay(1)));
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(Given_Responce).pipe(delay(1)));
		comp.ngOnInit();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.currentObjectType).toMatch('doctor');
		expect(comp.license_historyFormValidation).toHaveBeenCalled();
		expect(comp.matSearchListener).toHaveBeenCalled();
		expect(comp.setDefaultPaginationCodes).toHaveBeenCalled();
	}));
	it('Should setValuesNgSelectShareableBillingTitle Test', () => {
		comp.form = setForm();
		comp.BillingTitle.searchForm = comp['fb'].group({
			common_ids: [''],
		});
		comp.lstBillingTitle = [{ id: 10, title: 'billingTitle' }];
		comp.form.controls.billing_title_id.setValue(20);
		comp.setValuesNgSelectShareableBillingTitle();
		expect(comp.lstBillingTitle.length).toBe(1);
	});
	it('Should setValuesNgSelectShareableBillingEmployementType Test', () => {
		comp.form = setForm();
		comp.BillingTitle.searchForm = comp['fb'].group({
			common_ids: [''],
		});
		comp.lstBillingEmploymentType = [{ id: 10, title: 'lstBillingEmploymentType' }];
		comp.form.controls.billing_employment_type_id.setValue(20);
		comp.setValuesNgSelectShareableBillingTitle();
		expect(comp.lstBillingEmploymentType.length).toBe(1);
	});
	it('Should setDefaultPaginationCodes Test', () => {
		spyOn(comp, 'setIcdPageDefault');
		spyOn(comp, 'setCptPageDefault');
		comp.setDefaultPaginationCodes();
		expect(comp.setIcdPageDefault).toHaveBeenCalled();
		expect(comp.setCptPageDefault).toHaveBeenCalled();
	});
	it('Should setIcdPageDefault Test', () => {
		comp.setIcdPageDefault();
		expect(comp.icdPage.pageNumber).toBe(1);
	});
	it('Should setCptPageDefault Test', () => {
		comp.setCptPageDefault();
		expect(comp.cptPage.pageNumber).toBe(1);
	});
	it('Should license_historyFormValidation Test', fakeAsync(() => {
		comp.form = setForm();
		// spyOn(comp.form, 'valueChanges').and.returnValue(of(true).pipe(delay(1)));
		comp.form.controls.license_history.setValue([
			{
				medical_license: 1,
				medical_license_expiration_date: '2021-05-17',
				state_issuing_the_medical_license: '2021-05-17',
				degree_listed_on_the_license: 'degree_listed_on_the_license',
				medical_license_issue_date: '2021-05-17',
			},
		]);
		comp.license_historyFormValidation();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.form.valid).toBe(false);
	}));
	it('Should removeData Test', () => {
		comp.form = setForm();
		comp.removeData();
		expect(comp.form.controls.license_history.valid).toBeTruthy();
	});
	it('Should setForm Test', () => {
		spyOn(comp.form, 'setValidators');
		comp.setForm();
		expect(comp.form.value).toEqual({
			billing_employment_type_id: '',
			billing_title_id: '',
			dea_expiration_date: '',
			dea_issue_date: '',
			dea_number: '',
			doctor_id: '',
			hospital_privileges: '',
			id: '',
			is_self: '',
			license_history: [
				{
					degree_listed_on_the_license: '',
					medical_license: '',
					medical_license_expiration_date: '',
					medical_license_issue_date: '',
					state_issuing_the_medical_license: '',
				},
			],
			medical_credentials: '0',
			nadean_number: '',
			npi: '',
			please_specify: '',
			registration_expiration_date: '',
			registration_number: '',
			spi: '',
			upin: '',
			wcb_authorization: '',
			wcb_date_of_issue: '',
			wcb_rating_code: '',
		});
	});
	it('Should getFormData Test', () => {
		comp.getFormData();
		expect(comp.form).toBeTruthy();
	});
	it('Should addliscenseHistory Test', () => {
		let Return = comp.addliscenseHistory();
		expect(Return.value).toEqual({
			degree_listed_on_the_license: '',
			medical_license: '',
			medical_license_expiration_date: '',
			medical_license_issue_date: '',
			state_issuing_the_medical_license: '',
		});
	});
	it('should formSubmit Test When Subscribe successfull If createSignature responce success', fakeAsync(() => {
		comp.form = setForm();
		comp.form.controls.license_history.setValue([
			{
				medical_license: 1,
				medical_license_expiration_date: '2022-05-20',
				state_issuing_the_medical_license: '2021-05-17',
				degree_listed_on_the_license: 'degree_listed_on_the_license',
				medical_license_issue_date: '2021-05-17',
			},
		]);
		comp.form.controls.dea_issue_date.setValue('2021-05-17');
		comp.form.controls.dea_expiration_date.setValue('2021-05-17');
		comp.form.controls.registration_expiration_date.setValue('2021-05-17');
		comp.form.controls.wcb_date_of_issue.setValue('2021-05-17');
		comp.form.controls.id.setValue('17');
		comp.form.controls.billing_title_id.setValue('20');
		comp.form.controls.dea_number.setValue('123456789');
		comp.form.controls.npi.setValue('1234567810');
		let Given_Responce = {
			status: true,
			message: 'Success',

			result: {
				data: {
					doctor_id: 10,
					icd10_codes: [],
					cpt_codes: [],
					license_detail: [],
				},
				current_page: 1,
				first_page_url: 'http://cm.ovadamd.net/api/users?page=1',
				from: 1,
				last_page: 27,
				last_page_url: 'http://cm.ovadamd.net/api/users?page=27',
				next_page_url: 'http://cm.ovadamd.net/api/users?page=2',
				path: 'http://cm.ovadamd.net/api/users',
				per_page: '10',
				prev_page_url: null,
				to: 10,
				total: 265,
			},
		};
		comp.signature = { signature_file: null };
		spyOn(comp['router'], 'navigateByUrl');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(Given_Responce).pipe(delay(1)));
		spyOn(signatureMockService, 'createSignature').and.returnValue(
			of(Given_Responce).pipe(delay(1)),
		);
		comp.formSubmit();
		tick(15000);
		discardPeriodicTasks();
		expect(comp['router'].navigateByUrl).toHaveBeenCalled();
		expect(comp.startLoader).toBe(false);
	}));
	it('should formSubmit Test When Subscribe successfull If createSignature responce success & status false', fakeAsync(() => {
		comp.form = setForm();
		comp.form.controls.license_history.setValue([
			{
				medical_license: 1,
				medical_license_expiration_date: '2021-05-20',
				state_issuing_the_medical_license: '2021-05-17',
				degree_listed_on_the_license: 'degree_listed_on_the_license',
				medical_license_issue_date: '2021-05-17',
			},
		]);
		comp.form.controls.dea_issue_date.setValue('2021-05-17');
		comp.form.controls.dea_expiration_date.setValue('2021-05-17');
		comp.form.controls.registration_expiration_date.setValue('2021-05-17');
		comp.form.controls.wcb_date_of_issue.setValue('2021-05-17');
		comp.form.controls.id.setValue('17');
		comp.form.controls.billing_title_id.setValue('20');
		comp.form.controls.dea_number.setValue('123456789');
		comp.form.controls.npi.setValue('1234567810');
		let Given_Responce = {
			status: false,
			message: 'Success',

			result: {
				data: {
					doctor_id: 10,
					icd10_codes: [],
					cpt_codes: [],
					license_detail: [],
				},
				current_page: 1,
				first_page_url: 'http://cm.ovadamd.net/api/users?page=1',
				from: 1,
				last_page: 27,
				last_page_url: 'http://cm.ovadamd.net/api/users?page=27',
				next_page_url: 'http://cm.ovadamd.net/api/users?page=2',
				path: 'http://cm.ovadamd.net/api/users',
				per_page: '10',
				prev_page_url: null,
				to: 10,
				total: 265,
			},
		};
		comp.signature = { signature_file: null };
		spyOn(comp['router'], 'navigateByUrl');
		spyOn(comp['toastrService'], 'error');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(Given_Responce).pipe(delay(1)));
		spyOn(signatureMockService, 'createSignature').and.returnValue(
			of(Given_Responce).pipe(delay(1)),
		);
		comp.formSubmit();
		tick(15000);
		discardPeriodicTasks();
		expect(comp['router'].navigateByUrl).toHaveBeenCalled();
		expect(comp['toastrService'].error).toHaveBeenCalled();
	}));
	it('should formSubmit Test When requestService Subscribe successfull But signatureService Fail', fakeAsync(() => {
		comp.form = setForm();
		comp.form.controls.license_history.setValue([
			{
				medical_license: 1,
				medical_license_expiration_date: '2021-05-20',
				state_issuing_the_medical_license: '2021-05-17',
				degree_listed_on_the_license: 'degree_listed_on_the_license',
				medical_license_issue_date: '2021-05-17',
			},
		]);
		comp.form.controls.dea_issue_date.setValue('2021-05-17');
		comp.form.controls.dea_expiration_date.setValue('2021-05-17');
		comp.form.controls.registration_expiration_date.setValue('2021-05-17');
		comp.form.controls.wcb_date_of_issue.setValue('2021-05-17');
		comp.form.controls.id.setValue('17');
		comp.form.controls.billing_title_id.setValue('20');
		comp.form.controls.dea_number.setValue('123456789');
		comp.form.controls.npi.setValue('1234567810');
		comp.form.controls.id.setValue('17');
		let Given_Responce = {
			status: false,
			message: 'Success',

			result: {
				data: {
					doctor_id: 10,
					icd10_codes: [],
					cpt_codes: [],
					license_detail: [],
				},
				current_page: 1,
				first_page_url: 'http://cm.ovadamd.net/api/users?page=1',
				from: 1,
				last_page: 27,
				last_page_url: 'http://cm.ovadamd.net/api/users?page=27',
				next_page_url: 'http://cm.ovadamd.net/api/users?page=2',
				path: 'http://cm.ovadamd.net/api/users',
				per_page: '10',
				prev_page_url: null,
				to: 10,
				total: 265,
			},
		};
		comp.signature = { signature_file: null };
		spyOn(comp['router'], 'navigateByUrl');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(Given_Responce).pipe(delay(1)));
		spyOn(signatureMockService, 'createSignature').and.returnValue(
			throwError({ message: 'error' }),
		);
		comp.formSubmit();
		tick(15000);
		discardPeriodicTasks();
		expect(comp['router'].navigateByUrl).toHaveBeenCalled();
		expect(comp.startLoader).toBe(false);
		expect(comp.startLoader).toBe(false);
		expect(comp.disableBtn).toBe(false);
	}));
	it('should formSubmit Test When requestService Subscribe successfull Fail', fakeAsync(() => {
		comp.form = setForm();
		comp.form.controls.license_history.setValue([
			{
				medical_license: 1,
				medical_license_expiration_date: '2021-05-20',
				state_issuing_the_medical_license: '2021-05-17',
				degree_listed_on_the_license: 'degree_listed_on_the_license',
				medical_license_issue_date: '2021-05-17',
			},
		]);
		comp.form.controls.dea_issue_date.setValue('2021-05-17');
		comp.form.controls.dea_expiration_date.setValue('2021-05-17');
		comp.form.controls.registration_expiration_date.setValue('2021-05-17');
		comp.form.controls.wcb_date_of_issue.setValue('2021-05-17');
		comp.form.controls.id.setValue('17');
		let Given_Responce = {
			status: false,
			message: 'Success',

			result: {
				data: {
					doctor_id: 10,
					icd10_codes: [],
					cpt_codes: [],
					license_detail: [],
				},
				current_page: 1,
				first_page_url: 'http://cm.ovadamd.net/api/users?page=1',
				from: 1,
				last_page: 27,
				last_page_url: 'http://cm.ovadamd.net/api/users?page=27',
				next_page_url: 'http://cm.ovadamd.net/api/users?page=2',
				path: 'http://cm.ovadamd.net/api/users',
				per_page: '10',
				prev_page_url: null,
				to: 10,
				total: 265,
			},
		};
		comp.signature = { signature_file: null };
		spyOn(request_MockService, 'sendRequest').and.returnValue(throwError({ message: 'error' }));
		comp.formSubmit();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.startLoader).toBe(false);
		expect(comp.disableBtn).toBe(false);
	}));
	it('Should addLicscense Test', () => {
		comp.form = setForm();
		// spyOn(comp,'addliscenseHistory');
		comp.addLicscense();
		expect(comp.form).toBeTruthy();
	});
	it('Should getData Test If license_history not empty', () => {
		comp.form = setForm();
		comp.form.controls.license_history.setValue([
			{
				medical_license: 1,
				medical_license_expiration_date: '2021-05-20',
				state_issuing_the_medical_license: '2021-05-17',
				degree_listed_on_the_license: 'degree_listed_on_the_license',
				medical_license_issue_date: '2021-05-17',
			},
		]);
		spyOn(comp.form, 'setErrors');
		comp.getData(0);
		expect(comp.form.setErrors).toHaveBeenCalled();
	});
	it('Should getData Test If license_history empty', () => {
		comp.form = setForm();
		comp.form.controls.license_history.setValue([
			{
				medical_license: '',
				medical_license_expiration_date: null,
				state_issuing_the_medical_license: null,
				degree_listed_on_the_license: '',
				medical_license_issue_date: null,
			},
		]);
		spyOn(comp.form, 'setErrors');
		comp.getData(0);
		expect(comp.form.setErrors).toHaveBeenCalled();
	});
	it('Should getData Test If license_history empty and some have value', () => {
		comp.form = setForm();
		comp.form.controls.license_history.setValue([
			{
				medical_license: '',
				medical_license_expiration_date: null,
				state_issuing_the_medical_license: '2021-05-17',
				degree_listed_on_the_license: '',
				medical_license_issue_date: null,
			},
		]);
		spyOn(comp.form, 'setErrors');
		comp.getData(0);
		expect(comp.form.setErrors).toHaveBeenCalled();
	});
	it('Should getData Test If license_history empty or null', () => {
		comp.form = setForm();
		comp.form.controls.license_history.setValue([
			{
				medical_license: '',
				medical_license_expiration_date: null,
				state_issuing_the_medical_license: '',
				degree_listed_on_the_license: '',
				medical_license_issue_date: null,
			},
		]);
		spyOn(comp.form, 'setErrors');
		comp.getData(0);
		expect(comp.form.setErrors).toHaveBeenCalled();
	});
	it('Should removeliscense Test', () => {
		comp.form = setForm();
		comp.removeliscense(0);
		expect(comp.form).toBeTruthy();
	});
	it('Should onCptCodeSelected Test', () => {
		comp.onCptCodeSelected('cpt');
		expect(comp.modeCptCode).toMatch('cpt');
	});
	it('should add Test When Subscribe successfull If statuscode 200', fakeAsync(() => {
		comp.form = setForm();
		let Given_Responce = {
			statusCode: 200,
			message: 'Success',

			result: {
				data: {
					doctor_id: 10,
					icd10_codes: [],
					cpt_codes: [],
					license_detail: [],
				},
				current_page: 1,
				first_page_url: 'http://cm.ovadamd.net/api/users?page=1',
				from: 1,
				last_page: 27,
				last_page_url: 'http://cm.ovadamd.net/api/users?page=27',
				next_page_url: 'http://cm.ovadamd.net/api/users?page=2',
				path: 'http://cm.ovadamd.net/api/users',
				per_page: '10',
				prev_page_url: null,
				to: 10,
				total: 265,
			},
		};
		spyOn(comp.form, 'disable');
		spyOn(comp.getCase, 'emit');
		spyOn(fd_MockService, 'addInsuranceCompany').and.returnValue(of(Given_Responce).pipe(delay(1)));
		comp.add({});
		tick(15000);
		discardPeriodicTasks();
		expect(comp.disableBtn).toBe(false);
		expect(comp.disableBtn).toBe(false);
		expect(comp.form.disable).toHaveBeenCalled();
		expect(comp.getCase.emit).toHaveBeenCalled();
	}));
	it('should add Test When Subscribe successfull If statuscode not 200', fakeAsync(() => {
		comp.form = setForm();
		let Given_Responce = {
			statusCode: 201,
			error: {
				message: 'Success',
			},
		};
		spyOn(comp['toastrService'], 'error');
		spyOn(fd_MockService, 'addInsuranceCompany').and.returnValue(of(Given_Responce).pipe(delay(1)));
		comp.add({});
		tick(15000);
		discardPeriodicTasks();
		expect(comp['toastrService'].error).toHaveBeenCalled();
	}));
	it('should add Test When requestService Subscribe successfull Fail', fakeAsync(() => {
		comp.form = setForm();
		spyOn(comp['toastrService'], 'error');
		spyOn(fd_MockService, 'addInsuranceCompany').and.returnValue(
			throwError({ error: { error: { message: 'error' } } }),
		);
		comp.add({});
		tick(15000);
		discardPeriodicTasks();
		expect(comp.disableBtn).toBe(false);
		expect(comp['toastrService'].error).toHaveBeenCalled();
	}));
	it('should update Test When Subscribe successfull If statuscode 200', fakeAsync(() => {
		comp.form = setForm();
		let Given_Responce = {
			statusCode: 200,
			message: 'Success',

			result: {
				data: {
					doctor_id: 10,
					icd10_codes: [],
					cpt_codes: [],
					license_detail: [],
				},
				current_page: 1,
				first_page_url: 'http://cm.ovadamd.net/api/users?page=1',
				from: 1,
				last_page: 27,
				last_page_url: 'http://cm.ovadamd.net/api/users?page=27',
				next_page_url: 'http://cm.ovadamd.net/api/users?page=2',
				path: 'http://cm.ovadamd.net/api/users',
				per_page: '10',
				prev_page_url: null,
				to: 10,
				total: 265,
			},
		};
		spyOn(comp.form, 'disable');
		spyOn(comp.getCase, 'emit');
		spyOn(fd_MockService, 'updateInsuranceCompany').and.returnValue(
			of(Given_Responce).pipe(delay(1)),
		);
		comp.update({});
		tick(15000);
		discardPeriodicTasks();
		expect(comp.disableBtn).toBe(false);
		expect(comp.disableBtn).toBe(false);
		expect(comp.form.disable).toHaveBeenCalled();
		expect(comp.getCase.emit).toHaveBeenCalled();
	}));
	it('should update Test When Subscribe successfull If statuscode not 200', fakeAsync(() => {
		comp.form = setForm();
		let Given_Responce = {
			statusCode: 201,
			error: {
				message: 'Success',
			},
		};
		spyOn(comp['toastrService'], 'error');
		spyOn(fd_MockService, 'updateInsuranceCompany').and.returnValue(
			of(Given_Responce).pipe(delay(1)),
		);
		comp.update({});
		tick(15000);
		discardPeriodicTasks();
		expect(comp['toastrService'].error).toHaveBeenCalled();
	}));
	it('should update Test When requestService Subscribe successfull Fail', fakeAsync(() => {
		comp.form = setForm();
		spyOn(comp['toastrService'], 'error');
		spyOn(fd_MockService, 'updateInsuranceCompany').and.returnValue(
			throwError({ error: { error: { message: 'error' } } }),
		);
		comp.update({});
		tick(15000);
		discardPeriodicTasks();
		expect(comp.disableBtn).toBe(false);
		expect(comp['toastrService'].error).toHaveBeenCalled();
	}));
	it('Should handleAddressChange test if type policyHolder', () => {
		comp.form = setForm();
		spyOn(comp.form, 'patchValue');
		let address: any = address_Data();
		comp.handleAddressChange(address, 'policyHolder');
		expect(comp.form.patchValue).toHaveBeenCalled();
	});
	it('Should handleAddressChange test if type other policyHolder', () => {
		comp.form = setForm();
		spyOn(comp.form, 'patchValue');
		let address: any = address_Data();
		comp.handleAddressChange(address, 'practice');
		expect(comp.form.patchValue).toHaveBeenCalled();
	});
	it('Should goBack Test', () => {
		spyOn(comp['router'], 'navigate');
		comp.goBack();
		expect(comp['router'].navigate).toHaveBeenCalled();
	});
	it('Should selectedCPT Test', () => {
		comp.selectedCPT('ICD');
		expect(comp.modelICDCode.length).toBe(0);
	});
	it('Should selectedICD Test', () => {
		comp.selectedICD({ item: 'item' });
		expect(comp.modeCptCode.length).toBe(0);
	});
	it('Should onScroll Test ICD', () => {
		spyOn(comp, 'searchICD');
		comp.onScroll('scrollDown', 'icd');
		expect(comp.icdPage.pageNumber).toBe(1);
		expect(comp.searchICD).toHaveBeenCalled();
	});
	it('Should onScroll Test CPT', () => {
		spyOn(comp, 'searchCPT');
		comp.onScroll('scrollDown', 'cpt');
		expect(comp.cptPage.pageNumber).toBe(1);
		expect(comp.searchCPT).toHaveBeenCalled();
	});
	it('Should searchICD Test CPT', fakeAsync(() => {
		spyOn(comp, 'setIcdPageDefault');
		spyOn(fd_MockService, 'searchICDIct').and.returnValue(
			of({ result: { data: [{ id: 10 }] } }).pipe(delay(1)),
		);
		comp.searchICD([{ id: 1 }, { id: 2 }, { id: 3 }], 'search');
		tick(15000);
		discardPeriodicTasks();
		expect(comp.showSpinnerIntellicense.icd_10).toBe(false);
		expect(comp.setIcdPageDefault).toHaveBeenCalled();
	}));
	it('Should searchCPT Test CPT', fakeAsync(() => {
		spyOn(comp, 'setCptPageDefault');
		spyOn(fd_MockService, 'searchICDIct').and.returnValue(
			of({ result: { data: [{ id: 10 }] } }).pipe(delay(1)),
		);
		comp.searchCPT([{ id: 1 }, { id: 2 }, { id: 3 }], 'search');
		tick(15000);
		discardPeriodicTasks();
		expect(comp.showSpinnerIntellicense.icd_10).toBe(false);
		expect(comp.setCptPageDefault).toHaveBeenCalled();
	}));
	it('Should selectInput Test If event Value-1', () => {
		comp.selectInput({ target: { value: 'Value-1' } });
		expect(comp.isNameSelected).toBe(true);
	});
	it('Should selectInput Test If event not Value-1', () => {
		comp.selectInput({ target: { value: 'Value' } });
		expect(comp.isNameSelected).toBe(false);
	});
	it('Should wcbAuthorizationValidation Test If wcb_authorization', () => {
		comp.form = setForm();
		comp.form.controls.wcb_authorization.setValue('123456');
		let Result = comp.wcbAuthorizationValidation(null);
		expect(Result).toEqual({ wcb_date_required: true });
	});
	it('Should wcbAuthorizationValidation Test If not wcb_authorization', () => {
		comp.form = setForm();
		comp.form.controls.wcb_date_of_issue.setValue('2017-05-12');
		let Result = comp.wcbAuthorizationValidation(null);
		expect(Result).toEqual({ wcb_code_required: true });
	});
	it('Should compareDatesValidation Test If medical_license_expiration_date & medical_license_issue_date not exists', () => {
		let licenseForm = comp['fb'].group({
			medical_license: '',
			medical_license_expiration_date: [''],
			state_issuing_the_medical_license: [''],
			degree_listed_on_the_license: [''],
			medical_license_issue_date: [''],
		});
		let Result = comp.compareDatesValidation(licenseForm);
		expect(Result).toBe(null);
	});
	it('Should compareDatesValidation Test If medical_license_expiration_date & medical_license_issue_date exists & start date less', () => {
		let licenseForm = comp['fb'].group({
			medical_license: '',
			medical_license_expiration_date: [''],
			state_issuing_the_medical_license: [''],
			degree_listed_on_the_license: [''],
			medical_license_issue_date: [''],
		});
		// licenseForm.controls.medical_license.setValue(1);
		licenseForm.controls.medical_license_expiration_date.setValue('2021-05-15');
		licenseForm.controls.state_issuing_the_medical_license.setValue('2021-05-15');
		licenseForm.controls.degree_listed_on_the_license.setValue('degree_listed_on_the_license');
		licenseForm.controls.medical_license_issue_date.setValue('2021-05-17');
		let Result = comp.compareDatesValidation(licenseForm);
		expect(Result).toEqual({ invalidDate: true });
	});
	it('Should compareDatesValidation Test If medical_license_expiration_date & medical_license_issue_date exists & start date greater', () => {
		let licenseForm = comp['fb'].group({
			medical_license: '',
			medical_license_expiration_date: [''],
			state_issuing_the_medical_license: [''],
			degree_listed_on_the_license: [''],
			medical_license_issue_date: [''],
		});
		// licenseForm.controls.medical_license.setValue(1);
		licenseForm.controls.medical_license_expiration_date.setValue('2021-05-18');
		licenseForm.controls.state_issuing_the_medical_license.setValue('2021-05-15');
		licenseForm.controls.degree_listed_on_the_license.setValue('degree_listed_on_the_license');
		licenseForm.controls.medical_license_issue_date.setValue('2021-05-17');
		let Result = comp.compareDatesValidation(licenseForm);
		expect(Result).toBe(null);
	});
	it('Should deleteDoctor Test', () => {
		comp.form = setForm();
		comp.form.controls.doctor_id.setValue('10');
		comp.deleteDoctor();
		expect(comp.form.controls.doctor_id.value).toBe(null);
	});
	it('Should matSearchListener Test', () => {
		spyOn(comp.subject, 'next');
		spyOn(comp, 'searchProvider');
		comp.matSearchListener();
		expect(comp.subject.next).toHaveBeenCalled();
		expect(comp.searchProvider).toHaveBeenCalled();
	});
	it('should searchProvider Test When Subscribe successfull', fakeAsync(() => {
		let Given_Responce = {
			status: true,
			message: 'Success',

			result: {
				data: [
					{
						first_name: 'Mock first name',
						middle_name: 'Mock middle_name name',
						last_name: 'Mock last_name',
						doctor_id: 10,
						icd10_codes: [],
						cpt_codes: [],
						license_detail: [],
					},
				],
				current_page: 1,
				first_page_url: 'http://cm.ovadamd.net/api/users?page=1',
				from: 1,
				last_page: 27,
				last_page_url: 'http://cm.ovadamd.net/api/users?page=27',
				next_page_url: 'http://cm.ovadamd.net/api/users?page=2',
				path: 'http://cm.ovadamd.net/api/users',
				per_page: '10',
				prev_page_url: null,
				to: 10,
				total: 265,
			},
		};
		spyOn(comp['subject'], 'next');
		spyOn(comp, 'setValuesNgSelectShareableProvider');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(Given_Responce).pipe(delay(1)));
		comp.searchProvider();
		tick(15000);
		discardPeriodicTasks();
		expect(comp['subject'].next).toHaveBeenCalled();
		expect(comp.setValuesNgSelectShareableProvider).toHaveBeenCalled();
	}));
	it('Should setValuesNgSelectShareableProvider Test', () => {
		comp.form = setForm();
		comp.BillingTitle.searchForm = comp['fb'].group({
			common_ids: [''],
		});
		comp.lstProviders = [{ id: 10, title: 'billingTitle' }];
		comp.form.controls.doctor_id.setValue(20);
		comp.setValuesNgSelectShareableProvider();
		expect(comp.lstProviders.length).toBe(1);
	});
	it('Should setValuesNgSelectShareableProvider Test If provider not exists', () => {
		comp.provider = {
			lists: [],
		};
		comp.form = setForm();
		comp.BillingTitle.searchForm = comp['fb'].group({
			common_ids: [''],
		});
		comp.form.controls.doctor_id.setValue(20);
		comp.setValuesNgSelectShareableProvider();
		expect(comp.provider['lists'].length).toBe(0);
	});
	it('should getSignature Test When Subscribe successfull', fakeAsync(() => {
		let Given_Responce = {
			status: true,
			message: 'Success',

			result: {
				data: [
					{
						first_name: 'Mock first name',
						middle_name: 'Mock middle_name name',
						last_name: 'Mock last_name',
						doctor_id: 10,
						icd10_codes: [],
						id: 210,
						cpt_codes: [],
						license_detail: [],
					},
				],
				current_page: 1,
				first_page_url: 'http://cm.ovadamd.net/api/users?page=1',
				from: 1,
				last_page: 27,
				last_page_url: 'http://cm.ovadamd.net/api/users?page=27',
				next_page_url: 'http://cm.ovadamd.net/api/users?page=2',
				path: 'http://cm.ovadamd.net/api/users',
				per_page: '10',
				prev_page_url: null,
				to: 10,
				total: 265,
			},
		};
		spyOn(signatureMockService, 'getSignature').and.returnValue(of(Given_Responce).pipe(delay(1)));
		comp.getSignature();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.listSignature).toEqual(Given_Responce.result.data);
		expect(comp.selectedId).toEqual(Given_Responce.result.data[0].id);
	}));
	it('Should onSignatureDelete test', () => {
		comp.onSignatureDelete(null);
		expect(comp.listSignature.length).toBe(0);
	});
	it('Should stateChange Test', () => {
		comp.stateChange({ selectedIndex: 1 }, null);
		expect(comp.selectedState).toBe('Alabama');
	});
	it('Should selectionOnValueChange Test If Type BillTitle', () => {
		comp.form = setForm();
		comp.selectionOnValueChange({ data: null }, 'BillTitle');
		expect(comp.form.controls.billing_title_id.value).toBe(null);
	});
	it('Should selectionOnValueChange Test If Type BillEmploymentTypeId', () => {
		comp.form = setForm();
		comp.selectionOnValueChange({ data: null }, 'BillEmploymentTypeId');
		expect(comp.form.controls.billing_employment_type_id.value).toBe(null);
	});
	it('Should selectionOnValueChange Test If Type provider', () => {
		comp.form = setForm();
		comp.selectionOnValueChange({ data: null }, 'provider');
		expect(comp.form.controls.doctor_id.value).toBe(null);
	});
	it('Should controledTouched Test If Type provider', () => {
		comp.form = setForm();
		spyOn(comp.form.controls.billing_title_id, 'markAsTouched');
		comp.controledTouched({ data: null }, 'BillTitle');
		expect(comp.form.controls.billing_title_id.markAsTouched).toHaveBeenCalled();
	});
	afterAll(() => {
		TestBed.resetTestingModule();
	});
});
