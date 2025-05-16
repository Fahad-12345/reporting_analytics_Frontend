import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, AbstractControl, FormArray, Validators, FormControl } from '@angular/forms';
import { Logger } from '@nsalaun/ng-logger';
import { FDServices } from '../../../../fd_shared/services/fd-services.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
	selector: 'app-referral-form',
	templateUrl: './referral-form.component.html'
})
export class ReferralFormComponent implements OnChanges {

	public form: FormGroup
	@Input() caseId: any;
	@Input() referralData: any[] = [];
	@Input() advertisementData: any[] = []
	@Input() referrals: FormArray;
	@Output() getCase = new EventEmitter();
	public advertisments: FormArray;
	public allAds: any[];

	public allReferrals: any[];
	disableBtn = false
	constructor(private fb: FormBuilder, private logger: Logger, private route: ActivatedRoute, private fd_services: FDServices, private router: Router, private toastrService: ToastrService) {
		this.setForm()
		this.getReferrals()
		this.getAdvertisments()
	}

	ngOnInit() {
	}

	ngOnChanges(changes: SimpleChanges) {
		// ;
		if (changes && changes['referralData']) {
			if (!this.fd_services.isEmpty(changes['referralData'].currentValue)) {
				this.logger.log('referral', this.referralData)
				this.setValues();
			}
		}

		if (this.caseId) {
			this.form.patchValue({ caseId: this.caseId })
		}
	}

	setValues() {
		// this.form.controls['referredBy'] = this.fb.array([])
		this.removeReferral(0)
		this.removeAd(0)
		this.resetReferralArray()
		this.resetAdArray()
		this.form.patchValue({ caseId: this.caseId })


		this.referralData.forEach(element => {
			const referral = this.form.get('referredBy') as FormArray;
			referral.push(this.fb.group({
				id: element.refferedById,
				name: element.description,
			}));
			this.form.updateValueAndValidity()
		});

		this.advertisementData.forEach(element => {
			const advertisments = this.form.get('advertisementBy') as FormArray;
			advertisments.push(this.fb.group({
				id: element.advertisementById,
				name: element.description
			}));
			this.form.updateValueAndValidity()
		});
	}

	resetReferralArray() {
		const referralArray = this.form.get('referredBy') as FormArray;
		while (referralArray.length !== 0) {
			referralArray.removeAt(0)
		}
	}

	resetAdArray() {
		const ad = this.form.get('advertisementBy') as FormArray;
		while (ad.length !== 0) {
			ad.removeAt(0)
		}
	}

	removeReferral(i: number) {
		const referredBy = this.form.get('referredBy') as FormArray;
		referredBy.removeAt(i)
	}

	removeAd(i: number) {
		const ad = this.form.get('advertisementBy') as FormArray;
		ad.removeAt(i)
	}

	setForm() {
		this.form = this.fb.group({
			id: null,
			referredBy: this.fb.array([this.createReferredBy()]),
			advertisementBy: this.fb.array([this.createAdvertisement()]),
			caseId: this.caseId
		});
	}

	createAdvertisement(): FormGroup {
		return this.fb.group({
			id: '',
			name: ''
		})
	}

	addAdvertisement(): void {
		this.advertisments = this.form.get('advertisementBy') as FormArray;
		this.advertisments.push(this.createAdvertisement());
	}

	getAdvertisments(): void {
		this.fd_services.getAdvertisements().subscribe(res => {
			if (res.statusCode == 200) {
				this.allAds = res.data;
			}
		})
	}


	createReferredBy(): FormGroup {
		return this.fb.group({
			id: ['', [Validators.required]],
			name: ['', [Validators.required]]
		})
	}

	addReferral(): void {
		const arr = this.form.get('referredBy') as FormArray;
		arr.push(this.createReferredBy());
		this.form.updateValueAndValidity()
	}

	getReferrals(): void {
		this.fd_services.getReferrals().subscribe(res => {
			if (res.statusCode == 200) {
				this.allReferrals = res.data;
			}
		})
	}

	onSubmit(form) {
		this.logger.log(form);
		if (this.form.valid) {
			this.disableBtn = true
			this.logger.log('form is valid')
			this.fd_services.addReferredByAdvertisementBy(form).subscribe(res => {
				this.disableBtn = false
				if (res.statusCode == 200) {
					this.getCase.emit()
					this.toastrService.success('Data added successfully', 'Success')
				} else {
					this.toastrService.error('Something went wrong', 'Error')
				}
			}, err => {
				this.disableBtn = false
				this.toastrService.error(err.error.error.messge, 'Error')
			})
		} else {
			this.logger.log('form is invalid');
			this.fd_services.touchAllFields(this.form);
		}
	}

	goBack() {
		this.router.navigate(['referrals'], { relativeTo: this.route.parent.parent.parent })
	}
}
