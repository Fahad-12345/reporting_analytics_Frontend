import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { MainService } from '@shared/services/main-service';
import { FRONT_DESK_LINKS } from 'app/front-desk/models/leftPanel/leftPanel';
import { FDServices } from 'app/front-desk/fd_shared/services/fd-services.service';
import { Logger } from '@nsalaun/ng-logger';
import { ActivatedRoute } from '@angular/router';
import { LocalStorage } from '@shared/libs/localstorage';

@Component({
  selector: 'app-attorney-edit',
  templateUrl: './attorney-edit.component.html',
})
export class AttorneyEditComponent implements OnInit {
  
  public attorney;
  public case: any;
  public caseId: number;

  constructor(private titleService: Title, private mS: MainService, private localStorage: LocalStorage, private fd_services: FDServices, private logger: Logger, private route: ActivatedRoute) { 
      this.fd_services.currentCase.subscribe(cas => this.case = cas)
      this.caseId = +this.localStorage.get('caseId')
  }

  ngOnInit() {
    // this.titleService.setTitle('Attorney')
    
    this.titleService.setTitle(this.route.snapshot.data['title']);
    this.mS.setLeftPanel(FRONT_DESK_LINKS)

    if(this.case.attorney != undefined && this.case.attorney != null) {
        this.attorney = this.case.attorney
    } else {
        this.getCase(this.caseId)
    }
  }

  getCase(id: number) {
    this.fd_services.getCaseDetail(id).subscribe(res => {
        if(res.statusCode == 200) {
          this.logger.log('attorney', res.data.case.attorney)
          this.attorney = res.data.case.attorney
        }
    })
  }

}
