import { Component, OnInit } from '@angular/core';
import { MainService } from '@shared/services/main-service';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { FRONT_DESK_LINKS } from 'app/front-desk/models/leftPanel/leftPanel';
import { Logger } from '@nsalaun/ng-logger';
import { LocalStorage } from '@shared/libs/localstorage';
import { FDServices } from 'app/front-desk/fd_shared/services/fd-services.service';

@Component({
  selector: 'app-household-edit',
  templateUrl: './household-edit.component.html',
})
export class HouseholdEditComponent implements OnInit {

  public title: string;
  public caseData: any;
  public caseId: number;
  public peopleLivingWithPatients: any

  constructor(private titleService: Title, private mainService: MainService, private logger: Logger, private route: ActivatedRoute, private localStorate: LocalStorage,
    private fd_services: FDServices) {
    this.caseId = +this.localStorate.get('caseId')
    this.fd_services.currentCase.subscribe(c => this.caseData = c)
  }

  ngOnInit() {
    this.mainService.setLeftPanel(FRONT_DESK_LINKS)
    this.titleService.setTitle(this.route.snapshot.data["title"]);
    this.title = "Edit " + this.route.snapshot.data["title"]

    if(this.fd_services.isEmpty(this.caseData)) {
      this.getCase()
    } else {
        this.assignValues()
    }
  }

  getCase() {
    this.fd_services.getCaseDetail(this.caseId).subscribe(res =>  {
      if(res.statusCode == 200) {
        this.fd_services.setCase(res.data.case)
        this.assignValues()
      }
    })
  }

  assignValues() {
    let id = this.route.snapshot.params['id'];
    this.logger.log('Patientl Living situation Id', id)
    this.caseData.peopleLivingWithPatients.forEach(element => {
      if(element.id == id) {
        this.peopleLivingWithPatients = element
        this.logger.log('people data', this.peopleLivingWithPatients)
      }
    });
    

  }
}
