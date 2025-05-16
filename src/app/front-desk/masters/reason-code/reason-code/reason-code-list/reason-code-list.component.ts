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
import { ReasonCodeService } from '../../reason-code.service';
import { ActionEnum } from '../../reasonCodeEnum';
@Component({
	selector: 'app-reactions-list',
	templateUrl: './reason-code-list.component.html',
	styleUrls: ['./reason-code-list.component.scss']
})
export class ReasonCodeListComponent implements OnInit, OnDestroy {
	action = ActionEnum;
	subscription: Subscription[] = [];
	reasonCodeList: any;
	applyFilterValues: any = {};
	reasonCodePage: Page = new Page();
	modalRef: NgbModalRef;
	reasonOffSet = 0;
	closeResult = '';
	userStatus;
	reasonCodeDetail: any = {};
	loadSpin = false;
	constructor(
		private reasonCodeService: ReasonCodeService,
		protected requestService: RequestService,
		private toastrService: ToastrService,
		private _route: ActivatedRoute,
		public datePipeService:DatePipeFormatService,
		private modalService: NgbModal) {
		this.reRunReasonCodeLists();
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
	initialSetPageSetting(params?) {
		this.reasonCodePage.pageNumber = params.pageNumber ? params.pageNumber : 1;
		this.reasonCodePage.size = params.size ? params.size : 10;
		let InitPage = {
			page: this.reasonCodePage.pageNumber,
			per_page: this.reasonCodePage.size,
		}
		this.getReasonCodeData(InitPage);
	}
	// GET LISTS OF REACTIONS
	getReasonCodeData(pageSetting) {
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
				snomed_concept_id: checkForValue(this.reasonCodeList.filterValues.snomed_concept_id),
				snomed_term_desc_id: checkForValue(this.reasonCodeList.filterValues.snomed_term_desc_id),
				snomed_term_desc: checkForValue(this.reasonCodeList.filterValues.snomed_term_desc),
				added_date: checkForValue(changeDateFormat(this.reasonCodeList.filterValues.added_date)),
				in_active_date: checkForValue(this.reasonCodeList.filterValues.in_active_date),
				term_type_desc: checkForValue(this.reasonCodeList.filterValues.term_type_desc),
				value_set_comment: checkForValue(this.reasonCodeList.filterValues.value_set_comment),
				snomed_term_concept_type_id: checkForValue(this.reasonCodeList.filterValues.snomed_term_concept_type_id),
				concept_type: checkForValue(this.reasonCodeList.filterValues.concept_type),
				value_set_type_id: checkForValue(this.reasonCodeList.filterValues.value_set_type_id),
				value_set_type_description: checkForValue(this.reasonCodeList.filterValues.value_set_type_description),
				hl7_object_identifier: checkForValue(this.reasonCodeList.filterValues.hl7_object_identifier),
				hl7_object_identifier_type: checkForValue(this.reasonCodeList.filterValues.hl7_object_identifier_type)
			}
		}
		this.reasonCodeService.addUrlQueryParams(queryParams);
		this.loadSpin = true;
		this.subscription.push(
			this.reasonCodeService.getReasonCodeLists(queryParams).subscribe((reasonCodeList: any) => {
				if (reasonCodeList.status) {
					this.loadSpin = false;
					if (this.applyFilterValues) {
						reasonCodeList['filterValues'] = this.applyFilterValues; // CHECK ONCE FILTER APPLY THEN ALWAYS CONCATE FILTER VALUES WHICH HAVE APPLIED
						this.reasonCodeList = reasonCodeList;
					} else {
						this.reasonCodeList = reasonCodeList;
					}
				}
			},
				(error) => {
					this.loadSpin = false;
				})
		);
	}
	get_filtered_data(filtered_data) {
		this.reasonOffSet = 0;
		this.reasonCodePage.size = filtered_data.result.per_page;
		this.applyFilterValues = filtered_data.filterValues; // FILTER VALUES FETCHED
		this.reasonCodeList = filtered_data;
		this.reasonCodeList = this.reasonCodeList;
	}
	// GET THE REASON PAGE SIZE
	setReasonnPageSize(pageSize) {
		this.reasonCodePage.size = pageSize;
		this.reasonCodePage.pageNumber = 1;
		this.reasonOffSet = 0;
		let queryPageSetting = {
			page: this.reasonCodePage.pageNumber,
			per_page: this.reasonCodePage.size,
		}
		this.getReasonCodeData(queryPageSetting);
	}
	// GET THE REASON PAGE NUMBER
	setReasonPageNumber(page) {
		this.reasonOffSet = page.offset;
		this.reasonCodePage.pageNumber = page.offset + 1;
		this.reasonCodePage.size = page.pageSize;
		let queryPageSetting = {
			page: this.reasonOffSet + 1,
			per_page: this.reasonCodePage.size,
		}
		this.getReasonCodeData(queryPageSetting);
	}
	// DELETE REASON
	deleteReasonCode(ID) {
		let queryParams;
		queryParams = {
			id: ID
		}
		this.loadSpin = true;
		this.subscription.push(
			this.reasonCodeService.deleteReasonByID(queryParams).subscribe((reasonCodeList: any) => {
				if (reasonCodeList.status) {
					this.loadSpin = false;
					this.toastrService.success(reasonCodeList.message, 'Success');
					this.initialSetPageSetting();
				}
			},
				(error) => {
					this.loadSpin = false;
				})
		);
	}
	// GET THE REASON DETAIL
	getReasonByID(row, modalRef, action) {
		if (action == this.action.DELETE) {
			this.deleteReasonCode(row.id);
		} else if (action == this.action.VIEW || this.action.EDIT) {
			this.setReasonCodeActionEditView(row, modalRef, action);
		} else if (this.action.ADD) {
			this.setReasonCodeActionEditView({}, modalRef, action);
		}
	}
	// SET REASON ACTION EDIT/VIEW
	setReasonCodeActionEditView(row, modalRef, action) {
		this.reasonCodeDetail['action'] = action;
		this.getReasonCode(row, modalRef); //GET SINGLE REASON BY ID
	}
	// GET SINGLE REASON BY ID AND THEN SET THIS RESULT IN VIEW COMPONENT
	getReasonCode(row, modalRef) {
		this.loadSpin = true;
		this.subscription.push(
			this.reasonCodeService.getReasonByID(row.id).subscribe((reactionObj: any) => {
				if (reactionObj.status) {
					this.loadSpin = false;
					this.reasonCodeDetail['reasonCodeDetail'] = reactionObj.result.data;
					this.setReasonDetail(modalRef); // HERE WE HAD BEEN FETCHED THE DETAIL AND SEND DETAIL TO REASON VIEW COMPONENT AND ALSO OPEN THE MODAL

				}
			},
				(error) => {
					this.loadSpin = false;
				})
		);

	}
	// OPEN THE MODAL WHERE WE DISPLAY THE FETCHED REASON DETAILS
	setReasonDetail(modalRef) {
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
	// WHEN EDIT REASON
	reRunReasonCodeLists() {
		this.reasonCodeService.isActionComplete.subscribe(resp => {
			if (resp) {
				this.reasonOffSet = 0;
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
