import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Dashboard, RoleType } from '@appDir/analytics/helpers/role.enum';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { AuthService } from '@appDir/shared/auth/auth.service';

@Component({
  selector: 'app-dashboard-switch',
  templateUrl: './dashboard-switch.component.html',
  styleUrls: ['./dashboard-switch.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class DashboardSwitchComponent {
  @Input() checkedButton: Dashboard = Dashboard.Admin;
  logedInUserType: string;
  userType = RoleType;
  dashboard = Dashboard;
  isUserAdmin : Boolean  = false;
  isUserDoctor: Boolean = false;
  constructor(private authService: AuthService,private router: Router,private storageData: StorageData,) {

  }
  ngOnInit(): void {

    this.isUserDoctor = this.storageData.isDoctor();
    this.logedInUserType = this.authService.getUserType();
    const analyticsPermissions : any = this.storageData.getAnalyticsPermission();
    if(analyticsPermissions){
    if (analyticsPermissions.dashboard_type?.length !== 0 ) {
      this.isUserAdmin = true;
    } else {
      this.isUserAdmin = false
    }
  }
  }
  navigateToDashboard(dashboardType : number): void {
    if(dashboardType == Dashboard.Provider){ 
      this.storageData.setDashboardNavigation('provider')
      this.router.navigate(['analytics/provider/dashboard']);
    }
    else if (dashboardType == Dashboard.PracticeManager){
      this.storageData.setDashboardNavigation('practice_manager')
      this.router.navigate(['analytics/practice-manager/dashboard']);
    } 
    else if(dashboardType == Dashboard.Admin){
      this.storageData.setDashboardNavigation('admin')
      this.router.navigate(['analytics/admin/dashboard']);
      }
  }
}
