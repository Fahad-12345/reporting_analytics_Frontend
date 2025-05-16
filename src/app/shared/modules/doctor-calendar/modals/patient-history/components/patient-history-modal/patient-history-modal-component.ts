import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { FormGroup} from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-patient-history-component-modal',
  templateUrl: './patient-history-modal-component.html',
  styleUrls: ['./patient-history-modal-component.scss']
})
export class PatientHistoryComponentModal implements OnInit {
  caseId : any;
  ngOnInit() { 
  
  }
  constructor(public activeModal: NgbActiveModal,
   
   ) {
   
  }
  
  /*Reason for deleting unavailability*/
  close()
  {
	this.activeModal.close();

  }

}
