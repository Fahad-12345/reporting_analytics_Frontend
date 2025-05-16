import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AttorneyRoutingModule } from './attorney-routing.module';
import { AttorneyComponent } from './attorney.component';
import { FdSharedModule } from '@appDir/front-desk/fd_shared/fd-shared.module';
import { AttorneyFormComponent } from './components/attorney-form/attorney-form.component';
import { DynamicFormModule } from '@appDir/shared/dynamic-form/dynamic-form.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
	declarations: [AttorneyComponent, AttorneyFormComponent],
	imports: [
		CommonModule,
		AttorneyRoutingModule,
		DynamicFormModule,
		ReactiveFormsModule
		// FdSharedModule
	]
})
export class AttorneyModule { }
