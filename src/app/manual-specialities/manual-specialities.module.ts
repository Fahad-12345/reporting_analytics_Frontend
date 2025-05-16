import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
	FormsModule,
	ReactiveFormsModule,
} from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { TagInputModule } from 'ngx-chips';
import {
	PERFECT_SCROLLBAR_CONFIG,
	PerfectScrollbarConfigInterface,
	PerfectScrollbarModule,
} from 'ngx-perfect-scrollbar';

import { FdSharedModule } from '@appDir/front-desk/fd_shared/fd-shared.module';
import { HbotModule } from '@appDir/hbot/hbot.module';
import { MdSharedModule } from '@appDir/medical-doctor/md-shared/md-shared.module';
import { MDService } from '@appDir/medical-doctor/services/md/medical-doctor.service';
import { BusyLoaderModule } from '@appDir/shared/busy-loader/busy-loader.module';
import { SharedModule } from '@appDir/shared/shared.module';
import { SignatureModule } from '@appDir/shared/signature/signature.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { AclRedirection } from '../shared/services/acl-redirection.service';
import { AclService } from '../shared/services/acl.service';
import { ManualSpecialitiesRoutingModule } from './manual-specialities-routing.module';
import { ManualSpecialitiesComponent } from './manual-specialities.component';
import {
	SpecialityDocumentListingComponent,
} from './speciality-document-listing/speciality-document-listing.component';
// import { SpecialityFormComponent } from './speciality-form/speciality-form.component';
import { SpecialityComponent } from './speciality/speciality.component';
import { SpecialityFormCopyComponent } from './speciality-form copy/speciality-form/speciality-form.component';
import { SpecialityFormComponent } from './speciality-form copy/speciality-form.component';
import { SpecialityMainFormComponent } from './speciality-form/speciality-form.component';


const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
	suppressScrollX: true,
};

@NgModule({
	declarations: [
		ManualSpecialitiesComponent,
		SpecialityComponent,
		SpecialityFormComponent,
		SpecialityMainFormComponent,
		SpecialityFormCopyComponent,
		SpecialityDocumentListingComponent,
	],
	imports: [
		CommonModule,
		ManualSpecialitiesRoutingModule,
		FormsModule,
		ReactiveFormsModule,
		SharedModule,
		NgxDatatableModule,
		MatCheckboxModule,
		HbotModule,
		CommonModule,
		FdSharedModule,
		TagInputModule,
		PerfectScrollbarModule,
		BusyLoaderModule,
		SignatureModule,
		MdSharedModule,
		// BrowserAnimationsModule
		// TypeaheadModule.forRoot()
	],
	providers: [
		MDService,
		AclRedirection,
		AclService,
		{
			provide: PERFECT_SCROLLBAR_CONFIG,
			useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
		},
	],
})
export class ManualSpecialitiesModule {}
