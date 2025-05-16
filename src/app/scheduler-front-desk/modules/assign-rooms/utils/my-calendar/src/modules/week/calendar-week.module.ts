import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResizableModule } from 'angular-resizable-element';
import { DragAndDropModule } from 'angular-draggable-droppable';
import { CalendarWeekViewComponent } from './calendar-week-view.component';
import { CalendarWeekViewHeaderComponent } from './calendar-week-view-header.component';
import { CalendarWeekViewEventComponent } from './calendar-week-view-event.component';
import { CalendarCommonModule } from '../common/calendar-common.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PopoverModule, PopoverConfig } from 'angular-bootstrap-md';
import { CalendarWeekService } from './calendar-week.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragScrollModule } from 'ngx-drag-scroll';

export {
  CalendarWeekViewComponent,
  CalendarWeekViewBeforeRenderEvent
} from './calendar-week-view.component';
export {
  WeekViewAllDayEvent as CalendarWeekViewAllDayEvent,
  WeekViewAllDayEventRow as CalendarWeekViewAllDayEventRow,
  GetWeekViewArgs as CalendarGetWeekViewArgs
} from 'calendar-utils';
export { getWeekViewPeriod } from '../common/util';
// import {DataTableModule} from "angular-6-datatable";
import { DatePickerModule, TimePickerModule } from '@syncfusion/ej2-angular-calendars';

@NgModule({
  imports: [
    CommonModule,
    ResizableModule,
    DragAndDropModule,
    CalendarCommonModule,
    NgbModule,
    DatePickerModule,
    TimePickerModule,
    PopoverModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    // DataTableModule,
    DragScrollModule
  ],
  declarations: [
    CalendarWeekViewComponent,
    CalendarWeekViewHeaderComponent,
    CalendarWeekViewEventComponent,
  ],
  exports: [
    ResizableModule,
    DragAndDropModule,
    CalendarWeekViewComponent,
    CalendarWeekViewHeaderComponent,
    CalendarWeekViewEventComponent,
  ],
  providers: [
    PopoverConfig,
    CalendarWeekService,
  ]
})
export class CalendarWeekModule { }
