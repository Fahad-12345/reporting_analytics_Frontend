import { FormControl } from '@angular/forms';
import { CaseFlowServiceService } from './../../../../front-desk/fd_shared/services/case-flow-service.service';
import {
	Component,
	ElementRef,
	EventEmitter,
	Input,
	OnChanges,
	OnInit,
	Output,
} from '@angular/core';
import {
	AbstractControl,
	FormBuilder,
	FormGroup,
	Validators,
} from '@angular/forms';

import {
	getAllControls,
	getFieldControlByName,
} from '../../helper';
import { FieldConfig } from '../../models/fieldConfig.model';
import { Validator } from '../../models/validator.model';

@Component({
  selector: 'dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.css']
})
export class DynamicFormComponent implements OnInit,OnChanges {

  @Input() fields: FieldConfig[]
  @Output() submit = new EventEmitter<any>();
  @Output() onReady = new EventEmitter<any>();
  @Output() onValueChange = new EventEmitter<any>();
  @Input() fieldsValue = {};
  constructor(private fb: FormBuilder,private caseFlowService:CaseFlowServiceService,private el:ElementRef) { }
  public form: FormGroup;
  formReady: boolean = false;
  ngOnChanges() {
    if (this.fields && this.fields.length > 0) {

      //creates formcontrols according to field array
      this.form = this.createControl(this.fields);
      this.formReady = true;
    }
	// this.form.patchValue(this.fieldsValue);

  }
  ngOnInit() {
	this.form.valueChanges.subscribe(x => {
		this.onValueChange.emit(x);
	 });
    this.form.patchValue(this.fieldsValue);
  }


  disableHiddenControlsPublic() {
    this.disableHiddenControls(this.fields)
    this.validateAllFormFields(this.form);
  }

  enableHiddenControlsPublic() {
    this.enableHiddenControls(this.fields)
  }

  disableHiddenControlsPublicByFieldConfig(field:FieldConfig[],form:FormGroup) {
    this.disableHiddenControls(field)
    this.validateAllFormFields(form);
  }

  enableHiddenControlsPublicByFieldConfig(field:FieldConfig[]) {
    this.enableHiddenControls(field)
  }
  //submit event function
  onSubmit(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    // disable form controls with 'hidden' class. This will ignore any validatios associated to hidden controls
	  this.disableHiddenControls(this.fields);
    //check if form is valid. 
    if (this.form.valid) {
      //send form data to the component containing this dynamic component
      this.submit.emit(this.form.getRawValue());

    } else {
      //logs the controls that are invalid. easy to debug

      //validate all fields and display errors accordingly
	  this.validateAllFormFields(this.form);
   
	  let firstInvalidControl: HTMLElement =
	  this.el.nativeElement.querySelector('form .ng-invalid');
	  if(firstInvalidControl) {
		this.caseFlowService.scrollToFirstInvalidControl(firstInvalidControl);
	  }
	}
    this.enableHiddenControls(this.fields)
  }


  getFormControlByNameFromForm(form: FormGroup, name) {
    let controls = Object.keys(form.controls)
    if (controls.includes(name)) {
      return form.controls[name]
    } else {
      // controls.filter()
    }
  }

  findFormControl(name: string, form: FormGroup): AbstractControl {

    let all_controls = Object.keys(form.controls)
    // let result;
    // all_controls.forEach(control_name => {
    //   // let control_name=control;
    //   if (control_name == name) {
    //     result = form.controls[control_name]
    //   } else if ((form.controls[control_name] as FormGroup).controls) {
    //     result = this.findFormControl(name, form.controls[control_name] as FormGroup)
    //   }
    // })
    // return result

    return form.controls[name]
    // for (let x = 0; x < all_controls.length; x++) {
    //   let control_name = all_controls[x]
    //   if (control_name == name) {
    //     return form.controls[control_name]
    //   } else if ((form.controls[control_name] as FormGroup).controls) {
    //     return this.findFormControl(name, form.controls[control_name] as FormGroup)
    //   }
    // }
  }

  disableFormControl(name: string, form: FormGroup) {

  }


  enableControl(fields: FieldConfig[]) {


    fields.forEach(field => {
      let name = field.name ? field.name : field.configs && field.configs.formControlName
      let form = field.form
      if (form) {
        {
          let control = this.findFormControl(name, form)
          if (control) {
            control.enable()
          }
        }
      }
      if (field.children && field.children.length > 0) {
        this.enableControl(field.children)
      }

    })



  }

  enableHiddenControls(fields: FieldConfig[]) {
    let all_control = getAllControls(fields).filter(field => field.classes && field.classes.includes('hidden'));
    this.enableControl(all_control)


  }

  disableControl(fields: FieldConfig[]) {
    fields.forEach(field => {
      let name = field.name ? field.name : field.configs && field.configs.formControlName ? field.configs.formControlName : ''
      let form = field.form
      if (form) {
        let control = this.findFormControl(name, form)
        if (control) {
          control.disable()
        }
      }
      if (field.children && field.children.length > 0) {
        // let _form = field.configs && field.configs.formControlName ? form.controls[field.configs.formControlName] : form
        this.disableControl(field.children)
      }

    })
  }
  disableHiddenControls(fields: FieldConfig[]) {
	let all_control = getAllControls(fields).filter(field =>field.classes && field.classes.includes('hidden'))
	this.disableControl(all_control)

    // let controls: { key: string, control: AbstractControl }[] = this.getInvalidFormControls();
    // console.log('invalid controls to disable', controls)

    // controls.forEach(control => {
    //   let field_control = getFieldControlByName(this.fields, control.key)
    //   if (field_control.classes.includes('hidden')) {
    //     control.control.disable()
    //   }
    // })


    // let all_controls = getAllControls(this.fields)

    // console.log('disabling hidden fields')
    // all_controls.forEach(field => {
    //   // console.log(this.form.controls[field.name])
    //   let name = field.name || field.configs && field.configs.formControlName || ''

    //   if (!name) { return }

    //   let control = form.controls[name]
    //   if (control) {
    //     if (field.classes && field.classes.filter(className => className == 'hidden').length > 0) {
    //       form.controls[name].disable({ emitEvent: false })
    //     } else {
    //       form.controls[name].enable({ emitEvent: false })
    //     }

    //     let _control = (control as FormGroup).controls
    //     if (_control && Object.keys(_control).length > 0) {
    //       if (!field.classes || field.classes.find(className => className == 'hidden')) { return; }
    //       this.toggleHiddenControls(control as FormGroup)
    //     }
    //   }
    // })

  }
  getInvalidFormControls() {
    // let arr = []
    // Object.keys(this.form.controls).forEach(key => {
    //   let control = this.form.controls[key]
    //   if (control.invalid) {

    //     // let control = getFieldControlByName(this.fields, key)
    //     // // if (control.children && control.children.length > 0) {
    //     // //   arr = [...arr, ...this.validateFormFields(this.form.controls[key])]
    //     // // }
    //     // let a = control && control.classes ? control.classes.filter(className => className == 'hidden') : []
    //     // a.length > 0 ? this.form.controls[key].disable() : this.form.controls[key].enable()
    //     arr.push({ key: key, control: control })


    //   }
    // })
    let arr = this.getInvalidFormControlRecursive(this.form)
    return arr;
  }

  getInvalidFormControlRecursive(form: FormGroup) {
    let result = []
    let control_keys = Object.keys(form.controls)
    control_keys.forEach(key => {
      let control = form.controls[key]
      if (control.invalid) {
        result.push({ key: key, control: control })
      }
      if ((control as FormGroup).controls) {
        result = [...result, ...this.getInvalidFormControlRecursive(control as FormGroup)]
      }
    })
    return result
  }

  validateFormFields(_form: FormGroup) {
    let arr = []
    Object.keys(_form.controls).forEach(key => {
      if (_form.controls[key].invalid) {
		let control = getFieldControlByName(this.fields, key)
        let a = control && control.classes ? control.classes.filter(className => className == 'hidden') : []
        a.length > 0 ? _form.controls[key].disable({ emitEvent: false }) : _form.controls[key].enable({ emitEvent: false })
        arr.push({ key: key, control: _form.controls[key] })
      }
      if (getFieldControlByName(this.fields, key).children && getFieldControlByName(this.fields, key).children.length > 0) {
        this.validateFormFields(_form.controls[key] as FormGroup)
      }
    })
    return arr;
  }


  ngAfterViewInit() {
    //emit an event when the form is ready to be used
    this.onReady.emit(this.form);
  }

  /**
   * Accepts an array of FieldConfig and creates controls accordingly.
   * @param fields :FieldConfig[]
   * @returns FormGroup
   */
  createControl(fields: FieldConfig[]) {
    const group = this.fb.group({});

    this.createChildControls(fields, group)

    return group;
  }

  /**
   * Recursive function that creates form controls including children of elements
   * @param fields array to map to form controls
   * @param group form group reference to add fields to
   */
  createChildControls(fields: FieldConfig[], group: FormGroup) {
    fields.forEach(field => {

      if (field.element === "button" || !field.element) return;

      if (field.element === "div") {
        if (field.children && field.children.length > 0) {

          if (field && field.configs && field.configs.formControlName) {
            let nestedForm = this.fb.group({});
            this.createChildControls(field.children, nestedForm);
            group.addControl(field.configs.formControlName, nestedForm)
          } else {
            this.createChildControls(field.children, group)
          }
        }
        return;
      }
      const control = this.fb.control(
        field.values
        , this.bindValidations(field.validations)
      )
      group.addControl(field.name, control)

      field.form = group
    })
  }
  /**
   * binds validations to form controls
   * @param validations validations to bind to
   */
  bindValidations(validations: Validator[]) {
    if (validations && validations.length > 0) {
      const validList = [];
      validations.forEach(valid => {
        validList.push(valid.validator);
      });
      return Validators.compose(validList);
    }
    return null;
  }

  setValidations(validations: Validator[],controlName:AbstractControl)
  {
 if (validations && validations.length > 0) {
	validations.forEach(valid => {
        controlName.setValidators(valid.validator);
		controlName.updateValueAndValidity({emitEvent:false});
      });
 }
 else
 {
	controlName.clearValidators();
	controlName.updateValueAndValidity({emitEvent:false});
 }
  }

  validateAllFormFields(formGroup: FormGroup) {
    formGroup.markAllAsTouched();
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control.markAsTouched({ onlySelf: true });
      if (control instanceof FormGroup) {
        this.validateAllFormFields(control as FormGroup)
      }
    });
  }
}
