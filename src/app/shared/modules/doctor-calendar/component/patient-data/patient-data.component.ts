import { DatePipeFormatService } from './../../../../services/datePipe-format.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DoctorCalendarService } from '../../doctor-calendar.service';
import { DoctorCalendarUrlsEnum } from '../../doctor-calendar-urls-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { convertDateTimeForRetrieving, convertDateTimeForSending } from '@appDir/shared/utils/utils.helpers';

@Component({
	selector: 'app-patient-data',
	templateUrl: './patient-data.component.html',
	styleUrls: ['./patient-data.component.scss']
})
export class PatientDataComponent implements OnInit {
	/**
   * Input containing the Data related to patient selected 
   */
	@Input() patientData: any;

	/**
   * Hide the Patient record 
   */
	@Output() hidePatientRecord: EventEmitter<any> = new EventEmitter();

	/**
   * Start the evaluation of this record 
   */
	@Output() startEvaluation: EventEmitter<any> = new EventEmitter();

	/**
   * Boolean to show details 
   */
	@Input() isShowDetails: boolean = true;

	/**
   * Boolean to show comments 
   */
	@Input() isShowComments: boolean = true;

	constructor(public _doctorCalendarService: DoctorCalendarService,
		protected requestService: RequestService,
		private storageData: StorageData,
		public datePipeService:DatePipeFormatService
	) { }

	ngOnInit() {
		this.requestService
			.sendRequest(
				DoctorCalendarUrlsEnum.get_checked_in_patients,
				'POST',
				REQUEST_SERVERS.kios_api_path,
				{
					"case_ids": [this.patientData.caseId],
					"current_date": convertDateTimeForSending(this.storageData, new Date())
				}
			).subscribe(
				(res: any) => {
					for (let i = 0; i < res.result.data.case_patients.length; i++) {
						if (res.result.data.case_patients[i].id === this.patientData.caseId) {
							this.patientData["status"] = "N/A"
							this.patientData["checkedIn"] = "N/A"
							for (let c = 0; c < res.result.data.case_patients[i].patient_sessions.length; c++) {
								if(!this.patientData.appId){
									this.patientData.appId=this.patientData.id
								}
								if (res.result.data.case_patients[i].patient_sessions[c].appointment_id === this.patientData.appId) {
									this.patientData["status"] = res.result.data.case_patients[i].patient_sessions[c].status
									if (res.result.data.case_patients[i].patient_sessions[c].status == "Checked Out") {
										break;
									} else if (res.result.data.case_patients[i].patient_sessions[c].status == "Checked In") {
										this.patientData["status"] = res.result.data.case_patients[i].patient_sessions[c].status
										if (res.result.data.case_patients[i].patient_sessions[c].updated_at) {
											this.patientData["checkedIn"] = res.result.data.case_patients[i].patient_sessions[c].updated_at
										} else {
											this.patientData["checkedIn"] = "N/A"
										}
									}

								}
							}
							if (res.result.data.case_patients[i].url) {
								this.patientData["picture"] = res.result.data.case_patients[i].url;
							} else {
								this.patientData["picture"] = 'assets/images/doctor-avater.png';
							}
							if (res.result.data.case_patients[i].company_name) {
								this.patientData["companyName"] = res.result.data.case_patients[i].company_name
							} else {
								this.patientData["companyName"] = "N/A"
							}
							if (res.result.data.case_patients[i].type) {
								this.patientData["caseType"] = res.result.data.case_patients[i].type
							} else {
								this.patientData["caseType"] = "N/A"
							}
							if (res.result.data.case_patients[i].dob) {
								this.patientData["DOB"] = res.result.data.case_patients[i].dob
							} else {
								this.patientData["DOB"] = "N/A"
							}

						} else {
							this.patientData["status"] = "N/A"
							this.patientData["checkedIn"] = "N/A"
							this.patientData["DOB"] = "N/A"
							this.patientData["companyName"] = "N/A"
							this.patientData["caseType"] = "N/A"
							this.patientData["picture"] = 'assets/images/doctor-avater.png';
						}

					}
					if (res.result.data.length === 0) {
						this.patientData["status"] = "N/A"
						this.patientData["checkedIn"] = "N/A"
						this.patientData["DOB"] = "N/A"
						this.patientData["companyName"] = "N/A"
						this.patientData["caseType"] = "N/A"
						this.patientData["picture"] = 'assets/images/doctor-avater.png';
					}
					// if (this.patientData.DOB != 'N/A') {
					// 	this.patientData.DOB = convertDateTimeForRetrieving(this.storageData, this.patientData.DOB)
					// }
					if (this.patientData.checkedIn != 'N/A') {
						this.patientData.checkedIn = convertDateTimeForRetrieving(this.storageData, this.patientData.checkedIn)
					}
				}, error => {
				})
	}
	public comments() {
		this.patientData.isShowComments = !this.patientData.isShowComments;
	}
}
