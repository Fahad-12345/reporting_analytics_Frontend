import { Logger } from '@nsalaun/ng-logger';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { Config } from '@appDir/config/config';
import { SharedModule } from '@appDir/shared/shared.module';
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DynamicFormModule } from '@appDir/shared/dynamic-form/dynamic-form.module';
import { ToastrModule } from 'ngx-toastr';
import { PersonalInformationFormComponent } from './personal-information-form.component';
import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe(("PersonalInformationFormComponent"), () => {
	let comp: PersonalInformationFormComponent;
	let fixture: ComponentFixture<PersonalInformationFormComponent>;
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [PersonalInformationFormComponent],
			imports: [ToastrModule.forRoot(), SharedModule, RouterTestingModule, DynamicFormModule,HttpClientTestingModule ],
			providers: [LocalStorage, Config, CaseFlowServiceService, Logger],
			schemas: [NO_ERRORS_SCHEMA],
			// providers: [Config, LocalStorage, ReasonCodeService, FormBuilder]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(PersonalInformationFormComponent);
		comp = fixture.componentInstance;
	})
	it('Should Create', () => {
		expect(comp).toBeTruthy();
	});
	// it('Should Call differenct functions on nfAfterViewInit', () => {
	// 	spyOn(comp,'setGenderListener');
	// 	// spyOn(comp,'setLanguageListener');
	// 	// spyOn(comp,'setDateChangeListener');
	// 	// spyOn(comp,'bindAtTheTimeOfAccident');
	// 	// spyOn(comp,'getCase');
	// 	comp.aclService.hasPermission(true);
	// 	comp.ngAfterViewInit();
	// 	expect(comp.setGenderListener).toHaveBeenCalled();
	// });

});

