import { FormGroup, FormBuilder } from '@angular/forms';
import { Component, Input, OnInit, AfterViewInit} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {  Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ReactionService } from '../../reaction.service';
import { ActionEnum } from '../../reactionsEnum';
import { unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';

@Component({
	selector: 'app-reactions-view',
	templateUrl: './reactions-view.component.html',
	styleUrls: ['./reactions-view.component.scss']
})
export class ReactionsViewComponent implements OnInit, AfterViewInit {
	@Input() reactionDetail;
	action = ActionEnum;
	reactionDetailForm: FormGroup;
	isReadOnlyproofingLicenseDetailFormControls = false;
	subscription: Subscription[] = [];
	loadSpin = false;
	constructor(private fb: FormBuilder, private reactionService: ReactionService, private toastrService: ToastrService, private modalService: NgbModal) { }

	ngOnInit() {
		this.initReactionDetailForm();

	}
	// INITIALIZING REACTION DETAIL FORM
	initReactionDetailForm() {
		this.reactionDetailForm = this.fb.group({
			added_date: [''],
			concept_type: [''],
			hl7_object_identifier: [''],
			hl7_object_identifier_type: [''],
			id: [''],// ID OF REACTION
			in_active_date: [''],
			snomed_concept_id: [''],
			snomed_term_concept_type_id: [''],
			snomed_term_desc: [''],
			snomed_term_desc_id: [''],
			term_type_desc: [''],
			value_set_comment: [''],
			value_set_type_description: [''],
		});
	}
	// SAVE & CONTINUE REACTION
	saveContinue() {
		const queryParams = {
			added_date: this.reactionDetailForm.controls.added_date.value,
			concept_type: this.reactionDetailForm.controls.concept_type.value,
			hl7_object_identifier: this.reactionDetailForm.controls.hl7_object_identifier.value,
			hl7_object_identifier_type: this.reactionDetailForm.controls.hl7_object_identifier_type.value,
			id: this.reactionDetailForm.controls.id.value,// ID OF REACTION
			in_active_date: this.reactionDetailForm.controls.in_active_date.value,
			snomed_concept_id: this.reactionDetailForm.controls.snomed_concept_id.value,
			snomed_term_concept_type_id: this.reactionDetailForm.controls.snomed_term_concept_type_id.value,
			snomed_term_desc: this.reactionDetailForm.controls.snomed_term_desc.value,
			snomed_term_desc_id: this.reactionDetailForm.controls.snomed_term_desc_id.value,
			term_type_desc: this.reactionDetailForm.controls.term_type_desc.value,
			value_set_comment: this.reactionDetailForm.controls.value_set_comment.value,
			value_set_type_description: this.reactionDetailForm.controls.value_set_type_description.value,
		}
		if (this.reactionDetail.action == this.action.ADD) {
			this.addNewReaction(queryParams);
		} else if (this.reactionDetail.action == this.action.EDIT) {
			this.editReaction(queryParams);
		}
	}
	// ADD NEW REACTION
	addNewReaction(queryParams) {
		this.loadSpin = true;
		this.subscription.push(
			this.reactionService.addNewReaction(queryParams).subscribe((res: any) => {
				if (res.status) {
					this.loadSpin = false;
					this.initReactionDetailForm();
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
	// EDIT REACTION
	editReaction(queryParams) {
		this.loadSpin = true;
		this.subscription.push(
			this.reactionService.addNewReaction(queryParams).subscribe((res: any) => {
				if (res.status) {
					this.loadSpin = false;
					this.initReactionDetailForm();
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
		this.reactionDetailForm.patchValue(this.reactionDetail.reactionDetail);
		if (this.reactionDetail.action == this.action.VIEW) {
			this.reactionDetailForm.disable();
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
