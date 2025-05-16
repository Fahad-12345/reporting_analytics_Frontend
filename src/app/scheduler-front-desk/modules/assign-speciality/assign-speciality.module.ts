import { SharedModule } from '@shared/shared.module';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import {
	FormsModule,
	ReactiveFormsModule,
} from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';

import {
	PopoverConfig,
	PopoverModule,
} from 'angular-bootstrap-md';
//date time pickers
//drag scroll
import { DragScrollModule } from 'ngx-drag-scroll';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
//date time pickers
import {
	DatePickerModule,
	TimePickerModule,
} from '@syncfusion/ej2-angular-calendars';

//components
import { AssignSpecialityComponent } from './assign-speciality.component';
//routing
import {
	AssignSpecialityCalendarHeaderComponent,
} from './components/calendar-header/calendar-header.component';
//services
import { DeletingIdsService } from './components/datatable/deleting-ids.service';
import { HomeComponent } from './components/home/home.component';
import { MiniCalendarComponent } from './components/mini-calendar/mini-calendar.component';
import {
	SpecialityClinicListComponent,
} from './components/speciality-clinic-list/speciality-clinic-list.component';
//calendar modules
import { DemoUtilsModule } from './utils/demo-utils/module';
import { adapterFactory } from './utils/my-calendar/src/date-adapters/date-fns';
import {
	CalendarModule,
	DateAdapter,
} from './utils/my-calendar/src/index';

import { SideNavModule } from '@appDir/shared/components/side-nav/side-nav/side-nav.module';
import { ReplaceAccordianComponent } from './modals/replace-accordian/replace-accordian.component';
import { AddAssignmentModalComponent } from './modals/add-assignment-modal/add-assignment-modal.component';
import { UpdateAssignmentModalComponent } from './modals/update-assignment-modal/update-assignment-modal.component';
import { AssignSpecialitiyRouting } from './assign-speciality.routing';
@NgModule({
	imports: [
		CommonModule,
		AssignSpecialitiyRouting,
		// HttpModule,
		SharedModule,
		HttpClientModule,
		FormsModule,
		NgbModule,
		TimePickerModule,
		ReactiveFormsModule,
		// MyDatePickerModule,
		DemoUtilsModule,
		DatePickerModule,
		NgxDatatableModule,
		MatCheckboxModule,
		SideNavModule,
		CalendarModule.forRoot({
			provide: DateAdapter,
			useFactory: adapterFactory,
		}),
		PopoverModule.forRoot(),
		DragScrollModule,
	],
	declarations: [
		AssignSpecialityComponent,
		HomeComponent,
		SpecialityClinicListComponent,
		AssignSpecialityCalendarHeaderComponent,
		MiniCalendarComponent,
		ReplaceAccordianComponent,
		AddAssignmentModalComponent,
		UpdateAssignmentModalComponent,
	],
	entryComponents: [ReplaceAccordianComponent,
		AddAssignmentModalComponent,
		UpdateAssignmentModalComponent,],
	providers: [PopoverConfig, DeletingIdsService, HomeComponent],
	exports: [HomeComponent, AssignSpecialityCalendarHeaderComponent],
})
export class AssignSpecialityModule {}
