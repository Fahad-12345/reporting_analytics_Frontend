import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { removeEmptyAndNullsFormObject } from '@appDir/shared/utils/utils.helpers';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { InvoiceBuilderEnumURLs } from '../../invoice-builder-enum-urls';

@Component({
  selector: 'app-invoice-builder-format-preview',
  templateUrl: './invoice-builder-format-preview.component.html',
  styleUrls: ['./invoice-builder-format-preview.component.scss']
})
export class InvoiceBuilderFormatPreviewComponent implements OnInit {
  @Input() tempId:any;
  public loadSpin: boolean = false;
  templatedetails:any;
  colspan:number = 3;
  templateHeaders:any[] = [];
  subscription: Subscription[] = [];
  constructor(protected requestService: RequestService,private modalService: NgbModal,public route: ActivatedRoute,private rou: Router) { }

  ngOnInit() {
    if (this.tempId !== '' && (this.tempId !== null && this.tempId !== undefined)) {
      this.getTemplateDetails(this.tempId);
    }
  }
  getTemplateDetails(templateId: string) {
    let params = {

      id: templateId
    }
    this.loadSpin = true;
    params = removeEmptyAndNullsFormObject(params);
    this.subscription.push(this.requestService
      .sendRequest(InvoiceBuilderEnumURLs.Single_Invoice_builder_Get, 'GET', REQUEST_SERVERS.fd_api_url, params)
      .subscribe((res: HttpSuccessResponse) => {
        if (res.status) {
          this.loadSpin = false;
          this.templatedetails = res.result && res.result.data ? res.result.data : {};
          this.templateHeaders = this.templatedetails.sequence ? this.templatedetails.sequence : [];
          if(!(res.result.data.is_enable_unit_price && res.result.data.is_enable_quantity)){
            this.colspan = 2
          }
        }
        else {
          this.loadSpin = true;
        }
      }));
  }
}
