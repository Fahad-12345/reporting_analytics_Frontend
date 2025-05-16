import { DoctorCalendarEnum } from './../modules/doctor-calendar/doctor-calendar-transportation-enum';
import { Pipe, PipeTransform, OnDestroy } from "@angular/core";
@Pipe({
    name: 'tranportationPipe',
    pure: true
})
export class tranportationPipe implements PipeTransform, OnDestroy {
   
	text :string;
    transform(data: string, type?) {

         this.transformTransportationData(data,type);
		 console.log(this.text);
		 return this.text;
    }
    ngOnDestroy(): void {
    }
	
	transformTransportationData(type,types){
		debugger;

		switch(type) {
			case DoctorCalendarEnum.from_home :{
				 this.text = types=='Pick Up'?'Home':'Home';
				 break;
			 }
			 case DoctorCalendarEnum.from_medical_office : {
				this.text = types=='Pick Up'?'Medical Office':'Medical Office';
				 break;
			 }
			 case DoctorCalendarEnum.no_drop_off: {
				this.text = 'No Drop-off Required';
				 break;
			 }
			 case  DoctorCalendarEnum.no_pick_up:{
				this.text = 'No Pick-Up required';
				 break;
			 }
			 case  DoctorCalendarEnum.other:{
				this.text = 'Other';
				break;
			}
		}
	}
}
