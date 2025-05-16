import {
	Component,
	OnInit,
	Input,
	ChangeDetectionStrategy,
	LOCALE_ID,
	Output,
	EventEmitter,
	OnDestroy,
	SimpleChanges,
	ViewChild,
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Patient } from '../../../../shared/types/patient';
import { SelectionModel } from '@angular/cdk/collections';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';

import { AclRedirection } from '@appDir/shared/services/acl-redirection.service';
import { AclService } from '@appDir/shared/services/acl.service';
import { Page } from '@appDir/front-desk/models/page';
import {
	unSubAllPrevious,
} from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { RequestService } from '@appDir/shared/services/request.service';
import { NgbModalRef, NgbModal, NgbModalOptions, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { PatientListingUrlsEnum } from '@appDir/front-desk/patient/patient-listing/PatientListing-Urls-Enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { ToastrService } from 'ngx-toastr';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { getIdsFromArray, makeDeepCopyArray } from '@appDir/shared/utils/utils.helpers';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
@Component({
	selector: 'app-patient-listing',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './patient-listing.component.html',
	styleUrls: ['./patient-listing.component.scss'],
})
export class PatientListingComponent extends PermissionComponent implements OnInit, OnDestroy {
	subscription: Subscription[] = [];
	@Input() patientRows: any[];
	@Input() totalRows: number;
	@Input() pageNumber: any[];
	@Input() pageSize: any[];
	@Input() hideDelButton: boolean;
	@Output() setPage: EventEmitter<any> = new EventEmitter();
	@Output() pageLimitChange: EventEmitter<any> = new EventEmitter();
	@Output() selectedRowsOfPatients = new EventEmitter<Patient[]>();
	@Output() id: EventEmitter<any> = new EventEmitter();
	public capabilities: any;
	selection = new SelectionModel<Element>(true, []);
	public selectedRows: Patient[];
	public selectedRowsString: string;
	page: Page;
	form: FormGroup;
	closeResult: string;
	patientPharmacies;
	data: any;
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('patientList') patientListTable: DatatableComponent;
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
	patientsListingTable: any;

	constructor(
		public route: ActivatedRoute,
		_aclRedirection: AclRedirection,
		public aclService: AclService,
		router: Router,
		protected requestService: RequestService,
		private modalService: NgbModal,
		public datePipeService:DatePipeFormatService,
		public customDiallogService: CustomDiallogService,
		private toastrService: ToastrService,
		private storageData: StorageData,
		private localStorage: LocalStorage
	) {
		super(aclService, router);
		this.selectedRows = [];
	}
	ngOnChanges(changes?: SimpleChanges) {
		if (this.patientRows && this.patientRows.length) {
			this.patientRows = [...this.patientRows]
		}
		if(this.hideDelButton) {
			this.selection.clear();
		}
	}
	ngOnInit() {
		this.patientsListingTable = this.localStorage.getObject('patientsTableList' + this.storageData.getUserId());
	}
	ngAfterViewInit() {
		if (this.patientListTable?._internalColumns) {
			this.columns = makeDeepCopyArray([...this.patientListTable._internalColumns]);
			this.columns.forEach(element => {
				if(this.patientsListingTable.length) {
					let obj = this.patientsListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.patientsListingTable.length) {
				const nameToIndexMap = {};
				this.patientsListingTable.forEach((item, index) => {
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
	pageLimit($num) {
		this.selection.clear();
		this.pageLimitChange.emit($num);
	}
	isAllSelected() {
		this.selectedRowsString = JSON.stringify(this.selection.selected);
		const numSelected = this.selection.selected.length;
		const numRows = this.patientRows.length;
		return numSelected === numRows;
	}
	stringfy(obj) {
		return JSON.stringify(obj);
	}
	/** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggle(event) {
		this.isAllSelected()
			? this.selection.clear()

			: this.patientRows.forEach((row) => this.selection.select(row));
	}
	// GET DETAIL OF PHARMACY
	pharmacy_detail_open_modal(selectedPatient, content): void {
		this.getPatientByID(selectedPatient, content); // GET SINGLE PHARMACY DETAIL BY PATIENT ID 
	}
	getPatientByID(selectedPatient, content) {
		let queryParams = {
			filter: true,
			per_page: 10,
			page: 1,
			pagination: 1,
			order_by: OrderEnum.DEC,
			id: selectedPatient.id
		};
		let requestData = { ...queryParams };
		this.requestService.sendRequest(PatientListingUrlsEnum.Patient_Get, 'get', REQUEST_SERVERS.kios_api_path, requestData).subscribe((res:any) => {
			this.patientPharmacies =  res.result.data[0];
			this.setPharmacyDetail(content); // HERE WE HAD BEEN FETCHED THE DETAIL AND SEND DETAIL TO PHARMACY-DETAIL COMPONENT AND ALSO OPEN THE MODAL
		})
	}

	// OPEN THE MODAL WHERE WE DISPLAY THE FETCHED PHARMACY DETAILS
	setPharmacyDetail(modalRef) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false, size: 'lg', windowClass: 'modal_extraDOc body-scroll'
		};
		this.modalService.open(modalRef, ngbModalOptions).result.then((result) => {
			this.closeResult = `Closed with: ${result}`;
		}, (reason) => {
			this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
		});
	}
	showPharmacyOfPatient() {
		const body = [
			{
				"id": 21,
				"ncpdp_id": "0000007",
				"store_no": "0007",
				"organization_name": "QAINTERFACE",
				"address_line1": "LINDBERG DR",
				"address_line2": null,
				"city": "CORAOPOLIS",
				"state_province": "PA",
				"postal_code": "15108",
				"country_code": "US",
				"standardized_address_line1": "Lindberg Dr",
				"standardized_address_line2": null,
				"standardized_city": "Coraopolis",
				"standardized_state_province": "PA",
				"standardized_postal": "15108",
				"primary_telephone": "4124741167",
				"primary_telephone_ext": null,
				"primary_telephone_support_sms": null,
				"is_active": 1,
				"fax": "4124741074",
				"fax_ext": null,
				"fax_support_sms": null,
				"electronic_mail": null,
				"active_start_time": "2010-08-20 00:00:00",
				"active_end_time": "2099-12-31 00:00:00",
				"partner_account": null,
				"last_modified_date": "2017-01-24 17:38:40",
				"cross_street": null,
				"record_change": null,
				"old_service_level": null,
				"version": "v10_6",
				"npi": "1234524316",
				"replace_ncpdp_id": null,
				"state_license_number": null,
				"upin": null,
				"facility_id": null,
				"medicare_number": null,
				"medicaid_number": null,
				"payer_id": null,
				"dea_number": "AS9999991",
				"hin": null,
				"mutually_defined": "sure it is",
				"direct_address": null,
				"organization_type": "Pharmacy",
				"organization_id": "17",
				"parent_organization_id": null,
				"latitude": "40.50414800",
				"longitude": "-80.19637900",
				"precise": 0,
				"use_case": "\r\n",
				"state_address": null,
				"pivot": {
					"patient_id": 2,
					"pharmacy_id": 21,
					"default": 1
				}
			}
		]
		this.patientPharmacies = body;
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
	nextPage(event) {
		this.data = event;
		this.selection.clear();
		this.setPage.emit(event);
	}
	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}
	/**
	 * to delete confirmation
	 */
	confirmDel(id?: number) {
		this.customDiallogService
		.confirm(`Delete ${id ? 'Patient' : this.selection.selected.length === 1 ? 'Patient' : 'Patients'}`, `Do you really want to delete ${id ? 'this Patient?' :
		this.selection.selected.length === 1 ? 'this Patient?' : 'these Patients?'}`)
		.then((confirmed) => {
			if (confirmed) {
				this.deleteSelected(id);
			}
		})
		.catch();
	}

	deleteSelected(id?: number) {
		let ids: any = [];
		if (id) {
			ids.push(id);
		} else {
			this.selection.selected.forEach(function (obj) {
				ids.push(obj.id);
			});
		}
		const tempData = JSON.parse(localStorage.getItem('cm_data'));
		const userId = tempData.user_id;
		let requestData = {
			ids: ids,
			user_id: userId
		};
		this.subscription.push(
			this.requestService
			  .sendRequest(
				PatientListingUrlsEnum.Patient_Delete,
				'delete_with_body',
				REQUEST_SERVERS.kios_api_path,
				requestData
			  )
			  .subscribe(
				(res: any) => {
					if(res?.message.includes('successfully')) {
						this.toastrService.success(res?.message, 'Success');
						this.selection.clear();
						let data = {
							count: this.totalRows,
							limit: this.pageSize,
							offset: 0,
							pageSize: 10
						}
						this.setPage.emit(this.data ? this.data : data);
					}
					else {
						this.toastrService.error(res?.message, 'Error');
					}
				},
				(err) => {
					this.toastrService.error(err?.error?.message, 'Error');
				},
			),
		);
	}

	patientHistoryStats(row) {
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
			this.localStorage.setObject('patientsTableList' + this.storageData.getUserId(), data);
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
		this.patientListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.patientListTable._internalColumns.sort(function (a, b) {
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
