import { Component, OnInit } from '@angular/core';
import { StorageData, HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { AddToBeSchedulledUrlsEnum } from '@appDir/scheduler-front-desk/modules/add-to-be-scheduled/add-to-be-scheduled-list-urls-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { AssignSpecialityUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-speciality/assign-speciality-urls-enum';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DoctorCalendarService } from '@appDir/shared/modules/doctor-calendar/doctor-calendar.service';
import { DoctorCalendarUrlsEnum } from '@appDir/shared/modules/doctor-calendar/doctor-calendar-urls-enum';
import {AppointmentSubjectService} from '../../subject.service'
import { Pagination } from '@appDir/shared/models/pagination';
import { convertDateTimeForRetrieving, convertDateTimeForSending } from '@appDir/shared/utils/utils.helpers';
@Component({
  selector: 'app-walk-in-not-seen-modal',
  templateUrl: './walk-in-not-seen.component.html',
  styleUrls: ['./walk-in-not-seen.component.scss']
})
export class WalkInNotSeenComponent implements OnInit {
  allClinicIds: any;
  myForm: FormGroup;
  speciality: any = [];
//   doctors: any = [{
//     'doctor': { 'first_name': "No Provider" },
//     'docId': 0
//   }];
doctors:any=[];
selectedSpecialty:any;
  selectSpName: any = 0;
  notes = ""
  date = new Date()
  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private storageData: StorageData,
    protected requestService: RequestService,
    public doctorCalendarService: DoctorCalendarService,
    public appService : AppointmentSubjectService
  ) {
  }
  ngOnInit() {
    this.myForm = this.formBuilder.group({
      notes: '',
      spHName: '',
      docName: '',
      note: ''
      //
    });
	this.bindonChangeSpecialty();
    if(this.doctorCalendarService.walkinNotSeen.patient_not_seen_reason){
      this.date=convertDateTimeForRetrieving(this.storageData,new Date(this.doctorCalendarService.walkinNotSeen.patient_not_seen_reason.date))
      this.notes=this.doctorCalendarService.walkinNotSeen.patient_not_seen_reason.notes
    }
    this.allClinicIds = this.storageData.getFacilityLocations()
    this.requestService
      .sendRequest(
        AddToBeSchedulledUrlsEnum.getproviderForUsers,
        'POST',
        REQUEST_SERVERS.schedulerApiUrl1,
        {
		  "facility_location_ids": this.allClinicIds,
		  "per_page": Pagination.per_page_Provider,
		  "page": 1,
      "user_timing_required": false,
		  pagination:true
        }
      ).subscribe(
        (response: HttpSuccessResponse) => {
          this.doctors = (response.result.data && response.result.data.docs)?response.result.data.docs:[];
        //   this.doctors.unshift({
        //     'doctor': { 'first_name': "No Provider" },
        //     'docId': 0
        //   })
        //   this.myForm.controls['docName'].setValue(0);
          if(this.doctorCalendarService.walkinNotSeen.patient_not_seen_reason && 
            this.doctorCalendarService.walkinNotSeen.patient_not_seen_reason.provider_id){
              this.myForm.controls['docName'].setValue(this.doctorCalendarService.walkinNotSeen.patient_not_seen_reason.provider_id);
          }
        });
    this.requestService
      .sendRequest(
		AssignSpecialityUrlsEnum.Speciality_list_Get,
        'GET',
        REQUEST_SERVERS.fd_api_url,
      ).subscribe(
        (response: HttpSuccessResponse) => {
          this.speciality = response.result && response.result.data ? response.result.data : [];
        //   this.speciality.splice(0,0,
        //     { 'name': "No Speciality",'id': 0 })
        //   this.myForm.controls['spHName'].setValue(this.speciality[0].id);
          
          if(this.doctorCalendarService.walkinNotSeen.patient_not_seen_reason){
            this.myForm.controls['spHName'].setValue(this.doctorCalendarService.walkinNotSeen.patient_not_seen_reason.speciality_id);
          }
        });
  }

  getProviderBySpeciality()
  {
	this.requestService
	.sendRequest(
	  AddToBeSchedulledUrlsEnum.getproviderForUsers,
	  'POST',
	  REQUEST_SERVERS.schedulerApiUrl1,
	  {
		"facility_location_ids": this.allClinicIds,
		"speciality_ids":[parseInt(this.myForm.get('spHName').value)],
		"per_page": Pagination.per_page_Provider,
		"page": 1,
    "user_timing_required": false,
		pagination:true
	  }
	).subscribe(
	  (response: HttpSuccessResponse) => {
		this.doctors = (response.result.data && response.result.data.docs)?response.result.data.docs:[];
	  //   this.doctors.unshift({
	  //     'doctor': { 'first_name': "No Provider" },
	  //     'docId': 0
	  //   })
	  //   this.myForm.controls['docName'].setValue(0);
		if(this.doctorCalendarService.walkinNotSeen.patient_not_seen_reason && 
		  this.doctorCalendarService.walkinNotSeen.patient_not_seen_reason.provider_id){
			this.myForm.controls['docName'].setValue(this.doctorCalendarService.walkinNotSeen.patient_not_seen_reason.provider_id);
		}
	  });
  }

  getSpecialityByProviders()
  {

  }
  addWalkInNotSeen() {
    var reqObj;
    var temp = this.myForm.controls['spHName'].value;
    if (temp)
    {
     reqObj = {
      'case_id': this.doctorCalendarService.walkinNotSeen.caseId,
      "status_id": this.doctorCalendarService.walkinNotSeen.notSeen,
      "walk_in_not_seen_reason": {
        "date": convertDateTimeForSending(this.storageData, this.date),
        "speciality_id": this.myForm.controls['spHName'].value,
        "notes": this.notes
      }
    }
  }
  else
  {
    reqObj = {
      'case_id': this.doctorCalendarService.walkinNotSeen.caseId,
      "status_id": this.doctorCalendarService.walkinNotSeen.notSeen,
      "walk_in_not_seen_reason": {
        "date": convertDateTimeForSending(this.storageData, this.date),
        "notes": this.notes
      }
    }
  }
    if(this.myForm.controls['docName'].value){
      reqObj["walk_in_not_seen_reason"]["provider_id"]= this.myForm.controls['docName'].value
    }
    this.requestService
    .sendRequest(
      DoctorCalendarUrlsEnum.change_status,
      'PUT',
      REQUEST_SERVERS.kios_api_path,
      reqObj
    ).subscribe(
      (response: any) => {
        this.appService.refresher.next(true);
        this.activeModal.close('done')
      });
  }

  bindonChangeSpecialty()
  {
	 this.myForm.get('spHName').valueChanges.subscribe(specialtyId=>{
		this.setSelectedSpecialty(specialtyId)
	 })
	
  }

  setSelectedSpecialty(specialtyId)
  {
	  
	  let selectedSpecialty=this.speciality.find(specialty=>specialty.id==specialtyId)
	  if(selectedSpecialty)
	  {

		this.selectedSpecialty=selectedSpecialty;
	

	  }
	  else
	  {
		this.selectedSpecialty=null
	  }
	  
  }
}
