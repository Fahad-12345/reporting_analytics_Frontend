import { Component, Input, TemplateRef, OnInit } from '@angular/core';
import { WeekDay } from 'calendar-utils';
import { trackByWeekDayHeaderDate } from '../common/util';

@Component({
  selector: 'mwl-calendar-month-view-header',
  template: `
    <ng-template
      #defaultTemplate
      let-days="days"
      let-locale="locale">
      <div class="cal-cell-row cal-header">
        <div
          class="cal-cell" 
          [style.max-width]="allClinics.length == 1 ? '10.5%' : '12%'"  
          *ngIf="sideLength[0].id != 0 && clinicIndex == 0">
        </div> 
        <div
          class="cal-cell"
          *ngFor="let day of days; trackBy:trackByWeekDayHeaderDate"
          [class.cal-past]="day.isPast"
          [class.cal-today]="day.isToday"
          [class.cal-future]="day.isFuture"
          [class.cal-weekend]="day.isWeekend"
          [ngClass]="day.cssClass">
          {{ day.date.toString().substring(0,3) }}
        </div>
      </div>
    </ng-template>
    <ng-template
      [ngTemplateOutlet]="customTemplate || defaultTemplate"
      [ngTemplateOutletContext]="{days: days, locale: locale}">
    </ng-template>
  `,
  styleUrls: ['./calendar-month-view.scss']
})
export class CalendarMonthViewHeaderComponent {

  @Input() clinicIndex: any;
  @Input() allClinics: any;

  @Input()
  sideLength: any;

  @Input()
  days: WeekDay[];

  @Input()
  locale: string;

  @Input()
  customTemplate: TemplateRef<any>;

  trackByWeekDayHeaderDate = trackByWeekDayHeaderDate;
  ngOnInit() {
  }
}
