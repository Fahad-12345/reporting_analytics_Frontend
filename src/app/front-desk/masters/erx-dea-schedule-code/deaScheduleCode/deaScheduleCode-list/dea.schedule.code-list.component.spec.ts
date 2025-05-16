import { ReasonCodeViewComponent } from '@appDir/front-desk/masters/reason-code/reason-code/reason-code-view/reason-code-view.component';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { Config } from '@appDir/config/config';
import { ToastrService, ToastrModule } from 'ngx-toastr';
import { ReasonCodeService } from '@appDir/front-desk/masters/reason-code/reason-code.service';
import { SharedModule } from '@appDir/shared/shared.module';
import { TestBed, async, ComponentFixture, inject } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { DeaScheduleCodeListComponent } from './dea.schedule.code-list.component';
import { DeaScheduleCodeFilterComponent } from '../deaScheduleCode-filter/dea.schedule.code-filter.component';
import { DeaScheduleCodeViewComponent } from '../deaScheduleCode-view/dea.schedule.code-view.component';
import { DeaSchedulerCodenService } from '../../dea.schedule.code.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe(("DeaScheduleCodeListComponent"), () => {
	let comp: DeaScheduleCodeListComponent;
	let fixture: ComponentFixture<DeaScheduleCodeListComponent>;
	let row =  {
        "id": 2,
        "federal_dea_class_code": 1,
        "federal_dea_class_code_desc": "C-I",
        "ncit_code": "C48672",
        "ncpdp_preferred_term": "Schedule I Substance",
        "created_by": null,
        "updated_by": null
      }
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [DeaScheduleCodeListComponent, DeaScheduleCodeFilterComponent, DeaScheduleCodeViewComponent],
			imports: [ToastrModule.forRoot(), SharedModule, RouterTestingModule,HttpClientTestingModule],
			providers: [Config, LocalStorage, DeaSchedulerCodenService, FormBuilder]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(DeaScheduleCodeListComponent);
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
	it('Should call getDeaSchedulerCodeByID on click of view button', () => {
		fixture.detectChanges();
		spyOn(comp, 'getDeaSchedulerCodeByID');
		comp.getDeaSchedulerCodeByID(row,'viewReactionModal','view');
		expect(comp.getDeaSchedulerCodeByID).toHaveBeenCalledWith(row,'viewReactionModal','view');
	});
});

