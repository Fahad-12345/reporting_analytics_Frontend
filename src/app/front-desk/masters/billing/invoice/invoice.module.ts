import { SharedModule } from '@appDir/shared/shared.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InvoiceRoutingModule } from './invoice-routing.module';
import { InvoiceComponent } from './invoice.component';
import { InventoryListingComponent } from './inventory/inventory-listing/inventory-listing.component';
import { BusyLoaderModule } from '@appDir/shared/busy-loader/busy-loader.module';
import { NgbModalModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { AddUpdateInventoryFormComponent } from './inventory/inventory-listing/add-update-inventory-form/add-update-inventory-form.component';
import { TaxListingComponent } from './tax/tax-listing/tax-listing.component';
import { ShippingListingComponent } from './shipping/shipping-listing/shipping-listing.component';
import { AddUpdateShippingComponent } from './shipping/shipping-listing/add-update-shipping/add-update-shipping.component';
import { AddUpdatetaxComponent } from './tax/tax-listing/add-update-tax/add-update-tax.component';
import { InvoiceListingComponent } from './invoice/invoice-listing/invoice-listing.component';
import { InvoiceBuilderFormatPreviewComponent } from '../../builder-invoice/invoice-builder/invoice-builder-format-preview/invoice-builder-format-preview.component';
import { BuilderInvoiceModule } from '../../builder-invoice/builder-invoice.module';
import { NgxCurrencyModule } from 'ngx-currency';

@NgModule({
  declarations: [InvoiceComponent, InventoryListingComponent, AddUpdateInventoryFormComponent ,ShippingListingComponent, AddUpdateShippingComponent, TaxListingComponent,AddUpdatetaxComponent, InvoiceListingComponent],
  imports: [
    CommonModule,
    InvoiceRoutingModule,
    BusyLoaderModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    NgbModalModule,
    NgxDatatableModule,
    MatCheckboxModule,
    SharedModule,
    BuilderInvoiceModule,
    NgxCurrencyModule
  ],
  entryComponents:[
    AddUpdateInventoryFormComponent
  ]
})
export class InvoiceModule { }
