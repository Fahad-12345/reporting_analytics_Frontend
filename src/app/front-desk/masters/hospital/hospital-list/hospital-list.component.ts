import { Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { ActivatedRoute } from '@angular/router';
import { NgbModalRef, NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Logger } from '@nsalaun/ng-logger';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Address } from 'ngx-google-places-autocomplete/objects/address';

@Component({
  selector: 'app-hospital-list',
  templateUrl: './hospital-list.component.html',
  styleUrls: ['./hospital-list.component.scss']
})
export class HospitalListComponent implements OnInit {

  @ViewChild("content") contentModal:any;
  modalRef: NgbModalRef;

  constructor(private titleService: Title, private fb: FormBuilder, private fd_services: FDServices, private route: ActivatedRoute, private logger: Logger, private modalService: NgbModal) {
   }

  ngOnInit() {
    this.titleService.setTitle(this.route.snapshot.data['title']);
  }
}
