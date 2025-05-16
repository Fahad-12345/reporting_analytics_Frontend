export enum BillingEnum {
    getUrl = 'visit_session/get_list',
    getspecialityUrl = 'visit_session/list/specialties',
    getDetailUrl = 'Cases/caseDetail',
    getStatusList = 'visit_session/state/list',
    createVisitDesk = 'visit_session/create',
    updateVisitDesk = 'visit_session/update',
    // facility_locationsURL = 'search_clinic', //COMMENTED BECAUSE OF PER PAGE NOT WORKING
    facility_locationsURL = 'facilities',
    searchProviderUrl = 'search_doctor',
    getfolder = 'dm/get_visit_desk_speciality_folder',
    uploadFolder = 'dm/v1/upload-files-by-folder',
	unbilledVisitExcel = 'export/unpaid-visit',
	createdBillExcel = 'export/bill',
    eorExcel = 'export/eor',
    denialExcel = 'export/denial',
    verificationSentExcel = 'export/verification-sent',
    verificationReceivedExcel = 'export/verification-received',
    //create Bill
    // feeCalcilation = 'bill/visit-fee-calculation',
    // feeCalcilation = 'billing/fee-schedule',
	feeCalcilation = 'billing/fee-schedule/calculation',
	getCalculatedfeeSchedules="bill/visits-fee-calculation",
    billAdd = 'bill/add',
    billEdit = 'bill/edit',
    getDocumentFormate = 'bill/document/format',

    getBillListing = 'bill/list',
    getBillsForSearch='bill/bill-for-dropdown',
    getBillIntelsicene = 'bill/ids',    
    deleteBillListing = 'bill/delete',
    getCaseBillTotalDetail = "bill/invoice/caseBills/total",
    getSingleBill = 'bill/single',
    getVisitUrl = 'visit_session/index',
	getVisiturlV1= "visit_session/index-v1",
	getBillDocuments = 'bill/document',
	uploadMediaPayment = "dm/upload-media",
	uploadMediaPaymentVerification = "dm/upload-media-in-verification",
    billFileUploadForCitimed = "bill/upload-file-by-id",

	genereteEnvelope = "bill/generate-envelop",
	genertePOM =  "export/generatepom",
	generteCasePOM =  "export/generate-case-pom",

	createPacket = "bill/create-packet-without-job",
	createPacketWithinCase = "export/create-packet-without-job",
    GetBillSpecailityList = "bill/with-speciality",
    CaseType_list_GET = 'session/masters',
	getAllVisits='visit_session/bulk-sessions',
	visitSessionMultipleUpdate='visit_session/multiple-update',

	DeleteBill = "bill/delete",
	DeleteVisit = "vd/visit_session_delete",
	changevisitSpeclality= "vd/visit_session/change-visit-type" ,
	GetProvidersOnlyForDiagnosticSpecialty = 'providers',
	GetProviderTechnisionOnlyForDiagnosticSpecialty = 'get-supervisor-technician',
    GetBillsById="invoice/invoiceBillDetails" , 
    GETBillInvoiceId = 'invoice/invoiceBillDetails',
    GeneartePacket='export/create-bulk-packet'
}

export enum ch_billing_typs_enum{
    e_bill = 1,
    manual_bill = 2
}

export enum bill_format_enum {
    FifteenHundred = '1500',
    NF3 = 'nf3',
    Invoice = 'invoice'
}

export enum visit_status_enum {
    un_finalized = 1,
    finalized = 2,
    bill_created = 3
}
export enum bill_status{
    billed = 1,
    packet_created = 8
}