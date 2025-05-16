import { map, filter, takeUntil } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import {
	Component,
	OnInit,
} from '@angular/core';
import {
	FormBuilder,
	FormGroup,
	Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

// import {
// 	IMyDateModel,
// 	IMyDpOptions,
// } from 'mydatepicker';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';

import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import {
	HttpSuccessResponse,
	StorageData,
} from '@appDir/pages/content-pages/login/user.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { AclService } from '@appDir/shared/services/acl.service';
import { RequestService } from '@appDir/shared/services/request.service';

import { AssignSpecialityUrlsEnum } from '../../assign-speciality-urls-enum';
import { AssignSpecialityService } from '../../assign-speciality.service';
import { SubjectService } from '../../subject.service';
import { Pagination } from '@appDir/shared/models/pagination';
import {  convertDateTimeForRetrieving, convertDateTimeForSending, endDateToGetAssignments, startDateToGetAssignments, unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';
import { Moment } from 'moment';

@Component({
	selector: 'app-home-spec',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss'],
})
export class HomeComponent extends PermissionComponent implements OnInit {
	refresh: Subject<any> = new Subject();
	public speciality: any = [];
	public clinics: any = [];
	public specAssign: any = [];
	public state: boolean = false;
	public calenderClinics: any = [{ name: '', id: 0 }];
	public calenderSpeciality: any = [{ name: '', id: 0 }];
	public loading = false;
	// public myDatePickerOptions: IMyDpOptions = {
	// 	dateFormat: 'dd.mm.yyyy',
	// 	inline: true,
	// 	height: '100%',
	// 	selectorWidth: '100%',
	// 	firstDayOfWeek: 'su',
	// 	sunHighlight:false
	// };
	public model: any;
	public myForm: FormGroup;
	public view: string = 'month';
	public isSwapped: boolean = true;
	public viewDate: Date = new Date();
	public datePick: Date;
	minDate = new Date('1900/01/01');
	public allFacilitySupervisorClinicIds: any = [];
	 public currentpagePracticeLocation:number=1
	 public currentpageSpecialty:number=1;
	 public destroySpecialty$:Subject<boolean>=new Subject<boolean>();
	 public destroyClinic$:Subject<boolean>=new Subject<boolean>();
	constructor(
		aclService: AclService,
		protected requestService: RequestService,
		router: Router,
		private _httpClient: HttpClient,
		public subject: SubjectService,
		private formBuilder: FormBuilder,
		private storageData: StorageData,
		public _assignSpecialityService: AssignSpecialityService,
		private toastrService: ToastrService,
	) {
		super(aclService, router);
		const scheduler = this.storageData.getSchedulerInfo();
		// assigning localstorage
		if (
			scheduler.supervisor_assign_speciality_is_swapped == '' ||
			scheduler.supervisor_assign_speciality_is_swapped == undefined
		) {
			scheduler.supervisor_assign_speciality_is_swapped = 'true';
		}
		if (
			scheduler.supervisor_assign_speciality_all_clinics == '' ||
			scheduler.supervisor_assign_speciality_all_clinics == undefined
		) {
			scheduler.supervisor_assign_speciality_all_clinics = '[{"name": "", "id": 0}]';
		}
		if (
			scheduler.supervisor_assign_speciality_all_speciality == '' ||
			scheduler.supervisor_assign_speciality_all_speciality == undefined
		) {
			scheduler.supervisor_assign_speciality_all_speciality = '[{"name": "", "id": 0}]';
		}
		if (
			scheduler.supervisor_assign_speciality_view == '' ||
			scheduler.supervisor_assign_speciality_view == undefined
		) {
			scheduler.supervisor_assign_speciality_view = 'month';
		}
		this.isSwapped = JSON.parse(scheduler.supervisor_assign_speciality_is_swapped);
		this.view = scheduler.supervisor_assign_speciality_view;

		this.calenderClinics = JSON.parse(scheduler.supervisor_assign_speciality_all_clinics);
		this.calenderSpeciality = JSON.parse(scheduler.supervisor_assign_speciality_all_speciality);
		this.storageData.setSchedulerInfo(scheduler);
		//assigning date to mini calendar
		let currentDate = new Date();
		this.model = {
			date: {
				year: currentDate.getFullYear(),
				month: currentDate.getMonth() + 1,
				day: currentDate.getDate(),
			},
		};
		// this.spinner.show()
		this.viewDate = new Date(this.viewDate);
	}
	ngOnInit(): void {
		this.refresh.next(1);
		this.myForm = this.formBuilder.group({
			myDate: [null, Validators.required],
		});
	this.subscription.push(	this.subject.castUpdate.subscribe((res) => {
			this.getAssignments(this.calenderSpeciality, this.calenderClinics, this.viewDate);
		}));
		this.getClinics(this.currentpagePracticeLocation);
		this.getSpeciality(this.currentpageSpecialty);
	}
	ngOnDestroy()
	{
		unSubAllPrevious(this.subscription);
		this.destroySpecialty$.next(true)
		this.destroySpecialty$.unsubscribe();
		this.destroyClinic$.next(true);
		this.destroyClinic$.unsubscribe();
	}
	public viewChange(event) {
		debugger;
		const scheduler = this.storageData.getSchedulerInfo();
		scheduler.supervisor_assign_speciality_view = event;
		this.storageData.setSchedulerInfo(scheduler);
	}
	public getMainCalendarCurrentDate(event) {
		if (this.state) {
			let newDate = new Date(event);
			this.model = {
				date: {
					year: newDate.getFullYear(),
					month: newDate.getMonth() + 1,
					day: newDate.getDate(),
				},
			};
			this.myForm.patchValue({
				myDate: {
					date: {
						year: newDate.getFullYear(),
						month: newDate.getMonth() + 1,
						day: newDate.getDate(),
					},
				},
			});
			let currentDate =
				this.model.date.year + '-' + this.model.date.month + '-' + this.model.date.day;
			this.viewDate = new Date(currentDate);
		} else {
			let newDate = new Date(event);
			this.model = {
				date: {
					year: newDate.getFullYear(),
					month: newDate.getMonth() + 1,
					day: newDate.getDate(),
				},
			};
		}
		this.getAssignments(this.calenderSpeciality, this.calenderClinics, this.viewDate);
	}
	public shift(value) {
		this.isSwapped = !this.isSwapped;
		let tempArr;
		tempArr = JSON.parse(JSON.stringify(this.calenderSpeciality));
		this.calenderSpeciality = JSON.parse(JSON.stringify(this.calenderClinics));
		this.calenderClinics = JSON.parse(JSON.stringify(tempArr));
		const scheduler = this.storageData.getSchedulerInfo();
		scheduler.supervisor_assign_speciality_is_swapped = JSON.stringify(this.isSwapped);
		scheduler.supervisor_assign_speciality_all_clinics = JSON.stringify(this.calenderClinics);
		scheduler.supervisor_assign_speciality_all_speciality = JSON.stringify(this.calenderSpeciality);
		this.storageData.setSchedulerInfo(scheduler);
	}
	public selectClinic(clinic) {
		if (this.isSwapped) {
			let check = false;
			for (let i = 0; i < this.calenderClinics.length; i++) {
				if (clinic['id'] == this.calenderClinics[i]['id']) {
					check = true;
					break;
				}
			}
			if (check == false) {
				if (this.calenderClinics.length != 0 && this.calenderClinics[0].id == 0) {
					this.calenderClinics = [];
				}
				clinic['isChecked'] = true;
				this.calenderClinics.push(clinic);
			} else {
				for (let i = 0; i < this.calenderClinics.length; i++) {
					if (this.calenderClinics[i].name == clinic.name) {
						this.calenderClinics.splice(i, 1);
						for (let j = 0; j < this.clinics.length; j++) {
							if (this.clinics[j].name == clinic.name) {
								this.clinics[j].isChecked = false;
							}
						}
					}
				}
			}
			if (this.calenderClinics.length == 0) {
				this.calenderClinics.push({ name: '', id: 0 });
			}
			const scheduler = this.storageData.getSchedulerInfo();
			scheduler.supervisor_assign_speciality_all_clinics = JSON.stringify(this.calenderClinics);
			this.storageData.setSchedulerInfo(scheduler);
		} else {
			let check = false;
			for (let i = 0; i < this.calenderSpeciality.length; i++) {
				if (clinic['id'] == this.calenderSpeciality[i]['id']) {
					check = true;
					break;
				}
			}
			if (!check) {
				if (this.calenderSpeciality[0].id == 0) {
					this.calenderSpeciality = [];
				}
				clinic['isChecked'] = true;
				this.calenderSpeciality.push(clinic);
			} else {
				for (let i = 0; i < this.calenderSpeciality.length; i++) {
					if (this.calenderSpeciality[i].name == clinic.name) {
						this.calenderSpeciality.splice(i, 1);
						for (let j = 0; j < this.clinics.length; j++) {
							if (this.clinics[j].name == clinic.name) {
								this.clinics[j].isChecked = false;
							}
						}
						// break
					}
				}
			}
			if (this.calenderSpeciality.length == 0) {
				this.calenderSpeciality.push({ name: '', id: 0 });
			}
			const scheduler = this.storageData.getSchedulerInfo();
			scheduler.supervisor_assign_speciality_all_speciality = JSON.stringify(
				this.calenderSpeciality,
			);
			this.storageData.setSchedulerInfo(scheduler);
		}
		this.destroySpecialty$.next(true)
		this.currentpageSpecialty=1;
		this.speciality=[]
		this.getSpeciality(this.currentpageSpecialty);
		this.getAssignments(this.calenderSpeciality, this.calenderClinics, this.viewDate);
	}
	public selectSpeciality(speciality) {
		debugger;
		if (this.isSwapped) {
			let check = false;
			for (let i = 0; i < this.calenderSpeciality.length; i++) {
				if (speciality['id'] == this.calenderSpeciality[i]['id']) {
					check = true;
					break;
				}
			}
			if (!check) {
				if (this.calenderSpeciality.length != 0 && this.calenderSpeciality[0].id == 0) {
					this.calenderSpeciality = [];
				}
				speciality['isChecked'] = true;
				this.calenderSpeciality.push(speciality);
			} else {
				for (let i = 0; i < this.calenderSpeciality.length; i++) {
					if (this.calenderSpeciality[i].name == speciality.name) {
						this.calenderSpeciality.splice(i, 1);
						for (let j = 0; j < this.speciality.length; j++) {
							if (this.speciality[j].id == speciality.id) {
								this.speciality[j].isChecked = false;
							}
						}
						break;
					}
				}
			}
			if (this.calenderSpeciality.length == 0) {
				this.calenderSpeciality.push({ name: '', id: 0 });
			}
			const scheduler = this.storageData.getSchedulerInfo();
			scheduler.supervisor_assign_speciality_all_speciality = JSON.stringify(
				this.calenderSpeciality,
			);
			this.storageData.setSchedulerInfo(scheduler);
		} 
		else {
			let check = false;
			for (let i = 0; i < this.calenderClinics.length; i++) {
				if (speciality['id'] == this.calenderClinics[i]['id']) {
					check = true;
					break;
				}
			}
			if (!check) {
				if (this.calenderClinics[0].id == 0) {
					this.calenderClinics = [];
				}
				speciality['isChecked'] = true;
				this.calenderClinics.push(speciality);
			} else {
				for (let i = 0; i < this.calenderClinics.length; i++) {
					if (this.calenderClinics[i].name == speciality.name) {
						this.calenderClinics.splice(i, 1);
						for (let j = 0; j < this.speciality.length; j++) {
							if (this.speciality[j].id == speciality.id) {
								this.speciality[j].isChecked = false;
							}
						}
						break;
					}
				}
			}
			if (this.calenderClinics.length == 0) {
				this.calenderClinics.push({ name: '', id: 0 });
			}
			const scheduler = this.storageData.getSchedulerInfo();
			scheduler.supervisor_assign_speciality_all_clinics = JSON.stringify(this.calenderClinics);
			this.storageData.setSchedulerInfo(scheduler);
		}
		this.destroyClinic$.next(true);
		this.currentpagePracticeLocation = 1;
		this.clinics = [];
		this.getClinics(this.currentpagePracticeLocation);
		this.getAssignments(this.calenderSpeciality, this.calenderClinics, this.viewDate);
	}
	public removeTopEntry(id) {
		if (this.isSwapped) {
			for (let i = 0; i < this.calenderClinics.length; i++) {
				if (this.calenderClinics[i].id == id) {
					this.calenderClinics.splice(i, 1);
					if (this.calenderClinics.length == 0) {
						this.calenderClinics.push({ name: '', id: 0 });
					}
					break;
				}
			}
			for (let i = 0; i < this.clinics.length; i++) {
				if (id == this.clinics[i].id) {
					this.clinics[i].isChecked = false;
					break
				}
			}
			this.destroySpecialty$.next(true)
			this.currentpageSpecialty=1;
			this.speciality=[]
			this.getSpeciality(this.currentpageSpecialty);
		} else {
			for (let i = 0; i < this.calenderClinics.length; i++) {
				if (this.calenderClinics[i].id == id) {
					this.calenderClinics.splice(i, 1);
					if (this.calenderClinics.length == 0) {
						this.calenderClinics.push({ name: '', id: 0 });
					}
					break;
				}
			}
			for (let i = 0; i < this.speciality.length; i++) {
				if (this.speciality[i].id == id) {
					this.speciality[i].isChecked = false;
					break
				}
				
			}
			this.destroyClinic$.next(true);
			this.currentpagePracticeLocation=1;
			this.clinics=[];
			this.getClinics(this.currentpagePracticeLocation);
		}
		this.subject.refreshClinic(this.clinics);
		const scheduler = this.storageData.getSchedulerInfo();
		scheduler.supervisor_assign_speciality_all_clinics = JSON.stringify(this.calenderClinics);
		this.storageData.setSchedulerInfo(scheduler);
	}
	public onDateChanged(event: any) {
		let currentDate = event.date.year + '-' + event.date.month + '-' + event.date.day;
	//	let tempDate = new Date(currentDate);
		let tempDate = event.jsdate;
		this.viewDate = tempDate;
		this.viewDate = this.viewDate;
		this.datePick = event.jsdate;
		this.getAssignments(this.calenderSpeciality, this.calenderClinics, event.jsdate);
	}

	setDate(value) {

		this.viewDate = new Date(value.toDate());
		this.datePick = this.viewDate;
		this.getAssignments(this.calenderSpeciality, this.calenderClinics, this.viewDate);

	  }

	
	public removeSideEntry(msg) {
		if (this.isSwapped) {
			for (let i = 0; i < this.speciality.length; i++) {
				if (this.speciality[i].id == msg.id) {
					this.speciality[i].isChecked = false;
					break;
				}
			}
			for (let i = 0; i < this.calenderSpeciality.length; i++) {
				if (this.calenderSpeciality[i].id == msg.id) {
					this.calenderSpeciality.splice(i, 1);
					break;
				}
			}
			if (this.calenderSpeciality.length == 0) {
				this.calenderSpeciality.push({ name: '', id: 0 });
			}
			this.destroyClinic$.next(true);
			this.currentpagePracticeLocation=1;
			this.clinics=[];
			this.getClinics(this.currentpagePracticeLocation);
		} else {
			for (let i = 0; i < this.clinics.length; i++) {
				if (this.clinics[i].id == msg.id) {
					this.clinics[i].isChecked = false;
					break;
				}
			}

			for (let i = 0; i < this.calenderSpeciality.length; i++) {
				if (this.calenderSpeciality[i].id == msg.id) {
					this.calenderSpeciality.splice(i, 1);
					break;
				}
			}
			if (this.calenderSpeciality.length == 0) {
				this.calenderSpeciality.push({ name: '', id: 0 });
			}
			this.destroySpecialty$.next(true)
			this.currentpageSpecialty=1;
			this.speciality=[]

			this.getSpeciality(this.currentpageSpecialty);
		}
		this.subject.refreshClinic(this.clinics);
		const scheduler = this.storageData.getSchedulerInfo();
		scheduler.supervisor_assign_speciality_all_speciality = JSON.stringify(this.calenderSpeciality);
		this.storageData.setSchedulerInfo(scheduler);
	}
	public getChangeDateNext(e) {
		let currentDate = e.date.year + '-' + e.date.month + '-' + e.date.day;
		let tempDate = new Date(currentDate);
		this.viewDate = tempDate;
		this.datePick = e.jsdate;
		if (this.state) {
			let newDate = new Date(e);
			this.model = {
				date: {
					year: newDate.getFullYear(),
					month: newDate.getMonth() + 2,
					day: newDate.getDate(),
				},
			};
		} else {
			let newDate = new Date(e);
			this.model = {
				date: {
					year: newDate.getFullYear(),
					month: newDate.getMonth() + 1,
					day: newDate.getDate(),
				},
			};
		}
		this.getAssignments(this.calenderSpeciality, this.calenderClinics, this.viewDate);
	}
	public convert12(str) {
		let result: string = '';
		let h1: any = str[0];
		let h2: any = str[1];
		let hh = parseInt(h1) * 10 + parseInt(h2);
		let Meridien: string;
		if (hh < 12) {
			Meridien = 'AM';
		} else {
			Meridien = 'PM';
		}
		hh %= 12;
		// Handle 00 and 12 case separately
		if (hh == 0) {
			result = '12';
			// Printing minutes and seconds
			for (let i = 2; i < str.length; ++i) {
				result = result + str[i];
			}
		} else {
			result = JSON.stringify(hh);
			// Printing minutes and seconds
			for (let i = 2; i < str.length; ++i) {
				result = result + str[i];
			}
		}
		result = result + ' ' + Meridien;
		return result;
	}
	public getAssignments(specs, clinics, viewDate) {
		debugger;
		let specId = [],
			clinicId = [];
		if (this.isSwapped) {
			specs.filter((element) => {
				specId.push(element.id);
			});
			clinics.filter((element) => {
				clinicId.push(element.id);
			});
		} else {
			clinics.filter((element) => {
				specId.push(element.id);
			});
			specs.filter((element) => {
				clinicId.push(element.id);
			});
		}
		if (this.view == 'week') {
		}
		let date = new Date(JSON.parse(JSON.stringify(viewDate)));
		let lastMonth = new Date(date.setMonth(date.getMonth() - 1));
		let nextMonth = new Date(date.setMonth(date.getMonth() + 3));
		let tempDate = lastMonth.getFullYear() + '-' + ('0' + (lastMonth.getMonth() + 1)).slice(-2);
		let startDate = tempDate + '-01';
		let tempEndDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 0);
		let endDate =
			tempEndDate.getFullYear() +
			'-' +
			('0' + (tempEndDate.getMonth() + 1)).slice(-2) +
			'-' +
			('0' + tempEndDate.getDate()).slice(-2);
		let st = startDateToGetAssignments(this.storageData, new Date(startDate));
		let ed = endDateToGetAssignments(this.storageData, new Date(endDate));
		ed.setMinutes(59);
		ed.setSeconds(59);
		if (specId[0] !== 0 && clinicId[0] !== 0) {
			this.requestService
				.sendRequest(
					AssignSpecialityUrlsEnum.Speciality_Assignments,
					'POST',
					REQUEST_SERVERS.schedulerApiUrl1,
					{
						speciality_ids: specId,
						facility_location_ids: clinicId,
						start_date: st,
						end_date: ed,
					},
				)
				.subscribe(
					(response: HttpSuccessResponse) => {
						let specAssign = response.result.data?response.result.data:[];
						for (let i = 0; i < specAssign.length; i++) {
							specAssign[i].dateList.forEach(specialityAssign => {
								specialityAssign.start_date=convertDateTimeForRetrieving(
									this.storageData,
									new Date(specialityAssign.start_date),
								);
								let tempDateForStart=specialityAssign.start_date;
								let startTime =('0' + tempDateForStart.getHours()).slice(-2) +':' +('0' + tempDateForStart.getMinutes()).slice(-2);
								specialityAssign['start'] = tempDateForStart;
								startTime = this.convert12(startTime);
								specialityAssign['startTime'] = startTime;
								specialityAssign.end_date=convertDateTimeForRetrieving(
									this.storageData,
									new Date(specialityAssign.end_date),
								);
								let tempDateForEnd=specialityAssign.end_date;
								let endTime =
								('0' + tempDateForEnd.getHours()).slice(-2) +
								':' +
								('0' + tempDateForEnd.getMinutes()).slice(-2);
								specialityAssign['end'] = tempDateForEnd;
								endTime = this.convert12(endTime);
								specialityAssign['endTime'] = endTime;

							});
						
						}
						this.specAssign = specAssign;
					},
					(error) => {
						this.specAssign = [];
						this.subject.refresh(this.specAssign);
					},
				);
		}
	}
	public getClinics(page?) {
		this.allFacilitySupervisorClinicIds = this.storageData.getFacilityLocations();
		let speciality_ids=[]
		if(this.isSwapped)
		{
			this.calenderSpeciality.filter(speciality=>{
				if(speciality.id>0)
				{
					speciality_ids.push(speciality.id)
				}
			})
		}
		else
		{
			this.calenderClinics.filter(speciality=>{
				if(speciality.id>0)
				{
					speciality_ids.push(speciality.id)
				}
			})
		}
		
		
		this.requestService
			.sendRequest(
				AssignSpecialityUrlsEnum.getUserInfobyFacility,
				'POST',
				REQUEST_SERVERS.schedulerApiUrl1,
				{ facility_location_ids: this.allFacilitySupervisorClinicIds ,
				// per_page: Pagination.per_page,
				per_page: Pagination.per_page_speciality_assignment,
				page:page,
				pagination:true,
				speciality_ids:speciality_ids,
				is_provider_calendar:true
				}
			).pipe(
				takeUntil(this.destroyClinic$)
			)
			.subscribe(
				(response: HttpSuccessResponse) => {
					let localClinics;
					if (this.isSwapped) {
						localClinics = this.calenderClinics;
					} else {
						localClinics = this.calenderSpeciality;
					}

					for (let i = 0; i < response.result.data.docs.length; i++) {
						response.result.data.docs[i]['day_list'] = JSON.parse(
							response.result.data.docs[i]['day_list'],
						);
						response.result.data.docs[i]['isChecked'] = false;
						for (let j = 0; j < localClinics.length; j++) {
							if (localClinics[j]['isChecked'] != undefined) {
								if (localClinics[j]['id'] == response.result.data.docs[i]['id']) {
									response.result.data.docs[i]['isChecked'] = true;
									localClinics[j] = response.result.data.docs[i];
									localClinics[j]['isLocalAvailable'] = true;
								}
							}
						}
					}
					console.log(localClinics);
					// for (let x = 0; x < localClinics.length; x++) {
					// 	if (localClinics[x]['isLocalAvailable'] == undefined) {
					// 		localClinics.splice(x, 1);
					// 		x--;
					// 	}
					// }
					if (localClinics.length == 0) {
						localClinics.push({
							name: '',
							id: 0,
						});
					}
					console.log(localClinics);
					if (this.isSwapped) {
						this.calenderClinics = localClinics;
					} else {
						this.calenderSpeciality = localClinics;
					}
					// this.clinics=response.result.data.docs;
					if(response.result.data.docs.length>0)
					{
						this.clinics=[...this.clinics,...response.result.data.docs];
						if(response.result.data.pages>this.currentpagePracticeLocation)
						{
							this.currentpagePracticeLocation=this.currentpagePracticeLocation+1
							this.getClinics(this.currentpagePracticeLocation)
						}
						
					}
					this.subject.refreshClinic(this.clinics);
					this.loading = false;
				},
				(error) => {
					this.loading = false;
				},
			);
	}
	public getSpeciality(page?) {
		let facility_location_ids=[]
		if(this.isSwapped)
		{
			this.calenderClinics.filter(practicelocation=>{
				if(practicelocation.id>0)
				{
					facility_location_ids.push(practicelocation.id)
				}
				
			})
		}
		else
		{
			this.calenderSpeciality.filter(practicelocation=>{
				if(practicelocation.id>0)
				{
					facility_location_ids.push(practicelocation.id)
				}
				
			})
		}
		

		const params = { 
			// per_page:Pagination.per_page,
			per_page: Pagination.per_page_speciality_assignment, 
			page: page ,pagination:true,
			facility_location_ids:facility_location_ids.length>0?facility_location_ids:this.storageData.getFacilityLocations(),
			doctor_ids:(!this.storageData.isSuperAdmin() && this.storageData.isDoctor())?[this.storageData.getUserId()]:[], 
			is_provider_calendar:true};
		this.requestService
			.sendRequest(
				AssignSpecialityUrlsEnum.GetUserInfoBySpecialities,
				'post',
				REQUEST_SERVERS.schedulerApiUrl1,
				params,
			).pipe(
				takeUntil(this.destroySpecialty$)
			)
			.subscribe(
				(response: HttpSuccessResponse) => {
					// let data = response.result.data.docs;
					let localSpeciality;
					if (this.isSwapped) {
						localSpeciality = this.calenderSpeciality;
					} else {
						localSpeciality = this.calenderClinics;
					}
					// for (let i = 0; i < data.length; i++) {
						for (let i = 0; i < response.result.data.docs.length; i++) {
						// this.speciality.push(response.result.data.docs[i]);
						// this.speciality[i]['color'] = '#' + response.result.data.docs[i]['color'];
						// this.speciality[i]['color'] =  response.result.data.docs[i]['color'];
						// this.speciality[i]['isChecked'] = false;
						response.result.data.docs[i]['isChecked'] = false;
						for (let j = 0; j < localSpeciality.length; j++) {
							if (localSpeciality[j]['isChecked'] != undefined) {
								// if (localSpeciality[j]['id'] == this.speciality[i]['id']) {
								// 	this.speciality[i]['isChecked'] = true;
								if (localSpeciality[j]['id'] == response.result.data.docs[i]['id']) {
										response.result.data.docs[i]['isChecked'] = true;
									localSpeciality[j] = response.result.data.docs[i]
								}
							}
						}
					}
					// this.speciality=response.result.data.docs;
					if(response.result.data.docs.length>0)
					{
						this.speciality=[...this.speciality,...response.result.data.docs];
						if(response.result.data.pages>this.currentpageSpecialty)
						{
							this.currentpageSpecialty=this.currentpageSpecialty+1
							this.getSpeciality(this.currentpageSpecialty)
						}
						
					}
					this.loading = false;
				},
				(error) => {},
			);
	}
}
