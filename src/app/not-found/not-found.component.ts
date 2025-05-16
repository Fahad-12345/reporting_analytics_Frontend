import { Component, OnInit } from '@angular/core';
import { NotFoundService } from './not-found.service';
import { Router } from '@angular/router';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss'],
})
export class NotFoundComponent implements OnInit {
  public status: { code: number, message: string };
  counter = 10;
  public redirect_page = 'login';
  constructor(private _notFoundService: NotFoundService, private router: Router, private storageData: StorageData) {
  }

  ngOnInit(): void {
    this._notFoundService.setStatus(404, 'Not Found');
    let interval = setInterval(() => {
      this.counter--;
      if (this.counter == 0) {
        clearInterval(interval);
        this.redirectTo()
      }
    }, 1000)


  }

  redirectTo(redirect_page = 'login') {
    this.router.navigate(['/login'])
  }

}
