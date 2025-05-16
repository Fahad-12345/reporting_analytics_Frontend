import { PhysicianListComponent } from './physician-list/physician-list.component';
import { PhysicianComponent } from './physician/physician.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AclResolverService } from '@appDir/front-desk/acl-redirection.resolver';

const routes: Routes = [{
	path: '',
	component: PhysicianComponent,
	children: [
		{ path: '', redirectTo: 'list', pathMatch: 'full' },
		{
			path: 'list',
			component: PhysicianListComponent,
			data: {
				title: 'physician-list',
				permission: 'loginDefault'
			},
		},
	],
	resolve: { route: AclResolverService, state: AclResolverService }

}];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class PhysicianRoutingModule { }
