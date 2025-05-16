import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { Subscription } from 'rxjs';
import { RequestService } from '@appDir/shared/services/request.service';
import { InventoryEnumUrls } from '../../inventory-enum-urls';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { ToastrService } from 'ngx-toastr';
import { removeEmptyAndNullsFormObject } from '@appDir/shared/utils/utils.helpers';
import { InventoryDetailModel } from '../../inventory.model';
@Component({
  selector: 'app-add-update-inventory-form',
  templateUrl: './add-update-inventory-form.component.html',
  styleUrls: ['./add-update-inventory-form.component.scss']
})
export class AddUpdateInventoryFormComponent implements OnInit {
  @Output() formSubmited = new EventEmitter();
  public inventoryForm: FormGroup;
  @Input() inventoryDetails:InventoryDetailModel = new InventoryDetailModel();
  public loadSpin: boolean = false;
  isLoading = false;
  hasId = false;
  modalRef: NgbModalRef;
  subscription: Subscription[] = [];
  inventoryName: string;
  customCurrencyMaskConfig = {
		align: 'left',
		allowNegative: false,
		allowZero: true,
		decimal: '.',
		precision: 2,
		prefix: '',
		suffix: '',
		thousands: ',',
		nullable: true,
	};
  inventoryDetailsprev
  constructor(private fb:FormBuilder,private toastrService: ToastrService,private CanDeactivateModelComponentService: CanDeactivateModelComponentService,protected requestService: RequestService) { }

  ngOnInit() {
    this.inventoryForm = this.fb.group({
      id:null,
      name : ['',Validators.required],
      description: [''],
      unit_price:['0',[Validators.required,Validators.max(999999.99)]],
      quantity:['',[Validators.required,Validators.max(999999),Validators.min(1)]],
      comment:['']
    })
    if(!this.checkObjectEmpty(this.inventoryDetails) && this.inventoryDetails != null){
      this.hasId = true;
      this.inventoryForm.patchValue(this.inventoryDetails);
    }
  }
  crossClose() {
		
	}
  checkObjectEmpty(obj){
    for(var prop in obj){
      if(obj.hasOwnProperty(prop)){
        return false;
      }
    }
    return true;
  }
  onSubmit(inventoryForm:FormGroup){
    if(inventoryForm.valid){
      if(inventoryForm.controls['id'].value == null && !this.hasId){
        this.add(inventoryForm.getRawValue());
      }
      else{
      
        this.update(inventoryForm.getRawValue());
      }
    }

  }
  add(form) {
		this.subscription.push(
			this.requestService
				.sendRequest(
					InventoryEnumUrls.Inventory_List_Post,
					'POST',
					REQUEST_SERVERS.fd_api_url,
					removeEmptyAndNullsFormObject(form),
				)
				.subscribe(
					(res) => {
						this.inventoryForm.reset();
            this.formSubmited.emit(true);
						this.toastrService.success("Successfully Added", 'Success');
						this.isLoading = false;
					},
					(err) => {
						this.isLoading = false;
					},
				),
		);
	}
  
	update(form) {
    const reqObj = new InventoryDetailModel({...form, ...{realObject: this.inventoryDetails}});
    let reqObj1 = reqObj.getObject()
		this.subscription.push(
			this.requestService
				.sendRequest(
					InventoryEnumUrls.Inventory_List_Put,
					'PUT',
					REQUEST_SERVERS.fd_api_url,
          reqObj1
				)
				.subscribe(
					(res : any) => {
						let msg;
							this.inventoryForm.reset();
              this.formSubmited.emit(true);
							this.toastrService.success(res.message, 'Success');
							this.isLoading = false;
					},
					(err) => {
						this.isLoading = false;
					},
				),
		);
	}
getOnlyUpdatedValues(formOject){
  var changedValue = {};

  Object.keys(formOject.controls).forEach(key =>{
    if(formOject.controls[key].dirty){
      changedValue[key] = formOject.controls[key].value;
    }
  })
  return changedValue;
}
  closeModal(){
    if ((this.inventoryForm.dirty && this.inventoryForm.touched)) {
			this.CanDeactivateModelComponentService.canDeactivate().then(res => {
				let result = res;
				if (res) {
					this.inventoryForm.reset();
          this.formSubmited.emit(true)
				}
				else {
					return true;
				}
			});
		}
		else {
			this.inventoryForm.reset();
			this.formSubmited.emit(true)
		}
  }
  isDisabled() {
		if(this.isLoading || this.inventoryForm.invalid) {
			return true;
		} else {
			return false;
		}
	}
  filterInt(value) {
    if (/^[-+]?(\d+|Infinity)$/.test(value)) {
      return Number(value)
    } else {
      return NaN
    }
  }
  unsubscribeSubscriptions(){
    this.subscription.forEach(sub =>{
      sub.unsubscribe()
    });
  }
  ngOnDestroy(): void {
    this.unsubscribeSubscriptions()
  }
}
