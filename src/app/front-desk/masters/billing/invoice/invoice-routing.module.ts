import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InventoryListingComponent } from './inventory/inventory-listing/inventory-listing.component';
import { InvoiceComponent } from './invoice.component';
import { InvoiceListingComponent } from './invoice/invoice-listing/invoice-listing.component';
import { ShippingListingComponent } from './shipping/shipping-listing/shipping-listing.component';
import { TaxListingComponent } from './tax/tax-listing/tax-listing.component';

const routes: Routes = [
  {
    path: '', component: InvoiceComponent,
    children: [

		// {
		// 	path: '',
		//   },
    //   { path: '', pathMatch: 'full', redirectTo: 'inventory' },
      {
        path: 'inventory',
        component: InventoryListingComponent

      },
      {
        path: 'shipping',
        component: ShippingListingComponent

      },
      {
        path: 'tax',
        component: TaxListingComponent

      },
      {
        path: 'invoice-format',
        component: InvoiceListingComponent

      },
      
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InvoiceRoutingModule { }
