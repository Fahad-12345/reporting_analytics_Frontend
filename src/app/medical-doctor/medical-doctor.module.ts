import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MedicalDoctorRoutingModule } from './medical-doctor-routing.module';
import { SchedulerComponent } from './scheduler/scheduler.component';
import { MedicalDoctorComponent } from './medical-doctor.component';
// import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { TabsModule } from 'ngx-bootstrap/tabs';
// import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';

import { InitialEvaluationComponent } from './initial-evaluation/initial-evaluation.component';
import { CurrentComplaintsComponent } from './current-complaints/current-complaints.component';
import { PastMedicalHsitoryComponent } from './past-medical-hsitory/past-medical-hsitory.component';
import { PhysicalExaminationComponent } from './physical-examination/physical-examination.component';
import { DiagnosticImpressionComponent } from './diagnostic-impression/diagnostic-impression.component';
import { PlanOfCareComponent } from './plan-of-care/plan-of-care.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MDService } from './services/md/medical-doctor.service';
import { SharedModule } from '@shared/shared.module';
import { CurrentComplaintsContComponent } from './current-complaints-cont/current-complaints-cont.component';
import { PhysicalExaminationContComponent } from './physical-examination-cont/physical-examination-cont.component';
import { PlanOfCareContComponent } from './plan-of-care-cont/plan-of-care-cont.component';
// import { PhysicalOccupactionalChiropractorComponent } from './referals/physical-occupactional-chiropractor/physical-occupactional-chiropractor.component';
// import { RangeOfMotionComponent } from './referals/range-of-motion/range-of-motion.component';
import { TreatmentRenderedComponent } from './treatment-rendered/treatment-rendered.component';
// import { PhysicalOccupactionalChiropractorComponent } from './referal-forms/physical-occupactional-chiropractor/physical-occupactional-chiropractor.component';
// import { RangeOfMotionComponent } from './referal-forms/range-of-motion/range-of-motion.component';
// import { SpecialtyConsultationRequestComponent } from './referal-forms/specialty-consultation-request/specialty-consultation-request.component';
// import { SpecialtyConsultationRequestComponent } from './referals/specialty-consultation-request/specialty-consultation-request.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MdSharedModule } from './md-shared/md-shared.module';
// import { TypeaheadModule } from 'ngx-bootstrap/typeahead';

import { DoctorCalendarModule } from '@shared/modules/doctor-calendar/doctor-calendar.module';
import { AclRedirection } from '../shared/services/acl-redirection.service';
import { AclService } from '../shared/services/acl.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { BusyLoaderModule } from '@appDir/shared/busy-loader/busy-loader.module';
import { TestResultsComponent } from './test-results/test-results.component';
import { TestResultsModule } from './test-results/test-results.module';
import { SignatureModule } from '@appDir/shared/signature/signature.module';
// import { AclService } from '@appDir/front-desk/acl.service';

@NgModule({
	imports: [
		CommonModule,
		NgxMaskDirective, NgxMaskPipe,
		FormsModule,
		ReactiveFormsModule,
		MedicalDoctorRoutingModule,
		SharedModule,
		DoctorCalendarModule,
		MdSharedModule,
		TestResultsModule,
		// CalendarModule.forRoot({
		// 	provide: DateAdapter,
		// 	useFactory: adapterFactory,
		// }),
		// NgbModule,
		// NgxMaskModule.forRoot(),
		NgxDatatableModule,
		// JasperoConfirmationsModule.forRoot(),
		// JasperoAlertsModule.forRoot(),
		TabsModule,
		// TypeaheadModule.forRoot()
		MatCheckboxModule,
		BusyLoaderModule,
		SignatureModule
	],
	declarations: [
		MedicalDoctorComponent,
		SchedulerComponent,
		InitialEvaluationComponent,
		CurrentComplaintsComponent,
		PastMedicalHsitoryComponent,
		PhysicalExaminationComponent,
		DiagnosticImpressionComponent,
		PlanOfCareComponent,
		DashboardComponent,
		CurrentComplaintsContComponent,
		PhysicalExaminationContComponent,
		PlanOfCareContComponent,
		TreatmentRenderedComponent,
		// TestResultsComponent
		// PhysicalOccupactionalChiropractorComponent,
		// RangeOfMotionComponent,
		// SpecialtyConsultationRequestComponent
	],
	providers: [
		MDService,
		AclRedirection,
		provideNgxMask(),
		AclService,
		// AclService
	],
	// declarations: [
	//   MedicalDoctorComponent,
	//   SchedulerComponent,
	//   InitialEvaluationComponent,
	//   CurrentComplaintsComponent,
	//   PastMedicalHsitoryComponent,
	//   PhysicalExaminationComponent,
	//   DiagnosticImpressionComponent,

	// ]
})
export class MedicalDoctorModule { }
