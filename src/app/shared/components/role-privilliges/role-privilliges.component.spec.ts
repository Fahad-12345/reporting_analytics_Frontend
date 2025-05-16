import { LoggerMockService } from '@appDir/shared/mock-services/LoggerMock.service';
import { NO_ERRORS_SCHEMA, OnInit } from '@angular/core';
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
import { Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MainService } from '@appDir/shared/services/main-service';
import { SignatureServiceService } from '@appDir/shared/signature/services/signature-service.service';
import { FDMockService } from '@appDir/shared/mock-services/FDMockService.service';
import { SignatureMockService } from '@appDir/shared/mock-services/SignatureMock.service';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { RolePrivilegesComponent } from './role-privilliges.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
describe('RolePrivilegesComponent', () => {
	let comp: RolePrivilegesComponent;
	let fixture: ComponentFixture<RolePrivilegesComponent>;
	let request_MockService = new RequestMockService();
	let confirm_MockService = new ConfirmMockService();
	let canActivate_MockService = new CanDeactiveMockService();
	let logger_MockService = new LoggerMockService();
	let fd_MockService = new FDMockService();
	let signatureMockService = new SignatureMockService();
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [],
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
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(RolePrivilegesComponent);
		comp = fixture.componentInstance;
	});
	afterEach(() => {
		TestBed.resetTestingModule();
	});
	it('should be created', () => {
		expect(comp).toBeTruthy();
	});
	it('Should setTree Test', fakeAsync(() => {
		spyOn(comp, 'selectAllIntial');
		// spyOn(comp.database,'dataChange').and.returnValue(of(Given_Responce).pipe(delay(1)));
		comp.userPermissonData = [
			{
				id: 1,
				name: 'Patient',
				parent_id: 0,
				slug: 'patient_menu',
				submenu: [
					{
						id: 2,
						name: 'Patient List',
						parent_id: 1,
						permissions: [
							{
								created_at: '2021-07-08 11:32:43',
								created_by: null,
								deleted_at: null,
								description: 'Patient List',
								guard_name: 'api',
								id: 2,
								is_checked: 0,
								is_hidden: 0,
								is_module: 1,
								is_self: 1,
								module_id: 2,
								name: 'patient-patient-list-menu',
								order: 0,
								updated_at: '2021-07-08 11:32:43',
								updated_by: null,
							},
						],
						submenu: [
							{
								id: 2,
								name: 'Patient List',
								parent_id: 1,
								slug: 'patient_patient_list_menu',
								submenu: [],
								permissions: [
									{
										created_at: '2021-07-08 11:32:43',
										created_by: null,
										deleted_at: null,
										description: 'Patient List',
										guard_name: 'api',
										id: 2,
										is_checked: 0,
										is_hidden: 0,
										is_module: 1,
										is_self: 1,
										module_id: 2,
										name: 'patient-patient-list-menu',
										order: 0,
										updated_at: '2021-07-08 11:32:43',
										updated_by: null,
									},
								],
							},
						],
					},
				],
			},
		];
		comp.ngOnInit();
		comp.setTree();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.selectAllIntial).toHaveBeenCalled();
	}));
	it('Should getRoles Test', fakeAsync(() => {
		let Given_Responce = {
			result: {
				data: [
					{
						id: 10,
					},
				],
			},
		};
		spyOn(comp, 'setTree');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(Given_Responce).pipe(delay(1)));
		comp.getRoles();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.setTree).toHaveBeenCalled();
	}));
	it('Should ngOnChanges Test If rolePriviligesInputData.submit true', fakeAsync(() => {
		comp.rolePriviligesInputData = {
			submit: true,
			hideButtons: true,
		};
		spyOn(comp, 'submit');
		comp.ngOnChanges();
		expect(comp.submit).toHaveBeenCalled();
		expect(comp.rolePriviligesInputData.submit).toBe(false);
	}));
	it('Should ngOnChanges Test If rolePriviligesInputData.submit false', fakeAsync(() => {
		comp.rolePriviligesInputData = {
			submit: false,
			hideButtons: true,
		};
		comp.userPermissonData = [
			{
				id: 1,
				name: 'Patient',
				parent_id: 0,
				slug: 'patient_menu',
				submenu: [
					{
						id: 2,
						name: 'Patient List',
						parent_id: 1,
						permissions: [
							{
								created_at: '2021-07-08 11:32:43',
								created_by: null,
								deleted_at: null,
								description: 'Patient List',
								guard_name: 'api',
								id: 2,
								is_checked: 0,
								is_hidden: 0,
								is_module: 1,
								is_self: 1,
								module_id: 2,
								name: 'patient-patient-list-menu',
								order: 0,
								updated_at: '2021-07-08 11:32:43',
								updated_by: null,
							},
						],
						submenu: [
							{
								id: 2,
								name: 'Patient List',
								parent_id: 1,
								slug: 'patient_patient_list_menu',
								submenu: [],
								permissions: [
									{
										created_at: '2021-07-08 11:32:43',
										created_by: null,
										deleted_at: null,
										description: 'Patient List',
										guard_name: 'api',
										id: 2,
										is_checked: 0,
										is_hidden: 0,
										is_module: 1,
										is_self: 1,
										module_id: 2,
										name: 'patient-patient-list-menu',
										order: 0,
										updated_at: '2021-07-08 11:32:43',
										updated_by: null,
									},
								],
							},
						],
					},
				],
			},
		];
		spyOn(comp, 'setTree');
		spyOn(comp['permissionListSelection'], 'clear');
		spyOn(comp['parentlistSelection'], 'clear');
		comp.ngOnChanges();
		expect(comp.setTree).toHaveBeenCalled();
		expect(comp['permissionListSelection'].clear).toHaveBeenCalled();
		expect(comp['parentlistSelection'].clear).toHaveBeenCalled();
	}));
	it('Should transformer Test', () => {
		let Given_Responce = {
			result: {
				data: [
					{
						id: 10,
					},
				],
			},
		};
		let permissionItemNode = {
			id: 10,
			item: 'item',
			description: 'description',
			children: [],
			selfAndParentPermisson: [],
			isChecked: false,
			permissions: [],
			submenu: [],
			isSelf: true,
		};
		let Result = comp.transformer(permissionItemNode, 0);
		
		expect(Result.description).toMatch('description');
		expect(Result.expandable).toBe(true);
		expect(Result.id).toBe(10);
		expect(Result.isChecked).toBe(false);
		expect(Result.item).toMatch('description');
		expect(Result.level).toBe(0);
		expect(Result.permissions.length).toBe(0);
	});
	it('Should descendantsAllSelected Test', () => {
		let PermissionItemFlatNode = {
			id: 10,
			item: 'mock item name',
			description: 'description',
			selfAndParentPermisson: [],
			level: 1,
			expandable: true,
			isChecked: false,
			permissions: [
				{
					created_at: '2021-07-08 11:32:43',
					created_by: null,
					deleted_at: null,
					description: 'Patient',
					guard_name: 'api',
					id: 1,
					is_checked: 0,
					is_hidden: 0,
					is_module: 1,
					is_self: 1,
					module_id: 1,
					name: 'patient-menu',
					order: 0,
					updated_at: '2021-07-08 11:32:43',
					updated_by: null,
				},
			],
		};
		comp.ngOnInit();
		comp.treeControl.dataNodes = [
			{
				description: 'Patient',
				expandable: true,
				id: 1,
				isChecked: false,
				item: 'Patient',
				level: 0,
				permissions: [
					{
						created_at: '2021-07-08 11:32:43',
						created_by: null,
						deleted_at: null,
						description: 'Patient',
						guard_name: 'api',
						id: 1,
						is_checked: 0,
						is_hidden: 0,
						is_module: 1,
						is_self: 1,
						module_id: 1,
						name: 'patient-menu',
						order: 0,
						updated_at: '2021-07-08 11:32:43',
						updated_by: null,
					},
				],
			},
		];
		let Result = comp.descendantsAllSelected(PermissionItemFlatNode);
		
		expect(Result).toBe(true);
	});
	it('Should descendantsPartiallySelected Test', () => {
		let PermissionItemFlatNode = {
			id: 10,
			item: 'mock item name',
			description: 'description',
			selfAndParentPermisson: [],
			level: 1,
			expandable: true,
			isChecked: false,
			permissions: [
				{
					created_at: '2021-07-08 11:32:43',
					created_by: null,
					deleted_at: null,
					description: 'Patient',
					guard_name: 'api',
					id: 1,
					is_checked: 0,
					is_hidden: 0,
					is_module: 1,
					is_self: 1,
					module_id: 1,
					name: 'patient-menu',
					order: 0,
					updated_at: '2021-07-08 11:32:43',
					updated_by: null,
				},
			],
		};
		comp.ngOnInit();
		comp.treeControl.dataNodes = [
			{
				description: 'Patient',
				expandable: true,
				id: 1,
				isChecked: false,
				item: 'Patient',
				level: 0,
				permissions: [
					{
						created_at: '2021-07-08 11:32:43',
						created_by: null,
						deleted_at: null,
						description: 'Patient',
						guard_name: 'api',
						id: 1,
						is_checked: 0,
						is_hidden: 0,
						is_module: 1,
						is_self: 1,
						module_id: 1,
						name: 'patient-menu',
						order: 0,
						updated_at: '2021-07-08 11:32:43',
						updated_by: null,
					},
				],
			},
		];
		let Result = comp.descendantsPartiallySelected(PermissionItemFlatNode);
		
		expect(Result).toBe(false);
	});
	it('Should todoItemSelectionToggle Test If permissionListSelection.isSelected', () => {
		let PermissionItemFlatNode = {
			id: 10,
			item: 'mock item name',
			description: 'description',
			selfAndParentPermisson: [],
			level: 1,
			expandable: true,
			isChecked: false,
			permissions: [
				{
					created_at: '2021-07-08 11:32:43',
					created_by: null,
					deleted_at: null,
					description: 'Patient',
					guard_name: 'api',
					id: 1,
					is_checked: 0,
					is_hidden: 0,
					is_module: 1,
					is_self: 1,
					module_id: 1,
					name: 'patient-menu',
					order: 0,
					updated_at: '2021-07-08 11:32:43',
					updated_by: null,
				},
			],
		};
		spyOn(comp, 'checkAllParentsSelection');
		comp.ngOnInit();
		comp.treeControl.dataNodes = [
			{
				description: 'Patient',
				expandable: true,
				id: 1,
				isChecked: false,
				item: 'Patient',
				level: 0,
				permissions: [
					{
						created_at: '2021-07-08 11:32:43',
						created_by: null,
						deleted_at: null,
						description: 'Patient',
						guard_name: 'api',
						id: 1,
						is_checked: 0,
						is_hidden: 0,
						is_module: 1,
						is_self: 1,
						module_id: 1,
						name: 'patient-menu',
						order: 0,
						updated_at: '2021-07-08 11:32:43',
						updated_by: null,
					},
				],
			},
		];
		comp.todoItemSelectionToggle(PermissionItemFlatNode);
		
		expect(comp.checkAllParentsSelection).toHaveBeenCalled();
	});
	it('Should todoItemSelectionToggle Test If permissionListSelection.deselect', () => {
		let PermissionItemFlatNode = {
			description: 'Patient',
			expandable: true,
			id: 1,
			isChecked: true,
			item: 'Patient',
			level: 0,
			permissions: [
				{
					created_at: '2021-07-08 11:32:43',
					created_by: null,
					deleted_at: null,
					description: 'Patient',
					guard_name: 'api',
					id: 1,
					is_checked: 0,
					is_hidden: 0,
					is_module: 1,
					is_self: 1,
					module_id: 1,
					name: 'patient-menu',
					order: 0,
					updated_at: '2021-07-08 11:32:43',
					updated_by: null,
				},
			],
		};
		spyOn(comp, 'checkAllParentsSelection');
		comp.ngOnInit();
		comp.treeControl.dataNodes = [
			{
				description: 'Patient',
				expandable: true,
				id: 2,
				isChecked: false,
				item: 'Patient',
				level: 0,
				permissions: [
					{
						created_at: '2021-07-08 11:32:43',
						created_by: null,
						deleted_at: null,
						description: 'Patient',
						guard_name: 'api',
						id: 2,
						is_checked: 0,
						is_hidden: 0,
						is_module: 1,
						is_self: 1,
						module_id: 1,
						name: 'patient-menu',
						order: 0,
						updated_at: '2021-07-08 11:32:43',
						updated_by: null,
					},
				],
			},
		];
		comp.todoItemSelectionToggle(PermissionItemFlatNode);
		
		expect(comp.checkAllParentsSelection).toHaveBeenCalled();
	});
	it('Should todoLeafItemSelectionToggle Test', () => {
		let PermissionItemFlatNode = {
			description: 'Patient',
			expandable: true,
			id: 1,
			isChecked: true,
			item: 'Patient',
			level: 0,
			permissions: [
				{
					created_at: '2021-07-08 11:32:43',
					created_by: null,
					deleted_at: null,
					description: 'Patient',
					guard_name: 'api',
					id: 1,
					is_checked: 0,
					is_hidden: 0,
					is_module: 1,
					is_self: 1,
					module_id: 1,
					name: 'patient-menu',
					order: 0,
					updated_at: '2021-07-08 11:32:43',
					updated_by: null,
				},
			],
		};
		spyOn(comp, 'checkAllParentsSelection');
		comp.todoLeafItemSelectionToggle(PermissionItemFlatNode);
		
		expect(comp.checkAllParentsSelection).toHaveBeenCalled();
	});
	it('Should removeEmptyAndNullsFormObject Test', () => {
		let PermissionItemFlatNode = {
			description: '',
			expandable: true,
			id: null,
			isChecked: true,
			item: 'Patient',
			level: 0,
		};
		let Result = comp.removeEmptyAndNullsFormObject(PermissionItemFlatNode);
		
		expect(Result).toEqual({
			expandable: true,
			isChecked: true,
			item: 'Patient',
			level: 0,
		});
	});
	it('Should checkAllParentsSelection Test', () => {
		let PermissionItemFlatNode = {
			description: 'Patient',
			expandable: true,
			id: 1,
			isChecked: true,
			item: 'Patient',
			level: 1,
			permissions: [
				{
					created_at: '2021-07-08 11:32:43',
					created_by: null,
					deleted_at: null,
					description: 'Patient',
					guard_name: 'api',
					id: 1,
					is_checked: 0,
					is_hidden: 0,
					is_module: 1,
					is_self: 1,
					module_id: 1,
					name: 'patient-menu',
					order: 0,
					updated_at: '2021-07-08 11:32:43',
					updated_by: null,
				},
			],
		};
		comp.ngOnInit();
		comp.treeControl.dataNodes = [
			{
				description: 'Patient',
				expandable: true,
				id: 2,
				isChecked: false,
				item: 'Patient',
				level: 0,
				permissions: [
					{
						created_at: '2021-07-08 11:32:43',
						created_by: null,
						deleted_at: null,
						description: 'Patient',
						guard_name: 'api',
						id: 2,
						is_checked: 0,
						is_hidden: 0,
						is_module: 1,
						is_self: 1,
						module_id: 1,
						name: 'patient-menu',
						order: 0,
						updated_at: '2021-07-08 11:32:43',
						updated_by: null,
					},
				],
			},
		];
		spyOn(comp, 'getParentNode');
		comp.checkAllParentsSelection(PermissionItemFlatNode);
		
		expect(comp.getParentNode).toHaveBeenCalled();
	});
	it('Should checkRootNodeSelection Test With !nodeSelected && descAllSelected condition', () => {
		let PermissionItemFlatNode = {
			description: 'Patient',
			expandable: true,
			id: 1,
			isChecked: true,
			item: 'Patient',
			level: 1,
			permissions: [
				{
					created_at: '2021-07-08 11:32:43',
					created_by: null,
					deleted_at: null,
					description: 'Patient',
					guard_name: 'api',
					id: 1,
					is_checked: 0,
					is_hidden: 0,
					is_module: 1,
					is_self: 1,
					module_id: 1,
					name: 'patient-menu',
					order: 0,
					updated_at: '2021-07-08 11:32:43',
					updated_by: null,
				},
			],
		};
		comp.ngOnInit();
		comp.treeControl.dataNodes = [
			{
				description: 'Patient',
				expandable: true,
				id: 2,
				isChecked: false,
				item: 'Patient',
				level: 0,
				permissions: [
					{
						created_at: '2021-07-08 11:32:43',
						created_by: null,
						deleted_at: null,
						description: 'Patient',
						guard_name: 'api',
						id: 2,
						is_checked: 0,
						is_hidden: 0,
						is_module: 1,
						is_self: 1,
						module_id: 1,
						name: 'patient-menu',
						order: 0,
						updated_at: '2021-07-08 11:32:43',
						updated_by: null,
					},
				],
			},
		];
		comp.checkRootNodeSelection(PermissionItemFlatNode);
		
		expect(comp.permissionListSelection.selected.length).toBe(1);
	});
	it('Should checkRootNodeSelection Test With nodeSelected && !descAllSelected condition', () => {
		let PermissionItemFlatNode = 	{
			description: 'Patient',
			expandable: true,
			id: 1,
			isChecked: true,
			item: 'Patient',
			level: 0,
			permissions: [
				{
					created_at: '2021-07-08 11:32:43',
					created_by: null,
					deleted_at: null,
					description: 'Patient',
					guard_name: 'api',
					id: 1,
					is_checked: 0,
					is_hidden: 0,
					is_module: 1,
					is_self: 1,
					module_id: 1,
					name: 'patient-menu',
					order: 0,
					updated_at: '2021-07-08 11:32:43',
					updated_by: null,
				},
			],
		};
		comp.ngOnInit();
		comp.treeControl.dataNodes = [
			{
				description: 'Patient',
				expandable: true,
				id: 1,
				isChecked: false,
				item: 'Patient',
				level: 0,
				permissions: [
					{
						created_at: '2021-07-08 11:32:43',
						created_by: null,
						deleted_at: null,
						description: 'Patient',
						guard_name: 'api',
						id: 1,
						is_checked: 0,
						is_hidden: 0,
						is_module: 1,
						is_self: 1,
						module_id: 1,
						name: 'patient-menu',
						order: 0,
						updated_at: '2021-07-08 11:32:43',
						updated_by: null,
					},
				],
			},
		];
		comp.checkRootNodeSelection(PermissionItemFlatNode);
		
		expect(comp.permissionListSelection.selected.length).toBe(1);
	});
	it('Should getParentNode Test', () => {
		let PermissionItemFlatNode = {
			description: 'Patient',
			expandable: true,
			id: 1,
			isChecked: true,
			item: 'Patient',
			level: 0,
			permissions: [
				{
					created_at: '2021-07-08 11:32:43',
					created_by: null,
					deleted_at: null,
					description: 'Patient',
					guard_name: 'api',
					id: 1,
					is_checked: 0,
					is_hidden: 0,
					is_module: 1,
					is_self: 1,
					module_id: 1,
					name: 'patient-menu',
					order: 0,
					updated_at: '2021-07-08 11:32:43',
					updated_by: null,
				},
			],
		};
		comp.ngOnInit();
		comp.treeControl.dataNodes = [
			{
				description: 'Patient',
				expandable: true,
				id: 1,
				isChecked: false,
				item: 'Patient',
				level: 0,
				permissions: [
					{
						created_at: '2021-07-08 11:32:43',
						created_by: null,
						deleted_at: null,
						description: 'Patient',
						guard_name: 'api',
						id: 1,
						is_checked: 0,
						is_hidden: 0,
						is_module: 1,
						is_self: 1,
						module_id: 1,
						name: 'patient-menu',
						order: 0,
						updated_at: '2021-07-08 11:32:43',
						updated_by: null,
					},
				],
			},
		];
		let Result = comp.getParentNode(PermissionItemFlatNode);
		
		expect(Result).toBe(null);
	});
	it('Should getParentNode Test currentLevel greater than or equal 1', () => {
		let PermissionItemFlatNode = {
			description: 'Patient',
			expandable: false,
			id: 1,
			isChecked: true,
			item: 'Patient',
			level: 1,
			permissions: [
				{
					created_at: '2021-07-08 11:32:43',
					created_by: null,
					deleted_at: null,
					description: 'Patient',
					guard_name: 'api',
					id: 1,
					is_checked: 0,
					is_hidden: 0,
					is_module: 1,
					is_self: 1,
					module_id: 1,
					name: 'patient-menu',
					order: 0,
					updated_at: '2021-07-08 11:32:43',
					updated_by: null,
				},
				{
					created_at: '2021-07-08 11:32:43',
					created_by: null,
					deleted_at: null,
					description: 'Patient',
					guard_name: 'api',
					id: 1,
					is_checked: 0,
					is_hidden: 0,
					is_module: 1,
					is_self: 1,
					module_id: 1,
					name: 'patient-menu',
					order: 0,
					updated_at: '2021-07-08 11:32:43',
					updated_by: null,
				},
			],
		};
		comp.ngOnInit();
		comp.treeControl.dataNodes = [
			{
				description: 'Patient',
				expandable: true,
				id: 1,
				isChecked: false,
				item: 'Patient',
				level: 0,
				permissions: [
					{
						created_at: '2021-07-08 11:32:43',
						created_by: null,
						deleted_at: null,
						description: 'Patient',
						guard_name: 'api',
						id: 1,
						is_checked: 0,
						is_hidden: 0,
						is_module: 1,
						is_self: 1,
						module_id: 1,
						name: 'patient-menu',
						order: 0,
						updated_at: '2021-07-08 11:32:43',
						updated_by: null,
					},
				],
			},
		];
		let Result = comp.getParentNode(PermissionItemFlatNode);
		
		expect(Result).toBe(null);
	});
	it('Should submit Test currentLevel greater than or equal 1', () => {
		spyOn(comp['submitData'],'emit');
			comp.ngOnInit();
		comp.treeControl.dataNodes = [
			{
				description: 'Patient',
				expandable: true,
				id: 1,
				isChecked: false,
				item: 'Patient',
				level: 0,
				permissions: [
					{
						created_at: '2021-07-08 11:32:43',
						created_by: null,
						deleted_at: null,
						description: 'Patient',
						guard_name: 'api',
						id: 1,
						is_checked: 0,
						is_hidden: 0,
						is_module: 1,
						is_self: 1,
						module_id: 1,
						name: 'patient-menu',
						order: 0,
						updated_at: '2021-07-08 11:32:43',
						updated_by: null,
					},
				],
			},
		];
		comp.permissionListSelection.selected.push({
			description: 'Patient',
			expandable: false,
			id: 1,
			isChecked: true,
			item: 'Patient',
			level: 1,
			permissions: [
				{
					created_at: '2021-07-08 11:32:43',
					created_by: null,
					deleted_at: null,
					description: 'Patient',
					guard_name: 'api',
					id: 1,
					is_checked: 0,
					is_hidden: 0,
					is_module: 1,
					is_self: 1,
					module_id: 1,
					name: 'patient-menu',
					order: 0,
					updated_at: '2021-07-08 11:32:43',
					updated_by: null,
				},
				{
					created_at: '2021-07-08 11:32:43',
					created_by: null,
					deleted_at: null,
					description: 'Patient',
					guard_name: 'api',
					id: 1,
					is_checked: 0,
					is_hidden: 0,
					is_module: 1,
					is_self: 1,
					module_id: 1,
					name: 'patient-menu',
					order: 0,
					updated_at: '2021-07-08 11:32:43',
					updated_by: null,
				},
			],
		})
	
		comp.submit();
		
		expect(comp['submitData'].emit).toHaveBeenCalled();
	});
	it('Should resetDataBase Test',()=>{
		comp.ngOnInit();
		comp.treeControl.dataNodes = [
			{
				description: 'Patient',
				expandable: true,
				id: 1,
				isChecked: false,
				item: 'Patient',
				level: 0,
				permissions: [
					{
						created_at: '2021-07-08 11:32:43',
						created_by: null,
						deleted_at: null,
						description: 'Patient',
						guard_name: 'api',
						id: 1,
						is_checked: 0,
						is_hidden: 0,
						is_module: 1,
						is_self: 1,
						module_id: 1,
						name: 'patient-menu',
						order: 0,
						updated_at: '2021-07-08 11:32:43',
						updated_by: null,
					},
				],
			},
		];
		comp.userPermissonData = [
			{
				id: 1,
				name: 'Patient',
				parent_id: 0,
				slug: 'patient_menu',
				submenu: [
					{
						id: 2,
						name: 'Patient List',
						parent_id: 1,
						permissions: [
							{
								created_at: '2021-07-08 11:32:43',
								created_by: null,
								deleted_at: null,
								description: 'Patient List',
								guard_name: 'api',
								id: 2,
								is_checked: 0,
								is_hidden: 0,
								is_module: 1,
								is_self: 1,
								module_id: 2,
								name: 'patient-patient-list-menu',
								order: 0,
								updated_at: '2021-07-08 11:32:43',
								updated_by: null,
							},
						],
						submenu: [
							{
								id: 2,
								name: 'Patient List',
								parent_id: 1,
								slug: 'patient_patient_list_menu',
								submenu: [],
								permissions: [
									{
										created_at: '2021-07-08 11:32:43',
										created_by: null,
										deleted_at: null,
										description: 'Patient List',
										guard_name: 'api',
										id: 2,
										is_checked: 0,
										is_hidden: 0,
										is_module: 1,
										is_self: 1,
										module_id: 2,
										name: 'patient-patient-list-menu',
										order: 0,
										updated_at: '2021-07-08 11:32:43',
										updated_by: null,
									},
								],
							},
						],
					},
				],
			},
		];
		comp.setTree();
		spyOn(comp,'selectAllIntial');
		spyOn(comp['permissionListSelection'],'clear');
		comp.resetDataBase();
		expect(comp.selectAllIntial).toHaveBeenCalled();
		expect(comp['permissionListSelection'].clear).toHaveBeenCalled();
		expect(comp.dataSource.data.length).toBe(0);
	});
	it('Should cancel Test',()=>{
		spyOn(comp['router'],'navigate');
		comp.cancel();
		expect(comp['router'].navigate).toHaveBeenCalled();
	});
	it('Should ngOnInit Test',()=>{
		comp.ngOnInit();
		
		expect(comp.parentlistSelection.selected.length).toBe(0);
		expect(comp.permissionListSelection.selected.length).toBe(0);
	});
	afterAll(() => {
		TestBed.resetTestingModule();
	});
});
