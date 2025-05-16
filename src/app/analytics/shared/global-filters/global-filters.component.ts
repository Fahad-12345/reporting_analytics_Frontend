import { Component, EventEmitter, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AnalyticsService } from '@appDir/analytics/analytics.service';
import { GranalityType, GranalityTypeList } from '@appDir/analytics/helpers/granality-Type.enum';
import { RoleType } from '@appDir/analytics/helpers/role.enum';
import { TimeSpanTypeId } from '@appDir/analytics/helpers/time-span.enum';
import { GlobalFilter } from '@appDir/analytics/models/global.filter';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { AuthService } from '@appDir/shared/auth/auth.service';
import { MappingFilterObject } from '@appDir/shared/filter/model/mapping-filter-object';
import { ShareAbleFilter } from '@appDir/shared/models/share-able-filter';
import { GenerateMonths, GeneratePreviousMonthList, GeneratePreviousOneYearMonthList, ListOfDays, makeDeepCopyArray, removeEmptyAndNullsFormObject } from '@appDir/shared/utils/utils.helpers';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { Subject, debounceTime } from 'rxjs';
@Component({
  selector: 'app-global-filters',
  templateUrl: './global-filters.component.html',
  styleUrls: ['./global-filters.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class GlobalFiltersComponent implements OnInit {
  // Angular Core
  @Output() selectedFilterVal = new EventEmitter<any>(null);
  globalFilterSearchForm: FormGroup;
  //* Local variable//
  startDate = new Date();
  endDate = new Date();
  minDate = new Date('2016/01/01');
  maxDate = new Date()
  isShowGranularity: boolean = false;
  grouplocations: string = "";
  groupspecialities: string = "";
  groupproviders: string = "";
  case_type_ids: any[] = [];
  lengthLocation: number = 0;
  lengthFacilities: number = 0;
  lengthProviders: number = 0;
  logedInUserType: any;
  eventsSubject: Subject<any> = new Subject<any>();
  selectedMultipleFieldFilter: any = {
    facility_location_ids: [],
    speciality_ids: [],
    provider_ids: [],
    time_span_id: "",
    customDateRange: {
      toDate: "",
      fromDate: "",
      granularity_type_id: 2
    },
    chartName: ''
  };
  providers: any[] = [];
  specialites: any[] = [];
  providersCopy: any[] = [];
  specialitesCopy: any[] = [];
  locationsCopy: Array<any> = [];
  months: any[] = [];
  showFiller: boolean;
  locations: any[] = []
  granalityTypes: any[] = GranalityTypeList();
  copyGranalityTypes: any[] = [];
  caseTypes: any[] = []
  timeSpanTypeId = TimeSpanTypeId;
  userType = RoleType
  previousMonthsList: any[] = [];
  afterFilterData: any = {
    labels: ListOfDays(),
    dataLength: 7
  };
  clearDropdowns: boolean = false;
  showLocations: Boolean = false
  selectedFacility: any;
  facilities: any;
  showLocationNames = false;
  selectedfacility: any;
  locationFlagAdded: Boolean = false;
  showLocationss: Boolean = false;
  locationsAllowed: any = [];
  idsInAllowedLocations: any[] = [];
  isUserDoctor: Boolean = false;
  userId: number[] = [];
  isUserAdmin: Boolean = false;
  targetedDashboard : string = '';

  eventsSubjectAppointment: Subject<any> = new Subject<any>();
  hasShownInfoMessage: boolean = false;
  constructor(private _formBuilder: FormBuilder,
    private storageData: StorageData,
    private authService: AuthService,
    private analyticsService: AnalyticsService,
    private toastrService: ToastrService) {
    this.initGlobalFilterForm();
    this.copyGranalityTypes = JSON.parse(JSON.stringify(this.granalityTypes));
  }
  ngOnInit(): void {
    this.targetedDashboard = this.storageData.getDashboardNavigation()
    this.logedInUserType = this.authService.getUserType();
    this.populateFilters();
    this.months = GenerateMonths();
    const analyticsPermissions: any = this.storageData.getAnalyticsPermission();
    if (analyticsPermissions) {
      if (analyticsPermissions.dashboard_type?.length !== 0) {
        this.isUserAdmin = true;
      } else {
        this.isUserAdmin = false
      }
    }
    this.isUserDoctor = this.storageData.isDoctor();
    const userId = this.storageData.getUserId()
    this.userId.push(userId)
    let facilityLocations : any; 
    if(this.isUserDoctor || this.logedInUserType == this.userType?.PracticeManager ){
      facilityLocations = this.storageData?.getFacilityLocations()
      this.idsInAllowedLocations = facilityLocations
      if(this.isUserAdmin){
      this.globalFilterSearchForm.controls['facility_location_ids'].setValue(this.idsInAllowedLocations)
      }
      if(this.isUserDoctor && this.isUserAdmin){
        this.globalFilterSearchForm.controls['provider_ids'].setValue([userId])
      }

    }
    else
    {
    facilityLocations = this.storageData?.getUserPracticeLocationsData()
    if(facilityLocations && !this.isUserAdmin){
      this.locationsAllowed = Object?.values(facilityLocations)[0];
      this.idsInAllowedLocations = this.locationsAllowed?.map(item => item?.id);
    }
    }
    this.onEmitFilterSelectEvent();
    this.globalFilterSearchForm.valueChanges.pipe(debounceTime(500))
      .subscribe((value: any) => {
        let filtersValue: GlobalFilter = this.globalFilterSearchForm?.value;
        if (!this.hasShownInfoMessage) {
          this.toastrService.info("Use the button with 'funnel icon' to implement the filters selected");
          this.hasShownInfoMessage = true;
        }
        if (filtersValue?.facility_location_ids?.length > 0 || filtersValue?.speciality_ids?.length > 0 || filtersValue?.provider_ids?.length > 0) {
          this.resetDropdowns(filtersValue);
        }
      })
    this.globalFilterSearchForm?.controls['month_id'].valueChanges?.subscribe((value?) => {
      if (value) {
        this.globalFilterSearchForm.controls['time_span_id'].setValue(null);
      } else {
        if (!this.isShowGranularity) {
          this.globalFilterSearchForm.controls['time_span_id'].setValue(this.timeSpanTypeId.OneMonth);
        }

      }
    });

  }
  toggleShowMore() {
    this.showLocations = !this.showLocations;
  }
  toggleFacilityLocations(facility: any) {
    facility.showLocations = !facility.showLocations;
  }
  setSelectedFacility(facility: any) {
    this.selectedFacility = facility;
  }
  getChange($event: any[], fieldName: string) {
    if ($event) {
      this.selectedMultipleFieldFilter[fieldName] = $event.map(
        (data) =>
          new MappingFilterObject(
            data.id,
            data.name,
            data?.full_Name,
            data?.facility_full_name,
            data?.label_id,
            data?.insurance_name,
            data?.employer_name,
            data?.created_by_ids,
            data?.updated_by_ids,
          ),
      );
    }
  }

  selectionOnValueChange(e: any, Type?) {
    const info = new ShareAbleFilter(e);
    this.globalFilterSearchForm.patchValue(removeEmptyAndNullsFormObject(info));
    this.getChange(e.data, e.label);
    if (!e.data) {
      this.globalFilterSearchForm.controls[Type].setValue(null);
    }
  }
  getNumWeeksForMonth(year, month) {
    let date = new Date(year, month - 1, 1);
    let day = date.getDay();
    let numDaysInMonth = new Date(year, month, 0).getDate();
    return Math.ceil((numDaysInMonth + day) / 7);
  }
  initGlobalFilterForm() {
    this.globalFilterSearchForm = this._formBuilder.group({
      facility_location_ids: new FormControl([]),
      speciality_ids: new FormControl([]),
      provider_ids: new FormControl([]),
      case_type_ids: new FormControl([]),
      time_span_id: this.timeSpanTypeId.OneMonth,
      month_id: new FormControl(null),
      toDate: new FormControl(null),
      fromDate: new FormControl(null),
      granularity_type_id: new FormControl(null),
      chartName: new FormControl(null)
    })
  }

  //#region  Events
  onSelectTimeSpan(time_span_id: number) {
    this.globalFilterSearchForm.controls['time_span_id'].setValue(time_span_id);

  }
  setgranularityEmpty(value: any) {
    this.globalFilterSearchForm.controls['fromDate'].setValue(null);
    this.globalFilterSearchForm.controls['toDate'].setValue(null);
    this.globalFilterSearchForm.controls['granularity_type_id'].setValue(null);
    this.globalFilterSearchForm.controls['month_id'].setValue(value.id)

  }
  //#endregion
  validateGranularity() {
    //Validation
    if (this.globalFilterSearchForm.controls['fromDate'].value && !this.globalFilterSearchForm.controls['toDate'].value) {
      this.globalFilterSearchForm.controls['fromDate'].setValue(null);
    }

    if (this.globalFilterSearchForm.controls['fromDate'].value && this.globalFilterSearchForm.controls['toDate'].value) {
      var fromDate = new Date(this.globalFilterSearchForm.controls['fromDate'].value)
      var toDate = new Date(this.globalFilterSearchForm.controls['toDate'].value)
      var diff = Math.abs(fromDate.getTime() - toDate.getTime());
      var diffDays = Math.ceil(diff / (1000 * 3600 * 24));
      this.isShowGranularity = true;
      if (diffDays >= 0 && diffDays < 21) {

        this.globalFilterSearchForm.controls['granularity_type_id'].setValue(GranalityType.Daily);
      } else if (diffDays >= 21 && diffDays < 60) {
        this.globalFilterSearchForm.controls['granularity_type_id'].setValue(2);
      }
      else if (diffDays >= 60 && diffDays <= 364) {

        this.globalFilterSearchForm.controls['granularity_type_id'].setValue(GranalityType.Monthly);
      }

      else if (diffDays > 364) {

        this.globalFilterSearchForm.controls['granularity_type_id'].setValue(GranalityType.Yearly);
      }


      if (this.globalFilterSearchForm.controls['fromDate'].value && this.globalFilterSearchForm.controls['toDate'].value) {
        this.globalFilterSearchForm.controls['time_span_id'].setValue(null);
        this.globalFilterSearchForm.controls['month_id'].setValue(null);
      }
    } else {

      this.clearDate();
    }

  }
  clearDate(event?) {
    if (event) {
      event.stopPropagation();
    }
    this.globalFilterSearchForm.controls['fromDate'].setValue(null);
    this.globalFilterSearchForm.controls['toDate'].setValue(null);
    this.globalFilterSearchForm.controls['granularity_type_id'].setValue(null);
    this.isShowGranularity = false;
    this.granalityTypes = this.copyGranalityTypes;
    this.globalFilterSearchForm.controls['time_span_id'].setValue(this.timeSpanTypeId.OneMonth);
    this.onEmitFilterSelectEvent()
    //this.globalFilterSearchForm.controls['month_id'].enable();
  }

  onEmitFilterSelectEvent() {
    let filtersValue: GlobalFilter = this.globalFilterSearchForm.value;
    if (filtersValue.time_span_id == this.timeSpanTypeId.OneWeek) {
      this.afterFilterData.labels = ListOfDays();
      this.afterFilterData.dataLength = 7;

    } else if (filtersValue.time_span_id == this.timeSpanTypeId.OneYear) {

      this.afterFilterData.labels = GeneratePreviousOneYearMonthList();
      this.afterFilterData.dataLength = 12;
    } else if (filtersValue.time_span_id == this.timeSpanTypeId.SixMonth) {

      this.afterFilterData.labels = GeneratePreviousMonthList();
      this.afterFilterData.dataLength = 6;
    } else if (filtersValue.time_span_id == this.timeSpanTypeId.MTD) {
      const getDaysInMonth = (month, year) => (new Array(31)).fill('').map((v, i) => new Date(year, month, i + 1)).filter(v => v.getMonth() === month);

      let monthToDates: any[] = getDaysInMonth(new Date().getMonth(), new Date().getFullYear());
      const dateIndex = monthToDates.reverse().findIndex(date => new Date(date).getDate() == new Date().getDate());
      monthToDates = monthToDates.splice(dateIndex + 1);
      monthToDates = monthToDates.map(date => date = moment(date).format('DD/MM/YY'));

      this.afterFilterData.labels = monthToDates
      this.afterFilterData.dataLength = monthToDates.length;
    } else if (filtersValue.time_span_id == this.timeSpanTypeId.OneMonth) {

      let today = new Date();
      let last30thDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 31);
      var monthToDates = this.getDatesBetweenDates(last30thDay, today).filter((date => new Date(date).getDay() == 0)).map(date => moment(date).format("D/MM/YYYY"));
      this.afterFilterData.labels = monthToDates
      this.afterFilterData.dataLength = monthToDates.length;
    }
    else if (filtersValue.month_id > 0) {
      this.isShowGranularity = false;
      let monthDate = new Date();
      const startDate = moment([monthDate.getFullYear(), filtersValue.month_id - 1, 1]).toDate() as any;
      let last30thDay = new Date(monthDate.getFullYear(), filtersValue.month_id, 30 - 31);
      var monthToDates = this.getDatesBetweenDates(startDate, last30thDay).filter((date => new Date(date).getDay() == 0)).map(date => moment(date).format("D/MM/YYYY"));
      this.afterFilterData.labels = monthToDates
      this.afterFilterData.dataLength = monthToDates.length;

    }
    else if (filtersValue.fromDate && filtersValue.toDate) {

      if (filtersValue.granularity_type_id == GranalityType.Daily) {
        let customDates = this.getDatesBetweenDates(filtersValue.fromDate, filtersValue.toDate).map(date => moment(date).format("D/MM/YYYY"));
        this.afterFilterData.labels = customDates
        this.afterFilterData.dataLength = customDates.length;
      } else if (filtersValue.granularity_type_id == GranalityType.Weekly) {
        let customDates = this.getDatesBetweenDates(filtersValue.fromDate, filtersValue.toDate).filter((date => new Date(date).getDay() == 0)).map(date => moment(date).format("D/MM/YYYY"));
        this.afterFilterData.labels = customDates
        this.afterFilterData.dataLength = customDates.length;
      } else if (filtersValue.granularity_type_id == GranalityType.Monthly) {
        let customDates = [];
        if (new Date(filtersValue.fromDate).getMonth() == new Date(filtersValue.toDate).getMonth()) {
          customDates.push(moment(filtersValue.fromDate).format('D/MM/YYYY'));
        } else {
          let customDatesOfMonth = this.getDatesBetweenDates(filtersValue.fromDate, filtersValue.toDate);
          customDatesOfMonth.forEach((date, index) => {
            let existingDate = customDates.find(x => new Date(x).getMonth() == new Date(date).getMonth());
            if (!existingDate && index == 0) {
              customDates.push(filtersValue.fromDate);
            } else if (!existingDate) {
              customDates.push(moment(date).startOf('month'));
            }
          });
          customDates = customDates.map(date => date = moment(date).format('D/MM/YYYY'))
        }
        this.afterFilterData.labels = customDates
        this.afterFilterData.dataLength = customDates.length;
      }
      else if (filtersValue.granularity_type_id == GranalityType.Yearly) {
        let customDates = [];
        if (new Date(filtersValue.fromDate).getFullYear() == new Date(filtersValue.toDate).getFullYear()) {
          customDates.push(moment(filtersValue.fromDate).format('YYYY'));
        } else {
          let customDatesOfMonth = this.getDatesBetweenDates(filtersValue.fromDate, filtersValue.toDate);
          customDatesOfMonth.forEach((date, index) => {
            let existingDate = customDates.find(x => new Date(x).getFullYear() == new Date(date).getFullYear());
            if (!existingDate && index == 0) {
              customDates.push(filtersValue.fromDate);
            } else if (!existingDate) {
              customDates.push(moment(date).startOf('year'));
            }
          });
          customDates = customDates.map(date => date = moment(date).format('YYYY'))
        }

        this.afterFilterData.labels = customDates
        this.afterFilterData.dataLength = customDates.length;
      }

    }


    this.afterFilterData.filters = filtersValue;

    if (filtersValue.facility_location_ids.length == 0 || filtersValue.speciality_ids.length == 0 || filtersValue.provider_ids.length == 0) {

      this.locations = [];
      this.specialites = [];
      this.providers = [];
      this.locations = [...this.locationsCopy];
      this.specialites = [...this.specialitesCopy];
      this.providers = [...this.providersCopy];
    }

  // Added to filter data according to user practise locations
    if(this.afterFilterData.filters.facility_location_ids.length === 0 && !this.isUserAdmin){
    this.afterFilterData.filters.facility_location_ids = this.idsInAllowedLocations
    }

    // if user is doctor, add its id in providers filter to show only data of current doctor
    if (this.isUserDoctor && !this.isUserAdmin && this.logedInUserType != this.userType?.PracticeManager) {
      this.afterFilterData.filters.provider_ids = this.userId;
    }
    this.selectedFilterVal.emit(this.afterFilterData);

  }

  emptyFilters(filtersValue) {
    if (filtersValue.facility_location_ids.length === 0 && filtersValue.speciality_ids.length > 0) {

      this.globalFilterSearchForm.controls['facility_location_ids'].reset([]);
      this.globalFilterSearchForm.controls['speciality_ids'].reset([]);
      this.globalFilterSearchForm.controls['provider_ids'].reset([]);
      // this.globalFilterSearchForm.controls['facility_location_ids'].setValue([]);

      // this.globalFilterSearchForm.get('facility_location_ids').valueChanges.subscribe(()=>{
      //   this.globalFilterSearchForm.get('speciality_ids').setValue([]);
      //   this.globalFilterSearchForm.get('provider_ids').setValue([]);
      // });
      // this.locations = [];
      // this.specialites = [];
      // this.providers = [];
      // this.locations =makeDeepCopyArray([...this.locationsCopy]);
      // this.specialites =makeDeepCopyArray([...this.specialitesCopy]);
      // this.providers =makeDeepCopyArray([...this.providersCopy]);
      //this.populateFilters();
    }
  }
  onRemove(event: any) {
    // if (this.specialites.some((condition) => condition == event.value.id)) {
    //   this.selectedCity.push(event.value);
    //   this.selectedCity = [...this.selectedCity];
    // }
  }
  getDatesBetweenDates(startDate, endDate): Array<string> {
    var dateArray = [];
    var currentDate = moment(startDate);
    var stopDate = moment(endDate);
    while (currentDate <= stopDate) {
      dateArray.push(moment(currentDate))
      currentDate = moment(currentDate).add(1, 'days');
    }
    return dateArray;
  }
  resetDropdowns(filtersValue) {
    // if(filtersValue.facility_location_ids.length === 0 && filtersValue.speciality_ids.length > 0 ){
    //   this.emptyFilters(filtersValue)
    // }
    if (filtersValue.facility_location_ids.length > 0) {
      this.specialites = [];
      this.providers = [];
      let locsDump: Set<number> = new Set(filtersValue.facility_location_ids);
      let specsInprovDump: Set<string> = new Set();
      let specDumpArray: number[] = [];

      ///////////////// for specialities

      locsDump?.forEach(loc => {
        this.specialitesCopy?.forEach(spec => {
          const finded = spec?.facility_ids?.find((f?) => f === loc);
          if (finded != undefined) {
            if (!specsInprovDump?.has(JSON.stringify(spec))) {
              specsInprovDump?.add(JSON.stringify(spec));
              this.specialites?.push(spec);
            }
          }
        })
      });


      ///////////////// for providers

      this.specialites.forEach(s => {
        specDumpArray.push(s.id);
      });

      let specDump = new Set(specDumpArray);

      specDump?.forEach(spec => {
        this.providersCopy?.forEach(prov => {
          const finded = prov?.speciality_ids?.find((s?) => s === spec);
          if (finded != undefined) {
            if (!specsInprovDump?.has(JSON.stringify(prov))) {
              specsInprovDump?.add(JSON.stringify(prov));
              this.providers?.push(prov);
            }
          }
        })
      });
      this.lengthLocation = filtersValue.facility_location_ids

    } else if (filtersValue.speciality_ids.length > 0) {

      this.locations = [];
      this.providers = [];
      let specDump: Set<number> = new Set(filtersValue.speciality_ids);
      let locsDump: Set<number> = new Set();
      let specsInprovDump: Set<string> = new Set();

      ///////////////// for locations

      this.specialites?.forEach(spec => {
        if (specDump?.has(spec?.id)) {
          spec?.facility_ids?.forEach(id => {
            locsDump?.add(id);
          })
        }
      });

      this.locations?.push(...this.locationsCopy?.filter(l => {
        if (locsDump?.has(l?.id)) {
          return l;
        }
      }));


      ///////////////// for providers

      specDump?.forEach(spec => {
        this.providersCopy?.forEach(prov => {

          const finded = prov?.speciality_ids?.find((s?) => s === spec);
          if (finded != undefined) {
            if (!specsInprovDump?.has(JSON.stringify(prov))) {
              specsInprovDump?.add(JSON.stringify(prov));
              this.providers?.push(prov);
            }
          }
        })
      });

      this.lengthFacilities = filtersValue?.speciality_ids
    } else if (filtersValue?.provider_ids?.length > 0) {
      this.locations = [];
      this.specialites = [];

      let provDump: Set<number> = new Set(filtersValue?.provider_ids);
      let specDump: Set<number> = new Set();
      let NewlocDumpIDsArray: number[] = [];

      ///////////////// For specialities

      this.providers?.forEach(prov => {
        if (provDump?.has(prov?.id)) {
          prov?.speciality_ids?.forEach(id => {
            specDump?.add(id);
          })
        }
      });

      this.specialites?.push(...this.specialitesCopy?.filter(s => {
        if (specDump?.has(s?.id)) {
          return s;
        }
      }));

      this.specialites?.forEach(s => {
        NewlocDumpIDsArray?.push(...s?.facility_ids);
        return s;
      });

      ///////////////// for locations

      let uniquelocIDsDump: Set<number> = new Set(NewlocDumpIDsArray);

      uniquelocIDsDump?.forEach(ul => {
        const finded = this.locationsCopy?.find(l => l?.id == ul);
        if (finded != undefined) {
          this.locations?.push(finded);
        }
      });
    }
  }
  emptyDropdowns() {
    this.locations = [];
    this.specialites = [];
    this.providers = [];
    this.locations = makeDeepCopyArray([...this.locationsCopy]);
    this.specialites = makeDeepCopyArray([...this.specialitesCopy]);
    this.providers = makeDeepCopyArray([...this.providersCopy]);
    this.globalFilterSearchForm.controls['facility_location_ids'].reset([]);
    this.globalFilterSearchForm.controls['speciality_ids'].reset([]);
    this.globalFilterSearchForm.controls['provider_ids'].reset([]);
  }
  populateFilters() {
    // Populate Locations, specialities, providers array 
    this.analyticsService.get('global-filter-dropdowns').subscribe((response: any) => {
      // Reset Locations, specialities, providers array
      this.locations = [];
      this.specialites = [];
      this.providers = [];
      this.caseTypes = [];
      const uniqueLocationsObjectsSet: Set<string> = new Set();
      const uniqueSpecialitiesObjectsSet: Set<number> = new Set();
      const uniqueProvidersObjectsSet: Set<number> = new Set();
      if (response && response?.result?.data) {
        response['result']['data']['dependents']?.forEach((element?) => {
          // Filter Location array to keep unique objects
          element['specialities']?.forEach((loc?) => {
            const combinedKey = `${loc.facility_location_name}|${element.facility_name}`; // Combine location and facility name for comparison
            const isUnique = !uniqueLocationsObjectsSet.has(combinedKey); // Check if the combined key is in the set
            if (isUnique) {
              uniqueLocationsObjectsSet.add(combinedKey); // Add the combined key to the set
              this.locations.push({ id: loc.facility_location_id, name: loc.facility_location_name, facility: element.facility_name, facility_name: element.facilities_name });
            }
            return isUnique;
          });
          // Filter Specialities array to keep unique objects
          element['specialities']?.forEach((spec?) => {
            const isUnique = !uniqueSpecialitiesObjectsSet?.has(spec?.speciality_id);
            if (isUnique) {
              uniqueSpecialitiesObjectsSet?.add(spec?.speciality_id);
              this.specialites?.push({ id: spec?.speciality_id, name: spec?.speciality_name, facility_ids: [spec?.facility_location_id] });
            } else {
              this.specialites?.forEach(s => {
                if (s?.id == spec?.speciality_id) {
                  s?.facility_ids?.push(spec?.facility_location_id);
                }
              })
            }
          });


          // Filter providers array to keep unique objects
          element['providers']?.forEach((prov?) => {
            const isUnique = !uniqueProvidersObjectsSet?.has(prov?.provider_id);
            if (isUnique) {
              uniqueProvidersObjectsSet?.add(prov?.provider_id);
              this.providers?.push({ id: prov?.provider_id, full_name: prov?.provider_name, speciality_ids: [prov?.speciality_id] });
            } else {
              this.providers?.forEach(p => {
                if (p?.id == prov?.speciality_id) {
                  p?.speciality_ids?.push(prov?.speciality_id);
                }
              })
            }
          });
        });
        // Populate Case types
        response['result']['data']['independent']?.forEach((element?) => {
          element['casetypes']?.forEach((casee?) => {
            this.caseTypes?.push({ case_type_id: casee?.case_type_id, case_type_name: casee?.case_type_name });
          });
        });
        this.locationsCopy = [];
        this.specialitesCopy = [];
        this.providersCopy = [];
        if (!this.isUserAdmin) {
          this.filterAccordUserData();
        }
        this.addFlagsInLocations();
        // this.groupLocationsByFacility();
        this.locationFlagAdded = true;
        this.locationsCopy = makeDeepCopyArray([...this.locations]);
        this.specialitesCopy = makeDeepCopyArray([...this.specialites]);
        this.providersCopy = makeDeepCopyArray([...this.providers]);
      }

    }, erorr => {
      console.log('error', erorr);
    });
  }

  filterAccordUserData() {
    // Filtering locations  

    this.locations = this.locations.filter(item => this.idsInAllowedLocations.includes(item.id));

    // filtering specialities
    this.specialites = this.specialites.filter(item => {
      const intersection = item.facility_ids.filter(id => this.idsInAllowedLocations.includes(id));
      return intersection.length > 0; // Include only if there's at least one allowed ID in facility_ids
    });
    const idsInAllowedSpecialities = this.specialites.map(item => item.id);
    this.providers = this.providers.filter(item => {
      const intersection = item.speciality_ids.filter(id => idsInAllowedSpecialities.includes(id));
      return intersection.length > 0; // Include only if there's at least one allowed ID in speciality_ids
    });
  }
  toggleLocationNamesVisibility(facility: any) {
    facility.showLocationNames = !facility.showLocationNames;
  }

  isLocationNamesVisible(facility: any): boolean {
    return facility.showLocationNames || false;
  }

  getSelectedLocationCount(locations: any[]): number {
    return (locations || []).filter(location => location.selected).length;
  }
  onSeeMoreClick(event: Event, facility: any) {
    // Prevent the click event from reaching the parent elements
    event.stopPropagation();

    // Store the selected facility
    this.selectedfacility = facility;

    // Display the location names dropdown
    // this.facilities = this.locations
    const tempLocations = this.locations.filter((item: any) => item.facility === facility.facility);
    this.facilities.forEach((item: any) => {
      tempLocations.push(item)
    })

    this.facilities = tempLocations
    this.showLocationNames = true;
  }
  addFlagsInLocations() {
    this.locations.forEach((item: any) => {
      item.showLocation = false
    })
  }

  OnClickshowLocations(event: Event, facility: any, showOrHide: number) {
    event.stopPropagation();
    if (showOrHide == 1) {
      this.locations.forEach((item: any) => {
        if (item.facility == facility.facility) {
          item.showLocation = true
        }
      })
    } else if (showOrHide == 0) {
      this.locations.forEach((item: any) => {
        if (item.facility == facility.facility) {
          item.showLocation = false
        }
      })
    }

  }
  groupLocationsByFacility() {

    const facilitiesMap = {};

    // Group locations by facility
    this.locations.forEach(location => {
      const facilityName = location.facility;

      if (!facilitiesMap[facilityName]) {
        facilitiesMap[facilityName] = {
          facility: facilityName,
          locations: [],
          showLocationNames: false,
        };
      }

      // facilitiesMap[facilityName].locations.push({
      //   id: location.id,
      //   name: location.name,
      //   selected: false,
      // });
    });

    // Convert the map into an array of facilities
    this.facilities = Object.values(facilitiesMap);
  }

  toggleFacility(index: number) {
    this.facilities[index].expanded = !this.facilities[index].expanded;
  }

  onCrossFacilityResetSpeciality(event: any): void {
    this.clearDropdowns = true;
    // This function will be called when the ng-select value changes
    // You can perform additional logic here if needed
    if (event.length == 0) {
      //event.target.checked = false;
      this.emptyDropdowns();
    }
    if (event.length > 0) {
      //event.target.checked = false;
      this.clearSpecialities(event);
    }
  }
  clearSpecialities(locations: any) {
    const ids: Set<number> = new Set();
    let specsForProviders = [];
    const currentValues = this.globalFilterSearchForm.get('speciality_ids').value;
    locations.forEach(loc => {
      this.specialites.forEach(sp => {
        const found = sp.facility_ids.find((id: number) => id == loc.id);

        if (found) {
          ids.add(sp.id);
          specsForProviders.push(sp);
          //  this.providers.forEach(prov=>{
          //  const pr = prov.speciality_ids.find((id:number)=> id==sp.id);
          //  if(pr){
          //   providers.push(prov);
          //  }
          // }
          //);
        }
      })
    });
    const checkedValues = currentValues.filter(value => ids.has(value));
    this.globalFilterSearchForm.controls['speciality_ids'].reset(checkedValues);

    this.clearProviders(specsForProviders);
  }
  onCrossSpecialityResetProvider(event: any): void {
    if (event.length > 0) {
      //event.target.checked = false;
      this.clearProviders(event);
    }
  }
  clearProviders(specialities: any) {
    const ids: Set<number> = new Set();
    const currentValues = this.globalFilterSearchForm.get('provider_ids').value;
    specialities.forEach(spec => {
      this.providers?.forEach(prov => {
        const found = prov?.speciality_ids?.find((id?: number) => id == spec?.id);

        if (found) {
          ids?.add(prov?.id);
        }
      })
    });
    const checkedValues = currentValues?.filter(value => ids?.has(value));
    this.globalFilterSearchForm.controls['provider_ids']?.reset(checkedValues);
  }
}
