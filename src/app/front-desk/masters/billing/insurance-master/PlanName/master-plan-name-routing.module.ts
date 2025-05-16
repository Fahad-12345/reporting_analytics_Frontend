import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PlannameComponent } from './planname/planname.component';

const routes: Routes = [
	{
		path: '',
		component: PlannameComponent,
	},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MasterPlanNameRoutingModule { }
