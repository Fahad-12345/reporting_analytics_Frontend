import { Component, OnInit, Inject } from '@angular/core';

import { AppStorage } from '../shared/for-storage/universal.inject';
import { TransferHttpService } from '@gorniv/ngx-transfer-http';
import { LocalStorage } from '@shared/libs/localstorage';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {

  constructor(
    private http: TransferHttpService,
    private localStorage: LocalStorage,
    @Inject(AppStorage) private appStorage: Storage) {
  }

  ngOnInit(): void {
    this.appStorage.setItem('test', 'test2');
    const resultCookie = this.appStorage.getItem('test');
    const t = window;
    const t1 = document;
  }

}
