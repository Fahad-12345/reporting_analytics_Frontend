import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdjusterInformationComponent } from './adjuster-information/adjuster-information.component';

const routes: Routes = [
	{
		path:'',
		component:AdjusterInformationComponent,
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MasterAdjusterRoutingModule { }
