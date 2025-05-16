import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccidentComponent } from './accident.component';
import { CanDeactivateFormsComponentService } from '@appDir/shared/canDeactivateFormsComponent/can-deactivate-forms-component.service';

const routes: Routes = [
  {
    path: "",
    component: AccidentComponent,
    data: {
      title: 'Accident'
    }
    , canDeactivate: [CanDeactivateFormsComponentService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccidentRoutingModule { }
