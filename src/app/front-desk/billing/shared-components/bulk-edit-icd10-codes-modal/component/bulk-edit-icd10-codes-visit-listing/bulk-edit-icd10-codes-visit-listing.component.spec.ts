import { MainService } from '@appDir/shared/services/main-service';
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
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { delay } from 'rxjs/operators';
import { of, throwError } from 'rxjs';
import { BillingMockService } from '@appDir/shared/mock-services/BillingMockService.service';
import { BulkEditICD10CodesVisitListingComponent } from './bulk-edit-icd10-codes-visit-listing.component';
import { MainMockService } from '@appDir/shared/mock-services/MainMockService.service';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { BillingService } from '@appDir/front-desk/billing/service/billing.service';
describe('BulkEditICD10CodesVisitListingComponent', () => {
	let comp: BulkEditICD10CodesVisitListingComponent;
	let fixture: ComponentFixture<BulkEditICD10CodesVisitListingComponent>;
	let main_mockService = new MainMockService();
	let billing_mock_service = new BillingMockService();
	function getVisitData() {
		comp.Visit_data = {
			case_id: 10,
			speciality_id: 54,
			visit_session_id: 66,
		};
	}
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [BulkEditICD10CodesVisitListingComponent],
			imports: [
				SharedModule,
				RouterTestingModule,
				BrowserAnimationsModule,
				ToastrModule.forRoot(),
				HttpClientTestingModule,
			],
			schemas: [NO_ERRORS_SCHEMA],
			providers: [
				Config,
				LocalStorage,
				ToastrService,
				MainService,
				{ provide: MainService, useValue: main_mockService },
				{ provide: BillingService, useValue: billing_mock_service },
			],
		}).compileComponents();
	}));
	beforeEach(() => {
		fixture = TestBed.createComponent(BulkEditICD10CodesVisitListingComponent);
		comp = fixture.componentInstance;
	});
	afterEach(() => {
		TestBed.resetTestingModule();
	});
	it('should be created', () => {
		expect(comp).toBeTruthy();
	});
	it('Should ngOnInit Test', () => {
		spyOn(comp['mainService'], 'setLeftPanel');
		spyOn(comp, 'getAllVisits');
		comp.ngOnInit();
		expect(comp.page.pageNumber).toBe(1);
		expect(comp.page.size).toBe(10);
		expect(comp['mainService'].setLeftPanel).toHaveBeenCalled();
		expect(comp.getAllVisits).toHaveBeenCalled();
	});
	it('Should createQueryParam Test, Then we test that return responce matched with desried result.', () => {
		let result = comp.createQueryParam({});
		expect(result.filter).toBe(false);
		expect(result.order).toBe(OrderEnum.ASC);
		expect(result.pagination).toBe(true);
		expect(result.page).toBe(0);
		expect(result.per_page).toBe(0);
	});
	it('Should addUrlQueryParams Test,That Test case responsible for add params in Url,But in That case will be checked that replaceState method is calling Which is responsible for add params in url.', () => {
		spyOn(comp['location'], 'replaceState');
		comp.addUrlQueryParams({});
		expect(comp['location'].replaceState).toHaveBeenCalled();
	});
	it('Should onPageChange Function Test, Will be checked page number and deSelectOnPageChangeOrEntries function should be called.', () => {
		spyOn(comp, 'deSelectOnPageChangeOrEntries');
		comp.onPageChange({ offset: 0 });
		expect(comp.page.pageNumber).toBe(1);
		expect(comp.deSelectOnPageChangeOrEntries).toHaveBeenCalled();
	});
	it('Should pageSizeChange Function Test, Will be checked page number and deSelectOnPageChangeOrEntries function should be called.', () => {
		spyOn(comp, 'deSelectOnPageChangeOrEntries');
		comp.pageSizeChange({ target: { value: 10 } });
		expect(comp.page.pageNumber).toBe(1);
		expect(comp.page.size).toBe(10);
		expect(comp.deSelectOnPageChangeOrEntries).toHaveBeenCalled();
	});
	it('Should getAllVisits Function Test When Billing Service Responce Successfully and then we checked that if billing responce empty then should toaster error function called and page totalElement check and startLoader should be false', fakeAsync(() => {
		getVisitData();
		spyOn(comp['toastrService'], 'error');
		spyOn(billing_mock_service, 'getAllVisits').and.returnValue(
			of({ result: { data: [] } }).pipe(delay(1)),
		);
		comp.getAllVisits();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.startLoader).toBe(false);
		expect(comp['toastrService'].error).toHaveBeenCalled();
		expect(comp.page.totalElements).toBe(0);
		expect(comp.lstBilling.length).toBe(0);
	}));
	it('Should getAllVisits Function Test When Billing Service Responce with error Then checked The StartLoader variable should be false.', fakeAsync(() => {
		getVisitData();
		spyOn(comp['toastrService'], 'error');
		spyOn(billing_mock_service, 'getAllVisits').and.returnValue(throwError('Error'));
		comp.getAllVisits();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.startLoader).toBe(false);
	}));
	it('Should allSelected Function Test When all length Billing Record exitst with check true', () => {
		comp.lstBilling = [
			{
				is_checked: false,
			},
			{
				is_checked: false,
			},
		];
		spyOn(comp['selection'], 'clear');
		spyOn(comp['selection'], 'select');
		spyOn(comp['selected'], 'emit');
		comp.page.size = 2;
		comp.page.pageNumber = 1;
		comp.allSelected({ checked: true });
		expect(comp['selection'].clear).toHaveBeenCalled();
		expect(comp['selection'].select).toHaveBeenCalled();
		expect(comp['selected'].emit).toHaveBeenCalled();
	});
	it('Should allSelected Function Test When all length Billing Record not exitst with check true', () => {
		comp.lstBilling = [
			{
				is_checked: false,
			},
		];
		spyOn(comp['selection'], 'clear');
		spyOn(comp['selection'], 'select');
		spyOn(comp['selected'], 'emit');
		comp.page.size = 2;
		comp.page.pageNumber = 1;
		comp.allSelected({ checked: true });
		expect(comp['selection'].clear).toHaveBeenCalled();
		expect(comp['selection'].select).toHaveBeenCalled();
		expect(comp['selected'].emit).toHaveBeenCalled();
	});
	it('Should allSelected Function Test When all length Billing Record exitst with check false', () => {
		comp.lstBilling = [
			{
				is_checked: false,
			},
			{
				is_checked: false,
			},
		];
		spyOn(comp['selection'], 'clear');
		spyOn(comp['selection'], 'deselect');
		spyOn(comp['selected'], 'emit');
		comp.page.size = 2;
		comp.page.pageNumber = 1;
		comp.allSelected({ checked: false });
		expect(comp['selection'].clear).toHaveBeenCalled();
		expect(comp['selection'].deselect).toHaveBeenCalled();
		expect(comp['selected'].emit).toHaveBeenCalled();
	});
	it('Should allSelected Function Test When all length Billing Record not exitst with check false', () => {
		comp.lstBilling = [
			{
				is_checked: false,
			},
		];
		spyOn(comp['selection'], 'clear');
		spyOn(comp['selection'], 'deselect');
		spyOn(comp['selected'], 'emit');
		comp.page.size = 2;
		comp.page.pageNumber = 1;
		comp.allSelected({ checked: false });
		expect(comp['selection'].clear).toHaveBeenCalled();
		expect(comp['selection'].deselect).toHaveBeenCalled();
		expect(comp['selected'].emit).toHaveBeenCalled();
	});
	it('Should getRecordsOnSinglePage Function Test When all length Billing Record exitst', () => {
		comp.lstBilling = [
			{
				is_checked: false,
			},
			{
				is_checked: false,
			},
		];
		comp.page.size = 2;
		comp.page.pageNumber = 1;
		let returnValue = comp.getRecordsOnSinglePage();
		expect(returnValue).toBe(2);
	});
	it('Should getRecordsOnSinglePage Function Test When all length Billing Record exitst not exists.', () => {
		comp.lstBilling = [
			{
				is_checked: false,
			},
		];
		comp.page.size = 2;
		comp.page.pageNumber = 1;
		let returnValue = comp.getRecordsOnSinglePage();
		expect(returnValue).toBe(1);
	});
	it('Should filterTheCPTCode Function Test In it we check that return values matched with expect values.', () => {
		let result = comp.filterTheCPTCode([{ code_type_id: 1 }], 1);
		expect(result[0]).toEqual({ code_type_id: 1 });
	});
	it('Should onChecked Function Test In it we check that allchecked should false If selection length equal getRecordsOnSinglePage return value.', () => {
		spyOn(comp, 'getRecordsOnSinglePage').and.returnValue(1);
		spyOn(comp['selection'], 'toggle');
		spyOn(comp['selected'], 'emit');
		comp.onChecked(null, []);
		expect(comp.allChecked).toBe(false);
		expect(comp.getRecordsOnSinglePage).toHaveBeenCalled();
		expect(comp['selection'].toggle).toHaveBeenCalled();
		expect(comp['selected'].emit).toHaveBeenCalled();
	});
	it('Should onChecked Function Test In it we check that allchecked should true If selection length equal getRecordsOnSinglePage return value.', () => {
		comp.selection.selected.length = 1;
		spyOn(comp, 'getRecordsOnSinglePage').and.returnValue(1);
		spyOn(comp['selection'], 'toggle');
		spyOn(comp['selected'], 'emit');
		comp.onChecked(null, []);
		expect(comp.allChecked).toBe(true);
		expect(comp.getRecordsOnSinglePage).toHaveBeenCalled();
		expect(comp['selection'].toggle).toHaveBeenCalled();
		expect(comp['selected'].emit).toHaveBeenCalled();
	});
	it('Should deSelectOnPageChangeOrEntries Function Test When all length Billing Record not exitst with check true', () => {
		comp.lstBilling = [
			{
				is_checked: false,
			},
		];
		spyOn(comp['selection'], 'clear');
		spyOn(comp['selection'], 'deselect');
		spyOn(comp['selected'], 'emit');
		comp.page.size = 2;
		comp.page.pageNumber = 1;
		comp.deSelectOnPageChangeOrEntries();
		expect(comp['selection'].clear).toHaveBeenCalled();
		expect(comp['selection'].deselect).toHaveBeenCalled();
		expect(comp['selected'].emit).toHaveBeenCalled();
		expect(comp.allChecked).toBe(false);
	});
	afterAll(() => {
		TestBed.resetTestingModule();
	});
});
