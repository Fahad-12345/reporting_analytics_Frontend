import { DatePipeFormatService } from './../../../../../../../../services/datePipe-format.service';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChildren, ViewChild, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AssignSpecialityUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-speciality/assign-speciality-urls-enum';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { StorageData, UsersType } from '@appDir/pages/content-pages/login/user.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';

import { DoctorCalendarUrlsEnum } from '@appDir/shared/modules/doctor-calendar/doctor-calendar-urls-enum';
import { AclService } from '@appDir/shared/services/acl.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { NgbActiveModal, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ShowModalComponent } from '../show-modal/show-modal.component';
import { DoctorCalendarService } from '../../../../../../doctor-calendar.service';
import { DeleteReasonComponent } from '../../../../../../modals/delete-reason/delete-reason.component';
import { UpdateAppoitModalComponent } from '../../../../../../modals/update-appoit-modal/update-appoit-modal.component';
import { SubjectService } from '../../../../../../subject.service';
import { CalendarMonthService } from '../calendar-month.service';
import { AppSubjectService } from './subject.service';
import { AssignRoomsUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-rooms/assign-rooms-urls-enum';
import { HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { MainService } from '@appDir/shared/services/main-service';
import {
	convertDateTimeForRetrieving,
	convertDateTimeForSending,
	makeSingleNameFormFIrstMiddleAndLastNames,
	removeEmptyAndNullsFormObject,
	stdTimezoneOffset,
} from '@appDir/shared/utils/utils.helpers';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { Observable, Subject } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ShareAbleFilter } from '@appDir/shared/models/share-able-filter';
import { MappingFilterObject } from '@appDir/shared/filter/model/mapping-filter-object';
import { TemplateUrlsEnum } from '@appDir/front-desk/masters/master-users/users/user-edit/template/template-urls-enum';
import { EnumSpecialtyTypes } from '../../common/specialty-types';
import { DoctorCalendarEnum } from '@appDir/shared/modules/doctor-calendar/doctor-calendar-transportation-enum';
import { CalendarEvaluationService } from '../../common/calendar-evaluation.service';
import { CodesUrl } from '@appDir/front-desk/masters/billing/codes/codes-url.enum';
import { OrderEnum, ParamQuery } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { Page } from '@appDir/front-desk/models/page';
import { IMatAutoCompleteSpinnerShowIntellicense, MatAutoCompleteSpinnerShowIntellicenseModal } from '@appDir/shared/components/mat-autocomplete/modal/mat-autocomplete.modal';
import { MonthSubjectService } from '../subject.service';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { last, take } from 'rxjs/operators';
import { I } from '@angular/cdk/keycodes';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { TemplateType } from '../../common/template-type.enum';

@Component({
	changeDetection: ChangeDetectionStrategy.OnPush,
	selector: 'app-appointment-modal',
	templateUrl: './appointments-modal.component.html',
	styleUrls: ['./appointments-modal.component.scss'],
})
export class AddAppointmentModalComponent extends PermissionComponent {
	public temp;
	public update_permission_date = new Date();
	public checker = false;
	data: any = [];
	public appointments: any = [];
	public doctorNameModal: any;
	public checkCons = false;
	private startEvalButton: boolean = false;
	private localStorageId: string;
	patientData: any;
	isTemplSelectedFromDropDown: boolean = false;
	public counterChecked = 0;
	public pageNumber = 1;
	PatientRecord: boolean = false;
	eventsSubject: Subject<any> = new Subject<any>();
	first_name;
	middle_name;
	last_name;
	billing_title;
	selectedMultipleFieldFiter: any = {
		technician_id: [],
		template_id: [],
		provider_id: [],
		cpt_codes_ids: [],
	};
	loadSpin:boolean = false;
	public typeForAppointment: any;
	@ViewChildren('appModalDataTable') appModalDataTable:DatatableComponent;
	@ViewChildren('providersRef') providersRef;
	@ViewChildren('techniciansRef') techniciansRef;
	@ViewChildren('templateRef') templateRef;
	enumTransportType = DoctorCalendarEnum;
	appointmentModalPageLimit = 10;
	lstCptorModifiers: any = [];
	searchValueCpt: any;
	cptPage:Page = new Page();
	cptmodalRef: NgbModalRef;
	selectedCPTs:any = [];
	getappointmentev$:any
	currappointmentdta :any;
	public monthsAppointmentData = []
	public appointmentData = [];

	showSpinnerIntellicense:IMatAutoCompleteSpinnerShowIntellicense = new MatAutoCompleteSpinnerShowIntellicenseModal();
	routeFrom: any;

	constructor(
		aclService: AclService,
		router: Router,
		public ShowModalOpener: NgbModal,
		protected requestService: RequestService,
		public activeModal: NgbActiveModal,
		public _service: CalendarMonthService,
		public docService: DoctorCalendarService,
		public cdr: ChangeDetectorRef,
		public subject: SubjectService,
		public updateModal: NgbModal,
		public AppSubjectService: AppSubjectService,
		public doctorCalendarService: DoctorCalendarService,
		private toastrService: ToastrService,
		private storageData: StorageData,
		private mainService: MainService,
		private calendarEvaluationService: CalendarEvaluationService,
		public datePipeService: DatePipeFormatService,
		private customDiallogService: CustomDiallogService,
		private fb: FormBuilder,
		public mservice:MonthSubjectService,
		private localStorage: LocalStorage
	) {
		super(aclService, router);
		this.localStorageId = JSON.stringify(this.storageData.getUserId());
		if(this.router.url.includes('cases')) {
			const segments = this.router.url.split('/');
			this.routeFrom = segments[4];
		}
		else {
			this.routeFrom = 'provider_calendar'
		}
	}
	subscriptions: any[] = [];
	subscription1: any;
	subscription2: any;
	public appointmentIdRefresh: any;
	public fromRefresh = '';
	appointmentForm: FormGroup;
	EnumApiPath = AssignSpecialityUrlsEnum;
	conditionalExtraApiParams = {};
	mainApi = REQUEST_SERVERS;
	templateUrls = TemplateUrlsEnum.get_all_templates;
	EnumSpecialtyType = EnumSpecialtyTypes;
	total_appointment_visit_session = [];
	addCptForm: FormGroup;
	currAppointDateListId:any;
	InitAppointmentModalForm() {
		this.appointmentForm = this.fb.group({
			technician_id: [null],
			template_id: [null, Validators.required],
			// template_id:this.fb.array([]),
			provider_id: [null, Validators.required],
		});
	}
	selectionOnValueChange(e: any, Type?, index?) {
		const info = new ShareAbleFilter(e);
		this.appointmentForm.patchValue(removeEmptyAndNullsFormObject(info));
		if (!e.data) {
			this.appointmentForm.controls[Type].setValue(null);
			switch (Type) {
				case 'template_id':
					this.isTemplSelectedFromDropDown = true;
					this.data[index]['is_required_template'] = true;
					if(e.data.realObj.template_type == TemplateType.Dynamic){
						this.appointmentForm.controls[Type].setValue(e.data.realObj?.template_id);
					}
					break;
				case 'provider_id':
					this.data[index]['is_required_provider'] = true;
					break;
				default:
			}
		} else {
			let loggedUserID = JSON.stringify(this.storageData.getUserId());
			if (Type == 'template_id') {
				this.isTemplSelectedFromDropDown = true;
				this.data[index]['template_type'] =
				e && e.data && e.data.realObj && e.data.realObj.template_type ? e.data.realObj.template_type: e.data.template_type;
				this.data[index]['is_required_template'] = false;
				if(e?.data?.realObj?.template_type == TemplateType.Dynamic){
					this.appointmentForm.controls[Type].setValue(e.data.realObj?.template_id);
				}
			}
			if (Type == 'provider_id' && this.data[index] && !this.isProviderLogedIn) {
				// ONLY FOR TECHNICIAN LOGGED IN
				this.data[index].conditionalExtraApiParamsForTemplateGet['user_id'] =
					this.appointmentForm.controls['provider_id'].value;
				this.data[index]['is_required_provider'] = false;
			}
			if (Type == 'technician_id' && this.data[index] && this.isProviderLogedIn) {
				// ONLY FOR PROVDER LOGGED IN
				this.data[index].conditionalExtraApiParamsForTechnicianGet['supervisor_id'] = loggedUserID;
			}
		}
	}
	getChange($event: any[], fieldName: string) {
		if ($event) {
			this.selectedMultipleFieldFiter[fieldName] = $event.map(
				(data) =>
					new MappingFilterObject(
						data.id,
						data.name,
						data.full_Name,
						data.facility_full_name,
						data.label_id,
						data.insurance_name,
						data.employer_name,
						data.created_by_ids,
						data.updated_by_ids,
					),
			);
		}
	}
	public async openShowModal(event) {
		this.checker = true;
		this.localStorage.set('appdata',JSON.stringify({...event,evalFrom:'monthview'}));
		this.subject.refresh('add app');
		if(event){
			this.subject.setAppointmentDetails(event);
		   }
		await this.requestService
			.sendRequest(
				AssignSpecialityUrlsEnum.getSpecialityFiles + '?appointment_id=' + event['appId'],
				'GET',
				REQUEST_SERVERS.fd_api_url,
			)
			.subscribe((res: any) => {
				this.temp = res.data;
				if (this.temp.length > 1) {
					this.doctorCalendarService.updateModalData = {
						appointment_title: event['appointment_title'],
						patientName: event['patientName'],
						patient_id: event['patient_id'],
						case_id: event['case_id'],
						case_type_id: event['case_type_id'],
						case_type_name: event['case_type_name'],
						doctor_id: 0,
						appointment_duration:
							event['appointment_duration'] || event['specAssign']['specialities']['timeSlot'],
						time_slot: event['time_slot'],
						startDateTime: event['start'],
						priority_id: event['priority_id'],
						appointment_type_id: event['appointment_type_id'],
						appointment_type_description: event['appointment_type_description'],
						appointment_type_slug: event['appointment_type_slug'],
						confirmation_status: event['confirmation_status'],
						// roomId: event['realRoomId'],
						comments: event['comments'],
						visitTypeid: event['appointment_type_id'],
						facility_id: event['facility_id'] || event['specAssign']['facility']['id'],
						speciality_id: event['speciality_id'] || event['specAssign']['specialities']['id'],
						appointmentId: event['appId'],
						chart_id: event['chart_id'],
						chart_id_formatted: event['chart_id_formatted'],
						is_active: event['is_active'],
					};
					this.checker = true;
					this.temp = null;
					this.ShowModalOpener.open(ShowModalComponent, {
						size: 'lg',
						backdrop: 'static',
						keyboard: false,
					});
				} else if (this.temp.length == 1) {
					this.checker = true;
					this.openInWindow(this.temp[0]?.pre_signed_url);
					this.temp = null;
				} else {
					this.toastrService.error('No report found!', 'Error');
					this.checker = true;
					this.temp = null;
				}
			});
	}
	getLinkwithAuthToken(link) {
		let token = this.storageData.getToken();
		if (token) {
			return `${link}&token=${token}`;
		} else {
			return link;
		}
	}

	openInWindow(url) {
		window.open(
			url,
			'',
			'channelmode = yes, width = 600, height = 1000',
		);
	}

	ngOnInit() {
		this.InitAppointmentModalForm();
		this.localStorage.set('appdata',JSON.stringify({}));
		this.subject.updateAppointment.subscribe((response) => {
			if (response == true) {
				this.subject.updateAppointment.next(false);
			}
		});
		this.update_permission_date.setDate(this.update_permission_date.getDate() - 1);
		this.update_permission_date.setHours(23);
		this.update_permission_date.setMinutes(59);
		this.update_permission_date.setSeconds(59);
		this.subscription1 = this.AppSubjectService.castDelete.subscribe((res) => {
			if (res.length != 0) {
				for (let i = 0; i < this.appointments.length; i++) {
					if (this.appointments[i].appId === parseInt(res)) {
						this.appointments.splice(i, 1);
						break;
					}
				}
				this.data = [];
				this.data = [...this.appointments];
				this.cdr.detectChanges();
		        this.getVisitSessions();
			}
		});
		this.subscription2 = this.AppSubjectService.castUpdate.subscribe((res) => {
			if(res){
				res['appointments'] = res['appointment'];
				delete res['appointment'];
				this.getAppointmentsData(res,null);
			}
		});
		this.subscriptions.push(this.subscription1);
		this.subscriptions.push(this.subscription2);
		let tempApp = this._service.appointments;
		const appointmentIds: number[] = tempApp?.appointments?.map(x => x?.id);
		const specialityId: number = tempApp?.speciality_id ? [tempApp?.speciality_id] : tempApp?.appointments?.map(x => x?.speciality_id);  

		let timeSpan;
		this.appointments = [];

		if(appointmentIds?.length) {
			this.loadSpin = true;

			this.requestService
				.sendRequest(AssignRoomsUrlsEnum.getAppointmentsDataForProviderCalender, 'POST', REQUEST_SERVERS.schedulerApiUrl1, {
					appointment_ids: appointmentIds,
					speciality_id: specialityId
				})
				.subscribe((response: HttpSuccessResponse) => {

					this.loadSpin = false;

					this.appointmentData = [...response?.result?.data];

					for (let i = 0; i < this.appointmentData?.length; i++) {
						timeSpan = this.appointmentData[i]['appointment_duration'];
			
						var start: any = convertDateTimeForRetrieving(
							this.storageData,
							new Date(this.appointmentData[i]['scheduled_date_time']),
						);
						var end = new Date(start.getTime() + timeSpan * 60000);
						let startTime = new Date(start).toString().substring(16, 21);
						let endTime = new Date(end).toString().substring(16, 21);
						startTime = this.convert12(startTime);
						endTime = this.convert12(endTime);
			
						let deleteApp = false;
						let updateApp = false;
			
						if (
							this.aclService.hasPermission(this.userPermissions.appointment_delete) ||
							this.storageData.isSuperAdmin()
						) {
							deleteApp = true;
						}
						if (
							this.aclService.hasPermission(this.userPermissions.appointment_edit) ||
							this.storageData.isSuperAdmin()
						) {
							updateApp = true;
						}
						let can_access = false;
			
						if (
							this.aclService.hasPermission(this.userPermissions.start_evaluation) ||
							this.storageData.isSuperAdmin()
						) {
							can_access = true;
						}

						this.appointments.push({
							date_list_id:tempApp.date_list_id,
							updateApp: updateApp,
							deleteApp: deleteApp,
							can_access: can_access,
							startEval: can_access,
							start: start,
							end: end,
							color: tempApp.color,
							approved: undefined,
							facility_name: tempApp.facility_name,
							facility_qualifier: tempApp.facility_qualifier,
							checkCons: true,
							end_time: endTime,
							start_time: startTime,
							facility_id: tempApp['facility_id'],
							doctor_id: tempApp['doctor_id'],
							status: this.appointmentData[i]['showUpStatus'],
							showUpStatus:this.appointmentData[i]['showUpStatus'],
							scheduled_date_time: this.appointmentData[i]['scheduled_date_time'],
							available_doctor_is_provider_assignment:this.appointmentData[i]['available_doctor_is_provider_assignment'],
							allow_multiple_cpt_codes:this.appointmentData[i] && this.appointmentData[i]['appointmentType'] && this.appointmentData[i]['appointmentType']['specialityVisitType']?this.appointmentData[i] && this.appointmentData[i]['appointmentType'] && this.appointmentData[i]['appointmentType']['specialityVisitType']&&this.appointmentData[i]['appointmentType']['specialityVisitType'][0]&&this.appointmentData[i]['appointmentType']['specialityVisitType'][0].allow_multiple_cpt_codes:null,
							appointmentType:this.appointmentData[i] && this.appointmentData[i]['appointmentType'],
							patientName: this.appointmentData[i]['middle_name'] ? this.appointmentData[i]['first_name'] + ' ' + this.appointmentData[i]['middle_name'] + ' ' + this.appointmentData[i]['last_name'] : this.appointmentData[i]['first_name'] + ' ' + this.appointmentData[i]['last_name'],
							first_name: this.appointmentData[i]['first_name'],
							middle_name: this.appointmentData[i]['middle_name'],
							last_name: this.appointmentData[i]['last_name'],
							title: this.appointmentData[i]['appointment_title'],
							picture: this.appointmentData[i]['picture'],
							available_doctor_id: this.appointmentData[i]['available_doctor_id'],
							patient_id: this.appointmentData[i]['patient_id'],
							chart_id: this.appointmentData[i]['chart_id'],
							chart_id_formatted: this.appointmentData[i]['chart_id_formatted'],
							is_active: this.appointmentData[i]['is_active'],
							priority_id: this.appointmentData[i]['priority_id'],
							speciality_id: this.appointmentData[i]['speciality_id'],
							speciality_key: this.appointmentData[i]['speciality_key'],
							confirmation_status: this.appointmentData[i]['confirmation_status'],
							speciality_name: this.appointmentData[i]['speciality_name'],
							case_id: this.appointmentData[i]['case_id'],
							case_type_id: this.appointmentData[i]['case_type_id'],
							case_type_name: this.appointmentData[i]['case_type_name'],
							appointment_billable: this.appointmentData[i].appointment_billable,
							has_app: this.appointmentData[i]['has_app'],
							appointment_type_id: this.appointmentData[i]['appointment_type_id'],
							appointment_type_slug: this.appointmentData[i]['appointment_type_slug'],
							appointment_type_description: this.appointmentData[i]['appointment_type_description'],
							appointment_type_qualifier: this.appointmentData[i]['appointment_type_qualifier'],
							appointment_priority_id: this.appointmentData[i]['priority_id'],
							appointment_status: this.appointmentData[i]['appointment_status'],
							appointment_status_slug: this.appointmentData[i]['appointment_status_slug'],
							appointment_visit_state_id: this.appointmentData[i]['appointment_visit_state_id'],
							appointment_visit_state_name: this.appointmentData[i]['appointment_visit_state_name'],
							appointment_visit_state_slug: this.appointmentData[i]['appointment_visit_state_slug'],
							visit_status_slug: this.appointmentData[i]['patientSession'] && this.appointmentData[i]['patientSession']['visitStatus']&& this.appointmentData[i]['patientSession']['visitStatus']['slug'],
							patientSession:this.appointmentData[i]['patientSession'],
							comments: this.appointmentData[i]['comments'],
							is_manual_specialty: this.appointmentData[i]['is_manual_specialty'],
							appointment_title: this.appointmentData[i]['appointment_title'],
							appId: this.appointmentData[i]['id'],
							id:this.appointmentData[i]['id'],
							appointment_duration: this.appointmentData[i]['appointment_duration'],
							time_slot: this.appointmentData[i]['time_slot'],
							doctor_info: this.appointmentData[i]['doctor_info'],
							billingTitle: this.appointmentData[i]['billingTitle'],
							patient_status: this.appointmentData[i]['patient_status'],
							back_dated_check: this.appointmentData[i]['back_dated_check'],
							case_status: this.appointmentData[i]['case_status'],
							appointment_cpt_codes: this.appointmentData[i]['appointment_cpt_codes'],
							physician: this.appointmentData[i]['physician_clinic']? this.appointmentData[i]['physician_clinic']['physician']:null,
							physician_clinic: this.appointmentData[i]['physician_clinic'],
							transportations: this.appointmentData[i]['transportations'],
							reading_provider: this.appointmentData[i]['reading_provider'],
							reading_provider_id: this.appointmentData[i]['reading_provider_id'],
							cd_image: this.appointmentData[i]['cd_image'],
							is_transportation: this.appointmentData[i]['is_transportation'],
							visit_info: this.appointmentData[i]['visit_info'],
							visit_session: this.appointmentData[i]['visit_info']['visit_session'],
							DOB: this.appointmentData[i]['dob'],
							companyName: this.appointmentData[i]['company_name'],
						});
					};

					this.patientData = this.appointments[0];
					this.data = [];
					this.data = [...this.appointments];
					for (let i = 0; i < this.data.length; i++) {
						if (this.data[i].start < this.update_permission_date) {
							if (this.aclService.hasPermission(this.userPermissions.update_previous_appointment)) {
								this.data[i].update_back = true;
							} else {
								this.data[i].update_back = false;
							}
						} else {
							this.data[i].update_back = true;
						}
					}

					this.cdr.detectChanges();

					if (this.data.length != 0) {
						this.getVisitSessionData(this.data);
					}

				});
		}

	}

	public getVisitSessionData(appointmentsData) {
		this.total_appointment_visit_session = appointmentsData?.map(x => x.visit_info);
		const appointments = [...appointmentsData];
		appointments.forEach((app, index) => {
			this.setDataAfterStartEvaluation(app, app.visit_info, index);
		});

	}

	public async getVisitSessions() {
		this.loadSpin = true;
		let appointments = [];
		this.data.forEach((item) => {
			appointments.push(item.appId);
		});
		if(appointments.length){
			this.requestService
				.sendRequest(AssignRoomsUrlsEnum.getVisitSession, 'POST', REQUEST_SERVERS.fd_api_url, {
					appointment_ids: appointments,
				})
				.subscribe((response: HttpSuccessResponse) => {
					this.loadSpin = false;
					let total_data = response.result.data;
					this.total_appointment_visit_session = total_data;
					total_data.forEach((item) => {
						this.data.forEach((inner, index) => {
							if (item.appointment_id == inner.appId) {
								inner['visit_session'] = item['visit_session'];
								this.setDataAfterStartEvaluation(inner, item, index);
							}
						});
					});
					this.data = [...this.data];
					this.cdr.detectChanges();
				});
		}
	}

	ngOnDestroy() {
		this.subscriptions.forEach((subscription) => subscription.unsubscribe());
		// this.subject.updateAppointment.unsubscribe();
	}
	public pageEvent(e) {
		this.counterChecked = 0;
		this.pageNumber = e.offset + 1;
		this.cdr.detectChanges();
		let get_record_to = this.pageNumber * this.appointmentModalPageLimit - e.offset;
		let get_record_from = get_record_to - this.appointmentModalPageLimit + e.offset;
		if (this.pageNumber > e.offset) {
			get_record_to = get_record_from  + 10;
		}
		// for populating technician & 
		this.total_appointment_visit_session.forEach((element) => {
				this.data
				.slice(get_record_from, get_record_to)
				.forEach((inner, index) => {
					if (element.appointment_id == inner.appId) {
						inner['visit_session'] = element['visit_session'];
						this.setTechnicianRecordIfVisitSession(null, element, index, 'pageChange');
						this.setTemplateRecordIfVisitSession(null, element, index, 'pageChange');
					}
				});
		});
		//for provider 
		this.total_appointment_visit_session
			.slice(get_record_from, get_record_to)
			.forEach((element, index1) => {
				this.data.forEach((inner, index) => {
					if (element.appointment_id == inner.appId) {
						inner['visit_session'] = element['visit_session'];
						this.SetDataOnPagination(inner, element, index1)
					}
				});
			});
	}
	public convert12(str) {
		let result: string = '';
		let h1 = str[0];
		let h2 = str[1];
		let hh = parseInt(h1) * 10 + parseInt(h2);
		let Meridien: string;
		if (hh < 12) {
			Meridien = 'AM';
		} else {
			Meridien = 'PM';
		}
		hh %= 12;
		// Handle 00 and 12 case separately
		if (hh == 0) {
			result = '12';
			// Printing minutes and seconds
			for (let i = 2; i < str.length; ++i) {
				result = result + str[i];
			}
		} else {
			result = JSON.stringify(hh);
			// Printing minutes and seconds
			for (let i = 2; i < str.length; ++i) {
				result = result + str[i];
			}
		}
		result = result + ' ' + Meridien;
		return result;
	}
	public edit(event) {
		this.PatientRecord = false;
		this.appointmentIdRefresh = event['appId'];
		this.fromRefresh = 'update';
		if (event['available_doctor_id'] == 0 || event['available_doctor_id'] == null) {
			this.doctorCalendarService.updateModalData = {
				visit_session: event['visit_session'],
				appointment_title: event['appointment_title'],
				patientName: event['patientName'],
				patient_id: event['patient_id'],

				case_id: event['case_id'],
				case_type_id: event['case_type_id'],
				case_type_name: event['case_type_name'],
				doctor_id: null,
				appointment_duration:
					event['appointment_duration'] || event['specAssign']['specialities']['timeSlot'],
				time_slot: event['time_slot'],
				startDateTime: event['start'],
				priority_id: event['priority_id'],
				appointment_type_id: event['appointment_type_id'],
				appointment_type_description: event['appointment_type_description'],
				appointment_type_slug: event['appointment_type_slug'],
				confirmation_status: event['confirmation_status'],
				// roomId: event['realRoomId'],
				comments: event['comments'],
				visitTypeid: event['appointment_type_id'],
				facility_id: event['facility_id'] || event['specAssign']['facility']['id'],
				speciality_id: event['speciality_id'] || event['specAssign']['specialities']['id'],
				appointmentId: event['appId'],
				chart_id: event['chart_id'],
				chart_id_formatted: event['chart_id_formatted'],
				is_active: event['is_active'],
				appointment_cpt_codes: event['appointment_cpt_codes'],
				physician: event && event['physician_clinic']?
				event['physician_clinic']['physician']:null,
				physician_clinic: event && event['physician_clinic']?
				event['physician_clinic']:null,				transportations: event['transportations'],
				reading_provider: event['reading_provider'],
				reading_provider_id: event['reading_provider_id'],
				cd_image: event['cd_image'],
				is_transportation: event['is_transportation'],
			};
		} else {
			this.doctorCalendarService.updateModalData = {
				visit_session: event['visit_session'],
				appointment_title: event['appointment_title'],
				patientName: event['patientName'],
				patient_id: event['patient_id'],
				visitTypeid: event['appointment_type_id'],
				case_id: event['case_id'],
				case_type_id: event['case_type_id'],
				case_type_name: event['case_type_name'],
				doctor_id: event['doctor_id'],
				startDateTime: event['start'],
				priority_id: event['priority_id'],
				appointment_type_id: event['appointment_type_id'],
				appointment_type_description: event['appointment_type_description'],
				appointment_type_slug: event['appointment_type_slug'],
				confirmation_status: event['confirmation_status'],
				time_slot: event['time_slot'],
				// roomId: event['realRoomId'],
				appointment_duration: event['appointment_duration'],
				comments: event['comments'],
				facility_id: event['facility_id'],
				speciality_id: event['speciality_id'],
				appointmentId: event['appId'],
				doctorName: event['doctor_info'],
				doctor_info: event['doctor_info'],
				billingTitle: event['billingTitle'],
				chart_id: event['chart_id'],
				chart_id_formatted: event['chart_id_formatted'],
				is_active: event['is_active'],
				appointment_cpt_codes: event['appointment_cpt_codes'],
				physician: 
				event && event['physician_clinic']?
				event['physician_clinic']['physician']:null,
				physician_clinic: event['physician_clinic'],				
				transportations: event['transportations'],
				reading_provider: event['reading_provider'],
				reading_provider_id: event['reading_provider_id'],
				cd_image: event['cd_image'],
				is_transportation: event['is_transportation'],
			};
		}
		this.doctorNameModal = event['doctor_info']
			? event['doctor_info'].first_name +
			  ' ' +
			  event['doctor_info'].middle_name +
			  ' ' +
			  event['doctor_info'].last_name
			: '';
		this.docService.updateModalObject = event;
		const activeModal = this.updateModal.open(UpdateAppoitModalComponent, {
			windowClass: 'modal-view',
			backdrop: 'static',
			keyboard: false,
		});
		activeModal.result.then((res)=>{
			if(res == false){
				this.getVisitSessions();
			}
		});
	}
	public deleteAppointment(event) {
		this.PatientRecord = false;
		if (!event.appId) {
			event['appId'] = event.id;
		}
		this.appointmentIdRefresh = event['appId'];
		this.fromRefresh = 'delete';

		let startDate: Date;
		let endDate: Date;
		startDate = event.start;
		endDate = event.end;
		startDate.setHours(0);
		startDate.setMinutes(0);
		endDate.setHours(23);
		endDate.setMinutes(59);
		const activeModal = this.updateModal.open(DeleteReasonComponent, {
			size: 'sm',
			backdrop: 'static',
			keyboard: false,
		});
		this.doctorCalendarService.appId = event.appId;
		this.doctorCalendarService.deleteAppId = [event.appId];
		this.doctorCalendarService.startDate = startDate;
		this.doctorCalendarService.endDate = endDate;
	}
	public close() {
		this.activeModal.close();
	}
	public startEvaluation(e, index) {
		// ONLY FOR START EVALUATION START
		localStorage.setItem('routeFrom', this.routeFrom);
		if(e){
		 this.subject.setAppointmentDetails(e);
		}
		this.localStorage.set('appdata',JSON.stringify({...e,evalFrom:'monthview'}));
		if (!e.visit_session) {
			if (e && e.template_type && e.template_type == 'static_ios') {
				this.toastrService.error('Please use an IOS device/iPad to access the template');
				return;
			} else {
				let loggedUserID = JSON.stringify(this.storageData.getUserId());
				e['technician_id'] =
					this.isProviderLogedIn &&
					this.appointmentForm &&
					this.appointmentForm.controls['technician_id'] &&
					this.appointmentForm.controls['technician_id'].value
						? this.appointmentForm.controls['technician_id'].value
						: !this.isProviderLogedIn
						? loggedUserID
						: null;
				if(this.isTemplSelectedFromDropDown){
					e['template_id'] = this.appointmentForm.controls['template_id'].value;
				}
						
				e['provider_id'] =
					!this.isProviderLogedIn && e && e.doctor_info
						? e.doctor_id
						: !this.isProviderLogedIn &&
						  this.appointmentForm &&
						  this.appointmentForm.controls['provider_id'] &&
						  this.appointmentForm.controls['provider_id'].value
						? this.appointmentForm.controls['provider_id'].value
						: this.isProviderLogedIn
						? loggedUserID
						: null;
			}
			if(!e.doctor_id){
				e.doctor_id = e.provider_id;
			}
			if (!e.provider_id) {
				// CHECK FOR ALL
				e['is_required_provider'] = true;
				return;
			}
			debugger;
			if (e.template_id ===null || e.template_id=== undefined)  {
				// CHECK FOR ALL
				e['is_required_template'] = true;
				return;
			}
		}
		// ONLY FOR START EVALUATION END
		if (e.back_dated_check) {
			this.customDiallogService
				.confirm(
					'Warning',
					'Uploaded documents will be replaced. Are you sure you want to Edit the Evaluation ?',
				)
				.then((confirmed) => {
					if (confirmed) {
						this.calendarEvaluationService.EnabledFlow(e, 'onlySpecialty');
						this.appointmentIdRefresh = e['appId'];
						this.fromRefresh = 'start';
						this.subject.refreshStartEval(e);
						this.activeModal.close();
						this.subject.refresh('add app');
					}
				})
				.catch();
		} else {
			if (e.speciality_key != 'medical_doctor' && e.speciality_key != 'hbot') {
				if (e.template_type === 'manual') {
					this.mainService.setenableSaveRecordManualSpeciality(true);
					this.appointmentIdRefresh = e['appId'];
					this.fromRefresh = 'start';
					this.subject.refreshStartEval(e);
					this.activeModal.close();
					this.subject.refresh('add app');
				} else {
					this.appointmentIdRefresh = e['appId'];
					this.fromRefresh = 'start';
					this.subject.refreshStartEval(e);
					this.activeModal.close();
					this.subject.refresh('add app');
				}
				// && e.template_type === 'manual'? this.mainService.setenableSaveRecordManualSpeciality(true):)
			} else {
				this.calendarEvaluationService.EnabledFlow(e, 'specialtyWithMedicalOrHbot');
				this.appointmentIdRefresh = e['appId'];
				this.fromRefresh = 'start';
				this.subject.refreshStartEval(e);
				this.activeModal.close();
				this.subject.refresh('add app');
			}
		}

		// this.requestService
		// .sendRequest(
		// 	DoctorCalendarUrlsEnum.visit_session_create,
		// 	'POST',
		// 	REQUEST_SERVERS.fd_api_url_vd,
		// 	{
		// 		case_id: e.caseId,
		// 		patient_id: e.patientId,
		// 		doctor_id: e.docId,
		// 		speciality_id: e.specId,
		// 		appointment_id: e.appId,
		// 		appointment_type_id: e.appointmentTypeId,
		// 		visit_date: e.start,
		// 		facility_location_id: e.clinicId ,
		// 	},
		// )
		// .subscribe((response :any) =>
		// {
		// 	if(response.status)
		// 	{
		// 	//this.changeEvaluationStatus(e);
		// 	e.specialityKey === 'medical_doctor'?this.mainService.setenableSaveRecordMedicalDoctor(true): e.specialityKey==='hbot'?this.mainService.setenableSaveRecordHbot(true):this.mainService.setenableSaveRecordManualSpeciality(true)
		// 	// this.mainService.setenableSaveRecordMedicalDoctor(true);
		// 	// this.storageData.set_enableSaveRecordMedicalDoctor_LocalStorageData(this.mainService.isenableSaveRecordMedicalDoctor())
		// 	this.appointmentIdRefresh = e['appId'];
		// 	this.fromRefresh = 'start';

		// 	this.subject.refreshStartEval(e);
		// 	this.activeModal.close();
		// 	}
		// 	else
		// 	{
		// 		this.toastrService.error(response.message, 'Error')
		// 	}
		// })
	}
	onNavigateTo() {
		this.activeModal.close();
	}

	public disableSaveRecord(e) {
		if(e){
		  this.subject.setAppointmentDetails(e);
		}
		this.localStorage.set('appdata',JSON.stringify({...e,evalFrom:'monthview'}));
		this.calendarEvaluationService.EnabledFlow(e, 'specialtyWithTemplateType');
		this.appointmentIdRefresh = e['appId'];
		this.fromRefresh = 'start';
		e['showCheck'] = true;
		this.subject.refreshStartEval(e);
		this.activeModal.close();
	}

	openPatient(event) {
		this.getVisitSessions();
		// this.subject.refreshPatientProfile(app)
		if (this.patientData.appId === event.appId && this.PatientRecord) {
			this.PatientRecord = false;
			return;
		}
		if (event != undefined && event.length != 0) {
			this.patientData = event;
			this.PatientRecord = true;
		}
		if (!this.patientData['DOB']) {
			this.patientData['DOB'] = 'N/A';
		}
		this.requestService
			.sendRequest(
				DoctorCalendarUrlsEnum.get_checked_in_patients,
				'POST',
				REQUEST_SERVERS.kios_api_path,
				{
					case_ids: [this.patientData.case_id],
					current_date: convertDateTimeForSending(this.storageData, new Date()),
				},
			)
			.subscribe((resssssss: any) => {
				let res = resssssss;
				for (let i = 0; i < res.result.data.case_patients.length; i++) {
					if (res.result.data.case_patients[i].id === this.patientData.case_id) {
						this.patientData['status'] = 'N/A';
						this.patientData['checkedIn'] = 'N/A';
						for (let c = 0; c < res.result.data.case_patients[i].patient_sessions.length; c++) {
							if (
								res.result.data.case_patients[i].patient_sessions[c].appointment_id ===
								this.patientData.appId
							) {
								this.patientData['status'] =
									res.result.data.case_patients[i].patient_sessions[c].status;
								if (res.result.data.case_patients[i].patient_sessions[c].status == 'Checked Out') {
									break;
								} else if (
									res.result.data.case_patients[i].patient_sessions[c].status == 'Checked In'
								) {
									this.patientData['status'] =
										res.result.data.case_patients[i].patient_sessions[c].status;
									if (res.result.data.case_patients[i].patient_sessions[c].updated_at) {
										this.patientData['checkedIn'] =
											res.result.data.case_patients[i].patient_sessions[c].updated_at;
									} else {
										this.patientData['checkedIn'] = 'N/A';
									}
								}
							}
						}
						if (res.result.data.case_patients[i].url) {
							this.patientData['picture'] = res.result.data.case_patients[i].url;
						} else {
							this.patientData['picture'] = this.defaultDoctorImageUrl;
						}
						if (res.result.data.case_patients[i].company_name) {
							this.patientData['companyName'] = res.result.data.case_patients[i].company_name;
						} else {
							this.patientData['companyName'] = 'N/A';
						}
						if (res.result.data.case_patients[i].type) {
							this.patientData['case_type_name'] = res.result.data.case_patients[i].type;
						} else {
							this.patientData['case_type_name'] = 'N/A';
						}
						if (res.result.data.case_patients[i].dob) {
							this.patientData['DOB'] = res.result.data.case_patients[i].dob;
						} else {
							this.patientData['DOB'] = 'N/A';
						}

						this.cdr.markForCheck();
					} else {
						this.patientData['status'] = 'N/A';
						this.patientData['checkedIn'] = 'N/A';
						this.patientData['DOB'] = 'N/A';
						this.patientData['companyName'] = 'N/A';
						this.patientData['case_type_name'] = 'N/A';
						this.patientData['picture'] = this.defaultDoctorImageUrl;

						this.cdr.markForCheck();
					}
				}
				if (res.result.data.length === 0) {
					this.patientData['status'] = 'N/A';
					this.patientData['checkedIn'] = 'N/A';
					this.patientData['DOB'] = 'N/A';
					this.patientData['companyName'] = 'N/A';
					this.patientData['case_type_name'] = 'N/A';
					this.patientData['picture'] = this.defaultDoctorImageUrl;

					this.cdr.markForCheck();
				}
				if (this.patientData.checkedIn != 'N/A') {
					this.patientData.checkedIn = convertDateTimeForRetrieving(
						this.storageData,
						new Date(this.patientData.checkedIn),
					);
				}
			});
	}

	getPaitentDataFromAppointment(event) {
		
		this.getVisitSessions();
		if (this.patientData.appId === event.appId && this.PatientRecord) {
			this.PatientRecord = false;
			return;
		}
		if (event) {
			this.PatientRecord = true;
		}
		

		this.patientData['status'] = event['patient_status'] ? event['patient_status'] : 'N/A';
		this.patientData['checkedIn'] = 'N/A';
		this.patientData['DOB'] = event['DOB'] ? event['DOB'] :'N/A';
		this.patientData['companyName'] = event['companyName'] ? event['companyName'] : 'N/A';
		this.patientData['case_type_name'] = event['case_type_name'] ? event['case_type_name'] : 'N/A';
		this.patientData['picture'] = this.defaultDoctorImageUrl;

		if (event?.patientSession?.slug == 'checked_in') {
			this.patientData['status'] = event?.patient_status;
			if (event?.patientSession?.updated_at) {
				this.patientData['checkedIn'] = event?.patientSession?.updated_at;
			}
		}

		this.cdr.markForCheck();
	}

	ngAfterViewInit(): void {
		this.isProviderLoggedIn();
	}
	isProviderLogedIn = false;
	isTechnicianLogedIn = false;
	isProviderLoggedIn() {
		this.storageData.loggedInUser() == UsersType.PROVIDER ? (this.isProviderLogedIn = true) : false;
		// this.isProviderLogedIn = this.storageData.isDoctor();
	}
	setConditionalExtraParamsForTechnicianGet(element?) {
		//IN CASE PROVIDER BASE/SPECIALTY BASE  APPOINTMENT (LOGIN AS PROVDER)
		let loggedUserID = JSON.stringify(this.storageData.getUserId());
		// this.data.forEach(element => {
		element['conditionalExtraApiParamsForTechnicianGet'] = {
			supervisor_id: this.isProviderLogedIn ? loggedUserID : null,
			facility_location_id: element && element.facility_id ? element.facility_id : null,
		};
	}
	setConditionalExtraParamsForTemplatesGet(element?) {
		//IN CASE PROVIDER BASE/SPECIALTY BASE APPOINTMENT (LOGIN AS PROVDER)
		let loggedUserID = JSON.stringify(this.storageData.getUserId());
		element['conditionalExtraApiParamsForTemplateGet'] = {
			facility_location_id: element && element.facility_id ? [element.facility_id] : null,
			specialty_id: element && element.speciality_id ? [element.speciality_id] : null,
			visit_type_id: element && element.appointment_type_id ? [element.appointment_type_id] : null,
			case_type_id: element && element.case_type_id ? [element.case_type_id] : null,
			user_id: this.isProviderLogedIn
				? loggedUserID
				: !this.isProviderLogedIn && element.doctor_info
				? element.doctor_id
				: null,
		};
	}
	setConditionalExtraParamsForProvidersGet(element?) {
		//IN CASE SPECIALTY BASE APPOINTMENT (LOGIN AS TECHNICIAN)
		let loggedUserID = JSON.stringify(this.storageData.getUserId());
		element['conditionalExtraApiParamsForProvidersGet'] = {
			facility_location_id: element && element.facility_id ? [element.facility_id] : null,
			user_id: !this.isProviderLogedIn ? loggedUserID : null,
		};
	}
	isAppointmentHasTransportation(element) {
		let has_tranportation = false;
		if (element && element.transportations && element.transportations.length == 2) {
			element.transportations.forEach((tranport) => {
				if (
					tranport &&
					tranport.type &&
					(tranport.type == this.enumTransportType.from_home ||
						tranport.type == this.enumTransportType.from_medical_office ||
						tranport.type == this.enumTransportType.other)
				) {
					has_tranportation = true;
				}
			});
		}
		element['has_tranportation'] = has_tranportation;
	}
	setDataAfterStartEvaluation(element, visitDetail, index) {
		element['template_id'] = visitDetail && visitDetail.template  && visitDetail.template.type == TemplateType.Dynamic && visitDetail.template?.template_id ? visitDetail.template?.template_id : visitDetail.template?.id;
		element['template_type'] = visitDetail && visitDetail.template && visitDetail.template.type;
		this.setTemplateRecordIfVisitSession(element, visitDetail, index);
		if (element && element.visit_session) {
			element['technician_id'] = visitDetail && visitDetail.technician && visitDetail.technician.id;
			element['provider_id'] = visitDetail && visitDetail.doctor && visitDetail.doctor.id;
			this.setTechnicianRecordIfVisitSession(element, visitDetail, index);
			this.setDoctorRecordIfVisitSession(element, visitDetail, index);
		} else {
			this.setDoctorRecordIfVisitSessionNotCreate(element, visitDetail, index);
			this.setValuesProviders(element, visitDetail, index);
			this.setValuesTechnician(element, visitDetail, index);
			
		}
		this.isAppointmentHasTransportation(element);
		this.setConditionalExtraParamsForTechnicianGet(element);
		this.setConditionalExtraParamsForTemplatesGet(element);
		this.setConditionalExtraParamsForProvidersGet(element);
	}
	SetDataOnPagination(element, visitDetail, index) {
		if (element && element.visit_session) {
			element['provider_id'] = visitDetail && visitDetail.doctor && visitDetail.doctor.id;
			this.setDoctorRecordIfVisitSession(element, visitDetail, index);
		}else{
			//this.setDoctorRecordIfVisitSessionNotCreate(element, visitDetail, index);
			this.setValuesProviders(element, visitDetail, index);
			
		}
		this.isAppointmentHasTransportation(element);
		this.setConditionalExtraParamsForProvidersGet(element);
	}
	setTemplateRecordIfVisitSession(element, visitDetail, index, setTemplateType = 'default') {
		let id = visitDetail['template']?.type == TemplateType.Dynamic && visitDetail['template']?.template_id ? visitDetail['template']?.template_id : visitDetail['template'].id
		let getTemplate = {
			id: id,
			name: visitDetail['template'].name,
			template_id:id,
			template_type : visitDetail['template']?.type
		};
		if (this.templateRef && this.templateRef._results[index]) {
			this.templateRef._results[index]['lists'] = [getTemplate];
			visitDetail && visitDetail.template
				? this.templateRef._results[index].searchForm.patchValue({
						common_ids: setTemplateType == 'default' ? element['template_id'] : getTemplate.id,
				  })
				: null;
		}
	}
	setTechnicianRecordIfVisitSession(element, visitDetail, index, setTechnicianType = 'default') {
		if (visitDetail.technician && this.techniciansRef._results[index]) {
			let getTechnician = {
				id: visitDetail['technician'].id,
				name: 
				`
				${this.getFullName(visitDetail.technician)} 
				${this.getBillingTitle(visitDetail?.technician?.billing_titles_name)? ", "+this.getBillingTitle(visitDetail?.technician?.billing_titles_name):''} 
				${this.getQualifier(visitDetail?.technician?.role_qualifier)? this.getQualifier(visitDetail?.technician?.role_qualifier,this.getBillingTitle(visitDetail?.technician?.billing_titles_name)):''}
				`,
				roleQualifierName:
				`
				${this.getFullName(visitDetail.technician)} 
				${this.getBillingTitle(visitDetail?.technician?.billing_titles_name)? ", "+this.getBillingTitle(visitDetail?.technician?.billing_titles_name):''} 
				${this.getQualifier(visitDetail?.technician?.role_name)? this.getQualifier(visitDetail?.technician?.role_name,this.getBillingTitle(visitDetail?.technician?.billing_titles_name)):''}
				`
			};
			if(this.techniciansRef._results[index]){
				this.techniciansRef._results[index]['lists'] = [getTechnician];
				visitDetail && visitDetail.technician
					? this.techniciansRef._results[index].searchForm.patchValue({
							common_ids:
								setTechnicianType == 'default' ? element['technician_id'] : getTechnician.id,
					  })
					: null;
			}
		}
	}
	setDoctorRecordIfVisitSessionNotCreate(element, visitDetail, index) {
		// ANY LOGGED IN AND PROVIDER BASES APPOINTMENTS (HERE HANDLE IF VISIST SESSION NOT CREATE)
		if (element && element.doctor_info && !element.visit_session) {
			let getDoctor = {
				id:
					element && element.doctor_info && element.doctor_info.user_id
						? element.doctor_info.user_id
						: null,
				name:
					element && element.doctor_info && element.doctor_info
						? this.getFullName(element['doctor_info'], element['billingTitle'])
						: null,
			};
			element['provider_id'] =
				element && element.doctor_info && element.doctor_info.user_id
					? element.doctor_info.user_id
					: null;
			if(this.providersRef._results[index]){
				this.providersRef._results[index]['lists'] = [getDoctor];
				element && element.doctor_info
					? this.providersRef._results[index].searchForm.patchValue({
							common_ids: element.doctor_info.user_id,
					  })
					: null;
			}
		}
	}
	setDoctorRecordIfVisitSession(element, visitDetail, index, setProviderType = 'default') {
		if (visitDetail.doctor && this.providersRef._results[index]) {
			let getDoctor = {
				id: visitDetail['doctor'].id,
				name: this.getFullName(visitDetail['doctor']),
			};
			if(this.providersRef._results[index]){
				this.providersRef._results[index]['lists'] = [getDoctor];
				visitDetail && visitDetail.doctor
					? this.providersRef._results[index].searchForm.patchValue({
							common_ids: setProviderType == 'default' ? element['provider_id'] : getDoctor.id,
					  })
					: null;
			}
		}
	}

	
	getRowClass = (row) => {
		return {
		  'row-color': row.appointment_status_slug ==='completed'? true : false
		};
	 }

	setValuesProviders(element, visitDetail, index) {
		let isLoggedTechnician: any = this.storageData.getRole();
		// this.data.forEach((element,index) => {
		if (
			(element.doctor_info && this.isProviderLogedIn) ||
			(element.doctor_info &&
				!this.isProviderLogedIn &&
				isLoggedTechnician &&
				this.storageData.loggedInUser() == UsersType.TECHNICIAN)
		) {
			// PROVIDER BASE APPOINTMENT
			element['selectedMultipleFieldFiterProviders'] = [
				{
					id: element && element.doctor_id ? element.doctor_id : null,
					name:
						this.storageData.loggedInUser() == UsersType.TECHNICIAN
							? this.getFullName(element.doctor_info, element.billingTitle)
							: this.getFullName(),
				},
			];
			if (this.providersRef._results[index]) {
				this.providersRef._results[index]['lists'] = element['selectedMultipleFieldFiterProviders'];
				element && element.selectedMultipleFieldFiterProviders
					? this.providersRef._results[index].searchForm.patchValue({
							common_ids: element.doctor_id ? element.doctor_id : null,
					  })
					: null;
			}
		} else if (!element.doctor_info && this.isProviderLogedIn) {
			// LOGGED IN AS PROVIDER SPECIALITY BASES APPOINTMENTS
			let loggedUser = this.storageData.getBasicInfo();
			if (
				this.providersRef._results[index] &&
				this.providersRef._results[index].lists &&
				this.providersRef._results[index].lists.length > 0 &&
				element &&
				element.visit_session
			) {
				// IF VISIT CREATE THEN SET RECORD
				element['selectedMultipleFieldFiterProviders'] = [
					{
						id:
							this.providersRef._results[index] &&
							this.providersRef._results[index].lists &&
							this.providersRef._results[index].lists[0].id
								? this.providersRef._results[index].lists[0].id
								: null,
						name:
							this.providersRef._results[index] &&
							this.providersRef._results[index].lists &&
							this.providersRef._results[index].lists[0].name
								? this.providersRef._results[index].lists[0].name
								: null,
					},
				];
			} else {
				element['selectedMultipleFieldFiterProviders'] = [
					{
						id: loggedUser && loggedUser.id ? loggedUser.id : null,
						name:
							loggedUser && loggedUser.first_name && loggedUser.last_name
								? this.getFullName(loggedUser)
								: null,
					},
				];
			}
			if (this.providersRef._results[index]) {
				this.providersRef._results[index]['lists'] = element['selectedMultipleFieldFiterProviders'];
				element && element.selectedMultipleFieldFiterProviders
					? this.providersRef._results[index].searchForm.patchValue({
							common_ids:
								element &&
								element.selectedMultipleFieldFiterProviders &&
								element.selectedMultipleFieldFiterProviders[0].id
									? element.selectedMultipleFieldFiterProviders[0].id
									: null,
					  })
					: null;
				this.appointmentForm.controls['provider_id'].setValue(
					element &&
						element.selectedMultipleFieldFiterProviders &&
						element.selectedMultipleFieldFiterProviders[0].id
						? element.selectedMultipleFieldFiterProviders[0].id
						: null,
				);
			}
			this.appointmentForm;
		} else if (
			!element.doctor_info &&
			!this.isProviderLogedIn &&
			this.storageData.loggedInUser() == UsersType.TECHNICIAN &&
			!element.visit_session
		) {
			// TECHNICIAN LOGGED IN AND SPECIALITY BASES APPOINTMENTS
			this.providersRef._results[index]['lists'] = [];
		}
		// });
	}
	setValuesTechnician(element, visitDetail, index) {
		let loggedUserID = JSON.stringify(this.storageData.getUserId());
		let loggindUserRoles = this.storageData.getRole();
		let logginUserBillingTitle = this.storageData.getBillingTitle();
		if (!this.isProviderLogedIn && this.storageData.loggedInUser() == UsersType.TECHNICIAN) {
			// TECHNICIAN BASE APPOINTMENT
			if (
				this.techniciansRef._results[index] &&
				this.techniciansRef._results[index].lists &&
				this.techniciansRef._results[index].lists.length > 0 &&
				element &&
				element.visit_session
			) {
				// IF VISIT CREATE THEN SET RECORD
				element['selectedMultipleFieldFiterTechnician'] = [
					{
						id:
							this.techniciansRef._results[index] &&
							this.techniciansRef._results[index].lists &&
							this.techniciansRef._results[index].lists[0].id
								? this.techniciansRef._results[index].lists[0].id
								: null,
						name:
							this.techniciansRef._results[index] &&
							this.techniciansRef._results[index].lists &&
							this.techniciansRef._results[index].lists[0].name
								? this.techniciansRef._results[index].lists[0].name
								: null,
					},
				];
			} else {
				element['selectedMultipleFieldFiterTechnician'] = [
					{
						id: loggedUserID ? parseInt(loggedUserID) : null,
						name:
						`${this.getFullName()} 
						${this.getBillingTitle(logginUserBillingTitle)? ", "+this.getBillingTitle(logginUserBillingTitle):''} 
						${this.getQualifier(loggindUserRoles.qualifier)? this.getQualifier(loggindUserRoles.qualifier,this.getBillingTitle(logginUserBillingTitle)):''}
						`,
						roleQualifierName:
						`
						${this.getFullName()} 
						${this.getBillingTitle(logginUserBillingTitle)? ", "+this.getBillingTitle(logginUserBillingTitle):''} 
						${this.getQualifier(loggindUserRoles.name)? this.getQualifier(loggindUserRoles.name,this.getBillingTitle(logginUserBillingTitle)):''}
						`
					},
				];
			}
			if(this.techniciansRef._results[index]){
				this.techniciansRef._results[index]['lists'] =
					element['selectedMultipleFieldFiterTechnician'];
				element && element.selectedMultipleFieldFiterTechnician
					? this.techniciansRef._results[index].searchForm.patchValue({
							common_ids:
								element &&
								element.selectedMultipleFieldFiterTechnician &&
								element.selectedMultipleFieldFiterTechnician[0].id
									? element.selectedMultipleFieldFiterTechnician[0].id
									: null,
					  })
					: null;
			}
		}
		// });
	}
	getFirstName(firstName): string {
		this.first_name = firstName;
		return this.first_name ? this.first_name : '';
	}

	getMiddleName(MiddleName) {
		this.middle_name = MiddleName;
		return this.middle_name ? this.middle_name : '';
	}

	getLastName(lastName) {
		this.last_name = lastName;
		return this.last_name ? this.last_name : '';
	}

	getBillingTitle(billingTitle) {
		this.billing_title = billingTitle;
		return this.billing_title ? this.billing_title : ''
	}

	getFullName(data = this.storageData.getBasicInfo(), billingTitle?) {
		if(billingTitle && billingTitle?.name) {
			return (
				this.getFirstName(data && data.first_name ? data.first_name : null) +
				' ' +
				this.getMiddleName(data && data.middle_name ? data.middle_name : null) +
				' ' +
				this.getLastName(data && data.last_name ? data.last_name : null) +
				', ' +
				this.getBillingTitle(billingTitle.name)
			)
		}
		else {
			return (
				this.getFirstName(data && data.first_name ? data.first_name : null) +
				' ' +
				this.getMiddleName(data && data.middle_name ? data.middle_name : null) +
				' ' +
				this.getLastName(data && data.last_name ? data.last_name : null)
			)
		}
	}
	modalClose() {
		this.doctorCalendarService.appointmentsModal.close();
	}
	setDefaultTemplate(event) {
	
	}
	// changeEvaluationStatus(e) {
	// 	this.subscription.push(
	// 		this.requestService
	// 			.sendRequest(
	// 				DoctorCalendarUrlsEnum.updateEvaulationStatus,
	// 				'POST',
	// 				REQUEST_SERVERS.schedulerApiUrl,
	// 				{
	// 					appointmentId: e['appId'],
	// 					statusId: 3,
	// 				},
	// 			)
	// 			.subscribe((data) => {
	// 			}),
	// 	);
	// }
	setForm() {
		this.addCptForm = this.fb.group({
			cpt_codes_ids:[],
		});
	}
	addModal(model, data?,ev?,isDisabled?) {
		if(isDisabled){
			ev.stopPropagation();
		}else{
			this.setForm();
			this.currAppointDateListId = this._service.appointments['date_list_id']?this._service.appointments['date_list_id']?this._service.appointments['date_list_id']:this._service.appointments[0]['date_list_id']?this._service.appointments[0]['date_list_id']:null:null;
			this.currappointmentdta = data;
			this.typeForAppointment = this.currappointmentdta && this.currappointmentdta['appointment_type_id'];		
			this.selectedCPTs = data['appointment_cpt_codes']&&data['appointment_cpt_codes'].map((cpt)=> cpt['billingCode']);
			let cpt_ids = this.selectedCPTs.map(x => x.id);
			this.addCptForm.patchValue({cpt_codes_ids:cpt_ids});
	
			this.lstCptorModifiers = [];
			let ngbModalOptions: NgbModalOptions = {
				backdrop: 'static',
				keyboard: false,
				windowClass: 'modal_extraDOc',
			};
			this.cptmodalRef = this.ShowModalOpener.open(model, ngbModalOptions);
		}
	}
	createAppointmentsWithCpts(addCptForm:FormGroup){
		this.loadSpin = true;
		let appId = this.currappointmentdta && this.currappointmentdta['appId'];
		let cpts_ids = addCptForm.get('cpt_codes_ids').value?addCptForm.get('cpt_codes_ids').value:[];
		this.cptmodalRef.close();
		this.subscription.push(this.requestService.sendRequest(
			DoctorCalendarUrlsEnum.createMultiAppointWithCPTS,
			'POST',
			REQUEST_SERVERS.schedulerApiUrl,
				{
					appointment_id: appId,
					cpt_codes: [...cpts_ids],
					time_zone: stdTimezoneOffset()
				}
		).subscribe((res:any)=>{
			if(res.message === 'success' || res?.result?.data?.is_multi){
				this.loadSpin = false;
				let data = res && res.result && res.result['data'];
				if(res?.result?.data?.is_multi){
					data['appointments'] = data['appointment'];
					delete res['appointment'];
				}
				this.getAppointmentsData(data,appId);
				if(res && res.result && res.result['data'] && res.result['data']['msg_alert_1']){
					this.toastrService.success(res && res.result && res.result['data'] && res.result['data']['msg_alert_1'],'Success')  
				}if(res && res.result && res.result['data'] && res.result['data']['msg_alert_2']){
					this.toastrService.success(res && res.result && res.result['data'] && res.result['data']['msg_alert_2'],'Success')  
				}
			}
		},(err)=>{
			this.loadSpin = false;
		}));
	}
	SelectionValueChangeCPT(ev:any){
		if(ev){
			this.addCptForm.patchValue({cpt_codes_ids:ev['formValue']});
		}
	}
	getAppointmentsData(updatedAppointentsData:any,appId:any){
		let timeSpan;
		let tempApp = updatedAppointentsData;
		if(tempApp && tempApp['appointments']){
		this.data = [];
		for (let i = 0; i < tempApp['appointments'].length; i++) {
			timeSpan = tempApp['appointments'][i]['time_slots'];
			var start: any = convertDateTimeForRetrieving(
				this.storageData,
				new Date(tempApp['appointments'][i]['scheduled_date_time']),
			);
			var end = new Date(start.getTime() + timeSpan * 60000);
			let startTime = new Date(start).toString().substring(16, 21);
			let endTime = new Date(end).toString().substring(16, 21);
			startTime = this.convert12(startTime);
			endTime = this.convert12(endTime);
			let deleteApp = false;
			let updateApp = false;
			if (
				this.aclService.hasPermission(this.userPermissions.appointment_delete) ||
				this.storageData.isSuperAdmin()
			) {
				deleteApp = true;
			}
			if (
				this.aclService.hasPermission(this.userPermissions.appointment_edit) ||
				this.storageData.isSuperAdmin()
			) {
				updateApp = true;
			}
			let can_access = false;
			if (
				this.aclService.hasPermission(this.userPermissions.start_evaluation) ||
				this.storageData.isSuperAdmin()
			) {
				can_access = true;
			}

			let newApptData = {
				date_list_id:this.currAppointDateListId,
				updateApp: updateApp,
				deleteApp: deleteApp,
				can_access: can_access,
				startEval: can_access,
				start: start,
				end: end,
				color: tempApp.color,
				facility_name: tempApp['appointments'][i]['availableSpeciality']&&tempApp['appointments'][i]['availableSpeciality']['facilityLocation']&&tempApp['appointments'][i]['availableSpeciality']['facilityLocation']['facility']&&tempApp['appointments'][i]['availableSpeciality']['facilityLocation']['facility']['name'],
				facility_location_qualifier:tempApp['appointments'][i]['availableSpeciality']&&tempApp['appointments'][i]['availableSpeciality']['facilityLocation']&&tempApp['appointments'][i]['availableSpeciality']['facilityLocation']['qualifier'],
				facility_qualifier: tempApp['appointments'][i]['availableSpeciality']&&tempApp['appointments'][i]['availableSpeciality']['facilityLocation']&&tempApp['appointments'][i]['availableSpeciality']['facilityLocation']['facility']&&tempApp['appointments'][i]['availableSpeciality']['facilityLocation']['facility']['qualifier'],
				status: tempApp['appointments'][i]['showUpStatus'],
				showUpStatus:tempApp['appointments'][i]['showUpStatus'],
				facility_id: tempApp['appointments'][i]['availableSpeciality']&&tempApp['appointments'][i]['availableSpeciality']['facility_location_id'],
				allow_multiple_cpt_codes:tempApp['appointments'][i] && tempApp['appointments'][i]['appointmentType'] && tempApp['appointments'][i]['appointmentType']['specialityVisitType']?tempApp['appointments'][i] && tempApp['appointments'][i]['appointmentType'] && tempApp['appointments'][i]['appointmentType']['specialityVisitType']&&tempApp['appointments'][i]['appointmentType']['specialityVisitType'][0]&&tempApp['appointments'][i]['appointmentType']['specialityVisitType'][0].allow_multiple_cpt_codes:null,
				appointmentType:tempApp['appointments'][i] && tempApp['appointments'][i]['appointmentType'],
				patientName: tempApp['appointments'][i]['patient']['middle_name']? tempApp['appointments'][i]['patient']['first_name'] +' ' +tempApp['appointments'][i]['patient']['middle_name'] +' ' +
				tempApp['appointments'][i]['patient']['last_name']: tempApp['appointments'][i]['patient']['first_name'] +' ' +tempApp['appointments'][i]['patient']['last_name'],
				first_name:tempApp['appointments'][i]['patient']['first_name'],
				middle_name: tempApp['appointments'][i]['patient']['middle_name'],
				last_name: tempApp['appointments'][i]['patient']['last_name'],
				title: tempApp['appointments'][i]['appointment_title'],
				appointment_title:tempApp['appointments'][i]['appointment_title'],
				picture: tempApp['appointments'][i]['picture'],
				available_doctor_id: tempApp['appointments'][i]['available_doctor_id'],
				doctor_id: tempApp['appointments'][i]['availableDoctor'] && tempApp['appointments'][i]['availableDoctor']['doctor_id'],
				patient_id: tempApp['appointments'][i]['patient_id'],
				chart_id: tempApp['appointments'][i]['chart_id'],
				chart_id_formatted: tempApp['appointments'][i]['chart_id_formatted'],
				is_active: tempApp['appointments'][i]['is_active'],
				priority_id: tempApp['appointments'][i]['priority_id'],
				speciality_id: tempApp['appointments'][i]['availableSpeciality'] && tempApp['appointments'][i]['availableSpeciality']['speciality']&& tempApp['appointments'][i]['availableSpeciality']['speciality']['id'],
				availableSpeciality:tempApp['appointments'][i]['availableSpeciality'],
				speciality_key: tempApp['appointments'][i]['availableSpeciality'] && tempApp['appointments'][i]['availableSpeciality']['speciality']&& tempApp['appointments'][i]['availableSpeciality']['speciality']['speciality_key'],
				confirmation_status: tempApp['appointments'][i]['confirmation_status'],
				speciality_name: tempApp['appointments'][i]['availableSpeciality'] && tempApp['appointments'][i]['availableSpeciality']['speciality']&& tempApp['appointments'][i]['availableSpeciality']['speciality']['name'],
				case_id: tempApp['appointments'][i]['case_id'],
				case_type_id: tempApp['appointments'][i]['case_type_id'],
				case_type_name: tempApp['appointments'][i]['case']&&tempApp['appointments'][i]['case']['caseType']&&tempApp['appointments'][i]['case']['caseType']['name'],
				appointment_billable: tempApp['appointments'][i].billable,
				billable:tempApp['appointments'][i].billable,
				has_app: tempApp['appointments'][i]['by_health_app'],
				by_health_app:tempApp['appointments'][i]['by_health_app'],
				appointment_type_id: tempApp['appointments'][i]['appointmentType'] && tempApp['appointments'][i]['appointmentType']['id'],
				appointment_type_slug: tempApp['appointments'][i]['appointmentType'] && tempApp['appointments'][i]['appointmentType']['slug'],
				appointment_type_description: tempApp['appointments'][i] && tempApp['appointments'][i]['appointmentType'] && tempApp['appointments'][i]['appointmentType']['name']?tempApp['appointments'][i]['appointmentType']['name']:null,
				appointment_type_qualifier: tempApp['appointments'][i]['appointment_type_qualifier'],
				appointment_priority_id: tempApp['appointments'][i]['priority_id'],
				appointment_status: tempApp['appointments'][i]['appointmentStatus'] && tempApp['appointments'][i]['appointmentStatus']['name'],
				appointmentStatus:tempApp['appointments'][i]['appointmentStatus'],
				appointment_status_slug: tempApp['appointments'][i]['appointmentStatus'] && tempApp['appointments'][i]['appointmentStatus']['slug'],
				appointment_visit_state_id: tempApp['appointments'][i]['appointment_visit_state_id'],
				appointment_visit_state_name: tempApp['appointments'][i]['appointment_visit_state_name'],
				appointment_visit_state_slug: tempApp['appointments'][i]['appointment_visit_state_slug'],
				available_doctor_is_provider_assignment:tempApp['appointments'][i]['availableDoctor']?tempApp['appointments'][i]['availableDoctor']['is_provider_assignment'] ? true:false:false,
				visit_status_slug: tempApp['appointments'][i]['patientSessions'] && tempApp['appointments'][i]['patientSessions']['visitStatus']&& tempApp['appointments'][i]['patientSessions']['visitStatus']['slug'],
				patientSessions:tempApp['appointments'][i]['patientSessions'],
				patientSession:tempApp['appointments'][i]['patientSessions'],
				scheduled_date_time: tempApp['appointments'][i]['scheduled_date_time'],
				comments: tempApp['appointments'][i]['comments'],
				approved: undefined,
				is_manual_specialty: tempApp['appointments'][i]['is_manual_specialty'],
				appId: tempApp['appointments'][i]['id'],
				id:tempApp['appointments'][i]['id'],
				start_time: startTime,
				appointment_duration: tempApp['appointments'][i]['time_slots'],
				time_slot: tempApp['appointments'][i]['time_slots'],
				time_slots:tempApp['appointments'][i]['time_slots'],
				end_time: endTime,
				availableDoctor:tempApp['appointments'][i]['availableDoctor'],
				doctor_info: tempApp['appointments'][i]['availableDoctor']&&tempApp['appointments'][i]['availableDoctor']['doctor'],
				checkCons: true,
				patient_status: tempApp['appointments'][i]['patient_status'],
				back_dated_check: tempApp['appointments'][i]['back_dated_check'],
				case_status: tempApp['appointments'][i]['case'] && tempApp['appointments'][i]['case']['caseStatus'] &&tempApp['appointments'][i]['case']['caseStatus']['name'] ,
				case:tempApp['appointments'][i]['case'],
				appointment_cpt_codes: tempApp['appointments'][i]['appointmentCptCodes'],
				appointmentCptCodes:tempApp['appointments'][i]['appointmentCptCodes'],
				physician:
				tempApp["appointments"][i]['physicianClinic']?
				tempApp["appointments"][i]['physician_id']:null,
				physician_clinic: tempApp["appointments"][i]['physicianClinic'],
				physicianClinic:tempApp["appointments"][i]['physicianClinic'],
				transportations: tempApp['appointments'][i]['transportations'],
				reading_provider: tempApp['appointments'][i]['reading_provider'],
				reading_provider_id: tempApp['appointments'][i]['reading_provider_id'],
				cd_image: tempApp['appointments'][i]['cd_image'],
				is_transportation: tempApp['appointments'][i]['is_transportation'],
				DOB: tempApp['appointments'][i]['dob'],
				companyName: tempApp['appointments'][i]['company_name'],
			}
			let foundIndex = this.appointments.findIndex(element => element.appId == tempApp['appointments'][i]['id']);
			if(foundIndex != -1){
				if(tempApp && tempApp['appShifted']){
					this.appointments.splice(foundIndex,1)	
				}else{
			     	this.appointments.splice(foundIndex,1,newApptData)
				}
			}else{
				this.appointments.push(newApptData);
			}
		}
	}
	            this.pageNumber = 1;
		        this.data = [];
				this.data = [...this.appointments];
				for (let i = 0; i < this.data.length; i++) {
					if (this.data[i].start < this.update_permission_date) {
						if (this.aclService.hasPermission(this.userPermissions.update_previous_appointment)) {
							this.data[i].update_back = true;
						} else {
							this.data[i].update_back = false;
						}
					} else {
						this.data[i].update_back = true;
					}
				}
				if (this.data.length != 0) {
					if(this.data.length > 10){
						this.loadSpin = false;		
					}
					this.getVisitSessions();
				}
				this.cdr.detectChanges();
			}
			getQualifier(qualifier,isbillingTitle?){
				return isbillingTitle ? `${qualifier ? ' ('+qualifier+')' : ''}` : qualifier ? `, ${qualifier}` : '';
			}
}
