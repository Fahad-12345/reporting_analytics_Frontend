import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InvoiceRoutingModule } from './invoice-routing.module';
import { InvoiceFiltersComponent } from './shared/invoice-filters/invoice-filters.component';
import { InvoiceFormComponent } from './shared/invoice-form/invoice-form.component';
import { InvoiceFormSplitComponent } from './shared/invoice-form/invoice-form-split/invoice-form-split.component';
import { InvoiceSplitListingComponent } from './shared/invoice-split-listing/invoice-split-listing.component';
import { SharedModule } from '@appDir/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { JasperoAlertsModule } from '@jaspero/ng-alerts';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { BusyLoaderModule } from '@appDir/shared/busy-loader/busy-loader.module';
import { SignatureModule } from '@appDir/shared/signature/signature.module';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import {  ModalModule } from 'ngx-bootstrap/modal';
import {  TabsModule } from 'ngx-bootstrap/tabs';

import { NgxCurrencyModule } from 'ngx-currency';
import { MDService } from '@appDir/medical-doctor/services/md/medical-doctor.service';
import { AclRedirection } from '@appDir/shared/services/acl-redirection.service';
import { CommentsComponent } from './shared/invoice-split-listing/comments/comments.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { InvoiceFormatLoadComponent } from './shared/invoice-split-listing/invoice-format-load/invoice-format-load.component';
import { CommentsModalComponent } from '@appDir/shared/components/case-comments/case-comments.component';
import { InvoiceDetailShareableComponent } from './shared/invoice-detail-shareable/invoice-detail-shareable.component';
import { InvoicePaymentFormComponent } from './shared/invoice-payment-form/invoice-payment-form.component';
import { InvoicePaymentFormSplitComponent } from './shared/invoice-payment-form-split/invoice-payment-form-split.component';
import { PaymentModule } from '@appDir/payments/payment.module';
import { BillingModule } from '@appDir/front-desk/billing/billing.module';
import { BillDetailSharedbleComponent } from '@appDir/front-desk/billing/shared-components/bill-detail-sharedble/bill-detail-sharedble.component';
import { InvoicePdfViewComponent } from './shared/invoice-pdf-view/invoice-pdf-view.component';
import { ViewDocFileComponent } from './shared/invoice-pdf-view/view-doc-file/view-doc-file.component';
import { BuilderInvoiceModule } from '@appDir/front-desk/masters/builder-invoice/builder-invoice.module';

@NgModule({
	declarations: [InvoiceFiltersComponent, InvoiceFormComponent, InvoiceFormSplitComponent, InvoiceSplitListingComponent, CommentsComponent, InvoiceFormatLoadComponent, InvoiceDetailShareableComponent, InvoicePaymentFormComponent, InvoicePaymentFormSplitComponent, InvoicePdfViewComponent, ViewDocFileComponent],
	imports: [
		CommonModule,
		InvoiceRoutingModule,
		CommonModule,
		SharedModule,
		MatFormFieldModule,
        MatInputModule,
		ReactiveFormsModule,
		// JasperoConfirmationsModule.forRoot(),
		FormsModule,
		NgxDatatableModule, BusyLoaderModule, SignatureModule,
		TabsModule.forRoot(),
		CollapseModule.forRoot(),
		ModalModule.forRoot(),
		NgxCurrencyModule,
		PaymentModule,
		SharedModule,
		BuilderInvoiceModule
	],
	providers: [
		MDService,
		AclRedirection,
	],
	exports: [InvoicePdfViewComponent,InvoiceFormatLoadComponent,InvoiceFiltersComponent, InvoiceFormComponent, InvoiceSplitListingComponent]
})
export class InvoiceModule { }
