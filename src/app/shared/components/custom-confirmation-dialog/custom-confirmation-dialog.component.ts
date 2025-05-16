import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';

@Component({
	selector: 'app-custom-dialog',
	templateUrl: './custom-confirmation-dialog.component.html',
	styleUrls: ['./custom-confirmation-dialog.component.scss']
})

export class CustomConfirmationDialogComponent {
  
  @Input() title: string;
  @Input() message: string;
  @Input() btnOkText: string;
  @Input() btnCancelText: string;
  @Input() class:string='btn btn-danger';
  @Input() enableHtml:boolean = false;
  @Input() showCrossIcon : boolean = true;


  constructor(public activeModal: NgbActiveModal) {
   }

  ngOnInit() {
  }

  public decline() {
    this.activeModal.close(false);
  }

  public accept() {
    this.activeModal.close(true);
  }

  public dismiss() {
	  debugger;
	if (this.activeModal && this.activeModal.dismiss){
    this.activeModal.dismiss('Dismiss');
	  }
  }




}
