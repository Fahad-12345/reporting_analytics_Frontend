import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MasterPlanTypeRoutingModule } from './master-plan-type-routing.module';
import { PlantypeComponent } from './plantype/plantype.component';
import { SharedModule } from '@appDir/shared/shared.module';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { PaginationModule } from 'ngx-bootstrap/pagination';


@NgModule({
  declarations: [PlantypeComponent],
  imports: [
    CommonModule,
	MasterPlanTypeRoutingModule,
    SharedModule,
    PaginationModule.forRoot(),
	CollapseModule.forRoot(),
  ]
})
export class MasterPlanTypeModule { }
