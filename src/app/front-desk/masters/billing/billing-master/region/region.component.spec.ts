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
import * as helper from '@appDir/shared/utils/utils.helpers';
import { checkReactiveFormIsEmpty, isEmptyObject, isObjectEmpty } from '@appDir/shared/utils/utils.helpers';
import { CanDeactiveMockService } from '@appDir/shared/canDeactivateModelComponent/canDeactiveModelMockService.service.ts/canDeactiveModelMockService';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { RequestMockService } from '@appDir/shared/mock-services/RequestMock.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { delay } from 'rxjs/operators';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ConfirmMockService } from '@appDir/shared/mock-services/ConfirmMock.service';
import { RegionComponent } from './region.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
describe('RegionComponent', () => {
	let comp: RegionComponent;
	let fixture: ComponentFixture<RegionComponent>;
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
			declarations: [RegionComponent],
			imports: [ToastrModule.forRoot(), SharedModule, RouterTestingModule,BrowserAnimationsModule,HttpClientTestingModule ],
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
		fixture = TestBed.createComponent(RegionComponent);
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
	function initializeRegionSearch(): FormGroup {
		return comp['fb'].group({
			name: [''],
			comments: [''],
			description: [''],
		});
	}
	it('should form valid on empty', async(() => {
		const form = initializeRegionSearch();
		form.controls['name'].setValue('');
		form.controls['comments'].setValue('');
		form.controls['description'].setValue('');
		expect(form.valid).toBeTruthy();
	}));
	it('Should createRegionFormSubmit', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'description',
			name: 'name',
			status:true
		};
		const spyOnMethod = spyOn(comp['requestService'], 'sendRequest').and.returnValue(of(formValue));
		const subspy = spyOn(request_MockService.sendRequest(), 'subscribe');
		comp.regionForm = initializeRegionSearch();
		comp.regionForm.controls['name'].setValue(formValue.name);
		comp.regionForm.controls['comments'].setValue(formValue.comments);
		comp.regionForm.controls['description'].setValue(formValue.description);
		tick();
		expect(comp.loadSpin).toBeFalsy();
		comp.createRegionFormSubmit(comp.regionForm.value);
		expect(comp.loadSpin).toBeFalsy();
		expect(spyOnMethod).toHaveBeenCalledBefore(subspy);
		expect(subspy).toHaveBeenCalled();
	}));
	it('Should createRegionFormSubmit Subscribe body test when status false', fakeAsync(() => {
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
		comp.regionForm = initializeRegionSearch();
		comp.regionForm.controls['name'].setValue(formValue.comments);
		comp.regionForm.controls['comments'].setValue(formValue.description);
		comp.regionForm.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(throwError('error') );
		comp.createRegionFormSubmit(formValue);
        fixture.detectChanges();
		expect(comp.disableBtn).toBeFalsy();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		comp.modalRef.close();
    }));
	it('Should closeModel function test when subscribe return empty responce	', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'desc',
			name: 'name',
		};
		comp.regionForm = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.regionForm.markAsTouched();
		comp.regionForm.markAsDirty();
        spyOn(canDeactive_MockService, 'canDeactivate').and.returnValue(of(null));
		let ReturnValue = comp.closeModel();
        expect(ReturnValue).toBeUndefined();
	}));
	it('Should createRegionFormSubmit function test when createRegionFormSubmit complete', () => {
		const formValue: any = {
			comments: 'comment',
			description: 'desc',
			name: 'name',
		};
		comp.regionForm = initializeRegionSearch();
		comp.regionForm.controls['name'].setValue(formValue.comments);
		comp.regionForm.controls['comments'].setValue(formValue.description);
		comp.regionForm.controls['description'].setValue(formValue.name);
		comp.createRegionFormSubmit(formValue);
		fixture.detectChanges();
		expect(comp.loadSpin).toBeFalsy();
	});
	it('Should createRegionFormSubmit Subscribe body test when status true', fakeAsync(() => {
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
		comp.regionForm = initializeRegionSearch();
		comp.regionForm.controls['name'].setValue(formValue.comments);
		comp.regionForm.controls['comments'].setValue(formValue.description);
		comp.regionForm.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.createRegionFormSubmit(formValue);
        fixture.detectChanges();
		expect(comp.loadSpin).toBeTruthy();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		comp.modalRef.close();
		expect(comp.loadSpin).toBeFalsy();
    }));
	it('Should regionSetPage function test', () => {
		spyOn(comp, 'addUrlQueryParams');
		spyOn(comp, 'displayRegionUpdated');
		spyOn(comp['regionSelection'], 'clear');
		comp.regionForm = comp.initializeRegionSearch();
		const pageInfo = {
			offset: 0,
		};
		comp['regionPage'].pageNumber = pageInfo.offset;
		const pageNumber = comp['regionPage'].pageNumber + 1;
		comp.regionForm.controls.name.setValue('Your name');
		comp.regionForm.controls.comments.setValue('Your comments');
		comp.regionForm.controls.description.setValue('Your description');
		const filters = checkReactiveFormIsEmpty(comp.regionForm);
		comp['queryParams'] = {
			filter: !isObjectEmpty(filters),
			order: OrderEnum.ASC,
			per_page: comp['regionPage'].size || 10,
			page: pageNumber,
			pagination: true,
			order_by: 'name',
		};
		let queryparam = { per_page: comp['regionPage'].size, page: pageNumber };
		expect(comp['regionPage'].pageNumber).toBe(pageInfo.offset);
		// expect(comp['regionSelection'].clear).toHaveBeenCalled();
		const formValue: any = {
			comments: 'comments',
			description: 'description',
			name: 'name',
		};
		comp.regionForm = initializeRegionSearch();
		comp.regionForm.controls['name'].setValue(formValue.name);
		comp.regionForm.controls['comments'].setValue(formValue.comments);
		comp.regionForm.controls['description'].setValue(formValue.description);
		comp.regionSetPage(pageInfo);
		expect(comp.addUrlQueryParams).toHaveBeenCalled();
		expect(comp.displayRegionUpdated).toHaveBeenCalled();
	});
	it('Should displayRegionUpdated function test when subscribe throw error', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'desc',
			name: 'name',
		};
		comp.regionForm = initializeRegionSearch();
		comp.regionForm.controls['name'].setValue(formValue.comments);
		comp.regionForm.controls['comments'].setValue(formValue.description);
		comp.regionForm.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(throwError('error') );
		comp.displayRegionUpdated(formValue);
        expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp.loadSpin).toBeFalsy(); // truthy
		flush();
	}));
	it('Should resetRegion function test when subscribe return empty responce	', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'desc',
			name: 'name',
		};
		comp.regionForm = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.regionForm.markAsTouched();
		comp.regionForm.markAsDirty();
        spyOn(canDeactive_MockService, 'canDeactivate').and.returnValue(of(null));
		let ReturnValue = comp.resetRegion();
        expect(ReturnValue).toBeUndefined();
	}));
	it('Should closeModel function test when subscribe return not empty responce	', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'desc',
			name: 'name',
		};
		comp.regionForm = comp['fb'].group({
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
		comp.regionForm.markAsTouched();
		comp.regionForm.markAsDirty();
		spyOn(comp.regionForm,'reset');
        spyOn(canDeactive_MockService, 'canDeactivate').and.returnValue(of([]));
		comp.closeModel();
		comp.modalRef.close();
        expect(comp.regionForm.reset).toHaveBeenCalled();
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
		spyOn(comp, 'initializeRegionSearch');
		// spyOn(comp, 'regionPage');
		spyOn(comp['fb'], 'group');
		// spyOn(comp['_route'].queryParams,'subscribe').and.returnValue(of([MockRowValue]));
		// spyOn(comp.subscription,'push').and.returnValue(of([MockRowValue]));

		comp.ngOnInit();
		tick();
		expect(comp.setTitle).toHaveBeenCalled();
		expect(comp['initializeRegionSearch']).toHaveBeenCalled();
		expect(comp['fb'].group).toHaveBeenCalled();
		expect(comp.subscription.push).toHaveBeenCalled();

	}));
	it('Should Test initializeRegionSearch', () => {
		spyOn(comp['fb'], 'group');
		comp.initializeRegionSearch();
		expect(comp['fb'].group).toHaveBeenCalled();
	});
	it('Should Test isRegionAllSelected', () => {
		comp.regioncomingData.length = 10;
		comp.regionTotalRows = comp.regioncomingData.length;
		comp['regionSelection'].selected.length = 10;
		comp.isRegionAllSelected();
		expect(comp.regionTotalRows).toBe(comp['regionSelection'].selected.length);
	});
	it('Should Test isRegionAllSelected', () => {
		comp.regioncomingData.length = 10;
		comp.regionTotalRows = comp.regioncomingData.length;
		comp['regionSelection'].selected.length = 10;
		comp.isRegionAllSelected();
		expect(comp.regionTotalRows).toBe(comp['regionSelection'].selected.length);
	});
	it('Should Test RegionsmasterToggle when isSelected True', () => {
		// spyOn(comp, 'isRegionAllSelected').and.returnValue(of(true));
		spyOn(comp['regionSelection'], 'clear');
		comp.RegionsmasterToggle();
		expect(comp.isRegionAllSelected).toHaveBeenCalled();
		expect(comp['regionSelection'].clear).toHaveBeenCalled();
	});
	it('Should Test RegionsmasterToggle when isSelected False', () => {
		spyOn(comp, 'isRegionAllSelected').and.returnValue(false);
		comp.regionTotalRows = 5;
		comp.RegionsmasterToggle();
		comp.regioncomingData = [2];
		expect(comp.isRegionAllSelected).toHaveBeenCalled();
	});
	it('Should Test page limit function', () => {
		spyOn(comp, 'regionSetPage');
		comp.regionPageLimit('3');
		expect(comp.regionSetPage).toHaveBeenCalled();
		expect(comp['regionPage'].size).toBe(3);
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
		comp.regionForm = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.regioncomingData = mockPlaceOfServiceList;
		comp.patchEditValues(MockRowValue, MockRowIndex);
		expect(comp.modelSubmit).toBe('Update');
		expect(comp.modelTitle).toBe('Edit');
	});
	it('Should Test patchAddValues', () => {
		comp.regionForm = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			code: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		spyOn(comp.regionForm, 'reset');
		comp.patchAddValues();
		expect(comp.regionForm.reset).toHaveBeenCalled();
		expect(comp.modelSubmit).toContain('Save & Continue');
		expect(comp.modelTitle).toContain('Add');
	});
	it('Should check Reset Button when regionSearchForm From Empty function Test', () => {
		comp.regionSearchForm = comp.initializeRegionSearch();
		const retrunValue = isEmptyObject(comp.regionSearchForm.value);
		comp.checkInputs();
		expect(retrunValue).toBe(true);
	});
	it('Should check Reset Button disabled when regionSearchForm have values function Test', () => {
		comp.regionSearchForm = comp.initializeRegionSearch();
		comp.regionSearchForm.controls.name.setValue('mock name');
		comp.regionSearchForm.controls.comments.setValue('mock comments');
		comp.regionSearchForm.controls.description.setValue('mock description');
		const retrunValue = isEmptyObject(comp.regionSearchForm.value);
		comp.checkInputs();
		expect(retrunValue).toBe(false);
	});
	it('Should Test stringfy function which convert object', () => {
		const obj = comp.stringfy({ name: 'name mock' });
		expect(obj).toContain('{"name":"name mock"}');
	});
	it('Should Test closeModel when regionForm dirty and touched false', fakeAsync(() => {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('paymentType', ngbModalOptions);
		comp.regionForm = comp['fb'].group({
			name: ['name'],
			comments: ['comment'],
			description: ['desc'],
		});
		spyOn(comp.regionForm,'reset');
		comp.regionForm.reset();
		comp.closeModel();
		comp.modalRef.close();
		expect(comp.regionForm.reset).toHaveBeenCalled();
	}));
	it('Should Test closeModel when regionForm dirty and touched true', fakeAsync(() => {
		// const spyOnMethod = spyOn(comp['CanDeactivateModelComponentService'], 'canDeactivate').and.returnValue(of([]));
		const subspy = spyOn(canDeactive_MockService.canDeactivate(), 'subscribe');
		comp.regionForm = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.regionForm.markAsTouched();
		comp.regionForm.markAsDirty();
		comp.closeModel();
		tick();
		// expect(spyOnMethod).toHaveBeenCalledBefore(subspy);
		expect(subspy).toHaveBeenCalled();
	}));
	it('Should Test closeModel when regionForm dirty and touched true and subcribe throw error', fakeAsync(() => {
		// const spyOnMethod = spyOn(comp['CanDeactivateModelComponentService'], 'canDeactivate').and.returnValue(of([]));
		const subspy = spyOn(canDeactive_MockService.canDeactivate(false), 'subscribe');
		comp.regionForm = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.regionForm.markAsTouched();
		comp.regionForm.markAsDirty();
		comp.closeModel();
		tick();
		// expect(spyOnMethod).toHaveBeenCalledBefore(subspy);
		expect(subspy).toHaveBeenCalled();
	}));
	it('Should displayRegionUpdated with regioncomingData empty', fakeAsync(() => {
		const formValue: any = {
			comments: 'comments',
			description: 'description',
			name: 'name',
			status:true,
			comingData:[]
		};
		comp.regionForm = initializeRegionSearch();
		comp.regionForm.controls['name'].setValue(formValue.comments);
		comp.regionForm.controls['comments'].setValue(formValue.description);
		comp.regionForm.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.displayRegionUpdated(formValue);
        fixture.detectChanges();
		expect(comp.loadSpin).toBeTruthy();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		expect(comp.regioncomingData.length).toBe(0);
		expect(comp['regionPage'].totalElements).toBe(0);
    }));
	it('Should Test resetRegion function',()=>{
		spyOn(comp,'regionSetPage');
		spyOn(comp['fb'],'group');
		comp.regionForm = comp.initializeRegionSearch();
		comp.resetRegion();
		expect(comp.regionSetPage).toHaveBeenCalled();
		expect(comp['fb'].group).toHaveBeenCalled();
	});
	it('Should Test updateRegionForm function when subsribe run successfull',fakeAsync(()=>{
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
		comp.regionForm = comp.initializeRegionSearch();
		comp.regionForm.controls.name.setValue('mock name');
		comp.regionForm.controls.comments.setValue('mock comments');
		comp.regionForm.controls.description.setValue('mock description');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.updateRegionForm(comp.regionForm);
        fixture.detectChanges();
		expect(comp.loadSpin).toBeTruthy();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		comp.modalRef.close();
		expect(comp.loadSpin).toBeFalsy();
	}));
	it('Should Test updateRegionForm function when subsribe run successfull and status false',fakeAsync(()=>{
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
		comp.regionForm = comp.initializeRegionSearch();
		comp.regionForm.controls.name.setValue('mock name');
		comp.regionForm.controls.comments.setValue('mock comments');
		comp.regionForm.controls.description.setValue('mock description');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.updateRegionForm(comp.regionForm);
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
	it('Should Test updateRegionForm function when subsribe run successfull and subscribe return error',fakeAsync(()=>{
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
		comp.regionForm = comp.initializeRegionSearch();
		comp.regionForm.controls.name.setValue('mock name');
		comp.regionForm.controls.comments.setValue('mock comments');
		comp.regionForm.controls.description.setValue('mock description');
		spyOn(request_MockService, 'sendRequest').and.returnValue(throwError('error'));
		comp.updateRegionForm(comp.regionForm);
        fixture.detectChanges();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		fixture.detectChanges();
		tick(15000);
		discardPeriodicTasks();
		comp.modalRef.close();
		expect(comp.disableBtn).toBeFalsy();
	}));
	it('Should Test updateRegionForm function When regionForm not valid',()=>{
		spyOn(helper, 'touchAllFields');
		comp.regionForm = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			description: [''],
			comments: [''],
		});
		comp.updateRegionForm(comp.regionForm);
		expect(helper.touchAllFields).toHaveBeenCalled();
	});
	it('Should Test createRegionFormSubmit function When regionForm not valid',()=>{
		spyOn(helper, 'touchAllFields');
		comp.regionForm = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			description: [''],
			comments: [''],
		});
		comp.createRegionFormSubmit(comp.regionForm);
		expect(helper.touchAllFields).toHaveBeenCalled();
	});
	it('Should Test onRegionForm function',()=>{
		spyOn(comp,'createRegionFormSubmit');
		comp.regionForm = comp.initializeRegionSearch();
		comp.regionForm.controls.name.setValue('mock name');
		comp.regionForm.controls.comments.setValue('mock comments');
		comp.regionForm.controls.description.setValue('mock description');
		comp.onRegionForm(comp.regionForm.value);
		comp.modelTitle = 'Add';
		expect(comp.createRegionFormSubmit).toHaveBeenCalled();
	});
	it('Should Test onRegionForm function without Add',()=>{
		spyOn(comp,'updateRegionForm');
		comp.regionForm = comp.initializeRegionSearch();
		comp.regionForm.controls.name.setValue('mock name');
		comp.regionForm.controls.comments.setValue('mock comments');
		comp.regionForm.controls.description.setValue('mock description');
		comp.modelTitle = 'Edit';
		comp.onRegionForm(comp.regionForm.value);
		expect(comp.updateRegionForm).toHaveBeenCalled();
	});
	it('Should Test openModalForRegion function',()=>{
		spyOn(comp,'patchAddValues');
		comp.regionForm = comp.initializeRegionSearch();
		comp.regionForm.controls.name.setValue('mock name');
		comp.regionForm.controls.comments.setValue('mock comments');
		comp.regionForm.controls.description.setValue('mock description');
		comp.openModalForRegion(undefined,undefined,undefined);
		expect(comp.patchAddValues).toHaveBeenCalled();
	});
	it('Should Test openModalForRegion function with row not undefined',()=>{
		spyOn(comp,'patchEditValues');
		comp.regionForm = comp.initializeRegionSearch();
		comp.regionForm.controls.name.setValue('mock name');
		comp.regionForm.controls.comments.setValue('mock comments');
		comp.regionForm.controls.description.setValue('mock description');
		comp.openModalForRegion(undefined,comp.regionForm.value,3);
		expect(comp.patchEditValues).toHaveBeenCalled();
	});
	it('Should Test openModalForRegion function with row null',()=>{
		spyOn(comp,'patchAddValues');
		comp.regionForm = comp.initializeRegionSearch();
		comp.regionForm.controls.name.setValue('mock name');
		comp.regionForm.controls.comments.setValue('mock comments');
		comp.regionForm.controls.description.setValue('mock description');
		comp.openModalForRegion(undefined,null,3);
		expect(comp.patchAddValues).toHaveBeenCalled();
	});
	it('Should regionstringfy Test which return json stringify',()=>{
		const formValue: any = {
			comments: 'comments',
			description: 'description',
			name: 'name',
			status:true,
			result:[]
		};
		let JSON_String = comp.regionstringfy(formValue);
		expect(JSON_String).toEqual(JSON.stringify(formValue));
	});
	afterAll(() => {
		TestBed.resetTestingModule();
	  });
});
