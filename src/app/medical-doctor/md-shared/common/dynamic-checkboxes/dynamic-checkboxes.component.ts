import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CheckBoxModel} from '@appDir/medical-doctor/referal-forms/models/referral-forms-models';
import {FormBuilder, FormGroup} from '@angular/forms';

@Component({
    selector: 'app-dynamic-checkboxes',
    templateUrl: './dynamic-checkboxes.component.html',
    styleUrls: ['./dynamic-checkboxes.component.scss']
})
export class DynamicCheckboxesComponent implements OnInit {

    @Input() checkBoxesData: CheckBoxModel[] = [];
    @Input() fieldName: string;
    @Output() emitSelectedCheckBoxes: EventEmitter<any> = new EventEmitter();
    checkboxGroup: FormGroup;

    constructor(public fb: FormBuilder) {
    }

    ngOnInit() {
       // console.log(this.checkBoxesData);
        this.checkboxGroup = this.fb.group({
            checkboxes: this.checkBoxesData ? this.createCheckboxes() : [],
        });
        this.emitData();
        this.checkboxGroup.valueChanges.subscribe((res) => {
            this.emitData();
        });
    }

    createCheckboxes() {
        const formdata = this.fb.array([]);
        for (const checkbox of this.checkBoxesData) {
            let form: any = this.fb.group({
                'id': [checkbox.id],
                'name': checkbox.name,
                'checked': [checkbox.checked || false],
            })
            formdata.push(form);
        }
        return formdata;
    }

    emitData() {
        let data = this.checkboxGroup.getRawValue();
        if (data.checkboxes) {
            data = data.checkboxes.filter(d => d.checked === true);
        } else {
            data = [];
        }
        this.emitSelectedCheckBoxes.emit(data);
    }
}
