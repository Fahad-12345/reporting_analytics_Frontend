import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResizableModule } from 'angular-resizable-element';
import { DragAndDropModule } from 'angular-draggable-droppable';
import { CalendarWeekViewComponent } from './calendar-week-view.component';
import { CalendarWeekViewHeaderComponent } from './calendar-week-view-header.component';
import { CalendarWeekViewEventComponent } from './calendar-week-view-event.component';
import { CalendarCommonModule } from '../common/calendar-common.module';
import { CalendarWeekViewHourSegmentComponent } from './calendar-week-view-hour-segment.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { PopoverModule, PopoverConfig } from 'angular-bootstrap-md';
import { CalendarWeekService } from './calendar-week.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';

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
// import { DataTableModule } from "angular-6-datatable";
import { DatePickerModule, TimePickerModule } from '@syncfusion/ej2-angular-calendars';
import { DragScrollModule } from 'ngx-drag-scroll';

@NgModule({
  imports: [
    CommonModule,
    ResizableModule,
    DragAndDropModule,
    CalendarCommonModule,
    DragScrollModule,
    NgbModule,
    DatePickerModule,
    TimePickerModule,
    PopoverModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    // DataTableModule,
    ScrollToModule.forRoot()
  ],
  declarations: [
    CalendarWeekViewComponent,
    CalendarWeekViewHeaderComponent,
    CalendarWeekViewEventComponent,
    CalendarWeekViewHourSegmentComponent
  ],
  exports: [
    ResizableModule,
    DragAndDropModule,
    CalendarWeekViewComponent,
    CalendarWeekViewHeaderComponent,
    CalendarWeekViewEventComponent,
    CalendarWeekViewHourSegmentComponent
  ],
  providers: [
    PopoverConfig,
    CalendarWeekService,
  ]
})
export class CalendarDayNewModule { }
