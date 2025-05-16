import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddAppointmentModalComponent } from './appointments/appointments-modal.component';

@Injectable({
  providedIn: 'root'
})
export class AppointmentModalDialogService {

  constructor(public appointmentModal: NgbModal) { }
  openDialog() {
    return this.appointmentModal.open(
      AddAppointmentModalComponent,
      {
        size: 'lg',
        backdrop: 'static',
        keyboard: false,
        windowClass: 'modal_extraDOc unique modal-xxl',
      },
    );
  }
}
