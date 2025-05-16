import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { RequestService } from '@appDir/shared/services/request.service';
import { StorageData, HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { AssignSpecialityUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-speciality/assign-speciality-urls-enum';
import {DoctorCalendarService} from '../../../../../../doctor-calendar.service'
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
@Component({
  selector: 'app-show-modal',
  templateUrl: './show-modal.component.html',
  styleUrls: ['./show-modal.component.scss']
})
export class ShowModalComponent implements OnInit {
  public allTrue = false;
  public data;
  public combined = [];
  public report;
  public checked = [];
  public numSelected = 0;
  public actionCheck  = false;
  constructor(
    public currentModal : NgbActiveModal,
    public docService : DoctorCalendarService,
    public requestService : RequestService,
    private storageData: StorageData
    ) { }

  ngOnInit() {
    this.getSpecialityFiles()
   
  }
  public boxChecker(row,event)
  {
    this.checked.forEach(
      (item) =>
      {
        if (item.id == row.id)
        {
          item.checked = event.target.checked;
          if(event.target.checked)
          {
            this.numSelected++;
          }
          else
          {
            this.numSelected--;
          }
        }
      }
    )
    if(this.numSelected == this.checked.length)
          {
            this.actionCheck = true
            this.allTrue = true
          }
          else
          {
            this.actionCheck = false
          }
  }
  public checkAll(event)
  { 
    if (event.target.checked)
    {
      this.numSelected = 0;
      this.checked.forEach((item) =>
      {
        item.checked = true;
        this.numSelected++;
      })
      this.allTrue = true
    }
    else{
      this.checked.forEach((item) =>
      {
        item.checked = false;
      })
      this.numSelected = 0;
      this.allTrue = false;
    }
  }
  public showMultiple()
  {
    if(this.numSelected > 1)
    {
      this.combined = [];
      this.checked.forEach( (item) =>
      {
        if (item.checked)
        {
          this.combined.push(item.id);
        }
      })
      this.MergeFiles(this.combined);
    }
    else
    {
      this.checked.forEach( (item) =>
      {
        if (item.checked)
        {
          this.openInWindow(item);
        }
      })
    }
  }
  public async MergeFiles(file)
  {
    await this.requestService
    .sendRequest(
      AssignSpecialityUrlsEnum.mergeFilesBulk,
      'POST',
      REQUEST_SERVERS.fd_api_url,
      {"fileIds": file}
    ).subscribe((res : any) =>
    {
      window.open(res?.data,"","channelmode = yes, width = 600, height = 1000")
    })
  }
  public async getSpecialityFiles()
  {
    await this.requestService
    .sendRequest(
      AssignSpecialityUrlsEnum.getSpecialityFiles+'?appointment_id='+this.docService.updateModalData.appointmentId,
      'GET',
      REQUEST_SERVERS.fd_api_url
    ).subscribe((res : any) =>
    {
      this.data = res.data;
      for(let i =0 ;i<this.data.length;i++)
      {
        this.checked.push({
          id : this.data[i].id,
          checked : false,
          link : this.data[i].pre_signed_url
        })
      }
    })
  }

  deleteFile(event)
  {

  }
  getLinkwithAuthToken(link) {
		let token = this.storageData.getToken()
		if (token) {
			return `${link}&token=${token}`
		}
		else { return link }
	}


	public openInWindow(url) {

		window.open((url.pre_signed_url),"","channelmode = yes, width = 600, height = 1000")
  }

 async openPatient(event)
  {
   let temp = event.link.split('api/')
    // window.open(event.link, "_blank");
    await this.requestService
    .sendRequest(
      temp[1],
      'GET',
      REQUEST_SERVERS.fd_api_url
    ).subscribe((res : any) =>
    {
      this.report = res;
      // console.log(this.report);
    })
  }

}
