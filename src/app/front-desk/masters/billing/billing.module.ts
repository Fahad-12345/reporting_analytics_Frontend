import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { BillingRoutingModule } from './billing-routing.module';

// import { BillingMasterComponent } from './billing-master/billing-master.component';
import { MasterBillingComponent } from './billing.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FirmComponent } from './attorney-master/firm/firm/add-attorney.component';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { LocationEditComponentComponent } from './insurance-master/Insurance/location-edit-component/location-edit-component.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

import { SharedModule } from '@appDir/shared/shared.module';
import { AttorneyAPIServiceService } from './attorney-master/services/attorney-service.service';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { BusyLoaderModule } from '@appDir/shared/busy-loader/busy-loader.module';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { NgSelectModule } from '@ng-select/ng-select';


@NgModule({
	declarations: [
		MasterBillingComponent,
		//InsuranceComponent,
		//AttorneyComponent,
		// EmployerComponent,
		//AdjusterInformationComponent,

		// BillingMasterComponent,
		//FirmComponent,
		LocationEditComponentComponent,
		// AdjusterInformationModalComponentComponent,
		//FeeScheduleComponentComponent,
		// AddFeeScheduleComponentComponent,
		//MainAttorneyComponent,
		//InsuranceFormComponent
	],
	imports: [
		CommonModule,
		FormsModule,
		BillingRoutingModule,
		NgxDatatableModule,
		ReactiveFormsModule,
		MatCheckboxModule,
		GooglePlaceModule,
		NgbModule,
		NgMultiSelectDropDownModule,
		SharedModule,
		PaginationModule.forRoot(),
		MatDatepickerModule,
		BusyLoaderModule,
		CollapseModule.forRoot(),
		NgSelectModule
	],
	entryComponents: [LocationEditComponentComponent,
		//  AdjusterInformationModalComponentComponent, 
		//  AddFeeScheduleComponentComponent
		],
	providers: [AttorneyAPIServiceService],
})
export class BillingModule { }
