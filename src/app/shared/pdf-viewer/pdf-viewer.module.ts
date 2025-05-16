import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfViewerComponent } from './components/pdf-viewer/pdf-viewer.component';

@NgModule({
	declarations: [PdfViewerComponent],
	imports: [
		CommonModule,
	], exports: [PdfViewerComponent], entryComponents: [PdfViewerComponent]
})
export class PdfViewerModule { }
