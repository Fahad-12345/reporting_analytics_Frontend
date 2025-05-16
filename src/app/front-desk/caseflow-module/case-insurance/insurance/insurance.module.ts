import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InsuranceRoutingModule } from './insurance-routing.module';
import { InsuranceComponent } from './insurance.component';
import { FdSharedModule } from '@appDir/front-desk/fd_shared/fd-shared.module';
import { DynamicFormModule } from '@appDir/shared/dynamic-form/dynamic-form.module';
import { ReactiveFormsModule } from '@angular/forms';
import { HealthInsuranceFormComponent } from './components/health-insurance-form/health-insurance-form.component';
import { InsuranceFormComponent } from './components/insurance-form/insurance-form.component';
import { Nf2FormComponent } from './components/nf2-form/nf2-form.component';
import { EnvelopFormComponent } from './components/envelop-form/envelop-form.component';
import { SelectPayerInfoComponent } from './components/select-payer-info/select-payer-info.component';
import { SharedModule } from '@appDir/shared/shared.module';

@NgModule({
	declarations: [InsuranceComponent, HealthInsuranceFormComponent, InsuranceFormComponent, Nf2FormComponent, EnvelopFormComponent, SelectPayerInfoComponent],
	imports: [
		CommonModule,
		InsuranceRoutingModule,
		DynamicFormModule,
		ReactiveFormsModule,
		SharedModule
		// FdSharedModule
	]
})
export class InsuranceModule { }
