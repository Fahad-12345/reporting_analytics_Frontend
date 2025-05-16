import { Action } from './../../../../../../../projects/task-manager/src/lib/shared/modal-content/model-content.interfaces';
import { ActionEnum } from './../../reasonCodeEnum';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { Config } from '@appDir/config/config';
import { ToastrService, ToastrModule } from 'ngx-toastr';
import { ReasonCodeService } from '@appDir/front-desk/masters/reason-code/reason-code.service';
import { SharedModule } from '@appDir/shared/shared.module';
import { ReasonCodeViewComponent } from '@appDir/front-desk/masters/reason-code/reason-code/reason-code-view/reason-code-view.component';
import { TestBed, async, ComponentFixture, inject } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { spy } from 'sinon';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe(("ReasonCodeViewComponent"), () => {
	let comp: ReasonCodeViewComponent;
	let fixture: ComponentFixture<ReasonCodeViewComponent>;
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ReasonCodeViewComponent],
			imports: [ToastrModule.forRoot(), SharedModule, RouterTestingModule, FormsModule, ReactiveFormsModule,HttpClientTestingModule ],
			providers: [Config, LocalStorage, ReasonCodeService, FormBuilder]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ReasonCodeViewComponent);
		comp = fixture.componentInstance;
	})
	afterEach(() => {
		fixture.destroy();
	});

	it('should loadSpin false at start', () => {
		expect(comp.loadSpin).toBe(false);
	});

	it('Check initReasonCodeDetailForm is called from ngOnInit', () => {
		const spy_getQueryParams = spyOn(comp, 'initReasonCodeDetailForm').and.callThrough();
		comp.ngOnInit();
		expect(spy_getQueryParams).toHaveBeenCalled();
	});
	it('Check patchValueInReasonCodeDetailForm is called', () => {
		const mockObject = {
			action: 'view',
			reasonCodeDetail: {
				code: "A",
				description: "Prescriber must confirm their State license status.",
				id: 1,
				reason_code_category_id: 1
			}
		}
		spyOn(comp, 'patchValueInReasonCodeDetailForm') // spy first
		comp.patchValueInReasonCodeDetailForm(mockObject.reasonCodeDetail)
		expect(comp.patchValueInReasonCodeDetailForm).toHaveBeenCalledWith(mockObject.reasonCodeDetail);
	});
	function setFormValues(fromData) {
		console.log(fromData);
		comp.reasonCodeDetailForm.controls['code'].setValue(fromData.code);
		comp.reasonCodeDetailForm.controls['description'].setValue(fromData.description);
		comp.reasonCodeDetailForm.controls['id'].setValue(fromData.id);
		comp.reasonCodeDetailForm.controls['reason_code_category_id'].setValue(fromData.reason_code_category_id);
	}
	it('should form is valid', () => {
		comp.initReasonCodeDetailForm();
		const mockObject = {
			action: 'view',
			reasonCodeDetail: {
				code: "",
				description: "",
				id: '',
				reason_code_category_id: ''
			}
		}
		setFormValues(mockObject.reasonCodeDetail)
		// fixture.detectChanges();
		// const form = comp.reasonCodeDetailForm;
		// fixture.detectChanges();

		// comp.reasonCodeDetailForm.patchValue(mockObject.reasonCodeDetail);
		// fixture.detectChanges();
		expect(comp.reasonCodeDetailForm.valid).toBeTruthy();
	});
	it('should contain empty default values for Form at first time', () => {
		comp.initReasonCodeDetailForm();
		const mockObject = {
			reasonCodeDetail: {
				code: "",
				description: "",
				id: '',
				reason_code_category_id: ''
			}
		}
		expect(comp.reasonCodeDetailForm.value).toEqual(mockObject.reasonCodeDetail);
	});
	it('should form disalbe when action view', () => {
		comp.action = ActionEnum.VIEW;
		comp.initReasonCodeDetailForm();
		spyOn(comp, 'formEnableDisabled');
		comp.formEnableDisabled(comp.action);
		expect(comp.reasonCodeDetailForm.controls.code.disabled).not.toBe(true);
	});
});

