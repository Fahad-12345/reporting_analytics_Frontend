import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PacketsRoutingModule } from './packets-routing.module';
import { PacketsComponent } from './component/packets/packets.component';
import { PacketsListComponent } from './component/packets-list/packets-list.component';
import { SharedModule } from '@appDir/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { BusyLoaderModule } from '@appDir/shared/busy-loader/busy-loader.module';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import {  ModalModule } from 'ngx-bootstrap/modal';
import {   TabsModule } from 'ngx-bootstrap/tabs';

import { NgxCurrencyModule } from 'ngx-currency';
import { MDService } from '@appDir/medical-doctor/services/md/medical-doctor.service';
import { AclRedirection } from '@appDir/shared/services/acl-redirection.service';

@NgModule({
  declarations: [PacketsComponent, PacketsListComponent],
  imports: [
    CommonModule,
    PacketsRoutingModule,
		SharedModule,
		ReactiveFormsModule,
		FormsModule,
		NgxDatatableModule, 
    BusyLoaderModule,
		TabsModule.forRoot(),
		CollapseModule.forRoot(),
		ModalModule.forRoot(),
		NgxCurrencyModule
  ],
  providers: [
		MDService,
		AclRedirection,
	]
})
export class PacketsModule { }
