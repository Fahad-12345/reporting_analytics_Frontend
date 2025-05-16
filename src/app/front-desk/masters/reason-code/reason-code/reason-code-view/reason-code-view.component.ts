import { FormGroup, FormBuilder } from '@angular/forms';
import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ReasonCodeService } from '../../reason-code.service';
import { ActionEnum } from '../../reasonCodeEnum';
import { unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';

@Component({
	selector: 'app-reasonCode-view',
	templateUrl: './reason-code-view.component.html',
	styleUrls: ['./reason-code-view.component.scss']
})
export class ReasonCodeViewComponent implements OnInit, AfterViewInit {
	@Input() reasonCodeDetail;
	submitted = true;
	action: any = ActionEnum;
	reasonCodeDetailForm: FormGroup;
	isReadOnlyproofingLicenseDetailFormControls = false;
	subscription: Subscription[] = [];
	loadSpin = false;
	constructor(private fb: FormBuilder, private reactionService: ReasonCodeService, private toastrService: ToastrService, private modalService: NgbModal) { }

	ngOnInit() {
		this.initReasonCodeDetailForm();

	}
	// INITIALIZING REASON CODE DETAIL FORM
	initReasonCodeDetailForm() {
		this.reasonCodeDetailForm = this.fb.group({
			code: [''],
			description: [''],
			id: [''],// ID OF REASON CODE,
			reason_code_category_id: [''] //REASON CODE CATEGORY ID
			// reason_codes_category: this.fb.group({
			// 	name: [''],
			// 	reason_code_category_id: [''] //REASON CODE CATEGORY ID
			// }),
		});
	}
	// SAVE & CONTINUE REASON CODE
	saveContinue() {
		const queryParams = {
			code: this.reasonCodeDetailForm.controls.added_date.value,
			reason_code_category_id: this.reasonCodeDetailForm.controls.reason_code_category_id.value,
			name: this.reasonCodeDetailForm.controls.name.value,
			description: this.reasonCodeDetailForm.controls.description.value,
			id: this.reasonCodeDetailForm.controls.id.value,// ID OF REASON CODE
		}
		if (this.reasonCodeDetail.action == this.action.ADD) {
			this.addNewReasonCode(queryParams);
		} else if (this.reasonCodeDetail.action == this.action.EDIT) {
			this.editReason(queryParams);
		}
	}
	// ADD NEW REASON CODE
	addNewReasonCode(queryParams) {
		this.loadSpin = true;
		this.subscription.push(
			this.reactionService.addNewReasonCode(queryParams).subscribe((res: any) => {
				if (res.status) {
					this.loadSpin = false;
					this.initReasonCodeDetailForm();
					this.toastrService.success(res.message, 'Success');
					this.closeModal();
					this.reactionService.isActionComplete.next(true);
				}
			},
				(error) => {
					this.loadSpin = false;
				})
		);
	}
	// EDIT REASON CODE
	editReason(queryParams) {
		this.loadSpin = true;
		this.subscription.push(
			this.reactionService.addNewReasonCode(queryParams).subscribe((res: any) => {
				if (res.status) {
					this.loadSpin = false;
					this.initReasonCodeDetailForm();
					this.toastrService.success(res.message, 'Success');
					this.closeModal();
					this.reactionService.isActionComplete.next(true);
				}
			},
				(error) => {
					this.loadSpin = false;
				})
		);
	}
	ngAfterViewInit() {
		this.patchValueInReasonCodeDetailForm(this.reasonCodeDetail.reasonCodeDetail);
		console.log(this.reasonCodeDetail);
		this.formEnableDisabled(this.reasonCodeDetail.action);
	}
	// CHECK FORM WILL ENABLE OR DISABLED
	formEnableDisabled(action) {
		if (action == this.action.VIEW) {
			this.reasonCodeDetailForm.disable();
		}
	}
	// PATCH THE VALUES
	patchValueInReasonCodeDetailForm(reasonCodeDetail) {
		this.reasonCodeDetailForm.patchValue(reasonCodeDetail);
	}
	// CLOSE MODAL
	closeModal() {
		this.modalService.dismissAll();
	}
	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}

}
