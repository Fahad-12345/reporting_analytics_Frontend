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
import { ActivatedRoute } from '@angular/router';
import { MainService } from '@appDir/shared/services/main-service';
import { PatientProfileComponent } from './patient-profile.component';
import { FDMockService } from '@appDir/shared/mock-services/FDMockService.service';
import { DynamicFormModule } from '@appDir/shared/dynamic-form/dynamic-form.module';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { DynamicFormComponent } from '@appDir/shared/dynamic-form/components/dynamic-form/dynamic-form.component';
import { PatientProfileMockValues } from './patient-profile-mock-values';
import { CustomDiallogMockService } from '@appDir/shared/mock-services/CustomDialog.service';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
describe('PatientProfileComponent', () => {
	let comp: PatientProfileComponent;
	let compDynamicForm: DynamicFormComponent;
	let fixture: ComponentFixture<PatientProfileComponent>;
	let fixtureDynamicForm: ComponentFixture<DynamicFormComponent>;
	let request_MockService = new RequestMockService();
	let confirm_MockService = new ConfirmMockService();
	let custom_MockSerice = new CustomDiallogMockService();
	let canActivate_MockService = new CanDeactiveMockService();
	let logger_MockService = new LoggerMockService();
	let fd_MockService = new FDMockService();
	let patientProfileMockValues: PatientProfileMockValues = new PatientProfileMockValues();
	let configFields: any = patientProfileMockValues.configFiels;
	let mock_patientList  = patientProfileMockValues.patientList;
	function compFormNoteInit() {
		comp.formNote = comp['fb'].group({
			id: '',
			note: '',
		});
	}
	function pageSetValues(){
		comp.page = {
			size: 0,
			totalElements: 0,
			totalPages: 0,
			pageNumber: 0,
			offset: 0,
		};
	}
	function compFormInit(){
		comp.form = comp['fb'].group({
			id: '',
			case_type: '',
			attorney_name: '',
			insurance_name: '',
			date_of_accident: '',
			claim_no: '',
		});
	}
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [PatientProfileComponent],
			imports: [
				DynamicFormModule,
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
				{ provide: CustomDiallogService, useValue: custom_MockSerice },
				{ provide: CanDeactivateModelComponentService, useValue: canActivate_MockService },
				{ provide: FDServices, useValue: fd_MockService },
				{ provide: Logger, useValue: logger_MockService },
				{
					provide: ActivatedRoute,
					useValue: {
						queryParams: of({ id: 123 }),
						parent: {
							parent: { parent: 123 },
						},
						snapshot: {
							pathFromRoot: [{ params: { id: 123 } }],
							params: { id: 123 },
						},
						params: of({ id: 123 }),
					},
				},
			],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(PatientProfileComponent);
		comp = fixture.componentInstance;
		fixtureDynamicForm = TestBed.createComponent(DynamicFormComponent);
		compDynamicForm = fixtureDynamicForm.componentInstance;
	});
	afterEach(() => {
		TestBed.resetTestingModule();
	});
	it('should be created', () => {
		expect(comp).toBeTruthy();
	});
	it('Should pageLimit call and setpage fun will execute page size will be set', () => {
		spyOn(comp, 'setPage');
		comp.pageLimit(10);
		expect(comp.page.size).toBe(10);
		expect(comp.setPage).toHaveBeenCalled();
	});
	it('Should resetFilter reset complete form and collapse should be false', () => {
		spyOn(comp.form, 'patchValue');
		comp.resetFilters();
		expect(comp.isCollapsed).toBe(false);
		expect(comp.form.patchValue).toHaveBeenCalled();
		expect(comp.form.value).toEqual({
			id: '',
			case_type: '',
			attorney_name: '',
			insurance_name: '',
			date_of_accident: '',
			claim_no: '',
		});
	});
	it('When reset button click three function must call', () => {
		spyOn(comp, 'resetFilters');
		spyOn(comp, 'addUrlQueryParams');
		spyOn(comp, 'setPage');
		comp.reset();
		expect(comp.resetFilters).toHaveBeenCalled();
		expect(comp.addUrlQueryParams).toHaveBeenCalled();
		expect(comp.setPage).toHaveBeenCalled();
	});
	it('Should get patient by id and check all information same', fakeAsync(() => {
		// spyOn(comp, 'getPatient').and.returnValue(of(mock_patientList[0]));
		spyOn(comp, 'showPharmacyOfPatient');
		const params = {
			filter: true,
			per_page: 10,
			page: 1,
			pagination: 1,
			order_by: OrderEnum.DEC,
			id: 779,
		};
		comp.getPatient(779);
		expect(comp.getPatient).toHaveBeenCalled();
		tick();
		comp.patient = mock_patientList;
		expect(comp.patient).toBeDefined();
		expect(comp.patient[0]).toEqual(mock_patientList[0]);
	}));
	it('Should ngOnInit Test', () => {
		spyOn(comp, 'setTitle');
		spyOn(comp, 'setConfigration');
		spyOn(comp, 'getPatient');
		spyOn(comp, 'setPage');
		spyOn(comp, 'checkInputs');
		comp.ngOnInit();
		expect(comp.checkInputs).toHaveBeenCalled();
		expect(comp.caseUpdateForm.value).toEqual({
			status_id: null,
		});
	});
	it('Should onReady Test', () => {
		comp.params = {
			id: 10,
		};
		let form = comp['fb'].group({
			id: [''],
		});
		comp.onReady(form);
		expect(comp.form.value).toEqual({
			id: 10,
		});
	});
	it('should getPatient Test When requestService Subscribe successfull ', fakeAsync(() => {
		let ResutGetPatient = patientProfileMockValues.ResutGetPatient;
		spyOn(comp, 'showPharmacyOfPatient');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(ResutGetPatient).pipe(delay(1)));
		comp.getPatient(1);
		tick(15000);
		discardPeriodicTasks();
		expect(comp.showPharmacyOfPatient).toHaveBeenCalled();
		expect(comp.patient).toEqual(ResutGetPatient.result.data[0]);
		expect(comp.contactPerson).toEqual(ResutGetPatient.result.data[0].emergency);
		expect(comp.patientAddress).toEqual(
			ResutGetPatient.result.data[0].self.contact_information.mail_address,
		);
		expect(comp.patientdata).toEqual(ResutGetPatient.result.data[0].self.contact_information);
		expect(comp.relationship).toMatch(
			ResutGetPatient.result.data[0].emergency.contact_person_relation.name,
		);
	}));
	it('Should ssnFormat Test', () => {
		comp.ssnFormat({ id: [10, 20] });
		expect(comp.patient.displaId).toMatch('000-10-0,20');
	});
	it('should submitNote Test When requestService Subscribe successfull ', fakeAsync(() => {
		compFormNoteInit();
		comp.formNote.controls.note.setValue('Here are some notes');
		comp.patient = patientProfileMockValues.patientResponce;
		spyOn(request_MockService, 'sendRequest').and.returnValue(
			of({ statusCode: 200 }).pipe(delay(1)),
		);
		comp.submitNote();
		tick(15000);
		discardPeriodicTasks();
		expect(comp).toBeTruthy();
	}));
	it('should submitNote Test When requestService Subscribe Unsuccessfull ', fakeAsync(() => {
		compFormNoteInit;
		comp.formNote.controls.note.setValue('Here are some notes');
		comp.patient = patientProfileMockValues.patientResponce;
		spyOn(request_MockService, 'sendRequest').and.returnValue(throwError({ error: 'error' }));
		comp.submitNote();
		tick(15000);
		discardPeriodicTasks();
		expect(comp).toBeTruthy();
	}));
	it('Should setPage When Subscribe successfull', fakeAsync(() => {
		let Given_Responce = {
			status: 200,
			result: {
				data: [{ id: 123 }],
				total: 265,
			},
		};
		pageSetValues();
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(Given_Responce).pipe(delay(1)));
		spyOn(comp, 'addUrlQueryParams');
		spyOn(comp.selection, 'clear');
		comp.setPage({ offset: 0 });
		expect(comp.addUrlQueryParams).toHaveBeenCalled();
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.cases.length).toBe(Given_Responce.result.data.length);
		expect(comp.page.totalElements).toBe(Given_Responce.result.total);
		expect(comp.loadSpin).toBe(false);
	}));
	it('Should setPage When Subscribe UnSuccessfull', fakeAsync(() => {
		pageSetValues();
		spyOn(request_MockService, 'sendRequest').and.returnValue(throwError({ error: 'error' }));
		comp.setPage({ offset: 0 });
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp.loadSpin).toBeFalsy();
		flush();
	}));
	it('Should addUrlQueryParams Test', () => {
		spyOn(comp['location'], 'replaceState');
		comp.addUrlQueryParams();
		expect(comp['location'].replaceState).toHaveBeenCalled();
	});
	it('Should ngAfterViewInit Test', () => {
		comp.setConfigration();
		let form = comp['fb'].group({
			name: [''],
		});
		compDynamicForm.form;
		comp.component = compDynamicForm;
		comp.component['form'] = form;
		comp.ngAfterViewInit();
		expect(comp.form.value).toEqual({ name: '' });
	});
	it('Should deleteSelected Test If id exists', fakeAsync(() => {
		pageSetValues();
		spyOn(request_MockService, 'sendRequest').and.returnValue(of({status:true}).pipe(delay(1)));
		spyOn(comp['selection'], 'clear');
		spyOn(comp, 'setPage');
		comp.deleteSelected(10);
		tick(15000);
		discardPeriodicTasks();
		expect(comp.setPage).toHaveBeenCalled();
		expect(comp['selection'].clear).toHaveBeenCalled();
	}));
	it('Should Test stringfy function which convert object', () => {
		const obj = comp.stringfy({ name: 'name mock' });
		expect(obj).toContain('{"name":"name mock"}');
	});
	it('Should Test isAllSelected', () => {
		comp.selection.selected.length = 10;
		comp.cases = mock_patientList;
		let result = comp.isAllSelected();
		expect(result).toBe(false);
	});
	it('Should Test masterToggle when isSelected True', () => {
		// spyOn(comp, 'isAllSelected').and.returnValue(of(true));
		spyOn(comp.selection, 'clear');
		comp.masterToggle(null);
		expect(comp.isAllSelected).toHaveBeenCalled();
		expect(comp.selection.clear).toHaveBeenCalled();
	});
	it('Should Test masterToggle when isSelected False', () => {
		spyOn(comp, 'isAllSelected').and.returnValue(false);
		comp.cases = [2];
		comp.masterToggle(null);
		expect(comp.isAllSelected).toHaveBeenCalled();
	});
	it('Should confirmDel When Subscribe successfull', fakeAsync(() => {
		spyOn(comp, 'deleteSelected');
		// spyOn(custom_MockSerice, 'confirm').and.returnValue(Promise.resolve(true));
		comp.confirmDel();
		expect(custom_MockSerice.confirm).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.deleteSelected).toHaveBeenCalled();
	}));
	it('Should goToCaseDetail Test', () => {
		spyOn(comp['router'], 'navigate');
		comp.goToCaseDetail(1,{is_active:true});
		expect(comp['router'].navigate).toHaveBeenCalled();
	});
	it('Should childNavigation Test', () => {
		spyOn(comp, 'navigatToChild');
		comp.childNavigation(1);
		expect(comp.navigatToChild).toHaveBeenCalled();
	});
	it('Should addNewCase Test', () => {
		spyOn(comp['router'], 'navigate');
		comp.addNewCase();
		expect(comp['router'].navigate).toHaveBeenCalled();
	});
	it('Should showPharmacyOfPatient Test', () => {
		comp.showPharmacyOfPatient(true);
		expect(comp.patientPharmacyDetail).toBe(true);
	});
	it('Should fieldConfig Test', () => {
		comp.setConfigration();
		expect(comp.fieldConfig.length).toBe(1);
	});
	it('Should onPageChange Test', () => {
		pageSetValues();
		spyOn(comp, 'setPage');
		comp.onPageChange(10);
		expect(comp.setPage).toHaveBeenCalled();
	});
	it('Should goToErx Test', () => {
		spyOn(comp['router'], 'navigate');
		comp.goToErx();
		expect(comp['router'].navigate).toHaveBeenCalled();
	});
	it('Should patientEmit Test', () => {
		spyOn(comp['refresh'], 'next');
		comp.tabset = patientProfileMockValues.tabSet;
		comp.patientEmit(10);
		expect(comp['refresh'].next).toHaveBeenCalled();
	});
	it('Should editCaseStatus Test', () => {
		comp.caseUpdateForm = comp['fb'].group({
			status_id: [''],
		});
		spyOn(comp['modalService'], 'open');
		comp.editCaseStatus('caseStatusModal', 10);
		expect(comp.currentCase).toBe(10);
		expect(comp['modalService'].open);
	});
	it('Should selectionOnValueChange Test', () => {
		comp.caseUpdateForm = comp['fb'].group({
			status_id: [''],
		});
		comp.selectionOnValueChange({ formValue: 10 });
		expect(comp.caseUpdateForm.value).toEqual({
			status_id: 10,
		});
	});
	it('Should updateCaseStatus When Subscribe successfull', fakeAsync(() => {
		let Given_Responce = {
			resolved: true,
		};
		comp.caseUpdateForm = comp['fb'].group({
			status_id: [''],
		});
		pageSetValues();
		comp.currentCase = {
			id: 10,
		};
		spyOn(comp, 'setPage');
		spyOn(comp['modalService'], 'dismissAll');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(Given_Responce).pipe(delay(1)));
		comp.updateCaseStatus();
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp.caseStatusUpdateBoolean).toBe(true);
		tick(15000);
		discardPeriodicTasks();
		expect(comp.setPage).toHaveBeenCalled();
		expect(comp.caseStatusUpdateBoolean).toBe(false);
		expect(comp.page.pageNumber).toBe(1);
	}));
	it('Should updateCaseStatus When Subscribe Unsuccessfull', fakeAsync(() => {
		comp.caseUpdateForm = comp['fb'].group({
			status_id: [''],
		});
		comp.currentCase = {
			id: 10,
		};
		spyOn(request_MockService, 'sendRequest').and.returnValue(throwError({ error: 'error' }));
		comp.updateCaseStatus();
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.caseStatusUpdateBoolean).toBe(false);
	}));
	it('Should onValueChanges Test If isEmptyObject true', () => {
		comp.fieldConfig = configFields;
		let form = {
			id: '',
		};
		comp.onValueChanges(form);
		expect(comp.filterFormDisabled).toBe(true);
	});
	it('Should onValueChanges Test If isEmptyObject false', () => {
		comp.fieldConfig = configFields;
		let form = {
			id: 10,
		};
		comp.onValueChanges(form);
		expect(comp.filterFormDisabled).toBe(false);
	});
	it('Should checkInputs Test', () => {
		compFormInit();
		comp.form.controls.id.setValue(10);
		comp.checkInputs();
		expect(comp.filterFormDisabled).toBe(false);
	});
	it('Should checkInputs Test If form true', () => {
		compFormInit();
		comp.checkInputs();
		expect(comp.filterFormDisabled).toBe(true);
	});
	afterAll(() => {
		TestBed.resetTestingModule();
	});
});
