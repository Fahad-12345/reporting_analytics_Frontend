import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { unSubAllPrevious, parseHttpErrorResponseObject } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { Subscription } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { Page } from '@appDir/front-desk/models/page';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModalRef, NgbModal, NgbModalOptions, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ParamQuery, OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { HttpService } from '@appDir/front-desk/fd_shared/services/http.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { ToastrService } from 'ngx-toastr';
import { RequestService } from '@appDir/shared/services/request.service';
import { Title } from '@angular/platform-browser';
import { FacilityUrlsEnum } from '@appDir/front-desk/masters/practice/practice/utils/facility-urls-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { RegionUrlsEnum } from '@appDir/front-desk/masters/billing/billing-master/Region-Urls-Enum';
import { AclService } from '@appDir/shared/services/acl.service';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { getIdsFromArray, isEmptyObject, makeDeepCopyArray } from '@appDir/shared/utils/utils.helpers';
import { ErxService } from '../../erx.service';
import { BsModalService, BsModalRef, ModalDirective } from 'ngx-bootstrap/modal';
import { PharmacyDetailComponent } from '../pharmacy-detail/pharmacy-detail.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
@Component({
	selector: 'app-pharmacy-list',
	templateUrl: './pharmacy-list.component.html',
	styleUrls: ['./pharmacy-list.component.scss']
})
export class PharmacyListComponent extends PermissionComponent implements OnInit, OnDestroy, AfterViewInit {
	subscription: Subscription[] = [];
	pharmacy_list;
	pharmacyPage: Page = new Page();
	modalRef: NgbModalRef;
	pharmacy_offSet = 0;
	closeResult = '';
	pharmacyDetail;
	applyFilterValues: any = {};
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('pharmacyList') pharmacyListTable: DatatableComponent;
	customizedColumnComp: CustomizeColumnComponent;
	@ViewChild(CustomizeColumnComponent) set con(con: CustomizeColumnComponent) {
		if (con) { // initially setter gets called with undefined
		  this.customizedColumnComp = con;
		}
	}
	modalCols :any[] = [];
	columns: any[] = [];
	alphabeticColumns:any[] =[];
	colSelected: boolean = true;
	isAllFalse: boolean = false;
	pharmacyListtingTable: any;
	

	constructor(
		aclService: AclService,
		router: Router,
		private erxService: ErxService,
		protected requestService: RequestService,
		private fb: FormBuilder,
		private _route: ActivatedRoute,
		public datePipeService:DatePipeFormatService,
		private modalService: NgbModal,
		private toastrService: ToastrService,
		private storageData: StorageData,
		private localStorage: LocalStorage
		) {
		super(aclService)
	}

	ngOnInit() {
		this.getQueryParams();
		this.pharmacyListtingTable = this.localStorage.getObject('pharmacyTableList' + this.storageData.getUserId());
	}

	ngAfterViewInit() {
		if (this.pharmacyListTable?._internalColumns) {
			this.columns = makeDeepCopyArray([...this.pharmacyListTable._internalColumns]);
			this.columns.forEach(element => {
				if(this.pharmacyListtingTable.length) {
					let obj = this.pharmacyListtingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.pharmacyListtingTable.length) {
				const nameToIndexMap = {};
				this.pharmacyListtingTable.forEach((item, index) => {
					nameToIndexMap[item?.header] = index;
				});
				this.columns.sort((a, b) => nameToIndexMap[a?.name] - nameToIndexMap[b?.name]);
			}
			let columns = makeDeepCopyArray(this.columns);
			this.alphabeticColumns = columns.sort(function (a, b) {
				if (a.name < b.name) { return -1; }
				if (a.name > b.name) { return 1; }
				return 0;
			});
			this.onConfirm(false);
		}
	}

	getQueryParams() {
		this.subscription.push(
			this._route.queryParams.subscribe((params) => {
				this.Initia_set_page_setting(params);
			}),
		);
	}

	Initia_set_page_setting(queryParams) {
		this.pharmacyPage.pageNumber = queryParams.page ? queryParams.page : 1;
		this.pharmacyPage.size = queryParams.per_page ? queryParams.per_page : 10;
		let InitPage = {
			page: this.pharmacyPage.pageNumber,
			per_page: this.pharmacyPage.size,
		}
		this.get_pharmacy_data(InitPage);
	}
	// GET LISTS OF PHARMACY 
	get_pharmacy_data(pageSetting) {
		let queryParams;
		if (isEmptyObject(this.applyFilterValues)) {
			queryParams = {
				page: pageSetting.page,
				per_page: pageSetting.per_page,
				order: OrderEnum.DEC,
				pagination: true
			}
		} else {
			queryParams = {
				page: pageSetting.page,
				per_page: pageSetting.per_page,
				order: OrderEnum.DEC,
				pagination: true,
				organization_name: this.pharmacy_list.filterValues.organization_name ? this.pharmacy_list.filterValues.organization_name : '',
				address_line1: this.pharmacy_list.filterValues.address_line1 ? this.pharmacy_list.filterValues.address_line1 : '',
				zip_code: this.pharmacy_list.filterValues.zip_code ? this.pharmacy_list.filterValues.zip_code : '',
				city: this.pharmacy_list.filterValues.city ? this.pharmacy_list.filterValues.city : '',
				pharmacy_type_id: this.pharmacy_list.filterValues.pharmacy_type_id ? this.pharmacy_list.filterValues.pharmacy_type_id : '',
			}
		}
		this.erxService.addUrlQueryParams(queryParams);
		this.subscription.push(
			this.erxService.get_pharmacy_lists(queryParams).subscribe((pharmacyList: any) => {
				if (pharmacyList.status) {
					if (this.applyFilterValues) {
						pharmacyList['filterValues'] = this.applyFilterValues; // CHECK ONCE FILTER APPLY THEN ALWAYS CONCATE FILTER VALUES WHICH HAVE APPLIED
						this.pharmacy_list = pharmacyList;
					} else {
						this.pharmacy_list = pharmacyList;
					}

				}
			})
		);
	}

	get_filtered_data(filtered_data) {
		this.pharmacy_offSet = 0;
		this.pharmacyPage.size = filtered_data.result.per_page;
		this.applyFilterValues = filtered_data.filterValues; // FILTER VALUES FETCHED
		this.pharmacy_list = filtered_data;
		this.pharmacy_list = this.pharmacy_list;
	}
	// GET DETAIL OF PHARMACY
	pharmacy_detail_open_modal(selectedPharmacy, action, content): void {
		this.getPharmacyByID(selectedPharmacy, action, content); // GET SINGLE PHARMACY BY ID 
	}
	// GET THE PHARMACY PAGE SIZE
	set_pharmacy_page_size(pageSize) {
		this.pharmacyPage.size = pageSize;
		this.pharmacyPage.pageNumber = 1;
		this.pharmacy_offSet = 0;
		let queryPageSetting = {
			page: this.pharmacyPage.pageNumber,
			per_page: this.pharmacyPage.size,
		}
		this.get_pharmacy_data(queryPageSetting);
	}
	// GET THE PHARMACY PAGE NUMBER
	set_pharmacy_page_number(page) {
		this.pharmacy_offSet = page.offset;
		this.pharmacyPage.pageNumber = page.offset + 1;
		this.pharmacyPage.size = page.pageSize;
		let queryPageSetting = {
			page: this.pharmacy_offSet + 1,
			per_page: this.pharmacyPage.size,
		}
		this.get_pharmacy_data(queryPageSetting);
	}
	// GET THE PHARMACY BY ID AND SENDS TO COMPONENT WHERE WE NEED
	getPharmacyByID(selectedPharmacy, action, content) {
		this.subscription.push(
			this.erxService.getPharmacyByID(selectedPharmacy.id).subscribe((pharmacy: any) => {
				if (pharmacy.status) {
					this.pharmacyDetail = pharmacy.result.data;
					this.pharmacyDetail['action'] = action;
					this.setPharmacyDetail(content); // HERE WE HAD BEEN FETCHED THE DETAIL AND SEND DETAIL TO PHARMACY-DETAIL COMPONENT AND ALSO OPEN THE MODAL
				}
			})
		);
	}
	// OPEN THE MODAL WHERE WE DISPLAY THE FETCHED PHARMACY DETAILS
	setPharmacyDetail(modalRef) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false, size: 'lg', windowClass: 'modal_extraDOc'
		};
		this.modalService.open(modalRef, ngbModalOptions).result.then((result) => {
			this.closeResult = `Closed with: ${result}`;
		}, (reason) => {
			this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
		});
	}
	// FOR DISMISS THE MODAL
	private getDismissReason(reason: any): string {
		if (reason === ModalDismissReasons.ESC) {
			return 'by pressing ESC';
		} else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
			return 'by clicking on a backdrop';
		} else {
			return `with: ${reason}`;
		}
	}

	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}

	openCustomoizeColumn(CustomizeColumnModal) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal-lg-package-generate',
		};
		this.modalCols = [];
		let self = this;
		this.columns.forEach(element => {
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
			this.localStorage.setObject('pharmacyTableList' + this.storageData.getUserId(), data);
		}
		let groupByHeaderCol = getIdsFromArray(this.modalCols, 'header'); // pick header
		this.columns.sort(function (a, b) {
			return groupByHeaderCol.indexOf(a.name) - groupByHeaderCol.indexOf(b.name);
		});
		//set checked and unchecked on the base modal columns in alphabeticals columns
		this.alphabeticColumns.forEach(element => {
		let currentColumnIndex = findIndexInData(this.columns, 'name', element.name)
			if (currentColumnIndex != -1) {
				this.columns[currentColumnIndex]['checked'] = element.checked;
				this.columns = [...this.columns];
			}
		});
		// show only those columns which is checked
		let columnsBody = makeDeepCopyArray(this.columns);
		this.pharmacyListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.pharmacyListTable._internalColumns.sort(function (a, b) {
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
