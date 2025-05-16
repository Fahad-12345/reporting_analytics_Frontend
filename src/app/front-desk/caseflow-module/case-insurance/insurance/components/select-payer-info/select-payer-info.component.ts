import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-select-payer-info',
  templateUrl: './select-payer-info.component.html',
  styleUrls: ['./select-payer-info.component.scss']
})
export class SelectPayerInfoComponent {
  loadSpin: boolean = false;
  @Input() payer_info_list: any[] = [];
  constructor(public activeModal?: NgbActiveModal,private changeDetectorRef?:ChangeDetectorRef,) {
  }
  cancel() {
    this.activeModal.close(false)
  }
  save() {
    this.activeModal.close(this.payer_info_list);
  }
  setDefaultPayer(row){
    this.payer_info_list.forEach((x)=>{
      if(x.id === row.id){
        x.is_default_payer = true;
      }else{
        x.is_default_payer = false;
      }
    });
    this.payer_info_list = [...this.payer_info_list];
    this.changeDetectorRef.detectChanges();
  }
}
