import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-scheduler-front-desk',
  templateUrl: './scheduler-front-desk.component.html',
  styleUrls: ['./scheduler-front-desk.component.scss']
})
export class SchedulerFrontDeskComponent implements OnInit {
  public options = {
    duration: 3000
  }
  constructor(public _router: Router) { }

  ngOnInit() {
  }


}
