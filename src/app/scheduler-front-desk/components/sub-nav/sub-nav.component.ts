import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sub-nav',
  templateUrl: './sub-nav.component.html',
  styleUrls: ['./sub-nav.component.scss']
})
export class SubNavComponent implements OnInit {
  public isCheckedSpec:boolean=true;
  public isCheckedDoc:boolean=false;
  public isCheckedNotf:boolean=false;
  constructor() { }
   
  ngOnInit() {
  }
  Spec()
  {
    this.isCheckedSpec=true;
    this.isCheckedDoc=false;
    this.isCheckedNotf=false;
  }
  Doc()
  {
    this.isCheckedSpec=false;
    this.isCheckedDoc=true;
    this.isCheckedNotf=false;
  }
  Notification()
  {
    this.isCheckedSpec=false;
    this.isCheckedDoc=false;
    this.isCheckedNotf=true;
  }

}
