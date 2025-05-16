import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HouseholdRoutingModule } from './household-routing.module';
import { HouseholdComponent } from './household.component';
import { SharedModule } from '@shared/shared.module';
import { FdSharedModule } from '../fd_shared/fd-shared.module';
import { HouseholdEditComponent } from './household-edit/household-edit.component';

@NgModule({
  declarations: [HouseholdComponent, HouseholdEditComponent],
  imports: [
    CommonModule,
    HouseholdRoutingModule,
    SharedModule,
    FdSharedModule
  ]
})
export class HouseholdModule { }
