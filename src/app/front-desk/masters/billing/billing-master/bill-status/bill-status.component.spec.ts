import { CanDeactivateModelComponentService } from './../../../../../shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { BillStatusComponent } from './bill-status.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('BillStatusComponent', () => {
	let comp: BillStatusComponent;
	let fixture: ComponentFixture<BillStatusComponent>;
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
			declarations: [BillStatusComponent],
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
		fixture = TestBed.createComponent(BillStatusComponent);
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
	function billStatusFormSearch(): FormGroup {
		return comp['fb'].group({
			name: [''],
			comments: [''],
			description: [''],
		});
	}
	it('should form valid on empty', async(() => {
		const form = billStatusFormSearch();
		form.controls['name'].setValue('');
		form.controls['comments'].setValue('');
		form.controls['description'].setValue('');
		expect(form.valid).toBeTruthy();
	}));
	it('Should createBillStatusSubmit', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'description',
			name: 'name',
			status:true
		};
		const spyOnMethod = spyOn(comp['requestService'], 'sendRequest').and.returnValue(of(formValue));
		const subspy = spyOn(request_MockService.sendRequest(), 'subscribe');
		comp.billStatusform = billStatusFormSearch();
		comp.billStatusform.controls['name'].setValue(formValue.name);
		comp.billStatusform.controls['comments'].setValue(formValue.comments);
		comp.billStatusform.controls['description'].setValue(formValue.description);
		tick();
		expect(comp.loadSpin).toBeFalsy();
		comp.createBillStatusSubmit(comp.billStatusform.value);
		expect(comp.loadSpin).toBeFalsy();
		expect(spyOnMethod).toHaveBeenCalledBefore(subspy);
		expect(subspy).toHaveBeenCalled();
	}));
	it('Should createBillStatusSubmit function test when createBillStatusSubmit complete', () => {
		const formValue: any = {
			comments: 'comment',
			description: 'desc',
			name: 'name',
		};
		comp.billStatusform = billStatusFormSearch();
		comp.billStatusform.controls['name'].setValue(formValue.comments);
		comp.billStatusform.controls['comments'].setValue(formValue.description);
		comp.billStatusform.controls['description'].setValue(formValue.name);
        // spyOn(request_MockService, 'sendRequest').and.returnValue(throwError('error') );
		
		
		comp.createBillStatusSubmit(formValue);
		fixture.detectChanges();
		
        // expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp.loadSpin).toBeFalsy();
	});
	it('Should createBillStatusSubmit function when Subscribe throw error ', fakeAsync(() => {
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
		comp.billStatusform = billStatusFormSearch();
		comp.billStatusform.controls['name'].setValue(formValue.comments);
		comp.billStatusform.controls['comments'].setValue(formValue.description);
		comp.billStatusform.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(throwError('error') );
		comp.createBillStatusSubmit(formValue);
        fixture.detectChanges();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		comp.modalRef.close();
		debugger;
		expect(comp.loadSpin).toBeFalsy();
		expect(comp.disableBtn).toBeFalsy();
		
    }));
	it('Should createBillStatusSubmit Subscribe body test when status true', fakeAsync(() => {
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
		comp.billStatusform = billStatusFormSearch();
		comp.billStatusform.controls['name'].setValue(formValue.comments);
		comp.billStatusform.controls['comments'].setValue(formValue.description);
		comp.billStatusform.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.createBillStatusSubmit(formValue);
        fixture.detectChanges();
		expect(comp.loadSpin).toBeTruthy();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		comp.modalRef.close();
		expect(comp.loadSpin).toBeFalsy();
    }));
	it('Should billStatusSetPage function test', () => {
		spyOn(comp, 'addUrlQueryParams');
		spyOn(comp, 'displayBillStatusUpdated');
		spyOn(comp['billStatusSelection'], 'clear');
		comp.billStatusform = comp.billStatusFormSearch();
		const pageInfo = {
			offset: 0,
		};
		comp['billStatusPage'].pageNumber = pageInfo.offset;
		const pageNumber = comp['billStatusPage'].pageNumber + 1;
		comp.billStatusform.controls.name.setValue('Your name');
		comp.billStatusform.controls.comments.setValue('Your comments');
		comp.billStatusform.controls.description.setValue('Your description');
		const filters = checkReactiveFormIsEmpty(comp.billStatusform);
		comp['queryParams'] = {
			filter: !isObjectEmpty(filters),
			order: OrderEnum.ASC,
			per_page: comp['billStatusPage'].size || 10,
			page: pageNumber,
			pagination: true,
			order_by: 'name',
		};
		let queryparam = { per_page: comp['billStatusPage'].size, page: pageNumber };
		expect(comp['billStatusPage'].pageNumber).toBe(pageInfo.offset);
		// expect(comp['billStatusSelection'].clear).toHaveBeenCalled();
		const formValue: any = {
			comments: 'comments',
			description: 'description',
			name: 'name',
		};
		comp.billStatusform = billStatusFormSearch();
		comp.billStatusform.controls['name'].setValue(formValue.name);
		comp.billStatusform.controls['comments'].setValue(formValue.comments);
		comp.billStatusform.controls['description'].setValue(formValue.description);
		comp.billStatusSetPage(pageInfo);
		expect(comp.addUrlQueryParams).toHaveBeenCalled();
		expect(comp.displayBillStatusUpdated).toHaveBeenCalled();
	});
	it('Should displayBillStatusUpdated function test when subscribe throw error', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'desc',
			name: 'name',
		};
		comp.billStatusSerarchForm = billStatusFormSearch();
		comp.billStatusSerarchForm.controls['name'].setValue(formValue.comments);
		comp.billStatusSerarchForm.controls['comments'].setValue(formValue.description);
		comp.billStatusSerarchForm.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(throwError('error') );
		comp.displayBillStatusUpdated(formValue);
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
		comp.billStatusform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.billStatusform.markAsTouched();
		comp.billStatusform.markAsDirty();
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
		comp.billStatusform = comp['fb'].group({
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
		comp.billStatusform.markAsTouched();
		comp.billStatusform.markAsDirty();
		spyOn(comp.billStatusform,'reset');
        spyOn(canDeactive_MockService, 'canDeactivate').and.returnValue(of([]));
		comp.closeModel();
		comp.modalRef.close();
        expect(comp.billStatusform.reset).toHaveBeenCalled();
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
		comp.billStatusform = billStatusFormSearch();
		comp.billStatusform.controls['name'].setValue(formValue.comments);
		comp.billStatusform.controls['comments'].setValue(formValue.description);
		comp.billStatusform.controls['description'].setValue(formValue.name);
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
		spyOn(comp, 'billStatusFormSearch');
		// spyOn(comp, 'billStatusPage');
		spyOn(comp['fb'], 'group');
		// spyOn(comp['_route'].queryParams,'subscribe').and.returnValue(of([MockRowValue]));
		// spyOn(comp.subscription,'push').and.returnValue(of([MockRowValue]));

		comp.ngOnInit();
		tick();
		expect(comp.setTitle).toHaveBeenCalled();
		expect(comp['billStatusFormSearch']).toHaveBeenCalled();
		expect(comp['fb'].group).toHaveBeenCalled();
		expect(comp.subscription.push).toHaveBeenCalled();

	}));
	it('Should Test billStatusFormSearch', () => {
		spyOn(comp['fb'], 'group');
		comp.billStatusFormSearch();
		expect(comp['fb'].group).toHaveBeenCalled();
	});
	it('Should Test isBillStatusAllSelected', () => {
		comp.billStatusComingData.length = 10;
		comp.billStatusTotalRows = comp.billStatusComingData.length;
		comp['billStatusSelection'].selected.length = 10;
		comp.isBillStatusAllSelected();
		expect(comp.billStatusTotalRows).toBe(comp['billStatusSelection'].selected.length);
	});
	it('Should Test isBillStatusAllSelected', () => {
		comp.billStatusComingData.length = 10;
		comp.billStatusTotalRows = comp.billStatusComingData.length;
		comp['billStatusSelection'].selected.length = 10;
		comp.isBillStatusAllSelected();
		expect(comp.billStatusTotalRows).toBe(comp['billStatusSelection'].selected.length);
	});
	it('Should Test billStatusmasterToggle when isSelected True', () => {
		// spyOn(comp, 'isBillStatusAllSelected').and.returnValue(of(true));
		spyOn(comp['billStatusSelection'], 'clear');
		comp.billStatusmasterToggle();
		expect(comp.isBillStatusAllSelected).toHaveBeenCalled();
		expect(comp['billStatusSelection'].clear).toHaveBeenCalled();
	});
	it('Should Test billStatusmasterToggle when isSelected False', () => {
		spyOn(comp, 'isBillStatusAllSelected').and.returnValue(false);
		comp.billStatusTotalRows = 5;
		comp.billStatusmasterToggle();
		comp.billStatusComingData = [2];
		expect(comp.isBillStatusAllSelected).toHaveBeenCalled();
	});
	it('Should Test page limit function', () => {
		spyOn(comp, 'billStatusSetPage');
		comp.billStatusPageLimit('3');
		expect(comp.billStatusSetPage).toHaveBeenCalled();
		expect(comp['billStatusPage'].size).toBe(3);
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
		comp.billStatusform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.billStatusComingData = mockPlaceOfServiceList;
		comp.patchEditValues(MockRowValue, MockRowIndex);
		expect(comp.modelSubmit).toBe('Update');
		expect(comp.modelTitle).toBe('Edit');
	});
	it('Should Test patchAddValues', () => {
		comp.billStatusform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			code: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		spyOn(comp.billStatusform, 'reset');
		comp.patchAddValues();
		expect(comp.billStatusform.reset).toHaveBeenCalled();
		expect(comp.modelSubmit).toContain('Save & Continue');
		expect(comp.modelTitle).toContain('Add');
	});
	it('Should check Reset Button when billStatusSerarchForm From Empty function Test', () => {
		comp.billStatusSerarchForm = comp.billStatusFormSearch();
		const retrunValue = isEmptyObject(comp.billStatusSerarchForm.value);
		comp.checkInputs();
		expect(retrunValue).toBe(true);
	});
	it('Should check Reset Button disabled when billStatusSerarchForm have values function Test', () => {
		comp.billStatusSerarchForm = comp.billStatusFormSearch();
		comp.billStatusSerarchForm.controls.name.setValue('mock name');
		comp.billStatusSerarchForm.controls.comments.setValue('mock comments');
		comp.billStatusSerarchForm.controls.description.setValue('mock description');
		const retrunValue = isEmptyObject(comp.billStatusSerarchForm.value);
		comp.checkInputs();
		expect(retrunValue).toBe(false);
	});
	it('Should Test stringfy function which convert object', () => {
		const obj = comp.stringfy({ name: 'name mock' });
		expect(obj).toContain('{"name":"name mock"}');
	});
	it('Should Test closeModel when billStatusform dirty and touched false', fakeAsync(() => {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('paymentType', ngbModalOptions);
		comp.billStatusform = comp['fb'].group({
			name: ['name'],
			comments: ['comment'],
			description: ['desc'],
		});
		spyOn(comp.billStatusform,'reset');
		comp.billStatusform.reset();
		comp.closeModel();
		comp.modalRef.close();
		expect(comp.billStatusform.reset).toHaveBeenCalled();
	}));
	it('Should Test closeModel when billStatusform dirty and touched true', fakeAsync(() => {
		// const spyOnMethod = spyOn(comp['CanDeactivateService'], 'canDeactivate').and.returnValue(of([]));
		const subspy = spyOn(canDeactive_MockService.canDeactivate(), 'subscribe');
		comp.billStatusform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.billStatusform.markAsTouched();
		comp.billStatusform.markAsDirty();
		comp.closeModel();
		tick();
		// expect(spyOnMethod).toHaveBeenCalledBefore(subspy);
		expect(subspy).toHaveBeenCalled();
	}));
	it('Should Test closeModel when billStatusform dirty and touched true and subcribe throw error', fakeAsync(() => {
		// const spyOnMethod = spyOn(comp['CanDeactivateService'], 'canDeactivate').and.returnValue(of([]));
		const subspy = spyOn(canDeactive_MockService.canDeactivate(false), 'subscribe');
		comp.billStatusform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.billStatusform.markAsTouched();
		comp.billStatusform.markAsDirty();
		comp.closeModel();
		tick();
		// expect(spyOnMethod).toHaveBeenCalledBefore(subspy);
		expect(subspy).toHaveBeenCalled();
	}));
	it('Should displayBillStatusUpdated with billStatusComingData empty', fakeAsync(() => {
		const formValue: any = {
			comments: 'comments',
			description: 'description',
			name: 'name',
			status:true,
			comingData:[]
		};
		comp.billStatusSerarchForm = billStatusFormSearch();
		comp.billStatusSerarchForm.controls['name'].setValue(formValue.comments);
		comp.billStatusSerarchForm.controls['comments'].setValue(formValue.description);
		comp.billStatusSerarchForm.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.displayBillStatusUpdated(formValue);
        fixture.detectChanges();
		expect(comp.loadSpin).toBeTruthy();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		expect(comp.billStatusComingData.length).toBe(0);
		expect(comp['billStatusPage'].totalElements).toBe(0);
    }));
	it('Should Test billStatusReset function',()=>{
		spyOn(comp,'billStatusSetPage');
		spyOn(comp['fb'],'group');
		comp.billStatusSerarchForm = comp.billStatusFormSearch();
		comp.billStatusReset();
		expect(comp.billStatusSetPage).toHaveBeenCalled();
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
		comp.billStatusform = comp.billStatusFormSearch();
		comp.billStatusform.controls.name.setValue('mock name');
		comp.billStatusform.controls.comments.setValue('mock comments');
		comp.billStatusform.controls.description.setValue('mock description');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.updateDeniatSubmit(comp.billStatusform);
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
		comp.modalRef = comp['modalService'].open('paymentType', ngbModalOptions);
		comp.billStatusform = comp.billStatusFormSearch();
		comp.billStatusform.controls.name.setValue('mock name');
		comp.billStatusform.controls.comments.setValue('mock comments');
		comp.billStatusform.controls.description.setValue('mock description');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.updateDeniatSubmit(comp.billStatusform);
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
	it('Should Test onSaveDeniatSubmit function',()=>{
		spyOn(comp,'createBillStatusSubmit');
		comp.billStatusSerarchForm = comp.billStatusFormSearch();
		comp.billStatusSerarchForm.controls.name.setValue('mock name');
		comp.billStatusSerarchForm.controls.comments.setValue('mock comments');
		comp.billStatusSerarchForm.controls.description.setValue('mock description');
		comp.onSaveDeniatSubmit(comp.billStatusSerarchForm.value);
		comp.modelTitle = 'Add';
		expect(comp.createBillStatusSubmit).toHaveBeenCalled();
	});
	it('Should Test onSaveDeniatSubmit function without Add',()=>{
		spyOn(comp,'updateDeniatSubmit');
		comp.billStatusSerarchForm = comp.billStatusFormSearch();
		comp.billStatusSerarchForm.controls.name.setValue('mock name');
		comp.billStatusSerarchForm.controls.comments.setValue('mock comments');
		comp.billStatusSerarchForm.controls.description.setValue('mock description');
		comp.modelTitle = 'Edit';
		comp.onSaveDeniatSubmit(comp.billStatusSerarchForm.value);
		expect(comp.updateDeniatSubmit).toHaveBeenCalled();
	});
	it('Should Test openBillStatusModal function',()=>{
		spyOn(comp,'patchAddValues');
		comp.billStatusSerarchForm = comp.billStatusFormSearch();
		comp.billStatusSerarchForm.controls.name.setValue('mock name');
		comp.billStatusSerarchForm.controls.comments.setValue('mock comments');
		comp.billStatusSerarchForm.controls.description.setValue('mock description');
		comp.openBillStatusModal(undefined,undefined,undefined);
		expect(comp.patchAddValues).toHaveBeenCalled();
	});
	it('Should Test openBillStatusModal function with row not undefined',()=>{
		spyOn(comp,'patchEditValues');
		comp.billStatusSerarchForm = comp.billStatusFormSearch();
		comp.billStatusSerarchForm.controls.name.setValue('mock name');
		comp.billStatusSerarchForm.controls.comments.setValue('mock comments');
		comp.billStatusSerarchForm.controls.description.setValue('mock description');
		comp.openBillStatusModal(undefined,comp.billStatusSerarchForm.value,3);
		expect(comp.patchEditValues).toHaveBeenCalled();
	});
	it('Should Test openBillStatusModal function with row null',()=>{
		spyOn(comp,'patchAddValues');
		comp.billStatusSerarchForm = comp.billStatusFormSearch();
		comp.billStatusSerarchForm.controls.name.setValue('mock name');
		comp.billStatusSerarchForm.controls.comments.setValue('mock comments');
		comp.billStatusSerarchForm.controls.description.setValue('mock description');
		comp.openBillStatusModal(undefined,null,3);
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
