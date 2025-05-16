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
import { VerificationTypeComponent } from './verification-type.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
describe('VerificationTypeComponent', () => {
	let comp: VerificationTypeComponent;
	let fixture: ComponentFixture<VerificationTypeComponent>;
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
			declarations: [VerificationTypeComponent],
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
		fixture = TestBed.createComponent(VerificationTypeComponent);
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
	function verifiacationsearch(): FormGroup {
		return comp['fb'].group({
			name: [''],
			comments: [''],
			description: [''],
		});
	}
	it('should form valid on empty', async(() => {
		const form = verifiacationsearch();
		form.controls['name'].setValue('');
		form.controls['comments'].setValue('');
		form.controls['description'].setValue('');
		expect(form.valid).toBeTruthy();
	}));
	it('Should createVerificationFormSubmit', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'description',
			name: 'name',
			status:true
		};
		const spyOnMethod = spyOn(comp['requestService'], 'sendRequest').and.returnValue(of(formValue));
		const subspy = spyOn(request_MockService.sendRequest(), 'subscribe');
		comp.verificationform = verifiacationsearch();
		comp.verificationform.controls['name'].setValue(formValue.name);
		comp.verificationform.controls['comments'].setValue(formValue.comments);
		comp.verificationform.controls['description'].setValue(formValue.description);
		tick(15000);
		discardPeriodicTasks();
		debugger;
		comp.createVerificationFormSubmit(comp.verificationform.value);
		expect(comp.loadSpin).toBeTruthy();
		expect(spyOnMethod).toHaveBeenCalledBefore(subspy);
		expect(subspy).toHaveBeenCalled();
	}));
	it('Should createVerificationFormSubmit function test when status false', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'desc',
			name: 'name',
		};
		comp.verificationform = verifiacationsearch();
		comp.verificationform.controls['name'].setValue(formValue.comments);
		comp.verificationform.controls['comments'].setValue(formValue.description);
		comp.verificationform.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(throwError('error') );
		comp.createVerificationFormSubmit(formValue);
        expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp.loadSpin).toBeFalsy();
	}));
	it('Should createVerificationFormSubmit Subscribe body test when status true', fakeAsync(() => {
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
		comp.verificationform = verifiacationsearch();
		comp.verificationform.controls['name'].setValue(formValue.comments);
		comp.verificationform.controls['comments'].setValue(formValue.description);
		comp.verificationform.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.createVerificationFormSubmit(formValue);
        fixture.detectChanges();
		expect(comp.loadSpin).toBeTruthy();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		comp.modalRef.close();
		expect(comp.loadSpin).toBeFalsy();
    }));
	it('Should VerificationsetPage function test', () => {
		debugger;
		spyOn(comp, 'addUrlQueryParams');
		spyOn(comp, 'displayUpdatedGetVerification');
		spyOn(comp['verificationSelection'], 'clear');
		comp.verificationform = comp.verifiacationsearch();
		const pageInfo = {
			offset: 0,
		};
		comp['verificationPage'].pageNumber = pageInfo.offset;
		const pageNumber = comp['verificationPage'].pageNumber + 1;
		comp.verificationform.controls.name.setValue('Your name');
		comp.verificationform.controls.comments.setValue('Your comments');
		comp.verificationform.controls.description.setValue('Your description');
		const filters = checkReactiveFormIsEmpty(comp.verificationform);
		comp['queryParams'] = {
			filter: !isObjectEmpty(filters),
			order: OrderEnum.ASC,
			per_page: comp['verificationPage'].size || 10,
			page: pageNumber,
			pagination: true,
			order_by: 'name',
		};
		let queryparam = { per_page: comp['verificationPage'].size, page: pageNumber };
		expect(comp['verificationPage'].pageNumber).toBe(pageInfo.offset);
		const formValue: any = {
			comments: 'comments',
			description: 'description',
			name: 'name',
		};
		comp.verificationform = verifiacationsearch();
		comp.verificationform.controls['name'].setValue(formValue.name);
		comp.verificationform.controls['comments'].setValue(formValue.comments);
		comp.verificationform.controls['description'].setValue(formValue.description);
		comp.createVerificationFormSubmit(comp.verificationform);
	});
	it('Should displayUpdatedGetVerification function test when subscribe throw error', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'desc',
			name: 'name',
		};
		comp.verificationSearchForm = verifiacationsearch();
		comp.verificationSearchForm.controls['name'].setValue(formValue.comments);
		comp.verificationSearchForm.controls['comments'].setValue(formValue.description);
		comp.verificationSearchForm.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(throwError('error') );
		comp.displayUpdatedGetVerification(formValue);
        expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp.loadSpin).toBeFalsy();
	}));
	it('Should closeModel function test when subscribe return empty responce	', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'desc',
			name: 'name',
		};
		comp.verificationform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.verificationform.markAsTouched();
		comp.verificationform.markAsDirty();
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
		comp.verificationform = comp['fb'].group({
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
		comp.verificationform.markAsTouched();
		comp.verificationform.markAsDirty();
		spyOn(comp.verificationform,'reset');
        spyOn(canDeactive_MockService, 'canDeactivate').and.returnValue(of([]));
		comp.closeModel();
		comp.modalRef.close();
        expect(comp.verificationform.reset).toHaveBeenCalled();
	}));
	it('Should onEditVerificationTypeSubmit function test when subscribe throw error', fakeAsync(() => {
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
		comp.verificationform = verifiacationsearch();
		comp.verificationform.controls['name'].setValue(formValue.comments);
		comp.verificationform.controls['comments'].setValue(formValue.description);
		comp.verificationform.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(throwError('error') );
		comp.onEditVerificationTypeSubmit(formValue);
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
		spyOn(comp, 'verifiacationsearch');
		spyOn(comp, 'VerificationsetPage');
		spyOn(comp['fb'], 'group');
		// spyOn(comp['_route'].queryParams,'subscribe').and.returnValue(of([MockRowValue]));
		// spyOn(comp.subscription,'push').and.returnValue(of([MockRowValue]));

		comp.ngOnInit();
		tick();
		expect(comp.setTitle).toHaveBeenCalled();
		expect(comp['verifiacationsearch']).toHaveBeenCalled();
		expect(comp['fb'].group).toHaveBeenCalled();
		expect(comp.subscription.push).toHaveBeenCalled();

	}));
	it('Should Test verifiacationsearch', () => {
		spyOn(comp['fb'], 'group');
		comp.verifiacationsearch();
		expect(comp['fb'].group).toHaveBeenCalled();
	});
	it('Should Test isverificationAllSelected', () => {
		comp.verificationTypeComingData.length = 10;
		comp.verificationTotalRows = comp.verificationTypeComingData.length;
		comp['verificationSelection'].selected.length = 10;
		comp.isverificationAllSelected();
		expect(comp.verificationTotalRows).toBe(comp['verificationSelection'].selected.length);
	});
	it('Should Test isverificationAllSelected', () => {
		comp.verificationTypeComingData.length = 10;
		comp.verificationTotalRows = comp.verificationTypeComingData.length;
		comp['verificationSelection'].selected.length = 10;
		comp.isverificationAllSelected();
		expect(comp.verificationTotalRows).toBe(comp['verificationSelection'].selected.length);
	});
	it('Should Test verificationmasterToggle when isSelected True', () => {
		// spyOn(comp, 'isverificationAllSelected').and.returnValue(of(true));
		spyOn(comp['verificationSelection'], 'clear');
		comp.verificationmasterToggle();
		expect(comp.isverificationAllSelected).toHaveBeenCalled();
		expect(comp['verificationSelection'].clear).toHaveBeenCalled();
	});
	it('Should Test verificationmasterToggle when isSelected False', () => {
		spyOn(comp, 'isverificationAllSelected').and.returnValue(false);
		comp.verificationTotalRows = 5;
		comp.verificationmasterToggle();
		comp.verificationTypeComingData = [2];
		expect(comp.isverificationAllSelected).toHaveBeenCalled();
	});
	it('Should Test page limit function', () => {
		spyOn(comp, 'VerificationsetPage');
		comp.verificationPageLimit('3');
		expect(comp.VerificationsetPage).toHaveBeenCalled();
		expect(comp['verificationPage'].size).toBe(3);
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
		comp.verificationform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.verificationTypeComingData = mockPaymentTypeList;
		comp.patchEditValues(MockRowValue, MockRowIndex);
		expect(comp.modelSubmit).toBe('Update');
		expect(comp.modelTitle).toBe('Edit');
	});
	it('Should Test patchAddValues', () => {
		comp.verificationform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		spyOn(comp.verificationform, 'reset');
		comp.patchAddValues();
		expect(comp.verificationform.reset).toHaveBeenCalled();
		expect(comp.modelSubmit).toContain('Save & Continue');
		expect(comp.modelTitle).toContain('Add');
	});
	it('Should check Reset Button when verificationSearchForm From Empty function Test', () => {
		comp.verificationSearchForm = comp.verifiacationsearch();
		const retrunValue = isEmptyObject(comp.verificationSearchForm.value);
		comp.checkInputs();
		expect(retrunValue).toBe(true);
	});
	it('Should check Reset Button disabled when verificationSearchForm have values function Test', () => {
		comp.verificationSearchForm = comp.verifiacationsearch();
		comp.verificationSearchForm.controls.name.setValue('mock name');
		comp.verificationSearchForm.controls.comments.setValue('mock comments');
		comp.verificationSearchForm.controls.description.setValue('mock description');
		const retrunValue = isEmptyObject(comp.verificationSearchForm.value);
		comp.checkInputs();
		expect(retrunValue).toBe(false);
	});
	it('Should Test stringfy function which convert object', () => {
		const obj = comp.stringfy({ name: 'name mock' });
		expect(obj).toContain('{"name":"name mock"}');
	});
	it('Should Test closeModel when verificationform dirty and touched false', fakeAsync(() => {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('paymentType', ngbModalOptions);
		comp.verificationform = comp['fb'].group({
			name: ['name'],
			comments: ['comment'],
			description: ['desc'],
		});
		spyOn(comp.verificationform,'reset');
		comp.verificationform.reset();
		comp.closeModel();
		comp.modalRef.close();
		expect(comp.verificationform.reset).toHaveBeenCalled();
	}));
	it('Should Test closeModel when verificationform dirty and touched true', fakeAsync(() => {
		// const spyOnMethod = spyOn(comp['CanDeactivateService'], 'canDeactivate').and.returnValue(of([]));
		const subspy = spyOn(canDeactive_MockService.canDeactivate(), 'subscribe');
		comp.verificationform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.verificationform.markAsTouched();
		comp.verificationform.markAsDirty();
		comp.closeModel();
		tick();
		// expect(spyOnMethod).toHaveBeenCalledBefore(subspy);
		expect(subspy).toHaveBeenCalled();
	}));
	it('Should Test closeModel when verificationform dirty and touched true and subcribe throw error', fakeAsync(() => {
		// const spyOnMethod = spyOn(comp['CanDeactivateService'], 'canDeactivate').and.returnValue(of([]));
		const subspy = spyOn(canDeactive_MockService.canDeactivate(false), 'subscribe');
		comp.verificationform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.verificationform.markAsTouched();
		comp.verificationform.markAsDirty();
		comp.closeModel();
		tick();
		// expect(spyOnMethod).toHaveBeenCalledBefore(subspy);
		expect(subspy).toHaveBeenCalled();
	}));
	it('Should displayUpdatedGetVerification with verificationTypeComingData empty', fakeAsync(() => {
		const formValue: any = {
			comments: 'comments',
			description: 'description',
			name: 'name',
			status:true,
			result:[]
		};
		comp.verificationSearchForm = verifiacationsearch();
		comp.verificationSearchForm.controls['name'].setValue(formValue.comments);
		comp.verificationSearchForm.controls['comments'].setValue(formValue.description);
		comp.verificationSearchForm.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.displayUpdatedGetVerification(formValue);
        fixture.detectChanges();
		expect(comp.loadSpin).toBeTruthy();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		expect(comp.verificationTypeComingData.length).toBe(0);
		expect(comp['verificationPage'].totalElements).toBe(0);
    }));
	it('Should Test resetVerification function',()=>{
		spyOn(comp,'VerificationsetPage');
		spyOn(comp['fb'],'group');
		comp.verificationSearchForm = comp.verifiacationsearch();
		comp.resetVerification();
		expect(comp.VerificationsetPage).toHaveBeenCalled();
		expect(comp['fb'].group).toHaveBeenCalled();
	});
	it('Should Test onEditVerificationTypeSubmit function when subsribe run successfull',fakeAsync(()=>{
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
		comp.verificationform = comp.verifiacationsearch();
		comp.verificationform.controls.name.setValue('mock name');
		comp.verificationform.controls.comments.setValue('mock comments');
		comp.verificationform.controls.description.setValue('mock description');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.onEditVerificationTypeSubmit(comp.verificationform);
        fixture.detectChanges();
		expect(comp.loadSpin).toBeTruthy();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		comp.modalRef.close();
		expect(comp.loadSpin).toBeFalsy();
	}));
	it('Should Test onVerificationTypeSubmit function',()=>{
		spyOn(comp,'createVerificationFormSubmit');
		comp.verificationSearchForm = comp.verifiacationsearch();
		comp.verificationSearchForm.controls.name.setValue('mock name');
		comp.verificationSearchForm.controls.comments.setValue('mock comments');
		comp.verificationSearchForm.controls.description.setValue('mock description');
		comp.onVerificationTypeSubmit(comp.verificationSearchForm.value);
		comp.modelTitle = 'Add';
		expect(comp.createVerificationFormSubmit).toHaveBeenCalled();
	});
	it('Should Test onVerificationTypeSubmit function without Add',()=>{
		spyOn(comp,'onEditVerificationTypeSubmit');
		comp.verificationSearchForm = comp.verifiacationsearch();
		comp.verificationSearchForm.controls.name.setValue('mock name');
		comp.verificationSearchForm.controls.comments.setValue('mock comments');
		comp.verificationSearchForm.controls.description.setValue('mock description');
		comp.modelTitle = 'Edit';
		comp.onVerificationTypeSubmit(comp.verificationSearchForm.value);
		expect(comp.onEditVerificationTypeSubmit).toHaveBeenCalled();
	});
	it('Should Test verificationOpenModal function',()=>{
		spyOn(comp,'patchAddValues');
		comp.verificationSearchForm = comp.verifiacationsearch();
		comp.verificationSearchForm.controls.name.setValue('mock name');
		comp.verificationSearchForm.controls.comments.setValue('mock comments');
		comp.verificationSearchForm.controls.description.setValue('mock description');
		comp.verificationOpenModal(undefined,undefined,undefined);
		expect(comp.patchAddValues).toHaveBeenCalled();
	});
	it('Should Test verificationOpenModal function with row not undefined',()=>{
		spyOn(comp,'patchEditValues');
		comp.verificationSearchForm = comp.verifiacationsearch();
		comp.verificationSearchForm.controls.name.setValue('mock name');
		comp.verificationSearchForm.controls.comments.setValue('mock comments');
		comp.verificationSearchForm.controls.description.setValue('mock description');
		comp.verificationOpenModal(undefined,1,3);
		expect(comp.patchEditValues).toHaveBeenCalled();
	});
	it('Should Test verificationOpenModal function with row null',()=>{
		spyOn(comp,'patchAddValues');
		comp.verificationSearchForm = comp.verifiacationsearch();
		comp.verificationSearchForm.controls.name.setValue('mock name');
		comp.verificationSearchForm.controls.comments.setValue('mock comments');
		comp.verificationSearchForm.controls.description.setValue('mock description');
		comp.verificationOpenModal(undefined,null,3);
		expect(comp.patchAddValues).toHaveBeenCalled();
	});
	it('Should Verificationstringfy Test which return json stringify',()=>{
		const formValue: any = {
			comments: 'comments',
			description: 'description',
			name: 'name',
			status:true,
			result:[]
		};
		let JSON_String = comp.Verificationstringfy(formValue);
		expect(JSON_String).toEqual(JSON.stringify(formValue));
	});
	afterAll(() => {
		TestBed.resetTestingModule();
	  });
});
