import { Component, OnInit, Input, Output, EventEmitter, Injectable } from '@angular/core';
import { UnavialabilityComponent } from '../unavialability/unavialability.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CalendarMonthService } from '../calendar-month.service';
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
  constructor(public unavailabilityModal:NgbModal,
    public monthService:CalendarMonthService) { }

  ngOnInit() {
    // console.log(this.sDate);
  }

  public open(){
    
    this.monthService.startDate=this.sDate;
    this.monthService.eventsDay=this.eventsDay;
    const activeModal = this.unavailabilityModal.open(UnavialabilityComponent, {
      size:'lg', backdrop: 'static',
     keyboard: false
    });
    activeModal.result.then(() => {
      this.currentAssignments.emit("test")
    })


  }

}
