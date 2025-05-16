import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './components/home/home.component';
import { ErxComponent } from './erx.component';
import { ErxRoutingModule } from './erx-routing.module';
import { SharedModule } from '@appDir/shared/shared.module';
import { PrescribeComponent } from './components/prescribe/prescribe.component';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { ViewSummaryComponent } from './components/view-summary/view-summary.component';
import { ViewSummaryComponentAlerts } from './components/view-summary-alerts/view-summary-alerts.component';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { SignatureModule } from '@appDir/shared/signature/signature.module';

@NgModule({
	declarations: [
		ErxComponent,
		HomeComponent,
		PrescribeComponent,
		ViewSummaryComponent,
		ViewSummaryComponentAlerts,
	],
	imports: [CommonModule, ErxRoutingModule, SharedModule, DatePickerModule, AutocompleteLibModule, SignatureModule],
	exports: [HomeComponent, PrescribeComponent, ViewSummaryComponent],
	bootstrap: [ErxComponent],
})
export class ErxUserModule {}
