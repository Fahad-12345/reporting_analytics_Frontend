import { RequestService } from './../../../../shared/services/request.service';
import { RequestMockService } from './../../../../shared/mock-services/RequestMock.service';
import { EORService } from '@appDir/eor/shared/eor.service';
import { EorMockService } from '@appDir/shared/mock-services/EorMockService.service';
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
import { PaymentFormSplitComponent } from './payment-form-split.component';
import { PaymentMockService } from '@appDir/shared/mock-services/paymentMockService.service';
import { PaymentService } from '@appDir/payments/payment.service';
import { PaymentFormSplitMockValues } from './payment-form-split-mock.values/payment-form-split-mock-values';
import { PaymentBillUrlsEnum } from '@appDir/payments/payment.enum.urls';
import { WrappedSocket } from '@appDir/scheduler-front-desk/modules/sockets/socket-io.service';
describe('PaymentFormSplitComponent', () => {
	let comp: PaymentFormSplitComponent;
	let fixture: ComponentFixture<PaymentFormSplitComponent>;
	let payment_mockService = new PaymentMockService();
	let eor_mockService = new EorMockService();
	let paymentMockValues = new PaymentFormSplitMockValues();
	let requestService = new RequestMockService();
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [PaymentFormSplitComponent],
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
				{ provide: PaymentService, useValue: payment_mockService },
				{ provide: EORService, useValue: eor_mockService },
				{ provide: RequestService, useValue: requestService },
				{ provide: WrappedSocket, useValue: {} },
			],
		}).compileComponents();
	}));
	beforeEach(() => {
		fixture = TestBed.createComponent(PaymentFormSplitComponent);
		comp = fixture.componentInstance;
	});
	afterEach(() => {
		TestBed.resetTestingModule();
	});
	it('should be created', () => {
		expect(comp).toBeTruthy();
	});
	it('Should ngOnInit Test', fakeAsync(() => {
		spyOn(comp, 'resetSpecificFields');
		spyOn(comp, 'getPaymentBy');
		spyOn(comp, 'getActionType');
		spyOn(comp, 'paymentType');
		spyOn(comp, 'getPaymentStatus');
		spyOn(comp, 'editFormInitialize');
		spyOn(comp, 'makeFileName');
		spyOn(comp, 'setFileName');
		spyOn(comp, 'getCurrentBillAmount');
		spyOn(comp['selectPaymentTypeAction'], 'setAmount');
		spyOn(comp['selectPaymentTypeAction'], 'setInterestAmount');
		spyOn(payment_mockService, 'pullResetForm').and.returnValue(of(true).pipe(delay(1)));
		spyOn(eor_mockService, 'pullResetPaymentForm').and.returnValue(of(true).pipe(delay(1)));
		comp.ngOnInit();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.addPayment.controls.file_name.disabled).toBe(true);
		expect(comp.addPayment.pristine).toBe(true);
		expect(comp.addPayment.untouched).toBe(true);
		expect(comp.resetSpecificFields).toHaveBeenCalled();
		expect(comp.getPaymentBy).toHaveBeenCalled();
		expect(comp.getActionType).toHaveBeenCalled();
		expect(comp.paymentType).toHaveBeenCalled();
		expect(comp.getCurrentBillAmount).toHaveBeenCalled();
		expect(comp.getPaymentStatus).toHaveBeenCalled();
		expect(comp.editFormInitialize).toHaveBeenCalled();
		expect(comp.makeFileName).toHaveBeenCalled();
		expect(comp.setFileName).toHaveBeenCalled();
		expect(comp['selectPaymentTypeAction'].setAmount).toHaveBeenCalled();
		expect(comp['selectPaymentTypeAction'].setInterestAmount).toHaveBeenCalled();
		expect(comp.payment_TypeClick).toBe(false);
		expect(comp.payment_ByClick).toBe(false);
		expect(comp.payment_statusClick).toBe(false);
		expect(comp.payment_actionClick).toBe(false);
	}));
	it('Should ngOnChanges Test', () => {
		comp.currentBill = { id: 10 };
		spyOn(comp, 'makeFileName');
		spyOn(comp, 'setFileName');
		comp.ngOnChanges({});
		expect(comp.makeFileName).toHaveBeenCalled();
		expect(comp.setFileName).toHaveBeenCalled();
	});
	it('Should initializeSearchForm Test', () => {
		let Form = comp.initializeSearchForm();
		expect(Form.value).toEqual(paymentMockValues.initializeForm);
	});
	it('Should resetSpecificFields Test', () => {
		spyOn(comp, 'setFileNameField');
		comp.addPayment = comp.initializeSearchForm();
		comp.resetSpecificFields();
		expect(comp.addPayment.value).toEqual(paymentMockValues.initializeForm);
		expect(comp.setFileNameField).toHaveBeenCalled();
		expect(comp.payment_TypeClick).toBe(false);
		expect(comp.payment_ByClick).toBe(false);
		expect(comp.payment_statusClick).toBe(false);
		expect(comp.payment_actionClick).toBe(false);
	});
	it('Should getActionType Test When status true', fakeAsync(() => {
		spyOn(comp['paymentService'], 'hasActionType').and.returnValue(true);
		spyOn(comp['paymentService'], 'setActionType');
		spyOn(payment_mockService, 'getActionType').and.returnValue(
			of(paymentMockValues.eorTypeList).pipe(delay(1)),
		);
		comp.getActionType({});
		tick(15000);
		discardPeriodicTasks();
		expect(comp['paymentService'].setActionType).toHaveBeenCalled();
		expect(comp.actionTypeData.length).toBe(paymentMockValues.eorTypeList.result.data.length);
	}));
	it('Should getActionType Test When status false', fakeAsync(() => {
		spyOn(payment_mockService, 'getActionType').and.returnValue(
			of(paymentMockValues.eorTypeList).pipe(delay(1)),
		);
		comp.getActionType({});
		tick(15000);
		discardPeriodicTasks();
		expect(comp.actionTypeData).toBeDefined();
	}));
	it('Should getActionType Test When payment service Unsuccessfull Responce', fakeAsync(() => {
		spyOn(comp['toastrService'], 'error');
		spyOn(payment_mockService, 'getActionType').and.returnValue(
			throwError({ message: 'Message Error' }),
		);
		comp.getActionType({});
		tick(15000);
		discardPeriodicTasks();
		expect(comp['toastrService'].error).toHaveBeenCalled();
	}));
	it('Should onSelectActionType Test', () => {
		comp.addPayment = comp.initializeSearchForm();
		comp.onSelectActionType([{ id: 10 }]);
		expect(comp.addPayment.controls.types.value).toBe(10);
	});
	it('Should onSelectPaymentBy Test', () => {
		comp.addPayment = comp.initializeSearchForm();
		comp.onSelectPaymentBy([{ id: 10 }]);
		expect(comp.addPayment.controls.types.value).toBe(10);
	});
	it('Should onItemSelectReception Test', () => {
		comp.addPayment = comp.initializeSearchForm();
		comp.addPayment.controls.types.setValue([{ id: 10 }, { id: 20 }]);
		spyOn(comp, 'implementValidationOfAmount');
		spyOn(comp['selectPaymentTypeAction'], 'setFieldNameShowOnSingalAction');
		comp.onItemSelectReception({ name: 'Name' });
		expect(comp.implementValidationOfAmount).toHaveBeenCalled();
		expect(comp['selectPaymentTypeAction'].setFieldNameShowOnSingalAction).toHaveBeenCalled();
	});
	it('Should onItemDeSelectReception Test', () => {
		comp.addPayment = comp.initializeSearchForm();
		comp.addPayment.controls.types.setValue([{ id: 20 }]);
		spyOn(comp['selectPaymentTypeAction'], 'setFieldNameShowOnSingalAction');
		comp.onItemDeSelectReception({ name: PaymentBillUrlsEnum.INTEREST });
		expect(comp.addPayment.controls.interest_amount.value).toBe(0.0);
		expect(comp.addPayment.controls.interest_amount.clearValidators).toBeTruthy();
		expect(comp.addPayment.controls.interest_amount.updateValueAndValidity).toBeTruthy();
	});
	it('Should onSelectAllReception Test', () => {
		comp.addPayment = comp.initializeSearchForm();
		spyOn(comp['selectPaymentTypeAction'], 'setFieldNameShowOnMultipleAction');
		comp.onSelectAllReception('');
		expect(comp.addPayment.controls.interest_amount.setValidators).toBeTruthy();
	});
	it('Should onItemDeSelectAllReception Test', () => {
		comp.addPayment = comp.initializeSearchForm();
		spyOn(comp['selectPaymentTypeAction'], 'setFieldNameShowOnMultipleAction');
		comp.onItemDeSelectAllReception('');
		expect(comp.addPayment.controls.interest_amount.setValidators).toBeTruthy();
		expect(comp.addPayment.controls.over_amount.value).toBe(0.0);
		expect(comp.addPayment.controls.interest_amount.value).toBe(0.0);
		expect(comp.addPayment.controls.bill_amount.value).toBe(0.0);
	});
	it('Should addRequiredInterestBill Test', () => {
		comp.addPayment = comp.initializeSearchForm();
		comp.addRequiredInterestBill();
		expect(comp.addPayment.controls.bill_amount.disable).toBeTruthy();
		expect(comp.addPayment.controls.interest_amount.validator).toBeTruthy();
	});
	it('Should max Test', () => {
		let result = comp.max(999999.99);
		expect(result).toBeTruthy();
	});
	it('Should findSaveAndSelect Test', () => {
		comp.addPayment = comp.initializeSearchForm();
		let TypesValues = [{ id: 10 }];
		comp.addPayment.controls.types.setValue(TypesValues);
		comp.findSaveAndSelect();
	});
	it('Should setFileNameField Test', () => {
		comp.currentBill = { id: 21 };
		spyOn(comp, 'makeFileName');
		spyOn(comp, 'setFileName');
		comp.setFileNameField();
		expect(comp.makeFileName).toHaveBeenCalled();
		expect(comp.setFileName).toHaveBeenCalled();
	});
	it('Should setFileName Test', () => {
		let mockName = 'Mock_File_Name';
		comp.addPayment = comp.initializeSearchForm();
		comp.setFileName(mockName, comp.addPayment, 'file_name');
		expect(comp.addPayment.controls.file_name.value).toMatch(mockName);
	});
	it('Should makeFileName Test', () => {
		comp.addPayment = comp.initializeSearchForm();
		comp.addPayment.controls.check_amount.setValue(999.999);
		let result = comp.makeFileName({
			patient_last_name: 'patient_last_name',
			label_id: 23,
			amount: 54.653,
		});
		expect(result).toMatch('23_payment_patient_last_name_1000.00.pdf');
	});
	const getFileList = (ext) => {
		const blob = new Blob([''], { type: `application/${ext}` });
		blob['lastModifiedDate'] = '';
		blob['name'] = `28-5-2021_Staging_Release Notes.${ext}`;
		const file = <File>blob;
		const fileList: FileList = {
			0: file,
			1: file,
			length: 2,
			item: (index: number) => file,
		};
		return fileList;
	};
	it('Should handleFileInput Test If not pdf', () => {
		spyOn(comp['toastrService'], 'error');
		comp.handleFileInput(getFileList('txt'));
		expect(comp['toastrService'].error).toHaveBeenCalled();
	});
	it('Should postPayments Function Test When add payment form invalid true', () => {
		comp.addPayment = comp.initializeSearchForm();
		let result = comp.postPayments();
		expect(result).toBe(false);
		expect(comp.submitted).toBe(true);
	});
	it('Should postPayments Function Test When add payment form valid true', () => {
		comp.currentBill = {
			id: 21,
		};
		comp.addPayment = comp.initializeSearchForm();
		comp.addPayment.patchValue(paymentMockValues.addPaymentFormValid);
		spyOn(comp, 'getCurrentBillAmount');
		spyOn(comp, 'editBillPaymentFP');
		comp.postPayments();
		expect(comp.btnDisable).toBe(true);
		expect(comp.submitted).toBe(false);
		expect(comp.getCurrentBillAmount).toHaveBeenCalled();
		expect(comp.editBillPaymentFP).toHaveBeenCalled();
	});
	it('Should postPayments Function Test When add payment form valid true With paymentModel Id not exists', () => {
		comp.currentBill = {
			id: 21,
		};
		comp.addPayment = comp.initializeSearchForm();
		comp.addPayment.patchValue(paymentMockValues.addPaymentFormValidWithoutID);
		spyOn(comp, 'getCurrentBillAmount');
		spyOn(comp, 'addBillPaymentFP');
		comp.postPayments();
		expect(comp.btnDisable).toBe(true);
		expect(comp.submitted).toBe(false);
		expect(comp.getCurrentBillAmount).toHaveBeenCalled();
		expect(comp.addBillPaymentFP).toHaveBeenCalled();
	});
	it('Should verifyOverPayment Test', () => {
		let result = comp.verifyOverPayment('overpayment');
		expect(result).toBe(true);
	});
	it('Should paymentType Test When status true', fakeAsync(() => {
		spyOn(comp['paymentService'], 'hasPaymentTypeList').and.returnValue(true);
		spyOn(comp['paymentService'], 'setPaymentType');
		spyOn(payment_mockService, 'paymentType').and.returnValue(
			of(paymentMockValues.eorTypeList).pipe(delay(1)),
		);
		comp.paymentType({});
		tick(15000);
		discardPeriodicTasks();
		expect(comp['paymentService'].setPaymentType).toHaveBeenCalled();
		expect(comp.paymentReceptionTypes.length).toBe(
			paymentMockValues.eorTypeList.result.data.length,
		);
	}));
	it('Should paymentType Test When status false', fakeAsync(() => {
		spyOn(comp['paymentService'], 'hasPaymentTypeList').and.returnValue(false);
		spyOn(payment_mockService, 'setPaymentType').and.returnValue(
			of(paymentMockValues.eorTypeList).pipe(delay(1)),
		);
		comp.paymentType({});
		tick(15000);
		discardPeriodicTasks();
		expect(comp.paymentReceptionTypes).toBeDefined();
	}));
	it('Should getPaymentBy Test When Succeffull', fakeAsync(() => {
		spyOn(comp['paymentService'], 'setPaymentBy');
		spyOn(comp['paymentService'], 'hasPaymentByList').and.returnValue(true);
		spyOn(payment_mockService, 'getPaymentBy').and.returnValue(
			of(paymentMockValues.getEorStatusResp).pipe(delay(1)),
		);
		comp.getPaymentBy({});
		tick(15000);
		discardPeriodicTasks();
		expect(comp['paymentService'].setPaymentBy).toHaveBeenCalled();
		expect(comp['paymentService'].hasPaymentByList).toHaveBeenCalled();
		expect(comp.paidbyComingData.length).toBe(0);
	}));
	it('Should getPaymentBy Test When Succeffull And if Status false', fakeAsync(() => {
		spyOn(comp['eorService'], 'setEorStatus');
		spyOn(comp['eorService'], 'hasEORStatusList').and.returnValue(false);
		spyOn(payment_mockService, 'getPaymentBy').and.returnValue(
			of(paymentMockValues.getEorStatusResp).pipe(delay(1)),
		);
		comp.getPaymentBy({});
		tick(15000);
		discardPeriodicTasks();
		expect(comp.paidbyComingData).toBeDefined();
	}));
	it('Should getPaymentBy Test When UnSucceffull', fakeAsync(() => {
		spyOn(comp['toastrService'], 'error');
		spyOn(payment_mockService, 'getPaymentBy').and.returnValue(
			throwError({ message: 'Error Message' }),
		);
		comp.getPaymentBy({});
		tick(15000);
		discardPeriodicTasks();
		expect(comp['toastrService'].error).toHaveBeenCalled();
	}));
	it('Should getPaymentStatus Test When Succeffull', fakeAsync(() => {
		spyOn(comp['paymentService'], 'setPaymentStatus');
		spyOn(comp['paymentService'], 'hasPaymentStatusList').and.returnValue(true);
		spyOn(payment_mockService, 'getPaymentStatus').and.returnValue(
			of(paymentMockValues.getEorStatusResp).pipe(delay(1)),
		);
		comp.getPaymentStatus({});
		tick(15000);
		discardPeriodicTasks();
		expect(comp['paymentService'].setPaymentStatus).toHaveBeenCalled();
		expect(comp['paymentService'].hasPaymentStatusList).toHaveBeenCalled();
		expect(comp.paymentStatusComingData.length).toBe(0);
	}));
	it('Should getPaymentStatus Test When Succeffull And if Status false', fakeAsync(() => {
		spyOn(comp['paymentService'], 'setPaymentStatus');
		spyOn(comp['paymentService'], 'hasPaymentStatusList').and.returnValue(false);
		spyOn(payment_mockService, 'getPaymentStatus').and.returnValue(
			of(paymentMockValues.getEorStatusResp).pipe(delay(1)),
		);
		comp.getPaymentStatus({});
		tick(15000);
		discardPeriodicTasks();
		expect(comp.paymentStatusComingData).toBeDefined();
	}));
	it('Should getPaymentStatus Test When UnSucceffull', fakeAsync(() => {
		spyOn(comp['toastrService'], 'error');
		spyOn(payment_mockService, 'getPaymentStatus').and.returnValue(
			throwError({ message: 'Error Message' }),
		);
		comp.getPaymentStatus({});
		tick(15000);
		discardPeriodicTasks();
		expect(comp['toastrService'].error).toHaveBeenCalled();
	}));
	it('Should addBillPaymentFP function will be Test With fileToUpload True and Request Serivce send successfull responce', fakeAsync(() => {
		comp.addPayment = comp.initializeSearchForm();
		let file: any = {
			type: 'application/pdf',
		};
		comp.fileToUpload = file;
		spyOn(comp, 'addBillPaymentApiHit');
		spyOn(requestService, 'sendRequest').and.returnValue(
			of(paymentMockValues.addBillPaymentFP_Resp).pipe(delay(1)),
		);
		comp.addBillPaymentFP({ media_id: null });
		tick(15000);
		discardPeriodicTasks();
		expect(comp.addBillPaymentApiHit).toHaveBeenCalled();
	}));
	it('Should addBillPaymentFP function will be Test When Request Reponce with Error.', fakeAsync(() => {
		comp.addPayment = comp.initializeSearchForm();
		let file: any = {
			type: 'application/pdf',
		};
		comp.fileToUpload = file;
		spyOn(requestService, 'sendRequest').and.returnValue(throwError('Error'));
		comp.addBillPaymentFP({ media_id: null });
		tick(15000);
		discardPeriodicTasks();
		expect(comp.btnDisable).toBe(false);
	}));
	it('Should addBillPaymentFP function will be Test With fileToUpload false.', fakeAsync(() => {
		comp.addPayment = comp.initializeSearchForm();
		spyOn(comp, 'addBillPaymentApiHit');
		spyOn(requestService, 'sendRequest').and.returnValue(
			of(paymentMockValues.addBillPaymentFP_Resp).pipe(delay(1)),
		);

		comp.addBillPaymentFP({ file_name: null });
		tick(15000);
		discardPeriodicTasks();
		expect(comp.addBillPaymentApiHit).toHaveBeenCalled();
	}));
	it('Should editBillPaymentFP function will be Test With fileToUpload True and Request Serivce send successfull responce', fakeAsync(() => {
		comp.addPayment = comp.initializeSearchForm();
		let file: any = {
			type: 'application/pdf',
		};
		comp.fileToUpload = file;
		spyOn(comp, 'editBillPaymentApiHit');
		spyOn(requestService, 'sendRequest').and.returnValue(
			of(paymentMockValues.addBillPaymentFP_Resp).pipe(delay(1)),
		);
		comp.editBillPaymentFP({ media_id: null });
		tick(15000);
		discardPeriodicTasks();
		expect(comp.editBillPaymentApiHit).toHaveBeenCalled();
	}));
	it('Should editBillPaymentFP function will be Test When Request Reponce with Error.', fakeAsync(() => {
		comp.addPayment = comp.initializeSearchForm();
		let file: any = {
			type: 'application/pdf',
		};
		comp.fileToUpload = file;
		spyOn(requestService, 'sendRequest').and.returnValue(throwError('Error'));
		let result = comp.editBillPaymentFP({ media_id: null });
		tick(15000);
		discardPeriodicTasks();
		expect(result).toBeUndefined();
	}));
	it('Should editBillPaymentFP function will be Test With fileToUpload false.', fakeAsync(() => {
		comp.addPayment = comp.initializeSearchForm();
		spyOn(comp, 'editBillPaymentApiHit');
		spyOn(requestService, 'sendRequest').and.returnValue(
			of(paymentMockValues.addBillPaymentFP_Resp).pipe(delay(1)),
		);

		comp.editBillPaymentFP({ file_name: null });
		tick(15000);
		discardPeriodicTasks();
		expect(comp.editBillPaymentApiHit).toHaveBeenCalled();
	}));
	it('Should addBillPaymentApiHit function will be Test When Request Service Successfull responce.', fakeAsync(() => {
		comp.addPayment = comp.initializeSearchForm();
		spyOn(comp, 'formCleanAfterupdateAndSavePayment');
		spyOn(comp, 'onItemDeSelectAllReception');
		spyOn(requestService, 'sendRequest').and.returnValue(
			of({ status: 200, message: 'Message Successfull' }).pipe(delay(1)),
		);
		comp.addBillPaymentApiHit({ file_name: null });
		tick(15000);
		discardPeriodicTasks();
		expect(comp.formCleanAfterupdateAndSavePayment).toHaveBeenCalled();
		expect(comp.onItemDeSelectAllReception).toHaveBeenCalled();
		expect(comp.actionTypeDisabled).toBe(false);
	}));
	it('Should addBillPaymentApiHit function will be Test When Request Service Successfull responce But Status not 200 OR False.', fakeAsync(() => {
		comp.addPayment = comp.initializeSearchForm();
		spyOn(requestService, 'sendRequest').and.returnValue(
			of({ message: 'Message Successfull' }).pipe(delay(1)),
		);
		comp.addBillPaymentApiHit({ file_name: null });
		tick(15000);
		discardPeriodicTasks();
		expect(comp.actionTypeDisabled).toBe(false);
		expect(comp.btnDisable).toBe(false);
	}));
	it('Should addBillPaymentApiHit function will be Test When Request Service UnSuccessfull responce and send error.', fakeAsync(() => {
		comp.addPayment = comp.initializeSearchForm();
		spyOn(requestService, 'sendRequest').and.returnValue(throwError({ error: 'Message' }));
		spyOn(comp['toastrService'], 'error');
		comp.addBillPaymentApiHit({ file_name: null });
		tick(15000);
		discardPeriodicTasks();
		expect(comp.actionTypeDisabled).toBe(false);
		expect(comp.btnDisable).toBe(false);
		expect(comp['toastrService'].error).toHaveBeenCalled();
	}));
	it('Should editBillPaymentApiHit function will be Test When Request Service Successfull responce.', fakeAsync(() => {
		comp.addPayment = comp.initializeSearchForm();
		spyOn(comp, 'formCleanAfterupdateAndSavePayment');
		spyOn(comp, 'onItemDeSelectAllReception');
		spyOn(comp['paymentService'], 'pushPaymentEditPopup');
		spyOn(requestService, 'sendRequest').and.returnValue(
			of({ status: 200, message: 'Message Successfull' }).pipe(delay(1)),
		);
		comp.editBillPaymentApiHit({ file_name: null });
		tick(15000);
		discardPeriodicTasks();
		expect(comp['paymentService'].pushPaymentEditPopup).toHaveBeenCalled();
		expect(comp.formCleanAfterupdateAndSavePayment).toHaveBeenCalled();
		expect(comp.onItemDeSelectAllReception).toHaveBeenCalled();
		expect(comp.actionTypeDisabled).toBe(false);
	}));
	it('Should editBillPaymentApiHit function will be Test When Request Service Successfull responce But Status not 200 OR False.', fakeAsync(() => {
		comp.addPayment = comp.initializeSearchForm();
		spyOn(requestService, 'sendRequest').and.returnValue(
			of({ message: 'Message Successfull' }).pipe(delay(1)),
		);
		comp.editBillPaymentApiHit({ file_name: null });
		tick(15000);
		discardPeriodicTasks();
		expect(comp.actionTypeDisabled).toBe(false);
		expect(comp.btnDisable).toBe(false);
	}));
	it('Should editBillPaymentApiHit function will be Test When Request Service UnSuccessfull responce and send error.', fakeAsync(() => {
		comp.addPayment = comp.initializeSearchForm();
		spyOn(requestService, 'sendRequest').and.returnValue(throwError({ error: 'Message' }));
		spyOn(comp['toastrService'], 'error');
		comp.editBillPaymentApiHit({ file_name: null });
		tick(15000);
		discardPeriodicTasks();
		expect(comp.actionTypeDisabled).toBe(false);
		expect(comp.btnDisable).toBe(false);
		expect(comp['toastrService'].error).toHaveBeenCalled();
	}));
	it('Should getSignalPaymentId Function Test If Request Service Responce successfull then some function and addpayment form value will be checked that are matched with expectation.', fakeAsync(() => {
		comp.addPayment = comp.initializeSearchForm();
		spyOn(comp, 'ngSelectionClick');
		spyOn(comp, 'fileNameSetOnEdit');
		spyOn(comp, 'onItemDeSelectAllReception');
		spyOn(requestService, 'sendRequest').and.returnValue(
			of(paymentMockValues.getSignalPaymentIdResp).pipe(delay(1)),
		);
		comp.getSignalPaymentId(20);
		tick(15000);
		discardPeriodicTasks();
		expect(comp.ngSelectionClick).toHaveBeenCalled();
		expect(comp.fileNameSetOnEdit).toHaveBeenCalled();
		expect(comp.onItemDeSelectAllReception).toHaveBeenCalled();
		expect(comp.actionTypeDisabled).toBe(false);
		expect(comp.addPayment.value.action_type_id).toBe(null);
		expect(comp.addPayment.value.bill_amount).toBe(null);
		expect(comp.addPayment.value.by_id).toBe(null);
		expect(comp.addPayment.value.check_amount).toBe(null);
		expect(comp.addPayment.value.id).toBe(null);
		expect(comp.addPayment.value.interest_amount).toBe(null);
		expect(comp.addPayment.value.over_amount).toBe(null);
		expect(comp.addPayment.value.status_id).toBe(null);
		expect(comp.addPayment.value.types[0]).toBe(undefined);
		expect(comp.addPayment.value.check_date).toBe('');
		expect(comp.addPayment.value.check_no).toBe('');
		expect(comp.addPayment.value.comments).toBe('');
		expect(comp.addPayment.value.description).toBe('');
		expect(comp.addPayment.value.file_name).toBe('');
		expect(comp.paymentEditModel.action_type_id).toBe(null);
		expect(comp.paymentEditModel.by_id).toBe(null);
		expect(comp.paymentEditModel.file_name).toBe('');
		expect(comp.paymentEditModel.status_id).toBe(null);
		expect(comp.paymentEditModel.types[0]).toBe(undefined);
	}));
	it('Should editFormInitialize Function Test If Eor Service Responce successfull then getSignalPaymentId function must be called.', fakeAsync(() => {
		spyOn(comp, 'getSignalPaymentId');
		spyOn(eor_mockService, 'pullPaymentId').and.returnValue(of(true).pipe(delay(1)));
		comp.editFormInitialize();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.getSignalPaymentId).toHaveBeenCalled();
	}));
	it('Should ngSelectionClick Test', () => {
		spyOn(comp.paymentTypeRef.nativeElement, 'click');
		spyOn(comp.paymentByRef.nativeElement, 'click');
		spyOn(comp.paymentStatusRef.nativeElement, 'click');
		spyOn(comp.actionTypeRef.nativeElement, 'click');
		comp.ngSelectionClick();
		expect(comp.paymentTypeRef.nativeElement.click).toHaveBeenCalled();
		expect(comp.paymentByRef.nativeElement.click).toHaveBeenCalled();
		expect(comp.paymentStatusRef.nativeElement.click).toHaveBeenCalled();
		expect(comp.actionTypeRef.nativeElement.click).toHaveBeenCalled();
	});
	it('Should resetPayment Test', () => {
		comp.addPayment = comp.initializeSearchForm();
		spyOn(comp, 'makeFileName');
		spyOn(comp, 'setFileName');
		comp.resetPayment();
		expect(comp.payment_TypeClick).toBe(false);
		expect(comp.payment_ByClick).toBe(false);
		expect(comp.payment_statusClick).toBe(false);
		expect(comp.payment_actionClick).toBe(false);
		expect(comp.fileToUpload).toBe(null);
		expect(comp.btnDisable).toBe(false);
		expect(comp.makeFileName).toHaveBeenCalled();
		expect(comp.setFileName).toHaveBeenCalled();
	});
	it('Should viewDocFile Test', () => {
		spyOn(comp['paymentService'], 'viewDocFile');
		comp.viewDocFile([]);
		expect(comp['paymentService'].viewDocFile).toHaveBeenCalled();
	});
	it('Should paymentFormValidation Test If case paymentType Then verify payment_TypeClick should be true', () => {
		comp.paymentFormValidation('paymentType');
		expect(comp.payment_TypeClick).toBe(true);
	});
	it('Should paymentFormValidation Test If case paymentBy Then verify payment_ByClick should be true', () => {
		comp.paymentFormValidation('paymentBy');
		expect(comp.payment_ByClick).toBe(true);
	});
	it('Should paymentFormValidation Test If case paymentStatus Then verify payment_statusClick should be true', () => {
		comp.paymentFormValidation('paymentStatus');
		expect(comp.payment_statusClick).toBe(true);
	});
	it('Should paymentFormValidation Test If case actionType Then verify payment_actionClick should be true', () => {
		comp.paymentFormValidation('actionType');
		expect(comp.payment_actionClick).toBe(true);
	});
	it('Should checkInputs function Test should return true', () => {
		comp.addPayment = comp.initializeSearchForm();
		let Result = comp.checkInputs();
		expect(Result).toBe(true);
	});
	it('Should checkInputs function Test When addPayment have values and should return false', () => {
		comp.addPayment = comp.initializeSearchForm();
		comp.addPayment.controls.id.setValue([10]);
		let Result = comp.checkInputs();
		expect(Result).toBe(false);
	});
	it('Should formCleanAfterupdateAndSavePayment test', () => {
		comp.addPayment = comp.initializeSearchForm();
		spyOn(comp['billListingRefresh'], 'next');
		spyOn(comp['paymentService'], 'reloadPaymentAfterAdd');
		comp.formCleanAfterupdateAndSavePayment();
		expect(comp.billListingRefresh.next).toHaveBeenCalled();
		expect(comp.payment_TypeClick).toBe(false);
		expect(comp.payment_ByClick).toBe(false);
		expect(comp.payment_statusClick).toBe(false);
		expect(comp.payment_actionClick).toBe(false);
		expect(comp.billAmountShow).toBe(false);
		expect(comp.interestAmountShow).toBe(false);
		expect(comp.btnDisable).toBe(false);
		expect(comp.fileToUpload).toBe(null);
		expect(comp['paymentService'].reloadPaymentAfterAdd).toHaveBeenCalled();
		expect(comp.paymentReceptionTypes.length).toBe(0);
		expect(comp.paidbyComingData.length).toBe(0);
		expect(comp.paymentStatusComingData.length).toBe(0);
		expect(comp.actionTypeData.length).toBe(0);
	});
	it('Should showFieldAction Test', () => {
		comp.addPayment = comp.initializeSearchForm();
		spyOn(comp['selectPaymentTypeAction'], 'setActiveFieldBylistOfTypeAndAction');
		comp.addPayment.controls.types.setValue(['insurance']);
		comp.showFieldAction(true);
		expect(comp['selectPaymentTypeAction'].setActiveFieldBylistOfTypeAndAction).toHaveBeenCalled();
	});
	it('Should implementValidationOfAmount Test', () => {
		comp.addPayment = comp.initializeSearchForm();
		comp.implementValidationOfAmount({ name: PaymentBillUrlsEnum.INTEREST });
		expect(comp.addPayment.controls.interest_amount.value).toBe(null);
	});
	it('Should makeFileNameInEdit Test', () => {
		let result = comp.makeFileNameInEdit({ label_id: 10 }, { last_name: 'patient' });
		expect(result).toMatch('10_denial_patient_NaN.pdf');
	});
	it('Should makeFileNameInEdit Test', () => {
		let result = comp.makeFileNameInEdit({ label_id: 10 }, { last_name: 'patient' });
		expect(result).toMatch('10_denial_patient_NaN.pdf');
	});
	it('Should changeTheFileNameThroughEdit Test', () => {
		spyOn(comp, 'makeFileNameInEdit');
		spyOn(comp, 'setFileName');
		comp.changeTheFileNameThroughEdit({}, 'patient');
		expect(comp.makeFileNameInEdit).toHaveBeenCalled();
		expect(comp.setFileName).toHaveBeenCalled();
	});
	it('Should fileNameSetOnEdit Test If eorForm file name not exists.', () => {
		spyOn(comp, 'changeTheFileNameThroughEdit');
		comp.addPayment = comp.initializeSearchForm();
		comp.fileNameSetOnEdit({}, 'patient');
		expect(comp.changeTheFileNameThroughEdit).toHaveBeenCalled();
	});
	it('Should getCurrentBillAmount Test If paid_amount not equal to 0.00', () => {
		comp.currentBill = {
			paid_amount: 20.0,
		};
		let result = comp.getCurrentBillAmount();
		expect(result).toBe(20.0);
	});
	it('Should getCurrentBillAmount Test If paid_amount equal to 0.00', () => {
		comp.currentBill = {
			paid_amount: 0.0,
			bill_amount: 20.2,
		};
		let result = comp.getCurrentBillAmount();
		expect(result).toBe(20.2);
	});
	it('Should getFullyPaidOfBill Test', () => {
		comp.currentBill = {
			paid_amount: 0.0,
			bill_amount: 20.2,
		};
		let result = comp.getFullyPaidOfBill();
		expect(result).toBeFalsy();
	});
	it('Should addOverPayment Test', () => {
		comp.currentBill = {
			paid_amount: 0.0,
			bill_amount: 20.2,
		};
		let result = comp.addOverPayment(10);
		expect(result).toBeTruthy();
	});
	it('Should getPaymentByInfo Function Test If paymentService Responce successfull then getRecipatentName function must be called.', fakeAsync(() => {
		comp.currentBill = {
			case_id: 45,
		};
		spyOn(comp, 'getRecipatentName');
		spyOn(payment_mockService, 'getPaymentByInfo').and.returnValue(
			of(paymentMockValues.getEorStatusResp).pipe(delay(1)),
		);
		comp.getPaymentByInfo({ id: 10 });
		tick(15000);
		discardPeriodicTasks();
		expect(comp.getRecipatentName).toHaveBeenCalled();
	}));
	afterAll(() => {
		TestBed.resetTestingModule();
	});
});
