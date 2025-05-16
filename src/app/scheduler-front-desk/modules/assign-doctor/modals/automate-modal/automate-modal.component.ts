import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SchedulerSupervisorService } from '../../../../scheduler-supervisor.service';
import { AssignDoctorSubjectService } from '../../assign-doctor-subject.service';
import { ToastrService } from 'ngx-toastr';
import { RequestService } from '@appDir/shared/services/request.service';
import { HttpSuccessResponse, StorageData } from '@appDir/pages/content-pages/login/user.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { AssignDoctorUrlsEnum } from '../../assign-doctor-urls-enum';
import { convertDateTimeForSending, removeDuplicates } from '@appDir/shared/utils/utils.helpers';

@Component({
	selector: 'app-automate-modal',
	templateUrl: './automate-modal.component.html',
	styleUrls: ['./automate-modal.component.scss'],
})
export class AutomateModalComponent implements OnInit {
	meridian = true;
	myForm: FormGroup;
	// public object: any = {
	// 	start_date: '2019-02-04T12:00:00.000Z',
	// 	noOfWeeks: 2,
	// 	doctor_ids: [1],
	// 	facility_location_ids: [1],
	// };
	// public object: any;
	public startDate: Date;
	public numberOfWeeks: number;
	public selectedClinics: any = [];
	public SelectedDoctors: any = [];
	constructor(
		public activeModal: NgbActiveModal,
		protected requestService: RequestService,
		public storageData: StorageData,
		private formBuilder: FormBuilder,
		public toastrService: ToastrService,
		public AssignDoctorSubjectService: AssignDoctorSubjectService,
		public _supervisorService: SchedulerSupervisorService,
	) {
		this.createForm();
		for (var i = 0; i < this._supervisorService.selectedClinic.length; i++) {
			this.selectedClinics[i] = this._supervisorService.selectedClinic[i].id;
		}
		this.SelectedDoctors = [...this._supervisorService.selectedDoc];
		// for (var i = 0; i < this._supervisorService.selectedDoc.length; i++) {
		// 	this.SelectedDoctors[i] = this._supervisorService.selectedDoc[i].id;
		// }
	}

	ngOnInit() {
		this.startDate = new Date();
		let tempStartDate = this.startDate.toISOString();
		this.myForm.controls['startdate'].setValue(tempStartDate);
	}
	/**
	 * Form Validations and creation
	 */
	private createForm() {
		this.myForm = this.formBuilder.group({
			startdate: ['', Validators.required],
			noOfWeeks: ['2', Validators.required],
		});
	}
	/**
	 * on change number of week
	 */
	public changeNoWeeks() {
		this.numberOfWeeks = this.myForm.get('noOfWeeks').value;
	}
	public changeDate(event) {
		this.startDate=new Date(event.value);
	//   if (this.startDate != null && this.startDate != null) {
		if (this.myForm.get('startdate').value) {
			
		this.startDate.setSeconds(0)
		this.startDate.setMilliseconds(0);
		// this.myForm.get('startdate').setValue(this.startDate);
	
		
	  }
	}

	public onChangeStartDate(event)
	{
		if(event.dateValue)
		{
			this.myForm.get('startdate').patchValue(new Date(event.dateValue))
		//   this.startDate=new Date(event.dateValue);
		  
		  this.changeDate({value:event.dateValue});
		} 
		else
		{
			this.myForm.get('startdate').patchValue(null);
			this.startDate=null;
			
		}
	}
	/**
	 * validate form values and submit the form by calling the route. keep te form open
	 */
	public submitFormAndOpen() {
		if (this.myForm.invalid) {
			return;
		}
		if (this.startDate == null) {
			this.toastrService.error('Date is required', 'Error');
			return;
		}
		this.numberOfWeeks = this.myForm.get('noOfWeeks').value;
		// if (this.numberOfWeeks === 3) {
		//   this.toastrService.error("Kindly choose 2 or 4 number of weeks", 'Error')
		//   return;
		// }
		let obj={};
		debugger;
		let specValues = new Set (this.SelectedDoctors.map(doctor=>doctor.speciality_id));
		obj['doctor_ids'] = this.SelectedDoctors.map(doctor=>doctor.id);
		obj['speciality_ids'] = Array.from(specValues);
		obj['start_date'] = convertDateTimeForSending(this.storageData, new Date(this.startDate));
		obj['number_of_weeks'] = this.numberOfWeeks;
		obj['facility_location_ids'] = this.selectedClinics;

		this.requestService
			.sendRequest(
				AssignDoctorUrlsEnum.automateDoctorAssignment_MultiSpecality,
				'POST',
				REQUEST_SERVERS.schedulerApiUrl1,
				obj
			)
			.subscribe(
				(res: HttpSuccessResponse) => {
					if (res.result.data.length === 0) {
						this.toastrService.error('No new assignment proposed', 'Error');
						return;
					}
					this.AssignDoctorSubjectService.refreshUpdate('update');
					this.toastrService.success('Assignments Created Successfully', 'Success');
					this.activeModal.close();
				},
				(error) => {
					// this.toastrService.error(error.error.message, 'Error');
				},
			);
	}
}
