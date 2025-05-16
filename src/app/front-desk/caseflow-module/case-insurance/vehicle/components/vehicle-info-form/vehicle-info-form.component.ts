import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Logger } from '@nsalaun/ng-logger';
import { FDServices } from '../../../../../fd_shared/services/fd-services.service';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CanDeactivateComponentInterface } from '@appDir/shared/canDeactivateFormsComponent/CanDeactivateComponent.interface';
import { ParamQuery, OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { InsuranceUrlsEnum } from '@appDir/front-desk/masters/billing/insurance-master/Insurance/insurance-list/Insurance-Urls-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { DivClass } from '@appDir/shared/dynamic-form/models/DivClass.class';
import { RadioButtonClass } from '@appDir/shared/dynamic-form/models/RadioButtonClass.class';
import { SelectClass } from '@appDir/shared/dynamic-form/models/SelectClass.class';
import { InputClass } from '@appDir/shared/dynamic-form/models/InputClass.class';
import { InputTypes } from '@appDir/shared/dynamic-form/constants/InputTypes.enum';
import { ButtonTypes } from '@appDir/shared/dynamic-form/constants/ButtonTypes.enum';
import { ButtonClass } from '@appDir/shared/dynamic-form/models/ButtonClass.class';
import { DynamicFormComponent } from '@appDir/shared/dynamic-form/components/dynamic-form/dynamic-form.component';
import { FieldConfig } from '@appDir/shared/dynamic-form/models/fieldConfig.model';
import { AddressClass } from '@appDir/shared/dynamic-form/models/AddressClass.class';
import { VehicleInfo, ObjectInvolved } from '@appDir/front-desk/models/VehicleInfo';
import { DynamicControl } from '@appDir/shared/dynamic-form/models/DynamicControl.class';
import { CaseFlowServiceService } from '../../../../../fd_shared/services/case-flow-service.service';
import { getFieldControlByName } from '@appDir/shared/dynamic-form/helper';
import { AutoCompleteClass } from '@appDir/shared/dynamic-form/models/AutoCompleteClass.class';
import { BillingInsuranceModel } from '@appDir/front-desk/masters/billing/insurance-master/models/BillingInsurance.Model';
import {
  changeDateFormat,
  dateFormatterMDY,
  dateObjectPicker,
  unSubAllPrevious,
} from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { makeDeepCopyArray, removeEmptyKeysFromObject, statesList, WithoutTime,allStatesList  } from '@appDir/shared/utils/utils.helpers';
import { Location } from '@angular/common';
import { VehicleUrlsEnum } from './Vehicle-Urls-Enum';
import { CaseModel } from '../../../../../fd_shared/models/Case.model';
import { AclService } from '@appDir/shared/services/acl.service';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { ZipFormatMessages } from '@appDir/shared/dynamic-form/constants/ZipFormatMessages.enum';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-vehicle-info-form',
  templateUrl: './vehicle-info-form.component.html',
})
export class VehicleInfoFormComponent extends PermissionComponent implements OnChanges, CanDeactivateComponentInterface {

  public vehicleForm: FormGroup
  public driverForm: FormGroup
  public ownerForm: FormGroup
  public driveAddressForm: FormGroup
  public ownerAddressForm: FormGroup
  public objectForm: FormGroup
  public contact_informationForm: FormGroup
  public vehicleDetailform: FormGroup
  @Input() title = 'Edit'
  @Input() caseId: any;
  @Input() caseData: any;
  @Output() getCase = new EventEmitter();
  formEnabled: boolean = false;
  enableflag: boolean = true;
  selection = new SelectionModel<Element>(true, []);
  // public states: any[] = [];
  public cities: any[] = [];
  public counties: any[] = [];
  public prevtDoctorRows: any[] = [];
  public colors: any[];
  public existingVehicles: any = [];
  vehicleFormEnabled: boolean = false;
  public patientId: any;
  private accidentId: any;
  public vehicleCount: number;
  public vehicles: any[];
  public vehicle_list: any[];
  public vehicle_alllist: any[] = [];
  public vehicleData: VehicleInfo;
  public vehicleTitle: any;
  public index: any;
  public vehicleInfos: any = [];
  private reportData: ObjectInvolved;
  vehicleDetailData: any = [];
  disableBtn = false
  vehicleDisableBtn = false
  public modalRef: NgbModalRef;
  vehicleDetail: any;
  public vehicle_no: string = 'Vehicle 1';
  public titleVal: string = "Add"
  state = statesList
  states: any[] = [];
  loadSpin: boolean = false
  queryParams: ParamQuery;
  allInsurances: Array<any> = [];
  lstUsers: Array<any> = [];
  subscription: any[] = [];
  allStates = allStatesList;

  ngOnDestroy() {
    unSubAllPrevious(this.subscription)
  }
  @ViewChild(DynamicFormComponent) component: DynamicFormComponent;
  @ViewChild('dymanic2', { read: DynamicFormComponent }) component1: DynamicFormComponent;
  @ViewChild('saveVehicle') modal: VehicleInfoFormComponent;
  constructor(private modalService: NgbModal,
    protected requestService: RequestService,
    private fb: FormBuilder, private logger: Logger,
    private caseFlowService: CaseFlowServiceService,
    private location: Location,
    aclService: AclService,
	public datePipeService:DatePipeFormatService,
    private route: ActivatedRoute, private fd_services: FDServices, private toastrService: ToastrService, router: Router, private customDiallogService : CustomDiallogService) {
    super(aclService);
    this.route.snapshot.pathFromRoot.forEach(path => {
      if (path && path.params && path.params.caseId) {
        if (!this.caseId) {
          this.caseId = path.params.caseId;
        }
      }
    })
    this.getCase.emit()
    this.setReportForm()
    this.setVehicleDetailForm();
    this.setConfigration();
    this.setModalConfigration();

  }
  ngOnInit() {
    this.setConfigration();
    console.clear();
    this.setObject();
    this.colors = ['aqua', 'black', 'blue', 'fuchsia', 'gray', 'green', 'lime', 'maroon', 'navy', 'olive', 'orange', 'purple', 'red', 'silver', 'teal', 'white', 'yellow'];
    this.getCase.emit()
    // this.getInsurances().subscribe(data => {
    //   this.lstInsurance = data['result'].data
    // })
    this.getStates(name).subscribe(data => {
      this.states = data['result'].data
      this.states.length > 0 ? getFieldControlByName(this.fieldConfig, 'state').items = this.states : ''
    })
    this.getCities(name).subscribe(data => {
      this.cities = data['result'].data
      this.cities.length > 0 ? getFieldControlByName(this.fieldConfig, 'city').items = this.cities : ''
    })
    this.getCounties(name).subscribe(data => {
      this.counties = data['result'].data
      this.counties.length > 0 ? getFieldControlByName(this.fieldConfig, 'county').items = this.counties : ''
	});

  }
  case: CaseModel
  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes['caseData']) {
      if (!this.fd_services.isEmpty(changes['caseData'].currentValue)) {
        if (this.caseData) {
          let data: CaseModel = this.caseData;
          this.case = data
          this.case.is_finalize ? this.enableForm() : null
          if (this.caseData.object_involved) {
            this.reportData = this.caseData.object_involved
            this.setReoprtingValue();
            this.setValues();
          }
          if (this.caseData.vehicle_information) {
            this.vehicleInfos = this.caseData.vehicle_information && this.caseData.vehicle_information.data ? this.caseData.vehicle_information.data : []
            this.vehicleInfos = this.vehicleInfos.map(res => {
              delete res.id
              return res
            })
            this.vehicleData = this.caseData
            this.existingVehicles = [];
            if (this.vehicleInfos) {
              for (let vehicle of this.vehicleInfos) {
                let vehicle_no = vehicle.vehicle_no;
                if (vehicle_no) {
                  this.existingVehicles.push(vehicle_no);
                }
              }
            }
          }
          this.reportData && this.reportData.state ? this.getStates('', this.reportData.state['id']).subscribe(data => {
            let states = data['result']['data']
            let state_control = getFieldControlByName(this.fieldConfig, 'state')
            state_control ? state_control.items = states : state_control.items = null
            this.vehicleForm.patchValue({
              state: states[0]
            })
          }) : ''
          this.reportData && this.reportData.city ? this.getCities('', this.reportData.city['id']).subscribe(data => {
            let city = data['result']['data']
            let city_control = getFieldControlByName(this.fieldConfig, 'city')
            city_control ? city_control.items = city : city_control.items = null
            this.vehicleForm.patchValue({
              city: city[0]
            })
          }) : ''
          this.reportData && this.reportData.county ? this.getCounties('', this.reportData.county['id']).subscribe(data => {
            let county = data['result']['data']
            let county_control = getFieldControlByName(this.fieldConfig, 'county')
            county_control ? county_control.items = county : county_control.items = null
            this.vehicleForm.patchValue({
              county: county[0]
            })
          }) : ''
          this.vehicleForm.patchValue({ accidentId: this.accidentId }, { emitEvent: false })
          if (this.caseData != null) {
            this.setValues();
          }
        }
      }
    }
    this.vehicleDetailform.patchValue({ patientId: this.patientId }, { emitEvent: false })
  }
  ngAfterViewInit() {
    if (this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_vehicle_view)) {
      this.vehicleForm = this.component.form;
      this.wasAccidentReported();
      this.show_Was_Accident_Reoprt();
      this.createVehicalInfoList();
    }
    // this.disableForm()
    if (this.caseData && this.reportData) {
      this.setReoprtingValue();
      this.setValues();
	}
	
	if(!this.aclService.hasPermission(this.userPermissions.patient_case_list_insurance_vehicle_edit))
		{
			this.vehicleForm.disable();
			this.disableForm()
		
		}


    this.fetchInsurance()
  }
  fetchInsurance()
  {
    if(this.vehicleDetailData && this.vehicleDetailData.insurance&& this.vehicleDetailData.insurance.id)
    {
      this.getInsurances('', this.vehicleDetailData.insurance.id).subscribe(data => {
        let insurance = data['result']
        let insuranceField = getFieldControlByName(this.fieldConfig, 'insurance')
        let idField = getFieldControlByName(insuranceField.children, 'id')
        idField.items = [insurance]
        this.vehicleDetailform.patchValue({
          id: this.vehicleDetailData.insurance.id ? this.vehicleDetailData.insurance.id.id : null,
        })
      })
    }

  }
  setReoprtingValue() {
    this.vehicleForm.patchValue(this.caseData.object_involved)
    // if (!this.caseData.object_involved.state)
    //   this.states.length > 0 ? getFieldControlByName(this.fieldConfig, 'state').items = this.states : ''
  }
  /**
   * set values
   * @param vehicleDetail 
   */
  setVehicleDetailValues(vehicleDetail) {
    this.vehicleDetailData = vehicleDetail;
    if (this.vehicleDetailData != null) {
      this.vehicleDetailform.patchValue({
        also_owner_of_vehicle: this.vehicleDetailData.also_owner_of_vehicle,
        year: this.vehicleDetailData.year,
        make: this.vehicleDetailData.make,
        model: this.vehicleDetailData.model,
        color: this.vehicleDetailData.color,
        state: this.vehicleDetailData.state,
        license_plate_number: this.vehicleDetailData.license_plate_number,
        policy_no: this.vehicleDetailData.policy_no,
        vehicle_no: this.vehicleDetailData.vehicle_no ? this.vehicleDetailData.vehicle_no : null,
        // insurance_id: this.vehicleDetailData.insurance_id,
        insurance: this.vehicleDetailData.insurance,
        effective_date:
          this.vehicleDetailData &&
            this.vehicleDetailData.effective_date
            ? dateObjectPicker(dateFormatterMDY(this.vehicleDetailData.effective_date))
            : null,
        expiry_date: this.vehicleDetailData.expiry_date ? dateObjectPicker(dateFormatterMDY(this.vehicleDetailData.expiry_date)) : null,
        accidentId: this.accidentId,
        patientId: this.patientId,
      }, { emitEvent: false })
      if (!this.vehicleDetailData.insurance)
        this.lstInsurance.length > 0 ? getFieldControlByName(this.modalfieldConfig, 'insurance').items = this.lstInsurance : ''
      if (this.vehicleDetailData.contact_information && this.vehicleDetailData.contact_information.driver) {
        this.driverForm.patchValue(this.vehicleDetailData.contact_information.driver, { emitEvent: false })
      }
      if (this.vehicleDetailData.contact_information && this.vehicleDetailData.contact_information.driver && this.vehicleDetailData.contact_information.driver.mail_address) {
        this.driveAddressForm.patchValue(this.vehicleDetailData.contact_information.driver, { emitEvent: false })
      }
      if (this.vehicleDetailData.contact_information && this.vehicleDetailData.contact_information.owner) {
        this.ownerForm.patchValue(this.vehicleDetailData.contact_information.owner, { emitEvent: false })
      }
      if (this.vehicleDetailData.contact_information && this.vehicleDetailData.contact_information.owner && this.vehicleDetailData.contact_information.owner.mail_address) {
        this.ownerAddressForm.patchValue(this.vehicleDetailData.contact_information.owner.mail_address, { emitEvent: false })
      }
    }
  }
  setVehicleDetailForm() {
    this.vehicleDetailform = this.fb.group({});
  }
  /**
   * set value in form
   */
  setValues() {
    let no_of_vehicle_involved = this.vehicleForm.get('no_of_vehicle_involved').value
    no_of_vehicle_involved == 0 ? this.vehicleForm.patchValue({ no_of_vehicle_involved: '' }, { emitEvent: false }) : ''
    no_of_vehicle_involved == 0 ? '' : this.noofvehicleinvolved_array = no_of_vehicle_involved
    let count = this.vehicleForm.get('no_of_vehicle_involved').value
    if (count != null && count != "") {
      this.countVehicle(count);
    }
  }
  /**
   * set object for submit data in object
   */
  setObject() {
    this.objectForm = this.fb.group({
      object_involved: '',
      vehicle_information: ''
    })
  }
  noofvehicleinvolved_array: number = 0
  /**
   *detect change in no_of_vehicle_involved field to create dynamic array in patient were in field
   */
  createVehicalInfoList() {
    this.subscription.push(this.vehicleForm.controls['no_of_vehicle_involved'].valueChanges.subscribe(count => {
      if (count != null && count != "") {
        // this.noofvehicleinvolved_array <= count ? this.noofvehicleinvolved_array = count : ''
        this.countVehicle(count);
      }
    }))
  }
  /**
   * call for discart changes 
   */
  wasAccidentReported() {
    this.subscription.push(this.vehicleForm.controls['accident_reported'].valueChanges.subscribe(res => {
      let reporting_date = this.vehicleForm.get('reporting_date').value
      let precinct = this.vehicleForm.get('precinct').value
      let state = this.vehicleForm.get('state').value
      let city = this.vehicleForm.get('city').value
      let county = this.vehicleForm.get('county').value
      // if (res != undefined) {
      if (res == 0 && (reporting_date || precinct || county || state)) {
        this.confirmDiscart()
      }
      this.show_Was_Accident_Reoprt(res)

      // }
    }))
  }
  /**
   * hide or show fields
   */
  show_Was_Accident_Reoprt(res?) {
    let show
    if (res) show = res
    else show = this.vehicleForm.get('accident_reported').value
    show == 1 ? this.fieldConfig[0].children[0].children[1].classes = this.fieldConfig[0].children[0].children[1].classes.filter(className => className != 'hidden') : this.fieldConfig[0].children[0].children[1].classes.push('hidden')

  }

  /**
   * discart confirmation for Was the accident reported? field
   */
  confirmDiscart() {
    this.customDiallogService.confirm('Discard Confirmation?', 'Do you really want to discard it.','Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
        this.vehicleForm.patchValue({
          reporting_date: null,
          precinct: "",
          state: "",
          city: "",
          county: ""
        })
			}
		})
		.catch();
  }

  /**
   * clear patient record from form
   */
  clearOwnerNames() {
    this.ownerForm.patchValue({
      first_name: "",
      middle_name: "",
      last_name: ""
    }, { emitEvent: false })
  }
  /**
   * add patient record in form
   */
  populateOwnerNames() {
    if (this.caseData.patient) {
      this.ownerForm.patchValue({
        first_name: this.caseData.patient.first_name,
        middle_name: this.caseData.patient.middle_name,
        last_name: this.caseData.patient.last_name
      }, { emitEvent: false })
    }
  }
  /**
   * vehicle modal
   */
  vehicleInfoModal = (content, title?: any, vehicle?: any, rowIndex?): void => {
    let ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false, size: 'lg', windowClass: 'modal_extraDOc'
    };
    if (title) {
      this.vehicleTitle = title;
    }
    else {
      this.vehicleTitle = '';
    }
    if (vehicle) {
      this.index = rowIndex;
      this.vehicleDetail = vehicle;
      this.titleVal = "Edit"
    }
    else {
      this.vehicleDetail = []
      this.titleVal = "Add"
    }
    this.enableVehicleDetailForm()
    this.modalRef = this.modalService.open(content, ngbModalOptions);
    // }
  }
  /**
   * add dynamic array in patient were in field
   * @param valuee 
   */
  public countVehicle(valuee) {
    let value = parseInt(valuee)
    this.vehicle_list = [];
    this.vehicle_alllist = []
    let maxNo = 0;
    if (this.existingVehicles.length) {
      maxNo = Math.max(...this.existingVehicles);
    }
    let vehiclepatientwerein = getFieldControlByName(this.fieldConfig, 'vehicle_patient_were_in');
    value == 0 ? vehiclepatientwerein.classes.push('hidden') : vehiclepatientwerein.classes = vehiclepatientwerein.classes.filter(className => className != 'hidden')
    if (value < maxNo && this.vehicleInfos.length > 0) {
      // this.toastrService.error("You have already enterd Vehicle No. " + maxNo, 'Error')
      this.confirmDel(null, null, valuee);
    } else {
      this.noofvehicleinvolved_array != value ? this.noofvehicleinvolved_array = value : ''
      for (var i = 1; i <= value; i++) {
        if (!this.existingVehicles.includes(i)) {
          this.vehicle_list.push({ label: `vehicle ${i}`, name: `vehicle ${i}`, value: i, disabled: false });
        }
        this.vehicle_alllist.push({ label: `vehicle ${i}`, name: `vehicle ${i}`, value: i, disabled: false });
      }
    }
    getFieldControlByName(this.fieldConfig, 'vehicle_patient_were_in').options = this.vehicle_alllist
    getFieldControlByName(this.modalfieldConfig, 'vehicle_patient_were_in').options = this.vehicle_list
    if(!this.vehicleForm.get('vehicle_patient_were_in').value){
      this.vehicleForm.patchValue({'vehicle_patient_were_in': ''})
    };  
  }
  /**
   * submit modal value 
   * @param form 
   */
  onSubmitVehicleDetail(form) {
    this.vehicleDetailform.value.insurance && this.vehicleDetailform.value.insurance.insurance_name ? this.vehicleDetailform.value.insurance['name'] = this.vehicleDetailform.value.insurance.insurance_name : ''
    let vehicleData = { ...this.vehicleDetailform.value, insurance_company: this.vehicleDetailform.value.insurance }
    if (this.vehicleDetailform.valid) {
      this.vehicleDisableBtn = true
      // this.loadSpin = true
      if (this.titleVal == "Add") {
        this.addVehicleDetail(vehicleData)
      } else {
        this.updateVehicleDetail(vehicleData)
      }
    } else {
      this.fd_services.touchAllFields(this.vehicleDetailform);
    }
  }
  /**
   * add record in array
   * @param form 
   */
  addVehicleDetail(form) {
    let data = parseInt(this.vehicleTitle ? this.vehicleTitle : form['vehicle_patient_were_in'])
    form.effective_date = form.effective_date ? changeDateFormat(form.effective_date) : '';
    form.expiry_date = form.expiry_date ? changeDateFormat(form.expiry_date) : '';
    form["vehicle_no"] = this.vehicleTitle ? this.vehicleTitle : form['vehicle_patient_were_in'];
    this.vehicleInfos.push(form);
    this.existingVehicles.push(data);
    this.vehicleInfos = makeDeepCopyArray(this.vehicleInfos)
    this.creatingListr(data);
    this.closeModal();
    // this.loadSpin = false

  }/**
   * remove added record name from vehicle_patient_were_in field
   * @param value 
   */
  creatingListr(value) {
    let count = parseInt(this.vehicleForm.get('no_of_vehicle_involved').value)
    let data = parseInt(value)
    for (var i = 0; i <= count; i++) {
      if (this.vehicle_list[i] && this.vehicle_list[i].value === data) {
        this.vehicle_list.splice(i, 1);
      }
    }
  }
  /**
   * update record in table
   * @param form 
   */
  updateVehicleDetail(form) {
    form.effective_date = form.effective_date ? changeDateFormat(form.effective_date) : '';
    form.expiry_date = form.expiry_date ? changeDateFormat(form.expiry_date) : '';
    form["vehicle_no"] = this.vehicleTitle ? this.vehicleTitle : form['vehicle_patient_were_in'];
    this.vehicleInfos[this.index] = form;
    this.vehicleInfos = [...this.vehicleInfos]
    this.modalRef.close();
    this.index = null;
    // this.loadSpin = false
  }
  /**
   * set form
   */
  setReportForm() {
    this.vehicleForm = this.fb.group({
      id: null,
      vehicle_patient_were_in: [''],
      vehicleBelong: '',
      no_of_vehicle_involved: ['', [Validators.maxLength(2)]],
      vehicle_was: [''],
      was_this_car: '',
      accidentId: this.accidentId,
    });

    this.vehicleForm.disable()
  }
  /**
   * submit form
   * @param form 
   */
  submit(form) {
    if (this.vehicleForm.valid) {

      let data = this.vehicleInfos.length > 0 ? { is_deleted: false, data: this.vehicleInfos } : { is_deleted: true, data: this.vehicleInfos }
      this.objectForm.patchValue({
        object_involved: form,
        vehicle_information: data
      }, { emitEvent: false })
      this.disableBtn = true
      this.logger.log('form is valid')
      if (form.id == null) {
        this.add(this.objectForm.value)
      } else {
        this.update(this.objectForm.value)
      }
    } else {
      this.logger.log('form is invalid');
      this.fd_services.touchAllFields(this.vehicleForm);
    }
  }
  /**
   * add form
   * @param form 
   */
  add(form) {
    this.caseFlowService.updateCase(this.caseId, this.objectForm.value).subscribe(res => {
      getFieldControlByName(this.fieldConfig, 'button-div').configs.disabled = true
      this.selection.clear();
      this.vehicleForm.markAsUntouched();
      this.vehicleForm.markAsPristine();
      this.getVehicleData(callback => {
        this.goForward();
      })
      this.toastrService.success('Successfully Added ', 'Success')
      this.disableForm();

    }, err => {
      getFieldControlByName(this.fieldConfig, 'button-div').configs.disabled = false
      this.disableBtn = false
      this.vehicleForm.markAsUntouched();
      this.vehicleForm.markAsPristine();
      this.toastrService.error(err.error, 'Error')
    })
  }
  /**
   * update form
   * @param form 
   */
  update(form) {
    this.caseFlowService.updateCase(this.caseId, this.objectForm.value).subscribe(res => {
    //   getFieldControlByName(this.fieldConfig, 'button-div').configs.disabled = true  //commented it ,bcz it disable save and continue button when its on last allowed route
      this.vehicleForm.markAsUntouched();
      this.vehicleForm.markAsPristine();
      this.getVehicleData(callback => {
        this.goForward();
      })
      this.toastrService.success('Successfully Updated  ', 'Success')
    //   this.disableForm();

    }, err => {
      getFieldControlByName(this.fieldConfig, 'button-div').configs.disabled = false
      this.disableBtn = false
      this.vehicleForm.markAsUntouched();
      this.vehicleForm.markAsPristine();
      this.toastrService.error(err.error, 'Error')
    })
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
  getVehicleData(callback?) {
		this.subscription.push(
			this.caseFlowService.getCase(this.caseId).subscribe((res) => {
				callback ? callback() : null
			}),
		);
	}
  enableForm(enableflag?) {
    let buttonDiv = getFieldControlByName(this.fieldConfig, 'button-div')
    if (this.vehicleForm.disabled) {
      this.vehicleForm.enable();
      buttonDiv.classes = buttonDiv.classes.filter(className => className != 'hidden')
    } else {
      this.vehicleForm.disable();
      buttonDiv.classes.push('hidden')
    }
    // if (enableflag == false) {
    //   this.disableForm(); return;
    // }
    // else {
    //   this.vehicleForm.enable(
    //     {
    //       onlySelf: true,
    //       emitEvent: false
    //     }
    //   );

    //   this.formEnabled = true;
    //   this.hideButtons();
    //   this.enableflag = false;
    // }
  }
  disableForm() {
    this.vehicleForm.disable({
      onlySelf: true,
      emitEvent: false
    });
    this.formEnabled = false;
    this.enableflag = true;
    this.hideButtons();
  }
  /**
   * hide save and cancle buttoon
   */
  hideButtons() {
    this.vehicleForm.disabled ? this.fieldConfig[1].classes.push('hidden') : this.fieldConfig[1].classes = this.fieldConfig[1].classes.filter(className => className != 'hidden')
  }
  enableVehicleDetailForm() {
    this.vehicleDetailform.enable();
    this.vehicleFormEnabled = true;
  }
  disableVehicleDetailForm() {
    this.vehicleDetailform.disable();
    this.modalRef.close()
    // this.vehicleDetailData = []
    this.vehicleFormEnabled = false;
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.vehicleInfos.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle(event) {
    this.isAllSelected() ?
      this.selection.clear() :
      this.vehicleInfos.forEach(row => this.selection.select(row));
  }
  /**
   * delete confirmation
   * @param index 
   * @param vehical_no 
   * @param vheclinvolve 
   */
  confirmDel(index?: number, vehical_no?: number, vheclinvolve?: any) {
    const selected = this.selection.selected;
    let arr: Array<any> = [];
    arr = selected
    arr = arr.map(res => {
      return res.vehicle_no
    })

    this.customDiallogService.confirm('Delete Confirmation?', 'Do you really want to delete the Record.','Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
        if (index != undefined) {
          this.deleteSelected(index, vehical_no)
        }
        else {
          if (this.selection.selected.length > 0 && !this.isAllSelected()) {
            this.vehicleInfos = this.vehicleInfos.filter(function (item) {
              return arr.indexOf(item.vehicle_no) == -1;
            });
            this.existingVehicles = this.existingVehicles.filter((word) => !arr.includes(word))
          }
          else {
            this.vehicleInfos = [];
            this.existingVehicles = []
            this.vehicleForm.get('vehicle_patient_were_in').setValue('');
          }
          vheclinvolve ? '' : vheclinvolve = this.vehicleForm.get('no_of_vehicle_involved').value
          this.countVehicle(vheclinvolve);
        }
        this.selection.clear();
			}else{
        index == undefined ? this.vehicleForm.get('no_of_vehicle_involved').setValue(this.noofvehicleinvolved_array) : ''
			}
		})
		.catch();

  }
  /**
   * delete record from table
   * @param index 
   * @param vehical_no 
   */
  deleteSelected(index?: number, vehical_no?: number) {
    if (index != null) {
      this.vehicleInfos.splice(index, 1);
      this.vehicleInfos = [... this.vehicleInfos];
      this.existingVehicles.splice(vehical_no, 1)
      this.vehicle_list.push({ label: `vehicle ${vehical_no}`, name: `vehicle ${vehical_no}`, value: vehical_no, disabled: false });
      this.vehicle_list = makeDeepCopyArray(this.vehicle_list)
      getFieldControlByName(this.modalfieldConfig, 'vehicle_patient_were_in').options = this.vehicle_list
    }
    else
      this.vehicleInfos = [];
    this.vehicleForm.get('vehicle_patient_were_in').setValue('');
  }
  /**
   * close modal
   */
  closeModal() {
    this.vehicleDetailform.reset();
    this.modalRef.close();
  }
  /**
   * handle adddress
   * @param address 
   * @param type 
   */
  public handleVehicleAddressChange(address: Address, type: string) {

    let street_number = this.fd_services.getComponentByType(address, "street_number");
    let route = this.fd_services.getComponentByType(address, "route");
    let city = this.fd_services.getComponentByType(address, "locality");
    let state = this.fd_services.getComponentByType(address, "administrative_area_level_1");
    let postal_code = this.fd_services.getComponentByType(address, "postal_code");
    let lat = address.geometry.location.lat();
    let lng = address.geometry.location.lng();

    if (street_number != null) {
      let address: any;
      address = street_number.long_name + ' ' + route.long_name
      if (type == "driver") {
        this.driveAddressForm.patchValue({
          street: address,
          city: city.long_name,
          state: state.long_name,
          zip: postal_code.long_name,
        }, { emitEvent: false })
      }
      if (type == "owner") {
        this.ownerAddressForm.patchValue({
          street: address,
          city: city.long_name,
          state: state.long_name,
          zip: postal_code.long_name,

        }, { emitEvent: false })
      }

    }
    else {
      this.ownerAddressForm.reset();
      this.driveAddressForm.reset();
    }
  }
  stringfy(obj) {
    return JSON.stringify(obj);
  }
  canDeactivate() {
    return (this.vehicleForm.dirty || this.vehicleForm.touched);
  }
  /**
   * get states
   *  
   */
  getStates(name?, id?) {
    let paramQuery: ParamQuery = { order: OrderEnum.ASC, pagination: true, filter: false, per_page: 10, page: 1 }
    let filter = {}
    if (id) {
      paramQuery.filter = true;
      filter['id'] = id
    }
    if (name) {
      paramQuery.filter = true;
      filter['name'] = name
    }
    return this.requestService.sendRequest(VehicleUrlsEnum.State_GET, 'GET', REQUEST_SERVERS.fd_api_url, { ...paramQuery, ...filter })
  }
  /**
   * get cities
   *  
   */
  getCities(name?, id?) {
    let paramQuery: ParamQuery = { order: OrderEnum.ASC, pagination: true, filter: false, per_page: 10, page: 1 }
    let filter = {}
    if (id) {
      paramQuery.filter = true;
      filter['id'] = id
    }
    if (name) {
      paramQuery.filter = true;
      filter['name'] = name
    }
    return this.requestService.sendRequest(VehicleUrlsEnum.Cities_GET, 'GET', REQUEST_SERVERS.fd_api_url, { ...paramQuery, ...filter })
  }
  /**
   * get countries
   */

  getCounties(name?, id?) {
    let paramQuery: ParamQuery = { order: OrderEnum.ASC, pagination: true, filter: false, per_page: 10, page: 1 }
    let filter = {}
    if (id) {
      paramQuery.filter = true;
      filter['id'] = id
    }
    if (name) {
      paramQuery.filter = true;
      filter['name'] = name
    }
    return this.requestService.sendRequest(VehicleUrlsEnum.Counties_GET, 'GET', REQUEST_SERVERS.fd_api_url, { ...paramQuery, ...filter })
  }
  lstInsurance: BillingInsuranceModel[] = [];
  /**
   * serach  for insurance
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

  bindInsuranceChange() {
	// let form = this.vehicleDetailform.controls['insurance_company'] as FormGroup
	this.subscription.push(this.vehicleDetailform.controls['insurance'].valueChanges.subscribe(value => {
		if (!value) {	
			this.getInsurances().subscribe(data => {
				this.lstInsurance = data['result'].data;
				let insurance_control = getFieldControlByName(this.modalfieldConfig, 'insurance');
							
				insurance_control.items = this.lstInsurance
				return;
			  })
		}
	}))
}


  

 onFocusSearchVehicleInsurance(name) {
    return new Observable((res) => {
		if(!this.lstInsurance.length)
		{
			this.getInsurances(name).subscribe(data => {
				this.lstInsurance = data['result'].data
				res.next(this.lstInsurance)
			  })
		}
		else
		{
			res.next(this.lstInsurance);
		}
    })
  }
  /**
   * intelience for insurance
   * @param name 
   * @param id 
   */
  getInsurances(name?, id?) {
	let order_by;
	let order;
	if(name)
	{
		order_by=null;
		order=OrderEnum.ASC	
	}
	else
	{
		order_by='count';
		order=OrderEnum.DEC	
	}
	let paramQuery: ParamQuery = { order: order, pagination: true, filter: false, per_page: 10, page: 1, order_by:order_by }
	paramQuery = removeEmptyKeysFromObject(paramQuery);
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
	 * serach  for state name
	 * @param name 
	 */
  searchState(name) {
    return new Observable((res) => {
      this.getStates(name).subscribe(data => {
        this.states = data['result'].data
        res.next(this.states)
      })
    })
  }
	/**
	 * serach  for city name
	 * @param name 
	 */
  searchCities(name) {
    return new Observable((res) => {
      this.getCities(name).subscribe(data => {
        this.cities = data['result'].data
        res.next(this.cities)
      })
    })
  }

	/**
	 * serach  for county name
	 * @param name 
	 */
  searchCounty(name) {
    return new Observable((res) => {
      this.getCounties(name).subscribe(data => {
        this.counties = data['result'].data
        res.next(this.counties)
      })
    })
  }
  data: any[] = null;
  fieldConfig: FieldConfig[] = [];
  /**
   * form configrantion
   * @param data 
   */
  setConfigration(data?) {
    this.fieldConfig = [
      new DivClass([
        new DivClass([
          new RadioButtonClass('Was the accident reported? *', 'accident_reported', [{ name: 'true', label: "Yes", value: 1 }, { name: "false", value: 0, label: "No" }], null, [{ name: 'required', message: 'This field is required', validator: Validators.required }], ['col-md-12', 'col-lg-8']),
          new DivClass([
            new DivClass([
              new InputClass('Reporting Date * (mm/dd/yyyy) ', 'reporting_date', InputTypes.date, null, [{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-md-6', 'col-lg-4']),
              new InputClass('Precinct', 'precinct', InputTypes.text, '', [], '', ['col-md-6', 'col-lg-4']),
              new AutoCompleteClass('State *', 'state', 'name', '', this.searchState.bind(this), false, '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-md-6', 'col-lg-4']),
              new AutoCompleteClass('City *', 'city', 'name', '', this.searchCities.bind(this), false, '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-md-6', 'col-lg-4']),
              new AutoCompleteClass('County', 'county', 'name', '', this.searchCounty.bind(this), false, '', [], '', ['col-md-6', 'col-lg-4']),
            ], ['row']),
          ], ['col-12']),
        ], ['display-contents']),
        new RadioButtonClass('The vehicle was? ', 'vehicle_was', [{ name: 'bus', label: "A Bus", value: "bus" }, { name: 'truck', value: 'truck', label: 'A Truck' }, { name: 'motor_cycle', value: 'motor_cycle', label: 'A Motorcycle' }, { name: 'auto_mobile', value: 'auto_mobile', label: 'An Automobile' }], null, [], ['col-xl-8', 'radio-space-evenly']),
        new RadioButtonClass('Was this car? *', 'was_this_car', [
          { name: 'uninsured', label: "Uninsured Car", value: "uninsured" },
          { name: 'stolen', value: 'stolen', label: 'Stolen Car' },
          { label: 'Denial of Coverage', name: 'denial_of_coverage', value: 'denial_of_coverage' },
          { label: 'Unidenitfied Car', name: 'unidentified', value: 'unidentified' },
          { label: 'Disclaimer Of Coverage', name: 'disclaimer_of_coverage', value: 'disclaimer_of_coverage' },
          { label: 'None', name: 'none', value: 'none' }
        ], null, [{ name: 'required', message: 'This field is required', validator: Validators.required }], ['col-md-12', 'radio-space-evenly']),
        new InputClass('How many vehicles were involved in the accident?', 'no_of_vehicle_involved', InputTypes.text, null, [], '', ['col-xl-6'],{skip_validation:true,minLength:1,maxLength:3,isNumberOnly:true},'no_of'),
        new RadioButtonClass('Were you the driver and the owner of the vehicle?', 'also_owner_of_vehicle', [{ name: 'true', label: "Yes", value: 1 }, { name: "false", value: 0, label: "No" }], data && data['also_owner_of_vehicle'] ? data['also_owner_of_vehicle'] : null, [], ['col-xl-6']),
        new SelectClass('Please provide the information of vehicle you were in?', 'vehicle_patient_were_in', [{ name: '', label: '', value: '' }], '', [], ['col-lg-6']),
        new DynamicControl('id', null),

      ], ['row']),
      new DivClass([
        new ButtonClass('Back', ['btn', 'btn-primary', 'btn-block mt-0 mb-3 mb-sm-0'], ButtonTypes.button, this.goBack.bind(this), { icon: 'icon-left-arrow me-2', button_classes: [''] }),
        new ButtonClass('Save & Continue', ['btn', 'btn-success', 'btn-block mt-0'], ButtonTypes.submit, null, { icon: 'icon-save-continue me-2', button_classes: [''], name: 'button-div' })
      ], ['row', 'form-btn', 'justify-content-center'])
    ]
  }
  /**
   * modal configration
   */
  modalfieldConfig: FieldConfig[] = [];
  setModalConfigration(data?) {
    this.modalfieldConfig = [
      new DivClass([
        new DynamicControl('vehicle_no', null),
        new SelectClass('Vehicle No', 'vehicle_patient_were_in', [{ name: '', label: '', value: '' }], '', [{ name: 'required', message: 'This Field is required', validator: Validators.required }], ['col-12']),
        new InputClass('Year', 'year', InputTypes.text, data && data['year'] ? data['year'] : '', [], '', ['col-sm-6', 'col-lg-4'], { mask: '0000' }),
        new InputClass('Make', 'make', InputTypes.text, data && data['make'] ? data['make'] : '', [], '', ['col-sm-6', 'col-lg-4']),
        new InputClass('Model', 'model', InputTypes.text, data && data['model'] ? data['model'] : '', [], '', ['col-sm-6', 'col-lg-4']),
        new InputClass('Color', 'color', InputTypes.text, data && data['color'] ? data['color'] : '', [], '', ['col-sm-6', 'col-lg-4']),
        new InputClass('License Plate No', 'license_plate_number', InputTypes.text, data && data['license_plate_number'] ? data['license_plate_number'] : '', [], '', ['col-sm-6', 'col-lg-4']),
        // new SelectClass('State ', 'state', this.states.map(res => {
        //   return { name: res, label: res, value: res }
        // }), '', [], ['col-md-6', 'col-sm-3']),
        // new AutoCompleteClass('State *', 'state', 'name', 'id', this.searchState.bind(this), false, '', [], '', ['col-4']),
        new SelectClass('State', 'state', this.allStates.map(res => {
          return { name: res.name, label: res.name, value: res.name,fullName:res.fullName  }
        }), '', [], ['col-sm-6', 'col-lg-4'],false,false,'selectState'),
        new AutoCompleteClass('Insurance Name', 'insurance', 'insurance_name', '', this.SearchInsurance.bind(this), false, '', [], '', ['col-sm-6', 'col-lg-4'],[],null,this.onFocusSearchVehicleInsurance.bind(this)),
        new InputClass('Policy Number', 'policy_no', InputTypes.text, data && data['policy_no'] ? data['policy_no'] : '', [], '', ['col-sm-6', 'col-lg-4']),
        new InputClass('Effective Date', 'effective_date', InputTypes.date, data && data['effective_date'] ? data['effective_date'] : '', [], '', ['col-sm-6', 'col-lg-4', 'parent-horizontal-label'], { max: new Date() }),
        new InputClass('Expiration Date', 'expiry_date', InputTypes.date, data && data['expiry_date'] ? data['expiry_date'] : '', [], '', ['col-sm-6', 'col-lg-4', 'parent-horizontal-label'], { min: null }),
        new DivClass([
          new DivClass([
            new InputClass('Driver First Name', 'first_name', InputTypes.text, data && data['first_name'] ? data['first_name'] : '', [], '', ['col-sm-6', 'col-lg-4'], { title_case: true }),
            new InputClass('Driver Middle Name', 'middle_name', InputTypes.text, data && data['middle_name'] ? data['middle_name'] : '', [], '', ['col-sm-6', 'col-lg-4'], { title_case: true }),
            new InputClass('Driver Last Name', 'last_name', InputTypes.text, data && data['last_name'] ? data['last_name'] : '', [], '', ['col-sm-6', 'col-lg-4'], { title_case: true }),
            new DivClass([
              new DivClass([
                new AddressClass('DriverAddress', 'street', this.handleAddress.bind(this), '', [], '', ['col-sm-6', 'col-lg-4']),
                new InputClass('Suite / Floor', 'apartment', InputTypes.text, '', [], '', ['col-sm-6', 'col-lg-4']),

                new InputClass('Driver City', 'city', InputTypes.text, data && data['city'] ? data['city'] : '', [], '', ['col-sm-6', 'col-lg-4']),
                new SelectClass('State', 'state', this.allStates.map(res => {
                  return { name: res.name, label: res.name, value: res.name,fullName:res.fullName  }
                }), '', [], ['col-sm-6', 'col-lg-4'],false,false,'selectState'),
				// new InputClass('Driver Zip', 'zip', InputTypes.text, data && data['zip'] ? data['zip'] : '', [], '', ['col-sm-6', 'col-lg-4'], { mask: '00000' }),
				new InputClass('Driver Zip', 'zip', InputTypes.text, data && data['zip'] ? data['zip'] : '', [{name:'pattern', message:ZipFormatMessages.format_usa,validator:Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$')}], '', ['col-sm-6', 'col-lg-4']),

              ], ['row'], "", "", { formControlName: "mail_address" }),
            ], ['col-12']),
          ], ['row'], "", "", { formControlName: "driver" }),
          new DivClass([
            new InputClass('Owner First Name', 'first_name', InputTypes.text, data && data['first_name'] ? data['first_name'] : '', [], '', ['col-sm-6', 'col-lg-4'], { title_case: true }),
            new InputClass('Owner Middle Name', 'middle_name', InputTypes.text, data && data['middle_name'] ? data['middle_name'] : '', [], '', ['col-sm-6', 'col-lg-4'], { title_case: true }),
            new InputClass('Owner Last Name', 'last_name', InputTypes.text, data && data['last_name'] ? data['last_name'] : '', [], '', ['col-sm-6', 'col-lg-4'], { title_case: true }),
            new DivClass([
              new DivClass([
                new AddressClass('OwnerAddress', 'street', this.handleAddressowner.bind(this), '', [], '', ['col-sm-6', 'col-lg-4']),
                new InputClass('Suite / Floor', 'apartment', InputTypes.text, '', [], '', ['col-sm-6', 'col-lg-4']),
                new InputClass('Owner City', 'city', InputTypes.text, data && data['city'] ? data['city'] : '', [], '', ['col-sm-6', 'col-lg-4']),
                new SelectClass('State', 'state', this.allStates.map(res => {
                  return { name: res.name, label: res.name, value: res.name,fullName:res.fullName  }
                }), '', [], ['col-sm-6', 'col-lg-4'],false,false,'selectState'),
				// new InputClass('Owner Zip', 'zip', InputTypes.text, data && data['zip'] ? data['zip'] : '', [], '', ['col-sm-6', 'col-lg-4'], { mask: '00000' }),
				new InputClass('Owner Zip', 'zip', InputTypes.text, data && data['zip'] ? data['zip'] : '', [{name:'pattern', message:ZipFormatMessages.format_usa,validator:Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$')}], '', ['col-sm-6', 'col-lg-4']),

              ], ['row'], "", "", { formControlName: "mail_address" }),
            ], ['col-12']),
          ], ['row'], "", "", { formControlName: "owner" }),
        ], ['col-12'], "", "", { formControlName: "contact_information" }),
      ], ['row']),
      new DivClass([
        new ButtonClass('Cancel', ['btn', 'btn-primary', 'btn-block', 'mt-0 me-3'], ButtonTypes.button, this.disableVehicleDetailForm.bind(this), { button_classes: [''] }),
        new ButtonClass('Save', ['btn', 'btn-success', 'btn-block', 'mt-0 ms-3'], ButtonTypes.submit, this.onSubmitVehicleDetail.bind(this), {
          button_classes: ['']

        }
        )
      ], ['row', 'modal-btn-width', 'justify-content-center'])
    ]
  }
  effectiveDateChange() {
    this.vehicleDetailform.controls['effective_date'].valueChanges.subscribe(res => {
	let expiry_date_control = getFieldControlByName(this.modalfieldConfig, 'expiry_date')
	expiry_date_control.configs.min = res
	if( this.vehicleDetailform) {
	if(WithoutTime(new Date(res)) > WithoutTime(new Date)) {
	this.vehicleDetailform.controls['effective_date'].setErrors({max_date:true});
	} else {
	this.vehicleDetailform.controls['effective_date'].setErrors(null);
	}}
		
    })
  }


  /**
   * for modal changes configrations
   * @param event 
   */
  onReady(event) {
	this.vehicleDetailform = event;
	this.bindInsuranceChange();
    this.contact_informationForm = this.vehicleDetailform.get('contact_information') as FormGroup
    this.driverForm = this.contact_informationForm.get('driver') as FormGroup
    this.driveAddressForm = this.driverForm.get('mail_address') as FormGroup
    this.ownerForm = this.contact_informationForm.get('owner') as FormGroup
    this.ownerAddressForm = this.ownerForm.get('mail_address') as FormGroup
    this.vehicleDetailform.addControl('id', this.fb.control(null))
    // let res = this.vehicleForm.get('also_owner_of_vehicle').value
    getFieldControlByName(this.modalfieldConfig, 'vehicle_patient_were_in').options = this.vehicle_list
    // if (this.vehicleInfos.length > 0) {
    //   let data = getFieldControlByName(this.modalfieldConfig, 'vehicle_patient_were_in')
    //   console.log('dataaaaa', data)
    // }
    if (this.vehicleDetail) {
      this.setVehicleDetailValues(this.vehicleDetail)
    }
    this.hideVehicalDropdown()
    this.effectiveDateChange();
  }
  handleAddress(address) {
    this.handleVehicleAddressChange(address, 'driver')
  }
  handleAddressowner(address) {
    this.handleVehicleAddressChange(address, 'owner')
  }
  hideVehicalDropdown() {
    // this.vehicleForm.disabled ? this.fieldConfig[1].classes.push('hidden') : this.fieldConfig[1].classes = this.fieldConfig[1].classes.filter(className => className != 'hidden')
    this.titleVal == "Edit" ? getFieldControlByName(this.modalfieldConfig, 'vehicle_patient_were_in').classes.push('hidden') : getFieldControlByName(this.modalfieldConfig, 'vehicle_patient_were_in').classes = getFieldControlByName(this.modalfieldConfig, 'vehicle_patient_were_in').classes.filter(className => className != 'hidden')
  }
}
