import { Socket } from 'ngx-socket-io';
import { DatePipeFormatService } from './../../services/datePipe-format.service';
import { Subscription } from 'rxjs';
import { Component, Input, OnInit, OnDestroy,ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Page } from '@appDir/front-desk/models/page';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { isEmpty } from 'lodash';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { CaseModel } from '@appDir/front-desk/fd_shared/models/Case.model';
import { CaseTypeEnum, CaseTypeIdEnum } from '@appDir/front-desk/fd_shared/models/CaseTypeEnums';
import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';
import { NF2Info } from '@appDir/shared/models/nf2/nf2Info';
import { RequestService } from '@appDir/shared/services/request.service';

@Component({
	selector: 'app-case-header',
	templateUrl: './case-header.component.html',
	styleUrls: ['./case-header.component.scss']
})
export class CaseHeaderComponent implements OnInit,OnDestroy {
	constructor(
		public socket: Socket,
		private caseFlowService: CaseFlowServiceService,
		private route: ActivatedRoute,
		private router: Router,
		private modalService: NgbModal,
		private requestService:RequestService,
		public datePipeService:DatePipeFormatService,

	) {
		this.allPage = new Page();
		this.allPage.pageNumber = 0;
		this.allPage.size = 10;
	}
	@Input() patient: any;
	@Input() case: CaseModel;
	@ViewChild('allergiesModal') private allergiesModal: any;
	id : any;
	case_type: string = '';
	nf2Status:any={status:'N/A',date:null};
	subscription:Subscription;
	nf2_Info: NF2Info;
	patAllergies=[];
	primary_insur: any;
	alltotal: any;
	limitPerPage = 10;
	allPage: Page;
	claim_no: any;
	lastAppt: any;
	nextAppt: any;

	ngOnInit() {
		this.id = this.route.snapshot.params['caseId'];
		let data = {case_id: this.id};
		// this.socket.emit('GETCASECOMMENTS', data);
		if (this.id && this.id!='null' ) {
			this.caseFlowService.getNF2Info(this.id).subscribe((response) => {
				this.nf2_Info=response['result']['data'];
				if (!this.nf2_Info.id) {
					this.nf2Status = {status:'N/A',date:null};
				} else {
					// this.nf2Status = {status:this.nf2_Info.id ?this.nf2_Info.is_nf2_generated==true?'Yes':'No':'N/A',date:this.nf2_Info.date};
					this.nf2Status = {status:this.nf2_Info.id ?this.nf2_Info.is_nf2_generated==true?'Yes':this.nf2_Info.is_nf2_generated==false?'No':'N/A':'N/A',date:this.nf2_Info.date};

				}
			})
			
		}

		// this.case_type = this.getCaseTypeName()
		this.subscription=this.caseFlowService.getNf2Status().subscribe((status) => {
			this.nf2Status = status;
		});
		
	}

	ngOnDestroy()
	{
		this.subscription.unsubscribe();
	}
	
	ngOnChanges() {
		if (this.patient) {
			this.patient.insurance_name = this.getInsurance();
		}

	}

	idToChartId(id) {
		let _id = '' + id;
		return `0`.repeat(9 - _id.length) + _id;
	}

	getCaseTypeName(case_type_slug: CaseTypeEnum) {
		let caseType = 'N/A';

		if (this.case && this.case.case_type_id && this.case.id == this.id) {
			switch ( case_type_slug) {
				case  CaseTypeEnum.auto_insurance:
					caseType = 'Auto Insurance';
					break;
				case  CaseTypeEnum.corporate:
					caseType = 'Corporate';
					break;
				case  CaseTypeEnum.lien:
					caseType = 'Slip & Fall / Liability';
					break;
				case  CaseTypeEnum.private_health_insurance:
					caseType = 'Private Health Insurance';
					break;
				case  CaseTypeEnum.self_pay:
					caseType = 'Self Pay';
					break;
				case  CaseTypeEnum.worker_compensation:
					caseType = 'Worker Compensation';
					break;
				case  CaseTypeEnum.worker_compensation_employer:
					caseType = 'Worker Compensation (Employer)';
					break;
				case  CaseTypeEnum.auto_insurance_worker_compensation:
					caseType = 'No Fault/Workers Comp';
					break;	
			}
		}
		return caseType;
	}
	getInsurance() {
		if (!this.case) {
			return '';
		}
		this.lastAppt = this.lastAppt ? this.lastAppt : this.case?.last_appointment;
		this.nextAppt = this.nextAppt ? this.nextAppt : this.case?.next_appointment;
		this.primary_insur = null;
		this.claim_no = null;
		this.case?.case_insurances?.forEach((key) => {
			if (this.case?.case_type?.slug == 'self_pay') {
				this.primary_insur = null;
				this.claim_no = null;
				this.case.caseAttorney.firm.name = null;
			} 
			else if (this.case?.case_type?.slug == 'private_health_insurance') {
				if (key?.confirmed_for_billing == 1) {
					this.primary_insur = key?.insurance?.insurance_name;
					this.claim_no = key?.claim_no;
					this.case.caseAttorney.firm.name = null;
				}
				else if (key?.type == 'private_health') {
					this.primary_insur = key?.insurance?.insurance_name;
					this.claim_no = key?.claim_no;
					this.case.caseAttorney.firm.name = null;
				}
			}
			else if (this.case?.case_type?.slug == 'lien') {
				if (key?.confirmed_for_billing == 1) {
					this.primary_insur = key?.insurance?.insurance_name;
					this.claim_no = key?.claim_no;
				}
				else if (key?.type == 'private_health') {
					this.primary_insur = key?.insurance?.insurance_name;
					this.claim_no = key?.claim_no;
				}
			}
			else {
				if (key?.confirmed_for_billing == 1) {
					this.primary_insur = key?.insurance?.insurance_name;
					this.claim_no = key?.claim_no;
				}
				else if (!this.primary_insur) {
					if (key?.type == 'primary') {
						this.primary_insur = key?.insurance?.insurance_name;
						this.claim_no = key?.claim_no;
					}
					else if (this.case?.case_insurances?.length < 4 && key?.type == 'private_health') {
						this.primary_insur = key?.insurance?.insurance_name;
						this.claim_no = key?.claim_no;
					}
				}
			}
		})
		let insurances = this.case?.case_insurances;
		//show primary; else secondary
		if (insurances) {
			let insurance = insurances.find((insurance) => {
				if (
					( this.case&&this.case.case_type && this.case.case_type.slug === CaseTypeEnum.auto_insurance) ||
					(this.case&&this.case.case_type&& (this.case.case_type.slug === CaseTypeEnum.worker_compensation || this.case.case_type.slug === CaseTypeEnum.worker_compensation_employer)) ||
					( this.case&& this.case.case_type&&this.case.case_type.slug === CaseTypeEnum.auto_insurance_worker_compensation) )
				 {
					return insurance.type === 'primary';
				} else {
					return insurance.type === 'secondary';
				}
			});

			return insurance && insurance.insurance ? insurance.insurance.insurance_name : '';
		}
		// let insurance_name = insurances.find(insurance => insurance.insurance.insurance_name)
	}
	goToProfile() {
		this.router.navigate(['/front-desk/patients/profile/' + this.patient.id]);
	}
	onReady(form) {
	}
	
	getPatientAllergies(pageInfo?)
	  {
		if (pageInfo) {
			this.allPage.pageNumber = pageInfo.offset;
		}
		let pageNumber = this.allPage && this.allPage.pageNumber + 1;
		let queryParams = {
			patient_id:this.patient.id,
			per_page: (this.allPage && this.allPage.size) || 10,
			page: pageNumber,
			pagination: true,
		};
		console.log(queryParams)
		this.requestService.sendRequest('patient/allergies', 'get', REQUEST_SERVERS.kios_api_path,queryParams).subscribe(res => {
				this.patAllergies=res&&res.result&&res.result.data&&res.result.data.docs;
				this.alltotal=res.result.data.total;
				this.patAllergies.forEach((value:any,index:any)=>{
					let reactions=[]
					value&&value.reactions&&value.reactions.forEach((element:any,index:any)=>{
						reactions.push(element.reaction.name);
					}
					)
					this.patAllergies[index].reactions && delete this.patAllergies[index].reactions;
					this.patAllergies[index]['reactions']=reactions.join(', ');
				})
			})
			
			
		
	  }
	  allPageLimit($num) {
		this.allPage.size = Number($num);
		this.getPatientAllergies({ offset: 0 });
	}
  	
close(){
	this.modalService.dismissAll();
}
	viewPatientAllergies()
	  {
		
		this.allPage.pageNumber = 0;
		this.getPatientAllergies();
		this.modalService.open(this.allergiesModal, { 
			windowClass : "myCustomModalClass",
			size: 'xl',
			backdrop: 'static',
			keyboard: false
		}
		)
	  }
}
