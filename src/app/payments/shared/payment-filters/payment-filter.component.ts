import { Component, OnInit } from '@angular/core';
import { RequestService } from '@appDir/shared/services/request.service';
import { FormGroup, FormBuilder, Validators, NgModelGroup } from '@angular/forms';
import { isEmptyObject } from '@appDir/shared/utils/utils.helpers';
@Component({
  selector: 'app-payment-filter',
  templateUrl: './payment-filter.component.html',
  styleUrls: ['./payment-filter.component.scss']
})
export class PaymentFilterComponent implements OnInit {


  constructor(private requestService: RequestService, private fb: FormBuilder,) {

  }

  searchForm: FormGroup;
  isCollapsed = false;

  ngOnInit() {
	this.searchForm = this.initializeSearchForm();
  }

  initializeSearchForm(): FormGroup {
	return this.fb.group({
		bill_id: [null],
		bill_date: [null],
		specialty: [null],
		provider: [null],
		practice_location: [null],
		posted_date: [null],
		check_date: [null],
		check_amount: [null],
		paid_by: [null],
		action_type: [null],
		payment_type: [null],
		created_by: [null],
		updated_by: [null],
	});
}

resetCase() {
	this.searchForm = this.initializeSearchForm();
}

checkInputs(){
	if (isEmptyObject(this.searchForm.value)) {
		return true;
	  }
	  return false;
}


}
