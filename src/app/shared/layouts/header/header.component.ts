import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { Observable } from 'rxjs';

import { LocalStorage } from '../../libs/localstorage';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  public currentLang: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private localStorage: LocalStorage) {
  }

  ngOnInit(): void {
    // this.langList$ = this._translatesService.getLangList();
    // this.currentLang = this._translatesService.getCurrentLang();
  }

  // public changeLang(code: string): void {
  //   this._translatesService.changeLang(code);
  // }

  // logout() {
  //   this.localStorage.remove('token');
  //   this.localStorage.remove('user_details');

  //   this.router.navigate(["/login"]);
  // }
}
