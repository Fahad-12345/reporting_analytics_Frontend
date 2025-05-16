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
import { CanDeactiveMockService } from '@appDir/shared/mock-services/CanDeactiveModalMock.service';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { UserRolesComponent } from './user-roles.component';
import { whitespaceFormValidation } from '@appDir/shared/utils/utils.helpers';
import { HttpClientTestingModule } from '@angular/common/http/testing';
describe('UserRolesComponent', () => {
	let comp: UserRolesComponent;
	let fixture: ComponentFixture<UserRolesComponent>;
	let request_MockService = new RequestMockService();
	let confirm_MockService = new ConfirmMockService();
	let canActivate_MockService = new CanDeactiveMockService();
	// let fd_MockService = new FDMockService();
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [UserRolesComponent],
			imports: [SharedModule, RouterTestingModule, ToastrModule.forRoot(), BrowserAnimationsModule,HttpClientTestingModule],
			schemas: [NO_ERRORS_SCHEMA],
			providers: [
				Config,
				LocalStorage,
				ToastrService,
				{ provide: RequestService, useValue: request_MockService },
				// { provide: ConfirmationService, useValue: confirm_MockService },
				{ provide: CanDeactivateModelComponentService, useValue: canActivate_MockService },
				// { provide: FDServices, useValue: fd_MockService },
			],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(UserRolesComponent);
		comp = fixture.componentInstance;
	});
	afterEach(() => {
		TestBed.resetTestingModule();
	});
	it('should be created', () => {
		expect(comp).toBeTruthy();
	});
	it('Should ngOnInit Test',()=>{
		comp.page = {
			size: 0,
			totalElements: 0,
			totalPages: 0,
			pageNumber: 1,
			offset: 0,
		};
		spyOn(comp,'setTitle');
		spyOn(comp,'setPage');
		comp.ngOnInit();
		expect(comp.setTitle).toHaveBeenCalled();
		expect(comp.setPage).toHaveBeenCalled();
		expect(comp.userRoleForm.value).toEqual({name: '',
		qualifier: '',
		comment: '',
		medical_identifier: false,has_supervisor: false,
		can_finalize: false})
	});
	it('Should addUrlQueryParams Test', () => {
		spyOn(comp['location'], 'replaceState');
		comp.addUrlQueryParams();
		expect(comp['location'].replaceState).toHaveBeenCalled();
	});
	it('Should getFilteredRoles Test If filterForm valid', () => {
		comp.filterForm = comp['fb'].group({
			name: ['', Validators.required],
			comment: [''],
			qualifier:['']
		});
		comp.filterForm.controls.name.setValue('Mock Name');
		comp.filterForm.controls.comment.setValue('Mock comment');
		comp.filterForm.controls.qualifier.setValue('Mock qualifier');
		spyOn(comp.selection, 'clear');
		spyOn(comp, 'filterRole');
		comp.getFilteredRoles({});
		expect(comp.selection.clear).toHaveBeenCalled();
		expect(comp.filterRole).toHaveBeenCalled();
	});
	it('Should getFilteredRoles Test If filterForm not valid', () => {
		comp.filterForm = comp['fb'].group({
			name: ['', Validators.required],
			comment: [''],
			qualifier:['']
		});
		spyOn(comp['fd_service'], 'touchAllFields');
		comp.getFilteredRoles({});
		expect(comp['fd_service'].touchAllFields).toHaveBeenCalled();
	});
	it('Should onResetFilters Test', () => {
		comp.filterForm = comp['fb'].group({
			name: [''],
			description: [''],
		});
		spyOn(comp, 'setPage');
		spyOn(comp.selection, 'clear');
		comp.filterForm.controls.name.setValue('Mock Name');
		comp.filterForm.controls.description.setValue('Mock Description');
		comp.onResetFilters();
		expect(comp.setPage).toHaveBeenCalled();
		expect(comp.selection.clear).toHaveBeenCalled();
	});
	it('Should setPage Test', () => {
		spyOn(comp.selection, 'clear');
		spyOn(comp, 'addUrlQueryParams');
		spyOn(comp, 'fetchList');
		comp.setPage({ offset: 0 });
		expect(comp.selection.clear);
		expect(comp.addUrlQueryParams).toHaveBeenCalled();
		expect(comp.fetchList).toHaveBeenCalled();
	});
	it('Should addUrlQueryParams Test', () => {
		spyOn(comp['location'], 'replaceState');
		comp.addUrlQueryParams();
		expect(comp['location'].replaceState).toHaveBeenCalled();
	});
	it('Should fetchList When Subscribe successfull', fakeAsync(() => {
		let Given_Responce = {
			status: true,
			message: 'Users List',
			result: {
				current_page: 1,
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
				],
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
		comp.page = {
			size: 0,
			totalElements: 0,
			totalPages: 0,
			pageNumber: 0,
			offset: 0,
		};
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(Given_Responce).pipe(delay(1)));
		comp.fetchList({});
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp.loadSpin).toBe(true);
		tick(15000);
		discardPeriodicTasks();
		expect(comp.loadSpin).toBe(false);
		expect(comp.page.totalElements).toEqual(Given_Responce.result.total);
	}));
	it('Should fetchList When Subscribe UnSuccessfull', fakeAsync(() => {
		comp.page = {
			size: 0,
			totalElements: 0,
			totalPages: 0,
			pageNumber: 0,
			offset: 0,
		};
		spyOn(request_MockService, 'sendRequest').and.returnValue(throwError({ message: 'error' }));
		comp.fetchList({});
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp.loadSpin).toBeTruthy();
		flush();
	}));
	it('Should onSubmit When Subscribe successfull If userRoleForm valid', fakeAsync(() => {
		comp.userRoleForm = comp['fb'].group({
			name: ['', [Validators.required, whitespaceFormValidation()]],
			comment: [''],
		});
		comp.userRoleForm.controls.name.setValue('Mock Name');
		comp.userRoleForm.controls.comment.setValue('Mock Description');
		let Given_Responce = {
			status: true,
			message: 'Users List',
			result: {
				current_page: 1,
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
				],
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
		comp.page = {
			size: 0,
			totalElements: 0,
			totalPages: 0,
			pageNumber: 0,
			offset: 0,
		};
		comp.isEdit = true;
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.editAbleUserRole = {
			name: 'mock name',
			comment: 'mock comment',
		};
		comp.userRoles = [];
		comp.modalRef = comp['modalService'].open('content', ngbModalOptions);
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(Given_Responce).pipe(delay(1)));
		spyOn(comp.selection, 'clear');
		spyOn(comp, 'setPage');
		comp.onSubmit();
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp.loading).toBe(true);
		expect(comp.disableBtn).toBe(true);
		tick(15000);
		discardPeriodicTasks();
		comp.modalRef.close();
		expect(comp.loading).toBe(false);
		expect(comp.disableBtn).toBe(false);
		expect(comp.setPage).toHaveBeenCalled();
		expect(comp.selection.clear).toHaveBeenCalled();
	}));
	it('Should onSubmit When Subscribe successfull If userRoleForm valid & isEdit False', fakeAsync(() => {
		comp.userRoleForm = comp['fb'].group({
			name: ['', [Validators.required, whitespaceFormValidation()]],
			comment: [''],
		});
		comp.userRoleForm.controls.name.setValue('Mock Name');
		comp.userRoleForm.controls.comment.setValue('Mock comment');
		let Given_Responce = {
			status: true,
			message: 'Users List',
			data : {
				employmentType: [
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
				],
			}

		};
		comp.page = {
			size: 0,
			totalElements: 0,
			totalPages: 0,
			pageNumber: 0,
			offset: 0,
		};
		comp.userRoles = [];
		comp.isEdit = false;
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.editAbleUserRole = {
			name: 'mock name',
			comment: 'mock comment',
		};
		comp.userRoles = [];
		comp.modalRef = comp['modalService'].open('content', ngbModalOptions);
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(Given_Responce).pipe(delay(1)));
		spyOn(comp.selection, 'clear');
		spyOn(comp, 'setPage');
		comp.onSubmit();
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp.loading).toBe(true);
		expect(comp.disableBtn).toBe(true);
		tick(15000);
		discardPeriodicTasks();
		comp.modalRef.close();
		expect(comp.loading).toBe(false);
		expect(comp.disableBtn).toBe(false);
		expect(comp.setPage).toHaveBeenCalled();
		expect(comp.selection.clear).toHaveBeenCalled();
	}));
	it('Should onSubmit When Subscribe UnSuccessfull If userRoleForm valid', fakeAsync(() => {
		comp.userRoleForm = comp['fb'].group({
			name: ['', [Validators.required, whitespaceFormValidation()]],
			comment: [''],
		});
		comp.userRoleForm.controls.name.setValue('Mock Name');
		comp.userRoleForm.controls.comment.setValue('Mock Description');
		comp.page = {
			size: 0,
			totalElements: 0,
			totalPages: 0,
			pageNumber: 0,
			offset: 0,
		};
		comp.isEdit = true;
		comp.editAbleUserRole = {
			name: 'mock name',
			comment: 'mock comment',
		};
		comp.userRoles = [];
		spyOn(request_MockService, 'sendRequest').and.returnValue(throwError({ message: 'error' }));
		comp.onSubmit();
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.disableBtn).toBe(false);
	}));
	it('Should onSubmit If employmentTypeForm invalid ', () => {
		comp.userRoleForm = comp['fb'].group({
			name: ['', [Validators.required, whitespaceFormValidation()]],
			comment: [''],
		});
		spyOn(comp['fd_service'], 'touchAllFields');
		comp.onSubmit();
		expect(comp['fd_service'].touchAllFields).toHaveBeenCalled();
	});
	it('Should remove Test', () => {
		let Result = comp['remove']([], 0, 'id', []);
		expect(Result.length).toBe(1);
	});
	it('Should initializeForm Test', () => {
		let Result = comp['initializeForm']();
		
		expect(Result.value).toEqual({
			comment: "",
			medical_identifier: false,
			name: "",
			qualifier: "",
			has_supervisor: false,
    		can_finalize: false
		});
	});
	it('Should openModal Test', () => {
		spyOn(comp['modalService'], 'open');
		comp.openModal('designation');
		expect(comp['modalService'].open).toHaveBeenCalled();
	});
	it('Should resetForm Test', () => {
		comp.userRoleForm = comp['fb'].group({
			name: ['', [Validators.required, whitespaceFormValidation()]],
			description: [''],
		});
		spyOn(comp.userRoleForm, 'reset');
		comp.resetForm();
		expect(comp.userRoleForm.reset).toHaveBeenCalled();
	});
	it('Should setForm Test', () => {
		comp.userRoleForm = comp['fb'].group({
			name: ['', [Validators.required, whitespaceFormValidation()]],
			comment: [''],
		});
		comp.setForm({ name: 'Mock name', comment: 'Mock comment' });
		expect(comp.userRoleForm.value).toEqual({
			name: 'Mock name',
			comment: 'Mock comment',
		});
	});
	it('Should isAllSelected Test',()=>{
		comp.userRoles = [];
		let Result = comp.isAllSelected();
		expect(Result).toBeTruthy();
	});
	it('Should Test masterToggle when isAllSelected True', () => {
		// spyOn(comp, 'isAllSelected').and.returnValue(of(true));
		spyOn(comp['selection'], 'clear');
		comp.masterToggle();
		expect(comp.isAllSelected).toHaveBeenCalled();
		expect(comp['selection'].clear).toHaveBeenCalled();
	});
	it('Should Test masterToggle when isAllSelected False', fakeAsync(() => {
		// spyOn(comp, 'isAllSelected').and.returnValue(of(false));
		spyOn(comp.selection,'select');
		comp.totalRows = 1;
		comp.userRoles = [{name:'mock name',comment:'mock comment'}];
		comp.masterToggle();
		expect(comp.isAllSelected).toHaveBeenCalled();
	}));
	it('Should Test edit', () => {
		spyOn(comp, 'setForm');
		spyOn(comp, 'openModal');

		comp.edit('modal',{name:'name',comment:'comment'});
		expect(comp.isEdit).toBeTruthy();
		expect(comp.headerText).toBe('Edit User Role');
		expect(comp.setForm).toHaveBeenCalled();
		expect(comp.openModal).toHaveBeenCalled();
	});
	it('Should Test save', () => {
		comp.userRoleForm = comp['fb'].group({
			name: ['', [Validators.required, whitespaceFormValidation()]],
			comment: [''],
		});
		spyOn(comp, 'resetForm');
		spyOn(comp, 'openModal');

		comp.save('modal');
		expect(comp.isEdit).toBeFalsy();
		expect(comp.headerText).toBe('Add User Role');
		expect(comp.submitText).toBe('Save & Continue');
		expect(comp.resetForm).toHaveBeenCalled();
		expect(comp.openModal).toHaveBeenCalled();
	});
	it('Should deleteOne When Subscribe successfull If employmentTypes have values', fakeAsync(() => {
		let Confirmation_Responce = {
			resolved: true,
		};
		let Given_Row = {
			message: true
		};
		comp.userRoles = [{name:'mock name',comment:'mock comment'}];
		spyOn(confirm_MockService, 'create').and.returnValue(of(Confirmation_Responce).pipe(delay(1)));
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(Given_Row).pipe(delay(1)));
		comp.deleteOne(1);
		expect(confirm_MockService.create).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.userRoles.length).toBe(1);
	}));
	it('Should deleteOne When Subscribe successfull', fakeAsync(() => {
		let Confirmation_Responce = {
			resolved: true,
		};
		let Given_Row = {
			message: true
		};
		comp.userRoles = [];
		spyOn(confirm_MockService, 'create').and.returnValue(of(Confirmation_Responce).pipe(delay(1)));
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(Given_Row).pipe(delay(1)));
		comp.deleteOne(1);
		expect(confirm_MockService.create).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.userRoles.length).toBe(0);
	}));
	it('Should bulkDelete When Subscribe successfull', fakeAsync(() => {
		let Confirmation_Responce = {
			resolved: true,
		};
		let Given_Row = {
			message: true
		};
		comp.userRoles = [];
		spyOn(comp.selection,'clear');
		spyOn(confirm_MockService, 'create').and.returnValue(of(Confirmation_Responce).pipe(delay(1)));
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(Given_Row).pipe(delay(1)));
		comp.bulkDelete();
		expect(confirm_MockService.create).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.selection.clear);
		expect(comp.bulkDelete.length).toBe(0);
	}));
	it('Should PageLimit Test',()=>{
		spyOn(comp,'setPage');
		comp.PageLimit(10);
		expect(comp.setPage).toHaveBeenCalled();
		expect(comp.page.size).toBe(10);
	});
	it('Should stringify Test which return json stringify', () => {
		const formValue: any = {
			comments: 'comments',
			description: 'description',
			name: 'name',
			status: true,
			result: [],
		};
		let JSON_String = comp.stringfy(formValue);
		expect(JSON_String).toEqual(JSON.stringify(formValue));
	});
	it('Should closeModal function test when subscribe return empty responce	', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'desc',
			name: 'name',
		};
		comp.userRoleForm = comp['fb'].group({
			name: ['', [Validators.required, whitespaceFormValidation()]],
			comment: [''],
		});
		comp.userRoleForm.markAsTouched();
		comp.userRoleForm.markAsDirty();
        spyOn(canActivate_MockService, 'canDeactivate').and.returnValue(of(null));
		let ReturnValue = comp.closeModal();
        expect(ReturnValue).toBeUndefined();
	}));
	it('Should closeModal function test when subscribe return not empty responce	', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'desc',
			name: 'name',
		};
		comp.userRoleForm = comp['fb'].group({
			name: ['', [Validators.required, whitespaceFormValidation()]],
			comment: [''],
		});
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('paymentType', ngbModalOptions);
		comp.userRoleForm.markAsTouched();
		comp.userRoleForm.markAsDirty();
		spyOn(comp.userRoleForm,'reset');
        spyOn(canActivate_MockService, 'canDeactivate').and.returnValue(of([]));
		comp.closeModal();
		comp.modalRef.close();
        expect(comp.userRoleForm.reset).toHaveBeenCalled();
	}));
	it('Should closeModal function test when form invalid', () => {
		comp.userRoleForm = comp['fb'].group({
			name: ['', [Validators.required, whitespaceFormValidation()]],
			comment: [''],
		});
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('paymentType', ngbModalOptions);
		comp.userRoleForm.markAsUntouched();
		spyOn(comp.userRoleForm,'reset');
        spyOn(canActivate_MockService, 'canDeactivate').and.returnValue(of([]));
		comp.closeModal();
		comp.modalRef.close();
        expect(comp.userRoleForm.reset).toHaveBeenCalled();
	});
	it('Should checkInputs Test', () => {
		comp.filterForm = comp['fb'].group({
			name: [''],
			comment: [''],
			qualifier: [''],
		});
		let Result = comp.checkInputs();
		expect(Result).toBe(true);
	});
	it('Should checkInputs Test When filterForm have values', () => {
		comp.filterForm = comp['fb'].group({
			name: [''],
			comment: [''],
			qualifier: [''],
		});
		comp.filterForm.controls.name.setValue('Mock Name');
		let Result = comp.checkInputs();
		expect(Result).toBe(false);
	});
	it('Should removeMultipleFromArr Test', () => {
		let Result = comp['removeMultipleFromArr']([],[2],'key');
		expect(Result.length).toBe(0);
	});
	it('Should removeMultipleFromArr Test If ', () => {
		let Result = comp['removeMultipleFromArr']([0],[2],0);
		expect(Result.length).toBe(0);
	});
	it('Should getFilteredRoles Test If form valid',()=>{
		comp.filterForm = comp['fb'].group({
			name: ['', Validators.required],
			comment: [''],
			qualifier:['']
		});
		comp.filterForm.controls.name.setValue('mock name');
		comp.filterForm.controls.comment.setValue('mock comment');
		comp.filterForm.controls.qualifier.setValue('mock qualifier');
		spyOn(comp['selection'],'clear');
		spyOn(comp,'filterRole');
		comp.getFilteredRoles({});
		expect(comp['selection'].clear).toHaveBeenCalled();
		expect(comp.filterRole).toHaveBeenCalled();
	});
	it('Should getFilteredRoles Test If form invalid',()=>{
		comp.filterForm = comp['fb'].group({
			name: ['', Validators.required],
			comment: [''],
			qualifier:['']
		});
		spyOn(comp['fd_service'],'touchAllFields');
		comp.getFilteredRoles({});
		expect(comp['fd_service'].touchAllFields).toHaveBeenCalled();
	});
	it('Should onResetFilters Test If form invalid',()=>{
		comp.filterForm = comp['fb'].group({
			name: ['', Validators.required],
			comment: [''],
			qualifier:['']
		});
		spyOn(comp['selection'],'clear');
		spyOn(comp,'setPage');
		comp.onResetFilters();
		expect(comp['selection'].clear).toHaveBeenCalled();
		expect(comp.setPage).toHaveBeenCalled();
	});
	it('Should filterRole When Subscribe successfull', fakeAsync(() => {
		let Given_Responce = {
			status: true,
			message: 'Users List',
			result: {
				current_page: 1,
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
						medical_identifier: 1,
						created_by_name: 'Super Admin',
						billing_title: 'billing Title name 16161',
					},
				],
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
		comp.page = {
			size: 0,
			totalElements: 0,
			totalPages: 0,
			pageNumber: 0,
			offset: 0,
		};
		spyOn(comp['selection'],'clear');
		spyOn(comp['http'], 'post').and.returnValue(of(Given_Responce.result).pipe(delay(1)));
		comp.filterRole({});
		expect(comp['http'].post).toHaveBeenCalled();
		expect(comp.loadSpin).toBe(true);
		tick(15000);
		discardPeriodicTasks();
		
		expect(comp.loadSpin).toBe(false);
		expect(comp['selection'].clear).toHaveBeenCalled();
		expect(comp.page.totalElements).toEqual(Given_Responce.result.data.length);
	}));
	afterAll(() => {
		TestBed.resetTestingModule();
	});
});
