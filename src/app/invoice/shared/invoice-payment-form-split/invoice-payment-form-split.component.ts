import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EORService } from '@appDir/eor/shared/eor.service';
import { PaymentService } from '@appDir/payments/payment.service';
import { PaymentFormSplitComponent } from '@appDir/payments/shared/payment-form/payment-form-split/payment-form-split.component';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-invoice-payment-form-split',
  templateUrl: './invoice-payment-form-split.component.html',
  styleUrls: ['./invoice-payment-form-split.component.scss']
})
export class InvoicePaymentFormSplitComponent extends PaymentFormSplitComponent implements OnInit {
  addPayment: FormGroup;
  page_size_master: number = 100;
  params = {
	order: OrderEnum.ASC,
	per_page: this.page_size_master,
	page: 1,
	pagination: true,
	order_by: 'name',
};
  constructor(public fb: FormBuilder,
		public requestService: RequestService,
		public toastrService: ToastrService,
		public eorService: EORService,
		public paymentService: PaymentService,) { 
    super(fb,requestService,toastrService,eorService,paymentService,)
  }

  ngOnInit() {
    this.addPayment = this.initializeSearchForm();
	this.getPaymentBy(this.params);
	this.getActionType(this.params);
	this.paymentType(this.params);
	this.getPaymentStatus(this.params);
  }
  initializeSearchForm(): FormGroup {
		return this.fb.group({
			id: [null],
			check_date: [
				'',
				[
					Validators.required,
					Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
					Validators.maxLength(10),
				],
			],
			action_type_id: ['', Validators.required],
			check_no: ['', [Validators.required, Validators.maxLength(50), Validators.pattern("^[a-zA-Z0-9_]*$")]],
			check_amount: [null, [Validators.required, this.max(999999.99), this.minValidation(0)]],
			by_id: ['', Validators.required],
			types: ['', Validators.required],
			interest_amount: [null],
			bill_amount: [null],
			description: [''],
			comments: [''],
			file_name: [''],
			status_id: [''],
			over_amount: [null],
		});
	}
}
