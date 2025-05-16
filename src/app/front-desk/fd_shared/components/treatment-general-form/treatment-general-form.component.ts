import { Component, OnInit, Input, Output, SimpleChanges, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Logger } from '@nsalaun/ng-logger';
import { FDServices } from '../../services/fd-services.service';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { SelectionModel } from '@angular/cdk/collections';
import { DynamicFormComponent } from '@appDir/shared/dynamic-form/components/dynamic-form/dynamic-form.component';
import { DivClass } from '@appDir/shared/dynamic-form/models/DivClass.class';
import { FieldConfig } from '@appDir/shared/dynamic-form/models/fieldConfig.model';
import { InputClass } from '@appDir/shared/dynamic-form/models/InputClass.class';
import { InputTypes } from '@appDir/shared/dynamic-form/constants/InputTypes.enum';
import { RadioButtonClass } from '@appDir/shared/dynamic-form/models/RadioButtonClass.class';
import { AddressClass } from '@appDir/shared/dynamic-form/models/AddressClass.class';
import { ButtonClass } from '@appDir/shared/dynamic-form/models/ButtonClass.class';
import { ButtonTypes } from '@appDir/shared/dynamic-form/constants/ButtonTypes.enum';
import { GeneralDetails } from '@appDir/front-desk/models/MedicalTreatmentModal';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
@Component({
  selector: 'app-treatment-general-form',
  templateUrl: './treatment-general-form.component.html',
})
export class TreatmentGeneralFormComponent implements OnInit {

  public form: FormGroup
  public doctorForm: FormGroup
  public doctorRows: any[];
  @Input() title = 'Edit'
  @Input() caseId: any;
  @Input() caseData: any;
  @Output() getCase = new EventEmitter()
  public modalRef: NgbModalRef;
  public doctorInfo: any;
  public formEnabled: boolean = false;
  public doctorFormEnabled: boolean = false;
  private patientId: any;
  private otherTreatments: GeneralDetails;
  disableBtn = false
  enableflag: boolean = true;
  docTitle: string;
  selection = new SelectionModel<Element>(true, []);
  @ViewChild(DynamicFormComponent) component: DynamicFormComponent;
  data: any[] = null;
  fieldConfig: FieldConfig[] = [];
  modalFieldConfig: FieldConfig[] = [];
  constructor(private modalService: NgbModal,private customDiallogService: CustomDiallogService, private fb: FormBuilder, private logger: Logger, private fd_services: FDServices, private router: Router, private toastrService: ToastrService, private route: ActivatedRoute, 
    // private _confirmation: ConfirmationService
    ) {
    this.setConfigration();
    this.setModalConfigration();

    // this.setForm()
    this.setDoctorForm();
    this.getCase.emit();

  }
  ngAfterViewInit() {
    this.form = this.component.form;
    this.form.addControl('caseId', this.fb.control(''));
    this.disableForm();
  }

  ngOnInit() {
    this.getCase.emit();

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes['caseData']) {
      if (!this.fd_services.isEmpty(changes['caseData'].currentValue)) {

        this.form.patchValue({
          caseId: this.caseId,
          patientId: this.caseData.patient ? this.caseData.patient.id : null
        })
        if (this.caseData.otherTreatments != undefined) {
          this.otherTreatments = this.caseData.otherTreatments
          this.patientId = this.caseData.patient.id
          this.setValues();
        }
        if (this.caseData && this.caseData.otherTreatmentDoctors) {
          let doctors = this.caseData.otherTreatmentDoctors
          if (doctors) {
            this.doctorRows = doctors.filter((obj) => {
              return obj.doctorType == 'Previous';
            });
          }
        }
      }
    }
  }

  setValues() {
    if (this.otherTreatments) {
      this.form.patchValue({
        id: this.otherTreatments.id,
        injury_still_treated: this.otherTreatments.injury_still_treated,
        // previousInjuryWork: this.otherTreatments.previousInjuryWork,
        // were_you_treated: this.otherTreatments.were_you_treated,
        // sameEmployer: this.otherTreatments.sameEmployer,
        // otherInjury: this.otherTreatments.otherInjury,
        amount_of_bills: this.otherTreatments.amount_of_bills,
        other_expenses: this.otherTreatments.other_expenses,
        expense_description: this.otherTreatments.expense_description,
        same_injury: this.otherTreatments.same_injury,
        more_health_treatment: this.otherTreatments.more_health_treatment,
        caseId: this.caseId,
        patientId: this.patientId,
      })
    }

  }
  setDoctorFormValues() {
    this.doctorForm.patchValue({
      id: this.doctorInfo.id,
      first_name: this.doctorInfo.first_name,
      middle_name: this.doctorInfo.middle_name,
      last_name: this.doctorInfo.last_name,
      city: this.doctorInfo.city,
      apartment: this.doctorInfo.apartment,
      state: this.doctorInfo.state,
      zip: this.doctorInfo.zip,
      street: this.doctorInfo.street,
      caseId: this.caseId,
      patientId: this.patientId,
    })
  }

  setForm() {
    this.form = this.fb.group({
      id: null,
      amount_of_bills: [''],
      other_expenses: ['', [Validators.required]],
      injury_still_treated: ['', [Validators.required]],
      previousInjuryWork: ['', [Validators.required]],
      were_you_treated: ['', [Validators.required]],
      sameEmployer: ['', [Validators.required]],
      otherInjury: ['', [Validators.required]],
      expense_description: '',
      same_injury: ['', [Validators.required]],
      more_health_treatment: ['', [Validators.required]],
      caseId: this.caseId,
      patientId: this.patientId,
    });

    this.disableForm()
  }
  setDoctorForm() {
    this.doctorForm = this.fb.group({
      id: null,
      first_name: ['', [Validators.required]],
      middle_name: [''],
      last_name: ['', [Validators.required]],
      city: [''],
      apartment: [''],
      state: '',
      zip: [''],
      street: [''],
      caseId: this.caseId,
      patientId: this.patientId,
    });

    // this.doctorForm.disable()
  }

  onSubmitDoctorForm(form) {
    this.logger.log('doctorform treatment General', form);
    if (this.doctorForm.valid) {
      this.disableBtn = true
      this.logger.log('form is valid')
      form['caseId'] = this.caseId;
      form['patientId'] = this.patientId;
      form['doctorType'] = "Previous";
      if (form.id == null) {
        this.addDoctor(form)
      } else {
        this.updateDoctor(form)
      }
    } else {
      this.logger.log('form is invalid');
      this.fd_services.touchAllFields(this.form);
    }
  }

  onSubmit(form) {
    this.logger.log(form);
    if (this.form.valid) {
      this.disableBtn = true
      this.logger.log('form is valid')
      if (form.id == null) {
        this.add(form)
      } else {
        this.update(form)
      }
    } else {
      this.logger.log('form is invalid');
      this.fd_services.touchAllFields(this.form);
    }
  }

  add(form) {
    this.fd_services.addOtherTreatments(form).subscribe(res => {
      this.disableBtn = false
      if (res.statusCode == 200) {
        this.form.markAsUntouched();
        this.form.markAsPristine();
        this.disableForm()
        this.otherTreatments = res.data
        this.setValues()
        this.getCase.emit()
        this.toastrService.success('General Treatment Data Added Successfully', 'Success')
      } else {
        this.toastrService.error('Something went wrong', 'Error')
      }
    }, err => {
      this.toastrService.error(err.error.error.message, 'Error')
    })
  }

  update(form) {
    this.fd_services.updateOtherTreatments(form).subscribe(res => {
      this.disableBtn = false
      if (res.statusCode == 200) {
        this.form.markAsUntouched();
        this.form.markAsPristine();
        this.disableForm()
        this.getCase.emit()
        this.toastrService.success('General Treatment Data Updated Successfully', 'Success')
      } else {
        this.toastrService.error(res.error.message, 'Error')
      }
    }, err => {
      this.toastrService.error(err.error.error.message, 'Error')
    })
  }
  addDoctor(form) {
    this.fd_services.addOtherTreatmentDoctors(form).subscribe(res => {
      this.disableBtn = false
      if (res.statusCode == 200) {
        this.form.markAsUntouched();
        this.form.markAsPristine();
        this.doctorForm.disable()
        // this.otherTreatments = res.data 
        this.setValues()
        this.getCase.emit()
        let doctors = this.caseData.otherTreatmentDoctors
        if (doctors) {
          this.doctorRows = doctors.filter((obj) => {
            return obj.doctorType == 'Previous';
          });
        }
        this.modalRef.close();
        this.toastrService.success('Doctor Added Successfully', 'Success')
      } else {
        this.toastrService.error('Something went wrong', 'Error')
      }
    }, err => {
      this.toastrService.error(err.error.error.message, 'Error')
    })
  }

  updateDoctor(form) {
    this.fd_services.updateOtherTreatmentDoctors(form).subscribe(res => {
      this.disableBtn = false
      if (res.statusCode == 200) {
        this.form.markAsUntouched();
        this.form.markAsPristine();
        this.doctorForm.disable()
        this.getCase.emit()
        // this.doctorRows = this.caseData.otherTreatmentDoctors
        let doctors = this.caseData.otherTreatmentDoctors
        if (doctors) {
          this.doctorRows = doctors.filter((obj) => {
            return obj.doctorType == 'Previous';
          });
        }
        this.modalRef.close();
        this.toastrService.success('General Treatment Data Updated Successfully', 'Success')
      } else {
        this.toastrService.error(res.error.message, 'Error')
      }
    }, err => {
      this.toastrService.error(err.error.error.message, 'Error')
    })
  }
  public handleAddressChange(address: Address, isDoctor?: boolean) {

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
      if (isDoctor) {
        this.doctorForm.patchValue({
          'street': address,
          'city': city.long_name,
          'state': state.long_name,
          'zip': postal_code.long_name,
          // 'lat': lat,
          // 'lng': lng,
        })
      } else {
        this.form.patchValue({
          'hospitalAddress': address,
          'hospitalCity': city.long_name,
          'hospitalState': state.long_name,
          'hospitalZipCode': postal_code.long_name,
          'hospitalLat': lat,
          'hospitalLong': lng,
        })
      }

    } else {
      this.doctorForm.patchValue({
        'street': "",
        'city': "",
        'state': "",
        'zip': "",
        // 'lat': "",
        // 'lng': "",
      })

      this.form.patchValue({
        'hospitalAddress': "",
        'hospitalCity': "",
        'hospitalState': "",
        'hospitalZipCode': "",
        'hospitalLat': "",
        'hospitalLong': "",
      })
    }
  }


  toggleValidations(value, fields) {
    this.logger.log(fields);
    for (var i = 0; i < fields.length; i++) {
      if (value) {
        this.form.controls[fields[i]].setValidators([Validators.required]);
      } else {
        this.form.controls[fields[i]].clearValidators();
        this.form.controls[fields[i]].updateValueAndValidity({ onlySelf: true, emitEvent: false });
        this.form.updateValueAndValidity()

      }
    }
  }

  goBack() {
    this.router.navigate(['injury'], { relativeTo: this.route.parent.parent.parent })
  }

  addDoctorModal = (content, doctor?: any): void => {
    let ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false, size: 'lg', windowClass: 'modal_extraDOc'
    };
    if (doctor) {
      this.docTitle = 'Edit';
      this.doctorInfo = doctor;
      this.setDoctorFormValues();
      this.enableDoctorForm();
    } else {
      this.docTitle = 'Add';
      this.setDoctorForm()
    }

    this.modalRef = this.modalService.open(content, ngbModalOptions);
  }
  enableDoctorForm() {
    this.doctorForm.enable();
    this.doctorFormEnabled = true;
  }
  disableDoctorForm() {
    this.doctorForm.disable();
    this.doctorFormEnabled = false;
    this.modalRef.close();
  }
  enableForm(enableflag) {
    if (enableflag == false) { this.disableForm(); return; }
    else {
      this.form.enable();
      this.formEnabled = true;
      this.enableflag = false;
      this.hideButtons();
    }
  }
  disableForm() {
    this.form.disable();
    this.formEnabled = false;
    this.enableflag = true;
    this.hideButtons();
  }
  deleteSelected(id?: number) {
    let ids: any = [];
    if (id) {
      ids.push(id);
    } else {
      this.selection.selected.forEach(function (obj) {
        ids.push(obj.id)
      });
    }

    let requestData = {
      'ids': ids
    }
    // this.fd_services.deleteCases(requestData).subscribe(
    //   res=> {
    //     // this.setPage({ offset: this.page.pageNumber })
    //   },
    //   err => {

    //   }
    // )
  }
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.doctorRows.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle(event) {
    this.isAllSelected() ?
      this.selection.clear() :
      this.doctorRows.forEach(row => this.selection.select(row));
  }

  confirmDel(id?: number) {
      
this.customDiallogService.confirm('Delete Confirmation?', 'Do you really want to delete it.','Yes','No')
.then((confirmed) => {

  if (confirmed){
    this.deleteSelected(id);
  }else if(confirmed === false){
  
  }else{

  }
})
.catch();

  }
  stringfy(obj) {
    return JSON.stringify(obj);
  }

  setConfigration(data?) {
    this.fieldConfig = [
      new DivClass([
        new RadioButtonClass('Are you still being treated for this injury/illness', 'injury_still_treated',
          [{ name: 'injury_still_treated_yes', value: true, label: 'Yes' }, { name: 'injury_still_treated', value: false, label: 'No' }], data && data['injury_still_treated'] ? data['injury_still_treated'] : false, [], ['col-md-8', 'col-sm-3']),
        new RadioButtonClass('Do you remember having a same injury to same body part?', 'otherInjury',
          [{ name: 'otherInjury_yes', value: true, label: 'Yes' }, { name: 'same_injury', value: false, label: 'No' }], data && data['otherInjury'] ? data['otherInjury'] : false, [], ['col-md-8', 'col-sm-3']),
        new RadioButtonClass('If yes, were you treated by a doctor?', 'were_you_treated',
          [{ name: 'were_you_treated_yes', value: true, label: 'Yes' }, { name: 'were_you_treated_no', value: false, label: 'No' }], data && data['were_you_treated'] ? data['were_you_treated'] : false, [], ['col-md-8', 'col-sm-3']),
        new RadioButtonClass('Are there more doctors who treated you for similar illness/bodypart?', 'moreDoctors',
          [{ name: 'moreDoctors_yes', value: true, label: 'Yes' }, { name: 'moreDoctors_no', value: false, label: 'No' }], data && data['moreDoctors'] ? data['moreDoctors'] : false, [], ['col-md-8', 'col-sm-3']),
        new RadioButtonClass('Was this previous injury/illness work related?', 'previousInjuryWork',
          [{ name: 'previousInjuryWork_yes', value: true, label: 'Yes' }, { name: 'previousInjuryWork_no', value: false, label: 'No' }], data && data['previousInjuryWork'] ? data['previousInjuryWork'] : false, [], ['col-md-8', 'col-sm-3']),
        new RadioButtonClass('If yes, were you working for the same employer that you work for now?', 'sameEmployer',
          [{ name: 'sameEmployer_yes', value: true, label: 'Yes' }, { name: 'sameEmployer_no', value: false, label: 'No' }], data && data['sameEmployer'] ? data['sameEmployer'] : false, [], ['col-md-8', 'col-sm-3']),
        new InputClass('$ Amount of health bills to date', 'amount_of_bills', InputTypes.text, data && data['amount_of_bills'] ? data['amount_of_bills'] : '', [], '', ['col-md-4', 'col-sm-3']),
        new RadioButtonClass('Will you have more health treatment(s)?', 'more_health_treatment',
          [{ name: 'more_health_treatment_yes', value: true, label: 'Yes' }, { name: 'more_health_treatment_no', value: false, label: 'No' }], data && data['more_health_treatment'] ? data['more_health_treatment'] : false, [], ['col-md-8', 'col-sm-3']),
        new RadioButtonClass("As a result of your injury, have you had any other", 'other_expenses',
          [{ name: 'other_expenses_yes', value: true, label: 'Yes' }, { name: 'other_expenses_no', value: false, label: 'No' }], data && data['other_expenses'] ? data['other_expenses'] : false, [], ['col-md-8', 'col-sm-3']),
        new InputClass('Explanation and amounts of such expenses *', 'expense_description', InputTypes.text, data && data['expense_description'] ? data['expense_description'] : '', [], '', ['col-md-4', 'col-sm-3']),

      ], ['row']),
      new DivClass([
        new ButtonClass('Back', ['btn', 'btn-primary', 'btn-block', 'mt-0 mb-3'], ButtonTypes.button, this.disableForm.bind(this), { icon: 'icon-left-arrow me-2', button_classes: ['col-2'] }),
        new ButtonClass('Save & Continue', ['btn', 'btn-success', 'btn-block', 'mt-0 mb-3'], ButtonTypes.submit, null, { icon: 'icon-save-continue me-2', button_classes: ['col-2'] })
      ], ['row', 'form-btn', 'justify-content-center'])
    ]
  }
  setModalConfigration(data?) {
    this.modalFieldConfig = [
      new DivClass([
        new InputClass("Doctors's First Name", 'first_name', InputTypes.text, data && data['first_name'] ? data['first_name'] : '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-md-4', 'col-sm-3']),
        new InputClass("Middle Name", 'middle_name', InputTypes.text, data && data['middle_name'] ? data['middle_name'] : '', [], '', ['col-md-4', 'col-sm-3']),
        new InputClass("Last Name", 'last_name', InputTypes.text, data && data['last_name'] ? data['last_name'] : '', [{ name: 'required', message: 'This field is required', validator: Validators.required }], '', ['col-md-4', 'col-sm-3']),
        new DivClass([
          new AddressClass('Street Address*', 'street', this.modalHandleAddress.bind(this), '', [], '', ['col-md-4', 'col-sm-3']),
          new InputClass('Suite / Floor', 'apartment', InputTypes.text, data && data['apartment'] ? data['apartment'] : '', [], '', ['col-md-4', 'col-sm-3']),
          new InputClass('City', 'city', InputTypes.text, data && data['city'] ? data['city'] : '', [], '', ['col-md-4', 'col-sm-3']),
          new InputClass('State', 'state', InputTypes.text, data && data['state'] ? data['state'] : '', [], '', ['col-md-4', 'col-sm-3']),
          new InputClass('Zip', 'zip', InputTypes.text, data && data['zip'] ? data['zip'] : '', [{ name: 'minlength', message: 'Length can not be less then 5', validator: Validators.minLength(5) }], '', ['col-md-4', 'col-sm-3'], { mask: '00000' }),
        ], ['row'], "", { formControlName: "mail_address" }),
      ], ['row'], "", { formControlName: "previous_treated_by" }),
      new DivClass([
        new ButtonClass('Cancel', ['btn', 'btn-primary', 'btn-block', 'mt-0'], ButtonTypes.button, this.disableDoctorForm.bind(this), { icon: 'icon-left-arrow me-2', button_classes: ['col-2'] }),
        new ButtonClass('Save', ['btn', 'btn-success', 'btn-block', 'mt-0'], ButtonTypes.submit, { icon: 'icon-save-continue me-2', button_classes: ['col-2'] })
      ], ['row', 'form-btn', 'justify-content-center'])
    ]
  }
  modalHandleAddress($event) {
    this.handleAddressChange($event, true);
  }
  onReady(event) {
    if (this.docTitle == 'Add') {
      this.doctorForm = event;
      // this.addFieldsInModal();

    }
    else {
      this.doctorForm = event;
      // this.addFieldsInModal();
      this.setDoctorFormValues();
    }


  }
  hideButtons() {
    this.form.disabled ? this.fieldConfig[1].classes.push('hidden') : this.fieldConfig[1].classes = this.fieldConfig[1].classes.filter(className => className != 'hidden')
  }
  addFieldsInModal() {
    this.doctorForm.addControl('caseId', this.fb.control(''));
    this.doctorForm.addControl('patientId', this.fb.control(''));
    this.doctorForm.addControl('doctorType', this.fb.control(''));
    this.doctorForm.addControl('id', this.fb.control(null));
  }
}
