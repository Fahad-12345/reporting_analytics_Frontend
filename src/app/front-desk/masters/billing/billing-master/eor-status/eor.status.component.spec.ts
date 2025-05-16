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
import { BillEORStatusComponent } from './eor.status.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('BillEORStatusComponent', () => {
	let comp: BillEORStatusComponent;
	let fixture: ComponentFixture<BillEORStatusComponent>;
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
			declarations: [BillEORStatusComponent],
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
		fixture = TestBed.createComponent(BillEORStatusComponent);
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
	function eorFormSearch(): FormGroup {
		return comp['fb'].group({
			name: [''],
			comments: [''],
			description: [''],
		});
	}
	it('should form valid on empty', async(() => {
		const form = eorFormSearch();
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
		comp.eorStatusform = eorFormSearch();
		comp.eorStatusform.controls['name'].setValue(formValue.name);
		comp.eorStatusform.controls['comments'].setValue(formValue.comments);
		comp.eorStatusform.controls['description'].setValue(formValue.description);
		tick();
		expect(comp.loadSpin).toBeFalsy();
		comp.createPaymentStatusSubmit(comp.eorStatusform.value);
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
		comp.eorStatusform = eorFormSearch();
		comp.eorStatusform.controls['name'].setValue(formValue.comments);
		comp.eorStatusform.controls['comments'].setValue(formValue.description);
		comp.eorStatusform.controls['description'].setValue(formValue.name);
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
		comp.eorStatusform = eorFormSearch();
		comp.eorStatusform.controls['name'].setValue(formValue.comments);
		comp.eorStatusform.controls['comments'].setValue(formValue.description);
		comp.eorStatusform.controls['description'].setValue(formValue.name);
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
		comp.eorStatusform = eorFormSearch();
		comp.eorStatusform.controls['name'].setValue(formValue.comments);
		comp.eorStatusform.controls['comments'].setValue(formValue.description);
		comp.eorStatusform.controls['description'].setValue(formValue.name);
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
	it('Should eorStatusSetPage function test', () => {
		spyOn(comp, 'addUrlQueryParams');
		spyOn(comp, 'displayDenialUpdated');
		spyOn(comp['eorStatusSelection'], 'clear');
		comp.eorStatusform = comp.eorFormSearch();
		const pageInfo = {
			offset: 0,
		};
		comp['EORStatusPage'].pageNumber = pageInfo.offset;
		const pageNumber = comp['EORStatusPage'].pageNumber + 1;
		comp.eorStatusform.controls.name.setValue('Your name');
		comp.eorStatusform.controls.comments.setValue('Your comments');
		comp.eorStatusform.controls.description.setValue('Your description');
		const filters = checkReactiveFormIsEmpty(comp.eorStatusform);
		comp['queryParams'] = {
			filter: !isObjectEmpty(filters),
			order: OrderEnum.ASC,
			per_page: comp['EORStatusPage'].size || 10,
			page: pageNumber,
			pagination: true,
			order_by: 'name',
		};
		let queryparam = { per_page: comp['EORStatusPage'].size, page: pageNumber };
		expect(comp['EORStatusPage'].pageNumber).toBe(pageInfo.offset);
		// expect(comp['eorStatusSelection'].clear).toHaveBeenCalled();
		const formValue: any = {
			comments: 'comments',
			description: 'description',
			name: 'name',
		};
		comp.eorStatusform = eorFormSearch();
		comp.eorStatusform.controls['name'].setValue(formValue.name);
		comp.eorStatusform.controls['comments'].setValue(formValue.comments);
		comp.eorStatusform.controls['description'].setValue(formValue.description);
		comp.eorStatusSetPage(pageInfo);
		expect(comp.addUrlQueryParams).toHaveBeenCalled();
		expect(comp.displayDenialUpdated).toHaveBeenCalled();
	});
	it('Should displayDenialUpdated function test when subscribe throw error', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'desc',
			name: 'name',
		};
		comp.eorStatusSerarchForm = eorFormSearch();
		comp.eorStatusSerarchForm.controls['name'].setValue(formValue.comments);
		comp.eorStatusSerarchForm.controls['comments'].setValue(formValue.description);
		comp.eorStatusSerarchForm.controls['description'].setValue(formValue.name);
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
		comp.eorStatusform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.eorStatusform.markAsTouched();
		comp.eorStatusform.markAsDirty();
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
		comp.eorStatusform = comp['fb'].group({
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
		comp.eorStatusform.markAsTouched();
		comp.eorStatusform.markAsDirty();
		spyOn(comp.eorStatusform,'reset');
        spyOn(canDeactive_MockService, 'canDeactivate').and.returnValue(of([]));
		comp.closeModel();
		comp.modalRef.close();
        expect(comp.eorStatusform.reset).toHaveBeenCalled();
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
		comp.eorStatusform = eorFormSearch();
		comp.eorStatusform.controls['name'].setValue(formValue.comments);
		comp.eorStatusform.controls['comments'].setValue(formValue.description);
		comp.eorStatusform.controls['description'].setValue(formValue.name);
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
		spyOn(comp, 'eorFormSearch');
		spyOn(comp['fb'], 'group');
		// spyOn(comp['_route'].queryParams,'subscribe').and.returnValue(of([MockRowValue]));
		// spyOn(comp.subscription,'push').and.returnValue(of([MockRowValue]));

		comp.ngOnInit();
		tick();
		expect(comp.setTitle).toHaveBeenCalled();
		expect(comp['eorFormSearch']).toHaveBeenCalled();
		expect(comp['fb'].group).toHaveBeenCalled();
		expect(comp.subscription.push).toHaveBeenCalled();

	}));
	it('Should Test eorFormSearch', () => {
		spyOn(comp['fb'], 'group');
		comp.eorFormSearch();
		expect(comp['fb'].group).toHaveBeenCalled();
	});
	it('Should Test isEorStatusAllSelected', () => {
		comp.eorStatusComingData.length = 10;
		comp.eorStatusTotalRows = comp.eorStatusComingData.length;
		comp['eorStatusSelection'].selected.length = 10;
		comp.isEorStatusAllSelected();
		expect(comp.eorStatusTotalRows).toBe(comp['eorStatusSelection'].selected.length);
	});
	it('Should Test isEorStatusAllSelected', () => {
		comp.eorStatusComingData.length = 10;
		comp.eorStatusTotalRows = comp.eorStatusComingData.length;
		comp['eorStatusSelection'].selected.length = 10;
		comp.isEorStatusAllSelected();
		expect(comp.eorStatusTotalRows).toBe(comp['eorStatusSelection'].selected.length);
	});
	it('Should Test eorStatusmasterToggle when isSelected True', () => {
		// spyOn(comp, 'isEorStatusAllSelected').and.returnValue(of(true));
		spyOn(comp['eorStatusSelection'], 'clear');
		comp.eorStatusmasterToggle();
		expect(comp.isEorStatusAllSelected).toHaveBeenCalled();
		expect(comp['eorStatusSelection'].clear).toHaveBeenCalled();
	});
	it('Should Test eorStatusmasterToggle when isSelected False', () => {
		spyOn(comp, 'isEorStatusAllSelected').and.returnValue(false);
		comp.eorStatusTotalRows = 5;
		comp.eorStatusmasterToggle();
		comp.eorStatusComingData = [2];
		expect(comp.isEorStatusAllSelected).toHaveBeenCalled();
	});
	it('Should Test page limit function', () => {
		spyOn(comp, 'eorStatusSetPage');
		comp.eorStatusPageLimit('3');
		expect(comp.eorStatusSetPage).toHaveBeenCalled();
		expect(comp['EORStatusPage'].size).toBe(3);
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
		comp.eorStatusform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.eorStatusComingData = mockPlaceOfServiceList;
		comp.patchEditValues(MockRowValue, MockRowIndex);
		expect(comp.modelSubmit).toBe('Update');
		expect(comp.modelTitle).toBe('Edit');
	});
	it('Should Test patchAddValues', () => {
		comp.eorStatusform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			code: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		spyOn(comp.eorStatusform, 'reset');
		comp.patchAddValues();
		expect(comp.eorStatusform.reset).toHaveBeenCalled();
		expect(comp.modelSubmit).toContain('Save & Continue');
		expect(comp.modelTitle).toContain('Add');
	});
	it('Should check Reset Button when eorStatusSerarchForm From Empty function Test', () => {
		comp.eorStatusSerarchForm = comp.eorFormSearch();
		const retrunValue = isEmptyObject(comp.eorStatusSerarchForm.value);
		comp.checkInputs();
		expect(retrunValue).toBe(true);
	});
	it('Should check Reset Button disabled when eorStatusSerarchForm have values function Test', () => {
		comp.eorStatusSerarchForm = comp.eorFormSearch();
		comp.eorStatusSerarchForm.controls.name.setValue('mock name');
		comp.eorStatusSerarchForm.controls.comments.setValue('mock comments');
		comp.eorStatusSerarchForm.controls.description.setValue('mock description');
		const retrunValue = isEmptyObject(comp.eorStatusSerarchForm.value);
		comp.checkInputs();
		expect(retrunValue).toBe(false);
	});
	it('Should Test stringfy function which convert object', () => {
		const obj = comp.stringfy({ name: 'name mock' });
		expect(obj).toContain('{"name":"name mock"}');
	});
	it('Should Test closeModel when eorStatusform dirty and touched false', fakeAsync(() => {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('PaymentStatusModel', ngbModalOptions);
		comp.eorStatusform = comp['fb'].group({
			name: ['name'],
			comments: ['comment'],
			description: ['desc'],
		});
		spyOn(comp.eorStatusform,'reset');
		comp.eorStatusform.reset();
		comp.closeModel();
		comp.modalRef.close();
		expect(comp.eorStatusform.reset).toHaveBeenCalled();
	}));
	it('Should Test closeModel when eorStatusform dirty and touched true', fakeAsync(() => {
		// const spyOnMethod = spyOn(comp['CanDeactivateService'], 'canDeactivate').and.returnValue(of([]));
		const subspy = spyOn(canDeactive_MockService.canDeactivate(), 'subscribe');
		comp.eorStatusform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.eorStatusform.markAsTouched();
		comp.eorStatusform.markAsDirty();
		comp.closeModel();
		tick();
		// expect(spyOnMethod).toHaveBeenCalledBefore(subspy);
		expect(subspy).toHaveBeenCalled();
	}));
	it('Should Test closeModel when eorStatusform dirty and touched true and subcribe throw error', fakeAsync(() => {
		// const spyOnMethod = spyOn(comp['CanDeactivateService'], 'canDeactivate').and.returnValue(of([]));
		const subspy = spyOn(canDeactive_MockService.canDeactivate(false), 'subscribe');
		comp.eorStatusform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.eorStatusform.markAsTouched();
		comp.eorStatusform.markAsDirty();
		comp.closeModel();
		tick();
		// expect(spyOnMethod).toHaveBeenCalledBefore(subspy);
		expect(subspy).toHaveBeenCalled();
	}));
	it('Should displayDenialUpdated with eorStatusComingData empty', fakeAsync(() => {
		const formValue: any = {
			comments: 'comments',
			description: 'description',
			name: 'name',
			status:true,
			comingData:[]
		};
		comp.eorStatusSerarchForm = eorFormSearch();
		comp.eorStatusSerarchForm.controls['name'].setValue(formValue.comments);
		comp.eorStatusSerarchForm.controls['comments'].setValue(formValue.description);
		comp.eorStatusSerarchForm.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.displayDenialUpdated(formValue);
        fixture.detectChanges();
		expect(comp.loadSpin).toBeTruthy();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		expect(comp.eorStatusComingData.length).toBe(0);
		expect(comp['EORStatusPage'].totalElements).toBe(0);
    }));
	it('Should Test resetEORStatus function',()=>{
		spyOn(comp,'eorStatusSetPage');
		spyOn(comp['fb'],'group');
		comp.eorStatusSerarchForm = comp.eorFormSearch();
		comp.resetEORStatus();
		expect(comp.eorStatusSetPage).toHaveBeenCalled();
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
		comp.eorStatusform = comp.eorFormSearch();
		comp.eorStatusform.controls.name.setValue('mock name');
		comp.eorStatusform.controls.comments.setValue('mock comments');
		comp.eorStatusform.controls.description.setValue('mock description');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.updateDeniatSubmit(comp.eorStatusform);
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
		comp.eorStatusform = comp.eorFormSearch();
		comp.eorStatusform.controls.name.setValue('mock name');
		comp.eorStatusform.controls.comments.setValue('mock comments');
		comp.eorStatusform.controls.description.setValue('mock description');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.updateDeniatSubmit(comp.eorStatusform);
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
		comp.eorStatusSerarchForm = comp.eorFormSearch();
		comp.eorStatusSerarchForm.controls.name.setValue('mock name');
		comp.eorStatusSerarchForm.controls.comments.setValue('mock comments');
		comp.eorStatusSerarchForm.controls.description.setValue('mock description');
		comp.onSavePaymentStatusSubmit(comp.eorStatusSerarchForm.value);
		comp.modelTitle = 'Add';
		expect(comp.createPaymentStatusSubmit).toHaveBeenCalled();
	});
	it('Should Test onSavePaymentStatusSubmit function without Add',()=>{
		spyOn(comp,'updateDeniatSubmit');
		comp.eorStatusSerarchForm = comp.eorFormSearch();
		comp.eorStatusSerarchForm.controls.name.setValue('mock name');
		comp.eorStatusSerarchForm.controls.comments.setValue('mock comments');
		comp.eorStatusSerarchForm.controls.description.setValue('mock description');
		comp.modelTitle = 'Edit';
		comp.onSavePaymentStatusSubmit(comp.eorStatusSerarchForm.value);
		expect(comp.updateDeniatSubmit).toHaveBeenCalled();
	});
	it('Should Test openPaymentStatusModal function',()=>{
		spyOn(comp,'patchAddValues');
		comp.eorStatusSerarchForm = comp.eorFormSearch();
		comp.eorStatusSerarchForm.controls.name.setValue('mock name');
		comp.eorStatusSerarchForm.controls.comments.setValue('mock comments');
		comp.eorStatusSerarchForm.controls.description.setValue('mock description');
		comp.openPaymentStatusModal(undefined,undefined,undefined);
		expect(comp.patchAddValues).toHaveBeenCalled();
	});
	it('Should Test openPaymentStatusModal function with row not undefined',()=>{
		spyOn(comp,'patchEditValues');
		comp.eorStatusSerarchForm = comp.eorFormSearch();
		comp.eorStatusSerarchForm.controls.name.setValue('mock name');
		comp.eorStatusSerarchForm.controls.comments.setValue('mock comments');
		comp.eorStatusSerarchForm.controls.description.setValue('mock description');
		comp.openPaymentStatusModal(undefined,comp.eorStatusSerarchForm.value,3);
		expect(comp.patchEditValues).toHaveBeenCalled();
	});
	it('Should Test openPaymentStatusModal function with row null',()=>{
		spyOn(comp,'patchAddValues');
		comp.eorStatusSerarchForm = comp.eorFormSearch();
		comp.eorStatusSerarchForm.controls.name.setValue('mock name');
		comp.eorStatusSerarchForm.controls.comments.setValue('mock comments');
		comp.eorStatusSerarchForm.controls.description.setValue('mock description');
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
