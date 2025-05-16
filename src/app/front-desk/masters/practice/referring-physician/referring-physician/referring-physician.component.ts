import { Component, OnInit } from '@angular/core';
import { USERPERMISSIONS } from '@appDir/front-desk/UserPermissions';
import { AclService } from '@appDir/shared/services/acl.service';

@Component({
  selector: 'app-referring-physician',
  templateUrl: './referring-physician.component.html',
  styleUrls: ['./referring-physician.component.scss']
})
export class ReferringPhysicianComponent implements OnInit {

  userPermissions = USERPERMISSIONS;

  constructor(public aclService: AclService) { }

  ngOnInit() {
  }

}
