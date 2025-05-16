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
import { Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MainService } from '@appDir/shared/services/main-service';
import { SignatureServiceService } from '@appDir/shared/signature/services/signature-service.service';
import { FDMockService } from '@appDir/shared/mock-services/FDMockService.service';
import { SignatureMockService } from '@appDir/shared/mock-services/SignatureMock.service';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import {
	ChecklistDatabase,
	FolderPermissionTreeComponent,
} from './folder-permission-tree.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
describe('FolderPermissionTreeComponent', () => {
	let comp: FolderPermissionTreeComponent;
	let compChecklistDatabase: ChecklistDatabase;
	let fixture: ComponentFixture<FolderPermissionTreeComponent>;
	let fixtureChecklistDatabase: ComponentFixture<ChecklistDatabase>;
	let request_MockService = new RequestMockService();
	let confirm_MockService = new ConfirmMockService();
	let canActivate_MockService = new CanDeactiveMockService();
	let logger_MockService = new LoggerMockService();
	let fd_MockService = new FDMockService();
	let signatureMockService = new SignatureMockService();
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [],
			imports: [SharedModule, RouterTestingModule, ToastrModule.forRoot(), BrowserAnimationsModule,HttpClientTestingModule],
			schemas: [NO_ERRORS_SCHEMA],
			providers: [
				ChecklistDatabase,
				Config,
				LocalStorage,
				ToastrService,
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
		fixture = TestBed.createComponent(FolderPermissionTreeComponent);
		comp = fixture.componentInstance;
		fixtureChecklistDatabase = TestBed.get(ChecklistDatabase);
		compChecklistDatabase = fixtureChecklistDatabase.componentInstance;
	});
	afterEach(() => {
		TestBed.resetTestingModule();
	});
	it('should be created', () => {
		expect(comp).toBeTruthy();
	});
	it('Should ngOnChanges Test', () => {
		let object: any = {
			data: {
				currentValue: {
					data: [
						{
							facility_id: 1,
							folder_type_id: 1,
							id: 1,
							is_checked: 1,
							name: 'Citimed',
							show_files: 1,
							slug: 'facility_name',
							speciality_id: null,
							sub_folders: [
								{
									created_by: null,
									description: null,
									facility_id: 1,
									folder_type_id: 2,
									id: 2,
									is_checked: 1,
									name: 'KIOSK',
									parent_id: 1,
									show_files: 1,
									slug: 'kiosk',
									speciality_id: null,
									sub_folders: [],
									updated_by: null,
								},
							],
						},
					],
				},
				firstChange: false,
				previousValue: {
					data: [
						{
							facility_id: 1,
							folder_type_id: 1,
							id: 1,
							is_checked: 1,
							name: 'Citimed',
							show_files: 1,
							slug: 'facility_name',
							speciality_id: null,
							sub_folders: [
								{
									created_by: null,
									description: null,
									facility_id: 1,
									folder_type_id: 2,
									id: 2,
									is_checked: 1,
									name: 'KIOSK',
									parent_id: 1,
									show_files: 1,
									slug: 'kiosk',
									speciality_id: null,
									sub_folders: [],
									updated_by: null,
								},
							],
						},
					],
				},
			},
		};
		comp.data = object;
		spyOn(comp['checklistSelection'], 'clear');
		spyOn(comp['_database'], 'initialize');
		comp.ngOnChanges(object);
		expect(comp['checklistSelection'].clear).toHaveBeenCalled();
		expect(comp['_database'].initialize).toHaveBeenCalled();
	});
	it('Should transformer Test', () => {
		let object: any = {
			children: [
				{
					children: [],
					item: {
						created_by: null,
						description: null,
						facility_id: 1,
						folder_type_id: 2,
						id: 2,
						is_checked: 1,
						name: 'KIOSK',
						parent_id: 1,
						show_files: 1,
						slug: 'kiosk',
						speciality_id: null,
						updated_by: null,
					},
				},
			],
		};
		let Result = comp.transformer(object, 0);
		
		expect(Result.expandable).toBe(true);
		expect(Result.item).toBeUndefined();
		expect(Result.level).toBe(0);
	});
	it('Should descendantsAllSelected Test', () => {
		let TodoItemFlatNode: any = [{
			expandable: true,
			item: {
				facility_id: 1,
				folder_type_id: 1,
				id: 1,
				is_checked: 0,
				name: 'Citimed',
				parent_id: undefined,
				show_files: 0,
				slug: 'facility_name',
				speciality_id: null,
			},
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
			level: 0,
		}];
		comp.treeControl.dataNodes = [
			{
				expandable: true,
				item: {
					facility_id: 1,
					folder_type_id: 1,
					id: 1,
					is_checked: false,
					name: 'Citimed',
					description: 'description',
					parent_id: undefined,
					show_files: false,
					sub_folders: [],
					slug: 'facility_name',
					speciality_id: null,
				},
				level: 0,
			},
			{
				expandable: false,
				item: {
					description: null,
					facility_id: 1,
					folder_type_id: 2,
					id: 2,
					is_checked: true,
					name: 'KIOSK',
					parent_id: 1,
					show_files: true,
					slug: 'kiosk',
					sub_folders: [],
					speciality_id: null,
				},
				level: 1,
			},
		];
		fixture.detectChanges();
		let Result = comp.descendantsAllSelected(TodoItemFlatNode);
		
		expect(Result).toBe(true);
	});
	it('Should descendantsPartiallySelected Test', () => {
		let TodoItemFlatNode: any = {
			expandable: true,
			item: {
				facility_id: 1,
				folder_type_id: 1,
				id: 1,
				is_checked: 0,
				name: 'Citimed',
				parent_id: undefined,
				show_files: 0,
				slug: 'facility_name',
				speciality_id: null,
			},
			level: 0,
		};
		// fixture.detectChanges();
		let Result = comp.descendantsPartiallySelected(TodoItemFlatNode);
		
		expect(Result).toBeFalsy();
	});
	it('Should todoItemSelectionToggle Test skipChild false', () => {
		let TodoItemFlatNode: any = {
			expandable: true,
			item: {
				facility_id: 1,
				folder_type_id: 1,
				id: 1,
				is_checked: 0,
				name: 'Citimed',
				parent_id: undefined,
				show_files: 0,
				slug: 'facility_name',
				speciality_id: null,
			},
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
			level: 0,
		};
		spyOn(comp, 'checkAllParentsSelection');
		fixture.detectChanges();
		let Result = comp.todoItemSelectionToggle(TodoItemFlatNode, { checked: true }, false);
		
		expect(comp.checkAllParentsSelection).toHaveBeenCalled();
	});
	it('Should todoItemSelectionToggle Test skipChild true', fakeAsync(() => {
		let TodoItemFlatNode: any = {
			expandable: true,
			item: {
				facility_id: 1,
				folder_type_id: 1,
				id: 1,
				is_checked: 0,
				name: 'Citimed',
				parent_id: undefined,
				show_files: 0,
				slug: 'facility_name',
				speciality_id: null,
			},
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
			level: 0,
		};
		fixture.detectChanges();
		let Result = comp.todoItemSelectionToggle(TodoItemFlatNode, { checked: false }, true);
		
		tick(500);
		fixture.detectChanges();
		expect(Result).toBeUndefined();
	}));
	it('Should todoLeafItemSelectionToggle Test checked true', fakeAsync(() => {
		spyOn(comp, 'checkAllParentsSelection');
		let TodoItemFlatNode: any = {
			expandable: true,
			item: {
				facility_id: 1,
				folder_type_id: 1,
				id: 1,
				is_checked: 0,
				name: 'Citimed',
				parent_id: undefined,
				show_files: 0,
				slug: 'facility_name',
				speciality_id: null,
			},
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
			level: 0,
		};
		fixture.detectChanges();
		let Result = comp.todoLeafItemSelectionToggle(TodoItemFlatNode, { checked: true });
		
		tick(500);
		fixture.detectChanges();
		
		expect(comp.checkAllParentsSelection).toHaveBeenCalled();
		expect(Result).toBeUndefined();
	}));
	it('Should todoLeafItemSelectionToggle Test checked false', fakeAsync(() => {
		spyOn(comp, 'checkAllParentsSelection');
		let TodoItemFlatNode: any = {
			expandable: true,
			item: {
				facility_id: 1,
				folder_type_id: 1,
				id: 1,
				is_checked: 0,
				name: 'Citimed',
				parent_id: undefined,
				show_files: 0,
				slug: 'facility_name',
				speciality_id: null,
			},
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
			level: 0,
		};
		fixture.detectChanges();
		let Result = comp.todoLeafItemSelectionToggle(TodoItemFlatNode, { checked: false });
		
		tick(500);
		fixture.detectChanges();
		
		expect(comp.checkAllParentsSelection).toHaveBeenCalled();
		expect(Result).toBeUndefined();
	}));
	it('Should checkAllParentsSelection Test', () => {
		let TodoItemFlatNode: any = {
			expandable: true,
			item: {
				facility_id: 1,
				folder_type_id: 1,
				id: 1,
				is_checked: 0,
				name: 'Citimed',
				parent_id: undefined,
				show_files: 0,
				slug: 'facility_name',
				speciality_id: null,
			},
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
			level: 0,
		};
		TestBed.createComponent(FolderPermissionTreeComponent);

		spyOn(comp, 'getParentNode');
		comp.checkAllParentsSelection(TodoItemFlatNode);
		
		expect(comp).toBeTruthy();
	});
	it('Should checkRootNodeSelection Test', () => {
		spyOn(comp['checklistSelection'], 'select');
		let TodoItemFlatNode: any = [
			{
				expandable: true,
				item: {
					facility_id: 1,
					folder_type_id: 1,
					id: 1,
					is_checked: false,
					name: 'Citimed',
					description: 'description',
					parent_id: undefined,
					show_files: false,
					sub_folders: [],
					slug: 'facility_name',
					speciality_id: null,
				},
				level: 0,
			},
			{
				expandable: false,
				item: {
					description: null,
					facility_id: 1,
					folder_type_id: 2,
					id: 2,
					is_checked: true,
					name: 'KIOSK',
					parent_id: 1,
					show_files: true,
					slug: 'kiosk',
					sub_folders: [],
					speciality_id: null,
				},
				level: 1,
			},
		];
		comp.treeControl.dataNodes = [
			{
				expandable: true,
				item: {
					facility_id: 1,
					folder_type_id: 1,
					id: 1,
					is_checked: false,
					name: 'Citimed',
					description: 'description',
					parent_id: undefined,
					show_files: false,
					sub_folders: [],
					slug: 'facility_name',
					speciality_id: null,
				},
				level: 0,
			},
			{
				expandable: false,
				item: {
					description: null,
					facility_id: 1,
					folder_type_id: 2,
					id: 2,
					is_checked: true,
					name: 'KIOSK',
					parent_id: 1,
					show_files: true,
					slug: 'kiosk',
					sub_folders: [],
					speciality_id: null,
				},
				level: 1,
			},
		];
		// fixture.detectChanges();
		
		comp.checkRootNodeSelection(TodoItemFlatNode);
		
		expect(comp['checklistSelection'].select).toHaveBeenCalled();
	});
	it('Should getParentNode Test', () => {
		let TodoItemFlatNode: any = [
			{
				expandable: true,
				item: {
					facility_id: 1,
					folder_type_id: 1,
					id: 1,
					is_checked: false,
					name: 'Citimed',
					description: 'description',
					parent_id: undefined,
					show_files: false,
					sub_folders: [],
					slug: 'facility_name',
					speciality_id: null,
				},
				level: 0,
			},
			{
				expandable: false,
				item: {
					description: null,
					facility_id: 1,
					folder_type_id: 2,
					id: 2,
					is_checked: true,
					name: 'KIOSK',
					parent_id: 1,
					show_files: true,
					slug: 'kiosk',
					sub_folders: [],
					speciality_id: null,
				},
				level: 1,
			},
		];
		TestBed.createComponent(FolderPermissionTreeComponent);
		comp.treeControl.dataNodes = [
			{
				expandable: true,
				item: {
					facility_id: 1,
					folder_type_id: 1,
					id: 1,
					is_checked: false,
					name: 'Citimed',
					description: 'description',
					parent_id: undefined,
					show_files: false,
					sub_folders: [],
					slug: 'facility_name',
					speciality_id: null,
				},
				level: 0,
			},
			{
				expandable: false,
				item: {
					description: null,
					facility_id: 1,
					folder_type_id: 2,
					id: 2,
					is_checked: true,
					name: 'KIOSK',
					parent_id: 1,
					show_files: true,
					slug: 'kiosk',
					sub_folders: [],
					speciality_id: null,
				},
				level: 1,
			},
		];
		let Result = comp.getParentNode(TodoItemFlatNode);
		
		expect(Result).toBe(null);
	});
	it('Should getParentNode Test currentLevel greater than or equal 1', () => {
		let TodoItemFlatNode: any = [
			{
				expandable: true,
				item: {
					facility_id: 1,
					folder_type_id: 1,
					id: 1,
					is_checked: false,
					name: 'Citimed',
					description: 'description',
					parent_id: undefined,
					show_files: false,
					sub_folders: [],
					slug: 'facility_name',
					speciality_id: null,
				},
				level: 0,
			},
			{
				expandable: false,
				item: {
					description: null,
					facility_id: 1,
					folder_type_id: 2,
					id: 2,
					is_checked: true,
					name: 'KIOSK',
					parent_id: 1,
					show_files: true,
					slug: 'kiosk',
					sub_folders: [],
					speciality_id: null,
				},
				level: 1,
			},
		];
		let Result = comp.getParentNode(TodoItemFlatNode);
		
		expect(Result).toBe(null);
	});
	it('Should addNewItem Test', () => {
		spyOn(comp['treeControl'], 'expand');
		spyOn(comp['_database'], 'insertItem');
		let TodoItemFlatNode: any = [
			{
				expandable: true,
				item: {
					facility_id: 1,
					folder_type_id: 1,
					id: 1,
					is_checked: false,
					name: 'Citimed',
					description: 'description',
					parent_id: undefined,
					show_files: false,
					sub_folders: [],
					slug: 'facility_name',
					speciality_id: null,
				},
				level: 0,
			},
			{
				expandable: false,
				item: {
					description: null,
					facility_id: 1,
					folder_type_id: 2,
					id: 2,
					is_checked: true,
					name: 'KIOSK',
					parent_id: 1,
					show_files: true,
					slug: 'kiosk',
					sub_folders: [],
					speciality_id: null,
				},
				level: 1,
			},
		];
		comp.addNewItem(TodoItemFlatNode);
		expect(comp['treeControl'].expand).toHaveBeenCalled();
		expect(comp['_database'].insertItem).toHaveBeenCalled();
	});
	it('Should saveNode Test', () => {
		spyOn(comp['treeControl'], 'expand');
		let TodoItemFlatNode: any = [
			{
				expandable: true,
				item: {
					facility_id: 1,
					folder_type_id: 1,
					id: 1,
					is_checked: false,
					name: 'Citimed',
					description: 'description',
					parent_id: undefined,
					show_files: false,
					sub_folders: [],
					slug: 'facility_name',
					speciality_id: null,
				},
				level: 0,
			},
			{
				expandable: false,
				item: {
					description: null,
					facility_id: 1,
					folder_type_id: 2,
					id: 2,
					is_checked: true,
					name: 'KIOSK',
					parent_id: 1,
					show_files: true,
					slug: 'kiosk',
					sub_folders: [],
					speciality_id: null,
				},
				level: 1,
			},
		];
		let given = {
			id: 10,
			name: 'name',
			slug: 'facility',
			description: 'description',
			parent_id: 10,
			folder_type_id: 5,
			show_files: false,
			sub_folders: [],
			facility_id: 21,
			speciality_id: 2,
			is_checked: false,
		};
		spyOn(comp['_database'], 'updateItem');
		comp.saveNode(TodoItemFlatNode, given);
		expect(comp['_database'].updateItem).toHaveBeenCalled();
	});
	it('Should selectAllIntial Test If desendants length', () => {
		let object: any = {
			children: [
				{
					children: [],
					item: {
						created_by: null,
						description: null,
						facility_id: 1,
						folder_type_id: 2,
						id: 2,
						is_checked: 1,
						name: 'KIOSK',
						parent_id: 1,
						show_files: 1,
						slug: 'kiosk',
						speciality_id: null,
						updated_by: null,
					},
				},
			],
		};
		comp.dataSource.data = [object];
		comp.selectAllIntial();
		
		expect(comp.data.result.length).toBe(2);
	});
	it('Should selectAllIntial Test If desendants length less 1', () => {
		let object: any = {
			children: [
				{
					children: [],
					item: {
						created_by: null,
						description: null,
						facility_id: 1,
						folder_type_id: 2,
						id: 2,
						is_checked: 1,
						name: 'KIOSK',
						parent_id: 1,
						show_files: 1,
						slug: 'kiosk',
						speciality_id: null,
						updated_by: null,
					},
				},
			],
		};
		comp.dataSource.data = object.children;
		comp.selectAllIntial();
		
		expect(comp.data.result.length).toBe(1);
	});
	it('Should showFile Test IF checked true', () => {
		spyOn(comp, 'todoLeafItemSelectionToggle');
		let TodoItemFlatNode: any = {
			expandable: true,
			item: {
				facility_id: 1,
				folder_type_id: 1,
				id: 1,
				is_checked: false,
				name: 'Citimed',
				description: 'description',
				parent_id: undefined,
				show_files: false,
				sub_folders: [],
				slug: 'facility_name',
				speciality_id: null,
			},
			level: 0,
		};
		comp.showFile({ checked: true }, TodoItemFlatNode, 0);
		expect(comp.todoLeafItemSelectionToggle).toHaveBeenCalled();
	});
	it('Should showFile Test IF checked false', () => {
		let TodoItemFlatNode: any = {
			expandable: true,
			item: {
				facility_id: 1,
				folder_type_id: 1,
				id: 1,
				is_checked: false,
				name: 'Citimed',
				description: 'description',
				parent_id: undefined,
				show_files: false,
				sub_folders: [],
				slug: 'facility_name',
				speciality_id: null,
			},
			level: 0,
		};
		comp.showFile({ checked: false }, TodoItemFlatNode, 0);
		expect(comp).toBeTruthy();
	});
	afterAll(() => {
		TestBed.resetTestingModule();
	});
});
