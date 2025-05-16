import { CustomDiallogService } from './../../../../../shared/services/custom-dialog.service';
import { Component, OnInit } from '@angular/core';
import { ParamQuery, OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { PatientListingUrlsEnum } from '@appDir/front-desk/patient/patient-listing/PatientListing-Urls-Enum';
import { ActivatedRoute, Router } from '@angular/router';
import { CaseFlowUrlsEnum } from '@appDir/front-desk/fd_shared/models/CaseFlowUrlsEnum';
import { ToastrService } from 'ngx-toastr';
import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { changeDateFormat } from '@appDir/shared/utils/utils.helpers';
import { BillingEnum } from '@appDir/front-desk/billing/billing-enum';

@Component({
  selector: 'app-create-case',
  templateUrl: './create-case.component.html',
  styleUrls: ['./create-case.component.scss']
})
export class CreateCaseComponent implements OnInit {

  constructor(private caseFlowService: CaseFlowServiceService,private requestService: RequestService, private route: ActivatedRoute, 
	private toasterService: ToastrService, private localStorage: StorageData,
	private router: Router, private customDiallogService: CustomDiallogService,) { }

  disableBtn: boolean = false;
  patient: any = {}
  id: number;
  loadSpin: boolean = false;
  ngOnInit() {
    this.id = parseInt(this.route.snapshot.params['id'])
    if (this.id) {
      let param: ParamQuery = { pagination: false, filter: false, order_by: OrderEnum.DEC } as any
      this.loadSpin = true;
      this.requestService.sendRequest(PatientListingUrlsEnum.Patient_Get, 'get', REQUEST_SERVERS.kios_api_path, { ...param, id: this.id }).subscribe(data => {
        this.loadSpin = false;
        this.patient = data['result']['data'][0]
      }, err => {
        this.loadSpin = false;
        this.toasterService.error(err.error.message, 'Error')
      })
    }

  }
  onSubmit(form) {
	debugger;
    form['patient_id'] = this.id;
	form['check_duplicate']=true;
	form.accident_date=form.accident_date? changeDateFormat(form.accident_date) : null;
	form.date_of_admission=form.date_of_admission? changeDateFormat(form.date_of_admission) : null;
    this.disableBtn = true;
    this.loadSpin = true;
	console.log(form)
	// return
    this.requestService.sendRequest(CaseFlowUrlsEnum.CreateSession, 'post', REQUEST_SERVERS.kios_api_path, form).subscribe(data => {
		this.disableBtn = false;
		this.loadSpin = false;
		if(data && data.result && data.result.data && data.result.data.case_exists)
		{
			let message=`Duplicate case found against Case Id ${data.result.data.id}.`
			this.customDiallogService.confirm('Duplicate Case Found', message,'Create a New Case','Go to Existing Case','sm','btn btn-danger').then(confirmed => {
				debugger;
				if (confirmed) 
				{
					this.disableBtn = true;
					this.loadSpin = true;
					form['check_duplicate']=false;
					this.requestService.sendRequest(CaseFlowUrlsEnum.CreateSession, 'post', REQUEST_SERVERS.kios_api_path, form).subscribe(response=>{
						this.loadSpin = false
						this.disableBtn = false;
						this.toasterService.success('Case Created', 'Success');
						this.caseFlowService.resetCaseAndDataObject();
						this.caseFlowService.goToNextStep('case-info', response?.['result']?.['data']?.id)
						this.createFolderStruct({case_id: response?.['result']?.['data']?.id, practice_location_ids: form['practice_locations'] ? form['practice_locations'] : null})
					})
				}
				else if(confirmed === false)
				{
					this.caseFlowService.resetCaseAndDataObject();
					this.caseFlowService.goToNextStep('case-info', data?.['result']?.['data']?.id);
					this.createFolderStruct({case_id: data?.['result']?.['data']?.id, practice_location_ids: form['practice_locations'] ? form['practice_locations'] : null})
					
					  
					return ;
				}
				else
				{
					return;
				}
			})
		}
		else if(data && data.result && data.result.data && !data.result.data.case_exists)
		{
				this.toasterService.success('Case Created', 'Success');
				this.caseFlowService.resetCaseAndDataObject();
				this.caseFlowService.goToNextStep('case-info', data?.['result']?.['data']?.id)
				this.createFolderStruct({case_id: data?.['result']?.['data']?.id, practice_location_ids: form['practice_locations'] ? form['practice_locations'] : null})
			
		}
	
    //   this.router.navigate([`front-desk/cases/edit/${data['result']['data'].id}/patient/personal-information/personal`])
    }, err => { this.toasterService.error(err.message, 'Error'); this.disableBtn = false; this.loadSpin = false; })
  }
  createFolderStruct(data){
	this.requestService.sendRequest(BillingEnum.getfolder, 'post', REQUEST_SERVERS.fd_api_url, data).subscribe(data => {
		console.log(data)
	})
  }
}
