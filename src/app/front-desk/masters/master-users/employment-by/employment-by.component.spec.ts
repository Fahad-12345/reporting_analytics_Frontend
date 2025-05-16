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
import { EmploymentByComponent } from './employment-by.component';
import { whitespaceFormValidation } from '@appDir/shared/utils/utils.helpers';
import { HttpClientTestingModule } from '@angular/common/http/testing';
describe('EmploymentByComponent', () => {
	let comp: EmploymentByComponent;
	let fixture: ComponentFixture<EmploymentByComponent>;
	let request_MockService = new RequestMockService();
	let confirm_MockService = new ConfirmMockService();
	let canActivate_MockService = new CanDeactiveMockService();
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [EmploymentByComponent],
			imports: [SharedModule, RouterTestingModule, ToastrModule.forRoot(), BrowserAnimationsModule,HttpClientTestingModule ],
			schemas: [NO_ERRORS_SCHEMA],
			providers: [
				Config,
				LocalStorage,
				ToastrService,
				{ provide: RequestService, useValue: request_MockService },
				// { provide: ConfirmationService, useValue: confirm_MockService },
				{ provide: CanDeactivateModelComponentService, useValue: canActivate_MockService },
			],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(EmploymentByComponent);
		comp = fixture.componentInstance;
	});
	afterEach(() => {
		TestBed.resetTestingModule();
	});
	function setPageValues() {
		comp.page = {
			size: 0,
			totalElements: 0,
			totalPages: 0,
			pageNumber: 1,
			offset: 0,
		};
	}
	it('should be created', () => {
		expect(comp).toBeTruthy();
	});
	it('Should ngOnInit Test', () => {
		comp.employmentByForm = comp['fb'].group({
			name: ['', [Validators.required, whitespaceFormValidation()]],
			comments: [''],
		});
		spyOn(comp, 'setTitle');
		spyOn(comp, 'setPage');
		comp.ngOnInit();
		expect(comp.setTitle).toHaveBeenCalled();
		expect(comp.setPage).toHaveBeenCalled();
		expect(comp.employmentByForm.value).toEqual({
			id: '',
			name: '',
			comments: '',
		});
	});
	it('Should resetSearchFilter Test', () => {
		comp.searchEmployment = comp['fb'].group({
			name: [''],
			description: [''],
		});
		spyOn(comp, 'setPage');
		spyOn(comp.selection, 'clear');
		comp.searchEmployment.controls.name.setValue('Mock Name');
		comp.searchEmployment.controls.description.setValue('Mock Description');
		comp.resetSearchFilter();
		expect(comp.setPage).toHaveBeenCalled();
		expect(comp.selection.clear).toHaveBeenCalled();
	});
	it('Should setPage Test', () => {
		setPageValues();
		spyOn(comp.selection, 'clear');
		spyOn(comp, 'addUrlQueryParams');
		spyOn(comp, 'getAllEmoploymentBy');
		comp.setPage({ offset: 0 });
		expect(comp.selection.clear);
		expect(comp.addUrlQueryParams).toHaveBeenCalled();
		expect(comp.getAllEmoploymentBy).toHaveBeenCalled();
	});
	it('Should addUrlQueryParams Test', () => {
		spyOn(comp['location'], 'replaceState');
		comp.addUrlQueryParams();
		expect(comp['location'].replaceState).toHaveBeenCalled();
	});
	it('Should getAllEmoploymentBy When Subscribe successfull', fakeAsync(() => {
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
		comp.getAllEmoploymentBy({});
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp.loadSpin).toBe(true);
		tick(15000);
		discardPeriodicTasks();
		expect(comp.loadSpin).toBe(false);
		expect(comp.page.totalElements).toEqual(Given_Responce.result.total);
	}));
	it('Should getAllEmoploymentBy When Subscribe UnSuccessfull', fakeAsync(() => {
		comp.page = {
			size: 0,
			totalElements: 0,
			totalPages: 0,
			pageNumber: 0,
			offset: 0,
		};
		spyOn(request_MockService, 'sendRequest').and.returnValue(throwError({ message: 'error' }));
		comp.getAllEmoploymentBy({});
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp.loadSpin).toBeFalsy();
		flush();
	}));
	it('Should onSubmit When Subscribe successfull If employmentByForm valid', fakeAsync(() => {
		comp.employmentByForm = comp['fb'].group({
			id:[1],
			name: ['', [Validators.required, whitespaceFormValidation()]],
			description: [''],
		});
		comp.employmentByForm.controls.name.setValue('Mock Name');
		comp.employmentByForm.controls.description.setValue('Mock Description');
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
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		// comp.employmentTypes = [];
		comp.modalRef = comp['modalService'].open('content', ngbModalOptions);
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(Given_Responce).pipe(delay(1)));
		spyOn(comp.selection, 'clear');
		spyOn(comp, 'setPage');
		comp.onSubmit({});
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp.disableBtn).toBe(true);
		tick(15000);
		discardPeriodicTasks();
		comp.modalRef.close();
		expect(comp.disableBtn).toBe(false);
		expect(comp.setPage).toHaveBeenCalled();
		expect(comp.selection.clear).toHaveBeenCalled();
		expect(comp.disableBtn).toBe(false);
	}));
	it('Should onSubmit When Subscribe UnSuccessfull If employmentByForm valid', fakeAsync(() => {
		comp.employmentByForm = comp['fb'].group({
			id:[1],
			name: ['', [Validators.required, whitespaceFormValidation()]],
			description: [''],
		});
		comp.employmentByForm.controls.name.setValue('Mock Name');
		comp.employmentByForm.controls.description.setValue('Mock Description');
		spyOn(request_MockService, 'sendRequest').and.returnValue(throwError({ message: 'error' }));
		comp.onSubmit({});
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.disableBtn).toBe(false);
	}));
	it('Should onSubmit When Subscribe successfull If employmentByForm valid & creatingFormValue not greater than 1', fakeAsync(() => {
		comp.employmentByForm = comp['fb'].group({
			name: ['', [Validators.required, whitespaceFormValidation()]],
			description: [''],
		});
		comp.employmentByForm.controls.name.setValue('Mock Name');
		comp.employmentByForm.controls.description.setValue('Mock Description');
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
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		// comp.employmentTypes = [];
		comp.modalRef = comp['modalService'].open('content', ngbModalOptions);
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(Given_Responce).pipe(delay(1)));
		spyOn(comp.selection, 'clear');
		spyOn(comp, 'setPage');
		comp.onSubmit({});
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp.disableBtn).toBe(true);
		tick(15000);
		discardPeriodicTasks();
		comp.modalRef.close();
		expect(comp.disableBtn).toBe(false);
		expect(comp.setPage).toHaveBeenCalled();
		expect(comp.selection.clear).toHaveBeenCalled();
		expect(comp.disableBtn).toBe(false);
	}));
	it('Should onSubmit When Subscribe UnSuccessfull If employmentByForm valid & creatingFormValue not greater than 1', fakeAsync(() => {
		comp.employmentByForm = comp['fb'].group({
			name: ['', [Validators.required, whitespaceFormValidation()]],
			description: [''],
		});
		comp.employmentByForm.controls.name.setValue('Mock Name');
		comp.employmentByForm.controls.description.setValue('Mock Description');
		spyOn(request_MockService, 'sendRequest').and.returnValue(throwError({ message: 'error' }));
		comp.onSubmit({});
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.disableBtn).toBe(false);
	}));
	it('Should onSubmit If employmentByForm invalid ', () => {
		comp.employmentByForm = comp['fb'].group({
			name: ['', [Validators.required, whitespaceFormValidation()]],
			description: [''],
		});
		spyOn(comp['fd_service'], 'touchAllFields');
		comp.onSubmit({});
		expect(comp['fd_service'].touchAllFields).toHaveBeenCalled();
	});
	it('Should initialEmploymentByForm Test', () => {
		let Result = comp['initialEmploymentByForm']();
		expect(Result.value).toEqual({
			id: '',
			name: '',
			comments: '',
		});
	});
	it('Should EmploymentbyOpenModal Test', () => {
		spyOn(comp['modalService'], 'open');
		comp.EmploymentbyOpenModal('designation');
		expect(comp['modalService'].open).toHaveBeenCalled();
	});
	it('Should resetSearchFilter Test', () => {
		comp.searchEmployment = comp['fb'].group({
			name: ['', [Validators.required, whitespaceFormValidation()]],
			description: [''],
		});
		spyOn(comp.searchEmployment, 'reset');
		comp.resetSearchFilter();
		expect(comp.searchEmployment.reset).toHaveBeenCalled();
	});
	it('Should setForm Test', () => {
		comp.employmentByForm = comp['fb'].group({
			name: ['', [Validators.required, whitespaceFormValidation()]],
			comments: [''],
		});
		comp.setForm({ id: 1, name: 'Mock name', comments: 'Mock comments' });
		expect(comp.employmentByForm.value).toEqual({
			name: 'Mock name',
			comments: 'Mock comments',
		});
	});
	it('Should isAllSelected Test', () => {
		comp.getEmploymentBy = [];
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
	it('Should Test masterToggle when isAllSelected False', () => {
		// spyOn(comp, 'isAllSelected').and.returnValue(of(false));
		spyOn(comp.selection,'select');
		comp.totalRows = 1;
		comp.getEmploymentBy = [{id:0}];
		comp.masterToggle();
		expect(comp.isAllSelected).toHaveBeenCalled();
	});
	it('Should Test editEmploymentBy', () => {
		spyOn(comp, 'setForm');
		spyOn(comp, 'EmploymentbyOpenModal');

		comp.editEmploymentBy('modal', { name: 'name', description: 'description' });
		expect(comp.editableRow).toBeTruthy();
		expect(comp.modalTitle).toBe('Edit ');
		expect(comp.submitText).toBe('Update');
		expect(comp.setForm).toHaveBeenCalled();
		expect(comp.EmploymentbyOpenModal).toHaveBeenCalled();
	});
	it('Should deleteOneRecord When Subscribe successfull', fakeAsync(() => {
		let Confirmation_Responce = {
			resolved: true,
		};
		let Given_Row = {
			status: true,
		};
		comp.getEmploymentBy = [{
			id:0
		}]
		spyOn(confirm_MockService, 'create').and.returnValue(of(Confirmation_Responce).pipe(delay(1)));
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(Given_Row).pipe(delay(1)));
		comp.deleteOneRecord(1);
		expect(confirm_MockService.create).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.getEmploymentBy.length).toBe(1);
	}));
	it('Should deleteMultiple When Subscribe successfull', fakeAsync(() => {
		let Confirmation_Responce = {
			resolved: true,
		};
		let Given_Row = {
			status: true,
		};
		spyOn(comp.selection, 'clear');
		spyOn(comp,'setPage');
		spyOn(confirm_MockService, 'create').and.returnValue(of(Confirmation_Responce).pipe(delay(1)));
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(Given_Row).pipe(delay(1)));
		comp.deleteMultiple();
		expect(confirm_MockService.create).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.setPage).toHaveBeenCalled();
		expect(comp.selection.clear);
	}));
	it('Should pageLimit Test', () => {
		spyOn(comp, 'setPage');
		comp.pageLimit(10);
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
		comp.employmentByForm = comp['fb'].group({
			name: ['', [Validators.required, whitespaceFormValidation()]],
			description: [''],
		});
		comp.employmentByForm.markAsTouched();
		comp.employmentByForm.markAsDirty();
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
		comp.employmentByForm = comp['fb'].group({
			name: ['', [Validators.required, whitespaceFormValidation()]],
			description: [''],
		});
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('paymentType', ngbModalOptions);
		comp.employmentByForm.markAsTouched();
		comp.employmentByForm.markAsDirty();
		spyOn(comp.employmentByForm, 'reset');
		spyOn(canActivate_MockService, 'canDeactivate').and.returnValue(of([]));
		comp.closeModal();
		comp.modalRef.close();
		expect(comp.employmentByForm.reset).toHaveBeenCalled();
	}));
	it('Should closeModal function test when form invalid', () => {
		comp.employmentByForm = comp['fb'].group({
			name: ['', [Validators.required, whitespaceFormValidation()]],
			description: [''],
		});
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('paymentType', ngbModalOptions);
		comp.employmentByForm.markAsUntouched();
		spyOn(comp.employmentByForm, 'reset');
		spyOn(canActivate_MockService, 'canDeactivate').and.returnValue(of([]));
		comp.closeModal();
		comp.modalRef.close();
		expect(comp.employmentByForm.reset).toHaveBeenCalled();
	});
	it('Should isDisabledSaveContinue Test If form Invalid', () => {
		comp.employmentByForm = comp['fb'].group({
			name: ['', [Validators.required, whitespaceFormValidation()]],
			description: [''],
		});
		comp.employmentByForm.controls.name.setValue('mock name');
		comp.employmentByForm.controls.description.setValue('mock description');
		let Result = comp.isDisabledSaveContinue();
		expect(Result).toBeFalsy();
	});
	it('Should isDisabledSaveContinue Test If valid', () => {
		comp.employmentByForm = comp['fb'].group({
			name: ['', [Validators.required, whitespaceFormValidation()]],
			description: [''],
		});
		comp.loadSpin = false;
		let Result = comp.isDisabledSaveContinue();
		expect(Result).toBeTruthy();
	});
	it('Should checkInputs Test', () => {
		comp.searchEmployment = comp['fb'].group({
			name: [''],
			description: [''],
		});
		let Result = comp.checkInputs();
		expect(Result).toBe(true);
	});
	it('Should checkInputs Test When filterForm have values', () => {
		comp.searchEmployment = comp['fb'].group({
			name: [''],
			description: [''],
		});
		comp.searchEmployment.controls.name.setValue('Mock Name');
		let Result = comp.checkInputs();
		expect(Result).toBe(false);
	});
	it('Should createOpenModal Test', () => {
		comp.employmentByForm = comp['fb'].group({
			name: ['', [Validators.required, whitespaceFormValidation()]],
			comments: [''],
		});
		spyOn(comp, 'EmploymentbyOpenModal');
		comp.createOpenModal({});
		expect(comp.EmploymentbyOpenModal).toHaveBeenCalled();
		expect(comp.submitText).toMatch('Save & Continue');
		expect(comp.modalTitle).toMatch('Add ');
	});
	afterAll(() => {
		TestBed.resetTestingModule();
	});
});
