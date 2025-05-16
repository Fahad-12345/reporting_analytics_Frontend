import {
	Component,
	OnInit,
	ViewChild,
} from '@angular/core';
import {
	FormBuilder,
	FormGroup,
} from '@angular/forms';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import {
	Observable,
	Subscription,
	zip,
} from 'rxjs';

import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { HBOTUrlEnums } from '@appDir/hbot/HBOTUrlEnums.enum';
import { HbotService } from '@appDir/hbot/service/hbot.service';
import {
	ManualSpecialitiesUrlEnum,
} from '@appDir/manual-specialities/manual-specialities-url.enum';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import {
	DynamicFormComponent,
} from '@appDir/shared/dynamic-form/components/dynamic-form/dynamic-form.component';
import { InputTypes } from '@appDir/shared/dynamic-form/constants/InputTypes.enum';
import { getFieldControlByName } from '@appDir/shared/dynamic-form/helper';
import { DivClass } from '@appDir/shared/dynamic-form/models/DivClass.class';
import { DynamicControl } from '@appDir/shared/dynamic-form/models/DynamicControl.class';
import { FieldConfig } from '@appDir/shared/dynamic-form/models/fieldConfig.model';
import { InputClass } from '@appDir/shared/dynamic-form/models/InputClass.class';
import {
	MatSearchFilterClass,
} from '@appDir/shared/dynamic-form/models/mat-search-filterClass.class';
import { SelectClass } from '@appDir/shared/dynamic-form/models/SelectClass.class';
import { RequestService } from '@appDir/shared/services/request.service';
import {
	SignatureListingComponent,
} from '@appDir/shared/signature/components/signature-listing/signature-listing.component';
import { DocTypeEnum } from '@appDir/shared/signature/DocTypeEnum.enum';
import {
	SignatureServiceService,
} from '@appDir/shared/signature/services/signature-service.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { FilesListModalComponent } from '../files-list-modal/files-list-modal.component';
import { MainService } from '@appDir/shared/services/main-service';
import { Page } from '@appDir/front-desk/models/page';
import { convertDateTimeForSending, mapCodesWithFullName, removeEmptyAndNullsFormObject, unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { CalendarMonthService } from '@appDir/shared/modules/doctor-calendar/utils/my-calendar/src/modules/month/calendar-month.service';
import { DoctorCalendarUrlsEnum } from '@appDir/shared/modules/doctor-calendar/doctor-calendar-urls-enum';
import { AppointmentModalDialogService } from '@appDir/shared/modules/doctor-calendar/utils/my-calendar/src/modules/month/appointment-modal-dialog.service';

@Component({
	selector: 'app-hbot-notes',
	templateUrl: './hbot-notes.component.html',
	styleUrls: ['./hbot-notes.component.scss'],
})
export class HbotNotesComponent implements OnInit {
	sessionId;
	codesCPT_appointmentModal;
	// form: FormGroup;
	@ViewChild(DynamicFormComponent) _form: DynamicFormComponent;
	constructor(
		private fb: FormBuilder,
		private fd_services: FDServices,
		public hbotService: HbotService,
		private requestService: RequestService,
		private toastrService: ToastrService,
		private storageData: StorageData,
		private modalService: NgbModal,
		private router: Router,
		private signatureService: SignatureServiceService,
		public mainService:MainService,
		private localStorage: LocalStorage,
		public monthService: CalendarMonthService,
        public appModelDialogService:AppointmentModalDialogService
	) {
		this.subscription = new Subscription();
	}
	fieldConfig: FieldConfig[] = [];
	form: FormGroup;
	doctor_signature: any;
	patient_signature: any;
	doctor_signature_listing: any = [];
	subscription: Subscription;
	allowed_case_type_slugs:string[]=['auto_insurance']
	cptPage:Page = new Page();
	icdPage:Page = new Page();
	allow_multiple_cpt_code:boolean = false;
	public apptdata:any;
	subs : Subscription[] = [];
	modalRef:any;
	fromRoute: string;
	
	ngOnInit() {
		this.fromRoute = localStorage.getItem('routeFrom');
		this.apptdata = this.mainService.getCurrentEvaluedApptAData();
		this.fieldConfig = [
			new DivClass(
				[
					// new InputClass('Date of Service', 'date_of_service', InputTypes.date, '', [], '', ['col-md-4'], { readonly: true }),
					new InputClass('PSI', 'psi', InputTypes.text, '4.4', [], '', [
						'col-sm-6 col-md-4 col-lg-3 col-xl-2',
					]),
					new InputClass('ATA', 'ata', InputTypes.text, '1.3', [], '', [
						'col-sm-6 col-md-4 col-lg-3 col-xl-2',
					]),
					new SelectClass(
						'MASK',
						'mask',
						[
							{ label: 'Yes', name: 'yes', value: '1' },
							{ label: 'no', name: 'no', value: '0' },
						],
						'',	
						[],
						['col-sm-6 col-md-4 col-lg-3 col-xl-2'],
						!this.mainService.getenableSaveRecordHbot()?true:false
					),
					new InputClass('Ear Planes', 'ear_planes', InputTypes.text, '', [], '', [
						'col-sm-6 col-md-4 col-lg-3 col-xl-2',
					]),
					new InputClass(
						'Time Started',
						'time_started',
						InputTypes.time,
						'',
						[],
						'',
						['col-sm-6 col-md-4 col-lg-3 col-xl-2'],
						{ custom_time: true },
					),
					// new InputClass('PSI-Ears Pressurized', 'psi_ear_pressurized', InputTypes.text, '', [], '', ['col-sm-6 col-md-4 col-lg-3 col-xl-2']),
					new SelectClass(
						'PSI-Ears Pressurized',
						'psi_ear_pressurized',
						[
							{ label: 'Yes', name: 'yes', value: '1' },
							{ label: 'no', name: 'no', value: '0' },
						],
						'',
						[],
						['col-sm-6 col-md-4 col-lg-3 col-xl-2'],
						!this.mainService.getenableSaveRecordHbot()?true:false
					),
					new InputClass(
						'Time to Max PSI',
						'max_psi',
						InputTypes.time,
						'',
						[],
						'',
						['col-sm-6 col-md-4 col-lg-3 col-xl-2'],
						{ custom_time: true },
					),
					new InputClass(
						'Time Started Down',
						'time_started_down',
						InputTypes.time,
						'',
						[],
						'',
						['col-sm-6 col-md-4 col-lg-3 col-xl-2'],
						{ custom_time: true },
					),

					new InputClass(
						'Time spent at MAX',
						'time_spent_at_max',
						InputTypes.time,
						'',
						[],
						'',
						['col-sm-6 col-md-4 col-lg-3 col-xl-2'],
						{ custom_time: true },
					),
					new InputClass(
						'Time to Zero',
						'time_to_zero',
						InputTypes.time,
						'',
						[],
						'',
						['col-sm-6 col-md-4 col-lg-3 col-xl-2'],
						{ custom_time: true },
					),
					new InputClass(
						'Total Time in Chamber',
						'total_time_in_chamber',
						InputTypes.time,
						'',
						[],
						'',
						['col-sm-6 col-md-4 col-lg-3 col-xl-2'],
						{ custom_time: true },
					),

					// new InputClass('Treatment#', 'treatment', InputTypes.text, '', [], '', ['col-md-4']),
				],
				['row hbot-fields'],
			),
			this.getTable(),
			new DivClass(
				[
					
					new InputClass('Comments', 'comments', InputTypes.text, '', [], '', ['col-12']),
					new DivClass(
						[
							new MatSearchFilterClass(
								'ICD Codes:',
								'icd_codes',
								'full_name',
								'id',
								this.searchICD.bind(this),
								true,
								!this.mainService.getenableSaveRecordHbot()?true:false,
								'',
								[],
								'',
								[],
								[],null,null,null,null,12,'',this.allowed_case_type_slugs, this.onScrollICD.bind(this)
							),
						],
						['col-6'],
					),

					// new AutoCompleteClass(
					// 	'ICD Codes (Maximum 6):',
					// 	'icd_codes',
					// 	'full_name',
					// 	'id',
					// 	this.searchICD.bind(this),
					// 	true,
					// 	'',
					// 	[],
					// 	'',
					// 	['col-6'],
					// 	[],
					// 	{ max: 6 },
					// ),
					// new AutoCompleteClass(
					// 	'CPT Codes (Maximum 6):',
					// 	'cpt_codes',
					// 	'full_name',
					// 	'id',
					// 	this.searchCPT.bind(this),
					// 	true,
					// 	'',
					// 	[],
					// 	'',
					// 	['col-6'],
					// 	[],
					// 	{ max: 6 },
					// ),
					new DivClass(
						[
							new MatSearchFilterClass(
								'CPT Codes:',
								'cpt_codes',
								'full_name',
								'id',
								this.searchCPT.bind(this),
								true,
								!this.mainService.getenableSaveRecordHbot()?true:false,
								'',
								[],
								'',
								['col-6'],null,null,null,null,null,null,'',[], this.onScrollCpt.bind(this)
							),
						],
						['col-6'],
					),
				],
				['row'],
			),
			new DivClass(
				[
					new InputClass(
						'Technician Name',
						'technician',
						InputTypes.text,
						'',
						[],
						'',
						['col-md-6'],
						{ readonly: true },
					),
					new InputClass('Doctor Reviewed', 'doctor_reviewed', InputTypes.text, '', [], '', [
						'col-6',
					]),

					// new DivClass([
					//   new DivClass([], ['signature-box'], '')
					// ], ['col-md-6 offset-md-6 patient-sign'], 'Patient Signature')
				],
				['row'],
			),
		];
		this.setDefaultPaginationCodes();
		this.bindClickHandler();
	}
	setDefaultPaginationCodes() {
		this.setIcdPageDefault();
		this.setCptPageDefault();
	}
	setIcdPageDefault() {
		this.icdPage.pageNumber = 1;
	}
	setCptPageDefault() {
		this.cptPage.pageNumber = 1;
	}

	onReady($event){
		if (!this.mainService.getenableSaveRecordHbot()){
			this.form && this.form.disable();  
		  }
	}

	previewReport() {
		this.signatureService
			.specialtyCreateSignature(
				this.hbotService.getSession().id,
				this.patient_signature ? this.patient_signature.signature_file : null,
				'signature.png',
				this.doctor_signature ? this.doctor_signature.signature_file : null,
				'signature.png',
				this.hbotService.getSession().patient_signature_id,
				this.hbotService.getSession().doctor_signature_id,
			)
			.subscribe((data) => {
				let param = this.form.value;
				let $req1 = this.requestService.sendRequest(
					HBOTUrlEnums.updateHBOTNotes,
					'put',
					REQUEST_SERVERS.fd_api_url,
					{
						session_id: this.hbotService.getSession().id,
						...param,
						visit_session_state_id: 1,
					},
				);
				// .subscribe(data => console.log(data))
				let $req2 = this.requestService.sendRequest(
					ManualSpecialitiesUrlEnum.updateSession,
					'put',
					REQUEST_SERVERS.fd_api_url_vd,
					{
						id: this.hbotService.getSession().id,
						icd_codes: this.form.value.icd_codes.map((icd) => {return {id:icd.id,is_editable:icd.is_editable || true}}),
						cpt_codes: this.form.value.cpt_codes.map((cpt) => {return {id:cpt.id,is_editable:cpt.is_editable || true}}),
						visit_session_state_id: 1,
						warning:true
					},
				);
				//  .subscribe(data => {
				//     console.log(data)
				//   })
				this.disableBtn = true;
				zip($req1, $req2).subscribe(
					(data) => {
						this.disableBtn = false;
						this.modalRef = this.modalService.open(FilesListModalComponent);
						this.modalRef.componentInstance.form = this.form;
						this.modalRef.componentInstance.editable=this.mainService.getenableSaveRecordHbot()
						this.modalRef.result.then((session_status) => {
							if (session_status) session_status == 1 ? this.saveForLater() : this.next('finalize');
						});
					},
					(err) => (this.disableBtn = false),
				);
			});
	}
	speciality_id;
	ngAfterViewInit() {
		this.getICD();
		this.getCPT();
		this.form = this._form.form;

		// this.form.controls['treatment'].disable()
		let session = this.hbotService.getSession();
		let appointmentDetail = this.hbotService.getAppointmentDetail();
		this.speciality_id = appointmentDetail.speciality_id;
		let icd_codes = mapCodesWithFullName(session.icd_codes);
		let cpt_codes = mapCodesWithFullName(session.cpt_codes);
		getFieldControlByName(this.fieldConfig, 'icd_codes').items = icd_codes;
		getFieldControlByName(this.fieldConfig, 'icd_codes').selected_case_type_slug = appointmentDetail.case_type_slug;
		getFieldControlByName(this.fieldConfig, 'cpt_codes').items = cpt_codes;
		if(cpt_codes && cpt_codes.length == 0) {
			this.getCPTCodeAddedThroughAppoinment(appointmentDetail);
		}
		if (!this.mainService.getenableSaveRecordHbot()){
			this.form.disable();
		}

		let patient = this.storageData.getBasicInfo();
		this.form.patchValue({
			icd_codes: icd_codes,
			cpt_codes: cpt_codes,
			technician: `${patient.first_name ? patient.first_name : ''} ${
				patient.middle_name ? patient.middle_name : ''
			} ${patient.last_name ? patient.last_name : ''}`,
			date_of_service: session.visit_date,
		});

		this.requestService
			.sendRequest(HBOTUrlEnums.getHBOTsession, 'get', REQUEST_SERVERS.fd_api_url, {
				session_id: this.hbotService.getSession().id,
			})
			.subscribe((data) => {
				this.hbotService.initializeHBOTSession(data['result']['data']);
				this.form.patchValue(removeEmptyAndNullsFormObject(this.hbotService.getHBOTSession()));
				if (this.hbotService.getSession().doctor_signature_id) {
					// this.doctor_signature_listing = this.hbotService.getSession().doctor_signature_id ? [{ id: this.hbotService.getSession().doctor_signature_id }] : []
				}

				this.signatureService
					.getSignature(this.hbotService.getSession().doctor_id, DocTypeEnum.userSignature)
					.subscribe((data) => {
						this.doctor_signature_listing = [
							...this.doctor_signature_listing,
							...data['result']['data'],
						];
					});
			});
	}
	next(btnClicked) {
		let icd = this.form.value.icd_codes;
		let cpt = this.form.value.cpt_codes;
		if (icd.length==0 ||cpt.length ==0){
				this.toastrService.error('Atleast 1 CPT and ICD Code is required',"Error");
				return;
			}
	
		if (icd.length && cpt.length) {
			this.form.patchValue({
				icd_codes: icd,
				cpt_codes: cpt,
			});
		}

		if (this.form.value.icd_codes.length && this.form.value.cpt_codes.length) {
			this.submit(this.form.value, 2,btnClicked);
			
		} else {
			this.toastrService.info(
				`${!icd.length ? 'icd codes' : ''} ${!icd.length && !cpt.length ? '&' : ''} ${
					!cpt.length ? 'cpt codes' : ''
				} ${!icd.length && !cpt.length ? 'are' : 'is'} required `,
			);
		}
	}
	complete() {}

	back(btnClicked) {
		if(btnClicked == 'finalize'){
			this.fromRoute === 'provider_calendar' ?
              this.router.navigate(['/scheduler-front-desk/doctor-calendar']) : this.router.navigate(['/front-desk/cases/edit/' + this.fromRoute + '/scheduler']);
		}else{
			if(this.apptdata?.evalFrom == 'monthview'){
				this.navigateBackToSameState();
			}else{
				this.fromRoute === 'provider_calendar' ?
              		this.router.navigate(['/scheduler-front-desk/doctor-calendar']) : this.router.navigate(['/front-desk/cases/edit/' + this.fromRoute + '/scheduler']);
			}
		}
	}

	backBtn() {
		this.router.navigate(['/hbot/contradiction-to-hbot']);
	}

	saveForLater() {
		this.submit(this.form.value, 1,'saveForLater');
	}
	disableBtn: boolean = false;
	submit(param, visit_session_state_id,btnClicked) {
		let $req1 = this.requestService.sendRequest(
			HBOTUrlEnums.updateHBOTNotes,
			'put',
			REQUEST_SERVERS.fd_api_url,
			{
				session_id: this.hbotService.getSession().id,
				...param,
				visit_session_state_id,
			},
		);
		// .subscribe(data => console.log(data))
		let $req2 = this.requestService.sendRequest(
			ManualSpecialitiesUrlEnum.updateSession,
			'put',
			REQUEST_SERVERS.fd_api_url_vd,
			{
				id: this.hbotService.getSession().id,
				icd_codes: this.form.value.icd_codes.map((icd) => {return {id:icd.id,is_editable:icd.is_editable || true}}),
				cpt_codes: this.form.value.cpt_codes.map((icd) =>{return {id:icd.id,is_editable:icd.is_editable || true}}),
				visit_session_state_id,
				warning:true,
				finalize:true,
				can_finalize: btnClicked === 'finalize' ? true : false,
				is_not: true
			},
		);
		//  .subscribe(data => {
		//     console.log(data)
		//   })
		this.disableBtn = true;
		zip($req1, $req2).subscribe(
			(data) => {
				if(this.modalRef){
					this.modalRef.close();
				}
				this.signatureService
					.specialtyCreateSignature(
						this.hbotService.getSession().id,
						this.patient_signature ? this.patient_signature.signature_file : null,
						'signature.png',
						this.doctor_signature ? this.doctor_signature.signature_file : null,
						'signature.png',
						this.hbotService.getSession().patient_signature_id,
						this.hbotService.getSession().doctor_signature_id,
					)
					.subscribe((data) => {
						let appointment = this.hbotService.getAppointmentDetail();
						let session = this.hbotService.getSession();
						if (visit_session_state_id ==2 || visit_session_state_id =='2'){
						this.requestService
							.sendRequest(HBOTUrlEnums.UploadFiles, 'post', REQUEST_SERVERS.document_mngr_api_path, {
								session_id: session.id,
								case_id: appointment.case_id,
								patient_id: appointment.patient.id,
								appointment_location_id: appointment.location_id,
								appointment_id: appointment.id,
								speciality_name: appointment.speciality,
								can_finalize: true
							})
							.subscribe(
								(data) => {
									this.disableBtn = false;
								},
								(err) => (this.disableBtn = false),
							);
						}
						this.toastrService.success('Successfully Updated', 'Success');
						this.back(btnClicked);
					});
			},
			(err) => (this.disableBtn = false),
		);
	}
	bindClickHandler(){
		this.subs.push(this.hbotService.getbtnClickedVal().subscribe(btnClicked =>{
			if(btnClicked == 2){
				this.next('finalize');
				return
			}
		}));
	}
	icd10Codes = [];
	icdSearchValue;
	newIcd10Codes = [];
	searchICD(event,searchType) {
		if (!this.mainService.getenableSaveRecordHbot()){
			return;
		}
		if(searchType !='scroll'){
			this.icd10Codes = [];
			this.icdPage.pageNumber = 1;
		}
		this.icdSearchValue = event;
		return new Observable((res) => {
			if (this.icdSearchValue) {
				this.fd_services.searchICDIct(this.icdSearchValue, 'ICD', 1,this.icdPage.pageNumber).subscribe((data) => {
					this.newIcd10Codes = mapCodesWithFullName(data['result']['data']);
					this.icd10Codes.push(...this.newIcd10Codes);
					res.next(this.icd10Codes);
				});
			}
		});
	}


	cptSearchValue;
	cptCodesNew: any[] = [];
	codesCPT = [];
	searchCPT(event,searchType) {
		this.cptSearchValue = event;
		var val = event;
		if(searchType !='scroll'){
			this.codesCPT = [];
			this.cptPage.pageNumber = 1;
		}
		return new Observable((res) => {
			this.fd_services.searchICDIct(val, 'CPT', 2,this.cptPage.pageNumber, this.speciality_id).subscribe((data) => {
				this.cptCodesNew = mapCodesWithFullName(data['result']['data']);
				this.codesCPT.push(...this.cptCodesNew);
				res.next(this.codesCPT);
			});
		});
	}

	getTable() {
		let pressures = this.hbotService.getSeederData().pressures;
		return new DivClass(
			[
				new DivClass(
					[
						new DivClass([], ['col-md-4', 'table-cell'], ''),
						new DivClass([], ['col-md-4', 'table-cell'], 'Start Time'),
						new DivClass([], ['col-md-4', 'table-cell'], 'End Time'),
						...pressures.map(
							(pressure, index) =>
								new DivClass(
									[
										new DivClass([], ['col-md-4', 'table-cell'], `${pressure.name}`),
										new DynamicControl('hbot_pressure_id', pressure.id),
										new DivClass(
											[
												new InputClass('', 'start_time', InputTypes.time, '', [], '', [], {
													custom_time: true,
												}),
											],
											['col-md-4', 'table-cell'],
										),
										new DivClass(
											[
												new InputClass('', 'end_time', InputTypes.time, '', [], '', [], {
													custom_time: true,
												}),
											],
											['col-md-4', 'table-cell'],
										),
									],
									['display-contents'],
									``,
									'',
									{ formControlName: `${index}` },
								),
						),
					],
					['row'],
				),
			],
			['hbot-table', 'mb-4'],
			'',
			'',
			{ formControlName: 'pressures' },
		);
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
						getFieldControlByName(this.fieldConfig, 'cpt_codes').items = this.codesCPT;

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
			.subscribe(
				(data: any) => {
					if (data.status) {
						// this.loadSpin = false;
						this.icd10Codes = data.result ? mapCodesWithFullName(data.result.data) : [];
						getFieldControlByName(this.fieldConfig, 'icd_codes').items = this.icd10Codes;
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
	getCPTCodeAddedThroughAppoinment(appointmentDetail) {
		let query = {
			appointment_id: appointmentDetail && appointmentDetail.id ? appointmentDetail.id : null
		};
		this.requestService
			.sendRequest(HBOTUrlEnums.GET_CPT_CODES_APPOINTMENT_MODAL, 'GET', REQUEST_SERVERS.fd_api_url, query)
			.subscribe(
				(data: any) => {
					if (data.status) {
						this.codesCPT_appointmentModal = data.result ? mapCodesWithFullName(data?.result?.data?.cpt_codes) : [];
						getFieldControlByName(this.fieldConfig, 'cpt_codes').items = this.codesCPT_appointmentModal;
						this.form.patchValue({
							cpt_codes: this.codesCPT_appointmentModal
						});
					}
				},
				(err) => {
				},
			);
	}
	mapFormValuesToID() {}
	chooseSignatures() {
		// [selectable]="true" [signatures]="doctor_signature_listing"
		let modalRef = this.modalService.open(SignatureListingComponent);
		modalRef.componentInstance.selectable = true;
		modalRef.componentInstance.selectedId = this.hbotService.getSession()['doctor_signature_id'];
		modalRef.componentInstance.deletable = false;
		modalRef.componentInstance.signatures = this.doctor_signature_listing;
		modalRef.componentInstance.onIdSelect = (data) => {
			modalRef.close();
			this.hbotService.getSession()['doctor_signature_id'] = data;
		};
	}

	clearedSignature() {
		const session_id = this.hbotService.getSession().id;

		if (this.doctor_signature && this.doctor_signature.signature_file != null) {
			const body = { visit_session_id: session_id, clear_type: 2 };

			this.subscription.add(
				this.hbotService.clearSignature(body).subscribe((data) => {
				}),
			);
		}
	}
	onScrollICD($event){
		this.icdPage.pageNumber +=1;
		return this.searchICD(this.icdSearchValue, 'scroll');
	}
	onScrollCpt($event){
		this.cptPage.pageNumber +=1;
		return this.searchCPT(this.cptSearchValue, 'scroll');
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
		 this.subs.push(this.requestService
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
			this.subs.push(this.requestService
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
	  ngOnDestroy(): void {
		unSubAllPrevious(this.subs);
	}
}
