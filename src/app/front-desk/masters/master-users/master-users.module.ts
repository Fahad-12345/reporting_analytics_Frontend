import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MasterUsersRoutingModule } from './master-users-routing.module';
import { UserRolesComponent } from './user-roles/user-roles.component';
import { UserCreationComponent } from './user-creation/user-creation.component';
import { UserGroupComponent } from './user-group/user-group.component';
import { HashTagComponent } from './hash-tag/hash-tag.component';
import { DesignationComponent } from './designation/designation.component';
// import { DepartmentComponent } from './department/department.component';
import { EmploymentTypeComponent } from './employment-type/employment-type.component';
import { MasterUsersComponent } from './master-users.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { EmploymentByComponent } from './employment-by/employment-by.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { UserGroupModalComponentComponent } from './components/user-group-modal-component/user-group-modal-component.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from '@appDir/shared/shared.module';
import { BusyLoaderModule } from '@appDir/shared/busy-loader/busy-loader.module';
import { MastersSharedModule } from '../shared/masters-shared.module';
@NgModule({
	declarations: [
		UserRolesComponent,
		UserCreationComponent,
		UserGroupComponent,
		HashTagComponent,
		DesignationComponent,
		// DepartmentComponent,
		EmploymentTypeComponent,
		MasterUsersComponent,
		EmploymentByComponent,
		UserGroupModalComponentComponent,
		
	],
	imports: [
		CommonModule,
		MasterUsersRoutingModule,
		FormsModule,
		ReactiveFormsModule,
		NgxDatatableModule,
		MatCheckboxModule,
		MatRadioModule,
		NgMultiSelectDropDownModule,
		NgbModule,
		SharedModule,
		BusyLoaderModule,
		MastersSharedModule

	], entryComponents: [
		UserGroupModalComponentComponent
	]
})
export class MasterUsersModule { }
