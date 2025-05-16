import { DenialMockService } from '@appDir/shared/mock-services/DenialMock.service';
import { CustomDiallogMockService } from '@appDir/shared/mock-services/CustomDialog.service';
import { ConfirmationService } from '@jaspero/ng-confirmations';
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
import { DenialFormSplitComponent } from './denial-form-split.component';
import { DenialFormSplitMockValues } from './denial-form-split-mock-values/denial-form-split-mock-values';
import { EORService } from '@appDir/eor/shared/eor.service';
import { DenialService } from '@appDir/denial/denial.service';
describe('DenialFormSplitComponent', () => {
	let comp: DenialFormSplitComponent;
	let fixture: ComponentFixture<DenialFormSplitComponent>;
	let requestMockService = new RequestMockService();
	let eorMockService = new EorMockService();
	let eorSplitFormGetMockValue = new DenialFormSplitMockValues();
	let custom_MockSerice = new CustomDiallogMockService();
	let denial_mockSerivce = new DenialMockService();
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [DenialFormSplitComponent],
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
				{ provide: DenialService, useValue: denial_mockSerivce },
			],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(DenialFormSplitComponent);
		comp = fixture.componentInstance;
	});
	afterEach(() => {
		TestBed.resetTestingModule();
	});
	it('should be created', () => {
		expect(comp).toBeTruthy();
	});
	it('Should editDenialDetail Test', fakeAsync(() => {
		spyOn(comp, 'getDenialById');
		spyOn(denial_mockSerivce, 'pullDenialId').and.returnValue(of(true).pipe(delay(1)));
		comp.editDenialDetail();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.getDenialById).toHaveBeenCalled();
	}));
	it('Should ngOnInit Test', () => {
		comp.currentBill = { id: 10 };
		spyOn(comp, 'editDenialDetail');
		spyOn(comp, 'getDenaialTypeList');
		spyOn(comp, 'resetDenialForm');
		spyOn(comp, 'makeFileName');
		spyOn(comp, 'setFileName');
		spyOn(comp, 'getDenailStatus');
		spyOn(comp, 'changeTheFileName');
		comp.ngOnInit();
		expect(comp.editDenialDetail).toHaveBeenCalled();
		expect(comp.getDenaialTypeList).toHaveBeenCalled();
		expect(comp.resetDenialForm).toHaveBeenCalled();
		expect(comp.setFileName).toHaveBeenCalled();
		expect(comp.makeFileName).toHaveBeenCalled();
		expect(comp.getDenailStatus).toHaveBeenCalled();
		expect(comp.changeTheFileName).toHaveBeenCalled();
		expect(comp.denialForm).toBeDefined();
	});
	it('Should initializeSearchForm Test', () => {
		let form = comp.initializeSearchForm();
		expect(comp.typeClicked).toBe(false);
		expect(comp.denialStatusAction).toBe(false);
		expect(form.value).toEqual(eorSplitFormGetMockValue.initializeSearchFromValues);
	});
	it('Should getDenaialTypeList Test When status true', fakeAsync(() => {
		spyOn(comp['denialService'], 'hasDenialTypeList').and.returnValue(true);
		spyOn(comp['denialService'], 'setDenialType');
		spyOn(denial_mockSerivce, 'denialTypeList').and.returnValue(
			of(eorSplitFormGetMockValue.eorTypeList).pipe(delay(1)),
		);
		comp.getDenaialTypeList();
		tick(15000);
		discardPeriodicTasks();
		expect(comp['denialService'].denialTypeList).toHaveBeenCalled();
		expect(comp.denialTypeData.length).toBe(
			eorSplitFormGetMockValue.eorTypeList.result.data.length,
		);
	}));
	it('Should resetDenialForm Test When status true', fakeAsync(() => {
		comp.denialForm = comp.initializeSearchForm();
		spyOn(comp['denialService'], 'hasDenialTypeList').and.returnValue(true);
		spyOn(comp, 'changeTheFileName');
		spyOn(denial_mockSerivce, 'pullDenialForm').and.returnValue(of(true).pipe(delay(1)));
		comp.resetDenialForm();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.typeClicked).toBe(false);
		expect(comp.denialStatusAction).toBe(false);
		expect(comp.fileToUpload).toBeNull();
		expect(comp.changeTheFileName).toHaveBeenCalled();
		expect(comp.denialTypeData.length).toBe(
			eorSplitFormGetMockValue.eorTypeList.result.data.length,
		);
	}));
	it('Should getDenaialTypeList Test When status false', fakeAsync(() => {
		spyOn(comp['denialService'], 'setDenialType');
		spyOn(denial_mockSerivce, 'denialTypeList').and.returnValue(
			of(eorSplitFormGetMockValue.eorTypeList).pipe(delay(1)),
		);
		comp.getDenaialTypeList();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.denialTypeData).toBeDefined();
		expect(comp['denialService'].setDenialType).toHaveBeenCalled();
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
		spyOn(comp['toastrService'], 'error');
		comp.handleFileInput(getFileList('txt'));
		expect(comp['toastrService'].error).toHaveBeenCalled();
	});
	it('Should postDenial Test', () => {
		comp.currentBill = {
			id: 232,
		};
		spyOn(comp, 'editFormDenial');
		comp.denialForm = comp.initializeSearchForm();
		comp.denialForm.controls.id.setValue('45');
		comp.denialForm.controls.date.setValue('2021-04-05');
		comp.denialForm.controls.denial_type.setValue([{ id: 100 }]);
		comp.denialForm.controls.denial_status_id.setValue([{ id: 100 }]);
		comp.postDenial();
		expect(comp.editFormDenial).toHaveBeenCalled();
	});
	it('Should postDenial Test If eorForm Id not exists', () => {
		comp.currentBill = {
			id: 232,
		};
		spyOn(comp, 'newDataAddofDenial');
		comp.denialForm = comp.initializeSearchForm();
		comp.denialForm.controls.denial_type.setValue([{ id: 100 }]);
		comp.denialForm.controls.denial_status_id.setValue([{ id: 100 }]);
		comp.postDenial();
		expect(comp.newDataAddofDenial).toHaveBeenCalled();
	});
	it('Should addDenial Test When Request Service Succesffully', fakeAsync(() => {
		comp.denialForm = comp.initializeSearchForm();
		spyOn(comp['denialService'], 'reloadDenialAfterAdd');
		spyOn(comp['denialService'], 'pushclosedDenialPopup');
		spyOn(comp, 'changeTheFileName');
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			of({ status: true, data: { id: 10 } }).pipe(delay(1)),
		);
		comp.addDenial({});
		tick(15000);
		discardPeriodicTasks();
		expect(comp.typeClicked).toBe(false);
		expect(comp.denialStatusAction).toBe(false);
		expect(comp.fileToUpload).toBeNull();
		expect(comp.changeTheFileName).toHaveBeenCalled();
		expect(comp['denialService'].reloadDenialAfterAdd).toHaveBeenCalled();
		expect(comp['denialService'].pushclosedDenialPopup).toHaveBeenCalled();
	}));
	it('Should addDenial Test When Unsuccessfull', fakeAsync(() => {
		spyOn(requestMockService, 'sendRequest').and.returnValue(throwError('Error'));
		comp.addDenial({});
		tick(15000);
		discardPeriodicTasks();
		expect(comp.btnDisable).toBe(false);
	}));
	it('Should editFormDenial Test When successfull', fakeAsync(() => {
		comp.denialForm = comp.initializeSearchForm();
		comp.denialForm.controls.file_name.setValue('dummy.pdf');
		comp.fileToUpload = new File([], 'dummy.pdf', { type: 'application/pdf' });
		spyOn(comp, 'editDenial');
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			of({ status: true, data: { id: 10 } }).pipe(delay(1)),
		);
		comp.editFormDenial({});
		tick(15000);
		discardPeriodicTasks();
		expect(comp.editDenial).toHaveBeenCalled();
	}));
	it('Should newDataAddofDenial Test When successfull', fakeAsync(() => {
		comp.denialForm = comp.initializeSearchForm();
		comp.denialForm.controls.file_name.setValue('dummy.pdf');
		comp.fileToUpload = new File([], 'dummy.pdf', { type: 'application/pdf' });
		spyOn(comp, 'addDenial');
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			of({ status: true, data: { id: 10 } }).pipe(delay(1)),
		);
		comp.newDataAddofDenial({});
		tick(15000);
		discardPeriodicTasks();
		expect(comp.addDenial).toHaveBeenCalled();
	}));
	it('Should editFormDenial Test When Unsuccessfull', fakeAsync(() => {
		comp.denialForm = comp.initializeSearchForm();
		comp.denialForm.controls.file_name.setValue('dummy.pdf');
		comp.fileToUpload = new File([], 'dummy.pdf', { type: 'application/pdf' });
		spyOn(requestMockService, 'sendRequest').and.returnValue(throwError('Error'));
		comp.editFormDenial({});
		tick(15000);
		discardPeriodicTasks();
		expect(comp.btnDisable).toBe(false);
	}));
	it('Should editFormDenial Test If FileUpload not exists', fakeAsync(() => {
		spyOn(comp, 'editDenial');
		comp.editFormDenial({});
		expect(comp.editDenial).toHaveBeenCalled();
	}));
	it('Should editDenial Test When Succeffull', fakeAsync(() => {
		comp.denialForm = comp.initializeSearchForm();
		spyOn(comp, 'changeTheFileName');
		spyOn(comp['toastrService'], 'success');
		spyOn(comp['denialService'], 'isBillId').and.returnValue(true);
		spyOn(comp['denialService'], 'pushclosedDenialPopup');
		spyOn(comp['denialService'], 'reloadDenialAfterAdd');
		spyOn(requestMockService, 'sendRequest').and.returnValue(
			of({ status: true, message: 'Success Message' }).pipe(delay(1)),
		);
		comp.editDenial({});
		tick(15000);
		discardPeriodicTasks();
		expect(comp.changeTheFileName).toHaveBeenCalled();
		expect(comp['toastrService'].success).toHaveBeenCalled();
		expect(comp['denialService'].isBillId).toHaveBeenCalled();
		expect(comp['denialService'].pushclosedDenialPopup).toHaveBeenCalled();
		expect(comp.denialTypeData.length).toBe(0);
		expect(comp.denialStatusCommingData.length).toBe(0);
	}));
	it('Should resetDenial Test', () => {
		comp.denialForm = comp.initializeSearchForm();
		spyOn(comp, 'changeTheFileName');
		comp.resetDenial();
		expect(comp.typeClicked).toBe(false);
		expect(comp.denialStatusAction).toBe(false);
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
		comp.denialForm = comp.initializeSearchForm();
		let Result = comp.checkInputs();
		expect(Result).toBe(true);
	});
	it('Should checkInputs function Test When SearchForm have values and should return false', () => {
		comp.denialForm = comp.initializeSearchForm();
		comp.denialForm.controls.denial_status_id.setValue([10]);
		let Result = comp.checkInputs();
		expect(Result).toBe(false);
	});
	it('Should getDenialById Test', fakeAsync(() => {
		comp.denialForm = comp.initializeSearchForm();
		spyOn(denial_mockSerivce, 'getDenialById').and.returnValue(of(eorSplitFormGetMockValue.eorTypeList).pipe(delay(1)));
		spyOn(comp, 'fileNameSetOnEdit');
		spyOn(comp['denialTypeSelection']['nativeElement'], 'click');
		comp.getDenialById();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.typeClicked).toBe(false);
		expect(comp.denialStatusAction).toBe(false);
		expect(comp.fileToUpload).toBeNull();

		expect(comp.fileNameSetOnEdit).toHaveBeenCalled();
		expect(comp['denialTypeSelection']['nativeElement'].click).toHaveBeenCalled();
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
		comp.denialForm = comp.initializeSearchForm();
		comp.setFileName(mockName, comp.denialForm, 'file_name');
		expect(comp.denialForm.controls.file_name.value).toMatch(mockName);
	});
	it('Should makeFileName Test', () => {
		let result = comp.makeFileName({
			patient_last_name: 'patient_last_name',
			label_id: 23,
			amount: 54.653,
		});
		expect(result).toMatch('23_denial_patient_last_name_NaN.pdf');
	});
	it('Should getDenailStatus Test When Succeffull', fakeAsync(() => {
		spyOn(comp['denialService'], 'setDenialStatus');
		spyOn(comp['denialService'], 'hasDenialStatusList').and.returnValue(true);
		spyOn(denial_mockSerivce, 'getDenialStatus').and.returnValue(
			of(eorSplitFormGetMockValue.getEorStatusResp).pipe(delay(1)),
		);
		comp.getDenailStatus({});
		tick(15000);
		discardPeriodicTasks();
		expect(comp['denialService'].setDenialStatus).toHaveBeenCalled();
		expect(comp.denialStatusCommingData.length).toBe(0);
	}));
	it('Should getDenailStatus Test When Succeffull And if Status false', fakeAsync(() => {
		spyOn(comp['denialService'], 'setDenialStatus');
		spyOn(comp['denialService'], 'hasDenialStatusList').and.returnValue(false);
		spyOn(denial_mockSerivce, 'getDenialStatus').and.returnValue(
			of(eorSplitFormGetMockValue.getEorStatusResp).pipe(delay(1)),
		);
		comp.getDenailStatus({});
		tick(15000);
		discardPeriodicTasks();
		expect(comp.denialStatusCommingData).toBeDefined();
	}));
	it('Should getDenailStatus Test When UnSucceffull And if Status false', fakeAsync(() => {
		spyOn(comp['toastrService'], 'error');
		spyOn(denial_mockSerivce, 'getDenialStatus').and.returnValue(
			throwError({ message: 'Error Message' }),
		);
		comp.getDenailStatus({});
		tick(15000);
		discardPeriodicTasks();
		expect(comp['toastrService'].error).toHaveBeenCalled();
	}));
	it('Should typeClick Test', () => {
		comp.typeClick();
		expect(comp.typeClicked).toBe(true);
	});
	it('Should denialStatusClick Test', () => {
		comp.denialStatusClick();
		expect(comp.denialStatusAction).toBe(true);
	});
	it('Should viewDocFile Test', () => {
		spyOn(comp['denialService'], 'viewDocFile');
		comp.viewDocFile([]);
		expect(comp['denialService'].viewDocFile).toHaveBeenCalled();
	});
	it('Should fileNameSetOnEdit Test If eorForm file name not exists.', () => {
		spyOn(comp, 'changeTheFileNameThroughEdit');
		comp.denialForm = comp.initializeSearchForm();
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
		expect(result).toMatch('10_denial_patient_NaN.pdf');
	});
	afterAll(() => {
		TestBed.resetTestingModule();
	});
});
