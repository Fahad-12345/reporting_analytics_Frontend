import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AclResolverService } from '@appDir/front-desk/acl-redirection.resolver';
import { ReferringPhysicianComponent } from './referring-physician.component';
import { USERPERMISSIONS } from '@appDir/front-desk/UserPermissions';

const routes: Routes = [{
	path: '',
	component: ReferringPhysicianComponent,
	children: [
		{
			path: '',
			redirectTo: 'clinic',
			pathMatch:'full'

		},
		{
			path: 'clinic',
			loadChildren:()=>import('./Clinic/clinic.module').then(m => m.ClinicModule),
			data: {
				title: 'Clinic',
				permission: USERPERMISSIONS.master_clinic_tab
			}
		},
		{
			path: 'physician',
			loadChildren:()=>import('./physician/physician.module').then(m => m.PhysicianModule),
			data: {
				title: 'Referring Physician',
				permission: USERPERMISSIONS.master_referring_physician_tab
			}
		},
	],
	resolve: { route: AclResolverService, state: AclResolverService }
}];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class MasterReferringPhysicianRoutingModule { }
