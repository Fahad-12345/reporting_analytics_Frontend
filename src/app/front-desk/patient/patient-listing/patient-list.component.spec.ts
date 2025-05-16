import { LoggerMockService } from '@appDir/shared/mock-services/LoggerMock.service';
import { RequestMockService } from '@appDir/shared/mock-services/RequestMock.service';
import { Logger } from '@nsalaun/ng-logger';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { Config } from '@appDir/config/config';
import { ToastrModule } from 'ngx-toastr';
import { SharedModule } from '@appDir/shared/shared.module';
import { TestBed, async, ComponentFixture, inject, fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DynamicFormModule } from '@appDir/shared/dynamic-form/dynamic-form.module';
import { of } from 'rxjs';
import { PatientListComponent } from './patient-list.component';
import { MainService } from '@appDir/shared/services/main-service';
import { delay } from 'rxjs/operators';
import { RequestService } from '@appDir/shared/services/request.service';
import { DynamicFormComponent } from '@appDir/shared/dynamic-form/components/dynamic-form/dynamic-form.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Socket } from 'ngx-socket-io';
describe('PatientListComponent', () => {
	let comp: PatientListComponent;
	let compDynamicForm: DynamicFormComponent;
	let fixture: ComponentFixture<PatientListComponent>;
	let fixtureDynamicForm: ComponentFixture<DynamicFormComponent>;
	let logger_MockService = new LoggerMockService();
	let request_MockService = new RequestMockService();
	function compPageSet(){
		comp.page = {
			size: 10,
			pageNumber: 1,
			totalElements: 100,
			totalPages: 10,
		};
	}
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [PatientListComponent],
			imports: [ToastrModule.forRoot(), SharedModule, RouterTestingModule, DynamicFormModule,HttpClientTestingModule ],
			providers: [
				LocalStorage,
				Config,
				{ provide: Logger, useValue: logger_MockService },
				{ provide: RequestService, useValue: request_MockService },
				{ provide: Socket, useValue: {}},
				MainService,
			],
			schemas: [NO_ERRORS_SCHEMA],
			// providers: [Config, LocalStorage, ReasonCodeService, FormBuilder]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(PatientListComponent);
		comp = fixture.componentInstance;
		fixtureDynamicForm = TestBed.createComponent(DynamicFormComponent);
		compDynamicForm = fixtureDynamicForm.componentInstance;
	});
	it('Should Create', () => {
		expect(comp).toBeTruthy();
	});
	it('Should ngOnInit Test', () => {
		let obj:any = {
			on:function() {
				return true;
			}
		}
		comp['socket'] = obj;
		spyOn(comp, 'setTitle');
		spyOn(comp, 'setConfigration');
		spyOn(comp, 'setPage');
		comp.ngOnInit();
		expect(comp.setTitle).toHaveBeenCalled();
		expect(comp.setConfigration).toHaveBeenCalled();
		expect(comp.setPage).toHaveBeenCalled();
	});
	it('Should setConfigration Test', () => {
		comp.setConfigration();
		expect(comp.fieldConfig.length).toBe(1);
	});
	it('Should onValueChanges Test If form object empty', () => {
		comp.setConfigration();
		comp.onValueChanges({ id: '' });
		expect(comp.filterFormDisabled).toBe(true);
	});
	it('Should onValueChanges Test If form object not empty', () => {
		comp.setConfigration();
		comp.onValueChanges({ id: 1 });
		expect(comp.filterFormDisabled).toBe(false);
	});
	it('Should pageLimitChange Test', () => {
		spyOn(comp, 'setPage');
		compPageSet();
		comp.pageLimitChange(10);
		expect(comp.setPage).toHaveBeenCalled();
	});
	it('Should initFilters Test', () => {
		comp.initFilters();
		expect(comp.form.value).toEqual({
			id: '',
			name: '',
			dob: '',
			phone_no: '',
		});
	});
	it('Should resetFilters Test', () => {
		spyOn(comp['form'], 'reset');
		comp.resetFilters();
		expect(comp['form'].reset).toHaveBeenCalled();
	});
	it('Should checkInputs Test', () => {
		comp.initFilters();
		comp.checkInputs();
		expect(comp.filterFormDisabled).toBe(true);
	});

	it('Should checkInputs Test When form have values', () => {
		comp.initFilters();
		comp.form.controls.name.setValue('Mock Name');
		comp.checkInputs();
		expect(comp.filterFormDisabled).toBe(false);
	});
	it('Should reset Test', () => {
		spyOn(comp, 'resetFilters');
		spyOn(comp, 'addUrlQueryParams');
		spyOn(comp, 'setPage');
		comp.reset();
		expect(comp.resetFilters).toHaveBeenCalled();
		expect(comp.addUrlQueryParams).toHaveBeenCalled();
		expect(comp.setPage).toHaveBeenCalled();
	});
	it('Should ngAfterViewInit Test', () => {
		comp.setConfigration();
		let form = comp['fb'].group({
			name: [''],
		});
		compDynamicForm.form
		comp.component = compDynamicForm;
		comp.component['form'] = form;
		comp.ngAfterViewInit();
		expect(comp.form.value).toEqual({name:''});
	});
	it('Should submit Test',()=>{
		spyOn(comp,'setPage');
		comp.initFilters();
		comp.form.controls.id.setValue(10);
		comp.submit(1);
		expect(comp.setPage).toHaveBeenCalled();
	});
	it('Should setPage When Subscribe successfull', fakeAsync(() => {
		compPageSet();
		comp.form = comp['fb'].group({
			name: [''],
		});
		let Confirmation_Responce = {
			data:[],
			result: {
				data:[],
				total:0
			},
		};
		spyOn(comp,'addUrlQueryParams');
		spyOn(comp,'ssnFormat');
		spyOn(request_MockService, 'sendRequest').and.returnValue(
			of(Confirmation_Responce).pipe(delay(1)),
		);
		comp.setPage({offset:0});
		expect(comp.loadSpin).toBe(true);
		tick(15000);
		discardPeriodicTasks();
		expect(comp.ssnFormat).toHaveBeenCalled();
		expect(comp.addUrlQueryParams).toHaveBeenCalled();
		expect(comp.loadSpin).toBe(false);
		expect(comp.page.totalElements).toBe(0);
	}));
	it('Should addUrlQueryParams Test', () => {
		spyOn(comp['location'], 'replaceState');
		comp.addUrlQueryParams();
		expect(comp['location'].replaceState).toHaveBeenCalled();
	});
	it('Should ssnFormat Test',()=>{
		let data = [
			{
				id:[10,20],
				displaId:20
			}
		]
		comp.ssnFormat(data);
		expect(comp.patients.length).toBe(1);
	});
	it('Should onReady Test',()=>{
		comp.params = {
			name:'mock name'
		}
		let form = comp['fb'].group({
			name: [''],
		});
		spyOn(comp['form'],'patchValue');
		comp.onReady(form);
		expect(comp['form'].value).toEqual({
			name:'mock name'
		})
	});
});
