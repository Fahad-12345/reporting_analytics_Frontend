import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PracticeMenuComponent } from '../practice-menu/practice-menu.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FdSharedModule } from '@appDir/front-desk/fd_shared/fd-shared.module';
import { SharedModule } from '@appDir/shared/shared.module';
import { MastersSharedModule } from '../../shared/masters-shared.module';
import { BusyLoaderModule } from '@appDir/shared/busy-loader/busy-loader.module';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { SignatureModule } from '@appDir/shared/signature/signature.module';

@NgModule({
  declarations: [PracticeMenuComponent],
  imports: [
	CommonModule,
	FormsModule,
	ReactiveFormsModule,
	NgMultiSelectDropDownModule.forRoot(),
	NgxMaskDirective, NgxMaskPipe,
	NgbModule,
	FdSharedModule,
	SharedModule,
	MastersSharedModule,
	BusyLoaderModule,
	CollapseModule.forRoot(),
	SignatureModule
  ],
  exports:[PracticeMenuComponent],
  providers: [
	provideNgxMask(),

],
})
export class PracticeMenuSharedModule { }
