import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-summary-popup',
  templateUrl: './summary-popup.component.html',
  styleUrls: ['./summary-popup.component.scss']
})
export class SummaryPopupComponent {

  @Output() optionSelected: EventEmitter<any> = new EventEmitter();
  @Input() key: string;
  public facility: boolean = false;
  public facility_location: boolean = false;

  constructor(public activeModal: NgbActiveModal,private toaster: ToastrService) {}

  save() {
    if (this.facility || this.facility_location) {
      const selectedOption = this.facility ? 'facility' : 'facility_location';
      this.activeModal.close(selectedOption);
    } else {
      this.toaster.error('Please select an option', 'Error');
    }
  }
  onCheckboxChange(selected: string) {
    if (selected === 'facility') {
      this.facility_location = false; 
    } else if (selected === 'facility_location') {
      this.facility = false; 
    }
  }
}
