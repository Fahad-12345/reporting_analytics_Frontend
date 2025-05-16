import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { Config } from "@appDir/config/config";
@Injectable({
  providedIn: 'root'
})
export class ErxService {
  // url: any = 'https://erx-staging.ovadamd.org';
  url: any = '';
  // https://cm.backup.ovadamd.org/api/node/erx
  exUrl: any = '';
  // http://erx-staging.ovadamd.org   // Staging server
  // url: any ='http://172.16.63.42:3000'   //Local server
  taskid: any = '';
  redirectfrom: any = '';
  med_id: any = [];
  data: any = {}
  action: any;
  actionObj: any;
  erxCheck: any = 0;
  updated:boolean=false;
  denyChange:boolean=false;
  neededReadySign=0;
  prevDeniedRefill=0;
  readySigned:boolean=false;
  constructor(public http: HttpClient, private config: Config) {
    this.url = this.config.getConfig(REQUEST_SERVERS.erx_api_url).slice(0, -1);
    this.exUrl = this.config.getConfig(REQUEST_SERVERS.erx_fd_api).slice(0, -1);
   }
  public getmedicine(token, body, type) {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.http.post(this.url + '/get-' + type + '-medicine', body, { headers })
  }

  public cancelRx(body) {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.http.post(this.url + '/cancel', body, { headers })
  }

  public getClinicalQuantity(body) {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.http.post(this.url + '/get-clinical-quantity', body, { headers })
  }
  public print(body) {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.http.post(this.url + '/print-erx', body, { headers, responseType: 'blob' })
  }

  public printSave(body) {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.http.post(this.url + '/print-erx', body, { headers})
  }
  public getDrugSchedule() {
    return this.http.get(this.exUrl + '/api/erx/dea-schedule-code/show');
  }
  public query(body) {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.http.post(this.url + '/exostar-sotp-signature-query', body, { headers })
  }

  public cancelQuery(body) {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.http.post(this.url + '/exostar-sotp-signature-cancel', body, { headers })
  }

  public getFavMedicine(body) {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.http.post(this.url + '/get-fav-med', body, { headers })
  }
  public getreactions(token, body) {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.http.post(this.url + '/get-reactions', body, { headers })
  }
  public getallergies(token, body) {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.http.post(this.url + '/get-allergies', body, { headers })
  }
  public getmedicinexanox(token, body) {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.http.post(this.url + '/get-medicine', body, { headers })
  }
  public favmed(token, body) {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.http.post(this.url + '/get-fav-med', body, { headers })
  }
  public favCheck(body) {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.http.post(this.url + '/check-fav-med', body, { headers })
  }
  public tasklist(token, body) {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.http.post(this.url + '/task-list', body, { headers })
}

  public tasklogExport(token, body) {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.http.post(this.url + '/task-log', body,{ responseType: 'text' });
  }
  
  public ActivitylogExport(token, body) {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.http.get(this.url+'/audit-log-report' + body, { responseType: 'text' });
  }

  public EventlogExport(token, body) {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.http.get(this.url+'/prescription-events-log' + body, { responseType: 'text' });
  }
  
  public tasklog(token, body) {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.http.post(this.url + '/task-log', body, { headers })
  }
  public taskdetail(token, body) {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.http.post(this.url + '/task-detail', body, { headers })
  }
  public taskdelete(token, body) {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.http.post(this.url + '/task-delete', body, { headers })
  }
  public labelwarning(token, body) {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.http.post(this.url + '/get-label-warnings', body, { headers })
  }
  public drugpricing(token, body) {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.http.post(this.url + '/get-drug-pricing', body, { headers })
  }
  public counselingmessage(token, body) {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.http.post(this.url + '/get-counseling-messages', body, { headers })
  }
  public patienteducation(token, body) {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.http.post(this.url + '/get-patient-education', body, { headers })
  }
  public addtodraft(token, body) {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.http.post(this.url + '/add-draft', body, { headers })
  }
  public senderx(token, body) {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.http.post(this.url + '/send-erx', body, { headers })
  }
  public taskmeddelete(token, body) {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.http.post(this.url + '/task-med-delete', body, { headers })
  }
  public getSig(token, body) {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.http.post(this.url + '/get-sig', body, { headers })
  }
  public getAlerts(token, body) {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.http.post(this.url + '/get-alerts', body, { headers })
  }
  public approve(body) {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.http.post(this.url + '/approve-refill', body, { headers })
  }
  // not needed  no controlled substance
  public approveChange(body) {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.http.post(this.url + '/approve-with-changes-refill', body, { headers })
  }
  // needed
  public approveRx(body) {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.http.post(this.url + '/approve-rxchange', body, { headers })
  }
  // not needed
  public approvePrior(body) {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.http.post(this.url + '/approve-prior-auth', body, { headers })
  }
  // needed
  public approveChangeRx(body) {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.http.post(this.url + '/approve-with-changes-rxchange', body, { headers })
  }
  // needed
  public denyRx(body) {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.http.post(this.url + '/deny-rxchange', body, { headers })
  }
// done
  public replace(body) {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.http.post(this.url + '/replace-refill', body, { headers })
  }
  public deny(body) {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.http.post(this.url + '/deny-refill', body, { headers })
  }
  public validatePrescriberAuth(body) {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.http.post(this.url + '/validate-prescriber-auth', body, { headers })
  }

  public prescriptionEventLogs(body) {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.http.post(this.url + '/prescription-events-log', body, { headers })
  }
  public checkDaySupply(body) {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.http.post(this.url + '/check-day-supply', body, { headers })
  }
  public verifyOtp(body)
  {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.http.post(this.url + '/verifyOtp', body, { headers })
  }
  

}
