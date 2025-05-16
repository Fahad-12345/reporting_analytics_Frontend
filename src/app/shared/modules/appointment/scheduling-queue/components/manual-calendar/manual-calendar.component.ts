import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-manual-calendar',
  templateUrl: './manual-calendar.component.html',
  styleUrls: ['./manual-calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManualCalendarComponent implements OnInit {

  constructor() { }
  ngOnInit() { }
}
