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
import {AssignRoomsService} from '../../../../../assign-rooms.service';


//modal
import {DeleteRoomAssignModalComponent1} from '../../../../../modals/delete-room-assign-modal/delete-room-assign-modal.component'
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
        [style.backgroundColor]="weekEvent.event.color"
        [style.borderColor]="'#00000'"
        [mwlCalendarTooltip]="!tooltipDisabled ? (weekEvent.event.patientName | calendarEventTitle:'weekTooltip':weekEvent.event) : ''"
        [tooltipPlacement]="tooltipPlacement"
        [tooltipEvent]="weekEvent.event"
        [tooltipTemplate]="tooltipTemplate"
        [tooltipAppendToBody]="tooltipAppendToBody"
        [ngbPopover]="popTemplate"
        data-container="body"

        placement="top"
        >
        {{weekEvent.event.title}}
        <mwl-calendar-event-actions
          [event]="weekEvent.event"
          [customTemplate]="eventActionsTemplate">
        </mwl-calendar-event-actions>
      </div>
      
    </ng-template>
    <ng-template #popTemplate>
      <div class="popover-top" >
        <div  [ngStyle]="swaps==='false' ?
          {'background-color': 'lightblue'} : {'background-color': weekEvent.event.color}" style=" width: 100%; height: 58px;">
          <div class="row" style=" padding-top: 5px;">
            <div *ngIf="swaps==='true'" class="col-md-8" style="color: #fff; padding-left: 20px;">
              {{docName }}
            </div>
            <div *ngIf="swaps==='false'" class="col-md-8" style="color: #fff; padding-left: 20px;">
              {{weekEvent.event.title }}
            </div>

            <div class="close-btn col-md-4">
              <a (click)="EventClicked(weekEvent.event)"><i style="color: white;" class="fa fa-trash"></i></a>
              <a><i style="color: white; margin-left:20px;" class="fa fa-times"></i></a>
            </div>
          </div>
          <div class="row popover-top-text">
            <div class="col-md-9" style="padding-left: 0px">
              <h6 style="color: black;margin-left: 20px;">
                {{weekEvent.event.start.toString().substring(16,21)}} - {{weekEvent.event.end.toString().substring(16,21)}}
              </h6>

            </div>
            <div class="col-md-3" >
              <div class="circle-pen" style="width: 30px !important; height: 30px !important;border-radius: 50% !important;
    cursor: pointer !important;text-shadow: 0 0 3px black !important;border: 1px solid #fff !important;    margin-top: 15px !important;" [ngStyle]="swaps==='false' ?
          {'background-color': 'lightblue'} : {'background-color': weekEvent.event.color}" (click)="updateAssignmentModal(weekEvent.event)">
                <i class="fa fa-pen" style="color: white; margin-left: 8px; margin-top: 8px;"></i>
              </div>
            </div>
          </div>
        </div>
        <div>
          {{weekEvent.event.room.name}}
        </div>
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

     
    
  `
})
export class CalendarWeekViewEventComponent {
  @Output() startEvaluation=new EventEmitter()
  @Input()
  docName: any;
  @Input() swaps:any;

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
    public updateAssignmentService: NgbModal,
    public appointmentModal: NgbModal,
    public AssignRoomsService:AssignRoomsService
  ) {

  }


  EventClicked(event){
    this.AssignRoomsService.requirementForDeleteModal=event
    const activeModal = this.appointmentModal.open(DeleteRoomAssignModalComponent1, { size: 'lg', backdrop: 'static',
    keyboard: false });
  }
  updateAssignmentModal(event){}

}
