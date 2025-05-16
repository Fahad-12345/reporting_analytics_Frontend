import { Logger } from '@nsalaun/ng-logger';
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
import { CanDeactiveMockService } from '@appDir/shared/mock-services/CanDeactiveModalMock.service';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { CaseTypeComponent } from './case.type.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
describe('CaseTypeComponent', () => {
	let comp: CaseTypeComponent;
	let fixture: ComponentFixture<CaseTypeComponent>;
	let request_MockService = new RequestMockService();
	let confirm_MockService = new ConfirmMockService();
	let canActivate_MockService = new CanDeactiveMockService();
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [CaseTypeComponent],
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
			],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(CaseTypeComponent);
		comp = fixture.componentInstance;
	});
	afterEach(() => {
		TestBed.resetTestingModule();
	});
	it('should be created', () => {
		expect(comp).toBeTruthy();
	});
	it('Should ngOnInit Test',()=>{
		spyOn(comp,'setTitle');
		spyOn(comp,'caseTypeSetPage');
		comp.ngOnInit();
		expect(comp.setTitle).toHaveBeenCalled();
		expect(comp.caseTypeSetPage).toHaveBeenCalled();
	});
	it('Should resetModel Test When Response have values', fakeAsync(() => {
		spyOn(comp,'resetData');
		spyOn(canActivate_MockService, 'canDeactivate').and.returnValue(
			of({ status: true }).pipe(delay(1)),
		);
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('content', ngbModalOptions);
		comp.caseTypeForm = comp['fb'].group({
			name: [''],
			remainder_days: [''],
			description: [''],
			comments: [''],
		});
		comp.caseTypeForm.markAsTouched();
		comp.caseTypeForm.markAsDirty();
		comp.resetModel();
		expect(canActivate_MockService.canDeactivate).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.resetData).toHaveBeenCalled();
		comp.modalRef.close();
	}));
	it('Should resetModel Test When Form not touched and dirty', fakeAsync(() => {
		spyOn(comp,'resetData');
		comp.caseTypeForm = comp['fb'].group({
			name: [''],
			remainder_days: [''],
			description: [''],
			comments: [''],
		});
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('content', ngbModalOptions);
		comp.caseTypeForm.reset();
		comp.resetModel();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.resetData).toHaveBeenCalled();
	}));
	it('Should resetModel Test When Response Empty', fakeAsync(() => {
		comp.caseTypeForm = comp['fb'].group({
			name: [''],
			remainder_days: [''],
			description: [''],
			comments: [''],
		});
		comp.caseTypeForm.markAsTouched();
		comp.caseTypeForm.markAsDirty();
		spyOn(canActivate_MockService, 'canDeactivate').and.returnValue(of(null).pipe(delay(1)));
		let Result = comp.resetModel();
		expect(canActivate_MockService.canDeactivate).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(Result).toBeUndefined();
	}));
	it('Should resetData Teset',()=>{
		spyOn(comp,'addUrlQueryParams');
		comp.caseTypeForm = comp['fb'].group({
			name: [''],
			remainder_days: [''],
			description: [''],
			comments: [''],
		});
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('content', ngbModalOptions);
		comp.resetData();
		expect(comp.addUrlQueryParams).toHaveBeenCalled();
		comp.modalRef.close();
	});
	it('Should caseTypestringfy Test which return json stringify',()=>{
		const formValue: any = {
			comments: 'comments',
			description: 'description',
			name: 'name',
			status:true,
			result:[]
		};
		let JSON_String = comp.caseTypestringfy(formValue);
		expect(JSON_String).toEqual(JSON.stringify(formValue));
	});
	it('Should initializeCaseTypeForm Test',()=>{
		let Result = comp.initializeCaseTypeForm();
		let Expected = {
			name: '',
			remainder_days: '',
			description: '',
			comments: '',
		}
		expect(Result.value).toEqual(Expected)
	});
	it('Should caseTypeReset Test',()=>{
		comp.searchCaseType = comp['fb'].group({
			name: [''],
			remainder_days: [''],
			description: [''],
			comments: [''],
		});
		spyOn(comp,'addUrlQueryParams');
		spyOn(comp,'caseTypeSetPage');
		spyOn(comp,'clearCaseTypeSelection');
		comp.caseTypeReset();
		expect(comp.addUrlQueryParams).toHaveBeenCalled();
		expect(comp.caseTypeSetPage).toHaveBeenCalled();
		expect(comp.clearCaseTypeSelection).toHaveBeenCalled();
	});
	it('Should isCaseTypeSelected Test', () => {
		comp.planTypeSelection.selected.length = 1;
		comp.caseTypeData.push(2);
		let isAllLocations_Result = comp.isCaseTypeSelected();
		expect(isAllLocations_Result).toBe(true);
		expect(comp.caseTypeTotalRows).toBe(comp.planTypeSelection.selected.length);
	});
	it('Should Test masterCaseTypeToggle when isSelected True', () => {
		// spyOn(comp, 'isCaseTypeSelected').and.returnValue(of(true));
		spyOn(comp['planTypeSelection'], 'clear');
		comp.masterCaseTypeToggle();
		expect(comp.isCaseTypeSelected).toHaveBeenCalled();
		expect(comp['planTypeSelection'].clear).toHaveBeenCalled();
	});
	it('Should Test masterCaseTypeToggle when isSelected False', () => {
		spyOn(comp, 'isCaseTypeSelected').and.returnValue(false);
		comp.caseTypeTotalRows = 5;
		comp.masterCaseTypeToggle();
		expect(comp.isCaseTypeSelected).toHaveBeenCalled();
	});
	it('Should Test casetypeOpenModel', () => {
		spyOn(comp, 'isCaseTypeSelected').and.returnValue(false);
		comp.caseTypeTotalRows = 5;
		comp.masterCaseTypeToggle();
		expect(comp.isCaseTypeSelected).toHaveBeenCalled();
	});
	it('Should Test casetypeOpenModel When Row not exists', () => {
		comp.casetypeOpenModel('caseTypeModel');
		expect(comp.title).toBe('Add');
		expect(comp.buttonTitle).toBe('Save & Continue');
	});
	it('Should Test casetypeOpenModel When Row not exists', () => {
		comp.caseTypeForm = comp['fb'].group({
			name: [''],
			remainder_days: [''],
			description: [''],
			comments: [''],
		});
		comp.caseTypeData.push({
			name:'mock name',
			comments:'mock comments',
			remainder_days:'mock remainder_days',
			description:'mock description',
		})
		comp.casetypeOpenModel('caseTypeModel',{id:1},0);
		expect(comp.title).toBe('Edit');
		expect(comp.buttonTitle).toBe('Update');
	});
	it('Should Test onCaseTypeSubmit function',()=>{
		spyOn(comp,'addCaseTypeSubmit');
		comp.title = 'Add';
		comp.onCaseTypeSubmit({});
		expect(comp.addCaseTypeSubmit).toHaveBeenCalled();
	});
	it('Should Test onCaseTypeSubmit function edit',()=>{
		spyOn(comp,'updateCaseTypeSubmit');
		comp.onCaseTypeSubmit({});
		expect(comp.updateCaseTypeSubmit).toHaveBeenCalled();
	});
	it('Should addCaseTypeSubmit When Subscribe successfull', fakeAsync(() => {
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
		comp.caseTypeForm = comp['fb'].group({
			name: [''],
			remainder_days: [''],
			description: [''],
			comments: [''],
		});
		spyOn(comp,'isCaseTypeSelected');
		spyOn(comp,'caseTypeReset');
		spyOn(comp,'caseTypeSetPage');
		spyOn(comp,'resetData');
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('content', ngbModalOptions);
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.addCaseTypeSubmit({});
		expect(comp.loadSpin).toBe(true);
		fixture.detectChanges();
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.loadSpin).toBeFalsy();
		expect(comp.isCaseTypeSelected).toHaveBeenCalled();
		expect(comp.caseTypeReset).toHaveBeenCalled();
		expect(comp.caseTypeSetPage).toHaveBeenCalled();
		expect(comp.resetData).toHaveBeenCalled();
		comp.modalRef.close();
	}));
	it('Should addCaseTypeSubmit When Subscribe UnSuccessfull', fakeAsync(() => {
		comp.caseTypeForm = comp['fb'].group({
			name: [''],
			remainder_days: [''],
			description: [''],
			comments: [''],
		});
		spyOn(request_MockService, 'sendRequest').and.returnValue(
			throwError({ error: { message: 'error' } }),
		);
		comp.addCaseTypeSubmit({});
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp.loadSpin).toBeFalsy();
		flush();
	}));
	it('Should updateCaseTypeSubmit When Subscribe successfull', fakeAsync(() => {
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
		comp.caseTypeForm = comp['fb'].group({
			name: [''],
			remainder_days: [''],
			description: [''],
			comments: [''],
		});
		spyOn(comp,'isCaseTypeSelected');
		spyOn(comp,'caseTypeReset');
		spyOn(comp,'caseTypeSetPage');
		spyOn(comp,'resetData');
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('content', ngbModalOptions);
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.updateCaseTypeSubmit({});
		expect(comp.loadSpin).toBe(true);
		fixture.detectChanges();
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.loadSpin).toBeFalsy();
		expect(comp.isCaseTypeSelected).toHaveBeenCalled();
		expect(comp.caseTypeReset).toHaveBeenCalled();
		expect(comp.caseTypeSetPage).toHaveBeenCalled();
		expect(comp.resetData).toHaveBeenCalled();
		comp.modalRef.close();
	}));
	it('Should updateCaseTypeSubmit When Subscribe UnSuccessfull', fakeAsync(() => {
		comp.caseTypeForm = comp['fb'].group({
			name: [''],
			remainder_days: [''],
			description: [''],
			comments: [''],
		});
		spyOn(request_MockService, 'sendRequest').and.returnValue(
			throwError({ error: { message: 'error' } }),
		);
		comp.updateCaseTypeSubmit({});
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp.loadSpin).toBeFalsy();
		flush();
	}));
	it('Should caseTypeSetPage Test',()=>{
		comp.searchCaseType = comp['fb'].group({
			name: [''],
			remainder_days: [''],
			description: [''],
			comments: [''],
		});
		spyOn(comp,'clearCaseTypeSelection');
		spyOn(comp,'addUrlQueryParams');
		spyOn(comp,'getCaseTypeListing');
		comp.caseTypeSetPage({offset:0});
		expect(comp.caseTypePage.pageNumber).toBe(0);
		expect(comp.clearCaseTypeSelection).toHaveBeenCalled();
		expect(comp.addUrlQueryParams).toHaveBeenCalled();
		expect(comp.getCaseTypeListing).toHaveBeenCalled();
	});
	it('Should addUrlQueryParams Test', () => {
		spyOn(comp['location'], 'replaceState');
		comp.addUrlQueryParams();
		expect(comp['location'].replaceState).toHaveBeenCalled();
	});
	it('Should getCaseTypeListing When Subscribe successfull', fakeAsync(() => {
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
		comp.getCaseTypeListing({});
		expect(comp.loadSpin).toBe(true);
		fixture.detectChanges();
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.loadSpin).toBeFalsy();
		expect(comp.caseTypePage.totalElements).toBe(10);
		expect(comp.caseTypeData).toEqual(formValue.result.data);
	}));
	it('Should getCaseTypeListing When Subscribe UnSuccessfull', fakeAsync(() => {
		spyOn(request_MockService, 'sendRequest').and.returnValue(
			throwError({ error: { message: 'error' } }),
		);
		comp.getCaseTypeListing({});
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp.loadSpin).toBeTruthy();
		flush();
	}));
	it('Shoul clearCaseTypeSelection Test',()=>{
		spyOn(comp.planTypeSelection,'clear');
		comp.clearCaseTypeSelection();
		expect(comp.planTypeSelection.clear).toHaveBeenCalled();
	});
	it('Shoul caseTypePageLimit Test',()=>{
		spyOn(comp,'caseTypeSetPage');
		comp.caseTypePageLimit(10);
		expect(comp.caseTypePage.size).toBe(10);
		expect(comp.caseTypeSetPage).toHaveBeenCalled();
	});
	it('Should checkInputs Test', () => {
		comp.searchCaseType = comp['fb'].group({
			name: [''],
			remainder_days: [''],
			description: [''],
			comments: [''],
		});
		let Result = comp.checkInputs();
		expect(Result).toBe(true);
	});
	it('Should checkInputs Test When searchCaseType have values', () => {
		comp.searchCaseType = comp['fb'].group({
			name: [''],
			remainder_days: [''],
			description: [''],
			comments: [''],
		});
		comp.searchCaseType.controls.name.setValue('Mock Name');
		let Result = comp.checkInputs();
		expect(Result).toBe(false);
	});
	afterAll(() => {
		TestBed.resetTestingModule();
	});
});
