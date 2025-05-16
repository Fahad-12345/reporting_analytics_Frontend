import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { MDService } from '@appDir/medical-doctor/services/md/medical-doctor.service';
import { getCurrentDate } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { HBOT, TimeReport, MedicalSession } from '@appDir/medical-doctor/models/common/commonModels';

const TIMESETS = ['0.5','1','1.5','2','2.5','3','3.5','4','4.4'];
@Component({
  selector: 'app-shared-hbot-notes',
  templateUrl: './shared-hbot-notes.component.html',
  styleUrls: ['./shared-hbot-notes.component.scss']
})
export class SharedHbotNotesComponent implements OnInit {

  @Input() patient;
  @Input() data;
  @Input() user;
  @Output() nextPage = new EventEmitter();
  @Output() previousPage = new EventEmitter();
  @Output() completeVisit = new EventEmitter();
  form:FormGroup;
  constructor(private fb:FormBuilder, private MDService:MDService) { }
  getCurrentDate(){
     return getCurrentDate();
  }

  trackByFn(index: any, item: any) {
    return index;
 }
  addNewTimeReports(data){
    let form = this.fb.group({
      'timeSet':[(data && data.timeSet)?data.timeSet:""], 
      'timeStarted':[(data && data.timeStarted)?data.timeStarted:""], 
      'timeEnd':[(data && data.timeEnd)?data.timeEnd:""], 
    });
    let s = <FormArray>this.form.get('timeReports');
    s.push(form);
  }

  ngOnInit() {
  }
  ngOnChanges(){
    
    this.form = this.fb.group({
      treatmentNo:['treatmentNo'],
      
      psi:[(this.data)?this.data.psi:""],
      ata:[(this.data)?this.data.ata:""],
      mask:[(this.data)?this.data.mask:""],
      earPlanes:[(this.data)?this.data.earPlanes:""],
      timeStarted:[(this.data)?this.data.timeStarted:""],
      psiEarsPressurized:[(this.data)?this.data.psiEarsPressurized:""],
      timeToMaxPsi:[(this.data)?this.data.timeToMaxPsi:""],
      timeStartedDown:[(this.data)?this.data.timeStartedDown:""],
      timeSpentAtMax:[(this.data)?this.data.timeSpentAtMax:""],
      timeToZero:[(this.data)?this.data.timeToZero:""],
      totalTimeInChamber:[(this.data)?this.data.totalTimeInChamber:""],
      timeReports:this.fb.array([]),
      doctorReviewed:[(this.data)?this.data.doctorReviewed:""],
      technician:[(this.data)?this.data.technician:""],
      comment:[(this.data)?this.data.comment:""],
     
    });
    for(let x in TIMESETS){
      let data;
      var found = false;
      if(this.data && this.data.timeReports){
        for(let y in this.data.timeReports){
          if(this.data.timeReports[y].timeSet==TIMESETS[x]){
            found=true;
            data = {
              timeSet:TIMESETS[x],
              timeStarted:this.data.timeReports[y].timeStarted,
              timeEnd:this.data.timeReports[y].timeEnd
            };
          }
        }
      }
      if(!found){
        data = {
          timeSet:TIMESETS[x]
        };
      }
      this.addNewTimeReports(data);
    }
  
  }
  ngOnDestroy(){
    let data = this.form.getRawValue();
    let timeReports = data.timeReports.map(function(data){
      return new TimeReport(data);
    });
    data.timeReports = timeReports;

     let session:MedicalSession = new MedicalSession({
      hbotNotes:new HBOT(data)
     });
     this.MDService.saveHbot(session);
  }
 
  next=()=>{
     // this.ngOnDestroy();
     this.nextPage.emit();
   }
   back(){
     this.previousPage.emit();
   }
   complete(){
     this.completeVisit.emit();
   }
}
