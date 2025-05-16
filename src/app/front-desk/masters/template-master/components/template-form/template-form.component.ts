import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';

@Component({
  selector: 'app-template-form',
  templateUrl: './template-form.component.html',
  styleUrls: ['./template-form.component.scss']
})
export class TemplateFormComponent implements OnInit {

  constructor(private activeModal: NgbActiveModal, private fb: FormBuilder,public datePipeService:DatePipeFormatService,) { }

  form: FormGroup
  ngOnInit() {
    this.fb.group({
      field_name: '',
      comments: '',
    })
  }
  close() {
    this.activeModal.close()
  }
  submit(form) {
  }
}
