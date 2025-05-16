import { OnInit, OnDestroy, Component, Input } from "@angular/core";

@Component({
	selector: 'app-soft-patient-modal-componet',
	templateUrl: './soft-patient-profile-modal.component.html',
	styleUrls: ['./soft-patient-profile-modal.component.scss']
  })
export class SoftPatientProfileModalComponent implements OnInit,OnDestroy {
	@Input() modalRef: any;
	@Input() title: any='';

	patientId:number;
	constructor(){

	}
	ngOnInit() 
	{

	}
	ngOnDestroy(): void {
		
	}
	closeModal() {
		this.modalRef.close();
	}

}
