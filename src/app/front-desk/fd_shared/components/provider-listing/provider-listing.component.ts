import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { Logger } from '@nsalaun/ng-logger';
import { FDServices } from '../../services/fd-services.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModalRef, NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-provider-listing',
  templateUrl: './provider-listing.component.html',
  styleUrls: ['./provider-listing.component.scss']
})
export class ProviderListingComponent implements OnInit {

  selection = new SelectionModel<Element>(true, []);
  public selectedRowsString: string;

  public form: FormGroup
  providers: any[] = []
  provider: any;
  @ViewChild("content") contentModal:any;
  modalRef: NgbModalRef;

  constructor(private modalService: NgbModal, private fb: FormBuilder,private route: ActivatedRoute,private logger: Logger, private toastrService: ToastrService, private fd_services: FDServices,public datePipeService:DatePipeFormatService) { 
    this.form = this.fb.group({
      id: null,
      name: ['', [Validators.required]]
    })
  }

  ngOnInit() {
    this.getProviders()
  }

  getProviders() {
    this.fd_services.getProviders().subscribe(res => {
      if(res.status) {
        this.providers = res.data
      }
    }, err => {
      this.toastrService.error(err.message, 'Error')
    })
  }

  onDelete(id: number) {
    this.fd_services.deleteProvider(id).subscribe(res => {
      this.getProviders()
      this.toastrService.success(res.message, 'Success')
    }, err => {
      this.toastrService.error(err.message, 'Error')
    })
  }

  providerForm(content, row?: any) {
    this.logger.log('record', row)

    let ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false, size: 'lg', windowClass: 'modal_extraDOc'
    };

    this.modalRef = this.modalService.open(content, ngbModalOptions);
    
    if(row != null) {
      this.form.patchValue({
        id: row.id,
        name: row.name
      })
    }
  }

  assignValues() {
    this.form.patchValue({
      id: this.provider.id,
      name: this.provider.name
    })
  }

  onSubmit(form) {
    this.logger.log(form)
    if(this.form.valid) {
      this.logger.log('valid')
      if(form.id == null) {
        this.add(form)
      } else {
        this.update(form)
      }
    } else {
      this.logger.log('invalid')
      this.fd_services.touchAllFields(this.form)
    }
  }

  add(form) {
    this.fd_services.addProvider(form).subscribe(res => {
      this.modalRef.close();
      this.form.reset()
      this.getProviders()
      this.toastrService.success(res.message, 'Success')
    }, err => {
      this.toastrService.error(err.message, 'Error')
    })
  }

  update(form) {
    this.fd_services.updateProvider(form).subscribe(res => {
      this.modalRef.close();
      this.form.reset()
      this.getProviders()
      this.toastrService.success(res.message, 'Success')
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
      this.providers.forEach(row => this.selection.select(row));
}

isAllSelected() {
  this.selectedRowsString =JSON.stringify(this.selection.selected);
  const numSelected = this.selection.selected.length;
  const numRows = this.providers.length;
  return numSelected === numRows;
}
}
