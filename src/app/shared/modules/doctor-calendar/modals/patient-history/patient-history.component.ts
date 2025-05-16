import {  unSubAllPrevious } from '@shared/utils/utils.helpers';
import { Subscription } from 'rxjs';
import { Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DoctorCalendarEnum } from '../../doctor-calendar-transportation-enum';
import { HttpSuccessResponse, StorageData } from '@appDir/pages/content-pages/login/user.class';
import { DoctorCalendarUrlsEnum } from '../../doctor-calendar-urls-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import {  AppointmentTypeEnum, PatienHistoryCount, PatienHistoryResponse } from './models/patient-history.model';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { ViewAppoitModalComponent } from '../view-appointment-modal/view-appoointment-modal.component';
import { AppointmentListComponent } from './components/today-appointment-listing-component/appointment-listing-component';
import { ToastrService } from 'ngx-toastr';

@Component({
	selector: 'app-patient-history-component ',
	templateUrl: './patient-history.component.html',
	styleUrls: ['./patient-history.component.scss']
})
export class PatientHistoryComponent   implements OnInit {
	@ViewChild('completedAptListComponent') completedAptListComponent: AppointmentListComponent;
	@ViewChild('cancelledAptListComponent') cancelledAptListComponent: AppointmentListComponent;
	@ViewChild('noshowAptListComponent') noshowAptListComponent: AppointmentListComponent;
	@ViewChild('todayAptListComponent') todayAptListComponent: AppointmentListComponent
	@Input() caseId:number
	loadSpin:boolean=false
	DoctorCalendarEnum=DoctorCalendarEnum;
	selectedPatientHistory:any;
	subscription: Subscription[] = [];
	cancelledAppointments:PatienHistoryResponse;
	completedAppointment:PatienHistoryResponse;
	noShowAppointments:PatienHistoryResponse;
	todaysAppointments:PatienHistoryResponse;
	patientHistoryCount:PatienHistoryCount=new PatienHistoryCount();
	isCollapsed = false;
	activeModalViewAppointment:NgbModalRef
	public typeEnum=AppointmentTypeEnum;
	selectedTab:AppointmentTypeEnum=AppointmentTypeEnum.today;
	constructor(
		protected requestService: RequestService,
		public activeModal: NgbActiveModal, 
		private storageData: StorageData,
		public datePipeService:DatePipeFormatService ,
		public modalServie: NgbModal,
		private toastrService: ToastrService,
		) {
			this.typeEnum=AppointmentTypeEnum;
	}
	ngOnInit() {
		console.log(this.typeEnum);
	}
	ngOnChanges(changes: SimpleChanges): void {
		debugger
		if(this.caseId)
		{
			this.resetPatientHistoryCount();
			this.getPatientHistoryCount()
		}
		else
		{
			this.resetPatientHistoryCount();
		}
		
	}

	ngOnDestroy(): void {
		unSubAllPrevious(this.subscription);
		
	}

	resetPatientHistoryCount()
	{
		this.patientHistoryCount?this.patientHistoryCount.cancelledAppointments=0:null;
		this.cancelledAptListComponent?this.cancelledAptListComponent.resetAppointments():null;
		this.patientHistoryCount?this.patientHistoryCount.completedAppointments=0:null;
		this.completedAptListComponent?this.completedAptListComponent.resetAppointments():null;
		this.patientHistoryCount?this.patientHistoryCount.noShowAppointments=0:null;
		this.noshowAptListComponent?this.noshowAptListComponent.resetAppointments():null;
		this.patientHistoryCount?this.patientHistoryCount.todayAppointments=0:null;
		this.todayAptListComponent?this.todayAptListComponent.resetAppointments():null;	
	}

	getPatientHistoryCount()
	{
		debugger;
		let req={
			case_id:this.caseId
		}
		this.requestService
			.sendRequest(
				DoctorCalendarUrlsEnum.appointmentsGetPatientHistoryCount,
				'post',
				REQUEST_SERVERS.schedulerApiUrl,
				req
	
			)
			.subscribe((res: HttpSuccessResponse) => {				
				this.patientHistoryCount=res && res.result && res.result.data && res.result.data;
				this.selectCompleted(this.selectedTab);
				console.log(this.selectedPatientHistory);
				})
	}

	viewAppointment(appointment)
	{
		debugger;
		console.log(appointment);
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc',
			size:'lg'
		};
		this.activeModalViewAppointment = this.modalServie.open(ViewAppoitModalComponent, ngbModalOptions);
		this.activeModalViewAppointment.componentInstance.viewCurrentAppointment=appointment;
		this.activeModalViewAppointment.componentInstance.onlyView=true;
		this.activeModalViewAppointment.result.then(res=>{
		});
	}

	selectCompleted(appointmentType) {
		debugger;
		console.log(appointmentType);
		this.selectedTab=appointmentType
		switch(appointmentType)
		{
			case AppointmentTypeEnum.cancel:
				{
					if(this.caseId)
					{

						this.cancelledAptListComponent.getAppointmentsByPageNo({offset:this.cancelledAptListComponent.page.offset||0})	

					}
				
					break;
				}
			case AppointmentTypeEnum.no_show:
				{
					if(this.caseId)
					{	
						this.noshowAptListComponent.getAppointmentsByPageNo({offset:this.noshowAptListComponent.page.offset||0})		
					}
				break;
				}
			case AppointmentTypeEnum.completed:
				{
					if(this.caseId)
					{		
						this.completedAptListComponent.getAppointmentsByPageNo({offset:this.completedAptListComponent.page.offset||0})	
					}
				break;
				}
			case AppointmentTypeEnum.today:
				{
					if(this.caseId)
					{
						this.todayAptListComponent.getAppointmentsByPageNo({offset:this.todayAptListComponent.page.offset||0})				
					}
				break;
				}
		}
	
	}
}
