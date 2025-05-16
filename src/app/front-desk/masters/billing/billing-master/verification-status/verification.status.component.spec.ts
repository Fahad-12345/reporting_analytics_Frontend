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
import { BillVerifcationStatusComponent } from './verification.status.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('BillVerifcationStatusComponent', () => {
	let comp: BillVerifcationStatusComponent;
	let fixture: ComponentFixture<BillVerifcationStatusComponent>;
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
			declarations: [BillVerifcationStatusComponent],
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
		fixture = TestBed.createComponent(BillVerifcationStatusComponent);
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
	function verificationFormSearch(): FormGroup {
		return comp['fb'].group({
			name: [''],
			comments: [''],
			description: [''],
		});
	}
	it('should form valid on empty', async(() => {
		const form = verificationFormSearch();
		form.controls['name'].setValue('');
		form.controls['comments'].setValue('');
		form.controls['description'].setValue('');
		expect(form.valid).toBeTruthy();
	}));
	it('Should createVerificationStatusSubmit', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'description',
			name: 'name',
			status:true
		};
		const spyOnMethod = spyOn(comp['requestService'], 'sendRequest').and.returnValue(of(formValue));
		const subspy = spyOn(request_MockService.sendRequest(), 'subscribe');
		comp.verificationStatusform = verificationFormSearch();
		comp.verificationStatusform.controls['name'].setValue(formValue.name);
		comp.verificationStatusform.controls['comments'].setValue(formValue.comments);
		comp.verificationStatusform.controls['description'].setValue(formValue.description);
		tick();
		expect(comp.loadSpin).toBeFalsy();
		comp.createVerificationStatusSubmit(comp.verificationStatusform.value);
		expect(comp.loadSpin).toBeFalsy();
		expect(spyOnMethod).toHaveBeenCalledBefore(subspy);
		expect(subspy).toHaveBeenCalled();
	}));
	it('Should createVerificationStatusSubmit function test when createVerificationStatusSubmit complete', () => {
		const formValue: any = {
			comments: 'comment',
			description: 'desc',
			name: 'name',
		};
		comp.verificationStatusform = verificationFormSearch();
		comp.verificationStatusform.controls['name'].setValue(formValue.comments);
		comp.verificationStatusform.controls['comments'].setValue(formValue.description);
		comp.verificationStatusform.controls['description'].setValue(formValue.name);
        // spyOn(request_MockService, 'sendRequest').and.returnValue(throwError('error') );
		
		
		comp.createVerificationStatusSubmit(formValue);
		fixture.detectChanges();
		
        // expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp.loadSpin).toBeFalsy();
	});
	it('Should createVerificationStatusSubmit function when Subscribe throw error ', fakeAsync(() => {
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
		comp.verificationStatusform = verificationFormSearch();
		comp.verificationStatusform.controls['name'].setValue(formValue.comments);
		comp.verificationStatusform.controls['comments'].setValue(formValue.description);
		comp.verificationStatusform.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(throwError('error') );
		comp.createVerificationStatusSubmit(formValue);
        fixture.detectChanges();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		comp.modalRef.close();
		expect(comp.loadSpin).toBeFalsy();
		expect(comp.disableBtn).toBeFalsy();
    }));
	it('Should createVerificationStatusSubmit Subscribe body test when status true', fakeAsync(() => {
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
		comp.verificationStatusform = verificationFormSearch();
		comp.verificationStatusform.controls['name'].setValue(formValue.comments);
		comp.verificationStatusform.controls['comments'].setValue(formValue.description);
		comp.verificationStatusform.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.createVerificationStatusSubmit(formValue);
        fixture.detectChanges();
		expect(comp.loadSpin).toBeTruthy();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		comp.modalRef.close();
		expect(comp.loadSpin).toBeFalsy();
    }));
	it('Should verificationStatusSetPage function test', () => {
		spyOn(comp, 'addUrlQueryParams');
		spyOn(comp, 'displayDenialUpdated');
		spyOn(comp['verificationStatusSelection'], 'clear');
		comp.verificationStatusform = comp.verificationFormSearch();
		const pageInfo = {
			offset: 0,
		};
		comp['VerificationStatusPage'].pageNumber = pageInfo.offset;
		const pageNumber = comp['VerificationStatusPage'].pageNumber + 1;
		comp.verificationStatusform.controls.name.setValue('Your name');
		comp.verificationStatusform.controls.comments.setValue('Your comments');
		comp.verificationStatusform.controls.description.setValue('Your description');
		const filters = checkReactiveFormIsEmpty(comp.verificationStatusform);
		comp['queryParams'] = {
			filter: !isObjectEmpty(filters),
			order: OrderEnum.ASC,
			per_page: comp['VerificationStatusPage'].size || 10,
			page: pageNumber,
			pagination: true,
			order_by: 'name',
		};
		let queryparam = { per_page: comp['VerificationStatusPage'].size, page: pageNumber };
		expect(comp['VerificationStatusPage'].pageNumber).toBe(pageInfo.offset);
		// expect(comp['verificationStatusSelection'].clear).toHaveBeenCalled();
		const formValue: any = {
			comments: 'comments',
			description: 'description',
			name: 'name',
		};
		comp.verificationStatusform = verificationFormSearch();
		comp.verificationStatusform.controls['name'].setValue(formValue.name);
		comp.verificationStatusform.controls['comments'].setValue(formValue.comments);
		comp.verificationStatusform.controls['description'].setValue(formValue.description);
		comp.verificationStatusSetPage(pageInfo);
		expect(comp.addUrlQueryParams).toHaveBeenCalled();
		expect(comp.displayDenialUpdated).toHaveBeenCalled();
	});
	it('Should displayDenialUpdated function test when subscribe throw error', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'desc',
			name: 'name',
		};
		comp.verificationStatusSerarchForm = verificationFormSearch();
		comp.verificationStatusSerarchForm.controls['name'].setValue(formValue.comments);
		comp.verificationStatusSerarchForm.controls['comments'].setValue(formValue.description);
		comp.verificationStatusSerarchForm.controls['description'].setValue(formValue.name);
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
		comp.verificationStatusform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.verificationStatusform.markAsTouched();
		comp.verificationStatusform.markAsDirty();
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
		comp.verificationStatusform = comp['fb'].group({
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
		comp.verificationStatusform.markAsTouched();
		comp.verificationStatusform.markAsDirty();
		spyOn(comp.verificationStatusform,'reset');
        spyOn(canDeactive_MockService, 'canDeactivate').and.returnValue(of([]));
		comp.closeModel();
		comp.modalRef.close();
        expect(comp.verificationStatusform.reset).toHaveBeenCalled();
	}));
	it('Should displayDenialUpdated function test when subscribe throw error', fakeAsync(() => {
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
		comp.verificationStatusform = verificationFormSearch();
		comp.verificationStatusform.controls['name'].setValue(formValue.comments);
		comp.verificationStatusform.controls['comments'].setValue(formValue.description);
		comp.verificationStatusform.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(throwError('error') );
		comp.displayDenialUpdated(formValue);
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
		spyOn(comp, 'verificationFormSearch');
		spyOn(comp['fb'], 'group');
		// spyOn(comp['_route'].queryParams,'subscribe').and.returnValue(of([MockRowValue]));
		// spyOn(comp.subscription,'push').and.returnValue(of([MockRowValue]));

		comp.ngOnInit();
		tick();
		expect(comp.setTitle).toHaveBeenCalled();
		expect(comp['verificationFormSearch']).toHaveBeenCalled();
		expect(comp['fb'].group).toHaveBeenCalled();
		expect(comp.subscription.push).toHaveBeenCalled();

	}));
	it('Should Test verificationFormSearch', () => {
		spyOn(comp['fb'], 'group');
		comp.verificationFormSearch();
		expect(comp['fb'].group).toHaveBeenCalled();
	});
	it('Should Test isverificationStatusAllSelected', () => {
		comp.verificationStatusComingData.length = 10;
		comp.verificationStatusTotalRows = comp.verificationStatusComingData.length;
		comp['verificationStatusSelection'].selected.length = 10;
		comp.isverificationStatusAllSelected();
		expect(comp.verificationStatusTotalRows).toBe(comp['verificationStatusSelection'].selected.length);
	});
	it('Should Test isverificationStatusAllSelected', () => {
		comp.verificationStatusComingData.length = 10;
		comp.verificationStatusTotalRows = comp.verificationStatusComingData.length;
		comp['verificationStatusSelection'].selected.length = 10;
		comp.isverificationStatusAllSelected();
		expect(comp.verificationStatusTotalRows).toBe(comp['verificationStatusSelection'].selected.length);
	});
	it('Should Test verifcationStatusmasterToggle when isSelected True', () => {
		// spyOn(comp, 'isverificationStatusAllSelected').and.returnValue(of(true));
		spyOn(comp['verificationStatusSelection'], 'clear');
		comp.verifcationStatusmasterToggle();
		expect(comp.isverificationStatusAllSelected).toHaveBeenCalled();
		expect(comp['verificationStatusSelection'].clear).toHaveBeenCalled();
	});
	it('Should Test verifcationStatusmasterToggle when isSelected False', () => {
		spyOn(comp, 'isverificationStatusAllSelected').and.returnValue(false);
		comp.verificationStatusTotalRows = 5;
		comp.verifcationStatusmasterToggle();
		comp.verificationStatusComingData = [2];
		expect(comp.isverificationStatusAllSelected).toHaveBeenCalled();
	});
	it('Should Test page limit function', () => {
		spyOn(comp, 'verificationStatusSetPage');
		comp.verificationStatusPageLimit('3');
		expect(comp.verificationStatusSetPage).toHaveBeenCalled();
		expect(comp['VerificationStatusPage'].size).toBe(3);
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
		comp.verificationStatusform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.verificationStatusComingData = mockPlaceOfServiceList;
		comp.patchEditValues(MockRowValue, MockRowIndex);
		expect(comp.modelSubmit).toBe('Update');
		expect(comp.modelTitle).toBe('Edit');
	});
	it('Should Test patchAddValues', () => {
		comp.verificationStatusform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			code: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		spyOn(comp.verificationStatusform, 'reset');
		comp.patchAddValues();
		expect(comp.verificationStatusform.reset).toHaveBeenCalled();
		expect(comp.modelSubmit).toContain('Save & Continue');
		expect(comp.modelTitle).toContain('Add');
	});
	it('Should check Reset Button when verificationStatusSerarchForm From Empty function Test', () => {
		comp.verificationStatusSerarchForm = comp.verificationFormSearch();
		const retrunValue = isEmptyObject(comp.verificationStatusSerarchForm.value);
		comp.checkInputs();
		expect(retrunValue).toBe(true);
	});
	it('Should check Reset Button disabled when verificationStatusSerarchForm have values function Test', () => {
		comp.verificationStatusSerarchForm = comp.verificationFormSearch();
		comp.verificationStatusSerarchForm.controls.name.setValue('mock name');
		comp.verificationStatusSerarchForm.controls.comments.setValue('mock comments');
		comp.verificationStatusSerarchForm.controls.description.setValue('mock description');
		const retrunValue = isEmptyObject(comp.verificationStatusSerarchForm.value);
		comp.checkInputs();
		expect(retrunValue).toBe(false);
	});
	it('Should Test stringfy function which convert object', () => {
		const obj = comp.stringfy({ name: 'name mock' });
		expect(obj).toContain('{"name":"name mock"}');
	});
	it('Should Test closeModel when verificationStatusform dirty and touched false', fakeAsync(() => {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('PaymentStatusModel', ngbModalOptions);
		comp.verificationStatusform = comp['fb'].group({
			name: ['name'],
			comments: ['comment'],
			description: ['desc'],
		});
		spyOn(comp.verificationStatusform,'reset');
		comp.verificationStatusform.reset();
		comp.closeModel();
		comp.modalRef.close();
		expect(comp.verificationStatusform.reset).toHaveBeenCalled();
	}));
	it('Should Test closeModel when verificationStatusform dirty and touched true', fakeAsync(() => {
		// const spyOnMethod = spyOn(comp['CanDeactivateService'], 'canDeactivate').and.returnValue(of([]));
		const subspy = spyOn(canDeactive_MockService.canDeactivate(), 'subscribe');
		comp.verificationStatusform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.verificationStatusform.markAsTouched();
		comp.verificationStatusform.markAsDirty();
		comp.closeModel();
		tick();
		// expect(spyOnMethod).toHaveBeenCalledBefore(subspy);
		expect(subspy).toHaveBeenCalled();
	}));
	it('Should Test closeModel when verificationStatusform dirty and touched true and subcribe throw error', fakeAsync(() => {
		// const spyOnMethod = spyOn(comp['CanDeactivateService'], 'canDeactivate').and.returnValue(of([]));
		const subspy = spyOn(canDeactive_MockService.canDeactivate(false), 'subscribe');
		comp.verificationStatusform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.verificationStatusform.markAsTouched();
		comp.verificationStatusform.markAsDirty();
		comp.closeModel();
		tick();
		// expect(spyOnMethod).toHaveBeenCalledBefore(subspy);
		expect(subspy).toHaveBeenCalled();
	}));
	it('Should displayDenialUpdated with verificationStatusComingData empty', fakeAsync(() => {
		const formValue: any = {
			comments: 'comments',
			description: 'description',
			name: 'name',
			status:true,
			comingData:[]
		};
		comp.verificationStatusSerarchForm = verificationFormSearch();
		comp.verificationStatusSerarchForm.controls['name'].setValue(formValue.comments);
		comp.verificationStatusSerarchForm.controls['comments'].setValue(formValue.description);
		comp.verificationStatusSerarchForm.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.displayDenialUpdated(formValue);
        fixture.detectChanges();
		expect(comp.loadSpin).toBeTruthy();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		expect(comp.verificationStatusComingData.length).toBe(0);
		expect(comp['VerificationStatusPage'].totalElements).toBe(0);
    }));
	it('Should Test resetverificationStatus function',()=>{
		spyOn(comp,'verificationStatusSetPage');
		spyOn(comp['fb'],'group');
		comp.verificationStatusSerarchForm = comp.verificationFormSearch();
		comp.resetverificationStatus();
		expect(comp.verificationStatusSetPage).toHaveBeenCalled();
		expect(comp['fb'].group).toHaveBeenCalled();
	});
	it('Should Test displayDenialUpdated function when subsribe run successfull',fakeAsync(()=>{
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
		comp.verificationStatusform = comp.verificationFormSearch();
		comp.verificationStatusform.controls.name.setValue('mock name');
		comp.verificationStatusform.controls.comments.setValue('mock comments');
		comp.verificationStatusform.controls.description.setValue('mock description');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.displayDenialUpdated(comp.verificationStatusform);
        fixture.detectChanges();
		expect(comp.loadSpin).toBeTruthy();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		comp.modalRef.close();
		expect(comp.loadSpin).toBeFalsy();
	}));
	it('Should Test displayDenialUpdated function when subsribe run successfull and status false',fakeAsync(()=>{
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
		comp.verificationStatusform = comp.verificationFormSearch();
		comp.verificationStatusform.controls.name.setValue('mock name');
		comp.verificationStatusform.controls.comments.setValue('mock comments');
		comp.verificationStatusform.controls.description.setValue('mock description');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.displayDenialUpdated(comp.verificationStatusform);
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
	it('Should Test onSaveVerificationStatusSubmit function',()=>{
		spyOn(comp,'createVerificationStatusSubmit');
		comp.verificationStatusSerarchForm = comp.verificationFormSearch();
		comp.verificationStatusSerarchForm.controls.name.setValue('mock name');
		comp.verificationStatusSerarchForm.controls.comments.setValue('mock comments');
		comp.verificationStatusSerarchForm.controls.description.setValue('mock description');
		comp.onSaveVerificationStatusSubmit(comp.verificationStatusSerarchForm.value);
		comp.modelTitle = 'Add';
		expect(comp.createVerificationStatusSubmit).toHaveBeenCalled();
	});
	it('Should Test onSaveVerificationStatusSubmit function without Add',()=>{
		spyOn(comp,'updateVerificationSubmit');
		comp.verificationStatusform = comp.verificationFormSearch();
		comp.verificationStatusform.controls.name.setValue('mock name');
		comp.verificationStatusform.controls.comments.setValue('mock comments');
		comp.verificationStatusform.controls.description.setValue('mock description');
		comp.modelTitle = 'Edit';
		comp.onSaveVerificationStatusSubmit(comp.verificationStatusform.value);
		expect(comp.updateVerificationSubmit).toHaveBeenCalled();
	});
	it('Should Test openVerificaitionStatusModal function',()=>{
		spyOn(comp,'patchAddValues');
		comp.verificationStatusSerarchForm = comp.verificationFormSearch();
		comp.verificationStatusSerarchForm.controls.name.setValue('mock name');
		comp.verificationStatusSerarchForm.controls.comments.setValue('mock comments');
		comp.verificationStatusSerarchForm.controls.description.setValue('mock description');
		comp.openVerificaitionStatusModal(undefined,undefined,undefined);
		expect(comp.patchAddValues).toHaveBeenCalled();
	});
	it('Should Test openVerificaitionStatusModal function with row not undefined',()=>{
		spyOn(comp,'patchEditValues');
		comp.verificationStatusSerarchForm = comp.verificationFormSearch();
		comp.verificationStatusSerarchForm.controls.name.setValue('mock name');
		comp.verificationStatusSerarchForm.controls.comments.setValue('mock comments');
		comp.verificationStatusSerarchForm.controls.description.setValue('mock description');
		comp.openVerificaitionStatusModal(undefined,comp.verificationStatusSerarchForm.value,3);
		expect(comp.patchEditValues).toHaveBeenCalled();
	});
	it('Should Test openVerificaitionStatusModal function with row null',()=>{
		spyOn(comp,'patchAddValues');
		comp.verificationStatusSerarchForm = comp.verificationFormSearch();
		comp.verificationStatusSerarchForm.controls.name.setValue('mock name');
		comp.verificationStatusSerarchForm.controls.comments.setValue('mock comments');
		comp.verificationStatusSerarchForm.controls.description.setValue('mock description');
		comp.openVerificaitionStatusModal(undefined,null,3);
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
	it('Should updateVerificationSubmit', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'description',
			name: 'name',
			status:true
		};
		const spyOnMethod = spyOn(comp['requestService'], 'sendRequest').and.returnValue(of(formValue));
		const subspy = spyOn(request_MockService.sendRequest(), 'subscribe');
		comp.verificationStatusform = verificationFormSearch();
		comp.verificationStatusform.controls['name'].setValue(formValue.name);
		comp.verificationStatusform.controls['comments'].setValue(formValue.comments);
		comp.verificationStatusform.controls['description'].setValue(formValue.description);
		tick();
		expect(comp.loadSpin).toBeFalsy();
		comp.updateVerificationSubmit(comp.verificationStatusform.value);
		expect(comp.loadSpin).toBeFalsy();
		expect(spyOnMethod).toHaveBeenCalledBefore(subspy);
		expect(subspy).toHaveBeenCalled();
	}));
	it('Should updateVerificationSubmit function test when updateVerificationSubmit complete', () => {
		const formValue: any = {
			comments: 'comment',
			description: 'desc',
			name: 'name',
		};
		comp.verificationStatusform = verificationFormSearch();
		comp.verificationStatusform.controls['name'].setValue(formValue.comments);
		comp.verificationStatusform.controls['comments'].setValue(formValue.description);
		comp.verificationStatusform.controls['description'].setValue(formValue.name);
        // spyOn(request_MockService, 'sendRequest').and.returnValue(throwError('error') );
		
		
		comp.updateVerificationSubmit(formValue);
		fixture.detectChanges();
		
        // expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp.loadSpin).toBeFalsy();
	});
	it('Should updateVerificationSubmit function when Subscribe throw error ', fakeAsync(() => {
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
		comp.verificationStatusform = verificationFormSearch();
		comp.verificationStatusform.controls['name'].setValue(formValue.comments);
		comp.verificationStatusform.controls['comments'].setValue(formValue.description);
		comp.verificationStatusform.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(throwError('error') );
		comp.updateVerificationSubmit(formValue);
        fixture.detectChanges();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		comp.modalRef.close();
		expect(comp.loadSpin).toBeFalsy();
		expect(comp.disableBtn).toBeFalsy();
    }));
	it('Should updateVerificationSubmit Subscribe body test when status true', fakeAsync(() => {
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
		comp.verificationStatusform = verificationFormSearch();
		comp.verificationStatusform.controls['name'].setValue(formValue.comments);
		comp.verificationStatusform.controls['comments'].setValue(formValue.description);
		comp.verificationStatusform.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.updateVerificationSubmit(formValue);
        fixture.detectChanges();
		expect(comp.loadSpin).toBeTruthy();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		comp.modalRef.close();
		expect(comp.loadSpin).toBeFalsy();
    }));
	afterAll(() => {
		TestBed.resetTestingModule();
	  });
});
