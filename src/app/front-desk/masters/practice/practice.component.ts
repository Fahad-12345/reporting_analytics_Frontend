import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AclService } from '@appDir/shared/services/acl.service';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';

@Component({
  selector: 'app-practice',
  templateUrl: './practice.component.html',
  styleUrls: ['./practice.component.scss']
})
export class PracticeComponent extends PermissionComponent implements OnInit {

  constructor(
    router: Router,
    aclService: AclService,
    protected activatedRoute: ActivatedRoute,
  ) { super(aclService, router); }

  ngOnInit() {
  }

}
