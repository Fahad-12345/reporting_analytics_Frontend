import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-customize',
  templateUrl: './customize.component.html',
  styleUrls: ['./customize.component.scss']
})
export class CustomizeComponent implements OnInit {
  public options = {
    duration: 3000
  }
  constructor(public _router: Router ,) {}

  ngOnInit() {
  }
  public routeToLink(route){
    if(route == 'queue'){
      this._router.navigate(['/scheduler-front-desk/scheduling-queue'])
    }
    else if(route == 'waiting'){
      this._router.navigate(['/scheduler-front-desk/waiting-list'])
    }
    else if(route == 'customize'){
      this._router.navigate(['/scheduler-front-desk/customize'])
    }
  }

}
