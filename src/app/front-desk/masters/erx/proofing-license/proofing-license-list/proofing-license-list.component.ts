import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { Subscription } from 'rxjs';
import { Page } from '@appDir/front-desk/models/page';
import { NgbModalRef, NgbModal, NgbModalOptions, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { RequestService } from '@appDir/shared/services/request.service';
import { AclService } from '@appDir/shared/services/acl.service';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { changeDateFormat, getIdsFromArray, isEmptyObject, makeDeepCopyArray, removeEmptyAndNullsFormObject } from '@appDir/shared/utils/utils.helpers';
import { ErxService } from '../../erx.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
const ACTION = {
	VIEW: 'view',
	EDIT: 'edit',
	ADD: 'add',
}
@Component({
	selector: 'app-proofing-license-list',
	templateUrl: './proofing-license-list.component.html',
	styleUrls: ['./proofing-license-list.component.scss']
})
export class ProofingLicenseListComponent extends PermissionComponent implements OnInit, OnDestroy, AfterViewInit {
	subscription: Subscription[] = [];
	proofingLicenseList: any;
	applyFilterValues: any = {};
	proofingLicensePage: Page = new Page();
	modalRef: NgbModalRef;
	proofingLicenseOffSet = 0;
	closeResult = '';
	userStatus;
	proofingLicenseDetail: any = {};
	loadSpin = false;
	isDisabledGetNewLicense = false;
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('proofingLiscenceList') proofingLiscenceListTable: DatatableComponent;
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
	proofingLiscenceListtingTable: any;


	constructor(
		aclService: AclService,
		router: Router,
		private erxService: ErxService,
		protected requestService: RequestService,
		private toastrService: ToastrService,
		private _route: ActivatedRoute,
		public datePipeService: DatePipeFormatService,
		private modalService: NgbModal,
		private storageData: StorageData,
		private localStorage: LocalStorage
		) {
		super(aclService)
	}

	ngOnInit() {
		this.getQueryParams();
		this.proofingLiscenceListtingTable = this.localStorage.getObject('proofingLiscenceTableList' + this.storageData.getUserId());
	}

	ngAfterViewInit() {
		if (this.proofingLiscenceListTable?._internalColumns) {
			this.columns = makeDeepCopyArray([...this.proofingLiscenceListTable._internalColumns]);
			this.columns.forEach(element => {
				if(this.proofingLiscenceListtingTable.length) {
					let obj = this.proofingLiscenceListtingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.proofingLiscenceListtingTable.length) {
				const nameToIndexMap = {};
				this.proofingLiscenceListtingTable.forEach((item, index) => {
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

	Initia_set_page_setting(queryParams?) {
		this.proofingLicensePage.pageNumber = queryParams.page ? queryParams.page : 1;
		this.proofingLicensePage.size = queryParams.per_page ? queryParams.per_page : 10;
		this.setProofingLicenseOffSet(queryParams);
	
		let InitPage = {
			page: this.proofingLicensePage.pageNumber,
			per_page: this.proofingLicensePage.size,
		}
		this.getProofingLicenseData(InitPage);
	}
	// GET LISTS OF PROOFING LICENSE 
	getProofingLicenseData(pageSetting) {
		let queryParams;
		if (isEmptyObject(this.applyFilterValues)) {
			queryParams = {
				page: pageSetting.page,
				per_page: pageSetting.per_page,
				order: OrderEnum.DEC,
				pagination: true,
			}
		} else {
			const body = {
				exp_date: changeDateFormat(this.proofingLicenseList.filterValues.expiry_date),
				license_status: this.proofingLicenseList.filterValues.license_status,
				user_status: this.proofingLicenseList.filterValues.user_status
			}
			const param = removeEmptyAndNullsFormObject(body);
			queryParams = {
				page: pageSetting.page,
				per_page: pageSetting.per_page,
				order: OrderEnum.DEC,
				pagination: true,
				...param
			}
		}
		this.erxService.addUrlQueryParams(queryParams);
		this.loadSpin = true;
		this.subscription.push(
			this.erxService.getProofingLicenseLists(removeEmptyAndNullsFormObject(queryParams)).subscribe((proofingLicenseList: any) => {
				if (proofingLicenseList.status) {
					this.loadSpin = false;
					if (this.applyFilterValues) {
						proofingLicenseList['filterValues'] = this.applyFilterValues; // CHECK ONCE FILTER APPLY THEN ALWAYS CONCATE FILTER VALUES WHICH HAVE APPLIED
						this.proofingLicenseList = proofingLicenseList;
					} else {
						this.proofingLicenseList = proofingLicenseList;
					}
				}
			},
				(error) => {
					this.loadSpin = false;
				})
		);
	}

	get_filtered_data(filtered_data) {
		this.proofingLicenseOffSet = 0;
		this.proofingLicensePage.size = filtered_data.result.per_page;
		this.applyFilterValues = filtered_data.filterValues; // FILTER VALUES FETCHED
		this.proofingLicenseList = filtered_data;
		this.proofingLicenseList = this.proofingLicenseList;
	}
	// GET THE PROOFING LICENSE PAGE SIZE
	setProofingLicensePageSize(pageSize) {
		this.proofingLicensePage.size = pageSize;
		this.proofingLicensePage.pageNumber = 1;
		this.proofingLicenseOffSet = 0;
		let queryPageSetting = {
			page: this.proofingLicensePage.pageNumber,
			per_page: this.proofingLicensePage.size,
		}
		this.getProofingLicenseData(queryPageSetting);
	}
	// GET THE PROOFING LICENSE PAGE NUMBER
	setproofingLicensePageNumber(page) {
		this.proofingLicenseOffSet = page.offset;
		this.proofingLicensePage.pageNumber = page.offset + 1;
		this.proofingLicensePage.size = page.pageSize;
		let queryPageSetting = {
			page: this.proofingLicenseOffSet + 1,
			per_page: this.proofingLicensePage.size,
		}
		this.getProofingLicenseData(queryPageSetting);
	}
	// GET THE MEDICAL DOCTORS LISTS
	assignUserProofingLicenseByID(row, modalRef) {
		this.proofingLicenseDetail['action'] = 'Assign User';
		this.proofingLicenseDetail['proofingLicenseDetail'] = row;
		this.setProofingLicenseDetail(modalRef); // HERE WE HAD BEEN FETCHED THE DETAIL AND SEND DETAIL TO PROOFING LICENSE DETAIL COMPONENT AND ALSO OPEN THE MODAL
	}
	// OPEN THE MODAL WHERE WE DISPLAY THE FETCHED PROOFING LICENSE DETAILS
	setProofingLicenseDetail(modalRef) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'overflow_unset',
		};
		this.modalService.open(modalRef, ngbModalOptions).result.then((result) => {
			this.closeResult = `Closed with: ${result}`;
		}, (reason) => {
			this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
		});
	}
	// ADD NEW / GET NEW LICENSE
	getLicense() {
		this.loadSpin = true;
		this.isDisabledGetNewLicense = true;
		this.subscription.push(
			this.erxService.getNewLicense().subscribe((proofingLicense: any) => {
				if (proofingLicense.status) {
					this.loadSpin = false;
					this.isDisabledGetNewLicense = false;
					this.toastrService.success(proofingLicense.message, 'Success');
					this.Initia_set_page_setting({});
				} else {
					this.isDisabledGetNewLicense = false;
				}
			},
				(error) => {
					this.isDisabledGetNewLicense = false;
					this.loadSpin = false;
				})
		);
	}
	// WHEN ANY PROVIDER OR USER ATTACHED THEN AGAIN FETCHED LISTING OF LICENSE
	reRunLicenseLists() {
		this.erxService.isLicenseAttached.subscribe(resp => {
			if (resp) {
				this.proofingLicenseOffSet = 0;
				this.Initia_set_page_setting();

			}
		})
	}
	// RENEWAL PROOFING LICENCE
	proofingLicenseRevoke(id?: any) {
		this.loadSpin = true;
		const param = {'user_id': id};
		this.subscription.push(
			this.erxService.revokeProofing(param).subscribe((revoke: any) => {
				if (revoke.status) {
					this.loadSpin = false;
					this.toastrService.success(revoke.message, 'Success');
					let InitPage = {
						page: this.proofingLicensePage.pageNumber,
						per_page: this.proofingLicensePage.size,
					}
					this.getProofingLicenseData(InitPage);
				}
			},
				(error) => {
					this.loadSpin = false;
				})
		);
	}
	// REVOKE PROOFING LICENCE
	proofingLicenseRenewal(row) {
		const queryParams = {
			account_id: row.account_id
		}
		this.loadSpin = true;
		this.subscription.push(
			this.erxService.renewalProofing(queryParams).subscribe((revoke: any) => {
				if (revoke.status) {
					this.loadSpin = false;
					this.toastrService.success(revoke.message, 'Success');
				}
			},
				(error) => {
					this.loadSpin = false;
				})
		);
	}
	// ON ATTACHED LICENSE SUCCESSFULLY
	OnLicenseAttachedSuccessfully() {
		const queryParams = {
			order: "DESC",
			page: "1",
			pagination: true,
			per_page: "10",
		}
		this.proofingLicenseOffSet = 0;
		this.Initia_set_page_setting(queryParams);
	}
	// SET OFF SET 
	setProofingLicenseOffSet(queryParams?) {
		if(queryParams.page == 1) {
			this.proofingLicenseOffSet = 0;
		} else {
			this.proofingLicenseOffSet = queryParams.page ? queryParams.page : 0;
		}
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
			this.localStorage.setObject('proofingLiscenceTableList' + this.storageData.getUserId(), data);
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
		this.proofingLiscenceListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.proofingLiscenceListTable._internalColumns.sort(function (a, b) {
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
