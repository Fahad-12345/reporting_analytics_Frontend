import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { BusyLoaderModule } from '@appDir/shared/busy-loader/busy-loader.module';
import { FdSharedModule } from '@appDir/front-desk/fd_shared/fd-shared.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {  MatSlideToggleModule } from '@angular/material/slide-toggle';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { SharedModule } from '@appDir/shared/shared.module';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { VistTypeRoutingModule } from './visit.type.routing';
import { VisittypeComponent } from './visitTypeComponent/visit.type.component';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';


@NgModule({
  declarations: [
    VisittypeComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    VistTypeRoutingModule,
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
    FdSharedModule,
	MatSlideToggleModule
  ],
  providers: [
		provideNgxMask(),

	],
})
export class VisitTypeProviderModule { }
