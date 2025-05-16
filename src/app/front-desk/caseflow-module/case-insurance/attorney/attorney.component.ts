import { Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorage } from '@shared/libs/localstorage';
import { FDServices } from 'app/front-desk/fd_shared/services/fd-services.service';
import { ToastrService } from 'ngx-toastr';
import { Patient } from 'app/front-desk/patient/patient.model';
import { MainService } from '@shared/services/main-service';
import { FRONT_DESK_LINKS } from 'app/front-desk/models/leftPanel/leftPanel';
import { RequestService } from '@appDir/shared/services/request.service';
import { CasesUrlsEnum } from '@appDir/front-desk/cases/Cases-Urls-Enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { Subscription } from 'rxjs';
import { AttorneyFormComponent } from '@appDir/front-desk/caseflow-module/case-insurance/attorney/components/attorney-form/attorney-form.component';
import { FormGroup } from '@angular/forms';
import { CanDeactivateComponentInterface } from '@appDir/shared/canDeactivateFormsComponent/CanDeactivateComponent.interface';
import { CaseModel, AttorneyModel } from '@appDir/front-desk/fd_shared/models/Case.model';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';

@Component({
	selector: 'app-attorney',
	templateUrl: './attorney.component.html',
	styleUrls: ['./attorney.component.scss']
})
export class AttorneyComponent extends PermissionComponent implements OnInit, CanDeactivateComponentInterface {
	subscription: Subscription[] = [];
	primaryInsurance: any;
	secondaryInsurance: any;
	tertiaryInsurance: any;
	privateHealthInsurance: any;
	@ViewChild(AttorneyFormComponent) AttorneyFormComponent: AttorneyFormComponent;
	form: FormGroup;
	ngAfterViewInit() {
		this.getChildProperty();
	}
	getChildProperty() {
		this.form = this.AttorneyFormComponent.form;
	}

	public title: string;
	public caseData: CaseModel;
	public caseId: number;
	public patient: Patient
	patientInsuranceCompanies = []
	addNew = false
	insuranceType: string = ''
	insurances: any[] = []
	attorney: AttorneyModel;

	constructor(router: Router, titleService: Title, private mainService: MainService, private route: ActivatedRoute, private localStorage: LocalStorage, private fd_services: FDServices, private toastrService: ToastrService,
		protected requestService: RequestService, aclService: AclService,
	) {
		super(aclService);
		titleService.setTitle(this.route.snapshot.data['title']);
		this.route.snapshot.pathFromRoot.forEach(path => {
			if (path && path.params && path.params.caseId) {
				if (!this.caseId) {
					this.caseId = path.params.caseId;
				}
			}
		})
		// this.fd_services.currentCase.subscribe(c => {
		//   this.caseData = c;
		//   if(!this.caseData.id){
		//       this.getCase() 
		//   }else{
		//     this.attorney = this.caseData.attorney
		//   }
		// })
		// this.getCase()
	}

	ngOnInit() {

		this.mainService.setLeftPanel(FRONT_DESK_LINKS)
		// console.log(this.attorney);
	}

	// getCase() {
	// 	this.subscription.push(
	// 		this.fd_services.getCaseDetail(this.caseId)
	// 			// 	this.requestService.sendRequest(
	// 			// 		CasesUrlsEnum.Cases_list_GET + this.caseId,
	// 			// 		'GET',
	// 			// 		REQUEST_SERVERS.kios_api_path
	// 			// 	)
	// 			.subscribe((res: any) => {
	// 				if (res.statusCode == 200) {
	// 					this.caseData = res.data;
	// 					this.attorney = this.caseData.attorney
	// 					console.log("caseData", this.caseData);
	// 					this.fd_services.setCase(res.data.case)
	// 					// this.assingValues()

	// 				}
	// 			}));
	// }

	// assingValues() {
	// 	// this.patient = this.caseData.patient

	// 	// let insuranceData = this.caseData.patientInsuranceCompanies
	// 	if (insuranceData.length > 0 && insuranceData[0].type == 'major medical') {
	// 		let majorMedical = this.caseData.patientInsuranceCompanies[0]
	// 		insuranceData[0] = insuranceData[1]
	// 		insuranceData[1] = majorMedical
	// 		this.patientInsuranceCompanies = insuranceData
	// 	} else {
	// 		this.patientInsuranceCompanies = this.caseData.patientInsuranceCompanies
	// 	}

	// 	this.insurances = []
	// 	this.patientInsuranceCompanies.forEach(elem => {
	// 		if (elem && elem.type) {
	// 			this.insurances.push(elem.type)
	// 			switch (elem.type) {

	// 				case "Primary":
	// 				case "primary":
	// 					this.primaryInsurance = elem;
	// 					break;

	// 				case "Secondary":
	// 				case "secondary":
	// 					this.secondaryInsurance = elem;
	// 					break;

	// 				case "Tertiary":
	// 				case "tertiary":
	// 					this.tertiaryInsurance = elem;
	// 					break;

	// 				case "major medical":
	// 					this.privateHealthInsurance = elem;
	// 					break;
	// 			}
	// 		}
	// 	})
	// 	//   for(let i in this.patientInsuranceCompanies){
	// 	//     switch(this.patientInsuranceCompanies[i].type){

	// 	//     case "Primary": 
	// 	//     case "primary": 
	// 	//       this.primaryInsurance = this.patientInsuranceCompanies[i];
	// 	//       break;

	// 	//     case "Secondary": 
	// 	//     case "secondary": 
	// 	//       this.secondaryInsurance = this.patientInsuranceCompanies[i];
	// 	//       break;

	// 	//     case "Tertiary": 
	// 	//     case "tertiary": 
	// 	//       this.tertiaryInsurance = this.patientInsuranceCompanies[i];
	// 	//       break;

	// 	//     case "major medical": 
	// 	//       this.privateHealthInsurance = this.patientInsuranceCompanies[i];
	// 	//       break;
	// 	//   }
	// 	// }
	// }

	// goToPrivateInsuranceForm() {

	// 	let id: number
	// 	if (this.caseData.patientInsuranceCompanies.length > 0) {
	// 		this.caseData.patientInsuranceCompanies.forEach(element => {
	// 			if (element.type == 'major medical') {
	// 				id = element.id
	// 			}
	// 		});
	// 	} else {
	// 		this.router.navigate(['add'], { relativeTo: this.route.parent.parent });
	// 	}
	// }

	// getCaseEmitter(){
	//   this.getCase()
	// }
	canDeactivate() {
		if (this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_attorney_info_view))
			return (this.form.touched && this.form.dirty);
	}
}
