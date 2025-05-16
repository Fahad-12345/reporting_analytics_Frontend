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
import { AccordianComponent } from '../../../../../modals/accordian/accordian.component';
// import { DataTableModule } from "angular-6-datatable";
export {
  CalendarMonthViewComponent,
  CalendarMonthViewBeforeRenderEvent,
  CalendarMonthViewEventTimesChangedEvent
} from './calendar-month-view.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatCheckboxModule } from '@angular/material/checkbox';
export { MonthViewDay as CalendarMonthViewDay } from 'calendar-utils';
export { collapseAnimation } from './calendar-open-day-events.component';
import { DeletingIdsService } from '../../../../../modals/accordian/deleting-ids.service';
import { SchedulerSupervisorService } from '../../../../../../../scheduler-supervisor.service';
//for modal
import { TimePickerModule } from '@syncfusion/ej2-angular-calendars';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { HttpClientModule } from '@angular/common/http';
import { CalendarMonthService } from './calendar-month.service';
import { AddDocAssignmentModalComponent } from '../../../../../modals/add-doc-assignment-modal/add-doc-assignment-modal.component';
import { UpdateDocAssignmentModalComponent } from '../../../../../modals/update-doc-assignment-modal/update-doc-assignment-modal.component';

@NgModule({
  imports: [
    CommonModule,
    // DataTableModule,
    FormsModule,
    ReactiveFormsModule,
    DragAndDropModule,
    NgxDatatableModule,
    MatCheckboxModule,
    CalendarCommonModule,
    TimePickerModule,
    DatePickerModule,
    HttpClientModule,
    NgbModule,
    PopoverModule.forRoot()
  ],
  declarations: [
    AccordianComponent,
    // AddDocAssignmentModalComponent,
    CalendarMonthViewComponent,
    CalendarMonthCellComponent,
    CalendarOpenDayEventsComponent,
    CalendarMonthViewHeaderComponent,
    // UpdateDocAssignmentModalComponent
  ],
  exports: [
    DragAndDropModule,
    CalendarMonthViewComponent,
    CalendarMonthCellComponent,
    CalendarOpenDayEventsComponent,
    CalendarMonthViewHeaderComponent
  ],
  entryComponents: [
    // AddDocAssignmentModalComponent,
    AccordianComponent,
    // UpdateDocAssignmentModalComponent,
  ],
  providers: [
    PopoverConfig,
    CalendarMonthService,
    DeletingIdsService,
    SchedulerSupervisorService
  ]
})
export class CalendarMonthModule { }
