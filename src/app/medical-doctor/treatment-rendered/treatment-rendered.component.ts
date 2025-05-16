import { SelectionModel } from '@angular/cdk/collections';
import {
	Component,
	OnInit,
	ViewChild,
} from '@angular/core';
import {
	FormArray,
	FormBuilder,
	FormControl,
} from '@angular/forms';
import { Router } from '@angular/router';

import {
	TabDirective,
	TabsetComponent,
} from 'ngx-bootstrap/tabs';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

import { Config } from '@appDir/config/config';
import {
	DocumentManagerServiceService,
} from '@appDir/front-desk/documents/services/document-manager-service.service';
import {
	HttpSuccessResponse,
	StorageData,
} from '@appDir/pages/content-pages/login/user.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import {
	SignatureListingComponent,
} from '@appDir/shared/signature/components/signature-listing/signature-listing.component';
import { DocTypeEnum } from '@appDir/shared/signature/DocTypeEnum.enum';
import {
	SignatureServiceService,
} from '@appDir/shared/signature/services/signature-service.service';
import {
	NgbModal,
	NgbModalOptions,
	NgbModalRef,
} from '@ng-bootstrap/ng-bootstrap';
import { Logger } from '@nsalaun/ng-logger';
import { MainService } from '@shared/services/main-service';

import { Code } from '../diagnostic-impression/model/code';
import { SeededInfo } from '../md-shared/seededInfo';
import { MedicalDoctorAbstract } from '../medical-doctor-abstract/medical-doctor-abstract';
import { medicalDoctorUrlsEnum } from '../medical-doctor-URls-enum';
import { MedicalSession } from '../models/common/commonModels';
import { MdLinks } from '../models/panel/model/md-links';
import { planOfCareTabs } from '../models/panel/panel';
import { CarryForwardService } from '../services/carry-forward/carry-forward.service';
import { MDService } from '../services/md/medical-doctor.service';
import { Reports } from './model/report';
import { convertDateTimeForSending, getObjectChildValue, mapCodesWithFullName, unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';
import { HBOTUrlEnums } from '@appDir/hbot/HBOTUrlEnums.enum';
import { DoctorCalendarUrlsEnum } from '@appDir/shared/modules/doctor-calendar/doctor-calendar-urls-enum';
import { CalendarMonthService } from '@appDir/shared/modules/doctor-calendar/utils/my-calendar/src/modules/month/calendar-month.service';
import { AppointmentModalDialogService } from '@appDir/shared/modules/doctor-calendar/utils/my-calendar/src/modules/month/appointment-modal-dialog.service';

@Component({
	selector: 'app-treatment-rendered',
	templateUrl: './treatment-rendered.component.html',
	styleUrls: ['./treatment-rendered.component.scss'],
})
export class TreatmentRenderedComponent extends MedicalDoctorAbstract implements OnInit {
	public favoriteCodes: Code[] = [];
	public currentScreen = 'treatment_rendered';
	public cpt_codes: FormArray=new FormArray([]);
	subscription: Subscription;
	sub: Subscription[] = [];
	visitSessionId: number;
	public tabLinks: MdLinks[];
	public modalRef: NgbModalRef;
	public treatmentRenderedFiles: Reports = new Reports();
	public selection = new SelectionModel<any>(true, []);
	// public allTabSelection = new SelectionModel<any>(true, []);
	public disablePrint: boolean = false;
	public url: any;
	public tabname: string = 'General';
	public totalRows: number;
	public disableButtons: boolean = false;
	allow_multiple_cpt_code:boolean = true;
	doctor_signature: any;
	doctor_signature_listing: any[] = [];
	patient_signature: any;
	codesCPT_appointmentModal = [];
	@ViewChild('tabset') tabset: TabsetComponent;
	public apptdata:any
	fromRoute: any;
	/**
	 * Creates an instance of treatment rendered component.
	 * @param modalService
	 * @param config
	 * @param documentManagerService
	 * @param mainService
	 * @param mdService
	 * @param storageData
	 * @param toastrService
	 * @param requestService
	 * @param fb
	 * @param logger
	 * @param _route
	 * @param _confirmation
	 * @param carryForwardService
	 */
	constructor(
		private modalService: NgbModal,
		private config: Config,
		private documentManagerService: DocumentManagerServiceService,
		public mainService: MainService,
		protected mdService: MDService,
		protected storageData: StorageData,
		protected toastrService: ToastrService,
		protected requestService: RequestService,
		protected fb: FormBuilder,
		protected logger: Logger,
		protected _route: Router,
		public carryForwardService: CarryForwardService,
		private signatureService: SignatureServiceService,
		public monthService: CalendarMonthService,
		public appModelDialogService:AppointmentModalDialogService
	) {
		super(
			mainService,
			requestService,
			storageData,
			mdService,
			toastrService,
			fb,
			_route,
			carryForwardService,
		);
		this.subscription = new Subscription();
		this.mainService.setPanelData();
	}

	public generateHeadingFromKey(key: string) {
		return key.substring(1);
	}

	public generateKeyFromHeading(heading: string) {
		return '_' + heading;
	}

	/**
	 * Initializes form
	 * @param [data]
	 */
	public initializeForm(data = null) {
		debugger;
		const cpt_codes = getObjectChildValue(data, [], ['cpt_codes']);
		if(Array.isArray(cpt_codes) && cpt_codes.length == 0) {
			this.getCPTCodeAddedThroughAppoinment();
		} else {
			this.cpt_codes = this.fb.array([]);
			cpt_codes.forEach((code) => {
				let form = new FormControl(code);
				this.cpt_codes.push(form);
			});
		}
	}

	/**
	 * on init
	 */
	ngOnInit() {
		this.fromRoute = localStorage.getItem('routeFrom');
		this.tabLinks = planOfCareTabs;
		this.signatureService
			.getSignature(parseInt(this.appointment.doctorId), DocTypeEnum.userSignature)
			.subscribe((data) => {
				this.doctor_signature_listing = [
					...this.doctor_signature_listing,
					...data['result']['data'],
				];
			});

		this.initializeForm(
			getObjectChildValue(this.appointment, [], ['session', 'treatment_rendered']),
		);
		this.subscribeCarryForward(this.cpt_codes);
		
		this.link = planOfCareTabs.find((link) => {
			return link.slug == this.currentScreen;
		});
		this.link.carryForwarded = false;

		let offlineData: SeededInfo = this.mdService.getOfflineData();
		let favoriteCodes: Code[] = getObjectChildValue(
			offlineData,
			[],
			['favourite_codes', 'icd10_codes'],
		);
		if (favoriteCodes) {
			this.favoriteCodes = favoriteCodes.filter((code) => {
				return code.type == 'ICD';
			});
		}
		this.apptdata =  this.mainService.getCurrentEvaluedApptAData();
	}

	/**
	 * Codes updated
	 * @param event
	 */
	codesUpdated(event: FormArray) {
		this.cpt_codes = this.fb.array([]);
		event.controls.forEach((code) => {
			this.cpt_codes.push(code);
		});
	}

	/**
	 * Saves codes
	 * @param success_callback
	 * @param error_callback
	 */
	saveCodes(success_callback, error_callback) {
		let session: MedicalSession = new MedicalSession({
			treatment_rendered: {
				cpt_codes: [...this.cpt_codes.value],
			},
		});

		this.mdService.saveTreatmentRendered(session, success_callback, error_callback);
	}

	/**
	 * Saves for later
	 */
	saveForLater() {
		this.disableButtons = true;
		this.loading = true;
		this.createSignature().subscribe((data) => {
		});
		this.saveCodes(
			(success) => {
				let session = {
					id: this.appointment.session.id,
					appointment_id: this.appointment.id,
					doctorId: this.appointment.doctorId,
					patientId: this.appointment.patientId,
					caseId: this.appointment.caseId,
					visitType: this.appointment.visitType,
					speciality: this.appointment.speciality,
					speciality_id: this.appointment.speciality_id,
					facility_location_id: this.appointment.location_id,
					finalize_visit: false,
					preview_reports: false,
					template_id:this.appointment.template_id,
					technician_id:this.appointment.technician_id,
				    provider_id : this.appointment.provider_id,
					template_type:this.appointment.template_type,
					appointment_type_id: this.appointment.appointment_type_id,
					save : true
				};
	
				this.requestService
					.sendRequest(
						medicalDoctorUrlsEnum.MDSession_POST,
						'POST',
						REQUEST_SERVERS.medical_doctor_api_url,
						session,
					)
					.subscribe(
						(response: HttpSuccessResponse) => {
							this.toastrService.success(
								'Successfully saved the data. Redirecting to appointments calendar.',
							);
							this.createSignature().subscribe((data) => {
								if(this.apptdata?.evalFrom == 'monthview'){
									this.navigateBackToSameState();
								}else{
									this.fromRoute === 'provider_calendar' ?
              							this._route.navigate(['/scheduler-front-desk/doctor-calendar']) : this._route.navigate(['/front-desk/cases/edit/' + this.fromRoute + '/scheduler']);
								}
								this.disableButtons = false;
								this.loading = false;
							});
						},
						(err) => {
							this.toastrService.error(err);
							this.disableButtons = false;
							this.loading = false;
						},
					);
			},
			(error) => {
				this.disableButtons = false;
				this.loading = false;
			},
		);
	}

	/**
	 * Previews treatment rendered component
	 * @param treatment
	 */
	preview(treatment) {
		this.disableButtons = true;
		this.loading = true;

		this.subscription.add(
			this.createSignature().subscribe((data) => {
				this.disableButtons = false;

				this.saveCodes(
					(success: HttpSuccessResponse) => {
						let session = {
							// preview_reports: true,
							// id: this.appointment.session.id,
							// doctorId: this.appointment.doctor.id,
							// caseId: this.appointment.caseId,
							// patientId: this.appointment.patientId,
							// visitType: this.visitType,
							id: this.appointment.session.id,
							appointment_id: this.appointment.id,
							doctorId: this.appointment.doctorId,
							patientId: this.appointment.patientId,
							caseId: this.appointment.caseId,
							visitType: this.appointment.visitType,
							speciality: this.appointment.speciality,
							speciality_id: this.appointment.speciality_id,
							facility_location_id: this.appointment.location_id,
							preview_reports: true,
							template_id:this.appointment.template_id,
							technician_id:this.appointment.technician_id,
							provider_id : this.appointment.provider_id,
							template_type:this.appointment.template_type,
							appointment_type_id: this.appointment.appointment_type_id
						};
						const appointmentDetails = JSON.parse(localStorage.getItem('data'));
						this.requestService
							.sendRequest(
								medicalDoctorUrlsEnum.MDSession_POST,
								'POST',
								REQUEST_SERVERS.medical_doctor_api_url,
								session,
							)
							.subscribe(
								(response: HttpSuccessResponse) => {
									if (response.status === true) {
										this.treatmentRenderedFiles.setReports(response.result.data.files);
										this.openModal(treatment);
									}
									this.disableButtons = false;
									this.loading = false;
								},
								(err) => {
									this.toastrService.error(err);
									this.disableButtons = false;
									this.loading = false;
								},
							);
					},
					(error) => {
						this.disableButtons = false;
						this.loading = false;
					},
				);
			}),
		);
	}

	/**
	 * Finalizes visit
	 * @param treatment
	 */
	finalizeVisit(treatment) {
		if (!this.appointment || !this.appointment.session || !this.appointment.session.diagnosticImpression ||  this.appointment.session.diagnosticImpression.icd10_codes.length==0 || !this.cpt_codes ||(this.cpt_codes&&this.cpt_codes.length===0)){
			this.toastrService.error('At least 1 ICD and CPT Code are required',"Error");
			return false;
		}
	// if (this.appointment.session.diagnosticImpression.icd10_codes.length==0 ||
	// 	this.appointment.session.treatment_rendered && 	this.appointment.session.treatment_rendered.cpt_codes && this.appointment.session.treatment_rendered.cpt_codes.length==0){
	// 		this.toastrService.error('Atleast 1 CPT or ICD Code is required',"Error");
	// 		return;
	// 	}

		this.loading = true;
		this.disableButtons = true;

		this.saveCodes(
			(success) => {
				let session = {
					id: this.appointment.session.id,

					appointment_id: this.appointment.id,
					doctorId: this.appointment.doctorId,
					patientId: this.appointment.patientId,
					caseId: this.appointment.caseId,
					visitType: this.appointment.visitType,
					speciality: this.appointment.speciality,
					speciality_id: this.appointment.speciality_id,
					facility_location_id: this.appointment.location_id,
					finalize_visit: true,
					preview_reports: true,
					template_id:this.appointment.template_id,
					technician_id:this.appointment.technician_id,
				    provider_id : this.appointment.provider_id,
					template_type:this.appointment.template_type,
					appointment_type_id: this.appointment.appointment_type_id,
					save : true,
					can_finalize:true
				};
	
				this.requestService
					.sendRequest(
						medicalDoctorUrlsEnum.MDSession_POST,
						'POST',
						REQUEST_SERVERS.medical_doctor_api_url,
						session,
					)
					.subscribe(
						(response: HttpSuccessResponse) => {
							if(this.modalRef){
								this.closeModel();
							}
							this.toastrService.success(
								'Successfully saved the data. Redirecting to appointments calendar.',
							);
							this.createSignature().subscribe((data) => {
								this.fromRoute === 'provider_calendar' ?
              						this._route.navigate(['/scheduler-front-desk/doctor-calendar']) : this._route.navigate(['/front-desk/cases/edit/' + this.fromRoute + '/scheduler']);
								this.disableButtons = false;
								this.loading = false;
							});
						},
						(err) => {
							this.disableButtons = false;
							this.loading = false;
						},
					);
			},
			(error) => {
				this.disableButtons = false;
				this.loading = false;
			},
		);
	}

	/**
	 * Opens modal
	 * @param treatment
	 */
	openModal(treatment) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc treatment-modal',
			size: 'lg',
		};
		this.modalRef = this.modalService.open(treatment, ngbModalOptions);
	}

	/**
	 * on destroy
	 */
	ngOnDestroy() {
		// this.saveCodes(
		// 	() => { },
		// 	() => { },
		// );
		this.mainService.resetPanelData();
		this.subscription.unsubscribe();
		unSubAllPrevious(this.subscriptions);
	}

	/**
	 * Opens in window
	 * @param url
	 * @returns
	 */
	openInWindow(url) {
		return `${url}`;
	}

	/**
	 * Previous page
	 */
	previousPage() {
		this._route.navigate([`medical-doctor/plan-of-care-cont`]);
	}

	/**
	 * Masters toggle
	 * @param [tab]
	 */
	masterToggle(tab?) {
		if (this.isAllSelected(tab)) {
			this.selection.clear();
			// this.allTabSelection.
		} else {
			this.treatmentRenderedFiles[tab].forEach((row) => this.selection.select(row));
		}
	}

	/**
	 * Determines whether all selected is
	 * @param [tab]
	 * @returns
	 */
	isAllSelected(tab?) {
		this.totalRows = this.treatmentRenderedFiles[tab].length;
		const numSelected = this.selection.selected.length;
		const numRows = this.totalRows;
		return numSelected === numRows;
	}

	selectionChange($event, selection, file) {
		if ($event) {
			selection.toggle(file);
			// this.allTabSelection.toggle(file);
			// console.log(this.allTabSelection);
		}
	}

	/**
	 * Downloads document
	 * @param [id]
	 */
	downloadDocument(id?) {
		if (!id && this.selection.selected.length > 0) {
			for (let file of this.selection.selected) {
				this.url = 'export/download/' + file.id;
				this.sub.push(this.requestService.sendRequest(this.url + "?authorization=Bearer" + this.storageData.getToken(), 'get', REQUEST_SERVERS.fd_api_url)
					.subscribe(res => {
						this.toastrService.success(res?.message, 'Success');
					}, 
					err => {
						if(err?.error?.message) {
							this.toastrService.error(err?.error?.message, 'Error');
						}
						else {
							this.toastrService.error(err?.error?.error?.message, 'Error');
						}
					}
				));
			}
		} else if (id) {
			this.url = 'export/download/' + id;
			this.sub.push(this.requestService.sendRequest(this.url + "?authorization=Bearer" + this.storageData.getToken(), 'get', REQUEST_SERVERS.fd_api_url)
				.subscribe(res => {
					this.toastrService.success(res?.message, 'Success');
				}, 
				err => {
					if(err?.error?.message) {
						this.toastrService.error(err?.error?.message, 'Error');
					}
					else {
						this.toastrService.error(err?.error?.error?.message, 'Error');
					}
				}
			));
		}
	}

	/**
	 * Closes model
	 */
	closeModel() {
		this.disableButtons = false;
		this.modalRef.close();
		this.selection.clear();
	}

	/**
	 * Prints multiple files
	 * @param [value]
	 */
	printMultipleFiles(value?) {
		// this.disablePrint = true;
		let requestData = {};
		let ids = [];
		this.selection.selected.forEach((file) => {
			ids.push(file.id);
		});
		if (ids.length) {
			requestData['fileIds'] = ids;
			//requestData['fileIds'] = [191];
		}
		this.documentManagerService.printFiles(requestData).subscribe(
			(data) => {
				this.disablePrint = false;
				window.open(data['data']);
			},
			(err) => {
				this.disablePrint = false;
			},
		);
		this.toastrService.info(
			'Your request is being processed. This may take a while depending on the size of the content.',
			'In process',
		);
	}

	/**
	 * Cleartabs treatment rendered component
	 * @param data
	 */
	cleartabs(data: TabDirective) {
		this.tabname = data.heading;
		this.selection.clear();
	}

	chooseSignatures() {
		// [selectable]="true" [signatures]="doctor_signature_listing"
		let modalRef = this.modalService.open(SignatureListingComponent);
		modalRef.componentInstance.selectable = true;
		modalRef.componentInstance.deletable = false;
		modalRef.componentInstance.signatures = this.doctor_signature_listing;
		modalRef.componentInstance.selectedId = this.appointment['doctor_signature_id'];
		modalRef.componentInstance.onIdSelect = (data) => {
			modalRef.close();
			this.appointment['doctor_signature_id'] = data;
		};
	}

	createSignature() {
		return this.signatureService.specialtyCreateSignature(
			this.appointment['visitSessionId'],
			this.patient_signature ? this.patient_signature.signature_file : null,
			'signature.png',
			this.doctor_signature ? this.doctor_signature.signature_file : null,
			'signature.png',
			this.appointment.patient_signature_id,
			this.appointment.doctor_signature_id,
		);
	}

	clearedSignature() {
		if (this.doctor_signature && this.doctor_signature.signature_file != null) {
			const body = { visit_session_id: this.appointment['visitSessionId'], clear_type: 2 };
			this.subscription.add(
				this.documentManagerService.clearSignature(body).subscribe((data) => {
				}),
			);
		}
	}
	navigateBackToSameState() {
		let loggedUserID = JSON.stringify(this.storageData.getUserId());
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
		this.subscriptions.push(this.requestService
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
				console.log(appotdata)
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
		 this.subscriptions.push(this.requestService
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
	getCPTCodeAddedThroughAppoinment() {
		let query = {
			appointment_id: this.appointment && this.appointment.id ? this.appointment.id : null,
			speciality_id: this.appointment && this.appointment.speciality_id ? this.appointment.speciality_id : null,
			appointment_type_id: this.appointment && this.appointment.appointment_type_id ? this.appointment.appointment_type_id : null,
		};
		this.requestService
			.sendRequest(HBOTUrlEnums.GET_CPT_CODES_APPOINTMENT_MODAL, 'GET', REQUEST_SERVERS.fd_api_url, query)
			.subscribe(
				(data: any) => {
					if (data.status) {
						this.codesCPT_appointmentModal = data.result ? data.result.data['cpt_codes']?data.result.data['cpt_codes']:[] : [];
						this.allow_multiple_cpt_code = data && data['result'] && data['result']['data'] && data['result']['data']['speciality_visit_types'] && data['result']['data']['speciality_visit_types']?data['result']['data']['speciality_visit_types']['allow_multiple_cpt_codes'] == 1?true:false:false;
						this.cpt_codes = this.fb.array([]);
						this.codesCPT_appointmentModal.forEach((code) => {
						let form = new FormControl(code);
						this.cpt_codes.push(form);
						});
					}
				},
				(err) => {
				},
			);
	}
	openAppointments(appointment) {
		this.monthService.appointments = { ...appointment };
		this.appModelDialogService.openDialog().result.then(res => {
		  this.mainService.setOneDayAppointmentsData(res);
		});
		this._route.navigate(['/scheduler-front-desk/doctor-calendar'])
	  }
}
