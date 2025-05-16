import { Component, OnInit, Input } from '@angular/core';
import { MainService } from '@shared/services/main-service';
import { FRONT_DESK_LINKS } from '../models/leftPanel/leftPanel';
import { Title } from '@angular/platform-browser';
import { FDServices } from '../fd_shared/services/fd-services.service';
import { Logger } from '@nsalaun/ng-logger';
import { ToastrService } from 'ngx-toastr';
import { LocalStorage } from '@shared/libs/localstorage';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-attorney',
  templateUrl: './attorney.component.html',
})
export class AttorneyComponent implements OnInit {

  @Input() attorney: any = {}
  caseId: number;
  private case: any;

  constructor(private mainService: MainService, private localStorage: LocalStorage, private route: ActivatedRoute, private titleService: Title, private fd_services: FDServices, private logger: Logger, private toastrService: ToastrService) { }

  ngOnInit() {
    this.mainService.setLeftPanel(FRONT_DESK_LINKS);
    // this.titleService.setTitle('Edit Attorney')
    this.titleService.setTitle(this.route.snapshot.data['title']);
    this.logger.log("Title ", this.route.snapshot.data['title']);

    this.caseId = +this.localStorage.get('caseId')

    this.fd_services.currentCase.subscribe(c => this.case = c)

    if (this.fd_services.isEmpty(this.case.attorney)) {
      this.getCase(this.caseId)
    } else {
      this.attorney = this.case.attorney
    }
  }


  getCase(id: number) {
    this.logger.log(id);
    this.fd_services.getCaseDetail(id).subscribe(res => {
      this.logger.log('case', res);
      if (res.statusCode == 200) {
        this.fd_services.setCase(res.data.case)
        this.attorney = res.data.case.attorney
      }
    }, err => {
      this.toastrService.error(err.message, 'Error')
    })
  }
}
