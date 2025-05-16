import { SelectionModel } from '@angular/cdk/collections';
import { CustomDiallogService } from './../../../shared/services/custom-dialog.service';
import { DatePipeFormatService } from './../../../shared/services/datePipe-format.service';
import { StorageData } from './../../../pages/content-pages/login/user.class';
import { BillingEnum } from './../../../front-desk/billing/billing-enum';
import { ToastrService } from 'ngx-toastr';
import { PacketEnum } from './../../packet.enum';
import { REQUEST_SERVERS } from './../../../request-servers.enum';
import { RequestService } from './../../../shared/services/request.service';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Page } from './../../../front-desk/models/page';
import { PacketFilterFieldModel } from '../../../shared/filter/model/packet-filter-field-model';
import { IFilterFieldHtml } from '../../../shared/filter/model/filter-field-html-model';
import { Subscription } from 'rxjs';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { FilterModelQueryPassInApi } from '@appDir/shared/filter/model/filter-model-query-pass-in-api';
import { FilterModelQueryPassInFormField } from '@appDir/shared/filter/model/filter-model-query-pass-in-form-field';
import { changeDateFormat } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { getIdsFromArray, removeEmptyAndNullsArraysFormObject, allAreEqual, removeDuplicates, unSubAllPrevious, makeDeepCopyArray } from '@appDir/shared/utils/utils.helpers';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { LocalStorage } from '@appDir/shared/libs/localstorage';

@Component({
	selector: 'app-packets-list',
	templateUrl: './packets-list.component.html',
	styleUrls: ['./packets-list.component.scss'],
})
export class PacketsListComponent implements OnInit, OnDestroy {
	loadSpin: boolean = false;
	page = new Page();
	packetFiled: IFilterFieldHtml = new PacketFilterFieldModel();
	packetLists: any[] = [];
	limit: number = 10;
	billingPacketData: any[] = [];
	filterInfoObject = {};
	formFiledValue: any;
	formFiledListOfValue: any;
	subscription: Subscription[] = [];
	packetSelection = new SelectionModel<Element>(true, []);
	packetTotalRows: number;
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('packetsList') packetsListTable: DatatableComponent;
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
	packetsListingTable: any;

	constructor(
		public requestService: RequestService,
		public toastrService: ToastrService,
		private storageData: StorageData,
		public commonService: DatePipeFormatService,
		private modalService: NgbModal,
		private _route: ActivatedRoute,
		private _routerA: Router,
		private location: Location,
		private customDiallogService: CustomDiallogService,
		private toaster: ToastrService,
		private localStorage: LocalStorage
	) {}

	ngOnInit(): void {
		this.page.size = this.limit;
		this.page.pageNumber = 0;
		this.subscription.push(
			this._route.queryParams.subscribe((params) => {
				this.formFiledListOfValue = new FilterModelQueryPassInFormField(params);
				this.formFiledValue = new FilterModelQueryPassInApi(params);
				this.filterInfoObject = new FilterModelQueryPassInApi(params);  
				this.page.pageNumber = parseInt(params.page) || 1;
				this.page.size = parseInt(params.per_page) || 10;
				this.page.offset = this.page.pageNumber - 1;
				this.getPacketInfo(this.paramsObject(params));
			}),
		);
		this.packetsListingTable = this.localStorage.getObject('packetsTableList' + this.storageData.getUserId());
	}

	ngAfterViewInit() {
		if (this.packetsListTable?._internalColumns) {
			this.columns = makeDeepCopyArray([...this.packetsListTable._internalColumns]);
			this.columns.forEach(element => {
				if(this.packetsListingTable.length) {
					let obj = this.packetsListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.packetsListingTable.length) {
				const nameToIndexMap = {};
				this.packetsListingTable.forEach((item, index) => {
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

	ngOnDestroy(): void {
		unSubAllPrevious(this.subscription);
	}

	pageLimit($event) {
		this.packetSelection.clear();
		this.page.offset = 0;
		this.page.size = Number($event);
		this.page.pageNumber = 1;
		this.getPacketInfo(this.paramsObject(this.filterInfoObject));
	}

	onPageChange(pageInfo) {
		this.packetSelection.clear();
		this.page.offset = pageInfo.offset;
		this.page.pageNumber = pageInfo.offset + 1;
		this.getPacketInfo(this.paramsObject(this.filterInfoObject));
	}

	viewDoc(row) {}

	getPacketDetail(value, packetDetails) {
		this.billingPacketData = [];
		this.requestService
			.sendRequest(PacketEnum.packetDetail + value, 'get', REQUEST_SERVERS.fd_api_url)
			.subscribe(
				(res: any) => {
					this.loadSpin = false;
					if (res && res.status) {
						this.billingPacketData = res.result.data;
						const ngbModalOptions: NgbModalOptions = {
							backdrop: 'static',
							keyboard: false,
							windowClass: 'bill-modal-xl',
							size: 'lg',
						};
						this.modalService.open(packetDetails, ngbModalOptions);
					}
				},
				(error) => {
					this.loadSpin = false;
					this.toastrService.error(error.error.message || 'Something went wrong.', 'Error');
				},
			);
	}

	downloadPacket(row) {
		let params = {
			id: row.id
		}
		this.requestService
			.sendRequest(PacketEnum.downloadPacket, 'get', REQUEST_SERVERS.fd_api_url, params)
			.subscribe(
				(res) => {
					this.toastrService.success(res?.message, 'Success');
				},
				(error) => {
					if(error?.error?.message) {
						this.toastrService.error(error?.error?.message || 'Something went wrong.', 'Error');
					}
					else {
						this.toastrService.error(error?.error?.error?.message || 'Something went wrong.', 'Error');
					}
				},
			);
	}

	rePacket(row) {
		this.customDiallogService.confirm('Re-Packet','Do you want to attach Cover Sheet with the Bill files?','Yes','No')
		.then((confirmed) => {
			this.loadSpin = true;
			if (confirmed){
				params['is_cover_sheet'] = 1; 
		     this.repacketingPackets(params);
			}else if(confirmed === false){
				params['is_cover_sheet'] = 0; 
				this.repacketingPackets(params);
			}else{
				this.loadSpin = false;
			}
		})
		.catch();

		// this.loadSpin = true;
		let params = {
			id: row.id,
		};
	
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
	repacketingPackets(params) {
		this.subscription.push(
			this.requestService
			.sendRequest(PacketEnum.repacketingUrl, 'post', REQUEST_SERVERS.fd_api_url, params)
			.subscribe(
				(res: any) => {
					this.loadSpin = false;
					if (res?.status) {
						this.getPacketInfo(this.paramsObject(this.formFiledValue));
						this.toastrService.success(res?.message, 'Success');
					}
				},
				(error) => {
					this.loadSpin = false;
					if(error?.error?.message) {
						this.toastrService.error(error?.error?.message || 'Something went wrong.', 'Error');
					}
					else {
						this.toastrService.error(error?.error?.error?.message || 'Something went wrong.', 'Error');
					}
				},
			));
	}

	getPacketInfo(params) {
		this.loadSpin = true;
		const param = removeEmptyAndNullsArraysFormObject(params);
		this.addUrlQueryParams(param);
		const paramData = new FilterModelQueryPassInApi(param);
		this.subscription.push(
			this.requestService
				.sendRequest(PacketEnum.getPacketListing, 'get', REQUEST_SERVERS.fd_api_url, removeEmptyAndNullsArraysFormObject(paramData))
				.subscribe(
					(comingData: any) => {
						if (comingData['status'] == 200 || comingData['status'] == true) {
							this.loadSpin = false;
							this.packetLists = comingData.result ? [...comingData.result.data] : [];
							this.page.totalElements = comingData.result.total;
							this.page.totalPages = comingData.result.last_page;
							if (param['offset'] === 0) {
								this.page.offset = 0;
							}
							//  this.page.totalPages = this.page.totalElements / this.page.size;
						}
						// setTimeout(() => {
						// 	$('datatable-body').scrollLeft(1);
						// }, 50);
					},
					(err) => {
						this.loadSpin = false;
					},
				),
		);
	}

	filterResponseData(filterInfo: any) {
		this.packetSelection.clear();
		this.filterInfoObject = filterInfo;
		this.page.offset = 0;
		this.page.pageNumber = 1;
		this.getPacketInfo(this.paramsObject(this.filterInfoObject));
	}

	getLinkwithAuthToken(link) {
		let token = this.storageData.getToken();
		if (token) {
			return `${link}&token=${token}`;
		} else {
			return link;
		}
	}

	genertePOM(row) {
		let caseType: any = [];
		let practiceLocation: any = [];
		let bill_ids: any = [];
		let packet_id: any = [];
		let facility_id: any = [];
		let case_type: any = [];
		if(Array.isArray(row)) {
			row.forEach(ele => {
				if(ele?.packet_bill) {
					ele.packet_bill.map(key => {
						caseType.push(key?.case_type_id);
						practiceLocation.push(key?.facility_location_id);
						packet_id.push(key?.packet_id);
						case_type.push(key?.case_type_name);
					})
				}
				if(ele?.bill_ids) {
					ele.bill_ids.map(key => {
						bill_ids.push(key);
					})
				}
				if(ele?.facility_id) {
					facility_id.push(ele.facility_id);
				}
			})
			bill_ids = removeDuplicates(bill_ids);
			packet_id = removeDuplicates(packet_id);
			facility_id = removeDuplicates(facility_id);
			let sameCaseType = allAreEqual(caseType);
			let samePracticeLocation = allAreEqual(practiceLocation);
			if(!sameCaseType || !samePracticeLocation) {
				this.toastrService.error('Please select Packets with same Practice and Case Type', 'Error');
				return false;
			}
		}
		if(!Array.isArray(row)) {
			row?.packet_bill.forEach(ele => {
				case_type.push(ele?.case_type_name);
			})
		}
		case_type = removeDuplicates(case_type);
		let params = {
			bill_ids: Array.isArray(row) ? bill_ids : row.bill_ids,
			is_packet: 1,
			packet_id: Array.isArray(row) ? packet_id : [row.id],
			facility_id: Array.isArray(row) ? facility_id : [row.facility_id],
			case_type: case_type
		};
		this.subscription.push(
			this.requestService
			.sendRequest(BillingEnum.genertePOM, 'get', REQUEST_SERVERS.fd_api_url, params)
			.subscribe(
				(res: any) => {
					this.toastrService.success(res?.message, 'Success');
					this.packetSelection.clear();
				},
				(err) => {
					if(err?.error?.message) {
						this.toastrService.error(err?.error?.message, 'Error');
					}
					else {
						this.toastrService.error(err?.error?.error?.message, 'Error');
					}
				},
			)
		)
	}

	generteEnvelope(row) {
		let url;
		let params = { bill_ids: row.bill_ids };
	
		this.requestService
			.sendRequest(BillingEnum.genereteEnvelope, 'url_base_with_token', REQUEST_SERVERS.fd_api_url)
			.subscribe(
				(res) => {
					url = res + '&';
					this.loadSpin = false;
				},
				(err) => {
					this.loadSpin = false;
				},
			);

		if (params && params.bill_ids && params.bill_ids.length != 0) {
			params.bill_ids.forEach((bills, index) => {
				url = `${url}bill_ids[]=${bills}${params.bill_ids.length - 1 == index ? '' : '&'}`;
				if (params.bill_ids.length - 1 === index) {
					window.open(url);
				}
				
			});
			
		}
		// this.loadSpin=false;
	}


	paramsObject(result={}) {
		let params = {
			...result,
			per_page: this.page.size,
			pagination:1, 
			page:this.page.pageNumber,
		}
		return params;
	}

	/**
	 * Queryparams to make unique URL
	 * @param params
	 * @returns void
	 */
	 addUrlQueryParams(params: any): void {
		this.location.replaceState(this._routerA.createUrlTree([], { queryParams: params }).toString());
	}

	getStatusPacketAction(action: any){
		return action.packet_status === 'Failed' ? true : false;
	}

	isPacketListAllSelected(): boolean {
		this.packetTotalRows = this.packetLists.length;
		const numSelected = this.packetSelection.selected.length;
		const numRows = this.packetTotalRows;
		return numSelected === numRows;
	}

	packetmasterToggle(): void {
		this.isPacketListAllSelected()
			? this.packetSelection.clear()
			: this.packetLists
					.slice(0, this.packetTotalRows)
					.forEach((row) => this.packetSelection.select(row));
	}

	packetListEvents(type){
		let ids = getIdsFromArray(this.packetSelection.selected, 'id');
		switch (type) {
			case 'delete-packet': {
				this.onDeletePacket({ ids: ids });
				break;
			}
			case 'generate-pom': {
				this.genertePOM( this.packetSelection.selected );
				break;
			}
		}
	}

	onDeletePacket(param){	
		this.customDiallogService.confirm('Delete Packet',
		`Do you really want to delete ${param && param.ids && param.ids.length==1?'this packet?':`these ${param && param.ids && param.ids.length} packets?`}`)
		.then((confirmed) => {
			if (confirmed){
				this.loadSpin = true;
			this.subscription.push(
				this.requestService
					.sendRequest(
						PacketEnum.deletePackets,
						'delete_with_body',
						REQUEST_SERVERS.fd_api_url,
						param,
					)
					.subscribe(
						(res: any) => {
							this.page.pageNumber = 0;
							if (res.status) {
								this.loadSpin =false;
								let params = {
									pagination: 1,
									per_page: this.page.size,
									page: this.page.pageNumber,
								};

								this.page.offset = 0;
								this.page.pageNumber = 1;
								this.packetSelection.clear();
								this.getPacketInfo(this.paramsObject({}));
								
								this.toastrService.success(res.message, 'Success');
							}
						},
						(error) => {
							this.loadSpin =false;
							this.toastrService.error(error.error.message, 'Error');
						},
					),
				);
			}
		})
		.catch();
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
			this.localStorage.setObject('packetsTableList' + this.storageData.getUserId(), data);
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
		this.packetsListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.packetsListTable._internalColumns.sort(function (a, b) {
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
