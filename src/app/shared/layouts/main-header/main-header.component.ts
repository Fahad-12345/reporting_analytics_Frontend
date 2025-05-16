import { Component, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { RoleType } from '@appDir/analytics/helpers/role.enum';
import { ChooseFacilityComponent } from '@appDir/front-desk/components/choose-facility/choose-facility.component';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { Page } from '@appDir/shared/models/listing/page';
import { AppointmentUrlsEnum } from '@appDir/shared/modules/appointment/appointment-urls-enum';
import { AclService } from '@appDir/shared/services/acl.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { getObjectChildValue, removeArrayItem } from '@appDir/shared/utils/utils.helpers';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '@shared/auth/auth.service';
import { environment } from 'environments/environment';
import { ConnectionService } from 'ng-connection-service';
import { Socket } from 'ngx-socket-io';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { LocalStorage } from '../../libs/localstorage';
import { UserInfoChangeService } from './../../../front-desk/masters/master-users/users/services/user-info-change.service';
import { CurrentFacilitiesDropDown } from './current-facilities-dropdown.abstract.class';
import { TimeZoneModalComponent } from './time-zone-modal/time-zone-modal.component';


@Component({
	selector: 'app-main-header',
	templateUrl: './main-header.component.html'
})
export class MainHeaderComponent extends CurrentFacilitiesDropDown implements OnInit {
	authenticated_user_detail;
	authenticate_user_profileImg;
	private _albums: Array<any> = [];
	public currentLang: string;
	public first_name;
	public middle_name;
	public last_name;
	public user_name;
	public profileImage;
	public offline = false;
	public modalRef: NgbModalRef;
	btnGo = false;
	locationIcon = false;
	envname:string = '';
	environment= environment;
	notificationDetails: any = [];
	subcription: Subscription[]=[];
	page: Page = new Page();
	showBadge = false;
	lastPage: any;
	totalItems: any;
	todayData = [];
	yesterdayData = [];
	olderData = [];
	today: any;
	yesterday: any;
	constructor(
		private socket:Socket,
		router: Router,
		private route: ActivatedRoute,
		private localstorage: LocalStorage,
		private authService: AuthService,
		protected storageData: StorageData,
		private ngbModal: NgbModal,
		private modalService: NgbModal,
		aclService: AclService,
		protected requestService: RequestService,
		private elementRef: ElementRef,
		protected toastrService?: ToastrService,
		private connectionService?: ConnectionService,
		private userInfoChangeService?: UserInfoChangeService,

	) {
		super(aclService, router, requestService, storageData, null, toastrService);
		this.getModule();
		this.add_img_index();
	}

	ngOnInit() {
		switch (this.environment?.configEnv) {
			case 'staging':
				this.envname = 'Staging Environment';
				break
			case 'development':
				this.envname = 'Dev Environment';
				break;
			case 'production':
				this.envname = '';
				break;
			case 'local':
				this.envname = 'Local Environment';
				break;
			default:
				this.envname = 'Dev Environment';
				break;
		}
		this.facilityitem = this.storageData.getFacilityLocations();
		const login_userDetail = JSON.parse(localStorage.getItem('user-Info'));
		this.authenticated_user_detail = JSON.parse(localStorage.getItem('cm_data'));
		if (login_userDetail) {
			this.first_name = login_userDetail.first_name;
			this.middle_name = login_userDetail.middle_name;
			this.last_name = login_userDetail.last_name;
			this.profileImage = login_userDetail.profile_pic_url;
		}
		let data = {user_id: this.authenticated_user_detail?.user_id};
		this.socket.emit('TASKSTATUSROOM', data);
		this.connectionService.monitor().subscribe(isConnected => {
			if (isConnected) {
				this.offline = false;
			}
			else {
				this.offline = true;
			}
		})
		this.page.size =  10;
		this.page.pageNumber = 1;
		let dateString = new Date();
		let date = new Date(dateString);
		let month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based, so add 1
		let day = date.getDate().toString().padStart(2, '0');
		let year = date.getFullYear();
		let formattedDate = month + '-' + day + '-' + year;
		this.today = formattedDate;
		let yesterday = new Date(date);
		yesterday.setDate(yesterday.getDate() - 1);
		let yesterdayMonth = (yesterday.getMonth() + 1).toString().padStart(2, '0');
		let yesterdayDay = yesterday.getDate().toString().padStart(2, '0');
		let yesterdayYear = yesterday.getFullYear();
		let formattedYesterday = yesterdayMonth + '-' + yesterdayDay + '-' + yesterdayYear;
		this.yesterday = formattedYesterday;
		this.subcription.push(this.socket.fromEvent('TASKSTATUS').subscribe((socData:any)=>{
			if(socData) {
				this.showBadge = true;
				const offsetMinutes = new Date().getTimezoneOffset();
				const serverStartTime = socData?.created_at;
				const serverStartDate = new Date(serverStartTime);
				const localStartTime = new Date(serverStartDate.getTime() - (offsetMinutes * 60 * 1000));
				socData['startTime'] = localStartTime.toLocaleString();
				const serverCompletedTime = socData?.updated_at;
				const serverCompletedDate = new Date(serverCompletedTime);
				const localCompletedTime = new Date(serverCompletedDate.getTime() - (offsetMinutes * 60 * 1000));
				socData['completedTime'] = localCompletedTime.toLocaleString();
				if(socData?.created_at?.split(' ')[0] === this.today) {
					if(this.todayData?.length) {
						let i = this.todayData.findIndex(key => key?.id == socData?.id);
						if(i != -1) {
							this.todayData[i] = socData;
						}
						else {
							this.todayData.unshift(socData);
						}
					}
					else {
						this.todayData.push(socData);
					}
				}
				else if(socData?.created_at?.split(' ')[0] === this.yesterday) {
					if(this.yesterdayData?.length) {
						let i = this.yesterdayData.findIndex(key => key?.id == socData?.id);
						if(i != -1) {
							this.yesterdayData[i] = socData;
						}
						else {
							this.yesterdayData.unshift(socData);
						}
					}
					else {
						this.yesterdayData.push(socData);
					}
				}
				else {
					if(this.olderData?.length) {
						let i = this.olderData.findIndex(key => key?.id == socData?.id);
						if(i != -1) {
							this.olderData[i] = socData;
						}
						else {
							this.olderData.unshift(socData);
						}
					}
					else {
						this.olderData.push(socData);
					}
				}
				this.tasklist();
			}
		}))
	}

	notificationsList() {
		this.showBadge = false;
	}

	onScroll() {
		if(this.lastPage <= this.page.pageNumber) {
			return false;
		}
		const container = this.elementRef.nativeElement.querySelector('.notification-bar');
		if (container.scrollTop + container.clientHeight >= container.scrollHeight) {
		  	this.page.pageNumber++;
		  	this.tasklist();
		}
	}

	onDownload(link) {
		const fileUrl = link;
		const file_link: any = document.createElement('a');
		file_link.href = fileUrl;
		if (fileUrl.includes('.csv')) {
			file_link.click();
		}
		else {
			window.open(file_link, '_blank');
		}
	}

	initLocationSettings() {
		this.facilites = [];
		this.getPracticesDropDownData();
		this.facilityitem = this.storageData.getFacilityLocations();
		this.btnGo = false;
		this.locationIcon = !this.locationIcon;
	}
	getModule() {
		let user = this.localstorage.getObject('user');

	}
	toggleCheck(facilityId) {
		(this.facilityitem.includes(facilityId)) ? removeArrayItem(this.facilityitem, facilityId) : this.facilityitem.push(facilityId);
		if (this.facilityitem && !this.facilityitem.length) {
			this.currentSimiler = []
			return;
		}
		this.currentSimilarPermissions(this.facilityitem);
		if (this.facilityitem.every(item => { return item == null || item == undefined })) {
			this.currentSimiler = []
		}
	}

	tasklist() {
		if(this.lastPage <= this.page.pageNumber) {
			this.page.pageNumber = 1;
			this.page.size = this.totalItems;
		}
		let paramQuery: any = { 
			filter: true, 
			pagination: 1,
			page: this.page.pageNumber,
			per_page: this.page.size,
			order_by: 'DESC',
		}
		this.requestService
			.sendRequest(
				AppointmentUrlsEnum.gettasklists,
				'get',
				REQUEST_SERVERS.fd_api_url,
				paramQuery
			)
			.subscribe((res) => {
				this.notificationDetails = res?.result?.data;
				this.lastPage = res?.result?.last_page;
				this.totalItems = res?.result?.total;
				this.notificationDetails.forEach(notification => {
					const offsetMinutes = new Date().getTimezoneOffset();
					const serverStartTime = notification?.created_at;
					const serverStartDate = new Date(serverStartTime);
					const localStartTime = new Date(serverStartDate.getTime() - (offsetMinutes * 60 * 1000));
					notification['startTime'] = localStartTime.toLocaleString();
					const serverCompletedTime = notification?.updated_at;
					const serverCompletedDate = new Date(serverCompletedTime);
					const localCompletedTime = new Date(serverCompletedDate.getTime() - (offsetMinutes * 60 * 1000));
					notification['completedTime'] = localCompletedTime.toLocaleString();
					if(notification?.created_at?.split(' ')[0] === this.today) {
						if(this.todayData.length) {
							let i = this.todayData.findIndex(key => key?.id == notification?.id);
							if(i != -1) {
								this.todayData[i] = notification;
							}
							else {
								this.todayData.push(notification);
							}
						}
						else {
							this.todayData.push(notification);
						}
					}
					else if(notification?.created_at?.split(' ')[0] === this.yesterday) {
						if(this.yesterdayData.length) {
							let i = this.yesterdayData.findIndex(key => key?.id == notification?.id);
							if(i != -1) {
								this.yesterdayData[i] = notification;
							}
							else {
								this.yesterdayData.push(notification);
							}
						}
						else {
							this.yesterdayData.push(notification);
						}
					}
					else {
						if(this.olderData.length) {
							let i = this.olderData.findIndex(key => key?.id == notification?.id);
							if(i != -1) {
								this.olderData[i] = notification;
							}
							else {
								this.olderData.push(notification);
							}
						}
						else {
							this.olderData.push(notification);
						}
					}
				})
				// this.todayData = this.todayData.filter((item, index, self) =>
				// 	index === self.findIndex((i) => i?.id === item?.id && i?.status === item?.status)
				// );
				// this.yesterdayData = this.yesterdayData.filter((item, index, self) =>
				// 	index === self.findIndex((i) => i?.id === item?.id && i?.status === item?.status)
				// );
				// this.olderData = this.olderData.filter((item, index, self) =>
				// 	index === self.findIndex((i) => i?.id === item?.id && i?.status === item?.status)
				// );
			},
			err=>{
							
			});
	}
	
	checkCurrentSimilar(event) {
		const value = event.target.checked
		if (this.storageData.isSuperAdmin()) {
			if (value && this.facilites && this.facilites.facility_locations && this.facilites.facility_locations.length != 0) {
				this.facilites.facility_locations.forEach(location => {
					if (!this.facilityitem.includes(location.id)) {
						this.facilityitem.push(location.id)
					}
				})
			}
			else {
				this.facilityitem = []
			}
			return;
		}

		this.currentSimiler.forEach(similar => {
			if (!this.facilityitem.includes(similar)) {
				this.facilityitem.push(similar)
			} else {
				this.facilityitem = this.facilityitem.filter(facility => {
					return facility != similar
				})
			}
			if (this.facilityitem.every(item => { return item == null || item == undefined })) {
				this.currentSimiler = []
			}
		})
	}

	logout() {
		;
		if (getObjectChildValue(this.route, false, ['snapshot', 'firstChild', 'data', 'revokeLogout'])) {
			this.toastrService.warning("Please complete or finalize current visit before signing out!", 'Caution!');
		} else {
			this.authService.logout().subscribe(resp => {
				this.storageData.clear();
				this.router.navigate(['login']);
			});
		}
	}
	navigateToMainPage() {
		const analyticsPermissions : any = this.storageData.getAnalyticsPermission()
		if(analyticsPermissions){
			if (this.storageData.getRoleSlug() == RoleType.PracticeManager) {
				this.storageData.setDashboardNavigation('practice_manager')
				this.router.navigate(['analytics/practice-manager/dashboard']);
			}
			else if (this.storageData.isDoctor() === true && this.storageData.canFinalize() === true) {
				this.storageData.setDashboardNavigation('provider')
				this.router.navigate(['analytics/provider/dashboard']);
			} 
			else if (analyticsPermissions.dashboard_type?.length !== 0 ) {
				this.storageData.setDashboardNavigation('admin')
				this.router.navigate(['analytics/admin/dashboard']);
			} 
			else {
				this.router.navigate(['front-desk']);
			}
			} else {
				this.router.navigate(['front-desk']);
			}
	}
	chooseFacility() {
		debugger;
		this.ngbModal.open(ChooseFacilityComponent, { backdrop: 'static' })
	}

	ClickBtnGo() {
		this.btnGo = true;
		this.locationIcon = false;
		this.storageData.deleteSchedulerInfo();
	}

	openTimeModal() {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc overflow_unset',
		};

		this.modalRef = this.modalService.open(TimeZoneModalComponent, ngbModalOptions);
	}

	areSimilarSelected() {
		if (this.storageData.isSuperAdmin()) {
			let bool = this.facilites && this.facilites.facility_locations && this.facilites.facility_locations.length != 0 ? this.facilites.facility_locations.every(location => {
				return this.facilityitem.includes(location.id)
			}) : false
			return bool;
		} else {
			if (this.currentSimiler && this.currentSimiler.length != 0) {
				let bool = this.currentSimiler.every(item => {
					return this.facilityitem.includes(item)
				}) && !this.facilityitem.every(item => {
					return item == null || item == undefined
				})
				return bool;
			}
		}
	}

	shouldDisableMasterToggle() {
		return this.currentSimiler.length == 0 && !this.storageData.isSuperAdmin()
	}
	add_img_index() {
		const caption = 'caption';
		const thumb = 'thumb.jpg';
		if (JSON.parse(localStorage.getItem('cm_data')) && JSON.parse(localStorage.getItem('cm_data')).basic_info) {
			const album: any = {
				src: JSON.parse(localStorage.getItem('cm_data')) ? JSON.parse(localStorage.getItem('cm_data')).basic_info.profile_pic_url : undefined,
				caption: JSON.parse(localStorage.getItem('cm_data')) ? JSON.parse(localStorage.getItem('cm_data')).basic_info.first_name + ' ' + JSON.parse(localStorage.getItem('cm_data')).basic_info.last_name : undefined,
				thumb: thumb
			};
			this._albums.push(album);
		}
	}

	GoPath() {
		let ID = JSON.parse(localStorage.getItem('cm_data')).basic_info.id;
		this.userInfoChangeService.isClickedOnUserPic.next({ action: true, id: ID });
		this.router.navigate([`front-desk/masters/users/creation/edit/${ID}/basic-info`]);

	}
}
