import { Component, OnInit } from '@angular/core';
import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';
import { CaseModel } from '@appDir/front-desk/fd_shared/models/Case.model';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NF2Info } from '@appDir/shared/models/nf2/nf2Info';
import { changeDateFormat } from '@appDir/shared/utils/utils.helpers';
import { RequestService } from '@appDir/shared/services/request.service';
import { BillingEnum } from '@appDir/front-desk/billing/billing-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
@Component({
  selector: 'app-case-info-edit',
  templateUrl: './case-info-edit.component.html',
  styleUrls: ['./case-info-edit.component.css']
})
export class CaseInfoEditComponent implements OnInit {

  constructor(private caseFlowService: CaseFlowServiceService,private requestService: RequestService, private route: ActivatedRoute, private toasterService: ToastrService
	) { }

  loadSpin: boolean = false;
  caseId: number;
  case: CaseModel;
  disableBtn: boolean = false;
  nf2_Info: NF2Info;
  ngOnInit(): void {
    this.route.snapshot.pathFromRoot.forEach((path) => {
      if (path && path.params && path.params.caseId) {
        if (!this.caseId) {
          this.caseId = path.params.caseId;
        }
      }
    });
    this.loadSpin = true;
    this.caseFlowService.getCase(this.caseId).subscribe(data => {
      this.loadSpin = false;
      this.case = data['result']['data'];
	})

	if (this.caseId  ) {
		this.caseFlowService.getNF2Info(this.caseId).subscribe((response) => {
			this.nf2_Info=response['result']['data'];
			if (!this.nf2_Info.id) {
				this.caseFlowService.setNf2Status({status:'N/A',date:null})

				// this.caseFlowService.setNf2Status({status:'Unsent',date:null})

				
			} else {
				// this.caseFlowService.setNf2Status({status:this.nf2_Info.is_nf2_generated==true?'Yes':'No',date : this.nf2_Info.date});
				// this.caseFlowService.setNf2Status({status:(this.nf2_Info.id &&   this.nf2_Info.status)?this.nf2_Info.status.name:'Unsent',date:this.nf2_Info.date});
				this.caseFlowService.setNf2Status({status:this.nf2_Info.id ?this.nf2_Info.is_nf2_generated==true?'Yes':this.nf2_Info.is_nf2_generated==false?'No':'N/A':'N/A',date:this.nf2_Info.date})
			}
		})
		
	}
	
  }
  onSubmit(form) {
	  debugger;
	//   form['patient_id'] = this.id;
	//   form['check_duplicate']=true;
    this.loadSpin = true;
    this.disableBtn = true;
    // this.caseFlowService.updateCase(this.caseId, form).subscribe(data => {
	// 	if(data && data.result && data.result.data && data.result.data.case_exists)
	// 	{
	// 		this.confirmationService.create('Duplicate Case Found', 'Are you sure you want to create the duplicate Case?').subscribe(ans => {
	// 			if (ans.resolved)
	// 			{
	// 				form['check_duplicate']=false;
	// 				this.caseFlowService.updateCase(this.caseId, form).subscribe(data => {
	// 					this.getCase();
	// 				});
	// 			} 
	// 		});

	// 	}
	// 	else if(data && data.result && data.result.data && !data.result.data.case_exists)
	// 	{
	// 		this.getCase();
	// 	}
      

    // })
	console.log(form)
	// return
	form['date_of_admission'] = form && form.date_of_admission ? changeDateFormat(form.date_of_admission) : null;
	this.caseFlowService.updateCase(this.caseId, form).subscribe(data => {
		this.getCase();
		this.createFolderStruct({case_id: this.caseId ? Number(this.caseId) : null, practice_location_ids: form['practice_locations'] ? form['practice_locations'] : null})
	})
  }
  createFolderStruct(data){
	this.requestService.sendRequest(BillingEnum.getfolder, 'post', REQUEST_SERVERS.fd_api_url, data).subscribe(data => {
		console.log(data)
	})
  }
  getCase()
  {
	this.caseFlowService.getCase(this.caseId).subscribe(data => {
		this.loadSpin = false;
		this.toasterService.success('Successfully Updated', 'Success');
		this.caseFlowService.goToNextStep();
		this.caseFlowService.getPersonalInformation(this.caseId).subscribe(data => {
		})
	  }, err => { this.toasterService.error(err.error.message, 'Error'); this.disableBtn = false; this.loadSpin = false })
  }
}
