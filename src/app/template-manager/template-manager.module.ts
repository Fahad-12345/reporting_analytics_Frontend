import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplateManagerRoutingModule } from './template-manager-routing.module';
import { TemplateManagerComponent } from './template-manager.component';
import { SharedModule } from '@appDir/shared/shared.module';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
// import { ClickOutsideModule } from 'ng-click-outside';
import { BusyLoaderModule } from '@appDir/shared/busy-loader/busy-loader.module';
import { SignatureModule } from '@appDir/shared/signature/signature.module';
// import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { GridsterModule } from './shared/gridster/gridster.module';
import { HomeComponent } from './components/home/home.component';
import { TextComponent } from './components/text/text.component';
import { LineComponent } from './components/line/line.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { LayoutItemDirective } from './directives/layout-item.directive';
import { DialogueComponent } from './modals/dialogue/dialogue.component';
import { NgbModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { CheckboxComponent } from './components/checkbox/checkbox.component';
import { InputComponent } from './components/input/input.component';
import { RadioComponent } from './components/radio/radio.component';
import { NestableModule } from './lib/src/nestable.module';
import { AngularEditorModule } from './shared/angular-editor/angular-editor.module';
import { SwitchComponent } from './components/switch/switch.component';
import { DropdownComponent } from './components/dropdown/dropdown.component';
import { IntensityComponent } from './components/intensity/intensity.component';
import { IncrementComponent } from './components/increment/increment.component';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { ImageComponent } from './components/image/image.component';
import { SignatureComponent } from './components/signature/signature.component';
import { UploadImageComponent } from './components/image/modal/upload-image/upload-image.component';
import { SimpleImageComponent } from './components/simple-image/simple-image.component';
import { SimpleUploadImageComponent } from './components/simple-image/modal/simple-upload-image/simple-upload-image.component';
import { CKEditorModule } from 'ngx-ckeditor';
import { TextEditorComponent } from './modals/text-editor/text-editor.component';
import { TemplatePermissionsComponent } from './modals/template-permissions/template-permissions.component';
import { TemplateInstanceComponent } from './components/template-instance/template-instance.component';
// import { polyfill as keyboardEventKeyPolyfill } from 'keyboardevent-key-polyfill';
import { TextInputAutocompleteModule } from 'angular-text-input-autocomplete';
// import { NgProgressModule } from '@ngx-progressbar/core';
// import { NgProgressHttpModule } from '@ngx-progressbar/http';
// import { NgProgressRouterModule } from '@ngx-progressbar/router';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { AlignmentComponent } from './modals/alignment/alignment.component';
import { CarryForwardComponent } from './modals/carry-forward/carry-forward.component';
// import { NgxCoolDialogsModule, NgxCoolDialogsService } from 'ngx-cool-dialogs';
import { HeaderComponent } from './modals/header/header.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { IntellisenseComponent } from './components/intellisense/intellisense.component';
import { MainServiceTemp } from './services/main.service';
// import { SignaturePadModule } from '@ng-plus/signature-pad';
// import { HttpModule } from '@angular/http';
import { CalculationComponent } from './components/calculation/calculation.component';
import { DrawingComponent } from './components/drawing/drawing.component';
import { WebcamModule } from 'ngx-webcam';
import { CameraComponent } from './components/simple-image/modal/camera/camera.component';
// import { ImageDrawingModule } from 'ngx-image-drawing';
// import { TooltipModule } from 'ngx-bootstrap';
import { DrawingUploadImageComponent } from './components/drawing/modal/simple-upload-image/simple-upload-image.component';
import { DrawingCameraComponent } from './components/drawing/modal/camera/camera.component';
import { TableDropdownComponent } from './components/tableDropdown/tableDropdown.component';
import { SignatureModalComponent } from './components/signature/modal/signature-modal/signature-modal.component';
import { ConfirmationDialogComponent } from './modals/confirmation-dialog/confirmation-dialog.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { ExternalComponent } from "./modals/external-module/external.component";
import { ErxUserModule } from '@appDir/erx/erx.module';

@NgModule({
	declarations: [
		TemplateManagerComponent,
		DrawingCameraComponent,
		HomeComponent,
		TextComponent,
		LineComponent,
		DrawingUploadImageComponent,
		SignatureComponent,
		LayoutItemDirective,
		ClickOutsideDirective,
		DialogueComponent,
		CheckboxComponent,
		InputComponent,
		RadioComponent,
		SwitchComponent,
		DropdownComponent,
		IntensityComponent,
		IncrementComponent,
		ImageComponent,
		UploadImageComponent,
		SimpleImageComponent,
		SimpleUploadImageComponent,
		TextEditorComponent,
		TemplatePermissionsComponent,
		ConfirmationDialogComponent,
		TemplateInstanceComponent,
		AlignmentComponent,
		CarryForwardComponent,
		HeaderComponent,
		IntellisenseComponent,
		CalculationComponent,
		DrawingComponent,
		CameraComponent,
		TableDropdownComponent,
		SignatureModalComponent,
		ExternalComponent
	],
	imports: [
		CommonModule,
		ReactiveFormsModule,
		SlickCarouselModule,
		CKEditorModule,
		TextInputAutocompleteModule,
		AutocompleteLibModule,
		BusyLoaderModule,
		ModalModule,
		// SignaturePadModule,
		NestableModule,
		FormsModule,
		AngularEditorModule,
		NgbModule,
		// ClickOutsideModule,
		NgxDatatableModule,
		HttpClientModule,
		// HttpModule,
		MatIconModule,
		MatButtonModule,
		MatSelectModule,
		MatInputModule,
		MatCheckboxModule,
		MatSidenavModule,
		MatListModule,
		DragDropModule,
		GridsterModule,
		SignatureModule,
		// NgxCoolDialogsModule.forRoot({
		// 	color: '#00a650',
		// }),
		TabsModule.forRoot(),
		// NgProgressModule.forRoot(),
		// NgProgressHttpModule,
		// NgProgressRouterModule,
		SharedModule,
		// MarkdownModule.forRoot({
		// 	loader: HttpClient,
		// 	markedOptions: { provide: MarkedOptions, useValue: { smartypants: true, breaks: true } },
		// }),
		NgxSliderModule,
		TemplateManagerRoutingModule,
		WebcamModule,
		// ImageDrawingModule,
		NgbTooltipModule,
		ErxUserModule
	],
	entryComponents: [
		TextComponent,
		LineComponent,
		CalculationComponent,
		DrawingComponent,
		SignatureComponent,
		DialogueComponent,
		CheckboxComponent,
		InputComponent,
		RadioComponent,
		SwitchComponent,
		DropdownComponent,
		IncrementComponent,
		IntensityComponent,
		ImageComponent,
		UploadImageComponent,
		SimpleImageComponent,
		SimpleUploadImageComponent,
		TemplatePermissionsComponent,
		ConfirmationDialogComponent,
		AlignmentComponent,
		CarryForwardComponent,
		HeaderComponent,
		IntellisenseComponent,
		DrawingUploadImageComponent,
		TableDropdownComponent,
		SignatureModalComponent,
		ExternalComponent
	],
	providers: [
		MainServiceTemp
	],
	bootstrap: [TemplateManagerComponent],
})
export class TemplateManagerModule {}
