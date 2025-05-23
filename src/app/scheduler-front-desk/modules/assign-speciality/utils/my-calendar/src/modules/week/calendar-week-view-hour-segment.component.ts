import { Component, Input, TemplateRef, OnInit } from '@angular/core';
import { WeekViewHourColumn } from 'calendar-utils';

@Component({
  selector: 'mwl-calendar-week-view-hour-segment',
  template: `
    <ng-template
      #defaultTemplate
      let-segment="segment"
      let-locale="locale"
      let-segmentHeight="segmentHeight"
      let-isTimeLabel="isTimeLabel">

      <div
        class="cal-hour-segment"
        [style.height.px]="segmentHeight"
        [class.cal-hour-start]="segment.isStart"
        [class.cal-after-hour-start]="!segment.isStart"
        [ngClass]="segment.cssClass" >
        <div class="cal-time" *ngIf="isTimeLabel">
          {{ segment.date | calendarDate:'weekViewHour':locale }}
        </div>
      </div>
    </ng-template>
    <ng-template
      [ngTemplateOutlet]="customTemplate || defaultTemplate"
      [ngTemplateOutletContext]="{
        segment: segment,
        locale: locale,
        segmentHeight: segmentHeight,
        isTimeLabel: isTimeLabel
      }">
    </ng-template>
  `,
	styleUrls: ['./calendar-week-view.scss']
})
export class CalendarWeekViewHourSegmentComponent {

  @Input() specs: any;

  @Input()
  segment: WeekViewHourColumn;

  @Input()
  segmentHeight: number;

  @Input()
  locale: string;

  @Input()
  isTimeLabel: boolean;

  @Input()
  customTemplate: TemplateRef<any>;

  ngOnInit(){
  }
}
