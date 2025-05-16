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
import { PlaceOfServiceComponent } from './place-of-service.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
describe('PlaceOfServiceComponent', () => {
	let comp: PlaceOfServiceComponent;
	let fixture: ComponentFixture<PlaceOfServiceComponent>;
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
			declarations: [PlaceOfServiceComponent],
			imports: [ToastrModule.forRoot(), SharedModule, RouterTestingModule,BrowserAnimationsModule,HttpClientTestingModule],
			providers: [
				Config,
				LocalStorage,
				// ConfirmationService,
				FormBuilder,
				{ provide: CanDeactivateModelComponentService, useValue: canDeactive_MockService },
				{ provide: RequestService, useValue: request_MockService },
			],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(PlaceOfServiceComponent);
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
	function initializePlaceForm(): FormGroup {
		return comp['fb'].group({
			name: [''],
			comments: [''],
			description: [''],
		});
	}
	it('should form valid on empty', async(() => {
		const form = initializePlaceForm();
		form.controls['name'].setValue('');
		form.controls['comments'].setValue('');
		form.controls['description'].setValue('');
		expect(form.valid).toBeTruthy();
	}));
	it('Should createPlaceSubmit', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'description',
			name: 'name',
			status:true
		};
		const spyOnMethod = spyOn(comp['requestService'], 'sendRequest').and.returnValue(of(formValue));
		const subspy = spyOn(request_MockService.sendRequest(), 'subscribe');
		comp.placeForm = initializePlaceForm();
		comp.placeForm.controls['name'].setValue(formValue.name);
		comp.placeForm.controls['comments'].setValue(formValue.comments);
		comp.placeForm.controls['description'].setValue(formValue.description);
		
		comp.createPlaceSubmit(comp.placeForm.value);
		tick(15000);
		discardPeriodicTasks();
		debugger;
		expect(comp.loadSpin).toBeTruthy();
		expect(spyOnMethod).toHaveBeenCalledBefore(subspy);
		expect(subspy).toHaveBeenCalled();
	}));
	it('Should createPlaceSubmit function test when createPlaceSubmit complete', () => {
		const formValue: any = {
			comments: 'comment',
			description: 'desc',
			name: 'name',
		};
		comp.placeForm = initializePlaceForm();
		comp.placeForm.controls['name'].setValue(formValue.comments);
		comp.placeForm.controls['comments'].setValue(formValue.description);
		comp.placeForm.controls['description'].setValue(formValue.name);
        // spyOn(request_MockService, 'sendRequest').and.returnValue(throwError('error') );
		
		
		comp.createPlaceSubmit(formValue);
		fixture.detectChanges();
		
        // expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp.loadSpin).toBeTruthy();
	});
	it('Should createPlaceSubmit Subscribe body test when status true', fakeAsync(() => {
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
		comp.placeForm = initializePlaceForm();
		comp.placeForm.controls['name'].setValue(formValue.comments);
		comp.placeForm.controls['comments'].setValue(formValue.description);
		comp.placeForm.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.createPlaceSubmit(formValue);
        fixture.detectChanges();
		expect(comp.loadSpin).toBeTruthy();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		comp.modalRef.close();
		expect(comp.loadSpin).toBeFalsy();
    }));
	it('Should placeSetpage function test', () => {
		spyOn(comp, 'addUrlQueryParams');
		spyOn(comp, 'displayUpdatedPlace');
		spyOn(comp['placeSelection'], 'clear');
		comp.placeForm = comp.initializePlaceForm();
		const pageInfo = {
			offset: 0,
		};
		comp['placePage'].pageNumber = pageInfo.offset;
		const pageNumber = comp['placePage'].pageNumber + 1;
		comp.placeForm.controls.name.setValue('Your name');
		comp.placeForm.controls.comments.setValue('Your comments');
		comp.placeForm.controls.description.setValue('Your description');
		const filters = checkReactiveFormIsEmpty(comp.placeForm);
		comp['queryParams'] = {
			filter: !isObjectEmpty(filters),
			order: OrderEnum.ASC,
			per_page: comp['placePage'].size || 10,
			page: pageNumber,
			pagination: true,
			order_by: 'name',
		};
		let queryparam = { per_page: comp['placePage'].size, page: pageNumber };
		expect(comp['placePage'].pageNumber).toBe(pageInfo.offset);
		// expect(comp['placeSelection'].clear).toHaveBeenCalled();
		const formValue: any = {
			comments: 'comments',
			description: 'description',
			name: 'name',
		};
		comp.placeForm = initializePlaceForm();
		comp.placeForm.controls['name'].setValue(formValue.name);
		comp.placeForm.controls['comments'].setValue(formValue.comments);
		comp.placeForm.controls['description'].setValue(formValue.description);
		comp.placeSetpage(pageInfo);
		expect(comp.addUrlQueryParams).toHaveBeenCalled();
		expect(comp.displayUpdatedPlace).toHaveBeenCalled();
	});
	it('Should displayUpdatedPlace function test when subscribe throw error', fakeAsync(() => {
		const formValue: any = {
			comments: 'comment',
			description: 'desc',
			name: 'name',
		};
		comp.placeSearchForm = initializePlaceForm();
		comp.placeSearchForm.controls['name'].setValue(formValue.comments);
		comp.placeSearchForm.controls['comments'].setValue(formValue.description);
		comp.placeSearchForm.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(throwError('error') );
		comp.displayUpdatedPlace(formValue);
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
		comp.placeForm = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.placeForm.markAsTouched();
		comp.placeForm.markAsDirty();
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
		comp.placeForm = comp['fb'].group({
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
		comp.placeForm.markAsTouched();
		comp.placeForm.markAsDirty();
		spyOn(comp.placeForm,'reset');
        spyOn(canDeactive_MockService, 'canDeactivate').and.returnValue(of([]));
		comp.closeModel();
		comp.modalRef.close();
        expect(comp.placeForm.reset).toHaveBeenCalled();
	}));
	it('Should updatePlaceSubmit function test when subscribe throw error', fakeAsync(() => {
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
		comp.placeForm = initializePlaceForm();
		comp.placeForm.controls['name'].setValue(formValue.comments);
		comp.placeForm.controls['comments'].setValue(formValue.description);
		comp.placeForm.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(throwError('error') );
		comp.updatePlaceSubmit(formValue);
		comp.modalRef.close();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
		expect(comp.loadSpin).toBeTruthy();
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
		spyOn(comp, 'initializePlaceForm');
		// spyOn(comp, 'placePage');
		spyOn(comp['fb'], 'group');
		// spyOn(comp['_route'].queryParams,'subscribe').and.returnValue(of([MockRowValue]));
		// spyOn(comp.subscription,'push').and.returnValue(of([MockRowValue]));

		comp.ngOnInit();
		tick();
		expect(comp.setTitle).toHaveBeenCalled();
		expect(comp['initializePlaceForm']).toHaveBeenCalled();
		expect(comp['fb'].group).toHaveBeenCalled();
		expect(comp.subscription.push).toHaveBeenCalled();

	}));
	it('Should Test initializePlaceForm', () => {
		spyOn(comp['fb'], 'group');
		comp.initializePlaceForm();
		expect(comp['fb'].group).toHaveBeenCalled();
	});
	it('Should Test isPlaceAllSelected', () => {
		comp.placeComingData.length = 10;
		comp.placetotalRows = comp.placeComingData.length;
		comp['placeSelection'].selected.length = 10;
		comp.isPlaceAllSelected();
		expect(comp.placetotalRows).toBe(comp['placeSelection'].selected.length);
	});
	it('Should Test isPlaceAllSelected', () => {
		comp.placeComingData.length = 10;
		comp.placetotalRows = comp.placeComingData.length;
		comp['placeSelection'].selected.length = 10;
		comp.isPlaceAllSelected();
		expect(comp.placetotalRows).toBe(comp['placeSelection'].selected.length);
	});
	it('Should Test PlacemasterToggle when isSelected True', () => {
		// spyOn(comp, 'isPlaceAllSelected').and.returnValue(of(true));
		spyOn(comp['placeSelection'], 'clear');
		comp.PlacemasterToggle();
		expect(comp.isPlaceAllSelected).toHaveBeenCalled();
		expect(comp['placeSelection'].clear).toHaveBeenCalled();
	});
	it('Should Test PlacemasterToggle when isSelected False', () => {
		spyOn(comp, 'isPlaceAllSelected').and.returnValue(false);
		comp.placetotalRows = 5;
		comp.PlacemasterToggle();
		comp.placeComingData = [2];
		expect(comp.isPlaceAllSelected).toHaveBeenCalled();
	});
	it('Should Test page limit function', () => {
		spyOn(comp, 'placeSetpage');
		comp.placePageLimit('3');
		expect(comp.placeSetpage).toHaveBeenCalled();
		expect(comp['placePage'].size).toBe(3);
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
		comp.placeForm = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.placeComingData = mockPlaceOfServiceList;
		comp.patchEditValues(MockRowValue, MockRowIndex);
		expect(comp.modelSubmit).toBe('Update');
		expect(comp.modelTitle).toBe('Edit');
	});
	it('Should Test patchAddValues', () => {
		comp.placeForm = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			code: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		spyOn(comp.placeForm, 'reset');
		comp.patchAddValues();
		expect(comp.placeForm.reset).toHaveBeenCalled();
		expect(comp.modelSubmit).toContain('Save & Continue');
		expect(comp.modelTitle).toContain('Add');
	});
	it('Should check Reset Button when placeSearchForm From Empty function Test', () => {
		comp.placeSearchForm = comp.initializePlaceForm();
		const retrunValue = isEmptyObject(comp.placeSearchForm.value);
		comp.checkInputs();
		expect(retrunValue).toBe(true);
	});
	it('Should check Reset Button disabled when placeSearchForm have values function Test', () => {
		comp.placeSearchForm = comp.initializePlaceForm();
		comp.placeSearchForm.controls.name.setValue('mock name');
		comp.placeSearchForm.controls.comments.setValue('mock comments');
		comp.placeSearchForm.controls.description.setValue('mock description');
		const retrunValue = isEmptyObject(comp.placeSearchForm.value);
		comp.checkInputs();
		expect(retrunValue).toBe(false);
	});
	it('Should Test stringfy function which convert object', () => {
		const obj = comp.stringfy({ name: 'name mock' });
		expect(obj).toContain('{"name":"name mock"}');
	});
	it('Should Test closeModel when placeForm dirty and touched false', fakeAsync(() => {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc unique',
		};
		comp.modalRef = comp['modalService'].open('paymentType', ngbModalOptions);
		comp.placeForm = comp['fb'].group({
			name: ['name'],
			comments: ['comment'],
			description: ['desc'],
		});
		spyOn(comp.placeForm,'reset');
		comp.placeForm.reset();
		comp.closeModel();
		comp.modalRef.close();
		expect(comp.placeForm.reset).toHaveBeenCalled();
	}));
	it('Should Test closeModel when placeForm dirty and touched true', fakeAsync(() => {
		// const spyOnMethod = spyOn(comp['CanDeactivateModelComponentService'], 'canDeactivate').and.returnValue(of([]));
		const subspy = spyOn(canDeactive_MockService.canDeactivate(), 'subscribe');
		comp.placeForm = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.placeForm.markAsTouched();
		comp.placeForm.markAsDirty();
		comp.closeModel();
		tick();
		// expect(spyOnMethod).toHaveBeenCalledBefore(subspy);
		expect(subspy).toHaveBeenCalled();
	}));
	it('Should Test closeModel when placeForm dirty and touched true and subcribe throw error', fakeAsync(() => {
		// const spyOnMethod = spyOn(comp['CanDeactivateModelComponentService'], 'canDeactivate').and.returnValue(of([]));
		const subspy = spyOn(canDeactive_MockService.canDeactivate(false), 'subscribe');
		comp.placeForm = comp['fb'].group({
			id: [''],
			name: ['', Validators.required],
			comments: [''],
			description: [''],
		});
		comp.placeForm.markAsTouched();
		comp.placeForm.markAsDirty();
		comp.closeModel();
		tick();
		// expect(spyOnMethod).toHaveBeenCalledBefore(subspy);
		expect(subspy).toHaveBeenCalled();
	}));
	it('Should displayUpdatedPlace with placeComingData empty', fakeAsync(() => {
		const formValue: any = {
			comments: 'comments',
			description: 'description',
			name: 'name',
			status:true,
			comingData:[]
		};
		comp.placeSearchForm = initializePlaceForm();
		comp.placeSearchForm.controls['name'].setValue(formValue.comments);
		comp.placeSearchForm.controls['comments'].setValue(formValue.description);
		comp.placeSearchForm.controls['description'].setValue(formValue.name);
        spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.displayUpdatedPlace(formValue);
        fixture.detectChanges();
		expect(comp.loadSpin).toBeTruthy();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		expect(comp.placeComingData.length).toBe(0);
		expect(comp['placePage'].totalElements).toBe(0);
    }));
	it('Should Test resetPlace function',()=>{
		spyOn(comp,'placeSetpage');
		spyOn(comp['fb'],'group');
		comp.placeSearchForm = comp.initializePlaceForm();
		comp.resetPlace();
		expect(comp.placeSetpage).toHaveBeenCalled();
		expect(comp['fb'].group).toHaveBeenCalled();
	});
	it('Should Test updatePlaceSubmit function when subsribe run successfull',fakeAsync(()=>{
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
		comp.placeForm = comp.initializePlaceForm();
		comp.placeForm.controls.name.setValue('mock name');
		comp.placeForm.controls.comments.setValue('mock comments');
		comp.placeForm.controls.description.setValue('mock description');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.updatePlaceSubmit(comp.placeForm);
        fixture.detectChanges();
		expect(comp.loadSpin).toBeTruthy();
        expect(request_MockService.sendRequest).toHaveBeenCalled();
        tick(15000);
		discardPeriodicTasks();
		comp.modalRef.close();
		expect(comp.loadSpin).toBeFalsy();
	}));
	it('Should Test updatePlaceSubmit function when subsribe run successfull and status false',fakeAsync(()=>{
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
		comp.placeForm = comp.initializePlaceForm();
		comp.placeForm.controls.name.setValue('mock name');
		comp.placeForm.controls.comments.setValue('mock comments');
		comp.placeForm.controls.description.setValue('mock description');
		spyOn(request_MockService, 'sendRequest').and.returnValue(of(formValue).pipe(delay(1)));
		comp.updatePlaceSubmit(comp.placeForm);
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
	it('Should Test onPlaceSubmit function',()=>{
		spyOn(comp,'createPlaceSubmit');
		comp.placeSearchForm = comp.initializePlaceForm();
		comp.placeSearchForm.controls.name.setValue('mock name');
		comp.placeSearchForm.controls.comments.setValue('mock comments');
		comp.placeSearchForm.controls.description.setValue('mock description');
		comp.onPlaceSubmit(comp.placeSearchForm.value);
		comp.modelTitle = 'Add';
		expect(comp.createPlaceSubmit).toHaveBeenCalled();
	});
	it('Should Test onPlaceSubmit function without Add',()=>{
		spyOn(comp,'updatePlaceSubmit');
		comp.placeSearchForm = comp.initializePlaceForm();
		comp.placeSearchForm.controls.name.setValue('mock name');
		comp.placeSearchForm.controls.comments.setValue('mock comments');
		comp.placeSearchForm.controls.description.setValue('mock description');
		comp.modelTitle = 'Edit';
		comp.onPlaceSubmit(comp.placeSearchForm.value);
		expect(comp.updatePlaceSubmit).toHaveBeenCalled();
	});
	it('Should Test openPlaceOfSercesModal function',()=>{
		spyOn(comp,'patchAddValues');
		comp.placeSearchForm = comp.initializePlaceForm();
		comp.placeSearchForm.controls.name.setValue('mock name');
		comp.placeSearchForm.controls.comments.setValue('mock comments');
		comp.placeSearchForm.controls.description.setValue('mock description');
		comp.openPlaceOfSercesModal(undefined,undefined,undefined);
		expect(comp.patchAddValues).toHaveBeenCalled();
	});
	it('Should Test openPlaceOfSercesModal function with row not undefined',()=>{
		spyOn(comp,'patchEditValues');
		comp.placeSearchForm = comp.initializePlaceForm();
		comp.placeSearchForm.controls.name.setValue('mock name');
		comp.placeSearchForm.controls.comments.setValue('mock comments');
		comp.placeSearchForm.controls.description.setValue('mock description');
		comp.openPlaceOfSercesModal(undefined,comp.placeSearchForm.value,3);
		expect(comp.patchEditValues).toHaveBeenCalled();
	});
	it('Should Test openPlaceOfSercesModal function with row null',()=>{
		spyOn(comp,'patchAddValues');
		comp.placeSearchForm = comp.initializePlaceForm();
		comp.placeSearchForm.controls.name.setValue('mock name');
		comp.placeSearchForm.controls.comments.setValue('mock comments');
		comp.placeSearchForm.controls.description.setValue('mock description');
		comp.openPlaceOfSercesModal(undefined,null,3);
		expect(comp.patchAddValues).toHaveBeenCalled();
	});
	it('Should Placestringfy Test which return json stringify',()=>{
		const formValue: any = {
			comments: 'comments',
			description: 'description',
			name: 'name',
			status:true,
			result:[]
		};
		let JSON_String = comp.Placestringfy(formValue);
		expect(JSON_String).toEqual(JSON.stringify(formValue));
	});
	afterAll(() => {
		TestBed.resetTestingModule();
	  });
});
