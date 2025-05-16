import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { AttorneyComponent } from './attorney/attorney-listing/attorney.component';
import { FirmListingComponent } from './firm/firm-listing/firm.component';
import { SharedModule } from '@appDir/shared/shared.module';

import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { BusyLoaderModule } from '@appDir/shared/busy-loader/busy-loader.module';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { SharedFirmsLocationComponent } from './shared-locations_firm/shared-firms-location/shared-firms-location.component';
import { FirmComponent } from './firm/firm/add-attorney.component';
import { MasterMainAttorneyRoutingModule } from './master-main-attorney-routing.module';
import { MainAttorneyComponent } from './main-attorney.component';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';

@NgModule({
	declarations: [
	// AttorneyComponent,s
		// FirmListingComponent,
		// SharedFirmsLocationComponent,
		MainAttorneyComponent
		// FirmComponent
	],
	imports: [
		// CommonModule,
		// FormsModule,
		// ReactiveFormsModule,
		// MatCheckboxModule,
		// TaskManagerModule,
		// NgbModule,
		// NgMultiSelectDropDownModule,
		// GooglePlaceModule,
		// NgxMaskModule,
		// BusyLoaderModule,

		PaginationModule,
		NgxDatatableModule,
		MasterMainAttorneyRoutingModule,
		SharedModule,
		CollapseModule.forRoot()
	],
	exports:[
		// SharedFirmsLocationComponent
	]

})
export class MasterMainAttorneyModule { }
