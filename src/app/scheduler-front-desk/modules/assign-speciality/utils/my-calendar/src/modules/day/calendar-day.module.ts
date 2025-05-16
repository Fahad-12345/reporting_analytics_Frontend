import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResizableModule } from 'angular-resizable-element';
import { DragAndDropModule } from 'angular-draggable-droppable';
import { CalendarDayViewComponent } from './calendar-day-view.component';
import { CalendarDayViewHourSegmentComponent } from './calendar-day-view-hour-segment.component';
import { CalendarDayViewEventComponent } from './calendar-day-view-event.component';
import { CalendarCommonModule } from '../common/calendar-common.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
//services
import { CalendarDayService } from './calendar-day.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TimePickerModule } from '@syncfusion/ej2-angular-calendars';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { HttpClientModule } from '@angular/common/http';
import { SchedulerSupervisorService } from '../../../../../../../scheduler-supervisor.service';
export {
  CalendarDayViewComponent,
  CalendarDayViewBeforeRenderEvent
} from './calendar-day-view.component';

import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { AddAssignmentModalComponent } from '../../../../../modals/add-assignment-modal/add-assignment-modal.component';
import { UpdateAssignmentModalComponent } from '../../../../../modals/update-assignment-modal/update-assignment-modal.component';
import {AccordianComponent} from '../../../../../modals/accordian/accordian.component';
import { PopoverModule, PopoverConfig } from 'angular-bootstrap-md';
import { MatDatePickerSharedableComponent } from '@appDir/shared/mat-date-picker-sharedable/mat-date-picker-sharedable.component';

@NgModule({
  imports: [
    CommonModule,
    ResizableModule,
    DragAndDropModule,
    CalendarCommonModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    TimePickerModule,
    DatePickerModule,
  
    NgxDatatableModule,
    MatCheckboxModule,
    HttpClientModule,
	  PopoverModule.forRoot()

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
  providers:[
	  PopoverConfig,
    CalendarDayService,
	  SchedulerSupervisorService
  ],
  entryComponents: [
    // AddAssignmentModalComponent,
    // UpdateAssignmentModalComponent,
    AccordianComponent,
  ]
})
export class CalendarDayModule {}
