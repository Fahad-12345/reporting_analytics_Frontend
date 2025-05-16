import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Logger } from '@nsalaun/ng-logger';
import { ToastrService } from 'ngx-toastr';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-insurance-listing',
  templateUrl: './insurance-listing.component.html',
  styleUrls: ['./insurance-listing.component.scss']
})
export class InsuranceListingComponent implements OnInit {
  selection = new SelectionModel<Element>(true, []);
  public selectedRowsString: string;
  insurance = []

  constructor(private modalService: NgbModal, private fb: FormBuilder, private route: ActivatedRoute, private logger: Logger, private toastrService: ToastrService, private fd_services: FDServices,public datePipeService:DatePipeFormatService) {
    this.getInsurances()
  }

  ngOnInit() {
  }

  getInsurances() {
    this.fd_services.insurance_details().subscribe(res => {
      this.insurance = res.data
    }, err => {
      this.toastrService.error(err.message, 'Error')
    })
  }

  onDelete(id: number) {
    this.fd_services.delete_insurance(id).subscribe(res => {
      if (res.status) {
        this.getInsurances()
        this.toastrService.success(res.message, 'Success')
      }
    }, err => {
      this.toastrService.error(err.message, 'Error')
    })
  }

  stringfy(obj) {
    return JSON.stringify(obj);
  }

  masterToggle(event) {
    this.isAllSelected() ?
      this.selection.clear() :
      this.insurance.forEach(row => this.selection.select(row));
  }

  isAllSelected() {
    this.selectedRowsString = JSON.stringify(this.selection.selected);
    const numSelected = this.selection.selected.length;
    const numRows = this.insurance.length;
    return numSelected === numRows;
  }

}
