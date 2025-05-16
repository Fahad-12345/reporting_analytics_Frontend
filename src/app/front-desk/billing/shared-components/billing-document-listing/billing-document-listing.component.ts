import { Component, OnInit, SimpleChanges, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder } from '@angular/forms';
import { BillingService } from '../../service/billing.service';
// import { DocumentManagerServiceService } from '@appDir/shared/components/document-manager/services/document-manager-service.service';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { ToastrService } from 'ngx-toastr';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { Page } from '@appDir/front-desk/models/page';
import { SelectionModel } from '@angular/cdk/collections';
import { DocumentManagerServiceService } from '@appDir/front-desk/documents/services/document-manager-service.service';

@Component({
	selector: 'app-billing-document-listing',
	templateUrl: './billing-document-listing.component.html',
	styleUrls: ['./billing-document-listing.component.scss']
})
export class BillingDocumentListingComponent implements OnInit {
	page: Page = new Page()
	files: any[] = []
	totalRows: number;
	folderId: any
	@Input() patienDocument: any
	@Input() employerDocument: any
	@Input() InsuranceDocument: any
	@Input() AttorneyDocument: any
	showDocTable: boolean = false
	Selection = new SelectionModel<Element>(true, []);
	constructor(private storageData: StorageData) {
		this.page.pageNumber = 1;
		this.page.size = 10;
	}

	ngOnInit() {
		this.files = this.patienDocument ? this.patienDocument['documents'] : this.employerDocument ? this.employerDocument['documents'] : this.InsuranceDocument ? this.InsuranceDocument['documents'] : this.AttorneyDocument ? this.AttorneyDocument['documents'] : []
		this.page.totalElements = this.files.length
	}
	ngAfterViewInit() {
		this.showDocTable = true
	}
	masterToggle() {
		this.isSelected()
			? this.Selection.clear()
			: this.files
				.slice(0, this.totalRows)
				.forEach((row) => this.Selection.select(row));
	}
	openInWindow(url) {
		window.open(url);
	}
	getLinkwithAuthToken(link) {
		let token = this.storageData.getToken()
		if (token) {
			return `${link}&token=${token}`
		}
		else { return link }
	}
	isSelected() {
		this.totalRows = this.files.length;
		const numSelected = this.Selection.selected.length;
		const numRows = this.totalRows;
		return numSelected === numRows;
	}
	changeDocumentPageSize(event) {
		this.page.size = event
		this.Selection.clear();
	}
	changeDocumentPageNumber(event) {}
	generatePDF() {	}
	printMultipleFiles() { }
	openEmailModal(data) { }
}
