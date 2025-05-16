import { SharedModule } from './../../../../../../../shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragAndDropModule } from 'angular-draggable-droppable';
import { CalendarMonthViewComponent } from './calendar-month-view.component';
import { CalendarMonthViewHeaderComponent } from './calendar-month-view-header.component';
import { CalendarMonthCellComponent } from './calendar-month-cell.component';
import { CalendarOpenDayEventsComponent } from './calendar-open-day-events.component';
import { CalendarCommonModule } from '../common/calendar-common.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PopoverModule, PopoverConfig } from 'angular-bootstrap-md';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { DataTableModule } from "angular-6-datatable";
import { UnavialabilityComponent } from './unavialability/unavialability.component';
export {
  CalendarMonthViewComponent,
  CalendarMonthViewBeforeRenderEvent,
  CalendarMonthViewEventTimesChangedEvent
} from './calendar-month-view.component';
export { MonthViewDay as CalendarMonthViewDay } from 'calendar-utils';
export { collapseAnimation } from './calendar-open-day-events.component';

import { NgxDatatableModule } from '@swimlane/ngx-datatable';
//for modal
import { AddAppointmentModalComponent } from './appointments/appointments-modal.component';
import { OpenAddModalComponent } from './open-add-modal/open-add-modal.component';


import { TimePickerModule } from '@syncfusion/ej2-angular-calendars';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { HttpClientModule } from '@angular/common/http';
import { CalendarMonthService } from './calendar-month.service';
import { RouterModule } from '@angular/router';
import { ShowModalComponent } from './show-modal/show-modal.component';

@NgModule({
  imports: [
    CommonModule,
    // DataTableModule,
    NgxDatatableModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    DragAndDropModule,
    CalendarCommonModule,
    TimePickerModule,
    DatePickerModule,
    HttpClientModule,
    NgbModule,
    PopoverModule.forRoot(),
	SharedModule
  ],
  declarations: [
    CalendarMonthViewComponent,
    UnavialabilityComponent,
    CalendarMonthCellComponent,
    CalendarOpenDayEventsComponent,
    CalendarMonthViewHeaderComponent,
    // AddAppointmentModalComponent,
    OpenAddModalComponent,
    ShowModalComponent

  ],
  exports: [
    DragAndDropModule,
    CalendarMonthViewComponent,
    CalendarMonthCellComponent,
    CalendarOpenDayEventsComponent,
    CalendarMonthViewHeaderComponent
  ],
  entryComponents: [
    // AddAppointmentModalComponent,
    UnavialabilityComponent,
    ShowModalComponent
  ],
  providers: [
    PopoverConfig,
    CalendarMonthService,
    CalendarMonthCellComponent,
    OpenAddModalComponent
  ]
})
export class CalendarMonthModule { }
