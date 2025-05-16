import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CasesRoutingModule } from './cases-routing.module';
import { CasesComponent } from './cases.component';
import { FdSharedModule } from '../fd_shared/fd-shared.module';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [CasesComponent],
  imports: [
    CommonModule,
    CasesRoutingModule,
    FdSharedModule,
    SharedModule
  ],
  providers:[]
})
export class CasesModule { }
