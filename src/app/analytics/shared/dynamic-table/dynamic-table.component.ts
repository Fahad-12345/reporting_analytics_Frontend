import { Component, Input, OnChanges, OnInit } from '@angular/core';

@Component({
  selector: 'app-dynamic-table',
  templateUrl: './dynamic-table.component.html',
  styleUrls: ['./dynamic-table.component.scss']
})
export class DynamicTableComponent implements OnChanges {
  @Input('tableType') tableType:string = "";
  @Input('columns') columns: any = [];
  @Input('rows') rows: any = [];
  constructor() {

  }
  ngOnChanges(): void {


  }
}
