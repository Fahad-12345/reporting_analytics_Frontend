import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AttorneyComponent } from './attorney.component';
import { AttorneyEditComponent } from './attorney-edit/attorney-edit.component';
import { USERPERMISSIONS } from '../UserPermissions';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '', component: AttorneyComponent, pathMatch: 'full', data: {
          title: 'Edit Attorney',
          permission: USERPERMISSIONS.patient_attorney_tab
        }
      },
      {
        path: 'edit', component: AttorneyEditComponent, data: {
          title: 'Edit Attorney',
          permission: USERPERMISSIONS.patient_attorney_tab
        }
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AttorneyRoutingModule { }
