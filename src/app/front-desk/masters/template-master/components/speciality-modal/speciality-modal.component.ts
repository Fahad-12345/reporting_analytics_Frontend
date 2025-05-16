import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { SpecialityModel, RolesModel } from '../roles-field-list/Roles.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TemplateMasterUrlEnum } from '../../template-master-url.enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';

@Component({
  selector: 'app-speciality-modal',
  templateUrl: './speciality-modal.component.html',
  styleUrls: ['./speciality-modal.component.scss']
})
export class SpecialityModalComponent implements OnInit, OnChanges {

  constructor(private fb: FormBuilder, private activeModal: NgbActiveModal, private requestService: RequestService) { }

  @Input() speciality: SpecialityModel
  form: FormGroup = new FormGroup({})
  role: RolesModel;
  lstRequiredField = []



  ngOnInit() {
    this.requestService.sendRequest(TemplateMasterUrlEnum.getRequiredFieldsList, 'get', REQUEST_SERVERS.fd_api_url).subscribe(data => this.lstRequiredField = data['result']['data'])

    this.form = this.createForm(this.speciality)
    this.form.patchValue(this.speciality)
  }
  close() {
    this.activeModal.close()
  }
  ngOnChanges() {
    if (this.speciality) {

    }
  }

  createForm(speciality) {
    let visit_types = this.fb.array(speciality.visit_types.map(visittype => {
      return this.fb.group({ id: visittype.id, fields_controls: [[]], name: visittype.name })
    }))

    let data = {
      id: speciality.id,
      name: speciality.name,
      visit_types: visit_types
    }

    return this.fb.group(data)

  }
  disableBtn: boolean = false
  submit(form: SpecialityModel) {

    let speciality = this.role.specialities.find(s => s.id === form.id)
    if (speciality) {
      let visit_type = speciality.visit_types.find(v => v.id == form.visit_types[0].id)
      if (visit_type) {
        visit_type.fields_controls = form.visit_types[0].fields_controls
      }
    }
    // this.role.specialities.forEach(speciality => {
    //   if (speciality.id == form.id) {
    //     speciality.visit_types.forEach(visit_type => {
    //       if (visit_type.id == form.visit_types[0].id) {
    //         visit_type = form.visit_types[0]
    //       }
    //     })
    //   }
    // })
    this.disableBtn = true;
    this.requestService.sendRequest(TemplateMasterUrlEnum.postAttachFieldControlsToRole, 'post', REQUEST_SERVERS.fd_api_url, { ...this.role, role_id: this.role.id }).subscribe(data => {
      this.form.reset({}, { emitEvent: false })
      this.close()
      // this.router.navigate(['/front-desk/masters/template/template/roles-field'])
    }, err => this.disableBtn = false)
  }
}
