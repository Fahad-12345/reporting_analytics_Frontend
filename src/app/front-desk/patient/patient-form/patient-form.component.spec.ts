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
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { MainService } from '@appDir/shared/services/main-service';
import { FDMockService } from '@appDir/shared/mock-services/FDMockService.service';
import { DynamicFormModule } from '@appDir/shared/dynamic-form/dynamic-form.module';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { DynamicFormComponent } from '@appDir/shared/dynamic-form/components/dynamic-form/dynamic-form.component';
import { PatientFormComponent } from './patient-form.component';
import { patientFormMockValues } from './patient-form-mock-values';
import { HttpClientTestingModule } from '@angular/common/http/testing';
describe('PatientFormComponent', () => {
	let comp: PatientFormComponent;
	let compDynamicForm: DynamicFormComponent;
	let fixture: ComponentFixture<PatientFormComponent>;
	let fixtureDynamicForm: ComponentFixture<DynamicFormComponent>;
	let request_MockService = new RequestMockService();
	let fd_MockService = new FDMockService();
	let patientFormSetMockValues = new patientFormMockValues();
	function address_Data() {
		return {
			street_number: {
				long_name: 'longName',
			},
			route: {
				long_name: 'longName',
			},
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
		};
	}
	function personalFormInit() {
		comp.personalForm = comp['fb'].group({
			id: [''],
			first_name: [''],
			middle_name: [''],
			last_name: [''],
			gender: [''],
			dob: [''],
			ssn: [''],
		});
	}
	function mailAddressFormInit() {
		comp.mail_address = comp['fb'].group({
			id: [''],
			street: [''],
			apartment: [''],
			city: [''],
			zip: [''],
			state: [''],
		});
	}
	function contactInformationFormInit() {
		comp.contact_information = comp['fb'].group({
			id: [''],
			home_phone: [''],
			work_phone: [''],
			cell_phone: [''],
			email: [''],
			mail_address: comp.mail_address.value,
		});
	}
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [PatientFormComponent],
			imports: [
				DynamicFormModule,
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
				{ provide: FDServices, useValue: fd_MockService },
				{
					provide: ActivatedRoute,
					useValue: {
						parent: {
							parent: { parent: 123 },
						},
						snapshot: {
							data: { title: 'Mock Title' },
							pathFromRoot: [{ params: { id: 123 } }], //used
							params: { id: 123 },
						},
					},
				},
			],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(PatientFormComponent);
		comp = fixture.componentInstance;
		fixtureDynamicForm = TestBed.createComponent(DynamicFormComponent);
		compDynamicForm = fixtureDynamicForm.componentInstance;
	});
	afterEach(() => {
		TestBed.resetTestingModule();
	});
	it('should be created', () => {
		expect(comp).toBeTruthy();
	});
	it('Should ngOnInit Test', () => {
		spyOn(comp, 'setConfigration');
		spyOn(comp, 'getRelations');
		spyOn(comp, 'getPatient');
		comp.ngOnInit();
		expect(comp.title).toMatch('Edit');
		expect(comp.setConfigration).toHaveBeenCalled();
		expect(comp.getRelations).toHaveBeenCalled();
		expect(comp.getPatient).toHaveBeenCalled();
	});
	it('should getPatient Test When requestService Subscribe successfull ', fakeAsync(() => {
		let ResutGetPatient = patientFormSetMockValues.getPatientResponce;
		spyOn(comp, 'setPatientValues');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(ResutGetPatient).pipe(delay(1)));
		comp.getPatient(1);
		tick(15000);
		discardPeriodicTasks();
		expect(comp.setPatientValues).toHaveBeenCalled();
	}));
	it('Should ngAfterViewInit Test', () => {
		comp.setConfigration();
		let form = comp['fb'].group({
			personal: [''],
			contact_information: comp['fb'].group({
				mail_address: [''],
			}),
			mail_address: [''],
		});
		compDynamicForm.form;
		comp.form['form'] = form;
		comp.ngAfterViewInit();
		expect(comp.personalForm.value).toMatch('');
		expect(comp.contact_information.value).toEqual({ mail_address: '' });
		expect(comp.mail_address.value).toMatch('');
	});
	it('should getRelations Test When fd_services Subscribe successfull ', fakeAsync(() => {
		comp.setConfigration();
		let ResutGetRelation = {
			statusCode: 200,
			data: [
				{
					type: 'Mock Type',
					id: 10,
				},
			],
		};
		spyOn(fd_MockService, 'getRelations').and.returnValue(of(ResutGetRelation).pipe(delay(1)));
		comp.getRelations();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.fieldConfig[1].children[5].options[0]).toEqual({
			label: 'Mock Type',
			name: 'Mock Type',
			value: 10,
		});
	}));
	it('Should setPatientValues Test', () => {
		let patientData: any = patientFormSetMockValues.setPatientData;
		comp.patient = patientData;
		personalFormInit();
		mailAddressFormInit();
		contactInformationFormInit();
		comp.setPatientValues();
		expect(comp.personalForm.value).toEqual({
			dob: '2021-05-22',
			first_name: 'first_name',
			gender: 'male',
			id: null,
			last_name: 'last_name',
			middle_name: 'middle_name',
			ssn: '1122-2211',
		});
		expect(comp.mail_address.value).toEqual({
			apartment: 'apartment',
			city: 'city',
			id: 20,
			state: 'state',
			street: 'street',
			zip: '123456',
		});
	});
	it('Should handleAddressChange Test', () => {
		comp.mail_address = comp['fb'].group({
			street: [''],
			city: [''],
			state: [''],
			zip: [''],
		});
		let address: any = address_Data();
		comp.handleAddressChange(address);
		expect(comp.mail_address.controls.city.value).toBeUndefined();
		expect(comp.mail_address.controls.state.value).toBeUndefined();
	});
	it('Should openDuplicateModal Test', () => {
		spyOn(comp['modalService'], 'open');
		comp.openDuplicateModal('modal');
		expect(comp.currentPatientDuplicate).toMatch('modal');
	});
	it('should addPatient Test When requestService Subscribe successfull ', fakeAsync(() => {
		comp.id = 10;
		let ResutGetPatient = patientFormSetMockValues.addPatientResponce;
		spyOn(comp['router'], 'navigate');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(ResutGetPatient).pipe(delay(1)));
		comp.addPatient(null);
		tick(15000);
		discardPeriodicTasks();
		expect(comp['router'].navigate).toHaveBeenCalled();
	}));
	it('should addPatient Test When requestService Subscribe Unsuccessfull ', fakeAsync(() => {
		comp.setConfigration();
		spyOn(request_MockService, 'sendRequest').and.returnValue(throwError('error'));
		comp.addPatient(null);
		tick(15000);
		discardPeriodicTasks();
		expect(comp).toBeTruthy();
	}));
	it('Should goBack Test', () => {
		spyOn(comp['router'], 'navigate');
		comp.goBack();
		expect(comp['router'].navigate).toHaveBeenCalled();
	});
	it('Should newPatient Test', () => {
		spyOn(comp, 'addPatient');
		spyOn(comp['modalService'], 'dismissAll');
		comp.newPatient();
		expect(comp.addPatient).toHaveBeenCalled();
		expect(comp['modalService'].dismissAll).toHaveBeenCalled();
	});
	it('Should submit Test If this.Id exists', fakeAsync(() => {
		comp.id = 200;
		comp.setConfigration();
		let reponce = {
			status: 200,
			result: {
				data: {
					patient_personal: {
						id: 213,
					},
				},
			},
		};
		spyOn(comp['router'], 'navigate');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(reponce).pipe(delay(1)));
		comp.submit({ personal: {weight_lbs:200,height_ft:5}, contact_information: 'contact_information' });
		tick(15000);
		discardPeriodicTasks();
		expect(comp['router'].navigate);
		expect(request_MockService.sendRequest).toHaveBeenCalled();
	}));
	it('Should submit Test If this.Id exists and request Unsuccessfull', fakeAsync(() => {
		comp.id = 200;
		comp.setConfigration();
		spyOn(request_MockService, 'sendRequest').and.returnValue(throwError('error'));
		comp.submit({ personal: {weight_lbs:200,height_ft:5}, contact_information: 'contact_information' });
		tick(15000);
		discardPeriodicTasks();
		expect(comp).toBeTruthy();
	}));
	it('Should submit Test If this.Id not exists and request successfull', fakeAsync(() => {
		comp.setConfigration();
		let reponce = patientFormSetMockValues.submitResponce;
		spyOn(comp, 'openDuplicateModal');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(reponce).pipe(delay(1)));
		comp.submit({ personal: {weight_lbs:200,height_ft:5}, contact_information: 'contact_information' });
		tick(15000);
		discardPeriodicTasks();
		expect(comp.openDuplicateModal).toHaveBeenCalled();
		expect(comp.exisitPatientId).toBe(10);
	}));
	it('Should submit Test If this.Id not exists & there is no  res.result.data and request successfull Run', fakeAsync(() => {
		comp.setConfigration();
		let reponce = patientFormSetMockValues.submitEmptyResponce
		spyOn(comp, 'addPatient');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(reponce).pipe(delay(1)));
		comp.submit({ personal: {weight_lbs:200,height_ft:5}, contact_information: 'contact_information' });
		tick(15000);
		discardPeriodicTasks();
		expect(comp.addPatient).toHaveBeenCalled();
	}));
	it('should existingPatient Test ', fakeAsync(() => {
		comp.setConfigration();
		spyOn(comp['router'], 'navigate');
		spyOn(comp['modalService'], 'dismissAll');
		comp.existingPatient();
		expect(comp['router'].navigate).toHaveBeenCalled();
		expect(comp['modalService'].dismissAll).toHaveBeenCalled();
	}));
	afterAll(() => {
		TestBed.resetTestingModule();
	});
});
