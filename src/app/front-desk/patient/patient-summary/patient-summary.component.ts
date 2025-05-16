import { Component, OnInit, OnChanges, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { MainService } from '@shared/services/main-service';
import { FRONT_DESK_LINKS } from 'app/front-desk/models/leftPanel/leftPanel';
import { Title } from '@angular/platform-browser';
import { FDServices } from 'app/front-desk/fd_shared/services/fd-services.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Logger } from '@nsalaun/ng-logger';
import { Patient, BodyPartsModel } from '../patient.model';
import { ToastrService } from 'ngx-toastr';
import { LocalStorage } from '@shared/libs/localstorage';
import { Observable, Subscription } from 'rxjs';
import { relative } from 'path';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
// import RingCentralClient, { SERVER_SANDBOX } from "ringcentral-client";
// import SDK from "ringcentral";
import { Config } from 'app/config/config';
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { PatientSummaryUrlsEnum } from './Patient-Summary-Urls-Enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { CasesUrlsEnum } from '@appDir/front-desk/cases/Cases-Urls-Enum';
// import { documentManagerUrlsEnum } from '@appDir/shared/components/document-manager/document-manager-Urls-enum';
import { AclService } from '@appDir/shared/services/acl.service';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
// import * as fs from "fs";
@Component({
	selector: 'app-patient-summary',
	templateUrl: './patient-summary.component.html',
})
export class PatientSummaryComponent extends PermissionComponent implements OnChanges, OnDestroy {
	subscription: Subscription[] = [];
	public emailForm: FormGroup;
	public faxForm: FormGroup;
	public caseId: any;
	public patient: any = {};
	public patientContact: any = {};
	@ViewChild('patientsummary') patientsummary :ElementRef;
	private _attorney: any = {};
	public get attorney(): any {
		return this._attorney;
	}
	public set attorney(value: any) {
		this._attorney = value;
	}
	public case: any;
	public caseType: string;
	public primaryInsurance: any = { caseInsurances: {} };
	public referring: any = [];
	public employer: any = { otherContactPerson: {} };
	public accident: any = {};
	public bodyParts: BodyPartsModel[] = [];
	public bodyPartsString: String;
	public praticeLocationList : [] = [];
	public praticeLocationSeleted : string[] = [];
	public loadSpin: boolean = false;
	public disableBtn: boolean = false;
	public disableBtnFax: boolean = false;
	public primaryTitle: String = '';
	modalRef: NgbModalRef;
	constructor(
		private config: Config,
		private toasterService: ToastrService,
		private fb: FormBuilder,
		private modalService: NgbModal,
		private mainService: MainService,
		router: Router,
		private localStorage: LocalStorage,
		titleService: Title,
		private fd_services: FDServices,
		private route: ActivatedRoute,
		// private logger: Logger,
		private toastrService: ToastrService,
		protected requestService: RequestService,
		aclService: AclService,
		public caseFlowService: CaseFlowServiceService,
		private storageData: StorageData
	) {
		super(aclService, router, route, requestService, titleService);
		this.setTitle();
		// this.titleService.setTitle(this.route.snapshot.data['title']);
		this.route.snapshot.pathFromRoot.forEach((path) => {
			if (path && path.params && path.params.caseId) {
				if (!this.caseId) {
					this.caseId = path.params.caseId;
				}
			}
		});
		this.getCase()
		this.emailForm = this.fb.group({
			fileIds: '',
			to: ['', [Validators.required, Validators.email]],
			message: '',
		});
		this.faxForm = this.fb.group({
			fileIds: '',
			to: ['', [Validators.required]],
			message: '',
		});
		// this.fd_services.caseId.subscribe(id=>{
		//   console.log(id);
		// })
		// this.fd_services.currentCase.subscribe(c => {
		//   this.case = c;
		//   this.caseId = this.case.id;
		// })
		// this.caseId = +this.localStorage.get('caseId');
	}

	ngOnInit() {
		this.mainService.setLeftPanel(FRONT_DESK_LINKS);
		this.setTitle();
		if(this.patientsummary) {
			this.patientsummary.nativeElement.scrollIntoView();
		}
	}

	ngOnChanges() { }

	case_info: any
	getCase() {
		if(this.caseId=="null")
		{
			// this.toastrService.error('Case is not created yet.please Create case to view patient summary', 'Error');
			return;
		}
		this.caseFlowService.getCase(this.caseId).subscribe(data => {
			console.log(data);
			this.case_info = data.result.data
			this.patient = this.case_info.patient
			this.patientContact = this.case_info.basic_information
			this.bodyParts = this.case_info.body_parts
			this.attorney = this.case_info.case_attorney
			this.primaryInsurance = this.case_info.insurance
			this.employer = this.case_info.employer
		})

	}

	assignValues() {
		this.patient = this.case.patient;
		// this.logger.log('patient', this.patient);
		this.patientContact = this.patient.patientAddressInfos[0];
		this.attorney = this.case.attorney;
		this.caseType = this.case.caseType != undefined ? this.case.caseType.type : null;
		this.getPrimaryInsurance(this.case.patientInsuranceCompanies);
		this.getEmployer(this.case.employers);
		this.referring = this.case.referringDoctors;
		this.accident = this.case.accident;
		this.bodyParts = this.case.bodyPartSensation;
		let bodyPartNames = this.case.bodyPartSensation.map((bodyPart) => {
			return bodyPart.bodyPartName;
		});
		this.bodyPartsString = bodyPartNames.join(', ');

		this.case.patientInsuranceCompanies.forEach((elem) => {
			switch (elem.type) {
				case 'Primary':
				case 'primary':
					this.primaryInsurance = elem;
					debugger;
					switch (this.case && this.case.caseType && this.case.caseType.type) {
						case 'WC':
							this.primaryTitle = 'Worker Compensation Information';
							break;
						case 'No Fault':
							this.primaryTitle = 'No Fault Information';
							break;
						default:
							this.primaryTitle = 'Primary Insurance Information';
					}
					break;
			}
		});
	}

	getPrimaryInsurance(insurances: any) {
		insurances.forEach((ins) => {
			if (ins.type == 'Primary') {
				// this.logger.log('ins', ins);
				this.primaryInsurance = ins;
			}
		});
	}

	getReferring(referring: any) {
		referring.forEach((refer) => {
			if (refer.type == 'Primary') {
				this.referring = refer;
			}
		});
	}

	getEmployer(employers: any) {
		employers.forEach((empl) => {
			if (empl.employerCaseType == 'Primary') {
				this.employer = empl;
			}
		});
	}

	goTo(path: string) {
		this.router.navigate([path], { relativeTo: this.route.parent });
	}

	goToOuterRoutes(path: string) {
		this.router.navigate([path], { relativeTo: this.route.parent.parent.parent });
	}

	goBack() {
		this.router.navigate(['patient'], { relativeTo: this.route.parent.parent.parent });
	}
	fax() { }
	exportToExcel() {
		var downloadLink = this.fd_services.exportExcelUrl(this.patient);
		window.open(downloadLink);
	}

	
	@ViewChild('PdfSelectionDialog') PdfSelectionDialog ;

	praticeLocationSeletionChange(slug : string) {
		debugger;
		if(this.praticeLocationSeleted.includes(slug)){
			this.praticeLocationSeleted = this.praticeLocationSeleted.filter( (x:string) => { x != slug });
			return;
		}
		this.praticeLocationSeleted.push(slug);
	}

	openModalForSelectLocation(modalRef) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false, windowClass: 'modal_pad'
		};
		this.modalService.open(modalRef, ngbModalOptions).result.then((result) => {

		}, (reason) => {
			if(reason) return;
			this.sendRequsetForFile(this.praticeLocationSeleted);
			debugger;
		});
	}

	exportToPDF() {
		this.loadSpin = true;

		this.subscription.push(
			this.requestService.sendRequest(`case/export-patient-summary`, 'post', REQUEST_SERVERS.kios_api_path, { id: parseInt(this.caseId) })
				// this.requestService
				// 	.sendRequest(
				// 		PatientSummaryUrlsEnum.patient_list_pdf_Url_firstPart_GET + this.caseId + PatientSummaryUrlsEnum.patient_list_pdf_Url_secondPart_GET,
				// 		'POST',
				// 		REQUEST_SERVERS.kios_api_path,
				// 		''
				// 	)
				.subscribe(
					(res: any) => {
						// this.logger.log('case', res);
						this.loadSpin = false;
						debugger;
						let file = res['result']['data'];
						this.praticeLocationList = res['result']['data'];
						if(this.praticeLocationList .length > 1) {
							this.praticeLocationSeleted = [];
							this.openModalForSelectLocation(this.PdfSelectionDialog);							

						}
						else
						{
							let url = 'export/download/' + file[0].id;
							this.subscription.push(this.requestService.sendRequest(url + "?authorization=Bearer" + this.storageData.getToken(), 'get', REQUEST_SERVERS.fd_api_url)
								.subscribe(res => {
									this.toasterService.success(res?.message, 'Success');
								}, 
								err => {
									if(err?.error?.message) {
										this.toasterService.error(err?.error?.message, 'Error');
									}
									else {
										this.toasterService.error(err?.error?.error?.message, 'Error');
									}
								}
							));
						}
					},
					(err) => {
						this.loadSpin = false;
						this.toastrService.error(err.error.error.message, 'Error');
					},
				),
		);
	}

	sendRequsetForFile = (slug : string[]) => {
		this.subscription.push(
			this.requestService.sendRequest(`case/export-patient-summary`, 'post', REQUEST_SERVERS.kios_api_path, { id: parseInt(this.caseId), slugs: slug })
				// this.requestService
				// 	.sendRequest(
				// 		PatientSummaryUrlsEnum.patient_list_pdf_Url_firstPart_GET + this.caseId + PatientSummaryUrlsEnum.patient_list_pdf_Url_secondPart_GET,
				// 		'POST',
				// 		REQUEST_SERVERS.kios_api_path,
				// 		''
				// 	)
				.subscribe(
					(res: any) => {
						this.loadSpin = false;
						let file = res['result']['data'];
						var url = 'export/download/' + file[0].id;
						this.subscription.push(this.requestService.sendRequest(url + "?authorization=Bearer" + this.storageData.getToken(), 'get', REQUEST_SERVERS.fd_api_url)
							.subscribe(res => {
								this.toasterService.success(res?.message, 'Success');
							}, 
							err => {
								if(err?.error?.message) {
									this.toasterService.error(err?.error?.message, 'Error');
								}
								else {
									this.toasterService.error(err?.error?.error?.message, 'Error');
								}
							}
						));
						if(file.length > 1){
							let url = 'export/download/' + file[1].id;
							this.subscription.push(this.requestService.sendRequest(url + "?authorization=Bearer" + this.storageData.getToken(), 'get', REQUEST_SERVERS.fd_api_url)
								.subscribe(res => {
									this.toasterService.success(res?.message, 'Success');
								}, 
								err => {
									if(err?.error?.message) {
										this.toasterService.error(err?.error?.message, 'Error');
									}
									else {
										this.toasterService.error(err?.error?.error?.message, 'Error');
									}
								}
							));
						}
					}));
	}

	openModal = (content): void => {
		let ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc',
		};
		this.modalRef = this.modalService.open(content, ngbModalOptions);
	};

	onSubmitEmailForm(emailForm) {
		if (this.emailForm.valid) {
			this.disableBtn = true;
			this.subscription.push(
				this.fd_services.getPatientSummaryPDF(this.caseId)
					// this.requestService
					// 	.sendRequest(
					// 		PatientSummaryUrlsEnum.patient_list_pdf_Url_firstPart_GET + this.caseId + PatientSummaryUrlsEnum.patient_list_pdf_Url_secondPart_GET,
					// 		'POST',
					// 		REQUEST_SERVERS.kios_api_path,
					// 		''
					// 	)
					.subscribe(
						(res: any) => {
							if (res.statusCode == 200) {
								let ids = [];
								ids.push(res.data.pdf[0].id);
								let requestData = {
									fileIds: ids,
									to: emailForm.to,
									message: emailForm.message,
								};
								this.fd_services.emailDocument(requestData)
									// this.requestService
									// 	.sendRequest(
									// 		documentManagerUrlsEnum.documentManager_email_POST,
									// 		'POST',
									// 		REQUEST_SERVERS.document_mngr_api_path,
									// 		requestData
									// 	)
									.subscribe(
										(res: any) => {
											if (res.status == true) {
												this.emailForm.reset();
												this.modalRef.close();
												this.toasterService.success('Successfully sent', 'Success');
												this.disableBtn = false;
											}
										},
										(err) => {
											this.toasterService.error(err.message, 'Error');
											this.disableBtn = false;
										},
									);
							}
						},
						(err) => {
							this.toasterService.error(err.message, 'Error');
							this.disableBtn = false;
						},
					),
			);
		} else {
			this.fd_services.touchAllFields(this.emailForm);
		}
	}

	onSubmitFaxForm(faxForm) {
		this.disableBtnFax = true;
		// const sdk = new SDK({
		//   // server: SERVER_PRODUCTION, // Optional, default is production server
		//   appKey: this.config.getConfig('appKey'),//'tjxahW1YR7u0ATi_a037Vw',
		//   appSecret: this.config.getConfig('appSecret'),//'jDbSyxalRT-idsNIO2-fQQwXWVcTKdR2WBFqSuOkS83g'
		// });
		// const client = new RingCentralClient(sdk);
		if (this.faxForm.valid) {
			this.subscription.push(
				this.fd_services.getPatientSummaryPDF(this.caseId)
					// this.requestService
					// 	.sendRequest(
					// 		PatientSummaryUrlsEnum.patient_list_pdf_Url_firstPart_GET + this.caseId + PatientSummaryUrlsEnum.patient_list_pdf_Url_secondPart_GET,
					// 		'POST',
					// 		REQUEST_SERVERS.kios_api_path,
					// 		''
					// 	)
					.subscribe(
						(res: any) => {
							if (res.statusCode == 200) {
								// Log into RingCentral
								// sdk.platform().login({
								//   "username": this.config.getConfig('username'),//'qaiser.a@quickbillsmd.com',
								//   "extension": this.config.getConfig('ext'),//'101',
								//   "password": this.config.getConfig('password'),//'quickbills@123'
								// }).then(() => {
								//   console.log("Login success");
								//   let path = res.data.pdf[0].path;
								//   // console.log('ids', ids)
								//   this.faxForm.reset();
								//   this.modalRef.close();
								//   this.toasterService.success('Patient Summary Faxed Successfully', 'Success');
								//   this.disableBtnFax = false;
								//   client.account().extension().fax().post({
								//     to: [{ phoneNumber: faxForm.to }],
								//     faxResolution: 'High'
								//   }, [    // Second argument is an array of attachments, attachment can be string, Blob, node readable stream.
								//       faxForm.message,
								//       // fs.createReadStream(path)   // In node only
								//     ]);
								//   return client.account().get(); // Call RingCentral REST API
								// }).then((accountInfo) => {
								//   console.log("Current account info", accountInfo);
								//   return sdk.platform().logout();	// Logout
								// }).then(() => {
								//   console.log("logout success");
								// }).catch(e => {
								//   console.error("Error occured", e);
								// });
								this.toasterService.success('Successfully sent', 'Success');
								this.modalRef.close();
							}
						},
						(err) => {
							this.toasterService.error(err.message, 'Error');
							this.disableBtnFax = false;
						},
					),
			);
		} else {
			this.fd_services.touchAllFields(this.faxForm);
		}
	}

	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
		// this.logger.log('Patient Summary OnDestroy called');
	}
}
