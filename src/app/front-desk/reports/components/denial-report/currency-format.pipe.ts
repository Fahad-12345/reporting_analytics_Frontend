import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyFormat'
})
export class CurrencyFormatPipe implements PipeTransform {
  transform(value: number | string, currencyCode: string = 'USD'): string {
    // Convert value to number if it's a string
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    // Format the number as currency without rounding
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2, // Set to 2 to avoid rounding
    }).format(numericValue);
  }
}
