import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, Input, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { CaseFlowUrlsEnum } from "@appDir/front-desk/fd_shared/models/CaseFlowUrlsEnum";
import { Page } from "@appDir/front-desk/models/page";
import { PermissionComponent } from "@appDir/front-desk/permission.abstract.component";
import { REQUEST_SERVERS } from "@appDir/request-servers.enum";
import { DynamicFormComponent } from "@appDir/shared/dynamic-form/components/dynamic-form/dynamic-form.component";
import { ButtonTypes } from "@appDir/shared/dynamic-form/constants/ButtonTypes.enum";
import { InputTypes } from "@appDir/shared/dynamic-form/constants/InputTypes.enum";
import { ButtonClass } from "@appDir/shared/dynamic-form/models/ButtonClass.class";
import { DivClass } from "@appDir/shared/dynamic-form/models/DivClass.class";
import { FieldConfig } from "@appDir/shared/dynamic-form/models/fieldConfig.model";
import { InputClass } from "@appDir/shared/dynamic-form/models/InputClass.class";
import { AclService } from "@appDir/shared/services/acl.service";
import { DatePipeFormatService } from "@appDir/shared/services/datePipe-format.service";
import { RequestService } from "@appDir/shared/services/request.service";
import { isEmptyObject, isObjectEmpty, removeEmptyAndNullsFormObject } from "@appDir/shared/utils/utils.helpers";
import { ToastrService } from "ngx-toastr";
import { Location } from '@angular/common';
import { getFieldControlByName } from "@appDir/shared/dynamic-form/helper";
import { CustomDiallogService } from "@appDir/shared/services/custom-dialog.service";
import { SelectionModel } from "@angular/cdk/collections";
import { OrderEnum } from "@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class";
import { PatientListingUrlsEnum } from "@appDir/front-desk/patient/patient-listing/PatientListing-Urls-Enum";
import { SoftPatientService } from '../../services/soft-patient-service';

@Component({
	selector: 'app-soft-patient-profile-componet',
	templateUrl: './soft-patient-profile.component.html',
	styleUrls: ['./soft-patient-profile.component.scss']
  })
  export class SoftPatientProfileComponent extends PermissionComponent  implements OnInit,OnDestroy {
	@ViewChild(DynamicFormComponent) component: DynamicFormComponent;
	
	patient: any = {};
	patientAddress: any;
	@Input()patientId:number;
	page: Page;
	form: FormGroup;
	fieldConfig: FieldConfig[] = [];
	isCollapsed = false;
	loadSpin = false;
	public params = null;
	cases :[]=[];
	filterFormDisabled:boolean = false;
	selection = new SelectionModel<Element>(true, []);

	constructor(public datePipeService: DatePipeFormatService,
		aclService: AclService,	titleService: Title,
		protected requestService: RequestService,
		router: Router,	private route: ActivatedRoute,
		private location: Location,		private toastrService: ToastrService,
		public customDiallogService: CustomDiallogService,
		private fb: FormBuilder,
		public activeModel: NgbActiveModal,
		public softPatientService:SoftPatientService,
		public modalService:NgbModal
		)
	{
		super(aclService, router, route, requestService, titleService);
		this.page = new Page();
		this.page.pageNumber = 0;
		this.page.size = 10;
		this.form = this.fb.group({
			id: '',
			case_type: '',
			attorney_name: '',
			insurance_name: '',
			date_of_accident: '',
			claim_no: '',
		});
	}
	ngOnInit() {
		this.setConfigration();
		this.getPatient(this.patientId);
		this.setPage({ offset: 0 });
	}
	ngAfterViewInit() {
		// this.form = this.component.form;
	}
	ngOnDestroy(): void {
		
	}

	setConfigration() {
		this.fieldConfig = [
			new DivClass([
				new DivClass([
					new DivClass([
						new InputClass('Case No.', 'id', InputTypes.text, '', [], '', ['col-sm-6 col-md-4 col-lg-3 col-xl-2']),
						new InputClass('Case type', 'case_type', InputTypes.text, '', [], '', ['col-sm-6 col-md-4 col-lg-3 col-xl-2']),
						new InputClass('Attorney', 'attorney_name', InputTypes.text, '', [], '', ['col-sm-6 col-md-4 col-lg-3 col-xl-2']),
						new InputClass('Insurance', 'insurance_name', InputTypes.text, '', [], '', ['col-sm-6 col-md-4 col-lg-3 col-xl-2']),
						new InputClass('DOA (mm/dd/yyyy)', 'date_of_accident', InputTypes.date, '', [], '', ['col-sm-6 col-md-4 col-lg-3 col-xl-2'], { max: new Date() }),
						new InputClass('Claim No.', 'claim_no', InputTypes.text, '', [], '', ['col-sm-6 col-md-4 col-lg-3 col-xl-2']),

					], ['row']),
				], ['col-lg-12 col-xl-10']),
				new DivClass([
					new DivClass([
						new ButtonClass('Filter', ['btn', 'btn-success w-100 float-right'], ButtonTypes.submit, null, { button_classes: ['col-5 col-sm-3 col-lg-2 col-xl-6'] }),
						new ButtonClass('Reset', ['btn', 'btn-primary w-100'], ButtonTypes.button, this.reset.bind(this), { button_classes: ['col-5 col-sm-3 col-lg-2 col-xl-6'],disabled:this.filterFormDisabled,name:'resetBtn'}),
					], ['row', 'justify-content-center mb-3 mb-xl-0'], '', '', { name: 'button-div' }),
				], ['col-lg-12 col-xl-2']),
			], ['row', 'dynamic-filter']),
		]
	}

	onReady(event: FormGroup) {
		this.form = event;
		// this.form.patchValue(this.params);
	}

	getPatient(id: number) {
		let queryParams = {
			filter: true,
			per_page: this.page.size,
			page: 1,
			pagination: 1,
			order_by: OrderEnum.DEC,
			id: this.patientId
		};
		this.requestService.sendRequest(PatientListingUrlsEnum.Patient_Get, 'get', REQUEST_SERVERS.kios_api_path, queryParams).subscribe(res => {
			// this.showPharmacyOfPatient(res['result']['data'][0]);
			this.patient = res['result'] && res['result']['data'] ? res['result']['data'][0] : {}
			this.patientAddress = this.patient && this.patient.self && this.patient.self.contact_information ? this.patient.self.contact_information.mail_address : {}
			// this.contactPerson = this.patient && this.patient.emergency ? this.patient.emergency : {}
			// this.patientdata = this.patient && this.patient.self && this.patient.self.contact_information ? this.patient.self.contact_information : {}
			// this.relationship = this.patient && this.patient.emergency && this.patient.emergency.contact_person_relation && this.patient.emergency.contact_person_relation.name ? this.patient.emergency.contact_person_relation.name : ''
		})
	}

	/**
	 * get patient case data
	 * Populate the table with new data based on the page number
	 * @param pageInfo 
	 */
	 setPage(pageInfo) {

		this.loadSpin = true;
		let formData = this.form.getRawValue();
		this.page.pageNumber = pageInfo.offset;
		let pageNumber = this.page.pageNumber + 1;
		// formData.date_of_accident = formData.date_of_accident ? getDate(formData.date_of_accident) : '';
		let filters = removeEmptyAndNullsFormObject(formData);
		let queryParams = {
			filter: !isObjectEmpty(filters),
			pagination: 1,
			page: pageNumber,
			per_page: this.page.size,
			order_by: 'DESC',
			patient_id: this.patientId,
			all_listing:true

		};
		let requestData = { ...queryParams, ...filters };
		let per_page = this.page.size;
		let queryparam = { per_page, page: pageNumber }
		this.addUrlQueryParams({ ...filters, ...queryparam });
		this.requestService.sendRequest(CaseFlowUrlsEnum.GetCaseList, 'get', REQUEST_SERVERS.kios_api_path, requestData).subscribe(res => {
			if (res['status'] == 200) {
				this.cases=[];
				this.cases = res['result'].data;
				this.page.totalElements = res['result'].total;
				this.page.totalPages = this.page.totalElements / this.page.size;
				this.loadSpin = false;
			}
		},
			(err) => {
				this.toastrService.error(err.error, 'Error');
				this.loadSpin = false;
			},
		);
	}

	addUrlQueryParams(params?) {
		this.location.replaceState(
			this.router.createUrlTree([], { queryParams: params, }).toString()
		);
	}

	reset() {
		this.resetFilters();
		this.addUrlQueryParams();
		this.setPage({ offset: 0 });

	}

	resetFilters() {
		this.isCollapsed = false;
		this.form.patchValue({
			id: '',
			case_type: '',
			attorney_name: '',
			insurance_name: '',
			date_of_accident: '',
			claim_no: '',
		});
	}

	addNewSoftCase() {
		if(this.softPatientService.addSoftPatientProviderCalandar){
			this.softPatientService.addSoftPatientProviderCalandar = false;
			this.softPatientService.pushCaseInfoTab(this.patientId);
			this.activeModel.close()
			return;
		}
		this.router.navigate( ['/front-desk','soft-patient','list','edit',this.patientId], { queryParams: { caseId: null,appointmentId: null, softCase: true , is_soft_registered: false} });
		this.activeModel.close()
		// this.router.navigate(['/front-desk/cases/create/' + this.patientId])
	}

	addNewVarifiedCase() {
		if(this.softPatientService.addSoftPatientProviderCalandar){
			this.softPatientService.addSoftPatientProviderCalandar = false;
			// this.softPatientService.pushCaseInfoTab(this.patientId);
			this.router.navigate(['/front-desk/cases/create/' + this.patientId]);
			// this.activeModel.close()
			if(this.modalService.hasOpenModals())
			{
				this.modalService.dismissAll();
			}
			return;
		}
		else
		{
			this.router.navigate(['/front-desk/cases/create/' + this.patientId]);
			this.activeModel.close()
		}

		
	}
	pageLimit($num) {
		this.page.size = Number($num);
		this.setPage({ offset: 0 });
	}

	onValueChanges(form) {
		if(!isEmptyObject(form)) {
			this.filterFormDisabled = false;
		} else {
			this.filterFormDisabled = true;
		}
		let ResetButtonControl =  getFieldControlByName(this.fieldConfig, 'resetBtn');
		ResetButtonControl ? ResetButtonControl.configs.disabled = this.filterFormDisabled : null;
	}
	confirmDel(id?: number) {
		
		debugger;

		this.customDiallogService
		.confirm('Delete Case', 'Do you really want to delete these Case?')
		.then((confirmed) => {
			debugger;
			if (confirmed) {
				// this.deleteSelected(id);
			}
		})
		.catch();
		
	}

	onPageChange(number) {

		this.page.pageNumber = number
		this.setPage({ offset: this.page.pageNumber })
	}
	goToCaseDetail(row) {
		debugger;

		if(this.softPatientService.addSoftPatientProviderCalandar)
			{
				this.activeModel.close();
				this.softPatientService.closeSoftPatinetPopUpProviderCalender.next({caseId:row.id});
				// this.softPatientService.closeSoftPatinetPopUpProviderCalender.complete();
				return;

			}

		if(row.is_active)
		{
			// if(this.softPatientService.addSoftPatientProviderCalandar)
			// {
			// 	this.activeModel.close();
			// 	this.softPatientService.closeSoftPatinetPopUpProviderCalender.next({caseId:row.id});
			// 	this.softPatientService.closeSoftPatinetPopUpProviderCalender.complete();
			// 	return;

			// }
			// else
			// {
				this.router.navigate([`front-desk/cases/edit/${row.id}/patient/case-info`]);
			// }
			

		}
		else
		{
			// if(this.softPatientService.addSoftPatientProviderCalandar)
			// {
			// 	this.activeModel.close();
			// 	this.softPatientService.closeSoftPatinetPopUpProviderCalender.next({caseId:row.id});
			// 	this.softPatientService.closeSoftPatinetPopUpProviderCalender.complete();
			// 	return;

			// }
			this.router.navigate(['front-desk/soft-patient/list'], {queryParams:{pagination: true,page:1,per_page:10,filter:true,order_by:'DESC',case_id:row.id,id:row.patient_id} }) 
			// this.router.navigate( ['/front-desk','soft-patient','list','edit',row.patient_id], { queryParams: { caseId: null,appointmentId: null } });

		}
		this.activeModel.close();
		// if(this.softPatientService.addSoftPatientProviderCalandar)
		// {
		// 	this.modalService.dismissAll();
		// }
		

	}

	getRowClass = (row) => { 
		
		return {
		  'row-color-verified': row.is_active ==true,
		  'row-color-non-verified': row.is_active == false,
		};
	   }

	   actionClassBind(data: any): string{
		console.log(data)
		if(data.is_active){

			return 'fa fa-check text-success'

		}else{

			return 'fa fa-exclamation-triangle text-danger'

		}

	}

	masterToggle(event) {
		this.isAllSelected()
			? this.selection.clear()
			: this.cases.forEach((row) => this.selection.select(row));
	}
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.cases.length;
		return numSelected === numRows;
	}

	// editCaseStatus(caseStatusModal,row){
	// 	debugger;
	// 	this.currentCase = row; 
	// 	this.caseUpdateForm.patchValue({
	// 		status_id:  null
	// 	});
	// 	const ngbModalOptions: NgbModalOptions = {
	// 		backdrop: 'static',
	// 		keyboard: false,
	// 		windowClass: 'overflow_unset',
	// 	};
	// 	this.modalService.open(caseStatusModal, ngbModalOptions);
		

	// }

	
  }
