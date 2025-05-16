import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Logger } from '@nsalaun/ng-logger';
import { FDServices } from '../../services/fd-services.service';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-mri-intake2-form',
  templateUrl: './mri-intake2-form.component.html',
  styleUrls: ['./mri-intake2-form.component.scss']
})
export class MriIntake2FormComponent implements OnInit {

  public form: FormGroup
  @Input() title = 'Edit'
  @Input() caseId: any;
  @Input() caseData: any;
  @Input() visitSessionId: any;
  @Output() getCase = new EventEmitter();
  @Output() setVisitSessionId = new EventEmitter();
  public patientId: any;
  public prevSurgArr: FormArray;
  public surgeryExaminationArr: FormArray;
  public expProblemArr: any[] = [];
  public surgicalTypes: any[] = [];
  public bodyParts: any[] = [];
  // private visiSessionId: number;
  private visitId: number;
  disableBtn = false
  enableflag: boolean = true;
  formEnabled = false;
  constructor(private fb: FormBuilder, private logger: Logger, private router: Router, private route: ActivatedRoute, private fd_services: FDServices, private toastrService: ToastrService) {
    this.setForm()
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes['caseData']) {
      if (!this.fd_services.isEmpty(this.caseData) && changes['caseData'].currentValue) {
        this.caseId = this.caseData.id;
        this.patientId = this.caseData.patient.id;
        this.assignValues()
      }
    }
  }

  assignValues() {

    let data = this.caseData.medicalHistories
    if (data) {
      // var pregnantOrLatePeriod = 'false';
      // if (data.pregnantOrLatePeriod == "true") {
      //   pregnantOrLatePeriod = 'true';
      // } else if (data.pregnantOrLatePeriod == "false") {
      //   pregnantOrLatePeriod = 'false';
      // } else if (data.pregnantOrLatePeriod == "Not Sure") {
      //   pregnantOrLatePeriod = "Not Sure";
      // }
      this.form.patchValue({
        id: data.id,
        eyeInvolvedObject: data.eyeInvolvedObject,
        metallicObjectInvolved: data.metallicObjectInvolved,
        takenAnyDrug: data.takenAnyDrug,
        allergicToFood: data.allergicToFood,
        iodineContrast: data.iodineContrast,
        latexAllergies: data.latexAllergies,
        foodAllergies: data.foodAllergies,
        historyOfDisease: data.historyOfDisease,
        hadChemotherapy: data.hadChemotherapy,
        hadRadiation: data.hadRadiation,
        hadAnemia: data.hadAnemia,
        dateOfLastPeriod: (data.dateOfLastPeriod) ? data.dateOfLastPeriod.split('T')[0] : '',
        postMenopausal: data.postMenopausal,
        pregnantOrLatePeriod: data.pregnantOrLatePeriod,
        harmonalTreatment: data.harmonalTreatment,
        fertilityTreatments: data.fertilityTreatments,
        breastfeeding: data.breastfeeding,
        visitSessionsId: data.visitSessionsId,
        caseId: this.caseId,
        patientId: this.caseData.patient.id
      });

      if (data.visiSessionId) {
        this.setVisitSessionId.emit(data.visiSessionId);
      }
    }

    // console.log('data.foodAllergies', data.foodAllergies)

    let comments = this.caseData.comments
    this.clearFormArray(<FormArray>this.form.get('describeInjuries'));
    this.clearFormArray(<FormArray>this.form.get('describeObjects'));
    this.clearFormArray(<FormArray>this.form.get('medication'));
    this.clearFormArray(<FormArray>this.form.get('allergy'));
    this.clearFormArray(<FormArray>this.form.get('describeDiseases'));
    this.clearFormArray(<FormArray>this.form.get('fertilityTreatmentsArr'));
    comments.forEach(element => {

      if (data && data.eyeInvolvedObject) {
        if (element.type == 'describeInjuries') {
          let describeInjuries = <FormArray>this.form.get('describeInjuries')
          describeInjuries.push(new FormControl(element.description))
        }
      }

      if (data && data.metallicObjectInvolved) {
        if (element.type == 'describeObjects') {
          let describeObjects = <FormArray>this.form.get('describeObjects')
          describeObjects.push(new FormControl(element.description))
        }
      }



      // if (data && (data.foodAllergies == true || data.foodAllergies == 'Other')) {
      //   console.log('yes food allergic')
      //   if (element.type == 'allergy') {
      //     let allergy = <FormArray>this.form.get('allergy')
      //     allergy.push(new FormControl(element.description))
      //   }
      // }

      if (data && data.hadAnemia) {
        if (element.type == 'describeDiseases') {
          let describeDiseases = <FormArray>this.form.get('describeDiseases')
          describeDiseases.push(new FormControl(element.description))
        }
      }

      if (data && data.fertilityTreatments) {
        if (element.type == 'fertilityTreatments') {
          let fertilityTreatmentsArr = <FormArray>this.form.get('fertilityTreatmentsArr')
          fertilityTreatmentsArr.push(new FormControl(element.description))
        }
      }

    });

    if (this.caseData && this.caseData.allergy) {
      let allergies = this.caseData.allergy
      allergies.forEach(element => {
        if (data && data.takenAnyDrug) {
          let allergy = <FormArray>this.form.get('allergy')
          allergy.push(new FormControl(element.name))

        }
      });
    }
    if (this.caseData && this.caseData.drugs) {
      let drugs = this.caseData.drugs
      drugs.forEach(element => {
        if (data && data.takenAnyDrug) {
          let medication = <FormArray>this.form.get('medication')
          medication.push(new FormControl(element.name))

        }
      });
    }

    this.disableForm();
  }
  clearFormArray = (formArray: FormArray) => {
    if (formArray && formArray.length) {
      while (formArray.length !== 0) {
        formArray.removeAt(0)
      }
    }

  }
  ngOnInit() {

    if (this.caseData && this.caseData.parent) {
      this.caseId = this.caseData.id;
      this.patientId = this.caseData.patient.id;
    }
  }

  setForm() {
    this.form = this.fb.group({
      id: null,
      eyeInvolvedObject: ['', [Validators.required]],
      describeInjuries: this.fb.array([]),
      injuryDescription: '',
      metallicObjectInvolved: ['', [Validators.required]],
      describeObjects: this.fb.array([]),
      objecDescription: '',
      takenAnyDrug: ['', [Validators.required]],
      medication: this.fb.array([]),
      medicationDescription: '',
      allergicToFood: ['', [Validators.required]],
      iodineContrast: [''],
      latexAllergies: '',
      foodAllergies: '',
      allergy: this.fb.array([]),
      alergyDescription: '',
      historyOfDisease: ['', [Validators.required]],
      hadChemotherapy: ['', [Validators.required]],
      hadRadiation: ['', [Validators.required]],
      hadAnemia: ['', [Validators.required]],
      describeDiseases: this.fb.array([]),
      describeDiseasesField: '',
      dateOfLastPeriod: [''],
      postMenopausal: ['', [Validators.required]],
      pregnantOrLatePeriod: ['', [Validators.required]],
      harmonalTreatment: ['', [Validators.required]],
      fertilityTreatments: ['', [Validators.required]],
      fertilityTreatmentsArr: this.fb.array([]),
      fertilityDescriptionField: '',
      breastfeeding: ['', [Validators.required]],
      visitId: this.visitId,
      visitSessionsId: this.visitSessionId,
      caseId: this.caseId,
      patientId: this.patientId
    });
    this.disableForm();
    if (this.caseData && this.caseData && this.caseData.patient.gender == 'female') {
      // console.log('setting validation gender base')
      this.form.controls["dateOfLastPeriod"].setValidators([Validators.required]);
    }

  }


  addDescription(field, key: string): void {

    this.logger.log(field);
    let value = this.form.get(field).value;
    if (value != "") {
      const arr = <FormArray>this.form.get(key)
      arr.push(new FormControl(value));
      this.form.patchValue({ [field]: '' });
    }

  }

  clearDescriptions(key: string): void {
    this.form.controls[key] = this.fb.array([]);
  }


  removeDescription(index, key) {
    const arr = <FormArray>this.form.get(key)
    arr.removeAt(index)
  }

  validateMRIIntake3(): Object {
    let fields = {
      iodineContrast: [Validators.required],
      latexAllergies: [Validators.required],
      foodAllergies: [Validators.required],
    }

    return fields
  }

  toggleMRIIntke3(ev) {

    let fields: any = this.validateMRIIntake3();
    Object.keys(fields).forEach(key => {
      if (ev.target.value == 'true') {
        this.form.controls[key].setValidators(fields[key]);
      } else {
        this.form.controls[key].clearValidators();
        this.form.patchValue({ key: '' });
      }

    });
  }


  onSubmit(form) {
    this.logger.log(form);
    if (this.form.valid) {
      this.disableBtn = true
      this.logger.log('form is valid')
      if (form.id == null) {
        // this.createVisitSession.emit();
        // this.add(form)
        if (!this.visitSessionId) {
          let visitSessionData = {
            'visitTypeId': 1,
            'caseId': +this.caseId,
            'patientId': this.patientId
          }
          this.fd_services.createVisitSession(visitSessionData).subscribe(res => {
            if (res.statusCode == 200) {
              this.form.markAsUntouched();
              this.form.markAsPristine();
              this.visitSessionId = res.data.visitSessionId;
              this.setVisitSessionId.emit(this.visitSessionId)
              this.add(form)
            }
          })
        } else {
          this.add(form)
        }

      } else {
        this.update(form)
      }
    } else {
      this.logger.log('form is invalid');
      this.fd_services.touchAllFields(this.form);
    }
  }

  add(form) {
    form['caseId'] = this.caseId;
    form['visitSessionsId'] = this.visitSessionId;
    form['patientId'] = this.patientId;
    this.fd_services.addMedicalHistories(form).subscribe(res => {
      this.getCase.emit()
      this.form.markAsUntouched();
      this.form.markAsPristine();
      this.disableBtn = false
      this.toastrService.success('MRI Data Updated Successfully', 'Success')
    }, err => {
      this.disableBtn = false
      this.toastrService.error(err.error.error.message, 'Error')
    })
  }

  update(form) {
    this.fd_services.updateMedicalHistories(form).subscribe(res => {
      this.getCase.emit()
      this.disableBtn = false
      this.form.markAsUntouched();
      this.form.markAsPristine();
      this.toastrService.success('MRI Data Updated Successfully', 'Success')
    }, err => {
      this.disableBtn = false
      this.toastrService.error(err.error.error.message, 'Error')
    })
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
