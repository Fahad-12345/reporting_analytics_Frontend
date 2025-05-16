import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap'; //for hover


//modules
// import { HeaderModule } from '../header/header.module';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { PopoverModule, PopoverConfig } from 'angular-bootstrap-md';
import { DatePickerModule, TimePickerModule } from '@syncfusion/ej2-angular-calendars';
import { DatePipe } from '@angular/common';

//routing
import { SchedulerAssignDoctorRouteModule} from './assign-doctor.routing';

//calendar
import { CalendarModule, DateAdapter } from './utils/my-calendar/src';
import { adapterFactory } from './utils/my-calendar/src/date-adapters/date-fns';
import { DemoUtilsModule } from './utils/demo-utils/module';

//components
import { AssignDoctorComponent } from './assign-doctor.component';
import { HomeComponent } from './components/home/home.component';
import { DoctorClinicListComponent } from './components/doctor-clinic-list/doctor-clinic-list.component';
import { AssignDoctorCalendarHeaderComponent } from './components/calendar-header/calendar-header.component';
//drag scroll
import { DragScrollModule } from 'ngx-drag-scroll';
import { AutomateModalComponent } from './modals/automate-modal/automate-modal.component';
//subject service
import { AssignDoctorSubjectService } from './assign-doctor-subject.service';
import { AssignDoctorService } from './assign-doctor.service';
import { SideNavModule } from '@appDir/shared/components/side-nav/side-nav/side-nav.module';
import { AddDocAssignmentModalComponent } from './modals/add-doc-assignment-modal/add-doc-assignment-modal.component';
import { UpdateDocAssignmentModalComponent } from './modals/update-doc-assignment-modal/update-doc-assignment-modal.component';
import { SharedModule } from '@appDir/shared/shared.module';

@NgModule({
  imports: [
    DemoUtilsModule,
    CommonModule,
    SchedulerAssignDoctorRouteModule,
    HttpClientModule,
    FormsModule,
    NgbModule,
    TimePickerModule,
    ReactiveFormsModule,
    DemoUtilsModule,
	DatePickerModule,
	SideNavModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    PopoverModule.forRoot(),
    DragScrollModule,
	SharedModule
  ],
  providers: [
    DatePipe,
    AssignDoctorService,
    AssignDoctorSubjectService
  ],
  declarations: [
    AssignDoctorComponent,
    HomeComponent,
    AssignDoctorCalendarHeaderComponent,
    DoctorClinicListComponent,
    AutomateModalComponent,
	AddDocAssignmentModalComponent,
    UpdateDocAssignmentModalComponent,
  ],
  entryComponents: [
    AutomateModalComponent,
	AddDocAssignmentModalComponent,
    UpdateDocAssignmentModalComponent,
  ],
  exports: [
  ]
})
export class AssignDoctorModule { }
