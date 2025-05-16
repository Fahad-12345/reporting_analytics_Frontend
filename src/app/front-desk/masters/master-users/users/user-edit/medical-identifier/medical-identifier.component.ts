import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-medical-identifier',
  templateUrl: './medical-identifier.component.html',
  styleUrls: ['./medical-identifier.component.scss']
})
export class MedicalIdentifierComponent implements OnInit {

  constructor() { }
  @Input() sendId: any
  ngOnInit() {
  }

}
