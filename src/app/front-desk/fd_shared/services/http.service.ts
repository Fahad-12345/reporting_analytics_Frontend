import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';

import { catchError } from 'rxjs/operators';
import { Config } from '@appDir/config/config';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';

@Injectable({
	providedIn: 'root',
})
export class HttpService {
	private baseUrl: string;
	private billlingUrl: string;

	constructor(private http: HttpClient, private config: Config,
		private storageData: StorageData) {
		this.baseUrl = this.config.getConfig('fd_api_url');
		this.billlingUrl = this.config.getConfig('billing_api_url');
	}

	public get<T>(_url): Observable<T> {
		const url = `${this.baseUrl}${_url}`;

		return this.http.get<T>(url, this.getHeader()).pipe(catchError(this.handleError)) as Observable<
			T
		>;
	}

	public post<T>(_url, data: T): Observable<T> {
		const url = `${this.baseUrl}${_url}`;

		return this.http
			.post<T>(url, data, this.getHeader())
			.pipe(catchError(this.handleError)) as Observable<T>;
	}

	public put<T>(_url, data: T): Observable<T> {
		const url = `${this.baseUrl}${_url}`;

		return this.http
			.put<T>(url, data, this.getHeader())
			.pipe(catchError(this.handleError)) as Observable<T>;
	}

	public _put<T, K>(_url, data: T): Observable<K> {
		const url = `${this.baseUrl}${_url}`;

		return this.http
			.put<K>(url, data, this.getHeader())
			.pipe(catchError(this.handleError)) as Observable<K>;
	}

	public delete<T>(_url): Observable<T> {
		const url = `${this.baseUrl}${_url}`;

		return this.http
			.delete<T>(url, this.getHeader())
			.pipe(catchError(this.handleError)) as Observable<T>;
	}

	public deleteMultiple<T>(_url, data: T): Observable<T> {
		const url = `${this.baseUrl}${_url}`;
		const options = {
			headers: new HttpHeaders({
				Authorization: 'Bearer ' + this.storageData.getToken(),
			}),
			body: {
				id: data,
			},
		};
		return this.http.delete<T>(url, options).pipe(catchError(this.handleError)) as Observable<T>;
	}

	public getHeader() {
		return {
			headers: new HttpHeaders({
				Authorization: 'Bearer ' + this.storageData.getToken(),
			}),
		};
	}

	public handleError(error: HttpErrorResponse) {
		if (error.error instanceof ErrorEvent) {
			// A client-side or network error occurred. Handle it accordingly.
			console.error('An error occurred:', error.error.message);
		} else {
			// The backend returned an unsuccessful response code.
			// The response body may contain clues as to what went wrong,
			console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`);
		}
		// return an observable with a user-facing error message
		return throwError('Something bad happened; please try again later.');
	}

	public postSearch<T>(_url, data: T): Observable<T> {
		const url = `${this.billlingUrl}${_url}`;

		return this.http
			.post<T>(url, data, this.getHeader())
			.pipe(catchError(this.handleError)) as Observable<T>;
	}
}
