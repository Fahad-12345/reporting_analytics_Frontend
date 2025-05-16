import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CaseTypeComponent } from './caseTypeComponent/case.type.component';




const routes: Routes = [
  {
    path: '',
    children: [
      // { path: '', redirectTo: 'li'st', pathMatch: 'full' },

      {
        path: '',
        component: CaseTypeComponent,
        data: {
          title: 'Case Type List',
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CaseTypeRoutingModule { }
