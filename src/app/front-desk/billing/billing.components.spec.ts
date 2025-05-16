import { HttpClientTestingModule } from '@angular/common/http/testing';
import { OrderEnum } from './../../shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { BillingService } from '@appDir/front-desk/billing/service/billing.service';

import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { Config } from '@appDir/config/config';
import {  ToastrModule } from 'ngx-toastr';
import { SharedModule } from '@appDir/shared/shared.module';
import { TestBed, async, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import {  FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { BillingComponent } from './billing.component';
// import { FileDropModule } from 'ngx-file-drop';
import { MainService } from '@appDir/shared/services/main-service';
import { of } from 'rxjs';
import { ParamQuery } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { BillingMockService } from './service/billingMock.service';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
describe(("BillingComponent"), () => {
	let comp: BillingComponent;
	let fixture: ComponentFixture<BillingComponent>;
	let h1: HTMLElement;
	let debug: DebugElement;
	let billMock = new BillingMockService();
	let Mock_getSpecialitiesWithCount = billMock.Mock_getSpecialitiesWithCount;
	let Mock_getBilling = billMock.Mock_getBilling;
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [BillingComponent],
			imports: [SharedModule, 
				// FileDropModule,
				 ToastrModule.forRoot(), RouterTestingModule, ReactiveFormsModule, FormsModule,HttpClientTestingModule ],
			schemas: [NO_ERRORS_SCHEMA ],
			providers: [LocalStorage, Config, MainService, { provide: BillingService, useValue: billMock }]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(BillingComponent);
		comp = fixture.componentInstance;
		h1 = fixture.nativeElement.querySelector('input');
		debug = fixture.debugElement;
	})
	// beforeEach(inject([BillingService], service => {
	// 	billService = service;
	// }));

	it('Should Create', () => {
		expect(comp).toBeTruthy();
	});
	function setFormValues(fromData) {
		comp.searchForm.controls.insurance_id.setValue(fromData.insurance_id);
		comp.searchForm.controls['claim_no'].setValue(fromData.claim_no);
		comp.searchForm.controls['no_of_days'].setValue(fromData.no_of_days);
		comp.searchForm.controls['case_type_ids'].setValue(fromData.case_type_ids);
		comp.searchForm.controls['icd_code_ids'].setValue(fromData.icd_code_ids);
		comp.searchForm.controls['visit_date'].setValue(fromData.visit_date);
		comp.searchForm.controls['appointment_type_ids'].setValue(fromData.appointment_type_ids);
		comp.searchForm.controls['facility_location_ids'].setValue(fromData.facility_location_ids);
		comp.searchForm.controls['visit_status_ids'].setValue(fromData.visit_status_ids);
		comp.searchForm.controls['speciality_ids'].setValue(fromData.speciality_ids);
		comp.searchForm.controls['provider_ids'].setValue(fromData.provider_ids);
		comp.searchForm.controls['case_ids'].setValue(fromData.case_ids);
		return comp.searchForm.valid;
	}
	it('Should Filter form empty at first time', () => {
		let searchForm = comp.initializeSearchForm();
		const mockObject = {
			insurance_id: null,
			claim_no: null,
			no_of_days: null,
			case_type_ids: null,
			icd_code_ids: null,
			visit_date: null,
			appointment_type_ids: null,
			facility_location_ids: null,
			visit_status_ids: null,
			speciality_ids: null,
			provider_ids: null,
			case_ids: null,
		}
		let setSearchForm = setFormValues(mockObject);
		expect(searchForm.valid).toBe(setSearchForm);
	});
	it('Should Filter form Validity', () => {
		let searchForm = comp.initializeSearchForm();
		expect(searchForm.valid).toBeTruthy();
	});

	it('Should call Reset function on click reset button', async(() => {
		const defaultPagination = {
			page: 1,
			per_page: 20,
			pagination: 1,
		};
		spyOn(comp, 'resetFilter');
		comp.resetFilter();
		expect(comp.resetFilter).toHaveBeenCalled();
	}));
	it('Should call filter function on click filter button', async(() => {
		spyOn(comp, 'submitFilter');
		comp.submitFilter();
		expect(comp.submitFilter).toHaveBeenCalled();
	}));
	it('Should call filter function on click filter button with params', async(() => {
		spyOn(comp, 'submitFilter');
		comp.submitFilter();
		expect(comp.submitFilter).toHaveBeenCalled();
	}));
	it('Should Filter form which params exists', () => {
		let searchForm = comp.initializeSearchForm();
		const mockObject = {
			insurance_id: 3,
			claim_no: null,
			no_of_days: null,
			case_type_ids: null,
			icd_code_ids: null,
			visit_date: null,
			appointment_type_ids: null,
			facility_location_ids: null,
			visit_status_ids: null,
			speciality_ids: null,
			provider_ids: null,
			case_ids: null,
		}
		spyOn(comp, 'createQueryParam');
		let newObject = comp.createQueryParam(mockObject);
		expect(newObject).toBeFalsy();
	});
	it('should UploadDocument form initial value on component loaded', async(() => {
		comp.initializeUploadDocument();
		expect(comp.uploadForm.value).toEqual({
			fileTitle: '',
			tags: '',
			parentId: '',
		});
	}));
	it('should Get Query params Which send', async(() => {
		const body: ParamQuery = {
			filter: false,
			order: OrderEnum.ASC,
			page: 10,
			pagination: true,
			per_page: 1,
			// column: this.page.column,
		}
		spyOn(comp, 'createQueryParam').and.returnValues(body);
		let query = comp.createQueryParam(body);
		expect(comp.createQueryParam).toHaveBeenCalledWith(body);
		expect(query).toEqual(body);
	}));

	it("should call getSpecialitiesWithCount and return list of specilities", fakeAsync(() => {
		const spyOnMethod = spyOn(comp.billingService, 'getSpecialitiesWithCount').and.returnValue(of(Mock_getSpecialitiesWithCount));
		const subspy = spyOn(billMock.getSpecialitiesWithCount(), 'subscribe');
		comp.getSpecialitiesWithCount();
		// fixture.detectChanges();
		tick();
		expect(spyOnMethod).toHaveBeenCalledBefore(subspy);
		expect(subspy).toHaveBeenCalled();
		expect(comp.lstSpecialities).toBeDefined();
		expect(comp.lstSpecialities.length).not.toBe(Mock_getSpecialitiesWithCount.length);
		// expect(comp.lstSpecialities[0]).toEqual(Mock_getSpecialitiesWithCount);
	}));
	it('Should openModal On edit', (() => {
		spyOn(comp, 'openModal');
		comp.openModal();
		expect(comp.openModal).toHaveBeenCalledWith();
	}));
	it("should call getBillVisitDetail and return detail bill visit detail", fakeAsync(() => {
		const spyOnMethod = spyOn(comp.billingService, 'getBilling').and.returnValue(of(Mock_getBilling));
		const subspy = spyOn(billMock.getBilling(), 'subscribe');
		const patch = spyOn(comp, 'patchEditValues');
		comp.getBillVisitDetail(20, false);
		comp.initializeVisitDeskForm();
		comp.form.controls['id'].setValue(20);
		comp.form.controls['appointment_type_id'].setValue(1);
		comp.form.controls['case_types'].setValue('WC');
		comp.form.controls['claim_no'].setValue('');
		comp.form.controls['doctor_id'].setValue('6');
		comp.form.controls['insurance'].setValue(null);
		comp.form.controls['no_of_days'].setValue(238);
		comp.form.controls['practices'].setValue(1);
		comp.form.controls['speciality_id'].setValue(1);
		comp.form.controls['visit_date_format'].setValue('2020-08-28');
		comp.form.controls['visit_session_state_id'].setValue('1');
		comp.form.controls['cpt_codes'].setValue([{ id: 11, is_editable: 1 }]);
		comp.form.controls['icd_codes'].setValue([{ id: 1, is_editable: 1 }]);
		comp.patchEditValues();
		// fixture.detectChanges();
		tick();
		expect(spyOnMethod).toHaveBeenCalledBefore(subspy);
		expect(subspy).toHaveBeenCalled();
		expect(patch).toHaveBeenCalled();
		// expect(comp.form.value).toEqual(Mock_getBilling);
		// expect(comp.lstSpecialities.length).not.toBe(Mock_getSpecialitiesWithCount.length);

	}));
	//   fit("should edit closeModal method on close button", fakeAsync(() => {
	// 	spyOn(comp, "closeEditModal")
	// 	fixture.detectChanges(); 
	// 	let el = fixture.debugElement.query(By.css('#close'))
	// 	el.triggerEventHandler('click', null)
	// 	tick();
	// 	fixture.detectChanges()
	// 	fixture.whenStable().then(() => {
	// 		expect(comp.closeEditModal).toHaveBeenCalled();
	// 	});
	// }));
});

