import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'objToArray'})
export class ObjToArrayPipe implements PipeTransform {
    transform(value: any): Object[] {
        let keyArr: any[] = Object.keys(value),
            dataArr = [];

        keyArr.forEach((key: any) => {
            dataArr.push(value[key])
        });        
        return dataArr;
    }
}