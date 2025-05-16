import { dateFormatPipe } from './pipes/dateFormat.pipe';
 import { timeStringPipe } from './pipes/time.pipe';
import { tranportationPipe } from './pipes/tranportation.pipe';
import { CustomizeColumnComponent } from './components/customize-columns-component/customize-columns-component';
import { BlockedCopyPasteDirective } from './directives/block-copy-paste.directive';
import { spaceNotAllowedDirective } from './directives/notSpaceAllowed.directive';
import { LatLngDirective } from './directives/latlngDirective';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { JwtInterceptor } from './interceptors/jwt.http.interceptor';
import { CustomDiallogService } from './services/custom-dialog.service';
import { CustomConfirmationDialogComponent } from './components/custom-confirmation-dialog/custom-confirmation-dialog.component';
import { BlockCopyPasteDirective } from './directives/copypaste.directive';
import { specficCharacterLengthDirective } from './directives/specfic.character.length.directive';
 import { TextFieldModule } from '@angular/cdk/text-field';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import {
	FormsModule,
	ReactiveFormsModule,
} from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatChipsModule} from '@angular/material/chips';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
 import {MatOptionModule} from '@angular/material/core';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatSelectModule} from '@angular/material/select';
import {MatTreeModule} from '@angular/material/tree';
import { RouterModule } from '@angular/router';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TagInputModule } from 'ngx-chips';
import { NgxFileDropModule  } from 'ngx-file-drop';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { PerfectScrollbarModule } from 'ngx-om-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-om-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-om-perfect-scrollbar';
import {
	NgProgressModule,
} from 'ngx-progressbar';
;
import {
	VisitDocumentListingComponent,
} from '@appDir/front-desk/billing/shared-components/visit-document-listing/visit-document-listing.component';
import {
	VisitUploadDocumentsComponent,
} from '@appDir/front-desk/billing/shared-components/visit-upload-documents/visit-upload-documents.component';
import { FileUploadDirective } from '@appDir/front-desk/documents/directive/file-upload.directive';
import {
	DateOnlyDirective,
} from '@appDir/front-desk/masters/billing/codes/directives/date-only.directive';
import {
	NadeanDirectiveDirective,
} from '@appDir/front-desk/masters/billing/codes/directives/nadean-directive.directive';
import {
	KioskModalComponent,
} from '@appDir/front-desk/masters/template-master/components/kiosk-modal/kiosk-modal.component';
import {
	FileUploaderModalComponent,
} from '@appDir/manual-specialities/file-uploader-modal/file-uploader-modal.component';
import { TransferHttpModule } from '@gorniv/ngx-transfer-http';
import { NgbActiveModal, NgbModule ,NgbNavModule} from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { DisableControlDirective } from '@shared/directives/disableControl.directive';
import { FooterComponent } from '@shared/layouts/footer/footer.component';
import { HeaderComponent } from '@shared/layouts/header/header.component';
 import { SidebarLeftComponent } from '@shared/layouts/sidebar-left/sidebar-left.component';
import { SidebarRightComponent } from '@shared/layouts/sidebar-right/sidebar-right.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { BusyLoaderModule } from './busy-loader/busy-loader.module';
 import { CommentsModalComponent } from './components/case-comments/case-comments.component';
 import { CaseHeaderComponent } from './components/case-header/case-header.component';
import {
	HighlightPipe,
	MatAutocompleteComponent,
} from './components/mat-autocomplete/mat-autocomplete.component';
import {
	MatSelectSearchComponent,
} from './components/mat-select-search/mat-select-search.component';
import { RolePrivilegesComponent } from './components/role-privilliges/role-privilliges.component';
import {
	FolderPermissionTreeComponent,
} from './components/roles/folder-permission-tree/folder-permission-tree.component';
import {
	SelectCheckAllComponent,
} from './components/select-all-material/select-all-material.component';
import {
	SharedDocCalendarFrontSupComponent,
} from './components/shared-doc-calendar-front-sup/shared-doc-calendar-front-sup.component';
import { SideNavModule } from './components/side-nav/side-nav/side-nav.module';
 import { OnlyNumericDirective } from './directives/appOnlyNumeric.directive';
 import { EnhanceRadioDirective } from './directives/enhance-radio.directive';
import { notFirstCharactorSpaceDirective } from './directives/notFirstCharSpace.directive';
import {
	NgxDatatableCustomModule,
} from './modules/ngx-datatable-custom/ngx-datatable-custom.module';
import { CalculateAgePipe } from './pipes/calculate-age.pipe';
import { DateFormatMDYPipe } from './pipes/date-format-mdy.pipe';
import { ObjToArrayPipe } from './pipes/obj-to-array.pipe';
import { PhoneFormatPipe } from './pipes/phone-format-pipe.pipe';
import { SsnFormatPipePipe } from './pipes/ssn-format-pipe.pipe';
import { textareaLineBreaks } from './pipes/textarea-linebreak.pipe';
import { TimeAgoLocalPipe } from './pipes/time-ago-local.pipe';
import { TimeAgoPipe } from './pipes/time-ago.pipe';
import { TwelveHoursPipe } from './pipes/twelvehours.pipe';
import { UTCTimePipe } from './pipes/utc-time.pipe';
import { WcbFormatPipePipe } from './pipes/wcb-format-pipe.pipe';
import { SharedMetaModule } from './shared-meta';
import { NgxCurrencyModule } from "ngx-currency";
import { EorFilterComponent } from '@appDir/eor/shared/eor-filters/eor-filter.component';
import { FilterComponent } from './filter/component/filter/filter.component';
 import { MatMomentDateModule, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
 import { BillingTitlePipe } from './pipes/billing-title.pipe';
 import { CurrentTimeZonePipe } from './pipes/currentTimezone.pipe';
import { NgSelectShareableComponent } from './ng-select-shareable/ng-select-shareable.component';
import { MatDatePickerSharedableComponent } from './mat-date-picker-sharedable/mat-date-picker-sharedable.component';
import { LoaderInterceptor } from './interceptors/loader.interceptor';
import { ShimmerLoaderComponent } from './shimmer-loader/shimmer-loader.component';
import { NgxShimmerLoadingModule } from  'ngx-shimmer-loading';
import { FullNamePipe } from './pipes/full-name.pipe';
 import { PasswordStrengthComponent } from './components/password-strength/password-strength.component';
import { TransportationModalComponent } from './modules/doctor-calendar/modals/transportation-modal/transportation-modal.component';
import { NgxSmoothDnDModule } from 'ngx-smooth-dnd';
import {MatSelectInfiniteScrollModule} from 'ng-mat-select-infinite-scroll';
 import { AppOnlyNumbersWithoutDecimalDirective } from './directives/app-only-numbers-without-decimal.directive';
 import { TooltipContentPipe } from './pipes/tooltip-content.pipe';
import { SingatureModule } from './singature-module/singature-module.module';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import {MatRadioModule} from '@angular/material/radio';
import { CommaSeparatedValueFromArrPipe } from '@appDir/front-desk/masters/billing/clearinghouse/CH-helpers/comma-separated-value-from-arr.pipe';
import { AddAppointmentModalComponent } from './modules/doctor-calendar/utils/my-calendar/src/modules/month/appointments/appointments-modal.component';
import { AppointmentModalDialogService } from './modules/doctor-calendar/utils/my-calendar/src/modules/month/appointment-modal-dialog.service';
import { CreatedHistoryComponent } from './created-history/created-history.component';
import { TruncatePipe } from './pipes/truncate-text.pipe';
import { TimeFormatPipe } from './pipes/time-formate';
const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
	suppressScrollX: true,
};

@NgModule({
	imports: [
		NgxMaskDirective, NgxMaskPipe,
		NgbNavModule,
		SingatureModule,
		 NgxCurrencyModule,
		TagInputModule,
		CommonModule,
		RouterModule,
		TranslateModule,
		FormsModule,
		ReactiveFormsModule,
		PerfectScrollbarModule,
		NgbModule,
		NgxDatatableModule,
		NgxFileDropModule,
		 MatInputModule,
		 MatCheckboxModule,
		NgSelectModule,
		 MatTreeModule,
		 MatIconModule,
		 MatAutocompleteModule,
		 NgProgressModule,
		GooglePlaceModule,
		 MatProgressBarModule,
		//NgxMaskModule,
		BusyLoaderModule,
		TooltipModule.forRoot(),
		 MatButtonModule,
		MatFormFieldModule,
		 SideNavModule,
		 MatDatepickerModule,
		NgMultiSelectDropDownModule,
		 MatSelectModule,
		 MatOptionModule,
		InfiniteScrollModule,
		 NgxDatatableCustomModule,
		  MatChipsModule,
		ModalModule.forRoot(),
		 TextFieldModule,
		 MatMomentDateModule,
		 NgxShimmerLoadingModule,
		 MatSlideToggleModule,
		 NgxSmoothDnDModule,
		 MatSelectInfiniteScrollModule,
		 NgOptionHighlightModule,
		 MatRadioModule
	],
	declarations: [
		  textareaLineBreaks,
		  timeStringPipe,
		  TimeFormatPipe,
		  CustomizeColumnComponent,
		   FileUploaderModalComponent,
		  VisitDocumentListingComponent,
		   VisitUploadDocumentsComponent,
		   FooterComponent,
		  CaseHeaderComponent,
		  SidebarLeftComponent,
		  SidebarRightComponent,
		  HeaderComponent,
		  NadeanDirectiveDirective,
		 FileUploadDirective,
		specficCharacterLengthDirective,
		TimeAgoPipe,
		KioskModalComponent,
		TimeAgoLocalPipe,
		UTCTimePipe,
		ObjToArrayPipe,
		DisableControlDirective,
		OnlyNumericDirective,
		SharedDocCalendarFrontSupComponent,
		PhoneFormatPipe,
		SsnFormatPipePipe,
		DateFormatMDYPipe,
		RolePrivilegesComponent,
		TwelveHoursPipe,
		CalculateAgePipe,
		DateOnlyDirective,
		EnhanceRadioDirective,
		WcbFormatPipePipe,
		FileUploaderModalComponent,
		MatAutocompleteComponent,
		HighlightPipe,
		FolderPermissionTreeComponent,
		MatSelectSearchComponent,
		SelectCheckAllComponent,
		CommentsModalComponent,
		notFirstCharactorSpaceDirective,
		specficCharacterLengthDirective,
		BlockCopyPasteDirective,
		CustomConfirmationDialogComponent,
		EorFilterComponent,
		FilterComponent,
		BillingTitlePipe,
		CurrentTimeZonePipe,
		NgSelectShareableComponent,
		MatDatePickerSharedableComponent,
		ShimmerLoaderComponent,
		FullNamePipe,
		LatLngDirective,
		PasswordStrengthComponent,
		spaceNotAllowedDirective,
		BlockedCopyPasteDirective,
		TransportationModalComponent,
		 tranportationPipe,
		AppOnlyNumbersWithoutDecimalDirective,
		dateFormatPipe,
		TooltipContentPipe,
		TruncatePipe,
		CommaSeparatedValueFromArrPipe,
		CommaSeparatedValueFromArrPipe,
		AddAppointmentModalComponent,
  CreatedHistoryComponent,
	],
	exports: [
		NgxMaskDirective, NgxMaskPipe,
		NgOptionHighlightModule,
		NgbNavModule,
		SingatureModule,
		PasswordStrengthComponent,
		timeStringPipe,
		TimeFormatPipe,
		tranportationPipe,
		NgxSmoothDnDModule,
		CustomizeColumnComponent,
		textareaLineBreaks,
		 SharedMetaModule,
		TransferHttpModule,
		CaseHeaderComponent,
		VisitDocumentListingComponent,
		VisitUploadDocumentsComponent,
		SidebarLeftComponent,
		SidebarRightComponent,
		NgxShimmerLoadingModule,
	    FileUploaderModalComponent,
		  DateOnlyDirective,
		  HeaderComponent,
		FileUploadDirective,
		FolderPermissionTreeComponent,
		PerfectScrollbarModule,
		//NadeanDirectiveDirective,
		TimeAgoPipe,
		TimeAgoLocalPipe,
		UTCTimePipe,
		ObjToArrayPipe,
		DisableControlDirective,
		OnlyNumericDirective,
		SharedDocCalendarFrontSupComponent,
		NgxDatatableCustomModule,
		PhoneFormatPipe,
		WcbFormatPipePipe,
		NgbModule,
		NgSelectModule,
		SsnFormatPipePipe,
		DateFormatMDYPipe,
		RolePrivilegesComponent,
		TwelveHoursPipe,
		CalculateAgePipe,
		EnhanceRadioDirective,
		SideNavModule,
		InfiniteScrollModule,
		 MatCheckboxModule,
		FormsModule,
		ReactiveFormsModule,
		NgxDatatableModule,
		// NgxMaskModule,
		GooglePlaceModule,
		MatDatepickerModule,
		BusyLoaderModule,
		NgMultiSelectDropDownModule,
		MatSelectSearchComponent,
		SelectCheckAllComponent,
		CommentsModalComponent,
		ModalModule,
		notFirstCharactorSpaceDirective,
		specficCharacterLengthDirective,
		BlockCopyPasteDirective,
		MatAutocompleteComponent,
		MatAutocompleteModule,
		MatSelectModule, 
		CustomConfirmationDialogComponent,
		EorFilterComponent,
		FilterComponent,
		BillingTitlePipe,
		CurrentTimeZonePipe,
		NgSelectShareableComponent,
		MatDatePickerSharedableComponent,
		ShimmerLoaderComponent,
		FullNamePipe,
		MatChipsModule,
		MatIconModule,
		LatLngDirective,
		spaceNotAllowedDirective,
		BlockedCopyPasteDirective,
		TransportationModalComponent,
		AppOnlyNumbersWithoutDecimalDirective,
		dateFormatPipe,
		MatSlideToggleModule,
		MatSelectInfiniteScrollModule,
		TooltipContentPipe,
		CreatedHistoryComponent,
		CommaSeparatedValueFromArrPipe,
		MatRadioModule,
		TruncatePipe
	],
	providers: [
		 provideNgxMask(),
		{
			provide: PERFECT_SCROLLBAR_CONFIG,
			useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
		},
		 //{ provide: HTTP_INTERCEPTORS, useClass: NgProgressInterceptor, multi: true },
		{ provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
		{ provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: false } },
		{
			provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
			useValue: { floatLabel: 'auto' },
		  },
		CustomDiallogService,
		NgbActiveModal,
		AppointmentModalDialogService
	],
	entryComponents: [CustomConfirmationDialogComponent,
		FileUploaderModalComponent, KioskModalComponent,TransportationModalComponent,AddAppointmentModalComponent
	],
})
export class SharedModule {
}
