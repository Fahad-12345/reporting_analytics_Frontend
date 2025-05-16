import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MasterAttorneyRoutingModule } from './master-attorney-routing.module';
import { AttorneyComponent } from './attorney-listing/attorney.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import {  CollapseModule } from 'ngx-bootstrap/collapse';

import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SharedModule } from '@appDir/shared/shared.module';
import { SharedFirmsLocationComponent } from '../shared-locations_firm/shared-firms-location/shared-firms-location.component';
import { MasterMainAttorneyModule } from '../master-main-attorney.module';
import { SharedFirmLocationModuleModule } from '../shared-locations_firm/shared-firms-location/shared-firm-location-module/shared-firm-location-module.module';

@NgModule({
	declarations: [AttorneyComponent],
	imports: [
		CommonModule,
		MasterAttorneyRoutingModule,
		PaginationModule,
		NgxDatatableModule,
		SharedModule,
		CollapseModule.forRoot(),
		// SharedFirmsLocationComponent,
		// MasterMainAttorneyModule,
		SharedFirmLocationModuleModule
	]
})
export class MasterAttorneyModule { }
