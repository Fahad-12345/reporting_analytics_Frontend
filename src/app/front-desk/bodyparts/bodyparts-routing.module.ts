import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BodypartsComponent } from './bodyparts.component';
import { BodypartEditComponent } from './bodypart-edit/bodypart-edit.component';
import { CanDeactivateFormsComponentService } from '@appDir/shared/canDeactivateFormsComponent/can-deactivate-forms-component.service';
import { USERPERMISSIONS } from '../UserPermissions';

const routes: Routes = [{
  path: '',
  children: [
    // {
    //   path: '',
    //   component: BodypartsComponent,
    //   pathMatch: 'full',
    //   data: {
    //     permission: USERPERMISSIONS.patient_injury_menu
    //   }
    // },
    {
      path: '',
      component: BodypartEditComponent,
      data: {
        title: 'Bodyparts & Sensations',
        permission: USERPERMISSIONS.patient_case_list_injury_menu
      },
      canDeactivate: [CanDeactivateFormsComponentService],
    },
    // {
    //   path: 'edit/:id',
    //   component: BodypartEditComponent,
    //   data: {
    //     title: 'Edit Bodyparts & Sensations',
    //     permission: USERPERMISSIONS.patient_injury_menu
    //   },
    //   canDeactivate: [CanDeactivateFormsComponentService],
    // }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BodypartsRoutingModule { }
