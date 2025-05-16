import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ssnFormatPipe'
})
export class SsnFormatPipePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (value == 'N/A' || !value) {
			return value;
		}
    
    return this.ssnFormat('' + value);
  }
  ssnFormat = (id) => {

    if (id == null || id == "null" || id == 'undefined') {
      return ""
    }
    if (id == 'NA') {
      return id;
    }
    if (id.length != 9) {
		if(id.length<11)
		{
			id=this.pad(id,9)
			
		  return id
		}
		else
		{
			return id
		}
		
    }
    id = id.substring(0, 3) + '-' + id.substring(3, 5) + '-' + id.substring(5);
    return id
  }

  pad(num:number, size:number): string {
    let id = num+"";
    while (id.length < size) id = "0" + id;
	id = id.substring(0, 3) + '-' + id.substring(3, 5) + '-' + id.substring(5);
    return id;
}
}
