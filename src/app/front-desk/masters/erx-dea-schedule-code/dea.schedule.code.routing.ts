import { USERPERMISSIONS } from '../../UserPermissions';
import { AclResolverService } from '../../acl-redirection.resolver';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DeaScheduleCodeComponent } from './dea.schedule.code.component';
import { DeaScheduleCodeListComponent } from './deaScheduleCode/deaScheduleCode-list/dea.schedule.code-list.component';


const routes: Routes = [{
	path: '',
	component: DeaScheduleCodeComponent,
	children: [
		{ path: '', redirectTo: 'list', pathMatch: 'full' },
		{
			path: 'list',
			component: DeaScheduleCodeListComponent,
			data: {
				title: 'erx-dea-scheduler-code-list',
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
export class DeaScheduleCodeRoutingModule {
}
