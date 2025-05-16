import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { CustomDiallogService } from './../../shared/services/custom-dialog.service';
import { VerificationService } from '@appDir/verification/verification.service';
import { Page } from './../../shared/models/listing/page';
import { VerificationBillEnum } from './../verification-bill-enum';
import { ToastrService } from 'ngx-toastr';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { Subscription } from 'rxjs';
import { Component, Input, OnDestroy, OnInit, Output, ViewChild, EventEmitter, ContentChildren, QueryList } from '@angular/core';
import { RequestService } from '@appDir/shared/services/request.service';
import { EORService } from '@appDir/eor/shared/eor.service';
import {  DatatableComponent } from '@swimlane/ngx-datatable';
import { unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-verification-sent-list-split',
  templateUrl: './verification-sent-listing.component.html',
  styleUrls: ['./verification-sent-listing.component.scss']
})
export class VerificationSentSplitListComponent implements OnInit , OnDestroy {
	
  verificationSentData:any[] = [];
  veriEditBoolean =  true;
  verfiySentShowoldFile = true;
  billResponseTotalRecord:number = 0;
  rowIndex: number;
  verficationSentIndex:number = 0;
  page :Page = new Page();
  verificationSentPage:Page = new Page();
  verficiationSentOffset:number = 0;

  subscription :Subscription[] =[];
  bill_ids: number;
  case_ids: any[];
  @ViewChild('verficationSentTable') verficationSentTable: DatatableComponent;
  @Output() verificationSentDetail = new EventEmitter();

   constructor(private requestService: RequestService,
	 private storageData: StorageData,
	 private eorService: EORService,
	 private toastrService:ToastrService,
	 private verificationService: VerificationService,
	 private customDiallogService : CustomDiallogService,
	 public commonService:DatePipeFormatService,
	 private modalService: NgbModal
	 ) {

		
   }

	   
   ngOnInit(){

	// this.verificationSentInfoThroughSubject();
	//  this.getVerificationSentInfo(params);
   }

   ngOnDestroy(){
	unSubAllPrevious(this.subscription);
   }

   verificationSentInfoThroughSubject(){
	this.subscription.push(
	this.verificationService.pullReloadVerification().subscribe(id => {
		this.bill_ids = id !=0 ? id: null;
		if(id !=0){
			this.getVerificationSentInfo({ pagination: 1, per_page: 10, page: this.verficiationSentOffset+1, bill_ids: [id] , appeal_status_id:1 });
			this.page.offset = 0;
		}
	}));
	
	}
   

   viewDocFile(row) {
	if (row && row.media && row.media.pre_signed_url) {
		window.open(row.media.pre_signed_url);

	}
    }
   getLinkwithAuthToken(link) {
	let token = this.storageData.getToken();
	if (token) {
		return `${link}&token=${token}`;
	} else {
		return link;
	}
}
   

   getVerificationSentInfo(param?) {
	this.verificationSentDetail.emit('');
	this.subscription.push(
		this.requestService
			.sendRequest(VerificationBillEnum.VerificationGet, 'GET', REQUEST_SERVERS.fd_api_url, param)
			.subscribe(
				(comingData: any) => {
					if (comingData['status'] == 200 || comingData['status'] == true) {
						this.verificationSentData = comingData.result.data ? [...comingData.result.data] : [];
						this.page.totalElements = comingData.result.total;
						this.page.totalPages = comingData.result.page;
					}
				},
				(err) => {},
			),
	);
}

verificationsentDetail($event) {
	// if ($event.value && !$event.value['expanded']) {
	// 	return false;
	// }
	if ($event.value || $event.id) {
		let data = {
			verification_received_id: $event.id || $event.value.id ,
			pagination: 1,
			per_page:10,
			page: this.verficiationSentOffset+1,
		};
		this.subscription.push(
			this.requestService.sendRequest(VerificationBillEnum.VerificationSentGet, 'get', REQUEST_SERVERS.fd_api_url, data).subscribe(
				(res: any) => {
					if (res.status && res.result && res.result.data) {
						this.verificationSentData[this.verficationSentIndex].verifySentResponse = res.result && res.result.data ? res.result.data : res.data;
						this.verificationSentData[this.verficationSentIndex].verifySentResponse = [...this.verificationSentData[this.verficationSentIndex].verifySentResponse];
						this.verificationSentData[this.verficationSentIndex]['totalChildRecord'] = res.result && res.result.total ? res.result.total : res.result.data.length;
				
					}
					else {
						this.toastrService.error(res.message, "Error");
					}
				},
				err => {
				})
		);

	}
	else {
	
	}

}


viewVerificationSent(row, rowIndex, expanded) {
	row['expanded'] = !expanded;
	this.verficationSentIndex = rowIndex;
	this.verficationSentTable.rowDetail.toggleExpandRow(row);
	}

	verificationsentPagination(pageInfo,row){
	this.verficiationSentOffset = pageInfo.offset;
 	this.verificationsentDetail(row);

}

	onPageChange(pageInfo){	
		this.page.offset = pageInfo.offset;
		this.page.pageNumber = pageInfo.offset+1;
	   
	   //  this.onChangeDataVerification.emit(params);
	   this.getVerificationSentInfo(this.paramsObject());
	}

	paramsObject(){
		const result = this.eorService.makeFilterObject(this.eorService.params);
		
		let params = {
			...result,
			per_page: this.page.size || 10,
			pagination:1, 
			page:this.page.pageNumber,
			appeal_status_id:1,
		};
		if(this.bill_ids){
			params['bill_ids'] = [this.bill_ids];
		}
		return params;
	   }
	
	   onVerificationEditSubmit(verification: any){
		this.verificationSentDetail.emit(verification);
	   }
	   
	   onDeleteVerificationSent(verification){
		   let param = {
			   ids: [verification.id],
			   verification_id:verification.verification_received_id
			 };
			 let option ={overlay:false};
			 this.customDiallogService.confirm('Delete Verification Sent', 'Do you really want to delete this Verification Sent?')
			 .then((confirmed) => {
				 if (confirmed){
					this.subscription.push(
						this.requestService.sendRequest(	
						  VerificationBillEnum.VerificationSentDelete,
						  'delete_with_body',
						  REQUEST_SERVERS.fd_api_url,
						  param).subscribe((res: any) => {
						  this.page.pageNumber= 0;
						  if (res.status) {
							  let params = {
								  pagination:1, 
								  per_page: this.page.size,
								  page:this.page.pageNumber+1,
							  };
						   //    this.onChangeDataVerification.emit(params);
							  if(this.verificationService.isBillId()){
								  this.page.offset = 0;
								  this.verificationSentInfoThroughSubject();
							   //    this.verificationService.reloadDenialAfterAdd();
							   //    this.verificationService.pushDenialForm(true);
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

	   pageLimit($event){
		
		this.page.offset = 0;
		this.page.size = Number($event);
		this.page.pageNumber=1;
		this.getVerificationSentInfo(this.paramsObject());

	   }

		 verificationSentHistoryStats(row) {
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
