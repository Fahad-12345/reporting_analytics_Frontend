import { USERPERMISSIONS } from '../../UserPermissions';
import { AclResolverService } from '../../acl-redirection.resolver';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReasonCodeComponent } from './reason-code.component';
import { ReasonCodeListComponent } from './reason-code/reason-code-list/reason-code-list.component';

const routes: Routes = [{
	path: '',
	component: ReasonCodeComponent,
	children: [
		{ path: '', redirectTo: 'list', pathMatch: 'full' },
		{
			path: 'list',
			component: ReasonCodeListComponent,
			data: {
				title: 'reasonCode-list',
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
export class ReasonCodeRoutingModule {
}
