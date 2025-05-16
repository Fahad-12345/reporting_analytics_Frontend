import { SearchedKeysModel } from './../../../../shared/ng-select-shareable/ng-select-shareable.component';
import { ShareAbleFilter } from '@appDir/shared/models/share-able-filter';
import { EnumApiPath } from '@appDir/front-desk/billing/Models/searchedKeys-modal';
import { Subject } from 'rxjs';
import { MatCheckbox } from '@angular/material/checkbox';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import {
	ChangeDetectorRef,
	Component,
	Input,
	OnDestroy,
	OnInit,
	ViewChild,
	ViewChildren, QueryList,
} from '@angular/core';
import {
	FormBuilder,
	FormGroup,
	Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { MultiSelectComponent } from 'ng-multiselect-dropdown';
import { ToastrService } from 'ngx-toastr';

import {
	CaseFlowServiceService,
} from '@appDir/front-desk/fd_shared/services/case-flow-service.service';
import {
	BillingRecipientUrlsEnum,
} from '@appDir/front-desk/masters/billing/billing-master/Billing-Recipient.Enum';
import {
	ModifiersUrlsEnum,
} from '@appDir/front-desk/masters/billing/billing-master/Modifiers-Urls-Enum';
import { CodesUrl } from '@appDir/front-desk/masters/billing/codes/codes-url.enum';
import { Page } from '@appDir/front-desk/models/page';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { changeDateFormat } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import {
	OrderEnum,
	ParamQuery,
} from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { RequestService } from '@appDir/shared/services/request.service';
import {
	NgbModal,
	NgbModalOptions,
	NgbModalRef,
} from '@ng-bootstrap/ng-bootstrap';

import { BillingEnum, bill_format_enum, ch_billing_typs_enum } from '../../billing-enum';
import {
	CreateBillModel,
	FeeScedule,
	FeeScheduleCalculatedData,
} from '../../billingVisitDeskModel';
import { BillingService } from '../../service/billing.service';
import { IMatAutoCompleteSpinnerShowIntellicense, MatAutoCompleteSpinnerShowIntellicenseModal } from '@appDir/shared/components/mat-autocomplete/modal/mat-autocomplete.modal';
import { isArray, makeDeepCopyArray, makeDeepCopyObject, makeSingleNameFormFIrstMiddleAndLastNames, removeDuplicatesObject, removeEmptyAndNullsFormObject, unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';
import { BillReciptent } from './models/bill-reciptent.model';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { MriEnum } from '../../mri-enum';
import { CaseTypeEnum } from '@appDir/front-desk/fd_shared/models/CaseTypeEnums';
import { InvoiceBillEnum } from '@appDir/invoice/shared/invoice-bill-enum';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
	selector: 'app-create-bill-modal',
	templateUrl: './create-bill-modal.component.html',
	styleUrls: ['./create-bill-modal.component.scss'],
})
export class CreateBillModalComponent extends PermissionComponent implements OnInit, OnDestroy {

	selected_case_type_slug: any;
	@ViewChildren('formatCheckBox') formatCheckBox: QueryList<MatCheckbox>;
	selectedFormats : any[] = [];
	icdPage:Page = new Page();
	searchValue = '';
	showSpinnerIntellicense:IMatAutoCompleteSpinnerShowIntellicense = new MatAutoCompleteSpinnerShowIntellicenseModal();
	@Input() searchedKeys = new SearchedKeysModel();
	maxBillDate: Date = new Date();
	visit_sessions:any[] = [];
	constructor(
		private caseFlowService: CaseFlowServiceService,
		private route: ActivatedRoute,
		protected requestService: RequestService,
		private modalService: NgbModal,
		private fb: FormBuilder,
		private toastrService: ToastrService,
		private billingService: BillingService,
		private cdRef: ChangeDetectorRef,
		public commonService:DatePipeFormatService,
		private customDiallogService: CustomDiallogService,
	) {
		super();
		this.getFormatedDocuments();	
	}
	page: Page = new Page();
	billinDetailpage: Page = new Page();
	@Input() visitList: CreateBillModel[];
	@Input() modalRef: any;
	@Input() caseId: any;
	@Input() isBillingDetail: boolean;
	@Input() editBill: boolean;
	@Input() billDetail: any;
	@Input() facility_location_id: number;
	attorney_firm:string;
	firm_id :any;
	selectedCpt = [];
	todayDate: any;
	patient: BillReciptent = new BillReciptent();
	lawer:  BillReciptent = new BillReciptent();
	employer:  BillReciptent[] =[];
	speciality: any;
	modalReference: NgbModalRef;
	cptmodalRef: NgbModalRef;
	public createbillForm: FormGroup;
	addCptForm: FormGroup;
	lstRecip: Array<any> = [];
	eBilllstRecip: Array<any> = [];
	dropdownSettings = {};
	eBilldropdownSettings = {};
	ispatient: boolean = false;
	isEmployer: boolean = false;
	isInsurance: boolean = false;
	isLawyer: boolean = false;
	insurances: BillReciptent[] = [];
	electronice_insurances = [];
	eBill = false;
	e_insrurance = null;
	case_type_slug : string = '';
	cptnames: any;
	visits:any=[]
	lstCptorModifiers: any = [];
	lstICDcodes: any = [];
	cptOrmodifier: any;
	visitTotalRows:number;
	selection = new SelectionModel<Element>(true, []);
	singleRecord: any = [];
	icdButtons: any;
	billID: number;
	totalAmount:number =0;
	selectCpt:any={};
	patienDocument: any;
	employerDocument: any[] = [];
	InsuranceDocument: any[]=[];
	multipleInsuranceDocument: any = [];
	AttorneyDocument: any;
	billDeatils: any;
	formateData: any = [];
	filteredReciptsObject: any = [];
	billinsurances: BillReciptent[] = [];
	billemployer: BillReciptent[] = [];
	checkedformate: any[] = [];
	billingDetails: any[] = [];
	billingId: number;
	primaryInsurances: any;
	icdbuttons: any = [];
	icdButtonsVerifyList: any = [];
	disableButton: boolean = false;
	title: string = 'Create New Bill';
	// multiplefeerecords: any[] = []
	feeMessage: string = 'Kindly add fee Scheduler against ';
	selectedmultiplefeerecords: any[] = [];
	@ViewChild('recipt') recipt: MultiSelectComponent;
	@ViewChild('documenttable') documenttable: CreateBillModalComponent;
	@ViewChild('showMultipleCPTFeeScheduleModel')
	showMultipleCPTFeeScheduleModel: CreateBillModalComponent;
	billButtonTitle = 'Generate Bill';
	hideDuration = false;
	selectedVisits:any=[];
	selectMultipleCPTs = true;
	public allowed_case_type_slugs:string[]=['auto_insurance'];
	selectedBillTo:any[] = [];
	allSelectedBillToRecpitant:any[]=[];
	case_type:any;
	searchValueCpt: any;
	cptPage:Page = new Page();
	searchValuemodifier: any;
	modifierPage:Page = new Page();
	lastPageModifier = 1;
	EnumApiPath = EnumApiPath;
	eventsSubject: Subject<any> = new Subject<any>();
	requestServerpath = REQUEST_SERVERS;
	currentBillEmployer:BillReciptent[] =[]; 
	currentBillInsurance:BillReciptent[]= [];
	ngSelectedPatient: Subject<any> = new Subject<any>();
	ngSelectedEmployee: Subject<any> = new Subject<any>();
	ngSelectedInsurance: Subject<any> = new Subject<any>();
	ngSelectedLawyer: Subject<any> = new Subject<any>();
	dataMapingListing: any;
	primary_claim_no: any;
	selectedChildCpt:any={}
	primary_insurance_name: any;
	patientSelectedValue = [];
	insuranceSelectedValue:any[] = [];
	laywerSelectedValue = [];
	employerSelectedValue: any[] = [];
	selectedFormatsOfPatient: any[] = [];
	selectedFormatsOflawyer: any[] = [];
	selectedFormatsOfinsurance: any[] = [];
	selectedFormatsOfemployerr: any[] = [];
	ngOnInit() {
		this.isBillingDetail
			? (this.title = 'Billing ' + this.billDetail.label_id + ' Information')
			: this.editBill
			? (this.title = 'Update ' + ' Bill# ' + this.billDetail.label_id)
			: (this.title = 'Create New Bill');
			
		this.setCreateBillingform();
		this.getRecipient();
		this.dropdownSetting();
		this.eBilldropdownsetting();
		this.setDetails();
		this.setPagination();
		// this.setValuesIfDontExist()
		this.todayDate = new Date(); /* UN USED VARIABLE */
		this.billinsurances = [];
		this.billemployer = [];
		this.selectedBillTo = [];
		this.selectedFormats = [];
		if (this.isBillingDetail || this.editBill) {
			this.patchValuesInForm();
			this.billButtonTitle = 'Update Bill';
			if(this.billDetail?.bill_type == ch_billing_typs_enum.manual_bill){
				this.isBillingDetail || this.editBill? this.setTabs(this.billDetail['bill_recipients'],this.billDetail['kiosk_case']) : '';
				  let billInsurance:any[] = [] = this.billDetail?.kiosk_case?.case_insurance?.map((ins)=> {
					if(ins?.insurance_id !== null){
						return ins?.id
					}
				});
				let billEmployers:any[] =[] = this.billDetail?.kiosk_case?.case_employers?.map(emp=> emp?.id);
				this.selectMultipleCPTs =  this.billDetail['specialityVisitType'] && this.billDetail['specialityVisitType']['allow_multiple_cpt_codes'] ? this.billDetail['specialityVisitType']['allow_multiple_cpt_codes'] == 1 ? true:false :false;
				this.primary_claim_no = this.billDetail?.primary_claim_no;
				this.primary_insurance_name = this.billDetail?.primary_insurance_name;
				this.billDetail['bill_recipients'].forEach(bill=>{
					if (bill?.bill_recipient_type_id ===1){
						this.patient.document_type_ids= bill?.type_ids?.map(type=>{
							return type.document_type_id}
						);
					}
					if (bill.bill_recipient_type_id ===4){
						this.lawer.document_type_ids = bill?.type_ids?.map(type=>{
							return type?.document_type_id}
						);
	
					}
					
					  if (bill.bill_recipient_type_id ===3 && billInsurance.includes(bill?.case_relational_id)){
						let insIndex = this.insurances?.findIndex(ins=>ins?.id==bill?.case_relational_id);
						if (insIndex>-1 && this.insurances[insIndex].insurance_id == bill.bill_recipient_id){
							this.insurances[insIndex].checked=true;
							this.insurances[insIndex].document_type_ids = 
							bill?.type_ids?.map(type=>{
								return type?.document_type_id}
							);
							this.insurances[insIndex].document_type_with_object = this.setDocumentTypeWithObject(this.insurances[insIndex]?.document_type_ids, this.billDetail?.document_type_ids),
							this.insurances[insIndex].id
							
							this.billinsurances.push({
								id:bill?.bill_recipient_id,
								case_insurance_id:bill?.case_relational_id,
								document_type_ids: bill?.type_ids?.map(type=>{
									return type?.document_type_id
								}),
								document_type_with_object: this.setDocumentTypeWithObject(bill?.type_ids?.map(type=>{
									return type?.document_type_id}
									), this.billDetail?.document_type_ids),
									checked:true
								});
							}
						}
	
					   if (bill.bill_recipient_type_id ===2 && billEmployers?.includes(bill?.bill_recipient_id)){
						   let empIndex = this.employer?.findIndex(emp=>emp?.['pivot']?.id==bill?.case_relational_id);
						   this.billemployer?.push({id:bill?.bill_recipient_id,
							case_employer_id : bill?.case_relational_id,
							document_type_ids:bill?.type_ids?.map(type=>{
								return type?.document_type_id}
							),
							document_type_with_object: this.setDocumentTypeWithObject(bill?.type_ids?.map(type=>{
								return type?.document_type_id}
							), this.billDetail?.document_type_ids),
							checked:true
						});
						   if (empIndex>-1){
							   this.employer[empIndex].checked=true;
							   this.employer[empIndex].document_type_ids= bill?.type_ids?.map(type=>{
								return type?.document_type_id}
							);
							this.employer[empIndex].document_type_with_object = this.setDocumentTypeWithObject(this.employer[empIndex]?.document_type_ids, this.billDetail?.document_type_ids),
							   this.employer[empIndex].id=bill?.bill_recipient_id; 
						   }
					  }
	
					  this.selectedBillTo.push(
						{bill_recipient_type_id:bill?.bill_recipient_type_id});
				}
			);
			
			if(this.patient && this.patient.document_type_ids){
				this.patient.document_type_with_object = this.setDocumentTypeWithObject(this.patient?.document_type_ids, this.billDetail?.document_type_ids);
				this.selectedFormatsOfPatient = this.patient?.document_type_with_object;
			}
			if(this.lawer && this.lawer.document_type_ids){
				this.lawer.document_type_with_object = this.setDocumentTypeWithObject(this.lawer?.document_type_ids, this.billDetail?.document_type_ids);
				this.selectedFormatsOflawyer = this.lawer?.document_type_with_object;
			}
			if(this.insurances && this.insurances.length !=0 ){
			  this.insurances.forEach(ins => ins?.document_type_with_object?.forEach(t => {
				this.selectedFormatsOfinsurance = [...[t], ...this.selectedFormatsOfinsurance ];
			  }));
			}
			if(this.employer && this.employer.length !=0 ){
				 this.employer.forEach(ins => ins?.document_type_with_object?.forEach(t => {
					this.selectedFormatsOfemployerr = [...[t], ...this.selectedFormatsOfemployerr ];
				 }));
			}
			this.selectedFormats = [...this.selectedFormatsOfPatient, ...this.selectedFormatsOflawyer, ...this.selectedFormatsOfemployerr, ...this.selectedFormatsOfinsurance];
			}		
		} 
		else {
			let me = this;
			this.visitList.map(function (m, index) {
				me.calculateVisitAmount(index);
				me['isparentexpanded'] = false;
				m.icd_codes && m.icd_codes.length
					? m.icd_codes.map((x) => {
							x.name = `${x.name}-${x.description}`;
							me.lstICDcodes.push(x);
					  })
					: '';
			});
			this.calculateTotalAmout();
			this.lstICDcodes = removeDuplicatesObject(this.lstICDcodes, 'id');
			if (!this.lstICDcodes.length) {
				this.getICDcodes({ target: '' });
			}
			this.icdbuttons = this.lstICDcodes.map((m) => {
				return {
					id: m.id,
					name: makeSingleNameFormFIrstMiddleAndLastNames([m.name, m.description], '-'),
				};
			});
			this.icdButtonsVerifyList = this.lstICDcodes.map((m) => {
				return {
					id: m.id,
					name: makeSingleNameFormFIrstMiddleAndLastNames([m.name, m.description], '-'),
				};
			});
			this.dataMapingListing = this.visitList;
			Object.freeze(this.dataMapingListing);
			this.billingService.setBillListing(this.dataMapingListing);
			this.ifNullFeeScheduler();
			this.getLatestVisitDate();
			this.selectMultipleCPTs =  this.visitList.length && this.visitList[0] && this.visitList[0]['specialityVisitType'] && this.visitList[0]['specialityVisitType']['allow_multiple_cpt_codes'] ? this.visitList[0]['specialityVisitType']['allow_multiple_cpt_codes'] == 1 ? true:false :false;
		}
	}
	disableBillButton() {
		if(!this.ispatient && (((this.isEmployer && !this.employer.length) && 
		(this.isInsurance && !this.insurances.length) && 
		(this.isLawyer && !this.attorney_firm)) || 
		(this.isEmployer && !this.employer.length && !this.isInsurance && !this.isLawyer) || 
		(this.isInsurance && !this.insurances.length && !this.isEmployer && !this.isLawyer) || 
		(this.isLawyer && !this.attorney_firm && !this.isEmployer && !this.isInsurance) || 
		(this.isEmployer && !this.employer.length && this.isInsurance && !this.insurances.length && !this.isLawyer) || 
		(this.isEmployer && !this.employer.length && this.isLawyer && !this.attorney_firm && !this.isInsurance) || 
		(this.isInsurance && !this.insurances.length && this.isLawyer && !this.attorney_firm && !this.isEmployer))) {
			this.disableButton = true;
		}
		else {
			this.disableButton = false;
		}
	}

	getLatestVisitDate() {
		var date_array = this.visitList.map(date => new Date(date.visit_date));
		 this.todayDate = new Date(Math.max.apply(null, date_array));
	}

	// modifiersWithDetails() {
	// 	this.visitList.filter(function (item) {
	// 		if (item['cpt_fee_schedules'] && item['cpt_fee_schedules'].length) {
	// 			item['cpt_fee_schedules'].forEach(element => {
	// 				element.cpt_code['name'] = makeSingleNameFormFIrstMiddleAndLastNames([element.cpt_code['name'], element.cpt_code['description']], '-')
	// 				element.modifiers.forEach(x => {
	// 					x.name = makeSingleNameFormFIrstMiddleAndLastNames([x.name, x.description], '-')
	// 				});
	// 			})
	// 		}
	// 	})
	// }
	showTable: boolean = false;
	showCptTable: boolean = false;
	
	ngAfterViewInit() {
		this.showTable = true;
	}
	/**
	 * set pagination
	 */
	setPagination() {
		this.page.pageNumber = 1;
		this.page.size = 10;
		this.page.totalElements = this.visitList.length;
		this.billinDetailpage.pageNumber = 1;
		this.billinDetailpage.size = 10;
		this.billinDetailpage.totalElements = 0;
	}
	/**
	 * get formate of document list
	 */
	 getFormatedDocuments() {
		var paramQuery: ParamQuery = { filter: true, pagination: true , page:1 , per_page:10, order: OrderEnum.ASC } as any;
		this.searchedKeys.commonSearch.page = paramQuery.page;
	   this.requestService
			.sendRequest(BillingEnum.getDocumentFormate, 'get', REQUEST_SERVERS.fd_api_url, paramQuery)
			 
			.subscribe((res) => {
				this.formateData =  res['result']['data'];
				this.searchedKeys.commonSearch.lastPage = res['result']['last_page'];
				this.formateData.filter(function (item, index) {
					!item['check'] ? (item['check'] = false) : null;
				});
				let formatIndex=	this.formateData.findIndex((x) => x.slug==='c_4_3');


				if (this.editBill) {
					this.formateData.filter((m) => {
						this.billDetail.document_type_ids.includes(m.id)
							? (m['check'] = true)
							: (m['check'] = false);
					});
					if (this.billDetail && this.billDetail.visit_sessions && this.billDetail.visit_sessions.length!=0 && 
						this.billDetail.visit_sessions[0].appointment_type
						&& this.billDetail.visit_sessions[0].appointment_type.slug != 'fu_mmi'){
						formatIndex>-1?this.formateData.splice(formatIndex,1):false;
						}
				}
				else if( this.visitList && this.visitList.length!=0 && 
					this.visitList[0].appointment_type &&
					this.visitList[0].appointment_type['slug'] !='fu_mmi' && formatIndex>-1){
				   this.formateData.splice(formatIndex,1);
			   }
			});
	}
	/**
	 * set general details
	 */
	setDetails() {
		if (this.visitList[0]) {
			this.patient =
				this.visitList[0]['kiosk_case'] && this.visitList[0]['kiosk_case']['patient']
					? this.visitList[0]['kiosk_case']['patient']
					: null;
					
			this.speciality = this.visitList[0]['speciality_id'];
			this.case_type=this.visitList[0]['kiosk_case']&&this.visitList[0]['kiosk_case']['case_types'];
			this.case_type_slug = this.case_type?.slug;
			if (this.visitList[0]['kiosk_case']['case_attorneys'][0]){
			this.lawer = this.visitList[0]['kiosk_case']['case_attorneys'][0];
			}
			this.electronice_insurances = this.visitList[0]?.kiosk_case?. case_insurance?.filter(insurance => (insurance?.payer && insurance?.payer_id));
			this.electronice_insurances.forEach(obj =>{
				if((obj?.payer_id == this.billDetail?.payer_id) || (this.electronice_insurances.length == 1)){
					this.e_insrurance ={...obj};
					obj['checked_radio'] = true;
				}else{
					obj['checked_radio'] = false;
				}
			});
			this.eBill = this.electronice_insurances.length > 0 ? true : false;
			this.employer = this.visitList[0]['kiosk_case']['case_employers'];
			this.insurances = this.visitList[0]['kiosk_case']['case_insurance'].filter(inusr => inusr?.insurance);
			this.primaryInsurances = this.visitList[0]?.kiosk_case?.case_insurance?.filter(
				(m) => m?.type == 'primary',
			)[0];
			this.attorney_firm = (this.editBill && this.billDetail && this.billDetail['firm_name']) ? this.billDetail['firm_name'] : (this.visitList[0] && this.visitList[0]['firm_name']) ? this.visitList[0]['firm_name']  : (this.billDetail && this.billDetail['firm_name']) ?  this.billDetail['firm_name'] : '';
			this.firm_id =(this.editBill && this.billDetail && this.billDetail['firm_id']) ? this.billDetail['firm_id'] : (this.visitList[0] && this.visitList[0]['firm_id']) ? this.visitList[0]['firm_id']  : (this.billDetail && this.billDetail['firm_id']) ?  this.billDetail['firm_id'] : '';
		}
	}
	/**
	 * set CPT or Modifier form
	 */
	setForm() {
		this.addCptForm = this.fb.group({
			id: '',
			name: [],
		});
	}
	/**
	 * patch values in case of Edit
	 */

	patchValuesInForm() {
		this.billingId = this.billDetail.id;
		this.lstICDcodes = this.billDetail.icd_codes.map((m) => {
			return {
				id: m.id,
				name: makeSingleNameFormFIrstMiddleAndLastNames([m.name, m.description], '-'),
			};
		});
		this.icdButtonsVerifyList = this.billDetail.icd_codes && this.billDetail.icd_codes.map((m) => {
			return {
				id: m.id,
				name: makeSingleNameFormFIrstMiddleAndLastNames([m.name, m.description], '-'),
			};
		});
		this.getLatestVisitDate();
		this.createbillForm.patchValue({
			bill_date: this.billDetail.bill_date,
			speciality_id: this.speciality,
			case_id: this.caseId,
			icd_code_ids: '',
			document_type_ids: [''],
			bill_type : String(this.billDetail?.bill_type)
		});
		this.icdbuttons = this.billDetail.icd_codes ? this.billDetail.icd_codes : [];
		this.calculateTotalAmout();
		// this.checkedformate = this.billDetail.document_type_ids.map(types=> types.id);
		this.selectedFormats =  this.billDetail.document_type_ids;
		this.billID = this.billDetail.id;
	}
	/**
	 * set values if don't exist
	 */
	// setValuesIfDontExist() {
	// 	this.visitList.filter(function (item, index) { !item['visit_charges'] ? item['visit_charges'] = 0 : null })
	// }
	rowindex: any;
	rowModindex: any;
	mainrow:any
	/**
	 * open model for Modifiers or Cpt codes
	 * @param model
	 * @param data
	 * @param type
	 */
	addModal(model, data, type, mainrowIndex?, modIndex?, mainrow?) {
		if(isArray(data && data['specialityVisitType'])){
			this.selectMultipleCPTs =  data && data['specialityVisitType'].length && data['specialityVisitType'][mainrowIndex] &&  data['specialityVisitType'][mainrowIndex]['allow_multiple_cpt_codes'] == 0 ? false:true;
		}else{
			this.selectMultipleCPTs =  data && data['specialityVisitType'] &&  data['specialityVisitType']['allow_multiple_cpt_codes'] == 0 ? false:true;
		}
		this.isdisable = false;
		this.rowindex = mainrowIndex;
		this.lstCptorModifiers = [];
		this.rowModindex = modIndex;
		this.mainrow = data
		this.modifiersData = data['modifiers'] ? makeDeepCopyObject(data['modifiers']) : [];
		type == 'cptcodes' ? (this.cptOrmodifier = 'CPT Codes') : (this.cptOrmodifier = 'Modifiers');
		type == 'cptcodes' ? (this.singleRecord = data) : (this.singleRecord = mainrow);
		let ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc',
		};
		this.setForm();
		this.lstCptorModifiers = this.modifiersData;
		this.addCptForm.patchValue({ name: this.modifiersData });
		this.cptmodalRef = this.modalService.open(model, ngbModalOptions);
	}
	isVisitAllSelected(){
		this.visitTotalRows = this.visits.length;
		const numSelected = this.selection.selected.length;
		const numRows = this.visitTotalRows;
		return numSelected === numRows
	}

	visitMasterToggle(event): void {
		this.isVisitAllSelected()
			? this.selection.clear()
			: this.visits
					.slice(0, this.visitTotalRows)
					.forEach((row) => this.selection.select(row));
	}

	addSelectedVisits(){
		this.selectedVisits=this.selection?.selected;
  		this.visitList = [...this.visitList, ...this.selectedVisits];
		const allIcds = this.visitList.flatMap((visit:any) => {
			if (visit?.newVisit) {
			  return visit?.icd_codes;
			}
			return [];
		  });
		  this.icdbuttons=[...this.icdbuttons,...allIcds];
		  this.icdbuttons=removeDuplicatesObject(this.icdbuttons, 'id');
		if (this.selectedVisits?.length > 0) {
      const visitSessions = this.selectedVisits.map((visit) => ({
        id: visit?.id,
        case_type_id: visit?.kiosk_case?.case_type_id,
        visit_type_id: visit?.appointment_type_id,
        provider_id: visit?.doctor_id,
        speciality_id: visit?.speciality_id,
        facility_location_id: visit?.facility_location?.id,
        region_id: visit?.facility_location?.region_id,
        place_of_service_id: visit?.facility_location?.place_of_service_id,
        cpt_code_ids: visit?.cpt_codes?.map((cpt) => cpt?.id),
      }));
	  this.getFeeScheduler({visit_sessions:visitSessions,add_new_visit:true});
    }	
}
	getVisits(moreVisit,visits) {
		this.startLoader=true
		let paramQuery:any={};
		paramQuery['case_id']=this.caseId?this.caseId:null;
		paramQuery['doctor_id']=this.visitList[0]?.doctor_id;
		paramQuery['facility_location_id']=this.visitList[0]?.facility_location_id;
		paramQuery['speciality_id']=this.visitList[0]?.speciality_id;
		paramQuery['old_visit_session_ids']=visits.length>0?visits.map(visit=>visit.id):[];
		paramQuery['bill_id']=this.billID;
		this.subscription.push(
			this.requestService
			.sendRequest(
				InvoiceBillEnum.Bill_Visit,
				'POST',
				REQUEST_SERVERS.fd_api_url,
				paramQuery,
			).subscribe(res=>{
				if(res.status){
					this.visits=res?.result?.data?.data || [];
					this.startLoader=false;
					const ngbModalOptions: NgbModalOptions = {
						backdrop: 'static',
						keyboard: false,
						windowClass: 'modal-xxl modal_extraDOc body-scroll',
						modalDialogClass: 'modal-xl'
					};
					this.modalService.open(moreVisit, ngbModalOptions);
				}else{
					this.startLoader=false;
				}

			},
			(err=>
				this.startLoader=false
				))
		)
	}


	/**
	 * get cpt codes
	 * @param event
	 */
	getCptCodes(event, data , searchType , page=1 ) {
		debugger;
		let value = event;
		if(searchType === 'search'){
			this.lstCptorModifiers = [];
			this.cptPage.pageNumber = 1;
			this.searchValueCpt = value; 
		}
		let cptids=[]
		if(this.visitList[this.rowindex]['cpt_fee_schedules']?.length){
			cptids = this.visitList[this.rowindex]['cpt_fee_schedules'].map(
				(item:any) => item.cpt_code?.id,
			);
		}
			
			var paramQuery: ParamQuery = {
				filter: true,
				pagination: true,
				order: OrderEnum.ASC,
				// order_by: 'name',
				code_type_id: 2,
				type: 'CPT',
				name: this.searchValueCpt,
				page:page,
				per_page: 10
			} as any;
			this.showSpinnerIntellicense.cpt_codes = true;
			this.subscription.push(this.requestService
				.sendRequest(CodesUrl.CODES_SINGLE_GET, 'get', REQUEST_SERVERS.fd_api_url, paramQuery)
				.subscribe((res) => {
					if(searchType === 'search'){
						this.lstCptorModifiers = [];
						this.cptPage.pageNumber = 1;
						this.searchValueCpt = value; 
					}
					let result;
					result = res['result']['data'].filter((m) => !cptids.includes(m.id));
					result = result
						? result.map((m) => {
								return {
									id: m.id,
									name: makeSingleNameFormFIrstMiddleAndLastNames([m.name, m.description], '-'),
								};
						  })
						: [];
						this.showSpinnerIntellicense.cpt_codes = false;
						this.lstCptorModifiers = [...this.lstCptorModifiers, ...result];
				}));
	}
	/**
	 * get Modifiers
	 * @param event
	 */
	getModifiers(value,data, searchType, page=1) {
		debugger;
		if(searchType === 'search'){
			this.lstCptorModifiers = [];
			this.modifierPage.pageNumber = 1;
			this.searchValuemodifier = value; 
		}
			var paramQuery: ParamQuery = {
				filter: true,
				pagination: true,
				order: OrderEnum.ASC,
				order_by: 'code',
				name: this.searchValuemodifier,
				per_page:10,
				page: page
			} as any;
			this.subscription.push(this.requestService
				.sendRequest(
					ModifiersUrlsEnum.Modifiers_list_GET,
					'get',
					REQUEST_SERVERS.fd_api_url,
					paramQuery,
				)
				.subscribe((res) => {
					if(searchType === 'search'){
						this.lstCptorModifiers = [];
						this.cptPage.pageNumber = 1;
						this.searchValueCpt = value; 
					}
					let result;
					this.lastPageModifier = res['result']['last_page'];
					result = res['result']['data'];
					result =result
						? result.map((m) => {
								return {
									id: m.id,
									name: makeSingleNameFormFIrstMiddleAndLastNames([m.name, m.description], '-'),
								};
						  })
						: [];
						this.lstCptorModifiers = [...this.lstCptorModifiers, ...result];
				}));
	}

	onSelectCode(selectedCpt) {
		this.selectedCpt = selectedCpt;
	}

	/**
	 * submit form to add modifier and cpt codes
	 * @param data
	 * @param title
	 */
	submtCptOrModifiers(data, title) {
		if (data.length) {
			if (title == 'CPT Codes') {
				let getLengthVisit :number= this.getVisitLength() +data?.length;
				if(this.selectedFormats && this.selectedFormats[0] != null &&
					this.selectedFormats[0] != undefined &&
					 this.selectedFormats.some(item=>item.slug ==='1500')) {
					// if (getLengthVisit>6) {
					// 	let cptStatus =this.onFormatedCheckboxChange({checked:true}, {slug:'1500'},1,data.length);
					// }
					// else {
						if(!this.selectMultipleCPTs && this.visitList[this.rowindex]['cpt_fee_schedules'].length){
							this.customDiallogService.confirm('Are you sure?','This action will overwrite the selected CPT Code over the existing one.','Yes','No')
							.then((confirmed) => {
								if (confirmed){
									this.removeAllCPTonOverwrite(Number(this.visitList[this.rowindex]['cpt_fee_schedules'].length))
									this.addCPT(data);
								}else{
									this.cptmodalRef.close();
								}
							})
							.catch();
						}else{
							this.addCPT(data);
						}
					// }
				}
				else {
					if(!this.selectMultipleCPTs && this.visitList[this.rowindex]['cpt_fee_schedules'].length){
						this.customDiallogService.confirm('Are you sure?','This action will overwrite the selected CPT Code over the existing one.','Yes','No')
							.then((confirmed) => {
								if (confirmed){
									this.removeAllCPTonOverwrite(Number(this.visitList[this.rowindex]['cpt_fee_schedules'].length))
									this.addCPT(data);
								}else{
									this.cptmodalRef.close();
								}
							})
							.catch();
					}else{
						this.addCPT(data);
					}
				}	
			} else {
					this.toggleExpandRow(this.singleRecord);
				if (this.modifiersData.length > 4) {
					this.toastrService.error('Maximum 4 modifiers can be add', 'Modifier limit');
				} else {
					this.singleRecord['cpt_fee_schedules'][this.rowModindex]['modifiers'] = [];
					this.singleRecord['cpt_fee_schedules'][this.rowModindex][
						'modifiers'
					] = this.modifiersData;
				}
				this.cptmodalRef.close();
				setTimeout(() => {
					this.toggleExpandRow(this.singleRecord);
				}, 10);
			}
		}
	}
	removeAllCPTonOverwrite(totalCpts:number){
			for(let i = 0; i < totalCpts; i++){
				this.deleteCptList(this.visitList[this.rowindex] && this.visitList[this.rowindex]['cpt_fee_schedules'] && this.visitList[this.rowindex]['cpt_fee_schedules'][0],this.visitList[this.rowindex]['cpt_fee_schedules'].length - 1,this.mainrow);
			}
		
	}


	calcaulateAllVitits() {

			let visit_sessions = [];
			this.visitList.forEach((eachvisit:any) => {
		
					let formate = {
						id: eachvisit['id'],
						case_type_id: eachvisit['kiosk_case']['case_type_id'],
						visit_type_id: eachvisit['appointment_type_id'],
						provider_id: eachvisit['doctor_id'],
						speciality_id: eachvisit['speciality_id'],
						facility_location_id: eachvisit['facility_location_id'],
						region_id:
							eachvisit['facility_location'] && eachvisit['facility_location']['region_id']
								? eachvisit['facility_location']['region_id']
								: null,
						place_of_service_id:
							eachvisit['facility_location'] &&
							eachvisit['facility_location']['place_of_service_id']
								? eachvisit['facility_location']['place_of_service_id']
								: null,
						// insurance_id:
						// 	eachvisit['kiosk_case'] && eachvisit['kiosk_case']['case_insurance']
						// 		? eachvisit['kiosk_case']['case_insurance']
						// 				.filter((m) => m?.type == 'primary')
						// 				.map((x) => x?.id)[0]
						// 		: [],
						insurance_id: eachvisit['kiosk_case']['insurance_id'] ? eachvisit['kiosk_case']['insurance_id'] : [],
						employer_id:
							eachvisit['kiosk_case'] && eachvisit['kiosk_case']['case_employers']
								? eachvisit['kiosk_case']['case_employers']
										.filter((m) => m['pivot']['employer_type_id'] === 1)
										.map((x) => x.id)[0]
								: [],
						plan_id:
							eachvisit['kiosk_case'] && eachvisit['kiosk_case']['case_insurance']
								? eachvisit['kiosk_case']['case_insurance']
										.filter((m) => m?.type == 'primary')
										.map((x) => x?.insurance_plan_name_id)[0]
								: [],
						cpt_code_ids:  this.billID && this.billDetail ? eachvisit['cpt_fee_schedules']?.map((cpt) => cpt?.code_id)  : eachvisit?.cpt_codes?.map((cpt) => cpt?.id),
					};
					visit_sessions.push(removeEmptyAndNullsFormObject(formate));
			});

			if (visit_sessions?.length) {
				this.getFeeScheduler({ visit_sessions: visit_sessions });
				// this.billingService
				// 	.getCalculatedFeeSchedule({ visit_sessions: calculationObject1 })
				// 	.subscribe((data) => {
				// 		if (data) {
				// 			let sourceIds = data['result']['data'].map((m) => m.id);
				// 			let selectedvits = makeDeepCopyArray(
				// 				this.visitList.filter((m) => sourceIds.includes(m.id)),
				// 			);
				// 			this.mapping(data['result']['data'], selectedvits);
				// 			this.calculateTotalAmout();
				// 			Promise.resolve().then(() => {
				// 				this.visitList.forEach((x) => this.table.rowDetail.toggleExpandRow(x));
				// 			});
				// 			setTimeout(() => {
				// 				Promise.resolve().then(() => {
				// 					this.visitList.forEach((row, index) => {
				// 						row['isexpand'] = !row['isexpand'];
				// 						row['rowIndex'] = index == 0 || index ? index : row['rowIndex'];
				// 						this.table.rowDetail.toggleExpandRow(row);
				// 					});
				// 				});
				// 			}, 20);
				// 			this.ifNullFeeScheduler();
				// 		}
				// 	});
			//}
		}
	}
	ifNullFeeScheduler() {
		let iscalculated = [];
		this.visitList.forEach((element) => {
			if (element.cpt_fee_schedules) {
				element.cpt_fee_schedules.forEach((x) => {
					if (x['id'] == null) {
						iscalculated.push(x.cpt_code['name']);
					}
				});
			}
		});
		if (iscalculated.length) {
			this.toastrService.error(this.feeMessage + ' ' + iscalculated, 'Error');
			iscalculated = [];
			return;
		}
	}
	mapping(source: FeeScheduleCalculatedData[], destination: CreateBillModel[]) {
		return destination.map((item) => {
			let source_item = source.find((_item) => item.id === _item.id);
			source_item.cpt_codes.map((visitcpts) => {
				let arr = [];
				if (visitcpts.fee_schedules.length > 0) {
					visitcpts.fee_schedules.filter((multiplefees) => {
						multiplefees['hasMultiplFee'] = true;
						/* BELOW CHECK UN USED CODE */
						if (!multiplefees) {
							return;
						}
						multiplefees.cpt_code = item.cpt_codes.filter((x) => x.id == multiplefees.code_id)[0];
						multiplefees.modifiers = [];
						multiplefees['visit_id'] = source_item.id;
						arr.push(multiplefees);
					});
					let nullfessids = item.cpt_fee_schedules
						.filter((x) => !x.fee_schedule_id)
						.map((m) => m.cpt_code['id']);
					if (nullfessids.includes(visitcpts.id)) {
						let fee_schedul = makeDeepCopyObject(visitcpts.fee_schedules[0]);
						item.cpt_fee_schedules
							.filter((x) => x.cpt_code['id'] === visitcpts.id)
							.forEach((x) => item.cpt_fee_schedules.splice(item.cpt_fee_schedules.indexOf(x), 1));
						fee_schedul['modifiers'] = [];
						fee_schedul['total_charges'] = fee_schedul['units'] * fee_schedul['per_unit_price'];
						fee_schedul['multiplefees'] = arr;
						fee_schedul['visit_id'] = item.id;
						fee_schedul['id'] = fee_schedul.id;
						fee_schedul['fee_schedule_id'] = fee_schedul.id;
						item.cpt_fee_schedules.push(fee_schedul);
						fee_schedul['hasMultiplFee'] = true;
						// this.multiplefeerecords.push(arr)
					}
					this.rowindex = this.visitList.findIndex(function (object) {
						return object.id == item.id;
					});
					this.calculateVisitAmount(this.rowindex);
					this.calculateTotalAmout();
				} else if (visitcpts.fee_schedules.length == 1) {
					let nullfessids = item.cpt_fee_schedules
						.filter((x) => !x.fee_schedule_id)
						.map((m) => m.cpt_code['id']);
					item.cpt_fee_schedules
						.filter((x) => x.cpt_code['id'] === visitcpts.id)
						.forEach((x) => item.cpt_fee_schedules.splice(item.cpt_fee_schedules.indexOf(x), 1));
					if (nullfessids.includes(visitcpts.id)) {
						let fee_schedules = visitcpts.fee_schedules[0];
						if (!fee_schedules) {
							return;
						}
						let cpt = item.cpt_codes.filter((x) => x.id == fee_schedules.code_id);
						fee_schedules.cpt_code = cpt
							? cpt.map((x) => {
									return {
										id: x.id,
										name: makeSingleNameFormFIrstMiddleAndLastNames([x.name, x.description], '-'),
									};
							  })[0]
							: fee_schedules.cpt_code;
						fee_schedules.modifiers = [];
						fee_schedules['visit_id'] = item.id;
						fee_schedules['id'] = fee_schedules.id;
						fee_schedules['total_charges'] =
							fee_schedules['units'] * fee_schedules['per_unit_price'];
						fee_schedules['fee_schedule_id'] = fee_schedules.id;
						item.cpt_fee_schedules.push(fee_schedules);
					}
					this.rowindex = this.visitList.findIndex(function (object) {
						return object.id == item.id;
					});
					this.calculateVisitAmount(this.rowindex);
					this.calculateTotalAmout();
				}
			});
			return item;
		});
	}
	isdisable: boolean = false;
	addCPT(cptdata, isnewfee = false) {
		let cids = this.singleRecord['cpt_fee_schedules'].map((m) => m.cpt_code.id);
		!isnewfee ? (cptdata = cptdata.filter((m) => !cids.includes(m.id))) : '';
		this.isdisable = true;
		let _cptCodes = cptdata;
		if (!this.singleRecord['cpt_fee_schedules'].length) {
			this.singleRecord['isexpand'] = true;
		}
		// let expand = this.singleRecord['isexpand'] ? true : false
		this.toggleExpandRow(this.singleRecord);
		let formate = {
			id: this.singleRecord['id'],
			case_type_id: this.singleRecord['kiosk_case']['case_type_id'],
			visit_type_id: this.singleRecord['appointment_type_id'],
			provider_id: this.singleRecord['doctor_id'],
			speciality_id: this.singleRecord['speciality_id'],
			facility_location_id: this.singleRecord['facility_location_id'],
			region_id:
				this.singleRecord['facility_location'] &&
				this.singleRecord['facility_location']['region_id']
					? this.singleRecord['facility_location']['region_id']
					: null,
			place_of_service_id:
				this.singleRecord['facility_location'] &&
				this.singleRecord['facility_location']['place_of_service_id']
					? this.singleRecord['facility_location']['place_of_service_id']
					: null,
			insurance_id:
				this.getInsuranceIds()
					? this.getInsuranceIds()
						?.map((x) => x?.insurance_id)[0]
					: [],
			employer_id:
				this.singleRecord['kiosk_case'] && this.singleRecord['kiosk_case']['case_employers']
					? this.singleRecord['kiosk_case']['case_employers']
							.filter((m) => m['pivot']['employer_type_id'] === 1)
							.map((x) => x.id)[0]
					: [],
			plan_id:
				this.getInsuranceIds()
					? this.getInsuranceIds()
						?.map((x) => x?.insurance_plan_name_id)[0]
					: [],
			cpt_code_ids: _cptCodes.map((m) => m.id),
		};
		let feedata = removeEmptyAndNullsFormObject(formate);
		this.billingService
			.getCalculatedFeeSchedule({ visit_sessions: [feedata] })
			.subscribe((data) => {
				if (data) {
					let nullfeeSchedule = [];
					let feeCallculateddata: FeeScheduleCalculatedData = data['result']['data'][0];
					// this.mapping([feeCallculateddata],[this.singleRecord],true,cptdata)
					feeCallculateddata.cpt_codes.filter((record) => {
						if (record.fee_schedules && record.fee_schedules.length > 1) {
							let arr = [];
							record.fee_schedules.filter((m) => {
								m.cpt_code = _cptCodes.filter((m) => m.id == record.fee_schedules[0].code_id)[0];
								m['visit_id'] = feeCallculateddata.id;
								m.modifiers = [];
								m['total_charges'] = m['units'] * m['per_unit_price'];
								m['fee_schedule_id'] = m['id'];
								m['hasMultiplFee'] = true;
								arr.push(m);
							});
							// this.multiplefeerecords.push(record.fee_schedules)
							let feeschedule: FeeScedule = makeDeepCopyObject(record.fee_schedules[0]);
							feeschedule['modifiers'] = [];
							feeschedule['total_charges'] = feeschedule['units'] * feeschedule['per_unit_price'];
							feeschedule['visit_id'] = feeCallculateddata.id;
							feeschedule.cpt_code = _cptCodes.filter((m) => m.id == feeschedule.code_id)[0];
							feeschedule['multiplefees'] = arr;
							this.singleRecord['cpt_fee_schedules'].push(feeschedule);
						} else if (record.fee_schedules && record.fee_schedules.length == 1) {
							let feeschedule: FeeScedule = record.fee_schedules[0];
							feeschedule['modifiers'] = [];
							feeschedule['visit_id'] = feeCallculateddata.id;
							feeschedule['total_charges'] = feeschedule.units * feeschedule.per_unit_price;
							feeschedule.cpt_code = _cptCodes.filter((m) => m.id == feeschedule.code_id)[0];
							let issamecpt = this.singleRecord['cpt_fee_schedules'].filter(
								(m) => m.code_id == feeschedule.code_id,
							);
							issamecpt.length == 0 ? this.singleRecord['cpt_fee_schedules'].push(feeschedule) : '';
						} else {
							let feeschedule = {};
							feeschedule['modifiers'] = [];
							feeschedule['visit_id'] = feeCallculateddata.id;
							feeschedule['total_charges'] = 0;
							feeschedule['per_unit_price'] = 0;
							feeschedule['units'] = 0;
							feeschedule['base_price'] = 0;
							if (!this.singleRecord['cpt_codes']) {
								this.singleRecord['cpt_codes'] = [];
							}
							this.singleRecord['cpt_codes'].push(_cptCodes.filter((m) => m.id == record.id)[0]);
							feeschedule['cpt_code'] = _cptCodes.filter((m) => m.id == record.id)[0];
							this.singleRecord['cpt_fee_schedules'].push(feeschedule);
							let cpt = _cptCodes.filter((m) => m.id == record.id)[0];
							nullfeeSchedule.push(cpt.name);
						}
					});
					this.isdisable = false;
					this.cptmodalRef ? this.cptmodalRef.close() : '';
					nullfeeSchedule.length
						? this.toastrService.error(this.feeMessage + ' ' + nullfeeSchedule, 'Fee Schedule')
						: '';
					setTimeout(() => {
						this.toggleExpandRow(this.singleRecord);
					}, 100);
					this.calculateVisitAmount(this.rowindex);
					this.calculateTotalAmout();
				}
			});
	}
	setCpt: any;
	openModel(data, mainrow) {
		this.singleRecord = mainrow;
		this.selectedChildCpt=data;
		this.selectedmultiplefeerecords = [];
		this.showCptTable = false;
		this.rowindex = this.visitList.findIndex(function (object) {
			return object.id == data.visiobjefcto || data.visit_session_id || data.visit_id;
		});
		const cptName = data.cpt_code.description ? `${data.cpt_code.name}-${data.cpt_code.description}` : `${data.cpt_code.name}`

		const mutliplefeesSchedule = data && data.cpt_code && data.cpt_code.fee_schedule && data.cpt_code.fee_schedule.map(e => {
			e['total_charges'] = Number(e['units']) * Number(e['per_unit_price']);
			e['cpt_code'] = {id: data.cpt_code.id, name: cptName};
			e['visit_id'] = data.visit_session_id;
			e.modifiers = [];
			return e;
		});
		if(data && data.cpt_code && data.cpt_code.fee_schedule && !data['multiplefees']) {
			data['multiplefees'] = data.cpt_code.fee_schedule;
			data['hasMultiplFee'] = true;
		}
		this.selectedmultiplefeerecords = data['multiplefees'] || mutliplefeesSchedule;
		this.setCpt = data;
		if(data.cpt_code.fee_schedule) {
			data['per_unit_price'] = parseFloat(data['per_unit_price']);
			data['total_charges'] = parseFloat(data['total_charges']);
			data['units'] = data['units'].toString();
			let selectedCpt = this.setCpt.multiplefees.find((x:any) => {
				return x.base_price == data.base_price &&
				x.per_unit_price == data.per_unit_price &&
				x.total_charges == data.total_charges &&
				x.units == data.units
			})
			this.setCpt['id'] = selectedCpt && selectedCpt['id'] ? selectedCpt['id'] : this.setCpt['id'];
		}
		if (this.selectedmultiplefeerecords && this.selectedmultiplefeerecords.length) {
			let ngbModalOptions: NgbModalOptions = {
				backdrop: 'static',
				keyboard: false,
				size: 'lg',
				windowClass: 'modal_extraDOc',
			};
			this.showCptTable = true;
			this.modalReference = this.modalService.open(
				this.showMultipleCPTFeeScheduleModel,
				ngbModalOptions,
			);
		}
	}
	getInsuranceIds(){
		const caseInsurance = this.singleRecord['kiosk_case']?.['case_insurance'] || [];

        const filterByType = (type) => caseInsurance.filter(x => x?.['type'] === type);

		if (caseInsurance.filter(x => x?.['confirmed_for_billing']).length) {
			return caseInsurance.filter(x => x?.['confirmed_for_billing']);
		} else if (filterByType('primary').length) {
			return filterByType('primary');
		} else if (filterByType('private_health').length) {
			return filterByType('private_health');
		} else {
			return [];
		}
	}
	selectCpts(data, row, index) {
		this.selectCpt=row;
		data.filter((item, i) => {
			if (index == i) {
				item['isSelected'] = true;
			} else item['isSelected'] = false;
		});
	}
	getVisitDocument(row){
		let paramQuery={};
		paramQuery['reference_id']=row?.id;
		paramQuery['id']=row?.folder_id;
		this.requestService
			.sendRequest(
				BillingRecipientUrlsEnum.Documents_for_visit,
				'POST',
				REQUEST_SERVERS.fd_api_url,
				paramQuery,
			).subscribe(res=>{
				if(res?.status){
					if(res?.data.length>0){
						window.open(res?.data[0]?.pre_signed_url)
					}
				}
			})
	}

	appendCPT(allCpts) {
		debugger;
		let expand = this.singleRecord['isexpand'] ? true : false;
		expand ? this.toggleExpandRow(this.singleRecord) : '';
		allCpts.filter((data) => {
			if (data && data.visit_id === ((this.setCpt && this.setCpt.visit_id) || (this.setCpt && this.setCpt.visit_session_id)) && data.isSelected == true) {
				if (data) {
					this.setCpt.per_unit_price = data.per_unit_price;
					this.setCpt.base_price = data.base_price;
					this.setCpt.units = data.units;
					this.setCpt.cpt_code = data.cpt_code;
					this.setCpt.total_charges = data.units * data.per_unit_price;
					this.setCpt.id = data.id;
				}
			}
		});
		this.selectedmultiplefeerecords = [];
		this.modalReference.close();
		setTimeout(() => {
			expand ? this.toggleExpandRow(this.singleRecord) : '';
		}, 100);
		this.calculateVisitAmount(this.rowindex);
		this.calculateTotalAmout();
	}
	modifiersData: any = [];
	showOnModel(val) {
		debugger;
		if (val) {
			this.selectedCpt = val;

			this.modifiersData = val;
			this.addCptForm.patchValue({ name: val });
		}
		if (this.cptOrmodifier == 'CPT Codes') {
			let totallength = this.singleRecord.cpt_fee_schedules.length + val.length;
			this.selected_case_type_slug = this.visitList[0].kiosk_case.case_types.slug;
			let selected_allowed_case_type_slug=this.allowed_case_type_slugs.findIndex((case_type_slug)=>case_type_slug==this.selected_case_type_slug);
		//   if ( (selected_allowed_case_type_slug==-1)){	
			// if (totallength > 6) {
			// 	val.pop();
			// 	this.modifiersData = val;
			// 	this.addCptForm.patchValue({ name: this.modifiersData });
			// 	this.toastrService.error('CPT Codes must be 6 or less for CMS-1500 bill format', 'Error');
			// 	}
			// }
		}
	}
	/**
	 * remove modifiers on cross click
	 * @param data
	 * @param item
	 */
	removeModifier(data, item) {
		data['modifiers'] = data['modifiers'].filter((m) => m.id != item.id);
	}
	removeModifierOrCptFromModel(data, title) {
		this.modifiersData = this.modifiersData.filter((m) => m.id != data.id);
		this.addCptForm.patchValue({ name: this.modifiersData });
	}
	calculateVisitAmount(mainrowIndex) {
		this.visitList[mainrowIndex]['visit_charges'] = 0;
		this.visitList[mainrowIndex]['cpt_fee_schedules'].filter((item) => {
			this.visitList[mainrowIndex]['visit_charges'] =
				parseFloat(this.visitList[mainrowIndex]['visit_charges']) +
				parseFloat(<any>item['total_charges']);
		});
	}
	updateUnitValue(event, row, mainrow) {
		row.units = event.target.value;
		row.total_charges = row.per_unit_price * row.units;
		row.per_unit_price = row.per_unit_price;
		this.calculateVisitAmount(mainrow['rowIndex']);
		this.calculateTotalAmout();
	}
	calculateTotalAmout() {
		this.totalAmount = 0;
		this.visitList.filter((m) => {
			this.totalAmount = this.totalAmount + ((parseFloat(m['visit_charges']?m['visit_charges']:0)));
		});
		this.totalAmount = +this.totalAmount.toFixed(2);
	}
	/**
	 * set form for creating Bill
	 */
	setCreateBillingform() {
		this.createbillForm = this.fb.group({
			bill_date: [new Date(), Validators.required],
			speciality_id: this.speciality,
			case_id: this.caseId,
			visit_sessions: [],
			bill_recipients: ['', Validators.required],
			ebill_recipients: [''],
			icd_code_ids: [[], Validators.required],
			document_type_ids: [''],
			bill_type : ['2']
		});
		if (this.isBillingDetail) {
			this.createbillForm.disable();
		}
	}
	/**
	 * get Recipient listing
	 */
	getRecipient() {
		var paramQuery: ParamQuery = { filter: true, pagination: false, order: OrderEnum.ASC } as any;
		this.requestService
			.sendRequest(
				BillingRecipientUrlsEnum.BillingRecipient_list_GET,
				'get',
				REQUEST_SERVERS.fd_api_url,
				paramQuery,
			)
			.subscribe((res) => {
				this.lstRecip = res['result']['data'];
				if(this.electronice_insurances?.length){
					this.eBilllstRecip = this.lstRecip.filter(reciept => reciept.id == 3);
					this.createbillForm.patchValue({
						ebill_recipients: this.eBilllstRecip
					});
				}
				this.filteredReciptsObject = this.lstRecip.slice(0);
				if ((this.isBillingDetail || this.editBill) && this.billDetail?.bill_type == ch_billing_typs_enum.manual_bill) {
					let reciptIds = this.billDetail['bill_recipients'].map(
						(m) =>  m['bill_recipient_type_id']
					);
					this.createbillForm.patchValue({
						bill_recipients: this.filteredReciptsObject.filter((m) => reciptIds.includes(m.id)),
					});
				}else{
					this.FetchDefaultBillTo();
				}
			});

	}
	FetchDefaultBillTo(){
		switch(this.case_type_slug){
			case CaseTypeEnum.private_health_insurance:
				this.setDefaultReciept('insurance');
				break
			case CaseTypeEnum.worker_compensation:
				this.setDefaultReciept('insurance');
				break
			case CaseTypeEnum.lien:
				this.setDefaultReciept('lawyer');
				break
			case CaseTypeEnum.self_pay:
				this.setDefaultReciept('patient');
				break
			case CaseTypeEnum.auto_insurance:
				this.setDefaultReciept('insurance');
				break
			case CaseTypeEnum.corporate:
				this.setDefaultReciept('employer');
				break
		}
	}
	setDefaultReciept(recpt_slug:string){
		let defaultRecipets = this.filteredReciptsObject?.filter((recpt) => recpt?.slug === recpt_slug)
		this.createbillForm.patchValue({
			bill_recipients: defaultRecipets,
		});
		let reciepeint = defaultRecipets?.[0];
		this.checkRecipatanttype(reciepeint?.name,true);
		if (!this.selectedBillTo.includes(reciepeint?.id)){
		this.selectedBillTo.push({bill_recipient_type_id:reciepeint?.id});
		}
		this.disableBillButton();
		if(recpt_slug === 'insurance'){
			if(this.insurances?.filter(x => x?.['confirmed_for_billing'])?.length){
				this.insurances.forEach((element,index) => {
					if(element?.['confirmed_for_billing']){
						element['checked'] = true;
						this.toBillInsurances({checked:true},element?.insurance_id,index,element);
					}
				});
			}else if(this.insurances?.filter(x => x?.['type'] === 'primary')?.length){
				this.insurances.forEach((element,index) => {
					if(element?.['type'] === 'primary'){
						element['checked'] = true;
						this.toBillInsurances({checked:true},element?.insurance_id,index,element);
					}
				});
			}else if(this.insurances?.filter(x => x?.['type'] === 'private_health')?.length && this.case_type_slug === CaseTypeEnum.private_health_insurance){
				this.insurances.forEach((element,index) => {
					if(element?.['type'] === 'private_health'){
						element['checked'] = true;
						this.toBillInsurances({checked:true},element?.insurance_id,index,element);
					}
				});
			}
		}else{
			if(this.employer?.filter(emp => emp?.['pivot']?.['employer_type_id'] === 1).length && this.case_type_slug === CaseTypeEnum.corporate){
				this.employer.forEach((element,index) => {
					if(element?.['pivot']?.['employer_type_id'] === 1){
						element['checked'] = true;
						this.toBillEmployer({checked:true},element?.id,index,element);
					}
				});
			}
		}
	}
	/**
	 * set drop down configration for Reciepients
	 */
	dropdownSetting() {
		this.dropdownSettings = {
			singleSelection: false,
			idField: 'id',
			textField: 'name',
			selectAllText: 'Select All',
			unSelectAllText: 'UnSelect All',
			itemsShowLimit: 4,
			allowSearchFilter: false,
			enableCheckAll: true,
		};
	}
	eBilldropdownsetting(){
		this.eBilldropdownSettings = {
			singleSelection: false,
			idField: 'id',
			textField: 'name',
			selectAllText: 'Select All',
			unSelectAllText: 'UnSelect All',
			itemsShowLimit: 1,
			allowSearchFilter: false,
			enableCheckAll: false,
		};	
	}
	/**
	 * on select all recipient
	 * @param event
	 */
	
	onDeSelectAll($event) {
		this.selectedBillTo=[];
		this.isInsurance = false;
		this.isEmployer= false;
		this.isLawyer = false;
		this.ispatient= false;
		this.billemployer= [];
		this.billinsurances= [];
		this.disableBillButton();
	}

	onSelectAll(event) {
		 this.selectedBillTo = [];
		event.forEach(event=>{
			this.checkRecipatanttype(event.name,true);
			this.selectedBillTo.push({bill_recipient_type_id:event.id});
			this.disableBillButton();
		});

		// currentReciptant=this.billDetail['bill_recipients'].filter(billsReciptant=>{
		// 	return billsReciptant.bill_recipient_type_id === event.id;
		// });
		// this.filteredReciptsObject.filter(function (item, index) {
		// 	!item['ids'] ? (item['ids'] = '') : null;
		// });
		// event && event.length ? (this.ispatient = true) : (this.ispatient = false);
		// event && event.length ? (this.isEmployer = true) : (this.isEmployer = false);
		// event && event.length ? (this.isLawyer = true) : (this.isLawyer = false);
		// event && event.length ? (this.isInsurance = true) : (this.isInsurance = false);
		// this.filteredReciptsObject.filter((m) => {
		// 	m.name == 'Patient' ? (m['ids'] = this.patient ? this.patient.id : null) : '';
		// 	m.name == 'Lawyer' ? (m['ids'] = this.lawer ? this.lawer.id : '') : '';
		// });
	}
	/**
	 * on select single recipient
	 * @param event
	 */

	 checkRecipatanttype(name,setParam = false) {
		 switch(name) {
			 case 'Firm Name' :{
				 (this.isLawyer = setParam);
				 this.setDefaultTemplate('Lawyer');
				 break;
				}
				case 'Patient' : {
					(this.ispatient = setParam);
					this.setDefaultTemplate('Patient');
				break;
			 }
			 case 'Insurance': {
				(this.isInsurance = setParam);
				 break;
			 }
			 case 'Employer':{
				(this.isEmployer =setParam);
				 break;
			 }
		 }

		
	 }
	 setDefaultTemplate(billToType:string){
		if(billToType === 'Patient'){
			if(this.case_type_slug === CaseTypeEnum.self_pay && this.ispatient){
				let formatdata = {};
				let getFormatBill = this.formateData.filter(format => format.slug === bill_format_enum.Invoice);
				this.patient.document_type_ids = (getFormatBill?.length)? [getFormatBill[getFormatBill.length - 1].id] : [];
				formatdata = {
					data : [...getFormatBill],
					formValue : (getFormatBill?.length)? [getFormatBill[getFormatBill.length - 1].id] : [],
					label : "document_type_ids"
				}
				this.selectionOnValueChange(formatdata,'document_type_ids',billToType)
			}
		}else{
			if(this.case_type_slug === CaseTypeEnum.lien && this.isLawyer && this.lawer){
				let formatdata = {};
				let getFormatBill = this.formateData.filter(format => format.slug === bill_format_enum.Invoice);
				this.lawer.document_type_ids = (getFormatBill?.length)? [getFormatBill[getFormatBill.length - 1].id] : [];
				formatdata = {
					data : [...getFormatBill],
					formValue : (getFormatBill?.length)? [getFormatBill[getFormatBill.length - 1].id] : [],
					label : "document_type_ids"
				}
				this.selectionOnValueChange(formatdata,'document_type_ids',billToType)
			}
		}
	 }
	 onDeItemSelect(event) {
		this.selectedBillTo = removeDuplicatesObject(this.selectedBillTo,'bill_recipient_type_id');
		this.checkRecipatanttype(event.name,false);
		let index = this.selectedBillTo.findIndex(index=>{
			return index.bill_recipient_type_id === event.id;
		});
		this.selectedBillTo.splice(index,1);
		this.disableBillButton();
	 }

	onItemSelect(event?) {
		this.checkRecipatanttype(event.name,true);
		// currentReciptant=this.billDetail['bill_recipients'].filter(billsReciptant=>{
		// 	return billsReciptant.bill_recipient_type_id === event.id;
		// });
		if (!this.selectedBillTo.includes(event.id)){
		this.selectedBillTo.push({bill_recipient_type_id:event.id});
		}
		this.disableBillButton();
		// if ( event.name=='Patient' || event.name=='Lawyer'){
		// 	// event['bill_recipient_id'] =currentReciptant[0].bill_recipient_id;
		// 	this.selectedBillTo.push({bill_recipient_type_id:event.id,bill_recipient_id:currentReciptant[0].bill_recipient_id});
		// }
		// else {
		// 	currentReciptant.forEach(currentRecp=>{
		// 		this.selectedBillTo.push({bill_recipient_type_id:event.id,bill_recipient_id:currentRecp.bill_recipient_id});
		// 	});
		// }
		// event['bill_recipient_id'] = event.name!='Insurance' || event.name!='Employer'? currentReciptant[0].bill_recipient_id:


		// this.filteredReciptsObject.filter(function (item, index) {
		// 	!item['ids'] ? (item['ids'] = '') : null;
		// });
		// event.name == 'Patient' ? (this.ispatient = !this.ispatient) : '';
		// event.name == 'Patient'
		// 	? this.filteredReciptsObject.filter((m) => {
		// 			m.name == event.name ? (m['ids'] = this.patient ? this.patient.id : null) : '';
		// 	  })
		// 	: '';
		// event.name == 'Employer' ? (this.isEmployer = !this.isEmployer) : '';
		// event.name == 'Lawyer' ? (this.isLawyer = !this.isLawyer) : '';
		// event.name == 'Lawyer'
		// 	? this.filteredReciptsObject.filter((m) => {
		// 			m.name == event.name ? (m['ids'] = this.lawer ? this.lawer.id : '') : '';
		// 	  })
		// 	: '';
		// event.name == 'Insurance' ? (this.isInsurance = !this.isInsurance) : '';
		// if (event.name == 'Insurance' && (this.isBillingDetail || this.editBill)) {
		// 	let selectedInsurances = this.billDetail['bill_recipients']
		// 		.filter((m) => m.bill_recipient_type_id == event.id)
		// 		.map((m) => m.bill_recipient_id);
		// 	this.filteredReciptsObject = [
		// 		...this.filteredReciptsObject,
		// 		...this.billDetail['bill_recipients']
		// 			.filter((m) => m.bill_recipient_type_id == event.id)
		// 			.map((x) => {
		// 				return {
		// 					id: x.bill_recipient_type_id,
		// 					ids: x.bill_recipient_id,
		// 					name: x.recipient['insurance_name'],
		// 				};
		// 			}),
		// 	];
		// 	this.billinsurances = selectedInsurances;
		// }
		// if (event.name == 'Employer' && (this.isBillingDetail || this.editBill)) {
		// 	let selectedEmployer = this.billDetail['bill_recipients']
		// 		.filter((m) => m.bill_recipient_type_id == event.id)
		// 		.map((m) => m.bill_recipient_id);
		// 	this.filteredReciptsObject = [
		// 		...this.filteredReciptsObject,
		// 		...this.billDetail['bill_recipients']
		// 			.filter((m) => m.bill_recipient_type_id == event.id)
		// 			.map((x) => {
		// 				return {
		// 					id: x.bill_recipient_type_id,
		// 					ids: x.bill_recipient_id,
		// 					name: x.recipient['employer_name'],
		// 				};
		// 			}),
		// 	];
		// }
	}
	/**
	 * check if insurance is selected against insurance recipent
	 */
	/* BELOW UN_USED CODE */
	checkIfSelectedInsurances() {
		if (this.isInsurance) {
			return this.insurances.length ? (this.billinsurances.length ? false : true) : false;
		}
		return false;
	}
	/**
	 * check if employer is selected against employer recipent
	 */
	/* BELOW UN_USED CODE */
	checkIfSelectedEmployer() {
		if (this.isEmployer) {
			return this.employer.length ? (this.billemployer.length ? false : true) : false;
		}
		return false;
	}
	/* BELOW UN_USED CODE */
	checkIfInsuranceIncluds(item){
		debugger;
		return this.insurances && this.insurances.length!=0?this.insurances.some(ins=>
		ins? ins.id == item.id:false):[];
	}
	/* BELOW UN_USED CODE */
	checkIfEmployeerIncludes(item){	
		return this.employer && this.employer.length!=0?this.employer.some(emp=>
			emp? emp.id == item.id:false):[];
	}
	/**
	 * get ICDCode through intellicence
	 * @param event
	 */
	 getICDcodes(value , searchType?, page =1 ) {
		if(searchType === 'search'){
			this.lstICDcodes = [];
			this.icdPage.pageNumber = 1;
			this.searchValue = value; 
		}
		var paramQuery: ParamQuery = {
			filter: true,
			pagination: true,
			order: OrderEnum.ASC,
			order_by: 'name',
			code_type_id: 1,
			type: 'ICD',
			name: value,
			per_page:10,
			page: page
		} as any;
		this.showSpinnerIntellicense.diagnosis_codes = true;
		this.subscription.push(this.requestService
			.sendRequest(CodesUrl.CODES_SINGLE_GET, 'get', REQUEST_SERVERS.fd_api_url, paramQuery)
			.subscribe((res) => {
				let result =
					res['result']['data'] && res['result']['data'].length
						? res['result']['data'].map((x) => {
								return {
									id: x.id,
									name: makeSingleNameFormFIrstMiddleAndLastNames([x.name, x.description], '-'),
								};
						  })
						: [];
						this.showSpinnerIntellicense.diagnosis_codes = false;
						this.lstICDcodes = [...this.lstICDcodes , ...result];
			}));
	}
	/**
	 * remove icd codes when click on icd button
	 * @param item
	 */
	/* BELOW UN_USED CODE */
	removeIcdCodes(item) {
		this.icdbuttons = this.icdbuttons.filter((m) => m.id != item.id);
	}
	/**
	 * remove icd codes from input and listing
	 * @param event
	 */
	removeICDcodeFromList(updatedCodes) {
		this.icdbuttons = updatedCodes;

		// console.log(event)
		// let cids = this.icdbuttons.map(m => m.id)
		// cids.includes(event[0].id) ? '' : this.icdbuttons.push(event[0])
		// let ids = this.createbillForm.get('icd_code_ids').value.map(m => m.id)
		// this.lstICDcodes = this.lstICDcodes.filter(function (item) {
		// 	return ids.indexOf(item.id) === -1;
		// });
		// console.log(this.lstICDcodes)
		// this.createbillForm.get('icd_code_ids').setValue(null)
	}
	/* BELOW UN_USED CODE */
	getCaseTypeNfStatus(){

			
	}
	
	onFormatedCheckboxChange($event:any,item,index,cptLength=0) {
		debugger;
		this.formatCheckBox;
		// item.check = !item.check;
		if ($event.checked && item.slug ==='1500'){
			let visitLength = this.getVisitLength()+cptLength;
			this.selected_case_type_slug = this.visitList[0].kiosk_case.case_types.slug;
			let selected_allowed_case_type_slug=this.allowed_case_type_slugs.findIndex((case_type_slug)=>case_type_slug==this.selected_case_type_slug);
			  if(visitLength>6){
				  if (cptLength==0){
				  this.formatCheckBox['_results'][index].checked = false;	
				  }			   
				  this.toastrService.error('CPT Codes must be 6 or less for CMS-1500 bill format',"Error");
				  return false;
			}		
		}
		if ($event.checked){
			this.formatCheckBox['_results'][index].checked = true;	
			this.checkedformate.push(item.id);
			this.selectedFormats.push(item);
		}
		else {
			this.formatCheckBox['_results'][index].checked = false;	
			this.checkedformate = this.checkedformate.filter((m) => m != item?.id);
			this.selectedFormats= this.selectedFormats.filter((m) => {m.id != item?.id;});
		}
}
	/**
	 * delete a row from table
	 * @param row
	 */
	deleteVisitList(row) {
		if (this.visitList.length > 1) {
			this.visitList = this.visitList.filter((m) => m['id'] != row.id);
			this.page.totalElements = this.visitList.length;
		}
		this.calculateTotalAmout();
	}
	/**
	 * delete a row from cpt List
	 * @param row
	 */
	deleteCptList(row, index1, mainrow) {
		if (row) {
			// this.multiplefeerecords = this.multiplefeerecords.filter(m => {
			// 	let result = m.find(x => {
			// 		return x.visit_id != row.visit_id
			// 	})
			// 	return result
			// })
			let mainrowindex:any;
			if(!(mainrow['rowIndex'] == undefined || mainrow['rowIndex'] == null)){
				mainrowindex =  mainrow['rowIndex'];
			}else if(!(this.rowindex == undefined || this.rowindex == null)){
				mainrowindex =  this.rowindex;
			}
			this.visitList[mainrowindex]['cpt_fee_schedules'] =
				this.visitList &&
				this.visitList.length != 0 &&
				this.visitList[mainrowindex]['cpt_fee_schedules'].filter((item, index) => index1 !== index);
			this.calculateVisitAmount(mainrowindex);
			this.calculateTotalAmout();
			if (this.visitList[mainrowindex]['cpt_fee_schedules'].length == 0) {
				this.visitList[mainrowindex]['isexpand'] = true;
				this.toggleExpandRow(this.visitList[mainrowindex]);
			}
		}
	}
	/**
	 * delete confirmation
	 */
	confirmDelete(row, index, mainrow) {
	
		if (index || index == 0) {
			this.customDiallogService.confirm('Delete Confirmation?', 'Do you really want to delete it?','Yes','No')
		.then((confirmed) => {
			if (confirmed){
				this.deleteCptList(row, index, mainrow);
			}else if(confirmed === false){
				
			}else{
				
			}
		})
		.catch();
	
		} else if (this.visitList.length > 1) {

			this.customDiallogService.confirm('Delete Confirmation?', 'Do you really want to delete it?','Yes','No')
		.then((confirmed) => {
			if (confirmed){
				this.deleteVisitList(row);
				this.getLatestVisitDate();
			}else if(confirmed === false){
				
			}else{
				
			}
		})
		.catch();
			
		} else if (this.visitList.length == 1) {
			this.toastrService.error('Atleast 1 visit is required', 'Error');
		}
	}

	setBillType(id,index) {
		debugger;
		switch (id) {
			case 1: {
				this.allSelectedBillToRecpitant.push({
					bill_recipient_id: this.patient.id,
					bill_recipient_type_id:id,
					document_type_ids: this.patient && this.patient.document_type_ids && this.patient.document_type_ids.length!=0?this.patient.document_type_ids:[]
				});
				break;
			}
			case 2: {
				if (this.billemployer && this.billemployer.length!=0){
				this.billemployer.forEach(emp=>{
					if (emp){
					this.allSelectedBillToRecpitant.push({
						bill_recipient_id: emp && emp.id?emp.id:null,
						bill_recipient_type_id:id,
						document_type_ids: emp['document_type_ids'],
						case_relational_id : emp?.case_employer_id
					});
					}
				});
				
			}
				break;
			}
			case 3: {
				this.billinsurances;
				if (this.billinsurances && this.billinsurances.length!=0){
				this.billinsurances.forEach(ins=>{
					if (ins){
					this.allSelectedBillToRecpitant.push({
						bill_recipient_id: ins && ins.id?ins.id:null,
						bill_recipient_type_id:id,
						document_type_ids: ins['document_type_ids'],
						case_relational_id: ins?.case_insurance_id
					});
				}
				});
			}
				break;
			}
			case 4: {
				if (this.firm_id){
				this.allSelectedBillToRecpitant.push({
					bill_recipient_id: this.firm_id,
					bill_recipient_type_id:id,
					document_type_ids: this.lawer && this.lawer.document_type_ids && this.lawer.document_type_ids.length!=0?this.lawer.document_type_ids:[]
				});
			}
				break;
			}

			
		}
	}

	getVisitLength(){
		let visitsHaveCPTCodesGreaterThan6;
		return visitsHaveCPTCodesGreaterThan6 = <any>this.visitList
			.map(function (sub) {
				return sub.cpt_fee_schedules.reduce(function (prev, cur) {
					return <any>prev + !!(<any>cur);
				}, 0);
			})
			.reduce((a, b) => a + b, 0);
	}
	submitCreateBillForm(data) {
		debugger;
		this.allSelectedBillToRecpitant = [];
		var visitsHaveCPTCodesGreaterThan6 = <any>this.visitList
			.map(function (sub) {
				return sub.cpt_fee_schedules.reduce(function (prev, cur) {
					return <any>prev + !!(<any>cur);
				}, 0);
			})
			.reduce((a, b) => a + b, 0);
	    this.selected_case_type_slug = this.visitList[0].kiosk_case.case_types.slug;
		let selected_allowed_case_type_slug=this.allowed_case_type_slugs.findIndex((case_type_slug)=>case_type_slug==this.selected_case_type_slug);
		
		let schedule_id;
		let scehedul = [];
		let iscalculated = [];
		this.visitList.forEach((element) => {
			if (element.cpt_fee_schedules) {
				element.cpt_fee_schedules.forEach((x) => {
					if (x['id'] == null) {
						iscalculated.push(x.cpt_code['name']);
					}
				});
				schedule_id = element['cpt_fee_schedules'].map((m) => m['fee_schedule_id'] == null);
				if (element['cpt_fee_schedules'].length == 0) {
					schedule_id = true;
					scehedul.push(true);
				}
			}
		});
		if (iscalculated.length) {
			this.toastrService.error(this.feeMessage + ' ' + iscalculated, 'Error');
			iscalculated = [];
			return;
		}
		if (schedule_id.length == 0 || scehedul.length) {
			this.toastrService.error('Please Add Cpt Code', 'Error');
			return;
		}
		if (data['bill_date'] == null || data['bill_date'] == '') {
			this.toastrService.error('Please add Bill Date', 'Error');
			return;
		}
		debugger;
		if (this.createbillForm.controls.bill_date.errors?.matDatepickerMin) {
			this.toastrService.error('Bill date cannot be older than the visit date.', 'Error');
			return;
		}
		if (this.createbillForm.controls.bill_date.errors?.matDatepickerMax) {
			this.toastrService.error('Bill date cannot be greater than current date.', 'Error');
			return;
		}
		if (this.icdbuttons.length < 1) {
			this.toastrService.error('Please add Diagnosis Codes', 'Error');
			return;
		}
		if(!(this.bill_type_id == ch_billing_typs_enum.e_bill)){
			if ((data['bill_recipients'] == null || data['bill_recipients'] == '')) {
				this.toastrService.error('Please add Bill To', 'Error');
				return;
			}
			if (this.patient && this.ispatient && (!this.patient.document_type_ids  ||  this.patient.document_type_ids.length==0)) {
				this.toastrService.error('Please Select Bill Format For Patient', 'Error');
				return false;
			}
			if (this.lawer && this.isLawyer && this.attorney_firm && (!this.lawer.document_type_ids || this.lawer.document_type_ids.length==0)) {
				this.toastrService.error('Please Select Bill Format For Firm Name', 'Error');
				return;
			}
			if (this.isEmployer && this.employer.length && this.billemployer.length === 0) {
				this.toastrService.error('Please Select Bill Format For Employer', 'Error');
				return;
			}
			if (this.isEmployer && this.billemployer.some(ins => ins.document_type_ids.length === 0)) {
				this.toastrService.error('Please Select Bill Format For Employer', 'Error');
				return;
			}
			if (this.isInsurance && this.insurances.length && this.billinsurances.length === 0) {
				this.toastrService.error('Please Select Bill Format For Insurance', 'Error');
				return;
			}
			if (this.isInsurance && this.billinsurances.some(ins => ins.document_type_ids.length === 0)) {
				this.toastrService.error('Please Select Bill Format For Insurance', 'Error');
				return;
			}
		}
		if(this.bill_type_id == ch_billing_typs_enum.e_bill && !this.e_insrurance){
			this.toastrService.error('Please Select Insurance', 'Error');
			return;
		}
		if(this.bill_type_id == ch_billing_typs_enum.manual_bill){
			let ids = data?.bill_recipients?.map((m) => m.id);
			this.filteredReciptsObject = this.filteredReciptsObject?.filter(function (item) {
				return ids?.indexOf(item?.id) !== -1;
			});
			let formated = this.filteredReciptsObject.map((m) => {
				if (m.id!='' || m.id!=null || m.ids !='' || m.ids!=null){
				return { bill_recipient_type_id: m.id, bill_recipient_id: m.ids };
				}
			});
			this.selectedBillTo;
			this.selectedBillTo = removeDuplicatesObject(this.selectedBillTo,'bill_recipient_type_id');
			this.selectedBillTo.forEach((billto,index)=> {
				this.setBillType(billto.bill_recipient_type_id,index);
			});
		}else{
			let reciepeint = {bill_recipient_id:this.e_insrurance?.insurance_id,bill_recipient_type_id:3,document_type_ids:[207],case_relational_id:this.e_insrurance?.id}
			this.allSelectedBillToRecpitant = [reciepeint];
		}
		let formate = {
			case_id: Array.isArray(this.caseId) ? this.caseId[0]: this.caseId,
			speciality_id: this.speciality,
			bill_date:  changeDateFormat(data['bill_date']),
			bill_amount: this.totalAmount,
			facility_location_id: this.facility_location_id,
			visit_sessions: this.visitList.map((m) => {
				return {
					id: m['id'],
					visit_charges: parseFloat(m['visit_charges'])?parseFloat(m['visit_charges']):0,
					cpt_fee_schedules: m['cpt_fee_schedules'].map((x) => {
						return {
							code_id: x.cpt_code['id'],
							base_price: x.base_price,
							fee_schedule_id: x['fee_schedule_id'],
							units: x.units,
							per_unit_price: x['per_unit_price'],
							total_charges: x.total_charges,
							modifier_ids: x['modifiers'] ? x['modifiers'].map((i) => i.id) : [],
						};
					}),
				};
			}),
			bill_recipients: this.allSelectedBillToRecpitant,
			bill_type:Number(this.bill_type_id),
			// document_type_ids: removeEmptyAndNullsFormObject(this.checkedformate),
			payer_id:(this.eBill && this.bill_type_id == ch_billing_typs_enum.e_bill)?this.e_insrurance?.payer_id:null,
			icd_code_ids: this.icdbuttons ? this.icdbuttons.map((m) => m.id) : [],
			id: this.billID ? this.billID : null,
		};
		const actualICDIds: any[] = this.icdbuttons.map(item => item.id);
		const previousICDIds: any[] = this.icdButtonsVerifyList.map(item => item.id);
		const cptActualVisits: any[] = this.visitList.map(r => {
			return r['cpt_fee_schedules'].map(s => s['code_id']);
		});
		const cptPreviousVisits: any[] = this.billingService.getBillingListing().map(r => {
			return r['cpt_fee_schedules'].map(s => s['code_id']);
		});
		const diagnosticCheck = this.sameIcdCode(actualICDIds,previousICDIds);
		const cptCheck = this.sameIcdCode(cptActualVisits[0],cptPreviousVisits[0]);
		if(!diagnosticCheck){
			formate['icd_code_ids'] = actualICDIds ? actualICDIds : [];
		}
		if(!cptCheck){
			formate['visit_sessions'] = this.visitList.map((m) => {
				return {
					id: m['id'],
					visit_charges: parseFloat(m['visit_charges'])?parseFloat(m['visit_charges']):0,
					cpt_fee_schedules: m['cpt_fee_schedules'].map((x) => {
						return {
							code_id: x.cpt_code['id'],
							base_price: x.base_price,
							fee_schedule_id: x['fee_schedule_id'],
							units: x.units,
							per_unit_price: x['per_unit_price'],
							total_charges: x.total_charges,
							modifier_ids: x['modifiers'] ? x['modifiers'].map((i) => i.id) : [],
						};
					}),
				};
			});
		}
		this.billID ? this.updateBill(formate) : this.addBill(formate);
		

	}
	/**
	 * Create Bill
	 * @param data
	 */
	addBill(data) {
		this.disableButton = true;
		this.startLoader = true;
		this.requestService
			.sendRequest(BillingEnum.billAdd, 'post', REQUEST_SERVERS.fd_api_url, data)
			.subscribe(
				(res) => {
					if(res['status']){
						if(res?.createManualBill){
							this.customDiallogService.confirm('E-Bill Validation Errors',res?.message,'Yes','No','sm','btn btn-danger',true)
							.then((confirm) =>{
							  if(confirm){
								const info = data;
								info['bill_type'] = ch_billing_typs_enum.manual_bill;
								info['payer_id'] = null;
								this.billAddApiCall(info);
							  }else{
								this.disableButton= false;
								this.startLoader = false;
							  }
							});
							this.disableButton= false;
							this.startLoader = false;
							return
						}
						this.ifResFlagFunction(res, data)
					}
					else {
						this.disableButton= false;
						this.startLoader = false;
					}
				},
				(err) => {
					this.startLoader = false;
					this.disableButton = false;
				},
			);
	}
	/**
	 * Update Bill
	 * @param data
	 */
	updateBill(data) {
		this.disableButton = true;
		this.startLoader = true;
		this.requestService
			.sendRequest(BillingEnum.billEdit, 'put', REQUEST_SERVERS.fd_api_url, data)
			.subscribe(
				(res) => {
					if(res['status']){
						if(res['status'] && res['flag']){
							this.customDiallogService.confirm('Are you sure?', res['message'],'Yes','No')
							.then((confirmed) => {
								const info = data;
								if (confirmed){
									info['notification'] = 1;
									this.billEditApiCall(info);
								}else if(confirmed === false){
									info['notification'] = 0;
									this.billEditApiCall(data);
								}else{
									this.disableButton= false;
									this.startLoader = false;
								}
							})	
						}else{
							this.toastrService.success(res?.message, 'Success',{ enableHtml: true});
							this.commonFunctionalityOfBillSaveAndUpdate(res);
						}
					}
					else {
						this.disableButton= false;
						this.startLoader = false;
					}
				},
				(err) => {
					this.disableButton = false;
					this.startLoader = false;
				},
			);
	}

	ifResFlagFunction(res, data){
		if(res['flag']){	
			this.customDiallogService.confirm('Are you sure?', res['message'],'Yes','No')
			.then((confirmed) => {
				const info = data;
				if (confirmed){
					info['notification'] = 1;
					this.billAddApiCall(info);
				}else if(confirmed === false){
					info['notification'] = 0;
					this.billAddApiCall(data);
				}else{
					this.disableButton= false;
					this.startLoader = false;
				}
			})
			return
		}else{
			this.commonFunctionalityOfBillSaveAndUpdate(res);
		}
	}

	
	setTabs(Data,kiosCase?:any) {

		this.selectedBillTo=[];
		kiosCase;
		Data.forEach((element) => {
			if (element['recipient_type_name'] == 'patient'){
			 (this.patienDocument = element);
			 this.ispatient=true;
			}
			if (element['recipient_type_name'] == 'employer') {
				if (element){
					this.employerDocument;
				 this.employerDocument.push(element);
				}
				 this.isEmployer=true;
			 } 
			if (element['recipient_type_name'] == 'attorney'){
				(this.AttorneyDocument = element);
				this.isLawyer=true;
			} 

			if(element['recipient_type_name'] == 'insurance') {
				element;
				this.InsuranceDocument = element;
				if (element){
				this.multipleInsuranceDocument.push(element);
				this.multipleInsuranceDocument= [...removeDuplicatesObject(this.multipleInsuranceDocument,'case_relational_id')];

				}
				this.isInsurance=true;
			}
		});
		!this.AttorneyDocument ? (this.isLawyer = false) : '';
		this.employerDocument= [...removeDuplicatesObject(this.employerDocument,'case_relational_id')];
	}
	/**
	 * select insurances against Insurance Recipient
	 * @param event
	 * @param insuranceid
	 */
	toBillInsurances(event, insuranceid,index,item,case_insurance_id?) {
		if (event.checked && this.filteredReciptsObject.filter((m) => m.id != insuranceid)) {
			this.insurances[index].checked=true;
			let filteredRecipts = { check: true, ids: '', id: '', name: '' };
			this.billinsurances.push({id:insuranceid,
				case_insurance_id : item?.id,
				document_type_ids:[]
			});
			if(this.case_type_slug === CaseTypeEnum.auto_insurance){
				let formatdata = {};
				let getFormatBill = this.formateData.filter(format => format.slug === bill_format_enum.NF3);
				this.insurances[index].document_type_ids = (getFormatBill?.length)?[getFormatBill[getFormatBill.length - 1].id]:[];
				formatdata = {
					data : [...getFormatBill],
					formValue : (getFormatBill?.length)?[getFormatBill[getFormatBill.length - 1].id]:[],
					label : "document_type_ids"
				}
				this.selectionOnValueChange(formatdata,'document_type_ids','Insurance',insuranceid,item)
			}else if(this.case_type_slug === CaseTypeEnum.private_health_insurance){
				let formatdata = {};
				let getFormatBill = this.formateData.filter(format => format.slug === bill_format_enum.Invoice);
				this.insurances[index].document_type_ids = (getFormatBill?.length)?[getFormatBill[getFormatBill.length - 1].id]:[];
				formatdata = {
					data : [...getFormatBill],
					formValue : (getFormatBill?.length)?[getFormatBill[getFormatBill.length - 1].id]:[],
					label : "document_type_ids"
				}
				this.selectionOnValueChange(formatdata,'document_type_ids','Insurance',insuranceid,item);
			}else if(this.case_type_slug === CaseTypeEnum.worker_compensation){
				let formatdata = {};
				let getFormatBill = this.formateData.filter(format => format.slug === bill_format_enum.FifteenHundred);
				this.insurances[index].document_type_ids = (getFormatBill?.length)?[getFormatBill[getFormatBill.length - 1].id]:[];
				formatdata = {
					data : [...getFormatBill],
					formValue : (getFormatBill?.length)?[getFormatBill[getFormatBill.length - 1].id]:[],
					label : "document_type_ids"
				}
				this.selectionOnValueChange(formatdata,'document_type_ids','Insurance',insuranceid,item);
			}
			filteredRecipts['ids'] = insuranceid;
			filteredRecipts['name'] = this.lstRecip.filter((m) => m.name == 'Insurance')[0].name;
			filteredRecipts['id'] = this.lstRecip.filter((m) => m.name == 'Insurance')[0].id;
		} else {
			this.insurances[index].checked=false;
			this.filteredReciptsObject = this.filteredReciptsObject.filter((m) => m.ids != insuranceid);
			this.billinsurances = this.billinsurances.filter((m) =>{ 
				if (m && m.case_insurance_id){
				return m.case_insurance_id != case_insurance_id;
				}
			});
		}

	}
	/**
	 * select employer against Insurance Recipient
	 * @param event
	 * @param insuranceid
	 */
	toBillEmployer(event, empid,index,item) {
		if (event.checked && this.filteredReciptsObject.filter((m) => m.id != empid)) {
			this.employer[index].checked= true;
			let filteredRecipts = { check: true, ids: '', id: '', name: '' };
			this.billemployer.push({
				id:empid,
				document_type_ids:[],
				case_employer_id: item?.pivot?.id
			});
			if(this.case_type_slug === CaseTypeEnum.corporate && !this.editBill){
				let formatdata = {};
				let getFormatBill = this.formateData.filter(format => format.slug === bill_format_enum.FifteenHundred);
				this.employer[index].document_type_ids = (getFormatBill?.length) ? [getFormatBill[getFormatBill.length - 1].id] : [];
				formatdata = {
					data : [...getFormatBill],
					formValue : (getFormatBill?.length) ? [getFormatBill[getFormatBill.length - 1].id] : [],
					label : "document_type_ids"
				}
				this.selectionOnValueChange(formatdata,'document_type_ids','Employer',empid,item);
			}
			filteredRecipts['ids'] = empid;
			filteredRecipts['name'] = this.lstRecip.filter((m) => m.name == 'Employer')[0].name;
			filteredRecipts['id'] = this.lstRecip.filter((m) => m.name == 'Employer')[0].id;
			this.filteredReciptsObject.push(filteredRecipts);
		} else {
			this.employer[index].checked= false;
			this.filteredReciptsObject = this.filteredReciptsObject.filter((m) => m.ids != empid);
			this.billemployer = this.billemployer.filter((m) =>{ 
				if (m && m.id){
				return m.case_employer_id != item?.pivot?.id;
				}
			});
		}
	}
	/**
	 * open listing
	 * @param model
	 */
	openBillPdfListing(model) {
		let ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			size: 'lg',
			windowClass: 'modal_extraDOc create-bill-modal',
		};
		this.modalReference = this.modalService.open(model, ngbModalOptions);
	}
	closeModal() {
		this.modalRef.close();
	}
	/* BELOW UN USED CODE */
	closeListingModel() {
		this.modalReference.close();
	}
	/* BELOW UN USED CODE */
	onPageChange(event) {}
	ngOnDestroy(): void {
		this.visitList = [];
		this.billingDetails = [];
		//this.multipleInsuranceDocument = [];
		this.insurances = [];
		this.employer = [];
	    //this.employerDocument = [];
		this.singleRecord = [];
		this.rowindex = null;
		unSubAllPrevious(this.subscription);
	}
	@ViewChild('myTable') table: any;
	toggleExpandRow(row, index?) {
		row['isexpand'] = !row['isexpand'];
		row['rowIndex'] = index == 0 || index ? index : row['rowIndex'];
		// row['cpt_fee_schedules'].filter(function (item) { item['data'] = row })
		this.table.rowDetail.toggleExpandRow(row);
		let row_index = this.visitList.findIndex((visit) => visit.id == row.id);
		this.rowindex = row_index;
		this.visitList.map((visit, index) => {
			if (index > row_index) {
				visit['isparentexpanded'] = row['isexpand'];
			}
		});
	}
	expandTable(row,rowIndex){
		if(row?.cpt_fee_schedules?.length>0)
			this.toggleExpandRow(row,rowIndex);
		else
		this.toastrService.error('No Record Found','Error')
	}
	
	getFeeScheduler(data,row?){
		this.billingService.getCalculatedFeeSchedule(data).subscribe((res:any)=>{
			if (res?.status) {
       // this.toastrService.success(res?.message, 'Success');
        const results = res?.result?.data || [];
        this.selection.clear();
        results.forEach((item) => {

          const feeSchedules = item?.cpt_codes.flatMap(
            (sch) => sch?.fee_schedules || []
          );
          const index = this.visitList.findIndex((vis) => vis?.id === item?.id);
          if (index > -1 && feeSchedules?.length > 0) {
		
            this.visitList[index]['cpt_fee_schedules'] = feeSchedules;
			this.visitList[index]['cpt_fee_schedules'].forEach((res:any,indexOfcpt)=>{

				let filteredVisits=feeSchedules.filter((resp:any,ind)=>res?.code_id==resp?.code_id);
				 filteredVisits = filteredVisits.map(obj => ({ ...obj, status: true }));
				this.visitList[index]['cpt_fee_schedules'][indexOfcpt]['multiplefees']=filteredVisits;
				res.hasMultiplFee=filteredVisits?.length > 1 ? true : false;
				res.fee_schedule_id = res.id;
			});
			this.visitList[index]['cpt_fee_schedules']=removeDuplicatesObject(this.visitList[index]['cpt_fee_schedules'], 'code_id');

			
            this.calculateVisitAmount(index);
			this.calculateTotalAmout();
          }
        });
      }
		},
		(error=>{
			this.startLoader=false;
		})
		)
	}
bindCptCodeName(row:any){
	let concatedName = "";
	this.visitList.forEach(item =>{
		let cpt_code = item.cpt_codes?.find(x =>x.id == row.cpt_code.id);	
		concatedName = cpt_code ? `${cpt_code?.name}-${cpt_code?.description}` : `${row?.cpt_code?.name}-${row?.cpt_code?.description}`;
	});
	return concatedName;
}
	/* BELOW UN USED CODE */
	onDetailToggle(event) {
	}
	/**
	 * API method to expand all the rows.
	 */
	/* BELOW UN USED CODE */
	expandAllRows(): void {
		this.table.rowDetail.expandAllRows();
	}
	getRowClass = (row) => {
		return {
			'expanded-row': row.isparentexpanded,
		};
	};
	idToChartId(id) {
		let _id = '' + id;
		return `0`.repeat(9 - _id.length) + _id;
	}
	/* BELOW UN USED CODE */
	getMaximumCPTCodeSelection() {
		if (this.singleRecord.cpt_fee_schedules.length >= 6) {
			return 0;
		}
		if (this.modifiersData.length + this.singleRecord.cpt_fee_schedules.length >= 6) {
			return 0;
		}
		return 'none';
	}
	onScroll(e: any){
		this.icdPage.pageNumber += 1;
		this.getICDcodes(this.searchValue, 'scrollDown', this.icdPage.pageNumber);
	}
	/* BELOW UN USED CODE */
	onScrollCpt(){
		this.cptPage.pageNumber += 1;
		this.getCptCodes(this.searchValueCpt, null,'scrollDown', this.cptPage.pageNumber);
	}
	onScrollModifier(){
		this.modifierPage.pageNumber += 1;
		this.getModifiers(this.searchValuemodifier, null,'scrollDown', this.modifierPage.pageNumber);
	}

	selectionOnValueChange($event,value,type:string,id?,item?,idx?:number,manual_selection?:boolean){
		let info = new ShareAbleFilter($event);
		let cptLength =0;
		let selectedForamtsdata:any[] = [...$event?.data];
		let  indexFor1500 = selectedForamtsdata && selectedForamtsdata.findIndex(format=>{ 
			if (format){
			return format.slug === '1500' || ( format.realObj && format.realObj['slug'] === '1500' );
			}
		});
	   if (indexFor1500 !=-1){
				if (selectedForamtsdata && (selectedForamtsdata[indexFor1500].slug ==='1500' || (selectedForamtsdata[indexFor1500]['realObj'] && selectedForamtsdata[indexFor1500]['realObj']['slug'] === '1500'))){
			let visitLength = this.getVisitLength()+cptLength;
			this.selected_case_type_slug = this.visitList[0].kiosk_case.case_types.slug;
			let selected_allowed_case_type_slug=
			this.allowed_case_type_slugs.findIndex((case_type_slug)=>case_type_slug==this.selected_case_type_slug);
			
			// if(visitLength>6){	
			// 	 selectedForamtsdata.splice(indexFor1500, 1);
			// 	 const value = selectedForamtsdata && selectedForamtsdata.map(d => d.id);
			// 	 this.updateThevalueOfSelection(type, value);
			// 	  this.toastrService.error('CPT Codes must be 6 or less for CMS-1500 bill format',"Error");
			// 	  return false;
			// }		
		}
	 }
		  
	

		switch(type) {
			case 'Patient' :{
				if(!$event?.data?.length){
					if(this.patient['document_type_ids'])
					this.patient['document_type_ids'] = [];
					this.patientSelectedValue = [];
					return;
				}
				this.patient['document_type_ids'] = info[value];
				this.patientSelectedValue = $event.data && $event.data[0] && $event.data[0]['realObj'] ? $event.data.map(t => t.realObj): $event.data ? $event.data : this.patient.document_type_with_object;
				break; 
			}
			case 'Insurance' :{
				let index = this.billinsurances.findIndex(ins=>{ 
					if (ins){
					return ins.case_insurance_id === item.id;
					}
				});
				if(!$event?.data?.length && manual_selection){
					this.insurances[idx].document_type_ids = [];
					this.insurances[idx].document_type_with_object = [];
					return;
				}
			   if (index !=-1){
					this.billinsurances[index].document_type_ids = info[value];
					this.billinsurances[index].document_type_with_object = $event.data && $event.data[0] && $event.data[0]['realObj'] ? $event.data.map(t => t.realObj): $event.data;
			   	}
				let insuranceSelectedValue = this.billinsurances.map(emp => emp.document_type_with_object);
				this.insuranceSelectedValue = [];
				 insuranceSelectedValue.forEach((res) => {
					this.insuranceSelectedValue = [...res, ...this.insuranceSelectedValue];
				 });
				break; 
			}
			case 'Lawyer' :{
				if(!$event?.data?.length){
					if(this.lawer['document_type_ids'])
					this.lawer['document_type_ids'] = [];
					this.laywerSelectedValue = [];
					return;
				}
				this.lawer['document_type_ids'] = info[value];
				this.laywerSelectedValue = $event.data && $event.data[0] && $event.data[0]['realObj'] ? $event.data.map(t => t.realObj): $event.data ? $event.data: this.lawer.document_type_with_object;
				break; 
			}
			case 'Employer' :{
				this.employer;
				if(!$event?.data?.length && manual_selection){
					this.employer[idx].document_type_ids = [];
					this.employer[idx].document_type_with_object = [];
					return;
				}
				let index = this.billemployer.findIndex(employer=>{ 
					if (employer){
					return employer.case_employer_id === item?.pivot?.id;
				}
			});
			   if (index !=-1){
					this.billemployer[index].document_type_ids = info[value];
					this.billemployer[index].document_type_with_object = $event.data && $event.data[0] && $event.data[0]['realObj'] ? $event.data.map(t => t.realObj): $event.data;
			   	}
				this.employerSelectedValue = [];
				let employerSelectedValue = this.billemployer.map(emp => emp.document_type_with_object);
				employerSelectedValue.forEach((res) => {
					this.employerSelectedValue = [...res, ...this.employerSelectedValue];
				 });
				break; 
			}

		}
		this.selectedFormats = [...this.patientSelectedValue, ...this.insuranceSelectedValue, ...this.laywerSelectedValue, ...this.employerSelectedValue];
	}

	updateThevalueOfSelection(type: string, value): void{
		switch(type) {
			case 'Patient' :{
				this.ngSelectedPatient.next({
					status: true,
					value
				});
				break; 
			}
			case 'Insurance' :{
				this.ngSelectedInsurance.next({
					status: true,
					value
				});
				break; 
			}
			case 'Firm Name' :{
				this.ngSelectedLawyer.next({
					status: true,
					value
				});
				break; 
			}
			case 'Employer' :{
				this.ngSelectedEmployee.next({
					status: true,
					value
				});
				break; 
			}

		}
	}

	sameIcdCode(arr1, arr2) {
		const set1 = new Set(arr1);
		const set2 = new Set(arr2);
		return arr1.every(item => set2.has(item)) &&
			arr2.every(item => set1.has(item))
	}

	commonFunctionalityOfBillSaveAndUpdate(res: any){
		this.disableButton = false;
		this.startLoader = false;
	   this.modalRef.close(true);
	   this.multipleInsuranceDocument=[];
	   this.AttorneyDocument=null;
	   this.patienDocument= null;
	   this.employerDocument=[];
	   this.billDeatils = res['result'] && res['result']['data'];
	   this.setTabs(this.billDeatils['bill_recipients']);
	   this.openBillPdfListing(this.documenttable);
	}

	billEditApiCall(data) {
		this.requestService
			.sendRequest(BillingEnum.billEdit, 'put', REQUEST_SERVERS.fd_api_url, data)
			.subscribe((response) => {
				if (response['status']) {
					this.toastrService.success(response?.message, 'Success',{ enableHtml: true});
					this.commonFunctionalityOfBillSaveAndUpdate(response);
				}
				else {
					this.disableButton= false;
					this.startLoader = false;
				}
			},err=>{
				this.disableButton= false;
				this.startLoader = false;
			});
	}

	billAddApiCall(data) {
		this.requestService
			.sendRequest(BillingEnum.billAdd, 'post', REQUEST_SERVERS.fd_api_url, data)
			.subscribe((response) => {
				if (response['status']) {
					this.ifResFlagFunction(response,data)
				}
				else {
					this.disableButton= false;
					this.startLoader = false;
				}
			},err=>{
				this.disableButton= false;
				this.startLoader = false;
			});
	}

	public setDocumentTypeWithObject?(document_type_ids:any[],billFormats:any[]): any[]{
		let document_type_with_object = [];
		document_type_ids.forEach(e => {
			const formatInfo = billFormats.find(format => format.id === e);
			document_type_with_object.push(formatInfo);
		});
		return document_type_with_object;
	 }
	 selectedInsurance(eInsur){
		this.e_insrurance = {...this.electronice_insurances[eInsur]};
	 }
	get bill_type_id(){
		return this.createbillForm.controls['bill_type'].value;
	}	
	billClick(ev,val,is_active){
		if(!is_active){
			ev.stopPropagation();
			this.createbillForm.controls['bill_type'].setValue('2')
			return
		}
		if(val == ch_billing_typs_enum.e_bill){
			this.eBill = this.electronice_insurances.length > 0 ? true : false;
			this.createbillForm.patchValue({
				ebill_recipients: this.filteredReciptsObject.filter((m) => m.id == 3),
			});
			this.electronice_insurances.forEach(obj =>{
				if(this.electronice_insurances.length == 1){
					this.e_insrurance = obj;
					obj['checked_radio'] = true;
				}
			});
			this.createbillForm.patchValue({
				bill_recipients:'',
			});
			this.selectedBillTo=[];
		    this.isInsurance = false;
		    this.isEmployer= false;
		    this.isLawyer = false;
		    this.ispatient= false;
		    this.billemployer= [];
			this.lawer.document_type_ids = []
			this.patient.document_type_ids = []
		    this.billinsurances= [];
			this.insurances.forEach(x =>{
				x.checked = false
			});
			this.employer.forEach(x =>{
				x.checked = false
			})
		}else{
			this.electronice_insurances.forEach(insu =>{
				insu['checked_radio'] = false;
			});
			this.e_insrurance = null;
		}
	}
	openDialogBox(message:string,title='Are you sure?'){

		return this.customDiallogService.confirm(title, message);
	}
}
