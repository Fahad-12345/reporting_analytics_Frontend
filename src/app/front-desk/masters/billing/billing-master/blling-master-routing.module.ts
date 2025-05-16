import { BillVerifcationStatusComponent } from './verification-status/verification.status.component';
import { BillDenialStatusComponent } from './denial-status/denial.status.component';
import { BillEORStatusComponent } from './eor-status/eor.status.component';
import { EORTypeComponent } from './eor-type/eor-type.component';
import { PaymentActionTypeComponent } from './payment-action-type/payment-action.component';
import { BillPaymentStatusComponent } from './payment-status/payment.status.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PaymentTypeComponent } from './payment-type/payment-type.component';
import { BillingMasterComponent } from './billing-master.component';
import { CaseStatusComponent } from './case-status/case-status.component';
import { DenialTypeComponent } from './denial-type/denial-type.component';
import { ModifiersComponent } from './modifiers/modifiers.component';
import { PaidByComponent } from './paid-by/paid-by.component';
import { PlaceOfServiceComponent } from './place-of-service/place-of-service.component';
import { RegionComponent } from './region/region.component';
import { VerificationTypeComponent } from './verification-type/verification-type.component';
import { AclResolverService } from '@appDir/front-desk/acl-redirection.resolver';
import { USERPERMISSIONS } from '@appDir/front-desk/UserPermissions';
import { BillingtitleComponent } from './billingtitle/billingtitle.component';
import { BillingEmploymentTypeComponent } from './billing-employment-type/billing-employment-type.component';
import { PicklistcategoryComponent } from './picklistcategory/picklistcategory.component';
import { BillStatusComponent } from './bill-status/bill-status.component';

const routes: Routes = [
  { 
    path: '',
    component: BillingMasterComponent,
    children: [
      // {
      //   path: '',
      //   //redirectTo: 'payment-type'
      // },
      {
        path: 'payment-type',
        component: PaymentTypeComponent,
        data: {
          title: 'Payment Type',
          permission: USERPERMISSIONS.master_bb_pt_tab
        }
      },
      {
        path: 'case-status',
        component: CaseStatusComponent,
        data: {
          title: 'Case Status',
          permission: USERPERMISSIONS.master_bb_cs_tab
        }
      },
      {
        path: 'denial-type',
        component: DenialTypeComponent,
        data: {
          title: 'Denial Type',
          permission: USERPERMISSIONS.master_bb_denial_tab
        }
      },
      {
        path: 'modifiers-type',
        component: ModifiersComponent,
        data: {
          title: 'Modifiers',
          permission: USERPERMISSIONS.master_bb_mod_tab
        }
      },
      {
        path: 'paid-by',
        component: PaidByComponent,
        data: {
          title: 'Paid By',
          permission: USERPERMISSIONS.master_bb_pb_tab
        }
      },
      {
        path: 'place-of-service',
        component: PlaceOfServiceComponent,
        data: {
          title: 'Place Of Service',
          permission: USERPERMISSIONS.master_bb_pos_tab
        }
      },
      {
        path: 'region',
        component: RegionComponent,
        data: {
          title: 'Region',
          permission: USERPERMISSIONS.master_bb_region_tab
        }
      },
      {
        path: 'verification-type',
        component: VerificationTypeComponent,
        data: {
          title: 'Verification Type',
          permission: USERPERMISSIONS.master_bb_vt_tab
        }
	  },
	  {
        path: 'eor-type',
        component: EORTypeComponent,
        data: {
          title: 'EOR Type',
          permission: USERPERMISSIONS.master_bb_vt_tab
        }
      },
      {
        path: 'billing-title',
        component: BillingtitleComponent,
        data: {
          title: 'Billing Title',
          permission: USERPERMISSIONS.master_bb_vt_tab
        }
      },
      {
        path: 'billing-employment-type',
        component: BillingEmploymentTypeComponent,
        data: {
          title: 'Billing Employment Type',
          permission: USERPERMISSIONS.master_bb_emp_type_tab
        }
      },
      {
        path: 'billing-status',
        component: BillStatusComponent,
        data: {
          title: 'Bill/Invoice Status',
          permission: USERPERMISSIONS.master_bb_vt_tab
        }
	  },
	  {
		path: 'payment-status',
        component: BillPaymentStatusComponent,
        data: {
          title: 'Payment Status',
          permission: USERPERMISSIONS.master_bb_vt_tab
        }
	  },
	  {
		path: 'denial-status',
        component: BillDenialStatusComponent,
        data: {
          title: 'Denial Status',
          permission: USERPERMISSIONS.master_bb_vt_tab
        }
	  },
	  {
		path: 'verification-status',
        component: BillVerifcationStatusComponent,
        data: {
          title: 'Verification Status',
          permission: USERPERMISSIONS.master_bb_vt_tab
        }
	  },
	  {
		path: 'eor-status',
        component: BillEORStatusComponent,
        data: {
          title: 'EOR Status',
          permission: USERPERMISSIONS.master_bb_vt_tab
        }
	  },
	  
	  {
		path: 'payment-action-type',
        component: PaymentActionTypeComponent,
        data: {
          title: 'Payment Action Type',
          permission: USERPERMISSIONS.master_bb_vt_tab
        }
	  },
      {
        path: 'picklistcategory',
        component: PicklistcategoryComponent,
        data: {
          title: 'picklist category',
        }
      },
    ],
    resolve: { route: AclResolverService, state: AclResolverService }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BllingMasterRoutingModule { }
