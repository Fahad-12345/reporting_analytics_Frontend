import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SpecialityComponent } from './specialityComponent/speciality.component';




const routes: Routes = [
  {
    path: '',
    children: [
      // { path: '', redirectTo: 'li'st', pathMatch: 'full' },

      {
        path: '',
        component: SpecialityComponent,
        data: {
          title: 'Speciality List',
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SpecialityRoutingModule { }
