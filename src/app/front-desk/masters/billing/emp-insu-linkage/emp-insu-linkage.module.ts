import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmpInsuLinkageRoutingModule } from './emp-insu-linkage-routing.module';
import { EmpInsuLinkageComponent } from './emp-insu-linkage.component';
import { SharedModule } from '@appDir/shared/shared.module';
import { AddEditEmployerInsuranceLinkComponent } from './add-edit-employer-insurance-link/add-edit-employer-insurance-link.component';


@NgModule({
  declarations: [
    EmpInsuLinkageComponent,
    AddEditEmployerInsuranceLinkComponent
  ],
  imports: [
    CommonModule,
    EmpInsuLinkageRoutingModule,
    SharedModule
  ]
})
export class EmpInsuLinkageModule { }
