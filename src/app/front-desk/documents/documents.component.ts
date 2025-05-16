import { Component, OnInit } from '@angular/core';
import { MainService } from '@shared/services/main-service';
import { Title } from '@angular/platform-browser';
import { FRONT_DESK_LINKS } from '../models/leftPanel/leftPanel';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
})
export class DocumentsComponent implements OnInit {

  constructor(private mainService: MainService, private titleService: Title, private route: ActivatedRoute) { }

  ngOnInit() {
    this.mainService.setLeftPanel(FRONT_DESK_LINKS);
    this.titleService.setTitle(this.route.snapshot.data["title"])

  }

}
