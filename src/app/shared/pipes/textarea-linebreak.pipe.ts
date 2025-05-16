import { Pipe, PipeTransform } from '@angular/core';
@Pipe({name: 'textareaLineBreaks'})
export class textareaLineBreaks implements PipeTransform {
transform(value: string): string {
    if(value){
        return value.replace(/\n/g, '<br/>');
    }else{
        return null;
    }
   }
}