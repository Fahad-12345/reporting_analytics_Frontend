import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HomeComponent } from '../home/home.component';

@Component({
  selector: 'front-desk-calendar-header',
  templateUrl: 'calendar-header.component.html',
  styleUrls: ['calendar-header.component.scss']
})
export class FrontDeskCalendarHeaderComponent {
  @Input()
  view: string;

  @Input()
  swaps: string; 

  @Input()
  viewDate: Date;

  @Output()
  changeDatePickerMonthNext: EventEmitter<any> = new EventEmitter();

  @Output()
  swap: EventEmitter<any> = new EventEmitter();

  @Output()
  changeDatePickerMonthPrev: EventEmitter<any> = new EventEmitter();

  @Input()
  locale: string = 'en';

  @Output()
  viewChange: EventEmitter<string> = new EventEmitter();

  @Output()
  viewDateChange: EventEmitter<Date> = new EventEmitter();

  constructor(
    public _service: HomeComponent
  ) {

  }

  sendDataNext(date) {
    this.changeDatePickerMonthNext.emit(date)
  }

  sendDataPrev(date) {
    this.changeDatePickerMonthPrev.emit(date)
  }

  public viewChangeFun(text){
    this.viewChange.emit(text)
  }

}
