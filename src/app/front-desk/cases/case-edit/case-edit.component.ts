import { Component, OnInit, OnDestroy } from '@angular/core';
import { FDServices } from 'app/front-desk/fd_shared/services/fd-services.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Logger } from '@nsalaun/ng-logger';
import { ToastrService } from 'ngx-toastr';
import { LocalStorage } from '@shared/libs/localstorage';
import { DatePipe } from '@angular/common'
import { CasesServiceService } from '../cases-service.service';
import { Subscription, BehaviorSubject } from 'rxjs';
import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';
import { CaseModel } from '@appDir/front-desk/fd_shared/models/Case.model';
// import { dateFormatterMDY } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
@Component({
  selector: 'app-case-edit',
  templateUrl: './case-edit.component.html',
  styleUrls: ['./case-edit.component.scss']
})
export class CaseEditComponent implements OnInit {

  public caseType: string;
  speciality: string
  purpose: string
  // public case: any;
  public patient: any;
  public accident: any;
  public accidentDate;
  public admissionDate;
  public dob;
  public patientAddress: any = {};
  public age: number;
  public caseId: any;
  public insuranceCompany: any;

  casesCount: number = 0;
  obs: BehaviorSubject<boolean>
  constructor(public datepipe: DatePipe, private fd_services: FDServices, private localStorage: LocalStorage, private route: ActivatedRoute, private logger: Logger, private toastrService: ToastrService,
    private caseService: CasesServiceService, public router: Router, public caseFlowService: CaseFlowServiceService) {

  }

  ngOnDestroy() {
    // this.obs.unsubscribe()
  }

  calculateAge(birthday: Date) {

    var ageDifMs = Date.now() - birthday.getTime();
    var ageDate = new Date(ageDifMs); // miliseconds
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }


  getCase() {
	this.caseId = this.route.snapshot.params['caseId']
	if(this.caseId=="null")
	{
		return;
	}
    this.fd_services.caseId.next(this.caseId)

  }
  private calAge(bDay): any {
    let now = new Date()
    // alert('now:'+now);
    let born = new Date(bDay);
    // alert('born:'+born);
    let years = Math.floor((now.getTime() - born.getTime()) / (365 * 24 * 60 * 60 * 1000));
    // alert(bDay.value+': '+years)
    return years;
  }
  ssnFormat = (patient) => {
    let id = patient.id;
    id = String(id);
    id = id.substring(0, 3) + "-" + id.substring(4, 6) + "-" + id.substring(5, 9);
    this.patient.displaId = id;
  }
  ngOnInit() {
	let id = this.route.snapshot.params['caseId'];
    if (id && id!="null")
      this.caseFlowService.getPersonalInformation(id).subscribe(data => {
        this.patient = (data['result']['data'] as CaseModel).patient
      })
      this.caseFlowService.getCase(id, 'all_info').subscribe(data => {
        console.log(data);
      })
  }
  getCasesCount() {
    let requestData = {
      "patientId": this.patient.id,
      "caseId": 0,
      "caseType": "",
      "claimNo": "",
      "insurance": "",
      "attorney": "",
      "dateOfAccident": "",
      "pageNumber": 1,
      "pageSize": 10
    };
    this.fd_services.searchCases(1, 10, this.patient.id, requestData).subscribe(
      res => {
        if (res.statusCode == 200) {
          this.casesCount = res.data.totalRecords;
        }
      }
    )
  }
}
