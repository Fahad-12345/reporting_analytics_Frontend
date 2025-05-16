import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PopoverModule, PopoverConfig } from 'angular-bootstrap-md';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DatePickerModule, TimePickerModule } from '@syncfusion/ej2-angular-calendars';

//routing
import { SchedulerWaitingListRoutingModule } from './waiting-list.routing';

//calendar modules
import { DemoUtilsModule } from './utils/demo-utils/module';
import { CalendarModule, DateAdapter } from './utils/my-calendar/src/index';
import { adapterFactory } from './utils/my-calendar/src/date-adapters/date-fns';
import { DatePipe } from '@angular/common';

//components
import { WaitingListComponent } from './waiting-list.component';
import { HomeComponent } from './components/home/home.component';

@NgModule({
  imports: [
    CommonModule,
    SchedulerWaitingListRoutingModule,
    DemoUtilsModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),

    DatePickerModule,
    TimePickerModule,
    FormsModule,
    NgbModule,
    ReactiveFormsModule,
    PopoverModule.forRoot(),
    NgbModule,
  ],
  declarations: [
    WaitingListComponent,
    HomeComponent,
    // TimeAgoPipe
  ],
  entryComponents: [
  ],
  providers: [
    PopoverConfig,
    HomeComponent,
    DatePipe,
  ]
})
export class WaitingListDocModule { }
