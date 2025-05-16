import { USERPERMISSIONS } from '@appDir/front-desk/UserPermissions';
import { RequestService } from './../../../../shared/services/request.service';
import { DatePipeFormatService } from './../../../../shared/services/datePipe-format.service';
import { AclService } from './../../../../shared/services/acl.service';
import { Title } from '@angular/platform-browser';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModalOptions,NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit, ViewChild, Input, AfterViewInit } from '@angular/core';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { BillingEnum } from '../../billing-enum';


@Component({
    selector: 'app-stats-component',
    templateUrl: './bill-stats-component.html',
    styleUrls: ['./bill-stats-component.scss']
})
export class BillStatsComponent  implements OnInit,AfterViewInit {

    @Input() caseId: number;
    @Input() billTotalDetails: any;
   
    constructor(public requestService: RequestService) {}
    ngOnInit() {

    }

    ngAfterViewInit(): void {
     
    }
 }
