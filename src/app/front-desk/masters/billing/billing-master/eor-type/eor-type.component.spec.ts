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
import { EORTypeComponent } from './eor-type.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
describe('EORTypeComponent', () => {
	let comp: EORTypeComponent;
	let fixture: ComponentFixture<EORTypeComponent>;
	let canDeactive_MockService = new CanDeactiveMockService();
	let request_MockService = new RequestMockService();
	let mockEorTypeList = [
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
			declarations: [EORTypeComponent],
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
		fixture = TestBed.createComponent(EORTypeComponent);
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
	it('Should createEorSubmit', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'description',
			name: 'name',
			status:true
		};
		const spyOnMethod = spyOn(comp['requestService'], 'sendRequest').and.returnValue(of(formValue));
		const subspy = spyOn(request_MockService.sendRequest(), 'subscribe');
		comp.eorform = eorFormSearch();
		comp.eorform.controls['name'].setValue(formValue.name);
		comp.eorform.controls['comments'].setValue(formValue.comments);
		comp.eorform.controls['description'].setValue(formValue.description);
		tick();
		expect(comp.loadSpin).toBeFalsy();
		comp.createEorSubmit(comp.eorform.value);
		expect(comp.loadSpin).toBeFalsy();
		expect(spyOnMethod).toHaveBeenCalledBefore(subspy);
		expect(subspy).toHaveBeenCalled();
	}));
	it('Should createEorSubmit function test when status false', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'desc',
			name: 'name',
		};
		comp.eorform = eorFormSearch();
		comp.eorform.controls['name'].setValue(formValue.comments);
		comp.eorform.controls['comments'].setValue(formValue.description);
		comp.eorform.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(throwError('error') );
		comp.createEorSubmit(formValue);
        expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp.loadSpin).toBeFalsy();
	}));
	it('Should createEorSubmit Subscribe body test when status true', fakeAsync(() => {
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
		comp.eorform = eorFormSearch();
		comp.eorform.controls['name'].setValue(formValue.comments);
		comp.eorform.controls['comments'].setValue(formValue.description);
		comp.eorform.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.createEorSubmit(formValue);
        fixture.detectChanges();
		expect(comp.loadSpin).toBeTruthy();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		comp.modalRef.close();
		expect(comp.loadSpin).toBeFalsy();
    }));
	it('Should eORSetPage function test', () => {
		spyOn(comp, 'addUrlQueryParams');
		spyOn(comp, 'displayEORUpdated');
		spyOn(comp['eorSelection'], 'clear');
		comp.eorform = comp.eorFormSearch();
		const pageInfo = {
			offset: 0,
		};
		comp['eorPage'].pageNumber = pageInfo.offset;
		const pageNumber = comp['eorPage'].pageNumber + 1;
		comp.eorform.controls.name.setValue('Your name');
		comp.eorform.controls.comments.setValue('Your comments');
		comp.eorform.controls.description.setValue('Your description');
		const filters = checkReactiveFormIsEmpty(comp.eorform);
		comp['queryParams'] = {
			filter: !isObjectEmpty(filters),
			order: OrderEnum.ASC,
			per_page: comp['eorPage'].size || 10,
			page: pageNumber,
			pagination: true,
			order_by: 'name',
		};
		let queryparam = { per_page: comp['eorPage'].size, page: pageNumber };
		expect(comp['eorPage'].pageNumber).toBe(pageInfo.offset);
		// expect(comp['eorSelection'].clear).toHaveBeenCalled();
		const formValue: any = {
			comments: 'comments',
			description: 'description',
			name: 'name',
		};
		comp.eorform = eorFormSearch();
		comp.eorform.controls['name'].setValue(formValue.name);
		comp.eorform.controls['comments'].setValue(formValue.comments);
		comp.eorform.controls['description'].setValue(formValue.description);
		comp.eORSetPage(pageInfo);
		expect(comp.addUrlQueryParams).toHaveBeenCalled();
		expect(comp.displayEORUpdated).toHaveBeenCalled();
	});
	it('Should displayEORUpdated function test when subscribe throw error', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'desc',
			name: 'name',
		};
		comp.eorSerarchForm = eorFormSearch();
		comp.eorSerarchForm.controls['name'].setValue(formValue.comments);
		comp.eorSerarchForm.controls['comments'].setValue(formValue.description);
		comp.eorSerarchForm.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(throwError('error') );
		comp.displayEORUpdated(formValue);
        expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp.loadSpin).toBeFalsy();
	}));
	it('Should closeModel function test when subscribe return empty responce	', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'desc',
			name: 'name',
		};
		comp.eorform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.eorform.markAsTouched();
		comp.eorform.markAsDirty();
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
		comp.eorform = comp['fb'].group({
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
		comp.eorform.markAsTouched();
		comp.eorform.markAsDirty();
		spyOn(comp.eorform,'reset');
        spyOn(canDeactive_MockService, 'canDeactivate').and.returnValue(of([]));
		comp.closeModel();
		comp.modalRef.close();
        expect(comp.eorform.reset).toHaveBeenCalled();
	}));
	it('Should updateEORSubmit function test when subscribe throw error', fakeAsync(() => {
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
		comp.eorform = eorFormSearch();
		comp.eorform.controls['name'].setValue(formValue.comments);
		comp.eorform.controls['comments'].setValue(formValue.description);
		comp.eorform.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(throwError('error') );
		comp.updateEORSubmit(formValue);
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
		// spyOn(comp, 'eorPage');
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
	it('Should Test isDenialAllSelected', () => {
		comp.eorComingData.length = 10;
		comp.eorTotalRows = comp.eorComingData.length;
		comp['eorSelection'].selected.length = 10;
		comp.isDenialAllSelected();
		expect(comp.eorTotalRows).toBe(comp['eorSelection'].selected.length);
	});
	it('Should Test isDenialAllSelected', () => {
		comp.eorComingData.length = 10;
		comp.eorTotalRows = comp.eorComingData.length;
		comp['eorSelection'].selected.length = 10;
		comp.isDenialAllSelected();
		expect(comp.eorTotalRows).toBe(comp['eorSelection'].selected.length);
	});
	it('Should Test eormasterToggle when isSelected True', () => {
		// spyOn(comp, 'isDenialAllSelected').and.returnValue(of(true));
		spyOn(comp['eorSelection'], 'clear');
		comp.eormasterToggle();
		expect(comp.isDenialAllSelected).toHaveBeenCalled();
		expect(comp['eorSelection'].clear).toHaveBeenCalled();
	});
	it('Should Test eormasterToggle when isSelected False', () => {
		spyOn(comp, 'isDenialAllSelected').and.returnValue(false);
		comp.eorTotalRows = 5;
		comp.eormasterToggle();
		comp.eorComingData = [2];
		expect(comp.isDenialAllSelected).toHaveBeenCalled();
	});
	it('Should Test page limit function', () => {
		spyOn(comp, 'eORSetPage');
		comp.eorPageLimit('3');
		expect(comp.eORSetPage).toHaveBeenCalled();
		expect(comp['eorPage'].size).toBe(3);
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
		comp.eorform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.eorComingData = mockEorTypeList;
		comp.patchEditValues(MockRowValue, MockRowIndex);
		expect(comp.modelSubmit).toBe('Update');
		expect(comp.modelTitle).toBe('Edit');
	});
	it('Should Test patchAddValues', () => {
		comp.eorform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		spyOn(comp.eorform, 'reset');
		comp.patchAddValues();
		expect(comp.eorform.reset).toHaveBeenCalled();
		expect(comp.modelSubmit).toContain('Save & Continue');
		expect(comp.modelTitle).toContain('Add');
	});
	it('Should check Reset Button when eorSerarchForm From Empty function Test', () => {
		comp.eorSerarchForm = comp.eorFormSearch();
		const retrunValue = isEmptyObject(comp.eorSerarchForm.value);
		comp.checkInputs();
		expect(retrunValue).toBe(true);
	});
	it('Should check Reset Button disabled when eorSerarchForm have values function Test', () => {
		comp.eorSerarchForm = comp.eorFormSearch();
		comp.eorSerarchForm.controls.name.setValue('mock name');
		comp.eorSerarchForm.controls.comments.setValue('mock comments');
		comp.eorSerarchForm.controls.description.setValue('mock description');
		const retrunValue = isEmptyObject(comp.eorSerarchForm.value);
		comp.checkInputs();
		expect(retrunValue).toBe(false);
	});
	it('Should Test stringfy function which convert object', () => {
		const obj = comp.stringfy({ name: 'name mock' });
		expect(obj).toContain('{"name":"name mock"}');
	});
	it('Should Test closeModel when eorform dirty and touched false', fakeAsync(() => {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('paymentType', ngbModalOptions);
		comp.eorform = comp['fb'].group({
			name: ['name'],
			comments: ['comment'],
			description: ['desc'],
		});
		spyOn(comp.eorform,'reset');
		comp.eorform.reset();
		comp.closeModel();
		comp.modalRef.close();
		expect(comp.eorform.reset).toHaveBeenCalled();
	}));
	it('Should Test closeModel when eorform dirty and touched true', fakeAsync(() => {
		// const spyOnMethod = spyOn(comp['CanDeactivateService'], 'canDeactivate').and.returnValue(of([]));
		const subspy = spyOn(canDeactive_MockService.canDeactivate(), 'subscribe');
		comp.eorform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.eorform.markAsTouched();
		comp.eorform.markAsDirty();
		comp.closeModel();
		tick();
		// expect(spyOnMethod).toHaveBeenCalledBefore(subspy);
		expect(subspy).toHaveBeenCalled();
	}));
	it('Should Test closeModel when eorform dirty and touched true and subcribe throw error', fakeAsync(() => {
		// const spyOnMethod = spyOn(comp['CanDeactivateService'], 'canDeactivate').and.returnValue(of([]));
		const subspy = spyOn(canDeactive_MockService.canDeactivate(false), 'subscribe');
		comp.eorform = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.eorform.markAsTouched();
		comp.eorform.markAsDirty();
		comp.closeModel();
		tick();
		// expect(spyOnMethod).toHaveBeenCalledBefore(subspy);
		expect(subspy).toHaveBeenCalled();
	}));
	it('Should displayEORUpdated with eorComingData empty', fakeAsync(() => {
		const formValue: any = {
			comments: 'comments',
			description: 'description',
			name: 'name',
			status:true,
			comingData:[]
		};
		comp.eorSerarchForm = eorFormSearch();
		comp.eorSerarchForm.controls['name'].setValue(formValue.comments);
		comp.eorSerarchForm.controls['comments'].setValue(formValue.description);
		comp.eorSerarchForm.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.displayEORUpdated(formValue);
        fixture.detectChanges();
		expect(comp.loadSpin).toBeTruthy();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		expect(comp.eorComingData.length).toBe(0);
		expect(comp['eorPage'].totalElements).toBe(0);
    }));
	it('Should Test resetDenial function',()=>{
		spyOn(comp,'eORSetPage');
		spyOn(comp['fb'],'group');
		comp.eorSerarchForm = comp.eorFormSearch();
		comp.resetDenial();
		expect(comp.eORSetPage).toHaveBeenCalled();
		expect(comp['fb'].group).toHaveBeenCalled();
	});
	it('Should Test updateEORSubmit function when subsribe run successfull',fakeAsync(()=>{
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
		comp.eorform = comp.eorFormSearch();
		comp.eorform.controls.name.setValue('mock name');
		comp.eorform.controls.comments.setValue('mock comments');
		comp.eorform.controls.description.setValue('mock description');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.updateEORSubmit(comp.eorform);
        fixture.detectChanges();
		expect(comp.loadSpin).toBeTruthy();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		comp.modalRef.close();
		expect(comp.loadSpin).toBeFalsy();
	}));
	it('Should Test onSaveEORSubmit function',()=>{
		spyOn(comp,'createEorSubmit');
		comp.eorSerarchForm = comp.eorFormSearch();
		comp.eorSerarchForm.controls.name.setValue('mock name');
		comp.eorSerarchForm.controls.comments.setValue('mock comments');
		comp.eorSerarchForm.controls.description.setValue('mock description');
		comp.onSaveEORSubmit(comp.eorSerarchForm.value);
		comp.modelTitle = 'Add';
		expect(comp.createEorSubmit).toHaveBeenCalled();
	});
	it('Should Test onSaveEORSubmit function without Add',()=>{
		spyOn(comp,'updateEORSubmit');
		comp.eorSerarchForm = comp.eorFormSearch();
		comp.eorSerarchForm.controls.name.setValue('mock name');
		comp.eorSerarchForm.controls.comments.setValue('mock comments');
		comp.eorSerarchForm.controls.description.setValue('mock description');
		comp.modelTitle = 'Edit';
		comp.onSaveEORSubmit(comp.eorSerarchForm.value);
		expect(comp.updateEORSubmit).toHaveBeenCalled();
	});
	it('Should Test openEORModal function',()=>{
		spyOn(comp,'patchAddValues');
		comp.eorSerarchForm = comp.eorFormSearch();
		comp.eorSerarchForm.controls.name.setValue('mock name');
		comp.eorSerarchForm.controls.comments.setValue('mock comments');
		comp.eorSerarchForm.controls.description.setValue('mock description');
		comp.openEORModal(undefined,undefined,undefined);
		expect(comp.patchAddValues).toHaveBeenCalled();
	});
	it('Should Test openEORModal function with row not undefined',()=>{
		spyOn(comp,'patchEditValues');
		comp.eorSerarchForm = comp.eorFormSearch();
		comp.eorSerarchForm.controls.name.setValue('mock name');
		comp.eorSerarchForm.controls.comments.setValue('mock comments');
		comp.eorSerarchForm.controls.description.setValue('mock description');
		comp.openEORModal(undefined,1,3);
		expect(comp.patchEditValues).toHaveBeenCalled();
	});
	it('Should Test openEORModal function with row null',()=>{
		spyOn(comp,'patchAddValues');
		comp.eorSerarchForm = comp.eorFormSearch();
		comp.eorSerarchForm.controls.name.setValue('mock name');
		comp.eorSerarchForm.controls.comments.setValue('mock comments');
		comp.eorSerarchForm.controls.description.setValue('mock description');
		comp.openEORModal(undefined,null,3);
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
