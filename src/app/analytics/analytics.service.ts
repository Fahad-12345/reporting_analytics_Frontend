import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class AnalyticsService {
	 //analyticsInitial = `localhost:3000`;
	 analytics_api_url =`http://localhost:3000/api/node/analytics/`;
	constructor(private http: HttpClient,
		private requestService: RequestService,
		private backendClinet: HttpBackend,
		private storageData: StorageData) {
			// this.http =  new HttpClient(this.backendClinet);
	}

	public get<T>(_url): Observable<T> {
		return this.requestService.sendRequest(
			_url,
			'GET',
			REQUEST_SERVERS.analytics_api_path
		);
	}

	public post<T>(_url, requestParamsBody: any): Observable<any> {
		return this.requestService.sendRequest(
			_url,
			'POST',
			REQUEST_SERVERS.analytics_api_path,
			requestParamsBody
		);
	}
	public exportTo<T>(_url,body:any) {
		const headers = new HttpHeaders({
            Accept: 'text/csv',
			
        });
		const options = { headers,responseType: 'text' as any };
		let reqUrl = this.analytics_api_url + _url
		return this.http.post(reqUrl,body,options);
	}
}
