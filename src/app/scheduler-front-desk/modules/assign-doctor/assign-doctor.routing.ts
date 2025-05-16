import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AssignDoctorComponent } from './assign-doctor.component';


export const routes: Routes = [
  {
    path: '',
    component: AssignDoctorComponent,

  },

];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class SchedulerAssignDoctorRouteModule {}

