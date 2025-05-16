import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, Input, OnInit, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {  Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ErxOverrideReasonService } from '../../erx-override-reason.service';
import { ActionEnum } from '../../erx-override-reasonEnum';
import { unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';

@Component({
	selector: 'app-erx-override-reason-view',
	templateUrl: './erx-override-reason-view.component.html',
	styleUrls: ['./erx-override-reason-view.component.scss']
})
export class ErxOverrideReasonViewComponent implements OnInit, AfterViewInit {
	@Input() erxOverrideReasonDetail;
	@Output() erxActionStatus: EventEmitter<any> = new EventEmitter<any>();
 
	action = ActionEnum;
	erxOverrideReasonDetailForm: FormGroup;
	subscription: Subscription[] = [];
	loadSpin = false;
	constructor(private fb: FormBuilder, private erxOverrideReasonService: ErxOverrideReasonService, private toastrService: ToastrService, private modalService: NgbModal) { }

	ngOnInit() {
		this.initErxOverrideReasonDetailForm();
	}
	// INITIALIZING ERX OVERRIDE REASON DETAIL FORM
	initErxOverrideReasonDetailForm() {
		this.erxOverrideReasonDetailForm = this.fb.group({
			id: [''], //ID OF REASON
			reason: ['']
		});
	}
	// SAVE & CONTINUE ERX OVERRIDE REASON
	saveContinue() {
		const queryParams = {
			id: this.erxOverrideReasonDetailForm.controls.id.value,
			reason: this.erxOverrideReasonDetailForm.controls.reason.value,
		}
		if (this.erxOverrideReasonDetail.action == this.action.ADD) {
			this.addNewErxOverrideReason(queryParams);
		} else if (this.erxOverrideReasonDetail.action == this.action.EDIT) {
			this.editErxOverrideReason(queryParams);
		}
	}
	// ADD NEW ERX OVERRIDE REASON
	addNewErxOverrideReason(queryParams) {
		this.loadSpin = true;
		this.subscription.push(
			this.erxOverrideReasonService.addNewErxOverrideReason(queryParams).subscribe((res: any) => {
				if (res.status) {
					this.loadSpin = false;
					this.initErxOverrideReasonDetailForm();
					this.toastrService.success(res.message, 'Success');
					this.closeModal();
					this.erxOverrideReasonService.isActionComplete.next(true);
				}
			},
				(error) => {
					this.loadSpin = false;
				})
		);
	}
	// EDIT ERX OVERRIDE REASON
	editErxOverrideReason(queryParams) {
		this.loadSpin = true;
		this.subscription.push(
			this.erxOverrideReasonService.editErxOverrideReason(queryParams).subscribe((res: any) => {
				if (res.status) {
					this.loadSpin = false;
					this.initErxOverrideReasonDetailForm();
					this.toastrService.success(res.message, 'Success');
					this.closeModal();
					this.erxOverrideReasonService.isActionComplete.next(true);
				}
			},
				(error) => {
					this.loadSpin = false;
				})
		);
	}
	ngAfterViewInit() {
		if (this.erxOverrideReasonDetail.action != this.action.ADD) {
			this.erxOverrideReasonDetailForm.patchValue(this.erxOverrideReasonDetail.erxOverrideReasonDetail);
		}
		if (this.erxOverrideReasonDetail.action == this.action.VIEW) {
			this.erxOverrideReasonDetailForm.disable();
		}
	}
	// CLOSE MODAL
	closeModal() {
		this.modalService.dismissAll();
	}
	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}

}
