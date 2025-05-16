import { RequestMockService } from '@appDir/shared/mock-services/RequestMock.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
	TestBed,
	async,
	ComponentFixture,
	tick,
	discardPeriodicTasks,
	fakeAsync,
	flush,
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Config } from '@appDir/config/config';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { SignatureMockService } from '@appDir/shared/mock-services/SignatureMock.service';
import { SharedModule } from '@appDir/shared/shared.module';
import { SignatureServiceService } from '@appDir/shared/signature/services/signature-service.service';
import { ToastrModule } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { CanDeactiveMockService } from '@appDir/shared/mock-services/CanDeactiveModalMock.service';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { TemplateListingComponent } from './template-listing.component';
import { RequestService } from '@appDir/shared/services/request.service';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { TemplateFormComponent } from '../template-form/template-form.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('TemplateListingComponent', () => {
	let comp: TemplateListingComponent;
	let fixture: ComponentFixture<TemplateListingComponent>;
	let signatureMockService = new SignatureMockService();
	let request_MockService = new RequestMockService();
	let canDeactiveModel_MockService = new CanDeactiveMockService();
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [TemplateListingComponent, TemplateFormComponent],
			schemas: [NO_ERRORS_SCHEMA],
			imports: [SharedModule, ToastrModule.forRoot(), RouterTestingModule,HttpClientTestingModule],
			providers: [
				Config,
				LocalStorage,
				{ provide: SignatureServiceService, useValue: signatureMockService },
				{ provide: RequestService, useValue: request_MockService },
				{ provide: CanDeactivateModelComponentService, useValue: canDeactiveModel_MockService },
			],
		})
			.overrideModule(BrowserDynamicTestingModule, {
				set: {
					entryComponents: [TemplateFormComponent],
				},
			})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(TemplateListingComponent);
		comp = fixture.componentInstance;
	});
	afterEach(() => {
		TestBed.resetTestingModule();
	});
	it('should Create', () => {
		expect(comp).toBeTruthy();
	});
	it('Should ngOnInit Test', () => {
		comp.fieldFilterForm = comp['fb'].group({
			title: '',
			description: '',
		});
		spyOn(comp, 'setPage');
		comp.ngOnInit();
		expect(comp.fieldFilterForm.value).toEqual({ title: '', description: '' });
		expect(comp.setPage).toHaveBeenCalled();
	});
	it('Should addField Test', () => {
		spyOn(comp['modalService'], 'open');
		comp.addField();
		expect(comp['modalService'].open).toHaveBeenCalled();
	});
	it('Should setPage Test', () => {
		comp.fieldFilterForm = comp['fb'].group({
			title: '',
			description: '',
		});
		spyOn(comp, 'addUrlQueryParams');
		spyOn(comp, 'getFields');
		comp.setPage({ offset: 0 });
		expect(comp.addUrlQueryParams).toHaveBeenCalled();
		expect(comp.getFields).toHaveBeenCalled();
	});
	it('Should pageLimit Test', () => {
		spyOn(comp, 'setPage');
		comp.pageLimit(10);
		expect(comp.setPage).toHaveBeenCalled();
		expect(comp.page.size).toBe(10);
	});
	it('Should addUrlQueryParams Test', () => {
		spyOn(comp['location'], 'replaceState');
		comp.addUrlQueryParams();
		expect(comp['location'].replaceState).toHaveBeenCalled();
	});

	it('Should getFields When Subscribe successfull', fakeAsync(() => {
		let Confirmation_Responce = {
			result: {
				data:[],
				total:0
			},
		};
		spyOn(request_MockService, 'sendRequest').and.returnValue(
			of(Confirmation_Responce).pipe(delay(1)),
		);
		comp.getFields({});
		expect(comp.loadSpin).toBe(true);
		// fixture.detectChanges();
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.loadSpin).toBe(false);
		expect(comp.fields.length).toBe(0);
		expect(comp.page.totalElements).toBe(0);
	}));
	it('Should getFields When Subscribe UnSuccessfull', fakeAsync(() => {
		spyOn(request_MockService, 'sendRequest').and.returnValue(
			throwError({ error: { message: 'error' } }),
		);
		comp.getFields({});
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.loadSpin).toBe(false);
	}));
	it('Should checkInputs Test', () => {
		comp.fieldFilterForm = comp['fb'].group({
			name: [''],
			remainder_days: [''],
			description: [''],
			comments: [''],
		});
		let Result = comp.checkInputs();
		expect(Result).toBe(true);
	});
	it('Should checkInputs Test When filterForm have values', () => {
		comp.fieldFilterForm = comp['fb'].group({
			name: [''],
			remainder_days: [''],
			description: [''],
			comments: [''],
		});
		comp.fieldFilterForm.controls.name.setValue('Mock Name');
		let Result = comp.checkInputs();
		expect(Result).toBe(false);
	});
	afterAll(() => {
		TestBed.resetTestingModule();
	});
});
