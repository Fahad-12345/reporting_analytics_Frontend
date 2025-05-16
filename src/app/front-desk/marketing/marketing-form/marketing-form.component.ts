import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { FieldConfig } from '@appDir/shared/dynamic-form/models/fieldConfig.model';
import { DivClass } from '@appDir/shared/dynamic-form/models/DivClass.class';
import { SelectClass } from '@appDir/shared/dynamic-form/models/SelectClass.class';
import { InputClass } from '@appDir/shared/dynamic-form/models/InputClass.class';
import { InputTypes } from '@appDir/shared/dynamic-form/constants/InputTypes.enum';
import { ButtonClass } from '@appDir/shared/dynamic-form/models/ButtonClass.class';
import { ButtonTypes } from '@appDir/shared/dynamic-form/constants/ButtonTypes.enum';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';
import { Options } from '@appDir/shared/dynamic-form/models/options.model';
import { DynamicFormComponent } from '@appDir/shared/dynamic-form/components/dynamic-form/dynamic-form.component';
import { FormGroup } from '@angular/forms';
import { getFieldControlByName } from '@appDir/shared/dynamic-form/helper';
import { DynamicControl } from '@appDir/shared/dynamic-form/models/DynamicControl.class';
import { ToastrService } from 'ngx-toastr';
import { RequestService } from '@appDir/shared/services/request.service';
import { Config } from '@appDir/config/config';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { StorageData, HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
// import { documentManagerUrlsEnum } from '@appDir/shared/components/document-manager/document-manager-Urls-enum';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { KioskModalComponent } from '@appDir/front-desk/masters/template-master/components/kiosk-modal/kiosk-modal.component';
import { documentManagerUrlsEnum } from '@appDir/front-desk/documents/document-manager-Urls-enum';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';

@Component({
	selector: 'app-marketing-form',
	templateUrl: './marketing-form.component.html',
	styleUrls: ['./marketing-form.component.scss']
})
export class MarketingFormComponent extends PermissionComponent implements OnInit {

	constructor(aclService: AclService,protected router: Router, public location: Location, private caseFlowService: CaseFlowServiceService,
		 public route: ActivatedRoute, private toasterService: ToastrService,
		  protected requestService: RequestService, private config: Config, private storageData: StorageData,
		  private customDiallogService : CustomDiallogService, private toastrService: ToastrService, private modalService: NgbModal)
		  { 
			  super(aclService)
			}

	fieldConfig: FieldConfig[] = []
	referred_by: Options[] = []
	advertisement: Options[] = []
	caseId: any
	@ViewChild(DynamicFormComponent) component: DynamicFormComponent

	form: FormGroup
	ngAfterViewInit() {
		this.form = this.component.form
		this.form.patchValue({})
		this.caseFlowService.getCase(this.caseId).subscribe(res => {
			let data = res['result']
			this.form.patchValue({
				referred_by_id: data['data']['advertisement'].referred_by_id,
				advertisement_id: data['data']['advertisement'].advertisement_id,
				other_advertisement: data['data']['advertisement'].other_advertisement,
				id: data['data']['advertisement'].id,
				referral_name: data['data']['advertisement'].referral_name
			})

		})
		this.caseFlowService.getCaseMasters().subscribe(data => {
			this.referred_by = data['result']['data'].refered_by.map(referal => {
				return { label: referal.name, value: referal.id, name: referal.name } as Options
			})
			getFieldControlByName(this.fieldConfig, 'referred_by_id').options = this.referred_by;
			this.advertisement = data['result']['data'].advertisement.map(ad => {
				return { name: ad.name, label: ad.name, value: ad.id } as Options
			})
			getFieldControlByName(this.fieldConfig, 'advertisement_id').options = this.advertisement
		})
		this.bindAdvertisementId()
		this.bindReferredBy();
		if(!this.aclService.hasPermission(this.userPermissions.patient_case_marketing_edit))
	{
		this.form.disable();
		this.hideButtons();
	}

	}


	bindReferredBy() {
		let other_control = getFieldControlByName(this.fieldConfig, 'referral_name')
		this.form.controls['referred_by_id'].valueChanges.subscribe(value => {
			if (value) {
				other_control.classes = other_control.classes.filter(className => className != 'hidden')
			} else {
				other_control.classes.push('hidden')
			}
		})
	}
	hideButtons() {
		this.form.disabled ? this.fieldConfig[1].classes.push('hidden') : this.fieldConfig[1].classes = this.fieldConfig[1].classes.filter(className => className != 'hidden')
	  }

	bindAdvertisementId() {
		let other_control = getFieldControlByName(this.fieldConfig, 'other_advertisement')

		this.form.controls['advertisement_id'].valueChanges.subscribe(value => {
			if (value == 6) {

				other_control.classes = other_control.classes.filter(className => className != 'hidden')
			} else {
				other_control.classes.push('hidden')
			}
		})
	}
	ngOnInit() {
		this.route.snapshot.pathFromRoot.forEach((path) => {
			if (path && path.params && path.params.caseId) {
				if (!this.caseId) {
					this.caseId = path.params.caseId;
				}
			}
		});
		// let id = this.route.snapshot.params['caseId']
		this.fieldConfig = [
			new DivClass([
				new DynamicControl('id', ''),
				new SelectClass('Referred By', 'referred_by_id', this.referred_by, null, [], ['col-sm-6']),
				new InputClass('Enter Name', 'referral_name', InputTypes.text, null, [], '', ['col-sm-6', 'hidden']),
				new SelectClass('Advertisement', 'advertisement_id', this.advertisement, null, [], ['col-sm-6']),
				new InputClass('Please specify', 'other_advertisement', InputTypes.text, null, [], '', ['col-sm-6', 'hidden']),
			], ['row']),
			new DivClass([
				new ButtonClass('Back', ['btn', 'btn-primary', 'float-right w-100 mt-1 mb-2 mb-sm-0'], ButtonTypes.button, this.back.bind(this), { icon: 'icon-left-arrow me-2', button_classes: [''] }),
				new ButtonClass('Save & Continue', ['btn', 'btn-success', 'btn-block mt-1 mb-2 mb-sm-0'], ButtonTypes.submit, null, { icon: 'icon-save-continue me-2', button_classes: [''] })
			], ['row', 'form-btn', 'justify-content-center'])
		]


	}
	back() {
		this.location.back()
	}
	submit(form?) {
		debugger;
		if(this.caseFlowService.shouldShowDocument())
		{
			if( this.aclService.hasPermission(this.userPermissions.patient_case_list_docs_push_to_kiosk))
			{
				this.customDiallogService.confirm(`Case Id: ${this.caseId}`, `Do you want to sign documents?`,'Yes','No, Sign Later')
				.then((confirmed) => {
					if (confirmed){
						// this.alertService.create('info', 'Your documents are pushed to KIOSK. You can sign them their against case id: ' + this.caseId + ' or your personal information', 'Success', { duration: 15000 })
						// this.toasterService.info('Your documents are pushed to KIOSK. You can sign them their against case id: ' + this.caseId + ' or your personal information', 'Info')
						this.caseFlowService.loadSpin = true;
						this.caseFlowService.updateCase(this.caseId, { advertisement: form }).subscribe(data => {
							this.toasterService.success('Successfully Updated', 'Success');
							this.caseFlowService.loadSpin = true;
						this.requestService.sendRequest('session-pdf/pdf-list-data', 'post', REQUEST_SERVERS.kios_api_path, { case_id: this.caseId }).subscribe(data => {
							let files = data['result']['data'] as any[]
							let requestData = {
								"ids": files.map(files => files.id),
								"case_id": this.caseId
							}
							this.requestService.sendRequest(documentManagerUrlsEnum.DocumentManager_push_to_kiosk_POST,
								'POST',
								REQUEST_SERVERS.document_mngr_api_path, requestData).subscribe(data => {
		
									//               case_id: "921"
									// pin: 1828364073
									let pin = data['result']['data'].pin;
									let modalRef = this.modalService.open(KioskModalComponent)
									modalRef.componentInstance.pinNumber = pin
									modalRef.componentInstance.caseId = this.caseId
									modalRef.result.then(() => {
										this.router.navigate([`/front-desk/cases/edit/${this.caseId}/patient/patient_summary`])
									})
								
		
								})
		
							// let files: any[] = data['result'].data
							// files.forEach(file => {
							//   var url = this.config.getConfig('document_mngr_api_path') + 'download/' + file.id;
							//   window.open(`${url}&&authorization=Bearer ${this.storageData.getToken()}`);
							// })
							this.caseFlowService.loadSpin = false;
						},err=>{
							this.caseFlowService.loadSpin = false;
						})
							
						}, err => {
							this.toasterService.error(err.message, 'Error')
							this.caseFlowService.loadSpin = false;})
						
						// var url = this.config.getConfig('document_mngr_api_path') + 'download/' + id;
						// window.open(`${url}&&authorization=Bearer ${this.storageData.getToken()}`);
		
					}else{
						
						this.caseFlowService.loadSpin = true;
						this.caseFlowService.updateCase(this.caseId, { advertisement: form }).subscribe(data => {
							this.toasterService.success('Successfully Updated', 'Success');
							this.caseFlowService.loadSpin = true;
							this.requestService.sendRequest('session-pdf/pdf-list-data', 'post', REQUEST_SERVERS.kios_api_path, { case_id: this.caseId }).subscribe(data => {

								this.router.navigate([`/front-desk/cases/edit/${this.caseId}/document`])
							
			
								// let files: any[] = data['result'].data
								// files.forEach(file => {
								//   var url = this.config.getConfig('document_mngr_api_path') + 'download/' + file.id;
								//   window.open(`${url}&&authorization=Bearer ${this.storageData.getToken()}`);
								// })
								this.caseFlowService.loadSpin = false;
							},err=>{
								this.caseFlowService.loadSpin = false;
							})
						}, err => {
							this.toasterService.error(err.message, 'Error');
							this.caseFlowService.loadSpin = false;
						})
					}
				})
				.catch();
			}

			else
			{
				this.caseFlowService.loadSpin = true;
				this.caseFlowService.updateCase(this.caseId, { advertisement: form }).subscribe(data => {
					this.toasterService.success('Successfully Updated', 'Success');
					this.caseFlowService.loadSpin = true;
					this.requestService.sendRequest('session-pdf/pdf-list-data', 'post', REQUEST_SERVERS.kios_api_path, { case_id: this.caseId }).subscribe(data => {
						this.router.navigate([`/front-desk/cases/edit/${this.caseId}/document`])
					
						// let files: any[] = data['result'].data
						// files.forEach(file => {
						//   var url = this.config.getConfig('document_mngr_api_path') + 'download/' + file.id;
						//   window.open(`${url}&&authorization=Bearer ${this.storageData.getToken()}`);
						// })
						this.caseFlowService.loadSpin = false;
					})

				}, err => {
					this.toasterService.error(err.message, 'Error');
					this.caseFlowService.loadSpin = false;
				})
						
			}
			
		}
		else
		{
			this.caseFlowService.loadSpin = true;
			this.caseFlowService.updateCase(this.caseId, { advertisement: form }).subscribe(data => {
				this.toasterService.success('Successfully Updated', 'Success')

				this.caseFlowService.goToNextStep();
			}, err => {
				this.toasterService.error(err.message, 'Error');
				this.caseFlowService.loadSpin = false;
			})
				
			
		}

		// this.confirmation_service.create(`Case Id: ${this.caseId}`, `Do you want to sign documents?`, { confirmText: 'Yes', declineText: 'No, Sign Later' }).subscribe(resolve => {
		// 	if (resolve.resolved) {

		// 		// this.alertService.create('info', 'Your documents are pushed to KIOSK. You can sign them their against case id: ' + this.caseId + ' or your personal information', 'Success', { duration: 15000 })

		// 		// this.toasterService.info('Your documents are pushed to KIOSK. You can sign them their against case id: ' + this.caseId + ' or your personal information', 'Info')
		// 		this.caseFlowService.loadSpin = true;
		// 		this.requestService.sendRequest('session-pdf/pdf-list-data', 'post', REQUEST_SERVERS.kios_api_path, { case_id: this.caseId }).subscribe(data => {
		// 			console.log(data)
		// 			let files = data['result']['data'] as any[]
		// 			let requestData = {
		// 				"ids": files.map(files => files.id),
		// 				"case_id": this.caseId
		// 			}
		// 			this.requestService.sendRequest(documentManagerUrlsEnum.DocumentManager_push_to_kiosk_POST,
		// 				'POST',
		// 				REQUEST_SERVERS.document_mngr_api_path, requestData).subscribe(data => {

		// 					console.log(data)
		// 					//               case_id: "921"
		// 					// pin: 1828364073
		// 					let pin = data['result']['data'].pin;
		// 					let modalRef = this.modalService.open(KioskModalComponent)
		// 					modalRef.componentInstance.pinNumber = pin
		// 					modalRef.componentInstance.caseId = this.caseId
		// 					modalRef.result.then(() => {
		// 						this.router.navigate([`/front-desk/cases/edit/${this.caseId}/patient/patient_summary`])
		// 					})

		// 				})

		// 			// let files: any[] = data['result'].data
		// 			// files.forEach(file => {
		// 			//   var url = this.config.getConfig('document_mngr_api_path') + 'download/' + file.id;
		// 			//   window.open(`${url}&&authorization=Bearer ${this.storageData.getToken()}`);
		// 			// })
		// 			this.caseFlowService.loadSpin = false;
		// 		})
		// 		// var url = this.config.getConfig('document_mngr_api_path') + 'download/' + id;
		// 		// window.open(`${url}&&authorization=Bearer ${this.storageData.getToken()}`);

		// 	} else {
		// 		// this.confirmation_service.create('Success', 'Your documents are pushed to KIOSK. You can sign them their against case id: ' + this.caseId, { confirmText: 'Yes', declineText: '' }).subscribe(resolve => {

		// 		this.caseFlowService.loadSpin = true;
		// 		this.requestService.sendRequest('/session-pdf/pdf-list-data', 'post', REQUEST_SERVERS.kios_api_path, { case_id: this.caseId }).subscribe(data => {
		// 			console.log(data)
		// 			this.router.navigate([`/front-desk/cases/edit/${this.caseId}/document`])

		// 			// let files: any[] = data['result'].data
		// 			// files.forEach(file => {
		// 			//   var url = this.config.getConfig('document_mngr_api_path') + 'download/' + file.id;
		// 			//   window.open(`${url}&&authorization=Bearer ${this.storageData.getToken()}`);
		// 			// })
		// 			this.caseFlowService.loadSpin = false;
		// 		})


		// 	}
		// })

		// this.caseFlowService.updateCase(this.caseId, { advertisement: form }).subscribe(data => {
		// 	console.log(data)
		// 	// this.toasterService.success('Successfully Updated', 'Success')
		// }, err => this.toasterService.error(err.message, 'Error'))
	}


}
