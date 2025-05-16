import { TransportationComponent } from './components/tranportation-report-list/tranportation-report-list.component';
import { NgModule } from '@angular/core';
import {
	RouterModule,
	Routes,
} from '@angular/router';
import { AclResolverService } from '../acl-redirection.resolver';
import { USERPERMISSIONS } from '../UserPermissions';

import { Nf2ReportsListComponent } from './components/nf2-reports-list/nf2-reports-list.component';

import { ReportsComponent } from './reports/reports.component';
import { DenialDetailReportComponent } from './components/denial-detail-report/denial-detail-report.component';
import { AppoinmentReportComponent } from './components/appoinment-report/appoinment-report.component';
import { DenialReportComponent } from './components/denial-report/denial-report.component';
import { ARReportComponent } from './components/a-r-report/a-r-report.component';
import { PaymentReportComponent } from './components/payment-report/payment-report.component';
import {AppointmentStatusComponent} from './components/appointment status/appointment-status-report.component';
import { ARDetailReportComponent } from './components/ar-detail-report/ar-detail-report.component';



const routes: Routes = [
	{
		path: '',
		children: [
			{
				path: '',
				component: ReportsComponent,
				data: {
					title: 'Report',
					 permission: USERPERMISSIONS.reports_menu
				  }
			},
			{
				path: 'nf2-reports',
				component: Nf2ReportsListComponent,
				data: {
					title: 'Report Menu Nf2',
					 permission: USERPERMISSIONS.reports_menu_nf2
				  }
			},
			{
				path: 'transportation-reports',
				component:TransportationComponent,
				data: {
					title: 'Appointment Transportation Report',
					 permission: USERPERMISSIONS.reports_menu_nf2
				  }
			},
			{
				path: 'appointment-status-reports',
				component: AppointmentStatusComponent,
				data: {
					title: 'Appointment Summary/Status Report',
					 permission: USERPERMISSIONS.reports_menu_nf2
				  }
			},
			
			{
				path: 'appointment-reports',
				component:AppoinmentReportComponent,
				data: {
					title: 'Appointment Report',
					 permission: USERPERMISSIONS.reports_menu_nf2
				  }
			},
			{
				path: 'denial-reports',
				component:DenialReportComponent,
				data: {
					title: 'Denial Report',
					 permission: USERPERMISSIONS.reports_menu_nf2
				  }
			},
			{
				path: 'appointment-reports',
				component:DenialReportComponent,
				data: {
					title: 'Appointment Report',
					 permission: USERPERMISSIONS.reports_menu_nf2
				  }
			},
			{
				 path: 'denial-detail-reports',
				//path: 'denial-detail-reports/:id',

				component:DenialDetailReportComponent,
				data: {
					title: 'Denial Detail Report',
					 permission: USERPERMISSIONS.reports_menu_nf2
				  }
			},
			{
				path: 'AR-detail-reports',
			   component:ARDetailReportComponent,
			   data: {
				   title: 'AR Detail Report',
					permission: USERPERMISSIONS.reports_menu_nf2
				 }
		   },
			{
				path: 'ar-reports',
				component:ARReportComponent,
				data: {
					title: 'A/R Report',
					 permission: USERPERMISSIONS.reports_menu_nf2
				  }
			},
			{
				path: 'payment-reports',
				component:PaymentReportComponent,
				data: {
					title: 'Payment Report',
					 permission: USERPERMISSIONS.reports_menu_nf2
				  }
			},
		],
		resolve: { route: AclResolverService, state: AclResolverService }
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class ReportsRoutingModule {}
