import { Component, OnInit } from '@angular/core';
import { DISEASES, ALLERGIES } from '../models/initialEvaluation/initialEvaluationData';
import { Diseases, Allergies } from '../models/initialEvaluation/initialEvaluationModels';
import { ActivatedRoute, Router } from '@angular/router';
import { MDService } from '../services/md/medical-doctor.service';
import { MainService } from '@shared/services/main-service';
import { Drugs } from '@appDir/medical-doctor/models/common/commonModels';

@Component({
  selector: 'app-past-medical-hsitory',
  templateUrl: './past-medical-hsitory.component.html',
  styleUrls: ['./past-medical-hsitory.component.scss']
})
export class PastMedicalHsitoryComponent implements OnInit {
 diseases:Diseases[] ;
 allergies:Allergies[];
 data:object;
 drugs:Drugs[];
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private MDService: MDService,
    private mainService:MainService) {
      this.mainService.setPanelData();
      ////////////Initialize data from localstorage if there is any/////////////////////
      //////////////////////////////////////////////////////////////////////////////////
      let session = this.MDService.getCurrentSession(); 
      let data = {};
      if(session['session'] && session['session']['pastMedicalHistory'] ){
        data= session['session']['pastMedicalHistory'];
      }
      this.data = data;    
      //////////////////////////////////////////////////////////////////////////////////}
  }
  ngOnInit() {

    let offlineData = this.MDService.getOfflineData();
    this.diseases=offlineData.diseases;
    this.allergies=offlineData.allergies;
    this.drugs = offlineData.drugs;
    // this.drugs = [new Drugs({id:1,display: "ponstan", value:"ponstan" })];    
  }
  ngOnDestroy(){
    this.mainService.resetPanelData();
  }
  

  nextPage(){
    this.router.navigate([`medical-doctor/physical-examination`]);
  }
  previousPage(){
    this.router.navigate([`medical-doctor/current-complaints-cont`]);
  }

}
