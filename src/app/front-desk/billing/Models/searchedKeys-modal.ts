import { FirmUrlsEnum } from '@appDir/front-desk/masters/billing/attorney-master/firm/Firm-Urls-enum';
import { ReferringPhysicianUrlsEnum } from '@appDir/front-desk/masters/practice/referring-physician/referring-physician/referringPhysicianUrlsEnum';
import { AddToBeSchedulledUrlsEnum } from './../../../scheduler-front-desk/modules/add-to-be-scheduled/add-to-be-scheduled-list-urls-enum';
import { customizeUrlsEnum } from './../../../scheduler-front-desk/modules/scheduler-customize/customize-urls-enum';
import { DenialStatusUrlsEnum } from '@appDir/front-desk/masters/billing/billing-master/denial.status.enum';
import { EORStatusUrlsEnum } from '@appDir/front-desk/masters/billing/billing-master/eor.status.enum';
import { VerificationUrlsEnum } from '@appDir/front-desk/masters/billing/billing-master/verification-status.enum';
import { PaymentStatusUrlsEnum } from '@appDir/front-desk/masters/billing/billing-master/payment.status.url';
import { PatientListingUrlsEnum } from '@appDir/front-desk/patient/patient-listing/PatientListing-Urls-Enum';
import { FacilityUrlsEnum } from '@appDir/front-desk/masters/practice/practice/utils/facility-urls-enum';
import { BillingEnum } from '../billing-enum';
import { SpecialityUrlsEnum } from './../../masters/providers/speciality/speciality.enum';
import { InsuranceUrlsEnum } from '@appDir/front-desk/masters/billing/insurance-master/Insurance/insurance-list/Insurance-Urls-enum';
import { AttorneyUrlsEnum } from '@appDir/front-desk/masters/billing/attorney-master/attorney/Attorney-Urls-enum';
import { EorBillUrlsEnum } from '@appDir/eor/eor-bill.url.enum';
import { UsersUrlsEnum } from '@appDir/front-desk/masters/master-users/users/users-urls.enum';
import { DenialUrlsEnum } from '@appDir/front-desk/masters/billing/billing-master/Denial-Urls-Enum';
import { VerificationTypeUrlsEnum } from '@appDir/front-desk/masters/billing/billing-master/VerificationType-Urls-Enum';
import { PaidByUrlsEnum } from '@appDir/front-desk/masters/billing/billing-master/PaidBy-Urls-Enum';
import { PaymentActionTypeUrlsEnum } from '@appDir/front-desk/masters/billing/billing-master/payment.action.type.Enum';
import { PaymentTypeUrlsEnum } from '@appDir/front-desk/masters/billing/billing-master/PaymentType-Urls-enum';
import { BillingStatusUrlsEnum } from '@appDir/front-desk/masters/billing/Billing-Status-Urls.Enum';
import { FeeScheduleEnum } from '@appDir/front-desk/masters/billing/codes/fee-schedule/FeeSchedule.enum';
import { ModifiersUrlsEnum } from '@appDir/front-desk/masters/billing/billing-master/Modifiers-Urls-Enum';
import { EmployerUrlsEnum } from '@appDir/front-desk/caseflow-module/case-insurance/employer/Employer-Urls-Enum';
import { CodeTypeUrl } from '@appDir/front-desk/masters/billing/codes/codetype/CodeType.enum';
import { PlaceOfServiceUrlsEnum } from '@appDir/front-desk/masters/billing/billing-master/PlaceOfService-Urls-Enum';
import { RegionUrlsEnum } from '@appDir/front-desk/masters/billing/billing-master/Region-Urls-Enum';
import { PlanNameUrlsEnum } from '@appDir/front-desk/masters/billing/insurance-master/PlanName/PlanName-Urls-enum';
import { DesignationUrlsEnum } from '@appDir/front-desk/masters/master-users/designation/designation-urls-enum';
import { EmploymentUrlsEnum } from '@appDir/front-desk/masters/master-users/employment-type/employment-urls-enum';
import { EmploymentByUrlsEnum } from '@appDir/front-desk/masters/master-users/employment-by/employmentBy-urls-enum';
import { CaseFlowUrlsEnum } from '@appDir/front-desk/fd_shared/models/CaseFlowUrlsEnum';
import { PomEnum } from '@appDir/pom/pom.enum';
import { BillingRecipientUrlsEnum } from '@appDir/front-desk/masters/billing/billing-master/Billing-Recipient.Enum';
import { CaseTypeUrlsEnum } from '@appDir/front-desk/masters/providers/caseType/case.type.enum';
import { DoctorCalendarUrlsEnum } from '@appDir/shared/modules/doctor-calendar/doctor-calendar-urls-enum';
import { InvoiceBuilderEnumURLs } from '@appDir/front-desk/masters/builder-invoice/invoice-builder-enum-urls';
import { InventoryEnumUrls } from '@appDir/front-desk/masters/billing/invoice/inventory/inventory-enum-urls';
import { ShippingUrlsEnum } from '@appDir/front-desk/masters/billing/invoice/shipping/shipping-urls-enum';
import { TaxUrlsEnum } from '@appDir/front-desk/masters/billing/invoice/tax/tax-urls-enum';
import { InvoiceBillEnum } from '@appDir/invoice/shared/invoice-bill-enum';
import { Insurance } from '@appDir/medical-doctor/models/common/commonModels';
import { PacketEnum } from '@appDir/packets/packet.enum';
import { ClearinghouseEnum } from '@appDir/front-desk/masters/billing/clearinghouse/CH-helpers/clearinghouse';
import { EmpInsuLinkageEnum } from '@appDir/front-desk/masters/billing/emp-insu-linkage/emp-insu-linkage';
import { PatientFormUrlsEnum } from '@appDir/front-desk/patient/patient-form/PatientForm-Urls-enum';
import { AnalyticsUrlsEnum } from '@appDir/analytics/helpers/analytics_Urls_enum';
export interface ISearch  {
	searchKey,
	page,
	lastPage?
}
export enum EnumSearch {
	InitSearch = 'initSearch',
	ScrollSearch = 'scroll',
	RemoveLastItemSearch = 'removeLastItem',
}
export class SearchedKeys {
	page = 1;
	last_page = 0;
	minChar = 2;
	maxChar = 15;
	BillId?:ISearch = {searchKey:'',page:this.page};
	patientName?:ISearch = {searchKey:'',page:this.page};
	specialityName?:ISearch = {searchKey:'',page:this.page};
	practiceLocation?:ISearch = {searchKey:'',page:this.page};
	InsuranceName?:ISearch = {searchKey:'',page:this.page};
	attorneyName?:ISearch = {searchKey:'',page:this.page};
	searchProvider?:ISearch = {searchKey:'',page:this.page};
	denialStatus?:ISearch = {searchKey:'',page:this.page};
	eorStatus?:ISearch = {searchKey:'',page:this.page};
	verificationStatus?:ISearch = {searchKey:'',page:this.page};
	paymentStatus?:ISearch = {searchKey:'',page:this.page};
	createdBy?:ISearch = {searchKey:'',page:this.page};
	updatedBy?:ISearch = {searchKey:'',page:this.page};
	BillStatus?:ISearch = {searchKey:'',page:this.page};
	actionType?:ISearch = {searchKey:'',page:this.page};
	denialType?:ISearch = {searchKey:'',page:this.page};
	eorType?:ISearch = {searchKey:'',page:this.page};
	verificationType?:ISearch = {searchKey:'',page:this.page};
	paymentType?:ISearch = {searchKey:'',page:this.page};
	paymentBy?:ISearch = {searchKey:'',page:this.page};
	providerName?:ISearch = {searchKey:'',page:this.page};
}
export enum EnumApiPath {
practiceLocationPath = FacilityUrlsEnum.Facility_list_dropdown_GET,
	BillIdPath =    BillingEnum.getBillIntelsicene,
	BillsList =    BillingEnum.getBillsForSearch,
	specialityApi = SpecialityUrlsEnum.Speciality_list_Get,
	insuranceApiPath = InsuranceUrlsEnum.Insurance_list_GET,
	insuranceBillsApiPath =InsuranceUrlsEnum.insurance_bill_Get,
	attorneyApiPath = AttorneyUrlsEnum.attorney_list_GET,
	providerApiPath = EorBillUrlsEnum.searchProviderUrl,
	denialStatusApiPath = DenialStatusUrlsEnum.DenialStatus_list_GET,
	eorStatusApiPath = EORStatusUrlsEnum.EORStatus_list_GET,
	verificationApiPath = VerificationUrlsEnum.Verification_list_Status_GET,
	appealStatus = VerificationUrlsEnum.Appeal_Status,
	paymentStatuApiPath = PaymentStatusUrlsEnum.PaymentStatus_list_GET,
	createdByApiPath = UsersUrlsEnum.UserListing_list_GET,
	firmurlApiPath =FirmUrlsEnum.AllFirms_list_GET,
	patientNameApiPath = PatientListingUrlsEnum.Patient_Get,
	eorTypeApiPath = EorBillUrlsEnum.EOR_list_GET,
	denialTypeApiPath = DenialUrlsEnum.Denial_list_GET,
	verficationReceivedType = VerificationTypeUrlsEnum.VerificationType_list_GET,
	paidByApiPath = PaidByUrlsEnum.PaidBy_list_GET,
	actionTypeApiPath = PaymentActionTypeUrlsEnum.Payment_Action_Type_list_GET,
	paymentTypeApiPath = PaymentTypeUrlsEnum.PaymentType_list_GET,
	billStatusApiPath = BillingStatusUrlsEnum.BillingStatus_list_GET,
	scheduleFeeTypeApiPath = FeeScheduleEnum.feeTypeUrl,
	scheduleFeeModifierApiPath = ModifiersUrlsEnum.Modifiers_list_GET,
	scheduleFeeEmployerApiPath = EmployerUrlsEnum.Employer_list_GET,
	scheduleFeeCodeName = FeeScheduleEnum.Codes_Get,
	scheduleFeeCodeTypeApipath = CodeTypeUrl.CODE_TYPE_list_GET,
	scheduleFeePlaceSeriveApiPath = PlaceOfServiceUrlsEnum.Place_list_GET,
	scheduleFeeRegionApiPath =  RegionUrlsEnum.Region_list_GET,
	scheduleFeePlanNameApiPath = PlanNameUrlsEnum.PlanNAme_list_GET,
	scheduleFeeVisitTypeApiPath = FeeScheduleEnum.visitTypeUrl,
	scheduleFeeCaseTypeApiPath = FeeScheduleEnum.CaseType_GET,
	userRoleListsApiPath = UsersUrlsEnum.UserRolesList,
	designationApiPath = DesignationUrlsEnum.Designation_list_GET,
	employmentTypeApiPath = EmploymentUrlsEnum.Employment_list_GET,
	employedByApiPath = EmploymentByUrlsEnum.EmploymentBy_list_GET,
	medicalIdentifierBillingTitle = UsersUrlsEnum.User_Medical_Identifier_BillingTitle,
	medicalIdentifierBillEmployementTypes = UsersUrlsEnum.User_Medical_Identifier_BillEmploymentTypes,
	NF2PomCaseIdApiPath =  CaseFlowUrlsEnum.GetCaseList,
	NF2PomPomIDApiPath = PomEnum.PomIntellisen,
	billingJobStatusApiPath = BillingRecipientUrlsEnum.BillingJobStatus,
	documentFormatApiPath = BillingEnum.getDocumentFormate,
	AppointmentStatusApiPath= AddToBeSchedulledUrlsEnum.getAppointmentStatus,
	CaseIdApiPath= DoctorCalendarUrlsEnum.getCaseListWithoutParam,
	ChartIdApiPath= InvoiceBuilderEnumURLs.Invoice_builder_chart_Id,
	CaseIDApiPath= InvoiceBuilderEnumURLs.Invoice_builder_case_Id,
	// AttorneyApiPath= InvoiceBuilderEnumURLs.Invoice_builder_Attorney_details,
	AttorneyApiPath= InvoiceBuilderEnumURLs.Invoice_builder_Firm_Loc,
	EmployerApiPath= InvoiceBuilderEnumURLs.Invoice_builder_Employer_details,
	InsuranceApiPath= InvoiceBuilderEnumURLs.Invoice_builder_Insurance_Loc,
	InvoicToApi= InvoiceBuilderEnumURLs.Invoice_builder_Invoice_to,
	InvoiceBuilderFacilities = InvoiceBuilderEnumURLs.Invoice_builder_facility_Location,
	getProvider = AddToBeSchedulledUrlsEnum.getproviderForUsersWithoutSlash,
	GET_CLINIC_BY_LOCATIONAPIurl = ReferringPhysicianUrlsEnum.GET_CLINIC_BY_LOCATION ,
	CaseTypeUrlsEnumList = CaseTypeUrlsEnum.CaseType_list_GET,
	InventoryUrlEnum = InventoryEnumUrls.Inventory_List_Get,
	ShippingApiHitUrl = ShippingUrlsEnum.Shipping_List_Get,
	InvoiceBillApiHitUrl = InvoiceBillEnum.Invoice_Bill_List_Get,
	InvoiceIntelisencApiHitUrl = InvoiceBillEnum.Invoice_Bill_List_Get_Intelisc,
	InvoiceFormatApiHitUrl = InvoiceBuilderEnumURLs.Invoice_builder_List_Get,
	get_bills_of_specilities = InvoiceBuilderEnumURLs.get_bills_of_specilities,
	getSpecilities = InvoiceBuilderEnumURLs.get_bills_specilities,
	TaxApiHitUrl = TaxUrlsEnum.Tax_List_Get,
	Invoice_builder_Invoice_Type_Category = InvoiceBuilderEnumURLs.Invoice_builder_Invoice_Type_Category,
	Bill_Id_Packet_List = PacketEnum.getPacketListing,
	//Clearinghouse api enums
	CH_name_List = ClearinghouseEnum.get_Clearinghouse_Name_Filter,
	CH_States_List = ClearinghouseEnum.get_States_List,
	CH_Payers_List = ClearinghouseEnum.get_Payer_ID_Name_Filter,
	CH_Bill_Type_List = ClearinghouseEnum.Get_Bill_Types,
	CH_EBill_Status_List = ClearinghouseEnum.Get_EBill_Statuses,
	Get_Bill_By_id = BillingEnum.GetBillsById,
	FirmUrlsEnumList = FirmUrlsEnum.AllFirms_list_GET,
	InsuranceShortEnum = EmpInsuLinkageEnum.Insurance_Short,
	GET_ALLERGY_REACTIONS_ERX = PatientFormUrlsEnum.Reactions_GET,
	GET_ALLERGY_ERX = PatientFormUrlsEnum.Allergy_GET,
	Pom_types = PatientFormUrlsEnum.Pom_types,

	/// AR Api Path enums
	Get_Report_Filter = AnalyticsUrlsEnum.report_filters
}
