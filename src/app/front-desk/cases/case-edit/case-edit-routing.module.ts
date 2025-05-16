import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CaseEditComponent } from './case-edit.component';
import { AclResolverService } from '@appDir/front-desk/acl-redirection.resolver';
import { USERPERMISSIONS } from '@appDir/front-desk/UserPermissions';

const routes: Routes = [{
	path: '',
	component: CaseEditComponent,
	data:{
		permission: USERPERMISSIONS.patient_case_list_menu
	},
	 children: [
		// {
		// 	path: '',
		// 	pathMatch:'full'
			
		// },

		{
			path: 'patient',
			loadChildren:()=>import('../../patient/patient.module').then(m => m.PatientModule),
			data: {
				permission: USERPERMISSIONS.patient_case_list_menu
			}
		},

		{
			path: 'case-insurance',
			loadChildren:()=>import('../../caseflow-module/case-insurance/case-insurance.module').then(m => m.CaseInsuranceModule),
			data: {
				permission: USERPERMISSIONS.patient_case_list_insurance_menu
			}
		},
		{
			path: 'injury',
			loadChildren:()=>import('../../bodyparts/bodyparts.module').then(m => m.BodypartsModule),
			data: {
				permission: USERPERMISSIONS.patient_case_list_injury_menu
			}
		},
		{
			path: 'referrals',
			loadChildren:()=>import('../../caseflow-module/referrals/referrals.module').then(m => m.ReferralsModule),
			data: {
				permission: USERPERMISSIONS.patient_case_list_referrals_menu
			}
		},
		{
			path: 'scheduler', 
			loadChildren:()=>import('../../scheduler/scheduler.module').then(m => m.SchedulerModule),
			data: {
				permission: USERPERMISSIONS.patient_case_list_scheduler_menu

			}
		},
		{
			path: 'document',
			loadChildren:()=>import('../../documents/documents.module').then(m => m.DocumentsModule),
			data: {
				permission: USERPERMISSIONS.patient_case_list_docs_menu
			}
		},
		{
			path: '',
			loadChildren:()=>import('../../billing/billing.module').then(m => m.BillingModule),
			data: {
				permission: USERPERMISSIONS.patient_billing_menu
			}

		},
	
	 	{
			path: 'marketing',
			loadChildren:()=>import('../../marketing/marketing.module').then(m => m.MarketingModule),

			data: {
				permission: USERPERMISSIONS.patient_case_list_marketing_menu
			}
		},
		{
			path: 'erx',
			loadChildren:()=>import('../../../erx/erx.module').then(m => m.ErxUserModule),
			data: {
				permission: USERPERMISSIONS.patient_case_list_marketing_menu
			}
		}

	 ],
	resolve: { route: AclResolverService, state: AclResolverService }
}];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class CaseEditRoutingModule { }
