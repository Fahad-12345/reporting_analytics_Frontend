import { SharedModule } from '@appDir/shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParticularPatientComponent } from './particular-patient.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { RouterModule } from '@angular/router';
import { AppointmentSubjectService } from '../subject.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';


@NgModule({
  declarations: [ParticularPatientComponent],
  imports: [
    NgSelectModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    MatCheckboxModule,
    DatePickerModule,
    RouterModule,
    NgbModule,
	SharedModule


  ], providers: [

    AppointmentSubjectService
  ],
  exports: [
    ParticularPatientComponent
  ]
})
export class ParticularPatientModule {
  
 }
