import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AttorneyRoutingModule } from './attorney-routing.module';
import { AttorneyEditComponent } from './attorney-edit/attorney-edit.component';
import { FdSharedModule } from '../fd_shared/fd-shared.module';
import { AttorneyComponent } from './attorney.component';

@NgModule({
  declarations: [AttorneyComponent,AttorneyEditComponent],
  imports: [
    CommonModule,
    AttorneyRoutingModule,
    FdSharedModule
  ]
})
export class AttorneyModule { }
