import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-status-popup',
  templateUrl: './status-popup.component.html',
  styleUrls: ['./status-popup.component.scss']
})

export class StatusPopupComponent implements OnInit {

  @Output() optionSelected: EventEmitter<any> = new EventEmitter();
  @Input() key: string;
  public value: any;
  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {
    this.value = this.key;
  }
  parent: boolean = false;
  child: boolean = false;
  toaster: ToastrService

  save() {
    if (this.child && this.parent) {
      this.optionSelected.emit({
        parent: 'parent',
        child: 'child'
      });
    } else if (this.child || this.parent) {
      this.child ? this.optionSelected.emit({child:'child'}) : this.optionSelected.emit({parent: 'parent'});
    } else {
      if (this.toaster) {
        this.toaster.error('Kindly select an option', 'Error');
      }
    }
    this.activeModal.close(); 
  }


}
