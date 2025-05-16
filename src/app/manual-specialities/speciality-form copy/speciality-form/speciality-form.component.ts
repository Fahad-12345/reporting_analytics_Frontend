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

import { MainService } from '@appDir/shared/services/main-service';
import { VisitSession } from '@appDir/manual-specialities/models/VisitSession.model';
import { ManualSpecialitiesUrlEnum } from '@appDir/manual-specialities/manual-specialities-url.enum';
import { FileUploaderModalComponent } from '@appDir/manual-specialities/file-uploader-modal/file-uploader-modal.component';
import { Page } from '@appDir/front-desk/models/page';
import { convertDateTimeForSending, mapCodesWithFullName, unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { SubjectService } from '@appDir/shared/modules/doctor-calendar/subject.service';
import { MriEnum } from '@appDir/front-desk/billing/mri-enum';
import { AppointmentUrlsEnum } from '@appDir/shared/modules/appointment/appointment-urls-enum';
import { CalendarMonthService } from '@appDir/shared/modules/doctor-calendar/utils/my-calendar/src/modules/month/calendar-month.service';
import { AppointmentModalDialogService } from '@appDir/shared/modules/doctor-calendar/utils/my-calendar/src/modules/month/appointment-modal-dialog.service';
import { DoctorCalendarUrlsEnum } from '@appDir/shared/modules/doctor-calendar/doctor-calendar-urls-enum';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
@Component({
	selector: 'app-speciality-form-copy',
	templateUrl: './speciality-form.component.html',
	styleUrls: ['./speciality-form.component.scss'],
})
export class SpecialityFormCopyComponent implements OnInit, OnDestroy {
	constructor(
		private fd_services: FDServices,
		private fb: FormBuilder,
		private requestService: RequestService,
		private modalService: NgbModal,
		private toasterService: ToastrService,
		private router: Router,
		private signatureService: SignatureServiceService,
		public mainService:MainService,
		private localStorage: LocalStorage,
		public subject: SubjectService
		,protected storageData: StorageData,
		public monthService: CalendarMonthService,
        public appModelDialogService:AppointmentModalDialogService
	) {}
	public appointmentdetails :any;
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
	icdPage:Page = new Page();
	searchValue: string;
	cptPage:Page = new Page();
	searchValueCpt: string;
	multipleCPtallow:Boolean;
	showAssertionCode: boolean = false;
	dialogMessage = 'This action will overwrite the selected CPT Code over the existing one.';
	public apptdata:any;
	fromRoute: string;

	ngOnInit() {
		this.fromRoute = localStorage.getItem('routeFrom');
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
		this.apptdata =  this.mainService.getCurrentEvaluedApptAData();
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
			template_id,
			provider_id,
			technician_id,
			template_type,
			reading_provider_id,
			cd_image
		} = this.templateObj;
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
				template_id:template_id,
				provider_id:provider_id,
				technician_id:technician_id,
				template_type:template_type,
				reading_provider:reading_provider_id,
				cd:cd_image?1:cd_image==false?0:null,
			})
			.subscribe((data) => {
				console.log(data);
				this.visitSession = data['result']['data'];
				console.log(this.visitSession);
				// this.patient_signature_listing = this.visitSession['patient_signature_id'] ? [{ id: this.visitSession['patient_signature_id'] }] : []
				// this.doctor_signature_listing = this.visitSession['doctor_signature_id'] ? [{ id: this.visitSession['doctor_signature_id'] }] : []
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
						this.checkSpeciality();
					   this.selectedIcdCodes= this.preSelectedCodes(this.form.value.icd_codes,this.icd10Codes)
					   this.selectedCPTCode= this.preSelectedCodes(this.form.value.cpt_codes,this.codesCPT)
						if(this.selectedCPTCode && this.selectedCPTCode.length == 0) {
							this.getCPTCodeAddedThroughAppoinment();
						}
					});
			});
		
	}
	icd10Codes = [];
checkSpeciality(){
	this.multipleCPtallow = this.visitSession['speciality_visit_types'] && this.visitSession['speciality_visit_types']['allow_multiple_cpt_codes'] == 1 ? true :false;
	let visitTypeSlug = this.visitSession['speciality_visit_types'] && this.visitSession['speciality_visit_types']['appointment_type']&& this.visitSession['speciality_visit_types']['appointment_type'].length && this.visitSession['speciality_visit_types']['appointment_type'][0] &&this.visitSession['speciality_visit_types']['appointment_type'][0]['slug'];
	if((visitTypeSlug === MriEnum.XRAY || visitTypeSlug === MriEnum.MRI || visitTypeSlug === MriEnum.CTScan) && (this.visitSession['speciality']&&this.visitSession['speciality']['speciality_key']==MriEnum.speciality_key)){
		this.showAssertionCode = true;
	}else{
		this.showAssertionCode = false;
		this.form.removeControl("assertion_code")
	}
}
	searchICD(event, searchType ) {
		
		if(searchType === 'search'){
			this.icd10Codes = [];
			this.icdPage.pageNumber = 1;
			this.searchValue = event; 
		}
	
		this.subscription.push(this.fd_services.searchICDIct(this.searchValue, 'ICD', 1, this.icdPage.pageNumber).subscribe((data) => {
			let result;
			if(searchType === 'search'){
				this.icd10Codes = [];
				this.icdPage.pageNumber = 1;
				this.searchValue = event; 
			}
			result = mapCodesWithFullName(data['result']['data']);
			this.icd10Codes = [...this.icd10Codes, ...result];
		}));
	}

	codesCPT = [];
	codesCPT_appointmentModal = [];
	searchCPT(value:string, searchType) {
		if(searchType === 'search'){
			this.codesCPT = [];
			this.cptPage.pageNumber = 1;
			this.searchValueCpt = value; 
		}
	
		this.subscription.push(this.fd_services.searchICDIct(this.searchValueCpt, 'CPT', 2, this.cptPage.pageNumber).subscribe((data) => {
			let result;
			if(searchType === 'search'){
				this.codesCPT = [];
				this.icdPage.pageNumber = 1;
				this.searchValueCpt = value; 
			}
			result = mapCodesWithFullName(data['result']['data']);
			this.codesCPT = [...this.codesCPT, ...result];
		}));
	}
	disableBtn: boolean = false;

	update(visit_session_state_id) {
		debugger;
		if(this.form.value && !this.form.value.id){
			this.toasterService.error('Sorry! visit session can not be created against given appointment and case', 'Error');
			return;
		}
		 if (visit_session_state_id ===2 &&(this.form.invalid || !(this.folder && this.folder.files && this.folder.files.length))){
			if(this.showAssertionCode){
				this.toasterService.error('At least 1 Document , Assertion Code, ICD and CPT Code are required',"Error");
			}else{
				this.toasterService.error('At least 1 Document , ICD and CPT Code are required',"Error");
			}
			return false;
		 }

		this.form.patchValue({visit_session_state_id:visit_session_state_id});
		this.disableBtn = true;
		let params = this.form.value;
		params ['warning'] = true;
		params['finalize'] = true;

		visit_session_state_id === 2 ? params ['can_finalize'] = true : params ['can_finalize'] = false;

		this.requestService
			.sendRequest(
				ManualSpecialitiesUrlEnum.updateSession,
				'put',
				REQUEST_SERVERS.fd_api_url_vd,
				params,

			)
			.subscribe(
				(data) => {
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
								if(visit_session_state_id != 2 && this.apptdata?.evalFrom == 'monthview'){
									this.navigateBackToSameState();
								}else{
									this.fromRoute === 'provider_calendar' ?
              							this.router.navigate(['/scheduler-front-desk/doctor-calendar']) : this.router.navigate(['/front-desk/cases/edit/' + this.fromRoute + '/scheduler']);
								}
							},
							(err) => (this.disableBtn = true),
						);
				},
				(err) => (this.disableBtn = false),
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

	refreshDocument(event)
	{
		if(event)
		{
			this.onFilesUpdated.emit();
		}
	}
	selectedICDCodes(params) {
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
	getCPTCodeAddedThroughAppoinment() {
		let query = {
			appointment_id: this.templateObj && this.templateObj.id ? this.templateObj.id : null
		};
		this.requestService
			.sendRequest(HBOTUrlEnums.GET_CPT_CODES_APPOINTMENT_MODAL, 'GET', REQUEST_SERVERS.fd_api_url, query)
			.subscribe(
				(data: any) => {
					if (data.status) {
						let selectedIds = [];
						this.codesCPT_appointmentModal = data.result && data.result.data && data.result.data['cpt_codes'] ? mapCodesWithFullName(data.result.data['cpt_codes']) : []
						this.selectedCPTCode = this.codesCPT_appointmentModal;
						this.codesCPT_appointmentModal.forEach((element) => {
							selectedIds.push({id :element.id,
								is_editable:element.is_editable || true
							});
						});
						this.form.patchValue({ cpt_codes: selectedIds });
					}
				},
				(err) => {
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

	back(btnClick) {
		// Commnet as not required 
		this.subscription.push(
			this.subject._appointmentDetails.subscribe(app =>{
				this.appointmentdetails = app;
			})
		);
		let app_start_date = new Date(this.apptdata.start).toDateString();
		let current_date = new Date().toDateString();
		this.subscription.push(this.editAppointment(this.apptdata?.appId).subscribe((res)=>{
			//this.apptdata.appointment_status_slug === 'scheduled' || this.apptdata.appointment_status_slug === 'arrived'
			if(this.mainService.getenableSaveRecordManualSpeciality()){
				if((app_start_date == current_date) && (res?.result?.data?.visit_status?.slug == "in_session") && (btnClick == 'exit')){
					this.subscription.push(this.requestService.sendRequest(ManualSpecialitiesUrlEnum.deleteSession, 'post', REQUEST_SERVERS.fd_api_url_vd, {
						data:[
						  {
							appointment_id: this.templateObj.id,
							case_id:this.templateObj.case_id,
							prev_status: this.apptdata.appointment_status_slug
						  }
						]
					  }).subscribe(data => {
						if(this.apptdata?.evalFrom == 'monthview'){
							this.navigateBackToSameState();
						}else{
							this.fromRoute === 'provider_calendar' ?
              					this.router.navigate(['/scheduler-front-desk/doctor-calendar']) : this.router.navigate(['/front-desk/cases/edit/' + this.fromRoute + '/scheduler']);
						}
					  }));
					}else{
						if(this.apptdata?.evalFrom == 'monthview'){
							this.navigateBackToSameState();
						}else{
							this.fromRoute === 'provider_calendar' ?
              					this.router.navigate(['/scheduler-front-desk/doctor-calendar']) : this.router.navigate(['/front-desk/cases/edit/' + this.fromRoute + '/scheduler']);
						}
					}
			}
			else{
				if((app_start_date == current_date) && (res?.result?.data?.visit_status?.slug == "in_session") && (btnClick == 'back')){
					this.subscription.push(this.requestService.sendRequest(ManualSpecialitiesUrlEnum.deleteSession, 'post', REQUEST_SERVERS.fd_api_url_vd, {
						data:[
						  {
							appointment_id: this.templateObj.id,
							case_id:this.templateObj.case_id
						  }
						]
					  }).subscribe(data => {
						if(this.apptdata?.evalFrom == 'monthview'){
							this.navigateBackToSameState();
						}else{
							this.router.navigate(['/scheduler-front-desk/doctor-calendar'])
						}
					  }));
					}else{
						if(this.apptdata?.evalFrom == 'monthview'){
							this.navigateBackToSameState();
						}else{
							this.router.navigate(['/scheduler-front-desk/doctor-calendar'])
						}
					}
			}
		}))
	  }

	  onScroll(){
		this.icdPage.pageNumber += 1;
		this.searchICD(this.searchValue, 'scrollDown');
	  }
	  onScrollCpt(){
		this.cptPage.pageNumber += 1;
		this.searchCPT(this.searchValueCpt, 'scrollDown');
	  }
	  ngOnDestroy(){
		unSubAllPrevious(this.subscription);
	  }
	  navigateBackToSameState() {
		let date = new Date(this.apptdata.start);
			let st = new Date(date);
			st.setMinutes(0);
			st.setHours(0);
			st.setSeconds(0);
			let ed = new Date(date);
			ed.setMinutes(59);
			ed.setHours(23);
			ed.setSeconds(59);
		if(this.apptdata.available_doctor_is_provider_assignment){
			this.subscription.push(this.requestService
		  .sendRequest(
			DoctorCalendarUrlsEnum.getAppointmentsofDoctor,
			'POST',
			REQUEST_SERVERS.schedulerApiUrl1,
			{
			  start_date: convertDateTimeForSending(this.storageData,st),
			  end_date: convertDateTimeForSending(this.storageData,ed),
			  facility_location_ids: [this.apptdata.facility_id],
			  doctor_ids:  [this.apptdata.doctor_id],
			  speciality_ids: [this.apptdata.speciality_id],
			  date_list_id: this.apptdata.date_list_id
			},
	
		  ).subscribe(res => {
			  if(res && res['result'] && res['result']['data']&& res['result']['data']['facility'] && res['result']['data']['facility'].length){
			let appotdata = res['result']['data']['facility'] && res['result']['data']['facility'][0];
			  this.openAppointments({appointments : appotdata['availibilities'][0]['appointments'],
			  date_list_id:appotdata['availibilities'][0]['date_list_id'],
			  facility_id:appotdata['availibilities'][0]['facility_location_id'],
			  color:appotdata['color'],
			  facility_name :appotdata['facility_name'],
			  facility_qualifier:appotdata['facility_qualifier'],
			  doctor_id:appotdata['availibilities'][0]['doctor_id'],
			});
		}else{
		  this.openAppointments({appointments : []})
		}
	  }));
		}else{
			this.subscription.push(this.requestService
				.sendRequest(
				  DoctorCalendarUrlsEnum.getSpecialityAppoinments,
				  'POST',
				  REQUEST_SERVERS.schedulerApiUrl1,
				  {
					start_date: convertDateTimeForSending(this.storageData,st),
					end_date: convertDateTimeForSending(this.storageData,ed),
					facility_location_ids: [this.apptdata.facility_id],
					speciality_ids: [this.apptdata.speciality_id],
					date_list_id: this.apptdata.date_list_id
				  },
				).subscribe(res => {
				  if(res && res['result'] && res['result']['data']&& res['result']['data'][0]['availibilities']){
					let appotdata = res['result']['data'].length && res['result']['data'][0];
				  this.openAppointments({appointments : appotdata['availibilities'][0]['appointments'],
				  date_list_id:appotdata['availibilities'][0]['date_list_id'],
				  facility_id:appotdata['availibilities'][0]['facility_location_id'],
				  color:appotdata['color'],
				  facility_name :appotdata['facility_name'],
				  facility_qualifier:appotdata['facility_qualifier'],
				  doctor_id:appotdata['availibilities'][0]['doctor_id'],
				  });
				}else{
				this.openAppointments({appointments : []})
				}
			}));
		}
	  }
	  openAppointments(appointment) {
		this.monthService.appointments = { ...appointment };
		this.appModelDialogService.openDialog().result.then(res => {
		  this.mainService.setOneDayAppointmentsData(res);
		});
		this.router.navigate(['/scheduler-front-desk/doctor-calendar'])
	  }
	  public editAppointment(appId) {
		return this.requestService
			.sendRequest(
			AppointmentUrlsEnum.getAppointmentDetails,
			'GET',
			REQUEST_SERVERS.schedulerApiUrl,
			{id:appId}
		)
	}
}
