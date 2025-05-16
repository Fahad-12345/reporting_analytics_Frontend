import { Injectable } from '@angular/core';
import { BillingInsuranceModel } from '../models/BillingInsurance.Model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CustomUrlBuilder } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { Config } from 'app/config/config';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';

@Injectable({
  providedIn: 'root'
})
export class BillingInsuranceBackendServicesService {

  constructor(private httpService: HttpClient, private config: Config, private storageData: StorageData) { }

  private readonly baseUrl = this.config.getConfig('billing_api_url');
  private readonly createBillingInsuranceUrl = "insurances/create"
  private readonly getBillingInsuranceUrl = "insurances/get"
  private readonly deleteBillingInsuranceUrl = "insurances/destroy"
  private readonly deleteMultipleBillingInsuranceUrl = "insurances/destroyAll"
  private readonly updateBillingInsuranceUrl = "insurances/update"
  private readonly searchInsuranceUrl = "insurances/search"


  searchInsurance({ insuranceName, insuranceCode, contactPersonName, contactPersonPhoneNo, pageNumber, paginate }) {
    return this.httpService.post(this.baseUrl + this.searchInsuranceUrl, { insuranceName, insuranceCode, contactPersonName, contactPersonPhoneNo, pageNumber, paginate }, this.getHeader())
  }
  createBillingInstance(data: BillingInsuranceModel) {

    return this.httpService.post(this.baseUrl + this.createBillingInsuranceUrl, data, this.getHeader())
  }

  getBillingInsurance(object) {
    var url = CustomUrlBuilder.buildUrl(this.baseUrl + this.getBillingInsuranceUrl, object)

    return this.httpService.get(url)
  }

  deleteBullingInsurance(data) {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.storageData.getToken()
      }),
      body: {
        id: data
      },
    };
    return this.httpService.delete(this.baseUrl + this.deleteBillingInsuranceUrl, options)
  }

  deleteMultipleBillingInsurance(data) {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.storageData.getToken()
      }),
      body: {
        id: data
      },
    };
    return this.httpService.delete(this.baseUrl + this.deleteMultipleBillingInsuranceUrl, options)
  }

  updateInsurance(data) {
    return this.httpService.patch(this.baseUrl + this.updateBillingInsuranceUrl, data, this.getHeader())
  }

  private getHeader() {
    return {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + this.storageData.getToken()
      })
    };
  }
}
