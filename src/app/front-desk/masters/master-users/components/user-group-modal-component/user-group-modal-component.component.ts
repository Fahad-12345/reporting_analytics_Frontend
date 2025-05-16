import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { GroupModel } from '../../models/Group.Model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserGroupServiceService } from '../../services/user-group-service.service';
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { RequestService } from '@appDir/shared/services/request.service';
import { UserGroupUrlsEnum } from '../../user-group/userGroup-urls-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { UsersUrlsEnum } from '../../users/users-urls.enum';
import { ParamQuery, OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { Page } from '@appDir/front-desk/models/page';

@Component({
	selector: 'app-user-group-modal-component',
	templateUrl: './user-group-modal-component.component.html',
	styleUrls: ['./user-group-modal-component.component.scss'],
})
export class UserGroupModalComponentComponent implements OnInit {
	constructor(
		private activeModal: NgbActiveModal,
		private fb: FormBuilder,
		private userGroupService: UserGroupServiceService,
		private toaster: ToastrService,
		protected requestService: RequestService,
	) { }
	@Input() editMode: boolean;
	@Input() group: GroupModel;
	dropdownSettings: any;
	groupForm: FormGroup;
	results: Observable<any>;
	lstUsers: Array<any> = [];
	queryParams: ParamQuery;
	page: Page;
	pageNumber: any;
	ngOnInit() {
		// this.dropdownSettings = {
		//   singleSelection: false,
		//   idField: 'facility_locations_id',
		//   textField: 'name',
		//   selectAllText: 'Select All',
		//   unSelectAllText: 'UnSelect All',
		//   itemsShowLimit: 1,
		//   allowSearchFilter: true,
		// };
		this.initForm();
		if (!this.editMode) {
			this.initForm();
		} else {
			this.requestService
				.sendRequest(
					UserGroupUrlsEnum.Group_detail_Get,
					'GET',
					REQUEST_SERVERS.fd_api_url,
					{ id: this.group.id },
				)
				.subscribe((data) => {
					this.group.users = data['result']['data']['users'];
					this.updateForm(this.group);
				});
		}
	}

	updateForm(group: GroupModel) {
		var selectedUsers = [];
		var selectedUsersId = [];
		this.group.users.forEach((users) => {
			users['fullName'] = users.name;
			selectedUsers.push(users);
			selectedUsersId.push(users.id);
		});

		this.lstUsers = [...selectedUsers];
		this.groupForm = this.fb.group({
			name: [group.name],
			group_members: [[...selectedUsersId]],
		});
	}
	initForm() {
		this.groupForm = this.fb.group({
			name: ['', Validators.required],
			group_members: [[]],
		});
	}

	onItemSelect(event) {
	}
	searchUser(event) {
		var value = event.target.value;
		this.queryParams = {
			filter: true,
			order: OrderEnum.ASC,
			per_page: 10,
			page: 0,
			pagination: false,
		};
		if (value.length >= 3) {
			// this.userGroupService.userSearch(event.target.value);
			this.requestService
				.sendRequest(UsersUrlsEnum.UserListing_list_GET, 'GET', REQUEST_SERVERS.fd_api_url, { ...this.queryParams, ...{ name: event.target.value } })
				.subscribe((resp) => {
					// console.log(data)
					this.lstUsers = resp['result']['data'];
					this.lstUsers.map((user) => {
						user['fullName'] = `${user.first_name || ''} ${user.middle_name || ''} ${user.last_name || ''}`;
					});
				});
			// this.results = this.userGroupService.userSearch(event.target.value)

			// this.results.subscribe(data => {
			//   this.lstUsers = data['data']
			//   console.log(this.lstUsers)
			// })
		}
	}
	addGroup(form) {
		if (this.editMode) {
			this.group.name = form.name;
			this.group.group_members = form.group_members;

			// this.userGroupService
			// 	.updateGroup(this.group)
			this.requestService
				.sendRequest(
					UserGroupUrlsEnum.UserGroup_list_Put,
					'PUT',
					REQUEST_SERVERS.fd_api_url,
					this.group,
				)
				.subscribe((data) => {
					if (data['status'] == true) {
						this.toaster.success(data['message'], 'Success');

						this.activeModal.close(this.group);
					} else {
						this.toaster.error(data['message'], 'Error');
					}
				});
		} else {
			var group = new GroupModel(form.name, form.group_members);
			// this.userGroupService.addGroup(form)
			this.requestService
				.sendRequest(
					UserGroupUrlsEnum.UserGroup_list_Post,
					'POST',
					REQUEST_SERVERS.fd_api_url,
					form,
				)
				.subscribe((data) => {
					if (data['status'] == true) {
						this.toaster.success('Group Successfully Created!');
						this.activeModal.close(group);
					} else {
						this.toaster.error('Something Went Wrong!');
					}
				});
		}
	}
	close() {
		this.activeModal.close(null);
	}
}
