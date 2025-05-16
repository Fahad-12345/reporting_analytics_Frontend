import { Component, OnInit } from '@angular/core';
import { unSubAllPrevious, parseHttpErrorResponseObject } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { Subscription } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { Page } from '@appDir/front-desk/models/page';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModalRef, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ParamQuery, OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { Router, ActivatedRoute } from '@angular/router';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { ToastrService } from 'ngx-toastr';
import { RequestService } from '@appDir/shared/services/request.service';
import { Title } from '@angular/platform-browser';
import { FacilityUrlsEnum } from '@appDir/front-desk/masters/practice/practice/utils/facility-urls-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { RegionUrlsEnum } from '@appDir/front-desk/masters/billing/billing-master/Region-Urls-Enum';
import { AclService } from '@appDir/shared/services/acl.service';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { Location as PracticeLocation } from '../utils/practice.class';
import { Location } from '@angular/common';
import { changeDateFormat, checkReactiveFormIsEmpty, convertUTCTimeToTimeZone, isEmptyObject, isObjectEmpty, removeEmptyKeysFromObject } from '@appDir/shared/utils/utils.helpers';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { PracticeService } from '../services/practice.service';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { convertDateTimeForRetrieving } from '@appDir/shared/utils/utils.helpers';
import { AppointmentCancelCommentModel } from '@appDir/scheduler-front-desk/modules/assign-speciality/modals/accordian/appoinment-cancel-comment-model';
import { Validator } from '@appDir/shared/dynamic-form/models/validator.model';

@Component({
  selector: 'app-practice-listing',
  templateUrl: './practice-listing.component.html',
  styleUrls: ['./practice-listing.component.scss']
})
export class PracticeListingComponent extends PermissionComponent implements OnInit {
  myForm: FormGroup;
  subscription: Subscription[] = [];
  dropdownList = [
    { id: 6, name: 'Saturday' },
    { id: 0, name: 'Sunday' },
    { id: 1, name: 'Monday' },
    { id: 2, name: 'Tuesday' },
    { id: 3, name: 'Wednesday' },
    { id: 4, name: 'Thursday' },
    { id: 5, name: 'Friday' },
  ];
  checkboxvisibility: boolean = true;
  locationdata: any[] = [];
  index: number;
  mainFacility:any={};
      
  isOtherChecked = false;
  totalRows: number;
  totalLocRows: number;
  selection = new SelectionModel<any>(true, []);
  selecting = new SelectionModel<any>(true, []);
  locationslength: number;
  // page: Page;
  forDisable: boolean = false;
  public facilities: any[] = [];
  public opened = {};
  public dropDownRegion: any = [];
  editForm: FormGroup;
  searchForm: FormGroup;
  bools: boolean = true;
  modalRef: NgbModalRef;
  public dayRestrication: any = [];
  public weekday = new Array(5);
  public locations: PracticeLocation[] = [];
  public locationForm: FormGroup;
  daysvalidation: number = 0;
  public lat: number = 31.4599057;
  public long: number = 31.4599057;
  public id: number;
  // public rowdata: any;
  public office_hours_start: Date;
  public office_hours_end: Date;
  arrr: any = [];
  submitText = 'Save';
  isEdit = false;
  facilityAppointmentsData = []
  paramsStored:any={};
  isAppointments=false;
  facilityAppointmentPage:Page;
  facilityPage: Page;
  facilityLocationPage :Page
  queryParams: ParamQuery;
  currentPage: number;
  loadSpin = false;
  defaultComments: AppointmentCancelCommentModel[]=[];
  comments: any;
  currentRow: any;
  constructor(
    private customDiallogService : CustomDiallogService,
    aclService: AclService,
    private formBuilder: FormBuilder,
    router: Router,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private fdService: FDServices,
    private toastrService: ToastrService,
    protected requestService: RequestService,
    titleService: Title,
    private _route: ActivatedRoute,
    private location: Location,
    private practiceService:PracticeService,
    public datePipeService:DatePipeFormatService,
  ) {
    super(aclService, router, _route, requestService, titleService);
    //this.page.pageNumber = 0;

    this.facilityAppointmentPage=new Page();
    this.facilityAppointmentPage.pageNumber=0;
    this.facilityAppointmentPage.size=10;



    this.facilityPage = new Page();
    this.facilityPage.pageNumber = 0;
    this.facilityPage.size = 10;

	this.facilityLocationPage = new Page();
    this.facilityLocationPage.pageNumber = 0;
    this.facilityLocationPage.size = 10;
  }

  private createForm() {
    this.myForm = this.formBuilder.group({
      defaultComments: ['',[Validators.required]],
      otherComments: '',
    });
  }

  ngOnInit() {
    this.setTitle();
    // this.titleService.setTitle(this._route.snapshot.data['title']);
    this.searchForm = this.seachingData();
    this.subscription.push(
      this._route.queryParams.subscribe((param) => {
        this.searchForm.patchValue(param);
        this.facilityPage.pageNumber = parseInt(param.page) || 1
        this.facilityPage.size = parseInt(param.per_page) || 10
        setTimeout(() => {
					this.currentPage = this.facilityPage.pageNumber;
				},500);
      })
    );
    if (this.isEdit) {
      this.submitText = 'Update';
    }
    // this.getMethod();
    this.setPage({ offset: this.facilityPage.pageNumber });
    this.weekdays();

    // this.addlocationForm=this.addLocationMethod();

    this.locationForm = this.initializeLocationForm();
    this.editForm = this.editFacilityForm();
    this.regionDropDown();
    this.createForm();
  }

  public changeTime(isStart) {
    // if (this.startTime === null) {
    //   this.coolDialogs.alert("Start time is needed");
    //   return;
    // }
    // this.startTime.setDate(this.startDate.getDate());
    // this.startTime.setMonth(this.startDate.getMonth());
    // this.startTime.setFullYear(this.startDate.getFullYear());
    // this.minTime = new Date(this.startTime);
  }

  timeConversion(time) {
		return convertDateTimeForRetrieving(null, new Date(time));
	}

  getFacilityLocation(id,per_page=10,page=0) {
    this.requestService.sendRequest(FacilityUrlsEnum.Facility_List_Location_Get, 'get', REQUEST_SERVERS.fd_api_url, { pagination: true, order: OrderEnum.ASC, filter: false, id: id, per_page: per_page, page: page }).subscribe(data => {
		this.facilities.map(facility => {
        if (facility.id === id) {
          facility.total = data['result']['total']
          data['result']['data'].forEach(location => {
            location.timing.map((timing) => {
              timing.start_time = convertUTCTimeToTimeZone(timing.start_time, timing.time_zone_string);
              timing.end_time = convertUTCTimeToTimeZone(timing.end_time, timing.time_zone_string);
              return timing;
            });

          });

          facility.data = [...data['result']['data']]


        }
      })
    })
  }
  onLocationPageChange(page: Page, id) {
    
	  this.facilityPage.pageNumber = page.pageNumber;
	  this.getFacilityLocation(id, page.size,page.pageNumber)
  }
  toggle(id, facilityId,facility?): void {
    if(facility){
      this.mainFacility=facility;
    }
    if (this.isOpenedUndefined(id)) {
      this.opened[id] = false;
    }

    this.opened[id] = !this.opened[id];
    if (this.opened[id]) {
      this.getFacilityLocation(facilityId)
    }
  }

  icon(id): string {
    if (this.isOpenedUndefined(id)) {
      return 'plus';
    }

    return this.opened[id] ? 'minus' : 'plus';
  }

  getAppointmentInfo() {
		this.loadSpin = true;
    let queryParams={};
    queryParams['paginate']= true;
    queryParams['page']=this.facilityAppointmentPage.pageNumber;
    queryParams['per_page']=this.facilityAppointmentPage.size;
    queryParams['id']=this.paramsStored.id;
    let currentData=new Date();
    queryParams['current_date']=changeDateFormat(currentData);

    if(this.paramsStored.is_parent){
      queryParams['main_facility']=true;
    }else{
      queryParams['main_facility']=false;
    }
    this.subscription.push(
      this.practiceService.facilityLocationsAppointments(queryParams)
        .subscribe(
          (resp) => {
            if(resp?.status){
              this.loadSpin=false;
               this.facilityAppointmentsData=(resp.result.data && resp.result.data.docs)?resp.result.data.docs:[] ;
            }
          },
          (err) => { 
            this.loadSpin=false;
           },
        ),
    );
	}

  onPageChange(pageInfo) {
		this.facilityAppointmentPage.offset = pageInfo.offset;
		this.facilityAppointmentPage.pageNumber = pageInfo.offset + 1;
    this.getAppointmentInfo();
    
	}

  hidden(id) {
    if (this.isOpenedUndefined(id)) {
      return true;
    }
    return !this.opened[id];
  }

  pageLimit(num) {
    this.facilityPage.size = Number(num);
    this.selection.clear();
    this.setPage({ offset: 0 });
  }
  pageLimitAppointment($event) {
    this.facilityAppointmentPage.offset = 0;
		this.facilityAppointmentPage.size = Number($event);
		this.facilityAppointmentPage.pageNumber = 1;
    this.getAppointmentInfo();
  }
  updateFacilityStatus($event?,id?){
   let facilityId=$event ? $event?.id : id;
   let index= this.facilities?.findIndex(facility=>facility?.id==facilityId);
   if(index>-1){
    this.facilities[index].is_active=1;
   }
  }

  getAppointmensComments(){
    this.defaultComments=[];
    this.isOtherChecked = false;
    this.subscription.push(
      this.practiceService.getAppointmensComments()
        .subscribe(
          (res) => {
            if(res?.status){
              this.loadSpin=false;
              const appointments = this.practiceService.appointmentsCommentsSelection(res?.result?.data);
              this.myForm.get('defaultComments').setValue(appointments?.selectAppointmentName || '');
              this.defaultComments = appointments?.selectedAppointment || [];              
          }
          },
          (err) => { this.loadSpin=false },
        ),
    );
  
  }

  closeModelAppointment(){
    this.updateFacilityStatus(null,this.currentRow?.id);
    this.modalRef.close();
  }

  ChangeFacilityStatus(id,queryParams){
    this.subscription.push(
      this.practiceService.facilityStatus(queryParams)
        .subscribe(
          (resp) => {
            if(resp?.status){
              this.loadSpin=false;
              this.getFacilityLocation(id,this.facilityPage.size)
            }
          },
          (err) => { this.loadSpin=false },
        ),
    );
  }

  handleResponseStatusOff(row,queryParams,changeStatus1){
    this.subscription.push(
      this.practiceService.facilityLocationsAppointments(queryParams)
        .subscribe(
          (resp) => {
            if(resp?.status){
              this.loadSpin=false;
               this.facilityAppointmentsData=(resp.result.data && resp.result.data.docs)?resp.result.data.docs:[] ;
               this.isAppointments=(resp.result.data && resp.result.data.is_Appointments) ? resp.result.data.is_Appointments : false;
               this.facilityAppointmentPage.totalElements = resp.result.data.total; 
               if(this.isAppointments){
                this.loadSpin=false;
                this.customDiallogService.confirm('Alert', 'There are appointments and assignments created on selected practice-location, you still want to deactivate?','Yes','No')
                .then((confirmed) => {
                  if(confirmed){
                    this.getAppointmensComments();
                  const ngbModalOptions: NgbModalOptions = {
                    backdrop: 'static',
                    size: 'lg',
                    keyboard: false,
                    windowClass: 'modal_extraDOc',
                  };
                  this.modalRef = this.modalService.open(changeStatus1, ngbModalOptions);
                 }else{
                  row.is_active=true;
                  return;
                 }
                })
                .catch();   
              }else{
                this.ChangeFacilityStatus(row?.id,queryParams)
              }
            }
          },
          (err) => { this.loadSpin=false },
        ),
    );
  }
  changeStatus(changeStatus1,row,event){
    this.loadSpin=true;
    let queryParams:any={
      active:event['checked'],
      is_parent:true,
      main_facility:true,
      id:row?.id,
      paginate:true,
      page:1,
      per_page:this.facilityAppointmentPage.size,
      current_date:changeDateFormat(new Date())
    };
    this.paramsStored=queryParams;
    this.currentRow=row;
    if(event['checked'] == false){
     this.handleResponseStatusOff(row,queryParams,changeStatus1)
    }else{
      this.ChangeFacilityStatus(row?.id,queryParams)
    }
  }
 
  onEditLocation(formData, practice,page:Page) {
    let request = { method: 'PUT', API_URL: FacilityUrlsEnum.Facility_Location_Put }
    formData.facility_id = practice.id;

    this.subscription.push(
      this.requestService
        .sendRequest(request.API_URL, request.method, REQUEST_SERVERS.fd_api_url, formData)
        .subscribe(
          (resp) => {
            this.toastrService.success('Successfully updated', 'Success');
            this.getFacilityLocation(practice.id,page.size,page.pageNumber)
          },
          (err) => {  },
        ),
    );
  }
  addLocation(formData, practice) {
    let request = { method: 'POST', API_URL: FacilityUrlsEnum.Facility_Location_Post }
    formData.facility_id = practice.id;
    this.subscription.push(
      this.requestService
        .sendRequest(request.API_URL, request.method, REQUEST_SERVERS.fd_api_url, formData)
        .subscribe(
          (resp) => {
            this.toastrService.success('Successfully added', 'Success');
            this.getFacilityLocation(practice.id)
          },
          (err) => {
          },
        ),
    );

  }
  isOpenedUndefined(id): boolean {
    return this.opened[id] === undefined;
  }

  iconClasses(i) {
    const classes = {
      btn: true,
      'slide-btn': true,
    };
    this.opened[i] ? (classes['bg-green'] = true) : (classes['btn-primary'] = true);
    return classes;
  }

  onEdit(event, facility) {
    this.id = facility.id;

    //	this._dataService.changeFacility(facility);
    //this.router.navigate(['/front-desk/masters/facility/edit/']);
    this.router.navigate([`front-desk/masters/practice/practice/edit/${this.id}`]);
  }
  onCancelAppointmentAndAssigments(){
    let commentsValue: any = this.myForm.getRawValue();
    this.comments = commentsValue.defaultComments === 'Other' ? commentsValue.otherComments : commentsValue.defaultComments;
    this.comments = this.comments || 'N/A';
    let currentData=new Date();
    let req = {};
    if(this.paramsStored.is_parent){
      req = { 'main_facility': true, 'cancelled_comments': this.comments,'id':[this.paramsStored.id],'current_date':changeDateFormat(currentData) };
    }else{
      req = { 'main_facility': false, 'cancelled_comments': this.comments,'id':[this.paramsStored.id],'current_date':changeDateFormat(currentData) };
    }

    this.loadSpin=true;
    this.subscription.push(
      this.practiceService.CancelAppointmentAndAssigments(req)
        .subscribe(
          (resp) => {
            if(resp?.status){
              this.loadSpin=false;
              console.log(resp.message);
              this.toastrService.success('All Appointments/Assignments cancelled Successfully!', 'Success');
              this.modalRef.close()
              this.subscription.push(
                this.practiceService.facilityStatus(this.paramsStored)
                  .subscribe(
                    (resp) => {
                      if(resp?.status){
                        this.loadSpin=false;
                        this.getFacilityLocation(this.currentRow?.id,this.facilityPage.size)
                      }
                    },
                    (err) => {
                      this.loadSpin=false },
                  ),
              );
            }
          },
          (err) => { 
            this.loadSpin=false;
            this.updateFacilityStatus(null,this.currentRow?.id); 
            this.modalRef.close();
          },
        ),
    );
  
  }

  facilityPlus() {
    this.bools = !this.bools;
  }

  facilityMinus() {
    this.bools = !this.bools;
  }

  // fom used for searcing
  seachingData() {
    return this.fb.group({
      name: [''],
      // locationName: ['', Validators.required],
      phone: [''],
    });
  }
  resetFilters() {
    this.searchForm.reset();
    this.bools = !this.bools;
    this.selection.clear();
    if (this.facilities) {
      this.checkboxvisibility = true;
    }
    // this.getMethod();
    this.setPage({ offset: 0 });
    //}
  }

  private initializeLocationForm() {
    return this.fb.group({
      name: [''],
      address: [''],
      city: [''],
      state: [''],
      zip: [''],
      floor: [''],
      phone: [''],
      fax: [''],
      email: [''],
      region: [''],
      dayList: [''],
      lat: [''],
      long: [''],
      facility_locations_id: [''],
      office_hours_end: [''],
      office_hours_start: [''],
    });
  }
  public weekdays() {
    this.weekday[0] = [{ id: 0, name: 'Sun', isColor: 'false' }];
    this.weekday[1] = [{ id: 1, name: 'Mon', isColor: 'false' }];
    this.weekday[2] = [{ id: 2, name: 'Tue', isColor: 'false' }];
    this.weekday[3] = [{ id: 3, name: 'Wed', isColor: 'false' }];
    this.weekday[4] = [{ id: 4, name: 'Thur', isColor: 'false' }];
    this.weekday[5] = [{ id: 5, name: 'Fri', isColor: 'false' }];
    this.weekday[6] = [{ id: 6, name: 'Sat', isColor: 'false' }];
  }
  onLocation() {
    if (this.locationForm.valid) {
      this.forDisable = true;
    }
    let dayList = this.dayRestrication;
    this.subscription.push(
     
      this.requestService
        .sendRequest(
          FacilityUrlsEnum.Facility_Location_Post + this.id,
          'POST',
          REQUEST_SERVERS.fd_api_url,
          {
            ...this.locationForm.value,
            office_hours_start: this.office_hours_start,
            office_hours_end: this.office_hours_end,
            dayList,
          }
        )
        .subscribe(
          (resp) => {
            this.forDisable = false;
            const data = resp['data'];
            // this.facilities = data;
            // this.getMethod();
            this.setPage({ offset: 0 });
            this.weekdays();
            this.dayRestrication = [];
            this.toastrService.success('Successfully added', 'Success');
            this.locationForm.reset();
            this.modalRef.close();
          },
          (err) => {
            const str = parseHttpErrorResponseObject(err.error.message);
            this.toastrService.error(str);
          },
        ),
    );
  }

  OnEditSubmit() {
    let dayList = this.dayRestrication;
    if (this.editForm.valid) {
      this.forDisable = true;
    }
    this.subscription.push(
      // this._http
      // 	.put<FdResponse<Facility[]>>(FacilityUrlsEnum.Facility_list_Location_Put, {
      // 		...this.editForm.value,
      // 		office_hours_start: this.office_hours_start,
      // 		office_hours_end: this.office_hours_end,
      // 		dayList,
      // 		// lat: this.lat,
      // 		// long: this.long,
      // 	})
      this.requestService
        .sendRequest(
          FacilityUrlsEnum.Facility_Location_Put,
          'PUT',
          REQUEST_SERVERS.fd_api_url,
          {
            ...this.editForm.value,
            office_hours_start: this.office_hours_start,
            office_hours_end: this.office_hours_end,
            dayList,
          }

        )
        .subscribe(
          (resp) => {
            this.dayRestrication = [];
            this.forDisable = false;
            const data = resp['data'];
            this.facilities = data;
            // this.getMethod();
            this.setPage({ offset: 0 });
            this.modalRef.close();
            this.toastrService.success('Successfully updated', 'Success');
          },
          (err) => {
            const str = parseHttpErrorResponseObject(err.error.message);
            this.toastrService.error(str);
          },
        ),
    );
  }

  public handleAddressChange(address: Address, type?: string) {
    const street_number = this.fdService.getComponentByType(address, 'street_number');
    const route = this.fdService.getComponentByType(address, 'route');
    const city = this.fdService.getComponentByType(address, 'locality');
    const state = this.fdService.getComponentByType(address, 'administrative_area_level_1');
    const postal_code = this.fdService.getComponentByType(address, 'postal_code');
    const lat = address.geometry.location.lat();
    const lng = address.geometry.location.lng();
    const _address = street_number.long_name + ' ' + route.long_name;
    // if (type === 'biller') {
    //     this.facilityForm.patchValue({
    //         'billing_address': _address,
    //         'billing_city': city.long_name,
    //         'billing_state': state.long_name,
    //         'billing_zip': postal_code.long_name,
    //     });

    //     return;
    // }
    if (type === 'region') {
      this.locationForm.patchValue({
        region: _address,
      });

      return;
    }
    if (type === 'location') {
      this.locationForm.patchValue({
        address: _address,
        city: city.long_name,
        state: state.long_name,
        zip: postal_code.long_name,
        lat: lat,
        long: lng,
      });

      // this.lat = lat;
      // this.long = lng;

      return;
    }
    if (type === 'updateLocation') {
      this.editForm.patchValue({
        address: _address,
        city: city.long_name,
        state: state.long_name,
        zip: postal_code.long_name,
        lat: lat,
        long: lng,
      });

      return;
    }
    // this.facilityForm.patchValue({
    //     'facility_address': _address,
    //     'facility_city': city.long_name,
    //     'facility_state': state.long_name,
    //     'facility_zip': postal_code.long_name,
    // });
  }
  sendId(id: number) {
    this.id = id;
  }

  openModal(id: number, facilityModal) {
    this.id = id;
    this.office_hours_end = null;
    this.office_hours_start = null;
    this.weekdays();
    this.dayRestrication = [];
    const ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false,
      windowClass: 'modal_extraDOc',
      size: 'lg',
    };

    this.modalRef = this.modalService.open(facilityModal, ngbModalOptions);
  }

  setPage(pageInfo) {
    this.opened = {};
    this.selection.clear();
    this.facilityPage.pageNumber = pageInfo.offset;
    const pageNumber = this.facilityPage.pageNumber ;

    const filters = checkReactiveFormIsEmpty(this.searchForm);
    filters.phone;
    this.queryParams = {
      filter: !isObjectEmpty(filters),
      order: OrderEnum.ASC,
      per_page: this.facilityPage.size,
      page: pageNumber,
      pagination: true,
    };
    // if (Object.entries(this.searchForm.value).length != 0) {
    const name = this.searchForm.value.name;
    const phone = this.searchForm.value.phone;
    let per_page = this.facilityPage.size;
    let queryParams = { name, phone, per_page, page: pageNumber }

    this.addUrlQueryParams(queryParams);
    // }
    this.getMethod({ ...this.queryParams, ...filters });
  }
  addUrlQueryParams(params?) {
    this.location.replaceState(
      this.router.createUrlTree([], { queryParams: params, }).toString()
    );
  }

  getMethod(queryParams) {
	this.loadSpin = true;
    this.subscription.push(
      // this._http
      // .get<FdResponse<Facility[]>>('facility')
      // this._http.get<FdResponse<Facility[]>>(FacilityUrlsEnum.Facility_list_GET)

      this.requestService
        .sendRequest(
          FacilityUrlsEnum.Facility_list_GET,
          'GET',
          REQUEST_SERVERS.fd_api_url,
          queryParams,
        )
        .subscribe(
          (resp: HttpSuccessResponse) => {
			      this.loadSpin = false;
            this.facilities = resp['result'].data;
            this.facilityPage.totalElements = resp['result'].total;
            this.facilityPage.totalPages = this.facilityPage.totalElements / Number(resp['result'].per_page);
          },
          (err) => {
			      this.loadSpin = false;
            const str = parseHttpErrorResponseObject(err.error.message);
            this.toastrService.error(str);
          },
        ),
    );
  }
  
  public fullAddress(row): string {
    return row ? ((row.address) ? (row.floor ? `${row.address}, ${row.floor}` : `${row.address}`) : row.floor) || 'N/A' : 'N/A';
  }

  isAllSelectedLocations(length, loc) {
    this.totalLocRows = length;
    const numSelected = this.selecting.selected.length;
    const numRows = this.totalLocRows;
    return numSelected === numRows;
  }
  masterLocationsToggle(length, loc?) {
    this.isAllSelectedLocations(length, loc)
      ? this.selecting.clear()
      : loc.slice(0, this.totalLocRows).forEach((row) => this.selecting.select(row));
  }

  isAllSelected() {
    this.totalRows = this.facilities.length;
    const numSelected = this.selection.selected.length;
    const numRows = this.totalRows;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.facilities.slice(0, this.totalRows).forEach((row) => this.selection.select(row));
  }

  editFacilityForm() {
    return this.fb.group({
      facility_locations_id: [''],
      name: [''],
      address: [''],
      city: [''],
      state: [''],
      zip: [''],
      floor: [''],
      phone: [''],
      fax: [''],
      email: [''],
      region: [''],
      dayList: [''],
      lat: [''],
      long: [''],
      office_hours_start: [''],
      office_hours_end: [''],
    });
  }
  public selectDays(days) {
    this.dayRestrication = Array.from(new Set(this.dayRestrication));
    if (days.isColor === true) {
      if (this.daysvalidation > 0) {
        this.daysvalidation = this.daysvalidation - 1;
      }
      days.isColor = false;
      for (var i = 0; i < this.dayRestrication.length; i++) {
        if (this.dayRestrication[i] === days.id) {
          this.dayRestrication.splice(i, 1);
        }
      }
    } else {
      this.daysvalidation = this.daysvalidation + 1;
      days.isColor = true;
      this.dayRestrication.push(days.id);
      this.locationForm.value.dayList = this.dayRestrication;
    }
  }
  updateFacility(facilityEdit, facility, rowIndex, row) {
    this.id = row.facility_id;
    this.submitText = 'Update';
    this.weekdays();
    this.editForm.reset();
    this.index = rowIndex;
    // this.rowdata = row;
    this.locations = facility.locations;
    this.dayRestrication = [];
    const locations = { ...row };
    locations.dayList = JSON.parse(locations.dayList);
    if (locations.dayList) {
      for (let x in locations.dayList) {
        this.weekday[locations.dayList[x]][0].isColor = true;
        this.dayRestrication.push(locations.dayList[x]);
      }
    }
    // locations.office_hours_start = this.getTime(locations.office_hours_start);
    // locations.office_hours_end = this.getTime(locations.office_hours_end);

    this.office_hours_start = new Date(locations.office_hours_start);
    this.office_hours_end = new Date(locations.office_hours_end);
    this.editForm.patchValue({
      facility_locations_id: locations.facility_locations_id,
      name: locations.name,
      address: locations.address,
      city: locations.city,
      state: locations.state,
      zip: locations.zip,
      floor: locations.floor,
      phone: locations.phone,
      fax: locations.fax,
      email: locations.email,
      region: locations.region,
      lat: locations.lat,
      long: locations.long,
      dayList: locations.dayList,
      office_hours_start: '',
      office_hours_end: '',
    });

    const ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false,
      windowClass: 'modal_extraDOc',
      size: 'lg',
    };

    this.modalRef = this.modalService.open(facilityEdit, ngbModalOptions);
  }

  getTime(_date) {
    const date = new Date(_date);
    const hrs = date.getHours();

    const mins = date.getMinutes();
    const hours = hrs < 10 ? '0' + hrs : hrs;

    const minutes = mins < 10 ? '0' + mins : mins;
    const dateTime = `${hours}:${minutes}`;
    return dateTime;
  }

  stringfy(obj) {
    return JSON.stringify(obj);
  }

  deleteOneLocation(facility, location) {
    this.customDiallogService.confirm('Delete Confirmation?', 'Are you sure you want to delete?','Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
        this.subscription.push(

          this.requestService
            .sendRequest(
              FacilityUrlsEnum.Facility_list_Location_DeleteSingle +
              location.facility_locations_id,
              'DELETE',
              REQUEST_SERVERS.fd_api_url,
            )
            .subscribe(
              (res) => {
                if (res['status'] === true) {
                  const updatedFacilityLocations = facility.locations.filter(
                    (loc) => loc.facility_locations_id !== location.facility_locations_id,
                  );
                  facility.locations = updatedFacilityLocations;
                  this.facilities = this.remove(
                    this.facilities,
                    facility.facility_id,
                    'facility_id',
                    facility,
                  );
                  this.selecting.clear();
                  this.toastrService.success('Successfully deleted', 'Success');
                }
              },
              (err) => {
                const str = parseHttpErrorResponseObject(err.error.message);
                this.toastrService.error(str);
              },
            ),
        );
				
			}
		})
		.catch();
  }

  deleteMultipleLocations(facility) {
    // this.forDisable = false;
    const selec = this.selecting.selected;
    const arr: any = [];
    for (let p = 0; p < selec.length; p++) {
      arr[p] = selec[p].facility_locations_id;
    }
    this.customDiallogService.confirm('Delete Confirmation?', 'Are you sure you want to delete?','Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
        this.subscription.push(

          this.requestService
            .sendRequest(
              FacilityUrlsEnum.Facility_list_Location_DeleteMultiple,
              'DELETE',
              REQUEST_SERVERS.fd_api_url,
              arr,
            )
            .subscribe(
              (res) => {
                if (res['status'] === true) {
                  // this.forDisable = true;
                  // this.getMethod();
                  this.setPage({ offset: 0 });
                  this.selecting.clear();
                  this.toastrService.success('Successfully deleted', 'Success');
                }
              },
              (err) => {
                const str = parseHttpErrorResponseObject(err.error.message);
                this.toastrService.error(str);
              },
            ),
        );
				
			}
		})
		.catch();

  }

  private remove<T>(arr: T[], id: number, key: string, item: T): T[] {
    const _arr = [...arr];

    const index = arr.findIndex((row) => row[`${key}`] === id);
    _arr.splice(index, 1, item);
    // console.log('index', index, arr.slice(0, index), arr.slice(index + 1));

    // if (index > -1) {
    //   return [...arr.slice(0, index), ...arr.slice(index + 1)];
    // }

    return _arr;
  }

  deleteMultipleFacility() {
    const select = this.selection.selected;
    const arr: any = [];
    for (let p = 0; p < select.length; p++) {
      arr[p] = select[p].id;
    }
    const options = {
      id: arr,
    };
    this.customDiallogService.confirm('Delete Confirmation?', 'You want to delete all records?','Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
			  this.subscription.push(
          this.requestService
            .sendRequest(
              FacilityUrlsEnum.Facility_list_Delete_MultipleFacility,
              'DELETE',
              REQUEST_SERVERS.fd_api_url,
              options,
            )
            .subscribe(
              (resp) => {
                const data = resp['data'];
                this.facilities = data;
                // this.getMethod();
                this.setPage({ offset: 0 });
                this.selection.clear();
                this.toastrService.success('Selected Data deleted successfully', 'Success');
              },
              (err) => {
                const str = parseHttpErrorResponseObject(err.error.message);
                this.toastrService.error(str);
              },
            ),
        );
				
			}
		})
		.catch();
  }

  deleteFacility(id) {
    this.customDiallogService.confirm('Delete Confirmation?', 'Are you sure you want to delete?','Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
        this.subscription.push(
          this.requestService
            .sendRequest(
              FacilityUrlsEnum.Facility_list_Delete_SingleFacility + id,
              'DELETE',
              REQUEST_SERVERS.fd_api_url,
            )
            .subscribe(
              (resp) => {
                const data = resp['data'];
                this.facilities = data;
                // this.getMethod();
                this.setPage({ offset: 0 });
                this.selection.clear();
                this.toastrService.success('Successfully deleted', 'Success');
              },
              (err) => {
                const str = parseHttpErrorResponseObject(err.error.message);
                this.toastrService.error(str);
              },
            ),
        );
				
			}
		})
		.catch();

  }



  setpageFacilityAppointment(pageInfo: any): void {
   console.log("Asd",pageInfo);

	}

  // PageLimit($num) {
  //   this.page.size = Number($num);
  // }

  regionDropDown() {
    this.subscription.push(
      // this.fdService.regionUsedFacilityDropDown()
      this.requestService
        .sendRequest(
          RegionUrlsEnum.Region_list_dropdown_GET,
          'GET',
          REQUEST_SERVERS.fd_api_url,
        )
        .subscribe(
          (resp) => {
            if (resp['status'] === 200) {
              this.dropDownRegion = resp['result']['data'];
            }
          },
          (err) => {
            const str = parseHttpErrorResponseObject(err.error.message);
            this.toastrService.error(str);
          },
        ),
    );
  }

  closeAddModal() {
    this.locationForm.reset();
    this.modalRef.close();
  }
  closeUpdateModal() {
    this.editForm.reset();
    this.modalRef.close();
  }
  closeModel(event?) {

    this.locations = event;
    this.modalRef.close();
    this.weekdays();
    this.dayRestrication = null;
    this.submitText = 'Save';
    // this.getMethod();
    this.setPage({ offset: 0 });
  }

  ngOnDestroy(): void {
    unSubAllPrevious(this.subscription);
  }

  formatPhoneNumber(phoneNumber: string): string {
    const str1 = phoneNumber.substring(0, 3);
    const str2 = phoneNumber.substring(3, 6);
    const str3 = phoneNumber.substring(4);
    return str1 + '-' + str2 + '-' + str3;
  }

  pageChanged(event) {
    this.selection.clear();
    event.itemsPerPage = this.facilityPage.size;
    this.setPage({ offset: event.page });

  }

  checkInputs(){
	if (isEmptyObject(this.searchForm.value)) {
		return true;
	  }
	  return false;
}

      statusChange(valuePass) {
        const ngbModalOptions: NgbModalOptions = {
          backdrop: 'static',
          keyboard: false,
          windowClass: 'modal_extraDOc body-scroll',
          modalDialogClass: 'modal-lg'
        };
        this.modalService.open(valuePass, ngbModalOptions);
      }

      onSelectValue() {
        let value=this.myForm.get('defaultComments').value
        if (value && value=='Other') {
            this.isOtherChecked = true;
          }
          else
          {
            this.isOtherChecked = false;
          }
      }

}
