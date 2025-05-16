import { EORService } from './../eor.service';
import { EorMockService } from './../../../shared/mock-services/EorMockService.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
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
import { ToastrService } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { delay } from 'rxjs';
import { of } from 'rxjs';
import { EorFilterComponent } from './eor-filter.component';
import { EorFilterMockValues } from './eor-filter-mock-values/eor-filter-mock-values';
describe('EorFilterComponent', () => {
	let comp: EorFilterComponent;
	let fixture: ComponentFixture<EorFilterComponent>;
	let eorMockService = new EorMockService();
	let eorFilterGetMockValues = new EorFilterMockValues();
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				SharedModule,
				RouterTestingModule,
				BrowserAnimationsModule,
				HttpClientTestingModule,
			],
			schemas: [NO_ERRORS_SCHEMA],
			providers: [
				Config,
				LocalStorage,
				ToastrService,
				{ provide: EORService, useValue: eorMockService },
			],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(EorFilterComponent);
		comp = fixture.componentInstance;
	});
	afterEach(() => {
		TestBed.resetTestingModule();
	});
	it('should be created', () => {
		expect(comp).toBeTruthy();
	});
	it('Should ngOnInit Test', fakeAsync(() => {
		spyOn(eorMockService, 'pullFilterFormReset').and.returnValue(of(true));
		spyOn(comp, 'valueAssignInListOfFieldArray');
		spyOn(comp, 'resetCase');
		spyOn(window, 'setTimeout');
		comp.ngOnInit();
		discardPeriodicTasks();
		tick(15000);
		expect(comp.valueAssignInListOfFieldArray).toHaveBeenCalled();
		expect(comp.resetCase).toHaveBeenCalled();
		expect(window.setTimeout).toHaveBeenCalled();
		expect(comp.isCollapsed).toBe(false);
	}));
	it('Should initializeSearchForm Test In that verify when function will call then an object will return whose values must matched.', () => {
		let InitSearchFormResp = comp.initializeSearchForm();
		expect(InitSearchFormResp.value).toEqual(eorFilterGetMockValues.initializeSearchFormResp);
	});
	it('Should resetCase Test Here Need to InitSearchForm and should run eventsSubject.next().',()=>{
		spyOn(comp['eorService'],'pushDoSearch');
		spyOn(comp['eventsSubject'],'next');
		comp.resetCase(true);
		expect(comp['eorService'].pushDoSearch).toHaveBeenCalled();
		expect(comp['eventsSubject'].next).toHaveBeenCalled();
	});
	it('Should checkInputs function Test should return true', () => {
		comp.searchForm = comp.initializeSearchForm();
		let Result = comp.checkInputs();
		expect(Result).toBe(true);
	});
	it('Should checkInputs function Test When SearchForm have values and should return false', () => {
		comp.searchForm = comp.initializeSearchForm();
		comp.searchForm.controls.attorney_ids.setValue([10]);
		let Result = comp.checkInputs();
		expect(Result).toBe(false);
	});
	it('Should getSpeciality Test,We Will check getSpeciality function should run and get values.', fakeAsync(() => {
		spyOn(comp,'trim');
		spyOn(eorMockService, 'getSpeciality').and.returnValue(of({result:{data:[]}}));
		comp.getSpeciality({target:{value:'test_speciality'}});
		discardPeriodicTasks();
		tick(15000);
		expect(comp.trim).toHaveBeenCalled();
		expect(comp.lstspecalities.length).toBe(0);
	}));
	it('Should doFilter Test, In that Test doFilter is responsible for search with help of EorService.pushDoSearch() with Set Form Values.', () => {
		let form = comp.initializeSearchForm();
		comp.selectedMultipleFieldFiter = eorFilterGetMockValues.selectedMultipleFilter;
		spyOn(comp.eorService, 'pushDoSearch');
		comp.searchForm = eorFilterGetMockValues.setSearchFormValues(form);
		comp.doFilter();
		expect(comp.eorService.pushDoSearch).toHaveBeenCalled();
	});
	it('Should getFieldAction Test Should be checking that EorService.updateFilterField() should be run.',()=>{
		spyOn(comp.eorService,'updateFilterField');
		comp.getFieldAction(true,'eor_status_ids');
		expect(comp.eorService.updateFilterField).toHaveBeenCalled();
	});
	it('Should changeSelect Test, Here We will get the specific field record.', () => {
		comp.searchForm = comp.initializeSearchForm();
		comp.changeSelect([], 'eor_status_ids');
		expect(comp.searchForm.controls.eor_status_ids.value).toBe(null);
	});
	it('Should trim Function Test Which check the string should be trim in sending responce.', () => {
		let result = comp.trim('search');
		expect(result).toMatch('search');
	});
	it('Should getCaseTypeList When EorService Subscribe successfull and also status true and eorService hasCaseType function return true. Then will verify EorSerivce function should run that name(hasCaseType,setCaseType)', fakeAsync(() => {
		spyOn(eorMockService, 'getAllSensationsOfCaseType').and.returnValue(
			of(eorFilterGetMockValues.caseTypeList).pipe(delay(1)),
		);
		spyOn(comp['eorService'],'hasCaseType').and.returnValue(true);
		spyOn(comp['eorService'],'setCaseType');
		comp.getCaseTypeList();
		expect(eorMockService.getAllSensationsOfCaseType).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp['eorService'].setCaseType).toHaveBeenCalled();
		expect(comp.caseTypeLists).toMatch('Mock Type');
	}));
	it('Should getCaseTypeList When Subscribe successfull But hasCaseType Function return False and will verify caseTypeLists result.', fakeAsync(() => {
		spyOn(eorMockService, 'getAllSensationsOfCaseType').and.returnValue(
			of(eorFilterGetMockValues.caseTypeList).pipe(delay(1)),
		);
		spyOn(comp['eorService'],'hasCaseType').and.returnValue(false);
		comp.getCaseTypeList();
		expect(eorMockService.getAllSensationsOfCaseType).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.caseTypeLists['result']['data']['type']).toMatch('Mock Type');
	}));
	it('Should valueAssignInListOfFieldArray Function Test Which testing that every variable value must matched and should exists.', () => {
		comp.valueAssignInListOfFieldArray(eorFilterGetMockValues.selectedMultipleFieldFiter);
		expect(comp.lstspecalities.length).toBe(1);
		expect(comp.lstpractiseLocation.length).toBe(1);
		expect(comp.bill_ids.length).toBe(1);
		expect(comp.lstInsurance.length).toBe(1);
		expect(comp.lstAttorney.length).toBe(1);
		expect(comp.denialStatusList.length).toBe(1);
		expect(comp.paymentStatusList.length).toBe(1);
		expect(comp.patientNameLists.length).toBe(1);
	});
	it('Should getChange Test In that case checked Which Field name Sending . That specific field should retain in responce with given values and values must be matched.',()=>{
		let fieldName = 'eor_status_ids';
		let MapFilterObject = [{
			id:10,
			name:'mock_name',
			full_Name:'full_Name',
			label_id:10,
			facility_full_name:'facility_full_name',
			insurance_name:'insurance_name',
			employer_name:'employer_name'
		}]
		comp.getChange(MapFilterObject,fieldName);
		expect(comp.selectedMultipleFieldFiter[fieldName][0].name).toEqual(MapFilterObject[0].name);
		expect(comp.selectedMultipleFieldFiter[fieldName][0].full_Name).toEqual(MapFilterObject[0].full_Name);
		expect(comp.selectedMultipleFieldFiter[fieldName][0].label_id).toEqual(MapFilterObject[0].label_id);
		expect(comp.selectedMultipleFieldFiter[fieldName][0].facility_full_name).toEqual(MapFilterObject[0].facility_full_name);
		expect(comp.selectedMultipleFieldFiter[fieldName][0].insurance_name).toEqual(MapFilterObject[0].insurance_name);
		expect(comp.selectedMultipleFieldFiter[fieldName][0].employer_name).toEqual(MapFilterObject[0].employer_name);
	});
	afterAll(() => {
		TestBed.resetTestingModule();
	});
});
