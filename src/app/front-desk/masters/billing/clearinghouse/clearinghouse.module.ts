import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClearinghouseRoutingModule } from './clearinghouse-routing.module';
import { ClearinghouseComponent } from './clearinghouse.component';
import { SharedModule } from '@appDir/shared/shared.module';
import { ClearinghouseFormComponent } from './clearinghouse-form/clearinghouse-form.component';
import { AddUpdatePayersComponent } from './add-update-payers/add-update-payers.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { CollapseModule } from 'angular-bootstrap-md';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { CommaSeparatedValueFromArrPipe } from './CH-helpers/comma-separated-value-from-arr.pipe';
import { SelectDefaultPayerComponent } from './select-default-payer/select-default-payer.component';
@NgModule({
  declarations: [
    ClearinghouseComponent,
    ClearinghouseFormComponent,
    AddUpdatePayersComponent,
    SelectDefaultPayerComponent
  ],
  imports: [
    CommonModule,
    ClearinghouseRoutingModule,
    SharedModule,
    PaginationModule.forRoot(),
	  CollapseModule.forRoot(),
    ScrollToModule.forRoot(),
  ]
})
export class ClearinghouseModule { }
