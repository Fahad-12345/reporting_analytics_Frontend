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
import { PopoverModule, PopoverConfig } from 'angular-bootstrap-md';

//modals
import { AccordianComponent } from '../../../../../modals/accordian/accordian.component'
import { UpdateDocAssignmentModalComponent } from '../../../../../modals/update-doc-assignment-modal/update-doc-assignment-modal.component'
//services
import { CalendarWeekService } from './calendar-week.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TimePickerModule } from '@syncfusion/ej2-angular-calendars';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { HttpClientModule } from '@angular/common/http';
// import { DataTableModule } from "angular-6-datatable";
import { DeletingIdsService } from '../../../../../modals/accordian/deleting-ids.service';
import { SchedulerSupervisorService } from '../../../../../../../scheduler-supervisor.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AddDocAssignmentModalComponent } from '../../../../../modals/add-doc-assignment-modal/add-doc-assignment-modal.component';
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

@NgModule({
  imports: [
    CommonModule,
    ResizableModule,
    DragAndDropModule,
    CalendarCommonModule,
    NgxDatatableModule,
    NgbModule,
    // DataTableModule,
    MatCheckboxModule,
    PopoverModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    TimePickerModule,
    DatePickerModule,
    HttpClientModule
  ],
  declarations: [
    CalendarWeekViewComponent,
    CalendarWeekViewHeaderComponent,
    CalendarWeekViewEventComponent,
    CalendarWeekViewHourSegmentComponent,

  ],
  exports: [
    ResizableModule,

    DragAndDropModule,
    CalendarWeekViewComponent,
    CalendarWeekViewHeaderComponent,
    CalendarWeekViewEventComponent,
    CalendarWeekViewHourSegmentComponent
  ],
  entryComponents: [
    // AddDocAssignmentModalComponent,
    AccordianComponent,
    // UpdateDocAssignmentModalComponent,
  ],
  providers: [
    PopoverConfig,
    CalendarWeekService,
    HttpClientModule,
    DeletingIdsService,
    SchedulerSupervisorService,
  ]
})
export class CalendarWeekModule { }
