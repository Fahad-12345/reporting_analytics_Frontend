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
import { ModifiersComponent } from './modifiers.component';
import { ConfirmMockService } from '@appDir/shared/mock-services/ConfirmMock.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
describe('ModifiersComponent', () => {
	let comp: ModifiersComponent;
	let fixture: ComponentFixture<ModifiersComponent>;
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
			declarations: [ModifiersComponent],
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
		fixture = TestBed.createComponent(ModifiersComponent);
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
	function initializeModifierForm(): FormGroup {
		return comp['fb'].group({
			name: [''],
			comments: [''],
			description: [''],
		});
	}
	it('should form valid on empty', async(() => {
		const form = initializeModifierForm();
		form.controls['name'].setValue('');
		form.controls['comments'].setValue('');
		form.controls['description'].setValue('');
		expect(form.valid).toBeTruthy();
	}));
	it('Should createModifierSubmit', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'description',
			name: 'name',
			status:true
		};
		const spyOnMethod = spyOn(comp['requestService'], 'sendRequest').and.returnValue(of(formValue));
		const subspy = spyOn(request_MockService.sendRequest(), 'subscribe');
		comp.modifierform = initializeModifierForm();
		comp.modifierform.controls['name'].setValue(formValue.name);
		comp.modifierform.controls['comments'].setValue(formValue.comments);
		comp.modifierform.controls['description'].setValue(formValue.description);
		tick(15000);
		discardPeriodicTasks();
		comp.createModifierSubmit(comp.modifierform.value);
		debugger;
		expect(comp.loadSpin).toBeTruthy();
		expect(spyOnMethod).toHaveBeenCalledBefore(subspy);
		expect(subspy).toHaveBeenCalled();
	}));
	it('Should createModifierSubmit function test when createModifierSubmit complete', () => {
		const formValue: any = {
			comments: 'comment',
			description: 'desc',
			name: 'name',
		};
		comp.modifierform = initializeModifierForm();
		comp.modifierform.controls['name'].setValue(formValue.comments);
		comp.modifierform.controls['comments'].setValue(formValue.description);
		comp.modifierform.controls['description'].setValue(formValue.name);
		comp.createModifierSubmit(formValue);
		fixture.detectChanges();
		expect(comp.loadSpin).toBeFalsy();
	});
	it('Should createModifierSubmit Subscribe body test when status true', fakeAsync(() => {
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
		comp.modifierform = initializeModifierForm();
		comp.modifierform.controls['name'].setValue(formValue.comments);
		comp.modifierform.controls['comments'].setValue(formValue.description);
		comp.modifierform.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.createModifierSubmit(formValue);
        fixture.detectChanges();
		expect(comp.loadSpin).toBeTruthy();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		comp.modalRef.close();
		expect(comp.loadSpin).toBeFalsy();
    }));
	it('Should modifierSetpage function test', () => {
		spyOn(comp, 'addUrlQueryParams');
		spyOn(comp, 'displayModifierUpdated');
		spyOn(comp['modifierSelection'], 'clear');
		comp.modifierform = comp.initializeModifierForm();
		const pageInfo = {
			offset: 0,
		};
		comp['modifierPage'].pageNumber = pageInfo.offset;
		const pageNumber = comp['modifierPage'].pageNumber + 1;
		comp.modifierform.controls.name.setValue('Your name');
		comp.modifierform.controls.comments.setValue('Your comments');
		comp.modifierform.controls.description.setValue('Your description');
		const filters = checkReactiveFormIsEmpty(comp.modifierform);
		comp['queryParams'] = {
			filter: !isObjectEmpty(filters),
			order: OrderEnum.ASC,
			per_page: comp['modifierPage'].size || 10,
			page: pageNumber,
			pagination: true,
			order_by: 'name',
		};
		let queryparam = { per_page: comp['modifierPage'].size, page: pageNumber };
		expect(comp['modifierPage'].pageNumber).toBe(pageInfo.offset);
		// expect(comp['modifierSelection'].clear).toHaveBeenCalled();
		const formValue: any = {
			comments: 'comments',
			description: 'description',
			name: 'name',
		};
		comp.modifierform = initializeModifierForm();
		comp.modifierform.controls['name'].setValue(formValue.name);
		comp.modifierform.controls['comments'].setValue(formValue.comments);
		comp.modifierform.controls['description'].setValue(formValue.description);
		comp.modifierSetpage(pageInfo);
		expect(comp.addUrlQueryParams).toHaveBeenCalled();
		expect(comp.displayModifierUpdated).toHaveBeenCalled();
	});
	it('Should displayModifierUpdated function test when subscribe throw error', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'desc',
			name: 'name',
		};
		comp.modifierSearchForm = initializeModifierForm();
		comp.modifierSearchForm.controls['name'].setValue(formValue.comments);
		comp.modifierSearchForm.controls['comments'].setValue(formValue.description);
		comp.modifierSearchForm.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(throwError('error') );
		comp.displayModifierUpdated(formValue);
        expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp.loadSpin).toBeFalsy();
		flush();
	}));
	it('Should closeModalWithFormReset function test when subscribe return empty responce	', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'desc',
			name: 'name',
		};
		comp.modifierform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.modifierform.markAsTouched();
		comp.modifierform.markAsDirty();
        spyOn(canDeactive_MockService, 'canDeactivate').and.returnValue(of(null));
		let ReturnValue = comp.closeModalWithFormReset();
        expect(ReturnValue).toBeUndefined();
	}));
	it('Should closeModalWithFormReset function test when subscribe return not empty responce	', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'desc',
			name: 'name',
		};
		comp.modifierform = comp['fb'].group({
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
		comp.modifierform.markAsTouched();
		comp.modifierform.markAsDirty();
		spyOn(comp.modifierform,'reset');
        spyOn(canDeactive_MockService, 'canDeactivate').and.returnValue(of([]));
		comp.closeModalWithFormReset();
		comp.modalRef.close();
        expect(comp.modifierform.reset).toHaveBeenCalled();
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
		spyOn(comp, 'initializeModifierForm');
		// spyOn(comp, 'modifierPage');
		spyOn(comp['fb'], 'group');
		// spyOn(comp['_route'].queryParams,'subscribe').and.returnValue(of([MockRowValue]));
		// spyOn(comp.subscription,'push').and.returnValue(of([MockRowValue]));

		comp.ngOnInit();
		tick();
		expect(comp.setTitle).toHaveBeenCalled();
		expect(comp['initializeModifierForm']).toHaveBeenCalled();
		expect(comp['fb'].group).toHaveBeenCalled();
		expect(comp.subscription.push).toHaveBeenCalled();

	}));
	it('Should Test initializeModifierForm', () => {
		spyOn(comp['fb'], 'group');
		comp.initializeModifierForm();
		expect(comp['fb'].group).toHaveBeenCalled();
	});
	it('Should Test isModifiersAllSelected', () => {
		comp.modifiersComingData.length = 10;
		comp.modifiertotalRows = comp.modifiersComingData.length;
		comp['modifierSelection'].selected.length = 10;
		comp.isModifiersAllSelected();
		expect(comp.modifiertotalRows).toBe(comp['modifierSelection'].selected.length);
	});
	it('Should Test isModifiersAllSelected', () => {
		comp.modifiersComingData.length = 10;
		comp.modifiertotalRows = comp.modifiersComingData.length;
		comp['modifierSelection'].selected.length = 10;
		comp.isModifiersAllSelected();
		expect(comp.modifiertotalRows).toBe(comp['modifierSelection'].selected.length);
	});
	it('Should Test ModifiersmasterToggle when isSelected True', () => {
		// spyOn(comp, 'isModifiersAllSelected').and.returnValue(of(true));
		spyOn(comp['modifierSelection'], 'clear');
		comp.ModifiersmasterToggle();
		expect(comp.isModifiersAllSelected).toHaveBeenCalled();
		expect(comp['modifierSelection'].clear).toHaveBeenCalled();
	});
	it('Should Test ModifiersmasterToggle when isSelected False', () => {
		spyOn(comp, 'isModifiersAllSelected').and.returnValue(false);
		comp.modifiertotalRows = 5;
		comp.ModifiersmasterToggle();
		comp.modifiersComingData = [2];
		expect(comp.isModifiersAllSelected).toHaveBeenCalled();
	});
	it('Should Test page limit function', () => {
		spyOn(comp, 'modifierSetpage');
		comp.modifierPageLimit('3');
		expect(comp.modifierSetpage).toHaveBeenCalled();
		expect(comp['modifierPage'].size).toBe(3);
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
		comp.modifierform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.modifiersComingData = mockPlaceOfServiceList;
		comp.patchEditValues(MockRowValue, MockRowIndex);
		expect(comp.modelSubmit).toBe('Update');
		expect(comp.modelTitle).toBe('Edit');
	});
	it('Should Test patchAddValues', () => {
		comp.modifierform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			code: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		spyOn(comp.modifierform, 'reset');
		comp.patchAddValues();
		expect(comp.modifierform.reset).toHaveBeenCalled();
		expect(comp.modelSubmit).toContain('Save & Continue');
		expect(comp.modelTitle).toContain('Add');
	});
	it('Should check Reset Button when modifierSearchForm From Empty function Test', () => {
		comp.modifierSearchForm = comp.initializeModifierForm();
		const retrunValue = isEmptyObject(comp.modifierSearchForm.value);
		comp.checkInputs();
		expect(retrunValue).toBe(true);
	});
	it('Should check Reset Button disabled when modifierSearchForm have values function Test', () => {
		comp.modifierSearchForm = comp.initializeModifierForm();
		comp.modifierSearchForm.controls.name.setValue('mock name');
		comp.modifierSearchForm.controls.comments.setValue('mock comments');
		comp.modifierSearchForm.controls.description.setValue('mock description');
		const retrunValue = isEmptyObject(comp.modifierSearchForm.value);
		comp.checkInputs();
		expect(retrunValue).toBe(false);
	});
	it('Should Test stringfy function which convert object', () => {
		const obj = comp.stringfy({ name: 'name mock' });
		expect(obj).toContain('{"name":"name mock"}');
	});
	it('Should Test closeModalWithFormReset when modifierform dirty and touched false', fakeAsync(() => {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('paymentType', ngbModalOptions);
		comp.modifierform = comp['fb'].group({
			name: ['name'],
			comments: ['comment'],
			description: ['desc'],
		});
		spyOn(comp.modifierform,'reset');
		comp.modifierform.reset();
		comp.closeModalWithFormReset();
		comp.modalRef.close();
		expect(comp.modifierform.reset).toHaveBeenCalled();
	}));
	it('Should Test closeModalWithFormReset when modifierform dirty and touched true', fakeAsync(() => {
		// const spyOnMethod = spyOn(comp['CanDeactivateModelComponentService'], 'canDeactivate').and.returnValue(of([]));
		const subspy = spyOn(canDeactive_MockService.canDeactivate(), 'subscribe');
		comp.modifierform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.modifierform.markAsTouched();
		comp.modifierform.markAsDirty();
		comp.closeModalWithFormReset();
		tick();
		// expect(spyOnMethod).toHaveBeenCalledBefore(subspy);
		expect(subspy).toHaveBeenCalled();
	}));
	it('Should Test closeModalWithFormReset when modifierform dirty and touched true and subcribe throw error', fakeAsync(() => {
		// const spyOnMethod = spyOn(comp['CanDeactivateModelComponentService'], 'canDeactivate').and.returnValue(of([]));
		const subspy = spyOn(canDeactive_MockService.canDeactivate(false), 'subscribe');
		comp.modifierform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.modifierform.markAsTouched();
		comp.modifierform.markAsDirty();
		comp.closeModalWithFormReset();
		tick();
		// expect(spyOnMethod).toHaveBeenCalledBefore(subspy);
		expect(subspy).toHaveBeenCalled();
	}));
	it('Should displayModifierUpdated with modifiersComingData empty', fakeAsync(() => {
		const formValue: any = {
			comments: 'comments',
			description: 'description',
			name: 'name',
			status:true,
			comingData:[]
		};
		comp.modifierSearchForm = initializeModifierForm();
		comp.modifierSearchForm.controls['name'].setValue(formValue.comments);
		comp.modifierSearchForm.controls['comments'].setValue(formValue.description);
		comp.modifierSearchForm.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.displayModifierUpdated(formValue);
        fixture.detectChanges();
		expect(comp.loadSpin).toBeTruthy();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		expect(comp.modifiersComingData.length).toBe(0);
		expect(comp['modifierPage'].totalElements).toBe(0);
    }));
	it('Should Test resetModifier function',()=>{
		spyOn(comp,'modifierSetpage');
		spyOn(comp['fb'],'group');
		comp.modifierSearchForm = comp.initializeModifierForm();
		comp.resetModifier();
		expect(comp.modifierSetpage).toHaveBeenCalled();
		expect(comp['fb'].group).toHaveBeenCalled();
	});
	it('Should Test updateModifierSubmit function when subsribe run successfull',fakeAsync(()=>{
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
		comp.modifierform = comp.initializeModifierForm();
		comp.modifierform.controls.name.setValue('mock name');
		comp.modifierform.controls.comments.setValue('mock comments');
		comp.modifierform.controls.description.setValue('mock description');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.updateModifierSubmit(comp.modifierform);
        fixture.detectChanges();
		expect(comp.loadSpin).toBeTruthy();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		comp.modalRef.close();
		expect(comp.loadSpin).toBeFalsy();
	}));
	it('Should Test updateModifierSubmit function when subsribe run successfull and status false',fakeAsync(()=>{
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
		comp.modifierform = comp.initializeModifierForm();
		comp.modifierform.controls.name.setValue('mock name');
		comp.modifierform.controls.comments.setValue('mock comments');
		comp.modifierform.controls.description.setValue('mock description');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.updateModifierSubmit(comp.modifierform);
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
	it('Should Test onModifierSubmit function',()=>{
		spyOn(comp,'createModifierSubmit');
		comp.modifierSearchForm = comp.initializeModifierForm();
		comp.modifierSearchForm.controls.name.setValue('mock name');
		comp.modifierSearchForm.controls.comments.setValue('mock comments');
		comp.modifierSearchForm.controls.description.setValue('mock description');
		comp.onModifierSubmit(comp.modifierSearchForm.value);
		comp.modelTitle = 'Add';
		expect(comp.createModifierSubmit).toHaveBeenCalled();
	});
	it('Should Test onModifierSubmit function without Add',()=>{
		spyOn(comp,'updateModifierSubmit');
		comp.modifierSearchForm = comp.initializeModifierForm();
		comp.modifierSearchForm.controls.name.setValue('mock name');
		comp.modifierSearchForm.controls.comments.setValue('mock comments');
		comp.modifierSearchForm.controls.description.setValue('mock description');
		comp.modelTitle = 'Edit';
		comp.onModifierSubmit(comp.modifierSearchForm.value);
		expect(comp.updateModifierSubmit).toHaveBeenCalled();
	});
	it('Should Test openModifierModal function',()=>{
		spyOn(comp,'patchAddValues');
		comp.modifierSearchForm = comp.initializeModifierForm();
		comp.modifierSearchForm.controls.name.setValue('mock name');
		comp.modifierSearchForm.controls.comments.setValue('mock comments');
		comp.modifierSearchForm.controls.description.setValue('mock description');
		comp.openModifierModal(undefined,undefined,undefined);
		expect(comp.patchAddValues).toHaveBeenCalled();
	});
	it('Should Test openModifierModal function with row not undefined',()=>{
		spyOn(comp,'patchEditValues');
		comp.modifierSearchForm = comp.initializeModifierForm();
		comp.modifierSearchForm.controls.name.setValue('mock name');
		comp.modifierSearchForm.controls.comments.setValue('mock comments');
		comp.modifierSearchForm.controls.description.setValue('mock description');
		comp.openModifierModal(undefined,comp.modifierSearchForm.value,3);
		expect(comp.patchEditValues).toHaveBeenCalled();
	});
	it('Should Test openModifierModal function with row null',()=>{
		spyOn(comp,'patchAddValues');
		comp.modifierSearchForm = comp.initializeModifierForm();
		comp.modifierSearchForm.controls.name.setValue('mock name');
		comp.modifierSearchForm.controls.comments.setValue('mock comments');
		comp.modifierSearchForm.controls.description.setValue('mock description');
		comp.openModifierModal(undefined,null,3);
		expect(comp.patchAddValues).toHaveBeenCalled();
	});
	it('Should Modifierstringfy Test which return json stringify',()=>{
		const formValue: any = {
			comments: 'comments',
			description: 'description',
			name: 'name',
			status:true,
			result:[]
		};
		let JSON_String = comp.Modifierstringfy(formValue);
		expect(JSON_String).toEqual(JSON.stringify(formValue));
	});
	afterAll(() => {
		TestBed.resetTestingModule();
	  });
});
