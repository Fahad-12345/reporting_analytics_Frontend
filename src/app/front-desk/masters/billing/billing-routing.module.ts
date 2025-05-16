import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InsuranceComponent } from './insurance-master/Insurance/insurance-list/insurance.component';
import { EmployerComponent } from './employer-master/employer/employer.component';
import { BillingMasterComponent } from './billing-master/billing-master.component';
import { AttorneyComponent } from './attorney-master/attorney/attorney-listing/attorney.component';
import { MasterBillingComponent } from './billing.component';
import { FirmComponent } from './attorney-master/firm/firm/add-attorney.component';
import { InsuranceFormComponent } from './insurance-master/Insurance/insurance-form/insurance-form.component';
import { CanDeactivateFormsComponentService } from '@appDir/shared/canDeactivateFormsComponent/can-deactivate-forms-component.service';
import { AclResolverService } from '@appDir/front-desk/acl-redirection.resolver';
import { USERPERMISSIONS } from '@appDir/front-desk/UserPermissions';
import { AdjusterInformationComponent } from './insurance-master/adjuster/adjuster-information/adjuster-information.component';

const routes: Routes = [
	{
	path: '',
	component: MasterBillingComponent,
 	children: [
		// {
		// 	path: '',
		// 	pathMatch: 'full'
		// },
		{
			path: 'insurance',
			loadChildren:()=>import('./insurance-master/insurance-master.module').then(m => m.InsuranceMasterModule),
			data: {
				permission: USERPERMISSIONS.master_billing_insurance_menu
			}
		},
		{
			path: 'insurance/add',
			component: InsuranceFormComponent,
			data: {
				title: 'Insurance/Add',
				permission: USERPERMISSIONS.master_billing_insurance_add
			},
			canDeactivate: [CanDeactivateFormsComponentService]
		},
		{
			path: 'insurance/edit/:id',
			component: InsuranceFormComponent,
			data: {
				title: 'Insurance/Edit',
				permission: USERPERMISSIONS.master_billing_insurance_edit
			},
			canDeactivate: [CanDeactivateFormsComponentService]
		},
		{
			path: 'attorney',
			loadChildren:()=>import('./attorney-master/master-main-attorney.module').then(m => m.MasterMainAttorneyModule),
			data: {
				title: 'Attorney', 
				permission: USERPERMISSIONS.master_billing_attorney_menu
			}
		},
		{
			path: 'attorney/edit/:id',
			component: FirmComponent,
			data: {
				permission: USERPERMISSIONS.master_billing_attorney_edit
			}
		},
		{
			path: 'attorney/add',
			component: FirmComponent,
			data: {
				title: 'Firm/Add',
				permission: USERPERMISSIONS.master_billing_attorney_add
			},
		},
		{
			path: 'employer',
			loadChildren:()=>import('./employer-master/employer-master.module').then(m => m.EmployerMasterModule),

			data: {
				title: 'Employer',
				permission: USERPERMISSIONS.master_billing_employer_menu
			}
		},
	
		{
			path: 'codes',
			loadChildren:()=>import('./codes/codes.module').then(m => m.CodesModule),
			data: {
				permission: USERPERMISSIONS.master_billing_codes_menu
			}
		},
		{
		  path: 'billing-master',
		  component: BillingMasterComponent,
		},
		{
			path: 'billing-master',
			loadChildren:()=>import('./billing-master/blling-master.module').then(m => m.BllingMasterModule),

			data: {
				permission: USERPERMISSIONS.master_billing_billing_menu
			}
		},

		{
			path: 'invoice-master',
			loadChildren:()=>import('./invoice/invoice.module').then(m => m.InvoiceModule),
			data: {
				title:'Invoice Builder',
				permission: USERPERMISSIONS.master_invoice_menu
			}
		},
		{ path: 'clearinghouse', 
		loadChildren: () => import('./clearinghouse/clearinghouse.module').then(m => m.ClearinghouseModule),
		data: {
			title : 'Clearinghouse'
		}
	 },
		{ path: 'emp-ins-linkage', 
		loadChildren: () => import('./emp-insu-linkage/emp-insu-linkage.module').then(m => m.EmpInsuLinkageModule),
		data: {
			title : 'Employer-Insurance Linkage'
		}
	 }

 	],
 	resolve: { route: AclResolverService, state: AclResolverService }
}
];


@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class BillingRoutingModule { }
