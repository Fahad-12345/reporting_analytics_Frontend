
// import 'flatpickr/dist/flatpickr.css'; // you may need to adjust the css import depending on your build tool

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
	FormsModule,
	ReactiveFormsModule,
} from '@angular/forms';
import {
	MatCheckboxModule,
} from '@angular/material/checkbox';
import {
	MatDatepickerModule,
} from '@angular/material/datepicker';
import {
	MatProgressBarModule,
} from '@angular/material/progress-bar';
import {
	MatSelectModule,
} from '@angular/material/select';
import { RouterModule } from '@angular/router';

import {
	CalendarModule,
	DateAdapter,
} from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { FlatpickrModule } from 'angularx-flatpickr';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
// import {
// 	OwlDateTimeModule,
// 	OwlNativeDateTimeModule,
// } from 'ng-pick-datetime';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TagInputModule } from 'ngx-chips';
import { NgxFileDropModule  } from 'ngx-file-drop';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';

import { PerfectScrollbarModule } from 'ngx-om-perfect-scrollbar';
import { NgProgressModule } from 'ngx-progressbar';
import { ToastrService } from 'ngx-toastr';

// import { AgmCoreModule } from '@agm/core';
import { BusyLoaderModule } from '@appDir/shared/busy-loader/busy-loader.module';
import { DynamicFormModule } from '@appDir/shared/dynamic-form/dynamic-form.module';
import { SignatureModule } from '@appDir/shared/signature/signature.module';
import {
	NgbModalModule,
	NgbModule,
} from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '@shared/shared.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TimePickerAllModule } from '@syncfusion/ej2-angular-calendars';

import {
	CreateCaseFormComponent,
} from '../cases/create-case/components/create-case-form/create-case-form.component';
import { NumberDirective } from '../masters/billing/codes/directives/numbers-only.directive';
import { MastersSharedModule } from '../masters/shared/masters-shared.module';
import { AccidentFormComponent } from './components/accident-form/accident-form.component';
import {
	AdvertisementFormComponent,
} from './components/advertisement-form/advertisement-form.component';
import { AttorneyListingComponent } from './components/attorney-listing/attorney-listing.component';
import { BodypartsFormComponent } from './components/bodyparts-form/bodyparts-form.component';
import { BodypartsFormService } from './components/bodyparts-form/bodyparts-form.service';
import {
	CaseLeftSidebarComponent,
} from './components/case-left-sidebar/case-left-sidebar.component';
import { DoctorsFormComponent } from './components/doctors-form/doctors-form.component';
import { DoctorsListingComponent } from './components/doctors-listing/doctors-listing.component';
import { DocumentFormComponent } from './components/document-form/document-form.component';
import { HouseholdFormComponent } from './components/household-form/household-form.component';
import {
	AttorneyMasterFormComponent,
} from './components/masters/attorney-master-form/attorney-master-form.component';
import { HospitalFormComponent } from './components/masters/hospital-form/hospital-form.component';
import {
	HospitalListingComponent,
} from './components/masters/hospital-listing/hospital-listing.component';
import {
	InsuranceListingComponent,
} from './components/masters/insurance-listing/insurance-listing.component';
import {
	InsuranceMasterFormComponent,
} from './components/masters/insurance-master-form/insurance-master-form.component';
import { ProviderFormComponent } from './components/masters/provider-form/provider-form.component';
import {
	MedicalIdentifierFormComponent,
} from './components/medical-identifier-form/medical-identifier-form.component';
import { MriIntake1FormComponent } from './components/mri-intake1-form/mri-intake1-form.component';
import { MriIntake2FormComponent } from './components/mri-intake2-form/mri-intake2-form.component';
import {
	MriSymptomsFormComponent,
} from './components/mri-symptoms-form/mri-symptoms-form.component';
import { ProviderListingComponent } from './components/provider-listing/provider-listing.component';
import { ReportFormComponent } from './components/report-form/report-form.component';
import {
	FolderComponentComponent,
} from './components/shareFileUpload/components/folder-component/folder-component.component';
import {
	SharedFileUploadComponent,
} from './components/shareFileUpload/shared-file-upload/shared-file-upload.component';
import {
	TreatmentDoctorsFormComponent,
} from './components/treatment-doctors-form/treatment-doctors-form.component';
import {
	TreatmentGeneralFormComponent,
} from './components/treatment-general-form/treatment-general-form.component';
import { TreeViewComponent } from './components/tree-view/tree-view.component';
import { UserFormComponent } from './components/user-form/user-form.component';
import { UsersListingComponent } from './components/users-listing/users-listing.component';
import {
	VehicleDetailFormComponent,
} from './components/vehicle-detail-form/vehicle-detail-form.component';
import { WitnessesFormComponent } from './components/witnesses-form/witnesses-form.component';
import { FDServices } from './services/fd-services.service';
import { AddAdditionalInfoComponent } from './components/medical-identifier-form/add-additional-info/add-additional-info/add-additional-info.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { TaxonomycodeDirective } from '../masters/billing/codes/directives/taxonomycode.directive';

@NgModule({
	declarations: [
		UsersListingComponent,
		UserFormComponent,

		TreatmentGeneralFormComponent,
		TreatmentDoctorsFormComponent,
		WitnessesFormComponent,
		AccidentFormComponent,
		CreateCaseFormComponent,
		AdvertisementFormComponent,
		ReportFormComponent,
	  VehicleDetailFormComponent,
		HouseholdFormComponent,
		BodypartsFormComponent,
		DocumentFormComponent,
		MriIntake1FormComponent,
		MriIntake2FormComponent,
		DoctorsListingComponent,
		NumberDirective,
		DoctorsFormComponent,
		CaseLeftSidebarComponent,
		AttorneyListingComponent,
		AttorneyMasterFormComponent,
		ProviderFormComponent,
		ProviderListingComponent,
		InsuranceListingComponent,
		InsuranceMasterFormComponent,
		TreeViewComponent,
		HospitalListingComponent,
		HospitalFormComponent,
		MedicalIdentifierFormComponent,
		MriSymptomsFormComponent,
		SharedFileUploadComponent,
		FolderComponentComponent,
		AddAdditionalInfoComponent,
		TaxonomycodeDirective
	],
	imports: [
		CommonModule,
		NgxMaskDirective, NgxMaskPipe,
				MatSelectModule,
		RouterModule,
		NgProgressModule,
		DynamicFormModule,
		NgMultiSelectDropDownModule.forRoot(),
		NgbModule,
		FormsModule,
		ReactiveFormsModule,
		NgxDatatableModule,
		// NgxMaskModule.forRoot(),
		PerfectScrollbarModule,
		// AgmCoreModule,
		GooglePlaceModule,

		SharedModule,
		NgxFileDropModule,
		CalendarModule.forRoot({
			provide: DateAdapter,
			useFactory: adapterFactory,
		}),
		NgbModalModule,
		FlatpickrModule.forRoot(),
		TagInputModule,
		MatCheckboxModule,
		MatDatepickerModule,
		MatProgressBarModule,
		DragDropModule,
		// OwlDateTimeModule,
		// OwlNativeDateTimeModule,
		TimePickerAllModule,
		BusyLoaderModule,
		MastersSharedModule,
		SignatureModule,
		ModalModule.forRoot(),

	],
	exports: [
		NumberDirective,
		CreateCaseFormComponent,
		UsersListingComponent,
		UserFormComponent,
		// AgmCoreModule,
		GooglePlaceModule,
		FolderComponentComponent,
		PerfectScrollbarModule,
		FolderComponentComponent,
		NgxDatatableModule,
		FormsModule,
		ReactiveFormsModule,
		RouterModule,
		TreatmentGeneralFormComponent,
		TreatmentDoctorsFormComponent,
		WitnessesFormComponent,
		AccidentFormComponent,
		AdvertisementFormComponent,
		ReportFormComponent,
		VehicleDetailFormComponent,
		HouseholdFormComponent,
		BodypartsFormComponent,
		DocumentFormComponent,
		MriIntake1FormComponent,
		MriIntake2FormComponent,
		DoctorsListingComponent,
		DoctorsFormComponent,
		CaseLeftSidebarComponent,
		AttorneyListingComponent,
		AttorneyMasterFormComponent,
		ProviderFormComponent,
		ProviderListingComponent,
		InsuranceListingComponent,
		InsuranceMasterFormComponent,
		TreeViewComponent,
		HospitalListingComponent,
		HospitalFormComponent,
		MatDatepickerModule,
		MedicalIdentifierFormComponent,
		MriSymptomsFormComponent,
		DragDropModule,
		TaxonomycodeDirective
	],
	
	providers: [FDServices, BodypartsFormService, ToastrService,
		// provideEnvironmentNgxMask(),
		provideNgxMask(),

	],

})
export class FdSharedModule {}
