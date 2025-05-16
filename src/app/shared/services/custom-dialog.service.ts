import { CustomConfirmationDialogComponent } from './../components/custom-confirmation-dialog/custom-confirmation-dialog.component';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';

@Injectable(
	{providedIn: 'root'}
)
export class CustomDiallogService {


	constructor(private config: NgbModalConfig,private modalService: NgbModal) {
		this.config.keyboard= false;
		this.config.backdrop= 'static';
	 }

	
	public confirm(
		title: string,
		message: string,
		btnOkText: string = 'OK',
		btnCancelText: string = 'Cancel',
		dialogSize: 'sm'|'lg' = 'sm',
		dialogclass:string='btn btn-danger',
		enableHtml?:boolean
		): Promise<boolean> {
		const modalRef = this.modalService.open(CustomConfirmationDialogComponent,{windowClass:'confirmation-modal'});
		modalRef.componentInstance.title = title;
		modalRef.componentInstance.message = message;
		modalRef.componentInstance.btnOkText = btnOkText;
		modalRef.componentInstance.btnCancelText = btnCancelText;
		modalRef.componentInstance.class = dialogclass;
		modalRef.componentInstance.enableHtml = enableHtml;
	
		return modalRef.result;
	  }



}
