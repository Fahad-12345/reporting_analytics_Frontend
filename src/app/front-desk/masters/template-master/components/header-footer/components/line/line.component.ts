import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-line',
  templateUrl: './line.component.html',
  styleUrls: ['./line.component.scss']
})
export class LineComponent implements OnInit {
  object: any = {};
  constructor() { }
  ngOnInit() {
    console.log(this.object)
  }
}
