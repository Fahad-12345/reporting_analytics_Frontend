import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'wcbFormatPipe'
})
export class WcbFormatPipePipe implements PipeTransform {

  transform(value: any, args?: any): any {

    return value ? this.wcbFormat(value) : '';
  }

  wcbFormat(id) {
    if (id == null || id == "null" || id == 'undefined') {
      return ""
    }
    if (id == 'NA') {
      return id;
    }
    if (id.length != 7) {
      return id
    }
    id = id.substring(0, 1) + '-' + id.substring(1);

    console.log('id', id)
    return id
  }
}
