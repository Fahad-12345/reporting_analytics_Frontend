import { NgModule } from '@angular/core';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SharedModule } from '@appDir/shared/shared.module';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { ReferringPhysicianComponent } from './referring-physician.component';
import { MasterReferringPhysicianRoutingModule } from './referring-physician.routing.module';
import { PracticeMenuSharedModule } from '../../practice-menu-shared/practice-menu-shared.module';

@NgModule({
	declarations: [ReferringPhysicianComponent],
	imports: [
		PracticeMenuSharedModule,
		PaginationModule,
		NgxDatatableModule,
		MasterReferringPhysicianRoutingModule,
		SharedModule,
		CollapseModule.forRoot()
	],

})
export class ReferringPhysicianModule { }
