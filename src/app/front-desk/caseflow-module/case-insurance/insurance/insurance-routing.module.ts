import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InsuranceComponent } from './insurance.component';
import { CanDeactivateFormsComponentService } from '@appDir/shared/canDeactivateFormsComponent/can-deactivate-forms-component.service';
import { USERPERMISSIONS } from '@appDir/front-desk/UserPermissions';

const routes: Routes = [
  {
    path: "",
    component: InsuranceComponent,
    data: {
      title: 'Insurance',
      permission: USERPERMISSIONS.patient_insurance_info_edit
    },
    canDeactivate: [CanDeactivateFormsComponentService],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InsuranceRoutingModule { }
