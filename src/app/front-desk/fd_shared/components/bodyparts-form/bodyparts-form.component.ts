import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Logger } from '@nsalaun/ng-logger';
import { FDServices } from '../../services/fd-services.service';
import { BodypartsFormService } from './bodyparts-form.service';
import { LocalStorage } from '@shared/libs/localstorage';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { FieldConfig } from '@appDir/shared/dynamic-form/models/fieldConfig.model';
import { DivClass } from '@appDir/shared/dynamic-form/models/DivClass.class';
import { CheckboxClass } from '@appDir/shared/dynamic-form/models/Checkbox.class';
import { ButtonClass } from '@appDir/shared/dynamic-form/models/ButtonClass.class';
import { ButtonTypes } from '@appDir/shared/dynamic-form/constants/ButtonTypes.enum';
import { InputTypes } from '@appDir/shared/dynamic-form/constants/InputTypes.enum';
import { DynamicFormComponent } from '@appDir/shared/dynamic-form/components/dynamic-form/dynamic-form.component';
import { InputClass } from '@appDir/shared/dynamic-form/models/InputClass.class';
import { DynamicControl } from '@appDir/shared/dynamic-form/models/DynamicControl.class';
import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';
import { Subscription } from 'rxjs';
import { makeDeepCopyArray, makeDeepCopyObject } from '@appDir/shared/utils/utils.helpers';
import { Location } from '@angular/common';
import { SelectClass } from '@appDir/shared/dynamic-form/models/SelectClass.class';
import { CaseFlowUrlsEnum } from '@appDir/front-desk/fd_shared/models/CaseFlowUrlsEnum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { getFieldControlByName } from '@appDir/shared/dynamic-form/helper';
import { AutoCompleteClass } from '@appDir/shared/dynamic-form/models/AutoCompleteClass.class';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { AclService } from '@appDir/shared/services/acl.service';
@Component({
  selector: 'app-bodyparts-form',
  templateUrl: './bodyparts-form.component.html',
  styleUrls: ['./bodyparts-form.component.scss'],
})
export class BodypartsFormComponent extends PermissionComponent implements OnChanges {

  public form: FormGroup
  public bodyform: FormGroup
  public title: string = 'Edit Body Parts Information'
  @Input() caseId: number;
  @Input() bodypartsData: any[] = []
  @Input() caseData: any;
  public bodyartchange: boolean = false;
  public params: any[] = [];
  public bodyParts: any[] = [];
  public bodyPartDataLength = 0
  public bodyPartlength: number;
  public bodyPartId: any;
  data: any[] = null;
  fieldConfig: FieldConfig[] = [];
  submitfields: FieldConfig[] = [];
  bodyfieldConfig: FieldConfig[] = [];
  disableBtn = false
  showDynamic: boolean = false;
  otherId: any
  dataObject: any[] = []
  subscription: Subscription[] = [];
  rangelevel: any
  bodyFormArray: FormGroup[] = []
  selectedLable: string = ''
  @ViewChild(DynamicFormComponent) DynamicFormComponent: DynamicFormComponent
  constructor(private fb: FormBuilder,
    private caseFlowService: CaseFlowServiceService, private location: Location,
    protected requestService: RequestService,
    router: Router,
    aclService: AclService,
    private localStorage: LocalStorage, private toastrService: ToastrService, private logger: Logger, private fd_services: FDServices, private route: ActivatedRoute) {
    super(aclService, router, null, requestService, null);
    this.route.snapshot.pathFromRoot.forEach(path => {
      if (path && path.params && path.params.caseId) {
        if (!this.caseId) {
          this.caseId = path.params.caseId;
        }
      }
    })
    this.setForm();
    this.getBodyParts();

  }
  ngAfterViewInit() {

  }
  callingsubmit() {
    this.DynamicFormComponent.onSubmit(event)
  }
  ngOnInit() {
    this.getAllSensations()
  }
  /**
   * get selected data
   */
  getCase() {
    this.caseFlowService.getCase(this.caseId, 'injury').subscribe((res) => {
      if (res.status == 200) {
        this.caseData = res.result.data.body_parts && res.result.data.body_parts.data ? res.result.data.body_parts.data : []
        this.checkFormData()
      }
    })
  }

  /**
   * check selected body parts
   */
  checkFormData() {
    this.caseData.forEach((element, index) => {
      if (element.body_part_id) {
        this.form ? this.form.controls[`${element.body_part_id}`].setValue(true) : ''
        this.bodyFormArray[index]
      }
      else {
        this.AddOther(true, element)
      }
    });
  }
  ngOnChanges(changes: SimpleChanges) {
  }

  /**
   * get all body parts
   */
  getBodyParts() {
    this.fd_services.getBodyParts({all_body_parts:true}).subscribe(res => {

      this.bodyParts = res.result.data
      // this.otherId = this.bodyParts ? this.bodyParts.find(res => res.name === "Other") : null
      this.setConfigration(this.bodyParts);
      setTimeout(() => {
        this.getCase()
      }, 500);

    })
  }
  /**
   * initialize form values
   */
  setForm() {
    this.form = this.fb.group({
      caseId: this.caseId,
      parts: this.fb.array([])
    })
  }
  /**
   * on form submit add other sensation data in object
   */
  addOtherData() {
    this.otherDataArray.forEach(element => {
      if (element) {
        if (element.get('level').value == "") {
          element.controls['level'].setValue(0);
        }
        let senasationdata = element.get('sensations').value
        let allsensations = senasationdata
        if (senasationdata) {
          var nameArr = (senasationdata.indexOf(',') > -1) ? senasationdata.split(',') : senasationdata;
          // if (allsensations.indexOf(',') > -1)
          if (nameArr instanceof Array)
            element.controls['sensations'].setValue(nameArr);
          else {
            let newnameArr = [];
            newnameArr[0] = nameArr
            element.controls['sensations'].setValue(newnameArr);
          }
        }
        // element.controls['id'].setValue(this.otherId['id']);
        this.dataObject.push(element.value)
      }
    });

  }

  /**
   * submit form 
   * @param form 
   */
  onSubmit(form) {
    this.addOtherData()
    Object.keys(form).forEach(key => {
      if (form[key]) {
        let part = this.bodyParts.find(bodyPart => bodyPart.id == key)
        if (part) {
          part['checked_sensations'] = []
          part['sensation_level'] = []
          let bodyPartForm = this.bodyFormArray.find(bodyForm => bodyForm.value.id == part.id)
          if (bodyPartForm) {
            this.rangelevel = bodyPartForm.value.level
            if (bodyPartForm && bodyPartForm.value.sensations) {
              Object.keys(bodyPartForm.value.sensations).forEach(key => {
                let sensation_id = key.split('_')[0]
                if (bodyPartForm.value.sensations[key]) {
                  part['checked_sensations'] = [...part['checked_sensations'], sensation_id]
                }
              })
            }
            else {
              this.toastrService.error('No sensations!')
              return;
            }

          }
        }
        let bodyAllData: { body_part_id: null, level: number, sensations: any, type: string } = { body_part_id: null, level: 0, sensations: '', type: 'standard' }
        bodyAllData.body_part_id = part.id
        bodyAllData.level = this.rangelevel
        bodyAllData.sensations = part.checked_sensations
        this.dataObject.push(bodyAllData)

      }
    })
    this.dataObject.length > 0 ? this.dataObject = this.dataObject.map((res) => {
      return {
        other_body_part_name: res.other_body_part_name ? res.other_body_part_name : '',
        level: res.level,
        type: res.type,
        body_part_id: res.body_part_id,
        sensations: res.sensations
      }
    }) : ''
    this.caseFlowService.updateCase(this.caseId, { body_parts: { data: this.dataObject } }).subscribe(data => {
      this.dataObject = []
      this.toastrService.success('Successfully Updated ', 'Success')
      this.goForward();
      // this.caseFlowService.goToNextStep()
    }
      , error => {
        this.dataObject = []
        this.toastrService.error(error.message, 'Error')
      })
  }
  /**
   * go forward
   */
  goForward() {
    this.caseFlowService.goToNextStep()
  }
  /**
   * go back
   */
  goBack() {
    this.caseFlowService.loadSpin = true;
    this.location.back();
  }
  //------------------------------------------

  /**
   * add or delete other sensations 
   * @param data 
   */
  bindOther(data?) {
    this.subscription.push(this.form.controls['38'].valueChanges.subscribe(value => {
      if (value) {
        this.AddOther(true, data)
      } else {
        this.deleteOtherBodyParts(this.otherIndex)
      }
    }))
  }
  /**
   * configer body parts
   */
  setConfigration(data?) {
    this.fieldConfig = [
      new DivClass([
        ...this.getCheckboxes(data),
      ], ['row']),
    ]
    this.showDynamic = true;
  }
  public painlevel: number
  public tempArray: any[] = [];
  /**
   * adding body parts checkboxes
   * @param data 
   */
  getCheckboxes(data): FieldConfig[] {
    let array = data ? data.map(elem => {
      this.tempArray.push(this.setBodyConfigration(elem.body_part_sensations, elem.name, elem.id));
      return new CheckboxClass(elem.name, elem.id, InputTypes.checkbox, elem && elem.selected ? elem.selected : false, [], '', ['col-md-12 px-2 mb-1', 'col-sm-12']);
    }) : []
    return array;
  }
  /**
   * body parts changes configration
   */
  onReady(event) {
    this.form = event;
    this.form.valueChanges.subscribe(res => {
      res.value
      this.visiblebodypartsArray = []
      Object.keys(res).forEach(key => {
        if (res[key]) {
          this.visiblebodypartsArray.push(true)
        }
      }
      );
      this.headerTitle()
	})

	if(!this.aclService.hasPermission(this.userPermissions.patient_case_list_injury_body_parts_edit))
	{
		this.form.disable();
	}
	

    // this.bindOther()
  }
  /**
   * sensations changes configration
   */
  onBodyReady(event: FormGroup, i) {
    if (this.aclService.hasPermission(this.userPermissions.patient_case_list_injury_body_parts_view)) {
      event.get('level').setValue(0)
      this.bodyFormArray.push(event)
      let id = event.value.id
      let bodyPart = this.caseData?.find(bodyPart => bodyPart.body_part_id === id)
      let bodypartexist = bodyPart ? true : false;
      this.changePainLevel(event, i,bodypartexist)
      if (this.caseData) {
        if (!bodyPart) { 
          return; 
        }
        let sensations = bodyPart.sensations as any[];
        let level = bodyPart.level as any[];
        if (sensations) {
          let sensationsData = {}
          sensations.forEach(sensation => {
            sensationsData = { ...sensationsData, ...{ [`${sensation.id}_${id}`]: true } }
          });
          if (sensationsData) {
            (event.controls['sensations'] as FormGroup).patchValue(sensationsData);
            (event.controls['level'] as FormGroup).patchValue(level)
          }
        }
      }
	}

	if(!this.aclService.hasPermission(this.userPermissions.patient_case_list_injury_body_parts_edit))
	{
		// this.otherFormData.disable();
		event.disable();
	}
	

  }
  /**
   * map pain level in input box when get case detail
   * @param event 
   */

 changePainLevel(event?, i?, bodypartexist?) {
  if(!bodypartexist) {
    this.setPainScaleInitialValue(i)
  }
   this.subscription.push(event.get('level').valueChanges.subscribe(res => {
     res == 0 ? res = '0' : ''
     setTimeout(() => {
      getFieldControlByName(i.form, 'painscale').values = res
     }, 100);
   }))
 }
 setPainScaleInitialValue(i){
   setTimeout(() => {
     getFieldControlByName(i.form, 'painscale').values = "0";
   }, 100);
   
 }
  /**
   * sensation form create 
   */
  setBodyConfigration(data?, name?, id?) {
    return {
      form: [
        new DivClass([
          new DynamicControl('id', id),
          new DivClass([], ['row bodypart-name'], name),
          new DivClass([], ['row'], 'Pain Scale'),
          // new InputClass('painscale', 'painscale', InputTypes.number, data && data['level'] ? data['level'] : 0, [], '', ['col-md-5', 'col-sm-5'], { max: 10, min: 0, readonly: true }),
          // new DivClass([], ['float-left range-left'], '0'),
          new DivClass([], ['float-right range-right'], data && data['level'] && data['level'] != 0 ? data['level'] : '0', '', { name: 'painscale' }),
          new InputClass('Range', 'level', InputTypes.range, '', [], '', [], { max: 10, min: 0 }),
          new DynamicControl('type', ''),
          new DivClass([], ['row'], 'Sensations'),
          new DivClass([
            ...this.getBodyData(data, id)
          ], ['display-contents'], '', '', { formControlName: 'sensations' }),

        ])
      ], bodyPartName: id
    }
  }
  myClass: any
  visiblebodypartsArray: any[] = []
  shouldShowSensations(i) {
    // this.changePainLevel()
    // let painscaleform=getFieldControlByName(i,'painscale')
    // painscaleform.values=
    let data = this.form.controls[i.bodyPartName].value == true
    data ? this.myClass = '' : 'col-md-3 mb-3 px-2'
    // data ? this.visiblebodypartsArray.push(data) : this.visiblebodypartsArray.splice(0, 1)
    // console.log('this.visiblebodypartsArray', this.visiblebodypartsArray)
    // this.visiblebodypartsArray.length > 0 ? this.selectedLable = 'Selected Bodyparts & Sensations' : 'No Record'
    return this.form.controls[i.bodyPartName].value == true
  }
  /**
   * creating sensation checkboxes
   * @param data 
   * @param id 
   */
  getBodyData(data, id): FieldConfig[] {
    let array = data.map(elem => {
      return new CheckboxClass(elem.sensation_name, elem.sensation_id + '_' + id, InputTypes.checkbox, elem && elem.selected ? elem.selected : false, [], '', ['display-contents']);
    })
    return array;
  }
  otherForm: FieldConfig[] = [];
  otherFormData: FormGroup;
  otherDataArray: FormGroup[] = [];
  public otherArray: any[] = [];
  otherIndex: any
  /**
   * adding other form on click
   * @param bol 
   * @param obj 
   */
  AddOther(bol?, obj?) {
    if (bol) {
      if (!obj) {
        obj = { index: 0 };
        obj['index'] = this.otherArray.length + 1;
      } else {
        obj['index'] = this.otherArray.length + 1;
      }

      this.otherArray.push(this.generateOtherForm(obj))
      this.otherArray = [...this.otherArray];
      this.otherIndex = this.otherArray.length ? this.otherArray.length - 1 : null
    }
    else
      this.otherArray.push(this.generateOtherForm(obj))
  }
  otherShow(i?) {
    return true;
  }
  /**
   * generating other sensation form
   * @param obj 
   */
  generateOtherForm(obj?) {
    return {
      form: [
        new DivClass([
          new DynamicControl('index', obj && obj['index'] ? obj['index'] : null),
          // new DivClass([], ['bodypart-name'], 'Other'),
          new DivClass([], ['row'], name),
          new InputClass('Add body part name', 'other_body_part_name', InputTypes.text, obj && obj.other_body_part_name ? obj.other_body_part_name : '', [{ name: 'required', message: 'Body parts are required', validator: Validators.required }], '', ['col-md-12', 'col-sm-3']),
          new DivClass([], ['row'], 'Pain Scale'),
          // new InputClass('painscale', 'painscale', InputTypes.number, obj && obj['level'] ? obj['level'] : 0, [], '', ['col-md-4', 'col-sm-3'], { max: 10, min: 0, readonly: true }),
          // new DivClass([], ['float-left range-left'], '0'),   
          new DivClass([], ['float-right range-right'], obj && obj['level'] && obj['level'] != 0 ? obj['level'] : '0', '', { formControlName: 'painscale' }),
          new InputClass('Range', 'level', InputTypes.range, obj && obj.level ? obj.level : '', [], '', [], { max: 10, min: 0 }),
          new DynamicControl('type', 'other'),
          new DivClass([], [], 'Sensations'),
          new AutoCompleteClass('Sensations', 'sensations', 'name', 'value', null, true, '', [], '',
            ['col-12']
          ),
        ])
      ]
    }
  }
  allSensations: any[] = []
  /**
   * get all sensations
   */
  getAllSensations() {
    this.requestService.sendRequest('session/masters', 'get', REQUEST_SERVERS.kios_api_path).subscribe(res => {
      if (res['status'] == 200) {
        // this.allSensations = res['result'] && res['result'].data && res['result'].data[0].body_part_sensations ? res['result'].data[0].body_part_sensations : [];
        this.allSensations = res['result'] && res['result'].data && res['result'].data.sensations ? res['result'].data.sensations : [];
      }
    })
  }
  /**
   * deleting other sensaion created form
   * @param i 
   */
  deleteOtherBodyParts(i) {
    this.otherArray.splice(i, 1);
    this.arraydata.splice(i, 1);
    this.otherDataArray ? this.otherDataArray.splice(i, 1) : ''
    this.headerTitle()
  }
  arraydata: any[] = []
  /**
   * changes detection for other form 
   */
  onOtherFieldReady(event, i?) {
    let dummyArray: FormGroup
    this.otherFormData = event
    dummyArray = event;
    this.otherArray.forEach(element => {
      getFieldControlByName(element.form, 'sensations').items = this.allSensations.map(res => {
        return { name: res.name, label: res.name, value: res.id }
      })
      // getFieldControlByName(element.form, 'level').values = 0
    });
    event.get('level').setValue(0)
    this.subscription.push(event.get('level').valueChanges.subscribe(res => {
      // (event.controls['painscale'] as FormGroup).patchValue(res)
      res == 0 ? res = '0' : ''
      getFieldControlByName(i.form, 'painscale').values = res
    }))
	  ;
    if (this.caseData) {
      const caseData = this.caseData.filter(x => x.other_body_part_name != null);
	  let dataToPatch = caseData[dummyArray.get('index').value - 1];
      if (caseData && dataToPatch)
        dummyArray.patchValue(
          {
            id: dataToPatch.id,
            type: 'Other',
            level: dataToPatch.level,
            other_body_part_name: dataToPatch.other_body_part_name,
            sensations: dataToPatch.sensations.map(res => res.id),
            painlevel: dataToPatch.level
          }
        )
    }
    this.otherDataArray.push(dummyArray)
	this.headerTitle();
	// if(!this.aclService.hasPermission(this.userPermissions.patient_case_list_injury_body_parts_edit))
	// {
	// 	this.otherFormData.disable();
	// }
  }
  headerTitle() {
    if (this.visiblebodypartsArray.length > 0 || this.otherDataArray.length > 0)
      this.selectedLable = 'Selected Bodyparts & Sensations'
    else this.selectedLable = 'No Record Found'
  }
}
