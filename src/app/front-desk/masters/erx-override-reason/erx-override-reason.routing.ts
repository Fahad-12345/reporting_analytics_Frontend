import { USERPERMISSIONS } from '../../UserPermissions';
import { AclResolverService } from '../../acl-redirection.resolver';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ErxOverrideReasonComponent } from './erx-override-reason.component';
import { ErxOverrideReasonListComponent } from './erx-override-reason/erx-override-reason-list/erx-override-reason-list.component';

const routes: Routes = [{
	path: '',
	component: ErxOverrideReasonComponent,
	children: [
		{ path: '', redirectTo: 'list', pathMatch: 'full' },
		{
			path: 'list',
			component: ErxOverrideReasonListComponent,
			data: {
				title: 'reaction-list',
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
export class ReactionRoutingModule {
}
