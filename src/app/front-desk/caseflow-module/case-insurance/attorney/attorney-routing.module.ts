import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AttorneyComponent } from './attorney.component';
import { CanDeactivateFormsComponentService } from '@appDir/shared/canDeactivateFormsComponent/can-deactivate-forms-component.service';

const routes: Routes = [
  {
    path: "",
    component: AttorneyComponent,
    data: {
      title: 'Attorney'
    },
    canDeactivate: [CanDeactivateFormsComponentService],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AttorneyRoutingModule { }
