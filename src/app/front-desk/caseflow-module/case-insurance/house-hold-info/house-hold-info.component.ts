import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { Component, OnInit, OnDestroy, ViewChild, SimpleChanges, OnChanges, ChangeDetectorRef } from '@angular/core';
import { MainService } from '@shared/services/main-service';
import { Title } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { LocalStorage } from '@shared/libs/localstorage';
import { ActivatedRoute } from '@angular/router';
import { Logger } from '@nsalaun/ng-logger';
import { FRONT_DESK_LINKS } from '@appDir/front-desk/models/leftPanel/leftPanel';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { SelectionModel } from '@angular/cdk/collections';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {
	changeDateFormat,
	dateFormatterMDY,
	dateObjectPicker,
	unSubAllPrevious,
} from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { Observable, Subscription } from 'rxjs';
import { FieldConfig } from '@appDir/shared/dynamic-form/models/fieldConfig.model';
import { DivClass } from '@appDir/shared/dynamic-form/models/DivClass.class';
import { RadioButtonClass } from '@appDir/shared/dynamic-form/models/RadioButtonClass.class';
import { InputClass } from '@appDir/shared/dynamic-form/models/InputClass.class';
import { InputTypes } from '@appDir/shared/dynamic-form/constants/InputTypes.enum';
import { SelectClass } from '@appDir/shared/dynamic-form/models/SelectClass.class';
import { ButtonClass } from '@appDir/shared/dynamic-form/models/ButtonClass.class';
import { ButtonTypes } from '@appDir/shared/dynamic-form/constants/ButtonTypes.enum';
import { DynamicFormComponent } from '@appDir/shared/dynamic-form/components/dynamic-form/dynamic-form.component';
import { DynamicControl } from '@appDir/shared/dynamic-form/models/DynamicControl.class';
import { getFieldControlByName } from '@appDir/shared/dynamic-form/helper';
import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';
import { HouseholdInfo } from '@appDir/front-desk/models/HouseHoldInfo';
import { makeDeepCopyArray, WithoutTime } from '@appDir/shared/utils/utils.helpers';
import { AutoCompleteClass } from '@appDir/shared/dynamic-form/models/AutoCompleteClass.class';
import { BillingInsuranceModel } from '@appDir/front-desk/masters/billing/insurance-master/models/BillingInsurance.Model';
import { ParamQuery, OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { InsuranceUrlsEnum } from '@appDir/front-desk/masters/billing/insurance-master/Insurance/insurance-list/Insurance-Urls-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { Location } from '@angular/common';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
@Component({
	selector: 'app-house-hold-info',
	templateUrl: './house-hold-info.component.html',
	styleUrls: ['./house-hold-info.component.scss'],
})
export class HouseHoldInfoComponent extends PermissionComponent implements OnInit, OnDestroy, OnChanges {
	subscription: Subscription[] = [];
	public rows: any[];
	public form: FormGroup;
	public anyOneLiveForm: FormGroup;
	public contact_information: FormGroup;
	public InsuranceForm: FormGroup;
	public title: string;
	public caseData: any;
	public caseId: number;
	public house_hold_information: any[] = [];
	public relations: any[] = [];
	selection = new SelectionModel<Element>(true, []);
	personInfo: HouseholdInfo;
	public modalRef: NgbModalRef;
	formEnabled: boolean = false;
	disableBtn: boolean = false;
	lstInsurance: BillingInsuranceModel[] = [];
	houseHoldTitle: string
	@ViewChild(DynamicFormComponent) component: DynamicFormComponent;
	data: any[] = null;
	fieldConfig: FieldConfig[] = [];
	radiobtnFieldConfig: FieldConfig[] = [];
	constructor(
		private fb: FormBuilder,
		private modalService: NgbModal,
		private mainService: MainService,
		private toastrService: ToastrService,
		private fd_services: FDServices,
		private localStorage: LocalStorage,
		titleService: Title,
		private route: ActivatedRoute,
		private logger: Logger,
		private customDiallogService : CustomDiallogService ,
		private _route: ActivatedRoute,
		private cd: ChangeDetectorRef,
		private caseFlowService: CaseFlowServiceService,
		protected requestService: RequestService,
		private location: Location,
		aclService: AclService,
		public datePipeService:DatePipeFormatService
	) {
		super(aclService);
		titleService.setTitle(this._route.snapshot.data['title']);
		this.route.snapshot.pathFromRoot.forEach((path) => {
			if (path && path.params && path.params.caseId) {
				if (!this.caseId) {
					this.caseId = path.params.caseId;
				}
			}
		});
		// this.setForm();
		this.setConfigration();
		this.getRadioButtonConfigration();
		this.getCase();

	}
	@ViewChild('addHouseHold') modal: HouseHoldInfoComponent;
	ngAfterViewInit() {
		if (this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_household_view)) {
			this.anyOneLiveForm = this.component.form
			this.forValuesChanges();

			if (this.anyOneLiveForm) {
				this.anyOneLiveForm.patchValue({
					household_information_dialog: this.caseData && this.caseData.house_hold_information && this.caseData.house_hold_information.household_information_dialog && this.caseData.house_hold_information.household_information_dialog !="none" ? this.caseData.house_hold_information.household_information_dialog : null
				})
			}
		}

		if(!this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_household_edit)) {
			this.anyOneLiveForm.disable();
			this.hideButtons();
				// this.disableForm();
				
			}

		
		// if (this.house_hold_information.length == 0) {
		// 	this.anyOneLiveForm.patchValue({
		// 		anyOneLive: "false"
		// 	}, { emitEvent: false })
		// }
	}
	/**
	 * open modal on anyonelive change frist time
	 * or check for discard changes
	 */
	forValuesChanges() {
		this.subscription.push(this.anyOneLiveForm.get('household_information_dialog').valueChanges.subscribe(res => {
			let data = this.caseData && this.caseData.house_hold_information.data ? this.caseData.house_hold_information.data : []
			if (res == "yes" && data.length < 1) {
				this.savePeopleModal(this.modal)
			}
			if (res == "no" && data.length > 0) {
				this.confirmDel()
			}
		}))

	}

	ngOnChanges(changes: SimpleChanges) {

	}
	ngOnInit() {
		this.getRelations();
		this.mainService.setLeftPanel(FRONT_DESK_LINKS);
		this.title = this.route.snapshot.data['title'];
		this.getInsurances().subscribe(data => {
			this.lstInsurance = data['result'].data
			let insuranceField = getFieldControlByName(this.fieldConfig, 'insurance_company')
			let idField = getFieldControlByName(insuranceField.children, 'id')
			idField.items = this.lstInsurance
		})
		this.getCase();
	}
	/**
	 * get case data
	 */
	getCase(callback?) {
		let rout = "house_hold_info"
		this.subscription.push(
			this.caseFlowService.getCase(this.caseId, rout).subscribe((res) => {
				callback ? callback() : null
				if (res.status == 200) {
					this.caseData = res['result'].data;
					if (this.caseData.length == 0 || this.caseData.length == undefined) {
						// this.anyOneLiveForm.patchValue({
						// 	anyOneLive: "false"
						// }, { emitEvent: false })
						if (this.anyOneLiveForm) {
							this.anyOneLiveForm.patchValue({
								household_information_dialog: this.caseData.house_hold_information.household_information_dialog &&  this.caseData.house_hold_information.household_information_dialog !="none" ? this.caseData.house_hold_information.household_information_dialog : null
							})
						}

					}

					this.assignValues(this.caseData);
					this.selection.clear();
				}
			},
				(err) => {
					this.toastrService.error(err.message, 'Error');
				},
			),
		);
	}
	/**
	 * get Relations
	 */
	getRelations() {
		this.subscription.push(
			this.fd_services.getRelations().subscribe((res) => {
				if (res.status == 200) {
					this.relations = res['result'] ? res['result'].data : [];
					getFieldControlByName(this.fieldConfig, 'contact_person_relation_id').options = this.relations.map(res => {
						return { name: res.name, label: res.name, value: res.id }
					})
					getFieldControlByName(this.fieldConfig, 'contact_person_relation_id').values = null
				}
			}),
		);
	}
	showtable: boolean
	/**
	 * set value 
	 */
	assignValues(data?) {
		this.house_hold_information = this.caseData.house_hold_information && this.caseData.house_hold_information.data ? this.caseData.house_hold_information.data : [];
		let dialogue = this.caseData.house_hold_information && this.caseData.house_hold_information.household_information_dialog &&  this.caseData.house_hold_information.household_information_dialog !="none" ? this.caseData.house_hold_information.household_information_dialog : null
		this.house_hold_information = makeDeepCopyArray(this.house_hold_information)
		if (this.house_hold_information.length > 0) {
			this.showtable = true;
			if (this.anyOneLiveForm) {
				// 	this.anyOneLiveForm.patchValue({
				// 		anyOneLive: "true"
				// 	}, { emitEvent: false })
				this.anyOneLiveForm.patchValue({
					household_information_dialog: dialogue
				})
			}

		}
		else
			this.showtable = false
	}
	/**
	 * Add house hold data
	 * @param form 
	 * 	 */
	add(form) {
		// let data = { ...form, is_deleted: false, is_delete_all: false }
		getFieldControlByName(this.fieldConfig, 'div-btn').configs.disabled = true
		let value = this.anyOneLiveForm.get('household_information_dialog').value
		this.subscription.push(
			this.caseFlowService.updateCase(this.caseId, { household_information: { ...form, is_deleted: false, is_delete_all: false, household_information_dialog: value } }).subscribe(res => {
				this.getCase();
				// this.selection.clear();
				getFieldControlByName(this.fieldConfig, 'div-btn').configs.disabled = false
				this.modalRef.close();
				this.disableForm();
				this.disableBtn = false;
				this.toastrService.success('Successfully Added', 'Success');
				this.showtable = true;

			}),
		);
	}
	/**
	 * update house hold info
	 * @param form 
	 */
	update(form, is_deleted_val?, is_delete_all_val?) {
		getFieldControlByName(this.fieldConfig, 'div-btn').configs.disabled = true
		let value = this.anyOneLiveForm.get('household_information_dialog').value
		this.house_hold_information.length == 1 && is_deleted_val == true ? value = "no" : ''
		is_delete_all_val ? value = 'no' : ''
		// let data = { ...form, is_deleted: is_deleted_val, is_delete_all: is_delete_all_val }
		this.subscription.push(
			this.caseFlowService.updateCase(this.caseId, { household_information: { ...form, is_deleted: is_deleted_val, is_delete_all: is_delete_all_val, household_information_dialog: value } }).subscribe(res => {
				this.getCase();
				this.modalRef.close();
				getFieldControlByName(this.fieldConfig, 'div-btn').configs.disabled = false
				this.disableForm();
				// this.selection.clear();
				this.disableBtn = false;
				if (is_deleted_val || is_delete_all_val)
					this.toastrService.success('Successfully Deleted ', 'Success');
				else
					this.toastrService.success('Successfully Updated ', 'Success');

			}),
		);
	}
	/**
	 * on form submit
	 * @param form 
	 */
	submit(form) {
		form.dob = form.dob ? changeDateFormat(form.dob) : null;
		form.effective_date = form.effective_date ? changeDateFormat(form.effective_date) : null;
		form.expiry_date = form.expiry_date ? changeDateFormat(form.expiry_date) : null;
		form.contact_information && form.contact_information.insurance_company? form.insurance_company = form.contact_information.insurance_company:form.insurance_company=null;
		this.logger.log('form is valid');
		this.disableBtn = true;
		// this.form.patchValue({
		// 	case_id: this.caseId,
		// });
		form.case_id = this.caseId

		if (form.id == null) {
			this.add(form);
		} else {
			this.update(form, false, false);
		}

	}


	/**
	 * open modal to add/update
	 */
	savePeopleModal = (content, people?: any): void => {
		let ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			size: 'lg',
			windowClass: 'modal_extraDOc',
		};

		// this.enableForm();
		if (people) {
			this.houseHoldTitle = 'Edit'
			this.personInfo = people;
			console.log('this.personInfo', this.personInfo);
			if (this.personInfo) {
				// this.setFormValues();
			}
		} else {
			// this.setForm();
			this.houseHoldTitle = 'Add'
			this.personInfo = null;
			let insuranceField = getFieldControlByName(this.fieldConfig, 'insurance_company')
			let idField = getFieldControlByName(insuranceField.children, 'id')
			idField.items = this.lstInsurance
			// this.anyOneLiveToggle(false);
		}
		this.modalRef = this.modalService.open(content, ngbModalOptions);
	};

	/**
	 * set form value
	 * 
	 */
	setFormValues() {
	
		// this.anyOneLiveForm.patchValue({
		// 	household_information_dialog: this.caseData.house_hold_information.household_information_dialog
		// })
		this.form.patchValue({
			id: this.personInfo.id,
			case_id: this.personInfo.case_id,
			// anyOneLive: this.personInfo != null ? true : false,
			policy: this.personInfo.policy,
			own_motor_vehicle: this.personInfo.own_motor_vehicle,
			effective_date:
				this.personInfo &&
					this.personInfo.effective_date
					? dateObjectPicker(dateFormatterMDY(this.personInfo.effective_date))
					: null,
			expiry_date:
				this.personInfo &&
					this.personInfo.expiry_date
					? dateObjectPicker(dateFormatterMDY(this.personInfo.expiry_date))
					: null,
		});
		this.contact_information.patchValue({
			id: this.personInfo.contact_information.id,
			first_name: this.personInfo.contact_information.first_name,
			middle_name: this.personInfo.contact_information.middle_name,
			last_name: this.personInfo.contact_information.last_name,
			ssn: this.personInfo.contact_information.ssn,
			cell_phone: this.personInfo.contact_information.cell_phone,
			dob:
				this.personInfo && this.personInfo.contact_information.dob ? this.personInfo.contact_information.dob.split('T')[0] : null,
		})
		if (this.personInfo.contact_information.contact_person_relation_id) {

			this.contact_information.patchValue({
				contact_person_relation_id: this.personInfo.contact_information.contact_person_relation_id,
				other_relation_description: this.personInfo.contact_information.other_relation_description,
			});
		}
		this.InsuranceForm.patchValue({
			id: null,
			name: null
		})
		if (this.personInfo.insurance_company && this.personInfo.insurance_company.id) {
			this.getInsurances('', this.personInfo.insurance_company.id).subscribe(data => {
				let insurance = data['result']
				let insuranceField = getFieldControlByName(this.fieldConfig, 'insurance_company')
				let idField = getFieldControlByName(insuranceField.children, 'id')
				idField.items = [insurance]
				this.InsuranceForm.patchValue({
					id: this.personInfo.insurance_company ? this.personInfo.insurance_company.id : null,
					// name: this.personInfo.insurance_company ? this.personInfo.insurance_company.name : null
				})
			})
		}
		else {
			let insuranceField = getFieldControlByName(this.fieldConfig, 'insurance_company')
			let idField = getFieldControlByName(insuranceField.children, 'id')
			idField.items = this.lstInsurance
		}

	}
	/**
	 * delete household record
	 * @param id 
	 */
	// deleteSelected(id?: number) {
	// 	console.log('Delete Event');
	// 	let ids: any = [];
	// 	if (id) {
	// 		ids.push(id);
	// 	} else {
	// 		this.house_hold_information = null;
	// 		console.log('ids', ids);
	// 		let requestData = {
	// 			ids: ids,
	// 		};
	// 		this.subscription.push(
	// 			this.fd_services.deletePeopleLivingWithPaient(requestData).subscribe(
	// 				(res) => {
	// 					this.selection.clear();
	// 					this.getCase();

	// 					this.toastrService.success('Deleted Successfully', 'Success');
	// 				},
	// 				(err) => {
	// 					this.toastrService.error(err.error, 'Error');
	// 				},
	// 			),
	// 		);
	// 	}
	// }
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.house_hold_information.length;
		return numSelected === numRows;
	}

	/** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggle(event) {
		this.isAllSelected()
			? this.selection.clear()
			: this.house_hold_information.forEach((row) => this.selection.select(row));
	}
	/**
	 * delete confirmation
	 * @param id 
	 */
	confirmDel(row?) {
		if (this.house_hold_information.length > 1) {
			const selected = this.selection.selected;
			let arr: Array<any> = [];
			arr = selected
			arr = arr.map(res => {
				return res.id
			})

			this.customDiallogService.confirm('Delete Confirmation?', 'Do you really want to delete it.','Yes','No')
			.then((confirmed) => {
				
				if (confirmed){
						// this.deleteSelected(id);
						if (row)
						this.update(row, true, false);
					else {
						if (this.selection.selected.length > 0 && !this.isAllSelected()) {
							this.house_hold_information = this.house_hold_information.filter(function (item) {
								return arr.indexOf(item.id) == -1;
							});
						}
						else
							this.update(row, true, true);
					}
				}else{
					this.anyOneLiveForm.patchValue({
						household_information_dialog: 'yes'
					})
				}
			})
			.catch();
		}
		else {
			this.customDiallogService.confirm('Delete Confirmation?', 'Are you sure you want to change the answer!','Yes','No')
			.then((confirmed) => {
				
				if (confirmed){
					if (row)
					this.update(row, true, false);
				else
					this.update(row, true, true);
				}else{
					this.anyOneLiveForm.patchValue({
						household_information_dialog: 'yes'
					})
				}
			})
			.catch();
		}
	}

	/**
	 * enable form
	 */
	enableForm() {
		this.form.enable();
		this.formEnabled = true;
	}
	/**
	 * disable form
	 */
	disableForm() {
		this.form.disable();
		this.modalRef.close();
		this.formEnabled = false;
		if (this.house_hold_information.length < 1) {
			this.showtable = false;
			if (this.anyOneLiveForm) {
				this.anyOneLiveForm.patchValue({
					household_information_dialog: "no"
				}, { emitEvent: false })
			}

		}
	}
	stringfy(obj) {
		return JSON.stringify(obj);
	}
	effectiveDateChange() {
		this.subscription.push(this.form.get('effective_date').valueChanges.subscribe(res => {
			let expiry_date_control = getFieldControlByName(this.fieldConfig, 'expiry_date')
			expiry_date_control.configs.min = res
			if(this.form) {
					if(WithoutTime(new Date(res)) > WithoutTime(new Date)) {
						this.form.controls['effective_date'].setErrors({max_date:true});
					} else {
						this.form.controls['effective_date'].setErrors(null);
					}
			}
		}))


		// this.form.controls['effective_date'].valueChanges.subscribe(res => {
		// 	let expiry_date_control = getFieldControlByName(this.fieldConfig, 'expiry_date')
		// 	expiry_date_control.configs.min = res
		// })
	}
	isDateOfBirthMax() {
		if(this.contact_information) {
		this.subscription.push(this.contact_information.controls['dob'].valueChanges.subscribe((value) => {
			if(WithoutTime(new Date(value)) > WithoutTime(new Date)) {
				this.contact_information.controls['dob'].setErrors({max_date:true});
			} else {
				this.contact_information.controls['dob'].setErrors(null);
			}
		}))
	}
	}
	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
		this.logger.log('house-hold-info OnDestroy Called');
	}

	/**
	 * search insurance for intelience
	 * @param name 
	 */
	SearchInsurance(name) {
		return new Observable((res) => {
			this.getInsurances(name).subscribe(data => {
				this.lstInsurance = data['result'].data
				res.next(this.lstInsurance)
			})
		})
	}
	/**
	 * get insurance for intellicience 
	 * @param name 
	 * @param id 
	 */
	getInsurances(name?, id?) {
		let paramQuery: ParamQuery = { order: OrderEnum.ASC, pagination: true, filter: false, per_page: 10, page: 1 }
		let filter = {}
		if (id) {
			paramQuery.filter = true;
			filter['id'] = id
		}
		if (name) {
			paramQuery.filter = true;
			filter['insurance_name'] = name
		}
		return this.requestService.sendRequest(InsuranceUrlsEnum.Insurance_list_GET, 'get', REQUEST_SERVERS.billing_api_url, { ...paramQuery, ...filter })
	}
	/**
	 *out side form configration 
	 */
	getRadioButtonConfigration() {
		this.radiobtnFieldConfig = [
			new DivClass([
				new RadioButtonClass('Did anyone live with you at the time of accident? *', 'household_information_dialog', [{ name: 'household_information_dialog_yes', label: "Yes", value: "yes" }, { name: 'household_information_dialog_no', value: "no", label: 'No' }], "false", [{ name: 'required', message: 'This field is required', validator: Validators.required }], ['col-xl-6']),
			], ['row']),
			new DivClass([
				new ButtonClass('Back', ['btn', 'btn-primary', 'btn-block mt-0 mb-3 mb-sm-0'], ButtonTypes.button, this.goBack.bind(this), { icon: 'icon-left-arrow me-2', button_classes: [''] }),
				new ButtonClass('Save & Continue', ['btn', 'btn-success', 'btn-block mt-0'], ButtonTypes.submit, null, { icon: 'icon-save-continue me-2', button_classes: [''], name: 'button-div' })
			], ['row', 'form-btn', 'justify-content-center'],'','',{name:'btn-div'})
		]
	}
	/**
	 * submit radiobutton value on Save Button
	 */
	submitRadioButton(form) {
		this.subscription.push(
			this.caseFlowService.updateCase(this.caseId, form).subscribe(res => {
				this.getCase(callback => {
					this.goForward();
				});
			}),
		);
	}
	/**
 * go back
 */
	goBack() {
		this.location.back();
	}
	/*
	go forward
	*/
	goForward() {
		this.caseFlowService.goToNextStep()
	}
	/**
	 * set form configrations
	 */
	setConfigration() {
		this.fieldConfig = [
			new DivClass([
				new DivClass([
					new DivClass([
						new DynamicControl('id', null),
						new InputClass('First Name*', 'first_name', InputTypes.text, '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-sm-6', 'col-lg-4'], { title_case: true }),
						new InputClass('Middle Name', 'middle_name', InputTypes.text, '', [], '', ['col-sm-6', 'col-lg-4'], { title_case: true }),
						new InputClass('Last Name*', 'last_name', InputTypes.text, '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-sm-6', 'col-lg-4'], { title_case: true }),
						new InputClass('SSN', 'ssn', InputTypes.text, '', [{ name: 'minlength', message: 'Length can not be less then 9', validator: Validators.minLength(9) }], '', ['col-sm-6', 'col-lg-4'], { mask: '000-00-0000' }),
						new InputClass('Date of birth (mm/dd/yyyy)', 'dob', InputTypes.date, null, [], '', ['col-sm-12', 'col-lg-4', 'parent-horizontal-label'], { max: new Date() }),
						new InputClass('Cell Phone Number', 'cell_phone', InputTypes.text, '', [{ name: 'minlength', message: 'Length can not be less then 10', validator: Validators.minLength(10) }], '', ['col-sm-6', 'col-lg-4'], { mask: '000-000-0000' }),
						new SelectClass('Relation', 'contact_person_relation_id', [{ name: '', label: '', value: null }], null, [], ['col-sm-6']),
						new InputClass('Please Specify', 'other_relation_description', InputTypes.text, '', [], '', ['col-sm-6']),
						new DivClass([
							new AutoCompleteClass('Insurance Name', 'id', 'insurance_name', 'id', this.SearchInsurance.bind(this), false, null, [], '', ['']),
						], ['col-sm-6'], "", "", { formControlName: "insurance_company" }),
					], ['row'], "", "", { formControlName: "contact_information" }),
				], ['col-12']),


				new InputClass('Policy No', 'policy', InputTypes.text, '', [], '', ['col-sm-6', 'col-lg-4']),
				new InputClass('Effective Date (mm/dd/yyyy)', 'effective_date', InputTypes.date, '', [], '', ['col-sm-12', 'col-lg-4', 'parent-horizontal-label'], { max: new Date() }),
				new InputClass('Expiration Date (mm/dd/yyyy)', 'expiry_date', InputTypes.date, '', [], '', ['col-sm-12', 'col-lg-4', 'parent-horizontal-label'], { min: null }),
				new RadioButtonClass('Does this person own a motor vehicle? ', 'own_motor_vehicle', [{ name: 'own_motor_vehicle_yes', value: 1, label: 'Yes' }, { name: 'own_motor_vehicle_no', value: 0, label: 'No' }], null, [], ['col-12']),
				new DynamicControl('id', null),
				new DynamicControl('case_id', null),
			], ['row']),
			new DivClass([
				new ButtonClass('Cancel', ['btn', 'btn-primary', 'btn-block', 'mt-0 me-3'], ButtonTypes.button, this.disableForm.bind(this), { button_classes: [''] }),
				new ButtonClass('Save', ['btn', 'btn-success', 'btn-block', 'mt-0 ms-3'], ButtonTypes.submit, null, { button_classes: [''], name: 'div-btn' })
			], ['row', 'modal-btn-width', 'justify-content-center'])
		]
	}
	/**
	 * form changes configration
	 * @param event 
	 */
	onReady(event) {
		this.form = event;
		this.contact_information = this.form.get('contact_information') as FormGroup
		this.InsuranceForm = this.contact_information.get('insurance_company') as FormGroup
		this.contact_person_relation_fun();
		this.relationValueCahnge()
		this.effectiveDateChange();
		this.isDateOfBirthMax();
		getFieldControlByName(this.fieldConfig, 'div-btn').configs.disabled = false
		if (this.personInfo)
			this.setFormValues()

		

	}

	hideButtons() {
		this.anyOneLiveForm.disabled ? this.radiobtnFieldConfig[1].classes.push('hidden') : this.fieldConfig[1].classes = this.fieldConfig[1].classes.filter(className => className != 'hidden')
	  }
	/**
	 * relation dropdown condition to show/hide please specify
	 */
	relationValueCahnge() {
		let contact_information = this.form.get('contact_information') as FormGroup
		this.subscription.push(contact_information.get('contact_person_relation_id').valueChanges.subscribe(res => {
			this.contact_person_relation_fun(res);
		}))
	}
	contact_person_relation_fun(val?) {
		let contact_information = this.form.get('contact_information') as FormGroup
		if (val == undefined) { val = getFieldControlByName(this.fieldConfig, 'contact_person_relation_id').values }
		let vall = getFieldControlByName(this.fieldConfig, 'other_relation_description')
		if (val == undefined || val == '' || val != 9) {
			vall.classes.push('hidden')
			contact_information.get('other_relation_description').setValue(null);
		}
		else if (val == 9) {
			vall.classes = vall.classes.filter(className => className != 'hidden')
		}
	}
}
