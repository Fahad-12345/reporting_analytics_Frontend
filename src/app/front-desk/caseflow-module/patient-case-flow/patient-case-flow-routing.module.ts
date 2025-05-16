import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CanDeactivateFormsComponentService } from '@appDir/shared/canDeactivateFormsComponent/can-deactivate-forms-component.service';
import { USERPERMISSIONS } from '@appDir/front-desk/UserPermissions';
import { ContactInfoFormComponent } from '@appDir/front-desk/caseflow-module/patient-case-flow/components/contact-info-form/contact-info-form.component';
import { ContactPeopleFormComponent } from '@appDir/front-desk/caseflow-module/patient-case-flow/components/contact-people-form/contact-people-form.component';
import { PersonalInformationFormComponent } from './components/personal-information-form/personal-information-form.component';
import { PersonalInformationEditComponent } from '@appDir/front-desk/caseflow-module/patient-case-flow/components/personal-information-edit/personal-information-edit.component';

const routes: Routes = [
	{
		path: '',
		component: PersonalInformationEditComponent,
		children: [
			// {
			// 	path: '',
			// 	redirectTo: 'personal'
			// },
			{
				path: 'personal',
				component: PersonalInformationFormComponent,
				canDeactivate: [CanDeactivateFormsComponentService],
				data: {
					permission: USERPERMISSIONS.patient_case_list_personal_information_personal_tab
				}
			},
			{
				path: 'basic-contact',
				component: ContactInfoFormComponent,
				canDeactivate: [CanDeactivateFormsComponentService],
				data: {
					permission: USERPERMISSIONS.patient_case_list_personal_information_basic_contact_tab
				}
			},
			{
				path: 'emergency-contact',
				component: ContactPeopleFormComponent,
				data: {
					permission: USERPERMISSIONS.patient_case_list_personal_information_emergency_contact_tab
				},
				canDeactivate: [CanDeactivateFormsComponentService],
			},
			{
				path: 'form-filler',
				component: ContactPeopleFormComponent,
				data: {
					permission: USERPERMISSIONS.patient_case_list_personal_information_form_filler_tab
				},
				canDeactivate: [CanDeactivateFormsComponentService],
			},
			{
				path: 'guarantor',
				component: ContactPeopleFormComponent,
				data: {
					permission: USERPERMISSIONS.patient_case_list_personal_information_gurantor_tab
				},
				canDeactivate: [CanDeactivateFormsComponentService],
			}

		]
	}


];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class PatientCaseFlowRoutingModule { }
