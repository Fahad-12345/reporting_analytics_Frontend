import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
///<reference path="../../../../../node_modules/@angular/core/src/metadata/lifecycle_hooks.d.ts"/>
import { SelectionModel } from '@angular/cdk/collections';
import { formatDate } from '@angular/common';
import {
	AfterViewInit,
	Component,
	EventEmitter,
	Input,
	OnChanges,
	OnDestroy,
	OnInit,
	Output,
	SimpleChanges,
	ViewChild,
} from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { AclServiceCustom } from '@appDir/acl-custom.service';
import {
	NgxDataTable,
	NgxDataTableCol,
	NgxDataTableEventEmitter,
} from '@appDir/shared/modules/ngx-datatable-custom/models/deliveries-ngx-datatable.models';
import {
	HttpCollectionSuccessResponse,
	HttpCollectionSuccessResponseResultObj,
} from '@appDir/shared/modules/ngx-datatable-custom/models/http-responses.model';
import { RequestService } from '@appDir/shared/services/request.service';
import { Logger } from '@nsalaun/ng-logger';
import { DatatableComponent } from '@swimlane/ngx-datatable';

import {
	convertDateFormatUS,
	makeDeepCopyObject,
	removeObjectProperties,
	specificDateFormat,
} from './utils/common-functions';
import { changeBooleanToNumber, isValidDate } from '@appDir/shared/utils/utils.helpers';

@Component({
	selector: 'app-ngx-datatable',
	templateUrl: './ngx-datatable.component.html',
	styleUrls: ['./ngx-datatable.component.scss'],
})
//	extends PermissionComponent
export class NgxDatatableComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
	@Input() tableConf: NgxDataTable;
	//  @ViewChild('ngxDatableFilter') ngxDatableFilter : NgxDatatableFiltersComponent;
	@Input() selectedById: any[] = [];
	@Input() implicitFilters: boolean = true;

	@Output() dataTableEventEmitter = new EventEmitter();
	@Output() paramsEventEmitter = new EventEmitter();
	@Output() customFilterEventEmitter = new EventEmitter();
	@Output() changeEventNotRequestBased = new EventEmitter();
	@Output() requestFromServerRecived = new EventEmitter();
	tableData: HttpCollectionSuccessResponseResultObj;
	formDataEssentials = {};
	formDataFilters = {};
	subscription: Subscription[] = [];
	currentPaginator = {};
	disableAllCheckboxes = true;
	offset = 0;
	selection = new SelectionModel<any>(true, []);
	// items = [1,2,3,4,5,6,7,8];
	public loadSpin: boolean = false;

	//@ViewChild(NgxDatatableFiltersComponent) filterComp: NgxDatatableFiltersComponent;
	@ViewChild(DatatableComponent) ngxTable: DatatableComponent;
	filterData = {};
	constructor(
		private logger: Logger,
		private requestService: RequestService,
		public aclService: AclServiceCustom,
		private toastrService: ToastrService,
		public datePipeService:DatePipeFormatService
	) {
		//super(aclService);
	}

	ngOnInit() {
		this.tableConf.tableData = null;
		this.currentPaginator = {};
		if (this.tableConf.isRequestBased) {
			const formDataEssentials = {
				pagination: changeBooleanToNumber(this.tableConf.pagination),
				per_page: this.tableConf.rowsPerPage,
			};
			this.formDataEssentials = { ...formDataEssentials, ...(this.tableConf.defaultParams || {}) };
		} else {
			this.tableData = {
				data: this.tableConf.tableDateIfNotRequestBased,
				total:
					this.tableConf && this.tableConf.total
						? this.tableConf.total
						: this.tableConf &&
						  this.tableConf.tableDateIfNotRequestBased &&
						  this.tableConf.tableDateIfNotRequestBased.length,
			};
			this.tableData.data = [];
			this.tableData.data = [
				...(this.tableConf && this.tableConf.tableDateIfNotRequestBased
					? this.tableConf.tableDateIfNotRequestBased
					: []),
			];
		}
	}

	ngOnChanges(changes: SimpleChanges): void {
		// console.log("OnIt called Cahnges");
		if (
			changes['tableConf'] &&
			changes['tableConf'].currentValue &&
			!changes['tableConf'].currentValue.isRequestBased
		) {
			this.tableData = null;
			setTimeout(() => {
				this.tableConf = changes.tableConf.currentValue;
				this.tableData = {
					data: this.tableConf.tableDateIfNotRequestBased,
					total:
						this.tableConf && this.tableConf.total
							? this.tableConf.total
							: this.tableConf &&
							  this.tableConf.tableDateIfNotRequestBased &&
							  this.tableConf.tableDateIfNotRequestBased.length,
				};
				this.tableData.data = [
					...(changes &&
					changes.tableConf &&
					changes.tableConf.currentValue &&
					changes.tableConf.currentValue.tableDateIfNotRequestBased
						? changes.tableConf.currentValue.tableDateIfNotRequestBased
						: []),
				];
				this.tableConf.tableData = this.tableData;
				this.changeEventNotRequestBased.emit(this.currentPaginator);
			});
		}
		// else if (changes['tableConf'] && changes['tableConf'].currentValue  && changes['tableConf'] && !changes['tableConf'].currentValue.isRequestBased){

		// }
	}

	identify(index, item) {
		//do what ever logic you need to come up with the unique identifier of your item in loop, I will just return the object id.
		return item.header;
	}

	ngAfterViewInit(): void {
		if (this.tableConf.isRequestBased && this.tableConf.eagerLoad) {
			this.getTableData();
		}
	}

	// Method use to fetch data form remote services
	getTableData(formData = {}, resetFilter: boolean = false) {
		// console.log("called");
		this.loadSpin = true;
		this.disableAllCheckboxes = true;
		//	this.filterComp ? (this.filterComp.applyFilterListing = true) : '';
		setTimeout(() => {
			this.tableData = null;
		});
		// this.formDataFilters = this.
		if (resetFilter) {
			this.formDataFilters = formData;
			this.currentPaginator['page'] = 1;
			this.offset = 0;
		}
		this.filterData = formData;
		this.selection.clear();
		if (this.tableConf && this.tableConf['tab'] && this.tableConf['queryParams']) {
			if (formData['page']) {
				this.currentPaginator['page'] = formData['page'];
			}
		}
		const requestParams = this.removeEmptyAndNullsFormObject({
			...this.formDataEssentials,
			...formData,
			...this.formDataFilters,
			...this.currentPaginator,
		});
		// console.log(requestParams);
		this.unSubAllPrevious();
		if ('pagination' in requestParams && !('page' in requestParams)) {
			Object.assign(requestParams, { page: 1 });
		}
		if (this.tableConf && this.tableConf['tab'] && this.tableConf['queryParams']) {
			requestParams['tab'] = this.tableConf['tab'];
			this.offset = requestParams['page'] ? requestParams['page'] - 1 : 0;
			// if (this.filterComp && this.filterComp['filterButtonClicked']) {
			// 	let deepObj = makeDeepCopyObject(requestParams);
			// 	if (Object.keys(deepObj).length) {
			// 		Object.keys(deepObj).forEach(function (key) {
			// 			if (Array.isArray(deepObj[key])) {
			// 				deepObj[key].forEach((k) => {
			// 					deepObj[key + '[]'] = k;
			// 				});
			// 				delete deepObj[key];
			// 			}
			// 			console.log(key, deepObj[key]);
			// 		});
			// 	}
			// 	this.paramsEventEmitter.emit(deepObj);
			// } else {
			// 	this.paramsEventEmitter.emit({});
			// }
		}

		let removeProps = ['patientObject', 'driverObject', 'providerObject', 'areaIdObject'];
		this.subscription.push(
			this.requestService
				.sendRequest(
					this.tableConf.serviceUrl,
					'get',
					removeObjectProperties(makeDeepCopyObject(requestParams), removeProps),
				)
				.subscribe(
					(res: HttpCollectionSuccessResponse) => {
						setTimeout(() => {
							this.loadSpin = false;
							this.tableData = res.result;
							console.log(this.tableData);
							//this.filterComp ? (this.filterComp.applyFilterListing = false) : '';
							this.tableConf.tableData = this.tableData;
							this.requestFromServerRecived.emit(true);
							if (this.tableData.data.length == 0) {
								this.toastrService.error('No Record Found', 'Error');
							}
							this.disableAllCheckboxes = false;
							if (this.selectedById) {
								this.selectDetailsById();
							} else {
								this.selection.clear();
							}
						});
					},
					(err) => {
						this.loadSpin = false;
					},
				),
		);
	}

	selectDetailsById() {
		this.tableConf.tableData.data.forEach((tableData, index) => {
			this.selectedById.forEach((selected) => {
				if (tableData.id === selected) {
					this.selection.select(tableData);
				}
			});
		});
	}

	/*=======================================Events that need to handle inside NgxDataTable==================================*/

	// for handling custom like shuffle delivery like situations
	handelCustomEvents(methodType, row) {
		switch (methodType) {
			case 'shuffleDelivery': {
				this.shuffleDelivery(row);
				break;
			}
			case 'shuffleByTimeSlot': {
				if (this.returnRowsBasedOnSelectionCriteria().length) {
					this.shuffleByTimeSlot();
				} else {
					this.handelDataTableEvents('showShuffleErrorMessage', row);
				}
				break;
			}
		}
	}

	shuffleDelivery(row) {
		this.offset = 0;
		this.currentPaginator = 1;
		// test
		const params = {
			origin: row.id,
			waypoints: this.tableData.data.filter((d) => d.id !== row.id).map((i) => i.id),
		};
		// console.log(params);
		this.getTableData(params);
	}

	shuffleByTimeSlot() {
		const params = {
			time_slot: 1,
		};
		this.getTableData(params);
	}

	/*=======================================Events that need to handle inside NgxDataTable==================================*/

	// Handle paginator events
	onPage($event) {
		this.currentPaginator = {
			page: $event.offset + 1,
		};
		this.offset = $event.offset;
		// this.logger.log(this.formDataFilters);
		this.implicitFilters
			? this.getTableData(this.currentPaginator)
			: this.customFilterEventEmitter.emit(this.currentPaginator);
	}

	testUtc(value) {
		let t: string[] = value.split(/[- :]/);

		let d = new Date(Date.UTC(+t[2], +t[0] - 1, +t[1], +t[3], +t[4], +t[5]));
	}

	// Helper function if value is an Object not a single string this function will use get required properties of object and return as a string
	getRequiredKeysFromObject(col: NgxDataTableCol, value) {
		const glue = col.objectRequiredValuesGlue || ' ';
		//  console.log(col);
		//   console.log(value);
		let response = '';
		if (col.objectRequiredValues) {
			const keys = col.objectRequiredValues.split(',');
			keys.forEach((key, index, arr) => {
				if (value && value[key.trim()]) {
					response += value[key.trim()] + (index < keys.length - 1 ? glue : '');
				}
			});
		}
		return response;
	}

	getRequiredMulitpleKeys(col: NgxDataTableCol, row, value) {
		const glue = col.objectRequiredValuesGlue || ' ';
		const keys: string[] = col.mutlipleKeys.split(',');
		let response = '';
		keys.forEach((key, index) => {
			if (row[key] == null || row[key] == '' || row[key] == undefined) {
				return;
			}
			if (col.isDateField) {
				let value = key
					? specificDateFormat(
							convertDateFormatUS(row[key.trim()], '/'),
							`MM${col.date_format}DD${col.date_format}YY`,
					  )
					: '';
				response += value + (index < keys.length - 1 ? glue : '');
			} else {
				key ? (response += row[key.trim()] + (index < keys.length - 1 ? glue : '')) : '';
			}
		});
		response === '' || response == null || response == undefined ? (response = '-') : response;
		return response;
	}

	formatTime(time: string) {
		const date = new Date();
		let timeArray: string[];
		timeArray = time.split(':');
		date.setHours(+timeArray[0]);
		date.setMinutes(+timeArray[1]);
		date.setSeconds(+timeArray[2]);
		if (isValidDate(date)) {
			return formatDate(date, 'h:mm a', 'en-US');
		}
	}

	formatTimeSplit(bothTime: string, index) {
		if (!bothTime && bothTime.length == 0) {
			return;
		}
		let splitTime = bothTime.split('-');
		const date = new Date();
		let timeArray: string[];
		timeArray = splitTime[index].split(':');
		date.setHours(+timeArray[0]);
		date.setMinutes(+timeArray[1]);
		date.setSeconds(+timeArray[2]);
		if (isValidDate(date)) {
			return formatDate(date, 'h:mm a', 'en-US');
		}
	}

	// Emit events to parent Component like dialog box open or link
	handelDataTableEvents(type, value, $event?: MatCheckboxChange) {
		const emitValue: NgxDataTableEventEmitter = {
			type: type,
			value: value,
			paginator: this.currentPaginator,
		};
		if (type === 'implicitActionOnSelection') {
			// console.log(this.selection.selected.length);
			$event.checked ? this.selection.select(value[0]) : this.selection.deselect(value[0]);
			if (this.tableConf.disableSelectionInitially) {
				this.toastrService.error('Case Id filter is required', 'Error ');
				return false;
			}
			if (this.tableConf.emitOnEachSelection) {
				emitValue.value = this.selection.selected;
				this.dataTableEventEmitter.emit(emitValue);
			}
		} else {
			this.dataTableEventEmitter.emit(emitValue);
		}
	}

	/* ================================= Selection Code ================================================*/

	/** Whether the number of selected elements matches the total number of rows. */
	isAllSelected() {
		// console.log('isAllSelected');
		const numSelected = this.selection.selected.length;
		let numRows: number;
		if (this.tableConf.conditionalCheckboxField) {
			numRows = this.returnRowsBasedOnSelectionCriteria().length;
		} else {
			numRows = this.tableData.data.length;
		}
		// console.log(numRows, numSelected);
		return numSelected === numRows;
	}

	/** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggle(type) {
		// console.log('masterToggle');
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			if (this.tableConf.conditionalCheckboxField) {
				this.returnRowsBasedOnSelectionCriteria().forEach((row) => this.selection.select(row));
			} else {
				this.tableData.data.forEach((row) => this.selection.select(row));
			}
		}
		if (this.tableConf.emitOnEachSelection) {
			const emitValue: NgxDataTableEventEmitter = {
				type: type,
				value: this.selection.selected,
				paginator: this.currentPaginator,
			};
			// console.log(this.selection.selected);
			this.dataTableEventEmitter.emit(emitValue);
		}
	}

	deSelectRow(row) {

		setTimeout(() => {
			this.logger.log(this.selection.selected);
			this.selection.deselect(...row);
			this.logger.log(this.selection.selected);
			// this.selection.clear();
			// this.selection.clear();
			// this.masterToggle('implicitActionOnSelection')
			// this.selection.changed();
		});
	}

	returnRowsBasedOnSelectionCriteria() {
		return this.tableData.data.filter((rec) => rec[this.tableConf.conditionalCheckboxField]);
	}

	/* ================================= Selection Code ================================================*/

	dd(...args) {
	}

	unSubAllPrevious() {
		if (this.subscription.length) {
			this.subscription.forEach((sub) => {
				// this.logger.log('unsubscribe');
				sub.unsubscribe();
			});
		}
	}

	showDisabledMessage() {
		if (this.tableConf.disableSelectionInitially) {
		}
	}

	removeEmptyAndNullsFormObject(obj) {
		Object.keys(obj).forEach((key) => (obj[key] == null || obj[key] === '') && delete obj[key]);
		return obj;
	}

	ngOnDestroy(): void {
		// this.logger.log('ngOnDestroy');
		this.unSubAllPrevious();
	}
}
