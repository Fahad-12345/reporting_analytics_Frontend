import { Component, OnInit } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import * as _ from "lodash";
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-erx',
  templateUrl: './erx.component.html',
  styleUrls: ['./erx.component.scss'],
  providers: [{ provide: APP_BASE_HREF, useValue: '/' }]
})
export class ErxComponent implements OnInit {
  public caseId;

  constructor(public router: Router, private route: ActivatedRoute,) { }

  ngOnInit() {
   
    this.route.snapshot.pathFromRoot.forEach(path => {
      if (path && path.params && path.params.caseId) {
          this.caseId = path.params.caseId;
      }
    })
  }
  isActive(route) {
    return this.router.url.includes(route)
  }
}
