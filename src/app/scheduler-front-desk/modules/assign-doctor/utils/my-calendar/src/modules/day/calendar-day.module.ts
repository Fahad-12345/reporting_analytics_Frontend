import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResizableModule } from 'angular-resizable-element';
import { DragAndDropModule } from 'angular-draggable-droppable';
import { CalendarDayViewComponent } from './calendar-day-view.component';
import { CalendarDayViewHourSegmentComponent } from './calendar-day-view-hour-segment.component';
import { CalendarDayViewEventComponent } from './calendar-day-view-event.component';
import { CalendarCommonModule } from '../common/calendar-common.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
//modals
// import { DataTableModule } from "angular-6-datatable";
import { AddDocAssignmentModalComponent } from '../../../../../modals/add-doc-assignment-modal/add-doc-assignment-modal.component';
import { UpdateDocAssignmentModalComponent } from '../../../../../modals/update-doc-assignment-modal/update-doc-assignment-modal.component';
import { AccordianComponent } from '../../../../../modals/accordian/accordian.component';
//services
import { CalendarDayService } from './calendar-day.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { TimePickerModule } from '@syncfusion/ej2-angular-calendars';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { HttpClientModule } from '@angular/common/http';
import { SchedulerSupervisorService } from '../../../../../../../scheduler-supervisor.service';
import { DeletingIdsService } from '../../../../../modals/accordian/deleting-ids.service';
export {
  CalendarDayViewComponent,
  CalendarDayViewBeforeRenderEvent
} from './calendar-day-view.component';

@NgModule({
  imports: [
    CommonModule,
    // DataTableModule,
    ResizableModule,
    DragAndDropModule,
    CalendarCommonModule,
    NgbModule,
    FormsModule,
    NgxDatatableModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    TimePickerModule,
    DatePickerModule,
    HttpClientModule,
  ],
  declarations: [
    CalendarDayViewComponent,
    CalendarDayViewHourSegmentComponent,
    CalendarDayViewEventComponent,

  ],
  exports: [
    ResizableModule,
    DragAndDropModule,
    CalendarDayViewComponent,
    CalendarDayViewHourSegmentComponent,
    CalendarDayViewEventComponent
  ],
  providers: [
    CalendarDayService,
    SchedulerSupervisorService,
    DeletingIdsService
  ],
  entryComponents: [
    // AddDocAssignmentModalComponent,
    AccordianComponent,
    // UpdateDocAssignmentModalComponent,
  ]
})
export class CalendarDayModule { }
