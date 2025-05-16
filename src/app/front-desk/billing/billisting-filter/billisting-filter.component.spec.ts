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
import { RequestMockService } from '@appDir/shared/mock-services/RequestMock.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { delay } from 'rxjs/operators';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BillistingFilterComponent } from './billisting-filter.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EorMockService } from '@appDir/shared/mock-services/EorMockService.service';
import { BillistingFilterMockValues } from './billisting-filter-mock-values/billisting-filter-mock-values';
import { EORService } from '@appDir/eor/shared/eor.service';
describe('BillistingFilterComponent', () => {
	let comp: BillistingFilterComponent;
	let fixture: ComponentFixture<BillistingFilterComponent>;
	let eorMockService = new EorMockService();
	let requestMockService = new RequestMockService();
	let billistingFilterGetMockValues = new BillistingFilterMockValues();
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [BillistingFilterComponent],
			imports: [
				SharedModule,
				RouterTestingModule,
				ToastrModule.forRoot(),
				BrowserAnimationsModule,
				HttpClientTestingModule,
			],
			schemas: [NO_ERRORS_SCHEMA],
			providers: [
				Config,
				LocalStorage,
				ToastrService,
				{
					provide: EORService,
					useValue: eorMockService,
				},
				{
					provide: RequestService,
					useValue: requestMockService,
				},
			],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(BillistingFilterComponent);
		comp = fixture.componentInstance;
	});
	afterEach(() => {
		TestBed.resetTestingModule();
	});
	it('should be created', () => {
		expect(comp).toBeTruthy();
	});
	it('Should ngOnInit Test', fakeAsync(() => {
		spyOn(comp, 'valueAssignInListOfFieldArray');
		spyOn(comp, 'getBillstate');
		spyOn(comp, 'getCaseTypeList');
		spyOn(eorMockService, 'pullBillFilterFormReset').and.returnValue(of(true).pipe(delay(1)));
		comp.ngOnInit();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.valueAssignInListOfFieldArray).toHaveBeenCalled();
		expect(comp.getBillstate).toHaveBeenCalled();
		expect(comp.getCaseTypeList).toHaveBeenCalled();
		expect(comp.searchForm.value).toEqual(billistingFilterGetMockValues.searchFormEmptyResp);
	}));
	it('Should initializeSearchForm Test', () => {
		let searchForm = comp.initializeSearchForm();
		expect(searchForm.value).toEqual(billistingFilterGetMockValues.searchFormEmptyResp);
	});
	it('Should getFieldAction Test', () => {
		spyOn(comp['eorService'], 'updateFilterField');
		comp.getFieldAction(true, 'name');
		expect(comp['eorService'].updateFilterField).toHaveBeenCalled();
	});
	it('Should getBillstate Test', fakeAsync(() => {
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			of(billistingFilterGetMockValues.basicResp).pipe(delay(1)),
		);
		comp.getBillstate();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.lstBillstate.length).toBe(0);
	}));
	it('Should getCaseTypeList Test', fakeAsync(() => {
		spyOn(comp['eorService'], 'setCaseType');
		spyOn(comp['eorService'], 'hasCaseType').and.returnValue(true);
		spyOn(eorMockService, 'getAllSensationsOfCaseType').and.returnValue(
			of(billistingFilterGetMockValues.getCaseTypeList).pipe(delay(1)),
		);
		comp.getCaseTypeList();
		tick(15000);
		discardPeriodicTasks();
		expect(comp['eorService'].setCaseType).toHaveBeenCalled();
		expect(comp.caseTypeLists.length).toBe(0);
	}));
	it('Should setpage Test', () => {
		spyOn(comp['filterData'], 'emit');
		spyOn(comp, 'filterResponse');
		comp.searchForm = comp.initializeSearchForm();
		comp.searchForm.patchValue(billistingFilterGetMockValues.searchFormSetMockValues);
		comp.selectedMultipleFieldFiter = billistingFilterGetMockValues.selectedMultipleFieldFiter;
		comp.setpage();
		expect(comp['filterData'].emit).toHaveBeenCalled();
		expect(comp.filterResponse).toHaveBeenCalled();
	});
	it('Should setpage Test If SearchForm value not exists', () => {
		spyOn(comp['filterData'], 'emit');
		spyOn(comp, 'filterResponse');
		comp.searchForm = comp.initializeSearchForm();
		comp.setpage();
		expect(comp['filterData'].emit).toHaveBeenCalled();
		expect(comp.filterResponse).toHaveBeenCalled();
	});
	it('Should resetCase Test', () => {
		spyOn(comp['eventsSubject'], 'next');
		spyOn(comp, 'setpage');
		comp.resetCase();
		expect(comp['eventsSubject'].next).toHaveBeenCalled();
		expect(comp.setpage).toHaveBeenCalled();
	});
	it('Should valueAssignInListOfFieldArray Test', () => {
		comp.valueAssignInListOfFieldArray(billistingFilterGetMockValues.selectedMultipleFieldFiter);
		expect(comp.lstspecalities.length).toBe(1);
		expect(comp.lstpractiseLocation.length).toBe(1);
		expect(comp.bill_ids.length).toBe(1);
		expect(comp.providerList.length).toBe(1);
		expect(comp.lstInsurance.length).toBe(1);
		expect(comp.lstAttorney.length).toBe(1);
		expect(comp.denialStatusList.length).toBe(1);
		expect(comp.verificationStatusList.length).toBe(1);
		expect(comp.paymentStatusList.length).toBe(1);
		expect(comp.patientNameLists.length).toBe(1);
	});
	it('Should getChange Test', () => {
		comp.selectedMultipleFieldFiter = billistingFilterGetMockValues.selectedMultipleFieldFiter;
		comp.getChange([{ name: 'mock_name' }], 'doctor_ids');
		expect(comp.selectedMultipleFieldFiter.patient_ids.length).toBe(1);
	});
	it('Should filterResponse Test', () => {
		let result = comp.filterResponse(billistingFilterGetMockValues.filterRespGivenMockValue);
		expect(result).toEqual(billistingFilterGetMockValues.filterRespGivenMockValue);
	});
	it('Should selectionOnValueChange Test',()=>{
		spyOn(comp,'getChange');
		comp.searchForm = comp.initializeSearchForm();
		comp.selectionOnValueChange({data:[10],label:'doctor_ids'});
		expect(comp.getChange).toHaveBeenCalled();
	});
	it('Should selectionOnValueChange Test If e.data not exists',()=>{
		spyOn(comp,'getChange');
		comp.searchForm = comp.initializeSearchForm();
		comp.selectionOnValueChange({},'doctor_ids');
		expect(comp.getChange).toHaveBeenCalled();
	});
	it('Should ngSelectClear Test',()=>{
		comp.searchForm = comp.initializeSearchForm();
		comp.ngSelectClear('doctor_ids');
		expect(comp.searchForm.controls.doctor_ids.value).toBeNull();
	});
	it('Should checkInputs Test', () => {
		comp.searchForm = comp.initializeSearchForm();
		let Result = comp.checkInputs();
		expect(Result).toBe(true);
	});
	it('Should checkInputs Test When searchForm have values', () => {
		comp.searchForm = comp.initializeSearchForm();
		comp.searchForm.controls.doctor_ids.setValue([20]);
		let Result = comp.checkInputs();
		expect(Result).toBe(false);
	});
	afterAll(() => {
		TestBed.resetTestingModule();
	});
});
