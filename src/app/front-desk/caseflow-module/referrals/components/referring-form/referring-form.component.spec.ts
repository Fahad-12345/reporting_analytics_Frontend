import { Logger } from '@nsalaun/ng-logger';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { Config } from '@appDir/config/config';
import { SharedModule } from '@appDir/shared/shared.module';
import { TestBed, async, ComponentFixture} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DynamicFormModule } from '@appDir/shared/dynamic-form/dynamic-form.module';
import { ToastrModule } from 'ngx-toastr';
import { ReferringFormComponent } from './referring-form.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe(("ReferringFormComponent"), () => {
	let comp: ReferringFormComponent;
	let fixture: ComponentFixture<ReferringFormComponent>;
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ReferringFormComponent],
			imports: [ToastrModule.forRoot(), SharedModule, RouterTestingModule, DynamicFormModule,HttpClientTestingModule ],
			providers: [LocalStorage, Config, Logger],
			schemas: [NO_ERRORS_SCHEMA],
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ReferringFormComponent);
		comp = fixture.componentInstance;
	})
	it('Should Create', () => {
		expect(comp).toBeTruthy();
	});
	it('should ngAfterViewInit',() => {
		spyOn(comp,'enableDisableForm');
		comp.ngAfterViewInit();

		expect(comp.enableDisableForm).toHaveBeenCalled();
	});
	it('should ngOnint call setConfigration,getCase and physicianRadioButton',() => {
		spyOn(comp,'setConfigration');
		spyOn(comp,'getCase');
		spyOn(comp,'physicianRadioButton');
		comp.ngOnInit();

		expect(comp.setConfigration).toHaveBeenCalled();
		expect(comp.getCase).toHaveBeenCalled();
		expect(comp.physicianRadioButton).toHaveBeenCalled();
	});
	it('should ngOnChanges call setValues and condition as by default checking',() => {
		comp.ngOnChanges();
		expect(comp.referring).toBeFalsy();
		expect(comp.reffering_physician).toBeFalsy();
		expect(comp.primary_physician).toBeFalsy();

	});
	// it('On call submit function',() => {
	// 	const form = {
	// 		primary_care_physician_dialog : '',
	// 		reffer_by_physician_dialog : ''
	// 	}
	// 	comp.submit(form);
	// 	expect(form.primary_care_physician_dialog).toBe(undefined);
	// 	expect(form.reffer_by_physician_dialog).toBe(undefined);

	// });


});

