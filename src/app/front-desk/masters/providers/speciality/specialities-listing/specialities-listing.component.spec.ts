import { Logger } from '@nsalaun/ng-logger';
import {  Validators } from '@angular/forms';
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
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { RequestMockService } from '@appDir/shared/mock-services/RequestMock.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { delay } from 'rxjs/operators';
import { ConfirmMockService } from '@appDir/shared/mock-services/ConfirmMock.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SpecialityListing } from './specialities-listing.component';
import { CanDeactiveMockService } from '@appDir/shared/mock-services/CanDeactiveModalMock.service';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { LoggerMockService } from '@appDir/shared/mock-services/LoggerMock.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
describe('SpecialityListing', () => {
	let comp: SpecialityListing;
	let fixture: ComponentFixture<SpecialityListing>;
	let request_MockService = new RequestMockService();
	let confirm_MockService = new ConfirmMockService();
	let canActivate_MockService = new CanDeactiveMockService();
	let Logger_MockService = new LoggerMockService();
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [SpecialityListing],
			imports: [SharedModule, RouterTestingModule, ToastrModule.forRoot(), BrowserAnimationsModule,HttpClientTestingModule ],
			schemas: [NO_ERRORS_SCHEMA],
			providers: [
				Config,
				LocalStorage,
				ToastrService,
				Logger,
				{ provide: RequestService, useValue: request_MockService },
				// { provide: ConfirmationService, useValue: confirm_MockService },
				{ provide: CanDeactivateModelComponentService, useValue: canActivate_MockService },
				{ provide: Logger, useValue: Logger_MockService },
			],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(SpecialityListing);
		comp = fixture.componentInstance;
	});
	afterEach(() => {
		TestBed.resetTestingModule();
	});
	it('should be created', () => {
		expect(comp).toBeTruthy();
	});
	it('Should Test onValueChange If field == over_booking', () => {
		comp.specialityForm = comp['fb'].group({
			id: null,
			name: ['', [Validators.required]],
			time_slot: ['', [Validators.required, Validators.min(5), Validators.max(comp.maxVal)]],
			over_booking: ['', [Validators.required, Validators.min(0), Validators.max(999)]],
			description: [''],
			available_specialties_id: [''],
			visit_type_ids: ['', Validators.required],
			is_create_appointment: ['0'],
		});
		comp.specialityForm.controls.over_booking.setValue('4040');
		comp.onValueChange(0, 'over_booking');
		expect(comp.specialityForm.controls.over_booking.value).toBe('404');
	});
	it('Should Test onValueChange If field == time_slot', () => {
		comp.specialityForm = comp['fb'].group({
			id: null,
			name: ['', [Validators.required]],
			time_slot: ['', [Validators.required, Validators.min(5), Validators.max(comp.maxVal)]],
			over_booking: ['', [Validators.required, Validators.min(0), Validators.max(999)]],
			description: [''],
			available_specialties_id: [''],
			visit_type_ids: ['', Validators.required],
			is_create_appointment: ['0'],
		});
		comp.specialityForm.controls.over_booking.setValue('4040');
		comp.onValueChange(300, 'time_slot');
		expect(comp.specialityForm.controls.time_slot.value).toBe(200);
	});
	it('Should Test assignValues', () => {
		comp.specialityForm = comp['fb'].group({
			id: null,
			name: ['', [Validators.required]],
			time_slot: ['', [Validators.required, Validators.min(5), Validators.max(comp.maxVal)]],
			over_booking: ['', [Validators.required, Validators.min(0), Validators.max(999)]],
			description: [''],
			available_specialties_id: [''],
			visit_type_ids: ['', Validators.required],
			is_create_appointment: ['0'],
		});
		comp.speciality = {
			id:101,
			name:'name'
		}
		comp.assignValues();
		expect(comp.specialityForm.controls.id.value).toBe(101);
		expect(comp.specialityForm.controls.name.value).toBe('name');
	});
	it('Should Test isDisabled If isLoading False', () => {
		comp.isLoading = true;
		let Result = comp.isDisabled();
		expect(Result).toBe(true);
	});
	it('Should Test isDisabled If isLoading False', () => {
		comp.specialityForm = comp['fb'].group({
			id: null,
			name: ['', [Validators.required]],
			time_slot: ['', [Validators.required, Validators.min(5), Validators.max(comp.maxVal)]],
			over_booking: ['', [Validators.required, Validators.min(0), Validators.max(999)]],
			description: [''],
			available_specialties_id: [''],
			visit_type_ids: ['', Validators.required],
			is_create_appointment: ['0'],
		});
		comp.specialityForm.controls.name.setValue('abc');
		comp.specialityForm.controls.time_slot.setValue(200);
		comp.specialityForm.controls.over_booking.setValue(20);
		comp.specialityForm.controls.visit_type_ids.setValue(2);
		let Result = comp.isDisabled();
		expect(Result).toBe(false);
	});
	it('Should Test setPage', () => {
		spyOn(comp, 'addUrlQueryParams');
		spyOn(comp, 'getSpecialities');
		comp.setPage({ offset: 0 });
		expect(comp.addUrlQueryParams).toHaveBeenCalled();
		expect(comp.getSpecialities).toHaveBeenCalled();
		expect(comp.page.pageNumber).toBe(0);
	});
	it('Should addUrlQueryParams Test', () => {
		spyOn(comp['location'], 'replaceState');
		comp.addUrlQueryParams();
		expect(comp['location'].replaceState).toHaveBeenCalled();
	});
	it('Should getSpecialities When Subscribe successfull', fakeAsync(() => {
		const formValue: any = {
			result: {
				first_page_url: 'http://cm.ovadamd.org/api/facility_locations?page=1',
				from: 1,
				total: 10,
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
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.getSpecialities({});
		expect(comp.loadSpin).toBe(true);
		fixture.detectChanges();
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.loadSpin).toBeFalsy();
		expect(comp.specialities).toEqual(formValue.result.data);
		expect(comp.page.totalElements).toEqual(formValue.result.total);
	}));
	it('Should getSpecialities When Subscribe UnSuccessfull', fakeAsync(() => {
		spyOn(request_MockService, 'sendRequest').and.returnValue(
			throwError({ error: { message: 'error' } }),
		);
		comp.getSpecialities({});
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp.loadSpin).toBeFalsy();
		flush();
	}));
	it('Should getAvailableSpecialities When Subscribe successfull', fakeAsync(() => {
		const formValue: any = {
			result: {
				first_page_url: 'http://cm.ovadamd.org/api/facility_locations?page=1',
				from: 1,
				total: 10,
				last_page: 1,
				last_page_url: 'http://cm.ovadamd.org/api/facility_locations?page=1',
				next_page_url: null,
				path: 'http://cm.ovadamd.org/api/facility_locations',
				per_page: '10',
				prev_page_url: null,
				to: 3,
				data: {
					unshift: function () {},
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
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.getAvailableSpecialities({ id: 2, default_name: 'abc' });
		fixture.detectChanges();
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.server_apps).toEqual(formValue.result.data);
	}));
	it('Should getAvailableSpecialities When Subscribe successfull & server_apps empty array', fakeAsync(() => {
		const formValue: any = {
			result: {
				first_page_url: 'http://cm.ovadamd.org/api/facility_locations?page=1',
				from: 1,
				total: 10,
				last_page: 1,
				last_page_url: 'http://cm.ovadamd.org/api/facility_locations?page=1',
				next_page_url: null,
				path: 'http://cm.ovadamd.org/api/facility_locations',
				per_page: '10',
				prev_page_url: null,
				to: 3,
				data: {},
			},
			status: true,
		};
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.getAvailableSpecialities();
		fixture.detectChanges();
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.server_apps.length).toBeUndefined();
	}));
	it('Should getAvailableSpecialities When Subscribe UnSuccessfull', fakeAsync(() => {
		spyOn(request_MockService, 'sendRequest').and.returnValue(
			throwError({ error: { message: 'error' } }),
		);
		comp.getAvailableSpecialities();
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp.loadSpin).toBeFalsy();
		flush();
	}));
	it('Should checkInputs Test', () => {
		comp.searchForm = comp['fb'].group({
			name: [''],
			time_slot: [''],
			over_booking: [''],
		});
		let Result = comp.checkInputs();
		expect(Result).toBe(true);
	});
	it('Should checkInputs Test When SearchForm have values', () => {
		comp.searchForm = comp['fb'].group({
			name: [''],
			time_slot: [''],
			over_booking: [''],
		});
		comp.searchForm.controls.name.setValue('Mock Name');
		let Result = comp.checkInputs();
		expect(Result).toBe(false);
	});
	it('Should crossClose Test When Response have values', fakeAsync(() => {
		comp.specialityForm = comp['fb'].group({
			id: null,
			name: ['', [Validators.required]],
			time_slot: ['', [Validators.required, Validators.min(5), Validators.max(comp.maxVal)]],
			over_booking: ['', [Validators.required, Validators.min(0), Validators.max(999)]],
			description: [''],
			available_specialties_id: [''],
			visit_type_ids: ['', Validators.required],
			is_create_appointment: ['0'],
			qualifier: null,
			pre_defined_specialty: null
		});
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('content', ngbModalOptions);
		comp.specialityForm.markAsTouched();
		comp.specialityForm.markAsDirty();
		spyOn(canActivate_MockService, 'canDeactivate').and.returnValue(
			of({ status: true }).pipe(delay(1)),
		);
		comp.crossClose();
		fixture.detectChanges();
		expect(canActivate_MockService.canDeactivate).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.specialityForm.value).toEqual({
			available_specialties_id: null,
			description: null,
			id: null,
			is_create_appointment: null,
			name: null,
			over_booking: null,
			time_slot: null,
			visit_type_ids: null,
			qualifier: null,
			pre_defined_specialty: null
		});
		comp.modalRef.close();
	}));
	it('Should crossClose Test When Form not touched and dirty', fakeAsync(() => {
		comp.specialityForm = comp['fb'].group({
			id: null,
			name: ['', [Validators.required]],
			time_slot: ['', [Validators.required, Validators.min(5), Validators.max(comp.maxVal)]],
			over_booking: ['', [Validators.required, Validators.min(0), Validators.max(999)]],
			description: [''],
			available_specialties_id: [''],
			visit_type_ids: ['', Validators.required],
			is_create_appointment: ['0'],
			qualifier: '',
    		pre_defined_specialty: ''
		});
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('content', ngbModalOptions);
		comp.specialityForm.reset();
		comp.crossClose();
		fixture.detectChanges();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.specialityForm.value).toEqual({
			available_specialties_id: '',
			description: '',
			id: null,
			is_create_appointment: '0',
			name: '',
			over_booking: '',
			time_slot: '',
			visit_type_ids: '',
			qualifier: '',
    		pre_defined_specialty: ''
		});
		comp.modalRef.close();
	}));
	it('Should crossClose Test When Response Empty', fakeAsync(() => {
		comp.specialityForm = comp['fb'].group({
			id: null,
			name: ['', [Validators.required]],
			time_slot: ['', [Validators.required, Validators.min(5), Validators.max(comp.maxVal)]],
			over_booking: ['', [Validators.required, Validators.min(0), Validators.max(999)]],
			description: [''],
			available_specialties_id: [''],
			visit_type_ids: ['', Validators.required],
			is_create_appointment: ['0'],
		});
		comp.specialityForm.markAsTouched();
		comp.specialityForm.markAsDirty();
		spyOn(canActivate_MockService, 'canDeactivate').and.returnValue(of(null).pipe(delay(1)));
		let Result = comp.crossClose();
		fixture.detectChanges();
		expect(canActivate_MockService.canDeactivate).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(Result).toBeUndefined();
	}));
	it('Should pageLimit Test', () => {
		spyOn(comp, 'setPage');
		comp.pageLimit(3);
		expect(comp.page.size).toBe(3);
		expect(comp.setPage).toHaveBeenCalled();
	});
	it('Should onResetFilters Test', () => {
		comp.searchForm = comp['fb'].group({
			name: [''],
			time_slot: [''],
			over_booking: [''],
		});
		spyOn(comp, 'setPage');
		comp.onResetFilters();
		expect(comp.setPage).toHaveBeenCalled();
	});
	it('Should facilityMinus Test', () => {
		comp.facilityMinus();
		expect(comp.bools).toBeFalsy();
	});
	it('Should facilityPlus Test', () => {
		comp.facilityPlus();
		expect(comp.bools).toBeFalsy();
	});
	it('Should bulkDelete When Subscribe successfull', fakeAsync(() => {
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
			status:true
		};
		const ConfirmMockResult = {
			resolved:true
		}
		spyOn(comp['toastrService'],'success');
		spyOn(comp.selection,'clear');
		spyOn(comp,'getAvailableSpecialities');
		spyOn(confirm_MockService, 'create').and.returnValue(of(ConfirmMockResult).pipe(delay(1)));
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.bulkDelete();
		fixture.detectChanges();
		expect(confirm_MockService.create).toHaveBeenCalled();
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp['toastrService'].success).toHaveBeenCalled();
		expect(comp.selection.clear).toHaveBeenCalled();
		expect(comp.getAvailableSpecialities).toHaveBeenCalled();
	}));
	it('Should bulkDelete When confirm Subscribe UnSuccessfull', fakeAsync(() => {
	    spyOn(confirm_MockService, 'create').and.returnValue(throwError({error:{message:'error'}}));
		comp.bulkDelete();
	    expect(confirm_MockService.create).toHaveBeenCalled();
		flush();
	}));
	it('Should isAllSelectedLocations Test', () => {
		comp.selection.selected.length = 1;
		comp.specialities.push(2);
		let isAllLocations_Result = comp.isAllSelected();
		expect(isAllLocations_Result).toBe(true);
		expect(comp.totalRows).toBe(comp.selection.selected.length);
	});
	it('Should Test masterToggle when isSelected True', () => {
		// spyOn(comp, 'isAllSelected').and.returnValue(of(true));
		spyOn(comp['selection'], 'clear');
		comp.masterToggle(null);
		expect(comp.isAllSelected).toHaveBeenCalled();
		expect(comp['selection'].clear).toHaveBeenCalled();
	});
	it('Should Test masterToggle when isSelected False', () => {
		spyOn(comp, 'isAllSelected').and.returnValue(false);
		comp.totalRows = 5;
		comp.masterToggle(null);
		expect(comp.isAllSelected).toHaveBeenCalled();
	});

	it('Should caseStatusstringfy Test which return json stringify',()=>{
		const formValue: any = {
			comments: 'comments',
			description: 'description',
			name: 'name',
			status:true,
			result:[]
		};
		let JSON_String = comp.stringfy(formValue);
		expect(JSON_String).toEqual(JSON.stringify(formValue));
	});
	it('Should update When Subscribe successfull', fakeAsync(() => {
		const formValue: any = {
			result: {
				first_page_url: 'http://cm.ovadamd.org/api/facility_locations?page=1',
				from: 1,
				message:'Successfully',
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
			status:true
		};
		comp.specialityForm = comp['fb'].group({
			id: null,
			name: ['', [Validators.required]],
			time_slot: ['', [Validators.required, Validators.min(5), Validators.max(comp.maxVal)]],
			over_booking: ['', [Validators.required, Validators.min(0), Validators.max(999)]],
			description: [''],
			available_specialties_id: [''],
			visit_type_ids: ['', Validators.required],
			is_create_appointment: ['0'],
		});
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('content', ngbModalOptions);
		spyOn(comp['toastrService'],'success');
		spyOn(comp,'setPage');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.update({});
		fixture.detectChanges();
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp['toastrService'].success).toHaveBeenCalled();
		expect(comp.setPage).toHaveBeenCalled();
		expect(comp.isLoading).toBeFalsy();
		comp.modalRef.close();
	}));
	it('Should update Subscribe UnSuccessfull', fakeAsync(() => {
		spyOn(request_MockService, 'sendRequest').and.returnValue(throwError({error:{message:'error'}}));
		comp.update({});
	    expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp.isLoading).toBeFalsy();
		flush();
	}));
	it('Should openSpecialityForm Test When row null', fakeAsync(() => {
		comp.specialityForm = comp['fb'].group({
			id: null,
			name: ['', [Validators.required]],
			time_slot: ['', [Validators.required, Validators.min(5), Validators.max(comp.maxVal)]],
			over_booking: ['', [Validators.required, Validators.min(0), Validators.max(999)]],
			description: [''],
			available_specialties_id: [''],
			visit_type_ids: ['', Validators.required],
			is_create_appointment: ['0'],
		});
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('content', ngbModalOptions);
		spyOn(comp,'getAvailableSpecialities');
		comp.openSpecialityForm('content',null);
		expect(comp.hasId).toBeFalsy();
		expect(comp.getAvailableSpecialities).toHaveBeenCalled();
		flush();
		comp.modalRef.close();
	}));
	it('Should openSpecialityForm Test When row have value', fakeAsync(() => {
		comp.specialityForm = comp['fb'].group({
			id: null,
			name: ['', [Validators.required]],
			time_slot: ['', [Validators.required, Validators.min(5), Validators.max(comp.maxVal)]],
			over_booking: ['', [Validators.required, Validators.min(0), Validators.max(999)]],
			description: [''],
			available_specialties_id: [''],
			visit_type_ids: ['', Validators.required],
			is_create_appointment: ['0'],
		});
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('content', ngbModalOptions);
		spyOn(comp,'getAvailableSpecialities');
		comp.openSpecialityForm('content',{id:1,visit_type_ids:[],visit_types:[{id:9}]});
		expect(comp.hasId).toBeTruthy();
		expect(comp.getAvailableSpecialities).toHaveBeenCalled();
		flush();
		comp.modalRef.close();
	}));
	it('Should closeModal Test When Response have values', fakeAsync(() => {
		comp.specialityForm = comp['fb'].group({
			id: null,
			name: ['', [Validators.required]],
			time_slot: ['', [Validators.required, Validators.min(5), Validators.max(comp.maxVal)]],
			over_booking: ['', [Validators.required, Validators.min(0), Validators.max(999)]],
			description: [''],
			available_specialties_id: [''],
			visit_type_ids: ['', Validators.required],
			is_create_appointment: ['0'],
			qualifier: null,
    		pre_defined_specialty: null
		});
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('content', ngbModalOptions);
		comp.specialityForm.markAsTouched();
		comp.specialityForm.markAsDirty();
		spyOn(canActivate_MockService, 'canDeactivate').and.returnValue(
			of({ status: true }).pipe(delay(1)),
		);
		comp.closeModal();
		fixture.detectChanges();
		expect(canActivate_MockService.canDeactivate).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.specialityForm.value).toEqual({
			available_specialties_id: null,
			description: null,
			id: null,
			is_create_appointment: null,
			name: null,
			over_booking: null,
			time_slot: null,
			visit_type_ids: null,
			qualifier: null,
    		pre_defined_specialty: null
		});
		comp.modalRef.close();
	}));
	it('Should closeModal Test When Form not touched and dirty', fakeAsync(() => {
		comp.specialityForm = comp['fb'].group({
			id: null,
			name: ['', [Validators.required]],
			time_slot: ['', [Validators.required, Validators.min(5), Validators.max(comp.maxVal)]],
			over_booking: ['', [Validators.required, Validators.min(0), Validators.max(999)]],
			description: [''],
			available_specialties_id: [''],
			visit_type_ids: ['', Validators.required],
			is_create_appointment: ['0'],
			qualifier: '',
    		pre_defined_specialty: ''
		});
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('content', ngbModalOptions);
		comp.specialityForm.reset();
		comp.closeModal();
		fixture.detectChanges();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.specialityForm.value).toEqual({
			available_specialties_id: '',
			description: '',
			id: null,
			is_create_appointment: '0',
			name: '',
			over_booking: '',
			time_slot: '',
			visit_type_ids: '',
			qualifier: '',
    		pre_defined_specialty: ''
		});
		comp.modalRef.close();
	}));
	it('Should closeModal Test When Response Empty', fakeAsync(() => {
		comp.specialityForm = comp['fb'].group({
			id: null,
			name: ['', [Validators.required]],
			time_slot: ['', [Validators.required, Validators.min(5), Validators.max(comp.maxVal)]],
			over_booking: ['', [Validators.required, Validators.min(0), Validators.max(999)]],
			description: [''],
			available_specialties_id: [''],
			visit_type_ids: ['', Validators.required],
			is_create_appointment: ['0'],
		});
		comp.specialityForm.markAsTouched();
		comp.specialityForm.markAsDirty();
		spyOn(canActivate_MockService, 'canDeactivate').and.returnValue(of(null).pipe(delay(1)));
		let Result = comp.closeModal();
		fixture.detectChanges();
		expect(canActivate_MockService.canDeactivate).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(Result).toBeUndefined();
	}));
	it('Should onSubmit Test When specialityForm invalid', fakeAsync(() => {
		comp.specialityForm = comp['fb'].group({
			id: null,
			name: ['', [Validators.required]],
			time_slot: ['', [Validators.required, Validators.min(5), Validators.max(comp.maxVal)]],
			over_booking: ['', [Validators.required, Validators.min(0), Validators.max(999)]],
			description: [''],
			available_specialties_id: [''],
			visit_type_ids: ['', Validators.required],
			is_create_appointment: ['0'],
		});
		comp.searchForm = comp['fb'].group({
			name: [''],
			time_slot: [''],
			over_booking: ['']
		});
		comp.specialityForm.controls.name.setValue('mock name');
		 comp.onSubmit(comp.specialityForm.value);
		expect(comp.isLoading).toBeTruthy();
	}));
	it('Should onSubmit Test When specialityForm valid and form id null', fakeAsync(() => {
		comp.specialityForm = comp['fb'].group({
			id: null,
			name: ['', [Validators.required]],
			time_slot: ['', [Validators.required, Validators.min(5), Validators.max(comp.maxVal)]],
			over_booking: ['', [Validators.required, Validators.min(0), Validators.max(999)]],
			description: [''],
			available_specialties_id: [''],
			visit_type_ids: ['', Validators.required],
			is_create_appointment: ['0'],
		});
		comp.searchForm = comp['fb'].group({
			name: [''],
			time_slot: [''],
			over_booking: ['']
		});
		comp.specialityForm.controls.id.setValue(1);
		comp.specialityForm.controls.description.setValue('desc');
		comp.specialityForm.controls.available_specialties_id.setValue('available_specialties_id');
		comp.specialityForm.controls.name.setValue('mock name');
		comp.specialityForm.controls.time_slot.setValue(100);
		comp.specialityForm.controls.over_booking.setValue('10');
		comp.specialityForm.controls.visit_type_ids.setValue([{id:0}]);
		spyOn(comp,'add');
		 comp.onSubmit({id:null});
		expect(comp.add).toHaveBeenCalled();
		expect(comp.isLoading).toBeTruthy();
	}));
	it('Should onSubmit Test When specialityForm valid and form id values', fakeAsync(() => {
		comp.specialityForm = comp['fb'].group({
			id: null,
			name: ['', [Validators.required]],
			time_slot: ['', [Validators.required, Validators.min(5), Validators.max(comp.maxVal)]],
			over_booking: ['', [Validators.required, Validators.min(0), Validators.max(999)]],
			description: [''],
			available_specialties_id: [''],
			visit_type_ids: ['', Validators.required],
			is_create_appointment: ['0'],
		});
		comp.searchForm = comp['fb'].group({
			name: [''],
			time_slot: [''],
			over_booking: ['']
		});
		comp.specialityForm.controls.id.setValue(1);
		comp.specialityForm.controls.description.setValue('desc');
		comp.specialityForm.controls.available_specialties_id.setValue('available_specialties_id');
		comp.specialityForm.controls.name.setValue('mock name');
		comp.specialityForm.controls.time_slot.setValue(100);
		comp.specialityForm.controls.over_booking.setValue('10');
		comp.specialityForm.controls.visit_type_ids.setValue([{id:0}]);
		spyOn(comp,'update');
		 comp.onSubmit({id:25});
		expect(comp.update).toHaveBeenCalled();
		expect(comp.isLoading).toBeTruthy();
	}));
	it('Should onDelete When Subscribe successfull', fakeAsync(() => {
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
			status:true
		};
		const ConfirmMockResult = {
			resolved:true
		}
		spyOn(comp['toastrService'],'success');
		spyOn(comp,'setPage');
		spyOn(comp,'getAvailableSpecialities');
		spyOn(confirm_MockService, 'create').and.returnValue(of(ConfirmMockResult).pipe(delay(1)));
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.onDelete(0);
		fixture.detectChanges();
		expect(confirm_MockService.create).toHaveBeenCalled();
		// expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp['toastrService'].success).toHaveBeenCalled();
		expect(comp.setPage).toHaveBeenCalled();
		expect(comp.getAvailableSpecialities).toHaveBeenCalled();
	}));
	it('Should onDelete When confirm Subscribe UnSuccessfull', fakeAsync(() => {
	    spyOn(confirm_MockService, 'create').and.returnValue(throwError({error:{message:'error'}}));
		comp.onDelete(0);
	    expect(confirm_MockService.create).toHaveBeenCalled();
		flush();
	}));
	it('Should add When Subscribe successfull', fakeAsync(() => {
		const formValue: any = {
			result: {
				first_page_url: 'http://cm.ovadamd.org/api/facility_locations?page=1',
				from: 1,
				message:'Successfully',
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
			status:true
		};
		comp.specialityForm = comp['fb'].group({
			id: null,
			name: ['', [Validators.required]],
			time_slot: ['', [Validators.required, Validators.min(5), Validators.max(comp.maxVal)]],
			over_booking: ['', [Validators.required, Validators.min(0), Validators.max(999)]],
			description: [''],
			available_specialties_id: [''],
			visit_type_ids: ['', Validators.required],
			is_create_appointment: ['0'],
		});
		comp.specialityForm.controls.is_create_appointment.setValue(null);
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('content', ngbModalOptions);
		spyOn(comp['toastrService'],'success');
		spyOn(comp,'setPage');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.add({});
		fixture.detectChanges();
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp['toastrService'].success).toHaveBeenCalled();
		expect(comp.setPage).toHaveBeenCalled();
		expect(comp.isLoading).toBeFalsy();
		comp.modalRef.close();
	}));
	it('Should add Subscribe UnSuccessfull', fakeAsync(() => {
		comp.specialityForm = comp['fb'].group({
			id: null,
			name: ['', [Validators.required]],
			time_slot: ['', [Validators.required, Validators.min(5), Validators.max(comp.maxVal)]],
			over_booking: ['', [Validators.required, Validators.min(0), Validators.max(999)]],
			description: [''],
			available_specialties_id: [''],
			visit_type_ids: ['', Validators.required],
			is_create_appointment: ['0'],
		});
		spyOn(request_MockService, 'sendRequest').and.returnValue(throwError({error:{message:'error'}}));
		comp.add({});
	    expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp.isLoading).toBeFalsy();
		flush();
	}));
	afterAll(() => {
		TestBed.resetTestingModule();
	});
});
