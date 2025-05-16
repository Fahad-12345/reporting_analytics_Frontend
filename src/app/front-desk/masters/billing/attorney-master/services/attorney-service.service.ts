import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { Config } from '@appDir/config/config';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';


@Injectable({
  providedIn: 'root'
})
export class AttorneyAPIServiceService {

  constructor(private http: HttpClient, private config: Config, private storageData: StorageData) { }

  private readonly baseUrl = this.config.getConfig(REQUEST_SERVERS.fd_api_url)
  private readonly attorneyByNameUrl = "search_attorney"
  private readonly searchFirm = "search-firm"


  getFirmFilter(formValue) {
    return this.http.post(this.baseUrl + this.searchFirm, { firmName: formValue.name, phoneNo: formValue.phone }, this.getHeader())
  }
  getAttorneyFilter(formValue) {
    return this.http.post(this.baseUrl + this.attorneyByNameUrl, formValue, this.getHeader())

  }
  private getHeader() {
    return {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + this.storageData.getToken()
      })
    };
  }
}
