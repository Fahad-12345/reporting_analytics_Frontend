import { FormGroup, FormBuilder } from '@angular/forms';
import { Component, Input, OnInit, AfterViewInit} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { DeaSchedulerCodenService } from '../../dea.schedule.code.service';
import { ActionEnum } from '../../dea.schedule.codeEnum';
import { unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';

@Component({
	selector: 'app-deaScheduleCodeView-view',
	templateUrl: './dea.schedule.code-view.component.html',
	styleUrls: ['./dea.schedule.code-view.component.scss']
})
export class DeaScheduleCodeViewComponent implements OnInit, AfterViewInit {
	@Input() deaSchedulerCodeDetail;
	action = ActionEnum;
	deaSchedulerCodeDetailForm: FormGroup;
	isReadOnlyproofingLicenseDetailFormControls = false;
	subscription: Subscription[] = [];
	loadSpin = false;
	constructor(private fb: FormBuilder, private deaSchedulerCodeService: DeaSchedulerCodenService, private toastrService: ToastrService, private modalService: NgbModal) { }

	ngOnInit() {
		this.initDeaSchedulerCodeDetailForm();

	}
	// INITIALIZING DEA SCHEDULER CODE DETAIL FORM
	initDeaSchedulerCodeDetailForm() {
		this.deaSchedulerCodeDetailForm = this.fb.group({
			federal_dea_class_code: [''],
			federal_dea_class_code_desc: [''],
			ncit_code: [''],
			ncpdp_preferred_term: [''],
			id: [''],// ID OF DEA SCHEDULER CODE
		});
	}
	// SAVE & CONTINUE DEA SCHEDULER CODE
	saveContinue() {
		const queryParams = {
			federal_dea_class_code: this.deaSchedulerCodeDetailForm.controls.federal_dea_class_code.value,
			federal_dea_class_code_desc: this.deaSchedulerCodeDetailForm.controls.federal_dea_class_code_desc.value,
			ncit_code: this.deaSchedulerCodeDetailForm.controls.ncit_code.value,
			ncpdp_preferred_term: this.deaSchedulerCodeDetailForm.controls.ncpdp_preferred_term.value,
			id: this.deaSchedulerCodeDetailForm.controls.id.value// ID OF DEA SCHEDULER CODE
		}
		if (this.deaSchedulerCodeDetail.action == this.action.ADD) {
			this.addNewDeaSchedulerCode(queryParams);
		} else if (this.deaSchedulerCodeDetail.action == this.action.EDIT) {
			this.editReaction(queryParams);
		}
	}
	// ADD NEW DEA SCHEDULER CODE
	addNewDeaSchedulerCode(queryParams) {
		this.loadSpin = true;
		this.subscription.push(
			this.deaSchedulerCodeService.addNewReaction(queryParams).subscribe((res: any) => {
				if (res.status) {
					this.loadSpin = false;
					this.initDeaSchedulerCodeDetailForm();
					this.toastrService.success(res.message, 'Success');
					this.closeModal();
					this.deaSchedulerCodeService.isActionComplete.next(true);
				}
			},
				(error) => {
					this.loadSpin = false;
				})
		);
	}
	// EDIT DEA SCHEDULER CODE
	editReaction(queryParams) {
		this.loadSpin = true;
		this.subscription.push(
			this.deaSchedulerCodeService.addNewReaction(queryParams).subscribe((res: any) => {
				if (res.status) {
					this.loadSpin = false;
					this.initDeaSchedulerCodeDetailForm();
					this.toastrService.success(res.message, 'Success');
					this.closeModal();
					this.deaSchedulerCodeService.isActionComplete.next(true);
				}
			},
				(error) => {
					this.loadSpin = false;
				})
		);
	}
	ngAfterViewInit() {
		this.deaSchedulerCodeDetailForm.patchValue(this.deaSchedulerCodeDetail.deaSchedulerCodeDetail);
		if (this.deaSchedulerCodeDetail.action == this.action.VIEW) {
			this.deaSchedulerCodeDetailForm.disable();
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
