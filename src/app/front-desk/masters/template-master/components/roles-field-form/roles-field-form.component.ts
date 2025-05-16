import { Component, OnInit } from '@angular/core';
import { FacilityModel, RolesModel, SpecialityModel } from '../roles-field-list/Roles.model';
import { RequestService } from '@appDir/shared/services/request.service';
import { TemplateMasterUrlEnum } from '../../template-master-url.enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { Router, ActivatedRoute } from '@angular/router';
import { CanDeactivateComponentInterface } from '@appDir/shared/canDeactivateFormsComponent/CanDeactivateComponent.interface';
import { SpecialityUrlsEnum } from '@appDir/front-desk/masters/providers/speciality/speciality.enum';
import { MainServiceTemp } from '../header-footer/services/main.service';
import { removeEmptyAndNullsFormObject } from '@appDir/shared/utils/utils.helpers';

@Component({
  selector: 'app-roles-field-form',
  templateUrl: './roles-field-form.component.html',
  styleUrls: ['./roles-field-form.component.scss']
})
export class RolesFieldFormComponent implements OnInit, CanDeactivateComponentInterface {

  constructor(private mainServiceTemplate:MainServiceTemp,private requestService: RequestService, private fb: FormBuilder, private router: Router, private acRoute: ActivatedRoute) { }
	lstFacility:FacilityModel[]=[];
  lstRoles: RolesModel[] = []
  lstSpeciality: SpecialityModel[] = []
  lstRequiredField: any[] = []
  lstSelectedSpeciality: SpecialityModel[] = []
  form: FormGroup;
  ngOnInit() {

    this.form = this.fb.group({
		facility_location_ids: [],
      speciality_id: [],
      specialities: this.fb.array([])
    })

    let id = this.acRoute.snapshot.params.id;

    this.getSpecialities()
    this.requestService.sendRequest(TemplateMasterUrlEnum.getRequiredFieldsList, 'get', REQUEST_SERVERS.fd_api_url).subscribe(data => this.lstRequiredField = data['result']['data'])
  
	this.get_Facility_location();
	
  }

  get_Facility_location()
  {
	this.mainServiceTemplate.get_facility_location().subscribe(data=>{
		let id = this.acRoute.snapshot.params.id;
		this.lstFacility=data['result'] && data['result']['data']&&data['result']['data'];
		if (id) {
				this.form.patchValue({ facility_location_ids: [parseInt(id)] },{emitEvent:true});
				this.onFacilityLocationChange()
			  }
			

	})
  }
  onFacilityLocationChange() {
	let queryParam:any={
		facility_location_ids:this.form.get('facility_location_ids').value,
		speciality_ids:this.form.get('speciality_id').value,
		// visit_type_ids:
	}

	queryParam=removeEmptyAndNullsFormObject(queryParam);
    this.requestService.sendRequest(TemplateMasterUrlEnum.getFacilitySpeciality, 'get', REQUEST_SERVERS.fd_api_url, queryParam).subscribe(data => {
	  		let specialities: SpecialityModel[] = data['result']['data']
	//   this.onSpecialityChange(this.lstSpeciality.filter(speciality => this.form.get('speciality_id').value.includes(speciality.id)))
	  this.form.patchValue({ speciality_id: specialities.map(speciality => speciality.id), specialities: specialities })
	  this.onSpecialityChange(specialities)
	})
  }
  removeSpecialty(x: number, speciality: FormGroup) {
    // (this.form['controls'].specialities as FormArray).removeAt(x)
    let control = this.form.controls['speciality_id']
    control.setValue(control.value.filter(id => id != speciality.value.id))
  }
  onSpecialityChange(event: SpecialityModel[]) {
    let new_elems = []
    if (event.length > this.lstSelectedSpeciality.length) {
      //element has been added
	//   new_elems = event.filter((i => a => a !== this.lstSelectedSpeciality[i] || !++i)(0));
	// Find object that are in event but not in lstSelectedSpeciality
	 new_elems = event.filter(({ id: id1 }) => !this.lstSelectedSpeciality.some(({ id: id2 }) => id2 === id1));
	
	
      this.addSpecialityForm(new_elems)
    } else {
	let elems = this.lstSelectedSpeciality.filter(({ id: id1 }) => !event.some(({ id: id2 }) => id2 === id1));
      elems.forEach((elem, _index) => {
        let index = this.lstSelectedSpeciality.findIndex(special => special.id == elem.id)
        this.removeSpecialityForm(index - _index)
      })

    }

    this.lstSelectedSpeciality = event

  }

  removeSpecialityForm(index) {
    let specialityForm: FormArray = <FormArray>this.form.get('specialities')
    specialityForm.removeAt(index)

  }
  addSpecialityForm(specialities: SpecialityModel[]) {
    let specialityForm: FormArray = <FormArray>this.form.get('specialities')
    specialities.forEach(speciality => {
      let visit_types = this.fb.array(speciality.visit_types.map(visittype => {
        return this.fb.group({ id: visittype.id, fields_controls:(visittype.fields_controls&&visittype.fields_controls)?[visittype.fields_controls] :[[]], name: visittype.name })
      }))
      let data = {
        id: speciality.id,
        name: speciality.name,
        visit_types: visit_types
      }

      specialityForm.push(this.fb.group(data))
    })
  }

  disableBtn: boolean = false;
  submit(form) {
    this.disableBtn = true;
    this.requestService.sendRequest(TemplateMasterUrlEnum.postAttachFieldControlsToFacility, 'post', REQUEST_SERVERS.fd_api_url, form).subscribe(data => {
      this.form.reset({}, { emitEvent: false })
      this.router.navigate(['/front-desk/masters/template/template/roles-field'])
    }, err => this.disableBtn = false)
  }

  getSpecialities() {
    // this.loadSpin = true;
    this.requestService
      .sendRequest(
        SpecialityUrlsEnum.Speciality_list_Get,
        'GET',
        REQUEST_SERVERS.fd_api_url,

      )
      .subscribe(
        (data: HttpSuccessResponse) => {
          if (data.status) {
            this.lstSpeciality = data.result && data.result.data ? data.result.data : [];
          }
        },
        (err) => {
          // this.loadSpin = false;
        },
      )

  }
  goBack() {
    this.router.navigate(['/front-desk/masters/template/template/roles-field'])
  }
  canDeactivate() {
    return this.form.dirty && this.form.touched
  }
}
