import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HouseHoldInfoComponent } from './house-hold-info.component';
import { CanDeactivateFormsComponentService } from '@appDir/shared/canDeactivateFormsComponent/can-deactivate-forms-component.service';

const routes: Routes = [
  {
    path: "",
    component: HouseHoldInfoComponent,
    data: { title: 'Household Info' }
    //canDeactivate: [CanDeactivateFormsComponentService],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HouseHoldInfoRoutingModule { }
