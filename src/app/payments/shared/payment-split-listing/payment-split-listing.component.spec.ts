import { CustomDiallogMockService } from '@appDir/shared/mock-services/CustomDialog.service';
import { EorMockService } from './../../../shared/mock-services/EorMockService.service';
import { RequestService } from '@shared/services/request.service';
import { RequestMockService } from '@appDir/shared/mock-services/RequestMock.service';
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
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { PaymentSplitListComponent } from './payment-split-listing.component';
import { PaymentSplitListingMockValues } from './payment-split-listing-mock-values/payment-split-listing-mock-values';
import { PaymentMockService } from '@appDir/shared/mock-services/paymentMockService.service';
import { PaymentService } from '@appDir/payments/payment.service';
import { EORService } from '@appDir/eor/shared/eor.service';
describe('PaymentSplitListComponent', () => {
	let comp: PaymentSplitListComponent;
	let fixture: ComponentFixture<PaymentSplitListComponent>;
	let requestMockService = new RequestMockService();
	let eorMockService = new EorMockService();
	let paymentMockSerivce = new PaymentMockService();
	let eorSplitListingGetMockValue = new PaymentSplitListingMockValues();
	let custom_MockSerice = new CustomDiallogMockService();
	function openModal() {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.paymentEditModelClosed = comp['modalService'].open('eor-split-listing', ngbModalOptions);
	}
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [PaymentSplitListComponent],
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
				{ provide: RequestService, useValue: requestMockService },
				{ provide: PaymentService, useValue: paymentMockSerivce },
				{ provide: EORService, useValue: eorMockService },
				{ provide: CustomDiallogService, useValue: custom_MockSerice },
			],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(PaymentSplitListComponent);
		comp = fixture.componentInstance;
	});
	afterEach(() => {
		TestBed.resetTestingModule();
	});
	it('should be created', () => {
		expect(comp).toBeTruthy();
	});
	it('Should ngOnInit Test, In that pullDoSearch function should responce successfully, Here also check page information and a function getChangePageData should call.', fakeAsync(() => {
		spyOn(eorMockService, 'pullDoSearch').and.returnValue(
			of({ status: true, componet: 'Payment' }).pipe(delay(1)),
		);
		spyOn(comp['eorService'], 'makeFilterObject');
		spyOn(comp['changePaymentData'], 'emit');
		spyOn(comp, 'getPaymentThroghSubject');
		spyOn(comp, 'closePopup');
		comp.ngOnInit();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.page.pageNumber).toBe(0);
		expect(comp.page.offset).toBe(0);
		expect(comp['eorService'].makeFilterObject).toHaveBeenCalled();
		expect(comp['changePaymentData'].emit).toHaveBeenCalled();
		expect(comp.getPaymentThroghSubject).toHaveBeenCalled();
		expect(comp.closePopup).toHaveBeenCalled();
	}));
	it('Should getPaymentInfo Test, Checked EorData should fetched with totalElements and total pages.Now We will test that all coming data is match with expected values.', fakeAsync(() => {
		spyOn(comp, 'addUrlQueryParams');
		spyOn(window, 'setTimeout');
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			of(eorSplitListingGetMockValue.getEorInfo).pipe(delay(1)),
		);
		comp.getPaymentInfo({ case_ids: [210], offset: 0 });
		tick(15000);
		discardPeriodicTasks();
		expect(comp.addUrlQueryParams).toHaveBeenCalled();
		expect(comp.paymentData.length).toBe(eorSplitListingGetMockValue.getEorInfo.result.data.length);
		expect(comp.loadSpin).toBe(false);
		expect(comp.page.offset).toBe(0);
		expect(comp.page.totalElements).toBe(eorSplitListingGetMockValue.getEorInfo.result.total);
		expect(window.setTimeout).toHaveBeenCalled();
		expect(comp.addUrlQueryParams).toHaveBeenCalled();
	}));
	it('Should getPaymentInfo Function Test When request service return Unsuccessfull and throwError, Then check loadsping variable should be false.', fakeAsync(() => {
		spyOn(comp, 'addUrlQueryParams');
		spyOn(requestMockService, 'sendRequest').and.returnValue(throwError('Error'));
		comp.getPaymentInfo({ case_ids: [210], offset: 0 });
		tick(15000);
		discardPeriodicTasks();
		expect(comp.addUrlQueryParams).toHaveBeenCalled();
		expect(comp.loadSpin).toBe(false);
	}));
	it('Should onPageChange Test,Here Page values and functions should be checked.', () => {
		let InitOffSet = 0;
		spyOn(comp, 'paramsObject');
		spyOn(comp, 'getPaymentInfo');
		comp.onPageChange({ offset: InitOffSet });
		expect(comp.page.offset).toBe(InitOffSet);
		expect(comp.page.pageNumber).toBe(InitOffSet + 1);
		expect(comp.paramsObject).toHaveBeenCalled();
		expect(comp.getPaymentInfo).toHaveBeenCalled();
	});
	it('Should onPaymentEdit Test, Here we will check ngbModal should be opened and also check some eorSerive functions are call.', () => {
		comp.editForm = true;
		spyOn(comp['modalService'], 'open');
		spyOn(comp['eorService'], 'pushPaymentId');
		comp.onPaymentEdit({ payment_id: 45});
		expect(comp['modalService'].open).toHaveBeenCalled();
		expect(comp['eorService'].pushPaymentId).toHaveBeenCalled();
	});
	it('Should viewDocFile Test,Here Will test window.open() function should be run after media link received.', () => {
		spyOn(comp, 'getLinkwithAuthToken');
		spyOn(window, 'open');
		comp.viewDocFile({ media: { link: 'mock_lick' } });
		expect(comp.getLinkwithAuthToken).toHaveBeenCalled();
		expect(window.open).toHaveBeenCalled();
	});
	it('Should getLinkwithAuthToken Test If Token true', () => {
		spyOn(comp['storageData'], 'getToken').and.returnValue(true);
		let result = comp.getLinkwithAuthToken('link');
		expect(result).toMatch('link&token=true');
	});
	it('Should getLinkwithAuthToken Test If Token false', () => {
		spyOn(comp['storageData'], 'getToken').and.returnValue(false);
		let result = comp.getLinkwithAuthToken('link');
		expect(result).toMatch('link');
	});
	it('Should pageLimit Test, Page Variables values should be mateched for test and two component methods getEorInfor and paramsObject should be called.', () => {
		let pageSize = 10;
		spyOn(comp, 'paramsObject');
		spyOn(comp, 'getPaymentInfo');
		comp.pageLimit(pageSize);
		expect(comp.page.size).toBe(pageSize);
		expect(comp.page.offset).toBe(0);
		expect(comp.page.pageNumber).toBe(1);
		expect(comp.getPaymentInfo).toHaveBeenCalled();
		expect(comp.paramsObject).toHaveBeenCalled();
	});
	it('Should onDeletePayment Test, Will be test that confirmation modal should be open for confirmation and If confirmation service return true then Page variable values should be checked and and eor Service method should check and run', fakeAsync(() => {
		// spyOn(custom_MockSerice, 'confirm').and.returnValue(Promise.resolve(true));
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			of({ status: true, message: 'Successfull' }).pipe(delay(1)),
		);
		spyOn(comp['toastrService'], 'success');
		spyOn(comp['paymentService'], 'reloadPaymentAfterAdd');
		spyOn(comp['paymentService'], 'pushResetForm');
		comp.onDeletePayment({ eor_id: 10 });
		tick(15000);
		discardPeriodicTasks();
		expect(comp.page.offset).toBe(0);
		expect(comp.page.pageNumber).toBe(0);
		expect(comp['toastrService'].success).toHaveBeenCalled();
		expect(comp['paymentService'].reloadPaymentAfterAdd).toHaveBeenCalled();
		expect(comp['paymentService'].pushResetForm).toHaveBeenCalled();
	}));
	it('Should onDeletePayment Test When Reqeust Service UnSuccessfull Now check that toaster service should dispaly With Error message and loadspin should be false.', fakeAsync(() => {
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			throwError({ error: { message: 'Error Message' } }),
		);
		spyOn(comp['toastrService'], 'error');
		comp.onDeletePayment({ eor_id: 10 });
		tick(15000);
		discardPeriodicTasks();
		expect(comp['toastrService'].error).toHaveBeenCalled();
		expect(comp.loadSpin).toBe(false);
	}));
	it('Should getPaymentThroghSubject Test, In that getEorInfo method should be call after EorService.pullReloadEor() method return successfull responce.', fakeAsync(() => {
		comp.editForm = false;
		let pullReloadResp = 10;
		spyOn(comp, 'getPaymentInfo');
		spyOn(paymentMockSerivce, 'pullReloadPayment').and.returnValue(of(pullReloadResp).pipe(delay(1)));
		comp.getPaymentThroghSubject();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.bill_ids).toBe(pullReloadResp);
		expect(comp.getPaymentInfo).toHaveBeenCalled();
	}));
	it('Should paramsObject Test, We will check that return reponce matched with expectation values.', () => {
		comp.bill_ids = 10;
		comp.case_ids = [10];
		spyOn(comp['eorService'], 'makeFilterObject').and.returnValue({});
		let paramsResp = comp.paramsObject();
		debugger;
		expect(paramsResp).toEqual(eorSplitListingGetMockValue.paramsObject);
	});
	it('Should closePopup Test, Will Test a component function will run after EorService give the successfull responce.', fakeAsync(() => {
		openModal();
		spyOn(comp, 'refreshAfterUpdateDataByTab');
		spyOn(paymentMockSerivce, 'pullPaymentEditPopup').and.returnValue(of(true).pipe(delay(1)));
		comp.closePopup();
		tick(15000);
		discardPeriodicTasks();
		comp.paymentEditModelClosed.close();
		expect(comp.refreshAfterUpdateDataByTab).toHaveBeenCalled();
	}));
	it('Should refreshAfterUpdateDataByTab Test, In That some page values and getchangePagedata functon should check.', () => {
		openModal();
		spyOn(comp['changePaymentData'], 'emit');
		comp.refreshAfterUpdateDataByTab();
		expect(comp.page.pageNumber).toBe(1);
		expect(comp.page.offset).toBe(0);
		expect(comp['changePaymentData'].emit).toHaveBeenCalled();
	});
	it('Should openReciptentModal Test, After calling that function will be test that currentBill and BillingRecipientData values should Equal.', () => {
		let rowMockValue = { bill: { bill_recipients: [{}] } };
		spyOn(comp['modalService'], 'open');
		comp.openReciptentModal(rowMockValue, 'reciptentModal');
		expect(comp.currentBill).toEqual(rowMockValue);
		expect(comp.billingReciptentdata).toEqual(rowMockValue.bill.bill_recipients);
	});
	it('Should getRecipatentName Test Whe recipient Type id 1, Here We will verify that should return full name with first name, middle name and last name.', () => {
		let Result = comp.getRecipatentName(
			eorSplitListingGetMockValue.getRecipatentNameWithBillRecipientTypeId_1_Resp,
		);
		expect(Result).toMatch('first_Name_Mock_value middle_name_Mock_value last_name_Mock_value');
	});
	it('Should getRecipatentName Test Whe recipient Type id 2, Here We will verify that should return employer name matched with actuall name.', () => {
		let Result = comp.getRecipatentName(
			eorSplitListingGetMockValue.getRecipatentNameWithBillRecipientTypeId_2_Resp,
		);
		expect(Result).toMatch('employer_name_Mock_value');
	});
	it('Should getRecipatentName Test Whe recipient Type id not 1 OR 2, Here We will verify that should return insrurance name.', () => {
		let Result = comp.getRecipatentName(
			eorSplitListingGetMockValue.getRecipatentNameWithBillRecipientTypeId_3_Resp,
		);
		expect(Result).toMatch('insurance_name_Mock_value');
	});
	it('Should sorting Test', () => {
		let obj = {sorts:[{ dir: 'asc', prop: 'no_of_days' }]};
		spyOn(comp,'paramsObject');
		spyOn(comp,'getPaymentInfo');
		comp.sorting(obj);
		expect(comp.page.column).toMatch('check_date');
		expect(comp.page.order).toMatch(obj.sorts[0].dir);
		expect(comp.paramsObject).toHaveBeenCalled();
		expect(comp.getPaymentInfo).toHaveBeenCalled();
	});
	it('Should addUrlQueryParams Test,That Test case responsible for add params in Url,But in That case will be checked that replaceState method is calling Which is responsible for add params in url.', () => {
		spyOn(comp['location'], 'replaceState');
		comp.addUrlQueryParams({});
		expect(comp['location'].replaceState).toHaveBeenCalled();
	});
	afterAll(() => {
		TestBed.resetTestingModule();
	});
});
