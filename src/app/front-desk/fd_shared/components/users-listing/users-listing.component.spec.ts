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
import { UsersListingComponent } from './users-listing.component';
import { Logger } from '@nsalaun/ng-logger';
import { LoggerMockService } from '@appDir/shared/mock-services/LoggerMock.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
describe('UsersListingComponent', () => {
	let comp: UsersListingComponent;
	let fixture: ComponentFixture<UsersListingComponent>;
	let request_MockService = new RequestMockService();
	let confirm_MockService = new ConfirmMockService();
	let canActivate_MockService = new CanDeactiveMockService();
	let fd_MockService = new FDMockService();
	let Logger_MockService = new LoggerMockService();
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [UsersListingComponent],
			imports: [SharedModule, RouterTestingModule, ToastrModule.forRoot(), BrowserAnimationsModule,HttpClientTestingModule],
			schemas: [NO_ERRORS_SCHEMA],
			providers: [
				Config,
				LocalStorage,
				ToastrService,
				{ provide: RequestService, useValue: request_MockService },
				// { provide: ConfirmationService, useValue: confirm_MockService },
				{ provide: CanDeactivateModelComponentService, useValue: canActivate_MockService },
				{ provide: FDServices, useValue: fd_MockService },
				{ provide: Logger, useValue: Logger_MockService },
			],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(UsersListingComponent);
		comp = fixture.componentInstance;
	});
	afterEach(() => {
		TestBed.resetTestingModule();
	});
	it('should be created', () => {
		expect(comp).toBeTruthy();
	});
	it('Should onLimitChange Test', () => {
		comp.onLimitChange({ target: { value: 10 } });
		expect(comp.limitPerPage).toBe(10);
	});
	it('Should onResetFilters Test', () => {
		comp.filterForm = comp['fb'].group({
			name: '',
			email: [''],
			role_id: '',
		});
		spyOn(comp, 'initFilters');
		comp.onResetFilters();
		expect(comp.initFilters).toHaveBeenCalled();
	});
	it('Should onDeleteUser When Subscribe successfull & is_doctor 1', fakeAsync(() => {
		let Confirmation_Responce = {
			resolved: true,
		};
		let Given_Row = {
			is_doctor: 1,
			user_id: 10,
		};
		spyOn(comp, 'deleteUserMethod');
		spyOn(confirm_MockService, 'create').and.returnValue(of(Confirmation_Responce).pipe(delay(1)));
		comp.onDeleteUser(Given_Row);
		// fixture.detectChanges();
		expect(confirm_MockService.create).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.deleteUserMethod).toHaveBeenCalled();
	}));
	it('Should onDeleteUser When Subscribe successfull & is_doctor 0', fakeAsync(() => {
		let Confirmation_Responce = {
			resolved: true,
		};
		let Given_Row = {
			is_doctor: 0,
			user_id: 10,
		};
		spyOn(comp, 'deleteUserMethod');
		spyOn(confirm_MockService, 'create').and.returnValue(of(Confirmation_Responce).pipe(delay(1)));
		comp.onDeleteUser(Given_Row);
		// fixture.detectChanges();
		expect(confirm_MockService.create).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.deleteUserMethod).toHaveBeenCalled();
	}));
	it('Should onDeleteUser When Subscribe successfull & is_doctor 1 & answer.resolved does not exists', fakeAsync(() => {
		let Confirmation_Responce = {
			resolved: true,
		};
		let Given_Row = {
			is_doctor: 1,
			user_id: 10,
		};
		spyOn(comp, 'deleteUserMethod');
		spyOn(confirm_MockService, 'create').and.returnValue(of(Confirmation_Responce).pipe(delay(1)));
		comp.onDeleteUser(Given_Row);
		// fixture.detectChanges();
		expect(confirm_MockService.create).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.deleteUserMethod).toHaveBeenCalled();
	}));
	it('Should stringify Test which return json stringify', () => {
		const formValue: any = {
			comments: 'comments',
			description: 'description',
			name: 'name',
			status: true,
			result: [],
		};
		let JSON_String = comp.stringify(formValue);
		expect(JSON_String).toEqual(JSON.stringify(formValue));
	});
	it('Should Test masterToggle when isSelected True', () => {
		// spyOn(comp, 'isAllSelected').and.returnValue(of(true));
		spyOn(comp['selection'], 'clear');
		comp.masterToggle({});
		expect(comp.isAllSelected).toHaveBeenCalled();
		expect(comp['selection'].clear).toHaveBeenCalled();
	});
	it('Should isAllSelected Test', () => {
		comp.selection.selected.length = 1;
		comp.users.length = 1;
		let isAllLocations_Result = comp.isAllSelected();
		expect(isAllLocations_Result).toBe(true);
		expect(isAllLocations_Result).toBe(true);
	});
	it('Should deleteUserMethod When Subscribe successfull & Request Service successfull', fakeAsync(() => {
		
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
		let frontDeskResp = {
			status: true
		};
		spyOn(fd_MockService, 'deleteUser').and.returnValue(of(frontDeskResp).pipe(delay(1)));
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(Given_Responce).pipe(delay(1)));
		comp.deleteUserMethod(0, 0);
		fixture.detectChanges(); 
		expect(fd_MockService.deleteUser).toHaveBeenCalled();
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		
		expect(comp.users).toEqual(Given_Responce.result.data);
	}));
	it('Should getAllRoles When Subscribe successfull', fakeAsync(() => {
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
		comp.getAllRoles();
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		
		expect(comp.roles).toEqual(Given_Responce.result.data);
	}));
	it('Should confirmDel When Subscribe successfull', fakeAsync(() => {
		let Given_Responce = {
			resolved: true,
		};
		spyOn(comp, 'deleteSelected');
		spyOn(confirm_MockService, 'create').and.returnValue(of(Given_Responce).pipe(delay(1)));
		comp.confirmDel();
		expect(confirm_MockService.create).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		
		expect(comp.deleteSelected).toHaveBeenCalled();
	}));
	it('Should ChangeUserStatus Test', () => {
		spyOn(comp, 'changeUserActStatus');
		// comp.ChangeUserStatus(10, 'active', 'shift_appointment');
		expect(comp.changeUserActStatus).toHaveBeenCalled();
	});
	it('Should onLimitChange Test', () => {
		comp.onLimitChange({ target: { value: 10 } });
		expect(comp.limitPerPage).toBe(10);
	});
	it('Should onResetFilters Test', () => {
		spyOn(comp, 'initFilters');
		comp.onResetFilters();
		expect(comp.initFilters).toHaveBeenCalled();
	});
	it('Should initFilters Test', () => {
		comp.page = {
			size: 0,
			totalElements: 0,
			totalPages: 0,
			pageNumber: 0,
			offset: 0,
		};
		spyOn(comp, 'getFilteredUsers');
		comp.initFilters();
		expect(comp.getFilteredUsers).toHaveBeenCalled();
	});
	it('Should changeUserStatus When Subscribe successfull & medical_identifier true', fakeAsync(() => {
		let Confirmation_Responce = {
			resolved: true,
		};
		let Given_Row = {
			medical_identifier: true,
		};
		spyOn(comp, 'ChangeUserStatus');
		spyOn(confirm_MockService, 'create').and.returnValue(of(Confirmation_Responce).pipe(delay(1)));
		// comp.changeUserStatus(Given_Row);
		// fixture.detectChanges();
		expect(confirm_MockService.create).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.ChangeUserStatus).toHaveBeenCalled();
	}));
	it('Should changeUserStatus When Subscribe successfull & medical_identifier false', fakeAsync(() => {
		let Confirmation_Responce = {
			resolved: true,
		};
		let Given_Row = {
			medical_identifier: false,
		};
		spyOn(comp, 'ChangeUserStatus');
		spyOn(confirm_MockService, 'create').and.returnValue(of(Confirmation_Responce).pipe(delay(1)));
		// comp.changeUserStatus(Given_Row);
		// fixture.detectChanges();
		expect(confirm_MockService.create).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.ChangeUserStatus).toHaveBeenCalled();
	}));
	it('Should changeUserActStatus When Subscribe successfull', fakeAsync(() => {
		
		let Given_Responce = {
			status: true,
		};
		comp.page = {
			size: 0,
			totalElements: 0,
			totalPages: 0,
			pageNumber: 0,
			offset: 0,
		};
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(Given_Responce).pipe(delay(1)));
		spyOn(comp, 'getFilteredUsers');
		spyOn(comp.selection, 'clear');
		comp.changeUserActStatus({});
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		
		expect(comp.selection.clear).toHaveBeenCalled();
		expect(comp.getFilteredUsers).toHaveBeenCalled();
	}));
	it('Should getFilteredUsers When Subscribe successfull', fakeAsync(() => {
		
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
		spyOn(comp, 'addUrlQueryParams');
		spyOn(comp.selection, 'clear');
		comp.getFilteredUsers({ offset: 0 });
		expect(comp.addUrlQueryParams).toHaveBeenCalled();
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		
		expect(comp.loadSpin).toBe(false);
	}));
	it('Should getFilteredUsers When Subscribe UnSuccessfull', fakeAsync(() => {
		comp.page = {
			size: 0,
			totalElements: 0,
			totalPages: 0,
			pageNumber: 0,
			offset: 0,
		};
		spyOn(request_MockService, 'sendRequest').and.returnValue(throwError({ message: 'error' }));
		comp.getFilteredUsers({});
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp.loadSpin).toBeFalsy();
		flush();
	}));
	it('Should addUrlQueryParams Test', () => {
		spyOn(comp['location'], 'replaceState');
		comp.addUrlQueryParams();
		expect(comp['location'].replaceState).toHaveBeenCalled();
	});
	it('Should pageLimit Test', () => {
		comp.page = {
			size: 0,
			totalElements: 0,
			totalPages: 0,
			pageNumber: 0,
			offset: 0,
		};
		spyOn(comp.selection, 'clear');
		spyOn(comp, 'getFilteredUsers');
		comp.pageLimit(10);
		expect(comp.selection.clear);
		expect(comp.getFilteredUsers).toHaveBeenCalled();
	});
	it('Should ngOnInit Test', () => {
		comp.page = {
			size: 0,
			totalElements: 0,
			totalPages: 0,
			pageNumber: 0,
			offset: 0,
		};
		spyOn(comp, 'setTitle');
		spyOn(comp, 'getAllRoles');
		spyOn(comp, 'getFilteredUsers');
		comp.ngOnInit();
		expect(comp.setTitle).toHaveBeenCalled();
		expect(comp.getAllRoles).toHaveBeenCalled();
		expect(comp.getFilteredUsers).toHaveBeenCalled();
	});
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
	it('Should roleChange Test', () => {
		let MockName = 'Mocks names';
		comp.roles.push({ name: MockName });
		comp.roleChange({ selectedIndex: 1 });
		expect(comp.selectedRole).toBe(MockName);
	});
	it('Should deleteShiftCancel When Subscribe successfull If Status true', fakeAsync(() => {
		let Confirmation_Responce = {
			status: true,
		};
		let Given_Row = {
			is_doctor: 1,
			user_id: 10,
		};
		comp.page = {
			pageNumber:1,
			size:10,
			totalElements:100,
			totalPages:10
		}
		spyOn(comp, 'getFilteredUsers');
		spyOn(comp['selection'], 'clear');
		spyOn(fd_MockService, 'deleteUsers').and.returnValue(of(Confirmation_Responce).pipe(delay(1)));
		debugger;
		comp.deleteShiftCancel(Given_Row);
		// fixture.detectChanges();
		expect(fd_MockService.deleteUsers).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.getFilteredUsers).toHaveBeenCalled();
		expect(comp['selection'].clear).toHaveBeenCalled();
	}));
	it('Should deleteShiftCancel When Subscribe successfull If Status false', fakeAsync(() => {
		let Confirmation_Responce = {
			status: false,
			message:'Unsuccessfull'
		};
		let Given_Row = {
			is_doctor: 1,
			user_id: 10,
		};
		spyOn(comp['toastrService'],'error');
		spyOn(fd_MockService, 'deleteUsers').and.returnValue(of(Confirmation_Responce).pipe(delay(1)));
		debugger;
		comp.deleteShiftCancel(Given_Row);
		// fixture.detectChanges();
		expect(fd_MockService.deleteUsers).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp['toastrService'].error).toHaveBeenCalled();
	}));
	it('Should deleteShiftCancel When Subscribe Unsuccessfull', fakeAsync(() => {
		let Given_Row = {
			is_doctor: 1,
			user_id: 10,
		};
		spyOn(comp['toastrService'],'error');
		spyOn(fd_MockService, 'deleteUsers').and.returnValue(throwError({ statusText: 'error' }));
		debugger;
		comp.deleteShiftCancel(Given_Row);
		// fixture.detectChanges();
		expect(fd_MockService.deleteUsers).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp['toastrService'].error).toHaveBeenCalled();
	}));
	it('Should deleteSelected Test IF Row exists',fakeAsync(()=>{
		let confirm = {
			resolved:true
		}
		let obj:any = {user_id:1,is_doctor:1}
		comp.selection.selected.push(obj);
		spyOn(comp,'deleteShiftCancel');
		spyOn(confirm_MockService, 'create').and.returnValue(of(confirm).pipe(delay(1)));
		debugger;
		comp.deleteSelected({is_doctor:1,user_id:1});
		tick(15000);
		discardPeriodicTasks();

		expect(comp.deleteShiftCancel).toHaveBeenCalled();
	}));
	it('Should deleteSelected Test IF Row exists & resolved false',fakeAsync(()=>{
		let confirm = {
			resolved:false
		}
		let obj:any = {user_id:1,is_doctor:1}
		comp.selection.selected.push(obj);
		spyOn(comp,'deleteShiftCancel');
		spyOn(confirm_MockService, 'create').and.returnValue(of(confirm).pipe(delay(1)));
		debugger;
		comp.deleteSelected({is_doctor:1,user_id:1});
		tick(15000);
		discardPeriodicTasks();

		expect(comp.deleteShiftCancel).toHaveBeenCalled();
	}));
	it('Should deleteSelected Test IF Row not exists & answer true',fakeAsync(()=>{
		let confirm = {
			resolved:true
		}
		spyOn(comp,'deleteShiftCancel');
		spyOn(confirm_MockService, 'create').and.returnValue(of(confirm).pipe(delay(1)));
		comp.deleteSelected();
		tick(15000);
		discardPeriodicTasks();

		expect(comp.deleteShiftCancel).toHaveBeenCalled();
	}));
	it('Should deleteSelected Test IF Row not exists & answer false',fakeAsync(()=>{
		let confirm = {
			resolved:false
		}
		spyOn(comp,'deleteShiftCancel');
		spyOn(confirm_MockService, 'create').and.returnValue(of(confirm).pipe(delay(1)));
		comp.deleteSelected();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.deleteShiftCancel).toHaveBeenCalled();
	}));
	afterAll(() => {
		TestBed.resetTestingModule();
	});
});
