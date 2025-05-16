import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SchedulerComponent } from './scheduler.component';

const routes: Routes = [{
  path: '',
  children: [
    {
      path: '',
      component: SchedulerComponent,
      pathMatch: 'full',
      data: {
        title: 'Ovada-Scheduler'
      }
    },
    // {
    //   path: 
    // }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SchedulerRoutingModule { }
