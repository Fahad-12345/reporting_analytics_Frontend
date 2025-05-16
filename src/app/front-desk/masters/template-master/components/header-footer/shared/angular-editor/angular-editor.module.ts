import { NgModule } from '@angular/core';
import { AngularEditorComponent } from './angular-editor.component';
import { AngularEditorToolbarComponent } from './angular-editor-toolbar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AeSelectComponent } from './ae-select/ae-select.component';
import { TextInputAutocompleteModule } from 'angular-text-input-autocomplete';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		TextInputAutocompleteModule,
		AutocompleteLibModule,
		NgSelectModule,
		NgbModule,
		TypeaheadModule.forRoot(),
	],
	declarations: [AngularEditorComponent, AngularEditorToolbarComponent, AeSelectComponent],
	exports: [AngularEditorComponent, AngularEditorToolbarComponent],
})
export class AngularEditorModule {}
