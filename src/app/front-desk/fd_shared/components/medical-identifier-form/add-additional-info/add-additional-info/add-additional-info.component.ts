import { OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Component, Input } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Observable, Subscription } from 'rxjs';
@Component({
	selector: 'app-add-additional-info',
	templateUrl: './add-additional-info.component.html',
	styleUrls: ['./add-additional-info.component.scss'],
})
export class AddAdditionalInfoComponent implements OnInit {
	public additionalnfoForm: FormGroup;
	updateObj = {
		isGoingToUpdate: false,
		indexNumber: null,
	};
	@Input() medicalIdentifierDetail = null;
	private subscription: Subscription;
	@Input() events: Observable<void>;
	additionalInfoList = [];
	drop(event: CdkDragDrop<any>) {
		this.additionalInfoList[event.previousContainer.data.index] = event.container.data.item;
		this.additionalInfoList[event.container.data.index] = event.previousContainer.data.item;
		if (this.updateObj.isGoingToUpdate) {
			this.resetUpdateObject();
			this.additionalnfoForm.reset();
		}
	}
	constructor(private fb: FormBuilder) {}

	ngOnInit() {
		this.createAdditionalInfoForm();
		this.subscriptionMedicalIdentifier();
	}
	subscriptionMedicalIdentifier() {
		this.subscription = this.events.subscribe(() => this.setMedicationIdentifier());
	}
	createAdditionalInfoForm() {
		this.additionalnfoForm = this.fb.group({
			name: [''],
		});
	}
	setMedicationIdentifier() {
		this.additionalInfoList =
			this.medicalIdentifierDetail &&
			this.medicalIdentifierDetail.additional_information &&
			this.medicalIdentifierDetail.additional_information.length > 0
				? this.medicalIdentifierDetail.additional_information
				: [];
	}
	addUpdateAdditionalInformation() {
		if (this.updateObj.isGoingToUpdate) {
			if (this.additionalnfoForm.controls.name.value.length > 0) {
				this.additionalInfoList[this.updateObj.indexNumber] =
					this.additionalnfoForm.controls.name.value;
				this.resetUpdateObject();
				this.additionalnfoForm.reset();
			}
		} else {
			if (this.additionalnfoForm.controls.name.value.length > 0) {
				this.additionalInfoList.push(this.additionalnfoForm.controls.name.value);
				this.additionalnfoForm.reset();
			}
		}
	}
	deleteAdditionalInfo(index) {
		this.additionalInfoList.splice(index, 1);
		if (this.additionalInfoList.length <= 0) {
			this.resetUpdateObject();
		}
		if (index == this.updateObj.indexNumber) {
			this.resetUpdateObject();
			this.additionalnfoForm.reset();
		}
	}
	getSingleInfo(additionalInfo, index) {
		this.additionalnfoForm.controls.name.setValue(additionalInfo);
		this.updateObj.isGoingToUpdate = true;
		this.updateObj.indexNumber = index;
	}
	RemoveFormValue() {
		this.additionalnfoForm.reset();
		this.resetUpdateObject();
	}
	resetUpdateObject() {
		this.updateObj.isGoingToUpdate = false;
		this.updateObj.indexNumber = null;
	}
	ngOnDestroy() {
		this.subscription.unsubscribe();
	}
}
