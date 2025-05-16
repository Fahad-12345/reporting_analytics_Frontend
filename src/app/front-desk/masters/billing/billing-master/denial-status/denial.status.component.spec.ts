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
import { BillDenialStatusComponent } from './denial.status.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('BillDenialStatusComponent', () => {
	let comp: BillDenialStatusComponent;
	let fixture: ComponentFixture<BillDenialStatusComponent>;
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
			declarations: [BillDenialStatusComponent],
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
		fixture = TestBed.createComponent(BillDenialStatusComponent);
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
	function denialFormSearch(): FormGroup {
		return comp['fb'].group({
			name: [''],
			comments: [''],
			description: [''],
		});
	}
	it('should form valid on empty', async(() => {
		const form = denialFormSearch();
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
		comp.denialStatusform = denialFormSearch();
		comp.denialStatusform.controls['name'].setValue(formValue.name);
		comp.denialStatusform.controls['comments'].setValue(formValue.comments);
		comp.denialStatusform.controls['description'].setValue(formValue.description);
		tick();
		expect(comp.loadSpin).toBeFalsy();
		comp.createPaymentStatusSubmit(comp.denialStatusform.value);
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
		comp.denialStatusform = denialFormSearch();
		comp.denialStatusform.controls['name'].setValue(formValue.comments);
		comp.denialStatusform.controls['comments'].setValue(formValue.description);
		comp.denialStatusform.controls['description'].setValue(formValue.name);
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
		comp.modalRef = comp['modalService'].open('PaymentStatusModel', ngbModalOptions);
		comp.denialStatusform = denialFormSearch();
		comp.denialStatusform.controls['name'].setValue(formValue.comments);
		comp.denialStatusform.controls['comments'].setValue(formValue.description);
		comp.denialStatusform.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(throwError('error') );
		comp.createPaymentStatusSubmit(formValue);
        fixture.detectChanges();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		comp.modalRef.close();
		expect(comp.loadSpin).toBeFalsy();
		expect(comp.disableBtn).toBeFalsy();
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
		comp.modalRef = comp['modalService'].open('PaymentStatusModel', ngbModalOptions);
		comp.denialStatusform = denialFormSearch();
		comp.denialStatusform.controls['name'].setValue(formValue.comments);
		comp.denialStatusform.controls['comments'].setValue(formValue.description);
		comp.denialStatusform.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.createPaymentStatusSubmit(formValue);
        fixture.detectChanges();
		expect(comp.loadSpin).toBeTruthy();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		comp.modalRef.close();
		expect(comp.loadSpin).toBeFalsy();
    }));
	it('Should denialStatusSetPage function test', () => {
		spyOn(comp, 'addUrlQueryParams');
		spyOn(comp, 'displayDenialUpdated');
		spyOn(comp['denialStatusSelection'], 'clear');
		comp.denialStatusform = comp.denialFormSearch();
		const pageInfo = {
			offset: 0,
		};
		comp['DenialStatusPage'].pageNumber = pageInfo.offset;
		const pageNumber = comp['DenialStatusPage'].pageNumber + 1;
		comp.denialStatusform.controls.name.setValue('Your name');
		comp.denialStatusform.controls.comments.setValue('Your comments');
		comp.denialStatusform.controls.description.setValue('Your description');
		const filters = checkReactiveFormIsEmpty(comp.denialStatusform);
		comp['queryParams'] = {
			filter: !isObjectEmpty(filters),
			order: OrderEnum.ASC,
			per_page: comp['DenialStatusPage'].size || 10,
			page: pageNumber,
			pagination: true,
			order_by: 'name',
		};
		let queryparam = { per_page: comp['DenialStatusPage'].size, page: pageNumber };
		expect(comp['DenialStatusPage'].pageNumber).toBe(pageInfo.offset);
		// expect(comp['denialStatusSelection'].clear).toHaveBeenCalled();
		const formValue: any = {
			comments: 'comments',
			description: 'description',
			name: 'name',
		};
		comp.denialStatusform = denialFormSearch();
		comp.denialStatusform.controls['name'].setValue(formValue.name);
		comp.denialStatusform.controls['comments'].setValue(formValue.comments);
		comp.denialStatusform.controls['description'].setValue(formValue.description);
		comp.denialStatusSetPage(pageInfo);
		expect(comp.addUrlQueryParams).toHaveBeenCalled();
		expect(comp.displayDenialUpdated).toHaveBeenCalled();
	});
	it('Should displayDenialUpdated function test when subscribe throw error', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'desc',
			name: 'name',
		};
		comp.denialStatusSerarchForm = denialFormSearch();
		comp.denialStatusSerarchForm.controls['name'].setValue(formValue.comments);
		comp.denialStatusSerarchForm.controls['comments'].setValue(formValue.description);
		comp.denialStatusSerarchForm.controls['description'].setValue(formValue.name);
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
		comp.denialStatusform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.denialStatusform.markAsTouched();
		comp.denialStatusform.markAsDirty();
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
		comp.denialStatusform = comp['fb'].group({
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
		comp.modalRef = comp['modalService'].open('PaymentStatusModel', ngbModalOptions);
		comp.denialStatusform.markAsTouched();
		comp.denialStatusform.markAsDirty();
		spyOn(comp.denialStatusform,'reset');
        spyOn(canDeactive_MockService, 'canDeactivate').and.returnValue(of([]));
		comp.closeModel();
		comp.modalRef.close();
        expect(comp.denialStatusform.reset).toHaveBeenCalled();
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
		comp.modalRef = comp['modalService'].open('PaymentStatusModel', ngbModalOptions);
		comp.denialStatusform = denialFormSearch();
		comp.denialStatusform.controls['name'].setValue(formValue.comments);
		comp.denialStatusform.controls['comments'].setValue(formValue.description);
		comp.denialStatusform.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(throwError('error') );
		comp.updateDeniatSubmit(formValue);
		comp.modalRef.close();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp.loadSpin).toBeFalsy();
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
		spyOn(comp, 'denialFormSearch');
		spyOn(comp['fb'], 'group');
		// spyOn(comp['_route'].queryParams,'subscribe').and.returnValue(of([MockRowValue]));
		// spyOn(comp.subscription,'push').and.returnValue(of([MockRowValue]));

		comp.ngOnInit();
		tick();
		expect(comp.setTitle).toHaveBeenCalled();
		expect(comp['denialFormSearch']).toHaveBeenCalled();
		expect(comp['fb'].group).toHaveBeenCalled();
		expect(comp.subscription.push).toHaveBeenCalled();

	}));
	it('Should Test denialFormSearch', () => {
		spyOn(comp['fb'], 'group');
		comp.denialFormSearch();
		expect(comp['fb'].group).toHaveBeenCalled();
	});
	it('Should Test isPaymentStatusAllSelected', () => {
		comp.denialStatusComingData.length = 10;
		comp.denialStatusTotalRows = comp.denialStatusComingData.length;
		comp['denialStatusSelection'].selected.length = 10;
		comp.isPaymentStatusAllSelected();
		expect(comp.denialStatusTotalRows).toBe(comp['denialStatusSelection'].selected.length);
	});
	it('Should Test isPaymentStatusAllSelected', () => {
		comp.denialStatusComingData.length = 10;
		comp.denialStatusTotalRows = comp.denialStatusComingData.length;
		comp['denialStatusSelection'].selected.length = 10;
		comp.isPaymentStatusAllSelected();
		expect(comp.denialStatusTotalRows).toBe(comp['denialStatusSelection'].selected.length);
	});
	it('Should Test paymentStatusmasterToggle when isSelected True', () => {
		// spyOn(comp, 'isPaymentStatusAllSelected').and.returnValue(of(true));
		spyOn(comp['denialStatusSelection'], 'clear');
		comp.paymentStatusmasterToggle();
		expect(comp.isPaymentStatusAllSelected).toHaveBeenCalled();
		expect(comp['denialStatusSelection'].clear).toHaveBeenCalled();
	});
	it('Should Test paymentStatusmasterToggle when isSelected False', () => {
		spyOn(comp, 'isPaymentStatusAllSelected').and.returnValue(false);
		comp.denialStatusTotalRows = 5;
		comp.paymentStatusmasterToggle();
		comp.denialStatusComingData = [2];
		expect(comp.isPaymentStatusAllSelected).toHaveBeenCalled();
	});
	it('Should Test page limit function', () => {
		spyOn(comp, 'denialStatusSetPage');
		comp.paymentStatusPageLimit('3');
		expect(comp.denialStatusSetPage).toHaveBeenCalled();
		expect(comp['DenialStatusPage'].size).toBe(3);
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
		comp.denialStatusform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.denialStatusComingData = mockPlaceOfServiceList;
		comp.patchEditValues(MockRowValue, MockRowIndex);
		expect(comp.modelSubmit).toBe('Update');
		expect(comp.modelTitle).toBe('Edit');
	});
	it('Should Test patchAddValues', () => {
		comp.denialStatusform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			code: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		spyOn(comp.denialStatusform, 'reset');
		comp.patchAddValues();
		expect(comp.denialStatusform.reset).toHaveBeenCalled();
		expect(comp.modelSubmit).toContain('Save & Continue');
		expect(comp.modelTitle).toContain('Add');
	});
	it('Should check Reset Button when denialStatusSerarchForm From Empty function Test', () => {
		comp.denialStatusSerarchForm = comp.denialFormSearch();
		const retrunValue = isEmptyObject(comp.denialStatusSerarchForm.value);
		comp.checkInputs();
		expect(retrunValue).toBe(true);
	});
	it('Should check Reset Button disabled when denialStatusSerarchForm have values function Test', () => {
		comp.denialStatusSerarchForm = comp.denialFormSearch();
		comp.denialStatusSerarchForm.controls.name.setValue('mock name');
		comp.denialStatusSerarchForm.controls.comments.setValue('mock comments');
		comp.denialStatusSerarchForm.controls.description.setValue('mock description');
		const retrunValue = isEmptyObject(comp.denialStatusSerarchForm.value);
		comp.checkInputs();
		expect(retrunValue).toBe(false);
	});
	it('Should Test stringfy function which convert object', () => {
		const obj = comp.stringfy({ name: 'name mock' });
		expect(obj).toContain('{"name":"name mock"}');
	});
	it('Should Test closeModel when denialStatusform dirty and touched false', fakeAsync(() => {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('PaymentStatusModel', ngbModalOptions);
		comp.denialStatusform = comp['fb'].group({
			name: ['name'],
			comments: ['comment'],
			description: ['desc'],
		});
		spyOn(comp.denialStatusform,'reset');
		comp.denialStatusform.reset();
		comp.closeModel();
		comp.modalRef.close();
		expect(comp.denialStatusform.reset).toHaveBeenCalled();
	}));
	it('Should Test closeModel when denialStatusform dirty and touched true', fakeAsync(() => {
		// const spyOnMethod = spyOn(comp['CanDeactivateService'], 'canDeactivate').and.returnValue(of([]));
		const subspy = spyOn(canDeactive_MockService.canDeactivate(), 'subscribe');
		comp.denialStatusform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.denialStatusform.markAsTouched();
		comp.denialStatusform.markAsDirty();
		comp.closeModel();
		tick();
		// expect(spyOnMethod).toHaveBeenCalledBefore(subspy);
		expect(subspy).toHaveBeenCalled();
	}));
	it('Should Test closeModel when denialStatusform dirty and touched true and subcribe throw error', fakeAsync(() => {
		// const spyOnMethod = spyOn(comp['CanDeactivateService'], 'canDeactivate').and.returnValue(of([]));
		const subspy = spyOn(canDeactive_MockService.canDeactivate(false), 'subscribe');
		comp.denialStatusform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.denialStatusform.markAsTouched();
		comp.denialStatusform.markAsDirty();
		comp.closeModel();
		tick();
		// expect(spyOnMethod).toHaveBeenCalledBefore(subspy);
		expect(subspy).toHaveBeenCalled();
	}));
	it('Should displayDenialUpdated with denialStatusComingData empty', fakeAsync(() => {
		const formValue: any = {
			comments: 'comments',
			description: 'description',
			name: 'name',
			status:true,
			comingData:[]
		};
		comp.denialStatusSerarchForm = denialFormSearch();
		comp.denialStatusSerarchForm.controls['name'].setValue(formValue.comments);
		comp.denialStatusSerarchForm.controls['comments'].setValue(formValue.description);
		comp.denialStatusSerarchForm.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.displayDenialUpdated(formValue);
        fixture.detectChanges();
		expect(comp.loadSpin).toBeTruthy();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		expect(comp.denialStatusComingData.length).toBe(0);
		expect(comp['DenialStatusPage'].totalElements).toBe(0);
    }));
	it('Should Test resetDenialStatus function',()=>{
		spyOn(comp,'denialStatusSetPage');
		spyOn(comp['fb'],'group');
		comp.denialStatusSerarchForm = comp.denialFormSearch();
		comp.resetDenialStatus();
		expect(comp.denialStatusSetPage).toHaveBeenCalled();
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
		comp.modalRef = comp['modalService'].open('PaymentStatusModel', ngbModalOptions);
		comp.denialStatusform = comp.denialFormSearch();
		comp.denialStatusform.controls.name.setValue('mock name');
		comp.denialStatusform.controls.comments.setValue('mock comments');
		comp.denialStatusform.controls.description.setValue('mock description');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.updateDeniatSubmit(comp.denialStatusform);
        fixture.detectChanges();
		expect(comp.loadSpin).toBeTruthy();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		comp.modalRef.close();
		expect(comp.loadSpin).toBeFalsy();
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
		comp.modalRef = comp['modalService'].open('PaymentStatusModel', ngbModalOptions);
		comp.denialStatusform = comp.denialFormSearch();
		comp.denialStatusform.controls.name.setValue('mock name');
		comp.denialStatusform.controls.comments.setValue('mock comments');
		comp.denialStatusform.controls.description.setValue('mock description');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.updateDeniatSubmit(comp.denialStatusform);
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
	}));
	it('Should Test onSavePaymentStatusSubmit function',()=>{
		spyOn(comp,'createPaymentStatusSubmit');
		comp.denialStatusSerarchForm = comp.denialFormSearch();
		comp.denialStatusSerarchForm.controls.name.setValue('mock name');
		comp.denialStatusSerarchForm.controls.comments.setValue('mock comments');
		comp.denialStatusSerarchForm.controls.description.setValue('mock description');
		comp.onSavePaymentStatusSubmit(comp.denialStatusSerarchForm.value);
		comp.modelTitle = 'Add';
		expect(comp.createPaymentStatusSubmit).toHaveBeenCalled();
	});
	it('Should Test onSavePaymentStatusSubmit function without Add',()=>{
		spyOn(comp,'updateDeniatSubmit');
		comp.denialStatusSerarchForm = comp.denialFormSearch();
		comp.denialStatusSerarchForm.controls.name.setValue('mock name');
		comp.denialStatusSerarchForm.controls.comments.setValue('mock comments');
		comp.denialStatusSerarchForm.controls.description.setValue('mock description');
		comp.modelTitle = 'Edit';
		comp.onSavePaymentStatusSubmit(comp.denialStatusSerarchForm.value);
		expect(comp.updateDeniatSubmit).toHaveBeenCalled();
	});
	it('Should Test openPaymentStatusModal function',()=>{
		spyOn(comp,'patchAddValues');
		comp.denialStatusSerarchForm = comp.denialFormSearch();
		comp.denialStatusSerarchForm.controls.name.setValue('mock name');
		comp.denialStatusSerarchForm.controls.comments.setValue('mock comments');
		comp.denialStatusSerarchForm.controls.description.setValue('mock description');
		comp.openPaymentStatusModal(undefined,undefined,undefined);
		expect(comp.patchAddValues).toHaveBeenCalled();
	});
	it('Should Test openPaymentStatusModal function with row not undefined',()=>{
		spyOn(comp,'patchEditValues');
		comp.denialStatusSerarchForm = comp.denialFormSearch();
		comp.denialStatusSerarchForm.controls.name.setValue('mock name');
		comp.denialStatusSerarchForm.controls.comments.setValue('mock comments');
		comp.denialStatusSerarchForm.controls.description.setValue('mock description');
		comp.openPaymentStatusModal(undefined,comp.denialStatusSerarchForm.value,3);
		expect(comp.patchEditValues).toHaveBeenCalled();
	});
	it('Should Test openPaymentStatusModal function with row null',()=>{
		spyOn(comp,'patchAddValues');
		comp.denialStatusSerarchForm = comp.denialFormSearch();
		comp.denialStatusSerarchForm.controls.name.setValue('mock name');
		comp.denialStatusSerarchForm.controls.comments.setValue('mock comments');
		comp.denialStatusSerarchForm.controls.description.setValue('mock description');
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
