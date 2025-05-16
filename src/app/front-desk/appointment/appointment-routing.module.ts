import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppointmentComponent } from './appointment.component';

const routes: Routes = [{
  path: '',
  children: [
    {
      path: '',
      component: AppointmentComponent,
      data: {
        title: 'Appointment'
      }
    },
    
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppointmentRoutingModule { }
