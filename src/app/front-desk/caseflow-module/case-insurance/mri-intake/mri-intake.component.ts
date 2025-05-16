import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MainService } from '@appDir/shared/services/main-service';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, Validators, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { Logger } from '@nsalaun/ng-logger';
import { Title } from '@angular/platform-browser';
import { MriIntake1FormComponent } from '@appDir/front-desk/fd_shared/components/mri-intake1-form/mri-intake1-form.component';
import { MriIntake2FormComponent } from '@appDir/front-desk/fd_shared/components/mri-intake2-form/mri-intake2-form.component';
import { MriSymptomsFormComponent } from '@appDir/front-desk/fd_shared/components/mri-symptoms-form/mri-symptoms-form.component';
import { CanDeactivateComponentInterface } from '@appDir/shared/canDeactivateFormsComponent/CanDeactivateComponent.interface';

@Component({
  selector: 'app-mri-intake',
  templateUrl: './mri-intake.component.html',
  styleUrls: ['./mri-intake.component.scss']
})
export class MriIntakeComponent implements OnInit, CanDeactivateComponentInterface {

  public form: FormGroup;
  public caseData: any;
  public caseId;
  public patientId: any;
  public visitSessionId: any;
  public visit: any;
  constructor(private fb: FormBuilder, private logger: Logger, private router: Router, private mainService: MainService, private route: ActivatedRoute, private localStorage: LocalStorage, private fd_services: FDServices, private toastrService: ToastrService, private titleService: Title, ) {
    this.titleService.setTitle(this.route.snapshot.data['title']);
    this.route.snapshot.pathFromRoot.forEach(path => {
      if (path && path.params && path.params.caseId) {
        if (!this.caseId) {
          this.caseId = path.params.caseId;
        }
      }
    })
    // this.fd_services.currentCase.subscribe(c => {
    //   this.caseData = c;
    //   if(!this.caseData.id){
    //       this.getCase() 
    //   }
    // })
    this.getCase()
    this.setForm();
  }
  public form1: FormGroup;
  public form2: FormGroup;
  public form3: any;
  @ViewChild(MriIntake1FormComponent) MriIntake1FormComponent: MriIntake1FormComponent;
  @ViewChild(MriIntake2FormComponent) MriIntake2FormComponent: MriIntake2FormComponent;
  @ViewChild(MriSymptomsFormComponent) MriSymptomsFormComponent: MriSymptomsFormComponent;
  ngAfterViewInit() {
    this.getChildProperty();
  }
  getChildProperty() {
    this.form1 = this.MriIntake1FormComponent.form;
    this.form2 = this.MriIntake2FormComponent.form;
    this.form3 = this.MriSymptomsFormComponent.symptomsSelected;
  }
  getCase() {
    this.fd_services.getCaseDetail(this.caseId).subscribe(res => {
      if (res.statusCode == 200) {
        this.caseData = res.data.case
        this.caseId = this.caseData.id;
        this.patientId = this.caseData.patient.id;
        this.fd_services.setCase(res.data.case)
      }
    })
  }
  ngOnInit() {
    this.getCase()
  }

  setForm() {
    this.form = this.fb.group({
      id: null,
      hadSurgery: ['', [Validators.required]],
      prevSurgArr: this.fb.array([]),
      hadExamination: ['', [Validators.required]],
      surgeryExaminationArr: this.fb.array([]),
      experiencedProblem: ['', [Validators.required]],
      description: '',
      expProblemArr: this.fb.array([]),
      caseId: this.caseId,
      patientId: ['', [Validators.required]],
    });
  }
  assignValues() {
    let data = this.caseData.surgicalDetails
    this.form.patchValue({
      id: data.id,
      hadSurgery: data.hadSurgery,
      hadExamination: data.hadExamination,
      experiencedProblem: data.experiencedProblem,
      description: '',
      caseId: this.caseId,
      patientId: this.caseData.patient.id
    })

    if (data.hadSurgery) {
      let surgeriesData = this.caseData.previousSurgeries
      surgeriesData.forEach(element => {
        let prevSurgArr = <FormArray>this.form.get('prevSurgArr');
        prevSurgArr.push(this.fb.group({
          dateOfSurgery: element.dateOfSurgery != null ? element.dateOfSurgery.split('T')[0] : null,
          typeOfSurgeryId: element.typeOfSurgeryId,
          surgeryTestedToday: element.surgeryTestedToday,
        }))
        this.form.updateValueAndValidity()
      });
    }

    if (data.hadExamination) {
      let surgeryExaminations = this.caseData.surgeryExaminations
      surgeryExaminations.forEach(element => {
        let surgeryExaminationArr = <FormArray>this.form.get('surgeryExaminationArr')
        surgeryExaminationArr.push(this.fb.group({
          typeOfStudy: element.typeOfStudy,
          bodyPartId: element.bodyPartId,
        }))
        this.logger.log('surgeryExaminationArr', surgeryExaminationArr)
        // this.form.updateValueAndValidity()
      });
    }

    if (data.experiencedProblem) {
      this.caseData.comments.forEach(element => {
        if (element.type == 'explianProblem') {
          let expProblemArr = <FormArray>this.form.get('expProblemArr')
          expProblemArr.push(new FormControl(element.description))
        }
      });
    }
  }

  setVisitSessionId(id) {
    this.visitSessionId = id;
  }
  canDeactivate() {
    return ((this.form1.dirty && this.form1.touched) || (this.form2.dirty && this.form2.touched) || this.form3.length > 0);
  }
}
