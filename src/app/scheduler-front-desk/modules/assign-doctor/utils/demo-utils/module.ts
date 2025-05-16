import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from '../my-calendar/src/index';

@NgModule({
  imports: [CommonModule, FormsModule, CalendarModule],
  declarations: [],
  exports: []
})
export class DemoUtilsModule {}
