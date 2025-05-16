import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DoctorCalendarService } from '../../doctor-calendar.service';
import { SubjectService } from "../../subject.service"
import { ToastrService } from 'ngx-toastr';
import { StorageData, HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { Router } from '@angular/router';
import { AssignSpecialityUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-speciality/assign-speciality-urls-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { DoctorCalendarUrlsEnum } from '../../doctor-calendar-urls-enum';
import { AddToBeSchedulledUrlsEnum } from '@appDir/scheduler-front-desk/modules/add-to-be-scheduled/add-to-be-scheduled-list-urls-enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { Pagination } from '@appDir/shared/models/pagination';
import { convertDateTimeForRetrieving, convertDateTimeForSending } from '@appDir/shared/utils/utils.helpers';

@Component({
	selector: 'app-create-notes',
	templateUrl: './create-notes.component.html',
	styleUrls: ['./create-notes.component.scss']
})
export class CreateNotesComponent extends PermissionComponent implements OnInit {
	myForm: FormGroup;
	public startDate: Date = new Date();
	public endDate: Date;
	public doc: any;
	public assignDoc: any;
	public minDate: Date;
	public submitted = false;
	public assignClinics: any = [];
	public instructionData: any = [];
	public noteClinics: any = []
	selectedClinicName: string; 
	ngOnInit() {
		debugger;
		if (this.aclService.hasPermission(this.userPermissions.note)) {
			this.noteClinics = this.storageData.getFacilityLocations()
		}
		if (!this.doctorService.doctorName) {
			this.doc = this.doctorService.currentDoc.length>0?this.doctorService.currentDoc.find(doc=>doc.user_id):null
		}
		else
		{
			this.doc = this.doctorService.doctorName;
		}
		
		if (!this.doctorService.notesStartDate) {
			this.startDate = convertDateTimeForSending(this.storageData, new Date())
			this.endDate = convertDateTimeForSending(this.storageData, new Date())
		} else {
			this.startDate = convertDateTimeForSending(this.storageData, new Date(this.doctorService.notesStartDate));
			this.endDate = convertDateTimeForSending(this.storageData, new Date(this.doctorService.notesStartDate));

		}

		this.startDate.setHours(0);
		this.startDate.setMinutes(0)
		this.startDate.setSeconds(0)
		this.myForm.controls['startDate'].setValue(this.startDate)
		this.endDate.setHours(23);
		this.endDate.setMinutes(59)
		this.endDate.setSeconds(0)
		this.minDate = new Date(this.startDate);
		this.startLoader=true;
		this.requestService
			.sendRequest(
				AssignSpecialityUrlsEnum.getUserInfobyFacility,
				'POST',
				REQUEST_SERVERS.schedulerApiUrl1,
				{ 'facility_location_ids': this.noteClinics ,
				per_page: Pagination.per_page,
				filters: '',
				page: 1,
				pagination:true}
			).subscribe(
				(res: HttpSuccessResponse) => {
					this.assignClinics = res.result.data.docs;
					this.myForm.controls['clinicname'].setValue(this.doc&&this.doc.facility_location_id?this.doc.facility_location_id:(this.assignClinics&& this.assignClinics.length>0)?this.assignClinics[0].id:'');
					// this.myForm.controls['clinicname'].setValue(this.assignClinics[0].id)
					this.requestService
						.sendRequest(
							AddToBeSchedulledUrlsEnum.Get_providers,
							'POST',
							REQUEST_SERVERS.schedulerApiUrl1,
							{
								"facility_location_ids": [parseInt(this.myForm.controls['clinicname'].value)?parseInt(this.myForm.controls['clinicname'].value):this.noteClinics ,],
								per_page: Pagination.per_page_Provider,
								page: 1,
								user_timing_required: false,
								pagination:true
							}
						).subscribe(
							(respDoctors: HttpSuccessResponse) => {
								this.assignDoc = respDoctors.result.data.docs;
								this.myForm.controls['doctorName'].setValue(this.doc&&this.doc.user_id?this.doc.user_id:(this.assignDoc && this.assignDoc.length>0)?this.assignDoc[0].user_id:'')
								// this.myForm.controls['doctorName'].setValue(this.assignDoc[0].user_id)
								this.requestService
									.sendRequest(
										DoctorCalendarUrlsEnum.getDoctorInstructions,
										'POST',
										REQUEST_SERVERS.schedulerApiUrl1,
										{
											'start_date': this.startDate,
											'end_date': this.endDate,
											// 'doctor_ids': [this.assignDoc[0].user_id]
											'doctor_ids': [parseInt(this.myForm.controls['doctorName'].value)]
										}
									).subscribe(
										(resInst: HttpSuccessResponse) => {
											this.instructionData = resInst.result.data;
											for (var i = 0; i < this.instructionData.length; i++) {
												this.instructionData[i].date = convertDateTimeForRetrieving(this.storageData, new Date(this.instructionData[i].date))
												if (parseInt(this.myForm.get('clinicname').value) == this.instructionData[i].facility_location_id &&
													parseInt(this.myForm.get('doctorName').value) == this.instructionData[i].doctor_id &&
													this.instructionData[i].date.getDate() == this.startDate.getDate() &&
													this.instructionData[i].date.getDay() == this.startDate.getDay() &&
													this.instructionData[i].date.getMonth() == this.startDate.getMonth() &&
													this.instructionData[i].date.getFullYear() == this.startDate.getFullYear()
												) {
													this.myForm.controls['comments'].setValue(this.instructionData[i].instruction);
													break;
												}
											}
											this.startLoader=false;
										},error=>{
											this.startLoader=false;
										})
							},error=>{
								this.startLoader=false;
							})
				},error=>{
					this.startLoader=false;
				})
	}
	constructor(aclService: AclService,
		router: Router,
		protected requestService: RequestService,
		public activeModal: NgbActiveModal,
		private formBuilder: FormBuilder, public doctorService: DoctorCalendarService,
		private storageData: StorageData,
		public _subjectService: SubjectService, private toastrService: ToastrService) {
		super(aclService, router);
		this.createForm()
	}
	public createNotes() {
		for (var i = 0; i < this.instructionData.length; i++) {
			this.instructionData[i].date = new Date(this.instructionData[i].date)
			if (parseInt(this.myForm.get('clinicname').value) == this.instructionData[i].facility_location_id &&
				parseInt(this.myForm.get('doctorName').value) == this.instructionData[i].doctor_id &&
				this.instructionData[i].date.getDate() == this.startDate.getDate() &&
				this.instructionData[i].date.getDay() == this.startDate.getDay() &&
				this.instructionData[i].date.getMonth() == this.startDate.getMonth() &&
				this.instructionData[i].date.getFullYear() == this.startDate.getFullYear()
			) {
				let object = {
					"id": this.instructionData[i].id,
					"date": this.startDate,
					"facility_location_id": parseInt(this.myForm.get('clinicname').value),
					"doctor_id": parseInt(this.myForm.get('doctorName').value),
					"instruction": this.myForm.get('comments').value
				}
				this.activeModal.close()
				this.requestService
					.sendRequest(
						DoctorCalendarUrlsEnum.addDoctorInstruction_new,
						'PUT',
						REQUEST_SERVERS.schedulerApiUrl1,
						object
					).subscribe(
						(res: HttpSuccessResponse) => {
							this.toastrService.success('Successfully Done', 'Success')
						})
				break;
			}
		}
		this.activeModal.close()
		let object = {
			"date": this.startDate,
			"facility_location_id": parseInt(this.myForm.get('clinicname').value),
			"doctor_id": parseInt(this.myForm.get('doctorName').value),
			"instruction": this.myForm.get('comments').value
		}
		this.requestService
			.sendRequest(
				DoctorCalendarUrlsEnum.addDoctorInstruction_new,
				'POST',
				REQUEST_SERVERS.schedulerApiUrl1,
				object
			).subscribe(
				(res: HttpSuccessResponse) => {
					this.toastrService.success('Successfully Done', 'Success')
					this._subjectService.refresh('inst')
				})
	}
	private createForm() {
		this.myForm = this.formBuilder.group({
			comments: ['', ],
			clinicname: ['', [Validators.required]],
			doctorName: ['', [Validators.required]],
			startDate: ['',[Validators.required]],
			
		});
	}
	get f() { return this.myForm.controls }

	public changeClinic(val:any) {
		if(val){
			const spec = this.assignClinics.find(d => d['id'] === Number(val));
			this.assignClinics = spec && `${spec.facility.name}'-'${spec.name}`;
		}
		this.myForm.controls['comments'].setValue(' ');
		this.requestService
			.sendRequest(
				AddToBeSchedulledUrlsEnum.Get_providers,
				'POST',
				REQUEST_SERVERS.schedulerApiUrl1,
				{
					"facility_location_ids": [parseInt(this.myForm.get('clinicname').value)],
					per_page: Pagination.per_page_Provider,
					page: 1,
					user_timing_required: false,
					pagination:true
				}
			).subscribe(
				(resp: HttpSuccessResponse) => {
					this.assignDoc = resp.result.data.docs;
					this.myForm.controls['doctorName'].setValue((this.assignDoc && this.assignDoc.length>0)?this.assignDoc[0].user_id:'');
					this.requestService
						.sendRequest(
							DoctorCalendarUrlsEnum.getDoctorInstructions,
							'POST',
							// REQUEST_SERVERS.schedulerApiUrl,
							// {
							// 	'startDate': this.startDate,
							// 	'endDate': this.endDate,
							// 	'docId': [this.assignDoc[0].docId]
							// }
							REQUEST_SERVERS.schedulerApiUrl1,
										{
											'start_date': this.startDate,
											'end_date': this.endDate,
											'doctor_ids': [this.assignDoc[0].user_id]
										}
						).subscribe(
							(res: HttpSuccessResponse) => {
								this.myForm.controls['comments'].setValue('');
								this.instructionData = res.result.data;
								for (var i = 0; i < this.instructionData.length; i++) {
									this.instructionData[i].date = convertDateTimeForRetrieving(this.storageData, new Date(this.instructionData[i].date))
									if (parseInt(this.myForm.get('clinicname').value) == this.instructionData[i].facility_location_id &&
										parseInt(this.myForm.get('doctorName').value) == this.instructionData[i].doctor_id &&
										this.instructionData[i].date.getDate() == this.startDate.getDate() &&
										this.instructionData[i].date.getDay() == this.startDate.getDay() &&
										this.instructionData[i].date.getMonth() == this.startDate.getMonth() &&
										this.instructionData[i].date.getFullYear() == this.startDate.getFullYear()
									) {
										this.myForm.controls['comments'].setValue(this.instructionData[i].instruction);
										break;
									}
								}
							})

				})

	}
	public changeDoctor(val:any) {
		this.requestService
			.sendRequest(
				DoctorCalendarUrlsEnum.getDoctorInstructions,
				'POST',
				REQUEST_SERVERS.schedulerApiUrl1,
				{
					'start_date': this.startDate,
					'end_date': this.endDate,
					'doctor_ids': [parseInt(this.myForm.get('doctorName').value)]
				}
			).subscribe(
				(res: HttpSuccessResponse) => {
					this.myForm.controls['comments'].setValue('');
					this.instructionData = res.result.data;
					for (var i = 0; i < this.instructionData.length; i++) {
						this.instructionData[i].date = convertDateTimeForRetrieving(this.storageData, new Date(this.instructionData[i].date))
						if (parseInt(this.myForm.get('clinicname').value) == this.instructionData[i].facility_location_id &&
							parseInt(this.myForm.get('doctorName').value) == this.instructionData[i].doctor_id &&
							this.instructionData[i].date.getDate() == this.startDate.getDate() &&
							this.instructionData[i].date.getDay() == this.startDate.getDay() &&
							this.instructionData[i].date.getMonth() == this.startDate.getMonth() &&
							this.instructionData[i].date.getFullYear() == this.startDate.getFullYear()
						) {
							this.myForm.controls['comments'].setValue(this.instructionData[i].instruction);
							break;
						}
					}
				})

	}
	public changeStartDate() {
		debugger;
		this.endDate = new Date(JSON.parse(JSON.stringify(this.startDate)));
		this.endDate.setHours(23);
		this.endDate.setMinutes(59)
		this.endDate.setSeconds(0)
		this.requestService
			.sendRequest(
				DoctorCalendarUrlsEnum.getDoctorInstructions,
				'POST',
				REQUEST_SERVERS.schedulerApiUrl1,
				{
					'start_date': this.startDate,
					'end_date': this.endDate,
					'doctor_ids': [parseInt(this.myForm.get('doctorName').value)]
				}
			).subscribe(
				(res: HttpSuccessResponse) => {
					this.myForm.controls['comments'].setValue('');
					this.instructionData = res.result.data;
					for (var i = 0; i < this.instructionData.length; i++) {
						this.instructionData[i].date = convertDateTimeForRetrieving(this.storageData, new Date(this.instructionData[i].date))
						if (parseInt(this.myForm.get('clinicname').value) == this.instructionData[i].facility_location_id &&
							parseInt(this.myForm.get('doctorName').value) == this.instructionData[i].doctor_id &&
							this.instructionData[i].date.getDate() == this.startDate.getDate() &&
							this.instructionData[i].date.getDay() == this.startDate.getDay() &&
							this.instructionData[i].date.getMonth() == this.startDate.getMonth() &&
							this.instructionData[i].date.getFullYear() == this.startDate.getFullYear()
						) {
							this.myForm.controls['comments'].setValue(this.instructionData[i].instruction);
							break;
						}
					}
				})
	}

	onChangeStartDate(event)
	{
		debugger;
		this.f.startDate.markAsTouched();
		if(event.dateValue)
		{
			  this.f.startDate.setValue(new Date(event.dateValue));
			  this.startDate=new Date(event.dateValue)
			  this.changeStartDate()
		} 
		else
		{
			this.f.startDate.setValue(null);
			this.startDate=null
		}
	}
}
