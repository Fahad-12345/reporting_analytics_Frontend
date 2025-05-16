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
// import {DataTableModule} from "angular-6-datatable";

export {
  CalendarMonthViewComponent,
  CalendarMonthViewBeforeRenderEvent,
  CalendarMonthViewEventTimesChangedEvent
} from './calendar-month-view.component';
export { MonthViewDay as CalendarMonthViewDay } from 'calendar-utils';
export { collapseAnimation } from './calendar-open-day-events.component';

import { TimePickerModule } from '@syncfusion/ej2-angular-calendars';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { HttpClientModule } from '@angular/common/http';
import { CalendarMonthService } from './calendar-month.service';

@NgModule({
  imports: [
    CommonModule,
    // DataTableModule,
    FormsModule,
    ReactiveFormsModule,
    DragAndDropModule,
    CalendarCommonModule,
    TimePickerModule,
    DatePickerModule,
    HttpClientModule,
    NgbModule,
    // MDBBootstrapModule.forRoot(),
    PopoverModule.forRoot()
  ],
  declarations: [
    CalendarMonthViewComponent,
    CalendarMonthCellComponent,
    CalendarOpenDayEventsComponent,
    CalendarMonthViewHeaderComponent,

  ],
  exports: [
    DragAndDropModule,
    CalendarMonthViewComponent,
    CalendarMonthCellComponent,
    CalendarOpenDayEventsComponent,
    CalendarMonthViewHeaderComponent
  ],

  providers: [
    PopoverConfig,
    CalendarMonthService,
    CalendarMonthCellComponent,
  ]
})
export class CalendarMonthModule { }
