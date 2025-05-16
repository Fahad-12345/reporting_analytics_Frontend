import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
	TestBed,
	async,
	ComponentFixture,
	fakeAsync,
	tick,
	discardPeriodicTasks
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Config } from '@appDir/config/config';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { SharedModule } from '@appDir/shared/shared.module';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { MainService } from '@appDir/shared/services/main-service';
import { DynamicFormModule } from '@appDir/shared/dynamic-form/dynamic-form.module';
import { CaseInfoEditComponent } from './case-info-edit.component';
import { CaseFlowMockService } from '@appDir/shared/mock-services/CaseFlowMockService.service';
import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
describe('CaseInfoEditComponent', () => {
	let comp: CaseInfoEditComponent;
	let fixture: ComponentFixture<CaseInfoEditComponent>;
	let caseFlow_MockService = new CaseFlowMockService();
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [CaseInfoEditComponent],
			imports: [
				DynamicFormModule,
				SharedModule,
				RouterTestingModule,
				ToastrModule.forRoot(),
				BrowserAnimationsModule,
				HttpClientTestingModule
			],
			schemas: [NO_ERRORS_SCHEMA],
			providers: [
				Config,
				LocalStorage,
				ToastrService,
				MainService,
				{ provide: CaseFlowServiceService, useValue: caseFlow_MockService },
				{
					provide: ActivatedRoute,
					useValue: {
						snapshot: {
							pathFromRoot: [{ params: { caseId: 123 } }],
						}
					},
				},
			],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(CaseInfoEditComponent);
		comp = fixture.componentInstance;
	});
	afterEach(() => {
		TestBed.resetTestingModule();
	});
	it('should be created', () => {
		expect(comp).toBeTruthy();
	});
	it('Should ngOnInit Test',fakeAsync(()=>{
		let ResponseData = {
			result:{
				data:[]
			}
		}
		let ResponseDataGetNF2Info = {
			result:{
				data:{
					id:123
				}
			}
		}
		spyOn(caseFlow_MockService, 'getCase').and.returnValue(of(ResponseData).pipe(delay(1))); 
		spyOn(caseFlow_MockService, 'getNF2Info').and.returnValue(of(ResponseDataGetNF2Info).pipe(delay(1))); 
		spyOn(caseFlow_MockService, 'setNf2Status').and.returnValue(of(ResponseDataGetNF2Info).pipe(delay(1))); 
		comp.ngOnInit();
		tick(15000);
		discardPeriodicTasks();
		expect(caseFlow_MockService.getCase).toHaveBeenCalled();
		expect(caseFlow_MockService.getNF2Info).toHaveBeenCalled();
		expect(caseFlow_MockService.setNf2Status).toHaveBeenCalled();
	}));
	it('Should ngOnInit Test If nf2_Info.id not exists',fakeAsync(()=>{
		let ResponseData = {
			result:{
				data:[]
			}
		}
		let ResponseDataGetNF2Info = {
			result:{
				data:{
					id:null
				}
			}
		}
		spyOn(caseFlow_MockService, 'getCase').and.returnValue(of(ResponseData).pipe(delay(1))); 
		spyOn(caseFlow_MockService, 'setNf2Status').and.returnValue(of(ResponseData).pipe(delay(1)));  
		spyOn(caseFlow_MockService, 'getNF2Info').and.returnValue(of(ResponseDataGetNF2Info).pipe(delay(1)));  
		comp.ngOnInit();
		tick(15000);
		discardPeriodicTasks();
		expect(caseFlow_MockService.getCase).toHaveBeenCalled();
		expect(caseFlow_MockService.getNF2Info).toHaveBeenCalled();
		expect(caseFlow_MockService.setNf2Status).toHaveBeenCalled();
	}));
	it('Should onSubmit Test If Successfull',fakeAsync(()=>{
		comp.caseId = 10;
		spyOn(caseFlow_MockService, 'getCase').and.returnValue(of(true).pipe(delay(1))); 
		spyOn(caseFlow_MockService, 'updateCase').and.returnValue(of(true).pipe(delay(1)));  
		spyOn(caseFlow_MockService, 'goToNextStep').and.returnValue(of(true).pipe(delay(1)));  
		comp.onSubmit({});
		discardPeriodicTasks();
		tick(15000);
		expect(caseFlow_MockService.getCase).toHaveBeenCalled();
		expect(caseFlow_MockService.updateCase).toHaveBeenCalled();
		expect(caseFlow_MockService.goToNextStep).toHaveBeenCalled();
	}));
	it('Should onSubmit Test If UnSuccessfull',fakeAsync(()=>{
		comp.caseId = 10;
		spyOn(caseFlow_MockService, 'updateCase').and.returnValue(of(true).pipe(delay(1))); 
		spyOn(caseFlow_MockService, 'getCase').and.returnValue(throwError({error:{message:'Error Message'}})); 
		comp.onSubmit({});
		expect(comp.disableBtn).toBe(true);
		expect(comp.loadSpin).toBe(true);
		discardPeriodicTasks();
		tick(15000);
		expect(caseFlow_MockService.updateCase).toHaveBeenCalled();
		expect(comp.disableBtn).toBe(false);
		expect(comp.loadSpin).toBe(false);
	}));
	afterAll(() => {
		TestBed.resetTestingModule();
	});
});
