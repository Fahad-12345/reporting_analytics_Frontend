import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentsRoutingModule } from './documents-routing.module';
import { DocumentsComponent } from './documents.component';
import { FdSharedModule } from '../fd_shared/fd-shared.module';
import { DocumentManagerComponent } from './document-manager.component';
import { DocumentListComponent } from './document-list/document-list.component';
 import { UploadDocumentModalComponent } from './components/upload-document-modal/upload-document-modal.component';
import { NewFolderModalComponent } from './components/modals/new-folder-modal/new-folder-modal.component';
import { DocumentTreeComponent } from './document-tree/document-tree.component';
import { DocumentSharedListingComponent } from './components/document-shared-listing/document-shared-listing.component';
import { DocumentUploaderModalComponent } from './components/document-uploader-modal/document-uploader-modal.component';
import { SharedDocumentActionsComponent } from './components/shared-document-actions/shared-document-actions.component';
import { MergeModalComponent } from './components/modals/merge-modal/merge-modal.component';
import { MoveFileModalComponent } from './components/modals/move-file-modal/move-file-modal.component';
import { BusyLoaderModule } from '@appDir/shared/busy-loader/busy-loader.module';
import { ReactiveFormsModule , FormsModule} from '@angular/forms';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { SideNavModule } from '@appDir/shared/components/side-nav/side-nav/side-nav.module';
import { SharedModule } from '@appDir/shared/shared.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {  MatTreeModule } from '@angular/material/tree';
import {MatIconModule } from '@angular/material/icon';
import {  MatProgressBarModule } from '@angular/material/progress-bar';
import { TagInputModule } from 'ngx-chips';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { BrowserModule } from '@angular/platform-browser';
import { NgxFileDropModule } from 'ngx-file-drop';

@NgModule({
	declarations: [
		DocumentsComponent,
		DocumentManagerComponent,
		DocumentListComponent,
		UploadDocumentModalComponent,
		NewFolderModalComponent,
		DocumentTreeComponent,
		DocumentSharedListingComponent,
		DocumentUploaderModalComponent,
		SharedDocumentActionsComponent,
		MergeModalComponent,
		MoveFileModalComponent
	],
	imports: [
		CommonModule,
		NgxFileDropModule,
		// BrowserModule,
		 FormsModule,
		DocumentsRoutingModule,
		BusyLoaderModule,
		ReactiveFormsModule,
		PerfectScrollbarModule,
		SideNavModule,
		FdSharedModule,
		SharedModule,
		TagInputModule,
		NgbTooltipModule,
		MatCheckboxModule,
		NgSelectModule,
		MatTreeModule,
		MatIconModule,
		MatProgressBarModule,
		ScrollToModule.forRoot()
	], entryComponents: [
		UploadDocumentModalComponent,
		DocumentUploaderModalComponent,
		MergeModalComponent,
		MoveFileModalComponent,
		NewFolderModalComponent


	]
})
export class DocumentsModule { }
