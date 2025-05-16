import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeFormat',
  pure:true
})
export class TimeFormatPipe implements PipeTransform {
  transform(value: string): string {
    const [hours, minutes, seconds] = value.split(':').map(Number);

    const period = hours >= 12 ? 'PM' : 'AM';

    const displayHours = hours % 12 || 12;

    return `${displayHours}:${minutes < 10 ? '0' : ''}${minutes} ${period}`;
  }
}
