import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Logger } from '@nsalaun/ng-logger';
import { FDServices } from '../../services/fd-services.service';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { CanDeactivateComponentInterface } from '@appDir/shared/canDeactivateFormsComponent/CanDeactivateComponent.interface';

@Component({
  selector: 'app-household-form',
  templateUrl: './household-form.component.html',
})
export class HouseholdFormComponent implements OnInit, CanDeactivateComponentInterface {

  public form: FormGroup
  @Input() title = 'Edit'
  @Input() caseId: any;
  @Input() peopleLivingWithPatients: any
  @Output() getCase = new EventEmitter();
  @Input() patientId: any;
  public relations: any[];
  @Input() accidentId: number;

  constructor(private fb: FormBuilder, private logger: Logger, private route: ActivatedRoute, private fd_services: FDServices, private toastrService: ToastrService, private router: Router) {
    this.setForm()
    this.getRelations();
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes['peopleLivingWithPatients']) {
      if (!this.fd_services.isEmpty(changes['peopleLivingWithPatients'].currentValue)) {
        this.logger.log('people living with patient', this.peopleLivingWithPatients)
        this.setValues();
      }
    }
  }
  setValues() {
    this.form.patchValue({
      id: this.peopleLivingWithPatients.id,
      firstName: this.peopleLivingWithPatients.firstName,
      middleName: this.peopleLivingWithPatients.middleName,
      lastName: this.peopleLivingWithPatients.lastName,
      socialSecurity: this.peopleLivingWithPatients.socialSecurity,
      type: 'accident',
      relationshipId: this.peopleLivingWithPatients.relationship ? this.peopleLivingWithPatients.relationship[0].id : '',
      ownVehicle: this.peopleLivingWithPatients.ownVehicle,
      dateOfBirth: this.peopleLivingWithPatients.dateOfBirth != null ? this.peopleLivingWithPatients.dateOfBirth.split('T')[0] : null,
      caseId: this.caseId,
      patientId: this.patientId,
      accidentId: this.accidentId
    })

    if (this.peopleLivingWithPatients.relatedVehicleInfos != null) {
      this.form.patchValue({
        anyOneLive: this.peopleLivingWithPatients.relatedVehicleInfos.peopleLiveVehicle,
        personVehicleFirstName: this.peopleLivingWithPatients.relatedVehicleInfos.firstName,
        personVehicleMiddleName: this.peopleLivingWithPatients.relatedVehicleInfos.middleName,
        personVehicleLastName: this.peopleLivingWithPatients.relatedVehicleInfos.lastName,
        personVehicleCellPhone: this.peopleLivingWithPatients.relatedVehicleInfos.cellPhone,
        personVehiclePolicyNo: this.peopleLivingWithPatients.relatedVehicleInfos.policyNo,
        insuranceCompanyName: this.peopleLivingWithPatients.relatedVehicleInfos.insuranceCompany.companyName,
        personVehicleEffective: this.peopleLivingWithPatients.relatedVehicleInfos.effective.split('T')[0],
        personVehicleExpires: this.peopleLivingWithPatients.relatedVehicleInfos.expires.split('T')[0],
      })
    }
  }

  add(form) {
    this.fd_services.addPeopleLivingWithPatients(form).subscribe(res => {
      if (res.statusCode == 200) {
        this.getCase.emit()
        this.toastrService.success('Successfully Added ', 'Success')
      } else {
        this.toastrService.error('Something went wrong', 'Error')
      }
    })
  }


  update(form) {
    this.fd_services.updatePeopleLivingWithPatients(form).subscribe(res => {
      if (res.statusCode == 200) {
        this.getCase.emit()
        this.toastrService.success('Successfully Updated', 'Success')
      } else {
        this.toastrService.error(res.error.message, 'Error')
      }
    })
  }

  getRelations() {
    this.fd_services.getRelations().subscribe(res => {
      if (res.statusCode == 200) {
        this.relations = res.data;
      }
    })
  }

  setForm() {
    this.form = this.fb.group({
      id: null,
      anyOneLive: ['', [Validators.required]],
      firstName: '',
      middleName: '',
      lastName: '',
      socialSecurity: '',
      type: 'accident',
      relationshipId: '',
      ownVehicle: '',
      dateOfBirth: '',
      personVehicleFirstName: '',
      personVehicleMiddleName: '',
      personVehicleLastName: '',
      personVehicleCellPhone: '',
      personVehiclePolicyNo: '',
      insuranceCompanyName: '',
      personVehicleEffective: '',
      personVehicleExpires: '',
      caseId: this.caseId,
      patientId: this.patientId,
      accidentId: this.accidentId
    });
  }

  validatePersonLivingFields(): Object {
    let fields = {
      firstName: [Validators.required, Validators.maxLength(20)],
      middleName: [Validators.maxLength(20)],
      lastName: [Validators.required, Validators.maxLength(20)],
      socialSecurity: [Validators.required, Validators.maxLength(10)],
      relationshipId: [Validators.required],
      dateOfBirth: [Validators.required],
      ownVehicle: [Validators.required],
    }

    return fields;
  }

  validateOwnerFields(): Object {

    let fields = {
      personVehicleFirstName: [Validators.required, Validators.maxLength(20)],
      personVehicleMiddleName: [Validators.maxLength(20)],
      personVehicleLastName: [Validators.maxLength(20)],
      personVehicleCellPhone: [Validators.required, Validators.minLength(12)],
      personVehiclePolicyNo: [Validators.required, Validators.minLength(10)],
      insuranceCompanyName: [Validators.required],
      personVehicleEffective: [Validators.required],
      personVehicleExpires: [Validators.required],
    }

    return fields
  }

  onSubmit(form) {
    this.logger.log(form);
    if (this.form.valid) {
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
  anyOneLiveToggle(value: boolean) {

    let fields: any = this.validatePersonLivingFields();
    Object.keys(fields).forEach(key => {
      if (value) {
        this.form.controls[key].setValidators(fields[key]);
      } else {
        this.form.controls[key].clearValidators();
        this.form.patchValue({ key: '' });
      }

    });

    this.togglePersonOwnerVehicleFields(value);
  }

  togglePersonOwnerVehicleFields(value: boolean) {
    this.logger.log(value);
    let fields: any = this.validateOwnerFields();
    Object.keys(fields).forEach(key => {
      if (value) {
        this.form.controls[key].setValidators(fields[key]);
      } else {
        this.form.controls[key].clearValidators();
        this.form.patchValue({ key: '' });
      }
    });
  }

  goBack() {
    this.router.navigate(['household'], { relativeTo: this.route.parent.parent.parent })
  }
  canDeactivate() {
    return (this.form.dirty);
  }
}
