import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// import { InsuranceComponent } from './Insurance/insurance-list/insurance.component';
// import { PlannameComponent } from './PlanName/planname/planname.component';
// import { PlantypeComponent } from './PlanType/plantype/plantype.component';
import { MainInsuranceComponent } from './main-insurance.component';
import { AclResolverService } from '@appDir/front-desk/acl-redirection.resolver';
import { USERPERMISSIONS } from '@appDir/front-desk/UserPermissions';
// import { InsuranceFormComponent } from './Insurance/insurance-form/insurance-form.component';
// import { AdjusterInformationComponent } from './adjuster/adjuster-information/adjuster-information.component';

const routes: Routes = [{
	path: '',
	component: MainInsuranceComponent,
	children: [
		// {
		// 	path: '',
		// 	// redirectTo: 'insurance'
		// },
		{
			path: 'insurance',
			//   component: InsuranceComponent,
			loadChildren:()=>import('./Insurance/master-insurance.module').then(m => m.MasterInsuranceModule),

			data: {
				title: 'Insurance',
				permission: USERPERMISSIONS.master_billing_insurance_tab
			}
		},
		{
			path: 'planname',
			// component: PlannameComponent,
			loadChildren:()=>import('./PlanName/master-plan-name.module').then(m => m.MasterPlanNameModule),

			data: {
				title: 'Plan Name',
				permission: USERPERMISSIONS.master_billing_plan_name_tab
			}
		},
		{
			path: 'plantype',
			// component: PlantypeComponent,
			loadChildren:()=>import('./PlanType/master-plan-type.module').then(m => m.MasterPlanTypeModule),


			data: {
				title: 'Plan Type',
				permission: USERPERMISSIONS.master_billing_plan_type_tab
			}
		},
		{
			path: 'adjuster-information',
			// component: AdjusterInformationComponent,
			loadChildren:()=>import('./adjuster/master-adjuster.module').then(m => m.MasterAdjusterModule),

			data: {
				title: 'Adjuster Information',
				permission: USERPERMISSIONS.master_billing_adjuster_tab
			}
		},
		// {
		// 	path: 'insurance/add',
		// 	component: InsuranceFormComponent,
		// 	data: {
		// 		title: 'Insurance/Add',
		// 		permission: USERPERMISSIONS.master_billing_insurance_add
		// 	},
		// 	// canDeactivate: [CanDeactivateFormsComponentService]
		// },
		// {
		// 	path: 'insurance/edit/:id',
		// 	component: InsuranceFormComponent,
		// 	data: {
		// 		title: 'Insurance/Edit',
		// 		permission: USERPERMISSIONS.master_billing_insurance_edit
		// 	},
		// 	// canDeactivate: [CanDeactivateFormsComponentService]
		// },
	],
	resolve: { route: AclResolverService, state: AclResolverService }
}];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class InsuranceMasterRoutingModule { }
