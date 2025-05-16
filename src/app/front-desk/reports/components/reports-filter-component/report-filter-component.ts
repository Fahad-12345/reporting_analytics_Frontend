import { queryParams } from '@syncfusion/ej2-base';
import { practiceLocation } from './../../../fd_shared/models/Case.model';
import { MatDialog } from '@angular/material/dialog';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AnalyticsService } from '@appDir/analytics/analytics.service';
import { AnalyticsUrlsEnum } from '@appDir/analytics/helpers/analytics_Urls_enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { MappingFilterObject } from '@appDir/shared/filter/model/mapping-filter-object';
import {
  changeDateFormat,
  isArray,
  makeDeepCopyArray,
  removeEmptyAndNullsFormObject,
} from '@appDir/shared/utils/utils.helpers';
import { Subject } from 'rxjs';
import {
  AggregateFunctions,
  DateRangeTypeList,
  ReferalType,
  DateTypes,
  GroupByList,
  appointmentGroupByList,
  ViewByListForApptSummaryReport,
  paymentRecipientList,
  RecipientList,
  SubGroupByList,
  ViewByList,
  appointmentSubGroupByList,
} from '../../constant/constants';
import { BillRecepientType, DateRangeType, GroupByTypes, ViewBySummary } from '../../report.enum';
import { ShareAbleFilter } from './../../../../shared/models/share-able-filter';
import { DatePipeFormatService } from './../../../../shared/services/datePipe-format.service';
import { EnumApiPath } from './../../../billing/Models/searchedKeys-modal';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-filter-reports',
  templateUrl: './report-filter-component.html',
  styleUrls: ['./report-filter-component.scss'],
})
export class ReportFiltersComponent implements OnChanges,OnInit,AfterViewInit {
  @ViewChild('dateRangeTypeRef') dateRangeTypeRef: any = {};
  @ViewChild('DateTypefiltercomponent',{static:false}) DateTypefiltercomponent: any = {};
  @ViewChild('groupbyFilterComponent') groupbyFilterComponent: any = {};
  @ViewChild('SubgroupbyFilterComponent') SubgroupbyFilterComponent: any = {};
  @ViewChild('facilityLocationFilterComponent') facilityLocationFilterComponent: any = {};
  @ViewChild('casetypefilterComponent') casetypefilterComponent: any = {};
  @ViewChild('AggregateFilterComponent') AggregateFilterComponent: any = {};
  @ViewChild('InsurancefilterComponent') InsurancefilterComponent: any = {};
  @ViewChild('ProviderFilterComponent') ProviderFilterComponent: any = {};
  @ViewChild('StartDateFiltercomponent') StartDateFiltercomponent: any = {};
  @ViewChild('EndDateFiltercomponent') EndDateFiltercomponent: any = {};
  @ViewChild('patientFilterComponent') patientFilterComponent:any = {};
  @ViewChild('firmFilterComponent') firmFilterComponent: any = {};
  @ViewChild('attorneyFilterComponent') attorneyFilterComponent: any = {};
  @ViewChild('employerFilterComponent') employerFilterComponent: any = {};
  @ViewChild('recipientFilterComponent') recipientFilterComponent: any = {};
  @ViewChild('specialityFilterComponent') specialityFilterComponent: any = {};

  isCollapsed = true;
  loadSpin: boolean = false;

  @Input() filtersIncludes: any[] = [];
  @Input() PaymentDetailReport: boolean = false;
  @Input() groupByList: any[] = GroupByList;
  @Input() appointmentGroupByList: any[] = appointmentGroupByList;
  @Input() isArReport: boolean = false;
  @Input() isArNewReport: boolean = false;
  @Input() BrdHiddenFilters: boolean = false;
  @Input() isDenialReport: boolean = false;
  @Input() isPaymentSummaryReport: boolean = false;
  @Input() isPaymentDetailReport: boolean = false;
  @Input() isArSummaryReport: boolean = false;
  @Input() isAppointmentSummaryReport: boolean = false;
  @Input() isAppointmentStatusReport: boolean = false;
  @Input() mandatoryFields: any[] = [];
  @Input() queryParams: any = {};
  eventsSubject: Subject<any> = new Subject<any>();
  selectedMultipleFieldFiter: any = {
    appointment_type_ids: [],
    facility_location_ids: [],
    visit_status_ids: [],
    patient_ids: [],
    speciality_ids: [],
    doctor_ids: [],
    visit_type_ids: [],
    case_type_ids: [],
    insurance_ids: [],
    attorney_ids: [],
    employer_ids: [],
    firm_ids: [],
    created_by_ids: [],
    updated_by_ids: [],
  };
  dateTypes: any[] = DateTypes;
  GroupByList: any[] = GroupByList;
  AppointmentGroupByList: any[] = appointmentGroupByList;
  aggregateFunctions = AggregateFunctions;
  billRecipientList = RecipientList;
  PaymentRecipient = paymentRecipientList;
  viewByList = ViewByList;
  dateRangeTypeList = DateRangeTypeList;
  querysubgoup: any[] = SubGroupByList;
  subGroupByList: any[] = [];
  public searchForm: FormGroup;
  EnumApiPath = EnumApiPath;
  maxDate = new Date();
  requestServerpath = REQUEST_SERVERS;
  billRecepientType = BillRecepientType;
  dateRangeType = DateRangeType;
  DATEFORMAT = '_/__/____';
  referalTypes : any[]= ReferalType;

  @Output() reportFilter = new EventEmitter();
  @Output() resetFilterEvent = new EventEmitter();
  @Output() billRecepientChangeEvent = new EventEmitter();
  @Output() groupDataEvent = new EventEmitter();
  @Output() endDateEvent = new EventEmitter();
  @Output() endDateCancelledEvent = new EventEmitter();
  @Output() keyToPass = new EventEmitter();
  conditionalExtraApiParamsStatus = {
    specific_appointment_status: true,
  };
  filterResponse: any = {};
  groupbyvar: any[];
  billRecipientTypeIdSubscription: any;
  min: Date= new Date('1900/01/01');			
  hasShownInfoMessage: boolean = false;
  constructor(
    private datePipeService: DatePipeFormatService,
    private toaster: ToastrService,
    private analyticsService: AnalyticsService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    public dialog :MatDialog,
    private toastrService: ToastrService
  ) {}



 

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.queryParams && !changes.queryParams.isFirstChange()) {
      this.getSelectedFilterValue();
    }
  }
	ngOnInit() {
    if(!this.isAppointmentSummaryReport){
    this.subGroupByList = makeDeepCopyArray([...this.groupByList]);
    }
    this.searchForm = this.initializeSearchForm();
    this.filterForArReports();
    if(this.isAppointmentStatusReport){
      this.filterReport()
    }

	}

filterForArReports():void {
  
  if (this.isPaymentSummaryReport || this.isPaymentDetailReport) {
    const excludedIds = [11,14];
    this.groupByList = GroupByList?.filter((item) => {
      return !excludedIds.includes(item?.id);
    });


    if (this.isPaymentSummaryReport) {
      this.searchForm?.controls['end_date']?.valueChanges?.subscribe(
        (value) => {
          if (value != null) {
            this.endDateEvent.emit(value);
          } else {
            this.endDateCancelledEvent.emit(value);
          }
        }
      );
    }

  }
   else {
    
    this.dateTypes = this.dateTypes?.filter(
      (type) => type?.name !== 'Check Date'
    );
  }

  if (this.isDenialReport) {
    const excludedIds = [1, 2, 3, 4, 7, 8, 9,10,12,13,14];
    this.groupByList = GroupByList?.filter((item) => {
      return !excludedIds.includes(item?.id);
    });
  }

  if(this.isAppointmentSummaryReport) {
    this.groupByList = appointmentGroupByList;
    const excludedOfficeId = [25]
    this.groupByList = appointmentGroupByList?.filter((item)=>{
      return !excludedOfficeId.includes(item?.id);
    })
    this.subGroupByList = appointmentSubGroupByList;

    this.searchForm?.controls['group_by_id']?.valueChanges?.subscribe(
      (value) => {
        if (value === 25) {
        this.mandatoryFields.push('subgroupby_id')
      }
      else {
        this.mandatoryFields = this.mandatoryFields.filter(field => field !== 'subgroupby_id');
      }
    });  

    this.searchForm?.controls['in_house']?.valueChanges?.subscribe(
      (value) => {
        if (value != 'all') {
          const includeIds = [25]
          this.groupByList = appointmentGroupByList?.filter((item)=>{
            return includeIds.includes(item?.id);
          })
          this.searchForm.controls['group_by_id'].setValue(null);
        } else {
          this.groupByList = appointmentGroupByList;
          const excludedIds = [25]
          this.groupByList = appointmentGroupByList?.filter((item)=>{
            return !excludedIds.includes(item?.id);
          })
        }
      }
    );
    this.viewByList = ViewByListForApptSummaryReport;  
  }
  if(this.isArNewReport && !this.isDenialReport){
    const excludedDates = [3,4]
    this.dateTypes = DateTypes?.filter((item)=>{
      return !excludedDates.includes(item?.id);
    })
  const excludedIds = [4,6,12,13,11,7]
  this.groupByList = GroupByList?.filter((item)=>{
    return !excludedIds.includes(item?.id);
  })
  
}
}

ngAfterViewInit(): void {
	if (this.isArReport) {
		this.getArReportFilters();
    if(this.isDenialReport){
      this.searchForm.controls['date_range_type_id']?.valueChanges.subscribe(
        (value) => {
          if (value == this.dateRangeType.Custom) {
            this.searchForm.controls['start_date'].setValue(null);
            this.searchForm.controls['end_date'].setValue(null);
            this.searchForm.controls['date_type'].setValue(null);
          } 
        }
        );
    }
  
		if (
		  this.hideAndShowFilters('date_type') ||
		  this.hideAndShowFilters('date_range_type')
		) {
		  this.searchForm.controls['date_type']?.valueChanges.subscribe(
			(value) => {
			  if (value == null) {
				this.searchForm.controls['start_date'].disable();
				this.searchForm.controls['end_date'].disable();
			  } else {
				this.searchForm.controls['start_date'].enable();
				this.searchForm.controls['end_date'].enable();
				this.searchForm.controls['start_date'].setValue(null);
				this.searchForm.controls['end_date'].setValue(null);
			  }
			}
		  );
      this.cdr.detectChanges();
		}
    this.searchForm.controls['group_by_id']?.valueChanges.subscribe((value) => {
      if (value == null) {
        this.searchForm.controls['subgroup_by_id']?.setValue(null);
      } else {
        this.searchForm.controls['subgroup_by_id']?.enable();
      }
    });
    this.searchForm.controls['in_house']?.valueChanges.subscribe((value) => {
      if (value == null || value == 'all' ) {
        this.searchForm.controls['group_by_id']?.setValue(null);
      } else {
        this.searchForm.controls['group_by_id']?.enable();
      }
    });
    this.cdr.detectChanges();
    
		this.searchForm.controls[
		  'bill_recipient_type_id'
		]?.valueChanges.subscribe((value) => {
		  this.searchForm.controls['insurance_ids'].setValue(null);
		  this.billRecepientChangeEvent.emit(value);
		});
	  }
}
selectionOnValueChange(e: any, Type?) {
    const info = new ShareAbleFilter(e);
    this.searchForm.patchValue(removeEmptyAndNullsFormObject(info));
    this.getChange(e.data, e.label);
    if (!e.data || (e.data && e.data.length == 0)) {
      this.searchForm.controls[Type]?.setValue(null);
    }
  }

  getArReportFilters() {
    this.analyticsService.get(AnalyticsUrlsEnum.report_filters).subscribe(
      (res: any) => {
        let data = res && res.result ? res.result.data : null;
        if (data) {
          this.filterResponse = data[0];
          this.filterResponse.case_types = this.filterResponse.case_types
            ? this.filterResponse.case_types
            : [];
          this.filterResponse.practice_locations = this.filterResponse
            .practice_locations
            ? this.filterResponse.practice_locations
            : [];
          this.filterResponse.providers = this.filterResponse.providers
            ? this.filterResponse.providers
            : [];
          this.filterResponse.specialities = this.filterResponse.specialities
            ? this.filterResponse.specialities
            : [];
          this.filterResponse.attornies = this.filterResponse.attornies
            ? this.filterResponse.attornies
            : [];
          this.filterResponse.insurances = this.filterResponse.insurances
            ? this.filterResponse.insurances
            : [];
          this.filterResponse.patients = this.filterResponse.patients
            ? this.filterResponse.patients
            : [];
          this.filterResponse.employers = this.filterResponse.employers
            ? this.filterResponse.employers
            : [];
          this.filterResponse.firm_name = this.filterResponse.firm_name
            ? this.filterResponse.firm_name
            : [];
          
            this.getSelectedFilterValue();
        
        }
      },
      (err) => {}
    );
  }

  getSelectedFilterValue() {
    if (this.queryParams && Object.keys(this.queryParams).length > 0) {
      let queryParams = JSON.parse(JSON.stringify(this.queryParams));
      //Practice Location
      if ( queryParams?.facility_location_ids && queryParams?.facility_location_ids.length > 0 ) {
        queryParams.facility_location_ids = isArray(
          queryParams.facility_location_ids
        )
          ? queryParams.facility_location_ids
          : [Number(queryParams.facility_location_ids)];
        const facility_ids = isArray(queryParams.facility_location_ids)
          ? queryParams.facility_location_ids?.map((i) => Number(i))
          : Number(queryParams.facility_location_ids);
        this.facilityLocationFilterComponent.searchForm.controls[
          'common_ids'
        ].patchValue(facility_ids);
        this.searchForm.controls['facility_location_ids'].patchValue(
          queryParams.facility_location_ids
        );
      }
      //Insurance_name
      if (queryParams?.insurance_ids && queryParams?.insurance_ids.length > 0) {
        queryParams.insurance_ids = isArray(queryParams.insurance_ids)
          ? queryParams.insurance_ids
          : [Number(queryParams.insurance_ids)];
        const insurance_ids = isArray(queryParams.insurance_ids)
          ? queryParams.insurance_ids?.map((i) => Number(i))
          : Number(queryParams.insurance_ids);
        this.InsurancefilterComponent.searchForm.controls[
          'common_ids'
        ].patchValue(insurance_ids);
        this.searchForm.controls['insurance_ids'].patchValue(
          queryParams.insurance_ids
        );
      }
      // Patient Name 
      if(queryParams?.patient_ids && queryParams?.patient_ids.length > 0){
        queryParams.patient_ids = isArray(queryParams.patient_ids)
        ? queryParams.patient_ids
        : [Number(queryParams.patient_ids)];
      const patient_ids = isArray(queryParams.patient_ids)
        ? queryParams.patient_ids?.map((i) => Number(i))
        : Number(queryParams.patient_ids);
      this.patientFilterComponent.searchForm.controls[
        'common_ids'
      ].patchValue(patient_ids);
      this.searchForm.controls['patient_ids'].patchValue(
        queryParams.patient_ids
      );
      } 
      // Firm Name 
      if(queryParams?.firm_ids && queryParams?.firm_ids.length > 0){
        queryParams.firm_ids = isArray(queryParams.firm_ids)
        ? queryParams.firm_ids
        : [Number(queryParams.firm_ids)];
      const firm_ids = isArray(queryParams.firm_ids)
        ? queryParams.firm_ids?.map((i) => Number(i))
        : Number(queryParams.firm_ids);
      this.firmFilterComponent.searchForm.controls[
        'common_ids'
      ].patchValue(firm_ids);
      this.searchForm.controls['firm_ids'].patchValue(
        queryParams.firm_ids
      );
      } 
      // Attorney Name 
      if(queryParams?.attorney_ids && queryParams?.attorney_ids.length > 0){
        queryParams.attorney_ids = isArray(queryParams.attorney_ids)
        ? queryParams.attorney_ids
        : [Number(queryParams.attorney_ids)];
      const attorney_ids = isArray(queryParams.attorney_ids)
        ? queryParams.attorney_ids?.map((i) => Number(i))
        : Number(queryParams.attorney_ids);
      this.attorneyFilterComponent.searchForm.controls[
        'common_ids'
      ].patchValue(attorney_ids);
      this.searchForm.controls['attorney_ids'].patchValue(
        queryParams.attorney_ids
      );
      } 
      // Employer Name 
      if(queryParams?.employer_ids && queryParams?.employer_ids.length > 0){
        queryParams.employer_ids = isArray(queryParams.employer_ids)
        ? queryParams.employer_ids
        : [Number(queryParams.employer_ids)];
      const employer_ids = isArray(queryParams.employer_ids)
        ? queryParams.employer_ids?.map((i) => Number(i))
        : Number(queryParams.employer_ids);
      this.employerFilterComponent.searchForm.controls[
        'common_ids'
      ].patchValue(employer_ids);
      this.searchForm.controls['employer_ids'].patchValue(
        queryParams.employer_ids
      );
      } 
      // Bill Recipient Type 
      if (queryParams?.bill_recipient_type_id && queryParams?.bill_recipient_type_id.length > 0) {
        
        this.recipientFilterComponent.searchForm.controls['common_ids'].patchValue(Number(queryParams.bill_recipient_type_id));
        this.searchForm.controls['bill_recipient_type_id'].patchValue(
          Number(queryParams.bill_recipient_type_id)
        );
      }

      // Speciality Name
      if(queryParams?.speciality_ids && queryParams?.speciality_ids.length > 0){
        queryParams.speciality_ids = isArray(queryParams.speciality_ids)
        ? queryParams.speciality_ids
        : [Number(queryParams.speciality_ids)];
      const speciality_ids = isArray(queryParams.speciality_ids)
        ? queryParams.speciality_ids?.map((i) => Number(i))
        : Number(queryParams.speciality_ids);
  
      this.specialityFilterComponent.searchForm.controls[
        'common_ids'
      ].patchValue(speciality_ids);
      this.searchForm.controls['speciality_ids'].patchValue(
        queryParams.speciality_ids
      );
      }      
      //provider_name
      if (queryParams?.doctor_ids && queryParams?.doctor_ids.length > 0) {
        queryParams.doctor_ids = isArray(queryParams.doctor_ids)
          ? queryParams.doctor_ids
          : [Number(queryParams.doctor_ids)];
        const doctor_ids = isArray(queryParams.doctor_ids)
          ? queryParams.doctor_ids?.map((i) => Number(i))
          : Number(queryParams.doctor_ids);
        this.ProviderFilterComponent.searchForm.controls[
          'common_ids'
        ].patchValue(doctor_ids);
        this.searchForm.controls['doctor_ids'].patchValue(
          queryParams.doctor_ids
        );
      }
      //Case Type
      if (queryParams?.case_type_ids && queryParams?.case_type_ids.length > 0) {
        queryParams.case_type_ids = isArray(queryParams.case_type_ids)
          ? queryParams.case_type_ids
          : [Number(queryParams.case_type_ids)];
        const case_type_ids = isArray(queryParams.case_type_ids)
          ? queryParams.case_type_ids?.map((i) => Number(i))
          : Number(queryParams.case_type_ids);
        this.casetypefilterComponent.searchForm.controls[
          'common_ids'
        ].patchValue(case_type_ids);
        this.searchForm.controls['case_type_ids'].patchValue(
          queryParams.case_type_ids
        );
      }
      //Date range
      if (queryParams?.date_range_type_id) {
        this.dateRangeTypeRef.searchForm.controls['common_ids'].patchValue(
          Number(queryParams.date_range_type_id)
        );
        this.searchForm.controls['date_range_type_id'].patchValue(
          Number(queryParams.date_range_type_id)
        );
      }

      //group by
      if (queryParams?.group_by_id && queryParams?.group_by_id.length > 0) {
        this.groupbyFilterComponent.searchForm.controls[
          'common_ids'
        ].patchValue(Number(queryParams.group_by_id));
        this.searchForm.controls['group_by_id'].patchValue(
          Number(queryParams.group_by_id)
        );
        if(this.isArNewReport){
          if(queryParams.group_by_id === GroupByTypes.Practice_Location){
          const excludedIds = [4,6,12,13,11,7,1]
         this.subGroupByList = GroupByList.filter((item)=>{
          return !excludedIds.includes(item.id);
         })
         } 
        if(queryParams.group_by_id === GroupByTypes.Provider){
        const excludedIds = [4,6,12,13,11,7,3]
        this.subGroupByList = GroupByList.filter((item)=>{
        return !excludedIds.includes(item.id);
        })
         }
        if(queryParams.group_by_id === GroupByTypes.Speciality){
        const excludedIds = [4,6,12,13,11,7,2]
        this.subGroupByList = GroupByList.filter((item)=>{
        return !excludedIds.includes(item.id);
        })
        }
        if(queryParams.group_by_id === GroupByTypes.Case_Type){
        const excludedIds = [4,6,12,13,11,7,10]
        this.subGroupByList = GroupByList.filter((item)=>{
        return !excludedIds.includes(item.id);
        })
        }
        if(queryParams?.group_by_id === GroupByTypes.Practice){
          const excludedIds = [4,6,12,13,11,7,16]
          this.subGroupByList = GroupByList?.filter((item)=>{
          return !excludedIds?.includes(item.id);
          })
        }


        }

        if (queryParams.group_by_id === GroupByTypes.Denial_Reason) {
          this.querysubgoup = SubGroupByList.concat([
            { id: 6, name: 'Insurance' },
          ]);
          this.subGroupByList = this.querysubgoup;
        }
        if (queryParams.group_by_id === GroupByTypes.Insurance) {
          this.querysubgoup = SubGroupByList.concat([
            { id: 11, name: 'Denial Reason' },
          ]);
          this.subGroupByList = this.querysubgoup;
        }
      }
      //sub group by
      if (queryParams?.subgroup_by_id && queryParams?.subgroup_by_id.length > 0) {
        this.SubgroupbyFilterComponent.searchForm.controls[
          'common_ids'
        ].patchValue(Number(queryParams.subgroup_by_id));
        this.searchForm.controls['subgroup_by_id'].patchValue(
          Number(queryParams.subgroup_by_id)
        );
    
      }
      //Aggregate
      if (queryParams?.Aggregate && queryParams?.Aggregate.length > 0) {
        this.AggregateFilterComponent.searchForm.controls[
          'common_ids'
        ].patchValue(Number(queryParams.Aggregate));
        this.searchForm.controls['Aggregate'].patchValue(
          Number(queryParams.Aggregate)
        );
      }
      // date_type
      if (queryParams?.date_type) {
        setTimeout(() => {
			this.DateTypefiltercomponent?.searchForm.controls['common_ids'].patchValue(Number(queryParams.date_type));
      this.searchForm.controls['date_type'].patchValue(Number(queryParams.date_type));
    //start_date
    if (queryParams?.start_date) {
      this.searchForm.controls['start_date'].patchValue(queryParams.start_date);
    }
    //end_date
    if (queryParams?.end_date) {
      this.searchForm.controls['end_date'].patchValue(queryParams.end_date);
    }
    }, 100)
  }
}
  }


  inHouseEvent(key, event) {
  String(key);
	if(event?.target?.checked === false || event?.data){
    if(Array.isArray(event?.data) && event?.data.length > 1) {
      const selectedIds = event?.data.map(item => item?.id);
      this.searchForm.get('in_house').setValue(selectedIds);
    }
    else if(Array.isArray(event?.data) && event?.data.length === 1) {
      const singleId : number= event?.data[0]?.id;
      this.searchForm.get('in_house').setValue([singleId]);      
    } 
    else if(typeof event?.data === 'object' && event?.data !== null && !Array.isArray(event.data)){
      this.searchForm.get('in_house').setValue([event?.data?.id]); 
    }
    
    else {
      this.searchForm.get('in_house').setValue(['all']);
    }
		return;
	}else if(typeof event?.data === 'undefined'){
    this.searchForm.get('in_house').setValue(['all']); 
  }
    if (key === 'is_referral') {
      this.searchForm.controls['facility_location_ids'].setValue(null);
      this.getChange([], 'clinic_location_ids');
      this.keyToPass.emit(key)
    } else {
      this.keyToPass.emit(key)
      this.searchForm.controls['clinic_location_ids'].setValue(null);
      this.getChange([], 'facility_location_ids');
    }
    if (this.searchForm.controls['in_house'].value === null) {
      this.searchForm.controls['facility_location_ids'].setValue(null);
      this.getChange([], 'clinic_location_ids');
      this.searchForm.controls['clinic_location_ids'].setValue(null);
      this.getChange([], 'facility_location_ids');
    }
  }

  getChange(event: any, fieldName: string) {
    if (event && event.length > 0) {
      this.selectedMultipleFieldFiter[fieldName] = event?.map(
        (data) =>
          new MappingFilterObject(
            data.id,
            data.name,
            data.full_Name,
            data.facility_full_name,
            data.label_id,
            data.insurance_name,
            data.employer_name,
            data.created_by_ids,
            data.updated_by_ids
          )
      );
    } else {
      if (fieldName === 'group_by_id') {
        if(event?.id != ViewBySummary.Offices){
        if (event && Object.keys(event)?.length > 0) {
          this.subGroupByList = makeDeepCopyArray([
            ...this.groupByList.filter((list) => list.id != event.id),
          ]);
          if(this.isAppointmentSummaryReport){
            this.subGroupByList = appointmentSubGroupByList;
            this.subGroupByList = appointmentSubGroupByList?.filter((item)=>{
              return !([event.id]).includes(item?.id);
            })
          }

          if(this.isDenialReport){
          this.subGroupByList.push(
            { id: 3, name: 'Provider' },
            { id: 4, name: 'Patient' }
          );
          }
        } else {
          this.subGroupByList = makeDeepCopyArray([...this.groupByList]);
          if(this.isAppointmentSummaryReport){
            this.subGroupByList = appointmentSubGroupByList;
          }
        }
      }
      }
    }
  }
	get getOrderBy(){
		return {order_by:OrderEnum.ASC}
	}
  initializeSearchForm(): FormGroup {
    this.searchForm = this.fb.group({
      insurance_id: [null],
      insurance_ids: [null],
      patient_ids: [null],
      employer_ids: [null],
      appointment_status_ids: [null],
      clinic_location_ids: [null],
      in_house: [this.isArReport ? null : 'all'],
      claim_no: [null],
      no_of_days: [null],
      no_of_days_from: [null],
      no_of_days_to: [null],
      case_type_ids: [null],
      icd_code_ids: [null],
      visit_type_ids: [null],
      doa: [null],
      case_ids: [null],
      visit_date: [null],
      appointment_type_ids: [null],
      facility_location_ids: [null],
      visit_status_ids: [],
      patient_name: null,
      speciality_ids: [null],
      doctor_ids: [null],
      appointment_type_id: [null],
      speciality_id: [null],
      billable: [null],
      attorney_ids: [null],
      firm_ids: [null],
      created_by_ids: [null],
      updated_by_ids: [null],
      bill_recipient_type_id: [null],
      date_type: [null],
      group_by_id: [null],
      subgroup_by_id: [null],
      Aggregate: [null],
      view_by_id: [null],
      date_range_type_id: [],
      As_of: [
        changeDateFormat(new Date()),
        [
          Validators.pattern(
            '^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'
          ),
          Validators.maxLength(10),
        ],
      ],
      start_date: [
        this.isAppointmentStatusReport 
          ? this.newFunc()
          :
        this.isArReport || this.isPaymentDetailReport
          ? null
          : changeDateFormat(new Date()),
        [
          Validators.pattern(
            '^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'
          ),
          Validators.maxLength(10),
        ],

      ],
      end_date: [
        this.isAppointmentStatusReport 
          ? this.newFunc()
          :
        this.isArReport || this.isPaymentDetailReport
          ? null
          : changeDateFormat(new Date()),
        [
          Validators.pattern(
            '^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'
          ),
          Validators.maxLength(10),
        ],
      ],
      created_at: [
        null,

        [
          Validators.pattern(
            '^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'
          ),
          Validators.maxLength(10),
        ],
      ],

      updated_at: [
        null,

        [
          Validators.pattern(
            '^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'
          ),
          Validators.maxLength(10),
        ],
      ],
    });
    return this.searchForm;
  }
  
  filterReport() {
    
    let params = this.searchForm.value;
    params['start_date'] = changeDateFormat(params['start_date']);
    params['end_date'] = changeDateFormat(params['end_date']);
    params['As_of'] = changeDateFormat(params['As_of']);
    params['created_at'] = changeDateFormat(params['created_at']);
    params['updated_at'] = changeDateFormat(params['updated_at']);
    
    //   this.groupDataEvent.emit({ groupBy: this.groupByList.find(obj => obj.id == params.group_by_id)?.name, subGroupBy: this.groupByList.find(obj => obj.id == params.subgroup_by_id)?.name });
    this.groupDataEvent.emit({
      groupBy: this.groupByList.find((obj) => obj.id == params.group_by_id)
      ?.name,
      subGroupBy: this.subGroupByList.find(
        (obj) => obj.id == params.subgroup_by_id
      )?.name,
    });
    const dateRangeTypeId = this.searchForm.get('date_range_type_id')?.value;
    if (dateRangeTypeId !== this.dateRangeType.Custom && dateRangeTypeId !== null){
      this.searchForm.controls['end_date'].setValue(null)
      this.searchForm.controls['start_date'].setValue(null)
      this.searchForm.controls['date_type'].setValue(null)
    }
    this.reportFilter.emit(removeEmptyAndNullsFormObject(params));
  }
  
  resetFilter() {
    this.hasShownInfoMessage = false;
    this.searchForm = this.initializeSearchForm();
    this.searchForm.controls['start_date'].setValue(
      this.isArReport ? null : changeDateFormat(new Date())
    );
    this.searchForm.controls['end_date'].setValue(
      this.isArReport ? null : changeDateFormat(new Date())
    );
    this.searchForm.controls['As_of'].setValue(changeDateFormat(new Date()));
    let params = removeEmptyAndNullsFormObject(this.searchForm.value);
    this.eventsSubject.next(true);
    this.groupDataEvent.emit(null);
    this.resetFilterEvent.emit(params);
  }
  newFunc(){
    const today = new Date();
    const previousDate = new Date(today);
    previousDate.setDate(today.getDate() - 1); // Set to yesterday

    // Format the date as YYYY-MM-DD (assuming that's your input format)
    const formattedDate = previousDate.toISOString().split('T')[0];
    return formattedDate
  }
  isDisableFilterButton(): boolean {
    if (this.isArSummaryReport) {
      const groupBySelected = this.searchForm.get('group_by_id')?.value != null;
      const startDateSelected = this.searchForm.get('start_date')?.value != null;
      const endDateSelected = this.searchForm.get('end_date')?.value != null;
      const groupByValue = this.searchForm.get('group_by_id')?.value;
      const subGroupBySelected = groupByValue === 25 
        ? this.searchForm.get('subgroup_by_id')?.value != null 
        : true; 
  
      if (groupBySelected && startDateSelected && endDateSelected && subGroupBySelected) {
        return false;
      }
      if (
        ((this.searchForm.get('group_by_id')?.value == null &&
        this.hideAndShowFilters('group_by')) ||
        this.searchForm.get('date_type')?.value == null ||
        this.searchForm.get('start_date')?.value == null ||
        this.searchForm.get('end_date')?.value == null) 
        && ( this.searchForm.get('date_type')?.value == null ||
          !this.hideAndShowFilters('as_of') &&
           !this.hideAndShowFilters('date_range_type'))
      ) {
        return true;
      } else if (
        (this.searchForm.get('start_date')?.value == null ||
          this.searchForm.get('end_date')?.value == null) &&
          !this.hideAndShowFilters('date_range_type')
        ) {
          return true;
        } else 
        if (
          (this.searchForm.get('start_date')?.value == null ||
          this.searchForm.get('end_date')?.value == null) &&
          this.hideAndShowFilters('date_range_type') && 
          this.searchForm.get('date_range_type_id')?.value ==
          this.dateRangeType.Custom
        ) {
          return true;
        } else if (
          this.hideAndShowFilters('date_range_type') &&
          this.searchForm.get('date_range_type_id')?.value == null
        ) {
        return true;
      }
      if (groupByValue === 25 && !subGroupBySelected) {
        return true; 
      }
    }
    if (this.isArSummaryReport && this.isDenialReport) {
      const startDate = this.searchForm.get('start_date')?.value;
      const endDate = this.searchForm.get('end_date')?.value;
      const dateType = this.searchForm.get('date_type')?.value;
      const dateRangeTypeId = this.searchForm.get('date_range_type_id')?.value;
      if (
        (startDate == null || endDate == null || dateType == null) &&
        dateRangeTypeId == this.dateRangeType.Custom
      ) {
        
        return true;
      } else if (dateRangeTypeId == null) {
        return true;
      } 
    }
    return false;
  }



  
  
  
  isShowDateTypeFilter(): boolean {
      if (
        this.hideAndShowFilters('date_type') ||
        (this.hideAndShowFilters('date_range_type') &&
        this.searchForm.get('date_range_type_id')?.value ==
         this.dateRangeType.Custom ))
       {
        if (this.isDenialReport) { // Check if dialog is already opened
          if(!this.hasShownInfoMessage){
            this.toastrService.info('Select "date range from" and "date range to", in order to generate report');
            this.hasShownInfoMessage = true;
            }
        }
        return true;
      }
      return false;
    }
    hideAndShowFilters(filterName: string = ''): boolean {
      return this.filtersIncludes?.includes(filterName);
  }
}
