import { Component, OnInit, Input, SimpleChange, SimpleChanges, OnChanges, AfterViewInit } from '@angular/core';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

declare var PDFObject: any;
@Component({
	selector: 'app-pdf-viewer',
	templateUrl: './pdf-viewer.component.html',
	styleUrls: ['./pdf-viewer.component.scss']
})
export class PdfViewerComponent implements OnInit, OnChanges, AfterViewInit {

	constructor(private storageData: StorageData, private activeModal: NgbActiveModal) { }

	@Input() pdfSourceLink: string
	ngOnInit() {


	}

	ngOnChanges(simpleChange: SimpleChanges) {

	}
	ngAfterViewInit() {
		let link = `${this.pdfSourceLink}&&authorization=Bearer ${this.storageData.getToken()}`;
		console.log(link)
		PDFObject.embed(link, "#pdfcontainer");
	}
	close() {
		this.activeModal.close()
	}
}
