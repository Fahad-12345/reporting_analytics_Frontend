import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { Component, Input, OnInit } from '@angular/core';

@Component({
	selector: 'app-patient-pharmacy',
	templateUrl: './patient-pharmacy.component.html',
	styleUrls: ['./patient-pharmacy.component.scss']
})
export class PatientPharmacyComponent implements OnInit {
	@Input() pharmacy_detail;
	constructor(public datePipeService:DatePipeFormatService) {
		// console.log(this.pharmacy_detail);
		// this.pharmacy_detail;
	 }

	ngOnInit() {
	}
	ngAfterViewInit() {
		// console.log(this.pharmacy_detail);
	}
}
