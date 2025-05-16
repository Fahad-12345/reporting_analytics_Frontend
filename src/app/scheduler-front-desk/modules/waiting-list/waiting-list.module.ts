import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WaitingListComponent } from './waiting-list.component';
//shared modules
// import { DataTableModule } from "angular-6-datatable";
//routing
import { SchedulerWaitingListRouteModule } from './waiting-list.routing';
import { HomeComponent } from './component/home/home.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
// import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
//headers
// import { JasperoAlertsModule } from '@jaspero/ng-alerts';
// import { NgProgressModule } from '@ngx-progressbar/core';
// import { NgProgressHttpModule } from '@ngx-progressbar/http';
// import { NgProgressRouterModule } from '@ngx-progressbar/router';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { SharedModule } from '@shared/shared.module';
import { MatCheckboxModule } from '@angular/material/checkbox';

// import { HeaderModule } from '../header/header.module';
@NgModule({
  imports: [
    CommonModule,
    SchedulerWaitingListRouteModule,
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
    // JasperoConfirmationsModule.forRoot(),
    // JasperoAlertsModule.forRoot(),
    TabsModule.forRoot(),
    // NgProgressModule.forRoot(),
    // NgProgressHttpModule,
    // NgProgressRouterModule,
    SharedModule
  ],
  declarations: [
    WaitingListComponent,
    HomeComponent
  ]
})
export class WaitingListModule { }
