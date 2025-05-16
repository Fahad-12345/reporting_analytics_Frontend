import { Logger } from '@nsalaun/ng-logger';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { Config } from '@appDir/config/config';
import { ToastrModule } from 'ngx-toastr';
import { SharedModule } from '@appDir/shared/shared.module';
import { TestBed, async, ComponentFixture, inject, fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ConfirmationService } from '@jaspero/ng-confirmations';
import { DynamicFormModule } from '@appDir/shared/dynamic-form/dynamic-form.module';
import { PatientListingComponent } from './patient-listing.component';
import { of } from 'rxjs';
import { RequestMockService } from '@appDir/shared/mock-services/RequestMock.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { delay } from 'rxjs/operators';
import { NgbModalMockService } from '@appDir/shared/mock-services/ngbModalMock.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { patientListingMockValues } from './patient-listing-mock-values';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe(("PatientListingComponent"), () => {
	let comp: PatientListingComponent;
	let fixture: ComponentFixture<PatientListingComponent>;
	let request_MockService = new RequestMockService();
	let ngbModal_MockService = new NgbModalMockService();
	let patientListingSetMockValues = new patientListingMockValues();
	let mock_patientList = patientListingSetMockValues.patientListingData;
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [PatientListingComponent],
			imports: [ToastrModule.forRoot(), SharedModule, RouterTestingModule, DynamicFormModule,HttpClientTestingModule],
			providers: [LocalStorage, Config, ConfirmationService, Logger,
			{ provide: RequestService, useValue: request_MockService },
			{ provide: NgbModal, useValue: ngbModal_MockService },
			],
			schemas: [NO_ERRORS_SCHEMA],
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(PatientListingComponent);
		comp = fixture.componentInstance;
	})
	it('Should Create', () => {
		expect(comp).toBeTruthy();
	});
	it('Should pageLimit call and selection clear and pageLimitChange emit function must call', () => {
		spyOn(comp.pageLimitChange, 'emit');
		spyOn(comp.selection, 'clear');
		comp.pageLimit(10);
		expect(comp.pageLimitChange.emit).toHaveBeenCalled();
		expect(comp.selection.clear).toHaveBeenCalled();
	});
	it('Should call ngOnChanges and get patient rows', () => {
		comp.patientRows = mock_patientList;
		spyOn(comp, 'ngOnChanges')
		expect(comp.patientRows.length).toBeGreaterThan(0);
		comp.ngOnChanges();
		expect(comp.ngOnChanges).toHaveBeenCalled();
	});
	it('Should open modal on pharmacy detial', () => {
		spyOn(comp, 'getPatientByID');
		comp.pharmacy_detail_open_modal(mock_patientList[0], 'content');
		expect(comp.getPatientByID).toHaveBeenCalled();
	});
	it('Should get patient by id', fakeAsync(() => {
		spyOn(comp, 'getPatientByID').and.returnValue(of(mock_patientList[0]));
		spyOn(comp, 'setPharmacyDetail');
		comp.getPatientByID(mock_patientList[0].id, 'content');
		expect(comp.getPatientByID).toHaveBeenCalled();
		tick();
		comp.patientPharmacies = mock_patientList[0];
		expect(comp.patientPharmacies).toBeDefined();
		expect(comp.patientPharmacies).toEqual(mock_patientList[0]);

	}));
	it('Should Destroy all subscription on ngOnDestory', () => {
		spyOn(comp, 'ngOnDestroy');
		fixture.detectChanges();
		comp.ngOnDestroy();
		expect(comp.ngOnDestroy).toHaveBeenCalled();
	});
	it('Should ngOnChanges Test',()=>{
		comp.patientRows = patientListingSetMockValues.patientRows;
		comp.ngOnChanges();
		expect(comp.patientRows.length).toBe(2);
	});
	it('Should Test isAllSelected', () => {
		comp.selection.selected.length = 10;
		comp.patientRows = mock_patientList;
		let result = comp.isAllSelected();
		expect(result).toBe(true);
	});
	it('Should Test stringfy function which convert object', () => {
		const obj = comp.stringfy({ name: 'name mock' });
		expect(obj).toContain('{"name":"name mock"}');
	});
	it('Should Test masterToggle when isSelected True', () => {
		spyOn(comp, 'isAllSelected').and.returnValue(of(true));
		spyOn(comp.selection, 'clear');
		comp.masterToggle(null);
		expect(comp.isAllSelected).toHaveBeenCalled();

		expect(comp.selection.clear).toHaveBeenCalled();
	});

	it('Should Test masterToggle when isSelected False', () => {
		spyOn(comp, 'isAllSelected').and.returnValue(false);
		comp.totalRows = 5;
		comp.patientRows = [2];
		comp.masterToggle(null);
		expect(comp.isAllSelected).toHaveBeenCalled();
	});
	it('Should pharmacy_detail_open_modal Test',()=>{
		spyOn(comp,'getPatientByID');
		comp.pharmacy_detail_open_modal(1,'content');
		expect(comp.getPatientByID).toHaveBeenCalled();
	});
	it('Should getPatientByID When Subscribe successfull', fakeAsync(() => {
		let Confirmation_Responce = {
			result: {
				data:[{
					id:10
				}]
			},
		};
		spyOn(comp,'setPharmacyDetail');
		spyOn(request_MockService, 'sendRequest').and.returnValue(
			of(Confirmation_Responce).pipe(delay(1)),
		);
		comp.getPatientByID({id:1},'content');
		tick(15000);
		discardPeriodicTasks();
		expect(comp.patientPharmacies).toEqual({
			id:10
		});
		expect(comp.setPharmacyDetail).toHaveBeenCalled();
	}));
	it('Should setPharmacyDetail Test',fakeAsync(()=>{
		let object = {
			result:{
				then:function(){
					return true
				}
			}
		}
		spyOn(ngbModal_MockService, 'open').and.returnValue(object);
		comp.setPharmacyDetail('modelRef');
		fixture.detectChanges();
		tick();
		expect(comp.closeResult).toBeUndefined();
	}));
	it('Should showPharmacyOfPatient Test',()=>{
		comp.showPharmacyOfPatient();
		expect(comp.patientPharmacies.length).toBe(1);
	});	
	it('Should getDismissReason test If reason ECS',()=>{
		let Result = comp['getDismissReason'](1);
		expect(Result).toMatch('by pressing ESC');
	});
	it('Should getDismissReason test If reason BACKDROP_CLICK',()=>{
		let Result = comp['getDismissReason'](0);
		expect(Result).toMatch('by clicking on a backdrop');
	});
	it('Should getDismissReason test If reason not BACKDROP_CLICK OR ECS',()=>{
		let Result = comp['getDismissReason'](2);
		expect(Result).toMatch('with: 2');
	});
	it('Should nextPage Test',()=>{
		spyOn(comp['selection'],'clear');
		spyOn(comp['setPage'],'emit');
		comp.nextPage({});
		expect(comp['selection'].clear).toHaveBeenCalled();
		expect(comp['setPage'].emit).toHaveBeenCalled();
	});
});

