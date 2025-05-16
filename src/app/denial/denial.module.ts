import { DenialSplitListComponent } from './shared/denial-split-listing/denial-split-listing.component';
import { DenialRoutingModule } from './denial.routing';
import { DenialFormComponent } from './shared/denial-form/denial-form/denial-form.component';
import { DenialFilterComponent } from './shared/denial-filters/denial-filter.component';
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
import { TabsModule} from 'ngx-bootstrap/tabs';
import {  CollapseModule } from 'ngx-bootstrap/collapse';

import { ModalModule } from 'ngx-bootstrap/modal';
import { DenialFormSplitComponent } from './shared/denial-form/denial-form-split/denial-form-split.component';
@NgModule({
	declarations:[DenialFilterComponent,DenialFormComponent,DenialSplitListComponent, DenialFormSplitComponent],
	imports: [
		CommonModule,
		SharedModule,
		ReactiveFormsModule,
		DenialRoutingModule,
		// JasperoConfirmationsModule.forRoot(),
		// JasperoAlertsModule.forRoot(),
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
	], exports: [DenialFilterComponent,DenialSplitListComponent,DenialFormComponent], entryComponents: [],
})
export class DenialModule { }
