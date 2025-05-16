// import { GridsterPreviewComponent } from './../../../../../../template-manager/shared/gridster/gridsterPreview.component';
import { LoggerMockService } from '@appDir/shared/mock-services/LoggerMock.service';
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
import { MainService } from '@appDir/shared/services/main-service';
import { SignatureServiceService } from '@appDir/shared/signature/services/signature-service.service';
import { PriviligesComponent } from './priviliges.component';
import { FDMockService } from '@appDir/shared/mock-services/FDMockService.service';
import { SignatureMockService } from '@appDir/shared/mock-services/SignatureMock.service';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { RequiredFieldsFormComponent } from '../required-fields-form/required-fields-form.component';
// import { promise } from 'protractor';
import { HttpClientTestingModule } from '@angular/common/http/testing';
describe('PriviligesComponent', () => {
	let comp: PriviligesComponent;
	let fixture: ComponentFixture<PriviligesComponent>;
	let request_MockService = new RequestMockService();
	let confirm_MockService = new ConfirmMockService();
	let canActivate_MockService = new CanDeactiveMockService();
	let logger_MockService = new LoggerMockService();
	let fd_MockService = new FDMockService();
	let signatureMockService = new SignatureMockService();
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [PriviligesComponent, RequiredFieldsFormComponent],
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
				// { provide: ConfirmationService, useValue: confirm_MockService },
				{ provide: CanDeactivateModelComponentService, useValue: canActivate_MockService },
				{ provide: FDServices, useValue: fd_MockService },
				{ provide: SignatureServiceService, useValue: signatureMockService },
				{ provide: Logger, useValue: logger_MockService },
				{
					provide: ActivatedRoute,
					useValue: {
						parent: {
							snapshot: { params: { id: 123 } },
							parent: { parent: 123 },
						},
						snapshot: {
							pathFromRoot: [{ params: { id: 123 } }],
						},
						params: of({ id: 123 }),
					},
				},
			],
		})
			.overrideModule(BrowserDynamicTestingModule, {
				set: {
					entryComponents: [RequiredFieldsFormComponent],
				},
			})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(PriviligesComponent);
		comp = fixture.componentInstance;
	});
	afterEach(() => {
		TestBed.resetTestingModule();
	});
	it('should be created', () => {
		expect(comp).toBeTruthy();
	});
	it('Should ngOnInit Test', () => {
		spyOn(comp, 'getSpecialities');
		spyOn(comp, 'getUsersRole');
		comp.ngOnInit();
		expect(comp.getSpecialities).toHaveBeenCalled();
		expect(comp.getUsersRole).toHaveBeenCalled();
	});
	it('should getUserTimings Test When Subscribe successfull', fakeAsync(() => {
		let Given_Responce = {
			status: true,
			message: 'Users List',
			result: {
				data: [
					{
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
		comp.practiceLocationId = 10;
		comp.lstFacilities = [{id:10}];
		spyOn(comp, 'setTimings');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(Given_Responce).pipe(delay(1)));
		comp.getUserTimings();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.setTimings).toHaveBeenCalled();
	}));
	it('Should submitAll Test', () => {
		comp.form = comp['fb'].group({
			facilities: [],
			speciality: [],
		});
		spyOn(comp, 'submit_timings');
		comp.submitAll();
		expect(comp.disableBtn).toBe(true);
		expect(comp.submit_timings).toHaveBeenCalled();
	});
	it('Should submit_timings Test', fakeAsync(() => {
		let Given_Responce = {
			status: true,
			message: 'Users List',
			result: {
				data: [
					{
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
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(Given_Responce).pipe(delay(1)));
		comp.submit_timings();
		tick(15000);
		discardPeriodicTasks();
		expect(comp).toBeTruthy();
		expect(comp.disableBtn).toBe(false);
	}));
	it('Should getUsersRole Test', fakeAsync(() => {
		let Given_Responce = {
			status: true,
			message: 'Users List',
			result: {
				data: {
					doctor_id: 10,
					icd10_codes: [],
					cpt_codes: [],
					medical_identifier: 'medical_identifier',
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
		spyOn(comp, 'getFacitiesOfUser');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(Given_Responce).pipe(delay(1)));
		comp.getUsersRole();
		tick(15000);
		discardPeriodicTasks();
		expect(comp).toBeTruthy();
		expect(comp.disableBtn).toBe(false);
		expect(comp.getFacitiesOfUser).toHaveBeenCalled();
	}));
	it('Should getSpecialities Test', fakeAsync(() => {
		let Given_Responce = {
			status: true,
			message: 'Users List',
			result: {
				data: [
					{
						doctor_id: 10,
						icd10_codes: [],
						cpt_codes: [],
						medical_identifier: 'medical_identifier',
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
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(Given_Responce).pipe(delay(1)));
		comp.getSpecialities();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.loadSpin).toBe(false);
		expect(comp.lstSpecialities.length).toBe(1);
	}));
	it('Should getPermissions Test  When Subscribe Successfull', fakeAsync(() => {
		let Given_Responce = {
			status: true,
			message: 'Users List',
			result: {
				data: {
					tree: [],
					speciality_id: [],
					is_manual_specialty: false,
					medical_identifier: 'medical_identifier',
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
		comp.practiceLocationId = 10;
		spyOn(comp, 'checkSameUser');
		// spyOn(comp, 'onSpecialityChange');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(Given_Responce).pipe(delay(1)));
		comp.getPermissions(1, 5);
		tick(15000);
		discardPeriodicTasks();
		expect(comp.loadSpin).toBe(false);
		expect(comp.lstSpecialities.length).toBe(0);
		expect(comp.checkSameUser).toHaveBeenCalled();
	}));
	it('Should getPermissions When Subscribe UnSuccessfull', fakeAsync(() => {
		spyOn(request_MockService, 'sendRequest').and.returnValue(
			throwError({ error: { message: 'error' } }),
		);
		comp.getPermissions(1, 5);
		expect(comp.loadSpin).toBe(false);
		flush();
	}));
	it('Should checkSameUser Test', () => {
		comp.userId = 123;
		localStorage.setItem('cm_data', JSON.stringify({ basic_info: { id: 123 } }));
		comp.checkSameUser();
		expect(comp.isDisabledTemplateControl).toBe(true);
	});
	it('Should getDocumentManagerTaskPermissions Test', () => {
		comp.userPermissonData = [
			{
				slug: 'patient',
				submenu: [
					{ slug: 'case_list', submenu: [{ slug: 'edit_case', submenu: [{ slug: 'documents' }] }] },
				],
			},
		];
		spyOn(comp.userPermissonData, 'push');
		comp.getDocumentManagerTaskPermissions();
		expect(comp.userPermissonData.push).toHaveBeenCalled();
	});
	it('Should submitData Test  When Subscribe Successfull If isMedicalIdentifier true', fakeAsync(() => {
		let Given_Responce = {
			status: true,
			message: 'Users List',
			result: {
				data: {
					tree: [],
					speciality_id: [],
					is_manual_specialty: false,
					medical_identifier: 'medical_identifier',
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
		comp.isMedicalIdentifier = true;
		comp.isNavigateToMedicalIdentifier = true;
		spyOn(comp['router'], 'navigate');
		spyOn(comp, 'attachUserFolderType').and.returnValue(of(Given_Responce).pipe(delay(1)));
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(Given_Responce).pipe(delay(1)));
		comp.submitData({ permissions: [] });
		tick(15000);
		discardPeriodicTasks();
		expect(comp['router'].navigate).toHaveBeenCalled();
	}));
	it('Should submitData Test  When Subscribe Successfull If isMedicalIdentifier false', fakeAsync(() => {
		let Given_Responce = {
			status: true,
			message: 'Users List',
			result: {
				data: {
					tree: [],
					speciality_id: [],
					is_manual_specialty: false,
					medical_identifier: 'medical_identifier',
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
		comp.isMedicalIdentifier = false;
		spyOn(comp['router'], 'navigateByUrl');
		spyOn(comp, 'attachUserFolderType').and.returnValue(of(Given_Responce).pipe(delay(1)));
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(Given_Responce).pipe(delay(1)));
		comp.submitData({ permissions: [] });
		tick(15000);
		discardPeriodicTasks();
		expect(comp['router'].navigateByUrl).toHaveBeenCalled();
	}));
	it('Should onPracticeChange Test', () => {
		comp.lstFacilities = [
			{
				facility_full_name: 'facility_full_name',
			},
		];
		spyOn(comp, 'getPermissions');
		spyOn(comp, 'getUserFolderTypes');
		spyOn(comp, 'getUserTimings');
		comp.onPracticeChange({ target: { value: 2 } }, { selectedIndex: 1 });
		expect(comp.getPermissions).toHaveBeenCalled();
		expect(comp.getUserFolderTypes).toHaveBeenCalled();
		expect(comp.getUserTimings).toHaveBeenCalled();
	});
	it('Should setTimings Test', () => {
		comp.setTimings({ timing: [{ day_id: 0 }] });
		
		expect(comp.childValues.isValid).toBe(true);
	});
	it('Should getFacitiesOfUser Test When Subscribe Successfull', fakeAsync(() => {
		let Given_Responce = {
			status: true,
			message: 'Users List',
			result: {
				data: [
					{
						id: 0,
						timing: [
							{
								created_at: '2021-07-09 05:48:49',
								created_by: 1,
								day_id: 1,
								deleted_at: null,
								end_time: '13:00:00',
								end_time_isb: '18:00:00',
								facility_location_id: 2,
								id: 1,
								start_time: '03:00:00',
								start_time_isb: '08:00:00',
								time_zone: -300,
								time_zone_string: 'Asia/Qyzylorda',
								updated_at: '2021-07-09 05:48:49',
								updated_by: 1,
							},
						],
						tree: [
							{
								start_time: new Date(),
								end_time: new Date(),
								time_zone_string: 'Asia/karachi',
							},
						],
						start_time: new Date(),
						end_time: new Date(),
						time_zone_string: 'Asia/karachi',
						speciality_id: [],
						is_manual_specialty: false,
						medical_identifier: 'medical_identifier',
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
		comp.form = comp['fb'].group({
			facilities: [],
			speciality: [],
		});
		localStorage.setItem('cm_data', JSON.stringify({ basic_info: { id: 123 } }));
		spyOn(comp, 'getUserFolderTypes');
		spyOn(comp, 'setTimings');
		spyOn(comp, 'getPermissions');
		spyOn(comp, 'getUserTimings');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(Given_Responce).pipe(delay(1)));
		comp.getFacitiesOfUser();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.loadSpin).toBe(false);
		expect(comp.getUserFolderTypes).toHaveBeenCalled();
		expect(comp.setTimings).toHaveBeenCalled();
		expect(comp.getPermissions).toHaveBeenCalled();
		expect(comp.getUserTimings).toHaveBeenCalled();
	}));
	it('Should getFacitiesOfUser When Subscribe UnSuccessfull', fakeAsync(() => {
		spyOn(request_MockService, 'sendRequest').and.returnValue(
			throwError({ error: { message: 'error' } }),
		);
		comp.getFacitiesOfUser();
		expect(comp.loadSpin).toBe(false);
		flush();
	}));
	it('Should canDeactivate Test', () => {
		comp.form = comp['fb'].group({
			facilities: [],
			speciality: [],
		});
		comp.initialSpeciality = 1;
		comp.userId = 125;
		localStorage.setItem('cm_data', JSON.stringify({ basic_info: { id: 123 } }));
		let result = comp.canDeactivate();
		
		expect(result).toBe(false);
	});
	// fit('Should onSpecialityChange Test  When Subscribe Successfull', fakeAsync(() => {
	// 	let Given_Responce = {
	// 		status: true,
	// 		message: 'Users List',
	// 		result: {
	// 			data: [
	// 				{
	// 					id: 0,
	// 					timing: [],
	// 					tree: [],
	// 					start_time: new Date(),
	// 					end_time: new Date(),
	// 					time_zone_string: 'Asia/karachi',
	// 					speciality_id: [],
	// 					is_manual_specialty: false,
	// 					medical_identifier: 'medical_identifier',
	// 				},
	// 			],
	// 			current_page: 1,
	// 			first_page_url: 'http://cm.ovadamd.net/api/users?page=1',
	// 			from: 1,
	// 			last_page: 27,
	// 			last_page_url: 'http://cm.ovadamd.net/api/users?page=27',
	// 			next_page_url: 'http://cm.ovadamd.net/api/users?page=2',
	// 			path: 'http://cm.ovadamd.net/api/users',
	// 			per_page: '10',
	// 			prev_page_url: null,
	// 			to: 10,
	// 			total: 265,
	// 		},
	// 	};
	// 	comp.lstSpecialities = [{ name: 'speciality name', id: 1 }];
	// 	spyOn(request_MockService, 'sendRequest').and.returnValue(of(Given_Responce).pipe(delay(1)));
	// 	comp.onSpecialityChange({ target: { value: 1 } }, { selectedIndex: 1 });
	// 	tick(15000);
	// 	discardPeriodicTasks();
		
	// 	expect(comp.selecteSpeciality).toMatch('speciality name');
	// 	expect(comp.chosenSpeciality.visit_types.length).toBe(1);
	// }));
	// fit('Should onSpecialityChange Test  When Subscribe Successfull If event.target.value not exists', fakeAsync(() => {
	// 	let Given_Responce = {
	// 		status: true,
	// 		message: 'Users List',
	// 		result: {
	// 			data: [
	// 				{
	// 					id: 0,
	// 					timing: [],
	// 					tree: [],
	// 					start_time: new Date(),
	// 					end_time: new Date(),
	// 					time_zone_string: 'Asia/karachi',
	// 					speciality_id: [],
	// 					is_manual_specialty: false,
	// 					medical_identifier: 'medical_identifier',
	// 				},
	// 			],
	// 			current_page: 1,
	// 			first_page_url: 'http://cm.ovadamd.net/api/users?page=1',
	// 			from: 1,
	// 			last_page: 27,
	// 			last_page_url: 'http://cm.ovadamd.net/api/users?page=27',
	// 			next_page_url: 'http://cm.ovadamd.net/api/users?page=2',
	// 			path: 'http://cm.ovadamd.net/api/users',
	// 			per_page: '10',
	// 			prev_page_url: null,
	// 			to: 10,
	// 			total: 265,
	// 		},
	// 	};
	// 	comp.lstSpecialities = [{ name: 'speciality name', id: 1 }];
	// 	spyOn(request_MockService, 'sendRequest').and.returnValue(of(Given_Responce).pipe(delay(1)));
	// 	// comp.onSpecialityChange({ target: { value: null } }, { selectedIndex: 1 });
	// 	tick(15000);
	// 	discardPeriodicTasks();
	// 	expect(comp.chosenSpeciality).toBe(null);
	// }));
	it('Should addVisitType Test When Subscribe Successfull', fakeAsync(() => {
		let Given_Responce = {
			status: true,
			message: 'Users List',
			result: {
				data: [
					{
						id: 0,
						timing: [],
						tree: [],
						start_time: new Date(),
						end_time: new Date(),
						time_zone_string: 'Asia/karachi',
						speciality_id: [],
						is_manual_specialty: false,
						medical_identifier: 'medical_identifier',
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
		
		// spyOn(comp['modalService'], 'open').and.returnValue({
		// 	result: {
		// 		then: function () {
		// 			return true
		// 		},
		// 	},
		// 	componentInstance: { data: '' }
		// });
		comp.lstSpecialities = [{ name: 'speciality name', id: 1 }];
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(Given_Responce).pipe(delay(1)));
		comp.addVisitType({ id: 1, fields_controls: [{ id: 10 }] });
		tick(15000);
		discardPeriodicTasks();
		
		expect(comp['modalService'].open).toHaveBeenCalled();
	}));
	it('Should resetSpecialityId Test', () => {
		comp.resetSpecialityId();
		// expect(comp.currentSpeciality).toBe(0);
	});
	it('Should getUserFolderTypes Test  When Subscribe Successfull', fakeAsync(() => {
		let Given_Responce = {
			status: true,
			message: 'Users List',
			result: {
				data: [
					{
						id: 0,
						timing: [],
						tree: [],
						start_time: new Date(),
						end_time: new Date(),
						time_zone_string: 'Asia/karachi',
						speciality_id: [],
						is_manual_specialty: false,
						medical_identifier: 'medical_identifier',
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
		
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(Given_Responce).pipe(delay(1)));
		comp.getUserFolderTypes();
		tick(15000);
		discardPeriodicTasks();
		
		expect(comp.dataObj.data.length).toBe(1);
	}));
	it('Should attachUserFolderType Test  When Subscribe Successfull', fakeAsync(() => {
		let Given_Responce = {
			status: true,
			message: 'Users List',
			result: {
				data: [
					{
						id: 0,
						timing: [],
						tree: [],
						start_time: new Date(),
						end_time: new Date(),
						time_zone_string: 'Asia/karachi',
						speciality_id: [],
						is_manual_specialty: false,
						medical_identifier: 'medical_identifier',
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
		

		comp.dataObj = {
			data: [],
			result: [
				{
					item: {
						id: 1,
						name: 'mock name',
						slug: 'slug',
						description: 'description',
						parent_id: 45,
						folder_type_id: 12,
						show_files: false,
						sub_folders: [],
						facility_id: 111,
						speciality_id: 25,
						is_checked: true,
					},
				},
			],
		};
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(Given_Responce).pipe(delay(1)));
		comp.attachUserFolderType();
		tick(15000);
		discardPeriodicTasks();
		
		expect(comp.dataObj.data.length).toBe(0);
	}));
	it('Should GoBackToBasicInfo test', () => {
		spyOn(comp['router'], 'navigate');
		comp.GoBackToBasicInfo();
		expect(comp['router'].navigate).toHaveBeenCalled();
	});
	it('Should isSameLoginUser Test', () => {
		let form = comp['fb'].group({
			name: [''],
		});
		comp.userId = 123;
		localStorage.setItem('cm_data', JSON.stringify({ basic_info: { id: 123 } }));
		comp.isSameLoginUser(form, 'name');
		expect(comp.isSameUserLogin).toBe(true);
	});
	afterAll(() => {
		TestBed.resetTestingModule();
	});
});
