import { Component, OnInit, Input, Output, EventEmitter, Injectable } from '@angular/core';
import { UnavialabilityComponent } from '../unavialability/unavialability.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CalendarWeekService } from '../calendar-week.service';
@Component({
  selector: 'app-open-add-modal',
  templateUrl: './open-add-modal.component.html',
  styleUrls: ['./open-add-modal.component.scss']
})
export class OpenAddModalComponent implements OnInit {

  @Output() currentAssignments = new EventEmitter;
  @Input() spec: any;
  @Input() clinic: any;
  @Input() date: any;
  @Input() sDate: Date;
  @Input() eventsDay
  @Input() sDateventsDaye: Date;
  constructor(public unavailabilityModal: NgbModal,
    public weekService: CalendarWeekService) { }

  ngOnInit() {
    // console.log(this.sDate);
  }

  public open() {
    console.log(this.sDate);

    this.weekService.startDate = this.sDate;
    this.weekService.eventsDay = this.eventsDay;
    const activeModal = this.unavailabilityModal.open(UnavialabilityComponent, {
      size: 'lg', backdrop: 'static',
      keyboard: false
    });
    activeModal.result.then(() => {
      console.log("testing")
      this.currentAssignments.emit("test")
    })


  }

}
