import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MasterAdjusterRoutingModule } from './master-adjuster-routing.module';
import { SharedModule } from '@appDir/shared/shared.module';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { CollapseModule } from 'ngx-bootstrap/collapse';

import { AdjusterInformationComponent } from './adjuster-information/adjuster-information.component';
import { AdjusterInformationModalComponentComponent } from './adjuster-information-modal-component/adjuster-information-modal-component.component';

@NgModule({
  declarations: [AdjusterInformationComponent,AdjusterInformationModalComponentComponent],
  imports: [
    CommonModule,
	MasterAdjusterRoutingModule,
	SharedModule,
    PaginationModule.forRoot(),
	CollapseModule.forRoot(),
  ],
  entryComponents: [
	AdjusterInformationModalComponentComponent
	],
})
export class MasterAdjusterModule { }
