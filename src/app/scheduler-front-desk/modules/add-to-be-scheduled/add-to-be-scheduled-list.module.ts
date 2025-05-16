import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddToBeScheduledListComponent } from './add-to-be-scheduled-list.component'
//shared modules
// import { DataTableModule } from "angular-6-datatable";
//routing
import { SchedulerAddToBeScheduleRoutingModule } from './add-to-be-scheduled-list.routing';
import { HomeComponent } from './component/home/home.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatCheckboxModule } from '@angular/material/checkbox';
//headers
// import { NgProgressModule } from '@ngx-progressbar/core';
// import { NgProgressHttpModule } from '@ngx-progressbar/http';
// import { NgProgressRouterModule } from '@ngx-progressbar/router';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { SharedModule } from '@shared/shared.module';
import { CancelAppointmentDetailsComponent } from './modals/cancel-appointment-details/cancel-appointment-details.component'

@NgModule({
  imports: [
    CommonModule,
    SchedulerAddToBeScheduleRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    // MyDatePickerModule,
    DatePickerModule,
    // DataTableModule,
    NgxDatatableModule,
    MatCheckboxModule,
    // HeaderModule,
    // NoopAnimationsModule,

    //headers
    TabsModule.forRoot(),
    // NgProgressModule.forRoot(),
    // NgProgressHttpModule,
    // NgProgressRouterModule,
    SharedModule
  ],
  declarations: [
    AddToBeScheduledListComponent,
    CancelAppointmentDetailsComponent,
    HomeComponent
  ], entryComponents: [
    CancelAppointmentDetailsComponent
  ]
})
export class AddtobescheduledListModule { }
