import {
  Component,
  Input,
  Output,
  EventEmitter,
  TemplateRef,
  OnInit
} from '@angular/core';
import { WeekViewAllDayEvent, DayViewEvent } from 'calendar-utils';
import { PlacementArray } from 'positioning';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DoctorService } from '../../../../../../../doctor.service';
import { CalendarWeekService } from './calendar-week.service';

@Component({
  selector: 'mwl-calendar-week-view-event',
  template: ` 
    <ng-template
      #defaultTemplate
      let-weekEvent="weekEvent"
      let-tooltipPlacement="tooltipPlacement"
      let-eventClicked="eventClicked"
      let-tooltipTemplate="tooltipTemplate"
      let-tooltipAppendToBody="tooltipAppendToBody"
      let-tooltipDisabled="tooltipDisabled">
      <div
        class="cal-event"
        style="backgroundColor: white"
        [style.backgroundColor]="weekEvent.event.status ? 'white' : '#'+weekEvent.event.color"
        [style.borderColor]=" '#'+weekEvent.event.color"
        [mwlCalendarTooltip]="!tooltipDisabled ? (weekEvent.event.patientName | calendarEventTitle:'weekTooltip':weekEvent.event) : ''"
        [tooltipPlacement]="tooltipPlacement"
        [tooltipEvent]="weekEvent.event"
        [tooltipTemplate]="tooltipTemplate"
        [tooltipAppendToBody]="tooltipAppendToBody"
        [ngbPopover]="openPatientUnavailable"
        placement="top"
        *ngIf="weekEvent.event.isAppointment"
        (click)="showPatient(weekEvent.event)"
        data-container="body"
        >
        <mwl-calendar-event-actions
          [event]="weekEvent.event"
          [customTemplate]="eventActionsTemplate">
        </mwl-calendar-event-actions>
      </div>
      <div 
        class="cal-event"
        style="backgroundColor: white"
        [style.backgroundColor]="weekEvent.event.status ? 'white' : '#'+weekEvent.event.color"
        [style.borderColor]=" '#'+weekEvent.event.color"
        [mwlCalendarTooltip]="!tooltipDisabled ? (weekEvent.event.patientName | calendarEventTitle:'weekTooltip':weekEvent.event) : ''"
        [tooltipPlacement]="tooltipPlacement"
        [tooltipEvent]="weekEvent.event"
        [tooltipTemplate]="tooltipTemplate"
        [tooltipAppendToBody]="tooltipAppendToBody"
        *ngIf="!weekEvent.event.isAppointment"
        >
        <mwl-calendar-event-actions
          [event]="weekEvent.event"
          [customTemplate]="eventActionsTemplate">
        </mwl-calendar-event-actions>
      </div>
    </ng-template>
    <ng-template
      [ngTemplateOutlet]="customTemplate || defaultTemplate"
      [ngTemplateOutletContext]="{
        weekEvent: weekEvent,
        tooltipPlacement: tooltipPlacement,
        eventClicked: eventClicked,
        tooltipTemplate: tooltipTemplate,
        tooltipAppendToBody: tooltipAppendToBody,
        tooltipDisabled: tooltipDisabled
      }">
    </ng-template>

      <ng-template #openPatientUnavailable>
        <div class="popover-top">
          <div class="row" [style.background-color]="'#' + weekEvent.event.color" style="margin-left: 0; width: 100%; height: 58px;">
            <div class="col-md-4">
              <img style="height: 50px;width:50px;margin-top: 2px; border-radius: 50%;" [src]="weekEvent.event.picture">

            </div>
            <div class="col-md-6" style="padding: 0;">
              <span>
                {{weekEvent.event.startTime}} - {{weekEvent.event.endTime}}
              </span><br>
              <span>
                {{weekEvent.event.patientName }}
              </span><br>
            </div>
            <div class="close-btn col-md-2">
              <a><i style="color: white;" class="fa fa-times"></i></a>
            </div>
          </div>
          <div class="row" style="    margin-left: 15px;width: 100%;">
            <div class="col-md-8 ">
              <div class="row">Title: {{weekEvent.event.appointmentTitle}}</div>
            </div>
            
          </div>
          <div class="row" style="    margin-left: 15px;width: 100%;">
            <div class="col-md-8 ">
              <div class="row">Appointment Type: {{weekEvent.event.chartNo}}</div>
            </div>
            
          </div>
          <div class="row" style="    margin-left: 15px;width: 100%; height: 58px;">
            <div class="col-md-8 ">
              <div class="row">Chart No.: {{weekEvent.event.chartNo}}</div>
            </div>
            <button [disabled]="weekEvent.event.status" class="col-md-2 btn btn-success" style="max-height: 31px;padding: 0rem 0.04rem;text-transform: none"
              (click)="startEval()">
              Start</button>
          </div>
        </div>
      </ng-template>
    
  `
})
export class CalendarWeekViewEventComponent {
  @Output() startEvaluation=new EventEmitter()
  @Input()
  currentDocId: any;


  @Input()
  weekEvent: WeekViewAllDayEvent | DayViewEvent;

  @Input()
  tooltipPlacement: PlacementArray;

  @Input()
  tooltipAppendToBody: boolean;

  @Input()
  tooltipDisabled: boolean;

  @Input()
  customTemplate: TemplateRef<any>;

  @Input()
  eventTitleTemplate: TemplateRef<any>;

  @Input()
  eventActionsTemplate: TemplateRef<any>;

  @Input()
  tooltipTemplate: TemplateRef<any>;

  @Output()
  eventClicked: EventEmitter<any> = new EventEmitter();

  @Output()
  showPatientRecord: EventEmitter<any> = new EventEmitter();

  ngOnInit() {
  }

  constructor(public deleteModal: NgbModal,
    public doctorService: DoctorService,
    public weekService: CalendarWeekService,
    public updateAssignmentService: NgbModal
  ) {

  }


  public startEval(){
    this.startEvaluation.emit(this.weekEvent.event)
  }
  public showPatient(event){
    if(event.isAppointment){
      this.showPatientRecord.emit(event)
    }
  }

}
