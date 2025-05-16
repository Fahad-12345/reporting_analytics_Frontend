import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { MainService } from '@shared/services/main-service';
import { ActivatedRoute } from '@angular/router';
import { LocalStorage } from '@shared/libs/localstorage';
import { Logger } from '@nsalaun/ng-logger';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { FRONT_DESK_LINKS } from '@appDir/front-desk/models/leftPanel/leftPanel';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { SelectionModel } from '@angular/cdk/collections';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { EmployerUrlsEnum } from './Employer-Urls-Enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { CasesUrlsEnum } from '@appDir/front-desk/cases/Cases-Urls-Enum';
import { Title } from '@angular/platform-browser';
import { CanDeactivateComponentInterface } from '@appDir/shared/canDeactivateFormsComponent/CanDeactivateComponent.interface';
import { EmploymentInfoFormComponent } from '@appDir/front-desk/caseflow-module/case-insurance/employer/component/employment-info-form/employment-info-form.component';
import { ReturnToWorkFormComponent } from '@appDir/front-desk/caseflow-module/case-insurance/employer/component/return-to-work-form/return-to-work-form.component';
import { CaseModel, CaseEmployerTypeEnum, CaseEmployer, EmploymentInformationModel, CaseEmployerUpdateObject, DialogEnum, ReturnToWorkModel } from '@appDir/front-desk/fd_shared/models/Case.model';
import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';
import { FieldConfig } from '@appDir/shared/dynamic-form/models/fieldConfig.model';
import { DivClass } from '@appDir/shared/dynamic-form/models/DivClass.class';
import { RadioButtonClass } from '@appDir/shared/dynamic-form/models/RadioButtonClass.class';
import { DynamicFormComponent } from '@appDir/shared/dynamic-form/components/dynamic-form/dynamic-form.component';
import { CaseFlowUrlsEnum } from '@appDir/front-desk/fd_shared/models/CaseFlowUrlsEnum';
import { CaseTypeEnum, CaseTypeIdEnum, PurposeVisitSlugEnum } from '@appDir/front-desk/fd_shared/models/CaseTypeEnums';
import { getFieldControlByName } from '@appDir/shared/dynamic-form/helper';
import { makeDeepCopyObject, makeDeepCopyArray } from '@appDir/shared/utils/utils.helpers';
// import { EmployerFormComponent } from './../../fd_shared/components/employer-form/employer-form.component'
import { DynamicControl } from '@appDir/shared/dynamic-form/models/DynamicControl.class';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { EmployerFormComponent } from '@appDir/front-desk/caseflow-module/case-insurance/employer/component/employer-form/employer-form.component';
import { FacilityUrlsEnum } from '@appDir/front-desk/masters/practice/practice/utils/facility-urls-enum';
import { CustomFormValidators } from '@appDir/shared/customFormValidator/customFormValidator';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';

@Component({
	selector: 'app-employer',
	templateUrl: './employer.component.html',
	styleUrls: ['./employer.component.scss'],
})
export class EmployerComponent extends PermissionComponent implements OnInit, OnDestroy, CanDeactivateComponentInterface {
	subscription: Subscription[] = [];
	public caseData: CaseModel;
	public caseId: number;
	public employers: any[] = [];
	public employmentInfo: EmploymentInformationModel;
	public caseType: string;
	public employer: CaseEmployer;
	public showForm = false;
	public form: FormGroup;
	formEnabled: boolean = false;
	enableflag: boolean = true;
	disableBtn: boolean = false;
	modalRef: NgbModalRef;
	patientId: number;
	showAddEmployee: boolean = false;
	public form1: FormGroup;
	public form2: FormGroup
	title: string
	fieldConfig: FieldConfig[]
	constructor(
		private mainService: MainService,
		private fd_services: FDServices,
		route: ActivatedRoute,
		private localStorage: LocalStorage,
		private logger: Logger,
		private modalService: NgbModal,
		aclService: AclService,
		private customDiallogService: CustomDiallogService,
		private toasterService: ToastrService,
		protected requestService: RequestService,
		titleService: Title,
		private caseFlowService: CaseFlowServiceService,
		public datePipeService: DatePipeFormatService,
		private el: ElementRef
	) {
		super(aclService);
		titleService.setTitle(route.snapshot.data['title']);
		route.snapshot.pathFromRoot.forEach((path) => {
			if (path && path.params && path.params.caseId) {
				if (!this.caseId) {
					this.caseId = path.params.caseId;
				}
			}
		});
	}




	questions(shouldShow: boolean) {

		let classes = ['col-12 col-xl-8']
		if (!shouldShow) {
			classes.push('hidden')
		}

		const secondaryQuestion = new RadioButtonClass('Do you have a secondary employer?', 'secondary_employer_dialog',
			[
				{ name: 'yes', label: 'Yes', value: DialogEnum.yes },
				{ name: 'no', label: 'No', value: DialogEnum.no }
			],
			DialogEnum.none, [], classes)

		const yearlyQuestion = new RadioButtonClass('Do you have a yearly employer?', 'yearly_employer_dialog',
			[
				{ name: 'yes', label: 'Yes', value: DialogEnum.yes },
				{ name: 'no', label: 'No', value: DialogEnum.no }
			],
			DialogEnum.none, [], classes)

		const courseOfEmploymentQuestion = new RadioButtonClass('At the time of your accident, were you in the course of employment?*', 'course_of_employment', [
			{ name: 'Yes', label: 'Yes', value: DialogEnum.yes },
			{ name: 'No', label: 'No', value: DialogEnum.no }
		], DialogEnum.none, [{ name: 'required', message: "This field is required", validator: Validators.required }, { name: 'defaultnoneSelectedError', message: "This field is required", validator: CustomFormValidators.validateDefaultNoneSelectedError }], classes)

		const unEmploymentBenefitsQuestion = new RadioButtonClass('Were you receiving unemployment benefits at the time of accident?*', 'unemployment_benefits', [
			{ name: 'Yes', label: 'Yes', value: DialogEnum.yes },
			{ name: 'No', label: 'No', value: DialogEnum.no }
		], DialogEnum.none, [{ name: 'required', message: "This field is required", validator: Validators.required }, { name: 'defaultnoneSelectedError', message: "This field is required", validator: CustomFormValidators.validateDefaultNoneSelectedError }], classes)

		const referringCompanyQuestion = new RadioButtonClass('Do you have a referring company?', 'primary_employer_dialog', [
			{ name: 'c_Yes', label: 'Yes', value: 'yes' },
			{ name: 'c_No', label: 'No', value: 'no' },
			{ name: 'self', label: 'Self', value: 'self' },
		], DialogEnum.none, [{ name: 'required', message: "This field is required", validator: Validators.required }, { name: 'defaultnoneSelectedError', message: "This field is required", validator: CustomFormValidators.validateDefaultNoneSelectedError }], classes)

		const currentlyEmployed = new RadioButtonClass('Are you currently employed?*', 'primary_employer_dialog', [
			{ name: 'b_Yes', label: 'Yes', value: 'yes' },
			{ name: 'b_No', label: 'No', value: 'no' }
		], DialogEnum.none, [{ name: 'required', message: "This field is required", validator: Validators.required }, { name: 'defaultnoneSelectedError', message: "This field is required", validator: CustomFormValidators.validateDefaultNoneSelectedError }], classes)


		const privateCareCurrentlyEmployed = new RadioButtonClass('Are you currently employed?*', 'primary_employer_dialog', [
			{ name: 'b_Yes', label: 'Yes', value: 'yes' },
			{ name: 'b_No', label: 'No', value: 'no' },
			{ name: 'b_skip', label: 'Skip', value: DialogEnum.skip }
		], DialogEnum.none, [{ name: 'required', message: "This field is required", validator: Validators.required }, { name: 'defaultnoneSelectedError', message: "This field is required", validator: CustomFormValidators.validateDefaultNoneSelectedError }], classes)

		const wereYouEmployed = new RadioButtonClass('At the time of accident, were you employed?', 'primary_employer_dialog', [
			{ name: 'a_Yes', label: 'Yes', value: 'yes' },
			{ name: 'a_No', label: 'No', value: 'no' }
		], DialogEnum.none, [], classes)

		return { wereYouEmployed, secondaryQuestion, yearlyQuestion, courseOfEmploymentQuestion, referringCompanyQuestion, unEmploymentBenefitsQuestion, currentlyEmployed, privateCareCurrentlyEmployed }
	}

	getFormQuestions():FieldConfig[] {
		let caseTypeSlug = this.caseData.case_type && this.caseData.case_type.slug;
		let purposeOfVistSlug = 'speciality';
		switch ( caseTypeSlug ) {
			case  (CaseTypeEnum.worker_compensation):
				if (purposeOfVistSlug === 'speciality') {
					return [
						this.questions(true).secondaryQuestion,
					]
				}

				else {
				return [
					// this.questions(true).wereYouEmployed,
					this.questions(true).secondaryQuestion,
					this.questions(true).yearlyQuestion,
					// this.questions(false).unEmploymentBenefitsQuestion
				]
			}
			case  (CaseTypeEnum.worker_compensation_employer):
				if (purposeOfVistSlug === 'speciality') {
					return [
						this.questions(true).secondaryQuestion,
					]
				}
				
				else {
				return [
					this.questions(true).secondaryQuestion,
					this.questions(true).yearlyQuestion,
				]
			}
			case  CaseTypeEnum.auto_insurance:
				return [
					this.questions(true).courseOfEmploymentQuestion,
					this.questions(false).currentlyEmployed,
					this.questions(false).secondaryQuestion,
					purposeOfVistSlug === 'speciality' ? this.questions(false).yearlyQuestion : null,
					this.questions(false).unEmploymentBenefitsQuestion
				]
			case CaseTypeEnum.auto_insurance_worker_compensation:
				return [
					this.questions(true).courseOfEmploymentQuestion,
					this.questions(false).currentlyEmployed,
					this.questions(false).secondaryQuestion,
					this.questions(false).yearlyQuestion,
					this.questions(false).unEmploymentBenefitsQuestion
				]
			case CaseTypeEnum.corporate:
				return [
					this.questions(true).referringCompanyQuestion,
					// this.questions(false).secondaryQuestion,
					// this.questions(false).yearlyQuestion,
					// this.questions(false).currentlyEmployed,
					// this.questions(false).unEmploymentBenefitsQuestion
				]

			case CaseTypeEnum.lien:
				return [
					this.questions(true).currentlyEmployed,
				]

			case CaseTypeEnum.private_health_insurance:
				return [
					this.questions(true).privateCareCurrentlyEmployed,
				]
		}
	}

	hideFormControl(fields: FieldConfig[], hideToggle: boolean) {
		if (hideToggle) {
			fields.forEach(field => {
				if (field) {
					field.classes.push('hidden');

					field.form.controls[field.name].reset('', { emitEvent: false })


					// field.form.controls[field.name].reset('', { emitEvent: false })
				}
			})
		} else {
			fields.forEach(field => {
				if (field) field.classes = field.classes.filter(className => className != 'hidden')
			})
		}
	}
	bindChanges() {

		if (( this.caseData&&this.caseData.case_type&&(this.caseData.case_type.slug === CaseTypeEnum.worker_compensation || this.caseData.case_type.slug === CaseTypeEnum.worker_compensation_employer)) && !this.hasPrimaryEmployer()) {
			this.openForm(null, CaseEmployerTypeEnum.primary)
		}
		let primary_employer_dialog = getFieldControlByName(this.fieldConfig, 'primary_employer_dialog')
		let secondary_employer_dialog = getFieldControlByName(this.fieldConfig, 'secondary_employer_dialog')
		let yearly_employer_dialog = getFieldControlByName(this.fieldConfig, 'yearly_employer_dialog')
		let course_of_employment = getFieldControlByName(this.fieldConfig, 'course_of_employment')
		let unemployment_benefits = getFieldControlByName(this.fieldConfig, 'unemployment_benefits')

		let primary_employer_dialog_control = this.form.controls['primary_employer_dialog']

		if (primary_employer_dialog_control) {
			let a = primary_employer_dialog_control.valueChanges.subscribe((value: DialogEnum) => {
				debugger;
				let form1 = this.EmploymentInfoFormComponent ? this.EmploymentInfoFormComponent.form : null;
				let form2 = this.ReturnToWorkFormComponent ? this.ReturnToWorkFormComponent.form : null;
				let form3 = this.component ? this.component.form : null;
				if (value == null) { return }
				if (value === DialogEnum.yes) {
					// if value is yes; open popup form in all cases

					if (!this.hasPrimaryEmployer()) { this.openForm(null, CaseEmployerTypeEnum.primary); }

					this.hideFormControl([unemployment_benefits], true)
					this.hideFormControl([secondary_employer_dialog, yearly_employer_dialog], false)
					if (this.caseFlowService.case.case_type.slug === CaseTypeEnum.auto_insurance &&
						this.caseFlowService.case.purpose_of_visit.slug === PurposeVisitSlugEnum.Speciality) {
						this.hideFormControl([yearly_employer_dialog], true)
					}

				} else if (value === DialogEnum.no) {
					// open popup form only if case type is drug testing; else delete primary employer from case employers after confirmation
					if (
						this.caseData &&
						this.caseData.case_type &&
						this.caseData.case_type.slug === CaseTypeEnum.corporate
					) {
						if (!this.hasPrimaryEmployer()) {
							this.openForm(null, CaseEmployerTypeEnum.primary);
						}
						this.hideFormControl(
							[
								secondary_employer_dialog,
								yearly_employer_dialog,
								unemployment_benefits,
							],
							false
						);
					} else {
						if (this.form.value.course_of_employment !== DialogEnum.yes) {
							this.hideFormControl(
								[secondary_employer_dialog, yearly_employer_dialog],
								true
							);
						}
						this.hideFormControl([unemployment_benefits], false);
						if (this.hasPrimaryEmployer()) {
							this.customDiallogService
								.confirm(
									'Are you sure?',
									'This will delete all existing employers.',
									'Yes',
									'No'
								)
								.then((confirmed) => {
									if (confirmed) {
										//delete primary empoyer
										this.deletePrimaryEmployerAndSave();
										this.EmploymentInfoFormComponent.employmentInfo = null;
										this.employment_information_reset_Form(form1);
										Object.keys(form3.controls).forEach((key) => {
											form3.controls[key].markAsUntouched();
											form3.controls[key].markAsPristine();
										});
										this.return_to_work_Form_reset(form2);
									} else {
										let employer = this.getCurrentPrimaryEmployer();
										if (employer.primary_employer_dialog) {
											primary_employer_dialog_control.reset(
												employer.primary_employer_dialog,
												{ emitEvent: false }
											);
										} else
											primary_employer_dialog_control.reset(DialogEnum.none, {
												emitEvent: false,
											});
									}
								})
								.catch();
						}
					}
				} else if (value === DialogEnum.skip) {
					if (this.hasPrimaryEmployer()) {
						this.customDiallogService
							.confirm(
								'Are you sure?',
								'This will delete all existing employers.',
								'Yes',
								'No'
							)
							.then((confirmed) => {
								if (confirmed) {
									//delete primary empoyer
									this.deletePrimaryEmployerAndSave();
									primary_employer_dialog_control.reset(DialogEnum.skip, {
										emitEvent: false,
									});
								} else {
									let employer = this.getCurrentPrimaryEmployer();
									if (employer.primary_employer_dialog) {
										primary_employer_dialog_control.reset(
											employer.primary_employer_dialog,
											{ emitEvent: false }
										);
									} else
										primary_employer_dialog_control.reset(DialogEnum.none, {
											emitEvent: false,
										});
								}
							})
							.catch();
					}
				} else if (value === DialogEnum.self) {
					if (this.hasPrimaryEmployer()) {
						this.customDiallogService
							.confirm(
								'Are you sure?',
								'This will delete all existing employers.',
								'Yes',
								'No'
							)
							.then((confirmed) => {
								if (confirmed) {
									//delete primary empoyer
									this.deletePrimaryEmployerAndSave();
								} else {
									primary_employer_dialog_control.reset(DialogEnum.none, {
										emitEvent: false,
									});
								}
							})
							.catch();
					}
				} else {
					if (this.form.value.course_of_employment !== DialogEnum.yes) {
						this.hideFormControl(
							[secondary_employer_dialog, yearly_employer_dialog],
							true
						);
					}
				}
			})

			this.subscription.push(a)
		}


		let secondary_employer_dialog_control = this.form.controls['secondary_employer_dialog']

		if (secondary_employer_dialog_control) {
			let a = secondary_employer_dialog_control.valueChanges.subscribe(
				(value) => {
					if (value == null) {
						return;
					}
					if (value === DialogEnum.yes) {
						if (!this.hasSecondaryEmployers()) {
							this.openForm(null, CaseEmployerTypeEnum.secondary);
						}
					} else {
						if (this.hasSecondaryEmployers() && value === DialogEnum.no) {
							this.customDiallogService
								.confirm(
									'Are you sure?',
									'This will delete any previous secondary employer(s)',
									'Yes',
									'No'
								)
								.then((confirmed) => {
									if (confirmed) {
										this.deleteSecondaryEmployersAndSave();
									} else {
										secondary_employer_dialog_control.reset(DialogEnum.none, {
											emitEvent: false,
										});
									}
								})
								.catch();
						}
					}
				}
			);

			this.subscription.push(a);
		}



		let yearly_employer_dialog_control = this.form.controls['yearly_employer_dialog']

		if (yearly_employer_dialog_control) {
			let a = yearly_employer_dialog_control.valueChanges.subscribe(value => {
				if (value == null) { return }
				if (value == DialogEnum.yes) {
					if (!this.hasYearlyEmployers()) {
						this.openForm(null, CaseEmployerTypeEnum.yearly)
					}
				} else {
					if (this.hasYearlyEmployers() && value === DialogEnum.no)
						this.customDiallogService.confirm('Are you sure?', 'This will delete all existing yearly employers', 'Yes', 'No')
							.then((confirmed) => {
								if (confirmed) {
									if (this.hasYearlyEmployers()) {
										this.deleteYearlyEmployersAndSave()
									}
								} else {
									yearly_employer_dialog_control.reset(DialogEnum.none, { emitEvent: false })
								}
							})
							.catch();
				}
			})

			this.subscription.push(a)
		}



		let course_of_employment_control = this.form.controls['course_of_employment']

		if (course_of_employment_control) {
			course_of_employment_control.valueChanges.subscribe(value => {
				let form1 = this.EmploymentInfoFormComponent ? this.EmploymentInfoFormComponent.form : null;
				let form2 = this.ReturnToWorkFormComponent ? this.ReturnToWorkFormComponent.form : null;
				let form3 = this.component ? this.component.form : null;
				if (value === DialogEnum.yes) {
					if (!this.hasPrimaryEmployer()) {

						this.openForm(null, CaseEmployerTypeEnum.primary);
					}
					this.hideFormControl([primary_employer_dialog], true)
					this.hideFormControl([secondary_employer_dialog, yearly_employer_dialog], false)
				}
				else if (value === DialogEnum.no) {
					// this.openForm(null, CaseEmployerTypeEnum.primary);
					this.hideFormControl([primary_employer_dialog], false);
					if (this.hasPrimaryEmployer() && this.form.value.primary_employer_dialog === DialogEnum.no) {

						this.customDiallogService.confirm('Are you sure?', 'This will delete all existing employers.', 'Yes', 'No')
							.then((confirmed) => {

								if (confirmed) {
									//delete primary empoyer
									this.deletePrimaryEmployerAndSave();
									this.EmploymentInfoFormComponent.employmentInfo = null
									// form1.reset();
									// form1.patchValue({caseId:this.caseId,id:null,activities:null,gross_salary:null,no_of_days_per_week:null,no_of_hours_per_day:null,
									// 	often_paid:null,receive_lodging:null,title:null,type:null,
									// 	type_description:null,weekly_earning:null,lodging_description:null},{ emitEvent: true })

									// 	this.EmploymentInfoFormComponent.form.markAsUntouched()
									// 		this.EmploymentInfoFormComponent.form.markAsPristine()
									this.employment_information_reset_Form(form1);
									Object.keys(form3.controls).forEach(key => {
										form3.controls[key].markAsUntouched();
										form3.controls[key].markAsPristine();
									});
									this.return_to_work_Form_reset(form2)
									// form2.reset();
									// form3.reset();
									// this.EmploymentInfoFormComponent.form.reset();

								} else {
									primary_employer_dialog_control.reset(DialogEnum.none, { emitEvent: false })
								}
							})
							.catch();

					} else if (this.hasPrimaryEmployer()) {
						this.form.patchValue({ primary_employer_dialog: DialogEnum.yes })
					}
				}
				else {
					this.hideFormControl([primary_employer_dialog, secondary_employer_dialog, yearly_employer_dialog, unemployment_benefits], true)
					if ((this.hasPrimaryEmployer() && this.form.value.primary_employer_dialog === DialogEnum.no) ||
						(this.hasPrimaryEmployer() && this.form.value.course_of_employment === null
							&& this.form.value.id
						)) {
						this.customDiallogService.confirm('Are you sure?', 'This will delete all existing employers', 'Yes', 'No')
							.then((confirmed) => {
								if (confirmed) {
									this.deletePrimaryEmployerAndSave();
									this.EmploymentInfoFormComponent.employmentInfo = null
									this.employment_information_reset_Form(form1);
									Object.keys(form3.controls).forEach(key => {
										form3.controls[key].markAsUntouched();
										form3.controls[key].markAsPristine();
									});
									form2.reset();
								} else {
									let employer = this.getCurrentPrimaryEmployer();
									if (employer.employment_information) {
										let course_of_employment = employer.employment_information.course_of_employment
										course_of_employment_control.reset(course_of_employment, { emitEvent: true })
									}
									else
										course_of_employment_control.reset(DialogEnum.none, { emitEvent: false })
								}
							})
							.catch();
					}
				}
			})
		}

	}

	return_to_work_Form_reset(form: FormGroup) {
		let return_to_work = {
			contact_information: { first_name: '', middle_name: "", last_name: "" },
			current_employment_status: "",
			given_notice_type: "",
			// id: 291
			illness_notice: null,
			illness_notice_date: null,
			return_to_work: null,
			return_to_work_date: null,
			type_of_assignment: '',
			work_stop: null,
			work_stop_date: null
		}
		form.patchValue(return_to_work, { emitEvent: true })
		form.markAsUntouched()
		form.markAsPristine()
	}

	employment_information_reset_Form(employmentform: FormGroup) {
		employmentform.patchValue({
			caseId: this.caseId, activities: null, gross_salary: null, no_of_days_per_week: null, no_of_hours_per_day: null,
			often_paid: null,
			patientId: this.patientId,
			receive_lodging: null, title: null, type: null,
			type_description: null, weekly_earning: null, lodging_description: null
		}, { emitEvent: true })
		employmentform.markAsUntouched()
		employmentform.markAsPristine()
	}

	deleteYearlyEmployersAndSave() {
		this.caseData.employer.case_employers = this.caseData.employer.case_employers.filter(employer => {
			return employer.employer_type_id != CaseEmployerTypeEnum.yearly;

		})
		this.saveCaseEmployer()
	}
	deleteSecondaryEmployersAndSave() {
		this.caseData.employer.case_employers = this.caseData.employer.case_employers.filter(employer => {
			return employer.employer_type_id != CaseEmployerTypeEnum.secondary;

		})
		this.saveCaseEmployer()
	}
	deletePrimaryEmployerAndSave() {
		this.caseData.employer.case_employers.map(employer => {
			if (employer.employer_type_id === CaseEmployerTypeEnum.primary) {
				employer.is_deleted = true
			}
		})
		this.caseData.employer.case_employers = this.caseData.employer.case_employers.filter(employer => {
			return employer.employer_type_id != CaseEmployerTypeEnum.secondary;

		})
		this.caseData.employer.case_employers = this.caseData.employer.case_employers.filter(employer => {
			return employer.employer_type_id != CaseEmployerTypeEnum.yearly;

		})

		// this.employmentInfo.is_d

		// this.deleteSecondaryEmployersAndSave()
		// this.deleteYearlyEmployersAndSave()
		this.reEvaluateForm()
		this.saveCaseEmployer()
	}
	// deleteEmploymentInfo(){
	// 	this.Emp
	// }
	setDynamicForm() {
		if (!this.fieldConfig)
			this.fieldConfig = [
				new DivClass([
					new DynamicControl('id', ''),
					//worker compensation form
					new DivClass([
						...this.getFormQuestions()
					], ['display-contents', 'col-12'], '', '', { name: 'form' }),



				], ['row'])
			]
	}

	@ViewChild(EmploymentInfoFormComponent) EmploymentInfoFormComponent: EmploymentInfoFormComponent;
	@ViewChild(ReturnToWorkFormComponent) ReturnToWorkFormComponent: ReturnToWorkFormComponent;
	@ViewChild(DynamicFormComponent) component: DynamicFormComponent;
	@ViewChild('addemployee') modal: ElementRef;

	onReady(form) {

		this.form = form

		this.bindChanges()
		this.assignValues();
		if (!this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_employer_edit)) {

			this.form.disable();
		}
	}
	ngAfterViewInit() {

		if (this.shouldShowEmploymentInfoForm()) {

			this.getChildProperty();
		}
		if (!this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_employer_edit)) {
			this.EmploymentInfoFormComponent.form.disable();
			this.ReturnToWorkFormComponent.form.disable();

		}
		// this.form = this.component.form;
	}
	getChildProperty() {
		this.form1 = this.EmploymentInfoFormComponent.form;
		this.form2 = this.ReturnToWorkFormComponent.form;

	}
	confirmDel(row: any) {
		let isPrimary = this.caseData.employer.case_employers.find(emp => emp.id === row?.id && emp.employer_type_id === CaseEmployerTypeEnum.primary && (this.caseData && this.caseData.case_type && this.caseData.case_type.slug === CaseTypeEnum.worker_compensation))
		this.customDiallogService.confirm('Delete Confirmation?', row?.insruance_mapped_backward ? 'Click "Yes" to remove Employer and associated Insurance. Click "No" to remove only Employer.' : isPrimary ? 'On deletion of the primary employer, all entered information will be erased and you will redirect to the previous page. Are you sure?' : 'Are you sure you want to delete this employer?', 'Yes', 'No')
			.then((confirmed) => {
				let bodyObj;
				let goBack: boolean = false;
				if (confirmed) {
					let employer = this.caseData.employer.case_employers.find(employer => employer.id == row?.id)
					if (employer.employer_type_id == CaseEmployerTypeEnum.primary) {
						employer.is_deleted = true;
						goBack = true;
						this.caseData.employer.case_employers = this.caseData.employer.case_employers.filter(employer => employer.employer_type_id === CaseEmployerTypeEnum.primary)
						this.form.patchValue({ secondary_employer_dialog: DialogEnum.none, yearly_employer_dialog: DialogEnum.none }, { emitEvent: false });
						this.employment_information_reset_Form(this.EmploymentInfoFormComponent.form);
						this.return_to_work_Form_reset(this.ReturnToWorkFormComponent.form);
						this.EmploymentInfoFormComponent.employmentInfo = null;
					} else {
						this.caseData.employer.case_employers = this.caseData.employer.case_employers.filter(employer => employer.id != row?.id)
					}
					bodyObj = {
						...this.structureEmployerUpdateData(this.caseData.employer.case_employers)
					}
					if (row?.insruance_mapped_backward) {
						bodyObj['primary_employer']['delete_insurance'] = true;
					}
					this.deleteEmployer({ ...bodyObj }, goBack)
				} else if(confirmed == false) {
					if (row?.insruance_mapped_backward) {
						let employer = this.caseData.employer.case_employers.find(employer => employer.id == row?.id)
						if (employer.employer_type_id == CaseEmployerTypeEnum.primary) {
							employer.is_deleted = true;
							goBack = true;
							this.caseData.employer.case_employers = this.caseData.employer.case_employers.filter(employer => employer.employer_type_id === CaseEmployerTypeEnum.primary)
							this.form.patchValue({ secondary_employer_dialog: DialogEnum.none, yearly_employer_dialog: DialogEnum.none }, { emitEvent: false });
							this.employment_information_reset_Form(this.EmploymentInfoFormComponent.form);
							this.return_to_work_Form_reset(this.ReturnToWorkFormComponent.form);
							this.EmploymentInfoFormComponent.employmentInfo = null;
						} else {
							this.caseData.employer.case_employers = this.caseData.employer.case_employers.filter(employer => employer.id != row?.id)
						}
						bodyObj = {
							...this.structureEmployerUpdateData(this.caseData.employer.case_employers)
						}
						bodyObj['primary_employer']['delete_insurance'] = false;
						this.deleteEmployer({ ...bodyObj }, goBack);
					}
				}
			})
			.catch();
	}
	deleteEmployer(data, goBack: Boolean) {
			if(data?.primary_employer && !(data?.primary_employer?.insurance_information)){
				let insurance_information = {
					insurance_id : data?.primary_employer?.insurance_id,
					insurance_location_id : data?.primary_employer?.insurance_location_id,
					payer_id : data?.primary_employer?.payer_id
				}
				data.primary_employer['insurance_information'] = {...insurance_information}
			}
		this.caseFlowService.updateCase(this.caseId, { ...data }).subscribe(data => {
			this.toasterService.success('Deleted Successfully', 'Success');

			goBack && (this.caseData && this.caseData.case_type && this.caseData.case_type.slug === CaseTypeEnum.worker_compensation) ? this.goBack() : null;
			this.getCase()
		}, err => { this.toasterService.error(err.message, 'Error') })
	}
	ngOnInit() {
		this.caseFlowService.addScrollClasses();
		this.mainService.setLeftPanel(FRONT_DESK_LINKS);
		this.getCase();

		// this.getCase();
	}

	getCase(event?: any) {

		this.subscription.push(
			this.caseFlowService.getCase(this.caseId)

				.subscribe((res: any) => {
					if (res.status == 200) {
						this.caseData = res.result.data;
						switch (this.caseData.case_type.slug) {
							case CaseTypeEnum.worker_compensation:
								this.showAddEmployee = true;
								break;
							case  CaseTypeEnum.worker_compensation_employer:
								this.showAddEmployee = true;
								break;
							case  CaseTypeEnum.auto_insurance:
								this.showAddEmployee = true;
								break;
							case CaseTypeEnum.auto_insurance_worker_compensation:
								this.showAddEmployee = true;
								break;
							default:
								this.showAddEmployee = false
								break;
						}
						this.setDynamicForm()
						this.reEvaluateForm()
						this.caseId = this.caseData.id;
						this.employmentInfo = this.caseData.employer.employment_information;
						this.fd_services.setCase(res.result.data.case);

					}
				}),
		);
	}



	isFormDisabled: boolean = false;
	toggleForm() {
		let form1 = this.EmploymentInfoFormComponent ? this.EmploymentInfoFormComponent.form : null;
		let form2 = this.ReturnToWorkFormComponent ? this.ReturnToWorkFormComponent.form : null;

		if (this.isFormDisabled) {
			form1 ? form1.enable() : null
			form2 ? form2.enable() : null
		} else {
			form1 ? form1.disable() : null
			form2 ? form2.disable() : null

		}

		this.isFormDisabled = !this.isFormDisabled;

	}

	goBack() {
		this.caseFlowService.goBack()
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

	openForm = (id, caseEmployerUpdateType): void => {
		this.title = "Add"



		let ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			size: 'xl',
			windowClass: 'modal_extraDOc body-scroll',
		};
		this.modalRef = this.modalService.open(EmployerFormComponent, ngbModalOptions);
		this.modalRef.componentInstance.case_type = this.caseData.case_type;
		this.modalRef.componentInstance.caseId = this.caseData.id;
		this.modalRef.componentInstance.closeModal.subscribe((data: CaseEmployer) => {
			if (data) {
				this.onEmployerFormSubmit(data)
				this.reEvaluateForm();
			} else {
				this.reEvaluateForm();
				this.modalRef ? this.modalRef.close() : null;
			}
		});
		if (id) {
			let employer = this.caseData.employer.case_employers.find(employer => {
				return employer.id == id;
			})
			this.modalRef.componentInstance.case_type = this.caseData.case_type
			this.modalRef.componentInstance.employer = employer;
			this.modalRef.componentInstance.empCaseTypeId = employer.employer_type_id


		}
		if (caseEmployerUpdateType) {
			this.modalRef.componentInstance.empCaseTypeId = caseEmployerUpdateType
		}
	};

	reEvaluateForm(skipEmitEvent?: boolean) {

		let value = this.form ? this.form.value : {}
		if (!this.caseData.employer) { return }
		let primary_employer = this.caseData.employer.case_employers.find(employer => employer.employer_type_id === CaseEmployerTypeEnum.primary)
		// let primary_employer_dialog =
		// 	primary_employer && !primary_employer.is_deleted
		// 		? this.caseData.case_type_id === CaseTypeIdEnum.corporate
		// 			? this.form.value.primary_employer_dialog
		// 			: DialogEnum.yes
		// 		//condition 1
		// 		// : this.hasPrimaryEmployer()
		// 		// 	? DialogEnum.yes
		// 		// 	: this.form.value.primary_employer_dialog === DialogEnum.yes ?
		// 		// 		DialogEnum.none :
		// 		// 		this.form.value.primary_employer_dialog
		// 		//condition 2
		// 		: value.primary_employer_dialog === DialogEnum.no
		// 			? this.caseData.case_type_id === CaseTypeIdEnum.corporate
		// 				? DialogEnum.self
		// 				: this.form.value.primary_employer_dialog === DialogEnum.self
		// 					? DialogEnum.self
		// 					: this.form.value.primary_employer_dialog === DialogEnum.skip
		// 						? DialogEnum.skip
		// 						: DialogEnum.none
		// 			: DialogEnum.none;


		let primary_employer_dialog;

		if (primary_employer && !primary_employer.is_deleted) {
			if (this.caseData && this.caseData.case_type && this.caseData.case_type.slug === CaseTypeEnum.corporate) {
				primary_employer_dialog = this.form.value.primary_employer_dialog
			} else {
				primary_employer_dialog = DialogEnum.yes
			}
		} else {
			if (value.primary_employer_dialog === DialogEnum.no) {
				if (this.caseData && this.caseData.case_type && this.caseData.case_type.slug === CaseTypeEnum.corporate) {
					primary_employer_dialog = DialogEnum.self
				} else {
					if (this.form.value.primary_employer_dialog === DialogEnum.self) {
						primary_employer_dialog = DialogEnum.self
					} else {
						if (this.form.value.primary_employer_dialog === DialogEnum.skip) {
							primary_employer_dialog = DialogEnum.skip

						}
						else if (this.form.value.primary_employer_dialog === DialogEnum.no) {
							primary_employer_dialog = DialogEnum.no

						} else {
							primary_employer_dialog = DialogEnum.none
						}
					}
				}
			}

			else if (value.primary_employer_dialog === DialogEnum.skip) {
				primary_employer_dialog = DialogEnum.skip

			}
			else if (value.primary_employer_dialog === DialogEnum.self) {
				if (this.caseData && this.caseData.case_type && this.caseData.case_type.slug === CaseTypeEnum.corporate) {
					primary_employer_dialog = DialogEnum.self
				}
			}
			else {
				primary_employer_dialog = DialogEnum.none;
			}
		}


		let secondary_employer_dialog = this.caseData.employer.case_employers.filter(employer => employer.employer_type_id === CaseEmployerTypeEnum.secondary).length > 0 ? DialogEnum.yes : value.secondary_employer_dialog === DialogEnum.no ? DialogEnum.no : DialogEnum.none;
		let yearly_employer_dialog = this.caseData.employer.case_employers.filter(employer => employer.employer_type_id === CaseEmployerTypeEnum.yearly).length > 0 ? DialogEnum.yes : value.yearly_employer_dialog === DialogEnum.no ? DialogEnum.no : DialogEnum.none;


		let course_of_employment = this.hasPrimaryEmployer() ? ((CaseTypeEnum.auto_insurance) || (CaseTypeEnum.auto_insurance_worker_compensation)) ? (this.form && this.form.value.course_of_employment) : primary_employer_dialog : !this.hasPrimaryEmployer() ? ((CaseTypeEnum.auto_insurance || CaseTypeEnum.auto_insurance_worker_compensation) && (this.form && this.form.value.primary_employer_dialog == DialogEnum.no)) ? DialogEnum.no : DialogEnum.none : DialogEnum.none

		if (this.form) {
			this.form.patchValue({
				primary_employer_dialog: primary_employer_dialog,
				secondary_employer_dialog,
				yearly_employer_dialog,
				course_of_employment: course_of_employment
			}, { emitEvent: !skipEmitEvent })
			let control = this.form.controls['primary_employer_dialog']
			control ?
				control.setValue(primary_employer_dialog) : null
		}
	}
	onEmployerFormSubmit(form: CaseEmployer) {
		debugger;
		let message = "Successfully Added"
		if (form.id) {
			this.caseData.employer.case_employers = this.caseData.employer.case_employers.map(employer => {
				if (employer.id == form.id) { employer = form }
				return employer
			})
			let caseEmployers = this.structureEmployerUpdateData(this.caseData.employer.case_employers);
			if(!(caseEmployers?.primary_employer?.update_call_from_primary)){
				caseEmployers.primary_employer['update_call_from_primary'] = false;
			}
		if(caseEmployers?.primary_employer){
			if(!(caseEmployers?.primary_employer?.['insurance_information'])){
				let insurance_information = {
					insurance_id : caseEmployers?.primary_employer?.['insurance_id'],
					insurance_location_id : caseEmployers?.primary_employer?.['insurance_location_id'],
					payer_id : caseEmployers?.primary_employer?.['payer_id']
				}
				caseEmployers.primary_employer['insurance_information'] = {...insurance_information}
			}
		}
			this.caseFlowService.updateCase(this.caseId, { ...caseEmployers }).subscribe(data => {
				if (data?.result?.flag) {
					this.customDiallogService
						.confirm(
							'Are you sure?',
							data?.result?.message,
							'Yes',
							'No'
						)
						.then((confirmed) => {
							if (confirmed) {
								caseEmployers.primary_employer['override'] = 1;
							} else if (confirmed == false) {
								caseEmployers.primary_employer['override'] = 0;
							} else {
								return
							}
							this.caseFlowService.updateCase(this.caseId, { ...caseEmployers }).subscribe(data => {
								if (data?.status == 200) {
									this.modalRef ? this.modalRef.close() : null;
									this.getCase();
									this.toasterService.success('Successfully Updated', 'Success');
								}
							}, err => {
								if(!(err?.status == 406))
				                this.toasterService.error(err.message, 'Error');
							    else this.getCase();
							})
						})
						.catch();
				}
				else {
					this.modalRef ? this.modalRef.close() : null;
					this.getCase();
					this.toasterService.success('Successfully Updated', 'Success');
				}
			}
			
			, err => {
				if(!(err?.status == 406))
				this.toasterService.error(err.message, 'Error');
			    else this.getCase();
			})
			return;
		}
		switch (form.employer_type_id) {
			case CaseEmployerTypeEnum.primary:
				// this.caseData.employer.case_employers = this.caseData.employer.case_employers.map(employer => {
				// 	if (employer.employer_type_id === CaseEmployerTypeEnum.primary) {
				// 		return form
				// 	}
				// 	return employer
				// })
				let primaryIndex = this.caseData.employer.case_employers.findIndex(employer => employer.employer_type_id === CaseEmployerTypeEnum.primary)
				if (primaryIndex > -1) {
					this.caseData.employer.case_employers[primaryIndex] = form
				} else {
					this.caseData.employer.case_employers.push(form)
				}

				break;
			default:
				if (form.id) {
					this.caseData.employer.case_employers = this.caseData.employer.case_employers.map(employer => {
						if (form.id == employer.id) {
							employer = form;
						}
						return employer
					})
				} else
					this.caseData.employer.case_employers.push(form)
				break;


		}
		this.saveCaseEmployer(message)

	}

	saveCaseEmployer(message?: string) {
		this.caseData.employer.case_employers = makeDeepCopyArray(this.caseData.employer.case_employers)
		this.reEvaluateForm()
		let caseEmployers = this.structureEmployerUpdateData(this.caseData.employer.case_employers);
		if(!(caseEmployers?.primary_employer['insurance_information'])){
			let insurance_information = {		
				insurance_id : caseEmployers?.primary_employer['insurance_id'],
				insurance_location_id : caseEmployers?.primary_employer['insurance_location_id'],
				payer_id : caseEmployers?.primary_employer['payer_id']
			}
			caseEmployers.primary_employer['insurance_information'] = {...insurance_information}
		}
		this.caseFlowService.updateCase(this.caseId, { ...caseEmployers }).subscribe(data => {
			if (data?.result?.flag) {
				this.customDiallogService
					.confirm(
						'Are you sure?',
						data?.result?.message,
						'Yes',
						'No'
					)
					.then((confirmed) => {
						if (confirmed) {
							caseEmployers.primary_employer['override'] = 1;
						} else if (confirmed == false) {
							caseEmployers.primary_employer['override'] = 0;
						} else {
							//in case of cross icon close
							return
						}
						this.caseFlowService.updateCase(this.caseId, { ...caseEmployers }).subscribe(data => {
							if (data?.status == 200) {
								this.modalRef ? this.modalRef.close() : null;
								this.getCase();
								this.toasterService.success('Successfully Updated.', 'Success');
							}
						}, err => {
							if(!(err?.status == 406))
			            	this.toasterService.error(err.message, 'Error');
							else this.getCase();
						})
					})
					.catch();
			} else {
				this.modalRef ? this.modalRef.close() : null;
				this.getCase();
				this.toasterService.success(message ? message : 'Successfully Updated.', 'Success');
			}
		}, err => {
			if(!(err?.status == 406))
			this.toasterService.error(err.message, 'Error');
			else this.getCase();
		})

	}

	assignValues() {
		if (this.caseData) {
			if (this.caseData.patient && this.caseData.patient.id) {
				this.patientId = this.caseData.patient.id;
			}
			this.caseData.employer.case_employers = makeDeepCopyArray(this.caseData.employer.case_employers);
			this.employmentInfo = this.caseData.employer.employment_information;
			if (!this.employmentInfo) {
				this.employmentInfo = {} as EmploymentInformationModel
			}
			// if (this.employmentInfo && this.employmentInfo.id) {
			this.form.patchValue({ ...this.employmentInfo, primary_employer_dialog: this.caseData.employer.primary_employer_dialog, secondary_employer_dialog: this.caseData.employer.secondary_employer_dialog, yearly_employer_dialog: this.caseData.employer.yearly_employer_dialog })
			//  }


			if (this.caseData.is_finalize) {
				this.isFormDisabled = false;
				this.toggleForm()
			}

		} else {
			this.isFormDisabled = false;
			this.toggleForm()
		}

		this.reEvaluateForm()

	}

	openModal = (content): void => {
		let ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			size: 'lg',
			windowClass: 'modal_extraDOc body-scroll',
		};
		this.modalRef = this.modalService.open(content, ngbModalOptions);
	};

	public selection = new SelectionModel<Element>(true, []);

	/** Whether the number of selected elements matches the total number of rows. */
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.employers.length;
		return numSelected === numRows;
	}

	/** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggle() {
		this.isAllSelected()
			? this.selection.clear()
			: this.employers.forEach((row) => this.selection.select(row));
	}

	stringfy(obj) {
		return JSON.stringify(obj);
	}
	closeModal() {
		this.modalRef.close();
	}
	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
		this.caseFlowService.removeScrollClasses();
		this.logger.log('employer component ONDestroy Called');
	}
	canDeactivate() {

		return ((this.form2 ? (this.form2.dirty && this.form2.touched) : false) || (this.form1 ? (this.form1.dirty && this.form1.touched) : false));
	}
	onEmploymentFormSubmit(form) {
		form = { ...form, ...this.form.value }
		this.caseFlowService.updateCase(this.caseId, { employment_information: form }).subscribe(data => this.toasterService.success('Successfully Updated', 'Success'), err => this.toasterService.error(err.message, 'Error'))
	}


	// caseEmployerUpdateType: 'primary_employer' | 'secondary_employer' | 'yearly_employer' = 'primary_employer'

	structureEmployerUpdateData(caseEmployer: CaseEmployer[]) {
		let primary_employer = caseEmployer.find(employer => employer.employer_type_id === CaseEmployerTypeEnum.primary) || null;
		let secondary_employer = caseEmployer.map(employer => { let _emp = makeDeepCopyObject(employer); delete _emp.id; return _emp }).filter(employer => employer.employer_type_id === CaseEmployerTypeEnum.secondary)
		let yearly_employer = caseEmployer.map(employer => { let _emp = makeDeepCopyObject(employer); delete _emp.id; return _emp }).filter(employer => employer.employer_type_id === CaseEmployerTypeEnum.yearly)
		this.reEvaluateForm()
		let primary_obj: CaseEmployerUpdateObject = {
			primary_employer_dialog: this.form.value.primary_employer_dialog?this.form.value.primary_employer_dialog:'none',
			secondary_employer_dialog: this.form.value.secondary_employer_dialog?this.form.value.secondary_employer_dialog:'none',
			yearly_employer_dialog: this.form.value.yearly_employer_dialog?this.form.value.yearly_employer_dialog:'none',
			primary_employer: {

				...primary_employer
				// data: primary_employer
			},
			secondary_employer: {

				is_deleted: secondary_employer.length > 0 ? false : true,
				data: secondary_employer.length > 0 ? secondary_employer : []
			},
			yearly_employer: {
				data: yearly_employer.length > 0 ? yearly_employer : [],
				is_deleted: yearly_employer.length > 0 ? false : true,

			},



			employment_information: { id: this.caseData.employer.employment_information ? this.caseData.employer.employment_information.id : '', unemployment_benefits: this.form.value.unemployment_benefits, course_of_employment: this.form.value.course_of_employment, is_deleted: primary_employer ? primary_employer.is_deleted : false } as EmploymentInformationModel,
			return_to_work: { id: this.caseData.employer.return_to_work ? this.caseData.employer.return_to_work.id : '', is_deleted: primary_employer ? primary_employer.is_deleted : false } as any

		}


		return primary_obj
	}

	shouldShowEmploymentInfoForm() {
		let emp_info = this.caseFlowService.shouldShowEmploymentInfoForm()
		let has_primary = this.hasPrimaryEmployer()
		return emp_info && has_primary;
	}
	hasPrimaryEmployer() {
		let primary_employer = this.caseData && this.caseData.employer && this.caseData.employer.case_employers && this.caseData.employer.case_employers.find(employer => employer.employer_type_id == CaseEmployerTypeEnum.primary)
		return primary_employer && !primary_employer.is_deleted ? true : false;
	}

	getCurrentPrimaryEmployer() {
		// let primary_employer = this.caseData && this.caseData.employer && this.caseData.employer.case_employers.find(employer => employer.employer_type_id == CaseEmployerTypeEnum.primary)
		return this.caseData && this.caseData.employer ? this.caseData.employer : null
	}

	hasSecondaryEmployers() {
		return this.caseData.employer.case_employers.filter(employer => employer.employer_type_id == CaseEmployerTypeEnum.secondary).length > 0
	}
	hasYearlyEmployers() {
		return this.caseData.employer.case_employers.filter(employer => employer.employer_type_id === CaseEmployerTypeEnum.yearly).length > 0
	}
	onSubmit(event) {
	}

	saveForm(event) {
		this.component.onSubmit(event);
		this.component.disableHiddenControls(this.fieldConfig)
		if (this.component.form.valid) {
			let caseEmployers = this.structureEmployerUpdateData(this.caseData.employer.case_employers);
			this.caseFlowService.updateCase(this.caseId, { ...caseEmployers }).subscribe(data => {
				this.toasterService.success('Successfully Updated', 'Success');
				this.getEmpData(callback => {
					this.caseFlowService.goToNextStep();
				})
			}
				, err => this.toasterService.error(err.message, 'Error'))
		}
		else {
			this.component.enableHiddenControls(this.fieldConfig)
		}

	}
	getEmpData(callback?) {
		this.subscription.push(
			this.caseFlowService.getCase(this.caseId).subscribe((res) => {
				callback ? callback() : null
			}),
		);
	}
	save(event) {
		this.EmploymentInfoFormComponent ? this.EmploymentInfoFormComponent.component.onSubmit(event) : null;
		this.ReturnToWorkFormComponent ? this.ReturnToWorkFormComponent.component.onSubmit(event) : null;
		this.component.onSubmit(event);

		this.EmploymentInfoFormComponent ? this.EmploymentInfoFormComponent.component.disableHiddenControlsPublic() : null;
		this.ReturnToWorkFormComponent ? this.ReturnToWorkFormComponent.component.disableHiddenControlsPublic() : null;
		this.component.disableHiddenControlsPublic();


		let form1 = this.EmploymentInfoFormComponent ? this.EmploymentInfoFormComponent.form : null;
		let form2 = this.ReturnToWorkFormComponent ? this.ReturnToWorkFormComponent.form : null;
		let form3 = this.component ? this.component.form : null;
		let caseEmployers = this.structureEmployerUpdateData(this.caseData.employer.case_employers);



		if (form1.invalid || form2.invalid || form2.invalid) {
			this.EmploymentInfoFormComponent ? this.EmploymentInfoFormComponent.component.enableHiddenControlsPublic() : null;
			this.ReturnToWorkFormComponent ? this.ReturnToWorkFormComponent.component.enableHiddenControlsPublic() : null;
			this.component.enableHiddenControlsPublic();
			return;
		}
		this.EmploymentInfoFormComponent ? this.EmploymentInfoFormComponent.component.enableHiddenControlsPublic() : null;
		this.ReturnToWorkFormComponent ? this.ReturnToWorkFormComponent.component.enableHiddenControlsPublic() : null;
		this.component.enableHiddenControlsPublic();
		form3.patchValue({ id: form1.controls['id'].value }, { emitEvent: false });
		let data = { ...caseEmployers, employment_information: { ...form1.value, ...form3.value }, return_to_work: form2.value }
		if(data?.primary_employer){
			if(!(data?.primary_employer?.['insurance_information'])){
				let insurance_information = {
					insurance_id : data?.primary_employer?.['insurance_id'],
					insurance_location_id : data?.primary_employer?.['insurance_location_id'],
					payer_id : data?.primary_employer?.['payer_id']
				}
				data.primary_employer['insurance_information'] = {...insurance_information}
			}
		}
		this.caseFlowService.updateCase(this.caseId, data).subscribe(data => {
			this.toasterService.success('Successfully Updated', 'Success');
			form1 ? form1.reset() : null
			form2 ? form2.reset() : null
			form3 ? form3.reset() : null
			this.getEmpData(callback => {
				this.caseFlowService.goToNextStep();
			})
		}, err => this.toasterService.error(err.message, 'Error'))
	}
}
