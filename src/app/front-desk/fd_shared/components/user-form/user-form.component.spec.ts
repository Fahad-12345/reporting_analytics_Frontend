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
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Config } from '@appDir/config/config';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { SharedModule } from '@appDir/shared/shared.module';
import { ConfirmationService } from '@jaspero/ng-confirmations';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { RequestMockService } from '@appDir/shared/mock-services/RequestMock.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { delay } from 'rxjs/operators';
import { ConfirmMockService } from '@appDir/shared/mock-services/ConfirmMock.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CanDeactiveMockService } from '@appDir/shared/mock-services/CanDeactiveModalMock.service';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { UserFormComponent } from './user-form.component';
import { Logger } from '@nsalaun/ng-logger';
import { AlertsService } from '@jaspero/ng-alerts';
import { NgxMaskModule } from 'ngx-mask';
import { Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MockActivatedRoute } from '@appDir/shared/mock-services/ActivatedMockRoute.service';
import { DocumentManagerMockService } from '@appDir/shared/mock-services/DocumentManagerMock.services';
import { DocumentManagerServiceService } from '@appDir/front-desk/documents/services/document-manager-service.service';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { whitespaceFormValidation } from '@appDir/shared/utils/utils.helpers';
import { HttpClientTestingModule } from '@angular/common/http/testing';
describe('UserFormComponent', () => {
	let comp: UserFormComponent;
	let fixture: ComponentFixture<UserFormComponent>;
	let request_MockService = new RequestMockService();
	let confirm_MockService = new ConfirmMockService();
	let canActivate_MockService = new CanDeactiveMockService();
	let logger_MockService = new LoggerMockService();
	let fd_MockService = new FDMockService();
	let routeActivated_MockService = new MockActivatedRoute();
	let documentManager_MockService = new DocumentManagerMockService();
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [UserFormComponent],
			imports: [
				SharedModule,
				RouterTestingModule,
				ToastrModule.forRoot(),
				BrowserAnimationsModule,
				NgxMaskModule.forRoot(),
				HttpClientTestingModule
			],
			schemas: [NO_ERRORS_SCHEMA],
			providers: [
				Config,
				LocalStorage,
				ToastrService,
				AlertsService,
				{ provide: RequestService, useValue: request_MockService },
				{ provide: ConfirmationService, useValue: confirm_MockService },
				{ provide: CanDeactivateModelComponentService, useValue: canActivate_MockService },
				{ provide: FDServices, useValue: fd_MockService },
				{ provide: Logger, useValue: logger_MockService },
				{
					provide: ActivatedRoute,
					useValue: {
						parent: { snapshot: { params: of({ id: 123 }) } },
						snapshot: {
							params: of({ id: 123 }),
						},
					},
				},
				{ provide: DocumentManagerServiceService, useValue: documentManager_MockService },
			],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(UserFormComponent);
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
		};
	}
	function createFormNew() {
		comp.form = comp['fb'].group({
			id: '',
			first_name: ['', [Validators.required, whitespaceFormValidation()]],
			city: [''],
			zip: ['', Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$')],
			social_security: [''],
			middle_name: [''],
			last_name: ['', [Validators.required, whitespaceFormValidation()]],
			date_of_birth: [''],
			gender: ['', [Validators.required]],
			title: [''],
			cell_no: [''],
			address: [''],
			apartment_suite: [''],
			work_phone: [''],
			home_phone: [''],
			fax: [''],
			extension: [''],
			employed_by_id: [''],
			emergency_phone: [''],
			emergency_name: [''],
			designation_id: [''],
			department_id: [''],
			role_id: ['', Validators.required],
			employment_type_id: [''],
			biography: [''],
			hiring_date: [''],
			from: [''],
			to: [''],
			primary_facility_id: ['', Validators.required],
			affiliated_facility_ids: [0],
			email: [
				null,
				[
					Validators.required,
					Validators.pattern(
						/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
					),
				],
			],
			state: [''],
		});
	}
	function UserRelatedData() {
		comp.userRelatedData = {
			UserProfileData: {
				address: null,
				affiliated_facility_ids: [],
				apartment_suite: null,
				area_id: null,
				billing_title: 'MD',
				biography: null,
				cell_no: null,
				city: null,
				created_at: '2021-07-23 12:57:07',
				created_by: 1,
				created_by_name: 'Super Admin',
				date_of_birth: null,
				deleted_at: null,
				department_id: null,
				designation_id: null,
				email: 'acu@dev.com',
				emergency_name: null,
				emergency_phone: null,
				employed_by_id: null,
				employment_type_id: null,
				extension: null,
				fax: null,
				file_id: null,
				first_name: 'ACU',
				from: null,
				gender: 'M',
				hiring_date: null,
				home_phone: null,
				id: 18,
				last_name: 'User',
				middle_name: 'Dev',
				primary_facility_id: 6,
				profile_pic: null,
				profile_pic_url: null,
				role_id: 10,
				social_security: null,
				state: null,
				status: 1,
				title: 'Mrs.',
				to: null,
				updated_at: '2021-07-23 12:57:12',
				updated_by: 1,
				user_timings: [
					{
						created_at: '2021-07-23 13:14:07',
						created_by: 1,
						day_id: 0,
						deleted_at: null,
						end_time: '18:30:00',
						end_time_isb: '23:30:00',
						facility_location_id: 6,
						id: 124,
						start_time: '03:00:00',
						start_time_isb: '08:00:00',
						time_zone: -300,
						time_zone_string: 'Asia/Karachi',
						updated_at: '2021-07-23 13:14:07',
						updated_by: 1,
						user_id: 18,
					},
				],
			},
			practicesDropDownData: [
				{ id: 0, timing: '200', facility_full_name: 'facility_full_name' },
				{ id: 1, timing: '200', facility_full_name: 'facility_full_name' },
			],
			employedByDropDownData: [],
			designationDropDownData: [],
			departmentDropDownData: [{ name: 'Mock deparmtment' }],
			employmentTypeDropDownData: [],
			rolesData: [{ name: 'Mock Name' }, { name: 'Mock Name' }],
		};
	}
	function setAllFormFiels() {
		comp.form.controls.id.setValue(10);
		comp.form.controls.first_name.setValue('Fahad');
		comp.form.controls.city.setValue('city');
		comp.form.controls.zip.setValue('45454');
		comp.form.controls.social_security.setValue('social_security');
		comp.form.controls.middle_name.setValue('middle_name');
		comp.form.controls.last_name.setValue('last_name');
		comp.form.controls.date_of_birth.setValue('date_of_birth');
		comp.form.controls.gender.setValue('gender');
		comp.form.controls.title.setValue('title');
		comp.form.controls.cell_no.setValue('cell_no');
		comp.form.controls.address.setValue('address');
		comp.form.controls.apartment_suite.setValue('apartment_suite');
		comp.form.controls.work_phone.setValue('work_phone');
		comp.form.controls.extension.setValue('extension');
		comp.form.controls.employed_by_id.setValue('employed_by_id');
		comp.form.controls.emergency_phone.setValue('emergency_phone');
		comp.form.controls.emergency_name.setValue('emergency_name');
		comp.form.controls.designation_id.setValue('2');
		comp.form.controls.department_id.setValue('2');
		comp.form.controls.role_id.setValue('2');
		comp.form.controls.role_id.setValue('2');
		comp.form.controls.employment_type_id.setValue('2');
		comp.form.controls.biography.setValue('biography');
		comp.form.controls.hiring_date.setValue('2021');
		comp.form.controls.from.setValue('2021');
		comp.form.controls.to.setValue('2021');
		comp.form.controls.primary_facility_id.setValue('45');
		comp.form.controls.affiliated_facility_ids.setValue([45]);
		comp.form.controls.email.setValue('ovada@gmail.com');
		comp.form.controls.state.setValue('PAK');
	}
	it('should be created', () => {
		expect(comp).toBeTruthy();
	});
	it('Should getNewChildValues Test', () => {
		let result = comp.getNewChildValues();
		expect(result.isValid).toBe(true);
		expect(result.selectedTimings.length).toBe(0);
		expect(result.timeRange.length).toBe(0);
	});
	it('Should checkTimes Test', () => {
		let result = comp.checkTimes();
		expect(result).toBe(true);
	});
	it('Should ngOnChanges Test', () => {
		createFormNew();
		UserRelatedData();
		spyOn(comp.form, 'patchValue');
		spyOn(comp, 'onPrimaryPracticeChange');
		spyOn(comp, 'selectAffiliatedPracticesInDropDown');
		spyOn(comp, 'isSameLoginUser');
		spyOn(comp, 'setValuesInShareableComp');
		comp.ngOnChanges({});
		
		expect(comp.form.patchValue).toHaveBeenCalled();
		expect(comp.onPrimaryPracticeChange).toHaveBeenCalled();
		expect(comp.selectAffiliatedPracticesInDropDown).toHaveBeenCalled();
		expect(comp.setValuesInShareableComp).toHaveBeenCalled();
	});
	it('Should setValuesInShareableComp Test', () => {
		createFormNew();
		UserRelatedData();
		comp.setValuesInShareableComp();
		
		expect(comp.employementTypeId['lists'].length).toBe(0);
		expect(comp.designation['lists'].length).toBe(0);
		expect(comp.employedBy['lists'].length).toBe(0);
	});
	it('Should selectAffiliatedPracticesInDropDown Test', () => {
		createFormNew();
		UserRelatedData();
		comp.form.controls.affiliated_facility_ids.setValue([10]);
		spyOn(comp.form, 'markAsPristine');
		spyOn(comp.form, 'markAsUntouched');
		comp.selectAffiliatedPracticesInDropDown(true);
		
		expect(comp.form.markAsPristine).toHaveBeenCalled();
		expect(comp.form.markAsUntouched).toHaveBeenCalled();
	});
	// fit('Should onPrimaryPracticeChange Test', () => {
	// 	createFormNew();
	// 	UserRelatedData();
	// 	
	// 	spyOn(comp,'selectAffiliatedPracticesInDropDown');
	// 	comp.onPrimaryPracticeChange(1,true,{selectedIndex:1});
	// 	
	// 	expect(comp.affiliatedPracticesDropdown.data).toEqual([]);
	// 	expect(comp.selectAffiliatedPracticesInDropDown).toHaveBeenCalled();
	// });
	it('Should setForm Test', () => {
		createFormNew();
		comp.setForm();
		
		expect(comp.form.value).toEqual({
			address: '',
			affiliated_facility_ids: null,
			apartment_suite: '',
			biography: '',
			cell_no: '',
			city: '',
			date_of_birth: '',
			department_id: '',
			designation_id: '',
			email: null,
			emergency_name: '',
			emergency_phone: '',
			employed_by_id: '',
			employment_type_id: '',
			extension: '',
			fax: '',
			first_name: '',
			from: '',
			gender: '',
			hiring_date: '',
			home_phone: '',
			id: '',
			last_name: '',
			middle_name: '',
			primary_facility_id: '',
			role_id: '',
			social_security: '',
			state: '',
			title: '',
			to: '',
			work_phone: '',
			zip: '',
		});
	});
	it('Should onSubmit Test', () => {
		createFormNew();
		setAllFormFiels();
		comp.onSubmit({
			sfolderId: 10,
			parentId: 10,
			fileTitle: 'fileTitle',
			ext: '2010',
			tags: [],
			file: 'file_name',
		});
		expect(comp.form.valid).toBeTruthy();
	});
	it('Should getAddress Test', () => {
		let ReturnValue = comp.getAddress('MockString');
		
		expect(ReturnValue).toMatch('MockString, ');
	});
	it('Should handleReaderLoaded When Subscribe successfull If responce true', fakeAsync(() => {
		let Given_Responce = {
			status: true,
			message: 'Users List',
			data: [
				{
					id: 180,
					email: 'a@test.com',
					status: 0,
					created_at: '2021-03-16 14:24:15',
					created_by: 1,
					first_name: 'aaa',
					middle_name: null,
					last_name: 'bbbb',
					date_of_birth: null,
					role_id: 14,
					role_name: 'Guest',
					medical_identifier: 0,
					created_by_name: 'Super Admin',
					billing_title: 'billing Title name 16161',
				},
				{
					id: 222,
					email: 'abdullahbutt@ovada.com',
					status: 1,
					created_at: '2021-06-02 10:09:22',
					created_by: 1,
					first_name: 'Abdullah',
					middle_name: null,
					last_name: 'Butt',
					date_of_birth: null,
					role_id: 17,
					role_name: 'Provider',
					medical_identifier: 1,
					created_by_name: 'Super Admin',
					billing_title: 'MD',
				},
			],
			result: {
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
		comp['documents'] = [{ file: 'File' }, { file: 'File' }];
		comp['imageIndex'] = 0;
		comp.newUserId = null;
		spyOn(fd_MockService, 'uploadUserDocument').and.returnValue(of(Given_Responce).pipe(delay(1)));
		comp.handleReaderLoaded({ target: { result: 'ImgSrc' } });
		expect(fd_MockService.uploadUserDocument).toHaveBeenCalled();
		
		expect(comp.isUploading).toBe(true);
		tick(15000);
		discardPeriodicTasks();
		
		expect(comp.documentsShown).toEqual(Given_Responce.data);
		expect(comp.isUploading).toBe(false);
		expect(comp['imageIndex']).toBe(0);
		expect(comp['documents'].length).toBe(0);
	}));
	it('Should handleReaderLoaded When Subscribe successfull If respnce false', fakeAsync(() => {
		let Given_Responce = {
			status: false,
			message: 'Users List',
			data: [
				{
					id: 180,
					email: 'a@test.com',
					status: 0,
					created_at: '2021-03-16 14:24:15',
					created_by: 1,
					first_name: 'aaa',
					middle_name: null,
					last_name: 'bbbb',
					date_of_birth: null,
					role_id: 14,
					role_name: 'Guest',
					medical_identifier: 0,
					created_by_name: 'Super Admin',
					billing_title: 'billing Title name 16161',
				},
				{
					id: 222,
					email: 'abdullahbutt@ovada.com',
					status: 1,
					created_at: '2021-06-02 10:09:22',
					created_by: 1,
					first_name: 'Abdullah',
					middle_name: null,
					last_name: 'Butt',
					date_of_birth: null,
					role_id: 17,
					role_name: 'Provider',
					medical_identifier: 1,
					created_by_name: 'Super Admin',
					billing_title: 'MD',
				},
			],
			result: {
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
		
		comp['documents'] = [{ file: 'File' }, { file: 'File' }];
		comp['imageIndex'] = 0;
		comp.newUserId = null;
		spyOn(comp['toastrService'], 'error');
		spyOn(fd_MockService, 'uploadUserDocument').and.returnValue(of(Given_Responce).pipe(delay(1)));
		comp.handleReaderLoaded({ target: { result: 'ImgSrc' } });
		expect(fd_MockService.uploadUserDocument).toHaveBeenCalled();
		
		expect(comp.isUploading).toBe(true);
		tick(15000);
		discardPeriodicTasks();
		
		expect(comp['toastrService'].error).toHaveBeenCalled();
		expect(comp['imageIndex']).toBe(0);
		expect(comp['documents'].length).toBe(0);
	}));
	// fit('Should formatFile Test If fileEntry.isFile & isimage True', () => {
	// 	comp['formatFile']({fileEntry:{isFile:true,file: function () {
	// 		return true;
	// 	}}},true);
	// 	
	// 	expect(comp['documents'].length).toBe(0);
	// });
	// fit('Should formatFile Test If fileEntry.isFile & isimage False', () => {
	// 	comp['formatFile']({fileEntry:{isFile:true}},false);
	// 	
	// 	expect(comp['documents'].length).toBe(0);
	// });
	// fit('Should formatFile Test If fileEntry.isFile False', () => {
	// 	comp['formatFile']({fileEntry:{isFile:false}},false);
	// 	
	// 	expect(comp['documents']).toBeUndefined();
	// });
	it('Should dropped Test If isImage True & files less than 2', () => {
		let event = {
			files: [
				{
					relativePath: 'Screenshot (8).png',
					fileEntry: { name: 'Screenshot (8).png', isDirectory: false, isFile: true },
				},
			],
		};
		spyOn<any>(comp, 'formatFile');
		comp.dropped(event, true);
		
		expect(comp['formatFile']).toHaveBeenCalled();
		expect(comp.showingFiles).toBeTruthy();
	});
	it('Should dropped Test If isImage False', () => {
		let event = {
			files: [
				{
					relativePath: 'Screenshot (8).png',
					fileEntry: { name: 'Screenshot (8).png', isDirectory: false, isFile: true },
				},
			],
		};
		spyOn<any>(comp, 'formatFile');
		comp.dropped(event, false);
		
		expect(comp['formatFile']).toHaveBeenCalled();
	});
	it('Should droppedImageProfile Test If isImage True & files less than 2', () => {
		let event = {
			files: [
				{
					relativePath: 'Screenshot (8).png',
					fileEntry: { name: 'Screenshot (8).png', isDirectory: false, isFile: true },
				},
			],
		};
		spyOn<any>(comp, 'formatFile');
		comp.droppedImageProfile(event, true);
		
		expect(comp['formatFile']).toHaveBeenCalled();
	});
	it('Should droppedImageProfile Test If isImage False', () => {
		let event = {
			files: [
				{
					relativePath: 'Screenshot (8).png',
					fileEntry: { name: 'Screenshot (8).png', isDirectory: false, isFile: true },
				},
			],
		};
		spyOn<any>(comp, 'formatFileImage');
		comp.droppedImageProfile(event, false);
		
		expect(comp['formatFileImage']).toHaveBeenCalled();
	});
	it('Should addUser When Subscribe successfull ', fakeAsync(() => {
		let Given_Responce = {
			status: true,
			message: 'Users List',
			data: [
				{
					id: 180,
					email: 'a@test.com',
					status: 0,
					created_at: '2021-03-16 14:24:15',
					created_by: 1,
					first_name: 'aaa',
					middle_name: null,
					last_name: 'bbbb',
					date_of_birth: null,
					role_id: 14,
					role_name: 'Guest',
					medical_identifier: 0,
					created_by_name: 'Super Admin',
					billing_title: 'billing Title name 16161',
				},
				{
					id: 222,
					email: 'abdullahbutt@ovada.com',
					status: 1,
					created_at: '2021-06-02 10:09:22',
					created_by: 1,
					first_name: 'Abdullah',
					middle_name: null,
					last_name: 'Butt',
					date_of_birth: null,
					role_id: 17,
					role_name: 'Provider',
					medical_identifier: 1,
					created_by_name: 'Super Admin',
					billing_title: 'MD',
				},
			],
			result: {
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
		spyOn(comp['_alert'], 'create');
		spyOn(comp['router'], 'navigate');
		spyOn(fd_MockService, 'addUser').and.returnValue(of(Given_Responce).pipe(delay(1)));
		comp.addUser({});
		expect(fd_MockService.addUser).toHaveBeenCalled();
		
		tick(15000);
		discardPeriodicTasks();
		
		expect(comp['_alert'].create).toHaveBeenCalled();
		expect(comp['router'].navigate).toHaveBeenCalled();
	}));
	it('Should getAllDesignations When Subscribe successfull ', fakeAsync(() => {
		let Given_Responce = {
			status: true,
			message: 'Users List',
			result: {
				data: [
					{
						id: 180,
						email: 'a@test.com',
						status: 0,
						created_at: '2021-03-16 14:24:15',
						created_by: 1,
						first_name: 'aaa',
						middle_name: null,
						last_name: 'bbbb',
						date_of_birth: null,
						role_id: 14,
						role_name: 'Guest',
						medical_identifier: 0,
						created_by_name: 'Super Admin',
						billing_title: 'billing Title name 16161',
					},
					{
						id: 222,
						email: 'abdullahbutt@ovada.com',
						status: 1,
						created_at: '2021-06-02 10:09:22',
						created_by: 1,
						first_name: 'Abdullah',
						middle_name: null,
						last_name: 'Butt',
						date_of_birth: null,
						role_id: 17,
						role_name: 'Provider',
						medical_identifier: 1,
						created_by_name: 'Super Admin',
						billing_title: 'MD',
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
		comp.getAllDesignations();
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		
		tick(15000);
		discardPeriodicTasks();
		
		expect(comp.designations).toEqual(Given_Responce.result.data);
	}));
	it('Should getAllDepartments When Subscribe successfull ', fakeAsync(() => {
		let Given_Responce = {
			status: true,
			message: 'Users List',
			result: {
				data: [
					{
						id: 180,
						email: 'a@test.com',
						status: 0,
						created_at: '2021-03-16 14:24:15',
						created_by: 1,
						first_name: 'aaa',
						middle_name: null,
						last_name: 'bbbb',
						date_of_birth: null,
						role_id: 14,
						role_name: 'Guest',
						medical_identifier: 0,
						created_by_name: 'Super Admin',
						billing_title: 'billing Title name 16161',
					},
					{
						id: 222,
						email: 'abdullahbutt@ovada.com',
						status: 1,
						created_at: '2021-06-02 10:09:22',
						created_by: 1,
						first_name: 'Abdullah',
						middle_name: null,
						last_name: 'Butt',
						date_of_birth: null,
						role_id: 17,
						role_name: 'Provider',
						medical_identifier: 1,
						created_by_name: 'Super Admin',
						billing_title: 'MD',
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
		comp.getAllDepartments();
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		
		tick(15000);
		discardPeriodicTasks();
		
		expect(comp.departments).toEqual(Given_Responce.result.data);
	}));
	it('Should getAllEmploymentTypes When Subscribe successfull ', fakeAsync(() => {
		let Given_Responce = {
			status: true,
			message: 'Users List',
			result: {
				data: [
					{
						id: 180,
						email: 'a@test.com',
						status: 0,
						created_at: '2021-03-16 14:24:15',
						created_by: 1,
						first_name: 'aaa',
						middle_name: null,
						last_name: 'bbbb',
						date_of_birth: null,
						role_id: 14,
						role_name: 'Guest',
						medical_identifier: 0,
						created_by_name: 'Super Admin',
						billing_title: 'billing Title name 16161',
					},
					{
						id: 222,
						email: 'abdullahbutt@ovada.com',
						status: 1,
						created_at: '2021-06-02 10:09:22',
						created_by: 1,
						first_name: 'Abdullah',
						middle_name: null,
						last_name: 'Butt',
						date_of_birth: null,
						role_id: 17,
						role_name: 'Provider',
						medical_identifier: 1,
						created_by_name: 'Super Admin',
						billing_title: 'MD',
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
		comp.getAllEmploymentTypes();
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		
		tick(15000);
		discardPeriodicTasks();
		
		expect(comp.allEmploymentTypes).toEqual(Given_Responce.result.data);
	}));
	it('Should touchAllFields Test', () => {
		createFormNew();
		setAllFormFiels();
		spyOn(comp.form, 'markAsTouched');
		comp.touchAllFields();
		
		expect(comp.form.touched).toBeFalsy();
	});
	it('Should onRoleChange Test', () => {
		UserRelatedData();
		comp.onRoleChange({ target: { value: 10 } }, { selectedIndex: 1 });
		
		expect(comp.selectedRole).toMatch('Mock Name');
	});
	it('Should createTimingObj Test', () => {
		let result = comp.createTimingObj();
		
		expect(result.length).toBe(0);
	});
	it('Should submitForm Test', () => {
		createFormNew();
		setAllFormFiels();
		spyOn(comp.userFormSubmit, 'emit');
		comp.submitForm();
		
		expect(comp.userFormSubmit.emit).toHaveBeenCalled();
	});
	it('Should submitForm Test When Nan true', () => {
		createFormNew();
		setAllFormFiels();
		comp.form.controls.affiliated_facility_ids.setValue(['mock']);
		spyOn(comp.userFormSubmit, 'emit');
		comp.submitForm();
		
		expect(comp.userFormSubmit.emit).toHaveBeenCalled();
	});
	it('Should isChildValuesValid Test', () => {
		let result = comp.isChildValuesValid();
		
		expect(result).toBe(true);
	});
	// fit('Should goBack Test',()=>{
	// 	spyOn(comp['router'],'navigate');
	// 	comp.goBack();
	// 	expect(comp['router'].navigate).toHaveBeenCalled();
	// });
	it('Should handleAddressChange test', () => {
		createFormNew();
		spyOn(comp.form, 'patchValue');
		let address: any = address_Data();

		comp.handleAddressChange(address);
		expect(comp.form.patchValue).toHaveBeenCalled();
	});
	// fit('Should showMedia Test If fileExtension pdf',()=>{
	// 	
	// 	comp.showMedia('pdf.pdf.pdf');
	// 	comp['PDFObject'] =
	// 	{
	// 		embed: function (){
	// 			return true
	// 		}
	// 	}
	// 	fixture.detectChanges();
	// 	expect(comp.fileExtension).toBe('pdf');
	// 	expect(comp.imageSourceLink).toBe(null);
	// 	expect(comp.pdfSourceLink).toBe('pdf.pdf.pdf');
	// });
	it('Should showMedia Test', () => {
		
		comp.showMedia('jpg');
		
		expect(comp.imageSourceLink).toBe('jpg');
		expect(comp.pdfSourceLink).toBe(null);
	});
	it('Should showFilePreview Test', () => {
		
		spyOn(comp, 'showMedia');
		comp.fileExtension = 'pdf';
		comp.showFilePreview('jpg');
		
		expect(comp.fileExtension).toBe('pdf');
		expect(comp.showMedia).toHaveBeenCalled();
	});
	it('Should employedByGet When Subscribe successfull ', fakeAsync(() => {
		let Given_Responce = {
			status: true,
			message: 'Users List',
			result: {
				data: [
					{
						id: 180,
						email: 'a@test.com',
						status: 0,
						created_at: '2021-03-16 14:24:15',
						created_by: 1,
						first_name: 'aaa',
						middle_name: null,
						last_name: 'bbbb',
						date_of_birth: null,
						role_id: 14,
						role_name: 'Guest',
						medical_identifier: 0,
						created_by_name: 'Super Admin',
						billing_title: 'billing Title name 16161',
					},
					{
						id: 222,
						email: 'abdullahbutt@ovada.com',
						status: 1,
						created_at: '2021-06-02 10:09:22',
						created_by: 1,
						first_name: 'Abdullah',
						middle_name: null,
						last_name: 'Butt',
						date_of_birth: null,
						role_id: 17,
						role_name: 'Provider',
						medical_identifier: 1,
						created_by_name: 'Super Admin',
						billing_title: 'MD',
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
		comp.employedByGet();
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		
		tick(15000);
		discardPeriodicTasks();
		
		expect(comp.employedBY).toEqual(Given_Responce.result.data);
	}));
	it('Should addTagModal Test', () => {
		spyOn(comp['modalService'], 'open');
		comp.addTagModal('content', { id: 0 }, 0);
		expect(comp['modalService'].open).toHaveBeenCalled();
	});
	it('Should editDocModal Test', () => {
		comp.editTagForm = comp['fb'].group({
			id: '',
			tags: '',
			file_title: '',
		});
		spyOn(comp['modalService'], 'open');
		let tags = JSON.stringify([1, 'file_title']);
		comp.editDocModal('content', {
			id: 0,
			file_title: 'file_title',
			tags: tags,
		});
		expect(comp['modalService'].open).toHaveBeenCalled();
	});
	it('Should onSubmitAddTag Test', () => {
		comp.addTagForm = comp['fb'].group({
			id: '',
			tags: '',
		});
		comp.addTagForm.controls.id.setValue(10);
		spyOn(comp, 'saveDocument');
		comp.addTagForm.controls.tags.setValue([{ display: '1' }, '20']);
		comp.onSubmitAddTag({});
		expect(comp.saveDocument).toHaveBeenCalled();
	});
	it('Should editTagSubmit Test', () => {
		comp.editTagForm = comp['fb'].group({
			id: '',
			tags: '',
		});
		comp.editTagForm.controls.id.setValue(10);
		spyOn(comp, 'saveDocument');
		comp.editTagForm.controls.tags.setValue([{ display: '1' }, '20']);
		comp.editTagSubmit();
		expect(comp.saveDocument).toHaveBeenCalled();
	});
	it('Should saveDocument When Subscribe successfull', fakeAsync(() => {
		let Given_Responce = {
			status: true,
			message: 'Users List',
			data: [
				{
					id: 180,
					email: 'a@test.com',
					status: 0,
					created_at: '2021-03-16 14:24:15',
					created_by: 1,
					first_name: 'aaa',
					middle_name: null,
					last_name: 'bbbb',
					date_of_birth: null,
					role_id: 14,
					role_name: 'Guest',
					medical_identifier: 0,
					created_by_name: 'Super Admin',
					billing_title: 'billing Title name 16161',
				},
				{
					id: 222,
					email: 'abdullahbutt@ovada.com',
					status: 1,
					created_at: '2021-06-02 10:09:22',
					created_by: 1,
					first_name: 'Abdullah',
					middle_name: null,
					last_name: 'Butt',
					date_of_birth: null,
					role_id: 17,
					role_name: 'Provider',
					medical_identifier: 1,
					created_by_name: 'Super Admin',
					billing_title: 'MD',
				},
			],
			result: {
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
		comp.editTagForm = comp['fb'].group({
			id: '',
			tags: '',
			file_title: '',
		});
		spyOn(comp, 'getAllDocuments');
		comp.editTagForm.controls.id.setValue(10);
		comp.editTagForm.controls.tags.setValue([{ display: '1' }, '20']);
		comp.editTagForm.controls.file_title.setValue('file_title');
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('facilityModal', ngbModalOptions);
		spyOn(documentManager_MockService, 'editDocument').and.returnValue(
			of(Given_Responce).pipe(delay(1)),
		);
		comp.saveDocument({});
		expect(documentManager_MockService.editDocument).toHaveBeenCalled();
		
		tick(15000);
		discardPeriodicTasks();
		
		expect(comp.getAllDocuments).toHaveBeenCalled();
		expect(comp.disableBtn).toBeFalsy();
	}));
	it('Should getAllDocuments When Subscribe successfull', fakeAsync(() => {
		let Given_Responce = {
			status: true,
			message: 'Users List',
			data: [
				{
					id: 180,
					email: 'a@test.com',
					status: 0,
					created_at: '2021-03-16 14:24:15',
					created_by: 1,
					first_name: 'aaa',
					middle_name: null,
					last_name: 'bbbb',
					date_of_birth: null,
					role_id: 14,
					role_name: 'Guest',
					medical_identifier: 0,
					created_by_name: 'Super Admin',
					billing_title: 'billing Title name 16161',
					files: [],
				},
				{
					id: 222,
					email: 'abdullahbutt@ovada.com',
					status: 1,
					created_at: '2021-06-02 10:09:22',
					created_by: 1,
					first_name: 'Abdullah',
					middle_name: null,
					last_name: 'Butt',
					date_of_birth: null,
					role_id: 17,
					role_name: 'Provider',
					medical_identifier: 1,
					created_by_name: 'Super Admin',
					billing_title: 'MD',
				},
			],
			result: {
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
		spyOn(fd_MockService, 'getAllFoldersAndFilesByCase').and.returnValue(
			of(Given_Responce).pipe(delay(1)),
		);
		comp.getAllDocuments();
		expect(fd_MockService.getAllFoldersAndFilesByCase).toHaveBeenCalled();
		
		tick(15000);
		discardPeriodicTasks();
		
		expect(comp.documentsShown).toEqual(Given_Responce.data);
		expect(comp.showingFiles).toBeTruthy();
	}));
	it('Should deleteFile When Subscribe successfull', fakeAsync(() => {
		let Given_Responce = {
			status: true,
			message: 'Users List',
			data: [
				{
					id: 180,
					email: 'a@test.com',
					status: 0,
					created_at: '2021-03-16 14:24:15',
					created_by: 1,
					first_name: 'aaa',
					middle_name: null,
					last_name: 'bbbb',
					date_of_birth: null,
					role_id: 14,
					role_name: 'Guest',
					medical_identifier: 0,
					created_by_name: 'Super Admin',
					billing_title: 'billing Title name 16161',
					files: [],
				},
				{
					id: 222,
					email: 'abdullahbutt@ovada.com',
					status: 1,
					created_at: '2021-06-02 10:09:22',
					created_by: 1,
					first_name: 'Abdullah',
					middle_name: null,
					last_name: 'Butt',
					date_of_birth: null,
					role_id: 17,
					role_name: 'Provider',
					medical_identifier: 1,
					created_by_name: 'Super Admin',
					billing_title: 'MD',
				},
			],
			result: {
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
		let confirmResult = {
			resolved: true,
		};
		spyOn(comp, 'getAllDocuments');
		spyOn(confirm_MockService, 'create').and.returnValue(of(confirmResult).pipe(delay(1)));
		spyOn(fd_MockService, 'deleteDocument').and.returnValue(of(Given_Responce).pipe(delay(1)));
		comp.deleteFile({ id: 1 });
		expect(confirm_MockService.create).toHaveBeenCalled();
		// expect(fd_MockService.deleteDocument).toHaveBeenCalled();
		
		tick(15000);
		discardPeriodicTasks();
		
		expect(comp.getAllDocuments).toHaveBeenCalled();
	}));
	it('Should officeStartTimeChange Test', () => {
		createFormNew();
		comp.officeStartTimeChange(new Date());
		
		expect(comp.office_hours_start).toBeTruthy();
	});
	it('Should officeEndTimeChange Test', () => {
		createFormNew();
		comp.officeEndTimeChange(new Date());
		
		expect(comp.office_hours_end).toBeTruthy();
	});
	it('Should selectionOnValueChange Test', () => {
		createFormNew();
		spyOn(comp.form, 'patchValue');
		comp.selectionOnValueChange(new Date());
		
		expect(comp.form.patchValue).toHaveBeenCalled();
	});
	it('Should isSameLoginUser Test', () => {
		comp.form = comp['fb'].group({
			id: '',
			first_name: ['', [Validators.required, whitespaceFormValidation()]],
			city: [''],
			zip: ['', Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$')],
			social_security: [''],
			middle_name: [''],
			last_name: ['', [Validators.required, whitespaceFormValidation()]],
			date_of_birth: [''],
			gender: ['', [Validators.required]],
			title: [''],
			cell_no: [''],
			address: [''],
			apartment_suite: [''],
			work_phone: [''],
			home_phone: [''],
			fax: [''],
			extension: [''],
			employed_by_id: [''],
			emergency_phone: [''],
			emergency_name: [''],
			designation_id: [''],
			department_id: [''],
			role_id: ['', Validators.required],
			employment_type_id: [''],
			biography: [''],
			hiring_date: [''],
			from: [''],
			to: [''],
			primary_facility_id: ['', Validators.required],
			affiliated_facility_ids: [0],
			email: [
				null,
				[
					Validators.required,
					Validators.pattern(
						/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
					),
				],
			],
			state: [''],
		});
		localStorage.setItem('cm_data', JSON.stringify({ basic_info: { id: 123 } }));
		comp.currentUser = 123;
		spyOn(comp.form, 'patchValue');
		comp.isSameLoginUser(comp.form);
		
		expect(comp.isSameUser).toBe(true);
	});
	it('Should departmentChange Test', () => {
		UserRelatedData();
		comp.departmentChange({ selectedIndex: 0 });
		
		expect(comp.selectedDepartment).toMatch('All Department');
	});
	it('Should cancelUser Test', () => {
		spyOn(comp['router'], 'navigate');
		comp.cancelUser();
		
		expect(comp['router'].navigate).toHaveBeenCalled();
	});
	it('Should getFacilityNameFromFacilityData Test If practice ID matched', () => {
		UserRelatedData();
		spyOn(comp['router'], 'navigate');
		let result = comp.getFacilityNameFromFacilityData(0);
		
		expect(result).toMatch('facility_full_name');
	});
	it('Should ngOnInit Test', () => {
		spyOn(document, "getElementById").and.callFake(function() {
			return {
					classList:{
						add: function () {
							return 123;
						},
						remove: function () {
							return 123;
						},
					}
			}
		});
		spyOn(comp, 'setForm');
		comp.ngOnInit();

		expect(comp.addTagForm.value).toEqual({ id: '', tags: '' });
		expect(comp.editTagForm.value).toEqual({ id: '', tags: '', file_title: '' });
		expect(comp.setForm).toHaveBeenCalled();
		expect(comp['IndexProfileImage']).toBe(0);
		expect(comp['imageUpload'].length).toBe(0);
	});
	it('Should saveDocument When Subscribe successfull If editTagForm Invalid', fakeAsync(() => {
		let Given_Responce = {
			status: true,
			message: 'Users List',
			data: [
				{
					id: 180,
					email: 'a@test.com',
					status: 0,
					created_at: '2021-03-16 14:24:15',
					created_by: 1,
					first_name: 'aaa',
					middle_name: null,
					last_name: 'bbbb',
					date_of_birth: null,
					role_id: 14,
					role_name: 'Guest',
					medical_identifier: 0,
					created_by_name: 'Super Admin',
					billing_title: 'billing Title name 16161',
				},
				{
					id: 222,
					email: 'abdullahbutt@ovada.com',
					status: 1,
					created_at: '2021-06-02 10:09:22',
					created_by: 1,
					first_name: 'Abdullah',
					middle_name: null,
					last_name: 'Butt',
					date_of_birth: null,
					role_id: 17,
					role_name: 'Provider',
					medical_identifier: 1,
					created_by_name: 'Super Admin',
					billing_title: 'MD',
				},
			],
			result: {
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
		comp.addTagForm = comp['fb'].group({
			id: '',
			tags: '',
		});
		comp.editTagForm = comp['fb'].group({
			id: '',
			tags: '',
			file_title: '',
		});
		spyOn(comp, 'getAllDocuments');
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('facilityModal', ngbModalOptions);
		spyOn(documentManager_MockService, 'editDocument').and.returnValue(
			of(Given_Responce).pipe(delay(1)),
		);
		comp.saveDocument({});
		expect(documentManager_MockService.editDocument).toHaveBeenCalled();
		
		tick(15000);
		discardPeriodicTasks();
		
		expect(comp.getAllDocuments).toHaveBeenCalled();
	}));
	it('Should saveDocument When Subscribe Unsuccessfull', fakeAsync(() => {
		spyOn(comp['toastrService'],'error');
		spyOn(documentManager_MockService, 'editDocument').and.returnValue(
			throwError({ error: {error:{ message: 'error'} } }));
		comp.saveDocument({});
		expect(documentManager_MockService.editDocument).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		
		expect(comp['toastrService'].error).toHaveBeenCalled();
	}));
	
	// fit('Should formatFileImage When Subscribe successfull If responce true', fakeAsync(() => {
	// 	let Given_Responce = {
	// 		status: true,
	// 		message: 'Users List',
	// 		data: [
	// 			{
	// 				id: 180,
	// 				email: 'a@test.com',
	// 				status: 0,
	// 				created_at: '2021-03-16 14:24:15',
	// 				created_by: 1,
	// 				first_name: 'aaa',
	// 				middle_name: null,
	// 				last_name: 'bbbb',
	// 				date_of_birth: null,
	// 				role_id: 14,
	// 				role_name: 'Guest',
	// 				medical_identifier: 0,
	// 				created_by_name: 'Super Admin',
	// 				billing_title: 'billing Title name 16161',
	// 			},
	// 			{
	// 				id: 222,
	// 				email: 'abdullahbutt@ovada.com',
	// 				status: 1,
	// 				created_at: '2021-06-02 10:09:22',
	// 				created_by: 1,
	// 				first_name: 'Abdullah',
	// 				middle_name: null,
	// 				last_name: 'Butt',
	// 				date_of_birth: null,
	// 				role_id: 17,
	// 				role_name: 'Provider',
	// 				medical_identifier: 1,
	// 				created_by_name: 'Super Admin',
	// 				billing_title: 'MD',
	// 			},
	// 		],
	// 		result: {
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
	// 	comp['documents'] = [{file:'File'},{file:'File'}];
	// 	comp['imageIndex'] = 0;
	// 	comp.newUserId = null;
	// 	spyOn(fd_MockService, 'uploadUserDocument').and.returnValue(of(Given_Responce).pipe(delay(1)));
	// 	comp.handleReaderLoaded({ target: { result: 'ImgSrc' } });
	// 	expect(fd_MockService.uploadUserDocument).toHaveBeenCalled();
	// 	
	// 	expect(comp.isUploading).toBe(true);
	// 	tick(15000);
	// 	discardPeriodicTasks();
	// 	
	// 	expect(comp.documentsShown).toEqual(Given_Responce.data);
	// 	expect(comp.isUploading).toBe(false);
	// 	expect(comp['imageIndex']).toBe(0);
	// 	expect(comp['documents'].length).toBe(0);
	// }));
	afterAll(() => {
		TestBed.resetTestingModule();
	});
});
