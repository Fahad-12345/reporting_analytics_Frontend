import { map } from 'rxjs/operators';
import { SelectionModel } from '@angular/cdk/collections';
import {
	AfterViewInit,
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
import { getIdsFromArray, makeDeepCopyArray, removeEmptyKeysFromObjectArrays } from '@appDir/shared/utils/utils.helpers';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent } from '@swimlane/ngx-datatable';

import { locationFilterConfig } from '../../constant/constant';
import { customizeUrlsEnum } from '../../customize-urls-enum';
import { CustomizePopupComponent } from '../../modals/customize-popup/customize-popup.component';
import { CustomizeService } from '../../service/customize.service';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { ToastrService } from 'ngx-toastr';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { DatePipe } from '@angular/common';

@Component({
	selector: 'app-location',
	templateUrl: './location.component.html',
	styleUrls: ['./location.component.scss'],
})
export class LocationComponent extends PermissionComponent implements OnInit, AfterViewInit {
	@ViewChild(DatatableComponent) ngxDatatable: DatatableComponent;
	bsModalRef: BsModalRef;
	searchCaseType: FormGroup;
	reorderable: boolean = true;
	loadingIndicator: boolean = true;
	allClinicIds;
	filter;
	deleteSelectedClinics: any = [];
	locationActionColoumn;
	locationsRowData;
	locationFilterOptions;
	limit: number = 10;
	selection = new SelectionModel<Element>(true, []);
	isHeaderSelected;
	nf2ActivePage: number = 0;
	locationActivePage: number = 0;
	totalRecord: number;
	locationOffset: number = 0;
	loadSpin = false;
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('locationList') locationListTable: DatatableComponent;
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
	locationListingTable: any;

	constructor(
		private storageData: StorageData,
		private datePipe: DatePipe,
		public requestService: RequestService,
		public add: NgbModal,
		private customDiallogService: CustomDiallogService,
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
		this.filter = locationFilterConfig;
		this.fetchLocations(this.createDefaultParams());
		this.locationListingTable = this.localStorage.getObject('practiceLocationTableList' + this.storageData.getUserId());
	}
	ngAfterViewInit() {
		if (this.locationListTable?._internalColumns) {
			this.columns = makeDeepCopyArray([...this.locationListTable._internalColumns]);
			this.columns.forEach(element => {
				if(this.locationListingTable.length) {
					let obj = this.locationListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.locationListingTable.length) {
				const nameToIndexMap = {};
				this.locationListingTable.forEach((item, index) => {
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
	resetButtonClicked() {
		this.fetchLocations(this.createDefaultParams());
	}
	actionButtonHandler(actionType: string, row) {
		switch (actionType) {
			case 'edit':
				this.bsModalRef = this.modalService.show(CustomizePopupComponent, {
					initialState: {
						selectedRow: row,
					},
				});
				this.bsModalRef.content.event.subscribe((res) => {
					let obj = [];
					obj.push(res.data.id);
					if (res.data) {
						const body = {
							object_id: obj,
							color_code: res.color,
							type_id: 2,
						};

						this.updateColor(body);
					}
				});

				break;

			case 'delete':
				this.customDiallogService.confirm('Reset','Are you sure you want to reset?','Yes','No')
		.then((confirmed) => {
			this.loadSpin = true;
			const body = {
				object_ids: [row.id],
				type_id: 2,
				color_code: '#9d9d9d',
			};
			this.setDefaultColour(body);
			if (confirmed){
			}else if(confirmed === false){
			}else{
				this.loadSpin = false;
			}
		})
		.catch();
			

				break;
		}
	}

	selectAll($event) {
		this.deleteSelectedClinics = [];
		if ($event.checked) {
			this.isHeaderSelected = true;

			this.locationsRowData.forEach((row, index) => {
				row.checked = true;
				this.deleteSelectedClinics.push(row.id);
				this.selection.select(row)
			});
		} else {
			this.deleteSelectedClinics = [];
			this.selection.clear();
			this.locationsRowData.forEach((res, index) => {
				res.checked = false;
			});
		}
	}


	applyFilter(params) {

		this.startLoader=true
		this.locationOffset = 0;
		const data = removeEmptyKeysFromObjectArrays(params.value);
		const paramsData = {
			facility_location_ids: [],
			created_by_ids:  data.created_by_ids || '',
		    updated_by_ids:  data.updated_by_ids || '',
			created_at: data.created_at ? this.datePipe.transform(data.created_at, 'yyyy-MM-dd') : '',
            updated_at: data.updated_at ? this.datePipe.transform(data.updated_at, 'yyyy-MM-dd') : '',
			page: 1,
			per_page: this.limit,
			filters: data.address || '',
		};
		
		if (data.city && data.city.length>0) {
			// paramsData.facility_location_ids.push(data.city);
			paramsData.facility_location_ids=data.city;
		 } else {
			paramsData.facility_location_ids = this.allClinicIds;
		}
		this.loadSpin = true;
		this.requestService
			.sendRequest(
				customizeUrlsEnum.fetchFacilites,
				'POST',
				REQUEST_SERVERS.schedulerApiUrl1,
				paramsData,
			)
			.subscribe((res) => {
				this.locationsRowData=res.result&&res.result.data&&res.result.data.docs.map(practiceLocation=>{
					// let practiceFullName=(practiceLocation.facility_name?practiceLocation.facility_name:'')+(practiceLocation.name?'-'+practiceLocation.name:'')
					let practiceFullName=`${practiceLocation.facility_name?practiceLocation.facility_name:''}${practiceLocation.name?'-'+practiceLocation.name:''}`
	
					practiceLocation['practice_location_full_name']=practiceFullName;
					let practiceFullAddress=`${practiceLocation.address?practiceLocation.address+', ':''}${practiceLocation.city?practiceLocation.city+', ':''} ${practiceLocation.state?practiceLocation.state+' ':''}${practiceLocation.zip?practiceLocation.zip:''}`
					practiceLocation['practice_location_full_address']=practiceFullAddress;
					return practiceLocation
				})
				// this.locationsRowData = res['result']['data']['docs'];
				this.totalRecord = res['result']['data']['total'];
				this.startLoader=false
			},error=>{
				this.startLoader=false
			});
	}
	deleteLocation(data) {
	
	}
	entryCountSelection(params) {
		this.locationOffset = 0;
		this.locationActivePage = 0;
		const PaginationParams = {
			facility_location_ids: this.allClinicIds,
			page: this.locationActivePage + 1,
			per_page: parseInt(params),
			pagination: 1,
		};
		this.fetchLocations(PaginationParams);
	}
	onPageChange(event) {
		this.limit = event.limit;
		this.locationOffset = event.offset;
		this.locationActivePage = event.offset + 1;

		const PaginationParams = {
			facility_location_ids: this.allClinicIds,
			page: this.locationActivePage,
			per_page: this.limit,
			pagination: 1,
		};
		this.fetchLocations(PaginationParams);
	}

	updateColor(body) {
		this.startLoader=true
		this.customizeService.updateColour(body).subscribe((res) => {
			this.locationsRowData.forEach((element) => {
				body.object_id.forEach((id) => {
					if (element.id === id) {
						element.color = body.color_code;
					}
				});
			});
			this.startLoader=false
		},error=>{
			this.startLoader=false
		});
	}
	setDefaultColour(body) {
		this.startLoader=true
		const url = customizeUrlsEnum.deleteColor;
		this.customizeService.setDefaultColour(url, body).subscribe((res) => {
			this.locationsRowData.forEach((element) => {
				body.object_ids.forEach((id) => {
					if (id === element.id) {
						element.color = body.color_code;
					}
				});
			})
			this.startLoader=false
		},error=>{
			this.startLoader=false
		});
	}

	setColour(value, id) {
		this.locationsRowData.forEach((element) => {
			if (element.id === id) {
				element.color = value;
			}
		});
	}

	createDefaultParams() {
		const params = {
			facility_location_ids: this.allClinicIds,
			page: this.locationOffset + 1,
			per_page: this.limit,
			pagination: 1,
		};

		return params;
	}

	onChange(row, event) {
		if (!event.checked) {
			this.deleteSelectedClinics = this.deleteSelectedClinics.filter(function (value) {
				return value !== row.id;
			});

			this.isHeaderSelected = false;
		} else {
			this.deleteSelectedClinics.push(row.id);
		}
		this.selection.toggle(row)
	}
	deleteAllClinics() {
		const url = customizeUrlsEnum.deleteColor;
		const body = {
			object_ids: this.deleteSelectedClinics,
			type_id: 2,
		};

		this.customDiallogService.confirm('Delete','Are you sure you want to delete','Yes','No')
		.then((confirmed) => {
			this.loadSpin = true;
			if (confirmed){
				this.startLoader=true
				this.customizeService.deleteColour(url, body).subscribe((data) => {
					this.locationsRowData.forEach((element) => {
						this.deleteSelectedClinics.forEach((id) => {
							if (element.id === id) {
								element.color = '#9d9d9d';
								element.checked=false;
							}
						});
					});
					this.startLoader=false;
					this.deleteSelectedClinics=[]
					this.fetchLocations(this.createDefaultParams());
				},error=>{
					this.startLoader=false;
			})
			}else if(confirmed === false){
			}else{
				this.loadSpin = false;
			}
		})
		.catch();

	}
	

	fetchLocations(body) {
		this.startLoader=true
		this.customizeService.fetchLocations(body)
		.subscribe((res) => {
			this.deleteSelectedClinics = [];
			this.selection.clear();
			this.isHeaderSelected = false;
			this.locationsRowData = res['result']['data']['docs'];
			this.locationsRowData=this.locationsRowData.map(practiceLocation=>{
				// let practiceFullName=(practiceLocation.facility_name?practiceLocation.facility_name:'')+(practiceLocation.name?'-'+practiceLocation.name:'')
				let practiceFullName=`${practiceLocation.facility_name?practiceLocation.facility_name:''}${practiceLocation.name?'-'+practiceLocation.name:''}`
				practiceLocation['practice_location_full_name']=practiceFullName;
				
				let practiceFullAddress=`${practiceLocation.address?practiceLocation.address+', ':''}${practiceLocation.city?practiceLocation.city+', ':''} ${practiceLocation.state?practiceLocation.state+' ':''}${practiceLocation.zip?practiceLocation.zip:''}`
				practiceLocation['practice_location_full_address']=practiceFullAddress;
				return practiceLocation
			})
			this.locationFilterOptions = [...this.locationsRowData];
			this.totalRecord = res['result']['data']['total'];
			this.limit = body.per_page;
			this.startLoader=false
		},error=>{
			this.startLoader=false
		});
	}

	locationHistoryStats(row) {
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
			this.localStorage.setObject('practiceLocationTableList' + this.storageData.getUserId(), data);
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
		this.locationListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.locationListTable._internalColumns.sort(function (a, b) {
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

