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
import { RequestService } from '@appDir/shared/services/request.service';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { RequiredFieldsMapperPipe } from '../../pipes/required-fields-mapper.pipe';
import { SpecialityModalComponent } from '../speciality-modal/speciality-modal.component';
import { HeaderFooterModalComponent } from './modals/header-footer-modal/header-footer-modal.component';
import { HeaderFooterComponent } from './header-footer.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { resolve } from 'url';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('HeaderFooterComponent', () => {
	let comp: HeaderFooterComponent;
	let fixture: ComponentFixture<HeaderFooterComponent>;
	let signatureMockService = new SignatureMockService();
	let request_MockService = new RequestMockService();
	let canDeactiveModel_MockService = new CanDeactiveMockService();
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [HeaderFooterComponent, HeaderFooterModalComponent, SpecialityModalComponent],
			schemas: [NO_ERRORS_SCHEMA],
			imports: [SharedModule, ToastrModule.forRoot(), RouterTestingModule, BrowserAnimationsModule,HttpClientTestingModule],
			providers: [
				NgbModal,
				NgbActiveModal,
				Config,
				LocalStorage,
				{ provide: SignatureServiceService, useValue: signatureMockService },
				{ provide: RequestService, useValue: request_MockService },
				{ provide: CanDeactivateModelComponentService, useValue: canDeactiveModel_MockService },
			],
		})
			.overrideModule(BrowserDynamicTestingModule, {
				set: {
					entryComponents: [HeaderFooterModalComponent],
				},
			})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(HeaderFooterComponent);
		comp = fixture.componentInstance;
	});
	afterEach(() => {
		TestBed.resetTestingModule();
	});
	it('should Create', () => {
		expect(comp).toBeTruthy();
	});
	it('Should ngOnInit Test', () => {
		spyOn(comp, 'setPage');
		spyOn(comp, 'getHeaderFooter');
		comp.ngOnInit();
		expect(comp.setPage).toHaveBeenCalled();
		expect(comp.getHeaderFooter).toHaveBeenCalled();
	});
	it('Should setPage Test', () => {
		spyOn(comp, 'addUrlQueryParams');
		comp.setPage({ offset: undefined });
		expect(comp.addUrlQueryParams).toHaveBeenCalled();
		expect(comp.startindex).toBe(0);
		expect(comp.endindex).toBe(10);
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
	it('Should checkInputs Test', () => {
		comp.searchParam = '';
		let Result = comp.checkInputs();
		expect(Result).toBe(true);
	});
	it('Should checkInputs Test When filterForm have values', () => {
		comp.searchParam = 'searchParams';
		let Result = comp.checkInputs();
		expect(Result).toBe(false);
	});
	it('Should getComponentRef Test When When componentsService have not matched values', () => {
		comp.searchParam = 'searchParams';
		comp.layoutService.componentsService = [{ id: 0 }, { id: 10 }];
		let Result = comp.getComponentRef('1');
		expect(Result).toBe(null);
	});
	it('Should getComponentRef Test When When componentsService', () => {
		comp.searchParam = 'searchParams';
		comp.layoutService.componentsService = [
			{ id: '0', componentRef: 'referenceZero' },
			{ id: '1', componentRef: 'referenceOne' },
		];
		let Result = comp.getComponentRef('1');
		expect(Result).toBe('referenceOne');
	});
	// it('Should editHFPermissions Test', fakeAsync(() => {
	// 	spyOn(comp['modalService'], 'open').and.returnValue({result:{
	// 		// then:function(){
	// 		// 	return true
	// 		// }
	// 	}});
	// 	comp.editHFPermissions(5);
	// 	tick(1500);
	// 	expect(comp['modalService'].open).toHaveBeenCalled();
	// }));
	it('Should viewTemplate Test', () => {
		let option = JSON.stringify([{ id: 1 }]);
		comp.layoutService.componentsService = [
			{ id: '0', componentRef: 'referenceZero' },
			{ id: '1', componentRef: 'referenceOne' },
		];
		comp.viewTemplate({
			options: option,
			dashboard: [
				{
					id: 1,
					obj: {
						type: 'type',
					},
				},
			],
		});
		expect(comp.viewTemplateCheck).toBe(true);
	});
	it('Should getTag When Subscribe successfull', fakeAsync(() => {
		let Confirmation_Responce = {
			data: [{ tags: [] }],
			total: 0,
		};
		spyOn(request_MockService, 'sendRequest').and.returnValue(
			of(Confirmation_Responce).pipe(delay(1)),
		);
		comp.getTag(0, 0);
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.tags[0].tags.length).toBe(0);
	}));
	it('Should deletePermissions When Subscribe successfull', fakeAsync(() => {
		let Confirmation_Responce = {
			message: 'success message',
		};
		comp.searchSections = [{ section_id: 10 }];
		spyOn(comp, 'getTag');
		spyOn(request_MockService, 'sendRequest').and.returnValue(
			of(Confirmation_Responce).pipe(delay(1)),
		);
		comp.deletePermissions(0, 0);
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.getTag).toHaveBeenCalled();
	}));
	it('Should deleteHeaderFooter When Subscribe successfull', fakeAsync(() => {
		let Confirmation_Responce = {
			message: 'success message',
		};
		comp.searchSections = [{ section_id: 10 }];
		spyOn(comp, 'getHeaderFooter');
		spyOn(request_MockService, 'sendRequest').and.returnValue(
			of(Confirmation_Responce).pipe(delay(1)),
		);
		comp.deleteHeaderFooter(0);
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.getHeaderFooter).toHaveBeenCalled();
		expect(comp.viewTemplateCheck).toBe(false);
	}));
	it('Should openAndCloseFilters Test', () => {
		comp.searchSections = [{ section_id: 0 }, { section_id: 1 }];
		comp.isOpenFilters = [{ section_id: 0 }, { section_id: 1 }];
		spyOn(comp, 'getTag');
		comp.openAndCloseFilters(1);
		expect(comp.getTag).toHaveBeenCalled();
		expect(comp.isOpenFilters[1]).toBe(false);
	});
	it('Should updateIndex Test', () => {
		comp.updateIndex(1);
		expect(comp.startindex).toBe(10);
		expect(comp.endindex).toBe(20);
	});
	it('Should openModel Test If Row not exists', () => {
		comp.openModel();
		expect(comp.title).toMatch('Add New');
		expect(comp.buttonTitle).toMatch('Save');
	});
	it('Should openModel Test If Row exists', () => {
		comp.openModel('row');
		expect(comp.title).toMatch('Edit');
		expect(comp.buttonTitle).toMatch('Update');
	});
	it('Should openManager Test', () => {
		comp.openManager();
		expect(comp.layoutService.openTemplate).toBe(true);
	});
	it('Should getHeaderFooter When Subscribe successfull', fakeAsync(() => {
		let Confirmation_Responce = {
			data: [
				{
					sections: [
						{
							dashboard: [
								{
									obj: {
										statement: '',
									},
								},
							],
						},
					],
				},
			],
			total: 0,
		};
		spyOn(request_MockService, 'sendRequest').and.returnValue(
			of(Confirmation_Responce).pipe(delay(1)),
		);
		comp.getHeaderFooter({searchParams:'',offset:0,limit:10});
		expect(comp.loadSpin).toBe(true);
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.loadSpin).toBe(false);
		debugger;
	}));
	it('Should getHeaderFooter When Subscribe Unsuccessfull', fakeAsync(() => {
		spyOn(request_MockService, 'sendRequest').and.returnValue(throwError({ message: 'error' }));
		comp.getHeaderFooter({});
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		expect(comp.loadSpin).toBe(true);
	}));
	it('Should editTemplate Test', () => {
		let option = JSON.stringify([{ id: 1 }]);
		comp.editTemplate({ options: option, dashboard: [{ id: 1, obj: { type: 'type' } }] });
		expect(comp.layoutService.openTemplate).toBe(true);
	});
	afterAll(() => {
		TestBed.resetTestingModule();
	});
});
