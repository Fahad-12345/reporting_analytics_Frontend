import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { LocalStorage } from '@shared/libs/localstorage';
import { AuthService } from './auth.service';
import { DashboardTypes } from '@appDir/analytics/helpers/role.enum';

@Injectable({
  providedIn: 'root'
})
export class RoleGuardService {
  targetedDashboard : string = '';

  constructor(public auth: AuthService, public router: Router, private localStorage: LocalStorage, private storageData : StorageData) {
   }
  
  canActivate(route: ActivatedRouteSnapshot): boolean {
    // this will be passed from the route config
    // on the data property
    this.targetedDashboard = this.storageData.getDashboardNavigation();
    const expectedRole = route.data.expectedRole;
    if(expectedRole == 'provider'){
      const isUserDoctor: Boolean = this.storageData.isDoctor();
      if(!this.auth.isAuthenticated() || (!isUserDoctor && this.targetedDashboard != DashboardTypes.Provider)){
        this.router.navigate(['login']);
        return false;
      } 
      return true;
    }
    if(expectedRole == 'practice_manager'){
      if(!this.auth.isAuthenticated() && this.targetedDashboard != DashboardTypes.PracticeManager){
        this.router.navigate(['login']);
        return false;
      } 
      return true;
    }
    if(expectedRole === 'super_admin'){
      const adminPermission: any = this.storageData.getAnalyticsPermission()
      if(adminPermission){
      if(!this.auth.isAuthenticated() || !(adminPermission.dashboard_type.includes('*') || adminPermission.dashboard_type.includes('admin'))){
        if(!this.auth.isAuthenticated()){
        this.router.navigate(['login']);
        return false;
        } else if(this.auth.isAuthenticated()) {
          this.router.navigate(['front-desk'])
          return false;
        }
      } 
      return true;
      } else {
        if (!this.auth.isAuthenticated()) {
          this.router.navigate(['login']);
          return false;
        }
        this.router.navigate(['front-desk'])
        return false;
      }
      }
    const token = this.localStorage.getObject('data')['token'];
    if(this.auth.isAuthenticated()){
      this.router.navigate(['front-desk'])
    }
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['login']);
      return false;
    }
        return true;
        }
}