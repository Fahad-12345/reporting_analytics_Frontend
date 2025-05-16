import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { SignaturePadModule, SignaturePadComponent } from '@ng-plus/signature-pad';
import { SignatureComponent } from './components/signature/signature.component';
import { SignatureListingComponent } from './components/signature-listing/signature-listing.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SignatureViewComponent } from './components/signature-view/signature-view.component';
import { SingatureModule } from '../singature-module/singature-module.module';
@NgModule({
	declarations: [SignatureComponent, SignatureListingComponent, SignatureViewComponent],
	imports: [
		CommonModule,
		// SignaturePadModule,
		SingatureModule,
		NgxDatatableModule,
		
		FormsModule,
		MatCheckboxModule
	],
	exports: [
		SignatureComponent,
		SignatureListingComponent
	],
	entryComponents: [
		SignatureListingComponent, SignatureViewComponent
	]
})
export class SignatureModule { }
