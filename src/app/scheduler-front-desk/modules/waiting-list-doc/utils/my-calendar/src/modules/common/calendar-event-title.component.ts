import { Component, Input, TemplateRef } from '@angular/core';
import { CalendarEvent } from 'calendar-utils';

@Component({
  selector: 'mwl-calendar-event-title',
  template: `
    <ng-template
      #defaultTemplate
      let-event="event"
      let-view="view">
      <span
        class="cal-event-title" 
        [ngbPopover]="titleContent"
        [popoverTitle]="titleDescription" placement="top">
        {{event.startTime}} - {{event.endTime}}
      </span>
    </ng-template>
    <ng-template  #titleContent>
            <div class="popover-top">
              <div style="background-color: purple; width: 100%; height: 58px;">
                <div class="row" style="margin-left: 90%; padding-top: 5px;">
                  <div class="close-btn" style="width: 18px;">
                    <i (click)="titleContent.close()" style="color: white; margin-left:3px;" class="fa fa-times"></i>
                  </div>
                </div>
                <div class="row popover-top-text">
                  <div class="col-md-9" style="padding-left: 0px">
                    <h6>{{event.startTime}} - {{event.endTime}}</h6>
                    
                  </div>
                  <div class="col-md-3">
                    <div class="circle-pen" [style.background-color]="colorApp">
                      <i class="fa fa-pen" style="color: white; margin-left: 8px; margin-top: 8px;"></i>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h6 style="font-size:13px;">Available Doctors</h6>
                <p *ngFor="let doc of event.DocName; let i=index" style="font-size: 11px; float: left;">
                  {{doc}}<span *ngIf="i != (event.DocName.length - 1)">, &nbsp;</span>
                </p>
              </div>
            </div>
    </ng-template>
    <ng-template
      [ngTemplateOutlet]="customTemplate || defaultTemplate"
      [ngTemplateOutletContext]="{
        event: event,
        view: view
      }">
    </ng-template>
  `
})
export class CalendarEventTitleComponent {
  @Input()
  event: CalendarEvent;

  @Input()
  customTemplate: TemplateRef<any>;

  @Input()
  view: string;
}
