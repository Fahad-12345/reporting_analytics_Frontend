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
import { DenialSplitListComponent } from './denial-split-listing.component';
import { DenialSplitListingMockValues } from './denial-split-listing/denial-split-listing-mock-values';
import { EORService } from '@appDir/eor/shared/eor.service';
import { DenialMockService } from '@appDir/shared/mock-services/DenialMock.service';
import { DenialService } from '@appDir/denial/denial.service';
describe('DenialSplitListComponent', () => {
	let comp: DenialSplitListComponent;
	let fixture: ComponentFixture<DenialSplitListComponent>;
	let requestMockService = new RequestMockService();
	let eorMockService = new EorMockService();
	let eorSplitListingGetMockValue = new DenialSplitListingMockValues();
	let custom_MockSerice = new CustomDiallogMockService();
	let denial_mockSerivce = new DenialMockService();
	function openModal() {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.denialEditModelClosed = comp['modalService'].open('eor-split-listing', ngbModalOptions);
	}
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [DenialSplitListComponent],
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
				{ provide: EORService, useValue: eorMockService },
				{ provide: DenialService, useValue: denial_mockSerivce },
				{ provide: CustomDiallogService, useValue: custom_MockSerice },
			],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(DenialSplitListComponent);
		comp = fixture.componentInstance;
	});
	afterEach(() => {
		TestBed.resetTestingModule();
	});
	it('should be created', () => {
		expect(comp).toBeTruthy();
	});
	it('Should ngOnInit Test, In that pullDoSearch function should responce successfully, Here also check page information and a function onChangeDataDenial should call.', fakeAsync(() => {
		spyOn(eorMockService, 'pullDoSearch').and.returnValue(
			of({ status: true, componet: 'Denial' }).pipe(delay(1)),
		);
		spyOn(comp['eorService'], 'makeFilterObject');
		spyOn(comp['onChangeDataDenial'], 'emit');
		spyOn(comp, 'denialInfoThroughSubject');
		spyOn(comp, 'closeDenialPopup');
		comp.ngOnInit();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.page.offset).toBe(0);
		expect(comp['eorService'].makeFilterObject).toHaveBeenCalled();
		expect(comp['onChangeDataDenial'].emit).toHaveBeenCalled();
		expect(comp.denialInfoThroughSubject).toHaveBeenCalled();
		expect(comp.closeDenialPopup).toHaveBeenCalled();
	}));
	it('Should getDenialInfo Test, Checked EorData should fetched with totalElements and total pages.Now We will test that all coming data is match with expected values.', fakeAsync(() => {
		spyOn(comp, 'addUrlQueryParams');
		spyOn(window, 'setTimeout');
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			of(eorSplitListingGetMockValue.getDenialInfo).pipe(delay(1)),
		);
		comp.getDenialInfo({ case_ids: [210], offset: 0 });
		tick(15000);
		discardPeriodicTasks();
		expect(comp.addUrlQueryParams).toHaveBeenCalled();
		expect(comp.denialData.length).toBe(eorSplitListingGetMockValue.getDenialInfo.result.data.length);
		expect(comp.loadSpin).toBe(false);
		expect(comp.page.offset).toBe(0);
		expect(comp.page.totalPages).toBe(eorSplitListingGetMockValue.getDenialInfo.result.last_page);
		expect(comp.page.totalElements).toBe(eorSplitListingGetMockValue.getDenialInfo.result.total);
		expect(window.setTimeout).toHaveBeenCalled();
		expect(comp.addUrlQueryParams).toHaveBeenCalled();
	}));
	it('Should getDenialInfo Function Test When request service return Unsuccessfull and throwError, Then check loadsping variable should be false.', fakeAsync(() => {
		spyOn(comp, 'addUrlQueryParams');
		spyOn(requestMockService, 'sendRequest').and.returnValue(throwError('Error'));
		comp.getDenialInfo({ case_ids: [210], offset: 0 });
		tick(15000);
		discardPeriodicTasks();
		expect(comp.addUrlQueryParams).toHaveBeenCalled();
		expect(comp.loadSpin).toBe(false);
	}));
	it('Should onPageChange Test,Here Page values and functions should be checked.', () => {
		let InitOffSet = 0;
		spyOn(comp, 'paramsObject');
		spyOn(comp, 'getDenialInfo');
		comp.onPageChange({ offset: InitOffSet });
		expect(comp.page.offset).toBe(InitOffSet);
		expect(comp.page.pageNumber).toBe(InitOffSet + 1);
		expect(comp.paramsObject).toHaveBeenCalled();
		expect(comp.getDenialInfo).toHaveBeenCalled();
	});
	it('Should onDenialEdit Test, Here we will check ngbModal should be opened and also check some eorSerive functions are call.', () => {
		comp.denialFormSplit = true;
		spyOn(comp['modalService'], 'open');
		spyOn(comp['denailService'], 'pushDenialId');
		spyOn(comp['denailService'], 'pushDenialForm');
		comp.onDenialEdit({ eor_id: 45, id: 10, bill_id: 12 });
		expect(comp['modalService'].open).toHaveBeenCalled();
		expect(comp['denailService'].pushDenialId).toHaveBeenCalled();
		expect(comp['denailService'].pushDenialForm).toHaveBeenCalled();
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
		spyOn(comp, 'getDenialInfo');
		comp.pageLimit(pageSize);
		expect(comp.page.size).toBe(pageSize);
		expect(comp.page.offset).toBe(0);
		expect(comp.page.pageNumber).toBe(1);
		expect(comp.getDenialInfo).toHaveBeenCalled();
		expect(comp.paramsObject).toHaveBeenCalled();
	});
	it('Should onDeleteDeinal Test, Will be test that confirmation modal should be open for confirmation and If confirmation service return true then Page variable values should be checked and and eor Service method should check and run', fakeAsync(() => {
		spyOn(custom_MockSerice, 'confirm').and.returnValue(Promise.resolve(true));
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			of({ status: true, message: 'Successfull' }).pipe(delay(1)),
		);
		spyOn(comp['toastrService'], 'success');
		spyOn(comp['denailService'], 'isBillId').and.returnValue(true);
		spyOn(comp['denailService'], 'reloadDenialAfterAdd');
		spyOn(comp['denailService'], 'pushDenialForm');
		comp.onDeleteDeinal({ eor_id: 10 });
		tick(15000);
		discardPeriodicTasks();
		expect(comp.page.offset).toBe(0);
		expect(comp.page.pageNumber).toBe(0);
		expect(comp['toastrService'].success).toHaveBeenCalled();
		expect(comp['denailService'].reloadDenialAfterAdd).toHaveBeenCalled();
		expect(comp['denailService'].pushDenialForm).toHaveBeenCalled();
	}));
	it('Should onDeleteDeinal Test When Reqeust Service UnSuccessfull Now check that toaster service should dispaly With Error message and loadspin should be false.', fakeAsync(() => {
		spyOn(custom_MockSerice, 'confirm').and.returnValue(Promise.resolve(true));
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			throwError({ error: { message: 'Error Message' } }),
		);
		spyOn(comp['toastrService'], 'error');
		comp.onDeleteDeinal({ eor_id: 10 });
		tick(15000);
		discardPeriodicTasks();
		expect(comp['toastrService'].error).toHaveBeenCalled();
		expect(comp.loadSpin).toBe(false);
	}));
	it('Should denialInfoThroughSubject Test, In that getDenialInfo method should be call after DenialService.pullReloadEor() method return successfull responce.', fakeAsync(() => {
		comp.denialFormSplit = false;
		let pullReloadResp = 10;
		spyOn(comp, 'getDenialInfo');
		spyOn(denial_mockSerivce, 'pullReloadDenial').and.returnValue(of(pullReloadResp).pipe(delay(1)));
		comp.denialInfoThroughSubject();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.bill_ids).toBe(pullReloadResp);
		expect(comp.getDenialInfo).toHaveBeenCalled();
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
		comp.denialFormSplit = true;
		spyOn(comp, 'reloadAfterDenialUpdateByTab');
		spyOn(eorMockService, 'pullEorPopupModelClose').and.returnValue(of(true).pipe(delay(1)));
		comp.closePopup();
		tick(15000);
		discardPeriodicTasks();
		comp.denialEditModelClosed.close();
		expect(comp.reloadAfterDenialUpdateByTab).toHaveBeenCalled();
	}));
	it('Should reloadAfterDenialUpdateByTab Test, In That some page values and getchangePagedata functon should check.', () => {
		comp.reloadAfterDenialUpdateByTab();
		expect(comp.page.pageNumber).toBe(1);
		expect(comp.page.offset).toBe(0);
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
		spyOn(comp,'getDenialInfo');
		comp.sorting(obj);
		expect(comp.page.column).toMatch('denial_date');
		expect(comp.page.order).toMatch(obj.sorts[0].dir);
		expect(comp.paramsObject).toHaveBeenCalled();
		expect(comp.getDenialInfo).toHaveBeenCalled();
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
