import { DatePipeFormatService } from './../../../../../services/datePipe-format.service';
import { AppointmentUrlsEnum } from '@appDir/shared/modules/appointment/appointment-urls-enum';
import { FacilityUrlsEnum } from './../../../../../../front-desk/masters/practice/practice/utils/facility-urls-enum';
import { Component, OnInit } from '@angular/core';
// service
import { SchedulingQueueService } from '../../scheduling-queue.service'
// modals
import {  NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { StorageData, HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { DoctorCalendarUrlsEnum } from '@appDir/shared/modules/doctor-calendar/doctor-calendar-urls-enum';
import { AssignSpecialityUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-speciality/assign-speciality-urls-enum';
import {AclServiceCustom} from '../../../../../../acl-custom.service'
import { Pagination } from '@appDir/shared/models/pagination';
import { Page } from '@appDir/front-desk/models/page';
import { AddToBeSchedulledUrlsEnum } from '@appDir/scheduler-front-desk/modules/add-to-be-scheduled/add-to-be-scheduled-list-urls-enum';
import { changeDateFormat, ConvertToISOWithoutChangingDateTime, removeEmptyAndNullsFormObject } from '@appDir/shared/utils/utils.helpers';
@Component({
  selector: 'app-visit-history',
  templateUrl: './visit-history.component.html',
  styleUrls: ['./visit-history.component.scss']
})
export class VisitHistoryComponent implements OnInit {
public allClinics = []
public allSpeciality = []
  //App Type/Status Filter
  public allAppStatus :any[] = [];
  public appStatusFilter: any;
  public nameOfPatient: any;
  public data = []
  public date: any;
  public endDate: any;
  public data1 = []
  public clinicFilter: any;
  public specFilter: any;
  public visitStatusFilter:any;
  public isCancelledAppoint:boolean=false;
  public allClinicIds = [];
  public patientId: any;
  public caseId : any;
  public page:Page=new Page();
  public visitStatus = []
  selectedPracticLocation: string;
  selectedSpecialityName: string;
  vistStatusAllowedSlugs = [
	're_scheduled', 'scheduled','no_show','checked_in', 'checked_out' ,'in_session' 
  ];
  appointmentStatusAllowedSlugs = [
	're_scheduled', 'scheduled','arrived','completed','no_show'
  ];
  allowedAppointmentStatus:any[] =[];
  allowedVisitStatus:any[] =[];

  constructor(
    public schedulingService: SchedulingQueueService,
    public storageData: StorageData,
    public activeModal: NgbActiveModal, private toastrService: ToastrService,
    protected requestService: RequestService,
    public aclCustom : AclServiceCustom,
	public datePipeService:DatePipeFormatService
  ) {
	  this.page.pageNumber=0;
	  this.page.size=10;
    // this.date = new Date();
    // this.endDate = new Date()
    // this.date.setHours(0);
    // this.date.setMinutes(0);
    // this.date.setSeconds(0);
    // this.endDate.setHours(23);
    // this.endDate.setMinutes(59);
    // this.endDate.setSeconds(0);
    this.nameOfPatient = this.schedulingService.nameOfPatient
    this.patientId = this.schedulingService.visitHistoryChartNo;
    this.caseId = this.schedulingService.caseId;
    this.allClinicIds = this.storageData.getFacilityLocations()
  }
   ngOnInit() {

	this.getAppointmentStatus();
	this.getVisitStatus();

     this.requestService
      .sendRequest(
		FacilityUrlsEnum.Facility_list_dropdown_GET   ,  'GET',
        REQUEST_SERVERS.fd_api_url,
      ).subscribe(
        (response: HttpSuccessResponse) => {
		  this.allClinics = response.result.data;

		//   if (this.allClinics.length!=0){
		//   this.clinicFilter = this.allClinics[0].id;
		//   }

		});
     this.requestService
      .sendRequest(
		AssignSpecialityUrlsEnum.GetUserInfoBySpecialities,
        'post',
		REQUEST_SERVERS.schedulerApiUrl1,
		{
			per_page: Pagination.per_page,
			page:1,
			pagination:true
		}
      ).subscribe(
        (response: HttpSuccessResponse) => {
            this.allSpeciality = [...response.result.data.docs];
		//   if (this.allSpeciality.length!=0){
		//   this.specFilter = this.allSpeciality[0].id
		//   }
        })

	//Default value for Status filter 

	this.getPatientCaseHistory({offset:this.page.pageNumber});
  }

  sortData(data) {
    return data.sort((a, b) => {
    //   return <any>new Date(b.CREATE_TS) - <any>new Date(a.CREATE_TS);
	  return b.scheduled_date_time - a.scheduled_date_time;
    });
  }

  getAppointmentStatus(){
	this.requestService
    .sendRequest(
      AppointmentUrlsEnum.getAppointmentStatus,
      'GET',
      REQUEST_SERVERS.schedulerApiUrl1,
    ).subscribe(
      (response: HttpSuccessResponse) => {
		this.allAppStatus = [...response.result.data];
		this.allAppStatus.forEach((appoitnmentStatus:any) => {
			if (this.appointmentStatusAllowedSlugs.includes(appoitnmentStatus.slug)){
				this.allowedAppointmentStatus.push(appoitnmentStatus);
			}	
		});
		this.allowedAppointmentStatus = [...this.allowedAppointmentStatus];
	  });
  }

    public resetFilter()
    {
      this.clinicFilter = null
      this.specFilter =  null
      this.date = null;
	  this.endDate=null;
      this.appStatusFilter = null;
	  this.visitStatusFilter=null;
	  this.isCancelledAppoint=false;
	  this.page.pageNumber=0;
	  this.page.size=10;
	  this.getPatientCaseHistory({offset: this.page.pageNumber})
    }

  public applyFilter() {
	  this.page.pageNumber=0;
	//   this.data=[];
	//   this.page.totalElements=0;
	this.getPatientCaseHistory({offset:this.page.pageNumber});
  }

  public changeDate() {
	  if(this.date)
	  {
		this.endDate = new Date(this.date)
		this.endDate.setHours(23);
		this.endDate.setMinutes(59);
		this.endDate.setSeconds(0);
	  }
	  else
	  {
		this.endDate=null;  
	  }
	this.getPatientCaseHistory({offset:this.page.pageNumber})
  }

  public onChangeDate(event)
	{
		if(event.dateValue)
		{
		  this.date=new Date(event.dateValue);
		  
		  this.changeDate();
		} 
		else
		{
			this.date=null;
			this.changeDate();
			
		}
	}


  public changeNoOfEntries(e) {
	this.page.size=+e;
	this.page.pageNumber=0;
	this.getPatientCaseHistory({offset:this.page.pageNumber})
  }

  getPatientCaseHistory(pageInfo)
  {
	  debugger;
	this.page.pageNumber = pageInfo.offset;
	const PageNumber = this.page.pageNumber + 1;
	let  reqObj = {
		//   'patientId': this.patientId,
		//   'startDate': convertDateTimeForSending(this.storageData, this.date),
		//   'endDate': convertDateTimeForSending(this.storageData, this.endDate)
		// "start_date": convertDateTimeForSending(this.storageData, this.date),
		// "end_date": convertDateTimeForSending(this.storageData, this.endDate),
		"facility_location_ids":this.clinicFilter?  [+this.clinicFilter]:null,
		"speciality_ids":this.specFilter?  [+this.specFilter]:null,
		"appointment_status_ids":this.appStatusFilter?  [+this.appStatusFilter]:null,
		"patient_status_ids":this.visitStatusFilter?  [+this.visitStatusFilter]:null,
		"is_cancelled_appointments":this.isCancelledAppoint,
		"start_date":this.date? (ConvertToISOWithoutChangingDateTime(this.storageData, this.date)):null,
		"end_date": this.endDate?(ConvertToISOWithoutChangingDateTime(this.storageData, this.endDate)):null,
		"patient_ids":this.patientId?[+this.patientId]:null,
		'case_ids':this.caseId?[+this.caseId]:null,
		
		}
		let params = {
		 filters: removeEmptyAndNullsFormObject(reqObj),
		'paginate':true,
		'page':+PageNumber,
		'per_page':+this.page.size,
		appointment_type  :'PATIENT',
		}
		 this.requestService
		  .sendRequest(
			AppointmentUrlsEnum.getAppointmentAllDetailsList,
			'POST',
			REQUEST_SERVERS.schedulerApiUrl1,
			params
		  ).subscribe(
			(response: HttpSuccessResponse) => {
		this.page.totalElements=response.result.data?response.result.data.total:0;
        this.data=response.result.data?response.result.data.docs:[];
			});
	  }

	  public getVisitStatus() {

		this.requestService
			.sendRequest(
				AddToBeSchedulledUrlsEnum.GetAllStatus,
				'GET',
				REQUEST_SERVERS.kios_api_path
			).subscribe(
				(res: HttpSuccessResponse) => {
					this.visitStatus = res.result.data;
					this.visitStatus.forEach((visitStatus:any) => {
						if (this.vistStatusAllowedSlugs.includes(visitStatus.slug)){
							this.allowedVisitStatus.push(visitStatus);
						}	
					});
					this.allowedVisitStatus = [...this.allowedVisitStatus];
				})
		}

	  public changePage(e) {
	
		this.page.pageNumber= e.offset;
		this.getPatientCaseHistory({offset:this.page.pageNumber});
		
	}
	changePracticeLocation(e){	
	if(e){
		const spec = this.allClinics.find(d => d['id'] === Number(e.target.value));
		this.selectedPracticLocation = `${spec.facility.name}-${spec.name}`;
		}
	}

	changeSpeciality(e){	
		if(e){
			const spec = this.allSpeciality.find(d => d['id'] === Number(e.target.value));
			this.selectedSpecialityName = `${spec.name}`;
			}
	}
}
  


