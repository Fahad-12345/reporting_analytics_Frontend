import { RequestMockService } from './../../../shared/mock-services/RequestMock.service';
import { MainService } from '@appDir/shared/services/main-service';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { Config } from '@appDir/config/config';
import { ToastrModule } from 'ngx-toastr';
import { SharedModule } from '@appDir/shared/shared.module';
import {
	TestBed,
	async,
	ComponentFixture,
	inject,
	fakeAsync,
	tick,
	discardPeriodicTasks,
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PatientSummaryComponent } from './patient-summary.component';
import { Observable, of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CaseFlowMockService } from '@appDir/shared/mock-services/CaseFlowMockService.service';
import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';
import { delay } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { FDMockService } from '@appDir/shared/mock-services/FDMockService.service';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { Validators } from '@angular/forms';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { patientSummaryMockData } from './patient-summary-mock-values';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('PatientSummaryComponent', () => {
	let comp: PatientSummaryComponent;
	let fixture: ComponentFixture<PatientSummaryComponent>;
	let mock_CaseFlowService = new CaseFlowMockService();
	let mock_FDService = new FDMockService();
	let request_MockService = new RequestMockService();
	let patientSummaryMockValues = new patientSummaryMockData();
	let patient_mockData = patientSummaryMockValues.patientData;
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [PatientSummaryComponent],
			imports: [ToastrModule.forRoot(), SharedModule, RouterTestingModule, NoopAnimationsModule,HttpClientTestingModule ],
			providers: [
				LocalStorage,
				Config,
				MainService,
				{ provide: CaseFlowServiceService, useValue: mock_CaseFlowService },
				{ provide: FDServices, useValue: mock_FDService },
				{ provide: RequestService, useValue: request_MockService },
			],
		}).compileComponents();
	}));

	beforeEach(() => {
		let Given_Responce = patientSummaryMockValues.getCaseResponce;
		spyOn(mock_CaseFlowService, 'getCase').and.returnValue(of(Given_Responce).pipe(delay(1)));
		fixture = TestBed.createComponent(PatientSummaryComponent);
		comp = fixture.componentInstance;
	});
	afterEach(() => {
		TestBed.resetTestingModule();
	});
	it('Should Create', () => {
		expect(comp).toBeTruthy();
	});
	it('Should ngOnInit Test', () => {
		spyOn(comp['mainService'], 'setLeftPanel');
		spyOn(comp, 'setTitle');
		comp.ngOnInit();
		expect(comp['mainService'].setLeftPanel).toHaveBeenCalled();
		expect(comp.setTitle).toHaveBeenCalled();
	});
	it('Should call getCase function for getting case information and if null this.caseId reurn nothing', () => {
		const spy_getCase = spyOn(comp, 'getCase').and.returnValue(null);
		comp.caseId = 'null';
		comp.getCase();
		expect(spy_getCase).toHaveBeenCalled();
	});
	it('Should call getCase function for getting case information and if this.caseId exists return ', fakeAsync(() => {
		spyOn(comp, 'getCase').and.returnValue(of(patient_mockData));
		comp.caseId = 1226;
		comp.getCase();
		expect(comp.getCase).toHaveBeenCalled();
	}));
	function Mock_PatientInformation() {
		comp.patient = {
			id: 774,
			key: null,
			first_name: 'Trewrwer',
			middle_name: null,
			last_name: 'Werner we',
			dob: '05-04-2021',
			gender: 'male',
			age: 1,
			ssn: null,
			cell_phone: '3242342344',
			home_phone: null,
			work_phone: null,
			height_ft: null,
			height_in: null,
			weight_lbs: null,
			weight_kg: null,
			meritial_status: null,
			profile_avatar: null,
			need_translator: 0,
			language: null,
			is_pregnant: null,
			is_law_enforcement_agent: null,
			status: 'open',
			notes: null,
			user_id: null,
			by_health_app: 0,
			created_by: null,
			updated_by: null,
			created_at: '2021-05-05T15:41:50.000Z',
			updated_at: '2021-05-05T15:41:50.000Z',
			deleted_at: null,
			patient_cases_count: 1,
		};
	}
	function Mock_AttorneyInformation() {
		comp.attorney = {
			case_attorney: null,
		};
	}
	function Mock_Insurance() {
		comp.primaryInsurance = {
			insurance: null,
		};
	}
	function Mock_Employeer() {
		comp.employer = {
			employer: patient_mockData.employer,
		};
	}
	it('Should Personal information same on dom', () => {
		Mock_PatientInformation();
		expect(comp.patient).toEqual(patient_mockData.patient);
	});
	it('should display original first name', () => {
		Mock_PatientInformation();
		expect(comp.patient.first_name).toBe(patient_mockData.patient.first_name);
	});
	it('Should Attorney Information same on dom', () => {
		Mock_AttorneyInformation();
		expect(comp.attorney.case_attorney).toBe(patient_mockData.case_attorney);
	});
	it('Should Primary Insurance same on dom as got', () => {
		Mock_Insurance();
		expect(comp.primaryInsurance.insurance).toBe(patient_mockData.insurance);
	});
	it('Should Employer Information same on dom as got', () => {
		Mock_Employeer();
		expect(comp.employer.employer).toBe(patient_mockData.employer);
	});
	it('Should getCase Test If caseId null', () => {
		comp.caseId = 'null';
		let Result = comp.getCase();
		expect(Result).toBeUndefined();
	});
	it('Should getPrimaryInsurance Test', () => {
		let insurances = [
			{
				type: 'Primary',
			},
		];
		comp.getPrimaryInsurance(insurances);
		expect(comp.primaryInsurance).toEqual({ type: 'Primary' });
	});
	it('Should assignValues Test If Case type WC', () => {
		spyOn(comp, 'getPrimaryInsurance');
		spyOn(comp, 'getEmployer');
		fixture.detectChanges();
		patientSummaryMockValues.setCaseValues.caseType = {
			type:'WC'
		}
		comp.case = patientSummaryMockValues.setCaseValues;
		comp.assignValues();
		expect(comp.primaryTitle).toMatch('Worker Compensation Information');
	});
	it('Should assignValues Test If Case type No Fault', () => {
		debugger;
		spyOn(comp, 'getPrimaryInsurance');
		spyOn(comp, 'getEmployer');
		fixture.detectChanges();
		patientSummaryMockValues.setCaseValues.caseType = {
			type:'No Fault'
		}
		comp.case = patientSummaryMockValues.setCaseValues;
		comp.assignValues();
		expect(comp.primaryTitle).toMatch('No Fault Information');
	});
	it('Should assignValues Test If Case type  No Fault && No WC', () => {
		debugger;
		spyOn(comp, 'getPrimaryInsurance');
		spyOn(comp, 'getEmployer');
		fixture.detectChanges();
		patientSummaryMockValues.setCaseValues.caseType = {
			type:'default'
		}
		comp.case = patientSummaryMockValues.setCaseValues;
		comp.assignValues();
		expect(comp.primaryTitle).toMatch('Primary Insurance Information');
	});
	it('Should getReferring Test', () => {
		let referring = [
			{
				type: 'Primary',
			},
		];
		comp.getReferring(referring);
		expect(comp.referring).toEqual({ type: 'Primary' });
	});
	it('Should getEmployer Test', () => {
		let employers = [
			{
				employerCaseType: 'Primary',
			},
		];
		comp.getEmployer(employers);
		expect(comp.employer).toEqual({ employerCaseType: 'Primary' });
	});
	it('Should goTo Test', () => {
		let parent: any = {
			parent: 20
		};
		comp['route'] = parent;
		spyOn(comp['router'], 'navigate');
		comp.goTo('');
		expect(comp['router'].navigate).toHaveBeenCalled();
	});
	it('Should goToOuterRoutes Test', () => {
		let parent: any = {
			parent: {
				parent: {
					parent: 20,
				},
			},
		};
		comp['route'] = parent;
		spyOn(comp['router'], 'navigate');
		comp.goToOuterRoutes('');
		expect(comp['router'].navigate).toHaveBeenCalled();
	});
	it('Should goBack Test', () => {
		let parent: any = {
			parent: {
				parent: {
					parent: 20,
				},
			},
		};
		comp['route'] = parent;
		spyOn(comp['router'], 'navigate');
		comp.goBack();
		expect(comp['router'].navigate).toHaveBeenCalled();
	});
	it('Should exportToExcel Test', () => {
		comp.patient = 'path';
		spyOn(mock_FDService, 'exportExcelUrl').and.returnValue(true);
		spyOn(window, 'open');
		comp.exportToExcel();
		expect(mock_FDService.exportExcelUrl).toHaveBeenCalled();
	});
	it('should exportToPDF Test When requestService Subscribe successfull ', fakeAsync(() => {
		spyOn(window, 'open');
		spyOn(comp['config'], 'getConfig');
		spyOn(request_MockService, 'sendRequest').and.returnValue(
			of({ result: { data: { id: true } } }).pipe(delay(1)),
		);
		comp.exportToPDF();
		tick(15000);
		discardPeriodicTasks();
		expect(comp['config'].getConfig).toHaveBeenCalled();
		expect(window.open).toHaveBeenCalled();
		expect(comp.loadSpin).toBe(false);
	}));
	it('should exportToPDF Test When requestService Subscribe successfull Fail', fakeAsync(() => {
		spyOn(request_MockService, 'sendRequest').and.returnValue(
			throwError(patientSummaryMockValues.setError_ErrorMessage),
		);
		comp.exportToPDF();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.loadSpin).toBe(false);
	}));
	it('Should openModal Test', () => {
		spyOn(comp['modalService'], 'open');
		comp.openModal('content');
		expect(comp['modalService'].open).toHaveBeenCalled();
	});
	it('should onSubmitEmailForm Test When Subscribe successfull ', fakeAsync(() => {
		comp.caseId = 10;
		let getPatientSummaryPDFData = {
			statusCode: 200,
			data: { pdf: [{ id: 10 }] },
		};
		comp['emailForm'] = comp['fb'].group({
			fileIds: '',
			to: ['', [Validators.required, Validators.email]],
			message: '',
		});
		comp.emailForm.controls.fileIds.setValue('fields');
		comp.emailForm.controls.to.setValue('admin@ovada.com');
		comp.emailForm.controls.message.setValue('message');
		let ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc',
		};
		comp.modalRef = comp['modalService'].open('content', ngbModalOptions);
		spyOn(mock_FDService, 'getPatientSummaryPDF').and.returnValue(
			of(getPatientSummaryPDFData).pipe(delay(1)),
		);
		spyOn(mock_FDService, 'emailDocument').and.returnValue(of({ status: true }).pipe(delay(1)));
		comp.onSubmitEmailForm({
			to: 'admin@ovada.com',
			message: 'message',
		});
		tick(15000);
		discardPeriodicTasks();
		expect(comp.disableBtn).toBe(false);
		comp.modalRef.close();
	}));
	it('should onSubmitEmailForm Test When Subscribe successfull But emailDocument Unsuccessfull', fakeAsync(() => {
		comp.caseId = 10;
		let getPatientSummaryPDFData = {
			statusCode: 200,
			data: { pdf: [{ id: 10 }] },
		};
		comp['emailForm'] = comp['fb'].group({
			fileIds: '',
			to: ['', [Validators.required, Validators.email]],
			message: '',
		});
		comp.emailForm.controls.fileIds.setValue('fields');
		comp.emailForm.controls.to.setValue('admin@ovada.com');
		comp.emailForm.controls.message.setValue('message');
		let ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc',
		};
		comp.modalRef = comp['modalService'].open('content', ngbModalOptions);
		spyOn(mock_FDService, 'getPatientSummaryPDF').and.returnValue(
			of(getPatientSummaryPDFData).pipe(delay(1)),
		);
		spyOn(mock_FDService, 'emailDocument').and.returnValue(
			throwError(patientSummaryMockValues.setError_ErrorMessage),
		);
		comp.onSubmitEmailForm({
			to: 'admin@ovada.com',
			message: 'message',
		});
		tick(15000);
		discardPeriodicTasks();
		expect(comp.disableBtn).toBe(false);
		comp.modalRef.close();
	}));
	it('should onSubmitEmailForm Test When Subscribe Unsuccessfull', fakeAsync(() => {
		comp['emailForm'] = comp['fb'].group({
			fileIds: '',
			to: ['', [Validators.required, Validators.email]],
			message: '',
		});
		comp.emailForm.controls.fileIds.setValue('fields');
		comp.emailForm.controls.to.setValue('admin@ovada.com');
		comp.emailForm.controls.message.setValue('message');
		spyOn(mock_FDService, 'getPatientSummaryPDF').and.returnValue(
			throwError({
				message: 'error',
			}),
		);
		comp.onSubmitEmailForm({
			to: 'admin@ovada.com',
			message: 'message',
		});
		tick(15000);
		discardPeriodicTasks();
		expect(comp.disableBtn).toBe(false);
	}));
	it('should onSubmitEmailForm Test emailForm invalid', () => {
		spyOn(comp['fd_services'], 'touchAllFields');
		comp['emailForm'] = comp['fb'].group({
			fileIds: '',
			to: ['', [Validators.required, Validators.email]],
			message: '',
		});
		comp.onSubmitEmailForm({
			to: 'admin@ovada.com',
			message: 'message',
		});
		expect(comp['fd_services'].touchAllFields).toHaveBeenCalled();
	});
	it('should onSubmitFaxForm Test When Subscribe successfull ', fakeAsync(() => {
		comp.caseId = 10;
		let getPatientSummaryPDFData = {
			statusCode: 200,
			data: { pdf: [{ id: 10 }] },
		};
		comp['faxForm'] = comp['fb'].group({
			fileIds: '',
			to: ['', [Validators.required]],
			message: '',
		});
		comp.faxForm.controls.fileIds.setValue('fields');
		comp.faxForm.controls.to.setValue('admin@ovada.com');
		comp.faxForm.controls.message.setValue('message');
		let ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc',
		};
		comp.modalRef = comp['modalService'].open('content', ngbModalOptions);
		spyOn(mock_FDService, 'getPatientSummaryPDF').and.returnValue(
			of(getPatientSummaryPDFData).pipe(delay(1)),
		);
		comp.onSubmitFaxForm({
			to: 'admin@ovada.com',
			message: 'message',
		});
		tick(15000);
		discardPeriodicTasks();
		expect(comp.disableBtnFax).toBe(true);
		comp.modalRef.close();
	}));
	it('should onSubmitFaxForm Test When Subscribe Unsuccessfull', fakeAsync(() => {
		comp['faxForm'] = comp['fb'].group({
			fileIds: '',
			to: ['', [Validators.required, Validators.email]],
			message: '',
		});
		comp.faxForm.controls.fileIds.setValue('fields');
		comp.faxForm.controls.to.setValue('admin@ovada.com');
		comp.faxForm.controls.message.setValue('message');
		spyOn(mock_FDService, 'getPatientSummaryPDF').and.returnValue(
			throwError({
				message: 'error',
			}),
		);
		comp.onSubmitFaxForm({
			to: 'admin@ovada.com',
			message: 'message',
		});
		tick(15000);
		discardPeriodicTasks();
		expect(comp.disableBtnFax).toBe(false);
	}));
	it('should onSubmitFaxForm Test faxForm invalid', () => {
		spyOn(comp['fd_services'], 'touchAllFields');
		comp['faxForm'] = comp['fb'].group({
			fileIds: '',
			to: ['', [Validators.required, Validators.email]],
			message: '',
		});
		comp.onSubmitFaxForm({
			to: 'admin@ovada.com',
			message: 'message',
		});
		expect(comp['fd_services'].touchAllFields).toHaveBeenCalled();
	});
	afterAll(() => {
		TestBed.resetTestingModule();
	});
});
