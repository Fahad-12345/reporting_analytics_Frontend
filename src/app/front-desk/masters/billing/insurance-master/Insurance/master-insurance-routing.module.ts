import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InsuranceComponent } from './insurance-list/insurance.component';
import { USERPERMISSIONS } from '@appDir/front-desk/UserPermissions';
import { InsuranceFormComponent } from './insurance-form/insurance-form.component';
import { AclResolverService } from '@appDir/front-desk/acl-redirection.resolver';

const routes: Routes = [
	{
		path: '',
		component: InsuranceComponent,
	},
	{
		path: 'insurance/add',
		component: InsuranceFormComponent,
		data: {
			title: 'Insurance/Add',
			permission: USERPERMISSIONS.master_billing_insurance_add
		},
		// canDeactivate: [CanDeactivateFormsComponentService]
	},
	{
		path: 'insurance/edit/:id',
		component: InsuranceFormComponent,
		data: {
			title: 'Insurance/Edit',
			permission: USERPERMISSIONS.master_billing_insurance_edit
		},
		// canDeactivate: [CanDeactivateFormsComponentService]
		resolve: { route: AclResolverService, state: AclResolverService }
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class MasterInsuranceRoutingModule { }
