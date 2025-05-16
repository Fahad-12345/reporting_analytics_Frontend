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
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { DynamicFormModule } from '@appDir/shared/dynamic-form/dynamic-form.module';
import { BillSpecailityListingComponent } from './bill-listing-specaility.component';
import { BillingMockService } from '@appDir/shared/mock-services/BillingMockService.service';
import { BillingService } from '../service/billing.service';
import { BillListingMockValues } from './Bill-listing-speciality-mock-values/bill-listing-speciality-mock-values';
import { HttpClientTestingModule } from '@angular/common/http/testing';
describe('BillSpecailityListingComponent', () => {
	let comp: BillSpecailityListingComponent;
	let fixture: ComponentFixture<BillSpecailityListingComponent>;
	let billingMockService = new BillingMockService();
	let billingGetMockValues = new BillListingMockValues();
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [BillSpecailityListingComponent],
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
					provide: ActivatedRoute,
					useValue: {
						queryParams: of({ id: 10 }),
					},
				},
				{
					provide: BillingService,
					useValue: billingMockService,
				},
			],
		}).compileComponents();
	}));
	beforeEach(() => {
		fixture = TestBed.createComponent(BillSpecailityListingComponent);
		comp = fixture.componentInstance;
	});
	afterEach(() => {
		TestBed.resetTestingModule();
	});
	it('should be created', () => {
		expect(comp).toBeTruthy();
	});
	it('Should ngOnInit Test', () => {
		spyOn(comp, 'getSpecialityOfBILL');
		comp.ngOnInit();
		expect(comp.page.pageNumber).toBe(1);
		expect(comp.page.size).toBe(10);
		expect(comp.page.offset).toBe(0);
		expect(comp.getSpecialityOfBILL).toHaveBeenCalled();
	});
	it('Should pageLimit Test', () => {
		spyOn(comp, 'getSpecialityOfBILL');
		spyOn(window, 'setTimeout');
		comp.pageLimit(10);
		expect(comp.getSpecialityOfBILL).toHaveBeenCalled();
		expect(comp.page.pageNumber).toBe(1);
		expect(comp.page.size).toBe(10);
		expect(comp.page.offset).toBe(0);
	});
	it('Should onPageChange Test', () => {
		spyOn(comp, 'getSpecialityOfBILL');
		comp.onPageChange({ offset: 0 });
		expect(comp.getSpecialityOfBILL).toHaveBeenCalled();
		expect(comp.page.pageNumber).toBe(1);
		expect(comp.page.offset).toBe(0);
	});
	it('Should getSpecialityOfBILL Test If Successfull', fakeAsync(() => {
		spyOn(comp, 'addUrlQueryParams');
		spyOn(billingMockService, 'getListOfSpecialityBill').and.returnValue(
			of(billingGetMockValues.getSpecialityBillResp).pipe(delay(1)),
		);
		comp.getSpecialityOfBILL({ id: 10 });
		discardPeriodicTasks();
		tick(15000);
		expect(comp.addUrlQueryParams).toHaveBeenCalled();
		expect(comp.loadSpin).toBe(false);
		expect(comp.billListSpecality.length).toBe(0);
		expect(comp.page.totalElements).toBe(billingGetMockValues.getSpecialityBillResp.result.total);
		expect(comp.page.totalPages).toBe(billingGetMockValues.getSpecialityBillResp.result.last_page);
	}));
	it('Should getSpecialityOfBILL Test If UnSuccessfull', fakeAsync(() => {
		spyOn(comp, 'addUrlQueryParams');
		spyOn(billingMockService, 'getListOfSpecialityBill').and.returnValue(throwError('Error'));
		comp.getSpecialityOfBILL({ id: 10 });
		discardPeriodicTasks();
		tick(15000);
		expect(comp.addUrlQueryParams).toHaveBeenCalled();
		expect(comp.loadSpin).toBe(false);
	}));
	it('Should filterResponseData Test', () => {
		spyOn(comp, 'getSpecialityOfBILL');
		comp.filterResponseData({});
		expect(comp.getSpecialityOfBILL).toHaveBeenCalled();
		expect(comp.page.pageNumber).toBe(1);
		expect(comp.page.offset).toBe(0);
		expect(comp.filterInfoObject).toEqual({});
	});
	it('Should setBillType Test If Case 1 with pass If condition', () => {
		comp.filterInfoObject = {
			patient_ids: [1, 2],
		};
		comp.setBillType(1);
		expect(comp.selectedBillRecpitent[0]).toEqual({
			type_id: 1,
			ids: 1,
		});
	});
	it('Should setBillType Test If Case 1 with Fail If condition', () => {
		comp.filterInfoObject = {};
		comp.setBillType(1);
		expect(comp.selectedBillRecpitent[0]).toEqual({
			type_id: 1,
			ids: null,
		});
	});
	it('Should setBillType Test If Case 2 with pass If condition', () => {
		comp.filterInfoObject = {
			employer_ids: [1, 2],
		};
		comp.setBillType(2);
		expect(comp.selectedBillRecpitent[0].type_id).toBe(2);
	});
	it('Should setBillType Test If Case 2 with Fail If condition', () => {
		comp.filterInfoObject = {};
		comp.setBillType(2);
		expect(comp.selectedBillRecpitent[0]).toEqual({
			type_id: 2,
			ids: null,
		});
	});
	it('Should setBillType Test If Case 3 with pass If condition', () => {
		comp.filterInfoObject = {
			insurance_ids: [1, 2],
		};
		comp.setBillType(3);
		expect(comp.selectedBillRecpitent[0].type_id).toBe(3);
	});
	it('Should setBillType Test If Case 3 with Fail If condition', () => {
		comp.filterInfoObject = {};
		comp.setBillType(3);
		expect(comp.selectedBillRecpitent[0]).toEqual({
			type_id: 3,
			ids: null,
		});
	});
	it('Should setBillType Test If Case 4 with pass If condition', () => {
		comp.filterInfoObject = {
			attorney_ids: [1, 2],
		};
		comp.setBillType(4);
		expect(comp.selectedBillRecpitent[0]).toEqual({
			type_id: 4,
			ids: 1,
		});
	});
	it('Should setBillType Test If Case 4 with Fail If condition', () => {
		comp.filterInfoObject = {};
		comp.setBillType(4);
		expect(comp.selectedBillRecpitent[0]).toEqual({
			type_id: 4,
			ids: null,
		});
	});
	it('Should paramsObject Test', () => {
		let result = comp.paramsObject();
		expect(result).toEqual({ page: 0, pagination: 1, per_page: 10 });
	});
	it('Should addUrlQueryParams Test', () => {
		spyOn(comp['location'], 'replaceState');
		comp.addUrlQueryParams({});
		expect(comp['location'].replaceState).toHaveBeenCalled();
	});
	it('Should moveToBillListingComponent Test If billRecpitent Length Not equal Zero', () => {
		spyOn(comp, 'setBillType');
		spyOn(comp['router'], 'navigate');
		comp.filterInfoObject = billingGetMockValues.filteredObjectWithBillReceiptLengthGreaterZero;
		comp.moveToBillListingComponent({ speciality_id: 1, bill_status_id: 0 });
		expect(comp.setBillType).toHaveBeenCalled();
		expect(comp['router'].navigate).toHaveBeenCalled();
	});
	it('Should moveToBillListingComponent Test If billRecpitent length Zero', () => {
		comp.filterInfoObject = billingGetMockValues.filteredObjectWithBillReceiptLengthZero;
		comp.moveToBillListingComponent({ speciality_id: 1, bill_status_id: 0 });
		expect(comp).toBeTruthy();
	});
	afterAll(() => {
		TestBed.resetTestingModule();
	});
});
