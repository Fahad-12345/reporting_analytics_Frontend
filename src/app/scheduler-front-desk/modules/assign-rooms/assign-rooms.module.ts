import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

//shared modules
// import { HeaderModule } from '../header/header.module';

//routing


//components
import { HomeComponent } from './component/home/home.component';
import { DeleteRoomAssignModalComponent1 } from './modals/delete-room-assign-modal/delete-room-assign-modal.component';
import { AddRoomAssigModalComponent } from './modals/add-room-assig-modal/add-room-assig-modal.component'
import { AssignRoomsComponent } from './assign-rooms.component';
import { DoctorRoomListComponent } from './component/doctor-room-list/doctor-room-list.component';
import { FrontDeskCalendarHeaderComponent } from './component/calendar-header/calendar-header.component';

//date pickers
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { TimePickerModule } from '@syncfusion/ej2-angular-calendars';
import { DemoUtilsModule } from './utils/demo-utils/module';
import { CalendarModule, DateAdapter } from './utils/my-calendar/src/index';
import { adapterFactory } from './utils/my-calendar/src/date-adapters/date-fns';

// import { DataTableModule } from "angular-6-datatable";
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatCheckboxModule } from '@angular/material/checkbox';
//services
import { AssignRoomsService } from './assign-rooms.service';

//drag scroll
import { DragScrollModule } from 'ngx-drag-scroll';
import { AssignRoomRouting } from './assign-rooms.routing';
@NgModule({
  imports: [
    CommonModule,
    AssignRoomRouting,
    // HeaderModule,
    NgxDatatableModule,
    MatCheckboxModule,
    NgbModule,
    // DataTableModule,
    FormsModule,
    ReactiveFormsModule,
    DatePickerModule,
    TimePickerModule,


    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    DemoUtilsModule,
    DragScrollModule
  ],
  declarations: [
    AssignRoomsComponent,
    HomeComponent,
    DeleteRoomAssignModalComponent1,
    AddRoomAssigModalComponent,
    DoctorRoomListComponent,
    FrontDeskCalendarHeaderComponent
  ],
  entryComponents: [
    DeleteRoomAssignModalComponent1,
    AddRoomAssigModalComponent
  ],
  providers: [
    AssignRoomsService
  ]
})
export class AssignRoomsModule { }
