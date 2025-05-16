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
import { ToastrModule } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { CanDeactiveMockService } from '@appDir/shared/mock-services/CanDeactiveModalMock.service';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { RolesFieldListComponent } from './roles-field-list.component';
import { RequiredFieldsMapperPipe } from '../../pipes/required-fields-mapper.pipe';
import { SpecialityModalComponent } from '../speciality-modal/speciality-modal.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('RolesFieldListComponent', () => {
	let comp: RolesFieldListComponent;
	let fixture: ComponentFixture<RolesFieldListComponent>;
	let signatureMockService = new SignatureMockService();
	let request_MockService = new RequestMockService();
	let canDeactiveModel_MockService = new CanDeactiveMockService();
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [RolesFieldListComponent, SpecialityModalComponent, RequiredFieldsMapperPipe],
			schemas: [NO_ERRORS_SCHEMA],
			imports: [SharedModule, ToastrModule.forRoot(), RouterTestingModule,HttpClientTestingModule],
			providers: [
				Config,
				LocalStorage,
				{ provide: SignatureServiceService, useValue: signatureMockService },
				{ provide: RequestService, useValue: request_MockService },
				{ provide: CanDeactivateModelComponentService, useValue: canDeactiveModel_MockService },
			],
		})
			.overrideModule(BrowserDynamicTestingModule, {
				set: {
					entryComponents: [SpecialityModalComponent],
				},
			})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(RolesFieldListComponent);
		comp = fixture.componentInstance;
	});
	afterEach(() => {
		TestBed.resetTestingModule();
	});
	it('should Create', () => {
		expect(comp).toBeTruthy();
	});
	it('Should ngOnInit Test', () => {
		comp.filterForm = comp['fb'].group({
			location_name: '',
			specialty_name: '',
			visit_type_name: '',
			field_control_name: '',
		});
		spyOn(comp, 'setPage');
		comp.ngOnInit();
		expect(comp.filterForm.value).toEqual({
			location_name: '',
			specialty_name: '',
			visit_type_name: '',
			field_control_name: '',
		});
		expect(comp.setPage).toHaveBeenCalled();
	});
	// it('Should editVisitType Test', fakeAsync(() => {
	// 	spyOn(comp['modal'], 'open').and.returnValue({
	// 		result: {
	// 			then: function () {
	// 				return true;
	// 			},
	// 		},
	// 		componentInstance: {
	// 			speciality: '',
	// 			role: '',
	// 		},
	// 	});
	// 	comp.editVisitType('row', 'role');
	// 	tick(1500);
	// 	expect(comp['modal'].open).toHaveBeenCalled();
	// }));
	it('Should setPage Test', () => {
		comp.filterForm = comp['fb'].group({
			location_name: '',
			specialty_name: '',
			visit_type_name: '',
			field_control_name: '',
		});
		spyOn(comp, 'addUrlQueryParams');
		spyOn(comp, 'getFacilityLocation');
		comp.setPage({ offset: 0 });
		expect(comp.addUrlQueryParams).toHaveBeenCalled();
		expect(comp.getFacilityLocation).toHaveBeenCalled();
	});
	it('Should pageLimit Test', () => {
		spyOn(comp, 'setPage');
		comp.pageLimit(10);
		expect(comp.setPage).toHaveBeenCalled();
		expect(comp.page.size).toBe(10);
	});
	it('Should addUrlQueryParams Test', () => {
		spyOn(comp['location'], 'replaceState');
		comp.addUrlQueryParams();
		expect(comp['location'].replaceState).toHaveBeenCalled();
	});

	it('Should getFacilityLocation When Subscribe successfull', fakeAsync(() => {
		let Confirmation_Responce = {
			result: {
				data: [],
				total: 0,
			},
		};
		spyOn(request_MockService, 'sendRequest').and.returnValue(
			of(Confirmation_Responce).pipe(delay(1)),
		);
		comp.getFacilityLocation({});
		expect(comp.loadSpin).toBe(true);
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.loadSpin).toBe(false);
		expect(comp.lstFacility.length).toBe(0);
		expect(comp.page.totalElements).toBe(0);
	}));
	it('Should getFacilityLocation When Subscribe UnSuccessfull', fakeAsync(() => {
		spyOn(request_MockService, 'sendRequest').and.returnValue(
			throwError({ error: { message: 'error' } }),
		);
		comp.getFacilityLocation({});
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.loadSpin).toBe(false);
	}));
	it('Should checkInputs Test', () => {
		comp.filterForm = comp['fb'].group({
			name: [''],
			remainder_days: [''],
			description: [''],
			comments: [''],
		});
		let Result = comp.checkInputs();
		expect(Result).toBe(true);
	});
	it('Should checkInputs Test When filterForm have values', () => {
		comp.filterForm = comp['fb'].group({
			name: [''],
			remainder_days: [''],
			description: [''],
			comments: [''],
		});
		comp.filterForm.controls.name.setValue('Mock Name');
		let Result = comp.checkInputs();
		expect(Result).toBe(false);
	});
	it('Should edit Test', () => {
		spyOn(comp['router'], 'navigate');
		comp.edit({ id: 111 });
		expect(comp['router'].navigate).toHaveBeenCalled();
	});
	it('Should getFacilitySpeciality When Subscribe successfull', fakeAsync(() => {
		let Confirmation_Responce = {
			result: {
				data: [
					{
						visit_types: [
							{
								id: 10,
							},
						],
					},
				],
				total: 0,
			},
		};
		spyOn(request_MockService, 'sendRequest').and.returnValue(
			of(Confirmation_Responce).pipe(delay(1)),
		);
		comp.getFacilitySpeciality({ id: 10, _specialities: [], specialities: [] });
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
	}));
	it('Should getFacilitySpeciality When Subscribe successfull', fakeAsync(() => {
		let Confirmation_Responce = {
			specialities:[],
			result: {
				data: [
					{
						visit_types: [],
					},
				],
				total: 0,
			},
		};
		spyOn(request_MockService, 'sendRequest').and.returnValue(
			of(Confirmation_Responce).pipe(delay(1)),
		);
		comp.getFacilitySpeciality({ id: 10, _specialities: [], specialities: [] });
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
	}));
	it('Should toggleOpen Test If is_open true', () => {
		let GivenValue = {
			id: 10,
			name: 'Mock',
			address: 'Mock Add',
			state: 'Mock state',
			city: true,
			facility_full_name: 'Facility name',
			facility_id: 10,
			floor: 'floor',
			place_of_service_id: 23,
			region_id: '32',
			created_at: new Date(),
			updated_at: new Date(),
			deleted_at: new Date(),
			is_open: false,
			timing: [],
		};
		spyOn(comp, 'getFacilitySpeciality');
		comp.toggleOpen(GivenValue);
		expect(comp.getFacilitySpeciality).toHaveBeenCalled();
	});
	it('Should toggleOpen Test If is_open null', () => {
		let GivenValue = {
			id: 10,
			name: 'Mock',
			address: 'Mock Add',
			state: 'Mock state',
			city: true,
			facility_full_name: 'Facility name',
			facility_id: 10,
			floor: 'floor',
			place_of_service_id: 23,
			region_id: '32',
			created_at: new Date(),
			updated_at: new Date(),
			deleted_at: new Date(),
			is_open: null,
			timing: [],
		};
		spyOn(comp, 'getFacilitySpeciality');
		comp.toggleOpen(GivenValue);
		expect(comp.getFacilitySpeciality).toHaveBeenCalled();
	});
	afterAll(() => {
		TestBed.resetTestingModule();
	});
});
