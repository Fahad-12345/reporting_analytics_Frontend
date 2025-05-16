import { USERPERMISSIONS } from '@appDir/front-desk/UserPermissions';
import { RequestService } from './../../../../shared/services/request.service';
import { DatePipeFormatService } from './../../../../shared/services/datePipe-format.service';
import { AclService } from './../../../../shared/services/acl.service';
import { Title } from '@angular/platform-browser';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModalOptions,NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit, ViewChild, Input } from '@angular/core';


@Component({
    selector: 'app-error-message-visit',
    templateUrl: './error-meesage-component.html',
    styleUrls: ['./error-meesage-component.scss']
})
export class ErrorMessageModalBillingComponent extends PermissionComponent  implements OnInit {

	@Input() modelTitle: string;
	@Input() errorMessage : string;
	@Input() rows: any[] = [];
	@ViewChild('openErrorModal') openErrorModal: any;
	userPermissions = USERPERMISSIONS;


    constructor(
		private modalService: NgbModal,
		public datePipeService:DatePipeFormatService,
		public aclService: AclService,
		public router: Router,
		public requestService: RequestService,
		private _route: ActivatedRoute,
		titleService: Title

		
		) {
			super(aclService, router, _route, requestService, titleService);

    }


    ngOnInit() {

    }

	openErrorMessage(){
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal-lg-package-generate',
		};
		debugger;
		this.modalService.open(this.openErrorModal, ngbModalOptions);
	}


	actionClassBind(date: any): string{
		if(date && date.deleted_at){
			return 'fa fa-check text-success'
		}else{
			return 'fas fa-times text-danger'
		}
	}

	navigateTo(caseid)
	{
		if(this.aclService.hasPermission(this.userPermissions.patient_case_list_patient_summary_menu))
		{
			
		
			this.router.navigate(['edit',caseid,'patient','patient_summary'],{ relativeTo: this.activatedRoute.parent.parent })
		}
		else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_case_info_menu))
		{
			this.router.navigate(['edit',caseid,'patient','case-info'],{ relativeTo: this.activatedRoute.parent.parent })

		}
		else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_personal_information_menu))
		{
			if(this.aclService.hasPermission(this.userPermissions.patient_case_list_personal_information_personal_tab))
			{
				this.router.navigate(['edit',caseid,'patient','personal-information','personal'],{ relativeTo: this.activatedRoute.parent.parent })

			}
			else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_personal_information_basic_contact_tab))
			{
				this.router.navigate(['edit',caseid,'patient','personal-information','basic-contact'],{ relativeTo: this.activatedRoute.parent.parent })

				
			}
			else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_personal_information_form_filler_tab))
			{
				this.router.navigate(['edit',caseid,'patient','personal-information','form-filler'],{ relativeTo: this.activatedRoute.parent.parent })

				
			}

			
			else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_personal_information_emergency_contact_tab))
			{
				this.router.navigate(['edit',caseid,'patient','personal-information','emergency-contact'],{ relativeTo: this.activatedRoute.parent.parent })

				
			}
			else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_personal_information_gurantor_tab))
			{
				this.router.navigate(['edit',caseid,'patient','personal-information','guarantor'],{ relativeTo: this.activatedRoute.parent.parent })

				
			}
		}
		else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_referrals_menu))
		{
			this.router.navigate(['edit',caseid,'referrals'],{ relativeTo: this.activatedRoute.parent.parent })

		}

		else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_menu))
		{
			if(this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_attorney_tab))
			{
				this.router.navigate(['edit',caseid,'case-insurance','attorney'],{ relativeTo: this.activatedRoute.parent.parent })

			}
			else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_insurance_tab))
			{
				this.router.navigate(['edit',caseid,'case-insurance','insurance'],{ relativeTo: this.activatedRoute.parent.parent })

			}
			else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_employer_tab))
			{
				this.router.navigate(['edit',caseid,'case-insurance','employer'],{ relativeTo: this.activatedRoute.parent.parent })

			}
			else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_accident_tab))
			{
				this.router.navigate(['edit',caseid,'case-insurance','accident'],{ relativeTo: this.activatedRoute.parent.parent })

			}
			else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_vehicle_tab))
			{
				this.router.navigate(['edit',caseid,'case-insurance','vehicle'],{ relativeTo: this.activatedRoute.parent.parent })

			}
			else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_household_tab))
			{
				this.router.navigate(['edit',caseid,'case-insurance','house-hold-info'],{ relativeTo: this.activatedRoute.parent.parent })

			}
			else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_medical_treatment_tab))
			{
				this.router.navigate(['edit',caseid,'case-insurance','medical-treatment'],{ relativeTo: this.activatedRoute.parent.parent })

			}

		}

		else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_injury_menu))
		{
			this.router.navigate(['edit',caseid,'injury'],{ relativeTo: this.activatedRoute.parent.parent })

		}
		else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_marketing_menu))
		{
			this.router.navigate(['edit',caseid,'marketing'],{ relativeTo: this.activatedRoute.parent.parent })

		}
		else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_docs_menu))
		{
			this.router.navigate(['edit',caseid,'document'],{ relativeTo: this.activatedRoute.parent.parent })

		}
		else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_scheduler_menu))
		{
			this.router.navigate(['edit',caseid,'scheduler'],{ relativeTo: this.activatedRoute.parent.parent })

		}
		else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_visits_menu))
		{
			this.router.navigate(['edit',caseid,'visits'],{ relativeTo: this.activatedRoute.parent.parent })

			
		}
		else if(this.aclService.hasPermission(this.userPermissions.patient_case_list_billing_menu))
		{
			this.router.navigate(['edit',caseid,'billing'],{ relativeTo: this.activatedRoute.parent.parent })

		}	
		
	}

	getRowClass = (row) => {
		return {
		  'row-color': row.deleted_at ? true : false
		};
	 }
 }
