import { Component, OnInit} from '@angular/core';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { FormBuilder} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AclService } from '@appDir/shared/services/acl.service';
import { HttpService } from '@appDir/front-desk/fd_shared/services/http.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { RequestService } from '@appDir/shared/services/request.service';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
@Component({
  selector: 'app-main-insurance',
  templateUrl: './main-insurance.component.html',
  styleUrls: ['./main-insurance.component.scss']
})
export class MainInsuranceComponent extends PermissionComponent implements OnInit {

  constructor(private fdService: FDServices,
    aclService: AclService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private http: HttpService,
    router: Router,
    private toaster: ToastrService,
    protected requestService: RequestService, ) { super(aclService, router); }
  ngOnInit() {
  }

}
