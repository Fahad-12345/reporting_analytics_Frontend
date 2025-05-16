import { BillingSpecalityComponent } from './bill-specality/bill-specality.component';
import { USERPERMISSIONS } from '@appDir/front-desk/UserPermissions';
import { BillingBulkComponent } from './components/bill-payment.component';

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: BillingBulkComponent,
    children: [
    //   { path: '',pathMatch: 'full', redirectTo: 'bill-list' },
      {
        path: 'bill-list',
		component: BillingBulkComponent,
		data: {
			title: "Bill Listing",
			permission: USERPERMISSIONS.patient_patient_list_menu

		},
	},
	
    ]
  },

  {
	path: 'bill-speciality-list',
	component: BillingSpecalityComponent,
	data: {
		title: "Bill Speciality Listing",
		permission: USERPERMISSIONS.patient_patient_list_menu

	},
	
},

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BillPaymentRoutingModule { }
