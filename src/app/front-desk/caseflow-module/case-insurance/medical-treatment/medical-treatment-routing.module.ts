import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MedicalTreatmentComponent } from './medical-treatment.component';
import { CanDeactivateFormsComponentService } from '@appDir/shared/canDeactivateFormsComponent/can-deactivate-forms-component.service';

const routes: Routes = [
  {
    path: "",
    component: MedicalTreatmentComponent,
    data: {
      title: 'Medical Treatment'
    },
    canDeactivate: [CanDeactivateFormsComponentService],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MedicalTreatmentRoutingModule { }
