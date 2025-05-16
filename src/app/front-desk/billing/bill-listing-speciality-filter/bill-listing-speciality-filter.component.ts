import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-bill-listing-speciality-filter',
  templateUrl: './bill-listing-speciality-filter.component.html',
  styleUrls: ['./bill-listing-speciality-filter.component.scss']
})
export class BillListingSpecialityFilterComponent implements OnInit {

  SpecialityBillsForm: FormGroup;
	isCollapsed = false;
	public maxDate: string;
	DATEFORMAT = '_/__/____';
  
  constructor(
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.SpecialityBillsForm = this.fb.group({
			bill_date: ['', Validators.required],
			bill_date_start: ['', [
				Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
				Validators.maxLength(10),
			]],
			bill_date_end: ['',[
				Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
				Validators.maxLength(10),
			]],
			service_date: ['', Validators.required],
			service_date_start: ['', [
				Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
				Validators.maxLength(10),
			]],
			service_date_end: ['',[
				Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
				Validators.maxLength(10),
			]],
			bill_status: ['', Validators.required],
			speciality_id: ['', Validators.required],
			user_id: ['', Validators.required],
			attorney_id: ['', Validators.required],
			case_type: ['', Validators.required],
			insurance_name: ['', Validators.required],
			patient_name: ['', Validators.required],
			bill_number: ['', Validators.required],
			case_number: ['', Validators.required],
			provider: ['', Validators.required],
		});
  }

}
