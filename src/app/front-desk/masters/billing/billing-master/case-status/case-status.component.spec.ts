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
import { ConfirmMockService } from '@appDir/shared/mock-services/ConfirmMock.service';
import { CaseStatusComponent } from './case-status.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
describe('CaseStatusComponent', () => {
	let comp: CaseStatusComponent;
	let fixture: ComponentFixture<CaseStatusComponent>;
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
			declarations: [CaseStatusComponent],
			imports: [ToastrModule.forRoot(), SharedModule, RouterTestingModule,BrowserAnimationsModule,HttpClientTestingModule ],
			providers: [
				Config,
				LocalStorage,
				FormBuilder,
				{ provide: CanDeactivateModelComponentService, useValue: canDeactive_MockService },
				{ provide: RequestService, useValue: request_MockService },
				{ provide: ConfirmationService, useValue: confirm_MockService },
			],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(CaseStatusComponent);
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
	function initializeCaseForm(): FormGroup {
		return comp['fb'].group({
			name: [''],
			comments: [''],
			description: [''],
		});
	}
	it('should form valid on empty', async(() => {
		const form = initializeCaseForm();
		form.controls['name'].setValue('');
		form.controls['comments'].setValue('');
		form.controls['description'].setValue('');
		expect(form.valid).toBeTruthy();
	}));
	it('Should createCaseStatusFormSubmit', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'description',
			name: 'name',
			status:true
		};
		const spyOnMethod = spyOn(comp['requestService'], 'sendRequest').and.returnValue(of(formValue));
		const subspy = spyOn(request_MockService.sendRequest(), 'subscribe');
		comp.caseStatusform = initializeCaseForm();
		comp.caseStatusform.controls['name'].setValue(formValue.name);
		comp.caseStatusform.controls['comments'].setValue(formValue.comments);
		comp.caseStatusform.controls['description'].setValue(formValue.description);
		tick();
		expect(comp.loadSpin).toBeFalsy();
		comp.createCaseStatusFormSubmit(comp.caseStatusform.value);
		expect(comp.loadSpin).toBeTruthy();
		expect(spyOnMethod).toHaveBeenCalledBefore(subspy);
		expect(subspy).toHaveBeenCalled();
	}));
	it('Should createCaseStatusFormSubmit Subscribe body test when status false', fakeAsync(() => {
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
		comp.caseStatusform = initializeCaseForm();
		comp.caseStatusform.controls['name'].setValue(formValue.comments);
		comp.caseStatusform.controls['comments'].setValue(formValue.description);
		comp.caseStatusform.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(throwError('error') );
		comp.createCaseStatusFormSubmit(formValue);
        fixture.detectChanges();
		expect(comp.loadSpin).toBeFalsy();
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
		comp.caseStatusform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.caseStatusform.markAsTouched();
		comp.caseStatusform.markAsDirty();
        spyOn(canDeactive_MockService, 'canDeactivate').and.returnValue(of(null));
		let ReturnValue = comp.closeModel();
        expect(ReturnValue).toBeUndefined();
	}));
	it('Should createCaseStatusFormSubmit function test when createCaseStatusFormSubmit complete', () => {
		const formValue: any = {
			comments: 'comment',
			description: 'desc',
			name: 'name',
		};
		comp.caseStatusform = initializeCaseForm();
		comp.caseStatusform.controls['name'].setValue(formValue.comments);
		comp.caseStatusform.controls['comments'].setValue(formValue.description);
		comp.caseStatusform.controls['description'].setValue(formValue.name);
		comp.createCaseStatusFormSubmit(formValue);
		fixture.detectChanges();
		expect(comp.loadSpin).toBeFalsy();
	});
	it('Should createCaseStatusFormSubmit Subscribe body test when status true', fakeAsync(() => {
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
		comp.caseStatusform = initializeCaseForm();
		comp.caseStatusform.controls['name'].setValue(formValue.comments);
		comp.caseStatusform.controls['comments'].setValue(formValue.description);
		comp.caseStatusform.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.createCaseStatusFormSubmit(formValue);
        fixture.detectChanges();
		expect(comp.loadSpin).toBeTruthy();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		comp.modalRef.close();
		expect(comp.loadSpin).toBeFalsy();
    }));
	it('Should caseSetPgae function test', () => {
		spyOn(comp, 'addUrlQueryParams');
		spyOn(comp, 'dispalyUpdatedCaseStatus');
		spyOn(comp['caseStatusSelection'], 'clear');
		comp.caseStatusform = comp.initializeCaseForm();
		const pageInfo = {
			offset: 0,
		};
		comp['casePage'].pageNumber = pageInfo.offset;
		const pageNumber = comp['casePage'].pageNumber + 1;
		comp.caseStatusform.controls.name.setValue('Your name');
		comp.caseStatusform.controls.comments.setValue('Your comments');
		comp.caseStatusform.controls.description.setValue('Your description');
		const filters = checkReactiveFormIsEmpty(comp.caseStatusform);
		comp['queryParams'] = {
			filter: !isObjectEmpty(filters),
			order: OrderEnum.ASC,
			per_page: comp['casePage'].size || 10,
			page: pageNumber,
			pagination: true,
			order_by: 'name',
		};
		let queryparam = { per_page: comp['casePage'].size, page: pageNumber };
		expect(comp['casePage'].pageNumber).toBe(pageInfo.offset);
		// expect(comp['caseStatusSelection'].clear).toHaveBeenCalled();
		const formValue: any = {
			comments: 'comments',
			description: 'description',
			name: 'name',
		};
		comp.caseStatusform = initializeCaseForm();
		comp.caseStatusform.controls['name'].setValue(formValue.name);
		comp.caseStatusform.controls['comments'].setValue(formValue.comments);
		comp.caseStatusform.controls['description'].setValue(formValue.description);
		comp.caseSetPgae(pageInfo);
		expect(comp.addUrlQueryParams).toHaveBeenCalled();
		expect(comp.dispalyUpdatedCaseStatus).toHaveBeenCalled();
	});
	it('Should dispalyUpdatedCaseStatus function test when subscribe throw error', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'desc',
			name: 'name',
		};
		comp.caseSearchForm = initializeCaseForm();
		comp.caseSearchForm.controls['name'].setValue(formValue.comments);
		comp.caseSearchForm.controls['comments'].setValue(formValue.description);
		comp.caseSearchForm.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(throwError('error') );
		comp.dispalyUpdatedCaseStatus(formValue);
        expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp.loadSpin).toBeFalsy();
		flush();
	}));
	it('Should resetCase function test when subscribe return empty responce	', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'desc',
			name: 'name',
		};
		comp.caseStatusform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.caseStatusform.markAsTouched();
		comp.caseStatusform.markAsDirty();
        spyOn(canDeactive_MockService, 'canDeactivate').and.returnValue(of(null));
		let ReturnValue = comp.resetCase();
        expect(ReturnValue).toBeUndefined();
	}));
	it('Should closeModel function test when subscribe return not empty responce	', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'desc',
			name: 'name',
		};
		comp.caseStatusform = comp['fb'].group({
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
		comp.caseStatusform.markAsTouched();
		comp.caseStatusform.markAsDirty();
		spyOn(comp.caseStatusform,'reset');
        spyOn(canDeactive_MockService, 'canDeactivate').and.returnValue(of([]));
		comp.closeModel();
		comp.modalRef.close();
        expect(comp.caseStatusform.reset).toHaveBeenCalled();
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
		spyOn(comp, 'initializeCaseForm');
		spyOn(comp, 'casePage');
		spyOn(comp['fb'], 'group');
		spyOn(comp['_route'].queryParams,'subscribe').and.returnValue(of([MockRowValue]));
		spyOn(comp.subscription,'push').and.returnValue(of([MockRowValue]));

		comp.ngOnInit();
		tick();
		expect(comp.setTitle).toHaveBeenCalled();
		expect(comp['initializeCaseForm']).toHaveBeenCalled();
		expect(comp['fb'].group).toHaveBeenCalled();
		expect(comp.subscription.push).toHaveBeenCalled();

	}));
	it('Should Test initializeCaseForm', () => {
		spyOn(comp['fb'], 'group');
		comp.initializeCaseForm();
		expect(comp['fb'].group).toHaveBeenCalled();
	});
	it('Should Test isCaseStatusAllSelected', () => {
		comp.caseStatusComingData.length = 10;
		comp.caseStatusTotalRows = comp.caseStatusComingData.length;
		comp['caseStatusSelection'].selected.length = 10;
		comp.isCaseStatusAllSelected();
		expect(comp.caseStatusTotalRows).toBe(comp['caseStatusSelection'].selected.length);
	});
	it('Should Test isCaseStatusAllSelected', () => {
		comp.caseStatusComingData.length = 10;
		comp.caseStatusTotalRows = comp.caseStatusComingData.length;
		comp['caseStatusSelection'].selected.length = 10;
		comp.isCaseStatusAllSelected();
		expect(comp.caseStatusTotalRows).toBe(comp['caseStatusSelection'].selected.length);
	});
	it('Should Test CaseStatussmasterToggle when isSelected True', () => {
		spyOn(comp, 'isCaseStatusAllSelected').and.returnValue(of(true));
		spyOn(comp['caseStatusSelection'], 'clear');
		comp.CaseStatussmasterToggle();
		expect(comp.isCaseStatusAllSelected).toHaveBeenCalled();
		expect(comp['caseStatusSelection'].clear).toHaveBeenCalled();
	});
	it('Should Test CaseStatussmasterToggle when isSelected False', () => {
		spyOn(comp, 'isCaseStatusAllSelected').and.returnValue(false);
		comp.caseStatusTotalRows = 5;
		comp.CaseStatussmasterToggle();
		comp.caseStatusComingData = [2];
		expect(comp.isCaseStatusAllSelected).toHaveBeenCalled();
	});
	it('Should Test page limit function', () => {
		spyOn(comp, 'caseSetPgae');
		comp.casePageLimit('3');
		expect(comp.caseSetPgae).toHaveBeenCalled();
		expect(comp['casePage'].size).toBe(3);
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
		comp.caseStatusform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.caseStatusComingData = mockPlaceOfServiceList;
		comp.patchEditValues(MockRowValue, MockRowIndex);
		expect(comp.modelSubmit).toBe('Update');
		expect(comp.modelTitle).toBe('Edit');
	});
	it('Should Test patchAddValues', () => {
		comp.caseStatusform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			code: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		spyOn(comp.caseStatusform, 'reset');
		comp.patchAddValues();
		expect(comp.caseStatusform.reset).toHaveBeenCalled();
		expect(comp.modelSubmit).toContain('Save & Continue');
		expect(comp.modelTitle).toContain('Add');
	});
	it('Should check Reset Button when caseSearchForm From Empty function Test', () => {
		comp.caseSearchForm = comp.initializeCaseForm();
		const retrunValue = isEmptyObject(comp.caseSearchForm.value);
		comp.checkInputs();
		expect(retrunValue).toBe(true);
	});
	it('Should check Reset Button disabled when caseSearchForm have values function Test', () => {
		comp.caseSearchForm = comp.initializeCaseForm();
		comp.caseSearchForm.controls.name.setValue('mock name');
		comp.caseSearchForm.controls.comments.setValue('mock comments');
		comp.caseSearchForm.controls.description.setValue('mock description');
		const retrunValue = isEmptyObject(comp.caseSearchForm.value);
		comp.checkInputs();
		expect(retrunValue).toBe(false);
	});
	it('Should Test stringfy function which convert object', () => {
		const obj = comp.stringfy({ name: 'name mock' });
		expect(obj).toContain('{"name":"name mock"}');
	});
	it('Should Test closeModel when caseStatusform dirty and touched false', fakeAsync(() => {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('paymentType', ngbModalOptions);
		comp.caseStatusform = comp['fb'].group({
			name: ['name'],
			comments: ['comment'],
			description: ['desc'],
		});
		spyOn(comp.caseStatusform,'reset');
		comp.caseStatusform.reset();
		comp.closeModel();
		comp.modalRef.close();
		expect(comp.caseStatusform.reset).toHaveBeenCalled();
	}));
	it('Should Test closeModel when caseStatusform dirty and touched true', fakeAsync(() => {
		const spyOnMethod = spyOn(comp['CanDeactivateModelComponentService'], 'canDeactivate').and.returnValue(of([]));
		const subspy = spyOn(canDeactive_MockService.canDeactivate(), 'subscribe');
		comp.caseStatusform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.caseStatusform.markAsTouched();
		comp.caseStatusform.markAsDirty();
		comp.closeModel();
		tick();
		expect(spyOnMethod).toHaveBeenCalledBefore(subspy);
		expect(subspy).toHaveBeenCalled();
	}));
	it('Should Test closeModel when caseStatusform dirty and touched true and subcribe throw error', fakeAsync(() => {
		const spyOnMethod = spyOn(comp['CanDeactivateModelComponentService'], 'canDeactivate').and.returnValue(of([]));
		const subspy = spyOn(canDeactive_MockService.canDeactivate(false), 'subscribe');
		comp.caseStatusform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.caseStatusform.markAsTouched();
		comp.caseStatusform.markAsDirty();
		comp.closeModel();
		tick();
		expect(spyOnMethod).toHaveBeenCalledBefore(subspy);
		expect(subspy).toHaveBeenCalled();
	}));
	it('Should dispalyUpdatedCaseStatus with caseStatusComingData empty', fakeAsync(() => {
		const formValue: any = {
			comments: 'comments',
			description: 'description',
			name: 'name',
			status:true,
			comingData:[]
		};
		comp.caseSearchForm = initializeCaseForm();
		comp.caseSearchForm.controls['name'].setValue(formValue.comments);
		comp.caseSearchForm.controls['comments'].setValue(formValue.description);
		comp.caseSearchForm.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.dispalyUpdatedCaseStatus(formValue);
        fixture.detectChanges();
		expect(comp.loadSpin).toBeTruthy();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		expect(comp.caseStatusComingData.length).toBe(0);
		expect(comp['casePage'].totalElements).toBe(0);
    }));
	it('Should Test resetCase function',()=>{
		spyOn(comp,'caseSetPgae');
		spyOn(comp['fb'],'group');
		comp.caseSearchForm = comp.initializeCaseForm();
		comp.resetCase();
		expect(comp.caseSetPgae).toHaveBeenCalled();
		expect(comp['fb'].group).toHaveBeenCalled();
	});
	it('Should Test updateCaseStatusFormSubmit function when subsribe run successfull',fakeAsync(()=>{
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
		spyOn(comp.subscription, 'push').and.returnValue(
			of({
				body: {
					status: true,
				},
			}),
		);
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('paymentType', ngbModalOptions);
		comp.caseStatusform = comp.initializeCaseForm();
		comp.caseStatusform.controls.name.setValue('mock name');
		comp.caseStatusform.controls.comments.setValue('mock comments');
		comp.caseStatusform.controls.description.setValue('mock description');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.updateCaseStatusFormSubmit(comp.caseStatusform);
        fixture.detectChanges();
		expect(comp.loadSpin).toBeTruthy();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		comp.modalRef.close();
		expect(comp.loadSpin).toBeFalsy();
	}));
	it('Should Test updateCaseStatusFormSubmit function when subsribe run successfull and status false',fakeAsync(()=>{
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
		spyOn(comp.subscription, 'push').and.returnValue(
			of({
				body: {
					status: true,
				},
			}),
		);
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('paymentType', ngbModalOptions);
		comp.caseStatusform = comp.initializeCaseForm();
		comp.caseStatusform.controls.name.setValue('mock name');
		comp.caseStatusform.controls.comments.setValue('mock comments');
		comp.caseStatusform.controls.description.setValue('mock description');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.updateCaseStatusFormSubmit(comp.caseStatusform);
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
	it('Should Test updateCaseStatusFormSubmit function when subsribe run successfull and subscribe return error',fakeAsync(()=>{
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
		spyOn(comp.subscription, 'push').and.returnValue(
			of({
				body: {
					status: true,
				},
			}),
		);
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('paymentType', ngbModalOptions);
		comp.caseStatusform = comp.initializeCaseForm();
		comp.caseStatusform.controls.name.setValue('mock name');
		comp.caseStatusform.controls.comments.setValue('mock comments');
		comp.caseStatusform.controls.description.setValue('mock description');
		spyOn(request_MockService, 'sendRequest').and.returnValue(throwError('error'));
		comp.updateCaseStatusFormSubmit(comp.caseStatusform);
        fixture.detectChanges();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		fixture.detectChanges();
		tick(15000);
		discardPeriodicTasks();
		comp.modalRef.close();
		expect(comp.loadSpin).toBeFalsy();
	}));
	it('Should Test onCaseSubmit function',()=>{
		spyOn(comp,'createCaseStatusFormSubmit');
		comp.caseSearchForm = comp.initializeCaseForm();
		comp.caseSearchForm.controls.name.setValue('mock name');
		comp.caseSearchForm.controls.comments.setValue('mock comments');
		comp.caseSearchForm.controls.description.setValue('mock description');
		comp.onCaseSubmit(comp.caseSearchForm.value);
		comp.modelTitle = 'Add';
		expect(comp.createCaseStatusFormSubmit).toHaveBeenCalled();
	});
	it('Should Test onCaseSubmit function without Add',()=>{
		spyOn(comp,'updateCaseStatusFormSubmit');
		comp.caseSearchForm = comp.initializeCaseForm();
		comp.caseSearchForm.controls.name.setValue('mock name');
		comp.caseSearchForm.controls.comments.setValue('mock comments');
		comp.caseSearchForm.controls.description.setValue('mock description');
		comp.modelTitle = 'Edit';
		comp.onCaseSubmit(comp.caseSearchForm.value);
		expect(comp.updateCaseStatusFormSubmit).toHaveBeenCalled();
	});
	it('Should Test openCaseStatusModal function',()=>{
		spyOn(comp,'patchAddValues');
		comp.caseSearchForm = comp.initializeCaseForm();
		comp.caseSearchForm.controls.name.setValue('mock name');
		comp.caseSearchForm.controls.comments.setValue('mock comments');
		comp.caseSearchForm.controls.description.setValue('mock description');
		comp.openCaseStatusModal(undefined,undefined,undefined);
		expect(comp.patchAddValues).toHaveBeenCalled();
	});
	it('Should Test openCaseStatusModal function with row not undefined',()=>{
		spyOn(comp,'patchEditValues');
		comp.caseSearchForm = comp.initializeCaseForm();
		comp.caseSearchForm.controls.name.setValue('mock name');
		comp.caseSearchForm.controls.comments.setValue('mock comments');
		comp.caseSearchForm.controls.description.setValue('mock description');
		comp.openCaseStatusModal(undefined,comp.caseSearchForm.value,3);
		expect(comp.patchEditValues).toHaveBeenCalled();
	});
	it('Should Test openCaseStatusModal function with row null',()=>{
		spyOn(comp,'patchAddValues');
		comp.caseSearchForm = comp.initializeCaseForm();
		comp.caseSearchForm.controls.name.setValue('mock name');
		comp.caseSearchForm.controls.comments.setValue('mock comments');
		comp.caseSearchForm.controls.description.setValue('mock description');
		comp.openCaseStatusModal(undefined,null,3);
		expect(comp.patchAddValues).toHaveBeenCalled();
	});
	it('Should caseStatusstringfy Test which return json stringify',()=>{
		const formValue: any = {
			comments: 'comments',
			description: 'description',
			name: 'name',
			status:true,
			result:[]
		};
		let JSON_String = comp.caseStatusstringfy(formValue);
		expect(JSON_String).toEqual(JSON.stringify(formValue));
	});
	afterAll(() => {
		TestBed.resetTestingModule();
	  });
});
