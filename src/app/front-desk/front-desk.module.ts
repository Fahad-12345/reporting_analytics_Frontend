import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FrontDeskRoutingModule } from './front-desk-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FrontDeskComponent } from './front-desk.component';
import { SharedModule } from '@shared/shared.module';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { AclResolverService } from './acl-redirection.resolver';
import { AclRedirection } from '@shared/services/acl-redirection.service';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { AclService } from '@shared/services/acl.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
// import { NgProgressInterceptor } from 'ngx-progressbar';
import { CdkTreeModule } from '@angular/cdk/tree';
import { RolesComponentComponent } from '@appDir/shared/components/roles/roles-component/roles-component.component';
import { ChooseFacilityComponent } from './components/choose-facility/choose-facility.component';
import { DynamicFormModule } from '@appDir/shared/dynamic-form/dynamic-form.module';
@NgModule({
	declarations: [
		DashboardComponent,
		FrontDeskComponent,
		RolesComponentComponent,
		ChooseFacilityComponent,
	],
	imports: [
		CommonModule,
		SharedModule,
		FrontDeskRoutingModule,
		RouterModule,
		NgMultiSelectDropDownModule.forRoot(),
		TabsModule.forRoot(),
		NgxDatatableModule,
		// HttpClientModule,
		// NgProgressModule,
		// NgMarqueeModule,
		// NgxMaskModule.forRoot(),
		// PaymentModule,
		// A11yModule,
		// CdkStepperModule,
		// CdkTableModule,
		CdkTreeModule,
		DynamicFormModule
	],
	providers: [
		AclResolverService,
		AclRedirection,
		AclService,
		DatePipe,
	    // { provide: HTTP_INTERCEPTORS, useClass: NgProgressInterceptor, multi: true }
	],
	exports: [], 
	entryComponents: [ChooseFacilityComponent]
})
export class FrontDeskModule {
}
