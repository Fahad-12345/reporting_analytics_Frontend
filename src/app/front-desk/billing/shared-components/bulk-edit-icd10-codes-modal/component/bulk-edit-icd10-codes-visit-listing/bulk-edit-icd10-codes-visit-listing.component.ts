import { SelectionModel } from '@angular/cdk/collections';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import {
	CreateBillModel,
} from '@appDir/front-desk/billing/billingVisitDeskModel';
import { BillingService } from '@appDir/front-desk/billing/service/billing.service';
import { FRONT_DESK_LINKS } from '@appDir/front-desk/models/leftPanel/leftPanel';
import { Page } from '@appDir/front-desk/models/page';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { ParamQuery, OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { AclService } from '@appDir/shared/services/acl.service';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { MainService } from '@appDir/shared/services/main-service';
import { NgbModal, NgbModalOptions,NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Location } from '@angular/common';
import { RequestService } from '@appDir/shared/services/request.service';
import { ToastrService } from 'ngx-toastr';
import { removeEmptyAndNullsFormObject } from '@appDir/shared/utils/utils.helpers';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';

@Component({
	selector: 'app-bulk-edit-icd10-codes-visit-listing',
	templateUrl: './bulk-edit-icd10-codes-visit-listing.component.html',
	styleUrls: ['./bulk-edit-icd10-codes-visit-listing.component.scss'],
})
export class BulkEditICD10CodesVisitListingComponent extends PermissionComponent implements OnInit {
	lstBilling: any[] = [];
	allChecked:boolean=false;
	public selection = new SelectionModel<CreateBillModel>(true, []);
	page: Page = new Page();
	public modalRef: NgbModalRef;
	@Input() adminVisit: boolean = false;
	@Output() selected=new EventEmitter();
	@Output() startLoaderEvent=new EventEmitter<boolean>();
	@Input() Visit_data:any ;
	@Output() getVisitDataIcdEvent = new EventEmitter<any[]>();
	billListingObj: any;
	routeCaseId: number;
	title: string;
	
	constructor(
		private mainService: MainService,
		private fb: FormBuilder,
		private location: Location,
		titleService: Title,
		private route: ActivatedRoute,
		router: Router,
		public aclService: AclService,
		private billingService: BillingService,
		public datePipeService: DatePipeFormatService,
		protected requestService: RequestService,
		private toastrService: ToastrService,
		private modalService: NgbModal
	) {
		super(aclService, router, route, requestService, titleService);
		titleService.setTitle(this.route.snapshot.data['title']);
	}

	ngOnInit() {
		debugger;
		this.page.pageNumber = 1;
		this.page.size = 10;
		this.mainService.setLeftPanel(FRONT_DESK_LINKS);
		this.getAllVisits();
	}

	createQueryParam(obj?): ParamQuery {
		let data = removeEmptyAndNullsFormObject(obj);
		return {
			...{
				filter: false,
				order: this.page.order ? this.page.order : OrderEnum.ASC,
				page: this.page.pageNumber,
				pagination: true,
				per_page: this.page.size,
				column: this.page.column,
			},
			...data,
		};
	}
	addUrlQueryParams(params?) {
		this.location.replaceState(this.router.createUrlTree([], { queryParams: params }).toString());
	}

	onPageChange(event) {
		debugger;
		this.page.pageNumber = event.offset + 1;
		this.deSelectOnPageChangeOrEntries();
	}
	pageSizeChange(event) {
		debugger;
		// this.startLoader = true;
		// this.selection.clear();
		this.page.size = event.target.value;
		this.page.pageNumber = 1;
		this.deSelectOnPageChangeOrEntries();
	}
	getAllVisits() {
		debugger;
		this.startLoader=true
		// this.startLoader.emit(true);
		let obj={
			case_id:this.Visit_data.case_id,
			speciality_id: this.Visit_data.speciality_id,
			visit_session_id: this.Visit_data.visit_session_id
		}
		 this.billingService.getAllVisits(obj).subscribe((data) => {
			this.startLoader=false
			// this.startLoader.emit(false);
			this.lstBilling=data['result']['data'];
			this.lstBilling.map(visit=>{
				visit['is_checked']=false;
			})
			this.getVisitDataIcdEvent.emit(this.lstBilling);
			if(this.lstBilling.length==0)
			{
				this.toastrService.error('No visit found.','Error')
			}
			this.page.totalElements = this.lstBilling.length
		},err=>{
			this.startLoader=false
		});
	}

	allSelected(e)
	{
		debugger;
		let start=this.page.size * (this.page.pageNumber-1);
		let record_page_end=start+this.page.size
		if(e.checked)
		{
			this.selection.clear()
			console.log(this.lstBilling);
			
			for(let i=start;i<record_page_end;i++)
			{
				if(this.lstBilling[i])
				{
					this.lstBilling[i].is_checked=true;
					this.selection.select(this.lstBilling[i]);					
				}
				else
				{
					this.selected.emit(this.selection.selected)
					return;
				}
				
			}
			this.selected.emit(this.selection.selected)
		}
		else
		{
			
			this.selection.clear()
			for(let i=start;i<record_page_end;i++)
			{
				if(this.lstBilling[i])
				{
					this.lstBilling[i].is_checked=false;
					this.selection.deselect(this.lstBilling[i]);
				}
				else
				{
				this.selected.emit(this.selection.selected)
					break;
				}
				
			}
			this.selected.emit(this.selection.selected)
		}
	}
	getRecordsOnSinglePage()
	{
		let checked_count=0
		let start=this.page.size * (this.page.pageNumber-1);
		let record_page_end=start+this.page.size
		
			
			for(let i=start;i<record_page_end;i++)
			{
				if(this.lstBilling[i])
				{
					checked_count+=1;

				}
				else
				{
					return checked_count;
				}
			}
			return checked_count
}
	
	filterTheCPTCode(row: any[], filterId: number) {
		return row &&row.filter((d) => d.code_type_id&&d.code_type_id === filterId);
	}
	/* Below Un_used code */
	sorting({ sorts }) {
		this.page.column = sorts[0].prop;
		this.page.order = sorts[0].dir;
	}
	onChecked(event, row) {
		debugger;
		// event ? this.selection.toggle(row) : null;
		let record_on_page=this.getRecordsOnSinglePage()
		this.selection.toggle(row)
		if(record_on_page==this.selection.selected.length)
		{
			this.allChecked=true
		}
		else
		{
			this.allChecked=false
		}
		this.selected.emit(this.selection.selected);
	}

	deSelectOnPageChangeOrEntries(){
		this.allChecked = false;
		let start=this.page.size * (this.page.pageNumber-1);
		let record_page_end=start+this.page.size
		this.selection.clear()
			for(let i=start;i<record_page_end;i++)
			{
				if(this.lstBilling[i])
				{
					this.lstBilling[i].is_checked=false;
					this.selection.deselect(this.lstBilling[i]);
				}
				else
				{
				this.selected.emit(this.selection.selected)
					break;
				}
				this.selected.emit(this.selection.selected)	
			}
	}
	
	historyStats(row) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc body-scroll history-modal',
			modalDialogClass: 'modal-lg'
		};
		let modelRef = this.modalService.open(CreatedHistoryComponent,ngbModalOptions);
		modelRef.componentInstance.createdInformation = [row];
	}
}
