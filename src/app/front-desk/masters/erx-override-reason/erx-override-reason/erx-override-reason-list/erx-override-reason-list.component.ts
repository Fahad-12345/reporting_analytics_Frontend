import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { Subscription } from 'rxjs';
import { Page } from '@appDir/front-desk/models/page';
import { Location } from '@angular/common';
import { NgbModalRef, NgbModal, NgbModalOptions, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { Router, ActivatedRoute} from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { RequestService } from '@appDir/shared/services/request.service';
import { AclService } from '@appDir/shared/services/acl.service';
import { changeDateFormat, checkForValue, getIdsFromArray, isEmptyObject, makeDeepCopyArray } from '@appDir/shared/utils/utils.helpers';
import { ErxOverrideReasonService } from '../../erx-override-reason.service';
import { ActionEnum } from '../../erx-override-reasonEnum';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
@Component({
	selector: 'app-erx-override-reason-list',
	templateUrl: './erx-override-reason-list.component.html',
	styleUrls: ['./erx-override-reason-list.component.scss']
})
export class ErxOverrideReasonListComponent implements OnInit, OnDestroy, AfterViewInit {
	action = ActionEnum;
	subscription: Subscription[] = [];
	erxOverrideReasonList: any;
	applyFilterValues: any = {};
	erxOverrideReasonPage: Page = new Page();
	modalRef: NgbModalRef;
	erxOverrideReasonOffSet = 0;
	closeResult = '';
	userStatus;
	erxOverrideReasonDetail: any = {};
	loadSpin = false;
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('erxOverrideReasonList') erxOverrideReasonListTable: DatatableComponent;
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
	erxOverrideReasonListtingTable: any;


	constructor(
		aclService: AclService,
		private router: Router,
		private erxOverrideReasonService: ErxOverrideReasonService,
		private _route: ActivatedRoute,
		protected requestService: RequestService,
		private toastrService: ToastrService,
		private location: Location,
		public datePipeService:DatePipeFormatService,
		private modalService: NgbModal,
		private storageData: StorageData,
		private localStorage: LocalStorage
		) {
	}

	ngOnInit() {
		this.getQueryParams();
		this.erxOverrideReasonListtingTable = this.localStorage.getObject('erxOverrideReasonTableList' + this.storageData.getUserId());
	}

	ngAfterViewInit() {
		if (this.erxOverrideReasonListTable?._internalColumns) {
			this.columns = makeDeepCopyArray([...this.erxOverrideReasonListTable._internalColumns]);
			this.columns.forEach(element => {
				if(this.erxOverrideReasonListtingTable.length) {
					let obj = this.erxOverrideReasonListtingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.erxOverrideReasonListtingTable.length) {
				const nameToIndexMap = {};
				this.erxOverrideReasonListtingTable.forEach((item, index) => {
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
		this.erxOverrideReasonPage.pageNumber = queryParams.page ? queryParams.page : 1;
		this.erxOverrideReasonPage.size = queryParams.per_page ? queryParams.per_page : 10;
		let InitPage = {
			page: this.erxOverrideReasonPage.pageNumber,
			per_page: this.erxOverrideReasonPage.size,
		}
		this.getErxOverrideReasonData(InitPage);
	}
	// GET LISTS OF ERX OVERRIDE REASON
	getErxOverrideReasonData(pageSetting) {
		let queryParams;
		if (isEmptyObject(this.applyFilterValues)) {
			queryParams = {
				page: pageSetting.page,
				per_page: pageSetting.per_page,
				order: OrderEnum.DEC,
				pagination: true,
			}
		} else {
			queryParams = {
				page: pageSetting.page,
				per_page: pageSetting.per_page,
				order: OrderEnum.DEC,
				pagination: true,
				snomed_concept_id: checkForValue(this.erxOverrideReasonList.filterValues.snomed_concept_id),
				snomed_term_desc_id: checkForValue(this.erxOverrideReasonList.filterValues.snomed_term_desc_id),
				snomed_term_desc: checkForValue(this.erxOverrideReasonList.filterValues.snomed_term_desc),
				added_date: checkForValue(changeDateFormat(this.erxOverrideReasonList.filterValues.added_date)),
				in_active_date: checkForValue(this.erxOverrideReasonList.filterValues.in_active_date),
				term_type_desc: checkForValue(this.erxOverrideReasonList.filterValues.term_type_desc),
				value_set_comment: checkForValue(this.erxOverrideReasonList.filterValues.value_set_comment),
				snomed_term_concept_type_id: checkForValue(this.erxOverrideReasonList.filterValues.snomed_term_concept_type_id),
				concept_type: checkForValue(this.erxOverrideReasonList.filterValues.concept_type),
				value_set_type_id: checkForValue(this.erxOverrideReasonList.filterValues.value_set_type_id),
				value_set_type_description: checkForValue(this.erxOverrideReasonList.filterValues.value_set_type_description),
				hl7_object_identifier: checkForValue(this.erxOverrideReasonList.filterValues.hl7_object_identifier),
				hl7_object_identifier_type: checkForValue(this.erxOverrideReasonList.filterValues.hl7_object_identifier_type)
			}
		}
		this.erxOverrideReasonService.addUrlQueryParams(queryParams);
		this.loadSpin = true;
		this.subscription.push(
			this.erxOverrideReasonService.getErxOverrideReason(queryParams).subscribe((erxOverrideReasonList: any) => {
				if (erxOverrideReasonList.status) {
					this.loadSpin = false;
					if (this.applyFilterValues) {
						erxOverrideReasonList['filterValues'] = this.applyFilterValues; // CHECK ONCE FILTER APPLY THEN ALWAYS CONCATE FILTER VALUES WHICH HAVE APPLIED
						this.erxOverrideReasonList = erxOverrideReasonList;
					} else {
						this.erxOverrideReasonList = erxOverrideReasonList;
					}
				}
			},
				(error) => {
					this.loadSpin = false;
				})
		);
	}

	addUrlQueryParams(params?) {
		this.location.replaceState(
			this.router.createUrlTree([], { queryParams: params, }).toString()
		);
	}

	get_filtered_data(filtered_data) {
		this.erxOverrideReasonOffSet = 0;
		this.erxOverrideReasonPage.size = filtered_data.result.per_page;
		this.applyFilterValues = filtered_data.filterValues; // FILTER VALUES FETCHED
		this.erxOverrideReasonList = filtered_data;
		this.erxOverrideReasonList = this.erxOverrideReasonList;
	}
	// GET THE ERX OVERRIDE REASON PAGE SIZE
	setReactionPageSize(pageSize) {
		this.erxOverrideReasonPage.size = pageSize;
		this.erxOverrideReasonPage.pageNumber = 1;
		this.erxOverrideReasonOffSet = 0;
		let queryPageSetting = {
			page: this.erxOverrideReasonPage.pageNumber,
			per_page: this.erxOverrideReasonPage.size,
		}
		this.getErxOverrideReasonData(queryPageSetting);
	}
	// GET THE ERX OVERRIDE REASON PAGE NUMBER
	setErxOverrideReasonPageNumber(page) {
		this.erxOverrideReasonOffSet = page.offset;
		this.erxOverrideReasonPage.pageNumber = page.offset + 1;
		this.erxOverrideReasonPage.size = page.pageSize;
		let queryPageSetting = {
			page: this.erxOverrideReasonOffSet + 1,
			per_page: this.erxOverrideReasonPage.size
		}
		this.getErxOverrideReasonData(queryPageSetting);
	}
	// DELETE ERX OVERRIDE REASON
	deleteErxOverrideReason(ID) {
		let queryParams;
		queryParams = {
			id: ID
		}
		this.loadSpin = true;
		this.subscription.push(
			this.erxOverrideReasonService.deleteErxOverrideReasonByID(queryParams).subscribe((erxOverrideReasonList: any) => {
				if (erxOverrideReasonList.status) {
					this.loadSpin = false;
					this.toastrService.success(erxOverrideReasonList.message, 'Success');
					let queryPageSetting = {
						page: this.erxOverrideReasonPage.pageNumber,
						per_page: this.erxOverrideReasonPage.size,
					}
					this.getErxOverrideReasonData(queryPageSetting);
					
				}
			},
				(error) => {
					this.loadSpin = false;
				})
		);
	}
	// GET THE ERX OVERRIDE REASON DETAIL
	getErxOverrideReasonByID(modalRef, action,row?) {
		if (action == this.action.DELETE) {
			this.deleteErxOverrideReason(row.id);
			
		} else if (action == this.action.VIEW || action == this.action.EDIT) {
			this.setErxOverrideReasonActionEditView(row, modalRef, action);
		} else if (action ==this.action.ADD) {
			this.setErxOverrideReasonActionAddView(modalRef, action);
			
		}
		this.reRunReasonLists();
		
	}
	// SET ERX OVERRIDE REASON ACTION EDIT/VIEW
	setErxOverrideReasonActionEditView(row, modalRef, action) {
		this.erxOverrideReasonDetail['action'] = action;
		this.getErxOverrideReason(row, modalRef); //GET SINGLE ERX OVERRIDE REASON BY ID
	}

	setErxOverrideReasonActionAddView(modalRef, action) {
		this.erxOverrideReasonDetail['action'] = action;
		console.log('action',this.erxOverrideReasonDetail);
		this.loadSpin = false;
		this.setErxOverrideReasonDetail(modalRef); // HERE WE HAD BEEN FETCHED THE DETAIL AND SEND DETAIL TO ERX OVERRIDE REASON VIEW COMPONENT AND ALSO OPEN THE MODAL
		// this.getErxOverrideReason(row, modalRef); //GET SINGLE ERX OVERRIDE REASON BY ID
	}
	// GET SINGLE ERX OVERRIDE REASON BY ID AND THEN SET THIS RESULT IN VIEW COMPONENT
	getErxOverrideReason(row, modalRef) {
		this.loadSpin = true;
		this.subscription.push(
			this.erxOverrideReasonService.getErxOverrideReasonByID(row.id).subscribe((reactionObj: any) => {
				if (reactionObj.status) {
					this.loadSpin = false;
					this.erxOverrideReasonDetail['erxOverrideReasonDetail'] = reactionObj.result.data;
					this.setErxOverrideReasonDetail(modalRef); // HERE WE HAD BEEN FETCHED THE DETAIL AND SEND DETAIL TO ERX OVERRIDE REASON VIEW COMPONENT AND ALSO OPEN THE MODAL

				}
			},
				(error) => {
					this.loadSpin = false;
				})
		);

	}
	// OPEN THE MODAL WHERE WE DISPLAY THE FETCHED ERX OVERRIDE REASON DETAILS
	setErxOverrideReasonDetail(modalRef) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			size: 'lg',
		};
		this.modalService.open(modalRef, ngbModalOptions).result.then((result) => {
			this.closeResult = `Closed with: ${result}`;
		}, (reason) => {
			this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
		});
	}

	erxHistoryStats(row) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc body-scroll history-modal',
			modalDialogClass: 'modal-lg'
		};
		let modelRef = this.modalService.open(CreatedHistoryComponent,ngbModalOptions);
		modelRef.componentInstance.createdInformation = [row];
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

	reRunReasonLists() {
		this.erxOverrideReasonService.isActionComplete.subscribe(resp => {
			if (resp) {
				let queryPageSetting = {
					page: this.erxOverrideReasonPage.pageNumber,
					per_page: this.erxOverrideReasonPage.size,
				}
				this.getErxOverrideReasonData(queryPageSetting);
			}
		})
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
			this.localStorage.setObject('erxOverrideReasonTableList' + this.storageData.getUserId(), data);
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
		this.erxOverrideReasonListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.erxOverrideReasonListTable._internalColumns.sort(function (a, b) {
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
