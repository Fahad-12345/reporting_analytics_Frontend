import { AutofillMonitor } from '@angular/cdk/text-field';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from "@angular/router";
import { AnalyticsService } from '@appDir/analytics/analytics.service';
import { AnalyticsUrlsEnum } from '@appDir/analytics/helpers/analytics_Urls_enum';
import { RoleType } from '@appDir/analytics/helpers/role.enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { Menu } from '@appDir/shared/layouts/navbar/navbar.model';
import { RequestService } from '@appDir/shared/services/request.service';
import { getObjectChildValue, removeEmptyAndNullsFormObject } from '@appDir/shared/utils/utils.helpers';
import { NgProgressRef } from 'ngx-progressbar';
import { ToastrService } from 'ngx-toastr';
import { Subscription, catchError, map, throwError } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { AuthService } from "../../../shared/auth/auth.service";
import { LogInUrlsEnum } from './logIn-Urls-Enum';
import { HttpSuccessResponse, StorageData } from './user.class';
@Component({
	selector: 'app-login-page',
	templateUrl: './login-page.component.html',
	styleUrls: ['./login-page.component.scss']
})

export class LoginPageComponent implements OnInit ,OnDestroy{
	public menu: Menu[] = [];
	@ViewChild('ngProgress') ngProgress:NgProgressRef;
	@ViewChild('passwordInputElement') passwordInputElement: ElementRef<HTMLInputElement>;
	@ViewChild('loginBtn') loginBtn: ElementRef<HTMLButtonElement>;
  
	loginForm: FormGroup;
	loadSpin: boolean = false;
	passwordShow = false;
	autoFillSubscription:Subscription= new Subscription();
	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private authService: AuthService,
		protected requestService: RequestService,
		private storageData: StorageData,
		private toasterService: ToastrService,
		private _autofill:AutofillMonitor,
		private analyticsService: AnalyticsService,
	) {
		if (this.authService.isAuthenticated()) {
			this.router.navigate(['front-desk']);
		}

	}
// 	ngOnInit() {
// 		this.loginForm = new FormGroup({
// 			'email': new FormControl(null, [Validators.required, Validators.email]),
// 			'password': new FormControl(null, [Validators.required, Validators.minLength(1), Validators.maxLength(24)])
// 		});
// 	}

// 	ngAfterViewInit(): void {
//       this.autoFillSubscription.add(this._autofill.monitor(this.passwordInputElement).subscribe((event) => {
//           if (event.isAutofilled) {
//             this.loginBtn.nativeElement.disabled = false;
//           }
//         }));
//   }

ngOnInit() {
    // Remove form validation for email and password
    this.loginForm = new FormGroup({
        'email': new FormControl(null),  // No validation on email
        'password': new FormControl(null)  // No validation on password
    });
}

ngAfterViewInit(): void {
    // Remove or comment out the autofill subscription logic
    // You can keep this part if you still want autofill functionality.
    // If you want to remove it, just comment or delete it.
    this.autoFillSubscription.add(this._autofill.monitor(this.passwordInputElement).subscribe((event) => {
        if (event.isAutofilled) {
            this.loginBtn.nativeElement.disabled = false;
        }
    }));
}


  ngOnDestroy(): void {
	this.autoFillSubscription?.unsubscribe();
  }


	isLoginDisable = false;
	
	onSubmit() {
		this.ngProgress.start();
		this.isLoginDisable = true;
		this.requestService.sendRequest(LogInUrlsEnum.LogIn_POST, 'POST', REQUEST_SERVERS.fd_api_url, this.loginForm.value).subscribe(async (res: HttpSuccessResponse) => {
			if (res['status']) {
				this.storageData.updateLocalStorageData(getObjectChildValue(res, '', ['result', 'data']));
				this.isLoginDisable = false;
				// await this.getAnalyticsPermissions();
				if (this.storageData.getFacilityLocations().length) {
					let paramQuery = {
						user_id: this.storageData.getUserId(),
						// token: this.storageData.getToken(),

					}
					paramQuery['speciality_id'] = (this.storageData.getSpecialityId()) ? this.storageData.getSpecialityId() : null;

					this.requestService.sendRequest(LogInUrlsEnum.User_Permissions_GET, 'GET', REQUEST_SERVERS.fd_api_url, removeEmptyAndNullsFormObject(paramQuery))
						.subscribe((responce: HttpSuccessResponse) => {
							this.storageData.setPermissions(getObjectChildValue(responce, '', ['result', 'data', 'permissions ']));
							// this.socket.emit("join_room",  this.storageData.getUserId());

							this.router.navigate(['front-desk']);
						}, err => {
							this.storageData.clear();
						}
						);
				} else {
					this.router.navigate(['front-desk']);
				}

			}
			else {
				this.ngProgress.complete();
				this.isLoginDisable = false;
			}

		}, err => {
			this.ngProgress.complete();
			this.isLoginDisable = false;
			this.storageData.clear();
		});
	}
	getAnalyticsPermissions() {
		const userId = this.storageData.getUserId();
		const userObject = { user_id: userId };
	
		return new Promise((resolve, reject) => {
			const timeoutDuration = 4000; 
			const apiCallObservable = this.analyticsService.post(AnalyticsUrlsEnum.permissions, userObject);

			const timeoutObservable = apiCallObservable.pipe(
				timeout(timeoutDuration),
				catchError(error => {
					console.error('Timeout Error:', error);
					return throwError('Timeout occurred');
				})
			);
			// Subscribe to the observable
			timeoutObservable.subscribe(
				(response) => {
					const permissions = response.result.data;
					if (permissions) {
						this.storageData.setAnalyticsPermission(permissions);
						resolve(true);
					} else {
						resolve(false);
					}
				},
				(error) => {
					console.error('Error fetching Analytics Permission Data:', error);
					resolve(false);
				}
			);
		});
	}
	

	getMainmenu() {
		this.loadSpin = false;
		this.ngProgress.start();
		let paramQuery = {

			facility_location_id: this.storageData.getFacilityLocations_ids()[0],

		}
		return this.requestService.sendRequest(LogInUrlsEnum.DynamicMenu, 'Get', REQUEST_SERVERS.fd_api_url, paramQuery)
		.pipe(
		map(response => {
			this.ngProgress.complete();
			this.loadSpin = false;
			// this.case = null;
		  //   delete this.data[route]
			return response;
		  }));
		//   .catch((err: HttpErrorResponse) => {
		// 	this.progressRef.complete();
		// 	// this.loadSpin = false;
		// 	this.toasterService.error(err.error.message, 'Error')
		// 	return throwError(err)
		//   });
	}

	// On Forgot password link click
	onForgotPassword() {
		this.router.navigate(['forgotpassword'], { relativeTo: this.route.parent });
	}
	// On registration link click
	onRegister() {
		this.router.navigate(['register'], { relativeTo: this.route.parent });
	}

	passwordAction() {
		this.passwordShow = !this.passwordShow;
	}
}
