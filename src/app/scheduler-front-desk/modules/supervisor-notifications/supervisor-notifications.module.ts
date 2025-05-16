import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

//routing
import { SchedulerSupervisorNotificationRoutingModule } from './supervisor-notifications.routing';
import { DoctorDescriptionModalComponent } from './modals/doctor-description-modal/doctor-description-modal.component'

//sockets
import { SupervisorNotificationsService } from './supervisor-notifications.service';
import { WrappedSocket } from './sockets/socket-io.service';

//components
import { SupervisorNotificationsComponent } from './supervisor-notifications.component';
import { SupervisorNotificationHomeComponent } from './components/home/home.component';

//calendar modules
// import { MyDatePickerModule } from 'mydatepicker';

import { DemoUtilsModule } from './utils/demo-utils/module';
import { CalendarModule, DateAdapter } from './utils/my-calendar/src/index';
import { adapterFactory } from './utils/my-calendar/src/date-adapters/date-fns';
import { SharedModule } from '@appDir/shared/shared.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
	SharedModule,
  SchedulerSupervisorNotificationRoutingModule,    // MyDatePickerModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    DemoUtilsModule,
  ],
  entryComponents: [
    DoctorDescriptionModalComponent
  ],
  providers: [
    SupervisorNotificationsService,
    WrappedSocket
  ],
  declarations: [SupervisorNotificationsComponent,
    SupervisorNotificationHomeComponent,
    DoctorDescriptionModalComponent,
  ], exports: [
    SupervisorNotificationHomeComponent,
  ]
})
export class SupervisorNotificationsModule { }
