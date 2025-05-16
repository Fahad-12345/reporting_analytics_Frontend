import { Component, OnInit, OnDestroy } from '@angular/core';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { NgbModalRef, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Page } from '@appDir/front-desk/models/page';
import { Subject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { AclService } from '@appDir/shared/services/acl.service';
import { HttpService } from '@appDir/front-desk/fd_shared/services/http.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { OrderEnum, ParamQuery } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { Location, LocationStrategy } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { CanDeactivateModelComponentService } from '@appDir/shared/canDeactivateModelComponent/can-deactivate-model-component.service';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { PickListUrlsEnum } from '../PickList-Urls-Enum';
import { checkReactiveFormIsEmpty, isObjectEmpty } from '@appDir/shared/utils/utils.helpers';
@Component({
  selector: 'app-picklistcategory',
  templateUrl: './picklistcategory.component.html',
  styleUrls: ['./picklistcategory.component.scss']
})
export class PicklistcategoryComponent{

  
}
