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
// import { DoctorService } from '../../../../../../../doctor.service';
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
        *ngIf="weekEvent.event.docId===currentDocId && weekEvent.event.isAppointment"

        [style.backgroundColor]="weekEvent.event.status ? 'white' : '#'+weekEvent.event.color"
        [style.borderColor]=" '#'+weekEvent.event.color"
        [mwlCalendarTooltip]="!tooltipDisabled ? (weekEvent.event.patientName | calendarEventTitle:'weekTooltip':weekEvent.event) : ''"
        [tooltipPlacement]="tooltipPlacement"
        [tooltipEvent]="weekEvent.event"
        [tooltipTemplate]="tooltipTemplate"
        [tooltipAppendToBody]="tooltipAppendToBody"
        [ngbPopover]="openPatientUnavailable"
        placement="top"
        data-container="body"
        (click)="showPatient(weekEvent.event)">
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
        *ngIf="weekEvent.event.docId===currentDocId && !weekEvent.event.isAppointment"

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
         <div class="popover-top custom-popover-style">
			<div class="popover-header" [style.background-color]="'#' + weekEvent.event.color">
				<span> <img style="height: 50px;width:50px;margin-top: 2px; border-radius: 50%;" [src]="weekEvent.event.picture"></span>
				<a class="float-right" href="javascript:void(0)"><i class="fa fa-times"></i></a>
			</div>
			<div class="popover-desc">
				<ul class="list-unstyled mb-0">
					<li>{{weekEvent.event.startTime}} - {{weekEvent.event.endTime}}</li>
					<li> {{weekEvent.event.patientName }}</li>
          <li><span class="font-bold">Title:</span> {{weekEvent.event.appointmentTitle}}</li>
          <li><span class="font-bold">Chart No:</span> {{weekEvent.event.chartNo}}</li>
          <li><span class="font-bold"> Clinic:</span> {{weekEvent.event.clinicName}}</li>
				</ul>
			</div>
		</div>

      </ng-template>
    
  `
})
export class CalendarWeekViewEventComponent {
  @Output() startEvaluation = new EventEmitter()
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
    // console.log(this.weekEvent)
  }

  constructor(public deleteModal: NgbModal,
    // public doctorService: DoctorService,
    public weekService: CalendarWeekService,
    public updateAssignmentService: NgbModal
  ) {

  }

}
