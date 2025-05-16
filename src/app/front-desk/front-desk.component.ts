import { Component, OnInit } from '@angular/core';
import { MainService } from '@shared/services/main-service';

@Component({
  selector: 'app-front-desk',
  templateUrl: './front-desk.component.html',
})
export class FrontDeskComponent implements OnInit {

  public options = {
    duration: 3000
  }
  constructor(private mainService: MainService) { }

  ngOnInit() {
    this.mainService.setLeftPanel({});
   


  }

  ngAfterViewChecked() {
    window.setTimeout(function () {
      const arr: HTMLCollection = document.getElementsByClassName('datatable-header-cell');
      for (let i = 0; i < arr.length; i++) {
        arr[i].removeAttribute('title');
      }
      const title: HTMLCollection = document.getElementsByTagName('span');
      for (let i = 0; i < title.length; i++) {
        title[i].removeAttribute('title');
      }
    });
  }

}
