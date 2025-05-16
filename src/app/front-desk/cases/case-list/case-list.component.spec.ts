// import { Page } from './../../../shared/models/listing/page';
// import { Logger, LOGGER_LEVEL, NgLoggerModule } from '@nsalaun/ng-logger';
// import { LocalStorage } from '@appDir/shared/libs/localstorage';
// import { Config } from '@appDir/config/config';
// import {  ToastrModule } from 'ngx-toastr';
// import { SharedModule } from '@appDir/shared/shared.module';
// import { TestBed, async, ComponentFixture, inject, fakeAsync, tick } from '@angular/core/testing';
// import { RouterTestingModule } from '@angular/router/testing';
// import { CaseListComponent } from './case-list.component';
// import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
// import { DynamicFormModule } from '@appDir/shared/dynamic-form/dynamic-form.module';

// describe(("CaseListComponent"), () => {
// 	let comp: CaseListComponent;
// 	let fixture: ComponentFixture<CaseListComponent>;
// 	let page: Page = new Page();
// 	beforeEach((() => {
// 		TestBed.configureTestingModule({
// 			declarations: [CaseListComponent],
// 			imports: [ToastrModule.forRoot(), SharedModule, RouterTestingModule],
// 			providers: [LocalStorage, Config, ConfirmationService, Logger],
// 			schemas: [NO_ERRORS_SCHEMA],
// 		})
// 			.compileComponents();
// 	}));

// 	beforeEach(() => {
// 		fixture = TestBed.createComponent(CaseListComponent);
// 		comp = fixture.componentInstance;
// 	})
// 	it('Should Create', () => {
// 		expect(comp).toBeTruthy();
// 	});
// 	it('Should intiliaze form in after view init', () => {
// 		spyOn(comp, 'ngAfterViewInit')
// 		comp.initFilters();
// 		comp.ngAfterViewInit();
// 		expect(comp.form).toBeDefined();
// 		expect(comp.ngAfterViewInit).toHaveBeenCalled();
// 	});
// 	it('Should call setTitle,initFilters,getCaseTypeListing & setFilterForm function in ngOninit', () => {
// 		spyOn(comp, 'setTitle');
// 		spyOn(comp, 'initFilters');
// 		spyOn(comp, 'getCaseTypeListing');
// 		spyOn(comp, 'setFilterForm');
// 		comp.initFilters();
// 		comp.ngOnInit();
// 		expect(comp.setTitle).toHaveBeenCalled();
// 		expect(comp.initFilters).toHaveBeenCalled();
// 		expect(comp.getCaseTypeListing).toHaveBeenCalled();
// 		expect(comp.setFilterForm).toHaveBeenCalled();
// 	});
// 	it('should contain empty default values for Form On InitFilter call', () => {
// 		comp.initFilters();
// 		const mockObject = {
// 			form: {
// 				patientId: '',
// 				patientName: '',
// 				caseId: '',
// 				caseType: '',
// 				attorney: '',
// 				insurance: '',
// 				dateOfAccident: '',
// 				claimNo: '',
// 			}
// 		}
// 		expect(comp.form.value).toEqual(mockObject.form);
// 		expect(comp.page.pageNumber).toBe(1);
// 		expect(comp.page.size).toBe(10);
// 	});
// 	it('Should call onPageChange then page number increase by 1 and must call setTitle fun()', () => {
// 		spyOn(comp, 'setTitle');
// 		fixture = TestBed.createComponent(CaseListComponent);
// 		comp = fixture.componentInstance;
// 		comp.initFilters();
// 		comp.onPageChange(1);
// 		expect(comp.page.pageNumber).toBe(2);
// 	});
// 	it('should navigate on onClickLink click', () => {
// 		spyOn(comp.router, 'navigate');
// 		comp.onClickLink('/home');
// 		expect(comp.router.navigate).toHaveBeenCalled();
// 	});
// });

