import { Logger } from '@nsalaun/ng-logger';
import { Validators } from '@angular/forms';
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
import { ConfirmationService } from '@jaspero/ng-confirmations';
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
import { VisittypeComponent } from './visit.type.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
describe('VisittypeComponent', () => {
	let comp: VisittypeComponent;
	let fixture: ComponentFixture<VisittypeComponent>;
	let request_MockService = new RequestMockService();
	let confirm_MockService = new ConfirmMockService();
	let canActivate_MockService = new CanDeactiveMockService();
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [VisittypeComponent],
			imports: [SharedModule, RouterTestingModule, ToastrModule.forRoot(), BrowserAnimationsModule,HttpClientTestingModule ],
			schemas: [NO_ERRORS_SCHEMA],
			providers: [
				Config,
				LocalStorage,
				ToastrService,
				Logger,
				{ provide: RequestService, useValue: request_MockService },
				{ provide: ConfirmationService, useValue: confirm_MockService },
				{ provide: CanDeactivateModelComponentService, useValue: canActivate_MockService },
			],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(VisittypeComponent);
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
		spyOn(comp,'setPage');
		comp.ngOnInit();
		expect(comp.setTitle).toHaveBeenCalled();
		expect(comp.setPage).toHaveBeenCalled();
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
		comp.form = comp['fb'].group({
			name: [''],
			remainder_days: [''],
			description: [''],
			comments: [''],
		});
		comp.form.markAsTouched();
		comp.form.markAsDirty();
		comp.resetModel();
		expect(canActivate_MockService.canDeactivate).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.resetData).toHaveBeenCalled();
		comp.modalRef.close();
	}));
	it('Should resetModel Test When Form not touched and dirty', fakeAsync(() => {
		spyOn(comp,'resetData');
		comp.form = comp['fb'].group({
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
		comp.form.reset();
		comp.resetModel();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.resetData).toHaveBeenCalled();
	}));
	it('Should resetModel Test When Response Empty', fakeAsync(() => {
		comp.form = comp['fb'].group({
			name: [''],
			remainder_days: [''],
			description: [''],
			comments: [''],
		});
		comp.form.markAsTouched();
		comp.form.markAsDirty();
		spyOn(canActivate_MockService, 'canDeactivate').and.returnValue(of(null).pipe(delay(1)));
		let Result = comp.resetModel();
		expect(canActivate_MockService.canDeactivate).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(Result).toBeUndefined();
	}));
	it('Should resetData Teset',()=>{
		spyOn(comp,'addUrlQueryParams');
		comp.form = comp['fb'].group({
			id: [''],
			name: ['', [Validators.required]],
			description: [''],
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
	it('Should visitTypestringfy Test which return json stringify',()=>{
		const formValue: any = {
			comments: 'comments',
			description: 'description',
			name: 'name',
			status:true,
			result:[]
		};
		let JSON_String = comp.visitTypestringfy(formValue);
		expect(JSON_String).toEqual(JSON.stringify(formValue));
	});
	it('Should initializeVisitType Test',()=>{
		let Result = comp.initializeVisitType();
		let Expected = {
			description: "",
			name: "",
			cpt_codes_ids: null
		}
		expect(Result.value).toEqual(Expected)
	});
	it('Should searchFormReset Test',()=>{
		comp.searchForm = comp['fb'].group({
			name: [''],
			remainder_days: [''],
			description: [''],
			comments: [''],
		});
		spyOn(comp,'setPage');
		spyOn(comp,'clearSelection');
		comp.searchFormReset();
		expect(comp.setPage).toHaveBeenCalled();
		expect(comp.clearSelection).toHaveBeenCalled();
	});
	// it('Should isAllSelected Test', () => {
	// 	comp.VisitTypeSelection.selected.length = 1;
	// 	comp.visitingtypeData.push({id:1,name:'name',description:'description'});
	// 	let isAllLocations_Result = comp.isAllSelected();
	// 	expect(isAllLocations_Result).toBe(true);
	// 	expect(comp.visitingtypeTotalRows).toBe(comp.VisitTypeSelection.selected.length);
	// });
	it('Should Test masterToggle when isSelected True', () => {
		spyOn(comp, 'isAllSelected').and.returnValue(of(true));
		spyOn(comp['VisitTypeSelection'], 'clear');
		comp.masterToggle();
		expect(comp.isAllSelected).toHaveBeenCalled();
		expect(comp['VisitTypeSelection'].clear).toHaveBeenCalled();
	});
	it('Should Test masterToggle when isSelected False', () => {
		spyOn(comp, 'isAllSelected').and.returnValue(false);
		comp.visitingtypeTotalRows = 5;
		comp.masterToggle();
		expect(comp.isAllSelected).toHaveBeenCalled();
	});
	// it('Should Test casetypeOpenModel', () => {
	// 	spyOn(comp, 'isAllSelected').and.returnValue(false);
	// 	comp.visitingtypeTotalRows = 5;
	// 	comp.masterCaseTypeToggle();
	// 	expect(comp.isAllSelected).toHaveBeenCalled();
	// });
	it('Should Test openModel When Row not exists', () => {
		comp.form = comp['fb'].group({
			cpt_codes_ids:['']
		});
		comp.openModel('caseTypeModel');
		expect(comp.title).toBe('Add');
		expect(comp.buttonTitle).toBe('Save & Continue');
	});
	// it('Should Test openModel When Row exists', () => {
	// 	comp.visitingtypeData.push({
	// 		id: 0,
	// 		name: 'Mock name',
	// 		description: 'Mock description'
	// 	})
	// 	comp.form = comp['fb'].group({
	// 		name: [''],
	// 		remainder_days: [''],
	// 		description: [''],
	// 		comments: [''],
	// 	});
	// 	comp.openModel('caseTypeModel',{id:1},0);
	// 	expect(comp.title).toBe('Edit');
	// 	expect(comp.buttonTitle).toBe('Update');
	// });
	it('Should Test onSubmit function',()=>{
		spyOn(comp,'addForm');
		comp.title = 'Add';
		comp.onSubmit({});
		expect(comp.addForm).toHaveBeenCalled();
	});
	it('Should Test onSubmit function edit',()=>{
		spyOn(comp,'updateForm');
		comp.onSubmit({});
		expect(comp.updateForm).toHaveBeenCalled();
	});
	it('Should addForm When Subscribe successfull', fakeAsync(() => {
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
		comp.form = comp['fb'].group({
			id: [''],
			name: ['', [Validators.required]],
			description: [''],
		});
		comp.form.controls.name.setValue('mock name');
		spyOn(comp,'isAllSelected');
		spyOn(comp,'searchFormReset');
		spyOn(comp,'resetData');
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('content', ngbModalOptions);
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.addForm({});
		expect(comp.loadSpin).toBe(false);
		fixture.detectChanges();
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.loadSpin).toBeFalsy();
		expect(comp.isAllSelected).toHaveBeenCalled();
		expect(comp.searchFormReset).toHaveBeenCalled();
		expect(comp.resetData).toHaveBeenCalled();
		comp.modalRef.close();
	}));
	it('Should addForm When Subscribe UnSuccessfull', fakeAsync(() => {
		comp.form = comp['fb'].group({
			id: [''],
			name: ['', [Validators.required]],
			description: [''],
		});
		comp.form.controls.name.setValue('mock name');
		spyOn(request_MockService, 'sendRequest').and.returnValue(
			throwError({ error: { message: 'error' } }),
		);
		comp.addForm({});
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp.loadSpin).toBeFalsy();
		flush();
	}));
	it('Should updateForm When Subscribe successfull', fakeAsync(() => {
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
		comp.form = comp['fb'].group({
			name: [''],
			remainder_days: [''],
			description: [''],
			comments: [''],
		});
		spyOn(comp,'isAllSelected');
		spyOn(comp,'searchFormReset');
		spyOn(comp,'setPage');
		spyOn(comp,'resetData');
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('content', ngbModalOptions);
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.updateForm({});
		expect(comp.loadSpin).toBe(false);
		fixture.detectChanges();
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.loadSpin).toBeFalsy();
		expect(comp.isAllSelected).toHaveBeenCalled();
		expect(comp.searchFormReset).toHaveBeenCalled();
		expect(comp.setPage).toHaveBeenCalled();
		expect(comp.resetData).toHaveBeenCalled();
		comp.modalRef.close();
	}));
	it('Should updateForm When Subscribe UnSuccessfull', fakeAsync(() => {
		spyOn(request_MockService, 'sendRequest').and.returnValue(
			throwError({ error: { message: 'error' } }),
		);
		comp.updateForm({});
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp.loadSpin).toBeFalsy();
		flush();
	}));
	it('Should setPage Test',()=>{
		comp.searchForm = comp['fb'].group({
			name: [''],
			remainder_days: [''],
			description: [''],
			comments: [''],
		});
		spyOn(comp,'clearSelection');
		spyOn(comp,'addUrlQueryParams');
		spyOn(comp,'getVisitTypeListing');
		comp.setPage({offset:0});
		expect(comp.page.pageNumber).toBe(0);
		expect(comp.clearSelection).toHaveBeenCalled();
		expect(comp.addUrlQueryParams).toHaveBeenCalled();
		expect(comp.getVisitTypeListing).toHaveBeenCalled();
	});
	it('Should addUrlQueryParams Test', () => {
		spyOn(comp['location'], 'replaceState');
		comp.addUrlQueryParams();
		expect(comp['location'].replaceState).toHaveBeenCalled();
	});
	it('Should getVisitTypeListing When Subscribe successfull', fakeAsync(() => {
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
		comp.getVisitTypeListing({});
		expect(comp.loadSpin).toBe(true);
		fixture.detectChanges();
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.loadSpin).toBeFalsy();
		expect(comp.page.totalElements).toBe(10);
		expect(comp.visitingtypeData).toEqual(formValue.result.data);
	}));
	it('Should getVisitTypeListing When Subscribe UnSuccessfull', fakeAsync(() => {
		spyOn(request_MockService, 'sendRequest').and.returnValue(
			throwError({ error: { message: 'error' } }),
		);
		comp.getVisitTypeListing({});
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp.loadSpin).toBeTruthy();
		flush();
	}));
	it('Shoul clearSelection Test',()=>{
		spyOn(comp.VisitTypeSelection,'clear');
		comp.clearSelection();
		expect(comp.VisitTypeSelection.clear).toHaveBeenCalled();
	});
	it('Shoul pageLimit Test',()=>{
		spyOn(comp,'setPage');
		comp.pageLimit(10);
		expect(comp.page.size).toBe(10);
		expect(comp.setPage).toHaveBeenCalled();
	});
	it('Should checkInputs Test', () => {
		comp.searchForm = comp['fb'].group({
			name: [''],
			remainder_days: [''],
			description: [''],
			comments: [''],
		});
		let Result = comp.checkInputs();
		expect(Result).toBe(true);
	});
	it('Should checkInputs Test When searchForm have values', () => {
		comp.searchForm = comp['fb'].group({
			name: [''],
			remainder_days: [''],
			description: [''],
			comments: [''],
		});
		comp.searchForm.controls.name.setValue('Mock Name');
		let Result = comp.checkInputs();
		expect(Result).toBe(false);
	});
	afterAll(() => {
		TestBed.resetTestingModule();
	});
});
