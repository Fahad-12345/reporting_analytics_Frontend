import { Injectable } from '@angular/core';

@Injectable()

export class SchedulerSupervisorService {
	public currentDeleteAppointment: any;
	public id;
	public subject: any;
	public description: any;
	public clinicIdForAutoResolve: any;
	public selectedDoc: any = []
	public selectedClinic: any = [];
	public socket;
  	popover: any;
	constructor() {
	}
	ngOnInit() {
	}
}
