import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TemplateMasterRoutingModule } from './template-master-routing.module';
import { TemplateMasterComponent } from './template-master.component';
import { HeaderFooterComponent } from './components/header-footer/header-footer.component';
import { HomeComponent } from './components/header-footer/components/home/home.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TemplateListingComponent } from './components/template-listing/template-listing.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatCheckboxModule} from '@angular/material/checkbox';
import {  MatIconModule } from '@angular/material/icon';
import {  MatButtonModule } from '@angular/material/button';
import { MatInputModule} from '@angular/material/input';
import {  MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list'; 


import { GridsterModule } from './components/header-footer/shared/gridster/gridster.module';
import { TextComponent } from './components/header-footer/components/text/text.component';
import { LayoutItemDirective } from './components/header-footer/directives/layout-item.directive';
import { SimpleUploadImageComponent } from './components/header-footer/components/simple-image/modal/simple-upload-image/simple-upload-image.component';
import { SimpleImageComponent } from './components/header-footer/components/simple-image/simple-image.component';
import { InputComponent } from './components/header-footer/components/input/input.component';
import { IntellisenseComponent } from './components/header-footer/components/intellisense/intellisense.component';
import { LineComponent } from './components/header-footer/components/line/line.component';
import { AngularEditorModule } from './components/header-footer/shared/angular-editor/angular-editor.module';

import { TemplateFormComponent } from './components/template-form/template-form.component';
import { SharedModule } from '@appDir/shared/shared.module';
import { RolesFieldListComponent } from './components/roles-field-list/roles-field-list.component';
import { RolesFieldFormComponent } from './components/roles-field-form/roles-field-form.component';
import { RequiredFieldsMapperPipe } from './pipes/required-fields-mapper.pipe';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { SpecialityModalComponent } from './components/speciality-modal/speciality-modal.component';

import { SlickCarouselModule } from 'ngx-slick-carousel';
import { CKEditorModule } from 'ngx-ckeditor';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { TextInputAutocompleteModule } from 'angular-text-input-autocomplete';
// import { AngularEditorModule } from '../../../template-manager/shared/angular-editor/angular-editor.module';
// import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
// import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClientModule } from '@angular/common/http';
import { HeaderFooterModalComponent } from './components/header-footer/modals/header-footer-modal/header-footer-modal.component';
import { MainServiceTemp } from './components/header-footer/services/main.service';
import { KeyWordListingComponent } from './components/keyword-listing/keyword.component';

@NgModule({
  declarations: [
    HomeComponent,
    TemplateMasterComponent,
    TemplateListingComponent,
    HeaderFooterComponent,
    TemplateFormComponent,
    RolesFieldListComponent,
    RolesFieldFormComponent,
    RequiredFieldsMapperPipe,
    SpecialityModalComponent,
    TextComponent,
    LayoutItemDirective,
    SimpleImageComponent,
    SimpleUploadImageComponent,
    HeaderFooterModalComponent,
    InputComponent,
    IntellisenseComponent,
	LineComponent,
	KeyWordListingComponent
  ],
  imports: [
    CommonModule,
    GridsterModule,
    FormsModule,
    NgbModule,
    MatCheckboxModule,
    NgxDatatableModule,
    TemplateMasterRoutingModule,
    ReactiveFormsModule,

    SlickCarouselModule,
    CKEditorModule,
    TextInputAutocompleteModule,
    AutocompleteLibModule,
    CommonModule,
    FormsModule,
    AngularEditorModule,
    NgbModule,
    HttpClientModule,
    MatIconModule, MatButtonModule, MatSelectModule, MatInputModule, MatCheckboxModule, MatSidenavModule, MatListModule,
    DragDropModule,
    GridsterModule,
    // NgMultiSelectDropDownModule.forRoot(),
    SharedModule,
    PaginationModule.forRoot(),
    // MarkdownModule.forRoot({ loader: HttpClient, markedOptions: { provide: MarkedOptions, useValue: { smartypants: true, breaks: true } } }),
  ],
  entryComponents: [
    TextComponent,
    SimpleImageComponent,
    InputComponent,
    IntellisenseComponent,
    LineComponent,
    SimpleUploadImageComponent,
    HeaderFooterModalComponent,
    TemplateFormComponent, SpecialityModalComponent
  ],
  providers: [ MainServiceTemp],
  bootstrap: [TemplateMasterComponent]
})
export class TemplateMasterModule { }
