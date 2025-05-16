import { Component } from '@angular/core';
import { Routes, RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-wrapper',
  templateUrl: './wrapper.component.html'
})
export class WrapperComponent {
  // rout;
	constructor(
	  private router: Router){
      // this.rout = this.router.url;
      // console.log(this.rout);
    }
}
