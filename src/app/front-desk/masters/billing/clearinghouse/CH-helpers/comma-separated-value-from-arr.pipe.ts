import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'commaSeparatedValueFromArr'
})
export class CommaSeparatedValueFromArrPipe implements PipeTransform {

  transform(value: [], key: string): unknown {
    let commaseparetedValues: any;
    if (value && value.length > 0 && key) {
      commaseparetedValues = value.map(obj => obj[key]);
      return commaseparetedValues.join(', ');
    }
    return null;
  }

}
