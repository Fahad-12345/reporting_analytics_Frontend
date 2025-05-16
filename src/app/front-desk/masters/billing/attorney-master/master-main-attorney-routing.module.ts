import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AttorneyComponent } from './attorney/attorney-listing/attorney.component';
import { AclResolverService } from '@appDir/front-desk/acl-redirection.resolver';
import { USERPERMISSIONS } from '@appDir/front-desk/UserPermissions';
import { FirmComponent } from './firm/firm/add-attorney.component';
import { FirmListingComponent } from './firm/firm-listing/firm.component';
import { MainAttorneyComponent } from './main-attorney.component';

const routes: Routes = [{
	path: '',
	component: MainAttorneyComponent,
	children: [
		// {
		// 	path: '',
		// 	redirectTo: 'firm'
		// },
		{
			path: 'attorney',
			// component: AttorneyComponent,
			loadChildren:()=>import('./attorney/master-attorney.module').then(m => m.MasterAttorneyModule),

			data: {
				title: 'Attorney',
				permission: USERPERMISSIONS.master_billing_attorney_tab
			}
		},
		{
			path: 'firm',
			//   component: FirmListingComponent,
			loadChildren:()=>import('./firm/firm.module').then(m => m.FirmModule),
			data: {
				title: 'Firm',
				permission: USERPERMISSIONS.master_billing_firm_tab
			}
		},
		// {
		//   path: 'attorney/edit/:id',
		//   component: FirmComponent,
		//   //canDeactivate: [CanDeactivateFormsComponentService],
		//   data: {
		//     title: 'Firm/Edit',
		//     permission: USERPERMISSIONS.master_billing_attorney_edit
		//   }
		// },
		// {
		//   path: 'attorney/add',
		//   component: FirmComponent,
		//   data: {
		//     title: 'Firm/Add',
		//     permission: USERPERMISSIONS.master_billing_attorney_add
		//   },
		//   //canDeactivate: [CanDeactivateFormsComponentService]
		// },
	],
	resolve: { route: AclResolverService, state: AclResolverService }
}];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class MasterMainAttorneyRoutingModule { }
