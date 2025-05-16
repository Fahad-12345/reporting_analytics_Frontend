import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MriIntakeRoutingModule } from './mri-intake-routing.module';
import { MriIntakeComponent } from './mri-intake.component';
import { FdSharedModule } from '@appDir/front-desk/fd_shared/fd-shared.module';

@NgModule({
  declarations: [MriIntakeComponent],
  imports: [
    CommonModule,
    MriIntakeRoutingModule,
    FdSharedModule
  ]
})
export class MriIntakeModule { }
