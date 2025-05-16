import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SchedulerSupervisorService } from '../../../../scheduler-supervisor.service'
@Component({
  selector: 'app-doctor-description-modal',
  templateUrl: './doctor-description-modal.component.html',
  styleUrls: ['./doctor-description-modal.component.scss']
})
export class DoctorDescriptionModalComponent implements OnInit {
  public subject: any;
  public description: any;

  constructor(public _service: SchedulerSupervisorService, public activeModal: NgbActiveModal, ) { }
  ngOnInit() {
    this.subject = this._service.subject;
    this.description = this._service.description;

  }
}
