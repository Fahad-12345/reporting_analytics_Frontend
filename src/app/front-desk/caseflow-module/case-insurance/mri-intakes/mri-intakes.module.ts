import { MRIIntake5FormComponent } from './components/mri-intake-5-component/mri-intake-5-component';
import { MRIIntake2FormComponent } from './components/mri-intake-2-component/mri-intake-2-component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MRIIntakesRoutingModule } from './mri-intakes-routing.module';
import { MriIntakesComponent } from './mri-intakes.component';
import { MRIIntake1FormComponent } from './components/mri-intake1-Form/mri-intake1-Form.component';
import { DynamicFormModule } from '@appDir/shared/dynamic-form/dynamic-form.module';
import { MriIntake6FormComponent } from './components/mri-intake6-form/mri-intake6-form.component';
import { PatientsRadiologyMontageComponent } from './components/patients-radiology-montage/patients-radiology-montage.component';
import { AddPriorSurgeryFormComponent } from './components/mri-intake1-Form/components/prior-surgery/add-prior-surgery-Form/add-prior-surgery-Form.componet';
import { AddPriorDiagnosticImagingFormComponent } from './components/mri-intake1-Form/components/prior-diagnostic-imaging/add-prior-diagnostic-imaging-Form/add-prior-diagnostic-imaging-Form.componet';
import { MRIIntake3FormComponent } from './components/mri-intake3-Form/mri-intake3-Form.component';
import { PriorSurgeryListingComponent } from './components/mri-intake1-Form/components/prior-surgery/prior-surgery-listing/prior-surgery-listing.componet';
import { FormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SharedModule } from '@appDir/shared/shared.module';
import { MedicationComponent } from './components/mri-intake-2-component/components/medication/medication.component';
import { PriorDiagnosticImagingListingComponent } from './components/mri-intake1-Form/components/prior-diagnostic-imaging/prior-diagnostic-imaging-listing/prior-diagnostic-imaging-listing.component';
import { MriIntake4ComponentComponent } from './components/mri-intake4-component/mri-intake4-component.component';
import { MedicationsListingComponent } from './components/mri-intake-2-component/components/medications-listing/medications-listing.component';


@NgModule({
	declarations: [
		MriIntakesComponent,
		MRIIntake1FormComponent,
		MriIntake6FormComponent,
		MRIIntake2FormComponent,
		PatientsRadiologyMontageComponent,
		AddPriorSurgeryFormComponent,
		AddPriorDiagnosticImagingFormComponent,
		MRIIntake5FormComponent,
		MRIIntake3FormComponent,
		PriorSurgeryListingComponent,
		MedicationComponent,
		PriorDiagnosticImagingListingComponent,
		MriIntake4ComponentComponent,
		MedicationsListingComponent
	],
	imports: [CommonModule, SharedModule,NgxDatatableModule,MRIIntakesRoutingModule, FormsModule,DynamicFormModule],
	entryComponents: [AddPriorSurgeryFormComponent, AddPriorDiagnosticImagingFormComponent,PriorSurgeryListingComponent,MedicationComponent],
})
export class MRIIntakesModule {}
