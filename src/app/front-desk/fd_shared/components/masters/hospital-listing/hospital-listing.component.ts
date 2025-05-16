import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Logger } from '@nsalaun/ng-logger';
import { ToastrService } from 'ngx-toastr';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-hospital-listing',
  templateUrl: './hospital-listing.component.html',
  styleUrls: ['./hospital-listing.component.scss']
})
export class HospitalListingComponent implements OnInit {

  selection = new SelectionModel<Element>(true, []);
  public selectedRowsString: string;
  hospitals = []
  @Output() openForm = new EventEmitter();

  constructor(private fb: FormBuilder,private route: ActivatedRoute, private logger: Logger, private toastrService: ToastrService, private fd_services: FDServices, public datePipeService:DatePipeFormatService) { 
  }

  ngOnInit() {
    this.getHospitals()
  }

  getHospitals() {
    this.fd_services.getFacilities().subscribe(res => {
      this.hospitals = res.data
    },err => {
      this.toastrService.error(err.message, 'Error')
    })
  }

  openHospitalForm() {
    this.openForm.emit();
  }

  onDelete(id: number) {
    this.fd_services.deleteFacility(id).subscribe(res => {
      this.toastrService.success(res.message, 'Success')
      this.getHospitals()
    }, err => {
      this.toastrService.error(err.error.message, 'Error')
    })
  }

  stringfy(obj){
    return JSON.stringify(obj);
  }

  masterToggle(event) {
    this.isAllSelected() ?
        this.selection.clear() :
        this.hospitals.forEach(row => this.selection.select(row));
  }

  isAllSelected() {
    this.selectedRowsString =JSON.stringify(this.selection.selected);
    const numSelected = this.selection.selected.length;
    const numRows = this.hospitals.length;
    return numSelected === numRows;
  }
}
