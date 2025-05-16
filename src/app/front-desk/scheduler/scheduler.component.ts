import { Component, OnInit } from '@angular/core';
import { MainService } from '@shared/services/main-service';
import { Title } from '@angular/platform-browser';
import { FRONT_DESK_LINKS } from '../models/leftPanel/leftPanel';
import { ActivatedRoute } from '@angular/router';
import { AppointmentSubjectService } from '@shared/modules/appointment/subject.service'
import { AppointmentService } from '@shared/modules/appointment/appointment.service';
import { SchedulingQueueService } from '@shared/modules/appointment/scheduling-queue/scheduling-queue.service';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { PermissionComponent } from '../permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';

@Component({
  selector: 'app-scheduler',
  templateUrl: './scheduler.component.html',
  styleUrls: ['./scheduler.component.scss']
})
export class SchedulerComponent extends PermissionComponent implements OnInit {
  public hidefilters: any;
  public patientScheduler = false;
  public scheduler: any;
  public patientLastName: any;
  public localStorageId: any;
  public patientFirstName: any;
  constructor(public subjectService: AppointmentSubjectService,
    public appointmentService: AppointmentService,
    public schedulingQueueService: SchedulingQueueService,
    private mainService: MainService,
    titleService: Title,
    private storageData: StorageData,
    aclService: AclService,
    private route: ActivatedRoute) {
    super(aclService);
    this.localStorageId = this.storageData.getUserId()
    this.subjectService.castPatient.subscribe(res => {
      if (res == 'false') {
        this.patientScheduler = false;
        this.scheduler = true;
      }
      titleService.setTitle(this.route.snapshot.data['title']);
    })
    this.subjectService.castScheduler.subscribe(res => {
    })
    let patient = JSON.parse(window.localStorage.getItem('patientData' + this.localStorageId))

  }

  ngOnInit() {


    this.subjectService.castLahore.subscribe(
      res => {
        if (res == false) {
          alert(res)
        }
      }
    )
    this.mainService.setLeftPanel(FRONT_DESK_LINKS);
    // this.titleService.setTitle(this.route.snapshot.data["title"])
    this.scheduler = true;

  }

  public Schedule() {
    this.patientScheduler = false;
    this.scheduler = true;
  }
  public Appointment() {
    this.patientScheduler = true;
    this.scheduler = false;
  }

}
