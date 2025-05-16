import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CreateCaseRoutingModule } from './create-case-routing.module';
import { CreateCaseComponent } from './components/create-case/create-case.component';
import { SharedModule } from '@appDir/shared/shared.module';
import { FdSharedModule } from '@appDir/front-desk/fd_shared/fd-shared.module';
import { CreateCaseFormComponent } from './components/create-case-form/create-case-form.component';
import { DynamicFormModule } from '@appDir/shared/dynamic-form/dynamic-form.module';
import { CaseInfoEditComponent } from './components/case-info-edit/case-info-edit.component';
import { BusyLoaderModule } from '@appDir/shared/busy-loader/busy-loader.module';

@NgModule({
	declarations: [CreateCaseComponent,
		// CreateCaseFormComponent,
		//   CaseInfoEditComponent
	],
	imports: [
		CommonModule,
		CreateCaseRoutingModule,
		SharedModule,
		FdSharedModule,
		DynamicFormModule,
		BusyLoaderModule,

	], exports: []
})
export class CreateCaseModule { }
