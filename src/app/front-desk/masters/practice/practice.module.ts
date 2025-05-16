import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PracticeRoutingModule } from './practice-routing.module';
import { PracticeComponent } from './practice.component';
import { PracticeListingComponent } from './practice/practice-listing/practice-listing.component';
import { PracticeAddComponent } from './practice/practice-add/practice-add.component';
import { PracticeEditComponent } from './practice/practice-edit/practice-edit.component';
import { PracticeFormComponent } from './practice/shared/practice-form/practice-form.component';
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


import { PracticeLocationComponent } from './practice/shared/practice-location/practice-location.component';
import { MastersSharedModule } from '../shared/masters-shared.module';
import { PracticeLocationTableComponentComponent } from './practice/shared/practice-location-table-component/practice-location-table-component.component';
import { BusyLoaderModule } from '@appDir/shared/busy-loader/busy-loader.module';
import { HospitalComponent } from './hospital/hospital/hospital.component';
import { PracticeMenuComponent } from './practice-menu/practice-menu.component';
import { SignatureModule } from '@appDir/shared/signature/signature.module';
// import { ReferringPhysicianTabsComponent } from './referring-physician/referring-physician/referring-physician-tabs/referring-physician-tabs/referring-physician-tabs.component';
import { PracticeMenuSharedModule } from './practice-menu-shared/practice-menu-shared.module';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { PracticeService } from './practice/services/practice.service';
@NgModule({
	declarations: [PracticeComponent, PracticeListingComponent, PracticeAddComponent, PracticeEditComponent, PracticeFormComponent, PracticeLocationComponent, PracticeLocationTableComponentComponent, HospitalComponent],
	imports: [
		NgxMaskDirective, NgxMaskPipe,
		CommonModule,
		PracticeRoutingModule,
		PracticeMenuSharedModule,
		FormsModule,
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
	], entryComponents: [
		PracticeLocationComponent
	],
	providers: [
		provideNgxMask(),
		PracticeService

	],
})
export class PracticeModule { }
