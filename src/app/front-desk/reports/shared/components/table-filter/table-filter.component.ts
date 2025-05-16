import { ReportsService } from './../../../reports.service';
import {
	Component,
	EventEmitter,
	Input,
	OnDestroy,
	OnInit,
	Output,
} from '@angular/core';
import {
	FormControl,
	FormGroup,
	Validators,
} from '@angular/forms';
import { changeDateFormat, unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { Subject, Subscription } from 'rxjs';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { isEmptyObject, removeEmptyAndNullsFormObject} from '@appDir/shared/utils/utils.helpers';
import { FormatEnum } from '@appDir/shared/services/datePipe-format.service';
import { EnumApiPath } from '@appDir/front-desk/billing/Models/searchedKeys-modal';
import { ShareAbleFilter } from '@appDir/shared/models/share-able-filter';
import { MappingFilterObject } from '@appDir/shared/filter/model/mapping-filter-object';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
@Component({
	selector: 'app-table-filter',
	templateUrl: './table-filter.component.html',
	styleUrls: ['./table-filter.component.scss'],
})
export class TableFilterComponent extends PermissionComponent implements OnInit, OnDestroy {
	searchCaseType: FormGroup;
	@Input() public filtersNeeded: string;
	@Output() filterFieldEmitter: EventEmitter<any> = new EventEmitter();
	@Output() onResetClickedEmitter: EventEmitter<any> = new EventEmitter();
	subsription: Subscription[] = [];
	isCollapsed = false;
	startDate;
	caseTypeData;
	statusList:any=[];
	selectedCaseType;
	DATEFORMAT = FormatEnum.DATE_FORMAT;
	EnumApiPath = EnumApiPath;
	requestServerpath = REQUEST_SERVERS;
	eventsSubject: Subject<any> = new Subject<any>();
	min: Date= new Date('1900/01/01');
	selectedMultipleFieldFiter: any = {
		'facility_ids':[],
		'practice_locations': [],
		'case_ids':[],
		'case_type':[],
		'created_by_ids' :[],
        'updated_by_ids' :[],
		'firm_id': []
	};
	constructor(private reportService: ReportsService, private _router: Router, private _route: ActivatedRoute,
		private location: Location) { 
		super();
	}
	ngOnInit() {
		this.searchCaseType = new FormGroup({
			id: new FormControl(''),
			case_type: new FormControl(''),
			case_ids: new FormControl(''),
			patient_name: new FormControl(''),
			practice_locations: new FormControl([]),
			patient_location: new FormControl(''),
			date_of_accident_from: new FormControl('',[
				Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
				Validators.maxLength(10),
			]),
			created_at : new FormControl('',[
				Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
				Validators.maxLength(10),
			]),
			updated_at : new FormControl('',[
				Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
				Validators.maxLength(10),
			]),
			date_of_accident_to: new FormControl('',[
				Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
				Validators.maxLength(10),
			]),
			location: new FormControl(''),
			address: new FormControl(''),
			insurance_name: new FormControl(''),
			claim_no: new FormControl(''),
			policy_no: new FormControl(''),
			firm_id: new FormControl(''),
			status_id: new FormControl(null),
			days_from: new FormControl(null),
			days_to: new FormControl(null),
			facility_ids: new FormControl([]),
			created_by_ids: new FormControl([]),
			updated_by_ids: new FormControl([])
		});

		this.subscription.push(
			this._route.queryParams.subscribe((params) => {
				this.searchCaseType.patchValue(params);
			})
		);
		// this.getCaseTypeListing({
		// 	per_page:20,
		// 	pagination:1,
		// })
		this.startDate = new FormControl(new Date());
		this.getStatuses();
	}
	getCaseTypeListing(queryParamscaseType) {
		// for plan type
		this.subsription.push(
		 this.reportService.getCaseTypes(queryParamscaseType)
			.subscribe(
			  (data: any) => {
				this.caseTypeData = data && data.result ? data.result.data : [];
				console.log(this.caseTypeData);
			  },
			  (err) => {
				// const str = parseHttpErrorResponseObject(err.error.message);
				// this.toaster.error(str);
			  },
			),
		);
	  }

	getStatuses()
	{
		this.subsription.push(
			this.reportService.getStatuses()
			   .subscribe(
				 (res: any) => {
					 debugger;
					 let data= res && res.result ? res.result.data : null;
				   this.statusList = data && data.nf2_status ? data.nf2_status : [];
				   console.log(this.statusList);
				 },
				 (err) => {
				 },
			   ),
		   );
	} 
	  CaseTypeChange($event) {
		if ($event && $event.selectedIndex){
			this.selectedCaseType = this.caseTypeData[$event.selectedIndex-1].name;
		}
	}
	filterHandler() {
		const dateOfAccidentFrom = changeDateFormat(this.searchCaseType.value.date_of_accident_from);
		this.searchCaseType.get('date_of_accident_from').setValue(dateOfAccidentFrom);
		const dateOfAccidentTo = changeDateFormat(this.searchCaseType.value.date_of_accident_to);
		this.searchCaseType.get('date_of_accident_to').setValue(dateOfAccidentTo);
        const createdat = changeDateFormat(this.searchCaseType.value.created_at);
		this.searchCaseType.get('created_at').setValue(createdat);
		const Updateat = changeDateFormat(this.searchCaseType.value.updated_at);
		this.searchCaseType.get('updated_at').setValue(Updateat);
		this.filterFieldEmitter.emit(this.searchCaseType);
	}
	onReset(param?) {
		this.searchCaseType.reset();
		this.eventsSubject.next(true);
		this.onResetClickedEmitter.emit();
		this.addUrlQueryParams({});
		this.isCollapsed = false;
	}
	/**
	 * Queryparams to make unique URL
	 * @param params
	 * @returns void
	 */
	get getOrderBy(){
		return {order_by:OrderEnum.ASC}
	}
	 addUrlQueryParams(params: any): void {
		this.location.replaceState(this._router.createUrlTree([], { queryParams: params }).toString());
	}
	checkInputs(){
		if (isEmptyObject(this.searchCaseType.value)) {
			return true;
		  }
		  return false;
	}
	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}
	selectionOnValueChange(e: any,Type?) {
		const info = new ShareAbleFilter(e);
		this.searchCaseType.patchValue(removeEmptyAndNullsFormObject(info));
		this.getChange(e.data, e.label);
		if(!e.data) {
			this.searchCaseType.controls[Type].setValue(null);
		}
	}

	getChange($event:any[], fieldName: string) {
		if($event) {
			this.selectedMultipleFieldFiter[fieldName] = $event.map(data => new MappingFilterObject(data?.id, data?.name, data?.full_Name, data?.facility_full_name ,data. data?.label_id ,data?.insurance_name, data?.employer_name,data?.created_by_name,data?.updated_by_name,));
		}
	}
}
