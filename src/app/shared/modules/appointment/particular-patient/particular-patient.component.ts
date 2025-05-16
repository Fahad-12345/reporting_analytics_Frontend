import { MappingFilterObject } from './../../../filter/model/mapping-filter-object';
import { ShareAbleFilter } from '@appDir/shared/models/share-able-filter';
import { EnumApiPath } from './../../../../front-desk/billing/Models/searchedKeys-modal';
import { DatePipeFormatService } from './../../../services/datePipe-format.service';
import { FacilityUrlsEnum } from './../../../../front-desk/masters/practice/practice/utils/facility-urls-enum';
import { Component, OnInit, ChangeDetectorRef, Output, OnDestroy, ViewChild } from '@angular/core';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
//service
import { AppointmentService } from '../appointment.service';
import { SchedulingQueueService } from '../scheduling-queue/scheduling-queue.service';
//modals
import { DeleteReasonComponent } from '../../doctor-calendar/modals/delete-reason/delete-reason.component';
import { UpdateAppoitModalComponent } from '../../doctor-calendar/modals/update-appoit-modal/update-appoit-modal.component';
import { AddToWaitingListModalComponent } from '../modals/add-to-waiting-list-modal/add-to-waiting-list-modal.component';
import { DoctorCalendarService } from '../../doctor-calendar/doctor-calendar.service';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { AppointmentSubjectService } from '../subject.service';
import { SubjectService } from '../../doctor-calendar/subject.service';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Title } from '@angular/platform-browser';
import { StorageData, HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { Router } from '@angular/router';
import { AssignSpecialityUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-speciality/assign-speciality-urls-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { DoctorCalendarUrlsEnum } from '../../doctor-calendar/doctor-calendar-urls-enum';
import { AddToBeSchedulledUrlsEnum } from '@appDir/scheduler-front-desk/modules/add-to-be-scheduled/add-to-be-scheduled-list-urls-enum';
import { AppointmentUrlsEnum } from '../appointment-urls-enum';
import { AclServiceCustom } from '../../../../acl-custom.service';
import { AssignRoomsUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-rooms/assign-rooms-urls-enum';
import { Pagination } from '@appDir/shared/models/pagination';
import { Socket } from 'ngx-socket-io';
import { OrderEnum, ParamQuery } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { Subscription, Subject, map } from 'rxjs';
import { Page } from '@appDir/front-desk/models/page';
import { Location } from '@angular/common';
import { convertDateTimeForRetrieving, convertDateTimeForSending, getIdsFromArray, makeDeepCopyArray, removeEmptyAndNullsFormObject } from '@appDir/shared/utils/utils.helpers';
import { ViewAppoitModalComponent } from '../../doctor-calendar/modals/view-appointment-modal/view-appoointment-modal.component';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { findIndexInData } from '../../ngx-datatable-custom/utils/common-functions';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';

@Component({
	selector: 'app-particular-patient',
	templateUrl: './particular-patient.component.html',
	styleUrls: ['./particular-patient.component.scss'],
})
export class ParticularPatientComponent extends PermissionComponent implements OnInit, OnDestroy {
	visitStatusSelectedMultiple: any = null;
	specSelectedMultiple: any = null;
	docSelectedMultiple: any = null;
	appTypeSelectedMultiple: any = null;
	clinicSelectedMultiple: any[] = [];
	caseTypeSelectedMultiple: any = null;
	appointmentStatusSelectedMultiple: any = null;
	myForm: FormGroup;
	public allSpec = [{ id: 0, name: 'Specialty' }];
	public deleteAllKios: any = [];
	public isKiosPatient: any = false;
	public deleteAll: any = [];
	public allChecked = false;
	public allClinic = [{ id: 0, name: 'Location' }];
	public patientId: any;
	public caseId: any;
	public appointmentStatus = [];
	public filteredAppointmentStatus = [];
	public allDisabledAppointmentStatus = [];
	public allClinicIds: any = [];
	public visitType = [{ description: 'Appointment Type', id: 0 }];
	public visitStatus = [];
	public caseType: any;
	public isOpenFilters: any = true;
	public allDoctors: any = [{ user_id: 0, last_name: 'Provider' }];
	public delayCheck: any = false;
	public check: any;
	public now: any;
	public getStartTime: any;
	public currentDateTime: Date = new Date();
	public endDateTime: any = new Date();
	public delay: any = [];
	public data = [];
	public visitTypeFilter: any = 'Visit Type';
	public visitStatusFilter: any = 'Visit Status';
	public scheduleTypeFilter: any = 'Schedule Type';
	public app_refresher;
	showRefreshButtonAL: boolean = false;
	intervalID: any;
	subscription: Subscription[] = [];
	page: Page;
	queryParams: ParamQuery;
	activeModalViewAppointment:NgbModalRef;

	apiPath=REQUEST_SERVERS.kios_api_path  
	eventsSubjectAppointment: Subject<any> = new Subject<any>();
	EnumApiPathFilter=EnumApiPath;
	selectedMultipleFieldFiter: any = {
		case_ids: [],
	};
	conditionalExtraApiParamsLocation:any;

	@ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('apptList') appointmentListTable: DatatableComponent;
	customizedColumnComp: CustomizeColumnComponent;
	@ViewChild(CustomizeColumnComponent) set con(con: CustomizeColumnComponent) {
		if (con) { // initially setter gets called with undefined
			this.customizedColumnComp = con;
		}
	}
	modalCols :any[] = [];
	cols: any[] = [];
	alphabeticColumns:any[] =[];
	colSelected: boolean = true;
  	isAllFalse: boolean = false;
	particularPatientListingTable: any;

	constructor(public datePipeService: DatePipeFormatService ,
		aclService: AclService,
		router: Router,
		public aclCustom: AclServiceCustom,
		private customDiallogService: CustomDiallogService,
		public schedulingService: SchedulingQueueService,
		public openModal: NgbModal,
		public  route: ActivatedRoute,
		public AppointmentService: AppointmentService,
		public cdr: ChangeDetectorRef,
		public doctorSubjectService: SubjectService,
		public subjectService: AppointmentSubjectService,
		public updateModal: NgbModal,
		public doctorCalendarService: DoctorCalendarService,
		public formBuilder: FormBuilder,
		private toastrService: ToastrService,
		titleService: Title,
		private storageData: StorageData,
		protected requestService: RequestService,
		private socket: Socket,
		public commonService: DatePipeFormatService,
		private location: Location,
		private localStorage: LocalStorage,
		private modalService: NgbModal,
	) {
		super(aclService, router, route, requestService, titleService);
		this.page = new Page();
		this.page.pageNumber = 0;
		this.page.size = 10;
		this.caseId = Number(this.router.url.split('/')[4]);
		this.getClinic();
		this.getDoctors();
		this.getSpeciality();
		this.getAllAppointmentType();
		this.createForm();
		this.getAllStatus();
		this.getVisitStatus();
	}
	ngOnInit() {
		this.conditionalExtraApiParamsLocation={
			allowed_facilities:this.storageData.getFacilityLocations()
		}

			this.requestService
				.sendRequest(
					DoctorCalendarUrlsEnum.caseDetail +
						JSON.stringify(this.caseId) +
						'&route=schduler_app',
					'GET',
					REQUEST_SERVERS.kios_api_path,
				)
				.subscribe((res: any) => {
					this.patientId = res.result.data.patient_id;
					this.caseType = res.result.data.case_type.name;
					this.getAllAppointment({ offset: this.page.pageNumber || 0 });

				})
		this.socket.on('CHANGEINAPPOINTMENTS', (message) => {
			this.showRefreshButtonAL = message === null ? false : (message && message.case_ids.length && message.case_ids.includes(this.caseId)) ? true : false;	
		});
		this.setTitle();
		this.doctorSubjectService.cast.subscribe((res) => {
			if (res == 'delete') {
				this.deleteAllKios = [];
				this.getAllAppointment({ offset: this.page.pageNumber || 0 });
			}
		});
		this.subjectService.castAppointment.subscribe((res) => {
			if (res == 'Appointment Updated') {
				this.getAllAppointment({ offset: this.page.pageNumber || 0 });
			}
		});
		this.subjectService.castWaititngList.subscribe((res) => {
			if (res == 'true') {
				this.getAllAppointment({ offset: this.page.pageNumber || 0 });
			}
		});
		// this.intervalID = setInterval(() => {
		//   if (this.currentDateTime != undefined && this.endDateTime != undefined) {

		//     for (let i = 0; i < this.data.length; i++) {
		//       if (this.data[i].checkedInTime != undefined && this.data[i].appointmentTime != undefined) {
		//         var diff = 0;
		//         this.getStartTime = new Date(this.data[i].appointmentTime)
		//         this.now = convertDateTimeForRetrieving(this.storageData, new Date());
		//         if (this.now.getTime() > this.getStartTime.getTime()) {
		//           diff = this.now.getTime() - this.getStartTime.getTime();
		//         }
		//         else if (this.getStartTime.getTime() > this.now.getTime()) {
		//           diff = this.getStartTime.getTime() - this.now.getTime();
		//         }

		//         var diffDays = Math.floor(diff / 86400000); // days
		//         if (diffDays != 0) {
		//           diffDays = diffDays * 24
		//         }
		//         var diffHrs = Math.floor((diff % 86400000) / 3600000); // hours
		//         diffHrs = diffDays + diffHrs
		//         var diffMins = Math.abs(Math.floor(((diff % 86400000) % 3600000) / 60000));
		//         let totalHourMins;
		//         if (this.now < this.getStartTime) {
		//           totalHourMins = '-' + diffHrs + ' hour' + ':' + diffMins + ' min'
		//         }
		//         else {
		//           totalHourMins = diffHrs + ' hour' + ':' + diffMins + ' min'
		//         }
		//         this.data[i]["delay"] = totalHourMins
		//         this.data[i]["delayCheck"] = false

		//       } else {
		//         this.data[i]["delayCheck"] = true
		//         this.delayCheck = true
		//       }
		//     }
		//   }
		// }, 10000)
		// this.getAllAppointment({ offset: this.page.pageNumber || 0 });
		this.particularPatientListingTable = this.localStorage.getObject('particularPatientTableList' + this.storageData.getUserId());
	}

	ngAfterViewInit() {
		if (this.appointmentListTable?._internalColumns) {
			this.cols = makeDeepCopyArray([...this.appointmentListTable._internalColumns]);
			this.cols.forEach(element => {
				if(this.particularPatientListingTable?.length) {
					let obj = this.particularPatientListingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.particularPatientListingTable?.length) {
				const nameToIndexMap = {};
				this.particularPatientListingTable.forEach((item, index) => {
					nameToIndexMap[item?.header] = index;
				});
				this.cols.sort((a, b) => nameToIndexMap[a?.name] - nameToIndexMap[b?.name]);
			}
			let cols = makeDeepCopyArray(this.cols);
			this.alphabeticColumns = cols.sort(function (a, b) {
				if (a.name < b.name) { return -1; }
				if (a.name > b.name) { return 1; }
				return 0;
			});
			this.onConfirm(false);
		}
	}

	refreshNow() {
		this.showRefreshButtonAL = false;
		this.getAllAppointment({ offset: this.page.pageNumber || 0 })
	}

	ngOnDestroy() {
		if (this.intervalID) {
			clearInterval(this.intervalID);
		}
		clearInterval(this.app_refresher);
		this.socket.removeListener('CHANGEINAPPOINTMENTS');
	}

	/*Form intilaization function*/
	private createForm() {
		this.myForm = this.formBuilder.group({
			clinicName: ['Any', Validators.required],
			specialityName: ['Any', Validators.required],
			doctorName: ['Any', Validators.required],
			priorityName: ['Any', Validators.required],
			facility_location_ids:[null]
		});
	}
	/*Get all specialities*/
	public getSpeciality() {
		this.requestService
			.sendRequest(
				AssignSpecialityUrlsEnum.GetUserInfoBySpecialities,
				'post',
				REQUEST_SERVERS.schedulerApiUrl1,
				{
					per_page: Pagination.per_page,
					page: 1,
					pagination: true,
				},
			)
			.subscribe((response: HttpSuccessResponse) => {
				this.allSpec = [...response.result.data.docs];
				if (this.allSpec && this.allSpec.length != 0) {
					this.myForm.controls['specialityName'].setValue(this.allSpec[0].id);
				}
			});
	}

	// Get all statuses
	public getAllStatus() {
		this.requestService
			.sendRequest(
				AddToBeSchedulledUrlsEnum.getAppointmentStatus,
				'GET',
				REQUEST_SERVERS.schedulerApiUrl1,
			)
			.subscribe((res: any) => {
				this.appointmentStatus = [...res.result.data];
				console.log(this.appointmentStatus);
				this.filteredAppointmentStatus = this.appointmentStatus.map((appointmentStatus)=>{
					return appointmentStatus.name === 'Arrived' ? appointmentStatus : {...appointmentStatus,disabled:true}
				});
				this.allDisabledAppointmentStatus = this.appointmentStatus.map((appointmentStatus)=>{
					return {...appointmentStatus,disabled:true}
				});
			});
	}

	getChange($event: any[], fieldName: string) {
		if($event) {
			this.selectedMultipleFieldFiter[fieldName] =  $event.map(
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

	selectionOnValueChange(e: any,Type?) {
		const info = new ShareAbleFilter(e);
		this.myForm.patchValue(removeEmptyAndNullsFormObject(info));
		this.getChange(e.data, e.label);
		if(!e.data) {
			this.myForm.controls[Type].setValue(null);
		}
	}

	public getVisitStatus() {
		this.requestService
			.sendRequest(AddToBeSchedulledUrlsEnum.GetAllStatus, 'GET', REQUEST_SERVERS.kios_api_path)
			.subscribe((res: any) => {
				let temp = res;
				for (var i = 0; i < res.result.data.length; i++) {
					this.visitStatus[i] = res.result.data[i];
				}
				this.visitStatus = [...this.visitStatus];
			});
	}
	/*Get all appointment types*/
	public getAllAppointmentType() {
		this.requestService
			.sendRequest(
				DoctorCalendarUrlsEnum.getAppointmentTypes,
				'GET',
				REQUEST_SERVERS.schedulerApiUrl1,
			)
			.subscribe((resss: HttpSuccessResponse) => {
				let response = resss.result.data;
				this.visitType = [...response];
				this.visitTypeFilter = this.visitType[0].description;
			});
	}

	getDoctors(name?, id?) {
		let paramQuery: ParamQuery = {
			order: OrderEnum.ASC,
			pagination: false,
			filter: false,
			// per_page: 10,
			// page: 1,
		};
		// let filter = {};
		// id ? (filter['id'] = id) : name ? (filter['doctor_name'] = name) : '';
		// id || name ? (paramQuery.filter = true) : '';
		this.requestService
			.sendRequest('search_doctor', 'GET', REQUEST_SERVERS.fd_api_url, {
				...paramQuery,
				// ...filter
			}).pipe(
			map((response) => {
				let data = response['result']['data'];
				data.map((provider) => {
					provider['name'] = `${provider?.first_name} ${
						provider?.middle_name ? provider?.middle_name : ''
					} ${provider?.last_name}${
						provider?.medical_identifier && provider?.medical_identifier?.billing_title ? ', '+ provider?.medical_identifier?.billing_title?.name : ''
					  }`;
				});
				return data;
			}))
			.subscribe((data) => {
				this.allDoctors = data;
				this.allDoctors = [...this.allDoctors];
				this.myForm.controls['doctorName'].setValue(this.allDoctors[0].id);
			});
	}
	/*Get all clinics*/
	public getClinic() {
		this.allClinicIds = this.storageData.getFacilityLocations();
		this.requestService
			.sendRequest(FacilityUrlsEnum.Facility_list_dropdown_GET, 'GET', REQUEST_SERVERS.fd_api_url)
			.subscribe((res: HttpSuccessResponse) => {
				let response = res.result.data;
				this.allClinic = [...response];
				this.myForm.controls['clinicName'].setValue(this.allClinic[0].id);
			});
	}
	/*Get all appointments of a patient against specific case*/
	// getAllAppointment(pageInfo) {
	// 	this.route.snapshot.pathFromRoot.forEach((path) => {
	// 		if (path && path.params && path.params.caseId) {
	// 			if (!this.caseId) {
	// 				this.caseId = parseInt(path.params.caseId);
	// 				this.requestService
	// 					.sendRequest(
	// 						DoctorCalendarUrlsEnum.caseDetail +
	// 							JSON.stringify(this.caseId) +
	// 							'&route=schduler_app',
	// 						'GET',
	// 						REQUEST_SERVERS.kios_api_path,
	// 					)
	// 					.subscribe((res: any) => {
	// 						debugger;
	// 						this.patientId = res.result.data.patient_id;
	// 						this.caseType = res.result.data.case_type.name;
	// 						if (
	// 							this.currentDateTime != undefined &&
	// 							this.endDateTime != undefined &&
	// 							this.patientId != undefined &&
	// 							this.caseId != undefined
	// 						) {
	// 							let st = new Date(this.currentDateTime);
	// 							st.setMinutes(0);
	// 							st.setHours(0);
	// 							st.setSeconds(0);
	// 							st.setMilliseconds(0);
	// 							let ed = new Date(this.endDateTime);
	// 							ed.setMinutes(59);
	// 							ed.setHours(23);
	// 							ed.setSeconds(59);
	// 							ed.setMilliseconds(59);
	// 							let filters = {
	// 								start_date: convertDateTimeForSending(this.storageData, st),
	// 								end_date: convertDateTimeForSending(this.storageData, ed),
	// 								// "chartNo": this.patientId,
	// 								patient_id: this.patientId,
	// 								case_id: this.caseId,
	// 								facility_location_ids: this.clinicSelectedMultiple
	// 									? this.clinicSelectedMultiple.length
	// 									: this.storageData.getFacilityLocations(),
	// 								speciality_ids: this.specSelectedMultiple ? this.specSelectedMultiple : null,
	// 								doctor_ids: this.docSelectedMultiple ? this.docSelectedMultiple : null,
	// 								appointment_type_ids: this.appTypeSelectedMultiple
	// 									? this.appTypeSelectedMultiple
	// 									: null,
	// 								// "case_type_ids":
	// 								patient_status_ids: this.visitStatusSelectedMultiple
	// 									? this.visitStatusSelectedMultiple.length
	// 									: null,
	// 								appointment_status_ids: this.appointmentStatusSelectedMultiple
	// 									? this.appointmentStatusSelectedMultiple
	// 									: null,
	// 							};
	// 							filters = removeEmptyAndNullsFormObject(filters);
	// 							this.page.pageNumber = pageInfo.offset;
	// 							const PageNumber = this.page.pageNumber + 1;
	// 							this.queryParams = {
	// 								filter: !isObjectEmpty(filters),
	// 								order: OrderEnum.ASC,
	// 								per_page: this.page.size || 10,
	// 								page: PageNumber,
	// 								pagination: true,
	// 							};
	// 							let reqObj = { ...this.queryParams, ...filters };
	// 							this.requestService
	// 								.sendRequest(
	// 									AppointmentUrlsEnum.getAppointmentList_new,
	// 									'POST',
	// 									REQUEST_SERVERS.schedulerApiUrl1,
	// 									reqObj,
	// 								)
	// 								.subscribe(
	// 									(res: HttpSuccessResponse) => {
	// 										this.deleteAll = [];
	// 										this.deleteAllKios = [];
	// 										this.numSelected = 0;
	// 										this.isEnableButtons = true;
	// 										this.allChecked = false;
	// 										this.data = JSON.parse(JSON.stringify(res.result.data));
	// 										this.allData = JSON.parse(JSON.stringify(res.result.data));
	// 										this.getVisitSession();
	// 										// for(let i=0;i<res.result.data.length;i++)
	// 										// {
	// 										//   this.data[i]['facility'] = this.aclCustom.convertFacilityToPracticeLocation(this.data[i]['facility_location_id']);
	// 										// }
	// 										this.allData = this.data;
	// 										this.lastPage = Math.ceil(this.data.length / parseInt(this.counter));
	// 										this.entriesOnLastPage = this.data.length % parseInt(this.counter);
	// 										for (let i = 0; i < this.data.length; i++) {
	// 											this.data[i].appointmentTime = convertDateTimeForRetrieving(
	// 												this.storageData,
	// 												new Date(this.data[i].appointmentTime),
	// 											);
	// 											this.allData[i].appointmentTime = convertDateTimeForRetrieving(
	// 												this.storageData,
	// 												new Date(this.allData[i].appointmentTime),
	// 											);

	// 											if (this.data[i].checkedInTime) {
	// 												this.data[i].checkedInTime = convertDateTimeForRetrieving(
	// 													this.storageData,
	// 													new Date(this.data[i].checkedInTime),
	// 												);
	// 												this.allData[i].checkedInTime = convertDateTimeForRetrieving(
	// 													this.storageData,
	// 													new Date(this.allData[i].checkedInTime),
	// 												);
	// 											}
	// 											this.data[i]['isChecked'] = false;
	// 											if (
	// 												(this.data[i].speciality_id != undefined &&
	// 													this.data[i].facility_location_id != undefined) ||
	// 												this.data[i].doctor_id != undefined
	// 											) {
	// 												this.data[i]['id'] = this.data[i].appointment_id;
	// 												this.allData[i]['id'] = this.allData[i].appointment_id;
	// 											} else {
	// 												this.data[i]['id'] = i;
	// 												this.allData[i]['id'] = i;
	// 											}
	// 											let clinicId = this.data[i].facility_location_id;
	// 											if (
	// 												this.aclService.hasPermission(this.userPermissions.appointment_delete) ||
	// 												this.storageData.isSuperAdmin()
	// 											) {
	// 												this.data[i]['deleteDisable'] = false;
	// 											} else {
	// 												this.data[i]['deleteDisable'] = true;
	// 											}
	// 											if (
	// 												this.aclService.hasPermission(this.userPermissions.appointment_edit) ||
	// 												this.storageData.isSuperAdmin()
	// 											) {
	// 												this.data[i]['updateDisable'] = false;
	// 											} else {
	// 												this.data[i]['updateDisable'] = true;
	// 											}
	// 											if (
	// 												this.aclService.hasPermission(this.userPermissions.appointment_add) ||
	// 												this.storageData.isSuperAdmin()
	// 											) {
	// 												this.data[i]['scheduleDisable'] = false;
	// 											} else {
	// 												this.data[i]['scheduleDisable'] = true;
	// 											}
	// 											if (
	// 												this.aclService.hasPermission(this.userPermissions.waiting_list_add) ||
	// 												this.storageData.isSuperAdmin()
	// 											) {
	// 												this.data[i]['waitingListDisable'] = false;
	// 											} else {
	// 												this.data[i]['waitingListDisable'] = true;
	// 											}
	// 											//   if (this.currentDateTime != undefined && this.endDateTime != undefined) {
	// 											//     for (let i = 0; i < this.data.length; i++) {
	// 											//       if (this.data[i].checkedInTime != undefined && this.data[i].appointmentTime != undefined) {
	// 											//         var diff = 0;
	// 											//         this.getStartTime = new Date(this.data[i].appointmentTime)
	// 											//         this.now = new Date(this.data[i].checkedInTime);
	// 											//         if (this.now.getTime() > this.getStartTime.getTime()) {
	// 											//           diff = this.now.getTime() - this.getStartTime.getTime();
	// 											//         }
	// 											//         else if (this.getStartTime.getTime() > this.now.getTime()) {
	// 											//           diff = this.getStartTime.getTime() - this.now.getTime();
	// 											//         }

	// 											//         var diffDays = Math.floor(diff / 86400000); // days
	// 											//         if (diffDays != 0) {
	// 											//           diffDays = diffDays * 24
	// 											//         }
	// 											//         var diffHrs = Math.floor((diff % 86400000) / 3600000); // hours
	// 											//         diffHrs = diffDays + diffHrs
	// 											//         var diffMins = Math.abs(Math.floor(((diff % 86400000) % 3600000) / 60000));
	// 											//         let totalHourMins;
	// 											//         if (this.now < this.getStartTime) {
	// 											//           totalHourMins = '-' + diffHrs + ' hour' + ':' + diffMins + ' min'
	// 											//         }
	// 											//         else {
	// 											//           totalHourMins = diffHrs + ' hour' + ':' + diffMins + ' min'
	// 											//         }
	// 											//         this.data[i]["delay"] = totalHourMins
	// 											//         this.data[i]["delayCheck"] = false
	// 											//       } else {
	// 											//         this.data[i]["delayCheck"] = true
	// 											//         this.delayCheck = true
	// 											//       }
	// 											//     }
	// 											//   }
	// 										}
	// 										this.applyFilters(false);
	// 									},
	// 									(err) => {
	// 										this.data = [];
	// 									},
	// 								);
	// 						}
	// 					});
	// 			} 
	// 			// else if (this.caseId != undefined && this.patientId != undefined) {
	// 			// 	if (
	// 			// 		this.currentDateTime != undefined &&
	// 			// 		this.endDateTime != undefined &&
	// 			// 		this.patientId != undefined &&
	// 			// 		this.caseId != undefined
	// 			// 	) {
	// 			// 		let st = new Date(this.currentDateTime);
	// 			// 		st.setMinutes(0);
	// 			// 		st.setHours(0);
	// 			// 		st.setSeconds(0);
	// 			// 		st.setMilliseconds(0);
	// 			// 		let ed = new Date(this.endDateTime);
	// 			// 		ed.setMinutes(59);
	// 			// 		ed.setHours(23);
	// 			// 		ed.setSeconds(59);
	// 			// 		ed.setMilliseconds(59);
	// 			// 		let reqObj = {
	// 			// 			start_date: convertDateTimeForSending(this.storageData, st),
	// 			// 			end_date: convertDateTimeForSending(this.storageData, ed),
	// 			// 			patient_id: this.patientId,
	// 			// 			case_id: this.caseId,
	// 			// 			facility_location_ids: this.clinicSelectedMultiple
	// 			// 				? this.clinicSelectedMultiple.length
	// 			// 				: this.storageData.getFacilityLocations(),
	// 			// 			speciality_ids: this.specSelectedMultiple ? this.specSelectedMultiple : null,
	// 			// 			doctor_ids: this.docSelectedMultiple ? this.docSelectedMultiple : null,
	// 			// 			appointment_type_ids: this.appTypeSelectedMultiple
	// 			// 				? this.appTypeSelectedMultiple
	// 			// 				: null,
	// 			// 			// "case_type_ids":
	// 			// 			patient_status_ids: this.visitStatusSelectedMultiple
	// 			// 				? this.visitStatusSelectedMultiple.length
	// 			// 				: null,
	// 			// 			appointment_status_ids: this.appointmentStatusSelectedMultiple
	// 			// 				? this.appointmentStatusSelectedMultiple
	// 			// 				: null,
	// 			// 		};
	// 			// 		reqObj = removeEmptyAndNullsFormObject(reqObj);
	// 			// 		this.requestService
	// 			// 			.sendRequest(
	// 			// 				AppointmentUrlsEnum.getAppointmentList_new,
	// 			// 				'POST',
	// 			// 				REQUEST_SERVERS.schedulerApiUrl1,
	// 			// 				reqObj,
	// 			// 			)
	// 			// 			.subscribe(
	// 			// 				(respp: HttpSuccessResponse) => {
	// 			// 					this.deleteAll = [];
	// 			// 					this.deleteAllKios = [];
	// 			// 					this.numSelected = 0;
	// 			// 					this.isEnableButtons = true;
	// 			// 					this.allChecked = false;
	// 			// 					this.data = JSON.parse(JSON.stringify(respp.result.data));
	// 			// 					this.allData = JSON.parse(JSON.stringify(respp.result.data));
	// 			// 					this.getVisitSession();
	// 			// 					//   for(let i=0;i<this.data.length;i++)
	// 			// 					//     	{
	// 			// 					//           this.data[i]['facility'] = this.aclCustom.convertFacilityToPracticeLocation(this.data[i]['facility_location_id']);
	// 			// 					//         }
	// 			// 					this.lastPage = Math.ceil(this.data.length / parseInt(this.counter));
	// 			// 					this.entriesOnLastPage = this.data.length % parseInt(this.counter);
	// 			// 					for (let i = 0; i < this.data.length; i++) {
	// 			// 						this.data[i]['isChecked'] = false;
	// 			// 						if (
	// 			// 							(this.data[i].speciality_id != undefined &&
	// 			// 								this.data[i].facility_location_id) ||
	// 			// 							this.data[i].doctor_id != undefined
	// 			// 						) {
	// 			// 							this.data[i]['id'] = this.data[i].appointment_id;
	// 			// 							this.allData[i]['id'] = this.allData[i].appointment_id;
	// 			// 						} else {
	// 			// 							this.data[i]['id'] = i;
	// 			// 							this.allData[i]['id'] = i;
	// 			// 						}
	// 			// 						let clinicId = this.data[i].facility_location_id;
	// 			// 						if (
	// 			// 							this.aclService.hasPermission(this.userPermissions.appointment_delete) ||
	// 			// 							this.storageData.isSuperAdmin()
	// 			// 						) {
	// 			// 							this.data[i]['deleteDisable'] = false;
	// 			// 						} else {
	// 			// 							this.data[i]['deleteDisable'] = true;
	// 			// 						}
	// 			// 						if (
	// 			// 							this.aclService.hasPermission(this.userPermissions.appointment_edit) ||
	// 			// 							this.storageData.isSuperAdmin()
	// 			// 						) {
	// 			// 							this.data[i]['updateDisable'] = false;
	// 			// 						} else {
	// 			// 							this.data[i]['updateDisable'] = true;
	// 			// 						}
	// 			// 						if (
	// 			// 							this.aclService.hasPermission(this.userPermissions.appointment_add) ||
	// 			// 							this.storageData.isSuperAdmin()
	// 			// 						) {
	// 			// 							this.data[i]['scheduleDisable'] = false;
	// 			// 						} else {
	// 			// 							this.data[i]['scheduleDisable'] = true;
	// 			// 						}
	// 			// 						if (
	// 			// 							this.aclService.hasPermission(this.userPermissions.waiting_list_add) ||
	// 			// 							this.storageData.isSuperAdmin()
	// 			// 						) {
	// 			// 							this.data[i]['waitingListDisable'] = false;
	// 			// 						} else {
	// 			// 							this.data[i]['waitingListDisable'] = true;
	// 			// 						}
	// 			// 						// if (this.currentDateTime != undefined && this.endDateTime != undefined) {
	// 			// 						//   for (let i = 0; i < this.data.length; i++) {
	// 			// 						//     if (this.data[i].checkedInTime != undefined && this.data[i].appointmentTime != undefined) {
	// 			// 						//       var diff = 0;
	// 			// 						//       this.data[i].appointmentTime = convertDateTimeForRetrieving(this.storageData, new Date(this.data[i].appointmentTime))
	// 			// 						//       this.allData[i].appointmentTime = convertDateTimeForRetrieving(this.storageData, new Date(this.allData[i].appointmentTime))
	// 			// 						//       this.data[i].checkedInTime = convertDateTimeForRetrieving(this.storageData, new Date(this.data[i].checkedInTime))
	// 			// 						//       this.allData[i].checkedInTime = convertDateTimeForRetrieving(this.storageData, new Date(this.allData[i].checkedInTime))

	// 			// 						//       this.getStartTime = new Date(this.data[i].appointmentTime)
	// 			// 						//       this.now = new Date(this.data[i].checkedInTime);
	// 			// 						//       if (this.now.getTime() > this.getStartTime.getTime()) {
	// 			// 						//         diff = this.now.getTime() - this.getStartTime.getTime();
	// 			// 						//       }
	// 			// 						//       else if (this.getStartTime.getTime() > this.now.getTime()) {
	// 			// 						//         diff = this.getStartTime.getTime() - this.now.getTime();
	// 			// 						//       }

	// 			// 						//       var diffDays = Math.floor(diff / 86400000); // days
	// 			// 						//       if (diffDays != 0) {
	// 			// 						//         diffDays = diffDays * 24
	// 			// 						//       }
	// 			// 						//       var diffHrs = Math.floor((diff % 86400000) / 3600000); // hours
	// 			// 						//       diffHrs = diffDays + diffHrs
	// 			// 						//       var diffMins = Math.abs(Math.floor(((diff % 86400000) % 3600000) / 60000));
	// 			// 						//       let totalHourMins;
	// 			// 						//       if (this.now < this.getStartTime) {
	// 			// 						//         totalHourMins = '-' + diffHrs + ' hour' + ':' + diffMins + ' min'
	// 			// 						//       }
	// 			// 						//       else {
	// 			// 						//         totalHourMins = diffHrs + ' hour' + ':' + diffMins + ' min'
	// 			// 						//       }
	// 			// 						//       this.data[i]["delay"] = totalHourMins
	// 			// 						//       this.data[i]["delayCheck"] = false
	// 			// 						//     } else {
	// 			// 						//       this.data[i]["delayCheck"] = true
	// 			// 						//       this.delayCheck = true
	// 			// 						//     }
	// 			// 						//   }
	// 			// 						// }
	// 			// 					}
	// 			// 					this.applyFilters(false);
	// 			// 				},
	// 			// 				(err) => {
	// 			// 					this.data = [];
	// 			// 				},
	// 			// 			);
	// 			// 	}
	// 			// }
	// 		}
	// 	});
	// }

				getAllAppointment(pageInfo) {
					
							if (
								this.patientId != undefined &&
								this.caseId != undefined
							) {
								if (this.currentDateTime > this.endDateTime) {
									this.toastrService.error('Start Date should be less than End Date ', 'Error');
									return;
								}
								let st: any;
								let ed: any;

								if(this.currentDateTime!=null)
								{
									st = new Date(this.currentDateTime)
									st.setMinutes(0)
									st.setHours(0)
									st.setSeconds(0)
									st.setMilliseconds(0)
								}
								else
								{
									st = new Date()
									st.setMinutes(0)
									st.setHours(0)
									st.setSeconds(0)
									st.setMilliseconds(0)
								}
								if(this.endDateTime!=null)
								{
									ed = new Date(this.endDateTime)
									ed.setMinutes(59)
									ed.setHours(23)
									ed.setSeconds(59)
									ed.setMilliseconds(59)
								}
								else
								{
									ed = new Date()
									ed.setMinutes(59)
									ed.setHours(23)
									ed.setSeconds(59)
									ed.setMilliseconds(59)
								}
								
							let facilityLoctions:any[]=this.myForm.get('facility_location_ids').value;
								let filters = {
									start_date: convertDateTimeForSending(this.storageData, st),
									end_date: convertDateTimeForSending(this.storageData, ed),
									patient_id: this.patientId,
									case_ids: [this.caseId],
									facility_location_ids: facilityLoctions
									&& facilityLoctions.length!=0
										? facilityLoctions
										: this.storageData.getFacilityLocations(),
									speciality_ids: this.specSelectedMultiple ? this.specSelectedMultiple : null,
									doctor_ids: this.docSelectedMultiple ? this.docSelectedMultiple : null,
									appointment_type_ids: this.appTypeSelectedMultiple
										? this.appTypeSelectedMultiple
										: null,
									// "case_type_ids":
									patient_status_ids: this.visitStatusSelectedMultiple
										? this.visitStatusSelectedMultiple
										: null,
									appointment_status_ids: this.appointmentStatusSelectedMultiple
										? this.appointmentStatusSelectedMultiple
										: null,

								};
								 filters = removeEmptyAndNullsFormObject(filters);
								this.page.pageNumber = pageInfo.offset;
								const PageNumber = this.page.pageNumber + 1;
								let queryParams = {
									appointment_type:'SCHEDULED',
									filters:filters,
									per_page: this.page.size || 10,
									page: PageNumber,
									paginate: true,
								};
								this.requestService
								.sendRequest(
									AppointmentUrlsEnum.getAppointmentAllDetailsList,
									'POST',
									REQUEST_SERVERS.schedulerApiUrl1,
									queryParams
								).subscribe(
									(res: HttpSuccessResponse) => {
										// this.startLoader = false;
										this.deleteAllKios = []
										this.deleteAll = [];
										// this.isEnableButtons = true;
										this.allChecked = false;
										// this.numSelected = 0
										// this.data = JSON.parse(JSON.stringify(res.result.data.docs));
										let appointmentData:any[]=[] = res.result.data&& res.result.data.docs?res.result.data.docs:[];
										this.page.totalElements=res.result.data && res.result.data.total?res.result.data.total:0
										// this.allData = JSON.parse(JSON.stringify(res.result.data.docs));
										let appointment_ids = [];
										//This is to get all the appointments for the visit session
										appointmentData.forEach((item) =>
										{
											appointment_ids.push(item.id)
										});
										if (appointment_ids.length != 0)
										{
											this.requestService
											.sendRequest(
											AssignRoomsUrlsEnum.getVisitSession,
											'POST',
											REQUEST_SERVERS.fd_api_url,
											{ "appointment_ids": appointment_ids})
											.subscribe((response : any) =>
											{
												response.result.data.forEach((item) =>
												{
				
													appointmentData.forEach((inner) =>
													{
														if (item.appointment_id == inner.id)
														{
															inner['visit_session'] = item.visit_session
														}
													})
												});
										for (let i = 0; i < appointmentData.length; i++) {
											appointmentData[i].scheduled_date_time = convertDateTimeForRetrieving(this.storageData, new Date(appointmentData[i].scheduled_date_time))
											if (appointmentData[i].checkedInTime) {
												appointmentData[i].checkedInTime = convertDateTimeForRetrieving(this.storageData, new Date(appointmentData[i].checkedInTime))
											}
											appointmentData[i]['isChecked'] = false;
											this.data = [...appointmentData];
											let clinicId = this.data[i].facility_location_id
											if (this.aclService.hasPermission(this.userPermissions.appointment_delete)
												|| this.storageData.isSuperAdmin()) {
												this.data[i]['deleteDisable'] = false
											}
											else {
												this.data[i]['deleteDisable'] = true
											}
											if (this.aclService.hasPermission(this.userPermissions.appointment_edit)
												|| this.storageData.isSuperAdmin()) {
												this.data[i]['updateDisable'] = false
											}
											else {
												this.data[i]['updateDisable'] = true
											}
											if (this.aclService.hasPermission(this.userPermissions.appointment_add)
												|| this.storageData.isSuperAdmin()) {
												this.data[i]['scheduleDisable'] = false
											}
											else {
												this.data[i]['scheduleDisable'] = true;
											}
											if (this.aclService.hasPermission(this.userPermissions.waiting_list_add)
												|| this.storageData.isSuperAdmin()) {
												this.data[i]['waitingListDisable'] = false
											}
											else {
												this.data[i]['waitingListDisable'] = true
											}
																	}
											this.data = [...this.data];
											this.startLoader = false;
										
									});
										
									}
									this.startLoader = false;
									// this.applyFilters()	
								
									}, err => {
										this.startLoader = false;
										this.data = [];
									})
							}
	}

	addUrlQueryParams(params?) {
		this.location.replaceState(this.router.createUrlTree([], { queryParams: params }).toString());
	}

	public async getVisitSession() {
		let appointment_ids = [];
		//This is to get all the appointments for the visit session
		this.data.forEach((item) => {
			appointment_ids.push(item.appointment_id);
		});
		if (appointment_ids.length != 0) {
			await this.requestService
				.sendRequest(AssignRoomsUrlsEnum.getVisitSession, 'POST', REQUEST_SERVERS.fd_api_url, {
					appointment_ids: appointment_ids,
				})
				.subscribe((response: any) => {
					response.result.data.forEach((item) => {
						this.data.forEach((inner) => {
							if (item.appointment_id == inner.appointment_id) {
								inner['visit_session'] = item.visit_session;
							}
						});
					});
					this.data = [...this.data];
				});
		}
	}

	/*Change visit type for filters*/
	public visitTypeChange(e) {
		this.visitTypeFilter = e.target.value;
	}
	/*Change visit status for filters*/
	public visitStatusChange(e) {
		this.visitStatusFilter = e.target.value;
	}
	/*Change schedule type for filters*/
	public scheduleTypeChange(e) {
		this.scheduleTypeFilter = e.target.value;
	}

	//Check if Arr contains particular value for the particular key
	public contains(arr, key, val) {
		for (var i = 0; i < arr.length; i++) {
			if (arr[i][key] === val[key]) {
				return true;
			}
		}
		return false;
	}
	/*Filtering Data in particular patient appointment list*/
	public applyFilters(check?) {
		this.allChecked = false;
		this.deleteAll = [];
		this.deleteAllKios = [];
		this.page.pageNumber=0;
		this.getAllAppointment({ offset: this.page.pageNumber || 0 });
}

	

	/*Date change function for filters*/
	public changeDate() {
		if (this.currentDateTime != null && this.endDateTime != null) {
			this.currentDateTime.setSeconds(0);
			this.endDateTime.setSeconds(0);
			this.currentDateTime.setMilliseconds(0);
			this.endDateTime.setMilliseconds(0);
			if (this.currentDateTime > this.endDateTime) {
				this.toastrService.error('Start Date should be less than End Date ', 'Error');
				return;
			} else {
				this.getAllAppointment({ offset: this.page.pageNumber || 0 });
				// this.applyFilters()
			}
		}
	}

	public onChangeStartDate(event)
	{
		if(event.dateValue)
		{
		  this.currentDateTime=new Date(event.dateValue);
		  
		  this.changeDate();
		} 
		else
		{
			this.currentDateTime=null;
			this.changeDate();
			
		}
	}
	public onChangeEndDate(event)
	{
		if(event.dateValue)
		{
		  this.endDateTime=new Date(event.dateValue);
		  
		this.changeDate();		
		} 
		else
		{
			this.endDateTime=null;
			this.changeDate();		
			
		}
	}
	/*Schedule appointment for a patient against kios cases(i.e if patient comes from kios against specific case)*/
	public scheduleAppointment(obj) {
		this.schedulingService.particularPatientInfo = obj;
		this.subjectService.refreshPatient('false');
	}
	/*Edit particular appointment function*/
	public editAppointment(event) {
		this.startLoader = true;
		this.requestService
						.sendRequest(
							AppointmentUrlsEnum.getAppointmentDetails,
							'GET',
							REQUEST_SERVERS.schedulerApiUrl,
							{id:event.id}
						).subscribe(res=>{
							debugger;
							this.startLoader = false;
							let data = res.result.data;
							if (data['physician_clinic']){
							data['physician_clinic'] = {
								physician: {
									first_name: data['physician_clinic']['first_name'],
									last_name:data['physician_clinic']['last_name'],
									middle_name:data['physician_clinic']['middle_name'], 
									name:data['physician_clinic']['name'],
									street_address:data['physician_clinic']['street_address'],
									zip:data['physician_clinic']['zip'],
									city:data['physician_clinic']['city'],
									floor:data['physician_clinic']['floor'],
									state:data['physician_clinic']['state'],
									physician_clinic_id:data['physician_clinic']['id'],
									referring_physician_speciality :data['physician_clinic']['referring_physician_speciality'],
									clinic_id:data['physician_clinic']['clinic_id'],
									id: data['physician_clinic']['id'],
									clinic_location_id:data['physician_clinic']['clinic_locations_id'],
									facility_id: data['physician_clinic']['facility_id'],
									facility_zip: data['physician_clinic']['facility_zip'],
									facility_address: data['physician_clinic']['facility_address'],
									facility_city: data['physician_clinic']['facility_city'],
									facility_state: data['physician_clinic']['facility_state'],						
								}
							}
						}

							let params = {
								"appointment_title": data["appointment_title"],
								"patientName": data['patient'] ? ((data["patient"]['first_name'] || '') + ' ' +(data["patient"]['middle_name'] || '') + ' ' + (data["patient"]['last_name'] || '')) : null,
								"patient_id": data["patient_id"],
								"case_id": data["case_id"],
								"case_type_id":data['case_type']["id"],
								"case_type_name" : data['case_type']["name"],
								"doctor_id": data['doctor_info']?data['doctor_info']['doctor_id']:0,
								"docName":data['doctor_info']?`${data['doctor_info']['first_name']} ${data['doctor_info']['middle_name']?data['doctor_info']['middle_name']:''} ${data['doctor_info']['last_name']}`:null,
								"duration": data["time_slots"],
								"time_slot": data["time_slots"],
								"startDateTime": 				convertDateTimeForRetrieving(this.storageData, new Date(data["scheduled_date_time"])),

								"priority_id": data['priority']["id"],
								"appointment_type_id": data['appointment_type']["id"],
								"comments": data["comments"],
								"facility_id": data['facility_location']['id'],
								"speciality_id": data['speciality']['id'],
								"appointmentId": data['id'],
								"visitTypeid": data['appointment_type']["id"],
								"confirmation_status": data["confirmation_status"],
								cd_image:data['cd_image'],
								is_transportation:data['is_transportation'],
								transportations:data['transportations'],
								physician_clinic: data['physician_clinic'],
								physician: data && data['physician_clinic']?data['physician_clinic']["physician"]:null,
								reading_provider:data['reading_provider'],
								reading_provider_id:data['reading_provider']?data['reading_provider']['id']:null,
								appointment_cpt_codes: data['appointment_cpt_codes'],
								change_cpt_response:true,
							}
							this.doctorCalendarService.updateModalData= {
								...params
							}
							const activeModal = this.updateModal.open(UpdateAppoitModalComponent, {
								
								backdrop: 'static',
								keyboard: false,
								windowClass: 'modal-view',
							});	
						},err=>{
							this.startLoader = false;
						});
		
	}
	
	mapAppointmentDetail(event){
		let viewAppointmentObj;
		debugger;
		// if (event['doctor_id'] != undefined) {
			let readingProivderMiddlename= event["reading_provider"] && event["reading_provider"]['middle_name']?event["reading_provider"]['middle_name']:'';
			event['patient']?	event['patient']['id'] = event['patient_id']:false;
			if (event['physician_clinic']){
				event['physician_clinic'] = {
					physician: {
						first_name: event['physician_clinic']['first_name'],
						last_name:event['physician_clinic']['last_name'],
						middle_name:event['physician_clinic']['middle_name'],
						billingTitle:event['physician_clinic']['billingTitle'],
						name:event['physician_clinic']['name'],
						street_address:event['physician_clinic']['street_address'],
						zip:event['physician_clinic']['zip'],
						floor:event['physician_clinic']['floor'],
						city:event['physician_clinic']['city'],
						state:event['physician_clinic']['state'],
						physician_clinic_id:event['physician_clinic']['id'],
						referring_physician_speciality :event['physician_clinic']['referring_physician_speciality'],
						clinic_id:event['physician_clinic']['clinic_id'],
						id: event['physician_clinic']['id'],
						clinic_location_id:event['physician_clinic']['clinic_locations_id'],
						facility_id: event['physician_clinic']['facility_id'],
						facility_zip: event['physician_clinic']['facility_zip'],
						facility_address: event['physician_clinic']['facility_address'],
						facility_city: event['physician_clinic']['facility_city'],
						facility_state: event['physician_clinic']['facility_state'],	

						
					}
					}
				}

			return  {
				action_performed: event["confirmation_status"],
				change_cpt_response:true,
				 appointmentCptCodes: event["appointment_cpt_codes"] ?event["appointment_cpt_codes"]:[] ,
				appointmentStatus : event["appointment_status"]?{name:event["appointment_status"]['name']}:null,
				appointmentType:null,
				appointment_title:event["appointment_title"],
				availableDoctor:event["doctor_info"]? {doctor_id:event['doctor_info']["id"]}:null,
				reading_provider: event["reading_provider"]? 
				`${event["reading_provider"]['first_name']} ${readingProivderMiddlename} ${event["reading_provider"]['last_name']}`
				:null,
				billable:event["billable"],
				cancelled:false	,			
				cancelled_comments:	""	,	
				caseType:{name:event['case_type']['name']},
				case_id: event["case_id"],
				case_type_id:event['case_type']['id'],
				comments:event["comments"],
				confirmation_status: event["appointment_confirmation_status"],
				doctor_full_name: event['doctor_info']?event['doctor_info']["first_name"] + (event['doctor_info']["middle_name"]?' '+event['doctor_info']["middle_name"]:' ') + (event['doctor_info']["last_name"]) + (event['doctor_info']["billingTitle"]?', '+ event['doctor_info']["billingTitle"] : '') : null,
				evaluation_date_time: convertDateTimeForRetrieving(this.storageData, new Date(event["scheduled_date_time"])),
				facility_location_id: event["facility_location_id"],
				facility_location_name:event['facility_location']["facility"]&&event['facility_location']["facility"]['name'] && event['facility_location']["name"]? event['facility_location']["facility"]['name']+' - '+ event['facility_location']["name"]:
				!event['facility_location']["facility"]  && event['facility_location']["name"]?'- '+event['facility_location']["name"]:null,
				facility_location_qualifier:
				event['facility_location']["facility"]&&
				event['facility_location']["facility"]['qualifier']
				&& 
				event['facility_location']["qualifier"]? event['facility_location']["facility"]['qualifier']+' - '+ 
				event['facility_location']["qualifier"]:!event['facility_location']["facility"]  && 
				event['facility_location']["qualifier"]?'- '
				+	event['facility_location']["qualifier"]:null,
				id: event["id"],
				patient: event['patient'],
				patientSessions: event["patient_session"],
				cd_image: event["cd_image"],
				patient_id: event["patient_id"],
				physician_clinic: event['physician_clinic'],
				physician: event && event['physician_clinic']?event['physician_clinic']["physician"]:null,
				physician_id: null,
				priority: null,
				priority_id:event['priority']["id"],
				scheduled_date_time:
				convertDateTimeForRetrieving(this.storageData, new Date(event["scheduled_date_time"])),
				speciality:{id:event['speciality']["id"],name:event['speciality']["name"],
			qualifier:event['speciality']['qualifier']
			},
				technician_id: null,
				time_slots: event["time_slots"],
				transportations:event["transportations"],
				type_id:event['appointment_type']["id"],
				visit_type: event['appointment_type']['name'],
				visit_status:event['visit_status']['name'],
			}

			// console.log("View Appointment Modal",viewAppointmentObj);
			// return viewAppointmentObj;
	}

	public ViewAppointment(event) {
		this.startLoader = true;
		let viewAppointmentObj;
		this.requestService
						.sendRequest(
							AppointmentUrlsEnum.getAppointmentDetails,
							'GET',
							REQUEST_SERVERS.schedulerApiUrl,
							{id:event.id}
						).subscribe(res=>{
							console.log(res);
							this.startLoader= false;
							if (res && res.result && res.result.data){
							 viewAppointmentObj = {...this.mapAppointmentDetail(res.result.data)};
							 
			const ngbModalOptions: NgbModalOptions = {
				backdrop: 'static',
				keyboard: false,
				windowClass: 'modal-view',
				
			};
		this.activeModalViewAppointment = this.updateModal.open(ViewAppoitModalComponent, ngbModalOptions);
		this.activeModalViewAppointment.componentInstance.viewCurrentAppointment= viewAppointmentObj;
		this.activeModalViewAppointment.componentInstance.onlyView=true;
		this.activeModalViewAppointment.componentInstance.openAsModal=true;
		this.activeModalViewAppointment.result.then(res=>{
		});
							}
						},err=>{
							this.startLoader = false;
						}
						);		
	}
	/*Add appointment to waiting list*/
	public addToWaitingList(event) {
		if (event['doctorId'] != undefined) {
			this.doctorCalendarService.updateModalData = {
				appointmentTitle: event['appointmentTitle'],
				patientName:
					event['patientFirstName'] +
					' ' +
					event['patientMiddleName'] +
					' ' +
					event['patientLastName'],
				chartNo: event['patientId'],
				caseId: event['caseId'],
				docId: event['docId'],
				docName: event['doctorName'],
				duration: event['duration'],
				startDateTime: event['appointmentTime'],
				priorityId: event['priorityId'],
				appointmentTypeId: event['appointmentTypeId'],
				roomId: event['roomId'],
				comments: event['appointmentComments'],
				clinicId: event['facilityId'],
				specId: event['specialityId'],
				appointmentId: event['appointmentId'],
				visitTypeid: event['visitTypeId'],
			};
		} else {
			this.doctorCalendarService.updateModalData = {
				appointmentTitle: event['appointmentTitle'],
				patientName:
					event['patientFirstName'] +
					' ' +
					event['patientMiddleName'] +
					' ' +
					event['patientLastName'],
				chartNo: event['patientId'],
				caseId: event['caseId'],
				docId: 0,
				docName: 'N/A',
				duration: event['duration'],
				startDateTime: event['appointmentTime'],
				priorityId: event['priorityId'],
				appointmentTypeId: event['appointmentTypeId'],
				roomId: event['roomId'],
				comments: event['appointmentComments'],
				clinicId: event['facilityId'],
				specId: event['specialityId'],
				appointmentId: event['appointmentId'],
				visitTypeid: event['visitTypeId'],
			};
		}
		const activeModal = this.updateModal.open(AddToWaitingListModalComponent, {
			size: 'lg',
			backdrop: 'static',
			keyboard: false,
		});
	}
	/*See more and less functionality for filters*/
	public openAndCloseFilters() {
		this.isOpenFilters = !this.isOpenFilters;
	}
	/*No of entries to show in table function*/
	public changeNoOfEntries(e) {
		this.page.size=+e;
		this.page.pageNumber=0
		this.getAllAppointment({offset:this.page.pageNumber})
	}
	/*Particular appointment selected from table to perform  certain action against appointments*/
	public particularSelected(data, e) {
		if (e.checked) {
					if (
						(data.speciality_id != undefined &&
							data.facility_location_id != undefined) ||
							data.doctor_id != undefined
					) {
						data.isChecked = true;
						this.deleteAll.push(data.id);
					} else {
						data.isChecked = true;
						this.deleteAllKios.push(data.id);
					}					

			let is_allchecked=this.data.every(data=>{return data.isChecked});
			if (
				
				is_allchecked
			) {
				this.allChecked = true;
			} 
		} else {
			this.allChecked = false;
					data.isChecked = false;
					if (
						(data.speciality_id != undefined &&
							data.facility_location_id != undefined) ||
							data.doctor_id != undefined
					) {
						this.deleteAll.splice(this.deleteAll.indexOf(data.id), 1);
					} else {
						this.deleteAllKios.splice(this.deleteAllKios.indexOf(data.id), 1);
					}
					data['isChecked'] = false;
		}
	}
	/*All appointment selected from table to perform  certain actions against appointments*/
	public allSelected(e) {
		if (e.checked) {
			this.allChecked = true;
			for (var i = 0; i < this.data.length; i++) {
				if (this.data[i] != undefined) {
					if (this.data[i]['isChecked'] == false) {
						if (
							(this.data[i].speciality_id != undefined &&
								this.data[i].facility_location_id != undefined) ||
							this.data[i].doctor_id != undefined
						) {
							if (

								(
								(!this.data[i]['visit_session'] && this.data[i].patient_status_slug!=='in_session')&&
								this.data[i].billable == null &&
								(this.data[i]['visit_session'] && this.data[i].patient_status_slug!=='in_session')&&
								this.data[i].doctor_id &&
								this.data[i].appointment_status_slug != 'no_show' &&
								this.data[i].appointment_status_slug != 'completed'
								)
								||(// (!this.data[i]['visit_session'] && this.data[i].patient_status_slug!=='in_session')&&
								// this.data[i].billable == null &&
								(this.data[i]['visit_session'] && this.data[i].patient_status_slug!=='in_session')&&
								this.data[i].doctor_id &&
								this.data[i].appointment_status_slug != 'no_show' &&
								// this.data[i].appointment_status_slug != 'completed'
								this.data[i].appointment_status_slug == 'completed'
							)) {
								this.data[i]['isChecked'] = true;
								this.deleteAll.push(this.data[i].id);
							}
							else if (!this.data[i].doctor_id) {
								this.data[i]['isChecked'] = true;
								this.deleteAll.push(this.data[i].id);
							}
						} else {
							this.data[i]['isChecked'] = true;
							this.deleteAllKios.push(this.data[i].id);
						}
					}
				}
			}
		} else {
			this.allChecked = false;
			for (var i = 0; i < this.data.length; i++) {
				if (this.data[i] != undefined) {
					if (this.data[i]['isChecked'] == true) {
						this.data[i]['isChecked'] = false;
						if (
							(this.data[i].speciality_id != undefined &&
								this.data[i].facility_location_id != undefined) ||
							this.data[i].doctor_id != undefined
						) {
							if  (

								(
								(!this.data[i]['visit_session'] && this.data[i].patient_status_slug!=='in_session')&&
								this.data[i].billable == null &&
								(this.data[i]['visit_session'] && this.data[i].patient_status_slug!=='in_session')&&
								this.data[i].doctor_id &&
								this.data[i].appointment_status_slug != 'no_show' &&
								this.data[i].appointment_status_slug != 'completed'
								)
								||(// (!this.data[i]['visit_session'] && this.data[i].patient_status_slug!=='in_session')&&
								// this.data[i].billable == null &&
								(this.data[i]['visit_session'] && this.data[i].patient_status_slug!=='in_session')&&
								this.data[i].doctor_id &&
								this.data[i].appointment_status_slug != 'no_show' &&
								// this.data[i].appointment_status_slug != 'completed'
								this.data[i].appointment_status_slug == 'completed'
							)){
								this.deleteAll.splice(this.deleteAll.indexOf(this.data[i].id), 1);
							} else if (!this.data[i].doctor_id) {
								this.deleteAll.splice(this.deleteAll.indexOf(this.data[i].id), 1);
							}
						} else {
							this.deleteAllKios.splice(this.deleteAllKios.indexOf(this.data[i].id), 1);
						}
					}
				}
			}
		}
	}
	/*Reset filters*/
	resetFilters(resetCheck) {
		this.deleteAll = [];
		this.deleteAllKios = [];
		this.allChecked = false;
		this.specSelectedMultiple = null;
		this.docSelectedMultiple = null;
		this.clinicSelectedMultiple = null;
		this.appTypeSelectedMultiple = null;
		this.visitStatusSelectedMultiple = null;
		this.appointmentStatusSelectedMultiple = null;
		this.caseTypeSelectedMultiple = null;
		if (resetCheck) {
			this.currentDateTime = new Date();
			this.endDateTime = new Date();
			this.currentDateTime.setHours(0);
			this.currentDateTime.setMinutes(0);
			this.endDateTime.setHours(23);
			this.endDateTime.setMinutes(59);
		}
		this.page.pageNumber=0;
		this.page.offset=0;
		this.myForm.controls['facility_location_ids'].setValue([]);
		this.eventsSubjectAppointment.next(true);
		this.getAllAppointment({ offset: this.page.pageNumber || 0 });
	}

	/*Delete particular selected appointment*/
	public deleteParticularAppointment(data, appId) {

		this.customDiallogService.confirm('Delete','Are you sure you want to delete','Yes','No')
		.then((confirmed) => {
			if (confirmed){
				if (
					data.speciality_id == undefined &&
					data.facility_location_id == undefined &&
					data.doctor_id == undefined
				) {
					const object = { ids: [appId] };
					this.requestService
						.sendRequest(
							AppointmentUrlsEnum.remove_patient_status,
							'PUT',
							REQUEST_SERVERS.kios_api_path,
							object,
						)
						.subscribe((respon: any) => {
							this.toastrService.success(respon.result.data, 'Success');
							this.getAllAppointment({ offset: this.page.pageNumber || 0 });
						});
				} else {
					this.doctorCalendarService.deleteAppId = [appId];
					const activeModal = this.updateModal.open(DeleteReasonComponent, {
						size: 'sm',
						backdrop: 'static',
						keyboard: false,
					});
				}
				this.cdr.detectChanges();
			}else if(confirmed === false){
			}else{
			}
		})
		.catch();

	}
	/*Delete all selected appointments*/
	public deleteAllAppoinmtment() {
		this.isKiosPatient = false;
		for (var i = 0; i < this.data.length; i++) {
			if (this.data[i]['isChecked'] == true) {
				if (
					this.data[i].speciality_id == undefined &&
					this.data[i].facility_location_id == undefined &&
					this.data[i].doctor_id == undefined
				) {
					this.isKiosPatient = true;
				}
			}
		}
		if (this.isKiosPatient) {
			if (this.deleteAll.length != 0) {
				this.customDiallogService.confirm('Delete','Are you sure you want to delete?You have also selected patient having no appointment','Yes','No')
		.then((confirmed) => {
			if (confirmed){
				const object = { ids: this.deleteAllKios };
							this.requestService
								.sendRequest(
									AppointmentUrlsEnum.remove_patient_status,
									'PUT',
									REQUEST_SERVERS.kios_api_path,
									object,
								)
								.subscribe((respon: any) => {
									this.toastrService.success(respon.result.data, 'Success');
									this.getAllAppointment({ offset: this.page.pageNumber || 0 });
								});
							this.doctorCalendarService.deleteAppId = this.deleteAll;
							const activeModal = this.updateModal.open(DeleteReasonComponent, {
								size: 'sm',
								backdrop: 'static',
								keyboard: false,
							});
			}else if(confirmed === false){
			}else{
			}
		})
		.catch();
		
			} else {


				this.customDiallogService.confirm('Update','Are you sure you want to delete?You have selected patient having no appointment','Yes','No')
		.then((confirmed) => {
			if (confirmed){
				const object = { ids: this.deleteAllKios };
				this.requestService
					.sendRequest(
						AppointmentUrlsEnum.remove_patient_status,
						'PUT',
						REQUEST_SERVERS.kios_api_path,
						object,
					)
					.subscribe((respon: any) => {
						this.toastrService.success(respon.result.data, 'Success');
						this.getAllAppointment({ offset: this.page.pageNumber || 0 });
					});
			}else if(confirmed === false){
			}else{
			}
		})
		.catch();

			}
		} else {

			this.customDiallogService.confirm('Delete','Are you sure you want to delete?','Yes','No')
		.then((confirmed) => {
			if (confirmed){
				this.doctorCalendarService.deleteAppId = this.deleteAll;
					const activeModal = this.updateModal.open(DeleteReasonComponent, {
						size: 'sm',
						backdrop: 'static',
						keyboard: false,
					});
			}else if(confirmed === false){
			}else{
			}
		})
		.catch();

		}
	}
	/*Change Page Function*/
	public changePage(e) {
		this.allChecked = false;
		this.page.pageNumber= e.offset;
		this.getAllAppointment({offset:this.page.pageNumber});
		
	}
	changeVistStatus(event,rowObj,Type?) {

		let visitStatusObject = {
			"appointment_id": rowObj && rowObj.id,
			"user_id": this.storageData.getUserId(),
			"facility_location_id": rowObj?.facility_location_id
		}
		if(Type =='visitType') {
			visitStatusObject['appointment_status_id'] = rowObj && rowObj.appointment_status_id;
			visitStatusObject['visit_status_id'] = event.id;
		}
		//for appointment status arrived
		else if(Type =='AppointmentType' && event.slug === "arrived" ){
			visitStatusObject['appointment_status_id'] = event.id;
			visitStatusObject['visit_status_id'] = this.getVisitStatusId("checked_in",this.visitStatus);
		}else {
			visitStatusObject['appointment_status_id'] = event.id;
			visitStatusObject['visit_status_id'] = null //OPTIONAL 
		}

		this.requestService
		.sendRequest(
			AddToBeSchedulledUrlsEnum.manuallyUpdateStatus,
			'PUT',
			REQUEST_SERVERS.schedulerApiUrl1,
			visitStatusObject
		).subscribe(
			(res: any) => {
				if(res.status == 200) {
					this.toastrService.success(Type == 'visitType' ? 'Visit status successfully changed' : 'Appointment status successfully changed','Success');
					this.getAllAppointment({ offset: this.page.pageNumber || 0 });
				}
				
			})
	}

	customSearchFn(term: string, item: any) {
		term = term.toLocaleLowerCase();
		let specialty_name_qualifier=((item.qualifier?item.qualifier.toLowerCase():''))

		return (item.name.toLocaleLowerCase().includes(term)  || 
		specialty_name_qualifier.includes(term));
	  
	}

	customPracticeLocationSearchFn(term: string, item: any) {
		term = term.toLocaleLowerCase();
		let facility_full_name_qualifier=((item.facility.qualifier?item.facility.qualifier.toLowerCase():'')+(item.qualifier?'-'+item.qualifier.toLowerCase():''))

		return (item.facility_full_name.toLocaleLowerCase().includes(term)  || 
		facility_full_name_qualifier.includes(term));
	  
	}
	getVisitStatusId(key?,VisitStatusArr?){
		let VisitId = VisitStatusArr.filter(x => x.slug === key).map(c => c.id).toString();
		return VisitId
	}

	openCustomoizeColumn(CustomizeColumnModal) {
		const ngbModalOptions: NgbModalOptions = {
		  backdrop: 'static',
		  keyboard: false,
		  windowClass: 'modal-lg-package-generate',
		};
		this.modalCols = [];
		let self = this;
		this.cols.forEach(element => {
			let obj = self.alphabeticColumns.find(x => x?.name === element?.name);
			if(obj) {
				this.modalCols.push({ header: element?.name, checked: obj?.checked });
			}
		});
		this.CustomizeColumnModal.show();
	  }
	  
	  onConfirm(click) {
		if (this.isAllFalse && !this.colSelected){
			this.toastrService.error('At Least 1 Column is Required.','Error');
			return false;
		}
		if(click) {
			this.customizedColumnComp;
			this.modalCols = makeDeepCopyArray(this.customizedColumnComp?.modalCols)
			let data: any = [];
			this.modalCols.forEach(element => {
				if(element?.checked) {
					data.push(element);
				}
				let obj = this.alphabeticColumns.find(x => x?.name === element?.header);
				if (obj) {
					if (obj.name == element.header) {
						obj.checked = element.checked;
					}
				}
			});
			this.localStorage.setObject('particularPatientTableList' + this.storageData.getUserId(), data);
		}
		let groupByHeaderCol = getIdsFromArray(this.modalCols, 'header'); // pick header
		this.cols.sort(function (a, b) {
		  return groupByHeaderCol.indexOf(a.name) - groupByHeaderCol.indexOf(b.name);
		});
		//set checked and unchecked on the base modal columns in alphabeticals columns
		this.alphabeticColumns.forEach(element => {
		let currentColumnIndex = findIndexInData(this.cols, 'name', element.name)
		  if (currentColumnIndex != -1) {
			this.cols[currentColumnIndex]['checked'] = element.checked;
			this.cols = [...this.cols];
		  }
		});
		// show only those columns which is checked
		let columnsBody = makeDeepCopyArray(this.cols);
		this.appointmentListTable._internalColumns = columnsBody.filter(c => {
		  return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.appointmentListTable._internalColumns.sort(function (a, b) {
		  return groupByHeader.indexOf(a.name) - groupByHeader.indexOf(b.name);
		});
		window.dispatchEvent(new Event('resize'));
		this.CustomizeColumnModal.hide();
	}

	onCancel() {
		this.CustomizeColumnModal.hide();
	}

	onSelectHeaders(isChecked) {
		this.colSelected = isChecked;
		if(!isChecked) {
			this.isAllFalse = true;
		}
	}

	onSingleSelection(isChecked) {
		this.isAllFalse = isChecked;
		if(isChecked) {
			this.colSelected = false;
		}
	}

	billingHistoryStats(row) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc body-scroll history-modal',
			modalDialogClass: 'modal-lg'
		};
		let modelRef = this.modalService.open(CreatedHistoryComponent, ngbModalOptions);
		modelRef.componentInstance.createdInformation = [row];
	}
}
