import { ReferringPhysicianService } from './../../referring-physician.service';
import { Page } from '@appDir/front-desk/models/page';
import { Location } from '@angular/common';
import {
	NgbModalRef,
	NgbModal,
	NgbModalOptions,
	ModalDismissReasons,
} from '@ng-bootstrap/ng-bootstrap';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { RequestService } from '@appDir/shared/services/request.service';
import { AclService } from '@appDir/shared/services/acl.service';
import {
	changeDateFormat,
	checkForValue,
	getIdsFromArray,
	isEmptyObject,
	makeDeepCopyArray,
	removeEmptyAndNullsFormObject,
	unSubAllPrevious,
	history
} from '@appDir/shared/utils/utils.helpers';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { ActionEnum } from '@appDir/front-desk/masters/reason-code/reasonCodeEnum';
import { Subscription } from 'rxjs';
import { ReactionService } from '@appDir/front-desk/masters/reactions/reaction.service';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { SelectionModel } from '@angular/cdk/collections';
import { environment } from 'environments/environment';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { USERPERMISSIONS } from '@appDir/front-desk/UserPermissions';

@Component({
	selector: 'app-physician-list',
	templateUrl: './physician-list.component.html',
	styleUrls: ['./physician-list.component.scss'],
})
export class PhysicianListComponent implements OnInit, OnDestroy {
	action = ActionEnum;
	environment= environment;
	subscription: Subscription[] = [];
	physicianList: any;
	applyFilterValues: any = {};
	physicianPage: Page = new Page();
	modalRef: NgbModalRef;
	physicianOffSet = 0;
	closeResult = '';
	userStatus;
	physicianDetail: any = {};
	loadSpin = false;
	selection: any = new SelectionModel<Element>(true, []);
	reportsTotalRows: number;

	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('phyList') physicianListTable: DatatableComponent;
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
	physicianListingTable: any;
	userPermissions = USERPERMISSIONS;

	constructor(
		public aclService: AclService,
		private router: Router,
		private reactionService: ReactionService,
		private _route: ActivatedRoute,
		protected requestService: RequestService,
		private toastrService: ToastrService,
		private location: Location,
		public datePipeService: DatePipeFormatService,
		private referringPhysicianService: ReferringPhysicianService,
		private customDiallogService: CustomDiallogService,
		private modalService: NgbModal,
		private storageData: StorageData,
		private localStorage: LocalStorage
	) {}

	ngOnInit() {
		this.getQueryParams();
		this.reRunPhysicianLists();
		this.physicianListingTable = this.localStorage.getObject('physicianMasterTableList' + this.storageData.getUserId());
	}
	ngAfterViewInit() {
		if (this.physicianListTable?._internalColumns) {
			this.columns = makeDeepCopyArray([...this.physicianListTable._internalColumns]);
			this.columns.forEach(element => {
				if(this.physicianListingTable.length) {
					let obj = this.physicianListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.physicianListingTable.length) {
				const nameToIndexMap = {};
				this.physicianListingTable.forEach((item, index) => {
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
				this.initialSetPageSetting(params);
			}),
		);
	}
	initialSetPageSetting(queryParams?) {
		debugger;
		this.physicianPage.pageNumber = queryParams && queryParams.page ? queryParams.page : 1;
		this.physicianPage.size = queryParams && queryParams.per_page ? queryParams.per_page : 10;
		let InitPage = {
			page: this.physicianPage.pageNumber,
			per_page: this.physicianPage.size,
		};
		this.getPhysicianData(InitPage);
	}
	// GET LISTS OF PHYSICIAN
	getPhysicianData(pageSetting) {
		let queryParams;
		if (isEmptyObject(this.applyFilterValues)) {
			queryParams = {
				page: pageSetting.page,
				per_page: pageSetting.per_page,
				order: OrderEnum.DEC,
				pagination: true,
			};
		} else {
			let physicianObj = removeEmptyAndNullsFormObject(this.physicianList.filterValues);
			queryParams = {
				page: pageSetting.page,
				per_page: pageSetting.per_page,
				order: OrderEnum.DEC,
				pagination: true,
				...physicianObj,
			};
		}
		debugger;
		this.reactionService.addUrlQueryParams(queryParams);
		this.loadSpin = true;
		this.subscription.push(
			this.referringPhysicianService.getPhysicianLists(queryParams).subscribe(
				(physicianList: any) => {
					if (physicianList.status) {
						this.loadSpin = false;
						debugger;
						if (this.applyFilterValues) {
							physicianList['filterValues'] = this.applyFilterValues; // CHECK ONCE FILTER APPLY THEN ALWAYS CONCATE FILTER VALUES WHICH HAVE APPLIED
							this.physicianList = physicianList;
						} else {
							this.physicianList = physicianList;
						}
					}
				},
				(error) => {
					this.loadSpin = false;
				},
			),
		);
	}
	addUrlQueryParams(params?) {
		this.location.replaceState(this.router.createUrlTree([], { queryParams: params }).toString());
	}
	get_filtered_data(filtered_data) {
		this.physicianOffSet = 0;
		this.physicianPage.size = filtered_data.result.per_page;
		this.applyFilterValues = filtered_data.filterValues; // FILTER VALUES FETCHED
		this.physicianList = filtered_data;
		this.physicianList = this.physicianList;
	}
	// GET THE PHYSICIAN PAGE SIZE
	setPhysicianPageSize(pageSize) {
		this.physicianPage.size = pageSize;
		this.physicianPage.pageNumber = 1;
		this.physicianOffSet = 0;
		let queryPageSetting = {
			page: this.physicianPage.pageNumber,
			per_page: this.physicianPage.size,
		};
		this.getPhysicianData(queryPageSetting);
	}
	// GET THE PHYSICIAN PAGE NUMBER
	setReactionPageNumber(page) {
		this.physicianOffSet = page.offset;
		this.physicianPage.pageNumber = page.offset + 1;
		this.physicianPage.size = page.pageSize;
		let queryPageSetting = {
			page: this.physicianOffSet + 1,
			per_page: this.physicianPage.size,
		};
		this.getPhysicianData(queryPageSetting);
	}
	// DELETE PHYSICIAN
	deletePhysician(ID,isDeleteAll=false) {
		let queryParams;
		queryParams = {
			physician_ids: ID,
		};
		debugger;
		debugger;
		this.customDiallogService
			.confirm(
				'Delete Referring Physician',
				'Do you really want to delete the Referring Physician?',
			)
			.then((confirmed) => {
				debugger;
				if (confirmed) {
					this.loadSpin = true;
					this.subscription.push(
						this.referringPhysicianService.deletePhysicianByIDs(queryParams).subscribe(
							(physicianList: any) => {
								if (physicianList.status) {
									this.loadSpin = false;
									this.toastrService.success(physicianList.message, 'Success');
									if(isDeleteAll) {
										this.selection.clear();
									}
									this.initialSetPageSetting();
								}
							},
							(error) => {
								this.loadSpin = false;
							},
						),
					);
				}
			})
			.catch();
	}
	// GET THE PHYSICIAN DETAIL
	getPhysicianByID(row, modalRef, action) {
		debugger;
		if (action == this.action.DELETE) {
			this.deletePhysician([row.id]);
		} else if (action == this.action.VIEW || action == this.action.EDIT) {
			this.setPhysicianActionEditView(row, modalRef, action);
		} else if (this.action.ADD) {
			debugger;
			this.addPhysician(modalRef, action);
		}
	}
	// ADD REFERRING PHYSICIAN
	addPhysician(modalRef, action) {
		this.physicianDetail['action'] = action;
		this.physicianDetail['physicianDetail'] = {};
		this.setPhysicianDetail(modalRef);
	}
	// SET PHYSICIAN ACTION EDIT/VIEW
	setPhysicianActionEditView(row, modalRef, action) {
		this.physicianDetail['action'] = action;
		this.getPhysician(row, modalRef); //GET SINGLE PHYSICIAN BY ID
	}
	// GET SINGLE PHYSICIAN BY ID AND THEN SET THIS RESULT IN ADD/EDIT COMPONENT
	getPhysician(row, modalRef) {
		let refferingPhysicianByID = {
			physician_id: row.id,
		};
		this.loadSpin = true;
		this.subscription.push(
			this.referringPhysicianService.getRefferingPhysicianByID(refferingPhysicianByID).subscribe(
				(reactionObj: any) => {
					if (reactionObj.status) {
						this.loadSpin = false;
						this.physicianDetail['physicianDetail'] = reactionObj.result.data;
						this.setPhysicianDetail(modalRef); // HERE WE HAD BEEN FETCHED THE DETAIL AND SEND DETAIL TO PHYSICIAN EDIT/ADD COMPONENT AND ALSO OPEN THE MODAL
					}
				},
				(error) => {
					this.loadSpin = false;
				},
			),
		);
	}
	// OPEN THE MODAL WHERE WE DISPLAY THE FETCHED PHYSICIAN DETAILS
	setPhysicianDetail(modalRef) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			size: 'lg',
		};
		this.modalService.open(modalRef, ngbModalOptions).result.then(
			(result) => {
				this.closeResult = `Closed with: ${result}`;
			},
			(reason) => {
				this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
			},
		);
	}
	// WHEN EDIT PHYSICIAN
	reRunPhysicianLists() {
		this.subscription.push(
			this.reactionService.isActionComplete.subscribe((resp) => {
				debugger;
				if (resp) {
					// this.physicianOffSet = ;
					this.initialSetPageSetting({ page: 1, per_page: 10 });
				}
			}),
		);
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
	physicianMasterToggle(): void {
		this.isphysicianAllSelected()
			? this.selection.clear()
			: this.physicianList.result.data
				.slice(0, this.reportsTotalRows)
				.forEach((row) => this.selection.select(row));
	}
	isphysicianAllSelected(): boolean {
		this.reportsTotalRows = this.physicianList.result.data.length;
		const numSelected = this.selection.selected.length;
		const numRows = this.reportsTotalRows;
		return numSelected === numRows;
	}
	Delete_all() {
		this.deletePhysician(this.selection.selected.map(res => res.id),true);
	}
	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}

	physicianHistoryStats(row) {
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
			this.localStorage.setObject('physicianMasterTableList' + this.storageData.getUserId(), data);
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
		this.physicianListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.physicianListTable._internalColumns.sort(function (a, b) {
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
