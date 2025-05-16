import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AttorneyListComponent } from './attorney/attorney-list/attorney-list.component';
import { MastersComponent } from './masters.component';
import { AttorneyAddComponent } from './attorney/attorney-add/attorney-add.component';
import { AttorneyEditComponent } from './attorney/attorney-edit/attorney-edit.component';
import { InsuranceListComponent } from './insurance/insurance-list/insurance-list.component';
import { InsuranceEditComponent } from './insurance/insurance-edit/insurance-edit.component';
// import { InsuranceAddComponent } from './insurance/insurance-add/insurance-add.component';
import { HospitalListComponent } from './hospital/hospital-list/hospital-list.component';
import { HospitalAddComponent } from './hospital/hospital-add/hospital-add.component';
import { HospitalEditComponent } from './hospital/hospital-edit/hospital-edit.component';
import { SpecialitiesListComponent } from './specialities/specialities-list/specialities-list.component';
import { AclResolverService } from '../acl-redirection.resolver';
import { USERPERMISSIONS } from '../UserPermissions';
import { PicklistcategoryComponent } from './billing/billing-master/picklistcategory/picklistcategory.component';
import { TaskPriorityComponent } from './task/task-priority/task-priority.component';


const routes: Routes = [{
	path: '',
	children: [
		{
			path: '',
			component: MastersComponent
		},
		{
			path: 'attorney-list',
			component: AttorneyListComponent,
			data: {
				title: 'Attorney List'
			}
		},
		{
			path: 'attorney/add',
			component: AttorneyAddComponent,
			data: {
				title: 'Add Attorney'
			}
		},
		{
			path: 'attorney/edit/:id',
			component: AttorneyEditComponent,
			data: {
				title: 'Add Attorney'
			}
		},
		{
			path: 'providers',
			loadChildren:()=>import('./providers/providers.module').then(m => m.ProvidersModule),

			//component: MainProviderComponent,
			data: {
				// permission: USERPERMISSIONS.master_speciality_menu
				permission: USERPERMISSIONS.master_provider_menu

			}
		},
	

		{
			path: 'insurance',
			component: InsuranceListComponent,
			data: {
				title: 'Insurnace List',
			}
		},
	
		{
			path: 'hospitals',
			component: HospitalListComponent,
			data: {
				title: 'Hospitals List'
			}
		},
		{
			path: 'hospitals/add',
			component: HospitalAddComponent,
			data: {
				title: 'Add Hospital'
			}
		},
		{
			path: 'hospitals/edit/:id',
			component: HospitalEditComponent,
			data: {
				title: 'Edit Hospitals'
			}
		},
		{
			path: 'specialist',
			component: SpecialitiesListComponent,
			data: {
				title: 'Specialist List'
			}
		},
		{
			path: 'billing',
			loadChildren:()=>import('./billing/billing.module').then(m => m.BillingModule),
			data: {
				permission: USERPERMISSIONS.master_billing_menu
			}
		 },
		// // {
		// // 	path: 'invoice',
		// // 	loadChildren: './invoice/invoice.module#InvoiceModule',
		// // 	data: {
		// // 		permission: USERPERMISSIONS.master_invoice_menu
		// // 	}
		// // },
		{
			path: 'builder-invoice',
			loadChildren:()=>import('./builder-invoice/builder-invoice.module').then(m => m.BuilderInvoiceModule),
			data: {
				title:'Invoice Builder',
				permission: USERPERMISSIONS.master_invoice_menu
			}
		},
		
		{
			path: 'users',
			loadChildren:()=>import('./master-users/master-users.module').then(m => m.MasterUsersModule),
			data: {
				permission: USERPERMISSIONS.master_user_menu
			}  
		},
	
		{
			path: 'erx',
			loadChildren:()=>import('./erx/erx.module').then(m => m.ErxModule),
			data: {
				permission: USERPERMISSIONS.master_practice_menu
			}
		},
	
		// {
		// 	path: 'task',// component: TaskPriorityComponent,
		// 	loadChildren: './task/tasks.module#TasksModule',
		// 	data: {
		// 		permission: USERPERMISSIONS.master_practice_menu
		// 	}
		// },
		{
			path: 'template',
			loadChildren:()=>import('./template-master/template-master.module').then(m => m.TemplateMasterModule),
	
		},


	],
	resolve: { route: AclResolverService, state: AclResolverService }

}];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class MastersRoutingModule {
}
