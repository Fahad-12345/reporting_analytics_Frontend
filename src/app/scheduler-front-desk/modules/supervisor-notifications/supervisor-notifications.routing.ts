import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

//components
import { SupervisorNotificationsComponent } from './supervisor-notifications.component';
import { USERPERMISSIONS } from '@appDir/front-desk/UserPermissions';
import { AclResolverService } from '@appDir/front-desk/acl-redirection.resolver';


export const routes: Routes = [
  {
    path: '',
    component: SupervisorNotificationsComponent,
	// data: {
	// 	// permission: USERPERMISSIONS.patient_schedular_menu
	// 	permission: USERPERMISSIONS.notification_menu

	// },
	// resolve: { route: AclResolverService, state: AclResolverService }
  }

];


@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class SchedulerSupervisorNotificationRoutingModule {}