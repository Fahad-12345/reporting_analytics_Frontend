import { Component, OnInit, OnDestroy } from '@angular/core';
import { AclService } from '@appDir/shared/services/acl.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder } from '@angular/forms';
import { UserGroupModalComponentComponent } from '../components/user-group-modal-component/user-group-modal-component.component';
import { GroupModel } from '../models/Group.Model';
import { UserGroupServiceService } from '../services/user-group-service.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import {
	unSubAllPrevious,
	parseHttpErrorResponseObject,
} from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { UserGroupUrlsEnum } from './userGroup-urls-enum';
import { OrderEnum, ParamQuery } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { Page } from '@appDir/front-desk/models/page';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { checkReactiveFormIsEmpty, isObjectEmpty } from '@appDir/shared/utils/utils.helpers';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
@Component({
	selector: 'app-user-group',
	templateUrl: './user-group.component.html',
	styleUrls: ['./user-group.component.scss'],
})
export class UserGroupComponent extends PermissionComponent implements OnInit, OnDestroy {
	subscription: Subscription[] = [];

	constructor(
		aclService: AclService,
		private modalService: NgbModal,
		private fb: FormBuilder,
		private userGroupService: UserGroupServiceService,
		private ngbModal: NgbModal,
		private toaster: ToastrService,
		protected requestService: RequestService,
		private toastrService: ToastrService,
		titleService: Title,
		private _route: ActivatedRoute,
		router: Router,	
		private customDiallogService : CustomDiallogService,
		private location: Location,
	) {
		super(aclService, router, _route, requestService, titleService);
		this.page = new Page();
		this.page.pageNumber = 0;
		this.page.size = 10;
	}

	lstGroups: Array<GroupModel> = [];
	userGroupSearchForm: FormGroup;
	currentPage: number = 1;
	resultsPerPage: number = 10;
	totalCount: number = 0;
	queryParams: ParamQuery;
	page: Page;
	getAllGroups(queryParams) {
		this.subscription.push(
			this.requestService
				.sendRequest(
					UserGroupUrlsEnum.UserGroup_list_GET,
					'GET',
					REQUEST_SERVERS.fd_api_url,
					queryParams,
				)
				.subscribe((data: HttpSuccessResponse) => {

					this.lstGroups = data.result.data;
					/*this.lstGroups =
						data && data['result'] && data['result']['data'] && data['result']['data']['data']
							? data['result']['data']['data']
							: [];*/
					this.page.totalElements = data.result.total;
					/*this.page.totalElements =
						data && data['result'] && data['result']['data'] && data['result']['data']['total']
							? data['result']['data']['total']
							: 0;*/
				}),
		);
	}
	ngOnInit() {
		this.setTitle();
		// this.titleService.setTitle(this._route.snapshot.data['title']);
		this.userGroupSearchForm = this.fb.group({
			name: [''],
		});
		//this.getAllGroups()
		this.subscription.push(
			this._route.queryParams.subscribe((params) => {
				this.userGroupSearchForm.patchValue(params);
			}),
		);

		this.setPage({ offset: 0 });
	}
	setPage(pageInfo) {
		let pageNum;
		//this.selection.clear();
		pageNum = pageInfo.offset;
		this.page.pageNumber = pageInfo.offset;
		const pageNumber = this.page.pageNumber + 1;
		let filters = checkReactiveFormIsEmpty(this.userGroupSearchForm);
		this.queryParams = {
			filter: !isObjectEmpty(filters),
			order: OrderEnum.ASC,
			per_page: this.page.size || 10,
			page: pageNumber,
			pagination: true,
		};
		let per_page = this.page.size;
		let queryparam = { per_page, page: pageNumber }

		this.addUrlQueryParams({ ...filters, ...queryparam });
		this.getAllGroups({ ...this.queryParams, ...filters });
	}
	addUrlQueryParams(params?) {
		this.location.replaceState(
			this.router.createUrlTree([], { queryParams: params, }).toString()
		);
	}
	searchUserGroup(form) {
		this.subscription.push(
			// this.userGroupService.searchUserGroup(form.name)
			this.requestService
				.sendRequest(
					UserGroupUrlsEnum.AllGroup_search_POST,
					'POST',
					REQUEST_SERVERS.fd_api_url,
					form.name,
				)
				.subscribe(
					(data: HttpSuccessResponse) => {
						this.lstGroups = data.result.data;
					},
					(err) => {
						const str = parseHttpErrorResponseObject(err.error.message);
						this.toastrService.error(str);
					},
				),
		);
	}
	reset() {
		this.ngOnInit();
	}
	onPerPageChange(event) {
		this.resultsPerPage = event.target.value;
		this.setPage({ offset: 0 });
	}

	stringify(obj) {
		return JSON.stringify(obj);
	}

	addGroup() {
		const modalRef = this.ngbModal.open(UserGroupModalComponentComponent, {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc',
		});

		modalRef.result.then((result) => {
			// this.lstGroups.push(result);
			this.setPage({ offset: 0 });
			// this.subscription.push(
			// 	//  this.userGroupService.getAllGroups()
			// 	this.requestService
			// 		.sendRequest(UserGroupUrlsEnum.AllGroup_list_GET, 'GET', REQUEST_SERVERS.fd_api_url)
			// 		.subscribe(
			// 			(data) => {
			// 				this.setPage({ offset: 0 });
			// 				this.lstGroups = data['data'];
			// 			},
			// 			(err) => {
			// 				const str = parseHttpErrorResponseObject(err.error.message);
			// 				this.toastrService.error(str);
			// 			},
			// 		),
			// );
		});

		// modalRef.componentInstance.editMode=false;
	}
	updateGroup(group: GroupModel) {
		if (group) {
			var modalRef = this.modalService.open(UserGroupModalComponentComponent, {
				backdrop: 'static',
				keyboard: false,
				windowClass: 'modal_extraDOc',
			});
			modalRef.componentInstance.editMode = true;
			modalRef.componentInstance.group = group;
			modalRef.result.then((group) => {
				if (group) {
					this.lstGroups.map((_group) => {
						if (group.id == _group.id) {
							_group = group;
						}
					});
				}
				this.setPage({ offset: 0 });
			});
		}
	}

	deleteMultipleGroups() {
		this.customDiallogService.confirm('Delete Confirmation?', 'Are you sure you want to delete this group?','Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
				var ids = [];
						this.lstGroups.forEach((group) => {
							if (group['isChecked']) {
								ids.push(group.id);
							}
						});
						//  this.userGroupService.deleteGroup(ids)
						this.requestService
							.sendRequest(
								UserGroupUrlsEnum.UserGroup_list_DELETE,
								'DELETE_WITH_BODY',
								REQUEST_SERVERS.fd_api_url,
								ids,
							)
							.subscribe(
								(data) => {
									if (data['status']) {
										this.toaster.success('Groups successfully deleted');
										this.lstGroups = this.lstGroups.filter((group) => {
											return !group['isChecked'];
										});
										this.setPage({ offset: 0 });
									}
								},
								(err) => {
									const str = parseHttpErrorResponseObject(err.message);
									this.toastrService.error(str);
								},
							);
			}
		})
		.catch();

	}
	deleteGroup(group: GroupModel) {
		this.customDiallogService.confirm('Delete Confirmation?', 'Are you sure you want to delete this group?','Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
			// this.userGroupService.deleteGroup([group.id])
			this.requestService
			.sendRequest(
				UserGroupUrlsEnum.UserGroup_list_DELETE,
				'DELETE_WITH_BODY',
				REQUEST_SERVERS.fd_api_url,
				[group.id],
			)
			.subscribe((data) => {
				if (data['status'] == true) {
					this.lstGroups = this.lstGroups.filter((_group) => {
						return group.id != _group.id;
					});
					this.setPage({ offset: 0 });
					this.toaster.success(data['message']);
				} else {
					this.toaster.error(data['message']);
				}
			});
				
			}
		})
		.catch();
	}

	checkUserGroup(event, group) {
		group['isChecked'] = event.checked;
	}

	checkAllGroups(event) {
		this.lstGroups.map((groups) => {
			groups['isChecked'] = event.checked;
		});
	}

	getCheckedGroups() {
		if (!this.lstGroups.length) {
			return [];
		}
		return this.lstGroups.filter((group) => {
			if (group) {
				return group['isChecked'];
			}
		});
	}

	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}
	setPageLimit($num) {
		this.page.size = Number($num);
		this.setPage({ offset: 0 });
	}
}
