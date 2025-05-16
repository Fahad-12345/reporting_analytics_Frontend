import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss'],
  animations: [
    trigger(
      'leftPanel', [
        transition(':enter', [
          style({transform: 'translateX(-100%)'}),
          animate('500ms ease', style({transform: 'translateX(0)'}))
        ]),
        transition(':leave', [
          style({transform: 'translateX(0)'}),
          animate('500ms ease', style({transform: 'translateX(-100%)'}))
        ])
      ]
    ),
    trigger(
      'rightPanel', [
        transition(':enter', [
          style({transform: 'translateX(100%)'}),
          animate('500ms', style({transform: 'translateX(0)'}))
        ]),
        transition(':leave', [
          style({transform: 'translateX(0)'}),
          animate('500ms', style({transform: 'translateX(100%)'}))
        ])
      ]
    )
  ],
})
export class SideNavComponent implements OnInit {


  constructor() { }
  @Input() showContent = true;
  @Output() change=new EventEmitter();
  leftClass =  [
    'doc-manager-panel', 'float-left', 'position-relative'
  ]
  rightClass =  [
    'float-right', 'position-relative', 'side-height'
  ]
  @Input() side:string='left'
  ngOnInit() {
  }

}
