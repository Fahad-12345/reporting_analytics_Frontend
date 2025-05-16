import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { InsuranceMasterFormComponent } from '@appDir/front-desk/fd_shared/components/masters/insurance-master-form/insurance-master-form.component';

@Component({
  selector: 'app-insurance-add',
  templateUrl: './insurance-add.component.html',
  styleUrls: ['./insurance-add.component.scss']
})
export class InsuranceAddComponent implements OnInit {

  constructor() { }
  @ViewChild(InsuranceMasterFormComponent) formComponent: InsuranceMasterFormComponent
  ngOnInit() {
  }
  ngAfterViewInit() {
  }
}
