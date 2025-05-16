import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MriIntakeComponent } from './mri-intake.component';
import { CanDeactivateFormsComponentService } from '@appDir/shared/canDeactivateFormsComponent/can-deactivate-forms-component.service';

const routes: Routes = [
  {
    path: "",
    component: MriIntakeComponent,
    data: {
      title: 'Mri Intake'
    },
    canDeactivate: [CanDeactivateFormsComponentService],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MriIntakeRoutingModule { }
