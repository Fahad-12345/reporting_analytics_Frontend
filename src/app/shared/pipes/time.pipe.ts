import { Pipe, PipeTransform, OnDestroy } from "@angular/core";
@Pipe({
    name: 'timeStringPipe',
    pure: true
})
export class timeStringPipe implements PipeTransform {
   
    transform(data: string) {
		if (data){
			let timeString:string[] =[] = data.split(':');
			if (timeString && timeString.length==3){
			let mode:string[]=timeString[2].split(' ');
			if (mode.length==2){
			return `${timeString[0]}:${timeString[1]} ${mode[1]}`; 
			}
			else {
				return data;
			} 
		 }
		 else {
			 return data;
		 }
		}
    }	
}
