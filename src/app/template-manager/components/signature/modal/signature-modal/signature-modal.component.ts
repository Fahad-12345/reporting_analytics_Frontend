import { Component, Input, OnInit } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-signature-modal',
  templateUrl: './signature-modal.component.html',
  styleUrls: ['./signature-modal.component.scss']
})
export class SignatureModalComponent implements OnInit {
  @Input() sigModal: NgbModalRef;
	@Input() object: any;
  constructor() { }

  ngOnInit() {
  }
  clearedSignature() {
		if (this.object.previousSignature) {
			return;
		}
		this.object.signature = null;
		this.object.signature_id = null;
		this.object.signaturePoints = [];
		this.object.signaturelink = null;
		this.object.answers = [];
	}

    signatureChanged($event) {
      if ($event?.signature_file) {
    		// this.object.signature_id = null;
        this.object.signature = $event;
        const reader = new FileReader();
        reader.onload = () => {
          this.object.answers = [
            {
              answer: reader.result.toString()
            }
          ];
          this.object.signaturelink=reader.result.toString()
        };
        reader.onerror = (error) => {
          console.log(error);
        };
        reader.readAsDataURL($event.signature_file);
      }
    }

    signaturePointsChanged($event) {
      this.object.signaturePoints = $event.points;
    }

    onSubmit(){
      this.sigModal.close(this.object)
    }
}
