import { MainService } from '@appDir/shared/services/main-service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
	TestBed,
	async,
	ComponentFixture
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Config } from '@appDir/config/config';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { SharedModule } from '@appDir/shared/shared.module';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BillListingSpecialityFilterComponent } from './bill-listing-speciality-filter.component';
describe('BillListingSpecialityFilterComponent', () => {
	let comp: BillListingSpecialityFilterComponent;
	let fixture: ComponentFixture<BillListingSpecialityFilterComponent>;
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [BillListingSpecialityFilterComponent],
			imports: [
				SharedModule,
				RouterTestingModule,
				BrowserAnimationsModule,
				ToastrModule.forRoot(),
				HttpClientTestingModule,
			],
			schemas: [NO_ERRORS_SCHEMA],
			providers: [Config, LocalStorage, ToastrService, MainService],
		}).compileComponents();
	}));
	beforeEach(() => {
		fixture = TestBed.createComponent(BillListingSpecialityFilterComponent);
		comp = fixture.componentInstance;
	});
	afterEach(() => {
		TestBed.resetTestingModule();
	});
	it('should be created', () => {
		expect(comp).toBeTruthy();
	});
	it('Should ngOnInit Test', () => {
		comp.ngOnInit();
		expect(comp.SpecialityBillsForm.value).toEqual({
			attorney_id: '',
			bill_date: '',
			bill_date_end: '',
			bill_date_start: '',
			bill_number: '',
			bill_status: '',
			case_number: '',
			case_type: '',
			insurance_name: '',
			patient_name: '',
			provider: '',
			service_date: '',
			service_date_end: '',
			service_date_start: '',
			speciality_id: '',
			user_id: ''
		});
		expect(comp.SpecialityBillsForm.controls.bill_date.validator).toBeTruthy();
		expect(comp.SpecialityBillsForm.controls.bill_date_start.validator).toBeTruthy();
		expect(comp.SpecialityBillsForm.controls.bill_date_end.validator).toBeTruthy();
		expect(comp.SpecialityBillsForm.controls.service_date.validator).toBeTruthy();
		expect(comp.SpecialityBillsForm.controls.service_date_start.validator).toBeTruthy();
		expect(comp.SpecialityBillsForm.controls.service_date_end.validator).toBeTruthy();
		expect(comp.SpecialityBillsForm.controls.bill_status.validator).toBeTruthy();
		expect(comp.SpecialityBillsForm.controls.speciality_id.validator).toBeTruthy();
		expect(comp.SpecialityBillsForm.controls.user_id.validator).toBeTruthy();
		expect(comp.SpecialityBillsForm.controls.attorney_id.validator).toBeTruthy();
		expect(comp.SpecialityBillsForm.controls.case_type.validator).toBeTruthy();
		expect(comp.SpecialityBillsForm.controls.insurance_name.validator).toBeTruthy();
		expect(comp.SpecialityBillsForm.controls.patient_name.validator).toBeTruthy();
		expect(comp.SpecialityBillsForm.controls.bill_number.validator).toBeTruthy();
		expect(comp.SpecialityBillsForm.controls.case_number.validator).toBeTruthy();
		expect(comp.SpecialityBillsForm.controls.provider.validator).toBeTruthy();
	});
	afterAll(() => {
		TestBed.resetTestingModule();
	});
});
