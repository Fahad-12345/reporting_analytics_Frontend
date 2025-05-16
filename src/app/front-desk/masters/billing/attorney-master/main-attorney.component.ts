import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { AclService } from '@appDir/shared/services/acl.service';
// import { HttpService } from '@appDir/front-desk/fd_shared/services/http.service';
// import { Page } from '@appDir/front-desk/models/page';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
// import { NgbModalOptions, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
// import { ToastrService } from 'ngx-toastr';
// import { Address } from 'ngx-google-places-autocomplete/objects/address';
// import { AttorneyServiceService } from './firm/firm/attorney-service.service';
import { Router } from '@angular/router';
// import { Attorney } from './attorney';
// import { AttorneyAPIServiceService } from './services/attorney-service.service';
// import { Subscription } from 'rxjs';
// import {
//   unSubAllPrevious,
//   parseHttpErrorResponseObject,
// } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
// import { checkReactiveFormIsEmpty, isObjectEmpty } from '@appDir/shared/utils/helpers';
// import { OrderEnum, ParamQuery } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { RequestService } from '@appDir/shared/services/request.service';
// import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
// import { AttorneyUrlsEnum } from './attorney/Attorney-Urls-enum';
// import { FirmUrlsEnum } from './firm/Firm-Urls-enum';
// import { AttorneyFirms } from './firm/firm/attorney';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';

@Component({
  selector: 'app-main-attorney',
  templateUrl: './main-attorney.component.html',
  styleUrls: ['./main-attorney.component.scss']
})
export class MainAttorneyComponent extends PermissionComponent implements OnInit {

  constructor(
    aclService: AclService,
    // private http: HttpService,
    // private fb: FormBuilder,
    // private fdService: FDServices,
    // private toastrService: ToastrService,
    // private modalService: NgbModal,
    // private confirmService: ConfirmationService,
    // private attorneyService: AttorneyServiceService,
    router: Router,
    // private attorneyAPIService: AttorneyAPIServiceService,
    protected requestService: RequestService,
  ) { super(aclService, router); }

  ngOnInit() {
  }

}
