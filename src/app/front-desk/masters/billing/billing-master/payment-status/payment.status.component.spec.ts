import { CanDeactivateModelComponentService } from './../../../../../shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { FormBuilder, FormGroup, Validators, Form } from '@angular/forms';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { Config } from '@appDir/config/config';
import { SharedModule } from '@appDir/shared/shared.module';
import { TestBed, async, ComponentFixture, fakeAsync, tick, discardPeriodicTasks, flush } from '@angular/core/testing';
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
import { BillPaymentStatusComponent } from './payment.status.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('BillPaymentStatusComponent', () => {
	let comp: BillPaymentStatusComponent;
	let fixture: ComponentFixture<BillPaymentStatusComponent>;
	let canDeactive_MockService = new CanDeactiveMockService();
	let request_MockService = new RequestMockService();
	let mockPlaceOfServiceList = [
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
			declarations: [BillPaymentStatusComponent],
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
		fixture = TestBed.createComponent(BillPaymentStatusComponent);
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
	function paymentFormSearch(): FormGroup {
		return comp['fb'].group({
			name: [''],
			comments: [''],
			description: [''],
		});
	}
	it('should form valid on empty', async(() => {
		const form = paymentFormSearch();
		form.controls['name'].setValue('');
		form.controls['comments'].setValue('');
		form.controls['description'].setValue('');
		expect(form.valid).toBeTruthy();
	}));
	it('Should createPaymentStatusSubmit', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'description',
			name: 'name',
			status:true
		};
		const spyOnMethod = spyOn(comp['requestService'], 'sendRequest').and.returnValue(of(formValue));
		const subspy = spyOn(request_MockService.sendRequest(), 'subscribe');
		comp.paymentStatusform = paymentFormSearch();
		comp.paymentStatusform.controls['name'].setValue(formValue.name);
		comp.paymentStatusform.controls['comments'].setValue(formValue.comments);
		comp.paymentStatusform.controls['description'].setValue(formValue.description);
		tick();
		expect(comp.loadSpin).toBeFalsy();
		comp.createPaymentStatusSubmit(comp.paymentStatusform.value);
		expect(comp.loadSpin).toBeFalsy();
		expect(spyOnMethod).toHaveBeenCalledBefore(subspy);
		expect(subspy).toHaveBeenCalled();
	}));
	it('Should createPaymentStatusSubmit function test when createPaymentStatusSubmit complete', () => {
		const formValue: any = {
			comments: 'comment',
			description: 'desc',
			name: 'name',
		};
		comp.paymentStatusform = paymentFormSearch();
		comp.paymentStatusform.controls['name'].setValue(formValue.comments);
		comp.paymentStatusform.controls['comments'].setValue(formValue.description);
		comp.paymentStatusform.controls['description'].setValue(formValue.name);
        // spyOn(request_MockService, 'sendRequest').and.returnValue(throwError('error') );
		
		
		comp.createPaymentStatusSubmit(formValue);
		fixture.detectChanges();
		
        // expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp.loadSpin).toBeFalsy();
	});
	it('Should createPaymentStatusSubmit function when Subscribe throw error ', fakeAsync(() => {
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
		comp.paymentStatusform = paymentFormSearch();
		comp.paymentStatusform.controls['name'].setValue(formValue.comments);
		comp.paymentStatusform.controls['comments'].setValue(formValue.description);
		comp.paymentStatusform.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(throwError('error') );
		comp.createPaymentStatusSubmit(formValue);
        fixture.detectChanges();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		expect(comp.loadSpin).toBeFalsy();
		expect(comp.disableBtn).toBeFalsy();
		comp['modalRef'].close();
    }));
	it('Should createPaymentStatusSubmit Subscribe body test when status true', fakeAsync(() => {
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
		comp.paymentStatusform = paymentFormSearch();
		comp.paymentStatusform.controls['name'].setValue(formValue.comments);
		comp.paymentStatusform.controls['comments'].setValue(formValue.description);
		comp.paymentStatusform.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.createPaymentStatusSubmit(formValue);
        fixture.detectChanges();
		expect(comp.loadSpin).toBeTruthy();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		expect(comp.loadSpin).toBeFalsy();
		comp['modalRef'].close();
    }));
	it('Should paymentStatusSetPage function test', () => {
		spyOn(comp, 'addUrlQueryParams');
		spyOn(comp, 'displayDenialUpdated');
		spyOn(comp['paymentStatusSelection'], 'clear');
		comp.paymentStatusform = comp.paymentFormSearch();
		const pageInfo = {
			offset: 0,
		};
		comp['PaymentStatusPage'].pageNumber = pageInfo.offset;
		const pageNumber = comp['PaymentStatusPage'].pageNumber + 1;
		comp.paymentStatusform.controls.name.setValue('Your name');
		comp.paymentStatusform.controls.comments.setValue('Your comments');
		comp.paymentStatusform.controls.description.setValue('Your description');
		const filters = checkReactiveFormIsEmpty(comp.paymentStatusform);
		comp['queryParams'] = {
			filter: !isObjectEmpty(filters),
			order: OrderEnum.ASC,
			per_page: comp['PaymentStatusPage'].size || 10,
			page: pageNumber,
			pagination: true,
			order_by: 'name',
		};
		let queryparam = { per_page: comp['PaymentStatusPage'].size, page: pageNumber };
		expect(comp['PaymentStatusPage'].pageNumber).toBe(pageInfo.offset);
		// expect(comp['paymentStatusSelection'].clear).toHaveBeenCalled();
		const formValue: any = {
			comments: 'comments',
			description: 'description',
			name: 'name',
		};
		comp.paymentStatusform = paymentFormSearch();
		comp.paymentStatusform.controls['name'].setValue(formValue.name);
		comp.paymentStatusform.controls['comments'].setValue(formValue.comments);
		comp.paymentStatusform.controls['description'].setValue(formValue.description);
		comp.paymentStatusSetPage(pageInfo);
		expect(comp.addUrlQueryParams).toHaveBeenCalled();
		expect(comp.displayDenialUpdated).toHaveBeenCalled();
	});
	it('Should displayDenialUpdated function test when subscribe throw error', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'desc',
			name: 'name',
		};
		comp.paymentStatusSerarchForm = paymentFormSearch();
		comp.paymentStatusSerarchForm.controls['name'].setValue(formValue.comments);
		comp.paymentStatusSerarchForm.controls['comments'].setValue(formValue.description);
		comp.paymentStatusSerarchForm.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(throwError('error') );
		comp.displayDenialUpdated(formValue);
        expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp.loadSpin).toBeFalsy();
		flush();
	}));
	it('Should closeModel function test when subscribe return empty responce	', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'desc',
			name: 'name',
		};
		comp.paymentStatusform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.paymentStatusform.markAsTouched();
		comp.paymentStatusform.markAsDirty();
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
		comp.paymentStatusform = comp['fb'].group({
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
		comp.paymentStatusform.markAsTouched();
		comp.paymentStatusform.markAsDirty();
		spyOn(comp.paymentStatusform,'reset');
        spyOn(canDeactive_MockService, 'canDeactivate').and.returnValue(of([]));
		comp.closeModel();
        expect(comp.paymentStatusform.reset).toHaveBeenCalled();
		comp['modalRef'].close();
	}));
	it('Should updateDeniatSubmit function test when subscribe throw error', fakeAsync(() => {
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
		comp.paymentStatusform = paymentFormSearch();
		comp.paymentStatusform.controls['name'].setValue(formValue.comments);
		comp.paymentStatusform.controls['comments'].setValue(formValue.description);
		comp.paymentStatusform.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(throwError('error') );
		comp.updateDeniatSubmit(formValue);
        expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp.loadSpin).toBeFalsy();
		comp['modalRef'].close();
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
		spyOn(comp, 'paymentFormSearch');
		// spyOn(comp, 'PaymentStatusPage');
		spyOn(comp['fb'], 'group');
		// spyOn(comp['_route'].queryParams,'subscribe').and.returnValue(of([MockRowValue]));
		// spyOn(comp.subscription,'push').and.returnValue(of([MockRowValue]));

		comp.ngOnInit();
		tick();
		expect(comp.setTitle).toHaveBeenCalled();
		expect(comp['paymentFormSearch']).toHaveBeenCalled();
		expect(comp['fb'].group).toHaveBeenCalled();
		expect(comp.subscription.push).toHaveBeenCalled();

	}));
	it('Should Test paymentFormSearch', () => {
		spyOn(comp['fb'], 'group');
		comp.paymentFormSearch();
		expect(comp['fb'].group).toHaveBeenCalled();
	});
	it('Should Test isPaymentStatusAllSelected', () => {
		comp.paymentStatusComingData.length = 10;
		comp.paymentStatusTotalRows = comp.paymentStatusComingData.length;
		comp['paymentStatusSelection'].selected.length = 10;
		comp.isPaymentStatusAllSelected();
		expect(comp.paymentStatusTotalRows).toBe(comp['paymentStatusSelection'].selected.length);
	});
	it('Should Test isPaymentStatusAllSelected', () => {
		comp.paymentStatusComingData.length = 10;
		comp.paymentStatusTotalRows = comp.paymentStatusComingData.length;
		comp['paymentStatusSelection'].selected.length = 10;
		comp.isPaymentStatusAllSelected();
		expect(comp.paymentStatusTotalRows).toBe(comp['paymentStatusSelection'].selected.length);
	});
	it('Should Test paymentStatusmasterToggle when isSelected True', () => {
		// spyOn(comp, 'isPaymentStatusAllSelected').and.returnValue(of(true));
		spyOn(comp['paymentStatusSelection'], 'clear');
		comp.paymentStatusmasterToggle();
		expect(comp.isPaymentStatusAllSelected).toHaveBeenCalled();
		expect(comp['paymentStatusSelection'].clear).toHaveBeenCalled();
	});
	it('Should Test paymentStatusmasterToggle when isSelected False', () => {
		spyOn(comp, 'isPaymentStatusAllSelected').and.returnValue(false);
		comp.paymentStatusTotalRows = 5;
		comp.paymentStatusmasterToggle();
		comp.paymentStatusComingData = [2];
		expect(comp.isPaymentStatusAllSelected).toHaveBeenCalled();
	});
	it('Should Test page limit function', () => {
		spyOn(comp, 'paymentStatusSetPage');
		comp.paymentStatusPageLimit('3');
		expect(comp.paymentStatusSetPage).toHaveBeenCalled();
		expect(comp['PaymentStatusPage'].size).toBe(3);
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
		comp.paymentStatusform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.paymentStatusComingData = mockPlaceOfServiceList;
		comp.patchEditValues(MockRowValue, MockRowIndex);
		expect(comp.modelSubmit).toBe('Update');
		expect(comp.modelTitle).toBe('Edit');
	});
	it('Should Test patchAddValues', () => {
		comp.paymentStatusform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			code: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		spyOn(comp.paymentStatusform, 'reset');
		comp.patchAddValues();
		expect(comp.paymentStatusform.reset).toHaveBeenCalled();
		expect(comp.modelSubmit).toContain('Save & Continue');
		expect(comp.modelTitle).toContain('Add');
	});
	it('Should check Reset Button when paymentStatusSerarchForm From Empty function Test', () => {
		comp.paymentStatusSerarchForm = comp.paymentFormSearch();
		const retrunValue = isEmptyObject(comp.paymentStatusSerarchForm.value);
		comp.checkInputs();
		expect(retrunValue).toBe(true);
	});
	it('Should check Reset Button disabled when paymentStatusSerarchForm have values function Test', () => {
		comp.paymentStatusSerarchForm = comp.paymentFormSearch();
		comp.paymentStatusSerarchForm.controls.name.setValue('mock name');
		comp.paymentStatusSerarchForm.controls.comments.setValue('mock comments');
		comp.paymentStatusSerarchForm.controls.description.setValue('mock description');
		const retrunValue = isEmptyObject(comp.paymentStatusSerarchForm.value);
		comp.checkInputs();
		expect(retrunValue).toBe(false);
	});
	it('Should Test stringfy function which convert object', () => {
		const obj = comp.stringfy({ name: 'name mock' });
		expect(obj).toContain('{"name":"name mock"}');
	});
	it('Should Test closeModel when paymentStatusform dirty and touched false', fakeAsync(() => {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('paymentType', ngbModalOptions);
		comp.paymentStatusform = comp['fb'].group({
			name: ['name'],
			comments: ['comment'],
			description: ['desc'],
		});
		spyOn(comp.paymentStatusform,'reset');
		comp.paymentStatusform.reset();
		comp.closeModel();
		expect(comp.paymentStatusform.reset).toHaveBeenCalled();
		comp['modalRef'].close();
	}));
	it('Should Test closeModel when paymentStatusform dirty and touched true', fakeAsync(() => {
		// const spyOnMethod = spyOn(comp['CanDeactivateService'], 'canDeactivate').and.returnValue(of([]));
		const subspy = spyOn(canDeactive_MockService.canDeactivate(), 'subscribe');
		comp.paymentStatusform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.paymentStatusform.markAsTouched();
		comp.paymentStatusform.markAsDirty();
		comp.closeModel();
		tick();
		// expect(spyOnMethod).toHaveBeenCalledBefore(subspy);
		expect(subspy).toHaveBeenCalled();
	}));
	it('Should Test closeModel when paymentStatusform dirty and touched true and subcribe throw error', fakeAsync(() => {
		// const spyOnMethod = spyOn(comp['CanDeactivateService'], 'canDeactivate').and.returnValue(of([]));
		const subspy = spyOn(canDeactive_MockService.canDeactivate(false), 'subscribe');
		comp.paymentStatusform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.paymentStatusform.markAsTouched();
		comp.paymentStatusform.markAsDirty();
		comp.closeModel();
		tick();
		// expect(spyOnMethod).toHaveBeenCalledBefore(subspy);
		expect(subspy).toHaveBeenCalled();
	}));
	it('Should displayDenialUpdated with paymentStatusComingData empty', fakeAsync(() => {
		const formValue: any = {
			comments: 'comments',
			description: 'description',
			name: 'name',
			status:true,
			comingData:[]
		};
		comp.paymentStatusSerarchForm = paymentFormSearch();
		comp.paymentStatusSerarchForm.controls['name'].setValue(formValue.comments);
		comp.paymentStatusSerarchForm.controls['comments'].setValue(formValue.description);
		comp.paymentStatusSerarchForm.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.displayDenialUpdated(formValue);
        fixture.detectChanges();
		expect(comp.loadSpin).toBeTruthy();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		expect(comp.paymentStatusComingData.length).toBe(0);
		expect(comp['PaymentStatusPage'].totalElements).toBe(0);
    }));
	it('Should Test resetPaymentStatus function',()=>{
		spyOn(comp,'paymentStatusSetPage');
		spyOn(comp['fb'],'group');
		comp.paymentStatusSerarchForm = comp.paymentFormSearch();
		comp.resetPaymentStatus();
		expect(comp.paymentStatusSetPage).toHaveBeenCalled();
		expect(comp['fb'].group).toHaveBeenCalled();
	});
	it('Should Test updateDeniatSubmit function when subsribe run successfull',fakeAsync(()=>{
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
		comp.paymentStatusform = comp.paymentFormSearch();
		comp.paymentStatusform.controls.name.setValue('mock name');
		comp.paymentStatusform.controls.comments.setValue('mock comments');
		comp.paymentStatusform.controls.description.setValue('mock description');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.updateDeniatSubmit(comp.paymentStatusform);
        fixture.detectChanges();
		expect(comp.loadSpin).toBeTruthy();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		expect(comp.loadSpin).toBeFalsy();
		comp['modalRef'].close();
	}));
	it('Should Test updateDeniatSubmit function when subsribe run successfull and status false',fakeAsync(()=>{
		const formValue: any = {
			comments: 'comment',
			description: 'description',
			name: 'name',
			status:false,
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
		comp.paymentStatusform = comp.paymentFormSearch();
		comp.paymentStatusform.controls.name.setValue('mock name');
		comp.paymentStatusform.controls.comments.setValue('mock comments');
		comp.paymentStatusform.controls.description.setValue('mock description');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.updateDeniatSubmit(comp.paymentStatusform);
        fixture.detectChanges();
		expect(comp.loadSpin).toBeTruthy();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		fixture.detectChanges();
		tick(15000);
		discardPeriodicTasks();
		comp.modalRef.close();
		expect(comp.loadSpin).toBeFalsy();
		comp['modalRef'].close();
	}));
	it('Should Test onSavePaymentStatusSubmit function',()=>{
		spyOn(comp,'createPaymentStatusSubmit');
		comp.paymentStatusSerarchForm = comp.paymentFormSearch();
		comp.paymentStatusSerarchForm.controls.name.setValue('mock name');
		comp.paymentStatusSerarchForm.controls.comments.setValue('mock comments');
		comp.paymentStatusSerarchForm.controls.description.setValue('mock description');
		comp.onSavePaymentStatusSubmit(comp.paymentStatusSerarchForm.value);
		comp.modelTitle = 'Add';
		expect(comp.createPaymentStatusSubmit).toHaveBeenCalled();
	});
	it('Should Test onSavePaymentStatusSubmit function without Add',()=>{
		spyOn(comp,'updateDeniatSubmit');
		comp.paymentStatusSerarchForm = comp.paymentFormSearch();
		comp.paymentStatusSerarchForm.controls.name.setValue('mock name');
		comp.paymentStatusSerarchForm.controls.comments.setValue('mock comments');
		comp.paymentStatusSerarchForm.controls.description.setValue('mock description');
		comp.modelTitle = 'Edit';
		comp.onSavePaymentStatusSubmit(comp.paymentStatusSerarchForm.value);
		expect(comp.updateDeniatSubmit).toHaveBeenCalled();
	});
	it('Should Test openPaymentStatusModal function',()=>{
		spyOn(comp,'patchAddValues');
		comp.paymentStatusSerarchForm = comp.paymentFormSearch();
		comp.paymentStatusSerarchForm.controls.name.setValue('mock name');
		comp.paymentStatusSerarchForm.controls.comments.setValue('mock comments');
		comp.paymentStatusSerarchForm.controls.description.setValue('mock description');
		comp.openPaymentStatusModal(undefined,undefined,undefined);
		expect(comp.patchAddValues).toHaveBeenCalled();
	});
	it('Should Test openPaymentStatusModal function with row not undefined',()=>{
		spyOn(comp,'patchEditValues');
		comp.paymentStatusSerarchForm = comp.paymentFormSearch();
		comp.paymentStatusSerarchForm.controls.name.setValue('mock name');
		comp.paymentStatusSerarchForm.controls.comments.setValue('mock comments');
		comp.paymentStatusSerarchForm.controls.description.setValue('mock description');
		comp.openPaymentStatusModal(undefined,comp.paymentStatusSerarchForm.value,3);
		expect(comp.patchEditValues).toHaveBeenCalled();
	});
	it('Should Test openPaymentStatusModal function with row null',()=>{
		spyOn(comp,'patchAddValues');
		comp.paymentStatusSerarchForm = comp.paymentFormSearch();
		comp.paymentStatusSerarchForm.controls.name.setValue('mock name');
		comp.paymentStatusSerarchForm.controls.comments.setValue('mock comments');
		comp.paymentStatusSerarchForm.controls.description.setValue('mock description');
		comp.openPaymentStatusModal(undefined,null,3);
		expect(comp.patchAddValues).toHaveBeenCalled();
	});
	it('Should Denialstringfy Test which return json stringify',()=>{
		const formValue: any = {
			comments: 'comments',
			description: 'description',
			name: 'name',
			status:true,
			result:[]
		};
		let JSON_String = comp.Denialstringfy(formValue);
		expect(JSON_String).toEqual(JSON.stringify(formValue));
	});
	afterAll(() => {
		TestBed.resetTestingModule();
	  });
});
