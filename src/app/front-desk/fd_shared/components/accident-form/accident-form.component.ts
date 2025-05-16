import { Component, OnInit, Input, Output, SimpleChanges, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Logger } from '@nsalaun/ng-logger';
import { FDServices } from '../../services/fd-services.service';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-accident-form',
  templateUrl: './accident-form.component.html',
})
export class AccidentFormComponent implements OnInit {

  public form: FormGroup
  @Input() title = 'Edit'
  public insuranceType: string = 'major medical'
  @Input() caseId: any;
  @Input() accident: any;
  @Input() patientId: any;
  @Output() getCase = new EventEmitter();
  public contactPersonTypesId: number = 3
  public relations: any[];
  disableBtn = false
  formEnabled: boolean = false;
  enableflag: boolean = true;
  constructor(private fb: FormBuilder, private logger: Logger, private fd_services: FDServices,
    private toastrService: ToastrService, private router: Router, private route: ActivatedRoute) {
    this.setForm()
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes['accident']) {
      if (!this.fd_services.isEmpty(changes['accident'].currentValue)) {
        this.setValues();
      }
    }

    if (this.caseId) {
      this.form.patchValue({ caseId: this.caseId })
    }
  }

  setValues() {
    let time: any[]
    if (this.accident.accidentTime != '') {
      time = this.accident.accidentTime.split(' ');
    }
    let accidentDate = this.accident.accidentDate.split('T')

    this.form.patchValue({
      id: this.accident.id,
      accidentDate: accidentDate[0],
      accidentTime: this.accident.accidentTime,
      driverCondition: this.accident.driverCondition,
      caseEstablished: this.accident.caseEstablished,
      limoDriver: this.accident.limoDriver,
      ime: this.accident.ime,
      injuredAtYourPlace: this.accident.injuredAtYourPlace,
      pregnancyCondition: this.accident.pregnancyCondition,
      caseId: this.caseId,
      patientId: this.patientId,
    })
  }

  setForm() {
    this.form = this.fb.group({
      id: null,
      accidentDate: ['', [Validators.required]],
      accidentTime: [''],
      driverCondition: ['', [Validators.required]],
      caseEstablished: '',
      limoDriver: ['', [Validators.required]],
      ime: ['', [Validators.required]],
      injuredAtYourPlace: ['', [Validators.required]],
      pregnancyCondition: [''],
      caseId: this.caseId,
      patientId: this.patientId,
    });

    this.form.disable()
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
    this.fd_services.addInjury(form).subscribe(res => {
      this.disableBtn = false
      if (res.statusCode == 200) {
        this.form.disable()
        this.getCase.emit()
        this.toastrService.success('Accident data Added Successfully', 'Success')
      } else {
        this.toastrService.error(res.error.message, 'Error')
      }
    }, err => {
      this.disableBtn = false
      this.toastrService.error(err.error.error.message, 'Error')
    })
  }

  update(form) {
    this.fd_services.updateInjury(form).subscribe(res => {
      this.disableBtn = false
      if (res.statusCode == 200) {
        this.form.disable()
        this.getCase.emit()
        this.toastrService.success('Accident Update Successfully', 'Success')
      } else {
        this.toastrService.error(res.error.message, 'Error')
      }
    }, err => {
      this.disableBtn = false
      this.toastrService.error(err.error.error.message, 'Error')
    })
  }

  goBack() {
    this.router.navigate(['accident'], { relativeTo: this.route.parent.parent.parent })
  }
  enableForm(enableflag) {
    if (enableflag == false) { this.disableForm(); return; }
    else {
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
}
