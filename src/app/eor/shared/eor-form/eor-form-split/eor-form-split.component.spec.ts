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
import { delay } from 'rxjs';
import { of, throwError } from 'rxjs';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { EorFormSplitComponent } from './eor-form-split.component';
import { EorFormSplitMockValues } from './eor-form-split-mock-values/eor-form-split-mock-values';
import { EorMockService } from '@appDir/shared/mock-services/EorMockService.service';
import { EORService } from '../../eor.service';
describe('EorFormSplitComponent', () => {
	let comp: EorFormSplitComponent;
	let fixture: ComponentFixture<EorFormSplitComponent>;
	let requestMockService = new RequestMockService();
	let eorMockService = new EorMockService();
	let eorSplitFormGetMockValue = new EorFormSplitMockValues();
	let custom_MockSerice = new CustomDiallogMockService();
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [EorFormSplitComponent],
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
		fixture = TestBed.createComponent(EorFormSplitComponent);
		comp = fixture.componentInstance;
	});
	afterEach(() => {
		TestBed.resetTestingModule();
	});
	it('should be created', () => {
		expect(comp).toBeTruthy();
	});
	it('Should ngOnInit Test', () => {
		spyOn(comp, 'eorIdThroughSubject');
		spyOn(comp, 'resetTheEorFormAfterDeleteAction');
		spyOn(comp, 'eorAmountSubscription');
		spyOn(comp, 'changeFileName');
		spyOn(comp, 'eorTypeList');
		spyOn(comp, 'getEorStatus');
		comp.ngOnInit();
		expect(comp.eorIdThroughSubject).toHaveBeenCalled();
		expect(comp.resetTheEorFormAfterDeleteAction).toHaveBeenCalled();
		expect(comp.eorAmountSubscription).toHaveBeenCalled();
		expect(comp.changeFileName).toHaveBeenCalled();
		expect(comp.eorTypeList).toHaveBeenCalled();
		expect(comp.getEorStatus).toHaveBeenCalled();
		expect(comp.eorForm).toBeDefined();
	});
	it('Should initializeSearchForm Test', () => {
		let form = comp.initializeSearchForm();
		expect(comp.typeClicked).toBe(false);
		expect(comp.eorStatusAction).toBe(false);
		expect(form.value).toEqual(eorSplitFormGetMockValue.initializeSearchFromValues);
	});
	it('Should max Test', () => {
		let result = comp.max(999999.99);
		expect(result).toBeDefined();
	});
	it('Should eorTypeList Test When status true', fakeAsync(() => {
		spyOn(comp['eorService'], 'hasEorTypeList').and.returnValue(true);
		spyOn(comp['eorService'], 'setEorType');
		spyOn(eorMockService, 'eorTypeList').and.returnValue(
			of(eorSplitFormGetMockValue.eorTypeList).pipe(delay(1)),
		);
		comp.eorTypeList({});
		tick(15000);
		discardPeriodicTasks();
		expect(comp['eorService'].setEorType).toHaveBeenCalled();
		expect(comp.eorTypeData.length).toBe(eorSplitFormGetMockValue.eorTypeList.result.data.length);
	}));
	it('Should eorTypeList Test When status false', fakeAsync(() => {
		spyOn(comp['eorService'], 'hasEorTypeList').and.returnValue(false);
		spyOn(eorMockService, 'eorTypeList').and.returnValue(
			of(eorSplitFormGetMockValue.eorTypeList).pipe(delay(1)),
		);
		comp.eorTypeList({});
		tick(15000);
		discardPeriodicTasks();
		expect(comp.eorTypeData).toBeDefined();
	}));
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
	it('Should handleFileInput Test', () => {
		comp.handleFileInput(getFileList('pdf'));
		expect(comp.fileToUpload).toBeDefined();
	});
	it('Should handleFileInput Test If not pdf', () => {
		spyOn(comp['toastrService'],'error');
		comp.handleFileInput(getFileList('txt'));
		expect(comp['toastrService'].error).toHaveBeenCalled();
	});
	it('Should postEor Test', () => {
		comp.currentBill = {
			id: 232,
		};
		spyOn(comp, 'editFormEor');
		comp.eorForm = comp.initializeSearchForm();
		comp.eorForm.controls.id.setValue('45');
		comp.eorForm.controls.date.setValue('2021-04-05');
		comp.eorForm.controls.eor_type_id.setValue([{ id: 100 }]);
		comp.eorForm.controls.eor_status_id.setValue([{ id: 100 }]);
		comp.postEor();
		expect(comp.editFormEor).toHaveBeenCalled();
	});
	it('Should postEor Test If eorForm Id not exists', () => {
		comp.currentBill = {
			id: 232,
		};
		spyOn(comp, 'addFormEor');
		comp.eorForm = comp.initializeSearchForm();
		comp.eorForm.controls.eor_type_id.setValue([{ id: 100 }]);
		comp.eorForm.controls.eor_status_id.setValue([{ id: 100 }]);
		comp.postEor();
		expect(comp.addFormEor).toHaveBeenCalled();
	});
	it('Should addFormEor Test When Request Service Succesffully', fakeAsync(() => {
		comp.eorForm = comp.initializeSearchForm();
		comp.eorForm.controls.file_name.setValue('dummy.pdf');
		comp.fileToUpload = new File([], 'dummy.pdf', { type: 'application/pdf' });
		spyOn(comp['formSubmited'], 'emit');
		spyOn(comp, 'addEor');
		spyOn(comp['eorTypeSelection']['nativeElement'], 'click');
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			of({ status: true, data: { id: 10 } }).pipe(delay(1)),
		);
		comp.addFormEor({});
		tick(15000);
		discardPeriodicTasks();
		expect(comp.typeClicked).toBe(false);
		expect(comp.eorStatusAction).toBe(false);
		expect(comp.fileToUpload).toBeNull();
		expect(comp.addEor).toHaveBeenCalled();
		expect(comp['formSubmited'].emit).toHaveBeenCalled();
		expect(comp['eorTypeSelection']['nativeElement'].click).toHaveBeenCalled();
	}));
	it('Should addFormEor Test When Unsuccessfull', fakeAsync(() => {
		comp.eorForm = comp.initializeSearchForm();
		comp.eorForm.controls.file_name.setValue('dummy.pdf');
		comp.fileToUpload = new File([], 'dummy.pdf', { type: 'application/pdf' });
		spyOn(requestMockService, 'sendRequest').and.returnValue(throwError('Error'));
		comp.addFormEor({});
		tick(15000);
		discardPeriodicTasks();
		expect(comp).toBeTruthy();
	}));
	it('Should addFormEor Test When Unsuccessfull', fakeAsync(() => {
		spyOn(comp, 'addEor');
		comp.addFormEor({});
		expect(comp.addEor).toHaveBeenCalled();
	}));
	it('Should editFormEor Test When Request Service Succesffully', fakeAsync(() => {
		comp.eorForm = comp.initializeSearchForm();
		comp.eorForm.controls.file_name.setValue('dummy.pdf');
		comp.fileToUpload = new File([], 'dummy.pdf', { type: 'application/pdf' });
		spyOn(comp['formSubmited'], 'emit');
		spyOn(comp, 'editEor');
		spyOn(comp['eorTypeSelection']['nativeElement'], 'click');
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			of({ status: true, data: { id: 10 } }).pipe(delay(1)),
		);
		comp.editFormEor({});
		tick(15000);
		discardPeriodicTasks();
		expect(comp.typeClicked).toBe(false);
		expect(comp.eorStatusAction).toBe(false);
		expect(comp.editEor).toHaveBeenCalled();
		expect(comp['formSubmited'].emit).toHaveBeenCalled();
		expect(comp['eorTypeSelection']['nativeElement'].click).toHaveBeenCalled();
	}));
	it('Should editFormEor Test When Unsuccessfull', fakeAsync(() => {
		comp.eorForm = comp.initializeSearchForm();
		comp.eorForm.controls.file_name.setValue('dummy.pdf');
		comp.fileToUpload = new File([], 'dummy.pdf', { type: 'application/pdf' });
		spyOn(requestMockService, 'sendRequest').and.returnValue(throwError('Error'));
		comp.editFormEor({});
		tick(15000);
		discardPeriodicTasks();
		expect(comp).toBeTruthy();
	}));
	it('Should editFormEor Test If FileUpload not exists', fakeAsync(() => {
		spyOn(comp, 'editEor');
		comp.editFormEor({});
		expect(comp.editEor).toHaveBeenCalled();
	}));
	it('Should editEor Test When Succeffull', fakeAsync(() => {
		spyOn(comp, 'resetEor');
		spyOn(comp, 'changeFileName');
		spyOn(comp['toastrService'], 'success');
		spyOn(comp['eorService'], 'isBillId').and.returnValue(true);
		spyOn(comp['eorService'], 'pushEorPopupModelClose');
		spyOn(comp['eorService'], 'reloadEorAfterAdd');
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			of({ status: true, message: 'Success Message' }).pipe(delay(1)),
		);
		comp.editEor({});
		tick(15000);
		discardPeriodicTasks();
		expect(comp.resetEor).toHaveBeenCalled();
		expect(comp.changeFileName).toHaveBeenCalled();
		expect(comp['toastrService'].success).toHaveBeenCalled();
		expect(comp['eorService'].isBillId).toHaveBeenCalled();
		expect(comp['eorService'].pushEorPopupModelClose).toHaveBeenCalled();
		expect(comp.eorTypeData.length).toBe(0);
		expect(comp.eorStatusCommingData.length).toBe(0);
	}));
	it('Should addEor Test When Succeffull', fakeAsync(() => {
		spyOn(comp, 'resetEor');
		spyOn(comp, 'changeFileName');
		spyOn(comp['toastrService'], 'success');
		spyOn(comp['eorService'], 'reloadEorAfterAdd');
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			of({ status: true, message: 'Success Message' }).pipe(delay(1)),
		);
		comp.addEor({});
		tick(15000);
		discardPeriodicTasks();
		expect(comp.resetEor).toHaveBeenCalled();
		expect(comp.changeFileName).toHaveBeenCalled();
		expect(comp['toastrService'].success).toHaveBeenCalled();
		expect(comp.eorTypeData.length).toBe(0);
		expect(comp.eorStatusCommingData.length).toBe(0);
	}));
	it('Should resetEor Test', () => {
		comp.eorForm = comp.initializeSearchForm();
		spyOn(comp, 'resetEor');
		spyOn(comp, 'changeFileName');
		comp.resetEor();
		expect(comp.typeClicked).toBe(false);
		expect(comp.eorStatusAction).toBe(false);
		expect(comp.fileToUpload).toBeNull();
	});
	it('Should changeFileName Test', () => {
		comp.currentBill = { id: 200 };
		spyOn(comp, 'makeFileName');
		spyOn(comp, 'setFileName');
		comp.changeFileName();
		expect(comp.makeFileName).toHaveBeenCalled();
		expect(comp.setFileName).toHaveBeenCalled();
	});
	it('Should checkInputs function Test should return true', () => {
		comp.eorForm = comp.initializeSearchForm();
		let Result = comp.checkInputs();
		expect(Result).toBe(true);
	});
	it('Should checkInputs function Test When SearchForm have values and should return false', () => {
		comp.eorForm = comp.initializeSearchForm();
		comp.eorForm.controls.eor_type_id.setValue([10]);
		let Result = comp.checkInputs();
		expect(Result).toBe(false);
	});
	it('Should eorIdThroughSubject Test', fakeAsync(() => {
		comp.eorForm = comp.initializeSearchForm();
		spyOn(eorMockService, 'eorPullId').and.returnValue(of(28).pipe(delay(1)));
		spyOn(eorMockService, 'getEorById').and.returnValue(
			of(eorSplitFormGetMockValue.eorIdThroughSubjectResp).pipe(delay(1)),
		);
		spyOn(comp, 'fileNameSetOnEdit');
		spyOn(comp['eorTypeSelection']['nativeElement'], 'click');
		comp.eorIdThroughSubject();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.fileNameSetOnEdit).toHaveBeenCalled();
		expect(comp['eorTypeSelection']['nativeElement'].click).toHaveBeenCalled();
	}));
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
		comp.eorForm = comp.initializeSearchForm();
		comp.setFileName(mockName, comp.eorForm, 'file_name');
		expect(comp.eorForm.controls.file_name.value).toMatch(mockName);
	});
	it('Should makeFileName Test', () => {
		let result = comp.makeFileName({
			patient_last_name: 'patient_last_name',
			label_id: 23,
			amount: 54.653,
		});
		expect(result).toMatch('23_eor_patient_last_name_54.65.pdf');
	});
	it('Should getEorStatus Test When Succeffull', fakeAsync(() => {
		spyOn(comp['eorService'], 'setEorStatus');
		spyOn(comp['eorService'], 'hasEORStatusList').and.returnValue(true);
		spyOn(eorMockService, 'getEorStatus').and.returnValue(
			of(eorSplitFormGetMockValue.getEorStatusResp).pipe(delay(1)),
		);
		comp.getEorStatus({});
		tick(15000);
		discardPeriodicTasks();
		expect(comp['eorService'].setEorStatus).toHaveBeenCalled();
		expect(comp['eorService'].hasEORStatusList).toHaveBeenCalled();
		expect(comp.eorStatusCommingData.length).toBe(0);
	}));
	it('Should getEorStatus Test When Succeffull And if Status false', fakeAsync(() => {
		spyOn(comp['eorService'], 'setEorStatus');
		spyOn(comp['eorService'], 'hasEORStatusList').and.returnValue(false);
		spyOn(eorMockService, 'getEorStatus').and.returnValue(
			of(eorSplitFormGetMockValue.getEorStatusResp).pipe(delay(1)),
		);
		comp.getEorStatus({});
		tick(15000);
		discardPeriodicTasks();
		expect(comp.eorStatusCommingData).toBeDefined();
	}));
	it('Should getEorStatus Test When UnSucceffull And if Status false', fakeAsync(() => {
		spyOn(comp['toastrService'], 'error');
		spyOn(eorMockService, 'getEorStatus').and.returnValue(throwError({ message: 'Error Message' }));
		comp.getEorStatus({});
		tick(15000);
		discardPeriodicTasks();
		expect(comp['toastrService'].error).toHaveBeenCalled();
	}));
	it('Should typeClick Test', () => {
		comp.typeClick();
		expect(comp.typeClicked).toBe(true);
	});
	it('Should eorStatusClick Test', () => {
		comp.eorStatusClick();
		expect(comp.eorStatusAction).toBe(true);
	});
	it('Should viewDocFile Test', () => {
		spyOn(comp['eorService'], 'viewDocFile');
		comp.viewDocFile([]);
		expect(comp['eorService'].viewDocFile).toHaveBeenCalled();
	});
	it('Should resetTheEorFormAfterDeleteAction Test', fakeAsync(() => {
		spyOn(comp, 'changeFileName');
		comp.eorForm = comp.initializeSearchForm();
		spyOn(eorMockService, 'pullResetForm').and.returnValue(of(true).pipe(delay(1)));
		comp.resetTheEorFormAfterDeleteAction();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.fileToUpload).toBeNull();
		expect(comp.changeFileName).toHaveBeenCalled();
		expect(comp.eorStatusCommingData.length).toBe(0);
		expect(comp.eorTypeData.length).toBe(0);
	}));
	it('Should fileNameSetOnEdit Test If eorForm file name not exists.', () => {
		spyOn(comp, 'changeTheFileNameThroughEdit');
		comp.eorForm = comp.initializeSearchForm();
		comp.fileNameSetOnEdit({}, 'patient', 2049);
		expect(comp.changeTheFileNameThroughEdit).toHaveBeenCalled();
	});
	it('Should fileNameSetOnEdit Test If eorForm file name exists.', () => {
		comp.eorForm = comp.initializeSearchForm();
		comp.eorForm.controls.file_name.setValue('FileName');
		comp.fileNameSetOnEdit({}, 'patient', 2049);
		expect(comp.fileNameSaveForEdit).toMatch(comp.eorForm.controls.file_name.value);
	});
	it('Should changeTheFileNameThroughEdit Test', () => {
		spyOn(comp, 'makeFileNameInEdit');
		spyOn(comp, 'setFileName');
		comp.changeTheFileNameThroughEdit({}, 'patient', 2049);
		expect(comp.makeFileNameInEdit).toHaveBeenCalled();
		expect(comp.setFileName).toHaveBeenCalled();
	});
	it('Should makeFileNameInEdit Test', () => {
		let result = comp.makeFileNameInEdit({ label_id: 10 }, { last_name: 'patient' }, 2049);
		expect(result).toMatch('10_eor_patient_2049.pdf');
	});
	afterAll(() => {
		TestBed.resetTestingModule();
	});
});
