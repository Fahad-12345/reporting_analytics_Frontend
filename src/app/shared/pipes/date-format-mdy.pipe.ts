import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormatMDY'
})
export class DateFormatMDYPipe implements PipeTransform {

  transform(value: any): any {
    return (value && value != "N/A") ? value.split('T')[0] : 'N/A'
  }

}
