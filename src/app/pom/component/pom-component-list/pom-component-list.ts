import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageData } from './../../../pages/content-pages/login/user.class';
import { ToastrService } from 'ngx-toastr';
import { PomEnum } from './../../pom.enum';
import { REQUEST_SERVERS } from './../../../request-servers.enum';
import { Subscription } from 'rxjs';
import { RequestService } from './../../../shared/services/request.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Page } from './../../../shared/models/listing/page';
import { BillRecepientType } from '../../../../app/front-desk/reports/report.enum'
import {
	Component, ElementRef, ViewChild
} from '@angular/core';
import { IFilterFieldHtml } from '@appDir/shared/filter/model/filter-field-html-model';
import { PomFilterFieldModel } from '@appDir/shared/filter/model/pom-filter-field-model';

import * as moment from 'moment';
import { getExtentionOfFile, formatBytes, changeDateFormat, removeEmptyAndNullsArraysFormObject, makeDeepCopyArray, getIdsFromArray } from '@appDir/shared/utils/utils.helpers';
import { CasePomFilterFieldModel } from '@appDir/shared/filter/model/casePom-filter-field-model';
import { Location } from '@angular/common';
import { FilterModelQueryPassInFormField } from '@appDir/shared/filter/model/filter-model-query-pass-in-form-field';
import { FilterModelQueryPassInApi } from '@appDir/shared/filter/model/filter-model-query-pass-in-api';
import * as $ from 'jquery';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { SelectionModel } from '@angular/cdk/collections';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { POMVERIFICATION } from '../../component/pom-component-list/type-id-params';

@Component({
	selector: 'app-pom-list-split',
	templateUrl: './pom-component-list.html',
	styleUrls: ['./pom-component-list.scss'],
})
export class PomSplitListComponent {

	loadSpin: boolean = false;

	page = new Page();
	pomDetailPage = new Page();
	pomFiled: IFilterFieldHtml;
	pomData:any[] = [];
	billingPomData:any[] = [];
	insurance_names: string[] = [];
	verificationDetails: { date: string, description: string }[] = [];
	billPom : any;
	pomVerificationDetailPage = new Page();
	subscription : Subscription[] = [];
	file_name = '';
	tags;
	pomId = '';
	pomNf2_modal : any;
	showVerificationModel: boolean = false;
    showBillPomModel: boolean = false;
	scanFile = null;
	buttonDisabled: boolean = false;
	getExtentionOfFile = getExtentionOfFile;
	receivedPOMDate = '';
	filterInfoObject = {};
	type_id;
	formFiledValue: any;
	billingPomDataTest : any ;
	formFiledListOfValue: any;
	@ViewChild('fileInput') fileInput: ElementRef;
	pomType = PomEnum;
	selection = new SelectionModel<Element>(true, []);
	pomTotalRows:number = 0;
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('pomList') pomListTable: DatatableComponent;
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
	pomsReportsListingTable: any;
	url: any;
	pom_id: number;
	pom_modal: any;
	row_data: any;
	modalClosed: boolean = true;

	constructor(private modalService: NgbModal,
		private requestService: RequestService,
		private toastrService: ToastrService,
		private storageData: StorageData,
		private route: ActivatedRoute,
		private router: Router,
		private location: Location,
		public datePipeService:DatePipeFormatService,
		public customDiallogService: CustomDiallogService,
		private localStorage: LocalStorage
	) {
	}

	ngOnInit(): void {
		this.url = this.router.url.split('/')[2].split('?')[0];
		this.subscription.push(
			this.route.queryParams.subscribe((params) => {
				// this.formFiledValue = new FilterModelQuery(params);
				this.formFiledListOfValue = new FilterModelQueryPassInFormField(params);
				this.filterInfoObject = new FilterModelQueryPassInApi(params);  
				this.formFiledValue = new FilterModelQueryPassInApi(params);  
				this.page.pageNumber = parseInt(params.page) || 1;
				this.page.size = parseInt(params.per_page) || 10;
				this.page.offset = this.page.pageNumber - 1;
				this.pomDetailPage.pageNumber = 1;
				this.pomDetailPage.size = 10;
				this.pomDetailPage.offset = this.pomDetailPage.pageNumber - 1;
				this.pomVerificationDetailPage.pageNumber = 1;
                this.pomVerificationDetailPage.size = 10;
                this.pomVerificationDetailPage.offset = this.pomVerificationDetailPage.pageNumber - 1;
				this.getPomType(); // GET TYPE OF POM [CASE OR BILL]
				this.getPomListing(this.paramsObject(this.formFiledValue));
			}),
		);
		if(this.url == 'pom-list') {
			this.pomsReportsListingTable = this.localStorage.getObject('createdBillPomsReportsTableList' + this.storageData.getUserId());
		}
		else if (this.url == 'case-list') {
			this.pomsReportsListingTable = this.localStorage.getObject('createdNf2PomsReportsTableList' + this.storageData.getUserId());
		}
	}
	ngAfterViewInit() {
		if (this.pomListTable?._internalColumns) {
			this.cols = makeDeepCopyArray([...this.pomListTable._internalColumns]);
			this.cols.forEach(element => {
				if(this.pomsReportsListingTable?.length) {
					let obj = this.pomsReportsListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.pomsReportsListingTable?.length) {
				const nameToIndexMap = {};
				this.pomsReportsListingTable.forEach((item, index) => {
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
	getPomType() {
		if(this.url == 'pom-list') {
			this.type_id = PomEnum.typeIdBillPom;
			this.pomFiled = new PomFilterFieldModel();
		} else if (this.url == 'case-list') {
			this.type_id = PomEnum.typeIdCasePom;
			this.pomFiled = new CasePomFilterFieldModel();
		}
	}
	pageLimit($event) {
		this.page.size = Number($event);
		this.page.offset = 0;
		this.page.pageNumber = 1;
		this.getPomListing(this.paramsObject(this.filterInfoObject));
	}


	paramsObject(result = {}){
		debugger;
		let params = {
			...result,
			type_id: this.type_id,
			per_page: this.page.size || 10,
			pagination: 1,
			page: this.page.pageNumber
		}
		return params;
	}


	onPageChange(pageInfo) {

		this.page.offset = pageInfo.offset;
		this.page.pageNumber = pageInfo.offset + 1;
		this.getPomListing(this.paramsObject(this.filterInfoObject));

	}

	onPOMDetailPageChange(pageInfo) {
		
		this.pomDetailPage.offset = pageInfo.offset;
		this.pomDetailPage.pageNumber = pageInfo.offset + 1;
		this.getPOMDetail(this.pom_id, this.pom_modal,this.pomNf2_modal, this.billPom);
	}

	onPOMVerificationDetailPageChange(pageInfo) {
		
		this.pomVerificationDetailPage.offset = pageInfo.offset;
		this.pomVerificationDetailPage.pageNumber = pageInfo.offset + 1;
		this.getPOMDetail(this.pom_id, this.pom_modal,this.pomNf2_modal, this.billingPomDataTest);
	}

	viewDoc(row,param?){
		if (param){
			row && row.scan_pom_media && row.scan_pom_media.pre_signed_url ?
			 window.open(row.scan_pom_media.pre_signed_url) 
			 : '';

		}else {

			row && row.pom_media && row.pom_media.pre_signed_url ? 
			window.open(row.pom_media.pre_signed_url)
			 : '';
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

	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.pomData.length;
		return numSelected === numRows;
	}

	isPomsAllSelected(): boolean {
		this.pomTotalRows = this.pomData.length;
		const numSelected = this.selection.selected.length;
		const numRows = this.pomTotalRows;
		return numSelected === numRows;
	}

	pomsmasterToggle(): void {
		this.isPomsAllSelected()
			? this.selection.clear()
			: this.pomData
					.slice(0, this.pomTotalRows)
					.forEach((row:any) => this.selection.select(row));
	}

	confirmDel(id?: number) {
		this.customDiallogService
		.confirm(`Delete ${id?'POM':'POMS'}`, `Do you really want to delete ${id?'this POM?':
		this.selection.selected.length===1?'this POM?':'these POMS?'}`)
		.then((confirmed) => {
			if (confirmed) {
				this.deleteSelected(id);
			}
		})
		.catch();
	}

	deleteSelected(id?: number) {
		this.loadSpin = true
		let ids: any = [];
		if (id) {
			ids.push(id);
		} else {
			this.selection.selected.forEach(function (obj) {
				ids.push(obj.id);
			});
		}
		let requestData = {
			ids: ids
		};
		this.subscription.push(
			this.requestService
			  .sendRequest(
				this.type_id == PomEnum.typeIdBillPom ?
				PomEnum.deletebillPom : PomEnum.deletenf2pom,
				'delete_with_body',
				REQUEST_SERVERS.fd_api_url,
				requestData,
			  )
			  .subscribe(
				(res: any) => {
					if (res && res.status===true) {
						this.loadSpin = false;
						this.toastrService.success(res.message, 'Success');
						this.selection.clear();
						this.getPomListing(this.paramsObject(this.formFiledValue));
					}else {
						this.loadSpin = false;
						this.selection.clear();
					}
				},
				(err) => {
					this.loadSpin = false;
				},
			  ),
		  );
		
	}
	  
	getPomListing(params){
		this.loadSpin =true;
		const param = removeEmptyAndNullsArraysFormObject(params);
		this.addUrlQueryParams(param);
		const paramData = new FilterModelQueryPassInApi(param);
		if(!paramData?.type_ids?.length){
			paramData['type_ids']=[]
			paramData['type_ids'].push(paramData?.type_id);
			if(paramData.type_ids.includes(POMVERIFICATION.BILLPOM)){
				paramData['type_ids'].push(POMVERIFICATION.VERIFICATIONPOM);
			}else if(paramData.type_ids.includes(POMVERIFICATION.VERIFICATIONPOM)){
				paramData.type_ids.includes(POMVERIFICATION.BILLPOM)
			}
		}
		this.subscription.push(
			this.requestService
				.sendRequest(PomEnum.getPomStamp, 'GET', REQUEST_SERVERS.fd_api_url, 
				removeEmptyAndNullsArraysFormObject(paramData))
				.subscribe(
					(res: any) => {
						if (res['status'] == 200 || res['status'] == true) {
							this.loadSpin =false;
							this.pomData = res.result.data ? [...res.result.data] : [];
							this.page.totalElements = res.result.total;
							this.page.totalPages = res.result.page;
							if(params['offset']=== 0){
								this.page.offset = 0;
							}
						}

						setTimeout(() => {
							$('datatable-body').scrollLeft(1);
						}, 50);
					},
					(err) => {
						this.loadSpin =false;
					},
				),
		);
	}

	/**
	----- Below Un Used Code -----	
	*/
	uploadStampPom(params) {
		this.subscription.push(
			this.requestService
				.sendRequest(
					PomEnum.uploadTimeStamp,
					'POST',
					REQUEST_SERVERS.fd_api_url,
					params,
				)
				.subscribe((comingData: any) => {
					if (comingData['status'] == 200 || comingData['status'] == true) {


					}
				}),
		);
	}

	onPomUpload(row,uploadTimeStamp) {

		this.pomId = row.id;
		this.file_name = this.makeFileName(this.pomId);
		if (this.fileInput && this.fileInput.nativeElement && this.fileInput.nativeElement.value){
			this.fileInput.nativeElement.value = '';
		}
		this.scanFile =null;
		this.tags = null;
		this.openTimeStamp(row,uploadTimeStamp);
	}


	makeFileName(pomId) {
		let name = 'POM' + '_' + pomId + '_' + this.getCurrentDateWithFormat('MM-DD-YY');
		return name + '.pdf';
	}

	getCurrentDateWithFormat(format) {
		return moment().format(format);
	}

	getPOMDetail(pomId,pomModal,pomNf2Modal ,row) {
		this.pom_id = pomId;
		this.pom_modal = pomModal;
		this.pomNf2_modal = pomNf2Modal
		this.row_data = row;
		if (this.type_id == PomEnum.typeIdCasePom) {
			this.billingPomData = row.pom_case_detail;
			this.pomDetailPage.totalElements = this.billingPomData?.length ;
			this.pomVerificationDetailPage.totalElements =  this.billingPomData?.length ;
			this.modalService.open(this.pomNf2_modal, { size: 'lg' });
		} else if (this.type_id == PomEnum.typeIdBillPom) {
			let params = {
				pom_id: pomId,
				per_page: this.showBillPomModel ? this.pomDetailPage.size :this.pomVerificationDetailPage.size ,
				pagination: 1,
				page: this.showBillPomModel ? this.pomDetailPage.pageNumber :this.pomVerificationDetailPage.pageNumber
			}

			this.subscription.push(
				this.requestService
					.sendRequest(PomEnum.getSinglePomBillDetail, 'GET', REQUEST_SERVERS.fd_api_url, params)
					.subscribe(
						(res: any) => {
							if (res['status'] == 200 || res['status'] == true) {
								this.modalClosed ? this.openPomModal() : '';
								this.loadSpin = false;
								this.billingPomData = res.result.data ? [...res.result.data] : [];
								const categoryExists = res.result.data.some(e => e.hasOwnProperty('category'));
                                      if (categoryExists) {
                                         this.showBillPomModel = true;
                                         this.showVerificationModel = false;
                                      } else {
                                         this.showVerificationModel = true;
                                         this.showBillPomModel = false;
                                              }

								const data = this.billingPomData
								this.billPom = data?.map(e => e.bills)
								this.billingPomDataTest = this.billingPomData
								this.pomDetailPage.totalElements = res.result.total;
								this.pomVerificationDetailPage.totalElements = res.result.total
								this.pomDetailPage.totalPages = res.result.page;
							}
							setTimeout(() => {
								$('datatable-body').scrollLeft(1);
							}, 50);
						},
						(err) => {
							this.loadSpin = false;
						},
					),
			);
		}
	}

	openTimeStamp(row,uploadTimeStamp){
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc',
		};
		this.modalService.open(uploadTimeStamp, ngbModalOptions);
	}

	openPomModal() {
		this.modalClosed = false;
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc bill-modal-xl',
			size: 'lg',
		};
		this.modalService.open(this.pom_modal, ngbModalOptions);
	}

	closePomModal() {
		this.modalClosed = true;
		this.pomDetailPage.pageNumber = 1;
		this.pomDetailPage.size = 10;
		this.pomDetailPage.offset = this.pomDetailPage.pageNumber - 1;
		this.pomVerificationDetailPage.pageNumber = 1;
		this.pomVerificationDetailPage.size = 10;
		this.pomVerificationDetailPage.offset = this.pomVerificationDetailPage.pageNumber - 1;
		this.modalService.dismissAll();
	}

	navigateToCaseDetails(caseId: string) {
		this.closePomModal();
		this.router.navigate([`/front-desk/cases/edit/${caseId}/patient/patient_summary`]);
	}

	pomDetailPageLimit($event) {
		this.pomDetailPage.size = Number($event);
		this.pomDetailPage.offset = 0;
		this.pomDetailPage.pageNumber = 1;
		this.pomVerificationDetailPage.size = Number($event);
		this.pomVerificationDetailPage.offset = 0;
		this.pomVerificationDetailPage.pageNumber = 1;
		this.getPOMDetail(this.pom_id, this.pom_modal,this.pomNf2_modal, this.row_data);
	}
	getRecipatentName(row,singleRow?) {
		
		if (row?.recipient && (row?.bill_recipient_type_id === BillRecepientType.LawFirm)) {
			return `${(row?.bill_recipient_type_id === BillRecepientType.LawFirm && singleRow?.firm_name) ? singleRow?.firm_name : ''}`;
		}
		else if (row?.recipient && (row?.bill_recipient_type_id === BillRecepientType.Patient)){
			return `${row?.recipient.first_name} ${
				row?.recipient?.middle_name ? row?.recipient?.middle_name : ''
			} ${row?.recipient?.last_name}`;
		}
		
		else if (row?.recipient && row?.bill_recipient_type_id === BillRecepientType.Employer ) {
			return row?.recipient?.employer_name;
		} else {
			return row?.recipient ? row.recipient.insurance_name : '';
		}
	}

	onFileChange(event) {
		const reader = new FileReader();
		if (event.target.files && event.target.files.length > 0) {
			const file = event.target.files[0];
			reader.readAsDataURL(file);
			if (file && file['name']) {
				// if (this.getExtentionOfFile(files.item(0).name) == '.jpg' || this.getExtentionOfFile(files.item(0).name) == '.png' || this.getExtentionOfFile(files.item(0).name) == '.gif' || this.getExtentionOfFile(files.item(0).name) == '.pdf') { this.fileToUpload = files.item(0); }
				if (this.getExtentionOfFile(file['name']) == '.pdf') { this.scanFile = file; }
				else {
					this.toastrService.error('Please select  pdf file');
					return false;
				}
			}
		}
	}

	addMedia() {
		let UploadURL;
		const formData: FormData = new FormData();
		if (!this.scanFile) {
			this.toastrService.error('Please select a file');
			return false;
		}
		formData.append('file', this.scanFile, this.file_name);
		formData.append('name', this.file_name);
		formData.append('pom_id', this.pomId);
		if (this.tags){
		formData.append('tags', this.tags.map((item) => { return item.value }).join(","));
		}
		if (this.receivedPOMDate) {
			formData.append('received_pom_date', changeDateFormat(this.receivedPOMDate));
		}
		if (this.scanFile.type != "application/pdf") {
			this.toastrService.error('Upload only Pdf File');
			return false;
		}
		if (formatBytes(this.scanFile.size)['type'] == 'mb' && formatBytes(this.scanFile.size)['size'] > 8) {
			this.toastrService.error('File size must be smaller than 8 MB');
			return false;
		}
		this.buttonDisabled = true;
		this.loadSpin = true;
		if(this.type_id == PomEnum.typeIdBillPom) {
			UploadURL = PomEnum.uploadTimeStamp;
		} else if(this.type_id == PomEnum.typeIdCasePom) {
			UploadURL = PomEnum.uploadCasePom;
		}
		this.subscription.push(
			this.requestService.sendRequest(UploadURL,
				'POST',
				REQUEST_SERVERS.fd_api_url,
				formData).subscribe((res: any) => {

					let response: any;
					response = res.body;
					if (res.status) {
						this.loadSpin = false;
						this.buttonDisabled = false;
						// this.getPomList(this.setParam());
						if (this.fileInput && this.fileInput.nativeElement && this.fileInput.nativeElement.value) {
							this.fileInput.nativeElement.value = '';
						}
						this.receivedPOMDate = '';

						this.toastrService.success(res.message, "Success");
						this.getPomListing(this.paramsObject(this.filterInfoObject));
						this.modalService.dismissAll();
						this.file_name = '';
						this.tags = [];
					} else {
						this.loadSpin = false;
						this.buttonDisabled = false;
						this.toastrService.error(res.message, "Error");
					}
				}, error => {
					this.buttonDisabled = false;
					this.loadSpin = false;
					this.toastrService.error(error.message, "Error");
				})
		);

	}
	filterResponseData(filterInfo: any){
		this.filterInfoObject = filterInfo;
		this.page.offset = 0;
		this.page.pageNumber = 1;
		this.getPomListing(this.paramsObject(this.filterInfoObject));

	}

	/**
	 * Queryparams to make unique URL
	 * @param params
	 * @returns void
	 */
	addUrlQueryParams(params: any): void {
		this.location.replaceState(this.router.createUrlTree([], { queryParams: params }).toString());
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
			if(this.url == 'pom-list') {
				this.localStorage.setObject('createdBillPomsReportsTableList' + this.storageData.getUserId(), data);
			}
			else if (this.url == 'case-list') {
				this.localStorage.setObject('createdNf2PomsReportsTableList' + this.storageData.getUserId(), data);
			}
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
		this.pomListTable._internalColumns = columnsBody.filter(c => {
		  return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.pomListTable._internalColumns.sort(function (a, b) {
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

