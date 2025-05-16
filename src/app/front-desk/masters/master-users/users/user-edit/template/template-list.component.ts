import { ReferringPhysicianService } from './../../../../practice/referring-physician/referring-physician/referring-physician.service';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModalRef, NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SelectionModel } from '@angular/cdk/collections';
import { AclService } from '@appDir/shared/services/acl.service';
import { Page } from '@appDir/front-desk/models/page';
import { Subscription } from 'rxjs';
import { RequestService } from '@appDir/shared/services/request.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { Location } from '@angular/common';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { TemplateUrlsEnum } from './template-urls-enum';
import { HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { AddTemplateFormComponent } from './components/add-template-form/add-template-form.component';

@Component({
	selector: 'app-template-listing',
	templateUrl: './template-list.component.html',
	styleUrls: ['./template-list.component.scss'],
})
export class TemplateListComponent extends PermissionComponent implements OnInit {
	selection = new SelectionModel<Element>(true, []);
	isLoading = false;
	public selectedRowsString: string;
	modalRef: NgbModalRef;
	bools: boolean = true;
	page: Page;
	lstTemplate: any[] = []
	subscription: Subscription[] = [];
	totalRows: number;
	public loadSpin: boolean = false;
	queryParams: any;
	userId:number;
	templateFilterValues = {};
	templateOffSet = 0;
	is_editable = false;
	filterValues = {};
	constructor(
		public customDiallogService: CustomDiallogService,
		private modalService: NgbModal,
		public route: ActivatedRoute,
		private toastrService: ToastrService,
		acl: AclService,
		protected requestService: RequestService,
		private CanDeactivateModelComponentService: CanDeactivateModelComponentService,
		router: Router,
		private location: Location,
		private refferingPhysicianService:ReferringPhysicianService,
	) {
		super(acl, router);
		this.page = new Page();
		this.page.pageNumber = 0;
		this.page.size = 10;
	}

	ngOnInit() {
		this.userId = this.route.parent.snapshot.params.id;
	    this.loadQueryParams();
		this.setPage({ offset: this.page.pageNumber - 1 || 0 });
		this.getAllTemplatesAfterAddOrUpdate();
		
	}
	loadQueryParams(){
		this.subscription.push(
			this.route.queryParams.subscribe((params) => {
				this.page.size = parseInt(params.per_page) || 10;
				this.page.pageNumber = parseInt(params.page) || 1;
			}),
		);
	}
	isDisabled() {
		if(this.isLoading ) {
			return true;
		} else {
			return false;
		}
	}
	pageRecord(pageInfo) {
		
		this.setPage(pageInfo, this.filterValues ? this.filterValues : {});
	}
	setPage(pageInfo , filterValues?) {
		let pageNum;
		this.selection.clear();
		pageNum = pageInfo.offset;
		this.page.pageNumber = pageInfo.offset;
		const pageNumber = this.page.pageNumber + 1;
	
		this.queryParams = {
			order: OrderEnum.ASC,
			per_page: this.page.size,
			page: pageNumber,
			pagination: true,
			user_id:this.userId,
			...filterValues
		};
		let per_page = this.page.size;
		let queryparam = { per_page, page: pageNumber,...filterValues }

		this.addUrlQueryParams({  ...queryparam });
		this.getUserTemplates({ ...this.queryParams });
		// this.getVisitTypes()
	}

	getUserTemplates(queryParams) {
		this.loadSpin = true;
		this.subscription.push(
			this.requestService
				.sendRequest(
					TemplateUrlsEnum.get_all_templates,
					'GET',
					REQUEST_SERVERS.fd_api_url,
					queryParams,
				)
				.subscribe(
					(data) => {
						if (data.status) {
							this.loadSpin = false;
							this.lstTemplate = data && data.result && data.result.data && data.result.data ? data.result.data : [];
							this.page.totalElements = data && data.result && data.result.data && data.result.total ? data.result.total : 0;
						}
					},
					(err) => {
						this.loadSpin = false;
					},
				),
		);
	}

	addUrlQueryParams(params?) {
		this.location.replaceState(
			this.router.createUrlTree([], { queryParams: params, }).toString()
		);
	}	
	
	AddEditTemplate(row?) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc',
			size:'lg'
		};
		this.modalRef = this.modalService.open(AddTemplateFormComponent, ngbModalOptions);
		this.modalRef.componentInstance.userId=this.userId;
		this.modalRef.componentInstance.isDisabledFormControls=true;
		this.modalRef.componentInstance.is_multiple=true;
		if(row)
		{
			this.modalRef.componentInstance.editRecord=row;
			this.modalRef.componentInstance.is_multiple=false;
			this.modalRef.componentInstance.buttonTitle="Update & Continue";
			this.modalRef.componentInstance.title="Edit"
		}
		}
	
	
	

	onDelete(id,isDeleteAll = false)
	{
		let temp;
		if(isDeleteAll) {
			temp = this.selection.selected.map(res => res.id);
		} else {
			temp = [id];
		}
		if(this.SelectedRecordHaveisEditAbleFalse()) {
			this.toastrService.error('You can delete only dynamic templates', 'Error');
			return;
		} else {
			this.customDiallogService
			.confirm('Delete Template', 'Do you really want to delete it?')
			.then((confirmed) => {
				if (confirmed) {
					this.loadSpin=true;
					this.subscription.push(
						this.requestService
							.sendRequest(
								TemplateUrlsEnum.delete_template,
								'post',
								REQUEST_SERVERS.fd_api_url,
								{ template_ids: temp },
							)
							.subscribe(
								(res) => {
									this.setPage({ offset: this.page.pageNumber  },this.filterValues);
								
									this.toastrService.success('Successfully Deleted', 'Success');
								},
								(err) => { },
							),
					);
	
				}
			})
			.catch();	
		}
	}
	SelectedRecordHaveisEditAbleFalse() {
		let result = this.selection.selected.filter((res:any) => res.is_editable == false);
		if(result.length > 0) {
			return true;
		}
		return false;
	}

	

	
	masterToggle(event) {
		this.isAllSelected()
			? this.selection.clear()
			: this.lstTemplate.slice(0, this.totalRows).forEach((row) => this.selection.select(row));
	}

	isAllSelected() {
		this.totalRows = this.lstTemplate.length;
		const numSelected = this.selection.selected.length;
		const numRows = this.totalRows;
		return numSelected === numRows;
	}

	bulkDelete() {
		const selected = this.selection.selected;
		const ids = selected.map((row) => row.id);

		this.customDiallogService
		.confirm('Delete Specialty', 'Do you really want to delete it?')
		.then((confirmed) => {
			if (confirmed) {
				this.loadSpin=true;
				this.subscription.push(
					this.requestService
						.sendRequest(
							TemplateUrlsEnum.delete_template,
							'post',
							REQUEST_SERVERS.fd_api_url,
							{ template_ids: ids },
						)
						.subscribe(
							(res) => {
								this.setPage({ offset: this.page.pageNumber  },this.filterValues);
							
								this.toastrService.success('Successfully Deleted', 'Success');
							},
							(err) => { },
						),
				);

			}
		})
		.catch();
		
	}

	private removeMultipleFromArr<T>(data: T[], toBeDeleted: Array<T>, key): T[] {
		return data.filter(
			(row) => row[`${key}`] !== toBeDeleted.find((element) => row[`${key}`] === element),
		);
	}

	facilityPlus() {
		this.bools = !this.bools;
	}

	facilityMinus() {
		this.bools = !this.bools;
	}

	onResetFilters() {
		this.setPage({ offset: 0 });
	}

	pageLimit($num) {
		this.templateOffSet = 0;
		this.page.size = Number($num);
		this.setPage({ offset: 0 },this.filterValues);
	}

	

	unSubAllPrevious() {
		if (this.subscription.length) {
			this.subscription.forEach((sub) => {
				sub.unsubscribe();
			});
		}
	}
	getAllTemplatesAfterAddOrUpdate() {
		this.subscription.push(
		this.refferingPhysicianService.isAddOrUpdateUserTemplate$.subscribe(res =>{
			if(res) {
				this.setPage({ offset: this.page.pageNumber },this.filterValues);
			}
		})
		);
	}
	applyFilter(values) {
		// this.templateFilterValues = values;
		this.templateOffSet = 0;
		this.page.size = 10;
		this.page.pageNumber = 1;
		this.page.size = 10;
		this.filterValues = values;
		this.setPage({ offset: this.page.pageNumber - 1 || 0 },this.filterValues);
	}
	changeStatusIsDefault(row,event) {
		this.customDiallogService
		.confirm('Default Template', event.checked ? 'Do you really want to set this template as Default ?' : 'Do you really want to unset this template as Default ?')
		.then((confirmed) => {
			if (confirmed) {
			row['status'] = event.checked ? 1 : 0;
			this.loadSpin = true;
		this.subscription.push(
			this.requestService
				.sendRequest(
					TemplateUrlsEnum.edit_template_user,
					'post',
					REQUEST_SERVERS.fd_api_url,
					row,
				)
				.subscribe(
					(data) => {
						if (data.status) {
							this.loadSpin = false;
							this.setPage({ offset: this.page.pageNumber },this.filterValues);
						}
					},
					(err) => {
						this.loadSpin = false;
					},
				),
		);
			} else {
				if(event.checked) {
					this.lstTemplate.find(res=> res.id == row.id).is_default = false;
				}
				if(!event.checked) {
					this.lstTemplate.find(res=> res.id == row.id).is_default = true;
				}
			}
		})
		.catch((error)=> {
			this.lstTemplate.find(res=> res.id == row.id).is_default = false;
		});	
	}
	ngOnDestroy(): void {
		this.unSubAllPrevious();
	}

	


}
