import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { AddUpdatePayersComponent } from '../add-update-payers/add-update-payers.component';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { ClearinghouseEnum } from '../CH-helpers/clearinghouse';
import { removeEmptyAndNullsFormObject } from '@appDir/shared/utils/utils.helpers';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-clearinghouse-form',
  templateUrl: './clearinghouse-form.component.html',
  styleUrls: ['./clearinghouse-form.component.scss']
})
export class ClearinghouseFormComponent implements OnInit, OnChanges {
  subscription: Subscription[] = [];
  modalRef: NgbModalRef;
  clearinghouseForm: FormGroup;
  title: any = 'Add';
  editMode: boolean = false;
  @Input() clearinghouse: any;
  @Output() clearinghouseFormEmit = new EventEmitter<any>();
  constructor(private fb: FormBuilder, private modalService: NgbModal, private toaster: ToastrService,
    private CanDeactivateModelComponentService: CanDeactivateModelComponentService, protected requestService?: RequestService) {
    this.initclearinghouseForm();
  }
  ngOnInit() {
  }
  ngOnChanges(changes: SimpleChanges): void {
    let change: SimpleChange = changes['clearinghouse'];
    if (change && change['currentValue']) {
      this.editMode = true;
      this.title = 'Update';
      this.clearinghouseForm.patchValue({ ...this.clearinghouse });
    }
  }
  initclearinghouseForm() {
    this.clearinghouseForm = this.fb.group({
      name: ['', [Validators.required]],
      short_name: ['', [Validators.required]],
      comment: ['']
    });
  }
  get clearinghouseformGetter() {
    return this.clearinghouseForm.controls;
  }
  get clearinghousenameGetter() {
    return this.clearinghouseformGetter['name'];
  }
  get clearinghousenameValueGetter() {
    return this.clearinghouseformGetter['name'].value;
  }
  get clearinghouseshort_nameValueGetter() {
    return this.clearinghouseformGetter['short_name'].value;
  }
  get clearinghouseshort_nameGetter() {
    return this.clearinghouseformGetter['short_name'];
  }
  get clearinghousecommentsValueGetter() {
    return this.clearinghouseformGetter['comment'].value;
  }
  cancelForm() {
    if (this.clearinghouseForm.dirty && this.clearinghouseForm.touched) {
      this.CanDeactivateModelComponentService.canDeactivate().then(res => {
        if (res) {
          this.clearinghouseFormEmit.emit();
        }
        else {
          return true;
        }
      });
    }
    else {
      this.clearinghouseFormEmit.emit();
    }
  }
  submit(formValue) {
    let clearinghouseInfo = {
      ...formValue,
      ...this.clearinghouseForm.getRawValue()
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
            this.initclearinghouseForm();
            this.clearinghouseFormEmit.emit(res['result']['data']);
            this.toaster.success('Saved Successfully', 'Success');
          }
        })
    )
  }
  update(formValue) {
    let body = {
      clearing_houses: [
        { id: this.clearinghouse.id, ...formValue }
      ]
    }
    this.subscription.push(
      this.requestService.sendRequest(
        ClearinghouseEnum.Add_Update_Clearinghouse, 'put', REQUEST_SERVERS.fd_api_url, { ...body })
        .subscribe((res) => {
          if (res && res['result'] && res['result']['data']) {
            this.initclearinghouseForm();
            this.clearinghouseFormEmit.emit(res['result']['data']);
            this.toaster.success('Updated Successfully', 'Success');
          }
        })
    )
  }
  AddPayersInfo() {
    let body = {
      clearing_houses: [
        { ...removeEmptyAndNullsFormObject(this.clearinghouseForm.getRawValue()) }
      ]
    }
    this.subscription.push(
      this.requestService.sendRequest(
        ClearinghouseEnum.Add_Update_Clearinghouse, 'post', REQUEST_SERVERS.fd_api_url, { ...body })
        .subscribe((res) => {
          if (res && res['status'] && res['message'] == 'Name is available') {
            let payerModalRef = this.modalService.open(AddUpdatePayersComponent, {
              size: 'xl',
              backdrop: 'static',
              keyboard: false,
              windowClass: 'modal_extraDOc body-scroll add-payer-modal',
            });
            payerModalRef.componentInstance.clearing_house = { ...this.clearinghouseForm.getRawValue() }
            payerModalRef.componentInstance.addNewChMode = true;
            payerModalRef.result.then((res) => {
              if (res) {
                this.initclearinghouseForm();
                this.clearinghouseFormEmit.emit(res);
              }
            })
          }
        })
    )

  }
}
