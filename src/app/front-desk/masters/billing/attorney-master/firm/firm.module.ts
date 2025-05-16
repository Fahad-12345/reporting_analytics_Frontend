import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirmRoutingModule } from './firm-routing.module';
import { FirmListingComponent } from './firm-listing/firm.component';
import { FirmComponent } from './firm/add-attorney.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import {  CollapseModule } from 'ngx-bootstrap/collapse';

import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SharedModule } from '@appDir/shared/shared.module';
import { SharedFirmLocationModuleModule } from '../shared-locations_firm/shared-firms-location/shared-firm-location-module/shared-firm-location-module.module';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';

@NgModule({
	declarations: [FirmListingComponent, FirmComponent],
	imports: [
		CommonModule,
		FirmRoutingModule,
		PaginationModule,
		NgxDatatableModule,
		SharedModule,
		CollapseModule.forRoot(),
		// MasterMainAttorneyModule,
		ScrollToModule.forRoot(),
		SharedFirmLocationModuleModule
	]
})
export class FirmModule { }
