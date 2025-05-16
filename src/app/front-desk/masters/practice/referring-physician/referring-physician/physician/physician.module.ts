import { PhysicianComponent } from './physician/physician.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhysicianRoutingModule } from './physician-routing.module';
import { PhysicianFilterComponent } from './physician-filter/physician-filter.component';
import { PhysicianListComponent } from './physician-list/physician-list.component';
import { PhysicianAddEditComponent } from './physician-add-edit/physician-add-edit.component';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BusyLoaderModule } from '@appDir/shared/busy-loader/busy-loader.module';
import { SharedModule } from '@appDir/shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
	declarations: [
		PhysicianComponent,
		PhysicianFilterComponent,
		PhysicianListComponent,
		PhysicianAddEditComponent,
	],
	imports: [
		CommonModule,
		PhysicianRoutingModule,
		FormsModule,
		ReactiveFormsModule,
		NgxDatatableModule,
		NgbModule,
		SharedModule,
		BusyLoaderModule,
		CollapseModule.forRoot(),
	],
})
export class PhysicianModule {}
