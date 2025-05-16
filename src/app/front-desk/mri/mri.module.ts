import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MRIRoutingModule } from './mri-routing.module';
import { MRIComponent } from './mri.component';
import { MriIntake1EditComponent } from './mri-intake1-edit/mri-intake1-edit.component';
import { MriIntake2EditComponent } from './mri-intake2-edit/mri-intake2-edit.component';
import { FdSharedModule } from '../fd_shared/fd-shared.module';

@NgModule({
  declarations: [MRIComponent, MriIntake1EditComponent, MriIntake2EditComponent],
  imports: [
    CommonModule,
    MRIRoutingModule,
    FdSharedModule
  ]
})
export class MRIModule { }
