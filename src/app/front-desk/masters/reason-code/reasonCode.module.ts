import { ReasonCodeComponent } from './reason-code.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { TimePickerAllModule } from '@syncfusion/ej2-angular-calendars';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '@appDir/shared/shared.module';
import { FdSharedModule } from '@appDir/front-desk/fd_shared/fd-shared.module';
import {  CollapseModule } from 'ngx-bootstrap/collapse';
import { MastersSharedModule } from '../shared/masters-shared.module';
import { BusyLoaderModule } from '@appDir/shared/busy-loader/busy-loader.module';
import { SignatureModule } from '@appDir/shared/signature/signature.module';
import { ReasonCodeFilterComponent } from './reason-code/reason-code-filter/reason-code-filter.component';
import { ReasonCodeViewComponent } from './reason-code/reason-code-view/reason-code-view.component';
import { ReasonCodeListComponent } from './reason-code/reason-code-list/reason-code-list.component';
import { ReasonCodeRoutingModule } from './reasonCode.routing';

@NgModule({
	declarations: [ReasonCodeComponent, ReasonCodeFilterComponent, ReasonCodeViewComponent, ReasonCodeListComponent],
	imports: [
		ReasonCodeRoutingModule,
		SharedModule,
		CollapseModule.forRoot(),
	]
})
export class ReasonCodeModule { }
