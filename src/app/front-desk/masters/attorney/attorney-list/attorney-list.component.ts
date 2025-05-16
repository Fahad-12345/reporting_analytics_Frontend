import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FDServices } from 'app/front-desk/fd_shared/services/fd-services.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-attorney-list',
  templateUrl: './attorney-list.component.html',
  styleUrls: ['./attorney-list.component.scss']
})
export class AttorneyListComponent implements OnInit {

  constructor(private titleService: Title, private fd_services: FDServices, private route: ActivatedRoute) { }

  ngOnInit() {
    this.titleService.setTitle(this.route.snapshot.data['title']);
  }

}
