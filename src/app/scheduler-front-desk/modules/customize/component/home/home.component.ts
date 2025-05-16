import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';

import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { HttpSuccessResponse, StorageData } from '@appDir/pages/content-pages/login/user.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { AssignSpecialityUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-speciality/assign-speciality-urls-enum';
import { AclService } from '@appDir/shared/services/acl.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { FrontDeskService } from '../../../../front-desk.service';
import { SubjectService } from '../../../../subject.service';
import { CustomizationUrlsEnum } from '../../customization-urls-enum';
import { CustomizationComponent } from '../../modals/customization/customization.component';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss'],
})
export class HomeComponent extends PermissionComponent implements OnInit {
	public spec: any = { specialities: [{ specID: 4, color: 'E1E1E4' }] };
	public actions = [
		{ name: 'Cancel Appointment', id: 1 },
		{ name: 'Forward to FrontDesk', id: 2 },
		{ name: 'Auto Resolve', id: 3 },
	];
	public specSelectedMultiple1;
	public specSelectedMultiple;
	public allClinicChecked = false;
	public allSpecChecked = false;
	public counterClinicChecked = 0;
	public clinicPageNumber = 1;
	public clinicLastPage: any;
	public clinicEntriesOnLastPage: any;
	public specLastPage: any;
	public specEntriesOnLastPage: any;
	public counterSpecChecked = 0;
	public specPageNumber = 1;
	public counterSpec: any = 10;
	public counterClinic: any = 10;
	public action: any = 'Cancel'; // take action on cancel appointment
	public isOpenClinicFilters = true;
	public autoReolveAppointment: any;
	public isOpenSpecFilters = true;
	public isEnableClinicButtons: any = true;
	public isEnableSpecButtons: any = true;
	public numClinicSelected = 0;
	public numSpecSelected = 0;
	public defaultAction: any;
	public allClinics: any;
	public allallSpecData: any;
	public filterClinicData = [
		{ address: '', area: '', color: '', daysList: [], id: 0, name: 'Location' },
	];
	public filterSpecialityData = [{ id: 0, name: 'Speciality' }];
	public specId: any;
	public clinicArray: any;
	public speciality: string = '';
	public clinicName: any;
	public isForwardToFrontDesk: any = true;
	public isAutoReslove: any = true;
	public applyActionCheck: any = 1;
	public clinicSelected: any = '';
	public targetClinicName: any;
	public allSpeciallity: any;
	public isClinicChecked: any = false;
	public isSpeciallityChecked: any = true;
	public defaultClinic: any;
	myForm: FormGroup;
	public autoResolveList = [
		{ name: 'Same Location', id: 0 },
		{ name: 'Any Location ', id: 1 },
	];
	public deleteAllClinic: any = { clinics: [] };
	public deleteAllSpec: any = { specialities: [] };
	public checkID: any;
	public defaultPreference: any;
	public isPreferencesChecked: boolean = false;
	public pref: boolean = false;
	public facilityColorEdit: boolean = false;
	public specEdit: boolean = false;
	public allClinicIds: any = [];
	public editPrefrence: boolean = true;
	public allallClinics: any;

	constructor(
		aclService: AclService,
		router: Router,
		protected requestService: RequestService,
		public _SupervisorService: FrontDeskService,
		public _http: HttpClient,
		private storageData: StorageData,
		public toasterService: ToastrService,
		public frontDeskService: FrontDeskService,
		public formBuilder: FormBuilder,
		public add: NgbModal,
		public subjectService: SubjectService,
		private customDiallogService: CustomDiallogService,
	) {
		super(aclService, router);
		this.createForm();
		this.action = this.actions[0]['id'];

		if (
			this.aclService.hasPermission(this.userPermissions.customize_preference_edit) ||
			this.storageData.isSuperAdmin()
		) {
			this.editPrefrence = false;
		} else {
			this.editPrefrence = true;
		}
		this.allClinicIds = this.storageData.getFacilityLocations();
		this.requestService
			.sendRequest(
				AssignSpecialityUrlsEnum.Facility_list_Post,
				'POST',
				REQUEST_SERVERS.schedulerApiUrl,
				{ clinics: this.allClinicIds },
			)
			.subscribe((res: HttpSuccessResponse) => {
				this.allClinics = res.result.data;
				this.clinicArray = res.result.data;
				this.numClinicSelected = 0;
				this.isEnableClinicButtons = true;
				this.allClinicChecked = false;
				this.counterClinicChecked = 0;
				this.clinicLastPage = Math.ceil(this.allClinics.length / this.counterClinic);
				this.clinicEntriesOnLastPage = this.allClinics.length % this.counterClinic;
				for (var i = 0, j = 1; i < res.result.data.length; i++, j++) {
					this.filterClinicData[j] = res.result.data[i];
				}
				// this.myForm.controls['clinicName'].setValue(this.filterClinicData[0].id);
				// this.specSelectedMultiple = this.filterClinicData[0].id;
				this.filterClinicData.splice(0,1);
				this.filterClinicData = [...this.filterClinicData];
				for (let i = 0; i < this.allClinics.length; i++) {
					this.allClinics[i]['isChecked'] = false;
					this.allClinics[i].color = ('#' + this.allClinics[i].color).slice(-7);
				}
				this.allallClinics = this.allClinics;
				this.requestService
					.sendRequest(
						CustomizationUrlsEnum.getDefaultPrefrences,
						'POST',
						REQUEST_SERVERS.schedulerApiUrl,
					)
					.subscribe(
						(response: HttpSuccessResponse) => {
							this.defaultPreference = response.result.data[0];
							if (response.result.data[0]['preference'] != null) {
								this.defaultAction = this.defaultPreference.preference.approveAction['action'];
							}
							if (this.defaultAction == 'cancel') {
								this.isForwardToFrontDesk = true;
								this.isAutoReslove = true;
								this.checkID = 1;
							} else if (this.defaultAction == 'forward') {
								this.isForwardToFrontDesk = false;

								this.isAutoReslove = true;
								this.checkID = 2;
								this.targetClinicName = this.clinicArray[0]['id'];
								this.defaultClinic = this.defaultPreference.preference.clinicId;
							} else if (this.defaultAction == 'autoresolve') {
								this.isAutoReslove = false;
								this.isForwardToFrontDesk = true;
								this.checkID = 3;
								this.autoReolveAppointment = this.autoResolveList[0].id;
							} else {
								this.isAutoReslove = true;
								this.isForwardToFrontDesk = true;
							}
							this.action = this.checkID;
							this.applyActionCheck = this.checkID;
						},
						(error) => {},
					);
			});
		this.isEnableSpecButtons = true;
		this.allSpecChecked = false;
		this.numSpecSelected = 0;
		this.counterSpecChecked = 0;
		this.deleteAllClinic = { clinics: [] };
		this.getAllSpeciallity();
	} // constructor end
	ngOnInit() {
		this.subjectService.castClinicCustomization.subscribe((res) => {
			if (res == 'refreshCustomization') {
				this.requestService
					.sendRequest(
						AssignSpecialityUrlsEnum.Facility_list_Post,
						'POST',
						REQUEST_SERVERS.schedulerApiUrl,
						{ clinics: this.allClinicIds },
					)
					.subscribe((response: HttpSuccessResponse) => {
						this.allClinics = response.result.data;
						this.clinicLastPage = Math.ceil(this.allClinics.length / this.counterClinic);
						this.clinicEntriesOnLastPage = this.allClinics.length % this.counterClinic;
						for (var i = 0, j = 1; i < response.result.data.length; i++, j++) {
							this.filterClinicData[j] = response.result.data[i];
						}
						this.myForm.controls['clinicName'].setValue(this.filterClinicData[0].id);
						for (let i = 0; i < this.allClinics.length; i++) {
							this.allClinics[i]['isChecked'] = false;
							this.allClinics[i].color = ('#' + this.allClinics[i].color).slice(-7);
						}
						this.allallClinics = JSON.parse(JSON.stringify(this.allClinics));
					});
				if (this.deleteAllClinic.clinics.length == 0) {
					this.numClinicSelected = 0;
					this.isEnableClinicButtons = true;
					this.allClinicChecked = false;
					this.counterClinicChecked = 0;
				}
				if (this.deleteAllSpec.specialities.length == 0) {
					this.isEnableSpecButtons = true;
					this.allSpecChecked = false;
					this.numSpecSelected = 0;
					this.counterSpecChecked = 0;
					this.deleteAllClinic = { clinics: [] };
				}
				this.getAllSpeciallity();
			}
		});
		if (
			this.aclService.hasPermission(this.userPermissions.customize_preference_menu) ||
			this.storageData.isSuperAdmin()
		) {
			this.pref = true;
		} else {
			this.pref = false;
		}
		if (
			this.aclService.hasPermission(this.userPermissions.customize_speciality_menu) ||
			this.storageData.isSuperAdmin()
		) {
			this.specEdit = true;
		} else {
			this.specEdit = false;
		}
		if (
			this.aclService.hasPermission(this.userPermissions.customize_facility_menu) ||
			this.storageData.isSuperAdmin()
		) {
			this.facilityColorEdit = true;
		} else {
			this.facilityColorEdit = false;
		}
	}
	/*Form intilaization function*/
	private createForm() {
		this.myForm = this.formBuilder.group({
			clinicName: ['', Validators.required],
			timeslotName: ['', Validators.required],
			overBookingName: ['', Validators.required],
			specialityName: ['', Validators.required],
			priorityName: ['', Validators.required],
			address: ['', Validators.required],
		});
	}
	/*Get all specialities*/
	public getAllSpeciallity() {
		this.requestService
			.sendRequest(
				AssignSpecialityUrlsEnum.Speciality_list,
				'POST',
				REQUEST_SERVERS.schedulerApiUrl,
			)
			.subscribe(
				(response: HttpSuccessResponse) => {
					this.allSpeciallity = response.result.data;
					this.specLastPage = Math.ceil(this.allSpeciallity.length / this.counterSpec);
					this.specEntriesOnLastPage = this.allSpeciallity.length % this.counterSpec;
					for (var i = 0, j = 1; i < response.result.data.length; i++, j++) {
						this.filterSpecialityData[j] = response.result.data[i];
					}
					
					// this.myForm.controls['specialityName'].setValue(this.filterClinicData[0].id);
					// this.specSelectedMultiple1 = this.filterClinicData[0].id;
					this.filterSpecialityData.splice(0,1);
					this.filterSpecialityData = [...this.filterSpecialityData];
					this.spec['specialities'] = [{}];
					this.spec['specialities'].pop();
					for (let i = 0; i < response.result.data.length; i++) {
						this.allSpeciallity[i]['isChecked'] = false;
						if (response.result.data[i]['color'].includes('#')) {
							response.result.data[i].color = response.result.data[i].color.slice(-6);
						}
						const obj = {
							specID: response.result.data[i].id,
							color: response.result.data[i].color,
						};

						this.spec['specialities'].push(obj);
					}
					for (let i = 0; i < this.allSpeciallity.length; i++) {
						this.allSpeciallity[i]['isChecked'] = false;
						this.allSpeciallity[i].color = ('#' + this.allSpeciallity[i].color).slice(-7);
					}
					this.allallSpecData = this.allSpeciallity;
				},
				(error) => {
				},
			);
	}
	/*Get all clinics*/
	public getClinics() {
		this.requestService
			.sendRequest(
				AssignSpecialityUrlsEnum.Facility_list_Post,
				'POST',
				REQUEST_SERVERS.schedulerApiUrl,
				{ clinics: this.allClinicIds },
			)
			.subscribe((res: HttpSuccessResponse) => {
				this.allClinics = res.result.data;
				this.clinicLastPage = Math.ceil(this.allClinics.length / this.counterClinic);
				this.clinicEntriesOnLastPage = this.allClinics.length % this.counterClinic;
				for (var i = 0, j = 1; i < res.result.data.length; i++, j++) {
					this.filterClinicData[j] = res.result.data[i];
				}
				this.myForm.controls['clinicName'].setValue(this.filterClinicData[0].id);

				for (let i = 0; i < this.allClinics.length; i++) {
					this.allClinics[i]['isChecked'] = false;
					this.allClinics[i].color = ('#' + this.allClinics[i].color).slice(-7);
				}
				this.allallClinics = this.allClinics;
			});
	}
	/*Practice section enabled*/
	public selectPractice(e) {
		this.isClinicChecked = false;
		this.isSpeciallityChecked = true;
		this.isPreferencesChecked = false;
	}
	/*Speciality section enabled*/
	public selectSpeciallity(event) {
		this.isClinicChecked = true;
		this.isPreferencesChecked = false;
		this.isSpeciallityChecked = false;
	}
	/*Prefrence section enabled*/
	public selectPreferences($event) {
		this.isClinicChecked = false;
		this.isSpeciallityChecked = false;
		this.isPreferencesChecked = true;
	}
	/*Particular speciality selected from table to perform  certain action*/
	public particularSpecSelected(data, e) {
		if (e.checked) {
			this.isEnableSpecButtons = false;
			this.numSpecSelected = this.numSpecSelected + 1;

			for (var i = 0; i < this.allSpeciallity.length; i++) {
				if (data.id == this.allSpeciallity[i].id) {
					data.isChecked = true;
					this.allSpeciallity[i]['isChecked'] = true;
					this.deleteAllSpec.specialities.push([{ specID: data.id, color: data.color }]);
					this.counterSpecChecked++;
					break;
				}
			}
			if (
				this.specPageNumber == this.specLastPage &&
				this.counterSpecChecked == this.specEntriesOnLastPage &&
				this.specEntriesOnLastPage != 0
			) {
				this.allSpecChecked = true;
			} else if (
				this.counterSpec == this.counterSpecChecked ||
				this.allSpeciallity.length == this.counterSpec
			) {
				this.allSpecChecked = true;
			} else {
				this.allSpecChecked = false;
			}
		} else {
			this.numSpecSelected = this.numSpecSelected - 1;
			this.allSpecChecked = false;
			if (this.numSpecSelected <= 0) {
				this.isEnableSpecButtons = true;
			}
			for (var i = 0; i < this.allSpeciallity.length; i++) {
				if (data.id == this.allSpeciallity[i].id) {
					data.isChecked = false;
					this.allSpeciallity[i]['isChecked'] = false;
					this.deleteAllSpec.specialities.splice(
						this.deleteAllSpec.specialities.indexOf((x) => x.specID == this.allSpeciallity[i].id),
						1,
					);
					this.counterSpecChecked--;
					break;
				}
			}
		}
	}
	/*All specailities selected from table to perform  certain actions */
	public allSpecSelected(e) {
		this.counterSpecChecked = 0;
		if (e.checked) {
			this.isEnableSpecButtons = false;
			this.allSpecChecked = true;
			let start = this.counterSpec * (this.specPageNumber - 1);
			for (var i = start; i < start + this.counterSpec; i++) {
				if (this.allSpeciallity[i] != undefined) {
					if (this.allSpeciallity[i]['isChecked'] == false) {
						this.allSpeciallity[i]['isChecked'] = true;
						this.deleteAllSpec.specialities.push([
							{ specID: this.allSpeciallity[i].id, color: this.allSpeciallity[i].color },
						]);
						this.numSpecSelected++;
						this.counterSpecChecked++;
					}
				}
			}
		} else {
			this.isEnableSpecButtons = true;
			this.allSpecChecked = false;
			let start = this.counterSpec * (this.specPageNumber - 1);
			for (var i = start; i < start + this.counterSpec; i++) {
				if (this.allSpeciallity[i] != undefined) {
					if (this.allSpeciallity[i]['isChecked'] == true) {
						this.allSpeciallity[i]['isChecked'] = false;
						this.deleteAllSpec.specialities.splice(
							this.deleteAllSpec.specialities.indexOf((x) => x.specID == this.allSpeciallity[i].id),
							1,
						);
						this.numSpecSelected--;
						this.counterSpecChecked--;
					}
				}
			}
		}
	}
	/*Particular clinic selected from table to perform  certain action*/
	public particularClinicSelected(data, e) {
		if (e.checked) {
			this.isEnableClinicButtons = false;
			this.numClinicSelected = this.numClinicSelected + 1;

			for (var i = 0; i < this.allClinics.length; i++) {
				if (data.id == this.allClinics[i].id) {
					data.isChecked = true;
					this.allClinics[i]['isChecked'] = true;
					this.deleteAllClinic.clinics.push([
						{ color: this.allClinics[i].color, clinicID: this.allClinics[i].id },
					]);
					this.counterClinicChecked++;
					break;
				}
			}
			if (
				this.clinicPageNumber == this.clinicLastPage &&
				this.counterClinicChecked == this.clinicEntriesOnLastPage &&
				this.clinicEntriesOnLastPage != 0
			) {
				this.allClinicChecked = true;
			} else if (
				this.counterClinic == this.counterClinicChecked ||
				this.allClinics.length == this.counterClinic
			) {
				this.allClinicChecked = true;
			} else {
				this.allClinicChecked = false;
			}
		} else {
			this.numClinicSelected = this.numClinicSelected - 1;
			this.allClinicChecked = false;
			if (this.numClinicSelected <= 0) {
				this.isEnableClinicButtons = true;
			}
			for (var i = 0; i < this.allClinics.length; i++) {
				if (data.id == this.allClinics[i].id) {
					data.isChecked = false;
					this.allClinics[i]['isChecked'] = false;
					this.deleteAllClinic.clinics.splice(
						this.deleteAllClinic.clinics.indexOf((x) => x.clinicID == this.allClinics[i].id),
						1,
					);
					this.counterClinicChecked--;
					break;
				}
			}
		}
	}
	/*All clinics selected from table to perform  certain actions */
	public allClinicSelected(e) {
		this.counterClinicChecked = 0;
		if (e.checked) {
			this.isEnableClinicButtons = false;
			this.allClinicChecked = true;
			let start = this.counterClinic * (this.clinicPageNumber - 1);
			for (var i = start; i < start + this.counterClinic; i++) {
				if (this.allClinics[i] != undefined) {
					if (this.allClinics[i]['isChecked'] == false) {
						this.allClinics[i]['isChecked'] = true;
						this.deleteAllClinic.clinics.push([
							{ color: this.allClinics[i].color, clinicID: this.allClinics[i].id },
						]);
						this.numClinicSelected++;
						this.counterClinicChecked++;
					}
				}
			}
		} else {
			this.isEnableClinicButtons = true;
			this.allClinicChecked = false;
			let start = this.counterClinic * (this.clinicPageNumber - 1);
			for (var i = start; i < start + this.counterClinic; i++) {
				if (this.allClinics[i] != undefined) {
					if (this.allClinics[i]['isChecked'] == true) {
						this.allClinics[i]['isChecked'] = false;
						this.deleteAllClinic.clinics.splice(
							this.deleteAllClinic.clinics.indexOf((x) => x.clinicID == this.allClinics[i].id),
							1,
						);
						this.numClinicSelected--;
						this.counterClinicChecked--;
					}
				}
			}
		}
	}
	/*See more and less functionality for clinic filters*/
	public openAndCloseClinicFilters() {
		this.isOpenClinicFilters = !this.isOpenClinicFilters;
	}
	/*See more and less functionality for speciality filters*/
	public openAndCloseSpecFilters() {
		this.isOpenSpecFilters = !this.isOpenSpecFilters;
	}
	/*Apply speciality filters*/
	public applySpecFilter() {
		this.allSpeciallity = this.allallSpecData;
		if (this.specSelectedMultiple1 != undefined)
		{
			if (this.specSelectedMultiple1.length != 0) {
				let temporaryOne = [];
				for (var i = 0; i < this.allSpeciallity.length; i++) {
					for(let j =0 ;j<this.specSelectedMultiple1.length;j++)
					{
						if (this.allSpeciallity[i]['id'] === parseInt(this.specSelectedMultiple1[j])) {
							temporaryOne.push(this.allSpeciallity[i]);
						}
					}
				}
				this.allSpeciallity = temporaryOne;
			}
		}
		
		if (this.myForm.get('timeslotName').value != '') {
			let temporaryOne = [];
			for (var i = 0; i < this.allSpeciallity.length; i++) {
				if (this.allSpeciallity[i]['timeSlot'] == parseInt(this.myForm.get('timeslotName').value)) {
					temporaryOne.push(this.allSpeciallity[i]);
				}
			}
			this.allSpeciallity = temporaryOne;
		}
		if (this.myForm.get('overBookingName').value != '') {
			let temporaryOne = [];
			for (var i = 0; i < this.allSpeciallity.length; i++) {
				if (
					this.allSpeciallity[i]['overBooking'] ===
					parseInt(this.myForm.get('overBookingName').value)
				) {
					temporaryOne.push(this.allSpeciallity[i]);
				}
			}
			this.allSpeciallity = temporaryOne;
		}
		for (var i = 0; i < this.allSpeciallity.length; i++) {
			this.allSpeciallity[i]['isChecked'] = false;
		}
		for (var i = 0; i < this.allallSpecData.length; i++) {
			this.allallSpecData[i]['isChecked'] = false;
		}
		this.isEnableClinicButtons = true;
		this.numSpecSelected = 0;
		this.allSpecChecked = false;
		this.counterSpecChecked = 0;
		this.deleteAllSpec = { specialities: [] };
		this.changeNoOfEntriesForSpeciality(this.counterSpec);
	}
	/*Apply clinic filters*/
	public applyClinicFilter() {
		this.allClinics = this.allallClinics;
		// if (this.myForm.get('clinicName').value != 0) {
		// 	let temporaryOne = [];
		// 	for (var i = 0; i < this.allClinics.length; i++) {
		// 		if (this.allClinics[i]['id'] === parseInt(this.myForm.get('clinicName').value)) {
		// 			temporaryOne.push(this.allClinics[i]);
		// 		}
		// 	}
		// 	this.allClinics = temporaryOne;
		// }
		if (this.specSelectedMultiple != undefined)
		 {
			 if(  this.specSelectedMultiple.length != 0 )
			 {
				let temporaryOne = [];
				for (var i = 0; i < this.allClinics.length; i++) {
					for(let j  =0 ;j< this.specSelectedMultiple.length;j++)
					{
						if (this.allClinics[i]['id'] === parseInt(this.specSelectedMultiple[j])) {
							temporaryOne.push(this.allClinics[i]);
						}
					}
				}
				this.allClinics = temporaryOne;
			 }
		}
		
		if (this.myForm.get('address').value != '') {
			let temporaryOne = [];
			for (var i = 0; i < this.allClinics.length; i++) {
				if (this.allClinics[i]['address'].includes(this.myForm.get('address').value)) {
					temporaryOne.push(this.allClinics[i]);
				}
			}
			this.allClinics = temporaryOne;
		}
		for (var i = 0; i < this.allClinics.length; i++) {
			this.allClinics[i]['isChecked'] = false;
		}
		for (var i = 0; i < this.allallClinics.length; i++) {
			this.allallClinics[i]['isChecked'] = false;
		}
		this.isEnableClinicButtons = true;
		this.numClinicSelected = 0;
		this.allClinicChecked = false;
		this.counterClinicChecked = 0;
		this.deleteAllSpec = { specialities: [] };
		this.changeNoOfEntriesForClinics(this.counterClinic);
	}
	/*Reset speciality filters*/
	public resetSpec() {
		this.specSelectedMultiple1 = null;
		this.isEnableSpecButtons = true;
		this.allSpecChecked = false;
		this.numSpecSelected = 0;
		this.counterSpecChecked = 0;
		this.deleteAllSpec = { specialities: [] };
		this.getAllSpeciallity();
		this.myForm.controls['timeslotName'].setValue('');
		this.myForm.controls['overBookingName'].setValue('');
	}
	/*Reset clinic filters*/
	public resetClinic() {
		this.specSelectedMultiple = null;
		this.isEnableClinicButtons = true;
		this.allClinicChecked = false;
		this.numClinicSelected = 0;
		this.counterClinicChecked = 0;
		this.deleteAllClinic = { clinics: [] };
		this.getClinics();
		this.myForm.controls['address'].setValue('');
	}
	/*Details of clinic/speciality for customization*/
	public customizationDetails(data, clinicCheck) {
		if (clinicCheck === 'clinic') {
			this._SupervisorService.isClinic = true;
		} else {
			this._SupervisorService.isClinic = false;
		}
		this._SupervisorService.customizeData = data;
		const activeModal = this.add.open(CustomizationComponent, {
			size: 'sm',
			backdrop: 'static',
			keyboard: false,
		});
	}
	/*Actions options against appointment(i.e auto reslove,cancel,forward to front desk) for login user*/
	public changeAppointmentsAction() {
		if (this.action == 2) {
			this.isForwardToFrontDesk = false;
			this.isAutoReslove = true;
			this.targetClinicName = this.allClinics[0]['id'];
			this.applyActionCheck = 2; // if forwardtoFD selected bcz 2 is ID of forwardToFD check array line 36
		} else if (this.action == 3) {
			this.isAutoReslove = false;
			this.isForwardToFrontDesk = true;
			this.autoReolveAppointment = this.autoResolveList[0]['id'];
			this.applyActionCheck = 3; // if autoResolve selected bcz 3 is ID of autoRes check array line 36
		} else {
			this.isForwardToFrontDesk = true;
			this.isAutoReslove = true;
			this.applyActionCheck = 1; // if cancelAssign selected bcz 1 is ID of cancelAssi check array line 36
		}
	}
	/*No of entries to show in specaility table*/
	public changeNoOfEntriesForSpeciality(e) {
		this.counterSpec = e;
		this.counterSpec = parseInt(this.counterSpec);
		this.specLastPage = Math.ceil(this.allSpeciallity.length / this.counterSpec);
		this.specEntriesOnLastPage = this.allSpeciallity.length % this.counterSpec;
		if (this.counterSpec >= this.allSpeciallity.length) {
			this.specPageNumber = 1;
		} else {
			if (this.specLastPage <= this.specPageNumber) {
				this.specPageNumber = this.specEntriesOnLastPage;
			} else {
				this.specPageNumber = this.specPageNumber;
			}
			this.counterSpecChecked = 0;
			this.allSpecChecked = false;
			if (this.numSpecSelected > 0) {
				this.isEnableSpecButtons = false;
			} else {
				this.isEnableSpecButtons = true;
			}
			let start = this.counterSpec * (this.specPageNumber - 1);
			for (var i = start; i < this.counterSpec + start; i++) {
				if (this.allSpeciallity[i] != undefined) {
					if (this.allSpeciallity[i]['isChecked'] == true) {
						this.counterSpecChecked++;
					}
				}
			}
			if (
				this.specPageNumber == this.specLastPage &&
				this.counterSpecChecked == this.specEntriesOnLastPage &&
				this.specEntriesOnLastPage != 0
			) {
				this.allSpecChecked = true;
			} else if (
				this.counterSpecChecked == this.counterSpec ||
				this.allSpeciallity.length == this.counterSpecChecked
			) {
				this.allSpecChecked = true;
			} else {
				this.allSpecChecked = false;
			}
		}
	}
	/*No of entries to show in clinic table*/
	public changeNoOfEntriesForClinics(e) {
		this.counterClinic = e;
		this.counterClinic = parseInt(this.counterClinic);
		this.clinicLastPage = Math.ceil(this.allClinics.length / this.counterClinic);
		this.clinicEntriesOnLastPage = this.allClinics.length % this.counterClinic;
		if (this.counterClinic >= this.allClinics.length) {
			this.clinicPageNumber = 1;
		} else {
			if (this.clinicLastPage <= this.clinicPageNumber) {
				this.clinicPageNumber = this.clinicEntriesOnLastPage;
			} else {
				this.clinicPageNumber = this.clinicPageNumber;
			}
			// this.pageNumber = this.otherPage
			this.counterClinicChecked = 0;
			this.allClinicChecked = false;
			if (this.numClinicSelected > 0) {
				this.isEnableClinicButtons = false;
			} else {
				this.isEnableClinicButtons = true;
			}
			let start = this.counterClinic * (this.clinicPageNumber - 1);
			for (var i = start; i < this.counterClinic + start; i++) {
				if (this.allClinics[i] != undefined) {
					if (this.allClinics[i]['isChecked'] == true) {
						this.counterClinicChecked++;
					}
				}
			}
			if (
				this.clinicPageNumber == this.clinicLastPage &&
				this.counterClinicChecked == this.clinicEntriesOnLastPage &&
				this.clinicEntriesOnLastPage != 0
			) {
				this.allClinicChecked = true;
			} else if (
				this.counterClinicChecked == this.counterClinic ||
				this.allClinics.length == this.counterClinicChecked
			) {
				this.allClinicChecked = true;
			} else {
				this.allClinicChecked = false;
			}
		}
	}
	/*Update user prefrences*/
	public applyPrefenceAction() {
		if (this.applyActionCheck == 1) {
			var requestObject = {
				approveAction: {
					action: 'cancel',
				},
			};
			this.requestService
				.sendRequest(
					CustomizationUrlsEnum.changeUserPreferences,
					'POST',
					REQUEST_SERVERS.schedulerApiUrl,
					requestObject,
				)
				.subscribe((response: HttpSuccessResponse) => {
					this.toasterService.success('User preference changed', 'Success');
				});
		} else if (this.applyActionCheck == 2) {
			var object = {
				approveAction: {
					action: 'forward',
					clinics: [],
				},
			};
			for (var i = 0; i < this.clinicArray.length; i++) {
				object.approveAction.clinics.push({
					originClinicId: this.clinicArray[i].id,
					targetClinicId: this.targetClinicName,
				});
			}

			this.requestService
				.sendRequest(
					CustomizationUrlsEnum.changeUserPreferences,
					'POST',
					REQUEST_SERVERS.schedulerApiUrl,
					object,
				)
				.subscribe((response: HttpSuccessResponse) => {
					this.toasterService.success('User preference changed', 'Success');
				});
		} else if (this.applyActionCheck == 3) {
			var req_object = {
				approveAction: {
					action: 'autoresolve',
					clinics: parseInt(this.autoReolveAppointment),
				},
			};

			this.requestService
				.sendRequest(
					CustomizationUrlsEnum.changeUserPreferences,
					'POST',
					REQUEST_SERVERS.schedulerApiUrl,
					req_object,
				)
				.subscribe((response: HttpSuccessResponse) => {
					this.toasterService.success('User preference changed', 'Success');
				});
		}
	}
	/*Delete particular specaility*/
	public deleteSpec(data) {

		this.customDiallogService.confirm('Reset','Are you sure you want to reset?','Yes','No')
		.then((confirmed) => {

			if (confirmed){
				for (var i = 0; i < this.allSpeciallity.length; i++) {
					if (this.allSpeciallity[i].id == data.id) {
						data.color = '9D9D9D';
						data.overBooking = 0;

						var object = {
							specialities: [{ specID: data.id, color: data.color }],
						};

						this.requestService
							.sendRequest(
								CustomizationUrlsEnum.changeSpecialityColor,
								'POST',
								REQUEST_SERVERS.schedulerApiUrl,
								object,
							)
							.subscribe((response: HttpSuccessResponse) => {
								this.toasterService.success('Color deleted successfully', 'Success');
							});
						var obj = {
							speciality: [
								{
									id: data.id,
									overBooking: data.overBooking,
								},
							],
						};

						this.requestService
							.sendRequest(
								CustomizationUrlsEnum.updateOverBookingLimit,
								'POST',
								REQUEST_SERVERS.schedulerApiUrl,
								obj,
							)
							.subscribe((resp: HttpSuccessResponse) => {
								this.toasterService.success('Overbooking deleted successfully', 'Success');
								if (data.isChecked) {
									this.deleteAllSpec.specialities.splice(
										this.deleteAllSpec.specialities.indexOf((x) => x.specID == data.id),
										1,
									);
								}
								if (this.deleteAllSpec.specialities.length == 0) {
									this.isEnableSpecButtons = true;
									this.allSpecChecked = false;
									this.numSpecSelected = 0;
									this.counterSpecChecked = 0;
									this.deleteAllSpec = { specialities: [] };
								}
								this.resetSpec();
							});
						break;
					}
				}
			}else if(confirmed === false){
			}else{
			}
		})
		.catch();
	}
	/*Delete particular clinic*/
	public deleteClinic(data) {
		

this.customDiallogService.confirm('Reset','Are you sure you want to reset?','Yes','No')
.then((confirmed) => {
	if (confirmed){
		for (var i = 0; i < this.allClinics.length; i++) {
			if (this.allClinics[i].id == data.id) {
				data.color = '9D9D9D';

				var object = {
					clinics: [{ color: data.color, clinicID: data.id }],
				};
				this.requestService
					.sendRequest(
						CustomizationUrlsEnum.changeFacilityColor,
						'POST',
						REQUEST_SERVERS.schedulerApiUrl,
						object,
					)
					.subscribe((resp: HttpSuccessResponse) => {
						if (data.isChecked) {
							this.deleteAllClinic.clinics.splice(
								this.deleteAllClinic.clinics.indexOf((x) => x.clinicID == data.id),
								1,
							);
						}
						this.toasterService.success('Color deleted successfully', 'Success');
						this.resetClinic();
					});
				break;
			}
		}
	}else if(confirmed === false){
	}else{
	}
})
.catch();
	
	}
	/*Delete all specailities*/
	public deleteAllSpeciality() {
		if (this.deleteAllSpec.specialities.length != 0) {
			var object = {
				specialities: [],
			};
			var obj = [];
			this.customDiallogService.confirm('Delete','Are you sure you want to delete','Yes','No')
		.then((confirmed) => {
			if (confirmed){
				for (var i = 0; i < this.allSpeciallity.length; i++) {
					for (var j = 0; j < this.deleteAllSpec.specialities.length; j++) {
						if (this.allSpeciallity[i].id == this.deleteAllSpec.specialities[j][0].specID) {
							this.allSpeciallity[i].color = '9D9D9D';
							this.allSpeciallity[i].overBooking = 0;
							object.specialities.push({
								specID: this.allSpeciallity[i].id,
								color: this.allSpeciallity[i].color,
							});
							obj.push({
								id: this.allSpeciallity[i].id,
								overBooking: this.allSpeciallity[i].overBooking,
							});
						}
					}
				}
				this.requestService
					.sendRequest(
						CustomizationUrlsEnum.changeSpecialityColor,
						'POST',
						REQUEST_SERVERS.schedulerApiUrl,
						object,
					)
					.subscribe((response: HttpSuccessResponse) => {
						this.toasterService.success('Color deleted successfully', 'Success');
					});
				this.requestService
					.sendRequest(
						CustomizationUrlsEnum.updateOverBookingLimit,
						'POST',
						REQUEST_SERVERS.schedulerApiUrl,
						{ speciality: obj },
					)
					.subscribe((resp: HttpSuccessResponse) => {
						this.toasterService.success('Overbooking deleted successfully', 'Success');
						for (var i = 0; i < this.allSpeciallity.length; i++) {
							if (this.deleteAllSpec.specialities.length != 0) {
								this.deleteAllSpec.specialities.splice(
									this.deleteAllSpec.specialities.indexOf(
										(x) => x.specID == this.allSpeciallity[i].id,
									),
									1,
								);
							} else {
								break;
							}
						}
						this.resetSpec();
					});
			}else if(confirmed === false){
			}else{
			}
		})
		.catch();
		}
	}
	/*Delete all clinics*/
	public deleteAllClinics() {
		if (this.deleteAllClinic.clinics.length != 0) {
			var object = {
				clinics: [],
			};

			

this.customDiallogService.confirm('Delete','Are you sure you want to delete','Yes','No')
.then((confirmed) => {
	if (confirmed){
		for (var i = 0; i < this.allClinics.length; i++) {
			for (var j = 0; j < this.deleteAllClinic.clinics.length; j++) {
				if (this.allClinics[i].id == this.deleteAllClinic.clinics[j][0].clinicID) {
					this.allClinics[i].color = '9D9D9D';
					object.clinics.push({
						color: this.allClinics[i].color,
						clinicID: this.allClinics[i].id,
					});
				}
			}
		}
		this.requestService
			.sendRequest(
				CustomizationUrlsEnum.changeFacilityColor,
				'POST',
				REQUEST_SERVERS.schedulerApiUrl,
				object,
			)
			.subscribe((resp: HttpSuccessResponse) => {
				this.toasterService.success('Color deleted successfully', 'Success');
				for (var i = 0; i < this.allClinics.length; i++) {
					if (this.deleteAllClinic.clinics.length != 0) {
						this.deleteAllClinic.clinics.splice(
							this.deleteAllClinic.clinics.indexOf(
								(x) => x.clinicID == this.allClinics[i].id,
							),
							1,
						);
					} else {
						break;
					}
				}
				this.resetClinic();
			});
	}else if(confirmed === false){
	}else{
	}
})
.catch();

		
		}
	}
	/*Change clinic page function*/
	public changeClinicPage(e) {
		this.counterClinicChecked = 0;
		this.clinicPageNumber = e.offset + 1;
		this.allClinicChecked = false;
		let start = this.counterClinic * (this.clinicPageNumber - 1);
		for (var i = start; i < this.counterClinic + start; i++) {
			if (this.allClinics[i] != undefined) {
				if (this.allClinics[i]['isChecked'] == true) {
					this.counterClinicChecked++;
				}
			}
		}
		if (
			this.clinicPageNumber == this.clinicLastPage &&
			this.counterClinicChecked == this.clinicEntriesOnLastPage &&
			this.clinicEntriesOnLastPage != 0
		) {
			this.allClinicChecked = true;
		} else if (
			this.counterClinic == this.counterClinicChecked ||
			this.allClinics.length == this.counterClinic
		) {
			this.allClinicChecked = true;
		} else {
			this.allClinicChecked = false;
		}
	}
	/*Change speciality page function*/
	public changeSpecailityPage(e) {
		this.counterSpecChecked = 0;
		this.specPageNumber = e.offset + 1;
		this.allSpecChecked = false;
		if (this.numSpecSelected > 0) {
			this.isEnableSpecButtons = false;
		} else {
			this.isEnableSpecButtons = true;
		}
		let start = this.counterSpec * (this.specPageNumber - 1);
		for (var i = start; i < this.counterSpec + start; i++) {
			if (this.allSpeciallity[i] != undefined) {
				if (this.allSpeciallity[i]['isChecked'] == true) {
					this.counterSpecChecked++;
				}
			}
		}
		if (
			this.specPageNumber == this.specLastPage &&
			this.counterSpecChecked == this.specEntriesOnLastPage &&
			this.specEntriesOnLastPage != 0
		) {
			this.allSpecChecked = true;
		} else if (
			this.counterSpec == this.counterSpecChecked ||
			this.allSpeciallity.length == this.counterSpec
		) {
			this.allSpecChecked = true;
		} else {
			this.allSpecChecked = false;
		}
	}
}
