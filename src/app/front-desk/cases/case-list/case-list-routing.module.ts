import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CaseListComponent } from './case-list.component';
import { USERPERMISSIONS } from '@appDir/front-desk/UserPermissions';
import { AclResolverService } from '@appDir/front-desk/acl-redirection.resolver';

const routes: Routes = [{
  path: "",
  component: CaseListComponent,
  data: {
    title: 'Case listing',
    data: { permission: USERPERMISSIONS.case_listing }
  },
  resolve: { route: AclResolverService, state: AclResolverService }
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CaseListRoutingModule { }
