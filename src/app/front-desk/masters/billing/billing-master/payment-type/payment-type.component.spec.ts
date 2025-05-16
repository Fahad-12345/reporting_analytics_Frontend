import { CanDeactivateModelComponentService } from './../../../../../shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { FormBuilder, FormGroup, Validators, Form } from '@angular/forms';
import { PaymentTypeComponent } from './payment-type.component';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { Config } from '@appDir/config/config';
import { SharedModule } from '@appDir/shared/shared.module';
import { TestBed, async, ComponentFixture, fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastrModule } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { checkReactiveFormIsEmpty, isEmptyObject, isObjectEmpty } from '@appDir/shared/utils/utils.helpers';
import { CanDeactiveMockService } from '@appDir/shared/canDeactivateModelComponent/canDeactiveModelMockService.service.ts/canDeactiveModelMockService';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { RequestMockService } from '@appDir/shared/mock-services/RequestMock.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { delay } from 'rxjs/operators';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
describe('PaymentTypeComponent', () => {
	let comp: PaymentTypeComponent;
	let fixture: ComponentFixture<PaymentTypeComponent>;
	let canDeactive_MockService = new CanDeactiveMockService();
	let request_MockService = new RequestMockService();
	let mockPaymentTypeList = [
		{
			id: 1,
			name: 'Bill',
			slug: 'bill',
			description: null,
			comments: null,
			created_by: 1,
			updated_by: null,
		},
		{
			id: 2,
			name: 'Interest',
			slug: 'interest',
			description: null,
			comments: null,
			created_by: 1,
			updated_by: null,
		},
		{
			id: 3,
			name: 'Overpayment',
			slug: 'overpayment',
			description: null,
			comments: null,
			created_by: 1,
			updated_by: null,
		},
		{
			id: 4,
			name: 'name',
			slug: 'slug',
			description: 'description',
			comments: 'comments',
			created_by: null,
			updated_by: null,
		},
	];
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [PaymentTypeComponent],
			imports: [ToastrModule.forRoot(), SharedModule, RouterTestingModule,BrowserAnimationsModule,HttpClientTestingModule],
			providers: [
				Config,
				LocalStorage,
				FormBuilder,
				{ provide: CanDeactivateModelComponentService, useValue: canDeactive_MockService },
				{ provide: RequestService, useValue: request_MockService },
			],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(PaymentTypeComponent);
		comp = fixture.componentInstance;
	});
	afterEach(() => {
		TestBed.resetTestingModule();
	});
	it('should be created', () => {
		expect(comp).toBeTruthy();
	});
	it('should call setTitle Fun in onOnit', () => {
		spyOn(comp, 'setTitle');
		comp.ngOnInit();
		expect(comp.setTitle).toHaveBeenCalled();
	});
	function PaymentSearchForm(): FormGroup {
		return comp['fb'].group({
			name: [''],
			comments: [''],
			description: [''],
		});
	}
	it('should form valid on empty', async(() => {
		const form = PaymentSearchForm();
		form.controls['name'].setValue('');
		form.controls['comments'].setValue('');
		form.controls['description'].setValue('');
		expect(form.valid).toBeTruthy();
	}));
	it('Should payment type creat', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'description',
			name: 'name',
			status:true
		};
		const spyOnMethod = spyOn(comp['requestService'], 'sendRequest').and.returnValue(of(formValue));
		const subspy = spyOn(request_MockService.sendRequest(), 'subscribe');
		comp.paymentform = PaymentSearchForm();
		comp.paymentform.controls['name'].setValue(formValue.comments);
		comp.paymentform.controls['comments'].setValue(formValue.description);
		comp.paymentform.controls['description'].setValue(formValue.name);
		tick();
		expect(comp.loadSpin).toBeFalsy();
		comp.createPaymentForm(formValue);
		expect(comp.loadSpin).toBeTruthy();
		expect(comp.disableBtn).toBeTruthy();
		expect(spyOnMethod).toHaveBeenCalledBefore(subspy);
		expect(subspy).toHaveBeenCalled();
	}));
	it('Should createPaymentForm function test when status false', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'desc',
			name: 'name',
		};
		comp.paymentform = PaymentSearchForm();
		comp.paymentform.controls['name'].setValue(formValue.comments);
		comp.paymentform.controls['comments'].setValue(formValue.description);
		comp.paymentform.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(throwError('error') );
		comp.createPaymentForm(formValue);
        expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp.loadSpin).toBeFalsy();
		expect(comp.disableBtn).toBeFalsy();
	}));
	it('Should createPaymentForm Subscribe body test when status true', fakeAsync(() => {
		const formValue: any = {
			comments: 'comments',
			description: 'description',
			name: 'name',
			status:true,
			total:10,
			result:{
				total:10
			}
		};
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('paymentType', ngbModalOptions);
		comp.paymentform = PaymentSearchForm();
		comp.paymentform.controls['name'].setValue(formValue.comments);
		comp.paymentform.controls['comments'].setValue(formValue.description);
		comp.paymentform.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.createPaymentForm(formValue);
        fixture.detectChanges();
		expect(comp.loadSpin).toBeTruthy();
		expect(comp.disableBtn).toBeTruthy();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		comp['modalRef'].close();
		expect(comp.loadSpin).toBeFalsy();
		expect(comp.disableBtn).toBeFalsy();
    }));
	it('Should setPage function test', () => {
		spyOn(comp, 'addUrlQueryParams');
		spyOn(comp, 'diplsayUpdatedGetPayment');
		spyOn(comp.selection, 'clear');
		comp.paymentSearch = comp.PaymentSearchForm();
		const pageInfo = {
			offset: 0,
		};
		comp.page.pageNumber = pageInfo.offset;
		const pageNumber = comp.page.pageNumber + 1;
		comp.paymentSearch.controls.name.setValue('Your name');
		comp.paymentSearch.controls.comments.setValue('Your comments');
		comp.paymentSearch.controls.description.setValue('Your description');
		const filters = checkReactiveFormIsEmpty(comp.paymentSearch);
		comp.queryParams = {
			filter: !isObjectEmpty(filters),
			order: OrderEnum.ASC,
			per_page: comp.page.size || 10,
			page: pageNumber,
			pagination: true,
			order_by: 'name',
		};
		let queryparam = { per_page: comp.page.size, page: pageNumber };
		expect(comp.page.pageNumber).toBe(pageInfo.offset);
		const formValue: any = {
			comments: 'comments',
			description: 'description',
			name: 'name',
		};
		comp.paymentform = PaymentSearchForm();
		comp.paymentform.controls['name'].setValue(formValue.comments);
		comp.paymentform.controls['comments'].setValue(formValue.description);
		comp.paymentform.controls['description'].setValue(formValue.name);
		comp.createPaymentForm(formValue);
	});
		it('Should setPage function test', () => {
		spyOn(comp, 'addUrlQueryParams');
		spyOn(comp, 'diplsayUpdatedGetPayment');
		spyOn(comp.selection, 'clear');
		comp.paymentSearch = comp.PaymentSearchForm();
		const pageInfo = {
			offset: 0,
		};
		comp.page.pageNumber = pageInfo.offset;
		const pageNumber = comp.page.pageNumber + 1;
		comp.paymentSearch.controls.name.setValue('Your name');
		comp.paymentSearch.controls.comments.setValue('Your comments');
		comp.paymentSearch.controls.description.setValue('Your description');
		const filters = checkReactiveFormIsEmpty(comp.paymentSearch);
		comp.queryParams = {
			filter: !isObjectEmpty(filters),
			order: OrderEnum.ASC,
			per_page: comp.page.size || 10,
			page: pageNumber,
			pagination: true,
			order_by: 'name',
		};
		let queryparam = { per_page: comp.page.size, page: pageNumber };
		expect(comp.page.pageNumber).toBe(pageInfo.offset);
		const formValue: any = {
			comments: 'comments',
			description: 'description',
			name: 'name',
		};
		comp.paymentform = PaymentSearchForm();
		comp.paymentform.controls['name'].setValue(formValue.comments);
		comp.paymentform.controls['comments'].setValue(formValue.description);
		comp.paymentform.controls['description'].setValue(formValue.name);
		comp.createPaymentForm(formValue);
	});
	it('Should diplsayUpdatedGetPayment function test when subscribe throw error', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'desc',
			name: 'name',
		};
		comp.paymentform = PaymentSearchForm();
		comp.paymentform.controls['name'].setValue(formValue.comments);
		comp.paymentform.controls['comments'].setValue(formValue.description);
		comp.paymentform.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(throwError('error') );
		comp.diplsayUpdatedGetPayment(formValue);
        expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp.loadSpin).toBeFalsy();
	}));
	it('Should closeModel function test when subscribe return empty responce	', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'desc',
			name: 'name',
		};
		comp.paymentform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.paymentform.markAsTouched();
		comp.paymentform.markAsDirty();
        spyOn(canDeactive_MockService, 'canDeactivate').and.returnValue(of(null));
		let ReturnValue = comp.closeModel();
        expect(ReturnValue).toBeUndefined();
	}));
	it('Should closeModel function test when subscribe return not empty responce	', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'desc',
			name: 'name',
		};
		comp.paymentform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('paymentType', ngbModalOptions);
		comp.paymentform.markAsTouched();
		comp.paymentform.markAsDirty();
		spyOn(comp.paymentform,'reset');
        spyOn(canDeactive_MockService, 'canDeactivate').and.returnValue(of([]));
		comp.closeModel();
		comp['modalRef'].close();
        expect(comp.paymentform.reset).toHaveBeenCalled();
	}));
	it('Should editPaymentTypeForm function test when subscribe throw error', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'desc',
			name: 'name',
		};
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('paymentType', ngbModalOptions);
		comp.paymentform = PaymentSearchForm();
		comp.paymentform.controls['name'].setValue(formValue.comments);
		comp.paymentform.controls['comments'].setValue(formValue.description);
		comp.paymentform.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(throwError('error') );
		comp.editPaymentTypeForm(formValue);
		comp['modalRef'].close();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp.loadSpin).toBeFalsy();
		expect(comp.disableBtn).toBeFalsy();
	}));
	it('Should addUrlQueryParams Test', () => {
		spyOn(comp['location'], 'replaceState');
		comp.addUrlQueryParams();
		expect(comp['location'].replaceState).toHaveBeenCalled();
	});
	it('payment type ngOnInit Test', fakeAsync(() => {
		const MockRowValue = {
			comments: null,
			created_by: 1,
			description: null,
			id: 1,
			name: 'Bill',
			slug: 'bill',
			updated_by: null,
		};
		spyOn(comp, 'setTitle');
		spyOn(comp, 'PaymentSearchForm');
		spyOn(comp, 'setPage');
		spyOn(comp['fb'], 'group');
		// spyOn(comp['_route'].queryParams,'subscribe').and.returnValue(of([MockRowValue]));
		// spyOn(comp.subscription,'push').and.returnValue(of([MockRowValue]));

		comp.ngOnInit();
		tick();
		expect(comp.setTitle).toHaveBeenCalled();
		expect(comp.PaymentSearchForm).toHaveBeenCalled();
		expect(comp['fb'].group).toHaveBeenCalled();
		expect(comp.subscription.push).toHaveBeenCalled();

	}));
	it('Should Test PaymentSearchForm', () => {
		spyOn(comp['fb'], 'group');
		comp.PaymentSearchForm();
		expect(comp['fb'].group).toHaveBeenCalled();
	});
	it('Should Test isAllSelected', () => {
		comp.paymentTypeComingData.length = 10;
		comp.totalRows = comp.paymentTypeComingData.length;
		comp.selection.selected.length = 10;
		comp.isAllSelected();
		expect(comp.totalRows).toBe(comp.selection.selected.length);
	});
	it('Should Test isAllSelected', () => {
		comp.paymentTypeComingData.length = 10;
		comp.totalRows = comp.paymentTypeComingData.length;
		comp.selection.selected.length = 10;
		comp.isAllSelected();
		expect(comp.totalRows).toBe(comp.selection.selected.length);
	});
	it('Should Test masterToggle when isSelected True', () => {
		// spyOn(comp, 'isAllSelected').and.returnValue(of(true));
		spyOn(comp.selection, 'clear');
		comp.masterToggle();
		expect(comp.isAllSelected).toHaveBeenCalled();
		expect(comp.selection.clear).toHaveBeenCalled();
	});
	it('Should Test masterToggle when isSelected False', () => {
		spyOn(comp, 'isAllSelected').and.returnValue(false);
		comp.totalRows = 5;
		comp.masterToggle();
		comp.paymentTypeComingData = [2];
		expect(comp.isAllSelected).toHaveBeenCalled();
	});
	it('Should Test page limit function', () => {
		spyOn(comp, 'setPage');
		comp.pageLimit('3');
		expect(comp.setPage).toHaveBeenCalled();
		expect(comp.page.size).toBe(3);
	});
	it('Should Test patchEditValues', () => {
		comp.modelSubmit = 'Update';
		comp.modelTitle = 'Edit';
		const MockRowValue = {
			comments: null,
			created_by: 1,
			description: null,
			id: 1,
			name: 'Bill',
			slug: 'bill',
			updated_by: null,
		};
		const MockRowIndex = 0;
		comp.paymentform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.paymentTypeComingData = mockPaymentTypeList;
		comp.patchEditValues(MockRowValue, MockRowIndex);
		expect(comp.modelSubmit).toBe('Update');
		expect(comp.modelTitle).toBe('Edit');
	});
	it('Should Test patchAddValues', () => {
		comp.paymentform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		spyOn(comp.paymentform, 'reset');
		comp.patchAddValues();
		expect(comp.paymentform.reset).toHaveBeenCalled();
		expect(comp.modelSubmit).toContain('Save & Continue');
		expect(comp.modelTitle).toContain('Add');
	});
	it('Should check Reset Button when paymentSearch From Empty function Test', () => {
		comp.paymentSearch = comp.PaymentSearchForm();
		const retrunValue = isEmptyObject(comp.paymentSearch.value);
		comp.checkInputs();
		expect(retrunValue).toBe(true);
	});
	it('Should check Reset Button disabled when paymentSearch have values function Test', () => {
		comp.paymentSearch = comp.PaymentSearchForm();
		comp.paymentSearch.controls.name.setValue('mock name');
		comp.paymentSearch.controls.comments.setValue('mock comments');
		comp.paymentSearch.controls.description.setValue('mock description');
		const retrunValue = isEmptyObject(comp.paymentSearch.value);
		comp.checkInputs();
		expect(retrunValue).toBe(false);
	});
	it('Should Test stringfy function which convert object', () => {
		const obj = comp.stringfy({ name: 'name mock' });
		expect(obj).toContain('{"name":"name mock"}');
	});
	it('Should Test closeModel when paymentForm dirty and touched false', fakeAsync(() => {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('paymentType', ngbModalOptions);
		comp.paymentform = comp['fb'].group({
			name: ['name'],
			comments: ['comment'],
			description: ['desc'],
		});
		spyOn(comp.paymentform,'reset');
		comp.paymentform.reset();
		comp.closeModel();
		comp['modalRef'].close();
		expect(comp.paymentform.reset).toHaveBeenCalled();
	}));
	it('Should Test closeModel when paymentForm dirty and touched true', fakeAsync(() => {
		// const spyOnMethod = spyOn(comp['CanDeactivateService'], 'canDeactivate').and.returnValue(of([]));
		const subspy = spyOn(canDeactive_MockService.canDeactivate(), 'subscribe');
		comp.paymentform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.paymentform.markAsTouched();
		comp.paymentform.markAsDirty();
		comp.closeModel();
		tick();
		// expect(spyOnMethod).toHaveBeenCalledBefore(subspy);
		expect(subspy).toHaveBeenCalled();
	}));
	it('Should Test closeModel when paymentForm dirty and touched true and subcribe throw error', fakeAsync(() => {
		// const spyOnMethod = spyOn(comp['CanDeactivateService'], 'canDeactivate').and.returnValue(of([]));
		const subspy = spyOn(canDeactive_MockService.canDeactivate(false), 'subscribe');
		comp.paymentform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.paymentform.markAsTouched();
		comp.paymentform.markAsDirty();
		comp.closeModel();
		tick();
		// expect(spyOnMethod).toHaveBeenCalledBefore(subspy);
		expect(subspy).toHaveBeenCalled();
	}));
	it('Should diplsayUpdatedGetPayment with paymentTypeComingData empty', fakeAsync(() => {
		const formValue: any = {
			comments: 'comments',
			description: 'description',
			name: 'name',
			status:true,
			result:[]
			
		};
		comp.paymentform = PaymentSearchForm();
		comp.paymentform.controls['name'].setValue(formValue.comments);
		comp.paymentform.controls['comments'].setValue(formValue.description);
		comp.paymentform.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.diplsayUpdatedGetPayment(formValue);
        fixture.detectChanges();
		expect(comp.loadSpin).toBeTruthy();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		expect(comp.paymentTypeComingData.length).toBe(0);
		expect(comp.page.totalElements).toBe(0);
    }));
	it('Should Test resetPayment function',()=>{
		spyOn(comp,'setPage');
		spyOn(comp['fb'],'group');
		comp.paymentSearch = comp.PaymentSearchForm();
		comp.resetPayment();
		expect(comp.setPage).toHaveBeenCalled();
		expect(comp['fb'].group).toHaveBeenCalled();
	});
	it('Should Test editPaymentTypeForm function when subsribe run successfull',fakeAsync(()=>{
		const formValue: any = {
			comments: 'comment',
			description: 'description',
			name: 'name',
			status:true,
			total:10,
			result:{
				total:10
			}
		};
		// spyOn(comp.subscription, 'push').and.returnValue(
		// 	of({
		// 		body: {
		// 			status: true,
		// 		},
		// 	}),
		// );
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('paymentType', ngbModalOptions);
		comp.paymentSearch = comp.PaymentSearchForm();
		comp.paymentSearch.controls.name.setValue('mock name');
		comp.paymentSearch.controls.comments.setValue('mock comments');
		comp.paymentSearch.controls.description.setValue('mock description');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.editPaymentTypeForm(comp.paymentSearch);
        fixture.detectChanges();
		expect(comp.loadSpin).toBeTruthy();
		expect(comp.disableBtn).toBeTruthy();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		comp['modalRef'].close();
		expect(comp.loadSpin).toBeFalsy();
		expect(comp.disableBtn).toBeFalsy();
	}));
	it('Should Test savePaymentTypeForm function',()=>{
		spyOn(comp,'createPaymentForm');
		comp.paymentSearch = comp.PaymentSearchForm();
		comp.paymentSearch.controls.name.setValue('mock name');
		comp.paymentSearch.controls.comments.setValue('mock comments');
		comp.paymentSearch.controls.description.setValue('mock description');
		comp.savePaymentTypeForm(comp.paymentSearch.value);
		comp.modelTitle = 'Add';
		expect(comp.createPaymentForm).toHaveBeenCalled();
	});
	it('Should Test savePaymentTypeForm function without Add',()=>{
		spyOn(comp,'editPaymentTypeForm');
		comp.paymentSearch = comp.PaymentSearchForm();
		comp.paymentSearch.controls.name.setValue('mock name');
		comp.paymentSearch.controls.comments.setValue('mock comments');
		comp.paymentSearch.controls.description.setValue('mock description');
		comp.modelTitle = 'Edit';
		comp.savePaymentTypeForm(comp.paymentSearch.value);
		expect(comp.editPaymentTypeForm).toHaveBeenCalled();
	});
	it('Should Test paymentTypeOpenModal function',()=>{
		spyOn(comp,'patchAddValues');
		comp.paymentSearch = comp.PaymentSearchForm();
		comp.paymentSearch.controls.name.setValue('mock name');
		comp.paymentSearch.controls.comments.setValue('mock comments');
		comp.paymentSearch.controls.description.setValue('mock description');
		comp.paymentTypeOpenModal(undefined,undefined,undefined);
		expect(comp.patchAddValues).toHaveBeenCalled();
	});
	it('Should Test paymentTypeOpenModal function with row not undefined',()=>{
		spyOn(comp,'patchEditValues');
		comp.paymentSearch = comp.PaymentSearchForm();
		comp.paymentSearch.controls.name.setValue('mock name');
		comp.paymentSearch.controls.comments.setValue('mock comments');
		comp.paymentSearch.controls.description.setValue('mock description');
		comp.paymentTypeOpenModal(undefined,1,3);
		expect(comp.patchEditValues).toHaveBeenCalled();
	});
	it('Should Test paymentTypeOpenModal function with row null',()=>{
		spyOn(comp,'patchAddValues');
		comp.paymentSearch = comp.PaymentSearchForm();
		comp.paymentSearch.controls.name.setValue('mock name');
		comp.paymentSearch.controls.comments.setValue('mock comments');
		comp.paymentSearch.controls.description.setValue('mock description');
		comp.paymentTypeOpenModal(undefined,null,3);
		expect(comp.patchAddValues).toHaveBeenCalled();
	});
	afterAll(() => {
		TestBed.resetTestingModule();
	  });
});
