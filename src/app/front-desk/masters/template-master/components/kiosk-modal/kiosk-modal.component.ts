import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-kiosk-modal',
  templateUrl: './kiosk-modal.component.html',
  styleUrls: ['./kiosk-modal.component.scss']
})
export class KioskModalComponent implements OnInit {

  constructor(private activeModal: NgbActiveModal) { }

  @Input() caseId: number;
  @Input() pinNumber: number;
  ngOnInit() {
  }
  close() {
    this.activeModal.close()
  }

}
