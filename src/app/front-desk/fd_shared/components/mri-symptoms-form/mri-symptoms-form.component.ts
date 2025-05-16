import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { Logger } from '@nsalaun/ng-logger';
import { Router, ActivatedRoute } from '@angular/router';
import { FDServices } from '../../services/fd-services.service';
import { ToastrService } from 'ngx-toastr';
import { getObjectChildValue } from '@appDir/shared/utils/utils.helpers';

@Component({
  selector: 'app-mri-symptoms-form',
  templateUrl: './mri-symptoms-form.component.html',
  styleUrls: ['./mri-symptoms-form.component.scss']
})
export class MriSymptomsFormComponent implements OnInit {
  @Input() title = 'Edit'
  @Input() caseId: any;
  @Input() caseData: any;
  @Output() getCase = new EventEmitter();
  public form: FormGroup;
  public symptomsList: any = [];
  public symptomsSelected: any = []
  public formEnabled: boolean = false;
  public disableBtn: boolean = false;
  enableflag: boolean = true;
  constructor(private fb: FormBuilder, private logger: Logger, private router: Router, private route: ActivatedRoute, private fd_services: FDServices, private toastrService: ToastrService) {

    this.setForm()
    this.getSymptoms();
  }

  ngOnInit() {

  }
  ngOnChanges() {
    this.form.get('symptomsArr').patchValue(getObjectChildValue(this.caseData, [], ['symptoms']))
    this.formData.map(symptom => {
      let result = this.caseData.symptoms.find(_sym => {
        return symptom.id === _sym.id
      })
      if (result) {
        symptom.value = true;
      }
    })
  }
  formData = []
  getSymptoms() {
    this.fd_services.getSymptoms().subscribe(
      res => {
        this.symptomsList = res.data;
        this.formData = this.symptomsList.map(symptom => {
          return { ...symptom, value: false }
        })
        this.disableForm();
      },

      err => {

      }
    )
  }
  setForm() {
    this.form = this.fb.group({
      id: null,
      symptomsArr: this.fb.array([]),
      caseId: this.caseId
    });
    this.disableForm();
  }
  onSubmit(form) {
    this.logger.log(form);
    form['caseId'] = this.caseId;
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

  update(form) {
    form['caseId'] = this.caseId;
    this.fd_services.saveCaseSymptoms(form).subscribe(res => {
      this.disableBtn = false
      this.form.markAsUntouched();
      this.form.markAsPristine();
      this.getCase.emit()
      this.toastrService.success('Data Update Successfully', 'Success')
    }, err => {
      this.disableBtn = false
      this.toastrService.error(err.error.error.message, 'Error')
    })
  }

  add(form) {
    form['caseId'] = this.caseId;
    this.fd_services.saveCaseSymptoms(form).subscribe(res => {
      this.form.markAsUntouched();
      this.form.markAsPristine();
      this.disableBtn = false
      this.getCase.emit()
      this.toastrService.success('Data Added Successfully', 'Success')
    }, err => {
      this.disableBtn = false
      this.toastrService.error(err.error.error.message, 'Error')
    })
  }

  toggleSymptom(isChecked, symptom) {

    symptom.selected = isChecked
    if (isChecked) {
      this.symptomsSelected.push(symptom);

    } else {
      const index = this.symptomsSelected.findIndex(Selectedsymptoms => Selectedsymptoms === symptom);
      this.symptomsSelected.splice(index, 1)
    }
    this.clearFormArray(<FormArray>this.form.get('symptomsArr'));
    this.symptomsSelected.forEach(element => {
      let symptoms = <FormArray>this.form.get('symptomsArr')
      symptoms.push(new FormControl(element.name))
    });
  }
  clearFormArray = (formArray: FormArray) => {
    if (formArray && formArray.length) {
      while (formArray.length !== 0) {
        formArray.removeAt(0)
      }
    }

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
