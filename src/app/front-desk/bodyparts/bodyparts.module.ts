import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BodypartsRoutingModule } from './bodyparts-routing.module';
import { BodypartsComponent } from './bodyparts.component';
import { BodypartEditComponent } from './bodypart-edit/bodypart-edit.component';
import { FdSharedModule } from '../fd_shared/fd-shared.module';
import { SharedModule } from '@shared/shared.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
@NgModule({
  declarations: [BodypartsComponent, BodypartEditComponent],
  imports: [
    CommonModule,
    BodypartsRoutingModule,
    FdSharedModule,
    SharedModule,
    MatCheckboxModule,
  ]
})
export class BodypartsModule { }
