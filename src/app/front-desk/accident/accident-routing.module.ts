import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccidentComponent } from './accident.component';
import { AccidentEditComponent } from './accident-edit/accident-edit.component';

const routes: Routes = [{
  path: '',
  children: [
    {
      path: '',
      component: AccidentComponent,
      pathMatch: ''
    },
    {
      path: 'edit',
      component: AccidentEditComponent,
      data: {
        title: 'Edit Accident Information'
      }
    },
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccidentRoutingModule { }
