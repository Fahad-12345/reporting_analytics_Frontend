import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { MainService } from '@shared/services/main-service';
import { Logger } from '@nsalaun/ng-logger';
import { ActivatedRoute } from '@angular/router';
import { FRONT_DESK_LINKS } from 'app/front-desk/models/leftPanel/leftPanel';
import { LocalStorage } from '@shared/libs/localstorage';
import { FDServices } from 'app/front-desk/fd_shared/services/fd-services.service';

@Component({
  selector: 'app-mri-intake1-edit',
  templateUrl: './mri-intake1-edit.component.html',
})
export class MriIntake1EditComponent implements OnInit {

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

    if(this.fd_services.isEmpty(this.caseData)) {
      this.getCase()
    }
  }

  getCase() {
    this.fd_services.getCaseDetail(this.caseId).subscribe(res => {
      this.fd_services.setCase(res.data.case)
      this.caseData = res.data.case
    })
  }

}
