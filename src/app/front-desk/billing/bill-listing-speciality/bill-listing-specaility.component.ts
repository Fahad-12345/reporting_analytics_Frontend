import { Page } from './../../../shared/models/listing/page';
import { ToastrService } from 'ngx-toastr';
import { AclService } from './../../../shared/services/acl.service';
import { RequestService } from './../../../shared/services/request.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import {
	Component,
	OnInit,	OnDestroy, ViewChild,
} from '@angular/core';
import { IFilterFieldHtml } from '@appDir/shared/filter/model/filter-field-html-model';
import { SpecialityFilterFieldModel } from '@appDir/shared/filter/model/speciality-filter-field-model';
import { BillingService } from '../service/billing.service';
import { Location } from '@angular/common';
import { BillRecptent } from '../Models/billing.model';
import { FilterModelQueryPassInFormField } from '@appDir/shared/filter/model/filter-model-query-pass-in-form-field';
import { FilterModelQueryPassInApi } from '@appDir/shared/filter/model/filter-model-query-pass-in-api';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { getIdsFromArray, makeDeepCopyArray, removeEmptyAndNullsArraysFormObject } from '@appDir/shared/utils/utils.helpers';
import * as $ from 'jquery';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { bill_status } from '../billing-enum';

@Component({
	selector: 'app-bill-spciality-listing',
	templateUrl: './bill-listing-specaility.component.html',
	styleUrls: ['./bill-listing-specaility.component.scss'],
})
export class BillSpecailityListingComponent
	extends PermissionComponent
	implements OnInit, OnDestroy {
	loadSpin: boolean = false;
	specalityFiled: IFilterFieldHtml = new SpecialityFilterFieldModel();
	page: Page = new Page();
	filterInfoObject :any = {};
	billListSpecality: any[] = [];
	formFiledValue: any;
	formFiledListOfValue: any;
	subscription: any[] =[];
	selectedBillRecpitent: BillRecptent[] = [];

	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('maintable') billSpecialityReportListTable: DatatableComponent;
	customizedColumnComp: CustomizeColumnComponent;
	@ViewChild(CustomizeColumnComponent) set con(con: CustomizeColumnComponent) {
		if (con) { // initially setter gets called with undefined
			this.customizedColumnComp = con;
		}
	}
	modalCols :any[] = [];
	cols: any[] = [];
	alphabeticColumns:any[] =[];
	colSelected: boolean = true;
	isAllFalse: boolean = false;
	billSpecialityReportsListingTable: any;

	constructor(
		public aclService: AclService,
		protected requestService: RequestService,
		private _route: ActivatedRoute,
		private _router: Router,
		titleService: Title,
		private billService: BillingService,
		private modalService: NgbModal,
		private location: Location,
		private toastrService: ToastrService,
		public commonService:DatePipeFormatService,
		private storageData: StorageData,
		private localStorage: LocalStorage
	) {
		super(aclService, _router, _route, requestService, titleService);
	}

	ngOnInit() {
		this.subscription.push(
			this._route.queryParams.subscribe((params) => {
				// this.formFiledValue = new FilterModelQuery(params);
				this.formFiledListOfValue = new FilterModelQueryPassInFormField(params);
				this.formFiledValue = new FilterModelQueryPassInApi(params);  
				this.filterInfoObject = new FilterModelQueryPassInApi(params);
				this.page.pageNumber = parseInt(params.page) || 1;
				this.page.size = parseInt(params.per_page) || 10;
				this.page.offset = this.page.pageNumber - 1;
			}),
		);
		this.billSpecialityReportsListingTable = this.localStorage.getObject('billSpecialityReportsTableList' + this.storageData.getUserId());
	}

	ngAfterViewInit() {
		if (this.billSpecialityReportListTable?._internalColumns) {
			this.cols = makeDeepCopyArray([...this.billSpecialityReportListTable._internalColumns]);
			this.cols.forEach(element => {
				if(this.billSpecialityReportsListingTable?.length) {
					let obj = this.billSpecialityReportsListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.billSpecialityReportsListingTable?.length) {
				const nameToIndexMap = {};
				this.billSpecialityReportsListingTable.forEach((item, index) => {
					nameToIndexMap[item?.header] = index;
				});
				this.cols.sort((a, b) => nameToIndexMap[a?.name] - nameToIndexMap[b?.name]);
			}
			let cols = makeDeepCopyArray(this.cols);
			this.alphabeticColumns = cols.sort(function (a, b) {
				if (a.name < b.name) { return -1; }
				if (a.name > b.name) { return 1; }
				return 0;
			});
			this.onConfirm(false);
		}
	}

	pageLimit($event) {
		this.page.size = Number($event);
		this.page.offset = 0;
		this.page.pageNumber = 1;
		this.getSpecialityOfBILL(this.paramsObject(this.filterInfoObject));
	}
	
	onPageChange(pageInfo){
		this.page.offset = pageInfo.offset;
		this.page.pageNumber = pageInfo.offset + 1;
		this.getSpecialityOfBILL(this.paramsObject(this.filterInfoObject));
	}


	getSpecialityOfBILL(params: any) {
		this.loadSpin = true;
		const param = removeEmptyAndNullsArraysFormObject(params);
		this.addUrlQueryParams(param);
		const paramData = new FilterModelQueryPassInApi(param);
		paramData['bill_type_ids'] = [2];
		this.billService.getListOfSpecialityBill(removeEmptyAndNullsArraysFormObject(paramData)).subscribe((comingData: any) => {
			if (comingData['status'] == 200 || comingData['status'] == true) {
				this.loadSpin = false;
				this.billListSpecality = comingData.result ? [...comingData.result.data] : [];
				this.page.totalElements = comingData.result.total;
				this.page.totalPages = comingData.result.last_page;
			}
			setTimeout(() => {
				$('datatable-body').scrollLeft(1);
			}, 50);
		},
		(err) => {
			this.loadSpin = false;
		});
	}

	ngOnDestroy() {}

	filterResponseData(filterInfo: any) {
		debugger;
		this.filterInfoObject = filterInfo;
		this.page.offset = 0;
		this.page.pageNumber = 1;
		this.getSpecialityOfBILL(this.paramsObject(this.filterInfoObject));
	}

	setBillType(type_id) {
		switch (type_id) {
			case 1: {
				// if ((!('patient_ids' in this.filterInfoObject ))|| this.filterInfoObject['patient_ids'].length==0){
				// 	this.selectedBillRecpitent =[];
				// 	this.toastrService.error('Select Patient', 'Error');
				// 	return false;
				// }
			if (this.filterInfoObject['patient_ids'] && ((('patient_ids' in this.filterInfoObject ))|| this.filterInfoObject['patient_ids'].length!=0)){
				this.selectedBillRecpitent.push({
					type_id:type_id,
					ids: this.filterInfoObject['patient_ids'][0]
				});
				}
				else {
					this.selectedBillRecpitent.push({
						type_id:type_id,
						ids:null
					});
				}
				break;
			}
			case 2: {
				
				// if ( (!('employer_ids' in this.filterInfoObject )) || this.filterInfoObject['employer_ids'].length==0){
				// 	this.selectedBillRecpitent =[];
				// 	this.toastrService.error('Select Employer', 'Error');
				// 	return false;
				// }
				if (this.filterInfoObject['employer_ids'] && ((('employer_ids' in this.filterInfoObject )) || this.filterInfoObject['employer_ids'].length!=0)){
				this.selectedBillRecpitent.push({
					type_id:type_id,
					ids:this.filterInfoObject['employer_ids']
				});
				}
				else {
					this.selectedBillRecpitent.push({
						type_id:type_id,
						ids:null
					});
				}
				break;
			}
			case 3: {
				
				// if ((!('insurance_ids' in this.filterInfoObject)) || this.filterInfoObject['insurance_ids'].length==0){
				// 	this.selectedBillRecpitent =[];
				// 	this.toastrService.error('Select Insurance', 'Error');
				// 	return false;
				// }
				if (this.filterInfoObject['insurance_ids'] &&((('insurance_ids' in this.filterInfoObject)) || this.filterInfoObject['insurance_ids'].length!=0)){
				this.selectedBillRecpitent.push({
					type_id:type_id,
					ids:this.filterInfoObject['insurance_ids']
				});
				}
				else {
					this.selectedBillRecpitent.push({
						type_id:type_id,
						ids:null
					});
				}
				break;
			}
			case 4: {
				// if ((!('attorney_ids' in this.filterInfoObject)) || this.filterInfoObject['attorney_ids'].length==0){
				// 	this.selectedBillRecpitent =[];
				// 	this.toastrService.error('Select Attorney', 'Error');
				// 	return false;
				// }
				debugger;
			if (this.filterInfoObject['firm_ids'] && ((('firm_ids' in this.filterInfoObject)) || this.filterInfoObject['firm_ids'].length!=0)){
				this.selectedBillRecpitent.push({
					type_id:type_id,
					ids:this.filterInfoObject['firm_ids']
				});
				}
				else {
					this.selectedBillRecpitent.push({
						type_id:type_id,
						ids:null
					});
				}
				break;
			}

			
		}
	}

	moveToBillListingComponent(row: any){
		if(row?.bill_status_id == bill_status.packet_created){
			this.toastrService.error('These Bills Packet Already Created', 'Error');
			return;
		}
		this.formFiledValue;
		this.filterInfoObject;
		let filterParam = {
			speciality_ids: [row.speciality_id],
			bill_status_ids: [row.bill_status_id],
			facility_ids: [row.facility_location_id],
			case_type_ids: [row.case_type_id],
			generate_packet: true,
			per_page:10,
			page:1
		}
	   let billRecpitent:any[]= this.filterInfoObject['bill_recipient_type_ids'];
		if(billRecpitent && billRecpitent.length!=0){
			billRecpitent.forEach((bills,index)=>{
				this.setBillType(bills);
			});
			this.selectedBillRecpitent;
			if (billRecpitent && billRecpitent.length!=0){
				filterParam['recipients'] = JSON.stringify(this.selectedBillRecpitent);
				filterParam['firm_ids']  = this.filterInfoObject['firm_ids'] &&  this.filterInfoObject['firm_ids'].length !=0 ?  this.filterInfoObject['firm_ids'] : [];
				filterParam['insurance_ids']  = this.filterInfoObject['insurance_ids'] && this.filterInfoObject['insurance_ids'].length !=0 ? this.filterInfoObject['insurance_ids']: [];
				filterParam['employer_ids']  = this.filterInfoObject['employer_ids'] &&  this.filterInfoObject['employer_ids'].length !=0 ? this.filterInfoObject['employer_ids']: [];
				filterParam['patient_ids']  = this.filterInfoObject['patient_ids'] && this.filterInfoObject['patient_ids'].length !=0 ? [this.filterInfoObject['patient_ids']]: [];
				filterParam['bill_recipient_type_ids']  = this.filterInfoObject['bill_recipient_type_ids'] ? this.filterInfoObject['bill_recipient_type_ids']: [];
				filterParam['bill_ids']  = this.filterInfoObject['bill_ids'] ? this.filterInfoObject['bill_ids']: [];
				filterParam['case_ids']  = this.filterInfoObject['case_ids'] ? this.filterInfoObject['case_ids']: [];
				filterParam['created_by_ids']  = this.filterInfoObject['created_by_ids'] ? this.filterInfoObject['created_by_ids']: [];
				filterParam['bill_date']  = this.filterInfoObject['bill_date'] ? this.filterInfoObject['bill_date']: [];
				filterParam['doctor_ids']  = this.filterInfoObject['doctor_ids'] ? this.filterInfoObject['doctor_ids']: [];			
				filterParam['bill_date_range1']  = this.filterInfoObject['bill_date_range1'] ? this.filterInfoObject['bill_date_range1']: [];	
				filterParam['bill_date_range2']  = this.filterInfoObject['bill_date_range2'] ? this.filterInfoObject['bill_date_range2']: [];	
				filterParam['visit_date_range_1']  = this.filterInfoObject['visit_date_range_1'] ? this.filterInfoObject['visit_date_range_1']: [];	
				filterParam['visit_date_range_2']  = this.filterInfoObject['visit_date_range_2'] ? this.filterInfoObject['visit_date_range_2']: [];	
				filterParam['name']  = this.filterInfoObject['name'] ? this.filterInfoObject['name']: [];	
				this.router.navigate(['/bills/bill-list'], { queryParams: removeEmptyAndNullsArraysFormObject(filterParam) });
			}	
		}
		else {
			this.toastrService.error('Select Bill Recipients', 'Error');
		}
	}
	
	paramsObject(result = {}){
		let params = {
			...result,
			per_page: this.page.size || 10,
			pagination:1, 
			page:this.page.pageNumber
		}
		return params;
	}

	/**
	 * Queryparams to make unique URL
	 * @param params
	 * @returns void
	 */
	 addUrlQueryParams(params: any): void {
		this.location.replaceState(this._router.createUrlTree([], { queryParams: params }).toString());
	}

	billReportHistoryStats(row) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc body-scroll history-modal',
			modalDialogClass: 'modal-lg'
		};
		let modelRef = this.modalService.open(CreatedHistoryComponent,ngbModalOptions);
		modelRef.componentInstance.createdInformation = [row];
	}
	openCustomoizeColumn(CustomizeColumnModal) {
		const ngbModalOptions: NgbModalOptions = {
		  backdrop: 'static',
		  keyboard: false,
		  windowClass: 'modal-lg-package-generate',
		};
		this.modalCols = [];
		let self = this;
		this.cols.forEach(element => {
			let obj = self.alphabeticColumns.find(x => x?.name === element?.name);
			if(obj) {
				this.modalCols.push({ header: element?.name, checked: obj?.checked });
			}
		});
		this.CustomizeColumnModal.show();
	  }
	  
	  onConfirm(click) {
		if (this.isAllFalse && !this.colSelected){
			this.toastrService.error('At Least 1 Column is Required.','Error');
			return false;
		}
		if(click) {
			this.customizedColumnComp;
			this.modalCols = makeDeepCopyArray(this.customizedColumnComp?.modalCols)
			let data: any = [];
			this.modalCols.forEach(element => {
				if(element?.checked) {
					data.push(element);
				}
				let obj = this.alphabeticColumns.find(x => x?.name === element?.header);
				if (obj) {
					if (obj.name == element.header) {
						obj.checked = element.checked;
					}
				}
			});
			this.localStorage.setObject('billSpecialityReportsTableList' + this.storageData.getUserId(), data);
		}
		let groupByHeaderCol = getIdsFromArray(this.modalCols, 'header'); // pick header
		this.cols.sort(function (a, b) {
		  return groupByHeaderCol.indexOf(a.name) - groupByHeaderCol.indexOf(b.name);
		});
		//set checked and unchecked on the base modal columns in alphabeticals columns
		this.alphabeticColumns.forEach(element => {
		let currentColumnIndex = findIndexInData(this.cols, 'name', element.name)
		  if (currentColumnIndex != -1) {
			this.cols[currentColumnIndex]['checked'] = element.checked;
			this.cols = [...this.cols];
		  }
		});
		// show only those columns which is checked
		let columnsBody = makeDeepCopyArray(this.cols);
		this.billSpecialityReportListTable._internalColumns = columnsBody.filter(c => {
		  return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.billSpecialityReportListTable._internalColumns.sort(function (a, b) {
		  return groupByHeader.indexOf(a.name) - groupByHeader.indexOf(b.name);
		});
		window.dispatchEvent(new Event('resize'));
		this.CustomizeColumnModal.hide();
	}

	onCancel() {
		this.CustomizeColumnModal.hide();
	}

	onSelectHeaders(isChecked) {
		this.colSelected = isChecked;
		if(!isChecked) {
			this.isAllFalse = true;
		}
	}

	onSingleSelection(isChecked) {
		this.isAllFalse = isChecked;
		if(isChecked) {
			this.colSelected = false;
		}
	}
}
