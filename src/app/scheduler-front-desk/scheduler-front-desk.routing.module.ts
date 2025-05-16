import { NgModule } from '@angular/core';
import {
	RouterModule,
	Routes,
} from '@angular/router';

import { USERPERMISSIONS } from '../../app/front-desk/UserPermissions';
import { SharedAppointmentComponent } from './components/shared-appointment/shared-appointment.component';

import {
	SharedDoctorCalendarComponent,
} from './components/shared-doctor-calendar/shared-doctor-calendar.component';
import { SubNavComponent } from './components/sub-nav/sub-nav.component';
// //components
import { SchedulerFrontDeskComponent } from './scheduler-front-desk.component';

const routes: Routes = [
	{
		path: '',
		component: SchedulerFrontDeskComponent,
		data: {
			title: 'Scheduler Front Desk',
			link: {},
		},
	 	children: [
			{
				path: 'doctor-calendar',
				component: SharedDoctorCalendarComponent,
				data: {
					title: 'Calendar',
					permission: USERPERMISSIONS.doctor_calendar,
				},
			},

			{
				path: 'waiting-list',
				loadChildren:()=>import('app/scheduler-front-desk/modules/waiting-list/waiting-list.module').then(m => m.WaitingListModule),
				data: {
					title: 'Waiting List',
					permission: USERPERMISSIONS.waiting_list_menu,
				},
			},
			{
				path: 'schedule-list',
				loadChildren:()=>import('app/scheduler-front-desk/modules/add-to-be-scheduled/add-to-be-scheduled-list.module').then(m => m.AddtobescheduledListModule),
				data: {
					title: 'Schedule List',
					permission: USERPERMISSIONS.scheduler_list_menu,
				},
			},
			{
				path: 'waiting-list-doc',
				loadChildren:()=>import('app/scheduler-front-desk/modules/waiting-list-doc/waiting-list.module').then(m => m.WaitingListDocModule),
				data: {
					title: 'Waiting List Doctor',
					permission: USERPERMISSIONS.waiting_list_doctor_menu,
				},
			},
		
			{
				path: 'customize',
				loadChildren:()=>import('app/scheduler-front-desk/modules/scheduler-customize/scheduler-customize.module').then(m => m.SchedulerCustomizeModule),
				data: {
					title: 'Customize',
					permission: USERPERMISSIONS.scheduler_customize_menu,
				},
			},

			{
				path: 'appointments',
				component: SharedAppointmentComponent,
				data: {
					title: 'Appointment List',
					permission: USERPERMISSIONS.appointment_list_menu,
				},
			},
			{
				path: 'assignment',
				component: SubNavComponent,
				data: {
					title: 'Assignment',
					permission: USERPERMISSIONS.assignment_menu,
				},
			},
			{
				path: 'cancel-app',
				loadChildren:()=>import('app/scheduler-front-desk/modules/cancel-appointment-list/cancel-appointment-list.module').then(m => m.CancelAppointmentListModule),

				data: {
					title: 'Cancelled Appointments',
					permission: USERPERMISSIONS.cancelled_appointment_menu,
				},
			},
			{
				path: 'speciality',
				loadChildren:()=>import('app/scheduler-front-desk/modules/assign-speciality/assign-speciality.module').then(m => m.AssignSpecialityModule),
			},

			{
				path: 'doctor',
				loadChildren:()=>import('app/scheduler-front-desk/modules/assign-doctor/assign-doctor.module').then(m => m.AssignDoctorModule),

			},
			{
				path: 'notifications_sup',
				loadChildren:()=>import('app/scheduler-front-desk/modules/supervisor-notifications/supervisor-notifications.module').then(m => m.SupervisorNotificationsModule),
			},

			{
				path: 'assign-rooms',
				loadChildren:()=>import('app/scheduler-front-desk/modules/assign-rooms/assign-rooms.module').then(m => m.AssignRoomsModule),
				data: {
					title: 'Rooms',
					permission: USERPERMISSIONS.room_menu,
				},
			},
	 	],
	 },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class SchedulerFrontDeskRoutingModule {}
