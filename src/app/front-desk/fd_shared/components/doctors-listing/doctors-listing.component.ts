import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FDServices } from '../../services/fd-services.service';
import { ToastrService } from 'ngx-toastr';
// import { AlertsService } from '@jaspero/ng-alerts';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-doctors-listing',
  templateUrl: './doctors-listing.component.html',
  styleUrls: ['./doctors-listing.component.scss']
})
export class DoctorsListingComponent implements OnInit {

  selection = new SelectionModel<Element>(true, []);
  public selectedRowsString: string;

  public doctors: any[] = [];
  constructor(private fd_services: FDServices, 
    ) { }

  ngOnInit() {
    this.getDoctors();
  }

  getDoctors() {
    this.fd_services.getDoctors().subscribe(res => {
        if(res.status) {
          this.doctors = [];
          this.doctors = res.data;
        } else {
        }
    }, err => {
    }) 
  }

  onDelete(id) {
    this.fd_services.deleteDoctor(id).subscribe(res => {
        if(res.status) {
          this.getDoctors();
        } else {
        }
    })
  }

  stringfy(obj){
    return JSON.stringify(obj);
  }

  
  masterToggle(event) {
    this.isAllSelected() ?
        this.selection.clear() :
        this.doctors.forEach(row => this.selection.select(row));
  }

  isAllSelected() {
    this.selectedRowsString =JSON.stringify(this.selection.selected);
    const numSelected = this.selection.selected.length;
    const numRows = this.doctors.length;
    return numSelected === numRows;
  }
}
