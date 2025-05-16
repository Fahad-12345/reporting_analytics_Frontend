import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { InsuranceMasterRoutingModule } from './insurance-master-routing.module';
import { PlantypeComponent } from './PlanType/plantype/plantype.component';
import { PlannameComponent } from './PlanName/planname/planname.component';
// import { InsuranceComponent } from './Insurance/insurance-list/insurance.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SharedModule } from '@appDir/shared/shared.module';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { MainInsuranceComponent } from './main-insurance.component';
import { BusyLoaderModule } from '@appDir/shared/busy-loader/busy-loader.module';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { FdSharedModule } from '@appDir/front-desk/fd_shared/fd-shared.module';
import { InsuranceFormComponent } from './Insurance/insurance-form/insurance-form.component';
import { AdjusterInformationComponent } from './adjuster/adjuster-information/adjuster-information.component';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';

@NgModule({
  declarations: [
    MainInsuranceComponent,

    // InsuranceComponent,
    //AddInsuranceComponent,
    //EditInsuranceComponent,

    // PlannameComponent,
    // PlantypeComponent,
    // AdjusterInformationComponent,
    // InsuranceFormComponent
  ],
  imports: [
    NgxMaskDirective, NgxMaskPipe,
    CommonModule,
    InsuranceMasterRoutingModule,
    SharedModule,
    PaginationModule.forRoot(),
	CollapseModule.forRoot(),
    // FormsModule,
    // ReactiveFormsModule,
    // MatCheckboxModule,
    // TaskManagerModule,
    // NgbModule,
    // NgMultiSelectDropDownModule,
    // NgxDatatableModule,
    // NgxMaskModule,
    // GooglePlaceModule,
    // MatDatepickerModule,
    // BusyLoaderModule,
    // FdSharedModule

  ],
  providers:[
    provideNgxMask()
  ]
})
export class InsuranceMasterModule { }
