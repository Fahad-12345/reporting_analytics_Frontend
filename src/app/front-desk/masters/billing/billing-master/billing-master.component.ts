import { Component, OnInit, OnDestroy } from '@angular/core';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { FormGroup, FormBuilder, Validators, Form } from '@angular/forms';
import { NgbModalRef, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AclService } from '@appDir/shared/services/acl.service';
import { HttpService } from '@appDir/front-desk/fd_shared/services/http.service';
import { Subscription } from 'rxjs';
import { MENU } from '@appDir/shared/layouts/navbar/nav-content';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-billing-master',
  templateUrl: './billing-master.component.html',
  styleUrls: ['./billing-master.component.scss']
})

export class BillingMasterComponent extends PermissionComponent implements OnInit {
  subscription: Subscription[] = [];

  constructor(
    aclService: AclService,
    router: Router,
  ) { super(aclService, router); }

  public menu: any[] = [];
  public submenu: any[] = [];
  public ssubmenu: any[] = [];
  public submenu1: any[] = [];
  ngOnInit() {
    // this.menu = MENU.filter(m => m.priv_title == "Master").map(m => m.submenu);
    // this.submenu = this.menu[0].filter(m => m.priv_title == "Billing").map(m => m.submenu);
    // this.submenu1 = this.submenu[0].filter(m => m.priv_title == "Billing").map(m => m.submenu);
    // this.ssubmenu = this.submenu1[0];
    // for (let i in this.ssubmenu) {
    //   if (this.aclService.hasPermission(this.ssubmenu[i].priv_key)) {
    //     this.router.navigate([this.ssubmenu[i].link]);
    //     return true;
    //   }
    // }
  }

  ngOnDestroy() {
  }
}
