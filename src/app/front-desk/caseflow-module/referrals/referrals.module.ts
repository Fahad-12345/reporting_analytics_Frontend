import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReferralsRoutingModule } from './referrals-routing.module';
import { ReferralsComponent } from './referrals.component';
// import { FdSharedModule } from '../fd_shared/fd-shared.module';
import { ReferrEditComponent } from './components/referr-edit/referr-edit.component';
import { FdSharedModule } from '@appDir/front-desk/fd_shared/fd-shared.module';
import { ReferringFormComponent } from './components/referring-form/referring-form.component';
import { SharedModule } from '@appDir/shared/shared.module';
import { DynamicFormModule } from '@appDir/shared/dynamic-form/dynamic-form.module';
import { ReferralFormComponent } from './components/referral-form/referral-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';

@NgModule({
	declarations: [ReferralsComponent, ReferrEditComponent, ReferringFormComponent, ReferralFormComponent],
	imports: [
		CommonModule,
		ReferralsRoutingModule,
		DynamicFormModule,
		ReactiveFormsModule,
		PerfectScrollbarModule,
		SharedModule
	]
})
export class ReferralsModule { }
