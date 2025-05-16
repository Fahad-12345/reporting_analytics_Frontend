import { BillingVisitComponent } from './components/bill-vists-component/bill-vists.component';
import { USERPERMISSIONS } from '@appDir/front-desk/UserPermissions';

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: BillingVisitComponent,
    children: [
      { path: '',pathMatch: 'full', redirectTo: 'visits-list' },
      {
        path: 'visits-list',
		component: BillingVisitComponent,
		data: {
			title: "Visit Listing",
			permission: USERPERMISSIONS.patient_patient_list_menu

		},
	},
	
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BillVistRoutingModule { }
