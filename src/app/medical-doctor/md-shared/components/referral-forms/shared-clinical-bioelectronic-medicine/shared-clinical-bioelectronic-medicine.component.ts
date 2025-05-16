import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import {
    Synaptic,
    SynapticDetails,
    PainScaleScore,
    MedicalSession
} from '@appDir/medical-doctor/models/common/commonModels';
import { MDService } from '@appDir/medical-doctor/services/md/medical-doctor.service';
import { getCurrentDate } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';

@Component({
    selector: 'app-shared-clinical-bioelectronic-medicine',
    templateUrl: './shared-clinical-bioelectronic-medicine.component.html',
    styleUrls: ['./shared-clinical-bioelectronic-medicine.component.scss']
})
export class SharedClinicalBioelectronicMedicineComponent implements OnInit {
    @Input() patient;
    @Input() data: Synaptic;
    @Input() user;
    @Output() nextPage = new EventEmitter();
    @Output() previousPage = new EventEmitter();
    @Output() completeVisit = new EventEmitter();
    currentSession: any;
    isComplete: Boolean = false;

    form: FormGroup;

    constructor(private fb: FormBuilder, private mdService: MDService) {
        this.form = this.fb.group({
            synapticDetails: this.fb.array([]),
            painScaleScore: this.fb.array([]),
            treatmentDiagnosis: [''],
            treatmentNoOfTimes: [1], // Treatment plan
            treatmentIntervalName: [''], // per
            treatmentInterval: [1],
            treatmentPeriodName: [''], // for
            comments: [''],
        });
        // this.createSynapticDetails();
        // this.mainService.sliceStrings(this.form, 'headInjuryComments', this.headInjuryCommentsMaxLength);
    }

    ngOnInit() {
        if (this.data) {
            this.form.patchValue({
                'treatmentDiagnosis': (this.data && this.data['treatmentDiagnosis']) ? this.data['treatmentDiagnosis'] : '',
                'treatmentNoOfTimes': (this.data && this.data['treatmentNoOfTimes']) ? this.data['treatmentNoOfTimes'] : '',
                'treatmentIntervalName': (this.data && this.data['treatmentIntervalName']) ? this.data['treatmentIntervalName'] : '',
                'treatmentInterval': (this.data && this.data['treatmentInterval']) ? this.data['treatmentInterval'] : '',
                'treatmentPeriodName': (this.data && this.data['treatmentPeriodName']) ? this.data['treatmentPeriodName'] : '',
                'comments': (this.data && this.data['comments']) ? this.data['comments'] : '',
            });
        }
        if (this.data && this.data['treatmentDiagnosis']) {
            for (let i in this.data['synapticDetails']) {
                this.addNewSynapticDetails(this.data['synapticDetails'][i]);
            }
        }
        if (this.data && this.data['painScaleScore']) {
            for (let i in this.data['painScaleScore']) {
                this.addNewPainScaleScore(this.data['painScaleScore'][i]);
            }
        }
        this.currentSession = this.mdService.getCurrentSession();
        this.isComplete = this.currentSession.isComplete;
    }

    // createSynapticDetails(data){
    //   this.addNewSynapticDetails(null);
    // }
    // createPainScaleScore(data){
    //   this.addNewPainScaleScore(null);
    // }

    onBiasChange(event, form) {
        if (parseInt(event) < 0 || isNaN(parseInt(event))) {
            form.patchValue({
                'bias': '0',
            });
        }
        if (parseInt(event) > 9.9) {
            form.patchValue({
                'bias': '9.9',
            });
        }
    }

    handleChange(evt) {
        var value = evt.target.value;
        let treatmentPeriodName = this.form.get('treatmentPeriodName').value;

        if (value == 'week' && treatmentPeriodName == 'day') {
            this.form.patchValue({
                'treatmentPeriodName': 'week',
            });
        }
        if (value == 'month' && (treatmentPeriodName == 'day' || treatmentPeriodName == 'week')) {
            this.form.patchValue({
                'treatmentPeriodName': 'month',
            });
        }
        if (value == 'year' && (treatmentPeriodName != 'year')) {
            this.form.patchValue({
                'treatmentPeriodName': 'year',
            });
        }
    }

    onDosageLevelChange(event, form) {
        if (parseInt(event) < 0 || isNaN(parseInt(event))) {
            form.patchValue({
                'dosageLevel': '0',
            });
        }
        if (parseInt(event) > 9.9) {
            form.patchValue({
                'dosageLevel': '9.9',
            });
        }
    }

    onTreatmentChange(event, form) {
        if (parseInt(event) < 0 || isNaN(parseInt(event))) {
            form.patchValue({
                'dosageLevel': '0',
            });
        }
        if (parseInt(event) > 9.9) {
            form.patchValue({
                'dosageLevel': '10',
            });
        }
    }

    addNewSynapticDetails(data) {
        let form = this.fb.group({
            'treatmentDay': [(data && data.treatmentDay) ? data.treatmentDay : ''],
            'area': [(data && data.area) ? data.area : ''],
            'treatmentTime': [(data && data.treatmentTime) ? data.treatmentTime : ''],
            'bias': [(data && data.bias) ? data.bias : ''],
            'dosageLevel': [(data && data.dosageLevel) ? data.dosageLevel : ''],
            'designedElectrodes': [(data && data.designedElectrodes) ? data.designedElectrodes : ''],
        });

        let s = <FormArray>this.form.get('synapticDetails');
        s.push(form);
    }

    addNewPainScaleScore(data) {
        let form = this.fb.group({
            'treatmentDay': [(data && data.treatmentDay) ? data.treatmentDay : ''],
            'beforeTreatment': [(data && data.beforeTreatment) ? data.beforeTreatment : ''],
            'afterTreatment': [(data && data.afterTreatment) ? data.afterTreatment : ''],
        });
        let s = <FormArray>this.form.get('painScaleScore');
        s.push(form);
    }

    deleteSynapticDetails(id) {
        let s = <FormArray>this.form.get('synapticDetails');
        s.removeAt(id);
    }

    deletePainScaleScore(id) {
        let s = <FormArray>this.form.get('painScaleScore');
        s.removeAt(id);
    }

    trackByFn(index: any, item: any) {
        return index;
    }

    resetTreatmentPlan() {
        this.form.patchValue({
            'treatmentNoOfTimes': (this.data && this.data['treatmentNoOfTimes']) ? this.data['treatmentNoOfTimes'] : '',
            'treatmentIntervalName': (this.data && this.data['treatmentIntervalName']) ? this.data['treatmentIntervalName'] : '',
            'treatmentInterval': (this.data && this.data['treatmentInterval']) ? this.data['treatmentInterval'] : '',
            'treatmentPeriodName': (this.data && this.data['treatmentPeriodName']) ? this.data['treatmentPeriodName'] : '',
        });
    }

    getCurrentDate() {
        return getCurrentDate();
    }

    ngOnDestroy() {
        let data = this.form.getRawValue();
        data.synapticDetails = data.synapticDetails.map(function (data) {
            return new SynapticDetails(data);
        });
        data.painScaleScore = data.painScaleScore.map(function (data) {
            return new PainScaleScore(data);
        });
        let session: MedicalSession = new MedicalSession({
            synaptic: new Synaptic(data),
            isComplete: this.isComplete
        });
        this.mdService.saveBioelectronic(session);
    }


    next = () => {
        // this.ngOnDestroy();
        this.nextPage.emit();
    }
    back = () => {
        this.previousPage.emit();
    }
    complete = () => {
        this.isComplete = true;
        this.completeVisit.emit();
    }
}
