import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AclRedirection } from '../shared/services/acl-redirection.service';

import { AclServiceCustom } from '@appDir/acl-custom.service';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { LocalStorage } from '@appDir/shared/libs/localstorage';

@Injectable()
export class AclResolverService implements Resolve<any> {

	constructor(
		public aclService?: AclServiceCustom,
		public router?: Router,
		public aclRedirection?: AclRedirection,
		public localStorage?: LocalStorage,
		public storageData?: StorageData
	) {
	}

	resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
		const reportTitle = route?.children[0]?.data?.title;
		if(reportTitle == 'Denial Report' || reportTitle == 'Payment Report' || reportTitle == 'A/R Report'){
			const analyticsPermissions : any = this.storageData.getAnalyticsPermission()
			if(reportTitle == 'Denial Report'){
				if(!(analyticsPermissions.report_type.includes('*') || analyticsPermissions.report_type.includes('denial'))){
					this.aclRedirection.redirectTo('Unauthorized');
				}
			}else if(reportTitle == 'Payment Report'){
				if(!(analyticsPermissions.report_type.includes('*') || analyticsPermissions.report_type.includes('payment'))){
					this.aclRedirection.redirectTo('Unauthorized');
				}
			}else if(reportTitle == 'A/R Report'){
				if(!(analyticsPermissions.report_type.includes('*') || analyticsPermissions.report_type.includes('ar'))){
					this.aclRedirection.redirectTo('Unauthorized');
				}
			}
		}
		if (this.storageData.isSuperAdmin()) {
			return of(true);
		}
		if (route && route.firstChild && route.firstChild.firstChild && route.firstChild.firstChild.data) {

			if (route.firstChild.firstChild.component != null || route.firstChild.firstChild.component != undefined) {
				if (this.aclService.can(route.firstChild.firstChild.data.permission)) {
					return of(true);
				}
				else {
					this.aclRedirection.redirectTo('Unauthorized');
				}
			}
			else {
				if (route.firstChild && route.firstChild.firstChild && route.firstChild.firstChild.firstChild && route.firstChild.firstChild.firstChild.data) {
					if (this.aclService.can(route.firstChild.firstChild.firstChild.data.permission)) {
						return of(true);
					}
					else {
						this.aclRedirection.redirectTo('Unauthorized');
					}
				}
			}
		}
		else {
			if (route.firstChild && route.firstChild.data) {
				if (this.aclService.can(route.firstChild.data.permission)) {
					return of(true);
				}
				else {
					if (route.firstChild.data.permission == 'loginDefault') {
						return of(true);
					}
					else {
						this.aclRedirection.redirectTo('Unauthorized');
					}
				}
			}
			else {
				if (this.aclService.can(route.data.permission)) {
					return of(true);
				}
				else {
					this.aclRedirection.redirectTo('Unauthorized');
				}
			}
		}
	}
}
