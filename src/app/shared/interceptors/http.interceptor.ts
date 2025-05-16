import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { map, Observable, tap} from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Config } from '@appDir/config/config';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { environment } from 'environments/environment';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

	environment = environment;
	constructor(private authenticationService: AuthService, private toasterService: ToastrService, private router: Router, private config: Config, private storageData: StorageData,
		public modalService: NgbModal,
		) {
	}



	intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		let urlParse = request.url.includes('erx-staging.ovadamd.org');
		if  (urlParse && this.environment && this.environment.removeUnusedCode){
			return;
		}
		let token = this.storageData.getToken();
		if (token) {
			request = request.clone({
				headers: request.headers.set('Authorization', 'Bearer ' + token)
			});
			
		}
		return next.handle(request)
		.pipe(map((event: HttpEvent<any>) => {
				if (event instanceof HttpResponse) {
					
				}
				return event;
			})).pipe(tap((event: HttpResponse<any>) => {
				if (event.body && event.body.status != null && !(event.body.status == 200 || event.body.status == true) && !event['body']['delete']) {
					this.toasterService.error(event.body.message || 'Invalid response from server!', 'Error' );

				}
			}
			, (error: any) => {
				if (error instanceof HttpErrorResponse) {
					if (error.status === 401 || error.status === 403) {
						this.storageData.clear();
						// this.authenticationService.logout();
						this.modalService.dismissAll();
						var toast = this.toasterService.error('Login session expired! Please log in again.<br /> -The session will automatically expire after one hour of inactivity.<br /> -System allows a maximum of two active sessions at a time.','',{ enableHtml: true});
						toast.onHidden.subscribe(() => {
							this.router.navigate(['login']);
						});

					} else {
						if (error.status != 200 && error.status != 500 && error.status != 0) {
							if (error.error instanceof ProgressEvent) {
								this.toasterService.error(this.parseHttpErrorResponseObject(error.message),'Error');
							} else if (!error?.error?.is_duplicate && error?.error?.result!=false) {
								if (error?.error?.message)
								{
									this.toasterService.error(this.parseHttpErrorResponseObject(error?.error?.message),'Error');
								}
								else{
								this.toasterService.error(this.parseHttpErrorResponseObject(error?.error?.errors ? error?.error?.errors : error?.error?.message),'Error');
								}							
							}
							else{
								this.toasterService.error(this.parseHttpErrorResponseObject(error?.error?.errors ? error?.error?.errors?.message : error?.error?.message),'Error');
							}
						}
					}
				} else if (error.error instanceof ErrorEvent) {
					this.toasterService.error(error.error.message,'Error');
				}
			}));
	}

	parseHttpErrorResponseObject(error) {
		let errorString = '';
		if (Array.isArray(error)) {
			error.forEach((er, index) => {
				index < error.length - 1 ? errorString += er + '. ' + '\n' : errorString += er + '\n';
			});
		} else {
			errorString = error;
		}
		return errorString;
	}
}

export interface ResponseModel {
	error: {};
}
