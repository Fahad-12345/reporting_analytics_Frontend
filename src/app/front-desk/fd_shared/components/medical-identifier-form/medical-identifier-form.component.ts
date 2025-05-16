import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import {
	AfterViewInit,
	ChangeDetectorRef,
	Component,
	ElementRef,
	EventEmitter,
	Input,
	OnChanges,
	OnDestroy,
	Output,
	SimpleChanges,
	ViewChild,
} from '@angular/core';
import {
	FormArray,
	FormBuilder,
	FormControl,
	FormGroup,
	Validator,
	ValidatorFn,
	Validators,
} from '@angular/forms';
import {
	ActivatedRoute,
	Router,
} from '@angular/router';

import { InsuranceModel } from 'app/front-desk/models/InsuranceModel';
import * as _ from 'lodash';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { ToastrService } from 'ngx-toastr';
import { ReplaySubject, Subject,map } from 'rxjs';

import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import {
	OrderEnum,
	ParamQuery,
} from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { AclService } from '@appDir/shared/services/acl.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { DocTypeEnum } from '@appDir/shared/signature/DocTypeEnum.enum';
import {
	SignatureServiceService,
} from '@appDir/shared/signature/services/signature-service.service';
import { Logger } from '@nsalaun/ng-logger';

import { FDServices } from '../../services/fd-services.service';
import { HttpService } from '../../services/http.service';
import { changeDateFormat, checkNUllEmptyUndefinedANdNullString, isEmpty, isEmptyArray, isEmptyObject, isSameLoginUser, makeDeepCopyArray, mapCodesWithFullName, mustHaveValueObject, removeEmptyAndNullsFormObject, unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';
import { ShareAbleFilter } from '@appDir/shared/models/share-able-filter';
import { EnumApiPath } from '@appDir/front-desk/billing/Models/searchedKeys-modal';
import { Page } from '@appDir/front-desk/models/page';
import { IMatAutoCompleteSpinnerShowIntellicense, MatAutoCompleteSpinnerShowIntellicenseModal } from '@appDir/shared/components/mat-autocomplete/modal/mat-autocomplete.modal';
import { AddAdditionalInfoComponent } from './add-additional-info/add-additional-info/add-additional-info.component';
import { RegionUrlsEnum } from '@appDir/front-desk/masters/billing/billing-master/Region-Urls-Enum';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConnectionServiceModule } from 'ng-connection-service';


@Component({
	selector: 'app-medical-identifier-form',
	templateUrl: './medical-identifier-form.component.html',
	styleUrls: ['./medical-identifier-form.component.scss']
})
export class MedicalIdentifierFormComponent extends PermissionComponent implements OnChanges, AfterViewInit,OnDestroy {
	public form: FormGroup;
	@Input() title = 'Edit';
	@Input() insuranceType: string = 'Primary';
	@Input() caseId: any;
	@Input() insurance: InsuranceModel;
	@Output() getCase = new EventEmitter();
	@Output() formSubmited = new EventEmitter();
	@Input() sendId;
	signature: any;
	currentDate: Date = new Date();
	issuanceDate: Date = new Date();
	nextDate: Date = new Date(Date.now() + (3600 * 1000 * 24));
	searchFailed: boolean;
	modelICDCode: any = [];
	modeCptCode: any = [];
	isSameUserLogin = false;
	insuranceName: any;
	searching: boolean;
	private patientId: any;
	selectedICDCodes: any[] = [];
	selectedCPTCodes: any[] = [];
	private contactPersonTypesId: number = 3;
	public relations: any[];
	disableBtn = false;
	currentUserID: any;
	currentObjectType: string;
	preselectedIcdCodes;
	preselectedICptCodes;
	selectedState: string = 'All State';
	searchedDoctors;
	EnumApiPath = EnumApiPath;
	eventsSubject: Subject<any> = new Subject<any>();
	requestServerpath = REQUEST_SERVERS;
	medicalIdentifierDetail;
	icdPage: Page = new Page();
	cptPage: Page = new Page();
	@ViewChild('BillingTitle') BillingTitle;
	@ViewChild('specialties') specialties;
	@ViewChild('BillingEmploymentType') BillingEmploymentType;
	@ViewChild('additionalInformationData') additionalInformationComponent: AddAdditionalInfoComponent;
	additionalInfoEventsSubject: Subject<void> = new Subject<void>();
	@ViewChild('provider') provider;
	showSpinnerIntellicense: IMatAutoCompleteSpinnerShowIntellicense = new MatAutoCompleteSpinnerShowIntellicenseModal();
	stateList: any;
	stateListTemp:any;
	userFaciltilies: any;
	serviceLevels:any;
	userFaciltiliestemp: any;
	spiFacilities:any;
	closeResult: string;
	facilityLocId: number;
	spiDea: any;
	pracReason="";
	stateReason="";
	deanReason="";
	checkIdentifier=0;
	taxonomyValidatorPattern = "^[A-Za-z0-9]{9}(X|x)$";
	ngSelectedSpecialty: Subject<any> = new Subject<any>();
	firstInvalidControl: HTMLElement;
	selectedMultipleFieldFiter: any = {
		'specialties': []
	  };
	constructor(
		aclService: AclService,
		private fb: FormBuilder,
		private logger: Logger,
		private fd_services: FDServices,
		private toastrService: ToastrService,
		router: Router,
		private route: ActivatedRoute,
		private http_service: HttpService,
		protected requestService: RequestService,
		private storageData: StorageData,
		private signatureService: SignatureServiceService,
		private caseFlowService: CaseFlowServiceService,
		private el: ElementRef,
		private modalService: NgbModal,
		public datePipeService:DatePipeFormatService,
		public cdr: ChangeDetectorRef
	) {
		super(aclService, router, route, requestService);
		this.setForm();

		const currentYear = new Date().getFullYear();
		const currentMonth = new Date().getMonth();
		const currentDate = new Date().getDate();
		this.issuanceDate = new Date(currentYear, currentMonth, currentDate);
	}
	ngAfterViewInit(): void {
		this.requestService
		.sendRequest('billing_titles', 'get', REQUEST_SERVERS.fd_api_url)
		.subscribe((data) => {
			this.lstBillingTitle = data['result'].data;
			this.setValuesNgSelectShareableBillingTitle();
		});
	this.requestService
		.sendRequest('billing_employment_types', 'get', REQUEST_SERVERS.fd_api_url)
		.subscribe((data) => {
			this.lstBillingEmploymentType = data['result']['data'];
			this.setValuesNgSelectShareableBillingEmployementType();
		});
	}
	ngOnChanges(changes: SimpleChanges) { }
	lstBillingEmploymentType = [];
	lstBillingTitle = [];

	id: number;
	ngOnInit() {
		this.currentObjectType = 'doctor';
		this.license_historyFormValidation();
		this.getStateList();
		this.getServiceLevels();
		
		
		this.form.controls['license_history'].valueChanges.subscribe(data=>{
			debugger;
			if (data.license_history && data.license_history.length!=0){
				data.license_history.forEach(liscense=>{
					const licenseHistory= this.form.get('license_history') as FormArray;
					licenseHistory.at(0).updateValueAndValidity();

				});
			}
		});
	
		this.route.snapshot.pathFromRoot.forEach((path) => {
			if (path && path.params && path.params.id) {
				this.id = path.params.id;
				this.currentUserID = path.params.id;
				this.getSignature();
				this.getPracticeFacilities();
				if(this.id) this.form.controls['id'].setValue(this.id);
			}
		});
		this.requestService
			.sendRequest('get_medical_identifier_by_id', 'get', REQUEST_SERVERS.erx_fd_api, {
				user_id: this.id,
			})
			.subscribe((data: any) => {
				const medicalIdentifierData = data['result']['data'];
				
				this.checkIdentifier= medicalIdentifierData.is_individual;
				if (!_.isEmpty(medicalIdentifierData)) {
					this.emitToAdditionalInformation(medicalIdentifierData);
					this.matSearchListener(medicalIdentifierData.doctor_id);
					if (medicalIdentifierData.icd10_codes) {
						this.icd10Codes = [...medicalIdentifierData.icd10_codes];
						this.preselectedIcdCodes = [...medicalIdentifierData.icd10_codes];
						this.modelICDCode = medicalIdentifierData.icd10_codes;
					}
					if (medicalIdentifierData.cpt_codes) {
						this.CodesCPT = [...medicalIdentifierData.cpt_codes];
						this.preselectedICptCodes = [...this.CodesCPT];
						this.modeCptCode = [...medicalIdentifierData.cpt_codes];
					}
					if(medicalIdentifierData?.taxonomy_codes?.length){
						medicalIdentifierData['specialty_ids'] = medicalIdentifierData?.taxonomy_codes?.map(obj => obj?.specialty_id);
						this.selectedMultipleFieldFiter['specialties'] = medicalIdentifierData?.taxonomy_codes?.map(obj => obj?.specialty);
						for(let item of medicalIdentifierData?.taxonomy_codes){
							this.addTaxonomy({id:item?.specialty_id,name:item?.specialty?.name,taxonomy_code:item?.taxonomy_code});
						}
					}
					this.form.patchValue(medicalIdentifierData);
					const control = <FormArray>this.form.controls['license_history'];
					if (
						medicalIdentifierData.license_detail &&
						medicalIdentifierData.license_detail.length > 0
					) {
						control.controls = [];
						medicalIdentifierData.license_detail.forEach((license) => {
							const form = this.fb.group({
								medical_license: ['',Validators.required],
								medical_license_expiration_date: ['',Validators.required],
								state_issuing_the_medical_license: [''],
								degree_listed_on_the_license: [''],
								medical_license_issue_date: ['',Validators.required],
							});
							form.setValidators(this.compareDatesValidation);

							form.patchValue(license);
							control.push(form);
						});
						if (isSameLoginUser(this.id)) {
							this.form.disable();
							this.isSameUserLogin = true;
						}
					} else {
						control.controls = [];
						const form = this.fb.group({
							medical_license: ['',Validators.required],
							medical_license_expiration_date: ['',Validators.required],
							state_issuing_the_medical_license: [''],
							degree_listed_on_the_license: [''],
							medical_license_issue_date: ['',Validators.required],
						});
						form.setValidators(this.compareDatesValidation);
						control.push(form);
					}
					const control2 = <FormArray>this.form.controls['dea_records'];
					if (
						medicalIdentifierData.dea_records &&
						medicalIdentifierData.dea_records.length > 0
					) {
						control2.controls = [];
						medicalIdentifierData.dea_records.forEach((record) => {
							const form: FormGroup = this.fb.group({
								id: null,
								facility_location_id: null,
								state_id: [null, Validators.required],
								dean: ['', Validators.compose([Validators.minLength(9),Validators.maxLength(9), Validators.required])],
								dean_issue_date: [''],
								dean_expiration_date: [''],
								nadean: ['',  Validators.compose([Validators.minLength(9),Validators.maxLength(9)])],
								is_deleted: false,
								spis: [[]]

							});
							form.setValidators(this.compareRecordsDatesValidation);


							form.patchValue(record);
							if (form.controls['spis'].value.length > 0) {
								form.controls['facility_location_id'].disable();
								form.controls['state_id'].disable();
							}
							if(form.controls['facility_location_id'].value){
								form.controls['state_id'].disable();
								form.controls['dean'].disable();
							}
							control2.push(form);

							
						});
						if (isSameLoginUser(this.id)) {
							this.form.disable();
							this.isSameUserLogin = true;
						}
					} else {
					}
					this.medicalIdentifierDetail = data['result'].data;



				}
			}
			);

			this.setDefaultPaginationCodes();
	}
	setValuesNgSelectShareableSpecialty() {
		// Specialty
		this.specialties['lists'] = this.selectedMultipleFieldFiter['specialties'] ? this.selectedMultipleFieldFiter['specialties'] : [];
		if(this.specialties['lists'].length) this.specialties['forceApiHitonOpen'] = true;
	 	this.form && this.form.get('specialty_ids').value ? this.specialties.searchForm.patchValue({ common_ids: this.form.get('specialty_ids').value }) : null;
		this.cdr.detectChanges();
	}
	setValuesNgSelectShareableBillingTitle() {
		// BILLING TITLE
		this.setValuesNgSelectShareableSpecialty()
		this.BillingTitle['lists'] = this.lstBillingTitle ? this.lstBillingTitle : [];
	 	this.form && this.form.get('billing_title_id').value ? this.BillingTitle.searchForm.patchValue({ common_ids: this.form.get('billing_title_id').value }) : null;
		this.cdr.detectChanges();
	}
	setValuesNgSelectShareableBillingEmployementType() {
		// BILLING EMPLOYEMETN TYPE
		this.BillingEmploymentType['lists'] = this.lstBillingEmploymentType ? this.lstBillingEmploymentType : [];
	 	this.form && this.form.get('billing_employment_type_id').value ? this.BillingEmploymentType.searchForm.patchValue({ common_ids: this.form.get('billing_employment_type_id').value }) : null;
		 this.cdr.detectChanges();
	}
	setDefaultPaginationCodes() {
		this.setIcdPageDefault();
		this.setCptPageDefault();
	}
	setIcdPageDefault() {
		this.icdPage.pageNumber = 1;
	}
	setCptPageDefault() {
		this.cptPage.pageNumber = 1;
	}
	license_historyFormValidation() {
		this.form.valueChanges.subscribe(res => {
			if (!isEmptyArray(this.form.controls['license_history'].value)) {
				this.form.controls['license_history'].value.forEach(i => {
					// if(isSameLoginUser(this.id)) {
					// 	this.form.controls['license_history'][i].disable();

					// }
					// if (isEmptyObject(i)) {
					// 	this.form.setErrors(null);
						
					// } else if (mustHaveValueObject(i)) {
					// 	this.form.setErrors(null);
					// } else {
					// 	this.form.setErrors({ 'invalid': true });
					// }
				});
			}
		});
	}

	getPracticeFacilities() {


		this.requestService
			.sendRequest(
				RegionUrlsEnum.factilties_List_GET + '?user_id=' + this.id,
				'GET',
				REQUEST_SERVERS.erx_fd_api,
			).subscribe((res) => {

				this.userFaciltilies = res.result.data;
				this.userFaciltiliestemp=res.result.data;
				this.spiFacilities=res.result.data;

			})
	}

	getServiceLevels() {


		this.requestService
			.sendRequest(
				'provider-service-levels',
				'GET',
				REQUEST_SERVERS.erx_fd_api,
			).subscribe((res) => {
				this.serviceLevels=res.result.data;
			})
	}
	OnServiceLevelChange(event,index)
	{
			event.forEach(e=>{
					e['pivot']={
						
							spi_id: this.medicalIdentifierDetail.spis[index].id, 
											service_level_id: e.id
												
					}
				})
		
	}

	getStateList() {
		this.requestService
			.sendRequest(
				RegionUrlsEnum.State_list_GET,
				'GET',
				REQUEST_SERVERS.erx_fd_api,
			).subscribe((res) => {
				let state = [];
				this.stateList = res.result.data;
				this.stateListTemp=res.result.data;

				this.stateList.forEach(element => {
					if (element && element.code) {
						state.push(element.code)
					}
				});
				// this.statesDA=state;
			})
	}

	removeData() {
		const licenseHistory = this.form.get('license_history') as FormArray;
		licenseHistory.controls.forEach(control => control.get('state_issuing_the_medical_license').reset())
	}
	setForm() {
		this.form = this.fb.group({
			registration_number: [''],
			registration_expiration_date: [''],
			dea_number: [''],
			dea_expiration_date: [''],
			dea_issue_date: [''],
			npi: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
			spi: [''],
			billing_title_id: ['', Validators.required],
			billing_employment_type_id: [''],
			nadean_number: [''],
			upin: [''],
			wcb_authorization: [''],
			please_specify: [''],
			wcb_rating_code: [''],
			wcb_date_of_issue: ['', []],
			hospital_privileges: [''],
			medical_credentials: ['0'],
			is_individual: [1],
			id: [''],
			license_history: this.fb.array([this.addliscenseHistory()]),
			dea_records: this.fb.array([this.add_dea_records()]),
			is_self: [''],
			is_reading_provider: [''],
			doctor_id: [''],
			taxonomy_codes: this.fb.array([]),
			specialty_ids : ['']
		});
		// this.form.setValidators(this.invalidDeaDate);
		this.form.setValidators(this.wcbAuthorizationValidation);
	}

	getFormData() {

		this.form;
	}

	invalidDeaDate(form: FormGroup) {
		// let startDate = new Date(form.get('dea_expiration_date').value);
		// let endDate = new Date(form.get('dea_issue_date').value);
		// if (startDate < endDate) {
		// 	// return { invalidDate: true };
		// 	return true;
		// }
		// return false;
	}
	addliscenseHistory() {
		let form: FormGroup = this.fb.group({
			medical_license: ['',Validators.required],
			medical_license_expiration_date: ['',Validators.required],
			state_issuing_the_medical_license: [''],
			degree_listed_on_the_license: [''],
			medical_license_issue_date: ['',Validators.required],
		});
		form.setValidators(this.compareDatesValidation);
		return form;
	}

	openModal(content) {
		this.modalService.open(content, { size: 'sm' }).result.then((result) => {
			this.closeResult = `Closed with: ${result}`;
		}, (reason) => {
			this.facilityLocId=null;
			this.spiDea=null;
		});
	}

	add_dea_records() {
		let form: FormGroup = this.fb.group({

			facility_location_id: null,
			state_id: [null, Validators.required],
			dean: ['', Validators.compose([Validators.minLength(9), Validators.maxLength(9), Validators.required])],
			dean_issue_date: [''],
			dean_expiration_date: [''],
			nadean: ['',  Validators.compose([Validators.minLength(9),Validators.maxLength(9)])],
			is_deleted: [false],
			spis: [[]]
		});
		form.setValidators(this.compareRecordsDatesValidation);
		return form;
	}
	showFileArray: Array<number> = [];
	public findInvalidControlsRecursive(formToInvestigate: FormGroup | FormArray): string[] {
		var invalidControls: string[] = [];
		let recursiveFunc = (form: FormGroup | FormArray) => {
			Object.keys(form.controls).forEach(field => {
				const control = form.get(field);
				if (control.invalid) invalidControls.push(field);
				if (control instanceof FormGroup) {
					recursiveFunc(control);
				} else if (control instanceof FormArray) {
					recursiveFunc(control);
				}
			});
		}
		recursiveFunc(formToInvestigate);
		return invalidControls;
	}

	isEmptyFormArray(form) {
		if (form.id && form.id != null && form.id && form.id != '') {
			return false;
		}
		else if (form.facility_location_id != null && form.facility_location_id != '') {
			return false;
		}
		else if (form.state_id != null && form.state_id != '') {
			return false;
		}
		else if (form.dean != null && form.dean != '') {
			return false;
		}
		else if (form.dean_issue_date != null && form.dean_issue_date != '') {
			return false;
		}
		else if (form.dean_expiration_date != null && form.dean_expiration_date != '') {
			return false;
		}
		else if (form.state_id != null && form.state_id != '') {
			return false;
		}
		else if (form.nadean != null && form.nadean != '') {
			return false;
		}
		return true;

	}

	scrollToErrorField(firstInvalidControl: HTMLElement){
		console.log(firstInvalidControl)
		if(firstInvalidControl) {
			this.caseFlowService.scrollToFirstInvalidControl(firstInvalidControl,170);
			return;
		}
	}

	formSubmit() {
		this.form.patchValue({
			dea_number: '',
			dea_expiration_date: '',
			dea_issue_date: '',
			spi: '',
			nadean_number: '',
		})
		const dea_record = this.form.get('dea_records') as FormArray;
		dea_record.value.forEach((el, index) => {
			let value = this.isEmptyFormArray(el);
			if (value == true) {
				dea_record.removeAt(index);
			}

		});
		if (!this.form.valid) {
			const dea_record = this.form.get('dea_records') as FormArray;
			dea_record['controls'].forEach(control => {
				control['controls'].state_id.markAsTouched();
				control['controls'].dean.markAsTouched();

			});

			const license_history = this.form.get('license_history') as FormArray;
			license_history['controls'].forEach(control => {
				control['controls'].medical_license.markAsTouched();
				control['controls'].medical_license_issue_date.markAsTouched();
				control['controls'].medical_license_expiration_date.markAsTouched();
				
			});

			const taxonomy_codes = this.form.get('taxonomy_codes') as FormArray;
			taxonomy_codes['controls'].forEach(control => {
				control['controls'].taxonomy_code.markAsTouched();
			});

			this.form.controls.billing_title_id.markAsTouched();
			this.form.controls.npi.markAsTouched();
			
			if (this.form.controls['billing_title_id'].invalid) {
				this.firstInvalidControl =
					this.el.nativeElement.querySelector('app-ng-select-shareable div:first-child');
			} else {
				this.firstInvalidControl =
				this.el.nativeElement.querySelector('form .ng-invalid');
			}
			// if(!this.form.controls.license_history.valid){
			// 	this.toastrService.error('Expiration Date should be Greater then from Issue Data of Medical License.', 'Error');
			// }
			
			if(dea_record.length==0)
			{
				this.addDea();
			}
			if(this.firstInvalidControl) {
				this.caseFlowService.scrollToFirstInvalidControl(this.firstInvalidControl,170);
				return;
			}
			
			
		}
		this.startLoader = true;
		let liscenseHistoryFlag = false;
		let licence;
		licence = this.form.value.license_history;
		this.form.value.taxonomy_codes?.forEach(x =>{
			delete x.specialty_name
		});
		if (this.form && this.form.value && this.form.value.license_history && this.form.value.length!=0){
		this.form.value.license_history.forEach(element => {
			element.medical_license_issue_date = changeDateFormat(element.medical_license_issue_date);
			element.medical_license_expiration_date = changeDateFormat(element.medical_license_expiration_date);
			// Medical Liscense Case 
			if (element.medical_license!=null &&  element.medical_license!=''){
				if (element.medical_license_issue_date==null || element.medical_license_issue_date==''){
					this.toastrService.error('Licence Issue Date is Required', 'Error');
					liscenseHistoryFlag = true;
					this.startLoader= false;
					this.firstInvalidControl = this.el.nativeElement.querySelector('[formcontrolname="medical_license_issue_date"]');
					this.scrollToErrorField(this.firstInvalidControl);
					return false;
				}
				if (element.medical_license_expiration_date == null || 
					element.medical_license_expiration_date==''
					){
						this.toastrService.error('Licence Expiration Date is Required', 'Error');
						this.startLoader= false;
						liscenseHistoryFlag = true;
						this.firstInvalidControl = this.el.nativeElement.querySelector('[formcontrolname="medical_license_expiration_date"]');
						this.scrollToErrorField(this.firstInvalidControl);
						return false;
				}
				

			}

// Expiration Date
			if (element.medical_license_expiration_date!=null &&  element.medical_license_expiration_date!=''){
				if (element.medical_license == null || 
					element.medical_license==''
					){
						this.toastrService.error('Medical Licence is Required', 'Error');
						this.startLoader= false;
						liscenseHistoryFlag = true;
					return false;
				}
				if (element.medical_license_issue_date==null || element.medical_license_issue_date==''){
					this.toastrService.error('Licence Issue Date is Required', 'Error');
					liscenseHistoryFlag = true;
					this.startLoader= false;
					this.firstInvalidControl = this.el.nativeElement.querySelector('[formcontrolname="medical_license_issue_date"]');
					this.scrollToErrorField(this.firstInvalidControl);
					return false;
				}

			}

		//Issue Date 
		if (element.medical_license_issue_date!=null &&  element.medical_license_issue_date!=''){
		
			if (element.medical_license == null || 
				element.medical_license==''
				){
					this.toastrService.error('Medical Liscense is Required', 'Error');
					this.startLoader= false;
					liscenseHistoryFlag = true;
				return false;
			}

			if (element.medical_license_expiration_date == null || 
				element.medical_license_expiration_date==''
				){
					this.toastrService.error('Licence Expiration Date is Required', 'Error');
					this.startLoader= false;
					liscenseHistoryFlag = true;
					this.firstInvalidControl = this.el.nativeElement.querySelector('[formcontrolname="medical_license_expiration_date"]');
					this.scrollToErrorField(this.firstInvalidControl);
					return false;
			}
			
		}
		});

		this.form.value.dea_records.forEach(element => {
			element.dean_issue_date = changeDateFormat(element.dean_issue_date);
			element.dean_expiration_date = changeDateFormat(element.dean_expiration_date);
		});
		}
		debugger;
		if (liscenseHistoryFlag){
			return false;
		}
		console.log(this.form.value)
		const temp= this.form.value;
		const control = <FormArray>this.form.controls['dea_records'];
		temp.dea_records=control.getRawValue();
		temp.registration_expiration_date = changeDateFormat(this.form.controls.registration_expiration_date.value);
		temp.wcb_date_of_issue = changeDateFormat(this.form.controls.wcb_date_of_issue.value);
		delete temp.license_history;
		temp['user_id'] = this.id;
		temp['additional_information'] = this.additionalInformationComponent && this.additionalInformationComponent.additionalInfoList && this.additionalInformationComponent.additionalInfoList.length > 0 ? this.additionalInformationComponent.additionalInfoList : []
		if(temp.is_reading_provider == null) temp.is_reading_provider = 0;
		
		let z = {
			...temp,
			spis: this.medicalIdentifierDetail && this.medicalIdentifierDetail.spis?this.medicalIdentifierDetail.spis:[],
			license_detail: licence,
			icd10_codes: this.modelICDCode.length > 0 ? this.modelICDCode.map((obj) => obj.id) : [],
			cpt_codes: this.modeCptCode.length > 0 ? this.modeCptCode.map((obj) => obj.id) : [],
		};
		if (this.form.value.id) {
			let url = 'update_medical_identifier';
			z.id = this.medicalIdentifierDetail ? this.medicalIdentifierDetail.id : null;
			this.requestService.sendRequest(url, 'post', REQUEST_SERVERS.erx_fd_api, z).subscribe(
				(res) => {
					if (!this.signature.signature_file) {
						this.router.navigateByUrl('/front-desk/masters/users/creation/list?per_page=10&page=1');
					}
					this.signatureService
						.createSignature(
							temp['user_id'],
							this.signature.signature_file,
							DocTypeEnum.userSignature,
							this.signature.file_title,
						)
						.subscribe(
							(data) => {
								this.startLoader = false;
								if (res['status'] === true || res['status'] === 200) {
									this.signature = null;
									this.listSignature.push(res['result']['data']);
									this.listSignature = makeDeepCopyArray(this.listSignature);
									this.toastrService.success(res['message'], 'Success');
									this.router.navigateByUrl('/front-desk/masters/users/creation/list?per_page=10&page=1');
								} else {
									this.toastrService.error(res['message'], 'Error');
								}
							},
							(err) => {
								this.startLoader = false;
								this.disableBtn = false;
							},
						);
				},
				(error) => {
					this.startLoader = false;
					this.disableBtn = false;
				},
			);
		}

		
	}
	addLicscense() {
		const control = <FormArray>this.form.controls['license_history'];
		control.push(this.addliscenseHistory());
		
	}

	addDea() {
		const control = <FormArray>this.form.controls['dea_records'];
		control.push(this.add_dea_records());
	}
	getData(index: number) {
		if (this.form.controls['license_history'].value.length > 0) {
			for (let i = 0; i < this.form.controls['license_history'].value.length; i++) {
				if (index == i) {
					if (this.form.controls['license_history'].value[i].degree_listed_on_the_license != '' && this.form.controls['license_history'].value[i].medical_license != '' && (this.form.controls['license_history'].value[i].medical_license_expiration_date != '' || this.form.controls['license_history'].value[i].medical_license_expiration_date != null) && (this.form.controls['license_history'].value[i].medical_license_issue_date != '' || this.form.controls['license_history'].value[i].medical_license_issue_date != null) && this.form.controls['license_history'].value[i].state_issuing_the_medical_license != '') {
						this.form.setErrors(null);
						break;
					} else if (this.form.controls['license_history'].value[i].degree_listed_on_the_license == '' && this.form.controls['license_history'].value[i].medical_license == '' && (this.form.controls['license_history'].value[i].medical_license_expiration_date == '' || this.form.controls['license_history'].value[i].medical_license_expiration_date == null) && (this.form.controls['license_history'].value[i].medical_license_issue_date == '' || this.form.controls['license_history'].value[i].medical_license_issue_date == null) && this.form.controls['license_history'].value[i].state_issuing_the_medical_license == '') {
						this.form.setErrors(null);
						break;
					} else {
						this.form.setErrors({ 'invalid': true });
					}

				}
			}
		}
		else {
			this.form.setErrors({ 'invalid': true });
		}
	}
	removeliscense(i: number) {
		const control = <FormArray>this.form.controls['license_history'];
		control.removeAt(i);
	}

	removeDeaRecords(i: number) {
		const control = <FormArray>this.form.controls['dea_records'];
		if (control.at(i).value.spis.length > 0) {
			this.toastrService.error("Can't remove records containing spi number", 'Error');
			return;
		}
		if (control.at(i).value.id) {
			control.at(i).patchValue({
				is_deleted: true
			})
			control.at(i).get('state_id').clearValidators();
			control.at(i).get('dean').clearValidators();
			control.at(i).get('dean_issue_date').clearValidators();
			control.at(i).get('dean_expiration_date').clearValidators();
			control.at(i).get('nadean').clearValidators();
			control.at(i).get('state_id').updateValueAndValidity();
			control.at(i).get('dean').updateValueAndValidity();
			control.at(i).get('dean_issue_date').updateValueAndValidity();
			control.at(i).get('dean_expiration_date').updateValueAndValidity();
			control.at(i).get('nadean').updateValueAndValidity();
		}
		else {
			control.removeAt(i);
		}
		let len = 0;
		control.value.forEach(element => {
			if (element.is_deleted == false) {
				len = len + 1;
			}
		});
		
		if (len == 0) {
			this.addDea();
		}
		


	}

	resetLicenseDateValidation(controlName: string) {
		if(controlName === 'medical_license_expiration_date'){
			this.form.controls.license_history['controls'][0].controls.medical_license_expiration_date.markAsTouched();
		}else{
			this.form.controls.license_history['controls'][0].controls.medical_license_issue_date.markAsTouched();
		}
	}

	onSubmit(form) {

		
	}
	onCptCodeSelected(selectedCodes) {
		this.modeCptCode = selectedCodes;
	}

	add(form) {
		this.fd_services.addInsuranceCompany(form).subscribe(
			(res) => {
				this.disableBtn = false;
				if (res.statusCode == 200) {
					this.form.disable();
					this.getCase.emit();
					this.toastrService.success('Successfully added', 'Success');
				} else {
					this.toastrService.error(res.error.message, 'Error');
				}
			},
			(err) => {
				this.disableBtn = false;
				this.toastrService.error(err.error.error.message, 'Error');
			},
		);
	}

	update(form) {
		this.fd_services.updateInsuranceCompany(form).subscribe(
			(res) => {
				this.disableBtn = false;
				if (res.statusCode == 200) {
					this.form.disable();
					this.getCase.emit();
					this.toastrService.success('Successfully updated', 'Success');
				} else {
					this.toastrService.error(res.error.message, 'Error');
				}
			},
			(err) => {
				this.disableBtn = false;
				this.toastrService.error(err.error.error.message, 'Error');
			},
		);
	}

	public handleAddressChange(address: Address, type?: string) {
		let street_number = this.fd_services.getComponentByType(address, 'street_number');
		let route = this.fd_services.getComponentByType(address, 'route');
		let city = this.fd_services.getComponentByType(address, 'locality');
		let state = this.fd_services.getComponentByType(address, 'administrative_area_level_1');
		let postal_code = this.fd_services.getComponentByType(address, 'postal_code');
		let lat = address.geometry.location.lat();
		let lng = address.geometry.location.lng();
		if (type == 'policyHolder') {
			if (street_number != null) {
				let address: any;
				address = street_number.long_name + ' ' + route.long_name;
				this.form.patchValue({
					policyHolderCity: city.long_name,
					PolicyHolderState: state.long_name,
					policyHolderZip: postal_code.long_name,
				});
			} else {
				this.form.patchValue({
					policyHolderCity: '',
					PolicyHolderState: '',
					policyHolderZip: '',
				});
			}
		} else {
			if (street_number != null) {
				let address: any;
				address = street_number.long_name + ' ' + route.long_name;
				this.form.patchValue({
					companyAddress: address,
					city: city.long_name,
					state: state.long_name,
					zip: postal_code.long_name,
					lat: lat,
					lng: lng,
				});
			} else {
				this.form.patchValue({
					companyAddress: '',
					city: '',
					state: '',
					zip: '',
					lat: '',
					lng: '',
				});
			}
		}
	}

	goBack() {
		this.router.navigate(['insurance'], { relativeTo: this.route.parent.parent.parent });
	}
	selectedICD(value) {
		this.modelICDCode = value;
	}

	selectedCPT($event) {
		this.selectedCPTCodes.push($event.item);
		this.modeCptCode = null;
	}
	searchValue;
	onScroll(comingFrom, searchType) {
		debugger;
		if (comingFrom == 'scrollDown') {
			if (searchType == 'icd') {
				this.icdPage.pageNumber = this.icdPage.pageNumber + 1;
				this.searchICD(this.icdSearchValue, 'scrollDown');
			} else if (searchType == 'cpt') {
				debugger;
				this.cptPage.pageNumber = this.cptPage.pageNumber + 1;
				this.searchCPT(this.cptSearchValue, 'scrollDown');
			}
		}
	}
	icd10Codes: any[] = [];
	icdSearchValue;
	icd10CodesNew: any[] = [];
	searchICD(event, searchType) {
		debugger;
		if (searchType == 'search') {
			this.setIcdPageDefault();
		}
		var value = event;
		this.icdSearchValue = value;
		if (value.length >= 3) {
			this.showSpinnerIntellicense.icd_10 = true;
			this.subscription.push(this.fd_services.searchICDIct(value, 'ICD', 1, this.icdPage.pageNumber).subscribe((data) => {
				this.showSpinnerIntellicense.icd_10 = false;
				if (searchType == 'search') {
					this.icd10Codes = [];
					this.setIcdPageDefault();
				}
				this.icd10CodesNew = mapCodesWithFullName(data['result']['data']);
				if (this.icd10CodesNew.length > 0) {
					debugger;
					
					this.icd10Codes.push(...this.icd10CodesNew);
					
				}
			}));
			
		}
	}

	CodesCPT: any[] = [];
	cptSearchValue;
	cptCodesNew: any[] = [];
	searchCPT(value, searchType) {
		if (searchType == 'search') {
			this.setCptPageDefault();
		}
		this.cptSearchValue = value;
		var val = value;
		if (val.length >= 3) {
			this.showSpinnerIntellicense.cpt_codes = true;
			this.subscription.push(this.fd_services.searchICDIct(val, 'CPT', 2, this.cptPage.pageNumber).subscribe((data) => {
				this.showSpinnerIntellicense.cpt_codes = false;
				if (searchType == 'search') {
					this.CodesCPT = [];
					this.setCptPageDefault();
				}
				this.cptCodesNew = mapCodesWithFullName(data['result']['data']);
				if (this.cptCodesNew.length > 0) {
					this.CodesCPT.push(...this.cptCodesNew);
					
				}

				
			}));
		}
	}
	

	isNameSelected: boolean;
	selectInput(event) {
		let selected = event.target.value;
		if (selected == 'Value-1') {
			this.isNameSelected = true;
		} else {
			this.isNameSelected = false;
		}
	}

	wcbAuthorizationValidation: ValidatorFn = () => {
		if (this.form && this.form.value.wcb_authorization && !this.form.value.wcb_date_of_issue) {
			return { wcb_date_required: true };
		} else if (
			this.form &&
			!this.form.value.wcb_authorization &&
			this.form.value.wcb_date_of_issue
		) {
			return { wcb_code_required: true };
		} else {
			return null;
		}
	};
	compareDatesValidation(liscense: FormGroup) {

		if (!liscense.get('medical_license_expiration_date').value || !liscense.get('medical_license_issue_date').value) {
			return null;
		}
		let startDate = new Date(liscense.get('medical_license_expiration_date').value);
		let endDate = new Date(liscense.get('medical_license_issue_date').value);
		if (startDate && startDate <= endDate) {
			return { invalidDate: true };
		}
		return null;
	}

	compareRecordsDatesValidation(liscense: FormGroup) {
		if (!liscense.get('dean_issue_date').value || !liscense.get('dean_expiration_date').value) {
			return null;
		}
		let startDate = new Date(liscense.get('dean_issue_date').value);
		let endDate = new Date(liscense.get('dean_expiration_date').value);
		if (startDate && startDate > endDate) {
			return { invalidDate: true };
		}
		return null;
	}
	deleteDoctor() {
		this.form.get('doctor_id').reset();
	}
	formControl: FormControl = new FormControl();
	lstProviders: any[];
	subject = new ReplaySubject<any>(1);

	matSearchListener(id?) {
		this.subject.next([]);
		this.searchProvider('', id);
		this.formControl.valueChanges.subscribe((value) => {
			if (value) {
				this.searchProvider(value);
			}
		});
	}

	searchProvider(name?, id?) {
		let paramQuery: ParamQuery = {
			order: OrderEnum.ASC,
			pagination: true,
			filter: false,
			per_page: 10,
			page: 1,
		};
		let filter = {};
		id ? (filter['ids[]'] = id) : name ? (filter['doctor_name'] = name) : '';
		id || name ? (paramQuery.filter = true) : '';
		this.requestService
			.sendRequest('search_doctor', 'GET', REQUEST_SERVERS.fd_api_url, { ...paramQuery, ...filter })
			.pipe(
			map((response) => {
				let data = response['result']['data'];
				this.searchedDoctors = data;
				data.map((provider) => {
					provider['name'] = `${provider.first_name} ${provider.middle_name ? provider.middle_name : ''
						} ${provider.last_name}`;
				});
				return data;
			}))
			.subscribe((data:any) => {
				this.lstProviders = data;
				this.setValuesNgSelectShareableProvider();
				this.subject.next(this.lstProviders);
			});
	}
	setValuesNgSelectShareableProvider() {
	// PROVIDER
	debugger;
	if(this.provider) this.provider['lists'] = this.lstProviders ? this.lstProviders : [];
	debugger;
	this.form && this.form.get('doctor_id').value ? this.provider.searchForm.patchValue({ common_ids: this.form.get('doctor_id').value }) : null;
	}
	states = [
		'Alabama',
		'Alaska',
		'American Samoa',
		'Arizona',
		'Arkansas',
		'California',
		'Colorado',
		'Connecticut',
		'Delaware',
		'District of Columbia',
		'Federated States of Micronesia',
		'Florida',
		'Georgia',
		'Guam',
		'Hawaii',
		'Idaho',
		'Illinois',
		'Indiana',
		'Iowa',
		'Kansas',
		'Kentucky',
		'Louisiana',
		'Maine',
		'Marshall Islands',
		'Maryland',
		'Massachusetts',
		'Michigan',
		'Minnesota',
		'Mississippi',
		'Missouri',
		'Montana',
		'Nebraska',
		'Nevada',
		'New Hampshire',
		'New Jersey',
		'New Mexico',
		'New York',
		'North Carolina',
		'North Dakota',
		'Northern Mariana Islands',
		'Ohio',
		'Oklahoma',
		'Oregon',
		'Palau',
		'Pennsylvania',
		'Puerto Rico',
		'Rhode Island',
		'South Carolina',
		'South Dakota',
		'Tennessee',
		'Texas',
		'Utah',
		'Vermont',
		'Virgin Island',
		'Virginia',
		'Washington',
		'West Virginia',
		'Wisconsin',
		'Wyoming',
	];

	listSignature: any[] = [];
	selectedId: number;
	getSignature() {
		return this.signatureService
			.getSignature(this.id, DocTypeEnum.userSignature)
			.subscribe((data) => {
				this.listSignature = data['result']['data'];
				this.selectedId = this.listSignature[0] ? this.listSignature[0].id : null;
			});
	}
	onSignatureDelete(event) {
		this.listSignature = makeDeepCopyArray(this.listSignature);
	}

	stateChange($event, i) {
		if ($event && $event.selectedIndex) {
			this.selectedState = this.states[$event.selectedIndex - 1];
		}
		
	}

	selectionOnValueChange(e: any, Type?) {
		const info = new ShareAbleFilter(e);
		this.form.patchValue(removeEmptyAndNullsFormObject(info));
		if (Type == 'BillTitle') {
			if (!e.data) {
				this.form.controls.billing_title_id.setValue(null);
				this.form.controls.billing_title_id.markAsTouched();
			}
		} else if (Type == 'BillEmploymentTypeId') {
			if (!e.data) {
				this.form.controls.billing_employment_type_id.setValue(null);
			}
		} else if (Type == 'provider') {
			if (!e.data) {
				this.form.controls.doctor_id.setValue(null);
			}
		}else if(Type == 'specialities'){
			if(e?.data){
				this.selectedMultipleFieldFiter['specialties'] = e?.data?.map(dta => {
					return {
						id : dta?.id,
						name : dta?.name
					}
				});
				}
			if(!e?.data){
				this.clearTaxonomy()
			}
		}
	}
	controledTouched(e: any, Type?) {
		if (Type == 'BillTitle') {
			if (this.form.controls.billing_title_id.value == '' || this.form.controls.billing_title_id.value == null) {
				this.form.controls.billing_title_id.markAsTouched();
			}
		}
	}
	emitToAdditionalInformation(medicalIdentifierData) {
		this.additionalInformationComponent.medicalIdentifierDetail = medicalIdentifierData;
		this.additionalInfoEventsSubject.next();
	}
	GenerateSPI() {
		let body = {
			user_id: this.id,
			facility_location_id: this.facilityLocId
		}
		this.startLoader = true;
		this.requestService
			.sendRequest(
				RegionUrlsEnum.add_spi_POST,
				'post',
				REQUEST_SERVERS.erx_fd_api,
				body
			).subscribe((res) => {
				this.facilityLocId=null;
				this.spiDea=null;
				this.startLoader = false;
				this.ngOnInit();
				if(this.modalService.hasOpenModals())
				{
					this.modalService.dismissAll();
				}
			}, (err) => {
				this.startLoader = false;
				this.facilityLocId=null;
				this.spiDea=null;
				if(this.modalService.hasOpenModals())
				{
					this.modalService.dismissAll();
				}
				
			});

	}

	ngOnDestroy() {
		this.caseFlowService.removeScrollClasses();
		unSubAllPrevious(this.subscription);
	}
	chackLodash() {
		var object = { 'a': 2 };
		var other = { 'a': 1 };
		let b = _.isEqual(object, other)
	}
	onChangeSpiFacility(event) {
		if(event){
		this.spiDea=null;
		let body = {
			user_id: this.id,
			facility_location_id: this.facilityLocId
		}
		this.requestService
			.sendRequest(
				RegionUrlsEnum.get_spi_dea_POST,
				'post',
				REQUEST_SERVERS.erx_fd_api,
				body
			).subscribe((res) => {
				

				this.spiDea = res.result.data;

				// 
			});
		}
		else{
			this.spiDea=null;
		}

	}
	onChangePracticeLocation(event, record) {
		
		if(!event)
		{
			record.patchValue({
				state_id: null,
				dean:''
			});
			record.controls['state_id'].enable();
			record.controls['dean'].enable();
			
		}
		else{
		if (event && event.state_id) {
			record.patchValue({
				state_id: event.state_id
			});
			record.controls['state_id'].disable();
		}
		else{
			record.patchValue({
				state_id: null,
			});
			this.toastrService.error(`Please Enter State to Facilty Location`,"Error");
			record.controls['state_id'].enable();
		}
		if (event && event.dean) {
			record.patchValue({
				dean:event.dean+'-'+this.id
			});
			record.controls['dean'].disable();
		}
		else{
			
			this.toastrService.error(`Please First Add DEA in ${event.facility_full_qualifier} Practice Location`,"Error");
			record.patchValue({
				state_id: null,
				dean:'',
				id: null,
				facility_location_id: null,		
				dean_issue_date: '',
				nadean: '',
				is_deleted: false,
				spis:[]
								

			});
			record.controls['dean'].enable();
			record.controls['state_id'].enable();

		}
	}
	}
	onClickFacility(){
		
		this.medicalIdentifierDetail?.spis?.forEach(e=>{
			this.spiFacilities=this.spiFacilities.filter(res=> res.id!=e['facility_location'].id);
		});
	}
	userPracticeClicked()
	{
		this.userFaciltilies=this.userFaciltiliestemp;
		for(let i=0;i<this.form.controls.dea_records['controls'].length;i++)
		{
			let value=this.form.controls.dea_records['controls'].at(i).getRawValue();
			
			this.userFaciltilies=this.userFaciltilies.filter(res=>{ 
				if(res.id!==value.facility_location_id)
				{
					
					return true;
				}
			});
				
		}
	}
	onStateClick(){
		this.stateList=this.stateListTemp;
		for(let i=0;i<this.form.controls.dea_records['controls'].length;i++)
		{
			let value=this.form.controls.dea_records['controls'].at(i).getRawValue();
			
			if(value.facility_location_id==null &&value.state_id!=null){
			this.stateList=this.stateList.filter(res=>{ 
				
					if(res.id!==value.state_id)
					{
						return true;
					}
			});
		}
				
		}

	}
	onPracticeHover(row){
		this.pracReason="";
		if (row.controls['spis'].value.length > 0) {
			this.pracReason="You cant update practice location with spi attached";
		}
	}
	onStateHover(row){
		this.stateReason="";
		if (row.controls['spis'].value.length > 0) {
			
			this.stateReason="You cant update state with spi attached";
		}
		else if(row.controls['facility_location_id'].value!=null && row.controls['state_id'].disabled)
		{
			this.stateReason="State cannot be updated when practice loction is selected";
		}
	}
	onDeanHover(row)
	{
		this.deanReason="";
		if(row.controls['facility_location_id'].value!=null && row.controls['dean'].disabled)
		{
			this.deanReason="DEA cannot be updated when practice loction is selected";
		}
	}
	removeTaxonomy(i: number) {
		const control = <FormArray>this.form.controls['taxonomy_codes'];
		control.removeAt(i);
		this.ngSelectedSpecialty.next({
			status:true,
			value : control.value?.map(x => x.specialty_id)
		});
		this.selectedMultipleFieldFiter['specialties'] = control.value?.map(obj => {
			return {
				id: obj?.specialty_id,
				name: obj?.specialty_name
			}
		}
	)
	}
	addTaxonomy(item) {
		const control = <FormArray>this.form.controls['taxonomy_codes'];
		control.push(this.addTaxonomycodesInfo(item));
	}
	clearTaxonomy() {
		const control = <FormArray>this.form.controls['taxonomy_codes'];
		control.controls = [];	
	}
	get taxonomy_codes() {
		return this.form.controls["taxonomy_codes"] as FormArray;
	  }
	removeTaxonomyCotrol(i?: number) {
		const control = <FormArray>this.form.controls['taxonomy_codes'];
		control.removeAt(i);
	}
	addTaxonomycodesInfo(item) {
		let form: FormGroup = this.fb.group({
			specialty_id: [item?.id],
			specialty_name: [item?.name],
			taxonomy_code: [(item?.taxonomy_code || ''),[Validators.required, Validators.minLength(10),Validators.maxLength(10),Validators.pattern(this.taxonomyValidatorPattern)]]
		});
		return form;
	}
	specialtyAdded(event){
		this.addTaxonomy(event);
	}
	onKeyDownTaxo(i:number){
		(this.taxonomy_codes.controls[i] as FormGroup)?.controls['taxonomy_code']?.setValue((this.taxonomy_codes.controls[i] as FormGroup)?.controls['taxonomy_code']?.value?.toUpperCase())
	}
	removedSpec(event){
		let taxonomy_codesList = []
		 this.taxonomy_codes.controls.forEach((x) =>{
			taxonomy_codesList.push(x.value)
		})
		let index = taxonomy_codesList.findIndex(x => x.specialty_id === event?.data?.id);
		if(index != -1) this.removeTaxonomyCotrol(index);
	}
}
