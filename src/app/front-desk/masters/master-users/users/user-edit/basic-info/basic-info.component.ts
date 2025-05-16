import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { RequestService } from '@appDir/shared/services/request.service';
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { zip as rxZip, merge as rxMerge, Subscription, Observable, of } from 'rxjs';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { ToastrService } from 'ngx-toastr';
import { UserProfile, User } from '../../models/user.model';
import { CanDeactivateComponentInterface } from '@appDir/shared/canDeactivateFormsComponent/CanDeactivateComponent.interface';
import { UserFormComponent } from '@appDir/front-desk/fd_shared/components/user-form/user-form.component';
import { UsersUrlsEnum } from '@appDir/front-desk/masters/master-users/users/users-urls.enum';
import { FacilityUrlsEnum } from '@appDir/front-desk/masters/practice/practice/utils/facility-urls-enum';
import { HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { EmploymentByUrlsEnum } from '@appDir/front-desk/masters/master-users/employment-by/employmentBy-urls-enum';
import { DesignationUrlsEnum } from '@appDir/front-desk/masters/master-users/designation/designation-urls-enum';
import { DepartmentUrlsEnum } from '@appDir/front-desk/masters/master-users/departments/department/Departments-urls-enum';
import { EmploymentUrlsEnum } from '@appDir/front-desk/masters/master-users/employment-type/employment-urls-enum';
import { UserRolesUrlsEnum } from '@appDir/front-desk/masters/master-users/user-roles/UserRoles-Urls-Enum';

import { UserRelatedData } from '@appDir/front-desk/masters/master-users/users/models/user.model';
import { UsersEditComponent } from '@appDir/front-desk/masters/master-users/users/user-edit/user-edit.component';
import { AclService } from '@shared/services/acl.service';
import { RoleChangeServiceService } from '@appDir/front-desk/masters/master-users/users/services/role-change-service.service';
import { UserInfoChangeService } from '../../services/user-info-change.service';
import {NgxSpinnerService} from 'ngx-spinner';
import { isSameLoginUser } from '@appDir/shared/utils/utils.helpers';
import { NgbModal, NgbModalOptions, NgbModalRef, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { DeleteAppointmentsComponent } from '../delete-appointments/delete-appointments.component';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';

@Component({
	selector: 'app-basic-info',
	templateUrl: './basic-info.component.html',
	styleUrls: ['./basic-info.component.scss'],
})
export class BasicInfoComponent extends UsersEditComponent implements OnInit, OnDestroy, CanDeactivateComponentInterface {
	subscription: Subscription[] = [];
	user: UserProfile;
	loading = false;
	userRelatedData: UserRelatedData = {} as UserRelatedData;
	@ViewChild(UserFormComponent) UserFormComponent: UserFormComponent;
	public createModalRef: NgbModalRef;
	public modalRef: NgbModalRef;
	userName: string;

	constructor(
		public toasterService: ToastrService,
		aclService: AclService,
		private customDialogService: CustomDiallogService,
		//  _lightbox?: Lightbox,
		router: Router,
		public deleteModal: NgbModal,
		private toastrService: ToastrService,
		private spinner: NgxSpinnerService,
		activatedRoute?: ActivatedRoute,
		requestService?: RequestService,
		roleChangeService?: RoleChangeServiceService,
		userInfoChangeService?: UserInfoChangeService,
	) {
		super(aclService, router, activatedRoute, requestService, roleChangeService, userInfoChangeService);
	}

	userFormSubmit(userProfile: UserProfile) {
		// ;
		this.loading = true;
		this.userRelatedData.UserProfileData = userProfile
		userProfile.id = this.id;
		this.userName =  userProfile?.middle_name ? 
		`${userProfile?.first_name} ${userProfile?.middle_name} ${userProfile?.last_name}` : 
		`${userProfile?.first_name} ${userProfile?.last_name}`;
		// delete userProfile.email;
		// delete userProfile.state;
		userProfile.primary_facility_id = +userProfile.primary_facility_id;

		userProfile = userProfile;

		this.subscription.push(
			this.requestService.sendRequest(UsersUrlsEnum.Update_User_PUT, 'PUT', REQUEST_SERVERS.fd_api_url, userProfile)
				.subscribe(
					(res) => {
						if(res?.result?.data?.assignments_exist){
							this.loading = true;
							let ngbModalOptions: NgbModalOptions = {
								backdrop: 'static',
								keyboard: false,
								size: 'lg',
							};
							this.createModalRef = this.deleteModal.open(DeleteAppointmentsComponent, ngbModalOptions);
							this.createModalRef.componentInstance.appointments = res.result?.data?.appointments;
							this.createModalRef.componentInstance.assignments = res.result?.data?.assigments;
							this.createModalRef.componentInstance.assignments_exist = res.result?.data?.assignments_exist;
							this.createModalRef.componentInstance.userId = this.id;
							this.createModalRef.componentInstance.userName = this.userName;
							this.createModalRef.componentInstance.modalRef = this.createModalRef;
							this.loading = false;
							this.createModalRef.componentInstance.appointmentsDeleted.subscribe((deleted: boolean) => {
								if (deleted) {
									this.userFormSubmit(userProfile);
								}
							});
						}else{
							this.userInfoChangeService.onFetchUserInfoSubject(true);
							this.toasterService.success('Updated successfully.', 'Success');
							this.getUser()
								.subscribe((user: HttpSuccessResponse) => {
									this.userRelatedData.UserProfileData = user?.result?.data;
									this.userInfoChangeService.onUserInfoChange(this.userRelatedData?.UserProfileData);
									this.getUsersRole();
									this.loading = false;
									this.navigate('privileges')
								});
						}
					},
					(err) => {
						this.loading = false;
					},
				)
		);
	}

	navigate(path) {
		this.router.navigate([
			`front-desk/masters/users/creation/edit/${this.id}/${path}`,
		]);
	}


	getUser(): Observable<any> {
		// callback added later due to need in userformsubmit function
		if (!this.id) {
			return of(null);
		}
		const queryParams = { id: this.id };

		return this.requestService
			.sendRequest(UsersUrlsEnum.User_Basic_Info_GET, 'GET', REQUEST_SERVERS.fd_api_url, queryParams);
	}

	canDeactivate() {
		// ;
		// return true;
		return this.UserFormComponent.form.dirty && this.UserFormComponent.form.touched;
	}

	ngOnDestroy() {
		
		unSubAllPrevious(this.subscription);
	}

	getPracticesDropDownData() {
		return this.requestService
			.sendRequest(FacilityUrlsEnum.Facility_list_dropdown_GET, 'GET', REQUEST_SERVERS.fd_api_url);
	}
	getAddress(str) {
		return (str) ? str + ', ' : '';
	}

	ngOnInit() {

		this.activatedRoute.parent.paramMap.subscribe((params: ParamMap): void => {
			this.id = +params.get('id');
			this.loading = true;

			this.subscription.push(this.userInfoChangeService.userInfoChangeListener().subscribe(user => {
				let object = Object.assign({}, this.userRelatedData)
				object.UserProfileData = user
				this.userRelatedData = object;
			}))
			this.subscription.push(
				rxZip(
					// this.getUser(),
					this.getPracticesDropDownData(),
					this.employedByGet(),
					this.getAllDesignations(),
					this.getAllDepartments(),
					this.getAllEmploymentTypes(),
					this.getRoles())
					.subscribe((response: any) => {

						if (!this.userRelatedData) {
							this.userRelatedData = {} as UserRelatedData;
						}

						// this.userRelatedData.UserProfileData = response[0].result.data;
						response[0].result.data
							.map((location) => {
								if (location.address || location.city || location.state || location.zip) {
									// location.facility_full_name += ` (${this.getAddress(location.address)} ${this.getAddress(location.city)} ${this.getAddress(location.state)} ${location.zip})`;
								}
								return location;
							});
						this.userRelatedData.practicesDropDownData = response[0].result.data;
						this.userRelatedData.employedByDropDownData = response[1].result.data;
						this.userRelatedData.designationDropDownData = response[2].result.data;
						this.userRelatedData.departmentDropDownData = response[3].result.data;
						this.userRelatedData.employmentTypeDropDownData = response[4].result.data;
						this.userRelatedData.rolesData = response[5].result.data;
						this.loading = false;
						// this.userInfoChangeService.onUserInfoChange(this.userRelatedData.UserProfileData);
					}, error1 => {
						this.loading = false;
					})
			);
		});
	}

	employedByGet() {
		// this.http.get('all-employed-by')
		return this.requestService
			.sendRequest(EmploymentByUrlsEnum.EmploymentBy_list_GET, 'GET', REQUEST_SERVERS.fd_api_url);
	}

	getAllDesignations() {
		return this.requestService
			.sendRequest(DesignationUrlsEnum.Designation_list_GET, 'GET', REQUEST_SERVERS.fd_api_url);
	}


	getAllDepartments() {
		return this.requestService
			.sendRequest(DepartmentUrlsEnum.Departments_list_GET, 'GET', REQUEST_SERVERS.fd_api_url);
	}

	getAllEmploymentTypes() {
		return this.requestService
			.sendRequest(EmploymentUrlsEnum.Employment_list_GET, 'GET', REQUEST_SERVERS.fd_api_url);
	}

	getRoles() {
		return this.requestService
			.sendRequest(UserRolesUrlsEnum.UserRoles_list_GET, 'GET', REQUEST_SERVERS.fd_api_url);
	}
	isSameLoginUser() {
		return isSameLoginUser(this.id);
	}

}
