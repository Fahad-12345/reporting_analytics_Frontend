import { ClinicsComponent } from './clinics/clinics.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SharedModule } from '@appDir/shared/shared.module';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { ClinicFilterComponent } from './clinic-filter/clinic-filter.component';
import { ClinicsRoutingModule } from './clinic-routing.module';
import { AddClinicComponent } from './add-clinic/add-clinic.component';
import { AddClinicLocationComponent } from './add-clinic-location/add-clinic-location.component';
import { ClinicsLocationListComponent } from './clinics-location-list/clinics-location-list.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';

@NgModule({
	declarations: [ClinicsComponent, ClinicFilterComponent, AddClinicComponent, AddClinicLocationComponent, ClinicsLocationListComponent],
	imports: [
		CommonModule,
		ClinicsRoutingModule,
		PaginationModule,
		NgxDatatableModule,
		SharedModule,
		ScrollToModule.forRoot(),
		MatSlideToggleModule,
		GooglePlaceModule,
	],
	entryComponents:[AddClinicLocationComponent]
})
export class ClinicModule { }
