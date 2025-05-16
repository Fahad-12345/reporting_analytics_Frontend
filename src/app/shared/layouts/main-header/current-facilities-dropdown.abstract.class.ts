import { SelectionModel } from "@angular/cdk/collections";
import { Component, Inject, OnDestroy } from "@angular/core";
import { Router } from '@angular/router';
import { RoleType } from '@appDir/analytics/helpers/role.enum';
import { FacilityUrlsEnum } from "@appDir/front-desk/masters/practice/practice/utils/facility-urls-enum";
import { PermissionComponent } from "@appDir/front-desk/permission.abstract.component";
import { LogInUrlsEnum } from "@appDir/pages/content-pages/login/logIn-Urls-Enum";
import { HttpSuccessResponse, StorageData } from "@appDir/pages/content-pages/login/user.class";
import { REQUEST_SERVERS } from "@appDir/request-servers.enum";
import { AclService } from '@appDir/shared/services/acl.service';
import { RequestService } from "@appDir/shared/services/request.service";
import { getObjectChildValue, removeEmptyAndNullsFormObject } from '@appDir/shared/utils/utils.helpers';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";
import { map } from 'rxjs';

@Component({
	template: ''
})
export abstract class CurrentFacilitiesDropDown
	extends PermissionComponent
	implements OnDestroy {

	public selection = new SelectionModel<Element>(true, []);
	public facilites = {} as any;
	facilityitem: number[];
	currentSimiler = [];
	constructor(
		@Inject(AclService) aclService, @Inject(Router) router, protected requestService: RequestService, protected storageData: StorageData,
		protected activeModal?: NgbActiveModal,
		protected toastrService?: ToastrService) {

		super(aclService, router);
	}


	getPracticesDropDownData(callback?) {

		debugger;
		if (!this.storageData.getBasicInfo()) {
			window.localStorage.clear();
			this.router.navigate(["/login"]);
			return false;
		}
		let practiceLocations: any = this.storageData.getUserPracticeLocationsData();
		if (!practiceLocations || !practiceLocations['facility_locations']) {
			this.requestService
				.sendRequest(FacilityUrlsEnum.Facility_list_dropdown_GET,
					'GET',
					REQUEST_SERVERS.fd_api_url,
					{
						user_id: this.storageData.getBasicInfo().id,
						similar_permissions: 1
					})
				.subscribe((resp: HttpSuccessResponse) => {
					this.facilites = resp.result.data;
					this.allFacilityLocaltion = this.facilites;
					this.setFacilility(callback);


				});
		}
		else {
			this.facilites = practiceLocations;
			this.allFacilityLocaltion = this.facilites;
			this.setFacilility(callback);
		}


	}

	setFacilility(callback?) {
		callback ? callback() : null;
		this.storageData.setUserPracticeLocationsData(this.facilites);
		const selectedPractice = this.facilityitem;
		if (selectedPractice && !selectedPractice.length) {
			this.currentSimiler = []
			return;
		}
		this.initCurrentSimilar();
	}

	public shoulddisable(id) {


		if (this.currentSimiler.length) {
			return !this.currentSimiler.includes(id)
		}
		return false;

	}

	currentSimilarPermissions(selectedPractice) {

		if (this.facilites && this.facilites?.similar_permissions) {
			this.facilites?.similar_permissions?.forEach(permission => {
				selectedPractice?.forEach(practice => {
					if (permission.includes(practice)) {
						this.currentSimiler = permission;
					}
				})
			})
		}
	}
	initCurrentSimilar() {
		const selectedPractice = this.facilityitem;
		if (selectedPractice && !selectedPractice.length) {
			this.currentSimiler = []
			return;
		}
		this.currentSimilarPermissions(selectedPractice);
	}


	onSubmit() {

		if (this.facilityitem) {
			this.storageData.setFacilityLocations(this.facilityitem);
			let paramQuery = {
				user_id: this.storageData.getUserId(),
			};
			this.getMainmenu().subscribe(res => {
				if (res['result']['data']) {
					this.menu = res['result']['data'];
					this.storageData.setMenu(this.menu);
					this.requestService.sendRequest(LogInUrlsEnum.User_Permissions_GET,
						'GET', REQUEST_SERVERS.fd_api_url,
						removeEmptyAndNullsFormObject(paramQuery))
						.subscribe((responce: HttpSuccessResponse) => {

							this.storageData?.setPermissions(getObjectChildValue(responce, '', ['result', 'data', 'permissions']));
							this.toastrService?.success("Location(s) updated successfully!", 'Success')
							this.router?.navigate(['front-desk']);
							location.reload();

						}, err => {
							this.storageData.clear();
						}
						);
				}

			});
			(this.activeModal) ? this.activeModal.close() : null;
		} else {

			this.facilityitem = [];
		}
	}

	getMainmenu() {

		this.facilityitem;
		// this.ngProgress.start();
		let paramQuery = {
			facility_location_id: this.facilityitem[0],
		}
		return this.requestService.sendRequest(LogInUrlsEnum.DynamicMenu, 'Get', REQUEST_SERVERS.fd_api_url, paramQuery, true)
			.pipe(
				map(response => {
					return response;
				}));
	}

	ngOnDestroy() {

	}
}
