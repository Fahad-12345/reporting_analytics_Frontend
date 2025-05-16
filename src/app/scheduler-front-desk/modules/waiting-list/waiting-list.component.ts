import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-waiting-list',
  templateUrl: './waiting-list.component.html',
  styleUrls: ['./waiting-list.component.scss']
})
export class WaitingListComponent implements OnInit {
  public options = {
    duration: 3000
  }
  constructor(public _router: Router, private titleService: Title,
    private _route: ActivatedRoute, ) { }

  ngOnInit() {
    this.titleService.setTitle('Waiting List');
  }
  public routeToLink(route) {
    if (route == 'queue') {
      this._router.navigate(['/scheduler-front-desk/scheduling-queue'])
    }
    else if (route == 'waiting') {
      this._router.navigate(['/scheduler-front-desk/waiting-list'])
    }
    else if (route == 'customize') {
      this._router.navigate(['/scheduler-front-desk/customize'])
    }
  }
}
