import { Component, Input, OnInit } from '@angular/core';
import { DatePipeFormatService } from '../services/datePipe-format.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { RequestService } from '../services/request.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { ClearinghouseEnum } from '@appDir/front-desk/masters/billing/clearinghouse/CH-helpers/clearinghouse';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-created-history',
  templateUrl: './created-history.component.html',
  styleUrls: ['./created-history.component.scss']
})
export class CreatedHistoryComponent implements OnInit {

  @Input() createdInformation: any = [];
  @Input() informationStatus: any = [];
  @Input() modalInstance: any;
  @Input() isEbill: boolean = false;
  title: string = "History";
  subscription: Subscription[] = [];
  loadSpin: boolean = false;
  eBillHistoryData: any = [];
  billHistory: any;

  constructor(public datePipeService: DatePipeFormatService, private modalService: NgbModal,
    protected requestService: RequestService, private toastrService: ToastrService,
    public commonService: DatePipeFormatService,
  ) {
  }

  ngOnInit() {
      if(this.isEbill){
        this.title = "E-Bill History";
        this.eBillHistoryApiCall(this.createdInformation);
        this.billHistory = this.eBillHistoryData;
      }else{
        this.billHistory = this.createdInformation;
      }
  }
  closeModel() {
    if (this.modalInstance) {
      this.modalInstance.close();
    } else {
      this.modalService.dismissAll();
    }
  }

  eBillHistoryApiCall(row){
		if(row){
      let body ={
        bill_id: row[0]?.id
      }
			this.subscription.push(
				this.requestService.sendRequest(
					ClearinghouseEnum.Ebill_History, 'get', REQUEST_SERVERS.fd_api_url, body)
					.subscribe({
						next: (res) => {
						  this.loadSpin = false;
						  if (res['status']) {
							  this.eBillHistoryData = res?.result ? res?.result : [];
                this.billHistory = this.eBillHistoryData;
						  }
						},
						error: (err) => {
						  this.loadSpin = false;
						}
					  })
			)
		}
	}


}
