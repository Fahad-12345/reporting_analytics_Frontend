import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CancelAppointmentListComponent } from './cancel-appointment-list.component';
// import { DataTableModule } from "angular-6-datatable";
import { HomeComponent } from './component/home/home.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { MyDatePickerModule } from 'mydatepicker';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatCheckboxModule } from '@angular/material/checkbox';
// import { JasperoAlertsModule } from '@jaspero/ng-alerts';
// import { NgProgressModule } from '@ngx-progressbar/core';
// import { NgProgressHttpModule } from '@ngx-progressbar/http';
// import { NgProgressRouterModule } from '@ngx-progressbar/router';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { SharedModule } from '@shared/shared.module';
import { CancelAppointmentDetailsComponent } from './modals/cancel-appointment-details/cancel-appointment-details.component';
import { CancelAppointmentListRoutingModule } from './cancel-appointment-list.routing';

@NgModule({
  imports: [
    CommonModule,
    CancelAppointmentListRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    // MyDatePickerModule,
    DatePickerModule,
    // DataTableModule,
    NgxDatatableModule,
  
    MatCheckboxModule,
    TabsModule.forRoot(),
    // NgProgressModule.forRoot(),
    // NgProgressHttpModule,
    // NgProgressRouterModule,
    SharedModule
  ],
  declarations: [
    CancelAppointmentListComponent,
    CancelAppointmentDetailsComponent,
    HomeComponent
  ], entryComponents: [
    CancelAppointmentDetailsComponent
  ]
})
export class CancelAppointmentListModule { }
