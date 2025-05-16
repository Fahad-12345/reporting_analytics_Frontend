export enum CodesUrl {
    CODES_list_GET = 'billing/code-v1',
    CODES_list_POST = 'billing/code/add',
    CODES_list_PATCH = 'billing/code/edit',
    CODES_SINGLE_GET = 'billing/code',
    CODES_list_DELETE = 'billing/code/destroy',
    CODES_list_DELETEMultiple = 'billing/code/destroyAll',
    getCptListByVisitType="get/visit_type/cpt_codes",
    // below is CODES search
    CODES_Search_GET = 'billing/code/search',
}
