import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { MainService } from '@shared/services/main-service';
import { Logger } from '@nsalaun/ng-logger';
import { ActivatedRoute } from '@angular/router';
import { LocalStorage } from '@shared/libs/localstorage';
import { FDServices } from 'app/front-desk/fd_shared/services/fd-services.service';
import { FRONT_DESK_LINKS } from 'app/front-desk/models/leftPanel/leftPanel';

@Component({
  selector: 'app-referr-edit',
  templateUrl: './referr-edit.component.html',
  styleUrls: ['./referr-edit.component.scss']
})
export class ReferrEditComponent implements OnInit {

  public title: string;
  public caseData: any;
  public caseId: number;
  public referralData: any
  public advertisementData: any

  constructor(private titleService: Title, private mainService: MainService, private logger: Logger, private route: ActivatedRoute, private localStorate: LocalStorage,
    private fd_services: FDServices) {
    this.caseId = +this.localStorate.get('caseId')
    this.fd_services.currentCase.subscribe(c => this.caseData = c)
  }

  ngOnInit() {
    this.mainService.setLeftPanel(FRONT_DESK_LINKS)
    this.titleService.setTitle(this.route.snapshot.data["title"]);
    this.title = "Edit " + this.route.snapshot.data["title"]

    if (this.fd_services.isEmpty(this.caseData)) {
      this.getCase()
    } else {
      this.assignValues()
    }
  }

  getCase() {
    this.fd_services.getCaseDetail(this.caseId).subscribe(res => {
      if (res.statusCode == 200) {
        this.fd_services.setCase(res.data.case)
        this.assignValues()
      }
    })
  }

  assignValues() {
    // ;
    this.referralData = this.caseData.refferedBies
    this.advertisementData = this.caseData.advertisements
  }

}
