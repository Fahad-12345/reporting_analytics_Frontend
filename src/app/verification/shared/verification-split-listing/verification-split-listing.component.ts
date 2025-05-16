import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { CustomDiallogService } from './../../../shared/services/custom-dialog.service';
import { VerificationBillEnum } from './../../verification-bill-enum';
import { ToastrService } from 'ngx-toastr';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { Page } from './../../../shared/models/listing/page';
import { Subscription } from 'rxjs';
import { Component, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild, EventEmitter } from '@angular/core';
import { RequestService } from '@appDir/shared/services/request.service';
import { EORService } from '@appDir/eor/shared/eor.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { VerificationService } from '@appDir/verification/verification.service';
import { removeEmptyKeysFromObject, unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';

@Component({
  selector: 'app-verification-list-split',
  templateUrl: './verification-split-listing.component.html',
  styleUrls: ['./verification-split-listing.component.scss']
})
export class VerificationSplitListComponent implements OnInit , OnDestroy {
	denialData : any [] = [];
	subscription:Subscription[] = [];
	limit:number = 10;
	page: Page = new Page();
	billId: number;
	bill_ids: number;
	case_ids: any[];
	@Input() denialFormSplit: boolean;
	@ViewChild('denialEditModal') public denialEditModal:ModalDirective;
	@Output() onChangeDataVerification = new EventEmitter();
	@Output() addManualAppealEmitter = new EventEmitter();

   constructor(private requestService: RequestService,
	 private storageData: StorageData,
	 private eorService: EORService,
	 private customDiallogService: CustomDiallogService,
	 private toastrService:ToastrService,
	 private verificationService: VerificationService,
	 public commonService:DatePipeFormatService,
	 private modalService: NgbModal
	 ) {
 
   }
 
   ngOnInit() {
	   this.page.size=this.limit;
	   this.page.pageNumber=0;
		this.closeVerificationPopup();
		this.verificationInfoThroughSubject()	
   }
 
 
 
   getDenialInfo(param) {
	this.case_ids = param['case_ids'] ? param['case_ids'] : null;
	 this.subscription.push(
		 this.requestService
			 .sendRequest(
				VerificationBillEnum.VerificationGet,
				 'GET',
				 REQUEST_SERVERS.fd_api_url,
				 removeEmptyKeysFromObject(param),
			 )
			 .subscribe(
				 (comingData: any) => {
					 if (comingData['status'] == 200 || comingData['status'] == true) {
						 this.denialData = comingData.result ? [...comingData.result.data] : [];
						 this.page.totalElements = comingData.result.total;
						 this.page.totalPages = comingData.result.last_page;
						//  this.page.totalPages = this.page.totalElements / this.page.size;
					}
				 },
				 (err) => {
				 
				 },
			 ),
		 );
   }

   pageLimit($event){
	this.page.offset = 0;
	this.page.size = Number($event);
	this.page.pageNumber=1;
	// const result = this.eorService.makeFilterObject(this.eorService.params);
	// let params = {
	// 	pagination:1, 
	// 	per_page: this.page.size,
	// 	page:this.page.pageNumber,
	// 	bill_ids: this.bill_ids,
	// 	...result,
	// }
	// this.onChangeDataVerification.emit(params);
	this.getDenialInfo(this.paramsObject());
	}
 
   onPageChange(pageInfo){
	this.page.offset = pageInfo.offset;
	 this.page.pageNumber = pageInfo.offset+1;
	
	//  this.onChangeDataVerification.emit(params);
	this.getDenialInfo(this.paramsObject());
   }
 
   onDenialEdit(row){
	if(this.denialFormSplit){
		this.denialEditModal.show();
	}
	this.billId = row.bill_id;
	this.verificationService.pushVerificationId(row.id);
	this.verificationService.pushVerificationForm(true);
   }
 
   viewDocFile(row) {
		 if (row && row.media && row.media.pre_signed_url){
	 window.open(row.media.pre_signed_url);
		 }
 }
 getLinkwithAuthToken(link) {
	 let token = this.storageData.getToken()
	 if (token) {
		 return `${link}&token=${token}`
	 }
	 else { return link }
 }

 onDeleteVerficationRecived(row){
	let param = {
		ids: [row.id]
	  };
	  let option ={overlay:false};
	  this.customDiallogService.confirm('Delete Verification Received', 'Do you really want to delete this Verification Received?')
	  .then((confirmed) => {
		  if (confirmed){
			this.subscription.push(
				this.requestService.sendRequest(	
				  VerificationBillEnum.VerificationRecivedDelete,
				  'delete_with_body',
				  REQUEST_SERVERS.fd_api_url,
				  param).subscribe((res: any) => {
				  this.page.pageNumber= 0;
				  if (res.status) {
					  let params = {
						  pagination:1, 
						  per_page: this.page.size,
						  page:this.page.pageNumber+1,
					  }
					  this.onChangeDataVerification.emit(params);
					  if(this.verificationService.isBillId()){
						  this.page.offset = 0;
						  this.verificationService.reloadVerificationAfterAdd();
						  this.verificationService.pushVerificationForm(true);
					  }
					this.toastrService.success(res.message, "Success");
					}
				}, error => {
			  //  this.toastrService.error(error.error.message, "Error");
				})
			  );
		  }
	  })
	  .catch();
}


    closePopup(){
		this.denialEditModal.hide();
		this.ngOnDestroy();
	}

   closeVerificationPopup(){
	this.verificationService.pullclosedVerificationPopup().subscribe(closed => {
		if(closed && this.denialFormSplit ){
			this.closePopup();
		}
	});
   }

   addmanualAppeal(row){
	   debugger;
	   this.addManualAppealEmitter.emit(row);
   }

   verificationInfoThroughSubject(){
	if(!this.denialFormSplit)
	this.subscription.push(
	this.verificationService.pullReloadVerification().subscribe(id => {
		this.bill_ids = id !=0 ? id: null;
		if(id !=0){
			this.getDenialInfo({ pagination: 1, per_page: 10, page: 1, bill_ids: [id] });
			this.page.offset = 0;
		}
	}));
   }

   paramsObject(){
	const result = this.eorService.makeFilterObject(this.eorService.params);
	let params = {
		...result,
		per_page: this.page.size,
		pagination:1, 
		page:this.page.pageNumber,
	}
	if(this.bill_ids){
		params['bill_ids'] = [this.bill_ids];
	}
	if(this.case_ids){
		params['case_ids'] = this.case_ids;
	}
	return params;
   }

   makeFileNameInEdit(data:any  , patient: any) {
	const patient_lastname = patient ? patient.last_name: '';
	let name =
		data['label_id'] +
		'_' +
		'denial_' +
		patient_lastname +
		'_' +
		parseFloat(data['bill_amount']).toFixed(2);
	return name + '.pdf';
}
	ngOnDestroy(): void {
		unSubAllPrevious(this.subscription);
	}

	verificationRecievedHistoryStats(row) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc body-scroll history-modal',
			modalDialogClass: 'modal-lg'
		};
		let modelRef = this.modalService.open(CreatedHistoryComponent,ngbModalOptions);
		modelRef.componentInstance.createdInformation = [row];
		modelRef.componentInstance.modalInstance = modelRef;
	}

}
