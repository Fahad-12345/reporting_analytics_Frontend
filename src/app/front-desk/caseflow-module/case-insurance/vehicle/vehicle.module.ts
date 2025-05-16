import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VehicleRoutingModule } from './vehicle-routing.module';
import { VehicleComponent } from './vehicle.component';
import { FdSharedModule } from '@appDir/front-desk/fd_shared/fd-shared.module';
import { VehicleInfoFormComponent } from './components/vehicle-info-form/vehicle-info-form.component';
import { BusyLoaderModule } from '@appDir/shared/busy-loader/busy-loader.module';
import { DynamicFormModule } from '@appDir/shared/dynamic-form/dynamic-form.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SharedModule } from '@appDir/shared/shared.module';
@NgModule({
	declarations: [VehicleComponent, VehicleInfoFormComponent],
	imports: [
		CommonModule,
		VehicleRoutingModule,
		// FdSharedModule,
		BusyLoaderModule,
		DynamicFormModule,
		ReactiveFormsModule,
		NgxDatatableModule,
		SharedModule
	]
})
export class VehicleModule { }
