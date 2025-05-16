import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { ConfirmPasswordModalComponent } from '../confirm-password-modal/confirm-password-modal.component';
import { RouterLoaderServiceService } from '@appDir/medical-doctor/services/router-loader-service.service';

@Injectable({
  providedIn: 'root'
})
export class CanActivateLoginInformationService implements CanActivate {

  constructor(private modalService: NgbModal , private routerloaderService:RouterLoaderServiceService) {

  }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    let modalRef = this.modalService.open(ConfirmPasswordModalComponent)
	this.routerloaderService.isNavigationPending.next(false)
    return modalRef.result;
    // return false;
  }
}
