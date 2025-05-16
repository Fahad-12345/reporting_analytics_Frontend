import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { TaxDetail } from '../../tax-detail.model';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { TaxUrlsEnum } from '../../tax-urls-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { removeEmptyAndNullsFormObject } from '@appDir/shared/utils/utils.helpers';
@Component({
  selector: 'app-add-update-tax',
  templateUrl: './add-update-tax.component.html',
  styleUrls: ['./add-update-tax.component.scss']
})
export class AddUpdatetaxComponent implements OnInit {
  @Output() formSubmited = new EventEmitter();
  public taxForm: FormGroup;
  @Input() taxDetails:TaxDetail = new TaxDetail();
  public loadSpin: boolean = false;
  isLoading = false;
  hasId = false;
  modalRef: NgbModalRef;
  subscription: Subscription[] = [];
  taxName: string;
  customCurrencyMaskConfig = {
		align: 'left',
		allowNegative: false,
		allowZero: true,
		decimal: '.',
		precision: 3,
		prefix: '',
		suffix: '',
		thousands: ',',
		nullable: true,
	};
  constructor(private fb:FormBuilder,private toastrService: ToastrService,private CanDeactivateModelComponentService: CanDeactivateModelComponentService,protected requestService: RequestService) { }

  ngOnInit() {
    this.taxForm = this.fb.group({
      id:null,
      tax_name : ['',Validators.required],
      unit_price : [null,[Validators.required,Validators.max(999999.999),Validators.min(0.001)]],
      description : [''],
      comment:['']
    });
    if(!this.checkObjectEmpty(this.taxDetails) && this.taxDetails != null){
      this.hasId = true;
      this.taxForm.patchValue(this.taxDetails);
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
  onSubmit(taxForm:FormGroup){
    if(taxForm.controls.id.value == null && !this.hasId){
      this.add(taxForm.getRawValue());      
    }
    else{
      this.update(taxForm.getRawValue());   
    }
  }
  add(form){
    this.subscription.push(
      this.requestService.sendRequest(TaxUrlsEnum.Tax_List_Post,'POST',REQUEST_SERVERS.fd_api_url,removeEmptyAndNullsFormObject(form),).subscribe(
        (res) =>{
          this.taxForm.reset();
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
    const reqObj = new TaxDetail({...formValues,...{realObject:this.taxDetails}});
    let Obj = reqObj.getObject();
    this.subscription.push(
      this.requestService.sendRequest(
        TaxUrlsEnum.Tax_List_Put,
        'PUT',
        REQUEST_SERVERS.fd_api_url,
        Obj
      ).subscribe((res:any)=>{
          this.taxForm.reset();
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
    if ((this.taxForm.dirty && this.taxForm.touched)) {
			this.CanDeactivateModelComponentService.canDeactivate().then(res => {
				let result = res;
				if (res) {
					this.taxForm.reset();
          this.formSubmited.emit(true)
				}
				else {
					return true;
				}
			});
		}
		else {
			this.taxForm.reset();
			this.formSubmited.emit(true)
		}
  }
  isDisabled() {
		if(this.isLoading || this.taxForm.invalid) {
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
