import {
  Component,
  Input,
  Output,
  EventEmitter,
  TemplateRef
} from '@angular/core';
import { DayViewEvent } from 'calendar-utils';
import { PlacementArray } from 'positioning';

@Component({
  selector: 'mwl-calendar-day-view-event',
  template: `
    <ng-template
      #defaultTemplate
      let-dayEvent="dayEvent"
      let-tooltipPlacement="tooltipPlacement"
      let-eventClicked="eventClicked"
      let-tooltipTemplate="tooltipTemplate"
      let-tooltipAppendToBody="tooltipAppendToBody">
      <div
        class="cal-event"
        [style.backgroundColor]="'#'+dayEvent.event.color"
        [ngStyle]="dayEvent.event.start>=start && dayEvent.event.end<=end?
                 {'border-color': 'red'} :  {'border-color': 'lightgrey'}"

        [mwlCalendarTooltip]="dayEvent.event.title | calendarEventTitle:'dayTooltip':dayEvent.event"
        [tooltipPlacement]="tooltipPlacement"
        [tooltipEvent]="dayEvent.event"
        [tooltipTemplate]="tooltipTemplate"
        [tooltipAppendToBody]="tooltipAppendToBody"
        (mwlClick)="eventClicked.emit()">
        <mwl-calendar-event-actions
          [event]="dayEvent.event"
          [customTemplate]="eventActionsTemplate">
        </mwl-calendar-event-actions>
        &ngsp;
        <mwl-calendar-event-title
          [event]="dayEvent.event"
          [customTemplate]="eventTitleTemplate"
          view="day">
        </mwl-calendar-event-title>
      </div>
    </ng-template>
    <ng-template
      [ngTemplateOutlet]="customTemplate || defaultTemplate"
      [ngTemplateOutletContext]="{
        dayEvent: dayEvent,
        tooltipPlacement: tooltipPlacement,
        eventClicked: eventClicked,
        tooltipTemplate: tooltipTemplate,
        tooltipAppendToBody: tooltipAppendToBody
      }">
    </ng-template>
  `
})
export class CalendarDayViewEventComponent {
  @Input()
  start:any;

  @Input()
  end:any;
  @Input()
  dayEvent: DayViewEvent;

  @Input()
  tooltipPlacement: PlacementArray;

  @Input()
  tooltipAppendToBody: boolean;

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
}
