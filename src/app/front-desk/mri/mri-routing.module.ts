import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MRIComponent } from './mri.component';
import { MriIntake1EditComponent } from './mri-intake1-edit/mri-intake1-edit.component';
import { MriIntake2EditComponent } from './mri-intake2-edit/mri-intake2-edit.component';

const routes: Routes = [{
  path: '',
  children: [
    {
      path: '',
      component: MRIComponent,
      pathMatch: 'full',
      data: {
        title: "MRI"
      }
    },
    {
      path: 'intake1/edit',
      component: MriIntake1EditComponent,
      data: {
        title: "Patient's MRI Intake 1 Information"
      }
    },
    {
      path: 'intake2/edit',
      component: MriIntake2EditComponent,
      data: {
        title: "Patient's MRI Intake 2 Information"
      }
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MRIRoutingModule { }
