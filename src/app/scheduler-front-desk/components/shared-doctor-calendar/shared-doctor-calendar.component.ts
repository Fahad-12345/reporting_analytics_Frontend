import { Component, OnInit } from '@angular/core';

//
import { DoctorCalendarService } from '@shared/modules/doctor-calendar/doctor-calendar.service';
//
@Component({
  selector: 'app-shared-doctor-calendar',
  templateUrl: './shared-doctor-calendar.component.html',
  styleUrls: ['./shared-doctor-calendar.component.scss']
})
export class SharedDoctorCalendarComponent implements OnInit {
  //constructor() { }

  //
  constructor(public DoctorCalendarService: DoctorCalendarService) {
    this.DoctorCalendarService.PatientSchedulingCalendar = false;
  }
  //
  ngOnInit() {
  }

}
