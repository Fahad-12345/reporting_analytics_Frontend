import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { RequestService } from '@appDir/shared/services/request.service';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Subscription } from 'rxjs';
import { ClearinghouseEnum } from '../CH-helpers/clearinghouse';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { ToastrService } from 'ngx-toastr';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-select-default-payer',
  templateUrl: './select-default-payer.component.html',
  styleUrls: ['./select-default-payer.component.scss']
})
export class SelectDefaultPayerComponent implements OnInit {
  @ViewChild('selectDefaultPayerTable') selectDefaultPayerTable: DatatableComponent;
  @Input() defaultPayerInfo: any[] = [];
  subscription: Subscription[] = [];
  loadSpin: boolean = false;
  constructor(protected requestService: RequestService,private toaster?: ToastrService,public activeModal?: NgbActiveModal,) { }
  ngOnInit(): void {
    this.defaultPayerInfo = [...this.defaultPayerInfo];
    this.defaultPayerInfo?.forEach((payer) => {
      payer['location_id'] = payer['id'],
      payer['payer_id'] = null;
      if(payer?.payers?.length === 1){
        payer['payer_id'] = payer?.payers[payer.payers.length - 1]['id'];
      }
    });
  }
  setDefaultPayer(payer, index) {
    this.defaultPayerInfo[index].payer_id = payer['id'];
  }
  save() {
    let selectedDefaults = this.defaultPayerInfo?.filter(payer => payer.payer_id)
    .map(({ payer_id, location_id }) => ({ payer_id, location_id }));
    if (!this.validateData()) {
      this.setDefault({
        insurance_payers:[...selectedDefaults]
      });
    }
  }
  validateData(){
    let selectedDefaults = this.defaultPayerInfo?.filter(payer => !payer.payer_id)
    let locations = selectedDefaults?.map(loc => loc.location_name).toString();
    if(selectedDefaults?.length == this.defaultPayerInfo?.length){
      this.toaster.error('Please choose default payer.');
      return true;
    }else if(selectedDefaults?.length){
      this.toaster.error(`Please set default payer against ${locations}.`);
      return true;
    }else{
      return false;
    }
  }
  setDefault(body) {
    this.subscription.push(
      this.requestService.sendRequest(
        ClearinghouseEnum.Default_Payer_Set, 'post', REQUEST_SERVERS.fd_api_url, { ...body })
        .subscribe((res) => {
          this.loadSpin = false;
          if(res['status']){
            this.toaster.success(res['message']);
            this.activeModal.close(true);
          }
        })
    )
  }
}
