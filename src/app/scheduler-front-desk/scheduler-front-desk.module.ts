import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RouterModule } from '@angular/router';

 import { TabsModule } from 'ngx-bootstrap/tabs';


import { FdSharedModule } from '@appDir/front-desk/fd_shared/fd-shared.module';

 import { AppointmentModule } from '@shared/modules/appointment/appointment.module';
import {
	ParticularPatientModule,
} from '@shared/modules/appointment/particular-patient/particular-patient.module';
import {
	SchedulingQueueModule,
} from '@shared/modules/appointment/scheduling-queue/scheduling-queue.module';
import { DoctorCalendarModule } from '@shared/modules/doctor-calendar/doctor-calendar.module';
import { SharedModule } from '@shared/shared.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

 import { AclRedirection } from '../shared/services/acl-redirection.service';
 import { AclService } from '../shared/services/acl.service';
import {
	SharedAppointmentComponent,
} from './components/shared-appointment/shared-appointment.component';
import {
	SharedDoctorCalendarComponent,
} from './components/shared-doctor-calendar/shared-doctor-calendar.component';
 import { SubNavComponent } from './components/sub-nav/sub-nav.component';
 import { DoctorService } from './doctor.service';
//services
 import { FrontDeskService } from './front-desk.service';
 import { SchedulerCustomizeModule } from './modules/scheduler-customize/scheduler-customize.module';
//sockets
// import { WrappedSocket } from './modules/sockets/socket-io.service';
//components
import { SchedulerFrontDeskComponent } from './scheduler-front-desk.component';
// //routing
import { SchedulerFrontDeskRoutingModule } from './scheduler-front-desk.routing.module';
import { SchedulerSupervisorService } from './scheduler-supervisor.service';

@NgModule({
	imports: [
		CommonModule,
		SchedulerFrontDeskRoutingModule,
		RouterModule,
		NgxDatatableModule,
		FdSharedModule,

		//headers
		// JasperoConfirmationsModule.forRoot(),
		// JasperoAlertsModule.forRoot(),
		TabsModule.forRoot(),
		// NgProgressModule.forRoot(),
		// NgProgressHttpModule,
		// NgProgressRouterModule,

		SharedModule,
		MatCheckboxModule,
		AppointmentModule,
		 SchedulingQueueModule,
		 DoctorCalendarModule,
		 ParticularPatientModule,
		 SchedulerCustomizeModule,
	],
	declarations: [
		 SchedulerFrontDeskComponent,
		   SharedDoctorCalendarComponent,
		 SharedAppointmentComponent,
		 SubNavComponent,
	],
	providers: [
		FrontDeskService,
		// WrappedSocket,
		 DoctorService,
		SchedulerSupervisorService,
		 AclRedirection,
		 AclService,
	],
})
export class SchedulerFrontDeskModule {}
