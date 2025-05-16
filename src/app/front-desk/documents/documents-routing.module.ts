import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DocumentsComponent } from './documents.component';
import { USERPERMISSIONS } from '../UserPermissions';

const routes: Routes = [{
  path: '',
  children: [
    {
      path: '',
      component: DocumentsComponent,
      pathMatch: 'full',
      data: {
        title: 'Edit Documents Manager',
        data: {
          permission: USERPERMISSIONS.patient_case_list_docs_menu
        }
      }
    },
    // {
    //   path: 
    // }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocumentsRoutingModule { }
