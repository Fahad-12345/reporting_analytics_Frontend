import { ErxOverrideReasonViewComponent } from './erx-override-reason/erx-override-reason-view/erx-override-reason-view.component';
import { ErxOverrideReasonFilterComponent } from './erx-override-reason/erx-override-reason-filter/erx-override-reason-filter.component';
import { ErxOverrideReasonComponent } from './erx-override-reason.component';
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
import { ReactionRoutingModule } from './erx-override-reason.routing';
import { ErxOverrideReasonListComponent } from './erx-override-reason/erx-override-reason-list/erx-override-reason-list.component';

@NgModule({
	declarations: [ErxOverrideReasonComponent, ErxOverrideReasonFilterComponent, ErxOverrideReasonViewComponent, ErxOverrideReasonListComponent],
	imports: [
		CommonModule,
		FormsModule,
		ReactionRoutingModule,
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
export class ErxOverrideReasonModule { }
