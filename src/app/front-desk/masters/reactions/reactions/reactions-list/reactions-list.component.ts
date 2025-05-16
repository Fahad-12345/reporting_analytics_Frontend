import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { Subscription } from 'rxjs';
import { Page } from '@appDir/front-desk/models/page';
import { Location } from '@angular/common';
import { NgbModalRef, NgbModal, NgbModalOptions, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { RequestService } from '@appDir/shared/services/request.service';
import { AclService } from '@appDir/shared/services/acl.service';
import { changeDateFormat, checkForValue, isEmptyObject } from '@appDir/shared/utils/utils.helpers';
import { ReactionService } from '../../reaction.service';
import { ActionEnum } from '../../reactionsEnum';
@Component({
	selector: 'app-reactions-list',
	templateUrl: './reactions-list.component.html',
	styleUrls: ['./reactions-list.component.scss']
})
export class ReactionsListComponent implements OnInit, OnDestroy {
	action = ActionEnum;
	subscription: Subscription[] = [];
	reactionList: any;
	applyFilterValues: any = {};
	reactionPage: Page = new Page();
	modalRef: NgbModalRef;
	reactionOffSet = 0;
	closeResult = '';
	userStatus;
	reactionDetail: any = {};
	loadSpin = false;
	isDisabledGetNewLicense = false;
	constructor(aclService: AclService,
		private router: Router,
		private reactionService: ReactionService,
		private _route: ActivatedRoute,
		protected requestService: RequestService,
		private toastrService: ToastrService,
		private location: Location,
		public datePipeService:DatePipeFormatService,
		private modalService: NgbModal) {
		this.reRunLicenseLists();
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
		this.reactionPage.pageNumber = queryParams.page ? queryParams.page : 1;
		this.reactionPage.size = queryParams.per_page ? queryParams.per_page : 10;
		let InitPage = {
			page: this.reactionPage.pageNumber,
			per_page: this.reactionPage.size,
		}
		this.getReactionData(InitPage);
	}
	// GET LISTS OF REACTIONS
	getReactionData(pageSetting) {
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
				snomed_concept_id: checkForValue(this.reactionList.filterValues.snomed_concept_id),
				snomed_term_desc_id: checkForValue(this.reactionList.filterValues.snomed_term_desc_id),
				snomed_term_desc: checkForValue(this.reactionList.filterValues.snomed_term_desc),
				added_date: checkForValue(changeDateFormat(this.reactionList.filterValues.added_date)),
				in_active_date: checkForValue(this.reactionList.filterValues.in_active_date),
				term_type_desc: checkForValue(this.reactionList.filterValues.term_type_desc),
				value_set_comment: checkForValue(this.reactionList.filterValues.value_set_comment),
				snomed_term_concept_type_id: checkForValue(this.reactionList.filterValues.snomed_term_concept_type_id),
				concept_type: checkForValue(this.reactionList.filterValues.concept_type),
				value_set_type_id: checkForValue(this.reactionList.filterValues.value_set_type_id),
				value_set_type_description: checkForValue(this.reactionList.filterValues.value_set_type_description),
				hl7_object_identifier: checkForValue(this.reactionList.filterValues.hl7_object_identifier),
				hl7_object_identifier_type: checkForValue(this.reactionList.filterValues.hl7_object_identifier_type)
			}
		}
		this.reactionService.addUrlQueryParams(queryParams);
		this.loadSpin = true;
		this.subscription.push(
			this.reactionService.getReactionists(queryParams).subscribe((reactionList: any) => {
				if (reactionList.status) {
					this.loadSpin = false;
					if (this.applyFilterValues) {
						reactionList['filterValues'] = this.applyFilterValues; // CHECK ONCE FILTER APPLY THEN ALWAYS CONCATE FILTER VALUES WHICH HAVE APPLIED
						this.reactionList = reactionList;
					} else {
						this.reactionList = reactionList;
					}
				}
			},
				(error) => {
					this.loadSpin = false;
				})
		);
	}
	addUrlQueryParams(params?) {
		this.location.replaceState(
			this.router.createUrlTree([], { queryParams: params, }).toString()
		);
	}
	get_filtered_data(filtered_data) {
		this.reactionOffSet = 0;
		this.reactionPage.size = filtered_data.result.per_page;
		this.applyFilterValues = filtered_data.filterValues; // FILTER VALUES FETCHED
		this.reactionList = filtered_data;
		this.reactionList = this.reactionList;
	}
	// GET THE REACTION PAGE SIZE
	setReactionPageSize(pageSize) {
		this.reactionPage.size = pageSize;
		this.reactionPage.pageNumber = 1;
		this.reactionOffSet = 0;
		let queryPageSetting = {
			page: this.reactionPage.pageNumber,
			per_page: this.reactionPage.size,
		}
		this.getReactionData(queryPageSetting);
	}
	// GET THE REACTION PAGE NUMBER
	setReactionPageNumber(page) {
		this.reactionOffSet = page.offset;
		this.reactionPage.pageNumber = page.offset + 1;
		this.reactionPage.size = page.pageSize;
		let queryPageSetting = {
			page: this.reactionOffSet + 1,
			per_page: this.reactionPage.size,
		}
		this.getReactionData(queryPageSetting);
	}
	// DELETE REACTION
	deleteReaction(ID) {
		let queryParams;
		queryParams = {
			id: ID
		}
		this.loadSpin = true;
		this.subscription.push(
			this.reactionService.deleteReactionByID(queryParams).subscribe((reactionList: any) => {
				if (reactionList.status) {
					this.loadSpin = false;
					this.toastrService.success(reactionList.message, 'Success');
					this.initialSetPageSetting();
				}
			},
				(error) => {
					this.loadSpin = false;
				})
		);
	}
	// GET THE REACTION DETAIL
	getReactionByID(row, modalRef, action) {
		if (action == this.action.DELETE) {
			this.deleteReaction(row.id);
		} else if (action == this.action.VIEW || this.action.EDIT) {
			this.setReactionActionEditView(row, modalRef, action);
		} else if (this.action.ADD) {
			this.setReactionActionEditView({}, modalRef, action);
		}
	}
	// SET REACTION ACTION EDIT/VIEW
	setReactionActionEditView(row, modalRef, action) {
		this.reactionDetail['action'] = action;
		this.getReaction(row, modalRef); //GET SINGLE REACTION BY ID
	}
	// GET SINGLE REACTION BY ID AND THEN SET THIS RESULT IN VIEW COMPONENT
	getReaction(row, modalRef) {
		this.loadSpin = true;
		this.subscription.push(
			this.reactionService.getReactionByID(row.id).subscribe((reactionObj: any) => {
				if (reactionObj.status) {
					this.loadSpin = false;
					this.reactionDetail['reactionDetail'] = reactionObj.result.data;
					this.setReactionDetail(modalRef); // HERE WE HAD BEEN FETCHED THE DETAIL AND SEND DETAIL TO REACTION VIEW COMPONENT AND ALSO OPEN THE MODAL

				}
			},
				(error) => {
					this.loadSpin = false;
				})
		);

	}
	// OPEN THE MODAL WHERE WE DISPLAY THE FETCHED REACTION DETAILS
	setReactionDetail(modalRef) {
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
	// WHEN EDIT REACTION
	reRunLicenseLists() {
		this.reactionService.isActionComplete.subscribe(resp => {
			if (resp) {
				this.reactionOffSet = 0;
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
