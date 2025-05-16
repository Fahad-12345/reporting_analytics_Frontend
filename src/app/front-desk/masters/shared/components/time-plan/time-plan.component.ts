import { EventEmitter, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, Input } from '@angular/core';
import {
	FormArray,
	FormGroup,
	FormBuilder,
	FormControl,
	Form,
	Validators,
	AbstractControl,
	ValidatorFn,
	ValidationErrors
} from '@angular/forms';
import { DAYS } from '@appDir/front-desk/masters/shared/utils/days.enum';
import { Subscription } from 'rxjs';
import { WeeklyTimingForm, TimeRangeInterface } from '@appDir/front-desk/masters/practice/practice/utils/practice.class';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { getObjectChildValue, getTimeZone, isSameLoginUser } from '@appDir/shared/utils/utils.helpers';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ReplicateToAllFormComponent } from '../replicate-to-all/replicate-to-all.component';
import { UserInfoChangeService } from '@appDir/front-desk/masters/master-users/users/services/user-info-change.service';

@Component({
	selector: 'app-time-plan',
	templateUrl: './time-plan.component.html',
	styleUrls: ['./time-plan.component.scss']
})
export class TimePlanComponent implements OnInit {
	hasChange: boolean = false;
	@Input() childValues: WeeklyTimingForm;
	@Input() update: boolean;
	@Input() disableForm: boolean = false;
	@Input() showReplicateAllButton:boolean=false;
	@Output() openReplicatePopUpBtn=new EventEmitter<any>();
	public weekday = DAYS;
	public form: FormGroup;
	public selectedDays: Set<any> = new Set();
	public subscription: Subscription[] = [];
	public savedTimeZone: string;
	public bountryTimeZone: string;
	modalRef: NgbModalRef;
	constructor(
		private fb: FormBuilder,
		private activatedRoute: ActivatedRoute,
		private storageData: StorageData,
		private modalService: NgbModal,private userInfoService:UserInfoChangeService,) {
			if(this.hasChange){
				this.userInfoService.sendMessage('15');
			}
	}


	/**
	 * Returns timing formArray.
	 * @return    {FormArray}    Timing FormArray
	 */
	private getTimingForm = (): FormArray => {
		return this.form.controls['timing']['controls'];
	};

	/**
	 * Gets the selected day and toggles the value from selectedDays set.
	 * @return    {FormArray}    Timing FormArray
	 */

	public selectDays(day) {
		let timingForm = this.getTimingForm();
		let checked = false;
		if (this.selectedDays.has(day.id)) {
			this.selectedDays.delete(day.id);
			this.userInfoService.sendMessage('6')

		} else {
			this.selectedDays.add(day.id);
			checked = true;
			this.userInfoService.sendMessage('6')
		};

		for (let index in timingForm) {
			if (timingForm[index]['controls']['day_id'].value == day.id) {
				timingForm[index].patchValue({ checked: checked });
				if (checked) {
					timingForm[index].setValidators(this.invalidTiming('start_time', 'end_time'));
					timingForm[index].setValidators(this.InvalidBoundries())

				} else {
					let form: FormGroup = timingForm[index]
					form.clearValidators()
					form.setErrors(null)

					this.childValues.isValid = this.form.valid
				}
			}
		}
	}

	/**
	 * Enables or disables replicate field according to input values in start_time and end_time
	 * @param    {FormControl} form Selected form from listing
	 * @return    void
	 */
	formChange(form: FormControl) {
		(form.get('start_time').value && form.get('end_time').value) ? form.get('replicate').enable() : form.get('replicate').disable();
		this.userInfoService.sendMessage('2')
	}

	showTimeZoneComment() {
		let timeZone = getTimeZone(this.storageData.getUserTimeZone().timeZone);
		let addComment = '';
		addComment = (this.childValues.timeRange) ? `This time scheduler is according to '${this.bountryTimeZone}'` : addComment;
		addComment = (!this.childValues.timeRange && this.update) ? `You are viewing this schedule according to "${this.savedTimeZone}" timezone. On update your schedule will be according to '${timeZone}' timezone.` : addComment;
		addComment = (!this.childValues.timeRange && !this.update) ? `You are saving this time according to "${timeZone}" timezone` : addComment;
		return addComment;
	}
	/**
	 * Returns a newly created form array for timing
	 * @param    void
	 * @return    {FormArray}    New form array for timing
	 */
	private createTimingsArray = (): FormArray => {
		let formArray:any = this.fb.array([]);
		this.weekday.forEach((day) => {
			// if (this.hasDays(day.id))
			let form: FormGroup = this.createTiming(day.id, day.name);
			if (day && !this.hasDays(day.id)) {
				form.clearValidators()
			}
			formArray.push(form);
		});

		return formArray;
	};

	private invalidTiming(start_time: string, end_time: string) {
		return (group: FormGroup): { [key: string]: any } => {
			let start_time_controls = group.controls[start_time];
			let end_time_controls = group.controls[end_time];

			if (start_time_controls.value === end_time_controls.value) {
				return {
					invalidTiming: true
				};
			}
		};
	}

	hasDays(day_id) {
		if (this.childValues&&this.childValues.timeRange) {
			return this.childValues.timeRange.find(day => (day.day_id === day_id && day.checked));
		}
		return true;
	}
	private validateMinBoundries: ValidatorFn = (group: FormGroup) => {
		const min_time = getObjectChildValue(group.get('min_time'), null, ['value']);
		const max_time = getObjectChildValue(group.get('max_time'), null, ['value']);
		const start = group.get('start_time').value;
		const end = group.get('end_time').value;
		if (min_time && max_time) {
			return this.convertTimeToDate(start) < this.convertTimeToDate(min_time) || this.convertTimeToDate(end) > this.convertTimeToDate(max_time)
				? { invalidMinBoundary: true } : null;
		} else
			return null

	};

	matchRelation(selectedStartTime, selectedEndTime, locationStartTime, locationEndTime) {
		if (locationStartTime > locationEndTime) {
			return selectedStartTime > selectedEndTime ? true : false
		} else {
			return selectedEndTime > selectedStartTime ? true : false
		}
	}
	private InvalidBoundries() {

		return (group: FormGroup): { [key: string]: any } => {
			// if (!this.childValues.timeRange) {
			// 	return null;
			// }
			if (!this.childValues.timeRange) {
				return null;
			}
			let day = this.timeRange.find((day) => {
				return day.day_id === group.controls['day_id'].value && day.checked
			});
			let start_time_controls = group.controls['start_time'];
			let end_time_controls = group.controls['end_time'];
			if (!day) {
				return null;
			}


			let start_time = this.convertTimeToDate(start_time_controls.value)
			let location_start_time = this.convertTimeToDate(day.start_time)
			let end_time = this.convertTimeToDate(end_time_controls.value)
			let location_end_time = this.convertTimeToDate(day.end_time)

			if (location_start_time > location_end_time) {
				location_end_time.setDate(location_end_time.getDate() + 1)
				if (start_time > end_time) {
					end_time.setDate(end_time.getDate() + 1)
				}
			}


			var match_relation = this.matchRelation(start_time, end_time, location_start_time, location_end_time)
			if ((start_time < location_start_time || start_time > location_end_time) || (end_time > location_end_time || end_time < location_start_time)) {
				return {
					InvalidBoundries: true
				};
			}
		};

	}

	/**
	 * Returns a newly created form group for timing
	 * @param    void
	 * @return    {FormGroup}    New form group for timing
	 */
	private createTiming = (day_id: number, name: string): FormGroup => {
		debugger;
		let group: any = {
			checked: [false],
			replicate: [{ value: '', disabled: false }],
			day_id: [day_id],
			name: [name],
			start_time: ['08:00', [Validators.required]],
			end_time: ['18:00']
		};
		let form: FormGroup;
		if (this.childValues.timeRange) {
			let day = this.childValues.timeRange.find((day) => {
				return day.day_id === day_id
			});
			if (day) {
				group.min_time = [day.start_time];
				group.max_time = [day.end_time];
			}


		}
		form = this.fb.group(group);
		this.subscription.push(
			form.controls['checked'].valueChanges.subscribe((value) => {
				if (value) {
					form.controls['start_time'].setValidators(Validators.required);
					form.controls['end_time'].setValidators(Validators.required);

					form.setValidators(this.invalidTiming('start_time', 'end_time'));
					form.setValidators(this.InvalidBoundries())
				} else {
					form.controls['start_time'].clearValidators();
					form.controls['end_time'].clearValidators();
				}
				form.controls['start_time'].updateValueAndValidity();
				form.controls['end_time'].updateValueAndValidity();

			})
		);
		return form;
	}

	/**
	 * Replicates times in other days according to selection
	 * @param    {string} value To replicate all, below selection or above selection
	 * @param    {number} index Index of the selected day
	 * @return    {FormGroup}    New form group for timing
	 */
	replicate = (value: string, index: number) => {
		let init = 0, increment = false, length = this.form.get('timing')['controls'].length;
		switch (value) {
			case 'all':
				increment = true;
				break;
			case 'below':
				init = index;
				increment = true;
				break;
			case 'above':
				init = index;
				increment = false;
				break;
		}
		for (let i = init; (increment) ? (i < length) : (i >= 0); (increment) ? i++ : i--) {

			(this.form.get('timing')['controls'][i].value.checked) ? (this.form.get('timing')['controls'][i]
				.patchValue({
					start_time: this.form.get('timing')['controls'][index].value.start_time,
					end_time: this.form.get('timing')['controls'][index].value.end_time
				})) : null;
			this.form.get('timing')['controls'][i].get('replicate').enable()
		}
		this.form.get('timing')['controls'][index].patchValue({ replicate: '' });
		this.userInfoService.sendMessage('3')
	};
	isFirst(day_id) {
		// let formdata = this.form.getRawValue();
		// formdata.timings.findIndex(value=> value.day_id == day_id)
	}

	isLast(day_id) {

	}
	timeRange: TimeRangeInterface[] = []
	ngOnChanges(formChange) {
		debugger;
		this.form = this.fb.group({
			timing: this.createTimingsArray()
		});
		this.disableForm ? this.form.disable() : null
		this.savedTimeZone = getObjectChildValue(this.childValues, '', ['selectedTimings', '0', 'time_zone_string']);
		if (this.childValues.timeRange) {
			let time_range = this.childValues.timeRange.find((time) => {
				return (time.time_zone_string) ? true : false;
			});
			this.bountryTimeZone = getObjectChildValue(time_range, '', ['time_zone_string']);
		}
		// this.selectedDays.add(1);
		this.childValues.selectedTimings.map(timings => {
			timings.start_time = timings.start_time;
			timings.end_time = timings.end_time;
			timings.checked = true;
			timings.replicate = "";
		})

		if (getObjectChildValue(this.childValues, false, ['selectedTimings'])) {

			this.selectedDays.clear();
			this.form.controls['timing']['controls'].forEach((form: FormGroup) => {
				if (this.childValues.selectedTimings.length) {
					this.childValues.selectedTimings.forEach((timing) => {
						this.selectedDays.add(timing.day_id);
						if (form.controls['day_id'].value == timing.day_id) {
							let start_time = timing.start_time
							let end_time = timing.end_time

							form.patchValue({ ...timing, ...{ start_time, end_time } })//.setValue(true);
							// this.childValues.selectedTimings.push(value.value);
						}
					});
				} else {
					form = this.createTiming(form.controls["day_id"].value, form.controls["name"].value);
				}
				if (this.childValues.timeRange) {
					this.timeRange = this.childValues.timeRange.map(timing => {
						let start_time = timing.start_time
						let end_time = timing.end_time
						var obj = { ...timing, ...{ start_time, end_time } }
						return obj;
					})
				}
			})

			// this.childValues.selectedTimings.forEach((timing) => {
			// 	this.selectedDays.add(timing.day_id);
			// 	this.form.controls['timing']['controls'].forEach(value => {
			// 		if (value.get('day_id').value == timing.day_id) {
			// 			value.patchValue(timing)//.setValue(true);
			// 			// this.childValues.selectedTimings.push(value.value);
			// 		}

			// 	})
			// });
		}
		this.childValues.isValid = this.form.valid
		this.subscription.push(
			this.form.controls['timing'].valueChanges.subscribe((timingValues) => {
				if (getObjectChildValue(this.childValues, false, ['selectedTimings'])) {
					this.childValues.selectedTimings.splice(0, this.childValues.selectedTimings.length);
					timingValues.forEach((timing) => {
						(timing.checked) ? this.childValues.selectedTimings.push(timing) : null;
					});

					this.childValues.isValid = this.form.valid;
				}
			})
		);
		this.isSameLoginUser(this.form);
		
	}
	isSameLoginUser(formName: FormGroup) {
		let id = this.activatedRoute.parent.snapshot.params.id;
		if (isSameLoginUser(id)) {
			formName.disable();
		}
	}
	ngOnInit() {
		this.checkIsFormChanged()
	}

	newValidation(control: AbstractControl) {
		if (control.value) {
			return null;
		} else {
			return { 'newerr': true };
		}
	}

	validateOpeningDate(date: string): ValidatorFn {


		return (control: AbstractControl): ValidationErrors => {
			let _date = this.convertTimeToDate(date);
			let value = this.convertTimeToDate(control.value);
			if (_date > value) {
				return { 'closingDateError': true };
			}
			return null;
		};
	}

	validateClosingDate(date): { [key: string]: any } | null {


		return (c: AbstractControl): { [key: string]: boolean } | null => {
			let _date = this.convertTimeToDate(date);
			let value = this.convertTimeToDate(c.value);
			if (_date > value) {
				return { 'closingDateError': true };
			}
			return null;
		};
	}

	convertTimeToDate(str: string) {
		if (!str) {
			return null;
		}
		let hour = parseInt(str.split(':')[0]);
		let min = parseInt(str.split(':')[1]);
		let date = new Date();
		date.setHours(hour);
		date.setMinutes(min);
		return date;
	}

	openModel(row?, rowIndex?) {
		debugger;
		// this.title = 'Add';
		// this.buttonTitle = 'Save & Continue';
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc ',
		};
		this.openReplicatePopUpBtn.next({data:{id:1,name:'test'}});

		// this.modalRef = this.modalService.open(ReplicateToAllFormComponent, ngbModalOptions);
		// this.modalRef.componentInstance.title="Replicate"
		// // this.modalRef.componentInstance.subtitle=""
		// this.modalRef.result.then(status=>{
		// 	debugger;
		// })
	}
	// convertTimetoUserTIme(a) {
	// 	return convertUTCTimeToUserTimeZone(this.storageData, a)
	// }

	checkIsFormChanged(){
		debugger;
		const initialvalue = this.form.value;
		this.form.valueChanges.subscribe(val => {
			this.hasChange = Object.keys(initialvalue).some(key => this.form.value[key] != initialvalue[key])
			if(this.hasChange){
				this.userInfoService.sendMessage('20');
			}
			else{
				this.userInfoService.sendMessage('22');
			}
		});
	}
}

