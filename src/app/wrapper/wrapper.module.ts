import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WrapperRoutingModule } from './wrapper-routing.module';
import { WrapperComponent } from './wrapper.component';
import { FrontDeskModule } from '@appDir/front-desk/front-desk.module';

@NgModule({
  declarations: [WrapperComponent],
  imports: [
    CommonModule,
     FrontDeskModule,
    WrapperRoutingModule
  ]
})
export class WrapperModule { }
