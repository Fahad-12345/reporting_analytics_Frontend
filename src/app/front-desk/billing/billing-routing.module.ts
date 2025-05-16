import { BillSpecailityListingComponent } from './bill-listing-speciality/bill-listing-specaility.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BillingComponent } from './billing.component';
import { USERPERMISSIONS } from '../UserPermissions';
import { AclResolverService } from '../acl-redirection.resolver';
import { BillListingComponent } from './bill-listing/bill-listing.component';

const routes: Routes = [
	{
  path: '',
  children: [
    {
      path: 'visits',
      component: BillingComponent,
      pathMatch: 'full',
      data: {
        title: 'Visits',
        permission: USERPERMISSIONS.patient_case_list_visits_menu
      }
    },
    {
      path: 'billing',
      component: BillListingComponent,
      pathMatch: 'full',
      data: {
        title: 'Billing',
        permission: USERPERMISSIONS.patient_case_list_billing_menu
      }
    },
	// {
	// 	path: 'billing_speciality',
	// 	component: BillSpecailityListingComponent,
	// 	data: {
	// 	  title: 'Billing Specality',
	// 	  permission: USERPERMISSIONS.patient_case_list_billing_menu
	// 	}
	//   }
   
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BillingRoutingModule { }
