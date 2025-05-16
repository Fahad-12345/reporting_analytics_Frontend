import { MatIconModule } from '@angular/material/icon';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BuilderInvoiceRoutingModule } from './builder-invoice-routing.module';
import { InvoiceBuilderComponent } from './invoice-builder/invoice-builder.component';
import { BusyLoaderModule } from '@appDir/shared/busy-loader/busy-loader.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModalModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { SharedModule } from '@appDir/shared/shared.module';
import { InvoiceBuilderFormatPreviewComponent } from './invoice-builder/invoice-builder-format-preview/invoice-builder-format-preview.component';
import { NgxCurrencyModule } from 'ngx-currency';
import { InvoiceBuilderService } from './invoice-builder.service';
import { GetMaximumQuantityDirective } from './get-maximum-quantity.directive';
import { RecipientsLocationsComponent } from './recipients-locations/recipients-locations.component';


@NgModule({
  declarations: [InvoiceBuilderComponent, InvoiceBuilderFormatPreviewComponent,GetMaximumQuantityDirective, RecipientsLocationsComponent],
  imports: [
    CommonModule,
    BuilderInvoiceRoutingModule,
    BusyLoaderModule,
    FormsModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
    NgbModule,
    NgbModalModule,
    NgxDatatableModule,
    MatCheckboxModule,
    MatIconModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatSelectModule,
    SharedModule,
    NgxCurrencyModule
  ],
  exports:[
    InvoiceBuilderFormatPreviewComponent,
    InvoiceBuilderComponent
  ],
  providers: [
    InvoiceBuilderService
	],
  entryComponents:[
  ]
})
export class BuilderInvoiceModule { }
