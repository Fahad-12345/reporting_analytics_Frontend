export enum FeeScheduleEnum {
    Fee_list_GET = 'billing/fee-schedule',
    Fee_list_POST = 'billing/fee-schedule/add',
    Fee_list_PATCH = 'billing/fee-schedule/edit',
    Fee_list_DELETE = 'codes/destroy',
    Fee_list_DELETEMultiple = 'codes/destroyAll',

    // Search for Fee
    Fee_Search_GET = 'codes/search',

    Codes_Get = 'billing/code',
    CaseType_GET = 'case_type',
    visitTypeUrl = "visit_types",
    pickListUrl = "pick-list-category/get",
    // feeTypeUrl = "fee-types/get"
    feeTypeUrl = "billing/fee_type"
}
