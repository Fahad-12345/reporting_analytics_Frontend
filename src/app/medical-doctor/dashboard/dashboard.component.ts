import { Component, OnInit } from '@angular/core';
import {MainService} from '@shared/services/main-service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(public mainService:MainService) { }

  ngOnInit() {
    this.mainService.resetPanelData();
  }

}
