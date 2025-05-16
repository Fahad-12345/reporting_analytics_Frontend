import { SelectionModel } from '@angular/cdk/collections';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Page } from '@appDir/front-desk/models/page';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { OrderEnum, ParamQuery } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { HttpSuccessResponse } from '@appDir/shared/modules/ngx-datatable-custom/models/http-responses.model';
import { RequestService } from '@appDir/shared/services/request.service';
import { Subscription } from 'rxjs';
import { InvoiceBillEnum } from '../invoice-bill-enum';
import { InvoiceService } from '../invoice.service';

@Component({
	selector: 'app-invoice-pdf-view',
	templateUrl: './invoice-pdf-view.component.html',
	styleUrls: ['./invoice-pdf-view.component.scss'],
})
export class InvoicePdfViewComponent implements OnInit {
	public loadSpin: boolean = false;
	@Input() invoiceId = '';
	@Input() invoice: any = {};
	invoice_to_Details_all: any[] = [];
	invoice_to_label = 'insurance';
	subscription: Subscription[] = [];
	page: Page = new Page();
	totalRows: number;
	queryParams: ParamQuery;
	Selection = new SelectionModel<Element>(true, []);
	newInvoice?: any = {};
	isCollapsed = false;
	isPatientTab = false;
	isOtherTab=false;
	isInsuranceTab = false;
	isEmployerTab = false;
	isLawyerTab = false;
	insuranceCount=0;
	employerCount=0;
	firmCount=0;
	// @ViewChild('pdfTabs') pdfTabs: NgbTabset;
	constructor(protected requestService: RequestService, private invoiceService: InvoiceService) {
		this.page.pageNumber = 1;
		this.page.size = 10;
	}

	ngOnInit() {
		this.getInvoice();
	}
	setPage(pageInfo) {
		let pageNum;
		this.Selection.clear();
		pageNum = pageInfo.offset;
		this.page.pageNumber = pageInfo.offset;
		const pageNumber = this.page.pageNumber + 1;
		let per_page = this.page.size;
		let queryparam = {
			invoice_to_label: this.invoice_to_label,
			invoice_id: this.invoiceId,
			order: OrderEnum.ASC,
			per_page: this.page.size,
			page: pageNumber,
			pagination: true,
		};
		this.getInvoiceToDocDetails({ ...queryparam });
	}
	getInvoiceToDocDetails(params) {
		this.loadSpin = true;
		this.subscription.push(
			this.requestService
				.sendRequest(
					InvoiceBillEnum.Invoice_To_DoC_View,
					'GET',
					REQUEST_SERVERS.fd_api_url,
					params,
					false,
					true,
				)
				.subscribe((data: any) => {
					debugger;
					if (data.status) {
						this.loadSpin = false;
						this.invoice_to_Details_all = [];
						this.invoice_to_Details_all =
							data['result'] && data['result']['data'] ? data['result']['data'] : [];
						this.totalRows = data.result.total;
					} else {
						this.loadSpin = false;
					}
				}),
		);
	}
	beforeChange(value) {
		debugger;
		this.invoice_to_label = value;
		switch (value) {
			case 'employer':
				this.loadSpin = true;
				this.setPage({ offset: 0 });
				break;
			case 'firm':
				this.loadSpin = true;
				this.setPage({ offset: 0 });
				break;
			case 'patient':
				this.loadSpin = true;
				this.setPage({ offset: 0 });
				break;
			case 'insurance':
				this.loadSpin = true;
				this.setPage({ offset: 0 });
				break;
			case 'other':
				this.loadSpin = true;
				this.setPage({ offset: 0 });
				break;
			default:
				this.invoice_to_label = '';
				this.setPage({ offset: 0 });
		}
	}
	getInvoice() {
		this.invoiceService.newInvoice.subscribe((res) => {
			this.newInvoice = res;
			console.log(res,'res')
		});
		if (this.newInvoice['status'] == false && this.invoice.invoice_to) {
			this.invoice.invoice_to.forEach((invoiceTo) => {
				if (invoiceTo.invoice_to_label === 'Insurance') {
					this.isInsuranceTab = true;
					let insuranceInvoiceLabel;
					insuranceInvoiceLabel=invoiceTo.name?invoiceTo.name.split(','):[];
					this.insuranceCount=insuranceInvoiceLabel.length;
				} else if (invoiceTo.invoice_to_label === 'Employer') {
					this.isEmployerTab = true;
					let employerInvoiceLabel;
					employerInvoiceLabel=invoiceTo.name?invoiceTo.name.split(','):[];
					this.employerCount=employerInvoiceLabel.length;
				} else if (invoiceTo.invoice_to_label === 'Firm') {
					let firmInvoiceLabel;
					firmInvoiceLabel=invoiceTo.name?invoiceTo.name.split(','):[];
					this.firmCount=firmInvoiceLabel.length;
					this.isLawyerTab = true;
				} else if (invoiceTo.invoice_to_label === 'Patient') {
					this.isPatientTab = true;
				}else if(invoiceTo.invoice_to_label==='Other'){
					this.isOtherTab=true;
				}
			});
		} else {
			this.newInvoice.invoice_to.forEach((invoiceTo) => {
				if (
					invoiceTo.invoice_to_label === 'insurance' ||
					invoiceTo.invoice_to_label === 'Insurance'
				) {
					this.isInsuranceTab = true;
					this.insuranceCount=this.insuranceCount+1;
					
				} else if (
					invoiceTo.invoice_to_label === 'employer' ||
					invoiceTo.invoice_to_label === 'Employer'
				) {
					this.isEmployerTab = true;
					this.employerCount=this.employerCount+1;
				} else if (
					invoiceTo.invoice_to_label === 'firm' ||
					invoiceTo.invoice_to_label === 'Firm' ||
					invoiceTo.invoice_to_label === 'lawyer'
				) {
					this.isLawyerTab = true;
					this.firmCount=this.firmCount+1;
				} else if (
					invoiceTo.invoice_to_label === 'patient' ||
					invoiceTo.invoice_to_label === 'Patient'
				) {
					this.isPatientTab = true;
				}else if(
					invoiceTo.invoice_to_label === 'other' ||
					invoiceTo.invoice_to_label === 'Other'
				){
					this.isOtherTab=true;
				}
			});
		}
		this.invoiceService.getInvoice({ status: false });
		this.showTabs();
	}
	showTabs() {
		if (this.isInsuranceTab) {
			this.invoice_to_label = 'Insurance';
		} else if (this.isEmployerTab) {
			this.invoice_to_label = 'Employer';
		} else if (this.isLawyerTab) {
			this.invoice_to_label = 'Firm';
		} else if (this.isPatientTab) {
			this.invoice_to_label = 'Patient';
		}else if(this.isOtherTab){
			this.invoice_to_label='Other';
		}
		this.setPage({ offset: 0 });
	}

}
