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
            <div class="popover-top custom-popover-style">
			<div class="popover-header" style="background-color: purple;">
				<span>{{clinicID.name }}</span>
				<span class="popover-icon d-inline-flex float-right">
					<a class="popover-icon-edit" href="javascript:void(0)" [style.background-color]="colorApp">
						<i class="icon-pencil"></i>
					</a>
				</span>
				<a class="float-right" href="javascript:void(0)" (click)="titleContent.close()"><i class="fa fa-times"></i></a>
			</div>
			<div class="popover-desc">
				<ul class="list-unstyled mb-0">
					<li>{{event.startTime}} - {{event.endTime}}</li>
          <li>
          Available Doctors
           </li>
           <li>
                <span *ngFor="let doc of event.DocName; let i=index" style="font-size: 11px; float: left;">
                  {{doc}}<span *ngIf="i != (event.DocName.length - 1)">, &nbsp;</span>
                </span>
              </li>
				</ul>
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
