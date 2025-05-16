import { SchedulerSupervisorService } from './../../../../scheduler-front-desk/scheduler-supervisor.service';
import { NgModule, ApplicationRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { routing } from './scheduling-queue.routing';
// import { HomeComponent } from './home/home.component';


// import { NgbModule } from '@ng-bootstrap/ng-bootstrap';




//components
import { SchedulingQueueComponent } from './scheduling-queue.component';
import { HomeComponent } from './components/home/home.component';
import { FindBestComponent } from './components/find-best/find-best.component';
import { ManualCalendarComponent } from './components/manual-calendar/manual-calendar.component';
import { DatatableComponent } from './components/find-best/datatable/datatable.component';

//import { DoctorCalendarModule } from './doctor-calendar/doctor-calendar.module'
//HAMZA
import { DoctorCalendarModule } from '@shared/modules/doctor-calendar/doctor-calendar.module';
//import { DoctorCalendarService } from './doctor-calendar/doctor-calendar.service';
import { DoctorCalendarService } from '@shared/modules/doctor-calendar/doctor-calendar.service';
//

import { VisitHistoryComponent } from './modals/visit-history/visit-history.component';
//date time pickers
// import { MyDatePickerModule } from 'mydatepicker';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { TimePickerModule } from '@syncfusion/ej2-angular-calendars';
// import { DataTableModule } from "angular-6-datatable";
//services
import { SchedulingQueueService } from './scheduling-queue.service';
//drag scroll
import { DragScrollModule } from 'ngx-drag-scroll';
//headers
// import { NgProgressModule } from '@ngx-progressbar/core';
// import { NgProgressHttpModule } from '@ngx-progressbar/http';
// import { NgProgressRouterModule } from '@ngx-progressbar/router';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { SharedModule } from '@shared/shared.module';
// import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    // HttpModule,
    HttpClientModule,
    DatePickerModule,
    ReactiveFormsModule,
    TimePickerModule,
    // DataTableModule,
 
    MatCheckboxModule,
    NgxDatatableModule,
    // MyDatePickerModule,
    DragScrollModule,
    TabsModule.forRoot(),
    // NgProgressModule.forRoot(),
    // NgProgressHttpModule,
    // NgProgressRouterModule,
    SharedModule,
    
    DoctorCalendarModule,

  ],
  declarations: [
    SchedulingQueueComponent,
    HomeComponent,
    FindBestComponent,
    DatatableComponent,
    VisitHistoryComponent,
    ManualCalendarComponent
  ],
  entryComponents: [
    VisitHistoryComponent,

  ],
  providers: [
    SchedulingQueueService,
    
    //HAMZA //TO ADD SHARED CALENDAR
    DoctorCalendarService,
    SchedulerSupervisorService
    //
  ],
  exports: [
    HomeComponent
  ]
})
export class SchedulingQueueModule { }
