
// http://localhost:4000/front-desk/masters/billing/insurance
//hits above url 

import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class MasterBillingInsuranceService {

  constructor(private http: HttpClient) { }

  getInsuranceBilling():Observable<any>{
    return 
  }
}
