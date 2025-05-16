import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CodesComponent } from './codes.component';
import { CPTCodesComponent } from './cptcodes/cpt-codes/cpt-codes.component';
import { ICDCodesComponent } from './icdcodes/icd-codes/icd-codes.component';
import { HCPCSCodesComponent } from './hcpcscodes/hcpcs-codes/hcpcs-codes.component';
import { FeeScheduleComponentComponent } from './fee-schedule/fee-schedule-component/fee-schedule-component.component';
import { AclResolverService } from '@appDir/front-desk/acl-redirection.resolver';
import { USERPERMISSIONS } from '@appDir/front-desk/UserPermissions';
import { CodeTypeComponent } from './codetype/code-type/code-type.component';
import { FeeTypeComponent } from './feetype/fee-type/fee-type.component';
import { ProcedureCodesComponent } from './procedure-codes/procedure-codes.component';
import { IcdCodesModule } from './icdcodes/icd-codes.module';
import { FeeTypeModule } from './feetype/fee-type.module';
import { CodeTypeModule } from './codetype/code-type.module';

const routes: Routes = [
  {
    path: '',
    component: CodesComponent,
    data: {
      permission: USERPERMISSIONS.master_billing_codes_menu
    },
    children: [
      // {
      //   path: '',
      //   //redirectTo: 'Icd-codes'
      // },
      {
        path: 'Icd-codes',
		// component: IcdCodesModule,
       loadChildren:()=>import('./icdcodes/icd-codes.module').then(m => m.IcdCodesModule),
        data: {
          title: 'Icd Codes',
          permission: USERPERMISSIONS.master_billing_codes_icd_tab
        }
      },
      {
        path: 'Cpt-codes',
		// component: CPTCodesComponent,
    loadChildren:()=>import('./cptcodes/cpt-codes.module').then(m => m.CptCodesModule),
        data: {
          title: 'Cpt Codes',
          permission: USERPERMISSIONS.master_billing_codes_cpt_tab
        }
      },
      {
        path: 'Hcpcs-codes',
		// component: HCPCSCodesComponent,
    loadChildren:()=>import('./hcpcscodes/hcpcs-codes.module').then(m => m.HcpcsCodesModule),
        data: {
          title: 'Hcpcs Codes',
          permission: USERPERMISSIONS.master_billing_codes_hcpcs_tab
        }
      },
      {
        path: 'procedure-codes',
        component: ProcedureCodesComponent,
        data: {
          title: 'Procedure Codes',
          permission: USERPERMISSIONS.master_billing_codes_hcpcs_tab
        }
      },
      {
        path: 'Fee-Schedule',
		// component: FeeScheduleComponentComponent,
    loadChildren:()=>import('./fee-schedule/feeschedule.module').then(m => m.FeescheduleModule),

        data: {
          title: 'Fee Schedule',
          permission: USERPERMISSIONS.master_billing_codes_fee_sc_tab
        }
      },
      {
        path: 'Code-Type',
		// component: CodeTypeModule,
    loadChildren:()=>import('./codetype/code-type.module').then(m => m.CodeTypeModule),

        data: {
          title: 'Code Type',
          permission: USERPERMISSIONS.master_billing_codes_code_type_tab
        }
      },
      {
        path: 'Fee-Type',
		// component: FeeTypeComponent,
    loadChildren:()=>import('./feetype/fee-type.module').then(m => m.FeeTypeModule),
        data: {
          title: 'Fee Type',
          permission: USERPERMISSIONS.master_billing_codes_fee_type_tab
        }
      }
    ],
    resolve: { route: AclResolverService, state: AclResolverService }
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CodesRoutingModule { }
