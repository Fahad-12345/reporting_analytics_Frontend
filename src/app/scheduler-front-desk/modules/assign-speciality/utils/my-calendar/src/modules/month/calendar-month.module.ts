import { SharedModule } from '@shared/shared.module';
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
import { AddAssignmentModalComponent } from '../../../../../modals/add-assignment-modal/add-assignment-modal.component';
import { UpdateAssignmentModalComponent } from '../../../../../modals/update-assignment-modal/update-assignment-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccordianComponent } from '../../../../../modals/accordian/accordian.component';
// import {DataTableModule} from "angular-6-datatable";
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatCheckboxModule } from '@angular/material/checkbox';
export {
  CalendarMonthViewComponent,
  CalendarMonthViewBeforeRenderEvent,
  CalendarMonthViewEventTimesChangedEvent
} from './calendar-month-view.component';
export { MonthViewDay as CalendarMonthViewDay } from 'calendar-utils';
export { collapseAnimation } from './calendar-open-day-events.component';


//for modal
import { TimePickerModule } from '@syncfusion/ej2-angular-calendars';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { HttpClientModule } from '@angular/common/http';
import { CalendarMonthService } from './calendar-month.service';
import { MatDatePickerSharedableComponent } from '@appDir/shared/mat-date-picker-sharedable/mat-date-picker-sharedable.component';

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
    NgxDatatableModule,
    MatCheckboxModule,
    PopoverModule.forRoot(),
	
  ],
  declarations: [
    AccordianComponent,
    CalendarMonthViewComponent,
    CalendarMonthCellComponent,
    CalendarOpenDayEventsComponent,
    CalendarMonthViewHeaderComponent,
    // AddAssignmentModalComponent,
    // UpdateAssignmentModalComponent,
	
  ],
  exports: [
    DragAndDropModule,
    CalendarMonthViewComponent,
    CalendarMonthCellComponent,
    CalendarOpenDayEventsComponent,
    CalendarMonthViewHeaderComponent
  ],
  entryComponents: [
    // AddAssignmentModalComponent,
    // UpdateAssignmentModalComponent,
    AccordianComponent,
  ],
  providers: [
    PopoverConfig,
    CalendarMonthService,
    CalendarMonthCellComponent,
  ]
})
export class CalendarMonthModule { }
