import { Component, Input, OnChanges, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { Logger } from '@nsalaun/ng-logger';
import { FDServices } from '../../../../../fd_shared/services/fd-services.service';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { map, Observable, Subscription } from 'rxjs';
import { ParamQuery, OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { FirmUrlsEnum } from '@appDir/front-desk/masters/billing/attorney-master/firm/Firm-Urls-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { AttorneyUrlsEnum } from '@appDir/front-desk/masters/billing/attorney-master/attorney/Attorney-Urls-enum';
import { InputClass } from '@appDir/shared/dynamic-form/models/InputClass.class';
import { DivClass } from '@appDir/shared/dynamic-form/models/DivClass.class';
import { AddressClass } from '@appDir/shared/dynamic-form/models/AddressClass.class';
import { ButtonClass } from '@appDir/shared/dynamic-form/models/ButtonClass.class';
import { FieldConfig } from '@appDir/shared/dynamic-form/models/fieldConfig.model';
import { InputTypes } from '@appDir/shared/dynamic-form/constants/InputTypes.enum';
import { ButtonTypes } from '@appDir/shared/dynamic-form/constants/ButtonTypes.enum';
import { DynamicFormComponent } from '@appDir/shared/dynamic-form/components/dynamic-form/dynamic-form.component';
import { AutoCompleteClass } from '@appDir/shared/dynamic-form/models/AutoCompleteClass.class';
import { AttorneyModel, CaseModel, FirmModel } from '../../../../../fd_shared/models/Case.model';
import { getFieldControlByName } from '@appDir/shared/dynamic-form/helper';
import { CaseFlowServiceService } from '../../../../../fd_shared/services/case-flow-service.service';
import { DynamicControl } from '@appDir/shared/dynamic-form/models/DynamicControl.class';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { recursiveRemoveEmptyAndNullsFormObject, removeEmptyAndNullsFormObject, removeEmptyKeysFromObject } from '@appDir/shared/utils/utils.helpers';
import { ZipFormatMessages } from '@appDir/shared/dynamic-form/constants/ZipFormatMessages.enum';
import { NgSelectClass } from '@appDir/shared/dynamic-form/models/NgSelectClass.class';

@Component({
	selector: 'app-attorney-form',
	templateUrl: './attorney-form.component.html',
})
export class AttorneyFormComponent extends PermissionComponent implements OnChanges, OnDestroy {
	subscription: Subscription[] = [];
	public form: FormGroup;
	@Input() title = 'Edit';
	attorney: AttorneyModel;
	caseId: any;
	queryParams: ParamQuery;
	atttorneyqueryParams: ParamQuery;
	disableBtn = false;
	formEnabled: boolean = false;
	enableflag: boolean = true;
	allFirms: any[] = [];
	firmsData: any[] = [];
	singlFirm: any[] = [];
	locations: Array<any> = [];
	thirdPartyLocations: Array<any> = [];
	allLocationsBYFIrmId = [];
	loctaiondisable: boolean = false;
	locationParams: ParamQuery;
	allAttorney: any[] = [];
	attorneyList: any[] = [];
	page: number = 1;
	lastPage: number = 1;
	searchFirmName: string = '';
	order_by = 'count';
	firm_ids: any = [];
	constructor(
		private route: ActivatedRoute,
		router: Router,
		private logger: Logger,
		private fd_services: FDServices,
		private toastrService: ToastrService,
		requestService: RequestService,
		private caseFlowService: CaseFlowServiceService,
		aclService: AclService,
	) {
		super(aclService, router, route, requestService);
		this.setConfigration();
	}
	@ViewChild(DynamicFormComponent) dynamiccomponent: DynamicFormComponent;
	ngAfterViewInit() {
		if (this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_attorney_info_view)) {
			this.form = this.dynamiccomponent.form;

			this.getCase()
			this.bindFirmChange()
			this.bindThirdPartyFirmChange()
			this.bindAttorneyChange()
			this.bindLocationChange()
			this.bindThirdPartyLocationChange()
			this.form.markAsUntouched();
			this.form.markAsPristine();
		}
		if (!this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_attorney_info_edit)) {
			this.enableForm();


		}



	}

	enableForm() {
		let buttonDiv = getFieldControlByName(this.fieldConfig, 'button-div')
		if (this.form.disabled) {
			this.form.enable();
			buttonDiv.classes = buttonDiv.classes.filter(className => className != 'hidden')
		} else {
			this.form.disable();
			buttonDiv.classes.push('hidden')
		}
	}



	ngOnInit() {
		this.route.snapshot.pathFromRoot.forEach(path => {
			if (path && path.params && path.params.caseId) {
				if (!this.caseId) {
					this.caseId = path.params.caseId;
				}
			}
		})
		this.logger.log('case Id in attorney', this.caseId);
		// this.form.markAsUntouched();
		// this.form.markAsPristine();
	}

	ngOnChanges() {

	}



	case: CaseModel
	getCase() {
		this.subscription.push(
			this.caseFlowService.getCase(this.caseId).subscribe((res) => {
				this.disabledAttorneryDependentFields();
				this.case = res.result.data
				this.case.is_finalize ? this.formToggle() : null
				this.attorney = res.result.data.attorney;
				this.disableFields(true, ['apartment_suite', 'street_address', 'state', 'city', 'zip'], 'firm_location');
				this.disableFields(true, ['apartment_suite', 'street_address', 'state', 'city', 'zip', 'phone', 'fax', 'email'], 'third_party_firm_location');
				if (this.attorney) {
					if (this.attorney.attorney) {
						this.attorney.attorney = { ...this.attorney.attorney, full_name: `${this.attorney.attorney.first_name} ${this.attorney.attorney.middle_name ? this.attorney.attorney.middle_name : ''} ${this.attorney.attorney.last_name}`, attorney_id: this.attorney.attorney.id } as any
						this.lstAttorney = [this.attorney.attorney]
					}
					this.form.patchValue(this.attorney ? recursiveRemoveEmptyAndNullsFormObject(this.attorney) : {}, { emitEvent: false })
					let attorney_control = getFieldControlByName(this.fieldConfig, 'attorney_id') as AutoCompleteClass;
					attorney_control.items = this.lstAttorney
					this.attorney.firm ? this.attorney.firm['firm_locations'] = this.attorney.firm_location : {}
					this.attorney.third_party_firm ? this.attorney.third_party_firm['firm_locations'] = this.attorney.third_party_firm_location : {}
					this.lstFirm = [this.attorney.firm]
					this.thirdPartyFirm=[this.attorney.third_party_firm]
					let firm_control = getFieldControlByName(this.fieldConfig, 'firm_id');
					let third_party_firm_control = getFieldControlByName(this.fieldConfig, 'third_party_firm_id');
					third_party_firm_control.items=this.thirdPartyFirm
					firm_control.items = this.lstFirm
					let firm_location_control = getFieldControlByName(this.fieldConfig, 'firm_location_id');
					let third_party_firm_location_control = getFieldControlByName(this.fieldConfig, 'third_party_firm_location_id');
					if (this.attorney.firm_location) {
						this.locations = [this.attorney.firm_location]
						firm_location_control.items = this.locations;
					} 
					if (this.attorney.third_party_firm_location) {
						this.thirdPartyLocations = [this.attorney.third_party_firm_location]
						third_party_firm_location_control.items = this.thirdPartyLocations;
					} 
				}

			}),
		);
	}

	goBack() {
		this.caseFlowService.goBack()
	}

	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
		this.logger.log('attorney-form OnDestroy Called');
	}

	data: any[] = null;
	fieldConfig: FieldConfig[] = []; 
	setConfigration(data?) {
		this.fieldConfig = [
			new DivClass([
				new DynamicControl('id', null),

				// new AutoCompleteClass("Firm's Name", 'firm_id', 'name', 'id', this.searchFirm.bind(this), false, null, [], '', ['col-12 col-sm-6'],[],null,this.onFocusSearchFirm.bind(this),null,this.searchFirm.bind(this)),
				// new NgSelectClass("Firm's Name", 'firm_id', 'name', 'id', null, false, '', null, '', ['col-md-4', 'col-sm-3'],[],{add_tag:true},null,null,null,this.onFocusSearchFirm.bind(this),null,null,this.searchFirm.bind(this)),
				new NgSelectClass("Firm's Name", 'firm_id', 'name', 'id', this.searchFirm.bind(this), false, null, [], '', ['col-12 col-sm-6'],[],{add_tag: true,dropdownSearch:false},null,null,this.searchFirm.bind(this,null,'clear'),this.onFocusSearchFirm.bind(this), this.onScrollSearchFirm.bind(this)),
				// new AutoCompleteClass(' Location', 'firm_location_id', 'location_name', 'id', null, false, null, [], '', ['col-12 col-sm-6']),
				new NgSelectClass('Location', 'firm_location_id', 'location_name', 'id', null, false, null, [], '', ['col-12 col-sm-6'], [], { add_tag: true, dropdownSearch: false },null,null, this.onClearLocation.bind(this),this.onFocusLocation.bind(this)),

				new DivClass([

					new AddressClass('Street Address*', 'street_address', this.handleAddressChange.bind(this), '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-md-6', 'col-12 col-sm-6']),
					new InputClass('Suite/Floor', 'apartment_suite', InputTypes.text, data && data['apartment'] ? data['apartment'] : '', [], '', ['col-md-6', 'col-12 col-sm-6']),
					new InputClass('City*', 'city', InputTypes.text, data && data['city'] ? data['city'] : '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-md-4', 'col-12 col-sm-6 col-md-4']),
					new InputClass('State*', 'state', InputTypes.text, data && data['state'] ? data['state'] : '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-md-4', 'col-12 col-sm-6 col-md-4']),
					new InputClass('Zip*', 'zip', InputTypes.text, data && data['zip'] ? data['zip'] : '', [{ name: 'pattern', message: ZipFormatMessages.format_usa, validator: Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$') },{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-md-4', 'col-12 col-sm-6 col-md-4'], { skip_validation: true }),
				], ['display-contents'], '', '', { formControlName: 'firm_location' }),
			], ['row']),
			new DivClass([
				new DivClass([
					new NgSelectClass("First Name", 'attorney_id', 'first_name', 'id', null, false, '', null, '', ['col-md-4', 'col-sm-3'], [], { add_tag: true, dropdownSearch: false }, null, null, null, this.onFocussearchAttorney.bind(this), null, null, this.searchAttorney.bind(this)),
					new InputClass('Middle Name', 'middle_name', InputTypes.text, data && data['middle_name'] ? data['middle_name'] : '', [], '', ['col-md-4', 'col-sm-3'], null),
					new InputClass('Last Name*', 'last_name', InputTypes.text, data && data['last_name'] ? data['last_name'] : '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-md-4', 'col-sm-3'], null),
					new InputClass('Email', 'email', InputTypes.email, data && data['email1'] ? data['email1'] : '', [{ name: 'pattern', message: 'Email is not valid', validator: Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$') }], '', ['col-12 col-sm-6 col-md-4'], null),
					new InputClass('Fax', 'fax', InputTypes.text, data && data['fax'] ? data['fax'] : '', [], '', ['col-12 col-sm-6 col-md-4'], { mask: '000-000-0000' }),
					new InputClass('Work Phone', 'phone_no', InputTypes.text, data && data['workPhone'] ? data['workPhone'] : '', [], '', ['col-12 col-sm-6 col-md-4'], { mask: '000-000-0000' }),
					new InputClass('Extension', 'ext', InputTypes.text, data && data['cellPhone'] ? data['cellPhone'] : '', [], '', ['col-12 col-sm-6 col-md-4'], null),
					new InputClass('Cell Phone', 'cell_no', InputTypes.text, data && data['personalPhone'] ? data['personalPhone'] : '', [], '', ['col-12 col-sm-6 col-md-4'], { mask: '000-000-0000' }),

				], ['display-contents'], '', '', { formControlName: 'attorney' }),
			], ['row'], "Attorney's Information"),
			new DivClass([

				new InputClass('First Name', 'first_name', InputTypes.text, data && data['contactFirstName'] ? data['contactFirstName'] : '', [
					// { name: 'required', message: 'First name is required', validator: Validators.required }
				], '', ['col-12 col-sm-6 col-md-4']),
				new InputClass('Middle Name', 'middle_name', InputTypes.text, data && data['contactMiddleName'] ? data['contactMiddleName'] : '', [], '', ['col-12 col-sm-6 col-md-4'], null),
				new InputClass('Last Name', 'last_name', InputTypes.text, data && data['contactLastName'] ? data['contactLastName'] : '', [
					// { name: 'required', message: 'Last Name is required', validator: Validators.required }
				], '', ['col-12 col-sm-6 col-md-4'], null),
			], ['row'], "Contact Person's Detail", '', { formControlName: 'contact_person' }),

			new DivClass([
				new DynamicControl('id', null),
				new NgSelectClass("Firm's Name", 'third_party_firm_id', 'name', 'id', this.searchThirdPartyFirm.bind(this), false, null, [], '', ['col-12 col-sm-6'], [], { dropdownSearch: false }, null, null, this.searchThirdPartyFirm.bind(this), this.searchThirdPartyFirm.bind(this), this.onScrollSearchThirdPartyFirm.bind(this)),
				new NgSelectClass('Location', 'third_party_firm_location_id', 'location_name', 'id', null, false, null, [], '', ['col-12 col-sm-6'], [], { dropdownSearch: false }),
				new DivClass([
					new AddressClass('Street Address*', 'street_address', '', '', [], '', ['col-md-6', 'col-12 col-sm-6']),
					new InputClass('Suite/Floor', 'apartment_suite', InputTypes.text, data && data['apartment'] ? data['apartment'] : '', [], '', ['col-md-6', 'col-12 col-sm-6']),
					new InputClass('City', 'city', InputTypes.text, data && data['city'] ? data['city'] : '', [], '', ['col-md-4', 'col-12 col-sm-6 col-md-4']),
					new InputClass('State', 'state', InputTypes.text, data && data['state'] ? data['state'] : '', [], '', ['col-md-4', 'col-12 col-sm-6 col-md-4']),
					new InputClass('Zip', 'zip', InputTypes.text, data && data['zip'] ? data['zip'] : '', [{ name: 'pattern', message: ZipFormatMessages.format_usa, validator: Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$') }], '', ['col-md-4', 'col-12 col-sm-6 col-md-4'], { skip_validation: true }),
					new InputClass('Phone', 'phone', InputTypes.text, data && data['phone'] ? data['phone'] : '', [], '', ['col-md-4', 'col-12 col-sm-6 col-md-4'], { mask: '000-000-0000' }),
					new InputClass('Fax', 'fax', InputTypes.text, data && data['fax'] ? data['fax'] : '', [], '', ['col-md-4', 'col-12 col-sm-6 col-md-4'], { mask: '000-000-0000' }),
					new InputClass('Email', 'email', InputTypes.email, data && data['email1'] ? data['email1'] : '', [{ name: 'pattern', message: 'Email is not valid', validator: Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$') }], '', ['col-12 col-sm-6 col-md-4'], null)
				], ['display-contents'], '', '', { formControlName: 'third_party_firm_location' }),
			], ['row'], "Third Party Firm Details"),

			new DivClass([
				new ButtonClass('Back', ['btn', 'btn-primary', 'btn-block mt-0'], ButtonTypes.reset, this.goBack.bind(this), { icon: 'icon-left-arrow me-2', button_classes: [''] }),
				new ButtonClass('Save & Continue', ['btn', 'btn-success', 'btn-block mt-0'], ButtonTypes.submit, null, { icon: 'icon-save-continue me-2', button_classes: [''] })
			], ['row', 'form-btn', 'justify-content-center'], '', '', { name: 'button-div' })
	
		]
	}

	onFocusLocation(name) {
		this.page = 1;
		return new Observable((res) => {
			let attorneyid = this.form.value.attorney ? this.form.value.attorney.attorney_id : null;
			const id = typeof (attorneyid) === 'number' ? attorneyid : null;			
			this.firm_ids.push(this.form.value.firm_id)
			this.getFirm('',id,this.firm_ids).subscribe(data => {

				this.lstFirm = data['result']['data']
				this.lastPage = data['result']['last_page'];

				const firmIdToMatch = this.form.value.firm_id;
				// Iterate through lstFirm array
				for (const firm of this.lstFirm) {
					if (firm.id === firmIdToMatch) {
						this.locations = firm ? firm.firm_locations : [] ;
					}
				}
				res.next(this.locations);
			})
		})
	}


	onClearLocation(name) {
		this.page = 1;
		return new Observable((res) => {
			let attorneyid = this.form.value.attorney ? this.form.value.attorney.attorney_id : null;
			const id = typeof (attorneyid) === 'number' ? attorneyid : null;
			this.getFirm('',id).subscribe(data => {

				this.lstFirm = data['result']['data']
				this.lastPage = data['result']['last_page'];

				const firmIdToMatch = this.form.value.firm_id;
				// Iterate through lstFirm array
				for (const firm of this.lstFirm) {
					if (firm.id === firmIdToMatch) {
						this.locations = firm ? firm.firm_locations : [] ;
					}
				}
				res.next(this.locations);
			})
		})
	}

	public handleAddressChange(address: Address) {
        let street_number = this.fd_services.getComponentByType(address, 'street_number');
        let route = this.fd_services.getComponentByType(address, 'route');
        let city = this.fd_services.getComponentByType(address, 'locality');
        let state = this.fd_services.getComponentByType(address, 'administrative_area_level_1');
        let postal_code = this.fd_services.getComponentByType(address, 'postal_code');
        let lat = address.geometry?.location.lat();
        let lng = address.geometry?.location.lng();

        if (street_number != null) {
			let address: any;
			address = (street_number.long_name || '') + ' ' + (route.long_name || '');
			this.form.controls['firm_location'].patchValue({
				street_address: address,
				city: city.long_name,
				state: state.long_name,
				zip: postal_code.long_name,
				lat: lat,
				lng: lng,
			});
			const firmLocationControl = this.form.get('firm_location');
			if (firmLocationControl && (!address || address.trim() === '')) {
				const streetAddressControl = firmLocationControl.get('street_address');
				streetAddressControl.setErrors({ required: true });
			}
		} else {
            this.form.controls['firm_location'].patchValue({
                street_address: '',
                city: '',
                state: '',
                zip: '',
                lat: '',
                lng: '',
            });
        }
    }

	bindThirdPartyLocationChange() {
		this.subscription.push(
			this.form.controls['third_party_firm_location_id'].valueChanges.subscribe(id => {
				if (this.form.value && this.form.value.third_party_firm_id) {
					this.form.controls['third_party_firm_location_id'].setValidators([Validators.required]);
					this.form.controls['third_party_firm_location_id'].updateValueAndValidity({ emitEvent: false });
					if (Array.isArray(this.fieldConfig) && this.fieldConfig.length)
					{
						this.fieldConfig[3].children[2].label = ' Location*';
						this.fieldConfig[3].children[2].validations = [
						{ name: 'required', message: 'This field is required', validator: Validators.required }];
					}
				} else {
					this.form.controls['third_party_firm_location_id'].clearValidators();
					this.form.controls['third_party_firm_location_id'].updateValueAndValidity({ emitEvent: false });
					if (Array.isArray(this.fieldConfig) && this.fieldConfig.length)
					{
					this.fieldConfig[3].children[2].label = ' Location';
					this.fieldConfig[3].children[2].validations = [];
					}
				}
				if (!id) {
					let location_form = this.form.controls['third_party_firm_location']
					location_form.reset({}, { emitEvent: false });
					this.form.controls['third_party_firm_id'].clearValidators();
					this.form.controls['third_party_firm_id'].updateValueAndValidity({ emitEvent: false });
					if (Array.isArray(this.fieldConfig) && this.fieldConfig.length)
					{
					this.fieldConfig[3].children[1].label = "Firm's Name";
					this.fieldConfig[3].children[1].validations = [];
					}
					return;
				}
				let firm = this.thirdPartyFirm.find(firm => firm.id === this.form.get('third_party_firm_id').value)
				if (firm && firm.firm_locations) {
					let location;
					Array.isArray(firm.firm_locations) ? location = firm.firm_locations.find(location => location.id === id) : location = firm.firm_locations
					if (location) {
						this.form.patchValue({ third_party_firm_location: location }, { emitEvent: false });
					} else {
						this.disableFields(false, ['apartment_suite', 'street_address', 'state', 'city', 'zip', 'phone', 'fax', 'email'], 'third_party_firm_location');
						let location_form = this.form.controls['third_party_firm_location']
						location_form.reset({}, { emitEvent: false });
					}
					this.form.controls['third_party_firm_id'].setValidators([Validators.required]);
					this.form.controls['third_party_firm_id'].updateValueAndValidity({ emitEvent: false });
					if (Array.isArray(this.fieldConfig) && this.fieldConfig.length)
					{
					this.fieldConfig[3].children[1].label = "Firm's Name*";
					this.fieldConfig[3].children[1].validations = [
						{ name: 'required', message: 'This field is required', validator: Validators.required }];
					}
				} else {
					this.form.controls['third_party_firm_id'].setValidators([Validators.required]);
					this.form.controls['third_party_firm_id'].updateValueAndValidity({ emitEvent: false });
					if (Array.isArray(this.fieldConfig) && this.fieldConfig.length)
					{
					this.fieldConfig[3].children[1].label = "Firm's Name*";
					this.fieldConfig[3].children[1].validations = [
						{ name: 'required', message: 'This field is required', validator: Validators.required },
					];
					}
					this.disableFields(false, ['apartment_suite', 'street_address', 'state', 'city', 'zip', 'phone', 'fax', 'email'], 'third_party_firm_location');
					let location_form = this.form.controls['third_party_firm_location']
					location_form.reset({}, { emitEvent: false });
				}
			}))
	}
	bindLocationChange() {
		this.subscription.push(
			this.form.controls['firm_location_id'].valueChanges.subscribe(id => {
				if (this.form.value && this.form.value.firm_id) {
					this.form.controls['firm_location_id'].setValidators([Validators.required]);
					this.form.controls['firm_location_id'].updateValueAndValidity({ emitEvent: false });
					if (Array.isArray(this.fieldConfig) && this.fieldConfig.length)
					{
					this.fieldConfig[0].children[2].label = ' Location*';
					this.fieldConfig[0].children[2].validations = [
						{ name: 'required', message: 'This field is required', validator: Validators.required },
					];
					}
				} else {
					this.form.controls['firm_location_id'].clearValidators();
					this.form.controls['firm_location_id'].updateValueAndValidity({ emitEvent: false });
					if (Array.isArray(this.fieldConfig) && this.fieldConfig.length)
					{
					this.fieldConfig[0].children[2].label = ' Location';
					this.fieldConfig[0].children[2].validations = [];
					}
				}
				if (!id) {
					let location_form = this.form.controls['firm_location']
					location_form.reset({}, { emitEvent: false });
					this.form.controls['firm_id'].clearValidators();
					this.form.controls['firm_id'].updateValueAndValidity({ emitEvent: false });
					if (Array.isArray(this.fieldConfig) && this.fieldConfig.length)
					{
					this.fieldConfig[0].children[1].label = "Firm's Name";
					this.fieldConfig[0].children[1].validations = [];
					}
					return;
				}
				let firm = this.lstFirm.find(firm => firm.id === this.form.get('firm_id').value)
				if (firm && firm.firm_locations ) {
					let location;
					Array.isArray(firm.firm_locations) ? location = firm.firm_locations.find(location => location.id === id) : location = firm.firm_locations
					if (location) {
						this.form.patchValue({ firm_location: location }, { emitEvent: false });
					} else {
						this.disableFields(false, ['apartment_suite', 'street_address', 'state', 'city', 'zip'], 'firm_location');
						let location_form = this.form.controls['firm_location']
						location_form.reset({}, { emitEvent: false });
					}
					this.form.controls['firm_id'].setValidators([Validators.required]);
					this.form.controls['firm_id'].updateValueAndValidity({ emitEvent: false });
					if (Array.isArray(this.fieldConfig) && this.fieldConfig.length)
					{
					this.fieldConfig[0].children[1].label = "Firm's Name*";
					this.fieldConfig[0].children[1].validations = [
						{ name: 'required', message: 'This field is required', validator: Validators.required },
					];
					}
				} else {
					this.form.controls['firm_id'].setValidators([Validators.required]);
					this.form.controls['firm_id'].updateValueAndValidity({ emitEvent: false });
					if (Array.isArray(this.fieldConfig) && this.fieldConfig.length)
					{
					this.fieldConfig[0].children[1].label = "Firm's Name*";
					this.fieldConfig[0].children[1].validations = [
						{ name: 'required', message: 'This field is required', validator: Validators.required },
					];
					}
					this.disableFields(false, ['apartment_suite', 'street_address', 'state', 'city', 'zip'], 'firm_location');
					let location_form = this.form.controls['firm_location']
					location_form.reset({}, { emitEvent: false });
				}


			}))

	}

	bindThirdPartyFirmChange() {

		this.subscription.push(
			this.form.controls['third_party_firm_id'].valueChanges.subscribe(id => {
				let third_party_firm_control = getFieldControlByName(this.fieldConfig, 'third_party_firm_id');
				this.disableFields(true, ['apartment_suite', 'street_address', 'state', 'city', 'zip', 'phone', 'fax', 'email'], 'third_party_firm_location');
				if (!id) {
					(this.form.controls['third_party_firm_location'] as FormGroup).reset({}, { emitEvent: false })
					this.form.controls['third_party_firm_location_id'].reset(null, { emitEvent: false });
					this.form.controls['third_party_firm_location_id'].clearValidators();
					this.form.controls['third_party_firm_location_id'].updateValueAndValidity({ emitEvent: false });
					this.form.controls['third_party_firm_id'].clearValidators();
					this.form.controls['third_party_firm_id'].updateValueAndValidity({ emitEvent: false });
					if (Array.isArray(this.fieldConfig) && this.fieldConfig.length)
					{
					this.fieldConfig[0].children[3].label = ' Location';
					this.fieldConfig[0].children[3].validations = [];
					this.fieldConfig[0].children[3].label = "Firm's Name";
					this.fieldConfig[0].children[3].validations = [];
					}
					return
				}
				let firm = this.thirdPartyFirm.find(firm => firm.id === id)
				this.thirdPartyFirm = this.thirdPartyFirm.filter(firm => firm.id === id)
				third_party_firm_control.items = this.thirdPartyFirm
				this.thirdPartyLocations = firm ? firm.firm_locations : []
				getFieldControlByName(this.fieldConfig, 'third_party_firm_location_id').items = firm ? firm.firm_locations : []
				this.form.controls['third_party_firm_location_id'].setValue('');
				this.form.controls['third_party_firm_location_id'].setValidators([Validators.required]);
				this.form.controls['third_party_firm_location_id'].updateValueAndValidity({ emitEvent: false });
				this.form.controls['third_party_firm_id'].setValidators([Validators.required]);
				this.form.controls['third_party_firm_id'].updateValueAndValidity({ emitEvent: false });
				if (Array.isArray(this.fieldConfig) && this.fieldConfig.length)
				{
				this.fieldConfig[3].children[2].label = ' Location*';
				this.fieldConfig[3].children[2].validations = [
					{ name: 'required', message: 'This field is required', validator: Validators.required }];
				this.fieldConfig[3].children[1].label = "Firm's Name*";
				this.fieldConfig[3].children[1].validations = [
					{ name: 'required', message: 'This field is required', validator: Validators.required },
				];
				}
				if (firm && firm.firm_locations) {
					firm.firm_locations.length == 1 ? this.form.controls.third_party_firm_location_id.setValue(firm.firm_locations[0].id) : getFieldControlByName(this.fieldConfig, 'third_party_firm_location_id').classes.push('glow')
				}

			})
		)
	}

	bindFirmChange() {
		this.subscription.push(
			this.form.controls['firm_id'].valueChanges.subscribe(id => {
				let firm_control = getFieldControlByName(this.fieldConfig, 'firm_id');
				let attorney_control = getFieldControlByName(this.fieldConfig, 'attorney_id') as AutoCompleteClass;
				this.disableFields(true, ['apartment_suite', 'street_address', 'state', 'city', 'zip'], 'firm_location');
				if (!id) {
					(this.form.controls['firm_location'] as FormGroup).reset({}, { emitEvent: false })
					this.form.controls['firm_location_id'].reset(null, { emitEvent: false });
					this.form.controls['firm_location_id'].clearValidators();
					this.form.controls['firm_location_id'].updateValueAndValidity({ emitEvent: false });
					this.form.controls['firm_id'].clearValidators();
					this.form.controls['firm_id'].updateValueAndValidity({ emitEvent: false });
					if (Array.isArray(this.fieldConfig) && this.fieldConfig.length)
					{
					this.fieldConfig[0].children[2].label = ' Location';
					this.fieldConfig[0].children[2].validations = [];
					this.fieldConfig[0].children[1].label = "Firm's Name";
					this.fieldConfig[0].children[1].validations = [];
					}
					if (!(this.form.value.attorney && this.form.value.attorney.attorney_id)) {
						this.lstFirm = [];
						firm_control.items = this.lstFirm;
						this.lstAttorney = [];
						attorney_control.items = this.lstAttorney
					}
					return
				}
				let firm = this.lstFirm.find(firm => firm.id === id)
				this.lstFirm = this.lstFirm.filter(firm => firm.id === id)
				firm_control.items = this.lstFirm
				this.locations = firm ? firm.firm_locations : []
				getFieldControlByName(this.fieldConfig, 'firm_location_id').items = firm ? firm.firm_locations : []
				this.form.controls['firm_location_id'].setValue('');
				this.form.controls['firm_location_id'].setValidators([Validators.required]);
				this.form.controls['firm_location_id'].updateValueAndValidity({ emitEvent: false });
				this.form.controls['firm_id'].setValidators([Validators.required]);
				this.form.controls['firm_id'].updateValueAndValidity({ emitEvent: false });
				if (Array.isArray(this.fieldConfig) && this.fieldConfig.length)
				{
				this.fieldConfig[0].children[2].label = ' Location*';
				this.fieldConfig[0].children[2].validations = [
					{ name: 'required', message: 'This field is required', validator: Validators.required },
				];
				this.fieldConfig[0].children[1].label = "Firm's Name*";
				this.fieldConfig[0].children[1].validations = [
					{ name: 'required', message: 'This field is required', validator: Validators.required },
				];
				}
				if (!(this.form.value.attorney && this.form.value.attorney.attorney_id)) {
					this.lstAttorney = [];
					attorney_control.items = this.lstAttorney
				}
				if (firm && firm.firm_locations) {
					firm.firm_locations.length == 1 ? this.form.controls.firm_location_id.setValue(firm.firm_locations[0].id) : getFieldControlByName(this.fieldConfig, 'firm_location_id').classes.push('glow')
				}

			})
		)

	}
	
	
	disabledAttorneryDependentFields() {
		let attornyform = this.form.controls['attorney'] as FormGroup
		let contactPersonDetailForm = this.form.controls['contact_person'] as FormGroup
		let enabledControlNames = ['cell_no', 'email', 'ext', 'fax', 'phone_no', 'middle_name', 'last_name']
		enabledControlNames.forEach(name => { attornyform.get(name).disable() })
		let enabledControlNamesContactPersonDetail = ['first_name', 'last_name', 'middle_name']
		enabledControlNamesContactPersonDetail.forEach(name => { contactPersonDetailForm.get(name).disable() })
	}
	enalbedAttorneyDependentField() {
		let attornyform = this.form.controls['attorney'] as FormGroup
		let contactPersonDetailForm = this.form.controls['contact_person'] as FormGroup
		let enabledControlNames = ['cell_no', 'email', 'ext', 'fax', 'phone_no', 'middle_name', 'last_name']
		enabledControlNames.forEach(name => { attornyform.get(name).enable() })
		let enabledControlNamesContactPersonDetail = ['first_name', 'last_name', 'middle_name']
		enabledControlNamesContactPersonDetail.forEach(name => { contactPersonDetailForm.get(name).enable() })
	}

	
	bindAttorneyChange() {
		let attornyform = this.form.controls['attorney'] as FormGroup
		let contactPersonDetailForm = this.form.controls['contact_person'] as FormGroup
		this.subscription.push(
			attornyform.get('attorney_id').valueChanges.subscribe(id => {
				if (this.isNewAttorneyIDString()) {
					if (attornyform.controls['attorney_id'].value) {
						this.enalbedAttorneyDependentField();
					}
				} else {
					this.disabledAttorneryDependentFields();
					let attornyFormDiv = getFieldControlByName(this.fieldConfig, 'attorney');
					let attorntControl = getFieldControlByName(attornyFormDiv.children, 'attorney_id');
					let firm_control = getFieldControlByName(this.fieldConfig, 'firm_id');
					if (!id) {
						let attorney_form = this.form.controls['attorney']
						attorney_form.reset({}, { emitEvent: false })
						let contact_form = this.form.controls['contact_person']
						contact_form.reset({}, { emitEvent: false })
						this.lstAttorney = [];
						attorntControl.items = this.lstAttorney;
						if (!this.form.value.firm_id) {
							this.lstFirm = [];
							firm_control.items = this.lstFirm;
						}
						return
					}
					let attorney = this.lstAttorney.find(attorney => attorney.id === id);
					this.lstAttorney = this.lstAttorney.filter(attorney => attorney.id === id);
					attorntControl.items = this.lstAttorney;
					if (attorney) {
						if (!this.form.value.firm_id) {
							this.form.patchValue({ firm_id: null, attorney: attorney, contact_person: attorney.contact_person ? attorney.contact_person : {} }, { emitEvent: false })
							this.lstFirm = []
							let firm_control = getFieldControlByName(this.fieldConfig, 'firm_id');
							firm_control.items = this.lstFirm
						}
						else
							this.form.patchValue({ attorney: attorney, contact_person: attorney.contact_person ? attorney.contact_person : {} }, { emitEvent: false })

					}
				}
			}))
	}

	searchFirm(name,isClear) {
		this.page = 1;
		this.searchFirmName = name;
		if(isClear){
			this.locations = [] ;
		}
		
		return new Observable((res) => {
			let attorneyid = this.form.value.attorney ? this.form.value.attorney.attorney_id : null;
			const id = typeof (attorneyid) === 'number' ? attorneyid : null;
			this.getFirm('',id).subscribe(data => {

				this.lstFirm = data['result']['data']
				this.lastPage = data['result']['last_page'];
				res.next(this.lstFirm);
			})
		})
	}

	onScrollSearchFirm(name) {
		this.page = this.page + 1;
		if(this.lastPage >= this.page ){
			return new Observable((res) => {
				let attorneyid=this.form.value.attorney?this.form.value.attorney.attorney_id:null;
				const id = typeof(attorneyid) === 'number' ? attorneyid: null;
				this.getFirm('',id).subscribe(data => {
					this.lstFirm = [...this.lstFirm, ...data['result']['data']]
					res.next(this.lstFirm);
				})
			})
		}
		return new Observable((res) => {
			res.next(this.lstFirm);
		})
	}

	searchThirdPartyFirm(name) {
		this.page = 1;
		this.searchFirmName = name;
		return new Observable((res) => {
			this.getFirm('', null).subscribe(data => {
				this.thirdPartyFirm = data['result']['data']
				this.lastPage = data['result']['last_page'];
				res.next(this.thirdPartyFirm);
			})
		})
	}

	onScrollSearchThirdPartyFirm() {
		this.page = this.page + 1;
		if(this.lastPage >= this.page ){
			return new Observable((res) => {
				this.getFirm('',null).subscribe(data => {
					this.thirdPartyFirm = [...this.thirdPartyFirm, ...data['result']['data']]
					res.next(this.thirdPartyFirm);
				})
			})
		}
		return new Observable((res) => {
			res.next(this.thirdPartyFirm);
		})
	}
	
	onFocusSearchFirm(name) {
		this.page = 1;
		return new Observable((res) => {
			if (!this.lstFirm.length && !this.isNewAttorneyIDString()) { 
				let attorneyid = this.form.value.attorney ? this.form.value.attorney.attorney_id : null
				const id = typeof (attorneyid) === 'number' ? attorneyid : null;
				this.getFirm('', id).subscribe(data => {
					this.lstFirm = data['result']['data']
					this.lastPage = data['result']['last_page'];
					res.next(this.lstFirm);
				})
			}
			else {
				let attorneyid = this.form.value.attorney ? this.form.value.attorney.attorney_id : null;
				const id = typeof (attorneyid) === 'number' ? attorneyid : null;
				this.getFirm('', id).subscribe(data => {
					this.lstFirm = data['result']['data']
					this.lastPage = data['result']['last_page'];
					res.next(this.lstFirm);
				})
			}

		})

	}
	searchAttorney(name) {
		return new Observable((res) => {
			const firmId = typeof (this.form.value.firm_id) === 'number' ? this.form.value.firm_id : null
			this.getAttorney(name, '', firmId).subscribe(data => {
				this.lstAttorney = (data['result'] && data['result']['data']) ? data['result']['data'] : []
				res.next(this.lstAttorney)
			})
		})
	}

	onFocussearchAttorney(name) {
		return new Observable((res) => {
			if (!this.lstAttorney.length) {
				// this.form.value.firm_id
				const firmId = typeof (this.form.value.firm_id) === 'number' ? this.form.value.firm_id : null;
				this.getAttorney(name, '', firmId).subscribe(data => {
					this.lstAttorney = (data['result'] && data['result']['data']) ? data['result']['data'] : []
					res.next(this.lstAttorney)
				})
			}
			else {
				res.next(this.lstAttorney)
			}

		})
	}
	formToggle() {
		let control = getFieldControlByName(this.fieldConfig, 'button-div')
		if (this.form.disabled) {
			control.classes = control.classes.filter(className => className != 'hidden')
			this.form.enable()
		} else {
			control.classes.push('hidden')
			// this.form.disable()
		}
	}
	onSubmit(form) {
		form['contact_information'] = removeEmptyAndNullsFormObject(form['contact_person'])
		// this.formToggle() commented it ,bcz it disable field and hide save and continue button when its on last allowed route
		let firm = form.firm_id ? this.lstFirm.find(firm => firm.id == form.firm_id) : ''
		if(firm === undefined && form.firm_id === this.attorney.firm.id){
			firm = this.attorney.firm;
		}
		let third_party_firm = form.third_party_firm_id ? this.thirdPartyFirm.find(third_party_firm => third_party_firm.id == form.third_party_firm_id) : ''
		let location = form.firm_location_id && this.locations ? this.locations.find(location => location.id == form.firm_location_id) : '';
		let third_party_location;
		if (Array.isArray(this.thirdPartyLocations) && this.thirdPartyLocations.length)
			{		
				third_party_location = form.third_party_firm_location_id && this.thirdPartyLocations ? this.thirdPartyLocations.find(location => location.id == form.third_party_firm_location_id) : '';
			}
		else
			{
				third_party_location = this.thirdPartyLocations;
			}		if (!location) {
			location = {}
		}
		form['is_deleted'] = (form.firm_id || (form.attorney && form.attorney.attorney_id) || form.third_party_firm_id ) ? false : true;
		let information = {
			firm_name: firm ? firm.name : form.firm_id,
			third_party_firm_name: third_party_firm ? third_party_firm.name : third_party_firm.id,
			location: location.location_name,
			third_party_location: third_party_location.location_name,
			location_name: location.city ? location.location_name : form.firm_location_id,
			third_party_location_name: third_party_location.city ? third_party_location.location_name : form.third_party_firm_location_id,
			first_name: form.attorney.first_name,
			middle_name: form.attorney.middle_name,
			last_name: form.attorney.last_name,
			street_address: location.street_address ? location.street_address : form.firm_location.street_address,
			third_party_street_address: third_party_location.street_address ? third_party_location.street_address : form.third_party_firm_location.street_address,
			apartment_suite: location.apartment_suite ? location.apartment_suite : form.firm_location.apartment_suite,
			third_party_apartment_suite: third_party_location.apartment_suite ? third_party_location.apartment_suite : form.third_party_firm_location.apartment_suite,
			city: location.city ? location.city : form.firm_location.city,
			third_party_city: third_party_location.city ? third_party_location.city : form.third_party_firm_location.city,
			state: location.state ? location.state : form.firm_location.state,
			third_party_state: third_party_location.state ? third_party_location.state : form.third_party_firm_location.state,
			zip: location.zip ? location.zip : form.firm_location.zip,
			third_party_zip: third_party_location.zip ? third_party_location.zip : form.third_party_firm_location.zip,
			phone: location.phone,
			third_party_phone: third_party_location.phone,
			cell: location.cell,
			third_party_cell: third_party_location.cell,
			ext: location.ext,
			third_party_ext: third_party_location.ext,
			email: location.email,
			third_party_email: third_party_location.email,
			fax: location.fax,
			third_party_fax: third_party_location.fax,
			from_web:true
		}
		form.firm_id = !firm ? null : form.firm_id;
		form.third_party_firm_id = !third_party_firm ? null : form.third_party_firm_id;
		form.firm_location_id = !location.city ? null : form.firm_location_id;
		form.third_party_firm_location_id = !third_party_location.city ? null : form.third_party_firm_location_id; // this line ------------
		form['attorney_id'] = this.isNewAttorneyIDString() ? null : form.attorney.attorney_id,
			form['id'] = this.attorney ? this.attorney.id : null
		form && form.attorney && form.attorney.attorney_id && this.isNewAttorneyIDString() ? form.attorney.first_name = form.attorney.attorney_id : form.attorney.attorney_id
		form && form.attorney && form.attorney.attorney_id && this.isNewAttorneyIDString() ? form.attorney.attorney_id = null : form['attorney_id']
		if (this.isNewAttorneyIDString() && form && form.attorney) {
			form.attorney['id'] = null;
		}
		form['information'] = information
		console.log(information,"information")
		this.caseFlowService.updateCase(this.caseId, { attorney: form }).subscribe(data => {
			this.toastrService.success('Successfully Updated', 'Success')
			this.form.markAsPristine();
			this.form.markAsUntouched();
			this.caseFlowService.getPersonalInformation(this.caseId).subscribe(data => {
			})
			this.caseFlowService.goToNextStep()

		}, err => this.toastrService.error(err.error.message, 'Error'))
	}
	onReady() {
	}

	lstFirm: any[] = []
	thirdPartyFirm: any[] = []

	getFirm(firmid?,attorneyid?, firm_ids?) {

		let order_by;
		let order;
		let name = this.searchFirmName
		if(name)
		{
			// order_by='insurance_name';
			order = OrderEnum.DEC
		}
		else {
			order_by = 'count';
			order = OrderEnum.DEC
		}

		let paramQuery: any = { filter: true, order: OrderEnum.DEC, pagination: false, page: this.page, per_page: 20, order_by: order_by, attorney_id: attorneyid, firm_ids: firm_ids, dropDownFilter:true }
		paramQuery = removeEmptyKeysFromObject(paramQuery);
		let filter = {}
		firmid ? filter['id'] = firmid : null
		name ? filter['name'] = name : null
		// order_by ? filter['order_by'] = order_by : null
		return this.requestService.sendRequest(FirmUrlsEnum.AllFirms_list_GET, 'get', REQUEST_SERVERS.fd_api_url, { ...paramQuery, ...filter })
	}

	// onFocusGetFirms()
	lstAttorney: any[] = []
	getAttorney(name, id, firm_id) {
		let order_by;
		let order;
		if (name) {
			order_by = null;
			order = OrderEnum.ASC
		}
		else {
			order_by = 'count';
			order = OrderEnum.DEC
		}

		let paramQuery: ParamQuery = { filter: true, order: order, pagination: false, order_by: order_by,dropDownFilter:true }
		paramQuery = removeEmptyKeysFromObject(paramQuery);
		let filter = {}
		id ? filter['id'] = id : null
		name ? filter['name'] = name : null;
		firm_id ? filter['firm_id'] = firm_id : null;
		// order_by? filter['order_by']=order_by : null;
		return this.requestService.sendRequest(AttorneyUrlsEnum.attorney_list_GET, 'get', REQUEST_SERVERS.fd_api_url, { ...paramQuery, ...filter })
			.pipe(map(response => {
				let lst: any[] = response['result']['data'];
				lst = lst.map(attorney => {
					return { ...attorney, full_name: `${attorney.first_name} ${attorney.middle_name ? attorney.middle_name : ''} ${attorney.last_name}` }
				})
				response['result']['data'] = lst
				return response
			}));
	}
	isNewAttorneyIDString() {
		let attornyform = this.form.controls['attorney'] as FormGroup
		debugger;
		let type = typeof attornyform.controls['attorney_id'].value;
		if (type == 'string') {
			return true;
		}
		return false;
	}
	disableFields(disable, disableControlNames: any[], ControlFormGroup?, controlName?) {
		if (disable) {
			if (ControlFormGroup) {
				let formgroup = this.form.controls[ControlFormGroup] as FormGroup
				disableControlNames.forEach(name => {
					formgroup.get(name).disable();

				})
			}
			else {
				disableControlNames.forEach(name => { this.form.get(name).disable() })
			}
		}
		else {
			if (ControlFormGroup) {
				let formgroup = (this.form.controls[ControlFormGroup]) as FormGroup
				disableControlNames.forEach(name => {
					formgroup.get(name).enable();

				})
			}
			else {
				disableControlNames.forEach(name => { this.form.get(name).disable() })
			}
		}

	}
}
