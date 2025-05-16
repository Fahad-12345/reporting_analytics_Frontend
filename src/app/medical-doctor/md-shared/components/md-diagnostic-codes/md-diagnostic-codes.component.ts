import {
	Component,
	EventEmitter,
	Input,
	OnChanges,
	OnDestroy,
	Output,
	SimpleChanges,
} from '@angular/core';
import {
	FormArray,
	FormControl,
} from '@angular/forms';

import { ToastrService } from 'ngx-toastr';
import {
	Observable,
	of as observableOf,
	of,
	Subscription,
} from 'rxjs';
import {
	catchError,
	debounceTime,
	distinctUntilChanged,
	map,
	switchMap,
	tap,
} from 'rxjs/operators';

import { CPTUrlsEnum } from '@appDir/front-desk/masters/billing/codes/cptcodes/CPT-Urls-Enum';
import { HCPCSUrlsEnum } from '@appDir/front-desk/masters/billing/codes/hcpcscodes/HCPCS-Urls-Enum';
import { ICDUrlsEnum } from '@appDir/front-desk/masters/billing/codes/icdcodes/ICD-Urls-Enum';
// import { ICDUrlsEnum } from '@appDir/front-desk/masters/billing/codes/icdcodes/ICD-Urls-Enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { RequestService } from '@appDir/shared/services/request.service';

import { MainService } from '@appDir/shared/services/main-service';
import { unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';


// import { CPTUrlsEnum } from '@appDir/front-desk/masters/billing/codes/cptcodes/CPT-Urls-Enum';
// import { HCPCSUrlsEnum } from '@appDir/front-desk/masters/billing/codes/hcpcscodes/HCPCS-Urls-Enum';
// import { ICDUrlsEnum } from '@appDir/front-desk/masters/billing/codes/icdcodes/ICD-Urls-Enum';
// import { CPTUrlsEnum } from '@appDir/front-desk/masters/billing/codes/cptcodes/CPT-Urls-Enum';
// import { HCPCSUrlsEnum } from '@appDir/front-desk/masters/billing/codes/hcpcscodes/HCPCS-Urls-Enum';

@Component({
	selector: 'md-diagnostic-codes',
	templateUrl: './md-diagnostic-codes.component.html',
	styleUrls: ['./md-diagnostic-codes.component.scss'],
})
export class MdDiagnosticCodesComponent implements OnChanges, OnDestroy {
	@Input() codes: FormArray=new FormArray([]);
	@Input() codeType: string;
	@Input() code_type_slug: string;
	@Input() favoriteCodes;
	@Input() carryForwarded: boolean;
	@Input() allow_multiple_cpt_code: boolean = true;
	@Input() visitType: string;
	@Input() speciality_id: string;
	@Output() codesUpdated = new EventEmitter();
	@Input() max: number = 6;
	@Input() placeHolder = "Search By ICD CODE Or Description";
	@Input() showdialogbox: boolean = false;
	allowed_case_type_slugs:string[]=['auto_insurance']

	public searching: any;
	public codeModel: any[] = [];
	page: number = 1;
	searchValue: string;
	subscription: Subscription[]=[];
	dialogMessage = 'This action will overwrite the selected CPT Code over the existing one.';
	selectMultipleCPTs = true;
	/**
	 * Creates an instance of md diagnostic codes component.
	 * @param requestService
	 * @param confirmService
	 */
	constructor(
		private requestService: RequestService,
		public toaster: ToastrService,
		public mainService:MainService,
		private customDiallogService: CustomDiallogService,

	) {}

	// codeModel: anu[]
	ngOnChanges(simpleChanges: SimpleChanges) {
		if (simpleChanges.codes) {
			if(this.codes) {
				let length = this.codes.length;
				for (let i = 0; i < length; i++) {
					if (this.codes.at(i)) {
						let code = this.codes.at(i).value;
						code['full_name'] = `${code.name}${code.description ? ' - ' + code.description : ''}`;
						this.codeModel.push(code);
					}
				}
			}
		}
	}

	ngOnInit() {
		// this.getCodes('')
	}

	/**
	 * Get row class of md diagnostic codes component
	 */
	public getRowClass = (form) => {
		return {
			'datatable-row-pink': !form.dirty && this.carryForwarded && (this.visitType == 'reEvaluation' || this.visitType == 'followUp'),
		};
	};

	/**
	 * Gets code string
	 * @param code_array
	 * @returns
	 */
	public getCodeString(code_array) {
		return code_array
			.map((code) => {
				return code.name;
			})
			.sort()
			.join();
	}

	lstCode = [];
	getCodes(term, type: any) {
		if(type === 'search'){
			this.searchValue = term;
			this.page = 1;
			this.lstCode = [];
		}
		let listURL = {
			ICD: ICDUrlsEnum.ICD_list_GET,
			CPT: CPTUrlsEnum.CPT_list_GET,
			HCPCS: HCPCSUrlsEnum.HCPCS_list_GET,
		};

		let code_type_id;
		if ( (term ==null || term == "") || term.length<=2){
			return;
		}
		// if (this.codes.controls.length>5){
		// 	this.toaster.error('Maximum 6 codes are allowed', 'Error');
		// 	return;
		// }
		switch (this.codeType) {
			case 'ICD':
				code_type_id = 1;
				break;
			case 'CPT':
				code_type_id = 2;
				break;
			case 'HCPCS':
				code_type_id = 3;
				break;
		}
		let body ;
		if(code_type_id == 2) {
			body = {
				name: this.searchValue,
				type: this.codeType,
				pagination: true,
				filter: true,
				order: OrderEnum.ASC,
				code_type_id,
				per_page:10,
				page:this.page,
				speciality_id: this.speciality_id
		}
		} else {
			body = {
				name: this.searchValue,
				type: this.codeType,
				pagination: true,
				filter: true,
				order: OrderEnum.ASC,
				code_type_id,
				per_page:10,
				page:this.page,
		}
		}
		return this.subscription.push(this.requestService
			.sendRequest(listURL[this.codeType], 'get', REQUEST_SERVERS.fd_api_url, {
				// name: term,
				// type: this.codeType,
				// pagination: true,
				// filter: true,
				// order: OrderEnum.ASC,
				// code_type_id,
				...body
			})
			.pipe(
			map((result: any) => {
				result = result['result']['data'];
				result.map(
					(code) =>
						(code.full_name = `${code.name}${code.description ? ' - ' + code.description : ''}`),
				);
				return result;
			}))
			.subscribe((result) => {
				this.lstCode = [...this.lstCode, ...result];
			}));
	}

	/**
	 * Search codes of md diagnostic codes component
	 */
	public searchCodes = (text$: Observable<string>) =>
		text$.pipe(
			debounceTime(300),
			distinctUntilChanged(),
			tap(() => this.searching),
			switchMap((term) => {
				if (!term) {
					return of(null);
				}
				if (this.favoriteCodes > 0) {
					return of(this.favoriteCodes);
				}
				let listURL = {
					ICD: ICDUrlsEnum.ICD_list_GET,
					CPT: CPTUrlsEnum.CPT_list_GET,
					HCPCS: HCPCSUrlsEnum.HCPCS_list_GET,
				};

				return this.requestService
					.sendRequest(listURL[this.codeType], 'get', REQUEST_SERVERS.fd_api_url, {
						name: term,
						type: this.codeType,
						pagination: true,
						filter: true,
						order: OrderEnum.ASC,
					}).pipe(
					map((result) => {
						result = result['result']['data'];
						return result;
					}))
					.pipe(
						tap(),
						catchError(() => {
							return observableOf([]);
						}),
					);
			}),
			tap(() => (this.searching = false)),
		);

	/**
	 * Hos formatter of md diagnostic codes component
	 */
	public hosFormatter = (x: { description: string }) => x.description;

	/**
	 * Determines whether remove code on
	 * @param index
	 */
	public onRemoveCode(index) {

		this.customDiallogService.confirm('Delete Code', `Are you sure you want to delete?`,'Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
				this.codes.removeAt(index);
					this.codesUpdated.emit(this.codes);
				
			}else if(confirmed === false){
				
			}else{
				
			}
		})
		.catch();

	
	}

	/**
	 * Determines whether select code on
	 * @param $event
	 */
	public onSelectCode($event: any[]) {
		// $event.preventDefault();

		let length =  this.codes &&this.codes.length;
		for (let i = 0; i < length; i++) {
			this.codes.removeAt(0);
		}

		$event.forEach((found) => {
			let form = new FormControl(found);
			form.markAsDirty();
			this.codes.push(form);
			this.codesUpdated.emit(this.codes);
		});

		// let codes = this.codes.value;
		// const found = codes.find((code) => {
		// 	return code.id == $event.item.id;
		// });
		// if (!found) {
		// 	let form = new FormControl($event.item);
		// 	form.markAsDirty();
		// 	this.codes.push(form);
		// 	this.codesUpdated.emit(this.codes);
		// }
		// this.codeModel = null;
	}

	onScroll(e: any){
		this.page +=1;
		this.getCodes(this.searchValue, 'scroll');
	}
	ngOnDestroy(): void {
		unSubAllPrevious(this.subscription);
	}
}
