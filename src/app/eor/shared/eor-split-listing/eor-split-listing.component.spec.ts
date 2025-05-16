import { CustomDiallogMockService } from '@appDir/shared/mock-services/CustomDialog.service';
import { EORService } from './../eor.service';
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
import { EorSplitListComponent } from './eor-split-listing.component';
import { EorSplitListingMockValues } from './eor-split-listing-mock-values/eor-split-listing-mock-values';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
describe('EorSplitListComponent', () => {
	let comp: EorSplitListComponent;
	let fixture: ComponentFixture<EorSplitListComponent>;
	let requestMockService = new RequestMockService();
	let eorMockService = new EorMockService();
	let eorSplitListingGetMockValue = new EorSplitListingMockValues();
	let custom_MockSerice = new CustomDiallogMockService();
	function openModal() {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique ',
		};
		comp.eorEditModelClosed = comp['modalService'].open('eor-split-listing', ngbModalOptions);
	}
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [EorSplitListComponent],
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
				ConfirmationService,
				{ provide: RequestService, useValue: requestMockService },
				{ provide: EORService, useValue: eorMockService },
				{ provide: CustomDiallogService, useValue: custom_MockSerice },
			],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(EorSplitListComponent);
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
			of({ status: true, componet: 'EOR' }).pipe(delay(1)),
		);
		spyOn(comp['eorService'], 'makeFilterObject');
		spyOn(comp['getChangePageData'], 'emit');
		spyOn(comp, 'getEorThroghSubject');
		spyOn(comp, 'closePopup');
		comp.ngOnInit();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.page.pageNumber).toBe(1);
		expect(comp.page.offset).toBe(0);
		expect(comp['eorService'].makeFilterObject).toHaveBeenCalled();
		expect(comp['getChangePageData'].emit).toHaveBeenCalled();
		expect(comp.getEorThroghSubject).toHaveBeenCalled();
		expect(comp.closePopup).toHaveBeenCalled();
	}));
	it('Should getEorInfo Test, Checked EorData should fetched with totalElements and total pages.Now We will test that all coming data is match with expected values.', fakeAsync(() => {
		spyOn(comp, 'addUrlQueryParams');
		spyOn(window, 'setTimeout');
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			of(eorSplitListingGetMockValue.getEorInfo).pipe(delay(1)),
		);
		comp.getEorInfo({ case_ids: [210], offset: 0 });
		tick(15000);
		discardPeriodicTasks();
		expect(comp.addUrlQueryParams).toHaveBeenCalled();
		expect(comp.eorData.length).toBe(eorSplitListingGetMockValue.getEorInfo.result.data.length);
		expect(comp.loadSpin).toBe(false);
		expect(comp.page.offset).toBe(0);
		expect(comp.page.totalPages).toBe(eorSplitListingGetMockValue.getEorInfo.result.page);
		expect(comp.page.totalElements).toBe(eorSplitListingGetMockValue.getEorInfo.result.total);
		expect(window.setTimeout).toHaveBeenCalled();
		expect(comp.addUrlQueryParams).toHaveBeenCalled();
	}));
	it('Should getEorInfo Function Test When request service return Unsuccessfull and throwError, Then check loadsping variable should be false.', fakeAsync(() => {
		spyOn(comp, 'addUrlQueryParams');
		spyOn(requestMockService, 'sendRequest').and.returnValue(throwError('Error'));
		comp.getEorInfo({ case_ids: [210], offset: 0 });
		tick(15000);
		discardPeriodicTasks();
		expect(comp.addUrlQueryParams).toHaveBeenCalled();
		expect(comp.loadSpin).toBe(false);
	}));
	it('Should onPageChange Test,Here Page values and functions should be checked.', () => {
		let InitOffSet = 0;
		spyOn(comp, 'paramsObject');
		spyOn(comp, 'getEorInfo');
		comp.onPageChange({ offset: InitOffSet });
		expect(comp.page.offset).toBe(InitOffSet);
		expect(comp.page.pageNumber).toBe(InitOffSet + 1);
		expect(comp.paramsObject).toHaveBeenCalled();
		expect(comp.getEorInfo).toHaveBeenCalled();
	});
	it('Should onEOREdit Test, Here we will check ngbModal should be opened and also check some eorSerive functions are call.', () => {
		comp.eorFormSplit = true;
		spyOn(comp['modalService'], 'open');
		spyOn(comp['eorService'], 'eorPushId');
		spyOn(comp['eorService'], 'pushResetEorForm');
		comp.onEOREdit({ eor_id: 45, id: 10, bill_id: 12 });
		expect(comp['modalService'].open).toHaveBeenCalled();
		expect(comp['eorService'].eorPushId).toHaveBeenCalled();
		expect(comp['eorService'].pushResetEorForm).toHaveBeenCalled();
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
		spyOn(comp, 'getEorInfo');
		comp.pageLimit(pageSize);
		expect(comp.page.size).toBe(pageSize);
		expect(comp.page.offset).toBe(0);
		expect(comp.page.pageNumber).toBe(1);
		expect(comp.getEorInfo).toHaveBeenCalled();
		expect(comp.paramsObject).toHaveBeenCalled();
	});
	it('Should onDeleteEOR Test, Will be test that confirmation modal should be open for confirmation and If confirmation service return true then Page variable values should be checked and and eor Service method should check and run', fakeAsync(() => {
		spyOn(custom_MockSerice, 'confirm').and.returnValue(Promise.resolve(true));
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			of({ status: true, message: 'Successfull' }).pipe(delay(1)),
		);
		spyOn(comp['toastrService'], 'success');
		spyOn(comp['eorService'], 'isBillId').and.returnValue(true);
		spyOn(comp['eorService'], 'reloadEorAfterAdd');
		spyOn(comp['eorService'], 'pushResetForm');
		comp.onDeleteEOR({ eor_id: 10 });
		tick(15000);
		discardPeriodicTasks();
		expect(comp.page.offset).toBe(0);
		expect(comp.page.pageNumber).toBe(0);
		expect(comp['toastrService'].success).toHaveBeenCalled();
		expect(comp['eorService'].reloadEorAfterAdd).toHaveBeenCalled();
		expect(comp['eorService'].pushResetForm).toHaveBeenCalled();
	}));
	it('Should onDeleteEOR Test When Reqeust Service UnSuccessfull Now check that toaster service should dispaly With Error message and loadspin should be false.', fakeAsync(() => {
		spyOn(custom_MockSerice, 'confirm').and.returnValue(Promise.resolve(true));
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			throwError({ error: { message: 'Error Message' } }),
		);
		spyOn(comp['toastrService'], 'error');
		comp.onDeleteEOR({ eor_id: 10 });
		tick(15000);
		discardPeriodicTasks();
		expect(comp['toastrService'].error).toHaveBeenCalled();
		expect(comp.loadSpin).toBe(false);
	}));
	it('Should getEorThroghSubject Test, In that getEorInfo method should be call after EorService.pullReloadEor() method return successfull responce.', fakeAsync(() => {
		comp.eorFormSplit = false;
		let pullReloadResp = 10;
		spyOn(comp, 'getEorInfo');
		spyOn(eorMockService, 'pullReloadEor').and.returnValue(of(pullReloadResp).pipe(delay(1)));
		comp.getEorThroghSubject();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.bill_ids).toBe(pullReloadResp);
		expect(comp.getEorInfo).toHaveBeenCalled();
	}));
	it('Should paramsObject Test, We will check that return reponce matched with expectation values.', () => {
		comp.bill_ids = 10;
		comp.case_ids = [10];
		spyOn(comp['eorService'], 'makeFilterObject').and.returnValue({});
		let paramsResp = comp.paramsObject();
		expect(paramsResp).toEqual(eorSplitListingGetMockValue.paramsObject);
	});
	it('Should closePopup Test, Will Test a component function will run after EorService give the successfull responce.', fakeAsync(() => {
		openModal();
		comp.eorFormSplit = true;
		spyOn(comp, 'refreshAfterUpdateDataByTab');
		spyOn(eorMockService, 'pullEorPopupModelClose').and.returnValue(of(true).pipe(delay(1)));
		comp.closePopup();
		tick(15000);
		discardPeriodicTasks();
		comp.eorEditModelClosed.close();
		expect(comp.refreshAfterUpdateDataByTab).toHaveBeenCalled();
	}));
	it('Should refreshAfterUpdateDataByTab Test, In That some page values and getchangePagedata functon should check.', () => {
		spyOn(comp['getChangePageData'], 'emit');
		comp.refreshAfterUpdateDataByTab();
		expect(comp.page.pageNumber).toBe(1);
		expect(comp.page.offset).toBe(0);
		expect(comp['getChangePageData'].emit).toHaveBeenCalled();
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
		spyOn(comp,'getEorInfo');
		comp.sorting(obj);
		expect(comp.page.column).toMatch('eor_date');
		expect(comp.page.order).toMatch(obj.sorts[0].dir);
		expect(comp.paramsObject).toHaveBeenCalled();
		expect(comp.getEorInfo).toHaveBeenCalled();
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
