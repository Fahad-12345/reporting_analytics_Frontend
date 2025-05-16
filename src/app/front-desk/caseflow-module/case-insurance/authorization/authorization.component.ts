import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-authorization',
  templateUrl: './authorization.component.html',
  styleUrls: ['./authorization.component.scss']
})
export class AuthorizationComponent implements OnInit {

  constructor(private titleService: Title,
    private _route: ActivatedRoute, ) { }

  ngOnInit() {
    this.titleService.setTitle(this._route.snapshot.data['title']);
  }

}
