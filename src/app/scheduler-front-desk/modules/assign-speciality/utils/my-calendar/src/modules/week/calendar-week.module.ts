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

//modals
import {AccordianComponent} from '../../../../../modals/accordian/accordian.component';
//services
import {CalendarWeekService} from './calendar-week.service';
import { AssignSpecialityService } from '../../../../../assign-speciality.service';
import {FormsModule,ReactiveFormsModule} from '@angular/forms';

import { TimePickerModule } from '@syncfusion/ej2-angular-calendars';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { HttpClientModule } from '@angular/common/http';

// import { OpenDeleteModalComponent } from './open-delete-modal/open-delete-modal.component';
import { AddAssignmentModalComponent } from '../../../../../modals/add-assignment-modal/add-assignment-modal.component';
import { UpdateAssignmentModalComponent } from '../../../../../modals/update-assignment-modal/update-assignment-modal.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import {MatCheckboxModule} from '@angular/material/checkbox';
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
    NgbModule,
    // MDBBootstrapModule.forRoot(),
    PopoverModule.forRoot(),
    NgxDatatableModule,
    MatCheckboxModule,
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

    // OpenDeleteModalComponent
  ],
  exports: [
    ResizableModule,
    DragAndDropModule,
    CalendarWeekViewComponent,
    CalendarWeekViewHeaderComponent,
    CalendarWeekViewEventComponent,
    CalendarWeekViewHourSegmentComponent,

  ],
  entryComponents: [
    // AddAssignmentModalComponent,
    // UpdateAssignmentModalComponent,
    AccordianComponent,
    
  ],
  providers: [
    PopoverConfig,
    AssignSpecialityService,
    CalendarWeekService
  ]
})
export class CalendarWeekModule {}
