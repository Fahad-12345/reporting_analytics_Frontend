

export class ReferralFormsModel {
}

export class CheckBoxModel {
    id: number;
    name: string;
    checked?: boolean = false;
    value?: string;

    constructor(checkBoxData: CheckBoxModel) {
        this.id = checkBoxData.id || null ;
        this.name = checkBoxData.name || null;
        this.value = checkBoxData.value || null;
        this.checked = checkBoxData.checked || false;
    }
}

export class RangeOfMotionBodyPart extends CheckBoxModel {
    orientation?: string = null;
}
