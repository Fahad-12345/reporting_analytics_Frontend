
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { Logger } from '@nsalaun/ng-logger';
import { Config } from 'app/config/config';
import { Observable } from 'rxjs';
import { LocalStorage } from '../libs/localstorage';

@Injectable()
export class AuthService {
  token: string;

  // store the URL so we can redirect after logging in
  redirectUrl: string;
  url: string;

  constructor(
    private http: HttpClient,
    private localStorage: LocalStorage,
    private storageData: StorageData,
    private logger: Logger,
    private config: Config,
    // private requestService: RequestService
  ) { }

  signupUser(email: string, password: string) {
    //your code for signing up the new user
  }

  public getHeaders() {
    let headers = new Headers({
      'content-Type': 'application/json'
    })
    return { headers: headers };
  }

  public loginUser(data): Observable<any> {
    let url = this.config.getConfig('fd_api_url');
    return this.http.post(url + 'login', data);
  }


  getAllPrivaleges(): Observable<any> {
    this.url = this.config.getConfig('fd_api_url') + "all_privileges";
    let token = this.localStorage.getObject('data')['token'];
    this.url += '?token=' + token
    return this.http.get(this.url);
  }


  public logout(): Observable<any> {
    let url = this.config.getConfig('fd_api_url');
    return this.http.post(url + '/logout', {});
  }

  getToken() {
    return this.token;
  }

  public isAuthenticated(): boolean {
    return (this.storageData.getToken()) ? true : false;
  }
  public isAllowed(desk: string) {
    const user_access = this.localStorage.get('user_access');
    if (user_access == desk) {
      return true;
    }
    return false;
  }
  public getUserType(): string {
    return this.storageData.getRoleSlug();
  }

  public isUserDoctor(): Boolean {
    return this.storageData.isDoctor();
  }
}
