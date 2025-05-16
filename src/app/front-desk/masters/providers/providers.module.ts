import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SharedModule } from '@appDir/shared/shared.module';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { BusyLoaderModule } from '@appDir/shared/busy-loader/busy-loader.module';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { ProivdersRoutingModule } from './providers.routing';
import { ProviderComponent } from './provider.component/providers.component';
import { FdSharedModule } from '@appDir/front-desk/fd_shared/fd-shared.module';
import { CaseTypeModule } from './caseType/case.type.module';
import { ProvidersNavBarComponent } from './navbar/navbar.component';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';


@NgModule({
  declarations: [
    ProviderComponent,
    ProvidersNavBarComponent

  ],
  imports: [
    CommonModule,
    NgxMaskDirective, NgxMaskPipe,
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    NgbModule,
    NgMultiSelectDropDownModule,
    NgxDatatableModule,
    SharedModule,
    GooglePlaceModule,
    PaginationModule.forRoot(),
    MatDatepickerModule,
    BusyLoaderModule,
    CollapseModule.forRoot(),
    ProivdersRoutingModule,
    FdSharedModule,
    CaseTypeModule,
	MatSlideToggleModule,

  ],
  providers: [
		provideNgxMask(),

	],
})
export class ProvidersModule { }
