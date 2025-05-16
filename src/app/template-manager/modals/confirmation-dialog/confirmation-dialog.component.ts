import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-confirm-modal',
  template: `
    <div class="modal-header">
      <h4 class="modal-title">{{ title }}</h4>
      <button type="button" class="close" (click)="cancel()">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <div class="row mb-2">
        {{ message }}
      </div>
      <input class="row w-100" *ngIf="addInput" [(ngModel)]="inputData" />
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-primary" (click)="cancel()">Cancel</button>
      <button type="button" class="btn" [ngClass]="{'btn-danger':danger, 'btn-success': !danger }" (click)="confirm()">Yes</button>
    </div>
  `,
})
export class ConfirmationDialogComponent {
  title: string = 'Confirm';
  message: string = 'Are you sure?';
  addInput: boolean = false;
  inputData: string = '';
  danger: boolean = false;
  result: EventEmitter<any> = new EventEmitter();

  constructor(public bsModalRef: BsModalRef) {}

  cancel() {
    this.result.emit(false);
    this.bsModalRef.hide();
  }

  confirm() {
    this.result.emit(this.addInput ? { 'result' : this.inputData} : true);
    this.bsModalRef.hide();
  }
}
