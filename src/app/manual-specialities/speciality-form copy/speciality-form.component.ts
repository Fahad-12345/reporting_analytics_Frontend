import {
	Component,
	EventEmitter,
	Input,
	OnDestroy,
	OnInit,
	Output,
} from '@angular/core';
import {
	FormBuilder,
	FormGroup,
	Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';

import { FolderModel } from '@appDir/front-desk/documents/Models/FolderModel.Model';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { HBOTUrlEnums } from '@appDir/hbot/HBOTUrlEnums.enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import {
	SignatureListingComponent,
} from '@appDir/shared/signature/components/signature-listing/signature-listing.component';
import { DocTypeEnum } from '@appDir/shared/signature/DocTypeEnum.enum';
import {
	SignatureServiceService,
} from '@appDir/shared/signature/services/signature-service.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { FileUploaderModalComponent } from '../file-uploader-modal/file-uploader-modal.component';
import { ManualSpecialitiesUrlEnum } from '../manual-specialities-url.enum';
import { VisitSession } from '../models/VisitSession.model';
import { MainService } from '@appDir/shared/services/main-service';
import { mapCodesWithFullName, unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';
import { Subscription } from 'rxjs';
@Component({
	selector: 'app-speciality-form',
	templateUrl: './speciality-form.component.html',
	styleUrls: ['./speciality-form.component.scss'],
})
export class SpecialityFormComponent implements OnInit, OnDestroy {
	constructor(
		private fd_services: FDServices,
		private fb: FormBuilder,
		private requestService: RequestService,
		private modalService: NgbModal,
		private toasterService: ToastrService,
		private router: Router,
		private signatureService: SignatureServiceService,
		public mainService:MainService
	) {}

	form: FormGroup;
	templateObj: any;
	visitSession: VisitSession = {} as any;
	doctor_signature: any;
	doctor_signature_listing: any[] = [];
	patient_signature: any;
	patient_signature_listing: any[] = [];
	selectedIcdCodes: any[] = [];
	selectedCPTCode:any[]=[]
	subscription: Subscription[]=[];
	@Input() folder: FolderModel;
	@Output() onFilesUpdated = new EventEmitter();

	ngOnInit() {
		this.getCPT();
		this.getICD();
		this.form = this.fb.group({
			icd_codes: ['', [Validators.required]],
			cpt_codes: ['', [Validators.required]],
			assertion_code: ['', [Validators.required]],
			icd_codes_comment: [''],
			cpt_codes_comment: [''],
			id: [''],
			visit_session_state_id: [''],
		});

		if (!this.mainService.getenableSaveRecordManualSpeciality()){
			this.form.disable();
		}

		
		this.templateObj = JSON.parse(localStorage.getItem('templateObj'));
		console.log('this.templateObj', this.templateObj);
		let {
			case_id,
			patientId,
			doctorId,
			speciality_id,
			appointment_id,
			visitId,
			id,
			checkInTime,
			speciality,
			location_id,
			reading_provider_id,
			cd_image
		} = this.templateObj;

		console.log('hi');
		this.requestService
			.sendRequest(ManualSpecialitiesUrlEnum.createSession, 'post', REQUEST_SERVERS.fd_api_url_vd, {
				case_id,
				patient_id: patientId,
				doctor_id: doctorId,
				speciality_id,
				appointment_id: id,
				appointment_type_id: visitId,
				visit_date: checkInTime,
				facility_location_id: location_id,
				reading_provider:reading_provider_id,
				cd:cd_image?1:cd_image==false?0:null
			})
			.subscribe((data) => {
				this.visitSession = data['result']['data'];
				this.signatureService
					.getSignature(this.visitSession.doctor_id, DocTypeEnum.userSignature)
					.subscribe((data) => {
						console.log('doctor signature', data);
						this.doctor_signature_listing = [
							...this.doctor_signature_listing,
							...data['result']['data'],
						];
					});
				this.signatureService
					.getSignature(this.visitSession.patient_id, DocTypeEnum.userSignature)
					.subscribe((data) => {
						console.log('patient signature', data);
						this.patient_signature_listing = [
							...this.patient_signature_listing,
							...data['result']['data'],
						];
					});

				this.requestService
					.sendRequest(ManualSpecialitiesUrlEnum.getCodes, 'get', REQUEST_SERVERS.fd_api_url_vd, {
						id: this.visitSession.id,
					})
					.subscribe((data) => {
						console.log(data);
						let visitSessionCodes: VisitSession = data['result']['data'];
						debugger;
						this.visitSession.icd_codes = visitSessionCodes.icd_codes.map((code) =>
						 {return {id:code.id,is_editable:code.is_editable}});
						this.visitSession.cpt_codes = visitSessionCodes.cpt_codes.map((code) =>
						{return {id:code.id,is_editable:code.is_editable}});
						this.icd10Codes =
							visitSessionCodes.icd_codes.length > 0
								? mapCodesWithFullName(visitSessionCodes.icd_codes)
								: this.icd10Codes;
						this.codesCPT =
							visitSessionCodes.cpt_codes.length > 0
								? mapCodesWithFullName(visitSessionCodes.cpt_codes)
								: this.codesCPT;
						this.form.patchValue(this.visitSession);
					   this.selectedIcdCodes= this.preSelectedCodes(this.form.value.icd_codes,this.icd10Codes)
					   this.selectedCPTCode= this.preSelectedCodes(this.form.value.cpt_codes,this.codesCPT)

						
					});
			});
	}
	icd10Codes = [];

	searchICD(event) {
		
		var value = event;
	
		this.subscription.push(this.fd_services.searchICDIct(value, 'ICD', 1).subscribe((data) => {
			this.icd10Codes = mapCodesWithFullName(data['result']['data']);
			console.log(this.icd10Codes);
		}));
	}

	codesCPT = [];
	searchCPT(value:string) {
		var val =value
		console.log(val);
		this.subscription.push(this.fd_services.searchICDIct(val, 'CPT', 2).subscribe((data) => {
			this.codesCPT = mapCodesWithFullName(data['result']['data']);
		}));
	}
	disableBtn: boolean = false;

	update(visit_session_state_id) {
		debugger;
		this.form.patchValue(visit_session_state_id);
		this.disableBtn = true;
		let params = this.form.value; 
		params['warning'] = true;
		this.requestService
			.sendRequest(
				ManualSpecialitiesUrlEnum.updateSession,
				'put',
				REQUEST_SERVERS.fd_api_url_vd,
				params
			)
			.subscribe(
				(data) => {
					console.log(data);
					this.signatureService
						.specialtyCreateSignature(
							this.visitSession.id,
							this.patient_signature && this.patient_signature.signature_file
								? this.patient_signature.signature_file
								: null,
							'signature.png',
							this.doctor_signature && this.doctor_signature.signature_file
								? this.doctor_signature.signature_file
								: null,
							'signature.png',
							this.visitSession['patient_signature_id'],
							this.visitSession['doctor_signature_id'],
						)
						.subscribe(
							(data) => {
								this.disableBtn = false;
								this.toasterService.success('Successfully Updated', 'Success');
								// this.router.navigate(['/scheduler-front-desk/doctor-calendar']);
							},
							(err) => (this.disableBtn = true),
						);
				},
				(err) => (this.disableBtn = true),
			);
	}

	onFileChange(event) {
		console.log(event);
		if (event.target.files) {
			const files = event.target.files;
			if (!this.areFilesValid(files)) {
				this.toasterService.error(`Only files with extension JPG, JPEG, PNG or PDF are allowed.`);
				return;
			}
			let { case_id, speciality_id, speciality, location_id } = this.templateObj;
			let modalRef = this.modalService.open(FileUploaderModalComponent);
			modalRef.componentInstance.case_id = case_id;
			modalRef.componentInstance.files = event.target.files;
			modalRef.componentInstance.specialty_name = speciality;
			modalRef.componentInstance.speciality_id = speciality_id;
			modalRef.componentInstance.appointment_location_id = location_id;
			modalRef.componentInstance.visit_session_id=this.visitSession.id
			modalRef.result.then((_) => {
				// ;
				this.onFilesUpdated.emit();
				event.target.value = '';
			});
		}
	}
	selectedICDCodes(params) {
		debugger;
		console.log(params)
		let selectedIds = [];
		params.forEach((element) => {
			selectedIds.push({id :element.id,
				is_editable:element.is_editable || true
			});
			
		});
		this.form.patchValue({ icd_codes: selectedIds });
	}
	selectedCPTCodes(params) {
		debugger;
		console.log(params)
		let selectedIds = [];
		params.forEach((element) => {
			selectedIds.push({id :element.id,
				is_editable:element.is_editable || true
			});
		});
		this.form.patchValue({ cpt_codes: selectedIds });
		
	}

	areFilesValid(files) {
		for (const file of files) {
			let ext = file.type.split('/');
			switch (ext[1] ? ext[1].toLocaleLowerCase() : '') {
				case 'jpg':
				case 'jpeg':
				case 'png':
				case 'pdf':
					break;
				default:
					return false;
			}
		}
		return true;
	}

	getCPT() {
		let query = {
			filter: true,
			order: 'ASC',
			per_page: 10,
			page: 1,
			pagination: 1,
			order_by: name,
			type: 'CPT',
			code_type_id: 2,
		};
		this.requestService
			.sendRequest(HBOTUrlEnums.GETCODES, 'GET', REQUEST_SERVERS.fd_api_url, query)
			.subscribe(
				(data: any) => {
					if (data.status) {
						// this.loadSpin = false;
						this.codesCPT = data.result ? mapCodesWithFullName(data.result.data) : [];
						// getFieldControlByName(this.fieldConfig, 'cpt_codes').items = this.codesCPT
						// this.ICDPage.totalElements = data.result.total;
					}
				},
				(err) => {
					// this.loadSpin = false;
					// const str = parseHttpErrorResponseObject(err.error.message);
					// this.toastrService.error(str);
				},
			);
	}
	getICD() {
		let query = {
			filter: true,
			order: 'ASC',
			per_page: 10,
			page: 1,
			pagination: 1,
			order_by: name,
			type: 'ICD',
			code_type_id: 1,
		};
		this.requestService
			.sendRequest(HBOTUrlEnums.GETCODES, 'GET', REQUEST_SERVERS.fd_api_url, query)
			.subscribe((data: any) => {
				if (data.status) {
					this.icd10Codes = data.result ? mapCodesWithFullName(data.result.data) : [];
				}
			});
	}
	chooseSignatures() {
		// [selectable]="true" [signatures]="doctor_signature_listing"
		let modalRef = this.modalService.open(SignatureListingComponent);
		modalRef.componentInstance.selectable = true;
		modalRef.componentInstance.deletable = false;
		modalRef.componentInstance.selectedId = this.visitSession['doctor_signature_id'];
		modalRef.componentInstance.signatures = this.doctor_signature_listing;
		modalRef.componentInstance.onIdSelect = (data) => {
			console.log(data);
			modalRef.close();
			this.visitSession['doctor_signature_id'] = data;
		};
	}

	preSelectedCodes(selectedFormValue,codeType):any{
		debugger;
		let selectedCodes=[]
		selectedFormValue.forEach((codeId) => {
			codeType.forEach((element) => {
				if (element.id === codeId.id) {
					selectedCodes.push(element);
				}
			});
		});
		return selectedCodes
		
	}

	back() {
		this.router.navigate(['/scheduler-front-desk/doctor-calendar'])
	  }
	ngOnDestroy(): void {
		unSubAllPrevious(this.subscription);
	}
}
