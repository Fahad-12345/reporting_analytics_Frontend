import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import {
	Component,
	EventEmitter,
	Input,
	OnDestroy,
	OnInit,
	Output
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { BillingService } from '../../service/billing.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {removeDuplicatesObject, unSubAllPrevious} from '@appDir/shared/utils/utils.helpers'
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-bill-detail-sharedble',
	templateUrl: './bill-detail-sharedble.component.html',
	styleUrls: ['./bill-detail-sharedble.component.scss'],
	host: {
		'(window:resize)': 'onWindowResize($event)',
	},
})
export class BillDetailSharedbleComponent implements OnInit,OnDestroy {
	isTablet: boolean = true;
	width: number = window.innerWidth;
	latestBills: any;
	tabletWidth: number = 1200;
	@Input() currentBill: any;
	subscription: Subscription[] = [];
	@Input() type: string = 'bill';
	@Output() emitAddBill = new EventEmitter<any>();
	@Output() updateBillCount =  new EventEmitter<any>();
	@Output() restoreBills =  new EventEmitter<any>();
	@Input() billType: any = '';
	isEventTrigger=false;
	isPaymentVerified=false;
	event:any;
	constructor(
		public commonService: DatePipeFormatService,
		private modalService: NgbModal,
		private customDiallogService: CustomDiallogService,
		private billingService: BillingService,
		private router: Router,
		private toastrService:ToastrService
	) {}

	ngOnInit(): void {
		this.isTablet = this.width < this.tabletWidth;
    if (this.billType == 'bulkPayment') {
      this.getLatestBills();
      this.subscription.push(
        this.billingService.isEventTrigger$.subscribe((res) => {
          this.isEventTrigger = res;
        })
      );
      this.subscription.push(
        this.billingService.isVrifiedPayment$.subscribe((res) => {
          this.isPaymentVerified = res;
        })
      );
    }
	}

	onWindowResize(event) {
		this.width = event.target.innerWidth;
		this.isTablet = this.width < this.tabletWidth;
	}

	deleteBill(row) {
		this.customDiallogService
			.confirm('Delete Bill', `This action cannot be undone. All current data associated with this bill will be removed. Are you sure you want to delete the selected bill?`)
			.then((confirmed) => {
				if (confirmed) {
					let index=this.currentBill?.findIndex(bill=>bill?.id==row?.id);
					if(index>-1){
						this.currentBill.splice(index, 1);
						this.billingService.getBills(this.currentBill);
						!this.currentBill.length ? this.modalService.dismissAll() : null;
						this.restoreBills.emit(row);
						if(this.currentBill.length===1){
							this.modalService.dismissAll();
							this.updateBillCount.emit(this.currentBill);
							this.toastrService.error('Please select more then one bill to proceed with the bulk payment','Error');
						}
					}
					
				}
			});
	}

	getLatestBills() {
		this.latestBills = this.billingService.bills$.subscribe((bills) => {
			if (bills['length']) {
				this.currentBill = bills;
				if (this.currentBill && this.currentBill['length']){
						this.currentBill=removeDuplicatesObject(this.currentBill, 'id');
					}
				}
		});
	}

	addNewBill(){
		this.customDiallogService
		.confirm('Add Bill', `Adding more bills will remove all current data from the Bulk Payment screen. Are you sure you want to proceed?`)
		.then((confirmed) => {
			if (confirmed) {
				this.updateBillCount.emit(this.currentBill);
				this.modalService.dismissAll();
			}
		})
	}

	ngOnDestroy(): void {
		unSubAllPrevious(this.subscription);
	}
}
