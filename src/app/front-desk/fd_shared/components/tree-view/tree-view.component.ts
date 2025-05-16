import { Component, OnInit, Input } from '@angular/core';
import { Directory } from './Directory';

@Component({
  selector: 'app-tree-view',
  templateUrl: './tree-view.component.html',
  styleUrls: ['./tree-view.component.scss']
})
export class TreeViewComponent implements OnInit {

  @Input() directories: Array<Directory>;
  
  constructor() { }

  ngOnInit() {
  }

}
