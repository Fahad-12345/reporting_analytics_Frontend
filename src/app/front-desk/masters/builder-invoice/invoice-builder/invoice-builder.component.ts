import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { addRecipientOfCase, getIdsFromArray, isArray, makeDeepCopyArray, removeDuplicatesObject, unSubAllPrevious } from '@shared/utils/utils.helpers';
import { ParamQuery, OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { BillingRecipientUrlsEnum } from '@appDir/front-desk/masters/billing/billing-master/Billing-Recipient.Enum';
import { DatePipeFormatService } from './../../../../shared/services/datePipe-format.service';
import { ShippingUrlsEnum } from './../../billing/invoice/shipping/shipping-urls-enum';
import { NgxDataTable } from './../../../../shared/modules/ngx-datatable-custom/models/deliveries-ngx-datatable.models';
import { NgSelectShareableComponent } from './../../../../shared/ng-select-shareable/ng-select-shareable.component';
import { AbstractControl, Validators } from '@angular/forms';
import { Input, ChangeDetectorRef, Component, OnInit, ViewChild, ViewChildren, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Router, ActivatedRoute } from '@angular/router';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { InvoiceBuilder } from '../invoice-builder.model';
import { Location } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RequestService } from '@appDir/shared/services/request.service';
import { ToastrService } from 'ngx-toastr';
import { InvoiceBuilderEnumURLs } from '../invoice-builder-enum-urls';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { changeDateFormat, removeEmptyAndNullsFormObject } from '@appDir/shared/utils/utils.helpers';
import { Subject, Subscription, map } from 'rxjs';
import { EnumApiPath } from '@appDir/front-desk/billing/Models/searchedKeys-modal';
import { ShareAbleFilter } from '@appDir/shared/models/share-able-filter';
import { MappingFilterObject, MappingFilterShareableObject } from '@appDir/shared/filter/model/mapping-filter-object';
import { HttpSuccessResponse, StorageData } from '@appDir/pages/content-pages/login/user.class';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import * as _ from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { TaxUrlsEnum } from './../../billing/invoice/tax/tax-urls-enum';
import { InventoryEnumUrls } from './../../billing/invoice/inventory/inventory-enum-urls';
import { NgSelectComponent } from '@ng-select/ng-select';
import { InvoiceToModel } from './invoice-builder.model';
import { isThisISOWeek } from 'date-fns';
import { T } from '@angular/cdk/keycodes';
import { InvoiceBuilderService } from '../invoice-builder.service';
import { InvoiceService } from '@appDir/invoice/shared/invoice.service';
import { env, eventNames } from 'process';
import { GetMaximumQuantityDirective } from '../get-maximum-quantity.directive';
import { InsuranceUrlsEnum } from '../../billing/insurance-master/Insurance/insurance-list/Insurance-Urls-enum';
import { EmployerUrlsEnum} from '@appDir/front-desk/caseflow-module/case-insurance/employer/Employer-Urls-Enum'
import { FirmUrlsEnum } from '../../billing/attorney-master/firm/Firm-Urls-enum';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
@Component({
  selector: 'app-invoice-builder',
  templateUrl: './invoice-builder.component.html',
  styleUrls: ['./invoice-builder.component.scss']
})
export class InvoiceBuilderComponent extends PermissionComponent implements OnInit,OnDestroy {
  @ViewChild('chartidNgSelect') chartidNgSelect: NgSelectShareableComponent;
  @ViewChild('inventorySelect0') inventorySelect0: NgSelectShareableComponent;
  @ViewChild('CaseIdNgSelect') CaseIdNgSelect: NgSelectShareableComponent;
  @ViewChild('BillIdNgSelect') BillIdNgSelect: NgSelectShareableComponent;
  @ViewChild('patientIdNgSelect') patientIdNgSelect: NgSelectShareableComponent;
  @ViewChild('invoiceToSelect') invoiceToSelect: NgSelectShareableComponent;
  @ViewChild('invoiceToPatientNgSelect') invoiceToPatientNgSelect: NgSelectShareableComponent;
  @ViewChild('invoiceToFirmNgSelect') invoiceToFirmNgSelect: NgSelectShareableComponent;
  @ViewChild('invoiceToInsuranceNgSelect') invoiceToInsuranceNgSelect: NgSelectShareableComponent;
  @ViewChild('invoiceToEmployerNgSelect') invoiceToEmployerNgSelect: NgSelectShareableComponent;
  @ViewChild('InvoiceBuilderBillPatientReciptient') invoiceBuilderBillPatientReciptient: NgSelectShareableComponent;
  @ViewChild('InvoiceBuilderBillInsuranceeciptient') invoiceBuilderBillInsuranceeciptient: NgSelectShareableComponent;
  @ViewChild('invoiceBuilderBillFirmReciptient') invoiceBuilderBillFirmReciptient: NgSelectShareableComponent;
  @ViewChild('InvoiceBuilderBillEmployerreciptient') invoiceBuilderBillEmployerreciptient: NgSelectShareableComponent;
  @ViewChild('specialityDetails') specialityDetails: NgSelectShareableComponent;
  @ViewChild('shippingNgSelect') shippingNgSelect: any;
  @ViewChild('taxNgSelect') taxNgSelect: any;
  @ViewChild('ngxdatatablesInvoiceBuilder') inventoryDataTable: NgxDataTable;
  @ViewChild('invoiceType') invoiceTypeCompoent: NgSelectShareableComponent;
  @ViewChildren('select') inventorySelect: NgSelectComponent[];
  @ViewChild('invoiceTable') invoiceTable: DatatableComponent;
  @Input() disabledFields: boolean = true;
  @Input() invoice_type:string='';
  @Input() isMaster: boolean = false;
  @Output() refreshComponent = new EventEmitter();
  @Output() updateInvoice = new EventEmitter();
  @Output() onCanceled= new EventEmitter();
  @Output() unselectbills = new EventEmitter();

  disableFieldInvoiceType: boolean = false;
  Date_of_service: any[] = [];
  public loadData: Promise<boolean>;
  public loadSpin: boolean = false;
  public sanitizer: DomSanitizer;
  inventories: any[] = [];
  shippings: any[] = [];
  taxes: any[] = [];
  public dateChange: boolean = false;
  isLoading = false;
  public startDate: Date = new Date();
  public endDate: Date;
  public InvoiceBuilderForm: FormGroup;
  invoiceToHit: any;
  mainAPIHit: any;
  selectedTax: string = '';
  selectedShipping: string = '';
  invoiceTo = '1';
  //Invoice To
  InvoiceToPatient: any[] = [];
  InvoiceToAttorneisLoc: any[] = [];
  submitted=false;
  InvoiceToEmployers: any[] = [];
  InvoiceToInsurencesLoc: any[] = [];
  invoiceTolbl = '';
  allEmployers:any=[];
  speclityParams:any={};
  speciality_details:any[]=[];
  allInsurances:any=[];
  allFirms:any=[]
  invoiceToInsuranceLocation: Boolean = false;
  invoiceToFirmLocation: Boolean = false;
  invoiceToEmployer: Boolean = false;
  invoiceToPatient: Boolean = false;
  invoiceToLblName = '';
  invoiceTolblId = '';
  firmName:'';
  invoceTodetails: any;
  invoiceToDetailsData: any[] = [];
  invoice_to_list = [{ id: 1, name: 'Attorney' }, { id: 2, name: 'Insurance' }, { id: 3, name: 'Patient' }, { id: 4, name: 'Employer' }];
  invoice_to_list1: any;
  subscription: Subscription[] = [];
  controlsOfRecipient: string[] = ['other_recipient', 'address', 'city', 'state','zip','phone_no'];
  invoice_to = ['is_enable_invoice_to_name', 'is_enable_invoice_to_phone_number', 'is_enable_invoice_to_address'];
  patient_details = ['is_enable_chart_id', 'is_enable_bill_id', 'is_enable_patient_name', 'is_enable_dob', 'is_enable_date_of_loss', 'is_enable_date_of_service', 'is_enable_claim_number'];
  provider = ['is_enable_p_tax_identification_number', 'is_enable_p_address', 'is_enable_p_phone_number', 'is_enable_p_fax_number', 'is_enable_p_email'];
  hasId = false;
  htmlData: SafeHtml;
  inventory_added = [];
  @Input() templateId: string;
  @Input() comingFrom: string;
  public invoice_name: string;
  public invoicebuilder = new InvoiceBuilder();
  EnumApiPath = EnumApiPath;
  billSubject: Subject<any> = new Subject<any>();
  caseIdSubject: Subject<any> = new Subject<any>();
  chartIdSubject: Subject<any> = new Subject<any>();
  patientIdSubject: Subject<any> = new Subject<any>();
  invoiceToSubject: Subject<any> = new Subject<any>();
  InvoiceTofirmLocSubject: Subject<any> = new Subject<any>();
  InvoiceToPatientSubject: Subject<any> = new Subject<any>();
  invoiceToInsuranceLocSubject: Subject<any> = new Subject<any>();
  invoiceToEmployerSubject: Subject<any> = new Subject<any>();
  @Input() invoice_from_bill: boolean = false;
  @Input() caseId:any;
  @Input() invoice_id:any;
  employers:any=[]
  selectedMultipleFieldFiter: any = {
    'facility_ids': [],
    'attorney_ids': [],
    'bill_ids': [],
    'chart_id': [],
    'case_id': [],
    'patient_id': [],
    'case_type_ids': [],
    'doctor_ids': [],
    'inventory_ids': [],
    'shipping_id': [],
    'tax_id': [],
    'facility_location_ids': [],
    'practice_location_id':[]
  };
  requestServerpath = REQUEST_SERVERS;
  billRecipatantTypes: any[] = [];
  eventsSubject: Subject<any> = new Subject<any>();
  currentMappingValue = 2;
  patientServicesDetails: any = [];
  allInventories=[];
  inventoryTotal: number = 0;
  case:any={};
  isInventorySelected: Boolean = false;
  taxValue: any;
  isOtherSelected:boolean=false;
  inventoryTax = Number('0.00');
  selectTaxAmount: number = 0;
  inventoryTaxChange: Boolean = false;
  shipping: number = 0;
  shippingChange: Boolean = false;
  insuranceUrlsEnum=InsuranceUrlsEnum;
  employerUrls=EmployerUrlsEnum;
  firmUrlsEnum=FirmUrlsEnum
  defaultQuantity: number = 1;
  @Input() dontShowToggle: Boolean = false;
  public practiceLocationDetails: any;
  ColumnMode = ColumnMode;
  inventory_description_obj = {};
  shippingValue: any;
  @Input() selectedBills: any[] = [];
  @Input() invoiceData={};
  event:any={}
  @Input() selectedFacilityId: any;
  @Input() isUnitButtonEnable:boolean=false;
  conditionalExtraApiParams:any={};
  invoiceDetailsForBills: any ={};
  selectedBillReciptant: any[] = [];
  invoiceId: number;
  customCurrencyMaskConfigTax = {
		align: 'left',
		allowNegative: false,
		allowZero: true,
		decimal: '.',
		precision: 3,
		prefix: '',
		suffix: '',
		thousands: ',',
		nullable: true,
	};
  customCurrencyMaskConfig = {
		align: 'left',
		allowNegative: false,
		allowZero: true,
		decimal: '.',
		precision: 2,
		prefix: '',
		suffix: '',
		thousands: ',',
		nullable: true,
	};
  customCurrencyMaskConfigAmountDue = {
		align: 'left',
		allowNegative: false,
		allowZero: true,
		decimal: '.',
		precision: 2,
		prefix: '',
		suffix: '',
		thousands: ',',
		nullable: true,
	};
  @Input() isEdit:boolean = false;
  @ViewChild(GetMaximumQuantityDirective) getMaxQuantity;
  reorderCols: any[] = [];
  cols: any[] = [];
  constructor(private fb: FormBuilder,
    public commonService: DatePipeFormatService,
    private customDiallogService: CustomDiallogService,
    private invoiceBuilderService: InvoiceBuilderService,
    private invoiceService:InvoiceService,
    private localStorage: LocalStorage,
    private storageData: StorageData,
    public route: ActivatedRoute, private CanDeactivateModelComponentService: CanDeactivateModelComponentService, private location: Location, protected requestService: RequestService,
     private modalService: NgbModal, private toastrService: ToastrService, public aclService: AclService, private rou: Router, public cdr: ChangeDetectorRef) {
    super(aclService, rou);
    this.createInvoiceBuilderForm();
    this.invoicebuilder = new InvoiceBuilder();
  }


  ngOnChanges(){
    this.InvoiceBuilderForm.controls['invoice_template_id'].setValue(this.templateId);
    this.isMaster ? this.disableFieldInvoiceType = false : this.disableFieldInvoiceType = true;
    this.getTemplateDetails(this.templateId);
    this.updateFormDisablity(this.disabledFields);
    if (!this.invoice_from_bill) {
      this.patientServicesDetails =
        [
          { sr_no: 0, description: null, defaultQty: 1, inventory_id: null, unit_price: 0, quantity: 0, total_amount: 0, mappingValue: 1 },
        ];
        this.calculateSubTotal()
        this.isMaster ? null : this.disabledFields = false;
        this.updateFormDisablity(!this.disabledFields);
    } 
    else {
      this.selectedBills && this.selectedBills.length!=0 && this.selectedFacilityId && this.caseId
      ? this.setBillingInvoiceDetails(this.selectedBills, this.selectedFacilityId, this.caseId):null;
    }
    if (this.isEdit){
      this.setBillingInvoiceDetails([], null, this.caseId,this.invoice_id);
    }

  }
  ngOnInit() {
    this.route.queryParams
      .subscribe(params => {
        this.templateId = params['id'];
        this.isMaster = params['isMaster'];
        this.isMaster ? this.disableFieldInvoiceType = false : this.disableFieldInvoiceType = true;
        // this.invoice_from_bill = params['invoice_from_bill'] ? true : false;
        this.comingFrom = params['comingFrom'];   
     
      });
    if (this.templateId != '' && (this.templateId != null || this.templateId != undefined) && (this.comingFrom === undefined || this.comingFrom === null)) {
      this.hasId = true;
      this.getTemplateDetails(this.templateId);
      this.invoicebuilder = new InvoiceBuilder();
    }
    if (this.templateId !== '' && (this.templateId !== null || this.templateId !== undefined) && this.comingFrom === 'generate') {
      this.dontShowToggle = true;
      this.getTemplateDetails(this.templateId);
    }
    this.getShippingList({});
    this.getTaxesList({});
    this.getInventoryList({});
    this.getRecipient();
    let route=this.router.url.split("/");
    if(route && route.length>=1 && route[1]=="front-desk"){
      if(!this.isEdit){
      this.getCase(this.invoiceData);
      }
    }
    this.getInvoiceTypes();
  }
  ngAfterViewInit(){
     
  }
  setPreservedHeadersForInvoiceTable(){
    let _internalColumns:any[] = [];
           if(this.isMaster){
         _internalColumns = this.isMaster ? this.InvoiceBuilderForm.get('invoice_category_id').value == 1 ? this.localStorage.getObject('invoiceInventoryTablePreservedHeaders' + this.storageData.getUserId()) : this.localStorage.getObject('invoiceBillTablePreservedHeaders' + this.storageData.getUserId()): [];
           }
           else {
            _internalColumns = this.InvoiceBuilderForm.get('sequence').value;
            _internalColumns.push({header:'Actions',value:0});
           }
   
    if(_internalColumns?.length > 0  ){
      this.reorderCols = _internalColumns;
      this.cols = makeDeepCopyArray([...this.invoiceTable._internalColumns]);
      let groupByHeaderCol = getIdsFromArray(this.reorderCols, 'header'); // pick header
		this.cols.sort(function (a, b) {
		  return groupByHeaderCol.indexOf(a.name) - groupByHeaderCol.indexOf(b.name);
		});
		let columnsBody = makeDeepCopyArray(this.cols);
		this.invoiceTable._internalColumns = columnsBody.filter(c => {
      if(this.reorderCols.find(col=>col.header == c.name)){
        return   c 
      }
		});
		this.invoiceTable._internalColumns.sort(function (a, b) {
		  return groupByHeaderCol.indexOf(a.name) - groupByHeaderCol.indexOf(b.name);
		});
		window.dispatchEvent(new Event('resize'));
      this.cdr.detectChanges();
    }
  }
  searchForm:FormGroup;
  insurancesLocations:any=[];
  allLocations:any=[];
  changeLocation(event){
    if(event?.id){
      this.insurancesLocations.push(event);
    }else{
      
    }
  }
addInsurance(event){
  // if(event?.id){
  //   this.insurancesLocations.push(event);
  // }else{

  // }
// if(this.insurancesLocations.some(insurance=>insurance?.id==event?.id)){

// }else{
//   this.insurancesLocations.push(event);
// }
}

clearAllInsurances($event,locations){
  let locationsIds=locations?.realObj?.insurance_locations.map(location=>location?.id);
  this.insurancesLocations=this.insurancesLocations.filter(location=>!locationsIds.includes(location?.id));
}
removeRecipient(item){
  let index=this.invoiceToDetailsData.findIndex(invoice=>invoice?.id==item?.id);
  if(index>-1){
    this.invoiceToDetailsData.splice(index,1)
  }
}

changeNewLocation(event,location){
  if(event?.data?.id){
    if(event?.data?.firm_id){
      let index=this.insurancesLocations.findIndex(loca=>loca?.firm_id==event?.data?.firm_id)
      if(index>-1){
        this.insurancesLocations[index]={...event?.data,recipient_name:location?.name};
      }else{
      this.insurancesLocations.push({...event.data,bindlabelName:location?.bindlabelName,recipient_name:location?.name});
      }

    }else{
      let index=this.insurancesLocations.findIndex(loca=>loca?.insurance_id==event?.data?.insurance_id)
      if(index>-1){
        this.insurancesLocations[index]={...event?.data,recipient_name:location?.name};
      }else{
      this.insurancesLocations.push({...event.data,bindlabelName:location?.bindlabelName,recipient_name:location?.name});
      }
    }
  }else{
    if(location){
      let locationIds
      if(location?.invoice_to_label=="attorney"){
        locationIds=location?.realObj?.firm_locations.map(loc=>loc?.id);
      }else{
        locationIds=location?.realObj?.insurance_locations.map(loc=>loc?.id);
      }
      this.insurancesLocations=this.insurancesLocations.filter(loc=>!locationIds.includes(loc?.id))
    }
  }
}

removeNewLocation(event){
  if(event?.firm_id){
    let index = this.allLocations.findIndex(obj =>
      obj.realObj.firm_locations.some(childObj => childObj.id == event?.id)
    );
    if(index>-1){
      this.allLocations.splice(index,1);
      if(event?.index>-1){
        this.insurancesLocations.splice(event?.index,1);
      }
      let firmIds:any=[]
      firmIds=this.InvoiceBuilderForm.get('attorney_recipient_id').value;
      firmIds.splice(firmIds.indexOf(this.allLocations[index]?.id),1)
      this.InvoiceBuilderForm.controls['attorney_recipient_id'].setValue(firmIds);
      this.invoiceBuilderBillFirmReciptient.searchForm.controls['common_ids'].setValue(firmIds);
    }
  }
  else{
    let index = this.allLocations.findIndex(obj =>
      obj.realObj.insurance_locations.some(childObj => childObj.id == event?.id)
    );
    if(index>-1){
      this.allLocations.splice(index,1);
      if(event?.index>-1){
        this.insurancesLocations.splice(event?.index,1);
      }
      let insuranceIds:any=[]
      insuranceIds=this.InvoiceBuilderForm.get('insurance_recipient_id').value;
      insuranceIds.splice(insuranceIds.indexOf(this.allLocations[index]?.id),1)
      this.InvoiceBuilderForm.controls['insurance_recipient_id'].setValue(insuranceIds);
      this.invoiceBuilderBillInsuranceeciptient.searchForm.controls['common_ids'].setValue(insuranceIds);
    }
  }

}
addNewInsurance(event,type?){
  if(type=='employer_recipient_id'){
    if(event?.detail){
      this.invoiceToDetailsData.push({...event?.detail,invoice_to_label:'employer',...event?.detail,name:(event?.detail?.name?event?.detail?.name:event?.detail?.employer_name)});
    }
    else{
      this.invoiceToDetailsData.push({...event?.realObj,invoice_to_label:'employer',invoice_to_name:event?.realObj?.employer_name,...event});
    }
    let employerIds:any=[]
      employerIds=this.InvoiceBuilderForm.get('employer_recipient_id').value;
      employerIds.push(event?.id);
      this.InvoiceBuilderForm.controls['employer_recipient_id'].setValue(employerIds);
      this.invoiceBuilderBillEmployerreciptient.searchForm.controls['common_ids'].setValue(employerIds);
  }
  else if(type=='insurance_recipient_id'){
    if(event?.detail?.case_location){
        this.invoiceToDetailsData.push({...event?.detail,...event?.detail?.case_location,invoice_to_label:'insurance',invoice_to_name:event?.name})
      }
      else if(event?.case_recipient){
        this.invoiceToDetailsData.push({event,...event?.recipient})
      }
      else {
        this.allLocations.push({...event,invoice_to_label:'insurance'})
      }
    let insuranceIds:any=[]
    insuranceIds=this.InvoiceBuilderForm.get('insurance_recipient_id').value;
    if(!(insuranceIds && insuranceIds?.length)){
      insuranceIds=[];
    }
    insuranceIds.push(event?.id);
    this.InvoiceBuilderForm.controls['insurance_recipient_id'].setValue(insuranceIds);
    this.invoiceBuilderBillInsuranceeciptient.searchForm.controls['common_ids'].setValue(insuranceIds);
  }
  else if(type=='attorney_recipient_id'){
    if(event?.detail?.case_location){
      this.invoiceToDetailsData.push({...event?.detail,...event?.detail?.case_location,invoice_to_label:'attorney',invoice_to_name:event?.name})
    }else if(!event?.realObj?.firm_locations){
        this.invoiceToDetailsData.push({...this.invoiceDetailsForBills?.case_firm?.firm_location,invoice_to_label:'attorney',invoice_to_name:event?.name,...event})
    }
    else {
      this.allLocations.push({...event,invoice_to_label:'attorney'})
    }
    let firmIds:any=[]
    firmIds=this.InvoiceBuilderForm.get('attorney_recipient_id').value;
    if(!(firmIds && firmIds?.length)){
      firmIds=[];
    }
    firmIds.push(event?.id);
    this.InvoiceBuilderForm.controls['attorney_recipient_id'].setValue(firmIds);
    this.invoiceBuilderBillFirmReciptient.searchForm.controls['common_ids'].setValue(firmIds);
  }
}

  getInsurances(){
    let param={
      filter:false,
      per_page:10,
      // page:
    }
    this.subscription.push(
      this.requestService
    .sendRequest(
      InsuranceUrlsEnum.insurance_bill_Get,
      'GET',
      REQUEST_SERVERS.fd_api_url,
      param,
    ).subscribe(res=>{

    })
    )
  }
  invoiceTypes=[]
  getInvoiceTypes(){
    this.subscription.push(
    this.requestService.sendRequest(
      EnumApiPath.Invoice_builder_Invoice_Type_Category,
      'get',
      REQUEST_SERVERS.fd_api_url,
      {},
    ).subscribe(res=>{
      if(res?.status){
        this.invoiceTypes=res?.result || []
      }
    })
    )
  }
  getCase(obj){
    let param={
      per_page:10,
      pagnination:1,
      filter:true,
      page:1,
      id:[this.caseId],
      current_location_id:obj.facility_location_ids
    }
    this.requestService
    .sendRequest(
      EnumApiPath.CaseIDApiPath,
      'get',
      REQUEST_SERVERS.fd_api_url,
      param,
    )
    .subscribe(res => {
      if(res.status){
        this.case=res.result[0];
        let params={
          formValue:res.result[0].case_id,
          label:'case_ids',
          data:{
            id:res.result[0].case_id,
            name:res.result[0].case_id,
            bindlabelName:'case_id',
            bindIdName:'case_id',
            realObj:res
          }
        }
        this.onCaseIdValueChange(params)
      }
    });
  }
 
  updateFormDisablity(status) {
    if (status) {
      this.InvoiceBuilderForm.controls['claim_number'].enable();
      this.InvoiceBuilderForm.controls['claim_number'].updateValueAndValidity();
      this.InvoiceBuilderForm.controls['date_of_birth'].enable();
      this.InvoiceBuilderForm.controls['date_of_birth'].updateValueAndValidity();
      this.InvoiceBuilderForm.controls['date_of_loss'].enable();
      this.InvoiceBuilderForm.controls['date_of_loss'].updateValueAndValidity();
      this.InvoiceBuilderForm.controls['date_of_service'].enable();
      this.InvoiceBuilderForm.controls['date_of_service'].updateValueAndValidity();
      this.InvoiceBuilderForm.controls['shiping_detail'].enable();
      this.InvoiceBuilderForm.controls['shiping_detail'].updateValueAndValidity();
      this.InvoiceBuilderForm.controls['tax_detail'].enable();
      this.InvoiceBuilderForm.controls['tax_detail'].updateValueAndValidity();

    }
    else {
      this.InvoiceBuilderForm.controls['invoice_category_id'].disable();
      this.InvoiceBuilderForm.controls['invoice_category_id'].updateValueAndValidity();
      this.InvoiceBuilderForm.controls['claim_number'].disable();
      this.InvoiceBuilderForm.controls['claim_number'].updateValueAndValidity();
      this.InvoiceBuilderForm.controls['date_of_birth'].disable();
      this.InvoiceBuilderForm.controls['date_of_birth'].updateValueAndValidity();
      this.InvoiceBuilderForm.controls['date_of_loss'].disable();
      this.InvoiceBuilderForm.controls['date_of_loss'].updateValueAndValidity();
      this.InvoiceBuilderForm.controls['date_of_service'].disable();
      this.InvoiceBuilderForm.controls['date_of_service'].updateValueAndValidity();
      this.InvoiceBuilderForm.controls['shiping_detail'].disable();
      this.InvoiceBuilderForm.controls['shiping_detail'].updateValueAndValidity();
      this.InvoiceBuilderForm.controls['tax_detail'].disable();
      this.InvoiceBuilderForm.controls['tax_detail'].updateValueAndValidity();
    }
  }

  setBillingInvoiceDetails(selectedBills, selectedFacilityId, case_id,invoice_id?) {
    if (selectedBills && selectedBills.length!=0){
    this.getVisitInformation({ bill_ids: selectedBills });
    }
    this.getTemplateDetailBill(
      removeEmptyAndNullsFormObject({
      facility_id: selectedFacilityId,
      bill_ids: selectedBills,
      case_id: case_id,
      invoice_id:invoice_id
    }));
  }



  getRecipient() {
    var paramQuery: ParamQuery = { filter: true, pagination: false, order: OrderEnum.ASC } as any;
    this.requestService
      .sendRequest(
        BillingRecipientUrlsEnum.BillingRecipient_list_GET,
        'get',
        REQUEST_SERVERS.fd_api_url,
        paramQuery,
      )
      .subscribe(res => {
        this.billRecipatantTypes = res['result']['data'];
        if(this.invoice_type!='invoice_for_bill' && !this.invoice_from_bill)
        this.billRecipatantTypes.push({id:5,name:'Other',slug:'other'})
      });


  }
  createInvoiceBuilderForm() {

    this.InvoiceBuilderForm = this.fb.group({
      id: null,
      invoice_template_id: null,
      invoice_name: [null, Validators.required],
      is_enable_current_date: [true],
      invoice_date: [null],
      is_enable_logo: [true],
      is_enable_provider: [true],
      is_enable_p_tax_identification_number: [true],
      is_enable_p_address: [true],
      is_enable_p_phone_number: [true],
      is_enable_p_fax_number: [true],
      is_enable_p_email: [true],
      facility_id: [null],
      patient_id: [null],
      case_id: [null],
      bill_ids: [[]],
      chart_id: [null],
      attorney_ids: [null],
      doctor_ids: [null],
      inventory_ids: [null],
      inventory_id_Selected:[null],
      shipping_id: [null],
      tax_id: [null],
      invoice_to: [[]],
      facility_location_ids: [null],
      is_enable_invoice_to: [true],
      is_enable_invoice_to_name: [true],
      is_enable_invoice_to_phone_number: [true],
      is_enable_invoice_to_address: [true],
      is_enable_patient_detail: [true],
      is_enable_chart_id: [true],
      invoice_category_id: [null, Validators.required],
      is_enable_case_type: [true],
      invoice_to_slug: [[]],
      is_enable_bill_id: [true],
      is_enable_patient_name: [true],
      practice_location_id:[[]],
      is_enable_dob: [true],
      date_of_birth: [{ value: null, disabled: this.disabledFields }],

      is_enable_date_of_loss: [true],
      date_of_loss: [{ value: null, disabled: this.disabledFields }],
      is_enable_date_of_service: [true],
      date_of_service: [{ value: null, disabled: this.disabledFields }],
      dos_start: [{ value: null, disabled: this.disabledFields }],
      dos_end: [{ value: null, disabled: this.disabledFields }],
      is_enable_claim_number: [true],
      claim_number: [{ value: null, disabled: this.disabledFields }],
      is_enable_unit_price: [true],
      is_enable_quantity: [true],
      is_enable_shipping: [true],
      is_enable_tax: [true],
      shipping_cost: ['0.00'],
      amount_due: ['0.00'],
      tax_price: ['0.00'],
      is_enable_footer: [true],
      shiping_detail: [{ value: null, disabled: this.disabledFields }],
      tax_detail: [{ value: null, disabled: this.disabledFields }],
      /////// Table Toggle Fields
      is_enable_table_description:[true],
      is_enable_table_quantity:[true],
      is_enable_table_total_amount:[true],
      is_enable_table_bill_id:[true],
      is_enable_table_dos:[true],
      is_enable_table_specialty:[true],
      is_enable_table_bill_amount:[true],
      is_enable_table_paid_amount:[true],
      is_enable_table_outstanding_amount:[true],
      is_enable_table_over_amount:[true],
      is_enable_table_interest_amount:[true],
      is_enable_table_write_off_amount:[true],
      is_enable_table_item:[true],
      sequence:[""],
      ////
      sub_total:['0.00'],
      patient_recipient_id: [null],
      attorney_recipient_id: [null],
      insurance_recipient_id: [[]],
      employer_recipient_id: [[]],
      phone_no:[''],
      other_recipient:[''],
      address:[''],
      city:[''],
      state:[''],
      zip:[''],
      specialty_ids:[[]]
    });
  }
  getTemplateDetails(templateId: string) {
    let params = {
      id: templateId
    };
    this.loadSpin = true;
    params = removeEmptyAndNullsFormObject(params);
    this.subscription.push(this.requestService
      .sendRequest(InvoiceBuilderEnumURLs.Single_Invoice_builder_Get, 'GET', REQUEST_SERVERS.fd_api_url, params)
      .subscribe((res: HttpSuccessResponse) => {
        if (res.status) {
          let templatedetails = res.result && res.result.data ? res.result.data : {};
          this.invoice_name = res.result.data['invoice_name'];
          this.loadSpin = false;
          this.setPatchValues(templatedetails);
         
            setTimeout(() => {
              this.setPreservedHeadersForInvoiceTable();
            }, 300);
       
         
          if (this.dontShowToggle) {
            this.invoicebuilder = new InvoiceBuilder(templatedetails);
          }
        }
        else {
          this.loadSpin = true;
        }
      }));
  }
setTemplateColumnSequenceForSaveAndUpdate(){
  this.reorderCols = [];
  this.invoiceTable._internalColumns?.forEach(dtCol =>{
    this.reorderCols.push({header:dtCol.name});
  });
  if(this.isMaster){
    if(this.InvoiceBuilderForm.get('invoice_category_id').value == 1){
      this.localStorage.setObject('invoiceInventoryTablePreservedHeaders' + this.storageData.getUserId(),this.reorderCols);
    }else {
      this.localStorage.setObject('invoiceBillTablePreservedHeaders' + this.storageData.getUserId(),this.reorderCols);
    }
  }

  
  let sequence:any[] = [];
  this.invoiceTable?._internalColumns?.forEach(internalCol =>{
    if(internalCol?.name != 'Actions'){
      if((internalCol?.name == 'Bill ID' || internalCol?.name == 'Item #' )&& this.InvoiceBuilderForm?.get('is_enable_table_bill_id')?.value == true && this.invoice_from_bill){
        sequence.push({
          header:  internalCol?.name,
          value:  internalCol?.prop 
        });
      }
      if((internalCol?.name == 'Bill ID' || internalCol?.name == 'Item #' )&& this.InvoiceBuilderForm?.get('is_enable_table_item')?.value == true && !this.invoice_from_bill){
        sequence.push({
          header:  internalCol?.name,
          value:  internalCol?.prop 
        });
      }
    
      if((internalCol?.name == 'Speciality' || internalCol?.name == 'DOS') && (this.InvoiceBuilderForm.get('is_enable_table_specialty').value == true || this.InvoiceBuilderForm.get('is_enable_table_dos').value == true)){
        sequence.push({
          header:  'Description',
          value:  {spec:this.InvoiceBuilderForm.get('is_enable_table_specialty').value,dos:this.InvoiceBuilderForm.get('is_enable_table_dos').value} 
        });
      }
      if((internalCol?.name == 'Description' ) && (this.InvoiceBuilderForm.get('is_enable_table_description').value == true)){
        sequence.push({
          header:  internalCol?.name,
          value:  "description" 
        });
      }
      if((internalCol?.name == 'Unit Price'  )&& this.InvoiceBuilderForm.get('is_enable_unit_price').value == true){
        sequence.push({
          header:  internalCol?.name,
          value:  internalCol?.prop 
        });
      }
      if((internalCol?.name == 'Quantity'  )&& this.InvoiceBuilderForm.get('is_enable_table_quantity').value == true){
        sequence.push({
          header:  internalCol?.name,
          value:  internalCol?.prop 
        });
      }
      if((internalCol?.name == 'Bill Amount'  )&& this.InvoiceBuilderForm.get('is_enable_table_bill_amount').value == true){
        sequence.push({
          header:  internalCol?.name,
          value:  internalCol?.prop 
        });
      }
      if((internalCol?.name == 'Paid'  )&& this.InvoiceBuilderForm.get('is_enable_table_paid_amount').value == true){
        sequence.push({
          header:  internalCol?.name,
          value:  internalCol?.prop 
        });
      }
      if((internalCol?.name == 'Outstanding'  )&& this.InvoiceBuilderForm.get('is_enable_table_outstanding_amount').value == true){
        sequence.push({
          header:  internalCol?.name,
          value:  internalCol?.prop 
        });
      }
      if((internalCol?.name == 'Over Payment'  )&& this.InvoiceBuilderForm.get('is_enable_table_over_amount').value == true){
        sequence.push({
          header:  internalCol?.name,
          value:  internalCol?.prop 
        });
      }
      if((internalCol?.name == 'Interest'  )&& this.InvoiceBuilderForm.get('is_enable_table_interest_amount').value == true){
        sequence.push({
          header:  internalCol?.name,
          value:  internalCol?.prop 
        });
      }
      if((internalCol?.name == 'Write Off'  )&& this.InvoiceBuilderForm.get('is_enable_table_write_off_amount').value == true){
        sequence.push({
          header:  internalCol?.name,
          value:  internalCol?.prop 
        });
      }
      if((internalCol?.name == 'Total Amount'  )&& this.InvoiceBuilderForm.get('is_enable_table_total_amount').value == true){
        sequence.push({
          header:  internalCol?.name,
          value:  internalCol?.prop 
        });
      }
      
    }
  });
  this.InvoiceBuilderForm.get('sequence')?.setValue(sequence);
}
  getVisitInformation(params) {

    this.loadSpin = true;
    params = removeEmptyAndNullsFormObject(params);
    this.subscription.push(this.requestService
      .sendRequest(InvoiceBuilderEnumURLs.Invoice_builder_get_bill_visitSession, 'GET', REQUEST_SERVERS.fd_api_url, params)
      .subscribe((res: HttpSuccessResponse) => {
        if (res.status) {
          this.loadSpin = false;
          let data = res && res.result ? res.result.data : null;
          this.patientServicesDetails = data;
          this.calculateDueAmount('visitChange');
          this.practiceLocationDetails = data['facility_data'];
          this.InvoiceBuilderForm.patchValue({
            date_of_birth: data['patient_dob'],
            claim_number: data['claim_no'],
            date_of_loss: data['date_of_accident'],
            chart_id: data['patient_id'],
            case_id: data['case_id'],
            facility_id: data['facility_id'],
          });
        }
        else {
          this.loadSpin = true;
        }
      }, err => {
        this.loadSpin = false;
      }));
  }

  idToChartId(id) {
    let _id = '' + id;
    return `0`.repeat(9 - _id.length) + _id;
  }

  mapRecipatentDetailAgainstType(allBillRecipitant) {

    let reciplatentDetails: any[] = [];
    allBillRecipitant.map(recpitent => {
      reciplatentDetails.push({
        id: recpitent.bill_recipient_type_id,
        name: recpitent.recipient_type_name,
        slug: recpitent.recipient_type_slug,
        bill_recipient_id: recpitent.bill_recipient_id
      });
    });

    return reciplatentDetails;
  }
  getTemplateDetailBill(params) {
    this.loadSpin = true;
    this.subscription.push(this.requestService
      .sendRequest(InvoiceBuilderEnumURLs.Invoice_builder_get_billing_Data, 'GET', REQUEST_SERVERS.fd_api_url, params)
      .subscribe((res: HttpSuccessResponse) => {
        if (res.status && res.result) {
          this.loadSpin = false;
          let data = res && res.result ? res.result : null;
          this.invoiceDetailsForBills = data;
          let billLabelIds: any[] = [];
          let allBillRecipitant: any[] = [];
          this.invoiceDetailsForBills['chart_id'] = this.idToChartId(data['patient_id']);
          if (this.invoiceDetailsForBills['kiosk_case_practice_locations'] && this.invoiceDetailsForBills['kiosk_case_practice_locations'].length !=0){
          this.invoiceDetailsForBills['kiosk_case_practice_locations'] =  this.invoiceDetailsForBills['kiosk_case_practice_locations'].map(prac=>{
            return {...prac,
                  name: prac.practice_location_name.facility_full_qualifier     
            }
          })
        }
          if (data['dos'] && data['dos']['dos_start']) {
            this.invoiceDetailsForBills['dos']['dos_start'] = changeDateFormat(data['dos']['dos_start']);
          }
          if (data['dos'] && data['dos']['dos_end']) {
            this.invoiceDetailsForBills['dos']['dos_end'] = changeDateFormat(data['dos']['dos_end']);
          }
          this.mapRecipatentDataInfoInListing('patient', this.invoiceDetailsForBills);
          this.mapRecipatentDataInfoInListing('attorney', this.invoiceDetailsForBills);
          this.mapRecipatentDataInfoInListing('employer', this.invoiceDetailsForBills);
          this.mapRecipatentDataInfoInListing('insurance', this.invoiceDetailsForBills);
          if (this.isEdit){
            allBillRecipitant = [...this.invoiceDetailsForBills['invoice_data']['invoice_recipients']];
            let otherRecipient=allBillRecipitant.find(recipient=>recipient?.recipient_type_slug=='Other' && recipient?.invoice_to_label=='Other');
            if(otherRecipient){
              this.isOtherSelected=true;
              this.InvoiceBuilderForm.patchValue({
                other_recipient:otherRecipient?.recipient?.name,
                phone_no:otherRecipient?.recipient?.phone_no,
                address:otherRecipient?.recipient?.street_address,
                state:otherRecipient?.recipient?.state,
                city:otherRecipient?.recipient?.city,
                zip:otherRecipient?.recipient?.zip,
              });
              this.addValidationsOnAddress(true)
            }
            let specialty_ids:any[]=[]
            if(!this.invoice_from_bill){
              if(this.specialityDetails){
                this.specialityDetails.conditionalExtraApiParams = { 'case_id': this.invoiceDetailsForBills['id']};
                this.specialityDetails.selectedItemAPICallBydefault();
              }
              specialty_ids=this.invoiceDetailsForBills?.invoice_data?.speciality_ids?.split(',').map(id=>+id);
              this.specialityDetails.searchForm.controls['common_ids'].setValue(specialty_ids);
              this.formControls['specialty_ids'].setValue(specialty_ids);
              if (this.BillIdNgSelect){
                this.BillIdNgSelect.conditionalExtraApiParamsForSelectedData = { 'case_id': this.invoiceDetailsForBills['id'],specialty_ids:specialty_ids}
                this.BillIdNgSelect.conditionalExtraApiParams = { 'case_id': this.invoiceDetailsForBills['id'],specialty_ids:specialty_ids};
                this.BillIdNgSelect.selectedItemAPICallBydefault();
              if (this.invoiceDetailsForBills['invoice_data'] && this.invoiceDetailsForBills['invoice_data']['bills'] && this.invoiceDetailsForBills['invoice_data']['bills'].length!=0){
              let billIds = this.invoiceDetailsForBills['invoice_data']['bills'].map(invoice=>{return invoice.id})
              this.BillIdNgSelect.searchForm.controls['common_ids'].setValue(billIds);
              this.formControls['bill_ids'].setValue(billIds);
              }
              }
           
            }
            this.patientServicesDetails = this.invoiceDetailsForBills['invoice_data']['invoice_for_bill'] || 
            this.invoiceDetailsForBills['invoice_data']['invoice_inventory'];
        
            this.calculateSubTotal()
            this.InvoiceBuilderForm.controls['shiping_detail'].setValue(this.invoiceDetailsForBills['invoice_data']['shipping_id']);
            this.InvoiceBuilderForm.controls['tax_detail'].setValue(this.invoiceDetailsForBills['invoice_data']['tax_id']);
            if (this.invoiceDetailsForBills['invoice_data'] && this.invoiceDetailsForBills['invoice_data']['shipping_data'] &&  this.invoiceDetailsForBills['invoice_data']['shipping_data']['unit_price']){
            this.InvoiceBuilderForm.controls['shipping_cost'].setValue(this.invoiceDetailsForBills['invoice_data']['shipping_amount']);
            }
            if (this.invoiceDetailsForBills['invoice_data'] && this.invoiceDetailsForBills['invoice_data']['tax_data'] && this.invoiceDetailsForBills['invoice_data']['tax_data']['unit_price']){
                this.InvoiceBuilderForm.controls['tax_id'].setValue(this.invoiceDetailsForBills['invoice_data']['tax_id']);
                this.InvoiceBuilderForm.controls['shipping_id'].setValue(this.invoiceDetailsForBills['invoice_data']['shipping_id']);
              if(!this.invoice_from_bill && this.subTotal){
                this.InvoiceBuilderForm.controls['tax_price'].setValue(this.invoiceDetailsForBills['invoice_data']['tax_amount'])
              }else{
                this.InvoiceBuilderForm.controls['tax_price'].setValue(this.invoiceDetailsForBills['invoice_data']['tax_amount'])
              }
            }
            this.onPracticeLocationSelection({id:  this.invoiceDetailsForBills['invoice_data']['facility_location_ids']} );
            if (this.invoiceDetailsForBills['practice_location_name '] && this.invoiceDetailsForBills['practice_location_name '].length !=0){
              this.invoiceDetailsForBills['practice_location_name '] =  this.invoiceDetailsForBills['practice_location_name '].map(prac=>{
                return {...prac,
                      name: prac.facility_full_qualifier , 
                }
              })
            }
            this.invoice_from_bill=this.invoiceDetailsForBills['invoice_data']['invoice_category']==='invoice_for_bill'?true:false;
            let dos = {
              dos_start: this.invoiceDetailsForBills['invoice_data']['dos_start'] , 
              dos_end:this.invoiceDetailsForBills['invoice_data']['dos_end']
            }
            this.invoiceDetailsForBills['dos']= dos;
            this.InvoiceBuilderForm.controls['dos_start'].setValue(this.invoiceDetailsForBills['invoice_data']['dos_start']);
            this.InvoiceBuilderForm.controls['dos_end'].setValue(this.invoiceDetailsForBills['invoice_data']['dos_end']);
            this.InvoiceBuilderForm.controls['practice_location_id'].setValue(+this.invoiceDetailsForBills['invoice_data']['facility_location_ids']);
            this.InvoiceBuilderForm.controls['case_id'].setValue(this.caseId);
            let selectedReciptantTypes:any[] =[];
            this.invoiceDetailsForBills['invoice_data']['invoice_recipients'].forEach(invoice=>{
              selectedReciptantTypes.push(invoice.recipient_type_id);
              if(this.invoice_from_bill){
                this.mapEditReciptent(invoice.recipient_type_slug,invoice) 
              }
            else{
              this.invoiceToDetailsData=[...this.invoiceToDetailsData,...this.invoiceDetailsForBills['invoice_data']['invoice_recipients']];
              this.invoiceToDetailsData=this.invoiceToDetailsData.map(invoice=>{
                if(invoice?.recipient_type_slug=='firm'  && this.invoiceDetailsForBills?.case_firm?.id){
                  invoice['invoice_to_phone_no']=this.invoiceDetailsForBills?.case_firm?.firm_location?.phone;
                }
                  return{
                    ...invoice,
                    ...invoice?.recipient   
                  }
              });
              this.invoiceToDetailsData=removeDuplicatesObject(this.invoiceToDetailsData, 'id');
              this.invoiceToDetailsData=this.invoiceToDetailsData.filter(invoice=>invoice?.invoice_to_label!='Other');
              this.allEmployers=this.invoiceToDetailsData.filter(invoice=>invoice?.invoice_to_label=='Employer');
              let employerInfo=this.allEmployers.map(emp=>emp.id);
              this.allEmployers=addRecipientOfCase(this.allEmployers,this.invoiceDetailsForBills?.employerInfoReciptient,'employer')
               this.InvoiceBuilderForm.controls['employer_recipient_id'].setValue(employerInfo);
              this.allInsurances=this.invoiceToDetailsData.filter(invoice=>invoice?.invoice_to_label=='Insurance');
              let insuranceInfor=this.allInsurances.map(emp=>emp.id);
              this.allInsurances=addRecipientOfCase(this.allInsurances,this.invoiceDetailsForBills?.insuranceInfoReciptient,'insurance')
               this.InvoiceBuilderForm.controls['insurance_recipient_id'].setValue(insuranceInfor);
               this.allFirms=this.invoiceToDetailsData.filter(invoice=>invoice?.invoice_to_label=='Firm');
               if(this.invoiceToDetailsData['case_firm']?.firm){
                this.allFirms.push({
                  ...this.invoiceToDetailsData['case_firm']?.firm,
                  ...this.invoiceToDetailsData['case_firm']?.firm_location,
                })
               }
               let firmInfo=this.allFirms.map(emp=>emp.id);
               this.InvoiceBuilderForm.controls['attorney_recipient_id'].setValue(firmInfo);
            }
            });
            this.invoiceDetailsForBills['selectedReciptentTypes']=selectedReciptantTypes;
            this.InvoiceBuilderForm.controls['invoice_to'].setValue([..._.uniqBy(this.invoiceDetailsForBills['selectedReciptentTypes'])]);
            this.inventoryTotal= +this.invoiceDetailsForBills['invoice_data']['amount_due'];
            this.InvoiceBuilderForm.controls['amount_due'].setValue(+this.invoiceDetailsForBills['invoice_data']['amount_due']);
            this.invoiceDetailsForBills['bills']=this.invoiceDetailsForBills['invoice_data']['bills'];
          }
          if (data && data['bills'] && !this.isEdit){
          data['bills'].forEach(bill => {
            allBillRecipitant.push(...bill.bill_recipients);
            billLabelIds.push(bill.label_id);
          });
        
          this.selectedBillReciptant = [..._.uniqWith(
            allBillRecipitant,
            (recp1, recp2) =>
              recp1.bill_recipient_id === recp2.bill_recipient_id &&
              recp1.bill_recipient_type_id === recp1.bill_recipient_type_id
          )];

          let reciplatentDetails: any[] = [];
          reciplatentDetails = [...this.mapRecipatentDetailAgainstType(allBillRecipitant)];
          this.invoiceDetailsForBills['bill_label_ids'] = billLabelIds.join(' ,');
          this.mapSelectedReciptient(reciplatentDetails);
          }
        }
        else {
          this.loadSpin = true;
        }
      }, err => {
        this.loadSpin = false;
      }));
  }

  mapSelectedReciptient(allBillRecipitant: any[]) {
    this.invoiceDetailsForBills['selectedReciptentTypes'] = [];
    this.invoiceDetailsForBills['selectedReciptentSlugs'] = [];
    allBillRecipitant.forEach((recptient, index) => {
      this.mapRecipatentDataReciptientDetail(recptient.slug, recptient, index);
      this.invoiceDetailsForBills['selectedReciptentTypes'].push(recptient.id);
      this.invoiceDetailsForBills['selectedReciptentSlugs'].push(recptient.slug);
    });
    this.invoiceDetailsForBills['selectedReciptentSlugs'] = _.uniqBy(this.invoiceDetailsForBills['selectedReciptentSlugs']);
    this.InvoiceBuilderForm.controls['invoice_to'].setValue([..._.uniqBy(this.invoiceDetailsForBills['selectedReciptentTypes'])]);
    this.InvoiceBuilderForm.controls['invoice_to_slug'].setValue([...this.invoiceDetailsForBills['selectedReciptentSlugs']]);
  }

  mapEditReciptent(type, reciptientInfo){
    switch (type) {
      case 'patient': {
        this.InvoiceBuilderForm.controls['patient_recipient_id'].setValue(reciptientInfo.invoice_to_id);
        this.invoiceDetailsForBills;
        if (this.invoiceBuilderBillPatientReciptient) {
          this.invoiceBuilderBillPatientReciptient.searchForm.controls['common_ids'].setValue(reciptientInfo.invoice_to_id);
        }
        if (this.invoiceDetailsForBills && this.invoiceDetailsForBills.patient) {
          this.invoiceToDetailsData.push({
            invoice_to_label: 'patient',
            invoice_to_id: reciptientInfo.invoice_to_id,
            invoice_to_name: `${this.invoiceDetailsForBills['patient']['first_name']} ${this.invoiceDetailsForBills['patient']['middle_name'] ? this.invoiceDetailsForBills['patient']['middle_name'] : ''} ${this.invoiceDetailsForBills['patient']['last_name']}`,
            invoice_to_phone_no: this.invoiceDetailsForBills['patient']['cell_phone'],
            ...this.invoiceDetailsForBills && this.invoiceDetailsForBills.patient && this.invoiceDetailsForBills.patient.contact_person && this.invoiceDetailsForBills.patient.contact_person.contact_person_address ? this.invoiceDetailsForBills['patient']['contact_person']['contact_person_address'] : null
          });
        }
        break;
      }
      case 'firm': {
        this.InvoiceBuilderForm.controls['attorney_recipient_id'].setValue(reciptientInfo.invoice_to_id);
        if (this.invoiceDetailsForBills && this.invoiceDetailsForBills.case_firm) {
          if (this.invoiceBuilderBillFirmReciptient) {
            this.invoiceBuilderBillFirmReciptient.searchForm.controls['common_ids'].setValue(reciptientInfo.invoice_to_id);
          }
          this.invoiceToDetailsData.push({
            invoice_to_label: 'firm',
            invoice_to_id: reciptientInfo.invoice_to_id,
            invoice_to_name: this.invoiceDetailsForBills['case_firm']['firm']['name'],
            invoice_to_phone_no: this.invoiceDetailsForBills['case_firm']['firm_location']['cell'],
            ...this.invoiceDetailsForBills['case_firm'] && this.invoiceDetailsForBills['case_firm']['firm_location'] ? this.invoiceDetailsForBills['case_firm']['firm_location'] : null
          });
        }
        break;
      }
      case 'employer': {
        let employerInfo: any[] = this.InvoiceBuilderForm.controls['employer_recipient_id'].value;
        employerInfo.push((reciptientInfo.invoice_to_id));
        let employerDetailData: any;
        if (this.invoiceDetailsForBills && this.invoiceDetailsForBills.employerInfoReciptient) {
          this.InvoiceBuilderForm.controls['employer_recipient_id'].setValue(employerInfo);
          if (this.invoiceBuilderBillEmployerreciptient) {
            this.invoiceBuilderBillEmployerreciptient.searchForm.controls['common_ids'].setValue(employerInfo);
          }
          employerInfo.forEach(emp => {
            employerDetailData = this.invoiceDetailsForBills['employerInfoReciptient'].find(
              empDetail => empDetail.id == emp
            );
          });
        }

        this.invoiceToDetailsData.push({
          invoice_to_id: employerInfo,
          invoice_to_label: 'employer',
          invoice_to_name: employerDetailData['name'],
          invoice_to_phone_no: employerDetailData && employerDetailData['detail'] && employerDetailData['detail']['phone_no'] ? employerDetailData['detail']['phone_no'] : null,
          ...employerDetailData['detail']
        });
        break;
      }
      case 'insurance': {
        let insuranceInfo: any[] = this.InvoiceBuilderForm.controls['insurance_recipient_id'].value;
        let insuranceDetailData: any;
        insuranceInfo.push((reciptientInfo.invoice_to_id));
        this.InvoiceBuilderForm.controls['insurance_recipient_id'].setValue(insuranceInfo);
        if (this.invoiceBuilderBillInsuranceeciptient) {
          this.invoiceBuilderBillInsuranceeciptient.searchForm.controls['common_ids'].setValue(insuranceInfo);
        }
        if (this.invoiceDetailsForBills && this.invoiceDetailsForBills['insuranceInfoReciptient']) {
          insuranceInfo.forEach(ins => {
            insuranceDetailData = this.invoiceDetailsForBills['insuranceInfoReciptient'].find(
              insDetail => insDetail.id == ins
            );
          });
        }
        this.invoiceToDetailsData.push({
          invoice_to_label: 'insurance',
          invoice_to_id: insuranceInfo,
          invoice_to_name: insuranceDetailData['name'],
          invoice_to_phone_no: insuranceDetailData && insuranceDetailData['detail'] && insuranceDetailData['detail']['case_location'] && insuranceDetailData['detail']['case_location']['phone_no'] ? insuranceDetailData['detail']['case_location']['phone_no'] : null,
          ...insuranceDetailData['detail']['case_location']
        });
        break;
      }
    }
  }

  mapRecipatentDataReciptientDetail(type, reciptientInfo, index) {
    let existedInvoice: any[] = [];
    existedInvoice = this.invoiceToDetailsData.filter(invoice => invoice.invoice_to_label === reciptientInfo.slug &&
      isArray(invoice.invoice_to_id) ? invoice.invoice_to_id.includes(reciptientInfo.bill_recipient_id) ? true : false : invoice.invoice_to_id === reciptientInfo.bill_recipient_id);
    if (existedInvoice.length === 0) {
      switch (type) {
        case 'patient': {
          this.InvoiceBuilderForm.controls['patient_recipient_id'].setValue(reciptientInfo.bill_recipient_id);
          this.invoiceDetailsForBills;
          if (this.invoiceBuilderBillPatientReciptient) {
            this.invoiceBuilderBillPatientReciptient.searchForm.controls['common_ids'].setValue(reciptientInfo.bill_recipient_id);
          }
          if (this.invoiceDetailsForBills && this.invoiceDetailsForBills.patient) {
            this.invoiceToDetailsData.push({
              invoice_to_label: 'patient',
              invoice_to_id: reciptientInfo.bill_recipient_id,
              invoice_to_name: `${this.invoiceDetailsForBills['patient']['first_name']} ${this.invoiceDetailsForBills['patient']['middle_name'] ? this.invoiceDetailsForBills['patient']['middle_name'] : ''} ${this.invoiceDetailsForBills['patient']['last_name']}`,
              invoice_to_phone_no: this.invoiceDetailsForBills['patient']['cell_phone'],
              ...this.invoiceDetailsForBills && this.invoiceDetailsForBills.patient && this.invoiceDetailsForBills.patient.contact_person && this.invoiceDetailsForBills.patient.contact_person.contact_person_address ? this.invoiceDetailsForBills['patient']['contact_person']['contact_person_address'] : null
            });
          }
          break;
        }
        case 'lawyer': {
          this.InvoiceBuilderForm.controls['attorney_recipient_id'].setValue(reciptientInfo.bill_recipient_id);
          if (this.invoiceDetailsForBills && this.invoiceDetailsForBills.case_firm) {
            if (this.invoiceBuilderBillFirmReciptient) {
              this.invoiceBuilderBillFirmReciptient.searchForm.controls['common_ids'].setValue(reciptientInfo.bill_recipient_id);
            }
            this.invoiceToDetailsData.push({
              invoice_to_label: 'firm',
              invoice_to_id:this.invoiceDetailsForBills['case_firm']['firm']['id'],
              invoice_to_name: this.invoiceDetailsForBills['case_firm']['firm']['name'],
              invoice_to_phone_no: this.invoiceDetailsForBills['case_firm']['firm_location']['cell'],
              ...this.invoiceDetailsForBills['case_firm'] && this.invoiceDetailsForBills['case_firm']['firm_location'] ? this.invoiceDetailsForBills['case_firm']['firm_location'] : null
            });
          }
          break;
        }
        case 'employer': {
          let employerInfo: any[] = this.InvoiceBuilderForm.controls['employer_recipient_id'].value;
          employerInfo.push((reciptientInfo.bill_recipient_id));
          let employerDetailData: any;
          if (this.invoiceDetailsForBills && this.invoiceDetailsForBills.employerInfoReciptient) {
            this.InvoiceBuilderForm.controls['employer_recipient_id'].setValue(employerInfo);
            if (this.invoiceBuilderBillEmployerreciptient) {
              this.invoiceBuilderBillEmployerreciptient.searchForm.controls['common_ids'].setValue(employerInfo);
            }
            employerInfo.forEach(emp => {
              employerDetailData = this.invoiceDetailsForBills['employerInfoReciptient'].find(
                empDetail => empDetail.id == emp
              );
            });
          }

          this.invoiceToDetailsData.push({
            invoice_to_id: employerInfo,
            invoice_to_label: 'employer',
            invoice_to_name: employerDetailData['name'],
            invoice_to_phone_no: employerDetailData && employerDetailData['detail'] && employerDetailData['detail']['phone_no'] ? employerDetailData['detail']['phone_no'] : null,
            ...employerDetailData['detail']
          });
          break;
        }
        case 'insurance': {
          let insuranceInfo: any[] = this.InvoiceBuilderForm.controls['insurance_recipient_id'].value;
          let insuranceDetailData: any;
          insuranceInfo.push((reciptientInfo.bill_recipient_id));
          this.InvoiceBuilderForm.controls['insurance_recipient_id'].setValue(insuranceInfo);
          if (this.invoiceBuilderBillInsuranceeciptient) {
            this.invoiceBuilderBillInsuranceeciptient.searchForm.controls['common_ids'].setValue(insuranceInfo);
          }
          if (this.invoiceDetailsForBills && this.invoiceDetailsForBills['insuranceInfoReciptient']) {
            insuranceInfo.forEach(ins => {
              insuranceDetailData = this.invoiceDetailsForBills['insuranceInfoReciptient'].find(
                insDetail => insDetail.id == ins
              );
            });
          }
          this.invoiceToDetailsData.push({
            invoice_to_label: 'insurance',
            invoice_to_id: insuranceInfo,
            invoice_to_name: insuranceDetailData['name'],
            invoice_to_phone_no: insuranceDetailData && insuranceDetailData['detail'] && insuranceDetailData['detail']['case_location'] && insuranceDetailData['detail']['case_location']['phone_no'] ? insuranceDetailData['detail']['case_location']['phone_no'] : null,
            ...insuranceDetailData['detail']['case_location']
          });
          break;
        }
      }
    }
    else {
      return;
    }
  }

  mapRecipatentDataInfoInListing(type, allDataInfo: any) {
    switch (type) {
      case 'patient': {
        if (allDataInfo && allDataInfo.patient) {
          this.invoiceDetailsForBills['patientInfoReciptient'] = [{
            id: allDataInfo['patient']['id'],
            name: `${allDataInfo['patient']['first_name']} ${allDataInfo['patient']['middle_name'] ? allDataInfo['patient']['middle_name'] : ''} ${allDataInfo['patient']['last_name']}`,
            detail: allDataInfo['patient']
          }];
        }
        break;
      }

      case 'attorney': {

        if (allDataInfo && allDataInfo?.case_firm && allDataInfo?.case_firm?.name) {
          this.invoiceDetailsForBills['attorneyInfoReciptient'] = [{
            id: allDataInfo['case_firm']['firm_id'],
            name: allDataInfo['case_firm']['firm']['name'],
            detail: allDataInfo['case_firm']

          }];
        }
        break;
      }

      case 'employer': {
        if (allDataInfo && allDataInfo.case_employers) {
          this.invoiceDetailsForBills['employerInfoReciptient'] = allDataInfo.case_employers.map(employer => {
            return { id: employer.id, name: employer?.employer_name || employer?.name, detail: employer };
          });
        }
        break;
      }

      case 'insurance': {
        if (allDataInfo && allDataInfo.billing_insurance) {
          this.invoiceDetailsForBills['insuranceInfoReciptient'] = allDataInfo.billing_insurance.map(ins => {
            return {
              id: ins.id, name: ins?.insurance_name || ins?.name, detail: ins
            };
          });
        }
        break;
      }

    }
  }
  setPatchValues(templatedetails) {
    this.InvoiceBuilderForm.patchValue(templatedetails);
    this.invoiceTypeCompoent.lists = templatedetails && templatedetails.invoice_category ? [templatedetails.invoice_category] : [];
    this.invoiceTypeCompoent.searchForm.controls['common_ids'].setValue(templatedetails && templatedetails.invoice_category_id ? templatedetails.invoice_category_id : null);
    this.onChangeTableType();
  }
  get formControls() {
    return this.InvoiceBuilderForm.controls;
  }
  slideToggling(event: MatSlideToggleChange, Strname: string) {
    if (Strname === 'provider') {
      if (event.checked) {
        this.provider = ['is_enable_p_tax_identification_number', 'is_enable_p_address', 'is_enable_p_phone_number', 'is_enable_p_fax_number', 'is_enable_p_email'];
      } else {
        this.provider.length = 0;
      }

      this.formControls.is_enable_p_tax_identification_number.setValue(event.checked);
      this.formControls.is_enable_p_address.setValue(event.checked);
      this.formControls.is_enable_p_phone_number.setValue(event.checked);
      this.formControls.is_enable_p_fax_number.setValue(event.checked);
      this.formControls.is_enable_p_email.setValue(event.checked);
    }
    else if (Strname === 'patientdetails') {
      this.billSubject.next(true);
      if (event.checked) {
        this.patient_details = ['is_enable_chart_id', 'is_enable_bill_id', 'is_enable_patient_name', 'is_enable_dob', 'is_enable_date_of_loss', 'is_enable_date_of_service', 'is_enable_claim_number'];
      } else {
        this.patient_details.length = 0;
      }
      this.formControls.is_enable_chart_id.setValue(event.checked);
      this.formControls.is_enable_bill_id.setValue(event.checked);
      this.formControls.is_enable_patient_name.setValue(event.checked);
      this.formControls.is_enable_dob.setValue(event.checked);
      this.formControls.is_enable_date_of_loss.setValue(event.checked);
      this.formControls.is_enable_date_of_service.setValue(event.checked);
      this.formControls.is_enable_claim_number.setValue(event.checked);
    }
    else {
      if (event.checked) {
        this.invoice_to = ['is_enable_invoice_to_name', 'is_enable_invoice_to_phone_number', 'is_enable_invoice_to_address'];
      } else {
        this.invoice_to.length = 0;

      }
      this.formControls.is_enable_invoice_to_name.setValue(event.checked);
      this.formControls.is_enable_invoice_to_phone_number.setValue(event.checked);
      this.formControls.is_enable_invoice_to_address.setValue(event.checked);
    }
  }
  ParentToggle(event: MatSlideToggleChange, parentField: string, formArray, formField: string) {

    let index = formArray.indexOf(formField);
    if (event.checked) {
      if (!formArray.includes(formField)) {
        formArray.push(formField);
      }
      if (formArray.length) {
        this.formControls[parentField].setValue(true);
      }
    }
    else {
      formArray.splice(index, 1);
      if (!formArray.length) {
        this.formControls[parentField].setValue(false);
      }
    }
  }
  allRecipients=[];
  addOtherInRecipients(invoiceToDetails,form){
    let recipients=this.invoiceToDetailsData.map((invoice:any)=>{
      if(invoice?.invoice_to_label=='patient' ){
       return {
          invoice_to_label:invoice?.invoice_to_label,
          invoice_to_id:invoice?.invoice_to_id,

        }
      }else{
        return {
          invoice_to_label:invoice?.firm_id?'firm':(invoice?.invoice_to_label??invoice?.event?.invoice_to_label),
          invoice_to_id:invoice?.firm_id || invoice?.insurance_id || invoice?.pivot?.employer_id || invoice?.employer_id || invoice?.invoice_to_id || invoice?.id || invoice?.event?.invoice_to_id,
          name:invoice?.invoice_to_name?invoice?.invoice_to_name:invoice?.name,
          phone_no:invoice?.phone_no || invoice?.phone || invoice?.invoice_to_phone,
          city:invoice?.city,
          state:invoice?.state,
          zip:invoice?.zip,
          street_address:invoice?.street_address,
        }
      }
    });
    this.allRecipients=recipients;
    this.formControls['invoice_to'].setValue([...recipients]);
    if(this.isOtherSelected){
      let otherRecipient={
        invoice_to_label:'Other',
        invoice_to_id:null,
      }
      otherRecipient['name']=form?.other_recipient;
      otherRecipient['phone_no']=form?.phone_no;
      otherRecipient['city']=form?.city;
      otherRecipient['state']=form?.state;
      otherRecipient['zip']=form?.zip;
      otherRecipient['street_address']=form?.address;
      this.formControls['invoice_to'].setValue([...this.allRecipients,otherRecipient]);
      this.allRecipients=[...this.allRecipients,otherRecipient]
    }
if(this.insurancesLocations?.length){
 let newInsurances= this.insurancesLocations.map(invoice=>{
    return {
    invoice_to_label:invoice?.firm_id?'firm':'insurance',
    invoice_to_id:invoice?.firm_id?invoice?.firm_id:invoice?.insurance_id,
    name:invoice?.recipient_name?invoice?.recipient_name:invoice?.name,
    phone_no:invoice?.phone_no || invoice?.phone || invoice?.invoice_to_phone,
    city:invoice?.city,
    state:invoice?.state,
    zip:invoice?.zip,
    street_address:invoice?.street_address
  }
  });
  this.allRecipients=[...this.allRecipients,...newInsurances];
  this.formControls['invoice_to'].setValue([...this.allRecipients]);
}
  }
  onSubmit(InvoiceBuilderForm: FormGroup) {
    if(!InvoiceBuilderForm.valid){
      this.submitted=true;
    }
    if (InvoiceBuilderForm.valid) {
      this.setTemplateColumnSequenceForSaveAndUpdate();
      if (InvoiceBuilderForm.controls['id'].value == null && !this.hasId) {
        this.add(InvoiceBuilderForm.getRawValue());
      }
      else if (this.dontShowToggle) {
        let inventoriesSelectedArr = this.patientServicesDetails.filter((inventory) => inventory.inventory_id != null);
        this.formControls['inventory_ids'].setValue([...inventoriesSelectedArr]);
        if(!this.invoice_from_bill)
        this.addOtherInRecipients(this.invoiceToDetailsData,InvoiceBuilderForm.getRawValue());
        else
        this.formControls['invoice_to'].setValue([...this.invoiceToDetailsData]);
        this.generateInvoice(InvoiceBuilderForm.getRawValue());
      }
      else {
        this.update(InvoiceBuilderForm.getRawValue());
      }
    }
    this.unselectbills.emit();
    this.invoiceService.getInvoice(InvoiceBuilderForm.value);
  }
  add(form) {
    this.subscription.push(
      this.requestService
        .sendRequest(
          InvoiceBuilderEnumURLs.Invoice_builder_List_Post,
          'POST',
          REQUEST_SERVERS.fd_api_url,
          removeEmptyAndNullsFormObject(form),
        )
        .subscribe(
          (res) => {
            this.InvoiceBuilderForm.reset();
            this.toastrService.success("Successfully Added", 'Success');
            this.isLoading = false;
            this.backClicked();
          },
          (err) => {
            this.isLoading = false;
          },
        ),
    );
  }
  onDragAndDropColumns(event:any){
 
  }
  saveInvoice(params:any) {
    if(!this.invoice_from_bill){
      params['invoice_to']=this.allRecipients;
    }
    this.subscription.push(
      this.requestService
        .sendRequest(
          InvoiceBuilderEnumURLs.Invoice_builder_Invoice_Post,
          'POST',
          REQUEST_SERVERS.fd_api_url,
          removeEmptyAndNullsFormObject(params),
        )
        .subscribe(
          (res) => {
            this.InvoiceBuilderForm.reset();
            this.toastrService.success("Successfully Added", 'Success');
            this.isLoading = false;
            this.invoiceId = res && res.result && res.result.data ? res.result.data.invoice_id : null;
            this.refreshComponent.emit(this.invoiceId)
            this.invoiceService.getInvoiceId(this.invoiceId)
          },
          (err) => {
            this.isLoading = false;
          },
        ),
    );
  }
  removeBilloptions(option){
    this.invoiceDetailsForBills.bills = [...this.invoiceDetailsForBills.bills.filter(bills => bills.id != option.id)];
    let allRecipatent: any[] = [];
    this.invoiceToDetailsData = [];
    this.InvoiceBuilderForm.controls['insurance_recipient_id'].setValue([]);
    this.InvoiceBuilderForm.controls['employer_recipient_id'].setValue([]);
    if (this.isEdit){
      this.invoiceDetailsForBills['invoice_data']['invoice_recipients'].forEach(invoice=>{
        this.mapEditReciptent(invoice.recipient_type_slug,invoice);
      });
      this.patientServicesDetails = [...this.patientServicesDetails.filter(bills => bills.bill_id != option.id)];
      this.invoice_from_bill?this.calculateDueAmount('visitChange'):null;
    }
    else {
    this.invoiceDetailsForBills.bills.forEach(recp => {
      allRecipatent.push(...recp.bill_recipients);
    });
    let reciplatentDetails: any[] = [...this.mapRecipatentDetailAgainstType(allRecipatent)];
    this.mapSelectedReciptient(reciplatentDetails);
    this.patientServicesDetails = [...this.patientServicesDetails.filter(bills => bills.bill_id != option.id)];
    this.invoice_from_bill?this.calculateDueAmount('visitChange'):null;
    let billIds = this.invoiceDetailsForBills.bills.map(bill => { return bill.id });
    this.getDOS({ bill_ids: billIds });
    }
  }

  removeBillsDetails(option) {
    if (this.invoiceDetailsForBills.bills.length > 1 ) {
     this.removeBilloptions(option);
    }
    else {
      if (this.invoice_from_bill){
      this.toastrService.error('To generate an invoice, at least one bill is required', "Error");
      }
      else{
        this.removeBilloptions(option);
      }
    }
  }
  removeBillId(option, dirrectDelete?) {
    if(this.invoiceDetailsForBills && this.invoiceDetailsForBills['bills']['length']==1){
      this.toastrService.error('To generate an invoice, at least one bill is required','Error');
      return;
    }
    if (dirrectDelete) {
      this.removeBillsDetails(option);
    }
    else {
      
      let message = '';
      if (option && option.bill_label_id){
        message = `Please note that all the visit details for bill ${option.bill_label_id} will be deleted`;
        }
        else {
          message=`Please note that all the visit details for bill ${option.label_id} will be deleted`;
        }
      this.customDiallogService.confirm('Delete Bill',message, 'Yes', 'No')
        .then((confirmed) => {
          if (confirmed) {
            this.removeBillsDetails(option);
          }
        }
        );
    }
  }

  generateInvoice(formdata) {
      let billIds: any[] = [];
      if (this.invoiceDetailsForBills['bills'] && this.invoiceDetailsForBills['bills'].length!=0){
        billIds = this.invoiceDetailsForBills['bills'].map(bill => bill.id);
      }
      let invoiceTo: any[] = [];
      this.InvoiceBuilderForm.value['invoice_to'].forEach(invoiceTodetail => {
        invoiceTodetail.invoice_to_label == 'firm' ? invoiceTodetail.invoice_to_label = 'lawyer' : invoiceTodetail.invoice_to_label;
        if(invoiceTodetail?.invoice_to_label=='Other'){
          invoiceTo.push(invoiceTodetail)
        }else{
          invoiceTo.push({
            invoice_to_label: invoiceTodetail.invoice_to_label,
            invoice_to_id: isArray(invoiceTodetail.invoice_to_id) ?
              (invoiceTodetail.invoice_to_label == 'insurance' ? invoiceTodetail.insurance_id : invoiceTodetail.id)
              : invoiceTodetail.invoice_to_id
          });
        }
      });
      if(!this.invoice_from_bill && invoiceTo.length===0 && this.allRecipients.length===0){
        this.toastrService.error('Please Select Invoice To', "Error");
        return false;
      }
      if (invoiceTo.length === 0 && this.invoice_from_bill) {
        this.toastrService.error('Please Select Invoice To', "Error");
        return false;
      }
      if (this.patientServicesDetails.length === 0) {
        this.toastrService.error('To generate an invoice, at least one bill is required', "Error");
        return false;
      }

      if ( this.invoice_from_bill && +this.InvoiceBuilderForm.value.amount_due === 0) {
        this.toastrService.error('To generate or update an invoice, bill should not be Fully Paid', "Error");
        return false;
      }
  
  
      let params = {
        invoice_to: invoiceTo,
        invoice_template_id: this.InvoiceBuilderForm.value['id'],
        invoice_date: changeDateFormat(this.startDate),
        invoice_slug: this.invoicebuilder && this.invoicebuilder.invoice_category && this.invoicebuilder.invoice_category.slug ? this.invoicebuilder.invoice_category.slug : null,
        facility_detail: this.invoiceDetailsForBills['facility_location'],
        patient_id: this.invoiceDetailsForBills['patient_id'],
        case_id: this.invoiceDetailsForBills['id'],
        bill_ids: billIds,
        chart_id: this.invoiceDetailsForBills['chart_id'],
        date_of_birth: this.invoiceDetailsForBills['patient'] && this.invoiceDetailsForBills['patient']['dob'] ? this.invoiceDetailsForBills['patient']['dob'] : null,
        date_of_loss: this.invoiceDetailsForBills['accident_information'] && this.invoiceDetailsForBills['accident_information']['accident_date'] ? this.invoiceDetailsForBills['accident_information']['accident_date'] : null,
        dos_start: this.invoiceDetailsForBills['dos'] ? `${this.invoiceDetailsForBills['dos']['dos_start']}` : null,
        dos_end: this.invoiceDetailsForBills['dos'] ? `${this.invoiceDetailsForBills['dos']['dos_end']}` : null,
        claim_number: this.invoiceDetailsForBills['claim_num'],
        amount_due: this.InvoiceBuilderForm.value.amount_due,
        data: this.patientServicesDetails,
        tax_amount:this.formControls['tax_price'] && this.formControls['tax_price'].value?this.formControls['tax_price'].value:null,
        shipping_amount:this.formControls['shipping_cost'] && this.formControls['shipping_cost'].value?this.formControls['shipping_cost'].value:null,
       
      }
      if (this.invoice_from_bill){
        params['speciality_data']= _.uniqBy(this.patientServicesDetails.map(speciality => {
          return {
            speciality_id: speciality.speciality_id,
            speciality_name: speciality.speciality_name
          }
        }), 'speciality_id');
      }
      else {
        params['facility_detail'] = this.InvoiceBuilderForm.value.facility_id;
        params['shipping_id'] = this.InvoiceBuilderForm.value.shipping_id;
        params['tax_id'] = this.InvoiceBuilderForm.value.tax_id;
        params['bill_ids'] = this.InvoiceBuilderForm.value.bill_ids;
       

        if (this.InvoiceBuilderForm.value.case_id==null || this.InvoiceBuilderForm.value.case_id==undefined ){
          this.toastrService.error('Case Id is required', "Error");
          return false;
        }
        if (this.InvoiceBuilderForm.value.case_id==null || this.InvoiceBuilderForm.value.case_id==undefined ){
          this.toastrService.error('Case Id is required', "Error");
          return false;
        }
        if (this.InvoiceBuilderForm.value.facility_id==null || this.InvoiceBuilderForm.value.facility_id==undefined ){
          this.toastrService.error('Practice is required', "Error");
          return false;
        }
        let emptyInventoryArray: any[] = [] = this.patientServicesDetails.filter(inv => inv.inventory_id === null);
        if (emptyInventoryArray.length != 0) {
          this.toastrService.error('To generate an invoice, inventory details are required', "Error");
          return false;
        }
      } 
      if(!this.invoice_from_bill){
        params['speciality_details']=this.speciality_details;
      }
      if (this.isEdit){
        // this.updateInvoice.emit(removeEmptyAndNullsFormObject(params));
        params['invoice_id'] = this.invoice_id;
        if(this.invoice_from_bill){
          if(!(params && params.facility_detail)){
            params['facility_detail']=this.practiceLocationDetails;
          }
        }
        this.saveInvoice(params);
      }
      else {
        this.saveInvoice(params);
        
      }
  
  }

  removeUnnecessaryKeys(obj) {
    Object.keys(obj).forEach((key) => (obj[key] === true || obj[key] === false) && delete obj[key]);
    return obj;
  }
  update(form) {
    if (this.invoice_name === form.invoice_name) {
      delete form.invoice_name;
    }
    this.subscription.push(
      this.requestService
        .sendRequest(
          InvoiceBuilderEnumURLs.Invoice_builder_List_Put,
          'PUT',
          REQUEST_SERVERS.fd_api_url,
          removeEmptyAndNullsFormObject(form)
        )
        .subscribe(
          (res: any) => {
            let msg;
            this.InvoiceBuilderForm.reset();
            this.toastrService.success(res.message, 'Success');
            this.isLoading = false;
            this.backClicked();
          },
          (err) => {
            this.isLoading = false;
          },
        ),
    );
  }

  onCancel() {
    if (this.InvoiceBuilderForm.dirty && this.InvoiceBuilderForm.touched) {
      this.CanDeactivateModelComponentService.canDeactivate().then(res => {
        if (res) {
          this.InvoiceBuilderForm.reset();
            this.isMaster?this.backClicked():this.onCanceled.emit(this.invoice_from_bill);
        }
        else {
          return true;
        }
      });
    }
    else {
      this.InvoiceBuilderForm.reset();
      this.isMaster?this.backClicked():this.onCanceled.emit(this.invoice_from_bill);
    }
  }
  onChangedate(event) {
    if (event.dateValue) {
      this.startDate = (new Date(event.dateValue));
      this.formControls['invoice_date'].setValue(this.startDate ? changeDateFormat(this.startDate) : null);
      this.changeStartDate();
    }
    else {
      this.startDate = null;
      this.formControls['invoice_date'].setValue(null);
      this.changeStartDate();
    }
    this.dateChange = true;
  }
  /*Change Start Date function*/
  public changeStartDate() {
    this.endDate = this.startDate;
  }
  /*Change End Date function*/
  public changeEndDate() {
    this.startDate = this.endDate;
  }
  backClicked() {
    this.templateId = '';
    this.location.back();
  }
  getChange($event: any[], fieldName: string) {
    isArray($event)?$event=$event:$event=[$event];
    if ($event && $event.length!=0) {
      this.selectedMultipleFieldFiter[fieldName] = $event.map(data => new MappingFilterObject(data.id, data.name, data.full_Name, data.facility_full_name,data.created_by_name,data.updated_by_name, data.label_id, data.insurance_name, data.employer_name));
    }
  }
  getInventoryList(queryParams) {
    this.loadSpin = true;
    queryParams['invoice_id']=this.invoice_id && !this.invoice_from_bill && this.isEdit?this.invoice_id:null;
    this.subscription.push(
      this.requestService
        .sendRequest(
          InventoryEnumUrls.Inventory_List_Get,
          'POST',
          REQUEST_SERVERS.fd_api_url,
          queryParams,
          false, true

        )
        .subscribe(
          (data: HttpSuccessResponse) => {
            if (data.status) {
              this.loadSpin = false;
              this.inventories = data.result && data.result.data ? data.result.data : [];
              this.allInventories=this.inventories;
            }
          },
          (err) => {
            this.loadSpin = false;
          },
        ),
    );
  }
  getShippingList(queryParams) {
    this.loadSpin = true;
    this.subscription.push(
      this.requestService.sendRequest(
        ShippingUrlsEnum.Shipping_List_Get,
        'POST',
        REQUEST_SERVERS.fd_api_url,
        queryParams,
        false, true
      ).subscribe((data: HttpSuccessResponse) => {
        if (data.status) {
          this.loadSpin = false;
          this.shippings = data['result'] && data['result'].data ? data['result'].data : [];        
        }
      }, (err) => {
        this.loadSpin = false;
      })
    );
  }
  onPracticeLocationSelection(event: any) {
    let body = {
      facility_location_id: event && event.id
    };
    this.subscription.push(
      this.requestService
        .sendRequest(
          InvoiceBuilderEnumURLs.Invoice_builder_facility_Location,
          'GET',
          REQUEST_SERVERS.fd_api_url,
          body
        )
        .subscribe(
          (res: HttpSuccessResponse) => {
            this.practiceLocationDetails = res.result[0];
            this.formControls['facility_id'].setValue(this.practiceLocationDetails);
          },
          (err) => {
            this.isLoading = false;
            this.formControls['facility_id'].setValue(null);
          },
        ),
    );
  }
  removeAllInsurances(event:any,type?){
    if(!event?.formValue?.length && type=='insurance_recipient_id'){
      this.allLocations=this.allLocations.filter(invoice=>invoice?.bindlabelName!="insurance_name");
      this.insurancesLocations=this.insurancesLocations.filter(invoice=>invoice?.bindlabelName!="insurance_name");
      this.invoiceToDetailsData=this.invoiceToDetailsData.filter(invoice=>invoice?.invoice_to_label!='insurance' && invoice?.invoice_to_label!='Insurance');
      this.InvoiceBuilderForm.controls['insurance_recipient_id'].setValue([]);
      this.invoiceBuilderBillInsuranceeciptient.searchForm.controls['common_ids'].setValue([]);
    }
    else if(!event?.formValue?.length && type=='employer_recipient_id'){
      this.invoiceToDetailsData=this.invoiceToDetailsData.filter(invoice=>invoice?.invoice_to_label!='employer' && invoice?.invoice_to_label!='Employer');
      this.InvoiceBuilderForm.controls['employer_recipient_id'].setValue([]);
      this.invoiceBuilderBillEmployerreciptient.searchForm.controls['common_ids'].setValue([]);
    }
    else if(!event?.formValue?.length && type=='attorney_recipient_id'){
      this.allLocations=this.allLocations.filter(invoice=>invoice?.invoice_to_label!='attorney');
      this.insurancesLocations=this.insurancesLocations.filter(invoice=>!invoice?.firm_id);
      this.invoiceToDetailsData=this.invoiceToDetailsData.filter(invoice=>invoice?.invoice_to_label!='firm' && invoice?.invoice_to_label!='Firm' && invoice?.invoice_to_label!='attorney' && invoice?.invoice_to_label!='Attorney');
      this.InvoiceBuilderForm.controls['attorney_recipient_id'].setValue([]);
      this.invoiceBuilderBillFirmReciptient.searchForm.controls['common_ids'].setValue([]);
    }
  }
  removeInsuarance(e:any,type?){
    if(type=='employer_recipient_id'){
      let index=this.invoiceToDetailsData.findIndex(res=>res?.id==e?.data?.detail?.id || res?.id==e?.data?.id);
      if(index>-1){
        if(e?.data?.invoice_to_label=='Employer' || e?.data?.invoice_to_label=='employer'){
          let employerIds:any=this.InvoiceBuilderForm.get('employer_recipient_id').value;
            if(employerIds?.includes(e?.data?.id)){
              employerIds.splice(employerIds.indexOf(e?.data?.id),1);
            this.InvoiceBuilderForm.controls['employer_recipient_id'].setValue(employerIds);
            this.invoiceBuilderBillEmployerreciptient.searchForm.controls['common_ids'].setValue(employerIds);
            }
        }
        this.invoiceToDetailsData.splice(index,1)
      }
      let employerIndex=this.allEmployers.findIndex(insurance=>insurance?.id==e?.data?.id && e?.data?.case_recipient==false)
        if(employerIndex>-1){
          this.allEmployers.splice(employerIndex,1)
        }
    }
    else if(type=='insurance_recipient_id'){
      let index=this.invoiceToDetailsData.findIndex(invoice=>invoice?.id==e?.data?.id || invoice?.id==e?.event?.id || invoice?.id==e?.detail?.id);
      if(index>-1){
        this.invoiceToDetailsData.splice(index,1);
      }else{
        let index=this.allLocations.findIndex(location=>location?.id==e?.data?.id);
        if(index>-1){
          this.allLocations.splice(index,1);
          let insuranceIndex=this.insurancesLocations.findIndex(insurance=>insurance?.insurance_id==e?.data?.id || insurance?.id==e?.data?.id);
          if(insuranceIndex>-1){
            this.insurancesLocations.splice(insuranceIndex,1)
          }
        }
      }
      if(e?.data?.invoice_to_label=='insurance' || e?.data?.invoice_to_label=='Insurance' || e?.data?.bindlabelName=="insurance_name" || e?.data?.recipient_type_slug=='insurance'){
          let insuranceIds:any=this.InvoiceBuilderForm.get('insurance_recipient_id').value;
            if(insuranceIds?.includes(e?.data?.id)){
              insuranceIds.splice(insuranceIds.indexOf(e?.data?.id),1);
            this.InvoiceBuilderForm.controls['insurance_recipient_id'].setValue(insuranceIds);
            this.invoiceBuilderBillInsuranceeciptient.searchForm.controls['common_ids'].setValue(insuranceIds);
            }
            this.invoiceBuilderBillInsuranceeciptient.removeOptionFromList(e)
        }
        let insuranceIndex=this.allInsurances.findIndex(insurance=>insurance?.id==e?.data?.id && e?.data?.case_recipient==false)
        if(insuranceIndex>-1){
          this.allInsurances.splice(insuranceIndex,1)
        }
    }
    else if(type=='attorney_recipient_id'){
      let index=this.invoiceToDetailsData.findIndex(invoice=>invoice?.id==e?.data?.id);
      if(index>-1){
        this.invoiceToDetailsData.splice(index,1)
      }else{
        let index=this.allLocations.findIndex(location=>location?.id==e?.data?.id);
        if(index>-1){
          this.allLocations.splice(index,1)
          let firmIndex=this.insurancesLocations.findIndex(firm=>firm?.firm_id==e?.data?.id || firm?.id==e?.data?.id);
          if(firmIndex>-1){
            this.insurancesLocations.splice(firmIndex,1)
          }
        }
      }
          let firmIds:any=this.InvoiceBuilderForm.get('attorney_recipient_id').value;
            if(firmIds?.includes(e?.data?.id)){
              firmIds.splice(firmIds.indexOf(e?.data?.id),1);
            this.InvoiceBuilderForm.controls['attorney_recipient_id'].setValue(firmIds);
            this.invoiceBuilderBillFirmReciptient.searchForm.controls['common_ids'].setValue(firmIds);
            }
            this.invoiceBuilderBillFirmReciptient.removeOptionFromList(e);
    }

  }
  selectionOnValueChange(e: any, Type?) {
    const info = new ShareAbleFilter(e);
    this.InvoiceBuilderForm.patchValue(removeEmptyAndNullsFormObject(info));
    this.removeElementFromRecipteint(Type, e.formValue);
    this.getChange(e.data, e.label);
    if (!e.data) {
      this.InvoiceBuilderForm.controls[Type].setValue(null);
    }
  }
  removeElementFromRecipteint(Type, value) {
    let index;
    // if (value ==null){
    // 	return;
    // } 
    switch (Type) {
      case 'patient_recipient_id':
        index = this.invoiceToDetailsData.findIndex(type => type.invoice_to_label == 'patient');
        if (index > -1) {
          this.invoiceToDetailsData.splice(index, 1);
        }
        else if (value) {
          this.mapRecipatentDataReciptientDetail('patient', { bill_recipient_id: value }, null);

        }
        break;
      case 'attorney_recipient_id':
        index = this.invoiceToDetailsData.findIndex(type => type.invoice_to_label == 'firm');
        if (index > -1) {
          this.invoiceToDetailsData.splice(index, 1);
        }
        else if (value) {
          this.mapRecipatentDataReciptientDetail('lawyer', { bill_recipient_id: value }, null);
        }
        break;
      case 'insurance_recipient_id':
        let selectedInsurance: any[] = value && value.length != 0 ? value : [];
        if (selectedInsurance.length === 0) {
          let removedInsuranceData: any[] = this.invoiceToDetailsData.filter(type => type.invoice_to_label == 'insurance');
          removedInsuranceData.forEach(data => {
            index = this.invoiceToDetailsData.findIndex(type => type.insurance_id === data.insurance_id);
            if (index > -1) {
              this.invoiceToDetailsData.splice(index, 1);
            }
          });

        }
        else {
          index = this.invoiceToDetailsData.findIndex(type => type.invoice_to_label == 'insurance' && !selectedInsurance.includes(type.insurance_id));
          if (index > -1) {
            this.invoiceToDetailsData.splice(index, 1);
          }
          else {
            let mapInsurance = this.invoiceToDetailsData.filter(type => type.invoice_to_label == 'insurance');
            let data = mapInsurance.map((ins: any) => ins.insurance_id);
            let insuranceRecipatent: any[] = _.difference(selectedInsurance, data);
            insuranceRecipatent.forEach(res => {
              this.mapRecipatentDataReciptientDetail('insurance', { bill_recipient_id: res }, null);
            });
          }
        }
        break;
      case 'employer_recipient_id':
        let selectedEmployer: any[] = value && value.length != 0 ? value : [];
        if (selectedEmployer.length === 0) {
          let removedemployerData: any[] = this.invoiceToDetailsData.filter(type => type.invoice_to_label == 'employer');
          removedemployerData.forEach(data => {
            index = this.invoiceToDetailsData.findIndex(type => type.id === data.id);
            if (index > -1) {
              this.invoiceToDetailsData.splice(index, 1);
            }
          });

        }
        else {
          index = this.invoiceToDetailsData.findIndex(type => type.invoice_to_label == 'employer' && !selectedEmployer.includes(type.id));
          if (index > -1) {
            this.invoiceToDetailsData.splice(index, 1);
          }
          else {
            let mapEmployer = this.invoiceToDetailsData.filter(type => type.invoice_to_label == 'employer');
            let data = mapEmployer.map((ins: any) => ins.id);
            let employerRecipatent: any[] = _.difference(selectedEmployer, data);
            employerRecipatent.forEach(res => {
              this.mapRecipatentDataReciptientDetail('employer', { bill_recipient_id: res }, null);
            });
          }
        }
        break;
    }


  }
  getBillsOfSpecility(queryParams){
    this.loadSpin=true;
    this.subscription.push(
      this.invoiceBuilderService.getBillsAgainstSpecility(queryParams).subscribe((res:HttpSuccessResponse)=>{
        if(res.status){
          this.loadSpin=false;
          const bills=res?.result.data || [];
          const bill_ids=bills.map(bill=>bill?.id)
          this.getDOS({bill_ids:bill_ids})
        }
      },err=>{
        this.loadSpin=false;
      }
      )
    )
  }
  onChangeSpecility(ev){
    this.BillIdNgSelect.lists=[]
    this.speciality_details=this.invoiceDetailsForBills?.speciality_details?.
      map(specility=>{
        if(ev?.formValue?.includes(specility?.id)){
          return {
            speciality_id:specility?.id,
            speciality_name:specility?.name
          }
        }
      }).filter(x=>x!=undefined);
    this.speclityParams={
      case_id:this.caseId,
      specialty_ids:ev?.formValue
    }
    let bill_ids=this.InvoiceBuilderForm.get('bill_ids').value;
    if(!bill_ids.length && this.speclityParams?.specialty_ids?.length){
      this.getBillsOfSpecility(this.speclityParams);
    }else if(!bill_ids?.length && !ev?.length){
      this.getDOS({bill_ids:[]})
    }

  }


  removeSpeciality(event){
    this.loadSpin = true;
      let  queryParams={};
      queryParams['case_id']=this.caseId;
      queryParams['specialty_ids']=[event?.data?.id]
    this.subscription.push(
      this.invoiceBuilderService.getBillsAgainstSpecility(queryParams).subscribe(
        (data: HttpSuccessResponse) => {
          if(data?.status){
            let bills=data?.result?.data || [];
            this.loadSpin=false;
            let selectedBilIds=bills?.map(selectedbill=>selectedbill?.id);
            if(this.BillIdNgSelect){
              this.BillIdNgSelect.lists=this.BillIdNgSelect?.lists.filter(bill=>!selectedBilIds.includes(bill?.id));
              let bill_ids=this.InvoiceBuilderForm.get('bill_ids').value;
              let idsToselcted=bill_ids.filter(billId=>!selectedBilIds?.includes(billId))
              this.BillIdNgSelect.searchForm.controls['common_ids'].setValue(idsToselcted);
              this.formControls['bill_ids'].setValue(idsToselcted);
            }
            
          }
        },
        (err) => {
          this.loadSpin = false;
        }
      )
    );
  }

  onBillSelection(ev) {
    let SelectedBills = ev.formValue.length;
    let params = {
      bill_ids: ev.formValue
    };
    if (ev['data']) {
      let specilityIds=this.specialityDetails.searchForm.get('common_ids').value;
        this.formControls['bill_ids'].setValue(ev.formValue);  
        let selectedBillIds=this.InvoiceBuilderForm.get('bill_ids').value; 
        if((!specilityIds?.length || selectedBillIds?.length) ||  (!specilityIds?.length && !selectedBillIds?.length))
           this.getDOS(params);
        else{
          this.getBillsOfSpecility({case_id:this.caseId,specialty_ids:specilityIds})
        }
    } else {
      this.Date_of_service.length = 0;
      this.formControls['date_of_service'].setValue(null);
    }

  }
  onChartIdSelection(event: any) {
    let getId = this.GetIdFromChartId(event && event.formValue);
    if (event.data) {
      if (this.patientIdNgSelect) {
        this.patientIdNgSelect.conditionalExtraApiParams = { 'id': getId };
        this.patientIdNgSelect.selectedItemAPICall();
        this.patientIdNgSelect.searchForm.patchValue({ common_ids: Number(getId) });
      }
      if (this.CaseIdNgSelect) {
        this.CaseIdNgSelect.conditionalExtraApiParams = { 'patient_id': getId };
        this.CaseIdNgSelect.selectedItemAPICall();
      }
      if (this.BillIdNgSelect) {
        this.conditionalExtraApiParams = { 'patient_ids': [getId] };
      //  this.BillIdNgSelect.selectedItemAPICall();
      }
      this.InvoiceBuilderForm.patchValue({ date_of_birth: this.GetFormattedDate(event['data']['realObj']['dob']) });
      this.InvoiceBuilderForm.patchValue({ patient_id: Number(getId) });
    } else {
      if (this.patientIdNgSelect) {
        this.patientIdSubject.next(true);
      }
      if (this.CaseIdNgSelect) { }
      if (this.BillIdNgSelect) { }
      this.InvoiceBuilderForm.patchValue({ date_of_birth: null });
      this.billSubject.next(true);
      this.caseIdSubject.next(true);
      this.patientIdNgSelect.conditionalExtraApiParams = {};
      this.CaseIdNgSelect.conditionalExtraApiParams = {};
      this.BillIdNgSelect.conditionalExtraApiParams = {};
      this.BillIdNgSelect.conditionalExtraApiParamsForSelectedData = {};
      
    }
  }
  GetIdFromChartId(chartId) {
    if (!chartId) return chartId;
    return chartId.replace(/[^1-9]/g, '');
  }
  GetIdFromCaseId(caseId) {
    if (!caseId) return caseId;
    return caseId.replace(/[^0-9]/g, '');
  }
  GetFormattedDate(value: string) {
    var newDate = new Date(value);
    let year = newDate.getFullYear();
    let month = (1 + newDate.getMonth()).toString().padStart(2, "0");
    let day = newDate.getDate().toString().padStart(2, "0");
    return month + "/" + day + "/" + year;
  }
  onCaseIdValueChange(event: any) {
    let caseId = this.GetIdFromCaseId(event && event.formValue);
    this.caseId=caseId;
    if (event.data) {
      this.billSubject.next(true);
      this.patientIdSubject.next(true);
      if (this.patientIdNgSelect) {
        this.patientIdNgSelect.conditionalExtraApiParams = { 'id': event['data']['realObj']['patient_id'] };
        this.patientIdNgSelect.selectedItemAPICallBydefault();
        this.patientIdNgSelect.searchForm.patchValue({ common_ids: Number(event['data']['realObj']['patient_id']) });
      }
      if (this.chartidNgSelect) {
        this.chartidNgSelect.conditionalExtraApiParams = { 'chart_id': event['data']['realObj']['patient_id'] };
        this.chartidNgSelect.selectedItemAPICall();
        this.chartidNgSelect.searchForm.patchValue({ common_ids: String(event['data']['realObj']['chart_id']) });
      }
      if(this.specialityDetails){
        this.specialityDetails.conditionalExtraApiParamsForSelectedData = { 'case_id':caseId}
        this.specialityDetails.conditionalExtraApiParams = { 'case_id': caseId};
        this.specialityDetails.selectedItemAPICallBydefault();
      }
      if (this.BillIdNgSelect) {
        this.BillIdNgSelect.conditionalExtraApiParams ={ 'case_id': caseId}
        this.BillIdNgSelect.conditionalExtraApiParamsForSelectedData ={ 'case_id': caseId}
        this.BillIdNgSelect.selectedItemAPICallBydefault();
       
      }
      if(!this.invoice_from_bill){
      this.setBillingInvoiceDetails([], null, caseId);
      }
      // this.invoiceDetailsForBills['chart_id'] = this.idToChartId(event['data']['realObj']['patient_id']);
      this.InvoiceBuilderForm.patchValue({ date_of_birth: this.GetFormattedDate(event['data']['realObj']['dob']) });
      this.InvoiceBuilderForm.patchValue({ date_of_loss: this.GetFormattedDate(event['data']['realObj']['accident_date']) });
      this.InvoiceBuilderForm.patchValue({ claim_number: event['data']['realObj']['claim_no'] });
      this.InvoiceBuilderForm.patchValue({ case_id: caseId });
      this.InvoiceBuilderForm.patchValue({ chart_id: this.GetIdFromChartId(event['data']['realObj']['chart_id']) });
      this.InvoiceBuilderForm.patchValue({ patient_id: event['data']['realObj']['patient_id'] });
    }
    else {
      if (this.patientIdNgSelect) {
        this.patientIdSubject.next(true);
        this.patientIdNgSelect.conditionalExtraApiParams = {};
      }
      if (this.chartidNgSelect) {
        this.chartIdSubject.next(true);
        this.chartidNgSelect.conditionalExtraApiParams = {};
      }
      if (this.BillIdNgSelect) {
        this.billSubject.next(true);
        this.BillIdNgSelect.conditionalExtraApiParams = {};
        this.BillIdNgSelect.conditionalExtraApiParamsForSelectedData = {};
      }
      this.InvoiceBuilderForm.patchValue({ case_id: null });
      this.InvoiceBuilderForm.patchValue({ date_of_birth: null });
      this.InvoiceBuilderForm.patchValue({ date_of_loss: null });
      this.InvoiceBuilderForm.patchValue({ claim_number: null });
    }
  }
 
  onInvoiceToRemove(ev: any) {
    if(ev?.value?.slug=='other'){
      this.isOtherSelected=false;
      this.addValidationsOnAddress(this.isOtherSelected)
      return;
    }
    if(this.invoice_from_bill){
      this.removeSelectedReciptant(ev.value.slug);
    }
    else if(!this.invoice_from_bill){
      this.onRemoveSelectedLocations(ev)
    }

  }
  onRemoveSelectedLocations(ev){
    if(ev?.value?.slug=='patient'){
          this.invoiceToDetailsData=this.invoiceToDetailsData.filter(invoice=>invoice?.invoice_to_label!='patient' && invoice?.invoice_to_label!='Patient');
    }
    if(ev?.value?.slug=='insurance'){
        this.removeAllInsurances(null,'insurance_recipient_id')
    }
    if(ev?.value?.slug=='employer'){
        this.removeAllInsurances(null,'employer_recipient_id')
    }
    if(ev?.value?.slug=='lawyer'){
        this.removeAllInsurances(null,'attorney_recipient_id')
    }
  }

  removeSelectedReciptant(type) {
    type === 'firm' ? type = 'lawyer' : type;
    switch (type) {

      case 'insurance': {
        this.InvoiceBuilderForm.controls['insurance_recipient_id'].setValue(null);
        if (this.invoiceBuilderBillInsuranceeciptient){
        this.invoiceBuilderBillInsuranceeciptient.searchForm.controls['common_ids'].setValue([...[]]);
        }
        break;
      }
      case 'lawyer': {
        this.InvoiceBuilderForm.controls['attorney_recipient_id'].setValue(null);
        if (this.invoiceBuilderBillFirmReciptient){
        this.invoiceBuilderBillFirmReciptient.searchForm.controls['common_ids'].setValue(null);
        }
        break;
      }

      case 'patient': {
        this.InvoiceBuilderForm.controls['patient_recipient_id'].setValue(null);
        if (this.invoiceBuilderBillPatientReciptient){
        this.invoiceBuilderBillPatientReciptient.searchForm.controls['common_ids'].setValue(null);
        }
        break;
      }

      case 'employer': {
        this.InvoiceBuilderForm.controls['employer_recipient_id'].setValue(null);
        if (this.invoiceBuilderBillEmployerreciptient){
        this.invoiceBuilderBillEmployerreciptient.searchForm.controls['common_ids'].setValue([...[]]);
        }
        break;
      }

      default: {
        this.invoiceBuilderBillEmployerreciptient.searchForm.controls['common_ids'].setValue([...[]]);
        this.invoiceBuilderBillPatientReciptient.searchForm.controls['common_ids'].setValue(null);
        this.invoiceBuilderBillFirmReciptient.searchForm.controls['common_ids'].setValue(null);
        this.invoiceBuilderBillInsuranceeciptient.searchForm.controls['common_ids'].setValue([...[]]);



        break;
      }

    }
  }
  handleAddressChange(event) {
    const addressComponents = event?.address_components || [];
    const addressData = addressComponents.reduce((acc, component) => {
      if (component.types.includes('locality')) {
        acc.city = component.short_name;
      } else if (component.types.includes('administrative_area_level_1')) {
        acc.state = component.short_name;
      } else if (component.types.includes('postal_code')) {
        acc.zip = component.short_name;
      }else if(component.types.includes('route')){
        acc.address=component.short_name;
      }
      return acc;
    }, {});
    this.InvoiceBuilderForm.patchValue(addressData);
  }

  addValidationsOnAddress(status){
    this.controlsOfRecipient.forEach(controlName => {
      const control: AbstractControl = this.InvoiceBuilderForm.get(controlName);
      if(status){
        if(controlName=='phone_no'){
          control.setValidators([Validators.minLength(10)]);
        }else{
        control.setValidators([Validators.required]);
        }
      }else {
        control.reset();
        control.clearValidators();
      }
      control.updateValueAndValidity();
     });
}
onKeyDown(event: KeyboardEvent) {
  const inputValue = (event.target as HTMLInputElement).value;
  if (event.key === ' ' && inputValue.trim() === '') {
      event.preventDefault(); // Prevent typing space
  }
}

  onAddInvoice($event) {
    if($event?.slug=='other'){
      this.isOtherSelected=true;
      this.addValidationsOnAddress(true)
    }
    if($event.slug=='patient'){
      let patient={
        label:"patient_recipient_id",
        formValue:this.invoiceDetailsForBills['patientInfoReciptient'][0].id,
        data:this.invoiceDetailsForBills['patientInfoReciptient'][0]
      }
      this.selectionOnValueChange(patient,'patient_recipient_id')
    }
  }
  selectedReciptant;
 
  onInvoiceToChange(ev: any) {
    if(ev?.length<1){
      this.isOtherSelected=false;
      this.addValidationsOnAddress(this.isOtherSelected)
    }
    this.InvoiceBuilderForm;
      let allInvoiceDetailData: any[] = [];
      if (ev && ev.length ===0){
        let allRecipatent = [{
          slug: 'patient'
        },
       {
        slug: 'employer'
       },
       {
        slug:'insurance'

       },
       {
        slug:'firm'
       }
      ] 
      allRecipatent.forEach(recp=>{
        this.removeSelectedReciptant(recp.slug);
      })
      }
      if(this.invoice_from_bill){
        ev.forEach(event => {
          this.invoiceToDetailsData.forEach(invoice => {
            event.slug === 'lawyer'   ? event.slug = 'firm' : event.slug = event.slug;
            if (event.slug === invoice.invoice_to_label ) {
              allInvoiceDetailData.push(invoice);
            }
          });
        });
         this.invoiceToDetailsData = [...allInvoiceDetailData];
      }
    if (this.invoice_from_bill) {
      return false;
    }
    
    if (ev.length) {
      switch (ev[ev.length - 1].name) {
        case 'Lawyer':
          this.invoiceToFirmLocation = true;
          break;
        case 'Patient':
          this.invoiceToPatient = true;
          break;
        case 'Insurance':
          this.invoiceToInsuranceLocation = true;
          break;
        case 'Employer':
          this.invoiceToEmployer = true;
          break;
      }
    }
    else {
      this.invoiceToFirmLocation = false;
      this.invoiceToPatient = false;
      this.invoiceToInsuranceLocation = false;
      this.invoiceToEmployer = false;
      if (ev && ev.length==0){
      this.invoiceToDetailsData = [];
      }
      this.InvoiceToPatient = [];
      this.InvoiceToAttorneisLoc = [];
      this.InvoiceToEmployers = [];
      this.InvoiceToInsurencesLoc = [];
      this.InvoiceTofirmLocSubject.next(true);
      this.InvoiceToPatientSubject.next(true);
      this.invoiceToInsuranceLocSubject.next(true);
      this.invoiceToEmployerSubject.next(true);
    }
}
removeRecipeitns(item,type?){
  if(item?.data){
    item=item?.data
  }else if(item?.event){
    item=item?.event
  }
  if(item?.invoice_to_label=='Employer' || item?.invoice_to_label=='employer'){
    let employerIds:any=this.InvoiceBuilderForm.get('employer_recipient_id').value;
    let index= this.invoiceToDetailsData?.findIndex(invoice=>invoice?.id==item?.id);
    if(employerIds?.length && index>-1){
      if(employerIds?.includes(item?.id)){
        employerIds.splice(employerIds.indexOf(item?.id),1);
      this.InvoiceBuilderForm.controls['employer_recipient_id'].setValue(employerIds);
      this.invoiceBuilderBillEmployerreciptient.searchForm.controls['common_ids'].setValue(employerIds);
      }
      if(index>-1)
      this.invoiceToDetailsData.splice(index,1);
    }
  }
  else if(item?.invoice_to_label=='Insurance' || item?.invoice_to_label=='insurance'){
      let insuranceIds:any=this.InvoiceBuilderForm.get('insurance_recipient_id').value;
      let index= this.invoiceToDetailsData?.findIndex(invoice=>invoice?.id==item?.id);
      if(insuranceIds?.length && index>-1){
        if(insuranceIds?.includes(item?.id)){
          insuranceIds.splice(insuranceIds.indexOf(item?.id),1);
        this.InvoiceBuilderForm.controls['insurance_recipient_id'].setValue(insuranceIds);
        this.invoiceBuilderBillInsuranceeciptient.searchForm.controls['common_ids'].setValue(insuranceIds);
        }
        if(index>-1)
       this.invoiceToDetailsData.splice(index,1);
      }
      this.invoiceBuilderBillInsuranceeciptient.removeOptionFromList(item);
    }

    if(item?.invoice_to_label=="attorney" || item?.invoice_to_label=="firm" || item?.invoice_to_label=="Firm"){
      let firmIds:any=this.InvoiceBuilderForm.get('attorney_recipient_id').value;
       let index= this.invoiceToDetailsData?.findIndex(invoice=>invoice?.id==item?.id);
      if(firmIds?.includes(item?.id) && index>-1){
        firmIds.splice(firmIds.indexOf(item?.id),1);
      this.InvoiceBuilderForm.controls['attorney_recipient_id'].setValue(firmIds);
      this.invoiceBuilderBillFirmReciptient.searchForm.controls['common_ids'].setValue(firmIds);
      }
      if(index>-1)
       this.invoiceToDetailsData.splice(index,1);
       this.invoiceBuilderBillFirmReciptient.removeOptionFromList(item);
    }
    if(item?.invoice_to_label=="patient" || item?.invoice_to_label=="Patient"){
      let index= this.invoiceToDetailsData?.findIndex(invoice=>invoice?.id==item?.id);
      if(index>-1){
        this.invoiceToDetailsData.splice(index,1);
      }
      let findIndex = this.InvoiceBuilderForm.value.invoice_to.findIndex((invoiceTo) => invoiceTo == 1);
      if (findIndex > -1) {
      this.InvoiceBuilderForm.value.invoice_to.splice(findIndex, 1);
      }
       this.InvoiceBuilderForm.controls['patient_recipient_id'].setValue(null);
       this.invoiceBuilderBillPatientReciptient.searchForm.controls['common_ids'].setValue(null);
    }
}
  OnClickCrossInvoiceTo(item) {
    if(!this.invoice_from_bill){
      this.removeRecipeitns(item)
    }
    else{
      this.OnClickCrossInvoiceToBill(item);
    }
  }
  OnClickCrossInvoiceToBill(item) {
    switch (item.invoice_to_label) {
      case 'firm' || 'Firm':
        this.InvoiceToAttorneisLoc = [];
        let firmIndex: number;
        firmIndex = this.invoiceToDetailsData.findIndex(invoice => invoice.invoice_to_label === 'firm' ||  invoice.invoice_to_label === 'Firm');
        if (firmIndex > -1) {
          this.invoiceToDetailsData.splice(firmIndex, 1);
        }
        this.InvoiceBuilderForm.controls['attorney_recipient_id'].setValue(null);
        this.invoiceBuilderBillFirmReciptient.searchForm.controls['common_ids'].setValue(null);
        break;
      case 'insurance':
          let insuranceIds: any[] = _.uniqBy(this.InvoiceBuilderForm.controls['insurance_recipient_id'].value);
          let index = insuranceIds.findIndex(id => id == item.insurance_id);
          let insuranceIndex: number;
          insuranceIndex = this.invoiceToDetailsData.findIndex(invoice => invoice.insurance_id === item.insurance_id);
          if (insuranceIndex > -1) {
            this.invoiceToDetailsData.splice(insuranceIndex, 1);
          }
          if (index > -1) {
            insuranceIds.splice(index, 1);
            this.InvoiceBuilderForm.controls['insurance_recipient_id'].setValue([...insuranceIds]);
            this.invoiceBuilderBillInsuranceeciptient.searchForm.controls['common_ids'].setValue([...insuranceIds]);
          }
        break;
      case 'employer':
          let employerIds: any[] = _.uniqBy(this.InvoiceBuilderForm.controls['employer_recipient_id'].value);
          let employerIndex = employerIds.findIndex(id => id == item.id);
          let employerToIndex: number;
          employerToIndex = this.invoiceToDetailsData.findIndex(invoice => invoice.id === item.id);
          if (employerToIndex > -1) {
            this.invoiceToDetailsData.splice(employerToIndex, 1);
            this.InvoiceBuilderForm.controls['employer_recipient_id'].setValue([...employerIds]);
            this.invoiceBuilderBillEmployerreciptient.searchForm.controls['common_ids'].setValue([...employerIds]);
          }
          if (employerIndex > -1) {
            employerIds.splice(employerIndex, 1);
            this.InvoiceBuilderForm.controls['employer_recipient_id'].setValue([...employerIds]);
            this.invoiceBuilderBillEmployerreciptient.searchForm.controls['common_ids'].setValue([...employerIds]);
          }
  
        break;
      case 'patient':
        this.InvoiceToPatient = [];
				let patientIndex: number;
				patientIndex = this.invoiceToDetailsData.findIndex(
					(invoice) => invoice.invoice_to_label === 'patient',
				);
				if (patientIndex > -1) {
					this.invoiceToDetailsData.splice(patientIndex, 1);
				}
				this.InvoiceBuilderForm.controls['patient_recipient_id'].setValue(null);
				let findIndex: number;
				findIndex = this.InvoiceBuilderForm.value.invoice_to.findIndex((invoiceTo) => invoiceTo == 1);
        if (findIndex > -1) {
					this.InvoiceBuilderForm.value.invoice_to.splice(findIndex, 1);
				}
				if (this.invoiceBuilderBillPatientReciptient) {
					this.invoiceBuilderBillPatientReciptient.searchForm.controls['common_ids'].setValue(null);
				}
        break;
    }
  }

  onDeSelection(lblname: string) {
    let invoiceDetailsArr = this.invoiceToDetailsData.filter((obj) => {
      return obj.invoice_to_label == lblname;
    });
    let remainingIds = invoiceDetailsArr.map((obj) => {
      return obj.invoice_to_id;
    });
    return remainingIds;
  }
  onInvoiceToSingleSelectionRemove(ev: any) {
    let index;
    index = this.findIndexFromInvoiceTo('invoice_to_id', ev['data'].id);
    this.invoiceToDetailsData.splice(index, 1);
  }
  findIndexFromInvoiceTo(key: string, value: any, array?) {
    let index;
    index = this.invoiceToDetailsData.findIndex((ob) => ob[key] === value);
    return index;
  }
  findPatientFromInvoiceToDetails(invoiceToDetailsData?: any) {
    let index = 0;
    this.invoiceToDetailsData.forEach((obj: any) => {
      if (obj.invoice_to_label === 'patient') {
        index = this.invoiceToDetailsData.findIndex((ob) => ob.invoice_to_label === 'patient');
        return index;
      }
    });
    return index;
  }
  selectionOnInvoiceToValueChange(e: MappingFilterShareableObject, type?, invoiceFrombill?) {
    switch (type) {
      case 'patient':
        if (e['data'] && e['data'].id) {
          this.InvoiceToPatient = [];
          let obj = new InvoiceToModel({ invoice_to_label: 'patient', ...{ realObj: e['data'].realObj } });
          this.InvoiceToPatient.push(obj.getObject());
        } else {
          this.InvoiceToPatient = [];
        }
        break;
      case 'firm':
        if (e['data'] && e['data'].id) {
          this.InvoiceToAttorneisLoc = [];
          let obj = new InvoiceToModel({ invoice_to_label: 'firm', ...{ realObj: e['data'].realObj } });
          this.InvoiceToAttorneisLoc.push(obj.getObject());
        } else {
          this.InvoiceToAttorneisLoc = [];
        }
        break;
      case 'employer':
        this.InvoiceToEmployers = e['data'] && e['data'].length ? e['data'].map((res) => {
          let retObj = new InvoiceToModel({ invoice_to_label: 'employer', ...{ realObj: res.realObj } });
          return retObj.getObject();
        }) : [];
        break;
      case 'insurance':
        this.InvoiceToInsurencesLoc = e['data'] && e['data'].length ? e['data'].map((res) => {
          let retObj = new InvoiceToModel({ invoice_to_label: 'insurance', ...{ realObj: res.realObj } });
          return retObj.getObject();
        }) : [];
        break;
      case 'invoice_category_id':
        this.InvoiceBuilderForm.controls['invoice_category_id'].setValue(e['formValue']);
        this.onChangeTableType();
        break;


      default:
        this.invoiceToDetailsData = [];
    }
    this.invoiceToDetailsData = [...this.InvoiceToPatient, ...this.InvoiceToAttorneisLoc, ...this.InvoiceToEmployers, ...this.InvoiceToInsurencesLoc];
    this.invoiceToDetailsData = [...this.invoiceToDetailsData];
  }
  onChangeTableType(){
    if(this.InvoiceBuilderForm.controls['invoice_category_id'].value == 1){
      this.invoice_from_bill = false;
    }else {
      this.invoice_from_bill = true;
    }
  }
  AddnewRow() {
    if(this.disabledFields){
      return;
    }
    this.resetTax()
    this.currentMappingValue = this.currentMappingValue + 1;
    this.patientServicesDetails = [...this.inventoryDataTable['rows'], ...[{ sr_no: length, description: null, defaultQty: 1, inventory_id: null, unit_price: 0, quantity: 0, total_amount: 0, mappingValue: this.currentMappingValue }]];
    // this.inventory_description_obj[this.currentMappingValue] = '';
    this.cdr.detectChanges();
  }

  invoiceDeleteBills(i: number, row?) {

  }
  invoiceRowDelete(i: number, row?) {
    
    if(this.patientServicesDetails && this.patientServicesDetails['length']==1){
      this.toastrService.error(`To generate an invoice, at least one ${this.invoice_from_bill?'bill':'item'} is required`, "Error");
      return;
    }
    let message;
    if (row && row.bill_label_id){
    message = `Please note that all the visit details for bill ${row.bill_label_id} will be deleted`;
  }
    else {
      message=`Please note that inventory details against this invoice will be deleted`;
    }
   this.customDiallogService.confirm((row && row.bill_label_id)?'Delete Bill':'Delete Inventory',message, 'Yes', 'No')
      .then((confirmed) => {
        if (confirmed) {
          if (this.invoice_from_bill) {
            if (this.patientServicesDetails.length>1){
            this.patientServicesDetails = this.patientServicesDetails.filter(data => data.bill_id != row.bill_id);
            }
            else {
              this.toastrService.error('To generate an invoice, at least one bill is required', "Error");
              return false;
            }
            this.inventoryTotal = 0;
            this.removeBillId({ id: row.bill_id }, true);
            // this.calculateDueAmount('visitChange');	
          }
          else {
            if (this.patientServicesDetails.length>1){
              this.inventoryDataTable['rows'].splice(i, 1);
              this.cdr.detectChanges();
              this.patientServicesDetails = [];
              this.patientServicesDetails = [...this.inventoryDataTable['rows']];
              this.inventoryTotal = this.calculateInventoryTotal(this.patientServicesDetails);
              this.calculateDueAmount('');
              if(!this.invoice_from_bill){
                this.calculateSubTotal();
                this.resetTax()
              }
              }
              else {
                this.toastrService.error('To generate an invoice, at least one inventory is required', "Error");
                return false;
              }

            // if (this.inventoryDataTable['rows'].length === 0) {

            //   this.cdr.detectChanges();
            //   this.selectedTax = '';
            //   this.selectedShipping = '';
            //   this.shipping = 0;
            //   this.selectTaxAmount = 0;
            //   this.inventoryTax = 0;
            //   this.formControls['shipping_cost'].setValue('0.00');
            //   this.formControls['tax_price'].setValue('0.00');
            //   this.formControls['amount_due'].setValue('0.00');
            // }
           
          }
        }
      })
      .catch(e => {
      });



  }
  getTaxesList(queryParams) {
    this.loadSpin = true;
    this.subscription.push(
      this.requestService.sendRequest(TaxUrlsEnum.Tax_List_Get, 'POST', REQUEST_SERVERS.fd_api_url, queryParams, false, true).subscribe(
        (data: HttpSuccessResponse) => {
          if (data.status) {
            this.loadSpin = false;
            this.taxes = data['result'] && data['result'].data ? data['result'].data : [];
            this.taxes.forEach((tax) => {
              tax.tax_name = `${tax.tax_name}@${tax.unit_price}%`;
            });
          }
        },
        (err) => {
          this.loadSpin = false;
        }
      )
    );
  }
  getInventories($event, row, index) {
    this.inventories=this.allInventories;
    this.inventories=this.inventories.filter(item => (!(this.patientServicesDetails.some(data => item.id == data.inventory_id)) && item.remaining_quantity) || 
    item.id==this.patientServicesDetails[index]['inventory_id']);
  }
  handleInventoryChange(ev, rowIndex: number) {
    if (ev) {
      this.isInventorySelected = true;
      this.event=ev;
      this.inventoryDataTable['rows'][rowIndex].inventory_id = ev['id'];
      this.inventoryDataTable['rows'][rowIndex].description = ev['name'];
      this.inventoryDataTable['rows'][rowIndex].quantity = 1;
      this.inventoryDataTable['rows'][rowIndex].unit_price = Number(ev['unit_price']);
      this.inventoryDataTable['rows'][rowIndex].total_amount = Number(ev['unit_price']);
      if(ev['total_remaining_quantity']){
        this.inventoryDataTable['rows'][rowIndex].total_remaining_quantity = Number(ev['total_remaining_quantity']);
      }
      else if(ev['remaining_quantity']){
        this.inventoryDataTable['rows'][rowIndex].total_remaining_quantity = Number(ev['remaining_quantity']);
      }
      this.inventoryTotal = this.calculateInventoryTotal(this.patientServicesDetails);
      this.calculateDueAmount('');
    }
    else {
      this.inventoryDataTable['rows'][rowIndex].inventory_id = null;
      this.inventoryDataTable['rows'][rowIndex].description = null;
      this.inventoryDataTable['rows'][rowIndex].quantity = 0;
      this.inventoryDataTable['rows'][rowIndex].unit_price = 0;
      this.inventoryDataTable['rows'][rowIndex].total_amount = 0;
      this.inventoryDataTable['rows'][rowIndex].total_remaining_quantity=0;
      this.inventoryTotal = this.calculateInventoryTotal(this.patientServicesDetails);
      this.calculateDueAmount('');
    }
    this.inventories=this.allInventories;
    if(!this.invoice_from_bill){
      this.calculateSubTotal();
      this.resetTax()
    }
  }

  calculateSubTotal(){
    this.subTotal=0;
    if(this.patientServicesDetails.length>0){
      for(let item of this.patientServicesDetails){
        if(item.total_amount){
          this.subTotal=this.subTotal+item.total_amount;
          this.InvoiceBuilderForm.controls['sub_total'].setValue(this.subTotal);
        }
      }
    }
  }
  calculateDueAmount(entityChange: string) {
    if (this.shippingChange && entityChange === 'shippingChange') {
      this.inventoryTotal -= this.shipping;
      this.shipping = 0;
      this.formControls['amount_due'].setValue(this.inventoryTotal.toFixed(2));
      this.formControls['shipping_cost'].setValue('0.00');
    }
    else if (this.inventoryTaxChange && entityChange === 'taxChange') {
      this.inventoryTotal -= this.inventoryTax;
      this.inventoryTax = 0;
      this.formControls['tax_price'].setValue('0.00');
      this.formControls['amount_due'].setValue(this.inventoryTotal.toFixed(2));
    }
    else if (entityChange === 'visitChange') {
      let totalAmount: number = 0;
      this.inventoryTotal = 0;
      let totalPaidAmount :number=0;
      this.patientServicesDetails.forEach(visit => {
        totalAmount = totalAmount + (+visit.bill_amount);
        totalPaidAmount = totalPaidAmount + (+visit.paid_amount);
      });
      this.inventoryTotal += (totalAmount + this.shipping)-totalPaidAmount;
      this.formControls['amount_due'].setValue(this.inventoryTotal.toFixed(2));
    }
    else {
      this.taxCalculate;
      this.inventoryTotal += (this.inventoryTax + this.shipping);
      this.formControls['amount_due'].setValue(this.inventoryTotal.toFixed(2));
    }
  }
  get taxCalculate() {
    if (this.selectTaxAmount) {
      this.inventoryTax = (this.inventoryTotal * this.selectTaxAmount) / 100;
    }
    this.formControls['tax_price'].setValue(this.inventoryTax);
    return this.inventoryTax;
  }
  subTotal=0;
  handleShippingChange(ev) {
    if (ev) {
      if (this.shipping) {
        this.inventoryTotal -= this.shipping;
      }
      this.shipping = Number(ev['unit_price']);
      this.formControls['shipping_id'].setValue(ev['id']);
      this.InvoiceBuilderForm.controls['shiping_detail'].setValue(ev['id']);
      this.inventoryTotal += this.shipping;
      this.formControls['shipping_cost'].setValue(this.shipping);
      this.formControls['amount_due'].setValue(this.inventoryTotal);
      if(!this.invoice_from_bill){
        this.calculateSubTotal();
        this.calculateTotalAmount()
      }
    }
    else {
      this.formControls['shipping_id'].setValue(null);
      this.shippingChange = true;
      this.calculateDueAmount('shippingChange');
        if(!this.invoice_from_bill){
          this.calculateSubTotal();
          this.calculateTotalAmount();
      }
    }
  }

  calculateTotalAmount(){
    let invoiceBuilderForm=this.InvoiceBuilderForm.getRawValue();
    let otherCosts=Number(invoiceBuilderForm['tax_price'])+Number(invoiceBuilderForm['shipping_cost']);
    this.InvoiceBuilderForm.controls['amount_due'].setValue(this.subTotal+otherCosts);
  }
  handleTaxChange(ev) {
    if (ev) {
      if (this.inventoryTax) {
        this.inventoryTotal -= this.inventoryTax;
      }
      if (this.shipping) {
        this.inventoryTotal -= this.shipping;
      }
      this.formControls['tax_id'].setValue(ev['id']);
      this.selectTaxAmount = Number(ev['unit_price']);
      this.inventoryTax = this.taxCalculate;
      this.inventoryTotal += (this.inventoryTax + this.shipping);
      this.formControls['amount_due'].setValue(this.inventoryTotal);
      if(!this.invoice_from_bill){
        this.calculateSubTotal();
        this.formControls['tax_price'].setValue((this.selectTaxAmount*Number(this.subTotal))/100);
        this.calculateTotalAmount();

      }
    }
    else {
      this.formControls['tax_id'].setValue(null);
      this.formControls['tax_price'].setValue('0.00');
      this.inventoryTaxChange = true;
      this.calculateDueAmount('taxChange');
      if(!this.invoice_from_bill){
        this.calculateSubTotal();
        this.calculateTotalAmount();
      }
    }
  }
  onTaxSelection(event: any) {
    if (event['data']) {
      let amount_due: number;
      this.inventoryTotal -= this.shipping;
      amount_due = (this.inventoryTotal * Number(event['data']['realObj']['unit_price'])) / 100;
      amount_due += (this.inventoryTotal + this.shipping);
      this.formControls['amount_due'].setValue(amount_due.toFixed(2));
      this.formControls['tax_id'].setValue(event['data']['realObj']['id']);
    }
    else {
      this.formControls['tax_id'].setValue(null);
    }

  }

  resetTax(){
    this.InvoiceBuilderForm.controls['tax_detail'].reset();
    this.InvoiceBuilderForm.controls['tax_price'].setValue('0.00');
    this.InvoiceBuilderForm.controls['shiping_detail'].reset();
    this.InvoiceBuilderForm.controls['shipping_cost'].setValue('0.00');
    this.InvoiceBuilderForm.controls['tax_id'].setValue(null);
    this.InvoiceBuilderForm.controls['shipping_id'].setValue(null);
    this.InvoiceBuilderForm.controls['amount_due'].setValue(this.subTotal)
  }
  onInventorySelectionchange(ev: any, lbl, rowIndex: number) {
    if (ev.data) {

      let newObj = {};
      newObj = { ...ev.data['realObj'] };
      this.inventory_added.push(newObj['id']);
      this.patientServicesDetails[rowIndex].quantity = Number(newObj['quantity']);
      this.patientServicesDetails[rowIndex].unit_price = Number(newObj['unit_price']);
      this.patientServicesDetails[rowIndex].inventory_id = newObj['id'];
    }
    else {
      this.patientServicesDetails[rowIndex].unit_price = 0;
      this.patientServicesDetails[rowIndex].inventory_id = 0;
      this.patientServicesDetails[rowIndex].quantity = 0;
      this.patientServicesDetails[rowIndex].total_amount = 0;
      this.formControls['amount_due'].setValue(0);
    }
  }
  onKeyUpQuantity(event, rowIndex,row) {
    
    if (event.key == 1) {
      this.patientServicesDetails[rowIndex].quantity = event.key;
      this.patientServicesDetails[rowIndex].total_amount = (Number(this.patientServicesDetails[rowIndex].unit_price) * Number(event.key));
      this.inventoryTotal = this.calculateInventoryTotal(this.patientServicesDetails);
      this.calculateDueAmount('');
    }
  }

  onChangeQauntity(event, rowIndex,row) {
    this.patientServicesDetails[rowIndex].quantity=event.target.value;
    this.patientServicesDetails[rowIndex].total_amount = (Number(this.patientServicesDetails[rowIndex].unit_price) * Number(event.target.value));
    this.inventoryTotal = this.calculateInventoryTotal(this.patientServicesDetails);
    this.calculateDueAmount('');
    this.calculateSubTotal();
    this.resetTax()
  }
  calculateInventoryTotal(arr) {
    return arr.reduce((sum, i) => {
      return sum + (i.total_amount);
    }, 0);
  }
  CheckFormValidity() {
    if (this.inventoryTotal > 0 && this.isInventorySelected) {
      return true;
    } else {
      return false;
    }
  }
  getDOS(params: any) {
    if (params && params.bill_ids && params.bill_ids.length != 0) {
      this.subscription.push(
        this.requestService
          .sendRequest(
            InvoiceBuilderEnumURLs.Invoice_builder_Bill_DOS_GET,
            'GET',
            REQUEST_SERVERS.fd_api_url,
            params
          )
          .subscribe(
            (res: HttpSuccessResponse) => {
              if (res && res.result && res.result.data) {

                this.formControls['dos_start'].setValue(res.result.data.dos_start);
                this.formControls['dos_end'].setValue(res.result.data.dos_end)
                this.invoiceDetailsForBills['dos'] = res.result.data;
              }
            },
            (err) => {
              this.isLoading = false;
            },
          ),
      );
    }
    else {
      this.formControls['date_of_service'].setValue(null);
      this.formControls['dos_start'].setValue(null);
      this.formControls['dos_end'].setValue(null);
      this.invoiceDetailsForBills['dos'] =null;
    }
  }
  getLowestDOS(date_of_service: Date) {
    let minDate: Date;
    minDate = date_of_service;
    for (var datee = 0; datee < this.Date_of_service.length; datee++) {
      if (minDate < this.Date_of_service[datee]) {
        minDate = minDate;
      }
      else {
        minDate = this.Date_of_service[datee];
      }
    }
    return minDate;
  }
  getHighestDOS(date_of_service: Date) {

    let maxDate: Date;
    maxDate = date_of_service;
    for (var datee = 0; datee < this.Date_of_service.length; datee++) {
      if (maxDate > this.Date_of_service[datee]) {
        maxDate = maxDate;
      }
      else {
        maxDate = this.Date_of_service[datee];
      }
    }
    return maxDate;
  }

  ngOnDestroy(): void {
    unSubAllPrevious(this.subscription);
  }
}
