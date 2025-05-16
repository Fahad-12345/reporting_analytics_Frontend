import { USERPERMISSIONS } from './../../UserPermissions';
import { AclResolverService } from './../../acl-redirection.resolver';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReactionComponent } from './reaction.component';
import { ReactionsListComponent } from './reactions/reactions-list/reactions-list.component';

const routes: Routes = [{
	path: '',
	component: ReactionComponent,
	children: [
		{ path: '', redirectTo: 'list', pathMatch: 'full' },
		{
			path: 'list',
			component: ReactionsListComponent,
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
