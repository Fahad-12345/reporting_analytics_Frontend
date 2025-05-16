import { Pipe, PipeTransform } from '@angular/core';
// import { format, ParsedNumber } from 'libphonenumber-js';

@Pipe({
  name: 'phone'
})
export class PhonePipe implements PipeTransform {

  transform(val: string, args?: string): any {
   // 5677888888
   //567-788-8888
   if (val){
    if (val.length==10){
      var newstring='';
      var value:number=0;
      for (let i=0; i<3; i++){
        newstring=newstring+val.charAt(i);
        value=i;
      }
      newstring = newstring + "-";
      value++;
      for (let j=0; j<3;j++){
        newstring = newstring+val.charAt(value);
        value++;
      }
      newstring = newstring + "-";
      for (let k=0;k<4;k++){
        newstring = newstring + val.charAt(value);
        value++;
      }
      return newstring;
    }
  else {
   return val;
  }
}
}

}