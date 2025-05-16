import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmployerRoutingModule } from './employer-routing.module';
import { EmployerComponent } from './employer.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FdSharedModule } from '@appDir/front-desk/fd_shared/fd-shared.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SharedModule } from '@appDir/shared/shared.module';
import { DynamicFormModule } from '@appDir/shared/dynamic-form/dynamic-form.module';
import { EmployerFormComponent } from '@appDir/front-desk/caseflow-module/case-insurance/employer/component/employer-form/employer-form.component';
import { EmploymentInfoFormComponent } from './component/employment-info-form/employment-info-form.component';
import { ReturnToWorkFormComponent } from './component/return-to-work-form/return-to-work-form.component';
import { ReactiveFormsModule } from '@angular/forms';
@NgModule({
	declarations: [EmployerComponent, EmploymentInfoFormComponent, ReturnToWorkFormComponent, EmployerFormComponent],
	imports: [
		CommonModule,
		EmployerRoutingModule,
		NgxDatatableModule,
		// FdSharedModule,
		MatCheckboxModule,
		SharedModule,
		DynamicFormModule,
		ReactiveFormsModule
	], entryComponents: [EmployerFormComponent]
})
export class EmployerModule { }
