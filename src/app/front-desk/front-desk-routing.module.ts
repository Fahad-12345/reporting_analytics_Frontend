import { NgModule } from '@angular/core';
import {
	RouterModule,
	Routes,
} from '@angular/router';


import {
	RolesComponentComponent,
} from '@appDir/shared/components/roles/roles-component/roles-component.component';
import { AclResolverService } from './acl-redirection.resolver';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FrontDeskComponent } from './front-desk.component';

const routes: Routes = [
	{
		path: '',
		component: FrontDeskComponent,
		data: {
			title: 'Front Desk',
			link: {},
			expectedRole:'front_desk',
			
		},
		children: [
			{
				path: '',
				component: DashboardComponent,
				data: {
					title: 'Front Desk',
					//permission: RoutesPermissions.canAccessPatient,
					expectedRole:'front_desk',
				},
				
			},
			{
				path: 'roles',
				component: RolesComponentComponent,
			},
			 { path: 'soft-patient',
			  loadChildren:()=>import('./soft-patient/soft-patient.module').then(m => m.SoftPatientModule)},
		    //  { path: 'patients',
			//  loadChildren:()=>import('./patient/patient.module').then(m => m.PatientModule)},			 
			// { path: 'cases', loadChildren: './cases/cases.module#CasesModule' },
			// { path: 'users', 
			// loadChildren:()=>import('./users/users.module').then(m => m.UsersModule)},
			// { path: 'doctors', loadChildren: './doctors/doctors.module#DoctorsModule' },
			// {
			// 	path: 'appointment/create',
			// 	loadChildren: './appointment/appointment.module#AppointmentModule',
			// },
			// {
			// 	path: 'bulk-billing',
			// 	loadChildren: './bulk-billing/bulk-billing.module#BulkBillingModule',
			// },
			// { path: 'tasks', loadChildren: './task/task.module#TaskModule' },
			//resolve: {route: AclResolverService, state: AclResolverService}
		],
	     // resolve: { route: AclResolverService, state: AclResolverService }
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class FrontDeskRoutingModule {}
