import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CanDeactivateFormsComponentService } from '@appDir/shared/canDeactivateFormsComponent/can-deactivate-forms-component.service';
import { USERPERMISSIONS } from '@appDir/front-desk/UserPermissions';
import { MriIntakesComponent } from './mri-intakes.component';

const routes: Routes = [
  {
    path: "",
    component:MriIntakesComponent ,
    data: {
      title: 'MRI-Intakes',
    //   permission: USERPERMISSIONS.patient_insurance_info_edit
    }
//     canDeactivate: [CanDeactivateFormsComponentService],
//   }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MRIIntakesRoutingModule { }
