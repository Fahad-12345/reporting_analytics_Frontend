import { CommonModule } from '@angular/common';
import { NgModule, } from '@angular/core';
import {
	FormsModule,
	ReactiveFormsModule,
} from '@angular/forms';
// import { HttpModule } from '@angular//http';
import { RouterModule } from '@angular/router';

// import { DataTableModule } from "angular-6-datatable";
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
// import { MyDatePickerModule } from 'mydatepicker';
import { TabsModule } from 'ngx-bootstrap/tabs';
//scroll
// import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
//
// import { DragScrollModule } from 'ngx-drag-scroll';

import { MDService } from '@appDir/medical-doctor/services/md/medical-doctor.service';
import { BusyLoaderModule } from '@appDir/shared/busy-loader/busy-loader.module';
import { SharedModule } from '@appDir/shared/shared.module';
// import { JasperoAlertsModule } from '@jaspero/ng-alerts';
//for headers of main module
import {
	NgbModalModule,
	NgbModule,
} from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
// import { NgProgressModule } from '@ngx-progressbar/core';
// import { NgProgressHttpModule } from '@ngx-progressbar/http';
// import { NgProgressRouterModule } from '@ngx-progressbar/router';
//date time pickers
import {
	DatePickerModule,
	TimePickerModule,
} from '@syncfusion/ej2-angular-calendars';

import { CalendarHeaderComponent } from './component/calendar-header/calendar-header.component';
import {
	DoctorClinicListComponent,
} from './component/doctor-clinic-list/doctor-clinic-list.component';
//components
import { HomeComponent } from './component/home/home.component';
import { PatientDataComponent } from './component/patient-data/patient-data.component';
import { DoctorCalendarComponent } from './doctor-calendar.component';
//services
import { DoctorCalendarService } from './doctor-calendar.service';
import { NotesComponent } from './modals/add-notes/notes.component';
import {
	CreateAppointmentComponent,
} from './modals/create-appointment/create-appointment.component';
import { CreateNotesComponent } from './modals/create-notes/create-notes.component';
import { DeleteReasonComponent } from './modals/delete-reason/delete-reason.component';
import {
	UnavailabilityDeleteReasonComponent,
} from './modals/unavailability-delete-reason/unavailability-delete-reason.component';
import { UnavialabilityComponent } from './modals/unavialability/unavialability.component';
import {
	UpdateAppoitModalComponent,
} from './modals/update-appoit-modal/update-appoit-modal.component';
//calendar modules
import { DemoUtilsModule } from './utils/demo-utils/module';
import { adapterFactory } from './utils/my-calendar/src/date-adapters/date-fns';
import {
	CalendarModule,
	DateAdapter,
} from './utils/my-calendar/src/index';
import { SoftPatientModule } from '@appDir/front-desk/soft-patient/soft-patient.module';
import { SoftPatientVisitComponentModal } from './modals/soft-patient-visit-modal/soft-patient-visit-modal.component';
import { TransportationModalComponent } from './modals/transportation-modal/transportation-modal.component';
import { PatientHistoryComponent } from './modals/patient-history/patient-history.component';
import { ViewAppoitModalComponent } from './modals/view-appointment-modal/view-appoointment-modal.component';
import { AppointmentListComponent } from './modals/patient-history/components/today-appointment-listing-component/appointment-listing-component';
import { PatientHistoryComponentModal } from './modals/patient-history/components/patient-history-modal/patient-history-modal-component';

// import { UpdateAppoitModalComponent } from './modals/update-appoit-modal/update-appoit-modal.component';
@NgModule({
	imports: [
		CommonModule,
		BusyLoaderModule,
		// MyDatePickerModule,
		RouterModule,
		FormsModule,
		NgSelectModule,
		ReactiveFormsModule,
		AutocompleteLibModule,
		CalendarModule.forRoot({
			provide: DateAdapter,
			useFactory: adapterFactory,
		}),
		DemoUtilsModule,
		NgbModule,
		NgbModalModule,
		// HttpModule,
		DatePickerModule,
		TimePickerModule,
		// DragScrollModule,
		// JasperoAlertsModule.forRoot(),
		TabsModule.forRoot(),
		// NgProgressModule.forRoot(),
		// NgProgressHttpModule,
		// NgProgressRouterModule,
		SharedModule,
		SoftPatientModule
	],
	declarations: [
		DoctorCalendarComponent,
		HomeComponent,
		PatientDataComponent,
		CalendarHeaderComponent,
		DoctorClinicListComponent,
		UpdateAppoitModalComponent,
		NotesComponent,
		UnavialabilityComponent,
		CreateAppointmentComponent,
		DeleteReasonComponent,
		UnavailabilityDeleteReasonComponent,
		CreateNotesComponent,
		// TransportationModalComponent,
		PatientHistoryComponent,
		ViewAppoitModalComponent,
		AppointmentListComponent,
		PatientHistoryComponentModal
	],
	providers: [DoctorCalendarService, MDService],
	entryComponents: [
		UpdateAppoitModalComponent,
		NotesComponent,
		UnavialabilityComponent,
		CreateAppointmentComponent,
		DeleteReasonComponent,
		UnavailabilityDeleteReasonComponent,
		CreateNotesComponent,
		// TransportationModalComponent,
		ViewAppoitModalComponent,
		PatientHistoryComponentModal
	],
	exports: [
		HomeComponent,
	],
})
export class DoctorCalendarModule {}
