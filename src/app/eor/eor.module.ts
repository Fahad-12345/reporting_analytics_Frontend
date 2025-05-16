import { EorRoutingModule } from './eor.routing';
import { EorFilterComponent } from './shared/eor-filters/eor-filter.component';
import { EorFormComponent } from './shared/eor-form/eor-form/eor-form.component';
import { EorSplitListComponent } from './shared/eor-split-listing/eor-split-listing.component';

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
import { CollapseModule } from 'ngx-bootstrap/collapse';

import { ModalModule } from 'ngx-bootstrap/modal';
import { EorFormSplitComponent } from './shared/eor-form/eor-form-split/eor-form-split.component';
@NgModule({
	declarations:[EorFormComponent,EorSplitListComponent, EorFormSplitComponent],
	imports: [
		CommonModule,
		SharedModule,
		ReactiveFormsModule,
		EorRoutingModule,
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
	], exports: [EorSplitListComponent,EorFormComponent], entryComponents: [],
})
export class EorModule { }
