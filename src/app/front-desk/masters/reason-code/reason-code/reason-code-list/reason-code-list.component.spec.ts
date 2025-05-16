import { ActionEnum } from './../../reasonCodeEnum';
import { ReasonCodeViewComponent } from '@appDir/front-desk/masters/reason-code/reason-code/reason-code-view/reason-code-view.component';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { Config } from '@appDir/config/config';
import { ToastrService, ToastrModule } from 'ngx-toastr';
import { ReasonCodeService } from '@appDir/front-desk/masters/reason-code/reason-code.service';
import { SharedModule } from '@appDir/shared/shared.module';
import { TestBed, async, ComponentFixture, inject } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ReasonCodeListComponent } from './reason-code-list.component';
import { ReasonCodeFilterComponent } from '../reason-code-filter/reason-code-filter.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe(("ReasonCodeListComponent"), () => {
	let comp: ReasonCodeListComponent;
	let fixture: ComponentFixture<ReasonCodeListComponent>;
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ReasonCodeListComponent, ReasonCodeFilterComponent, ReasonCodeViewComponent],
			imports: [ToastrModule.forRoot(), SharedModule, RouterTestingModule,HttpClientTestingModule ],
			providers: [Config, LocalStorage, ReasonCodeService, FormBuilder]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ReasonCodeListComponent);
		comp = fixture.componentInstance;
	})

	it('should loadSpin false at start', () => {
		expect(comp.loadSpin).toBe(false);
	});
	it('Check getQueryParams is called from ngOnInit', () => {
		const spy_getQueryParams = spyOn(comp, 'getQueryParams');
		comp.ngOnInit();
		expect(spy_getQueryParams).toHaveBeenCalled();
	});
	it('Should call getReasonByID on click of view button', () => {
		fixture.detectChanges();
		spyOn(comp, 'getReasonByID');
		const row = {
			code: "A",
			created_at: "2021-03-01 13:44:47",
			created_by: null,
			deleted_at: null,
			description: "Prescriber must confirm their State license status.",
			id: 1,
			reason_code_category_id: 1,
			reason_codes_category: {
				created_by: null,
				description: "Used in Prescription Change Request transactions, to further clarify the MessageRequestCode.",
				id: 1,
				name: "MessageRequestSubCode",
				updated_by: null
			},
			updated_at: "2021-03-01 13:44:47",
			updated_by: null
		}
		comp.getReasonByID(row,'viewReactionModal',ActionEnum.VIEW);
		expect(comp.getReasonByID).toHaveBeenCalledWith(row,'viewReactionModal',ActionEnum.VIEW);
	});
});

