import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RoleType } from '@appDir/analytics/helpers/role.enum';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { AuthService } from '@appDir/shared/auth/auth.service';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { setDefaultTimeZone } from '@appDir/shared/utils/utils.helpers';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MainService } from '@shared/services/main-service';
import { ChooseFacilityComponent } from '../components/choose-facility/choose-facility.component';


@Component({
		selector: 'app-dashboard',
		templateUrl: './dashboard.component.html',
		styleUrls: ['./dashboard.component.scss']
	})

	export class DashboardComponent implements OnInit {
			showModal: boolean = true;

	constructor(private mainService: MainService, private storageData: StorageData, private router: Router, private authService: AuthService, private localstorage: LocalStorage, private ngbModal: NgbModal,
	public titleService: Title) {
	
	 }
	
	ngOnInit() {
		this.titleService.setTitle('Ovada');
		
				this.mainService.setLeftPanel({});
				if (!this.storageData.getFacilityLocations().length && this.storageData.getUserId()!=0) {
					var modalRef = this.ngbModal.open(ChooseFacilityComponent, { backdrop: 'static' })
					modalRef.result.then((res) => {
						// this.logout()
	
					})
		
				}
				else {
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
				if (!this.storageData.getUserTimeZone()) {
					this.storageData.setUserTimeZone(setDefaultTimeZone())
		
				}
	
			}

		}

