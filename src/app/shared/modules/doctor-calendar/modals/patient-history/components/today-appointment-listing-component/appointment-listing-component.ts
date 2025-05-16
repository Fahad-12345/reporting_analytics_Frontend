import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Page } from "@appDir/front-desk/models/page";
import { HttpSuccessResponse, StorageData } from "@appDir/pages/content-pages/login/user.class";
import { REQUEST_SERVERS } from "@appDir/request-servers.enum";
import { OrderEnum, ParamQuery } from "@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class";
import { DoctorCalendarEnum } from "@appDir/shared/modules/doctor-calendar/doctor-calendar-transportation-enum";
import { DoctorCalendarUrlsEnum } from "@appDir/shared/modules/doctor-calendar/doctor-calendar-urls-enum";
import { RequestService } from "@appDir/shared/services/request.service";
import { convertDateTimeForRetrieving, removeEmptyAndNullsFormObject, unSubAllPrevious } from "@appDir/shared/utils/utils.helpers";
import { NgbModal, NgbModalOptions, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";
import { Subscription } from "rxjs";
import { ViewAppoitModalComponent } from "../../../view-appointment-modal/view-appoointment-modal.component";
import { AppointmentTypeEnum } from "../../models/patient-history.model";

@Component({
	selector: 'app-appointment-listing-component',
	templateUrl: './appointment-listing-component.html',
	styleUrls: ['./appointment-listing-component.scss']
})
export class AppointmentListComponent implements OnInit, OnDestroy {
	@Input() apiPath:string='';
	@Input() type:AppointmentTypeEnum;
	@Input() current=''
	@Input() case_id
	queryParams: ParamQuery;
	appointmentList:any[]=[];
	page: Page = new Page();
	loadSpin: boolean = false;
	subscription: Subscription[] = [];
	activeModalViewAppointment:NgbModalRef;
	DoctorCalendarEnum=DoctorCalendarEnum;

	constructor(
		public requestService: RequestService,
		public storageData: StorageData,
		public toastrService: ToastrService,
		public modalService: NgbModal,
	) {
		this.page.size=10

	}

	ngOnInit() {
	
	}

	ngOnDestroy(): void {
		unSubAllPrevious(this.subscription);
	}

	getAppointmentsByPageNo(pageInfo)
	{
		debugger;
		this.loadSpin=true
		this.page.pageNumber=pageInfo.offset;
		const PageNumber= this.page.pageNumber+1;

		let queryParams = {
			type:this.type,
			order: OrderEnum.ASC,
			per_page: this.page.size || 10,
			page: PageNumber,
			pagination: 1,
			case_id:this.case_id
		};

		this.getAppointments(queryParams)

	}
	
	/*Get all appointments of all patients*/
	public getAppointments(requestParam) {	
		this.requestService
			.sendRequest(
				DoctorCalendarUrlsEnum.appointments_get_patient_history,
				'post',
				REQUEST_SERVERS.schedulerApiUrl1,
				requestParam
			).subscribe(
				(res: HttpSuccessResponse) => {
					debugger;
					this.loadSpin = false;
					let data = res.result.data && res.result.data.docs?res.result.data.docs:[];
					this.page.totalElements=res.result.data && res.result.data.total?res.result.data.total:0
					this.appointmentList=data;
					this.setAppointment()					
				
				}, err => {
					this.loadSpin = false;
					this.appointmentList = [];
				})
	
}




	setAppointment()
	{
		this.appointmentList.map(Appointment=>{
			Appointment.scheduled_date_time=convertDateTimeForRetrieving(this.storageData, new Date(Appointment.scheduled_date_time))
			if(Appointment.availableSpeciality)
			{
				Appointment["facility_location_name"]=Appointment.availableSpeciality.facilityLocation.facility.name +'-'+Appointment.availableSpeciality.facilityLocation.name;

				Appointment['speciality']=Appointment.availableSpeciality.speciality;
				Appointment["facility_location_id"]=Appointment.availableSpeciality.facility_location_id
			}
			if(Appointment.availableDoctor)
			{
				let userBasicInfo=Appointment.availableDoctor.doctor && Appointment.availableDoctor.doctor.userBasicInfo?Appointment.availableDoctor.doctor.userBasicInfo:null;
				Appointment['doctor_full_name']=userBasicInfo?`${userBasicInfo.first_name}${userBasicInfo.middle_name?' '+userBasicInfo.middle_name:''} ${userBasicInfo.last_name}`:null
			if(!Appointment.availableSpeciality)
			{
				Appointment["facility_location_name"]=Appointment.availableDoctor.facilityLocations.facility.name +'-'+Appointment.availableDoctor.facilityLocations.name;

				Appointment["facility_location_id"]=Appointment.availableDoctor.facility_location_id
			}
			}
			else if(!Appointment.availableDoctor  )
			{	
				Appointment['doctor_full_name']="N/A"

			}		
		})
	}

	pageLimit($event) {
		this.page.offset = 0;
		this.page.size = Number($event);
		this.page.pageNumber = this.page.offset = 0;
		this.getAppointmentsByPageNo({offset:this.page.pageNumber});
	}

	onPageChange(pageInfo) {
		debugger;
		this.page.offset = pageInfo.offset;
		// this.page.pageNumber = pageInfo.offset + 1;
		this.getAppointmentsByPageNo({offset:this.page.offset});
	}

	viewAppointment(appointment)
	{
		debugger;
		console.log(appointment);
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal-view',
			
		};
		this.activeModalViewAppointment = this.modalService.open(ViewAppoitModalComponent, ngbModalOptions);
		this.activeModalViewAppointment.componentInstance.viewCurrentAppointment=appointment;
		this.activeModalViewAppointment.componentInstance.onlyView=true;
		this.activeModalViewAppointment.componentInstance.openAsModal=true;
		this.activeModalViewAppointment.result.then(res=>{
		});
	}

	resetAppointments()
	{
		let data =[];
		this.page.totalElements=0;
		this.page.pageNumber=0;
		this.page.offset=0
		this.appointmentList=data;
	}

	openLinkInNewTab(row) {
		window.open('/front-desk/cases/edit/' + row.case_id +'/patient/patient_summary', '_blank');
	  }
}
