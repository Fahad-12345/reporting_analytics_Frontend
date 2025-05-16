import { VerificationService } from './../../../verification.service';
import { VerificationMockService } from '@appDir/shared/mock-services/VerificationMockService.service';
import { VerificationFormSplitComponent } from './verification-form-split.component';
import { CustomDiallogMockService } from '@appDir/shared/mock-services/CustomDialog.service';
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
import { EorMockService } from '@appDir/shared/mock-services/EorMockService.service';
import { VerificationMockValues } from './verification-form-split-mock-values/verification-form-split.mock.values';
import { EORService } from '@appDir/eor/shared/eor.service';
describe('VerificationFormSplitComponent', () => {
	let comp: VerificationFormSplitComponent;
	let fixture: ComponentFixture<VerificationFormSplitComponent>;
	let requestMockService = new RequestMockService();
	let eorMockService = new EorMockService();
	let eorSplitFormGetMockValue = new VerificationMockValues();
	let custom_MockSerice = new CustomDiallogMockService();
	let verification_mockSerivce = new VerificationMockService();
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [VerificationFormSplitComponent],
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
				{ provide: CustomDiallogService, useValue: custom_MockSerice },
				{ provide: VerificationService, useValue: verification_mockSerivce }
			],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(VerificationFormSplitComponent);
		comp = fixture.componentInstance;
	});
	afterEach(() => {
		TestBed.resetTestingModule();
	});
	it('should be created', () => {
		expect(comp).toBeTruthy();
	});
	it('Should ngOnInit Test', () => {
		comp.currentBill = {id:10};
		spyOn(comp, 'editVerificationDetail');
		spyOn(comp, 'resetDenialForm');
		spyOn(comp, 'makeFileName');
		spyOn(comp, 'setFileName');
		spyOn(comp, 'getVerificationTypeList');
		spyOn(comp, 'changeTheFileName');
		spyOn(comp, 'getVerificationStatus');
		comp.ngOnInit();
		expect(comp.editVerificationDetail).toHaveBeenCalled();
		expect(comp.resetDenialForm).toHaveBeenCalled();
		expect(comp.makeFileName).toHaveBeenCalled();
		expect(comp.setFileName).toHaveBeenCalled();
		expect(comp.getVerificationTypeList).toHaveBeenCalled();
		expect(comp.getVerificationStatus).toHaveBeenCalled();
		expect(comp.changeTheFileName).toHaveBeenCalled();
		expect(comp.verificationForm).toBeDefined();
	});
	it('Should initializeSearchForm Test', () => {
		let form = comp.initializeSearchForm();
		expect(comp.typeClicked).toBe(false);
		expect(comp.verificationStatusCheck).toBe(false);
		expect(form.value).toEqual(eorSplitFormGetMockValue.initializeSearchFromValues);
	});
	it('Should getVerificationTypeList Test When status true', fakeAsync(() => {
		spyOn(comp['verificationService'], 'hasVerificationTypeList').and.returnValue(true);
		spyOn(comp['verificationService'], 'setVerificationType');
		spyOn(verification_mockSerivce, 'verificationTypeList').and.returnValue(
			of(eorSplitFormGetMockValue.eorTypeList).pipe(delay(1)),
		);
		comp.getVerificationTypeList();
		tick(15000);
		discardPeriodicTasks();
		expect(comp['verificationService'].setVerificationType).toHaveBeenCalled();
		expect(comp.verificationTypeData.length).toBe(eorSplitFormGetMockValue.eorTypeList.result.data.length);
	}));
	it('Should getVerificationTypeList Test When status false', fakeAsync(() => {
		spyOn(comp['verificationService'], 'hasVerificationTypeList').and.returnValue(false);
		spyOn(verification_mockSerivce, 'verificationTypeList').and.returnValue(
			of(eorSplitFormGetMockValue.eorTypeList).pipe(delay(1)),
		);
		comp.getVerificationTypeList();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.verificationTypeData).toBeDefined();
	}));
	const getFileList = (ext) => {
		const blob = new Blob([''], { type: `application/${ext}` });
		blob['lastModifiedDate'] = '';
		// blob['name'] = `28-5-2021_Staging_Release Notes.${ext}`;
		const file = <File>blob;
		const fileList: FileList = {
			0: file,
			1: file,
			length: 2,
			item: (index: number) => file,
		};
		return fileList;
	};
	it('Should handleFileInput Test', () => {
		comp.handleFileInput(getFileList('pdf'));
		expect(comp.fileToUpload).toBeDefined();
	});
	it('Should handleFileInput Test If not pdf', () => {
		spyOn(comp['toastrService'],'error');
		comp.handleFileInput(getFileList('txt'));
		expect(comp['toastrService'].error).toHaveBeenCalled();
	});
	it('Should postVerification Test', () => {
		comp.currentBill = {
			id: 232,
		};
		spyOn(comp, 'editFormVerification');
		comp.verificationForm = comp.initializeSearchForm();
		comp.verificationForm.controls.id.setValue('45');
		comp.verificationForm.controls.date.setValue('2021-04-05');
		comp.verificationForm.controls.verification_type_ids.setValue([{ id: 100 }]);
		comp.verificationForm.controls.verification_status_id.setValue([{ id: 100 }]);
		comp.postVerification();
		expect(comp.editFormVerification).toHaveBeenCalled();
	});
	it('Should postVerification Test If verificationForm Id not exists', () => {
		comp.currentBill = {
			id: 232,
		};
		spyOn(comp, 'newDataAddofVerification');
		comp.verificationForm = comp.initializeSearchForm();
		comp.verificationForm.controls.verification_type_ids.setValue([{ id: 100 }]);
		comp.verificationForm.controls.verification_status_id.setValue([{ id: 100 }]);
		comp.postVerification();
		expect(comp.newDataAddofVerification).toHaveBeenCalled();
	});
	it('Should editFormVerification Test When Request Service Succesffully', fakeAsync(() => {
		comp.verificationForm = comp.initializeSearchForm();
		comp.verificationForm.controls.file_name.setValue('dummy.pdf');
		comp.fileToUpload = new File([], 'dummy.pdf', { type: 'application/pdf' });
		spyOn(comp, 'editVerification');
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			of({ status: true, data: { id: 10 } }).pipe(delay(1)),
		);
		comp.editFormVerification({});
		tick(15000);
		discardPeriodicTasks();
		expect(comp.typeClicked).toBe(false);
		expect(comp.verificationStatusCheck).toBe(false);
		expect(comp.editVerification).toHaveBeenCalled();
	}));
	it('Should editFormVerification Test When Unsuccessfull', fakeAsync(() => {
		comp.verificationForm = comp.initializeSearchForm();
		comp.verificationForm.controls.file_name.setValue('dummy.pdf');
		comp.fileToUpload = new File([], 'dummy.pdf', { type: 'application/pdf' });
		spyOn(requestMockService, 'sendRequest').and.returnValue(throwError('Error'));
		comp.editFormVerification({});
		tick(15000);
		discardPeriodicTasks();
		expect(comp).toBeTruthy();
		expect(comp.disabledFormBtn).toBe(false);
	}));
	it('Should editFormVerification Test If FileUpload not exists', fakeAsync(() => {
		spyOn(comp, 'editVerification');
		comp.editFormVerification({});
		expect(comp.editVerification).toHaveBeenCalled();
	}));
	it('Should editVerification Test When Succeffull', fakeAsync(() => {
		comp.verificationForm = comp.initializeSearchForm();
		spyOn(comp, 'changeTheFileName');
		spyOn(comp['toastrService'], 'success');
		spyOn(comp['verificationService'], 'isBillId').and.returnValue(true);
		spyOn(comp['verificationService'], 'pushclosedVerificationPopup');
		spyOn(comp['verificationService'], 'reloadVerificationAfterAdd');
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			of({ status: true, message: 'Success Message' }).pipe(delay(1)),
		);
		comp.editVerification({});
		tick(15000);
		discardPeriodicTasks();
		expect(comp.changeTheFileName).toHaveBeenCalled();
		expect(comp['toastrService'].success).toHaveBeenCalled();
		expect(comp['verificationService'].isBillId).toHaveBeenCalled();
		expect(comp['verificationService'].pushclosedVerificationPopup).toHaveBeenCalled();
		expect(comp['verificationService'].reloadVerificationAfterAdd).toHaveBeenCalled();
		expect(comp.verificationTypeData.length).toBe(0);
		expect(comp.verificationStatusCommingData.length).toBe(0);
	}));
	it('Should reset Test', () => {
		comp.verificationForm = comp.initializeSearchForm();
		spyOn(comp, 'changeTheFileName');
		comp.reset();
		expect(comp.typeClicked).toBe(false);
		expect(comp.verificationStatusCheck).toBe(false);
		expect(comp.fileToUpload).toBeNull();
		expect(comp.changeTheFileName).toHaveBeenCalled();
	});
	it('Should changeTheFileName Test', () => {
		comp.currentBill = { id: 200 };
		spyOn(comp, 'makeFileName');
		spyOn(comp, 'setFileName');
		comp.changeTheFileName();
		expect(comp.makeFileName).toHaveBeenCalled();
		expect(comp.setFileName).toHaveBeenCalled();
	});
	it('Should checkInputs function Test should return true', () => {
		comp.verificationForm = comp.initializeSearchForm();
		let Result = comp.checkInputs();
		expect(Result).toBe(true);
	});
	it('Should checkInputs function Test When SearchForm have values and should return false', () => {
		comp.verificationForm = comp.initializeSearchForm();
		comp.verificationForm.controls.verification_type_ids.setValue([10]);
		let Result = comp.checkInputs();
		expect(Result).toBe(false);
	});
	it('Should setFileNameField Test', () => {
		spyOn(comp, 'makeFileName');
		spyOn(comp, 'setFileName');
		comp.currentBill = {
			patient_last_name: 'mock_patient_last_name',
		};
		comp.setFileNameField();
		expect(comp.makeFileName).toHaveBeenCalled();
		expect(comp.setFileName).toHaveBeenCalled();
	});
	it('Should setFileName Test', () => {
		let mockName = 'Mock_File_Name';
		comp.verificationForm = comp.initializeSearchForm();
		comp.setFileName(mockName, comp.verificationForm, 'file_name');
		expect(comp.verificationForm.controls.file_name.value).toMatch(mockName);
	});
	it('Should makeFileName Test', () => {
		let result = comp.makeFileName({
			patient_last_name: 'patient_last_name',
			label_id: 23,
			amount: 54.653,
		});
		expect(result).toMatch('23_verification_patient_last_name_NaN.pdf');
	});
	it('Should getVerificationStatus Test When Succeffull', fakeAsync(() => {
		spyOn(comp['verificationService'], 'setVerificationStatus');
		spyOn(comp['verificationService'], 'hasVerificationStatusList').and.returnValue(true);
		spyOn(verification_mockSerivce, 'getVerificationStatus').and.returnValue(
			of(eorSplitFormGetMockValue.getEorStatusResp).pipe(delay(1)),
		);
		comp.getVerificationStatus({});
		tick(15000);
		discardPeriodicTasks();
		expect(comp['verificationService'].setVerificationStatus).toHaveBeenCalled();
		expect(comp['verificationService'].hasVerificationStatusList).toHaveBeenCalled();
		expect(comp.verificationStatusCommingData.length).toBe(0);
	}));
	it('Should getVerificationStatus Test When Succeffull And if Status false', fakeAsync(() => {
		spyOn(comp['verificationService'], 'setVerificationStatus');
		spyOn(comp['verificationService'], 'hasVerificationStatusList').and.returnValue(true);
		spyOn(verification_mockSerivce, 'getVerificationStatus').and.returnValue(
			of(eorSplitFormGetMockValue.getEorStatusResp).pipe(delay(1)),
		);
		comp.getVerificationStatus({});
		tick(15000);
		discardPeriodicTasks();
		expect(comp.verificationStatusCommingData).toBeDefined();
	}));
	it('Should getVerificationStatus Test When UnSucceffull And if Status false', fakeAsync(() => {
		spyOn(comp['toastrService'], 'error');
		spyOn(verification_mockSerivce, 'getVerificationStatus').and.returnValue(throwError({ message: 'Error Message' }));
		comp.getVerificationStatus({});
		tick(15000);
		discardPeriodicTasks();
		expect(comp['toastrService'].error).toHaveBeenCalled();
	}));
	it('Should typeClick Test', () => {
		comp.typeClick();
		expect(comp.typeClicked).toBe(true);
	});
	it('Should verificationStatus Test', () => {
		comp.verificationStatus();
		expect(comp.verificationStatusCheck).toBe(true);
	});
	it('Should viewDocFile Test', () => {
		spyOn(comp['verificationService'], 'viewDocFile');
		comp.viewDocFile([]);
		expect(comp['verificationService'].viewDocFile).toHaveBeenCalled();
	});
	it('Should fileNameSetOnEdit Test If verificationForm file name not exists.', () => {
		spyOn(comp, 'changeTheFileNameThroughEdit');
		comp.verificationForm = comp.initializeSearchForm();
		comp.fileNameSetOnEdit({}, 'patient');
		expect(comp.changeTheFileNameThroughEdit).toHaveBeenCalled();
	});
	it('Should changeTheFileNameThroughEdit Test', () => {
		spyOn(comp, 'makeFileNameInEdit');
		spyOn(comp, 'setFileName');
		comp.changeTheFileNameThroughEdit({}, 'patient');
		expect(comp.makeFileNameInEdit).toHaveBeenCalled();
		expect(comp.setFileName).toHaveBeenCalled();
	});
	it('Should makeFileNameInEdit Test', () => {
		let result = comp.makeFileNameInEdit({ label_id: 10 }, { last_name: 'patient' });
		expect(result).toMatch('10_verification_patient_NaN.pdf');
	});
	afterAll(() => {
		TestBed.resetTestingModule();
	});
});
