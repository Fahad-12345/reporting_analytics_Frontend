import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-assign-doctor',
  templateUrl: './assign-doctor.component.html',
  styleUrls: ['./assign-doctor.component.scss'],

})
export class AssignDoctorComponent implements OnInit {

  constructor(private titleService: Title) {
    this.titleService.setTitle('Provider');
  }

  ngOnInit() {
  }

}
