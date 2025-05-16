import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppointmentRoutingModule } from './appointment-routing.module';
import { AppointmentComponent } from './appointment.component';
import { FdSharedModule } from '../fd_shared/fd-shared.module';
import { FlatpickrModule } from 'angularx-flatpickr';
// import { SchedulerModule } from 'angular-calendar-scheduler';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [AppointmentComponent],
  imports: [
    CommonModule,
    AppointmentRoutingModule,
    FdSharedModule,
    SharedModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    FlatpickrModule.forRoot(),
    // SchedulerModule.forRoot({ locale: 'en', headerDateFormat: 'daysRange' })
  ]
})
export class AppointmentModule { }
