import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { Component, OnInit } from '@angular/core';
import { MainService } from '@shared/services/main-service';
import { Title } from '@angular/platform-browser';
import { FRONT_DESK_LINKS } from '../models/leftPanel/leftPanel';
import { FDServices } from '../fd_shared/services/fd-services.service';
import { LocalStorage } from '@shared/libs/localstorage';
import { ToastrService } from 'ngx-toastr';
import { Logger } from '@nsalaun/ng-logger';
import { ActivatedRoute } from '@angular/router';
import { CommonFunctionService } from '../fd_shared/services/datePipe-format.service';

@Component({
  selector: 'app-mri',
  templateUrl: './mri.component.html',
})
export class MRIComponent implements OnInit {

  previousSurgeries: any []
  surgeryExaminations: any[]
  drugs: any[]
  surgicalDetails: any = {}
  caseId: number;
  caseData: any;
  symptoms: any[] = []
  describeInjuries: any = []
  explianProblem: any = []
  describeObjects: any = []
  describeDiseases: any = []
  fertilityTreatments: any = []
  medicalHistories: any = {}

  constructor(private mainService: MainService, private route: ActivatedRoute, private toastrService: ToastrService, private titleService: Title, private logger: Logger, private fd_services: FDServices, private localStorage: LocalStorage,public datePipeService:DatePipeFormatService) { 
    this.caseId = +this.localStorage.get('caseId')
    this.fd_services.currentCase.subscribe(c => this.caseData = c)
  }

  ngOnInit() {
    this.mainService.setLeftPanel(FRONT_DESK_LINKS);
    this.titleService.setTitle(this.route.snapshot.data['title'])

    this.getCase()
  }

  getCase() {
    this.fd_services.getCaseDetail(this.caseId).subscribe(res => {
        this.logger.log('case', res);
        if(res.statusCode == 200) {
            this.fd_services.setCase(res.data.case)
            this.caseData = res.data.case
            this.assignValues()
        }
    }, err => {
        this.toastrService.error(err.error.error.message, 'Error')
    })
  }

  assignValues() {
    this.previousSurgeries = this.caseData.previousSurgeries
    this.surgeryExaminations = this.caseData.surgeryExaminations
    this.drugs = this.caseData.drugs
    this.surgicalDetails = this.caseData.surgicalDetails
    this.symptoms = this.caseData.symptoms
    this.medicalHistories = this.caseData.medicalHistories

    this.caseData.comments.forEach(element => {
        if(element.type == 'explianProblem') {
          this.explianProblem.push(element)
        } else if(element.type == 'describeInjuries') {
          this.describeInjuries.push(element)
        } else if(element.type == 'describeObjects') {
          this.describeObjects.push(element)
        } else if(element.type == 'describeDiseases') {
          this.describeDiseases.push(element)
        } else if(element.type == 'fertilityTreatments') {
          this.fertilityTreatments.push(element)
        }
    });
  }

}
