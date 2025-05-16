import { Component, Input, Output, TemplateRef, OnInit, EventEmitter } from '@angular/core';
import { WeekViewHourColumn } from 'calendar-utils';
import { CalendarWeekService } from './calendar-week.service';
import { DoctorService } from '../../../../../../../doctor.service';
import { NgbAccordion, NgbModal } from '@ng-bootstrap/ng-bootstrap';

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
        [ngClass]="segment.cssClass"    (click)="openAssignment(segment,isTimeLabel)" >
        <div class="cal-time" style="display: block !important" *ngIf="isTimeLabel">
          {{ segment.date | date :'HH'  }} : {{ segment.date | date :'mm'  }}
        </div>
        <div class="cal-time" style="display: block !important" *ngIf="!isTimeLabel">
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
  `
})
export class CalendarWeekViewHourSegmentComponent {
  @Input() doc: any;
  @Input() events: any;


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

  @Output() currentAssignments = new EventEmitter;
  ngOnInit() {
  }
  constructor(public weekService: CalendarWeekService,
    public doctorService: DoctorService,
    public addAssignmentService: NgbModal,
  ) {


  }
  openAssignment(segment,isTimeLabel){}

  public getCurrentAssignments(event){
    this.currentAssignments.emit("test")
  }

}
