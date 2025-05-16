import {
	Component,
	OnInit,
	ViewChild,
	ViewChildren,
	QueryList,
	Input,
	OnDestroy,
	OnChanges,
} from '@angular/core';
import { MainService } from '@shared/services/main-service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { FDServices } from 'app/front-desk/fd_shared/services/fd-services.service';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { UserFormComponent } from '@appDir/front-desk/fd_shared/components/user-form/user-form.component';
// import { UserPrivilegesComponent } from '../components/user-privileges/user-privileges.component';
import { HttpService } from '@appDir/front-desk/fd_shared/services/http.service';
import { UMResponse } from '../../../models/um.response.model';
import { User, UserProfile } from '../../models/user.model';
import { data } from '@appDir/shared/layouts/navbar/dump';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { Subscription, Observable } from 'rxjs';
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { UserRelatedData } from '@appDir/front-desk/masters/master-users/users/models/user.model';
import { HttpSuccessResponse, StorageData } from '@appDir/pages/content-pages/login/user.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { UsersUrlsEnum } from '@appDir/front-desk/masters/master-users/users/users-urls.enum';
import { RequestService } from '@shared/services/request.service';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclRedirection } from '@shared/services/acl-redirection.service';
import { AclService } from '@shared/services/acl.service';
import { RoleChangeServiceService } from '@appDir/front-desk/masters/master-users/users/services/role-change-service.service';
// import { UserInfoChangeService } from '../services/user-info-change.service';
import { UserInfoChangeService } from '../../services/user-info-change.service';
import { ErxService } from '@appDir/front-desk/masters/erx/erx.service';
@Component({
	selector: 'app-id-proofing',
	templateUrl: './id-proofing.component.html',
})
export class IdProofingComponent extends PermissionComponent implements OnInit {
	isDisableManageAccountBtn = false;
	isShowManageAccountBtn = false;
	// isManageAccountBtn = false;
	constructor(
		public router: Router,
		aclService: AclService,
		protected activatedRoute: ActivatedRoute,
		private erxService:ErxService

	) { 
		super(aclService, router);
		this.erxService.isUserStatusActive.subscribe(result => {
			this.isShowManageAccountBtn = result;
			console.log(this.isShowManageAccountBtn);
		})
	}

	ngOnInit() {
		//   this.setRouterParamsPermission();
	}
	navigate(path) {
		// this.router.navigate([`front-desk/masters/users/creation/edit/${this.activatedRoute.snapshot.params['id']}/${path}/id-proofing/${path}`]);
	}
	manageAccount() {
		// MOVE TO URL COMMIN IN API
			let queryParams = {
				return_url: window.location.href
			}
			this.isDisableManageAccountBtn = true;
			this.subscription.push(
				this.erxService.launchSession(queryParams).subscribe((launchSession: any) => {
					if (launchSession.status) {
						this.isDisableManageAccountBtn = false;
						window.open(launchSession.result.path, "_blank");
					}
				},
					(error) => {
						this.isDisableManageAccountBtn = false;
					})
			);

	}
}
