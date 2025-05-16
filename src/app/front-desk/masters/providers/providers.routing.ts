import { USERPERMISSIONS } from './../../UserPermissions';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProviderComponent } from './provider.component/providers.component';




const routes: Routes = [
    { path: '', redirectTo: 'speciality', pathMatch: 'full' },
    {
      path: '',
      component: ProviderComponent,
      children: [
      {
        path: 'case-type',
        loadChildren:()=>import('./caseType/case.type.module').then(m => m.CaseTypeModule),

        data: {
		  title: 'Case Type',
		  permission: USERPERMISSIONS.master_case_type_tab
        }
      },
      {
        path: 'speciality',
        loadChildren:()=>import('./speciality/speciality.module').then(m => m.SpecialityProviderModule),
        data: {
		  title: 'Speciality',
		  permission: USERPERMISSIONS.master_speciality_tab

        }
      },
      {
        path: 'visit-type',
        loadChildren:()=>import('./vistType/visit.type.module').then(m => m.VisitTypeProviderModule),
        data: {
		  title: 'Visit Type',
		  permission: USERPERMISSIONS.master_visit_type_tab

		  
        }
      },

    ]
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProivdersRoutingModule { }
