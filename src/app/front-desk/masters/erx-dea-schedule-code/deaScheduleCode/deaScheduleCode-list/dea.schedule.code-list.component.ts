import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { Subscription } from 'rxjs';
import { Page } from '@appDir/front-desk/models/page';
import { NgbModalRef, NgbModal, NgbModalOptions, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { RequestService } from '@appDir/shared/services/request.service';
import { AclService } from '@appDir/shared/services/acl.service';
import { changeDateFormat, checkForValue, isEmptyObject } from '@appDir/shared/utils/utils.helpers';
import { DeaSchedulerCodenService } from '../../dea.schedule.code.service';
import { ActionEnum } from '../../dea.schedule.codeEnum';
@Component({
	selector: 'app-deaScheduleCode-list',
	templateUrl: './dea.schedule.code-list.component.html',
	styleUrls: ['./dea.schedule.code-list.component.scss']
})
export class DeaScheduleCodeListComponent implements OnInit, OnDestroy {
	action = ActionEnum;
	subscription: Subscription[] = [];
	deaSchedulerCodeList: any;
	applyFilterValues: any = {};
	deaSchedulerCodePage: Page = new Page();
	modalRef: NgbModalRef;
	deaSchedulerCodeOffSet = 0;
	closeResult = '';
	userStatus;
	deaSchedulerCodeDetail: any = {};
	loadSpin = false;
	constructor(aclService: AclService,
		router: Router,
		private deaSchedulerCodeService: DeaSchedulerCodenService,
		protected requestService: RequestService,
		private toastrService: ToastrService,
		private _route: ActivatedRoute,
		public datePipeService:DatePipeFormatService,
		private modalService: NgbModal) {
		// this.reRunLicenseLists();
	}

	ngOnInit() {
		this.getQueryParams();
	}
	getQueryParams() {
		this.subscription.push(
			this._route.queryParams.subscribe((params) => {
				this.initialSetPageSetting(params);
			}),
		);
	}
	initialSetPageSetting(queryParams?) {
		this.deaSchedulerCodePage.pageNumber = queryParams.pageNumber ? queryParams.pageNumber : 1;
		this.deaSchedulerCodePage.size = queryParams.size ? queryParams.size : 10;
		let InitPage = {
			page: this.deaSchedulerCodePage.pageNumber,
			per_page: this.deaSchedulerCodePage.size,
		}
		this.getDeaSchedulerCodeData(InitPage);
	}
	// GET LISTS OF DEA SCHEDULER CODE
	getDeaSchedulerCodeData(pageSetting) {
		let queryParams;
		if (isEmptyObject(this.applyFilterValues)) {
			queryParams = {
				page: pageSetting.page,
				per_page: pageSetting.per_page,
				order: OrderEnum.DEC,
				pagination: true,
			}
		} else {
			queryParams = {
				page: pageSetting.page,
				per_page: pageSetting.per_page,
				order: OrderEnum.DEC,
				pagination: true,
				snomed_concept_id: checkForValue(this.deaSchedulerCodeList.filterValues.snomed_concept_id),
				snomed_term_desc_id: checkForValue(this.deaSchedulerCodeList.filterValues.snomed_term_desc_id),
				snomed_term_desc: checkForValue(this.deaSchedulerCodeList.filterValues.snomed_term_desc),
				added_date: checkForValue(changeDateFormat(this.deaSchedulerCodeList.filterValues.added_date)),
				in_active_date: checkForValue(this.deaSchedulerCodeList.filterValues.in_active_date),
				term_type_desc: checkForValue(this.deaSchedulerCodeList.filterValues.term_type_desc),
				value_set_comment: checkForValue(this.deaSchedulerCodeList.filterValues.value_set_comment),
				snomed_term_concept_type_id: checkForValue(this.deaSchedulerCodeList.filterValues.snomed_term_concept_type_id),
				concept_type: checkForValue(this.deaSchedulerCodeList.filterValues.concept_type),
				value_set_type_id: checkForValue(this.deaSchedulerCodeList.filterValues.value_set_type_id),
				value_set_type_description: checkForValue(this.deaSchedulerCodeList.filterValues.value_set_type_description),
				hl7_object_identifier: checkForValue(this.deaSchedulerCodeList.filterValues.hl7_object_identifier),
				hl7_object_identifier_type: checkForValue(this.deaSchedulerCodeList.filterValues.hl7_object_identifier_type)
			}
		}
		this.deaSchedulerCodeService.addUrlQueryParams(queryParams);
		this.loadSpin = true;
		this.subscription.push(
			this.deaSchedulerCodeService.getReactionists(queryParams).subscribe((deaSchedulerCodeList: any) => {
				if (deaSchedulerCodeList.status) {
					this.loadSpin = false;
					if (this.applyFilterValues) {
						deaSchedulerCodeList['filterValues'] = this.applyFilterValues; // CHECK ONCE FILTER APPLY THEN ALWAYS CONCATE FILTER VALUES WHICH HAVE APPLIED
						this.deaSchedulerCodeList = deaSchedulerCodeList;
					} else {
						this.deaSchedulerCodeList = deaSchedulerCodeList;
					}
				}
			},
				(error) => {
					this.loadSpin = false;
				})
		);
	}
	get_filtered_data(filtered_data) {
		this.deaSchedulerCodeOffSet = 0;
		this.deaSchedulerCodePage.size = filtered_data.result.per_page;
		this.applyFilterValues = filtered_data.filterValues; // FILTER VALUES FETCHED
		this.deaSchedulerCodeList = filtered_data;
		this.deaSchedulerCodeList = this.deaSchedulerCodeList;
	}
	// GET THE DEA SCHEDULER CODE PAGE SIZE
	setDeaSchedulerCodePageSize(pageSize) {
		this.deaSchedulerCodePage.size = pageSize;
		this.deaSchedulerCodePage.pageNumber = 1;
		this.deaSchedulerCodeOffSet = 0;
		let queryPageSetting = {
			page: this.deaSchedulerCodePage.pageNumber,
			per_page: this.deaSchedulerCodePage.size,
		}
		this.getDeaSchedulerCodeData(queryPageSetting);
	}
	// GET THE DEA SCHEDULER CODE PAGE NUMBER
	setDeaSchedulerCodePageNumber(page) {
		this.deaSchedulerCodeOffSet = page.offset;
		this.deaSchedulerCodePage.pageNumber = page.offset + 1;
		this.deaSchedulerCodePage.size = page.pageSize;
		let queryPageSetting = {
			page: this.deaSchedulerCodeOffSet + 1,
			per_page: this.deaSchedulerCodePage.size,
		}
		this.getDeaSchedulerCodeData(queryPageSetting);
	}
	// DELETE DEA SCHEDULER CODE
	deleteReaction(ID) {
		let queryParams;
		queryParams = {
			id: ID
		}
		this.loadSpin = true;
		this.subscription.push(
			this.deaSchedulerCodeService.deleteReactionByID(queryParams).subscribe((deaSchedulerCodeList: any) => {
				if (deaSchedulerCodeList.status) {
					this.loadSpin = false;
					this.toastrService.success(deaSchedulerCodeList.message, 'Success');
					this.initialSetPageSetting();
				}
			},
				(error) => {
					this.loadSpin = false;
				})
		);
	}
	// GET THE DEA SCHEDULER CODE DETAIL
	getDeaSchedulerCodeByID(row, modalRef, action) {
		if (action == this.action.DELETE) {
			this.deleteReaction(row.id);
		} else if (action == this.action.VIEW || this.action.EDIT) {
			this.setDeaSchedulerCodeActionEditView(row, modalRef, action);
		} else if (this.action.ADD) {
			this.setDeaSchedulerCodeActionEditView({}, modalRef, action);
		}
	}
	// SET DEA SCHEDULER CODE ACTION EDIT/VIEW
	setDeaSchedulerCodeActionEditView(row, modalRef, action) {
		this.deaSchedulerCodeDetail['action'] = action;
		this.getDeaSchedulerCode(row, modalRef); //GET SINGLE DEA SCHEDULER CODE BY ID
	}
	// GET SINGLE DEA SCHEDULER CODE BY ID AND THEN SET THIS RESULT IN VIEW COMPONENT
	getDeaSchedulerCode(row, modalRef) {
		this.loadSpin = true;
		this.subscription.push(
			this.deaSchedulerCodeService.getReactionByID(row.id).subscribe((reactionObj: any) => {
				if (reactionObj.status) {
					this.loadSpin = false;
					this.deaSchedulerCodeDetail['deaSchedulerCodeDetail'] = reactionObj.result.data;
					this.setDeaSchedulerCodeDetail(modalRef); // HERE WE HAD BEEN FETCHED THE DETAIL AND SEND DETAIL TO DEA SCHEDULER CODE VIEW COMPONENT AND ALSO OPEN THE MODAL

				}
			},
				(error) => {
					this.loadSpin = false;
				})
		);

	}
	// OPEN THE MODAL WHERE WE DISPLAY THE FETCHED DEA SCHEDULER CODE DETAILS
	setDeaSchedulerCodeDetail(modalRef) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			size: 'lg',
		};
		this.modalService.open(modalRef, ngbModalOptions).result.then((result) => {
			this.closeResult = `Closed with: ${result}`;
		}, (reason) => {
			this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
		});
	}
	// WHEN EDIT DEA SCHEDULER CODE
	reRunLicenseLists() {
		this.deaSchedulerCodeService.isActionComplete.subscribe(resp => {
			if (resp) {
				this.deaSchedulerCodeOffSet = 0;
				this.initialSetPageSetting();
			}
		})
	}
	// FOR DISMISS THE MODAL
	private getDismissReason(reason: any): string {
		if (reason === ModalDismissReasons.ESC) {
			return 'by pressing ESC';
		} else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
			return 'by clicking on a backdrop';
		} else {
			return `with: ${reason}`;
		}
	}
	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}

}
