
import { ReasonCodeViewComponent } from '@appDir/front-desk/masters/reason-code/reason-code/reason-code-view/reason-code-view.component';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { Config } from '@appDir/config/config';
import { ToastrService, ToastrModule } from 'ngx-toastr';
import { ReasonCodeService } from '@appDir/front-desk/masters/reason-code/reason-code.service';
import { SharedModule } from '@appDir/shared/shared.module';
import { TestBed, async, ComponentFixture, inject } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactionsListComponent } from './reactions-list.component';
import { ReactionsFilterComponent } from '../reactions-filter/reactions-filter.component';
import { ReactionsViewComponent } from '../reactions-view/reactions-view.component';
import { ActionEnum } from '../../reactionsEnum';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe(("ReactionsListComponent"), () => {
	let comp: ReactionsListComponent;
	let fixture: ComponentFixture<ReactionsListComponent>;
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ReactionsListComponent, ReactionsFilterComponent, ReactionsViewComponent],
			imports: [ToastrModule.forRoot(), SharedModule, RouterTestingModule,HttpClientTestingModule ],
			providers: [Config, LocalStorage, ReasonCodeService, FormBuilder]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ReactionsListComponent);
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
	it('Should call getReactionByID on click of view button', () => {
		fixture.detectChanges();
		spyOn(comp, 'getReactionByID');
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
		comp.getReactionByID(row,'viewReactionModal',ActionEnum.VIEW);
		expect(comp.getReactionByID).toHaveBeenCalledWith(row,'viewReactionModal',ActionEnum.VIEW);
	});
});

