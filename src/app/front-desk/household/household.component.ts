import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { Component, OnInit } from '@angular/core';
import { MainService } from '@shared/services/main-service';
import { Title } from '@angular/platform-browser';
import { FRONT_DESK_LINKS } from '../models/leftPanel/leftPanel';
import { ToastrService } from 'ngx-toastr';
import { FDServices } from '../fd_shared/services/fd-services.service';
import { LocalStorage } from '@shared/libs/localstorage';
import { ActivatedRoute } from '@angular/router';
import { Logger } from '@nsalaun/ng-logger';

@Component({
  selector: 'app-household',
  templateUrl: './household.component.html',
})
export class HouseholdComponent implements OnInit {

  public rows: any[];

  public title: string
  public caseData: any;
  public caseId: number;
  public peopleLivingWithPatients: any[] = []
  public relations: any[] = []

  constructor(private mainService: MainService, private toastrService: ToastrService, private fd_services: FDServices, private localStorage: LocalStorage, private titleService: Title, private route: ActivatedRoute, private logger: Logger,public datePipeService:DatePipeFormatService) {
      this.caseId = +this.localStorage.get('caseId')
      this.fd_services.currentCase.subscribe(c => this.caseData = c)
   }

  ngOnInit() {
    this.mainService.setLeftPanel(FRONT_DESK_LINKS)
    this.titleService.setTitle(this.route.snapshot.data['title'])
    this.title = this.route.snapshot.data['title']
    this.getRelations()
    
    if(this.fd_services.isEmpty(this.caseData)) {
      this.getCase()
    } else {
      this.assignValues()
    }
  }

  getCase() {
    this.fd_services.getCaseDetail(this.caseId).subscribe(res => {
        // this.logger.log('case', res);
        if(res.statusCode == 200) {
            this.fd_services.setCase(res.data.case)
            this.caseData = res.data.case            
            this.assignValues()
        }
    }, err => {
        this.toastrService.error(err.message, 'Error')
    })
  }

  getRelations() {
    this.fd_services.getRelations().subscribe(res => {
      if(res.statusCode == 200) {
          this.relations = res.data;
      }
    })
  }

  assignValues() {
    this.peopleLivingWithPatients = this.caseData.peopleLivingWithPatients
  }


}
