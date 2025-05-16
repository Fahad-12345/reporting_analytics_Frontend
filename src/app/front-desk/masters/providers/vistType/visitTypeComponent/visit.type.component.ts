import { DatePipeFormatService } from './../../../../../shared/services/datePipe-format.service';
import { map } from 'rxjs/operators';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { NgbModalRef, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Page } from '@appDir/front-desk/models/page';
import { Subject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { AclService } from '@appDir/shared/services/acl.service';
import { HttpService } from '@appDir/front-desk/fd_shared/services/http.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { OrderEnum, ParamQuery } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { parseHttpErrorResponseObject, unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { Location, LocationStrategy } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { VisitType } from '../VisitType.model';
import { VisitTypeUrlsEnum } from '../visit.type.enum';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { checkReactiveFormIsEmpty, getIdsFromArray, isEmptyObject, isObjectEmpty, makeDeepCopyArray, removeEmptyAndNullsFormObject } from '@appDir/shared/utils/utils.helpers';
import { MappingFilterObject } from '@appDir/shared/filter/model/mapping-filter-object';
import { environment } from 'environments/environment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
@Component({
	selector: 'app-visittype',
	templateUrl: './visit.type.component.html',
	styleUrls: ['./visit.type.component.scss']
})
export class VisittypeComponent extends PermissionComponent implements OnInit, OnDestroy {
	subscription: Subscription[] = [];
	loadSpin: boolean = false;
	isCollapsed = false;
	visitingtypeTotalRows: number;
	visitingtypeData: VisitType[] = [];
	page: Page;
	queryParams: ParamQuery;
	VisitTypeSelection = new SelectionModel<Element>(true, []);

	delMultiple: number;
	modalRef: NgbModalRef;
	refresh: Subject<any> = new Subject();
	searchForm: FormGroup;
	searchedRequestData: any[] = [];
	disableBtn: boolean = false;
	form: FormGroup;
	title: string;
	buttonTitle: string;
	eventsSubject: Subject<any> = new Subject<any>();
	selectedMultipleFieldFiter: any = {
		'cpt_codes_ids': [],
	};
	EnumApiPath = VisitTypeUrlsEnum;
	requestServerpath = REQUEST_SERVERS;
	conditionalExtraApiParams:any={
		type:'CPT',
		code_type_id:2
	}
	conditionalExtraApiParamsForSelectedData:any={}
	maxlength:number=250
	environment= environment;
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('visitTypeList') visitTypeListTable: DatatableComponent;
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
	visitTypeListingTable: any;

	constructor(private fdService: FDServices,
		aclService: AclService,
		private fb: FormBuilder,
		private modalService: NgbModal,
		private http: HttpService,
		router: Router,
		private toaster: ToastrService,
		protected requestService: RequestService,
		private _route: ActivatedRoute,
		private location: Location, private locationStratgy: LocationStrategy,
		titleService: Title,
		public datePipeService: DatePipeFormatService,
		private CanDeactivateModelComponentService: CanDeactivateModelComponentService,
		private storageData: StorageData,
		private localStorage: LocalStorage
		) {
		super(aclService, router, _route, requestService, titleService);
		this.page = new Page();
		this.page.pageNumber = 0;
		this.page.size = 10;

	}

	ngOnInit() {
		this.setTitle();
		// this.titleService.setTitle(this._route.snapshot.data['title']);
		this.searchForm = this.initializeVisitType();
		this.subscription.push(
			this._route.queryParams.subscribe((params) => {
				debugger
				this.searchForm.patchValue(params);
				if(params && params.cpt_codes_ids)
				{
					this.searchForm.patchValue({
						cpt_codes_ids:typeof params.cpt_codes_ids === `object`? params.cpt_codes_ids.map(id =>parseInt(id)):[parseInt(params.cpt_codes_ids)]
					});
				}

				this.page.size = parseInt(params.per_page) || 10;
				this.page.pageNumber = parseInt(params.page) || 1;
			}),
		);
		this.setPage({ offset: this.page.pageNumber - 1 || 0 });
		this.form = this.fb.group({
			id: [''],
			cpt_codes_ids:[''],
			enable_cpt_codes:[true],
			name: ['', [Validators.required]],
			qualifier:['',[Validators.required]],
			description: [''],
			avoid_checkedin :[''],
			is_reading_provider :['']
		});
		this.visitTypeListingTable = this.localStorage.getObject('visitTypeMasterTableList' + this.storageData.getUserId());
	}
	ngAfterViewInit() {
		if (this.visitTypeListTable?._internalColumns) {
			this.columns = makeDeepCopyArray([...this.visitTypeListTable._internalColumns]);
			this.columns.forEach(element => {
				if(this.visitTypeListingTable.length) {
					let obj = this.visitTypeListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.visitTypeListingTable.length) {
				const nameToIndexMap = {};
				this.visitTypeListingTable.forEach((item, index) => {
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
	/**
	 * conformation popup to reset  model 
	 **/
	resetModel() {
		if (this.form.dirty && this.form.touched) {
			this.CanDeactivateModelComponentService.canDeactivate().then(res => {
				if (res) {
					this.resetData();
				}
				else {
					return true;
				}
			});
		}
		else {
			this.resetData();
		}
	}
	/**
	 * reset model
	 **/
	resetData() {
		this.addUrlQueryParams();
		this.form.reset();
		this.modalRef.close();
	}
	/**
	 * to set task manager
	 */
	visitTypestringfy(obj) {
		return JSON.stringify(obj);
	}
	/**
	 * set search form
	 */
	initializeVisitType() {
		return this.fb.group({
			name: [''],
			cpt_codes_ids:[],
			description: [''],
		});
	}
	/**
	 * Reset Search form
	 */
	searchFormReset(numOfSet = 0) {
		
		this.eventsSubject.next(true);
		this.setPage({ offset: numOfSet });
		this.clearSelection();
	}
	onResetFilter(){
		this.searchForm.reset();
		this.eventsSubject.next(true);
		this.setPage({ offset: 0 });
		this.clearSelection();
	}
	/**set table action checkbox */
	isAllSelected() {
		this.visitingtypeTotalRows = this.visitingtypeData.length;
		const numSelected = this.VisitTypeSelection.selected.length;
		const numRows = this.visitingtypeTotalRows;
		return numSelected === numRows;
	}
	/**set table action checkbox */
	masterToggle() {
		this.isAllSelected()
			? this.VisitTypeSelection.clear()
			: this.visitingtypeData
				.slice(0, this.visitingtypeTotalRows)
				.forEach((row) => this.VisitTypeSelection.select(row as any));
	}
	/**
	 * open model to add/edit
	 * @param visittypeModel 
	 * @param row 
	 * @param rowIndex 
	 */
	openModel(visittypeModel, row?, rowIndex?) {
		debugger;
		this.title = 'Add';
		this.buttonTitle = 'Save & Continue';
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc',
		};
		if (row) {
			this.title = 'Edit';
			this.buttonTitle = 'Update';
			this.form.patchValue({
				id: row.id,
				name: this.visitingtypeData[rowIndex].name,
				qualifier: this.visitingtypeData[rowIndex].qualifier,
				description: this.visitingtypeData[rowIndex].description,
				cpt_codes_ids: this.visitingtypeData[rowIndex].code_ids.map(a => a.code_id),
				enable_cpt_codes: this.visitingtypeData[rowIndex].enable_cpt_codes,
				is_reading_provider :this.visitingtypeData[rowIndex].is_reading_provider,
				avoid_checkedin:this.visitingtypeData[rowIndex].avoid_checkedin
			});
		}
		else
		{
			this.form.patchValue({
				enable_cpt_codes: true
			})	
		}
		this.modalRef = this.modalService.open(visittypeModel, ngbModalOptions);
	}
	/**
	 * submiting form to add/update
	 * @param form 
	 */
	onSubmit(form) {
		if (this.title == 'Add') {
			this.addForm(form);
		}
		else {
			this.updateForm(form);
		}
	}
	/**
	 * add form
	 * @param form 
	 */
	addForm(form) {
		this.loadSpin = true;
		this.disableBtn = true;
		if (this.form.valid) {
			let req={...form}
			req.is_reading_provider=req.is_reading_provider?1:0;
			req.avoid_checkedin=req.avoid_checkedin?1:0
			 req= removeEmptyAndNullsFormObject(req);
			this.subscription.push(
				this.requestService
					.sendRequest(
						VisitTypeUrlsEnum.VisitType_list_POST,
						'POST',
						REQUEST_SERVERS.fd_api_url,
						req,
					)
					.subscribe(
						(data: any) => {
							if (data.status) {
								this.disableBtn = false;
								this.isAllSelected();
								this.searchFormReset();
								this.resetData();
								this.toaster.success('Successfully added', 'Success');
								this.loadSpin = false;
								this.form.reset();
								this.modalRef.close();
							}
						},
						(err) => {
							this.loadSpin = false;
							this.disableBtn = false;
							// const str = parseHttpErrorResponseObject(err.error.message);
							// this.toaster.error(str);
						},
					),
			);
			this.loadSpin = false;

		}
	}
	/**
	 * update form
	 * @param form 
	 */
	updateForm(form) {
		this.disableBtn=true;
		this.loadSpin = true;
		let req={...form}
			req.is_reading_provider=req.is_reading_provider?1:0;
			req.avoid_checkedin=req.avoid_checkedin?1:0
		 req= removeEmptyAndNullsFormObject(req);
		this.subscription.push(
			this.requestService
				.sendRequest(
					VisitTypeUrlsEnum.VisitType_list_PUT,
					'PUT',
					REQUEST_SERVERS.fd_api_url,
					req,
				)
				.subscribe(
					(data: any) => {
						if (data.status || data.status === 200) {
							this.loadSpin = false;
							this.disableBtn=false;
							this.isAllSelected();
							this.searchFormReset( this.page.pageNumber ? this.page.pageNumber : 0);
							// this.resetData();
							this.toaster.success('Successfully updated', 'Success');
							// this.setPage({ offset: this.page.pageNumber ? this.page.pageNumber : 0 });
							this.modalRef.close();
						}
					},
					(err) => {
						this.loadSpin = false;
						this.disableBtn=false;
						// const str = parseHttpErrorResponseObject(err.error.message);
						// this.toaster.error(str);
					},
				),
		);
		this.loadSpin = false;

	}
	pageLimit($num) {
		this.page.size = Number($num);
		this.setPage({ offset: 0 });
	}
	/**set page and param properties */
	setPage(pageInfo) {
		let pageNum;
		this.clearSelection();
		pageNum = pageInfo.offset;
		this.page.pageNumber = pageInfo.offset;
		const pageNumber = this.page.pageNumber + 1;
		let filters = checkReactiveFormIsEmpty(this.searchForm);
		this.queryParams = {
			filter: !isObjectEmpty(filters),
			order: OrderEnum.ASC,
			per_page: this.page.size,
			page: pageNumber,
			pagination: true,
		};
		// if (this.searchForm.valid) {
		let per_page = this.page.size;
		let queryParams = { name: this.searchForm.value.name,cpt_codes_ids:this.searchForm.value.cpt_codes_ids , description: this.searchForm.value.description, per_page, page: pageNumber };
		this.addUrlQueryParams(queryParams);
		// }
		this.getVisitTypeListing({ ...this.queryParams, ...filters });
	}
	/**set Query Params */
	addUrlQueryParams(params?) {
		this.location.replaceState(
			this.router.createUrlTree([], { queryParams: params, }).toString()
		);
	}
	/**
	 * get visit type listing
	 * @param queryParams 
	 */
	getVisitTypeListing(queryParams) {
		this.loadSpin = true;
		// for plan type
		this.subscription.push(
			this.requestService
				.sendRequest(
					VisitTypeUrlsEnum.VisitType_list_GET,
					'GET',
					REQUEST_SERVERS.fd_api_url,
					queryParams,
				)
				.subscribe(
					(data: any) => {
						if (data.status === 200 || data.status) {
							this.visitingtypeData = data && data.result ? data.result.data : [];
							this.page.totalElements = data && data.result.total ? data.result.total : 0;
							this.loadSpin = false;
						}
					},
					(err) => {
						const str = parseHttpErrorResponseObject(err.error.message);
						this.toaster.error(str);
					},
				),
		);
	}
	clearSelection() {
		this.VisitTypeSelection.clear();
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

	selectionOnValueChange(e: any,_form:FormGroup,Type?) {
		debugger;
		// switch(_formName)
		// {
		// 	case 'form':
		// 		this.form.controls[Type].setValue(e &&e.formValue?e.formValue:null);

		// 	case 'searchForm':
		// 		this.searchForm.controls[Type].setValue(e &&e.formValue?e.formValue:null);

		// }
		_form.controls[Type].setValue(e &&e.formValue?e.formValue:null);
		// this.getChange(e.data, e.label);
		// if(!e.data) {
		// 	this.searchForm.controls[Type].setValue(null);
		// }
	}

	getChange($event: any[], fieldName: string) {
		if($event) {
			this.selectedMultipleFieldFiter[fieldName] = $event.map(
				(data) =>
					new MappingFilterObject(
						data.id,
						data.name,
						data.full_Name,
						data.facility_full_name,
						data.label_id,
						data.insurance_name,
						data.employer_name,
						data.created_by_ids,
                        data.updated_by_ids,
					),
			);
		}
	}

	valueAssignInListOfFieldArray(values: object={}){
		this.selectedMultipleFieldFiter['cpt_codes_ids'] = values['cpt_codes_ids'];
		// this.lstspecalities = values['speciality_ids'];

	}
	visitTypeHistoryStats(row) {
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
			this.localStorage.setObject('visitTypeMasterTableList' + this.storageData.getUserId(), data);
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
		this.visitTypeListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.visitTypeListTable._internalColumns.sort(function (a, b) {
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
