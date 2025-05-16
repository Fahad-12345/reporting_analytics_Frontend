import { Component, OnInit } from '@angular/core';
import { FDServices } from '../../services/fd-services.service';
import { ToastrService } from 'ngx-toastr';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-attorney-listing',
  templateUrl: './attorney-listing.component.html',
  styleUrls: ['./attorney-listing.component.scss']
})
export class AttorneyListingComponent implements OnInit {

  selection = new SelectionModel<Element>(true, []);
  public selectedRowsString: string;
  
  attorney: any[] = []
  constructor(private fd_services: FDServices, private toastrService: ToastrService) { }

  ngOnInit() {
    this.getAttornies();
  }

  getAttornies() {
    this.fd_services.getAttornies().subscribe(
      res => {
          if(res.status) {
            this.attorney = []
            this.attorney = res.data;
          }
      }, 
      err => {
        this.toastrService.error(err.message);
      }
    )
  }

  onDelete(id) {
    this.fd_services.deleteMasterAttorney(id).subscribe(res => {
      if(res.status) {
        this.getAttornies()
        this.toastrService.success(res.message, 'Success')
        }
      }, err => {
        this.toastrService.error(err.message, 'Error')
      })
  }

  stringfy(obj){
    return JSON.stringify(obj);
  }

  masterToggle(event) {
    this.isAllSelected() ?
        this.selection.clear() :
        this.attorney.forEach(row => this.selection.select(row));
  }

  isAllSelected() {
    this.selectedRowsString =JSON.stringify(this.selection.selected);
    const numSelected = this.selection.selected.length;
    const numRows = this.attorney.length;
    return numSelected === numRows;
  }
}
