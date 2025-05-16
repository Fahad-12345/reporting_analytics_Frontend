import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { BusyLoaderModule } from '@appDir/shared/busy-loader/busy-loader.module';
import { FdSharedModule } from '@appDir/front-desk/fd_shared/fd-shared.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { SharedModule } from '@appDir/shared/shared.module';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { SpecialityComponent } from './specialityComponent/speciality.component';
import { SpecialityRoutingModule } from './speciality.routing';
import { SpecialityListing } from './specialities-listing/specialities-listing.component';

import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
@NgModule({
  declarations: [
    SpecialityComponent,
    SpecialityListing
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SpecialityRoutingModule,
    NgxDatatableModule,
    NgxMaskDirective, NgxMaskPipe,
    GooglePlaceModule,
    BusyLoaderModule,
    FdSharedModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    NgbModule,
    NgMultiSelectDropDownModule,
    NgxDatatableModule,
    SharedModule,
    GooglePlaceModule,
    BusyLoaderModule,
    CollapseModule.forRoot(),
    FdSharedModule
  ],
  providers: [
		provideNgxMask(),

	],
})
export class SpecialityProviderModule { }
