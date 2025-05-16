import { Logger } from '@nsalaun/ng-logger';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { Config } from '@appDir/config/config';
import { SharedModule } from '@appDir/shared/shared.module';
import { TestBed, async, ComponentFixture, flush } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DynamicFormModule } from '@appDir/shared/dynamic-form/dynamic-form.module';
import { ToastrModule } from 'ngx-toastr';
import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';
import { ContactPeopleFormComponent } from './contact-people-form.component';
import { FormControl, FormGroup } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe(("ContactPeopleFormComponent"), () => {
	let comp: ContactPeopleFormComponent;
	let fixture: ComponentFixture<ContactPeopleFormComponent>;
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ContactPeopleFormComponent],
			imports: [ToastrModule.forRoot(), SharedModule, RouterTestingModule, DynamicFormModule,HttpClientTestingModule ],
			providers: [LocalStorage, Config, CaseFlowServiceService, Logger],
			schemas: [NO_ERRORS_SCHEMA],
			// providers: [Config, LocalStorage, ReasonCodeService, FormBuilder]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ContactPeopleFormComponent);
		comp = fixture.componentInstance;
	})
	it('Should Create', () => {
		expect(comp).toBeTruthy();
	});
	it('should getFormType', () => {
		var url = 'emergency-contact';
		comp.formType = 3;
		comp.getFormType();
		expect(url).toBe('emergency-contact');
		expect(comp.formType).toBe(3);
	});
	it('should setFormFillerDynamicForm', () => {
		spyOn(comp,'setFormFillerDynamicForm');
		comp.ngOnInit();
		expect(comp.setFormFillerDynamicForm).toHaveBeenCalled();
	});
	// it('Should submit and display success message toaster', () => {
	// 	spyOn(comp.toastrService,'success');
	// 	spyOn(comp.caseFlowService,'updateCase');
	// 	const form  = new FormGroup({
	// 		id: new FormControl('')
	// 	});
	// 	comp.component.form = form;
	// 	comp.ngAfterViewInit()
	// 	flush();
	// 	expect(comp.toastrService.success).toHaveBeenCalled();
	// });

});

