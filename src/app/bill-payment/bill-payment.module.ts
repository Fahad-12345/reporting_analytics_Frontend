import { BillingSpecalityComponent } from './bill-specality/bill-specality.component';
import { BillingModule } from './../front-desk/billing/billing.module';
import { BillingBulkComponent } from './components/bill-payment.component';
import { BillPaymentRoutingModule } from './bill-payment.routing';


import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '@appDir/shared/shared.module';
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
// import { JasperoAlero/ng-alerts';rtsModule } from '@jaspe
import { MDService } from '@appDir/medical-doctor/services/md/medical-doctor.service';
import { AclRedirection } from '@appDir/shared/services/acl-redirection.service';

import { AclService } from '../shared/services/acl.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { BusyLoaderModule } from '@appDir/shared/busy-loader/busy-loader.module';
import { SignatureModule } from '@appDir/shared/signature/signature.module';
import { TabsModule } from 'ngx-bootstrap/tabs';
import {  CollapseModule } from 'ngx-bootstrap/collapse';

import { ModalModule } from 'ngx-bootstrap/modal';	
@NgModule({
	declarations:[BillingBulkComponent, BillingSpecalityComponent],
	imports: [
		CommonModule,
		BillingModule,
		BillPaymentRoutingModule,
		SharedModule,
		ReactiveFormsModule,
		// JasperoConfirmationsModule.forRoot(),
		// JasperoAlertsModule.forRoot(),
		FormsModule,
		NgxDatatableModule, BusyLoaderModule, SignatureModule,
		TabsModule.forRoot(),
		CollapseModule.forRoot(),
		ModalModule.forRoot(),
		
	], providers: [
		MDService,
		AclRedirection,
		AclService
	], exports: [BillingBulkComponent], entryComponents: [BillingBulkComponent],
})
export class BillPaymentModule { }
