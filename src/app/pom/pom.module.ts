import { PomComponent } from './component/pom-component/pom-component';
import { PomRoutingModule } from './pom.routing.module';
import { PomSplitListComponent } from './component/pom-component-list/pom-component-list';
import { NgxCurrencyModule } from 'ngx-currency';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '@appDir/shared/shared.module';
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MDService } from '@appDir/medical-doctor/services/md/medical-doctor.service';
import { AclRedirection } from '@appDir/shared/services/acl-redirection.service';
import { TagInputModule } from 'ngx-chips';
import { AclService } from '../shared/services/acl.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { BusyLoaderModule } from '@appDir/shared/busy-loader/busy-loader.module';
import { SignatureModule } from '@appDir/shared/signature/signature.module';
import { TabsModule,  } from 'ngx-bootstrap/tabs';
import {  CollapseModule } from 'ngx-bootstrap/collapse';

import { ModalModule } from 'ngx-bootstrap/modal';
@NgModule({
	declarations:[PomSplitListComponent,PomComponent],
	imports: [
		CommonModule,
		SharedModule,
		ReactiveFormsModule,
		// JasperoConfirmationsModule.forRoot(),
		FormsModule,
		NgxDatatableModule, BusyLoaderModule, SignatureModule,
		TabsModule.forRoot(),
		CollapseModule.forRoot(),
		ModalModule.forRoot(),
		NgxCurrencyModule, 
		PomRoutingModule,
		TagInputModule
	], providers: [
		MDService,
		AclRedirection,
		AclService
	], exports: [PomSplitListComponent], entryComponents: [PomComponent],
})
export class PomBillModule { }
