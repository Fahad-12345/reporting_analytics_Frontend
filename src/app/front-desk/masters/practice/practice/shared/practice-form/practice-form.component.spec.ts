import { RequestService } from './../../../../../../shared/services/request.service';
import { RequestMockService } from '@appDir/shared/mock-services/RequestMock.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
	TestBed,
	async,
	ComponentFixture,
	tick,
	discardPeriodicTasks,
	fakeAsync,
	flush,
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Config } from '@appDir/config/config';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { SignatureMockService } from '@appDir/shared/mock-services/SignatureMock.service';
import { SharedModule } from '@appDir/shared/shared.module';
import { SignatureServiceService } from '@appDir/shared/signature/services/signature-service.service';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { PracticeFormComponent } from './practice-form.component';
import { Validators } from '@angular/forms';
import { CanDeactiveMockService } from '@appDir/shared/mock-services/CanDeactiveModalMock.service';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('PracticeFormComponent', () => {
	let comp: PracticeFormComponent;
	let fixture: ComponentFixture<PracticeFormComponent>;
	let signatureMockService = new SignatureMockService();
	let request_MockService = new RequestMockService();
	let canDeactiveModel_MockService = new CanDeactiveMockService();
	// let router: Router;
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [PracticeFormComponent],
			schemas: [NO_ERRORS_SCHEMA],
			imports: [
				SharedModule,
				ToastrModule.forRoot(),
				RouterTestingModule,
				GooglePlaceModule,
				HttpClientTestingModule,
				BrowserAnimationsModule
			],
			providers: [
				Config,
				LocalStorage,
				{ provide: SignatureServiceService, useValue: signatureMockService },
				{ provide: RequestService, useValue: request_MockService },
				{ provide: CanDeactivateModelComponentService, useValue: canDeactiveModel_MockService },
			],
		}).compileComponents();
		// router = TestBed.get(Router);
		// router.initialNavigation();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(PracticeFormComponent);
		comp = fixture.componentInstance;
	});
	afterEach(() => {
		TestBed.resetTestingModule();
	});
	it('should getSignature Test When result data empty', fakeAsync(() => {
		let Result = { status: true, message: 'uploaded successfully.', result: { data: [] } };
		spyOn(signatureMockService, 'getSignature').and.returnValue(of(Result).pipe(delay(1)));
		comp.getSignature();
		expect(signatureMockService.getSignature).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.listSignature).toEqual(Result.result.data);
	}));
	it('Should openLocationModal Test', () => {
		comp.openLocationModal();
		expect(comp.locationOption.openModal).toBe(true);
		expect(comp.disableAddLocationBtn).toBe(true);
	});
	it('Should getRegions When Subscribe successfull', fakeAsync(() => {
		const formValue: any = {
			result: {
				first_page_url: 'http://cm.ovadamd.org/api/facility_locations?page=1',
				from: 1,
				last_page: 1,
				last_page_url: 'http://cm.ovadamd.org/api/facility_locations?page=1',
				next_page_url: null,
				path: 'http://cm.ovadamd.org/api/facility_locations',
				per_page: '10',
				prev_page_url: null,
				to: 3,
				data: [
					{
						address: '2/4A',
						cell_no: null,
						city: 'Lahore',
						created_at: '2021-07-08 11:32:44',
						created_by: 1,
						day_list: '[1,2,3,4,5]',
						deleted_at: null,
						email: null,
						ext_no: null,
						facility_full_name: 'Citimed - Test Location',
						facility_id: 1,
						fax: null,
						floor: null,
						id: 2,
						is_main: 0,
						lat: 31.4675432,
						long: 74.4487363,
						name: 'Test Location',
						office_hours_end: null,
						office_hours_start: null,
						phone: '5555555555',
						place_of_service_id: 1,
						region_id: '1',
						same_as_provider: 0,
						state: 'AL',
						timing: [
							{
								created_at: '2021-07-09 05:48:49',
								created_by: 1,
								day_id: 1,
								deleted_at: null,
								end_time: '18:00',
								end_time_isb: '18:00:00',
								facility_location_id: 2,
								id: 1,
								start_time: '08:00',
								start_time_isb: '08:00:00',
								time_zone: -300,
								time_zone_string: 'Asia/Qyzylorda',
								updated_at: '2021-07-09 05:48:49',
								updated_by: 1,
							},
						],
					},
				],
			},
			status: true,
		};
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.getRegions();
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.dropDownRegion).toEqual(formValue.result.data);
	}));
	it('Should addLocation When Subscribe successfull', fakeAsync(() => {
		const formValue: any = {
			result: {
				first_page_url: 'http://cm.ovadamd.org/api/facility_locations?page=1',
				from: 1,
				last_page: 1,
				last_page_url: 'http://cm.ovadamd.org/api/facility_locations?page=1',
				next_page_url: null,
				path: 'http://cm.ovadamd.org/api/facility_locations',
				per_page: '10',
				prev_page_url: null,
				to: 3,
				data: [
					{
						address: '2/4A',
						cell_no: null,
						city: 'Lahore',
						created_at: '2021-07-08 11:32:44',
						created_by: 1,
						day_list: '[1,2,3,4,5]',
						deleted_at: null,
						email: null,
						ext_no: null,
						facility_full_name: 'Citimed - Test Location',
						facility_id: 1,
						fax: null,
						floor: null,
						id: 2,
						is_main: 0,
						lat: 31.4675432,
						long: 74.4487363,
						name: 'Test Location',
						office_hours_end: null,
						office_hours_start: null,
						phone: '5555555555',
						place_of_service_id: 1,
						region_id: '1',
						same_as_provider: 0,
						state: 'AL',
						timing: [
							{
								created_at: '2021-07-09 05:48:49',
								created_by: 1,
								day_id: 1,
								deleted_at: null,
								end_time: '18:00',
								end_time_isb: '18:00:00',
								facility_location_id: 2,
								id: 1,
								start_time: '08:00',
								start_time_isb: '08:00:00',
								time_zone: -300,
								time_zone_string: 'Asia/Qyzylorda',
								updated_at: '2021-07-09 05:48:49',
								updated_by: 1,
							},
						],
					},
				],
			},
			status: true,
		};
		spyOn(comp['toastrService'], 'success');
		spyOn(comp, 'getPracticeLocation');
		spyOn(comp['router'], 'navigate');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.addLocation({ facility_id: 2 });
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp['toastrService'].success).toHaveBeenCalled();
		expect(comp.getPracticeLocation).toHaveBeenCalled();
		expect(comp['router'].navigate).toHaveBeenCalledWith([
			'/front-desk/masters/practice/practice/list',
		]);
	}));
	it('Should updateListing Test', () => {
		spyOn(comp, 'onSubmit');
		comp.updateListing();
		expect(comp.onSubmit).toHaveBeenCalled();
	});
	it('Should onAddLocation Test When practiceId exists', () => {
		spyOn(comp, 'addLocation');
		comp.practiceId = 1;
		comp.onAddLocation({});
		expect(comp.addLocation).toHaveBeenCalled();
	});
	it('Should onAddLocation Test When practiceId not exists', () => {
		spyOn(comp, 'updateListing');
		comp.onAddLocation({});
		expect(comp.updateListing).toHaveBeenCalled();
	});
	it('Should onEditLocation When Subscribe successfull', fakeAsync(() => {
		const formValue: any = {
			status: true,
		};
		spyOn(comp['toastrService'], 'success');
		spyOn(comp, 'getPracticeLocation');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.onEditLocation({ facility_id: 2 });
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp['toastrService'].success).toHaveBeenCalled();
		expect(comp.getPracticeLocation).toHaveBeenCalled();
	}));
	it('Should getLocationForm Test', () => {
		comp.practiceForm = comp['fb'].group({
			name: ['', [Validators.required]],
			locations: comp['createLocationsArray'](),
		});
		let ReturnValue = comp.getLocationForm(0);
		expect(ReturnValue).toBeTruthy();
	});
	it('Should getBillingForm Test', () => {
		comp.practiceForm = comp['fb'].group({
			name: ['', [Validators.required]],
			locations: comp['createLocationsArray'](),
		});
		let ReturnValue = comp.getBillingForm(0, 0);
		expect(ReturnValue).toBeTruthy();
	});
	it('Should toggleShow Test', () => {
		comp.toggleShow();
		expect(comp.showLocation).toBe(false);
	});
	it('Should cancel Test When practiceForm dirty and touched and result ', () => {
		comp.practiceForm = comp['fb'].group({
			name: ['', [Validators.required]],
			locations: comp['createLocationsArray'](),
		});
		comp.practiceForm.markAsDirty();
		comp.practiceForm.markAsTouched();
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('facilityModal', ngbModalOptions);
		spyOn(canDeactiveModel_MockService, 'canDeactivate').and.returnValue(
			of({ status: true }).pipe(delay(1)),
		);
		comp.cancel();
		expect(canDeactiveModel_MockService.canDeactivate).toHaveBeenCalled();
		comp.modalRef.close();
	});
	it('Should cancel Test When practiceForm dirty and touched and result not found', () => {
		comp.practiceForm = comp['fb'].group({
			name: ['', [Validators.required]],
			locations: comp['createLocationsArray'](),
		});
		comp.practiceForm.markAsDirty();
		comp.practiceForm.markAsTouched();
		spyOn(canDeactiveModel_MockService, 'canDeactivate').and.returnValue(of(null).pipe(delay(1)));
		let Return_result = comp.cancel();
		expect(canDeactiveModel_MockService.canDeactivate).toHaveBeenCalled();
		expect(Return_result).toBeUndefined();
	});
	it('Should cancel Test When practiceForm not dirty and touched', () => {
		comp.practiceForm = comp['fb'].group({
			name: ['', [Validators.required]],
			locations: comp['createLocationsArray'](),
		});
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('facilityModal', ngbModalOptions);
		comp.practiceForm.reset();
		spyOn(comp['router'], 'navigate');
		comp.cancel();
		expect(comp['router'].navigate).toHaveBeenCalledWith(['front-desk/masters/practice']);
		comp.modalRef.close();
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
		};
	}
	it('Should createProviderBilling test', () => {
		let Expected_Empty = {
			address: '',
			cell_no: '',
			city: '',
			email: null,
			ext_no: '',
			fax: '',
			floor: '',
			id: '',
			npi: '',
			phone: '',
			provider_name: '',
			ssn: '',
			state: '',
			tax_id_check: '',
			tin: '',
			zip: '',
		};
		let result = comp['createProviderBilling']();
		expect(result.valid).toBeTruthy();
		expect(result.value).toEqual(Expected_Empty);
	});
	it('Should createProviderBillingArray test', () => {
		let Expected_Empty = [
			{
				address: '',
				cell_no: '',
				city: '',
				email: null,
				ext_no: '',
				fax: '',
				floor: '',
				id: '',
				npi: '',
				phone: '',
				provider_name: '',
				ssn: '',
				state: '',
				tax_id_check: '',
				tin: '',
				zip: '',
			},
		];
		let result = comp['createProviderBillingArray']();
		expect(result.valid).toBeTruthy();
		expect(result.value[0]).toEqual(Expected_Empty[0]);
	});
	it('Should createTimingsArray test', () => {
		let result = comp['createTimingsArray']();
		expect(result.valid).toBeTruthy();
		expect(result.value.length).toBe(0);
	});
	it('Should createTiming test', () => {
		let result = comp['createTiming'](1);
		expect(result.valid).toBeTruthy();
		expect(result.value).toEqual({ day_id: 1, end_time: '', start_time: '' });
	});
	it('Should createSingleLocation test', () => {
		let Expected_Result = {
			address: '',
			billing: [
				{
					address: '',
					cell_no: '',
					city: '',
					email: null,
					ext_no: '',
					fax: '',
					floor: '',
					id: '',
					npi: '',
					phone: '',
					provider_name: '',
					ssn: '',
					state: '',
					tax_id_check: '',
					tin: '',
					zip: '',
				},
			],
			cell_no: '',
			city: '',
			email: null,
			ext_no: '',
			fax: '',
			floor: '',
			id: '',
			is_main: false,
			lat: '',
			long: '',
			name: '',
			office_hours_end: '',
			office_hours_start: '',
			phone: '',
			place_of_service_id: '',
			region_id: '',
			same_as_provider: false,
			state: '',
			timing: [],
			zip: '',
		};
		let result = comp['createSingleLocation']();
		expect(result.valid).toBeFalsy();
		expect(result.value).toEqual(Expected_Result);
	});
	it('Should createLocationsArray test', () => {
		let Expected_Result = [
			{
				address: '',
				billing: [
					{
						address: '',
						cell_no: '',
						city: '',
						email: null,
						ext_no: '',
						fax: '',
						floor: '',
						id: '',
						npi: '',
						phone: '',
						provider_name: '',
						ssn: '',
						state: '',
						tax_id_check: '',
						tin: '',
						zip: '',
					},
				],
				cell_no: '',
				city: '',
				email: null,
				ext_no: '',
				fax: '',
				floor: '',
				id: '',
				is_main: true,
				lat: '',
				long: '',
				name: '',
				office_hours_end: '',
				office_hours_start: '',
				phone: '',
				place_of_service_id: '',
				region_id: '',
				same_as_provider: false,
				state: '',
				timing: [],
				zip: '',
			},
		];
		let result = comp['createLocationsArray']();
		expect(result.valid).toBeTruthy();
		expect(result.value).toEqual(Expected_Result);
	});
	it('Should initializePracticeForm test', () => {
		let Expected_Result = {
			locations: [
				{
					address: '',
					billing: [
						{
							address: '',
							cell_no: '',
							city: '',
							email: null,
							ext_no: '',
							fax: '',
							floor: '',
							id: '',
							npi: '',
							phone: '',
							provider_name: '',
							ssn: '',
							state: '',
							tax_id_check: '',
							tin: '',
							zip: '',
						},
					],
					cell_no: '',
					city: '',
					email: null,
					ext_no: '',
					fax: '',
					floor: '',
					id: '',
					is_main: true,
					lat: '',
					long: '',
					name: '',
					office_hours_end: '',
					office_hours_start: '',
					phone: '',
					place_of_service_id: '',
					region_id: '',
					same_as_provider: false,
					state: '',
					timing: [],
					zip: ''
				},
			],
			name: '',
			qualifier: ''
		};
		let result = comp['initializePracticeForm']();
		expect(result.valid).toBeFalsy();
		expect(result.value).toEqual(Expected_Result);
	});
	it('Should ngOnChanges test', () => {
		comp.practiceId = 1;
		spyOn(comp, 'getSinglePractice');
		spyOn(comp, 'getPracticeLocation');
		spyOn(comp, 'getSignature');
		comp.ngOnChanges();
		expect(comp.getSinglePractice).toHaveBeenCalled();
		expect(comp.getPracticeLocation).toHaveBeenCalled();
		expect(comp.getSignature).toHaveBeenCalled();
	});
	it('Should onDeleteSignature test', () => {
		// spyOn(comp.signatureComponent,'clearLink');
		comp.selectedId = 0;
		comp.onDeleteSignature(1);
		expect(comp.selectedId).toBe(0);
	});
	it('Should onDeleteSignature test', () => {
		comp.onSignatureDelete(null);
		expect(comp.listSignature.length).toBe(0);
	});
	it('Should getSinglePractice When Subscribe successfull', fakeAsync(() => {
		const formValue: any = {
			result: {
				first_page_url: 'http://cm.ovadamd.org/api/facility_locations?page=1',
				from: 1,
				last_page: 1,
				last_page_url: 'http://cm.ovadamd.org/api/facility_locations?page=1',
				next_page_url: null,
				path: 'http://cm.ovadamd.org/api/facility_locations',
				per_page: '10',
				prev_page_url: null,
				to: 3,
				data: {
					locations: [{ same_as_provider: true }],
					address: '2/4A',
					cell_no: null,
					city: 'Lahore',
					created_at: '2021-07-08 11:32:44',
					created_by: 1,
					day_list: '[1,2,3,4,5]',
					deleted_at: null,
					email: null,
					ext_no: null,
					facility_full_name: 'Citimed - Test Location',
					facility_id: 1,
					fax: null,
					floor: null,
					id: 2,
					is_main: 0,
					lat: 31.4675432,
					long: 74.4487363,
					name: 'Test Location',
					office_hours_end: null,
					office_hours_start: null,
					phone: '5555555555',
					place_of_service_id: 1,
					region_id: '1',
					same_as_provider: 0,
					state: 'AL',
					timing: [
						{
							created_at: '2021-07-09 05:48:49',
							created_by: 1,
							day_id: 1,
							deleted_at: null,
							end_time: '18:00',
							end_time_isb: '18:00:00',
							facility_location_id: 2,
							id: 1,
							start_time: '08:00',
							start_time_isb: '08:00:00',
							time_zone: -300,
							time_zone_string: 'Asia/Qyzylorda',
							updated_at: '2021-07-09 05:48:49',
							updated_by: 1,
						},
					],
				},
			},
			status: true,
		};
		comp.practiceForm = comp['fb'].group({
			name: ['', [Validators.required]],
			locations: comp['createLocationsArray'](),
		});
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.getSinglePractice();
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.startLoader).toBeFalsy();
	}));
	it('Should getSinglePractice When Subscribe UnSuccessfull', fakeAsync(() => {
		comp.practiceForm = comp['fb'].group({
			name: ['', [Validators.required]],
			locations: comp['createLocationsArray'](),
		});
		spyOn(request_MockService, 'sendRequest').and.returnValue(
			throwError({ error: { message: 'error' } }),
		);
		comp.getSinglePractice();
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp.startLoader).toBeFalsy();
		flush();
	}));
	it('Should onSubmit and practiceId exists and sendRequest true and signatureService true When Subscribe Successfull', fakeAsync(() => {
		comp.practiceForm = comp['fb'].group({
			name: ['', [Validators.required]],
			locations: comp['createLocationsArray'](),
		});
		comp.practiceForm.controls.name.setValue('name');
		const SignatureMockResult = {
			resolved: true,
		};
		const formValue: any = {
			result: {
				first_page_url: 'http://cm.ovadamd.org/api/facility_locations?page=1',
				from: 1,
				last_page: 1,
				last_page_url: 'http://cm.ovadamd.org/api/facility_locations?page=1',
				next_page_url: null,
				path: 'http://cm.ovadamd.org/api/facility_locations',
				per_page: '10',
				prev_page_url: null,
				to: 3,
				data: {
					locations: [{ same_as_provider: true }],
					address: '2/4A',
					cell_no: null,
					city: 'Lahore',
					created_at: '2021-07-08 11:32:44',
					created_by: 1,
					day_list: '[1,2,3,4,5]',
					deleted_at: null,
					email: null,
					ext_no: null,
					facility_full_name: 'Citimed - Test Location',
					facility_id: 1,
					fax: null,
					floor: null,
					id: 2,
					is_main: 0,
					lat: 31.4675432,
					long: 74.4487363,
					name: 'Test Location',
					office_hours_end: null,
					office_hours_start: null,
					phone: '5555555555',
					place_of_service_id: 1,
					region_id: '1',
					same_as_provider: 0,
					state: 'AL',
					timing: [
						{
							created_at: '2021-07-09 05:48:49',
							created_by: 1,
							day_id: 1,
							deleted_at: null,
							end_time: '18:00',
							end_time_isb: '18:00:00',
							facility_location_id: 2,
							id: 1,
							start_time: '08:00',
							start_time_isb: '08:00:00',
							time_zone: -300,
							time_zone_string: 'Asia/Qyzylorda',
							updated_at: '2021-07-09 05:48:49',
							updated_by: 1,
						},
					],
				},
			},
			status: true,
		};
		comp.signature = {
			signature_file: true,
			file_title: 'abc',
		};
		comp.practiceId = 2;
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		spyOn(signatureMockService, 'createSignature').and.returnValue(
			of(SignatureMockResult).pipe(delay(1)),
		);
		comp.onSubmit();
		expect(comp.startLoader).toBeTruthy();
		tick(15000);
		discardPeriodicTasks();
	}));
	it('Should onSubmit and practiceId not exists and sendRequest subscribe successfull true and signatureService unsuccesssfull true', fakeAsync(() => {
		comp.practiceForm = comp['fb'].group({
			name: ['', [Validators.required]],
			locations: comp['createLocationsArray'](),
		});
		comp.practiceForm.controls.name.setValue('dummy name');
		const SignatureMockResult = {
			resolved: true,
		};
		const formValue: any = {
			result: {
				first_page_url: 'http://cm.ovadamd.org/api/facility_locations?page=1',
				from: 1,
				last_page: 1,
				last_page_url: 'http://cm.ovadamd.org/api/facility_locations?page=1',
				next_page_url: null,
				path: 'http://cm.ovadamd.org/api/facility_locations',
				per_page: '10',
				prev_page_url: null,
				to: 3,
				data: {
					locations: [{ same_as_provider: true }],
					address: '2/4A',
					cell_no: null,
					city: 'Lahore',
					created_at: '2021-07-08 11:32:44',
					created_by: 1,
					day_list: '[1,2,3,4,5]',
					deleted_at: null,
					email: null,
					ext_no: null,
					facility_full_name: 'Citimed - Test Location',
					facility_id: 1,
					fax: null,
					floor: null,
					id: 2,
					is_main: 0,
					lat: 31.4675432,
					long: 74.4487363,
					name: 'Test Location',
					office_hours_end: null,
					office_hours_start: null,
					phone: '5555555555',
					place_of_service_id: 1,
					region_id: '1',
					same_as_provider: 0,
					state: 'AL',
					timing: [
						{
							created_at: '2021-07-09 05:48:49',
							created_by: 1,
							day_id: 1,
							deleted_at: null,
							end_time: '18:00',
							end_time_isb: '18:00:00',
							facility_location_id: 2,
							id: 1,
							start_time: '08:00',
							start_time_isb: '08:00:00',
							time_zone: -300,
							time_zone_string: 'Asia/Qyzylorda',
							updated_at: '2021-07-09 05:48:49',
							updated_by: 1,
						},
					],
				},
			},
			status: true,
		};
		comp.signature = {
			signature_file: true,
			file_title: 'abc',
		};
		comp.practiceLocations = {
			data: [],
			total: 1,
		};
		// comp.practiceId = 2;
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		spyOn(signatureMockService, 'createSignature').and.returnValue(
			throwError({ error: { message: 'error' } }),
		);
		comp.onSubmit();
		expect(comp.startLoader).toBeTruthy();
		tick(15000);
		discardPeriodicTasks();
	}));
	it('Should onSubmit and practiceId not exists and sendRequest subscribe Unsuccessfull true', fakeAsync(() => {
		comp.practiceForm = comp['fb'].group({
			name: ['', [Validators.required]],
			locations: comp['createLocationsArray'](),
		});
		comp.practiceLocations = {
			data: [],
			total: 1,
		};
		// comp.practiceId = 2;
		spyOn(request_MockService, 'sendRequest').and.returnValue(
			throwError({ error: { message: 'error' } }),
		);
		comp.onSubmit();
		expect(comp.startLoader).toBeFalsy();
		tick(15000);
		discardPeriodicTasks();
	}));
	it('Should handleAddressChange test if type biller', () => {
		comp.practiceForm = comp['fb'].group({
			name: ['', [Validators.required]],
			locations: comp['createLocationsArray'](),
		});
		spyOn(comp, 'getBillingForm').and.returnValue(comp.practiceForm);
		let address: any = address_Data();
		comp.handleAddressChange(address, 'biller');
		expect(comp.getBillingForm).toHaveBeenCalled();
	});
	it('Should handleAddressChange test if type practice', () => {
		comp.practiceForm = comp['fb'].group({
			name: ['', [Validators.required]],
			locations: comp['createLocationsArray'](),
		});
		spyOn(comp, 'getLocationForm').and.returnValue(comp.practiceForm);
		let address: any = address_Data();
		comp.handleAddressChange(address, 'practice');
		expect(comp.getLocationForm).toHaveBeenCalled();
	});
	it('should getPracticeLocation Test When practiceId exists and event exists & request service successfull', fakeAsync(() => {
		comp.practiceId = 2;
		
		const formValue: any = {
			result: {
				first_page_url: 'http://cm.ovadamd.org/api/facility_locations?page=1',
				from: 1,
				last_page: 1,
				last_page_url: 'http://cm.ovadamd.org/api/facility_locations?page=1',
				next_page_url: null,
				path: 'http://cm.ovadamd.org/api/facility_locations',
				per_page: '10',
				prev_page_url: null,
				to: 3,
				data: [{
					locations: [{ same_as_provider: true }],
					address: '2/4A',
					cell_no: null,
					city: 'Lahore',
					created_at: '2021-07-08 11:32:44',
					created_by: 1,
					day_list: '[1,2,3,4,5]',
					deleted_at: null,
					email: null,
					ext_no: null,
					facility_full_name: 'Citimed - Test Location',
					facility_id: 1,
					fax: null,
					floor: null,
					id: 2,
					is_main: 0,
					lat: 31.4675432,
					long: 74.4487363,
					name: 'Test Location',
					office_hours_end: null,
					office_hours_start: null,
					phone: '5555555555',
					place_of_service_id: 1,
					region_id: '1',
					same_as_provider: 0,
					state: 'AL',
					timing: [
						{
							created_at: '2021-07-09 05:48:49',
							created_by: 1,
							day_id: 1,
							deleted_at: null,
							end_time: '18:00',
							end_time_isb: '18:00:00',
							facility_location_id: 2,
							id: 1,
							start_time: '08:00',
							start_time_isb: '08:00:00',
							time_zone: -300,
							time_zone_string: 'Asia/Qyzylorda',
							updated_at: '2021-07-09 05:48:49',
							updated_by: 1,
						},
					],
				}],
			},
			status: true,
		};
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.getPracticeLocation({size:10});
		expect(comp.practiceLocations.data.length).toEqual(0);
		expect(comp.startLoader).toBe(true);
		tick(15000);
		discardPeriodicTasks();
	}));
	it('should getPracticeLocation Test When practiceId exists and event not exists & request service successfull', fakeAsync(() => {
		comp.practiceId = 2;
		
		const formValue: any = {
			result: {
				first_page_url: 'http://cm.ovadamd.org/api/facility_locations?page=1',
				from: 1,
				last_page: 1,
				last_page_url: 'http://cm.ovadamd.org/api/facility_locations?page=1',
				next_page_url: null,
				path: 'http://cm.ovadamd.org/api/facility_locations',
				per_page: '10',
				prev_page_url: null,
				to: 3,
				data: [{
					locations: [{ same_as_provider: true }],
					address: '2/4A',
					cell_no: null,
					city: 'Lahore',
					created_at: '2021-07-08 11:32:44',
					created_by: 1,
					day_list: '[1,2,3,4,5]',
					deleted_at: null,
					email: null,
					ext_no: null,
					facility_full_name: 'Citimed - Test Location',
					facility_id: 1,
					fax: null,
					floor: null,
					id: 2,
					is_main: 0,
					lat: 31.4675432,
					long: 74.4487363,
					name: 'Test Location',
					office_hours_end: null,
					office_hours_start: null,
					phone: '5555555555',
					place_of_service_id: 1,
					region_id: '1',
					same_as_provider: 0,
					state: 'AL',
					timing: [
						{
							created_at: '2021-07-09 05:48:49',
							created_by: 1,
							day_id: 1,
							deleted_at: null,
							end_time: '18:00',
							end_time_isb: '18:00:00',
							facility_location_id: 2,
							id: 1,
							start_time: '08:00',
							start_time_isb: '08:00:00',
							time_zone: -300,
							time_zone_string: 'Asia/Qyzylorda',
							updated_at: '2021-07-09 05:48:49',
							updated_by: 1,
						},
					],
				}],
			},
			status: true,
		};
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.getPracticeLocation();
		expect(comp.practiceLocations.data.length).toEqual(0);
		expect(comp.startLoader).toBe(true);
		tick(15000);
		discardPeriodicTasks();
	}));
	it('should getPracticeLocation Test When practiceId does not exists & request service successfull', fakeAsync(() => {
		// comp.practiceId = 2;
		
		const formValue: any = {
			result: {
				first_page_url: 'http://cm.ovadamd.org/api/facility_locations?page=1',
				from: 1,
				last_page: 1,
				last_page_url: 'http://cm.ovadamd.org/api/facility_locations?page=1',
				next_page_url: null,
				path: 'http://cm.ovadamd.org/api/facility_locations',
				per_page: '10',
				prev_page_url: null,
				to: 3,
				data: [{
					locations: [{ same_as_provider: true }],
					address: '2/4A',
					cell_no: null,
					city: 'Lahore',
					created_at: '2021-07-08 11:32:44',
					created_by: 1,
					day_list: '[1,2,3,4,5]',
					deleted_at: null,
					email: null,
					ext_no: null,
					facility_full_name: 'Citimed - Test Location',
					facility_id: 1,
					fax: null,
					floor: null,
					id: 2,
					is_main: 0,
					lat: 31.4675432,
					long: 74.4487363,
					name: 'Test Location',
					office_hours_end: null,
					office_hours_start: null,
					phone: '5555555555',
					place_of_service_id: 1,
					region_id: '1',
					same_as_provider: 0,
					state: 'AL',
					timing: [
						{
							created_at: '2021-07-09 05:48:49',
							created_by: 1,
							day_id: 1,
							deleted_at: null,
							end_time: '18:00',
							end_time_isb: '18:00:00',
							facility_location_id: 2,
							id: 1,
							start_time: '08:00',
							start_time_isb: '08:00:00',
							time_zone: -300,
							time_zone_string: 'Asia/Qyzylorda',
							updated_at: '2021-07-09 05:48:49',
							updated_by: 1,
						},
					],
				}],
			},
			status: true,
		};
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.getPracticeLocation({size:10});
		expect(comp.practiceLocations.data.length).toEqual(0);
		expect(comp.startLoader).toBe(true);
		tick(15000);
		discardPeriodicTasks();
	}));
	it('Should getPracticeLocation and sendRequest subscribe Unsuccessfull true', fakeAsync(() => {
		spyOn(request_MockService, 'sendRequest').and.returnValue(
			throwError({ error: { message: 'error' } }),
		);
		comp.getPracticeLocation({size:10});
		expect(comp.startLoader).toBeFalsy();
		tick(15000);
		discardPeriodicTasks();
	}));
	afterAll(() => {
		TestBed.resetTestingModule();
	});
});
