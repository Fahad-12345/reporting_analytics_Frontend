import {
	Component,
	OnInit,
	ViewChild,
} from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';

import {
	BsModalRef,
	BsModalService,
	ModalDirective,
} from 'ngx-bootstrap/modal';

import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

import { filterConfig } from '../../constant/constant';
import { customizeUrlsEnum } from '../../customize-urls-enum';
import {
	SpecialityEditModalComponent,
} from '../../modals/speciality-edit-modal/speciality-edit-modal.component';
import { CustomizeService } from '../../service/customize.service';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { history } from '@appDir/shared/utils/utils.helpers';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { getIdsFromArray, makeDeepCopyArray } from '@appDir/shared/utils/utils.helpers';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { ToastrService } from 'ngx-toastr';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { DatePipe } from '@angular/common';

@Component({
	selector: 'app-specialty',
	templateUrl: './specialty.component.html',
	styleUrls: ['./specialty.component.scss'],
})
export class SpecialtyComponent extends PermissionComponent implements OnInit {
	bsModalRef: BsModalRef;
	searchCaseType: FormGroup;
	reorderable: boolean = true;
	loadingIndicator: boolean = true;
	allClinicIds;
	filter;

	locationActionColoumn;
	specialtyRowData;

	locationFilterOptions;
	limit: number = 10;
	deleteSelectedSpeciality = [];
	isHeaderSelected;
	specialityActivePage: number = 1;
	totalRecord: number;
	specialityOffset: number = 0;
	loadSpin = false;
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('specialityList') specialityListTable: DatatableComponent;
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
	specialityListingTable: any;

	constructor(
		private storageData: StorageData,
		private datePipe: DatePipe,
		public requestService: RequestService,
		private customDiallogService: CustomDiallogService,
		public add: NgbModal,
		private modalService: BsModalService,
		private modalServices: NgbModal,
		public customizeService: CustomizeService,
		private toastrService: ToastrService,
		private localStorage: LocalStorage,
		public aclService?: AclService,
		public datePipeService?:DatePipeFormatService,
	) {
		super(aclService);
		this.locationActionColoumn = [];
	}

	ngOnInit() {
		this.allClinicIds = this.storageData.getFacilityLocations();
		this.filter = filterConfig;
		this.fetchTableData(this.createDefaultParams());
		this.specialityListingTable = this.localStorage.getObject('specialityTableList' + this.storageData.getUserId());
	}

	ngAfterViewInit() {
		if (this.specialityListTable?._internalColumns) {
			this.columns = makeDeepCopyArray([...this.specialityListTable._internalColumns]);
			this.columns.forEach(element => {
				if(this.specialityListingTable.length) {
					let obj = this.specialityListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.specialityListingTable.length) {
				const nameToIndexMap = {};
				this.specialityListingTable.forEach((item, index) => {
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

	fetchTableData(params?) {
		this.startLoader=true;
		this.requestService
			.sendRequest(
				customizeUrlsEnum.fetchSpecialities,
				'post',
				REQUEST_SERVERS.schedulerApiUrl1,

				params,
			)
			.subscribe((res) => {
				this.specialtyRowData = res['result']['data']['docs'];
				this.totalRecord = res['result']['data']['total'];
				this.startLoader=false;
			},error=>{
				this.startLoader=false;
			});
	}
	actionButtonHandler(actionType: string, row) {
		switch (actionType) {
			case 'edit':
				this.bsModalRef = this.modalService.show(SpecialityEditModalComponent, {
					initialState: {
						selectedRow: row,
					},
				});
				this.bsModalRef.content.event.subscribe((res) => {

					if (res.data) {
						const body = {
							object_id: [res.data.id],
							color_code: res.color,
							type_id: 1,
						};
						this.updateColor(body);
					}
				});

				break;

			case 'delete':
				this.customDiallogService.confirm('Reset','Are you sure you want to reset?','Yes','No')
		.then((confirmed) => {
			this.loadSpin = true;
			if (confirmed){
				const body = {
					object_ids: [row.id],
					type_id: 1,
					color_code: '#9d9d9d',
				};
				this.setDefaultColour(body);
			}else if(confirmed === false){
				this.loadSpin= false;
			}else{
				this.loadSpin = false;
			}
		})
		.catch();
			
		}
	}
	applyFilter(params) {
		
		this.startLoader=true;
		const data = removeEmptyKeysFromObject(params.value);
		let paramsData = {
			page: 1,
			per_page: this.limit,
			speciality_id: data.speciality || '',
			time_slot: data.timeslot || '',
			over_booking: data.overBookingNo || '',
			pagination: 1,
			facility_location_ids: [],
			created_by_ids:  data.created_by_ids || '',
		    updated_by_ids:  data.updated_by_ids || '',
			created_at: data.created_at ? this.datePipe.transform(data.created_at, 'yyyy-MM-dd') : '',
            updated_at: data.updated_at ? this.datePipe.transform(data.updated_at, 'yyyy-MM-dd') : '',
		};
		if (data.Practice_Locations && data.Practice_Locations.length>0) {
			// paramsData.facility_location_ids.push(data.city);
			paramsData.facility_location_ids=data.Practice_Locations;
		} else {
			paramsData.facility_location_ids = this.allClinicIds;
		}
		paramsData = removeEmptyKeysFromObject(paramsData);
		this.loadSpin = true;
		this.requestService
			.sendRequest(
				customizeUrlsEnum.fetchSpecialities,
				'post',
				REQUEST_SERVERS.schedulerApiUrl1,
				paramsData,
			)
			.subscribe((res) => {
				this.loadSpin = false;
				this.specialtyRowData = res['result']['data']['docs'];
				this.totalRecord =  res['result']['data']['total'];
				this.specialityOffset = 0;
				this.startLoader=false;
			},error=>{
				this.startLoader=false;
			});
	}
	deleteLocation(data) {
	
	}
	entryCountSelection(params) {
		this.limit = params;
		this.specialityOffset = 0;
		this.specialityActivePage = 0;
		const PaginationParams = {
			page: this.specialityActivePage === 0 ? 1 : this.specialityActivePage,
			per_page: parseInt(params),
			pagination: 1,
			facility_location_ids: this.allClinicIds,
		};
		this.fetchTableData(PaginationParams);
	}
	onPageChange(event) {
		this.limit = event.limit;
		this.specialityOffset = event.offset;
		this.specialityActivePage = event.offset + 1;

		const PaginationParams = {
			page: this.specialityActivePage,
			per_page: this.limit,
			pagination: 1,
			facility_location_ids: this.allClinicIds,
		};
		this.fetchTableData(PaginationParams);
	}

	updateColor(body) {
		this.startLoader=true;
		this.customizeService.updateColour(body).subscribe((res) => {
			this.specialtyRowData.forEach((element) => {
				body.object_id.forEach((id) => {
					if (element.id === id) {
						element.color = body.color_code;
					}
				});
			});
			this.startLoader=false;
		},error=>{
			this.startLoader=false;
		});
	}
	setDefaultColour(body) {
		this.startLoader=true;
		const url = customizeUrlsEnum.deleteColor;
		this.customizeService.setDefaultColour(url, body).subscribe((res) => {
			this.specialtyRowData.forEach((element) => {
				body.object_ids.forEach((id) => {
					if (element.id === id) {
						element.color = body.color_code;
					}
				});
			});
			this.startLoader=false;
		},error=>{
			this.startLoader=false;
		});
	}
	selectAll($event) {
		this.deleteSelectedSpeciality = [];
		if ($event.checked) {
			this.isHeaderSelected = true;

			this.specialtyRowData.forEach((row, index) => {
				row.checked = true;
				this.deleteSelectedSpeciality.push(row.id);
			});
		} else {
			this.deleteSelectedSpeciality = [];
			this.specialtyRowData.forEach((res, index) => {
				res.checked = false;
			});
		}
	}
	setColour(value, id) {
		this.specialtyRowData.forEach((element) => {
			if (element.id === id) {
				element.color = value;
			}
		});
	}

	createDefaultParams() {
		const params = {
			facility_location_ids: this.allClinicIds,
			// doctor_ids:this.storageData.isSuperAdmin()?[]:[this.storageData.getUserId()],
			page: this.specialityOffset + 1,
			per_page: this.limit,
			pagination: 1,
		};
		return params;
	}

	onChange(row, event) {
		if (!event.checked) {
			this.deleteSelectedSpeciality = this.deleteSelectedSpeciality.filter(function (value) {
				return value !== row.id;
			});

			this.isHeaderSelected = false;
		} else {
			this.deleteSelectedSpeciality.push(row.id);
		}
	}
	deleteAllClinics() {

		
this.customDiallogService.confirm('Reset','Are you sure you want to reset?','Yes','No')
.then((confirmed) => {
	this.loadSpin = true;
	if (confirmed){
		this.startLoader=true;
				const url = customizeUrlsEnum.deleteColor;

				const body = {
					object_ids: this.deleteSelectedSpeciality,
					type_id: 1,
				};
				this.customizeService.deleteColour(url, body).subscribe((data) => {
					debugger;
					this.specialtyRowData.forEach((element) => {
						this.deleteSelectedSpeciality.forEach((id) => {
							if (element.id === id) {
								element.checked = false;
								// this.deleteSelectedSpeciality = [];
								element.color = '#9d9d9d';
							}
						});
					});
					this.deleteSelectedSpeciality = [];
					this.isHeaderSelected = false;
					this.startLoader=false;
				},error=>{
					this.startLoader=false;
				});

	}else if(confirmed === false){
	}else{
		this.loadSpin = false;
	}
})
.catch();

	}

	specialtyHistoryStats(row) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc body-scroll history-modal',
			modalDialogClass: 'modal-lg'
		};
		let modelRef = this.modalServices.open(CreatedHistoryComponent,ngbModalOptions);
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
			this.localStorage.setObject('specialityTableList' + this.storageData.getUserId(), data);
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
		this.specialityListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.specialityListTable._internalColumns.sort(function (a, b) {
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

export function removeEmptyKeysFromObject(obj) {
	Object.keys(obj).forEach((key) => {
		if (
		  Array.isArray(obj[key]) &&
		  obj[key].length === 2 &&
		  obj[key][0] === null
		) {
		  delete obj[key];
		} else if (
		  Object.prototype.toString.call(obj[key]) === "[object Date]" &&
		  (obj[key].toString().length === 0 || obj[key].toString() === "Invalid Date")
		) {
		  delete obj[key];
		} else if (obj[key] && typeof obj[key] === "object") {
		  removeEmptyKeysFromObject(obj[key]);
		} else if (obj[key] && Array.isArray(obj[key]) && obj[key].length == 0) {
		  removeEmptyKeysFromObject(obj[key]);
		} else if (obj[key] == null || obj[key] === "" || obj[key] === undefined) {
		  delete obj[key];
		}
	  
		if (
		  obj[key] &&
		  typeof obj[key] === "object" &&
		  Object.keys(obj[key]).length === 0 &&
		  Object.prototype.toString.call(obj[key]) !== "[object Date]" &&
		  Object.prototype.toString.call(obj[key]) !== "[object File]"
		) {
		  delete obj[key];
		}
	  });
	  
	return obj;
}
