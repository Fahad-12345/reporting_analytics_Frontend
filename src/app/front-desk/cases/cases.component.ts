import { Component, OnInit } from '@angular/core';
import { MainService } from '@shared/services/main-service';

@Component({
  selector: 'app-cases',
  templateUrl: './cases.component.html',
  styleUrls: ['./cases.component.scss']
})
export class CasesComponent implements OnInit {

  constructor(private mainService: MainService) {
    console.log("Called");
   }

  ngOnInit() {
    this.mainService.setLeftPanel({});
  }

}
