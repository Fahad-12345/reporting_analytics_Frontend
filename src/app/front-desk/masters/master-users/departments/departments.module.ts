import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DepartmentsRoutingModule } from './departments-routing.module';
import { DepartmentComponent } from './department/department.component';
import { DepartmentService } from './department/department.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { SharedModule } from '@appDir/shared/shared.module';
import { BusyLoaderModule } from '@appDir/shared/busy-loader/busy-loader.module';

@NgModule({
	declarations: [
		DepartmentComponent
	],
	imports: [
		CommonModule,
		DepartmentsRoutingModule,
		FormsModule,
		ReactiveFormsModule,
		NgxDatatableModule,
		MatCheckboxModule,
		MatRadioModule,
		SharedModule,
		BusyLoaderModule
	],
	providers: [
		DepartmentService
	]
})
export class DepartmentsModule { }
