import { ReactionComponent } from './reaction.component';
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
import {  CollapseModule } from 'ngx-bootstrap/collapse';

import { MastersSharedModule } from '../shared/masters-shared.module';
import { BusyLoaderModule } from '@appDir/shared/busy-loader/busy-loader.module';
import { SignatureModule } from '@appDir/shared/signature/signature.module';
import { ReactionsFilterComponent } from './reactions/reactions-filter/reactions-filter.component';
import { ReactionsViewComponent } from './reactions/reactions-view/reactions-view.component';
import { ReactionsListComponent } from './reactions/reactions-list/reactions-list.component';
import { ReactionRoutingModule } from './reactions.routing';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
@NgModule({
	declarations: [ReactionComponent, ReactionsFilterComponent, ReactionsViewComponent, ReactionsListComponent],
	imports: [
		CommonModule,
		FormsModule,
		NgxMaskDirective, NgxMaskPipe,
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
	,
	providers: [
		provideNgxMask(),

	],
})
export class ReactionsModule { }
