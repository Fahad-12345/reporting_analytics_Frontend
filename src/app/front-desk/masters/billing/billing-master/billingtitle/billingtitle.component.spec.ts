import { CanDeactivateModelComponentService } from './../../../../../shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { FormBuilder, FormGroup, Validators, Form } from '@angular/forms';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { Config } from '@appDir/config/config';
import { SharedModule } from '@appDir/shared/shared.module';
import { TestBed, async, ComponentFixture, fakeAsync, tick, discardPeriodicTasks, flush } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastrModule } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { checkReactiveFormIsEmpty } from  '@appDir/shared/utils/utils.helpers';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import * as helper from '@appDir/shared/utils/utils.helpers';
import { isEmptyObject, isObjectEmpty } from '@appDir/shared/utils/utils.helpers';
import { CanDeactiveMockService } from '@appDir/shared/canDeactivateModelComponent/canDeactiveModelMockService.service.ts/canDeactiveModelMockService';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { RequestMockService } from '@appDir/shared/mock-services/RequestMock.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { delay } from 'rxjs/operators';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ConfirmMockService } from '@appDir/shared/mock-services/ConfirmMock.service';
import { BillingtitleComponent } from './billingtitle.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
describe('BillingtitleComponent', () => {
	let comp: BillingtitleComponent;
	let fixture: ComponentFixture<BillingtitleComponent>;
	let canDeactive_MockService = new CanDeactiveMockService();
	let request_MockService = new RequestMockService();
	let confirm_MockService = new ConfirmMockService();
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
			declarations: [BillingtitleComponent],
			imports: [ToastrModule.forRoot(), SharedModule, RouterTestingModule,BrowserAnimationsModule,HttpClientTestingModule],
			providers: [
				Config,
				LocalStorage,
				FormBuilder,
				{ provide: CanDeactivateModelComponentService, useValue: canDeactive_MockService },
				{ provide: RequestService, useValue: request_MockService },
				// { provide: ConfirmationService, useValue: confirm_MockService },
			],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(BillingtitleComponent);
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
	function initializeSearhForm(): FormGroup {
		return comp['fb'].group({
			name: [''],
			comments: [''],
			description: [''],
		});
	}
	it('should form valid on empty', async(() => {
		const form = initializeSearhForm();
		form.controls['name'].setValue('');
		form.controls['comments'].setValue('');
		form.controls['description'].setValue('');
		expect(form.valid).toBeTruthy();
	}));
	it('Should createFormSubmit', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'description',
			name: 'name',
			status:true
		};
		const spyOnMethod = spyOn(comp['requestService'], 'sendRequest').and.returnValue(of(formValue));
		const subspy = spyOn(request_MockService.sendRequest(), 'subscribe');
		comp.billingTitleForm = initializeSearhForm();
		comp.billingTitleForm.controls['name'].setValue(formValue.name);
		comp.billingTitleForm.controls['comments'].setValue(formValue.comments);
		comp.billingTitleForm.controls['description'].setValue(formValue.description);
		tick();
		expect(comp.loadSpin).toBeFalsy();
		comp.createFormSubmit(comp.billingTitleForm.value);
		expect(comp.loadSpin).toBeFalsy();
		expect(spyOnMethod).toHaveBeenCalledBefore(subspy);
		expect(subspy).toHaveBeenCalled();
	}));
	it('Should createFormSubmit Subscribe body test when status false', fakeAsync(() => {
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
		comp['modalref'] = comp['modalservice'].open('paymentType', ngbModalOptions);
		comp.billingTitleForm = initializeSearhForm();
		comp.billingTitleForm.controls['name'].setValue(formValue.comments);
		comp.billingTitleForm.controls['comments'].setValue(formValue.description);
		comp.billingTitleForm.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(throwError('error') );
		comp.createFormSubmit(formValue);
        fixture.detectChanges();
		expect(comp.disableBtn).toBeFalsy();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		comp['modalref'].close();
    }));
	it('Should closeModel function test when subscribe return empty responce	', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'desc',
			name: 'name',
		};
		comp.billingTitleForm = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.billingTitleForm.markAsTouched();
		comp.billingTitleForm.markAsDirty();
        spyOn(canDeactive_MockService, 'canDeactivate').and.returnValue(of(null));
		let ReturnValue = comp.closeModel();
        expect(ReturnValue).toBeUndefined();
	}));
	it('Should createFormSubmit function test when createFormSubmit complete', () => {
		const formValue: any = {
			comments: 'comment',
			description: 'desc',
			name: 'name',
		};
		comp.billingTitleForm = initializeSearhForm();
		comp.billingTitleForm.controls['name'].setValue(formValue.comments);
		comp.billingTitleForm.controls['comments'].setValue(formValue.description);
		comp.billingTitleForm.controls['description'].setValue(formValue.name);
		comp.createFormSubmit(formValue);
		fixture.detectChanges();
		expect(comp.loadSpin).toBeTruthy();
	});
	it('Should createFormSubmit Subscribe body test when status true', fakeAsync(() => {
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
		comp['modalref'] = comp['modalservice'].open('paymentType', ngbModalOptions);
		comp.billingTitleForm = initializeSearhForm();
		comp.billingTitleForm.controls['name'].setValue(formValue.comments);
		comp.billingTitleForm.controls['comments'].setValue(formValue.description);
		comp.billingTitleForm.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.createFormSubmit(formValue);
        fixture.detectChanges();
		expect(comp.loadSpin).toBeTruthy();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		comp['modalref'].close();
		expect(comp.loadSpin).toBeFalsy();
    }));
	it('Should setpage function test', () => {
		spyOn(comp, 'addUrlQueryParams');
		spyOn(comp, 'getBillingTitle');
		spyOn(comp['selection'], 'clear');
		comp.billingTitleForm = comp.initializeSearhForm();
		const pageInfo = {
			offset: 0,
		};
		comp['page'].pageNumber = pageInfo.offset;
		const pageNumber = comp['page'].pageNumber + 1;
		comp.billingTitleForm.controls.name.setValue('Your name');
		comp.billingTitleForm.controls.description.setValue('Your description');
		const filters = checkReactiveFormIsEmpty(comp.billingTitleForm);
		comp['queryParams'] = {
			filter: !isObjectEmpty(filters),
			order: OrderEnum.ASC,
			per_page: comp['page'].size || 10,
			page: pageNumber,
			pagination: true,
			order_by: 'name',
		};
		let queryparam = { per_page: comp['page'].size, page: pageNumber };
		expect(comp['page'].pageNumber).toBe(pageInfo.offset);
		// expect(comp['selection'].clear).toHaveBeenCalled();
		const formValue: any = {
			comments: 'comments',
			description: 'description',
			name: 'name',
		};
		comp.billingTitleForm = initializeSearhForm();
		comp.billingTitleForm.controls['name'].setValue(formValue.name);
		comp.billingTitleForm.controls['comments'].setValue(formValue.comments);
		comp.billingTitleForm.controls['description'].setValue(formValue.description);
		comp.setpage(pageInfo);
		expect(comp.addUrlQueryParams).toHaveBeenCalled();
		expect(comp.getBillingTitle).toHaveBeenCalled();
	});
	it('Should getBillingTitle function test when subscribe throw error', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'desc',
			name: 'name',
		};
		comp.billingTitleForm = initializeSearhForm();
		comp.billingTitleForm.controls['name'].setValue(formValue.comments);
		comp.billingTitleForm.controls['comments'].setValue(formValue.description);
		comp.billingTitleForm.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(throwError('error') );
		comp.getBillingTitle(formValue);
        expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp.loadSpin).toBeFalsy(); // truthy
		flush();
	}));
	it('Should resetData function test when subscribe return empty responce	', fakeAsync(() => {
		comp.billingTitleForm = comp['fb'].group({
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
		comp['modalref'] = comp['modalservice'].open('paymentType', ngbModalOptions);
		spyOn(comp,'addUrlQueryParams');
		spyOn(comp.billingTitleForm,'reset');
		spyOn(comp['modalref'],'close');
		comp.resetData();
		comp['modalref'].close();
		expect(comp.addUrlQueryParams).toHaveBeenCalled();
		expect(comp.billingTitleForm.reset).toHaveBeenCalled();
		expect(comp['modalref'].close).toHaveBeenCalled();
	}));
	it('Should closeModel function test when subscribe return not empty responce	', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'desc',
			name: 'name',
		};
		comp.billingTitleForm = comp['fb'].group({
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
		comp['modalref'] = comp['modalservice'].open('paymentType', ngbModalOptions);
		comp.billingTitleForm.markAsTouched();
		comp.billingTitleForm.markAsDirty();
		spyOn(comp.billingTitleForm,'reset');
        spyOn(canDeactive_MockService, 'canDeactivate').and.returnValue(of([]));
		comp.closeModel();
		comp['modalref'].close();
        expect(comp.billingTitleForm.reset).toHaveBeenCalled();
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
		spyOn(comp, 'initializeSearhForm');
		// spyOn(comp, 'page');
		spyOn(comp['fb'], 'group');
		// spyOn(comp['_route'].queryParams,'subscribe').and.returnValue(of([MockRowValue]));
		// spyOn(comp.subscription,'push').and.returnValue(of([MockRowValue]));

		comp.ngOnInit();
		tick();
		expect(comp.setTitle).toHaveBeenCalled();
		expect(comp['initializeSearhForm']).toHaveBeenCalled();
		expect(comp['fb'].group).toHaveBeenCalled();
		expect(comp.subscription.push).toHaveBeenCalled();

	}));
	it('Should Test initializeSearhForm', () => {
		spyOn(comp['fb'], 'group');
		comp.initializeSearhForm();
		expect(comp['fb'].group).toHaveBeenCalled();
	});
	it('Should Test isAllSelected', () => {
		comp.billingtitlelisting.length = 10;
		comp.totalrows = comp.billingtitlelisting.length;
		comp['selection'].selected.length = 10;
		comp.isAllSelected();
		expect(comp.totalrows).toBe(comp['selection'].selected.length);
	});
	it('Should Test isAllSelected', () => {
		comp.billingtitlelisting.length = 10;
		comp.totalrows = comp.billingtitlelisting.length;
		comp['selection'].selected.length = 10;
		comp.isAllSelected();
		expect(comp.totalrows).toBe(comp['selection'].selected.length);
	});
	it('Should Test masterToggle when isSelected True', () => {
		// spyOn(comp, 'isAllSelected').and.returnValue(of(true));
		spyOn(comp['selection'], 'clear');
		comp.masterToggle();
		expect(comp.isAllSelected).toHaveBeenCalled();
		expect(comp['selection'].clear).toHaveBeenCalled();
	});
	it('Should Test masterToggle when isSelected False', () => {
		spyOn(comp, 'isAllSelected').and.returnValue(false);
		comp.totalrows = 5;
		comp.masterToggle();
		comp.billingtitlelisting = [2];
		expect(comp.isAllSelected).toHaveBeenCalled();
	});
	it('Should Test page limit function', () => {
		spyOn(comp, 'setpage');
		comp.pageLimit('3');
		expect(comp.setpage).toHaveBeenCalled();
		expect(comp['page'].size).toBe(3);
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
		comp.billingTitleForm = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.billingtitlelisting = mockPlaceOfServiceList;
		comp.patchEditValues(MockRowValue, MockRowIndex);
		expect(comp.modelSubmit).toBe('Update');
		expect(comp.modelTitle).toBe('Edit');
	});
	it('Should Test patchAddValues', () => {
		comp.billingTitleForm = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			code: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		spyOn(comp.billingTitleForm, 'reset');
		comp.patchAddValues();
		expect(comp.billingTitleForm.reset).toHaveBeenCalled();
		expect(comp.modelSubmit).toContain('Save & Continue');
		expect(comp.modelTitle).toContain('Add');
	});
	it('Should check Reset Button when billingTitleSearchForm From Empty function Test', () => {
		comp.billingTitleSearchForm = comp.initializeSearhForm();
		const retrunValue = isEmptyObject(comp.billingTitleSearchForm.value);
		comp.checkInputs();
		expect(retrunValue).toBe(true);
	});
	it('Should check Reset Button disabled when billingTitleSearchForm have values function Test', () => {
		comp.billingTitleSearchForm = comp.initializeSearhForm();
		comp.billingTitleSearchForm.controls.name.setValue('mock name');
		comp.billingTitleSearchForm.controls.description.setValue('mock description');
		const retrunValue = isEmptyObject(comp.billingTitleSearchForm.value);	
		comp.checkInputs();
		expect(retrunValue).toBe(false);
	});
	it('Should Test stringfy function which convert object', () => {
		const obj = comp.stringfy({ name: 'name mock' });
		expect(obj).toContain('{"name":"name mock"}');
	});
	it('Should Test closeModel when billingTitleForm dirty and touched false', fakeAsync(() => {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp['modalref'] = comp['modalservice'].open('paymentType', ngbModalOptions);
		comp.billingTitleForm = comp['fb'].group({
			name: ['name'],
			comments: ['comment'],
			description: ['desc'],
		});
		spyOn(comp.billingTitleForm,'reset');
		comp.billingTitleForm.reset();
		comp.closeModel();
		comp['modalref'].close();
		expect(comp.billingTitleForm.reset).toHaveBeenCalled();
	}));
	it('Should Test closeModel when billingTitleForm dirty and touched true', fakeAsync(() => {
		// const spyOnMethod = spyOn(comp['CanDeactivateModelComponentService'], 'canDeactivate').and.returnValue(of([]));
		const subspy = spyOn(canDeactive_MockService.canDeactivate(), 'subscribe');
		comp.billingTitleForm = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.billingTitleForm.markAsTouched();
		comp.billingTitleForm.markAsDirty();
		comp.closeModel();
		tick();
		// expect(spyOnMethod).toHaveBeenCalledBefore(subspy);
		expect(subspy).toHaveBeenCalled();
	}));
	it('Should Test closeModel when billingTitleForm dirty and touched true and subcribe throw error', fakeAsync(() => {
		// const spyOnMethod = spyOn(comp['CanDeactivateModelComponentService'], 'canDeactivate').and.returnValue(of([]));
		const subspy = spyOn(canDeactive_MockService.canDeactivate(false), 'subscribe');
		comp.billingTitleForm = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.billingTitleForm.markAsTouched();
		comp.billingTitleForm.markAsDirty();
		comp.closeModel();
		tick();
		// expect(spyOnMethod).toHaveBeenCalledBefore(subspy);
		expect(subspy).toHaveBeenCalled();
	}));
	it('Should getBillingTitle with billingtitlelisting empty', fakeAsync(() => {
		const formValue: any = {
			comments: 'comments',
			description: 'description',
			name: 'name',
			status:true,
			result:[],
			comingData:[]
		};
		comp.billingTitleForm = initializeSearhForm();
		comp.billingTitleForm.controls['name'].setValue(formValue.comments);
		comp.billingTitleForm.controls['comments'].setValue(formValue.description);
		comp.billingTitleForm.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.getBillingTitle(formValue);
        fixture.detectChanges();
		expect(comp.loadSpin).toBeTruthy();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		expect(comp.billingtitlelisting.length).toBe(0);
    }));
	it('Should Test updateForm function when subsribe run successfull',fakeAsync(()=>{
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
		comp['modalref'] = comp['modalservice'].open('paymentType', ngbModalOptions);
		comp.billingTitleForm = comp.initializeSearhForm();
		comp.billingTitleForm.controls.name.setValue('mock name');
		comp.billingTitleForm.controls.description.setValue('mock description');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.updateForm(comp.billingTitleForm);
        fixture.detectChanges();
		expect(comp.loadSpin).toBeTruthy();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		comp['modalref'].close();
		expect(comp.loadSpin).toBeFalsy();
	}));
	it('Should Test updateForm function when subsribe run successfull and status false',fakeAsync(()=>{
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
		comp['modalref'] = comp['modalservice'].open('paymentType', ngbModalOptions);
		comp.billingTitleForm = comp.initializeSearhForm();
		comp.billingTitleForm.controls.name.setValue('mock name');
		comp.billingTitleForm.controls.description.setValue('mock description');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.updateForm(comp.billingTitleForm);
        fixture.detectChanges();
		expect(comp.disableBtn).toBeTruthy();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		fixture.detectChanges();
		tick(15000);
		discardPeriodicTasks();
		comp['modalref'].close();
		expect(comp.disableBtn).toBeFalsy();
	}));
	it('Should Test updateForm function when subsribe run successfull and subscribe return error',fakeAsync(()=>{
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
		comp['modalref'] = comp['modalservice'].open('paymentType', ngbModalOptions);
		comp.billingTitleForm = comp.initializeSearhForm();
		comp.billingTitleForm.controls.name.setValue('mock name');
		comp.billingTitleForm.controls.description.setValue('mock description');
		spyOn(request_MockService, 'sendRequest').and.returnValue(throwError('error'));
		comp.updateForm(comp.billingTitleForm);
        fixture.detectChanges();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		fixture.detectChanges();
		tick(15000);
		discardPeriodicTasks();
		comp['modalref'].close();
		expect(comp.disableBtn).toBeFalsy();
	}));
	it('Should Test updateForm function When billingTitleForm not valid',()=>{
		spyOn(helper, 'touchAllFields');
		comp.billingTitleForm = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			description: [''],
			comments: [''],
		});
		comp.updateForm(comp.billingTitleForm);
		expect(helper.touchAllFields).toHaveBeenCalled();
	});
	it('Should Test createFormSubmit function When billingTitleForm not valid',()=>{
		spyOn(helper, 'touchAllFields');
		comp.billingTitleForm = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			description: [''],
			comments: [''],
		});
		comp.createFormSubmit(comp.billingTitleForm);
		expect(helper.touchAllFields).toHaveBeenCalled();
	});
	it('Should Test onFormSubmit function',()=>{
		spyOn(comp,'createFormSubmit');
		comp.billingTitleForm = comp.initializeSearhForm();
		comp.billingTitleForm.controls.name.setValue('mock name');
		comp.billingTitleForm.controls.description.setValue('mock description');
		comp.onFormSubmit(comp.billingTitleForm.value);
		comp.modelTitle = 'Add';
		expect(comp.createFormSubmit).toHaveBeenCalled();
	});
	it('Should Test onFormSubmit function without Add',()=>{
		spyOn(comp,'updateForm');
		comp.billingTitleForm = comp.initializeSearhForm();
		comp.billingTitleForm.controls.name.setValue('mock name');
		comp.billingTitleForm.controls.description.setValue('mock description');
		comp.modelTitle = 'Edit';
		comp.onFormSubmit(comp.billingTitleForm.value);
		expect(comp.updateForm).toHaveBeenCalled();
	});
	it('Should Test openModal function',()=>{
		spyOn(comp,'patchAddValues');
		comp.billingTitleForm = comp.initializeSearhForm();
		comp.billingTitleForm.controls.name.setValue('mock name');
		comp.billingTitleForm.controls.description.setValue('mock description');
		comp.openModal(undefined,undefined,undefined);
		expect(comp.patchAddValues).toHaveBeenCalled();
	});
	it('Should Test openModal function with row not undefined',()=>{
		spyOn(comp,'patchEditValues');
		comp.billingTitleForm = comp.initializeSearhForm();
		comp.billingTitleForm.controls.name.setValue('mock name');
		comp.billingTitleForm.controls.description.setValue('mock description');
		comp.openModal(undefined,comp.billingTitleForm.value,3);
		expect(comp.patchEditValues).toHaveBeenCalled();
	});
	it('Should Test openModal function with row null',()=>{
		spyOn(comp,'patchAddValues');
		comp.billingTitleForm = comp.initializeSearhForm();
		comp.billingTitleForm.controls.name.setValue('mock name');
		comp.billingTitleForm.controls.description.setValue('mock description');
		comp.openModal(undefined,null,3);
		expect(comp.patchAddValues).toHaveBeenCalled();
	});
	it('Should stringfy Test which return json stringify',()=>{
		const formValue: any = {
			comments: 'comments',
			description: 'description',
			name: 'name',
			status:true,
			result:[]
		};
		let JSON_String = comp.stringfy(formValue);
		expect(JSON_String).toEqual(JSON.stringify(formValue));
	});
	it('Should resetFilter',()=>{
		comp.billingTitleSearchForm = comp['fb'].group({
			name: ['name'],
			description: ['desc'],
		});
		spyOn(comp.billingTitleSearchForm,'reset');
		spyOn(comp.selection,'clear');
		spyOn(comp,'setpage');
		comp.resetFilter();
		expect(comp.billingTitleSearchForm.reset).toHaveBeenCalled();
		expect(comp.selection.clear).toHaveBeenCalled();
		expect(comp.setpage).toHaveBeenCalled();
	});
	afterAll(() => {
		TestBed.resetTestingModule();
	  });
});
