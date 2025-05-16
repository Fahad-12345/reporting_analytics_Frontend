import { DeaScheduleCodeComponent } from './dea.schedule.code.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { TimePickerAllModule } from '@syncfusion/ej2-angular-calendars';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '@appDir/shared/shared.module';
import { FdSharedModule } from '@appDir/front-desk/fd_shared/fd-shared.module';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { MastersSharedModule } from '../shared/masters-shared.module';
import { BusyLoaderModule } from '@appDir/shared/busy-loader/busy-loader.module';
import { SignatureModule } from '@appDir/shared/signature/signature.module';
import { DeaScheduleCodeListComponent } from './deaScheduleCode/deaScheduleCode-list/dea.schedule.code-list.component';
import { DeaScheduleCodeViewComponent } from './deaScheduleCode/deaScheduleCode-view/dea.schedule.code-view.component';
import { DeaScheduleCodeFilterComponent } from './deaScheduleCode/deaScheduleCode-filter/dea.schedule.code-filter.component';
import { DeaScheduleCodeRoutingModule } from './dea.schedule.code.routing';

@NgModule({
	declarations: [DeaScheduleCodeComponent, DeaScheduleCodeListComponent, DeaScheduleCodeViewComponent, DeaScheduleCodeFilterComponent],
	imports: [
		CommonModule,
		FormsModule,
		DeaScheduleCodeRoutingModule,
		ReactiveFormsModule,
		GooglePlaceModule,
		NgxDatatableModule,
		MatCheckboxModule,
		NgMultiSelectDropDownModule.forRoot(),
		TimePickerAllModule,
		NgbModule,
		FdSharedModule,
		SharedModule,
		PaginationModule.forRoot(),
		MastersSharedModule,
		BusyLoaderModule,
		CollapseModule.forRoot(),
		SignatureModule
	]
})
export class ErxDeaSchedulerCodeModule { }
