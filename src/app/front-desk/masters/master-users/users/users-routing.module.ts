import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UsersListComponent } from './components/users-list/users-list.component';
import { UsersAddComponent } from './components/users-add/users-add.component';
import { UserPrivilegesComponent } from './components/user-privileges/user-privileges.component';
import { AclResolverService } from '@appDir/front-desk/acl-redirection.resolver';
import { USERPERMISSIONS } from '@appDir/front-desk/UserPermissions';

const routes: Routes = [
  {
    path: '',
    children: [
    //   { path: '', redirectTo: 'list', pathMatch: 'full' },
    //   { path: '', pathMatch: 'full' },
      
      {
        path: 'list',
        component: UsersListComponent,
        data: {
          title: 'Users List',
          permission: USERPERMISSIONS.master_user_list_tab
        }
	  },
	  {
        path: 'edit/:id',
        loadChildren:()=>import('./user-edit/user-edit.module').then(m => m.UserEditModule),

      },
      {
        path: 'add',
        component: UsersAddComponent,
        data: {
          title: 'Users Add',
          permission: USERPERMISSIONS.add_patient
        }
      },
      {
        path: 'privileges',
        component: UserPrivilegesComponent,
        data: {
          title: 'Users Privileges',
          permission: USERPERMISSIONS.patient_docs_menu
        }
      }
    ],
    // resolve: { route: AclResolverService, state: AclResolverService }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
