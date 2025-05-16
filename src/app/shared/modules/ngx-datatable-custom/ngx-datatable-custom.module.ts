import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
	FormsModule,
	ReactiveFormsModule,
} from '@angular/forms';
// import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
	MatCheckboxModule,
} from '@angular/material/checkbox';
import {
	MatDatepickerModule,
} from '@angular/material/datepicker';
import {
	MatNativeDateModule,
} from '@angular/material/core';
import { RouterModule } from '@angular/router';

import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { CollapseModule } from 'ngx-bootstrap/collapse';

import { UTCTimePipe } from '@appDir/shared/modules/ngx-datatable-custom/pipes/utc-time.pipe';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgLoggerModule } from '@nsalaun/ng-logger';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { MaskDateDirective } from './directives/date-mask.directive';
import { OnlyNumericDirective } from './directives/only-numeric.directive';
import { alphabaticOnly } from './directives/onlyAlphabatic.directive';
import { NgxDatatableComponent } from './ngx-datatable.component';
import { PhonePipe } from './pipes/phone.pipe';
import { UTCTimeRPipe } from './pipes/utc-time.pipeR';
import { InputDateMaskDirective } from './directives/input-date-mask.directive';

@NgModule({
	declarations: [
		NgxDatatableComponent,

		UTCTimePipe,
		UTCTimeRPipe,
		OnlyNumericDirective,
		alphabaticOnly,
		MaskDateDirective,
		PhonePipe,
		InputDateMaskDirective,
	],
	imports: [
		CommonModule,
		// BrowserAnimationsModule,
		MatCheckboxModule,
		NgxDatatableModule,
		RouterModule,
		FormsModule,
		ReactiveFormsModule,
		NgMultiSelectDropDownModule,
		NgbModule,
		NgLoggerModule,
		MatDatepickerModule,
		MatNativeDateModule,
		// SharedModule

		CollapseModule.forRoot(),
	],
	exports: [NgxDatatableComponent, MatDatepickerModule, MatNativeDateModule, InputDateMaskDirective],
})
export class NgxDatatableCustomModule {}
