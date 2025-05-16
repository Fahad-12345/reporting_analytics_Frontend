import {
	Component,
	EventEmitter,
	Input,
	OnInit,
	Output,
} from '@angular/core';
import {
	FormControl,
	FormGroup,
} from '@angular/forms';
import { EnumApiPath } from '@appDir/front-desk/billing/Models/searchedKeys-modal';
import { isEmptyObject, makeDeepCopyArray } from '@appDir/shared/utils/utils.helpers';
import { Subject } from 'rxjs';
@Component({
	selector: 'app-table-filter',
	templateUrl: './table-filter.component.html',
	styleUrls: ['./table-filter.component.scss'],
})
export class TableFilterComponent implements OnInit {
	searchCaseType: FormGroup;
	public specSelectedMultiple;
	public filterClinicData = [
		{ address: '', area: '', color: '',updated_at:'',created_at:'',created_by_ids:'',updated_by_ids:'', daysList: [], id: 0, name: 'Location' },
	];
	
	@Input() public filtersNeeded: string;
	@Input() fascilityDataOption;
	@Input() specialityDataOption;
	@Output() filterFieldEmitter: EventEmitter<FormGroup> = new EventEmitter();
	@Output() resetButtonEmitter: EventEmitter<FormGroup> = new EventEmitter();
	eventsSubject: Subject<any> = new Subject<any>();
	specialityActive = false;
	isCollapsed = false;
	EnumApiPath = EnumApiPath;
	DATEFORMAT = '_/__/____';
	min: Date= new Date('1900/01/01');
	ngOnInit() {
		this.searchCaseType = new FormGroup({
			caseNo: new FormControl(''),
			caseType: new FormControl(''),
			patientName: new FormControl(''),
			DateOfAccident: new FormControl(''),
			city: new FormControl(''),
			created_by_ids: new FormControl(''),
			created_at: new FormControl(''),
			updated_at: new FormControl(''),
			updated_by_ids: new FormControl(''),
			address: new FormControl(''),
			timeslot: new FormControl(''),
			speciality: new FormControl(''),
			overBookingNo: new FormControl(''),
		});
	}
	filterHandler() {
		this.filterFieldEmitter.emit(this.searchCaseType);
	}
	resetClicked() {
		this.searchCaseType.reset();
		this.eventsSubject.next(true);
		this.resetButtonEmitter.emit();
	}

	checkInputs(){
		if (isEmptyObject(this.searchCaseType.value)) {
			return true;
		  }
		  return false;
	}
	toggleFoucsedClass(status: boolean){

		this.specialityActive = status;
	}
	changeSelect(value, fieldName) {
		if (!value.length) {
			this.searchCaseType.controls[fieldName].setValue(null);
		}
	}

	selectionOnValueChange(e: any) {
		const values= e['formValue'];
		let label=e['label'];
		this.searchCaseType.get(label).patchValue(values,{emitEvent: false});
	}

}
