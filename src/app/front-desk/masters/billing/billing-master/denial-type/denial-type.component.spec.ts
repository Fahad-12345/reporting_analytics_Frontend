import { CanDeactivateModelComponentService } from './../../../../../shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { FormBuilder, FormGroup, Validators, Form } from '@angular/forms';
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
import { DenialTypeComponent } from './denial-type.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
describe('DenialTypeComponent', () => {
	let comp: DenialTypeComponent;
	let fixture: ComponentFixture<DenialTypeComponent>;
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
			declarations: [DenialTypeComponent],
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
		fixture = TestBed.createComponent(DenialTypeComponent);
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
	it('Should creatDeniatSubmit', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'description',
			name: 'name',
			status:true
		};
		const spyOnMethod = spyOn(comp['requestService'], 'sendRequest').and.returnValue(of(formValue));
		const subspy = spyOn(request_MockService.sendRequest(), 'subscribe');
		comp.denialform = denialFormSearch();
		comp.denialform.controls['name'].setValue(formValue.name);
		comp.denialform.controls['comments'].setValue(formValue.comments);
		comp.denialform.controls['description'].setValue(formValue.description);
		tick(15000);
		discardPeriodicTasks();
		debugger;
		comp.creatDeniatSubmit(comp.denialform.value);
		debugger;
		expect(comp.loadSpin).toBeTruthy();
		expect(spyOnMethod).toHaveBeenCalledBefore(subspy);
		expect(subspy).toHaveBeenCalled();
	}));
	it('Should creatDeniatSubmit function test when status false', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'desc',
			name: 'name',
		};
		comp.denialform = denialFormSearch();
		comp.denialform.controls['name'].setValue(formValue.comments);
		comp.denialform.controls['comments'].setValue(formValue.description);
		comp.denialform.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(throwError('error') );
		comp.creatDeniatSubmit(formValue);
        expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp.loadSpin).toBeFalsy();
	}));
	it('Should creatDeniatSubmit Subscribe body test when status true', fakeAsync(() => {
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
		comp.denialform = denialFormSearch();
		comp.denialform.controls['name'].setValue(formValue.comments);
		comp.denialform.controls['comments'].setValue(formValue.description);
		comp.denialform.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.creatDeniatSubmit(formValue);
        fixture.detectChanges();
		expect(comp.loadSpin).toBeTruthy();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		comp.modalRef.close();
		expect(comp.loadSpin).toBeFalsy();
    }));
	it('Should denialSetPage function test', () => {
		spyOn(comp, 'addUrlQueryParams');
		spyOn(comp, 'displayDenialUpdated');
		spyOn(comp['denialSelection'], 'clear');
		comp.denialform = comp.denialFormSearch();
		const pageInfo = {
			offset: 0,
		};
		comp['denialPage'].pageNumber = pageInfo.offset;
		const pageNumber = comp['denialPage'].pageNumber + 1;
		comp.denialform.controls.name.setValue('Your name');
		comp.denialform.controls.comments.setValue('Your comments');
		comp.denialform.controls.description.setValue('Your description');
		const filters = checkReactiveFormIsEmpty(comp.denialform);
		comp['queryParams'] = {
			filter: !isObjectEmpty(filters),
			order: OrderEnum.ASC,
			per_page: comp['denialPage'].size || 10,
			page: pageNumber,
			pagination: true,
			order_by: 'name',
		};
		let queryparam = { per_page: comp['denialPage'].size, page: pageNumber };
		expect(comp['denialPage'].pageNumber).toBe(pageInfo.offset);
		// expect(comp['denialSelection'].clear).toHaveBeenCalled();
		const formValue: any = {
			comments: 'comments',
			description: 'description',
			name: 'name',
		};
		comp.denialform = denialFormSearch();
		comp.denialform.controls['name'].setValue(formValue.name);
		comp.denialform.controls['comments'].setValue(formValue.comments);
		comp.denialform.controls['description'].setValue(formValue.description);
		comp.denialSetPage(pageInfo);
		expect(comp.addUrlQueryParams).toHaveBeenCalled();
		expect(comp.displayDenialUpdated).toHaveBeenCalled();
	});
	it('Should displayDenialUpdated function test when subscribe throw error', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'desc',
			name: 'name',
		};
		comp.denialSerarchForm = denialFormSearch();
		comp.denialSerarchForm.controls['name'].setValue(formValue.comments);
		comp.denialSerarchForm.controls['comments'].setValue(formValue.description);
		comp.denialSerarchForm.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(throwError('error') );
		comp.displayDenialUpdated(formValue);
        expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp.loadSpin).toBeFalsy();
	}));
	it('Should closeModel function test when subscribe return empty responce	', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'desc',
			name: 'name',
		};
		comp.denialform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.denialform.markAsTouched();
		comp.denialform.markAsDirty();
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
		comp.denialform = comp['fb'].group({
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
		comp.denialform.markAsTouched();
		comp.denialform.markAsDirty();
		spyOn(comp.denialform,'reset');
        spyOn(canDeactive_MockService, 'canDeactivate').and.returnValue(of([]));
		comp.closeModel();
		comp.modalRef.close();
        expect(comp.denialform.reset).toHaveBeenCalled();
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
		comp.denialform = denialFormSearch();
		comp.denialform.controls['name'].setValue(formValue.comments);
		comp.denialform.controls['comments'].setValue(formValue.description);
		comp.denialform.controls['description'].setValue(formValue.name);
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
		// spyOn(comp, 'denialPage');
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
	it('Should Test isDenialAllSelected', () => {
		comp.denialComingData.length = 10;
		comp.denialTotalRows = comp.denialComingData.length;
		comp['denialSelection'].selected.length = 10;
		comp.isDenialAllSelected();
		expect(comp.denialTotalRows).toBe(comp['denialSelection'].selected.length);
	});
	it('Should Test isDenialAllSelected', () => {
		comp.denialComingData.length = 10;
		comp.denialTotalRows = comp.denialComingData.length;
		comp['denialSelection'].selected.length = 10;
		comp.isDenialAllSelected();
		expect(comp.denialTotalRows).toBe(comp['denialSelection'].selected.length);
	});
	it('Should Test denialmasterToggle when isSelected True', () => {
		// spyOn(comp, 'isDenialAllSelected').and.returnValue(of(true));
		spyOn(comp['denialSelection'], 'clear');
		comp.denialmasterToggle();
		expect(comp.isDenialAllSelected).toHaveBeenCalled();
		expect(comp['denialSelection'].clear).toHaveBeenCalled();
	});
	it('Should Test denialmasterToggle when isSelected False', () => {
		spyOn(comp, 'isDenialAllSelected').and.returnValue(false);
		comp.denialTotalRows = 5;
		comp.denialmasterToggle();
		comp.denialComingData = [2];
		expect(comp.isDenialAllSelected).toHaveBeenCalled();
	});
	it('Should Test page limit function', () => {
		spyOn(comp, 'denialSetPage');
		comp.denialPageLimit('3');
		expect(comp.denialSetPage).toHaveBeenCalled();
		expect(comp['denialPage'].size).toBe(3);
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
		comp.denialform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.denialComingData = mockPaymentTypeList;
		comp.patchEditValues(MockRowValue, MockRowIndex);
		expect(comp.modelSubmit).toBe('Update');
		expect(comp.modelTitle).toBe('Edit');
	});
	it('Should Test patchAddValues', () => {
		comp.denialform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		spyOn(comp.denialform, 'reset');
		comp.patchAddValues();
		expect(comp.denialform.reset).toHaveBeenCalled();
		expect(comp.modelSubmit).toContain('Save & Continue');
		expect(comp.modelTitle).toContain('Add');
	});
	it('Should check Reset Button when denialSerarchForm From Empty function Test', () => {
		comp.denialSerarchForm = comp.denialFormSearch();
		const retrunValue = isEmptyObject(comp.denialSerarchForm.value);
		comp.checkInputs();
		expect(retrunValue).toBe(true);
	});
	it('Should check Reset Button disabled when denialSerarchForm have values function Test', () => {
		comp.denialSerarchForm = comp.denialFormSearch();
		comp.denialSerarchForm.controls.name.setValue('mock name');
		comp.denialSerarchForm.controls.comments.setValue('mock comments');
		comp.denialSerarchForm.controls.description.setValue('mock description');
		const retrunValue = isEmptyObject(comp.denialSerarchForm.value);
		comp.checkInputs();
		expect(retrunValue).toBe(false);
	});
	it('Should Test stringfy function which convert object', () => {
		const obj = comp.stringfy({ name: 'name mock' });
		expect(obj).toContain('{"name":"name mock"}');
	});
	it('Should Test closeModel when denialform dirty and touched false', fakeAsync(() => {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('paymentType', ngbModalOptions);
		comp.denialform = comp['fb'].group({
			name: ['name'],
			comments: ['comment'],
			description: ['desc'],
		});
		spyOn(comp.denialform,'reset');
		comp.denialform.reset();
		comp.closeModel();
		comp.modalRef.close();
		expect(comp.denialform.reset).toHaveBeenCalled();
	}));
	it('Should Test closeModel when denialform dirty and touched true', fakeAsync(() => {
		// const spyOnMethod = spyOn(comp['CanDeactivateService'], 'canDeactivate').and.returnValue(of([]));
		const subspy = spyOn(canDeactive_MockService.canDeactivate(), 'subscribe');
		comp.denialform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.denialform.markAsTouched();
		comp.denialform.markAsDirty();
		comp.closeModel();
		tick();
		// expect(spyOnMethod).toHaveBeenCalledBefore(subspy);
		expect(subspy).toHaveBeenCalled();
	}));
	it('Should Test closeModel when denialform dirty and touched true and subcribe throw error', fakeAsync(() => {
		// const spyOnMethod = spyOn(comp['CanDeactivateService'], 'canDeactivate').and.returnValue(of([]));
		const subspy = spyOn(canDeactive_MockService.canDeactivate(false), 'subscribe');
		comp.denialform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.denialform.markAsTouched();
		comp.denialform.markAsDirty();
		comp.closeModel();
		tick();
		// expect(spyOnMethod).toHaveBeenCalledBefore(subspy);
		expect(subspy).toHaveBeenCalled();
	}));
	it('Should displayDenialUpdated with denialComingData empty', fakeAsync(() => {
		const formValue: any = {
			comments: 'comments',
			description: 'description',
			name: 'name',
			status:true,
			comingData:[]
		};
		comp.denialSerarchForm = denialFormSearch();
		comp.denialSerarchForm.controls['name'].setValue(formValue.comments);
		comp.denialSerarchForm.controls['comments'].setValue(formValue.description);
		comp.denialSerarchForm.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.displayDenialUpdated(formValue);
        fixture.detectChanges();
		expect(comp.loadSpin).toBeTruthy();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		debugger;
		expect(comp.denialComingData.length).toBe(0);
		expect(comp['denialPage'].totalElements).toBe(0);
    }));
	it('Should Test resetDenial function',()=>{
		spyOn(comp,'denialSetPage');
		spyOn(comp['fb'],'group');
		comp.denialSerarchForm = comp.denialFormSearch();
		comp.resetDenial();
		expect(comp.denialSetPage).toHaveBeenCalled();
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
		comp.denialform = comp.denialFormSearch();
		comp.denialform.controls.name.setValue('mock name');
		comp.denialform.controls.comments.setValue('mock comments');
		comp.denialform.controls.description.setValue('mock description');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.updateDeniatSubmit(comp.denialform);
        fixture.detectChanges();
		expect(comp.loadSpin).toBeTruthy();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		comp.modalRef.close();
		expect(comp.loadSpin).toBeFalsy();
	}));
	it('Should Test onSaveDeniatSubmit function',()=>{
		spyOn(comp,'creatDeniatSubmit');
		comp.denialSerarchForm = comp.denialFormSearch();
		comp.denialSerarchForm.controls.name.setValue('mock name');
		comp.denialSerarchForm.controls.comments.setValue('mock comments');
		comp.denialSerarchForm.controls.description.setValue('mock description');
		comp.onSaveDeniatSubmit(comp.denialSerarchForm.value);
		comp.modelTitle = 'Add';
		expect(comp.creatDeniatSubmit).toHaveBeenCalled();
	});
	it('Should Test onSaveDeniatSubmit function without Add',()=>{
		spyOn(comp,'updateDeniatSubmit');
		comp.denialSerarchForm = comp.denialFormSearch();
		comp.denialSerarchForm.controls.name.setValue('mock name');
		comp.denialSerarchForm.controls.comments.setValue('mock comments');
		comp.denialSerarchForm.controls.description.setValue('mock description');
		comp.modelTitle = 'Edit';
		comp.onSaveDeniatSubmit(comp.denialSerarchForm.value);
		expect(comp.updateDeniatSubmit).toHaveBeenCalled();
	});
	it('Should Test openDenialModal function',()=>{
		spyOn(comp,'patchAddValues');
		comp.denialSerarchForm = comp.denialFormSearch();
		comp.denialSerarchForm.controls.name.setValue('mock name');
		comp.denialSerarchForm.controls.comments.setValue('mock comments');
		comp.denialSerarchForm.controls.description.setValue('mock description');
		comp.openDenialModal(undefined,undefined,undefined);
		expect(comp.patchAddValues).toHaveBeenCalled();
	});
	it('Should Test openDenialModal function with row not undefined',()=>{
		spyOn(comp,'patchEditValues');
		comp.denialSerarchForm = comp.denialFormSearch();
		comp.denialSerarchForm.controls.name.setValue('mock name');
		comp.denialSerarchForm.controls.comments.setValue('mock comments');
		comp.denialSerarchForm.controls.description.setValue('mock description');
		comp.openDenialModal(undefined,1,3);
		expect(comp.patchEditValues).toHaveBeenCalled();
	});
	it('Should Test openDenialModal function with row null',()=>{
		spyOn(comp,'patchAddValues');
		comp.denialSerarchForm = comp.denialFormSearch();
		comp.denialSerarchForm.controls.name.setValue('mock name');
		comp.denialSerarchForm.controls.comments.setValue('mock comments');
		comp.denialSerarchForm.controls.description.setValue('mock description');
		comp.openDenialModal(undefined,null,3);
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
