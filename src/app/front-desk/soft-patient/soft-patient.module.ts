import { DeleteReasonSoftRegistrationComponent } from './components/delete-reason-billing-component/delete-reason-billing-component.component';
import { CaseInfoFormComponent } from './components/case-info-component/case-info-component';
import { DynamicFormModule } from '@appDir/shared/dynamic-form/dynamic-form.module';
import { PatientSoftFormComponent } from './components/patient-form-component/patient-form.component';
import { PatientModule } from './../patient/patient.module';
import { SharedModule } from '@appDir/shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SoftPatientRoutingModule } from './soft-patient-routing.module';
import { SoftPatientVisitComponent } from './components/soft-patient-visit/soft-patient-visit.component';
import {MatStepperModule} from '@angular/material/stepper';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { SoftPatinetComponent } from './components/soft-patinet/soft-patinet.component';
import { SoftPatientCreateAppointmentComponent } from './components/soft-patient-create-appointment/soft-patient-create-appointment.component';
import { MatDatePickerSharedableComponent } from '@appDir/shared/mat-date-picker-sharedable/mat-date-picker-sharedable.component';
import { TimePickerModule } from '@syncfusion/ej2-angular-calendars';
import { HealthInsuranceFormComponent } from './components/health-insurance-form/soft-patient-health-insurance-form.component';
import { SoftPatientProfileComponent } from './components/soft-patient-profile/soft-patient-profile.component';
import { SoftPatientProfileModalComponent } from './components/soft-patient-profile-modal/soft-patient-profile-modal.component';
import { SoftPatientVisitComponentModal } from '@appDir/shared/modules/doctor-calendar/modals/soft-patient-visit-modal/soft-patient-visit-modal.component';
import { CaseListModule } from '../cases/case-list/case-list.module';
@NgModule({
  declarations: [
	DeleteReasonSoftRegistrationComponent,SoftPatientCreateAppointmentComponent,
	CaseInfoFormComponent,PatientSoftFormComponent,SoftPatientVisitComponent, SoftPatinetComponent,
	HealthInsuranceFormComponent,
	SoftPatientProfileComponent,
	SoftPatientProfileModalComponent,
	SoftPatientVisitComponentModal
],
  imports: [
    CommonModule,
	MatStepperModule,
	FormsModule,
	ReactiveFormsModule,
    SoftPatientRoutingModule,
	 CaseListModule,
	DynamicFormModule,
	// PatientModule
	 TimePickerModule,
	SharedModule
  ],
  exports:[
	MatStepperModule,
	// FormsModule,
	// ReactiveFormsModule,
    SoftPatientRoutingModule,
	 CaseListModule,
	DynamicFormModule,
	// PatientModule
	 TimePickerModule,
	SoftPatientVisitComponent
  ],

  entryComponents:[DeleteReasonSoftRegistrationComponent,SoftPatientProfileModalComponent, SoftPatientVisitComponentModal]
})
export class SoftPatientModule { }
