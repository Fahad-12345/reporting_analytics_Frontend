import { ErrorMessageModalBillingComponent } from './shared-components/error-message-componnet/error-meesage-component';
import { BillSpecailityListingComponent } from './bill-listing-speciality/bill-listing-specaility.component';
 import { VerificationModule } from './../../verification/verification.module';
import { EorModule } from './../../eor/eor.module';
import { DenialModule } from './../../denial/denial.module';
import { TabsModule } from 'ngx-bootstrap/tabs';
 import { PaymentModule } from './../../payments/payment.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BillingRoutingModule } from './billing-routing.module';
import { BillingComponent } from './billing.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@appDir/shared/shared.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';

import { BusyLoaderModule } from '@appDir/shared/busy-loader/busy-loader.module';
import { NgxFileDropModule  } from 'ngx-file-drop';
import { TagInputModule } from 'ngx-chips';
import { CreateBillModalComponent } from './shared-components/create-bill-modal/create-bill-modal.component';
import { BillingDocumentListingComponent } from './shared-components/billing-document-listing/billing-document-listing.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { BillListingComponent } from './bill-listing/bill-listing.component';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BillDetailsComponent } from './shared-components/bill-details/bill-details.component';
import { PdfViewerModule } from '@appDir/shared/pdf-viewer/pdf-viewer.module';
import {MatRadioModule} from '@angular/material/radio';
import { BillDetailSharedbleComponent } from './shared-components/bill-detail-sharedble/bill-detail-sharedble.component';
import { NgxCurrencyModule } from 'ngx-currency';
import { BillListingSpecialityFilterComponent } from './bill-listing-speciality-filter/bill-listing-speciality-filter.component';
import { BillistingFilterComponent } from './billisting-filter/billisting-filter.component';
import { BulkEditICD10CodesModalComponent } from './shared-components/bulk-edit-icd10-codes-modal/bulk-edit-icd10-codes-modal.component';
import { BulkEditICD10CodesVisitListingComponent } from './shared-components/bulk-edit-icd10-codes-modal/component/bulk-edit-icd10-codes-visit-listing/bulk-edit-icd10-codes-visit-listing.component';
import { DeleteReasonBillingComponentComponent } from './shared-components/delete-reason-billing-component/delete-reason-billing-component.component';
import { InvoiceModule } from '@appDir/invoice/invoice.module';
import { BuilderInvoiceModule } from '../masters/builder-invoice/builder-invoice.module';
import { BillStatsComponent } from './shared-components/bill-stats-component/bill-stats-component';
import { FrontDeskModule } from '../front-desk.module';
import { BillingService } from './service/billing.service';


// import {} from './'
@NgModule({
	declarations: [BillingComponent,
		BillSpecailityListingComponent,
		ErrorMessageModalBillingComponent,
		BillStatsComponent,
		CreateBillModalComponent, BillingDocumentListingComponent, BillListingComponent, BillDetailsComponent ,BillDetailSharedbleComponent, BillListingSpecialityFilterComponent, BillistingFilterComponent, BulkEditICD10CodesModalComponent, BulkEditICD10CodesVisitListingComponent, DeleteReasonBillingComponentComponent],
	imports: [
		CommonModule,
		BillingRoutingModule,
		PaymentModule,
		VerificationModule,
		EorModule,
		DenialModule,
		NgxDatatableModule,
		FormsModule,
		ReactiveFormsModule,
		SharedModule,
		MatCheckboxModule,
		BusyLoaderModule,
		NgxFileDropModule,
		MatDatepickerModule,
		TagInputModule,
		FrontDeskModule,
		NgMultiSelectDropDownModule.forRoot(),
		CollapseModule.forRoot(),
		PdfViewerModule,
		MatRadioModule,
		TabsModule.forRoot(),
		NgxCurrencyModule,
		InvoiceModule,
		BuilderInvoiceModule
	],
	providers:[BillingService],
	exports: [
		BillingComponent,
		BillListingComponent, 
		BillSpecailityListingComponent,
		BillListingSpecialityFilterComponent,
		DeleteReasonBillingComponentComponent
		// VisitDocumentListingComponent, VisitUploadDocumentsComponent
	], entryComponents: [CreateBillModalComponent, BulkEditICD10CodesModalComponent,DeleteReasonBillingComponentComponent]
})
export class BillingModule { }
