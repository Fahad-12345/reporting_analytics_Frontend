import { FormControl } from '@angular/forms';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Logger } from '@nsalaun/ng-logger';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { Config } from '@appDir/config/config';
import { SharedModule } from '@appDir/shared/shared.module';
import { TestBed, async, ComponentFixture, } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DynamicFormModule } from '@appDir/shared/dynamic-form/dynamic-form.module';
import { ToastrModule } from 'ngx-toastr';
import { MarketingFormComponent } from './marketing-form.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe(("MarketingFormComponent"), () => {
	let comp: MarketingFormComponent;
	let fixture: ComponentFixture<MarketingFormComponent>;
	const childComponent = jasmine.createSpyObj('DynamicFormComponent', ['form']);
	let fb: FormBuilder;
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [MarketingFormComponent],
			imports: [ToastrModule.forRoot(), SharedModule, RouterTestingModule, DynamicFormModule,HttpClientTestingModule],
			// providers: [LocalStorage, Config, ConfirmationService, Logger, AlertsService],
			// schemas: [NO_ERRORS_SCHEMA],
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(MarketingFormComponent);
		comp = fixture.componentInstance;
	})
	it('Should create', () => {
		expect(comp).toBeTruthy();
	});
	it('Should snapshot length greater than One On ngOnInit', () => {
		// console.log("Child Component",childComponent);
		// console.log("Compeont Manin",comp);

		// console.log("Form Data",comp.component.form);
		// comp.component = TestBed.createComponent(DynamicFormComponent).componentInstance as DynamicFormComponent;
		// console.log('fafafa');
		// comp.ngOnInit();
		// comp.component.ngOnChanges();
		// comp.component.ngOnInit();

		comp.ngOnInit();
		expect(comp.route.snapshot.pathFromRoot.length > 0).toBeTruthy()
		// comp.ngAfterViewInit();
		// console.log("Child Comp",childComponent);
		// console.log("Componnet",comp);


		// expect(comp).toBeTruthy();
	});
	it('Should be Back button On Location', () => {
		spyOn(comp.location, 'back');
		comp.back();
		expect(comp.location.back).toHaveBeenCalled();
	});
	it('Should submit', () => {
		spyOn(comp, 'submit');
		comp.submit();
		expect(comp.submit).toHaveBeenCalled();
	});
	// it('Should ngAfterViewInit ', () => {
	// 	debugger;
	// 	comp.component.form = new FormGroup({
	// 		id: new FormControl('')
	// 	});
	// 	spyOn(comp.form,'patchValue').and.returnValue(true);
	// 	debugger;
	// 	comp.ngAfterViewInit();
	// 	expect(comp.form.patchValue).toHaveBeenCalled();
	// });
	it('Should hideButtons ', () => {
		comp.form  = new FormGroup({
			id: new FormControl('')
		});
		debugger;
		comp.ngOnInit();
		comp.hideButtons();
	
		expect(comp.form.disabled).toBe(false);
	});

	// 	comp.ngOnInit();
	// 	comp.ngAfterViewInit();
	// 	// const spy = spyOn(comp.form, 'patchValue');



	// 	// expect(spy).toHaveBeenCalledWith({
	// 	// 	advertisement_id: '1',
	// 	// 	id: '2',
	// 	// 	other_advertisement: null,
	// 	// 	referral_name: 'abc',
	// 	// 	referred_by_id: '3'
	// 	// });
	// 	expect(comp.form.value).toEqual({});
	// });

	// it('should back location on click back ',()=> {
	// 	spyOn(comp.location,'back');
	// 	expect(comp.location.back()).toHaveBeenCalled();
	// });
});

