import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HouseHoldInfoRoutingModule } from './house-hold-info-routing.module';
import { HouseHoldInfoComponent } from './house-hold-info.component';
import { FdSharedModule } from '@appDir/front-desk/fd_shared/fd-shared.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatCheckboxModule } from '@angular/material/checkbox';
// import { NgxMaskModule } from 'ngx-mask';
import { SharedModule } from '@appDir/shared/shared.module';
import { DynamicFormModule } from '@appDir/shared/dynamic-form/dynamic-form.module';

@NgModule({
  declarations: [HouseHoldInfoComponent],
  imports: [
    CommonModule,
    HouseHoldInfoRoutingModule,
    NgxDatatableModule,
    FdSharedModule,
    MatCheckboxModule,
    // NgxMaskModule.forRoot(),
    DynamicFormModule,
    SharedModule,
  ]
})
export class HouseHoldInfoModule { }
