import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CodesRoutingModule } from './codes-routing.module';
import { HCPCSCodesComponent } from './hcpcscodes/hcpcs-codes/hcpcs-codes.component';
import { CPTCodesComponent } from './cptcodes/cpt-codes/cpt-codes.component';
import { ICDCodesComponent } from './icdcodes/icd-codes/icd-codes.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {  MatDatepickerModule } from '@angular/material/datepicker';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { CodesComponent } from './codes.component';
import { FeeScheduleComponentComponent } from './fee-schedule/fee-schedule-component/fee-schedule-component.component';
// import { MyDatePickerModule } from 'mydatepicker';
// import { NumberDirective } from './directives/numbers-only.directive';
import { SharedModule } from '@appDir/shared/shared.module';
import { BusyLoaderModule } from '@appDir/shared/busy-loader/busy-loader.module';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { CodeTypeComponent } from './codetype/code-type/code-type.component';
import { FeeTypeComponent } from './feetype/fee-type/fee-type.component';
import { DateOnlyDirective } from './directives/date-only.directive';
import { ProcedureCodesComponent } from './procedure-codes/procedure-codes.component';
// import { TitleCaseDirective } from './directives/title-case.directive';
// import { NadeanDirectiveDirective } from './directives/nadean-directive.directive';


@NgModule({
  declarations: [
    CodesComponent,
    // ICDCodesComponent,
    // CPTCodesComponent,
    // HCPCSCodesComponent,
    // FeeScheduleComponentComponent,
    // CodeTypeComponent,
    // FeeTypeComponent,
    ProcedureCodesComponent,
    // TitleCaseDirective,
    // DateOnlyDirective, 
    // NumberDirective,
    // NadeanDirectiveDirective,



  ],
  imports: [
    // CommonModule,
    // FormsModule,
    // ReactiveFormsModule,
    // MatCheckboxModule,
    // TaskManagerModule,
    // NgbModule,
    // NgMultiSelectDropDownModule,
    // PaginationModule,
    // NgxDatatableModule,
    CodesRoutingModule, 
    // MyDatePickerModule,
    // SharedModule,
    // BusyLoaderModule,
    CollapseModule.forRoot(),
    MatDatepickerModule,
	SharedModule,
    PaginationModule.forRoot(),
  ]
})
export class CodesModule { }
