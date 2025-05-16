import { SelectionModel } from "@angular/cdk/collections";
import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { SearchFilterClass } from "@appDir/front-desk/caseflow-module/case-insurance/mri-intakes/models/search-filter.model";
import { MriIntakeService } from "@appDir/front-desk/caseflow-module/case-insurance/mri-intakes/services/mri-intake-service";
import { MriIntake1, PriorSurgeryDetails } from "@appDir/front-desk/fd_shared/models/Case.model";
import { CaseFlowServiceService } from "@appDir/front-desk/fd_shared/services/case-flow-service.service";
import { Page } from "@appDir/front-desk/models/page";
import { PermissionComponent } from "@appDir/front-desk/permission.abstract.component";
import { OrderEnum, ParamQuery } from "@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class";
import { AclService } from "@appDir/shared/services/acl.service";
import { CustomDiallogService } from "@appDir/shared/services/custom-dialog.service";
import { DatePipeFormatService } from "@appDir/shared/services/datePipe-format.service";
import { RequestService } from "@appDir/shared/services/request.service";
import { removeEmptyAndNullsFormObject } from "@appDir/shared/utils/utils.helpers";
import { NgbModal, NgbModalOptions, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";
import { AddPriorSurgeryFormComponent } from "../add-prior-surgery-Form/add-prior-surgery-Form.componet";

@Component({
	selector: 'app-prior-surgery-listing-component',
	templateUrl: './prior-surgery-listing.componet.html',
	styleUrls: ['./prior-surgery-listing.componet.scss'],
})
export class PriorSurgeryListingComponent extends PermissionComponent implements OnInit {
	caseId:number;
	allChecked:boolean=false;
	public selection = new SelectionModel<any>(true, []);
	page: Page = new Page();
	modalRef:NgbModalRef;
	mri_intake_id:number;
	@Output() refreshPriorSurgeryDetailsListing=new EventEmitter();
	 mriIntake1Data:any[]=[] ;
	mri_id:number;
	title: string;
	
	constructor(
		titleService: Title,
		private route: ActivatedRoute,
		router: Router,
		public aclService: AclService,
		public mriIntakeService:MriIntakeService,
		public datePipeService: DatePipeFormatService,
		protected requestService: RequestService,
		private toastrService: ToastrService,
		public caseFlowService: CaseFlowServiceService ,
		public customDiallogService: CustomDiallogService,
		private modalService: NgbModal,
	) {
		super(aclService, router, route, requestService, titleService);
		titleService.setTitle(this.route.snapshot.data['title']);
	}

	ngOnInit() {
		debugger;
		this.mriIntakeService.MriIntake1PriorSurgeryRefreshData.subscribe(data=>{
			debugger;
			this.mriIntake1Data=data && data.prior_surgery_details?data.prior_surgery_details:[]
		})
		this.page.pageNumber = 1;
		this.page.size = 5;
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
	getPriorSurgeryDetails() {
		debugger;
		this.startLoader=true


		// this.startLoader.emit(true);
		// let obj={
		// 	case_id:this.Visit_data.case_id,
		// 	speciality_id: this.Visit_data.speciality_id,
		// 	visit_session_id: this.Visit_data.visit_session_id
		// }
		//  this.billingService.getAllVisits(obj).subscribe((data) => {
		// 	this.startLoader=false
		// 	// this.startLoader.emit(false);
		// 	this.lstBilling=data['result']['data'];
		// 	this.lstBilling.map(visit=>{
		// 		visit['is_checked']=false;
		// 	})
		// 	if(this.lstBilling.length==0)
		// 	{
		// 		this.toastrService.error('No visit found.','Error')
		// 	}
		// 	this.page.totalElements = this.lstBilling.length
		// },err=>{
		// 	this.startLoader=false
		// });
	}

	allSelected(e)
	{
		debugger;
		let start=this.page.size * (this.page.pageNumber-1);
		let record_page_end=start+this.page.size
		if(e.checked)
		{
			this.selection.clear()
			console.log(this.mriIntake1Data);
			
			for(let i=start;i<record_page_end;i++)
			{
				if(this.mriIntake1Data[i])
				{
					this.mriIntake1Data[i].is_checked=true;
					this.selection.select(this.mriIntake1Data[i]);					
				}
				else
				{
					// this.selected.emit(this.selection.selected)
					return;
				}
				
			}
			// this.selected.emit(this.selection.selected)
		}
		else
		{
			
			this.selection.clear()
			for(let i=start;i<record_page_end;i++)
			{
				if(this.mriIntake1Data[i])
				{
					this.mriIntake1Data[i].is_checked=false;
					this.selection.deselect(this.mriIntake1Data[i]);
				}
				else
				{
				// this.selected.emit(this.selection.selected)
					break;
				}
				
			}
			// this.selected.emit(this.selection.selected)
		}
	}
	getRecordsOnSinglePage()
	{
		let checked_count=0
		let start=this.page.size * (this.page.pageNumber-1);
		let record_page_end=start+this.page.size
		
			
			for(let i=start;i<record_page_end;i++)
			{
				if(this.mriIntake1Data[i])
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
		
	}

	deSelectOnPageChangeOrEntries(){
		this.allChecked = false;
		let start=this.page.size * (this.page.pageNumber-1);
		let record_page_end=start+this.page.size
		this.selection.clear()
		for(let i=start;i<record_page_end;i++)
		{
			if(this.mriIntake1Data[i])
			{
				this.mriIntake1Data[i].is_checked=false;
				this.selection.deselect(this.mriIntake1Data[i]);
			}
			else
			{
			// this.selected.emit(this.selection.selected)
				break;
			}
			// this.selected.emit(this.selection.selected)	
		}
	}

	confirmDel(rowData?:PriorSurgeryDetails ) {
		
		debugger;
		this.customDiallogService
		.confirm('Are you Sure', 'This will delete existing information?')
		.then((confirmed) => {
			if (confirmed) {
				let ids: any = [];
				if (rowData&&rowData.id) {
					ids.push(rowData.id);
				} else {
					this.selection.selected.forEach(function (obj) {
						ids.push(obj.id);
					});
				}
				let data = {
					// surgery_id:rowData.id,ids
					mri_intake_1_id:ids && this.mriIntake1Data&& ids.length==this.mriIntake1Data.length?this.mri_intake_id:null,
					surgery_id:ids,
					to_delete: "surgery"
				}
				if(ids && this.mriIntake1Data&& ids.length==this.mriIntake1Data.length)
				{
					delete data.surgery_id;
				}
				data=removeEmptyAndNullsFormObject(data);
				this.deleteSessionMri(data);
			}
		})
		.catch();
		
	}

	

	deleteSessionMri(data)
	{
		this.startLoader=true
		this.caseFlowService.deleteSessionMri(data).subscribe(res=>{
			debugger;
			this.startLoader=false
			this.selection.clear();
			this.allChecked = false;
			this.toastrService.success('Successfully Deleted', 'Success')
			this.refreshPriorSurgeryDetailsListing.next('surgery_details')

			
		},err=>{
			this.startLoader=false;
			this.toastrService.error(err.error.message, 'Error');
		})
	}

	

	AddEditAddPriorSurgery(row?)
	  {
		  debugger;
		let ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			size: 'lg',
			windowClass: 'modal_extraDOc',
		};
		this.modalRef = this.modalService.open(AddPriorSurgeryFormComponent, ngbModalOptions);
		this.modalRef.componentInstance.data=row;
		this.modalRef.componentInstance.caseId=this.caseId;
		this.modalRef.componentInstance.mri_intake_id=row&&row.mri_id?row.mri_id:this.mri_intake_id;
		this.modalRef.componentInstance.mri_id=this.mri_id
		this.modalRef.result.then((data: any) => {
			debugger;
			if(data)
			{
				this.refreshPriorSurgeryDetailsListing.next('surgery_details')
			}
			else
			{
				// this.reEvaluateForm();
			}
			// if (data) {
			// 	this.onEmployerFormSubmit(data)
			// 	this.reEvaluateForm();
			// } else {
			// 	this.reEvaluateForm();
			// }
		})
	  }
}
