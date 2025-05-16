import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
	FormsModule,
	ReactiveFormsModule,
} from '@angular/forms';
import {
	MatAutocompleteModule

} from '@angular/material/autocomplete';
import {
	MatChipsModule,
} from '@angular/material/chips';
import {
	MatDatepickerModule,
} from '@angular/material/datepicker';
import {

	MatFormFieldModule,	MAT_FORM_FIELD_DEFAULT_OPTIONS,
	
} from '@angular/material/form-field';
import {
	MatIconModule
} from '@angular/material/icon';

import {
	MatInputModule,
} from '@angular/material/input';

import {
	MAT_MOMENT_DATE_ADAPTER_OPTIONS,
	MatMomentDateModule,
} from '@angular/material-moment-adapter';

import { GooglePlaceModule } from 'ngx-google-places-autocomplete';

import {
	TitleCaseDirective,
} from '@appDir/front-desk/masters/billing/codes/directives/title-case.directive';

import { SharedModule } from '../shared.module';
import { SignatureModule } from '../signature/signature.module';
import { AddressComponent } from './components/address/address.component';
import { AutoCompleteComponent } from './components/auto-complete/auto-complete.component';
import { ButtonComponent } from './components/button/button.component';
import { CheckboxComponent } from './components/checkbox/checkbox.component';
// import { DateComponent } from './components/date/date.component';
import { DivComponent } from './components/div/div.component';
import { DynamicFormComponent } from './components/dynamic-form/dynamic-form.component';
import { InputComponent } from './components/input/input.component';
import {
	HighlightPipe,
	MatSearchFilterComponent,
} from './components/mat-search-filter/mat-search-filter.component';
import { RadiobuttonComponent } from './components/radiobutton/radiobutton.component';
import { SelectComponent } from './components/select/select.component';
import { SignatureBoxComponent } from './components/signature-box/signature-box.component';
import { DynamicFieldDirective } from './directives/dynamic-field.directive';
import { DynamicFormComponentDemo } from './dynamic-form-component/dynamic-form.component';
import { NgSelectFilterComponent } from './components/ng-select-filter/ng-select-filter.component';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';


@NgModule({
	declarations: [
		ButtonComponent,
		CheckboxComponent,
		DivComponent,
		DynamicFormComponentDemo,
		InputComponent,
		RadiobuttonComponent,
		SelectComponent,
		DynamicFieldDirective,
		DynamicFormComponent,
		AutoCompleteComponent,
		AddressComponent,
		TitleCaseDirective,
		SignatureBoxComponent,
		MatSearchFilterComponent,
		HighlightPipe,
		NgSelectFilterComponent,

		


	], exports: [
		NgxMaskDirective, NgxMaskPipe,
		ButtonComponent,
		CheckboxComponent,
		DivComponent,
		DynamicFormComponentDemo,
		InputComponent,
		RadiobuttonComponent,
		SelectComponent,
		DynamicFieldDirective,
		DynamicFormComponent,
	],
	imports: [
		CommonModule,
		ReactiveFormsModule,
		SharedModule,
		MatChipsModule,
		MatIconModule,
		MatAutocompleteModule,	
		GooglePlaceModule,
		// NgxMaskModule.forRoot(),
		NgxMaskDirective, NgxMaskPipe,
		MatDatepickerModule,
		MatMomentDateModule,
		SignatureModule,
	   FormsModule,
	   ReactiveFormsModule,
	   MatFormFieldModule,
	   MatInputModule,
	], entryComponents: [
		ButtonComponent,
		CheckboxComponent,
		DivComponent,
		InputComponent,
		SelectComponent,
		RadiobuttonComponent,
		AutoCompleteComponent,
		AddressComponent,
		SignatureBoxComponent,
		MatSearchFilterComponent,
		NgSelectFilterComponent,
	], providers: [
		// { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: false } },
		// { provide: LOCALE_ID, useValue: "en-GB" },
		// { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } }
		{
			provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
			useValue: { floatLabel: 'auto' },
		  },
		  provideNgxMask()
	]
})
export class DynamicFormModule { }
