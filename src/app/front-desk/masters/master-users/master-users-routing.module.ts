import { CanDeactivateFormsComponentService } from '@appDir/shared/canDeactivateFormsComponent/can-deactivate-forms-component.service';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MasterUsersComponent } from './master-users.component';
import { UserRolesComponent } from './user-roles/user-roles.component';
import { UserCreationComponent } from './user-creation/user-creation.component';
import { UserGroupComponent } from './user-group/user-group.component';
import { HashTagComponent } from './hash-tag/hash-tag.component';
// import { DepartmentComponent } from './department/department.component';
import { EmploymentTypeComponent } from './employment-type/employment-type.component';
import { DesignationComponent } from './designation/designation.component';
import { EmploymentByComponent } from './employment-by/employment-by.component';
import { USERPERMISSIONS } from '@appDir/front-desk/UserPermissions';
import { AclResolverService } from '@appDir/front-desk/acl-redirection.resolver';

const routes: Routes = [
	 {
		path: '',
		component: MasterUsersComponent,
		data: {
 		title: 'User',
			permission: USERPERMISSIONS.master_user_menu
	 	},
	 	children: [
			// { path: '', pathMatch: 'full' },
			{
				path: 'creation',
			loadChildren:()=>import('./users/users.module').then(m => m.UsersModule),
				data: {
					permission: USERPERMISSIONS.master_user_list_tab
				}
			},
			{
				path: 'role',
				component: UserRolesComponent,
				data: {
					title: 'User Roles',
					permission: USERPERMISSIONS.master_user_roles_tab
				},
				canDeactivate: [CanDeactivateFormsComponentService],
			},
			
			{
				path: 'group',
				component: UserGroupComponent,
				data: {
					title: 'Group',
					permission: USERPERMISSIONS.master_groups_tab
				}
			},
		
			{
				path: 'designation',
				component: DesignationComponent,
				data: {
					title: 'Designation',
					permission: USERPERMISSIONS.master_user_designation_tab
				}
			},
			{
				path: 'department',
				loadChildren:()=>import('./departments/departments.module').then(m => m.DepartmentsModule),

			},
			{
				path: 'employment-type',
				component: EmploymentTypeComponent,
				data: {
					title: 'Employment Type',
					permission: USERPERMISSIONS.master_user_emp_type_tab
				}
			},
			{
				path: 'employment-by',
				component: EmploymentByComponent,
				data: {
					title: 'Employment By',
					permission: USERPERMISSIONS.master_user_emp_by_tab
				}
			}
		],
	 	resolve: { route: AclResolverService, state: AclResolverService }
	 }
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class MasterUsersRoutingModule { }
