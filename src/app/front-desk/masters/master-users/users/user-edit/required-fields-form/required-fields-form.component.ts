import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { RequestService } from '@appDir/shared/services/request.service';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { TemplateMasterUrlEnum } from '@appDir/front-desk/masters/template-master/template-master-url.enum';
import { ToastrService } from 'ngx-toastr';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { VisitTypeUrlsEnum } from '@appDir/front-desk/masters/providers/vistType/visit.type.enum';

@Component({
  selector: 'app-required-fields-form',
  templateUrl: './required-fields-form.component.html',
  styleUrls: ['./required-fields-form.component.scss']
})
export class RequiredFieldsFormComponent implements OnInit {

  constructor(private fb: FormBuilder, private requestService: RequestService, private toastrService: ToastrService, private activeModal: NgbActiveModal) { }
  // "user_id": 1,
  // "facility_location_id": 1,
  // "speciality_id": 6,
  // "visit_type_id": 4,
  // "fields_control_ids": [

  // ]


  data = {}

  lstFieldControls: any[] = []
  lstVisitTypes: any[] = []
  form: FormGroup
  ngOnInit() {
    this.form = this.fb.group({
      user_id: '',
      facility_location_id: '',
      speciality_id: '',
      visit_type_id: '',
      fields_control_ids: []
    })
    this.form.patchValue(this.data)

    this.requestService
      .sendRequest(
        VisitTypeUrlsEnum.VisitType_list_GET,
        'GET',
        REQUEST_SERVERS.fd_api_url
      ).subscribe(data => {
        this.lstVisitTypes = data['result']['data']
      })

    this.requestService.sendRequest(TemplateMasterUrlEnum.getRequiredFieldsList, 'get', REQUEST_SERVERS.fd_api_url).subscribe(data => {
      this.lstFieldControls = data['result'].data
      // this.page.totalElements = data['result'].total
    })
  }
  onSubmit(form) {
    this.requestService.sendRequest('attach_fields_controls_to_user', 'post', REQUEST_SERVERS.fd_api_url, { ...form }).subscribe(data => {
      this.toastrService.success('updated successfully', 'Success')
      this.activeModal.close(true)
    }, error => this.toastrService.error(error.message, 'error'))
  }
  resetModel() {
    this.activeModal.close()
  }
}
