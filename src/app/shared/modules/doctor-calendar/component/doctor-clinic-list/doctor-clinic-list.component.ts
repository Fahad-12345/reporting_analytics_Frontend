import { DatePipeFormatService } from './../../../../services/datePipe-format.service';
import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { SubjectService } from '../../subject.service'
import { DoctorCalendarService } from '../../doctor-calendar.service';
import { StorageData, HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { Router } from '@angular/router';
import { AssignRoomsUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-rooms/assign-rooms-urls-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { DoctorCalendarUrlsEnum } from '../../doctor-calendar-urls-enum';
import { FacilityInfo } from '../custom-model/facilityInfo.model';
import { DoctorInfo } from '../custom-model/doctorInfo.model';
import { SpecialityInfo } from '../custom-model/speciality.model';
import { convertDateTimeForRetrieving, convertDateTimeForSending, isEmpty } from '@appDir/shared/utils/utils.helpers';
import { Subscription,map } from 'rxjs';
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';

@Component({
  selector: 'app-doctor-clinic-list',
  templateUrl: './doctor-clinic-list.component.html',
  styleUrls: ['./doctor-clinic-list.component.scss']
})
export class DoctorClinicListComponent extends PermissionComponent implements OnInit, OnDestroy {
  public isCheckAvailablityOrAllList: boolean = false;
  public loadMoreTempArray: any = [];
  public checkArray: any = [];
  public searchedClinics: any = [];
  public isClinicClicked: boolean = false;
  public isShowAllClinicList: boolean = true;
  public isClinicClickedShowFilter: boolean = false;
  public isDoctorClickedShowFilter: boolean = true;
  public specialityName:string='';
  public clinicName = '';
  public clinicArea = '';
  public clinicAddress = '';
  public docCounter = 0;
  public clinicOffsetMore;
  public docOffSetMore;
  public doctorsLength;
  public clinicsLength;
  public isDoctorClicked: boolean = false;
  public isHide: boolean = true;
  public isCheckDisabled: boolean = false;
  public isShowDocFilter: boolean = false;
  public searchedDoctors: any = [];
  public isShowDoclist: boolean = true;
  public isShowDocFilterList: boolean = true;
  public loadmoredocarray: any = [];
  public isDocCheck: boolean = false;
  public isSpecCheck: boolean = false;
  public isClinicCheck: boolean = false;
  public isShowCheckArray: boolean = true;
  public docName = '';
  public docspec = ''
  public startDate = new Date()
  public endDate = new Date()
  public startTime = new Date();
  public endTime = new Date();
  public minTime: Date
  public minDate: Date
  public interval: number = 30;
  public localStorageId = JSON.stringify(this.storageData.getUserId())
  public patientPrivileges: boolean = false;
  public patient: any;
  public chart: any;
  public caseId: any;
  public allCaseIds = [];
  public checkPatient: any;
  private caseTypeModal: any;
  public caseIdModel: any;
  public isSpecialityClicked: boolean = true;
  public specclick = false;
  public splitter;
  public Name;
  public count = 0;
  public facilityId = [];
  public isInitial = true;
  public displayDoc: any = [];
  public displaySpec: any = [];
  public displayClinic: any = [];
  public allClinics;
  public clinics: any = [];
//   public isInitial = true;
	lstfilterDocs:DoctorInfo[]=[];
	lstfilterSpecs:SpecialityInfo[]=[];
	OriginallstfilterSpecs:SpecialityInfo[]=[];
	lstfilterClinics:FacilityInfo[]=[]

  public specialities: any = []
  public doctors: DoctorInfo[] = [];
  public selectedPatient:any;
  @Output() selectSpec = new EventEmitter();
  @Output() selectClinic = new EventEmitter();
  @Output() selectDoctor = new EventEmitter();
  @Output() patientCheck = new EventEmitter();
  //
  public provCalenderChosen: boolean = true;
  //
  
  protected subscriptions: Subscription[] = [];
  constructor(aclService: AclService,
    router: Router,
    protected requestService: RequestService,
    public formBuilder: FormBuilder,
    public _DoctorCalendarService: DoctorCalendarService,
    private storageData: StorageData,
    public SubjectService: SubjectService,
	public datePipeService:DatePipeFormatService,
    private cdRef: ChangeDetectorRef) {
    super(aclService, router);

    this.localStorageId = JSON.stringify(this.storageData.getUserId())

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
      this.checkArray = this.doctors;
    }

    // this.isHide = false;
    this.minDate = new Date(this.startDate);

    //Show Patient Form only for Provider Calender 
    if(this._DoctorCalendarService.PatientSchedulingCalendar == true){
      this.provCalenderChosen = false;
    }
    else{
      this.provCalenderChosen = true;
    }
  }

  ngOnInit() {
    this.displaySpec = this.specialities;
    this.checkPatient = true;
    this.patient = null;
    this.chart = null;
	this.clinicClicked()
    if (this.aclService.hasPermission(this.userPermissions.appointment_add)
      || this.storageData.isSuperAdmin()) {
      this.patientPrivileges = true;
    }
    this.SubjectService.castClinics.subscribe(res => {
      if (res.length != 0) {
        this.clinics = res
        this.displayClinic =res
        // this.clinicClicked()
		this.searchClinicByNameByAddress()
        this.listfilterCheck(1)
        
      }
      
    })
    this.SubjectService.castSpecialities.subscribe(res => {
      if (res.length != 0) {
        // this.specialities = JSON.parse(JSON.stringify(res))
		  this.specialities = res
        // this.displaySpec = JSON.parse(JSON.stringify(res))
          
          //If All Spec Access
          if (this.aclService.hasPermission("schedule-doctor-specialty-access")) {
            this.displaySpec = this.specialities;
			this.OriginallstfilterSpecs=this.specialities;
          }
		  else if(!this.aclService.hasPermission("schedule-doctor-specialty-access"))
		  {
			this.displaySpec = this.specialities;
			this.OriginallstfilterSpecs=this.specialities;
		  }
          else{
            this.displaySpec = []
		  }
		  this.listfilterCheck(1)
      }
	 
    })
    this.SubjectService.castDoctors.subscribe(res => {
      this.doctors = res
      this.displayDoc = this.doctors;
      this.listfilterCheck(1)

    //   this.defaultSelectLocDocSpec();
    })
    this.SubjectService.castRemove.subscribe(res => {
      if (res.length != 0) {
        if (res.doctor) {
          for (let i = 0; i < this.doctors.length; i++) {
            if (this.doctors[i].id == res.id) {
              this.doctors[i].is_checked = false;
            }
          }
          for (let i = 0; i < this.displayDoc.length; i++) {
            if (this.displayDoc[i].id == res.id) {
              this.displayDoc[i].is_checked = false;
            }
          }
          for (let i = 0; i < this.displayDoc.length; i++) {
            if (this.displayDoc[i].id == res.id) {
              this.displayDoc[i].is_checked = false;
              this.listfilterCheck(1);
            }
          }

		//   this.refreshList.emit('Practice_locationAndSpec')
		  
        } else {
          for (let i = 0; i < this.specialities.length; i++) {
            if (this.specialities[i].id == res.id) {
              this.specialities[i].is_checked = false;
            }
          }
          for (let i = 0; i < this.displaySpec.length; i++) {
            if (this.displaySpec[i].id == res.id) {
              this.displaySpec[i].is_checked = false;
              this.listfilterCheck(1);
            }
          }
		//   this.refreshList.emit('Practice_locationAndProvider')
        }
      }
    })
	this.subscriptions.push(this.SubjectService.castPatient.subscribe(patient=>{
		if(patient)
		{	
		this.selectedPatient=patient;
		this.onChangeSearchChart(this.selectedPatient.chartNo,true)
		}
	})
	)
	this.SubjectService.clearPatientData$.subscribe(status=>{
		if(status)
		{
			this.clearData('')
		}
	})
  this._DoctorCalendarService.setTimeofFacility({status: true});

  }
  ngOnDestroy() {
	
	unSubAllPrevious(this.subscriptions);
  }
  //Pre-Select Location, Provider, Specialty if Provider Logged in
  public defaultSelectLocDocSpec(){
    //console.log("LOGGEDIN::::",this.storageData.getRole(),this.storageData.getUserId(),this.storageData.getBasicInfo(),this.storageData.getEmail(),this.storageData.getUserPracticeLocationsData())
    let userRole = this.storageData.getRole(); 
    let userId = this.storageData.getUserId();
    let userFacilities = this.storageData.getUserPracticeLocationsData();
    let userSpec ;

    if(userRole.id == 6){ //Medical Assistant logged in
	  //Select Clinic
      for(let i = 0; i < this.displayClinic.length; i++) {
        for(let j = 0; j < userFacilities['facility_locations'].length; j++) {

          if (this.displayClinic[i].id == userFacilities['facility_locations'][j].id &&!this.displayClinic[i].is_checked) {
            //this.displaySpec[i].isChecked = false;
            //this.listfilterCheck(1);
            //console.log("LOGGEDIN2222",userFacilities['facility_locations'][j])
              this.clinicSelect(this.displayClinic[i],i);
            
          }
        }  
      }
      //Select Doc
      for(let i = 0; i < this.displayDoc.length; i++) {
          if (this.displayDoc[i].user_id == userId && !this.displayDoc[i].is_checked) {
            userSpec = this.displayDoc[i].doctor.specialities.id;
            this.doctorSelect(this.displayDoc[i]);           
          }
      }

       //Select Spec
       for(let i = 0; i < this.displaySpec.length; i++) {
		 if (this.displaySpec[i].id == userSpec && !this.displaySpec[i].is_checked) {
         
            this.specialitySelect(this.displaySpec[i]);
         }
        
      }
    }
  }

  trackByFn(index, item) {
    return index; // or item.id
  }
  /*Get specialities function*/
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

  /*Get all clinics function */
  public clinicClicked() {
    this.isClinicClicked = true;
    this.isDoctorClicked = false;
    this.isSpecialityClicked = false;
    // this.isDocCheck = false;
	// this.isSpecCheck=false;
	if(this.clinicName || this.clinicAddress)
	{
		this.isClinicCheck=true;
		this.searchClinicByNameByAddress();
	}
  }
  /*Get all doctors function */
  public doctorClicked() {
    this.isClinicClicked = false;
    this.isDoctorClicked = true;
    this.isSpecialityClicked = false;
    this.isClinicCheck = false;
	this.isSpecCheck=false;
	if(this.docName || this.docspec)
	{
		this.isDocCheck=true;
		this.searchDocByNameBySpec();
	}
  }

  public specialitySelect(spec:SpecialityInfo,index?, e?) {
    // spec.isChecked = e.currentTarget.checked
    spec.is_checked = !spec.is_checked
    this.selectSpec.emit(spec)
    this.listfilterCheck(1);
	// if(this.isSpecialityClicked && this.isSpecCheck)
	// {
	// this.searchSpecBySpecName()
	// }

  }

  public clinicSelect(clinic:FacilityInfo,index?, e?) {

	clinic.is_checked = !clinic.is_checked;
	// this.clinics[index].is_checked=clinic.is_checked
    // this.isInitial = true;
    this.selectClinic.emit(clinic)
	
    this.listfilterCheck(1);
	if(this.isClinicClicked && this.isClinicCheck)
	{
	this.searchClinicByNameByAddress();	
	}

  }

  public doctorSelect(doc:DoctorInfo, e?) {
    // doc.isChecked = e.currentTarget.checked
    doc.is_checked = !doc.is_checked
    this.selectDoctor.emit(doc)
    this.listfilterCheck(1);

	//  if(this.isDoctorClicked && this.isDocCheck)
	// {
	// 	this.searchDocByNameBySpec()
	// }


  }

 
  public listfilterCheck(check) {
    // // if (check == 1) {
    // console.log(this.displayDoc);
    // console.log(this.displaySpec);
    // console.log(this.displayClinic);
    // // let selectedSpec: SpecialityInfo[] = []
    // // this.displayDoc = []
    // // this.displayClinic = []
    // let displayClinicIds = []
	// let displayDocIds = [];
	// this.lstfilterDocs=[];
	
	// this.lstfilterSpecs=[];
	// this.lstfilterClinics=[]
	// let selectedClinics:FacilityInfo[]=this.displayClinic.filter(displayclinic=>displayclinic.is_checked);
	// let selectedDoc:DoctorInfo[]=this.displayDoc.filter(displaydoc=>displaydoc.is_checked);
	// let selectedSpec:SpecialityInfo[]=this.displaySpec.filter(displayspec=>displayspec.is_checked);
	// // let selectedspec:DoctorInfo[]=this.displaySpec.filter(displayspec=>displayspec.is_checked);
	// if(selectedClinics.length>0)
	// {		
	// 	selectedClinics.forEach(selectClinic=>{
	// 		let filtered_displaydoc=this.displayDoc && this.displayDoc.filter(displaydoc=>displaydoc.facility_location_id==selectClinic.id);
	// 		if(filtered_displaydoc.length>0)
	// 		{
    //     filtered_displaydoc.forEach(filter_doc=>{
    //       if(!(this.lstfilterDocs.find(doc=>doc.user_id==filter_doc.user_id)))
    //       {
    //         this.lstfilterDocs.push(filter_doc);
    //       }      
    //       let filtered_displayspec=this.displaySpec &&this.displaySpec.filter(displayspec=>displayspec.id==filter_doc.speciality_id);
    //       if(filtered_displayspec.length>0)
    //       {
    //         filtered_displayspec.forEach(filterdispspec=>{
    //           if(!this.lstfilterSpecs.find(filterspec=>filterspec.id==filterdispspec.id))
    //           {
    //             this.lstfilterSpecs.push(filterdispspec);    
    //           }
    //         })          
    //       }
    //     })			
	// 		}		
	// 	});	
	// }
	//  if(selectedDoc.length>0)
	// {
	// 	selectedDoc.forEach(selectDoc=>{
	// 		let filtered_displayclinic=this.displayClinic && this.displayClinic.filter(displayclinic=>displayclinic.id==selectDoc.facility_location_id);
	// 		if(filtered_displayclinic.length>0)
	// 		{
    //     filtered_displayclinic.forEach(filterDispClinic=>{
    //       if(!(this.lstfilterClinics.find(clinic=>clinic.id==filterDispClinic.id)))
    //       {
    //         this.lstfilterClinics.push(filterDispClinic);
    //       }
    //       let filtered_displayspec=this.displaySpec &&this.displaySpec.filter(displayspec=>displayspec.id==selectDoc.speciality_id);
    //       if(filtered_displayspec.length>0)
    //       {
    //         filtered_displayspec.forEach(filterDispSpec=>{
    //           if(!this.lstfilterSpecs.find(filterspec=>filterspec.id==filterDispSpec.id))
    //           {
	// 			this.lstfilterSpecs.push(filterDispSpec);
				
      
    //           }
    //         })
           
    //       }  
    //     })
	// 		}
	// 	});
	// }

	// if(selectedSpec.length>0)
	// {
	// 	selectedSpec.forEach(selectSpec=>{
	// 		let filtered_displayDoc=this.displayDoc && this.displayDoc.filter(displaydoc=>displaydoc.speciality_id==selectSpec.id);
	// 		if(filtered_displayDoc.length>0)
	// 		{
	// 			filtered_displayDoc.forEach(filterDispDoc=>{
	// 				if(!(this.lstfilterDocs.find(doc=>doc.user_id==filterDispDoc.user_id &&doc.speciality_id==filterDispDoc.speciality_id )))
	// 			{
	// 				this.lstfilterDocs.push(filterDispDoc);
	// 			}

	// 			let filtered_displayClinic=this.displayClinic &&this.displayClinic.filter(displayclinic=>displayclinic.id==filterDispDoc.facility_location_id);
	// 			if(filtered_displayClinic.length>0)
	// 			{
	// 				filtered_displayClinic.forEach(filterDispClinic=>{
	// 					if(!this.lstfilterClinics.find(filterclinic=>filterclinic.id==filterDispClinic.id))
	// 				{
	// 					this.lstfilterClinics.push(filterDispClinic);
	
	// 				}
	// 				})
					
	// 			}

	// 			})

	// 		}
	// 	});
	// }

	// 	 selectedDoc.length==0 && selectedSpec.length==0?this.lstfilterClinics=this.displayClinic:this.lstfilterClinics;
	// 	 selectedClinics.length==0 && selectedSpec.length==0? this.lstfilterDocs=this.displayDoc:this.lstfilterDocs;
	// 	 selectedDoc.length==0 && selectedClinics.length==0? this.lstfilterSpecs=this.displaySpec:this.lstfilterSpecs;
	// 	 this.OriginallstfilterSpecs=[...this.lstfilterSpecs];

	this.lstfilterClinics=[...this.displayClinic];
	this.lstfilterDocs=[...this.displayDoc]
	this.lstfilterSpecs=[...this.displaySpec];
	if(this.isClinicCheck)
	{
		this.searchClinicByNameByAddress();
	}
	if(this.isSpecCheck )
	{
		this.searchSpecBySpecName();
	}
	if(this.isDocCheck)
	{
		this.searchDocByNameBySpec();
	}
	// selectedSpec=this.displaySpec.filter(speciality=>speciality.is_checked)
    // // for (let i = 0; i < this.displaySpec.length; i++) {
    // //   if (this.displaySpec[i].isChecked) {
    // //     selectedSpec.push(this.displaySpec[i])
    // //   }
	// // }
	
    // if (selectedSpec.length == 0) {
    //   this.displayDoc = this.doctors;
    //   this.displayClinic = this.clinics;
	// }
	
    // for (let j = 0; j < selectedSpec.length; j++) {
    //   for (let d = 0; d < this.doctors.length; d++) {
    //     for (let ds = 0; ds < this.doctors[d].doctor.specAllArray.length; ds++) {
    //       if (this.doctors[d].doctor.specAllArray[ds].id == selectedSpec[j].id) {
    //         if (!displayDocIds.includes(this.doctors[d].id)) {
    //           this.displayDoc.push(this.doctors[d])
    //           displayDocIds.push(this.doctors[d].id)
    //         }
    //         for (let f = 0; f < this.clinics.length; f++) {
    //           if (this.doctors[d].doctor.specAllArray[ds].facilityId == this.clinics[f].id && !displayClinicIds.includes(this.clinics[f].id)) {
    //             displayClinicIds.push(this.clinics[f].id)
    //             this.displayClinic.push(this.clinics[f])
    //             break;
    //           }
    //         }
    //         // break;
    //       }
    //     } 
    //   }
    // }
    // console.log(this.displayDoc);
    // console.log(this.displaySpec);
    // console.log(this.displayClinic);
    // // doctor 
	// let selectedDoc = [];
	// selectedDoc=this.displayDoc.filter(displaydoc=>displaydoc.is_checked)
    // // for (let i = 0; i < this.displayDoc.length; i++) {
    // //   if (this.displayDoc[i].is_checked) {
    // //     selectedDoc.push(this.displayDoc[i])
    // //   }
    // // }
    // let specIds = []
    // if (selectedDoc.length != 0) {
    //   let specArray = []
    //   for (let j = 0; j < this.specialities.length; j++) {
    //     for (let d = 0; d < selectedDoc.length; d++) {
    //       let br = false;
    //     //   for (let ds = 0; ds < this.doctors[d].doctor.specAllArray.length; ds++) {
    //     //     if(selectedDoc[d].doctor.specAllArray.length == ds)
    //     //     {
    //     //       break;
    //     //     }
    //     //     if (selectedDoc[d].doctor.specAllArray[ds].id == this.specialities[j].id &&
    //     //       !specIds.includes(this.specialities[j].id)) {
    //     //       specArray.push(this.specialities[j])
    //     //       specIds.push(this.specialities[j].id)
    //     //       br = true;
    //     //       break;
    //     //     }
    //     //   } for time being
    //       if (br) { break }
    //     }
    //   }
    //   this.displaySpec = specArray;
    //   let clinicArray = []
    //   let clinicIds = []
    //   for (let j = 0; j < this.displayClinic.length; j++) {
    //     for (let d = 0; d < selectedDoc.length; d++) {
    //       let br = false;
    //       for (let ds = 0; ds < selectedDoc[d].doctor.specAllArray.length; ds++) {
    //         if (selectedDoc[d].doctor.specAllArray[ds].facilityId == this.displayClinic[j].id
    //           && !clinicIds.includes(this.displayClinic[j].id)) {
    //           clinicArray.push(this.displayClinic[j])
    //           clinicIds.push(this.displayClinic[j].id)
    //           br = true;
    //           break;
    //         }
    //       }
    //       if (br) { break }
    //     }
    //   }
    //   this.displayClinic = clinicArray
    // } else {
    //   //If user has All Spec Access
    //   if (this.aclService.hasPermission("schedule-doctor-specialty-access")) {
    //     this.displaySpec = this.specialities;
    //   }
    //   else{
    //     if(selectedSpec.length > 0){
    //       this.displaySpec = this.specialities;
    //     }
    //     else{
    //       this.displaySpec = []
    //     }
    //     //this.displaySpec = []
    //   }
    //   //this.displaySpec = this.specialities; //hhh
    // }
    // // var result = this.displayDoc.reduce((unique, o) => {
    // //   if (!unique.some(obj => obj.id === o.id)) {
    // //     unique.push(o);
    // //   }
    // //   return unique;
    // // }, []);
    // // this.displayDoc = result;
    // console.log(this.displayDoc);
    // console.log(this.displaySpec);
    // console.log(this.displayClinic);
    // // clinic
    // let selectedClinic = [];
    // for (let i = 0; i < this.displayClinic.length; i++) {
    //   if (this.displayClinic[i].is_checked) {
    //     selectedClinic.push(this.displayClinic[i])
    //   }
    // }
    // this.clinics = this.displayClinic;

    // if (selectedClinic.length != 0) {
    //   let docArray = []
    //   let specArray = []
    //   let specArrayIds = []

    //   let docArrayIds = []
    // //   for (let j = 0; j < this.displayDoc.length; j++) {
    // //     for (let d = 0; d < selectedClinic.length; d++) {
    // //       for (let ds = 0; ds < this.displayDoc[j].doctor.specAllArray.length; ds++) {
    // //         if (selectedClinic[d].id == this.displayDoc[j].doctor.specAllArray[ds].facilityId 
    // //          ) {
    // //           //
    // //           if ( !docArrayIds.includes(this.displayDoc[j].id)){
    // //             docArrayIds.push(this.displayDoc[j].id)
              
    // //             //
    // //             docArray.push(this.displayDoc[j])
    // //           }
             
    // //           for (let sp = 0; sp < this.displaySpec.length; sp++) {
    // //             if (this.displaySpec[sp].id === this.displayDoc[j].doctor.specAllArray[ds].id &&
    // //               !specArrayIds.includes(this.displaySpec[sp].id)) {
    // //               specArrayIds.push(this.displaySpec[sp].id)
    // //               specArray.push(this.displaySpec[sp])
    // //               break;
    // //             }
    // //           }
    // //           break;
    // //         }
    // //       }
    // //     }
    // //   } for time being
    //   this.displaySpec = specArray;
    //   this.displayDoc = docArray;
    // }
    // console.log(this.displayDoc);
    // console.log(this.displaySpec);
    // console.log(this.displayClinic);
    // this.searchClinicByNameByAddress()
	// this.searchDocByNameBySpec()

  }

  /*Check full avialability of a doctor against date and time*/
  public checkAvailability() {
    this.startDate.setSeconds(0)
    this.endDate.setSeconds(0)
    this.startDate.setMilliseconds(0)
    this.endDate.setMilliseconds(0)
    this.localStorageId = JSON.stringify(this.storageData.getUserId())
    let allFacilitySupervisorClinicIds = []
    if (this.aclService.hasPermission(this.userPermissions.all_doctors)) {
      allFacilitySupervisorClinicIds = this.storageData.getFacilityLocations()
    }
	let practice_location_ids=[];
	if(this.clinics.length>0)
	{
		this.clinics.map(practicelocation=>{
			if(practicelocation.is_checked)
			{
				practice_location_ids.push(practicelocation.id) 
			}
			
		})
	}
    let newTemp1 = new Date(this.startDate)
    let newTemp2 = new Date(this.endDate)
    this.requestService
      .sendRequest(
        AssignRoomsUrlsEnum.getFilteredAvailableDoctor,
        'POST',
        REQUEST_SERVERS.schedulerApiUrl1,
        {
			'start_date':convertDateTimeForSending(this.storageData, newTemp1),
			'end_date': convertDateTimeForSending(this.storageData, newTemp2),
        //   'dateRange': [convertDateTimeForSending(this.storageData, newTemp1), convertDateTimeForSending(this.storageData, newTemp2)],
          'facility_location_ids':practice_location_ids.length>0?practice_location_ids: allFacilitySupervisorClinicIds
        }
      ).subscribe(
        (response: HttpSuccessResponse) => {
        //   const facility = this.storageData.getFacilityLocations()
        //   for (let p = 0; p < response.result.data.length; p++) {
        //     for (let x = 0; Array.isArray(response.result.data[p].doctor.specialities) && x < response.result.data[p].doctor.specialities.length; x++) {
        //       for (let j = 0; j < facility.length; j++) {
        //         if (facility[j] === response.result.data[p].doctor.specialities[x].facilityId) {
        //           response.result.data[p].doctor.specialities = response.result.data[p].doctor.specialities[x];
        //           break;
        //         }
        //       }
        //     }
        //   }
          let allDocClinics = []
          if (this.storageData.isDoctor()) {
            let allDocClinics = this.storageData.getFacilityLocations()
          }
          if (allDocClinics.length > 0 && !this.storageData.isSuperAdmin()) {
            this.requestService
              .sendRequest(
                AssignRoomsUrlsEnum.getFilteredAvailableDoctor,
                'POST',
                REQUEST_SERVERS.schedulerApiUrl1,
                {
				'start_date':convertDateTimeForSending(this.storageData, newTemp1),
				'end_date': convertDateTimeForSending(this.storageData, newTemp2),
                //   'dateRange': [convertDateTimeForSending(this.storageData, newTemp1), convertDateTimeForSending(this.storageData, newTemp2)],
                  'facility_location_ids': allFacilitySupervisorClinicIds,
                  'doctor_id': this.localStorageId
                }
              ).subscribe(
                (resp: HttpSuccessResponse) => {
                  for (let p = 0; p < resp.result.data.length; p++) {
                    let check = 0;
                    for (let o = 0; o < response.result.data.length; o++) {
                      if (response.result.data[o].user_id === resp.result.data[p].user_id) {
                        check = 1
                      }
                    }
                    if (check === 0) {
                    //   const facility = this.storageData.getFacilityLocations()
                    //   for (let x = 0; Array.isArray(resp.result.data[p].doctor.specialities) && x < resp.result.data[p].doctor.specialities.length; x++) {
                    //     for (let j = 0; j < facility.length; j++) {
                    //       if (facility[j] === resp.result.data[p].doctor.specialities[x].facilityId) {
                    //         resp.result.data[p].doctor.specialities = resp.result.data[p].doctor.specialities[x];
                    //         break;
                    //       }
                    //     }
                    //   }
                      response.result.data.push(resp.result.data[p])
                    }
                  }

                  this.checkArray = response.result.data;
                  for (var i = 0; i < this.checkArray.length; i++) {
                    if (this.checkArray[i]["URI"] == null) {
                      this.checkArray[i]["URI"] = this.defaultDoctorImageUrl;
                    }
                    else {
                      this.checkArray[i]["URI"] = this.checkArray[i].URI;
                    }
                    // this.checkArray[i].id = this.checkArray[i].user_id;
                    // this.checkArray[i].doctor.specialities.color =  this.checkArray[i].specialities.color;
                    this.checkArray[i]['is_checked'] = false;
                  }


                  this.isHide = false;

                  this.loadmoredocarray = [];
                  this.isShowCheckArray = false;
                  this.isShowDoclist = true;
                  const scheduler = this.storageData.getSchedulerInfo();

                  let x = JSON.parse(scheduler.front_desk_doctor_calendar_doctors)
                  for (var j = 0; j < this.checkArray.length; j++) {
                    if (x.length > 1) {
                      for (var f = 0; f < x.length; f++) {
                        if (this.checkArray[j].doctor.user_id == x[f].id || this.checkArray[j].doctor.user_id == x[f].id) {
                          this.checkArray[j]['is_checked'] = x[f]['iis_checkedsChecked'];
                        }
                      }
                    }
                    else {
                      if (this.checkArray[j].doctor.user_id == x[0].id || this.checkArray[j].doctor.user_id == x[0].id) {
                        this.checkArray[j]['is_checked'] = x[0]['is_checked'];
                      }
                    }
                  }
                  if (this.docName != '' || this.docspec != '') {
                    if (this.docName != '') {
                      // this.searchDocByName(this.docName);
                    }
                    if (this.docspec != '') {
                      // this.searchDocBySpec(this.docspec);
                    }
                    this.isShowCheckArray = true;
                  }
                  else {
                    this.isShowCheckArray = false;
                  }

                  this.isCheckAvailablityOrAllList = true;

                });
          } else {
            this.checkArray = response.result.data;
            for (var i = 0; i < this.checkArray.length; i++) {
              if (this.checkArray[i]["URI"] == null) {
                this.checkArray[i]["URI"] = this.defaultDoctorImageUrl;
              }
            //   else {
            //     this.checkArray[i]["URI"] = this.checkArray[i].doctor.URI;
            //   }
            //   this.checkArray[i].id = this.checkArray[i].user_id;
            //   this.checkArray[i].doctor.specialities.color = "#" + this.checkArray[i].doctor.specialities.color;
              this.checkArray[i]['is_checked'] = false;
            }

            this.isHide = false;

            this.loadmoredocarray = [];
            this.isShowCheckArray = false;
            this.isShowDoclist = true;
            const scheduler = this.storageData.getSchedulerInfo();

            let x = JSON.parse(scheduler.front_desk_doctor_calendar_doctors)
            // for (var j = 0; j < this.checkArray.length; j++) {
            //   if (x.length > 1) {
            //     for (var f = 0; f < x.length; f++) {
            //       if (this.checkArray[j].doctor.user_id == x[f].id || this.checkArray[j].doctor.user_id == x[f].id) {
            //         this.checkArray[j]['isChecked'] = x[f]['isChecked'];
            //       }
            //     }
            //   }
            //   else {
            //     if (this.checkArray[j].doctor.user_id == x[0].id || this.checkArray[j].doctor.user_id == x[0].id) {
            //       this.checkArray[j]['isChecked'] = x[0]['isChecked'];
            //     }
            //   }
            // }
			
  for (var j = 0; j < this.checkArray.length; j++) {
              if (x.length > 1) {
                for (var f = 0; f < x.length; f++) {
                  if (this.checkArray[j].user_id == x[f].user_id || this.checkArray[j].user_id == x[f].user_id) {
                    this.checkArray[j]['is_checked'] = x[f]['is_checked'];
                  }
                }
              }
              else {
                if (this.checkArray[j].user_id == x[0].user_id || this.checkArray[j].user_id == x[0].user_id) {
                  this.checkArray[j]['is_checked'] = x[0]['is_checked'];
                }
              }
            }

            if (this.docName != '' || this.docspec != '') {
              if (this.docName != '') {
                // this.searchDocByName(this.docName);
              }
              if (this.docspec != '') {
                // this.searchDocBySpec(this.docspec);
              }
              this.isShowCheckArray = true;
            }
            else {
              this.isShowCheckArray = false;
            }
            this.isCheckAvailablityOrAllList = true;
          }
		 this. lstfilterDocs=this.checkArray;
        });
  }

  /*Reset doctor availability filters  section*/
  public resetDocAvailabilityFilter() {
    this.isCheckAvailablityOrAllList = false;
    // this.startDate = null;
    // this.endDate = null;
    // this.startTime = null;
    // this.endTime = null;
	this.startDate=new Date();
	this.endDate=new Date();
	this.startTime = new Date(this.startDate);
    this.endDate.setMinutes(this.endDate.getMinutes() + 30)
    this.endTime = new Date(this.endDate);
    this.minTime = new Date(this.startTime);
    this.isHide = true;
    this.isShowCheckArray = true;
    this.isShowDoclist = false;
    this.loadmoredocarray = [];
    if (this.docName != '' || this.docspec != '') {
      this.searchDocByNameBySpec()
    }
    else {
      if (this.checkArray.length != 0) {
        for (var j = 0; j < this.doctors.length; j++) {
          if (this.checkArray.length > 1) {
            for (var f = 0; f < this.checkArray.length; f++) {
              if (this.doctors[j].user_id == this.checkArray[f].user_id) {
                this.doctors[j].is_checked = this.checkArray[f]['isChecked'];
              }
            }
          }
          else {
            if (this.doctors[j].user_id == this.checkArray[0].user_id) {
              this.doctors[j].is_checked = this.checkArray[0]['isChecked'];
            }
          }
        }
      }

    }
    this.docCounter++;
  }

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
	  if(!this.isClinicCheck)
	  {
		this.clinicName='';
		this.clinicAddress=''
	}
	let tempDisplay = this.displayClinic.filter((element) => {
		// return element.name.toLowerCase().includes(this.clinicName.toLowerCase()) ||element.facility_name.toLowerCase().includes(this.clinicName.toLowerCase());
		let facility_full_name=((element.facility_name?element.facility_name.toLowerCase():'')+(element.name?'-'+element.name.toLowerCase():''))
		let facility_full_name_qualifier=((element && element.facility && element.facility.qualifier?element.facility.qualifier.toLowerCase():'')+(element.qualifier?'-'+element.qualifier.toLowerCase():'')) 

		return  (facility_full_name.includes(this.clinicName.toLowerCase()) || facility_full_name_qualifier.includes(this.clinicName.toLowerCase()));

	});
	if(!isEmpty(this.clinicAddress))
	{
		let address=this.clinicAddress.replace(/[, ]+/g, " ").trim();
		this.lstfilterClinics = tempDisplay.filter((element) => {
			let address_floor_city_state_zip=((element.address?element.address.toLowerCase():'')+(element.floor?' '+element.floor.toLowerCase():'')+(element.city?' '+element.city.toLowerCase():'')+(element.state?' '+element.state.toLowerCase():'')+(element.zip?' '+element.zip.toLowerCase():''))	
			// if (element.address && element.city && element.state && element.zip) {
					// return element.address.toLowerCase().includes(this.clinicAddress.toLowerCase()) || element.city.toLowerCase().includes(this.clinicAddress.toLowerCase()) || (element.state.toLowerCase() +' '+ element.zip).includes(this.clinicAddress.toLowerCase());
					// return  (element.address.toLowerCase()+(element.floor?' '+element.floor:'')+', '+element.city.toLowerCase()+', '+element.state.toLowerCase() +' '+ element.zip).includes(this.clinicAddress.toLowerCase());
				return address_floor_city_state_zip.toLowerCase().includes(address.toLowerCase())
		});	
	}
	else
	 this.lstfilterClinics = tempDisplay
	


  }

  public searchDocByNameBySpec() {
	  debugger;
	if(!this.isDocCheck)
	{
	  this.docName='';
	  this.docspec=''
  }

	let searchDocByName = this.doctors.filter((element) => {
		if (element.doctor.info.middle_name == undefined || element.doctor.info.middle_name == null) {
		  element.doctor.info.middle_name = ""
		}
	  //   return (
	  // 	(element.doctor.info.first_name? element.doctor.info.first_name:'' ).toLowerCase().includes(this.docName.toLowerCase()) ||
	  // 	(element.doctor.info.middle_name  ).toLowerCase().includes(this.docName.toLowerCase()) ||
	  // 	(element.doctor.info.last_name?element.doctor.info.last_name:''  ).toLowerCase().includes(this.docName.toLowerCase())
	  // );
	  let provider_full_name=`${element.doctor.info.first_name}${element.doctor.info.middle_name?' '+element.doctor.info.middle_name:''} ${element.doctor.info.last_name} `;
	  return (
		  provider_full_name.toLocaleLowerCase() .includes(this.docName.toLowerCase())
	  );
  });
	  let searchDocBySpec = searchDocByName.filter((element) => {
		if (!element?.doctor?.specialities?.name) {
		  element.doctor.specialities = element?.doctor?.specialities?.[0]
		}
		return element?.doctor?.specialities?.name.toLowerCase().includes(this.docspec.toLowerCase()) || element?.doctor?.specialities?.qualifier.toLowerCase().includes(this.docspec.toLowerCase())
	  });
	this.lstfilterDocs=searchDocBySpec;

  }

  public searchSpecBySpecName() {
    
if(!this.isSpecCheck)
{
  this.specialityName='';
 
}
	if(this.specialityName)
	{
		let searchDocBySpec = this.OriginallstfilterSpecs.filter((element) => {
			// return element.name?element.name.toLowerCase().includes(this.specialityName.toLowerCase()):''.includes(this.specialityName.toLocaleLowerCase())
		
			let specialty_name=((element.name?element.name.toLowerCase():''))
			let specialty_name_qualifier=((element.qualifier?element.qualifier.toLowerCase():''))
	
			return  (specialty_name.includes(this.specialityName.toLowerCase()) || specialty_name_qualifier.includes(this.specialityName.toLowerCase()));
		
		});

		 
	
		this.lstfilterSpecs=searchDocBySpec;
	}
	else
	{
		this.lstfilterSpecs=this.OriginallstfilterSpecs;
	}
	  

  }

  chnageCaseId(event) {
    for (let i = 0; i < this.allCaseIds.length; i++) {
      if (this.allCaseIds[i].case_id == parseInt(event.target.value)) {
        this.caseIdModel = parseInt(event.target.value);
        this.caseTypeModal = this.allCaseIds[i].case_type

      }
    }
  }

  keyword = 'name';
  data = [

  ];

  caseFormat = true;
  chartStr = ''
  selectEvent(item) {
    this.patientCheck.emit(item)
    // do something with selected item
    this.chart = item.id
    this.caseFormat = false;
    //this.chartStr = JSON.stringify(item.id) //hhh
       //Formatting Chart No..HHH
       var startString = "000-00-"
       var receivedString = JSON.stringify(item.id)
       var finalStr = startString + receivedString.padStart(4, "0");
       this.chartStr = finalStr
      //
    this.patient = item.name
    this.requestService
      .sendRequest(
        DoctorCalendarUrlsEnum.getAllReturningCasesByPatient + JSON.stringify(this.chart),
        'GET',
        REQUEST_SERVERS.kios_api_path,
      ).subscribe(
        (res: any) => {
          this.allCaseIds = res.result.data;
          this.caseIdModel = this.allCaseIds[0].case_id
          this.caseTypeModal = this.allCaseIds[0].case_type
          this.cdRef.detectChanges()
        }
      )
    item = {}
  }

  //Check if string contains alpha numeric characters
   isAlphaNumeric(str) {
    return str.match(/^[a-z0-9]+$/i) !== null;
  }

  onChangeSearch(val: string) {
    // fetch remote data from here
    // And reassign the 'data' which is binded to 'data' property.

    //checking if value is not null and not alpha numeric
    if (val !== "" ) {
      // && this.isAlphaNumeric(val)
      //console.log("VALLZ",val)

      this.requestService
        .sendRequest(
          DoctorCalendarUrlsEnum.getPatient,
          'POST',
          REQUEST_SERVERS.kios_api_path,
          {
            "case_id" : null,
             "per_page" : 50,
             "order" : "ASC",
              "dob" : null,
              "order_by" : "id",
              "patient_name" : val,
              "page" : 1
          }
        ).subscribe(
          (res: HttpSuccessResponse) => {
            this.data = res.result.data.docs;
            for (let i = 0; i < this.data.length; i++) {
              // this.data[i].dob = convertDateTimeForRetrieving(this.storageData, new Date(this.data[i].dob))
              // this.data[i].dob = this.data[i].dob.getMonth() + '-' + this.data[i].dob.getDate() + '-' + this.data[i].dob.getFullYear();

              /* we don't here  convertDateTimeForRetrieving that function because dob format is string from backend side.
               it's passing the timezone, if we implement this fucntion then we are facing dob issue   */

              this.data[i].dob = this.data[i].dob && this.data[i].dob.split('-');
              this.data[i].dob = this.data[i].dob[1] + '-' + this.data[i].dob[2] + '-' + this.data[i].dob[0];
              this.data[i].name = this.data[i].name + ' ' + this.data[i].dob
            }
            this.cdRef.detectChanges()
          }
        )
    }
  }

  onFocused(e) {
    // do something when input is focused
    let val = ""
    if (e.target.value === "") {
      val = "a"
    } else {
      val = e.target.value
    }
    this.requestService
      .sendRequest(
        DoctorCalendarUrlsEnum.getPatient,
        'POST',
        REQUEST_SERVERS.kios_api_path,
        {
          "case_id" : null,
           "per_page" : 50,
           "order" : "ASC",
            "dob" : null,
            "order_by" : "id",
            "patient_name" : val,
            "page" : 1
        }
      ).subscribe(
        (res: HttpSuccessResponse) => {
          this.data = res.result.data.docs;
          for (let i = 0; i < this.data.length; i++) {
            // this.data[i].dob = convertDateTimeForRetrieving(this.storageData, new Date(this.data[i].dob))
            // this.data[i].dob = this.data[i].dob.getMonth() + '-' + this.data[i].dob.getDate() + '-' + this.data[i].dob.getFullYear();

            /*Note:  we don't here  convertDateTimeForRetrieving that function because dob format is string from backend side.
               it's passing the timezone, if we implement this fucntion then we are facing dob issue   */

            this.data[i].dob = this.data[i].dob && this.data[i].dob.split('-');
            this.data[i].dob = this.data[i].dob[1] + '-' + this.data[i].dob[2] + '-' + this.data[i].dob[0];
            this.data[i].name = this.data[i].name + ' ' + this.data[i].dob
          }
          this.cdRef.detectChanges()
        }
      )
  }
  clearData(e) {
    this.chartStr = ""
    this.caseStr = ""
    this.patient = ""
    this.caseFormat = true;
    this.data = [];
    this.cdRef.detectChanges()
  }

  caseStr
  keywordChart = 'id';
  dataChart = [

  ];

  selectEventChart(item) {
    debugger;
    if (typeof item.id == 'string') {
      //item.id = parseInt(item.id)


      //Extracting chart no from Zero Formatted Chsrt No
      let formattedId = item.id;
      let actualId = "";
      let foundFirstDigit = false;
      for (let i = 0; i<item.id.length;i++){
        if (item.id[i]!="0" && item.id[i]!="-" && foundFirstDigit == false){
          actualId  += item.id[i];
          foundFirstDigit = true;
        }
        else if((item.id[i]=="0" && foundFirstDigit == true) || (item.id[i]!="0" && foundFirstDigit == true)){
          actualId  += item.id[i];
        }
      }
      item.id = parseInt(actualId);
      //
    }
    this.patientCheck.emit(item)
    // do something with selected item
    this.chartStr = item.chart_id
    this.chart = JSON.parse(item.id)
    this.caseFormat = false;
    this.requestService
      .sendRequest(
        DoctorCalendarUrlsEnum.getAllReturningCasesByPatient + JSON.stringify(this.chart),
        'GET',
        REQUEST_SERVERS.kios_api_path,
      ).subscribe(
        (res: any) => {
          for (let i = 0; i < res.result.data.length; i++) {
            res.result.data[i].accidentDate = convertDateTimeForRetrieving(this.storageData, new Date(res.result.data[i].accidentDate))
          }

          this.allCaseIds = res.result.data;
          this.caseIdModel = this.allCaseIds[0].case_id;
          this.caseTypeModal = this.allCaseIds[0].case_type;
          this.patient =  item.middle_name ? item.first_name + ' ' +item.middle_name  + ' ' + item.last_name + ' ' + this.allCaseIds[0].patient_dob : item.first_name   + ' ' + item.last_name + ' ' + this.allCaseIds[0].patient_dob

          this.cdRef.detectChanges()
        }
      )
  }

// onloadSelectedpatient(val)
// {
// 	this.onChangeSearchChart(val)
// 	this.selectEventChart()
// }

  onChangeSearchChart(val: string, byDefaultPatientSelected=false) {
    // fetch remote data from here
    // And reassign the 'data' which is binded to 'data' property.
    if (val !== "") {
      this.requestService
        .sendRequest(
          DoctorCalendarUrlsEnum.getPatientList + val,
          'GET',
          REQUEST_SERVERS.kios_api_path,
        ).subscribe(
          (res: any) => {
			  debugger;
            for (let i = 0; i < res.result.data.length; i++) {
              
              //Formatting Chart No..HHH
              var startString = "000-00-"
              var receivedString = JSON.stringify(res.result.data[i].id)
              var finalStr = startString + receivedString.padStart(4, "0");
              
              
              //console.log("RECV",receivedString,finalStr);
              res.result.data[i].id = finalStr;
              //
              //res.result.data[i].id = JSON.stringify(res.result.data[i].id)
            }
            this.dataChart = res.result.data;
			if(byDefaultPatientSelected)
			{
				this.chartStr=	this.dataChart[0].id;
				this.selectEventChart(this.dataChart[0])
			}
            this.cdRef.detectChanges()
          }
        )
    }
  }


  onFocusedChart(e) {
    // do something when input is focused

  }
  clearDataChart(e) {
    this.chartStr = ""
    this.patient = ""
    this.caseStr = ""
    this.caseFormat = true;
    this.dataChart = [];
    this.cdRef.detectChanges()
  }

  keywordCase = 'id';
  dataCase = [

  ];

  selectEventCase(item) {
    // do something with selected item
    this.caseIdModel = parseInt(item.id);

    this.requestService
      .sendRequest(
        DoctorCalendarUrlsEnum.getPatientsByCase + JSON.stringify(this.caseIdModel) + "&route=schduler_app_patient_details",
        'GET',
        REQUEST_SERVERS.kios_api_path,
      ).subscribe(
        (res: any) => {
          // var date = new Date(res.result.data.dob);
          // var newDob  = ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '/' + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())) + '/' + date.getFullYear();
          this.caseStr = `${res.result.data.id} (${res.result.data.case_type})`;
          let dob = res.result.data.dob && res.result.data.dob.split('-');
          dob = dob[1] + '-' + dob[2] + '-' + dob[0];
          this.patient = res.result.data.patient_middle_name ? res.result.data.patient_first_name + ' ' + res.result.data.patient_middle_name + ' ' + res.result.data.patient_last_name +' '+ dob : res.result.data.patient_first_name + ' ' + res.result.data.patient_last_name +' '+dob
          //this.chartStr = JSON.stringify(res.result.data.patient_id) ///hhh
          if (res.result.data.accident_date)
          {
            var date = new Date(res.result.data.accident_date);
            var newDob  = ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '/' + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())) + '/' + date.getFullYear();
            this.caseStr = `${this.caseStr} (${newDob})`
          }
          //Formatting Chart no
          var startString = "000-00-"
          var receivedString = JSON.stringify(res.result.data.patient_id)
          var finalStr = startString + receivedString.padStart(4, "0");
          this.chartStr = finalStr ///hhh
          //
          
          this.chart = res.result.data.patient_id
          this.patientCheck.emit({
            'id': res.result.data.patient_id,
            'middle_name': res.result.data.patient_middle_name,
            'first_name': res.result.data.patient_first_name,
            'last_name': res.result.data.patient_last_name,
            'case_type' : res.result.data.case_type,
            'dob' :res.result.data.dob,
            'accident_date' : res.result.data.accident_date
          })
        }
      )
  }

  onChangeSearchCase(val: string) {
    // fetch remote data from here
    // And reassign the 'data' which is binded to 'data' property.
    if (val !== "") {
      this.requestService
        .sendRequest(
          DoctorCalendarUrlsEnum.getCaseList + val,
          'GET',
          REQUEST_SERVERS.kios_api_path,
        ).pipe(map((res:any)=>{
			let data=res.result.data.docs;
			let dataCase=data.map((casedata) =>{
				 casedata.id=JSON.stringify(casedata.id)
				 return casedata
			})
			res.result.data.docs=dataCase
			return res;
		})).subscribe(
          (res: any) => {
			
            // for (let i = 0; i < res.result.data.docs.length; i++) {
            //   res.result.docs[i].id = JSON.stringify(res.result.docs[i].id)
            // }
            this.dataCase = res.result.data.docs;
            this.cdRef.detectChanges()
          }
        )
    }
  }

  onFocusedCase(e) {
    // do something when input is focused

  }
  clearDataCase(e) {
    this.chartStr = ""
    this.patient = ""
    this.caseStr = ""
    this.caseFormat = true;
    this.dataChart = [];
    this.cdRef.detectChanges()
  }

}
