import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-supervisor-notifications',
  templateUrl: './supervisor-notifications.component.html',
  styleUrls: ['./supervisor-notifications.component.scss']
})
export class SupervisorNotificationsComponent implements OnInit {
  constructor(private titleService: Title) {
    this.titleService.setTitle('Notifications');
  }

  ngOnInit() {
    // alert("juni lul 2")

  }

}
