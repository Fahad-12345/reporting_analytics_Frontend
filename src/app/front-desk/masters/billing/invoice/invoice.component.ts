import { AclService } from './../../../../shared/services/acl.service';
import { PermissionComponent } from './../../../../front-desk/permission.abstract.component';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Logger } from '@nsalaun/ng-logger';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss']
})
export class InvoiceComponent extends PermissionComponent implements OnInit {
  subscription: Subscription[] = [];
	public links: any[] = [];

  constructor(
		public router: Router,
		public aclService: AclService,
		public activatedRoute: ActivatedRoute,
		private logger: Logger,
	) {
		super(aclService, router, activatedRoute);
	}
  ngOnInit() {
  }

}
