import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PatientSummaryComponent } from './patient-summary/patient-summary.component';
import { PatientListComponent } from './patient-listing/patient-list.component';
import { PatientProfileComponent } from './patient-profile/patient-profile.component';
// import { RoutesPermissions } from '../route.permission';
import { AclResolverService } from '../acl-redirection.resolver';
import { USERPERMISSIONS } from '../UserPermissions';
import { PatientFormComponent } from './patient-form/patient-form.component';
import { CaseInfoEditComponent } from '../cases/create-case/components/case-info-edit/case-info-edit.component';

const routes: Routes = [{
	path: '',
	children: [
		// {
		// 	path: '',
		// 	 redirectTo: 'patient_summary'
		// },
		{
			path: 'list',
			component: PatientListComponent,
			data: {
				title: "Patient Listing",
				permission: USERPERMISSIONS.patient_patient_list_menu
			}
		},
		{
			path: 'patient-add',
			component: PatientFormComponent,
			data: {
				title: "patient add",
				permission: USERPERMISSIONS.patient_patient_list_menu
			}
		},
		{
			path: 'patient-edit/:id',
			component: PatientFormComponent,
			data: {
				title: "patient edit",
				permission: USERPERMISSIONS.patient_patient_list_menu
			}
		},
		{
			path: 'profile/:id',
			component: PatientProfileComponent,
			data: {
				title: "Patient Profile",
				// permission:RoutesPermissions.canEditPatient
				permission: USERPERMISSIONS.patient_patient_list_profile

			}
		},
		{
			path: 'patient_summary',
			component: PatientSummaryComponent,
			data: {
				title: 'Patient Summary',
				permission: USERPERMISSIONS.patient_case_list_patient_summary_menu
			}
		},
		// {
		//   path: 'personal-info',
		//   component: PersonalInformationComponent,
		//   data: {
		//     title: "Patient Personal Information",
		//     permission: USERPERMISSIONS.patient_personal_info_edit
		//     // permission:RoutesPermissions.canAccessPatientListing

		//   }
		// },
		{
			path: 'case-info',
			component: CaseInfoEditComponent
		},
		{
			path: 'personal-information',
			loadChildren:()=>import('../caseflow-module/patient-case-flow/patient-case-flow.module').then(m => m.PatientCaseFlowModule),

			data: {
				title: 'Patient Information Data',
				permission: USERPERMISSIONS.patient_case_list_personal_information_menu

			}
		},
		// {
		//   path: 'contact-info/:caseId/:id',
		// },
		// {
		//   path: 'emergency-contact-info',
		//   component: ContactPeopleComponent,
		//   data: {
		//     title: 'Emergency Contact Information',
		//     permission: USERPERMISSIONS.emergency_contact_edit

		//   },
		//   canDeactivate: [CanDeactivateFormsComponentService],
		// },
		// {
		//   path: 'legal-guardian-info',
		//   component: ContactPeopleComponent,
		//   data: {
		//     title: 'Legal Guardian Information',
		//     permission: USERPERMISSIONS.legal_guardian_tab

		//   },
		//   canDeactivate: [CanDeactivateFormsComponentService],
		// },
		// {
		//   path: 'form-filler-info',
		//   component: ContactPeopleComponent,
		//   data: {
		//     title: 'Form Filler Information',
		//     permission: USERPERMISSIONS.form_filler_edit

		//   },
		//   canDeactivate: [CanDeactivateFormsComponentService],
		// },
		// {
		//   path: 'edit-all',
		//   component: PatientEditAllComponent,
		//   data: {
		//     title: 'Edit Patient\'s Information',
		//     permission: USERPERMISSIONS.patient_case_info_edit

		//   },
		//   canDeactivate: [CanDeactivateFormsComponentService],
		// }
	],
	resolve: { route: AclResolverService, state: AclResolverService }

}];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class PatientRoutingModule { }
