import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CasesComponent } from './cases.component';
import { AclResolverService } from '../acl-redirection.resolver';
import { USERPERMISSIONS } from '../UserPermissions';
// import { PatientListComponent } from '../patient/patient-listing/patient-list.component';
import { } from './create-case/create-case.module'

const routes: Routes = [{
  path: '',
  component: CasesComponent,
  // pathMatch: 'full',
  children: [
    {
      path: '',
      redirectTo: 'list',
      pathMatch: 'full'
    },

    {
      path: 'list', 
      loadChildren:()=>import('./case-list/case-list.module').then(m => m.CaseListModule),
      data: { permission: USERPERMISSIONS.patient_case_list_menu }
    },
    {
			path: 'edit/:caseId',
      loadChildren:()=>import('app/front-desk/cases/case-edit/case-edit.module').then(m => m.CaseEditModule),
			data: {
			}
		},
    {
      path: 'create',
      loadChildren:()=>import('./create-case/create-case.module').then(m => m.CreateCaseModule),
	    data: { permission: USERPERMISSIONS.patient_case_list_add }
      }
  ],
  resolve: { route: AclResolverService, state: AclResolverService }
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CasesRoutingModule { }
