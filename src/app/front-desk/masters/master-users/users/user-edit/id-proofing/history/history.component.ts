import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { ErxService } from './../../../../../erx/erx.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { unSubAllPrevious} from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { Subscription } from 'rxjs';
import { Page } from '@appDir/front-desk/models/page';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { Router, ActivatedRoute } from '@angular/router';
import { RequestService } from '@appDir/shared/services/request.service';
import { AclService } from '@appDir/shared/services/acl.service';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { ClassUserLicenseStatus } from '../proofing-information/userLicneseStatus.modal';
import * as _ from 'lodash';
import { getLoginUserObject } from '@appDir/shared/utils/utils.helpers';
@Component({
	selector: 'app-history',
	templateUrl: './history.component.html',
	styleUrls: ['./history.component.scss']
})
export class HistoryComponent extends PermissionComponent implements OnInit, OnDestroy {
	subscription: Subscription[] = [];
	licenseLists;
	historyLists;
	licensePage: Page = new Page();
	historyPage: Page = new Page();
	license_offSet = 0;
	history_offSet = 0;
	user_id;
	loadSpin = false;
	userLicenseStatus = new ClassUserLicenseStatus();
	constructor(aclService: AclService,
		router: Router,
		private erxService: ErxService,
		private route: ActivatedRoute,
		public datePipeService:DatePipeFormatService,
		protected requestService: RequestService) {
		super(aclService)
	}

	ngOnInit() {
		this.getUserID();
		this.licenseInitia_set_page_setting();
		this.historyInitia_set_page_setting();
	}
	// GET USER ID
	getUserID() {
		this.user_id = getLoginUserObject().id;
	}
	licenseInitia_set_page_setting() {
		this.licensePage.pageNumber = 1;
		this.licensePage.size = 10;
		let InitPage = {
			page: this.licensePage.pageNumber,
			per_page: this.licensePage.size,
		}
		this.get_license_data(InitPage);
	}
	historyInitia_set_page_setting() {
		this.historyPage.pageNumber = 1;
		this.historyPage.size = 10;
		let InitPage = {
			page: this.historyPage.pageNumber,
			per_page: this.historyPage.size,
		}
		this.get_history_data(InitPage);
	}
	// GET LISTS OF LICENSE ID PROOFING IN USER TAB  
	get_license_data(pageSetting) {
		const queryParams = {
			page: pageSetting.page,
			per_page: pageSetting.per_page,
			order: OrderEnum.DEC,
			pagination: true,
			user_id: this.user_id
		}
		this.loadSpin = true;
		this.subscription.push(
			this.erxService.getProofingLicenseLists(queryParams).subscribe((licenseList: any) => {
				if (licenseList.status) {
					this.loadSpin = false;
					this.licenseLists = licenseList;
					this.WhatisUserStatus();
				}
			},
				(error) => {
					this.loadSpin = false;
				})
		);
	}
	// CHECK WHAT IS THE USER STATUS (IF STATUS IS ACTIVE THEN DIPSLAY MANAGE ACCOUNT BUTTON)
	WhatisUserStatus() {
		let licenseList = [];
		licenseList = this.licenseLists.result.data;
		let status = this.userLicenseStatus.Active_User_Status_ID;
		let isAnyActive = licenseList.filter(obj => {
			return obj.user_status_id == status;
		  });
		if(isAnyActive.length > 0) {
			this.erxService.isUserStatusActive.next(true);
		}
	}
	// GET LISTS OF HISTORY 
	get_history_data(pageSetting) {
		const queryParams = {
			page: pageSetting.page,
			per_page: pageSetting.per_page,
			order: OrderEnum.DEC,
			pagination: true
		}
		this.loadSpin = true;
		this.subscription.push(
			this.erxService.get_historyLists(queryParams).subscribe((historyList: any) => {
				if (historyList.status) {
					this.loadSpin = false;
					this.historyLists = historyList.result;
				}
			},
				(error) => {
					this.loadSpin = false;
				})
		);
	}
	// GET THE LICENSE PAGE SIZE
	set_license_page_size(pageSize) {
		this.licensePage.size = pageSize;
		this.licensePage.pageNumber = 1;
		this.license_offSet = 0;
		let queryPageSetting = {
			page: this.licensePage.pageNumber,
			per_page: this.licensePage.size,
		}
		this.get_license_data(queryPageSetting);
	}
	// GET THE HISTORY PAGE SIZE
	set_history_page_size(pageSize) {
		this.historyPage.size = pageSize;
		this.historyPage.pageNumber = 1;
		this.history_offSet = 0;
		let queryPageSetting = {
			page: this.historyPage.pageNumber,
			per_page: this.historyPage.size,
		}
		this.get_history_data(queryPageSetting);
	}
	// GET THE LICENSE PAGE NUMBER
	set_license_page_number(page) {
		this.license_offSet = page.offset;
		this.licensePage.pageNumber = page.offset + 1;
		this.licensePage.size = page.pageSize;
		let queryPageSetting = {
			page: this.license_offSet + 1,
			per_page: this.licensePage.size,
		}
		this.get_license_data(queryPageSetting);
	}
	// GET THE HISTORY PAGE NUMBER
	set_history_page_number(page) {
		this.history_offSet = page.offset;
		this.historyPage.pageNumber = page.offset + 1;
		this.historyPage.size = page.pageSize;
		let queryPageSetting = {
			page: this.history_offSet + 1,
			per_page: this.historyPage.size,
		}
		this.get_history_data(queryPageSetting);
	}
	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}

}
