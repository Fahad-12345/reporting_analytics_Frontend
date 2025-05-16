import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FeescheduleRoutingModule } from './feeschedule-routing.module';
import { FeeScheduleComponentComponent } from './fee-schedule-component/fee-schedule-component.component';
import { AddFeeScheduleComponentComponent } from './add-fee-schedule-component/add-fee-schedule-component.component';
import {  PaginationModule } from 'ngx-bootstrap/pagination';
import { CollapseModule } from 'ngx-bootstrap/collapse';

import { MatDatepickerModule } from '@angular/material/datepicker';
import {  MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';

import { SharedModule } from '@appDir/shared/shared.module';
import { NgxCurrencyModule } from 'ngx-currency';
@NgModule({
	declarations: [FeeScheduleComponentComponent, AddFeeScheduleComponentComponent],
	imports: [
		CommonModule,
		FeescheduleRoutingModule,
		CollapseModule.forRoot(),
		MatDatepickerModule,
		SharedModule,
		PaginationModule.forRoot(),
		MatAutocompleteModule,
		MatSelectModule,
		NgxCurrencyModule
	],
	entryComponents: [
		AddFeeScheduleComponentComponent
	],
})
export class FeescheduleModule { }
