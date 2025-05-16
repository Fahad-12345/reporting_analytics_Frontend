import { VerificationSentSplitListComponent } from './verification-sent-list/verification-sent-listing.component';
import { VerificationFilterComponent } from './shared/verification-filters/verification-filter.component';
import { VerificationFormComponent } from './shared/verification-form/verification-form/verification-form.component';
import { VerificationFormSplitComponent } from './shared/verification-form/verification-form-split/verification-form-split.component';
import { VerificationSplitListComponent } from './shared/verification-split-listing/verification-split-listing.component';
import { NgxCurrencyModule } from 'ngx-currency';
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
import { TabsModule } from 'ngx-bootstrap/tabs';
import {  CollapseModule } from 'ngx-bootstrap/collapse';

import { ModalModule } from 'ngx-bootstrap/modal';
import { VerificationRoutingModule } from './verification.routing';
import { VerificationFormSentComponent } from './shared/verification-form/verification-form-sent/verification-form-sent.component';
import { VerificationFilterListingViewComponent } from './verification-filter-listing-view/verification-filter-listing-view.component';
import { ReplyVerificationComponent } from './shared/reply-verification/reply-verification.component';
@NgModule({
	declarations: [
		VerificationSentSplitListComponent,
		VerificationSplitListComponent,
		VerificationFormSplitComponent,
		VerificationFormComponent,
		VerificationFilterComponent,
		VerificationFormSentComponent,
		VerificationFilterListingViewComponent,
  		ReplyVerificationComponent,
	],
	imports: [
		CommonModule,
		SharedModule,
		ReactiveFormsModule,
		VerificationRoutingModule,
		FormsModule,
		NgxDatatableModule,
		BusyLoaderModule,
		SignatureModule,
		TabsModule.forRoot(),
		CollapseModule.forRoot(),
		ModalModule.forRoot(),
		NgxCurrencyModule,
	],
	providers: [MDService, AclRedirection, AclService],
	exports: [
		VerificationSentSplitListComponent,
		VerificationSplitListComponent,
		VerificationFormSplitComponent,
		VerificationFormComponent,
		VerificationFormSentComponent,
		VerificationFilterListingViewComponent,
		ReplyVerificationComponent
	],
	entryComponents: [],
})
export class VerificationModule {}
