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
import { EORService } from '@appDir/eor/shared/eor.service';
import { VerificationSplitListComponent } from './verification-split-listing.component';
import { VerificationSplitListingMockValues } from './verification-split-listing-mock-values/verification-split-listing-mock-values';
import { VerificationMockService } from '@appDir/shared/mock-services/VerificationMockService.service';
import { VerificationService } from '@appDir/verification/verification.service';
describe('VerificationSplitListComponent', () => {
	let comp: VerificationSplitListComponent;
	let fixture: ComponentFixture<VerificationSplitListComponent>;
	let requestMockService = new RequestMockService();
	let eorMockService = new EorMockService();
	let eorSplitListingGetMockValue = new VerificationSplitListingMockValues();
	let custom_MockSerice = new CustomDiallogMockService();
	let verification_mockService = new VerificationMockService();
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [VerificationSplitListComponent],
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
				{ provide: VerificationService, useValue: verification_mockService },
				{ provide: CustomDiallogService, useValue: custom_MockSerice },
			],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(VerificationSplitListComponent);
		comp = fixture.componentInstance;
	});
	afterEach(() => {
		TestBed.resetTestingModule();
	});
	it('should be created', () => {
		expect(comp).toBeTruthy();
	});
	it('Should ngOnInit Test, In that pullDoSearch function should responce successfully, Here also check page information and a function onChangeDataDenial should call.', () => {
		spyOn(comp, 'verificationInfoThroughSubject');
		spyOn(comp, 'closeVerificationPopup');
		comp.ngOnInit();
		expect(comp.page.pageNumber).toBe(0);
		expect(comp.page.size).toBe(comp.limit);
		expect(comp.verificationInfoThroughSubject).toHaveBeenCalled();
		expect(comp.closeVerificationPopup).toHaveBeenCalled();
	});
	it('Should getDenialInfo Test, Checked EorData should fetched with totalElements and total pages.Now We will test that all coming data is match with expected values.', fakeAsync(() => {
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			of(eorSplitListingGetMockValue.getDenialInfo).pipe(delay(1)),
		);
		comp.getDenialInfo({ case_ids: [210], offset: 0 });
		tick(15000);
		discardPeriodicTasks();
		expect(comp.denialData.length).toBe(
			eorSplitListingGetMockValue.getDenialInfo.result.data.length,
		);
		expect(comp.page.offset).toBe(0);
		expect(comp.page.totalPages).toBe(eorSplitListingGetMockValue.getDenialInfo.result.last_page);
		expect(comp.page.totalElements).toBe(eorSplitListingGetMockValue.getDenialInfo.result.total);
	}));
	it('Should getDenialInfo Function Test When request service return Unsuccessfull and throwError.', fakeAsync(() => {
		spyOn(requestMockService, 'sendRequest').and.returnValue(throwError('Error'));
		comp.getDenialInfo({ case_ids: [210], offset: 0 });
		tick(15000);
		discardPeriodicTasks();
		expect(comp).toBeTruthy();
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
	it('Should onDenialEdit Test, Here we will check ngbModal should be opened and also check some verificationService functions are call.', () => {
		comp.denialFormSplit = true;
		spyOn(comp['verificationService'], 'pushVerificationId');
		spyOn(comp['verificationService'], 'pushVerificationForm');
		fixture.detectChanges();
		comp.onDenialEdit({ eor_id: 45, id: 10, bill_id: 12 });
		expect(comp['verificationService'].pushVerificationId).toHaveBeenCalled();
		expect(comp['verificationService'].pushVerificationForm).toHaveBeenCalled();
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
	it('Should onDeleteVerficationRecived Test, Will be test that confirmation modal should be open for confirmation and If confirmation service return true then Page variable values should be checked and and eor Service method should check and run', fakeAsync(() => {
		// spyOn(custom_MockSerice, 'confirm').and.returnValue(Promise.resolve(true));
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			of({ status: true, message: 'Successfull' }).pipe(delay(1)),
		);
		spyOn(comp['toastrService'], 'success');
		spyOn(comp['verificationService'], 'isBillId').and.returnValue(true);
		spyOn(comp['verificationService'], 'reloadVerificationAfterAdd');
		spyOn(comp['verificationService'], 'pushVerificationForm');
		comp.onDeleteVerficationRecived({ eor_id: 10 });
		tick(15000);
		discardPeriodicTasks();
		expect(comp.page.offset).toBe(0);
		expect(comp.page.pageNumber).toBe(0);
		expect(comp['toastrService'].success).toHaveBeenCalled();
		expect(comp['verificationService'].reloadVerificationAfterAdd).toHaveBeenCalled();
		expect(comp['verificationService'].pushVerificationForm).toHaveBeenCalled();
	}));
	it('Should verificationInfoThroughSubject Test, In that getDenialInfo method should be call after DenialService.pullReloadEor() method return successfull responce.', fakeAsync(() => {
		comp.denialFormSplit = false;
		let pullReloadResp = 10;
		spyOn(comp, 'getDenialInfo');
		spyOn(verification_mockService, 'pullReloadVerification').and.returnValue(
			of(pullReloadResp).pipe(delay(1)),
		);
		comp.verificationInfoThroughSubject();
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
	it('Should closeVerificationPopup Test', fakeAsync(() => {
		comp.denialFormSplit = true;
		spyOn(comp, 'closePopup');
		spyOn(verification_mockService, 'pullclosedVerificationPopup').and.returnValue(
			of(true).pipe(delay(1)),
		);
		comp.closeVerificationPopup();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.closePopup).toHaveBeenCalled();
	}));
	it('Should addmanualAppeal Test', () => {
		spyOn(comp['addManualAppealEmitter'], 'emit');
		comp.addmanualAppeal([]);
		expect(comp['addManualAppealEmitter'].emit).toHaveBeenCalled();
	});
	it('Should makeFileNameInEdit Test', () => {
		let result = comp.makeFileNameInEdit(
			{ label_id: 10, bill_amount: 2500 },
			{ last_name: 'mockLastName' },
		);
		expect(result).toMatch('10_denial_mockLastName_2500.00.pdf');
	});
	afterAll(() => {
		TestBed.resetTestingModule();
	});
});
