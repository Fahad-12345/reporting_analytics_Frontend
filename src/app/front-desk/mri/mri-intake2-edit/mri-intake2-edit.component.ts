import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { MainService } from '@shared/services/main-service';
import { Logger } from '@nsalaun/ng-logger';
import { ActivatedRoute } from '@angular/router';
import { FRONT_DESK_LINKS } from 'app/front-desk/models/leftPanel/leftPanel';
import { FDServices } from 'app/front-desk/fd_shared/services/fd-services.service';
import { LocalStorage } from '@shared/libs/localstorage';

@Component({
  selector: 'app-mri-intake2-edit',
  templateUrl: './mri-intake2-edit.component.html',
})
export class MriIntake2EditComponent implements OnInit {

  public title: string;
  public caseData: any;
  public caseId: number;

  constructor(private titleService: Title, private mainService: MainService, private fd_services: FDServices, private localStorage: LocalStorage, private logger: Logger, private route: ActivatedRoute) {
    this.caseId = +this.localStorage.get('caseId');
    this.fd_services.currentCase.subscribe(c => this.caseData = c)
  }

  ngOnInit() {
    this.mainService.setLeftPanel(FRONT_DESK_LINKS)
    this.titleService.setTitle(this.route.snapshot.data["title"]);
    this.title = "Edit " + this.route.snapshot.data["title"]
    this.getCase()
  }

  getCase() {
    this.fd_services.getCaseDetail(this.caseId).subscribe(res => {
      this.fd_services.setCase(res.data.case)
      this.caseData = res.data.case
    })
  }

}
