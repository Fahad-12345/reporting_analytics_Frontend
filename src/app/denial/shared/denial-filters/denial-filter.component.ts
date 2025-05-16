import { Component, OnInit } from '@angular/core';
import { RequestService } from '@appDir/shared/services/request.service';
import { FormGroup, FormBuilder, Validators, NgModelGroup } from '@angular/forms';
import { isEmptyObject } from '@appDir/shared/utils/utils.helpers';
@Component({
  selector: 'app-denail-filter',
  templateUrl: './denial-filter.component.html',
  styleUrls: ['./denial-filter.component.scss']
})
export class DenialFilterComponent implements OnInit {


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
		case_id: [null],
		bill_status: [null],
		provider: [null],
		insurance_name: [null],
		patient: [null],
		start_date: [null],
		end_date: [null],
		accident_date: [null],
		created_by: [null],
		case_type: [null],
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
