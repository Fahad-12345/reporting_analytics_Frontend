import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EnumApiPath } from '@appDir/front-desk/billing/Models/searchedKeys-modal';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, Subscription } from 'rxjs';
import { EmpInsuLinkageEnum } from '../emp-insu-linkage';
import { ToastrService } from 'ngx-toastr';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { NgSelectShareableComponent } from '@appDir/shared/ng-select-shareable/ng-select-shareable.component';

@Component({
  selector: 'app-add-edit-employer-insurance-link',
  templateUrl: './add-edit-employer-insurance-link.component.html',
  styleUrls: ['./add-edit-employer-insurance-link.component.scss']
})
export class AddEditEmployerInsuranceLinkComponent implements OnInit {
  loadSpin: boolean = false;
  title: string = 'Add';
  modelSubmit: string = 'Save & Continue';
  addEditEmpInsurLinkForm: FormGroup;
  insurFieldDisable: boolean = true;
  emplFieldDisable: boolean = false;
  insurAPIHitON: boolean = false;
  subscription: Subscription[] = [];
  @ViewChild('insurNgSelect') insuranceNgSelect: NgSelectShareableComponent;
  selectedMultipleFieldFiter: any = {
    'employer_id': [],
    'billing_insurance_id': []
  };
  EnumApiPath = EnumApiPath;
  requestServerpath = REQUEST_SERVERS;
  eventsSubject: Subject<any> = new Subject<any>();
  ngSelectedInsurance: Subject<any> = new Subject<any>();
  @Input() public employer_Insurance_data: any;
  @Input() public employer_Insurance_id: any;
  constructor(private fb?: FormBuilder, public activeModal?: NgbActiveModal, private customDiallogService?: CustomDiallogService, private toaster?: ToastrService, protected requestService?: RequestService) {
    this.addEditEmpInsurLinkForm = this.initEmpInsuLinkForm();
  }
  ngOnInit() {
    if (this.employer_Insurance_id) {
      this.title = 'Update';
      this.modelSubmit = 'Update';
      this.insurAPIHitON = true;
      this.emplFieldDisable = true;
      this.insurFieldDisable = false;
      this.employer_ids_getter.setValue(this.employer_Insurance_data?.employer_id);
      this.insurance_ids_getter.setValue(this.employer_Insurance_data?.billing_insurance_id);
      this.selectedMultipleFieldFiter['employer_id'] = [this.employer_Insurance_data?.employer];
      this.selectedMultipleFieldFiter['billing_insurance_id'] = [this.employer_Insurance_data?.insurance];
    }
  }
  initEmpInsuLinkForm() {
    return this.fb.group({
      employer_id: ['', Validators.required],
      billing_insurance_id: ['', Validators.required]
    })
  }
  OnSubmit(formValue) {
    this.addEditEmpInsurLinkForm.markAllAsTouched();
    if (this.addEditEmpInsurLinkForm.invalid) {
      return;
    }
    let body = {
      employer_insurance_linkage: [
        { ...formValue }
      ]
    }
    if (this.employer_Insurance_id) {
      let bodyObj = {
        employer_insurance_links: [
          {
            id: this.employer_Insurance_id,
            billing_insurance_id: formValue['billing_insurance_id']
          }
        ]
      }
      this.UpdateLinkage(bodyObj);
    } else {
      this.addNewLinkage(body);
    }
  }
  UpdateLinkage(paramBody) {
    this.subscription.push(
      this.requestService.sendRequest(
        EmpInsuLinkageEnum.Emp_Insu_Linkage, 'put', REQUEST_SERVERS.fd_api_url, { ...paramBody })
        .subscribe((res) => {
          if (res?.status) {
            this.activeModal.close('update');
            this.toaster.success('Saved Successfully', 'Success');
          }
        })
    )
  }
  addNewLinkage(paramBody) {
    this.subscription.push(
      this.requestService.sendRequest(
        EmpInsuLinkageEnum.Emp_Insu_Linkage, 'post', REQUEST_SERVERS.fd_api_url, { ...paramBody })
        .subscribe((res) => {
          if (res?.status) {
            this.activeModal.close('add');
            this.toaster.success('Saved Successfully', 'Success');
          }
        })
    )
  }
  get employer_ids_getter() {
    return this.addEditEmpInsurLinkForm.controls['employer_id'];
  }
  get insurance_ids_getter() {
    return this.addEditEmpInsurLinkForm.controls['billing_insurance_id'];
  }
  valueSelectionChangeEmpl(event, type) {
    if (event && event['data']) {
      this.insurFieldDisable = false;
      this.addEditEmpInsurLinkForm.markAsDirty();
      this.addEditEmpInsurLinkForm.markAsTouched();
      this.addEditEmpInsurLinkForm.controls[type].setValue(event['formValue']);
      this.eventsSubject.next(true);
    } else {
      this.addEditEmpInsurLinkForm.controls[type].setValue(null);
      this.insurFieldDisable = true;
      this.eventsSubject.next(true);
      this.addEditEmpInsurLinkForm.controls['billing_insurance_id'].setValue(null);
    }
  }
  valueSelectionChangeInsu(event, type, multiple) {
    if (multiple) {
      if (event && event['data'] && event['data'].length) {
        let currInsur = event['data'][event['data'].length - 1].realObj;
        if (currInsur['isLinked']) {
          this.toaster.error('Looks like the insurance is already linked with the selected employer.', 'Error');
          this.insuranceNgSelect.searchForm.patchValue({ common_ids: this.addEditEmpInsurLinkForm.controls[type].value });
          this.insurAPIHitON = true;
          return
        }
        this.addEditEmpInsurLinkForm.markAsDirty();
        this.addEditEmpInsurLinkForm.markAsTouched();
        this.addEditEmpInsurLinkForm.controls[type].setValue(event['formValue']);
        this.selectedMultipleFieldFiter['billing_insurance_id'] = event['data'].length?[...event['data'].map(dta => dta['realObj'])]:[];
        this.insurAPIHitON = false;
      } else {
        this.addEditEmpInsurLinkForm.controls[type].setValue(null);
        this.addEditEmpInsurLinkForm.controls['billing_insurance_id'].setValue(null);
      }
    } else {
      if (event && event['data']) {
        let currInsur = event['data']['realObj'];
        if (currInsur['isLinked']) {
          this.toaster.error('Looks like the insurance is already linked with the selected employer.', 'Error');
          this.insuranceNgSelect.searchForm.patchValue({ common_ids: this.addEditEmpInsurLinkForm.controls[type].value });
          this.insurAPIHitON = true;
          return
        }
        this.addEditEmpInsurLinkForm.markAsDirty();
        this.addEditEmpInsurLinkForm.markAsTouched();
        this.addEditEmpInsurLinkForm.controls[type].setValue(event['formValue']);
        this.selectedMultipleFieldFiter['billing_insurance_id'] = [] ;
        this.selectedMultipleFieldFiter['billing_insurance_id'] = [event?.data?.['realObj']];
      } else {
        this.addEditEmpInsurLinkForm.controls[type].setValue(null);
        this.addEditEmpInsurLinkForm.controls['billing_insurance_id'].setValue(null);
      }
    }
  }
  clearForm(bool) {
    if (this.addEditEmpInsurLinkForm.dirty && this.addEditEmpInsurLinkForm.touched && (this.employer_ids_getter.value || this.insurance_ids_getter.value)) {
      this.customDiallogService.confirm('Discard Changes', 'Do you want to discard changes?', 'Yes', 'No').then((confirm) => {
        if (confirm) {
          this.activeModal.close(bool);
        }
      })
    }
    else {
      this.activeModal.close(bool);
    }
  }
  getInsurExtraParams() {
    return {
      employer_ids: [this.employer_ids_getter.value]
    }
  }
}
