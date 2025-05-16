import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

 import { PatientCaseFlowRoutingModule } from './patient-case-flow-routing.module';
import { PersonalInformationFormComponent } from '@appDir/front-desk/caseflow-module/patient-case-flow/components/personal-information-form/personal-information-form.component';
import { ContactInfoFormComponent } from '@appDir/front-desk/caseflow-module/patient-case-flow/components/contact-info-form/contact-info-form.component';
 import { ContactPeopleFormComponent } from '@appDir/front-desk/caseflow-module/patient-case-flow/components/contact-people-form/contact-people-form.component';
import { BusyLoaderModule } from '@appDir/shared/busy-loader/busy-loader.module';
import { SharedModule } from '@appDir/shared/shared.module';
import { DynamicFormModule } from '@appDir/shared/dynamic-form/dynamic-form.module';
import { ReactiveFormsModule } from '@angular/forms';
 import { PersonalInformationEditComponent } from '@appDir/front-desk/caseflow-module/patient-case-flow/components/personal-information-edit/personal-information-edit.component';

@NgModule({
	declarations: [
		 PersonalInformationFormComponent,
		 ContactInfoFormComponent,
		 ContactPeopleFormComponent,
		 PersonalInformationEditComponent
	],
	imports: [
		CommonModule,
		PatientCaseFlowRoutingModule,
		SharedModule,
		BusyLoaderModule,
		DynamicFormModule,
		ReactiveFormsModule
	], exports: [
		 PersonalInformationFormComponent,
		 ContactInfoFormComponent,
		 ContactPeopleFormComponent,
	]
})
export class PatientCaseFlowModule { }
