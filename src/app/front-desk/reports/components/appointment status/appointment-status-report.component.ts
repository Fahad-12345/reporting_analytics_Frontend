import { Page } from './../../../../shared/models/listing/page';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import { changeDateFormat, makeDeepCopyArray, removeEmptyAndNullsArraysFormObject, removeEmptyAndNullsFormObject, convertDateTimeForRetrieving, getIdsFromArray } from '@appDir/shared/utils/utils.helpers';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { ToastrService } from 'ngx-toastr';
import { Socket } from 'ngx-socket-io';
import { Title } from '@angular/platform-browser';
import { StorageData } from './../../../../pages/content-pages/login/user.class';
import { RequestService } from './../../../../shared/services/request.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AclService } from './../../../../shared/services/acl.service';
import { ReportsService } from './../../reports.service';
import { DatePipeFormatService } from './../../../../shared/services/datePipe-format.service';
import { CustomizeColumnComponent } from './../../../../shared/components/customize-columns-component/customize-columns-component';
import { ReportFiltersComponent } from './../reports-filter-component/report-filter-component';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Component, ViewChild, OnInit } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { O, T } from '@angular/cdk/keycodes';
import { Subscription, take } from 'rxjs';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import {StatusPopupComponent} from '../status-popup/status-popup.component';

@Component({
    selector: 'app-appointment-status',
    templateUrl: './appointment-status-report.component.html',
    styleUrls: ['./appointment-status-report.component.scss']
  })

  export class AppointmentStatusComponent  extends PermissionComponent implements OnInit {
	isCollapsed = false;
	defaultPagination:any = {};
	loadSpin: boolean = false;
	appointmentStatusReport:any[] = [];
	modalCols :any[] = [];
	columns: any[] = [];
	alphabeticColumns:any[] =[];
	colSelected: boolean = true;
  	isAllFalse: boolean = false;
	page: Page = new Page();
	valueFromPopup: any;

	filterFormDataValue:any;
	loaderSpinnerProgressOnly: boolean =false;
	filtersIncludes:any [] = ['clinic_location_ids','appointment_status_ids','insurance_ids','in_house','case_type_ids','facility_location_ids','created_by_ids','updated_by_ids','created_at','updated_at','case_ids','patient_name','doctor_ids','speciality_ids','appointment_type_ids','start_date','end_date'];

	@ViewChild('appointmentStatusList') appointmentStatusListTable: DatatableComponent;
	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('ReportFilterComponent') reportFilterComponent:ReportFiltersComponent;
	customizedColumnComp: CustomizeColumnComponent;
	@ViewChild(CustomizeColumnComponent) set content(content: CustomizeColumnComponent) {
	  if (content) { // initially setter gets called with undefined
		this.customizedColumnComp = content;
	  }
	}
	subcription: Subscription[]=[];
	appointmentStatusReportsListingTable: any;
	valueToPass: any;
	constructor(private datePipeService: DatePipeFormatService ,
		private reportService:ReportsService,
		aclService: AclService,
		public router: Router,
			private _route: ActivatedRoute,
			public requestService: RequestService,
			private storageData: StorageData,
			titleService: Title,
			private socket:Socket,
			private toaster: ToastrService,
			private modalService: NgbModal,
			private localStorage: LocalStorage
		){
		super(aclService, router, _route, requestService, titleService);
		}

	ngOnInit() {
		this.page.size =  10;
		this.page.pageNumber = 1;
		let params = {
			page:this.page.pageNumber, 
			per_page:this.page.size, 
			paginate : true,
			start_date: 
				this.reportFilterComponent && this.reportFilterComponent.searchForm?
				changeDateFormat(this.reportFilterComponent.searchForm.value.start_date):				
				changeDateFormat(new Date())
				,
			end_date : this.reportFilterComponent && this.reportFilterComponent.searchForm?
			changeDateFormat(this.reportFilterComponent.searchForm.value.end_date):
				changeDateFormat(new Date())
				,
			in_house: this.reportFilterComponent && this.reportFilterComponent.searchForm?
				this.reportFilterComponent.searchForm.value.in_house: 'all'
		}
		this.getAppointmentStatusReport(params);
		this.subcription.push(this.socket.fromEvent('GETREPORTSURL').subscribe((message:any)=>{
			this.loaderSpinnerProgressOnly = false;
			this.loadSpin = false;
			if (message && message.url){
			window.open(message.url);
			}
			else {
				this.toaster.error(message);
			}
		}))


		this.socket.on('STARTREPORTSLOADER', (message) => {
			this.loaderSpinnerProgressOnly =true;
		});
		this.appointmentStatusReportsListingTable = this.localStorage.getObject('appointmentStatusReportsTableList' + this.storageData.getUserId());
	}

	ngAfterViewInit() {
		if (this.appointmentStatusListTable?._internalColumns) {
			this.columns = makeDeepCopyArray([...this.appointmentStatusListTable._internalColumns]);
			this.columns.forEach(element => {
				if(this.appointmentStatusReportsListingTable.length) {
					let obj = this.appointmentStatusReportsListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.appointmentStatusReportsListingTable.length) {
				const nameToIndexMap = {};
				this.appointmentStatusReportsListingTable.forEach((item, index) => {
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
		this.filterFormDataValue=this.reportFilterComponent && this.reportFilterComponent.searchForm && this.reportFilterComponent.searchForm.value?
		this.reportFilterComponent.searchForm.value:{};
	}

    timeConversion(time) {
		return convertDateTimeForRetrieving(this.storageData, new Date(time));
	}
	
	genenetePDF(key) {
		if (this.reportFilterComponent.searchForm.value['in_house'] != 'in_house' && this.reportFilterComponent.searchForm.value['in_house'] != 'is_referral' && this.reportFilterComponent.searchForm.value['in_house'] != 'all') {
			this.toaster.error('Please select All/Referral/In-House and apply filter then proceed','Error');
			return;
		}
		if (this.reportFilterComponent.searchForm.value['start_date'] == null || this.reportFilterComponent.searchForm.value['end_date'] == null) {
			this.toaster.error('Date Range Field is Required','Error');
			return;
		}
		// Required to select practice location and clinics before exporting CSVs
		// if(!this.reportFilterComponent.searchForm.value['facility_location_ids']?.length && (this.reportFilterComponent.searchForm.value['in_house'] == 'in_house' || this.reportFilterComponent.searchForm.value['in_house'] == 'all')) {
		// 	this.toaster.info('Practice-Location filter is required before exporting to PDF', 'Info');
		// 	return;
		// }
		// if(!this.reportFilterComponent.searchForm.value['clinic_location_ids']?.length && this.reportFilterComponent.searchForm.value['in_house'] == 'is_referral') {
		// 	this.toaster.info('Clinic filter is required before exporting to PDF', 'Info');
		// 	return;
		// }
		this.socket.emit('REPORTSUSER',{user_id:this.storageData.getUserId()});
		if(key === 'summary'){
			const ngbModalOptions: NgbModalOptions = {
				backdrop: 'static',
				keyboard: false,
				windowClass: 'modal_extraDOc body-scroll history-modal',
				modalDialogClass: 'modal-lg modal-report' 
			};
			let modelRef = this.modalService.open(StatusPopupComponent,ngbModalOptions);
			modelRef.componentInstance.key = this.valueToPass;
			modelRef.componentInstance.optionSelected.subscribe((selectedOption: string) => {
			this.valueFromPopup=selectedOption;
			modelRef.close();
			// Check if there is only one key in the object
				if(Object.keys(this.valueFromPopup).length === 1){
					  modelRef.result.then(() => {				  
						  let filterParams = removeEmptyAndNullsFormObject(this.reportFilterComponent.searchForm.value);
						  filterParams['start_date'] = changeDateFormat( filterParams['start_date'] );
						  // Create a copy of the filterParams object
						  let params = {
							...filterParams,
							value_from_popup: this.valueFromPopup[Object.keys(this.valueFromPopup)[0]]
						  };
						// Call the function with the updated params object
						  this.getSummaryReportListingFunction(key,params)
	
						}, (reason) => {
						  // Handle the dismiss reason if needed
						});
				}
				else{
				  for (const i of Object.keys(this.valueFromPopup)) {
					  modelRef.result.then(() => {
						  let filterParams = removeEmptyAndNullsFormObject(this.reportFilterComponent.searchForm.value);
						  filterParams['start_date'] = changeDateFormat( filterParams['start_date'] );
						  // If only one value is selected, proceed with it
						  let params = {
							  ...filterParams,
							  value_from_popup: this.valueFromPopup[i]
							 }
						  // Call the function for each params object		 
						  this.getSummaryReportListingFunction(key,params)
						}, (reason) => {
						  // Handle the dismiss reason if needed
						});
				  }
	
				}
			  });
		}else if (key === 'status'){
			let filterParams = removeEmptyAndNullsFormObject(this.reportFilterComponent.searchForm.value);
			filterParams['start_date'] = changeDateFormat( filterParams['start_date'] );
			let params = {
				...filterParams,
			};
			this.getSummaryReportListingFunction(key,params)
		}

		return;
	}

	getSummaryReportListingFunction(key,params){
		if (key=='summary'){
			this.reportService.getSummaryReportListingPDF(params)
			.pipe(
			take(1))
			.subscribe(res=>{
				this.loaderSpinnerProgressOnly =true;
				if (res?.status){
					this.toaster.success(res?.message, 'Success');
				}
		   },err=>{
			   });
		   }
		   else {
			this.reportService.getStatusReportListingPDF(params)
			.pipe(
				take(1))			
				.subscribe
			(res=>{
				this.loaderSpinnerProgressOnly =true;
				if (res?.status){
					this.toaster.success(res?.message, 'Success');
				}
		   },err=>{
				   if(err?.error?.message) {
						this.toaster.error(err?.error?.message, 'Error');
					}
					else {
						this.toaster.error(err?.error?.error?.message, 'Error');
					}
			   });
		   }
	}

	getAppointmentStatusReport(params){
		this.loadSpin=true;
		let param = removeEmptyAndNullsArraysFormObject(params);
		this.reportService.getAppointmentStatusReportListing(param).subscribe(res=>{
			this.reportFilterComponent.loadSpin= false;
			this.loadSpin=false;
			if (res && res.result && res.result.data && res.result.data.docs){
			this.appointmentStatusReport = res['result']['data']['docs'];
			this.page.totalElements = res['result']['data'].total;
			}
			else {
				this.loadSpin=false;
				this.appointmentStatusReport = [];
				this.page.totalElements=0;
				this.page.pageNumber=1;
			}
		},error=>{
			this.loadSpin=false;
			this.reportFilterComponent.loadSpin= false;
		});
	} 

	reportFilter(params) {

		this.filterFormDataValue = params;
		this.page.pageNumber=1;
		params = { 
			page:this.page.pageNumber, 
			per_page:this.page.size, 
			paginate : true,
	    	...params	
 	 }
	  	if (this.filterFormDataValue && (this.filterFormDataValue['start_date'] ==null  || this.filterFormDataValue['end_date'] ==null )) {
			this.reportFilterComponent.loadSpin= false;
			this.toaster.error('Date Range Field is Required','Error');
			return false;
		}

	  this.getAppointmentStatusReport(params);
	}

	resetFilter(params){
		this.page.pageNumber=1;
		this.filterFormDataValue = params;
	 params = { 
			page:this.page.pageNumber, 
			per_page:this.page.size, 
			paginate : true,
			...params
		  }
		  this.getAppointmentStatusReport(params);
	}

	keyToPass(key){
		this.valueToPass = key;
	}
	
	onPageChange(number){
		this.page.pageNumber = number + 1;
		let params = { 
			page:this.page.pageNumber, 
			per_page:this.page.size, 
			paginate : true,
			...this.filterFormDataValue	
 	 	}

		
	  this.getAppointmentStatusReport(removeEmptyAndNullsFormObject(params));
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
			this.localStorage.setObject('appointmentStatusReportsTableList' + this.storageData.getUserId(), data);
		}
		let groupByHeaderCol = getIdsFromArray(this.modalCols, 'header'); // pick header
		this.columns.sort(function (a, b) {
			return groupByHeaderCol.indexOf(a.name) - groupByHeaderCol.indexOf(b.name);
		});
		this.alphabeticColumns.forEach(element => {
			let currentColumnIndex = findIndexInData(this.columns, 'name', element.name)
			if (currentColumnIndex != -1) {
				this.columns[currentColumnIndex]['checked'] = element.checked;
				this.columns = [...this.columns];
			}
		});
		let columnsBody = makeDeepCopyArray(this.columns);
		this.appointmentStatusListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.appointmentStatusListTable._internalColumns.sort(function (a, b) {
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

	entryCountSelection($event){

		let params = { 
			per_page:+$event, 
			paginate : true,
			page:1,
			...this.filterFormDataValue	
 	 	}
		  this.page.size= +$event;
		  this.page.pageNumber=1;
		  this.loadSpin=true;
	  this.getAppointmentStatusReport(removeEmptyAndNullsFormObject(params));
	}
	
	navigateTo(caseid)
	{
		if(this.aclService.hasPermission(this.userPermissions.patient_case_list_patient_summary_menu))
		{
			this.router.navigateByUrl(`/front-desk/cases/edit/${caseid}/patient/patient_summary`)
		}
		else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_case_info_menu))
		{
			this.router.navigateByUrl(`/front-desk/cases/edit/${caseid}/patient/case-info`)
		}
		else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_personal_information_menu))
		{
			if(this.aclService.hasPermission(this.userPermissions.patient_case_list_personal_information_personal_tab))
			{
				this.router.navigateByUrl(`/front-desk/cases/edit/${caseid}/patient/personal-information`)
			}
			else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_personal_information_basic_contact_tab))
			{
				this.router.navigateByUrl(`/front-desk/cases/edit/${caseid}/patient/personal-information/basic-contact`)	
			}
			else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_personal_information_form_filler_tab))
			{
				this.router.navigateByUrl(`/front-desk/cases/edit/${caseid}/patient/personal-information/form-filler`)
			}			
			else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_personal_information_emergency_contact_tab))
			{
				this.router.navigateByUrl(`/front-desk/cases/edit/${caseid}/patient/personal-information/emergency-contact`)	
			}
			else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_personal_information_gurantor_tab))
			{
				this.router.navigateByUrl(`/front-desk/cases/edit/${caseid}/patient/personal-information/guarantor`)	
			}
		}
		else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_referrals_menu))
		{
			this.router.navigateByUrl(`/front-desk/cases/edit/${caseid}/referrals`);
		}

		else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_menu))
		{
			if(this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_attorney_tab))
			{
				this.router.navigate(['edit',caseid,'case-insurance','attorney'],{ relativeTo: this.activatedRoute.parent.parent })
			}
			else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_insurance_tab))
			{
				this.router.navigate(['edit',caseid,'case-insurance','insurance'],{ relativeTo: this.activatedRoute.parent.parent })
			}
			else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_employer_tab))
			{
				this.router.navigate(['edit',caseid,'case-insurance','employer'],{ relativeTo: this.activatedRoute.parent.parent })
			}
			else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_accident_tab))
			{
				this.router.navigate(['edit',caseid,'case-insurance','accident'],{ relativeTo: this.activatedRoute.parent.parent })
			}
			else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_vehicle_tab))
			{
				this.router.navigate(['edit',caseid,'case-insurance','vehicle'],{ relativeTo: this.activatedRoute.parent.parent })
			}
			else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_household_tab))
			{
				this.router.navigate(['edit',caseid,'case-insurance','house-hold-info'],{ relativeTo: this.activatedRoute.parent.parent })
			}
			else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_medical_treatment_tab))
			{
				this.router.navigate(['edit',caseid,'case-insurance','medical-treatment'],{ relativeTo: this.activatedRoute.parent.parent })
			}
		}

		else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_injury_menu))
		{
			this.router.navigate(['edit',caseid,'injury'],{ relativeTo: this.activatedRoute.parent.parent })
		}
		else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_marketing_menu))
		{
			this.router.navigate(['edit',caseid,'marketing'],{ relativeTo: this.activatedRoute.parent.parent })
		}
		else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_docs_menu))
		{
			this.router.navigate(['edit',caseid,'document'],{ relativeTo: this.activatedRoute.parent.parent })
		}
		else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_scheduler_menu))
		{
			this.router.navigate(['edit',caseid,'scheduler'],{ relativeTo: this.activatedRoute.parent.parent })
		}
		else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_visits_menu))
		{
			this.router.navigate(['edit',caseid,'visits'],{ relativeTo: this.activatedRoute.parent.parent })	
		}
		else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_billing_menu))
		{
			this.router.navigate(['edit',caseid,'billing'],{ relativeTo: this.activatedRoute.parent.parent })
		}			
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


	ngOnDestroy(): void {
		this.subcription.forEach(sub=>{
			sub.unsubscribe();
		})
	}
	
}
