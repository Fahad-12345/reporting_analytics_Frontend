import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-scheduling-queue',
  templateUrl: './scheduling-queue.component.html',
  styleUrls: ['./scheduling-queue.component.scss']
})
export class SchedulingQueueComponent implements OnInit {

  constructor(public _router: Router) { }

  ngOnInit() {
  }

}
