import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CaseInsuranceRoutingModule } from './case-insurance-routing.module';
import { CaseInsuranceComponent } from './case-insurance.component';
// import { FdSharedModule } from '../fd_shared/fd-shared.module';
import { SharedModule } from '@appDir/shared/shared.module';
import { FdSharedModule } from '@appDir/front-desk/fd_shared/fd-shared.module';

@NgModule({
	declarations: [CaseInsuranceComponent],
	imports: [
		CommonModule,
		CaseInsuranceRoutingModule,
		FdSharedModule,
		SharedModule,
	],
})
export class CaseInsuranceModule { }
