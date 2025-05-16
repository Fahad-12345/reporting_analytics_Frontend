import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccidentRoutingModule } from './accident-routing.module';
import { AccidentComponent } from './accident.component';
import { FdSharedModule } from '@appDir/front-desk/fd_shared/fd-shared.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SharedModule } from '@appDir/shared/shared.module';
import { DynamicFormModule } from '@appDir/shared/dynamic-form/dynamic-form.module';
import { InjuryInformationFormComponent } from './components/injury-information-form/injury-information-form.component';
import { ObjectInvolvedFormComponent } from './components/object-involved-form/object-involved-form.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';

@NgModule({
	declarations: [AccidentComponent, InjuryInformationFormComponent, ObjectInvolvedFormComponent],
	imports: [
		CommonModule,
		AccidentRoutingModule,
		NgxMaskDirective, NgxMaskPipe,
		 FdSharedModule,
		MatCheckboxModule,
		// NgxMaskModule.forRoot(),
		NgxDatatableModule,
		SharedModule,
		DynamicFormModule
	],
	providers:[provideNgxMask()]
})
export class AccidentModule { }
