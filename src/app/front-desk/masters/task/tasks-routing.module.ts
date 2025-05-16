import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TaskPriorityComponent } from './task-priority/task-priority.component';

const routes: Routes = [
  {
    path: '',
    children: [{
      path: 'task-priority/list',
      component: TaskPriorityComponent
    }]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TasksRoutingModule {
}
