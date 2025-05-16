import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentComponent } from './appointment.component';
import { HomeComponent } from './home/home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TimePickerModule } from '@syncfusion/ej2-angular-calendars';
//shared modules
// import { HeaderModule } from '../header/header.module';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
// import { DataTableModule } from "angular-6-datatable";
// import {UpdateAppoitModalComponent } from '../doctor-calendar/modals/update-appoit-modal/update-appoit-modal.component'
import { MatCheckboxModule } from '@angular/material/checkbox';

//modals
import { AddToWaitingListModalComponent } from './modals/add-to-waiting-list-modal/add-to-waiting-list-modal.component'
import { WalkInNotSeenComponent } from './modals/walk-in-not-seen/walk-in-not-seen.component';

//service
import { AppointmentService } from './appointment.service'
import { ParticularPatientModule } from './particular-patient/particular-patient.module'



//for headers of main module
// import { NgProgressModule } from '@ngx-progressbar/core';
// import { NgProgressHttpModule } from '@ngx-progressbar/http';
// import { NgProgressRouterModule } from '@ngx-progressbar/router';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { SharedModule } from '@shared/shared.module';
import { RouterModule } from '@angular/router';
import { SchedulingQueueModule } from './scheduling-queue/scheduling-queue.module'
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { DetailErrorMessagePopupModalComponent } from './modals/detail-error-message-popup-modal/detail-error-message-popup-modal.component';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgxDatatableModule,
    RouterModule,
    ReactiveFormsModule,
    DatePickerModule,
    // DataTableModule,
    NgbModule,
    // HeaderModule,
    TimePickerModule,
    SchedulingQueueModule,
    MatCheckboxModule,
    ParticularPatientModule,

    //headers
    TabsModule.forRoot(),
    // NgProgressModule.forRoot(),
    // NgProgressHttpModule,
    // NgProgressRouterModule,
    SharedModule,
  ],
  declarations: [
    AppointmentComponent,
    HomeComponent,
    AddToWaitingListModalComponent,
    WalkInNotSeenComponent,
    DetailErrorMessagePopupModalComponent
    // UpdateAppoitModalComponent
  ],
  entryComponents: [
    AddToWaitingListModalComponent,
    WalkInNotSeenComponent,
	DetailErrorMessagePopupModalComponent
    // UpdateAppoitModalComponent
  ], providers: [

    AppointmentService
  ],
  exports: [
    HomeComponent
  ]
})
export class AppointmentModule { }


