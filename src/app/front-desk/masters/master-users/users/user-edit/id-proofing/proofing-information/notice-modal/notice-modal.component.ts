import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-notice-modal',
  templateUrl: './notice-modal.component.html',
  styleUrls: ['./notice-modal.component.scss']
})
export class NoticeModalComponent implements OnInit {
  @Output() modalEmit = new EventEmitter();
  emitcalled:boolean=false;
  funcCount=0;
  scrCount=0;
  funcCountIn=0;
  constructor() { }

  ngOnInit() {
  this.emitcalled=false;
  }
  onEmit(event)
  { 
    this.emitcalled=true;
    this.modalEmit.emit(event);
  }
  
  scrollToTop(el) {
  this.funcCount=this.funcCount+1;
      if(this.emitcalled==false){
		    this.funcCountIn=this.funcCountIn+1;
        el.scrollTop = 0;
      }
		return true;
	}
  onScroll()
  {
    this.scrCount=this.scrCount+1;
    if(this.scrCount>10){
    this.emitcalled=true;
    }
  }
  
}
