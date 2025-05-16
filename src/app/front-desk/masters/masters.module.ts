import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MastersRoutingModule } from './masters-routing.module';
import { AttorneyListComponent } from './attorney/attorney-list/attorney-list.component';
import { MastersComponent } from './masters.component';
import { FdSharedModule } from '../fd_shared/fd-shared.module';
import { AttorneyAddComponent } from './attorney/attorney-add/attorney-add.component';
import { SharedModule } from '@shared/shared.module';
import { AttorneyEditComponent } from './attorney/attorney-edit/attorney-edit.component';
import { InsuranceListComponent } from './insurance/insurance-list/insurance-list.component';
import { InsuranceEditComponent } from './insurance/insurance-edit/insurance-edit.component';
import { InsuranceAddComponent } from './insurance/insurance-add/insurance-add.component';
import { HospitalListComponent } from './hospital/hospital-list/hospital-list.component';
import { HospitalAddComponent } from './hospital/hospital-add/hospital-add.component';
import { HospitalEditComponent } from './hospital/hospital-edit/hospital-edit.component';
import { MatTabsModule } from '@angular/material/tabs';


import { SpecialitiesListComponent } from './specialities/specialities-list/specialities-list.component';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
// import { PicklistcategoryComponent } from './provider/picklistcategory/picklistcategory.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { CaseTypeComponent } from './providers/caseType/caseTypeComponent/case.type.component';
import { PicklistcategoryComponent } from './billing/billing-master/picklistcategory/picklistcategory.component';
import { ProviderListingComponent } from '../fd_shared/components/provider-listing/provider-listing.component';


@NgModule({
	declarations: [
		AttorneyListComponent, MastersComponent, AttorneyAddComponent, AttorneyEditComponent,
		// ProviderListingComponent,
		InsuranceListComponent, InsuranceEditComponent,
		InsuranceAddComponent,
		HospitalListComponent, HospitalAddComponent, HospitalEditComponent, SpecialitiesListComponent,
		// PicklistcategoryComponent,
		// MainProviderComponent,
		// CaseTypeComponent
	],
	imports: [
		CommonModule,
		MastersRoutingModule,
		FdSharedModule,
		SharedModule,
		MatTabsModule,
		MatCheckboxModule,
		MatSelectModule,
		PaginationModule.forRoot(),
	]
})
export class MastersModule { }
