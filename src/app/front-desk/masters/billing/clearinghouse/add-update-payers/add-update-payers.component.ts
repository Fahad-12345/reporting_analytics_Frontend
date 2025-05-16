import { Component, ElementRef, Input, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { EnumApiPath } from '@appDir/front-desk/billing/Models/searchedKeys-modal';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, Subscription } from 'rxjs';
import { ClearinghouseEnum, removeEmptyAndNullsAndDefaultsFormObject } from '../CH-helpers/clearinghouse';
import { isObjectEmpty, removeEmptyAndNullsFormObject } from '@appDir/shared/utils/utils.helpers';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { ToastrService } from 'ngx-toastr';
import { Page } from '@appDir/front-desk/models/page';
import { CHcustomValidators } from '../CH-helpers/chcustom-validators';

@Component({
  selector: 'app-add-update-payers',
  templateUrl: './add-update-payers.component.html',
  styleUrls: ['./add-update-payers.component.scss']
})
export class AddUpdatePayersComponent implements OnInit {
  title = 'Add';
  @Input() public payer_id: string;
  @Input() public addNewChMode: boolean = false;
  @Input() public clearing_house: any;
  @Input() public payer_log: string;
  @ViewChildren('payerSelector') payerSelector: QueryList<any>;
  @ViewChild('bodyscroll') scrolltobottom: ElementRef;
  insurFieldDisable: boolean = false;
  requestServerpath = REQUEST_SERVERS;
  EnumApiPath = EnumApiPath;
  payersForm: FormGroup;
  statesList = [];
  subscription: Subscription[] = [];
  submitbtn: string = 'Save';
  showPayersForm: boolean = false;
  showconfirmationdialog: boolean = false;
  labelCheck: boolean = false;
  lstInsurance: any[] = [];
  insuDataNew: any[] = [];
  insuPage: Page = new Page();
  searchValue = '';
  dialogMessage = 'Are you sure? Do you really want to discard the changes you made?'
  EditMode: boolean = false;
  loadSpin: boolean = false;
  insForceApiHit: boolean = false;
  selectInsurance = [];
  states_List = [];
  selectInsurance_name = '';
  payer_info: any;
  eventsSubject: Subject<any> = new Subject<any>();
  ngSelectedInsurance: Subject<any> = new Subject<any>();
  dropdownSettings: any = {};
  constructor(public activeModal?: NgbActiveModal, private el?: ElementRef, private toaster?: ToastrService, private customDiallogService?: CustomDiallogService, private fb?: FormBuilder, protected requestService?: RequestService,) { }
  ngOnInit() {
    this.initPayersForm();
    if (this.payer_log) {
      this.AddOrEditPayerInfo(this.payer_log);
    }
    this.dropdownSetting();
    this.getStatesList();
  }
  initPayersForm(disabled = true) {
    this.payersForm = this.fb.group({
      billing_insurance_id: ['', Validators.required],
      payersInfo: this.fb.array([this.createPayers(0)])
    });
    if (disabled) {
      this.payersInfo.disable();
    }
  }

  AddOrEditPayerInfo(payer_log) {
    if (payer_log == 'payer_update_by_id') {
      this.initPayersForm(false);
      this.getPayerInfo(this.payer_id);
      this.loadSpin = true;
      this.EditMode = true;
      this.submitbtn = 'Update';
      this.title = 'Update';
      this.showPayersForm = true;
    }
  }
  createPayers(index?): FormGroup {
    return this.fb.group({
      payer_name: [''],
      payer_id: ['', Validators.compose([Validators.required, c => CHcustomValidators.checkDuplicatePayerIds(c)])],
      states: [[], CHcustomValidators.requiredWithDefault([])],
      professional: [-1],
      institutional: [-1],
      pharmacy_Rx: [-1],
      automotive: [-1, Validators.compose([CHcustomValidators.requiredWithDefault(-1), c => CHcustomValidators.BothNotNull(c)])],
      worker_compensation: [-1, Validators.compose([CHcustomValidators.requiredWithDefault(-1), c => CHcustomValidators.BothNotNull(c)])],
      eob_835: [-1],
      supported_transaction: [{ value: '835P', disabled: true }]
    })
  }
  get payersInfo(): FormArray {
    return <FormArray>this.payersForm.get('payersInfo');
  }
  cancel(bool) {
    if ((this.payersForm.dirty && this.payersForm.touched) || ((this.payersInfo.dirty && this.payersInfo.touched))) {
      this.customDiallogService.confirm('Discard Changes?', 'Are you sure? Do you really want to discard the changes you made?', 'Yes', 'No')
        .then((confirmed) => {
          if (confirmed) {
            this.activeModal.close(bool);
          }
        })
        .catch();
    } else {
      this.activeModal.close(bool);
    }
  }
  getStatesList() {
    this.subscription.push(
      this.requestService.sendRequest(
        ClearinghouseEnum.get_States_List, 'get', REQUEST_SERVERS.fd_api_url, { order: 'asc' })
        .subscribe((res) => {
          this.statesList = res && res['result'] && res['result']['data'] ? res['result']['data'] : [];
        })
    )
  }
  dropdownSetting() {
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'code',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
      enableCheckAll: true,
      placeholder:''
    };
  }
  getPayerInfo(payer_id) {
    this.subscription.push(
      this.requestService.sendRequest(
        ClearinghouseEnum.Get_Payers_Info, 'get', REQUEST_SERVERS.fd_api_url, { payer_ids: [payer_id] })
        .subscribe((res) => {
          this.loadSpin = false;
          if (res && res['result'] && res['result']['data']) {
            let payer_data = res && res['result'] && res['result']['data'] ? res['result']['data'] : [];
            if (payer_data.length > 0) {
              this.setDefaultEditData(payer_data[0]);
            }
          }
        }, (err) => {
          this.loadSpin = false;
        })
    )
  }
  updatePayer(payerInfo) {
    this.subscription.push(
      this.requestService.sendRequest(
        ClearinghouseEnum.Get_Payers_Info, 'put', REQUEST_SERVERS.fd_api_url, { ...payerInfo })
        .subscribe((res) => {
          console.log(res)
          if (res) {
            if (res['flag']) {
              this.customDiallogService.confirm('Update Confirmation?', res['message'], 'Yes', 'No')
                .then((confirm) => {
                  if (confirm) {
                    this.subscription.push(
                      this.requestService.sendRequest(
                        ClearinghouseEnum.Get_Payers_Info, 'put', REQUEST_SERVERS.fd_api_url, { ...payerInfo, force: true })
                        .subscribe((resp) => {
                          if (resp && resp['result'] && resp['result']['data'] && resp['result']['data'].length > 0 && resp['status']) {
                            this.activeModal.close(resp['result']['data'][0]);
                            this.toaster.success('Updated Successfully', 'Success');
                          }
                        })
                    )
                  }
                })
            } else {
              if (res && res['result'] && res['result']['data'] && res['result']['data'].length > 0 && res['status']) {
                this.activeModal.close(res['result']['data'][0]);
                this.toaster.success('Updated Successfully', 'Success');
              }
            }
          }
        })
    )
  }
  setDefaultEditData(payer) {
    this.insurFieldDisable = true;
    if (payer) {
      this.payer_info = payer;
      this.payersForm.get('billing_insurance_id').setValue(payer.billing_insurance_id)
      this.selectInsurance = payer['insurance'] ? [{
        id: payer['insurance'].id,
        name: payer['insurance'].insurance_name
      }] : [];
      console.log(payer.states)
      let states_ids = payer.states.map(state => state.id);
      this.states_List = [...payer.states]
      let UpdatedPayer = {
        payer_name: payer.payer_name,
        payer_id: payer.payer_id,
        states: payer.states,
        professional: (payer.professional == 1 || payer.professional == 0) ? payer.professional : -1,
        institutional: (payer.institutional == 1 || payer.institutional == 0) ? payer.institutional : -1,
        pharmacy_Rx: (payer.pharmacy_Rx == 1 || payer.pharmacy_Rx == 0) ? payer.pharmacy_Rx : -1,
        automotive: payer.automotive,
        worker_compensation: payer.worker_compensation,
        eob_835: (payer.eob_835 == 1 || payer.eob_835 == 0) ? payer.eob_835 : -1,
        supported_transaction: '835P'
      }
      this.payersInfo.setValue([
        UpdatedPayer
      ]);
    }
  }
  addPayer(index) {
    this.payersInfo.insert(0, this.createPayers(index));
  }
  deletePayer(index) {
    if (this.payersInfo.length == 1) {
      this.toaster.error('At least one Payer info is required.', 'Error')
    } else {
      this.customDiallogService.confirm('Discard Changes?', 'Are you sure? Do you really want to discard the changes you made?', 'Yes', 'No')
        .then((confirmed) => {
          if (confirmed) {
            this.payersInfo.removeAt(index);
          }
        })
        .catch()
    }
  }
  save() {
    if (this.payersForm.invalid) {
      this.payersForm.markAllAsTouched();
      let element = this.payerSelector['_results'].filter(el => {
        return el['nativeElement']['className'].includes('ng-invalid')
      });
      let elm = element[element.length - 1].nativeElement['parentElement'] as HTMLElement;
      elm?.scrollIntoView();
      return
    }
    let payesInfo = this.payersForm.getRawValue();
    payesInfo = payesInfo && payesInfo.payersInfo?.map(payer => removeEmptyAndNullsAndDefaultsFormObject(payer));
    payesInfo.forEach(payr => payr['states'] = payr['states']?.map(states => states['id']));
    payesInfo.reverse();
    let payerInfoSaveData = {
      billing_insurance_id: this.payersForm?.getRawValue()?.billing_insurance_id,
      payers: payesInfo
    }
    if (!this.EditMode) {
      if (!isObjectEmpty(this.clearing_house) && !this.addNewChMode) {
        this.addPayerInExistingCH(payerInfoSaveData);
      } else if (this.addNewChMode) {
        this.submit(payerInfoSaveData)
      }
    } else {
      payerInfoSaveData['payers'].forEach(payer => {
        payer['clearing_house_id'] = this.payer_info['clearing_house_id'],
          payer['id'] = this.payer_info['id']
      });
      this.updatePayer(payerInfoSaveData);
    }
  }
  insuranceSelectionChange($event) {
    let value = this.payersForm.controls['billing_insurance_id'].value;
    let formGroup = (this.payersInfo?.controls[this.payersInfo?.controls?.length - 1]) as FormGroup;
    if ($event && $event['data']) {
      if (value && (this.payersInfo.dirty || this.payersInfo.touched)) {
        this.customDiallogService.confirm('Discard Changes?', 'Are you sure? Do you really want to discard the changes you made?', 'Yes', 'No').then(confirmed => {
          if (confirmed) {
            this.showPayersForm = true;
            this.initPayersForm(false);
            this.payersForm.controls['billing_insurance_id'].setValue($event.formValue);
          } else {
            this.ngSelectedInsurance.next({
              status: true,
              value
            });
            this.payersInfo.enable();
          }
        });
      } else {
        this.showPayersForm = true;
        this.payersForm.controls['billing_insurance_id'].setValue($event.formValue);
      }
      this.payersInfo.enable();
      formGroup.controls['supported_transaction'].disable();
      this.payersInfo.updateValueAndValidity();
    }
  }
  onClearInsurance($event) {
    let value = this.payersForm.controls['billing_insurance_id'].value;
    if (this.payersInfo.dirty || this.payersInfo.touched) {
      this.customDiallogService.confirm('Discard Changes?', 'Are you sure? Do you really want to discard the changes you made?', 'Yes', 'No').then(confirmed => {
        if (confirmed) {
          this.showPayersForm = false;
          this.payersForm.reset();
          this.payersForm.markAsPristine();
          this.payersForm.markAsUntouched();
          this.initPayersForm();
          this.selectInsurance = [];
        } else {
          this.showPayersForm = true
          this.ngSelectedInsurance.next({
            status: true,
            value
          });
        }
      });
    } else {
      this.initPayersForm();
    }
  }
  submit(formValue) {
    let clearinghouseInfo = {
      ...formValue,
      ...this.clearing_house
    }
    let body = {
      clearing_houses: [
        { ...removeEmptyAndNullsFormObject(clearinghouseInfo) }
      ]
    }
    this.subscription.push(
      this.requestService.sendRequest(
        ClearinghouseEnum.Add_Update_Clearinghouse, 'post', REQUEST_SERVERS.fd_api_url, { ...body })
        .subscribe((res) => {
          if (res && res['result'] && res['result']['data']) {
            this.activeModal.close(res['result']['data']);
            this.toaster.success('Saved Successfully', 'Success');
          }
        })
    )
  }
  addPayerInExistingCH(payers) {
    let body =
    {
      clearing_house_id: this.clearing_house['id'],
      ...removeEmptyAndNullsAndDefaultsFormObject(payers)
    }
    this.subscription.push(
      this.requestService.sendRequest(
        ClearinghouseEnum.Get_Payers_Info, 'post', REQUEST_SERVERS.fd_api_url, { ...body })
        .subscribe((res) => {
          if (res && res['result'] && res['result']['data'] && res['result']['data'].length > 0 && res['status']) {
            this.activeModal.close(res['result']['data'][0]);
            this.toaster.success('Saved Successfully', 'Success');
          } else {
            this.toaster.error(res['errors'], 'Error');
          }
        })
    )
  }
  onChange($event, controlName, i) {
    this.payersInfo.controls[i].get(controlName).updateValueAndValidity()
  }
  dropdownOpenEvent(ev, open, index) {
    if (index == (this.payersInfo.length - 1) || index == (this.payersInfo.length - 2)) {
      this.scrolltobottom.nativeElement.scroll({
        top: this.scrolltobottom.nativeElement.scrollHeight,
        left: 0,
        behavior: 'smooth'
      });
    }
  }
}
