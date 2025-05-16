import {
	Component,
	OnInit,
	Input,
	OnChanges,
	SimpleChanges,
	EventEmitter,
	Output,
	OnDestroy,
	ViewChild,
} from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { Logger } from '@nsalaun/ng-logger';
import { FDServices } from '../../services/fd-services.service';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { Subscription } from 'rxjs';
import { FieldConfig } from '@appDir/shared/dynamic-form/models/fieldConfig.model';
import { DivClass } from '@appDir/shared/dynamic-form/models/DivClass.class';
import { InputClass } from '@appDir/shared/dynamic-form/models/InputClass.class';
import { InputTypes } from '@appDir/shared/dynamic-form/constants/InputTypes.enum';
import { AddressClass } from '@appDir/shared/dynamic-form/models/AddressClass.class';
import { ButtonClass } from '@appDir/shared/dynamic-form/models/ButtonClass.class';
import { ButtonTypes } from '@appDir/shared/dynamic-form/constants/ButtonTypes.enum';
import { DynamicFormComponent } from '@appDir/shared/dynamic-form/components/dynamic-form/dynamic-form.component';
import { RadioButtonClass } from '@appDir/shared/dynamic-form/models/RadioButtonClass.class';
import { SelectClass } from '@appDir/shared/dynamic-form/models/SelectClass.class';

@Component({
	selector: 'app-mri-intake1-form',
	templateUrl: './mri-intake1-form.component.html',
	styleUrls: ['./mri-intake1-form.component.scss'],
})
export class MriIntake1FormComponent implements OnChanges, OnDestroy {
	subscription: Subscription[] = [];
	public form: FormGroup;
	@Input() title = 'Edit';
	@Input() caseData: any;
	@Input() caseId: any;
	@Input() patientId: any;
	@Input() visitSessionId: any;
	@Output() getCase = new EventEmitter();
	@Output() setVisitSessionId = new EventEmitter();
	public insuranceType: string = 'major medical';
	public contactPersonTypesId: number = 3;
	public relations: any[];
	public prevSurgArr: FormArray;
	public surgeryExaminationArr: FormArray;
	public expProblemArr: any[] = [];
	public surgicalTypes: any[] = [];
	public bodyParts = [];
	formEnabled: boolean = false;
	enableflag: boolean = true;
	// public visitSessionId: any;
	disableBtn = false;
	constructor(
		private fb: FormBuilder,
		private logger: Logger,
		private fd_services: FDServices,
		private toastrService: ToastrService,
		private route: ActivatedRoute,
		private router: Router,
	) {
		// this.createVisitSession.emit();
		this.setForm();
		this.getRelations();
	}

	ngOnInit() {
		this.getSurgicalTypes();
		this.getBodyParts();
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes && changes['caseData']) {
			if (!this.fd_services.isEmpty(this.caseData) && changes['caseData'].currentValue) {
				this.caseId = this.caseData.id;
				this.patientId = this.caseData.patient.id;
				this.assignValues();
			}
		}
	}

	assignValues() {
		let data = this.caseData.surgicalDetails;
		if (data) {
			this.form.patchValue({
				id: data.id,
				hadSurgery: data.hadSurgery,
				hadExamination: data.hadExamination,
				experiencedProblem: data.experiencedProblem,
				description: '',
				caseId: this.caseId,
				patientId: this.patientId,
				visitSessionId: data.visiSessionId,
			});
			if (data.visiSessionId) {
				this.setVisitSessionId.emit(data.visiSessionId);
			}
		}
		console.log('this.data', data);
		// this.clearFormArray(<FormArray>this.form.get('prevSurgArr'));
		// this.clearFormArray(<FormArray>this.form.get('surgeryExaminationArr'));
		// this.clearFormArray(<FormArray>this.form.get('explianProblem'));
		if (data && data.hadSurgery) {
			this.clearFormArray(<FormArray>this.form.get('prevSurgArr'));
			let surgeriesData = this.caseData.previousSurgeries;
			surgeriesData.forEach((element) => {
				let prevSurgArr = <FormArray>this.form.get('prevSurgArr');
				prevSurgArr.push(
					this.fb.group({
						dateOfSurgery:
							element.dateOfSurgery != null ? element.dateOfSurgery.split('T')[0] : null,
						typeOfSurgeryId: element.typeOfSurgeryId,
						surgeryTestedToday: element.surgeryTestedToday,
					}),
				);
				this.form.updateValueAndValidity();
			});
		}

		if (data && data.hadExamination) {
			this.clearFormArray(<FormArray>this.form.get('surgeryExaminationArr'));
			let surgeryExaminations = this.caseData.surgeryExaminations;
			surgeryExaminations.forEach((element) => {
				let surgeryExaminationArr = <FormArray>this.form.get('surgeryExaminationArr');
				surgeryExaminationArr.push(
					this.fb.group({
						typeOfStudy: element.typeOfStudy,
						bodyPartId: element.bodyPartId,
					}),
				);
				this.logger.log('surgeryExaminationArr', surgeryExaminationArr);
				// this.form.updateValueAndValidity()
			});
		}

		if (data && data.experiencedProblem) {
			this.clearFormArray(<FormArray>this.form.get('expProblemArr'));
			this.caseData.comments.forEach((element) => {
				if (element.type == 'explainProblem') {
					let expProblemArr = <FormArray>this.form.get('expProblemArr');
					expProblemArr.push(new FormControl(element.description));
				}
			});
		}
		this.disableForm();
	}
	clearFormArray = (formArray: FormArray) => {
		if (formArray && formArray.length) {
			while (formArray.length !== 0) {
				formArray.removeAt(0);
			}
		}
	};
	getRelations() {
		this.subscription.push(
			this.fd_services.getRelations().subscribe((res) => {
				if (res.statusCode == 200) {
					this.relations = res.data;
				}
			}),
		);
	}

	setForm() {
		this.form = this.fb.group({
			id: null,
			hadSurgery: ['', [Validators.required]],
			prevSurgArr: this.fb.array([]),
			hadExamination: ['', [Validators.required]],
			surgeryExaminationArr: this.fb.array([]),
			experiencedProblem: ['', [Validators.required]],
			description: '',
			expProblemArr: this.fb.array([]),
			caseId: this.caseId,
			patientId: this.patientId,
			visiSessionId: this.visitSessionId,
		});
		this.disableForm();
	}

	addSurgeryItems(): void {
		const arr = this.form.get('prevSurgArr') as FormArray;
		arr.push(this.createSurgeryItem());
	}

	addDescription(value): void {
		if (value != '') {
			const arr = <FormArray>this.form.get('expProblemArr');
			arr.push(new FormControl(value));
			// this.expProblemArr.push(value);
			this.form.patchValue({ description: '' });
			this.logger.log(arr);
		}
	}

	createSurgeryItem(): FormGroup {
		return this.fb.group({
			dateOfSurgery: ['', [Validators.required]],
			typeOfSurgeryId: ['', [Validators.required]],
			surgeryTestedToday: ['', [Validators.required]],
		});
	}

	clearSurgeryItems(): void {
		this.form.controls['prevSurgArr'] = this.fb.array([]);

		// let prevSurgeryArr = this.form.get('prevSurgArr') as FormArray;
		//  for(var i = 0; i<=prevSurgeryArr.length; i++) {
		//     this.prevSurgArr.removeAt(i)
		//  }
	}

	clearExamationItems(): void {
		let examArr = this.form.get('surgeryExaminationArr') as FormArray;
		for (var i = 0; i < examArr.length; i++) {
			this.surgeryExaminationArr.removeAt(i);
		}
	}

	clearDescriptions(): void {
		this.form.controls['expProblemArr'] = this.fb.array([]);
	}

	addDiagnosticItem(): void {
		this.surgeryExaminationArr = this.form.get('surgeryExaminationArr') as FormArray;
		this.surgeryExaminationArr.push(this.createDiagnositcItem());
	}

	createDiagnositcItem(): FormGroup {
		return this.fb.group({
			typeOfStudy: ['', [Validators.required]],
			bodyPartId: ['', [Validators.required]],
		});
	}

	removeSurgeryItem(index) {
		this.logger.log(index);
		let prevSurgArr = <FormArray>this.form.get('prevSurgArr');
		prevSurgArr.removeAt(index);
	}

	removeDiagnosticItem(index) {
		this.logger.log(index);
		let arr = <FormArray>this.form.get('surgeryExaminationArr');
		arr.removeAt(index);
	}

	removeDescription(index) {
		const arr = <FormArray>this.form.get('expProblemArr');
		arr.removeAt(index);
		// this.expProblemArr.splice(index, 1);
	}

	// addDescriptionItem() : void {
	//     this.descriptionArr = this.form.get('expProblemArr') as FormArray
	//     this.dignosticArr.push();
	// }

	getSurgicalTypes() {
		this.subscription.push(
			this.fd_services.getSurgicalTypes().subscribe((res) => {
				if (res.statusCode == 200) {
					this.surgicalTypes = res.data;
					this.surgicalTypes = this.surgicalTypes.map(res => {
						return { id: res.id, name: res.name }
					})
				}
			}),
		);
	}

	getBodyParts() {
		this.subscription.push(
			this.fd_services.getBodyParts({all_body_parts:true}).subscribe(
				(res) => {
					this.bodyParts = res.data;
					this.logger.log('bodyparts', this.bodyParts);
				},
				(err) => { },
			),
		);
	}

	onSubmit(form) {
		this.logger.log(form);
		form['caseId'] = this.caseId;
		if (this.form.valid) {
			this.disableBtn = true;
			this.logger.log('form is valid');
			if (form.id == null) {
				if (!this.visitSessionId) {
					let visitSessionData = {
						visitTypeId: 1,
						caseId: +this.caseId,
						patientId: this.patientId,
					};
					this.subscription.push(
						this.fd_services.createVisitSession(visitSessionData).subscribe((res) => {
							if (res.statusCode == 200) {
								this.form.markAsUntouched();
								this.form.markAsPristine();
								this.visitSessionId = res.data.visitSessionId;
								this.setVisitSessionId.emit(this.visitSessionId);
								this.add(form);
							}
						}),
					);
				} else {
					this.add(form);
				}
			} else {
				this.update(form);
			}
		} else {
			this.logger.log('form is invalid');
			this.fd_services.touchAllFields(this.form);
		}
	}

	update(form) {
		this.subscription.push(
			this.fd_services.updateSurgicalDetails(form).subscribe(
				(res) => {
					this.disableBtn = false;
					this.form.markAsUntouched();
					this.form.markAsPristine();
					this.getCase.emit();
					this.toastrService.success('Data Update Successfully', 'Success');
				},
				(err) => {
					this.disableBtn = false;
					this.toastrService.error(err.error.error.message, 'Error');
				},
			),
		);
	}

	add(form) {
		console.log('this.visitSession', this.visitSessionId);
		form['visitSessionsId'] = this.visitSessionId;
		form['patientId'] = this.patientId;
		console.log('form', form);
		this.subscription.push(
			this.fd_services.addSurgicalDetails(form).subscribe(
				(res) => {
					this.disableBtn = false;
					this.form.markAsUntouched();
					this.form.markAsPristine();
					this.getCase.emit();
					this.toastrService.success('Data Added Successfully', 'Success');
				},
				(err) => {
					this.disableBtn = false;
					this.toastrService.error(err.error.error.message, 'Error');
				},
			),
		);
	}
	enableForm(enableflag) {
		if (enableflag == false) {
			this.disableForm();
			return;
		} else {
			this.form.enable();
			this.formEnabled = true;
			this.enableflag = false;
		}
	}
	disableForm() {
		this.form.disable();
		this.formEnabled = false;
		this.enableflag = true;
	}

	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
		this.logger.log('MRI-intake OnDestroy Called');
	}
}
