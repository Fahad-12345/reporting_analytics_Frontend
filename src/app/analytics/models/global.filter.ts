export class GlobalFilter {
    time_span_id: number = 1;
    month_id: number;
    speciality_ids: Array<number> = [];
    provider_ids: Array<number> = [];
    facility_location_ids: Array<number> = [];
    case_type_ids: Array<number> = [];
    fromDate: any;
    toDate: any;
    granularity_type_id: number;
}