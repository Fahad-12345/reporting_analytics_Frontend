import { Pipe, PipeTransform } from '@angular/core';
 @Pipe({
     // tslint:disable-next-line:pipe-naming
     name: 'toNumber',
     pure: true }) export class ToNumberPipe implements PipeTransform { 
     public transform(items: any): any {
         if (!items) {
             return 0;
         }
         return parseInt(items, 10);
     } }