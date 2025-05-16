import {
	Component,
	OnDestroy,
	OnInit,
	ViewChild,
} from '@angular/core';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { ToastrService } from 'ngx-toastr';
import { REQUEST_SERVERS } from './../../../../request-servers.enum';
import { RequestService } from './../../../../shared/services/request.service';
import { reportsUrlsEnum } from './../../report.enum';

import * as moment from 'moment';
import { Subscription } from 'rxjs';

import { SelectionModel } from '@angular/cdk/collections';
import { Location } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import {
	NgxDataTable,
} from '@appDir/shared/modules/ngx-datatable-custom/models/deliveries-ngx-datatable.models';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { getIdsFromArray, makeDeepCopyArray, removeEmptyAndNullsFormObject } from '@appDir/shared/utils/utils.helpers';
import { ModalDismissReasons, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import * as $ from 'jquery';
import * as _ from 'lodash';
import { ModalDirective } from 'ngx-bootstrap/modal';
import {
	filterConfig,
	NF2_LIST_REPORTS,
} from '../../constant/constants';
import { ReportsService } from '../../reports.service';
import { removeEmptyKeysFromObject } from '../../shared/helper';

@Component({
	selector: 'app-nf2-reports-list',
	templateUrl: './nf2-reports-list.component.html',
	styleUrls: ['./nf2-reports-list.component.scss'],
})
export class Nf2ReportsListComponent implements OnInit, OnDestroy {
	searchCaseType: FormGroup;
	reorderable: boolean = true;
	loadingIndicator: boolean = true;
	createdDeliveriesTableConf: NgxDataTable;
	filter: string[];
	rowData;
	limit: number = 10;
	totalRecord: number = 0;
	subsription: Subscription;
	nf2Offset: number = 0;
	nf2ActivePage: number = 0;
	defaultPagination:any = {};
	selectedReports = [];
	selectedPracticeLocation = [];
	selectedUniquePracticeLocation = [];
	public loadSpin: boolean = false;
	closeResult: string;
	selectedNodes;
	isAllSelect = false;
	reportSelection: any = new SelectionModel<Element>(true, []);
	reportsTotalRows: number;
	selectedCasePomPopUp: any;
	isSelectedLocationPopSaveDisabled = true;
	isMultiplePractice = false;
	getResultForMultiplePracticeParam;
	mulitpleObjects = [];
	firstLength: number;
	filterParam: any;

	subscription:Subscription[] = [];
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('nf2List') nf2ListTable: DatatableComponent;
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
	nf2ReportsListingTable: any;
	selCols: any[] = [];

	constructor(
		private storageData: StorageData, 
		public reportService: ReportsService, 
		private modalService: NgbModal, 
		private toaster: ToastrService,
		public datePipeService:DatePipeFormatService,
		private _route: ActivatedRoute,
		private _router: Router,
		public requestService: RequestService,
		private location: Location,
		private localStorage: LocalStorage
		) 
		{
		this.subsription = new Subscription();
		this.initializeDefaultPagination();
	}
	initializeDefaultPagination() {
		this.defaultPagination = {
			page: 1,
			per_page:10,
			pagination: 1,
		};
	}
	ngOnInit() {
		this.filter = filterConfig;
		this.subsription.add(
			this._route.queryParams.subscribe((params) => {
				this.defaultPagination.per_page = params['per_page'] || 10;
				this.filterParam = params;
				this.nf2Offset = params['page'] ? Number(params['page']) - 1 : 0;
				this.fetchReportsData({...this.defaultPagination , ...params});
			}),
		);
		this.nf2ReportsListingTable = this.localStorage.getObject('nf2ReportsTableList' + this.storageData.getUserId());
	}

	ngAfterViewInit() {
		if (this.nf2ListTable?._internalColumns) {
			this.cols = makeDeepCopyArray([...this.nf2ListTable._internalColumns]);
			this.cols.forEach(element => {
				if(this.nf2ReportsListingTable?.length) {
					let obj = this.nf2ReportsListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.nf2ReportsListingTable?.length) {
				const nameToIndexMap = {};
				this.nf2ReportsListingTable.forEach((item, index) => {
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
			this.selCols = this.nf2ReportsListingTable?.length ? this.nf2ReportsListingTable : [];
			this.customizeColumnsForCSV();
			this.onConfirm(false);
		}
	}

	applyFilter(params) {
		this.filterParam = removeEmptyKeysFromObject(params.value);
		const url = NF2_LIST_REPORTS;
		const data = {...this.defaultPagination, ...this.filterParam};
		this.nf2Offset=0;
		this.fetchReportsData(data);
	}

	resetButtonHandler() {
		this.nf2Offset = 0;
		this.filterParam = {};
		this.fetchReportsData(this.defaultPagination);
	}

	fetchReportsData(filterParam?) {
		const url = NF2_LIST_REPORTS;
		this.loadSpin = true;
		const filterData = {...this.defaultPagination , ...filterParam};
		this.addUrlQueryParams(removeEmptyAndNullsFormObject(filterParam));
		this.subsription.add(
			this.reportService.getNf2ReportsCollection(url, filterData).subscribe((data) => {
				this.loadSpin = false;
				this.rowData = data['result'].data.docs ? [...data['result'].data.docs]: [] ;
				this.reportSelection.clear();
				this.totalRecord = data['result'].data.total;
				setTimeout(() => {
					$('datatable-body').scrollLeft(1);
				}, 50);
			},
			err => {
				this.loadSpin = false;;
		  	}),
		);
	}
	onPageChange(event) {
		this.limit = event.limit;
		this.nf2Offset = event.offset;
		this.nf2ActivePage = event.offset + 1;
		const PaginationParams = {
			...this.filterParam,
			page: this.nf2ActivePage,
			per_page: this.limit,
			pagination: 1,
		};
		this.fetchReportsData(PaginationParams);
	}
	entryCountSelection(value: string) {
		this.limit = parseInt(value);
		this.nf2Offset = 0;
		const pageParams = {
			...this.filterParam,
			page: 1,
			per_page: value,
			pagination: 1,
		};

		this.fetchReportsData(pageParams);
	}
	checkIfPracticesLengthEqual() {
		this.firstLength = this.reportSelection._selected[0].practice_locations.length;
		const verify = this.reportSelection._selected.every(res => (res.practice_locations.length === this.firstLength) && (res.practice_locations.length > 1));
		return verify;
	}
	checkIfAllSelectedReportsPracticesLengthGreaterOne() {
		const verify = this.reportSelection._selected.every(res => res.practice_locations.length > 1);
		return verify;
	}
	getSelectedFirstIndexArrayObject() {
		const firstobj = [];
		this.reportSelection._selected[0].practice_locations.forEach(element => {
			firstobj.push({
				'facility_id': element.facility.id,
				'facility_name': element.facility.name,
				'practice_location_name': element.name,
				'case_id': this.reportSelection._selected[0].id
			});
		})
		return firstobj;
	}
	HasFacilityId:any[] = [];
	HasSameFacilityIds = [];
	checkIfAllSelectedReportsContainsAllFacilityIdFirstObject(FirstIndexObject, modalRef) {
		this.HasFacilityId = [];
		this.HasSameFacilityIds = [];
		this.reportSelection._selected.forEach(x => {
			x.practice_locations.forEach(d => {
				this.HasFacilityId.push(d);
			});
		});
		this.getUniquePracticeLocations();
		if (this.selectedUniquePracticeLocation.length == 1) {
			this.isMultiplePractice = false;
			this.OtherCases(modalRef);
		} else {
			for (let i = 0; i < FirstIndexObject.length; i++) {
				const length = this.HasFacilityId.filter((v) => (v.facility_id === FirstIndexObject[i].facility_id)).length;
				if (length == (this.reportSelection._selected.length)) {
					this.HasSameFacilityIds.push(true);
				} else {
					this.HasSameFacilityIds.push(false);
				}
			}
			this.multipleCasesWithMultiplePractices(modalRef,this.HasSameFacilityIds);
		}
	}
	multipleCasesWithMultiplePractices(modalRef,HasSameFacilityIds) {
		const verify = HasSameFacilityIds.every(x => x === true);
		if(verify) {
			this.isMultiplePractice = true;
			this.getUniquePracticeLocations();
			this.openModalForSelectLocation(modalRef);
		} else {
			this.toaster.error('POM can be generated only with the same practices', 'Error');
		}

	}
	GenereatePOM(modalRef) {
		this.selectedPracticeLocation = [];
		this.selectedUniquePracticeLocation = [];
		this.isMultiplePractice = false;
		// MULITPLE CAES WITH MULTIPLE PRACTICES
		if (this.reportSelection._selected.length > 1 && this.checkIfPracticesLengthEqual()) {
			let FirstIndexObject = this.getSelectedFirstIndexArrayObject();
			this.checkIfAllSelectedReportsContainsAllFacilityIdFirstObject(FirstIndexObject, modalRef);
		} else {
			// OHTER CASES
			this.OtherCases(modalRef);
		}
	}
	getOnlyPracticeLocationArrMultiplePractice() {
		let multiplePracitces = [];
		this.reportSelection._selected.forEach(caseObj => {
			caseObj.practice_locations.forEach(location => {
				multiplePracitces.push(
					{
						'facility_id': location.facility.id,
						'facility_name': location.facility.name,
						'practice_location_name': location.name,
						'practice_location_id': location.id,
						'case_id': caseObj.id,
					}
				);
			});

		});
		return multiplePracitces;
	}
	reportAllUnique = false;
	getUniquePracticeLocations() {
		this.reportSelection._selected.forEach(caseObj => {
			caseObj.practice_locations.forEach(location => {
				this.selectedPracticeLocation.push(
					{
						'facility_id': location.facility.id,
						'facility_name': location.facility.name,
						'practice_location_name': location.name,
						'practice_location_id': location.id,
						'case_id': caseObj.id,
					}
				);
			});

		});
		this.selectedUniquePracticeLocation = _.uniqBy(this.selectedPracticeLocation, 'facility_id');
	}
	getIsAllSelectReportsFacilityIdEqual() {
		const verify = this.reportSelection._selected.every(res => res.practice_locations.facility_id === res.practice_locations.facility_id);
	}
	OtherCases(modalRef) {
		this.selectedPracticeLocation=[];
		this.getUniquePracticeLocations();
		if (this.reportSelection.selected.length == 1 && this.selectedUniquePracticeLocation.length > 1) {
			this.openModalForSelectLocation(modalRef);
		}
		else if (this.reportSelection.selected.length > 1 && this.selectedUniquePracticeLocation.length == 1) {
			let object = this.makeCasePOMObject(this.selectedPracticeLocation);
			this.createPom(object);
		}
		else if (this.reportSelection.selected.length == 1 && this.selectedUniquePracticeLocation.length == 1) {
			let object = this.makeCasePOMObject(this.selectedPracticeLocation);
			this.createPom(object);
		} else if (this.reportSelection.selected.length > 1 && this.selectedUniquePracticeLocation.length > 1) {
			this.toaster.error('POM can be generated only with the same practices', 'Error');
		} else {
		}
	}
	makeCasePOMObject(params) {
		let object = [];
		params.forEach(element => {
			object.push(
				{
					"case_id": element.case_id,
					"facility_location_id": element.practice_location_id
				}
			)
		});
		const parameters = {
			case_with_locations: object,
			facility_id: params[0].facility_id
		}
		return parameters;
	}
	selectedCasePOM(params) {
		if (this.isMultiplePractice) {
			this.mulitpleObjects = [];
			this.getResultForMultiplePracticeParam = this.getOnlyPracticeLocationArrMultiplePractice();
			this.getResultForMultiplePracticeParam.forEach(element => {
				if (element.facility_id == params.facility_id) {
					this.mulitpleObjects.push(element);
				}
			});
			if (this.mulitpleObjects) {
				this.isSelectedLocationPopSaveDisabled = false;
			} else {
				this.isSelectedLocationPopSaveDisabled = true;
			}
		} else {
			this.selectedCasePomPopUp = this.makeCasePOMObject([params]);
			if (this.selectedCasePomPopUp) {
				this.isSelectedLocationPopSaveDisabled = false;
			} else {
				this.isSelectedLocationPopSaveDisabled = true;
			}
		}
	}
	createPom(params) {
		let obj;
		if (this.isMultiplePractice) {
			obj = this.makeCasePOMObject(this.mulitpleObjects);
		} else {
			obj = params;
		}
		this.isSelectedLocationPopSaveDisabled = true;
		this.reportService.generateCasePOM(obj).subscribe((res:any) => {
			this.toaster.success(res?.message, 'Success');
			this.reportSelection.clear();
			this.selectedReports = [];
			this.modalService.dismissAll('Cross click');
			this.isSelectedLocationPopSaveDisabled = false;
			this.isMultiplePractice = false;
		},
		(err) => {
			this.isSelectedLocationPopSaveDisabled = false;
			if(err?.error?.message) {
				this.toaster.error(err?.error?.message, 'Error');
			}
			else {
				this.toaster.error(err?.error?.error?.message, 'Error');
			}
		})
	}
	// OPEN THE MODAL
	openModalForSelectLocation(modalRef) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false, windowClass: 'modal_pad'
		};
		this.modalService.open(modalRef, ngbModalOptions).result.then((result) => {
			this.closeResult = `Closed with: ${result}`;
			this.selectedCasePomPopUp = undefined;
			this.isSelectedLocationPopSaveDisabled = true;
		}, (reason) => {
			this.selectedCasePomPopUp = undefined;
			this.isSelectedLocationPopSaveDisabled = true;
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
	ngOnDestroy(): void {
		this.subsription.unsubscribe();
	}

	formatDate(param) {
		const dateTime2 = moment(param).format('YYYY-MM-DD');
		return dateTime2;
	}
	reportsmasterToggle(): void {
		this.isreportAllSelected()
			? this.reportSelection.clear()
			: this.rowData
				.slice(0, this.reportsTotalRows)
				.forEach((row) => this.reportSelection.select(row));
	}
	isreportAllSelected(): boolean {
		this.reportsTotalRows = this.rowData.length;
		const numSelected = this.reportSelection.selected.length;
		const numRows = this.reportsTotalRows;
		return numSelected === numRows;
	}
	selectedLocationPopSave() {
		if (this.selectedCasePomPopUp || this.mulitpleObjects.length > 0) {
			this.isSelectedLocationPopSaveDisabled = false;
			this.createPom(this.selectedCasePomPopUp);
		} else {
			this.isSelectedLocationPopSaveDisabled = true;
			this.toaster.error('Please Select One Location', 'Error');
		}

	}
	getLinkwithAuthToken(link) {
		let token = this.storageData.getToken();
		if (token) {
			return `${link}&token=${token}`;
		} else {
			return link;
		}
	}

	/**
	 * Queryparams to make unique URL
	 * @param params
	 * @returns void
	 */
	 addUrlQueryParams(params: any): void {
		this.location.replaceState(this._router.createUrlTree([], { queryParams: params }).toString());
	}

	generateExcel(){
		const PaginationParams = {
			...this.filterParam,
			order_by: OrderEnum.DEC,
			order: 'id'
		};
		// if(!PaginationParams?.practice_locations?.length) {
		// 	this.toaster.info('Practice-Location filter is required before exporting to CSV', 'Info');
		// 	return;
		// }
		let cols: any[] = [];
		if(this.selCols?.length) {
			this.selCols?.map(ele => {
				if(ele?.prop == 'actions') {
					cols.push('created_at')
					cols.push('updated_at')
					cols.push('created_by')
					cols.push('updated_by')
				}
				else {
					cols.push(ele?.prop)
				}
			})
		}
		let filters=removeEmptyKeysFromObject(PaginationParams);
		filters = {
			...filters,
			custom_columns: JSON.stringify(cols)
		}
		this.subscription.push(this.requestService.sendRequest(reportsUrlsEnum.reportsNf2_Excel_list_GET + "?token=" + this.storageData.getToken(), 'get', REQUEST_SERVERS.fd_api_url,
		filters,
		).subscribe((res) => {
				this.toaster.success(res?.message, 'Success');
			},
			err => {
				if(err?.error?.message) {
					this.toaster.error(err?.error?.message, 'Error');
				}
				else {
					this.toaster.error(err?.error?.error?.message, 'Error');
				}
			}
		));
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
			this.toaster.error('At Least 1 Column is Required.','Error');
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
			this.localStorage.setObject('nf2ReportsTableList' + this.storageData.getUserId(), data);
			this.selCols = data;
			let selCustCols: any[] = [];
			this.selCols.map(key => {
				this.alphabeticColumns.map(inner => {
					if(key?.header == inner?.name) {
						selCustCols.push({prop: inner?.prop});
					}
				})
			})
			this.selCols = selCustCols;
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
		this.nf2ListTable._internalColumns = columnsBody.filter(c => {
		  return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.nf2ListTable._internalColumns.sort(function (a, b) {
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

	customizeColumnsForCSV() {
		this.cols.map(ele => {
			if(ele?.checked) {
				if(this.selCols.length) {
					let i = this.selCols.findIndex(key => key?.header == ele?.name);
					if(i != -1) {
						this.selCols[i] = {prop: ele?.prop};
					}
					else {
						this.selCols.push({prop: ele?.prop});
					}
				}
				else {
					this.selCols.push({prop: ele?.prop});
				}
			}
		})
	}

	historyStats(row) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc body-scroll history-modal',
			modalDialogClass: 'modal-lg'
		};
		let modelRef = this.modalService.open(CreatedHistoryComponent,ngbModalOptions);
		modelRef.componentInstance.createdInformation = [row];
	}
}