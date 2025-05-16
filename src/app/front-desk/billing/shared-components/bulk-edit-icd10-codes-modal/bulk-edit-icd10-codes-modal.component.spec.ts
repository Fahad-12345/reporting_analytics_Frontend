import { BillingService } from './../../service/billing.service';
import { RequestMockService } from '@appDir/shared/mock-services/RequestMock.service';
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
import { of, throwError, pipe } from 'rxjs';
import { BillingMockService } from '@appDir/shared/mock-services/BillingMockService.service';
import { BulkEditICD10CodesModalComponent } from './bulk-edit-icd10-codes-modal.component';
import { RequestService } from '@appDir/shared/services/request.service';
describe('BulkEditICD10CodesModalComponent', () => {
	let comp: BulkEditICD10CodesModalComponent;
	let fixture: ComponentFixture<BulkEditICD10CodesModalComponent>;
	let requestService = new RequestMockService();
	let billingMockService = new BillingMockService();
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [BulkEditICD10CodesModalComponent],
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
				{ provide: RequestService, useValue: requestService },
				{ provide: BillingService, useValue: billingMockService },
			],
		}).compileComponents();
	}));
	beforeEach(() => {
		fixture = TestBed.createComponent(BulkEditICD10CodesModalComponent);
		comp = fixture.componentInstance;
	});
	afterEach(() => {
		TestBed.resetTestingModule();
	});
	it('should be created', () => {
		expect(comp).toBeTruthy();
	});
	it('Should setSelectedVal Test', () => {
		comp.setSelectedVal('cpt');
		expect(comp.selectedVisits).toMatch('cpt');
	});
	it('Should getICDcodes Test', fakeAsync(() => {
		spyOn(requestService, 'sendRequest').and.returnValue(
			of({
				result: { data: [{ id: 10, name: 'name_mock', description: 'mock_description' }] },
			}).pipe(delay(1)),
		);
		comp.getICDcodes('name', 'search');
		tick(15000);
		discardPeriodicTasks();
		expect(comp.lstICDcodes.length).toBe(1);
		expect(comp.icdPage.pageNumber).toBe(1);
		expect(comp.searchValue).toMatch('name');
	}));
	it('Should removeICDcodeFromList Test', () => {
		comp.removeICDcodeFromList(['icd_10', 'icd_code']);
		expect(comp.selected_icd10_Codes.length).toBe(2);
	});
	it('Should onScroll Test', () => {
		spyOn(comp, 'getICDcodes');
		comp.onScroll(['icd_10', 'icd_code']);
		expect(comp.icdPage.pageNumber).toBe(1);
		expect(comp.getICDcodes).toHaveBeenCalled();
	});
	it('Should submit Test If Billing Service Responce With Error Throw.', fakeAsync(() => {
		comp.selected_icd10_Codes = [{ id: 10 }];
		comp.selectedVisits = [{ visit_session_id: 10 }];
		spyOn(billingMockService, 'updateMultipleVisitbills').and.returnValue(
			throwError({ error: { message: 'Error Message' } }),
		);
		spyOn(comp['toastrService'], 'error');
		comp.submit();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.disable_btn_on_submit).toBe(false);
		expect(comp['toastrService'].error).toHaveBeenCalled();
	}));
	it('Should submit Test If Billing Service Responce Successfull.', fakeAsync(() => {
		comp.selected_icd10_Codes = [{ id: 10 }];
		comp.selectedVisits = [{ visit_session_id: 10 }];
		comp.modalRef = {
			close: function () {
				return;
			}
		};
		spyOn(billingMockService, 'updateMultipleVisitbills').and.returnValue(
			of({ status: false }).pipe(delay(1)),
		);
		comp.submit();
		expect(comp.disable_btn_on_submit).toBe(true);
		expect(comp.startLoader).toBe(true);
		tick(15000);
		discardPeriodicTasks();
		expect(comp.disable_btn_on_submit).toBe(false);
		expect(comp.startLoader).toBe(false);
	}));
	it('Should submit Test If selected_icd10_Codes & selectedVisits Length Equal 0.', fakeAsync(() => {
		spyOn(comp['toastrService'], 'error');
		comp.submit();
		tick(15000);
		discardPeriodicTasks();
		expect(comp['toastrService'].error).toHaveBeenCalled();
	}));
	it('Should submit Test If selected_icd10_Codes Length Equal 0.', fakeAsync(() => {
		comp.selectedVisits = [{ visit_session_id: 10 }];
		spyOn(comp['toastrService'], 'error');
		comp.submit();
		tick(15000);
		discardPeriodicTasks();
		expect(comp['toastrService'].error).toHaveBeenCalled();
	}));
	it('Should submit Test If selectedVisits Length Equal 0.', fakeAsync(() => {
		comp.selected_icd10_Codes = [{ id: 10 }];
		spyOn(comp['toastrService'], 'error');
		comp.submit();
		tick(15000);
		discardPeriodicTasks();
		expect(comp['toastrService'].error).toHaveBeenCalled();
	}));
	afterAll(() => {
		TestBed.resetTestingModule();
	});
});
