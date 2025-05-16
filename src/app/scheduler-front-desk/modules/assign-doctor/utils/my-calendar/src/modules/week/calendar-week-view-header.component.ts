import {
  Component,
  Input,
  Output,
  EventEmitter,
  TemplateRef
} from '@angular/core';
import { CalendarEvent, WeekDay } from 'calendar-utils';
import { trackByWeekDayHeaderDate } from '../common/util';

@Component({
  selector: 'mwl-calendar-week-view-header',
  templateUrl: 'calendar-week-view-header.component.html',
  styleUrls: ['./calendar-week-view.scss']
})
export class CalendarWeekViewHeaderComponent {
  @Input()
  days: WeekDay[];

  @Input() clinicIndex: any;

  @Input()
  locale: string;

  @Input()
  customTemplate: TemplateRef<any>;

  @Output()
  dayHeaderClicked: EventEmitter<{ day: WeekDay }> = new EventEmitter<{
    day: WeekDay;
  }>();

  @Output()
  eventDropped: EventEmitter<{
    event: CalendarEvent;
    newStart: Date;
  }> = new EventEmitter<{ event: CalendarEvent; newStart: Date }>();

  trackByWeekDayHeaderDate = trackByWeekDayHeaderDate;
  ngOnInit(){
  }
}
