import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsersRoutingModule } from './users-routing.module';
import { UsersListComponent } from './components/users-list/users-list.component';
import { FdSharedModule } from '../../../fd_shared/fd-shared.module';
import { UsersAddComponent } from './components/users-add/users-add.component';
import { UserPrivilegesComponent } from './components/user-privileges/user-privileges.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTreeModule } from '@angular/material/tree';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import {  MatNativeDateModule } from '@angular/material/core';

import { SharedModule } from '@appDir/shared/shared.module';
import { MastersSharedModule } from '../../shared/masters-shared.module';
// import { TimePlanComponent } from '../../shared/components/time-plan/time-plan.component';
import { BusyLoaderModule } from '@appDir/shared/busy-loader/busy-loader.module';
@NgModule({
  declarations: [UsersListComponent, UsersAddComponent, UserPrivilegesComponent],
  imports: [
    CommonModule,
    UsersRoutingModule,
    TabsModule.forRoot(),
    MatDatepickerModule,
    MatNativeDateModule,
    NgMultiSelectDropDownModule.forRoot(),
    MatTreeModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    FdSharedModule,
    SharedModule,
    MastersSharedModule,
    BusyLoaderModule,
  ]
})
export class UsersModule { }
