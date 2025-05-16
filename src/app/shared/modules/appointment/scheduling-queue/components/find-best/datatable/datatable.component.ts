import { DatePipeFormatService } from './../../../../../../services/datePipe-format.service';
import { Component,  Input, OnInit } from '@angular/core';
import { SchedulingQueueService } from '../../../scheduling-queue.service';
import { SubjectService } from '../subject.service';
import { ToastrService } from 'ngx-toastr';
import { RequestService } from '@appDir/shared/services/request.service';
import { CancelAppointmentListUrlsEnum } from '@appDir/scheduler-front-desk/modules/cancel-appointment-list/cancel-appointmnet-list-urls-enum';
import { HttpSuccessResponse, StorageData } from '@appDir/pages/content-pages/login/user.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { AddToBeSchedulledUrlsEnum } from './../../../../../../../scheduler-front-desk/modules/add-to-be-scheduled/add-to-be-scheduled-list-urls-enum';
import { AppointmentUrlsEnum } from '../../../../appointment-urls-enum';
import { convertDateTimeForSending } from '@appDir/shared/utils/utils.helpers';

@Component({
  selector: 'app-datatable',
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.css']
})
export class DatatableComponent implements OnInit {
  public currentDateTime = new Date()
  public temp: any = [{ 'date': '', 'time': '', 'doctor': '', 'clinic': '', 'speciality': '' }];
  public date: Date;
  public deleteAll: any;
  public counter = 10;
  public singleSelection: any = [];
  @Input() data: any;
  public check: any;
  public totalRows: any;
  constructor(protected requestService: RequestService, private storageData: StorageData,
	public datePipeService:DatePipeFormatService,
    private toastrService: ToastrService, public schedulingQueueService: SchedulingQueueService, public Subject: SubjectService, 
    )
     {
    this.date = new Date();
  }
  ngOnInit() {
    this.totalRows = this.counter;
    this.Subject.cast.subscribe(res => {
      this.check = res;
    })
  }

  Save(data) {
    let postObj = [];
    var caseId = data.case_id;
    var chartNo = data.patient_id;
    let obj = {
    //   "appointment": (JSON.parse(JSON.stringify(data)))
	"appointment": {...data}
    }
    if (obj['appointment'].comments == null) {
      obj['appointment'].comments = 'N/A';
    }
    let timeZone = this.storageData.getUserTimeZoneOffset();

    delete obj['appointment'].clinicName;
    delete obj['appointment'].appointmentStatus;
    delete obj['appointment'].createdAt;
    delete obj['appointment'].docAssignId;
    delete obj['appointment'].docName;
    delete obj['appointment'].evaluationStart;
    delete obj['appointment'].isChecked;
    delete obj['appointment'].recId;
    delete obj['appointment'].showUpStatus;
    delete obj['appointment'].specAssignId;
    delete obj['appointment'].specName;
	delete obj['appointment'].visitId;
	delete obj['appointment'].doctor_basic_information;
	delete obj['appointment'].facility_location_detail;
    obj['timeZone'] = timeZone;
    postObj.push(obj)
    if (postObj[0]['appointment'].appointmentTitle == undefined ||
      postObj[0]['appointment'].appointmentTitle == null ||
      postObj[0]['appointment'].appointmentTitle == '') {
      postObj[0]['appointment'].appointmentTitle = 'N/A'
    }
    if (postObj[0]['appointment'].comments == null) {
      postObj[0]['appointment'].comments = 'N/A';
    }
    let st = new Date(this.currentDateTime)
    st.setMinutes(0)
    st.setHours(0)
    st.setSeconds(0)
    st.setMilliseconds(0)

    let convertedStDate = convertDateTimeForSending(this.storageData, new Date(st))

    var yearSt = convertedStDate.getFullYear();
    var monthSt = convertedStDate.getMonth() + 1;
    var datetSt = convertedStDate.getDate();

    var monthStString = ""
    var datetStString = ""

    if (datetSt < 10) {
      datetStString = '0' + datetSt;
    }
    else {
      datetStString = datetSt.toString();
    }
    if (monthSt < 10) {
      monthStString = '0' + monthSt;
    }
    else {
      monthStString = monthSt.toString();
    }
    let formattedSt = yearSt + '-' + monthStString + '-' + datetStString;
    // First we make a request to the checked-in-patient route
    var reqObj = {
      "case_ids": [],
      "current_date": formattedSt
    }
    var truth_check = false;
	var id;
	let paramsAppointment = {
		case_id: caseId,
		// case_type: postObj[0]['appointment'].case_type.name,
		case_type_id: data.case_type_id,
		comments:  postObj[0]['appointment'].comments,
		confirmation_status: false,
		doctor_id: postObj[0]['appointment'].doctor_id,
		facility_location_id: postObj[0]['appointment'].facility_location_id ,
		patient_id: chartNo,
		priority_id: postObj[0]['appointment'].priority_id ,
		speciality_id:postObj[0]['appointment'].speciality_id,
		start_date_time: convertDateTimeForSending(this.storageData ,new Date(postObj[0]['appointment'].start_date_time)),
		// time_slot: 30,
		user_id: this.storageData.getUserId(),
		appointment_type_id:data.appointment_type_id?Number(data.appointment_type_id):null,
		is_speciality_base:data.doctor_id?false:true,
		time_zone: this.storageData.getUserTimeZoneOffset(),
		physician_id:data.physician_id?data.physician_id:null,
		cpt_codes:data.cpt_codes_ids?data.cpt_codes_ids:null,
		is_transportation:data.is_transportation,
		transportation:data.transportation?data.transportation:null

	
		
	}

    this.requestService
    .sendRequest(
      AppointmentUrlsEnum.getAppointmentListWL,
					'POST',
					REQUEST_SERVERS.kios_api_path,
					reqObj
    ).subscribe(
      (res:HttpSuccessResponse) =>
      {
        let data = res.result.data.checked_in_patients;
        for(let i =0;i<data.length;i++)
        {
          if(data[i]['case_id'] == caseId && data[i]['patient_id'] == chartNo)
          {
            truth_check = true;
            id = data[i]['id'];
            if(truth_check)
            {
              // const scheduler = this.storageData.getSchedulerInfo();
              // let jsonToDelId = JSON.parse(scheduler.toDelAppIdWL)
              const object = { 'ids': [id] }
              this.requestService
              .sendRequest(
                AppointmentUrlsEnum.remove_patient_status,
                'PUT',
                REQUEST_SERVERS.kios_api_path,
                object
              ).subscribe(
                (response : any) =>
                {
                }
              )
            }
            break;
          }
        }
      }
    )
    
    this.requestService
      .sendRequest(
		CancelAppointmentListUrlsEnum.addAppointmentV1,
        'POST',
        REQUEST_SERVERS.schedulerApiUrl1,
		paramsAppointment
      ).subscribe(
        (res: HttpSuccessResponse) => {
			this.toastrService.success('Successfully Added', 'Success');
			this.Subject.Changed.next(true);
			this.check = false;
                //Delete Appoinment from Schedule List//hhh
                const scheduler = this.storageData.getSchedulerInfo();
               
                
                if(scheduler.toDelCheck){
                  let jsonToDelId = JSON.parse(scheduler.toDelAppId)
                  //delete Apt from Schedule list
                  this.requestService
                    .sendRequest(
                      AddToBeSchedulledUrlsEnum.deleteAppointment,
                      'delete_with_body',
                      REQUEST_SERVERS.schedulerApiUrl1,
                      {
                        "appointment_ids": [jsonToDelId.id]
                      }
                    ).subscribe(
                      (res: HttpSuccessResponse) => {
                        //this.toastrService.success('Apt Deleted From Schedule List', 'Success')
                        scheduler.toDelCheck = false
                        this.storageData.setSchedulerInfo(scheduler);

                      },err=>{
						this.toastrService.error(err.error.message, 'Error');

					  })
                }
                //

                //Delete Waiting List Entry
				this.deleteWaitingListEntry(scheduler);
				
        //   if (!res.result.data[0]['message']) {

        //     for (var i = 0; i < this.data.length; i++) {
        //       if (res.result.data[0]['appointments'][0].count == this.data[i].count) {
        //         this.data.splice(i, 1);
        //         i = i - 1
        //         this.toastrService.success('Successfully Added', 'Success');
        //         this.Subject.Changed.next(true);
        //         this.check = false;
        //         //Delete Appoinment from Schedule List//hhh
        //         const scheduler = this.storageData.getSchedulerInfo();
               
                
        //         if(scheduler.toDelCheck){
        //           let jsonToDelId = JSON.parse(scheduler.toDelAppId)
        //           console.log("Scheduled Deleted",jsonToDelId.id, scheduler.toDelCheck);
        //           //delete Apt from Schedule list
        //           this.requestService
        //             .sendRequest(
        //               AddToBeSchedulledUrlsEnum.deleteAppointment,
        //               'delete_with_body',
        //               REQUEST_SERVERS.schedulerApiUrl1,
        //               {
        //                 "appointment_ids": [jsonToDelId.id]
        //               }
        //             ).subscribe(
        //               (res: HttpSuccessResponse) => {
        //                 //this.toastrService.success('Apt Deleted From Schedule List', 'Success')
        //                 console.log("Apt Deleted From Schedule List")
        //                 scheduler.toDelCheck = false
        //                 this.storageData.setSchedulerInfo(scheduler);

        //               },err=>{
		// 				this.toastrService.error(err.error.message, 'Error');

		// 			  })
        //         }
        //         //

        //         //Delete Waiting List Entry
        //         this.deleteWaitingListEntry(scheduler);
        //         //
        //         break;
        //       }
        //     }
        //   } else if (res.result.data[0]['message'] === 'Patient already has appointment at this time!') {
        //     this.coolDialogs.confirm(res.result.data[0]['message'] + '.Are you sure you want to add.')
        //       .subscribe(resp => {
        //         if (resp) {
        //           postObj[0]['appointment']['confirm'] = true;
        //           this.requestService
        //             .sendRequest(
        //               CancelAppointmentListUrlsEnum.addAppointment,
        //               'POST',
        //               REQUEST_SERVERS.schedulerApiUrl1,
		// 			  paramsAppointment
        //             ).subscribe(
        //               (respp: HttpSuccessResponse) => {
        //                 if (!respp.result.data[0]['message']) {
        //                   for (var i = 0; i < this.data.length; i++) {
        //                     if (respp.result.data[0]['appointments'][0].count == this.data[i].count) {
        //                       this.data.splice(i, 1);
        //                       i = i - 1
        //                       this.toastrService.success('Successfully Added', 'Success');
        //                       this.Subject.Changed.next(true);
        //                       this.check = false;
        //                       break;
        //                     }
        //                   }
        //                 } else if (respp.result.data[0]['message']) {
        //                   this.toastrService.error(res.result.data[0]['message'], 'Error')
        //                 }
        //               });
        //         }
        //         else {
        //           return;
        //         }
        //       });
        //   } else if (res.result.data[0]['message']) {
        //     this.toastrService.error(res.result.data[0]['message'], 'Error')
        //   }
        }, err => {
			if(err.Status==500)
			{
			this.toastrService.error(err.error.message, 'Error');

			}
        });
  }
  public checkRows(e) {
    this.counter = e;
  }

  //Delete Waiting List Entry Once Apt is made for Checked in Patient
  public deleteWaitingListEntry(scheduler){
    if(scheduler.toDelCheckWL){
      let jsonToDelId = JSON.parse(scheduler.toDelAppIdWL)
      //delete Apt from Waiting list
      const object = { 'ids': [jsonToDelId.id] }
					this.requestService
						.sendRequest(
							AppointmentUrlsEnum.remove_patient_status,
							'PUT',
							REQUEST_SERVERS.kios_api_path,
							object
						).subscribe(
							(response: any) => {
								//this.toastrService.success(response.result.data, 'Success')
                scheduler.toDelCheckWL = false
                this.storageData.setSchedulerInfo(scheduler);
    
							})

    }
  }

  //
}
