import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MedicalTreatmentRoutingModule } from './medical-treatment-routing.module';
import { MedicalTreatmentComponent } from './medical-treatment.component';
import { FdSharedModule } from '@appDir/front-desk/fd_shared/fd-shared.module';
import { MedicalTreatmentFormComponent } from './components/medical-treatment-form/medical-treatment-form.component';
import { DynamicFormModule } from '@appDir/shared/dynamic-form/dynamic-form.module';
import { BusyLoaderModule } from '@appDir/shared/busy-loader/busy-loader.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SharedModule } from '@appDir/shared/shared.module';

@NgModule({
	declarations: [MedicalTreatmentComponent, MedicalTreatmentFormComponent],
	imports: [
		CommonModule,
		MedicalTreatmentRoutingModule,
		BusyLoaderModule,
		DynamicFormModule,
		NgxDatatableModule,
		SharedModule
		// FdSharedModule
	]
})
export class MedicalTreatmentModule { }
