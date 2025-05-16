import { Routes, RouterModule } from '@angular/router';
import {  NgModule } from '@angular/core';

//components
import { AssignSpecialityComponent } from './assign-speciality.component';

export const routes: Routes = [
  {
    path: '',
    component: AssignSpecialityComponent,

  },

];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})

export class AssignSpecialitiyRouting {
}
