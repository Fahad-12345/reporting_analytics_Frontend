import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CodesUrl } from '@appDir/front-desk/masters/billing/codes/codes-url.enum';
import { Page } from '@appDir/front-desk/models/page';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { OrderEnum, ParamQuery } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { makeSingleNameFormFIrstMiddleAndLastNames, unSubAllPrevious, removeDuplicatesObject } from '@appDir/shared/utils/utils.helpers';
import { ToastrService } from 'ngx-toastr';
import { CreateBillModel } from '../../billingVisitDeskModel';
import { BillingService } from '../../service/billing.service';

@Component({
	selector: 'app-bulk-edit-icd10-codes-modal',
	templateUrl: './bulk-edit-icd10-codes-modal.component.html',
	styleUrls: ['./bulk-edit-icd10-codes-modal.component.scss'],
})
export class BulkEditICD10CodesModalComponent extends PermissionComponent  implements OnInit, OnDestroy {
	@Input() modalRef: any;
	@Input() Visit_data: any;
	@Input() adminVisit: boolean = false;
	title: string = 'Edit ICD Codes';
	lstICDcodes: any = [];
	selected_icd10_Codes: any = [];
	ButtonTitle: string = 'Update ';
	public selectedVisits: any = [];
	// startLoader: boolean = false;
	disable_btn_on_submit:boolean=false;
	icdPage:Page = new Page();
	searchValue: string;
	constructor(
		private fb: FormBuilder,
		public requestService: RequestService,
		private billingService: BillingService,
		private toastrService: ToastrService,
		private customDiallogService: CustomDiallogService,

	) {
		super()
	}

	ngOnInit() {
		console.log('Visit Data',this.Visit_data);
		
	}
	ngOnDestroy(){
		unSubAllPrevious(this.subscription);
	}

	setSelectedVal(val) {
		debugger;
		this.selectedVisits = val;
	}
	getICDcodes(value , searchType, page =1 ) {
		if(searchType === 'search'){
			this.lstICDcodes = [];
			this.icdPage.pageNumber = 1;
			this.searchValue = value; 
		}
		var paramQuery: ParamQuery = {
			filter: true,
			pagination: true,
			order: OrderEnum.ASC,
			order_by: 'name',
			code_type_id: 1,
			type: 'ICD',
			name: value,
			page: page,
			per_page: 10
		} as any;
		this.subscription.push(this.requestService
			.sendRequest(CodesUrl.CODES_SINGLE_GET, 'get', REQUEST_SERVERS.fd_api_url, paramQuery)
			.subscribe((res) => {
				let result =
					res['result']['data'] && res['result']['data'].length
						? res['result']['data'].map((x) => {
								return {
									id: x.id,
									name: makeSingleNameFormFIrstMiddleAndLastNames([x.name, x.description], '-'),
								};
						  })
						: [];
				this.lstICDcodes = [...this.lstICDcodes , ...result]; 
			}));
	}

	removeICDcodeFromList(updatedCodes) {
		debugger;
		this.selected_icd10_Codes = updatedCodes;
	}

	onScroll(e: any){
		this.icdPage.pageNumber += 1;
		this.getICDcodes(this.searchValue, 'scrollDown', this.icdPage.pageNumber)
	}

	submitForVisit(reqobj){
		this.billingService.updateMultipleVisitbills(reqobj).subscribe((res) => {
			this.startLoader = false;
			this.disable_btn_on_submit=false;
			this.toastrService.success('Successfully updated', 'Success');
			this.modalRef.close('updated');
		},err=>{
			this.disable_btn_on_submit=false;
			this.toastrService.error(err.error.message, 'Error');
		});
	}

	updateVisitDeskapiCallForICDChange(value) {
	this.billingService.updateMultipleVisitbills(value).subscribe((response) => {
		this.startLoader = false;
				this.disable_btn_on_submit=false;
				this.toastrService.success('Successfully updated', 'Success');
				this.modalRef.close('updated');
	},err=>{
		this.disable_btn_on_submit=false;
		this.startLoader = false;
		this.toastrService.error(err.error.message, 'Error');
		})
}

	submit() {
		debugger;
		if (this.selected_icd10_Codes.length > 0 && this.selectedVisits.length > 0) {
			let icd_codes_ids = this.selected_icd10_Codes.map((icd_codes) => {
				return icd_codes.id;
			});
			let visit_ids = this.selectedVisits.map((visit) => {
				return visit.visit_session_id;
			});
			let reqobj = {
				visit_ids: visit_ids,
				icd_codes: icd_codes_ids,
			};
			this.startLoader = true;
			this.disable_btn_on_submit=true;
			this.billingService.updateMultipleVisitbills(reqobj).subscribe((response) => {
				if (response['status'] == true) {
					if(response['flag']){
						this.startLoader = false;
						this.customDiallogService.confirm('Are you sure?',response['message'],'Yes','No')
						.then((confirmed) => {
							let data = reqobj;
							this.startLoader = true;
							if (confirmed){
								data['warning'] = 1;
								this.updateVisitDeskapiCallForICDChange(data);
							}else if(confirmed === false){
								data['warning'] = 0;
								this.updateVisitDeskapiCallForICDChange(data);
							}else{
								this.startLoader = false;
								this.disable_btn_on_submit = false;
								return;
							}
						})
						.catch();
					}else{
						this.disable_btn_on_submit=false;
						this.startLoader = false;
						this.modalRef.close('updated');

					}
				}

			},err=>{
				this.disable_btn_on_submit=false;
				// this.toastrService.error(err.error.message, 'Error');
			});
		} else {
			if (this.selected_icd10_Codes.length == 0 && this.selectedVisits.length == 0) {
				this.toastrService.error('Please select ICD-10 Codes and visits. ', 'Error');
			} else if (this.selected_icd10_Codes.length == 0) {
				this.toastrService.error('Please select ICD-10 Codes. ', 'Error');
				return;
			} else if (this.selectedVisits.length == 0) {
				this.toastrService.error('Please select visits ', 'Error');
				return;
			}
		}
	}

	closeModal() {
		this.modalRef.close();
	}

	getVisitDataIcdEvent(visitData:any[]){
		console.log("Visit Data",visitData);
		let icdCodes:any[] = [];
		if (visitData && visitData.length!=0){
			visitData.forEach(value=>{
				value.visit_session_code.forEach(session=>{
					if (session.code_type_id==1){
					icdCodes.push({
						id:session.code_id, 
						name:session.code_name,
						color:true
					});
					}
				})	
			});
		}
		this.selected_icd10_Codes = removeDuplicatesObject(icdCodes,'id');
			
	}
}
