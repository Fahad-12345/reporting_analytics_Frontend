// import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
// import { FormBuilder, FormGroup } from '@angular/forms';
// import { EnumApiPath } from '@appDir/front-desk/billing/Models/searchedKeys-modal';
// import { ReportsService } from '@appDir/front-desk/reports/reports.service';
// import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
// import { ShareAbleFilter } from '@appDir/shared/models/share-able-filter';

// import { Location } from '@angular/common';
// import { Router } from '@angular/router';
// import { AnalyticsService } from '@appDir/analytics/analytics.service';
// import { AnalyticsUrlsEnum } from '@appDir/analytics/helpers/analytics_Urls_enum';
// import { IFilterFieldHtml } from '@appDir/shared/filter/model/filter-field-html-model';
// import { changeDateFormat, removeEmptyAndNullsFormObject } from '@appDir/shared/utils/utils.helpers';
// import { Subject, Subscription } from 'rxjs';
// import { FilterResponseModel } from '../../model/filter-response.model';
// @Component({
//   selector: 'app-visit-report-filters',
//   templateUrl: './visit-report-filters.component.html',
//   styleUrls: ['./visit-report-filters.component.scss'],
//   encapsulation:ViewEncapsulation.None
// })
// export class VisitReportFiltersComponent implements OnInit, OnDestroy {
//   /**** Angular Core */
//   @Input() public showFilterFields: IFilterFieldHtml;
//   @Output() filterFieldEmitter: EventEmitter<any> = new EventEmitter();
//   @Output() onResetClickedEmitter: EventEmitter<any> = new EventEmitter();
//   searchVisitForm: FormGroup;
//   /*** Local variable */
//   isCollapsed: boolean = false;
//   minDate = new Date('2016/01/01');
//   maxDate = new Date()
//   /***** */
//   /**** Model and Collections */
//   selectedMultipleFieldFiter: any = {
// 		'practice_locations_ids': [],
//     'visit_type_ids':[],
//     'case_type_ids':[],
//     'doctor_ids':[],
//     'speciality_ids':[],
    

// 	}
//   statusList: any[] = [];

//   eventsSubject: Subject<any> = new Subject();
//   requestServerpath = REQUEST_SERVERS;
//   EnumApiPath = EnumApiPath;
//   subsription: Subscription[] = [];
//   filterResponse:FilterResponseModel = {
//     practice_locations:[],
//     providers:[],
//     specialities:[],
//     statuses:[],
//     case_types:[],
//     visit_types:[]
//   };
//   /***** */
//   constructor(private formBuilder: FormBuilder, private reportService: ReportsService, private location: Location, private _router: Router,private analyticsService : AnalyticsService) {
//     this.initFormControlls();


//   }
//   ngOnInit(): void {
//     this.getReportFilters();
//   }
//   ngOnDestroy(): void {
//     this.subsription?.forEach((subsription: Subscription) => {
//       subsription?.unsubscribe();
//     })
//   }
//   initFormControlls() {
//     this.searchVisitForm = this.formBuilder.group({
//       case_type_ids: [],
//       practice_locations_ids: [],
//       doctor_ids: [],
//       status_id: "",
//       speciality_ids: [],
//       fromDate: "",
//       toDate: '',
//       visit_type_ids: [],
//       group_by_id:null

//     })
//   }
//   filterHandler() {
//     const fromDate = changeDateFormat(this.searchVisitForm.value.fromDate);
//     this.searchVisitForm.get('fromDate').setValue(fromDate);
//     const toDate = changeDateFormat(this.searchVisitForm.value.date_of_accident_to);
//     this.searchVisitForm.get('toDate').setValue(toDate);
//     this.filterFieldEmitter.emit(this.searchVisitForm);
//   }

//   getReportFilters() {
//     this.subsription.push(
//       this.analyticsService.get(AnalyticsUrlsEnum.visit_report_filters)
//         .subscribe(
//           (res: any) => {
//             let data = res && res.result ? res.result.data : null;
//             if(data){
//               this.filterResponse = data
//             }
//           },
//           (err) => {
//           },
//         ),
//     );
//   }
//   selectionOnValueChange(e: any, Type?) {
//     const info = new ShareAbleFilter(e);
//     this.searchVisitForm.patchValue(removeEmptyAndNullsFormObject(info));
//     this.getChange(e.data, e.label);
//     if (!e.data) {
//       this.searchVisitForm.controls[Type].setValue(null);
//     }
//   }

//   getChange($event: any[], fieldName: string) {
//     if ($event) {
//       //  this.selectedMultipleFieldFiter[fieldName] = $event.map(data => new MappingFilterObject(data?.id, data?.name, data?.full_Name, data?.facility_full_name, data.data?.label_id, data?.created_by_name, data?.updated_by_name,));
//     }
//   }
//   onReset(param?) {
//     this.searchVisitForm.reset();
//     this.eventsSubject.next(true);
//     this.onResetClickedEmitter.emit();
//     this.addUrlQueryParams({});
//     this.isCollapsed = false;
//   }
//   /**
//    * Queryparams to make unique URL
//    * @param params
//    * @returns void
//    */
//   addUrlQueryParams(params: any): void {
//     this.location.replaceState(this._router.createUrlTree([], { queryParams: params }).toString());
//   }
// }

import { Location } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AnalyticsService } from '@appDir/analytics/analytics.service';
import { AnalyticsUrlsEnum } from '@appDir/analytics/helpers/analytics_Urls_enum';
import { EnumApiPath } from '@appDir/front-desk/billing/Models/searchedKeys-modal';
import { ReportsService } from '@appDir/front-desk/reports/reports.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { IFilterFieldHtml } from '@appDir/shared/filter/model/filter-field-html-model';
import { ShareAbleFilter } from '@appDir/shared/models/share-able-filter';
import { changeDateFormat, removeEmptyAndNullsFormObject } from '@appDir/shared/utils/utils.helpers';
import { Subject, Subscription } from 'rxjs';
import { FilterResponseModel } from '../../model/filter-response.model';
@Component({
  selector: 'app-visit-report-filters',
  templateUrl: './visit-report-filters.component.html',
  styleUrls: ['./visit-report-filters.component.scss'],
  encapsulation:ViewEncapsulation.None
})
export class VisitReportFiltersComponent implements OnInit, OnDestroy {
  /**** Angular Core */
  @Input() public showFilterFields: IFilterFieldHtml;
  @Output() filterFieldEmitter: EventEmitter<any> = new EventEmitter();
  @Output() onResetClickedEmitter: EventEmitter<any> = new EventEmitter();
  searchVisitForm: FormGroup;
  /*** Local variable */
  isCollapsed: boolean = false;
  minDate = new Date('2016/01/01');
  maxDate = new Date()
  /***** */
  /**** Model and Collections */
  selectedMultipleFieldFiter: any = {
    'practice_locations_ids': [],
    'visit_type_ids':[],
    'case_type_ids':[],
    'doctor_ids':[],
    'speciality_ids':[],
  }
  statusList: any[] = [];
  eventsSubject: Subject<any> = new Subject();
  requestServerpath = REQUEST_SERVERS;
  EnumApiPath = EnumApiPath;
  subsription: Subscription[] = [];
  filterResponse:FilterResponseModel = {
    practice_locations:[],
    providers:[],
    specialities:[],
    statuses:[],
    case_types:[],
    visit_types:[]
  };
  /***** */
  constructor(private formBuilder: FormBuilder, private reportService: ReportsService, private location: Location, private _router: Router,private analyticsService : AnalyticsService) {
    this.initFormControlls();
  }
  ngOnInit(): void {
    this.getReportFilters();
  }
  ngOnDestroy(): void {
    this.subsription?.forEach((subsription: Subscription) => {
      subsription?.unsubscribe();
    })
  }
  initFormControlls() {
    this.searchVisitForm = this.formBuilder.group({
      case_type_ids: [],
      practice_locations_ids: [],
      doctor_ids: [],
      status_id: "",
      speciality_ids: [],
      fromDate: "",
      toDate: "",
      visit_type_ids: [],
      group_by_id:null
    })
  }
  filterHandler() {
    const fromDate = changeDateFormat(this.searchVisitForm.value.fromDate);
    this.searchVisitForm.get('fromDate').setValue(fromDate);
    const toDate = changeDateFormat(this.searchVisitForm.value.toDate);
    this.searchVisitForm.get('toDate').setValue(toDate);
    this.filterFieldEmitter.emit(this.searchVisitForm);
  }
  getReportFilters() {
    this.subsription.push(
      this.analyticsService.get(AnalyticsUrlsEnum.report_filters)
        .subscribe(
          (res: any) => {
            
            let data = res && res.result ? res.result.data : null;
            if(data){
              this.filterResponse = data[0];
            }
          },
          (err) => {
          },
        ),
    );
  }
  selectionOnValueChange(e: any, Type?) {
    const info = new ShareAbleFilter(e);
    this.searchVisitForm.patchValue(removeEmptyAndNullsFormObject(info));
    this.getChange(e.data, e.label);
    if (!e.data) {
      this.searchVisitForm.controls[Type].setValue(null);
    }
  }
  getChange($event: any[], fieldName: string) {
    if ($event) {
      //  this.selectedMultipleFieldFiter[fieldName] = $event.map(data => new MappingFilterObject(data?.id, data?.name, data?.full_Name, data?.facility_full_name, data.data?.label_id, data?.created_by_name, data?.updated_by_name,));
    }
  }
  onReset(param?) {
    this.searchVisitForm.reset();
    this.eventsSubject.next(true);
    this.onResetClickedEmitter.emit();
    this.addUrlQueryParams({});
    this.isCollapsed = false;
  }
  /**
   * Queryparams to make unique URL
   * @param params
   * @returns void
   */
  addUrlQueryParams(params: any): void {
    this.location.replaceState(this._router.createUrlTree([], { queryParams: params }).toString());
  }
}
