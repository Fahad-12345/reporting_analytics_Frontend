import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { AdjusterInformationModel } from '../models/AdjusterInformation.Model';
import { Config } from '@appDir/config/config';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';

@Injectable({
  providedIn: 'root'
})
export class AdjusterInformationServiceService {


  private pageNumber = 1;
  private pageLimit = 10;
  private totalCount = 100
  private readonly baseUrl = this.config.getConfig('billing_api_url');
  private readonly createAdjusterInformationUrl = "/adjuster/create"
  private getAdjusterInformationUrl = "/adjuster/" + this.pageNumber + "/" + this.pageLimit
  private readonly updateAdjusterInformationUrl = "/adjuster/update"
  private readonly deleteAdjusterInformationUrl = "/adjuster/destroy"
  private readonly deleteMultipleAdjusterInformationUrl = "/adjuster/destroyAll"
  private readonly getBillingInsuranceUrl = "/insurances/1/20"
  private readonly searchAdjusterUrl = "/adjuster/search"
  constructor(private http: HttpClient, private config: Config, private storageData: StorageData) { }

  searchAdjuster(formValue) {
    return this.http.post(this.baseUrl + this.searchAdjusterUrl, formValue, this.getHeader())
  }
  setPageLimit(pageLimit) {
    this.pageLimit = pageLimit
    this.getAdjusterInformationUrl = "/adjuster/" + this.pageNumber + "/" + this.pageLimit
  }
  getPageLimit() {
    return this.pageLimit
  }
  getCount() {
    return this.totalCount
  }
  setCount(count) {
    this.totalCount = count
  }
  setPageNumber(pageNumber) {
    this.pageNumber = pageNumber
    this.getAdjusterInformationUrl = "/adjuster/" + this.pageNumber + "/" + this.pageLimit
  }
  getPageNumber() {
    return this.pageNumber
  }
  createAdjusterInformation(adjuster: AdjusterInformationModel) {
    return this.http.post(this.baseUrl + this.createAdjusterInformationUrl, adjuster, this.getHeader())
  }
  getAdjusterInformation() {
    return this.http.get(this.baseUrl + this.getAdjusterInformationUrl, this.getHeader())
  }
  getBillingInsurance() {
    return this.http.get(this.baseUrl + this.getBillingInsuranceUrl)
  }
  updateAdjuster(adjuster) {
    return this.http.patch(this.baseUrl + this.updateAdjusterInformationUrl, adjuster, this.getHeader())
  }
  deleteAdjuster(data) {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.storageData.getToken()
      }),
      body: {
        id: data
      },
    };
    return this.http.delete(this.baseUrl + this.deleteAdjusterInformationUrl, options)
  }
  deleteMultipleAdjusters(ids) {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.storageData.getToken()
      }),
      body: {
        id: ids
      },
    };
    return this.http.delete(this.baseUrl + this.deleteMultipleAdjusterInformationUrl, options)
  }
  private getHeader() {
    return {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + this.storageData.getToken()
      })
    };
  }
}
