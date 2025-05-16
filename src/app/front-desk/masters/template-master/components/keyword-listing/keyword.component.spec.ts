import { LocalStorage } from '@shared/libs/localstorage';
import { RequestMockService } from './../../../../../shared/mock-services/RequestMock.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { Config } from '@appDir/config/config';
import { KeyWordListingComponent } from './keyword.component';
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
import { ToastrModule } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TemplateFormComponent } from '../template-form/template-form.component';
import { SharedModule } from '@appDir/shared/shared.module';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Validators } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
describe('KeyWordListingComponent', () => {
	let comp: KeyWordListingComponent;
	let fixture: ComponentFixture<KeyWordListingComponent>;
	let request_MockService = new RequestMockService();
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [KeyWordListingComponent, TemplateFormComponent],
			imports: [SharedModule, ToastrModule.forRoot(), RouterTestingModule, BrowserAnimationsModule,HttpClientTestingModule],
			providers: [
				Config,
				NgbModal,
				LocalStorage,
				{ provide: RequestService, useValue: request_MockService },
			],
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(KeyWordListingComponent);
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
		comp.ngOnInit();
		expect(comp.setPage).toHaveBeenCalled();
		expect(comp.fieldFilterForm.value).toEqual({ title: '', description: '' });
		expect(comp.form.value).toEqual({ title: '', description: '', tag: '', id: '' });
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
		debugger;
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
	it('Should checkInputs Test', () => {
		comp.fieldFilterForm = comp['fb'].group({
			title: '',
			description: '',
		});
		let Result = comp.checkInputs();
		expect(Result).toBe(true);
	});
	it('Should checkInputs Test When filterForm have values', () => {
		comp.fieldFilterForm = comp['fb'].group({
			title: '',
			description: '',
		});
		comp.fieldFilterForm.controls.title.setValue('title');
		comp.fieldFilterForm.controls.description.setValue('description');
		let Result = comp.checkInputs();
		expect(Result).toBe(false);
	});
	it('Should getFields When Subscribe successfull', fakeAsync(() => {
		let Confirmation_Responce = {
			result: {
				data: [{ tags: [] }],
				total: 0,
			},
		};
		spyOn(request_MockService, 'sendRequest').and.returnValue(
			of(Confirmation_Responce).pipe(delay(1)),
		);
		comp.getFields({});
		expect(comp.loadSpin).toBe(true);
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		debugger;
		expect(comp.loadSpin).toBe(false);
		expect(comp.fields).toBe(Confirmation_Responce.result.data);
		expect(comp.page.totalElements).toBe(0);
	}));
	it('Should getFields When Subscribe Unsuccessfull', fakeAsync(() => {
		spyOn(request_MockService, 'sendRequest').and.returnValue(throwError({ message: 'error' }));
		comp.getFields({});
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		debugger;
		expect(comp.loadSpin).toBe(false);
	}));

	it('Should editTags Test', () => {
		comp.form = comp['fb'].group({
			title: '',
			description: '',
			'tag':['',Validators.required],
			'id':['']
		});
		spyOn(comp.keywordModal, 'show');
		comp.editTags({ id: 1, title: '', tag: [], description: '' });
		expect(comp.keywordModal.show).toHaveBeenCalled();
	});
	it('Should onSubmitTags When Subscribe successfull', fakeAsync(() => {
		let Confirmation_Responce = {
			status: true,
			message: 'Successfully',
			result: {
				data: [{ tags: [] }],
				total: 0,
			},
		};
		spyOn(comp.keywordModal, 'hide');
		spyOn(request_MockService, 'sendRequest').and.returnValue(
			of(Confirmation_Responce).pipe(delay(1)),
		);
		comp.onSubmitTags({ id: 1, tag: 'tag' });
		expect(comp.loadSpin).toBe(true);
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		debugger;
		expect(comp.loadSpin).toBe(false);
		expect(comp.keywordModal.hide).toHaveBeenCalled();
		expect(comp.page.size).toBe(10);
		expect(comp.page.pageNumber).toBe(0);
	}));
	it('Should onSubmitTags When Subscribe Unsuccessfull', fakeAsync(() => {
		spyOn(request_MockService, 'sendRequest').and.returnValue(throwError({ message: 'error' }));
		comp.onSubmitTags({ id: 1, tag: 'tag' });
		expect(request_MockService.sendRequest).toHaveBeenCalled();
		tick(15000);
		discardPeriodicTasks();
		debugger;
		expect(comp.loadSpin).toBe(false);
	}));
	afterAll(() => {
		TestBed.resetTestingModule();
	});
});
