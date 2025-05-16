import { Component, OnInit, Input, ChangeDetectionStrategy, OnDestroy, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { AclService } from '@appDir/shared/services/acl.service';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { AdjusterInformationModalComponentComponent } from '../adjuster-information-modal-component/adjuster-information-modal-component.component';
import { AdjusterInformationServiceService } from '../../../services/adjuster-information-service.service';
import { AdjusterInformationModel } from '../../../models/AdjusterInformation.Model';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Page } from '@appDir/front-desk/models/page';
import {
	unSubAllPrevious,
	parseHttpErrorResponseObject,
} from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { Subscription } from 'rxjs';
import { AdjusterInformationUrlsEnum } from './adjuster-information-urls-enum';
import { OrderEnum, ParamQuery } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { Router, ActivatedRoute } from '@angular/router';
import { Location, LocationStrategy } from '@angular/common'
import { Title } from '@angular/platform-browser';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { checkReactiveFormIsEmpty, getIdsFromArray, isEmptyObject, isObjectEmpty, makeDeepCopyArray } from '@appDir/shared/utils/utils.helpers';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
@Component({
	selector: '',
	templateUrl: './adjuster-information.component.html',
	styleUrls: ['./adjuster-information.component.scss'],
	changeDetection: ChangeDetectionStrategy.Default,
})
export class AdjusterInformationComponent extends PermissionComponent implements OnInit {
	bool: boolean = true;
	isCollapsed:boolean =false;
	@Input() patientRows: any[];
	@Input() totalRows: number;
	selection = new SelectionModel<Element>(true, []);
	lstAdjuster: Array<AdjusterInformationModel> = [];
	searchForm: FormGroup;
	queryParams: ParamQuery;
	page: Page;
	subscription: Subscription[] = [];
	public loadSpin: boolean = false;
	rows = [
		{ name: 'Austin', gender: 'Male', company: 'Swimlane' },
		{ name: 'Dany', gender: 'Male', company: 'KFC' },
		{ name: 'Molly', gender: 'Female', company: 'Burger King' },
	];
	columns = [
		{ prop: 'name' },
		{ name: 'Insurance Name' },
		{ name: 'Code' },
		{ name: 'Contact Person Name' },
		{ name: 'Phone Number' },
		{ name: 'Actions' },
	];
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('adjusterList') adjusterListTable: DatatableComponent;
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
	adjusterListingTable: any;

	constructor(
		aclService: AclService,
		private modalService: NgbModal,
		private adjusterService: AdjusterInformationServiceService,
		private toaster: ToastrService,
		private customDiallogService : CustomDiallogService,
		private fb: FormBuilder,
		protected requestService: RequestService,
		router: Router,
		private _route: ActivatedRoute,
		private location: Location, 
		private locationStratgy: LocationStrategy,
		titleService: Title,
		public datePipeService: DatePipeFormatService,
		protected storageData: StorageData,
		private localStorage: LocalStorage
	) {
		super(aclService, router, _route, requestService, titleService);
		this.page = new Page();
		this.page.pageNumber = 0;
		this.page.size = 10;
	}

	ngOnInit() {
		// this.titleService.setTitle(this._route.snapshot.data['title']);
		this.setTitle();
		this.searchForm = this.fb.group({
			insurance_name: ['', Validators.required],
			name: ['', Validators.required],
			phone_no: ['', Validators.required],
			email: ['', Validators.required],
			fax: ['', Validators.required],
			// streetAddress: ['']
		});
		this.subscription.push(
			this._route.queryParams.subscribe((params) => {
				this.page.size = parseInt(params.per_page) || 10;
				this.searchForm.patchValue(params);
				this.page.pageNumber = parseInt(params.page) || 1;
				// this.page.totalElements = parseInt(params.per_page) || 10;
			}),
		);
		this.setPage({ offset: this.page.pageNumber - 1 || 0 });
		this.adjusterListingTable = this.localStorage.getObject('adjusterMasterTableList' + this.storageData.getUserId());
	}
	ngAfterViewInit() {
		if (this.adjusterListTable?._internalColumns) {
			this.cols = makeDeepCopyArray([...this.adjusterListTable._internalColumns]);
			this.cols.forEach(element => {
				if(this.adjusterListingTable?.length) {
					let obj = this.adjusterListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.adjusterListingTable?.length) {
				const nameToIndexMap = {};
				this.adjusterListingTable.forEach((item, index) => {
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
	setPage(pageInfo) {
		let pageNum;
		this.selection.clear();
		pageNum = pageInfo.offset;
		this.page.pageNumber = pageInfo.offset;
		const pageNumber = this.page.pageNumber + 1;
		let filters = checkReactiveFormIsEmpty(this.searchForm);
		this.queryParams = {
			filter: !isObjectEmpty(filters),
			order: OrderEnum.ASC,
			per_page: this.page.size || 10,
			page: pageNumber,
			pagination: true,
			order_by: 'first_name'
		};
		// if (this.searchForm.value.insuranceName || this.searchForm.value.name ||
		// 	this.searchForm.value.phone_no || this.searchForm.value.email || this.searchForm.value.fax
		// ) {
		let insuranceName = this.searchForm.value.insuranceName;
		let name = this.searchForm.value.name;
		let phone_no = this.searchForm.value.phone_no;
		let email = this.searchForm.value.email;
		let fax = this.searchForm.value.fax;
		// let streetAddress = this.searchForm.value.streetAddress;
		let per_page = this.page.size;
		let queryParams = { insuranceName, name, phone_no, fax, email, per_page, page: pageNumber };
		this.addUrlQueryParams(queryParams);
		// }
		this.getAdjusterInformation({ ...this.queryParams, ...filters });
	}
	addUrlQueryParams(params?) {
		this.location.replaceState(
			this.router.createUrlTree([], { queryParams: params, }).toString()
		);
	}
	resetSearchForm() {
		this.addUrlQueryParams();
		this.searchForm.reset();
		this.setPage({ offset: 0 });
	}
	submitSearchForm() {
		this.adjusterService.searchAdjuster(this.searchForm.value).subscribe((data) => {
			this.lstAdjuster = data['data'];
		});
	}
	createAdjuster() {
		var modalRef = this.modalService.open(AdjusterInformationModalComponentComponent, {
			size: 'lg',
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc',
		});
		modalRef.result.then((result) => {
			if (result != null) { 
				this.searchForm.reset()
				this.setPage({ offset: this.page.pageNumber }); }
		});
	}
	getCount() {
		return this.adjusterService.getCount();
	}
	updateAdjuster(adjuster: AdjusterInformationModel) {
		var modalRef = this.modalService.open(AdjusterInformationModalComponentComponent, {
			size: 'lg',
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc',
		});
		modalRef.componentInstance.editMode = true;
		modalRef.componentInstance.adjuster = adjuster;
		modalRef.result.then((result: AdjusterInformationModel) => {
			if (result) {
				this.setPage({ offset: this.page.pageNumber });
			}
			// this.lstAdjuster.map(adjuster => {
			//   if (adjuster.id == result.id) {
			//     adjuster = result
			//   }
			// })

		});
	}
	update(row) {
	}
	ngOnChanges() {
		if (this.patientRows) {
			this.patientRows = [...this.patientRows];
		}
	}

	DeleteAdjuster(adjuster: AdjusterInformationModel) {

		this.customDiallogService.confirm('Are you sure', 'This adjuster will be deleted permanantly','Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
				this.adjusterService.deleteAdjuster(adjuster.id).subscribe((data) => {
					if (data['status'] == 200) {
						this.toaster.success('Adjuster Successfully Deleted');
						this.setPage({ offset: this.page.pageNumber });
					} else {
						this.toaster.error(data['message']);
					}
				});
			}
		})
		.catch();
	}
	onAdjusterChecked(event, adjuster) {
		adjuster['checked'] = event.checked;
	}
	getCheckedAdjusters() {
		return this.lstAdjuster.filter((adjuster) => {
			return adjuster['checked'] == true;
		});
	}
	selectAll(event) {
		this.lstAdjuster.map((adjuster) => {
			adjuster['checked'] = event.checked;
		});
	}
	deleteMultiple() {

		this.customDiallogService.confirm('Are you sure?', 'Are you sure you want to delete selected adjusters?','Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
				var ids = [];
				this.getCheckedAdjusters().forEach((adjuster) => {
					ids.push(adjuster.id);
				});
				this.adjusterService.deleteMultipleAdjusters(ids).subscribe((data) => {
					if ((data['status'] = 200)) {
						this.toaster.success('Adjusters Deleted Succesfully');
						this.lstAdjuster = this.lstAdjuster.filter((adjuster) => {
							return !ids.includes(adjuster.id);
						});
					} else {
						// this.toaster.error(data['message'])
						const str = parseHttpErrorResponseObject(data['message']);
						this.toaster.error(str);
					}
				});
			}
		})
		.catch();
	}
	plusShown() {
		this.bool = !this.bool;
	}

	minusShown() {
		this.bool = !this.bool;
	}

	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.totalRows; //this.patientRows.length;
		return numSelected === numRows;
	}
	masterToggle() {
		this.isAllSelected()
			? this.selection.clear()
			: this.patientRows.slice(0, this.totalRows).forEach((row) => this.selection.select(row));
	}

	getAdjusterInformation(queryParams) {
		this.loadSpin = true;
		this.subscription.push(
			this.requestService
				.sendRequest(
					AdjusterInformationUrlsEnum.adjuster_list_GET,
					'GET',
					REQUEST_SERVERS.billing_api_url,
					queryParams,
				)
				.subscribe(
					(data: any) => {
						this.loadSpin = false;

						this.lstAdjuster = data.result ? data.result.data : [];
						// data && data['data'] && data['data']['docs'] ? data['data']['docs'] : [];
						this.page.totalElements = data.result.total;
						// data && data['data'] && data['data']['total'] ? data['data']['total'] : 0;
					},
					(err) => {
						// const str = parseHttpErrorResponseObject(err.error.message);
						// this.toaster.error(str);
						this.loadSpin = false;
					},
				),
		);
	}

	setPageLimit($num) {
		this.page.size = Number($num);
		this.setPage({ offset: 0 });
	}
	getPageNumber() {
		return this.adjusterService.getPageNumber();
	}
	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}

	checkInputs(){
		if (isEmptyObject(this.searchForm.value)) {
			return true;
		  }
		  return false;
	}
	
	splitNameInComma(insurance: any[]){
		let name:any[] = [];
		insurance.map(t => {
			name.push(t.insurance_name);
		});
		return name;
	}

	adjusterHistoryStats(row) {
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
			this.localStorage.setObject('adjusterMasterTableList' + this.storageData.getUserId(), data);
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
		this.adjusterListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.adjusterListTable._internalColumns.sort(function (a, b) {
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
	getInsuranceNames(insuranceArray: any[]): string {
		return insuranceArray?.map(ins => ins?.insurance_name).join('\n ') || 'N/A';
	  }
}
