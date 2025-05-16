import { Component, OnInit } from '@angular/core';
import { MainService } from '@shared/services/main-service';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { FRONT_DESK_LINKS } from 'app/front-desk/models/leftPanel/leftPanel';
import { LocalStorage } from '@shared/libs/localstorage';
import { FDServices } from 'app/front-desk/fd_shared/services/fd-services.service';

@Component({
  selector: 'app-accident-edit',
  templateUrl: './accident-edit.component.html',
})
export class AccidentEditComponent implements OnInit {

  public title: string = "Edit"
  public caseId: number;
  public caseData: any;
  public accident: any = {}
  public patientId: number;

  constructor(private mainService: MainService, private titleService: Title, private route: ActivatedRoute, private localStorage: LocalStorage, private fd_services: FDServices) {
      this.fd_services.currentCase.subscribe(c => this.caseData = c)
      this.caseId = +this.localStorage.get('caseId')
   }

  ngOnInit() {
    this.mainService.setLeftPanel(FRONT_DESK_LINKS)
    this.titleService.setTitle(this.route.snapshot.data['title'])
    this.title = this.route.snapshot.data['title']

    if(this.fd_services.isEmpty(this.caseData)) {
      this.getCase()
    } else {
      this.asignValues()
    }
  }

  getCase() {
    this.fd_services.getCaseDetail(this.caseId).subscribe(res => {
      if(res.statusCode == 200) {
        this.fd_services.setCase(res.data.case)
        this.caseData = res.data.case
        this.asignValues()
      }
    })
  }

  asignValues() {
    this.accident = this.caseData.accident
    this.patientId = this.caseData.patient.id
  }


}
