import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnChanges, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Logger } from '@nsalaun/ng-logger';
import { FDServices } from '../../services/fd-services.service';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { dateFormatterMDY, dateObjectPicker, changeDateFormat, unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { CanDeactivateComponentInterface } from '@appDir/shared/canDeactivateFormsComponent/CanDeactivateComponent.interface';
import { DivClass } from '@appDir/shared/dynamic-form/models/DivClass.class';
import { RadioButtonClass } from '@appDir/shared/dynamic-form/models/RadioButtonClass.class';
import { InputClass } from '@appDir/shared/dynamic-form/models/InputClass.class';
import { SelectClass } from '@appDir/shared/dynamic-form/models/SelectClass.class';
import { ButtonClass } from '@appDir/shared/dynamic-form/models/ButtonClass.class';
import { InputTypes } from '@appDir/shared/dynamic-form/constants/InputTypes.enum';
import { ButtonTypes } from '@appDir/shared/dynamic-form/constants/ButtonTypes.enum';
import { FieldConfig } from '@appDir/shared/dynamic-form/models/fieldConfig.model';
import { DynamicFormComponent } from '@appDir/shared/dynamic-form/components/dynamic-form/dynamic-form.component';

@Component({
  selector: 'app-report-form',
  templateUrl: './report-form.component.html',
})
export class ReportFormComponent implements OnChanges, CanDeactivateComponentInterface {

  public reportForm: FormGroup
  @Input() title = 'Edit'
  public insuranceType: string = 'major medical'
  @Input() caseId: any;
  @Input() patientId: any;
  @Input() accidentId: any;
  @Input() caseData: any
  @Output() getCase = new EventEmitter();
  public states: any[] = [];
  public cities: any[] = [];
  public counties: any[] = [];
  private reportData: any;
  disableBtn = false
  formEnabled: boolean = false;
  enableflag: boolean = true;

  subscription: any[] = []
  ngOnDestroy() {
    unSubAllPrevious(this.subscription)
  }
  @ViewChild(DynamicFormComponent) component: DynamicFormComponent;
  data: any[] = null;
  fieldConfig: FieldConfig[] = [];
  constructor(private fb: FormBuilder, private logger: Logger, private fd_services: FDServices, private router: Router, private toastrService: ToastrService) {
    // this.setReportForm()
    this.setConfigration();

  }

  ngOnInit() {
    this.getStates()
    this.getCounties()
    // this.setConfigration();
  }
  applyDnonClass() {
    this.fieldConfig[0].children[1].classes.push('d-none');
    this.fieldConfig[0].children[2].classes.push('d-none');
    this.fieldConfig[0].children[3].classes.push('d-none');
    this.fieldConfig[0].children[4].classes.push('d-none');
    this.fieldConfig[0].children[5].classes.push('d-none');
    this.removeClass(this.fieldConfig[0].children[1].classes, 'd-block');
    this.removeClass(this.fieldConfig[0].children[2].classes, 'd-block');
    this.removeClass(this.fieldConfig[0].children[3].classes, 'd-block');
    this.removeClass(this.fieldConfig[0].children[4].classes, 'd-block');
    this.removeClass(this.fieldConfig[0].children[5].classes, 'd-block');
  }
  applyDblockClass() {
    this.removeClass(this.fieldConfig[0].children[1].classes, 'd-none');
    this.removeClass(this.fieldConfig[0].children[2].classes, 'd-none');
    this.removeClass(this.fieldConfig[0].children[3].classes, 'd-none');
    this.removeClass(this.fieldConfig[0].children[4].classes, 'd-none');
    this.removeClass(this.fieldConfig[0].children[5].classes, 'd-none');
    this.fieldConfig[0].children[1].classes.push('d-block');
    this.fieldConfig[0].children[2].classes.push('d-block');
    this.fieldConfig[0].children[3].classes.push('d-block');
    this.fieldConfig[0].children[4].classes.push('d-block');
    this.fieldConfig[0].children[5].classes.push('d-block');
  }
  showValues() {
    let reportedToPolicevalue = this.reportForm.get('reportedToPolice').value;
    if (reportedToPolicevalue == false || reportedToPolicevalue == "false" || reportedToPolicevalue == "") {
      this.applyDnonClass();
    }
    else {
      this.applyDblockClass();
    }
  }
  removeClass(array, val) {
    var index = array.findIndex(v => v === val);
    if (index != -1) {
      array.splice(index, 1)
    }
  }

  ngAfterViewInit() {
    this.reportForm = this.component.form;
    this.reportForm.addControl('accidentId', this.fb.control(''));
    this.reportForm.addControl('patientId', this.fb.control(''));
    this.subscription.push(this.reportForm.get('reportedToPolice').valueChanges.subscribe(res => {
      this.showValues()
    }));
    this.subscription.push(this.reportForm.get('reportingState').valueChanges.subscribe(val => {
      if (val) {
        this.getCities(val);
      }
    }))
    this.disableForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    // ;
    if (changes && changes['caseData']) {
      if (!this.fd_services.isEmpty(changes['caseData'].currentValue)) {
        // ;
        if (this.caseData && this.caseData.patient) {
          this.patientId = this.caseData.patient.id
        }

        if (this.caseData && this.caseData.accident) {
          this.patientId = this.caseData.patient.id
          this.accidentId = this.caseData.accident.id
          this.reportData = this.caseData.accident.accidentReports
          this.reportForm.patchValue({ accidentId: this.accidentId })
          if (this.reportData && this.reportData.reportingState) {
            // let reqData = {"state": this.reportData.reportingState}
            this.fd_services.getCities(this.reportData.reportingState).subscribe(
              res => {
                if (res.statusCode == 200) {
                  this.cities = res.data;
                  // this.cities = [...this.cities];
                  this.reportForm.patchValue({ 'reportingState': this.reportData.reportingState, 'reportingCity': this.reportData.reportingCity });
                }

              },
              err => {

              }
            );
            this.setValues();
          }
        }

      }
    }
  }

  getStates() {
    this.fd_services.getStates().subscribe(res => {
      if (res.statusCode == 200) {
        this.states = res.data
      }
    })
  }

  getCities(stateId) {
    this.fd_services.getCities(stateId).subscribe(res => {
      if (res.statusCode == 200) {
        this.cities = res.data
      }
    })
  }


  getCounties() {
    this.fd_services.getCounties().subscribe(res => {
      if (res.statusCode == 200) {
        this.counties = res.data
      }
    })
  }


  setValues() {
    this.reportForm.patchValue({
      id: this.reportData.id,
      reportedToPolice: this.reportData.reportedToPolice,
      reportingDate: this.reportData.reportingDate != null ? this.reportData.reportingDate.split('T')[0] : null,
      reportingPrecinct: this.reportData.reportingPrecinct,
      reportingCity: this.reportData.reportingCity,
      reportingState: this.reportData.reportingState,
      reportingCounty: this.reportData.reportingCounty,
      caseId: this.caseId,
      accidentId: this.accidentId,
      patientId: this.patientId,
    })

  }

  setReportForm() {
    this.reportForm = this.fb.group({
      id: null,
      reportedToPolice: ['', [Validators.required]],
      reportingDate: null,
      reportingPrecinct: [''],
      reportingCity: '',
      reportingState: [''],
      reportingCounty: [''],
      caseId: this.caseId,
      accidentId: this.accidentId,
      patientId: this.patientId,
    });

    this.disableForm()
  }


  onSubmitReport(form) {
    this.logger.log(form);
    if (this.reportForm.valid) {
      form.reportingDate = changeDateFormat(form.reportingDate);
      this.disableBtn = true
      this.logger.log('form is valid')
      if (form.id == null) {
        this.add(form)
      } else {
        this.update(form)
      }
    } else {
      this.logger.log('form is invalid');
      this.fd_services.touchAllFields(this.reportForm);
    }
  }

  add(form) {
    this.fd_services.addAccidentReports(form).subscribe(res => {
      if (res.statusCode == 200) {
        this.disableForm()
        this.reportForm.markAsUntouched();
        this.reportForm.markAsPristine();
        this.disableBtn = false
        this.getCase.emit()
        this.toastrService.success('Report Details Added Successfully', 'Success')
      } else {
        this.toastrService.show(res.error.message, 'Error')
      }
    }, err => {
      this.disableBtn = false
      this.logger.log('error', err.error.error.message)
      this.toastrService.error(err.error.error.message, 'Error')
    })
  }

  update(form) {
    this.fd_services.updateAccidentReports(form).subscribe(res => {
      if (res.statusCode == 200) {
        this.disableBtn = false
        this.reportForm.markAsUntouched();
        this.reportForm.markAsPristine();
        this.disableForm()
        this.getCase.emit()
        this.toastrService.success('Report Details Updated Successfully', 'Success')
      } else {
        this.toastrService.show(res.error.message, 'Error')
      }
    }, err => {
      this.disableBtn = false
      this.toastrService.error(err.error.error.message, 'Error')
    })
  }

  public handleAddressChange(address: Address) {

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

      this.reportForm.patchValue({
        'companyAddress': address,
        'city': city.long_name,
        'state': state.long_name,
        'zip': postal_code.long_name,
        'lat': lat,
        'lng': lng,
      })
    } else {
      this.reportForm.patchValue({
        'companyAddress': "",
        'city': "",
        'state': "",
        'zip': "",
        'lat': "",
        'lng': "",
      })
    }
  }


  toggleValidations(value, fields) {
    // ;
    this.logger.log(fields);
    for (var i = 0; i < fields.length; i++) {
      if (value) {
        this.reportForm.controls[fields[i]].setValidators([Validators.required]);
      } else {
        this.reportForm.controls[fields[i]].clearValidators();
        this.reportForm.controls[fields[i]].updateValueAndValidity({ onlySelf: true, emitEvent: false });
        this.reportForm.updateValueAndValidity()
      }
    }
  }

  goBack() {
    this.router.navigate(['/front-desk/vehicles'])
  }

  enableForm(enableflag) {
    if (enableflag == false) { this.disableForm(); return; }
    else {
      // if (this.accidentId) {
      this.reportForm.enable();
      this.formEnabled = true;
      //   this.hideButtons();
      // } else {
      //   this.toastrService.error("Please fill Accident information first.", 'Error')
      // }
      this.enableflag = false;
    }
  }
  disableForm() {
    this.reportForm.disable();
    this.formEnabled = false;
    this.enableflag = true;
    this.hideButtons();
  }
  hideButtons() {
    this.reportForm.disabled ? this.fieldConfig[1].classes.push('hidden') : this.fieldConfig[1].classes = this.fieldConfig[1].classes.filter(className => className != 'hidden')
  }
  canDeactivate() {
    return (this.reportForm.dirty || this.reportForm.touched);
  }
  setConfigration(data?) {
    this.fieldConfig = [
      new DivClass([
        new RadioButtonClass('Was the accident reported? *', 'reportedToPolice', [{ name: 'true', label: "Yes", value: true }, { name: "false", value: false, label: "No" }], data && data['reportedToPolice'] ? data['reportedToPolice'] : false, [], ['col-md-4', 'col-sm-3']),
        new InputClass('Reporting Date * (mm/dd/yyyy)', 'reportingDate', InputTypes.date, data && data['reportingDate'] ? data['reportingDate'].split('T')[0] : '', [], '', ['col-md-4', 'col-sm-3']),
        new InputClass('Precinct', 'reportingPrecinct', InputTypes.text, data && data['reportingPrecinct'] ? data['reportingPrecinct'] : '', [], '', ['col-md-4', 'col-sm-3']),
        new SelectClass('Select State *', 'reportingState', this.states.map(res => {
          return { name: res.stateName, label: res.stateName, value: res.id }
        }), 'reportingState', [], ['col-md-4', 'col-sm-3']),
        new SelectClass('Select City *', 'reportingCity', this.cities.map(res => { return { name: res.cityName, label: res.cityName, value: res.id } }), '', [], ['col-md-4', 'col-sm-3']),
        new SelectClass('Select County *', 'reportingCounty', this.counties.map(res => { return { name: res.name, label: res.name, value: res.id } }), '', [], ['col-md-4', 'col-sm-3']),

      ], ['row']),
      new DivClass([
        new ButtonClass('Back', ['btn', 'btn-primary', 'btn-block mt-0'], ButtonTypes.button, this.disableForm.bind(this), { icon: 'icon-left-arrow me-2', button_classes: ['col-2'] }),
        new ButtonClass('Save', ['btn', 'btn-success', 'btn-block mt-0'], ButtonTypes.submit, null, { icon: 'icon-save-continue me-2', button_classes: ['col-2'] })
      ], ['row', 'form-btn', 'justify-content-center'])
    ]

  }

}
