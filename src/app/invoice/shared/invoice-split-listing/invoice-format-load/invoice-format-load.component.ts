import { MappingFilterObject } from './../../../../shared/filter/model/mapping-filter-object';
import { allTheSame, removeEmptyAndNullsFormObject } from '@appDir/shared/utils/utils.helpers';
import { ShareAbleFilter } from './../../../../shared/models/share-able-filter';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { EnumApiPath } from '@appDir/front-desk/billing/Models/searchedKeys-modal';
import { InvoiceBuilderEnumURLs } from '@appDir/front-desk/masters/builder-invoice/invoice-builder-enum-urls';
import { Page } from '@appDir/front-desk/models/page';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { OrderEnum, ParamQuery } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { AclService } from '@appDir/shared/services/acl.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { BillingEnum } from '@appDir/front-desk/billing/billing-enum';
import { InvoiceBuilderComponent } from '@appDir/front-desk/masters/builder-invoice/invoice-builder/invoice-builder.component';
import { InvoiceService } from '../../invoice.service';
import { NgSelectShareableComponent } from '@appDir/shared/ng-select-shareable/ng-select-shareable.component';
@Component({
	selector: 'app-invoice-format-load',
	templateUrl: './invoice-format-load.component.html',
	styleUrls: ['./invoice-format-load.component.scss'],
})
export class InvoiceFormatLoadComponent extends PermissionComponent implements OnInit {
	loadSpin: boolean = false;
	invoiceFormatList: any;
	billComingData: any[] = [];
	EnumApiPath = EnumApiPath;
	conditionalExtraApiParams={};
	page: Page;
	@Output() messageEvent = new EventEmitter<any>();
	@Output() resetList = new EventEmitter<any>();
	@Input () invoiceData:any;
	queryParams: ParamQuery;
	@Input() activationMessage: string;
	@Input() invoiceFormatsModal: any;
	eventsSubject: Subject<any> = new Subject<any>();
	@Input() selectedInvoiceObject: any;
	@Output() openInvoiceBuilderEvent = new EventEmitter();
	@ViewChild('invoiceNameSelect') invoiceNameSelect: NgSelectShareableComponent;
	@ViewChild('invoiceTypeSelect') invoiceTypeSelect: NgSelectShareableComponent;

	searchForm: FormGroup;
	bill_form: FormGroup;
	selectedMultipleFieldFiter: any = {
		speciality_ids: [],
		facility_ids: [],
		bill_ids: [],
		case_ids: [],
		patient_ids: [],
		pom_ids: [],
		packet_ids: [],
		case_type_ids: [],
		job_status: [],
		created_by_ids: [],
		bill_recipient_type_ids: [],

		firm_ids: [],
		doctor_ids: [],
		insurance_ids: [],
		patient_name: [],
	};
	currentInvoiceTemplate: number;
	selectedFacilityId: any;
	selectedBills: any[] = [];
	currentCaseId: number;
	templateId: number;
	filteredBills: any[] = [];
	isCaseIdSame: boolean = true;
	invoiceId: any;
	@ViewChild('pdfViewModal') invoiceShowsPdfDetails: any;
	invoiceBuilderComponent: InvoiceBuilderComponent;
	@ViewChild('invoiceBuilderComponentDetailsComponent') set setInvoiceBuilderCo(
		content: InvoiceBuilderComponent,
	) {
		debugger;
		if (content) {
			// initially setter gets called with undefined
			this.invoiceBuilderComponent = content;
		}
	}
	constructor(
		protected requestService: RequestService,
		private modalService: NgbModal,
		private toastrService: ToastrService,
		private rou: Router,
		public aclService: AclService,
		private fb: FormBuilder,
		private invoiceService: InvoiceService,
	) {
		super(aclService, rou);
		this.page = new Page();
		this.page.pageNumber = 0;
		this.page.size = 10;
		this.searchForm = this.fb.group({
			// case_id: [null],
			invoice_name: [null],
			invoice_category_id: [null],
		});
		this.bill_form = this.fb.group({
			bill_ids: [null],
		});
	}

	setPage(pageInfo) {
		let pageNum;
		pageNum = pageInfo.offset;
		this.page.pageNumber = pageInfo.offset;
		const pageNumber = this.page.pageNumber + 1;
		// this.queryParams = {
		//   filter:
		// order: OrderEnum.ASC,
		// per_page: this.page.size,
		// page: pageNumber,
		// pagination: true,}

		// per_page: this.page.size,
		// page: this.page.pageNumber,
		// pagination: true
	}
	ngOnInit() {
		// this.getInvoiceFormatList();
		//  this.dispalyUpdatedbill()
	}
	getInvoiceFormatList(queryParams?) {
		debugger;
		this.loadSpin = true;
		// if(queryParams1){
		//   queryParams = {
		//     order: OrderEnum.ASC,
		//     }
		// }
		// let filters = queryParams.filters

		this.subscription.push(
			this.requestService
				.sendRequest(
					InvoiceBuilderEnumURLs.Invoice_builder_List_Get,
					'GET',
					REQUEST_SERVERS.fd_api_url,
					queryParams,
				)
				.subscribe(
					(data: HttpSuccessResponse) => {
						if (data.status) {
							this.loadSpin = false;
							this.invoiceFormatList = data && data.result.data ? data.result.data : [];
							this.page.totalElements = data.result && data.result.total ? data.result.total : 0;
						}
					},
					(err) => {
						this.loadSpin = false;
					},
				),
		);
	}
	
	resetListing(){
		this.resetList.emit()
	}

	scrollUpInvoiceFormat() {
		const pageNumber = this.page.pageNumber + 1;
		let queryParams = {
			order: OrderEnum.ASC,
			per_page: this.page.size,
			page: pageNumber,
			pagination: true,
		};
		this.getInvoiceFormatList(queryParams);
	}
	NavigateToFormatCreation() {
		debugger;
		this.rou.navigate(['front-desk/masters/builder-invoice'], {
			queryParams: {
				isMaster: false,
			},
		});
	}

	resetDataFilter(){
		if (this.invoiceNameSelect){
		this.invoiceNameSelect.searchForm.reset();
		}
		if (this.invoiceTypeSelect){
		this.invoiceTypeSelect.searchForm.reset();
		}
	}

	getChange($event: any[], fieldName: string) {
		if ($event) {
			this.selectedMultipleFieldFiter[fieldName] = $event.map(
				(data) =>
					new MappingFilterObject(
						data.id,
						data.name,
						data.full_Name,
						data.facility_full_name,
						data.label_id,
						data.insurance_name,
						data.employer_name,
						data.created_by_ids,
                        data.updated_by_ids,
						
					),
			);
		}
	}

	selectionOnValueChange(e, Type?) {
		const info = new ShareAbleFilter(e);
		this.searchForm.patchValue(removeEmptyAndNullsFormObject(info));
		this.getChange(e.data, e.label);
		if (!e.data) {
			this.searchForm.controls[Type].setValue(null);
		}

		return;
		let queryParams = {
			page: 1,
			pagination: 1,
			per_page: 10,
			filter: true,
		};
		if (e['data']) {
			queryParams['invoice_name'] = String(e['data']['realObj']['invoice_name']);
			this.getInvoiceFormatList(queryParams);
		} else {
			this.getInvoiceFormatList(queryParams);
		}
	}

	filterRecords() {
		let queryParams = {
			filter: true,
			...this.searchForm.value,
		};
		this.getInvoiceFormatList(removeEmptyAndNullsFormObject(queryParams));
	}
	NavigateToInvoiceGenerate(templateId,row?) {
		// debugger;
		if (templateId) {
			//     this.rou.navigate(['front-desk/masters/builder-invoice'],{ queryParams: {id: templateId,comingFrom:'generate',
			//   changedisableToFalse:true,...this.selectedInvoiceObject
			// },
			// });
			let params = {
				id: templateId,
				comingFrom: 'generate',
				changedisableToFalse: true,
				isUnitButtonEnable:row && row['is_enable_unit_price']?true:false,
				...this.selectedInvoiceObject,
			};

			this.openInvoiceBuilderEvent.emit(params);
		}
	}

	generteInvoice(row, searchBillContent) {
		this.loadSpin = true;
		if (row.invoice_category_name == 'Invoice For Bill' && this.activationMessage == 'invoice') {
			this.invoiceFormatsModal.hide();
			this.templateId = row.id;
			const ngbModalOptions: NgbModalOptions = {
				backdrop: 'static',
				keyboard: false,
			};
			let route=this.router.url.split("/");
			this.conditionalExtraApiParams['case_ids']=(route && route[1] && route[1]=="front-desk")?[route[4]]:null;
			this.modalService.open(searchBillContent, ngbModalOptions);
			this.loadSpin = false;
		} else {
			this.NavigateToInvoiceGenerate(row.id,row);
			this.loadSpin = false;
		}
	}

	allBillDetail:any[] = [];
	getBillListInvoice($event) {
		this.allBillDetail = $event;
	}

	generateInvoiceForBills(invoiceBuilderContentModal) {
		let billDetailsObj:any[]=[];
		if (this.allBillDetail && this.allBillDetail['data']){
		this.allBillDetail['data'].forEach(bill=>{
			if (bill && bill.realObj){
			billDetailsObj.push(bill.realObj);
			}
		});
		let facility_id = billDetailsObj.map((bill=> bill.facility_id));
		let caseId = billDetailsObj.map((bill=> bill.case_id));
		let allSameFaclityId = allTheSame(facility_id);
		let allSameCaseId = allTheSame(caseId);
		this.currentCaseId = caseId[0];
		this.selectedFacilityId = facility_id[0];
		this.selectedBills = [...billDetailsObj.map((bill=> bill.id))]
		if (!allSameFaclityId || !allSameCaseId ){
			this.toastrService.error('Case ID & Practice must be same', 'Error');
		return false;
		}
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc payment-modal body-scroll',
		};
		this.modalService.open(invoiceBuilderContentModal, ngbModalOptions);
	}
	else {
		this.toastrService.error('Please Select Atleast 1 Bill Id', 'Error');
	}
	}



	refreshComponent(searchBillContent) {
		this.invoiceService.invoiceId.subscribe((invoiceId) => {
			this.invoiceId = invoiceId;
		});
			const ngbModalOptions: NgbModalOptions = {
				backdrop: 'static',
				keyboard: false,
				size: 'lg',
				windowClass: 'modal_extraDOc',
			};
			this.modalService.dismissAll(searchBillContent);
			this.modalService.open(this.invoiceShowsPdfDetails, ngbModalOptions);
	}
}
