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
import { PaidByComponent } from './paid-by.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
describe('PaidByComponent', () => {
	let comp: PaidByComponent;
	let fixture: ComponentFixture<PaidByComponent>;
	let canDeactive_MockService = new CanDeactiveMockService();
	let request_MockService = new RequestMockService();
	let mockPaidByList = [
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
			declarations: [PaidByComponent],
			imports: [ToastrModule.forRoot(), SharedModule, RouterTestingModule,BrowserAnimationsModule,HttpClientTestingModule ],
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
		fixture = TestBed.createComponent(PaidByComponent);
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
	function initializePaidSearch(): FormGroup {
		return comp['fb'].group({
			name: [''],
			comments: [''],
			description: [''],
		});
	}
	it('should form valid on empty', async(() => {
		const form = initializePaidSearch();
		form.controls['name'].setValue('');
		form.controls['comments'].setValue('');
		form.controls['description'].setValue('');
		expect(form.valid).toBeTruthy();
	}));
	it('Should onCreatePaidSubmit', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'description',
			name: 'name',
			status:true
		};
		const spyOnMethod = spyOn(comp['requestService'], 'sendRequest').and.returnValue(of(formValue));
		const subspy = spyOn(request_MockService.sendRequest(), 'subscribe');
		comp.paidForm = initializePaidSearch();
		comp.paidForm.controls['name'].setValue(formValue.name);
		comp.paidForm.controls['comments'].setValue(formValue.comments);
		comp.paidForm.controls['description'].setValue(formValue.description);

		comp.onCreatePaidSubmit(comp.paidForm.value);
		tick(15000);
		discardPeriodicTasks();
		debugger;

		expect(comp.loadSpin).toBeTruthy();
		expect(spyOnMethod).toHaveBeenCalledBefore(subspy);
		expect(subspy).toHaveBeenCalled();
	}));
	it('Should onCreatePaidSubmit function test when onCreatePaidSubmit complete', () => {
		const formValue: any = {
			comments: 'comment',
			description: 'desc',
			name: 'name',
		};
		comp.paidForm = initializePaidSearch();
		comp.paidForm.controls['name'].setValue(formValue.comments);
		comp.paidForm.controls['comments'].setValue(formValue.description);
		comp.paidForm.controls['description'].setValue(formValue.name);
        // spyOn(request_MockService, 'sendRequest').and.returnValue(throwError('error') );
		
		
		comp.onCreatePaidSubmit(formValue);
		fixture.detectChanges();
		
        // expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp.loadSpin).toBeTruthy();
	});
	it('Should onCreatePaidSubmit Subscribe body test when status true', fakeAsync(() => {
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
		comp.paidForm = initializePaidSearch();
		comp.paidForm.controls['name'].setValue(formValue.comments);
		comp.paidForm.controls['comments'].setValue(formValue.description);
		comp.paidForm.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.onCreatePaidSubmit(formValue);
        fixture.detectChanges();
		expect(comp.loadSpin).toBeTruthy();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		comp.modalRef.close();
		expect(comp.loadSpin).toBeFalsy();
    }));
	it('Should paidSetPage function test', () => {
		spyOn(comp, 'addUrlQueryParams');
		spyOn(comp, 'displayUpdatedPaid');
		spyOn(comp['paidSelection'], 'clear');
		comp.paidForm = comp.initializePaidSearch();
		const pageInfo = {
			offset: 0,
		};
		comp['paidPage'].pageNumber = pageInfo.offset;
		const pageNumber = comp['paidPage'].pageNumber + 1;
		comp.paidForm.controls.name.setValue('Your name');
		comp.paidForm.controls.comments.setValue('Your comments');
		comp.paidForm.controls.description.setValue('Your description');
		const filters = checkReactiveFormIsEmpty(comp.paidForm);
		comp['queryParams'] = {
			filter: !isObjectEmpty(filters),
			order: OrderEnum.ASC,
			per_page: comp['paidPage'].size || 10,
			page: pageNumber,
			pagination: true,
			order_by: 'name',
		};
		let queryparam = { per_page: comp['paidPage'].size, page: pageNumber };
		expect(comp['paidPage'].pageNumber).toBe(pageInfo.offset);
		// expect(comp['paidSelection'].clear).toHaveBeenCalled();
		const formValue: any = {
			comments: 'comments',
			description: 'description',
			name: 'name',
		};
		comp.paidForm = initializePaidSearch();
		comp.paidForm.controls['name'].setValue(formValue.name);
		comp.paidForm.controls['comments'].setValue(formValue.comments);
		comp.paidForm.controls['description'].setValue(formValue.description);
		comp.paidSetPage(pageInfo);
		expect(comp.addUrlQueryParams).toHaveBeenCalled();
		expect(comp.displayUpdatedPaid).toHaveBeenCalled();
	});
	it('Should displayUpdatedPaid function test when subscribe throw error', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'desc',
			name: 'name',
		};
		comp.paidSearchForm = initializePaidSearch();
		comp.paidSearchForm.controls['name'].setValue(formValue.comments);
		comp.paidSearchForm.controls['comments'].setValue(formValue.description);
		comp.paidSearchForm.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(throwError('error') );
		comp.displayUpdatedPaid(formValue);
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
		comp.paidForm = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.paidForm.markAsTouched();
		comp.paidForm.markAsDirty();
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
		comp.paidForm = comp['fb'].group({
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
		comp.paidForm.markAsTouched();
		comp.paidForm.markAsDirty();
		spyOn(comp.paidForm,'reset');
        spyOn(canDeactive_MockService, 'canDeactivate').and.returnValue(of([]));
		comp.closeModel();
		comp.modalRef.close();
        expect(comp.paidForm.reset).toHaveBeenCalled();
	}));
	it('Should updateEditPaidSubmit function test when subscribe throw error', fakeAsync(() => {
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
		comp.paidForm = initializePaidSearch();
		comp.paidForm.controls['name'].setValue(formValue.comments);
		comp.paidForm.controls['comments'].setValue(formValue.description);
		comp.paidForm.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(throwError('error') );
		comp.updateEditPaidSubmit(formValue);
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
		spyOn(comp, 'initializePaidSearch');
		// spyOn(comp, 'paidPage');
		// spyOn(comp['fb'], 'group');
		// spyOn(comp['_route'].queryParams,'subscribe').and.returnValue(of([MockRowValue]));
		// spyOn(comp.subscription,'push').and.returnValue(of([MockRowValue]));

		comp.ngOnInit();
		tick();
		expect(comp.setTitle).toHaveBeenCalled();
		expect(comp['initializePaidSearch']).toHaveBeenCalled();
		expect(comp['fb'].group).toHaveBeenCalled();
		expect(comp.subscription.push).toHaveBeenCalled();

	}));
	it('Should Test initializePaidSearch', () => {
		spyOn(comp['fb'], 'group');
		comp.initializePaidSearch();
		expect(comp['fb'].group).toHaveBeenCalled();
	});
	it('Should Test isPaidAllSelected', () => {
		comp.paidComingData.length = 10;
		comp.paidTotalRows = comp.paidComingData.length;
		comp['paidSelection'].selected.length = 10;
		comp.isPaidAllSelected();
		expect(comp.paidTotalRows).toBe(comp['paidSelection'].selected.length);
	});
	it('Should Test isPaidAllSelected', () => {
		comp.paidComingData.length = 10;
		comp.paidTotalRows = comp.paidComingData.length;
		comp['paidSelection'].selected.length = 10;
		comp.isPaidAllSelected();
		expect(comp.paidTotalRows).toBe(comp['paidSelection'].selected.length);
	});
	it('Should Test PaidmasterToggle when isSelected True', () => {
		// spyOn(comp, 'isPaidAllSelected').and.returnValue(of(true));
		spyOn(comp['paidSelection'], 'clear');
		comp.PaidmasterToggle();
		expect(comp.isPaidAllSelected).toHaveBeenCalled();
		expect(comp['paidSelection'].clear).toHaveBeenCalled();
	});
	it('Should Test PaidmasterToggle when isSelected False', () => {
		spyOn(comp, 'isPaidAllSelected').and.returnValue(false);
		comp.paidTotalRows = 5;
		comp.PaidmasterToggle();
		comp.paidComingData = [2];
		expect(comp.isPaidAllSelected).toHaveBeenCalled();
	});
	it('Should Test page limit function', () => {
		spyOn(comp, 'paidSetPage');
		comp.paidPageLimit('3');
		expect(comp.paidSetPage).toHaveBeenCalled();
		expect(comp['paidPage'].size).toBe(3);
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
		comp.paidForm = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.paidComingData = mockPaidByList;
		comp.patchEditValues(MockRowValue, MockRowIndex);
		expect(comp.modelSubmit).toBe('Update');
		expect(comp.modelTitle).toBe('Edit');
	});
	it('Should Test patchAddValues', () => {
		comp.paidForm = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		spyOn(comp.paidForm, 'reset');
		comp.patchAddValues();
		expect(comp.paidForm.reset).toHaveBeenCalled();
		expect(comp.modelSubmit).toContain('Save & Continue');
		expect(comp.modelTitle).toContain('Add');
	});
	it('Should check Reset Button when paidSearchForm From Empty function Test', () => {
		comp.paidSearchForm = comp.initializePaidSearch();
		const retrunValue = isEmptyObject(comp.paidSearchForm.value);
		comp.checkInputs();
		expect(retrunValue).toBe(true);
	});
	it('Should check Reset Button disabled when paidSearchForm have values function Test', () => {
		comp.paidSearchForm = comp.initializePaidSearch();
		comp.paidSearchForm.controls.name.setValue('mock name');
		comp.paidSearchForm.controls.comments.setValue('mock comments');
		comp.paidSearchForm.controls.description.setValue('mock description');
		const retrunValue = isEmptyObject(comp.paidSearchForm.value);
		comp.checkInputs();
		expect(retrunValue).toBe(false);
	});
	it('Should Test stringfy function which convert object', () => {
		const obj = comp.stringfy({ name: 'name mock' });
		expect(obj).toContain('{"name":"name mock"}');
	});
	it('Should Test closeModel when paidForm dirty and touched false', fakeAsync(() => {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('paymentType', ngbModalOptions);
		comp.paidForm = comp['fb'].group({
			name: ['name'],
			comments: ['comment'],
			description: ['desc'],
		});
		spyOn(comp.paidForm,'reset');
		comp.paidForm.reset();
		comp.closeModel();
		comp.modalRef.close();
		expect(comp.paidForm.reset).toHaveBeenCalled();
	}));
	it('Should Test closeModel when paidForm dirty and touched true', fakeAsync(() => {
		// const spyOnMethod = spyOn(comp['CanDeactivateModelComponentService'], 'canDeactivate').and.returnValue(of([]));
		const subspy = spyOn(canDeactive_MockService.canDeactivate(), 'subscribe');
		comp.paidForm = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.paidForm.markAsTouched();
		comp.paidForm.markAsDirty();
		comp.closeModel();
		tick();
		// expect(spyOnMethod).toHaveBeenCalledBefore(subspy);
		expect(subspy).toHaveBeenCalled();
	}));
	it('Should Test closeModel when paidForm dirty and touched true and subcribe throw error', fakeAsync(() => {
		// const spyOnMethod = spyOn(comp['CanDeactivateModelComponentService'], 'canDeactivate').and.returnValue(of([]));
		const subspy = spyOn(canDeactive_MockService.canDeactivate(false), 'subscribe');
		comp.paidForm = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.paidForm.markAsTouched();
		comp.paidForm.markAsDirty();
		comp.closeModel();
		tick();
		// expect(spyOnMethod).toHaveBeenCalledBefore(subspy);
		expect(subspy).toHaveBeenCalled();
	}));
	it('Should displayUpdatedPaid with paidComingData empty', fakeAsync(() => {
		const formValue: any = {
			comments: 'comments',
			description: 'description',
			name: 'name',
			status:true,
			comingData:[]
		};
		comp.paidSearchForm = initializePaidSearch();
		comp.paidSearchForm.controls['name'].setValue(formValue.comments);
		comp.paidSearchForm.controls['comments'].setValue(formValue.description);
		comp.paidSearchForm.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.displayUpdatedPaid(formValue);
        fixture.detectChanges();
		expect(comp.loadSpin).toBeTruthy();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		expect(comp.paidComingData.length).toBe(0);
		expect(comp['paidPage'].totalElements).toBe(0);
    }));
	it('Should Test resetPaid function',()=>{
		spyOn(comp,'paidSetPage');
		spyOn(comp['fb'],'group');
		comp.paidSearchForm = comp.initializePaidSearch();
		comp.resetPaid();
		expect(comp.paidSetPage).toHaveBeenCalled();
		expect(comp['fb'].group).toHaveBeenCalled();
	});
	it('Should Test updateEditPaidSubmit function when subsribe run successfull',fakeAsync(()=>{
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
		comp.paidForm = comp.initializePaidSearch();
		comp.paidForm.controls.name.setValue('mock name');
		comp.paidForm.controls.comments.setValue('mock comments');
		comp.paidForm.controls.description.setValue('mock description');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.updateEditPaidSubmit(comp.paidForm);
        fixture.detectChanges();
		expect(comp.loadSpin).toBeTruthy();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		comp.modalRef.close();
		expect(comp.loadSpin).toBeFalsy();
	}));
	it('Should Test updateEditPaidSubmit function when subsribe run successfull and status false',fakeAsync(()=>{
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
		comp.paidForm = comp.initializePaidSearch();
		comp.paidForm.controls.name.setValue('mock name');
		comp.paidForm.controls.comments.setValue('mock comments');
		comp.paidForm.controls.description.setValue('mock description');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.updateEditPaidSubmit(comp.paidForm);
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
	it('Should Test onPaidSubmit function',()=>{
		spyOn(comp,'onCreatePaidSubmit');
		comp.paidSearchForm = comp.initializePaidSearch();
		comp.paidSearchForm.controls.name.setValue('mock name');
		comp.paidSearchForm.controls.comments.setValue('mock comments');
		comp.paidSearchForm.controls.description.setValue('mock description');
		comp.onPaidSubmit(comp.paidSearchForm.value);
		comp.modelTitle = 'Add';
		expect(comp.onCreatePaidSubmit).toHaveBeenCalled();
	});
	it('Should Test onPaidSubmit function without Add',()=>{
		spyOn(comp,'updateEditPaidSubmit');
		comp.paidSearchForm = comp.initializePaidSearch();
		comp.paidSearchForm.controls.name.setValue('mock name');
		comp.paidSearchForm.controls.comments.setValue('mock comments');
		comp.paidSearchForm.controls.description.setValue('mock description');
		comp.modelTitle = 'Edit';
		comp.onPaidSubmit(comp.paidSearchForm.value);
		expect(comp.updateEditPaidSubmit).toHaveBeenCalled();
	});
	it('Should Test paidOpenModal function',()=>{
		spyOn(comp,'patchAddValues');
		comp.paidSearchForm = comp.initializePaidSearch();
		comp.paidSearchForm.controls.name.setValue('mock name');
		comp.paidSearchForm.controls.comments.setValue('mock comments');
		comp.paidSearchForm.controls.description.setValue('mock description');
		comp.paidOpenModal(undefined,undefined,undefined);
		expect(comp.patchAddValues).toHaveBeenCalled();
	});
	it('Should Test paidOpenModal function with row not undefined',()=>{
		spyOn(comp,'patchEditValues');
		comp.paidSearchForm = comp.initializePaidSearch();
		comp.paidSearchForm.controls.name.setValue('mock name');
		comp.paidSearchForm.controls.comments.setValue('mock comments');
		comp.paidSearchForm.controls.description.setValue('mock description');
		comp.paidOpenModal(undefined,comp.paidSearchForm.value,3);
		expect(comp.patchEditValues).toHaveBeenCalled();
	});
	it('Should Test paidOpenModal function with row null',()=>{
		spyOn(comp,'patchAddValues');
		comp.paidSearchForm = comp.initializePaidSearch();
		comp.paidSearchForm.controls.name.setValue('mock name');
		comp.paidSearchForm.controls.comments.setValue('mock comments');
		comp.paidSearchForm.controls.description.setValue('mock description');
		comp.paidOpenModal(undefined,null,3);
		expect(comp.patchAddValues).toHaveBeenCalled();
	});
	it('Should Paidstringfy Test which return json stringify',()=>{
		const formValue: any = {
			comments: 'comments',
			description: 'description',
			name: 'name',
			status:true,
			result:[]
		};
		let JSON_String = comp.Paidstringfy(formValue);
		expect(JSON_String).toEqual(JSON.stringify(formValue));
	});
	afterAll(() => {
		TestBed.resetTestingModule();
	  });
});
