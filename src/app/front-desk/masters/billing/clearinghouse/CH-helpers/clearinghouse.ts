export enum ClearinghouseEnum {
    get_Payer_ID_Name_Filter = 'short/payers',
    get_Clearinghouse_Name_Filter = 'short/clearing_house',
    get_States_List = 'states_list',
    Add_Update_Clearinghouse = 'clearing_houses',
    Get_Payers_Info = 'payers',
    Default_Payer_Set = 'payers/set_default',
    Get_Bill_Types = 'bill/bill-type',
    Get_EBill_Statuses = 'bill/ebill-statuses',
    Push_To_Clearinghouse = 'bill/push-to-clearinghouse',
    Ebill_History = 'bill/e-bill-history',
    Bulk_Electronic_To_Manual = 'bill/bulk-electronic-to-manual',
    Update_Bills_Status = 'bill/update-bills-status'
}

export function removeEmptyAndNullsAndDefaultsFormObject(obj) {
    Object.keys(obj).forEach((key) => (obj[key] == null || obj[key] == -1 || obj[key] === '' || obj[key].length === 0 || obj[key] === "[]") && delete obj[key]);
    return obj;
}

