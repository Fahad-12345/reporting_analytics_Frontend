import { HttpClient, HttpHeaders, HttpResponse, } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Config } from "@appDir/config/config";
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { stdTimezoneOffset } from '@appDir/shared/utils/utils.helpers';
import { BehaviorSubject, Observable } from "rxjs";
import { share } from 'rxjs/operators';
import { getTimeZone, isArray, makeParamsFromFormData } from '../utils/utils.helpers';

@Injectable({
    providedIn: 'root'
})

// @Injectable()
export class RequestService {

	baseFullUrl  :string = '';
	urlBasePath: BehaviorSubject<any> = new BehaviorSubject(null);
	isurlBasePath = this.urlBasePath.asObservable();
	// public languages:any={data:[]}
 public openModel = new BehaviorSubject(false);
    constructor(private httpClient: HttpClient,
        private config: Config,
        private storageData: StorageData) {
    }


    makeUrl(url, SERVER_TYPE) {
        return this.config.getConfig(SERVER_TYPE) + url;
    }

    sendRequest(url, type, SERVER_TYPE: REQUEST_SERVERS, formData: any = {},dontSentCurrentLocation?,requriedUtfEncode?) {

		if ('pagination' in formData) {
            formData.pagination = (formData.pagination) ? 1 : 0;
        }

		if (SERVER_TYPE == REQUEST_SERVERS.schedulerApiUrl1 ){
			// let date = new Date ();
			
			// let time_zone_string = getTimeZone(this.storageData.getUserTimeZone().timeZone)
			// 	 formData['time_zone'] = {
			// 		 time_zone:  date.getTimezoneOffset(),
			// 		 time_zone_string: time_zone_string
			// 	 }
		}
        if (SERVER_TYPE == REQUEST_SERVERS.fd_api_url)  {
            if (!dontSentCurrentLocation &&this.storageData.getFacilityLocations()) {
                 formData['current_location_id'] = this.storageData.getFacilityLocations()[0];
				 let time_zone_string = getTimeZone(this.storageData.getUserTimeZone().timeZone)
				 formData['time_zone'] = {
					 time_zone: stdTimezoneOffset(),
					 time_zone_string: time_zone_string
				 }
            }
            if (!dontSentCurrentLocation && (this.storageData.getUserTimeZoneOffset() || this.storageData.getUserTimeZoneOffset() == 0) && !formData['time_zone']) {
                let time_zone_string = getTimeZone(this.storageData.getUserTimeZone().timeZone)
                formData['time_zone'] = {
                    time_zone: stdTimezoneOffset(),
                    time_zone_string: time_zone_string
                }

            }
        }

        const apiUrl = this.makeUrl(url, SERVER_TYPE);
        const params = makeParamsFromFormData(formData || {},requriedUtfEncode);
        switch (type.toLowerCase()) {
            case 'get':
				
                return this.httpClient.get(apiUrl, { params: params });
            case 'post':
                return this.httpClient.post(apiUrl, formData);
            case 'put':
                return this.httpClient.put(apiUrl, formData);
            case 'patch':
                return this.httpClient.patch(apiUrl, formData);
            case 'delete':
                return this.httpClient.delete(apiUrl, { params: params });
			case 'post_file':
					return this.httpClient.post(apiUrl, formData, {
					  reportProgress: true,
					  observe: 'events'
					}).pipe(share());
			case 'url_base_with_token': 
			let url = apiUrl+"?token=" +this.storageData.getToken();
			this.setBaseUrl(url,formData);
			return this.isurlBasePath;
            case 'delete_with_body':
                const header: HttpHeaders = new HttpHeaders()
                const httpOptions = {
                    headers: header,
                    body: formData
                };
                return this.httpClient.delete(apiUrl, httpOptions);
		
        }
    }

	sendRequestBlob(url: string, body: any, SERVER_TYPE?: REQUEST_SERVERS, dontSentCurrentLocation?): Observable<HttpResponse<ArrayBuffer>> {
		const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
		if (SERVER_TYPE == REQUEST_SERVERS.fd_api_url)  {
            if (!dontSentCurrentLocation &&this.storageData.getFacilityLocations()) {
				body['current_location_id'] = this.storageData.getFacilityLocations()[0];
				 let time_zone_string = getTimeZone(this.storageData.getUserTimeZone().timeZone)
				 body['time_zone'] = {
					 time_zone: stdTimezoneOffset(),
					 time_zone_string: time_zone_string
				 }
            }
            if (!dontSentCurrentLocation && (this.storageData.getUserTimeZoneOffset() || this.storageData.getUserTimeZoneOffset() == 0) && !body['time_zone']) {
                let time_zone_string = getTimeZone(this.storageData.getUserTimeZone().timeZone)
                body['time_zone'] = {
                    time_zone: stdTimezoneOffset(),
                    time_zone_string: time_zone_string
                }
            }
        }
		const apiUrl = this.makeUrl(url, SERVER_TYPE);
		return this.httpClient.post(apiUrl, body, {
		  headers: headers,
		  responseType: 'arraybuffer',
		  observe: 'response'
		}) as Observable<HttpResponse<ArrayBuffer>>;
	}

	getLanguageList():Observable<any>
	{
		return this.httpClient.get('../../../assets/language/languageList.json');
		// if(this.languages.data && this.languages.data.length<1)
		// {
			// return this.httpClient.get('../../../assets/language/languageList.json').pipe(
			// 	map(res=>{
			// 		this.languages=res
			
			// 	})
			// );
		// }
		// else
		// {
		// 	// let res=this.languages;
		// 	//  return new Observable(subscriber => subscriber.next(res)).pipe(take(1))
		// 	return of(this.languages);
		// }
	}


	setBaseUrl(obj,formData?) {
		if (formData){
			formData.time_zone?delete formData.time_zone:null;	
			let keys = Object.keys(formData);
			keys.forEach(key=>{
					if (!isArray(formData[key])){
						obj = `${obj}&${key}=${formData[key]}`;
					}
					else {
						formData[key].forEach(formValue=> {
							obj = `${obj}&${key}[]=${formValue}`;
						});
					}
				});
		}

		this.urlBasePath.next(obj);

	
	  }
	

	pushOpenModel(action: boolean){
		this.openModel.next(action);
	}

	pullOpenModel(){
		return this.openModel.asObservable();
	}

}


