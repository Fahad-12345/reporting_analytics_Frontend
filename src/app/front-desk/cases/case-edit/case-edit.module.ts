import { ErxUserModule } from './../../../erx/erx.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CaseEditRoutingModule } from './case-edit-routing.module';
import { CaseEditComponent } from './case-edit.component';
import { FdSharedModule } from 'app/front-desk/fd_shared/fd-shared.module';
import { SharedModule } from '@shared/shared.module';
import { BusyLoaderModule } from '@appDir/shared/busy-loader/busy-loader.module';

@NgModule({
  declarations: [CaseEditComponent],
  imports: [
    CommonModule,
    CaseEditRoutingModule,
    FdSharedModule,
	ErxUserModule,
    SharedModule,
    // JasperoConfirmationsModule.forRoot(),
    BusyLoaderModule
  ]
})
export class CaseEditModule { }
