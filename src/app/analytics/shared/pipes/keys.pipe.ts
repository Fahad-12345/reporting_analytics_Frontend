import { PipeTransform, Pipe } from '@angular/core';

@Pipe({name: 'keys'})
export class KeysPipe implements PipeTransform {
  transform(value, args:string[]) : any {
    let keys = [];
    for (let key in value) {
        if(key != 'id' && key != 'color'){
            keys.push(key);
        }
     
    }
    return keys;
  }
}