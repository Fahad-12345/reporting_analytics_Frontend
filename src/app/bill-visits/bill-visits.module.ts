import { BillVistRoutingModule } from './bill-visits.routing';
import { BillingVisitComponent } from './components/bill-vists-component/bill-vists.component';
import { BillingModule } from './../front-desk/billing/billing.module';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '@appDir/shared/shared.module';
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
// import { JasperoAlertsModule } from '@jaspero/ng-alerts';
import { AclRedirection } from '@appDir/shared/services/acl-redirection.service';

import { AclService } from '../shared/services/acl.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { BusyLoaderModule } from '@appDir/shared/busy-loader/busy-loader.module';
import {  CollapseModule } from 'ngx-bootstrap/collapse';
import { TabsModule } from 'ngx-bootstrap/tabs';

import { ModalModule } from 'ngx-bootstrap/modal';	
@NgModule({
	declarations:[BillingVisitComponent],
	imports: [
		CommonModule,
		BillingModule,
		BillVistRoutingModule,
		SharedModule,
		ReactiveFormsModule,
		FormsModule,
		NgxDatatableModule, BusyLoaderModule,
		TabsModule.forRoot(),
		CollapseModule.forRoot(),
		ModalModule.forRoot(),
		
	], providers: [
		AclRedirection,
		AclService
	], exports: [], entryComponents: [BillingVisitComponent],
})
export class BillVistsModule { }
