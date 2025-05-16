import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-template-master',
  templateUrl: './template-master.component.html',
  styleUrls: ['./template-master.component.scss']
})
export class TemplateMasterComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }
  goToRequiredFields() {
    this.router.navigate(['front-desk/masters/template/template/required-fields'])
  }
  goToRolesFields() {
    this.router.navigate(['front-desk/masters/template/template/roles-field'])
  }
  goToHeaderFooter() {
    this.router.navigate(['front-desk/masters/template/template/header-footer'])
  }

  gotToTags() {
    this.router.navigate(['front-desk/masters/template/template/keywords']);

  }
}
