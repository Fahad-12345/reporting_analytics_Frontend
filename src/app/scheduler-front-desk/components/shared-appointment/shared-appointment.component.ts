import { Component, OnInit } from '@angular/core';
import { AppointmentService } from '@shared/modules/appointment/appointment.service'
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-shared-appointment',
  templateUrl: './shared-appointment.component.html',
  styleUrls: ['./shared-appointment.component.scss']
})
export class SharedAppointmentComponent implements OnInit {
  public hideFilters: any;
  constructor(public appointmentService: AppointmentService, private titleService: Title,
    private _route: ActivatedRoute, ) { }

  ngOnInit() {
    this.titleService.setTitle('Appointment List');
    this.hideFilters = this.appointmentService.hideFilters;
  }

}
