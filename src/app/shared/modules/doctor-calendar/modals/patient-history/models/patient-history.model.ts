export class PatienHistoryResponse
{
	total:number=0;
	data:any[]=[];
}

export class PatienHistoryCount
{
	cancelledAppointments:number=0;
	completedAppointments:number=0;
	noShowAppointments:number=0;
	todayAppointments:number=0;
}

export enum AppointmentTypeEnum
{
	cancel ='cancel',
	no_show ='no_show',
	completed ='completed',
	today  ='today ',


}
