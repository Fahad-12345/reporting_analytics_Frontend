import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
	FormsModule,
	ReactiveFormsModule,
} from '@angular/forms';
import {
	MatDatepickerModule,
} from '@angular/material/datepicker';
import {
	MatIconModule,
} from '@angular/material/icon';
import {
	MatInputModule,
} from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { RouterModule } from '@angular/router';

import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';

import {
	DynamicCheckboxesComponent,
} from '@appDir/medical-doctor/md-shared/common/dynamic-checkboxes/dynamic-checkboxes.component';
import {
	DynamicRadiobuttonsComponent,
} from '@appDir/medical-doctor/md-shared/common/dynamic-radiobuttons/dynamic-radiobuttons.component';
import { BusyLoaderModule } from '@appDir/shared/busy-loader/busy-loader.module';
import { SharedModule } from '@appDir/shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import {
	DescriptionComponent,
} from './components/current-complaints/description/description.component';
import {
	MdDiagnosticCodesComponent,
} from './components/md-diagnostic-codes/md-diagnostic-codes.component';
import { MdSubTabComponent } from './components/md-sub-tab/md-sub-tab.component';
// import { InitialevaluationComponent } from './components/initialevaluation/initialevaluation.component';
import { PastMedHistoryComponent } from './components/past-med-history/past-med-history.component';
import {
	SharedClinicalBioelectronicMedicineComponent,
} from './components/referral-forms/shared-clinical-bioelectronic-medicine/shared-clinical-bioelectronic-medicine.component';
import {
	SharedHbotNotesComponent,
} from './components/referral-forms/shared-hbot-notes/shared-hbot-notes.component';
import { ReferralsHeaderComponent } from './components/referrals-header/referrals-header.component';
import {
	SharedPhysicalExaminationComponent,
} from './components/shared-physical-examination/shared-physical-examination.component';
import {
	SharedPhysicalExamination2Component,
} from './components/shared-physical-examination2/shared-physical-examination2.component';
import {
	SharedPlanOfCareContComponent,
} from './components/shared-plan-of-care-cont/shared-plan-of-care-cont.component';
import {
	SharedPlanOfCareComponent,
} from './components/shared-plan-of-care/shared-plan-of-care.component';

@NgModule({
	declarations: [
		DescriptionComponent,
		// InitialevaluationComponent,
		PastMedHistoryComponent,
		SharedClinicalBioelectronicMedicineComponent,
		SharedHbotNotesComponent,
		SharedPhysicalExaminationComponent,
		SharedPhysicalExamination2Component,
		SharedPlanOfCareComponent,
		SharedPlanOfCareContComponent,
		ReferralsHeaderComponent,
		DynamicCheckboxesComponent,
		DynamicRadiobuttonsComponent,
		MdDiagnosticCodesComponent,
		MdSubTabComponent,
		
	],
	imports: [
		PerfectScrollbarModule,
		MatChipsModule,
		CommonModule,
		FormsModule,
		MatInputModule,
		ReactiveFormsModule,
		NgbModule,
		NgxDatatableModule,
		SharedModule,
		RouterModule,
		ScrollToModule.forRoot(),
		MatDatepickerModule,
		NgMultiSelectDropDownModule,
		BusyLoaderModule,
		MatAutocompleteModule,
		MatIconModule,
		// SharedModule,
	],
	exports: [
		DescriptionComponent,
		PerfectScrollbarModule,
		// InitialevaluationComponent,
		PastMedHistoryComponent,
		SharedClinicalBioelectronicMedicineComponent,
		SharedHbotNotesComponent,
		SharedPhysicalExaminationComponent,
		SharedPhysicalExamination2Component,
		SharedPlanOfCareComponent,
		SharedPlanOfCareContComponent,
		ReferralsHeaderComponent,
		MdDiagnosticCodesComponent,
		MdSubTabComponent,
		
	],
})
export class MdSharedModule {}
