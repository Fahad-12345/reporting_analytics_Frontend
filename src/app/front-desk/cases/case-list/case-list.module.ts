import { ErrorMessageModalComponent } from './components/error-message-component/error-message-component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CaseListRoutingModule } from './case-list-routing.module';
import { CaseListComponent } from './case-list.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { SharedModule } from '@appDir/shared/shared.module';
import { BusyLoaderModule } from '@appDir/shared/busy-loader/busy-loader.module';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { ChoosePatientComponent } from './components/choose-patient/choose-patient.component';
import { DynamicFormModule } from '@appDir/shared/dynamic-form/dynamic-form.module';
@NgModule({
  declarations: [ErrorMessageModalComponent
	,CaseListComponent, ChoosePatientComponent],
  imports: [
    CommonModule,
    NgxDatatableModule,
    CaseListRoutingModule,
    MatCheckboxModule,
    MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    BusyLoaderModule,
    CollapseModule.forRoot(),
    DynamicFormModule
  ], entryComponents: [ChoosePatientComponent],
  exports :[CaseListComponent,CaseListRoutingModule,ErrorMessageModalComponent]
})
export class CaseListModule { }
