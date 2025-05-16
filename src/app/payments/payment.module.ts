import { NgxCurrencyModule } from 'ngx-currency';

import { PaymentRoutingModule } from './payment.routing';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '@appDir/shared/shared.module';
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';

import { MDService } from '@appDir/medical-doctor/services/md/medical-doctor.service';
import { AclRedirection } from '@appDir/shared/services/acl-redirection.service';

import { AclService } from '../shared/services/acl.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { BusyLoaderModule } from '@appDir/shared/busy-loader/busy-loader.module';
import { SignatureModule } from '@appDir/shared/signature/signature.module';
import {  CollapseModule } from 'ngx-bootstrap/collapse';
import { TabsModule } from 'ngx-bootstrap/tabs';

import { PaymentFormComponent } from './shared/payment-form/payment-form/payment-form.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PaymentComponent } from './payment-component/payment-component';
import { PaymentSplitListComponent } from './shared/payment-split-listing/payment-split-listing.component';
import { PaymentFilterComponent } from './shared/payment-filters/payment-filter.component';
import { PaymentFormSplitComponent } from './shared/payment-form/payment-form-split/payment-form-split.component';
@NgModule({
	declarations:[PaymentFormComponent,PaymentComponent,PaymentSplitListComponent, PaymentFilterComponent, PaymentFormSplitComponent],
	imports: [
		CommonModule,
		SharedModule,
		ReactiveFormsModule,
		PaymentRoutingModule,
		FormsModule,
		NgxDatatableModule, BusyLoaderModule, SignatureModule,
		TabsModule.forRoot(),
		CollapseModule.forRoot(),
		ModalModule.forRoot(),
		NgxCurrencyModule
		
	], providers: [
		MDService,
		AclRedirection,
		AclService
	], exports: [PaymentSplitListComponent,PaymentFormComponent, PaymentFilterComponent], entryComponents: [],
})
export class PaymentModule { }
