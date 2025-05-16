import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
 import { PatientRoutingModule } from './patient-routing.module';
// import { FdSharedModule } from '../fd_shared/fd-shared.module';
import { PatientSummaryComponent } from './patient-summary/patient-summary.component';
 import { PatientListComponent } from './patient-listing/patient-list.component';
 import { PatientProfileComponent } from './patient-profile/patient-profile.component';
import { SharedModule } from '@appDir/shared/shared.module';
// import { NgProgressModule } from '@ngx-progressbar/core';
// import { NgProgressHttpModule } from '@ngx-progressbar/http';
// import { NgProgressRouterModule } from '@ngx-progressbar/router';
import { BusyLoaderModule } from '@appDir/shared/busy-loader/busy-loader.module';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { DynamicFormModule } from '@appDir/shared/dynamic-form/dynamic-form.module';
 import { PatientFormComponent } from './patient-form/patient-form.component';
import { PatientListingComponent } from '../fd_shared/components/patient-listing/patient-listing.component';
 import { CaseInfoEditComponent } from '../cases/create-case/components/case-info-edit/case-info-edit.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
 import { PatientPharmacyComponent } from './patient-pharmacy/patient-pharmacy.component';
// import { ErxUserModule } from '@appDir/erx/erx.module';
import { SignatureModule } from '@appDir/shared/signature/signature.module';
import { FdSharedModule } from '../fd_shared/fd-shared.module';
// import { SoftPatientVisitComponentModal } from '@appDir/shared/modules/doctor-calendar/modals/soft-patient-visit-modal/soft-patient-visit-modal.component';
//  import { SoftPatientModule } from '../soft-patient/soft-patient.module';
 import { CaseListModule } from '../cases/case-list/case-list.module';
import { SoftPatientModule } from '../soft-patient/soft-patient.module';
import { ErxUserModule } from '@appDir/erx/erx.module';
import { PatientCaseFlowModule } from '../caseflow-module/patient-case-flow/patient-case-flow.module';
@NgModule({
	declarations: [
		 PatientListComponent,
		  PatientSummaryComponent,
		PatientProfileComponent,
		PatientFormComponent,
		 CaseInfoEditComponent,
		 PatientListingComponent,
		PatientPharmacyComponent,
		// SoftPatientVisitComponentModal
	],
	imports: [
		CommonModule,
		PatientRoutingModule,
		 ErxUserModule,
		FdSharedModule,
		PatientCaseFlowModule,
		SharedModule,
		// NgProgressModule.forRoot(),
		// NgProgressHttpModule,
		// NgProgressRouterModule,
		BusyLoaderModule,
		CollapseModule.forRoot(),
		DynamicFormModule,	
		TabsModule,
		SignatureModule,
		CaseListModule,
		SoftPatientModule
	],
	exports: [
		PatientListComponent,

	],
	entryComponents:[
		// SoftPatientVisitComponentModal
	]
})
export class PatientModule { }
