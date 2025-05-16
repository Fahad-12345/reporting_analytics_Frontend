import { ShippingUrlsEnum } from './../../shipping-urls-enum';
import { Validators } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RequestService } from '@appDir/shared/services/request.service';
import { ToastrService } from 'ngx-toastr';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { ShippingDetail } from '../../shipping-detail.model';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { removeEmptyAndNullsFormObject } from '@appDir/shared/utils/utils.helpers';
@Component({
  selector: 'app-add-update-shipping',
  templateUrl: './add-update-shipping.component.html',
  styleUrls: ['./add-update-shipping.component.scss']
})
export class AddUpdateShippingComponent implements OnInit {
  @Output() formSubmited = new EventEmitter();
  public shippingForm: FormGroup;
  @Input() shippingDetails:ShippingDetail = new ShippingDetail();
  public loadSpin: boolean = false;
  isLoading = false;
  hasId = false;
  modalRef: NgbModalRef;
  subscription: Subscription[] = [];
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
  
  constructor(private fb:FormBuilder,private toastrService: ToastrService,private CanDeactivateModelComponentService: CanDeactivateModelComponentService,protected requestService: RequestService) { }

  ngOnInit() {
    this.shippingForm = this.fb.group({
      id:null,
      shipping_detail : ['',Validators.required],
      unit_price : ['0',[Validators.required,Validators.max(999999.99)]],
      comment:['']
    });
    if(!this.checkObjectEmpty(this.shippingDetails) && this.shippingDetails != null){
      this.hasId = true;
      this.shippingForm.patchValue(this.shippingDetails);
    }
  }
  checkObjectEmpty(obj){
    for(var prop in obj){
      if(obj.hasOwnProperty(prop)){
        return false;
      }
    }
    return true;
  }
  onSubmit(shippingForm:FormGroup){
    if(shippingForm.controls.id.value == null && !this.hasId){
      this.add(shippingForm.getRawValue());      
    }
    else{
      this.update(shippingForm.getRawValue());   
    }
  }
  add(form){
    console.log(form)
    this.subscription.push(
      this.requestService.sendRequest(ShippingUrlsEnum.Shipping_List_Post,'POST',REQUEST_SERVERS.fd_api_url,removeEmptyAndNullsFormObject(form),).subscribe(
        (res) =>{
          this.shippingForm.reset();
          this.formSubmited.emit(true);
          this.toastrService.success('Successfully Added','Success')
          this.isLoading = false;
        },
        (err) =>{
          this.isLoading = false;
        })
    )
  }
  update(formValues){
    const reqObj = new ShippingDetail({...formValues,...{realObject:this.shippingDetails}});
    let Obj = reqObj.getObject();
    // console.log(removeEmptyAndNullsFormObject(Obj))
    this.subscription.push(
      this.requestService.sendRequest(
        ShippingUrlsEnum.Shipping_List_Put,
        'PUT',
        REQUEST_SERVERS.fd_api_url,
        Obj
      ).subscribe((res:any)=>{
          this.shippingForm.reset();
          this.formSubmited.emit(true);
          this.toastrService.success(res.message, 'Success');
          this.isLoading = false;
      },
      (err) =>{
        this.isLoading = false;
      })
    )
  }
  closeModal(){
    if ((this.shippingForm.dirty && this.shippingForm.touched)) {
			this.CanDeactivateModelComponentService.canDeactivate().then(res => {
				let result = res;
				if (res) {
					this.shippingForm.reset();
          this.formSubmited.emit(true)
				}
				else {
					return true;
				}
			});
		}
		else {
			this.shippingForm.reset();
			this.formSubmited.emit(true)
		}
  }
  isDisabled() {
		if(this.isLoading || this.shippingForm.invalid) {
			return true;
		} else {
			return false;
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
