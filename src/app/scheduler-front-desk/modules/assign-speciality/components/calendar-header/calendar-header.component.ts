import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HomeComponent } from '../home/home.component';

@Component({
  selector: 'assign-speciality-calendar-header',
  templateUrl: 'calendar-header.component.html',
  styleUrls: ['calendar-header.component.scss']
})
export class AssignSpecialityCalendarHeaderComponent {
  @Input()
  view: string;

  @Input()
  viewDate: Date;

  @Input() isSwapped:any;

  @Output()
  changeDatePickerMonthNext: EventEmitter<any> = new EventEmitter();


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

  swap(event) {
    this._service.shift(event.target.value);
  }
  public viewChangeFun(text){
    this.viewChange.emit(text)
  }
}
