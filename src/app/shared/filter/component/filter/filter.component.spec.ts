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
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { DynamicFormModule } from '@appDir/shared/dynamic-form/dynamic-form.module';
import { FilterComponent } from './filter.component';
import { FilterMockValues } from '../filter-mock-values/filter-mock-values';
import { FilterMockService } from '@appDir/shared/mock-services/FilterMockService.service';
import { FilterService } from '../../service/filter.service';
import { isEmptyObject } from '@appDir/shared/utils/utils.helpers';
import { HttpClientTestingModule } from '@angular/common/http/testing';
describe('FilterComponent', () => {
	let comp: FilterComponent;
	let fixture: ComponentFixture<FilterComponent>;
	let filterGetMockValues = new FilterMockValues();
	let filterMockService = new FilterMockService();
	function valueAssignExpectation() {
		expect(comp.selectedMultipleFieldFiter['speciality_ids'].length).toBe(1);
		expect(comp.selectedMultipleFieldFiter['job_status'].length).toBe(1);
		expect(comp.selectedMultipleFieldFiter['created_by_ids'].length).toBe(1);
		expect(comp.selectedMultipleFieldFiter['facility_ids'].length).toBe(2);
		expect(comp.selectedMultipleFieldFiter['bill_ids'].length).toBe(1);
		expect(comp.selectedMultipleFieldFiter['case_ids'].length).toBe(1);
		expect(comp.selectedMultipleFieldFiter['doctor_ids'].length).toBe(1);
		expect(comp.selectedMultipleFieldFiter['bill_status_ids'].length).toBe(1);
		expect(comp.selectedMultipleFieldFiter['facility_location_ids'].length).toBe(2);
		expect(comp.selectedMultipleFieldFiter['patient_ids'].length).toBe(1);
		expect(comp.selectedMultipleFieldFiter['employer_ids'].length).toBe(1);
		expect(comp.selectedMultipleFieldFiter['insurance_ids'].length).toBe(1);
		expect(comp.selectedMultipleFieldFiter['attorney_ids'].length).toBe(1);

		expect(comp.lstspecalities.length).toBe(1);
		expect(comp.lstBillJob.length).toBe(1);
		expect(comp.listOfUserCreatedBy.length).toBe(1);
		expect(comp.lstpractiseLocation.length).toBe(2);
		expect(comp.bill_ids.length).toBe(1);
		expect(comp.lstProvider.length).toBe(1);
		expect(comp.lstpractiseLocation.length).toBe(2);
		expect(comp.patientNameLists.length).toBe(1);
		expect(comp.lstEmployer.length).toBe(1);
		expect(comp.lstInsurance.length).toBe(1);
		expect(comp.lstAttorney.length).toBe(1);

		expect(comp.billReciepientCheck.patient).toBe(true);
		expect(comp.billReciepientCheck.employer).toBe(true);
		expect(comp.billReciepientCheck.insurance).toBe(true);
		expect(comp.billReciepientCheck.attorney).toBe(true);
	}
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [],
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
				{
					provide: FilterService,
					useValue: filterMockService,
				},
			],
		}).compileComponents();
	}));
	beforeEach(() => {
		fixture = TestBed.createComponent(FilterComponent);
		comp = fixture.componentInstance;
	});
	afterEach(() => {
		TestBed.resetTestingModule();
	});
	it('should be created', () => {
		expect(comp).toBeTruthy();
	});
	it('Should ngOnInit Test', () => {
		comp.formFiledValue = {
			attorney_ids: [2, 5],
		};
		spyOn(comp, 'valueAssignInListOfFieldArray');
		spyOn(comp, 'getCaseTypeList');
		spyOn(comp, 'getBillRecipient');
		comp.ngOnInit();
		expect(comp.valueAssignInListOfFieldArray).toHaveBeenCalled();
		expect(comp.getCaseTypeList).toHaveBeenCalled();
		expect(comp.getBillRecipient).toHaveBeenCalled();
	});
	it('Should initializeSearchForm Test', () => {
		let emptySearchFormExpect = filterGetMockValues.EmptyFormInitValues;
		let result = comp.initializeSearchForm();
		expect(result.value).toEqual(emptySearchFormExpect);
	});
	it('Should doFilter Test', () => {
		let form = comp.initializeSearchForm();
		comp.selectedMultipleFieldFiter = filterGetMockValues.selectedMultipleFilter;
		spyOn(comp.searchFilterData, 'emit');
		comp.filterForm = filterGetMockValues.setSearchFormValues(form);
		comp.doFilter();
		expect(comp.searchFilterData.emit).toHaveBeenCalled();
	});
	it('Should resetFilter Test', () => {
		comp.filterForm = comp.initializeSearchForm();
		spyOn(comp['eventsSubject'], 'next');
		spyOn(comp.searchFilterData, 'emit');
		comp.resetFilter();
		expect(comp.billReciepientCheck).toEqual({
			attorney: false,
			insurance: false,
			employer: false,
			patient: false,
		});
		expect(comp['eventsSubject'].next).toHaveBeenCalled();
		expect(comp.searchFilterData.emit).toHaveBeenCalled();
	});
	it('Should searchBill When Subscribe successfull', fakeAsync(() => {
		spyOn(filterMockService, 'searchBillIds').and.returnValue(
			of({ result: { data: [] } }).pipe(delay(1)),
		);
		comp.searchBill({ target: { value: 'search' } });
		expect(filterMockService.searchBillIds).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.bill_ids.length).toBe(0);
	}));
	it('Should searchCaseId When Subscribe successfull', fakeAsync(() => {
		spyOn(filterMockService, 'searchCaseIds').and.returnValue(
			of({
				status: true,
				result: { data: [] },
			}).pipe(delay(1)),
		);
		comp.searchCaseId({ target: { value: 'search' } });
		expect(filterMockService.searchCaseIds).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.caseIds.length).toBe(0);
	}));
	it('Should searchPomId When Subscribe successfull', fakeAsync(() => {
		spyOn(filterMockService, 'searchPomIds').and.returnValue(
			of({
				status: true,
				result: { data: [] },
			}).pipe(delay(1)),
		);
		comp.searchPomId({ target: { value: 'search' } });
		expect(filterMockService.searchPomIds).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.lstPomIds.length).toBe(0);
	}));
	it('Should getCaseTypeList When Subscribe successfull', fakeAsync(() => {
		spyOn(filterMockService, 'getAllSensationsOfCaseType').and.returnValue(
			of(filterGetMockValues.caseTypeList).pipe(delay(1)),
		);
		comp.getCaseTypeList();
		expect(filterMockService.getAllSensationsOfCaseType).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.caseTypeLists).toMatch('Mock Type');
	}));
	it('Should searchPatientName When Subscribe successfull', fakeAsync(() => {
		spyOn(filterMockService, 'searchPatientName').and.returnValue(
			of(filterGetMockValues.searchPatientName).pipe(delay(1)),
		);
		comp.searchPatientName({ target: { value: 'search' } });
		expect(filterMockService.searchPatientName).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.patientNameLists.length).toBe(1);
	}));
	it('Should getSpeciality When Subscribe successfull', fakeAsync(() => {
		spyOn(filterMockService, 'getSpeciality').and.returnValue(
			of(filterGetMockValues.getSpeciality).pipe(delay(1)),
		);
		comp.getSpeciality('search');
		expect(filterMockService.getSpeciality).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.searchedKeys.specialityName.lastPage).toBe(
			filterGetMockValues.getSpeciality.result.last_page,
		);
		expect(comp.lstspecalities.length).toBe(1);
	}));
	it('Should getMoreSpecialities Test', () => {
		comp.searchedKeys.specialityName.page = 1;
		comp.searchedKeys.specialityName.lastPage = 2;
		spyOn(comp, 'getSpeciality');
		comp.getMoreSpecialities();
		expect(comp.getSpeciality).toHaveBeenCalled();
	});
	it('Should getMoreSpecialitiesOpen Test', () => {
		spyOn(comp, 'getSpeciality');
		comp.getMoreSpecialitiesOpen();
		expect(comp.getSpeciality).toHaveBeenCalled();
	});
	it('Should searchPractice When Subscribe successfull', fakeAsync(() => {
		spyOn(filterMockService, 'searchOfPractice').and.returnValue(
			of(filterGetMockValues.getSpeciality).pipe(delay(1)),
		);
		comp.searchPractice('search');
		expect(filterMockService.searchOfPractice).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.searchedKeys.practiceLocation.lastPage).toBe(
			filterGetMockValues.getSpeciality.result.last_page,
		);
		expect(comp.lstpractiseLocation.length).toBe(1);
	}));
	it('Should getMorePracticeLocation Test', () => {
		comp.searchedKeys.practiceLocation.page = 1;
		comp.searchedKeys.practiceLocation.lastPage = 2;
		spyOn(comp, 'searchPractice');
		comp.getMorePracticeLocation();
		expect(comp.searchPractice).toHaveBeenCalled();
	});
	it('Should getMorePracticeLocationOpen Test', () => {
		spyOn(comp, 'searchPractice');
		comp.getMorePracticeLocationOpen();
		expect(comp.searchPractice).toHaveBeenCalled();
	});
	it('Should searchUserListCreatedBy When Subscribe successfull', fakeAsync(() => {
		spyOn(filterMockService, 'searchUserList').and.returnValue(
			of(filterGetMockValues.searchPatientName).pipe(delay(1)),
		);
		comp.searchUserListCreatedBy({ target: { value: 'search' } });
		expect(filterMockService.searchUserList).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.listOfUserCreatedBy.length).toBe(1);
	}));
	it('Should getBillRecipient When Subscribe successfull', fakeAsync(() => {
		spyOn(filterMockService, 'getBillRecipient').and.returnValue(
			of(filterGetMockValues.generalResp).pipe(delay(1)),
		);
		comp.getBillRecipient();
		expect(filterMockService.getBillRecipient).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.lstBillstate.length).toBe(0);
	}));
	it('Should getJobStatus When Subscribe successfull', fakeAsync(() => {
		spyOn(filterMockService, 'getJobStatus').and.returnValue(
			of(filterGetMockValues.generalResp).pipe(delay(1)),
		);
		comp.getJobStatus({ target: { value: 'search' } });
		expect(filterMockService.getJobStatus).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.lstBillJob.length).toBe(0);
	}));
	it('Should getInsurance When Subscribe successfull', fakeAsync(() => {
		spyOn(filterMockService, 'getInsurance').and.returnValue(
			of(filterGetMockValues.generalResp).pipe(delay(1)),
		);
		comp.getInsurance({ target: { value: 'search' } });
		expect(filterMockService.getInsurance).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.lstInsurance.length).toBe(0);
	}));
	it('Should searchAttorney When Subscribe successfull', fakeAsync(() => {
		spyOn(filterMockService, 'getAttorney').and.returnValue(
			of(filterGetMockValues.searchAttorney).pipe(delay(1)),
		);
		comp.searchAttorney({ target: { value: 'search' } });
		expect(filterMockService.getAttorney).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.lstAttorney.length).toBe(1);
	}));
	it('Should searchEmployer When Subscribe successfull', fakeAsync(() => {
		spyOn(filterMockService, 'searchEmployer').and.returnValue(
			of(filterGetMockValues.generalResp).pipe(delay(1)),
		);
		comp.searchEmployer({ target: { value: 'search' } });
		expect(filterMockService.searchEmployer).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.lstEmployer.length).toBe(0);
	}));
	it('Should trim Test', () => {
		let result = comp.trim('search');
		expect(result).toMatch('search');
	});
	it('Should getFieldAction When Subscribe successfull', fakeAsync(() => {
		spyOn(filterMockService, 'updateFilterField').and.returnValue(
			of(filterGetMockValues.generalResp).pipe(delay(1)),
		);
		comp.getFieldAction(true, 'id');
		expect(filterMockService.updateFilterField).toHaveBeenCalled();
	}));
	it('Should changeSelect Test', () => {
		comp.filterForm = comp.initializeSearchForm();
		comp.changeSelect([], 'bill_ids');
		expect(comp.filterForm.controls.bill_ids.value).toBe(null);
	});
	it('Should getChange Test If Event array', () => {
		comp.getChange([], 'bill_ids');
		expect(comp.selectedMultipleFieldFiter.bill_ids.length).toBe(0);
	});
	it('Should actionRecipient Test If name patient', () => {
		comp.filterForm = comp.initializeSearchForm();
		comp.actionRecipient([{ name: 'Patient' }]);
		expect(comp.billReciepientCheck.patient).toBe(true);
	});
	it('Should actionRecipient Test If name Lawyer', () => {
		comp.filterForm = comp.initializeSearchForm();
		comp.actionRecipient([{ name: 'Lawyer' }]);
		expect(comp.billReciepientCheck.attorney).toBe(true);
	});
	it('Should actionRecipient Test If name Insurance', () => {
		comp.filterForm = comp.initializeSearchForm();
		comp.actionRecipient([{ name: 'Insurance' }]);
		expect(comp.billReciepientCheck.insurance).toBe(true);
	});
	it('Should actionRecipient Test If name Employer', () => {
		comp.filterForm = comp.initializeSearchForm();
		comp.actionRecipient([{ name: 'Employer' }]);
		expect(comp.billReciepientCheck.employer).toBe(true);
	});
	it('Should actionRecipient Test If No name exists', () => {
		comp.filterForm = comp.initializeSearchForm();
		comp.actionRecipient([{ name: 'No_name' }]);
		expect(comp.filterForm.controls.patient_ids.value.length).toBe(0);
		expect(comp.filterForm.controls.attorney_ids.value.length).toBe(0);
		expect(comp.filterForm.controls.insurance_ids.value.length).toBe(0);
		expect(comp.filterForm.controls.employer_ids.value.length).toBe(0);
	});
	it('Should searchProvider When Subscribe successfull', fakeAsync(() => {
		spyOn(filterMockService, 'getProvider').and.returnValue(
			of(filterGetMockValues.searchAttorney).pipe(delay(1)),
		);
		comp.searchProvider({ target: { value: 'search' } });
		expect(filterMockService.getProvider).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.lstProvider.length).toBe(1);
	}));
	it('Should check Reset Button when form From Empty function Test', () => {
		comp.filterForm = comp.initializeSearchForm();
		const retrunValue = isEmptyObject(comp.filterForm.value);
		comp.checkInputs();
		expect(retrunValue).toBe(true);
	});
	it('Should check Reset Button disabled when form have values function Test', () => {
		comp.filterForm = comp.initializeSearchForm();
		comp.filterForm.controls.bill_ids.setValue([10]);
		comp.filterForm.controls.case_ids.setValue([10]);
		comp.filterForm.controls.patient_ids.setValue([10]);
		comp.filterForm.controls.speciality_ids.setValue([10]);
		comp.filterForm.controls.pom_ids.setValue([10]);
		comp.filterForm.controls.bill_status_ids.setValue([10]);
		const retrunValue = isEmptyObject(comp.filterForm.value);
		comp.checkInputs();
		expect(retrunValue).toBe(false);
	});
	it('Should selectionOnValueChange Test', () => {
		spyOn(comp, 'getChange');
		comp.filterForm = comp.initializeSearchForm();
		comp.selectionOnValueChange({}, 'bill_ids');
		expect(comp.getChange).toHaveBeenCalled();
		expect(comp.filterForm.controls.bill_ids.value).toBe(null);
	});
	it('Should getChangeForSingalSelection Test', () => {
		comp.getChangeForSingalSelection(filterGetMockValues.getChangeForSingalSelection, 'bill_ids');
		expect(comp.selectedMultipleFieldFiter.bill_ids[0].employer_name).toMatch('employer_name');
		expect(comp.selectedMultipleFieldFiter.bill_ids[0].facility_full_name).toMatch(
			'facility_full_name',
		);
		expect(comp.selectedMultipleFieldFiter.bill_ids[0].full_Name).toMatch('full_Name');
		expect(comp.selectedMultipleFieldFiter.bill_ids[0].id).toBe(10);
		expect(comp.selectedMultipleFieldFiter.bill_ids[0].insurance_name).toMatch('insurance_name');
		expect(comp.selectedMultipleFieldFiter.bill_ids[0].insurance_name).toMatch('insurance_name');
		expect(comp.selectedMultipleFieldFiter.bill_ids[0].name).toMatch('name');
		expect(comp.selectedMultipleFieldFiter.bill_ids[0].label_id).toBe(11);
	});
	it('Should valueAssignInListOfFieldArray Test', () => {
		spyOn(comp, 'getChange');
		comp.filterForm = comp.initializeSearchForm();
		comp.valueAssignInListOfFieldArray(filterGetMockValues.valueAssignGivenParams);
		valueAssignExpectation();
	});
	afterAll(() => {
		TestBed.resetTestingModule();
	});
});
