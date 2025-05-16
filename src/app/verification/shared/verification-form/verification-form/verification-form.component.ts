import { VerificationSentSplitListComponent } from './../../../verification-sent-list/verification-sent-listing.component';
import { VerificationSplitListComponent } from './../../verification-split-listing/verification-split-listing.component';
import { VerificationFormSplitComponent } from './../verification-form-split/verification-form-split.component';

import {
	Component,
	Input,
	OnInit,
	OnChanges,
	SimpleChanges,
	ViewChild,
	EventEmitter,
	Output,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { VerificationService } from '@appDir/verification/verification.service';
@Component({
	selector: 'app-verification-form',
	templateUrl: './verification-form.component.html',
	styleUrls: ['./verification-form.component.scss'],
})
export class VerificationFormComponent implements OnInit, OnChanges {
	@Input() currentBill: any = {};

	denialForm: FormGroup;
	verificationSplitListComponent: VerificationSplitListComponent;
	@Output() getChangePageDataDenial = new EventEmitter();
	@Output() addManualAppeal = new EventEmitter();
	@Output() genertePomEnvelope = new EventEmitter();
	colGrid = 'col-lg-12';
	showVerificationSentForm = false;
	verificationSentInfo: any;
	@ViewChild('verificationSplitListComponent') set setdenialList(
		content: VerificationSplitListComponent,
	) {
		if (content) {
			// initially setter gets called with undefined
			this.verificationSplitListComponent = content;
		}
	}
	verificationFormComponent: VerificationFormSplitComponent;
	@ViewChild('verificationFormComponent') set setdenialForm(
		content: VerificationFormSplitComponent,
	) {
		if (content) {
			// initially setter gets called with undefined
			this.verificationFormComponent = content;
		}
	}

	verficiationSentList: VerificationSentSplitListComponent;
	@ViewChild('verficiationSentList') set setverficationSentList(
		content: VerificationSentSplitListComponent,
	) {
		if (content) {
			// initially setter gets called with undefined
			this.verficiationSentList = content;
		}
	}

	constructor(public verficationService: VerificationService) {}

	ngOnInit() {}

	ngOnChanges(changes: SimpleChanges): void {
		// if (this.currentBill && Object.keys(this.currentBill).length > 0) {
		// 	let fileName = this.makeFileName(this.currentBill);
		// 	this.setFileName(fileName, this.denialForm, 'file_name');
		// } 
	}

	addManualAppealEmitter(row) {
		debugger;
		this.addManualAppeal.emit(row);
		this.verficationService.setVerificationReceivedId(row.id);
	}

	selectVerificationSentTab($event?){
		
		if (this.verficiationSentList){
		this.verficiationSentList.verificationSentInfoThroughSubject();
		}
	}

	onChangeDataVerification($event) {
		this.verificationFormComponent.resetDenialForm();
		this.getChangePageDataDenial.emit($event);
	}

	displayVerificationSentDetail(e: any){
		if(e){
			this.showVerificationSentForm = true;
			this.colGrid = 'col-lg-9';
			this.verificationSentInfo = e;
		}else{
			this.showVerificationSentForm = false;
			this.colGrid = 'col-lg-12';
			this.verificationSentInfo = '';
		}
	}

	editVerificationEmitter(e){
		if(e){
			this.showVerificationSentForm = false;
			this.colGrid = 'col-lg-12';
			this.verificationSentInfo = '';
			this.selectVerificationSentTab();
		}
	}
	selectVerficationRecivedTab($event){
		this.verificationFormComponent.resetDenialForm();
	}

	generateBillEnvelopePacketPom(type){
		debugger;
		let params = {
			type: type, 
			bill_id: this.currentBill.id,
			facility_id:this.currentBill.facility_id,
			speciality_id:this.currentBill.speciality_id,
		    doctor_id:this.currentBill.doctor_id,
			is_info_updated:this.currentBill.is_info_updated,
			currentBillHistory: this.currentBill,
			...this.currentBill,
			fromVerification : true
		}

		this.genertePomEnvelope.emit(params);

	}
}
