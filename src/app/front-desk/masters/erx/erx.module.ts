
import { ErxComponent } from './erx.component';
import { PharmacyListComponent } from './pharmacy/pharmacy-list/pharmacy-list.component';
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
import { ErxRoutingModule } from './erx.routing';
import { ErxMenuComponent } from './erx-menu/erx-menu.component';
import { PharmacyFilterComponent } from './pharmacy/pharmacy-filter/pharmacy-filter.component';
import { PharmacyDetailComponent } from './pharmacy/pharmacy-detail/pharmacy-detail.component';
import { ProofingLicenseFilterComponent } from './proofing-license/proofing-license-filter/proofing-license-filter.component';
import { ProofingLicenseListComponent } from './proofing-license/proofing-license-list/proofing-license-list.component';
import { ProofingLicenseDetailComponent } from './proofing-license/proofing-license-detail/proofing-license-detail.component';

@NgModule({
	declarations: [PharmacyListComponent, ErxComponent, ErxMenuComponent, PharmacyFilterComponent, PharmacyDetailComponent, ProofingLicenseFilterComponent, ProofingLicenseListComponent, ProofingLicenseDetailComponent],
	imports: [
		CommonModule,
		FormsModule,
		ErxRoutingModule,
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
		ErxComponent
	]
})
export class ErxModule { }
