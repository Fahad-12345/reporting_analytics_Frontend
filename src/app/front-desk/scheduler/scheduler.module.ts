import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FdSharedModule } from '../fd_shared/fd-shared.module';
import { SchedulerComponent } from './scheduler.component';
import { SchedulerRoutingModule } from './scheduler-routing.module';
import { SchedulingQueueModule } from '@shared/modules/appointment/scheduling-queue/scheduling-queue.module';
import { ParticularPatientModule } from '@shared/modules/appointment/particular-patient/particular-patient.module';
import { AppointmentModule } from '@shared/modules/appointment/appointment.module';
import { DoctorCalendarModule } from '@shared/modules/doctor-calendar/doctor-calendar.module';
import { ErrorInterceptor } from '@appDir/shared/interceptors/http.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
@NgModule({
  declarations: [SchedulerComponent],
  imports: [
    CommonModule,
    SchedulerRoutingModule,
    FdSharedModule,
    SchedulingQueueModule,
    ParticularPatientModule,
    AppointmentModule,
    DoctorCalendarModule
  ], providers: [

  ]
})
export class SchedulerModule { }
