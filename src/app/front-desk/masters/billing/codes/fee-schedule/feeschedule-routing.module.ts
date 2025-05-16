import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FeeScheduleComponentComponent } from './fee-schedule-component/fee-schedule-component.component';

const routes: Routes = [
	{path:'',component:FeeScheduleComponentComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FeescheduleRoutingModule { }
