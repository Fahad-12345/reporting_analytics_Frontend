
import { CanActivate, Router, ActivatedRoute, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { MDParams } from '../../mdparams';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class MedicalDoctorGuardService implements CanActivate {

  constructor(
    public router: Router,
    protected route: ActivatedRoute,
    protected toastrService: ToastrService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    
    let params = route.queryParams;
    if (params.caseId && params.doctorId && params.finalize_visit && params.id && params.patientId && params.visitType) {
      return true;
    }
    this.router.navigate(['scheduler-front-desk/doctor-calendar']);
  }
}

