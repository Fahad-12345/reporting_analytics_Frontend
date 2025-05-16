import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
	FormsModule,
	ReactiveFormsModule,
} from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { TabsModule } from 'ngx-bootstrap/tabs';

import { SharedModule } from '@shared/shared.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { HomeComponent } from './component/home/home.component';
import { CustomizeComponent } from './customize.component';
//shared modules
//routing
import { CustomizationComponent } from './modals/customization/customization.component';
import { CusotmoizeRoutingModule } from './customize.routing';

// import { HeaderModule } from '../header/header.module';
@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		// HeaderModule,
		TabsModule.forRoot(),

		NgxDatatableModule,
		MatCheckboxModule,
		CusotmoizeRoutingModule,
		SharedModule,
	],
	exports: [CustomizeComponent],
	declarations: [CustomizeComponent, CustomizationComponent, HomeComponent],
	entryComponents: [CustomizationComponent],
})
export class CustomizeModule {}
