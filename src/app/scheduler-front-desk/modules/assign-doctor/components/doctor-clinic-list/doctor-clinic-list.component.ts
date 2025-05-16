import { SpecialityInfo } from './../../../../../shared/modules/doctor-calendar/component/custom-model/speciality.model';
import { filter } from 'rxjs/operators';
import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SchedulerSupervisorService } from '../../../../scheduler-supervisor.service';
import { DatePipe } from '@angular/common';
import { SubjectService } from '../../subject.service';
import { StorageData, HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { Router } from '@angular/router';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { AssignRoomsUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-rooms/assign-rooms-urls-enum';
import {cloneDeep} from 'lodash'
import { isEmpty } from 'lodash';
import { convertDateTimeForSending, unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';


@Component({
  selector: 'app-doctor-clinic-list',
  templateUrl: './doctor-clinic-list.component.html',
  styleUrls: ['./doctor-clinic-list.component.scss']
})
export class DoctorClinicListComponent extends PermissionComponent implements OnInit,OnDestroy {
  public isCheckAvailablityOrAllList: boolean = false;
  public loadMoreTempArray: any = [];
  public backup_filters:any = [];
  //hhh
  public filterClinic=[];
  public allClinicsCheck : boolean = true;
  public displayDoc: any = [];
  public filterDoc: any = [];
  public marked_doctors: any = [];
  public filter_check: any = false;
  public clinic_check: any = true;
  //
  public docBackUp : any = [];
  public checkArray: any = [];
  @Input() tempDoc: any = [];
  public allFacilitySupervisorClinicIds: any = [];
  public searchedClinics: any = [];
  @Output() checkAvailabilityDoc = new EventEmitter();
  @Input() tempClinics: any = [];
  public isClinicClicked: boolean = false;
  public isShowAllClinicList: boolean = true;
  public isDoctorClicked: boolean = true;
  public isShowFilter: boolean = false;
  doctorsSpecality :any[] = []; 
  //public isShowMoreClinic: boolean = true;
  //public isShowLessClinic: boolean = true;
  //public isShowMoreDoc: boolean = true;
  //public isShowLessDoc: boolean = true;
//   public isShowClinicFilterList: boolean = true;
  public isCheckAddMoreClinic;
  public isCheckAddMoreDoc;
  public isCheckShowLessClinic
  public isCheckShowLessDoc
  public clinicName;
  public clinicArea;
  public clinicAddress;
  public clinicOffsetMore;
  public clinicsLength;
  public docCounter = 0;
  public docOffSetMore;
  public doctorsLength;
  public click: boolean = false;
  public isHide: boolean = true;
  public isCheckDisabled: boolean = false;
  public isShowDocFilter: boolean = false;
  public searchedDoctors: any = [];
  //public isShowDoclist: boolean = true;
  //public isShowDocFilterList: boolean = true;
  public isDocCheck: boolean = false;
  public isClinicCheck: boolean = false;
  //public isShowCheckArray: boolean = true;
  public docName;
  public doc_specialities;
  public docspec
  public startDate = new Date()
  public endDate = new Date()
  public minDate: Date
  public startTime = new Date();
  public endTime = new Date();
  public minTime: Date
  public interval: number = 30;
  public displayDocIds:any=[]
  @Output() selectClinic = new EventEmitter();
  @Output() selectDoctor = new EventEmitter();
  @Input() clinics: any;
  public doctors: any;
  public loadmoredocarray: any = [];
  @Input() isSwapped: any;
  constructor(aclService: AclService,
    router: Router,
    protected requestService: RequestService,
    
    public formBuilder: FormBuilder,
    public _SupervisorService: SchedulerSupervisorService,
    private storageData: StorageData,
    private datePipe: DatePipe, public subject: SubjectService) {
    super(aclService, router);
    this.clinicName = '';
    this.clinicArea = '';
    this.clinicAddress = '';
    this.docName = '';
    this.docspec = '';
    this.startTime = new Date(this.startDate);
    this.endDate.setMinutes(this.endDate.getMinutes() + 30)
    this.endTime = new Date(this.endDate);
    this.minTime = new Date(this.startTime);
    if (this.startDate === this.endDate) {
      this.checkArray = JSON.parse(JSON.stringify(this.doctors));
    }
    this.tempClinics = this.clinics;
    this.isHide = false;
    this.minDate = new Date(this.startDate);
  }
  
 
  ngOnInit() {
	 debugger; 
   this.subscription.push( this.subject.filteredClinic.subscribe((response) =>
    {
      // if (response.length != 0)
      // {
      //   this.listUpdate()
	  // }
	  debugger;
    if( this.filterClinic != undefined)
    {
      // this.filterDoc = [];
      let provider_count = 0;
      let tempFilter = this.filterClinic
      let true_check = false
      //Checking and unchecking the doctor
    if(response.length != 0 && this.filterDoc.length != 0)
    {
      this.marked_doctors = response;
      localStorage.setItem("marked_doctors",JSON.stringify(this.marked_doctors));
      this.filter_check = true;
      for(let i = 0 ;i<this.filterDoc.length;i++)
      {
        true_check = false
	
        for(let j = 0;j<response.length;j++)
        {
          if(this.filterDoc[i] != undefined && response[j] != undefined)
          {
            if(response[j]['speciality_id'] == this.filterDoc[i]['speciality_id'] && this.filterDoc[i].user_id == response[j].user_id && this.filterDoc[i].facility_location_id == response[j].facility_location_id)
            {
				debugger;
              this.filterDoc[i]['isChecked'] = response[j].isChecked
              true_check = true;
              provider_count ++;
            }
          }
        }
        if(!true_check)
        {
            this.filterDoc[i]['isChecked'] = false;
        }
      }
      if (provider_count == 0)
      {
        this.filterClinic =  this.clinics;
      }
      // this.filterDoc = this.doctors;
    }
    }
  })
   );
    
  
    this.subscription.push(this.subject.doc_specialities.subscribe((res) =>
    {
      this.doc_specialities = res;

    })
	);
    this.subscription.push(this.subject.castClinics.subscribe(res => {
		if(res.length==0)
		{
			this.filterClinic = []
		}
      if (res.length != 0) {
        this.tempClinics = res
        this.clinics = res
		// this.filterClinic=this.clinics;
		this.searchClinicByNameByAddress()
        // if (this.clinics.length != 0 && this.allClinicsCheck) {
        //   this.loadMoreTempArray = []
        //   //hhh
          
        //   //
        //   this.allClinicsCheck = false;
        //   for (var i = 0; i < this.clinics.length; i++) {
           
        //     //Show All Clinics...hhh
		// 	  //this.loadMoreTemparray.push(this.clinics[i]);
		// 	  this.filterClinic.push(this.clinics[i]);
        //   }
        //   this.backup_filters = this.filterClinic;
        // }

		// if (this.clinics.length != 0 ) {
		// 	this.loadMoreTempArray = []
		// 	//hhh
			
		// 	//
		// 	this.allClinicsCheck = false;
		// 	for (var i = 0; i < this.clinics.length; i++) {
			 
		// 	  //Show All Clinics...hhh
		// 		//this.loadMoreTemparray.push(this.clinics[i]);
		// 		this.filterClinic.push(this.clinics[i]);
		// 	}
		// 	this.backup_filters = this.filterClinic;
		//   }
        // this.clinicClicked()
      }
    })
	)
    this.subscription.push(this.subject.castDoctor.subscribe(res => {
		debugger;
      this.doctors = res;
	  this.doctorsSpecality ;
      this.tempDoc = res;
    //   this.loadmoredocarray = [];
      //
      this.filterDoc = [];
      this.displayDoc = [];
      //
      for (var i = 0; i < this.doctors.length; i++) {
		this.displayDocIds.push(this.doctors[i].facility_location_id)
        if (this.doctors[i].doctor.URI == null) {
          this.doctors[i].doctor.URI = this.defaultDoctorImageUrl;
        }
      }
   

      //hhh
      //this.loadmoredocarray.push(this.doctors[i]);
      this.filterDoc = JSON.parse(JSON.stringify(this.doctors));

      this.displayDoc = JSON.parse(JSON.stringify(this.doctors));
      if(this.filterDoc.length != 0 && this.clinic_check)
      {
        // this.clinic_check = false;
		this.searchDocByNameBySpec()
        // this.clinicClicked()
      }
      //
	})
	)
	this.clinicClicked()
  }
  ngOnDestroy()
  {
	  unSubAllPrevious(this.subscription);
  }
  onChangePracticeLocation(clinic)
  {
	  this.filterDoc=[];
	  debugger;
	this.selectClinic.emit(clinic)
  }
  onChangeProvider(doc)
  {
	  this.filterClinic=[];
	  debugger;
	this.selectDoctor.emit(doc)
  }
  public emergencyFilterBunker()
  {
    let true_check = false;
	debugger;
    for(let i = 0 ;i<this.filterDoc.length;i++)
    {
      true_check = false
      for(let j = 0;j<this.marked_doctors.length;j++)
      {
        if(this.filterDoc[i] != undefined && this.marked_doctors[j] != undefined)
        {
          if(this.filterDoc[i].docId == this.marked_doctors[j].docId && this.filterDoc[i].facility_location_id == this.marked_doctors[j].facility_location_id )
          {
            this.filterDoc[i]['isChecked'] = this.marked_doctors[j].isChecked
            true_check = true
          }
        }
      }
      if(!true_check)
      {
          this.filterDoc[i]['isChecked'] = false;
      }
    }
  }
  /*Get all clinics function */
  public clinicClicked() {	 
    //this.isShowCheckArray = true;
    this.isShowAllClinicList = false;
    this.isDocCheck = false;
    this.isHide = true;
    this.click = false;
    this.isShowDocFilter = false;
    this.isClinicClicked = true;
	this.isSpecialityClicked= false;
    this.isShowFilter = false;
    this.isDoctorClicked = true;
    if ((this.clinicName != '') || (this.clinicAddress != '')) {
    //   this.isShowClinicFilterList = false;
      this.isShowFilter = true;
      this.isClinicCheck = true;

    }
    else if ((this.clinicName === '') || (this.clinicAddress === '')) {
      this.isShowAllClinicList = false;
      this.isClinicCheck = false;
    }
//    this.clinicFilter();
  }
  public clinicFilter()
  {
	  debugger;
    let selectedClinics: any = [];
    //This is the push the already checked clinics in the clinic list.
    // this.filterClinic = [];
    for(let i=0;this.filterClinic && i<this.filterClinic.length;i++)
    {
      if(this.filterClinic[i]['isChecked'])
      {
        selectedClinics.push(this.filterClinic[i]);
      }
    }
    this.filterClinic = selectedClinics; 
    // this.searchedClinics = []
    //This will select location on the basis of the provider.
    for(let i=0;i<this.filterDoc.length;i++)
    {
      for(let j=0;j<this.doc_specialities.length;j++)
      {
          if(this.filterDoc[i]['isChecked'])
          {
            if(this.filterDoc[i]['docId'] == this.doc_specialities[j]['docId'])
            {
            for(let k =0 ;k<this.doc_specialities[j].specialities.length;k++)
            {
              let facility = this.doc_specialities[j].specialities[k]['facilityId'];
              this.clinics.forEach((item) =>
              {
                if(item.id == facility && !this.filterClinic.includes(item))
                {
                  this.filterClinic.push(item);
                }
              })
            }
          }
        }
      }
    }
    if(this.filterClinic.length == 0 )
    {
      this.filterClinic = this.clinics
    }
  }
  /*Get all doctors function */
  public doctorClicked() {
	  debugger;
	this.filterDoc=[...this.filterDoc];
    //this.isShowCheckArray = true;
    this.isDoctorClicked = false;
    this.isClinicClicked = false;
	this.isSpecialityClicked= false;
    this.click = true;
    this.isShowFilter = false;
    this.isShowAllClinicList = true;
    // this.isShowClinicFilterList = true;
    this.isClinicCheck = true;
    if (this.startDate === null || this.endDate === null) {
      this.isHide = true;
    }
    else {
      this.isHide = false;
    }
    if ((this.docName != '') || (this.docspec != '')) {
      // this.searchDocByNameBySpec();
      this.isDocCheck = true;
      this.isShowDocFilter = true;
    }
    else if ((this.docName === '') || (this.docspec === '')) {
     
      this.isDocCheck = false;
    }

 
    
  }

  public listUpdate(){
	  debugger;
    let checkedClinics=[]
    for(let i=0;this.clinics && i<this.clinics.length;i++){
      if(this.clinics[i].isChecked){
        checkedClinics.push(this.clinics[i])
      }
    }
    let checkedDoctors=[]
    for(let i=0;this.doctors && i<this.doctors.length;i++){
      if(this.doctors[i].isChecked){
        checkedDoctors.push(this.doctors[i])
      }
    }

    //clinics
    if (checkedClinics.length != 0) {
      let docArray = []
      let docArrayIds = []
      for (let j = 0; j < this.doctors.length; j++) {
        for (let d = 0; d < checkedClinics.length; d++) {
          for (let ds = 0;this.doctors[j].doctor.specAllArray 
            && ds < this.doctors[j].doctor.specAllArray.length; ds++) {
            if (checkedClinics[d].id == this.doctors[j].doctor.specAllArray[ds].facilityId 
             ) {
              if ( !docArrayIds.includes(this.doctors[j].id)){
                docArrayIds.push(this.doctors[j].id)
                docArray.push(this.doctors[j])
              }
              break;
            }
          }
        }
      }
      this.filterDoc = cloneDeep(docArray);
    } else{
      this.filterDoc = cloneDeep(this.doctors);
    }
    
    //doctor
    if (checkedDoctors.length != 0) {
      let clinicArray = []
      let clinicIds = []
      for (let j = 0; j < this.clinics.length; j++) {
        for (let d = 0; d < checkedDoctors.length; d++) {
          let br = false;
          for (let ds = 0; checkedDoctors[d].doctor.specAllArray && ds < checkedDoctors[d].doctor.specAllArray.length; ds++) {
            if (checkedDoctors[d].doctor.specAllArray[ds].facilityId == this.clinics[j].id
              && !clinicIds.includes(this.clinics[j].id && this.clinics[j].isChecked == false)) {
              clinicArray.push(this.clinics[j])
              clinicIds.push(this.clinics[j].id)
              br = true;
              break;
            }
          }
          if (br) { break }
        }
      }
      this.filterClinic = cloneDeep(clinicArray)
    } else{
      this.filterClinic = cloneDeep(this.clinics)
    }

    let tempDisplay = this.filterClinic.filter((element) => {
      return element.name.toLowerCase().includes(this.clinicName.toLowerCase())
    });
    this.filterClinic = tempDisplay.filter((element) => {
      return element.address.toLowerCase().includes(this.clinicAddress.toLowerCase())
    });
    // this.searchDocByNameBySpec()
    let searchDocByName = this.filterDoc.filter((element) => {
      if (element.doctor.middle_name == undefined || element.doctor.middle_name == null) {
        element.doctor.middle_name = ""
      }
      return (element.doctor.first_name || '').toLowerCase().includes(this.docName.toLowerCase()) ||
        element.doctor.middle_name.toLowerCase().includes(this.docName.toLowerCase()) ||
        element.doctor.last_name.toLowerCase().includes(this.docName.toLowerCase())
    });
    let searchDocBySpec = searchDocByName.filter((element) => {
      if (!element.doctor.specialities.name) {
        element.doctor.specialities = element.doctor.specialities[0]
      }
      return element.doctor.specialities.name.toLowerCase().includes(this.docspec.toLowerCase())
    });
    this.filterDoc=cloneDeep(searchDocBySpec)
  }

  public docFilter()
  {
        // this.marked_doctors = this.filterDoc;
        this.filterDoc = [];
        //Clinic to doctor filter
        for(let i=0;i<this.filterClinic.length;i++)
        {
          for(let j=0;j<this.doc_specialities.length;j++)
          {
            for(let k =0 ;k<this.doc_specialities[j].specialities.length;k++)
            {
              if(this.filterClinic[i]['isChecked'])
              {
                if(this.filterClinic[i]['id'] == this.doc_specialities[j].specialities[k]['facilityId'])
                {
                  this.displayDoc.forEach((item) =>
                  {
                    if(item.docId == this.doc_specialities[j]['docId'] && !this.filterDoc.includes(item))
                    {
                      this.filterDoc.push(item);
                    }
                  })
                }
              }
            }
          }
        }
    //   this.emergencyFilterBunker()
      if(this.filterDoc.length == 0)
      {
      this.filterDoc = JSON.parse(JSON.stringify(this.doctors));
    //   this.emergencyFilterBunker()
      }
      this.docBackUp = this.filterDoc; 
  	}


  /*Check full avialability of a doctor against date and time*/
  public checkAvailability() {
    this.startDate.setSeconds(0)
    this.endDate.setSeconds(0)
    let newTemp1 = convertDateTimeForSending(this.storageData, new Date(this.startDate))
    let newTemp2 = convertDateTimeForSending(this.storageData, new Date(this.endDate))
    this.allFacilitySupervisorClinicIds = this.storageData.getFacilityLocations()
    // var object =
    // {
    //   "dateRange": [newTemp1, newTemp2],
    //   "clinics": this.allFacilitySupervisorClinicIds

	// }
	var object =
    {
	  "start_date": newTemp1,
	  "end_date": newTemp2,
      "facility_location_ids": this.allFacilitySupervisorClinicIds

    }
    this.requestService
      .sendRequest(
        AssignRoomsUrlsEnum.getFilteredAvailableDoctor,
        'POST',
        REQUEST_SERVERS.schedulerApiUrl1,
        object
      ).subscribe(
        (response: HttpSuccessResponse) => {
       
          this.checkArray = response.result.data;


          for (var i = 0; i < this.checkArray.length; i++) {
            if (this.checkArray[i]["URI"] == null) {
              this.checkArray[i]["URI"] = this.defaultDoctorImageUrl;
            }
            else {
              this.checkArray[i]["URI"] = this.checkArray[i].URI;
            }
            // this.checkArray[i]["id"] = this.checkArray[i]["doctor"]["user_id"]
            this.checkArray[i]["name"] = this.checkArray[i].middle_name?this.checkArray[i].first_name+' '+this.checkArray[i].middle_name+' '+this.checkArray[i].last_name:this.checkArray[i].first_name+' '+this.checkArray[i].last_name;
            // this.checkArray[i]["first_name"] = this.checkArray[i].doctor.first_name;
            // this.checkArray[i]["last_name"] = this.checkArray[i].doctor.last_name;
            this.checkArray[i]["color"] =  this.checkArray[i].specialities.color;
            // this.checkArray[i].doctor.specialities.color = "#" + this.checkArray[i].doctor.specialities.color;
            // this.checkArray[i]["speciality"] = this.checkArray[i].doctor.specialities.name;
            // this.checkArray[i].id = this.checkArray[i].doctor.user_id;
            this.checkArray[i]['isChecked'] = false;
          }
          const scheduler = this.storageData.getSchedulerInfo()
          let swapCheck = JSON.parse(scheduler.supervisor_assign_doctor_is_swapped)
          let x = JSON.parse(scheduler.supervisor_assign_doctor_all_doctors)
		  let y = JSON.parse(scheduler.supervisor_assign_doctor_all_clinics)
          for (var j = 0; j < this.checkArray.length; j++) {
            if (swapCheck) {
              if (x.length > 1) {
                for (var f = 0; f < x.length; f++) {
                  if (this.checkArray[j].doctor.user_id == x[f].docId || this.checkArray[j].doctor.user_id == x[f].id) {
                    this.checkArray[j]['isChecked'] = x[f]['isChecked'];
                  }
                }
              }
              else {
                if (this.checkArray[j].doctor.user_id == x[0].docId || this.checkArray[j].doctor.user_id == x[0].id) {
                  this.checkArray[j]['isChecked'] = x[0]['isChecked'];
                }
              }
            }
            else {
              if (y.length > 1) {
                for (var f = 0; f < y.length; f++) {
                  if (this.checkArray[j].doctor.user_id == y[f].docId || this.checkArray[j].doctor.user_id == y[f].id) {
                    this.checkArray[j]['isChecked'] = y[f]['isChecked'];
                  }
                }
              }
              else {
                if (this.checkArray[j].doctor.user_id == y[0].docId || this.checkArray[j].doctor.user_id == y[0].id) {
                  this.checkArray[j]['isChecked'] = y[0]['isChecked'];
                }
              }
            }
          }
          this.checkAvailabilityDoc.emit(this.checkArray);
          this.tempDoc = this.checkArray;

          //hhh
          this.displayDoc = this.checkArray
          this.searchDocByNameBySpec()
          //

          this.isHide = false;
   
        });
  }
  
  
  /*Clinic filter function*/
  public showClinicFilter(event) {
    if (event.target.checked) {
      this.isShowFilter = true;
    }
    else {
      this.isShowFilter = false;
      this.clinicName = '';
      this.clinicAddress ='';
      this.clinicArea ='';
      this.searchClinicByNameByAddress();
    }
    // this.clinicName = this.clinicName;
    // this.clinicAddress = this.clinicAddress;
    // this.clinicArea = this.clinicArea;
  }
  /*Doctor filter function*/
  public showDocFilter(event) {
    if (event.target.checked) {
      this.isShowDocFilter = true;
    }
    else {
      this.isShowDocFilter = false;
      this.docName = '';
      this.docspec = '';
      this.searchDocByNameBySpec();
    }
  }
  /*Change Start Date function*/
  public changeStartDate() {
    this.minDate = new Date(this.startDate);
    if (this.startTime == null || this.endTime == null || this.startDate == null || this.endDate == null) {
      this.isHide = true;
      this.isCheckDisabled = true;
    }
    else {
      if (this.startDate.getDate() == this.endDate.getDate() && this.startDate.getMonth() == this.endDate.getMonth() && this.startDate.getFullYear() == this.endDate.getFullYear()) {
        this.minTime = new Date(this.startTime);
      }
      if (this.startDate.getDate() > this.endDate.getDate() || this.startDate.getMonth() > this.endDate.getMonth() || this.startDate.getFullYear() > this.endDate.getFullYear()) {
        this.endDate.setDate(this.startDate.getDate())
        this.endDate.setMonth(this.startDate.getMonth())
        this.endDate.setFullYear(this.startDate.getFullYear())
        this.minTime = new Date(this.startTime);
      }
      else {
        this.minTime = new Date(this.endTime);
        this.minTime.setHours(0);
        this.minTime.setMinutes(0);
      }
      this.isHide = false;
      this.isCheckDisabled = false;

    }
  }
  /*Change End Date function*/
  public changeEndDate() {
    this.minDate = new Date(this.startDate);
    if (this.startTime == null || this.endTime == null || this.startDate == null || this.endDate == null) {
      this.isHide = true;
      this.isCheckDisabled = true;
    }
    else {
      if (this.startDate.getDate() == this.endDate.getDate() && this.startDate.getMonth() == this.endDate.getMonth() && this.startDate.getFullYear() == this.endDate.getFullYear()) {
        this.minTime = new Date(this.startTime);
      }
      else {
        this.minTime = new Date(this.endTime);
        this.minTime.setHours(0);
        this.minTime.setMinutes(0);
      }
      this.isHide = false;
      this.isCheckDisabled = false;
    }
  }
  /*Change Start Time function*/
  public changeStartTime() {
    if (this.startTime == null || this.endTime == null || this.startDate == null || this.endDate == null) {
      this.isHide = true;
      this.isCheckDisabled = true;
    }
    else {
      this.startDate.setHours(this.startTime.getHours())
      this.startDate.setMinutes(this.startTime.getMinutes())
      this.endDate.setHours(this.endTime.getHours())
      this.endDate.setMinutes(this.endTime.getMinutes())
      this.minTime = new Date(this.startDate)
      if (this.startDate.getDate() == this.endDate.getDate() && this.startDate.getMonth() == this.endDate.getMonth() && this.startDate.getFullYear() == this.endDate.getFullYear()) {
        this.minTime = new Date(this.startTime);
      }
      else {
        this.minTime.setHours(0);
        this.minTime.setMinutes(0);
      }
      this.isHide = false;
      this.isCheckDisabled = false;

    }
  }
  /*Change End Time function*/
  public changeEndTime() {
    if (this.startTime == null || this.endTime == null || this.startDate == null || this.endDate == null) {
      this.isHide = true;
      this.isCheckDisabled = true;
    }
    else {
      this.startDate.setHours(this.startTime.getHours())
      this.startDate.setMinutes(this.startTime.getMinutes())
      this.endDate.setHours(this.endTime.getHours())
      this.endDate.setMinutes(this.endTime.getMinutes())
      this.minTime = new Date(this.startDate)
      if (this.startDate.getDate() == this.endDate.getDate() && this.startDate.getMonth() == this.endDate.getMonth() && this.startDate.getFullYear() == this.endDate.getFullYear()) {
        this.minTime = new Date(this.startTime);
      }
      else {
        this.minTime.setHours(0);
        this.minTime.setMinutes(0);
      }
      this.isHide = false;
      this.isCheckDisabled = false;

    }
  }

  public searchClinicByNameByAddress() {
	let tempDisplay = this.clinics.filter((element) => {
		// return element.name.toLowerCase().includes(this.clinicName.toLowerCase()) ||element.facility_name.toLowerCase().includes(this.clinicName.toLowerCase());
		// let facility_full_name=((element.facility_name?element.facility_name.toLowerCase():'')+(element.name?'-'+element.name.toLowerCase():''))
		// return  facility_full_name.includes(this.clinicName.toLowerCase());
		let facility_full_name=((element && element.facility_name?element.facility_name.toLowerCase():'')+(element.name?'-'+element.name.toLowerCase():''))
		let facility_full_name_qualifier=((element &&element.facility && element.facility.qualifier?element.facility.qualifier.toLowerCase():'')+(element.qualifier?'-'+element.qualifier.toLowerCase():''))

		return  (facility_full_name.includes(this.clinicName.toLowerCase()) || facility_full_name_qualifier.includes(this.clinicName.toLowerCase()));



	});
	if(!isEmpty(this.clinicAddress))
	{
		let address=this.clinicAddress.replace(/[, ]+/g, " ").trim();
		this.filterClinic = tempDisplay.filter((element) => {
			// if(element.address && element.city && element.state && element.zip)
			// {
			// 	// return  element.address.toLowerCase().includes(this.clinicAddress.toLowerCase()) || element.city.toLowerCase().includes(this.clinicAddress.toLowerCase()) ||(element.state.toLowerCase() +' '+ element.zip).includes(this.clinicAddress.toLowerCase());
			// 	return  (element.address.toLowerCase()+(element.floor?' '+element.floor:'')+', '+element.city.toLowerCase()+', '+element.state.toLowerCase() +' '+ element.zip).includes(this.clinicAddress.toLowerCase());

			// }
			// else
			// return false;	
			let address_floor_city_state_zip=((element.address?element.address.toLowerCase():'')+(element.floor?' '+element.floor.toLowerCase():'')+(element.city?' '+element.city.toLowerCase():'')+(element.state?' '+element.state.toLowerCase():'')+(element.zip?' '+element.zip.toLowerCase():''))
				// if (element.address && element.city && element.state && element.zip) {
					// return element.address.toLowerCase().includes(this.clinicAddress.toLowerCase()) || element.city.toLowerCase().includes(this.clinicAddress.toLowerCase()) || (element.state.toLowerCase() +' '+ element.zip).includes(this.clinicAddress.toLowerCase());
					// return  (element.address.toLowerCase()+(element.floor?' '+element.floor:'')+', '+element.city.toLowerCase()+', '+element.state.toLowerCase() +' '+ element.zip).includes(this.clinicAddress.toLowerCase());
				return address_floor_city_state_zip.toLowerCase().includes(address.toLowerCase())
		});	
	}
	else
	 this.filterClinic = tempDisplay
	
	// console.log(this.filterDoc);
	// console.log(this.displaySpec);
  }

  filterProviderOnPracticeLocation()
  {
	  this.filterDoc=[]
	let selectedPracticeLocation=this.filterClinic.filter(element => {
		return element.isChecked
	});
	selectedPracticeLocation.forEach(practice_location => {
		let filterDoc=this.doctors.filter((doc) => {
			return doc.facility_location_id=practice_location.id
		});
		this.filterDoc=[...this.filterDoc,...filterDoc]
	});
	// this.filterDoc=this.doctors.filter((element) => {
	// 	return element.facility_location_id=
	// });
  }

  specialityName :any;
  isSpecialityClicked:boolean;
  isSpecCheck:boolean;

  public specialityClicked() {
    this.isClinicClicked = false;
    this.isDoctorClicked = false;
    this.isSpecialityClicked = true;
    // this.isClinicCheck = false;
    // this.isDocCheck = false;
	if(this.specialityName)
	{
		this.isSpecCheck=true;
		this.searchSpecBySpecName();
	}
	else 
	{
		this.isSpecCheck=false;
	}
	
  } 
  OriginallstfilterSpecs:SpecialityInfo[]=[];
  lstfilterSpecs:any;


  public searchSpecBySpecName() {
    
	if(!this.isSpecCheck)
	{
	  this.specialityName='';
	 
	}
		if(this.specialityName)
		{
			let searchDocBySpec = this.OriginallstfilterSpecs.filter((element) => {
				return element.name?element.name.toLowerCase().includes(this.specialityName.toLowerCase()):''.includes(this.specialityName.toLocaleLowerCase()) || element.qualifier?element.qualifier.toLowerCase().includes(this.specialityName.toLowerCase()):''.includes(this.specialityName.toLocaleLowerCase())
			  });
		
			this.lstfilterSpecs=searchDocBySpec;
		}
		else
		{
			this.lstfilterSpecs=this.OriginallstfilterSpecs;
		}
		  
	
	  }

  /*Reset doctor availability filters  section*/
  public resetDocAvailabilityFilter() {
    this.isCheckAvailablityOrAllList = false;
    this.startDate = null;
    this.endDate = null;
    this.startTime = null;
    this.endTime = null;
    this.isHide = true;
  
    // this.loadmoredocarray = [];
    //hhh
    this.filterDoc = []
    this.displayDoc = []
    this.displayDoc = JSON.parse(JSON.stringify(this.doctors));
    //
    this.tempDoc = JSON.parse(JSON.stringify(this.doctors));
    if (this.docName != '' || this.docspec != '') {
      
      //hhh
      this.searchDocByNameBySpec();
      //
    }
    else {
      if (this.checkArray.length != 0) {
        for (var j = 0; j < this.doctors.length; j++) {
          if (this.checkArray.length > 1) {
            for (var f = 0; f < this.checkArray.length; f++) {
              if (this.doctors[j].doctor.user_id == this.checkArray[f].doctor.user_id) {
                this.doctors[j]['isChecked'] = this.checkArray[f]['isChecked'];
              }
            }
          }
          else {
            if (this.doctors[j].doctor.user_id == this.checkArray[0].doctor.user_id) {
              this.doctors[j]['isChecked'] = this.checkArray[0]['isChecked'];
            }
          }
        }
      }

      for (var i = 0; i < this.doctors.length; i++) {
      
        //hhh
        this.loadmoredocarray.push(this.doctors[i]);
        this.filterDoc.push(this.doctors[i]);
    
        //
      }
      
      
    }
    this.docCounter++;
    this.checkAvailabilityDoc.emit(this.doctors);
  }
  /*Initalize Doctor list function*/
  public intializeDocList() {
    for (var i = 0; i < this.doctors.length; i++) {
      
      //hhh
      this.loadmoredocarray.push(this.doctors[i]);
      this.filterDoc.push(this.doctors[i]);
     
      //
    }
  }
  

  public searchDocByNameBySpec() {
	// this.listUpdate()
	debugger;
    let searchDocByName = this.doctors.filter((element) => {
      if (element.doctor.info.middle_name == undefined || element.doctor.info.middle_name == null) {
        element.doctor.info.middle_name = ""
      }
    //   return (
	// 	(element.doctor.info.first_name? element.doctor.info.first_name:'' ).toLowerCase().includes(this.docName.toLowerCase()) ||
	// 	(element.doctor.info.middle_name  ).toLowerCase().includes(this.docName.toLowerCase()) ||
	// 	(element.doctor.info.last_name?element.doctor.info.last_name:''  ).toLowerCase().includes(this.docName.toLowerCase())
	// );
	let provider_full_name=`${element.doctor.info.first_name} ${element.doctor.info.middle_name} ${element.doctor.info.last_name} `;
	return (
		provider_full_name.toLowerCase().includes(this.docName.toLowerCase())
	);
});
	debugger;
    let searchDocBySpec = searchDocByName.filter((element) => {
      if (!element.doctor.specialities.name) {
        element.doctor.specialities = element.doctor.specialities
      }
      return ((element && element.doctor && 
	  element.doctor && element.doctor.specialities && element.doctor.specialities.name&&
	  element.doctor.specialities.name.toLowerCase().includes(this.docspec.toLowerCase()))|| 
	  element && element.doctor && 
	  element.doctor && element.doctor.specialities && element.doctor.specialities.qualifier&&
	  element.doctor.specialities.qualifier.toLowerCase().includes(this.docspec.toLowerCase()))
    });
    if(this.docName == "" && this.docspec == "")
    {
      if(this.docBackUp.length != 0)
      {
        this.filterDoc = this.docBackUp;
      }
      else
      {
        this.filterDoc = this.doctors;
      }
    }
    else
    {
      let checked_docs = this.filterDoc;
      this.filterDoc = searchDocBySpec;
    }
    //console.log(this.displaySpec);
  }

}
