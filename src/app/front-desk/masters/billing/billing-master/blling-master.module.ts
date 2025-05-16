import { BillVerifcationStatusComponent } from './verification-status/verification.status.component';
import { BillDenialStatusComponent } from './denial-status/denial.status.component';
import { BillEORStatusComponent } from './eor-status/eor.status.component';
import { EORTypeComponent } from './eor-type/eor-type.component';
import { PaymentActionTypeComponent } from './payment-action-type/payment-action.component';
import { BillPaymentStatusComponent } from './payment-status/payment.status.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { BllingMasterRoutingModule } from './blling-master-routing.module';
import { BillingMasterComponent } from './billing-master.component';
import { PaymentTypeComponent } from './payment-type/payment-type.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { VerificationTypeComponent } from './verification-type/verification-type.component';
import { DenialTypeComponent } from './denial-type/denial-type.component';
import { PaidByComponent } from './paid-by/paid-by.component';
import { PlaceOfServiceComponent } from './place-of-service/place-of-service.component';
import { ModifiersComponent } from './modifiers/modifiers.component';
import { CaseStatusComponent } from './case-status/case-status.component';
import { RegionComponent } from './region/region.component';
import { SharedModule } from '@appDir/shared/shared.module';
import { BusyLoaderModule } from '@appDir/shared/busy-loader/busy-loader.module';
import { BillingtitleComponent } from './billingtitle/billingtitle.component';
import { BillingEmploymentTypeComponent } from './billing-employment-type/billing-employment-type.component';
import { PicklistcategoryComponent } from './picklistcategory/picklistcategory.component';
import { BillStatusComponent } from './bill-status/bill-status.component';

@NgModule({
  declarations: [
    BillingMasterComponent,
    PaymentTypeComponent,
    VerificationTypeComponent,
    DenialTypeComponent,
    PaidByComponent,
    PlaceOfServiceComponent,
    ModifiersComponent,
    CaseStatusComponent,
    RegionComponent,
    BillingtitleComponent,
    BillingEmploymentTypeComponent,
    PicklistcategoryComponent,
	BillStatusComponent,
	BillPaymentStatusComponent,
	BillEORStatusComponent,
	BillVerifcationStatusComponent,
	BillDenialStatusComponent,
	PaymentActionTypeComponent,
	EORTypeComponent
  ],
  imports: [
    CommonModule,
    BllingMasterRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    NgbModule,
    NgMultiSelectDropDownModule,
    PaginationModule,
    NgxDatatableModule,
    SharedModule,
    BusyLoaderModule
  ]
})
export class BllingMasterModule { }
