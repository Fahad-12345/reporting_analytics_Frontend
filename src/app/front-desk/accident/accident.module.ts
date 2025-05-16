import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccidentRoutingModule } from './accident-routing.module';
import { AccidentComponent } from './accident.component';
import { FdSharedModule } from '../fd_shared/fd-shared.module';
import { AccidentEditComponent } from './accident-edit/accident-edit.component';

@NgModule({
  declarations: [AccidentComponent, AccidentEditComponent],
  imports: [
    CommonModule,
    AccidentRoutingModule,
    FdSharedModule
  ]
})
export class AccidentModule { }
