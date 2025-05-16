import { ErxComponent } from './erx.component';
import { USERPERMISSIONS } from './../../UserPermissions';
import { PharmacyListComponent } from './pharmacy/pharmacy-list/pharmacy-list.component';
import { AclResolverService } from './../../acl-redirection.resolver';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProofingLicenseListComponent } from './proofing-license/proofing-license-list/proofing-license-list.component';




const routes: Routes = [{
	path: '',
	component: ErxComponent,
	children: [
		{ path: '', redirectTo: 'pharmacy/list', pathMatch: 'full' },
		{
			path: 'pharmacy/list',
			component: PharmacyListComponent,
			data: {
				title: 'pharmacy-list',
				permission: 'loginDefault'
			},
		},
		{
			path: 'proofing-license/list',
			component: ProofingLicenseListComponent,
			data: {
				title: 'proofing-license',
				permission: 'loginDefault'
			},
		},
		{
			path: 'reactions', loadChildren:()=>import('../reactions/reactions.module').then(m => m.ReactionsModule),
			data: {
				permission: USERPERMISSIONS.master_practice_menu
			}
		},
		{
			path: 'reasonCode', loadChildren:()=>import('../reason-code/reasonCode.module').then(m => m.ReasonCodeModule),
			data: {
				permission: USERPERMISSIONS.master_practice_menu
			}
		},
		{
			path: 'erx-dea-scheduler-code', loadChildren:()=>import('../erx-dea-schedule-code/dea.schedule.code.module').then(m => m.ErxDeaSchedulerCodeModule),
			data: {
				permission: USERPERMISSIONS.master_practice_menu
			}
		},
		{
			path: 'erx-override-reason', loadChildren:()=>import('../erx-override-reason/erx-override-reason.module').then(m => m.ErxOverrideReasonModule),
			data: {
				permission: USERPERMISSIONS.master_practice_menu
			}
		},
	],
	resolve: { route: AclResolverService, state: AclResolverService }

}];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ErxRoutingModule {
}
