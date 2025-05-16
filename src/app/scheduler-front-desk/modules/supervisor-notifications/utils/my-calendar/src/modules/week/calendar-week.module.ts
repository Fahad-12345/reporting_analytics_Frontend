import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResizableModule } from 'angular-resizable-element';
import { DragAndDropModule } from 'angular-draggable-droppable';
import { CalendarWeekViewComponent } from './calendar-week-view.component';
import { CalendarCommonModule } from '../common/calendar-common.module';
import { CalendarWeekViewHourSegmentComponent } from './calendar-week-view-hour-segment.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PopoverModule, PopoverConfig } from 'angular-bootstrap-md';
import { CalendarWeekService } from './calendar-week.service';
import { AccordianComponent } from '../../../../../modals/accordian/accordian.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatatableComponent } from '../../../../../modals/datatable/datatable.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DeletingIdsService } from '../../../../../modals/datatable/deleting-ids.service';
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

@NgModule({
  imports: [
    CommonModule,
    ResizableModule,
    DragAndDropModule,
    CalendarCommonModule,
    NgbModule,
    PopoverModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    // DataTableModule,
    MatCheckboxModule
  ],
  declarations: [
    CalendarWeekViewComponent,
    CalendarWeekViewHourSegmentComponent,
    AccordianComponent,
    DatatableComponent

  ],
  exports: [
    ResizableModule,
    DragAndDropModule,
    CalendarWeekViewComponent,
    CalendarWeekViewHourSegmentComponent
  ],
  entryComponents: [
    AccordianComponent,
  ],
  providers: [
    PopoverConfig,
    CalendarWeekService,
    DeletingIdsService,
    DatatableComponent
  ]
})
export class CalendarWeekModule { }
