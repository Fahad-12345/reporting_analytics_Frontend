import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Page } from '@appDir/front-desk/models/page';
import { Router } from '@angular/router';
import { FieldConfig } from '@appDir/shared/dynamic-form/models/fieldConfig.model';
import { InputClass } from '@appDir/shared/dynamic-form/models/InputClass.class';
import { InputTypes } from '@appDir/shared/dynamic-form/constants/InputTypes.enum';
import { DivClass } from '@appDir/shared/dynamic-form/models/DivClass.class';
import { ButtonClass } from '@appDir/shared/dynamic-form/models/ButtonClass.class';
import { ButtonTypes } from '@appDir/shared/dynamic-form/constants/ButtonTypes.enum';
import { DynamicFormComponent } from '@appDir/shared/dynamic-form/components/dynamic-form/dynamic-form.component';
import { RequestService } from '@appDir/shared/services/request.service';
import { PatientListingUrlsEnum } from '@appDir/front-desk/patient/patient-listing/PatientListing-Urls-Enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { ParamQuery, OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';
import { removeEmptyAndNullsFormObject } from '@appDir/shared/utils/utils.helpers';

@Component({
  selector: 'app-choose-patient',
  templateUrl: './choose-patient.component.html',
  styleUrls: ['./choose-patient.component.scss']
})
export class ChoosePatientComponent extends PermissionComponent implements OnInit {

  constructor( aclService: AclService,private activeModal: NgbActiveModal, private fb: FormBuilder,
	 protected router: Router, protected requestService: RequestService,private caseFlowService: CaseFlowServiceService,public datePipeService:DatePipeFormatService)
   {
	   super(aclService)
    }

  @ViewChild(DynamicFormComponent) component: DynamicFormComponent;
  page: Page = new Page();
  form: FormGroup;
  patients = [];
  fieldConfig: FieldConfig[] = []
  paramQuery: ParamQuery;
  loadSpin: boolean = false;
  ngOnInit() {

    this.fieldConfig = [
      new DivClass([
        new InputClass('Chart ID', 'id', InputTypes.text, '', [], '', ['col-sm-6'], { mask: '000-00-0000', skip_validation: true }),
        new InputClass('Patient Name', 'name', InputTypes.text, '', [], '', ['col-sm-6']),
        new InputClass('DOB (mm/dd/yyyy)', 'dob', InputTypes.date, '', [], '', ['col-sm-6','parent-horizontal-label']),
        new InputClass('Primary Phone No.', 'phone_no', InputTypes.text, '', [], '', ['col-sm-6'], { mask: '000-000-0000', skip_validation: true }),
      ], ['row']),
      new DivClass([
        new ButtonClass('Search', ['btn', 'btn-success w-100', 'float-right  '], ButtonTypes.submit, null, { button_classes: ['col-12 col-sm-3 mb-3 mb-sm-0'] }),
        new ButtonClass('Reset', ['btn', 'btn-primary w-100'], ButtonTypes.button, this.resetForm.bind(this), { button_classes: ['col-12 col-sm-3'] })
      ], ['row mb-3', 'justify-content-center'])
    ]
    this.page = { size: 10, pageNumber: 0, totalElements: 10, totalPages: 4 }
    // patientId=0&name=&dob=&cellPhone=&page=1&per_page=10&pagination=1&order_by=DESC
    this.paramQuery = { pagination: true, page: this.page.pageNumber + 1, per_page: this.page.size, order_by: OrderEnum.DEC, filter: false, } as ParamQuery

    this.setPage()

  }
  resetForm() {

    this.form.reset()
    this.paramQuery = removeEmptyAndNullsFormObject({ ...this.paramQuery, ...this.form.value });
    this.page.pageNumber = 1
    this.setPage()
  }
  onPageChange(event) {
    this.page.pageNumber = event.offset;
    this.paramQuery = { pagination: true, page: this.page.pageNumber + 1, per_page: this.page.size, order_by: OrderEnum.DEC, filter: false } as ParamQuery
    this.setPage()
  }
  setPage() {

    this.loadSpin = true;
    // let url = 'patient/get-all?patientId=0&name=&dob=&cellPhone=&page=1&per_page=10&pagination=1&order_by=DESC'
    this.requestService.sendRequest(PatientListingUrlsEnum.Patient_Get, 'get', REQUEST_SERVERS.kios_api_path, this.paramQuery).subscribe(data => {
      this.loadSpin = false;
      this.patients = data['result']['data']
      this.page.totalElements = data['result']['total']
    })
  }
  ngAfterViewInit() {
    this.form = this.component.form;
  }
  close() {
    this.activeModal.close()
  }
  submit = (form) => {

    this.paramQuery = { ...this.paramQuery, ...removeEmptyAndNullsFormObject(this.form.value) };
    let chart_id = form.id as string;
    if (chart_id) {
      this.form.patchValue({ id: `0`.repeat(9 - chart_id.length) + chart_id })
    }
    this.setPage()
  }
  getPatient(event) {
  }
  addPatient() {
    this.router.navigate(['/front-desk/patients/patient-add'])
    this.activeModal.close()
  }
  choosePatient(row) {
	this.caseFlowService.resetCaseAndDataObject();
    this.activeModal.close()
    this.router.navigate(['/front-desk/cases/create/' + row.id])
  }
}
