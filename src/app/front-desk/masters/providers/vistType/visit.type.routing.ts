import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VisittypeComponent } from './visitTypeComponent/visit.type.component';




const routes: Routes = [
  {
    path: '',
    children: [
      // { path: '', redirectTo: 'li'st', pathMatch: 'full' },

      {
        path: '',
        component: VisittypeComponent,
        data: {
          title: 'Visit Type List',
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VistTypeRoutingModule { }
