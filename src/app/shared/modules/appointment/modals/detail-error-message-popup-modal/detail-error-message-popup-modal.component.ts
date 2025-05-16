import { Component, Input, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { USERPERMISSIONS } from '@appDir/front-desk/UserPermissions';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { AclService } from '@appDir/shared/services/acl.service';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { convertDateTimeForRetrieving } from '@appDir/shared/utils/utils.helpers';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-detail-error-message-popup-modal',
  templateUrl: './detail-error-message-popup-modal.component.html',
  styleUrls: ['./detail-error-message-popup-modal.component.scss']
})
export class DetailErrorMessagePopupModalComponent extends PermissionComponent implements OnInit {

	@Input() modelTitle: string;
	@Input() errorMessage : string;
	@Input() rows: any[] = [];
	data:any[]=[]
	// @ViewChild('openErrorModal') openErrorModal: any;
	userPermissions = USERPERMISSIONS;


    constructor(
		private modalService: NgbModal,
		public datePipeService:DatePipeFormatService,
		public aclService: AclService,
		public router: Router,
		public requestService: RequestService,
		private _route: ActivatedRoute,
		titleService: Title,
		public modal: NgbActiveModal,
		private storageData: StorageData, 

		
		) {
			super(aclService, router, _route, requestService, titleService);

    }


    ngOnInit() {
		this.mapdata();

    }

	// openErrorMessage(){
	// 	const ngbModalOptions: NgbModalOptions = {
	// 		backdrop: 'static',
	// 		keyboard: false,
	// 		windowClass: 'modal-lg-package-generate',
	// 	};
	// 	this.modalService.open(this.openErrorModal, ngbModalOptions);
	// }

	navigateTo(caseid)
	{
		
 }
 close()
 {
	 this.modal.close(true);
 }

 mapdata()
 {
	 this.rows.forEach(data=>{
		data.scheduled_date_time=data.scheduled_date_time?convertDateTimeForRetrieving(this.storageData,new Date(data.scheduled_date_time)):data.scheduled_date_time
		let speciality=data.availableDoctor&& data.availableDoctor.availableSpeciality 
		&& data.availableDoctor.availableSpeciality.speciality
		?data.availableDoctor.availableSpeciality.speciality.name:null;
		data['speciality']=speciality?speciality:null
	});
	 this.data=[...this.rows];
 }

 convertDateTimeForRetrieving(scheduled_date_time)
 {
	 debugger;
	let date= convertDateTimeForRetrieving(this.storageData,new Date(scheduled_date_time))
	return date; 
 }

}
