import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class ReplaceAccordianService {
	public conflictedProviderAssignment:any;
	public start_date:any;
	public end_date:any;
	public Practice_location:any;
	public speciality_name:any;
	public deleteSelectedAppointmentIds=[];
	

  constructor() {


  }
  ngOnInit() {
   
  }

}
